  /* ==================================================== */
  /* 8. NGHIỆP VỤ NHẬP KHO ĐA MODEL & EXCEL (YÊU CẦU B & A) */
  /* ==================================================== */

  let CURRENT_DRAFT_NHAP_ITEMS = [];
  let EXCEL_PARSED_ITEMS = [];

  function setupNhapKhoForm() {
    // 1. Điền danh sách NCC (chỉ lấy active)
    const nccSelect = document.getElementById('nhap-ncc');
    nccSelect.innerHTML = '';
    const activeSuppliers = INITIAL_SUPPLIERS.filter(s => s.active !== false);
    if (activeSuppliers.length === 0) {
      nccSelect.innerHTML = '<option value="">-- Chưa có NCC (Bấm + NCC) --</option>';
    } else {
      activeSuppliers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.tenTat;
        opt.textContent = `${s.tenTat} - ${s.tenDayDu}`;
        nccSelect.appendChild(opt);
      });
    }

    // 2. Điền danh sách Kho (từ INITIAL_WAREHOUSES)
    const khoSelect = document.getElementById('nhap-kho');
    khoSelect.innerHTML = '';
    const activeWarehouses = INITIAL_WAREHOUSES.filter(w => w.active !== false);
    if (activeWarehouses.length === 0) {
      khoSelect.innerHTML = '<option value="">-- Chưa có Kho (Vào Danh mục > Kho) --</option>';
    } else {
      activeWarehouses.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.tenKho;
        opt.textContent = w.tenKho;
        khoSelect.appendChild(opt);
      });
    }

    // 3. Điền danh sách Model (chỉ lấy active)
    const modelSelect = document.getElementById('nhap-select-model');
    modelSelect.innerHTML = '';
    const activeProducts = INITIAL_PRODUCTS.filter(p => p.active !== false);
    if (activeProducts.length === 0) {
      modelSelect.innerHTML = '<option value="">-- Chưa có Model (Bấm + Model) --</option>';
    } else {
      activeProducts.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.model;
        opt.textContent = `${p.model} (${p.nhom})`;
        modelSelect.appendChild(opt);
      });
    }

    // 4. Ngày hôm nay
    const today = getLocalDateStr();
    document.getElementById('nhap-ngay').value = today;

    // 5. Cập nhật info model đang chọn
    onSelectModelNhap();
    renderDraftNhapTable();
  }

  function onSelectModelNhap() {
    const modelVal = document.getElementById('nhap-select-model').value;
    const prod = INITIAL_PRODUCTS.find(p => p.model === modelVal);
    const infoBox = document.getElementById('nhap-model-info');
    if (prod) {
      infoBox.innerHTML = `
        <div class="fw-semibold text-primary">${prod.ten}</div>
        <div class="text-muted">Hãng: <strong>${prod.hang || '--'}</strong> | Nhóm: <strong>${prod.nhom}</strong> | BH mặc định: <strong>${prod.defaultBh} tháng</strong></div>
      `;
    } else {
      infoBox.innerHTML = '<span class="text-muted">Chưa chọn model</span>';
    }
  }

  function generateSequentialInternalIdsForInput() {
    const textarea = document.getElementById('nhap-serial-input');
    const lines = textarea.value.split('\n').filter(l => l.trim().length > 0);
    const count = lines.length > 0 ? lines.length : 3;

    Swal.fire({
      title: 'Tạo mã nội bộ Thành An?',
      text: `Hệ thống sẽ cấp ${count} mã nội bộ Thành An liên tiếp dạng TA-YYMMDD-XXXXXX tăng dần. Serial hãng in trên máy vẫn do quét hoặc dán.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: `Tạo ${count} mã nội bộ`,
      cancelButtonText: 'Hủy'
    }).then((res) => {
      if (res.isConfirmed) {
        let sampleGenerated = [];
        for (let i = 0; i < count; i++) {
          sampleGenerated.push(generateSequentialInternalAssetId());
        }
        Swal.fire({
          icon: 'success',
          title: 'Đã tạo sequence mã nội bộ!',
          html: `<p class="small text-muted mb-2">Các mã nội bộ Thành An liên tiếp vừa sinh:</p><div class="p-2 bg-light font-monospace small text-start border rounded">${sampleGenerated.join('<br>')}</div><small class="text-primary mt-2 d-block">Khi đưa vào Draft, hệ thống sẽ tự động gán mã nội bộ cho từng Serial hãng.</small>`
        });
      }
    });
  }

  function updateNhapSerialCounter() {
    const text = document.getElementById('nhap-serial-input').value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    document.getElementById('nhap-serial-counter').textContent = `Đã nhập: ${lines.length} Serial`;
  }
  document.getElementById('nhap-serial-input').addEventListener('input', updateNhapSerialCounter);

  function addModelToDraftList() {
    const model = document.getElementById('nhap-select-model').value;
    const kho = document.getElementById('nhap-kho').value;
    const text = document.getElementById('nhap-serial-input').value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      Swal.fire('Thiếu dữ liệu', 'Vui lòng nhập hoặc quét ít nhất một Serial hãng in trên máy!', 'warning');
      return;
    }

    const prod = INITIAL_PRODUCTS.find(p => p.model === model);
    let addedCount = 0;
    let duplicateErrors = [];

    lines.forEach((mfgSerial, idx) => {
      const valResult = validateSerialUniqueness(mfgSerial, model, CURRENT_DRAFT_NHAP_ITEMS);
      const internalId = generateSequentialInternalAssetId();

      if (!valResult.valid) {
        duplicateErrors.push({
          serial: mfgSerial,
          line: idx + 1,
          model: model,
          message: valResult.message
        });
      }

      CURRENT_DRAFT_NHAP_ITEMS.push({
        id: 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        model: model,
        tenHang: prod ? prod.ten : model,
        nhom: prod ? prod.nhom : 'Thiết bị',
        serial: mfgSerial,
        internalId: internalId,
        kho: kho,
        isValid: valResult.valid,
        errorMessage: valResult.valid ? '' : valResult.message
      });
      addedCount++;
    });

    document.getElementById('nhap-serial-input').value = '';
    updateNhapSerialCounter();
    renderDraftNhapTable();

    if (duplicateErrors.length > 0) {
      playBeepSound();
      Swal.fire({
        icon: 'error',
        title: `Phát hiện ${duplicateErrors.length} Serial trùng lặp!`,
        html: `
          <div class="text-start small p-2 bg-light border rounded" style="max-height: 200px; overflow-y: auto;">
            ${duplicateErrors.map(e => `<div><strong>${e.serial}</strong> (Dòng ${e.line}, Model: ${e.model}): <span class="text-danger">${e.message}</span></div>`).join('')}
          </div>
          <p class="small text-danger mt-2 mb-0">Hệ thống sẽ KHÔNG cho phép Xác nhận phiếu nếu còn Serial bị trùng!</p>
        `
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Đã thêm vào Draft',
        text: `Đã đưa ${addedCount} thiết bị của Model "${model}" vào danh sách chờ nhập kho.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  function renderDraftNhapTable() {
    const tbody = document.getElementById('draft-nhap-table-body');
    const badge = document.getElementById('draft-nhap-total-badge');
    const summaryBox = document.getElementById('nhap-validation-summary-box');
    const confirmBtn = document.getElementById('btn-confirm-nhap');

    badge.textContent = `${CURRENT_DRAFT_NHAP_ITEMS.length} máy`;

    if (CURRENT_DRAFT_NHAP_ITEMS.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Chưa có thiết bị nào trong draft phiếu nhập</td></tr>';
      summaryBox.innerHTML = '';
      confirmBtn.disabled = true;
      return;
    }

    const distinctModels = new Set(CURRENT_DRAFT_NHAP_ITEMS.map(i => i.model)).size;
    const totalCount = CURRENT_DRAFT_NHAP_ITEMS.length;
    const errorCount = CURRENT_DRAFT_NHAP_ITEMS.filter(i => !i.isValid).length;
    const validCount = totalCount - errorCount;

    if (errorCount > 0) {
      summaryBox.innerHTML = `
        <span class="text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation"></i> Có ${errorCount} Serial lỗi/trùng</span> | 
        <span class="text-success">${validCount} hợp lệ</span> | 
        <span>${distinctModels} Model (${totalCount} máy)</span>
      `;
      confirmBtn.disabled = true;
      confirmBtn.classList.replace('btn-primary', 'btn-secondary');
      confirmBtn.title = 'Vui lòng xóa các Serial bị trùng/lỗi trước khi Xác nhận phiếu';
    } else {
      summaryBox.innerHTML = `
        <span class="text-success fw-bold"><i class="fa-solid fa-circle-check"></i> ${validCount}/${totalCount} Serial hợp lệ 100%</span> | 
        <span>${distinctModels} Model</span>
      `;
      confirmBtn.disabled = false;
      confirmBtn.classList.replace('btn-secondary', 'btn-primary');
      confirmBtn.title = '';
    }

    let html = '';
    CURRENT_DRAFT_NHAP_ITEMS.forEach((item, idx) => {
      html += `
        <tr class="${!item.isValid ? 'table-danger' : ''}">
          <td data-label="#">${idx + 1}</td>
          <td data-label="Model"><strong class="text-primary">${item.model}</strong></td>
          <td data-label="Serial Hãng"><span class="font-monospace fw-bold">${item.serial}</span></td>
          <td data-label="Mã Nội Bộ"><span class="badge bg-secondary font-monospace">${item.internalId}</span></td>
          <td data-label="Kho Nhập">${item.kho}</td>
          <td data-label="Validation">
            ${item.isValid 
              ? '<span class="badge bg-success"><i class="fa-solid fa-check"></i> Hợp lệ</span>' 
              : `<span class="badge bg-danger mb-1"><i class="fa-solid fa-xmark"></i> Trùng lặp</span><br><small class="text-danger">${item.errorMessage}</small>`}
          </td>
          <td data-label="Thao Tác" class="text-end">
            <button class="btn btn-sm btn-outline-danger" onclick="removeDraftNhapItem('${item.id}')" title="Xóa máy này">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  function removeDraftNhapItem(id) {
    CURRENT_DRAFT_NHAP_ITEMS = CURRENT_DRAFT_NHAP_ITEMS.filter(i => i.id !== id);
    CURRENT_DRAFT_NHAP_ITEMS.forEach(it => {
      const otherDrafts = CURRENT_DRAFT_NHAP_ITEMS.filter(x => x.id !== it.id);
      const res = validateSerialUniqueness(it.serial, it.model, otherDrafts);
      it.isValid = res.valid;
      it.errorMessage = res.valid ? '' : res.message;
    });
    renderDraftNhapTable();
  }

  function clearDraftNhapList() {
    if (CURRENT_DRAFT_NHAP_ITEMS.length === 0) return;
    Swal.fire({
      title: 'Xóa toàn bộ Draft?',
      text: 'Toàn bộ danh sách thiết bị đang chờ trong phiếu nhập sẽ bị xóa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(r => {
      if (r.isConfirmed) {
        CURRENT_DRAFT_NHAP_ITEMS = [];
        renderDraftNhapTable();
      }
    });
  }

  function saveDraftNhapVoucher(isConfirmed) {
    if (typeof window !== 'undefined' && window.CURRENT_DRAFT_NHAP_ITEMS && window.CURRENT_DRAFT_NHAP_ITEMS.length > 0) {
      CURRENT_DRAFT_NHAP_ITEMS = window.CURRENT_DRAFT_NHAP_ITEMS;
    }
    if (CURRENT_DRAFT_NHAP_ITEMS.length === 0) {
      Swal.fire('Chưa có thiết bị', 'Vui lòng thêm ít nhất một Model và Serial vào phiếu nhập!', 'warning');
      return;
    }

    if (isConfirmed) {
      const hasErrors = CURRENT_DRAFT_NHAP_ITEMS.some(i => !i.isValid);
      if (hasErrors) {
        playBeepSound();
        Swal.fire('Không thể xác nhận!', 'Còn Serial bị trùng lặp hoặc không hợp lệ. Vui lòng kiểm tra và xử lý các dòng báo đỏ trước khi xác nhận nhập kho.', 'error');
        return;
      }
    }

    const ncc = document.getElementById('nhap-ncc').value;
    const kho = document.getElementById('nhap-kho').value;
    const ngay = formatDateDisplay(document.getElementById('nhap-ngay').value) || formatDateDisplay(getLocalDateStr());
    const ghiChu = document.getElementById('nhap-ghichu').value.trim();
    const maPhieu = generateVoucherCode('PN');
    const nowStr = `${ngay} ${new Date().toLocaleTimeString('vi-VN')}`;

    const voucherRecord = {
      maPhieu: maPhieu,
      ngay: ngay,
      createdAt: nowStr,
      updatedAt: '',
      updatedBy: '',
      ncc: ncc,
      kho: kho,
      status: isConfirmed ? 'CONFIRMED' : 'DRAFT',
      nguoiTao: CURRENT_USER_NAME,
      ghiChu: ghiChu,
      customFields: {},
      items: CURRENT_DRAFT_NHAP_ITEMS.map(i => ({
        model: i.model,
        serial: i.serial,
        internalId: i.internalId,
        kho: i.kho
      })),
      history: [
        { time: nowStr, user: CURRENT_USER_NAME, action: isConfirmed ? 'TẠO PHIẾU' : 'LƯU NHÁP', note: isConfirmed ? `Khởi tạo phiếu nhập CONFIRMED từ NCC ${ncc}` : 'Lưu nháp DRAFT phiếu nhập' }
      ]
    };

    VOUCHERS_DB.nhap.unshift(voucherRecord);

    if (isConfirmed) {
      CURRENT_DRAFT_NHAP_ITEMS.forEach(item => {
        const prod = INITIAL_PRODUCTS.find(p => p.model === item.model);
        SERIAL_DB.unshift({
          serial: item.serial,
          internalId: item.internalId,
          model: item.model,
          tenHang: item.tenHang,
          nhom: item.nhom,
          kho: item.kho,
          ncc: ncc,
          ngayNhap: ngay,
          maPhieuNhap: maPhieu,
          status: 'IN_STOCK',
          ngayXuat: '',
          maPhieuXuat: '',
          khachHang: '',
          sdtKhach: '',
          soThangBh: prod ? prod.defaultBh : 12,
          ngayHetHanBh: '',
          ghiChu: ghiChu,
          customFields: {},
          timeline: [
            { date: nowStr, user: CURRENT_USER_NAME, action: 'Nhập kho', note: `Nhập kho theo phiếu ${maPhieu} từ NCC ${ncc}` }
          ]
        });
      });

      recordAuditLog('XÁC NHẬN NHẬP KHO', `Phiếu ${maPhieu} (${CURRENT_DRAFT_NHAP_ITEMS.length} máy)`, 'DRAFT', 'CONFIRMED', `Nhập kho từ ${ncc}`, [], 'Nhập kho', '', maPhieu);
      if (typeof markModulesDirty === 'function') {
        markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'Serial360']);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Nhập kho thành công!',
        html: `Phiếu nhập <strong>${maPhieu}</strong> đã được ghi nhận vào kho thật.<br>Số lượng: <strong>${CURRENT_DRAFT_NHAP_ITEMS.length} thiết bị</strong>.<br>Trạng thái: <span class="badge bg-success">CONFIRMED</span>`
      });
    } else {
      recordAuditLog('LƯU NHÁP PHIẾU NHẬP', `Phiếu ${maPhieu} (${CURRENT_DRAFT_NHAP_ITEMS.length} máy)`, 'None', 'DRAFT', 'Lưu nháp chờ hoàn tất', [], 'Nhập kho', '', maPhieu);
      if (typeof markModulesDirty === 'function') {
        markModulesDirty(['Dashboard', 'LichSu']);
      }
      
      Swal.fire({
        icon: 'info',
        title: 'Đã lưu phiếu nháp (DRAFT)',
        html: `Phiếu <strong>${maPhieu}</strong> đã được lưu ở trạng thái nháp.<br>Chưa làm tăng tồn kho. Bạn có thể mở lại để tiếp tục chỉnh sửa.`
      });
    }

    CURRENT_DRAFT_NHAP_ITEMS = [];
    document.getElementById('nhap-ghichu').value = '';
    renderDraftNhapTable();
  }

  function fillSampleExcelPaste() {
    document.getElementById('nhap-excel-raw').value = 
`Canon LBP 2900\tCN2900-EX8801\n` +
`Canon LBP 2900\tCN2900-EX8802\n` +
`Canon LBP 6030w\tCN6030-EX9901\n` +
`Dell Vostro 3520\tDL3520-EX7701\n` +
`HP Pro 2000\tHP2000-EX6601\n` +
`Model Chưa Có Sẵn\tUNKNOWN-SN-01\n` +
`Canon LBP 2900\tCN2900-101101`;
  }

  function parseAndPreviewExcelPaste() {
    const rawText = document.getElementById('nhap-excel-raw').value.trim();
    if (!rawText) {
      Swal.fire('Chưa có dữ liệu', 'Vui lòng dán văn bản nhiều dòng hoặc copy từ Excel!', 'warning');
      return;
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    EXCEL_PARSED_ITEMS = [];
    let duplicateCount = 0;
    let unknownModelCount = 0;

    lines.forEach((line, idx) => {
      let parts = [];
      if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes('|')) parts = line.split('|');
      else if (line.includes(',')) parts = line.split(',');
      else parts = line.split(/\s{2,}/);

      const rawModel = (parts[0] || '').trim();
      const rawSerial = (parts[1] || '').trim();
      const rawInternal = (parts[2] || '').trim();

      const normalizedModel = rawModel.replace(/\s+/g, ' ');
      const normalizedSerial = rawSerial.replace(/\s+/g, '');

      const existingProd = INITIAL_PRODUCTS.find(p => p.model.toLowerCase() === normalizedModel.toLowerCase());
      const isModelValid = !!existingProd;
      if (!isModelValid) unknownModelCount++;

      const valRes = validateSerialUniqueness(normalizedSerial, normalizedModel, EXCEL_PARSED_ITEMS);
      const isSerialValid = valRes.valid;
      if (!isSerialValid) duplicateCount++;

      const internalId = rawInternal || generateSequentialInternalAssetId();

      EXCEL_PARSED_ITEMS.push({
        lineNum: idx + 1,
        model: existingProd ? existingProd.model : normalizedModel,
        tenHang: existingProd ? existingProd.ten : normalizedModel,
        nhom: existingProd ? existingProd.nhom : 'Chưa phân nhóm',
        serial: normalizedSerial,
        internalId: internalId,
        isModelValid: isModelValid,
        isSerialValid: isSerialValid,
        errorMessage: !isModelValid ? 'Model chưa tồn tại trong danh mục' : (!isSerialValid ? valRes.message : '')
      });
    });

    const totalLines = EXCEL_PARSED_ITEMS.length;
    const validLines = EXCEL_PARSED_ITEMS.filter(i => i.isModelValid && i.isSerialValid).length;
    const distinctModels = new Set(EXCEL_PARSED_ITEMS.map(i => i.model)).size;

    const statsBox = document.getElementById('excel-summary-stats-box');
    statsBox.innerHTML = `
      <div class="col-3">
        <div class="p-2 border rounded bg-light">
          <small class="text-muted d-block">Tổng Số Dòng</small>
          <strong class="fs-6">${totalLines}</strong> (${distinctModels} Model)
        </div>
      </div>
      <div class="col-3">
        <div class="p-2 border rounded bg-success-subtle">
          <small class="text-success fw-bold d-block">Hợp Lệ 100%</small>
          <strong class="fs-6 text-success">${validLines}</strong>
        </div>
      </div>
      <div class="col-3">
        <div class="p-2 border rounded bg-danger-subtle">
          <small class="text-danger fw-bold d-block">Serial Trùng</small>
          <strong class="fs-6 text-danger">${duplicateCount}</strong>
        </div>
      </div>
      <div class="col-3">
        <div class="p-2 border rounded bg-warning-subtle">
          <small class="text-warning fw-bold d-block">Model Chưa Có</small>
          <strong class="fs-6 text-warning">${unknownModelCount}</strong>
        </div>
      </div>
    `;

    const tbody = document.getElementById('excel-preview-table-body');
    let html = '';
    EXCEL_PARSED_ITEMS.forEach(it => {
      const hasError = !it.isModelValid || !it.isSerialValid;
      html += `
        <tr class="${hasError ? 'table-danger' : ''}">
          <td>${it.lineNum}</td>
          <td>
            <strong>${it.model}</strong>
            ${!it.isModelValid ? '<span class="badge bg-warning text-dark ms-1">Mới</span>' : ''}
          </td>
          <td><span class="font-monospace fw-bold">${it.serial}</span></td>
          <td><span class="font-monospace badge bg-secondary">${it.internalId}</span></td>
          <td>
            ${!hasError 
              ? '<span class="badge bg-success"><i class="fa-solid fa-check"></i> Hợp lệ</span>' 
              : `<span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> ${it.errorMessage}</span>`}
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

    const directConfirmBtn = document.getElementById('btn-excel-direct-confirm');
    if (duplicateCount > 0 || unknownModelCount > 0) {
      directConfirmBtn.disabled = true;
      directConfirmBtn.title = 'Còn lỗi Serial trùng hoặc Model chưa có';
    } else {
      directConfirmBtn.disabled = false;
      directConfirmBtn.title = '';
    }

    const modal = new bootstrap.Modal(document.getElementById('previewExcelNhapModal'));
    modal.show();
  }

  function applyExcelParsedToDraft(isDirectConfirm) {
    if (EXCEL_PARSED_ITEMS.length === 0) return;

    const kho = document.getElementById('nhap-kho').value;
    const modalEl = document.getElementById('previewExcelNhapModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    EXCEL_PARSED_ITEMS.forEach(it => {
      CURRENT_DRAFT_NHAP_ITEMS.push({
        id: 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        model: it.model,
        tenHang: it.tenHang,
        nhom: it.nhom,
        serial: it.serial,
        internalId: it.internalId,
        kho: kho,
        isValid: it.isModelValid && it.isSerialValid,
        errorMessage: it.errorMessage
      });
    });

    const tabTrigger = new bootstrap.Tab(document.getElementById('tab-nhap-model-btn'));
    tabTrigger.show();
    renderDraftNhapTable();

    if (isDirectConfirm) {
      saveDraftNhapVoucher(true);
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Đã đưa vào Draft!',
        text: `Đã chuyển ${EXCEL_PARSED_ITEMS.length} dòng từ Excel vào danh sách chờ kiểm tra.`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  function openQuickAddModelModal() {
    document.getElementById('quick-model-name').value = '';
    document.getElementById('quick-model-desc').value = '';
    document.getElementById('quick-model-warranty').value = '12';

    // Đổ danh sách Hãng vào select
    const brandSelect = document.getElementById('quick-model-brand');
    brandSelect.innerHTML = '';
    INITIAL_BRANDS.filter(b => b.active !== false).forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.maHang;
      opt.textContent = `${b.maHang} (${b.tenHang})`;
      brandSelect.appendChild(opt);
    });

    // Đổ danh sách Nhóm vào select
    const catSelect = document.getElementById('quick-model-category');
    catSelect.innerHTML = '';
    INITIAL_CATEGORIES.filter(c => c.active !== false).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.tenNhom;
      opt.textContent = c.tenNhom;
      catSelect.appendChild(opt);
    });

    const modal = new bootstrap.Modal(document.getElementById('quickAddModelModal'));
    modal.show();
  }

  function submitQuickAddModel() {
    const model = document.getElementById('quick-model-name').value.trim();
    const ten = document.getElementById('quick-model-desc').value.trim();
    const hang = document.getElementById('quick-model-brand').value;
    const nhom = document.getElementById('quick-model-category').value;
    const defaultBh = parseInt(document.getElementById('quick-model-warranty').value) || 12;
    const manageSerial = document.getElementById('quick-model-serial-track').value === 'true';

    if (!model || !ten) {
      Swal.fire('Thiếu dữ liệu', 'Vui lòng nhập mã Model và Tên sản phẩm!', 'warning');
      return;
    }

    if (INITIAL_PRODUCTS.some(p => p.model.toLowerCase() === model.toLowerCase())) {
      Swal.fire('Đã tồn tại', `Model "${model}" đã có sẵn trong danh mục!`, 'info');
      return;
    }

    const prdId = `PRD-${String(INITIAL_PRODUCTS.length + 1).padStart(3, '0')}`;
    const newProd = {
      productId: prdId,
      model: model,
      ten: ten,
      hang: hang,
      nhom: nhom,
      defaultBh: defaultBh,
      manageSerial: manageSerial,
      ghiChu: 'Thêm mới từ hệ thống',
      active: true
    };
    INITIAL_PRODUCTS.push(newProd);

    // Cập nhật lại dropdown và tự chọn bản ghi vừa thêm (Yêu cầu B5)
    const select = document.getElementById('nhap-select-model');
    if (select) {
      const opt = document.createElement('option');
      opt.value = model;
      opt.textContent = `${model} (${nhom})`;
      opt.selected = true;
      select.appendChild(opt);
      onSelectModelNhap();
    }

    recordAuditLog('THÊM MODEL MỚI', `Model ${model} (${prdId})`, 'None', `${ten} (${defaultBh}th)`, 'Thêm vào danh mục sản phẩm', [], 'Danh mục');

    const modalEl = document.getElementById('quickAddModelModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['DanhMuc', 'NhapKho', 'XuatKho']);
    }
    if (typeof renderCatalogProductsTable === 'function') renderCatalogProductsTable();

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm Model!',
      text: `Model "${model}" (${prdId}) đã được lưu thành công.`,
      timer: 1500,
      showConfirmButton: false
    });
  }

  function openQuickAddSupplierModal() {
    document.getElementById('quick-ncc-code').value = '';
    document.getElementById('quick-ncc-name').value = '';
    document.getElementById('quick-ncc-phone').value = '';
    document.getElementById('quick-ncc-email').value = '';
    document.getElementById('quick-ncc-address').value = '';
    const modal = new bootstrap.Modal(document.getElementById('quickAddSupplierModal'));
    modal.show();
  }

  function submitQuickAddSupplier() {
    const code = document.getElementById('quick-ncc-code').value.trim();
    const name = document.getElementById('quick-ncc-name').value.trim();
    const phone = document.getElementById('quick-ncc-phone').value.trim();
    const email = document.getElementById('quick-ncc-email').value.trim();
    const address = document.getElementById('quick-ncc-address').value.trim();

    if (!code || !name) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập mã viết tắt và tên nhà cung cấp!', 'warning');
      return;
    }

    const supId = `SUP-${String(INITIAL_SUPPLIERS.length + 1).padStart(3, '0')}`;
    const newSup = {
      supplierId: supId,
      tenTat: code,
      tenDayDu: name,
      sdt: phone,
      email: email,
      diaChi: address,
      nguoiLienHe: '',
      mst: '',
      ghiChu: 'Thêm mới từ hệ thống',
      active: true
    };
    INITIAL_SUPPLIERS.push(newSup);

    const select = document.getElementById('nhap-ncc');
    if (select) {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${code} - ${name}`;
      opt.selected = true;
      select.appendChild(opt);
    }

    recordAuditLog('THÊM NCC MỚI', `NCC ${code} (${supId})`, 'None', name, 'Thêm vào danh mục NCC', [], 'Danh mục');

    const modalEl = document.getElementById('quickAddSupplierModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['DanhMuc', 'NhapKho', 'XuatKho']);
    }
    if (typeof renderCatalogSuppliersTable === 'function') renderCatalogSuppliersTable();

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm Nhà cung cấp!',
      text: `NCC "${code}" (${supId}) đã được lưu thành công.`,
      timer: 1500,
      showConfirmButton: false
    });
  }
