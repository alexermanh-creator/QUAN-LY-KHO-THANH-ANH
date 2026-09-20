  /* ==================================================== */
  /* 11. QUẢN LÝ BẢO HÀNH (WARRANTY CASES - YÊU CẦU H, A6 & DATE FILTERS) */
  /* ==================================================== */

  function setWarrantyPreset(preset) {
    const fromInput = document.getElementById('filter-warranty-from');
    const toInput = document.getElementById('filter-warranty-to');
    const statusSelect = document.getElementById('filter-warranty-status');
    const overdueSelect = document.getElementById('filter-warranty-overdue');
    const searchInput = document.getElementById('filter-warranty-search');
    if (!fromInput || !toInput) return;

    const todayStr = getLocalDateStr();

    // Reset các trường
    fromInput.value = '';
    toInput.value = '';
    if (statusSelect) statusSelect.value = '';
    if (overdueSelect) overdueSelect.value = '';
    if (searchInput) searchInput.value = '';

    const isOpen = preset === 'open' || preset === 'open_only';
    const isOverdue = preset === 'overdue' || preset === 'overdue_only';

    if (preset === 'today') {
      fromInput.value = todayStr;
      toInput.value = todayStr;
      renderWarrantyCasesTable(false, false);
    } else if (preset === '7days') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      fromInput.value = getLocalDateStr(d7);
      toInput.value = todayStr;
      renderWarrantyCasesTable(false, false);
    } else if (preset === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      fromInput.value = getLocalDateStr(startOfMonth);
      toInput.value = todayStr;
      renderWarrantyCasesTable(false, false);
    } else if (isOpen) {
      renderWarrantyCasesTable(true, false);
    } else if (isOverdue) {
      if (overdueSelect) overdueSelect.value = 'overdue';
      renderWarrantyCasesTable(false, true);
    } else {
      // 'all' hoặc mặc định
      renderWarrantyCasesTable(false, false);
    }
  }

  function resetWarrantyFilters() {
    if (document.getElementById('filter-warranty-search')) document.getElementById('filter-warranty-search').value = '';
    if (document.getElementById('filter-warranty-status')) document.getElementById('filter-warranty-status').value = '';
    if (document.getElementById('filter-warranty-overdue')) document.getElementById('filter-warranty-overdue').value = '';
    if (document.getElementById('filter-warranty-from')) document.getElementById('filter-warranty-from').value = '';
    if (document.getElementById('filter-warranty-to')) document.getElementById('filter-warranty-to').value = '';
    renderWarrantyCasesTable(false, false);
  }

  function closeAndOpenWarrantyModule() {
    const el = document.getElementById('warrantyDetailModal');
    if (el) {
      const inst = bootstrap.Modal.getInstance(el);
      if (inst) inst.hide();
    }
    switchTab('BaoHanh');
  }

  function renderWarrantyCasesTable(isOpenOnly = false, isOverdueOnly = false) {
    const tbody = document.getElementById('warranty-cases-table-body');
    const badge = document.getElementById('warranty-cases-badge');
    if (!tbody) return;

    const filterSearch = (document.getElementById('filter-warranty-search')?.value || '').trim().toLowerCase();
    const filterStatus = document.getElementById('filter-warranty-status')?.value || '';
    const filterOverdue = document.getElementById('filter-warranty-overdue')?.value || '';
    const filterFrom = document.getElementById('filter-warranty-from')?.value || '';
    const filterTo = document.getElementById('filter-warranty-to')?.value || '';

    // Validate From <= To nếu có cả 2
    if (filterFrom && filterTo && filterFrom > filterTo) {
      Swal.fire('Thời gian không hợp lệ', 'Từ ngày tiếp nhận không được lớn hơn Đến ngày!', 'warning');
      return;
    }

    let list = [...WARRANTY_CASES_DB];
    const todayStr = getLocalDateStr();

    // 1. Lọc trạng thái (Đang mở chỉ hiện case chưa HOÀN TẤT)
    if (isOpenOnly) {
      list = list.filter(c => c.status !== 'HOÀN TẤT');
    } else if (filterStatus) {
      list = list.filter(c => c.status === filterStatus);
    }

    // 2. Lọc hạn quá hạn (Quá hạn chỉ hiện case chưa hoàn tất VÀ đã quá ngày hẹn trả)
    if (isOverdueOnly || filterOverdue === 'overdue') {
      list = list.filter(c => {
        if (c.status === 'HOÀN TẤT' || !c.ngayHenTra) return false;
        const pDate = parseVoucherDate(c.ngayHenTra);
        if (!pDate) return false;
        const pDateStr = getLocalDateStr(pDate);
        return todayStr > pDateStr;
      });
    } else if (filterOverdue === 'not_overdue') {
      list = list.filter(c => {
        if (!c.ngayHenTra) return true;
        const pDate = parseVoucherDate(c.ngayHenTra);
        if (!pDate) return true;
        const pDateStr = getLocalDateStr(pDate);
        return todayStr <= pDateStr;
      });
    }

    // 3. Lọc ngày tiếp nhận (Từ ngày -> Đến ngày)
    if (filterFrom) {
      const fromD = new Date(filterFrom);
      list = list.filter(c => {
        if (!c.ngayTiepNhan) return false;
        const parts = c.ngayTiepNhan.split('/');
        if (parts.length !== 3) return false;
        const cD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return cD >= fromD;
      });
    }

    if (filterTo) {
      const toD = new Date(filterTo);
      toD.setHours(23, 59, 59);
      list = list.filter(c => {
        if (!c.ngayTiepNhan) return false;
        const parts = c.ngayTiepNhan.split('/');
        if (parts.length !== 3) return false;
        const cD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return cD <= toD;
      });
    }

    // 4. Lọc từ khóa tìm kiếm (Serial, Case, Model, Khách, SĐT, RMA, Kỹ thuật, Hãng)
    if (filterSearch) {
      list = list.filter(c => 
        (c.caseId && c.caseId.toLowerCase().includes(filterSearch)) ||
        (c.serial && c.serial.toLowerCase().includes(filterSearch)) ||
        (c.internalId && c.internalId.toLowerCase().includes(filterSearch)) ||
        (c.model && c.model.toLowerCase().includes(filterSearch)) ||
        (c.khachHang && c.khachHang.toLowerCase().includes(filterSearch)) ||
        (c.sdtKhach && c.sdtKhach.toLowerCase().includes(filterSearch)) ||
        (c.maRma && c.maRma.toLowerCase().includes(filterSearch)) ||
        (c.kyThuatPhuTrach && c.kyThuatPhuTrach.toLowerCase().includes(filterSearch)) ||
        (c.nccHang && c.nccHang.toLowerCase().includes(filterSearch)) ||
        (c.loiKhachBao && c.loiKhachBao.toLowerCase().includes(filterSearch))
      );
    }

    if (badge) badge.textContent = `${list.length} ca`;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Không có ca bảo hành nào phù hợp với bộ lọc</td></tr>';
      return;
    }

    let html = '';
    list.forEach(c => {
      // Kiểm tra quá hạn hẹn trả khách (Yêu cầu H)
      let isOverdue = false;
      let overdueBadge = '';
      if (c.ngayHenTra && c.status !== 'HOÀN TẤT') {
        const pDate = parseVoucherDate(c.ngayHenTra);
        if (pDate && todayStr > getLocalDateStr(pDate)) {
          isOverdue = true;
          overdueBadge = '<span class="badge bg-danger ms-1 animate__animated animate__pulse animate__infinite">Quá hạn</span>';
        }
      }

      html += `
        <tr class="${isOverdue ? 'table-warning' : ''}">
          <td data-label="Mã Case"><strong class="text-warning font-monospace">${c.caseId}</strong></td>
          <td data-label="Serial Hãng">
            <span class="font-monospace fw-bold text-primary">${c.serial}</span>
            <span class="badge bg-secondary font-monospace d-block" style="font-size:0.65rem">${c.internalId}</span>
          </td>
          <td data-label="Model"><strong>${c.model}</strong></td>
          <td data-label="Khách Hàng">
            <div>${c.khachHang}</div>
            <small class="font-monospace text-muted">${c.sdtKhach}</small>
          </td>
          <td data-label="Lỗi Ghi Nhận">
            <div class="small">${c.loiKhachBao}</div>
            ${c.phuKienKemTheo ? `<small class="text-muted"><i class="fa-solid fa-paperclip"></i> ${c.phuKienKemTheo}</small>` : ''}
          </td>
          <td data-label="Kỹ Thuật">
            <div>${c.kyThuatPhuTrach || '<span class="text-muted">Chưa phân công</span>'}</div>
            <small class="text-info">${c.nccHang || ''}</small>
          </td>
          <td data-label="Ngày Hẹn Trả">
            <span class="font-monospace">${c.ngayHenTra || '--'}</span>
            ${overdueBadge}
          </td>
          <td data-label="Trạng Thái">
            <span class="badge ${c.status === 'HOÀN TẤT' ? 'bg-success' : 'bg-warning text-dark'}">${c.status}</span>
          </td>
          <td data-label="Cập Nhật" class="text-end">
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Tiến độ
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                <li><h6 class="dropdown-header">Chuyển trạng thái 6 bước</h6></li>
                <li><a class="dropdown-item ${c.status === 'TIẾP NHẬN' ? 'fw-bold text-primary' : ''}" href="javascript:void(0)" onclick="updateWarrantyCaseStatus('${c.caseId}', 'TIẾP NHẬN')">1. TIẾP NHẬN</a></li>
                <li><a class="dropdown-item ${c.status === 'ĐANG KIỂM TRA' ? 'fw-bold text-primary' : ''}" href="javascript:void(0)" onclick="updateWarrantyCaseStatus('${c.caseId}', 'ĐANG KIỂM TRA')">2. ĐANG KIỂM TRA</a></li>
                <li><a class="dropdown-item ${c.status === 'GỬI HÃNG/NCC' ? 'fw-bold text-primary' : ''}" href="javascript:void(0)" onclick="updateWarrantyCaseStatus('${c.caseId}', 'GỬI HÃNG/NCC')">3. GỬI HÃNG/NCC</a></li>
                <li><a class="dropdown-item ${c.status === 'ĐÃ NHẬN LẠI' ? 'fw-bold text-primary' : ''}" href="javascript:void(0)" onclick="updateWarrantyCaseStatus('${c.caseId}', 'ĐÃ NHẬN LẠI')">4. ĐÃ NHẬN LẠI</a></li>
                <li><a class="dropdown-item ${c.status === 'ĐÃ TRẢ KHÁCH' ? 'fw-bold text-primary' : ''}" href="javascript:void(0)" onclick="updateWarrantyCaseStatus('${c.caseId}', 'ĐÃ TRẢ KHÁCH')">5. ĐÃ TRẢ KHÁCH</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-success fw-bold" href="javascript:void(0)" onclick="updateWarrantyCaseStatus('${c.caseId}', 'HOÀN TẤT')"><i class="fa-solid fa-circle-check me-1"></i> 6. HOÀN TẤT (CLOSED)</a></li>
              </ul>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  function openCreateWarrantyCaseModal() {
    document.getElementById('case-serial').value = '';
    document.getElementById('case-issue').value = '';
    document.getElementById('case-accessories').value = '';
    document.getElementById('case-technician').value = '';
    document.getElementById('case-brand').value = '';
    document.getElementById('case-rma').value = '';
    document.getElementById('case-serial-verify-info').innerHTML = '';

    // Hẹn trả sau 5 ngày làm việc
    const promised = new Date();
    promised.setDate(promised.getDate() + 5);
    document.getElementById('case-promised-date').value = getLocalDateStr(promised);

    const modal = new bootstrap.Modal(document.getElementById('warrantyCaseModal'));
    modal.show();
  }

  // Kiểm tra Serial khi tiếp nhận: CHẶN NHIỀU CASE ĐANG MỞ CHO CÙNG 1 SERIAL (YÊU CẦU A6)
  function onWarrantySerialChange(rawSerial) {
    const sn = (rawSerial || '').trim();
    const infoBox = document.getElementById('case-serial-verify-info');
    if (!sn) {
      infoBox.innerHTML = '';
      return;
    }

    // Tìm máy trong hệ thống
    const target = SERIAL_DB.find(s => 
      s.serial.toLowerCase() === sn.toLowerCase() || 
      (s.internalId && s.internalId.toLowerCase() === sn.toLowerCase())
    );

    if (!target) {
      playBeepSound();
      infoBox.innerHTML = `<span class="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> Serial "${sn}" chưa từng có trong hệ thống!</span>`;
      return;
    }

    // KIỂM TRA CHẶN NHIỀU CASE MỞ CÙNG SERIAL (YÊU CẦU A6)
    const activeCase = WARRANTY_CASES_DB.find(c => 
      c.serial.toLowerCase() === target.serial.toLowerCase() && 
      c.status !== 'HOÀN TẤT'
    );

    if (activeCase) {
      playBeepSound();
      infoBox.innerHTML = `
        <div class="p-2 bg-danger-subtle text-danger rounded border border-danger">
          <strong><i class="fa-solid fa-ban"></i> KHÔNG THỂ MỞ THÊM CASE MỚI!</strong><br>
          Serial này đang có Ca bảo hành <strong>${activeCase.caseId}</strong> ở trạng thái <strong>"${activeCase.status}"</strong>.<br>
          <small>Khi ca cũ hoàn tất mới được phép mở ca tiếp theo theo đúng quy định.</small>
        </div>
      `;
      Swal.fire({
        icon: 'error',
        title: 'Chặn mở ca bảo hành trùng!',
        html: `Serial <strong>${target.serial}</strong> đang có Ca <strong>${activeCase.caseId}</strong> ở trạng thái <strong>${activeCase.status}</strong>.<br>Vui lòng xử lý hoàn tất ca cũ trước khi tạo ca mới!`
      });
      return;
    }

    // Nếu hợp lệ, hiển thị thông tin máy & khách hàng
    infoBox.innerHTML = `
      <div class="p-2 bg-success-subtle text-success rounded border">
        <strong>${target.model}</strong> (${target.serial} - ${target.internalId})<br>
        Khách hàng: <strong>${target.khachHang || 'Chưa xuất bán'}</strong> (${target.sdtKhach || '--'})<br>
        Hạn bảo hành: <span class="badge bg-warning text-dark">${target.ngayHetHanBh || 'Chưa kích hoạt'}</span>
      </div>
    `;

    if (target.ncc) {
      document.getElementById('case-brand').value = `Hãng / NCC: ${target.ncc}`;
    }
  }

  // Tạo Ca bảo hành mới
  function submitCreateWarrantyCase() {
    const sn = document.getElementById('case-serial').value.trim();
    const issue = document.getElementById('case-issue').value.trim();
    const accessories = document.getElementById('case-accessories').value.trim();
    const receiver = document.getElementById('case-receiver').value.trim();
    const technician = document.getElementById('case-technician').value.trim();
    const brand = document.getElementById('case-brand').value.trim();
    const rma = document.getElementById('case-rma').value.trim();
    const promisedDate = formatDateDisplay(document.getElementById('case-promised-date').value);
    const initialStatus = document.getElementById('case-initial-status').value;

    if (!sn || !issue) {
      Swal.fire('Thiếu dữ liệu', 'Vui lòng nhập Serial thiết bị và mô tả lỗi gặp phải!', 'warning');
      return;
    }

    const target = SERIAL_DB.find(s => 
      s.serial.toLowerCase() === sn.toLowerCase() || 
      (s.internalId && s.internalId.toLowerCase() === sn.toLowerCase())
    );

    if (!target) {
      Swal.fire('Không hợp lệ', 'Serial không tồn tại trong hệ thống!', 'error');
      return;
    }

    // Kiểm tra chặn case đang mở (Yêu cầu A6)
    const activeCase = WARRANTY_CASES_DB.find(c => 
      c.serial.toLowerCase() === target.serial.toLowerCase() && 
      c.status !== 'HOÀN TẤT'
    );
    if (activeCase) {
      Swal.fire('Chặn mở ca', `Serial này đang có Case ${activeCase.caseId} ở trạng thái ${activeCase.status}!`, 'error');
      return;
    }

    const todayStr = formatDateDisplay(getLocalDateStr());
    const caseCount = WARRANTY_CASES_DB.length + 1;
    const caseId = `BH-2609-${String(caseCount).padStart(3, '0')}`;

    const newCase = {
      caseId: caseId,
      serial: target.serial,
      internalId: target.internalId,
      model: target.model,
      khachHang: target.khachHang || 'Khách vãng lai',
      sdtKhach: target.sdtKhach || '',
      ngayTiepNhan: todayStr,
      ngayHenTra: promisedDate,
      loiKhachBao: issue,
      phuKienKemTheo: accessories,
      nguoiTiepNhan: receiver,
      kyThuatPhuTrach: technician,
      nccHang: brand,
      maRma: rma,
      status: initialStatus,
      ketQuaXuLy: '',
      ghiChu: '',
      ngayHoanTat: ''
    };

    WARRANTY_CASES_DB.unshift(newCase);

    // Chuyển trạng thái máy thành IN_WARRANTY
    target.status = 'IN_WARRANTY';
    target.timeline.unshift({
      date: `${todayStr} ${new Date().toLocaleTimeString('vi-VN')}`,
      user: receiver,
      action: 'Tiếp nhận bảo hành',
      note: `Mở ca bảo hành ${caseId}: ${issue}. Hẹn trả: ${promisedDate}`
    });

    recordAuditLog('TIẾP NHẬN BẢO HÀNH', `${caseId} (${target.serial})`, 'SOLD', 'IN_WARRANTY', issue);

    const modalEl = document.getElementById('warrantyCaseModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['Dashboard', 'BaoHanh', 'Serial360']);
    }
    renderWarrantyCasesTable();

    Swal.fire({
      icon: 'success',
      title: 'Đã tạo Ca Bảo Hành!',
      html: `Mã ca: <strong>${caseId}</strong><br>Thiết bị: <strong>${target.model} (${target.serial})</strong><br>Hẹn trả: <strong>${promisedDate}</strong>`
    });
  }

  // Cập nhật trạng thái ca bảo hành
  function updateWarrantyCaseStatus(caseId, newStatus) {
    const c = WARRANTY_CASES_DB.find(x => x.caseId === caseId);
    if (!c) return;

    const oldStatus = c.status;
    c.status = newStatus;
    const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

    // Tìm máy để cập nhật timeline
    const target = SERIAL_DB.find(s => s.serial === c.serial);

    if (newStatus === 'HOÀN TẤT') {
      c.ngayHoanTat = nowStr;
      if (target) {
        // Trả về trạng thái SOLD nếu đã xuất trước đó, hoặc IN_STOCK nếu chưa xuất
        target.status = target.maPhieuXuat ? 'SOLD' : 'IN_STOCK';
        target.timeline.unshift({
          date: nowStr,
          user: CURRENT_USER_NAME,
          action: 'Hoàn tất bảo hành',
          note: `Đã hoàn tất ca bảo hành ${caseId}, máy hoạt động bình thường.`
        });
      }
    } else {
      if (target) {
        target.timeline.unshift({
          date: nowStr,
          user: CURRENT_USER_NAME,
          action: 'Cập nhật bảo hành',
          note: `Ca ${caseId} chuyển trạng thái sang: ${newStatus}`
        });
      }
    }

    recordAuditLog('CẬP NHẬT TIẾN ĐỘ BH', `Ca ${caseId} (${c.serial})`, oldStatus, newStatus, 'Chuyển quy trình bảo hành');
    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['Dashboard', 'BaoHanh', 'Serial360']);
    }
    renderWarrantyCasesTable();

    Swal.fire({
      icon: 'success',
      title: 'Đã cập nhật trạng thái',
      text: `Ca ${caseId} đã chuyển sang: ${newStatus}`,
      timer: 1200,
      showConfirmButton: false
    });
  }

  // Mở modal xem chi tiết ca bảo hành (Yêu cầu 8.5)
  function openWarrantyDetailModal(caseId) {
    const c = WARRANTY_CASES_DB.find(x => x.caseId === caseId);
    if (!c) {
      Swal.fire('Lỗi', `Không tìm thấy ca bảo hành ${caseId}`, 'error');
      return;
    }

    const titleEl = document.getElementById('warrantyDetailModalTitle');
    const bodyEl = document.getElementById('warrantyDetailModalBody');
    if (titleEl) titleEl.textContent = `Hồ sơ Ca Bảo Hành - ${c.caseId}`;

    const target = SERIAL_DB.find(s => s.serial === c.serial);
    const relatedAudits = AUDIT_LOG_DB.filter(a => 
      (a.target && a.target.includes(c.caseId)) || 
      (a.target && a.target.includes(c.serial))
    );

    let auditsHtml = '';
    if (relatedAudits.length > 0) {
      auditsHtml = relatedAudits.map(a => `
        <li class="mb-2">
          <span class="text-muted small font-monospace">[${a.time}]</span>
          <strong>${a.user}</strong>: <span class="badge bg-light text-dark border">${a.action}</span>
          <div class="small text-secondary">${a.reason || ''}</div>
        </li>
      `).join('');
    } else {
      auditsHtml = '<li class="text-muted small">Chưa có ghi chép nhật ký riêng.</li>';
    }

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border">
              <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-wrench me-1"></i> Thông tin thiết bị & tiếp nhận</h6>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Mã Case:</span>
                <span class="font-monospace fw-bold text-danger">${c.caseId}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Serial Hãng:</span>
                <span class="font-monospace fw-bold text-primary cursor-pointer text-decoration-underline" onclick="bootstrap.Modal.getInstance(document.getElementById('warrantyDetailModal')).hide(); openSerial360Modal('${c.serial}')">${c.serial} <i class="fa-solid fa-arrow-up-right-from-square small"></i></span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Mã nội bộ:</span>
                <span class="font-monospace text-secondary">${c.internalId || '--'}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Model:</span>
                <span class="fw-bold">${c.model}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Khách hàng:</span>
                <span class="fw-bold">${c.khachHang} (${c.sdtKhach || '--'})</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">Ngày tiếp nhận:</span>
                <span>${c.ngayTiepNhan || '--'}</span>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border h-100">
              <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-clock-rotate-left me-1"></i> Xử lý & Trạng thái</h6>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Trạng thái:</span>
                <span class="badge ${c.status === 'HOÀN TẤT' ? 'bg-success' : 'bg-warning text-dark'}">${c.status}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Hẹn trả khách:</span>
                <span class="fw-bold font-monospace text-danger">${c.ngayHenTra || '--'}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Kỹ thuật phụ trách:</span>
                <span>${c.kyThuatPhuTrach || 'Chưa phân công'}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Hãng / NCC:</span>
                <span>${c.nccHang || '--'}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Mã RMA / Gửi hãng:</span>
                <span class="font-monospace">${c.maRma || '--'}</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">Ngày hoàn tất:</span>
                <span class="text-success fw-bold">${c.ngayHoanTat || 'Chưa hoàn tất'}</span>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="p-3 bg-light rounded-3 border">
              <div class="fw-bold text-dark mb-1"><i class="fa-solid fa-triangle-exclamation text-warning me-1"></i> Lỗi khách báo:</div>
              <div class="p-2 bg-white rounded border mb-2">${c.loiKhachBao || 'Không có mô tả'}</div>
              <div class="small text-muted"><i class="fa-solid fa-paperclip me-1"></i> Phụ kiện kèm theo: <strong>${c.phuKienKemTheo || 'Không có'}</strong></div>
            </div>
          </div>

          <div class="col-12">
            <div class="p-3 bg-white rounded-3 border">
              <h6 class="fw-bold text-secondary mb-2"><i class="fa-solid fa-timeline me-1"></i> Lịch sử xử lý & Nhật ký Audit</h6>
              <ul class="list-unstyled mb-0 small">
                ${auditsHtml}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    const modalEl = document.getElementById('warrantyDetailModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
