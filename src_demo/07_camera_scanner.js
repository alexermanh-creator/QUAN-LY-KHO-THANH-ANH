  /* ==================================================== */
  /* 7. CAMERA QUÉT BARCODE / QR & QUÉT LIÊN TỤC (YÊU CẦU I & 11) */
  /* ==================================================== */

  let html5QrCodeScanner = null;
  let CURRENT_SCAN_CONTEXT = 'GLOBAL_SEARCH';
  let lastScannedCode = '';
  let lastScannedTimestamp = 0;
  let sessionScannedSerials = [];

  function openScannerModal(targetContext) {
    CURRENT_SCAN_CONTEXT = targetContext;
    sessionScannedSerials = [];
    document.getElementById('scanner-scanned-count').textContent = '0 mã';
    document.getElementById('scanner-scanned-list').innerHTML = '';
    
    // Cập nhật tiêu đề modal theo ngữ cảnh
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

    // Lắng nghe sự kiện đóng modal để tắt Camera an toàn
    if (!modalEl.dataset.listenerAttached) {
      modalEl.addEventListener('hidden.bs.modal', function () {
        stopScannerCamera();
      });
      modalEl.dataset.listenerAttached = 'true';
    }

    setTimeout(() => {
      startScannerCamera();
    }, 300);
  }

  let AVAILABLE_CAMERAS = [];
  let CURRENT_CAMERA_ID = null;

  async function startScannerCamera() {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    const cameraSelect = document.getElementById('scanner-camera-select');
    feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-muted';
    feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đang yêu cầu quyền truy cập Camera...';

    if (typeof Html5Qrcode === 'undefined') {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
      feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Đang tải thư viện quét... Vui lòng thử lại sau 2 giây!';
      return;
    }

    // 1. Kích hoạt hộp thoại cấp quyền Camera của trình duyệt bằng getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Đã cấp quyền thành công -> Dừng stream thử
        testStream.getTracks().forEach(track => track.stop());
      } catch (permErr) {
        console.warn("Chưa cấp quyền camera qua getUserMedia:", permErr);
      }
    }

    // 2. Liệt kê các camera vật lý khả dụng
    try {
      const devices = await Html5Qrcode.getCameras();
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

      // Ưu tiên Camera sau trên điện thoại, hoặc camera đầu tiên trên Laptop
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
      console.warn("Không lấy được danh sách camera, fallback tự động:", err);
      await initHtml5Scanner(null);
    }
  }

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
    
    // Dừng instance cũ trước khi tạo mới để chống xung đột
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

    // Danh sách nguồn thử kết nối
    const trySources = [];
    if (cameraId) trySources.push(cameraId);
    trySources.push({ facingMode: "environment" });
    trySources.push({ facingMode: "user" });
    trySources.push(true);

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
        <div class="mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i> Chưa thể kết nối Camera. Vui lòng bấm "Cho phép" nếu trình duyệt hỏi quyền.</div>
        <button class="btn btn-sm btn-primary py-0 px-2 fw-bold" onclick="startScannerCamera()">
          <i class="fa-solid fa-rotate-right me-1"></i> Thử Bật Lại Camera
        </button>
      `;
    }
  }

  // Quét trực tiếp mã vạch từ ảnh chụp tem thiết bị
  function scanBarcodeFromFile(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const feedbackBox = document.getElementById('scanner-feedback-box');
    feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-primary';
    feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đang đọc mã vạch từ file ảnh...';

    if (!html5QrCodeScanner) {
      try {
        html5QrCodeScanner = new Html5Qrcode("html5-qr-reader");
      } catch(e){}
    }

    if (!html5QrCodeScanner) {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-danger-subtle text-danger';
      feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Chưa khởi tạo được bộ đọc ảnh!';
      return;
    }

    html5QrCodeScanner.scanFile(file, true).then(decodedText => {
      handleDecodedBarcode(decodedText);
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
      feedbackBox.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> Đã đọc thành công từ ảnh: <strong>${decodedText}</strong>`;
      fileInput.value = '';
    }).catch(err => {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-danger-subtle text-danger';
      feedbackBox.innerHTML = '<i class="fa-solid fa-circle-xmark me-1"></i> Không nhận diện được mã vạch trong ảnh này. Hãy thử ảnh rõ nét hơn!';
      fileInput.value = '';
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
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
      feedbackBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Mã <strong>${code}</strong> vừa được quét! Vui lòng chuyển sang tem tiếp theo.`;
      return;
    }

    lastScannedCode = code;
    lastScannedTimestamp = now;

    playBeepSound();
    triggerVibration();

    const feedbackBox = document.getElementById('scanner-feedback-box');
    feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
    feedbackBox.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i> Đã quét thành công: <strong class="font-monospace text-primary">${code}</strong>`;

    sessionScannedSerials.push(code);
    document.getElementById('scanner-recent-container').style.display = 'block';
    document.getElementById('scanner-scanned-count').textContent = `${sessionScannedSerials.length} mã`;
    
    const listEl = document.getElementById('scanner-scanned-list');
    const badge = document.createElement('span');
    badge.className = 'badge bg-light text-dark border font-monospace';
    badge.textContent = code;
    listEl.appendChild(badge);

    // Chuyển dữ liệu vào ngữ cảnh (Bao gồm 3 ngữ cảnh mới - Yêu cầu 11)
    routeScannedCodeToContext(code);

    const isContinuous = document.getElementById('scanner-continuous-toggle').checked;
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
      const currentVal = textarea.value.trim();
      textarea.value = currentVal ? `${currentVal}\n${code}` : code;
      updateNhapSerialCounter();
    } else if (CURRENT_SCAN_CONTEXT === 'XUAT_KHO') {
      addSerialToXuatDraft(code);
    } else if (CURRENT_SCAN_CONTEXT === 'WARRANTY_CASE') {
      document.getElementById('case-serial').value = code;
      onWarrantySerialChange(code);
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_LOOKUP') {
      document.getElementById('filter-stock-keyword').value = code;
      applyStockFilter();
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_ADJUSTMENT') {
      document.getElementById('adj-serial').value = code;
    } else if (CURRENT_SCAN_CONTEXT === 'INVENTORY_SESSION') {
      addSerialToInventorySession(code);
    } 
    // 3 NGHIỆP VỤ KHO MỚI BỔ SUNG CAMERA (YÊU CẦU 11)
    else if (CURRENT_SCAN_CONTEXT === 'RETURN_CUSTOMER') {
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
    const code = select.value;
    if (code) {
      handleDecodedBarcode(code);
    }
  }
