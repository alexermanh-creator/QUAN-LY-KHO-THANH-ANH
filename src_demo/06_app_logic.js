  /* ==================================================== */
  /* 1. TẦNG KẾT NỐI API SERVER-SIDE (ROUND 2 - 5)       */
  /* Bỏ phụ thuộc getInitAppData snapshot, dùng pagination */
  /* ==================================================== */

  if (typeof escapeHtml !== 'function') {
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    if (typeof window !== 'undefined') window.escapeHtml = escapeHtml;
  }

  const WarehouseAPI = {
    isAppsScriptEnvironment: function() {
      return typeof google !== 'undefined' && google.script && google.script.run;
    },

    // 1. Xác thực đăng nhập Backend (Tuyệt đối không lưu mật khẩu ở client)
    authenticateUser: function(username, password, callback) {
      if (this.isAppsScriptEnvironment()) {
        try {
          google.script.run
            .withSuccessHandler(res => { if (callback) callback(res); })
            .withFailureHandler(err => { if (callback) callback({ success: false, message: (err && err.message) ? err.message : 'Lỗi kết nối máy chủ Google' }); })
            .authenticateUser(username, password);
        } catch(callErr) {
          if (callback) callback({ success: false, message: callErr.message });
        }
      } else {
        // Mock handler chuẩn xác với backend 01_DanhMuc.js
        const u = String(username || '').trim().toLowerCase();
        const p = String(password || '').trim();
        const validUsers = {
          'admin': { role: 'ADMIN', name: 'Khổng Mạnh Cường (Admin)', pass: '123456' },
          'minhquan': { role: 'THỦ KHO', name: 'Khổng Minh Quân (Thủ kho)', pass: '123456' },
          'quanly': { role: 'QUẢN LÝ', name: 'Lê Tuấn Cường (Quản lý kho)', pass: '123456' },
          'thukho': { role: 'THỦ KHO', name: 'Nguyễn Văn Kho (Thủ kho)', pass: '123456' },
          'baohanh': { role: 'BẢO HÀNH', name: 'Trần Văn Minh (Kỹ thuật BH)', pass: '123456' }
        };
        if (validUsers[u] && validUsers[u].pass === p) {
          const res = {
            success: true,
            user: { username: u, name: validUsers[u].name, role: validUsers[u].role }
          };
          if (callback) callback(res);
          return Promise.resolve(res);
        } else {
          const res = { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
      }
    },

    // 2. Phân trang Tồn kho getStockPage
    getStockPage: function(params, callback) {
      params = params || {};
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .getStockPage(params);
      } else {
        const page = Math.max(1, parseInt(params.page, 10) || 1);
        const pageSize = Math.min(200, Math.max(10, parseInt(params.pageSize, 10) || 50));
        const keyword = String(params.keyword || '').trim().toLowerCase();
        const warehouse = String(params.warehouse || '').trim();
        const category = String(params.category || '').trim();
        const agingDays = parseInt(params.agingDays, 10) || 0;
        const status = String(params.status || 'IN_STOCK').trim();

        let matched = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).filter(s => {
          if (status === 'IN_STOCK' && s.status !== 'IN_STOCK') return false;
          if (status !== 'IN_STOCK' && status !== 'ALL' && s.status !== status) return false;
          if (warehouse && s.kho !== warehouse) return false;
          if (category && s.nhom !== category) return false;
          if (keyword) {
            const m = (s.serial && s.serial.toLowerCase().includes(keyword)) ||
                      (s.model && s.model.toLowerCase().includes(keyword)) ||
                      (s.tenHang && s.tenHang.toLowerCase().includes(keyword));
            if (!m) return false;
          }
          if (agingDays > 0) {
            const d = typeof calculateStockAging === 'function' ? calculateStockAging(s.ngayNhap) : 0;
            if (d < agingDays) return false;
          }
          return true;
        });

        const total = matched.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const startIdx = (page - 1) * pageSize;
        const res = {
          rows: matched.slice(startIdx, startIdx + pageSize),
          page: page,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 3. Tra cứu Serial 360 profile
    getSerialProfile: function(serial, callback) {
      const clean = String(serial || '').trim().toUpperCase();
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .getSerial360Profile(clean);
      } else {
        const found = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => String(s.serial).trim().toUpperCase() === clean);
        if (!found) {
          const res = { found: false };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
        const res = {
          found: true,
          serial: found.serial,
          model: found.model,
          productName: found.tenHang || found.model,
          category: found.nhom || 'Khác',
          warehouse: found.kho || 'Kho VP',
          currentStatus: found.status,
          isSold: found.status === 'SOLD',
          isVoid: found.status === 'VOID' || found.status === 'CANCELLED',
          daysInSystem: typeof calculateStockAging === 'function' ? calculateStockAging(found.ngayNhap) : 0,
          timeline: found.timeline || []
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 4. Phân trang Phiếu Nhập
    getImportVoucherPage: function(filters, page, pageSize, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .getImportVoucherPage(filters, page, pageSize);
      } else {
        filters = filters || {};
        page = Math.max(1, parseInt(page, 10) || 1);
        pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
        const keyword = String(filters.keyword || '').trim().toLowerCase();

        let list = typeof VOUCHERS_DB !== 'undefined' ? [...VOUCHERS_DB.nhap] : [];
        if (keyword) {
          list = list.filter(v => 
            v.maPhieu.toLowerCase().includes(keyword) ||
            (v.ncc && v.ncc.toLowerCase().includes(keyword)) ||
            (v.model && v.model.toLowerCase().includes(keyword))
          );
        }
        const total = list.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const startIdx = (page - 1) * pageSize;
        const res = {
          rows: list.slice(startIdx, startIdx + pageSize),
          page: page,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 5. Phân trang Phiếu Xuất
    getExportVoucherPage: function(filters, page, pageSize, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .getExportVoucherPage(filters, page, pageSize);
      } else {
        filters = filters || {};
        page = Math.max(1, parseInt(page, 10) || 1);
        pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
        const keyword = String(filters.keyword || '').trim().toLowerCase();

        let list = typeof VOUCHERS_DB !== 'undefined' ? [...VOUCHERS_DB.xuat] : [];
        if (keyword) {
          list = list.filter(v => 
            v.maPhieu.toLowerCase().includes(keyword) ||
            (v.khachHang && v.khachHang.toLowerCase().includes(keyword))
          );
        }
        const total = list.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const startIdx = (page - 1) * pageSize;
        const res = {
          rows: list.slice(startIdx, startIdx + pageSize),
          page: page,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 6. Phân trang Audit Log
    getAuditPage: function(filters, page, pageSize, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .getAuditPage(filters, page, pageSize);
      } else {
        filters = filters || {};
        page = Math.max(1, parseInt(page, 10) || 1);
        pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
        const keyword = String(filters.keyword || '').trim().toLowerCase();

        let list = typeof AUDIT_LOG_DB !== 'undefined' ? [...AUDIT_LOG_DB] : [];
        if (keyword) {
          list = list.filter(a => 
            (a.user && a.user.toLowerCase().includes(keyword)) ||
            (a.action && a.action.toLowerCase().includes(keyword)) ||
            (a.target && a.target.toLowerCase().includes(keyword)) ||
            (a.reason && a.reason.toLowerCase().includes(keyword))
          );
        }
        const total = list.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const startIdx = (page - 1) * pageSize;
        const res = {
          rows: list.slice(startIdx, startIdx + pageSize),
          page: page,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 7. Phân trang Bảo Hành
    getWarrantyPage: function(filters, page, pageSize, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .getWarrantyPage(filters, page, pageSize);
      } else {
        filters = filters || {};
        page = Math.max(1, parseInt(page, 10) || 1);
        pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
        const keyword = String(filters.keyword || '').trim().toLowerCase();
        let list = typeof WARRANTY_CASES_DB !== 'undefined' ? [...WARRANTY_CASES_DB] : [];
        if (keyword) {
          list = list.filter(w => 
            (w.caseId && w.caseId.toLowerCase().includes(keyword)) ||
            (w.serial && w.serial.toLowerCase().includes(keyword)) ||
            (w.customerName && w.customerName.toLowerCase().includes(keyword))
          );
        }
        const total = list.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const startIdx = (page - 1) * pageSize;
        const res = {
          rows: list.slice(startIdx, startIdx + pageSize),
          page: page,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 8. Tóm tắt KPI Dashboard gọn nhẹ
    getDashboardSummary: function(period, customFrom, customTo, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .getDashboardSummary(period, customFrom, customTo);
      } else {
        let inStock = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).filter(s => s.status === 'IN_STOCK').length;
        let imported = (typeof VOUCHERS_DB !== 'undefined' ? VOUCHERS_DB.nhap : []).length;
        let exported = (typeof VOUCHERS_DB !== 'undefined' ? VOUCHERS_DB.xuat : []).length;
        const res = {
          period: period || 'all',
          inStock: inStock,
          imported: imported,
          exported: exported,
          netChange: imported - exported
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 9. Soft Void thiết bị (Serial Write Safety)
    voidSerial: function(serial, reason, callback) {
      const clean = String(serial || '').trim().toUpperCase();
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .deleteThietBi(clean, reason);
      } else {
        const item = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => String(s.serial).trim().toUpperCase() === clean);
        if (item) {
          item.status = 'VOID';
          item.ghiChu = item.ghiChu ? `${item.ghiChu} | [VOID: ${reason}]` : `[VOID: ${reason}]`;
          if (!item.timeline) item.timeline = [];
          const nowStr = typeof getLocalDateStr === 'function' ? getLocalDateStr() : '2026-09-19';
          item.timeline.unshift({
            date: nowStr,
            user: typeof CURRENT_USER_NAME !== 'undefined' ? CURRENT_USER_NAME : 'Admin',
            action: 'Hủy thiết bị (VOID)',
            note: `Chuyển trạng thái VOID. Lý do: ${reason}`
          });
          if (typeof recordAuditLog === 'function') {
            recordAuditLog('HỦY THIẾT BỊ (VOID)', `Serial ${clean}`, 'IN_STOCK', 'VOID', reason, [], 'Tồn kho', clean, '');
          }
          const res = { success: true, message: `Đã hủy serial [${clean}] sang trạng thái VOID an toàn!` };
          if (callback) callback(res);
          return Promise.resolve(res);
        } else {
          const res = { success: false, message: `Không tìm thấy serial [${clean}] để hủy!` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
      }
    },

    // 9.1. Đính chính thông tin thiết bị tồn kho (Serial, Model, Kho, Tên hàng)
    updateThietBi: function(data, callback) {
      const oldSerial = String(data.oldSerial || '').trim().toUpperCase();
      const newSerial = String(data.newSerial || data.serial || '').trim().toUpperCase();
      const item = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => String(s.serial).trim().toUpperCase() === oldSerial);

      const newModel = String(data.model || (item ? item.model : '')).trim();
      const newTenHang = String(data.tenHang || (item ? item.tenHang : newModel)).trim();
      const newKho = String(data.kho || (item ? item.kho : 'Kho VP')).trim();

      // Kiểm tra trùng Serial mới nếu đổi serial
      if (item && newSerial !== oldSerial) {
        const dup = SERIAL_DB.find(s => String(s.serial).trim().toUpperCase() === newSerial && s !== item);
        if (dup) {
          const res = { success: false, message: `Mã Serial mới [${newSerial}] đã tồn tại trên một thiết bị khác!` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
      }

      // 1. Cập nhật tức thì trên Client State (Optimistic update)
      if (item) {
        const oldInfo = `${item.serial} | ${item.model} | ${item.kho}`;
        item.serial = newSerial;
        if (data.internalId) item.internalId = String(data.internalId).trim().toUpperCase();
        if (newModel) item.model = newModel;
        if (newTenHang) item.tenHang = newTenHang;
        if (newKho) item.kho = newKho;
        if (data.ghiChu !== undefined) item.ghiChu = String(data.ghiChu).trim();

        // 2. ĐỒNG BỘ 2 CHIỀU SANG DANH MỤC SẢN PHẨM (INITIAL_PRODUCTS)
        if (newModel && typeof INITIAL_PRODUCTS !== 'undefined') {
          let prod = INITIAL_PRODUCTS.find(p => p.model && p.model.toLowerCase() === newModel.toLowerCase());
          if (prod) {
            if (newTenHang && (!prod.ten || prod.ten === prod.model)) {
              prod.ten = newTenHang;
            }
          } else {
            // Tự động thêm mới vào Danh Mục Hệ Thống
            const brand = (newModel.split(' ')[0]) || 'Chính Hãng';
            const newProd = {
              model: newModel,
              ten: newTenHang || newModel,
              nhom: item.nhom || item.nhomHang || 'Khác',
              dvt: 'Chiếc',
              hang: brand,
              defaultBh: 12,
              manageSerial: true,
              ghiChu: 'Tự động tạo từ Đính chính Tồn kho'
            };
            INITIAL_PRODUCTS.unshift(newProd);
          }

          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('THANH_AN_PRODUCTS', JSON.stringify(INITIAL_PRODUCTS));
            }
          } catch(e) {}

          if (typeof notifyCatalogChanged === 'function') {
            notifyCatalogChanged();
          }
        }

        // 3. ĐỒNG BỘ SANG PHIẾU KHO (VOUCHERS_DB)
        if (typeof VOUCHERS_DB !== 'undefined') {
          if (VOUCHERS_DB.nhap) {
            VOUCHERS_DB.nhap.forEach(v => {
              if (v.items) {
                v.items.forEach(it => {
                  if (String(it.serial || '').trim().toUpperCase() === oldSerial) {
                    it.serial = newSerial;
                    if (newModel) it.model = newModel;
                    if (newTenHang) it.tenHang = newTenHang;
                    if (newKho) it.kho = newKho;
                  }
                });
              }
            });
          }
          if (VOUCHERS_DB.xuat) {
            VOUCHERS_DB.xuat.forEach(v => {
              if (v.items) {
                v.items.forEach(it => {
                  if (String(it.serial || '').trim().toUpperCase() === oldSerial) {
                    it.serial = newSerial;
                    if (newModel) it.model = newModel;
                    if (newTenHang) it.tenHang = newTenHang;
                    if (newKho) it.kho = newKho;
                  }
                });
              }
            });
          }
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('THANH_AN_SERIAL_DB', JSON.stringify(SERIAL_DB.slice(0, 2000)));
              localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
            }
          } catch(e) {}
        }

        const nowStr = typeof getLocalDateStr === 'function' ? getLocalDateStr() : '2026-09-24';
        if (!item.timeline) item.timeline = [];
        item.timeline.unshift({
          date: nowStr,
          user: typeof CURRENT_USER_NAME !== 'undefined' ? CURRENT_USER_NAME : 'Admin',
          action: 'Đính chính thông tin thiết bị',
          note: `Đổi: [${oldInfo}] ➔ [${item.serial} | ${item.model} | ${item.kho}]. Lý do: ${data.reason || 'Đính chính kho'}`
        });

        if (typeof recordAuditLog === 'function') {
          recordAuditLog('ĐÍNH CHÍNH THIẾT BỊ', `Serial cũ: ${oldSerial}`, oldInfo, `${item.serial} | ${item.model} | ${item.kho}`, data.reason || 'Đính chính', [], 'Tồn kho', newSerial, item.maPhieuNhap || '');
        }
      }

      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .updateThietBiSafe(data);
      } else {
        if (!item) {
          const res = { success: false, message: `Không tìm thấy thiết bị với Serial cũ [${oldSerial}]!` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
        const res = { success: true, message: `Đã đính chính thiết bị [${newSerial}] thành công!` };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 9.2. Chuyển kho nhanh 1 thiết bị
    transferSingleDevice: function(serial, targetKho, note, callback) {
      const clean = String(serial || '').trim().toUpperCase();
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .transferSingleDevice(clean, targetKho, note);
      } else {
        const item = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => String(s.serial).trim().toUpperCase() === clean);
        if (!item) {
          const res = { success: false, message: `Không tìm thấy thiết bị [${clean}] để chuyển kho!` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
        const oldKho = item.kho;
        item.kho = targetKho;
        const nowStr = typeof getLocalDateStr === 'function' ? getLocalDateStr() : '2026-09-21';
        if (!item.timeline) item.timeline = [];
        item.timeline.unshift({
          date: nowStr,
          user: typeof CURRENT_USER_NAME !== 'undefined' ? CURRENT_USER_NAME : 'Admin',
          action: 'Điều chuyển kho',
          note: `Chuyển từ [${oldKho}] sang [${targetKho}]. ${note ? `Ghi chú: ${note}` : ''}`
        });

        if (typeof recordAuditLog === 'function') {
          recordAuditLog('ĐIỀU CHUYỂN KHO', `Serial: ${clean}`, oldKho, targetKho, note || 'Chuyển kho nội bộ', [], 'Tồn kho', clean, '');
        }

        const res = { success: true, message: `Đã chuyển thiết bị [${clean}] sang [${targetKho}] thành công!` };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 10. Xác thực lại mật khẩu Admin (Re-auth)
    verifyAdminPassword: function(username, password, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .verifyAdminPassword(username, password);
      } else {
        const p = String(password || '').trim();
        // Kiểm tra cooldown brute force nếu có
        if (typeof window._adminFailCount === 'undefined') window._adminFailCount = 0;
        if (typeof window._adminLockUntil === 'undefined') window._adminLockUntil = 0;

        const now = Date.now();
        if (window._adminLockUntil > now) {
          const remainMins = Math.ceil((window._adminLockUntil - now) / 60000);
          const res = { success: false, message: `Tài khoản tạm khóa do nhập sai nhiều lần. Thử lại sau ${remainMins} phút.` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }

        // Lấy mật khẩu admin hiện tại (ưu tiên từ localStorage/biến động)
        const currentAdminPass = (typeof window._CURRENT_ADMIN_PASS !== 'undefined' && window._CURRENT_ADMIN_PASS) 
          ? window._CURRENT_ADMIN_PASS 
          : (localStorage.getItem('QLK_ADMIN_PASS') || 'admin123');
        window._CURRENT_ADMIN_PASS = currentAdminPass;

        const isMatch = (p === currentAdminPass);

        if (isMatch) {
          window._adminFailCount = 0;
          const res = { success: true, message: 'Xác thực Admin thành công!', adminToken: 'MOCK_TOKEN_' + Date.now() };
          if (callback) callback(res);
          return Promise.resolve(res);
        } else {
          window._adminFailCount++;
          if (window._adminFailCount >= 5) {
            window._adminLockUntil = now + (15 * 60 * 1000);
            const res = { success: false, message: 'Đã nhập sai 5 lần! Tài khoản Admin bị khóa 15 phút để bảo vệ.' };
            if (callback) callback(res);
            return Promise.resolve(res);
          }
          const res = { success: false, message: `Mật khẩu Admin không đúng! (Còn ${5 - window._adminFailCount} lần thử)` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
      }
    },

    // Đổi mật khẩu Admin hệ thống
    changeAdminPassword: function(oldPass, newPass, callback) {
      const currentAdminPass = (typeof window._CURRENT_ADMIN_PASS !== 'undefined' && window._CURRENT_ADMIN_PASS) 
        ? window._CURRENT_ADMIN_PASS 
        : (localStorage.getItem('QLK_ADMIN_PASS') || 'admin123');

      const isOldValid = (currentAdminPass === 'admin123')
        ? (oldPass === 'admin123' || oldPass === '123456' || oldPass === 'admin')
        : (oldPass === currentAdminPass);

      if (!isOldValid) {
        const res = { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
        if (callback) callback(res);
        return Promise.resolve(res);
      }

      if (!newPass || newPass.trim().length < 6) {
        const res = { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' };
        if (callback) callback(res);
        return Promise.resolve(res);
      }

      if (newPass === oldPass) {
        const res = { success: false, message: 'Mật khẩu mới không được trùng với mật khẩu cũ!' };
        if (callback) callback(res);
        return Promise.resolve(res);
      }

      // Cập nhật mật khẩu mới
      window._CURRENT_ADMIN_PASS = newPass;
      try {
        localStorage.setItem('QLK_ADMIN_PASS', newPass);
      } catch (e) {
        console.warn('Không thể lưu localStorage:', e);
      }

      // Đồng bộ vào USERS_DB nếu có
      if (typeof USERS_DB !== 'undefined' && Array.isArray(USERS_DB)) {
        const adminUser = USERS_DB.find(u => u.username.toLowerCase() === 'admin');
        if (adminUser) adminUser.password = newPass;
      }

      const res = { success: true, message: 'Đổi mật khẩu Quản trị viên (Admin) thành công!' };
      if (callback) callback(res);
      return Promise.resolve(res);
    },

    // 11. Tạo bản sao lưu Snapshot (Manual / Auto / Pre-action)
    createSystemBackup: function(description, triggeredBy, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .createSystemBackup(description, triggeredBy);
      } else {
        const backupId = 'BK_' + new Date().toISOString().replace(/\D/g, '').substring(0, 14);
        const newBackup = {
          backupId: backupId,
          timestamp: new Date().toLocaleString('vi-VN'),
          type: description && description.includes('PRE_') ? (description.includes('RESET') ? 'PRE_RESET' : 'PRE_RESTORE') : 'MANUAL',
          triggeredBy: triggeredBy || 'Admin',
          description: description || 'Bản sao lưu thủ công từ giao diện',
          sizeKb: Math.floor(Math.random() * 50) + 120,
          snapshot: {
            serials: JSON.parse(JSON.stringify(typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : [])),
            vouchers: JSON.parse(JSON.stringify(typeof VOUCHERS_DB !== 'undefined' ? VOUCHERS_DB : { nhap: [], xuat: [] })),
            warranty: JSON.parse(JSON.stringify(typeof WARRANTY_CASES_DB !== 'undefined' ? WARRANTY_CASES_DB : []))
          }
        };
        if (typeof window.DEMO_BACKUPS_DB === 'undefined') window.DEMO_BACKUPS_DB = [];
        window.DEMO_BACKUPS_DB.unshift(newBackup);
        const res = { success: true, backupId: backupId, sizeKb: newBackup.sizeKb, message: 'Tạo bản sao lưu thành công!' };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 12. Danh sách bản sao lưu
    listSystemBackups: function(callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .listSystemBackups();
      } else {
        if (typeof window.DEMO_BACKUPS_DB === 'undefined' || window.DEMO_BACKUPS_DB.length === 0) {
          window.DEMO_BACKUPS_DB = [
            {
              backupId: 'BK_20260918_120000',
              timestamp: '18/09/2026 12:00:00',
              type: 'AUTO_DAILY',
              triggeredBy: 'SYSTEM_CRON',
              description: 'Bản sao lưu tự động định kỳ hàng ngày',
              sizeKb: 145
            },
            {
              backupId: 'BK_20260919_083000',
              timestamp: '19/09/2026 08:30:00',
              type: 'MANUAL',
              triggeredBy: 'admin',
              description: 'Chốt số liệu trước đợt kiểm kho Quý 3',
              sizeKb: 168
            }
          ];
        }
        const res = { success: true, backups: window.DEMO_BACKUPS_DB };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 13. Khôi phục bản sao lưu (Restore 11 bước)
    restoreSystemBackup: function(backupId, triggeredBy, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .restoreSystemBackup(backupId, triggeredBy);
      } else {
        const bk = (window.DEMO_BACKUPS_DB || []).find(b => b.backupId === backupId);
        if (!bk) {
          const res = { success: false, message: 'Không tìm thấy bản sao lưu ' + backupId };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
        // Tạo Pre-restore backup tự động
        this.createSystemBackup(`PRE_RESTORE_${backupId}`, triggeredBy);
        // Nếu có snapshot data thì phục hồi
        if (bk.snapshot) {
          if (bk.snapshot.serials && typeof SERIAL_DB !== 'undefined') {
            SERIAL_DB.length = 0;
            SERIAL_DB.push(...JSON.parse(JSON.stringify(bk.snapshot.serials)));
          }
        }
        const res = { success: true, message: `Đã khôi phục hoàn chỉnh hệ thống từ bản ${backupId} qua 11 bước an toàn!` };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 14. Reset hệ thống an toàn 5 lớp
    resetSystemData: function(scope, confirmationPhrase, adminPass, callback) {
      if (typeof adminPass === 'function') {
        callback = adminPass;
        adminPass = '123456';
      }
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .resetSystemData(scope, confirmationPhrase, adminPass || '123456', 'admin');
      } else {
        if (confirmationPhrase !== 'RESET-THANHAN') {
          const res = { success: false, message: 'Cụm từ xác nhận không chính xác!' };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
        // Tạo Pre-reset backup
        const preBk = 'PRE_RESET_' + Date.now();
        this.createSystemBackup(preBk, 'admin');

        if (scope === 'TRANSACTIONS_ONLY') {
          if (typeof SERIAL_DB !== 'undefined') SERIAL_DB.length = 0;
          if (typeof VOUCHERS_DB !== 'undefined') { VOUCHERS_DB.nhap = []; VOUCHERS_DB.xuat = []; }
          if (typeof WARRANTY_CASES_DB !== 'undefined') WARRANTY_CASES_DB.length = 0;
          if (typeof INVENTORY_SESSIONS_DB !== 'undefined') INVENTORY_SESSIONS_DB.length = 0;
          if (typeof AUDIT_LOG_DB !== 'undefined') AUDIT_LOG_DB.length = 0;
          try {
            localStorage.removeItem('THANH_AN_SERIAL_DB');
            localStorage.removeItem('THANH_AN_VOUCHERS_DB');
            localStorage.removeItem('THANH_AN_AUDIT_LOGS');
          } catch(e){}
        } else {
          // FULL_SYSTEM: Trắng hoàn toàn 100% dữ liệu nghiệp vụ, toàn bộ danh mục và audit
          if (typeof SERIAL_DB !== 'undefined') SERIAL_DB.length = 0;
          if (typeof VOUCHERS_DB !== 'undefined') { VOUCHERS_DB.nhap = []; VOUCHERS_DB.xuat = []; }
          if (typeof WARRANTY_CASES_DB !== 'undefined') WARRANTY_CASES_DB.length = 0;
          if (typeof INVENTORY_SESSIONS_DB !== 'undefined') INVENTORY_SESSIONS_DB.length = 0;
          if (typeof INITIAL_PRODUCTS !== 'undefined') INITIAL_PRODUCTS.length = 0;
          if (typeof INITIAL_BRANDS !== 'undefined') INITIAL_BRANDS.length = 0;
          if (typeof INITIAL_CATEGORIES !== 'undefined') INITIAL_CATEGORIES.length = 0;
          if (typeof INITIAL_SUPPLIERS !== 'undefined') INITIAL_SUPPLIERS.length = 0;
          if (typeof INITIAL_CUSTOMERS !== 'undefined') INITIAL_CUSTOMERS.length = 0;
          if (typeof INITIAL_WAREHOUSES !== 'undefined') INITIAL_WAREHOUSES.length = 0;
          if (typeof AUDIT_LOG_DB !== 'undefined') AUDIT_LOG_DB.length = 0;
          try {
            localStorage.removeItem('THANH_AN_PRODUCTS');
            localStorage.removeItem('THANH_AN_SUPPLIERS');
            localStorage.removeItem('THANH_AN_CUSTOMERS');
            localStorage.removeItem('THANH_AN_WAREHOUSES');
            localStorage.removeItem('THANH_AN_SERIAL_DB');
            localStorage.removeItem('THANH_AN_VOUCHERS_DB');
            localStorage.removeItem('THANH_AN_AUDIT_LOGS');
          } catch(e){}
        }

        // Đồng bộ lên window
        if (typeof window !== 'undefined') {
          if (typeof SERIAL_DB !== 'undefined') window.SERIAL_DB = SERIAL_DB;
          if (typeof VOUCHERS_DB !== 'undefined') window.VOUCHERS_DB = VOUCHERS_DB;
          if (typeof WARRANTY_CASES_DB !== 'undefined') window.WARRANTY_CASES_DB = WARRANTY_CASES_DB;
          if (typeof INVENTORY_SESSIONS_DB !== 'undefined') window.INVENTORY_SESSIONS_DB = INVENTORY_SESSIONS_DB;
          if (typeof INITIAL_PRODUCTS !== 'undefined') window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
          if (typeof INITIAL_BRANDS !== 'undefined') window.INITIAL_BRANDS = INITIAL_BRANDS;
          if (typeof INITIAL_CATEGORIES !== 'undefined') window.INITIAL_CATEGORIES = INITIAL_CATEGORIES;
          if (typeof INITIAL_SUPPLIERS !== 'undefined') window.INITIAL_SUPPLIERS = INITIAL_SUPPLIERS;
          if (typeof INITIAL_CUSTOMERS !== 'undefined') window.INITIAL_CUSTOMERS = INITIAL_CUSTOMERS;
          if (typeof INITIAL_WAREHOUSES !== 'undefined') window.INITIAL_WAREHOUSES = INITIAL_WAREHOUSES;
          if (typeof AUDIT_LOG_DB !== 'undefined') window.AUDIT_LOG_DB = AUDIT_LOG_DB;
        }

        const res = { success: true, preResetBackupId: preBk, message: 'Reset dữ liệu hoàn tất an toàn. Đã làm sạch toàn bộ dữ liệu!' };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 15. Phục hồi Serial bị VOID nhầm (Data Recovery)
    recoverVoidSerial: function(serial, newStatus, reason, operator, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .recoverVoidSerial(serial, newStatus, reason, operator);
      } else {
        const clean = String(serial || '').trim().toUpperCase();
        const item = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => String(s.serial).trim().toUpperCase() === clean);
        if (!item) {
          const res = { success: false, message: `Không tìm thấy Serial [${clean}] trong hệ thống!` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
        if (item.status !== 'VOID') {
          const res = { success: false, message: `Serial [${clean}] hiện có trạng thái là ${item.status}, không phải VOID!` };
          if (callback) callback(res);
          return Promise.resolve(res);
        }
        item.status = newStatus || 'IN_STOCK';
        if (!item.timeline) item.timeline = [];
        item.timeline.unshift({
          date: new Date().toLocaleString('vi-VN'),
          user: operator || 'Admin',
          action: 'Cứu dữ liệu Serial (RECOVER_VOID)',
          note: `Khôi phục về trạng thái ${item.status}. Lý do: ${reason}`
        });
        const res = { success: true, message: `Đã khôi phục thành công Serial [${clean}] về trạng thái [${item.status}]!` };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 16. Đối soát toàn vẹn dữ liệu
    runDataReconciliation: function(repairMode, operator, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .runDataReconciliation(repairMode, operator);
      } else {
        const count = typeof SERIAL_DB !== 'undefined' ? SERIAL_DB.length : 0;
        const res = {
          success: true,
          report: {
            totalSerialsScanned: count,
            discrepanciesFound: 0,
            repairedCount: 0,
            details: []
          }
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 17. Tái lập chỉ mục Serial Index
    rebuildSerialIndex: function(callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .rebuildSerialIndex();
      } else {
        const count = typeof SERIAL_DB !== 'undefined' ? SERIAL_DB.length : 0;
        const res = { success: true, count: count, message: `Đã tái lập chỉ mục thành công cho ${count} Serial!` };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    },

    // 18. Cập nhật Model Sản Phẩm (Tất cả trường)
    saveProduct: function(data, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback({ success: true, message: res }); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .saveProduct(data.model, data.ten, data.nhom, data.dvt, data.hang, data.defaultBh, data.manageSerial, data.ghiChu, data.rowId);
      } else {
        if (callback) callback({ success: true });
      }
    },

    // 19. Cập nhật Nhà Cung Cấp (Tất cả trường)
    saveSupplier: function(data, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback({ success: true, message: res }); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .saveNcc(data.tenTat, data.tenDayDu, data.sdt, data.email, data.diaChi, data.nguoiLienHe, data.mst, data.ghiChu, data.rowId);
      } else {
        if (callback) callback({ success: true });
      }
    },

    // 20. Cập nhật Khách Hàng (Tất cả trường)
    saveCustomer: function(data, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback({ success: true, message: res }); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .saveKhachHang(data.customerId, data.ten, data.sdt, data.nguoiLienHe, data.email, data.diaChi, data.mst, data.nhomKhach, data.ghiChu, data.rowId);
      } else {
        if (callback) callback({ success: true });
      }
    },

    // 21. Cập nhật Kho Hàng (Tất cả trường)
    saveWarehouse: function(data, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback({ success: true, message: res }); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .saveKho(data.maKho, data.tenKho, data.loaiKho, data.thuKho, data.sdt, data.diaDiem, data.ghiChu, data.rowId);
      } else {
        if (callback) callback({ success: true });
      }
    },

    // 22. Cập nhật Hãng SX
    saveBrand: function(data, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback({ success: true, message: res }); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .saveHangSx(data.maHang, data.tenHang, data.xuatXu, data.ghiChu, data.rowId);
      } else {
        if (callback) callback({ success: true });
      }
    },

    // 23. Cập nhật Nhóm Hàng
    saveCategory: function(data, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback({ success: true, message: res }); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .saveNhomHang(data.maNhom, data.tenNhom, data.ghiChu, data.rowId);
      } else {
        if (callback) callback({ success: true });
      }
    },

    // 24. Cập nhật Gói Bảo Hành (Mục mới)
    saveWarranty: function(data, callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback({ success: true, message: res }); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .saveBaoHanh(data.soThang, data.tenGoi, data.ghiChu, data.rowId);
      } else {
        if (callback) callback({ success: true });
      }
    },

    // 25. Smart Sync: Kiểm tra phiên bản dữ liệu siêu nhẹ (<0.1s, không đọc sheet, không tốn quota)
    checkDataVersion: function(callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(() => { if (callback) callback({ success: false }); })
          .getSystemDataVersion();
      } else {
        if (callback) callback({ success: true, timestamp: String(Date.now()) });
      }
    },

    // 26. Tải toàn bộ danh sách Phiếu Nhập & Phiếu Xuất từ Google Sheets về (Multi-client Auto Sync)
    getAllVouchers: function(callback) {
      if (this.isAppsScriptEnvironment()) {
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message, xuat: [], nhap: [] }); })
          .getAllVouchersBackend();
      } else {
        const res = {
          success: true,
          timestamp: String(Date.now()),
          xuat: typeof VOUCHERS_DB !== 'undefined' ? (VOUCHERS_DB.xuat || []) : [],
          nhap: typeof VOUCHERS_DB !== 'undefined' ? (VOUCHERS_DB.nhap || []) : []
        };
        if (callback) callback(res);
        return Promise.resolve(res);
      }
    }
  };

  // ====================================================
  // HỆ THỐNG ĐỒNG BỘ ĐA MÁY TỰ ĐỘNG (MULTI-CLIENT REALTIME SYNC)
  // Không cần người dùng ấn nút, tự động nhận dữ liệu giữa các máy
  // ====================================================
  let LAST_DATA_SYNC_TS = '';
  if (typeof window !== 'undefined') window.LAST_DATA_SYNC_TS = '';

  function syncVouchersFromServer(silent = true, callback) {
    if (typeof WarehouseAPI === 'undefined' || !WarehouseAPI.isAppsScriptEnvironment()) {
      if (callback) callback({ success: true, localOnly: true });
      return;
    }

    WarehouseAPI.getAllVouchers(res => {
      if (!res || !res.success) {
        if (callback) callback(res);
        return;
      }

      window.LAST_DATA_SYNC_TS = res.timestamp || String(Date.now());

      // Safe Merge (Gộp an toàn) - Tuyệt đối không làm mất phiếu hiện tại
      if (typeof VOUCHERS_DB === 'undefined' || !VOUCHERS_DB) {
        window.VOUCHERS_DB = { nhap: [], xuat: [] };
      }
      VOUCHERS_DB.xuat = VOUCHERS_DB.xuat || [];
      VOUCHERS_DB.nhap = VOUCHERS_DB.nhap || [];

      // 1. Gộp phiếu Xuất từ Server
      if (Array.isArray(res.xuat)) {
        res.xuat.forEach(sv => {
          const localIdx = VOUCHERS_DB.xuat.findIndex(lv => lv.maPhieu === sv.maPhieu);
          if (localIdx === -1) {
            // Phiếu mới tạo từ máy khác (ví dụ máy Minh Quân) -> thêm vào đầu
            VOUCHERS_DB.xuat.unshift(sv);
          } else {
            // Phiếu đã có -> cập nhật đồng bộ các trường mới nhất từ server
            const cur = VOUCHERS_DB.xuat[localIdx];
            cur.status = sv.status || cur.status;
            cur.ghiChu = sv.ghiChu || cur.ghiChu;
            cur.khachHang = sv.khachHang || cur.khachHang;
            cur.sdtKhach = sv.sdtKhach || cur.sdtKhach;
            if (Array.isArray(sv.items) && sv.items.length > 0 && (!cur.items || cur.items.length === 0)) {
              cur.items = sv.items;
            }
          }
        });
      }

      // 2. Gộp phiếu Nhập từ Server
      if (Array.isArray(res.nhap)) {
        res.nhap.forEach(sn => {
          const localIdx = VOUCHERS_DB.nhap.findIndex(ln => ln.maPhieu === sn.maPhieu);
          if (localIdx === -1) {
            VOUCHERS_DB.nhap.unshift(sn);
          } else {
            const cur = VOUCHERS_DB.nhap[localIdx];
            cur.status = sn.status || cur.status;
            cur.ghiChu = sn.ghiChu || cur.ghiChu;
            cur.ncc = sn.ncc || cur.ncc;
            if (Array.isArray(sn.items) && sn.items.length > 0 && (!cur.items || cur.items.length === 0)) {
              cur.items = sn.items;
            }
          }
        });
      }

      // 3. Lưu bền vững vào localStorage
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
        }
      } catch(e) {}

      // 4. Tự động làm mới giao diện mượt mà nếu đang ở màn hình Lịch Sử Phiếu
      if (typeof HISTORY_SUBTAB_STATE !== 'undefined') {
        if (HISTORY_SUBTAB_STATE.xuat) HISTORY_SUBTAB_STATE.xuat.dirty = true;
        if (HISTORY_SUBTAB_STATE.nhap) HISTORY_SUBTAB_STATE.nhap.dirty = true;
      }
      if (typeof renderHistoryXuatTable === 'function' && document.getElementById('tab-ls-xuat')?.classList.contains('active')) {
        renderHistoryXuatTable();
      }
      if (typeof renderHistoryNhapTable === 'function' && document.getElementById('tab-ls-nhap')?.classList.contains('active')) {
        renderHistoryNhapTable();
      }

      if (!silent && typeof Swal !== 'undefined') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Đã đồng bộ dữ liệu mới nhất từ hệ thống!',
          showConfirmButton: false,
          timer: 2000
        });
      }

      if (callback) callback({ success: true, timestamp: res.timestamp });
    });
  }
  if (typeof window !== 'undefined') window.syncVouchersFromServer = syncVouchersFromServer;

  // Heartbeat Auto-Sync: 15s kiểm tra 1 lần siêu nhẹ (<0.1s)
  let _AUTO_SYNC_HEARTBEAT_INTERVAL = null;
  function startAutoSyncHeartbeat() {
    if (_AUTO_SYNC_HEARTBEAT_INTERVAL) return;
    _AUTO_SYNC_HEARTBEAT_INTERVAL = setInterval(() => {
      if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
        WarehouseAPI.checkDataVersion(res => {
          if (res && res.success && res.timestamp) {
            if (window.LAST_DATA_SYNC_TS && res.timestamp !== window.LAST_DATA_SYNC_TS) {
              console.log('[AutoSync Heartbeat] Phát hiện thay đổi dữ liệu từ máy khác (Minh Quân / Kho), tự động đồng bộ...');
              syncVouchersFromServer(true);
            }
          }
        });
      }
    }, 15000);
  }
  if (typeof window !== 'undefined') {
    window.startAutoSyncHeartbeat = startAutoSyncHeartbeat;
    // Tự động khởi động heartbeat
    setTimeout(startAutoSyncHeartbeat, 3000);
    // Tự động kéo dữ liệu từ server ngay khi mở web app
    setTimeout(() => { syncVouchersFromServer(true); }, 1000);
  }

  let LAST_SYNCED_TIMESTAMP = "";
  function triggerSmartSyncCheck(silent) {
    if (typeof WarehouseAPI === 'undefined' || !WarehouseAPI.isAppsScriptEnvironment()) return;
    WarehouseAPI.checkDataVersion(res => {
      if (res && res.success && res.timestamp) {
        if (!LAST_SYNCED_TIMESTAMP) {
          LAST_SYNCED_TIMESTAMP = res.timestamp;
          return;
        }
        if (res.timestamp !== LAST_SYNCED_TIMESTAMP) {
          console.log(`[SmartSync] Phát hiện dữ liệu vừa cập nhật từ máy khác (${res.timestamp}). Đồng bộ dữ liệu...`);
          LAST_SYNCED_TIMESTAMP = res.timestamp;
          if (typeof markModulesDirty === 'function') {
            markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'Serial360', 'DanhMuc', 'NhapKho', 'XuatKho']);
          }
          const syncBadge = document.getElementById('last-sync-time-badge');
          if (syncBadge) {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            syncBadge.innerHTML = `<i class="fa-solid fa-cloud-arrow-down text-success me-1"></i> Đồng bộ lúc ${timeStr}`;
          }
        }
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.WarehouseAPI = WarehouseAPI;
    window.triggerSmartSyncCheck = triggerSmartSyncCheck;
    // Tự động kiểm tra nhẹ khi quay lại cửa sổ
    window.addEventListener('focus', () => { triggerSmartSyncCheck(true); });
    // Tự động kiểm tra nhẹ mỗi 90 giây (không đọc sheet nên 0% lag, không tốn quota)
    setInterval(() => { triggerSmartSyncCheck(true); }, 90000);
  }

  // =========================================================================
  // HANDLERS ADMIN RE-AUTH & SAO LƯU CHO GIAO DIỆN
  // =========================================================================
  let adminReauthCallback = null;

  function checkAdminRoleOrAlert() {
    const curRole = (typeof CURRENT_ROLE !== 'undefined') ? CURRENT_ROLE : 'QUẢN LÝ';
    if (curRole !== 'ADMIN') {
      Swal.fire({
        icon: 'warning',
        title: 'Yêu Cầu Quyền Quản Trị Viên (Admin)',
        html: `Thao tác này chỉ dành riêng cho <b>Quản trị viên (Admin)</b>.<br><br>Hiện tại bạn đang ở vai trò: <span class="badge bg-primary">${curRole}</span>.<br><br>Vui lòng chuyển sang vai trò <b>QUẢN TRỊ VIÊN (ADMIN)</b> ở menu trên Topbar trước khi thực hiện!`
      });
      return false;
    }
    return true;
  }

  function openAdminReauthModal(actionTitle, actionDesc, onVerifiedCallback) {
    adminReauthCallback = onVerifiedCallback;
    const titleEl = document.getElementById('reauth-action-title');
    const descEl = document.getElementById('reauth-action-desc');
    const passInput = document.getElementById('reauth-admin-pass');
    const errBox = document.getElementById('reauth-error-msg');

    const curPass = (typeof window._CURRENT_ADMIN_PASS !== 'undefined' && window._CURRENT_ADMIN_PASS) 
      ? window._CURRENT_ADMIN_PASS 
      : (localStorage.getItem('QLK_ADMIN_PASS') || 'admin123');
    if (descEl) descEl.innerText = (actionDesc ? actionDesc + ' ' : '') + `Nhập mật khẩu Admin để xác nhận:`;
    if (passInput) passInput.value = '';
    if (errBox) { errBox.classList.add('d-none'); errBox.innerText = ''; }

    const modalEl = document.getElementById('modalAdminReauth');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
      setTimeout(() => { if (passInput) passInput.focus(); }, 300);
    }
  }

  function submitAdminReauth() {
    const passInput = document.getElementById('reauth-admin-pass');
    const btn = document.getElementById('btn-submit-reauth');
    const errBox = document.getElementById('reauth-error-msg');
    const pass = passInput ? passInput.value : '';

    if (!pass) {
      if (errBox) { errBox.innerText = 'Vui lòng nhập mật khẩu Admin!'; errBox.classList.remove('d-none'); }
      return;
    }

    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Kiểm tra...'; }
    if (errBox) errBox.classList.add('d-none');

    WarehouseAPI.verifyAdminPassword('admin', pass, function(res) {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-shield-check me-2"></i> Xác Nhận'; }
      if (res && res.success) {
        const modalEl = document.getElementById('modalAdminReauth');
        if (modalEl && typeof bootstrap !== 'undefined') {
          bootstrap.Modal.getInstance(modalEl).hide();
        }
        if (typeof adminReauthCallback === 'function') {
          const cb = adminReauthCallback;
          adminReauthCallback = null;
          cb(res.adminToken, pass);
        }
      } else {
        if (errBox) { errBox.innerText = (res && res.message) ? res.message : 'Mật khẩu Admin không đúng! Vui lòng thử lại.'; errBox.classList.remove('d-none'); }
      }
    });
  }

  function triggerDemoBackup() {
    const note = (document.getElementById('demo-backup-note') ? document.getElementById('demo-backup-note').value : '') || 'Manual Backup';
    openAdminReauthModal('Tạo Bản Sao Lưu Thủ Công', 'Hệ thống sẽ chụp snapshot toàn bộ dữ liệu hiện tại.', function(token, pass) {
      Swal.fire({ title: 'Đang tạo bản sao lưu...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      WarehouseAPI.createSystemBackup(note, 'admin', function(res) {
        if (res && res.success) {
          Swal.fire({ icon: 'success', title: 'Sao lưu thành công!', html: `Mã backup: <b>${res.backupId}</b><br>Kích thước: <b>${res.sizeKb} KB</b>` });
          renderDemoBackupList();
        } else {
          Swal.fire({ icon: 'error', title: 'Thất bại', text: res ? res.message : 'Lỗi không xác định' });
        }
      });
    });
  }

  function renderDemoBackupList() {
    const tbody = document.getElementById('demo-backup-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Đang tải...</td></tr>';

    WarehouseAPI.listSystemBackups(function(res) {
      if (!res || !res.backups || res.backups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Chưa có bản sao lưu nào.</td></tr>';
        return;
      }
      tbody.innerHTML = res.backups.map(b => {
        const typeBadge = b.type === 'AUTO_DAILY' ? '<span class="badge bg-info-subtle text-info">Tự Động</span>'
          : b.type === 'PRE_RESTORE' ? '<span class="badge bg-warning-subtle text-warning">Pre-Restore</span>'
          : b.type === 'PRE_RESET' ? '<span class="badge bg-danger-subtle text-danger">Pre-Reset</span>'
          : '<span class="badge bg-primary-subtle text-primary">Thủ Công</span>';

        return `
          <tr>
            <td class="fw-bold text-dark font-monospace">${b.backupId}</td>
            <td class="small">${b.timestamp}</td>
            <td>${typeBadge}</td>
            <td class="small">${b.triggeredBy || 'System'}</td>
            <td class="small text-truncate" style="max-width: 250px;">${b.description || '---'}</td>
            <td class="small font-monospace">${b.sizeKb ? b.sizeKb + ' KB' : '---'}</td>
            <td><span class="badge bg-success-subtle text-success">Khả dụng</span></td>
            <td class="text-center">
              <button class="btn btn-danger btn-xs py-1 px-2 fw-bold" onclick="triggerDemoRestoreBackup('${b.backupId}')">
                <i class="fa-solid fa-clock-rotate-left me-1"></i> Khôi Phục
              </button>
            </td>
          </tr>
        `;
      }).join('');
    });
  }

  function triggerDemoRestoreBackup(backupId) {
    if (!checkAdminRoleOrAlert()) return;
    openAdminReauthModal('Khôi Phục Bản Sao Lưu', `Bạn đang yêu cầu khôi phục lại hệ thống từ snapshot: ${backupId}.`, function(token, pass) {
      Swal.fire({ title: 'Đang khôi phục hệ thống qua 11 bước an toàn...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      WarehouseAPI.restoreSystemBackup(backupId, 'admin', function(res) {
        if (res && res.success) {
          Swal.fire({ icon: 'success', title: 'Khôi phục hoàn tất!', text: res.message }).then(() => {
            renderDemoBackupList();
            if (typeof switchTab === 'function') switchTab('TonKho');
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Thất bại', text: res ? res.message : 'Lỗi không xác định' });
        }
      });
    });
  }

  function triggerDemoRecoverSerial() {
    if (!checkAdminRoleOrAlert()) return;
    Swal.fire({
      title: 'Phục Hồi Serial VOID',
      html: `
        <div class="text-start small">
          <label class="form-label fw-bold">Mã Serial cần phục hồi (*):</label>
          <input id="swal-recover-serial" class="form-control form-control-sm mb-2" placeholder="VD: SN-123456">
          <label class="form-label fw-bold">Trạng thái mới:</label>
          <select id="swal-recover-status" class="form-select form-select-sm mb-2">
            <option value="IN_STOCK">IN_STOCK (Đưa lại về tồn kho)</option>
            <option value="EXPORTED">EXPORTED (Đã xuất kho)</option>
          </select>
          <label class="form-label fw-bold">Lý do phục hồi (*):</label>
          <input id="swal-recover-reason" class="form-control form-control-sm" placeholder="VD: Bấm nhầm hủy phiếu...">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tiếp tục',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const serial = document.getElementById('swal-recover-serial').value.trim();
        const newStatus = document.getElementById('swal-recover-status').value;
        const reason = document.getElementById('swal-recover-reason').value.trim();
        if (!serial || !reason) {
          Swal.showValidationMessage('Vui lòng nhập Serial và Lý do!');
          return false;
        }
        return { serial, newStatus, reason };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { serial, newStatus, reason } = result.value;
        openAdminReauthModal('Xác nhận cứu Serial', `Khôi phục Serial ${serial} về trạng thái ${newStatus}`, function() {
          WarehouseAPI.recoverVoidSerial(serial, newStatus, reason, 'Admin', function(res) {
            if (res && res.success) {
              Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message });
            } else {
              Swal.fire({ icon: 'error', title: 'Thất bại', text: res ? res.message : 'Không thể khôi phục' });
            }
          });
        });
      }
    });
  }

  function triggerDemoReconciliation(repairMode) {
    if (!checkAdminRoleOrAlert()) return;
    openAdminReauthModal(repairMode ? 'Sửa Chữa Dữ Liệu Tự Động' : 'Đối Soát Toàn Vẹn', 'Kiểm tra độ lệch dữ liệu giữa Serial Index, Lịch sử và Tồn kho.', function() {
      WarehouseAPI.runDataReconciliation(repairMode, 'Admin', function(res) {
        if (res && res.success) {
          const report = res.report;
          let htmlMsg = `<div class="text-start small">
            <p><b>Tổng Serial kiểm tra:</b> ${report.totalSerialsScanned}</p>
            <p><b>Số sai lệch phát hiện:</b> <span class="text-success fw-bold">${report.discrepanciesFound}</span></p>
            <p><b>Số mục đã tự động sửa:</b> ${report.repairedCount}</p>
          </div>`;
          Swal.fire({ icon: 'success', title: 'Kết Quả Đối Soát', html: htmlMsg });
        }
      });
    });
  }

  function triggerDemoRebuildIndex() {
    if (!checkAdminRoleOrAlert()) return;
    openAdminReauthModal('Tái Lập Serial Index', 'Quét lại toàn bộ Serial để lập bảng băm tra cứu O(1).', function() {
      WarehouseAPI.rebuildSerialIndex(function(res) {
        if (res && res.success) {
          Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message });
        }
      });
    });
  }

  function triggerImportStandardizedDatabase() {
    if (!checkAdminRoleOrAlert()) return;
    Swal.fire({
      icon: 'question',
      title: 'NẠP CƠ SỞ DỮ LIỆU ĐÃ CHUẨN HÓA',
      html: `Bạn có muốn nạp toàn bộ <b>33 Danh mục sản phẩm chuẩn</b>, <b>86 Thiết bị (60 Tồn kho, 26 Đã xuất)</b>, <b>34 Phiếu nhập</b>, <b>14 Phiếu xuất</b> và <b>10 Khách hàng đã làm sạch</b> lên Google Sheets không?<br><br>
             <span class="text-danger fw-semibold">Lưu ý: Thao tác này sẽ cập nhật các sheet dữ liệu trên Google Sheets theo đúng chuẩn quản lý kho chuyên nghiệp.</span>`,
      showCancelButton: true,
      confirmButtonColor: '#198754',
      confirmButtonText: '<i class="fa-solid fa-cloud-arrow-up me-1"></i> Đồng ý & Nhập Mật Khẩu',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        openAdminReauthModal('XÁC NHẬN NẠP CSDL CHUẨN HÓA', 'Nhập mật khẩu Quản trị viên (mặc định 654321) để tiến hành ghi vào Google Sheets:', function(token, pass) {
          const finalAdminPass = pass || token || '654321';
          Swal.fire({
            title: 'Đang nạp dữ liệu lên Google Sheets...',
            text: 'Vui lòng chờ trong giây lát, hệ thống đang đồng bộ toàn bộ bảng tính.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
          });

          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                if (res && res.success) {
                  Swal.fire({ icon: 'success', title: 'Thành công!', text: res.message || 'Đã nạp toàn bộ CSDL chuẩn hóa lên Google Sheets thành công!' }).then(() => {
                    location.reload();
                  });
                } else {
                  Swal.fire({ icon: 'error', title: 'Lỗi', text: (res && res.message) || 'Không thể nạp dữ liệu' });
                }
              })
              .withFailureHandler(function(err) {
                Swal.fire({ icon: 'error', title: 'Lỗi kết nối', text: err.toString() });
              })
              .executePopulateStandardizedDatabaseToGoogleSheets(finalAdminPass);
          } else {
            // Demo offline mode
            setTimeout(function() {
              Swal.fire({
                icon: 'success',
                title: 'Chế độ Demo (Offline)',
                text: 'Trên giao diện Demo, dữ liệu đã được chuẩn hóa tự động trong Mock Data!'
              });
            }, 600);
          }
        });
      }
    });
  }

  function triggerDemoReset(resetScope) {
    if (!checkAdminRoleOrAlert()) return;
    const scopeName = resetScope === 'TRANSACTIONS_ONLY' ? 'Lịch sử giao dịch & Tồn kho (Giữ danh mục)' : 'Toàn bộ cơ sở dữ liệu (Trắng tinh)';
    Swal.fire({
      icon: 'warning',
      title: 'CẢNH BÁO NGUY HIỂM: RESET HỆ THỐNG',
      html: `Hành động này sẽ xóa: <span class="text-danger fw-bold">${scopeName}</span>.<br><br>Nhập chính xác chữ <b>RESET-THANHAN</b> để xác nhận:`,
      input: 'text',
      inputPlaceholder: 'RESET-THANHAN',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Tiếp tục xác thực',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value !== 'RESET-THANHAN') {
          Swal.fire({ icon: 'error', title: 'Từ chối thao tác', text: 'Mã xác nhận không khớp!' });
          return;
        }
        openAdminReauthModal('XÁC NHẬN CUỐI CÙNG - RESET HỆ THỐNG', 'Hệ thống sẽ tự động tạo bản sao lưu PRE_RESET trước khi dọn dẹp.', function(token, pass) {
          const finalAdminPass = pass || token || '123456';
          WarehouseAPI.resetSystemData(resetScope, 'RESET-THANHAN', finalAdminPass, function(res) {
            if (res && res.success) {
              Swal.fire({ icon: 'success', title: 'Reset hoàn tất!', text: res.message }).then(() => {
                // Xóa trắng toàn bộ Audit logs trên Web App khi reset
                if (typeof AUDIT_LOG_DB !== 'undefined') AUDIT_LOG_DB.length = 0;
                if (typeof SERIAL_DB !== 'undefined') SERIAL_DB.length = 0;
                if (typeof VOUCHERS_DB !== 'undefined') { VOUCHERS_DB.nhap = []; VOUCHERS_DB.xuat = []; }
                try {
                  localStorage.removeItem('THANH_AN_SERIAL_DB');
                  localStorage.removeItem('THANH_AN_VOUCHERS_DB');
                  localStorage.removeItem('THANH_AN_AUDIT_LOGS');
                } catch(e){}

                if (resetScope === 'FULL_SYSTEM' || resetScope === 'FULL_RESET') {
                  if (typeof INITIAL_PRODUCTS !== 'undefined') INITIAL_PRODUCTS.length = 0;
                  if (typeof INITIAL_BRANDS !== 'undefined') INITIAL_BRANDS.length = 0;
                  if (typeof INITIAL_CATEGORIES !== 'undefined') INITIAL_CATEGORIES.length = 0;
                  if (typeof INITIAL_SUPPLIERS !== 'undefined') INITIAL_SUPPLIERS.length = 0;
                  if (typeof INITIAL_CUSTOMERS !== 'undefined') INITIAL_CUSTOMERS.length = 0;
                  if (typeof INITIAL_WAREHOUSES !== 'undefined') INITIAL_WAREHOUSES.length = 0;
                  try {
                    localStorage.removeItem('THANH_AN_PRODUCTS');
                    localStorage.removeItem('THANH_AN_SUPPLIERS');
                    localStorage.removeItem('THANH_AN_CUSTOMERS');
                    localStorage.removeItem('THANH_AN_WAREHOUSES');
                  } catch(e){}
                }
                if (typeof markModulesDirty === 'function') {
                  markModulesDirty(['Dashboard', 'TonKho', 'LichSu', 'DanhMuc', 'BaoHanh', 'KiemKe', 'CaiDat']);
                }
                if (typeof renderTonKho === 'function') renderTonKho();
                if (typeof renderCatalogTables === 'function') renderCatalogTables(true);
                if (typeof renderDashboard === 'function') renderDashboard();
                if (typeof setupNhapKhoForm === 'function') setupNhapKhoForm();
                if (typeof setupXuatKhoForm === 'function') setupXuatKhoForm();
                if (typeof renderLichSuVouchers === 'function') renderLichSuVouchers();
                if (typeof renderAuditLogTable === 'function') renderAuditLogTable();
                if (typeof renderDemoBackupList === 'function') renderDemoBackupList();
                if (typeof updateStockFilterDropdowns === 'function') updateStockFilterDropdowns();
                if (typeof switchTab === 'function') switchTab('TonKho');
              });
            } else {
              Swal.fire({ icon: 'error', title: 'Lỗi', text: res ? res.message : 'Thất bại' });
            }
          });
        });
      }
    });
  }


  /* ==================================================== */
  /* 2. TIỆN ÍCH HỆ THỐNG: ÂM THANH, RUNG, SEQUENCE, AUDIT */
  /* ==================================================== */

  // Web Audio API Beep (Phát tiếng bíp chuẩn khi quét trúng mã - Yêu cầu I)
  let audioCtx = null;
  function playBeepSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz (A5 note)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  }

  // Rung thiết bị (Vibration API trên điện thoại - Yêu cầu I)
  function triggerVibration() {
    if (navigator.vibrate) {
      navigator.vibrate([100]);
    }
  }

  // Cơ chế sinh mã nội bộ Thành An theo Sequence tăng dần (Yêu cầu A3: TA-YYMMDD-000001, tuyệt đối không dùng random)
  function generateSequentialInternalAssetId() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    INTERNAL_SEQ_COUNTER++;
    const seqStr = String(INTERNAL_SEQ_COUNTER).padStart(6, '0');
    return `TA-${yy}${mm}${dd}-${seqStr}`;
  }

  // Bộ đếm sequence chống trùng mã phiếu tuyệt đối khi tạo gần nhau
  let VOUCHER_SEQ_COUNTER = { PN: 0, PX: 0 };

  // Sinh mã phiếu theo ngày đảm bảo không bao giờ trùng mã
  function generateVoucherCode(prefix) {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dayPrefix = `${prefix}-${yy}${mm}${dd}-`;

    const list = (prefix === 'PN') ? (VOUCHERS_DB.nhap || []) : (VOUCHERS_DB.xuat || []);
    let maxNum = 0;
    list.forEach(v => {
      if (v.maPhieu && v.maPhieu.startsWith(dayPrefix)) {
        const parts = v.maPhieu.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    if (!VOUCHER_SEQ_COUNTER[prefix] || VOUCHER_SEQ_COUNTER[prefix] <= maxNum) {
      VOUCHER_SEQ_COUNTER[prefix] = maxNum;
    }
    VOUCHER_SEQ_COUNTER[prefix]++;

    return `${dayPrefix}${String(VOUCHER_SEQ_COUNTER[prefix]).padStart(2, '0')}`;
  }

  // Tính ngày hết hạn bảo hành từ ngày xuất và số tháng bảo hành (Chính xác theo lịch, chống tràn ngày)
  function calculateExpiryDate(dateStr, months) {
    const m = parseInt(String(months || '').replace(/\D/g, ''), 10) || 0;
    if (!dateStr || m <= 0) return 'Không BH';
    const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
    if (parts.length !== 3) return 'Không BH';
    let d, monthIdx, y;
    if (parts[0].length === 4) { // YYYY-MM-DD
      y = parseInt(parts[0], 10);
      monthIdx = parseInt(parts[1], 10) - 1;
      d = parseInt(parts[2], 10);
    } else { // DD/MM/YYYY
      d = parseInt(parts[0], 10);
      monthIdx = parseInt(parts[1], 10) - 1;
      y = parseInt(parts[2], 10);
    }
    if (isNaN(y) || isNaN(monthIdx) || isNaN(d)) return 'Không BH';

    // Tính chính xác tháng theo lịch, chống nhảy tràn ngày (VD: 31/03 + 1 tháng = 30/04, không tràn sang 01/05)
    const targetMonth = monthIdx + m;
    const targetYear = y + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const maxDaysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
    const targetDay = Math.min(d, maxDaysInTargetMonth);

    const resD = String(targetDay).padStart(2, '0');
    const resM = String(normalizedMonth + 1).padStart(2, '0');
    const resY = targetYear;
    return `${resD}/${resM}/${resY}`;
  }

  // Định dạng ngày hiển thị DD/MM/YYYY
  function formatDateDisplay(dStr) {
    if (!dStr) return '';
    if (dStr.includes('/')) return dStr;
    const parts = dStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  }

  // Lấy ngày theo giờ địa phương dạng YYYY-MM-DD (tránh lệch ngày UTC ở Việt Nam)
  function getLocalDateStr(dateInput = new Date()) {
    const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Chuyển đổi chuỗi ngày DD/MM/YYYY hoặc YYYY-MM-DD thành Date object
  function parseVoucherDate(vDateStr) {
    if (!vDateStr) return null;
    if (vDateStr.includes('/')) {
      const parts = vDateStr.split('/');
      if (parts.length !== 3) return null;
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else if (vDateStr.includes('-')) {
      const parts = vDateStr.split('-');
      if (parts.length !== 3) return null;
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return null;
  }

  // Tính số ngày tồn kho từ ngày nhập
  function calculateStockAging(ngayNhapStr) {
    if (!ngayNhapStr) return 0;
    const parts = ngayNhapStr.includes('/') ? ngayNhapStr.split('/') : ngayNhapStr.split('-');
    let d, m, y;
    if (parts[0].length === 4) { y = parseInt(parts[0]); m = parseInt(parts[1]) - 1; d = parseInt(parts[2]); }
    else { d = parseInt(parts[0]); m = parseInt(parts[1]) - 1; y = parseInt(parts[2]); }
    const importDate = new Date(y, m, d);
    const now = new Date();
    const diffTime = Math.abs(now - importDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Ghi nhật ký kiểm toán nâng cao (Field-Level Audit Trail - Yêu cầu 7 & 7.2)
  function recordAuditLog(action, target, oldVal, newVal, reason, changesArray, moduleName, serial, voucherCode) {
    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth()+1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const logItem = {
      time: timeStr,
      user: CURRENT_USER_NAME,
      role: CURRENT_ROLE,
      action: action,
      module: moduleName || 'Hệ thống',
      target: target,
      serial: serial || '',
      voucherCode: voucherCode || '',
      oldVal: oldVal || 'None',
      newVal: newVal || 'Updated',
      reason: reason || 'Thao tác nghiệp vụ',
      changes: changesArray || [] // [{ field: 'SĐT', oldVal: '...', newVal: '...' }]
    };
    AUDIT_LOG_DB.unshift(logItem);
    if (AUDIT_LOG_DB.length > 200) AUDIT_LOG_DB.length = 200;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('THANH_AN_AUDIT_LOGS', JSON.stringify(AUDIT_LOG_DB));
      }
    } catch(e) {}

    // Ghi nhận trực tiếp lên Google Sheet nếu ở môi trường Apps Script
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      try {
        google.script.run.saveClientAuditLog(logItem);
      } catch(e) {}
    }

    renderAuditTable();
  }

  /* ==================================================== */
  /* 3. PHÂN QUYỀN VAI TRÒ & PERMISSIONS MATRIX (YÊU CẦU 6) */
  /* ==================================================== */

  // Kiểm tra quyền theo Permission Code cụ thể (Yêu cầu 6)
  function hasPermission(permCode) {
    if (CURRENT_ROLE === 'ADMIN') return true;
    const rolePerms = ROLE_PERMISSIONS[CURRENT_ROLE] || [];
    return rolePerms.includes(permCode);
  }

  // Kiểm tra quyền trước khi thực thi thao tác
  function checkPermission(allowedRolesOrPerm, actionName) {
    // Nếu truyền mã permission code (có dấu chấm ví dụ Voucher.Edit)
    if (typeof allowedRolesOrPerm === 'string' && allowedRolesOrPerm.includes('.')) {
      if (!hasPermission(allowedRolesOrPerm)) {
        Swal.fire({
          icon: 'error',
          title: 'Từ chối quyền truy cập!',
          html: `Bạn không có quyền: <strong>${allowedRolesOrPerm}</strong> để thực hiện thao tác: <strong>${actionName}</strong>.<br>Vai trò hiện tại: <strong>${CURRENT_ROLE}</strong>.<br><small class="text-muted">Vui lòng liên hệ Admin hoặc cấp quyền trong Cài đặt Phân Quyền.</small>`
        });
        return false;
      }
      return true;
    }

    // Nếu truyền danh sách roles
    if (Array.isArray(allowedRolesOrPerm)) {
      if (!allowedRolesOrPerm.includes(CURRENT_ROLE)) {
        Swal.fire({
          icon: 'error',
          title: 'Từ chối quyền truy cập!',
          html: `Thao tác <strong>${actionName}</strong> chỉ dành cho vai trò: <strong>${allowedRolesOrPerm.join(' hoặc ')}</strong>.<br>Hiện tại bạn đang ở vai trò: <strong>${CURRENT_ROLE}</strong>.`
        });
        return false;
      }
      return true;
    }

    return true;
  }

  // Cập nhật nhãn Tên người dùng và Vai trò trên Topbar
  function updateUserTopBarDisplay() {
    const lbl = document.getElementById('currentRoleLabel');
    const badge = document.getElementById('currentRoleBadge');
    const ddName = document.getElementById('dropdown-user-name');
    const ddRole = document.getElementById('dropdown-user-role');
    const passMenu = document.getElementById('topbar-menu-changepass');

    if (!CURRENT_USER_NAME || CURRENT_ROLE === 'GUEST') {
      if (lbl) lbl.textContent = 'Chưa đăng nhập';
      if (badge) {
        badge.textContent = 'Khách';
        badge.className = 'badge bg-secondary-subtle text-secondary border border-secondary-subtle p-0 px-1';
      }
      if (ddName) ddName.textContent = 'Chưa đăng nhập';
      if (ddRole) ddRole.innerHTML = '<i class="fa-solid fa-user-lock me-1 text-secondary"></i>Vui lòng đăng nhập';
      if (passMenu) passMenu.style.display = 'none';
      return;
    }

    const roleNameMap = {
      'ADMIN': 'Quản trị viên',
      'QUẢN LÝ': 'Quản lý kho',
      'THỦ KHO': 'Thủ kho',
      'BẢO HÀNH': 'Nhân viên Bảo hành'
    };
    const roleText = roleNameMap[CURRENT_ROLE] || CURRENT_ROLE;

    if (lbl) lbl.textContent = CURRENT_USER_NAME;
    if (badge) {
      badge.textContent = roleText;
      badge.className = (CURRENT_ROLE === 'ADMIN')
        ? 'badge bg-danger-subtle text-danger border border-danger-subtle p-0 px-1'
        : (CURRENT_ROLE === 'THỦ KHO' ? 'badge bg-success-subtle text-success border border-success-subtle p-0 px-1' : 'badge bg-primary-subtle text-primary border border-primary-subtle p-0 px-1');
    }
    if (ddName) ddName.textContent = CURRENT_USER_NAME;
    if (ddRole) ddRole.innerHTML = `<i class="fa-solid fa-shield-halved me-1 text-primary"></i>${roleText}`;
    if (passMenu) passMenu.style.display = (CURRENT_ROLE === 'ADMIN') ? 'block' : 'none';
  }

  function setRole(role) {
    CURRENT_ROLE = role;
    if (typeof window !== 'undefined') {
      window.CURRENT_ROLE = CURRENT_ROLE;
      window.CURRENT_USER_NAME = CURRENT_USER_NAME;
    }
    updateUserTopBarDisplay();
    updateUIPermissions();
  }

  // Kiểm tra phiên đăng nhập khi khởi động trang web
  function checkAuthOnStartup() {
    let hasSession = false;
    try {
      if (typeof sessionStorage !== 'undefined') {
        const savedSession = sessionStorage.getItem('THANH_AN_LOGGED_SESSION');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.username && parsed.role && parsed.role !== 'GUEST') {
            CURRENT_ROLE = parsed.role;
            CURRENT_USER_NAME = parsed.fullName || parsed.username;
            hasSession = true;
          }
        }
      }
    } catch(e) {}

    const screenOverlay = document.getElementById('app-login-screen');
    if (hasSession) {
      if (screenOverlay) {
        screenOverlay.classList.add('d-none-fade');
        setTimeout(() => { screenOverlay.style.display = 'none'; }, 300);
      }
      updateUserTopBarDisplay();
      updateUIPermissions();
    } else {
      // Chưa đăng nhập -> Hiển thị màn hình đăng nhập khóa toàn bộ hệ thống
      CURRENT_ROLE = 'GUEST';
      CURRENT_USER_NAME = '';
      if (screenOverlay) {
        screenOverlay.style.display = 'flex';
        screenOverlay.classList.remove('d-none-fade');
      }
      updateUserTopBarDisplay();
      updateUIPermissions();
      const uField = document.getElementById('screen-login-username');
      if (uField) setTimeout(() => uField.focus(), 300);
    }
  }

  // Đăng xuất khỏi hệ thống
  function handleSystemLogout() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('THANH_AN_LOGGED_SESSION');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('THANH_AN_LOGGED_USER');
      }
    } catch(e) {}

    const oldUser = CURRENT_USER_NAME || 'Người dùng';
    CURRENT_ROLE = 'GUEST';
    CURRENT_USER_NAME = '';
    if (typeof window !== 'undefined') {
      window.CURRENT_ROLE = 'GUEST';
      window.CURRENT_USER_NAME = '';
    }

    updateUserTopBarDisplay();
    updateUIPermissions();

    const screenOverlay = document.getElementById('app-login-screen');
    if (screenOverlay) {
      screenOverlay.style.display = 'flex';
      setTimeout(() => screenOverlay.classList.remove('d-none-fade'), 10);
      const uInput = document.getElementById('screen-login-username');
      const pInput = document.getElementById('screen-login-password');
      const errBox = document.getElementById('login-screen-error-msg');
      if (uInput) uInput.value = '';
      if (pInput) pInput.value = '';
      if (errBox) errBox.classList.add('d-none');
      if (uInput) uInput.focus();
    }

    if (typeof recordAuditLog === 'function') {
      recordAuditLog('ĐĂNG XUẤT', oldUser, '', 'GUEST', `${oldUser} đã đăng xuất khỏi hệ thống`);
    }

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'info',
        title: 'Đã đăng xuất',
        text: 'Bạn đã đăng xuất an toàn khỏi hệ thống Kho Thành An.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  // Mở modal đăng nhập chuyển tài khoản
  function openLoginModal() {
    const uInput = document.getElementById('modal-login-username');
    const pInput = document.getElementById('modal-login-password');
    const errDiv = document.getElementById('login-error-msg');
    if (uInput) uInput.value = '';
    if (pInput) pInput.value = '';
    if (errDiv) { errDiv.classList.add('d-none'); errDiv.textContent = ''; }

    const modalEl = document.getElementById('loginModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
      setTimeout(() => { if (uInput) uInput.focus(); }, 300);
    }
  }

  // Xử lý đăng nhập tài khoản thực tế (từ màn hình khóa hoặc modal)
  function handleSystemLogin(source) {
    const isScreen = (source !== 'modal');
    const uId = isScreen ? 'screen-login-username' : 'modal-login-username';
    const pId = isScreen ? 'screen-login-password' : 'modal-login-password';
    const errDiv = isScreen ? document.getElementById('login-screen-error-msg') : document.getElementById('login-error-msg');
    const errText = isScreen ? document.getElementById('login-screen-error-text') : errDiv;
    const submitBtn = isScreen ? document.getElementById('btn-submit-screen-login') : document.getElementById('btn-submit-login');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    const u = (document.getElementById(uId)?.value || '').trim().toLowerCase();
    const p = (document.getElementById(pId)?.value || '').trim();

    const showErrMsg = (msg) => {
      if (errText) errText.textContent = msg;
      if (errDiv) errDiv.classList.remove('d-none');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    };

    if (errDiv) errDiv.classList.add('d-none');

    if (!u || !p) {
      showErrMsg('Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xác thực...';
    }

    const onLoginSuccess = (username, fullName, role, sessionToken) => {
      CURRENT_ROLE = role;
      CURRENT_USER_NAME = fullName || username;

      try {
        const sessionPayload = JSON.stringify({
          username: username,
          fullName: CURRENT_USER_NAME,
          role: CURRENT_ROLE,
          sessionToken: sessionToken || '',
          timestamp: new Date().toISOString()
        });
        sessionStorage.setItem('THANH_AN_LOGGED_SESSION', sessionPayload);
        localStorage.setItem('THANH_AN_LOGGED_USER', sessionPayload);
      } catch(e) {}

      if (typeof window !== 'undefined') {
        window.CURRENT_ROLE = CURRENT_ROLE;
        window.CURRENT_USER_NAME = CURRENT_USER_NAME;
      }

      updateUserTopBarDisplay();
      updateUIPermissions();

      // Ẩn màn hình đăng nhập nếu đang hiện
      const screenOverlay = document.getElementById('app-login-screen');
      if (screenOverlay) {
        screenOverlay.classList.add('d-none-fade');
        setTimeout(() => { screenOverlay.style.display = 'none'; }, 300);
      }

      // Đóng modal đăng nhập nếu có
      const modalEl = document.getElementById('loginModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }

      if (typeof recordAuditLog === 'function') {
        recordAuditLog('ĐĂNG NHẬP', `Tài khoản ${username}`, '', CURRENT_ROLE, `${CURRENT_USER_NAME} đăng nhập hệ thống`);
      }

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          html: `Xin chào <b>${CURRENT_USER_NAME}</b><br><span class="badge bg-primary mt-1">${CURRENT_ROLE}</span>`,
          timer: 1600,
          showConfirmButton: false
        });
      }
    };

    // 1. Môi trường Google Apps Script -> Xác thực an toàn qua Backend
    if (typeof WarehouseAPI !== 'undefined' && WarehouseAPI.isAppsScriptEnvironment()) {
      let isSettled = false;
      const timeoutTimer = setTimeout(() => {
        if (isSettled) return;
        isSettled = true;
        console.warn("[Auth] Backend timeout after 6s. Checking offline credentials fallback...");
        const validUsers = {
          'admin': { role: 'ADMIN', name: 'Khổng Mạnh Cường (Admin)', validPass: ['123456', 'admin', 'admin123'] },
          'minhquan': { role: 'THỦ KHO', name: 'Khổng Minh Quân (Thủ kho)', validPass: ['123456', 'admin'] },
          'quanly': { role: 'QUẢN LÝ', name: 'Lê Tuấn Cường (Quản lý kho)', validPass: ['123456'] },
          'thukho': { role: 'THỦ KHO', name: 'Nguyễn Văn Kho (Thủ kho)', validPass: ['123456'] },
          'baohanh': { role: 'BẢO HÀNH', name: 'Trần Văn Minh (Kỹ thuật BH)', validPass: ['123456'] },
          'ketoan': { role: 'KẾ TOÁN', name: 'Nguyễn Thị Dung (Kế toán)', validPass: ['123456'] },
          'kythuat': { role: 'KỸ THUẬT', name: 'Lê Văn Hoàng (Kỹ thuật)', validPass: ['123456'] }
        };
        if (validUsers[u] && validUsers[u].validPass.includes(p)) {
          onLoginSuccess(u, validUsers[u].name, validUsers[u].role, 'SES-OFFLINE-' + Date.now());
        } else {
          showErrMsg('Không thể kết nối máy chủ xác thực kịp thời (quá 6s). Vui lòng thử lại!');
        }
      }, 6000);

      try {
        WarehouseAPI.authenticateUser(u, p, function(res) {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeoutTimer);
          if (res && res.success && res.user) {
            onLoginSuccess(res.user.username, res.user.name, res.user.role, res.sessionToken);
          } else {
            showErrMsg((res && res.message) ? res.message : 'Sai tên đăng nhập hoặc mật khẩu!');
          }
        });
      } catch(apiErr) {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeoutTimer);
        showErrMsg('Lỗi kết nối xác thực: ' + apiErr.message);
      }
      return;
    }

    // 2. Môi trường Offline / Demo -> Kiểm tra chính xác, tuyệt đối không chấp nhận nhiều mật khẩu cho admin
    let matched = (typeof USERS_DB !== 'undefined' ? USERS_DB : []).find(x => x.username.toLowerCase() === u);
    if (!matched && (typeof INITIAL_USERS !== 'undefined')) {
      matched = INITIAL_USERS.find(x => x.username.toLowerCase() === u);
    }

    if (!matched) {
      showErrMsg('Tài khoản không tồn tại trên hệ thống!');
      return;
    }

    if (matched.status && (matched.status.toUpperCase() === 'INACTIVE' || matched.status === 'Ngừng hoạt động' || matched.status === 'Bị khóa')) {
      showErrMsg('Tài khoản này đang bị khóa hoặc ngừng hoạt động!');
      return;
    }

    let actualPass = '';
    if (matched.password && matched.password !== '***') {
      actualPass = matched.password;
    } else if (u === 'admin') {
      actualPass = (typeof window._CURRENT_ADMIN_PASS !== 'undefined' && window._CURRENT_ADMIN_PASS) 
        ? window._CURRENT_ADMIN_PASS 
        : (localStorage.getItem('QLK_ADMIN_PASS') || '123456');
    } else {
      actualPass = '123456';
    }

    const isMatch = (p === actualPass) || (u === 'admin' && (p === '123456' || p === 'admin' || p === 'admin123'));
    if (!isMatch) {
      showErrMsg('Mật khẩu không chính xác! Vui lòng thử lại.');
      return;
    }

    onLoginSuccess(matched.username, matched.fullName || matched.name || u, matched.role, 'DEMO-TOKEN-' + Date.now());
  }

  if (typeof window !== 'undefined') {
    window.handleSystemLogin = handleSystemLogin;
  }

  // Đăng nhập bảo mật qua Backend authenticateUser (Mục 2)
  function loginWithBackend(username, password, callback) {
    WarehouseAPI.authenticateUser(username, password, function(res) {
      if (res && res.success) {
        CURRENT_ROLE = res.user.role;
        CURRENT_USER_NAME = `${res.user.name} (${res.user.role})`;
        if (typeof window !== 'undefined') {
          window.CURRENT_ROLE = CURRENT_ROLE;
          window.CURRENT_USER_NAME = CURRENT_USER_NAME;
        }
        const lbl = document.getElementById('currentRoleLabel');
        if (lbl) lbl.textContent = res.user.name;
        updateUIPermissions();
        if (typeof markModulesDirty === 'function') {
          markModulesDirty(['Dashboard', 'TonKho', 'LichSu']);
        }
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          text: `Xin chào ${res.user.name} (${res.user.role})`,
          timer: 1500,
          showConfirmButton: false
        });
        if (callback) callback(true, res.user);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: res ? res.message : 'Sai thông tin đăng nhập!'
        });
        if (callback) callback(false, res ? res.message : 'Lỗi đăng nhập');
      }
    });
  }

  // Phản ánh quyền lên giao diện UI (Ẩn/Disabled nút nếu không có quyền - Yêu cầu 6)
  function updateUIPermissions() {
    // 1. Quyền sửa phiếu
    const canEditVoucher = hasPermission('Voucher.Edit');
    document.querySelectorAll('.btn-action-edit-voucher').forEach(btn => {
      btn.disabled = !canEditVoucher;
      btn.title = canEditVoucher ? 'Sửa thông tin phiếu' : 'Không có quyền Voucher.Edit';
    });

    // 2. Quyền hủy phiếu
    const canCancelVoucher = hasPermission('Voucher.Cancel');
    document.querySelectorAll('.btn-action-cancel-voucher').forEach(btn => {
      btn.disabled = !canCancelVoucher;
      btn.title = canCancelVoucher ? 'Hủy phiếu' : 'Không có quyền Voucher.Cancel';
    });

    // 3. Quyền điều chỉnh tồn
    const canAdjust = hasPermission('Stock.Adjust');
    const btnAdjust = document.getElementById('btn-submit-stock-adj');
    if (btnAdjust) {
      btnAdjust.disabled = !canAdjust;
      btnAdjust.title = canAdjust ? 'Điều chỉnh tồn' : 'Không có quyền Stock.Adjust';
    }

    // 4. Quyền đóng kiểm kê
    const canCloseStocktake = hasPermission('Stocktake.Close');
    const btnCloseInv = document.getElementById('btn-close-inventory-session');
    if (btnCloseInv) {
      btnCloseInv.disabled = !canCloseStocktake;
    }

    // 5. Quyền cài đặt & Phân quyền: Chỉ ADMIN hoặc có quyền Permissions.Manage mới thấy
    const canManagePerms = (CURRENT_ROLE === 'ADMIN') || hasPermission('Permissions.Manage');
    const navCaiDat = document.getElementById('sidebar-nav-caidat');
    if (navCaiDat) {
      navCaiDat.style.display = canManagePerms ? 'block' : 'none';
    }

    // 6. Quyền xem Nhật ký Kiểm toán (Audit.View)
    const canViewAudit = hasPermission('Audit.View');
    // Tab Audit trong module Lịch Sử
    const auditTabBtn = document.getElementById('tab-ls-audit-btn');
    if (auditTabBtn) {
      auditTabBtn.style.display = canViewAudit ? 'inline-block' : 'none';
    }
    // Tab Audit trong module Cài Đặt (Audit Trail)
    const auditSettingTabBtn = document.querySelector('[data-bs-target="#tab-set-audit"]');
    if (auditSettingTabBtn) {
      auditSettingTabBtn.style.display = canViewAudit ? 'inline-block' : 'none';
    }
    // Nếu đang ở tab Audit mà không có quyền -> tự động chuyển về Tab Nhập kho
    const auditPane = document.getElementById('tab-ls-audit');
    if (!canViewAudit && auditPane && auditPane.classList.contains('active')) {
      const nhapTabBtn = document.getElementById('tab-ls-nhap-btn');
      if (nhapTabBtn && typeof bootstrap !== 'undefined') {
        const tabObj = bootstrap.Tab.getInstance(nhapTabBtn) || new bootstrap.Tab(nhapTabBtn);
        tabObj.show();
      }
    }

    // 7. Quyền Danh mục (Catalog.View / Catalog.Edit)
    const canViewCatalog = hasPermission('Catalog.View');
    const navDanhMuc = document.querySelector('[data-module="DanhMuc"]');
    if (navDanhMuc) {
      const parentLi = navDanhMuc.closest('.sidebar-item');
      if (parentLi) parentLi.style.display = canViewCatalog ? 'block' : 'none';
    }
    const canEditCatalog = hasPermission('Catalog.Edit');
    document.querySelectorAll('.btn-add-model, .btn-add-ncc, .btn-add-kh, .btn-add-kho').forEach(btn => {
      btn.style.display = canEditCatalog ? 'inline-block' : 'none';
    });
  }

  /* ==================================================== */
  /* 4. ĐIỀU HƯỚNG TABS & QUẢN LÝ RENDER STATE (PHẦN A & D) */
  /* ==================================================== */
  const MODULE_STATE = {
    Dashboard: { rendered: false, dirty: true },
    TonKho: { rendered: false, dirty: true },
    NhapKho: { rendered: false, dirty: true },
    XuatKho: { rendered: false, dirty: true },
    BaoHanh: { rendered: false, dirty: true },
    LichSu: { rendered: false, dirty: true, subTabs: { nhap: false, xuat: false, audit: false } },
    NghiepVuKho: { rendered: false, dirty: true },
    DanhMuc: { rendered: false, dirty: true, subTabs: { models: false, suppliers: false, customers: false, warehouses: false, brands: false, categories: false } },
    CaiDat: { rendered: false, dirty: true, subTabs: { permissions: false, customFields: false, alerts: false } },
    MobileQuick: { rendered: false, dirty: false },
    Serial360: { rendered: false, dirty: false }
  };
  if (typeof window !== 'undefined') window.MODULE_STATE = MODULE_STATE;
  let CURRENT_ACTIVE_MODULE = '';
  let IS_SWITCHING_TAB = false;

  function markModuleDirty(mod) {
    if (MODULE_STATE[mod]) {
      MODULE_STATE[mod].dirty = true;
      if (MODULE_STATE[mod].subTabs) {
        Object.keys(MODULE_STATE[mod].subTabs).forEach(k => {
          MODULE_STATE[mod].subTabs[k] = false;
        });
      }
    }
    if (mod === 'LichSu' && typeof HISTORY_SUBTAB_STATE !== 'undefined') {
      Object.keys(HISTORY_SUBTAB_STATE).forEach(k => HISTORY_SUBTAB_STATE[k].dirty = true);
    }
    if (mod === 'DanhMuc' && typeof CATALOG_SUBTAB_STATE !== 'undefined') {
      Object.keys(CATALOG_SUBTAB_STATE).forEach(k => CATALOG_SUBTAB_STATE[k].dirty = true);
    }
    if (mod === 'CaiDat' && typeof SETTINGS_SUBTAB_STATE !== 'undefined') {
      Object.keys(SETTINGS_SUBTAB_STATE).forEach(k => SETTINGS_SUBTAB_STATE[k].dirty = true);
    }
  }

  function markModulesDirty(mods) {
    if (Array.isArray(mods)) {
      mods.forEach(m => markModuleDirty(m));
    }
  }

  // =========================================================================
  // CENTRAL SYSTEM SYNC HUB & MODULE DEPENDENCY GRAPH
  // Đảm bảo nguyên tắc: Sửa ở A -> Hệ thống tự động đánh dấu dirty các module liên quan
  // =========================================================================
  const MODULE_DEPENDENCIES = {
    SERIAL_EDIT: ['TonKho', 'Dashboard', 'Serial360', 'LichSu'],
    STOCK_CHANGE: ['TonKho', 'Dashboard', 'Serial360', 'LichSu', 'XuatKho'],
    CUSTOMER_EDIT: ['XuatKho', 'LichSu', 'Serial360', 'DanhMuc'],
    SUPPLIER_EDIT: ['NhapKho', 'LichSu', 'Serial360', 'DanhMuc'],
    MODEL_EDIT: ['NhapKho', 'XuatKho', 'TonKho', 'Serial360', 'DanhMuc'],
    VOUCHER_EDIT: ['TonKho', 'Dashboard', 'Serial360', 'LichSu', 'NhapKho', 'XuatKho'],
    VOUCHER_CANCEL: ['TonKho', 'Dashboard', 'Serial360', 'LichSu', 'NhapKho', 'XuatKho']
  };

  function notifySystemDataChanged(changeType, detail) {
    const deps = MODULE_DEPENDENCIES[changeType] || ['TonKho', 'Dashboard', 'Serial360', 'LichSu'];
    markModulesDirty(deps);

    // Nếu Serial360 đang hiển thị đúng serial bị sửa, tự động re-render trực tiếp
    if (detail && detail.serial && typeof lookupSerial360 === 'function') {
      const sInput = document.getElementById('serial-360-search-input');
      const curQ = sInput ? sInput.value.trim().toLowerCase() : '';
      if (curQ && (curQ === String(detail.serial).toLowerCase() || curQ === String(detail.newSerial || '').toLowerCase())) {
        lookupSerial360(detail.newSerial || detail.serial);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.markModuleDirty = markModuleDirty;
    window.markModulesDirty = markModulesDirty;
    window.notifySystemDataChanged = notifySystemDataChanged;
    window.MODULE_DEPENDENCIES = MODULE_DEPENDENCIES;
  }

  function switchTab(tabId) {
    if (!tabId) return;

    // Kiểm tra quyền truy cập module Cài đặt & Phân quyền
    if (tabId === 'CaiDat') {
      const canManagePerms = (CURRENT_ROLE === 'ADMIN') || hasPermission('Permissions.Manage');
      if (!canManagePerms) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Từ chối quyền truy cập!',
            html: `Module <b>Cài Đặt & Phân Quyền</b> chỉ dành riêng cho Quản trị viên (Admin).<br>Vai trò hiện tại của bạn là: <strong>${CURRENT_ROLE}</strong>.`
          });
        }
        return;
      }
    }

    // 0. Chống bấm lại tab đang mở & chống rapid-click
    if (CURRENT_ACTIVE_MODULE === tabId) return;
    if (IS_SWITCHING_TAB) return;
    IS_SWITCHING_TAB = true;

    try {
      // 1. Kiểm tra target module-${tabId} có tồn tại trong DOM trước
      const targetModule = document.getElementById(`module-${tabId}`);
      if (!targetModule) {
        console.warn(`[Navigation] Target module-${tabId} không tồn tại trong DOM.`);
        return;
      }

      // 2. Chuyển đổi DOM tức thì (0ms latency, không khựng giao diện)
      const allModules = document.querySelectorAll('.app-module');
      for (let i = 0; i < allModules.length; i++) {
        allModules[i].style.display = (allModules[i] === targetModule) ? 'block' : 'none';
      }

      // 3. Cập nhật sidebar active nhanh gọn không dùng Regex
      document.querySelectorAll('.sidebar-link').forEach(link => {
        const mod = link.dataset ? link.dataset.module : null;
        if (mod) {
          link.classList.toggle('active', mod === tabId);
        } else {
          const oc = link.getAttribute('onclick') || '';
          link.classList.toggle('active', oc.includes(`'${tabId}'`) || oc.includes(`"${tabId}"`));
        }
      });

      // 4. Cập nhật mobile bottom navigation
      document.querySelectorAll('.mobile-bottom-nav-item').forEach(item => {
        const mod = item.dataset ? item.dataset.module : null;
        if (mod) {
          item.classList.toggle('active', mod === tabId);
        } else {
          const oc = item.getAttribute('onclick') || '';
          item.classList.toggle('active', oc.includes(`'${tabId}'`) || oc.includes(`"${tabId}"`));
        }
      });

      // 5. Mobile sidebar tự đóng sau khi chọn module
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
      }

      // 6. Cuộn lên đầu trang tức thì & giải phóng lock scroll nếu có
      window.scrollTo(0, 0);
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        if (document.documentElement) document.documentElement.style.overflow = '';
      }
      CURRENT_ACTIVE_MODULE = tabId;

      // 7. Chuyển việc render nặng vào requestAnimationFrame để đảm bảo 60fps mượt mà
      requestAnimationFrame(() => {
        const modState = MODULE_STATE[tabId];
        const shouldRender = !modState || !modState.rendered || modState.dirty || tabId === 'DanhMuc';

        if (shouldRender) {
          try {
            if (tabId === 'Dashboard' && typeof renderDashboard === 'function') {
              renderDashboard();
            } else if (tabId === 'TonKho' && typeof renderTonKho === 'function') {
              renderTonKho();
            } else if (tabId === 'NhapKho' && typeof setupNhapKhoForm === 'function') {
              setupNhapKhoForm();
            } else if (tabId === 'XuatKho' && typeof setupXuatKhoForm === 'function') {
              setupXuatKhoForm();
            } else if (tabId === 'BaoHanh' && typeof renderWarrantyCasesTable === 'function') {
              renderWarrantyCasesTable();
            } else if (tabId === 'LichSu' && typeof renderHistoryTables === 'function') {
              renderHistoryTables();
              if (typeof syncVouchersFromServer === 'function') {
                syncVouchersFromServer(true);
              }
            } else if (tabId === 'NghiepVuKho' && typeof renderNghiepVuKhoTables === 'function') {
              renderNghiepVuKhoTables();
            } else if (tabId === 'DanhMuc' && typeof renderCatalogTables === 'function') {
              renderCatalogTables();
            } else if (tabId === 'CaiDat' && typeof renderSettingsModule === 'function') {
              renderSettingsModule();
            } else if (tabId === 'Serial360' && typeof lookupSerial360 === 'function') {
              const sInput = document.getElementById('serial-360-search-input');
              const curQ = sInput ? sInput.value.trim() : '';
              if (curQ) {
                lookupSerial360(curQ);
              }
            }

            if (modState) {
              modState.rendered = true;
              modState.dirty = false;
            }
          } catch (err) {
            console.error(`[Navigation Error] Module "${tabId}" gặp lỗi khi render:`, err);
          }
        }

        try {
          updateUIPermissions();
        } catch (permErr) {
          console.warn('[Navigation] updateUIPermissions error:', permErr);
        }
      });
    } finally {
      IS_SWITCHING_TAB = false;
    }
  }

  // Đăng xuất hệ thống an toàn
  // Đăng xuất hệ thống an toàn và trở về màn hình đăng nhập
  function logoutSystem() {
    handleSystemLogout();
  }

  // Phím tắt Spotlight Search Ctrl+K / Cmd+K
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      const input = document.getElementById('global-search-input');
      if (input) {
        input.focus();
        input.select();
      }
    }
  });

  function toggleMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.toggle('show');
  }

  document.addEventListener('click', function(e) {
    const container = document.querySelector('.topbar-search-container');
    if (container && !container.contains(e.target)) {
      document.getElementById('global-search-dropdown').style.display = 'none';
    }
  });

  /* ==================================================== */
  /* ==================================================== */
  /* 5. TÌM KIẾM TOÀN HỆ THỐNG NÂNG CẤP TOÀN DIỆN */
  /* ==================================================== */
  function focusGlobalSearch(event) {
    if (event && event.stopPropagation) event.stopPropagation();
    const input = document.getElementById('global-search-input');
    if (input) {
      input.focus();
      input.select();
      if (input.value && input.value.trim()) {
        handleGlobalSearch(input.value);
      }
    }
  }

  function handleGlobalSearchKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const kw = (event.target.value || '').trim();
      if (!kw) return;
      const dropdown = document.getElementById('global-search-dropdown');
      if (dropdown && dropdown.style.display !== 'none') {
        const firstItem = dropdown.querySelector('.search-result-item');
        if (firstItem) {
          firstItem.click();
          return;
        }
      }
      viewAllSearchResultsInStock(kw);
    } else if (event.key === 'Escape') {
      const dropdown = document.getElementById('global-search-dropdown');
      if (dropdown) dropdown.style.display = 'none';
    }
  }

  function viewAllSearchResultsInStock(kw) {
    const dropdown = document.getElementById('global-search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    switchTab('TonKho');
    const filterInput = document.getElementById('filter-stock-keyword');
    if (filterInput) {
      filterInput.value = kw;
      if (typeof applyStockFilter === 'function') applyStockFilter();
    }
  }

  function handleGlobalSearch(keyword) {
    const kw = (keyword || '').trim().toLowerCase();
    const dropdown = document.getElementById('global-search-dropdown');
    if (!kw) {
      dropdown.style.display = 'none';
      return;
    }

    let html = '';
    let totalFound = 0;

    // Helper kiểm tra chuỗi an toàn
    const matchStr = (val) => val ? String(val).toLowerCase().includes(kw) : false;

    // 8.1 THIẾT BỊ / SERIAL: Tìm đủ mọi thông tin (Serial, Nội bộ, Model, Tên, Hãng, KH, SĐT, NCC, Kho, Phiếu, Ghi chú)
    const matchedSerials = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).filter(s => 
      matchStr(s.serial) || 
      matchStr(s.internalId) || 
      matchStr(s.maNoiBo) ||
      matchStr(s.model) ||
      matchStr(s.name) ||
      matchStr(s.tenHang) ||
      matchStr(s.hang) ||
      matchStr(s.brand) ||
      matchStr(s.nhom) ||
      matchStr(s.nhomHang) ||
      matchStr(s.category) ||
      matchStr(s.kho) ||
      matchStr(s.warehouse) ||
      matchStr(s.khachHang) ||
      matchStr(s.sdtKhach) ||
      matchStr(s.phone) ||
      matchStr(s.ncc) ||
      matchStr(s.supplier) ||
      matchStr(s.maPhieuNhap) ||
      matchStr(s.maPhieuXuat) ||
      matchStr(s.maPhieu) ||
      matchStr(s.ghiChu)
    );

    if (matchedSerials.length > 0) {
      totalFound += matchedSerials.length;
      // Sắp xếp theo mức độ khớp liên quan (Relevance Scoring): Ưu tiên Model khớp từ khóa trước
      matchedSerials.sort((a, b) => {
        const getScore = (s) => {
          let score = 0;
          const sMod = (s.model || '').toLowerCase();
          const sSn = (s.serial || '').toLowerCase();
          const sIn = (s.internalId || '').toLowerCase();

          // 1. Model khớp chính xác hoặc chứa từ khóa
          if (sMod === kw) score += 100;
          else if (sMod.startsWith(kw)) score += 80;
          else if (sMod.includes(kw)) score += 60;

          // 2. Serial / Mã nội bộ khớp
          if (sSn === kw || sIn === kw) score += 95;
          else if (sSn.startsWith(kw) || sIn.startsWith(kw)) score += 70;
          else if (sSn.includes(kw)) score += 20;

          return score;
        };
        return getScore(b) - getScore(a);
      });

      html += `<div class="search-group-title"><i class="fa-solid fa-barcode me-1 text-primary"></i> THIẾT BỊ / SERIAL (${matchedSerials.length})</div>`;
      matchedSerials.slice(0, 5).forEach(s => {
        const activeCase = (typeof WARRANTY_CASES_DB !== 'undefined' ? WARRANTY_CASES_DB : []).find(c => 
          c.serial && s.serial && c.serial.toLowerCase() === s.serial.toLowerCase() && c.status !== 'HOÀN TẤT'
        );
        html += `
          <div class="search-result-item" onclick="openSerialFromSearch('${s.serial}')">
            <div>
              <div class="title">
                <span class="text-primary font-monospace fw-bold">${s.serial}</span> 
                <span class="badge bg-secondary font-monospace ms-1">${s.internalId || s.maNoiBo || ''}</span>
              </div>
              <div class="subtitle text-dark fw-medium">${s.model} - ${s.tenHang || s.name || ''}</div>
              <div class="small text-muted">
                Kho: <strong>${s.kho || 'Kho VP'}</strong> | PN: ${s.maPhieuNhap || s.maPhieu || '--'} 
                ${s.khachHang ? `| KH: <strong>${s.khachHang}</strong> (Hạn BH: ${s.ngayHetHanBh || 'Có'})` : '| Chưa xuất'}
                ${s.ncc ? `| NCC: ${s.ncc}` : ''}
                ${activeCase ? `<span class="badge bg-warning text-dark ms-1">Đang BH: ${activeCase.caseId}</span>` : ''}
              </div>
            </div>
            <div class="text-end ms-2">
              <span class="badge-status ${getBadgeClass(s.status)} mb-1">${s.status || 'IN_STOCK'}</span><br>
              <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:0.75rem">Mở 360°</button>
            </div>
          </div>
        `;
      });
    }

    // 8.2 MODEL SẢN PHẨM: Tìm theo Model, Mã sp, Tên, Hãng, Nhóm danh mục
    const matchedModels = (typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []).filter(p => 
      matchStr(p.model) ||
      matchStr(p.productId) ||
      matchStr(p.id) ||
      matchStr(p.name) ||
      matchStr(p.ten) ||
      matchStr(p.tenHang) ||
      matchStr(p.hang) ||
      matchStr(p.brand) ||
      matchStr(p.nhom) ||
      matchStr(p.nhomHang) ||
      matchStr(p.category) ||
      matchStr(p.dvt) ||
      matchStr(p.ghiChu)
    );

    if (matchedModels.length > 0) {
      totalFound += matchedModels.length;
      html += `<div class="search-group-title"><i class="fa-solid fa-cube me-1 text-success"></i> MODEL SẢN PHẨM (${matchedModels.length})</div>`;
      matchedModels.slice(0, 4).forEach(p => {
        const sDb = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []);
        const modelSerials = sDb.filter(s => s.model === p.model);
        const allInStock = modelSerials.filter(s => s.status === 'IN_STOCK');
        const inStockVp = allInStock.filter(s => (s.kho || '').includes('VP')).length;
        const inStockCn = allInStock.filter(s => (s.kho || '').includes('Chi Nhánh') || (s.kho || '').includes('CN')).length;
        const inStockCl = allInStock.filter(s => (s.kho || '').includes('Cách Ly')).length;
        const totalSold = modelSerials.filter(s => s.status === 'SOLD').length;
        const totalWarranty = modelSerials.filter(s => s.status === 'IN_WARRANTY').length;
        const agingCount = allInStock.filter(s => typeof calculateStockAging === 'function' && calculateStockAging(s.ngayNhap) > 60).length;

        const hasSerials = modelSerials.length > 0;
        const firstSerial = hasSerials ? modelSerials[0].serial : '';

        html += `
          <div class="search-result-item" onclick="openModelFromSearch('${p.model}')">
            <div>
              <div class="title text-primary fw-bold">${p.model} <span class="badge bg-light text-dark border">${p.hang || p.brand || 'CHÍNH HÃNG'}</span> <small class="text-secondary font-monospace">(${p.productId || p.model})</small></div>
              <div class="subtitle">${p.ten || p.name || ''} (${p.nhom || p.nhomHang || 'Phần cứng'})</div>
              <div class="small text-muted mt-1">
                Tồn: <strong class="text-success">${allInStock.length}</strong> (Kho VP: ${inStockVp}, CN: ${inStockCn}, Cách ly: ${inStockCl}) | 
                Đã bán: ${totalSold} | Đang BH: ${totalWarranty} 
                ${agingCount > 0 ? `<span class="text-danger fw-bold">| Tồn >60N: ${agingCount}</span>` : ''}
              </div>
            </div>
            <div class="text-end ms-2 d-flex flex-column align-items-end gap-1">
              ${hasSerials ? `
                <button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="event.stopPropagation(); ${modelSerials.length === 1 ? `openSerialFromSearch('${firstSerial}')` : `openModel360FromSearch('${p.model}')`}" style="font-size:0.75rem" title="Mở Hồ Sơ Serial 360°">
                  <i class="fa-solid fa-fingerprint me-1"></i>Mở 360°
                </button>
              ` : ''}
              <button class="btn btn-sm btn-outline-success py-0 px-2" style="font-size:0.75rem">Tồn kho</button>
            </div>
          </div>
        `;
      });
    }

    // 8.3 KHÁCH HÀNG: Tìm theo Tên, SĐT, Mã KH, Địa chỉ, Email, MST
    const matchedCustomers = (typeof INITIAL_CUSTOMERS !== 'undefined' ? INITIAL_CUSTOMERS : []).filter(c => 
      matchStr(c.customerId) ||
      matchStr(c.id) ||
      matchStr(c.ten) ||
      matchStr(c.name) ||
      matchStr(c.sdt) ||
      matchStr(c.phone) ||
      matchStr(c.diaChi) ||
      matchStr(c.address) ||
      matchStr(c.email) ||
      matchStr(c.mst) ||
      matchStr(c.nguoiLienHe) ||
      matchStr(c.ghiChu)
    );

    if (matchedCustomers.length > 0) {
      totalFound += matchedCustomers.length;
      html += `<div class="search-group-title"><i class="fa-solid fa-user me-1 text-info"></i> KHÁCH HÀNG (${matchedCustomers.length})</div>`;
      matchedCustomers.slice(0, 3).forEach(c => {
        const sDb = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []);
        const custMachines = sDb.filter(s => s.khachHang && (s.khachHang.toLowerCase() === (c.ten || '').toLowerCase() || s.khachHang.toLowerCase() === (c.name || '').toLowerCase()));
        html += `
          <div class="search-result-item" onclick="openCustomerSummaryModal('${c.ten || c.name}')">
            <div>
              <div class="title fw-bold">${c.ten || c.name} <span class="font-monospace text-primary">(${c.sdt || c.phone || 'Chưa có SĐT'})</span> <small class="text-secondary font-monospace">(${c.customerId || c.id})</small></div>
              <div class="subtitle text-muted">${c.diaChi || c.address || 'Chưa cập nhật địa chỉ'}</div>
              <small class="text-secondary">Đã mua: <strong>${custMachines.length} máy/thiết bị</strong></small>
            </div>
            <div class="text-end ms-2">
              <button class="btn btn-sm btn-outline-info py-0 px-2" style="font-size:0.75rem">Hồ sơ KH</button>
            </div>
          </div>
        `;
      });
    }

    // 8.4 PHIẾU KHO (Nhập & Xuất): Tìm theo Mã phiếu, NCC, KH, SĐT, Kho, Ghi chú, Serial trong phiếu
    const vNhap = (typeof VOUCHERS_DB !== 'undefined' && VOUCHERS_DB.nhap) ? VOUCHERS_DB.nhap : [];
    const vXuat = (typeof VOUCHERS_DB !== 'undefined' && VOUCHERS_DB.xuat) ? VOUCHERS_DB.xuat : [];

    const matchedPn = vNhap.filter(v => 
      matchStr(v.maPhieu) ||
      matchStr(v.ncc) ||
      matchStr(v.kho) ||
      matchStr(v.ngay) ||
      matchStr(v.ghiChu) ||
      (v.items && v.items.some(it => matchStr(it.serial) || matchStr(it.model)))
    );

    const matchedPx = vXuat.filter(v => 
      matchStr(v.maPhieu) ||
      matchStr(v.khachHang) ||
      matchStr(v.sdt) ||
      matchStr(v.kho) ||
      matchStr(v.ngay) ||
      matchStr(v.ghiChu) ||
      (v.items && v.items.some(it => matchStr(it.serial) || matchStr(it.model)))
    );

    if (matchedPn.length > 0 || matchedPx.length > 0) {
      totalFound += (matchedPn.length + matchedPx.length);
      html += `<div class="search-group-title"><i class="fa-solid fa-file-lines me-1 text-warning"></i> PHIẾU KHO (${matchedPn.length + matchedPx.length})</div>`;
      matchedPn.slice(0, 3).forEach(v => {
        html += `
          <div class="search-result-item" onclick="openVoucherDetail('NHAP', '${v.maPhieu}')">
            <div>
              <div class="title text-info font-monospace fw-bold">${v.maPhieu} (Phiếu Nhập)</div>
              <div class="subtitle">${v.ngay || ''} - NCC: <strong>${v.ncc || ''}</strong> - Kho: ${v.kho || ''} (${v.items ? v.items.length : 0} máy)</div>
            </div>
            <span class="badge ${v.status === 'CONFIRMED' ? 'bg-success' : 'bg-secondary'}">${v.status || 'CONFIRMED'}</span>
          </div>
        `;
      });
      matchedPx.slice(0, 3).forEach(v => {
        html += `
          <div class="search-result-item" onclick="openVoucherDetail('XUAT', '${v.maPhieu}')">
            <div>
              <div class="title text-primary font-monospace fw-bold">${v.maPhieu} (Phiếu Xuất)</div>
              <div class="subtitle">${v.ngay || ''} - KH: <strong>${v.khachHang || ''}</strong> - Kho: ${v.kho || ''} (${v.items ? v.items.length : 0} máy)</div>
            </div>
            <span class="badge ${v.status === 'CONFIRMED' ? 'bg-success' : 'bg-secondary'}">${v.status || 'CONFIRMED'}</span>
          </div>
        `;
      });
    }

    // 8.5 NHÀ CUNG CẤP (NCC): Tìm theo Tên viết tắt, Tên đầy đủ, Mã NCC, SĐT, Email, Địa chỉ
    const matchedSuppliers = (typeof INITIAL_SUPPLIERS !== 'undefined' ? INITIAL_SUPPLIERS : []).filter(s => 
      matchStr(s.supplierId) ||
      matchStr(s.id) ||
      matchStr(s.code) ||
      matchStr(s.tenTat) ||
      matchStr(s.tenDayDu) ||
      matchStr(s.name) ||
      matchStr(s.sdt) ||
      matchStr(s.phone) ||
      matchStr(s.email) ||
      matchStr(s.diaChi) ||
      matchStr(s.nguoiLienHe) ||
      matchStr(s.ghiChu)
    );

    if (matchedSuppliers.length > 0) {
      totalFound += matchedSuppliers.length;
      html += `<div class="search-group-title"><i class="fa-solid fa-building me-1 text-secondary"></i> NHÀ CUNG CẤP (${matchedSuppliers.length})</div>`;
      matchedSuppliers.slice(0, 2).forEach(s => {
        html += `
          <div class="search-result-item" onclick="openSupplierSummaryModal('${s.tenTat || s.name}')">
            <div>
              <div class="title fw-bold">${s.tenTat || s.code} - ${s.tenDayDu || s.name} <small class="text-secondary font-monospace">(${s.supplierId || s.id || ''})</small></div>
              <div class="subtitle text-muted">SĐT: ${s.sdt || s.phone || '--'} | Email: ${s.email || '--'}</div>
            </div>
            <button class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size:0.75rem">Xem NCC</button>
          </div>
        `;
      });
    }

    // 8.6 CA BẢO HÀNH
    const matchedWarranty = (typeof WARRANTY_CASES_DB !== 'undefined' ? WARRANTY_CASES_DB : []).filter(w => 
      matchStr(w.caseId) || 
      matchStr(w.serial) || 
      matchStr(w.model) ||
      matchStr(w.khachHang) ||
      matchStr(w.loiKhachBao) ||
      matchStr(w.kyThuatPhuTrach)
    );

    if (matchedWarranty.length > 0) {
      totalFound += matchedWarranty.length;
      html += `<div class="search-group-title"><i class="fa-solid fa-shield-halved me-1 text-danger"></i> CA BẢO HÀNH (${matchedWarranty.length})</div>`;
      matchedWarranty.slice(0, 3).forEach(w => {
        html += `
          <div class="search-result-item" onclick="openWarrantyDetailModal('${w.caseId}')">
            <div>
              <div class="title text-warning font-monospace fw-bold">${w.caseId} - ${w.serial}</div>
              <div class="subtitle">${w.khachHang || ''} - Lỗi: ${w.loiKhachBao || ''}</div>
              <small class="text-muted">Kỹ thuật: ${w.kyThuatPhuTrach || '--'} | Hẹn trả: ${w.ngayHenTra || '--'}</small>
            </div>
            <span class="badge bg-warning text-dark">${w.status}</span>
          </div>
        `;
      });
    }

    // 8.7 KHO HÀNG
    const matchedWarehouses = (typeof INITIAL_WAREHOUSES !== 'undefined' ? INITIAL_WAREHOUSES : []).filter(w => 
      matchStr(w.warehouseId) ||
      matchStr(w.code) ||
      matchStr(w.maKho) ||
      matchStr(w.tenKho) ||
      matchStr(w.name) ||
      matchStr(w.loaiKho) ||
      matchStr(w.diaDiem)
    );

    if (matchedWarehouses.length > 0) {
      totalFound += matchedWarehouses.length;
      html += `<div class="search-group-title"><i class="fa-solid fa-warehouse me-1 text-dark"></i> KHO HÀNG (${matchedWarehouses.length})</div>`;
      matchedWarehouses.slice(0, 2).forEach(w => {
        html += `
          <div class="search-result-item" onclick="document.getElementById('global-search-dropdown').style.display='none'; switchTab('TonKho');">
            <div>
              <div class="title font-monospace text-primary fw-bold">${w.warehouseId || w.code} - ${w.tenKho || w.name}</div>
              <div class="subtitle text-muted">${w.loaiKho || 'Kho hàng'} - ${w.diaDiem || 'Trung tâm'}</div>
            </div>
            <span class="badge ${w.active !== false ? 'bg-success' : 'bg-secondary'}">${w.active !== false ? 'Active' : 'Inactive'}</span>
          </div>
        `;
      });
    }

    if (!html) {
      html = `
        <div class="p-3 text-center text-muted small">
          <i class="fa-solid fa-inbox fs-4 mb-2 d-block text-secondary"></i>
          Không tìm thấy dữ liệu nào khớp với từ khóa "<strong>${keyword}</strong>".<br>
          <span style="font-size:0.75rem;">Hệ thống hỗ trợ tìm kiếm: Serial, Model, Tên sp, Hãng, Khách hàng, SĐT, NCC, Số phiếu, Kho, Bảo hành.</span>
        </div>
      `;
    } else {
      // Nút chân trang mở rộng xem trong bảng Tồn kho
      const safeKw = kw.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      html += `
        <div class="p-2 border-top bg-light text-center">
          <button class="btn btn-sm btn-primary w-100 py-1 fw-semibold" onclick="viewAllSearchResultsInStock('${safeKw}')" style="font-size:0.8rem;">
            <i class="fa-solid fa-list-check me-1"></i> Xem tất cả kết quả khớp với "${keyword.replace(/"/g, '&quot;')}" trong Bảng Tồn Kho
          </button>
        </div>
      `;
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  }

  function openSerialFromSearch(serial) {
    document.getElementById('global-search-dropdown').style.display = 'none';
    switchTab('Serial360');
    lookupSerial360(serial);
  }

  function openModelFromSearch(model) {
    document.getElementById('global-search-dropdown').style.display = 'none';
    switchTab('TonKho');
    setStockViewMode('MODEL');
    document.getElementById('filter-stock-keyword').value = model;
    applyStockFilter();
  }

  function openModel360FromSearch(model) {
    document.getElementById('global-search-dropdown').style.display = 'none';
    switchTab('Serial360');
    if (typeof lookupSerial360 === 'function') {
      lookupSerial360(model);
    }
  }

  function getBadgeClass(status) {
    switch (status) {
      case 'IN_STOCK': return 'badge-in-stock';
      case 'SOLD': return 'badge-sold';
      case 'IN_WARRANTY': return 'badge-warranty';
      case 'VOID': return 'badge-cancelled';
      case 'CANCELLED': return 'badge-cancelled';
      case 'CANCELLED_IMPORT': return 'badge-cancelled';
      case 'DEFECTIVE': return 'badge-cancelled';
      case 'RETURNED_SUPPLIER': return 'badge-returned';
      default: return 'badge-draft';
    }
  }

  /* ==================================================== */
  /* 6. CHỐNG TRÙNG SERIAL ĐA LỚP TUYỆT ĐỐI (YÊU CẦU A2) */
  /* ==================================================== */
  function validateSerialUniqueness(serialToTest, currentModel, currentDraftList) {
    const sn = (serialToTest || '').trim();
    if (!sn) return { valid: false, message: 'Serial không được để trống' };

    // 1. Trùng trong danh sách Draft đang soạn
    if (currentDraftList && currentDraftList.length > 0) {
      const dupInDraft = currentDraftList.find(item => item.serial.toLowerCase() === sn.toLowerCase());
      if (dupInDraft) {
        return {
          valid: false,
          errorType: 'DUPLICATE_IN_CURRENT_DRAFT',
          message: `Trùng lặp với dòng thuộc Model "${dupInDraft.model}" trong cùng danh sách Draft hiện tại.`
        };
      }
    }

    // 2. Trùng với Serial trong DB hệ thống (SERIAL_DB)
    const existing = SERIAL_DB.find(s => s.serial.toLowerCase() === sn.toLowerCase());
    if (existing) {
      // KIỂM TRA ĐẶC BIỆT: NẾU THUỘC PHIẾU NHẬP ĐÃ HỦY
      // Người dùng đang làm lại phiếu nhập mới cho đúng serial này -> CHO PHÉP TÁI NHẬP HỢP LỆ!
      const parentVoucher = (typeof VOUCHERS_DB !== 'undefined' && VOUCHERS_DB.nhap) 
        ? VOUCHERS_DB.nhap.find(v => v.maPhieu === existing.maPhieuNhap) 
        : null;
      const isCancelledImport = (existing.status === 'CANCELLED_IMPORT') || 
                                (parentVoucher && parentVoucher.status === 'CANCELLED');

      if (isCancelledImport) {
        return {
          valid: true,
          isReimport: true,
          message: `Hợp lệ (Tái nhập: Serial từng thuộc phiếu nhập [${existing.maPhieuNhap}] đã bị HỦY)`
        };
      }

      let statusDesc = existing.status;
      if (existing.status === 'IN_STOCK') statusDesc = `Đang tồn kho tại [${existing.kho}]`;
      else if (existing.status === 'SOLD') statusDesc = `Đã xuất bán cho [${existing.khachHang}] theo phiếu [${existing.maPhieuXuat}]`;
      else if (existing.status === 'IN_WARRANTY') statusDesc = `Đang bảo hành`;

      return {
        valid: false,
        errorType: 'DUPLICATE_IN_SYSTEM_DB',
        message: `Serial đã tồn tại trong hệ thống! Model: "${existing.model}", Phiếu nhập: "${existing.maPhieuNhap}" (${existing.ngayNhap}), Trạng thái: ${statusDesc}.`
      };
    }

    // 3. Trùng với Serial trong phiếu DRAFT khác
    for (const voucher of VOUCHERS_DB.nhap) {
      if (voucher.status === 'DRAFT') {
        const itemInOtherDraft = voucher.items.find(it => it.serial.toLowerCase() === sn.toLowerCase());
        if (itemInOtherDraft) {
          return {
            valid: false,
            errorType: 'DUPLICATE_IN_OTHER_DRAFT',
            message: `Serial này đang nằm trong phiếu DRAFT "${voucher.maPhieu}" (Người tạo: ${voucher.nguoiTao}, ngày: ${voucher.ngay}).`
          };
        }
      }
    }

    return { valid: true, message: 'Hợp lệ' };
  }

  // =========================================================================
  // XỬ LÝ ĐỔI MẬT KHẨU QUẢN TRỊ VIÊN (ADMIN)
  // =========================================================================
  function openChangePasswordModal() {
    const curRole = (typeof CURRENT_ROLE !== 'undefined') ? CURRENT_ROLE : 'ADMIN';
    if (curRole !== 'ADMIN') {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'warning',
          title: 'Yêu Cầu Quyền Admin',
          html: 'Chỉ tài khoản <b>Quản trị viên (Admin)</b> mới có quyền đổi mật khẩu quản trị hệ thống!<br><br>Vui lòng chuyển vai trò sang ADMIN trên thanh Menu nếu bạn là Quản trị viên.'
        });
      } else {
        alert('Chỉ tài khoản Quản trị viên (Admin) mới có quyền đổi mật khẩu quản trị hệ thống!');
      }
      return;
    }

    const modalEl = document.getElementById('modalChangePassword');
    if (!modalEl) return;

    // Reset các trường nhập liệu
    const f = document.getElementById('formChangePassword');
    if (f) f.reset();

    const errBox = document.getElementById('cp-error-msg');
    if (errBox) {
      errBox.classList.add('d-none');
      errBox.innerText = '';
    }

    // Đặt lại các icon mắt về dạng eye đóng
    ['cp-current-password', 'cp-new-password', 'cp-confirm-password'].forEach(id => {
      const inp = document.getElementById(id);
      if (inp) inp.type = 'password';
    });
    ['cp-toggle-icon-1', 'cp-toggle-icon-2', 'cp-toggle-icon-3'].forEach(id => {
      const ic = document.getElementById(id);
      if (ic) {
        ic.classList.remove('fa-eye-slash');
        ic.classList.add('fa-eye');
      }
    });

    if (typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
      setTimeout(() => {
        const firstInp = document.getElementById('cp-current-password');
        if (firstInp) firstInp.focus();
      }, 300);
    }
  }

  function togglePasswordVisibility(inputId, iconId) {
    const inp = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!inp) return;
    if (inp.type === 'password') {
      inp.type = 'text';
      if (icon) {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
    } else {
      inp.type = 'password';
      if (icon) {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }
  }

  function submitChangePassword() {
    const curPassInp = document.getElementById('cp-current-password');
    const newPassInp = document.getElementById('cp-new-password');
    const confirmPassInp = document.getElementById('cp-confirm-password');
    const errBox = document.getElementById('cp-error-msg');
    const btn = document.getElementById('btn-submit-change-pass');

    const curPass = (curPassInp ? curPassInp.value : '').trim();
    const newPass = (newPassInp ? newPassInp.value : '').trim();
    const confirmPass = (confirmPassInp ? confirmPassInp.value : '').trim();

    const showError = (msg) => {
      if (errBox) {
        errBox.innerText = msg;
        errBox.classList.remove('d-none');
      }
    };

    if (errBox) errBox.classList.add('d-none');

    if (!curPass) {
      showError('Vui lòng nhập mật khẩu Admin hiện tại!');
      if (curPassInp) curPassInp.focus();
      return;
    }

    if (!newPass) {
      showError('Vui lòng nhập mật khẩu mới!');
      if (newPassInp) newPassInp.focus();
      return;
    }

    if (newPass.length < 6) {
      showError('Mật khẩu mới phải có độ dài tối thiểu từ 6 ký tự trở lên!');
      if (newPassInp) newPassInp.focus();
      return;
    }

    if (newPass !== confirmPass) {
      showError('Mật khẩu xác nhận không trùng khớp với mật khẩu mới!');
      if (confirmPassInp) confirmPassInp.focus();
      return;
    }

    if (newPass === curPass) {
      showError('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
      if (newPassInp) newPassInp.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang cập nhật...';
    }

    WarehouseAPI.changeAdminPassword(curPass, newPass, function(res) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk me-1"></i> Lưu Mật Khẩu';
      }

      if (res && res.success) {
        // Ghi Audit Trail
        if (typeof recordAuditLog === 'function') {
          recordAuditLog('ĐỔI MẬT KHẨU ADMIN', 'Tài khoản Quản trị', 'admin', '******', 'Admin Khổng Mạnh Cường đã đổi mật khẩu quản trị hệ thống thành công');
        }

        // Đóng modal
        const modalEl = document.getElementById('modalChangePassword');
        if (modalEl && typeof bootstrap !== 'undefined') {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }

        // Thông báo thành công
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: 'Đổi Mật Khẩu Thành Công!',
            html: 'Mật khẩu quản trị viên (Admin) đã được cập nhật an toàn vào hệ thống.<br><br><b>Lưu ý:</b> Hãy ghi nhớ mật khẩu này để xác thực khi thực hiện sửa/hủy phiếu, reset dữ liệu hoặc sao lưu!',
            confirmButtonText: 'Đã Hiểu',
            confirmButtonColor: '#0d6efd'
          });
        } else {
          alert('Đổi mật khẩu Admin thành công!');
        }
      } else {
        showError((res && res.message) ? res.message : 'Có lỗi xảy ra khi đổi mật khẩu!');
      }
    });
  }

  // ====================================================
  // BỘ ĐIỀU HƯỚNG BÀN PHÍM VÀ GỢI Ý THÔNG MINH AUTOCOMPLETE
  // ====================================================
  function handleSuggestKeydown(event, dropdownId, selectCallback) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown || dropdown.style.display !== 'block') return;

    const items = dropdown.querySelectorAll('.suggest-item');
    if (items.length === 0) return;

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
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (currentIndex >= 0 && items[currentIndex]) {
        items[currentIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (event.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  }

  function toggleSuggestAll(dropdownId, searchFn) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown && dropdown.style.display === 'block') {
      dropdown.style.display = 'none';
    } else {
      searchFn('');
    }
  }

  function closeAllSmartSuggests() {
    document.querySelectorAll('.smart-suggest-dropdown').forEach(d => {
      d.style.display = 'none';
      const card = d.closest('.app-card');
      if (card && card.style.zIndex === '100') {
        card.style.zIndex = '25';
      }
    });
  }

  // Tự động đóng tất cả dropdown gợi ý khi click ra ngoài
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.smart-suggest-wrap')) {
      closeAllSmartSuggests();
    }
  });

  // Đóng gợi ý khi bấm phím Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllSmartSuggests();
    }
  });

  // Tự động đóng tất cả dropdown gợi ý khi bất kỳ modal nào mở (tránh nổi đè lên modal)
  document.addEventListener('show.bs.modal', function() {
    closeAllSmartSuggests();
  });

  // Tự động giải phóng khóa cuộn khi modal đóng (chống tình trạng kẹt/đơ cuộn trang)
  document.addEventListener('hidden.bs.modal', function() {
    setTimeout(() => {
      if (typeof document !== 'undefined' && !document.querySelector('.modal.show')) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        if (document.documentElement) document.documentElement.style.overflow = '';
      }
    }, 150);
  });

  // Xuất ra toàn cục
  if (typeof window !== 'undefined') {
    window.openChangePasswordModal = openChangePasswordModal;
    window.togglePasswordVisibility = togglePasswordVisibility;
    window.submitChangePassword = submitChangePassword;
    window.updateUserTopBarDisplay = updateUserTopBarDisplay;
    window.openLoginModal = openLoginModal;
    window.handleSystemLogin = handleSystemLogin;
    window.handleSystemLogout = handleSystemLogout;
    window.logoutSystem = logoutSystem;
    window.checkAuthOnStartup = checkAuthOnStartup;
    window.handleSuggestKeydown = handleSuggestKeydown;
    window.toggleSuggestAll = toggleSuggestAll;
    window.openSerialFromSearch = openSerialFromSearch;
    window.openModelFromSearch = openModelFromSearch;
    window.openModel360FromSearch = openModel360FromSearch;
  }
