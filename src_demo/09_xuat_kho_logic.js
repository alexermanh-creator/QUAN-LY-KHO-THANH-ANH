  /* ==================================================== */
  /* 9. NGHIỆP VỤ XUẤT KHO & BẢO HÀNH RIÊNG TỪNG SERIAL (YÊU CẦU C & 4.3) */
  /* ==================================================== */

  let CURRENT_DRAFT_XUAT_ITEMS = [];

  function setupXuatKhoForm() {
    const custSelect = document.getElementById('xuat-khach-select');
    const activeCustomers = INITIAL_CUSTOMERS.filter(c => c.active !== false);
    if (activeCustomers.length === 0) {
      custSelect.innerHTML = '<option value="">-- Chưa có Khách hàng (Bấm + Thêm KH) --</option>';
    } else {
      custSelect.innerHTML = '<option value="">-- Chọn khách hàng --</option>';
      activeCustomers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.ten;
        opt.textContent = `${c.ten} (${c.sdt})`;
        custSelect.appendChild(opt);
      });
    }

    const today = getLocalDateStr();
    document.getElementById('xuat-ngay').value = today;

    renderDraftXuatTable();
  }

  function onSelectKhachHangXuat() {
    const custName = document.getElementById('xuat-khach-select').value;
    const cust = INITIAL_CUSTOMERS.find(c => c.ten === custName);
    if (cust) {
      document.getElementById('xuat-sdt').value = cust.sdt;
      document.getElementById('xuat-diachi').value = cust.diaChi;
    } else {
      document.getElementById('xuat-sdt').value = '';
      document.getElementById('xuat-diachi').value = '';
    }
  }

  // Thêm khách hàng nhanh ngay tại form Xuất kho (Yêu cầu 4.3)
  function openQuickAddCustomerModal() {
    document.getElementById('quick-cust-name').value = '';
    document.getElementById('quick-cust-phone').value = '';
    document.getElementById('quick-cust-address').value = '';
    document.getElementById('quick-cust-contact').value = '';
    const modal = new bootstrap.Modal(document.getElementById('quickAddCustomerModal'));
    modal.show();
  }

  function submitQuickAddCustomer() {
    const name = document.getElementById('quick-cust-name').value.trim();
    const phone = document.getElementById('quick-cust-phone').value.trim();
    const address = document.getElementById('quick-cust-address').value.trim();
    const contact = document.getElementById('quick-cust-contact').value.trim();

    if (!name || !phone) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập Tên khách hàng và Số điện thoại!', 'warning');
      return;
    }

    const custId = `CUS-${String(INITIAL_CUSTOMERS.length + 1).padStart(3, '0')}`;
    const newCust = {
      customerId: custId,
      ten: name,
      sdt: phone,
      email: '',
      diaChi: address,
      nguoiLienHe: contact,
      mst: '',
      ghiChu: 'Thêm nhanh từ form xuất kho',
      active: true
    };

    INITIAL_CUSTOMERS.push(newCust);
    recordAuditLog('THÊM KHÁCH HÀNG NHANH', `${name} (${phone})`, 'None', custId, 'Thêm nhanh tại Xuất kho');

    // Cập nhật lại dropdown và tự chọn bản ghi vừa thêm mà không làm mất draft (Yêu cầu 4.3)
    const custSelect = document.getElementById('xuat-khach-select');
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `${name} (${phone})`;
    opt.selected = true;
    custSelect.appendChild(opt);

    document.getElementById('xuat-sdt').value = phone;
    document.getElementById('xuat-diachi').value = address;

    const modalEl = document.getElementById('quickAddCustomerModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['DanhMuc', 'NhapKho', 'XuatKho']);
    }
    if (typeof renderCatalogCustomersTable === 'function') renderCatalogCustomersTable();

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm Khách hàng!',
      text: `Khách hàng "${name}" đã được thêm và chọn cho phiếu xuất hiện tại.`,
      timer: 1500,
      showConfirmButton: false
    });
  }

  function addSerialToXuatDraft(rawInput) {
    const sn = (rawInput || '').trim();
    if (!sn) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập hoặc quét Serial hãng / Mã nội bộ!', 'warning');
      return;
    }

    const target = SERIAL_DB.find(s => 
      s.serial.toLowerCase() === sn.toLowerCase() || 
      (s.internalId && s.internalId.toLowerCase() === sn.toLowerCase())
    );

    if (!target) {
      playBeepSound();
      Swal.fire('Không tìm thấy', `Serial hoặc Mã nội bộ "${sn}" chưa từng xuất hiện trong hệ thống kho!`, 'error');
      return;
    }

    if (target.status !== 'IN_STOCK') {
      playBeepSound();
      let reason = target.status;
      if (target.status === 'SOLD') reason = `Máy này đã được xuất bán cho khách "${target.khachHang}" theo phiếu ${target.maPhieuXuat} ngày ${target.ngayXuat}`;
      else if (target.status === 'IN_WARRANTY') reason = 'Máy này hiện đang trong quá trình bảo hành, không có sẵn trong kho';
      else if (target.status === 'CANCELLED_IMPORT') reason = 'Serial này thuộc phiếu nhập đã bị hủy';

      Swal.fire({
        icon: 'warning',
        title: 'Không thể xuất thiết bị này!',
        html: `<p class="mb-1">Serial: <strong class="font-monospace text-primary">${target.serial}</strong> (${target.model})</p><p class="text-danger small mb-0">Lý do: ${reason}</p>`
      });
      return;
    }

    const alreadyInList = CURRENT_DRAFT_XUAT_ITEMS.some(i => i.serial.toLowerCase() === target.serial.toLowerCase());
    if (alreadyInList) {
      playBeepSound();
      Swal.fire('Trùng lặp', `Serial ${target.serial} đã có trong danh sách chuẩn bị xuất của phiếu này!`, 'info');
      return;
    }

    const prod = INITIAL_PRODUCTS.find(p => p.model === target.model);
    const defaultWarranty = prod ? prod.defaultBh : (target.soThangBh || 12);
    const ngayXuat = document.getElementById('xuat-ngay').value;
    const expiryDate = calculateExpiryDate(ngayXuat, defaultWarranty);

    CURRENT_DRAFT_XUAT_ITEMS.push({
      id: 'xuat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      serial: target.serial,
      internalId: target.internalId,
      model: target.model,
      kho: target.kho,
      soThangBh: defaultWarranty,
      ngayHetHanBh: expiryDate
    });

    document.getElementById('xuat-serial-input').value = '';
    renderDraftXuatTable();
    playBeepSound();
  }

  function updateXuatItemWarranty(itemId, months) {
    const item = CURRENT_DRAFT_XUAT_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    const m = parseInt(months) || 0;
    item.soThangBh = m;
    const ngayXuat = document.getElementById('xuat-ngay').value;
    item.ngayHetHanBh = calculateExpiryDate(ngayXuat, m);
    renderDraftXuatTable();
  }

  function removeDraftXuatItem(id) {
    CURRENT_DRAFT_XUAT_ITEMS = CURRENT_DRAFT_XUAT_ITEMS.filter(i => i.id !== id);
    renderDraftXuatTable();
  }

  function clearDraftXuatList() {
    if (CURRENT_DRAFT_XUAT_ITEMS.length === 0) return;
    Swal.fire({
      title: 'Xóa toàn bộ danh sách xuất?',
      text: 'Toàn bộ thiết bị đang chuẩn bị xuất sẽ được bỏ chọn.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then(r => {
      if (r.isConfirmed) {
        CURRENT_DRAFT_XUAT_ITEMS = [];
        renderDraftXuatTable();
      }
    });
  }

  function renderDraftXuatTable() {
    const tbody = document.getElementById('draft-xuat-table-body');
    const badge = document.getElementById('draft-xuat-total-badge');
    badge.textContent = `${CURRENT_DRAFT_XUAT_ITEMS.length} máy`;

    if (CURRENT_DRAFT_XUAT_ITEMS.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Chưa có thiết bị nào được chọn để xuất</td></tr>';
      return;
    }

    let html = '';
    CURRENT_DRAFT_XUAT_ITEMS.forEach((item, idx) => {
      html += `
        <tr>
          <td data-label="#">${idx + 1}</td>
          <td data-label="Model"><strong class="text-primary">${item.model}</strong></td>
          <td data-label="Serial Hãng"><span class="font-monospace fw-bold">${item.serial}</span></td>
          <td data-label="Mã Nội Bộ"><span class="badge bg-secondary font-monospace">${item.internalId}</span></td>
          <td data-label="Kho Xuất">${item.kho}</td>
          <td data-label="Gói Bảo Hành">
            <select class="form-select form-select-sm" style="width: auto; min-width: 120px;" onchange="updateXuatItemWarranty('${item.id}', this.value)">
              <option value="0" ${item.soThangBh === 0 ? 'selected' : ''}>0 tháng (Không BH)</option>
              <option value="1" ${item.soThangBh === 1 ? 'selected' : ''}>1 tháng</option>
              <option value="3" ${item.soThangBh === 3 ? 'selected' : ''}>3 tháng</option>
              <option value="6" ${item.soThangBh === 6 ? 'selected' : ''}>6 tháng</option>
              <option value="12" ${item.soThangBh === 12 ? 'selected' : ''}>12 tháng (1 năm)</option>
              <option value="24" ${item.soThangBh === 24 ? 'selected' : ''}>24 tháng (2 năm)</option>
              <option value="36" ${item.soThangBh === 36 ? 'selected' : ''}>36 tháng (3 năm)</option>
            </select>
          </td>
          <td data-label="Hạn Bảo Hành">
            <span class="badge ${item.soThangBh === 0 ? 'bg-secondary' : 'bg-primary'} font-monospace">
              ${item.ngayHetHanBh}
            </span>
          </td>
          <td data-label="Xóa" class="text-end">
            <button class="btn btn-sm btn-outline-danger" onclick="removeDraftXuatItem('${item.id}')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  function previewAndConfirmXuatVoucher() {
    if (CURRENT_DRAFT_XUAT_ITEMS.length === 0) {
      Swal.fire('Chưa có thiết bị', 'Vui lòng chọn ít nhất một máy để xuất kho!', 'warning');
      return;
    }

    const khach = document.getElementById('xuat-khach-select').value;
    const sdt = document.getElementById('xuat-sdt').value.trim();
    const diachi = document.getElementById('xuat-diachi').value.trim();
    const kho = document.getElementById('xuat-kho').value;
    const ngay = formatDateDisplay(document.getElementById('xuat-ngay').value) || formatDateDisplay(getLocalDateStr());

    if (!khach) {
      Swal.fire('Thiếu khách hàng', 'Vui lòng chọn hoặc nhập tên Khách hàng nhận máy!', 'warning');
      return;
    }

    document.getElementById('prev-xuat-khach').textContent = khach;
    document.getElementById('prev-xuat-sdt').textContent = sdt || 'Chưa có SĐT';
    document.getElementById('prev-xuat-kho').textContent = kho;
    document.getElementById('prev-xuat-ngay').textContent = ngay;
    document.getElementById('prev-xuat-diachi').textContent = diachi || 'Nhận tại văn phòng Thành An';

    const tbody = document.getElementById('prev-xuat-table-body');
    let html = '';
    let hasInvalid = false;

    CURRENT_DRAFT_XUAT_ITEMS.forEach((it, idx) => {
      const curDb = SERIAL_DB.find(s => s.serial === it.serial);
      const isStillInStock = curDb && curDb.status === 'IN_STOCK';
      if (!isStillInStock) hasInvalid = true;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${it.model}</strong></td>
          <td><span class="font-monospace fw-bold">${it.serial}</span></td>
          <td><span class="badge bg-secondary font-monospace">${it.internalId}</span></td>
          <td>${it.soThangBh > 0 ? `${it.soThangBh} tháng` : '<span class="text-muted">Không BH</span>'}</td>
          <td class="font-monospace">${it.ngayHetHanBh}</td>
          <td>
            ${isStillInStock 
              ? '<span class="badge bg-success"><i class="fa-solid fa-check"></i> Đủ điều kiện xuất</span>' 
              : '<span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> Không khả dụng</span>'}
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

    const alertBox = document.getElementById('prev-xuat-alert-box');
    const confirmBtn = document.getElementById('btn-final-confirm-xuat');

    if (hasInvalid) {
      alertBox.innerHTML = '<div class="alert alert-danger p-2 small mb-0"><i class="fa-solid fa-triangle-exclamation me-1"></i> Có thiết bị không khả dụng trong kho. Vui lòng kiểm tra lại trước khi xuất!</div>';
      confirmBtn.disabled = true;
    } else {
      alertBox.innerHTML = '<div class="alert alert-success p-2 small mb-0"><i class="fa-solid fa-circle-check me-1"></i> Tất cả thiết bị đều hợp lệ và sẵn sàng xuất kho chính thức.</div>';
      confirmBtn.disabled = false;
    }

    const modal = new bootstrap.Modal(document.getElementById('previewXuatModal'));
    modal.show();
  }

  function executeConfirmXuatVoucher() {
    const khach = document.getElementById('xuat-khach-select').value;
    const sdt = document.getElementById('xuat-sdt').value.trim();
    const diachi = document.getElementById('xuat-diachi').value.trim();
    const kho = document.getElementById('xuat-kho').value;
    const ngay = formatDateDisplay(document.getElementById('xuat-ngay').value) || formatDateDisplay(getLocalDateStr());
    const maPhieu = generateVoucherCode('PX');
    const nowStr = `${ngay} ${new Date().toLocaleTimeString('vi-VN')}`;

    const voucherRecord = {
      maPhieu: maPhieu,
      ngay: ngay,
      createdAt: nowStr,
      updatedAt: '',
      updatedBy: '',
      khachHang: khach,
      sdtKhach: sdt,
      diaChi: diachi,
      kho: kho,
      status: 'CONFIRMED',
      nguoiTao: CURRENT_USER_NAME,
      ghiChu: 'Xuất bán khách hàng',
      customFields: {},
      items: CURRENT_DRAFT_XUAT_ITEMS.map(i => ({
        model: i.model,
        serial: i.serial,
        internalId: i.internalId,
        soThangBh: i.soThangBh,
        ngayHetHanBh: i.ngayHetHanBh
      })),
      history: [
        { time: nowStr, user: CURRENT_USER_NAME, action: 'TẠO PHIẾU', note: `Khởi tạo phiếu xuất CONFIRMED cho ${khach}` }
      ]
    };

    VOUCHERS_DB.xuat.unshift(voucherRecord);

    CURRENT_DRAFT_XUAT_ITEMS.forEach(it => {
      const serialItem = SERIAL_DB.find(s => s.serial === it.serial);
      if (serialItem) {
        serialItem.status = 'SOLD';
        serialItem.ngayXuat = ngay;
        serialItem.maPhieuXuat = maPhieu;
        serialItem.khachHang = khach;
        serialItem.sdtKhach = sdt;
        serialItem.soThangBh = it.soThangBh;
        serialItem.ngayHetHanBh = it.ngayHetHanBh;
        serialItem.timeline.unshift({
          date: nowStr,
          user: CURRENT_USER_NAME,
          action: 'Xuất kho',
          note: `Xuất cho khách "${khach}" (SĐT: ${sdt}) theo phiếu ${maPhieu}. Hạn BH: ${it.ngayHetHanBh}`
        });
      }
    });

    recordAuditLog('XÁC NHẬN XUẤT KHO', `Phiếu ${maPhieu} (${CURRENT_DRAFT_XUAT_ITEMS.length} máy)`, 'DRAFT', 'CONFIRMED', `Xuất bán cho ${khach}`, [], 'Xuất kho', '', maPhieu);
    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'Serial360']);
    }

    const modalEl = document.getElementById('previewXuatModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    CURRENT_DRAFT_XUAT_ITEMS = [];
    renderDraftXuatTable();

    Swal.fire({
      icon: 'success',
      title: 'Xuất kho thành công!',
      html: `Phiếu xuất <strong>${maPhieu}</strong> đã được ghi nhận.<br>Khách hàng: <strong>${khach}</strong> (${sdt})<br>Số lượng: <strong>${voucherRecord.items.length} thiết bị</strong>.`
    });
  }

  function saveDraftXuatVoucher(isConfirmed) {
    if (CURRENT_DRAFT_XUAT_ITEMS.length === 0) {
      Swal.fire('Chưa có thiết bị', 'Vui lòng chọn ít nhất một máy để lưu nháp!', 'warning');
      return;
    }

    const khach = document.getElementById('xuat-khach-select').value || 'Khách hàng dự thảo';
    const sdt = document.getElementById('xuat-sdt').value.trim();
    const diachi = document.getElementById('xuat-diachi').value.trim();
    const kho = document.getElementById('xuat-kho').value;
    const ngay = formatDateDisplay(document.getElementById('xuat-ngay').value) || formatDateDisplay(getLocalDateStr());
    const maPhieu = generateVoucherCode('PX');
    const nowStr = `${ngay} ${new Date().toLocaleTimeString('vi-VN')}`;

    const voucherRecord = {
      maPhieu: maPhieu,
      ngay: ngay,
      createdAt: nowStr,
      updatedAt: '',
      updatedBy: '',
      khachHang: khach,
      sdtKhach: sdt,
      diaChi: diachi,
      kho: kho,
      status: 'DRAFT',
      nguoiTao: CURRENT_USER_NAME,
      ghiChu: 'Lưu nháp xuất kho',
      customFields: {},
      items: CURRENT_DRAFT_XUAT_ITEMS.map(i => ({
        model: i.model,
        serial: i.serial,
        internalId: i.internalId,
        soThangBh: i.soThangBh,
        ngayHetHanBh: i.ngayHetHanBh
      })),
      history: [
        { time: nowStr, user: CURRENT_USER_NAME, action: 'LƯU NHÁP', note: `Lưu nháp phiếu xuất cho ${khach}` }
      ]
    };

    VOUCHERS_DB.xuat.unshift(voucherRecord);
    recordAuditLog('LƯU NHÁP PHIẾU XUẤT', `Phiếu ${maPhieu} (${CURRENT_DRAFT_XUAT_ITEMS.length} máy)`, 'None', 'DRAFT', 'Lưu nháp xuất kho', [], 'Xuất kho', '', maPhieu);
    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['Dashboard', 'LichSu']);
    }

    CURRENT_DRAFT_XUAT_ITEMS = [];
    renderDraftXuatTable();

    Swal.fire({
      icon: 'info',
      title: 'Đã lưu nháp phiếu xuất',
      html: `Phiếu <strong>${maPhieu}</strong> đã được lưu DRAFT. Chưa làm giảm tồn kho thật.`
    });
  }

  function openSelectStockModalForXuat() {
    const available = SERIAL_DB.filter(s => s.status === 'IN_STOCK');
    if (available.length === 0) {
      Swal.fire('Kho trống', 'Hiện tại không còn thiết bị nào ở trạng thái Tồn Kho (IN_STOCK)!', 'info');
      return;
    }

    let optionsHtml = available.map(s => `
      <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
        <div>
          <strong class="text-primary font-monospace">${s.serial}</strong> 
          <span class="badge bg-secondary font-monospace ms-1">${s.internalId}</span>
          <div class="small text-muted">${s.model} - ${s.kho} (Nhập: ${s.ngayNhap})</div>
        </div>
        <button class="btn btn-sm btn-outline-primary" onclick="addSerialToXuatDraft('${s.serial}')">
          <i class="fa-solid fa-plus"></i> Chọn
        </button>
      </div>
    `).join('');

    Swal.fire({
      title: 'Chọn thiết bị có sẵn trong kho',
      html: `<div class="text-start" style="max-height: 350px; overflow-y: auto;">${optionsHtml}</div>`,
      showConfirmButton: false,
      showCloseButton: true
    });
  }
