$demoContent = [System.IO.File]::ReadAllText('demo_quan_ly_kho.html', [System.Text.Encoding]::UTF8)

$bridge = @'

<script>
  // =========================================================
  // GOOGLE APPS SCRIPT LIVE DATA HYDRATION BRIDGE
  // =========================================================
  function syncServerDataToDemo(serverData) {
    if (!serverData) return;
    console.log("[GAS Bridge] Hydrating live data from Google Sheets...", serverData);
    
    // 0. Kiểm tra phiên đăng nhập an toàn, không tự động bypass vai trò
    if (typeof checkAuthOnStartup === 'function') {
      checkAuthOnStartup();
    }

    // 1. Đồng bộ Danh mục Sản phẩm / Model (Chỉ ghi đè nếu server có dữ liệu thật)
    if (Array.isArray(serverData.products) && serverData.products.length > 0) {
      INITIAL_PRODUCTS = serverData.products.map(p => ({
        id: p.model,
        productId: p.model,
        model: p.model,
        name: p.ten,
        ten: p.ten,
        tenHang: p.ten,
        nhomHang: p.nhom || '',
        category: p.nhom || '',
        nhom: p.nhom || '',
        dvt: p.dvt || 'Chiếc',
        hang: p.hang || '',
        brand: p.hang || '',
        defaultBh: p.defaultBh || 12,
        manageSerial: p.manageSerial !== false,
        ghiChu: p.ghiChu || '',
        active: true
      }));
      if (typeof PRODUCTS_DB !== 'undefined') PRODUCTS_DB = INITIAL_PRODUCTS;
    }

    // 2. Đồng bộ Danh mục Nhà Cung Cấp
    if (Array.isArray(serverData.ncc) && serverData.ncc.length > 0) {
      INITIAL_SUPPLIERS = serverData.ncc.map(n => ({
        id: n.tenTat,
        supplierId: n.tenTat,
        code: n.tenTat,
        tenTat: n.tenTat,
        name: n.tenDayDu || n.tenTat,
        tenDayDu: n.tenDayDu || n.tenTat,
        phone: n.sdt || '',
        sdt: n.sdt || '',
        email: n.email || '',
        diaChi: n.diaChi || '',
        nguoiLienHe: n.nguoiLienHe || '',
        mst: n.mst || '',
        ghiChu: n.ghiChu || '',
        active: true
      }));
      if (typeof SUPPLIERS_DB !== 'undefined') SUPPLIERS_DB = INITIAL_SUPPLIERS;
    }

    // 3. Đồng bộ Danh mục Khách Hàng
    if (Array.isArray(serverData.khachHang) && serverData.khachHang.length > 0) {
      INITIAL_CUSTOMERS = serverData.khachHang.map((k, idx) => ({
        id: 'KH' + String(idx + 1).padStart(3, '0'),
        customerId: 'KH' + String(idx + 1).padStart(3, '0'),
        name: k.ten,
        ten: k.ten,
        phone: k.sdt || '',
        sdt: k.sdt || '',
        email: k.email || '',
        address: k.diaChi || '',
        diaChi: k.diaChi || '',
        nguoiLienHe: k.nguoiLienHe || '',
        mst: k.mst || '',
        nhomKhach: k.nhomKhach || 'Khách lẻ',
        ghiChu: k.ghiChu || '',
        active: true
      }));
      if (typeof CUSTOMERS_DB !== 'undefined') CUSTOMERS_DB = INITIAL_CUSTOMERS;
    }

    // 4. Đồng bộ Danh mục Kho Hàng
    if (Array.isArray(serverData.kho) && serverData.kho.length > 0) {
      INITIAL_WAREHOUSES = serverData.kho.map(k => ({
        id: k.val,
        warehouseId: k.val,
        code: k.val,
        name: k.val,
        maKho: k.val,
        tenKho: k.val,
        loaiKho: 'Kho Trung Tâm',
        active: true
      }));
      if (typeof WAREHOUSES_DB !== 'undefined') WAREHOUSES_DB = INITIAL_WAREHOUSES;
    }

    // 5. Đồng bộ Danh mục Nhóm Hàng
    if (Array.isArray(serverData.nhomHang) && serverData.nhomHang.length > 0) {
      INITIAL_CATEGORIES = serverData.nhomHang.map(nh => ({
        id: nh.val,
        catId: nh.val,
        code: nh.val,
        name: nh.val,
        maNhom: nh.val,
        tenNhom: nh.val,
        active: true
      }));
      if (typeof CATEGORIES_DB !== 'undefined') CATEGORIES_DB = INITIAL_CATEGORIES;
    }

    // 6. Đồng bộ Danh mục Hãng SX
    if (Array.isArray(serverData.hangSx) && serverData.hangSx.length > 0) {
      INITIAL_BRANDS = serverData.hangSx.map(h => ({
        id: h.val,
        brandId: h.val,
        code: h.val,
        name: h.val,
        maHang: h.val,
        tenHang: h.val,
        active: true
      }));
      if (typeof BRANDS_DB !== 'undefined') BRANDS_DB = INITIAL_BRANDS;
    }

    // 7. Đồng bộ Danh mục Thời Gian Bảo Hành
    if (Array.isArray(serverData.baoHanh) && serverData.baoHanh.length > 0) {
      INITIAL_WARRANTIES = serverData.baoHanh.map((b, idx) => {
        const valStr = String(b.val || b);
        const months = parseInt(valStr.replace(/\D/g, '')) || 0;
        return {
          id: 'BH-' + (months || (idx + 1)),
          tenGoi: valStr,
          soThang: months,
          ghiChu: 'Thời hạn bảo hành hệ thống',
          active: true
        };
      });
      if (typeof window !== 'undefined') window.INITIAL_WARRANTIES = INITIAL_WARRANTIES;
    }

    // 7b. Đồng bộ Danh mục Loại Hàng (Cột 3 DM_QUY_CHUAN)
    if (Array.isArray(serverData.loaiHang) && serverData.loaiHang.length > 0) {
      INITIAL_CONDITIONS = serverData.loaiHang.map((l, idx) => {
        const valStr = String(l.val || l);
        return {
          id: 'COND-' + (idx + 1),
          rowId: l.rowId || null,
          ten: valStr,
          name: valStr,
          ghiChu: 'Phân loại hàng hóa quy chuẩn',
          active: true
        };
      });
      if (typeof window !== 'undefined') window.INITIAL_CONDITIONS = INITIAL_CONDITIONS;
    }

    // 8. Đồng bộ Tồn kho và Thiết bị thực tế (Giữ trọn vẹn toàn bộ Serial Tồn kho & Đã xuất)
    if (Array.isArray(serverData.allSerials) && serverData.allSerials.length > 0) {
      SERIAL_DATA = serverData.allSerials.map(t => ({
        serial: t.serial,
        internalId: t.internalId || t.maNoiBo || t.serial,
        maNoiBo: t.internalId || t.maNoiBo || t.serial,
        model: t.model,
        name: t.tenHang || t.name,
        tenHang: t.tenHang || t.name,
        nhom: t.nhom || t.nhomHang || 'Khác',
        nhomHang: t.nhomHang || t.nhom || 'Khác',
        category: t.nhomHang || t.nhom || 'Khác',
        warehouse: t.kho || 'Kho VP',
        kho: t.kho || 'Kho VP',
        supplier: t.ncc || 'Chính hãng',
        ncc: t.ncc || 'Chính hãng',
        importDate: t.ngayNhap,
        ngayNhap: t.ngayNhap,
        importVoucher: t.maPhieuNhap || t.maPhieu,
        maPhieu: t.maPhieu || t.maPhieuNhap,
        maPhieuNhap: t.maPhieuNhap || t.maPhieu,
        status: t.status || 'IN_STOCK',
        daysInStock: t.soNgayLuuKho || 0,
        soNgayLuuKho: t.soNgayLuuKho || 0,
        condition: t.loaiHang || 'Mới 100%',
        loaiHang: t.loaiHang || 'Mới 100%',
        soThangBh: t.soThangBh || t.warrantyMonths || 12,
        warrantyMonths: t.warrantyMonths || t.soThangBh || 12,
        ngayHetHanBh: t.ngayHetHanBh || '',
        ngayXuat: t.ngayXuat || '',
        maPhieuXuat: t.maPhieuXuat || '',
        khachHang: t.khachHang || '',
        sdtKhach: t.sdtKhach || ''
      }));
      if (typeof SERIAL_DB !== 'undefined') SERIAL_DB = SERIAL_DATA;
    } else if (Array.isArray(serverData.tonKhoList) && serverData.tonKhoList.length > 0) {
      // Hợp nhất tonKhoList với SERIAL_DB để không làm mất các serial đã xuất
      const map = new Map();
      (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).forEach(s => map.set(s.serial, s));
      serverData.tonKhoList.forEach(t => {
        map.set(t.serial, Object.assign({}, map.get(t.serial) || {}, t, { status: 'IN_STOCK' }));
      });
      if (Array.isArray(serverData.baoHanhList)) {
        serverData.baoHanhList.forEach(b => {
          map.set(b.serial, Object.assign({}, map.get(b.serial) || {}, b, { status: 'SOLD' }));
        });
      }
      SERIAL_DATA = Array.from(map.values());
      if (typeof SERIAL_DB !== 'undefined') SERIAL_DB = SERIAL_DATA;
    }

    // 9. Đồng bộ Phiếu Nhập & Phiếu Xuất (VOUCHERS_DB) - Nạp đầy đủ Model, Tên hàng, Kho, BH
    if (typeof VOUCHERS_DB !== 'undefined') {
      if (Array.isArray(serverData.lsNhap) && serverData.lsNhap.length > 0) {
        VOUCHERS_DB.nhap = serverData.lsNhap.map(v => ({
          maPhieu: v.maPhieu,
          ngay: v.ngayNhap || v.ngay,
          ncc: v.ncc,
          kho: v.kho || 'Kho VP',
          status: 'CONFIRMED',
          ghiChu: v.ghiChu || '',
          items: (v.serials || '').split(',').map(sn => {
            const cleanSn = sn.trim();
            const found = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => s.serial === cleanSn);
            return {
              model: (found && found.model) ? found.model : ((v.modelSummary || '').split('(')[0].trim()),
              serial: cleanSn,
              internalId: (found && (found.internalId || found.maNoiBo)) ? (found.internalId || found.maNoiBo) : cleanSn,
              name: (found && (found.name || found.tenHang)) ? (found.name || found.tenHang) : '',
              tenHang: (found && (found.name || found.tenHang)) ? (found.name || found.tenHang) : '',
              category: (found && (found.category || found.nhomHang)) ? (found.category || found.nhomHang) : '',
              kho: v.kho || (found && found.kho) || 'Kho VP'
            };
          })
        }));
      }
      if (Array.isArray(serverData.lsXuat) && serverData.lsXuat.length > 0) {
        VOUCHERS_DB.xuat = serverData.lsXuat.map(v => {
          const serials = (v.serials || '').split(',').map(sn => sn.trim()).filter(Boolean);
          const items = serials.map(sn => {
            const found = (typeof SERIAL_DB !== 'undefined' ? SERIAL_DB : []).find(s => s.serial === sn);
            return {
              serial: sn,
              model: (found && found.model) ? found.model : '',
              name: (found && (found.name || found.tenHang)) ? (found.name || found.tenHang) : '',
              tenHang: (found && (found.name || found.tenHang)) ? (found.name || found.tenHang) : '',
              category: (found && (found.category || found.nhomHang || found.nhom)) ? (found.category || found.nhomHang || found.nhom) : '',
              nhomHang: (found && (found.category || found.nhomHang || found.nhom)) ? (found.category || found.nhomHang || found.nhom) : '',
              internalId: (found && (found.internalId || found.maNoiBo)) ? (found.internalId || found.maNoiBo) : sn,
              kho: (found && found.kho) ? found.kho : (v.kho || 'Kho VP'),
              soThangBh: (found && found.soThangBh) ? found.soThangBh : 12,
              ngayHetHanBh: (found && found.ngayHetHanBh) ? found.ngayHetHanBh : ''
            };
          });

          return {
            maPhieu: v.maPhieu,
            ngay: v.ngayXuat || v.ngay,
            ngayXuat: v.ngayXuat || v.ngay,
            khachHang: v.khachHang,
            sdtKhach: v.sdtKhach || '',
            diaChi: v.diaChi || '',
            kho: v.kho || (items[0] && items[0].kho) || 'Kho VP',
            nguoiTao: v.nguoiTao || 'Khổng Mạnh Cường',
            status: 'CONFIRMED',
            ghiChu: v.ghiChu || '',
            items: items
          };
        });
      }
      try {
        localStorage.setItem('THANH_AN_VOUCHERS_DB', JSON.stringify(VOUCHERS_DB));
      } catch(e) {}
    }

    // 10. Đồng bộ Nhật ký kiểm toán (AUDIT_LOG_DB) - Làm sạch đồng bộ nếu server reset
    if (Array.isArray(serverData.auditLogs) && serverData.auditLogs.length > 0) {
      if (typeof AUDIT_LOG_DB !== 'undefined') {
        AUDIT_LOG_DB = serverData.auditLogs.map(a => ({
          id: a.id || ('AUD-' + Math.floor(Math.random()*10000)),
          time: a.time,
          timestamp: a.time,
          user: a.user,
          action: a.action,
          target: a.target,
          reason: a.detail,
          detail: a.detail
        }));
        if (typeof window !== 'undefined') window.AUDIT_LOG_DB = AUDIT_LOG_DB;
        try {
          localStorage.setItem('THANH_AN_AUDIT_LOGS', JSON.stringify(AUDIT_LOG_DB));
        } catch(e) {}
      }
    }

    // Đánh dấu các module cần render lại khi người dùng bấm vào
    if (typeof MODULE_STATE !== 'undefined') {
      Object.keys(MODULE_STATE).forEach(k => {
        if (MODULE_STATE[k]) {
          MODULE_STATE[k].rendered = false;
          MODULE_STATE[k].dirty = true;
        }
      });
    }

    // Render lại toàn bộ giao diện với dữ liệu thật
    if (typeof syncLoaiHangDropdowns === 'function') syncLoaiHangDropdowns();
    if (typeof setupNhapKhoForm === 'function') setupNhapKhoForm();
    if (typeof setupXuatKhoForm === 'function') setupXuatKhoForm();
    if (typeof populateCatalogFilterDropdowns === 'function') populateCatalogFilterDropdowns();
    if (typeof renderCatalogTables === 'function') renderCatalogTables(true);
    if (typeof renderTonKho === 'function') renderTonKho();
    if (typeof renderDashboard === 'function') renderDashboard();
    console.log("[GAS Bridge] Live data hydration COMPLETE!");
  }

  // Khởi động kết nối Google Sheets khi trang tải xong
  window.addEventListener('DOMContentLoaded', function() {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      console.log("[GAS Bridge] Detecting Google Apps Script environment. Fetching live sheet data...");
      google.script.run.withSuccessHandler(syncServerDataToDemo).withFailureHandler(function(err) {
        console.warn("[GAS Bridge] Could not fetch server data, fallback to local demo data:", err);
      }).getInitAppData();
    }
  });
</script>

</body>
</html>
'@

$newGasIndex = $demoContent -replace '(?s)</body>\s*</html>\s*$', $bridge
[System.IO.File]::WriteAllText('gas\Index.html', $newGasIndex, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText('src\frontend\Index.html', $newGasIndex, [System.Text.Encoding]::UTF8)

$size = (Get-Item 'gas\Index.html').Length
Write-Host "Updated gas\Index.html and src\frontend\Index.html successfully! Size: $size bytes"
