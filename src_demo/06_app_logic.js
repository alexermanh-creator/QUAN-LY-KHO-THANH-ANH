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
        google.script.run
          .withSuccessHandler(res => { if (callback) callback(res); })
          .withFailureHandler(err => { if (callback) callback({ success: false, message: err.message }); })
          .authenticateUser(username, password);
      } else {
        // Mock handler chuẩn xác với backend 01_DanhMuc.js
        const u = String(username || '').trim().toLowerCase();
        const p = String(password || '').trim();
        const validUsers = {
          'admin': { role: 'ADMIN', name: 'Admin Hệ Thống (Toàn quyền)', pass: '123456' },
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

        const isMatch = (currentAdminPass === 'admin123') 
          ? (p === 'admin123' || p === '123456' || p === 'admin') 
          : (p === currentAdminPass);

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
        } else {
          // FULL_SYSTEM: Trắng hoàn toàn 100% dữ liệu nghiệp vụ và toàn bộ danh mục hệ thống
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
    }
  };

  if (typeof window !== 'undefined') {
    window.WarehouseAPI = WarehouseAPI;
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
    const hintText = (curPass === 'admin123') 
      ? '(Mật khẩu mặc định: admin123)' 
      : '(Nhập mật khẩu Admin bạn đã thiết lập)';
    if (descEl) descEl.innerText = (actionDesc ? actionDesc + ' ' : '') + `Nhập mật khẩu Admin để xác nhận ${hintText}:`;
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
        if (errBox) { errBox.innerText = (res && res.message) ? res.message : 'Mật khẩu Admin không đúng! (Mặc định: 123456 hoặc admin)'; errBox.classList.remove('d-none'); }
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
                if (resetScope === 'FULL_SYSTEM' || resetScope === 'FULL_RESET') {
                  if (typeof INITIAL_PRODUCTS !== 'undefined') INITIAL_PRODUCTS.length = 0;
                  if (typeof INITIAL_BRANDS !== 'undefined') INITIAL_BRANDS.length = 0;
                  if (typeof INITIAL_CATEGORIES !== 'undefined') INITIAL_CATEGORIES.length = 0;
                  if (typeof INITIAL_SUPPLIERS !== 'undefined') INITIAL_SUPPLIERS.length = 0;
                  if (typeof INITIAL_CUSTOMERS !== 'undefined') INITIAL_CUSTOMERS.length = 0;
                  if (typeof INITIAL_WAREHOUSES !== 'undefined') INITIAL_WAREHOUSES.length = 0;
                  if (typeof SERIAL_DB !== 'undefined') SERIAL_DB.length = 0;
                  try {
                    localStorage.removeItem('THANH_AN_PRODUCTS');
                    localStorage.removeItem('THANH_AN_SUPPLIERS');
                    localStorage.removeItem('THANH_AN_CUSTOMERS');
                    localStorage.removeItem('THANH_AN_WAREHOUSES');
                    localStorage.removeItem('THANH_AN_SERIAL_DB');
                    localStorage.removeItem('THANH_AN_VOUCHERS_DB');
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

  // Tính ngày hết hạn bảo hành từ ngày xuất và số tháng bảo hành
  function calculateExpiryDate(dateStr, months) {
    if (!dateStr || months <= 0) return 'Không BH';
    const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
    let d, m, y;
    if (parts[0].length === 4) { y = parseInt(parts[0]); m = parseInt(parts[1]) - 1; d = parseInt(parts[2]); }
    else { d = parseInt(parts[0]); m = parseInt(parts[1]) - 1; y = parseInt(parts[2]); }
    const date = new Date(y, m, d);
    date.setMonth(date.getMonth() + parseInt(months));
    const resD = String(date.getDate()).padStart(2, '0');
    const resM = String(date.getMonth() + 1).padStart(2, '0');
    const resY = date.getFullYear();
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

  function setRole(role) {
    CURRENT_ROLE = role;
    if (role === 'THỦ KHO') CURRENT_USER_NAME = 'Khổng Minh Quân';
    else if (role === 'BẢO HÀNH') CURRENT_USER_NAME = 'Trần Văn Kỹ Thuật';
    else if (role === 'QUẢN LÝ') CURRENT_USER_NAME = 'Lê Tuấn Cường';
    else if (role === 'ADMIN') CURRENT_USER_NAME = 'Khổng Mạnh Cường';
    
    if (typeof window !== 'undefined') {
      window.CURRENT_ROLE = CURRENT_ROLE;
      window.CURRENT_USER_NAME = CURRENT_USER_NAME;
    }

    // CHỈ HIỆN TÊN NGƯỜI ĐĂNG NHẬP TRÊN TOPBAR (THEO ĐÚNG YÊU CẦU)
    const roleLbl = document.getElementById('currentRoleLabel');
    if (roleLbl) roleLbl.textContent = CURRENT_USER_NAME;

    // Cập nhật giao diện phản ánh quyền tức thì (Yêu cầu 6)
    updateUIPermissions();

    Swal.fire({
      icon: 'info',
      title: `Người dùng: ${CURRENT_USER_NAME}`,
      text: `Vai trò thao tác: ${role}`,
      timer: 1400,
      showConfirmButton: false
    });
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

    // 5. Quyền cài đặt
    const canManagePerms = hasPermission('Permissions.Manage');
    const navCaiDat = document.getElementById('sidebar-nav-caidat');
    if (navCaiDat) {
      navCaiDat.style.opacity = canManagePerms ? '1' : '0.6';
    }
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

  function switchTab(tabId) {
    if (!tabId) return;

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

      // 6. Cuộn lên đầu trang tức thì
      window.scrollTo(0, 0);
      CURRENT_ACTIVE_MODULE = tabId;

      // 7. Chuyển việc render nặng vào requestAnimationFrame để đảm bảo 60fps mượt mà
      requestAnimationFrame(() => {
        const modState = MODULE_STATE[tabId];
        const shouldRender = !modState || !modState.rendered || modState.dirty;

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
            } else if (tabId === 'NghiepVuKho' && typeof renderNghiepVuKhoTables === 'function') {
              renderNghiepVuKhoTables();
            } else if (tabId === 'DanhMuc' && typeof renderCatalogTables === 'function') {
              renderCatalogTables();
            } else if (tabId === 'CaiDat' && typeof renderSettingsModule === 'function') {
              renderSettingsModule();
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
  function logoutSystem() {
    if (typeof Swal !== 'undefined' && Swal.fire) {
      Swal.fire({
        title: 'Đăng xuất hệ thống?',
        text: `Bạn có chắc chắn muốn đăng xuất khỏi tài khoản [${CURRENT_USER_NAME}] không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fa-solid fa-right-from-bracket me-1"></i> Đăng xuất',
        cancelButtonText: 'Hủy'
      }).then((result) => {
        if (result.isConfirmed) {
          if (typeof recordAuditLog === 'function') {
            recordAuditLog('ĐĂNG XUẤT', 'Tài khoản', CURRENT_USER_NAME, '', 'Người dùng đăng xuất hệ thống');
          }
          setRole('THỦ KHO');
          Swal.fire({
            icon: 'success',
            title: 'Đã đăng xuất thành công!',
            text: 'Phiên làm việc đã kết thúc. Bạn đang ở chế độ xem Thủ kho.',
            timer: 1800,
            showConfirmButton: false
          });
          switchTab('Dashboard');
        }
      });
    } else {
      if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
        setRole('THỦ KHO');
        switchTab('Dashboard');
      }
    }
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
  /* 5. TÌM KIẾM TOÀN HỆ THỐNG NÂNG CẤP (YÊU CẦU 8) */
  /* ==================================================== */
  function handleGlobalSearch(keyword) {
    const kw = (keyword || '').trim().toLowerCase();
    const dropdown = document.getElementById('global-search-dropdown');
    if (!kw) {
      dropdown.style.display = 'none';
      return;
    }

    let html = '';

    // 8.1 THIẾT BỊ / SERIAL: Hiển thị đầy đủ thông tin + nút mở Serial 360° (Yêu cầu 8.1)
    const matchedSerials = SERIAL_DB.filter(s => 
      s.serial.toLowerCase().includes(kw) || 
      (s.internalId && s.internalId.toLowerCase().includes(kw))
    );
    if (matchedSerials.length > 0) {
      html += `<div class="search-group-title"><i class="fa-solid fa-barcode me-1"></i> THIẾT BỊ / SERIAL (${matchedSerials.length})</div>`;
      matchedSerials.slice(0, 5).forEach(s => {
        const activeCase = WARRANTY_CASES_DB.find(c => c.serial.toLowerCase() === s.serial.toLowerCase() && c.status !== 'HOÀN TẤT');
        html += `
          <div class="search-result-item" onclick="openSerialFromSearch('${s.serial}')">
            <div>
              <div class="title">
                <span class="text-primary font-monospace">${s.serial}</span> 
                <span class="badge bg-secondary font-monospace ms-1">${s.internalId}</span>
              </div>
              <div class="subtitle text-dark">${s.model} - ${s.tenHang || ''}</div>
              <div class="small text-muted">
                Kho: <strong>${s.kho}</strong> | PN: ${s.maPhieuNhap} 
                ${s.khachHang ? `| KH: <strong>${s.khachHang}</strong> (Hạn BH: ${s.ngayHetHanBh || 'Có'})` : '| Chưa xuất'}
                ${activeCase ? `<span class="badge bg-warning text-dark ms-1">Đang BH: ${activeCase.caseId}</span>` : ''}
              </div>
            </div>
            <div class="text-end">
              <span class="badge-status ${getBadgeClass(s.status)} mb-1">${s.status}</span><br>
              <button class="btn btn-sm btn-outline-primary py-0" style="font-size:0.75rem">Mở 360°</button>
            </div>
          </div>
        `;
      });
    }

    // 8.2 MODEL: Hiển thị tồn từng kho, đã xuất, đang BH + Nút xem chi tiết (Yêu cầu 8.2)
    const exactModels = INITIAL_PRODUCTS.filter(p => p.model.toLowerCase() === kw || (p.productId && p.productId.toLowerCase() === kw));
    const partialModels = INITIAL_PRODUCTS.filter(p => !exactModels.includes(p) && ((p.productId && p.productId.toLowerCase().includes(kw)) || p.model.toLowerCase().includes(kw) || p.ten.toLowerCase().includes(kw)));
    const matchedModels = [...exactModels, ...partialModels];
    if (matchedModels.length > 0) {
      html += `<div class="search-group-title"><i class="fa-solid fa-cube me-1"></i> MODEL SẢN PHẨM (${matchedModels.length})</div>`;
      matchedModels.slice(0, 4).forEach(p => {
        const allInStock = SERIAL_DB.filter(s => s.model === p.model && s.status === 'IN_STOCK');
        const inStockVp = allInStock.filter(s => s.kho === 'Kho VP').length;
        const inStockCn = allInStock.filter(s => s.kho === 'Kho Chi Nhánh').length;
        const inStockCl = allInStock.filter(s => s.kho === 'Kho Cách Ly (Hàng lỗi)').length;
        const totalSold = SERIAL_DB.filter(s => s.model === p.model && s.status === 'SOLD').length;
        const totalWarranty = SERIAL_DB.filter(s => s.model === p.model && s.status === 'IN_WARRANTY').length;
        const agingCount = allInStock.filter(s => calculateStockAging(s.ngayNhap) > 60).length;

        html += `
          <div class="search-result-item" onclick="openModelFromSearch('${p.model}')">
            <div>
              <div class="title text-primary fw-bold">${p.model} <span class="badge bg-light text-dark border">${p.hang || 'CANON'}</span> <small class="text-secondary font-monospace">(${p.productId})</small></div>
              <div class="subtitle">${p.ten} (${p.nhom})</div>
              <div class="small text-muted mt-1">
                Tồn: <strong class="text-success">${allInStock.length}</strong> (Kho VP: ${inStockVp}, CN: ${inStockCn}, Cách ly: ${inStockCl}) | 
                Đã bán: ${totalSold} | Đang BH: ${totalWarranty} 
                ${agingCount > 0 ? `<span class="text-danger fw-bold">| Tồn >60N: ${agingCount}</span>` : ''}
              </div>
            </div>
            <div class="text-end">
              <button class="btn btn-sm btn-outline-success py-0" style="font-size:0.75rem">Xem Serial</button>
            </div>
          </div>
        `;
      });
    }

    // 8.3 KHÁCH HÀNG: Mở modal Tóm tắt hồ sơ Khách hàng (Yêu cầu 8.3 - Không tự động nhảy vào form xuất ngay)
    const matchedCustomers = INITIAL_CUSTOMERS.filter(c => 
      (c.customerId && c.customerId.toLowerCase().includes(kw)) ||
      c.ten.toLowerCase().includes(kw) || c.sdt.includes(kw)
    );
    if (matchedCustomers.length > 0) {
      html += `<div class="search-group-title"><i class="fa-solid fa-user me-1"></i> KHÁCH HÀNG (${matchedCustomers.length})</div>`;
      matchedCustomers.slice(0, 3).forEach(c => {
        const custMachines = SERIAL_DB.filter(s => s.khachHang && s.khachHang.toLowerCase() === c.ten.toLowerCase());
        html += `
          <div class="search-result-item" onclick="openCustomerSummaryModal('${c.ten}')">
            <div>
              <div class="title">${c.ten} <span class="font-monospace text-primary">(${c.sdt})</span> <small class="text-secondary font-monospace">(${c.customerId})</small></div>
              <div class="subtitle">${c.diaChi}</div>
              <small class="text-muted">Đã mua: <strong>${custMachines.length} máy</strong></small>
            </div>
            <div class="text-end">
              <button class="btn btn-sm btn-outline-info py-0" style="font-size:0.75rem">Hồ sơ KH</button>
            </div>
          </div>
        `;
      });
    }

    // 8.4 PHIẾU KHO: Gọi openVoucherDetail() hiện tại (Yêu cầu 8.4)
    const matchedPn = VOUCHERS_DB.nhap.filter(v => v.maPhieu.toLowerCase().includes(kw));
    const matchedPx = VOUCHERS_DB.xuat.filter(v => v.maPhieu.toLowerCase().includes(kw));
    if (matchedPn.length > 0 || matchedPx.length > 0) {
      html += `<div class="search-group-title"><i class="fa-solid fa-file-lines me-1"></i> PHIẾU KHO (${matchedPn.length + matchedPx.length})</div>`;
      matchedPn.slice(0, 3).forEach(v => {
        html += `
          <div class="search-result-item" onclick="openVoucherDetail('NHAP', '${v.maPhieu}')">
            <div>
              <div class="title text-info font-monospace">${v.maPhieu} (Phiếu Nhập)</div>
              <div class="subtitle">${v.ngay} - NCC: <strong>${v.ncc}</strong> - Kho: ${v.kho} (${v.items ? v.items.length : 0} máy)</div>
            </div>
            <span class="badge ${v.status === 'CONFIRMED' ? 'bg-success' : 'bg-secondary'}">${v.status}</span>
          </div>
        `;
      });
      matchedPx.slice(0, 3).forEach(v => {
        html += `
          <div class="search-result-item" onclick="openVoucherDetail('XUAT', '${v.maPhieu}')">
            <div>
              <div class="title text-primary font-monospace">${v.maPhieu} (Phiếu Xuất)</div>
              <div class="subtitle">${v.ngay} - KH: <strong>${v.khachHang}</strong> - Kho: ${v.kho} (${v.items ? v.items.length : 0} máy)</div>
            </div>
            <span class="badge ${v.status === 'CONFIRMED' ? 'bg-success' : 'bg-secondary'}">${v.status}</span>
          </div>
        `;
      });
    }

    // 8.5 CA BẢO HÀNH: Mở chi tiết Case (Yêu cầu 8.5)
    const matchedWarranty = WARRANTY_CASES_DB.filter(w => 
      w.caseId.toLowerCase().includes(kw) || 
      w.serial.toLowerCase().includes(kw) || 
      w.khachHang.toLowerCase().includes(kw)
    );
    if (matchedWarranty.length > 0) {
      html += `<div class="search-group-title"><i class="fa-solid fa-shield-halved me-1"></i> CA BẢO HÀNH (${matchedWarranty.length})</div>`;
      matchedWarranty.slice(0, 3).forEach(w => {
        html += `
          <div class="search-result-item" onclick="openWarrantyDetailModal('${w.caseId}')">
            <div>
              <div class="title text-warning font-monospace">${w.caseId} - ${w.serial}</div>
              <div class="subtitle">${w.khachHang} - Lỗi: ${w.loiKhachBao}</div>
              <small class="text-muted">Kỹ thuật: ${w.kyThuatPhuTrach || '--'} | Hẹn trả: ${w.ngayHenTra || '--'}</small>
            </div>
            <span class="badge bg-warning text-dark">${w.status}</span>
          </div>
        `;
      });
    }

    // 8.6 NHÀ CUNG CẤP: Mở modal Tóm tắt NCC (Yêu cầu 8.6)
    const matchedSuppliers = INITIAL_SUPPLIERS.filter(s => 
      (s.supplierId && s.supplierId.toLowerCase().includes(kw)) ||
      s.tenTat.toLowerCase().includes(kw) || s.tenDayDu.toLowerCase().includes(kw)
    );
    if (matchedSuppliers.length > 0) {
      html += `<div class="search-group-title"><i class="fa-solid fa-building me-1"></i> NHÀ CUNG CẤP (${matchedSuppliers.length})</div>`;
      matchedSuppliers.slice(0, 2).forEach(s => {
        html += `
          <div class="search-result-item" onclick="openSupplierSummaryModal('${s.tenTat}')">
            <div>
              <div class="title">${s.tenTat} - ${s.tenDayDu} <small class="text-secondary font-monospace">(${s.supplierId})</small></div>
              <div class="subtitle">SĐT: ${s.sdt} | Email: ${s.email || '--'}</div>
            </div>
            <button class="btn btn-sm btn-outline-success py-0" style="font-size:0.75rem">Xem NCC</button>
          </div>
        `;
      });
    }

    // 8.7 KHO HÀNG
    const matchedWarehouses = INITIAL_WAREHOUSES.filter(w => 
      (w.warehouseId && w.warehouseId.toLowerCase().includes(kw)) ||
      w.maKho.toLowerCase().includes(kw) ||
      w.tenKho.toLowerCase().includes(kw)
    );
    if (matchedWarehouses.length > 0) {
      html += `<div class="search-group-title"><i class="fa-solid fa-warehouse me-1"></i> KHO HÀNG (${matchedWarehouses.length})</div>`;
      matchedWarehouses.slice(0, 2).forEach(w => {
        html += `
          <div class="search-result-item" onclick="document.getElementById('global-search-dropdown').style.display='none'; switchTab('TonKho');">
            <div>
              <div class="title font-monospace text-primary">${w.warehouseId} - ${w.tenKho} (${w.maKho})</div>
              <div class="subtitle">${w.loaiKho} - ${w.diaDiem}</div>
            </div>
            <span class="badge ${w.active !== false ? 'bg-success' : 'bg-secondary'}">${w.active !== false ? 'Active' : 'Inactive'}</span>
          </div>
        `;
      });
    }

    if (!html) {
      html = `<div class="p-3 text-center text-muted small"><i class="fa-solid fa-inbox me-1"></i> Không tìm thấy kết quả nào khớp với "${keyword}"</div>`;
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
      let statusDesc = existing.status;
      if (existing.status === 'IN_STOCK') statusDesc = `Đang tồn kho tại [${existing.kho}]`;
      else if (existing.status === 'SOLD') statusDesc = `Đã xuất bán cho [${existing.khachHang}] theo phiếu [${existing.maPhieuXuat}]`;
      else if (existing.status === 'IN_WARRANTY') statusDesc = `Đang bảo hành`;
      else if (existing.status === 'CANCELLED_IMPORT') statusDesc = `Thuộc phiếu nhập [${existing.maPhieuNhap}] đã bị HỦY`;

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

  // Xuất ra toàn cục
  if (typeof window !== 'undefined') {
    window.openChangePasswordModal = openChangePasswordModal;
    window.togglePasswordVisibility = togglePasswordVisibility;
    window.submitChangePassword = submitChangePassword;
  }
