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
  function openScannerModal(targetContext) {
    CURRENT_SCAN_CONTEXT = targetContext || 'GLOBAL_SEARCH';
    sessionScannedSerials = [];
    extractedSerialsList = [];

    // Cập nhật tiêu đề modal theo ngữ cảnh
    const titleEl = document.getElementById('scanner-modal-title');
    if (titleEl) {
      if (CURRENT_SCAN_CONTEXT === 'INVENTORY_SESSION') {
        titleEl.innerHTML = '<i class="fa-solid fa-clipboard-check text-success me-1"></i> Quét Kiểm Kê Kho (Đối Soát Liên Tục)';
      } else if (CURRENT_SCAN_CONTEXT === 'XUAT_KHO') {
        titleEl.innerHTML = '<i class="fa-solid fa-truck-fast text-primary me-1"></i> Quét Serial Xuất Kho';
      } else if (CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE') {
        titleEl.innerHTML = '<i class="fa-solid fa-truck-ramp-box text-info me-1"></i> Quét Serial Nhập Kho';
      } else if (CURRENT_SCAN_CONTEXT === 'RETURN_CUSTOMER') {
        titleEl.innerHTML = '<i class="fa-solid fa-rotate-left text-primary me-1"></i> Quét Serial Hoàn Nhập Từ Khách';
      } else if (CURRENT_SCAN_CONTEXT === 'RETURN_SUPPLIER') {
        titleEl.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket text-warning me-1"></i> Quét Serial Trả Hàng NCC';
      } else if (CURRENT_SCAN_CONTEXT === 'TRANSFER_WAREHOUSE') {
        titleEl.innerHTML = '<i class="fa-solid fa-dolly text-info me-1"></i> Quét Serial Chuyển Kho Nội Bộ';
      } else if (CURRENT_SCAN_CONTEXT === 'SERIAL_360') {
        titleEl.innerHTML = '<i class="fa-solid fa-qrcode text-primary me-1"></i> Tra Cứu Hồ Sơ Serial 360';
      } else {
        titleEl.innerHTML = '<i class="fa-solid fa-camera text-success me-1"></i> Bóc Tách Serial Qua Ảnh / Mã Vạch';
      }
    }

    // Reset giao diện về trạng thái ban đầu
    const progressContainer = document.getElementById('scanner-batch-progress');
    if (progressContainer) progressContainer.style.display = 'none';

    const feedbackBox = document.getElementById('scanner-feedback-box');
    if (feedbackBox) {
      feedbackBox.className = 'p-2 rounded small text-center fw-semibold bg-light text-muted mb-2';
      feedbackBox.innerHTML = '<i class="fa-solid fa-circle-info me-1 text-primary"></i> Sẵn sàng! Hãy chọn ảnh tem hoặc dán ảnh (<kbd>Ctrl + V</kbd>) để bóc tách Serial.';
    }

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

    // Loại trừ từ khóa tem in và thông số kỹ thuật phổ biến trên vỏ hộp
    const blacklistedWords = [
      'PRINTER', 'SCANNER', 'VIETNAM', 'MADEIN', 'VOLTS', 'HERTZ',
      'AMPERES', 'WARNING', 'CAUTION', 'ENERGY', 'SERIES', 'PRODUCT',
      'HEWLETT', 'PACKARD', 'CANON', 'BROTHER', 'EPSON', 'TONER',
      'CARTRIDGE', 'RATING', 'ORIGINAL', 'SUPPLY', 'SERIAL', 'NUMBER',
      'DEFAULT', 'PASSED', 'STANDARD', 'BARCODE'
    ];
    if (blacklistedWords.includes(sn)) return null;

    // Loại trừ mã Model sản phẩm nếu trùng với danh mục hệ thống
    if (typeof PRODUCT_DB !== 'undefined' && Array.isArray(PRODUCT_DB)) {
      const isKnownModel = PRODUCT_DB.some(p => (p.model || '').toUpperCase() === sn);
      if (isKnownModel) return null;
    }
    // Loại trừ các model phổ biến như 2Z610A, W1470A, CF276A...
    if (/^(2Z\d{3}[A-Z]|W\d{4}[A-Z]|CF\d{3}[A-Z]|CE\d{3}[A-Z]|TN\d{3,4})$/.test(sn)) {
      return null;
    }

    return sn;
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
  async function extractSerialsFromSingleBlob(blob) {
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
    if (typeof window.BarcodeDetector !== 'undefined') {
      try {
        const formats = ['code_128', 'code_39', 'qr_code', 'ean_13', 'upc_a'];
        const detector = new window.BarcodeDetector({ formats });
        const detectedCodes = await detector.detect(canvas);
        if (detectedCodes && detectedCodes.length > 0) {
          for (const item of detectedCodes) {
            const raw = (item.rawValue || '').trim();
            const validSn = isValidSerialNumber(raw);
            if (validSn && !results.some(r => r.serial === validSn)) {
              results.push({
                serial: validSn,
                method: 'Barcode (Phần cứng GPU)',
                thumbnailDataUrl: thumbnailDataUrl
              });
            }
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
    if (results.length === 0 && typeof Html5Qrcode !== 'undefined') {
      try {
        if (!sharedHtml5QrScanner) {
          sharedHtml5QrScanner = new Html5Qrcode('html5-qr-reader', { verbose: false });
        }

        // Định nghĩa các dải quét chiến lược bao phủ mọi góc chụp tem
        // [startY_ratio, height_ratio, mô tả]
        const scanBands = [
          { sy: 0.35, sh: 0.32, name: 'Dải Vàng Trọng Tâm (Serial Giữa Ảnh)' },
          { sy: 0.42, sh: 0.26, name: 'Dải Cận Cảnh Cụm Serial' },
          { sy: 0.20, sh: 0.40, name: 'Dải Nửa Trên' },
          { sy: 0.50, sh: 0.40, name: 'Dải Nửa Dưới' },
          { sy: 0.0,  sh: 1.0,  name: 'Toàn Bộ Ảnh' }
        ];

        for (const band of scanBands) {
          if (results.length > 0) break; // Đã tìm thấy Serial hợp lệ, dừng ngay

          const cropY = Math.round(canvas.height * band.sy);
          const cropH = Math.round(canvas.height * band.sh);
          const cropBlob = await createCroppedBlob(canvas, 0, cropY, canvas.width, cropH, true);
          if (!cropBlob) continue;

          // Thử quét với renderImage = true
          let code = await sharedHtml5QrScanner.scanFile(cropBlob, true).catch(() => null);
          if (!code) {
            // Thử quét với renderImage = false
            code = await sharedHtml5QrScanner.scanFile(cropBlob, false).catch(() => null);
          }

          if (code) {
            const validSn = isValidSerialNumber(code);
            if (validSn && !results.some(r => r.serial === validSn)) {
              results.push({
                serial: validSn,
                method: `Mã Vạch Barcode (${band.name})`,
                thumbnailDataUrl: thumbnailDataUrl
              });
              break;
            }
          }
        }
      } catch (err) {
        console.warn('Lỗi quét Html5Qrcode:', err);
      }
    }

    // ----------------------------------------------------
    // TẦNG 3: AI OCR TESSERACT.JS (BÓC TÁCH CHỮ IN MẮT THƯỜNG)
    // Cứu cánh khi tem bị bóng băng dính làm đứt nét mã vạch
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

          // Pattern 5: Dòng máy Dell (7 ký tự Service Tag)
          const dellRegex = /\b[A-Z0-9]{7}\b/gi;
          let dellMatch;
          while ((dellMatch = dellRegex.exec(ocrText)) !== null) {
            const snFound = isValidSerialNumber(dellMatch[0]);
            if (snFound && !results.some(r => r.serial === snFound)) {
              results.push({
                serial: snFound,
                method: 'AI OCR (Định Dạng Dell/Phổ Thông)',
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
  async function processBatchImageBlobs(blobs) {
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
      progressText.innerHTML = `<i class="fa-solid fa-bolt text-warning me-1"></i> Đang phân tích song song ${totalImages} ảnh...`;
    }

    // XỬ LÝ SONG SONG TẬN DỤNG ĐA NHÂN CPU (PROMISE.ALL)
    const taskPromises = blobs.map(async (blob, index) => {
      try {
        const { results, thumbnailDataUrl } = await extractSerialsFromSingleBlob(blob);
        if (results && results.length > 0) {
          for (const item of results) {
            // Kiểm tra trùng trong danh sách hiện tại của bảng
            if (!extractedSerialsList.some(s => s.serial === item.serial)) {
              extractedSerialsList.push({
                id: 'sn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                serial: item.serial,
                method: item.method,
                previewUrl: item.thumbnailDataUrl || thumbnailDataUrl,
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
        feedbackBox.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Bóc tách thành công <strong>${newSerialsFound}</strong> số Serial từ ${totalImages} ảnh! Vui lòng kiểm tra và bấm "Đưa Toàn Bộ Serial Vào Phiếu".`;
      }
    } else {
      if (feedbackBox) {
        feedbackBox.className = 'p-2 rounded small text-center fw-semibold bg-warning-subtle text-warning mb-2';
        feedbackBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Không nhận diện được số Serial nào. Hãy đảm bảo tem ảnh rõ nét, đủ ánh sáng và chụp cận cảnh cụm Serial No.';
      }
    }

    renderExtractedSerialsTable();
  }

  /* ==================================================== */
  /* BẢNG ĐỐI SOÁT & DANH SÁCH SERIAL ĐÃ BÓC TÁCH        */
  /* ==================================================== */
  function renderExtractedSerialsTable() {
    const resultsContainer = document.getElementById('scanner-results-container');
    const tbody = document.getElementById('scanner-extracted-tbody');
    const totalCountEl = document.getElementById('scanner-total-extracted');
    const submitBtn = document.getElementById('btn-submit-extracted-serials');

    if (!tbody || !totalCountEl || !resultsContainer || !submitBtn) return;

    totalCountEl.textContent = extractedSerialsList.length;

    if (extractedSerialsList.length === 0) {
      resultsContainer.style.display = 'none';
      submitBtn.disabled = true;
      tbody.innerHTML = '';
      return;
    }

    resultsContainer.style.display = 'block';
    submitBtn.disabled = false;

    tbody.innerHTML = extractedSerialsList.map((item, idx) => {
      const badgeClass = item.method.includes('GPU') ? 'bg-primary' : (item.method.includes('OCR') ? 'bg-success' : 'bg-info text-dark');
      const thumbHtml = item.previewUrl
        ? `<img src="${item.previewUrl}" alt="Tem" style="height: 34px; width: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;">`
        : `<span class="badge bg-light text-muted border">No img</span>`;

      return `
        <tr>
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

  function updateExtractedSerialValue(id, newVal) {
    const item = extractedSerialsList.find(s => s.id === id);
    if (item) {
      item.serial = (newVal || '').trim().toUpperCase();
    }
  }

  function deleteExtractedSerial(id) {
    extractedSerialsList = extractedSerialsList.filter(s => s.id !== id);
    renderExtractedSerialsTable();
  }

  function clearExtractedSerials() {
    extractedSerialsList = [];
    renderExtractedSerialsTable();
    const feedbackBox = document.getElementById('scanner-feedback-box');
    if (feedbackBox) {
      feedbackBox.className = 'p-2 rounded small text-center fw-semibold bg-light text-muted mb-2';
      feedbackBox.innerHTML = '<i class="fa-solid fa-circle-info me-1 text-primary"></i> Đã xóa danh sách Serial bóc tách.';
    }
  }

  /* ==================================================== */
  /* ĐƯA TOÀN BỘ SERIAL VÀO PHIẾU THEO NGỮ CẢNH           */
  /* ==================================================== */
  function submitExtractedSerialsToContext() {
    if (extractedSerialsList.length === 0) return;

    const validSerials = extractedSerialsList
      .map(s => (s.serial || '').trim().toUpperCase())
      .filter(s => s.length >= 4);

    if (validSerials.length === 0) {
      alert('Không có mã Serial nào hợp lệ để đưa vào phiếu!');
      return;
    }

    if (CURRENT_SCAN_CONTEXT === 'NHAP_KHO_SINGLE') {
      const textarea = document.getElementById('nhap-serial-input');
      if (textarea) {
        const curVal = textarea.value.trim();
        const addedText = validSerials.join('\n');
        textarea.value = curVal ? `${curVal}\n${addedText}` : addedText;
        if (typeof updateNhapSerialCounter === 'function') {
          updateNhapSerialCounter();
        }
      }
    } else if (CURRENT_SCAN_CONTEXT === 'XUAT_KHO') {
      if (typeof addSerialToXuatDraft === 'function') {
        validSerials.forEach(sn => addSerialToXuatDraft(sn));
      }
    } else if (CURRENT_SCAN_CONTEXT === 'INVENTORY_SESSION') {
      if (typeof addSerialToInventorySession === 'function') {
        validSerials.forEach(sn => addSerialToInventorySession(sn));
      }
    } else if (CURRENT_SCAN_CONTEXT === 'SERIAL_360') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('serial-360-search-input');
      if (inp) inp.value = firstSn;
      if (typeof switchTab === 'function') switchTab('Serial360');
      if (typeof lookupSerial360 === 'function') lookupSerial360(firstSn);
    } else if (CURRENT_SCAN_CONTEXT === 'GLOBAL_SEARCH') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('global-search-input');
      if (inp) inp.value = firstSn;
      if (typeof handleGlobalSearch === 'function') handleGlobalSearch(firstSn);
    } else if (CURRENT_SCAN_CONTEXT === 'WARRANTY_CASE') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('case-serial');
      if (inp) {
        inp.value = firstSn;
        if (typeof onWarrantySerialChange === 'function') onWarrantySerialChange(firstSn);
      }
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_LOOKUP') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('filter-stock-keyword');
      if (inp) {
        inp.value = firstSn;
        if (typeof applyStockFilter === 'function') applyStockFilter();
      }
    } else if (CURRENT_SCAN_CONTEXT === 'STOCK_ADJUSTMENT') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('adj-serial');
      if (inp) inp.value = firstSn;
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_CUSTOMER') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('return-cust-serial');
      if (inp) inp.value = firstSn;
    } else if (CURRENT_SCAN_CONTEXT === 'RETURN_SUPPLIER') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('return-supp-serial');
      if (inp) inp.value = firstSn;
    } else if (CURRENT_SCAN_CONTEXT === 'TRANSFER_WAREHOUSE') {
      const firstSn = validSerials[0];
      const inp = document.getElementById('transfer-serial');
      if (inp) inp.value = firstSn;
    }

    // Đóng Modal và thông báo thành công
    const modalEl = document.getElementById('scannerModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    showFloatingScannerToast(`✅ Đã nạp thành công <strong>${validSerials.length}</strong> số Serial vào phiếu!`);
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
    if (CURRENT_SCAN_CONTEXT === 'GLOBAL_SEARCH') {
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
      if (inp) inp.value = code;
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
        bottom: 24px;
        right: 24px;
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
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = htmlMsg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    if (window._scannerToastTimeout) clearTimeout(window._scannerToastTimeout);
    window._scannerToastTimeout = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
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
  }
