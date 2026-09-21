  /* ==================================================== */
  /* 7. CAMERA QUÉT BARCODE / QR & QUÉT LIÊN TỤC (YÊU CẦU I & 11) */
  /* ==================================================== */

  let html5QrCodeScanner = null;
  let CURRENT_SCAN_CONTEXT = 'GLOBAL_SEARCH';
  let lastScannedCode = '';
  let lastScannedTimestamp = 0;
  let sessionScannedSerials = [];
  let barcodeBroadcastChannel = null;

  // Khởi tạo kênh giao tiếp 2 chiều độc lập (Vượt qua 100% rào cản iframe Google Apps Script)
  function initBarcodeSyncChannel() {
    // 1. Kênh Cross-Origin chuẩn quốc tế (Dành cho scanner.html mở trên GitHub Pages)
    window.removeEventListener('message', onWindowMessageBarcodeSync);
    window.addEventListener('message', onWindowMessageBarcodeSync);

    // 2. Kênh BroadcastChannel (Dành cho các tab cùng origin)
    if (typeof BroadcastChannel !== 'undefined' && !barcodeBroadcastChannel) {
      try {
        barcodeBroadcastChannel = new BroadcastChannel('THANH_AN_BARCODE_CHANNEL');
        barcodeBroadcastChannel.onmessage = function (e) {
          if (e.data && e.data.type === 'SCAN_BARCODE' && e.data.code) {
            handleDecodedBarcode(e.data.code);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel không khả dụng:', err);
      }
    }

    // 3. Dự phòng qua localStorage storage event
    window.removeEventListener('storage', onLocalStorageBarcodeSync);
    window.addEventListener('storage', onLocalStorageBarcodeSync);
  }

  function onWindowMessageBarcodeSync(e) {
    if (e.data && e.data.type === 'SCAN_BARCODE' && e.data.code) {
      handleDecodedBarcode(e.data.code);
    }
  }

  function onLocalStorageBarcodeSync(e) {
    if (e.key === 'THANH_AN_LAST_SCAN' && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload && payload.code && (Date.now() - payload.time) < 3000) {
          handleDecodedBarcode(payload.code);
        }
      } catch (err) {}
    }
  }

  // Khởi động kênh đồng bộ ngay khi nạp script
  initBarcodeSyncChannel();

  function openScannerModal(targetContext) {
    CURRENT_SCAN_CONTEXT = targetContext;
    sessionScannedSerials = [];
    document.getElementById('scanner-scanned-count').textContent = '0 mã';
    document.getElementById('scanner-scanned-list').innerHTML = '';
    
    // Cập nhật tiêu đề modal theo ngữ cảnh (Chuẩn hóa 1 icon duy nhất)
    const titleEl = document.getElementById('scanner-modal-title');
    if (targetContext === 'INVENTORY_SESSION') {
      titleEl.innerHTML = '<i class="fa-solid fa-clipboard-check text-success me-1"></i> Quét Kiểm Kê Kho (Đối Soát Liên Tục)';
    } else if (targetContext === 'XUAT_KHO') {
      titleEl.innerHTML = '<i class="fa-solid fa-truck-fast text-primary me-1"></i> Quét Serial Xuất Kho';
    } else if (targetContext === 'NHAP_KHO_SINGLE') {
      titleEl.innerHTML = '<i class="fa-solid fa-truck-ramp-box text-info me-1"></i> Quét Serial Nhập Kho';
    } else if (targetContext === 'RETURN_CUSTOMER') {
      titleEl.innerHTML = '<i class="fa-solid fa-rotate-left text-primary me-1"></i> Quét Serial Hoàn Nhập Từ Khách';
    } else if (targetContext === 'RETURN_SUPPLIER') {
      titleEl.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket text-warning me-1"></i> Quét Serial Trả Hàng NCC';
    } else if (targetContext === 'TRANSFER_WAREHOUSE') {
      titleEl.innerHTML = '<i class="fa-solid fa-dolly text-info me-1"></i> Quét Serial Chuyển Kho Nội Bộ';
    } else {
      titleEl.innerHTML = '<i class="fa-solid fa-camera text-success me-1"></i> Camera Quét Barcode / QR';
    }

    // Điền danh sách mẫu vào mock scanner select
    const mockSelect = document.getElementById('mock-scanner-select');
    mockSelect.innerHTML = '';
    SERIAL_DB.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.serial;
      opt.textContent = `${s.serial} (${s.model} - ${s.status})`;
      mockSelect.appendChild(opt);
    });

    const optNew = document.createElement('option');
    optNew.value = 'CN2900-' + Math.floor(100000 + Math.random() * 900000);
    optNew.textContent = `[MỚI] ${optNew.value} (Test Serial mới)`;
    mockSelect.appendChild(optNew);

    const optStrange = document.createElement('option');
    optStrange.value = 'UNKNOWN-STRANGE-SN99';
    optStrange.textContent = `[SERIAL LẠ] UNKNOWN-STRANGE-SN99`;
    mockSelect.appendChild(optStrange);

    const modalEl = document.getElementById('scannerModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    // Mặc định focus vào ô súng quét hoặc ô paste khi mở
    setTimeout(() => {
      const gunInput = document.getElementById('barcode-gun-input');
      if (gunInput) gunInput.focus();
    }, 400);

    // Lắng nghe phím dán ảnh Ctrl+V toàn cục khi mở modal
    if (!modalEl.dataset.pasteListenerAttached) {
      modalEl.addEventListener('paste', handleModalClipboardPaste);
      modalEl.dataset.pasteListenerAttached = 'true';
    }

    // Lắng nghe sự kiện đóng modal để tắt Camera an toàn
    if (!modalEl.dataset.listenerAttached) {
      modalEl.addEventListener('hidden.bs.modal', function () {
        stopScannerCamera();
      });
      modalEl.dataset.listenerAttached = 'true';
    }
  }

  // Xử lý dán ảnh từ Clipboard (Ctrl+V)
  function handleModalClipboardPaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData || !clipboardData.items) return;

    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const feedbackBox = document.getElementById('scanner-feedback-box');
          if (feedbackBox) {
            feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-primary';
            feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đã nhận ảnh từ Clipboard! Đang quét mã vạch...';
          }
          decodeBarcodeFromImageBlob(blob);
          e.preventDefault();
          break;
        }
      }
    }
  }

  function focusPasteZone() {
    const dropZone = document.getElementById('paste-drop-zone');
    if (dropZone) {
      dropZone.style.display = 'block';
      dropZone.className = 'mt-2 p-2 border border-primary border-2 rounded text-primary fw-bold small text-center bg-primary-subtle';
      dropZone.innerHTML = '<i class="fa-solid fa-clipboard-check me-1"></i> Đang sẵn sàng! Hãy bấm Ctrl + V để dán ảnh tem ngay bây giờ!';
      dropZone.tabIndex = 0;
      dropZone.focus();
    }
  }

  // Xử lý súng quét Barcode USB / Bluetooth
  function handleBarcodeGunKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitBarcodeGunInput();
    }
  }

  function submitBarcodeGunInput() {
    const gunInput = document.getElementById('barcode-gun-input');
    if (!gunInput) return;
    const code = gunInput.value.trim();
    if (!code) {
      playBeepSound();
      return;
    }
    gunInput.value = '';
    handleDecodedBarcode(code);
    gunInput.focus();
  }

  let AVAILABLE_CAMERAS = [];
  let CURRENT_CAMERA_ID = null;

  async function startScannerCamera() {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    const cameraSelect = document.getElementById('scanner-camera-select');
    feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-muted';
    feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đang kết nối camera trực tiếp...';

    if (typeof Html5Qrcode === 'undefined') {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
      feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Đang tải thư viện quét... Vui lòng thử lại sau 2 giây!';
      return;
    }

    // Liệt kê các camera vật lý khả dụng với timeout 1.5s an toàn
    try {
      const timeoutGetCam = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout getCameras")), 1500));
      const devices = await Promise.race([
        Html5Qrcode.getCameras(),
        timeoutGetCam
      ]);
      AVAILABLE_CAMERAS = devices || [];
      if (cameraSelect) {
        cameraSelect.innerHTML = '';
        if (AVAILABLE_CAMERAS.length === 0) {
          cameraSelect.innerHTML = '<option value="">Camera mặc định</option>';
        } else {
          AVAILABLE_CAMERAS.forEach((cam, idx) => {
            const opt = document.createElement('option');
            opt.value = cam.id;
            opt.textContent = cam.label || `Camera ${idx + 1}`;
            cameraSelect.appendChild(opt);
          });
        }
      }

      let selectedCamId = null;
      if (AVAILABLE_CAMERAS.length > 0) {
        const backCam = AVAILABLE_CAMERAS.find(c => {
          const l = (c.label || '').toLowerCase();
          return l.includes('back') || l.includes('rear') || l.includes('sau') || l.includes('environment');
        });
        selectedCamId = backCam ? backCam.id : AVAILABLE_CAMERAS[0].id;
        if (cameraSelect) cameraSelect.value = selectedCamId;
      }

      CURRENT_CAMERA_ID = selectedCamId;
      await initHtml5Scanner(selectedCamId);
    } catch (err) {
      console.warn("Camera live bị hạn chế bởi iframe sandbox:", err);
      if (cameraSelect) {
        cameraSelect.innerHTML = '<option value="">(Camera bị iframe GAS chặn - Dùng Nút Mở Ngoài Iframe)</option>';
      }
      if (feedbackBox) {
        feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
        feedbackBox.innerHTML = `
          <div class="mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i> Trình duyệt chặn Camera bên trong iframe Google Apps Script.</div>
          <button class="btn btn-sm btn-primary py-1 px-3 fw-bold" onclick="openStandaloneCameraWindow()">
            <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Bấm Đây Mở Camera Live Ngoài Iframe
          </button>
        `;
      }
    }
  }

  // Mở cửa sổ popup Camera Live độc lập (Host trên GitHub Pages để vượt qua 100% rào cản iframe Google Apps Script)
  function openStandaloneCameraWindow() {
    const onlineUrl = 'https://alexermanh-creator.github.io/QUAN-LY-KHO-THANH-ANH/scanner.html';
    const localUrl = 'scanner.html';

    // Ưu tiên mở trên GitHub Pages (HTTPS độc lập, cấp cao nhất)
    const targetUrl = (typeof location !== 'undefined' && location.hostname === 'localhost' || location.protocol === 'file:') 
      ? localUrl 
      : onlineUrl;

    try {
      const w = window.open(targetUrl, 'ThanhAnCameraScanner', 'width=520,height=680,top=100,left=100,resizable=yes');
      if (!w) {
        if (typeof Swal !== 'undefined' && Swal.fire) {
          Swal.fire({
            icon: 'warning',
            title: 'Trình duyệt chặn Cửa sổ Popup',
            html: `Vui lòng bấm <strong>Cho Phép Cửa Sổ Bật Lên (Popups)</strong> trên thanh địa chỉ của trình duyệt để mở Camera Live!<br><br>
                   Hoặc bạn có thể truy cập trực tiếp: <a href="${onlineUrl}" target="_blank" class="fw-bold text-primary">${onlineUrl}</a>`
          });
        }
      } else {
        w.focus();
      }
    } catch (err) {
      console.error('Không mở được standalone camera scanner:', err);
      window.open(onlineUrl, '_blank');
    }
  }
  window.openStandaloneCameraWindow = openStandaloneCameraWindow;
  if (typeof window !== 'undefined') window.handleDecodedBarcode = handleDecodedBarcode;

  async function switchCameraDevice(cameraId) {
    if (!cameraId) return;
    CURRENT_CAMERA_ID = cameraId;
    await stopScannerCamera();
    setTimeout(async () => {
      await initHtml5Scanner(cameraId);
    }, 200);
  }

  async function initHtml5Scanner(cameraId) {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    await stopScannerCamera();

    const readerContainer = document.getElementById('html5-qr-reader');
    if (readerContainer) readerContainer.innerHTML = '';

    try {
      const formats = (typeof Html5QrcodeSupportedFormats !== 'undefined') ? [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A
      ] : undefined;

      html5QrCodeScanner = new Html5Qrcode("html5-qr-reader", {
        formatsToSupport: formats,
        verbose: false
      });
    } catch(e) {
      console.warn("Lỗi khởi tạo Html5Qrcode:", e);
      if (feedbackBox) {
        feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-danger-subtle text-danger';
        feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Không thể khởi tạo scanner: ' + e.message;
      }
      return;
    }

    const config = { 
      fps: 20, 
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const w = Math.min(viewfinderWidth * 0.85, 280);
        const h = Math.min(viewfinderHeight * 0.55, 160);
        return { width: Math.floor(w), height: Math.floor(h) };
      },
      aspectRatio: 1.777778
    };

    const onScanSuccess = (decodedText) => {
      handleDecodedBarcode(decodedText);
    };

    const trySources = [];
    if (cameraId) trySources.push(cameraId);
    trySources.push({ facingMode: "environment" });
    trySources.push({ facingMode: "user" });

    let isSuccess = false;
    for (const src of trySources) {
      if (isSuccess) break;
      try {
        await html5QrCodeScanner.start(src, config, onScanSuccess, () => {});
        isSuccess = true;
        if (feedbackBox) {
          feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
          feedbackBox.innerHTML = '<i class="fa-solid fa-video me-1"></i> Camera đang hoạt động! Đưa tem mã vạch hoặc mã QR vào khung ngắm.';
        }
        break;
      } catch (err) {
        console.warn("Thử nguồn camera thất bại:", src, err);
      }
    }

    if (!isSuccess && feedbackBox) {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
      feedbackBox.innerHTML = `
        <div class="mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i> Trình duyệt chặn Camera Live bên trong iframe Google Apps Script.</div>
        <button class="btn btn-sm btn-primary py-1 px-3 fw-bold shadow-sm" onclick="openStandaloneCameraWindow()">
          <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Mở Cửa Sổ Camera Live Ngoài Iframe
        </button>
      `;
    }
  }

  // Quét trực tiếp mã vạch từ ảnh chụp tem thiết bị (Chuẩn 100% trên điện thoại & Web App GAS)
  function scanBarcodeFromFile(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    decodeBarcodeFromImageBlob(file, () => {
      fileInput.value = '';
    });
  }

  // Giải mã ảnh từ Blob / File với kiến trúc đa tầng (BarcodeDetector GPU -> Canvas Resizing -> Html5Qrcode)
  function decodeBarcodeFromImageBlob(fileBlob, callback) {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    if (feedbackBox) {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-primary';
      feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đang phân tích mã vạch từ ảnh chụp tem...';
    }

    // TẦNG 1: NATIVE BARCODE DETECTOR (Nhanh gấp 10 lần, có sẵn trong Chrome/Edge/Android)
    if (typeof window.BarcodeDetector !== 'undefined') {
      try {
        const formats = ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8', 'upc_a'];
        const detector = new window.BarcodeDetector({ formats });
        createImageBitmap(fileBlob).then(bitmap => {
          return detector.detect(bitmap);
        }).then(barcodes => {
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            const detectedCode = barcodes[0].rawValue.trim();
            handleDecodedBarcode(detectedCode);
            if (feedbackBox) {
              feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
              feedbackBox.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> Đã đọc thành công: <strong>${detectedCode}</strong>`;
            }
            if (typeof callback === 'function') callback();
            return;
          }
          // Nếu tầng 1 chưa ra, chuyển sang Tầng 2
          decodeWithHtml5Qrcode(fileBlob, callback);
        }).catch(err => {
          console.warn("BarcodeDetector fallback to Html5Qrcode:", err);
          decodeWithHtml5Qrcode(fileBlob, callback);
        });
        return;
      } catch (e) {
        console.warn("Lỗi BarcodeDetector:", e);
      }
    }

    // TẦNG 2: HTML5QRCODE SCANNER VỚI CANVAS RESIZING
    decodeWithHtml5Qrcode(fileBlob, callback);
  }

  function decodeWithHtml5Qrcode(fileBlob, callback) {
    const feedbackBox = document.getElementById('scanner-feedback-box');

    if (!html5QrCodeScanner) {
      try {
        const formats = (typeof Html5QrcodeSupportedFormats !== 'undefined') ? [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A
        ] : undefined;

        html5QrCodeScanner = new Html5Qrcode("html5-qr-reader", {
          formatsToSupport: formats,
          verbose: false
        });
      } catch(e){}
    }

    if (!html5QrCodeScanner) {
      if (feedbackBox) {
        feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-danger-subtle text-danger';
        feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Đang tải bộ giải mã... Vui lòng thử lại!';
      }
      if (typeof callback === 'function') callback();
      return;
    }

    // Quét lần 1 với renderImage = true
    html5QrCodeScanner.scanFile(fileBlob, true).then(decodedText => {
      handleDecodedBarcode(decodedText);
      if (feedbackBox) {
        feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
        feedbackBox.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> Đã đọc thành công: <strong>${decodedText}</strong>`;
      }
      if (typeof callback === 'function') callback();
    }).catch(err => {
      // Quét lần 2 với renderImage = false
      html5QrCodeScanner.scanFile(fileBlob, false).then(decodedText => {
        handleDecodedBarcode(decodedText);
        if (feedbackBox) {
          feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
          feedbackBox.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> Đã đọc thành công: <strong>${decodedText}</strong>`;
        }
        if (typeof callback === 'function') callback();
      }).catch(err2 => {
        if (feedbackBox) {
          feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-danger-subtle text-danger';
          feedbackBox.innerHTML = '<i class="fa-solid fa-circle-xmark me-1"></i> Không nhận diện được tem trong ảnh. Hãy chụp gần hơn, giữ thẳng và đủ sáng!';
        }
        if (typeof callback === 'function') callback();
      });
    });
  }

  async function stopScannerCamera() {
    if (html5QrCodeScanner) {
      try {
        if (html5QrCodeScanner.isScanning) {
          await html5QrCodeScanner.stop();
        }
        html5QrCodeScanner.clear();
      } catch (e) {
        console.warn("Lỗi khi dừng scanner:", e);
      }
      html5QrCodeScanner = null;
    }
  }

  function handleDecodedBarcode(rawCode) {
    const code = (rawCode || '').trim();
    if (!code) return;

    const now = Date.now();
    // Chống quét trùng liên tục trong 2 giây (Yêu cầu I3)
    if (code === lastScannedCode && (now - lastScannedTimestamp) < 2000) {
      const feedbackBox = document.getElementById('scanner-feedback-box');
      if (feedbackBox) {
        feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
        feedbackBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Mã <strong>${code}</strong> vừa được quét! Vui lòng chuyển sang tem tiếp theo.`;
      }
      return;
    }

    lastScannedCode = code;
    lastScannedTimestamp = now;

    playBeepSound();
    triggerVibration();

    const feedbackBox = document.getElementById('scanner-feedback-box');
    if (feedbackBox) {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
      feedbackBox.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> Đã quét thành công: <strong class="font-monospace text-primary">${code}</strong>`;
    }

    sessionScannedSerials.push(code);
    const recentContainer = document.getElementById('scanner-recent-container');
    if (recentContainer) recentContainer.style.display = 'block';
    
    const countEl = document.getElementById('scanner-scanned-count');
    if (countEl) countEl.textContent = `${sessionScannedSerials.length} mã`;
    
    const listEl = document.getElementById('scanner-scanned-list');
    if (listEl) {
      const badge = document.createElement('span');
      badge.className = 'badge bg-light text-dark border font-monospace';
      badge.textContent = code;
      listEl.appendChild(badge);
    }

    // Chuyển dữ liệu vào ngữ cảnh
    routeScannedCodeToContext(code);

    const isContinuous = document.getElementById('scanner-continuous-toggle')?.checked;
    if (!isContinuous) {
      setTimeout(() => {
        const modalEl = document.getElementById('scannerModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        stopScannerCamera();
      }, 600);
    }
  }

  // Điều hướng mã quét vào form nghiệp vụ tương ứng (Bổ sung 3 nghiệp vụ kho - Yêu cầu 11)
  function routeScannedCodeToContext(code) {
    if (CURRENT_SCAN_CONTEXT === 'GLOBAL_SEARCH') {
      document.getElementById('global-search-input').value = code;
      handleGlobalSearch(code);
    } else if (CURRENT_SCAN_CONTEXT === 'SERIAL_360') {
      document.getElementById('serial-360-search-input').value = code;
      switchTab('Serial360');
      lookupSerial360(code);
    } else if (CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE') {
      const textarea = document.getElementById('nhap-serial-input');
      if (textarea) {
        const currentVal = textarea.value.trim();
        textarea.value = currentVal ? `${currentVal}\n${code}` : code;
        updateNhapSerialCounter();
      }
    } else if (CURRENT_SCAN_CONTEXT === 'XUAT_KHO') {
      addSerialToXuatDraft(code);
    } else if (CURRENT_SCAN_CONTEXT === 'WARRANTY_CASE') {
      const inp = document.getElementById('case-serial');
      if (inp) {
        inp.value = code;
        onWarrantySerialChange(code);
      }
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_LOOKUP') {
      const inp = document.getElementById('filter-stock-keyword');
      if (inp) {
        inp.value = code;
        applyStockFilter();
      }
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_ADJUSTMENT') {
      const inp = document.getElementById('adj-serial');
      if (inp) inp.value = code;
    } else if (CURRENT_SCAN_CONTEXT === 'INVENTORY_SESSION') {
      addSerialToInventorySession(code);
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_CUSTOMER') {
      const inp = document.getElementById('return-cust-serial');
      if (inp) inp.value = code;
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_SUPPLIER') {
      const inp = document.getElementById('return-supp-serial');
      if (inp) inp.value = code;
    } else if (CURRENT_SCAN_CONTEXT === 'TRANSFER_WAREHOUSE') {
      const inp = document.getElementById('transfer-serial');
      if (inp) inp.value = code;
    }
  }

  function triggerMockScan() {
    const select = document.getElementById('mock-scanner-select');
    const code = select ? select.value : '';
    if (code) {
      handleDecodedBarcode(code);
    }
  }
