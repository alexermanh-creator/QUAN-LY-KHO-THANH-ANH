  /* ==================================================== */
  /* 10. QUẢN LÝ TỒN KHO 2 CHẾ ĐỘ & SERIAL 360° (YÊU CẦU E & F) */
  /* ==================================================== */

  let STOCK_VIEW_MODE = 'MODEL'; // 'MODEL' hoặc 'SERIAL' (Yêu cầu E)

  function setStockViewMode(mode) {
    STOCK_VIEW_MODE = mode;
    const btnModel = document.getElementById('btn-view-by-model');
    const btnSerial = document.getElementById('btn-view-by-serial');
    const containerModel = document.getElementById('stock-view-model-container');
    const containerSerial = document.getElementById('stock-view-serial-container');

    if (mode === 'MODEL') {
      btnModel.classList.add('active');
      btnSerial.classList.remove('active');
      containerModel.style.display = 'block';
      containerSerial.style.display = 'none';
      renderStockByModel();
    } else {
      btnSerial.classList.add('active');
      btnModel.classList.remove('active');
      containerSerial.style.display = 'block';
      containerModel.style.display = 'none';
      renderStockBySerial();
    }
  }

  function renderTonKho() {
    if (typeof updateStockFilterDropdowns === 'function') {
      updateStockFilterDropdowns();
    }
    if (STOCK_VIEW_MODE === 'MODEL') {
      renderStockByModel();
    } else {
      renderStockBySerial();
    }
  }

  // 1. Chế độ xem tồn Theo Model (Gom nhóm đếm số lượng - Yêu cầu E)
  function renderStockByModel() {
    const tbody = document.getElementById('stock-model-table-body');
    if (!tbody) return;
    const filterKho = document.getElementById('filter-stock-kho')?.value || '';
    const filterNhom = document.getElementById('filter-stock-nhom')?.value || '';
    const keyword = (document.getElementById('filter-stock-keyword')?.value || '').trim().toLowerCase();

    let modelMap = {};
    INITIAL_PRODUCTS.forEach(p => {
      modelMap[p.model] = {
        model: p.model,
        ten: p.ten,
        nhom: p.nhom,
        khoVp: 0,
        khoCn: 0,
        khoCl: 0,
        totalInStock: 0,
        serials: []
      };
    });

    // Gom dữ liệu từ SERIAL_DB
    SERIAL_DB.forEach(s => {
      if (s.status === 'IN_STOCK') {
        if (!modelMap[s.model]) {
          modelMap[s.model] = {
            model: s.model,
            ten: s.tenHang || s.model,
            nhom: s.nhom || 'Khác',
            khoVp: 0,
            khoCn: 0,
            khoCl: 0,
            totalInStock: 0,
            serials: []
          };
        }
        if (s.kho === 'Kho VP') modelMap[s.model].khoVp++;
        else if (s.kho === 'Kho Chi Nhánh') modelMap[s.model].khoCn++;
        else if (s.kho === 'Kho Cách Ly (Hàng lỗi)') modelMap[s.model].khoCl++;
        modelMap[s.model].totalInStock++;
        modelMap[s.model].serials.push(s);
      }
    });

    // Lọc theo bộ lọc người dùng
    let filteredList = Object.values(modelMap);
    if (filterNhom) {
      filteredList = filteredList.filter(m => m.nhom === filterNhom);
    }
    if (keyword) {
      filteredList = filteredList.filter(m => m.model.toLowerCase().includes(keyword) || m.ten.toLowerCase().includes(keyword));
    }
    if (filterKho) {
      if (filterKho === 'Kho VP') filteredList = filteredList.filter(m => m.khoVp > 0);
      else if (filterKho === 'Kho Chi Nhánh') filteredList = filteredList.filter(m => m.khoCn > 0);
      else if (filterKho === 'Kho Cách Ly (Hàng lỗi)') filteredList = filteredList.filter(m => m.khoCl > 0);
    }

    if (filteredList.length === 0) {
      const isFiltered = !!(filterNhom || keyword || filterKho);
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-5">
            <i class="fa-solid fa-boxes-stacked fs-2 mb-2 d-block text-secondary opacity-50"></i>
            ${isFiltered 
              ? 'Không tìm thấy Model sản phẩm nào phù hợp với bộ lọc.' 
              : 'Kho hàng đang trống. Chưa có Model hoặc thiết bị nào trong kho.<br><small class="text-muted">Hệ thống đã sẵn sàng tiếp nhận file dữ liệu thực tế từ bạn.</small>'}
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filteredList.forEach(m => {
      html += `
        <tr>
          <td data-label="Model"><strong class="text-primary">${m.model}</strong></td>
          <td data-label="Tên Sản Phẩm">${m.ten}</td>
          <td data-label="Nhóm"><span class="badge bg-light text-dark border">${m.nhom}</span></td>
          <td data-label="Kho VP" class="text-center font-monospace">${m.khoVp}</td>
          <td data-label="Kho CN" class="text-center font-monospace">${m.khoCn}</td>
          <td data-label="Kho Cách Ly" class="text-center font-monospace ${m.khoCl > 0 ? 'text-danger fw-bold' : ''}">${m.khoCl}</td>
          <td data-label="Tổng Tồn" class="text-center">
            <span class="badge ${m.totalInStock > 0 ? 'bg-success' : 'bg-secondary'} fs-6">${m.totalInStock}</span>
          </td>
          <td data-label="Hành Động" class="text-end">
            <button class="btn btn-sm btn-outline-primary" onclick="openModelSerialsModal('${m.model}')">
              <i class="fa-solid fa-list-ul me-1"></i> Chi tiết (${m.serials.length} SN)
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  // 2. Chế độ xem tồn Theo Serial chi tiết (Yêu cầu E)
  function renderStockBySerial() {
    const tbody = document.getElementById('stock-serial-table-body');
    if (!tbody) return;
    const filterKho = document.getElementById('filter-stock-kho')?.value || '';
    const filterNhom = document.getElementById('filter-stock-nhom')?.value || '';
    const keyword = (document.getElementById('filter-stock-keyword')?.value || '').trim().toLowerCase();
    const agingFilter = document.getElementById('filter-stock-aging')?.value || '';
    const statusFilter = document.getElementById('filter-stock-status')?.value || 'IN_STOCK';

    let list = [...SERIAL_DB];

    // Lọc theo trạng thái
    if (statusFilter === 'IN_STOCK') {
      list = list.filter(s => s.status === 'IN_STOCK');
    } else if (statusFilter !== 'ALL') {
      list = list.filter(s => s.status === statusFilter);
    }

    // Lọc theo kho
    if (filterKho) {
      list = list.filter(s => s.kho === filterKho);
    }

    // Lọc theo nhóm
    if (filterNhom) {
      list = list.filter(s => s.nhom === filterNhom);
    }

    // Lọc theo từ khóa
    if (keyword) {
      list = list.filter(s => 
        s.serial.toLowerCase().includes(keyword) ||
        (s.internalId && s.internalId.toLowerCase().includes(keyword)) ||
        s.model.toLowerCase().includes(keyword) ||
        (s.tenHang && s.tenHang.toLowerCase().includes(keyword))
      );
    }

    // Lọc theo tuổi tồn kho (Aging - Yêu cầu E)
    if (agingFilter) {
      const minDays = parseInt(agingFilter);
      list = list.filter(s => {
        const days = calculateStockAging(s.ngayNhap);
        return days > minDays;
      });
    }

    if (list.length === 0) {
      const isFiltered = !!(filterKho || filterNhom || keyword || agingFilter || (statusFilter && statusFilter !== 'IN_STOCK' && statusFilter !== 'ALL'));
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-5">
            <i class="fa-solid fa-barcode fs-2 mb-2 d-block text-secondary opacity-50"></i>
            ${isFiltered 
              ? 'Không tìm thấy Serial nào phù hợp với bộ lọc.' 
              : 'Chưa có thiết bị / Serial nào trong kho.<br><small class="text-muted">Hệ thống đã sẵn sàng tiếp nhận file dữ liệu thực tế từ bạn.</small>'}
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    list.forEach(s => {
      const daysInStock = calculateStockAging(s.ngayNhap);
      let agingBadge = `<span class="badge bg-light text-dark border">${daysInStock} ngày</span>`;
      if (daysInStock > 90) agingBadge = `<span class="badge bg-danger">${daysInStock} ngày (>90N)</span>`;
      else if (daysInStock > 60) agingBadge = `<span class="badge bg-warning text-dark">${daysInStock} ngày (>60N)</span>`;
      else if (daysInStock > 30) agingBadge = `<span class="badge bg-info text-dark">${daysInStock} ngày</span>`;

      html += `
        <tr>
          <td data-label="Serial Hãng"><span class="font-monospace fw-bold text-primary">${s.serial}</span></td>
          <td data-label="Mã Nội Bộ"><span class="badge bg-secondary font-monospace">${s.internalId}</span></td>
          <td data-label="Model"><strong>${s.model}</strong></td>
          <td data-label="Kho">${s.kho}</td>
          <td data-label="Ngày Nhập">${s.ngayNhap}</td>
          <td data-label="Tuổi Tồn">${s.status === 'IN_STOCK' ? agingBadge : '<span class="text-muted">--</span>'}</td>
          <td data-label="Trạng Thái"><span class="badge-status ${getBadgeClass(s.status)}">${s.status}</span></td>
          <td data-label="Thao Tác" class="text-end">
            <button class="btn btn-sm btn-outline-secondary" onclick="openSerial360Direct('${s.serial}')" title="Xem hồ sơ 360°">
              <i class="fa-solid fa-fingerprint"></i> 360°
            </button>
            ${s.status === 'IN_STOCK' ? `
            <button class="btn btn-sm btn-outline-danger ms-1" onclick="voidSerialDevice('${s.serial}')" title="Hủy serial khỏi kho (VOID)">
              <i class="fa-solid fa-ban"></i> Hủy
            </button>` : ''}
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  // SERIAL WRITE SAFETY: Hủy thiết bị an toàn (chuyển VOID, không deleteRow, bảo tồn lịch sử)
  function voidSerialDevice(serialCode) {
    if (typeof checkPermission === 'function' && !checkPermission(['QUẢN LÝ', 'ADMIN'], 'Hủy thiết bị (VOID)')) return;

    Swal.fire({
      title: 'Hủy thiết bị khỏi tồn kho (VOID)?',
      html: `Bạn đang thực hiện chuyển trạng thái Serial <strong>${serialCode}</strong> sang <strong>VOID</strong>.<br><small class="text-muted">Hành động này không xóa dữ liệu và bảo toàn lịch sử tra cứu Serial 360°.</small>`,
      input: 'text',
      inputPlaceholder: 'Nhập lý do hủy (ví dụ: Nhập sai model, lỗi linh kiện, thanh lý...)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xác nhận hủy VOID',
      cancelButtonText: 'Bỏ qua',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Vui lòng nhập lý do hủy!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value.trim();
        WarehouseAPI.voidSerial(serialCode, reason, function(res) {
          if (res && res.success) {
            if (typeof markModulesDirty === 'function') {
              markModulesDirty(['Dashboard', 'TonKho', 'Serial360', 'LichSu']);
            }
            renderTonKho();
            Swal.fire({
              icon: 'success',
              title: 'Đã hủy thiết bị thành công!',
              text: res.message,
              timer: 1500,
              showConfirmButton: false
            });
          } else {
            Swal.fire('Lỗi', res ? res.message : 'Không thể hủy thiết bị!', 'error');
          }
        });
      }
    });
  }

  function applyStockFilter() {
    renderTonKho();
  }

  function resetStockFilter() {
    document.getElementById('filter-stock-kho').value = '';
    document.getElementById('filter-stock-nhom').value = '';
    document.getElementById('filter-stock-keyword').value = '';
    document.getElementById('filter-stock-aging').value = '';
    document.getElementById('filter-stock-status').value = 'IN_STOCK';
    renderTonKho();
  }

  // Cập nhật động danh sách kho và nhóm cho bộ lọc Tồn kho
  function updateStockFilterDropdowns() {
    const selKho = document.getElementById('filter-stock-kho');
    if (selKho) {
      const currentVal = selKho.value;
      let html = '<option value="">-- Tất cả kho --</option>';
      if (typeof INITIAL_WAREHOUSES !== 'undefined' && INITIAL_WAREHOUSES.length > 0) {
        INITIAL_WAREHOUSES.filter(w => w.active !== false).forEach(w => {
          html += `<option value="${w.tenKho}" ${currentVal === w.tenKho ? 'selected' : ''}>${w.tenKho}</option>`;
        });
      }
      selKho.innerHTML = html;
    }

    const selNhom = document.getElementById('filter-stock-nhom');
    if (selNhom) {
      const currentVal = selNhom.value;
      let html = '<option value="">-- Tất cả nhóm --</option>';
      if (typeof INITIAL_CATEGORIES !== 'undefined' && INITIAL_CATEGORIES.length > 0) {
        INITIAL_CATEGORIES.filter(c => c.active !== false).forEach(c => {
          html += `<option value="${c.tenNhom}" ${currentVal === c.tenNhom ? 'selected' : ''}>${c.tenNhom}</option>`;
        });
      }
      selNhom.innerHTML = html;
    }
  }

  // Mở modal xem danh sách serial của 1 model
  function openModelSerialsModal(modelName) {
    const list = SERIAL_DB.filter(s => s.model === modelName && s.status === 'IN_STOCK');
    document.getElementById('model-serials-modal-title').innerHTML = `Danh Sách Serial Tồn Thuộc Model: <strong class="text-primary">${modelName}</strong> (${list.length} máy)`;
    const tbody = document.getElementById('model-serials-table-body');

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Không có máy nào đang tồn</td></tr>';
    } else {
      let html = '';
      list.forEach((s, idx) => {
        const days = calculateStockAging(s.ngayNhap);
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td><strong class="font-monospace text-primary">${s.serial}</strong></td>
            <td><span class="badge bg-secondary font-monospace">${s.internalId}</span></td>
            <td>${s.kho}</td>
            <td>${s.ngayNhap}</td>
            <td><span class="badge bg-light text-dark border">${days} ngày</span></td>
            <td><span class="badge-status ${getBadgeClass(s.status)}">${s.status}</span></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary py-0" onclick="closeAndOpen360('${s.serial}')">
                <i class="fa-solid fa-fingerprint"></i>
              </button>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }

    const modal = new bootstrap.Modal(document.getElementById('modelSerialsModal'));
    modal.show();
  }

  function closeAndOpen360(serial) {
    const modalEl = document.getElementById('modelSerialsModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    openSerial360Direct(serial);
  }

  function openSerial360Direct(serial) {
    switchTab('Serial360');
    lookupSerial360(serial);
  }

  function openSerial360Modal(serial) {
    // Đóng các modal tóm tắt nếu đang hiển thị
    ['customerSummaryModal', 'supplierSummaryModal', 'warrantyDetailModal', 'modelSerialsModal'].forEach(id => {
      const modalEl = document.getElementById(id);
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
    });
    openSerial360Direct(serial);
  }

  /* ==================================================== */
  /* 11. HỒ SƠ LÝ LỊCH THIẾT BỊ (SERIAL 360° - YÊU CẦU F) */
  /* ==================================================== */
  function lookupSerial360(query) {
    const q = (query || '').trim();
    if (!q) {
      Swal.fire('Thiếu Serial', 'Vui lòng nhập Serial hãng hoặc Mã nội bộ Thành An!', 'warning');
      return;
    }

    document.getElementById('serial-360-search-input').value = q;

    // Tìm trong SERIAL_DB
    const target = SERIAL_DB.find(s => 
      s.serial.toLowerCase() === q.toLowerCase() || 
      (s.internalId && s.internalId.toLowerCase() === q.toLowerCase())
    );

    const container = document.getElementById('serial-360-profile-container');
    if (!target) {
      playBeepSound();
      container.innerHTML = `
        <div class="app-card p-5 text-center text-muted">
          <i class="fa-solid fa-circle-question fs-1 text-danger mb-3"></i>
          <h5 class="text-danger">Không tìm thấy thiết bị "${q}"</h5>
          <p class="small">Mã này chưa từng được ghi nhận trong cơ sở dữ liệu kho Thành An.</p>
        </div>
      `;
      return;
    }

    // Tìm tất cả các ca bảo hành của thiết bị này trong lịch sử (Yêu cầu F)
    const cases = WARRANTY_CASES_DB.filter(c => c.serial.toLowerCase() === target.serial.toLowerCase());

    const daysInStock = calculateStockAging(target.ngayNhap);

    let html = `
      <!-- THẺ TỔNG QUAN -->
      <div class="app-card mb-3">
        <div class="app-card-header bg-light">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-id-card text-primary fs-5"></i>
            <h5 class="mb-0 fw-bold">${target.model}</h5>
            <span class="badge-status ${getBadgeClass(target.status)} fs-6 ms-2">${target.status}</span>
          </div>
          <div>
            <span class="badge bg-light text-dark border me-1">Kho: <strong>${target.kho}</strong></span>
            ${target.status === 'IN_STOCK' ? `<span class="badge bg-info text-dark">Tồn: <strong>${daysInStock} ngày</strong></span>` : ''}
          </div>
        </div>
        <div class="app-card-body p-3">
          <div class="row g-3">
            <div class="col-12 col-md-6 border-end">
              <div class="mb-2">
                <small class="text-muted d-block fw-semibold">SERIAL HÃNG (IN TRÊN MÁY / TEM):</small>
                <span class="fs-5 fw-bold font-monospace text-primary">${target.serial}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted d-block fw-semibold">MÃ NỘI BỘ THÀNH AN (ASSET ID):</small>
                <span class="badge bg-secondary font-monospace fs-6">${target.internalId || target.maNoiBo || target.serial || '--'}</span>
              </div>
              <div>
                <small class="text-muted d-block fw-semibold">TÊN SẢN PHẨM & NHÓM HÀNG:</small>
                <span>${target.tenHang || target.name || target.model || 'Thiết bị'}</span> (<span class="text-muted">${target.nhom || target.nhomHang || target.category || 'Khác'}</span>)
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="row g-2">
                <div class="col-6">
                  <small class="text-muted d-block fw-semibold">NHÀ CUNG CẤP:</small>
                  <strong>${target.ncc || target.supplier || 'N/A'}</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block fw-semibold">PHIẾU & NGÀY NHẬP:</small>
                  <span>${target.maPhieuNhap || target.maPhieu || target.importVoucher || '--'} (${target.ngayNhap || target.importDate || '--'})</span>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block fw-semibold">KHÁCH HÀNG SỞ HỮU:</small>
                  <strong>${target.khachHang || '<span class="text-muted">Chưa xuất (Trong kho)</span>'}</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block fw-semibold">SĐT KHÁCH HÀNG:</small>
                  <span class="font-monospace">${target.sdtKhach || '--'}</span>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block fw-semibold">PHIẾU & NGÀY XUẤT:</small>
                  <span>${target.maPhieuXuat ? `${target.maPhieuXuat} (${target.ngayXuat || '--'})` : '<span class="text-muted">--</span>'}</span>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block fw-semibold">HẠN BẢO HÀNH:</small>
                  <span class="badge bg-warning text-dark font-monospace">${target.ngayHetHanBh || `${target.soThangBh || target.warrantyMonths || 12} tháng`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LỊCH SỬ BẢO HÀNH (WARRANTY CASES) -->
      <div class="app-card mb-3">
        <div class="app-card-header bg-light">
          <h6 class="app-card-title mb-0"><i class="fa-solid fa-shield-halved text-warning"></i> Toàn Bộ Lần Bảo Hành Của Thiết Bị Này (${cases.length})</h6>
        </div>
        <div class="app-card-body p-3">
          ${cases.length === 0 ? '<p class="text-muted small mb-0">Thiết bị chưa từng phát sinh ca bảo hành nào.</p>' : `
            <div class="table-responsive">
              <table class="table table-sm table-bordered align-middle mb-0">
                <thead class="table-light small">
                  <tr>
                    <th>Mã Case</th>
                    <th>Ngày Nhận</th>
                    <th>Lỗi Khách Báo</th>
                    <th>Kỹ Thuật</th>
                    <th>Hãng / NCC Nhận</th>
                    <th>Ngày Hẹn Trả</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody class="small">
                  ${cases.map(c => `
                    <tr>
                      <td><strong class="text-warning">${c.caseId}</strong></td>
                      <td>${c.ngayTiepNhan}</td>
                      <td>${c.loiKhachBao}</td>
                      <td>${c.kyThuatPhuTrach || '--'}</td>
                      <td>${c.nccHang || '--'}</td>
                      <td>${c.ngayHenTra || '--'}</td>
                      <td><span class="badge bg-warning text-dark">${c.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <!-- TIMELINE TOÀN BỘ VÒNG ĐỜI (AUDIT TIMELINE - YÊU CẦU F) -->
      <div class="app-card">
        <div class="app-card-header bg-light">
          <h6 class="app-card-title mb-0"><i class="fa-solid fa-clock-rotate-left text-primary"></i> Timeline Toàn Bộ Vòng Đời Thiết Bị</h6>
        </div>
        <div class="app-card-body p-3">
          <div class="timeline">
            ${(target.timeline || []).map((t, idx) => `
              <div class="timeline-item">
                <div class="timeline-dot"><i class="fa-solid fa-check"></i></div>
                <div class="timeline-content">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-primary">${t.action}</strong>
                    <small class="text-muted">${t.date}</small>
                  </div>
                  <p class="mb-1 small">${t.note}</p>
                  <small class="text-muted">Thực hiện bởi: <strong>${t.user}</strong></small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
