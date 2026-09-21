  /* ==================================================== */
  /* 9. NGHIỆP VỤ XUẤT KHO & BẢO HÀNH RIÊNG TỪNG SERIAL (YÊU CẦU C & 4.3) */
  /* ==================================================== */

  let CURRENT_DRAFT_XUAT_ITEMS = [];

  function setupXuatKhoForm() {
    const custHidden = document.getElementById('xuat-khach-select');
    const custInput = document.getElementById('xuat-khach-input');
    const activeCustomers = (typeof INITIAL_CUSTOMERS !== 'undefined' ? INITIAL_CUSTOMERS : []).filter(c => c.active !== false);
    
    if (activeCustomers.length > 0) {
      if (!custHidden.value || !activeCustomers.some(c => c.ten === custHidden.value)) {
        const firstCust = activeCustomers[0];
        custHidden.value = firstCust.ten;
        if (custInput) custInput.value = `${firstCust.ten} (${firstCust.sdt})`;
        const sdtEl = document.getElementById('xuat-sdt');
        const diaChiEl = document.getElementById('xuat-diachi');
        if (sdtEl) sdtEl.value = firstCust.sdt || '';
        if (diaChiEl) diaChiEl.value = firstCust.diaChi || '';
      }
    } else {
      custHidden.value = '';
      if (custInput) custInput.value = '';
    }

    const today = getLocalDateStr();
    document.getElementById('xuat-ngay').value = today;

    renderDraftXuatTable();
  }

  // Gợi ý thông minh Khách Hàng khi gõ
  function handleSuggestKhachXuat(query) {
    const q = (query || '').trim().toLowerCase();
    const dropdown = document.getElementById('xuat-khach-suggest');
    const custHidden = document.getElementById('xuat-khach-select');
    if (custHidden) custHidden.value = (query || '').trim();
    if (!dropdown) return;

    const customers = (typeof INITIAL_CUSTOMERS !== 'undefined' ? INITIAL_CUSTOMERS : []).filter(c => c.active !== false);
    const matched = customers.filter(c => {
      if (!q) return true;
      return (c.ten && c.ten.toLowerCase().includes(q)) ||
             (c.sdt && c.sdt.toLowerCase().includes(q)) ||
             (c.diaChi && c.diaChi.toLowerCase().includes(q)) ||
             (c.nguoiLienHe && c.nguoiLienHe.toLowerCase().includes(q));
    });

    if (matched.length === 0) {
      dropdown.innerHTML = '<div class="p-2 text-muted small text-center">Không tìm thấy khách hàng khớp. Bấm <b>+ Thêm KH</b> để tạo mới.</div>';
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = matched.slice(0, 10).map((c, idx) => `
      <div class="suggest-item ${idx === 0 ? 'active' : ''}" onclick="selectKhachXuat('${c.ten.replace(/'/g, "\\'")}', '${(c.sdt || '').replace(/'/g, "\\'")}', '${(c.diaChi || '').replace(/'/g, "\\'")}')">
        <div>
          <div class="fw-bold text-dark" style="font-size: 0.85rem;">${c.ten}</div>
          <div class="suggest-sub-text text-truncate" style="max-width: 250px;"><i class="fa-solid fa-location-dot me-1 text-secondary"></i>${c.diaChi || 'Chưa có địa chỉ'}</div>
        </div>
        <div class="text-end">
          <span class="text-primary font-monospace fw-semibold small"><i class="fa-solid fa-phone me-1"></i>${c.sdt || '--'}</span>
        </div>
      </div>
    `).join('');
    dropdown.style.display = 'block';
  }

  function selectKhachXuat(name, phone, address) {
    const custHidden = document.getElementById('xuat-khach-select');
    const custInput = document.getElementById('xuat-khach-input');
    const sdtEl = document.getElementById('xuat-sdt');
    const diaChiEl = document.getElementById('xuat-diachi');
    const dropdown = document.getElementById('xuat-khach-suggest');

    if (custHidden) custHidden.value = name;
    if (custInput) custInput.value = phone ? `${name} (${phone})` : name;
    if (sdtEl && phone !== undefined) sdtEl.value = phone;
    if (diaChiEl && address !== undefined) diaChiEl.value = address;
    if (dropdown) dropdown.style.display = 'none';

    // Focus sang ô quét serial
    const serialInput = document.getElementById('xuat-serial-input');
    if (serialInput) serialInput.focus();
  }

  function onSelectKhachHangXuat() {
    // Tương thích ngược
    const custName = document.getElementById('xuat-khach-select')?.value;
    const cust = INITIAL_CUSTOMERS.find(c => c.ten === custName);
    if (cust) {
      selectKhachXuat(cust.ten, cust.sdt, cust.diaChi);
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

    // Cập nhật lại input và dropdown tự chọn bản ghi vừa thêm mà không làm mất draft (Yêu cầu 4.3)
    const custHidden = document.getElementById('xuat-khach-select');
    const custInput = document.getElementById('xuat-khach-input');
    if (custHidden) custHidden.value = name;
    if (custInput) custInput.value = `${name} (${phone})`;

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

  // Gợi ý thông minh Serial / Thiết bị tồn kho khi gõ
  function handleSuggestSerialXuat(query) {
    const q = (query || '').trim().toLowerCase();
    const dropdown = document.getElementById('xuat-serial-suggest');
    if (!dropdown) return;

    if (!q) {
      dropdown.style.display = 'none';
      return;
    }

    const inStockSerials = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).filter(s => s.status === 'IN_STOCK');
    const matched = inStockSerials.filter(s => {
      return (s.serial && s.serial.toLowerCase().includes(q)) ||
             (s.internalId && s.internalId.toLowerCase().includes(q)) ||
             (s.model && s.model.toLowerCase().includes(q)) ||
             (s.name && s.name.toLowerCase().includes(q)) ||
             (s.tenHang && s.tenHang.toLowerCase().includes(q)) ||
             (s.kho && s.kho.toLowerCase().includes(q));
    });

    if (matched.length === 0) {
      dropdown.innerHTML = `
        <div class="p-2 text-muted small text-center">
          <i class="fa-solid fa-box-open me-1 text-secondary"></i> Không tìm thấy thiết bị nào tồn kho khớp với "${query}".
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = matched.slice(0, 15).map((s, idx) => `
      <div class="suggest-item ${idx === 0 ? 'active' : ''}" onclick="addSerialFromSuggest('${s.serial.replace(/'/g, "\\'")}')">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="suggest-badge-serial">${s.serial}</span>
            ${s.internalId && s.internalId !== s.serial ? `<span class="badge bg-light text-dark border p-1" style="font-size: 0.68rem;">${s.internalId}</span>` : ''}
          </div>
          <div class="suggest-sub-text text-truncate" style="max-width: 320px;">
            <strong class="text-dark">${s.model}</strong> • ${s.tenHang || s.name || ''}
          </div>
        </div>
        <div class="text-end">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.7rem;">${s.kho || 'Kho VP'}</span>
          <div class="suggest-sub-text mt-1">Lưu: ${s.daysInStock || s.soNgayLuuKho || 0} ngày</div>
        </div>
      </div>
    `).join('');
    dropdown.style.display = 'block';
  }

  function addSerialFromSuggest(sn) {
    const inp = document.getElementById('xuat-serial-input');
    const dropdown = document.getElementById('xuat-serial-suggest');
    if (dropdown) dropdown.style.display = 'none';
    if (inp) inp.value = '';
    addSerialToXuatDraft(sn);
    if (inp) inp.focus();
  }

  function handleSerialSuggestKeydown(event) {
    const dropdown = document.getElementById('xuat-serial-suggest');
    const inp = document.getElementById('xuat-serial-input');
    const isDropdownVisible = (dropdown && dropdown.style.display === 'block');

    if (isDropdownVisible) {
      const items = dropdown.querySelectorAll('.suggest-item');
      if (items.length > 0) {
        let currentIndex = -1;
        items.forEach((item, idx) => {
          if (item.classList.contains('active')) currentIndex = idx;
        });

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          currentIndex = (currentIndex + 1) % items.length;
          items.forEach((item, idx) => {
            if (idx === currentIndex) {
              item.classList.add('active');
              item.scrollIntoView({ block: 'nearest' });
            } else {
              item.classList.remove('active');
            }
          });
          return;
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          currentIndex = (currentIndex - 1 + items.length) % items.length;
          items.forEach((item, idx) => {
            if (idx === currentIndex) {
              item.classList.add('active');
              item.scrollIntoView({ block: 'nearest' });
            } else {
              item.classList.remove('active');
            }
          });
          return;
        } else if (event.key === 'Enter') {
          event.preventDefault();
          if (currentIndex >= 0 && items[currentIndex]) {
            items[currentIndex].click();
          } else {
            items[0].click();
          }
          return;
        } else if (event.key === 'Escape') {
          dropdown.style.display = 'none';
          return;
        }
      }
    }

    // Nếu ấn Enter mà dropdown không bật hoặc chưa chọn gợi ý -> Thực hiện thêm mã trực tiếp (dán/quét)
    if (event.key === 'Enter') {
      event.preventDefault();
      if (inp && inp.value.trim()) {
        if (dropdown) dropdown.style.display = 'none';
        addSerialToXuatDraft(inp.value.trim());
      }
    }
  }

  function addSerialToXuatDraft(rawInput) {
    const text = (rawInput || '').trim();
    if (!text) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập hoặc quét Serial hãng / Mã nội bộ!', 'warning');
      return;
    }

    // Hỗ trợ quét hoặc dán nhiều mã cùng lúc (ngăn cách bởi xuống dòng, dấu phẩy, chấm phẩy)
    const rawTokens = text.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean);
    if (rawTokens.length === 0) return;

    if (rawTokens.length === 1) {
      // 1. Quét hoặc nhập 1 mã
      const sn = rawTokens[0];
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

      const inp = document.getElementById('xuat-serial-input');
      if (inp) {
        inp.value = '';
        inp.focus();
      }
      renderDraftXuatTable();
      playBeepSound();
    } else {
      // 2. Nhập hoặc quét hàng loạt nhiều mã (Bộ PC hoặc dán nhiều serial)
      let addedCount = 0;
      let notFoundList = [];
      let notInStockList = [];
      let duplicateList = [];

      rawTokens.forEach(sn => {
        const target = SERIAL_DB.find(s => 
          s.serial.toLowerCase() === sn.toLowerCase() || 
          (s.internalId && s.internalId.toLowerCase() === sn.toLowerCase())
        );
        if (!target) {
          notFoundList.push(sn);
          return;
        }
        if (target.status !== 'IN_STOCK') {
          notInStockList.push(target.serial);
          return;
        }
        const alreadyInList = CURRENT_DRAFT_XUAT_ITEMS.some(i => i.serial.toLowerCase() === target.serial.toLowerCase());
        if (alreadyInList) {
          duplicateList.push(target.serial);
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
        addedCount++;
      });

      const inp = document.getElementById('xuat-serial-input');
      if (inp) {
        inp.value = '';
        inp.focus();
      }
      renderDraftXuatTable();
      playBeepSound();

      let msg = `Đã đưa thành công <b>${addedCount}</b> thiết bị / linh kiện vào phiếu xuất.`;
      if (duplicateList.length > 0) msg += `<br><span class="text-info">• Đã có trong phiếu (${duplicateList.length}): ${duplicateList.slice(0, 5).join(', ')}${duplicateList.length > 5 ? '...' : ''}</span>`;
      if (notInStockList.length > 0) msg += `<br><span class="text-warning">• Không còn tồn kho (${notInStockList.length}): ${notInStockList.slice(0, 5).join(', ')}${notInStockList.length > 5 ? '...' : ''}</span>`;
      if (notFoundList.length > 0) msg += `<br><span class="text-danger">• Không tìm thấy (${notFoundList.length}): ${notFoundList.slice(0, 5).join(', ')}${notFoundList.length > 5 ? '...' : ''}</span>`;

      Swal.fire({
        icon: addedCount > 0 ? 'success' : 'warning',
        title: addedCount > 0 ? 'Đã thêm nhiều mã vào phiếu xuất' : 'Không có mã hợp lệ',
        html: msg
      });
    }
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

    const khach = (document.getElementById('xuat-khach-select')?.value || document.getElementById('xuat-khach-input')?.value || '').trim();
    const sdt = document.getElementById('xuat-sdt').value.trim();
    const diachi = document.getElementById('xuat-diachi').value.trim();
    const kho = (document.getElementById('xuat-kho')?.value) || (CURRENT_DRAFT_XUAT_ITEMS[0]?.kho) || 'Kho Chính';
    const ngay = formatDateDisplay(document.getElementById('xuat-ngay').value) || formatDateDisplay(getLocalDateStr());

    if (!khach) {
      Swal.fire('Thiếu khách hàng', 'Vui lòng chọn hoặc nhập tên Khách hàng nhận máy!', 'warning');
      return;
    }

    document.getElementById('prev-xuat-khach').textContent = khach;
    document.getElementById('prev-xuat-sdt').textContent = sdt || 'Chưa có SĐT';
    if (document.getElementById('prev-xuat-kho')) document.getElementById('prev-xuat-kho').textContent = kho;
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
          <td><span class="badge bg-light text-dark border">${it.kho || 'Kho Chính'}</span></td>
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
    const khach = (document.getElementById('xuat-khach-select')?.value || document.getElementById('xuat-khach-input')?.value || '').trim();
    const sdt = document.getElementById('xuat-sdt').value.trim();
    const diachi = document.getElementById('xuat-diachi').value.trim();
    const kho = (document.getElementById('xuat-kho')?.value) || (CURRENT_DRAFT_XUAT_ITEMS[0]?.kho) || 'Kho Chính';
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

    const khach = (document.getElementById('xuat-khach-select')?.value || document.getElementById('xuat-khach-input')?.value || 'Khách hàng dự thảo').trim();
    const sdt = document.getElementById('xuat-sdt').value.trim();
    const diachi = document.getElementById('xuat-diachi').value.trim();
    const kho = (document.getElementById('xuat-kho')?.value) || (CURRENT_DRAFT_XUAT_ITEMS[0]?.kho) || 'Kho Chính';
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

  // =========================================================================
  // CHỨC NĂNG: TÍCH CHỌN HÀNG LOẠT THIẾT BỊ / LINH KIỆN TỒN KHO (BỘ PC & NHIỀU MÁY)
  // =========================================================================
  let SELECTED_BATCH_STOCK_SERIALS = new Set();

  function openSelectStockModalForXuat() {
    SELECTED_BATCH_STOCK_SERIALS.clear();

    const inStockList = SERIAL_DB.filter(s => s.status === 'IN_STOCK');
    if (inStockList.length === 0) {
      Swal.fire('Kho trống', 'Hiện tại không còn thiết bị nào ở trạng thái Tồn Kho (IN_STOCK)!', 'info');
      return;
    }

    // Nạp dropdown nhóm hàng
    const nhomSelect = document.getElementById('batch-stock-filter-nhom');
    if (nhomSelect) {
      const categories = [...new Set(INITIAL_PRODUCTS.map(p => p.nhom).filter(Boolean))].sort();
      nhomSelect.innerHTML = '<option value="">-- Tất cả nhóm hàng / linh kiện --</option>' + 
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // Nạp dropdown kho
    const khoSelect = document.getElementById('batch-stock-filter-kho');
    if (khoSelect) {
      const warehouses = [...new Set(SERIAL_DB.map(s => s.kho).filter(Boolean))].sort();
      khoSelect.innerHTML = '<option value="">-- Tất cả kho --</option>' + 
        warehouses.map(k => `<option value="${k}">${k}</option>`).join('');
    }

    const searchInput = document.getElementById('batch-stock-search');
    if (searchInput) searchInput.value = '';

    const checkAll = document.getElementById('batch-stock-check-all');
    if (checkAll) checkAll.checked = false;

    renderBatchStockTable();

    const modalEl = document.getElementById('selectStockBatchModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 350);
    }
  }

  function filterBatchStockTable() {
    renderBatchStockTable();
  }

  function renderBatchStockTable() {
    const tbody = document.getElementById('batch-stock-table-body');
    if (!tbody) return;

    const q = (document.getElementById('batch-stock-search')?.value || '').trim().toLowerCase();
    const filterNhom = document.getElementById('batch-stock-filter-nhom')?.value || '';
    const filterKho = document.getElementById('batch-stock-filter-kho')?.value || '';

    // Lọc thiết bị tồn kho
    const inStockList = SERIAL_DB.filter(s => s.status === 'IN_STOCK');

    const filtered = inStockList.filter(s => {
      if (filterKho && s.kho !== filterKho) return false;
      const prod = INITIAL_PRODUCTS.find(p => p.model === s.model);
      if (filterNhom && (!prod || prod.nhom !== filterNhom)) return false;

      if (q) {
        const matchModel = s.model && s.model.toLowerCase().includes(q);
        const matchSn = s.serial && s.serial.toLowerCase().includes(q);
        const matchInternal = s.internalId && s.internalId.toLowerCase().includes(q);
        const matchName = prod && prod.ten && prod.ten.toLowerCase().includes(q);
        const matchNhom = prod && prod.nhom && prod.nhom.toLowerCase().includes(q);
        if (!matchModel && !matchSn && !matchInternal && !matchName && !matchNhom) return false;
      }
      return true;
    });

    const infoEl = document.getElementById('batch-stock-total-info');
    if (infoEl) infoEl.textContent = `${filtered.length} / ${inStockList.length} thiết bị`;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4"><i class="fa-solid fa-box-open me-1"></i> Không tìm thấy thiết bị phù hợp trong kho</td></tr>';
      updateBatchStockSelectedBadge();
      return;
    }

    let html = '';
    filtered.forEach((s, idx) => {
      const prod = INITIAL_PRODUCTS.find(p => p.model === s.model);
      const isAlreadyInDraft = CURRENT_DRAFT_XUAT_ITEMS.some(i => i.serial.toLowerCase() === s.serial.toLowerCase());
      const isChecked = SELECTED_BATCH_STOCK_SERIALS.has(s.serial);

      html += `
        <tr class="${isChecked ? 'table-primary' : ''} ${isAlreadyInDraft ? 'table-light text-muted opacity-75' : 'cursor-pointer'}" 
            onclick="handleBatchStockRowClick(event, '${s.serial}', ${isAlreadyInDraft})">
          <td class="text-center" onclick="event.stopPropagation()">
            <input type="checkbox" class="form-check-input batch-stock-item-chk" 
                   value="${s.serial}" 
                   ${isChecked ? 'checked' : ''} 
                   ${isAlreadyInDraft ? 'disabled' : ''}
                   onchange="toggleBatchStockItem('${s.serial}', this.checked)">
          </td>
          <td>${idx + 1}</td>
          <td>
            <strong class="text-dark">${s.model}</strong>
            <div class="small text-secondary text-truncate" style="max-width: 240px;">${prod ? prod.ten : ''}</div>
            ${prod && prod.nhom ? `<span class="badge bg-light text-primary border" style="font-size:0.68rem;">${prod.nhom}</span>` : ''}
          </td>
          <td>
            <span class="font-monospace fw-bold text-primary">${s.serial}</span>
          </td>
          <td>
            <span class="badge bg-secondary font-monospace">${s.internalId || '--'}</span>
          </td>
          <td>
            <span class="badge bg-info text-dark font-monospace">${s.kho || 'Kho Chính'}</span>
          </td>
          <td>
            <span class="small">${prod?.defaultBh ? prod.defaultBh + ' tháng' : (s.soThangBh ? s.soThangBh + ' tháng' : '12 tháng')}</span>
          </td>
          <td class="font-monospace small text-muted">${s.ngayNhap || '--'}</td>
          <td class="text-center" onclick="event.stopPropagation()">
            ${isAlreadyInDraft 
              ? '<span class="badge bg-secondary small">Đã trong phiếu</span>' 
              : `<button class="btn btn-xs btn-outline-primary py-0 px-2" style="font-size:0.75rem;" onclick="addSingleBatchStockToDraft('${s.serial}')"><i class="fa-solid fa-plus"></i> Thêm</button>`}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    updateBatchStockSelectedBadge();
  }

  function handleBatchStockRowClick(evt, serial, isAlreadyInDraft) {
    if (isAlreadyInDraft) return;
    const isChecked = SELECTED_BATCH_STOCK_SERIALS.has(serial);
    toggleBatchStockItem(serial, !isChecked);
    renderBatchStockTable();
  }

  function toggleBatchStockItem(serial, checked) {
    if (checked) {
      SELECTED_BATCH_STOCK_SERIALS.add(serial);
    } else {
      SELECTED_BATCH_STOCK_SERIALS.delete(serial);
    }
    updateBatchStockSelectedBadge();

    const chk = document.querySelector(`.batch-stock-item-chk[value="${serial}"]`);
    if (chk) chk.checked = checked;
  }

  function toggleSelectAllBatchStock(checked) {
    const chks = document.querySelectorAll('.batch-stock-item-chk:not(:disabled)');
    chks.forEach(c => {
      c.checked = checked;
      if (checked) {
        SELECTED_BATCH_STOCK_SERIALS.add(c.value);
      } else {
        SELECTED_BATCH_STOCK_SERIALS.delete(c.value);
      }
    });
    renderBatchStockTable();
  }

  function clearAllBatchStockSelection() {
    SELECTED_BATCH_STOCK_SERIALS.clear();
    const checkAll = document.getElementById('batch-stock-check-all');
    if (checkAll) checkAll.checked = false;
    renderBatchStockTable();
  }

  function updateBatchStockSelectedBadge() {
    const count = SELECTED_BATCH_STOCK_SERIALS.size;
    const badge = document.getElementById('batch-stock-selected-badge');
    if (badge) badge.innerHTML = `<i class="fa-solid fa-check-circle me-1"></i>Đã chọn: <b>${count}</b> linh kiện`;
    const btnCount = document.getElementById('batch-stock-btn-count');
    if (btnCount) btnCount.textContent = count;
    const applyBtn = document.getElementById('btn-apply-batch-stock');
    if (applyBtn) applyBtn.disabled = count === 0;
  }

  function addSingleBatchStockToDraft(serial) {
    addSerialToXuatDraft(serial);
    renderBatchStockTable();
  }

  function applyBatchStockToXuatDraft() {
    if (SELECTED_BATCH_STOCK_SERIALS.size === 0) {
      Swal.fire('Chưa chọn', 'Vui lòng tích chọn ít nhất 1 linh kiện/thiết bị!', 'warning');
      return;
    }

    let addedCount = 0;
    SELECTED_BATCH_STOCK_SERIALS.forEach(sn => {
      const target = SERIAL_DB.find(s => s.serial.toLowerCase() === sn.toLowerCase() && s.status === 'IN_STOCK');
      if (target) {
        const alreadyInList = CURRENT_DRAFT_XUAT_ITEMS.some(i => i.serial.toLowerCase() === target.serial.toLowerCase());
        if (!alreadyInList) {
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
          addedCount++;
        }
      }
    });

    renderDraftXuatTable();
    playBeepSound();

    const modalEl = document.getElementById('selectStockBatchModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào phiếu xuất!',
      html: `Đã đưa thành công <strong>${addedCount} linh kiện / thiết bị</strong> vào danh sách xuất kho.`,
      timer: 1800,
      showConfirmButton: false
    });
  }

  // Xuất ra toàn cục
  if (typeof window !== 'undefined') {
    window.setupXuatKhoForm = setupXuatKhoForm;
    window.handleSuggestKhachXuat = handleSuggestKhachXuat;
    window.selectKhachXuat = selectKhachXuat;
    window.onSelectKhachHangXuat = onSelectKhachHangXuat;
    window.handleSuggestSerialXuat = handleSuggestSerialXuat;
    window.addSerialFromSuggest = addSerialFromSuggest;
    window.handleSerialSuggestKeydown = handleSerialSuggestKeydown;
    window.addSerialToXuatDraft = addSerialToXuatDraft;
    window.openSelectStockModalForXuat = openSelectStockModalForXuat;
    window.applyBatchStockToXuatDraft = applyBatchStockToXuatDraft;
  }
