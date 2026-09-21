const fs = require('fs');
const path = require('path');
const data = require('./standardized_data_ready.json');

// 1. Unique Brands
const brandNames = [...new Set(data.products.map(p => p.hang).filter(Boolean))].sort();
const brands = brandNames.map((b, i) => ({
  brandId: `BR_${String(i + 1).padStart(2, '0')}`,
  maHang: b.toUpperCase().replace(/\s+/g, '_'),
  tenHang: b,
  name: b,
  code: b.toUpperCase().replace(/\s+/g, '_'),
  ghiChu: `Hãng sản xuất ${b}`,
  active: true
}));

// 2. Unique Categories
const catNames = [...new Set(data.products.map(p => p.nhom).filter(Boolean))].sort();
const categories = catNames.map((c, i) => ({
  catId: `CAT_${String(i + 1).padStart(2, '0')}`,
  maNhom: `CAT_${String(i + 1).padStart(2, '0')}`,
  tenNhom: c,
  name: c,
  code: `CAT_${String(i + 1).padStart(2, '0')}`,
  ghiChu: `Nhóm hàng hóa ${c}`,
  active: true
}));

// 3. Warehouses
const warehouses = [
  { warehouseId: 'KHO_01', code: 'Kho VP', name: 'Kho Văn Phòng (Số 18 Ngõ 241 Khâm Thiên)', diaChi: 'Số 18 Ngõ 241 Phố Chợ Khâm Thiên, Hà Nội', active: true, ghiChu: 'Kho chính phân phối' },
  { warehouseId: 'KHO_02', code: 'Kho Nhà', name: 'Kho Nhà Riêng', diaChi: 'Kho lưu trữ dự phòng', active: true, ghiChu: 'Kho phụ' }
];

// 4. Products
const products = data.products;

// 5. Suppliers
const suppliers = data.suppliers;

// 6. Customers
const customers = data.customers;

// 7. Serials
const serials = data.serials;

// 8. Vouchers
const vouchers = data.vouchers;

// 9. Audit Logs
const auditLogs = data.auditLogs;

// Build file content for 05_mock_data.js
const content = `<script>
  /* ==================================================== */
  /* 1. KHỞI TẠO DỮ LIỆU DANH MỤC & CẤU HÌNH (THÀNH AN ERP) */
  /* Dữ liệu thực tế đã chuẩn hóa từ CSDL cũ Thành An   */
  /* ==================================================== */

  // 1.1 HÃNG SẢN XUẤT (BRANDS)
  function normalizeBrand(b) {
    if (!b) return b;
    b.brandId = b.brandId || b.id || '';
    b.maHang = (b.maHang || b.code || '').toUpperCase();
    b.tenHang = b.tenHang || b.name || '';
    b.ghiChu = b.ghiChu !== undefined ? b.ghiChu : (b.note || '');
    b.active = b.active !== false;
    b.id = b.brandId;
    b.code = b.maHang;
    b.name = b.tenHang;
    b.note = b.ghiChu;
    return b;
  }

  let INITIAL_BRANDS = ${JSON.stringify(brands, null, 2)}.map(normalizeBrand);

  // 1.2 NHÓM HÀNG (CATEGORIES)
  function normalizeCategory(c) {
    if (!c) return c;
    c.catId = c.catId || c.id || '';
    c.maNhom = (c.maNhom || c.code || '').toUpperCase();
    c.tenNhom = c.tenNhom || c.name || '';
    c.ghiChu = c.ghiChu !== undefined ? c.ghiChu : (c.note || '');
    c.active = c.active !== false;
    c.id = c.catId;
    c.code = c.maNhom;
    c.name = c.tenNhom;
    c.note = c.ghiChu;
    return c;
  }

  let INITIAL_CATEGORIES = ${JSON.stringify(categories, null, 2)}.map(normalizeCategory);

  // 1.3 DANH MỤC SẢN PHẨM / MODEL (CHUẨN HÓA ĐẦY ĐỦ MODEL & TÊN THIẾT BỊ)
  let INITIAL_PRODUCTS = ${JSON.stringify(products, null, 2)};

  // 1.4 DANH MỤC NHÀ CUNG CẤP (DM_NCC)
  let INITIAL_SUPPLIERS = ${JSON.stringify(suppliers, null, 2)};

  // 1.5 DANH MỤC KHÁCH HÀNG (DM_KHACH_HANG - LÀM SẠCH TRÙNG LẶP & SĐT)
  let INITIAL_CUSTOMERS = ${JSON.stringify(customers, null, 2)};

  // 1.6 DANH MỤC KHO HÀNG
  let INITIAL_WAREHOUSES = ${JSON.stringify(warehouses, null, 2)};

  // Biến đếm sequence mã nội bộ Thành An
  let INTERNAL_SEQ_COUNTER = ${serials.length + 1};

  // Danh sách tài khoản nhân sự RBAC
  let INITIAL_USERS = [
    { username: 'admin', fullName: 'Khổng Mạnh Cường', role: 'ADMIN', status: 'ACTIVE', password: '***' },
    { username: 'minhquan', fullName: 'Khổng Minh Quân', role: 'THỦ KHO', status: 'ACTIVE', password: '***' },
    { username: 'KHO1', fullName: 'Khổng Minh Quân', role: 'THỦ KHO', status: 'ACTIVE', password: '***' }
  ];
  let USERS_DB = JSON.parse(JSON.stringify(INITIAL_USERS));

  // Tài khoản đăng nhập
  let CURRENT_ROLE = 'ADMIN';
  let CURRENT_USER_NAME = 'Khổng Mạnh Cường';
  try {
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('THANH_AN_LOGGED_USER');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.fullName) CURRENT_USER_NAME = parsed.fullName;
        if (parsed.role) CURRENT_ROLE = parsed.role;
      }
    }
  } catch(e) {}

  // 1.7 MA TRẬN 20 QUYỀN HẠN PHÂN QUYỀN
  const ALL_PERMISSIONS = [
    { code: 'Dashboard.View', name: 'Xem Bảng điều khiển KPI', group: 'Dashboard' },
    { code: 'Stock.View', name: 'Xem báo cáo Tồn kho', group: 'Tồn kho' },
    { code: 'Import.Create', name: 'Tạo phiếu Nhập kho', group: 'Nhập kho' },
    { code: 'Export.Create', name: 'Tạo phiếu Xuất kho', group: 'Xuất kho' },
    { code: 'Voucher.Edit', name: 'Sửa phiếu Nhập / Xuất (CONFIRMED)', group: 'Phiếu kho' },
    { code: 'Voucher.Cancel', name: 'Hủy phiếu Nhập / Xuất', group: 'Phiếu kho' },
    { code: 'Return.Customer', name: 'Hoàn nhập hàng từ Khách', group: 'Nghiệp vụ kho' },
    { code: 'Return.Supplier', name: 'Trả hàng cho Nhà cung cấp', group: 'Nghiệp vụ kho' },
    { code: 'Warehouse.Transfer', name: 'Chuyển kho nội bộ', group: 'Nghiệp vụ kho' },
    { code: 'Stocktake.Create', name: 'Tạo & Quét phiên Kiểm kê', group: 'Kiểm kê' },
    { code: 'Stocktake.Close', name: 'Khóa & Đóng phiên Kiểm kê', group: 'Kiểm kê' },
    { code: 'Stock.Adjust', name: 'Điều chỉnh trạng thái Tồn kho', group: 'Tồn kho' },
    { code: 'Warranty.Create', name: 'Tiếp nhận ca Bảo hành', group: 'Bảo hành' },
    { code: 'Warranty.Update', name: 'Cập nhật tiến độ ca Bảo hành', group: 'Bảo hành' },
    { code: 'Catalog.View', name: 'Xem Danh mục Hệ thống', group: 'Danh mục' },
    { code: 'Catalog.Edit', name: 'Thêm / Sửa Danh mục (Model, NCC, KH, Kho)', group: 'Danh mục' },
    { code: 'Audit.View', name: 'Xem Nhật ký Kiểm toán Audit Center', group: 'Audit' },
    { code: 'Users.Manage', name: 'Quản lý Người dùng & Vai trò', group: 'Cài đặt' },
    { code: 'Permissions.Manage', name: 'Thay đổi Ma trận Phân quyền', group: 'Cài đặt' },
    { code: 'CustomFields.Manage', name: 'Quản lý Trường dữ liệu tùy chỉnh', group: 'Cài đặt' }
  ];

  let ROLE_PERMISSIONS = {
    'THỦ KHO': [
      'Dashboard.View', 'Stock.View', 'Import.Create', 'Export.Create',
      'Return.Customer', 'Return.Supplier', 'Warehouse.Transfer',
      'Stocktake.Create', 'Catalog.View'
    ],
    'BẢO HÀNH': [
      'Dashboard.View', 'Stock.View', 'Warranty.Create', 'Warranty.Update',
      'Return.Customer', 'Catalog.View'
    ],
    'QUẢN LÝ': [
      'Dashboard.View', 'Stock.View', 'Import.Create', 'Export.Create',
      'Voucher.Edit', 'Voucher.Cancel', 'Return.Customer', 'Return.Supplier',
      'Warehouse.Transfer', 'Stocktake.Create', 'Stocktake.Close',
      'Stock.Adjust', 'Warranty.Create', 'Warranty.Update', 'Catalog.View',
      'Catalog.Edit', 'Audit.View'
    ],
    'ADMIN': ALL_PERMISSIONS.map(p => p.code)
  };

  // 1.8 DANH SÁCH CUSTOM FIELDS
  function normalizeCustomField(f) {
    if (!f) return f;
    f.id = f.id || \`CF-\${String(f.order || 1).padStart(2, '0')}\`;
    f.name = f.name || '';
    f.code = (f.code || '').toUpperCase();
    f.module = f.module || 'Model';
    f.type = f.type || 'Text';
    f.defaultValue = f.defaultValue !== undefined ? f.defaultValue : '';
    f.options = Array.isArray(f.options) ? f.options : [];
    f.required = !!f.required;
    f.showForm = f.showForm !== undefined ? f.showForm : true;
    f.showOnForm = f.showForm;
    f.showTable = f.showTable !== undefined ? f.showTable : true;
    f.showOnTable = f.showTable;
    f.searchable = f.searchable !== undefined ? f.searchable : true;
    f.allowSearch = f.searchable;
    f.filterable = f.filterable !== undefined ? f.filterable : false;
    f.allowFilter = f.filterable;
    f.order = f.order || 1;
    f.active = f.active !== false;
    return f;
  }

  let CUSTOM_FIELDS_DB = [
    {
      id: 'cf_01',
      name: 'Màu sắc thiết bị',
      code: 'COLOR',
      module: 'Model',
      type: 'Dropdown',
      options: ['Trắng', 'Đen', 'Bạc', 'Xám'],
      defaultValue: 'Trắng',
      required: false,
      showForm: true,
      showTable: true,
      searchable: true,
      filterable: true,
      order: 1,
      active: true
    }
  ].map(normalizeCustomField);

  // ====================================================
  // 2. CƠ SỞ DỮ LIỆU SERIAL (SERIAL_DB) - 86 THIẾT BỊ THỰC TẾ
  // ====================================================
  let SERIAL_DB = ${JSON.stringify(serials, null, 2)};
  try {
    if (typeof localStorage !== 'undefined') {
      const savedSerials = localStorage.getItem('THANH_AN_SERIAL_DB');
      if (savedSerials) {
        const parsed = JSON.parse(savedSerials);
        if (Array.isArray(parsed) && parsed.length > 0) SERIAL_DB = parsed;
      }
    }
  } catch(e) {}

  // ====================================================
  // 3. CƠ SỞ DỮ LIỆU PHIẾU NHẬP & PHIẾU XUẤT (VOUCHERS_DB)
  // ====================================================
  let VOUCHERS_DB = ${JSON.stringify(vouchers, null, 2)};
  try {
    if (typeof localStorage !== 'undefined') {
      const savedVouchers = localStorage.getItem('THANH_AN_VOUCHERS_DB');
      if (savedVouchers) {
        const parsed = JSON.parse(savedVouchers);
        if (parsed && Array.isArray(parsed.nhap) && parsed.nhap.length > 0) VOUCHERS_DB = parsed;
      }
    }
  } catch(e) {}

  // 4. CƠ SỞ DỮ LIỆU BẢO HÀNH (WARRANTY CASES)
  let WARRANTY_CASES_DB = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const savedWarranty = localStorage.getItem('THANH_AN_WARRANTY_CASES_DB');
      if (savedWarranty) WARRANTY_CASES_DB = JSON.parse(savedWarranty);
    }
  } catch(e) {}

  // 5. CƠ SỞ DỮ LIỆU PHIÊN KIỂM KÊ KHO
  let INVENTORY_SESSIONS_DB = [];

  // ====================================================
  // 6. NHẬT KÝ HOẠT ĐỘNG (AUDIT_LOG_DB) - 62 LOGS GỐC
  // ====================================================
  let AUDIT_LOG_DB = ${JSON.stringify(auditLogs, null, 2)};
  try {
    if (typeof localStorage !== 'undefined') {
      const savedLogs = localStorage.getItem('THANH_AN_AUDIT_LOGS');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed) && parsed.length > 0) AUDIT_LOG_DB = parsed;
      }
    }
  } catch(e) {}

  if (typeof window !== 'undefined') {
    try { if (typeof INITIAL_BRANDS !== 'undefined') window.INITIAL_BRANDS = INITIAL_BRANDS; } catch(e){}
    try { if (typeof INITIAL_CATEGORIES !== 'undefined') window.INITIAL_CATEGORIES = INITIAL_CATEGORIES; } catch(e){}
    try { if (typeof INITIAL_PRODUCTS !== 'undefined') window.INITIAL_PRODUCTS = INITIAL_PRODUCTS; } catch(e){}
    try { if (typeof INITIAL_SUPPLIERS !== 'undefined') window.INITIAL_SUPPLIERS = INITIAL_SUPPLIERS; } catch(e){}
    try { if (typeof INITIAL_CUSTOMERS !== 'undefined') window.INITIAL_CUSTOMERS = INITIAL_CUSTOMERS; } catch(e){}
    try { if (typeof INITIAL_WAREHOUSES !== 'undefined') window.INITIAL_WAREHOUSES = INITIAL_WAREHOUSES; } catch(e){}
    try { if (typeof CURRENT_ROLE !== 'undefined') window.CURRENT_ROLE = CURRENT_ROLE; } catch(e){}
    try { if (typeof CURRENT_USER_NAME !== 'undefined') window.CURRENT_USER_NAME = CURRENT_USER_NAME; } catch(e){}
    try { if (typeof SERIAL_DB !== 'undefined') window.SERIAL_DB = SERIAL_DB; } catch(e){}
    try { if (typeof VOUCHERS_DB !== 'undefined') window.VOUCHERS_DB = VOUCHERS_DB; } catch(e){}
    try { if (typeof AUDIT_LOG_DB !== 'undefined') window.AUDIT_LOG_DB = AUDIT_LOG_DB; } catch(e){}
    try { if (typeof WARRANTY_CASES_DB !== 'undefined') window.WARRANTY_CASES_DB = WARRANTY_CASES_DB; } catch(e){}
  }
`;

fs.writeFileSync(path.join(__dirname, '..', 'src_demo', '05_mock_data.js'), content, 'utf8');
console.log('Successfully updated src_demo/05_mock_data.js with clean standardized data!');
