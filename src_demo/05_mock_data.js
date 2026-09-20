<script>
  /* ==================================================== */
  /* 1. KHỞI TẠO DỮ LIỆU DANH MỤC & CẤU HÌNH (MOCK DATA) */
  /* ==================================================== */

  // 1.1 HÃNG SẢN XUẤT (BRANDS - YÊU CẦU 4.5 & CHUẨN HÓA SCHEMA)
  function normalizeBrand(b) {
    if (!b) return b;
    b.brandId = b.brandId || b.id || '';
    b.maHang = (b.maHang || b.code || '').toUpperCase();
    b.tenHang = b.tenHang || b.name || '';
    b.ghiChu = b.ghiChu !== undefined ? b.ghiChu : (b.note || '');
    b.active = b.active !== false;
    // Alias tương thích ngược 100%
    b.id = b.brandId;
    b.code = b.maHang;
    b.name = b.tenHang;
    b.note = b.ghiChu;
    return b;
  }

  let INITIAL_BRANDS = [];

  // 1.2 NHÓM HÀNG (CATEGORIES - YÊU CẦU 4.6 & CHUẨN HÓA SCHEMA)
  function normalizeCategory(c) {
    if (!c) return c;
    c.catId = c.catId || c.id || '';
    c.maNhom = (c.maNhom || c.code || '').toUpperCase();
    c.tenNhom = c.tenNhom || c.name || '';
    c.ghiChu = c.ghiChu !== undefined ? c.ghiChu : (c.note || '');
    c.active = c.active !== false;
    // Alias tương thích ngược 100%
    c.id = c.catId;
    c.code = c.maNhom;
    c.name = c.tenNhom;
    c.note = c.ghiChu;
    return c;
  }

  let INITIAL_CATEGORIES = [];

  // 1.3 DANH MỤC SẢN PHẨM / MODEL (YÊU CẦU 4.1)
  let INITIAL_PRODUCTS = [];

  // 1.4 DANH MỤC NHÀ CUNG CẤP (YÊU CẦU 4.2)
  let INITIAL_SUPPLIERS = [];

  // 1.5 DANH MỤC KHÁCH HÀNG (YÊU CẦU 4.3)
  let INITIAL_CUSTOMERS = [];

  // 1.6 DANH MỤC KHO HÀNG (YÊU CẦU 4.4)
  let INITIAL_WAREHOUSES = [];

  // Biến đếm sequence mã nội bộ Thành An
  let INTERNAL_SEQ_COUNTER = 100;

  // Danh sách tài khoản nhân sự RBAC chuẩn doanh nghiệp (Ảnh 5)
  let INITIAL_USERS = [
    { username: 'admin', fullName: 'Khổng Mạnh Cường', role: 'ADMIN', status: 'ACTIVE', password: '***' },
    { username: 'KHO1', fullName: 'Khổng Minh Quân', role: 'THỦ KHO', status: 'ACTIVE', password: '***' },
    { username: 'QL01', fullName: 'Lê Tuấn Cường', role: 'QUẢN LÝ', status: 'ACTIVE', password: '***' },
    { username: 'BH01', fullName: 'Trần Văn Kỹ Thuật', role: 'BẢO HÀNH', status: 'ACTIVE', password: '***' }
  ];
  let USERS_DB = JSON.parse(JSON.stringify(INITIAL_USERS));

  // Vai trò đăng nhập hiện tại
  let CURRENT_ROLE = 'ADMIN';
  let CURRENT_USER_NAME = 'Khổng Mạnh Cường';

  // 1.7 MA TRẬN 20 QUYỀN HẠN PHÂN QUYỀN (YÊU CẦU 6)
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

  // Ma trận quyền gán cho 4 vai trò (Có thể chỉnh sửa động trong demo)
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
    'ADMIN': ALL_PERMISSIONS.map(p => p.code) // Toàn quyền
  };

  // 1.8 DANH SÁCH CUSTOM FIELDS (TRƯỜNG TÙY CHỈNH - YÊU CẦU 5)
  function normalizeCustomField(f) {
    if (!f) return f;
    f.id = f.id || `CF-${String(f.order || 1).padStart(2, '0')}`;
    f.name = f.name || '';
    f.code = (f.code || '').toUpperCase();
    f.module = f.module || 'Model';
    f.type = f.type || 'Text';
    f.defaultValue = f.defaultValue !== undefined ? f.defaultValue : '';
    f.options = Array.isArray(f.options) ? f.options : [];
    f.required = !!f.required;
    f.showForm = f.showForm !== undefined ? f.showForm : (f.showOnForm !== undefined ? f.showOnForm : true);
    f.showOnForm = f.showForm;
    f.showTable = f.showTable !== undefined ? f.showTable : (f.showOnTable !== undefined ? f.showOnTable : true);
    f.showOnTable = f.showTable;
    f.searchable = f.searchable !== undefined ? f.searchable : (f.allowSearch !== undefined ? f.allowSearch : true);
    f.allowSearch = f.searchable;
    f.filterable = f.filterable !== undefined ? f.filterable : (f.allowFilter !== undefined ? f.allowFilter : false);
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
      module: 'Model', // Model | Serial | NhapKho | XuatKho | KhachHang | NCC | Warranty | KiemKe
      type: 'Dropdown', // Text | Number | Date | Dropdown | YesNo | LongText
      options: ['Trắng', 'Đen', 'Bạc', 'Xám'],
      defaultValue: 'Trắng',
      required: false,
      showForm: true,
      showTable: true,
      searchable: true,
      filterable: true,
      order: 1,
      active: true
    },
    {
      id: 'cf_02',
      name: 'Số hợp đồng / PO dự án',
      code: 'PROJECT_PO',
      module: 'XuatKho',
      type: 'Text',
      options: [],
      defaultValue: '',
      required: false,
      showForm: true,
      showTable: true,
      searchable: true,
      filterable: false,
      order: 2,
      active: true
    },
    {
      id: 'cf_03',
      name: 'Mã tài sản cố định khách',
      code: 'CUST_ASSET_TAG',
      module: 'Serial',
      type: 'Text',
      options: [],
      defaultValue: '',
      required: false,
      showForm: true,
      showTable: true,
      searchable: true,
      filterable: false,
      order: 3,
      active: true
    }
  ].map(normalizeCustomField);

  // 2. CƠ SỞ DỮ LIỆU SERIAL (RESET VỀ TRẠNG THÁI SẠCH SẴN SÀNG NẠP DỮ LIỆU THỰC TẾ)
  let SERIAL_DB = [];

  // 3. CƠ SỞ DỮ LIỆU PHIẾU NHẬP VÀ PHIẾU XUẤT (VOUCHERS - RESET RỖNG)
  let VOUCHERS_DB = {
    nhap: [],
    xuat: []
  };

  // 4. CƠ SỞ DỮ LIỆU BẢO HÀNH (WARRANTY CASES - RESET RỖNG)
  let WARRANTY_CASES_DB = [];

  // 5. CƠ SỞ DỮ LIỆU PHIÊN KIỂM KÊ KHO (RESET RỖNG)
  let INVENTORY_SESSIONS_DB = [];

  // 6. NHẬT KÝ KIỂM TOÁN (RESET RỖNG HOÀN TOÀN)
  let AUDIT_LOG_DB = [];

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
    try { if (typeof ALERT_SETTINGS !== 'undefined') window.ALERT_SETTINGS = ALERT_SETTINGS; } catch(e){}
  }

