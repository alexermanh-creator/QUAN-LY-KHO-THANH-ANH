  /* ==================================================== */
  /* 7. HỆ THỐNG QUÉT MÃ VẠCH & BÓC TÁCH SERIAL THÔNG MINH  */
  /*    - Chụp / Tải nhiều ảnh cùng lúc                   */
  /*    - Dán ảnh từ bộ nhớ tạm (Ctrl + V)                 */
  /*    - Súng quét mã vạch USB / Bluetooth tự động       */
  /*    - Bóc tách mã đa tầng siêu tốc: GPU + Multi-Region  */
  /* ==================================================== */

  let CURRENT_SCAN_CONTEXT = 'GLOBAL_SEARCH';
  let lastScannedCode = '';
  let lastScannedTimestamp = 0;
  let sessionScannedSerials = [];
  let extractedSerialsList = []; // Mảng đối tượng: { id, serial, method, previewUrl, timestamp }
  let barcodeBroadcastChannel = null;
  let sharedHtml5QrScanner = null;

  // Âm thanh Beep và Rung phản hồi khi quét / bóc tách thành công
  function playBeepSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  function triggerVibration() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([80, 50, 80]); } catch (e) {}
    }
  }

  // Khởi tạo kênh giao tiếp đồng bộ nếu có
  function initBarcodeSyncChannel() {
    window.removeEventListener('message', onWindowMessageBarcodeSync);
    window.addEventListener('message', onWindowMessageBarcodeSync);

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

  initBarcodeSyncChannel();
  initGlobalHardwareScanner();

  /* ==================================================== */
  /* MỞ MODAL SCANNER VÀ QUẢN LÝ GIAO DIỆN TINH GỌN       */
  /* ==================================================== */
  function updateScannerSubmitButtonLabel() {
    const submitBtn = document.getElementById('btn-submit-extracted-serials');
    const labelEl = document.getElementById('btn-submit-extracted-label');
    const selectedCountEl = document.getElementById('scanner-selected-count');
    const totalCountEl = document.getElementById('scanner-total-extracted');
    const selectAllCheck = document.getElementById('scanner-select-all-check');
    if (!submitBtn) return;

    const sourceList = (typeof window !== 'undefined' && Array.isArray(window.extractedSerialsList) && window.extractedSerialsList.length > 0)
      ? window.extractedSerialsList
      : extractedSerialsList;
    const totalCount = sourceList ? sourceList.length : 0;
    const selectedList = sourceList ? sourceList.filter(s => s.selected !== false) : [];
    const count = selectedList.length;

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (selectedCountEl) selectedCountEl.textContent = count;
    if (selectAllCheck) {
      selectAllCheck.checked = (count === totalCount && totalCount > 0);
      selectAllCheck.indeterminate = (count > 0 && count < totalCount);
    }

    if (count === 0) {
      submitBtn.disabled = true;
      const emptyText = totalCount > 0 ? 'Vui lòng tick chọn máy' : 'Đưa Vào Form';
      if (labelEl) {
        labelEl.textContent = emptyText;
      } else {
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-check fs-6"></i> <span>${emptyText}</span>`;
      }
      return;
    }

    submitBtn.disabled = false;
    let text = 'Đưa Vào Form';
    if (CURRENT_SCAN_CONTEXT === 'NHAP_KHO' || CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE') {
      text = count === 1 ? 'Thêm 1 máy vào phiếu nhập' : `Thêm ${count} máy vào phiếu nhập`;
    } else if (CURRENT_SCAN_CONTEXT === 'XUAT_KHO') {
      text = count === 1 ? 'Thêm 1 máy vào phiếu xuất' : `Thêm ${count} máy vào phiếu xuất`;
    } else if (CURRENT_SCAN_CONTEXT === 'SERIAL_360') {
      text = count === 1 ? 'Xem hồ sơ 1 Serial' : `Xem hồ sơ ${count} Serial`;
    } else if (CURRENT_SCAN_CONTEXT === 'TRANSFER_WAREHOUSE') {
      text = count === 1 ? 'Chuyển 1 máy sang kho đích' : `Chuyển ${count} máy sang kho đích`;
    } else if (CURRENT_SCAN_CONTEXT === 'AUTO_UNIVERSAL') {
      if (count === 1) {
        const singleSn = String((selectedList[0] && selectedList[0].serial) || '').trim().toUpperCase().replace(/[\s\r\n\t]/g, '');
        const exists = (typeof SERIAL_DB !== 'undefined' && Array.isArray(SERIAL_DB))
          ? SERIAL_DB.some(s => String(s.serial || '').trim().toUpperCase() === singleSn || String(s.internalId || '').trim().toUpperCase() === singleSn)
          : false;
        text = exists ? 'Xem hồ sơ Serial 360°' : 'Thêm 1 máy vào phiếu nhập';
      } else if (count > 1) {
        text = `Xử lý ${count} máy đã chọn`;
      } else {
        text = 'Tự động đa năng';
      }
    }

    if (labelEl) {
      labelEl.textContent = text;
    } else {
      submitBtn.innerHTML = `<i class="fa-solid fa-circle-check fs-6"></i> <span>${text}</span>`;
    }
  }

  function setScanContext(ctx) {
    CURRENT_SCAN_CONTEXT = ctx || 'AUTO_UNIVERSAL';
    const btnAuto = document.getElementById('scan-ctx-auto');
    const btnNhap = document.getElementById('scan-ctx-nhap');
    const btnXuat = document.getElementById('scan-ctx-xuat');
    const btn360 = document.getElementById('scan-ctx-360');

    const isAuto = CURRENT_SCAN_CONTEXT === 'AUTO_UNIVERSAL';
    const isNhap = CURRENT_SCAN_CONTEXT === 'NHAP_KHO' || CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE';
    const isXuat = CURRENT_SCAN_CONTEXT === 'XUAT_KHO';
    const is360 = CURRENT_SCAN_CONTEXT === 'SERIAL_360';

    if (btnAuto) btnAuto.className = isAuto ? 'scanner-ctx-btn active' : 'scanner-ctx-btn';
    if (btnNhap) btnNhap.className = isNhap ? 'scanner-ctx-btn active' : 'scanner-ctx-btn';
    if (btnXuat) btnXuat.className = isXuat ? 'scanner-ctx-btn active' : 'scanner-ctx-btn';
    if (btn360) btn360.className = is360 ? 'scanner-ctx-btn active' : 'scanner-ctx-btn';

    const titleEl = document.getElementById('scanner-modal-title');
    if (titleEl) {
      if (isAuto) {
        titleEl.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles text-warning me-1"></i> Tự Động Đa Năng';
      } else if (isXuat) {
        titleEl.innerHTML = '<i class="fa-solid fa-truck-fast text-danger me-1"></i> Quét Serial Xuất Kho';
      } else if (is360) {
        titleEl.innerHTML = '<i class="fa-solid fa-qrcode text-primary me-1"></i> Tra Cứu Hồ Sơ Serial 360';
      } else {
        titleEl.innerHTML = '<i class="fa-solid fa-box-archive text-success me-1"></i> Quét Serial Nhập Kho';
      }
    }

    const helper = document.getElementById('scanner-inline-helper');
    if (helper) helper.style.display = 'none';

    updateScannerSubmitButtonLabel();
  }

  function openScannerModal(targetContext) {
    let initialCtx = targetContext;
    if (!initialCtx || initialCtx === 'GLOBAL_SEARCH') {
      // Tự động suy luận ngữ cảnh theo tab người dùng đang mở
      const activeTabEl = document.querySelector('.main-content-tab.active, .tab-pane.active');
      const activeTabId = activeTabEl ? activeTabEl.id : '';
      if (activeTabId.includes('nhap') || activeTabId.includes('Nhap')) initialCtx = 'NHAP_KHO';
      else if (activeTabId.includes('xuat') || activeTabId.includes('Xuat')) initialCtx = 'XUAT_KHO';
      else if (activeTabId.includes('360')) initialCtx = 'SERIAL_360';
      else if (activeTabId.includes('nghiep-vu') || activeTabId.includes('NghiepVu')) initialCtx = 'TRANSFER_WAREHOUSE';
      else initialCtx = 'AUTO_UNIVERSAL';
    } else if (initialCtx === 'NHAP_KHO_SINGLE') {
      initialCtx = 'NHAP_KHO';
    }

    setScanContext(initialCtx);

    // GIỮ NGUYÊN DANH SÁCH extractedSerialsList ĐỂ KHÔNG BỊ MẤT MÃ KHI MỞ LẠI SCANNER
    const progressContainer = document.getElementById('scanner-batch-progress');
    if (progressContainer) progressContainer.style.display = 'none';

    const feedbackBox = document.getElementById('scanner-feedback-box');
    if (feedbackBox) {
      if (extractedSerialsList.length > 0) {
        feedbackBox.className = 'p-2 rounded small text-center fw-semibold bg-light text-primary mb-2';
        feedbackBox.innerHTML = `<i class="fa-solid fa-layer-group me-1"></i> Đang có <strong>${extractedSerialsList.length}</strong> số Serial trong danh sách. Bạn có thể chụp tiếp hoặc xử lý.`;
      } else {
        feedbackBox.className = 'p-2 rounded small text-center fw-semibold bg-light text-muted mb-2';
        feedbackBox.innerHTML = '<i class="fa-solid fa-circle-info me-1 text-primary"></i> Sẵn sàng! Hãy chọn ảnh tem hoặc chụp trực tiếp để bóc tách Serial.';
      }
    }

    const helper = document.getElementById('scanner-inline-helper');
    if (helper) helper.style.display = 'none';

    const fileInput = document.getElementById('scanner-batch-file-input');
    if (fileInput) fileInput.value = '';

    renderExtractedSerialsTable();

    const modalEl = document.getElementById('scannerModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();

      // Lắng nghe phím dán ảnh Ctrl+V khi modal mở
      if (!modalEl.dataset.pasteListenerAttached) {
        modalEl.addEventListener('paste', handleModalClipboardPaste);
        modalEl.dataset.pasteListenerAttached = 'true';
      }
    }
  }

  function stopScannerCamera() {
    // Dọn dẹp an toàn khi modal đóng
    if (sharedHtml5QrScanner) {
      try {
        if (sharedHtml5QrScanner.isScanning) {
          sharedHtml5QrScanner.stop().catch(() => {});
        }
        sharedHtml5QrScanner.clear();
      } catch (e) {}
      sharedHtml5QrScanner = null;
    }
  }

  function focusPasteZone() {
    const dropZone = document.getElementById('paste-drop-zone');
    if (dropZone) {
      dropZone.className = 'p-3 border border-2 border-primary rounded bg-primary-subtle text-center shadow-sm';
      dropZone.innerHTML = `
        <i class="fa-solid fa-keyboard text-primary fs-3 d-block mb-1"></i>
        <span class="fw-bold text-primary d-block">ĐÃ SẴN SÀNG NHẬN ẢNH!</span>
        <span class="small text-dark">Hãy bấm ngay tổ hợp phím <kbd class="bg-primary text-white px-2 py-1 rounded">Ctrl + V</kbd> trên bàn phím.</span>
      `;
      dropZone.focus();
    }
  }

  /* ==================================================== */
  /* TIẾP NHẬN ẢNH: CHỌN NHIỀU ẢNH HOẶC DÁN CTRL + V      */
  /* ==================================================== */
  function handleBatchImagesUpload(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    const files = Array.from(fileInput.files);
    processBatchImageBlobs(files);
    fileInput.value = '';
  }

  function handleModalClipboardPaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData || !clipboardData.items) return;

    const imageBlobs = [];
    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) imageBlobs.push(blob);
      }
    }

    if (imageBlobs.length > 0) {
      e.preventDefault();
      processBatchImageBlobs(imageBlobs);
    }
  }

  /* ==================================================== */
  /* BỘ LỌC HEURISTIC KIỂM ĐỊNH SỐ SERIAL CHUẨN XÁC      */
  /* ==================================================== */
  function isValidSerialNumber(rawText) {
    if (!rawText) return null;
    let sn = String(rawText).trim().toUpperCase();

    // Loại bỏ dấu bao ngoặc và ký tự ngăn cách nếu có
    sn = sn.replace(/^[\[\(\{\#\:\s]+/, '').replace(/[\]\)\}\.\;\,\s]+$/, '');
    sn = sn.replace(/\s+/g, '');

    // Độ dài Serial hợp lệ thông thường từ 6 đến 24 ký tự
    if (sn.length < 6 || sn.length > 24) return null;

    // Chỉ chứa chữ cái latin, chữ số, dấu gạch nối
    if (!/^[A-Z0-9\-_]+$/.test(sn)) return null;

    // Loại trừ mã vạch chuẩn bán lẻ UPC-A / EAN-13 (chuỗi thuần số 12 hoặc 13 chữ số, ví dụ 195161269745)
    if (/^\d{12,13}$/.test(sn)) return null;

    // Loại trừ chuỗi chứa toàn ký tự trùng nhau (ví dụ: 000000, XXXXXX)
    if (/^(.)\1+$/.test(sn)) return null;

    // Loại trừ ngày tháng thuần số (YYYYMMDD)
    if (/^(19|20)\d{6}$/.test(sn)) return null;

    // Loại trừ địa chỉ MAC Card mạng (12 ký tự hex)
    if (/^(?:[0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/i.test(sn)) return null;

    // 1. Loại trừ các mã Product Number / Part Number của HP (như 9YF83A, 2Z610A, 499Q0A, F6W14A, 3904C016CA)
    if (/^\d[A-Z0-9]{2}\d{2}[A-Z]$/.test(sn)) return null;
    if (/^[A-Z]\d[A-Z0-9]\d{2}[A-Z]$/.test(sn)) return null;
    if (/^(?:9YF|2Z6|499|F6W|3904C|RX8)\w*/i.test(sn)) return null;

    // 2. Loại trừ part number hộp mực / linh kiện thông dụng
    if (/^(?:CF\d{3}[A-Z]?|CE\d{3}[A-Z]?|W\d{4}[A-Z]?|TN-?\d{3,4}|CRG-?\d{3}|05\d[A-Z]?)$/i.test(sn)) return null;

    // 3. Loại trừ mã Regulatory / Option BBU
    if (/^(?:SHNGC|BBU|OPTION|OPTIONBBU|RX\d+-\d+|XU\d+-\d+|DJID)/i.test(sn)) return null;

    // Loại trừ từ khóa tem in và thông số kỹ thuật phổ biến trên vỏ hộp
    const blacklistedWords = [
      'PRINTER', 'SCANNER', 'VIETNAM', 'MADEIN', 'VOLTS', 'HERTZ',
      'AMPERES', 'WARNING', 'CAUTION', 'ENERGY', 'SERIES', 'PRODUCT',
      'HEWLETT', 'PACKARD', 'CANON', 'BROTHER', 'EPSON', 'TONER',
      'CARTRIDGE', 'RATING', 'ORIGINAL', 'SUPPLY', 'SERIAL', 'NUMBER',
      'DEFAULT', 'PASSED', 'STANDARD', 'BARCODE', 'OPTION', 'OPTIONBBU',
      'PRODUCTNO', 'SERIALNO', 'MODELNO'
    ];
    if (blacklistedWords.includes(sn)) return null;

    // Loại trừ mã Model sản phẩm nếu trùng với danh mục hệ thống
    if (typeof PRODUCT_DB !== 'undefined' && Array.isArray(PRODUCT_DB)) {
      const isKnownModel = PRODUCT_DB.some(p => (p.model || '').toUpperCase() === sn);
      if (isKnownModel) return null;
    }

    return sn;
  }

  function getSerialConfidenceScore(rawText) {
    const sn = isValidSerialNumber(rawText);
    if (!sn) return 0;

    let score = 50;
    // HP Serial chuẩn: 10 ký tự, bắt đầu bằng VNM, CNB, VN, SG, PH, TH
    if (/^(?:VNM|CNB|VN|SG|PH|TH)[A-Z0-9]{7,8}$/.test(sn)) score += 100;
    // Canon Serial chuẩn: 4 chữ + 5 số hoặc (21)
    else if (/^[A-Z]{4}\d{5}$/.test(sn)) score += 90;
    // Brother Serial chuẩn: 15 ký tự
    else if (/^[A-Z0-9]{15}$/.test(sn)) score += 80;
    // Dell Service Tag: 7 ký tự
    else if (/^[A-Z0-9]{7}$/.test(sn)) score += 70;
    // Có cả chữ và số
    if (/[A-Z]/.test(sn) && /\d/.test(sn)) score += 20;
    // Độ dài chuẩn thiết bị kho (8-14 ký tự)
    if (sn.length >= 8 && sn.length <= 14) score += 10;

    return score;
  }

  /* ==================================================== */
  /* TIỀN XỬ LÝ ẢNH & TẠO THUMBNAIL (CHUẨN HÓA 960PX)    */
  /* ==================================================== */
  async function preprocessImageBlob(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          // 1. Tạo thumbnail nhỏ để hiển thị trên bảng kết quả
          const thumbCanvas = document.createElement('canvas');
          const thumbWidth = 100;
          const thumbHeight = Math.round((img.height / img.width) * thumbWidth);
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = Math.max(thumbHeight, 40);
          const thumbCtx = thumbCanvas.getContext('2d');
          thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
          const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.8);

          // 2. Tạo Canvas tối ưu để giải mã siêu tốc (Scale chuẩn 960px thay vì 1600px)
          const maxDim = 960;
          let targetW = img.width;
          let targetH = img.height;
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW > targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetW, targetH);

          resolve({ canvas, thumbnailDataUrl });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Không tải được ảnh'));
      };
      img.src = objectUrl;
    });
  }

  // Cắt lát một vùng Canvas thành Blob riêng biệt (hỗ trợ tăng tương phản khử bóng băng dính)
  function createCroppedBlob(sourceCanvas, sx, sy, sw, sh, withContrast = false) {
    return new Promise(resolve => {
      try {
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = Math.max(sw, 10);
        cropCanvas.height = Math.max(sh, 10);
        const ctx = cropCanvas.getContext('2d');
        ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
        if (withContrast) {
          enhanceContrast(ctx, cropCanvas.width, cropCanvas.height);
        }
        cropCanvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9);
      } catch (e) {
        resolve(null);
      }
    });
  }

  function enhanceContrast(ctx, width, height) {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const factor = 1.35;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const val = factor * (gray - 128) + 128;
        const clamped = Math.max(0, Math.min(255, val));
        data[i] = clamped;
        data[i + 1] = clamped;
        data[i + 2] = clamped;
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {}
  }

  /* ==================================================== */
  /* BÓC TÁCH SERIAL ĐA TẦNG & CẮT LÁT ĐA VÙNG (MULTI-REGION) */
  /* ==================================================== */
  async function extractSerialsFromSingleBlob(blob, forceGemini = false) {
    const results = [];
    let thumbnailDataUrl = '';
    let canvas = null;

    try {
      const prep = await preprocessImageBlob(blob);
      canvas = prep.canvas;
      thumbnailDataUrl = prep.thumbnailDataUrl;
    } catch (e) {
      console.warn('Lỗi tiền xử lý ảnh:', e);
      return { results: [], thumbnailDataUrl: '' };
    }

    // ----------------------------------------------------
    // TẦNG 1: NATIVE BARCODE DETECTOR (GPU Hardware Acceleration)
    // ----------------------------------------------------
    if (!forceGemini && typeof window.BarcodeDetector !== 'undefined') {
      try {
        const formats = ['code_128', 'code_39', 'qr_code', 'ean_13', 'upc_a'];
        const detector = new window.BarcodeDetector({ formats });
        const detectedCodes = await detector.detect(canvas);
        if (detectedCodes && detectedCodes.length > 0) {
          const candidates = [];
          for (const item of detectedCodes) {
            const raw = (item.rawValue || '').trim();
            const validSn = isValidSerialNumber(raw);
            if (validSn) {
              candidates.push({ serial: validSn, score: getSerialConfidenceScore(validSn) });
            }
          }
          candidates.sort((a, b) => b.score - a.score);
          if (candidates.length > 0 && candidates[0].score >= 80) {
            results.push({
              serial: candidates[0].serial,
              method: 'Barcode (Phần cứng GPU)',
              thumbnailDataUrl: thumbnailDataUrl
            });
          }
        }
      } catch (err) {
        console.warn('Native BarcodeDetector:', err);
      }
    }

    // ----------------------------------------------------
    // TẦNG 2: BỘ GIẢI MÃ MÃ VẠCH ĐA DẢI THÔNG MINH (SMART MULTI-REGION BANDS)
    // Cắt các dải vàng để cô lập mã Serial No và triệt tiêu mã UPC ở đáy tem
    // ----------------------------------------------------
    if (!forceGemini && results.length === 0 && typeof Html5Qrcode !== 'undefined') {
      try {
        if (!sharedHtml5QrScanner) {
          sharedHtml5QrScanner = new Html5Qrcode('html5-qr-reader', { verbose: false });
        }

        // Định nghĩa các dải quét chiến lược bao phủ mọi góc chụp tem
        // [startY_ratio, height_ratio, mô tả]
        const scanBands = [
          { sy: 0.15, sh: 0.35, name: 'Dải Nửa Trên (Cụm Serial No)' },
          { sy: 0.35, sh: 0.32, name: 'Dải Vàng Trọng Tâm' },
          { sy: 0.42, sh: 0.26, name: 'Dải Cận Cảnh' },
          { sy: 0.50, sh: 0.40, name: 'Dải Nửa Dưới' },
          { sy: 0.0,  sh: 1.0,  name: 'Toàn Bộ Ảnh' }
        ];

        const candidateCodes = [];

        for (const band of scanBands) {
          const cropY = Math.round(canvas.height * band.sy);
          const cropH = Math.round(canvas.height * band.sh);
          const cropBlob = await createCroppedBlob(canvas, 0, cropY, canvas.width, cropH, true);
          if (!cropBlob) continue;

          let code = await sharedHtml5QrScanner.scanFile(cropBlob, true).catch(() => null);
          if (!code) {
            code = await sharedHtml5QrScanner.scanFile(cropBlob, false).catch(() => null);
          }

          if (code) {
            const validSn = isValidSerialNumber(code);
            if (validSn) {
              const score = getSerialConfidenceScore(validSn);
              if (!candidateCodes.some(c => c.serial === validSn)) {
                candidateCodes.push({ serial: validSn, score: score, bandName: band.name });
              }
            }
          }
        }

        // Sắp xếp các ứng viên barcode theo độ tin cậy từ cao xuống thấp
        candidateCodes.sort((a, b) => b.score - a.score);

        if (candidateCodes.length > 0 && candidateCodes[0].score >= 80) {
          const top = candidateCodes[0];
          results.push({
            serial: top.serial,
            method: `Mã Vạch Barcode (${top.bandName})`,
            thumbnailDataUrl: thumbnailDataUrl
          });
        }
      } catch (err) {
        console.warn('Lỗi quét Html5Qrcode:', err);
      }
    }

    // ----------------------------------------------------
    // TẦNG 2: GEMINI VISION CLOUD AI (100% QUA GOOGLE APPS SCRIPT BACKEND)
    // Kích hoạt khi forceGemini = true hoặc khi Barcode không bắt được Serial chuẩn
    // ----------------------------------------------------
    if ((forceGemini || results.length === 0) && typeof WarehouseAPI !== 'undefined' && typeof WarehouseAPI.callGeminiVision === 'function') {
      try {
        const base64Data = canvas.toDataURL('image/jpeg', 0.95);
        const geminiRes = await new Promise(resolve => {
          WarehouseAPI.callGeminiVision(base64Data, 'image/jpeg', res => resolve(res));
        });

        if (geminiRes && geminiRes.success && Array.isArray(geminiRes.serials) && geminiRes.serials.length > 0) {
          for (const item of geminiRes.serials) {
            const validSn = isValidSerialNumber(item.serial);
            if (validSn && !results.some(r => r.serial === validSn)) {
              results.push({
                serial: validSn,
                method: `Gemini AI Vision (${geminiRes.model || 'Flash'})`,
                thumbnailDataUrl: thumbnailDataUrl,
                modelName: item.model || ''
              });
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Lỗi gọi Gemini Vision AI:', geminiErr);
      }
    }

    // ----------------------------------------------------
    // TẦNG 3: AI OCR TESSERACT.JS (BÓC TÁCH CHỮ IN MẮT THƯỜNG CỤC BỘ)
    // Cứu cánh dự phòng khi mất mạng hoặc không có API
    // Giới hạn timeout 1.8s để chống treo lag hệ thống
    // ----------------------------------------------------
    if (results.length === 0 && typeof Tesseract !== 'undefined') {
      try {
        const timeoutOcr = new Promise((_, reject) => setTimeout(() => reject(new Error('OCR Timeout')), 1800));
        const ocrPromise = Tesseract.recognize(canvas, 'eng', { logger: () => {} });
        const ocrResult = await Promise.race([ocrPromise, timeoutOcr]);

        const ocrText = (ocrResult && ocrResult.data && ocrResult.data.text) ? ocrResult.data.text : '';
        if (ocrText) {
          // Pattern 1: Tìm theo neo từ khóa Serial Number chuẩn quốc tế
          const anchorRegex = /(?:Serial\s*(?:No|Num|Number)?|SER\.?\s*(?:NO|NUM)?|S[\/\.]?N|SN|Service\s*Tag|Serial-Nr)[\s\:\-\.\#\[\(]+([A-Z0-9]{6,22})/gi;
          let match;
          while ((match = anchorRegex.exec(ocrText)) !== null) {
            const snFound = isValidSerialNumber(match[1]);
            if (snFound && !results.some(r => r.serial === snFound)) {
              results.push({
                serial: snFound,
                method: 'AI OCR (Đọc Chữ In Tem)',
                thumbnailDataUrl: thumbnailDataUrl
              });
            }
          }

          // Pattern 2: Dòng máy HP (Ví dụ: VNM1908585, VNM1908583, VNM1908452, CNB..., SG...)
          const hpRegex = /\b(?:VNM|CNB|VN|SG)[0-9A-Z]{7}\b/gi;
          let hpMatch;
          while ((hpMatch = hpRegex.exec(ocrText)) !== null) {
            const snFound = isValidSerialNumber(hpMatch[0]);
            if (snFound && !results.some(r => r.serial === snFound)) {
              results.push({
                serial: snFound,
                method: 'AI OCR (Định Dạng HP)',
                thumbnailDataUrl: thumbnailDataUrl
              });
            }
          }

          // Pattern 3: Dòng máy Canon (Ví dụ: 4 chữ cái + 5 chữ số)
          const canonRegex = /\b[A-Z]{4}[0-9]{5}\b/gi;
          let canonMatch;
          while ((canonMatch = canonRegex.exec(ocrText)) !== null) {
            const snFound = isValidSerialNumber(canonMatch[0]);
            if (snFound && !results.some(r => r.serial === snFound)) {
              results.push({
                serial: snFound,
                method: 'AI OCR (Định Dạng Canon)',
                thumbnailDataUrl: thumbnailDataUrl
              });
            }
          }

          // Pattern 4: Dòng máy Brother (15 ký tự chữ và số)
          const brotherRegex = /\b[A-Z0-9]{15}\b/gi;
          let brotherMatch;
          while ((brotherMatch = brotherRegex.exec(ocrText)) !== null) {
            const snFound = isValidSerialNumber(brotherMatch[0]);
            if (snFound && !results.some(r => r.serial === snFound)) {
              results.push({
                serial: snFound,
                method: 'AI OCR (Định Dạng Brother)',
                thumbnailDataUrl: thumbnailDataUrl
              });
            }
          }

          // Pattern 5: Dòng máy Dell (7 ký tự Service Tag có từ khóa neo)
          const dellRegex = /(?:Service\s*Tag|ST)[\s\:\-]+([A-Z0-9]{7})\b/gi;
          let dellMatch;
          while ((dellMatch = dellRegex.exec(ocrText)) !== null) {
            const snFound = isValidSerialNumber(dellMatch[1]);
            if (snFound && !results.some(r => r.serial === snFound)) {
              results.push({
                serial: snFound,
                method: 'AI OCR (Định Dạng Dell Service Tag)',
                thumbnailDataUrl: thumbnailDataUrl
              });
            }
          }
        }
      } catch (ocrErr) {
        console.warn('Tesseract OCR:', ocrErr);
      }
    }

    return { results, thumbnailDataUrl };
  }

  /* ==================================================== */
  /* XỬ LÝ HÀNG LOẠT ẢNH SONG SONG SIÊU TỐC (< 0.5s)     */
  /* ==================================================== */
  async function processBatchImageBlobs(blobs, forceGemini = false) {
    if (!blobs || blobs.length === 0) return;

    const progressContainer = document.getElementById('scanner-batch-progress');
    const progressBar = document.getElementById('batch-progress-bar');
    const progressText = document.getElementById('batch-progress-text');
    const progressCount = document.getElementById('batch-progress-count');
    const feedbackBox = document.getElementById('scanner-feedback-box');

    if (progressContainer) progressContainer.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';

    const totalImages = blobs.length;
    let completedCount = 0;
    let newSerialsFound = 0;

    if (progressText) {
      progressText.innerHTML = forceGemini
        ? `<i class="fa-solid fa-wand-magic-sparkles text-primary me-1"></i> Đang phân tích bằng Gemini AI Vision ${totalImages} ảnh...`
        : `<i class="fa-solid fa-bolt text-warning me-1"></i> Đang phân tích song song ${totalImages} ảnh...`;
    }

    // XỬ LÝ SONG SONG TẬN DỤNG ĐA NHÂN CPU (PROMISE.ALL)
    const taskPromises = blobs.map(async (blob, index) => {
      try {
        const { results, thumbnailDataUrl } = await extractSerialsFromSingleBlob(blob, forceGemini);
        if (results && results.length > 0) {
          for (const item of results) {
            const cleanSn = (item.serial || '').trim().toUpperCase().replace(/[\s\r\n\t]/g, '');
            if (cleanSn && cleanSn.length >= 3 && !extractedSerialsList.some(s => s.serial === cleanSn)) {
              extractedSerialsList.push({
                id: 'sn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                serial: cleanSn,
                selected: true,
                method: item.method,
                previewUrl: item.thumbnailDataUrl || thumbnailDataUrl,
                modelName: item.modelName || '',
                timestamp: Date.now()
              });
              newSerialsFound++;
            }
          }
        }
      } catch (err) {
        console.error(`Lỗi khi bóc tách ảnh ${index + 1}:`, err);
      } finally {
        completedCount++;
        const percent = Math.round((completedCount / totalImages) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressCount) progressCount.textContent = `${completedCount}/${totalImages}`;
      }
    });

    await Promise.all(taskPromises);

    // Hoàn tất quét hàng loạt
    if (progressContainer) {
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 500);
    }

    if (newSerialsFound > 0) {
      playBeepSound();
      triggerVibration();
      if (feedbackBox) {
        feedbackBox.className = 'p-2 rounded small text-center fw-semibold bg-success-subtle text-success mb-2';
        feedbackBox.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Bóc tách thành công <strong>${newSerialsFound}</strong> số Serial! Vui lòng tick chọn máy và bấm nút bên dưới để đưa vào phiếu.`;
      }
    } else {
      if (feedbackBox) {
        feedbackBox.className = 'p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning mb-2';
        feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Chưa bắt được số Serial rõ nét. Hãy bấm nút tím <strong>[CHỤP &amp; QUÉT BẰNG AI GEMINI]</strong> để AI bóc tách sâu.';
      }
    }

    renderExtractedSerialsTable();
  }

  function handleGeminiDirectScan(inputEl) {
    if (!inputEl || !inputEl.files || inputEl.files.length === 0) return;
    const files = Array.from(inputEl.files);
    processBatchImageBlobs(files, true);
    inputEl.value = '';
  }

  /* ==================================================== */
  /* BẢNG ĐỐI SOÁT & DANH SÁCH SERIAL ĐÃ BÓC TÁCH        */
  /* ==================================================== */
  /* ==================================================== */
  /* BẢNG ĐỐI SOÁT & DANH SÁCH SERIAL ĐÃ BÓC TÁCH        */
  /* ==================================================== */
  function renderExtractedSerialsTable() {
    const resultsContainer = document.getElementById('scanner-results-container');
    const tbody = document.getElementById('scanner-extracted-tbody');
    const cardList = document.getElementById('scanner-extracted-list');
    const totalCountEl = document.getElementById('scanner-total-extracted');
    const selectedCountEl = document.getElementById('scanner-selected-count');
    const submitBtn = document.getElementById('btn-submit-extracted-serials');
    if (typeof window !== 'undefined') {
      if (Array.isArray(window.extractedSerialsList) && window.extractedSerialsList.length > 0 && extractedSerialsList.length === 0) {
        extractedSerialsList = window.extractedSerialsList;
      } else {
        window.extractedSerialsList = extractedSerialsList;
      }
    }

    if (totalCountEl) totalCountEl.textContent = extractedSerialsList.length;

    if (extractedSerialsList.length === 0) {
      if (resultsContainer) resultsContainer.style.display = 'none';
      if (submitBtn) submitBtn.disabled = true;
      if (tbody) tbody.innerHTML = '';
      if (cardList) cardList.innerHTML = '';
      if (selectedCountEl) selectedCountEl.textContent = '0';
      updateScannerSubmitButtonLabel();
      return;
    }

    if (resultsContainer) resultsContainer.style.display = 'block';
    if (submitBtn) submitBtn.disabled = false;

    // 1. Render Card List cho Mobile (Có checkbox tick chọn từng máy, chữ to rõ)
    if (cardList) {
      cardList.innerHTML = extractedSerialsList.map((item, idx) => {
        const isGemini = (item.method || '').includes('Gemini');
        const badgeColor = isGemini ? 'bg-primary text-white shadow-sm' : 'bg-success text-white shadow-sm';
        const thumbHtml = item.previewUrl
          ? `<img src="${item.previewUrl}" alt="Tem" style="height: 38px; width: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;" class="flex-shrink-0">`
          : '';

        return `
          <div class="scanner-serial-card shadow-sm ${item.selected === false ? 'opacity-50 bg-light' : ''}" id="scanner-item-${item.id}">
            <div class="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden">
              <div class="form-check m-0 d-flex align-items-center flex-shrink-0">
                <input type="checkbox" class="form-check-input m-0" style="width: 22px; height: 22px; cursor: pointer;" 
                       ${item.selected !== false ? 'checked' : ''} 
                       onchange="toggleSelectExtractedSerial('${item.id}', this.checked)">
              </div>
              <span class="badge bg-secondary-subtle text-dark border px-2 py-1">${idx + 1}</span>
              ${thumbHtml}
              <div class="flex-grow-1 overflow-hidden" id="scanner-view-sn-${item.id}">
                <div class="scanner-serial-sn text-truncate" title="${escapeHtml(item.serial)}">${escapeHtml(item.serial)}</div>
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="badge ${badgeColor}" style="font-size: 0.65rem;">${escapeHtml(item.method || 'Mã Vạch')}</span>
                  ${item.modelName ? `<small class="text-secondary text-truncate fw-semibold" style="font-size: 0.75rem;"><i class="fa-solid fa-tag me-1 text-primary"></i>${escapeHtml(item.modelName)}</small>` : ''}
                </div>
              </div>
              <div class="d-none flex-grow-1" id="scanner-edit-sn-${item.id}">
                <div class="input-group input-group-sm">
                  <input type="text" class="form-control font-monospace fw-bold text-primary" id="input-sn-${item.id}" value="${escapeHtml(item.serial)}" onkeydown="if(event.key==='Enter') saveSerialEdit('${item.id}')">
                  <button class="btn btn-success" type="button" onclick="saveSerialEdit('${item.id}')"><i class="fa-solid fa-check"></i></button>
                  <button class="btn btn-secondary" type="button" onclick="cancelSerialEdit('${item.id}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-1 flex-shrink-0" id="scanner-actions-${item.id}">
              <button type="button" class="btn btn-sm btn-light text-primary border p-2" onclick="toggleSerialEdit('${item.id}')" title="Sửa Serial">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" class="btn btn-sm btn-light text-danger border p-2" onclick="deleteExtractedSerial('${item.id}')" title="Xóa">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Render Table cho Desktop nếu tbody tồn tại
    if (tbody) {
      tbody.innerHTML = extractedSerialsList.map((item, idx) => {
        const badgeClass = (item.method || '').includes('Gemini') ? 'bg-primary text-white shadow-sm' : 'bg-success text-white shadow-sm';
        const thumbHtml = item.previewUrl
          ? `<img src="${item.previewUrl}" alt="Tem" style="height: 34px; width: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;">`
          : `<span class="badge bg-light text-muted border">No img</span>`;

        return `
          <tr class="${item.selected === false ? 'opacity-50 bg-light' : ''}">
            <td class="text-center" style="width: 36px;">
              <input type="checkbox" class="form-check-input m-0" style="width: 18px; height: 18px; cursor: pointer;" 
                     ${item.selected !== false ? 'checked' : ''} 
                     onchange="toggleSelectExtractedSerial('${item.id}', this.checked)">
            </td>
            <td class="text-center fw-bold text-muted">${idx + 1}</td>
            <td class="text-center">${thumbHtml}</td>
            <td>
              <input type="text" class="form-control form-control-sm font-monospace fw-bold text-primary py-0" 
                     value="${escapeHtml(item.serial)}" 
                     onchange="updateExtractedSerialValue('${item.id}', this.value)" style="max-width: 220px;">
            </td>
            <td>
              <span class="badge ${badgeClass} text-white small">${escapeHtml(item.method)}</span>
            </td>
            <td class="text-center">
              <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="deleteExtractedSerial('${item.id}')" title="Xóa mã này">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    updateScannerSubmitButtonLabel();
  }

  function toggleSelectExtractedSerial(id, isChecked) {
    const list = (typeof window !== 'undefined' && Array.isArray(window.extractedSerialsList) && window.extractedSerialsList.length > 0)
      ? window.extractedSerialsList
      : extractedSerialsList;
    const item = list.find(x => x.id === id);
    if (item) {
      item.selected = isChecked;
      if (typeof window !== 'undefined') window.extractedSerialsList = list;
      updateScannerSubmitButtonLabel();
      const cardEl = document.getElementById(`scanner-item-${id}`);
      if (cardEl) {
        if (isChecked) cardEl.classList.remove('opacity-50', 'bg-light');
        else cardEl.classList.add('opacity-50', 'bg-light');
      }
    }
  }

  function toggleSelectAllExtractedSerials(isChecked) {
    const list = (typeof window !== 'undefined' && Array.isArray(window.extractedSerialsList) && window.extractedSerialsList.length > 0)
      ? window.extractedSerialsList
      : extractedSerialsList;
    list.forEach(item => {
      item.selected = isChecked;
    });
    if (typeof window !== 'undefined') window.extractedSerialsList = list;
    renderExtractedSerialsTable();
  }

  function toggleSerialEdit(id) {
    const viewEl = document.getElementById(`scanner-view-sn-${id}`);
    const editEl = document.getElementById(`scanner-edit-sn-${id}`);
    const actionsEl = document.getElementById(`scanner-actions-${id}`);
    const inputEl = document.getElementById(`input-sn-${id}`);

    if (viewEl && editEl) {
      viewEl.classList.add('d-none');
      editEl.classList.remove('d-none');
      if (actionsEl) actionsEl.classList.add('d-none');
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
    }
  }

  function cancelSerialEdit(id) {
    const viewEl = document.getElementById(`scanner-view-sn-${id}`);
    const editEl = document.getElementById(`scanner-edit-sn-${id}`);
    const actionsEl = document.getElementById(`scanner-actions-${id}`);

    if (viewEl && editEl) {
      viewEl.classList.remove('d-none');
      editEl.classList.add('d-none');
      if (actionsEl) actionsEl.classList.remove('d-none');
    }
  }

  function saveSerialEdit(id) {
    const inputEl = document.getElementById(`input-sn-${id}`);
    if (!inputEl) return;
    const newVal = (inputEl.value || '').trim().toUpperCase().replace(/[\s\r\n\t]/g, '');

    if (!newVal || newVal.length < 3) {
      alert('Số Serial không được để trống và phải có ít nhất 3 ký tự!');
      return;
    }

    // Chống trùng với serial khác trong danh sách
    const isDuplicate = extractedSerialsList.some(s => s.id !== id && s.serial === newVal);
    if (isDuplicate) {
      alert(`Mã Serial "${newVal}" đã có trong danh sách bóc tách!`);
      return;
    }

    const item = extractedSerialsList.find(s => s.id === id);
    if (item) {
      item.serial = newVal;
    }
    renderExtractedSerialsTable();
  }

  function updateExtractedSerialValue(id, newVal) {
    const cleanSn = (newVal || '').trim().toUpperCase().replace(/[\s\r\n\t]/g, '');
    if (!cleanSn) return;
    if (extractedSerialsList.some(s => s.id !== id && s.serial === cleanSn)) {
      alert(`Mã Serial "${cleanSn}" đã có trong danh sách!`);
      renderExtractedSerialsTable();
      return;
    }
    const item = extractedSerialsList.find(s => s.id === id);
    if (item) {
      item.serial = cleanSn;
    }
    renderExtractedSerialsTable();
  }

  function deleteExtractedSerial(id) {
    extractedSerialsList = extractedSerialsList.filter(s => s.id !== id);
    if (typeof window !== 'undefined') window.extractedSerialsList = extractedSerialsList;
    renderExtractedSerialsTable();
  }

  function clearExtractedSerials() {
    extractedSerialsList = [];
    if (typeof window !== 'undefined') window.extractedSerialsList = [];
    renderExtractedSerialsTable();
  }

  /* ==================================================== */
  /* LƯU THẲNG VÀO PHIẾU NHÁP SERVER (MOBILE -> PC)      */
  /* ==================================================== */
  function saveExtractedSerialsToServerDraft() {
    const validSerials = extractedSerialsList
      .map(s => (s.serial || '').trim().toUpperCase().replace(/[\s\r\n\t]/g, ''))
      .filter(s => s.length >= 3);

    if (validSerials.length === 0) {
      alert('Không có mã Serial nào hợp lệ để lưu vào phiếu nháp!');
      return;
    }

    const isNhap = CURRENT_SCAN_CONTEXT === 'NHAP_KHO' || CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE';
    const isXuat = CURRENT_SCAN_CONTEXT === 'XUAT_KHO';

    if (!isNhap && !isXuat) {
      alert('Chức năng Lưu Nháp Server chỉ áp dụng khi đang ở chế độ Nhập Kho hoặc Xuất Kho!\nVui lòng chọn ngữ cảnh "Quét Nhập Kho" hoặc "Quét Xuất Kho".');
      return;
    }

    let ncc = '';
    let kho = '';
    let khachHang = '';
    let model = '';

    if (isNhap) {
      const nccHidden = (document.getElementById('nhap-ncc')?.value || '').trim();
      const nccInput = (document.getElementById('nhap-ncc-input')?.value || '').trim();
      kho = (document.getElementById('nhap-kho')?.value || '').trim();
      const modelHidden = (document.getElementById('nhap-select-model')?.value || '').trim();
      const modelInput = (document.getElementById('nhap-model-input')?.value || '').trim();

      const suppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => s.active !== false);
      const matchedNcc = suppliers.find(s => {
        const tt = (s.tenTat || '').toLowerCase();
        const td = (s.tenDayDu || '').toLowerCase();
        return (nccHidden && (tt === nccHidden.toLowerCase() || td === nccHidden.toLowerCase())) ||
               tt === nccInput.toLowerCase() || td === nccInput.toLowerCase();
      });

      ncc = matchedNcc ? (matchedNcc.tenDayDu || matchedNcc.tenTat) : nccInput;
      model = modelHidden || modelInput;

      if (!ncc || !kho || !model) {
        alert('Không thể lưu Phiếu Nháp Server khi thiếu dữ liệu bắt buộc!\nVui lòng chọn đầy đủ: Nhà Cung Cấp, Kho nhận và Model từ danh mục hệ thống.');
        return;
      }
    } else if (isXuat) {
      const custInput = (document.getElementById('xuat-khach-input')?.value || '').trim();
      const custHidden = (document.getElementById('xuat-khach-select')?.value || '').trim();
      kho = (document.getElementById('xuat-kho-select')?.value || '').trim();

      const customers = (typeof INITIAL_CUSTOMERS !== 'undefined' ? INITIAL_CUSTOMERS : []).filter(c => c.active !== false);
      const matchedCust = customers.find(c => {
        const cName = (c.ten || '').toLowerCase();
        return (custHidden && cName === custHidden.toLowerCase()) || cName === custInput.toLowerCase();
      });

      khachHang = matchedCust ? matchedCust.ten : custInput;

      if (!khachHang || !kho) {
        alert('Không thể lưu Phiếu Nháp Server khi thiếu dữ liệu bắt buộc!\nVui lòng chọn đầy đủ: Khách Hàng và Kho xuất từ danh mục hệ thống.');
        return;
      }
    }

    const prefix = isXuat ? 'XK-DRAFT' : 'NK-DRAFT';
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const draftId = `${prefix}-${dateStr}-${rand}`;
    const nowFormatted = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Đang lưu Phiếu Nháp...',
        html: `Đang đẩy <b>${validSerials.length}</b> số Serial lên Google Sheets server...`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
    }

    const draftPayload = {
      maPhieu: draftId,
      type: isXuat ? 'XUAT' : 'NHAP',
      status: 'DRAFT',
      ngay: nowFormatted,
      ngayTao: nowFormatted,
      nguoiTao: typeof CURRENT_USER_NAME !== 'undefined' ? CURRENT_USER_NAME : 'Thủ kho Mobile',
      ncc: isNhap ? ncc : undefined,
      khachHang: isXuat ? khachHang : undefined,
      kho: kho,
      loaiHang: 'Chính Hãng',
      ghiChu: `Quét từ Mobile Camera (${validSerials.length} serials)`,
      items: validSerials.map((sn, idx) => {
        const itemObj = extractedSerialsList.find(x => x.serial === sn);
        return {
          id: 'it_' + (isXuat ? 'xuat_' : 'nhap_') + Date.now() + '_' + idx,
          stt: idx + 1,
          model: (itemObj && itemObj.modelName) || model || 'Thiết bị',
          serial: sn,
          internalId: (typeof generateSequentialInternalAssetId === 'function') ? generateSequentialInternalAssetId() : '',
          kho: kho,
          loaiHang: 'Chính Hãng',
          soLuong: 1
        };
      }),
      version: 1
    };

    if (typeof WarehouseAPI !== 'undefined' && typeof WarehouseAPI.saveDraftVoucher === 'function') {
      WarehouseAPI.saveDraftVoucher(draftPayload, function(res) {
        if (res && res.success) {
          closeScannerModalSafely(function() {
            extractedSerialsList = [];
            if (typeof window !== 'undefined') window.extractedSerialsList = [];
            if (typeof Swal !== 'undefined') {
              Swal.fire({
                icon: 'success',
                title: 'Đã lưu Phiếu Nháp Server!',
                html: `Mã phiếu nháp: <b class="text-primary font-monospace fs-5">${draftId}</b><br>` +
                      `Số lượng: <b>${validSerials.length}</b> thiết bị.<br><br>` +
                      `<div class="alert alert-info text-start small mb-0">` +
                      `Phiếu nháp đã được lưu an toàn trên máy chủ Google Sheets. Bạn có thể mở tab <b>${isXuat ? 'Lịch Sử Xuất Kho' : 'Lịch Sử Nhập Kho'}</b> để tiếp tục xử lý bất kỳ lúc nào!` +
                      `</div>`,
                confirmButtonText: 'Đã hiểu'
              });
            } else {
              alert(`Đã lưu phiếu nháp ${draftId} thành công lên máy chủ!`);
            }
          });
        } else {
          // Lưu thất bại: GIỮ NGUYÊN DANH SÁCH SERIAL
          if (typeof Swal !== 'undefined') {
            Swal.fire('Lỗi lưu nháp', (res && res.message) || 'Không thể lưu phiếu nháp lên máy chủ! Danh sách Serial vẫn được giữ nguyên.', 'error');
          } else {
            alert('Lỗi lưu nháp lên máy chủ! Danh sách Serial vẫn được giữ nguyên.');
          }
        }
      });
    } else {
      closeScannerModalSafely(function() {
        extractedSerialsList = [];
        if (typeof window !== 'undefined') window.extractedSerialsList = [];
        alert(`Đã lưu phiếu nháp ${draftId} (${validSerials.length} serials)!`);
      });
    }
  }

  /* ==================================================== */
  /* HÀM ĐÓNG MODAL QUÉT AN TOÀN THEO VÒNG ĐỜI BOOTSTRAP  */
  /* ==================================================== */
  function closeScannerModalSafely(callback) {
    const modalEl = document.getElementById('scannerModal');
    if (!modalEl) {
      if (typeof callback === 'function') callback();
      return;
    }

    stopScannerCamera();

    let hasExecuted = false;
    let fallbackTimer = null;

    function cleanupAndExecute() {
      if (hasExecuted) return;
      hasExecuted = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      // Gỡ listener sự kiện
      modalEl.removeEventListener('hidden.bs.modal', onModalHidden);

      // Cưỡng chế ẩn modal và dọn dẹp cặn Bootstrap
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.removeAttribute('aria-modal');

      // Dọn dẹp triệt để backdrop nếu không còn modal nào khác đang mở
      const otherOpenModals = document.querySelectorAll('.modal.show');
      if (!otherOpenModals || otherOpenModals.length === 0) {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }

      if (typeof callback === 'function') {
        try {
          callback();
        } catch (err) {
          console.error('[closeScannerModalSafely] Lỗi thực thi callback:', err);
        }
      }
    }

    const onModalHidden = function() {
      cleanupAndExecute();
    };

    // Nếu modal đang không hiển thị hoặc không có Bootstrap
    if (!modalEl.classList.contains('show') || typeof bootstrap === 'undefined' || !bootstrap.Modal) {
      cleanupAndExecute();
      return;
    }

    try {
      const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      modalEl.addEventListener('hidden.bs.modal', onModalHidden);
      
      // Fallback Timeout 350ms: Nếu mobile nuốt chửng sự kiện transitionend/hidden.bs.modal
      fallbackTimer = setTimeout(function() {
        console.warn('[closeScannerModalSafely] Fallback timeout 350ms kích hoạt để bảo vệ vòng đời modal.');
        cleanupAndExecute();
      }, 350);

      modal.hide();
    } catch (e) {
      console.warn('[closeScannerModalSafely] modal.hide() gặp lỗi, cưỡng chế dọn dẹp:', e);
      cleanupAndExecute();
    }
  }

  /* ==================================================== */
  /* ĐƯA TOÀN BỘ SERIAL VÀO PHIẾU THEO NGỮ CẢNH           */
  /* ==================================================== */
  function submitExtractedSerialsToContext() {
    const sourceList = (typeof window !== 'undefined' && Array.isArray(window.extractedSerialsList) && window.extractedSerialsList.length > 0)
      ? window.extractedSerialsList
      : extractedSerialsList;

    if (!sourceList || sourceList.length === 0) return;

    const validSerials = sourceList
      .filter(s => s.selected !== false)
      .map(s => (s.serial || '').trim().toUpperCase().replace(/[\s\r\n\t]/g, ''))
      .filter(s => s.length >= 3);

    if (validSerials.length === 0) {
      alert('Vui lòng tick chọn ít nhất một mã Serial hợp lệ để xử lý!');
      return;
    }

    const helper = document.getElementById('scanner-inline-helper');
    const helperBody = document.getElementById('scanner-inline-helper-body');

    // ----------------------------------------------------
    // XỬ LÝ THEO NGỮ CẢNH: 1. NHẬP KHO
    // ----------------------------------------------------
    if (CURRENT_SCAN_CONTEXT === 'NHAP_KHO' || CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE') {
      const nccHidden = (document.getElementById('nhap-ncc')?.value || '').trim();
      const nccInput = (document.getElementById('nhap-ncc-input')?.value || '').trim();
      const kho = (document.getElementById('nhap-kho')?.value || '').trim();
      const modelHidden = (document.getElementById('nhap-select-model')?.value || '').trim();
      const modelInput = (document.getElementById('nhap-model-input')?.value || '').trim();

      const suppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => s.active !== false);
      const matchedNcc = suppliers.find(s => {
        const tt = (s.tenTat || '').toLowerCase();
        const td = (s.tenDayDu || '').toLowerCase();
        return (nccHidden && (tt === nccHidden.toLowerCase() || td === nccHidden.toLowerCase())) ||
               tt === nccInput.toLowerCase() || td === nccInput.toLowerCase();
      });

      const missing = [];
      if (!matchedNcc && !nccInput) missing.push('Nhà Cung Cấp');
      if (!kho) missing.push('Kho nhận');
      if (!modelHidden && !modelInput) missing.push('Model thiết bị');

      if (missing.length > 0) {
        if (helper && helperBody) {
          helper.style.display = 'block';
          helperBody.innerHTML = `Vui lòng chọn <strong>${missing.join(', ')}</strong> tại phiếu nhập trước khi thêm danh sách ${validSerials.length} Serial vào bảng nháp.`;
        }
        playBeepSound();
        alert(`Chưa đủ thông tin phiếu nhập!\nVui lòng chọn: ${missing.join(', ')} trước khi thêm vào phiếu.`);
        return;
      }

      // Đã đủ thông tin -> Đưa serial vào textarea và gọi addModelToDraftList()
      const textarea = document.getElementById('nhap-serial-input');
      if (textarea) {
        textarea.value = validSerials.join('\n');
      }

      // Đóng modal an toàn theo vòng đời Bootstrap
      closeScannerModalSafely(function() {
        if (typeof switchTab === 'function') switchTab('NhapKho');
        if (typeof addModelToDraftList === 'function') {
          addModelToDraftList();
        }
        // Chỉ loại bỏ các serial đã được đưa vào phiếu, giữ lại các serial chưa chọn
        const submittedSet = new Set(validSerials);
        extractedSerialsList = extractedSerialsList.filter(s => !submittedSet.has(s.serial));
        if (typeof window !== 'undefined') window.extractedSerialsList = extractedSerialsList;
        if (typeof showFloatingScannerToast === 'function') {
          showFloatingScannerToast(`✨ Đã thêm <b>${validSerials.length}</b> Serial vào phiếu nhập!`);
        }
      });
      return;
    }

    // ----------------------------------------------------
    // XỬ LÝ THEO NGỮ CẢNH: 2. XUẤT KHO
    // ----------------------------------------------------
    if (CURRENT_SCAN_CONTEXT === 'XUAT_KHO') {
      const custInput = (document.getElementById('xuat-khach-input')?.value || '').trim();
      const custHidden = (document.getElementById('xuat-khach-select')?.value || '').trim();
      const kho = (document.getElementById('xuat-kho-select')?.value || '').trim();

      const customers = (typeof INITIAL_CUSTOMERS !== 'undefined' ? INITIAL_CUSTOMERS : []).filter(c => c.active !== false);
      const matchedCust = customers.find(c => {
        const cName = (c.ten || '').toLowerCase();
        return (custHidden && cName === custHidden.toLowerCase()) || cName === custInput.toLowerCase();
      });

      const missing = [];
      if (!matchedCust && !custInput) missing.push('Khách Hàng');
      if (!kho) missing.push('Kho xuất');

      if (missing.length > 0) {
        if (helper && helperBody) {
          helper.style.display = 'block';
          helperBody.innerHTML = `Vui lòng chọn <strong>${missing.join(', ')}</strong> tại phiếu xuất trước khi thêm danh sách ${validSerials.length} Serial vào bảng nháp.`;
        }
        playBeepSound();
        alert(`Chưa đủ thông tin phiếu xuất!\nVui lòng chọn: ${missing.join(', ')} trước khi thêm vào phiếu.`);
        return;
      }

      // Đóng modal an toàn theo vòng đời Bootstrap rồi gọi addSerialToXuatDraft
      closeScannerModalSafely(function() {
        if (typeof switchTab === 'function') switchTab('XuatKho');
        if (typeof addSerialToXuatDraft === 'function') {
          addSerialToXuatDraft(validSerials.join('\n'));
        }
        // Chỉ loại bỏ các serial đã được đưa vào phiếu, giữ lại các serial chưa chọn
        const submittedSet = new Set(validSerials);
        extractedSerialsList = extractedSerialsList.filter(s => !submittedSet.has(s.serial));
        if (typeof window !== 'undefined') window.extractedSerialsList = extractedSerialsList;
        if (typeof showFloatingScannerToast === 'function') {
          showFloatingScannerToast(`✨ Đã thêm <b>${validSerials.length}</b> Serial vào phiếu xuất!`);
        }
      });
      return;
    }

    // ----------------------------------------------------
    // XỬ LÝ THEO NGỮ CẢNH: 3. TRA CỨU HỒ SƠ 360 (MULTI-SN)
    // ----------------------------------------------------
    if (CURRENT_SCAN_CONTEXT === 'SERIAL_360') {
      window.CURRENT_SCAN_360_LIST = validSerials;
      window.CURRENT_SCAN_360_INDEX = 0;

      closeScannerModalSafely(function() {
        if (typeof switchTab === 'function') switchTab('Serial360');
        if (typeof lookupSerial360 === 'function') {
          lookupSerial360(validSerials[0]);
        }
      });
      return;
    }

    // ----------------------------------------------------
    // XỬ LÝ THEO NGỮ CẢNH: 4. CHUYỂN KHO HÀNG LOẠT
    // ----------------------------------------------------
    if (CURRENT_SCAN_CONTEXT === 'TRANSFER_WAREHOUSE') {
      const textarea = document.getElementById('transfer-serial');
      if (textarea) {
        textarea.value = validSerials.join('\n');
      }
      if (typeof updateTransferCounter === 'function') {
        updateTransferCounter();
      }

      closeScannerModalSafely(function() {
        if (typeof switchTab === 'function') switchTab('NghiepVuKho');
        const submittedSet = new Set(validSerials);
        extractedSerialsList = extractedSerialsList.filter(s => !submittedSet.has(s.serial));
        if (typeof window !== 'undefined') window.extractedSerialsList = extractedSerialsList;
        if (typeof showFloatingScannerToast === 'function') {
          showFloatingScannerToast(`✨ Đã nạp <b>${validSerials.length}</b> Serial vào form Chuyển Kho!`);
        }
      });
      return;
    }

    // ----------------------------------------------------
    // XỬ LÝ THEO NGỮ CẢNH: 5. TỰ ĐỘNG ĐA NĂNG (GỢI Ý TẠI CHỖ)
    // ----------------------------------------------------
    if (CURRENT_SCAN_CONTEXT === 'AUTO_UNIVERSAL') {
      const existingSerials = [];
      const newSerials = [];

      validSerials.forEach(sn => {
        const found = (typeof SERIAL_DB !== 'undefined' && Array.isArray(SERIAL_DB))
          ? SERIAL_DB.find(s => String(s.serial || '').trim().toUpperCase() === sn || String(s.internalId || '').trim().toUpperCase() === sn)
          : null;
        if (found) existingSerials.push({ serial: sn, item: found });
        else newSerials.push(sn);
      });

      if (validSerials.length === 1) {
        const sn = validSerials[0];
        if (existingSerials.length === 1) {
          window.CURRENT_SCAN_360_LIST = [sn];
          window.CURRENT_SCAN_360_INDEX = 0;
          window._CURRENT_360_SEARCH_KEYWORD = '';
          closeScannerModalSafely(function() {
            if (typeof switchTab === 'function') switchTab('Serial360');
            const targetMod = document.getElementById('module-Serial360');
            if (targetMod) targetMod.style.display = 'block';
            const input360 = document.getElementById('serial-360-search-input');
            if (input360) input360.value = sn;
            setTimeout(function() {
              if (typeof lookupSerial360 === 'function') lookupSerial360(sn);
            }, 50);
            extractedSerialsList = [];
            if (typeof window !== 'undefined') window.extractedSerialsList = [];
          });
        } else {
          setScanContext('NHAP_KHO');
          if (helper && helperBody) {
            helper.style.display = 'block';
            helperBody.innerHTML = `Mã <strong>${sn}</strong> chưa có trong hệ thống kho. Đã chuyển sang ngữ cảnh <strong>Quét Nhập Kho</strong>. Vui lòng chọn thông tin phiếu nhập rồi bấm thêm.`;
          }
        }
        return;
      }

      // Nhiều mã: Hiển thị gợi ý trực tiếp ngay trong modal (không mở popup đè)
      if (helper && helperBody) {
        helper.style.display = 'block';
        helperBody.innerHTML = `
          Phát hiện <strong>${validSerials.length}</strong> thiết bị: 
          <strong>${existingSerials.length}</strong> máy đã có hồ sơ, <strong>${newSerials.length}</strong> máy mới.<br>
          <div class="mt-2 d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-success fw-bold py-1 px-3" onclick="setScanContext('NHAP_KHO'); submitExtractedSerialsToContext();">
              <i class="fa-solid fa-box-archive me-1"></i> Đưa vào Nhập Kho (${newSerials.length || validSerials.length})
            </button>
            <button class="btn btn-sm btn-danger fw-bold py-1 px-3" onclick="setScanContext('XUAT_KHO'); submitExtractedSerialsToContext();">
              <i class="fa-solid fa-dolly me-1"></i> Đưa vào Xuất Kho (${existingSerials.length || validSerials.length})
            </button>
            <button class="btn btn-sm btn-primary fw-bold py-1 px-3" onclick="setScanContext('SERIAL_360'); submitExtractedSerialsToContext();">
              <i class="fa-solid fa-magnifying-glass me-1"></i> Xem hồ sơ 360
            </button>
          </div>
        `;
      }
      return;
    }

    // CÁC NGỮ CẢNH BỔ TRỢ KHÁC (TÌM KIẾM, BẢO HÀNH, TRẢ HÀNG)
    const firstSn = validSerials[0];
    if (CURRENT_SCAN_CONTEXT === 'GLOBAL_SEARCH') {
      const inp = document.getElementById('global-search-input');
      if (inp) inp.value = firstSn;
      closeScannerModalSafely(function() {
        if (typeof handleGlobalSearch === 'function') handleGlobalSearch(firstSn);
      });
    } else if (CURRENT_SCAN_CONTEXT === 'WARRANTY_CASE') {
      const inp = document.getElementById('case-serial');
      if (inp) inp.value = firstSn;
      closeScannerModalSafely(function() {
        if (typeof onWarrantySerialChange === 'function') onWarrantySerialChange(firstSn);
      });
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_LOOKUP') {
      const inp = document.getElementById('filter-stock-keyword');
      if (inp) inp.value = firstSn;
      closeScannerModalSafely(function() {
        if (typeof applyStockFilter === 'function') applyStockFilter();
      });
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_ADJUSTMENT') {
      const inp = document.getElementById('adj-serial');
      if (inp) inp.value = firstSn;
      closeScannerModalSafely();
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_CUSTOMER') {
      const inp = document.getElementById('return-cust-serial');
      if (inp) inp.value = firstSn;
      closeScannerModalSafely();
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_SUPPLIER') {
      const inp = document.getElementById('return-supp-serial');
      if (inp) inp.value = firstSn;
      closeScannerModalSafely();
    } else {
      closeScannerModalSafely();
    }
  }

  /* ==================================================== */
  /* XỬ LÝ MÃ ĐƠN (TỪ SÚNG QUÉT HOẶC TƯƠNG THÍCH CŨ)      */
  /* ==================================================== */
  function handleDecodedBarcode(rawCode) {
    const code = (rawCode || '').trim();
    if (!code) return;

    const now = Date.now();
    if (code === lastScannedCode && (now - lastScannedTimestamp) < 2000) {
      return;
    }

    lastScannedCode = code;
    lastScannedTimestamp = now;

    playBeepSound();
    triggerVibration();

    const validSn = isValidSerialNumber(code) || code;

    // Nếu Modal Scanner đang mở, đưa vào bảng đối soát
    const modalEl = document.getElementById('scannerModal');
    if (modalEl && modalEl.classList.contains('show')) {
      if (!extractedSerialsList.some(s => s.serial === validSn)) {
        extractedSerialsList.push({
          id: 'sn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          serial: validSn,
          method: 'Súng Quét / Barcode Gun',
          previewUrl: '',
          timestamp: Date.now()
        });
        renderExtractedSerialsTable();
      }
      return;
    }

    // Nếu Modal không mở, điều hướng thẳng vào form đang làm việc
    routeScannedCodeToContext(validSn);
  }

  function routeScannedCodeToContext(code) {
    if (CURRENT_SCAN_CONTEXT === 'AUTO_UNIVERSAL') {
      const foundInDb = (typeof SERIAL_DB !== 'undefined' && Array.isArray(SERIAL_DB))
        ? SERIAL_DB.find(s => String(s.serial || '').trim().toUpperCase() === code.toUpperCase() || String(s.internalId || '').trim().toUpperCase() === code.toUpperCase())
        : null;

      if (foundInDb) {
        const inp = document.getElementById('serial-360-search-input');
        if (inp) inp.value = code;
        if (typeof switchTab === 'function') switchTab('Serial360');
        if (typeof lookupSerial360 === 'function') lookupSerial360(code);
        if (typeof showFloatingScannerToast === 'function') {
          showFloatingScannerToast(`✨ Máy <b>${foundInDb.model || code}</b> (${foundInDb.kho || 'Kho VP'}) - Mở 360°`);
        }
      } else {
        const textarea = document.getElementById('nhap-serial-input');
        if (textarea) {
          const curVal = textarea.value.trim();
          textarea.value = curVal ? `${curVal}\n${code}` : code;
          if (typeof updateNhapSerialCounter === 'function') updateNhapSerialCounter();
        }
        if (typeof switchTab === 'function') switchTab('NhapKho');
        if (typeof showFloatingScannerToast === 'function') {
          showFloatingScannerToast(`✨ Thiết bị mới: Đã đưa <b>${code}</b> vào Nhập Kho`);
        }
      }
      return;
    } else if (CURRENT_SCAN_CONTEXT === 'GLOBAL_SEARCH') {
      const inp = document.getElementById('global-search-input');
      if (inp) inp.value = code;
      if (typeof handleGlobalSearch === 'function') handleGlobalSearch(code);
    } else if (CURRENT_SCAN_CONTEXT === 'SERIAL_360') {
      const inp = document.getElementById('serial-360-search-input');
      if (inp) inp.value = code;
      if (typeof switchTab === 'function') switchTab('Serial360');
      if (typeof lookupSerial360 === 'function') lookupSerial360(code);
    } else if (CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE') {
      const textarea = document.getElementById('nhap-serial-input');
      if (textarea) {
        const curVal = textarea.value.trim();
        textarea.value = curVal ? `${curVal}\n${code}` : code;
        if (typeof updateNhapSerialCounter === 'function') updateNhapSerialCounter();
      }
    } else if (CURRENT_SCAN_CONTEXT === 'XUAT_KHO') {
      if (typeof addSerialToXuatDraft === 'function') addSerialToXuatDraft(code);
    } else if (CURRENT_SCAN_CONTEXT === 'INVENTORY_SESSION') {
      if (typeof addSerialToInventorySession === 'function') addSerialToInventorySession(code);
    } else if (CURRENT_SCAN_CONTEXT === 'WARRANTY_CASE') {
      const inp = document.getElementById('case-serial');
      if (inp) {
        inp.value = code;
        if (typeof onWarrantySerialChange === 'function') onWarrantySerialChange(code);
      }
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_LOOKUP') {
      const inp = document.getElementById('filter-stock-keyword');
      if (inp) {
        inp.value = code;
        if (typeof applyStockFilter === 'function') applyStockFilter();
      }
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_ADJUSTMENT') {
      const inp = document.getElementById('adj-serial');
      if (inp) inp.value = code;
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_CUSTOMER') {
      const inp = document.getElementById('return-cust-serial');
      if (inp) inp.value = code;
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_SUPPLIER') {
      const inp = document.getElementById('return-supp-serial');
      if (inp) inp.value = code;
    } else if (CURRENT_SCAN_CONTEXT === 'TRANSFER_WAREHOUSE') {
      const inp = document.getElementById('transfer-serial');
      if (inp) {
        const curVal = inp.value.trim();
        inp.value = curVal ? (curVal + '\n' + code) : code;
        if (typeof updateTransferSerialCounter === 'function') updateTransferSerialCounter();
      }
    }
  }

  /* ==================================================== */
  /* TÍCH HỢP SÚNG QUÉT MÃ VẠCH TOÀN HỆ THỐNG (HARDWARE)  */
  /* ==================================================== */
  let hardwareScannerBuffer = '';
  let lastHardwareKeyTime = 0;
  const HARDWARE_KEY_INTERVAL_MAX_MS = 55; // Súng quét bấm rất nhanh (< 50ms)

  function initGlobalHardwareScanner() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('keydown', onGlobalHardwareScannerKeyDown, true);
    window.addEventListener('keydown', onGlobalHardwareScannerKeyDown, true);
  }

  function onGlobalHardwareScannerKeyDown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key && event.key.startsWith('F') && event.key.length > 1) return;

    const now = Date.now();
    const timeDiff = now - lastHardwareKeyTime;
    lastHardwareKeyTime = now;

    if (event.key === 'Enter' || event.key === 'Tab') {
      if (hardwareScannerBuffer.length >= 3 && timeDiff < 100) {
        const code = hardwareScannerBuffer.trim();
        hardwareScannerBuffer = '';
        event.preventDefault();
        event.stopPropagation();
        handleHardwareScannedBarcode(code);
        return;
      }
      hardwareScannerBuffer = '';
      return;
    }

    if (event.key && event.key.length === 1) {
      if (timeDiff > HARDWARE_KEY_INTERVAL_MAX_MS && hardwareScannerBuffer.length > 0) {
        hardwareScannerBuffer = '';
      }
      hardwareScannerBuffer += event.key;
    }
  }

  function handleHardwareScannedBarcode(code) {
    if (!code) return;
    playBeepSound();
    triggerVibration();

    const modalEl = document.getElementById('scannerModal');
    if (modalEl && modalEl.classList.contains('show')) {
      handleDecodedBarcode(code);
      return;
    }

    const activeTab = (typeof CURRENT_TAB !== 'undefined') ? CURRENT_TAB : 'Dashboard';
    showFloatingScannerToast(`🎯 Súng quét vừa bắn: <strong>${escapeHtml(code)}</strong>`);

    if (activeTab === 'NhapKho') {
      const textarea = document.getElementById('nhap-serial-input');
      if (textarea) {
        const currentVal = textarea.value.trim();
        textarea.value = currentVal ? `${currentVal}\n${code}` : code;
        if (typeof updateNhapSerialCounter === 'function') updateNhapSerialCounter();
      } else {
        routeScannedCodeToContext(code);
      }
    } else if (activeTab === 'XuatKho') {
      if (typeof addSerialToXuatDraft === 'function') {
        addSerialToXuatDraft(code);
      } else {
        routeScannedCodeToContext(code);
      }
    } else if (activeTab === 'TonKho') {
      const inp = document.getElementById('filter-stock-keyword');
      if (inp) {
        inp.value = code;
        if (typeof applyStockFilter === 'function') applyStockFilter();
      }
    } else if (activeTab === 'BaoHanh') {
      const inp = document.getElementById('case-serial');
      if (inp) {
        inp.value = code;
        if (typeof onWarrantySerialChange === 'function') onWarrantySerialChange(code);
      }
    } else {
      if (typeof switchTab === 'function') switchTab('Serial360');
      const inp = document.getElementById('serial-360-search-input');
      if (inp) inp.value = code;
      if (typeof lookupSerial360 === 'function') lookupSerial360(code);
    }
  }

  function showFloatingScannerToast(htmlMsg) {
    let toast = document.getElementById('scanner-floating-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'scanner-floating-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 70px;
        right: 20px;
        background: #0f172a;
        color: #38bdf8;
        border: 1px solid #0284c7;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 99999;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = htmlMsg;
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    toast.style.pointerEvents = 'none';

    if (window._scannerToastTimeout) clearTimeout(window._scannerToastTimeout);
    window._scannerToastTimeout = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        toast.style.pointerEvents = 'none';
        setTimeout(() => {
          if (toast && toast.style.opacity === '0') {
            toast.style.display = 'none';
          }
        }, 350);
      }
    }, 2800);
  }

  // Tương thích window
  if (typeof window !== 'undefined') {
    window.openScannerModal = openScannerModal;
    window.stopScannerCamera = stopScannerCamera;
    window.focusPasteZone = focusPasteZone;
    window.handleBatchImagesUpload = handleBatchImagesUpload;
    window.handleModalClipboardPaste = handleModalClipboardPaste;
    window.renderExtractedSerialsTable = renderExtractedSerialsTable;
    window.updateExtractedSerialValue = updateExtractedSerialValue;
    window.deleteExtractedSerial = deleteExtractedSerial;
    window.clearExtractedSerials = clearExtractedSerials;
    window.submitExtractedSerialsToContext = submitExtractedSerialsToContext;
    window.handleDecodedBarcode = handleDecodedBarcode;
    window.initGlobalHardwareScanner = initGlobalHardwareScanner;
    window.handleHardwareScannedBarcode = handleHardwareScannedBarcode;
    window.showFloatingScannerToast = showFloatingScannerToast;
    window.isValidSerialNumber = isValidSerialNumber;
    window.getSerialConfidenceScore = getSerialConfidenceScore;
    window.setScanContext = setScanContext;
    window.saveExtractedSerialsToServerDraft = saveExtractedSerialsToServerDraft;
    window.handleGeminiDirectScan = handleGeminiDirectScan;
    window.toggleSerialEdit = toggleSerialEdit;
    window.cancelSerialEdit = cancelSerialEdit;
    window.saveSerialEdit = saveSerialEdit;
    window.toggleSelectExtractedSerial = toggleSelectExtractedSerial;
    window.toggleSelectAllExtractedSerials = toggleSelectAllExtractedSerials;
    window.closeScannerModalSafely = closeScannerModalSafely;
    window.updateScannerSubmitButtonLabel = updateScannerSubmitButtonLabel;
  }
