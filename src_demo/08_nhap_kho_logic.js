  /* ==================================================== */
  /* 8. NGHIỆP VỤ NHẬP KHO ĐA MODEL & EXCEL (YÊU CẦU B & A) */
  /* ==================================================== */

  let CURRENT_DRAFT_NHAP_ITEMS = [];
  let EXCEL_PARSED_ITEMS = [];
  let CURRENT_NHAP_REQUEST_ID = null;

  function setupNhapKhoForm() {
    // 1. Điền thông tin NCC: Để trắng 100% theo chuẩn hệ thống
    const nccHidden = document.getElementById('nhap-ncc');
    const nccInput = document.getElementById('nhap-ncc-input');
    if (nccHidden) nccHidden.value = '';
    if (nccInput) {
      nccInput.value = '';
      nccInput.classList.remove('is-invalid', 'is-valid');
    }

    // 2. Điền danh sách Kho (từ INITIAL_WAREHOUSES)
    const khoSelect = document.getElementById('nhap-kho');
    if (khoSelect) {
      khoSelect.innerHTML = '';
      const activeWarehouses = (typeof INITIAL_WAREHOUSES !== 'undefined' ? INITIAL_WAREHOUSES : []).filter(w => w.active !== false);
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
    }

    // 3. Thông tin Model: Để trắng 100% theo chuẩn hệ thống
    const modelHidden = document.getElementById('nhap-select-model');
    const modelInput = document.getElementById('nhap-model-input');
    if (modelHidden) modelHidden.value = '';
    if (modelInput) modelInput.value = '';

    // 4. Ngày hôm nay
    const today = getLocalDateStr();
    const ngayNhapEl = document.getElementById('nhap-ngay');
    if (ngayNhapEl) ngayNhapEl.value = today;

    // 5. Khởi tạo danh sách Loại Hàng
    if (typeof syncLoaiHangDropdowns === 'function') {
      syncLoaiHangDropdowns();
    }

    // 6. Reset thông tin info box model
    onSelectModelNhap('');
    if (typeof revalidateAllDraftNhapItems === 'function') {
      revalidateAllDraftNhapItems();
    } else {
      renderDraftNhapTable();
    }
  }

  // Gợi ý thông minh Nhà Cung Cấp khi gõ (Hiển thị đầy đủ 100% NCC, không cắt bớt 10 dòng)
  function handleSuggestNccNhap(query) {
    const q = (query || '').trim().toLowerCase();
    const dropdown = document.getElementById('nhap-ncc-suggest');
    if (!dropdown) return;

    dropdown.style.zIndex = '1050';
    dropdown.style.position = 'absolute';
    dropdown.style.maxHeight = '280px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';

    const suppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => s.active !== false);
    const matched = suppliers.filter(s => {
      if (!q) return true;
      const tt = (s.tenTat || '').toLowerCase();
      const td = (s.tenDayDu || '').toLowerCase();
      const combined = `${tt} - ${td}`.toLowerCase();
      return tt.includes(q) || td.includes(q) || combined.includes(q) || q.includes(tt) || (s.sdt && s.sdt.toLowerCase().includes(q));
    });

    if (matched.length === 0) {
      dropdown.innerHTML = `
        <div class="p-3 text-center text-muted small">
          <i class="fa-solid fa-circle-exclamation text-warning me-1"></i>
          Không tìm thấy NCC "<strong>${escapeHtml(query)}</strong>".<br>
          <span class="text-secondary" style="font-size:0.75rem;">Mọi thông tin NCC mới phải được thêm từ <b>Danh Mục Hệ Thống</b>.</span>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    // Hiển thị toàn bộ danh sách kèm thanh cuộn để thấy mọi NCC (kể cả Trí Việt)
    dropdown.innerHTML = matched.map((s, idx) => `
      <div class="suggest-item ${idx === 0 ? 'active' : ''}" onclick="selectNccNhap('${s.tenTat.replace(/'/g, "\\'")}', '${(s.tenDayDu || '').replace(/'/g, "\\'")}')">
        <div>
          <div class="fw-bold text-primary" style="font-size: 0.85rem;">${s.tenTat}</div>
          <div class="suggest-sub-text text-truncate" style="max-width: 250px;">${s.tenDayDu || ''}</div>
        </div>
        <div class="text-end">
          <small class="text-muted font-monospace">${s.sdt || ''}</small>
        </div>
      </div>
    `).join('');
    dropdown.style.display = 'block';
  }

  function selectNccNhap(tenTat, tenDayDu) {
    const nccHidden = document.getElementById('nhap-ncc');
    const nccInput = document.getElementById('nhap-ncc-input');
    const dropdown = document.getElementById('nhap-ncc-suggest');
    if (nccHidden) nccHidden.value = tenTat;
    if (nccInput) {
      nccInput.value = tenDayDu ? `${tenTat} - ${tenDayDu}` : tenTat;
      nccInput.classList.remove('is-invalid', 'is-valid');
    }
    if (dropdown) dropdown.style.display = 'none';
  }

  // Khóa cứng kiểm tra NCC khi rời khỏi ô nhập (Chuẩn hóa tự động, không popup gián đoạn)
  function onBlurNccNhap() {
    setTimeout(() => {
      const input = document.getElementById('nhap-ncc-input');
      const hidden = document.getElementById('nhap-ncc');
      if (!input) return;
      const typed = (input.value || '').trim();
      if (!typed) {
        if (hidden) hidden.value = '';
        input.classList.remove('is-invalid', 'is-valid');
        return;
      }

      const suppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => s.active !== false);
      const matched = suppliers.find(s => {
        const tt = (s.tenTat || '').toLowerCase();
        const td = (s.tenDayDu || '').toLowerCase();
        const combined = `${tt} - ${td}`.toLowerCase();
        return tt === typed.toLowerCase() || td === typed.toLowerCase() || combined === typed.toLowerCase();
      });

      if (matched) {
        if (hidden) hidden.value = matched.tenTat;
        input.value = matched.tenDayDu ? `${matched.tenTat} - ${matched.tenDayDu}` : matched.tenTat;
        input.classList.remove('is-invalid', 'is-valid');
      } else {
        // Nếu không khớp NCC danh mục: reset hidden, submit sẽ kiểm tra chặn lại
        if (hidden) hidden.value = '';
      }
    }, 250);
  }

  // Gợi ý thông minh Model khi gõ (Chuẩn ERP, tinh gọn)
  function handleSuggestModelNhap(query) {
    const q = (query || '').trim().toLowerCase();
    const dropdown = document.getElementById('nhap-model-suggest');
    if (!dropdown) return;

    const products = (typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []).filter(p => p.active !== false);
    const matched = products.filter(p => {
      if (!q) return true;
      const m = (p.model || '').toLowerCase();
      const t = (p.ten || '').toLowerCase();
      const combined = `${m} - ${t}`.toLowerCase();
      return m.includes(q) || t.includes(q) || combined.includes(q) || q.includes(m) ||
             (p.hang && p.hang.toLowerCase().includes(q)) ||
             (p.nhom && p.nhom.toLowerCase().includes(q)) ||
             (p.nhomHang && p.nhomHang.toLowerCase().includes(q));
    });

    if (matched.length === 0) {
      dropdown.innerHTML = `
        <div class="p-3 text-center text-muted small">
          <i class="fa-solid fa-circle-exclamation text-warning me-1"></i>
          Không tìm thấy Model "<strong>${escapeHtml(query)}</strong>".<br>
          <span class="text-secondary" style="font-size:0.75rem;">Mọi Model mới phải được thêm từ <b>Danh Mục Hệ Thống</b>.</span>
        </div>
      `;
      dropdown.style.display = 'block';
      const modelHidden = document.getElementById('nhap-select-model');
      if (modelHidden) modelHidden.value = '';
      onSelectModelNhap(query);
      return;
    }

    dropdown.innerHTML = matched.slice(0, 12).map((p, idx) => `
      <div class="suggest-item ${idx === 0 ? 'active' : ''}" onclick="selectModelNhap('${p.model.replace(/'/g, "\\'")}')">
        <div>
          <div class="suggest-badge-model text-primary">${p.model}</div>
          <div class="suggest-sub-text text-truncate" style="max-width: 260px;">${p.ten}</div>
        </div>
        <div class="text-end">
          <span class="badge bg-light text-dark border p-1" style="font-size: 0.68rem;">${p.hang || '--'}</span>
          <div class="suggest-sub-text mt-1">BH: ${p.defaultBh || 12}th</div>
        </div>
      </div>
    `).join('');
    dropdown.style.display = 'block';
  }

  function selectModelNhap(modelCode) {
    const modelHidden = document.getElementById('nhap-select-model');
    const modelInput = document.getElementById('nhap-model-input');
    const dropdown = document.getElementById('nhap-model-suggest');
    if (modelHidden) modelHidden.value = modelCode;
    if (modelInput) modelInput.value = modelCode;
    if (dropdown) dropdown.style.display = 'none';
    onSelectModelNhap(modelCode);

    // Chuyển focus sang ô serial nhập tiếp
    const serialInput = document.getElementById('nhap-serial-input');
    if (serialInput) serialInput.focus();
  }

  function selectModelFromDropdown(modelCode) {
    selectModelNhap(modelCode);
  }

  function onInputModelNhap(typedVal) {
    handleSuggestModelNhap(typedVal);
  }

  function onSelectModelNhap(modelParam) {
    const modelInput = document.getElementById('nhap-model-input');
    const modelHidden = document.getElementById('nhap-select-model');
    const val = (modelParam || (modelInput ? modelInput.value : '') || (modelHidden ? modelHidden.value : '')).trim();
    
    const prod = (typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []).find(p => 
      p.model.toLowerCase() === val.toLowerCase() ||
      p.ten.toLowerCase() === val.toLowerCase()
    );
    const infoBox = document.getElementById('nhap-model-info');

    if (prod) {
      if (modelHidden) modelHidden.value = prod.model;
      infoBox.innerHTML = `
        <div class="fw-semibold text-primary">${escapeHtml(prod.ten)}</div>
        <div class="text-muted">Mã: <strong class="font-monospace text-dark">${escapeHtml(prod.model)}</strong> | Hãng: <strong>${escapeHtml(prod.hang || '--')}</strong> | Nhóm: <strong>${escapeHtml(prod.nhom || prod.nhomHang || 'Thiết bị')}</strong> | BH mặc định: <strong>${prod.defaultBh || 12} tháng</strong></div>
      `;
    } else {
      if (modelHidden) modelHidden.value = '';
      if (val) {
        infoBox.innerHTML = `
          <div class="text-danger small">
            <i class="fa-solid fa-circle-xmark me-1"></i> Model: <strong class="font-monospace text-dark">${escapeHtml(val)}</strong> (Chưa có trong Danh Mục Hệ Thống)
          </div>
        `;
      } else {
        infoBox.innerHTML = '<span class="text-muted small">Chưa chọn Model</span>';
      }
    }
  }

  function generateSequentialInternalIdsForInput() {
    const textarea = document.getElementById('nhap-serial-input');
    const existingLines = textarea ? textarea.value.split('\n').filter(l => l.trim().length > 0) : [];
    const defaultQty = existingLines.length > 0 ? existingLines.length : 1;

    Swal.fire({
      title: 'Tự sinh mã Serial nội bộ',
      html: `
        <div class="text-start mb-2">
          <label class="form-label fw-bold small text-muted">Số lượng Serial cần sinh:</label>
          <input type="number" id="swal-gen-qty" class="form-control form-control-lg fw-bold text-primary text-center" min="1" max="500" value="${defaultQty}">
          <div class="form-text small text-muted mt-2">
            <i class="fa-solid fa-circle-info text-primary me-1"></i> Hệ thống sẽ tự động cấp dải mã tăng dần dạng <code>TA-YYMMDD-XXXXXX</code>, đảm bảo <b>không bao giờ trùng</b> với các lần nhập trước.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-wand-magic-sparkles me-1"></i> Sinh mã & Điền vào ô nhập',
      cancelButtonText: 'Hủy',
      focusConfirm: false,
      didOpen: () => {
        const inp = document.getElementById('swal-gen-qty');
        if (inp) {
          inp.focus();
          inp.select();
        }
      },
      preConfirm: () => {
        const qtyVal = parseInt(document.getElementById('swal-gen-qty').value, 10);
        if (isNaN(qtyVal) || qtyVal <= 0) {
          Swal.showValidationMessage('Vui lòng nhập số lượng lớn hơn 0!');
          return false;
        }
        if (qtyVal > 500) {
          Swal.showValidationMessage('Số lượng tối đa một lần sinh là 500 serial!');
          return false;
        }
        return qtyVal;
      }
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        const count = res.value;
        const generatedList = [];
        for (let i = 0; i < count; i++) {
          generatedList.push(generateSequentialInternalAssetId());
        }

        if (textarea) {
          const currentVal = textarea.value.trim();
          if (currentVal.length > 0) {
            textarea.value = currentVal + '\n' + generatedList.join('\n');
          } else {
            textarea.value = generatedList.join('\n');
          }
          if (typeof updateNhapSerialCounter === 'function') {
            updateNhapSerialCounter();
          }
          textarea.focus();
        }

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Đã sinh thành công ${count} mã Serial vào ô nhập!`,
          showConfirmButton: false,
          timer: 2500
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
    // 1. BẮT BUỘC PHẢI CÓ NHÀ CUNG CẤP HỢP LỆ (FAIL-FAST)
    const nccInputEl = document.getElementById('nhap-ncc-input');
    const nccHiddenEl = document.getElementById('nhap-ncc');
    const typedNcc = (nccInputEl?.value || '').trim();
    const hiddenNcc = (nccHiddenEl?.value || '').trim();

    const suppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => s.active !== false);
    const matchedNcc = suppliers.find(s => {
      const tt = (s.tenTat || '').toLowerCase();
      const td = (s.tenDayDu || '').toLowerCase();
      const combined = `${tt} - ${td}`.toLowerCase();
      return (hiddenNcc && (tt === hiddenNcc.toLowerCase() || td === hiddenNcc.toLowerCase())) ||
             tt === typedNcc.toLowerCase() || td === typedNcc.toLowerCase() || combined === typedNcc.toLowerCase();
    });

    if (!matchedNcc || !typedNcc) {
      playBeepSound();
      if (nccInputEl) {
        nccInputEl.classList.add('is-invalid');
        nccInputEl.focus();
      }
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn Nhà Cung Cấp',
        html: `Nhà Cung Cấp "<strong>${escapeHtml(typedNcc || 'Chưa nhập')}</strong>" chưa có trong Danh mục hoặc để trống.<br><br><span class="text-muted small">Quy chuẩn hệ thống: Bắt buộc phải chọn NCC hợp lệ từ <b>Danh Mục Hệ Thống</b> trước khi thêm thiết bị vào Draft.</span>`,
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    // Đồng bộ chuẩn giá trị hidden và input
    if (nccHiddenEl) nccHiddenEl.value = matchedNcc.tenTat;
    if (nccInputEl) {
      nccInputEl.value = matchedNcc.tenDayDu ? `${matchedNcc.tenTat} - ${matchedNcc.tenDayDu}` : matchedNcc.tenTat;
      nccInputEl.classList.remove('is-invalid');
    }

    // 2. BẮT BUỘC PHẢI CHỌN KHO NHẬP (FAIL-FAST)
    const khoEl = document.getElementById('nhap-kho');
    const kho = (khoEl?.value || '').trim();
    if (!kho) {
      playBeepSound();
      if (khoEl) {
        khoEl.classList.add('is-invalid');
        khoEl.focus();
      }
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn Kho nhập',
        text: 'Vui lòng chọn Kho nhận hàng hợp lệ trước khi đưa máy vào danh sách Draft!',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }
    if (khoEl) khoEl.classList.remove('is-invalid');

    const modelHiddenVal = (document.getElementById('nhap-select-model')?.value || '').trim();
    const modelInputVal = (document.getElementById('nhap-model-input')?.value || '').trim();
    const targetModel = modelHiddenVal || modelInputVal;

    // 3. BẮT BUỘC MODEL PHẢI CÓ TRONG DANH MỤC INITIAL_PRODUCTS
    const prod = (typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []).find(p => 
      p.model.toLowerCase() === targetModel.toLowerCase() ||
      p.ten.toLowerCase() === targetModel.toLowerCase()
    );

    if (!prod) {
      playBeepSound();
      Swal.fire({
        icon: 'warning',
        title: 'Model chưa có trong Danh mục',
        html: `Model "<strong>${escapeHtml(targetModel || 'Chưa nhập')}</strong>" chưa có trong danh mục sản phẩm.<br><br><span class="text-muted small">Quy chuẩn hệ thống: Mọi Model mới phải được tạo trước tại tab <b>Danh Mục Hệ Thống</b>.</span>`,
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    const model = prod.model; // Chuẩn hóa đúng mã model chính thức từ danh mục
    const loaiHang = document.getElementById('nhap-item-loai-hang')?.value || document.getElementById('nhap-loai-hang')?.value || 'Chính Hãng';
    const text = document.getElementById('nhap-serial-input').value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      Swal.fire('Thiếu dữ liệu', 'Vui lòng nhập hoặc quét ít nhất một Serial hãng in trên máy!', 'warning');
      return;
    }

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
        loaiHang: loaiHang,
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
          <td data-label="Model"><strong class="text-primary">${escapeHtml(item.model)}</strong></td>
          <td data-label="Loại Hàng"><span class="badge bg-secondary-subtle text-dark border">${escapeHtml(item.loaiHang || 'Chính Hãng')}</span></td>
          <td data-label="Serial Hãng"><span class="font-monospace fw-bold">${escapeHtml(item.serial)}</span></td>
          <td data-label="Mã Nội Bộ"><span class="badge bg-secondary font-monospace">${escapeHtml(item.internalId)}</span></td>
          <td data-label="Kho Nhập">${escapeHtml(item.kho)}</td>
          <td data-label="Validation">
            ${item.isValid 
              ? '<span class="badge bg-success"><i class="fa-solid fa-check"></i> Hợp lệ</span>' 
              : `<span class="badge bg-danger mb-1"><i class="fa-solid fa-xmark"></i> Trùng lặp</span><br><small class="text-danger">${escapeHtml(item.errorMessage)}</small>`}
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
        CURRENT_NHAP_REQUEST_ID = null;
        renderDraftNhapTable();
      }
    });
  }

  let IS_PROCESSING_NHAP = false;

  function saveDraftNhapVoucher(isConfirmed) {
    if (IS_PROCESSING_NHAP) return;

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

    // 1. Kiểm tra Nhà Cung Cấp bắt buộc phải từ danh mục
    const nccInput = (document.getElementById('nhap-ncc')?.value || document.getElementById('nhap-ncc-input')?.value || '').trim();
    const activeSuppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => s.active !== false);
    const validSupplier = activeSuppliers.find(s => 
      (s.tenTat && s.tenTat.toLowerCase() === nccInput.toLowerCase()) ||
      (s.tenDayDu && s.tenDayDu.toLowerCase() === nccInput.toLowerCase()) ||
      (`${s.tenTat} - ${s.tenDayDu}`.toLowerCase() === nccInput.toLowerCase())
    );

    if (!validSupplier) {
      playBeepSound();
      Swal.fire({
        icon: 'warning',
        title: 'Nhà Cung Cấp chưa có trong Danh mục',
        html: `Nhà cung cấp "<strong>${escapeHtml(nccInput || 'Chưa chọn')}</strong>" chưa có trong hệ thống.<br><br><span class="text-muted small">Quy chuẩn hệ thống: Mọi Nhà Cung Cấp phải được tạo trước tại tab <b>Danh Mục Hệ Thống</b>.</span>`,
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }
    const ncc = validSupplier.tenTat;

    // 2. Kiểm tra toàn bộ Model trong draft bắt buộc phải thuộc danh mục
    const invalidItem = CURRENT_DRAFT_NHAP_ITEMS.find(it => {
      return !(typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []).some(p => p.model.toLowerCase() === it.model.toLowerCase());
    });
    if (invalidItem) {
      playBeepSound();
      Swal.fire({
        icon: 'error',
        title: 'CÓ MODEL CHƯA KHAI BÁO!',
        html: `Thiết bị mang Model <strong>"${escapeHtml(invalidItem.model)}"</strong> chưa có trong danh mục sản phẩm!<br><br>Vui lòng khai báo Model tại tab <strong>Danh Mục Hệ Thống</strong> trước khi xác nhận nhập kho.`
      });
      return;
    }

    const kho = document.getElementById('nhap-kho').value;
    const generalLoaiHang = document.getElementById('nhap-loai-hang')?.value || 'Chính Hãng';
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
      loaiHang: generalLoaiHang,
      status: isConfirmed ? 'CONFIRMED' : 'DRAFT',
      nguoiTao: CURRENT_USER_NAME,
      ghiChu: ghiChu,
      customFields: {},
      items: CURRENT_DRAFT_NHAP_ITEMS.map(i => ({
        model: i.model,
        serial: i.serial,
        internalId: i.internalId,
        kho: i.kho,
        loaiHang: i.loaiHang || generalLoaiHang
      })),
      history: [
        { time: nowStr, user: CURRENT_USER_NAME, action: isConfirmed ? 'TẠO PHIẾU' : 'LƯU NHÁP', note: isConfirmed ? `Khởi tạo phiếu nhập CONFIRMED từ NCC ${ncc}` : 'Lưu nháp DRAFT phiếu nhập' }
      ]
    };

    if (isConfirmed) {
      // KHÓA NÚT BẤM CHỐNG DOUBLE CLICK
      IS_PROCESSING_NHAP = true;
      const btnConfirm = document.getElementById('btn-confirm-nhapkho') || document.querySelector('button[onclick*="saveDraftNhapVoucher(true)"]');
      const originalBtnText = btnConfirm ? btnConfirm.innerHTML : '';
      if (btnConfirm) {
        btnConfirm.disabled = true;
        btnConfirm.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Đang xác nhận lên máy chủ...';
      }

      function unlockNhapButton() {
        IS_PROCESSING_NHAP = false;
        if (btnConfirm) {
          btnConfirm.disabled = false;
          btnConfirm.innerHTML = originalBtnText || '<i class="fa-solid fa-check-double me-1"></i> Xác Nhận Nhập Kho';
        }
      }

      // TẠO HOẶC TÁI SỬ DỤNG REQUEST ID DUY NHẤT (IDEMPOTENCY KEY)
      if (!CURRENT_NHAP_REQUEST_ID) {
        CURRENT_NHAP_REQUEST_ID = 'TX-NK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
      }
      const requestId = CURRENT_NHAP_REQUEST_ID;

      const itemsByModel = {};
      CURRENT_DRAFT_NHAP_ITEMS.forEach(it => {
        if (!itemsByModel[it.model]) {
          itemsByModel[it.model] = {
            model: it.model,
            tenHang: it.tenHang || it.model,
            nhomHang: it.nhom || 'Khác',
            serials: []
          };
        }
        itemsByModel[it.model].serials.push(it.serial);
      });

      const payload = {
        requestId: requestId,
        maPhieu: maPhieu,
        ncc: ncc,
        kho: kho,
        loaiHang: generalLoaiHang,
        ngay: ngay,
        ngayNhap: ngay,
        ghiChu: ghiChu,
        items: Object.values(itemsByModel)
      };

      // HÀM CHỈ CHẠY KHI BACKEND GOOGLE SHEETS THỰC SỰ XÁC NHẬN THÀNH CÔNG
      function finalizeNhapKhoSuccess(serverRes) {
        // 1. Thêm vào VOUCHERS_DB
        VOUCHERS_DB.nhap.unshift(voucherRecord);

        // 2. Thêm vào SERIAL_DB
        CURRENT_DRAFT_NHAP_ITEMS.forEach(item => {
          const prod = INITIAL_PRODUCTS.find(p => p.model === item.model);
          const itemLoaiHang = item.loaiHang || generalLoaiHang;

          const oldIndex = SERIAL_DB.findIndex(s => s.serial.toLowerCase() === item.serial.toLowerCase());
          let oldTimeline = [];
          if (oldIndex !== -1) {
            oldTimeline = SERIAL_DB[oldIndex].timeline || [];
            SERIAL_DB.splice(oldIndex, 1);
          }

          SERIAL_DB.unshift({
            serial: item.serial,
            internalId: item.internalId,
            model: item.model,
            tenHang: item.tenHang,
            nhom: item.nhom,
            loaiHang: itemLoaiHang,
            condition: itemLoaiHang,
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
              { date: nowStr, user: CURRENT_USER_NAME, action: 'Nhập kho', note: `Nhập kho theo phiếu ${maPhieu} (${itemLoaiHang}) từ NCC ${ncc}` },
              ...oldTimeline
            ]
          });
        });

        recordAuditLog('XÁC NHẬN NHẬP KHO', `Phiếu ${maPhieu} (${CURRENT_DRAFT_NHAP_ITEMS.length} máy - ${generalLoaiHang})`, 'DRAFT', 'CONFIRMED', `Nhập kho từ ${ncc}`, [], 'Nhập kho', '', maPhieu);

        // 3. Lưu trữ an toàn vào localStorage
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
            localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
          }
        } catch(e) {}

        // 4. DỌN SẠCH GIỎ HÀNG CHỈ SAU KHI THÀNH CÔNG THỰC TẾ
        const importedCount = CURRENT_DRAFT_NHAP_ITEMS.length;
        CURRENT_DRAFT_NHAP_ITEMS = [];
        CURRENT_NHAP_REQUEST_ID = null;
        if (typeof window !== 'undefined') window.CURRENT_DRAFT_NHAP_ITEMS = [];
        const gcEl = document.getElementById('nhap-ghichu');
        if (gcEl) gcEl.value = '';
        renderDraftNhapTable();

        // 5. Đánh dấu dirty và cập nhật Dashboard & Tồn Kho
        if (typeof markModulesDirty === 'function') {
          markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'Serial360']);
        }
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTonKho === 'function') renderTonKho();

        unlockNhapButton();

        Swal.fire({
          icon: 'success',
          title: 'Nhập kho thành công!',
          html: `Phiếu nhập <strong>${maPhieu}</strong> đã được ghi nhận vào hệ thống Google Sheets.<br>Số lượng: <strong>${importedCount} thiết bị</strong>.<br>Trạng thái: <span class="badge bg-success">CONFIRMED</span>`
        });
      }

      // XỬ LÝ LỖI TỪ BACKEND: TUYỆT ĐỐI KHÔNG XÓA DỮ LIỆU ĐANG NHẬP
      function handleNhapKhoError(err) {
        unlockNhapButton();
        console.error('[Lỗi Nhập Kho Từ Máy Chủ]', err);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi Ghi Nhận Nhập Kho!',
          html: `
            <div class="text-danger mb-2"><b>Máy chủ Google Sheets từ chối ghi nhận:</b></div>
            <div class="p-2 bg-danger-subtle text-danger rounded border border-danger-subtle font-monospace small text-start">
              ${(err && err.message) ? err.message : String(err)}
            </div>
            <div class="mt-3 text-muted small text-start">
              <i class="fa-solid fa-triangle-exclamation text-warning me-1"></i> 
              Giỏ hàng nhập kho của bạn <b>vẫn được giữ nguyên</b>. Vui lòng kiểm tra lại trạng thái thiết bị hoặc thử lưu lại.
            </div>
          `,
          confirmButtonText: 'Đã hiểu'
        });
      }

      // GỌI BACKEND GOOGLE APPS SCRIPT VÀ CHỜ PHẢN HỒI
      if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
        try {
          google.script.run
            .withSuccessHandler(res => finalizeNhapKhoSuccess(res))
            .withFailureHandler(err => handleNhapKhoError(err))
            .executeNhapKhoMulti(payload);
        } catch(callErr) {
          handleNhapKhoError(callErr);
        }
      } else {
        // Môi trường demo / offline
        finalizeNhapKhoSuccess({ success: true, message: 'Đã lưu local (môi trường Demo)' });
      }

    } else {
      // Lưu DRAFT
      VOUCHERS_DB.nhap.unshift(voucherRecord);
      recordAuditLog('LƯU NHÁP PHIẾU NHẬP', `Phiếu ${maPhieu} (${CURRENT_DRAFT_NHAP_ITEMS.length} máy)`, 'None', 'DRAFT', 'Lưu nháp chờ hoàn tất', [], 'Nhập kho', '', maPhieu);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
        }
      } catch(e) {}

      CURRENT_DRAFT_NHAP_ITEMS = [];
      if (typeof window !== 'undefined') window.CURRENT_DRAFT_NHAP_ITEMS = [];
      const gcEl = document.getElementById('nhap-ghichu');
      if (gcEl) gcEl.value = '';
      renderDraftNhapTable();

      if (typeof markModulesDirty === 'function') {
        markModulesDirty(['Dashboard', 'LichSu']);
      }
      if (typeof renderDashboard === 'function') {
        renderDashboard();
      }
      
      Swal.fire({
        icon: 'info',
        title: 'Đã lưu phiếu nháp (DRAFT)',
        html: `Phiếu <strong>${maPhieu}</strong> đã được lưu ở trạng thái nháp.<br>Chưa làm tăng tồn kho. Bạn có thể mở lại để tiếp tục chỉnh sửa.`
      });
    }
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

    // 1. KIỂM TRA NHÀ CUNG CẤP HỢP LỆ (FAIL-FAST)
    const nccInputEl = document.getElementById('nhap-ncc-input');
    const nccHiddenEl = document.getElementById('nhap-ncc');
    const typedNcc = (nccInputEl?.value || '').trim();
    const hiddenNcc = (nccHiddenEl?.value || '').trim();

    const suppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => s.active !== false);
    const matchedNcc = suppliers.find(s => {
      const tt = (s.tenTat || '').toLowerCase();
      const td = (s.tenDayDu || '').toLowerCase();
      const combined = `${tt} - ${td}`.toLowerCase();
      return (hiddenNcc && (tt === hiddenNcc.toLowerCase() || td === hiddenNcc.toLowerCase())) ||
             tt === typedNcc.toLowerCase() || td === typedNcc.toLowerCase() || combined === typedNcc.toLowerCase();
    });

    if (!matchedNcc || !typedNcc) {
      playBeepSound();
      if (nccInputEl) {
        nccInputEl.classList.add('is-invalid');
        nccInputEl.focus();
      }
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn Nhà Cung Cấp',
        html: `Nhà Cung Cấp "<strong>${escapeHtml(typedNcc || 'Chưa nhập')}</strong>" chưa có trong Danh mục hoặc để trống.<br><br><span class="text-muted small">Quy chuẩn hệ thống: Bắt buộc phải chọn NCC hợp lệ từ <b>Danh Mục Hệ Thống</b> trước khi thêm thiết bị vào Draft.</span>`,
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }

    // 2. KIỂM TRA KHO NHẬP (FAIL-FAST)
    const khoEl = document.getElementById('nhap-kho');
    const kho = (khoEl?.value || '').trim();
    if (!kho) {
      playBeepSound();
      if (khoEl) {
        khoEl.classList.add('is-invalid');
        khoEl.focus();
      }
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn Kho nhập',
        text: 'Vui lòng chọn Kho nhận hàng hợp lệ trước khi đưa máy vào danh sách Draft!',
        confirmButtonText: 'Đã hiểu'
      });
      return;
    }
    if (khoEl) khoEl.classList.remove('is-invalid');

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

  function openQuickAddModelModal(presetModel, source = 'NHAP_KHO') {
    if (typeof closeAllSmartSuggests === 'function') closeAllSmartSuggests();
    const cleanPreset = String(presetModel || '').trim();
    const srcInput = document.getElementById('quick-model-source');
    if (srcInput) srcInput.value = source;

    const titleEl = document.getElementById('quickAddModelModalTitleText');
    const btnTextEl = document.getElementById('btn-submit-quick-model-text');
    if (source === 'DANH_MUC') {
      if (titleEl) titleEl.textContent = 'Thêm Model Vào Danh Mục';
      if (btnTextEl) btnTextEl.textContent = 'Lưu Model';
    } else {
      if (titleEl) titleEl.textContent = 'Thêm Model Nhanh';
      if (btnTextEl) btnTextEl.textContent = 'Lưu & Chọn Model Này';
    }

    document.getElementById('quick-model-name').value = cleanPreset;
    document.getElementById('quick-model-desc').value = cleanPreset ? `Máy ${cleanPreset}` : '';
    if (document.getElementById('quick-model-dvt')) document.getElementById('quick-model-dvt').value = 'Chiếc';
    document.getElementById('quick-model-warranty').value = '12';
    if (document.getElementById('quick-model-note')) document.getElementById('quick-model-note').value = '';

    // Đổ danh sách Hãng vào select
    const brandSelect = document.getElementById('quick-model-brand');
    brandSelect.innerHTML = '';

    // Tự động nhận diện Hãng nếu presetModel có chứa tên hãng
    let detectedBrand = '';
    const presetUpper = cleanPreset.toUpperCase();
    if (presetUpper.includes('CANON')) detectedBrand = 'CANON';
    else if (presetUpper.includes('HP')) detectedBrand = 'HP';
    else if (presetUpper.includes('BROTHER')) detectedBrand = 'BROTHER';
    else if (presetUpper.includes('EPSON')) detectedBrand = 'EPSON';
    else if (presetUpper.includes('PANASONIC')) detectedBrand = 'PANASONIC';
    else if (presetUpper.includes('RICOH')) detectedBrand = 'RICOH';

    INITIAL_BRANDS.filter(b => b.active !== false).forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.maHang;
      opt.textContent = `${b.maHang} (${b.tenHang})`;
      if (detectedBrand && b.maHang.toUpperCase() === detectedBrand) {
        opt.selected = true;
      }
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

    const modalEl = document.getElementById('quickAddModelModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  function submitQuickAddModel() {
    const source = document.getElementById('quick-model-source')?.value || 'NHAP_KHO';
    const model = document.getElementById('quick-model-name').value.trim();
    const ten = document.getElementById('quick-model-desc').value.trim();
    const dvt = document.getElementById('quick-model-dvt')?.value.trim() || 'Chiếc';
    const hang = document.getElementById('quick-model-brand').value;
    const nhom = document.getElementById('quick-model-category').value;
    const defaultBh = parseInt(document.getElementById('quick-model-warranty').value) || 12;
    const manageSerial = document.getElementById('quick-model-serial-track').value === 'true';
    const note = document.getElementById('quick-model-note')?.value.trim() || ((source === 'DANH_MUC') ? 'Thêm từ Danh mục' : 'Thêm từ Nhập kho');

    if (!model || !ten) {
      Swal.fire('Thiếu dữ liệu', 'Vui lòng nhập mã Model và Tên sản phẩm!', 'warning');
      return;
    }

    if (INITIAL_PRODUCTS.some(p => p.model.toLowerCase() === model.toLowerCase())) {
      Swal.fire('Đã tồn tại', `Model "${model}" đã có sẵn trong danh mục!`, 'info');
      if (source === 'NHAP_KHO') selectModelNhap(model);
      const modalEl = document.getElementById('quickAddModelModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      return;
    }

    const prdId = `PRD-${String(INITIAL_PRODUCTS.length + 1).padStart(3, '0')}`;
    const newProd = {
      productId: prdId,
      model: model,
      ten: ten,
      dvt: dvt,
      hang: hang,
      nhom: nhom,
      defaultBh: defaultBh,
      manageSerial: manageSerial,
      ghiChu: note,
      rowId: 999999,
      active: true
    };

    // Đưa model mới lên đầu danh sách để thấy ngay lập tức
    INITIAL_PRODUCTS.unshift(newProd);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('THANH_AN_PRODUCTS', JSON.stringify(INITIAL_PRODUCTS));
      }
    } catch(e) {}

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      try {
        google.script.run
          .withSuccessHandler(r => console.log('Đã lưu Model lên Google Sheet:', r))
          .saveProduct(model, ten, nhom, dvt, hang, defaultBh, manageSerial, note, null);
      } catch(e) {}
    }

    // Cập nhật lại dropdown và tự chọn bản ghi vừa thêm nếu đang ở Nhập kho
    if (source === 'NHAP_KHO') {
      if (typeof setupNhapKhoForm === 'function') {
        setupNhapKhoForm();
      }
      const modelInput = document.getElementById('nhap-model-input');
      const modelHidden = document.getElementById('nhap-select-model');
      if (modelInput) modelInput.value = model;
      if (modelHidden) modelHidden.value = model;
      if (typeof onSelectModelNhap === 'function') {
        onSelectModelNhap(model);
      }
      if (modelInput) {
        modelInput.focus();
      }
    }

    recordAuditLog('THÊM MODEL MỚI', `Model ${model} (${prdId})`, 'None', `${ten} (${defaultBh}th)`, (source === 'DANH_MUC') ? 'Thêm vào danh mục SP' : 'Thêm từ Nhập kho', [], 'Danh mục');

    const modalEl = document.getElementById('quickAddModelModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['DanhMuc', 'NhapKho', 'XuatKho', 'TonKho']);
    }
    if (typeof renderCatalogProductsTable === 'function') {
      renderCatalogProductsTable();
    }

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm Model!',
      text: (source === 'NHAP_KHO')
        ? `Model "${model}" (${prdId}) đã được lưu và chọn vào phiếu nhập.`
        : `Model "${model}" (${prdId}) đã được lưu thành công vào Danh mục hệ thống.`,
      timer: 1500,
      showConfirmButton: false
    });
  }

  function openQuickAddSupplierModal(presetName, source = 'NHAP_KHO') {
    if (typeof closeAllSmartSuggests === 'function') closeAllSmartSuggests();
    const cleanPreset = String(presetName || '').trim();
    const srcInput = document.getElementById('quick-ncc-source');
    if (srcInput) srcInput.value = source;

    const titleEl = document.getElementById('quickAddSupplierModalTitleText');
    const btnTextEl = document.getElementById('btn-submit-quick-ncc-text');
    if (source === 'DANH_MUC') {
      if (titleEl) titleEl.textContent = 'Thêm Nhà Cung Cấp Vào Danh Mục';
      if (btnTextEl) btnTextEl.textContent = 'Lưu Nhà Cung Cấp';
    } else {
      if (titleEl) titleEl.textContent = 'Thêm Nhà Cung Cấp Nhanh';
      if (btnTextEl) btnTextEl.textContent = 'Lưu & Chọn NCC Này';
    }

    document.getElementById('quick-ncc-code').value = cleanPreset ? cleanPreset.toUpperCase() : '';
    document.getElementById('quick-ncc-name').value = cleanPreset ? cleanPreset : '';
    document.getElementById('quick-ncc-phone').value = '';
    if (document.getElementById('quick-ncc-contact')) document.getElementById('quick-ncc-contact').value = '';
    document.getElementById('quick-ncc-email').value = '';
    if (document.getElementById('quick-ncc-tax')) document.getElementById('quick-ncc-tax').value = '';
    document.getElementById('quick-ncc-address').value = '';

    const modalEl = document.getElementById('quickAddSupplierModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  function submitQuickAddSupplier() {
    const source = document.getElementById('quick-ncc-source')?.value || 'NHAP_KHO';
    const code = document.getElementById('quick-ncc-code').value.trim().toUpperCase();
    const name = document.getElementById('quick-ncc-name').value.trim();
    const phone = document.getElementById('quick-ncc-phone').value.trim();
    const contact = document.getElementById('quick-ncc-contact')?.value.trim() || '';
    const email = document.getElementById('quick-ncc-email').value.trim();
    const tax = document.getElementById('quick-ncc-tax')?.value.trim() || '';
    const address = document.getElementById('quick-ncc-address').value.trim();
    const note = (source === 'DANH_MUC') ? 'Thêm từ Danh mục' : 'Thêm từ Nhập kho';

    if (!code || !name) {
      Swal.fire('Thiếu thông tin', 'Vui lòng nhập mã viết tắt và tên nhà cung cấp!', 'warning');
      return;
    }

    // Kiểm tra trùng
    const isDup = INITIAL_SUPPLIERS.some(s => s.tenTat.toUpperCase() === code || s.tenDayDu.toLowerCase() === name.toLowerCase());
    if (isDup) {
      Swal.fire('Đã tồn tại', `Nhà cung cấp "${code}" đã có trong danh mục!`, 'info');
      if (source === 'NHAP_KHO') selectNccNhap(code, name);
      const modalEl = document.getElementById('quickAddSupplierModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      return;
    }

    const supId = `SUP-${String(INITIAL_SUPPLIERS.length + 1).padStart(3, '0')}`;
    const newSup = {
      supplierId: supId,
      code: code,
      tenTat: code,
      name: name,
      tenDayDu: name,
      phone: phone,
      sdt: phone,
      email: email,
      diaChi: address,
      nguoiLienHe: contact,
      mst: tax,
      ghiChu: note,
      rowId: 999999,
      active: true
    };

    // Đưa NCC mới lên đầu danh sách để thấy ngay lập tức
    INITIAL_SUPPLIERS.unshift(newSup);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('THANH_AN_SUPPLIERS', JSON.stringify(INITIAL_SUPPLIERS));
      }
    } catch(e) {}

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      try {
        google.script.run
          .withSuccessHandler(r => console.log('Đã lưu NCC lên Google Sheet:', r))
          .saveNcc(code, name, phone, email, address, contact, tax, note);
      } catch(e) {}
    }

    if (source === 'NHAP_KHO') {
      selectNccNhap(code, name);
    }

    recordAuditLog('THÊM NCC MỚI', `NCC ${code} (${supId}) - Lh: ${contact || 'None'}`, 'None', name, (source === 'DANH_MUC') ? 'Thêm vào danh mục NCC' : 'Thêm từ Nhập kho', [], 'Danh mục');

    const modalEl = document.getElementById('quickAddSupplierModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    if (typeof markModulesDirty === 'function') {
      markModulesDirty(['DanhMuc', 'NhapKho', 'XuatKho']);
    }
    if (typeof renderCatalogSuppliersTable === 'function') {
      renderCatalogSuppliersTable();
    }

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm Nhà cung cấp!',
      text: (source === 'NHAP_KHO')
        ? `NCC "${code}" (${supId}) đã được lưu và chọn vào phiếu nhập.`
        : `NCC "${code}" (${supId}) đã được lưu thành công vào Danh mục hệ thống.`,
      timer: 1500,
      showConfirmButton: false
    });
  }

  // Xuất ra toàn cục
  if (typeof window !== 'undefined') {
    window.setupNhapKhoForm = setupNhapKhoForm;
    window.handleSuggestNccNhap = handleSuggestNccNhap;
    window.selectNccNhap = selectNccNhap;
    window.onBlurNccNhap = onBlurNccNhap;
    window.openQuickAddSupplierModal = openQuickAddSupplierModal;
    window.submitQuickAddSupplier = submitQuickAddSupplier;
    window.handleSuggestModelNhap = handleSuggestModelNhap;
    window.selectModelNhap = selectModelNhap;
    window.selectModelFromDropdown = selectModelFromDropdown;
    window.onSelectModelNhap = onSelectModelNhap;
    window.onInputModelNhap = onInputModelNhap;
    window.openQuickAddModelModal = openQuickAddModelModal;
    window.submitQuickAddModel = submitQuickAddModel;
  }
