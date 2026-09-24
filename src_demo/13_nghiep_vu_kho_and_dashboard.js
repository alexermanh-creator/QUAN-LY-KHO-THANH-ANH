  /* ==================================================== */
  /* 13. NGHIỆP VỤ KHO MỞ RỘNG & DASHBOARD (YÊU CẦU G & L) */
  /* ==================================================== */

  let CURRENT_INVENTORY_SESSION = null;
  let importExportChartInstance = null;
  let categoryStockChartInstance = null;
  let stockAgingChartInstance = null;
  let CURRENT_TOP_MODEL_TAB = 'stock'; // 'stock' | 'import' | 'export' | 'aging'
  let KPI_PERIOD = 'month'; // 'month' | '3months' | '6months' | '9months' | '1year' | 'today' | '7days' | 'all' | 'custom'

  function renderNghiepVuKhoTables() {
    renderInventorySessionsList();
  }

  // G1: ĐIỀU CHỈNH TỒN KHO (Chỉ Manager/Admin - Yêu cầu G1)
  function submitStockAdjustment() {
    // 1. Kiểm tra quyền Quản lý/Admin (Yêu cầu K)
    if (!checkPermission(['QUẢN LÝ', 'ADMIN'], 'Điều chỉnh tồn kho')) return;

    const sn = document.getElementById('adj-serial').value.trim();
    const targetStatus = document.getElementById('adj-target-status').value;
    const reason = document.getElementById('adj-reason').value.trim();

    if (!sn || !reason) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập Serial và Lý do điều chỉnh tồn (Bắt buộc kiểm toán)!', 'warning');
      return;
    }

    const target = SERIAL_DB.find(s => 
      s.serial.toLowerCase() === sn.toLowerCase() || 
      (s.internalId && s.internalId.toLowerCase() === sn.toLowerCase())
    );

    if (!target) {
      Swal.fire('Không tìm thấy', `Serial hoặc Mã nội bộ "${sn}" không có trong hệ thống!`, 'error');
      return;
    }

    const oldStatus = target.status;
    target.status = targetStatus;
    const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

    target.timeline.unshift({
      date: nowStr,
      user: CURRENT_USER_NAME,
      action: 'Điều chỉnh trạng thái',
      note: `Quản lý điều chỉnh từ ${oldStatus} sang ${targetStatus}. Lý do: ${reason}`
    });

    recordAuditLog('ĐIỀU CHỈNH TỒN', `${target.serial} (${target.model})`, oldStatus, targetStatus, reason);

    document.getElementById('adj-serial').value = '';
    document.getElementById('adj-reason').value = '';

    Swal.fire({
      icon: 'success',
      title: 'Điều chỉnh tồn thành công!',
      html: `Thiết bị <strong>${target.serial}</strong> đã chuyển sang trạng thái <strong>${targetStatus}</strong>.<br>Lý do: <em>${reason}</em>`
    });
  }

  // G2: KIỂM KÊ KHO THEO PHIÊN (YÊU CẦU G2)
  function renderInventorySessionsList() {
    const tbody = document.getElementById('inventory-sessions-table-body');
    let html = '';
    INVENTORY_SESSIONS_DB.forEach(sess => {
      html += `
        <tr>
          <td data-label="Mã Phiên"><strong class="text-success font-monospace">${sess.code}</strong></td>
          <td data-label="Kho">${sess.kho}</td>
          <td data-label="Bắt Đầu"><small>${sess.ngayBatDau}</small></td>
          <td data-label="Trạng Thái">
            <span class="badge ${sess.status === 'OPEN' ? 'bg-primary' : 'bg-secondary'}">${sess.status}</span>
          </td>
          <td data-label="Chi Tiết" class="text-end">
            <button class="btn btn-sm btn-outline-success" onclick="openInventorySessionDetail('${sess.code}')">
              <i class="fa-solid fa-clipboard-list me-1"></i> Đối soát (${sess.scannedSerials ? sess.scannedSerials.length : 0} SN)
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  function openCreateInventorySessionModal() {
    Swal.fire({
      title: 'Mở phiên kiểm kê kho mới',
      html: `
        <div class="text-start">
          <label class="form-label small fw-bold mb-1">Chọn kho kiểm kê (*)</label>
          <select id="swal-inv-kho" class="form-select mb-2">
            <option value="Kho VP">Kho VP</option>
            <option value="Kho Chi Nhánh">Kho Chi Nhánh</option>
            <option value="Kho Cách Ly (Hàng lỗi)">Kho Cách Ly (Hàng lỗi)</option>
          </select>
          <label class="form-label small fw-bold mb-1">Ghi chú đợt kiểm kê</label>
          <input type="text" id="swal-inv-note" class="form-control" placeholder="Kiểm kê đột xuất, định kỳ...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Khởi tạo phiên',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const kho = document.getElementById('swal-inv-kho').value;
        const note = document.getElementById('swal-inv-note').value.trim();
        return { kho, note };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const code = `KK-${yy}${mm}-${String(INVENTORY_SESSIONS_DB.length + 1).padStart(2, '0')}`;
        const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

        const newSession = {
          code: code,
          kho: res.value.kho,
          ngayBatDau: nowStr,
          nguoiKiem: CURRENT_USER_NAME,
          status: 'OPEN',
          scannedSerials: [],
          notes: res.value.note
        };

        INVENTORY_SESSIONS_DB.unshift(newSession);
        recordAuditLog('MỞ PHIÊN KIỂM KÊ', `Phiên ${code} (${res.value.kho})`, 'None', 'OPEN', res.value.note);
        renderInventorySessionsList();
        openInventorySessionDetail(code);
      }
    });
  }

  function openInventorySessionDetail(sessionCode) {
    const session = INVENTORY_SESSIONS_DB.find(s => s.code === sessionCode);
    if (!session) return;

    CURRENT_INVENTORY_SESSION = session;

    document.getElementById('inv-session-code').textContent = session.code;
    document.getElementById('inv-session-kho').textContent = session.kho;
    document.getElementById('inv-session-date').textContent = session.ngayBatDau;
    document.getElementById('inv-session-user').textContent = session.nguoiKiem;

    const statusBadge = document.getElementById('inv-session-status-badge');
    statusBadge.innerHTML = `<span class="badge ${session.status === 'OPEN' ? 'bg-primary' : 'bg-secondary'}">${session.status}</span>`;

    const closeBtn = document.getElementById('btn-close-inventory-session');
    const scanControls = document.getElementById('inv-scanner-controls');
    if (session.status === 'CLOSED') {
      closeBtn.style.display = 'none';
      scanControls.style.display = 'none';
    } else {
      closeBtn.style.display = 'inline-block';
      scanControls.style.display = 'flex';
    }

    renderInventorySessionData();

    const modal = new bootstrap.Modal(document.getElementById('inventorySessionModal'));
    modal.show();
  }

  function renderInventorySessionData() {
    if (!CURRENT_INVENTORY_SESSION) return;

    const session = CURRENT_INVENTORY_SESSION;
    // Danh sách tồn hệ thống tại kho này
    const systemStock = SERIAL_DB.filter(s => s.kho === session.kho && s.status === 'IN_STOCK');
    const scanned = session.scannedSerials || [];

    document.getElementById('inv-scanned-count').textContent = scanned.length;

    let matchedCount = 0;
    let missingCount = 0;
    let extraCount = 0;

    let rowsHtml = '';

    // 1. Duyệt các máy có trong hệ thống
    systemStock.forEach(sys => {
      const isScanned = scanned.includes(sys.serial);
      if (isScanned) {
        matchedCount++;
        rowsHtml += `
          <tr class="table-success">
            <td><strong class="font-monospace text-primary">${sys.serial}</strong></td>
            <td><span class="badge bg-secondary font-monospace">${sys.internalId}</span></td>
            <td>${sys.model}</td>
            <td><span class="badge bg-light text-dark">Có trong sổ</span></td>
            <td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Đã quét</span></td>
            <td><span class="text-success fw-bold"><i class="fa-solid fa-circle-check"></i> Khớp đủ</span></td>
          </tr>
        `;
      } else {
        missingCount++;
        rowsHtml += `
          <tr class="table-warning">
            <td><strong class="font-monospace text-dark">${sys.serial}</strong></td>
            <td><span class="badge bg-secondary font-monospace">${sys.internalId}</span></td>
            <td>${sys.model}</td>
            <td><span class="badge bg-light text-dark">Có trong sổ</span></td>
            <td><span class="badge bg-secondary">Chưa quét</span></td>
            <td><span class="text-warning fw-bold"><i class="fa-solid fa-triangle-exclamation"></i> Thiếu máy</span></td>
          </tr>
        `;
      }
    });

    // 2. Duyệt các máy đã quét nhưng KHÔNG có trong tồn hệ thống của kho này (Thừa / Serial lạ)
    scanned.forEach(sn => {
      const existsInSystemStock = systemStock.some(s => s.serial.toLowerCase() === sn.toLowerCase());
      if (!existsInSystemStock) {
        extraCount++;
        // Tìm xem máy này ở kho khác hay chưa từng có
        const globalMachine = SERIAL_DB.find(s => s.serial.toLowerCase() === sn.toLowerCase());
        let reasonDesc = 'Mã lạ chưa có trong kho';
        if (globalMachine) {
          reasonDesc = `Máy thuộc kho khác [${globalMachine.kho}] hoặc trạng thái [${globalMachine.status}]`;
        }

        rowsHtml += `
          <tr class="table-danger">
            <td><strong class="font-monospace text-danger">${sn}</strong></td>
            <td><span class="badge bg-danger font-monospace">${globalMachine ? globalMachine.internalId : 'KHÔNG RÕ'}</span></td>
            <td>${globalMachine ? globalMachine.model : 'Chưa phân loại'}</td>
            <td><span class="badge bg-danger">Không có ở kho này</span></td>
            <td><span class="badge bg-success"><i class="fa-solid fa-check"></i> Đã quét</span></td>
            <td><span class="text-danger fw-bold"><i class="fa-solid fa-xmark"></i> ${reasonDesc}</span></td>
          </tr>
        `;
      }
    });

    document.getElementById('inv-stat-system').textContent = systemStock.length;
    document.getElementById('inv-stat-matched').textContent = matchedCount;
    document.getElementById('inv-stat-missing').textContent = missingCount;
    document.getElementById('inv-stat-extra').textContent = extraCount;

    document.getElementById('inv-session-details-body').innerHTML = rowsHtml;
  }

  function addSerialToInventorySession(rawSerial) {
    if (!CURRENT_INVENTORY_SESSION) return;
    if (CURRENT_INVENTORY_SESSION.status === 'CLOSED') {
      Swal.fire('Phiên đã đóng', 'Phiên kiểm kê này đã bị khóa!', 'warning');
      return;
    }

    const sn = (rawSerial || '').trim();
    if (!sn) return;

    if (!CURRENT_INVENTORY_SESSION.scannedSerials) CURRENT_INVENTORY_SESSION.scannedSerials = [];

    // Kiểm tra đã quét trong phiên này chưa
    if (CURRENT_INVENTORY_SESSION.scannedSerials.includes(sn)) {
      playBeepSound();
      Swal.fire({
        icon: 'info',
        title: 'Đã quét trước đó',
        text: `Serial "${sn}" đã được ghi nhận trong phiên kiểm kê này rồi!`,
        timer: 1200,
        showConfirmButton: false
      });
      return;
    }

    CURRENT_INVENTORY_SESSION.scannedSerials.push(sn);
    playBeepSound();
    triggerVibration();

    document.getElementById('inv-scan-input').value = '';
    renderInventorySessionData();
  }

  function closeInventorySession() {
    // Kiểm tra quyền Quản lý/Admin (Yêu cầu K)
    if (!checkPermission(['QUẢN LÝ', 'ADMIN'], 'Đóng phiên kiểm kê')) return;

    if (!CURRENT_INVENTORY_SESSION) return;

    Swal.fire({
      title: `Khóa & Đóng phiên ${CURRENT_INVENTORY_SESSION.code}?`,
      text: 'Sau khi đóng, phiên kiểm kê sẽ không cho phép quét thêm hoặc sửa đổi trực tiếp. Nếu có chênh lệch cần xử lý bằng nghiệp vụ Điều Chỉnh Tồn riêng.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Khóa phiên kiểm kê',
      cancelButtonText: 'Quay lại'
    }).then(r => {
      if (r.isConfirmed) {
        CURRENT_INVENTORY_SESSION.status = 'CLOSED';
        recordAuditLog('ĐÓNG PHIÊN KIỂM KÊ', `Phiên ${CURRENT_INVENTORY_SESSION.code}`, 'OPEN', 'CLOSED', 'Đã đối soát xong thực tế');
        openInventorySessionDetail(CURRENT_INVENTORY_SESSION.code);
        renderInventorySessionsList();

        Swal.fire({
          icon: 'success',
          title: 'Đã khóa phiên kiểm kê!',
          text: `Phiên ${CURRENT_INVENTORY_SESSION.code} đã được đóng an toàn.`
        });
      }
    });
  }

  // Nghiệp vụ Hoàn nhập từ khách hàng
  function submitCustomerReturn() {
    const sn = document.getElementById('return-cust-serial').value.trim();
    const kho = document.getElementById('return-cust-kho').value;
    const reason = document.getElementById('return-cust-reason').value.trim();

    if (!sn) {
      Swal.fire('Thiếu Serial', 'Vui lòng nhập Serial máy hoàn nhập!', 'warning');
      return;
    }

    const s = SERIAL_DB.find(x => x.serial.toLowerCase() === sn.toLowerCase());
    if (!s) {
      Swal.fire('Không tìm thấy', `Serial "${sn}" không tồn tại trong hệ thống!`, 'error');
      return;
    }

    const oldStatus = s.status;
    s.status = 'IN_STOCK';
    s.kho = kho;
    const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

    s.timeline.unshift({
      date: nowStr,
      user: CURRENT_USER_NAME,
      action: 'Hoàn nhập từ khách',
      note: `Nhận lại từ khách "${s.khachHang || ''}" về ${kho}. Lý do: ${reason || 'Khách đổi trả'}`
    });

    recordAuditLog('HOÀN NHẬP TỪ KHÁCH', `${s.serial} (${s.model})`, oldStatus, 'IN_STOCK', reason || 'Hoàn nhập');
    document.getElementById('return-cust-serial').value = '';
    document.getElementById('return-cust-reason').value = '';

    Swal.fire({
      icon: 'success',
      title: 'Hoàn nhập thành công!',
      text: `Máy ${s.serial} đã được nhận lại về ${kho} và sẵn sàng xuất bán.`
    });
  }

  // Nghiệp vụ Trả hàng nhà cung cấp
  function submitSupplierReturn() {
    const sn = document.getElementById('return-supp-serial').value.trim();
    const reason = document.getElementById('return-supp-reason').value.trim();

    if (!sn) {
      Swal.fire('Thiếu Serial', 'Vui lòng nhập Serial máy trả nhà cung cấp!', 'warning');
      return;
    }

    const s = SERIAL_DB.find(x => x.serial.toLowerCase() === sn.toLowerCase());
    if (!s) {
      Swal.fire('Không tìm thấy', `Serial "${sn}" không tồn tại!`, 'error');
      return;
    }

    const oldStatus = s.status;
    s.status = 'RETURNED_SUPPLIER';
    const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

    s.timeline.unshift({
      date: nowStr,
      user: CURRENT_USER_NAME,
      action: 'Trả hàng NCC',
      note: `Xuất trả cho NCC "${s.ncc}". Lý do: ${reason || 'Lỗi sản xuất'}`
    });

    recordAuditLog('TRẢ HÀNG NCC', `${s.serial} (${s.model})`, oldStatus, 'RETURNED_SUPPLIER', reason || 'Trả nhà sản xuất');
    document.getElementById('return-supp-serial').value = '';
    document.getElementById('return-supp-reason').value = '';

    Swal.fire({
      icon: 'success',
      title: 'Đã xuất trả NCC!',
      text: `Máy ${s.serial} đã chuyển trạng thái RETURNED_SUPPLIER.`
    });
  }

  // Nghiệp vụ Chuyển kho nội bộ
  function submitTransferWarehouse() {
    const sn = document.getElementById('transfer-serial').value.trim();
    const targetKho = document.getElementById('transfer-target-kho').value;

    if (!sn) {
      Swal.fire('Thiếu Serial', 'Vui lòng nhập Serial máy chuyển kho!', 'warning');
      return;
    }

    const s = SERIAL_DB.find(x => x.serial.toLowerCase() === sn.toLowerCase());
    if (!s) {
      Swal.fire('Không tìm thấy', `Serial "${sn}" không tồn tại!`, 'error');
      return;
    }

    const oldKho = s.kho;
    if (oldKho === targetKho) {
      Swal.fire('Trùng kho', `Máy hiện tại đã ở sẵn [${targetKho}] rồi!`, 'info');
      return;
    }

    s.kho = targetKho;
    const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

    s.timeline.unshift({
      date: nowStr,
      user: CURRENT_USER_NAME,
      action: 'Chuyển kho',
      note: `Luân chuyển từ [${oldKho}] sang [${targetKho}]`
    });

    recordAuditLog('CHUYỂN KHO', `${s.serial} (${s.model})`, oldKho, targetKho, 'Luân chuyển nội bộ');
    document.getElementById('transfer-serial').value = '';

    Swal.fire({
      icon: 'success',
      title: 'Chuyển kho thành công!',
      text: `Máy ${s.serial} đã được chuyển từ [${oldKho}] sang [${targetKho}].`
    });
  }

  /* ==================================================== */
  /* 14. QUẢN TRỊ DANH MỤC HỆ THỐNG ĐẦY ĐỦ (YÊU CẦU 4)   */
  /* ==================================================== */

  function notifyCatalogChanged() {
    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['DanhMuc', 'NhapKho', 'XuatKho', 'TonKho', 'BaoHanh', 'LichSu']);
    }
    // Cập nhật lại các dropdown bộ lọc và form liên quan ngay lập tức
    try {
      if (typeof populateCatalogFilterDropdowns === 'function') {
        populateCatalogFilterDropdowns();
      }
      if (typeof setupNhapKhoForm === 'function') {
        setupNhapKhoForm();
      }
    } catch(e) {}
  }

  let CATALOG_SUBTAB_STATE = {
    models: { rendered: false, dirty: true },
    suppliers: { rendered: false, dirty: true },
    customers: { rendered: false, dirty: true },
    warehouses: { rendered: false, dirty: true },
    brands: { rendered: false, dirty: true },
    categories: { rendered: false, dirty: true },
    warranty: { rendered: false, dirty: true },
    conditions: { rendered: false, dirty: true }
  };
  if (typeof window !== 'undefined') window.CATALOG_SUBTAB_STATE = CATALOG_SUBTAB_STATE;
  let CATALOG_SUBTABS_INITIALIZED = false;

  function renderCatalogTables(forceTab) {
    populateCatalogFilterDropdowns();
    initCatalogSubtabsListener();

    let targetTab = (typeof forceTab === 'string') ? forceTab : null;
    if (!targetTab) {
      if (document.getElementById('tab-cat-models')?.classList.contains('active')) targetTab = 'models';
      else if (document.getElementById('tab-cat-suppliers')?.classList.contains('active')) targetTab = 'suppliers';
      else if (document.getElementById('tab-cat-customers')?.classList.contains('active')) targetTab = 'customers';
      else if (document.getElementById('tab-cat-warehouses')?.classList.contains('active')) targetTab = 'warehouses';
      else if (document.getElementById('tab-cat-brands')?.classList.contains('active')) targetTab = 'brands';
      else if (document.getElementById('tab-cat-categories')?.classList.contains('active')) targetTab = 'categories';
      else if (document.getElementById('tab-cat-warranty')?.classList.contains('active')) targetTab = 'warranty';
      else if (document.getElementById('tab-cat-conditions')?.classList.contains('active')) targetTab = 'conditions';
      else targetTab = 'models';
    }

    renderActiveCatalogSubtab(targetTab);
  }

  function renderActiveCatalogSubtab(tabName) {
    if (tabName === 'models') {
      if (!CATALOG_SUBTAB_STATE.models.rendered || CATALOG_SUBTAB_STATE.models.dirty) {
        renderCatalogProductsTable();
      }
    } else if (tabName === 'suppliers') {
      if (!CATALOG_SUBTAB_STATE.suppliers.rendered || CATALOG_SUBTAB_STATE.suppliers.dirty) {
        renderCatalogSuppliersTable();
      }
    } else if (tabName === 'customers') {
      if (!CATALOG_SUBTAB_STATE.customers.rendered || CATALOG_SUBTAB_STATE.customers.dirty) {
        renderCatalogCustomersTable();
      }
    } else if (tabName === 'warehouses') {
      if (!CATALOG_SUBTAB_STATE.warehouses.rendered || CATALOG_SUBTAB_STATE.warehouses.dirty) {
        renderCatalogWarehousesTable();
      }
    } else if (tabName === 'brands') {
      if (!CATALOG_SUBTAB_STATE.brands.rendered || CATALOG_SUBTAB_STATE.brands.dirty) {
        renderCatalogBrandsTable();
      }
    } else if (tabName === 'categories') {
      if (!CATALOG_SUBTAB_STATE.categories.rendered || CATALOG_SUBTAB_STATE.categories.dirty) {
        renderCatalogCategoriesTable();
      }
    } else if (tabName === 'warranty') {
      if (!CATALOG_SUBTAB_STATE.warranty.rendered || CATALOG_SUBTAB_STATE.warranty.dirty) {
        renderCatalogWarrantyTable();
      }
    } else if (tabName === 'conditions') {
      if (!CATALOG_SUBTAB_STATE.conditions.rendered || CATALOG_SUBTAB_STATE.conditions.dirty) {
        renderCatalogConditionsTable();
      }
    }
  }

  function initCatalogSubtabsListener() {
    if (CATALOG_SUBTABS_INITIALIZED) return;
    if (typeof document === 'undefined') return;

    const mapping = [
      { sel: '#catalogTabs [data-bs-target="#tab-cat-models"]', name: 'models' },
      { sel: '#catalogTabs [data-bs-target="#tab-cat-suppliers"]', name: 'suppliers' },
      { sel: '#catalogTabs [data-bs-target="#tab-cat-customers"]', name: 'customers' },
      { sel: '#catalogTabs [data-bs-target="#tab-cat-warehouses"]', name: 'warehouses' },
      { sel: '#catalogTabs [data-bs-target="#tab-cat-brands"]', name: 'brands' },
      { sel: '#catalogTabs [data-bs-target="#tab-cat-categories"]', name: 'categories' },
      { sel: '#catalogTabs [data-bs-target="#tab-cat-warranty"]', name: 'warranty' },
      { sel: '#catalogTabs [data-bs-target="#tab-cat-conditions"]', name: 'conditions' }
    ];

    mapping.forEach(m => {
      const el = document.querySelector(m.sel);
      if (el) {
        const handler = () => {
          if (typeof document !== 'undefined' && document.body) {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            if (document.documentElement) document.documentElement.style.overflow = '';
          }
          renderActiveCatalogSubtab(m.name);
        };
        el.addEventListener('shown.bs.tab', handler);
        el.addEventListener('click', handler);
      }
    });

    CATALOG_SUBTABS_INITIALIZED = true;
  }

  function populateCatalogFilterDropdowns() {
    const brandSel = document.getElementById('filter-cat-model-brand');
    const catSel = document.getElementById('filter-cat-model-category');
    if (brandSel) {
      brandSel.innerHTML = '<option value="">-- Tất cả Hãng --</option>' +
        INITIAL_BRANDS.map(b => `<option value="${b.maHang}">${b.maHang} (${b.tenHang})</option>`).join('');
    }
    if (catSel) {
      catSel.innerHTML = '<option value="">-- Tất cả Nhóm --</option>' +
        INITIAL_CATEGORIES.map(c => `<option value="${c.tenNhom}">${c.tenNhom}</option>`).join('');
    }
  }

  // Hàm chuẩn hóa chuỗi ngày DD/MM/YYYY, YYYY-MM-DD thành timestamp
  function parseDateToTime(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    const s = String(str).trim();
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (m) {
      return new Date(
        parseInt(m[3], 10),
        parseInt(m[2], 10) - 1,
        parseInt(m[1], 10),
        parseInt(m[4] || 0, 10),
        parseInt(m[5] || 0, 10),
        parseInt(m[6] || 0, 10)
      ).getTime();
    }
    const mIso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (mIso) {
      return new Date(parseInt(mIso[1], 10), parseInt(mIso[2], 10) - 1, parseInt(mIso[3], 10)).getTime();
    }
    const t = new Date(s).getTime();
    return isNaN(t) ? 0 : t;
  }

  // Lấy thời gian nhập kho gần nhất và số lượng tồn thực tế của Model
  function getModelLatestImportInfo(modelName) {
    if (!modelName) return { time: 0, dateStr: '', totalStock: 0 };
    const mLower = String(modelName).trim().toLowerCase();
    let maxTime = 0;
    let latestDateStr = '';
    let totalStock = 0;

    // 1. Quét trong SERIAL_DB
    if (typeof SERIAL_DB !== 'undefined' && Array.isArray(SERIAL_DB)) {
      SERIAL_DB.forEach(s => {
        if (s.model && s.model.toLowerCase() === mLower) {
          if (s.status === 'IN_STOCK') totalStock++;
          if (s.ngayNhap) {
            const t = parseDateToTime(s.ngayNhap);
            if (t > maxTime) {
              maxTime = t;
              latestDateStr = s.ngayNhap;
            }
          }
        }
      });
    }

    // 2. Quét trong VOUCHERS_DB.nhap
    if (typeof VOUCHERS_DB !== 'undefined' && Array.isArray(VOUCHERS_DB.nhap)) {
      VOUCHERS_DB.nhap.forEach(v => {
        const hasModel = (v.model && v.model.toLowerCase() === mLower) ||
          (v.items && v.items.some(it => it.model && it.model.toLowerCase() === mLower));
        if (hasModel) {
          const t = parseDateToTime(v.ngayNhap || v.ngay || v.createdAt);
          if (t > maxTime) {
            maxTime = t;
            latestDateStr = v.ngayNhap || v.ngay || (v.createdAt ? String(v.createdAt).split(' ')[0] : '');
          }
        }
      });
    }

    return { time: maxTime, dateStr: latestDateStr, totalStock };
  }

  // 4.1 SẢN PHẨM / MODEL
  function renderCatalogProductsTable() {
    const tbody = document.getElementById('catalog-products-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.models.rendered = true;
    CATALOG_SUBTAB_STATE.models.dirty = false;

    const sQ = (document.getElementById('filter-cat-model-search')?.value || '').toLowerCase().trim();
    const brandF = document.getElementById('filter-cat-model-brand')?.value || '';
    const catF = document.getElementById('filter-cat-model-category')?.value || '';
    const activeF = document.getElementById('filter-cat-model-active')?.value || '';

    let list = (typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []).filter(p => {
      // Chuẩn hóa active: nếu không có trường active thì mặc định coi là Active (true)
      const pActive = p.active !== false;
      if (activeF !== '') {
        const isActive = activeF === 'true';
        if (pActive !== isActive) return false;
      }
      if (brandF) {
        const targetB = String(brandF).trim().toUpperCase();
        const pB = String(p.hang || p.brand || '').trim().toUpperCase();
        if (pB !== targetB) {
          const bObj = INITIAL_BRANDS.find(b => (b.maHang && b.maHang.toUpperCase() === targetB) || (b.tenHang && b.tenHang.toUpperCase() === targetB));
          if (!bObj || ((bObj.maHang && pB !== bObj.maHang.toUpperCase()) && (bObj.tenHang && pB !== bObj.tenHang.toUpperCase()))) {
            return false;
          }
        }
      }
      if (catF && p.nhom !== catF) return false;
      if (sQ) {
        const text = `${p.productId || ''} ${p.model || ''} ${p.ten || ''} ${p.hang || ''} ${p.nhom || ''}`.toLowerCase();
        if (!text.includes(sQ)) return false;
      }
      return true;
    });

    // MẶC ĐỊNH: SẮP XẾP TOÀN BỘ MODEL THEO THỜI GIAN NHẬP TỪ MỚI NHẤT ĐẾN CŨ
    list.sort((a, b) => {
      const infA = getModelLatestImportInfo(a.model);
      const infB = getModelLatestImportInfo(b.model);
      if (infB.time !== infA.time) return infB.time - infA.time; // Giảm dần: Mới nhất lên đầu
      return String(a.model || '').localeCompare(String(b.model || ''));
    });

    if (list.length === 0) {
      const isFiltered = !!(sQ || brandF || catF || activeF !== '');
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-muted py-5">
            <i class="fa-solid fa-box-open fs-2 mb-2 d-block text-secondary opacity-50"></i>
            ${isFiltered ? 'Không tìm thấy sản phẩm/model phù hợp với bộ lọc.' : 'Chưa có Model sản phẩm nào trong danh mục.<br><small class="text-muted">Nhấn "+ Thêm Model Mới" hoặc sẵn sàng nạp file dữ liệu thực tế.</small>'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => {
      const inf = getModelLatestImportInfo(p.model);
      return `
        <tr class="${p.active === false ? 'table-secondary text-muted' : ''}">
          <td data-label="Product ID"><span class="font-monospace fw-bold text-secondary">${p.productId || '--'}</span></td>
          <td data-label="Model">
            <strong class="text-primary font-monospace fs-6">${p.model}</strong>
          </td>
          <td data-label="Tên Sản Phẩm">
            <div class="fw-semibold text-dark">${p.ten || p.model}</div>
            <div class="small text-muted mt-1 d-flex flex-wrap gap-2">
              <span class="badge ${inf.dateStr ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-secondary border'}">
                <i class="fa-solid fa-truck-ramp-box me-1"></i>Lần nhập: <strong>${inf.dateStr || 'Chưa có phiếu'}</strong>
              </span>
              <span class="badge ${inf.totalStock > 0 ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-secondary border'}">
                <i class="fa-solid fa-box me-1"></i>Tồn kho: <strong>${inf.totalStock} máy</strong>
              </span>
            </div>
          </td>
          <td data-label="Hãng"><span class="badge bg-light text-dark border">${(() => {
            const bObj = INITIAL_BRANDS.find(b => (b.maHang && b.maHang.toUpperCase() === String(p.hang || p.brand || '').toUpperCase()) || (b.tenHang && b.tenHang.toUpperCase() === String(p.hang || p.brand || '').toUpperCase()));
            return bObj ? `${bObj.maHang} (${bObj.tenHang})` : (p.hang || 'Chưa rõ');
          })()}</span></td>
          <td data-label="Nhóm"><span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">${p.nhom || 'Khác'}</span></td>
          <td data-label="BH Mặc Định" class="text-center font-monospace">${p.defaultBh || 12} th</td>
          <td data-label="Serial Track" class="text-center">
            ${p.manageSerial !== false ? '<span class="badge bg-success">Có quản lý</span>' : '<span class="badge bg-secondary">Không</span>'}
          </td>
          <td data-label="Trạng Thái">
            ${p.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
          </td>
          <td data-label="Thao Tác" class="text-end">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" title="Sửa Model" onclick="openEditModelModal('${p.productId || p.model}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn ${p.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                      title="${p.active !== false ? 'Ngừng sử dụng (Inactive)' : 'Kích hoạt lại'}" 
                      onclick="toggleModelActive('${p.productId || p.model}')">
                <i class="fa-solid ${p.active !== false ? 'fa-ban' : 'fa-check'}"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openEditModelModal(productIdOrModel) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Sửa danh mục Model')) return;
    const p = INITIAL_PRODUCTS.find(x => x.productId === productIdOrModel || x.model === productIdOrModel);
    if (!p) return;

    Swal.fire({
      title: `Chỉnh sửa Model: ${p.model}`,
      width: '600px',
      html: `
        <div class="text-start small">
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Mã Model (*)</label>
              <input id="swal-edit-p-model" class="form-control form-control-sm font-monospace text-uppercase fw-bold" value="${escapeHtml(p.model)}">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Đơn vị tính (ĐVT)</label>
              <input id="swal-edit-p-dvt" class="form-control form-control-sm" value="${escapeHtml(p.dvt || 'Chiếc')}" placeholder="Chiếc, Máy, Bộ...">
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Tên sản phẩm (*)</label>
          <input id="swal-edit-p-name" class="form-control form-control-sm mb-2" value="${escapeHtml(p.ten)}">
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Hãng sản xuất (*)</label>
              <select id="swal-edit-p-brand" class="form-select form-select-sm">
                ${INITIAL_BRANDS.map(b => {
                  const isSel = String(p.hang || p.brand || '').toUpperCase() === b.maHang.toUpperCase() || String(p.hang || p.brand || '').toUpperCase() === b.tenHang.toUpperCase();
                  return `<option value="${b.maHang}" ${isSel ? 'selected' : ''}>${b.maHang} (${b.tenHang})</option>`;
                }).join('')}
              </select>
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Nhóm hàng (*)</label>
              <select id="swal-edit-p-cat" class="form-select form-select-sm">
                ${INITIAL_CATEGORIES.map(c => `<option value="${c.tenNhom}" ${p.nhom === c.tenNhom ? 'selected' : ''}>${c.tenNhom}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Bảo hành mặc định (tháng)</label>
              <input id="swal-edit-p-bh" type="number" class="form-control form-control-sm" value="${p.defaultBh || 12}">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Quản lý Serial</label>
              <select id="swal-edit-p-serial" class="form-select form-select-sm">
                <option value="true" ${p.manageSerial !== false ? 'selected' : ''}>Có quản lý Serial</option>
                <option value="false" ${p.manageSerial === false ? 'selected' : ''}>Không quản lý Serial</option>
              </select>
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-edit-p-note" class="form-control form-control-sm" value="${escapeHtml(p.ghiChu || '')}" placeholder="Ghi chú cấu hình, mã phụ...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const newModel = document.getElementById('swal-edit-p-model').value.trim();
        const ten = document.getElementById('swal-edit-p-name').value.trim();
        if (!newModel) {
          Swal.showValidationMessage('Vui lòng nhập Mã Model!');
          return false;
        }
        if (!ten) {
          Swal.showValidationMessage('Vui lòng nhập Tên sản phẩm!');
          return false;
        }
        // Kiểm tra trùng mã Model mới nếu có thay đổi
        if (newModel.toLowerCase() !== p.model.toLowerCase()) {
          const duplicate = INITIAL_PRODUCTS.some(x => x !== p && x.model.toLowerCase() === newModel.toLowerCase());
          if (duplicate) {
            Swal.showValidationMessage(`Mã Model "${newModel}" đã tồn tại trong hệ thống!`);
            return false;
          }
        }
        return {
          model: newModel,
          ten: ten,
          dvt: document.getElementById('swal-edit-p-dvt').value.trim() || 'Chiếc',
          hang: document.getElementById('swal-edit-p-brand').value,
          nhom: document.getElementById('swal-edit-p-cat').value,
          defaultBh: parseInt(document.getElementById('swal-edit-p-bh').value) || 12,
          manageSerial: document.getElementById('swal-edit-p-serial').value === 'true',
          ghiChu: document.getElementById('swal-edit-p-note').value.trim()
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const oldModel = p.model;
        const newModel = res.value.model;

        // Nếu thay đổi Mã Model, tự động đồng bộ sang SERIAL_DB và VOUCHERS_DB
        if (oldModel !== newModel) {
          SERIAL_DB.forEach(s => {
            if (s.model === oldModel) {
              s.model = newModel;
              s.tenHang = res.value.ten;
              s.nhom = res.value.nhom;
            }
          });
          if (VOUCHERS_DB && VOUCHERS_DB.nhap) {
            VOUCHERS_DB.nhap.forEach(v => {
              if (v.items) {
                v.items.forEach(it => { if (it.model === oldModel) it.model = newModel; });
              }
            });
          }
          if (VOUCHERS_DB && VOUCHERS_DB.xuat) {
            VOUCHERS_DB.xuat.forEach(v => {
              if (v.items) {
                v.items.forEach(it => { if (it.model === oldModel) it.model = newModel; });
              }
            });
          }
        }

        Object.assign(p, res.value);

        // Lưu vào localStorage
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_PRODUCTS', JSON.stringify(INITIAL_PRODUCTS));
            localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
            localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
          }
        } catch(e) {}

        // Đồng bộ Backend Apps Script nếu có
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã cập nhật Model trên Sheet:', r))
            .withFailureHandler(err => console.error('Lỗi cập nhật Model trên Sheet:', err))
            .saveProduct(p.model, p.ten, p.nhom, p.dvt || 'Chiếc', p.hang || '', p.defaultBh || 12, p.manageSerial !== false, p.ghiChu || '', p.rowId || null);
        }

        recordAuditLog('SỬA MODEL', `Model ${oldModel} -> ${newModel}`, 'Cũ', 'Mới', 'Cập nhật đầy đủ thông tin danh mục sản phẩm');
        notifyCatalogChanged();
        renderCatalogProductsTable();
        populateCatalogFilterDropdowns();
        if (typeof setupNhapKhoForm === 'function') setupNhapKhoForm();
        if (typeof renderDashboard === 'function') renderDashboard();

        Swal.fire('Thành công', `Đã cập nhật Model <strong>${p.model}</strong> (${p.ten})`, 'success');
      }
    });
  }

  function toggleModelActive(productIdOrModel) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Thay đổi trạng thái Model')) return;
    const p = INITIAL_PRODUCTS.find(x => x.productId === productIdOrModel || x.model === productIdOrModel);
    if (!p) return;

    // Không hard delete nếu đã phát sinh giao dịch
    const hasTransactions = SERIAL_DB.some(s => s.model === p.model);
    const newStatus = p.active === false ? true : false;

    if (!newStatus && hasTransactions) {
      Swal.fire({
        title: 'Chuyển sang Ngừng sử dụng (Inactive)?',
        text: `Model "${p.model}" đã có dữ liệu giao dịch trong kho, không thể xóa vĩnh viễn. Hệ thống sẽ chuyển sang trạng thái Inactive để ngừng nhập/xuất mới.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý Inactive',
        cancelButtonText: 'Hủy'
      }).then(r => {
        if (r.isConfirmed) {
          p.active = false;
          recordAuditLog('NGỪNG DÙNG MODEL', `Model ${p.model}`, 'Active', 'Inactive', 'Chuyển trạng thái ngừng sử dụng');
          notifyCatalogChanged();
          renderCatalogProductsTable();
          Swal.fire('Đã cập nhật', `Model ${p.model} đã chuyển sang Inactive`, 'info');
        }
      });
      return;
    }

    p.active = newStatus;
    recordAuditLog(newStatus ? 'KÍCH HOẠT MODEL' : 'NGỪNG DÙNG MODEL', `Model ${p.model}`, !newStatus ? 'Active' : 'Inactive', newStatus ? 'Active' : 'Inactive', 'Đổi trạng thái model');
    notifyCatalogChanged();
    renderCatalogProductsTable();
  }

  // 4.2 NHÀ CUNG CẤP
  function renderCatalogSuppliersTable() {
    const tbody = document.getElementById('catalog-suppliers-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.suppliers.rendered = true;
    CATALOG_SUBTAB_STATE.suppliers.dirty = false;

    // Tự động gộp và làm sạch trùng lặp Nhà Cung Cấp theo tenTat
    const seenSupp = new Map();
    INITIAL_SUPPLIERS.forEach(s => {
      const k = (s.tenTat || s.code || '').trim().toLowerCase();
      if (!k) return;
      if (!seenSupp.has(k)) {
        seenSupp.set(k, s);
      } else {
        const existing = seenSupp.get(k);
        if (!existing.sdt && s.sdt) existing.sdt = s.sdt;
        if (!existing.diaChi && s.diaChi) existing.diaChi = s.diaChi;
        if (!existing.email && s.email) existing.email = s.email;
        if (existing.tenDayDu === existing.tenTat && s.tenDayDu !== s.tenTat) existing.tenDayDu = s.tenDayDu;
      }
    });
    INITIAL_SUPPLIERS = Array.from(seenSupp.values());

    const sQ = (document.getElementById('filter-cat-supp-search')?.value || '').toLowerCase().trim();
    let list = INITIAL_SUPPLIERS.filter(s => {
      if (sQ) {
        const text = `${s.supplierId || ''} ${s.tenTat || ''} ${s.tenDayDu || ''} ${s.sdt || ''} ${s.email || ''}`.toLowerCase();
        if (!text.includes(sQ)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      const isFiltered = !!sQ;
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-5">
            <i class="fa-solid fa-truck-field fs-2 mb-2 d-block text-secondary opacity-50"></i>
            ${isFiltered ? 'Không tìm thấy nhà cung cấp nào phù hợp.' : 'Chưa có Nhà cung cấp nào trong danh mục.<br><small class="text-muted">Nhấn "+ Thêm Nhà Cung Cấp" hoặc nạp từ dữ liệu thực tế.</small>'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr class="${s.active === false ? 'table-secondary text-muted' : ''}">
        <td data-label="Supplier ID"><span class="font-monospace fw-bold text-secondary">${s.supplierId || '--'}</span></td>
        <td data-label="Mã NCC"><strong class="text-success font-monospace">${s.tenTat}</strong></td>
        <td data-label="Tên Đầy Đủ"><strong>${s.tenDayDu}</strong></td>
        <td data-label="Điện Thoại" class="font-monospace">${s.sdt}</td>
        <td data-label="Email">${s.email || '--'}</td>
        <td data-label="Địa Chỉ">${s.diaChi || '--'}</td>
        <td data-label="Trạng Thái">
          ${s.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa NCC" onclick="openEditSupplierModal('${s.supplierId || s.tenTat}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn ${s.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${s.active !== false ? 'Ngừng dùng' : 'Kích hoạt'}" 
                    onclick="toggleSupplierActive('${s.supplierId || s.tenTat}')">
              <i class="fa-solid ${s.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openEditSupplierModal(suppIdOrCode) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Sửa danh mục NCC')) return;
    const s = INITIAL_SUPPLIERS.find(x => x.supplierId === suppIdOrCode || x.tenTat === suppIdOrCode);
    if (!s) return;

    Swal.fire({
      title: `Chỉnh sửa NCC: ${s.tenTat}`,
      width: '600px',
      html: `
        <div class="text-start small">
          <div class="row g-2 mb-2">
            <div class="col-5">
              <label class="form-label fw-bold mb-1">Mã / Tên viết tắt (*)</label>
              <input id="swal-edit-s-code" class="form-control form-control-sm font-monospace text-uppercase fw-bold" value="${escapeHtml(s.tenTat)}">
            </div>
            <div class="col-7">
              <label class="form-label fw-bold mb-1">Tên đầy đủ NCC / Nhà SX (*)</label>
              <input id="swal-edit-s-fullname" class="form-control form-control-sm" value="${escapeHtml(s.tenDayDu)}">
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Số điện thoại (*)</label>
              <input id="swal-edit-s-phone" class="form-control form-control-sm" value="${escapeHtml(s.sdt)}">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Email</label>
              <input id="swal-edit-s-email" class="form-control form-control-sm" value="${escapeHtml(s.email || '')}" placeholder="ncc@email.com">
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Địa chỉ văn phòng / Kho xuất</label>
          <input id="swal-edit-s-address" class="form-control form-control-sm mb-2" value="${escapeHtml(s.diaChi || '')}">
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Người liên hệ</label>
              <input id="swal-edit-s-contact" class="form-control form-control-sm" value="${escapeHtml(s.nguoiLienHe || '')}">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Mã số thuế</label>
              <input id="swal-edit-s-tax" class="form-control form-control-sm" value="${escapeHtml(s.mst || '')}">
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-edit-s-note" class="form-control form-control-sm" value="${escapeHtml(s.ghiChu || '')}" placeholder="Chính sách chiết khấu, hạn mức công nợ...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const code = document.getElementById('swal-edit-s-code').value.trim().toUpperCase();
        const fullname = document.getElementById('swal-edit-s-fullname').value.trim();
        const phone = document.getElementById('swal-edit-s-phone').value.trim();
        if (!code) {
          Swal.showValidationMessage('Vui lòng nhập Mã / Tên viết tắt NCC!');
          return false;
        }
        if (!fullname || !phone) {
          Swal.showValidationMessage('Vui lòng nhập Tên đầy đủ và SĐT!');
          return false;
        }
        if (code !== s.tenTat) {
          const duplicate = INITIAL_SUPPLIERS.some(x => x !== s && x.tenTat.toUpperCase() === code);
          if (duplicate) {
            Swal.showValidationMessage(`Mã NCC "${code}" đã tồn tại!`);
            return false;
          }
        }
        return {
          tenTat: code,
          tenDayDu: fullname,
          sdt: phone,
          email: document.getElementById('swal-edit-s-email').value.trim(),
          diaChi: document.getElementById('swal-edit-s-address').value.trim(),
          nguoiLienHe: document.getElementById('swal-edit-s-contact').value.trim(),
          mst: document.getElementById('swal-edit-s-tax').value.trim(),
          ghiChu: document.getElementById('swal-edit-s-note').value.trim()
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const oldCode = s.tenTat;
        const newCode = res.value.tenTat;

        if (oldCode !== newCode) {
          SERIAL_DB.forEach(item => { if (item.ncc === oldCode) item.ncc = newCode; });
          if (VOUCHERS_DB && VOUCHERS_DB.nhap) {
            VOUCHERS_DB.nhap.forEach(v => { if (v.ncc === oldCode) v.ncc = newCode; });
          }
        }

        Object.assign(s, res.value);

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_SUPPLIERS', JSON.stringify(INITIAL_SUPPLIERS));
            localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
            localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
          }
        } catch(e) {}

        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã lưu NCC Sheet:', r))
            .saveNcc(s.tenTat, s.tenDayDu, s.sdt, s.email || '', s.diaChi || '', s.nguoiLienHe || '', s.mst || '', s.ghiChu || '', s.rowId || null);
        }

        recordAuditLog('SỬA NCC', `NCC ${oldCode} -> ${newCode}`, 'Cũ', 'Mới', 'Cập nhật đầy đủ danh mục nhà cung cấp');
        notifyCatalogChanged();
        renderCatalogSuppliersTable();
        if (typeof setupNhapKhoForm === 'function') setupNhapKhoForm();

        Swal.fire('Thành công', `Đã cập nhật NCC <strong>${s.tenTat}</strong> (${s.tenDayDu})`, 'success');
      }
    });
  }

  function toggleSupplierActive(suppIdOrCode) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái NCC')) return;
    const s = INITIAL_SUPPLIERS.find(x => x.supplierId === suppIdOrCode || x.tenTat === suppIdOrCode);
    if (!s) return;

    // Không hard-delete nếu đã phát sinh giao dịch nhập
    const hasTransactions = VOUCHERS_DB.nhap.some(v => v.ncc === s.tenTat || v.ncc === s.tenDayDu);
    const newStatus = s.active === false ? true : false;

    if (!newStatus && hasTransactions) {
      Swal.fire({
        title: 'Chuyển NCC sang Inactive?',
        text: `NCC "${s.tenTat}" đã có phiếu nhập trong hệ thống, không thể xóa vĩnh viễn. Chuyển sang Inactive để dừng chọn khi tạo phiếu mới.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý Inactive'
      }).then(r => {
        if (r.isConfirmed) {
          s.active = false;
          recordAuditLog('NGỪNG DÙNG NCC', `NCC ${s.tenTat}`, 'Active', 'Inactive', 'Ngừng giao dịch với NCC');
          notifyCatalogChanged();
          renderCatalogSuppliersTable();
        }
      });
      return;
    }

    s.active = newStatus;
    recordAuditLog(newStatus ? 'KÍCH HOẠT NCC' : 'NGỪNG DÙNG NCC', `NCC ${s.tenTat}`, !newStatus ? 'Active' : 'Inactive', newStatus ? 'Active' : 'Inactive', 'Đổi trạng thái NCC');
    notifyCatalogChanged();
    renderCatalogSuppliersTable();
  }

  // 4.3 KHÁCH HÀNG
  function renderCatalogCustomersTable() {
    const tbody = document.getElementById('catalog-customers-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.customers.rendered = true;
    CATALOG_SUBTAB_STATE.customers.dirty = false;

    const sQ = (document.getElementById('filter-cat-cust-search')?.value || '').toLowerCase().trim();
    let list = INITIAL_CUSTOMERS.filter(c => {
      if (sQ) {
        const text = `${c.customerId || ''} ${c.ten || ''} ${c.sdt || ''} ${c.nguoiLienHe || ''} ${c.email || ''} ${c.diaChi || ''} ${c.mst || ''}`.toLowerCase();
        if (!text.includes(sQ)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      const isFiltered = !!sQ;
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-5">
            <i class="fa-solid fa-users fs-2 mb-2 d-block text-secondary opacity-50"></i>
            ${isFiltered ? 'Không tìm thấy khách hàng nào phù hợp.' : 'Chưa có Khách hàng nào trong danh mục.<br><small class="text-muted">Nhấn "+ Thêm Khách Hàng" hoặc nạp từ dữ liệu thực tế.</small>'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr class="${c.active === false ? 'table-secondary text-muted' : ''}">
        <td data-label="Customer ID"><span class="font-monospace fw-bold text-secondary">${c.customerId || '--'}</span></td>
        <td data-label="Tên Khách Hàng"><strong>${c.ten}</strong></td>
        <td data-label="Số Điện Thoại" class="font-monospace text-primary fw-bold">${c.sdt}</td>
        <td data-label="Người Liên Hệ">
          ${c.nguoiLienHe ? `<span class="badge bg-light text-dark border"><i class="fa-solid fa-user me-1 text-secondary"></i>${c.nguoiLienHe}</span>` : '<span class="text-muted opacity-50">--</span>'}
        </td>
        <td data-label="Email">${c.email || '<span class="text-muted opacity-50">--</span>'}</td>
        <td data-label="Địa Chỉ">${c.diaChi || '<span class="text-muted opacity-50">--</span>'}</td>
        <td data-label="Trạng Thái">
          ${c.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa thông tin" onclick="openEditCustomerModal('${c.customerId || c.sdt}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-outline-info" title="Xem hồ sơ tóm tắt" onclick="openCustomerSummaryModal('${c.sdt}')">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn ${c.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${c.active !== false ? 'Ngừng dùng' : 'Kích hoạt'}" 
                    onclick="toggleCustomerActive('${c.customerId || c.sdt}')">
              <i class="fa-solid ${c.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
            <button class="btn btn-outline-danger" title="Xóa khách hàng này" onclick="deleteCustomer('${c.customerId || c.sdt}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openEditCustomerModal(custIdOrPhone) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ', 'THỦ KHO'], 'Sửa danh mục Khách hàng')) return;
    const c = INITIAL_CUSTOMERS.find(x => x.customerId === custIdOrPhone || x.sdt === custIdOrPhone);
    if (!c) return;

    Swal.fire({
      title: `Chỉnh sửa Khách Hàng: ${c.ten}`,
      width: '600px',
      html: `
        <div class="text-start small">
          <div class="row g-2 mb-2">
            <div class="col-7">
              <label class="form-label fw-bold mb-1">Tên khách hàng / Đơn vị (*)</label>
              <input id="swal-edit-c-name" class="form-control form-control-sm" value="${escapeHtml(c.ten)}">
            </div>
            <div class="col-5">
              <label class="form-label fw-bold mb-1">Số điện thoại (*)</label>
              <input id="swal-edit-c-phone" class="form-control form-control-sm font-monospace fw-bold" value="${escapeHtml(c.sdt)}">
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Người liên hệ</label>
              <input id="swal-edit-c-contact" class="form-control form-control-sm" value="${escapeHtml(c.nguoiLienHe || '')}">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Email</label>
              <input id="swal-edit-c-email" class="form-control form-control-sm" value="${escapeHtml(c.email || '')}" placeholder="khachhang@email.com">
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Địa chỉ giao hàng (Có thể bổ sung sau)</label>
          <input id="swal-edit-c-address" class="form-control form-control-sm mb-2" value="${escapeHtml(c.diaChi || '')}">
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Mã số thuế</label>
              <input id="swal-edit-c-tax" class="form-control form-control-sm" value="${escapeHtml(c.mst || '')}">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Nhóm khách hàng</label>
              <input id="swal-edit-c-group" class="form-control form-control-sm" value="${escapeHtml(c.nhomKhach || 'Khách lẻ')}" placeholder="Đại lý, Khách lẻ, Doanh nghiệp...">
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-edit-c-note" class="form-control form-control-sm" value="${escapeHtml(c.ghiChu || '')}" placeholder="Ghi chú tuyến giao, yêu cầu đặc biệt...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const name = document.getElementById('swal-edit-c-name').value.trim();
        const phone = document.getElementById('swal-edit-c-phone').value.trim();
        if (!name || !phone) {
          Swal.showValidationMessage('Vui lòng nhập Tên và SĐT khách hàng!');
          return false;
        }
        return {
          ten: name,
          sdt: phone,
          email: document.getElementById('swal-edit-c-email').value.trim(),
          diaChi: document.getElementById('swal-edit-c-address').value.trim(),
          nguoiLienHe: document.getElementById('swal-edit-c-contact').value.trim(),
          mst: document.getElementById('swal-edit-c-tax').value.trim(),
          nhomKhach: document.getElementById('swal-edit-c-group').value.trim() || 'Khách lẻ',
          ghiChu: document.getElementById('swal-edit-c-note').value.trim()
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const oldName = c.ten;
        const oldPhone = c.sdt;
        Object.assign(c, res.value);

        // Đồng bộ sang SERIAL_DB và VOUCHERS_DB nếu thay đổi Tên hoặc SĐT Khách hàng
        if (oldName !== c.ten || oldPhone !== c.sdt) {
          if (typeof SERIAL_DB !== 'undefined') {
            SERIAL_DB.forEach(s => {
              if (s.khachHang === oldName) {
                s.khachHang = c.ten;
                s.sdtKhach = c.sdt;
              }
            });
          }
          if (typeof VOUCHERS_DB !== 'undefined' && VOUCHERS_DB.xuat) {
            VOUCHERS_DB.xuat.forEach(v => {
              if (v.khachHang === oldName) {
                v.khachHang = c.ten;
                v.sdtKhach = c.sdt;
              }
            });
          }
        }

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_CUSTOMERS', JSON.stringify(INITIAL_CUSTOMERS));
            localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
            if (typeof VOUCHERS_DB !== 'undefined') {
              localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
            }
          }
        } catch(e) {}

        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã lưu Khách hàng Sheet:', r))
            .saveKhachHang(c.customerId || '', c.ten, c.sdt, c.nguoiLienHe || '', c.email || '', c.diaChi || '', c.mst || '', c.nhomKhach || 'Khách lẻ', c.ghiChu || '', c.rowId || null);
        }

        recordAuditLog('SỬA KHÁCH HÀNG', `KH ${oldName} (${oldPhone}) -> ${c.ten}`, 'Cũ', 'Mới', 'Cập nhật đầy đủ danh mục khách hàng');
        notifyCatalogChanged();
        renderCatalogCustomersTable();
        if (typeof setupXuatKhoForm === 'function') setupXuatKhoForm();

        Swal.fire('Thành công', `Đã cập nhật khách hàng <strong>${c.ten}</strong> (${c.sdt})`, 'success');
      }
    });
  }

  function toggleCustomerActive(custIdOrPhone) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái KH')) return;
    const c = INITIAL_CUSTOMERS.find(x => x.customerId === custIdOrPhone || x.sdt === custIdOrPhone);
    if (!c) return;

    c.active = c.active === false ? true : false;
    recordAuditLog(c.active ? 'KÍCH HOẠT KH' : 'NGỪNG DÙNG KH', `KH ${c.ten} (${c.sdt})`, !c.active ? 'Active' : 'Inactive', c.active ? 'Active' : 'Inactive', 'Đổi trạng thái khách hàng');
    notifyCatalogChanged();
    renderCatalogCustomersTable();
  }

  function deleteCustomer(custIdOrPhone) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Xóa Khách hàng')) return;
    const c = INITIAL_CUSTOMERS.find(x => x.customerId === custIdOrPhone || x.sdt === custIdOrPhone);
    if (!c) return;

    Swal.fire({
      title: 'Xác nhận xóa Khách hàng?',
      html: `Bạn có chắc muốn xóa khách hàng <strong>${escapeHtml(c.ten)}</strong> (${escapeHtml(c.sdt)}) khỏi danh mục hệ thống?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Quay lại'
    }).then(r => {
      if (r.isConfirmed) {
        INITIAL_CUSTOMERS = INITIAL_CUSTOMERS.filter(x => x !== c);
        if (typeof CUSTOMERS_DB !== 'undefined') CUSTOMERS_DB = INITIAL_CUSTOMERS;
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_CUSTOMERS', JSON.stringify(INITIAL_CUSTOMERS));
          }
        } catch(e) {}

        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(res => console.log('Đã xóa KH Backend Sheet:', res))
            .deleteCustomerByNameOrPhone(c.ten || c.sdt);
        }

        recordAuditLog('XÓA KHÁCH HÀNG', `KH ${c.ten} (${c.sdt})`, 'Tồn tại', 'Đã xóa', 'Xóa khỏi danh mục khách hàng');
        notifyCatalogChanged();
        renderCatalogCustomersTable();
        if (typeof setupXuatKhoForm === 'function') setupXuatKhoForm();

        Swal.fire('Đã xóa', `Đã xóa khách hàng <strong>${escapeHtml(c.ten)}</strong> khỏi danh mục!`, 'success');
      }
    });
  }

  // 4.4 KHO HÀNG
  function renderCatalogWarehousesTable() {
    const tbody = document.getElementById('catalog-warehouses-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.warehouses.rendered = true;
    CATALOG_SUBTAB_STATE.warehouses.dirty = false;

    const sQ = (document.getElementById('filter-cat-wh-search')?.value || '').toLowerCase().trim();
    let list = INITIAL_WAREHOUSES.filter(w => {
      if (sQ) {
        const text = `${w.warehouseId || ''} ${w.maKho || ''} ${w.tenKho || ''} ${w.loaiKho || ''} ${w.diaDiem || ''}`.toLowerCase();
        if (!text.includes(sQ)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      const isFiltered = !!sQ;
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-5">
            <i class="fa-solid fa-warehouse fs-2 mb-2 d-block text-secondary opacity-50"></i>
            ${isFiltered ? 'Không tìm thấy kho hàng nào phù hợp.' : 'Chưa có Kho hàng nào trong danh mục.<br><small class="text-muted">Nhấn "+ Thêm Kho Mới" để tạo kho lưu trữ.</small>'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(w => `
      <tr class="${w.active === false ? 'table-secondary text-muted' : ''}">
        <td data-label="Warehouse ID"><span class="font-monospace fw-bold text-secondary">${w.warehouseId || '--'}</span></td>
        <td data-label="Mã Kho"><strong class="text-primary font-monospace">${w.maKho}</strong></td>
        <td data-label="Tên Kho"><strong>${w.tenKho}</strong></td>
        <td data-label="Loại Kho"><span class="badge bg-light text-dark border">${w.loaiKho || 'Kho'}</span></td>
        <td data-label="Địa Điểm">${w.diaDiem || '--'}</td>
        <td data-label="Trạng Thái">
          ${w.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa kho" onclick="openEditWarehouseModal('${w.warehouseId}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn ${w.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${w.active !== false ? 'Ngừng dùng' : 'Kích hoạt'}" 
                    onclick="toggleWarehouseActive('${w.warehouseId}')">
              <i class="fa-solid ${w.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAddWarehouseModal() {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Thêm kho hàng mới')) return;
    Swal.fire({
      title: 'Thêm Kho Hàng Mới',
      html: `
        <div class="text-start small">
          <label class="form-label fw-bold mb-1">Mã kho (*)</label>
          <input id="swal-add-w-code" class="form-control form-control-sm mb-2" placeholder="Ví dụ: KHO_HCM, KHO_BD...">
          <label class="form-label fw-bold mb-1">Tên kho (*)</label>
          <input id="swal-add-w-name" class="form-control form-control-sm mb-2" placeholder="Ví dụ: Kho Chi Nhánh TP.HCM">
          <label class="form-label fw-bold mb-1">Loại kho</label>
          <select id="swal-add-w-type" class="form-select form-select-sm mb-2">
            <option value="Kho Trung Tâm">Kho Trung Tâm</option>
            <option value="Kho Vệ Tinh">Kho Vệ Tinh</option>
            <option value="Kho Cách Ly">Kho Cách Ly</option>
          </select>
          <label class="form-label fw-bold mb-1">Địa điểm</label>
          <input id="swal-add-w-location" class="form-control form-control-sm mb-2" placeholder="Địa chỉ thực tế của kho...">
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-add-w-note" class="form-control form-control-sm" placeholder="Ghi chú thêm...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo kho mới',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const code = document.getElementById('swal-add-w-code').value.trim().toUpperCase();
        const name = document.getElementById('swal-add-w-name').value.trim();
        if (!code || !name) {
          Swal.showValidationMessage('Vui lòng nhập Mã kho và Tên kho!');
          return false;
        }
        if (INITIAL_WAREHOUSES.some(w => w.maKho === code)) {
          Swal.showValidationMessage('Mã kho đã tồn tại!');
          return false;
        }
        const whId = `WH-${String(INITIAL_WAREHOUSES.length + 1).padStart(3, '0')}`;
        return {
          warehouseId: whId,
          maKho: code,
          tenKho: name,
          loaiKho: document.getElementById('swal-add-w-type').value,
          diaDiem: document.getElementById('swal-add-w-location').value.trim(),
          ghiChu: document.getElementById('swal-add-w-note').value.trim(),
          active: true
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        INITIAL_WAREHOUSES.push(res.value);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_WAREHOUSES', JSON.stringify(INITIAL_WAREHOUSES));
          }
        } catch(e) {}
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã tạo Kho Sheet:', r))
            .saveKho(res.value.maKho, res.value.tenKho, res.value.loaiKho, res.value.thuKho || '', res.value.sdt || '', res.value.diaDiem || '', res.value.ghiChu || '', null);
        }
        recordAuditLog('TẠO KHO MỚI', `Kho ${res.value.tenKho} (${res.value.maKho})`, '--', 'Active', 'Thêm kho mới vào danh mục');
        notifyCatalogChanged();
        renderCatalogWarehousesTable();
        Swal.fire('Thành công', `Đã thêm kho ${res.value.tenKho}`, 'success');
      }
    });
  }

  function openEditWarehouseModal(whId) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Sửa danh mục kho')) return;
    const w = INITIAL_WAREHOUSES.find(x => x.warehouseId === whId || x.maKho === whId);
    if (!w) return;

    Swal.fire({
      title: `Chỉnh sửa Kho: ${w.tenKho}`,
      width: '600px',
      html: `
        <div class="text-start small">
          <div class="row g-2 mb-2">
            <div class="col-5">
              <label class="form-label fw-bold mb-1">Mã kho (*)</label>
              <input id="swal-edit-w-code" class="form-control form-control-sm font-monospace text-uppercase fw-bold" value="${escapeHtml(w.maKho || '')}">
            </div>
            <div class="col-7">
              <label class="form-label fw-bold mb-1">Tên kho (*)</label>
              <input id="swal-edit-w-name" class="form-control form-control-sm fw-semibold" value="${escapeHtml(w.tenKho)}">
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Loại kho</label>
              <select id="swal-edit-w-type" class="form-select form-select-sm">
                <option value="Kho Trung Tâm" ${w.loaiKho === 'Kho Trung Tâm' ? 'selected' : ''}>Kho Trung Tâm</option>
                <option value="Kho Vệ Tinh" ${w.loaiKho === 'Kho Vệ Tinh' ? 'selected' : ''}>Kho Vệ Tinh</option>
                <option value="Kho Cách Ly" ${w.loaiKho === 'Kho Cách Ly' ? 'selected' : ''}>Kho Cách Ly (Hàng lỗi/Chờ xử lý)</option>
                <option value="Kho Trung Chuyển" ${w.loaiKho === 'Kho Trung Chuyển' ? 'selected' : ''}>Kho Trung Chuyển</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Thủ kho phụ trách</label>
              <input id="swal-edit-w-keeper" class="form-control form-control-sm" value="${escapeHtml(w.thuKho || '')}" placeholder="Tên thủ kho...">
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">SĐT liên hệ kho</label>
              <input id="swal-edit-w-phone" class="form-control form-control-sm font-monospace" value="${escapeHtml(w.sdt || '')}" placeholder="09xx...">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Địa điểm / Địa chỉ kho</label>
              <input id="swal-edit-w-location" class="form-control form-control-sm" value="${escapeHtml(w.diaDiem || '')}" placeholder="Số nhà, đường, quận/huyện...">
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-edit-w-note" class="form-control form-control-sm" value="${escapeHtml(w.ghiChu || '')}" placeholder="Ghi chú diện tích, sức chứa, ghi chú đặc thù...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const code = document.getElementById('swal-edit-w-code').value.trim().toUpperCase();
        const name = document.getElementById('swal-edit-w-name').value.trim();
        if (!code) {
          Swal.showValidationMessage('Vui lòng nhập Mã kho!');
          return false;
        }
        if (!name) {
          Swal.showValidationMessage('Vui lòng nhập Tên kho!');
          return false;
        }
        return {
          maKho: code,
          tenKho: name,
          loaiKho: document.getElementById('swal-edit-w-type').value,
          thuKho: document.getElementById('swal-edit-w-keeper').value.trim(),
          sdt: document.getElementById('swal-edit-w-phone').value.trim(),
          diaDiem: document.getElementById('swal-edit-w-location').value.trim(),
          ghiChu: document.getElementById('swal-edit-w-note').value.trim()
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const oldName = w.tenKho;
        const newName = res.value.tenKho;

        if (oldName !== newName) {
          SERIAL_DB.forEach(item => { if (item.kho === oldName) item.kho = newName; });
          if (VOUCHERS_DB && VOUCHERS_DB.nhap) {
            VOUCHERS_DB.nhap.forEach(v => { if (v.kho === oldName) v.kho = newName; });
          }
          if (VOUCHERS_DB && VOUCHERS_DB.xuat) {
            VOUCHERS_DB.xuat.forEach(v => { if (v.kho === oldName) v.kho = newName; });
          }
        }

        Object.assign(w, res.value);

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_WAREHOUSES', JSON.stringify(INITIAL_WAREHOUSES));
            localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
            localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
          }
        } catch(e) {}

        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã lưu Kho Sheet:', r))
            .saveKho(w.maKho, w.tenKho, w.loaiKho, w.thuKho, w.sdt, w.diaDiem, w.ghiChu, w.rowId || null);
        }

        recordAuditLog('SỬA KHO', `Kho ${oldName} -> ${newName}`, 'Cũ', 'Mới', 'Cập nhật đầy đủ thông tin kho hàng');
        notifyCatalogChanged();
        renderCatalogWarehousesTable();
        if (typeof setupNhapKhoForm === 'function') setupNhapKhoForm();

        Swal.fire('Thành công', `Đã cập nhật kho <strong>${w.tenKho}</strong> (${w.maKho})`, 'success');
      }
    });
  }

  function toggleWarehouseActive(whId) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái kho')) return;
    const w = INITIAL_WAREHOUSES.find(x => x.warehouseId === whId || x.maKho === whId);
    if (!w) return;

    // Không hard-delete kho nếu đang có thiết bị tồn kho
    const hasItems = SERIAL_DB.some(s => s.kho === w.tenKho && s.status === 'IN_STOCK');
    const newStatus = w.active === false ? true : false;

    if (!newStatus && hasItems) {
      Swal.fire({
        title: 'Chuyển Kho sang Inactive?',
        text: `Kho "${w.tenKho}" hiện đang chứa thiết bị tồn kho thực tế, không thể xóa. Chuyển sang Inactive để ngăn chặn xuất/nhập mới vào kho này.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý Inactive',
        cancelButtonText: 'Hủy'
      }).then(r => {
        if (r.isConfirmed) {
          w.active = false;
          recordAuditLog('NGỪNG DÙNG KHO', `Kho ${w.tenKho}`, 'Active', 'Inactive', 'Ngừng sử dụng kho hàng');
          notifyCatalogChanged();
          renderCatalogWarehousesTable();
        }
      });
      return;
    }

    w.active = newStatus;
    recordAuditLog(newStatus ? 'KÍCH HOẠT KHO' : 'NGỪNG DÙNG KHO', `Kho ${w.tenKho}`, !newStatus ? 'Active' : 'Inactive', newStatus ? 'Active' : 'Inactive', 'Đổi trạng thái kho');
    notifyCatalogChanged();
    renderCatalogWarehousesTable();
  }

  // 4.5 HÃNG SẢN XUẤT
  function renderCatalogBrandsTable() {
    const tbody = document.getElementById('catalog-brands-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.brands.rendered = true;
    CATALOG_SUBTAB_STATE.brands.dirty = false;

    if (INITIAL_BRANDS.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-5">
            <i class="fa-solid fa-copyright fs-2 mb-2 d-block text-secondary opacity-50"></i>
            Chưa có Hãng sản xuất nào trong danh mục.<br>
            <small class="text-muted">Nhấn "+ Thêm Hãng Mới" để bắt đầu.</small>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = INITIAL_BRANDS.map(b => `
        <td data-label="Brand ID"><span class="font-monospace fw-bold text-secondary">${b.brandId || b.id}</span></td>
        <td data-label="Mã Hãng"><strong class="text-primary font-monospace">${b.maHang || b.code}</strong></td>
        <td data-label="Tên Hãng"><strong>${b.tenHang || b.name}</strong></td>
        <td data-label="Ghi Chú">${b.ghiChu || b.note || '--'}</td>
        <td data-label="Trạng Thái">
          ${b.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa hãng" onclick="openEditBrandModal('${b.brandId || b.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn ${b.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${b.active !== false ? 'Ngừng dùng' : 'Kích hoạt'}" 
                    onclick="toggleBrandActive('${b.brandId || b.id}')">
              <i class="fa-solid ${b.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAddBrandModal() {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Thêm hãng mới')) return;
    Swal.fire({
      title: 'Thêm Hãng Sản Xuất Mới',
      html: `
        <div class="text-start small">
          <label class="form-label fw-bold mb-1">Mã hãng (*)</label>
          <input id="swal-add-b-code" class="form-control form-control-sm mb-2" placeholder="Ví dụ: LENOVO, BROTHER...">
          <label class="form-label fw-bold mb-1">Tên hãng (*)</label>
          <input id="swal-add-b-name" class="form-control form-control-sm mb-2" placeholder="Ví dụ: Lenovo Corporation">
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-add-b-note" class="form-control form-control-sm" placeholder="Mô tả hoặc đại diện...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo Hãng',
      preConfirm: () => {
        const maHang = document.getElementById('swal-add-b-code').value.trim().toUpperCase();
        const tenHang = document.getElementById('swal-add-b-name').value.trim();
        if (!maHang || !tenHang) {
          Swal.showValidationMessage('Vui lòng nhập Mã hãng và Tên hãng!');
          return false;
        }
        return normalizeBrand({
          brandId: `BRD-${String(INITIAL_BRANDS.length + 1).padStart(3, '0')}`,
          maHang,
          tenHang,
          ghiChu: document.getElementById('swal-add-b-note').value.trim(),
          active: true
        });
      }
    }).then(res => {
      if (res.isConfirmed) {
        INITIAL_BRANDS.push(res.value);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_BRANDS', JSON.stringify(INITIAL_BRANDS));
          }
        } catch(e) {}
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã tạo Hãng Sheet:', r))
            .saveHangSx(res.value.maHang, res.value.tenHang, res.value.xuatXu || '', res.value.ghiChu || '', null);
        }
        recordAuditLog('TẠO HÃNG', `Hãng ${res.value.tenHang}`, '--', 'Active', 'Thêm hãng sản xuất mới');
        notifyCatalogChanged();
        renderCatalogBrandsTable();
        populateCatalogFilterDropdowns();
        Swal.fire('Thành công', `Đã thêm hãng ${res.value.tenHang}`, 'success');
      }
    });
  }

  function openEditBrandModal(brandId) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Sửa hãng')) return;
    const b = INITIAL_BRANDS.find(x => (x.brandId === brandId || x.id === brandId || x.maHang === brandId));
    if (!b) return;

    Swal.fire({
      title: `Chỉnh sửa Hãng: ${b.tenHang || b.name}`,
      width: '550px',
      html: `
        <div class="text-start small">
          <div class="row g-2 mb-2">
            <div class="col-5">
              <label class="form-label fw-bold mb-1">Mã hãng (*)</label>
              <input id="swal-edit-b-code" class="form-control form-control-sm font-monospace text-uppercase fw-bold" value="${escapeHtml(b.maHang || b.code || '')}">
            </div>
            <div class="col-7">
              <label class="form-label fw-bold mb-1">Tên hãng (*)</label>
              <input id="swal-edit-b-name" class="form-control form-control-sm" value="${escapeHtml(b.tenHang || b.name)}">
            </div>
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Xuất xứ / Quốc gia</label>
              <input id="swal-edit-b-origin" class="form-control form-control-sm" value="${escapeHtml(b.xuatXu || '')}" placeholder="Nhật Bản, Mỹ, Đức...">
            </div>
            <div class="col-6">
              <label class="form-label fw-bold mb-1">Trạng thái</label>
              <select id="swal-edit-b-status" class="form-select form-select-sm">
                <option value="true" ${b.active !== false ? 'selected' : ''}>Active (Hoạt động)</option>
                <option value="false" ${b.active === false ? 'selected' : ''}>Inactive (Ngừng dùng)</option>
              </select>
            </div>
          </div>
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-edit-b-note" class="form-control form-control-sm" value="${escapeHtml(b.ghiChu || b.note || '')}" placeholder="Ghi chú về hãng...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const maHang = document.getElementById('swal-edit-b-code').value.trim().toUpperCase();
        const tenHang = document.getElementById('swal-edit-b-name').value.trim();
        if (!maHang || !tenHang) {
          Swal.showValidationMessage('Vui lòng nhập đầy đủ Mã và Tên hãng!');
          return false;
        }
        return {
          maHang,
          tenHang,
          xuatXu: document.getElementById('swal-edit-b-origin').value.trim(),
          active: document.getElementById('swal-edit-b-status').value === 'true',
          ghiChu: document.getElementById('swal-edit-b-note').value.trim()
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const oldCode = b.maHang || b.code;
        Object.assign(b, res.value);
        normalizeBrand(b);

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_BRANDS', JSON.stringify(INITIAL_BRANDS));
          }
        } catch(e) {}

        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã lưu Hãng Sheet:', r))
            .saveHangSx(b.maHang, b.tenHang, b.xuatXu || '', b.ghiChu || '', b.rowId || null);
        }

        recordAuditLog('SỬA HÃNG', `Hãng ${oldCode} -> ${b.maHang}`, 'Cũ', 'Mới', 'Cập nhật toàn bộ thông tin hãng');
        notifyCatalogChanged();
        renderCatalogBrandsTable();
        populateCatalogFilterDropdowns();
        Swal.fire('Thành công', `Đã cập nhật hãng ${b.tenHang}`, 'success');
      }
    });
  }

  function toggleBrandActive(brandId) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái hãng')) return;
    const b = INITIAL_BRANDS.find(x => (x.brandId === brandId || x.id === brandId));
    if (!b) return;

    b.active = b.active === false ? true : false;
    recordAuditLog(b.active ? 'KÍCH HOẠT HÃNG' : 'NGỪNG DÙNG HÃNG', `Hãng ${b.tenHang || b.name}`, !b.active ? 'Active' : 'Inactive', b.active ? 'Active' : 'Inactive', 'Đổi trạng thái hãng');
    notifyCatalogChanged();
    renderCatalogBrandsTable();
  }

  // 4.6 NHÓM HÀNG
  function renderCatalogCategoriesTable() {
    const tbody = document.getElementById('catalog-categories-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.categories.rendered = true;
    CATALOG_SUBTAB_STATE.categories.dirty = false;

    if (INITIAL_CATEGORIES.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-5">
            <i class="fa-solid fa-tags fs-2 mb-2 d-block text-secondary opacity-50"></i>
            Chưa có Nhóm hàng nào trong danh mục.<br>
            <small class="text-muted">Nhấn "+ Thêm Nhóm Hàng" để bắt đầu.</small>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = INITIAL_CATEGORIES.map(c => `
      <tr class="${c.active === false ? 'table-secondary text-muted' : ''}">
        <td data-label="Category ID"><span class="font-monospace fw-bold text-secondary">${c.catId || c.id}</span></td>
        <td data-label="Mã Nhóm"><strong class="text-primary font-monospace">${c.maNhom || c.code}</strong></td>
        <td data-label="Tên Nhóm"><strong>${c.tenNhom || c.name}</strong></td>
        <td data-label="Ghi Chú">${c.ghiChu || c.note || '--'}</td>
        <td data-label="Trạng Thái">
          ${c.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa nhóm hàng" onclick="openEditCategoryModal('${c.catId || c.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn ${c.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${c.active !== false ? 'Ngừng dùng' : 'Kích hoạt'}" 
                    onclick="toggleCategoryActive('${c.catId || c.id}')">
              <i class="fa-solid ${c.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAddCategoryModal() {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Thêm nhóm hàng')) return;
    Swal.fire({
      title: 'Thêm Nhóm Hàng Mới',
      html: `
        <div class="text-start small">
          <label class="form-label fw-bold mb-1">Mã nhóm (*)</label>
          <input id="swal-add-c-code" class="form-control form-control-sm mb-2 font-monospace text-uppercase fw-bold" placeholder="Ví dụ: MAY_IN, TONER...">
          <label class="form-label fw-bold mb-1">Tên nhóm (*)</label>
          <input id="swal-add-c-name" class="form-control form-control-sm mb-2" placeholder="Ví dụ: Máy in văn phòng">
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-add-c-note" class="form-control form-control-sm" placeholder="Mô tả nhóm hàng...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo Nhóm Hàng',
      preConfirm: () => {
        const maNhom = document.getElementById('swal-add-c-code').value.trim().toUpperCase();
        const tenNhom = document.getElementById('swal-add-c-name').value.trim();
        if (!maNhom || !tenNhom) {
          Swal.showValidationMessage('Vui lòng nhập Mã và Tên nhóm!');
          return false;
        }
        return normalizeCategory({
          catId: `CAT-${String(INITIAL_CATEGORIES.length + 1).padStart(3, '0')}`,
          maNhom,
          tenNhom,
          ghiChu: document.getElementById('swal-add-c-note').value.trim(),
          active: true
        });
      }
    }).then(res => {
      if (res.isConfirmed) {
        INITIAL_CATEGORIES.push(res.value);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_CATEGORIES', JSON.stringify(INITIAL_CATEGORIES));
          }
        } catch(e) {}
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã tạo Nhóm Sheet:', r))
            .saveNhomHang(res.value.maNhom, res.value.tenNhom, res.value.ghiChu || '', null);
        }
        recordAuditLog('TẠO NHÓM HÀNG', `Nhóm ${res.value.tenNhom}`, '--', 'Active', 'Thêm nhóm hàng mới');
        notifyCatalogChanged();
        renderCatalogCategoriesTable();
        populateCatalogFilterDropdowns();
        Swal.fire('Thành công', `Đã thêm nhóm hàng ${res.value.tenNhom}`, 'success');
      }
    });
  }

  function openEditCategoryModal(catId) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Sửa nhóm hàng')) return;
    const c = INITIAL_CATEGORIES.find(x => (x.catId === catId || x.id === catId || x.maNhom === catId));
    if (!c) return;

    Swal.fire({
      title: `Chỉnh sửa Nhóm Hàng: ${c.tenNhom || c.name}`,
      width: '550px',
      html: `
        <div class="text-start small">
          <div class="row g-2 mb-2">
            <div class="col-5">
              <label class="form-label fw-bold mb-1">Mã nhóm (*)</label>
              <input id="swal-edit-c-code" class="form-control form-control-sm font-monospace text-uppercase fw-bold" value="${escapeHtml(c.maNhom || c.code || '')}">
            </div>
            <div class="col-7">
              <label class="form-label fw-bold mb-1">Tên nhóm (*)</label>
              <input id="swal-edit-c-name" class="form-control form-control-sm" value="${escapeHtml(c.tenNhom || c.name)}">
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Trạng thái</label>
            <select id="swal-edit-c-status" class="form-select form-select-sm">
              <option value="true" ${c.active !== false ? 'selected' : ''}>Active (Hoạt động)</option>
              <option value="false" ${c.active === false ? 'selected' : ''}>Inactive (Ngừng dùng)</option>
            </select>
          </div>
          <label class="form-label fw-bold mb-1">Ghi chú</label>
          <input id="swal-edit-c-note" class="form-control form-control-sm" value="${escapeHtml(c.ghiChu || c.note || '')}" placeholder="Mô tả nhóm hàng...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Đóng',
      preConfirm: () => {
        const maNhom = document.getElementById('swal-edit-c-code').value.trim().toUpperCase();
        const tenNhom = document.getElementById('swal-edit-c-name').value.trim();
        if (!maNhom || !tenNhom) {
          Swal.showValidationMessage('Vui lòng nhập Mã và Tên nhóm!');
          return false;
        }
        return {
          maNhom,
          tenNhom,
          active: document.getElementById('swal-edit-c-status').value === 'true',
          ghiChu: document.getElementById('swal-edit-c-note').value.trim()
        };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const oldCode = c.maNhom || c.code;
        Object.assign(c, res.value);
        normalizeCategory(c);

        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_CATEGORIES', JSON.stringify(INITIAL_CATEGORIES));
          }
        } catch(e) {}

        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã lưu Nhóm Sheet:', r))
            .saveNhomHang(c.maNhom, c.tenNhom, c.ghiChu || '', c.rowId || null);
        }

        recordAuditLog('SỬA NHÓM HÀNG', `Nhóm ${oldCode} -> ${c.maNhom}`, 'Cũ', 'Mới', 'Cập nhật toàn bộ thông tin nhóm hàng');
        notifyCatalogChanged();
        renderCatalogCategoriesTable();
        populateCatalogFilterDropdowns();
        Swal.fire('Thành công', `Đã cập nhật nhóm hàng ${c.tenNhom}`, 'success');
      }
    });
  }

  function toggleCategoryActive(catId) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái nhóm')) return;
    const c = INITIAL_CATEGORIES.find(x => (x.catId === catId || x.id === catId));
    if (!c) return;

    c.active = c.active === false ? true : false;
    recordAuditLog(c.active ? 'KÍCH HOẠT NHÓM' : 'NGỪNG DÙNG NHÓM', `Nhóm ${c.tenNhom || c.name}`, !c.active ? 'Active' : 'Inactive', c.active ? 'Active' : 'Inactive', 'Đổi trạng thái nhóm hàng');
    notifyCatalogChanged();
    renderCatalogCategoriesTable();
  }

  /* ==================================================== */
  /* 4.7 THỜI GIAN BẢO HÀNH (YÊU CẦU QUẢN TRỊ DANH MỤC)  */
  /* ==================================================== */
  let INITIAL_WARRANTIES = [];
  if (typeof window !== 'undefined') window.INITIAL_WARRANTIES = INITIAL_WARRANTIES;

  function renderCatalogWarrantyTable() {
    const tbody = document.getElementById('catalog-warranty-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.warranty.rendered = true;
    CATALOG_SUBTAB_STATE.warranty.dirty = false;

    if (!INITIAL_WARRANTIES) {
      INITIAL_WARRANTIES = [];
    }

    const sQ = (document.getElementById('filter-cat-warranty-search')?.value || '').toLowerCase().trim();
    let list = INITIAL_WARRANTIES.filter(w => {
      if (sQ) {
        const text = `${w.id || ''} ${w.tenGoi || ''} ${w.soThang || ''} ${w.ghiChu || ''}`.toLowerCase();
        if (!text.includes(sQ)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            <i class="fa-solid fa-shield-halved fs-3 mb-2 d-block text-secondary opacity-50"></i>
            Chưa có gói thời gian bảo hành nào trong danh mục.<br>
            <small class="text-muted">Bấm "+ Thêm Gói Bảo Hành Mới" để tạo gói (0 Tháng, 3 Tháng, 6 Tháng, 12 Tháng...).</small>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map((w, idx) => `
      <tr class="${w.active === false ? 'table-secondary text-muted' : ''}">
        <td data-label="Mã Gói"><span class="font-monospace fw-bold text-secondary">${escapeHtml(w.id || ('BH-' + (w.soThang || idx)))}</span></td>
        <td data-label="Thời Hạn"><strong class="text-primary font-monospace">${escapeHtml(w.tenGoi)}</strong></td>
        <td data-label="Số Tháng"><span class="badge bg-info-subtle text-info border border-info">${w.soThang} Tháng</span></td>
        <td data-label="Ghi Chú">${escapeHtml(w.ghiChu || '--')}</td>
        <td data-label="Trạng Thái">
          ${w.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa gói bảo hành" onclick="openEditWarrantyModal('${escapeHtml(w.id || w.tenGoi)}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn ${w.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${w.active !== false ? 'Ngừng sử dụng' : 'Kích hoạt'}" 
                    onclick="toggleWarrantyActive('${escapeHtml(w.id || w.tenGoi)}')">
              <i class="fa-solid ${w.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAddWarrantyModal() {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Thêm gói bảo hành')) return;

    Swal.fire({
      title: 'Thêm Gói Thời Gian Bảo Hành Mới',
      width: '500px',
      html: `
        <div class="text-start small">
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Số tháng (*)</label>
            <input id="swal-add-warr-months" type="number" min="0" max="120" class="form-control form-control-sm" placeholder="Ví dụ: 12" oninput="document.getElementById('swal-add-warr-name').value = this.value ? (this.value + ' Tháng') : ''">
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Tên gói hiển thị (*)</label>
            <input id="swal-add-warr-name" class="form-control form-control-sm font-monospace fw-bold" placeholder="Ví dụ: 12 Tháng">
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Ghi chú chính sách (Có thể bổ sung sau)</label>
            <input id="swal-add-warr-note" class="form-control form-control-sm" placeholder="Ghi chú điều kiện bảo hành...">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Thêm gói',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const months = parseInt(document.getElementById('swal-add-warr-months').value, 10);
        const name = document.getElementById('swal-add-warr-name').value.trim();
        const note = document.getElementById('swal-add-warr-note').value.trim();
        if (isNaN(months) || months < 0) {
          Swal.showValidationMessage('Vui lòng nhập số tháng bảo hành hợp lệ!');
          return false;
        }
        return { soThang: months, tenGoi: name || (months + ' Tháng'), ghiChu: note };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const item = {
          id: 'BH-' + res.value.soThang + 'M',
          soThang: res.value.soThang,
          tenGoi: res.value.tenGoi,
          ghiChu: res.value.ghiChu,
          active: true
        };
        INITIAL_WARRANTIES.push(item);
        if (WarehouseAPI && WarehouseAPI.saveWarranty) {
          WarehouseAPI.saveWarranty(item);
        }
        recordAuditLog('THÊM BẢO HÀNH', `Gói ${item.tenGoi}`, 'None', item.tenGoi, 'Thêm mới quy chuẩn thời gian bảo hành');
        notifyCatalogChanged();
        renderCatalogWarrantyTable();
        Swal.fire('Thành công', `Đã thêm gói bảo hành ${item.tenGoi}`, 'success');
      }
    });
  }

  function openEditWarrantyModal(idOrName) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Sửa gói bảo hành')) return;
    const w = INITIAL_WARRANTIES.find(x => x.id === idOrName || x.tenGoi === idOrName);
    if (!w) return;

    Swal.fire({
      title: `Chỉnh sửa Gói Bảo Hành: ${w.tenGoi}`,
      width: '500px',
      html: `
        <div class="text-start small">
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Số tháng (*)</label>
            <input id="swal-edit-warr-months" type="number" min="0" max="120" class="form-control form-control-sm" value="${w.soThang}">
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Tên gói hiển thị (*)</label>
            <input id="swal-edit-warr-name" class="form-control form-control-sm font-monospace fw-bold" value="${escapeHtml(w.tenGoi)}">
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Ghi chú (Có thể bổ sung sau)</label>
            <input id="swal-edit-warr-note" class="form-control form-control-sm" value="${escapeHtml(w.ghiChu || '')}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const months = parseInt(document.getElementById('swal-edit-warr-months').value, 10);
        const name = document.getElementById('swal-edit-warr-name').value.trim();
        const note = document.getElementById('swal-edit-warr-note').value.trim();
        if (isNaN(months) || months < 0) {
          Swal.showValidationMessage('Vui lòng nhập số tháng bảo hành hợp lệ!');
          return false;
        }
        return { soThang: months, tenGoi: name || (months + ' Tháng'), ghiChu: note };
      }
    }).then(res => {
      if (res.isConfirmed) {
        const oldGoi = w.tenGoi;
        Object.assign(w, res.value);
        if (WarehouseAPI && WarehouseAPI.saveWarranty) {
          WarehouseAPI.saveWarranty(w);
        }
        recordAuditLog('SỬA BẢO HÀNH', `Gói ${oldGoi} -> ${w.tenGoi}`, 'Cũ', 'Mới', 'Cập nhật quy chuẩn thời gian bảo hành');
        notifyCatalogChanged();
        renderCatalogWarrantyTable();
        Swal.fire('Thành công', `Đã cập nhật gói bảo hành ${w.tenGoi}`, 'success');
      }
    });
  }

  function toggleWarrantyActive(idOrName) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái gói BH')) return;
    const w = INITIAL_WARRANTIES.find(x => x.id === idOrName || x.tenGoi === idOrName);
    if (!w) return;
    w.active = w.active === false ? true : false;
    recordAuditLog(w.active ? 'KÍCH HOẠT GÓI BH' : 'NGỪNG DÙNG GÓI BH', `Gói ${w.tenGoi}`, !w.active ? 'Active' : 'Inactive', w.active ? 'Active' : 'Inactive', 'Đổi trạng thái gói bảo hành');
    notifyCatalogChanged();
    renderCatalogWarrantyTable();
  }



  /* ==================================================== */
  /* 4.8 QUẢN TRỊ LOẠI HÀNG (YÊU CẦU DANH MỤC HỆ THỐNG)  */
  /* ==================================================== */
  let INITIAL_CONDITIONS = [];
  if (typeof window !== 'undefined') window.INITIAL_CONDITIONS = INITIAL_CONDITIONS;

  function renderCatalogConditionsTable() {
    const tbody = document.getElementById('catalog-conditions-table-body');
    if (!tbody) return;
    CATALOG_SUBTAB_STATE.conditions.rendered = true;
    CATALOG_SUBTAB_STATE.conditions.dirty = false;

    if (!INITIAL_CONDITIONS) INITIAL_CONDITIONS = [];

    const sQ = (document.getElementById('filter-cat-conditions-search')?.value || '').toLowerCase().trim();
    let list = INITIAL_CONDITIONS.filter(c => {
      if (sQ) {
        const text = `${c.ten || c.name || ''} ${c.ghiChu || ''}`.toLowerCase();
        if (!text.includes(sQ)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            <i class="fa-solid fa-boxes-stacked fs-3 mb-2 d-block text-secondary opacity-50"></i>
            Chưa có loại hàng nào trong danh mục quy chuẩn.<br>
            <small class="text-muted">Bấm "+ Thêm Loại Hàng Mới" để tạo loại hàng (Chính Hãng, Nhập Khẩu, Mới 100%, Like New 99%, Hàng Đổi Trả...).</small>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map((c, idx) => `
      <tr class="${c.active === false ? 'table-secondary text-muted' : ''}">
        <td data-label="STT"><span class="fw-bold text-secondary">${idx + 1}</span></td>
        <td data-label="Tên Loại Hàng"><strong class="text-primary">${escapeHtml(c.ten || c.name)}</strong></td>
        <td data-label="Đặc Điểm">${escapeHtml(c.ghiChu || '--')}</td>
        <td data-label="Trạng Thái">
          ${c.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa loại hàng" onclick="openEditLoaiHangModal('${escapeHtml(c.id || c.ten || c.name)}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn ${c.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${c.active !== false ? 'Ngừng sử dụng' : 'Kích hoạt'}" 
                    onclick="toggleLoaiHangActive('${escapeHtml(c.id || c.ten || c.name)}')">
              <i class="fa-solid ${c.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAddLoaiHangModal() {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Thêm loại hàng')) return;

    Swal.fire({
      title: 'Thêm Loại Hàng Mới',
      width: '460px',
      html: `
        <div class="text-start small">
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Tên loại hàng (*)</label>
            <input id="swal-add-cond-name" type="text" class="form-control form-control-sm" placeholder="Ví dụ: Chính Hãng, Nhập Khẩu, Mới 100%...">
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Mô tả / Đặc điểm phân loại</label>
            <input id="swal-add-cond-note" type="text" class="form-control form-control-sm" placeholder="Hàng xuất xứ chính ngạch, Like New 99%...">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Lưu Loại Hàng',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const ten = document.getElementById('swal-add-cond-name').value.trim();
        const ghiChu = document.getElementById('swal-add-cond-note').value.trim();
        if (!ten) {
          Swal.showValidationMessage('Vui lòng nhập tên loại hàng!');
          return false;
        }
        if (INITIAL_CONDITIONS.some(c => (c.ten || c.name || '').toLowerCase() === ten.toLowerCase())) {
          Swal.showValidationMessage(`Loại hàng "${ten}" đã tồn tại trong danh mục!`);
          return false;
        }
        return { ten, ghiChu };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        const item = {
          id: 'COND-' + Date.now(),
          ten: res.value.ten,
          name: res.value.ten,
          ghiChu: res.value.ghiChu,
          active: true
        };
        INITIAL_CONDITIONS.push(item);

        if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã lưu Loại hàng vào Sheet:', r))
            .addQuyChuan(3, item.ten, null);
        }

        recordAuditLog('THÊM LOẠI HÀNG', `Loại hàng ${item.ten}`, '', item.ten, 'Tạo mới loại hàng trong danh mục');
        notifyCatalogChanged();
        renderCatalogConditionsTable();
        syncLoaiHangDropdowns();
        Swal.fire('Thành công', `Đã thêm loại hàng ${item.ten}`, 'success');
      }
    });
  }

  function openEditLoaiHangModal(idOrName) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Sửa loại hàng')) return;
    const c = INITIAL_CONDITIONS.find(x => x.id === idOrName || x.ten === idOrName || x.name === idOrName);
    if (!c) return;

    Swal.fire({
      title: 'Chỉnh Sửa Loại Hàng',
      width: '460px',
      html: `
        <div class="text-start small">
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Tên loại hàng (*)</label>
            <input id="swal-edit-cond-name" type="text" class="form-control form-control-sm" value="${escapeHtml(c.ten || c.name)}">
          </div>
          <div class="mb-2">
            <label class="form-label fw-bold mb-1">Mô tả / Đặc điểm phân loại</label>
            <input id="swal-edit-cond-note" type="text" class="form-control form-control-sm" value="${escapeHtml(c.ghiChu || '')}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk me-1"></i> Cập Nhật',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const ten = document.getElementById('swal-edit-cond-name').value.trim();
        const ghiChu = document.getElementById('swal-edit-cond-note').value.trim();
        if (!ten) {
          Swal.showValidationMessage('Vui lòng nhập tên loại hàng!');
          return false;
        }
        return { ten, ghiChu };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        const oldName = c.ten || c.name;
        c.ten = res.value.ten;
        c.name = res.value.ten;
        c.ghiChu = res.value.ghiChu;

        if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
          google.script.run
            .withSuccessHandler(r => console.log('Đã cập nhật Loại hàng Sheet:', r))
            .addQuyChuan(3, c.ten, c.rowId || null);
        }

        recordAuditLog('SỬA LOẠI HÀNG', `Loại hàng ${oldName} -> ${c.ten}`, oldName, c.ten, 'Cập nhật thông tin loại hàng');
        notifyCatalogChanged();
        renderCatalogConditionsTable();
        syncLoaiHangDropdowns();
        Swal.fire('Thành công', `Đã cập nhật loại hàng ${c.ten}`, 'success');
      }
    });
  }

  function toggleLoaiHangActive(idOrName) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái loại hàng')) return;
    const c = INITIAL_CONDITIONS.find(x => x.id === idOrName || x.ten === idOrName || x.name === idOrName);
    if (!c) return;
    c.active = c.active === false ? true : false;
    recordAuditLog(c.active ? 'KÍCH HOẠT LOẠI HÀNG' : 'NGỪNG DÙNG LOẠI HÀNG', `Loại hàng ${c.ten || c.name}`, !c.active ? 'Active' : 'Inactive', c.active ? 'Active' : 'Inactive', 'Đổi trạng thái loại hàng');
    notifyCatalogChanged();
    renderCatalogConditionsTable();
    syncLoaiHangDropdowns();
  }

  function syncLoaiHangDropdowns() {
    const nhapLoaiHangSel = document.getElementById('nhap-loai-hang');
    const nhapItemLoaiHangSel = document.getElementById('nhap-item-loai-hang');
    const activeList = (INITIAL_CONDITIONS || []).filter(c => c.active !== false);

    const buildOptions = () => {
      if (activeList.length === 0) {
        return '<option value="Chính Hãng">Chính Hãng (Mặc định)</option><option value="Nhập Khẩu">Nhập Khẩu</option><option value="Mới 100%">Mới 100%</option>';
      }
      return activeList.map(c => `<option value="${escapeHtml(c.ten || c.name)}">${escapeHtml(c.ten || c.name)}</option>`).join('');
    };

    if (nhapLoaiHangSel) {
      const curVal = nhapLoaiHangSel.value;
      nhapLoaiHangSel.innerHTML = buildOptions();
      if (curVal && [...nhapLoaiHangSel.options].some(o => o.value === curVal)) {
        nhapLoaiHangSel.value = curVal;
      }
    }

    if (nhapItemLoaiHangSel) {
      const curVal = nhapItemLoaiHangSel.value;
      nhapItemLoaiHangSel.innerHTML = buildOptions();
      if (curVal && [...nhapItemLoaiHangSel.options].some(o => o.value === curVal)) {
        nhapItemLoaiHangSel.value = curVal;
      } else if (nhapLoaiHangSel) {
        nhapItemLoaiHangSel.value = nhapLoaiHangSel.value;
      }
    }
  }
  window.syncLoaiHangDropdowns = syncLoaiHangDropdowns;
  window.openAddLoaiHangModal = openAddLoaiHangModal;
  window.openEditLoaiHangModal = openEditLoaiHangModal;
  window.toggleLoaiHangActive = toggleLoaiHangActive;
  window.renderCatalogConditionsTable = renderCatalogConditionsTable;

  // 8.3 TÓM TẮT KHÁCH HÀNG
  function openCustomerSummaryModal(khachHangOrPhone) {
    const cust = INITIAL_CUSTOMERS.find(c => 
      c.sdt === khachHangOrPhone || 
      c.ten.toLowerCase() === (khachHangOrPhone || '').toLowerCase()
    ) || { ten: khachHangOrPhone, sdt: khachHangOrPhone, diaChi: 'Khách hàng ngoài danh mục' };

    // Máy đã xuất cho khách
    const soldSerials = SERIAL_DB.filter(s => 
      (s.khachHang && s.khachHang.toLowerCase() === cust.ten.toLowerCase()) ||
      (s.sdtKhach && s.sdtKhach === cust.sdt)
    );

    // Phiếu xuất liên quan
    const relatedVouchers = VOUCHERS_DB.xuat.filter(v => 
      v.status === 'CONFIRMED' && 
      ((v.khachHang && v.khachHang.toLowerCase() === cust.ten.toLowerCase()) || (v.sdt && v.sdt === cust.sdt))
    );

    // Warranty case đang mở
    const openCases = WARRANTY_CASES_DB.filter(c => 
      c.status !== 'HOÀN TẤT' && 
      ((c.khachHang && c.khachHang.toLowerCase() === cust.ten.toLowerCase()) || (c.sdtKhach && c.sdtKhach === cust.sdt))
    );

    // Máy còn hạn bảo hành
    const today = new Date();
    let underWarrantyCount = 0;
    soldSerials.forEach(s => {
      if (s.hanBaoHanh) {
        const parts = s.hanBaoHanh.split('/');
        if (parts.length === 3) {
          const exp = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          if (exp >= today) underWarrantyCount++;
        }
      }
    });

    const body = document.getElementById('customerSummaryModalBody');
    if (body) {
      body.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border">
              <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-address-card me-1"></i> Thông tin khách hàng</h6>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Họ tên / Đơn vị:</span>
                <strong class="text-dark">${cust.ten}</strong>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Số điện thoại:</span>
                <span class="font-monospace fw-bold text-primary">${cust.sdt}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Email:</span>
                <span>${cust.email || '--'}</span>
              </div>
              <div class="py-1">
                <span class="text-muted d-block">Địa chỉ giao hàng:</span>
                <span class="small fw-semibold">${cust.diaChi || '--'}</span>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border h-100">
              <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-chart-pie me-1"></i> Tóm tắt thiết bị</h6>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Tổng máy đã mua:</span>
                <span class="fw-bold fs-6 text-primary">${soldSerials.length} thiết bị</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Thiết bị còn bảo hành:</span>
                <span class="badge bg-success">${underWarrantyCount} thiết bị</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Phiếu xuất liên quan:</span>
                <span class="fw-bold">${relatedVouchers.length} phiếu</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">Ca bảo hành đang mở:</span>
                <span class="badge ${openCases.length > 0 ? 'bg-danger' : 'bg-secondary'}">${openCases.length} ca</span>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="p-3 bg-white rounded-3 border">
              <h6 class="fw-bold text-secondary mb-2"><i class="fa-solid fa-laptop me-1"></i> Danh sách thiết bị đã xuất cho khách (${soldSerials.length})</h6>
              <div class="table-responsive" style="max-height: 200px;">
                <table class="table table-sm table-hover small mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Serial Hãng</th>
                      <th>Mã Nội Bộ</th>
                      <th>Model</th>
                      <th>Phiếu Xuất</th>
                      <th>Hạn BH</th>
                      <th>360°</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${soldSerials.length > 0 ? soldSerials.map(s => `
                      <tr>
                        <td class="font-monospace fw-bold text-primary">${s.serial}</td>
                        <td class="font-monospace">${s.internalId || '--'}</td>
                        <td>${s.model}</td>
                        <td class="font-monospace">${s.maPhieuXuat || '--'}</td>
                        <td class="font-monospace">${s.hanBaoHanh || '--'}</td>
                        <td>
                          <button class="btn btn-xs btn-outline-primary py-0" onclick="bootstrap.Modal.getInstance(document.getElementById('customerSummaryModal')).hide(); openSerial360Modal('${s.serial}')">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('') : '<tr><td colspan="6" class="text-center text-muted">Chưa có máy nào xuất cho khách hàng này</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const btnExport = document.getElementById('btn-cust-summary-create-export');
    if (btnExport) {
      btnExport.onclick = () => {
        startExportForThisCustomer(cust.ten, cust.sdt, cust.diaChi);
      };
    }

    const modalEl = document.getElementById('customerSummaryModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  function startExportForThisCustomer(ten, sdt, diaChi) {
    const modalEl = document.getElementById('customerSummaryModal');
    if (modalEl) {
      const m = bootstrap.Modal.getInstance(modalEl);
      if (m) m.hide();
    }
    switchTab('XuatKho');

    // 1. Điền khách hàng thông qua selectKhachXuat
    if (typeof selectKhachXuat === 'function') {
      selectKhachXuat(ten, sdt, diaChi);
    } else {
      const selectEl = document.getElementById('xuat-khach-select');
      if (selectEl) selectEl.value = ten;
      const inpEl = document.getElementById('xuat-khach-input');
      if (inpEl) inpEl.value = sdt ? `${ten} (${sdt})` : ten;
      const sdtEl = document.getElementById('xuat-sdt');
      if (sdtEl) sdtEl.value = sdt || '';
      const diaChiEl = document.getElementById('xuat-diachi');
      if (diaChiEl) diaChiEl.value = diaChi || '';
    }

    Swal.fire({
      icon: 'info',
      title: 'Đã điền thông tin khách hàng',
      text: `Đã chọn khách hàng [${ten}], mời tiếp tục kiểm tra thiết bị xuất kho!`,
      timer: 1800,
      showConfirmButton: false
    });
  }

  // 8.6 TÓM TẮT NHÀ CUNG CẤP
  function openSupplierSummaryModal(nccCodeOrName) {
    const supp = INITIAL_SUPPLIERS.find(s => 
      s.tenTat === nccCodeOrName || 
      s.tenDayDu.toLowerCase() === (nccCodeOrName || '').toLowerCase()
    ) || { tenTat: nccCodeOrName, tenDayDu: nccCodeOrName, sdt: '--', diaChi: '--' };

    const importVouchers = VOUCHERS_DB.nhap.filter(v => 
      v.status === 'CONFIRMED' && (v.ncc === supp.tenTat || v.ncc === supp.tenDayDu)
    );

    const modelSet = new Set();
    importVouchers.forEach(v => {
      (v.items || []).forEach(it => modelSet.add(it.model));
    });

    const lastVoucher = importVouchers.length > 0 ? importVouchers[0] : null;

    const body = document.getElementById('supplierSummaryModalBody');
    if (body) {
      body.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border">
              <h6 class="fw-bold text-success mb-2"><i class="fa-solid fa-building me-1"></i> Thông tin đối tác NCC</h6>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Mã NCC:</span>
                <strong class="font-monospace text-success">${supp.tenTat}</strong>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Tên doanh nghiệp:</span>
                <span class="fw-bold">${supp.tenDayDu}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Điện thoại:</span>
                <span class="font-monospace">${supp.sdt || '--'}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Email:</span>
                <span>${supp.email || '--'}</span>
              </div>
              <div class="py-1">
                <span class="text-muted d-block">Địa chỉ:</span>
                <span class="small">${supp.diaChi || '--'}</span>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border h-100">
              <h6 class="fw-bold text-success mb-2"><i class="fa-solid fa-file-invoice me-1"></i> Lịch sử nhập hàng</h6>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Tổng số phiếu nhập:</span>
                <span class="fw-bold text-primary fs-6">${importVouchers.length} phiếu</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom">
                <span class="text-muted">Lần nhập gần nhất:</span>
                <span class="font-monospace">${lastVoucher ? `${lastVoucher.maPhieu} (${lastVoucher.ngay})` : 'Chưa có'}</span>
              </div>
              <div class="py-2">
                <span class="text-muted d-block small mb-1">Các Model từng nhập từ NCC:</span>
                <div>
                  ${Array.from(modelSet).map(m => `<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 me-1 mb-1">${m}</span>`).join('') || '<span class="text-muted small">Chưa có</span>'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const modalEl = document.getElementById('supplierSummaryModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  /* ==================================================== */
  /* 16. CÀI ĐẶT & PHÂN QUYỀN (YÊU CẦU 5 & 6)             */
  /* ==================================================== */

  // CẤU HÌNH CẢNH BÁO DASHBOARD (Yêu cầu 1)
  const DEFAULT_ALERT_SETTINGS = {
    draftVoucher: true,
    warrantyWaiting: true,
    warrantyOverdue: true,
    stockAging: true,
    stockAgingDays: 60,
    inventoryOpen: true
  };
  const KEY_ALERT_SETTINGS = 'THANH_AN_ALERT_SETTINGS';
  let ALERT_SETTINGS = { ...DEFAULT_ALERT_SETTINGS };

  function loadAlertSettings() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(KEY_ALERT_SETTINGS);
        if (saved) {
          ALERT_SETTINGS = Object.assign({}, DEFAULT_ALERT_SETTINGS, JSON.parse(saved));
        }
      }
    } catch (e) {
      console.warn('Không thể tải cấu hình cảnh báo:', e);
    }
    if (typeof window !== 'undefined') window.ALERT_SETTINGS = ALERT_SETTINGS;
  }
  loadAlertSettings();

  function renderAlertSettingsForm() {
    if (typeof SETTINGS_SUBTAB_STATE !== 'undefined') {
      SETTINGS_SUBTAB_STATE.alerts.rendered = true;
      SETTINGS_SUBTAB_STATE.alerts.dirty = false;
    }
    const draftEl = document.getElementById('alert-cfg-draftVoucher');
    const waitEl = document.getElementById('alert-cfg-warrantyWaiting');
    const overdueEl = document.getElementById('alert-cfg-warrantyOverdue');
    const invEl = document.getElementById('alert-cfg-inventoryOpen');
    const stockEl = document.getElementById('alert-cfg-stockAging');
    const presetSelect = document.getElementById('alert-cfg-stockAgingDays-preset');
    const customInput = document.getElementById('alert-cfg-stockAgingDays-custom');
    const customWrap = document.getElementById('stock-aging-custom-wrap');
    const labelEl = document.getElementById('stock-aging-effective-label');

    if (draftEl) draftEl.checked = !!ALERT_SETTINGS.draftVoucher;
    if (waitEl) waitEl.checked = !!ALERT_SETTINGS.warrantyWaiting;
    if (overdueEl) overdueEl.checked = !!ALERT_SETTINGS.warrantyOverdue;
    if (invEl) invEl.checked = !!ALERT_SETTINGS.inventoryOpen;
    if (stockEl) stockEl.checked = !!ALERT_SETTINGS.stockAging;

    const days = parseInt(ALERT_SETTINGS.stockAgingDays) || 60;
    const standardDays = [30, 45, 60, 90, 120];

    if (presetSelect) {
      if (standardDays.includes(days)) {
        presetSelect.value = String(days);
        if (customWrap) customWrap.style.display = 'none';
      } else {
        presetSelect.value = 'custom';
        if (customWrap) customWrap.style.display = 'block';
        if (customInput) customInput.value = days;
      }
    }
    if (labelEl) labelEl.textContent = `(Ngưỡng áp dụng: >${days} ngày)`;
    toggleStockAgingInputs();
  }

  function toggleStockAgingInputs() {
    const stockEl = document.getElementById('alert-cfg-stockAging');
    const grp = document.getElementById('stock-aging-config-group');
    if (grp && stockEl) {
      grp.style.opacity = stockEl.checked ? '1' : '0.4';
      grp.style.pointerEvents = stockEl.checked ? 'auto' : 'none';
    }
  }

  function onStockAgingPresetChange() {
    const presetSelect = document.getElementById('alert-cfg-stockAgingDays-preset');
    const customWrap = document.getElementById('stock-aging-custom-wrap');
    const customInput = document.getElementById('alert-cfg-stockAgingDays-custom');
    const labelEl = document.getElementById('stock-aging-effective-label');
    if (!presetSelect) return;

    if (presetSelect.value === 'custom') {
      if (customWrap) customWrap.style.display = 'block';
      const customVal = parseInt(customInput?.value) || 60;
      if (labelEl) labelEl.textContent = `(Ngưỡng áp dụng: >${customVal} ngày)`;
    } else {
      if (customWrap) customWrap.style.display = 'none';
      if (labelEl) labelEl.textContent = `(Ngưỡng áp dụng: >${presetSelect.value} ngày)`;
    }
  }

  function saveAlertSettings() {
    try {
      const draftVoucher = document.getElementById('alert-cfg-draftVoucher')?.checked ?? true;
      const warrantyWaiting = document.getElementById('alert-cfg-warrantyWaiting')?.checked ?? true;
      const warrantyOverdue = document.getElementById('alert-cfg-warrantyOverdue')?.checked ?? true;
      const inventoryOpen = document.getElementById('alert-cfg-inventoryOpen')?.checked ?? true;
      const stockAging = document.getElementById('alert-cfg-stockAging')?.checked ?? true;

      const presetVal = document.getElementById('alert-cfg-stockAgingDays-preset')?.value;
      let stockAgingDays = 60;
      if (presetVal === 'custom') {
        const customVal = parseInt(document.getElementById('alert-cfg-stockAgingDays-custom')?.value);
        stockAgingDays = (!isNaN(customVal) && customVal > 0) ? customVal : 60;
      } else {
        stockAgingDays = parseInt(presetVal) || 60;
      }

      ALERT_SETTINGS = {
        draftVoucher,
        warrantyWaiting,
        warrantyOverdue,
        stockAging,
        stockAgingDays,
        inventoryOpen
      };
      if (typeof window !== 'undefined') window.ALERT_SETTINGS = ALERT_SETTINGS;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY_ALERT_SETTINGS, JSON.stringify(ALERT_SETTINGS));
      }
      recordAuditLog('CẬP NHẬT CÀI ĐẶT', 'Cấu hình cảnh báo Dashboard', '', JSON.stringify(ALERT_SETTINGS), 'Lưu cấu hình cảnh báo Dashboard');
      if (typeof markModulesDirty === 'function') {
        markModulesDirty(['Dashboard', 'CaiDat']);
      }
      renderAlertSettingsForm();
      Swal.fire('Thành công', 'Đã lưu cấu hình cảnh báo Dashboard!', 'success');
      renderDashboard();
    } catch (e) {
      console.error(e);
      Swal.fire('Lỗi', 'Không thể lưu cấu hình: ' + e.message, 'error');
    }
  }

  function resetAlertSettings() {
    ALERT_SETTINGS = { ...DEFAULT_ALERT_SETTINGS };
    if (typeof window !== 'undefined') window.ALERT_SETTINGS = ALERT_SETTINGS;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(KEY_ALERT_SETTINGS);
      }
    } catch (e) {}
    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['Dashboard', 'CaiDat']);
    }
    renderAlertSettingsForm();
    Swal.fire('Đã đặt lại', 'Đã khôi phục cấu hình cảnh báo về mặc định!', 'info');
    renderDashboard();
  }

  function goToTonKhoAll() {
    if (typeof switchTab === 'function') switchTab('TonKho');
    if (typeof setStockViewMode === 'function') setStockViewMode('MODEL');
    const elKho = document.getElementById('filter-stock-kho');
    const elNhom = document.getElementById('filter-stock-nhom');
    const elKw = document.getElementById('filter-stock-keyword');
    const elAging = document.getElementById('filter-stock-aging');
    const elSt = document.getElementById('filter-stock-status');
    if (elKho) elKho.value = '';
    if (elNhom) elNhom.value = '';
    if (elKw) elKw.value = '';
    if (elAging) elAging.value = '';
    if (elSt) elSt.value = 'IN_STOCK';
    if (typeof renderTonKho === 'function') renderTonKho();
  }

  function goToHistoryNhap() {
    if (typeof switchTab === 'function') switchTab('LichSu');
    setTimeout(() => {
      if (typeof switchHistoryTab === 'function') switchHistoryTab('NHAP');
    }, 120);
  }

  function goToHistoryXuat() {
    if (typeof switchTab === 'function') switchTab('LichSu');
    setTimeout(() => {
      if (typeof switchHistoryTab === 'function') switchHistoryTab('XUAT');
    }, 120);
  }

  function goToStockAgingDetail() {
    let count60Plus = 0;
    if (typeof SERIAL_DB !== 'undefined' && Array.isArray(SERIAL_DB)) {
      count60Plus = SERIAL_DB.filter(s => s.status === 'IN_STOCK' && typeof calculateStockAging === 'function' && calculateStockAging(s.ngayNhap) > 60).length;
    }
    if (count60Plus > 0) {
      openStockAgingAction(60);
    } else {
      goToTonKhoByAgingRange('31-60');
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Kho chưa có máy tồn > 60 ngày. Đang hiển thị nhóm tồn lâu nhất (31-60 ngày).',
          showConfirmButton: false,
          timer: 3500
        });
      }
    }
  }

  function goToStockAgingWarning() {
    let countWarning = 0;
    const thresh = (typeof ALERT_SETTINGS !== 'undefined' && ALERT_SETTINGS.agingDays) ? ALERT_SETTINGS.agingDays : 60;
    if (typeof SERIAL_DB !== 'undefined' && Array.isArray(SERIAL_DB)) {
      countWarning = SERIAL_DB.filter(s => s.status === 'IN_STOCK' && typeof calculateStockAging === 'function' && calculateStockAging(s.ngayNhap) > thresh).length;
    }
    if (countWarning > 0) {
      openStockAgingAction(thresh);
    } else {
      goToTonKhoAll();
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Tuyệt vời! Hiện không có thiết bị nào bị tồn quá hạn cảnh báo (> ${thresh} ngày).`,
          showConfirmButton: false,
          timer: 3500
        });
      }
    }
  }

  function goToTonKhoByCategory(catName) {
    if (typeof switchTab === 'function') switchTab('TonKho');
    if (typeof setStockViewMode === 'function') setStockViewMode('SERIAL');
    const elKho = document.getElementById('filter-stock-kho');
    const elNhom = document.getElementById('filter-stock-nhom');
    const elKw = document.getElementById('filter-stock-keyword');
    const elAging = document.getElementById('filter-stock-aging');
    const elSt = document.getElementById('filter-stock-status');
    if (elKho) elKho.value = '';
    if (elKw) elKw.value = '';
    if (elAging) elAging.value = '';
    if (elSt) elSt.value = 'IN_STOCK';
    if (elNhom && catName) elNhom.value = catName;
    if (typeof renderTonKho === 'function') renderTonKho();
  }

  function goToTonKhoByAgingRange(rangeVal) {
    if (typeof switchTab === 'function') switchTab('TonKho');
    if (typeof setStockViewMode === 'function') setStockViewMode('SERIAL');
    const elKho = document.getElementById('filter-stock-kho');
    const elNhom = document.getElementById('filter-stock-nhom');
    const elKw = document.getElementById('filter-stock-keyword');
    const elAging = document.getElementById('filter-stock-aging');
    const elSt = document.getElementById('filter-stock-status');
    if (elKho) elKho.value = '';
    if (elNhom) elNhom.value = '';
    if (elKw) elKw.value = '';
    if (elSt) elSt.value = 'IN_STOCK';
    if (elAging) {
      let opt = Array.from(elAging.options).find(o => o.value === String(rangeVal));
      if (!opt) {
        opt = document.createElement('option');
        opt.value = String(rangeVal);
        opt.textContent = `Tồn ${rangeVal} ngày`;
        elAging.appendChild(opt);
      }
      elAging.value = String(rangeVal);
    }
    if (typeof renderTonKho === 'function') renderTonKho();
  }

  function goToTonKhoByModel(modelName) {
    if (typeof switchTab === 'function') switchTab('TonKho');
    if (typeof setStockViewMode === 'function') setStockViewMode('SERIAL');
    const elKho = document.getElementById('filter-stock-kho');
    const elNhom = document.getElementById('filter-stock-nhom');
    const elKw = document.getElementById('filter-stock-keyword');
    const elAging = document.getElementById('filter-stock-aging');
    const elSt = document.getElementById('filter-stock-status');
    if (elKho) elKho.value = '';
    if (elNhom) elNhom.value = '';
    if (elAging) elAging.value = '';
    if (elSt) elSt.value = 'IN_STOCK';
    if (elKw && modelName) elKw.value = modelName;
    if (typeof renderTonKho === 'function') renderTonKho();
  }

  function openStockAgingAction(days) {
    switchTab('TonKho');
    if (typeof setStockViewMode === 'function') {
      setStockViewMode('SERIAL');
    }
    const elKho = document.getElementById('filter-stock-kho');
    const elNhom = document.getElementById('filter-stock-nhom');
    const elKw = document.getElementById('filter-stock-keyword');
    const elSt = document.getElementById('filter-stock-status');
    if (elKho) elKho.value = '';
    if (elNhom) elNhom.value = '';
    if (elKw) elKw.value = '';
    if (elSt) elSt.value = 'IN_STOCK';

    const filterAging = document.getElementById('filter-stock-aging');
    if (filterAging) {
      let opt = Array.from(filterAging.options).find(o => o.value == days);
      if (!opt && days) {
        opt = document.createElement('option');
        opt.value = String(days);
        opt.textContent = `Tồn > ${days} ngày`;
        filterAging.appendChild(opt);
      }
      filterAging.value = String(days);
    }
    if (typeof renderTonKho === 'function') {
      renderTonKho();
    }
  }

  const SETTINGS_SUBTAB_STATE = {
    profile: { rendered: false, dirty: true },
    rbac: { rendered: false, dirty: true },
    audit: { rendered: false, dirty: true },
    backup: { rendered: false, dirty: true },
    permissions: { rendered: false, dirty: true },
    customfields: { rendered: false, dirty: true },
    alerts: { rendered: false, dirty: true }
  };
  if (typeof window !== 'undefined') window.SETTINGS_SUBTAB_STATE = SETTINGS_SUBTAB_STATE;
  let SETTINGS_SUBTABS_INITIALIZED = false;

  function renderSettingsModule(forceTab) {
    initSettingsSubtabsListener();

    let targetTab = forceTab;
    if (!targetTab) {
      if (document.getElementById('tab-set-permissions')?.classList.contains('active')) targetTab = 'permissions';
      else if (document.getElementById('tab-set-rbac')?.classList.contains('active')) targetTab = 'rbac';
      else if (document.getElementById('tab-set-profile')?.classList.contains('active')) targetTab = 'profile';
      else if (document.getElementById('tab-set-audit')?.classList.contains('active')) targetTab = 'audit';
      else if (document.getElementById('tab-set-backup')?.classList.contains('active')) targetTab = 'backup';
      else targetTab = 'permissions';
    }

    renderActiveSettingsSubtab(targetTab);
  }

  function renderActiveSettingsSubtab(tabName) {
    if (tabName === 'permissions') {
      if (!SETTINGS_SUBTAB_STATE.permissions.rendered || SETTINGS_SUBTAB_STATE.permissions.dirty) {
        renderPermissionsMatrix();
      }
    } else if (tabName === 'rbac') {
      if (!SETTINGS_SUBTAB_STATE.rbac.rendered || SETTINGS_SUBTAB_STATE.rbac.dirty) {
        renderRbacUsersTable();
      }
    } else if (tabName === 'profile') {
      if (!SETTINGS_SUBTAB_STATE.profile.rendered || SETTINGS_SUBTAB_STATE.profile.dirty) {
        renderAlertSettingsForm();
      }
    } else if (tabName === 'audit') {
      if (!SETTINGS_SUBTAB_STATE.audit.rendered || SETTINGS_SUBTAB_STATE.audit.dirty) {
        renderAuditTrailTable();
      }
    } else if (tabName === 'backup') {
      if (typeof renderDemoBackupList === 'function') {
        renderDemoBackupList();
      }
    }
  }

  function initSettingsSubtabsListener() {
    if (SETTINGS_SUBTABS_INITIALIZED) return;
    if (typeof document === 'undefined') return;

    const mapping = [
      { sel: '#settingsTabs [data-bs-target="#tab-set-permissions"]', name: 'permissions' },
      { sel: '#settingsTabs [data-bs-target="#tab-set-rbac"]', name: 'rbac' },
      { sel: '#settingsTabs [data-bs-target="#tab-set-profile"]', name: 'profile' },
      { sel: '#settingsTabs [data-bs-target="#tab-set-audit"]', name: 'audit' },
      { sel: '#settingsTabs [data-bs-target="#tab-set-backup"]', name: 'backup' }
    ];

    mapping.forEach(m => {
      const el = document.querySelector(m.sel);
      if (el) {
        el.addEventListener('shown.bs.tab', () => renderActiveSettingsSubtab(m.name));
        el.addEventListener('click', () => renderActiveSettingsSubtab(m.name));
      }
    });

    SETTINGS_SUBTABS_INITIALIZED = true;
  }

  // 1. RBAC QUẢN LÝ TÀI KHOẢN NHÂN VIÊN (CHUẨN ẢNH 5)
  function renderRbacUsersTable() {
    const tbody = document.getElementById('rbac-users-table-body');
    if (!tbody) return;
    SETTINGS_SUBTAB_STATE.rbac.rendered = true;
    SETTINGS_SUBTAB_STATE.rbac.dirty = false;

    if (!Array.isArray(USERS_DB) || USERS_DB.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Chưa có tài khoản nhân sự.</td></tr>';
      return;
    }

    tbody.innerHTML = USERS_DB.map(u => {
      let roleBadge = '';
      if (u.role === 'ADMIN') roleBadge = '<span class="badge bg-danger">Admin</span>';
      else if (u.role === 'QUẢN LÝ') roleBadge = '<span class="badge bg-info text-dark">Quản lý</span>';
      else if (u.role === 'THỦ KHO') roleBadge = '<span class="badge bg-primary">Kho</span>';
      else roleBadge = '<span class="badge bg-warning text-dark">Bảo hành</span>';

      const statusBadge = (u.status === 'ACTIVE') 
        ? '<span class="badge bg-success">Kích hoạt</span>' 
        : '<span class="badge bg-secondary">Khóa</span>';

      const isAdminUser = (u.username.toLowerCase() === 'admin' || u.role === 'ADMIN');
      const changePassBtn = isAdminUser 
        ? `<button class="btn btn-sm btn-outline-primary p-1 px-2 me-1" title="Đổi mật khẩu Admin" onclick="openChangePasswordModal()"><i class="fa-solid fa-key"></i></button>`
        : '';
      const deleteBtn = (u.username.toLowerCase() === 'admin')
        ? `<button class="btn btn-sm btn-outline-secondary p-1 px-2 disabled" title="Không thể xóa tài khoản Admin chính" disabled><i class="fa-solid fa-lock"></i></button>`
        : `<button class="btn btn-sm btn-outline-danger p-1 px-2" title="Xóa tài khoản" onclick="deleteRbacUser('${escapeHtml(u.username)}')"><i class="fa-solid fa-trash-can"></i></button>`;

      return `
        <tr>
          <td class="ps-4 fw-bold text-primary font-monospace">${escapeHtml(u.username)}</td>
          <td class="fw-semibold text-dark">${escapeHtml(u.fullName)}</td>
          <td>${roleBadge}</td>
          <td>${statusBadge}</td>
          <td class="text-center">
            ${changePassBtn}
            <button class="btn btn-sm btn-outline-warning p-1 px-2 me-1" title="Sửa tài khoản" onclick="editRbacUser('${escapeHtml(u.username)}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            ${deleteBtn}
          </td>
        </tr>
      `;
    }).join('');
  }

  function saveRbacUser() {
    const uInput = document.getElementById('rbac-input-username');
    const pInput = document.getElementById('rbac-input-password');
    const nameInput = document.getElementById('rbac-input-fullname');
    const roleInput = document.getElementById('rbac-input-role');
    const statusInput = document.getElementById('rbac-input-status');

    const username = (uInput?.value || '').trim();
    const password = (pInput?.value || '').trim();
    const fullName = (nameInput?.value || '').trim();
    const role = roleInput?.value || 'THỦ KHO';
    const status = statusInput?.value || 'ACTIVE';

    if (!username || !fullName) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng nhập Username và Họ tên nhân viên!' });
      } else {
        alert('Vui lòng nhập Username và Họ tên nhân viên!');
      }
      return;
    }

    const existingIdx = USERS_DB.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingIdx >= 0) {
      USERS_DB[existingIdx].fullName = fullName;
      USERS_DB[existingIdx].role = role;
      USERS_DB[existingIdx].status = status;
      if (password) USERS_DB[existingIdx].password = password;
      recordAuditLog('SỬA TÀI KHOẢN', 'RBAC', username, '', `Cập nhật thông tin nhân viên ${fullName} (${role})`);
    } else {
      USERS_DB.push({
        username: username,
        fullName: fullName,
        role: role,
        status: status,
        password: password || '123456'
      });
      recordAuditLog('TẠO TÀI KHOẢN', 'RBAC', username, '', `Thêm tài khoản nhân viên ${fullName} (${role})`);
    }

    renderRbacUsersTable();
    resetRbacForm();

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('THANH_AN_USERS_DB', JSON.stringify(USERS_DB));
      }
    } catch(e) {}

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      try {
        google.script.run.saveUserAccountBackend({ username, fullName, role, status, password });
      } catch(e) {}
    }

    if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: 'success', title: 'Thành công', text: `Đã lưu tài khoản nhân sự [${username}]!`, timer: 1500, showConfirmButton: false });
    }
  }

  function editRbacUser(username) {
    const u = USERS_DB.find(x => x.username === username);
    if (!u) return;
    const uInput = document.getElementById('rbac-input-username');
    if (uInput) {
      uInput.value = u.username;
      uInput.readOnly = true;
    }
    const pInput = document.getElementById('rbac-input-password');
    if (pInput) pInput.value = '';
    const nameInput = document.getElementById('rbac-input-fullname');
    if (nameInput) nameInput.value = u.fullName;
    const roleInput = document.getElementById('rbac-input-role');
    if (roleInput) roleInput.value = u.role;
    const statusInput = document.getElementById('rbac-input-status');
    if (statusInput) statusInput.value = u.status;

    const badge = document.getElementById('rbac-mode-badge');
    if (badge) badge.innerHTML = '<i class="fa-solid fa-pen-to-square me-1"></i> Chế độ: Chỉnh sửa (Click để hủy)';
    const btn = document.getElementById('btn-save-rbac-user');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Cập nhật';
  }

  function deleteRbacUser(username) {
    if (username.toLowerCase() === 'admin') {
      if (typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'Không thể xóa', text: 'Không được phép xóa tài khoản Admin quản trị hệ thống!' });
      return;
    }
    const doDelete = () => {
      USERS_DB = USERS_DB.filter(x => x.username !== username);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('THANH_AN_USERS_DB', JSON.stringify(USERS_DB));
        }
      } catch(e) {}
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        try {
          google.script.run.deleteUserAccountBackend(username);
        } catch(e) {}
      }
      recordAuditLog('XÓA TÀI KHOẢN', 'RBAC', username, '', `Xóa tài khoản nhân viên ${username}`);
      renderRbacUsersTable();
      resetRbacForm();
      if (typeof Swal !== 'undefined') Swal.fire({ icon: 'success', title: 'Đã xóa', text: `Tài khoản ${username} đã được xóa.`, timer: 1500, showConfirmButton: false });
    };

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: `Xóa tài khoản ${username}?`,
        text: 'Thao tác này sẽ thu hồi toàn bộ quyền đăng nhập của nhân viên!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa ngay',
        cancelButtonText: 'Hủy'
      }).then(res => { if (res.isConfirmed) doDelete(); });
    } else {
      if (confirm(`Bạn có chắc muốn xóa tài khoản ${username}?`)) doDelete();
    }
  }

  function resetRbacForm() {
    const uInput = document.getElementById('rbac-input-username');
    if (uInput) {
      uInput.value = '';
      uInput.readOnly = false;
    }
    const pInput = document.getElementById('rbac-input-password');
    if (pInput) pInput.value = '';
    const nameInput = document.getElementById('rbac-input-fullname');
    if (nameInput) nameInput.value = '';
    const roleInput = document.getElementById('rbac-input-role');
    if (roleInput) roleInput.value = 'THỦ KHO';
    const statusInput = document.getElementById('rbac-input-status');
    if (statusInput) statusInput.value = 'ACTIVE';

    const badge = document.getElementById('rbac-mode-badge');
    if (badge) badge.innerHTML = '<i class="fa-solid fa-user-plus me-1"></i> Chế độ: Thêm mới';
    const btn = document.getElementById('btn-save-rbac-user');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-floppy-disk me-1"></i> Lưu';
  }

  function saveCompanyProfile() {
    const name = document.getElementById('cfg-company-name')?.value || '';
    const phone = document.getElementById('cfg-company-phone')?.value || '';
    recordAuditLog('CẬP NHẬT HỒ SƠ', 'Cài đặt công ty', name, '', `Cập nhật thông tin doanh nghiệp, Hotline: ${phone}`);
    if (typeof Swal !== 'undefined') {
      Swal.fire({ icon: 'success', title: 'Đã lưu hồ sơ doanh nghiệp!', timer: 1500, showConfirmButton: false });
    }
  }

  function renderAuditTrailTable() {
    const tbody = document.getElementById('audit-trail-settings-table-body');
    if (!tbody) return;
    SETTINGS_SUBTAB_STATE.audit.rendered = true;
    SETTINGS_SUBTAB_STATE.audit.dirty = false;

    if (typeof hasPermission === 'function' && !hasPermission('Audit.View')) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4"><i class="fa-solid fa-lock me-2"></i>Bạn không có quyền xem Nhật ký Kiểm toán (Audit.View)</td></tr>';
      return;
    }

    const keyword = (document.getElementById('audit-filter-keyword')?.value || '').trim().toLowerCase();
    let logs = typeof AUDIT_LOG_DB !== 'undefined' ? [...AUDIT_LOG_DB] : [];
    if (keyword) {
      logs = logs.filter(l => 
        (l.user && l.user.toLowerCase().includes(keyword)) ||
        (l.action && l.action.toLowerCase().includes(keyword)) ||
        (l.target && l.target.toLowerCase().includes(keyword)) ||
        (l.reason && l.reason.toLowerCase().includes(keyword))
      );
    }

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Không có bản ghi nhật ký phù hợp.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.slice(0, 50).map(l => {
      let actionBadge = '<span class="badge bg-secondary">' + escapeHtml(l.action) + '</span>';
      if (l.action.includes('HỦY') || l.action.includes('XÓA') || l.action.includes('RESET')) {
        actionBadge = '<span class="badge bg-danger">' + escapeHtml(l.action) + '</span>';
      } else if (l.action.includes('SỬA') || l.action.includes('CẬP NHẬT')) {
        actionBadge = '<span class="badge bg-warning text-dark">' + escapeHtml(l.action) + '</span>';
      } else if (l.action.includes('TẠO') || l.action.includes('NHẬP') || l.action.includes('SAO LƯU')) {
        actionBadge = '<span class="badge bg-success">' + escapeHtml(l.action) + '</span>';
      }

      return `
        <tr>
          <td class="ps-3 text-muted">${escapeHtml(l.time || '')}</td>
          <td class="fw-semibold text-dark">${escapeHtml(l.user || '')}</td>
          <td>${actionBadge}</td>
          <td class="font-monospace text-primary">${escapeHtml(l.target || '')}</td>
          <td class="text-truncate" style="max-width: 250px;" title="${escapeHtml(l.reason || '')}">${escapeHtml(l.reason || '')}</td>
          <td class="small text-muted font-monospace">${escapeHtml(l.details || '')}</td>
        </tr>
      `;
    }).join('');
  }

  function filterAuditTrailTable() {
    renderAuditTrailTable();
  }

  // 6. MA TRẬN PHÂN QUYỀN (20 Quyền)
  function renderPermissionsMatrix() {
    const tbody = document.getElementById('permissions-matrix-table-body');
    if (!tbody) return;
    SETTINGS_SUBTAB_STATE.permissions.rendered = true;
    SETTINGS_SUBTAB_STATE.permissions.dirty = false;

    const roles = ['THỦ KHO', 'BẢO HÀNH', 'QUẢN LÝ', 'ADMIN'];

    tbody.innerHTML = ALL_PERMISSIONS.map(p => {
      return `
        <tr>
          <td class="text-start">
            <div class="fw-bold text-dark">${p.name}</div>
            <span class="font-monospace text-muted small">${p.code}</span>
          </td>
          <td><span class="badge bg-light text-dark border">${p.group}</span></td>
          ${roles.map(role => {
            const isGranted = (ROLE_PERMISSIONS[role] || []).includes(p.code);
            const isAdmin = role === 'ADMIN';
            return `
              <td class="text-center">
                <input type="checkbox" class="form-check-input perm-cb" 
                       data-role="${role}" 
                       data-perm="${p.code}" 
                       ${isGranted ? 'checked' : ''} 
                       ${isAdmin ? 'disabled' : ''}>
              </td>
            `;
          }).join('')}
        </tr>
      `;
    }).join('');
  }

  function savePermissionsMatrix() {
    if (!checkPermission(['ADMIN'], 'Chỉnh sửa ma trận quyền hạn')) return;

    const checkboxes = document.querySelectorAll('.perm-cb');
    const newPerms = {
      'THỦ KHO': [],
      'BẢO HÀNH': [],
      'QUẢN LÝ': [],
      'ADMIN': ALL_PERMISSIONS.map(p => p.code)
    };

    checkboxes.forEach(cb => {
      const role = cb.getAttribute('data-role');
      const perm = cb.getAttribute('data-perm');
      if (role && role !== 'ADMIN' && cb.checked) {
        newPerms[role].push(perm);
      }
    });

    ROLE_PERMISSIONS = newPerms;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('THANH_AN_ROLE_PERMISSIONS', JSON.stringify(newPerms));
      }
    } catch(e) {}
    recordAuditLog('CẬP NHẬT PHÂN QUYỀN', 'Permission Matrix', 'Cũ', 'Mới', 'Thay đổi cấu hình quyền các vai trò');
    updateUIPermissions();

    Swal.fire({
      icon: 'success',
      title: 'Đã lưu Ma Trận Phân Quyền!',
      text: 'Giao diện hệ thống và quyền thao tác của các vai trò đã được cập nhật ngay lập tức.',
      timer: 1500,
      showConfirmButton: false
    });
  }

  function resetPermissionsMatrix() {
    if (!checkPermission(['ADMIN'], 'Đặt lại phân quyền')) return;
    ROLE_PERMISSIONS = {
      'THỦ KHO': [
        'Dashboard.View', 'Stock.View', 'Import.Create', 'Export.Create',
        'Return.Customer', 'Return.Supplier', 'Warehouse.Transfer',
        'Stocktake.Create', 'Catalog.View'
      ],
      'BẢO HÀNH': [
        'Dashboard.View', 'Stock.View', 'Warranty.Create', 'Warranty.Update',
        'Catalog.View'
      ],
      'QUẢN LÝ': [
        'Dashboard.View', 'Stock.View', 'Import.Create', 'Export.Create',
        'Voucher.Edit', 'Voucher.Cancel', 'Return.Customer', 'Return.Supplier',
        'Warehouse.Transfer', 'Stocktake.Create', 'Stocktake.Close',
        'Stock.Adjust', 'Warranty.Create', 'Warranty.Update', 'Catalog.View',
        'Catalog.Edit', 'Audit.View', 'CustomFields.Manage'
      ],
      'ADMIN': ALL_PERMISSIONS.map(p => p.code)
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('THANH_AN_ROLE_PERMISSIONS', JSON.stringify(ROLE_PERMISSIONS));
      }
    } catch(e) {}
    renderPermissionsMatrix();
    updateUIPermissions();
    Swal.fire('Đã đặt lại', 'Đã khôi phục ma trận quyền hạn về cấu hình chuẩn', 'info');
  }

  // 5. TRƯỜNG DỮ LIỆU TÙY CHỈNH (CUSTOM FIELDS)
  function renderCustomFieldsTable() {
    const tbody = document.getElementById('custom-fields-table-body');
    if (!tbody) return;
    SETTINGS_SUBTAB_STATE.customfields.rendered = true;
    SETTINGS_SUBTAB_STATE.customfields.dirty = false;

    if (CUSTOM_FIELDS_DB.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Chưa có trường tùy chỉnh nào được tạo</td></tr>';
      return;
    }

    tbody.innerHTML = CUSTOM_FIELDS_DB.map(f => `
      <tr class="${f.active === false ? 'table-secondary text-muted' : ''}">
        <td data-label="Tên Trường"><strong>${f.name}</strong></td>
        <td data-label="Mã Field"><code class="text-primary">${f.code}</code></td>
        <td data-label="Module"><span class="badge bg-light text-dark border">${f.module}</span></td>
        <td data-label="Kiểu"><span class="badge bg-secondary">${f.type}</span></td>
        <td data-label="Bắt Buộc" class="text-center">
          ${f.required ? '<span class="badge bg-danger">Bắt buộc</span>' : '<span class="badge bg-light text-muted border">Không</span>'}
        </td>
        <td data-label="Cấu Hình">
          <small class="d-block">Form: ${(f.showForm !== false && f.showOnForm !== false) ? '✅' : '❌'} | Bảng: ${(f.showTable !== false && f.showOnTable !== false) ? '✅' : '❌'}</small>
          <small class="d-block">Search: ${(f.searchable !== false && f.allowSearch !== false) ? '✅' : '❌'} | Filter: ${(f.filterable || f.allowFilter) ? '✅' : '❌'}</small>
        </td>
        <td data-label="Thứ Tự" class="text-center font-monospace">${f.order || 1}</td>
        <td data-label="Trạng Thái">
          ${f.active !== false ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Inactive</span>'}
        </td>
        <td data-label="Thao Tác" class="text-end">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Sửa cấu hình" onclick="openCreateCustomFieldModal('${f.code}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn ${f.active !== false ? 'btn-outline-danger' : 'btn-outline-success'}" 
                    title="${f.active !== false ? 'Ngừng dùng' : 'Kích hoạt'}" 
                    onclick="toggleCustomFieldActive('${f.code}')">
              <i class="fa-solid ${f.active !== false ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  let EDITING_CUSTOM_FIELD_CODE = null;

  function toggleCustomFieldOptions(type) {
    const val = type || document.getElementById('cf-type')?.value;
    const container = document.getElementById('cf-options-container') || document.getElementById('cf-dropdown-options-group');
    if (container) {
      container.style.display = (val === 'Dropdown') ? 'block' : 'none';
    }
  }

  function toggleCustomFieldDropdownOptions() {
    toggleCustomFieldOptions();
  }

  function openCreateCustomFieldModal(fieldCode = null) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Quản lý Custom Fields')) return;

    EDITING_CUSTOM_FIELD_CODE = fieldCode;
    const isEdit = !!fieldCode;
    const title = document.getElementById('customFieldModalTitle') || document.getElementById('custom-field-modal-title');
    if (title) title.innerHTML = isEdit ? `<i class="fa-solid fa-pen text-primary me-1"></i> Sửa Trường Tùy Chỉnh: <strong>${fieldCode}</strong>` : '<i class="fa-solid fa-sliders text-primary me-1"></i> Tạo Trường Dữ Liệu Tùy Chỉnh (Custom Field)';

    const codeInput = document.getElementById('cf-code');
    if (codeInput) {
      codeInput.readOnly = isEdit;
    }

    if (isEdit) {
      const f = CUSTOM_FIELDS_DB.find(x => x.code === fieldCode);
      if (f) {
        if (document.getElementById('cf-name')) document.getElementById('cf-name').value = f.name || '';
        if (document.getElementById('cf-code')) document.getElementById('cf-code').value = f.code || '';
        if (document.getElementById('cf-module')) document.getElementById('cf-module').value = f.module || 'Model';
        if (document.getElementById('cf-type')) document.getElementById('cf-type').value = f.type || 'Text';
        
        const defaultEl = document.getElementById('cf-default-val') || document.getElementById('cf-default');
        if (defaultEl) defaultEl.value = f.defaultValue || '';
        
        const optionsEl = document.getElementById('cf-options') || document.getElementById('cf-dropdown-options');
        if (optionsEl) optionsEl.value = (f.options || []).join(', ');

        const orderEl = document.getElementById('cf-order');
        if (orderEl) orderEl.value = f.order || 1;

        const reqEl = document.getElementById('cf-required');
        if (reqEl) reqEl.checked = !!f.required;

        const showFormEl = document.getElementById('cf-show-form');
        if (showFormEl) showFormEl.checked = (f.showForm !== false && f.showOnForm !== false);

        const showTableEl = document.getElementById('cf-show-table');
        if (showTableEl) showTableEl.checked = (f.showTable !== false && f.showOnTable !== false);

        const searchEl = document.getElementById('cf-searchable') || document.getElementById('cf-allow-search');
        if (searchEl) searchEl.checked = (f.searchable !== false && f.allowSearch !== false);

        const filterEl = document.getElementById('cf-filterable') || document.getElementById('cf-allow-filter');
        if (filterEl) filterEl.checked = !!(f.filterable || f.allowFilter);

        toggleCustomFieldOptions(f.type);
      }
    } else {
      if (document.getElementById('cf-name')) document.getElementById('cf-name').value = '';
      if (document.getElementById('cf-code')) document.getElementById('cf-code').value = '';
      if (document.getElementById('cf-module')) document.getElementById('cf-module').value = 'Model';
      if (document.getElementById('cf-type')) document.getElementById('cf-type').value = 'Text';

      const defaultEl = document.getElementById('cf-default-val') || document.getElementById('cf-default');
      if (defaultEl) defaultEl.value = '';

      const optionsEl = document.getElementById('cf-options') || document.getElementById('cf-dropdown-options');
      if (optionsEl) optionsEl.value = '';

      const orderEl = document.getElementById('cf-order');
      if (orderEl) orderEl.value = CUSTOM_FIELDS_DB.length + 1;

      const reqEl = document.getElementById('cf-required');
      if (reqEl) reqEl.checked = false;

      const showFormEl = document.getElementById('cf-show-form');
      if (showFormEl) showFormEl.checked = true;

      const showTableEl = document.getElementById('cf-show-table');
      if (showTableEl) showTableEl.checked = true;

      const searchEl = document.getElementById('cf-searchable') || document.getElementById('cf-allow-search');
      if (searchEl) searchEl.checked = true;

      const filterEl = document.getElementById('cf-filterable') || document.getElementById('cf-allow-filter');
      if (filterEl) filterEl.checked = false;

      toggleCustomFieldOptions('Text');
    }

    const modalEl = document.getElementById('customFieldModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  function submitCustomField() {
    const name = (document.getElementById('cf-name')?.value || '').trim();
    const code = (document.getElementById('cf-code')?.value || '').trim().toUpperCase();
    const module = document.getElementById('cf-module')?.value || 'Model';
    const type = document.getElementById('cf-type')?.value || 'Text';
    
    const defaultValue = (document.getElementById('cf-default-val')?.value || document.getElementById('cf-default')?.value || '').trim();
    const optionsRaw = (document.getElementById('cf-options')?.value || document.getElementById('cf-dropdown-options')?.value || '').trim();
    const order = parseInt(document.getElementById('cf-order')?.value) || (CUSTOM_FIELDS_DB.length + 1);
    
    const required = !!document.getElementById('cf-required')?.checked;
    const showForm = document.getElementById('cf-show-form') ? document.getElementById('cf-show-form').checked : true;
    const showTable = document.getElementById('cf-show-table') ? document.getElementById('cf-show-table').checked : true;
    const searchable = document.getElementById('cf-searchable') ? document.getElementById('cf-searchable').checked : (document.getElementById('cf-allow-search') ? document.getElementById('cf-allow-search').checked : true);
    const filterable = document.getElementById('cf-filterable') ? document.getElementById('cf-filterable').checked : (document.getElementById('cf-allow-filter') ? document.getElementById('cf-allow-filter').checked : false);

    if (!name || !code) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập Tên trường và Field Code!', 'warning');
      return;
    }

    let options = [];
    if (type === 'Dropdown') {
      // Cho phép phân cách bằng cả dấu phẩy lẫn xuống dòng
      options = optionsRaw.split(/[,\n]+/).map(x => x.trim()).filter(x => x);
      if (options.length === 0) {
        Swal.fire('Lỗi', 'Trường Dropdown phải có ít nhất 1 giá trị lựa chọn!', 'warning');
        return;
      }
    }

    if (EDITING_CUSTOM_FIELD_CODE) {
      // Sửa
      const f = CUSTOM_FIELDS_DB.find(x => x.code === EDITING_CUSTOM_FIELD_CODE);
      if (f) {
        Object.assign(f, {
          name, module, type, defaultValue, options, order,
          required, showForm, showOnForm: showForm,
          showTable, showOnTable: showTable,
          searchable, allowSearch: searchable,
          filterable, allowFilter: filterable
        });
        recordAuditLog('SỬA CUSTOM FIELD', `Field ${code}`, 'Cũ', 'Mới', 'Cập nhật cấu hình trường dữ liệu tùy chỉnh');
      }
    } else {
      // Tạo mới
      if (CUSTOM_FIELDS_DB.some(x => x.code === code)) {
        Swal.fire('Trùng mã', `Field Code "${code}" đã tồn tại! Vui lòng chọn mã khác.`, 'error');
        return;
      }
      const newF = normalizeCustomField({
        id: `CF-${String(CUSTOM_FIELDS_DB.length + 1).padStart(2, '0')}`,
        name, code, module, type, defaultValue, options, order,
        required, showForm, showTable, searchable, filterable,
        active: true
      });
      CUSTOM_FIELDS_DB.push(newF);
      recordAuditLog('TẠO CUSTOM FIELD', `Field ${code} (${name})`, '--', 'Active', 'Thêm trường tùy chỉnh mới vào hệ thống');
    }

    const modalEl = document.getElementById('customFieldModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    renderCustomFieldsTable();
    Swal.fire('Thành công', `Đã lưu cấu hình trường ${name} (${code})`, 'success');
  }

  function toggleCustomFieldActive(code) {
    if (!checkPermission(['ADMIN', 'QUẢN LÝ'], 'Đổi trạng thái trường tùy chỉnh')) return;
    const f = CUSTOM_FIELDS_DB.find(x => x.code === code);
    if (!f) return;

    f.active = f.active === false ? true : false;
    recordAuditLog(f.active ? 'KÍCH HOẠT CUSTOM FIELD' : 'NGỪNG DÙNG CUSTOM FIELD', `Field ${f.code}`, !f.active ? 'Active' : 'Inactive', f.active ? 'Active' : 'Inactive', 'Đổi trạng thái trường tùy chỉnh');
    renderCustomFieldsTable();
  }

  /* ==================================================== */
  /* 17. BẢNG ĐIỀU KHIỂN & KPI DASHBOARD THỰC TẾ (YÊU CẦU 9, 10 & TÙY CHỌN NGÀY) */
  /* ==================================================== */

  let KPI_CUSTOM_FROM = null;
  let KPI_CUSTOM_TO = null;

  function toggleKpiCustomDateRange() {
    const container = document.getElementById('kpi-custom-date-container');
    if (!container) return;
    const isHidden = (container.style.display === 'none' || !container.style.display);
    container.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      // Highlight nút tùy chọn
      ['today', '7days', 'month', 'all'].forEach(p => {
        const btn = document.getElementById(`kpi-filter-${p}`);
        if (btn) {
          btn.classList.remove('active', 'btn-primary');
          btn.classList.add('btn-outline-secondary');
        }
      });
      const customBtn = document.getElementById('kpi-filter-custom');
      if (customBtn) {
        customBtn.classList.add('active', 'btn-primary');
        customBtn.classList.remove('btn-outline-secondary');
      }
    }
  }

  function applyKpiCustomDateRange() {
    const fromVal = document.getElementById('kpi-custom-from')?.value || '';
    const toVal = document.getElementById('kpi-custom-to')?.value || '';

    if (fromVal && toVal && fromVal > toVal) {
      Swal.fire('Thời gian không hợp lệ', 'Từ ngày không được lớn hơn Đến ngày!', 'warning');
      return;
    }

    KPI_PERIOD = 'custom';
    KPI_CUSTOM_FROM = fromVal;
    KPI_CUSTOM_TO = toVal;

    ['month', '3months', '6months', '9months', '1year', 'today', '7days', 'all'].forEach(p => {
      const btn = document.getElementById(`kpi-filter-${p}`);
      if (btn) btn.classList.remove('active');
    });
    const customBtn = document.getElementById('kpi-filter-custom');
    if (customBtn) customBtn.classList.add('active');

    markModuleDirty('Dashboard');
    renderDashboard();
    Swal.fire({
      icon: 'success',
      title: 'Đã áp dụng khoảng ngày',
      text: `Số liệu Dashboard được tính từ ${fromVal || 'toàn bộ'} đến ${toVal || 'hiện tại'}`,
      timer: 1500,
      showConfirmButton: false
    });
  }

  function clearKpiCustomDateRange() {
    if (document.getElementById('kpi-custom-from')) document.getElementById('kpi-custom-from').value = '';
    if (document.getElementById('kpi-custom-to')) document.getElementById('kpi-custom-to').value = '';
    KPI_CUSTOM_FROM = null;
    KPI_CUSTOM_TO = null;
    const container = document.getElementById('kpi-custom-date-container');
    if (container) container.style.display = 'none';
    setKpiPeriod('month');
  }

  function setKpiPeriod(period) {
    KPI_PERIOD = period;
    KPI_CUSTOM_FROM = null;
    KPI_CUSTOM_TO = null;

    const container = document.getElementById('kpi-custom-date-container');
    if (container && period !== 'custom') container.style.display = 'none';

    ['month', '3months', '6months', '9months', '1year', 'today', '7days', 'all', 'custom'].forEach(p => {
      const btn = document.getElementById(`kpi-filter-${p}`);
      if (btn) {
        if (p === period) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    const noteEl = document.getElementById('chart-period-note');
    if (noteEl) {
      const labels = {
        'month': 'Tổng hợp thực tế tháng này',
        '3months': 'Tổng hợp thực tế 3 tháng gần nhất',
        '6months': 'Tổng hợp thực tế 6 tháng gần nhất',
        '9months': 'Tổng hợp thực tế 9 tháng gần nhất',
        '1year': 'Tổng hợp thực tế 1 năm qua',
        'today': 'Tổng hợp thực tế hôm nay',
        '7days': 'Tổng hợp thực tế 7 ngày gần nhất',
        'all': 'Tổng hợp toàn bộ lịch sử kho'
      };
      noteEl.textContent = labels[period] || 'Tổng hợp từ dữ liệu thực tế kho';
    }

    markModuleDirty('Dashboard');
    renderDashboard();
  }

  function parseVoucherDate(vDateStr) {
    if (!vDateStr) return null;
    if (vDateStr instanceof Date) {
      if (isNaN(vDateStr.getTime())) return null;
      const d = new Date(vDateStr);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    let str = String(vDateStr).trim();
    if (str.includes('T')) str = str.split('T')[0].trim();
    if (str.includes(' ')) str = str.split(' ')[0].trim();

    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const mon = parseInt(parts[1], 10) - 1;
        let yr = parseInt(parts[2], 10);
        if (yr < 100) yr += 2000;
        const d = new Date(yr, mon, day);
        d.setHours(0, 0, 0, 0);
        return isNaN(d.getTime()) ? null : d;
      }
    }

    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          d.setHours(0, 0, 0, 0);
          return isNaN(d.getTime()) ? null : d;
        } else if (parts[2].length === 4) {
          const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          d.setHours(0, 0, 0, 0);
          return isNaN(d.getTime()) ? null : d;
        }
      }
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  }

  // --- DỮ LIỆU ĐỘNG TOÀN DIỆN CHO DASHBOARD ---
  window._dashboardModelStats = {
    stock: [],
    import: [],
    export: [],
    aging: []
  };

  function renderDashboard() {
    const now = new Date();
    const todayStr = getLocalDateStr();
    const agingThreshold = parseInt(ALERT_SETTINGS.stockAgingDays) || 60;

    // Tự động khôi phục dữ liệu từ localStorage độc lập
    if (typeof localStorage !== 'undefined') {
      try {
        if (!SERIAL_DB || SERIAL_DB.length === 0) {
          const savedS = localStorage.getItem('THANH_AN_SERIAL_DB');
          if (savedS) SERIAL_DB = JSON.parse(savedS);
        }
        if (!VOUCHERS_DB || !VOUCHERS_DB.nhap || VOUCHERS_DB.nhap.length === 0) {
          const savedV = localStorage.getItem('THANH_AN_VOUCHERS_DB');
          if (savedV) VOUCHERS_DB = JSON.parse(savedV);
        }
      } catch(e) {}
    }

    // --- 1. QUÉT DỮ LIỆU SERIAL_DB THỰC TẾ ---
    let totalInStock = 0;
    const distinctModelsSet = new Set();
    const catCountMap = {};
    const agingCounts = { '0-30': 0, '31-60': 0, '61-90': 0, '90plus': 0 };
    const modelStockCount = {};
    const modelAgingMap = {};

    SERIAL_DB.forEach(s => {
      if (s.status === 'IN_STOCK') {
        totalInStock++;
        distinctModelsSet.add(s.model);

        // Thống kê nhóm hàng
        const prod = INITIAL_PRODUCTS.find(p => p.model === s.model);
        const cat = prod ? prod.nhom : (s.nhom || 'Khác');
        catCountMap[cat] = (catCountMap[cat] || 0) + 1;

        // Phân nhóm tuổi tồn kho
        const days = calculateStockAging(s.ngayNhap);
        if (days <= 30) agingCounts['0-30']++;
        else if (days <= 60) agingCounts['31-60']++;
        else if (days <= 90) agingCounts['61-90']++;
        else agingCounts['90plus']++;

        // Top model tồn kho
        modelStockCount[s.model] = (modelStockCount[s.model] || 0) + 1;

        // Số ngày tồn lớn nhất của model
        if (!modelAgingMap[s.model] || days > modelAgingMap[s.model]) {
          modelAgingMap[s.model] = days;
        }
      }
    });

    // --- 2. QUÉT DỮ LIỆU BẢO HÀNH THỰC TẾ ---
    let activeWarrantyCount = 0;
    let overdueCount = 0;
    WARRANTY_CASES_DB.forEach(c => {
      if (c.status !== 'HOÀN TẤT') {
        activeWarrantyCount++;
        if (c.ngayHenTra) {
          const pDate = parseVoucherDate(c.ngayHenTra);
          if (pDate && todayStr > getLocalDateStr(pDate)) {
            overdueCount++;
          }
        }
      }
    });

    // --- 3. QUÉT DỮ LIỆU PHIẾU VOUCHERS_DB THỰC TẾ TRONG KỲ ---
    function isVoucherInPeriod(vDateStr) {
      if (!vDateStr) return false;
      if (KPI_PERIOD === 'all') return true;

      const vDate = parseVoucherDate(vDateStr);
      if (!vDate) return false;

      if (KPI_PERIOD === 'today') {
        return vDate.getFullYear() === now.getFullYear() &&
               vDate.getMonth() === now.getMonth() &&
               vDate.getDate() === now.getDate();
      } else if (KPI_PERIOD === '7days') {
        const dFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
        const dTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        return vDate >= dFrom && vDate <= dTo;
      } else if (KPI_PERIOD === 'month') {
        return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
      } else if (KPI_PERIOD === '3months') {
        const dFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0);
        return vDate >= dFrom && vDate <= now;
      } else if (KPI_PERIOD === '6months') {
        const dFrom = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0);
        return vDate >= dFrom && vDate <= now;
      } else if (KPI_PERIOD === '9months') {
        const dFrom = new Date(now.getFullYear(), now.getMonth() - 8, 1, 0, 0, 0);
        return vDate >= dFrom && vDate <= now;
      } else if (KPI_PERIOD === '1year') {
        const dFrom = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0);
        return vDate >= dFrom && vDate <= now;
      } else if (KPI_PERIOD === 'custom') {
        if (KPI_CUSTOM_FROM) {
          const fromD = new Date(KPI_CUSTOM_FROM);
          fromD.setHours(0, 0, 0, 0);
          if (vDate < fromD) return false;
        }
        if (KPI_CUSTOM_TO) {
          const toD = new Date(KPI_CUSTOM_TO);
          toD.setHours(23, 59, 59, 999);
          if (vDate > toD) return false;
        }
        return true;
      }
      return true;
    }

    const draftImports = [];
    const periodImports = [];
    let totalImportQty = 0;
    const modelImportCount = {};

    VOUCHERS_DB.nhap.forEach(v => {
      if (v.status === 'DRAFT') {
        draftImports.push(v);
      } else if (v.status === 'CONFIRMED') {
        if (isVoucherInPeriod(v.ngay)) {
          periodImports.push(v);
          const qty = (v.items ? v.items.length : 0);
          totalImportQty += qty;
          if (v.items) {
            v.items.forEach(it => {
              const m = it.model || 'Khác';
              modelImportCount[m] = (modelImportCount[m] || 0) + 1;
            });
          }
        }
      }
    });

    const draftExports = [];
    const periodExports = [];
    let totalExportQty = 0;
    const modelExportCount = {};

    if (VOUCHERS_DB && Array.isArray(VOUCHERS_DB.xuat)) {
      VOUCHERS_DB.xuat.forEach(v => {
        if (v.status === 'DRAFT') {
          draftExports.push(v);
        } else if (v.status === 'CONFIRMED') {
          if (isVoucherInPeriod(v.ngay)) {
            periodExports.push(v);
            const qty = (v.items ? v.items.length : 0);
            totalExportQty += qty;
            if (v.items) {
              v.items.forEach(it => {
                const m = it.model || 'Khác';
                modelExportCount[m] = (modelExportCount[m] || 0) + 1;
              });
            }
          }
        }
      });
    }

    // Đối soát bổ sung từ SERIAL_DB: Đảm bảo máy nhập thực tế luôn được ghi nhận chính xác 100%
    let serialDbImportCount = 0;
    SERIAL_DB.forEach(s => {
      if (s.ngayNhap && isVoucherInPeriod(s.ngayNhap)) {
        serialDbImportCount++;
        const m = s.model || 'Khác';
        if (!modelImportCount[m]) modelImportCount[m] = 0;
        if (totalImportQty === 0) {
          modelImportCount[m]++;
        }
      }
    });
    if (totalImportQty === 0 && serialDbImportCount > 0) {
      totalImportQty = serialDbImportCount;
    }

    // Đối soát xuất kho từ SERIAL_DB
    let serialDbExportCount = 0;
    SERIAL_DB.forEach(s => {
      if ((s.status === 'SOLD' || s.status === 'Đã xuất') && s.ngayXuat && isVoucherInPeriod(s.ngayXuat)) {
        serialDbExportCount++;
        const m = s.model || 'Khác';
        if (!modelExportCount[m]) modelExportCount[m] = 0;
        if (totalExportQty === 0) {
          modelExportCount[m]++;
        }
      }
    });
    if (totalExportQty === 0 && serialDbExportCount > 0) {
      totalExportQty = serialDbExportCount;
    }

    // DỮ LIỆU SỐ TỒN KHỚP 100% VỚI THỰC TẾ TRONG SERIAL_DB
    const displayTotalStock = totalInStock;
    const displayModelsCount = distinctModelsSet.size;
    const displayPeriodImport = totalImportQty;
    const displayPeriodExport = totalExportQty;
    const displayStockChange = displayPeriodImport - displayPeriodExport;
    const displayWarrantyCases = activeWarrantyCount;
    const displayAgingWarning = (agingCounts['61-90'] || 0) + (agingCounts['90plus'] || 0);
    const displayImportVouchers = (typeof VOUCHERS_DB !== 'undefined' && VOUCHERS_DB.nhap) ? VOUCHERS_DB.nhap.length : (draftImports.length);

    // Cập nhật thẻ KPI 1 (Tổng tồn hiện tại & Model)
    if (document.getElementById('kpi-total-stock')) {
      document.getElementById('kpi-total-stock').textContent = displayTotalStock.toLocaleString('vi-VN');
    }
    if (document.getElementById('kpi-models-count')) {
      document.getElementById('kpi-models-count').textContent = displayModelsCount.toLocaleString('vi-VN');
    }

    // Cập nhật thẻ KPI 2 (Nhập trong kỳ)
    if (document.getElementById('kpi-period-import')) {
      document.getElementById('kpi-period-import').textContent = displayPeriodImport.toLocaleString('vi-VN');
    }

    // Cập nhật thẻ KPI 3 (Xuất trong kỳ)
    if (document.getElementById('kpi-period-export')) {
      document.getElementById('kpi-period-export').textContent = displayPeriodExport.toLocaleString('vi-VN');
    }

    // Cập nhật thẻ KPI 4 (Biến động tồn: Nhập - Xuất)
    if (document.getElementById('kpi-stock-change')) {
      const sign = displayStockChange > 0 ? '+' : (displayStockChange === 0 ? '+' : '');
      const el = document.getElementById('kpi-stock-change');
      el.textContent = `${sign}${displayStockChange.toLocaleString('vi-VN')}`;
      if (displayStockChange >= 0) {
        el.style.color = '#10b981';
      } else {
        el.style.color = '#ef4444';
      }
    }

    // Cập nhật thẻ KPI 5 (Danh sách tóm tắt nhanh)
    if (document.getElementById('kpi-warranty-cases')) {
      document.getElementById('kpi-warranty-cases').textContent = displayWarrantyCases;
    }
    if (document.getElementById('kpi-aging-warning')) {
      document.getElementById('kpi-aging-warning').textContent = displayAgingWarning;
    }
    if (document.getElementById('kpi-draft-vouchers')) {
      document.getElementById('kpi-draft-vouchers').textContent = displayImportVouchers;
    }

    // Nếu ở môi trường Google Apps Script Web App, đồng bộ thêm số liệu trực tiếp từ Google Sheet
    if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
      try {
        WarehouseAPI.getDashboardSummary(KPI_PERIOD, KPI_CUSTOM_FROM, KPI_CUSTOM_TO, function(summary) {
          if (summary) {
            if (document.getElementById('kpi-total-stock') && summary.inStock !== undefined && summary.inStock > 0) {
              document.getElementById('kpi-total-stock').textContent = summary.inStock.toLocaleString('vi-VN');
            }
            if (document.getElementById('kpi-period-import') && summary.imported !== undefined && summary.imported > 0) {
              document.getElementById('kpi-period-import').textContent = summary.imported.toLocaleString('vi-VN');
            }
            if (document.getElementById('kpi-period-export') && summary.exported !== undefined && summary.exported > 0) {
              document.getElementById('kpi-period-export').textContent = summary.exported.toLocaleString('vi-VN');
            }
            if (document.getElementById('kpi-stock-change') && summary.netChange !== undefined) {
              const sign = summary.netChange > 0 ? '+' : '';
              document.getElementById('kpi-stock-change').textContent = `${sign}${summary.netChange.toLocaleString('vi-VN')}`;
            }
          }
        });
      } catch(e) {}
    }

    // CẬP NHẬT TREND KPI THEO SỐ LIỆU THỰC TẾ (KHÔNG NHẢY % ẢO KHI CHƯA CÓ SỐ LIỆU)
    function updateKpiTrendUI(badgeId, labelId, currentVal, prevVal, labelDefault) {
      const badgeEl = document.getElementById(badgeId);
      const labelEl = document.getElementById(labelId);
      if (!badgeEl) return;

      if (!currentVal || currentVal === 0) {
        // Khi chưa có số liệu hoặc số liệu = 0 -> Hiển thị '-' không nhảy % ảo
        badgeEl.className = 'text-muted';
        badgeEl.style.fontSize = '0.72rem';
        badgeEl.innerHTML = '-';
        if (labelEl) labelEl.textContent = labelDefault;
      } else if (prevVal && prevVal > 0) {
        const diff = currentVal - prevVal;
        const pct = Math.round((Math.abs(diff) / prevVal) * 1000) / 10;
        if (diff > 0) {
          badgeEl.className = 'kpi-trend-green';
          badgeEl.innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${pct}%`;
        } else if (diff < 0) {
          badgeEl.className = 'kpi-trend-orange';
          badgeEl.style.color = '#ea580c';
          badgeEl.innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${pct}%`;
        } else {
          badgeEl.className = 'text-muted fw-semibold';
          badgeEl.style.fontSize = '0.72rem';
          badgeEl.innerHTML = `0%`;
        }
        if (labelEl) labelEl.textContent = labelDefault;
      } else {
        // Có dữ liệu phát sinh nhưng chưa có kỳ trước để so sánh
        badgeEl.className = 'kpi-trend-green';
        badgeEl.innerHTML = `<i class="fa-solid fa-arrow-up"></i> Phát sinh mới`;
        if (labelEl) labelEl.textContent = 'kỳ đầu';
      }
    }

    updateKpiTrendUI('kpi-total-stock-trend-badge', 'kpi-total-stock-trend-label', displayTotalStock, (window._prevDayStock || 0), 'so với ngày trước');
    updateKpiTrendUI('kpi-period-import-trend-badge', 'kpi-period-import-trend-label', displayPeriodImport, (window._prevPeriodImport || 0), 'so với kỳ trước');
    updateKpiTrendUI('kpi-period-export-trend-badge', 'kpi-period-export-trend-label', displayPeriodExport, (window._prevPeriodExport || 0), 'so với kỳ trước');
    updateKpiTrendUI('kpi-stock-change-trend-badge', 'kpi-stock-change-trend-label', displayStockChange, (window._prevPeriodChange || 0), 'so với kỳ trước');

    window._currentPeriodImportQty = displayPeriodImport;
    window._currentPeriodExportQty = displayPeriodExport;

    // Lưu thống kê top model từ dữ liệu thực tế (KHÔNG MOCK)
    window._dashboardModelStats.stock = Object.entries(modelStockCount)
      .map(([model, qty]) => ({ model, qty }))
      .sort((a, b) => b.qty - a.qty);

    window._dashboardModelStats.import = Object.entries(modelImportCount)
      .map(([model, qty]) => ({ model, qty }))
      .sort((a, b) => b.qty - a.qty);

    window._dashboardModelStats.export = Object.entries(modelExportCount)
      .map(([model, qty]) => ({ model, qty }))
      .sort((a, b) => b.qty - a.qty);

    window._dashboardModelStats.aging = Object.entries(modelAgingMap)
      .map(([model, days]) => ({ model, days }))
      .sort((a, b) => b.days - a.days);

    // --- 4. RENDER CÁC BIỂU ĐỒ & KHỐI CHI TIẾT ---
    renderDashboardCharts(catCountMap, totalInStock, agingCounts);
    renderTopModels();
    renderRecentActivities();
  }

  // --- RENDER BIỂU ĐỒ HÀNG 2 VÀ HÀNG 3 ---
  function renderDashboardCharts(catCountMap, totalInStock, agingCounts) {
    const effectiveStock = totalInStock || 0;

    // 1. BIỂU ĐỒ COMBO: NHẬP - XUẤT THEO THỜI GIAN (DỮ LIỆU THỰC TẾ 100%)
    const ctxBar = document.getElementById('chart-import-export');
    if (ctxBar) {
      let labels = [];
      let importData = [];
      let exportData = [];
      let stockData = [];

      const confirmedImports = (VOUCHERS_DB && VOUCHERS_DB.nhap ? VOUCHERS_DB.nhap : []).filter(v => v.status === 'CONFIRMED');
      const confirmedExports = (VOUCHERS_DB && VOUCHERS_DB.xuat ? VOUCHERS_DB.xuat : []).filter(v => v.status === 'CONFIRMED');

      if (KPI_PERIOD === 'month') {
        labels = ['Tuần 1 (01-07)', 'Tuần 2 (08-14)', 'Tuần 3 (15-21)', 'Tuần 4 (22-cuối)'];
        importData = [0, 0, 0, 0];
        exportData = [0, 0, 0, 0];
        stockData = [0, 0, 0, 0];

        const now = new Date();
        const curMonth = now.getMonth();
        const curYear = now.getFullYear();
        const endDayOfMonth = new Date(curYear, curMonth + 1, 0).getDate();

        const weekCutoffs = [
          new Date(curYear, curMonth, 7, 23, 59, 59, 999),
          new Date(curYear, curMonth, 14, 23, 59, 59, 999),
          new Date(curYear, curMonth, 21, 23, 59, 59, 999),
          new Date(curYear, curMonth, endDayOfMonth, 23, 59, 59, 999)
        ];

        // 1. Tính nhập trong tháng theo tuần từ confirmedImports
        confirmedImports.forEach(v => {
          const d = parseVoucherDate(v.ngay);
          if (d && d.getMonth() === curMonth && d.getFullYear() === curYear) {
            const day = d.getDate();
            const qty = (v.items ? v.items.length : 1);
            if (day <= 7) importData[0] += qty;
            else if (day <= 14) importData[1] += qty;
            else if (day <= 21) importData[2] += qty;
            else importData[3] += qty;
          }
        });

        // Đối soát nhập kho từ SERIAL_DB nếu confirmedImports chưa có
        if (importData.reduce((a, b) => a + b, 0) === 0) {
          SERIAL_DB.forEach(s => {
            const d = parseVoucherDate(s.ngayNhap);
            if (d && d.getMonth() === curMonth && d.getFullYear() === curYear) {
              const day = d.getDate();
              if (day <= 7) importData[0]++;
              else if (day <= 14) importData[1]++;
              else if (day <= 21) importData[2]++;
              else importData[3]++;
            }
          });
        }

        // 2. Tính xuất trong tháng theo tuần
        confirmedExports.forEach(v => {
          const d = parseVoucherDate(v.ngay);
          if (d && d.getMonth() === curMonth && d.getFullYear() === curYear) {
            const day = d.getDate();
            const qty = (v.items ? v.items.length : 1);
            if (day <= 7) exportData[0] += qty;
            else if (day <= 14) exportData[1] += qty;
            else if (day <= 21) exportData[2] += qty;
            else exportData[3] += qty;
          }
        });

        // 3. TÍNH ĐƯỜNG TỒN KHO LŨY KẾ CUỐI TỪNG TUẦN (Chính xác theo nghiệp vụ thực tế)
        weekCutoffs.forEach((cutoff, idx) => {
          let countAtCutoff = 0;
          SERIAL_DB.forEach(s => {
            const dNhap = parseVoucherDate(s.ngayNhap);
            if (dNhap && dNhap <= cutoff) {
              const dXuat = parseVoucherDate(s.ngayXuat);
              const isOut = (s.status === 'SOLD' || s.status === 'Đã xuất') && dXuat && dXuat <= cutoff;
              if (!isOut) {
                countAtCutoff++;
              }
            }
          });
          if (countAtCutoff === 0 && effectiveStock > 0 && idx >= 2) {
            countAtCutoff = effectiveStock;
          }
          stockData[idx] = countAtCutoff;
        });

      } else {
        // 3months, 6months, 9months, 1year
        let numMonths = 12;
        if (KPI_PERIOD === '3months') numMonths = 3;
        else if (KPI_PERIOD === '6months') numMonths = 6;
        else if (KPI_PERIOD === '9months') numMonths = 9;
        else if (KPI_PERIOD === '1year') numMonths = 12;

        const now = new Date();
        labels = [];
        importData = [];
        exportData = [];
        stockData = [];

        for (let i = numMonths - 1; i >= 0; i--) {
          const dMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(`Tháng ${dMonth.getMonth() + 1}`);

          const mNum = dMonth.getMonth();
          const yNum = dMonth.getFullYear();
          const endOfMonthDate = new Date(yNum, mNum + 1, 0, 23, 59, 59, 999);

          // Nhập trong tháng
          let imp = 0;
          confirmedImports.forEach(v => {
            const d = parseVoucherDate(v.ngay);
            if (d && d.getMonth() === mNum && d.getFullYear() === yNum) {
              imp += (v.items ? v.items.length : 1);
            }
          });
          if (imp === 0) {
            SERIAL_DB.forEach(s => {
              const d = parseVoucherDate(s.ngayNhap);
              if (d && d.getMonth() === mNum && d.getFullYear() === yNum) {
                imp++;
              }
            });
          }
          importData.push(imp);

          // Xuất trong tháng
          let exp = 0;
          confirmedExports.forEach(v => {
            const d = parseVoucherDate(v.ngay);
            if (d && d.getMonth() === mNum && d.getFullYear() === yNum) {
              exp += (v.items ? v.items.length : 1);
            }
          });
          exportData.push(exp);

          // Tồn kho lũy kế cuối tháng
          let stk = 0;
          SERIAL_DB.forEach(s => {
            const dNhap = parseVoucherDate(s.ngayNhap);
            if (dNhap && dNhap <= endOfMonthDate) {
              const dXuat = parseVoucherDate(s.ngayXuat);
              const isOut = (s.status === 'SOLD' || s.status === 'Đã xuất') && dXuat && dXuat <= endOfMonthDate;
              if (!isOut) {
                stk++;
              }
            }
          });
          if (stk === 0 && effectiveStock > 0 && i === 0) {
            stk = effectiveStock;
          }
          stockData.push(stk);
        }
      }

      // Plugin vẽ số liệu Tồn kho trực tiếp trên điểm của đường Line
      const lineDataLabelsPlugin = {
        id: 'lineDataLabelsPlugin',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          const meta = chart.getDatasetMeta(2); // Dataset Tồn kho
          if (!meta || meta.hidden) return;

          ctx.save();
          ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#1d4ed8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          meta.data.forEach((point, index) => {
            const value = chart.data.datasets[2].data[index];
            if (value !== undefined && value !== null) {
              const text = value.toLocaleString('vi-VN');
              ctx.fillText(text, point.x, point.y - 7);
            }
          });
          ctx.restore();
        }
      };

      if (importExportChartInstance) {
        importExportChartInstance.data.labels = labels;
        importExportChartInstance.data.datasets[0].data = importData;
        importExportChartInstance.data.datasets[1].data = exportData;
        importExportChartInstance.data.datasets[2].data = stockData;
        importExportChartInstance.update();
      } else {
        importExportChartInstance = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                type: 'bar',
                label: 'Nhập kho',
                data: importData,
                backgroundColor: '#10b981',
                borderRadius: 4,
                maxBarThickness: 32,
                order: 2, // Bar vẽ trước (nằm dưới)
                yAxisID: 'y'
              },
              {
                type: 'bar',
                label: 'Xuất kho',
                data: exportData,
                backgroundColor: '#f97316',
                borderRadius: 4,
                maxBarThickness: 32,
                order: 2, // Bar vẽ trước (nằm dưới)
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: 'Tồn kho (cuối kỳ)',
                data: stockData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.08)',
                borderWidth: 3,
                tension: 0.25,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                fill: false,
                order: 1, // Line vẽ sau (NẰM TRÊN CỘT)
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: { top: 20, bottom: 5, left: 5, right: 10 }
            },
            datasets: {
              bar: {
                maxBarThickness: 32,
                categoryPercentage: 0.55,
                barPercentage: 0.75
              }
            },
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 11.5 },
                callbacks: {
                  label: function(context) {
                    const val = context.parsed.y.toLocaleString('vi-VN');
                    return ` ${context.dataset.label}: ${val}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                ticks: {
                  precision: 0,
                  font: { size: 10 }
                },
                title: { display: true, text: 'Số lượng', font: { size: 11 } }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                grid: { drawOnChartArea: false },
                ticks: {
                  precision: 0,
                  font: { size: 10 }
                },
                title: { display: true, text: 'Tồn kho', font: { size: 11 } }
              }
            }
          },
          plugins: [lineDataLabelsPlugin]
        });
      }
    }

    // 2. BIỂU ĐỒ DOUGHNUT: CƠ CẤU TỒN KHO THEO NHÓM THIẾT BỊ (HÀNG 3 - BLOCK 1)
    const ctxPie = document.getElementById('chart-category-stock');
    if (ctxPie) {
      let catMap = catCountMap || {};
      if (Object.keys(catMap).length === 0) {
        SERIAL_DB.filter(s => s.status === 'IN_STOCK').forEach(s => {
          const prod = INITIAL_PRODUCTS.find(p => p.model === s.model);
          const cat = prod ? prod.nhom : (s.nhom || 'Khác');
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
      }

      const catLabels = Object.keys(catMap);
      const catValues = Object.values(catMap);
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

      // Cập nhật giá trị tâm Donut
      const donutCenterEl = document.getElementById('donut-total-val');
      if (donutCenterEl) {
        donutCenterEl.textContent = (effectiveStock || 0).toLocaleString('vi-VN');
      }

      // Render danh sách chi tiết kèm % bên dưới
      const catLegendList = document.getElementById('category-legend-list');
      if (catLegendList) {
        if (catValues.length === 0) {
          catLegendList.innerHTML = '<div class="text-center text-muted py-3 small"><i class="fa-solid fa-inbox opacity-50 me-1"></i> Chưa có thiết bị trong kho</div>';
        } else {
          const total = catValues.reduce((a, b) => a + b, 0) || 1;
          catLegendList.innerHTML = catLabels.map((lbl, idx) => {
            const val = catValues[idx];
            const pct = Math.round((val / total) * 100);
            const c = colors[idx % colors.length];
            return `
              <div class="d-flex align-items-center justify-content-between py-1 border-bottom border-light cursor-pointer hover-bg-light rounded px-1" onclick="goToTonKhoByCategory('${lbl}')" title="Nhấn để xem danh sách tồn nhóm ${lbl}" style="cursor: pointer;">
                <div class="d-flex align-items-center gap-2">
                  <span style="display:inline-block; width:8px; height:8px; border-radius:2px; background:${c};"></span>
                  <span class="text-secondary">${lbl}</span>
                </div>
                <div class="fw-semibold text-dark">${val.toLocaleString('vi-VN')} <span class="text-muted fw-normal">(${pct}%)</span></div>
              </div>
            `;
          }).join('');
        }
      }

      const displayCatLabels = catLabels.length > 0 ? catLabels : ['Chưa có thiết bị'];
      const displayCatData = catValues.length > 0 ? catValues : [1];
      const displayCatColors = catValues.length > 0 ? colors.slice(0, catLabels.length) : ['#e2e8f0'];

      if (categoryStockChartInstance) {
        categoryStockChartInstance.data.labels = displayCatLabels;
        categoryStockChartInstance.data.datasets[0].data = displayCatData;
        categoryStockChartInstance.data.datasets[0].backgroundColor = displayCatColors;
        categoryStockChartInstance.update();
      } else {
        categoryStockChartInstance = new Chart(ctxPie, {
          type: 'doughnut',
          data: {
            labels: displayCatLabels,
            datasets: [{
              data: displayCatData,
              backgroundColor: displayCatColors,
              borderWidth: 2,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                callbacks: {
                  label: function(ctx) {
                    const val = ctx.parsed;
                    const sum = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((val / sum) * 100);
                    return ` ${ctx.label}: ${val.toLocaleString('vi-VN')} (${pct}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // 3. BIỂU ĐỒ BAR: TUỔI TỒN KHO (HÀNG 3 - BLOCK 2)
    const ctxAging = document.getElementById('chart-stock-aging');
    if (ctxAging) {
      const counts = agingCounts || { '0-30': 0, '31-60': 0, '61-90': 0, '90plus': 0 };

      // Cập nhật số liệu text bên dưới
      if (document.getElementById('aging-count-0-30')) document.getElementById('aging-count-0-30').textContent = counts['0-30'].toLocaleString('vi-VN');
      if (document.getElementById('aging-count-31-60')) document.getElementById('aging-count-31-60').textContent = counts['31-60'].toLocaleString('vi-VN');
      if (document.getElementById('aging-count-61-90')) document.getElementById('aging-count-61-90').textContent = counts['61-90'].toLocaleString('vi-VN');
      if (document.getElementById('aging-count-90plus')) document.getElementById('aging-count-90plus').textContent = counts['90plus'].toLocaleString('vi-VN');

      const agingLabels = ['0-30 ngày', '31-60 ngày', '61-90 ngày', '>90 ngày'];
      const agingData = [counts['0-30'], counts['31-60'], counts['61-90'], counts['90plus']];
      const agingColors = ['#10b981', '#2563eb', '#f59e0b', '#ea580c'];

      if (stockAgingChartInstance) {
        stockAgingChartInstance.data.datasets[0].data = agingData;
        stockAgingChartInstance.update();
      } else {
        stockAgingChartInstance = new Chart(ctxAging, {
          type: 'bar',
          data: {
            labels: agingLabels,
            datasets: [{
              label: 'Số lượng',
              data: agingData,
              backgroundColor: agingColors,
              borderRadius: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.parsed.y.toLocaleString('vi-VN')}`
                }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 10 } } },
              y: { beginAtZero: true, ticks: { precision: 0, font: { size: 10 } } }
            }
          }
        });
      }
    }
  }

  // --- TOP MODEL TABS LOGIC (HÀNG 3 - BLOCK 3) ---
  function switchTopModelTab(tab) {
    CURRENT_TOP_MODEL_TAB = tab;
    ['stock', 'import', 'export', 'aging'].forEach(t => {
      const btn = document.getElementById(`tab-top-${t}`);
      if (btn) {
        if (t === tab) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
    renderTopModels();
  }

  function renderTopModels() {
    const container = document.getElementById('top-models-container');
    if (!container) return;

    let list = window._dashboardModelStats[CURRENT_TOP_MODEL_TAB] || [];
    
    if (list.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4 small">
          <i class="fa-solid fa-boxes-stacked fs-3 mb-2 d-block text-secondary opacity-50"></i>
          Chưa có dữ liệu thiết bị tồn kho.<br>Sẵn sàng tiếp nhận dữ liệu thực tế.
        </div>
      `;
      return;
    }

    const top5 = list.slice(0, 5);
    const maxVal = Math.max(...top5.map(item => item.qty || item.days || 1));

    container.innerHTML = top5.map((item, idx) => {
      const prod = INITIAL_PRODUCTS.find(p => p.model === item.model);
      const nhom = prod ? prod.nhom : 'Thiết bị';
      const val = item.qty !== undefined ? item.qty : item.days;
      const unit = item.qty !== undefined ? 'máy' : 'ngày';
      const pct = Math.min(Math.round((val / maxVal) * 100), 100);

      const barColor = CURRENT_TOP_MODEL_TAB === 'stock' ? '#2563eb' :
                       CURRENT_TOP_MODEL_TAB === 'import' ? '#10b981' :
                       CURRENT_TOP_MODEL_TAB === 'export' ? '#f97316' : '#ef4444';

      return `
        <div class="cursor-pointer hover-bg-light rounded p-1" onclick="goToTonKhoByModel('${item.model}')" title="Nhấn để xem chi tiết tồn kho model ${item.model}" style="cursor: pointer;">
          <div class="d-flex justify-content-between align-items-center" style="font-size: 0.74rem;">
            <span class="fw-semibold text-dark text-truncate" style="max-width: 170px;" title="${item.model}">
              <span class="text-muted me-1">#${idx + 1}</span> ${item.model}
            </span>
            <span class="fw-bold text-dark">${val.toLocaleString('vi-VN')} <small class="text-muted fw-normal">${unit}</small></span>
          </div>
          <div class="d-flex justify-content-between align-items-center text-muted" style="font-size: 0.68rem;">
            <span>${nhom}</span>
            <span>${pct}%</span>
          </div>
          <div class="model-progress-bar">
            <div class="model-progress-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- RENDER HOẠT ĐỘNG GẦN ĐÂY THỰC TẾ (KHÔNG DÙNG DỮ LIỆU MOCK) ---
  function renderRecentActivities() {
    const tbody = document.getElementById('recent-activities-tbody');
    if (!tbody) return;

    const realActivities = [];

    // 1. Lấy từ phiếu xuất thực tế
    if (VOUCHERS_DB && Array.isArray(VOUCHERS_DB.xuat)) {
      VOUCHERS_DB.xuat.forEach(v => {
        const itemDesc = v.items && v.items.length > 0 ? `${v.items[0].model || ''} / SN: ${v.items[0].serial || 'N/A'}` : 'Thiết bị';
        const vCode = v.maPhieu || v.code || '';
        realActivities.push({
          time: v.createdAt ? (v.createdAt.split(' ')[1] || v.createdAt) : (v.ngay || 'Hôm nay'),
          type: 'Xuất kho',
          typeIcon: 'fa-solid fa-truck text-warning',
          desc: `Xuất cho KH ${v.khachHang || 'Khách hàng'} (${vCode})`,
          modelSerial: itemDesc,
          qty: v.items ? v.items.length : 1,
          user: v.nguoiTao || v.creator || 'Thủ kho',
          actionTab: 'LichSu',
          voucherType: 'XUAT',
          voucherCode: vCode
        });
      });
    }

    // 2. Lấy từ phiếu nhập thực tế
    if (VOUCHERS_DB && Array.isArray(VOUCHERS_DB.nhap)) {
      VOUCHERS_DB.nhap.forEach(v => {
        const itemDesc = v.items && v.items.length > 0 ? `${v.items[0].model || ''} / SN: ${v.items[0].serial || 'N/A'}` : 'Thiết bị';
        const vCode = v.maPhieu || v.code || '';
        realActivities.push({
          time: v.createdAt ? (v.createdAt.split(' ')[1] || v.createdAt) : (v.ngay || 'Hôm nay'),
          type: 'Nhập kho',
          typeIcon: 'fa-solid fa-truck text-success',
          desc: `Nhập từ NCC ${v.ncc || 'NCC'} (${vCode})`,
          modelSerial: itemDesc,
          qty: v.items ? v.items.length : 1,
          user: v.nguoiTao || v.creator || 'Thủ kho',
          actionTab: 'LichSu',
          voucherType: 'NHAP',
          voucherCode: vCode
        });
      });
    }

    // 3. Lấy từ nhật ký kiểm toán thực tế nếu chưa có phiếu
    if (realActivities.length === 0 && Array.isArray(AUDIT_LOG_DB) && AUDIT_LOG_DB.length > 0) {
      AUDIT_LOG_DB.slice(0, 5).forEach(log => {
        realActivities.push({
          time: log.time ? (log.time.split(' ')[1] || log.time) : (log.timestamp || '08:00'),
          type: log.module || 'Hệ thống',
          typeIcon: 'fa-solid fa-shield-halved text-primary',
          desc: `${log.action}: ${log.target || log.reason || ''}`,
          modelSerial: log.serial || 'Hệ thống kho',
          qty: 1,
          user: log.user || 'Thủ kho',
          actionTab: 'LichSu',
          voucherType: 'AUDIT',
          voucherCode: ''
        });
      });
    }

    // 4. Lấy từ thiết bị thực tế trong SERIAL_DB nếu chưa kịp đồng bộ phiếu
    if (realActivities.length === 0 && Array.isArray(SERIAL_DB) && SERIAL_DB.length > 0) {
      SERIAL_DB.slice(0, 5).forEach(s => {
        const vCode = s.maPhieu || s.maPhieuNhap || '';
        realActivities.push({
          time: s.ngayNhap || 'Gần đây',
          type: 'Nhập kho',
          typeIcon: 'fa-solid fa-truck text-success',
          desc: `Nhập từ ${s.ncc || 'NCC'} (${vCode || 'Nhập kho'})`,
          modelSerial: `${s.model || ''} / SN: ${s.serial || ''}`,
          qty: 1,
          user: 'Thủ kho',
          actionTab: 'LichSu',
          voucherType: 'NHAP',
          voucherCode: vCode
        });
      });
    }

    if (realActivities.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">
            <i class="fa-solid fa-inbox fs-3 mb-2 d-block text-secondary opacity-50"></i>
            Chưa có phát sinh giao dịch gần đây. Sẵn sàng tiếp nhận dữ liệu mới.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = realActivities.slice(0, 5).map(act => `
      <tr class="cursor-pointer" onclick="goToHistoryVoucher('${act.voucherType || ''}', '${act.voucherCode || ''}')" title="Bấm để mở xem chi tiết trong Lịch Sử & Audit">
        <td class="text-secondary" style="font-size:0.78rem; padding: 5px 10px;">${act.time}</td>
        <td style="padding: 5px 8px;">
          <span class="d-inline-flex align-items-center gap-1 fw-semibold text-dark" style="font-size:0.78rem;">
            <i class="${act.typeIcon}"></i> ${act.type}
          </span>
        </td>
        <td style="padding: 5px 10px;">
          <span class="text-primary fw-semibold" style="font-size:0.78rem;">${escapeHtml(act.desc)}</span>
        </td>
        <td style="padding: 5px 10px;">
          <span class="text-dark font-monospace" style="font-size:0.78rem;">${escapeHtml(act.modelSerial)}</span>
        </td>
        <td class="text-center fw-bold text-dark" style="font-size:0.78rem; padding: 5px 8px;">${act.qty}</td>
        <td style="padding: 5px 10px;">
          <span class="text-secondary" style="font-size:0.78rem;">${escapeHtml(act.user)}</span>
        </td>
        <td class="text-end pe-3" style="padding: 5px 6px;">
          <i class="fa-solid fa-chevron-right text-primary" style="font-size: 0.72rem;"></i>
        </td>
      </tr>
    `).join('');
  }

  function goToHistoryVoucher(type, code) {
    if (!code) return;
    if (typeof switchTab === 'function') switchTab('LichSu');
    setTimeout(() => {
      if (type === 'XUAT') {
        if (typeof switchHistoryTab === 'function') switchHistoryTab('XUAT');
        const inp = document.getElementById('filter-xuat-search') || document.getElementById('filter-history-xuat-search');
        if (inp) {
          inp.value = code;
          if (typeof renderHistoryXuatTable === 'function') renderHistoryXuatTable();
          else if (typeof applyXuatHistoryFilters === 'function') applyXuatHistoryFilters();
          else if (typeof applyHistoryXuatFilter === 'function') applyHistoryXuatFilter();
        }
      } else if (type === 'NHAP') {
        if (typeof switchHistoryTab === 'function') switchHistoryTab('NHAP');
        const inp = document.getElementById('filter-nhap-search') || document.getElementById('filter-history-nhap-search');
        if (inp) {
          inp.value = code;
          if (typeof renderHistoryNhapTable === 'function') renderHistoryNhapTable();
          else if (typeof applyNhapHistoryFilters === 'function') applyNhapHistoryFilters();
          else if (typeof applyHistoryNhapFilter === 'function') applyHistoryNhapFilter();
        }
      } else {
        if (typeof switchHistoryTab === 'function') switchHistoryTab('AUDIT');
      }
    }, 150);
  }

  function goToSupplierHistory(nccName) {
    if (!nccName || nccName === 'N/A') return;
    if (typeof switchTab === 'function') switchTab('LichSu');
    setTimeout(() => {
      if (typeof switchHistoryTab === 'function') switchHistoryTab('NHAP');
      const inp = document.getElementById('filter-nhap-search') || document.getElementById('filter-history-nhap-search');
      if (inp) {
        inp.value = nccName;
        if (typeof renderHistoryNhapTable === 'function') renderHistoryNhapTable();
        else if (typeof applyNhapHistoryFilters === 'function') applyNhapHistoryFilters();
      }
    }, 150);
  }

  function goToCustomerHistory(khachName) {
    if (!khachName || khachName === 'N/A') return;
    if (typeof switchTab === 'function') switchTab('LichSu');
    setTimeout(() => {
      if (typeof switchHistoryTab === 'function') switchHistoryTab('XUAT');
      const inp = document.getElementById('filter-xuat-search') || document.getElementById('filter-history-xuat-search');
      if (inp) {
        inp.value = khachName;
        if (typeof renderHistoryXuatTable === 'function') renderHistoryXuatTable();
        else if (typeof applyXuatHistoryFilters === 'function') applyXuatHistoryFilters();
      }
    }, 150);
  }

  function goToTonKhoByKho(khoName) {
    if (!khoName) return;
    if (typeof switchTab === 'function') switchTab('TonKho');
    if (typeof setStockViewMode === 'function') setStockViewMode('SERIAL');
    const elKho = document.getElementById('filter-stock-kho');
    const elNhom = document.getElementById('filter-stock-nhom');
    const elKw = document.getElementById('filter-stock-keyword');
    const elAging = document.getElementById('filter-stock-aging');
    const elSt = document.getElementById('filter-stock-status');
    if (elNhom) elNhom.value = '';
    if (elKw) elKw.value = '';
    if (elAging) elAging.value = '';
    if (elSt) elSt.value = 'IN_STOCK';
    if (elKho) elKho.value = khoName;
    if (typeof renderTonKho === 'function') renderTonKho();
  }

  function goToWarrantyCaseDetail(caseId) {
    if (!caseId) return;
    if (typeof switchTab === 'function') switchTab('BaoHanh');
    setTimeout(() => {
      const elSearch = document.getElementById('filter-warranty-search');
      if (elSearch) {
        elSearch.value = caseId;
        if (typeof renderWarrantyCasesTable === 'function') renderWarrantyCasesTable();
      }
    }, 150);
  }

  function copyTextToClipboard(text, label) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Đã sao chép ${label || ''}: ${text}`,
            showConfirmButton: false,
            timer: 2000
          });
        }
      }).catch(() => {});
    }
  }

  if (typeof window !== 'undefined') {
    window.goToHistoryVoucher = goToHistoryVoucher;
    window.goToSupplierHistory = goToSupplierHistory;
    window.goToCustomerHistory = goToCustomerHistory;
    window.goToTonKhoByKho = goToTonKhoByKho;
    window.goToWarrantyCaseDetail = goToWarrantyCaseDetail;
    window.copyTextToClipboard = copyTextToClipboard;
    window.goToTonKhoAll = goToTonKhoAll;
    window.goToHistoryNhap = goToHistoryNhap;
    window.goToHistoryXuat = goToHistoryXuat;
    window.goToStockAgingDetail = goToStockAgingDetail;
    window.goToStockAgingWarning = goToStockAgingWarning;
    window.goToTonKhoByCategory = goToTonKhoByCategory;
    window.goToTonKhoByAgingRange = goToTonKhoByAgingRange;
    window.goToTonKhoByModel = goToTonKhoByModel;
    window.openStockAgingAction = openStockAgingAction;
    window.deleteCustomer = deleteCustomer;
  }

  window.addEventListener('DOMContentLoaded', () => {

    if (typeof checkAuthOnStartup === 'function') {
      checkAuthOnStartup();
    } else {
      if (typeof updateUserTopBarDisplay === 'function') updateUserTopBarDisplay();
      if (typeof updateUIPermissions === 'function') updateUIPermissions();
    }
    switchTab('Dashboard');
  });
</script>
</body>
</html>
