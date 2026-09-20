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

  function startScannerCamera() {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-light text-muted';
    feedbackBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin me-1"></i> Đang kích hoạt camera (ưu tiên camera sau)...';

    if (typeof Html5Qrcode !== 'undefined') {
      try {
        if (html5QrCodeScanner) {
          html5QrCodeScanner.stop().catch(() => {}).finally(() => {
            initHtml5Scanner();
          });
        } else {
          initHtml5Scanner();
        }
      } catch (err) {
        console.warn('HTML5 QRCode error:', err);
        feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
        feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Không thể truy cập Camera. Bạn có thể dùng ô "Mô phỏng máy quét" phía dưới để test nhanh!';
      }
    } else {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning';
      feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Thư viện camera chưa tải xong. Bạn có thể dùng "Mô phỏng máy quét" để test!';
    }
  }

  function initHtml5Scanner() {
    const feedbackBox = document.getElementById('scanner-feedback-box');
    html5QrCodeScanner = new Html5Qrcode("html5-qr-reader");
    const config = { fps: 15, qrbox: { width: 250, height: 160 } };

    html5QrCodeScanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        handleDecodedBarcode(decodedText);
      },
      (errorMessage) => {}
    ).then(() => {
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-success-subtle text-success';
      feedbackBox.innerHTML = '<i class="fa-solid fa-video me-1"></i> Camera đang hoạt động! Đưa mã vạch hoặc QR vào khung đỏ.';
    }).catch(err => {
      console.warn("Camera start failed:", err);
      feedbackBox.className = 'mt-2 p-2 rounded small text-center fw-semibold bg-info-subtle text-info';
      feedbackBox.innerHTML = '<i class="fa-solid fa-keyboard me-1"></i> Chế độ quét mô phỏng: Bạn có thể chọn mã từ danh sách bên dưới rồi bấm "Quét mã này"!';
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
