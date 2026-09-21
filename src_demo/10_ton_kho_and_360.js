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
      if (agingFilter === '0-30') {
        list = list.filter(s => {
          const days = calculateStockAging(s.ngayNhap);
          return days >= 0 && days <= 30;
        });
      } else if (agingFilter === '31-60') {
        list = list.filter(s => {
          const days = calculateStockAging(s.ngayNhap);
          return days > 30 && days <= 60;
        });
      } else if (agingFilter === '61-90') {
        list = list.filter(s => {
          const days = calculateStockAging(s.ngayNhap);
          return days > 60 && days <= 90;
        });
      } else if (agingFilter === '90+' || agingFilter === '90plus') {
        list = list.filter(s => {
          const days = calculateStockAging(s.ngayNhap);
          return days > 90;
        });
      } else {
        const minDays = parseInt(agingFilter);
        if (!isNaN(minDays)) {
          list = list.filter(s => {
            const days = calculateStockAging(s.ngayNhap);
            return days > minDays;
          });
        }
      }
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
    const container = document.getElementById('serial-360-profile-container');
    if (!container) return;

    if (!q) {
      // Giao diện mặc định: Khung hướng dẫn & Danh sách gợi ý tra cứu nhanh
      container.innerHTML = `
        <div class="app-card p-4 text-center">
          <div class="mb-3">
            <span class="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
              <i class="fa-solid fa-fingerprint fs-1"></i>
            </span>
          </div>
          <h5 class="fw-bold text-dark">Tra Cứu Hồ Sơ Thiết Bị Toàn Diện (Serial 360°)</h5>
          <p class="text-muted small mx-auto" style="max-width: 580px;">
            Nhập Serial in trên tem máy hoặc quét mã vạch để truy vết toàn bộ vòng đời: từ lúc nhập kho, nhà cung cấp, xuất bán cho ai, hạn bảo hành và lịch sử sửa chữa.
          </p>
          <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
            <span class="small fw-semibold text-muted align-self-center">Gợi ý thiết bị thực tế để trải nghiệm liên kết:</span>
            <button class="btn btn-sm btn-outline-primary" onclick="lookupSerial360('U6QP281903042')">
              <i class="fa-solid fa-microchip me-1"></i> U6QP281903042 (CPU Đã bán)
            </button>
            <button class="btn btn-sm btn-outline-primary" onclick="lookupSerial360('TKSMC25C8X01266')">
              <i class="fa-solid fa-hard-drive me-1"></i> TKSMC25C8X (SSD Đã bán)
            </button>
            <button class="btn btn-sm btn-outline-success" onclick="lookupSerial360('CNB1T5GC6X')">
              <i class="fa-solid fa-print me-1"></i> CNB1T5GC6X (HP 108a Còn tồn)
            </button>
            <button class="btn btn-sm btn-outline-success" onclick="lookupSerial360('NTMA681531')">
              <i class="fa-solid fa-print me-1"></i> NTMA681531 (Canon Còn tồn)
            </button>
          </div>
        </div>
      `;
      return;
    }

    const inputEl = document.getElementById('serial-360-search-input');
    if (inputEl) inputEl.value = q;

    // Tìm trong SERIAL_DB
    const target = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => 
      s.serial.toLowerCase() === q.toLowerCase() || 
      (s.internalId && s.internalId.toLowerCase() === q.toLowerCase())
    );

    if (!target) {
      if (typeof playBeepSound === 'function') playBeepSound();
      container.innerHTML = `
        <div class="app-card p-5 text-center text-muted">
          <i class="fa-solid fa-circle-question fs-1 text-danger mb-3"></i>
          <h5 class="text-danger fw-bold">Không tìm thấy thiết bị "${q}"</h5>
          <p class="small text-muted mb-3">Serial hoặc Mã nội bộ này chưa từng được ghi nhận trong cơ sở dữ liệu kho Thành An.</p>
          <button class="btn btn-sm btn-outline-secondary" onclick="lookupSerial360('')">
            <i class="fa-solid fa-arrow-left me-1"></i> Quay lại tra cứu khác
          </button>
        </div>
      `;
      return;
    }

    // Tìm tất cả các ca bảo hành của thiết bị này trong lịch sử
    const cases = (typeof WARRANTY_CASES_DB !== 'undefined' ? WARRANTY_CASES_DB : []).filter(c => c.serial && c.serial.toLowerCase() === target.serial.toLowerCase());
    const daysInStock = typeof calculateStockAging === 'function' ? calculateStockAging(target.ngayNhap) : 0;
    const isSold = target.status === 'SOLD';
    const isWarranty = target.status === 'IN_WARRANTY';
    const isInStock = target.status === 'IN_STOCK';

    // Tính hạn bảo hành trực quan
    let warrantyBadgeHtml = '';
    let warrantyProgressHtml = '';
    if (target.ngayHetHanBh) {
      const parts = target.ngayHetHanBh.split('/');
      if (parts.length === 3) {
        const expDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
          warrantyBadgeHtml = `<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1"><i class="fa-solid fa-shield-check me-1"></i>CÒN BẢO HÀNH (còn ${diffDays} ngày)</span>`;
        } else {
          warrantyBadgeHtml = `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>HẾT HẠN BẢO HÀNH (${Math.abs(diffDays)} ngày trước)</span>`;
        }
      }
    } else if (target.soThangBh) {
      warrantyBadgeHtml = `<span class="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning px-2 py-1"><i class="fa-solid fa-shield me-1"></i>Tiêu chuẩn ${target.soThangBh} tháng</span>`;
    }

    let html = `
      <!-- 1. THẺ HEADER: THÔNG TIN NHẬN DIỆN THIẾT BỊ -->
      <div class="app-card mb-3 border-top border-4 ${isInStock ? 'border-success' : isSold ? 'border-primary' : 'border-warning'}">
        <div class="app-card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
              <a href="javascript:void(0)" onclick="goToTonKhoByModel('${target.model}')" class="h5 mb-0 fw-bold text-decoration-none text-dark hover-text-primary" title="Bấm để xem tất cả máy model này trong kho">
                ${target.model} <i class="fa-solid fa-arrow-up-right-from-square text-primary ms-1" style="font-size: 0.85rem;"></i>
              </a>
              ${isInStock ? '<span class="badge bg-success fs-6"><i class="fa-solid fa-boxes-stacked me-1"></i>ĐANG TỒN KHO</span>' :
                isSold ? '<span class="badge bg-primary fs-6"><i class="fa-solid fa-truck-ramp-box me-1"></i>ĐÃ XUẤT BÁN</span>' :
                isWarranty ? '<span class="badge bg-warning text-dark fs-6"><i class="fa-solid fa-shield-halved me-1"></i>ĐANG BẢO HÀNH</span>' :
                `<span class="badge bg-secondary fs-6">${target.status}</span>`}
              ${warrantyBadgeHtml}
            </div>
            <div class="text-secondary small">
              ${target.tenHang || target.model} 
              · Phân nhóm: <a href="javascript:void(0)" onclick="goToTonKhoByCategory('${target.nhomHang || target.nhom || 'Máy In'}')" class="fw-semibold text-decoration-none text-primary">${target.nhomHang || target.nhom || 'Thiết bị'} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem;"></i></a>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" onclick="openCreateWarrantyCaseModal('${target.serial}')" title="Tiếp nhận ca bảo hành cho thiết bị này">
              <i class="fa-solid fa-shield-halved text-warning me-1"></i> Tạo ca bảo hành
            </button>
            <button class="btn btn-sm btn-outline-primary" onclick="goToTonKhoByModel('${target.model}')" title="Xem danh sách tồn kho của Model này">
              <i class="fa-solid fa-cubes-stacked me-1"></i> Xem tồn kho model
            </button>
          </div>
        </div>

        <div class="app-card-body p-4 bg-light bg-opacity-25">
          <!-- HÀNG SERIAL & ASSET ID VỚI NÚT COPY TIỆN DỤNG -->
          <div class="row g-3 mb-3 p-3 bg-white rounded border">
            <div class="col-12 col-md-6 border-end">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="text-uppercase small fw-bold text-muted"><i class="fa-solid fa-barcode text-primary me-1"></i> Serial Hãng (Mfg Serial):</span>
                <button class="btn btn-link btn-sm text-decoration-none p-0 text-muted" onclick="copyTextToClipboard('${target.serial}', 'Serial')" title="Sao chép Serial">
                  <i class="fa-regular fa-copy"></i> Copy
                </button>
              </div>
              <div class="fs-4 fw-bold font-monospace text-primary tracking-wide">${target.serial}</div>
              <div class="small text-muted mt-1"><i class="fa-solid fa-tag me-1"></i> In trực tiếp trên vỏ máy hoặc tem barcode của hãng.</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="text-uppercase small fw-bold text-muted"><i class="fa-solid fa-hashtag text-secondary me-1"></i> Mã Nội Bộ Thành An (Asset ID):</span>
                <button class="btn btn-link btn-sm text-decoration-none p-0 text-muted" onclick="copyTextToClipboard('${target.internalId || target.serial}', 'Mã nội bộ')" title="Sao chép Mã nội bộ">
                  <i class="fa-regular fa-copy"></i> Copy
                </button>
              </div>
              <div class="fs-4 fw-bold font-monospace text-dark">${target.internalId || target.maNoiBo || '--'}</div>
              <div class="small text-muted mt-1"><i class="fa-solid fa-qrcode me-1"></i> Mã định danh riêng dán tem quản lý nội bộ Thành An.</div>
            </div>
          </div>

          <!-- 2 CỘT SONG HÀNH: NGUỒN GỐC NHẬP KHO vs BÀN GIAO XUẤT KHO -->
          <div class="row g-3">
            <!-- CỘT 1: NGUỒN GỐC & NHẬP KHO (INBOUND) -->
            <div class="col-12 col-md-6">
              <div class="p-3 bg-white rounded border h-100 shadow-sm">
                <div class="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                  <span class="fw-bold text-success"><i class="fa-solid fa-truck-ramp-box me-2"></i>1. NGUỒN GỐC & NHẬP KHO</span>
                  <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Đầu vào</span>
                </div>
                <div class="d-flex flex-column gap-2" style="font-size: 0.86rem;">
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span class="text-secondary">Nhà cung cấp:</span>
                    <a href="javascript:void(0)" onclick="goToSupplierHistory('${target.ncc}')" class="fw-bold text-decoration-none text-primary hover-underline" title="Bấm để xem lịch sử nhập từ ${target.ncc}">
                      <i class="fa-solid fa-building me-1 text-secondary"></i>${target.ncc || 'N/A'} <i class="fa-solid fa-arrow-up-right-from-square small text-primary ms-1"></i>
                    </a>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span class="text-secondary">Phiếu nhập kho:</span>
                    <a href="javascript:void(0)" onclick="goToHistoryVoucher('NHAP', '${target.maPhieuNhap}')" class="fw-bold font-monospace text-decoration-none text-primary" title="Bấm để xem chi tiết phiếu nhập ${target.maPhieuNhap}">
                      <i class="fa-solid fa-file-lines me-1 text-secondary"></i>${target.maPhieuNhap || '--'} <i class="fa-solid fa-arrow-up-right-from-square small text-primary ms-1"></i>
                    </a>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span class="text-secondary">Thời gian nhập:</span>
                    <span class="fw-semibold text-dark"><i class="fa-regular fa-calendar-check me-1 text-muted"></i>${target.ngayNhap || '--'}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span class="text-secondary">Kho hàng tiếp nhận:</span>
                    <a href="javascript:void(0)" onclick="goToTonKhoByKho('${target.kho}')" class="fw-bold text-decoration-none text-dark hover-text-primary" title="Bấm để xem danh sách máy tại kho ${target.kho}">
                      <i class="fa-solid fa-warehouse me-1 text-muted"></i>${target.kho || '--'} <i class="fa-solid fa-arrow-up-right-from-square small text-muted ms-1"></i>
                    </a>
                  </div>
                  <div class="d-flex justify-content-between align-items-center py-1">
                    <span class="text-secondary">Tuổi tồn kho hiện tại:</span>
                    <span class="fw-semibold ${daysInStock > 60 ? 'text-danger' : 'text-success'}">${daysInStock} ngày</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CỘT 2: BÀN GIAO & XUẤT KHO (OUTBOUND) -->
            <div class="col-12 col-md-6">
              <div class="p-3 bg-white rounded border h-100 shadow-sm">
                <div class="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                  <span class="fw-bold text-primary"><i class="fa-solid fa-user-check me-2"></i>2. BÀN GIAO & XUẤT KHO</span>
                  <span class="badge ${isSold ? 'bg-primary' : 'bg-secondary'} bg-opacity-10 ${isSold ? 'text-primary' : 'text-secondary'} border">${isSold ? 'Đã bàn giao' : 'Trong kho'}</span>
                </div>
                ${isSold ? `
                  <div class="d-flex flex-column gap-2" style="font-size: 0.86rem;">
                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span class="text-secondary">Khách hàng sở hữu:</span>
                      <a href="javascript:void(0)" onclick="goToCustomerHistory('${target.khachHang}')" class="fw-bold text-decoration-none text-primary hover-underline" title="Bấm để xem lịch sử xuất cho ${target.khachHang}">
                        <i class="fa-solid fa-user me-1 text-secondary"></i>${target.khachHang} <i class="fa-solid fa-arrow-up-right-from-square small text-primary ms-1"></i>
                      </a>
                    </div>
                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span class="text-secondary">SĐT Khách hàng:</span>
                      <div class="d-flex align-items-center gap-2">
                        <a href="tel:${target.sdtKhach}" class="fw-bold font-monospace text-decoration-none text-success">
                          <i class="fa-solid fa-phone me-1"></i>${target.sdtKhach || '--'}
                        </a>
                        ${target.sdtKhach ? `<button class="btn btn-link btn-sm p-0 text-muted" onclick="copyTextToClipboard('${target.sdtKhach}', 'SĐT')" title="Copy SĐT"><i class="fa-regular fa-copy"></i></button>` : ''}
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span class="text-secondary">Phiếu xuất kho:</span>
                      <a href="javascript:void(0)" onclick="goToHistoryVoucher('XUAT', '${target.maPhieuXuat}')" class="fw-bold font-monospace text-decoration-none text-primary" title="Bấm để xem chi tiết phiếu xuất ${target.maPhieuXuat}">
                        <i class="fa-solid fa-file-invoice-dollar me-1 text-secondary"></i>${target.maPhieuXuat || '--'} <i class="fa-solid fa-arrow-up-right-from-square small text-primary ms-1"></i>
                      </a>
                    </div>
                    <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                      <span class="text-secondary">Thời gian xuất:</span>
                      <span class="fw-semibold text-dark"><i class="fa-regular fa-calendar-check me-1 text-muted"></i>${target.ngayXuat || '--'}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center py-1">
                      <span class="text-secondary">Hạn bảo hành đến:</span>
                      <span class="fw-bold font-monospace text-warning-emphasis"><i class="fa-solid fa-shield-halved me-1 text-warning"></i>${target.ngayHetHanBh || `${target.soThangBh || 12} tháng`}</span>
                    </div>
                  </div>
                ` : `
                  <div class="text-center py-4 text-muted">
                    <i class="fa-solid fa-boxes-stacked fs-2 text-success opacity-50 mb-2 d-block"></i>
                    <div class="fw-bold text-dark">Thiết bị đang còn trong kho</div>
                    <p class="small text-muted mb-3">Chưa phát sinh chứng từ xuất bán. Thiết bị đã sẵn sàng phục vụ đơn hàng mới.</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="switchTab('XuatKho')">
                      <i class="fa-solid fa-cart-plus me-1"></i> Tạo phiếu xuất kho ngay
                    </button>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. LỊCH SỬ BẢO HÀNH (WARRANTY CASES) -->
      <div class="app-card mb-3">
        <div class="app-card-header bg-light d-flex justify-content-between align-items-center py-2 px-3">
          <h6 class="app-card-title mb-0 fw-bold">
            <i class="fa-solid fa-shield-halved text-warning me-2"></i>Lịch Sử Ca Bảo Hành Của Thiết Bị Này (${cases.length})
          </h6>
          <button class="btn btn-sm btn-outline-secondary" onclick="openCreateWarrantyCaseModal('${target.serial}')">
            <i class="fa-solid fa-plus me-1"></i> Tiếp nhận ca mới
          </button>
        </div>
        <div class="app-card-body p-3">
          ${cases.length === 0 ? `
            <div class="text-center text-muted py-3 small">
              <i class="fa-solid fa-circle-check text-success fs-4 mb-2 d-block opacity-75"></i>
              Thiết bị vận hành ổn định, chưa từng phát sinh ca bảo hành nào.
            </div>
          ` : `
            <div class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0" style="font-size:0.83rem;">
                <thead class="table-light">
                  <tr>
                    <th>Mã Case</th>
                    <th>Ngày Nhận</th>
                    <th>Lỗi Khách Báo</th>
                    <th>Kỹ Thuật Phụ Trách</th>
                    <th>Hãng / NCC Nhận</th>
                    <th>Ngày Hẹn Trả</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  ${cases.map(c => `
                    <tr>
                      <td>
                        <a href="javascript:void(0)" onclick="goToWarrantyCaseDetail('${c.caseId}')" class="fw-bold text-decoration-none text-primary" title="Bấm để xem và cập nhật ca bảo hành này">
                          ${c.caseId} <i class="fa-solid fa-arrow-up-right-from-square small ms-1"></i>
                        </a>
                      </td>
                      <td>${c.ngayTiepNhan || '--'}</td>
                      <td>${c.loiKhachBao || '--'}</td>
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

      <!-- 3. TIMELINE TOÀN BỘ VÒNG ĐỜI (AUDIT LIFECYCLE TIMELINE) -->
      <div class="app-card">
        <div class="app-card-header bg-light py-2 px-3">
          <h6 class="app-card-title mb-0 fw-bold">
            <i class="fa-solid fa-clock-rotate-left text-primary me-2"></i>Dòng Thời Gian Vòng Đời Thiết Bị (Lifecycle Timeline)
          </h6>
        </div>
        <div class="app-card-body p-4">
          <div class="timeline">
            ${(target.timeline || []).map((t, idx) => {
              const isNhap = t.action && t.action.includes('Nhập');
              const isXuat = t.action && t.action.includes('Xuất');
              const isBh = t.action && t.action.includes('Bảo hành');
              const dotColor = isNhap ? 'bg-success' : isXuat ? 'bg-primary' : isBh ? 'bg-warning' : 'bg-info';
              const dotIcon = isNhap ? 'fa-truck-ramp-box' : isXuat ? 'fa-truck-fast' : isBh ? 'fa-shield-halved' : 'fa-check';
              return `
                <div class="timeline-item">
                  <div class="timeline-dot ${dotColor} text-white d-flex align-items-center justify-content-center">
                    <i class="fa-solid ${dotIcon}" style="font-size:0.75rem;"></i>
                  </div>
                  <div class="timeline-content p-3 rounded border bg-light bg-opacity-50">
                    <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                      <strong class="${isNhap ? 'text-success' : isXuat ? 'text-primary' : 'text-dark'}">${t.action}</strong>
                      <small class="text-muted"><i class="fa-regular fa-clock me-1"></i>${t.date}</small>
                    </div>
                    <p class="mb-2 small text-dark">${t.note}</p>
                    <div class="d-flex justify-content-between align-items-center small text-muted">
                      <span>Thực hiện bởi: <strong class="text-secondary">${t.user || 'admin'}</strong></span>
                      ${isNhap && target.maPhieuNhap ? `
                        <a href="javascript:void(0)" onclick="goToHistoryVoucher('NHAP', '${target.maPhieuNhap}')" class="text-primary text-decoration-none">
                          Xem phiếu nhập <i class="fa-solid fa-arrow-right small ms-1"></i>
                        </a>
                      ` : isXuat && target.maPhieuXuat ? `
                        <a href="javascript:void(0)" onclick="goToHistoryVoucher('XUAT', '${target.maPhieuXuat}')" class="text-primary text-decoration-none">
                          Xem phiếu xuất <i class="fa-solid fa-arrow-right small ms-1"></i>
                        </a>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
