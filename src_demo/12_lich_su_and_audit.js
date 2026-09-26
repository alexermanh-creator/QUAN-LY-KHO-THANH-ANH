  /* ==================================================== */
  /* 12. LỊCH SỬ PHIẾU, SỬA PHIẾU & AUDIT CENTER (YÊU CẦU 1, 2, 3, 7) */
  /* ==================================================== */

  let AUDIT_FILTER_PRESET = 'all';

  let HISTORY_SUBTAB_STATE = {
    nhap: { rendered: false, dirty: true },
    xuat: { rendered: false, dirty: true },
    audit: { rendered: false, dirty: true }
  };
  if (typeof window !== 'undefined') window.HISTORY_SUBTAB_STATE = HISTORY_SUBTAB_STATE;
  let HISTORY_SUBTABS_INITIALIZED = false;

  function renderHistoryTables(forceTab) {
    initHistorySubtabsListener();

    let targetTab = forceTab;
    if (!targetTab) {
      if (document.getElementById('tab-ls-nhap')?.classList.contains('active')) {
        targetTab = 'nhap';
      } else if (document.getElementById('tab-ls-xuat')?.classList.contains('active')) {
        targetTab = 'xuat';
      } else if (document.getElementById('tab-ls-audit')?.classList.contains('active')) {
        targetTab = 'audit';
      } else {
        targetTab = 'nhap';
      }
    }

    renderActiveHistorySubtab(targetTab);
  }

  function renderActiveHistorySubtab(tabName) {
    if (tabName === 'nhap') {
      if (!HISTORY_SUBTAB_STATE.nhap.rendered || HISTORY_SUBTAB_STATE.nhap.dirty) {
        renderHistoryNhapTable();
      }
    } else if (tabName === 'xuat') {
      if (!HISTORY_SUBTAB_STATE.xuat.rendered || HISTORY_SUBTAB_STATE.xuat.dirty) {
        renderHistoryXuatTable();
      }
    } else if (tabName === 'audit') {
      if (typeof hasPermission === 'function' && !hasPermission('Audit.View')) {
        renderActiveHistorySubtab('nhap');
        const nhapBtn = document.getElementById('tab-ls-nhap-btn');
        if (nhapBtn && typeof bootstrap !== 'undefined') {
          bootstrap.Tab.getOrCreateInstance(nhapBtn).show();
        }
        return;
      }
      if (!HISTORY_SUBTAB_STATE.audit.rendered || HISTORY_SUBTAB_STATE.audit.dirty) {
        renderAuditTable();
      }
    }
  }

  function initHistorySubtabsListener() {
    if (HISTORY_SUBTABS_INITIALIZED) return;
    if (typeof document === 'undefined') return;

    const btnNhap = document.getElementById('tab-ls-nhap-btn');
    const btnXuat = document.getElementById('tab-ls-xuat-btn');
    const btnAudit = document.getElementById('tab-ls-audit-btn');

    if (btnNhap) {
      btnNhap.addEventListener('shown.bs.tab', () => renderActiveHistorySubtab('nhap'));
      btnNhap.addEventListener('click', () => renderActiveHistorySubtab('nhap'));
    }
    if (btnXuat) {
      btnXuat.addEventListener('shown.bs.tab', () => renderActiveHistorySubtab('xuat'));
      btnXuat.addEventListener('click', () => renderActiveHistorySubtab('xuat'));
    }
    if (btnAudit) {
      btnAudit.addEventListener('shown.bs.tab', () => renderActiveHistorySubtab('audit'));
      btnAudit.addEventListener('click', () => renderActiveHistorySubtab('audit'));
    }
    HISTORY_SUBTABS_INITIALIZED = true;
  }

  // BỘ LỌC LỊCH SỬ PHIẾU NHẬP (YÊU CẦU 8A & DATE RANGE)
  function setNhapPreset(preset) {
    if (preset === 'all') {
      resetNhapHistoryFilters();
      return;
    }

    const fromInput = document.getElementById('filter-nhap-from');
    const toInput = document.getElementById('filter-nhap-to');
    if (!fromInput || !toInput) return;

    const todayStr = getLocalDateStr();
    fromInput.value = '';
    toInput.value = '';

    if (preset === 'today') {
      fromInput.value = todayStr;
      toInput.value = todayStr;
    } else if (preset === '7days') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      fromInput.value = getLocalDateStr(d7);
      toInput.value = todayStr;
    } else if (preset === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      fromInput.value = getLocalDateStr(startOfMonth);
      toInput.value = todayStr;
    }
    applyNhapHistoryFilters();
  }

  function resetNhapHistoryFilters() {
    if (document.getElementById('filter-nhap-search')) document.getElementById('filter-nhap-search').value = '';
    if (document.getElementById('filter-nhap-ncc')) document.getElementById('filter-nhap-ncc').value = '';
    if (document.getElementById('filter-nhap-kho')) document.getElementById('filter-nhap-kho').value = '';
    if (document.getElementById('filter-nhap-status')) document.getElementById('filter-nhap-status').value = '';
    if (document.getElementById('filter-nhap-from')) document.getElementById('filter-nhap-from').value = '';
    if (document.getElementById('filter-nhap-to')) document.getElementById('filter-nhap-to').value = '';
    renderHistoryNhapTable();
  }

  function applyNhapHistoryFilters() {
    const filterFrom = document.getElementById('filter-nhap-from')?.value || '';
    const filterTo = document.getElementById('filter-nhap-to')?.value || '';
    if (filterFrom && filterTo && filterFrom > filterTo) {
      Swal.fire('Thời gian không hợp lệ', 'Từ ngày nhập không được lớn hơn Đến ngày!', 'warning');
      return;
    }
    renderHistoryNhapTable();
  }

  // ====================================================
  // PROMAX HELPERS: SẢN PHẨM & MODEL, STATUS ICON & ACCORDION
  // ====================================================

  function renderVoucherProductsSummary(items, type, maPhieu) {
    if (!items || items.length === 0) return '<span class="text-muted small">-- Chưa có thiết bị --</span>';
    const modelCounts = {};
    items.forEach(it => {
      const m = (it.model || 'Chưa rõ Model').trim();
      if (!modelCounts[m]) {
        const prodList = (typeof PRODUCTS_DB !== 'undefined' && Array.isArray(PRODUCTS_DB) && PRODUCTS_DB.length > 0)
          ? PRODUCTS_DB
          : (typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []);
        const prod = prodList.find(p => p.model === m);
        modelCounts[m] = {
          model: m,
          ten: prod ? (prod.ten || prod.name) : (it.ten || it.name || ''),
          count: 0
        };
      }
      modelCounts[m].count++;
    });

    const list = Object.values(modelCounts);

    // TRƯỜNG HỢP 1: CHỈ CÓ 1 MODEL (Ví dụ 2 cái SSD, hoặc 1 máy in)
    // Không hiện badge xN ở đây nữa vì cột SL đã hiển thị số lượng rõ ràng, tránh trùng lặp
    if (list.length === 1) {
      const single = list[0];
      return `
        <div>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace fw-semibold">${single.model}</span>
          ${single.ten ? `<div class="small text-muted text-truncate" style="max-width: 250px;" title="${single.ten}">${single.ten}</div>` : ''}
        </div>
      `;
    }

    // TRƯỜNG HỢP 2: NHIỀU THIẾT BỊ / LINH KIỆN KHÁC NHAU (Ví dụ 1 bộ PC gồm CPU, Main, RAM, SSD...)
    // Hiển thị 2 linh kiện đầu tiên kèm số lượng từng món, các linh kiện còn lại gom gọn thành nút mở nhanh
    const visibleModels = list.slice(0, 2);
    const remainCount = list.length - visibleModels.length;

    return `
      <div class="d-flex flex-column gap-1">
        ${visibleModels.map(item => `
          <div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace fw-semibold">${item.model}</span>
            <span class="badge bg-secondary-subtle text-dark border ms-1">x${item.count}</span>
            ${item.ten ? `<div class="small text-muted text-truncate" style="max-width: 250px;" title="${item.ten}">${item.ten}</div>` : ''}
          </div>
        `).join('')}
        ${remainCount > 0 ? `
          <div>
            <a href="javascript:void(0)" onclick="toggleVoucherAccordion('${type || 'XUAT'}', '${maPhieu || ''}')" class="badge bg-light text-primary border text-decoration-none mt-1 d-inline-flex align-items-center">
              <i class="fa-solid fa-layer-group me-1 text-primary"></i>+ ${remainCount} linh kiện khác... (Bấm xem [▼])
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Hàm chuẩn hóa làm sạch Tên & SĐT khách hàng, chống lặp chuỗi
  function formatCustomerDisplayName(rawName, rawPhone) {
    if (!rawName) return { name: 'Khách lẻ', phone: rawPhone || '' };
    let name = String(rawName).trim();
    let phone = String(rawPhone || '').trim();

    // Loại bỏ lặp kiểu: (CÔNG TY CỔ PHẦN CÔNG NGHỆ S9) - CÔNG TY CỔ PHẦN CÔNG NGHỆ S9
    if (name.includes(') - ')) {
      const parts = name.split(') - ');
      if (parts.length >= 2) {
        const clean0 = parts[0].replace(/^[^\w\sÀ-ỹ]+|[^\w\sÀ-ỹ]+$/g, '').trim().toLowerCase();
        const clean1 = parts[1].replace(/^[^\w\sÀ-ỹ]+|[^\w\sÀ-ỹ]+$/g, '').trim().toLowerCase();
        if (clean0 === clean1) {
          name = parts[1].trim();
        }
      }
    }

    // Bóc tách số điện thoại bị ngoặc trong tên: "C Nhung (0969110828)" hoặc "C Nhung (0969110828 - C Nhung)"
    const phoneMatch = name.match(/\((\d{9,11})[^\)]*\)/);
    if (phoneMatch) {
      if (!phone) phone = phoneMatch[1];
      name = name.replace(/\s*\([^\)]*\)\s*/g, ' ').trim();
    }

    // Loại bỏ số điện thoại lẻ ở cuối tên nếu có
    const trailingPhone = name.match(/^(.*?)\s*(\d{9,11})$/);
    if (trailingPhone) {
      name = trailingPhone[1].trim();
      if (!phone) phone = trailingPhone[2];
    }

    return { name: name || 'Khách hàng', phone: phone };
  }
  if (typeof window !== 'undefined') window.formatCustomerDisplayName = formatCustomerDisplayName;

  function renderVoucherStatusIcon(status, ghiChu) {
    const isCancelled = status === 'CANCELLED' || (ghiChu && (ghiChu.includes('[CANCELLED:') || ghiChu.toUpperCase().includes('CANCELLED')));
    if (isCancelled) {
      return `<span class="badge rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center shadow-xs" style="width: 26px; height: 26px; font-size: 0.85rem;" title="Đã hủy"><i class="fa-solid fa-xmark"></i></span>`;
    } else if (status === 'CONFIRMED') {
      return `<span class="badge rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center shadow-xs" style="width: 26px; height: 26px; font-size: 0.85rem;" title="Đã xác nhận"><i class="fa-solid fa-check"></i></span>`;
    } else if (status === 'DRAFT') {
      return `<span class="badge rounded-circle bg-warning text-dark d-inline-flex align-items-center justify-content-center shadow-xs" style="width: 26px; height: 26px; font-size: 0.85rem;" title="Phiếu nháp"><i class="fa-solid fa-pen-nib"></i></span>`;
    }
    return `<span class="badge rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center shadow-xs" style="width: 26px; height: 26px; font-size: 0.85rem;" title="${status}"><i class="fa-solid fa-question"></i></span>`;
  }

  function renderVoucherSubRow(type, v) {
    const items = v.items || [];
    return `
      <tr id="subrow-${type}-${v.maPhieu}" style="display: none;" class="bg-light-subtle">
        <td colspan="10" class="p-2 ps-4">
          <div class="border rounded bg-white p-3 shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="small fw-bold text-dark">
                <i class="fa-solid fa-barcode text-primary me-1"></i> Danh Sách Serial Trong Phiếu (${items.length} thiết bị):
              </span>
              <button class="btn btn-xs btn-outline-primary" onclick="openVoucherDetail('${type}', '${v.maPhieu}')">
                <i class="fa-solid fa-expand me-1"></i>Xem Chi Tiết Đầy Đủ
              </button>
            </div>
            ${items.length === 0 ? '<div class="text-muted small fst-italic">Phiếu này chưa ghi nhận danh sách Serial chi tiết</div>' : `
              <div class="table-responsive">
                <table class="table table-sm table-bordered align-middle mb-0 small">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 35px;" class="text-center">#</th>
                      <th style="width: 150px;">Mã Nội Bộ</th>
                      <th style="width: 170px;">Serial Hãng (Mfg SN)</th>
                      <th>Model Sản Phẩm</th>
                      <th style="width: 120px;" class="text-center">Thời Hạn BH</th>
                      <th style="width: 130px;" class="text-center">Trạng Thái Serial</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map((it, idx) => {
                      const serialDb = typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : [];
                      const sItem = serialDb.find(s => s.serial === it.serial || (it.internalId && s.internalId === it.internalId));
                      const currentStatus = sItem ? sItem.status : (type === 'NHAP' ? (v.status === 'CANCELLED' ? 'CANCELLED_IMPORT' : 'IN_STOCK') : 'SOLD');
                      let badgeStatus = '<span class="badge bg-secondary">' + currentStatus + '</span>';
                      if (currentStatus === 'IN_STOCK') badgeStatus = '<span class="badge bg-success-subtle text-success border border-success-subtle">Tồn kho</span>';
                      else if (currentStatus === 'SOLD') badgeStatus = '<span class="badge bg-primary-subtle text-primary border border-primary-subtle">Đã xuất</span>';
                      else if (currentStatus === 'IN_WARRANTY') badgeStatus = '<span class="badge bg-warning-subtle text-warning border border-warning-subtle">Bảo hành</span>';
                      else if (currentStatus === 'CANCELLED_IMPORT') badgeStatus = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Đã hủy nhập</span>';
                      return `
                        <tr>
                          <td class="text-center text-muted">${idx + 1}</td>
                          <td class="font-monospace fw-bold text-primary">${it.internalId || '--'}</td>
                          <td class="font-monospace fw-bold text-dark">${it.serial || '--'}</td>
                          <td>
                            <span class="badge bg-light text-dark border font-monospace me-1">${it.model || '--'}</span>
                            ${it.tenHang || it.ten ? `<span class="text-muted small">${it.tenHang || it.ten}</span>` : ''}
                          </td>
                          <td class="text-center">${it.soThangBh ? it.soThangBh + ' tháng' : '--'}</td>
                          <td class="text-center">${badgeStatus}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </td>
      </tr>
    `;
  }

  function toggleVoucherAccordion(type, maPhieu) {
    const subrow = document.getElementById(`subrow-${type}-${maPhieu}`);
    const btn = document.getElementById(`btn-toggle-${type}-${maPhieu}`);
    if (!subrow) return;
    const isHidden = subrow.style.display === 'none';
    subrow.style.display = isHidden ? 'table-row' : 'none';
    if (btn) {
      btn.innerHTML = isHidden 
        ? '<i class="fa-solid fa-chevron-up text-primary" style="font-size: 0.72rem;"></i>'
        : '<i class="fa-solid fa-chevron-down text-secondary" style="font-size: 0.72rem;"></i>';
      btn.className = isHidden 
        ? 'btn btn-xs btn-primary-subtle border border-primary rounded-circle p-0 d-inline-flex align-items-center justify-content-center' 
        : 'btn btn-xs btn-light border rounded-circle p-0 d-inline-flex align-items-center justify-content-center';
    }
  }
  if (typeof window !== 'undefined') {
    window.toggleVoucherAccordion = toggleVoucherAccordion;
    window.renderVoucherProductsSummary = renderVoucherProductsSummary;
    window.renderVoucherStatusIcon = renderVoucherStatusIcon;
  }

  // Hàm chuẩn hóa thời gian và sắp xếp phiếu: MỚI NHẤT LÊN ĐẦU TIÊN
  function parseVoucherTime(v) {
    if (!v) return 0;
    if (v.createdAt) {
      const m = String(v.createdAt).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
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
      const t = new Date(v.createdAt).getTime();
      if (!isNaN(t)) return t;
    }
    const dateStr = v.ngayXuat || v.ngayNhap || v.ngay || '';
    if (dateStr) {
      const parts = String(dateStr).trim().split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
      }
      const partsDash = String(dateStr).trim().split('-');
      if (partsDash.length === 3) {
        if (partsDash[0].length === 4) {
          return new Date(parseInt(partsDash[0], 10), parseInt(partsDash[1], 10) - 1, parseInt(partsDash[2], 10)).getTime();
        } else {
          return new Date(parseInt(partsDash[2], 10), parseInt(partsDash[1], 10) - 1, parseInt(partsDash[0], 10)).getTime();
        }
      }
    }
    const matchCode = String(v.maPhieu || '').match(/\d+/g);
    if (matchCode && matchCode.length > 0) {
      return parseInt(matchCode.join(''), 10) || 0;
    }
    return 0;
  }

  function sortVouchersNewestFirst(a, b) {
    const tA = parseVoucherTime(a);
    const tB = parseVoucherTime(b);
    if (tB !== tA) return tB - tA; // Giảm dần: Mới nhất lên đầu
    return String(b.maPhieu || '').localeCompare(String(a.maPhieu || ''));
  }

  // Render bảng lịch sử Nhập kho với bộ lọc đầy đủ
  function renderHistoryNhapTable() {
    const tbody = document.getElementById('history-nhap-table-body');
    if (!tbody) return;
    HISTORY_SUBTAB_STATE.nhap.rendered = true;
    HISTORY_SUBTAB_STATE.nhap.dirty = false;

    const filterSearch = (document.getElementById('filter-nhap-search')?.value || '').trim().toLowerCase();
    const filterNcc = document.getElementById('filter-nhap-ncc')?.value || '';
    const filterKho = document.getElementById('filter-nhap-kho')?.value || '';
    const filterStatus = document.getElementById('filter-nhap-status')?.value || '';
    const filterFrom = document.getElementById('filter-nhap-from')?.value || '';
    const filterTo = document.getElementById('filter-nhap-to')?.value || '';

    let list = [...(VOUCHERS_DB.nhap || [])];
    list.sort(sortVouchersNewestFirst);

    // 1. Trạng thái
    if (filterStatus) list = list.filter(v => v.status === filterStatus);
    // 2. NCC
    if (filterNcc) list = list.filter(v => (v.ncc || '').toLowerCase().includes(filterNcc.toLowerCase()));
    // 3. Kho
    if (filterKho) list = list.filter(v => v.kho === filterKho);

    // 4. Từ ngày -> Đến ngày (theo ngày nhập v.ngay: DD/MM/YYYY)
    if (filterFrom) {
      const fromD = new Date(filterFrom);
      list = list.filter(v => {
        if (!v.ngay) return false;
        const parts = v.ngay.split('/');
        if (parts.length !== 3) return false;
        const vD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return vD >= fromD;
      });
    }

    if (filterTo) {
      const toD = new Date(filterTo);
      toD.setHours(23, 59, 59);
      list = list.filter(v => {
        if (!v.ngay) return false;
        const parts = v.ngay.split('/');
        if (parts.length !== 3) return false;
        const vD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return vD <= toD;
      });
    }

    // 5. Search mã phiếu / Serial / Model
    if (filterSearch) {
      list = list.filter(v => {
        const inCode = v.maPhieu && v.maPhieu.toLowerCase().includes(filterSearch);
        const inNote = v.ghiChu && v.ghiChu.toLowerCase().includes(filterSearch);
        const inNcc = v.ncc && v.ncc.toLowerCase().includes(filterSearch);
        const inItems = (v.items || []).some(it => 
          (it.serial && it.serial.toLowerCase().includes(filterSearch)) ||
          (it.internalId && it.internalId.toLowerCase().includes(filterSearch)) ||
          (it.model && it.model.toLowerCase().includes(filterSearch))
        );
        return inCode || inNote || inNcc || inItems;
      });
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Không tìm thấy phiếu nhập nào phù hợp bộ lọc</td></tr>';
      return;
    }

    let html = '';
    list.forEach(v => {
      const isCancelled = v.status === 'CANCELLED' || (v.ghiChu && (v.ghiChu.includes('[CANCELLED:') || v.ghiChu.toUpperCase().includes('CANCELLED')));
      const effectiveStatus = isCancelled ? 'CANCELLED' : (v.status || 'CONFIRMED');

      html += `
        <tr id="voucher-row-NHAP-${v.maPhieu}">
          <!-- Nút Accordion mở chi tiết Serial nhanh -->
          <td class="text-center p-1" data-label="Mở">
            <button class="btn btn-xs btn-light border rounded-circle p-0 d-inline-flex align-items-center justify-content-center" 
                    id="btn-toggle-NHAP-${v.maPhieu}" 
                    onclick="toggleVoucherAccordion('NHAP', '${v.maPhieu}')" 
                    style="width: 24px; height: 24px;" 
                    title="Xem nhanh danh sách Serial">
              <i class="fa-solid fa-chevron-down text-secondary" style="font-size: 0.7rem;"></i>
            </button>
          </td>
          <!-- Số phiếu (Click xem chi tiết đầy đủ) -->
          <td data-label="Số Phiếu">
            <a href="javascript:void(0)" class="fw-bold font-monospace text-primary text-decoration-underline" onclick="openVoucherDetail('NHAP', '${v.maPhieu}')">
              ${v.maPhieu}
            </a>
          </td>
          <td data-label="Ngày Nhập" class="text-center">${v.ngay}</td>
          <td data-label="Nhà Cung Cấp"><strong>${v.ncc}</strong></td>
          <!-- Cột Sản Phẩm & Model tóm tắt -->
          <td data-label="Sản Phẩm & Model">
            ${renderVoucherProductsSummary(v.items, 'NHAP', v.maPhieu)}
          </td>
          <td data-label="Kho Nhận" class="text-center">
            <span class="badge bg-light text-dark border">${v.kho || 'Kho VP'}</span>
          </td>
          <td data-label="Số Thiết Bị" class="text-center font-monospace fw-bold fs-6">${v.items ? v.items.length : 0}</td>
          <!-- Cột Trạng Thái dạng icon dấu tích / x, không dùng chữ -->
          <td data-label="Trạng Thái" class="text-center">${renderVoucherStatusIcon(effectiveStatus, v.ghiChu)}</td>
          <td data-label="Ghi Chú">
            <div class="small text-muted text-break">${v.ghiChu || '--'}</div>
            ${v.updatedAt ? `<div class="text-info small mt-1"><i class="fa-solid fa-pencil me-1"></i><strong>Sửa:</strong> ${v.updatedBy || ''} (${v.updatedAt})</div>` : ''}
            ${v.lyDoHuy ? `<div class="text-danger small mt-1"><i class="fa-solid fa-ban me-1"></i><strong>Hủy:</strong> ${v.lyDoHuy} (${v.nguoiHuy || ''} - ${v.ngayHuy || ''})</div>` : ''}
          </td>
          <td data-label="Hành Động" class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-info" onclick="openVoucherDetail('NHAP', '${v.maPhieu}')" title="Xem chi tiết phiếu">
              <i class="fa-solid fa-eye"></i>
            </button>
            ${effectiveStatus === 'CONFIRMED' ? `
              <!-- Nút Sửa phiếu nhập (Yêu cầu 3) -->
              <button class="btn btn-sm btn-outline-warning btn-action-edit-voucher" onclick="openEditVoucherModal('NHAP', '${v.maPhieu}')" title="Sửa phiếu nhập">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger btn-action-cancel-voucher" onclick="cancelImportVoucher('${v.maPhieu}')" title="Hủy phiếu nhập (Manager/Admin)">
                <i class="fa-solid fa-ban"></i>
              </button>
            ` : ''}
            ${effectiveStatus === 'DRAFT' ? `
              <!-- Nút Tiếp tục nhập và Xóa Draft -->
              <button class="btn btn-sm btn-outline-primary ms-1 btn-action-resume-draft" onclick="resumeImportDraft('${v.maPhieu}')" title="Tiếp tục nhập phiếu này">
                <i class="fa-solid fa-play me-1"></i> Tiếp tục nhập
              </button>
              <button class="btn btn-sm btn-outline-danger ms-1 btn-action-delete-draft" onclick="deleteDraftImportVoucher('${v.maPhieu}')" title="Xóa phiếu nháp này">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : ''}
          </td>
        </tr>
        ${renderVoucherSubRow('NHAP', v)}
      `;
    });
    tbody.innerHTML = html;
  }

  // BỘ LỌC LỊCH SỬ PHIẾU XUẤT (YÊU CẦU 8B & DATE RANGE)
  function setXuatPreset(preset) {
    if (preset === 'all') {
      resetXuatHistoryFilters();
      return;
    }

    const fromInput = document.getElementById('filter-xuat-from');
    const toInput = document.getElementById('filter-xuat-to');
    if (!fromInput || !toInput) return;

    const todayStr = getLocalDateStr();
    fromInput.value = '';
    toInput.value = '';

    if (preset === 'today') {
      fromInput.value = todayStr;
      toInput.value = todayStr;
    } else if (preset === '7days') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      fromInput.value = getLocalDateStr(d7);
      toInput.value = todayStr;
    } else if (preset === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      fromInput.value = getLocalDateStr(startOfMonth);
      toInput.value = todayStr;
    }
    applyXuatHistoryFilters();
  }

  function resetXuatHistoryFilters() {
    if (document.getElementById('filter-xuat-search')) document.getElementById('filter-xuat-search').value = '';
    if (document.getElementById('filter-xuat-khach')) document.getElementById('filter-xuat-khach').value = '';
    if (document.getElementById('filter-xuat-kho')) document.getElementById('filter-xuat-kho').value = '';
    if (document.getElementById('filter-xuat-status')) document.getElementById('filter-xuat-status').value = '';
    if (document.getElementById('filter-xuat-from')) document.getElementById('filter-xuat-from').value = '';
    if (document.getElementById('filter-xuat-to')) document.getElementById('filter-xuat-to').value = '';
    renderHistoryXuatTable();
  }

  function applyXuatHistoryFilters() {
    const filterFrom = document.getElementById('filter-xuat-from')?.value || '';
    const filterTo = document.getElementById('filter-xuat-to')?.value || '';
    if (filterFrom && filterTo && filterFrom > filterTo) {
      Swal.fire('Thời gian không hợp lệ', 'Từ ngày xuất không được lớn hơn Đến ngày!', 'warning');
      return;
    }
    renderHistoryXuatTable();
  }

  // Render bảng lịch sử Xuất kho với bộ lọc đầy đủ
  function renderHistoryXuatTable() {
    const tbody = document.getElementById('history-xuat-table-body');
    if (!tbody) return;
    HISTORY_SUBTAB_STATE.xuat.rendered = true;
    HISTORY_SUBTAB_STATE.xuat.dirty = false;

    const filterSearch = (document.getElementById('filter-xuat-search')?.value || '').trim().toLowerCase();
    const filterKhach = document.getElementById('filter-xuat-khach')?.value || '';
    const filterKho = document.getElementById('filter-xuat-kho')?.value || '';
    const filterStatus = document.getElementById('filter-xuat-status')?.value || '';
    const filterFrom = document.getElementById('filter-xuat-from')?.value || '';
    const filterTo = document.getElementById('filter-xuat-to')?.value || '';

    let list = [...(VOUCHERS_DB.xuat || [])];
    list.sort(sortVouchersNewestFirst);

    // 1. Trạng thái
    if (filterStatus) list = list.filter(v => v.status === filterStatus);
    // 2. Khách hàng
    if (filterKhach) list = list.filter(v => (v.khachHang || '').toLowerCase().includes(filterKhach.toLowerCase()));
    // 3. Kho
    if (filterKho) list = list.filter(v => v.kho === filterKho);

    // 4. Từ ngày -> Đến ngày (theo ngày xuất v.ngay: DD/MM/YYYY)
    if (filterFrom) {
      const fromD = new Date(filterFrom);
      list = list.filter(v => {
        if (!v.ngay) return false;
        const parts = v.ngay.split('/');
        if (parts.length !== 3) return false;
        const vD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return vD >= fromD;
      });
    }

    if (filterTo) {
      const toD = new Date(filterTo);
      toD.setHours(23, 59, 59);
      list = list.filter(v => {
        if (!v.ngay) return false;
        const parts = v.ngay.split('/');
        if (parts.length !== 3) return false;
        const vD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return vD <= toD;
      });
    }

    // 5. Search mã phiếu / Serial / Model / SĐT
    if (filterSearch) {
      list = list.filter(v => {
        const inCode = v.maPhieu && v.maPhieu.toLowerCase().includes(filterSearch);
        const inKhach = v.khachHang && v.khachHang.toLowerCase().includes(filterSearch);
        const inSdt = v.sdtKhach && v.sdtKhach.includes(filterSearch);
        const inDiaChi = v.diaChi && v.diaChi.toLowerCase().includes(filterSearch);
        const inNote = v.ghiChu && v.ghiChu.toLowerCase().includes(filterSearch);
        const inItems = (v.items || []).some(it => 
          (it.serial && it.serial.toLowerCase().includes(filterSearch)) ||
          (it.internalId && it.internalId.toLowerCase().includes(filterSearch)) ||
          (it.model && it.model.toLowerCase().includes(filterSearch))
        );
        return inCode || inKhach || inSdt || inDiaChi || inNote || inItems;
      });
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Không tìm thấy phiếu xuất nào phù hợp bộ lọc</td></tr>';
      return;
    }

    let html = '';
    list.forEach(v => {
      const isCancelled = v.status === 'CANCELLED' || (v.ghiChu && (v.ghiChu.includes('[CANCELLED:') || v.ghiChu.toUpperCase().includes('CANCELLED')));
      const effectiveStatus = isCancelled ? 'CANCELLED' : (v.status || 'CONFIRMED');
      const custInfo = formatCustomerDisplayName(v.khachHang, v.sdtKhach);

      html += `
        <tr id="voucher-row-XUAT-${v.maPhieu}">
          <!-- Nút Accordion mở chi tiết Serial nhanh -->
          <td class="text-center p-1" data-label="Mở">
            <button class="btn btn-xs btn-light border rounded-circle p-0 d-inline-flex align-items-center justify-content-center" 
                    id="btn-toggle-XUAT-${v.maPhieu}" 
                    onclick="toggleVoucherAccordion('XUAT', '${v.maPhieu}')" 
                    style="width: 24px; height: 24px;" 
                    title="Xem nhanh danh sách Serial">
              <i class="fa-solid fa-chevron-down text-secondary" style="font-size: 0.7rem;"></i>
            </button>
          </td>
          <!-- Số phiếu (Click xem chi tiết đầy đủ) -->
          <td data-label="Số Phiếu">
            <a href="javascript:void(0)" class="fw-bold font-monospace text-primary text-decoration-underline" onclick="openVoucherDetail('XUAT', '${v.maPhieu}')">
              ${v.maPhieu}
            </a>
          </td>
          <td data-label="Ngày Xuất" class="text-center">${v.ngay}</td>
          <td data-label="Khách Hàng">
            <strong>${custInfo.name}</strong>
            ${custInfo.phone ? `<div class="small font-monospace text-muted"><i class="fa-solid fa-phone me-1"></i>${custInfo.phone}</div>` : ''}
          </td>
          <!-- Cột Sản Phẩm & Model tóm tắt -->
          <td data-label="Sản Phẩm & Model">
            ${renderVoucherProductsSummary(v.items, 'XUAT', v.maPhieu)}
          </td>
          <td data-label="Kho Xuất" class="text-center">
            <span class="badge bg-light text-dark border">${v.kho || 'Kho VP'}</span>
          </td>
          <td data-label="Số Thiết Bị" class="text-center font-monospace fw-bold fs-6">${v.items ? v.items.length : 0}</td>
          <!-- Cột Trạng Thái dạng icon dấu tích / x, không dùng chữ -->
          <td data-label="Trạng Thái" class="text-center">${renderVoucherStatusIcon(effectiveStatus, v.ghiChu)}</td>
          <td data-label="Ghi Chú">
            <div class="small text-muted text-break">${v.ghiChu || '--'}</div>
            ${v.updatedAt ? `<div class="text-info small mt-1"><i class="fa-solid fa-pencil me-1"></i><strong>Sửa:</strong> ${v.updatedBy || ''} (${v.updatedAt})</div>` : ''}
            ${v.lyDoHuy ? `<div class="text-danger small mt-1"><i class="fa-solid fa-ban me-1"></i><strong>Hủy:</strong> ${v.lyDoHuy} (${v.nguoiHuy || ''} - ${v.ngayHuy || ''})</div>` : ''}
          </td>
          <td data-label="Hành Động" class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-info" onclick="openVoucherDetail('XUAT', '${v.maPhieu}')" title="Xem chi tiết phiếu">
              <i class="fa-solid fa-eye"></i>
            </button>
            ${effectiveStatus === 'CONFIRMED' ? `
              <!-- Nút Sửa phiếu xuất (Yêu cầu 3) -->
              <button class="btn btn-sm btn-outline-warning btn-action-edit-voucher" onclick="openEditVoucherModal('XUAT', '${v.maPhieu}')" title="Sửa phiếu xuất">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger btn-action-cancel-voucher" onclick="cancelExportVoucher('${v.maPhieu}')" title="Hủy phiếu xuất">
                <i class="fa-solid fa-ban"></i>
              </button>
            ` : ''}
            ${effectiveStatus === 'DRAFT' ? `
              <!-- Nút Tiếp tục xuất và Xóa Draft -->
              <button class="btn btn-sm btn-outline-primary ms-1 btn-action-resume-draft" onclick="resumeExportDraft('${v.maPhieu}')" title="Tiếp tục xuất phiếu này">
                <i class="fa-solid fa-play me-1"></i> Tiếp tục xuất
              </button>
              <button class="btn btn-sm btn-outline-danger ms-1 btn-action-delete-draft" onclick="deleteDraftExportVoucher('${v.maPhieu}')" title="Xóa phiếu nháp này">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : ''}
          </td>
        </tr>
        ${renderVoucherSubRow('XUAT', v)}
      `;
    });
    tbody.innerHTML = html;
  }

  // NÂNG CẤP HỒ SƠ CHI TIẾT PHIẾU HIỆN TẠI (YÊU CẦU 2 & 7.3)
  function openVoucherDetail(type, maPhieu) {
    const isNhap = type === 'NHAP';
    const v = isNhap ? VOUCHERS_DB.nhap.find(x => x.maPhieu === maPhieu) : VOUCHERS_DB.xuat.find(x => x.maPhieu === maPhieu);
    if (!v) return;

    document.getElementById('view-voucher-title').innerHTML = `
      Chi Tiết Phiếu ${isNhap ? 'Nhập Kho' : 'Xuất Kho'}: 
      <strong class="text-primary font-monospace">${v.maPhieu}</strong>
      <span class="badge ${v.status === 'CONFIRMED' ? 'bg-success' : (v.status === 'CANCELLED' ? 'bg-danger' : 'bg-secondary')} ms-2">${v.status}</span>
    `;

    // Tiêu đề & Thông tin bổ sung (Thời gian tạo, người sửa gần nhất, thời gian sửa)
    const headerBox = document.getElementById('view-voucher-header-info');
    const nguoiLap = v.nguoiTao || v.nguoiXuat || v.user || (typeof CURRENT_USER_NAME !== 'undefined' && CURRENT_USER_NAME ? CURRENT_USER_NAME : 'Thủ Kho');
    const khoGiaoDich = v.kho || (v.items && v.items[0] && v.items[0].kho) || 'Kho VP';
    let custName = v.khachHang || (isNhap ? (v.ncc || 'Chính hãng') : 'Khách lẻ');
    let custPhone = v.sdtKhach || v.sdt || '';
    let custAddress = v.diaChi || '';

    // Tìm kiếm thêm thông tin khách hàng nếu chưa có đủ
    if (!isNhap) {
      const foundCust = (typeof INITIAL_CUSTOMERS !== 'undefined' ? INITIAL_CUSTOMERS : []).find(c => 
        (c.ten && (c.ten.toLowerCase() === custName.toLowerCase() || custName.toLowerCase().includes(c.ten.toLowerCase()))) ||
        (c.name && (c.name.toLowerCase() === custName.toLowerCase() || custName.toLowerCase().includes(c.name.toLowerCase())))
      );
      if (foundCust) {
        if (!custPhone && (foundCust.sdt || foundCust.phone)) custPhone = foundCust.sdt || foundCust.phone;
        if (!custAddress && (foundCust.diaChi || foundCust.address)) custAddress = foundCust.diaChi || foundCust.address;
      }
      if (!custPhone) {
        const m = custName.match(/(\d{9,11})/);
        if (m) custPhone = m[1];
      }
    }

    headerBox.innerHTML = `
      <div class="row g-2">
        <div class="col-6 col-md-3"><strong>Ngày lập phiếu:</strong> ${v.ngay || v.ngayXuat || v.ngayNhap || '--'}</div>
        <div class="col-6 col-md-3"><strong>Thời gian tạo:</strong> ${v.createdAt || v.ngay || '--'}</div>
        <div class="col-6 col-md-3"><strong>Người lập:</strong> ${nguoiLap}</div>
        <div class="col-6 col-md-3"><strong>${isNhap ? 'Kho nhập:' : 'Kho xuất:'}</strong> <span class="badge bg-light text-primary border">${khoGiaoDich}</span></div>
        <div class="col-12 col-md-6">
          <strong>${isNhap ? 'Nhà cung cấp:' : 'Khách hàng:'}</strong> 
          ${isNhap ? `<strong>${v.ncc || 'Chính hãng'}</strong>` : `<strong>${custName}</strong> ${custPhone ? `(SĐT: <span class="font-monospace text-primary fw-bold">${custPhone}</span>)` : ''}`}
        </div>
        ${!isNhap ? `<div class="col-12 col-md-6"><strong>Địa chỉ giao nhận:</strong> ${custAddress || 'Nhận tại văn phòng Thành An'}</div>` : ''}
        ${v.giayTo ? `<div class="col-12"><strong class="text-primary"><i class="fa-solid fa-file-invoice me-1"></i>Giấy tờ kèm theo:</strong> <span class="badge bg-warning text-dark border me-1">${v.giayTo}</span> ${v.ghiChuGiayTo ? `<span class="small text-secondary fst-italic">(${v.ghiChuGiayTo})</span>` : ''}</div>` : ''}
        <div class="col-12"><strong>Ghi chú:</strong> ${v.ghiChu || '--'}</div>
        ${v.updatedAt ? `
          <div class="col-12 p-2 bg-info-subtle text-dark rounded border border-info">
            <i class="fa-solid fa-pen-nib me-1"></i> <strong>Sửa gần nhất:</strong> bởi <strong>${v.updatedBy || nguoiLap}</strong> lúc <strong>${v.updatedAt}</strong>
          </div>
        ` : ''}
        ${v.lyDoHuy ? `
          <div class="col-12 p-2 bg-danger-subtle text-danger rounded border border-danger">
            <i class="fa-solid fa-ban me-1"></i> <strong>THÔNG TIN HỦY PHIẾU:</strong> 
            Người hủy: <strong>${v.nguoiHuy}</strong> lúc <strong>${v.ngayHuy}</strong>. 
            Lý do: <em>${v.lyDoHuy}</em>
          </div>
        ` : ''}
      </div>
    `;

    // Tab 1: Danh sách thiết bị (Hiển thị đầy đủ Model, Tên thiết bị, Nhóm hàng, Kho xuất, Hạn BH như bản chuẩn)
    const tbody = document.getElementById('view-voucher-items-body');
    let html = '';
    (v.items || []).forEach((it, idx) => {
      const snClean = String(it.serial || '').trim().toUpperCase();
      const curDb = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => 
        String(s.serial || '').trim().toUpperCase() === snClean
      ) || {};

      const modelVal = it.model || curDb.model || '--';
      const prodInfo = (typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []).find(p => 
        p.model && modelVal && p.model.toLowerCase() === modelVal.toLowerCase()
      ) || {};

      const nameVal = it.name || it.tenHang || curDb.name || curDb.tenHang || prodInfo.name || prodInfo.ten || modelVal;
      const catVal = it.category || it.nhomHang || it.nhom || curDb.category || curDb.nhomHang || curDb.nhom || prodInfo.category || prodInfo.nhomHang || prodInfo.nhom || 'Khác';
      const internalIdVal = it.internalId || curDb.internalId || curDb.maNoiBo || snClean;
      const curLocation = it.kho || curDb.kho || curDb.warehouse || v.kho || 'Kho VP';
      const curStatus = curDb.status || (isNhap ? 'IN_STOCK' : 'SOLD');
      const expDateVal = it.ngayHetHanBh || curDb.ngayHetHanBh || '--';
      const warrantyMonthsVal = it.soThangBh || curDb.soThangBh || curDb.warrantyMonths || prodInfo.defaultBh || 12;

      // Kiểm tra nghiệp vụ sau phiếu (Yêu cầu 2)
      let postActivities = [];
      if (isNhap) {
        if (curDb && curDb.status === 'SOLD') postActivities.push(`Đã xuất bán cho ${curDb.khachHang || 'Khách'} (PX: ${curDb.maPhieuXuat || '--'})`);
        if (curDb && curDb.status === 'IN_WARRANTY') postActivities.push('Đang trong quy trình bảo hành');
        if (curDb && curDb.kho && curDb.kho !== curLocation) postActivities.push(`Đã chuyển sang kho [${curDb.kho}]`);
      } else {
        const relatedCase = (typeof WARRANTY_CASES_DB !== 'undefined' ? WARRANTY_CASES_DB : []).find(c => 
          c.serial && snClean && c.serial.toLowerCase() === snClean.toLowerCase()
        );
        if (relatedCase) {
          postActivities.push(`Có Ca Bảo Hành <strong>${relatedCase.caseId}</strong> (${relatedCase.status})`);
        }
      }

      html += `
        <tr>
          <td class="text-center fw-bold">${idx + 1}</td>
          <!-- Serial clickable mở Serial 360 -->
          <td>
            <a href="javascript:void(0)" class="font-monospace fw-bold text-danger text-decoration-underline" onclick="closeVoucherAndOpen360('${snClean}')" title="Bấm để xem hồ sơ lý lịch Serial 360°">
              <i class="fa-solid fa-fingerprint me-1"></i>${snClean}
            </a>
          </td>
          <td class="fw-bold text-primary">${modelVal}</td>
          <td>${nameVal}</td>
          <td><span class="badge bg-secondary-subtle text-dark border">${catVal}</span></td>
          <td><span class="badge bg-light text-secondary font-monospace border">${internalIdVal}</span></td>
          <td><span class="badge bg-light text-dark border"><i class="fa-solid fa-location-dot me-1 text-danger"></i>${curLocation}</span></td>
          <td>
            <span class="text-success fw-bold">${expDateVal}</span> 
            ${warrantyMonthsVal ? `<small class="text-muted">(${warrantyMonthsVal}T)</small>` : ''}
          </td>
          <td>
            <span class="badge-status ${getBadgeClass(curStatus)} mb-1">${curStatus}</span>
            ${postActivities.length > 0 ? `<div class="small text-info mt-1">• ${postActivities.join('<br>• ')}</div>` : '<div class="small text-muted">Chưa phát sinh thêm</div>'}
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

    // Tab 2: Lịch Sử Thay Đổi (Audit log liên quan phiếu này - Yêu cầu 2 & 7.3)
    const histBody = document.getElementById('view-voucher-history-body');
    const voucherAuditLogs = AUDIT_LOG_DB.filter(a => 
      (a.voucherCode && a.voucherCode === v.maPhieu) || 
      (a.target && a.target.includes(v.maPhieu))
    );

    if (voucherAuditLogs.length === 0 && (!v.history || v.history.length === 0)) {
      histBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Chưa có bản ghi thay đổi nào cho phiếu này</td></tr>';
    } else {
      let hHtml = '';
      voucherAuditLogs.forEach(log => {
        let changesDetail = '--';
        if (log.changes && log.changes.length > 0) {
          changesDetail = log.changes.map(c => `<div><strong>${c.field}:</strong> <span class="text-muted">${c.oldVal}</span> <i class="fa-solid fa-arrow-right-long text-primary mx-1"></i> <span class="text-success fw-bold">${c.newVal}</span></div>`).join('');
        }
        hHtml += `
          <tr>
            <td class="font-monospace">${log.time}</td>
            <td><strong>${log.user}</strong> <span class="badge bg-light text-dark border">${log.role}</span></td>
            <td><strong class="text-primary">${log.action}</strong></td>
            <td>${changesDetail}</td>
            <td><small>${log.reason}</small></td>
          </tr>
        `;
      });

      // Nếu có v.history
      if (v.history) {
        v.history.forEach(h => {
          if (!voucherAuditLogs.some(a => a.time === h.time)) {
            hHtml += `
              <tr>
                <td class="font-monospace">${h.time}</td>
                <td><strong>${h.user}</strong></td>
                <td><strong class="text-secondary">${h.action}</strong></td>
                <td>${h.note}</td>
                <td>--</td>
              </tr>
            `;
          }
        });
      }

      histBody.innerHTML = hHtml;
    }

    // Nút chân modal: Cho phép sửa phiếu nếu có quyền
    const footerLeft = document.getElementById('view-voucher-footer-left');
    if (v.status === 'CONFIRMED' && hasPermission('Voucher.Edit')) {
      footerLeft.innerHTML = `
        <button class="btn btn-sm btn-outline-warning fw-bold" onclick="closeVoucherAndOpenEdit('${type}', '${v.maPhieu}')">
          <i class="fa-solid fa-pen-to-square me-1"></i> Sửa Thông Tin Phiếu Này
        </button>
      `;
    } else {
      footerLeft.innerHTML = '';
    }

    // Mặc định chọn tab danh sách thiết bị
    const tabTrigger = new bootstrap.Tab(document.getElementById('tab-voucher-items-btn'));
    tabTrigger.show();

    const modal = new bootstrap.Modal(document.getElementById('viewVoucherModal'));
    modal.show();
  }

  function closeVoucherAndOpen360(serial) {
    const modalEl = document.getElementById('viewVoucherModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    switchTab('Serial360');
    lookupSerial360(serial);
  }

  function closeVoucherAndOpenEdit(type, maPhieu) {
    const modalEl = document.getElementById('viewVoucherModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    openEditVoucherModal(type, maPhieu);
  }

  /* ==================================================== */
  /* BỔ SUNG NGHIỆP VỤ SỬA PHIẾU FULL TRƯỜNG (YÊU CẦU 3)  */
  /* ==================================================== */
  let EDIT_VOUCHER_TEMP_ITEMS = [];

  function toInputDateFormat(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const parts = str.split('/');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2].length === 4 ? parts[2] : ('20' + parts[2]);
      return `${y}-${m}-${d}`;
    }
    return '';
  }

  function fromInputDateFormat(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    if (str.includes('/')) return str;
    const parts = str.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
  }

  function openEditVoucherModal(type, maPhieu) {
    if (!checkPermission('Voucher.Edit', 'Sửa thông tin phiếu')) return;

    const isNhap = type === 'NHAP';
    const v = isNhap ? VOUCHERS_DB.nhap.find(x => x.maPhieu === maPhieu) : VOUCHERS_DB.xuat.find(x => x.maPhieu === maPhieu);
    if (!v) return;

    if (v.status !== 'CONFIRMED') {
      Swal.fire('Không thể sửa', `Phiếu này đang ở trạng thái ${v.status}, chỉ phiếu CONFIRMED mới áp dụng quy trình sửa có Audit!`, 'info');
      return;
    }

    document.getElementById('edit-voucher-type').value = type;
    document.getElementById('edit-voucher-code').value = maPhieu;
    document.getElementById('edit-voucher-code-label').textContent = maPhieu;
    document.getElementById('edit-voucher-status-label').textContent = v.status;
    document.getElementById('edit-voucher-reason').value = '';

    const container = document.getElementById('edit-voucher-fields-container');
    const alertDep = document.getElementById('edit-voucher-dependency-alert');
    if (alertDep) alertDep.style.display = 'none';

    // Clone danh sách items để người dùng sửa đổi trực tiếp
    EDIT_VOUCHER_TEMP_ITEMS = JSON.parse(JSON.stringify(v.items || []));

    // Cập nhật tiêu đề cột đặc thù trên bảng thiết bị
    const colSpec1 = document.getElementById('edit-col-spec-1');
    const colSpec2 = document.getElementById('edit-col-spec-2');
    if (isNhap) {
      if (colSpec1) colSpec1.textContent = 'Loại Hàng';
      if (colSpec2) colSpec2.textContent = 'Kho Nhận';
    } else {
      if (colSpec1) colSpec1.textContent = 'Gói Bảo Hành';
      if (colSpec2) colSpec2.textContent = 'Hạn Bảo Hành';
    }

    if (isNhap) {
      // 1. PHIẾU NHẬP: FULL TRƯỜNG HEADER (Ngày, NCC, Kho, Loại hàng, Ghi chú)
      let suppOptions = '<option value="">-- Chọn Nhà Cung Cấp --</option>';
      let hasCurrentNcc = false;
      if (typeof INITIAL_SUPPLIERS !== 'undefined') {
        INITIAL_SUPPLIERS.filter(s => s.active !== false).forEach(s => {
          const isSel = (v.ncc === s.tenTat || v.ncc === s.tenDayDu);
          if (isSel) hasCurrentNcc = true;
          suppOptions += `<option value="${s.tenTat}" ${isSel ? 'selected' : ''}>${s.tenTat} - ${s.tenDayDu}</option>`;
        });
      }
      if (v.ncc && !hasCurrentNcc) {
        suppOptions += `<option value="${v.ncc}" selected>${v.ncc} (Hiện tại)</option>`;
      }

      let khoOptions = '';
      const khoList = (typeof INITIAL_WAREHOUSES !== 'undefined' && INITIAL_WAREHOUSES.length > 0)
        ? INITIAL_WAREHOUSES.map(k => k.tenKho || k.name || k.val)
        : (v.kho ? [v.kho] : []);
      khoList.forEach(k => {
        khoOptions += `<option value="${k}" ${v.kho === k ? 'selected' : ''}>${k}</option>`;
      });

      let loaiOptions = '';
      const curLoai = v.loaiHang || (v.items && v.items[0] && v.items[0].loaiHang) || '';
      const loaiList = (typeof INITIAL_CONDITIONS !== 'undefined' && INITIAL_CONDITIONS.length > 0)
        ? INITIAL_CONDITIONS.map(c => c.ten || c.name || c.val)
        : (curLoai ? [curLoai] : []);
      loaiList.forEach(l => {
        loaiOptions += `<option value="${l}" ${curLoai === l ? 'selected' : ''}>${l}</option>`;
      });

      container.innerHTML = `
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Ngày Nhập Kho (*)</label>
          <input type="date" id="edit-nhap-ngay" class="form-control form-control-sm font-monospace" value="${toInputDateFormat(v.ngay)}">
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Nhà Cung Cấp (*)</label>
          <select id="edit-nhap-ncc" class="form-select form-select-sm">
            ${suppOptions}
          </select>
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Kho Nhận Hàng (*)</label>
          <select id="edit-nhap-kho" class="form-select form-select-sm">
            ${khoOptions}
          </select>
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Loại Hàng Quy Chuẩn (*)</label>
          <select id="edit-nhap-loaihang" class="form-select form-select-sm">
            ${loaiOptions}
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-muted mb-1">Số Hóa Đơn / Phiếu NCC</label>
          <input type="text" id="edit-nhap-sohoadon" class="form-control form-control-sm font-monospace" value="${v.soHoaDonNcc || ''}" placeholder="HD-NCC-12345...">
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-muted mb-1">Người Giao Hàng NCC</label>
          <input type="text" id="edit-nhap-nguoigiao" class="form-control form-control-sm" value="${v.nguoiGiaoNcc || ''}" placeholder="Tên anh/chị giao hàng...">
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-muted mb-1">Thủ Kho Nhận Hàng</label>
          <input type="text" id="edit-nhap-nguoinhan" class="form-control form-control-sm" value="${v.nguoiNhan || CURRENT_USER_NAME || ''}">
        </div>
        <div class="col-12">
          <label class="form-label small fw-semibold text-muted mb-1">Ghi Chú Phiếu Nhập</label>
          <input type="text" id="edit-nhap-ghichu" class="form-control form-control-sm" value="${v.ghiChu || ''}">
        </div>
      `;
    } else {
      // 2. PHIẾU XUẤT: FULL TRƯỜNG HEADER (Ngày, Khách, SĐT, Người LH, Email, MST, Địa chỉ, Kho, Chứng từ, Ghi chú)
      let custOptions = '<option value="">-- Chọn Khách Hàng --</option>';
      let hasCurrentCust = false;
      if (typeof INITIAL_CUSTOMERS !== 'undefined') {
        INITIAL_CUSTOMERS.filter(c => c.active !== false).forEach(c => {
          const isSel = (v.khachHang === c.ten || v.khachHang === c.name);
          if (isSel) hasCurrentCust = true;
          custOptions += `<option value="${c.ten || c.name}" ${isSel ? 'selected' : ''}>${c.ten || c.name} (${c.phone || c.sdt || ''})</option>`;
        });
      }
      if (v.khachHang && !hasCurrentCust) {
        custOptions += `<option value="${v.khachHang}" selected>${v.khachHang} (Hiện tại)</option>`;
      }

      let khoOptions = '';
      const khoList = (typeof INITIAL_WAREHOUSES !== 'undefined' && INITIAL_WAREHOUSES.length > 0)
        ? INITIAL_WAREHOUSES.map(k => k.tenKho || k.name || k.val)
        : (v.kho ? [v.kho] : []);
      khoList.forEach(k => {
        khoOptions += `<option value="${k}" ${v.kho === k ? 'selected' : ''}>${k}</option>`;
      });

      const docs = Array.isArray(v.chungTuKemTheo) ? v.chungTuKemTheo : (Array.isArray(v.giayToKemTheo) ? v.giayToKemTheo : []);
      const hasVat = docs.includes('Hóa đơn VAT');
      const hasBbbg = docs.includes('Biên bản bàn giao');
      const hasPbh = docs.includes('Phiếu bảo hành');
      const hasCocq = docs.includes('CO/CQ');

      container.innerHTML = `
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Ngày Xuất Kho (*)</label>
          <input type="date" id="edit-xuat-ngay" class="form-control form-control-sm font-monospace" value="${toInputDateFormat(v.ngay)}">
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Khách Hàng (*)</label>
          <select id="edit-xuat-khach" class="form-select form-select-sm">
            ${custOptions}
          </select>
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Số Điện Thoại (*)</label>
          <input type="text" id="edit-xuat-sdt" class="form-control form-control-sm font-monospace" value="${v.sdtKhach || ''}">
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label small fw-semibold text-muted mb-1">Kho Xuất Hàng (*)</label>
          <select id="edit-xuat-kho" class="form-select form-select-sm">
            ${khoOptions}
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-muted mb-1">Người Liên Hệ Nhận Máy</label>
          <input type="text" id="edit-xuat-nguoilienhe" class="form-control form-control-sm" value="${v.nguoiLienHe || ''}" placeholder="Anh/Chị phụ trách nhận thiết bị...">
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-muted mb-1">Email Khách Hàng</label>
          <input type="email" id="edit-xuat-email" class="form-control form-control-sm" value="${v.emailKhach || v.email || ''}" placeholder="email@congty.com">
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-muted mb-1">Mã Số Thuế</label>
          <input type="text" id="edit-xuat-mst" class="form-control form-control-sm font-monospace" value="${v.mstKhach || v.mst || ''}" placeholder="Mã số thuế...">
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small fw-semibold text-muted mb-1">Địa Chỉ Giao Nhận</label>
          <input type="text" id="edit-xuat-diachi" class="form-control form-control-sm" value="${v.diaChi || v.diaChiGiao || ''}">
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small fw-semibold text-muted mb-1">Ghi Chú Xuất Kho</label>
          <input type="text" id="edit-xuat-ghichu" class="form-control form-control-sm" value="${v.ghiChu || ''}">
        </div>
        <div class="col-12">
          <label class="form-label small fw-semibold text-muted mb-1">Chứng Từ Bàn Giao Đi Kèm:</label>
          <div class="d-flex flex-wrap gap-3 p-2 bg-light rounded border small">
            <div class="form-check form-check-inline mb-0">
              <input class="form-check-input" type="checkbox" id="edit-xuat-ct-vat" ${hasVat ? 'checked' : ''} value="Hóa đơn VAT">
              <label class="form-check-label fw-semibold" for="edit-xuat-ct-vat">Hóa đơn VAT</label>
            </div>
            <div class="form-check form-check-inline mb-0">
              <input class="form-check-input" type="checkbox" id="edit-xuat-ct-bbbg" ${hasBbbg ? 'checked' : ''} value="Biên bản bàn giao">
              <label class="form-check-label fw-semibold" for="edit-xuat-ct-bbbg">Biên bản bàn giao</label>
            </div>
            <div class="form-check form-check-inline mb-0">
              <input class="form-check-input" type="checkbox" id="edit-xuat-ct-pbh" ${hasPbh ? 'checked' : ''} value="Phiếu bảo hành">
              <label class="form-check-label fw-semibold" for="edit-xuat-ct-pbh">Phiếu bảo hành</label>
            </div>
            <div class="form-check form-check-inline mb-0">
              <input class="form-check-input" type="checkbox" id="edit-xuat-ct-cocq" ${hasCocq ? 'checked' : ''} value="CO/CQ">
              <label class="form-check-label fw-semibold" for="edit-xuat-ct-cocq">CO/CQ</label>
            </div>
          </div>
        </div>
      `;
    }

    // Render bảng thiết bị có thể sửa trực tiếp
    renderEditVoucherItemsTable(type);

    const modal = new bootstrap.Modal(document.getElementById('editVoucherModal'));
    modal.show();
  }

  // Render bảng thiết bị trong modal sửa phiếu
  function renderEditVoucherItemsTable(type) {
    const tbody = document.getElementById('edit-voucher-items-tbody');
    if (!tbody) return;

    const isNhap = type === 'NHAP';
    const loaiList = (typeof INITIAL_CONDITIONS !== 'undefined' && INITIAL_CONDITIONS.length > 0)
      ? INITIAL_CONDITIONS.map(c => c.ten || c.name || c.val)
      : [];

    const khoList = (typeof INITIAL_WAREHOUSES !== 'undefined' && INITIAL_WAREHOUSES.length > 0)
      ? INITIAL_WAREHOUSES.map(k => k.tenKho || k.name || k.val)
      : [];

    if (EDIT_VOUCHER_TEMP_ITEMS.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Chưa có thiết bị nào trong phiếu. Bấm "+ Thêm thiết bị" để bổ sung.</td></tr>`;
      return;
    }

    tbody.innerHTML = EDIT_VOUCHER_TEMP_ITEMS.map((it, idx) => {
      let specCol1Html = '';
      let specCol2Html = '';

      if (isNhap) {
        // Cột Loại hàng
        const curLoai = it.loaiHang || it.condition || 'Chính Hãng';
        let loaiOpts = loaiList.map(l => `<option value="${l}" ${curLoai === l ? 'selected' : ''}>${l}</option>`).join('');
        specCol1Html = `<select class="form-select form-select-sm edit-item-loaihang" data-idx="${idx}">${loaiOpts}</select>`;

        // Cột Kho nhận
        const curKho = it.kho || 'Kho VP';
        let khoOpts = khoList.map(k => `<option value="${k}" ${curKho === k ? 'selected' : ''}>${k}</option>`).join('');
        specCol2Html = `<select class="form-select form-select-sm edit-item-kho" data-idx="${idx}">${khoOpts}</select>`;
      } else {
        // Cột Gói bảo hành
        const curBh = (typeof it.soThangBh !== 'undefined') ? it.soThangBh : 12;
        const bhOpts = [0, 1, 3, 6, 12, 24, 36].map(m => `<option value="${m}" ${curBh === m ? 'selected' : ''}>${m} tháng</option>`).join('');
        specCol1Html = `<select class="form-select form-select-sm edit-item-warranty-select" data-idx="${idx}" data-serial="${it.serial || ''}">${bhOpts}</select>`;

        // Cột Hạn bảo hành
        const curExp = toInputDateFormat(it.ngayHetHanBh);
        specCol2Html = `<input type="date" class="form-control form-control-sm font-monospace edit-item-exp" data-idx="${idx}" value="${curExp}">`;
      }

      return `
        <tr>
          <td class="text-center text-muted fw-bold">${idx + 1}</td>
          <td>
            <input type="text" class="form-control form-control-sm edit-item-model" data-idx="${idx}" value="${it.model || ''}" placeholder="Model thiết bị">
          </td>
          <td>
            <input type="text" class="form-control form-control-sm font-monospace fw-bold text-primary edit-item-serial ${!isNhap ? 'bg-light text-muted' : ''}" data-idx="${idx}" value="${it.serial || ''}" placeholder="Serial hãng (*)" ${!isNhap ? 'readonly disabled title="Số Serial ở phiếu xuất không được phép chỉnh sửa"' : ''}>
          </td>
          <td>
            <input type="text" class="form-control form-control-sm font-monospace edit-item-internal" data-idx="${idx}" value="${it.internalId || it.maNoiBo || ''}" placeholder="Mã nội bộ">
          </td>
          <td>${specCol1Html}</td>
          <td>${specCol2Html}</td>
          <td class="text-center">
            <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="removeEditVoucherItem(${idx})" title="Xóa thiết bị khỏi phiếu">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Thêm dòng thiết bị mới vào phiếu đang sửa
  function addNewItemToEditVoucher() {
    syncEditVoucherDomToTempItems();
    const type = document.getElementById('edit-voucher-type').value;
    const isNhap = type === 'NHAP';
    const defKho = isNhap ? (document.getElementById('edit-nhap-kho')?.value || 'Kho VP') : (document.getElementById('edit-xuat-kho')?.value || 'Kho VP');
    const defLoai = isNhap ? (document.getElementById('edit-nhap-loaihang')?.value || 'Chính Hãng') : 'Mới 100%';

    EDIT_VOUCHER_TEMP_ITEMS.push({
      model: 'HP Laser 108A',
      serial: '',
      internalId: '',
      loaiHang: defLoai,
      kho: defKho,
      soThangBh: 12,
      ngayHetHanBh: ''
    });

    renderEditVoucherItemsTable(type);
  }

  // Xóa thiết bị khỏi phiếu đang sửa
  function removeEditVoucherItem(idx) {
    syncEditVoucherDomToTempItems();
    const type = document.getElementById('edit-voucher-type').value;
    if (idx >= 0 && idx < EDIT_VOUCHER_TEMP_ITEMS.length) {
      EDIT_VOUCHER_TEMP_ITEMS.splice(idx, 1);
      renderEditVoucherItemsTable(type);
    }
  }

  // Đồng bộ các ô input trong bảng vào mảng tạm
  function syncEditVoucherDomToTempItems() {
    const type = document.getElementById('edit-voucher-type').value;
    const isNhap = type === 'NHAP';

    document.querySelectorAll('.edit-item-model').forEach(inp => {
      const idx = parseInt(inp.getAttribute('data-idx'));
      if (EDIT_VOUCHER_TEMP_ITEMS[idx]) EDIT_VOUCHER_TEMP_ITEMS[idx].model = inp.value.trim();
    });
    document.querySelectorAll('.edit-item-serial').forEach(inp => {
      const idx = parseInt(inp.getAttribute('data-idx'));
      if (EDIT_VOUCHER_TEMP_ITEMS[idx]) EDIT_VOUCHER_TEMP_ITEMS[idx].serial = inp.value.trim();
    });
    document.querySelectorAll('.edit-item-internal').forEach(inp => {
      const idx = parseInt(inp.getAttribute('data-idx'));
      if (EDIT_VOUCHER_TEMP_ITEMS[idx]) {
        EDIT_VOUCHER_TEMP_ITEMS[idx].internalId = inp.value.trim();
        EDIT_VOUCHER_TEMP_ITEMS[idx].maNoiBo = inp.value.trim();
      }
    });

    if (isNhap) {
      document.querySelectorAll('.edit-item-loaihang').forEach(inp => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        if (EDIT_VOUCHER_TEMP_ITEMS[idx]) EDIT_VOUCHER_TEMP_ITEMS[idx].loaiHang = inp.value;
      });
      document.querySelectorAll('.edit-item-kho').forEach(inp => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        if (EDIT_VOUCHER_TEMP_ITEMS[idx]) EDIT_VOUCHER_TEMP_ITEMS[idx].kho = inp.value;
      });
    } else {
      document.querySelectorAll('.edit-item-warranty-select').forEach(inp => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        if (EDIT_VOUCHER_TEMP_ITEMS[idx]) EDIT_VOUCHER_TEMP_ITEMS[idx].soThangBh = parseInt(inp.value) || 0;
      });
      document.querySelectorAll('.edit-item-exp').forEach(inp => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        if (EDIT_VOUCHER_TEMP_ITEMS[idx]) EDIT_VOUCHER_TEMP_ITEMS[idx].ngayHetHanBh = fromInputDateFormat(inp.value);
      });
    }
  }

  // Xử lý lưu thay đổi phiếu full trường
  function submitEditVoucher() {
    syncEditVoucherDomToTempItems();

    const type = document.getElementById('edit-voucher-type').value;
    const maPhieu = document.getElementById('edit-voucher-code').value;
    const reason = document.getElementById('edit-voucher-reason').value.trim();

    if (!reason) {
      Swal.fire('Bắt buộc nhập lý do', 'Bạn phải nhập lý do điều chỉnh phiếu để ghi nhận vào vết kiểm toán (Audit Trail)!', 'warning');
      return;
    }

    const isNhap = type === 'NHAP';
    const v = isNhap ? VOUCHERS_DB.nhap.find(x => x.maPhieu === maPhieu) : VOUCHERS_DB.xuat.find(x => x.maPhieu === maPhieu);
    if (!v) return;

    // Kiểm tra tính hợp lệ của danh sách thiết bị
    for (let i = 0; i < EDIT_VOUCHER_TEMP_ITEMS.length; i++) {
      const it = EDIT_VOUCHER_TEMP_ITEMS[i];
      if (!it.serial) {
        Swal.fire('Thiếu Serial', `Thiết bị dòng #${i + 1} chưa có Serial hãng. Vui lòng kiểm tra lại!`, 'warning');
        return;
      }
    }

    let changes = [];
    const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;
    let removedSerials = [];

    if (isNhap) {
      // 1. Thu thập thay đổi Header Nhập
      const rawDate = document.getElementById('edit-nhap-ngay')?.value;
      const newNgay = rawDate ? fromInputDateFormat(rawDate) : v.ngay;
      const newNcc = document.getElementById('edit-nhap-ncc')?.value || v.ncc;
      const newKho = document.getElementById('edit-nhap-kho')?.value || v.kho;
      const newLoai = document.getElementById('edit-nhap-loaihang')?.value || v.loaiHang || 'Chính Hãng';
      const newSoHoaDon = document.getElementById('edit-nhap-sohoadon')?.value.trim() || '';
      const newNguoiGiao = document.getElementById('edit-nhap-nguoigiao')?.value.trim() || '';
      const newNguoiNhan = document.getElementById('edit-nhap-nguoinhan')?.value.trim() || '';
      const newGhiChu = document.getElementById('edit-nhap-ghichu')?.value.trim() || '';

      if (newNgay && newNgay !== v.ngay) {
        changes.push({ field: 'Ngày nhập', oldVal: v.ngay, newVal: newNgay });
        v.ngay = newNgay;
      }
      if (newNcc && newNcc !== v.ncc) {
        changes.push({ field: 'Nhà cung cấp', oldVal: v.ncc || 'Trống', newVal: newNcc });
        v.ncc = newNcc;
      }
      if (newKho && newKho !== v.kho) {
        changes.push({ field: 'Kho nhận', oldVal: v.kho, newVal: newKho });
        v.kho = newKho;
      }
      if (newLoai && newLoai !== v.loaiHang) {
        changes.push({ field: 'Loại hàng', oldVal: v.loaiHang || 'Chính Hãng', newVal: newLoai });
        v.loaiHang = newLoai;
      }
      if (newSoHoaDon !== (v.soHoaDonNcc || '')) {
        changes.push({ field: 'Số HĐ NCC', oldVal: v.soHoaDonNcc || 'Trống', newVal: newSoHoaDon });
        v.soHoaDonNcc = newSoHoaDon;
      }
      if (newNguoiGiao !== (v.nguoiGiaoNcc || '')) {
        changes.push({ field: 'Người giao NCC', oldVal: v.nguoiGiaoNcc || 'Trống', newVal: newNguoiGiao });
        v.nguoiGiaoNcc = newNguoiGiao;
      }
      if (newNguoiNhan !== (v.nguoiNhan || '')) {
        changes.push({ field: 'Thủ kho nhận', oldVal: v.nguoiNhan || 'Trống', newVal: newNguoiNhan });
        v.nguoiNhan = newNguoiNhan;
      }
      if (newGhiChu !== (v.ghiChu || '')) {
        changes.push({ field: 'Ghi chú', oldVal: v.ghiChu || 'Trống', newVal: newGhiChu });
        v.ghiChu = newGhiChu;
      }

      // 2. Thu thập thay đổi thiết bị Nhập & Xử lý gỡ bỏ máy
      const oldSerials = (v.items || []).map(x => x.serial).join(', ');
      const newSerials = EDIT_VOUCHER_TEMP_ITEMS.map(x => x.serial).join(', ');
      if (oldSerials !== newSerials) {
        changes.push({ field: 'Danh sách Serial', oldVal: oldSerials || 'Trống', newVal: newSerials });
      }

      const oldItemSerials = (v.items || []).map(x => x.serial);
      const newItemSerials = EDIT_VOUCHER_TEMP_ITEMS.map(x => x.serial);
      removedSerials = oldItemSerials.filter(sn => !newItemSerials.includes(sn));

      removedSerials.forEach(sn => {
        const sRem = SERIAL_DB.find(x => x.serial === sn);
        if (sRem) {
          sRem.status = 'CANCELLED_IMPORT';
          if (!sRem.timeline) sRem.timeline = [];
          sRem.timeline.unshift({
            date: nowStr,
            user: CURRENT_USER_NAME,
            action: 'Gỡ khỏi phiếu nhập',
            note: `Hủy nhập do bị gỡ khỏi phiếu ${maPhieu}. Lý do: ${reason}`
          });
          changes.push({ field: `Gỡ Serial (${sn})`, oldVal: 'Nhập kho', newVal: 'Hủy nhập CANCELLED_IMPORT' });
        }
      });

      // Cập nhật từng serial sang SERIAL_DB
      EDIT_VOUCHER_TEMP_ITEMS.forEach((it, idx) => {
        const oldItem = (v.items && v.items[idx]) ? v.items[idx] : null;
        let s = SERIAL_DB.find(x => x.serial === it.serial);
        if (!s && oldItem) {
          s = SERIAL_DB.find(x => x.serial === oldItem.serial);
        }

        if (s) {
          s.serial = it.serial;
          s.internalId = it.internalId || it.serial;
          s.maNoiBo = it.internalId || it.serial;
          s.model = it.model;
          s.loaiHang = it.loaiHang || newLoai;
          s.kho = it.kho || newKho;
          s.ncc = newNcc;
          s.ngayNhap = newNgay;
          s.soHoaDonNcc = newSoHoaDon;
          s.nguoiGiaoNcc = newNguoiGiao;
        } else {
          // Thêm mới vào SERIAL_DB nếu là máy thêm mới
          SERIAL_DB.unshift({
            serial: it.serial,
            internalId: it.internalId || it.serial,
            maNoiBo: it.internalId || it.serial,
            model: it.model,
            tenHang: it.tenHang || it.model,
            nhom: 'Khác',
            nhomHang: 'Khác',
            loaiHang: it.loaiHang || newLoai,
            kho: it.kho || newKho,
            ncc: newNcc,
            ngayNhap: newNgay,
            soHoaDonNcc: newSoHoaDon,
            nguoiGiaoNcc: newNguoiGiao,
            maPhieuNhap: maPhieu,
            maPhieu: maPhieu,
            status: 'IN_STOCK',
            ngayXuat: '',
            maPhieuXuat: '',
            khachHang: '',
            sdtKhach: '',
            soThangBh: 12,
            ngayHetHanBh: '',
            ghiChu: newGhiChu,
            timeline: [{ date: nowStr, user: CURRENT_USER_NAME, action: 'Thêm vào phiếu', note: `Bổ sung qua sửa phiếu ${maPhieu}` }]
          });
        }
      });

      v.items = JSON.parse(JSON.stringify(EDIT_VOUCHER_TEMP_ITEMS));
    } else {
      // 1. Thu thập thay đổi Header Xuất (Full các trường nghiệp vụ)
      const rawDate = document.getElementById('edit-xuat-ngay')?.value;
      const newNgay = rawDate ? fromInputDateFormat(rawDate) : v.ngay;
      const newKhach = document.getElementById('edit-xuat-khach')?.value || v.khachHang;
      const newSdt = document.getElementById('edit-xuat-sdt')?.value.trim() || '';
      const newKho = document.getElementById('edit-xuat-kho')?.value || v.kho;
      const newNguoiLienHe = document.getElementById('edit-xuat-nguoilienhe')?.value.trim() || '';
      const newEmail = document.getElementById('edit-xuat-email')?.value.trim() || '';
      const newMst = document.getElementById('edit-xuat-mst')?.value.trim() || '';
      const newDiaChi = document.getElementById('edit-xuat-diachi')?.value.trim() || '';
      const newGhiChu = document.getElementById('edit-xuat-ghichu')?.value.trim() || '';

      const newChungTu = [];
      if (document.getElementById('edit-xuat-ct-vat')?.checked) newChungTu.push('Hóa đơn VAT');
      if (document.getElementById('edit-xuat-ct-bbbg')?.checked) newChungTu.push('Biên bản bàn giao');
      if (document.getElementById('edit-xuat-ct-pbh')?.checked) newChungTu.push('Phiếu bảo hành');
      if (document.getElementById('edit-xuat-ct-cocq')?.checked) newChungTu.push('CO/CQ');

      if (newNgay && newNgay !== v.ngay) {
        changes.push({ field: 'Ngày xuất', oldVal: v.ngay, newVal: newNgay });
        v.ngay = newNgay;
      }
      if (newKhach && newKhach !== v.khachHang) {
        changes.push({ field: 'Khách hàng', oldVal: v.khachHang || 'Trống', newVal: newKhach });
        v.khachHang = newKhach;
      }
      if (newSdt !== (v.sdtKhach || '')) {
        changes.push({ field: 'SĐT Khách', oldVal: v.sdtKhach || 'Trống', newVal: newSdt });
        v.sdtKhach = newSdt;
      }
      if (newKho && newKho !== v.kho) {
        changes.push({ field: 'Kho xuất', oldVal: v.kho || 'Trống', newVal: newKho });
        v.kho = newKho;
      }
      if (newNguoiLienHe !== (v.nguoiLienHe || '')) {
        changes.push({ field: 'Người liên hệ', oldVal: v.nguoiLienHe || 'Trống', newVal: newNguoiLienHe });
        v.nguoiLienHe = newNguoiLienHe;
      }
      if (newEmail !== (v.emailKhach || v.email || '')) {
        changes.push({ field: 'Email', oldVal: v.emailKhach || v.email || 'Trống', newVal: newEmail });
        v.emailKhach = newEmail;
        v.email = newEmail;
      }
      if (newMst !== (v.mstKhach || v.mst || '')) {
        changes.push({ field: 'Mã số thuế', oldVal: v.mstKhach || v.mst || 'Trống', newVal: newMst });
        v.mstKhach = newMst;
        v.mst = newMst;
      }
      if (newDiaChi !== (v.diaChi || v.diaChiGiao || '')) {
        changes.push({ field: 'Địa chỉ giao', oldVal: v.diaChi || v.diaChiGiao || 'Trống', newVal: newDiaChi });
        v.diaChi = newDiaChi;
        v.diaChiGiao = newDiaChi;
      }
      if (newGhiChu !== (v.ghiChu || '')) {
        changes.push({ field: 'Ghi chú', oldVal: v.ghiChu || 'Trống', newVal: newGhiChu });
        v.ghiChu = newGhiChu;
      }

      const oldCtStr = (v.chungTuKemTheo || []).join(', ');
      const newCtStr = newChungTu.join(', ');
      if (oldCtStr !== newCtStr) {
        changes.push({ field: 'Chứng từ kèm theo', oldVal: oldCtStr || 'Trống', newVal: newCtStr || 'Không' });
        v.chungTuKemTheo = newChungTu;
      }

      // 2. THUẬT TOÁN HOÀN TRẢ TỒN KHO VI SAI (DIFFERENTIAL ROLLBACK)
      const oldItemSerials = (v.items || []).map(x => x.serial);
      const newItemSerials = EDIT_VOUCHER_TEMP_ITEMS.map(x => x.serial);
      removedSerials = oldItemSerials.filter(sn => !newItemSerials.includes(sn));

      removedSerials.forEach(sn => {
        const sRollback = SERIAL_DB.find(x => x.serial === sn);
        if (sRollback) {
          sRollback.status = 'IN_STOCK';
          sRollback.maPhieuXuat = '';
          sRollback.ngayXuat = '';
          sRollback.khachHang = '';
          sRollback.sdtKhach = '';
          sRollback.nguoiLienHe = '';
          sRollback.emailKhach = '';
          sRollback.mstKhach = '';
          sRollback.diaChiGiao = '';
          sRollback.chungTuKemTheo = [];
          if (!sRollback.timeline) sRollback.timeline = [];
          sRollback.timeline.unshift({
            date: nowStr,
            user: CURRENT_USER_NAME,
            action: 'Hoàn trả tồn kho',
            note: `Gỡ bỏ khỏi phiếu xuất ${maPhieu}. Thiết bị đã sẵn sàng trong kho. Lý do: ${reason}`
          });
          changes.push({ field: `Gỡ bỏ Serial (${sn})`, oldVal: 'Đã xuất bán', newVal: 'Hoàn trả IN_STOCK' });
        }
      });

      // 3. CASCADE HEADER SANG TOÀN BỘ CÁC MÁY CÒN LẠI THUỘC PHIẾU
      EDIT_VOUCHER_TEMP_ITEMS.forEach((it, idx) => {
        const oldItem = (v.items && v.items[idx]) ? v.items[idx] : null;
        let s = SERIAL_DB.find(x => x.serial === it.serial);
        if (!s && oldItem) {
          s = SERIAL_DB.find(x => x.serial === oldItem.serial);
        }

        const oldMonths = oldItem ? oldItem.soThangBh : 12;
        if (it.soThangBh !== oldMonths) {
          changes.push({ field: `Gói BH (${it.serial})`, oldVal: `${oldMonths} tháng`, newVal: `${it.soThangBh} tháng` });
        }

        // Tự động tính lại hạn BH nếu chưa có hoặc nếu ngày xuất / số tháng BH thay đổi
        if (typeof calculateExpiryDate === 'function') {
          if (!it.ngayHetHanBh || it.soThangBh !== oldMonths || newNgay !== oldNgay) {
            it.ngayHetHanBh = calculateExpiryDate(newNgay, it.soThangBh !== undefined ? it.soThangBh : 12);
          }
        }

        if (s) {
          s.serial = it.serial;
          s.khachHang = newKhach;
          s.sdtKhach = newSdt;
          s.nguoiLienHe = newNguoiLienHe;
          s.emailKhach = newEmail;
          s.mstKhach = newMst;
          s.diaChiGiao = newDiaChi;
          s.kho = newKho;
          s.chungTuKemTheo = newChungTu;
          s.ngayXuat = newNgay;
          s.soThangBh = it.soThangBh;
          s.ngayHetHanBh = it.ngayHetHanBh;
        }
      });

      v.items = JSON.parse(JSON.stringify(EDIT_VOUCHER_TEMP_ITEMS));
    }

    if (changes.length === 0) {
      Swal.fire('Không có thay đổi', 'Bạn chưa thay đổi trường dữ liệu nào!', 'info');
      return;
    }

    v.updatedAt = nowStr;
    v.updatedBy = CURRENT_USER_NAME;
    if (!v.history) v.history = [];
    v.history.unshift({
      time: nowStr,
      user: CURRENT_USER_NAME,
      action: 'SỬA PHIẾU FULL',
      note: `Điều chỉnh ${changes.length} trường: ${changes.map(c => `${c.field}: ${c.oldVal} -> ${c.newVal}`).join(', ')}. Lý do: ${reason}`
    });

    // Ghi Audit Log field-level
    recordAuditLog(
      isNhap ? 'SỬA PHIẾU NHẬP' : 'SỬA PHIẾU XUẤT',
      `Phiếu ${maPhieu}`,
      'Before',
      'After',
      reason,
      changes,
      'Phiếu kho',
      '',
      maPhieu
    );

    // Lưu bền vững vào localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
        localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
        localStorage.setItem('THANH_AN_AUDIT_LOGS', JSON.stringify(AUDIT_LOG_DB));
      }
    } catch(e) {}

    // Đồng bộ trực tiếp xuống Google Sheet nếu ở môi trường Apps Script
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      try {
        google.script.run
          .withSuccessHandler(res => {
            if (res && !res.success && res.error) {
              Swal.fire('Lỗi cập nhật máy chủ', res.error, 'error');
            }
          })
          .withFailureHandler(err => {
            Swal.fire('Lỗi kết nối máy chủ', (err && err.message) ? err.message : String(err), 'error');
          })
          .saveVoucherEdit({
            type: type,
            maPhieu: maPhieu,
            voucher: v,
            removedSerials: removedSerials,
            changes: changes,
            reason: reason,
            expectedVersion: window.LAST_DATA_VERSION || 100
          });
      } catch(e) {}
    }

    const modalEl = document.getElementById('editVoucherModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    // ĐỒNG BỘ ĐA CHIỀU: Đánh dấu Dirty các module liên quan
    if (typeof notifySystemDataChanged === 'function') {
      notifySystemDataChanged('VOUCHER_EDIT', { maPhieu, type });
    } else if (typeof markModulesDirty === 'function') {
      markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'Serial360', 'XuatKho', 'NhapKho']);
    }
    renderHistoryTables();

    Swal.fire({
      icon: 'success',
      title: 'Đã cập nhật phiếu!',
      html: `Phiếu <strong>${maPhieu}</strong> đã được lưu thay đổi toàn diện.<br>Số trường thay đổi: <strong>${changes.length} trường</strong>.<br>Hệ thống đã lưu lại vết kiểm toán Audit Trail.`
    });
  }

  // Export functions ra window
  if (typeof window !== 'undefined') {
    window.openEditVoucherModal = openEditVoucherModal;
    window.addNewItemToEditVoucher = addNewItemToEditVoucher;
    window.removeEditVoucherItem = removeEditVoucherItem;
    window.renderEditVoucherItemsTable = renderEditVoucherItemsTable;
    window.submitEditVoucher = submitEditVoucher;
  }

  /* ==================================================== */
  /* AUDIT CENTER & BỘ LỌC ĐA TIÊU CHÍ (YÊU CẦU 7.1) */
  /* ==================================================== */
  function setAuditPreset(preset) {
    AUDIT_FILTER_PRESET = preset;
    const todayStr = getLocalDateStr();

    const fromInput = document.getElementById('filter-audit-from');
    const toInput = document.getElementById('filter-audit-to');
    const actionSelect = document.getElementById('filter-audit-action');
    const searchInput = document.getElementById('filter-audit-search');

    fromInput.value = '';
    toInput.value = '';
    actionSelect.value = '';
    searchInput.value = '';

    if (preset === 'today') {
      fromInput.value = todayStr;
      toInput.value = todayStr;
    } else if (preset === '7days') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      fromInput.value = getLocalDateStr(d7);
      toInput.value = todayStr;
    } else if (preset === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      fromInput.value = getLocalDateStr(startOfMonth);
      toInput.value = todayStr;
    } else if (preset === 'edit_only') {
      actionSelect.value = 'SỬA';
    } else if (preset === 'cancel_only') {
      actionSelect.value = 'HỦY';
    } else if (preset === 'me_only') {
      searchInput.value = CURRENT_USER_NAME.split('(')[0].trim();
    }

    applyAuditFilters();
  }

  function applyAuditFilters() {
    const filterFrom = document.getElementById('filter-audit-from')?.value || '';
    const filterTo = document.getElementById('filter-audit-to')?.value || '';
    if (filterFrom && filterTo && filterFrom > filterTo) {
      Swal.fire('Thời gian không hợp lệ', 'Từ ngày không được lớn hơn Đến ngày!', 'warning');
      return;
    }
    renderAuditTable();
  }

  function resetAuditFilters() {
    document.getElementById('filter-audit-search').value = '';
    document.getElementById('filter-audit-module').value = '';
    document.getElementById('filter-audit-action').value = '';
    document.getElementById('filter-audit-from').value = '';
    document.getElementById('filter-audit-to').value = '';
    renderAuditTable();
  }

  function renderAuditTable() {
    const tbody = document.getElementById('history-audit-table-body');
    if (!tbody) return;
    HISTORY_SUBTAB_STATE.audit.rendered = true;
    HISTORY_SUBTAB_STATE.audit.dirty = false;

    if (typeof hasPermission === 'function' && !hasPermission('Audit.View')) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger py-5">
            <i class="fa-solid fa-lock fs-2 mb-2 d-block text-danger"></i>
            <strong>Từ chối quyền truy cập!</strong><br>
            <span class="text-muted small">Tài khoản vai trò [${typeof CURRENT_ROLE !== 'undefined' ? CURRENT_ROLE : 'Khách'}] không có quyền xem Nhật ký Kiểm toán (Audit.View).<br>Vui lòng liên hệ Quản trị viên để được cấp quyền.</span>
          </td>
        </tr>
      `;
      return;
    }
    const keyword = (document.getElementById('filter-audit-search')?.value || '').trim().toLowerCase();
    const filterMod = document.getElementById('filter-audit-module')?.value || '';
    const filterAct = document.getElementById('filter-audit-action')?.value || '';
    const filterFrom = document.getElementById('filter-audit-from')?.value || '';
    const filterTo = document.getElementById('filter-audit-to')?.value || '';

    let list = [...AUDIT_LOG_DB];

    if (filterMod) list = list.filter(a => a.module === filterMod);
    if (filterAct) list = list.filter(a => a.action && a.action.includes(filterAct));

    if (keyword) {
      list = list.filter(a => 
        (a.user && a.user.toLowerCase().includes(keyword)) ||
        (a.action && a.action.toLowerCase().includes(keyword)) ||
        (a.target && a.target.toLowerCase().includes(keyword)) ||
        (a.reason && a.reason.toLowerCase().includes(keyword)) ||
        (a.serial && a.serial.toLowerCase().includes(keyword)) ||
        (a.voucherCode && a.voucherCode.toLowerCase().includes(keyword))
      );
    }

    if (filterFrom) {
      const fromD = new Date(filterFrom);
      list = list.filter(a => {
        const parts = a.time.split(' ')[0].split('/');
        const aD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return aD >= fromD;
      });
    }

    if (filterTo) {
      const toD = new Date(filterTo);
      toD.setHours(23, 59, 59);
      list = list.filter(a => {
        const parts = a.time.split(' ')[0].split('/');
        const aD = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return aD <= toD;
      });
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Không tìm thấy bản ghi Audit nào khớp với bộ lọc</td></tr>';
      return;
    }

    const FIELD_LABELS = {
      'tenKhach': 'Khách hàng',
      'sdtKhach': 'Số điện thoại',
      'diaChi': 'Địa chỉ',
      'ncc': 'Nhà cung cấp',
      'kho': 'Kho lưu trữ',
      'soThangBh': 'Thời hạn bảo hành',
      'ngayHetHanBh': 'Hạn bảo hành',
      'loaiHang': 'Loại hàng hóa',
      'ghiChu': 'Ghi chú',
      'status': 'Trạng thái',
      'trangThai': 'Trạng thái',
      'ngayNhap': 'Ngày nhập',
      'ngayXuat': 'Ngày xuất'
    };

    let html = '';
    list.forEach((a, idx) => {
      let changesHtml = '';
      if (a.changes && Array.isArray(a.changes) && a.changes.length > 0) {
        changesHtml = a.changes.map(c => {
          const fieldName = FIELD_LABELS[c.field] || c.field;
          const oldDisplay = (c.oldVal !== undefined && c.oldVal !== null && c.oldVal !== '') ? c.oldVal : '(trống)';
          const newDisplay = (c.newVal !== undefined && c.newVal !== null && c.newVal !== '') ? c.newVal : '(trống)';
          return `<div class="mb-1"><span class="fw-semibold text-dark">• ${fieldName}:</span> <span class="badge bg-secondary-subtle text-muted text-decoration-line-through">${oldDisplay}</span> <i class="fa-solid fa-arrow-right text-primary mx-1" style="font-size:0.7rem"></i> <span class="badge bg-success-subtle text-success fw-bold">${newDisplay}</span></div>`;
        }).join('');
      } else if (a.oldVal && a.newVal && a.oldVal !== 'Before' && a.newVal !== 'After') {
        changesHtml = `<div><span class="badge bg-secondary-subtle text-muted text-decoration-line-through">${a.oldVal}</span> <i class="fa-solid fa-arrow-right text-primary mx-1" style="font-size:0.7rem"></i> <span class="badge bg-success-subtle text-success fw-bold">${a.newVal}</span></div>`;
      } else {
        changesHtml = `<div class="text-dark"><i class="fa-solid fa-circle-info text-info me-1"></i>${a.action}: <strong class="text-primary">${a.target}</strong></div>`;
      }

      html += `
        <tr>
          <td data-label="Thời Gian" class="small font-monospace text-center">${a.time}</td>
          <td data-label="Người Thao Tác">
            <strong>${a.user}</strong><br>
            <span class="badge bg-light text-dark border">${a.role || 'Hệ thống'}</span>
          </td>
          <td data-label="Hành Động">
            <span class="badge ${a.action.includes('HỦY') ? 'bg-danger' : (a.action.includes('SỬA') ? 'bg-warning text-dark' : 'bg-primary')} mb-1">${a.action}</span>
          </td>
          <td data-label="Module / Đối Tượng">
            <span class="badge bg-secondary font-monospace">${a.module || 'Hệ thống'}</span>
            <div class="fw-bold mt-1">${a.target}</div>
          </td>
          <td data-label="Chi Tiết Thay Đổi" class="small">
            ${changesHtml}
          </td>
          <td data-label="Lý Do">
            <small class="text-muted">${a.reason || '--'}</small>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  /* ==================================================== */
  /* HỦY PHIẾU NHẬP: KHÔNG HARD-DELETE SERIAL (YÊU CẦU A4) */
  /* ==================================================== */
  function cancelImportVoucher(maPhieu) {
    if (!checkPermission(['QUẢN LÝ', 'ADMIN'], 'Hủy phiếu nhập kho')) return;

    const v = VOUCHERS_DB.nhap.find(x => x.maPhieu === maPhieu);
    if (!v) return;

    if (v.status !== 'CONFIRMED') {
      Swal.fire('Không hợp lệ', `Phiếu này đang ở trạng thái ${v.status}, không thể thực hiện hủy!`, 'warning');
      return;
    }

    let blockedSerials = [];
    v.items.forEach(it => {
      const serialItem = SERIAL_DB.find(s => s.serial === it.serial);
      if (serialItem) {
        if (serialItem.status === 'SOLD') {
          blockedSerials.push(`${serialItem.serial} (Đã xuất bán cho ${serialItem.khachHang} theo phiếu ${serialItem.maPhieuXuat})`);
        } else if (serialItem.status === 'IN_WARRANTY') {
          blockedSerials.push(`${serialItem.serial} (Đang có ca bảo hành)`);
        } else if (serialItem.status !== 'IN_STOCK') {
          blockedSerials.push(`${serialItem.serial} (Trạng thái hiện tại: ${serialItem.status})`);
        }
      }
    });

    if (blockedSerials.length > 0) {
      playBeepSound();
      Swal.fire({
        icon: 'error',
        title: 'KHÔNG THỂ HỦY PHIẾU NHẬP!',
        html: `
          <p class="text-danger small mb-2">Các Serial trong phiếu đã phát sinh nghiệp vụ sau nhập, không được phép hủy phiếu gốc:</p>
          <div class="text-start small p-2 bg-light border rounded text-danger" style="max-height: 180px; overflow-y: auto;">
            ${blockedSerials.map(b => `<div>• ${b}</div>`).join('')}
          </div>
          <small class="text-muted mt-2 d-block">Bạn phải hủy hoặc hoàn nhập các nghiệp vụ xuất/bảo hành trước khi có thể hủy phiếu nhập này.</small>
        `
      });
      return;
    }

    Swal.fire({
      title: `Hủy phiếu nhập ${maPhieu}?`,
      text: 'Toàn bộ Serial trong phiếu sẽ chuyển sang trạng thái CANCELLED_IMPORT (Lưu hồ sơ lý do, không xóa hoàn toàn khỏi hệ thống, vẫn tra được ở 360°).',
      input: 'text',
      inputPlaceholder: 'Nhập lý do hủy phiếu (Bắt buộc)...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Xác nhận Hủy Phiếu',
      cancelButtonText: 'Quay lại',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Bạn phải nhập lý do hủy để lưu vết kiểm toán!';
        }
      }
    }).then(result => {
      if (result.isConfirmed) {
        const reason = result.value.trim();
        const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

        v.status = 'CANCELLED';
        v.lyDoHuy = reason;
        v.nguoiHuy = CURRENT_USER_NAME;
        v.ngayHuy = nowStr;

        let cancelledChanges = [
          { field: 'Trạng thái phiếu', oldVal: 'CONFIRMED', newVal: 'CANCELLED' }
        ];

        v.items.forEach(it => {
          const serialItem = SERIAL_DB.find(s => s.serial === it.serial);
          if (serialItem) {
            serialItem.status = 'CANCELLED_IMPORT';
            serialItem.ghiChu = `[HỦY PHIẾU NHẬP] ${reason}`;
            serialItem.timeline = serialItem.timeline || [];
            serialItem.timeline.unshift({
              date: nowStr,
              user: CURRENT_USER_NAME,
              action: 'Hủy phiếu nhập',
              note: `Hủy phiếu nhập ${maPhieu}. Lý do: ${reason}`
            });
            cancelledChanges.push({ field: `Serial ${serialItem.serial}`, oldVal: 'IN_STOCK', newVal: 'CANCELLED_IMPORT' });
          }
        });

        recordAuditLog('HỦY PHIẾU NHẬP', `Phiếu ${maPhieu} (${v.items.length} máy)`, 'CONFIRMED', 'CANCELLED', reason, cancelledChanges, 'Phiếu kho', '', maPhieu);

        // Đồng bộ lên Google Sheets backend nếu đang trong môi trường Google Apps Script
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(res => console.log('Đã đồng bộ Hủy phiếu nhập lên Google Sheet:', res))
            .withFailureHandler(err => console.error('Lỗi đồng bộ Hủy phiếu nhập Sheet:', err))
            .cancelImportVoucherBackend(maPhieu, reason, CURRENT_USER_NAME);
        }

        // Lưu localStorage
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
            localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
          }
        } catch(e) {}

        if (typeof notifySystemDataChanged === 'function') {
          notifySystemDataChanged('VOUCHER_CANCEL', { maPhieu, type: 'NHAP' });
        } else if (typeof markModulesDirty === 'function') {
          markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'Serial360']);
        }
        renderHistoryTables();

        Swal.fire({
          icon: 'success',
          title: 'Đã hủy phiếu nhập!',
          html: `Phiếu <strong>${maPhieu}</strong> đã chuyển sang <strong>CANCELLED</strong>.<br>Toàn bộ Serial đã chuyển sang trạng thái <strong>CANCELLED_IMPORT</strong> và sẵn sàng để tái nhập kho nếu cần.`
        });
      }
    });
  }

  /* ==================================================== */
  /* HỦY PHIẾU XUẤT: KIỂM TRA DEPENDENCY (YÊU CẦU A5) */
  /* ==================================================== */
  function cancelExportVoucher(maPhieu) {
    if (!checkPermission(['THỦ KHO', 'QUẢN LÝ', 'ADMIN'], 'Hủy phiếu xuất kho')) return;

    const v = VOUCHERS_DB.xuat.find(x => x.maPhieu === maPhieu);
    if (!v) return;

    if (v.status !== 'CONFIRMED') {
      Swal.fire('Không hợp lệ', `Phiếu này đang ở trạng thái ${v.status}!`, 'warning');
      return;
    }

    let dependencyErrors = [];
    v.items.forEach(it => {
      const hasWarranty = WARRANTY_CASES_DB.some(c => c.serial.toLowerCase() === it.serial.toLowerCase());
      if (hasWarranty) {
        dependencyErrors.push(`${it.serial} (Đã phát sinh Ca Bảo Hành trong hệ thống)`);
      }

      const curDb = SERIAL_DB.find(s => s.serial === it.serial);
      if (curDb && curDb.status === 'IN_WARRANTY') {
        dependencyErrors.push(`${it.serial} (Hiện đang trong quy trình Bảo Hành)`);
      }
    });

    if (dependencyErrors.length > 0) {
      playBeepSound();
      Swal.fire({
        icon: 'error',
        title: 'KHÔNG THỂ HỦY PHIẾU XUẤT (VƯỚNG DEPENDENCY)!',
        html: `
          <p class="text-danger small mb-2">Các thiết bị trong phiếu đã phát sinh nghiệp vụ sau xuất. Cần xử lý nghiệp vụ vướng mắc trước:</p>
          <div class="text-start small p-2 bg-light border rounded text-danger" style="max-height: 180px; overflow-y: auto;">
            ${dependencyErrors.map(e => `<div>• ${e}</div>`).join('')}
          </div>
          <small class="text-muted mt-2 d-block">Chỉ khi toàn bộ Serial đủ điều kiện rollback mới được phép hủy phiếu xuất.</small>
        `
      });
      return;
    }

    Swal.fire({
      title: `Hủy phiếu xuất ${maPhieu}?`,
      text: 'Toàn bộ thiết bị trong phiếu sẽ được rollback hoàn lại trạng thái Tồn Kho (IN_STOCK), hủy kích hoạt bảo hành.',
      input: 'text',
      inputPlaceholder: 'Nhập lý do hủy phiếu xuất (Bắt buộc)...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Xác nhận Hủy Phiếu Xuất',
      cancelButtonText: 'Quay lại',
      inputValidator: (val) => {
        if (!val || !val.trim()) return 'Vui lòng nhập lý do hủy phiếu!';
      }
    }).then(result => {
      if (result.isConfirmed) {
        const reason = result.value.trim();
        const nowStr = `${formatDateDisplay(getLocalDateStr())} ${new Date().toLocaleTimeString('vi-VN')}`;

        v.status = 'CANCELLED';
        v.lyDoHuy = reason;
        v.nguoiHuy = CURRENT_USER_NAME;
        v.ngayHuy = nowStr;

        let rollBackChanges = [
          { field: 'Trạng thái phiếu', oldVal: 'CONFIRMED', newVal: 'CANCELLED' }
        ];

        v.items.forEach(it => {
          const s = SERIAL_DB.find(x => x.serial === it.serial);
          if (s) {
            s.status = 'IN_STOCK';
            s.ngayXuat = '';
            s.maPhieuXuat = '';
            s.khachHang = '';
            s.sdtKhach = '';
            s.ngayHetHanBh = '';
            s.timeline = s.timeline || [];
            s.timeline.unshift({
              date: nowStr,
              user: CURRENT_USER_NAME,
              action: 'Rollback xuất kho',
              note: `Hủy phiếu xuất ${maPhieu}, hoàn lại tồn kho. Lý do: ${reason}`
            });
            rollBackChanges.push({ field: `Serial ${s.serial}`, oldVal: 'SOLD', newVal: 'IN_STOCK (Rollback)' });
          }
        });

        recordAuditLog('HỦY PHIẾU XUẤT', `Phiếu ${maPhieu} (${v.items.length} máy)`, 'CONFIRMED', 'CANCELLED', reason, rollBackChanges, 'Phiếu kho', '', maPhieu);

        // Đồng bộ lên Google Sheets backend nếu đang trong môi trường Google Apps Script
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run
            .withSuccessHandler(res => console.log('Đã đồng bộ Hủy phiếu xuất lên Google Sheet:', res))
            .withFailureHandler(err => console.error('Lỗi đồng bộ Hủy phiếu xuất Sheet:', err))
            .cancelExportVoucherBackend(maPhieu, reason, CURRENT_USER_NAME);
        }

        // Lưu localStorage
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
            localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
          }
        } catch(e) {}

        if (typeof notifySystemDataChanged === 'function') {
          notifySystemDataChanged('VOUCHER_CANCEL', { maPhieu, type: 'XUAT' });
        } else if (typeof markModulesDirty === 'function') {
          markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'Serial360']);
        }
        renderHistoryTables();

        Swal.fire({
          icon: 'success',
          title: 'Đã hủy phiếu xuất & Rollback tồn kho!',
          html: `Phiếu <strong>${maPhieu}</strong> đã được hủy thành công.<br>Toàn bộ <strong>${v.items.length} thiết bị</strong> đã được hoàn lại trạng thái <strong>Tồn Kho (IN_STOCK)</strong> an toàn.`
        });
      }
    });
  }

  // XÓA PHIẾU NHÁP DRAFT XUẤT KHO (SERVER-AUTHORITATIVE)
  function deleteDraftExportVoucher(maPhieu) {
    const v = VOUCHERS_DB.xuat.find(x => x.maPhieu === maPhieu);
    if (!v) return;
    if (v.status !== 'DRAFT') {
      Swal.fire('Không thể xóa', 'Chỉ được xóa trực tiếp phiếu ở trạng thái DRAFT!', 'warning');
      return;
    }

    Swal.fire({
      title: `Xóa phiếu nháp ${maPhieu}?`,
      text: 'Phiếu dự thảo xuất kho này sẽ bị xóa hoàn toàn khỏi hệ thống Google Sheets.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Quay lại'
    }).then(r => {
      if (r.isConfirmed) {
        // 1. Hiển thị loading & khóa tương tác
        Swal.fire({
          title: 'Đang xóa phiếu nháp...',
          html: '<span class="text-muted small">Đang gửi yêu cầu xóa tới máy chủ Google Sheets...</span>',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const performLocalDelete = () => {
          VOUCHERS_DB.xuat = VOUCHERS_DB.xuat.filter(x => x.maPhieu !== maPhieu);
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
            }
          } catch(e) {}
          recordAuditLog('XÓA PHIẾU NHÁP', `Phiếu xuất ${maPhieu}`, 'DRAFT', 'DELETED', 'Xóa phiếu xuất nháp trên server thành công', [], 'Lịch sử phiếu', '', maPhieu);
          if (typeof markModulesDirty === 'function') markModulesDirty(['Dashboard', 'LichSu']);
          renderHistoryXuatTable();
          Swal.fire('Đã xóa', `Đã xóa thành công phiếu nháp ${maPhieu} khỏi hệ thống.`, 'success');
        };

        const handleLocalFail = (errMsg) => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi xóa phiếu nháp!',
            html: `
              <div class="text-start">
                <p class="text-danger fw-semibold mb-2">Máy chủ Google Sheets từ chối xóa hoặc mất kết nối mạng:</p>
                <div class="p-2 bg-danger-subtle text-danger rounded border border-danger-subtle font-monospace small mb-2">
                  ${errMsg || 'Không nhận được phản hồi từ server'}
                </div>
                <div class="alert alert-warning small py-2 mb-0">
                  <i class="fa-solid fa-shield-halved me-1"></i> <strong>Bảo vệ dữ liệu:</strong> Phiếu nháp <b>vẫn được giữ nguyên 100%</b> trên máy của bạn. Vui lòng kiểm tra lại mạng và thử lại.
                </div>
              </div>
            `
          });
        };

        if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
          WarehouseAPI.deleteDraftVoucher(maPhieu, res => {
            if (res && res.success) {
              performLocalDelete();
            } else {
              handleLocalFail(res ? (res.error || res.message) : 'Máy chủ từ chối xóa!');
            }
          });
        } else {
          // Demo offline
          performLocalDelete();
        }
      }
    });
  }

  // XÓA PHIẾU NHÁP DRAFT NHẬP KHO (SERVER-AUTHORITATIVE)
  function deleteDraftImportVoucher(maPhieu) {
    const v = VOUCHERS_DB.nhap.find(x => x.maPhieu === maPhieu);
    if (!v) return;
    if (v.status !== 'DRAFT') {
      Swal.fire('Không thể xóa', 'Chỉ được xóa trực tiếp phiếu ở trạng thái DRAFT!', 'warning');
      return;
    }

    Swal.fire({
      title: `Xóa phiếu nháp ${maPhieu}?`,
      text: 'Phiếu dự thảo nhập kho này sẽ bị xóa hoàn toàn khỏi hệ thống Google Sheets.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Quay lại'
    }).then(r => {
      if (r.isConfirmed) {
        // 1. Hiển thị loading & khóa tương tác
        Swal.fire({
          title: 'Đang xóa phiếu nháp...',
          html: '<span class="text-muted small">Đang gửi yêu cầu xóa tới máy chủ Google Sheets...</span>',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const performLocalDelete = () => {
          VOUCHERS_DB.nhap = VOUCHERS_DB.nhap.filter(x => x.maPhieu !== maPhieu);
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
            }
          } catch(e) {}
          recordAuditLog('XÓA PHIẾU NHÁP', `Phiếu nhập ${maPhieu}`, 'DRAFT', 'DELETED', 'Xóa phiếu nhập nháp trên server thành công', [], 'Lịch sử phiếu', '', maPhieu);
          if (typeof markModulesDirty === 'function') markModulesDirty(['Dashboard', 'LichSu']);
          renderHistoryNhapTable();
          Swal.fire('Đã xóa', `Đã xóa thành công phiếu nháp ${maPhieu} khỏi hệ thống.`, 'success');
        };

        const handleLocalFail = (errMsg) => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi xóa phiếu nháp!',
            html: `
              <div class="text-start">
                <p class="text-danger fw-semibold mb-2">Máy chủ Google Sheets từ chối xóa hoặc mất kết nối mạng:</p>
                <div class="p-2 bg-danger-subtle text-danger rounded border border-danger-subtle font-monospace small mb-2">
                  ${errMsg || 'Không nhận được phản hồi từ server'}
                </div>
                <div class="alert alert-warning small py-2 mb-0">
                  <i class="fa-solid fa-shield-halved me-1"></i> <strong>Bảo vệ dữ liệu:</strong> Phiếu nháp <b>vẫn được giữ nguyên 100%</b> trên máy của bạn. Vui lòng kiểm tra lại mạng và thử lại.
                </div>
              </div>
            `
          });
        };

        if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
          WarehouseAPI.deleteDraftVoucher(maPhieu, res => {
            if (res && res.success) {
              performLocalDelete();
            } else {
              handleLocalFail(res ? (res.error || res.message) : 'Máy chủ từ chối xóa!');
            }
          });
        } else {
          // Demo offline
          performLocalDelete();
        }
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.deleteDraftExportVoucher = deleteDraftExportVoucher;
    window.deleteDraftImportVoucher = deleteDraftImportVoucher;
    window.cancelExportVoucher = cancelExportVoucher;
  }
