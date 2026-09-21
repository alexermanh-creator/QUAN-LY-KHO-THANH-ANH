  /* ==================================================== */
  /* 10. QUẢN LÝ TỒN KHO MASTER-DETAIL ACCORDION (YÊU CẦU E & F) */
  /* ==================================================== */

  let EXPANDED_STOCK_MODELS = new Set();
  if (typeof window !== 'undefined') window.EXPANDED_STOCK_MODELS = EXPANDED_STOCK_MODELS;

  function clearStockKeyword() {
    const input = document.getElementById('filter-stock-keyword');
    if (input) {
      input.value = '';
      applyStockFilter();
    }
  }

  function toggleModelStock(modelName) {
    if (EXPANDED_STOCK_MODELS.has(modelName)) {
      EXPANDED_STOCK_MODELS.delete(modelName);
    } else {
      EXPANDED_STOCK_MODELS.add(modelName);
    }
    renderTonKho();
  }

  function toggleExpandAllModels() {
    const btnText = document.getElementById('toggle-expand-text');
    const isExpanding = btnText && btnText.innerText.includes('Mở rộng');

    if (isExpanding) {
      // Mở rộng tất cả các model đang hiển thị
      const allRows = document.querySelectorAll('#stock-accordion-table-body tr[data-model-key]');
      allRows.forEach(r => {
        const mKey = r.getAttribute('data-model-key');
        if (mKey) EXPANDED_STOCK_MODELS.add(mKey);
      });
      if (btnText) btnText.innerText = 'Thu gọn tất cả';
    } else {
      EXPANDED_STOCK_MODELS.clear();
      if (btnText) btnText.innerText = 'Mở rộng tất cả';
    }
    renderTonKho();
  }

  function renderTonKho() {
    if (typeof updateStockFilterDropdowns === 'function') {
      updateStockFilterDropdowns();
    }

    const tbody = document.getElementById('stock-accordion-table-body');
    if (!tbody) return;

    const filterKho = document.getElementById('filter-stock-kho')?.value || '';
    const filterNhom = document.getElementById('filter-stock-nhom')?.value || '';
    const keyword = (document.getElementById('filter-stock-keyword')?.value || '').trim().toLowerCase();
    const agingFilter = document.getElementById('filter-stock-aging')?.value || '';
    const statusFilter = document.getElementById('filter-stock-status')?.value || 'IN_STOCK';

    let list = typeof SERIAL_DB !== 'undefined' ? [...SERIAL_DB] : [];

    // 1. Lọc theo trạng thái
    if (statusFilter === 'IN_STOCK') {
      list = list.filter(s => s.status === 'IN_STOCK');
    } else if (statusFilter !== 'ALL') {
      list = list.filter(s => s.status === statusFilter);
    }

    // 2. Lọc theo kho
    if (filterKho) {
      list = list.filter(s => s.kho === filterKho);
    }

    // 3. Lọc theo nhóm
    if (filterNhom) {
      list = list.filter(s => (s.nhomHang === filterNhom) || (s.nhom === filterNhom));
    }

    // 4. Lọc theo tuổi tồn kho (Aging)
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
          list = list.filter(s => calculateStockAging(s.ngayNhap) > minDays);
        }
      }
    }

    // 5. Lọc theo từ khóa thông minh (Model, Tên hàng, Serial, Mã nội bộ, Phiếu nhập)
    if (keyword) {
      list = list.filter(s => 
        (s.serial && s.serial.toLowerCase().includes(keyword)) ||
        (s.internalId && s.internalId.toLowerCase().includes(keyword)) ||
        (s.model && s.model.toLowerCase().includes(keyword)) ||
        (s.tenHang && s.tenHang.toLowerCase().includes(keyword)) ||
        (s.name && s.name.toLowerCase().includes(keyword)) ||
        (s.maPhieuNhap && s.maPhieuNhap.toLowerCase().includes(keyword)) ||
        (s.ncc && s.ncc.toLowerCase().includes(keyword))
      );
    }

    // 6. Gom nhóm theo Model
    let modelMap = {};
    list.forEach(s => {
      const mKey = s.model || 'Chưa rõ Model';
      if (!modelMap[mKey]) {
        modelMap[mKey] = {
          model: mKey,
          tenHang: s.tenHang || s.name || mKey,
          nhomHang: s.nhomHang || s.nhom || 'Khác',
          warehouses: {},
          serials: [],
          freshCount: 0,
          agingCount: 0
        };
      }
      const wName = s.kho || 'Kho VP';
      modelMap[mKey].warehouses[wName] = (modelMap[mKey].warehouses[wName] || 0) + 1;
      modelMap[mKey].serials.push(s);

      const days = calculateStockAging(s.ngayNhap);
      if (days <= 30) {
        modelMap[mKey].freshCount++;
      } else {
        modelMap[mKey].agingCount++;
      }
    });

    const modelList = Object.values(modelMap);

    // 7. Cập nhật thẻ chỉ số thống kê (Summary KPI Strip)
    updateStockKpiCards(list, modelList);

    // Nếu không có dữ liệu
    if (modelList.length === 0) {
      const isFiltered = !!(filterKho || filterNhom || keyword || agingFilter || (statusFilter && statusFilter !== 'IN_STOCK' && statusFilter !== 'ALL'));
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-5">
            <i class="fa-solid fa-boxes-stacked fs-2 mb-2 d-block text-secondary opacity-50"></i>
            <div class="fw-bold fs-6">${isFiltered ? 'Không tìm thấy Model hay Serial nào phù hợp bộ lọc.' : 'Kho hàng hiện tại chưa có thiết bị tồn.'}</div>
            <div class="small text-muted mt-1">${isFiltered ? 'Hãy thử đổi từ khóa tìm kiếm hoặc bấm nút "Xóa" để xóa bộ lọc.' : 'Hãy tiến hành Nhập kho hoặc quét tem để bắt đầu quản lý tồn.'}</div>
          </td>
        </tr>
      `;
      return;
    }

    // 8. Render bảng Master-Detail Accordion
    let html = '';
    modelList.forEach((m, idx) => {
      const isExpanded = EXPANDED_STOCK_MODELS.has(m.model);
      const totalUnits = m.serials.length;

      // Badges phân bổ kho
      const whBadges = Object.entries(m.warehouses).map(([wName, count]) => {
        let badgeColor = 'bg-primary-subtle text-primary border-primary-subtle';
        if (wName.includes('Chi Nhánh')) badgeColor = 'bg-info-subtle text-info border-info-subtle';
        else if (wName.includes('Cách Ly')) badgeColor = 'bg-danger-subtle text-danger border-danger-subtle';
        return `<span class="badge ${badgeColor} border me-1 mb-1" style="font-size: 0.76rem;"><i class="fa-solid fa-location-dot me-1"></i>${wName}: <strong>${count}</strong></span>`;
      }).join('');

      // Badges tuổi tồn
      let agingInfo = '';
      if (m.freshCount > 0) {
        agingInfo += `<span class="badge bg-success-subtle text-success border border-success-subtle me-1" title="Máy tồn 0-30 ngày"><i class="fa-solid fa-circle-check me-1"></i>${m.freshCount} mới (≤30N)</span>`;
      }
      if (m.agingCount > 0) {
        agingInfo += `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" title="Máy tồn trên 30 ngày"><i class="fa-solid fa-clock me-1"></i>${m.agingCount} lâu (>30N)</span>`;
      }

      // HÀNG MASTER (MODEL)
      html += `
        <tr class="stock-master-row ${isExpanded ? 'table-active border-primary' : ''}" data-model-key="${escapeHtml(m.model)}" style="cursor: pointer;" onclick="if (!event.target.closest('button') && !event.target.closest('a')) toggleModelStock('${escapeHtml(m.model)}')">
          <td class="text-center font-monospace text-muted small">${idx + 1}</td>
          <td>
            <div class="d-flex align-items-center">
              <div class="me-2 text-primary">
                <i class="fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-box'} fs-5"></i>
              </div>
              <div>
                <div class="fw-bold text-primary fs-6">${m.model}</div>
                <div class="small text-secondary text-truncate" style="max-width: 380px;" title="${escapeHtml(m.tenHang)}">${m.tenHang}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge bg-light text-dark border px-2 py-1"><i class="fa-solid fa-tag me-1 text-secondary"></i>${m.nhomHang}</span>
          </td>
          <td>
            <div class="d-flex flex-wrap">${whBadges}</div>
          </td>
          <td class="text-center">
            <span class="badge ${totalUnits > 0 ? 'bg-success' : 'bg-secondary'} fs-6 px-3 py-2 fw-bold shadow-sm">${totalUnits} máy</span>
          </td>
          <td>
            <div class="d-flex flex-wrap align-items-center">${agingInfo}</div>
          </td>
          <td class="text-end">
            <button class="btn btn-sm ${isExpanded ? 'btn-primary' : 'btn-outline-primary'} fw-semibold px-3 py-1" onclick="toggleModelStock('${escapeHtml(m.model)}')" title="Bấm để xem danh sách ${totalUnits} Serial">
              <i class="fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} me-1"></i>
              ${isExpanded ? 'Đóng' : 'Xem'} ${totalUnits} Serial
            </button>
          </td>
        </tr>
      `;

      // HÀNG DETAIL (SUB-TABLE ACCORDION KHI BUNG MỞ)
      if (isExpanded) {
        html += `
          <tr class="stock-detail-container bg-light bg-opacity-50">
            <td colspan="7" class="p-3">
              <div class="card border border-primary border-opacity-25 shadow-sm rounded-3 overflow-hidden">
                <div class="card-header bg-white py-2 px-3 d-flex justify-content-between align-items-center border-bottom">
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary"><i class="fa-solid fa-barcode me-1"></i> Danh Sách Serial</span>
                    <strong class="text-dark small">Model: ${m.model}</strong>
                    <span class="text-muted small">• ${m.tenHang}</span>
                  </div>
                  <span class="badge bg-secondary-subtle text-secondary small">Đang có ${totalUnits} thiết bị</span>
                </div>
                <div class="table-responsive">
                  <table class="table table-sm table-hover align-middle mb-0 bg-white" style="font-size: 0.84rem;">
                    <thead class="table-light">
                      <tr class="text-muted small">
                        <th style="width: 35px;" class="text-center">#</th>
                        <th style="min-width: 140px;">Serial Hãng (Mfg SN)</th>
                        <th style="min-width: 110px;">Mã Nội Bộ TA</th>
                        <th style="min-width: 120px;">Kho Hiện Tại</th>
                        <th style="min-width: 170px;">Chứng Từ Nhập Gốc</th>
                        <th style="min-width: 140px;">Nhà Cung Cấp</th>
                        <th style="min-width: 100px;">Tuổi Tồn</th>
                        <th style="min-width: 80px;">Bảo Hành</th>
                        <th class="text-end" style="min-width: 180px;">Thao Tác Nghiệp Vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${m.serials.map((s, sIdx) => {
                        const days = calculateStockAging(s.ngayNhap);
                        let agingBadge = `<span class="badge bg-success-subtle text-success border border-success-subtle">${days} ngày</span>`;
                        if (days > 90) agingBadge = `<span class="badge bg-danger text-white">${days} ngày (>90N)</span>`;
                        else if (days > 60) agingBadge = `<span class="badge bg-warning text-dark">${days} ngày (>60N)</span>`;
                        else if (days > 30) agingBadge = `<span class="badge bg-info-subtle text-info border border-info-subtle">${days} ngày</span>`;

                        return `
                          <tr>
                            <td class="text-center text-muted font-monospace small">${sIdx + 1}</td>
                            <!-- 1. Click Serial Hãng -> Mở 360° -->
                            <td>
                              <a href="javascript:void(0)" onclick="openSerial360Direct('${s.serial}')" class="font-monospace fw-bold text-primary text-decoration-none" title="Bấm để tra cứu Hồ Sơ Serial 360° toàn diện">
                                ${s.serial} <i class="fa-solid fa-arrow-up-right-from-square small ms-1 opacity-75"></i>
                              </a>
                            </td>
                            <!-- 2. Click Mã Nội Bộ -> Mở xem & in tem nhãn barcode -->
                            <td>
                              <a href="javascript:void(0)" onclick="openPrintBarcodeModal('${s.serial}')" class="badge bg-dark-subtle text-dark border font-monospace text-decoration-none" title="Bấm để xem và in Tem Mã Vạch / QR Code">
                                <i class="fa-solid fa-barcode me-1 text-secondary"></i>${s.internalId || s.serial}
                              </a>
                            </td>
                            <!-- 3. Click Kho -> Mở chuyển kho nhanh -->
                            <td>
                              <span class="badge bg-light text-dark border" style="cursor: pointer;" onclick="openQuickTransferModal('${s.serial}', '${s.kho}')" title="Bấm để điều chuyển máy này sang kho khác">
                                <i class="fa-solid fa-location-dot me-1 text-primary"></i>${s.kho} <i class="fa-solid fa-arrow-right-arrow-left text-muted small ms-1"></i>
                              </span>
                            </td>
                            <!-- 4. Click Chứng Từ Nhập -> Mở xem chi tiết phiếu nhập -->
                            <td>
                              ${s.maPhieuNhap ? `
                                <a href="javascript:void(0)" onclick="openVoucherDetail('NHAP', '${s.maPhieuNhap}')" class="font-monospace fw-semibold text-primary text-decoration-none" title="Bấm để xem chi tiết Phiếu Nhập Kho gốc">
                                  <i class="fa-solid fa-file-invoice me-1 text-secondary"></i>${s.maPhieuNhap}
                                </a>
                              ` : '<span class="text-muted">--</span>'}
                              <div class="text-muted" style="font-size: 0.75rem;"><i class="fa-regular fa-calendar me-1"></i>${s.ngayNhap || '--'}</div>
                            </td>
                            <!-- 5. Nhà Cung Cấp -->
                            <td>
                              <span class="small text-secondary"><i class="fa-regular fa-building me-1 text-muted"></i>${s.ncc || 'N/A'}</span>
                            </td>
                            <!-- 6. Tuổi tồn kho -->
                            <td>${agingBadge}</td>
                            <!-- 7. Hạn BH -->
                            <td><span class="badge bg-light text-secondary border font-monospace">${s.soThangBh || 12}T</span></td>
                            <!-- 8. Bộ nút thao tác chuyên biệt -->
                            <td class="text-end">
                              <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-outline-success py-1 px-2" onclick="quickExportSerial('${s.serial}')" title="Xuất kho máy này ngay (Tự động điền Serial vào phiếu xuất)">
                                  <i class="fa-solid fa-truck-fast me-1"></i> Xuất
                                </button>
                                <button class="btn btn-outline-primary py-1 px-2" onclick="openSerial360Direct('${s.serial}')" title="Xem lý lịch vòng đời 360°">
                                  <i class="fa-solid fa-fingerprint"></i>
                                </button>
                                <button class="btn btn-outline-warning text-dark py-1 px-2" onclick="openEditThietBiModal('${s.serial}')" title="Đính chính thông tin (sửa SN, Model, Kho)">
                                  <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn btn-outline-danger py-1 px-2" onclick="voidSerialDevice('${s.serial}')" title="Hủy thiết bị khỏi tồn kho (VOID)">
                                  <i class="fa-solid fa-ban"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        `;
      }
    });

    tbody.innerHTML = html;
  }

  // Cập nhật các thẻ KPI trên cùng
  function updateStockKpiCards(filteredSerials, modelList) {
    const elTotalUnits = document.getElementById('kpi-stock-total-units');
    const elTotalModels = document.getElementById('kpi-stock-total-models');
    const elFreshUnits = document.getElementById('kpi-stock-fresh-units');
    const elAgingUnits = document.getElementById('kpi-stock-aging-units');
    const elWhDesc = document.getElementById('kpi-stock-warehouses-desc');

    const totalUnits = filteredSerials.length;
    const totalModels = modelList.length;

    let freshUnits = 0;
    let agingUnits = 0;
    let whCounts = {};

    filteredSerials.forEach(s => {
      const days = calculateStockAging(s.ngayNhap);
      if (days <= 30) freshUnits++;
      else agingUnits++;

      const w = s.kho || 'Kho VP';
      whCounts[w] = (whCounts[w] || 0) + 1;
    });

    if (elTotalUnits) elTotalUnits.innerText = `${totalUnits} máy`;
    if (elTotalModels) elTotalModels.innerText = `${totalModels} model`;
    if (elFreshUnits) elFreshUnits.innerText = `${freshUnits} máy`;
    if (elAgingUnits) elAgingUnits.innerText = `${agingUnits} máy`;

    if (elWhDesc) {
      const descParts = Object.entries(whCounts).map(([w, c]) => `${w}: ${c}`);
      elWhDesc.innerText = descParts.length > 0 ? descParts.join(' • ') : '0 kho';
    }
  }

  // XUẤT KHO NHANH CHO 1 SERIAL
  function quickExportSerial(serial) {
    if (typeof switchTab === 'function') {
      switchTab('XuatKho');
    }
    setTimeout(() => {
      if (typeof addSerialFromSuggest === 'function') {
        addSerialFromSuggest(serial);
      } else {
        const inp = document.getElementById('xuat-serial-input');
        if (inp) {
          inp.value = serial;
          if (typeof handleSerialInputSubmit === 'function') handleSerialInputSubmit();
        }
      }
    }, 250);
  }

  // ĐÍNH CHÍNH THÔNG TIN THIẾT BỊ
  function openEditThietBiModal(serial) {
    if (typeof checkPermission === 'function' && !checkPermission(['QUẢN LÝ', 'ADMIN'], 'Đính chính thiết bị')) return;

    const item = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => s.serial === serial);
    if (!item) {
      Swal.fire('Lỗi', `Không tìm thấy thiết bị [${serial}]!`, 'error');
      return;
    }

    document.getElementById('edit-tb-old-serial').value = item.serial;
    document.getElementById('edit-tb-new-serial').value = item.serial;
    document.getElementById('edit-tb-internal-id').value = item.internalId || '';
    document.getElementById('edit-tb-model').value = item.model || '';
    document.getElementById('edit-tb-tenhang').value = item.tenHang || '';
    document.getElementById('edit-tb-reason').value = '';

    // Render danh sách kho
    const selKho = document.getElementById('edit-tb-kho');
    if (selKho) {
      let html = '';
      if (typeof INITIAL_WAREHOUSES !== 'undefined') {
        INITIAL_WAREHOUSES.filter(w => w.active !== false).forEach(w => {
          html += `<option value="${w.tenKho}" ${w.tenKho === item.kho ? 'selected' : ''}>${w.tenKho}</option>`;
        });
      }
      selKho.innerHTML = html;
    }

    const modal = new bootstrap.Modal(document.getElementById('editThietBiModal'));
    modal.show();
  }

  function submitEditThietBi() {
    const oldSerial = document.getElementById('edit-tb-old-serial').value.trim();
    const newSerial = document.getElementById('edit-tb-new-serial').value.trim();
    const internalId = document.getElementById('edit-tb-internal-id').value.trim();
    const model = document.getElementById('edit-tb-model').value.trim();
    const tenHang = document.getElementById('edit-tb-tenhang').value.trim();
    const kho = document.getElementById('edit-tb-kho').value;
    const reason = document.getElementById('edit-tb-reason').value.trim();

    if (!newSerial) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập Serial Hãng!', 'warning');
      return;
    }
    if (!reason) {
      Swal.fire('Thiếu lý do', 'Vui lòng nhập Lý do đính chính để ghi nhận nhật ký kiểm toán!', 'warning');
      return;
    }

    WarehouseAPI.updateThietBi({
      oldSerial: oldSerial,
      newSerial: newSerial,
      internalId: internalId,
      model: model,
      tenHang: tenHang,
      kho: kho,
      reason: reason
    }, function(res) {
      if (res && res.success) {
        const modalEl = document.getElementById('editThietBiModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        if (typeof markModulesDirty === 'function') {
          markModulesDirty(['TonKho', 'Serial360', 'LichSu', 'Dashboard']);
        }
        renderTonKho();

        Swal.fire({
          icon: 'success',
          title: 'Đính chính thành công!',
          text: res.message,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Lỗi', res ? res.message : 'Không thể cập nhật thiết bị!', 'error');
      }
    });
  }

  // XEM & IN TEM MÃ VẠCH BARCODE / QR
  function openPrintBarcodeModal(serial) {
    const item = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => s.serial === serial);
    if (!item) return;

    document.getElementById('lbl-internal-id').innerText = item.internalId || item.serial;
    document.getElementById('lbl-model').innerText = item.model;
    document.getElementById('lbl-ten-hang').innerText = item.tenHang || item.model;
    document.getElementById('lbl-serial').innerText = item.serial;
    document.getElementById('lbl-kho').innerText = item.kho || 'Kho VP';
    document.getElementById('lbl-bh').innerText = `${item.soThangBh || 12} tháng`;

    // Render SVG Barcode
    setTimeout(() => {
      try {
        if (typeof JsBarcode === 'function') {
          JsBarcode("#label-barcode-svg", item.serial, {
            format: "CODE128",
            width: 1.8,
            height: 40,
            displayValue: false,
            margin: 0
          });
        }
      } catch(e) {
        console.warn('JsBarcode render error:', e);
      }
    }, 150);

    const modal = new bootstrap.Modal(document.getElementById('printBarcodeModal'));
    modal.show();
  }

  function printDeviceLabel() {
    window.print();
  }

  // CHUYỂN KHO NHANH
  function openQuickTransferModal(serial, currentKho) {
    const item = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => s.serial === serial);
    if (!item) return;

    document.getElementById('transfer-serial-input').value = item.serial;
    document.getElementById('transfer-serial-display').innerText = item.serial;
    document.getElementById('transfer-model-display').innerText = `${item.model} • ${item.tenHang || ''}`;
    document.getElementById('transfer-current-kho').innerText = currentKho || item.kho;
    document.getElementById('transfer-note').value = '';

    const selKho = document.getElementById('transfer-target-kho');
    if (selKho) {
      let html = '';
      if (typeof INITIAL_WAREHOUSES !== 'undefined') {
        INITIAL_WAREHOUSES.filter(w => w.active !== false && w.tenKho !== (currentKho || item.kho)).forEach(w => {
          html += `<option value="${w.tenKho}">${w.tenKho}</option>`;
        });
      }
      selKho.innerHTML = html;
    }

    const modal = new bootstrap.Modal(document.getElementById('quickTransferStockModal'));
    modal.show();
  }

  function submitQuickTransferStock() {
    const serial = document.getElementById('transfer-serial-input').value;
    const targetKho = document.getElementById('transfer-target-kho').value;
    const note = document.getElementById('transfer-note').value.trim();

    if (!targetKho) {
      Swal.fire('Lỗi', 'Vui lòng chọn kho đích để chuyển!', 'warning');
      return;
    }

    WarehouseAPI.transferSingleDevice(serial, targetKho, note, function(res) {
      if (res && res.success) {
        const modalEl = document.getElementById('quickTransferStockModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        if (typeof markModulesDirty === 'function') {
          markModulesDirty(['TonKho', 'Serial360', 'LichSu', 'Dashboard']);
        }
        renderTonKho();

        Swal.fire({
          icon: 'success',
          title: 'Đã chuyển kho!',
          text: res.message,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Lỗi', res ? res.message : 'Không thể chuyển kho!', 'error');
      }
    });
  }

  // HỦY THIẾT BỊ AN TOÀN (VOID)
  function voidSerialDevice(serialCode) {
    if (typeof checkPermission === 'function' && !checkPermission(['QUẢN LÝ', 'ADMIN'], 'Hủy thiết bị (VOID)')) return;

    Swal.fire({
      title: 'Hủy thiết bị khỏi tồn kho (VOID)?',
      html: `Bạn đang thực hiện chuyển trạng thái Serial <strong>${serialCode}</strong> sang <strong>VOID</strong>.<br><small class="text-muted">Hành động này không xóa dữ liệu và bảo toàn lịch sử tra cứu Serial 360°.</small>`,
      input: 'text',
      inputPlaceholder: 'Nhập lý do hủy (ví dụ: Hàng rơi vỡ, lỗi đổi trả hãng, thanh lý...)',
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
    if (document.getElementById('filter-stock-kho')) document.getElementById('filter-stock-kho').value = '';
    if (document.getElementById('filter-stock-nhom')) document.getElementById('filter-stock-nhom').value = '';
    if (document.getElementById('filter-stock-keyword')) document.getElementById('filter-stock-keyword').value = '';
    if (document.getElementById('filter-stock-aging')) document.getElementById('filter-stock-aging').value = '';
    if (document.getElementById('filter-stock-status')) document.getElementById('filter-stock-status').value = 'IN_STOCK';
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
      // Giao diện mặc định: Khung hướng dẫn tra cứu
      container.innerHTML = `
        <div class="app-card p-5 text-center">
          <div class="mb-3">
            <span class="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
              <i class="fa-solid fa-fingerprint fs-1"></i>
            </span>
          </div>
          <h5 class="fw-bold text-dark">Tra Cứu Hồ Sơ Thiết Bị Toàn Diện (Serial 360°)</h5>
          <p class="text-muted small mx-auto" style="max-width: 560px;">
            Nhập Serial in trên tem máy hoặc bấm Quét mã để truy vết toàn bộ vòng đời thiết bị: từ lúc nhập kho, nhà cung cấp, xuất bán cho ai, thời hạn bảo hành và lịch sử xử lý kỹ thuật.
          </p>
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
