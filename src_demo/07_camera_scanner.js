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
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    setTimeout(() => {
      startScannerCamera();
    }, 300);
  }

  let AVAILABLE_CAMERAS = [];
  let CURRENT_CAMERA_ID = null;

  function startScannerCamera() {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    const cameraSelect = document.getElementById('scanner-camera-select');
    feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-muted';
    feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đang tìm thiết bị Camera khả dụng...';

    if (typeof Html5Qrcode === 'undefined') {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
      feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Thư viện camera chưa tải xong. Bạn có thể dùng "Mô phỏng máy quét" hoặc "Quét ảnh"!';
      return;
    }

    // 1. Quét danh sách camera vật lý có trên thiết bị (Webcam, Camera trước, Camera sau)
    Html5Qrcode.getCameras().then(devices => {
      AVAILABLE_CAMERAS = devices || [];
      if (cameraSelect) {
        cameraSelect.innerHTML = '';
        if (AVAILABLE_CAMERAS.length === 0) {
          cameraSelect.innerHTML = '<option value="">Không tìm thấy camera</option>';
        } else {
          AVAILABLE_CAMERAS.forEach((cam, idx) => {
            const opt = document.createElement('option');
            opt.value = cam.id;
            const label = cam.label || `Camera ${idx + 1}`;
            opt.textContent = label;
            cameraSelect.appendChild(opt);
          });
        }
      }

      // Ưu tiên chọn camera sau nếu có (chứa chữ back, rear, environment)
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
      initHtml5Scanner(selectedCamId);
    }).catch(err => {
      console.warn("Không lấy được danh sách camera:", err);
      // Fallback: Thử mở trực tiếp bằng facingMode
      initHtml5Scanner(null);
    });
  }

  function switchCameraDevice(cameraId) {
    if (!cameraId) return;
    CURRENT_CAMERA_ID = cameraId;
    stopScannerCamera();
    setTimeout(() => {
      initHtml5Scanner(cameraId);
    }, 200);
  }

  function initHtml5Scanner(cameraId) {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    try {
      if (!html5QrCodeScanner) {
        html5QrCodeScanner = new Html5Qrcode("html5-qr-reader");
      }
    } catch(e) {
      console.warn("Lỗi khởi tạo Html5Qrcode:", e);
      return;
    }

    const config = { 
      fps: 15, 
      qrbox: { width: 260, height: 160 },
      aspectRatio: 1.777778
    };

    // Xác định nguồn camera: ID cụ thể hoặc facingMode fallback
    let cameraSource = cameraId ? cameraId : { facingMode: "environment" };

    const startWithConfig = (source) => {
      return html5QrCodeScanner.start(
        source,
        config,
        (decodedText) => {
          handleDecodedBarcode(decodedText);
        },
        (errorMessage) => {}
      );
    };

    startWithConfig(cameraSource).then(() => {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
      feedbackBox.innerHTML = '<i class="fa-solid fa-video me-1"></i> Camera đang hoạt động! Đưa tem mã vạch hoặc mã QR vào khung ngắm.';
    }).catch(err => {
      console.warn("Camera start failed lần 1:", err);
      // Fallback 1: Thử lại với camera trước (facingMode: user) cho Laptop/Webcam
      startWithConfig({ facingMode: "user" }).then(() => {
        feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
        feedbackBox.innerHTML = '<i class="fa-solid fa-video me-1"></i> Đã bật WebCam trước! Đưa mã vạch vào khung ngắm.';
      }).catch(err2 => {
        console.warn("Camera start failed lần 2:", err2);
        // Fallback 2: Không đặt constraint, chỉ yêu cầu video bất kỳ
        startWithConfig(true).then(() => {
          feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
          feedbackBox.innerHTML = '<i class="fa-solid fa-video me-1"></i> Camera đã kết nối thành công!';
        }).catch(err3 => {
          console.warn("Camera start failed hoàn toàn:", err3);
          feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
          feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Chưa thể cấp quyền Camera. Bạn có thể bấm "Quét ảnh" hoặc dùng "Mô phỏng máy quét" để test!';
        });
      });
    });
  }

  // Quét trực tiếp mã vạch từ ảnh chụp tem thiết bị
  function scanBarcodeFromFile(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const feedbackBox = document.getElementById('scanner-feedback-box');
    feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-primary';
    feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đang đọc mã vạch từ file ảnh...';

    if (!html5QrCodeScanner) {
      html5QrCodeScanner = new Html5Qrcode("html5-qr-reader");
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

  function stopScannerCamera() {
    if (html5QrCodeScanner) {
      try {
        html5QrCodeScanner.stop().then(() => {
          html5QrCodeScanner.clear();
          html5QrCodeScanner = null;
        }).catch(() => {
          html5QrCodeScanner = null;
        });
      } catch (e) {
        html5QrCodeScanner = null;
      }
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
