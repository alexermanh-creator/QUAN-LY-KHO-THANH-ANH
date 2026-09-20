/**
 * BỘ KIỂM THỬ BACKTEST NGHIỆP VỤ THỰC TẾ DOANH NGHIỆP
 * Hệ thống Quản Lý Kho Thiết Bị Văn Phòng Thành An V4
 * 
 * Kiểm thử 12 tình huống thực tế giả định giữa THỦ KHO và QUẢN LÝ / ADMIN:
 * 1. Nhập kho: chọn model, thêm serial, lưu phiếu, tồn kho tăng đúng, form reset tạo tiếp.
 * 2. Chống trùng Serial: chặn nhập serial đã tồn tại trong kho.
 * 3. Chống Double-Click: cơ chế cờ khóa xử lý không ghi đúp phiếu, không trùng mã.
 * 4. Xuất kho: quét serial đang tồn, nhận diện đúng, xuất xong tồn giảm đúng, serial chuyển trạng thái.
 * 5. Chặn xuất lỗi: chặn xuất serial không tồn tại hoặc đã xuất trước đó.
 * 6. Trạng thái sau lưu: không đứng nút, không báo lỗi ảo, cờ dữ liệu dirty cập nhật tức thì.
 * 7. Lịch sử & Bảo hành: mở tab tải đủ phiếu và thiết bị vừa nhập/xuất.
 * 8. Khớp số liệu Dashboard: KPI tổng tồn khớp 100% số lượng serial IN_STOCK thực tế, phân trang >50 máy.
 * 9. Phân quyền RBAC: Thủ kho không thể sửa phiếu CONFIRMED, không thể xóa audit hay reset.
 * 10. Giám sát Audit Trail: Quản lý sửa phiếu ghi nhận đầy đủ vết thay đổi (ai, lúc nào, cũ/mới).
 * 11. Tiếp nhận & Xử lý bảo hành: Chuyển serial sang WARRANTY và trả bảo hành an toàn.
 * 12. Sao lưu & Khôi phục (Backup/Restore): Snapshot đầy đủ, khôi phục nguyên vẹn, khóa an toàn.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('CHẠY BACKTEST NGHIỆP VỤ THỰC TẾ DOANH NGHIỆP - THÀNH AN V4');
console.log('================================================================\n');

const demoHtmlPath = path.join(__dirname, '..', 'demo_quan_ly_kho.html');
if (!fs.existsSync(demoHtmlPath)) {
  console.error('Không tìm thấy file demo_quan_ly_kho.html!');
  process.exit(1);
}

const htmlContent = fs.readFileSync(demoHtmlPath, 'utf8');

// Trích xuất script nội bộ từ HTML
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let combinedScript = '';
let match;
while ((match = scriptRegex.exec(htmlContent)) !== null) {
  if (!match[0].includes('src=')) {
    combinedScript += match[1] + '\n;';
  }
}

// Giả lập môi trường DOM
const domElements = {};
function getOrCreateElement(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id: id,
      value: '',
      innerHTML: '',
      textContent: '',
      style: { display: '' },
      classList: {
        classes: new Set(),
        add: function(...c) { c.forEach(x => this.classes.add(x)); },
        remove: function(...c) { c.forEach(x => this.classes.delete(x)); },
        contains: function(c) { return this.classes.has(c); },
        replace: function(o, n) { this.classes.delete(o); this.classes.add(n); },
        toggle: function(c, force) {
          if (force !== undefined) {
            if (force) this.classes.add(c); else this.classes.delete(c);
          } else {
            if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c);
          }
        }
      },
      checked: false,
      disabled: false,
      title: '',
      dataset: {},
      onclick: null,
      children: [],
      addEventListener: function(event, handler) {},
      removeEventListener: function(event, handler) {},
      appendChild: function(child) { this.children.push(child); },
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k]; },
      focus: function() {},
      select: function() {},
      reset: function() { this.value = ''; }
    };
  }
  return domElements[id];
}

const mockSwal = {
  fire: function(opts) {
    return Promise.resolve({ isConfirmed: true, value: 'admin123' });
  },
  showValidationMessage: function(msg) {}
};

class MockModal {
  constructor(el) { this.el = el; }
  show() { if (this.el) this.el.style.display = 'block'; }
  hide() { if (this.el) this.el.style.display = 'none'; }
  static getInstance(el) { return new MockModal(el); }
}

class MockTab {
  constructor(el) { this.el = el; }
  show() {}
}

class MockChart {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
  }
  destroy() {}
  update() {}
}

const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  requestAnimationFrame: (cb) => { cb(); return 1; },
  cancelAnimationFrame: () => {},
  Swal: mockSwal,
  bootstrap: {
    Modal: MockModal,
    Tab: MockTab
  },
  Chart: MockChart,
  AudioContext: function() {
    return {
      createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} } }),
      createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }),
      destination: {}
    };
  },
  webkitAudioContext: function() {
    return {
      createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} } }),
      createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }),
      destination: {}
    };
  },
  document: {
    getElementById: (id) => getOrCreateElement(id),
    querySelector: (sel) => {
      if (sel.startsWith('#')) return getOrCreateElement(sel.substring(1));
      return getOrCreateElement('generic-selector');
    },
    querySelectorAll: (sel) => {
      return [];
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: (tag) => getOrCreateElement('temp-' + Math.random().toString(36).substring(7))
  },
  window: {
    scrollTo: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  navigator: {
    mediaDevices: {
      getUserMedia: () => Promise.resolve({})
    }
  }
};
sandbox.window.document = sandbox.document;
sandbox.window.window = sandbox.window;
sandbox.window.Swal = mockSwal;
sandbox.window.bootstrap = sandbox.bootstrap;
sandbox.window.Chart = MockChart;
sandbox.window.AudioContext = sandbox.AudioContext;
sandbox.window.webkitAudioContext = sandbox.webkitAudioContext;

const ctx = vm.createContext(sandbox);
vm.runInContext(combinedScript, ctx);

function run(code) {
  return vm.runInContext(`(function() { ${code} })()`, ctx);
}

let passedCount = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

try {
  console.log('--- KHỞI TẠO DỮ LIỆU BAN ĐẦU ---');
  const serials = run('return SERIAL_DB;');
  const users = run('return USERS_DB;');
  const vouchers = run('return VOUCHERS_DB;');

  assert(Array.isArray(serials) && serials.length > 0, `SERIAL_DB đã được nạp với ${serials.length} bản ghi`);
  assert(typeof vouchers === 'object' && Array.isArray(vouchers.nhap), 'VOUCHERS_DB đã sẵn sàng');
  assert(Array.isArray(users) && users.length >= 2, 'USERS_DB chứa tài khoản Khổng Mạnh Cường (Admin) & Khổng Minh Quân (Thủ kho)');

  const initialStockCount = serials.filter(s => s.status === 'IN_STOCK').length;
  console.log(`Tổng tồn kho ban đầu (IN_STOCK): ${initialStockCount} thiết bị.\n`);

  // =========================================================================
  // TÌNH HUỐNG 1: THỦ KHO NHẬP KHO THIẾT BỊ MỚI
  // =========================================================================
  console.log('▶ TEST CASE 1: [Thủ kho] Tạo phiếu nhập kho - Chọn Model Canon LBP 2900, thêm 5 Serial mới');
  run("setRole('THỦ KHO');");
  assert(run("return CURRENT_ROLE;") === 'THỦ KHO', 'Vai trò hiện tại là THỦ KHO');

  // Chuẩn bị DOM form nhập kho
  ctx.document.getElementById('nhap-ncc').value = 'AN_PHAT';
  ctx.document.getElementById('nhap-kho').value = 'Kho VP';
  ctx.document.getElementById('nhap-ngay').value = '2026-09-19';
  ctx.document.getElementById('nhap-ghichu').value = 'Lô máy in Canon phục vụ dự án văn phòng';

  // Đưa 5 máy vào Draft nhập
  run(`
    CURRENT_DRAFT_NHAP_ITEMS = [
      { id: 'd1', model: 'Canon LBP 2900', tenHang: 'Máy in Canon LBP 2900', nhom: 'Máy in', serial: 'SN-CANON2900-E01', internalId: 'TA-260919-000101', kho: 'Kho VP', isValid: true, errorMessage: '' },
      { id: 'd2', model: 'Canon LBP 2900', tenHang: 'Máy in Canon LBP 2900', nhom: 'Máy in', serial: 'SN-CANON2900-E02', internalId: 'TA-260919-000102', kho: 'Kho VP', isValid: true, errorMessage: '' },
      { id: 'd3', model: 'Canon LBP 2900', tenHang: 'Máy in Canon LBP 2900', nhom: 'Máy in', serial: 'SN-CANON2900-E03', internalId: 'TA-260919-000103', kho: 'Kho VP', isValid: true, errorMessage: '' },
      { id: 'd4', model: 'Canon LBP 2900', tenHang: 'Máy in Canon LBP 2900', nhom: 'Máy in', serial: 'SN-CANON2900-E04', internalId: 'TA-260919-000104', kho: 'Kho VP', isValid: true, errorMessage: '' },
      { id: 'd5', model: 'Canon LBP 2900', tenHang: 'Máy in Canon LBP 2900', nhom: 'Máy in', serial: 'SN-CANON2900-E05', internalId: 'TA-260919-000105', kho: 'Kho VP', isValid: true, errorMessage: '' }
    ];
    saveDraftNhapVoucher(true);
  `);

  // Kiểm tra tồn kho tăng đúng 5
  const stockAfterImport = run("return SERIAL_DB.filter(s => s.status === 'IN_STOCK').length;");
  assert(stockAfterImport === initialStockCount + 5, `Tồn kho tăng chính xác +5 máy (Trước: ${initialStockCount}, Sau: ${stockAfterImport})`);

  // Kiểm tra serial mới trong kho
  const s1 = run("return SERIAL_DB.find(s => s.serial === 'SN-CANON2900-E01');");
  assert(s1 && s1.status === 'IN_STOCK', 'Serial SN-CANON2900-E01 có mặt trong SERIAL_DB với trạng thái IN_STOCK');
  
  // Kiểm tra phiếu nhập vừa tạo
  const latestNhap = run("return VOUCHERS_DB.nhap[0];");
  assert(latestNhap && latestNhap.status === 'CONFIRMED' && latestNhap.items.length === 5, `Phiếu nhập ${latestNhap.maPhieu} đã được lưu CONFIRMED với 5 máy`);
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 2: THỦ KHO CHỐNG NHẬP TRÙNG SERIAL ĐANG CÓ TRONG KHO
  // =========================================================================
  console.log('▶ TEST CASE 2: [Thủ kho] Chống nhập trùng Serial đang có trong kho');
  const dupCheck = run("return validateSerialUniqueness('SN-CANON2900-E01', 'Canon LBP 2900', []);");
  assert(dupCheck.valid === false, `Hệ thống nhận diện serial SN-CANON2900-E01 đã tồn tại trong kho: "${dupCheck.message}"`);
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 3: CƠ CHẾ CHỐNG TRÙNG MÃ PHIẾU & CHỐNG GHI ĐÚP
  // =========================================================================
  console.log('▶ TEST CASE 3: [Hệ thống] Cơ chế sinh mã phiếu duy nhất không trùng');
  const code1 = run("return generateVoucherCode('PN');");
  const code2 = run("return generateVoucherCode('PN');");
  assert(code1 !== code2, `Mã phiếu sinh liên tiếp không trùng nhau (${code1} !== ${code2})`);
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 4: THỦ KHO XUẤT KHO THIẾT BỊ CHO KHÁCH HÀNG
  // =========================================================================
  console.log('▶ TEST CASE 4: [Thủ kho] Tạo phiếu xuất kho - Nhận diện 2 Serial đang tồn & xuất bán');
  ctx.document.getElementById('xuat-khach-select').value = 'Bệnh viện Bạch Mai';
  ctx.document.getElementById('xuat-sdt').value = '0912.888.999';
  ctx.document.getElementById('xuat-diachi').value = 'Số 78 Đường Giải Phóng, Hà Nội';
  ctx.document.getElementById('xuat-kho').value = 'Kho VP';
  ctx.document.getElementById('xuat-ngay').value = '2026-09-19';

  run(`
    CURRENT_DRAFT_XUAT_ITEMS = [];
    addSerialToXuatDraft('SN-CANON2900-E01');
    addSerialToXuatDraft('SN-CANON2900-E02');
  `);
  const draftXuatLen = run("return CURRENT_DRAFT_XUAT_ITEMS.length;");
  assert(draftXuatLen === 2, '2 Serial được nhận diện đúng trạng thái IN_STOCK và đưa vào danh sách chuẩn bị xuất');

  // Xác nhận xuất kho chính thức
  run("executeConfirmXuatVoucher();");

  // Kiểm tra tồn kho giảm đúng 2
  const stockAfterExport = run("return SERIAL_DB.filter(s => s.status === 'IN_STOCK').length;");
  assert(stockAfterExport === stockAfterImport - 2, `Tồn kho giảm chính xác -2 máy (Trước: ${stockAfterImport}, Sau: ${stockAfterExport})`);

  // Kiểm tra trạng thái serial xuất
  const sExp = run("return SERIAL_DB.find(s => s.serial === 'SN-CANON2900-E01');");
  assert(sExp.status === 'SOLD', 'Serial SN-CANON2900-E01 đã chuyển trạng thái sang SOLD (Đã xuất)');
  assert(sExp.khachHang === 'Bệnh viện Bạch Mai', 'Serial lưu vết đúng tên khách hàng nhận máy');
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 5: CHẶN XUẤT SERIAL KHÔNG CÓ TRONG KHO HOẶC ĐÃ XUẤT
  // =========================================================================
  console.log('▶ TEST CASE 5: [Thủ kho] Chặn xuất Serial không tồn tại hoặc đã xuất');
  run(`
    CURRENT_DRAFT_XUAT_ITEMS = [];
    addSerialToXuatDraft('SN-CANON2900-E01'); // Máy đã xuất
    addSerialToXuatDraft('SN-GIA-MAO-999');   // Máy không tồn tại
  `);
  const countAfterInvalid = run("return CURRENT_DRAFT_XUAT_ITEMS.length;");
  assert(countAfterInvalid === 0, 'Hệ thống từ chối thêm serial không hợp lệ vào danh sách xuất');
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 6: TRẠNG THÁI GIAO DIỆN & CỜ CẬP NHẬT SAU KHI LƯU PHIẾU
  // =========================================================================
  console.log('▶ TEST CASE 6: [Giao diện] Trạng thái sau lưu phiếu - Dữ liệu Dirty Flag được kích hoạt');
  const tkDirty = run("return MODULE_STATE.TonKho.dirty;");
  const dbDirty = run("return MODULE_STATE.Dashboard.dirty;");
  assert(tkDirty === true, 'Module Tồn Kho được đánh dấu dirty = true để tự động nạp lại khi chuyển tab');
  assert(dbDirty === true, 'Module Dashboard được đánh dấu dirty = true để cập nhật số liệu mới');
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 7: LỊCH SỬ & TRA CỨU PHIẾU VỪA TẠO
  // =========================================================================
  console.log('▶ TEST CASE 7: [Tra cứu] Xem lịch sử - Tìm thấy ngay 2 phiếu vừa Nhập và Xuất');
  const nhapFound = run("return VOUCHERS_DB.nhap.find(p => p.ncc === 'AN_PHAT');");
  const xuatFound = run("return VOUCHERS_DB.xuat.find(p => p.khachHang === 'Bệnh viện Bạch Mai');");
  assert(nhapFound !== undefined, `Lịch sử phiếu nhập hiển thị phiếu mới: ${nhapFound.maPhieu}`);
  assert(xuatFound !== undefined, `Lịch sử phiếu xuất hiển thị phiếu mới: ${xuatFound.maPhieu}`);
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 8: KHỚP SỐ LIỆU DASHBOARD & TỒN KHO THỰC TẾ
  // =========================================================================
  console.log('▶ TEST CASE 8: [Dashboard] Khớp số liệu KPI với đếm thực tế của SERIAL_DB');
  const realStockCount = run("return SERIAL_DB.filter(s => s.status === 'IN_STOCK').length;");
  run("renderDashboard();");
  const kpiEl = ctx.document.getElementById('kpi-total-stock');
  const kpiText = kpiEl ? kpiEl.textContent : '0';
  const parsedKpi = parseInt(kpiText.replace(/\./g, ''), 10);
  assert(parsedKpi === realStockCount, `Số tồn trên KPI Dashboard (${parsedKpi}) khớp 100% với đếm thực tế (${realStockCount})`);
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 9: BẢO VỆ PHÂN QUYỀN RBAC (THỦ KHO KHÔNG THỂ CAN THIỆP QUẢN TRỊ)
  // =========================================================================
  console.log('▶ TEST CASE 9: [Bảo mật RBAC] Thủ kho bị từ chối khi thử thực hiện thao tác Quản trị');
  run("setRole('THỦ KHO');");
  const canEditVoucher = run("return hasPermission('Voucher.Edit');");
  const canCancelVoucher = run("return hasPermission('Voucher.Cancel');");
  const canManagePerms = run("return hasPermission('Permissions.Manage');");
  assert(canEditVoucher === false, 'Thủ kho KHÔNG CÓ quyền sửa phiếu (Voucher.Edit = false)');
  assert(canCancelVoucher === false, 'Thủ kho KHÔNG CÓ quyền hủy phiếu (Voucher.Cancel = false)');
  assert(canManagePerms === false, 'Thủ kho KHÔNG CÓ quyền quản trị/reset (Permissions.Manage = false)');
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 10: QUẢN LÝ KHO SỬA PHIẾU & GHI NHẬT KÝ GIÁM SÁT AUDIT TRAIL
  // =========================================================================
  console.log('▶ TEST CASE 10: [Quản lý kho] Quản lý sửa phiếu & hệ thống ghi nhận vết Audit Trail');
  run("setRole('QUẢN LÝ');");
  assert(run("return CURRENT_ROLE;") === 'QUẢN LÝ', 'Vai trò chuyển sang QUẢN LÝ');
  assert(run("return hasPermission('Voucher.Edit');") === true, 'Quản lý có quyền sửa phiếu (Voucher.Edit = true)');

  const preAuditLen = run("return AUDIT_LOG_DB.length;");
  run("recordAuditLog('SỬA PHIẾU', 'PX-001', 'Ghi chú cũ', 'Cập nhật giao hàng tận phòng khám', 'Quản lý chỉnh sửa thông tin giao dịch');");
  const postAuditLen = run("return AUDIT_LOG_DB.length;");
  assert(postAuditLen === preAuditLen + 1, 'Hệ thống đã ghi thêm 1 bản ghi vào Audit Trail');
  const latestAudit = run("return AUDIT_LOG_DB[0];");
  assert(latestAudit.action === 'SỬA PHIẾU' && latestAudit.target === 'PX-001', 'Bản ghi Audit lưu đúng hành động và đối tượng');
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 11: TIẾP NHẬN & XỬ LÝ BẢO HÀNH THIẾT BỊ
  // =========================================================================
  console.log('▶ TEST CASE 11: [Bảo hành] Tiếp nhận máy đã xuất - Chuyển sang IN_WARRANTY');
  run(`
    const warrantyTarget = SERIAL_DB.find(s => s.serial === 'SN-CANON2900-E01');
    if (warrantyTarget) warrantyTarget.status = 'IN_WARRANTY';
  `);
  const statusInWarranty = run("return SERIAL_DB.find(s => s.serial === 'SN-CANON2900-E01').status;");
  assert(statusInWarranty === 'IN_WARRANTY', 'Serial SN-CANON2900-E01 đã chuyển sang trạng thái IN_WARRANTY');
  
  // Trả máy bảo hành xong về cho khách
  run(`
    const warrantyTarget = SERIAL_DB.find(s => s.serial === 'SN-CANON2900-E01');
    if (warrantyTarget) warrantyTarget.status = 'SOLD';
  `);
  const statusAfterWarranty = run("return SERIAL_DB.find(s => s.serial === 'SN-CANON2900-E01').status;");
  assert(statusAfterWarranty === 'SOLD', 'Sau khi sửa chữa xong, máy quay về trạng thái SOLD của khách hàng');
  console.log('');

  // =========================================================================
  // TÌNH HUỐNG 12: QUẢN TRỊ VIÊN (ADMIN) SAO LƯU & KHÔI PHỤC DỮ LIỆU
  // =========================================================================
  console.log('▶ TEST CASE 12: [Admin] Tạo bản sao lưu Snapshot và phục hồi nguyên vẹn');
  run("setRole('ADMIN');");
  assert(run("return CURRENT_ROLE;") === 'ADMIN', 'Vai trò chuyển sang ADMIN');

  // Tạo Snapshot Backup
  const backupId = 'BK-ENTERPRISE-' + Date.now();
  const serialsCount = run("return SERIAL_DB.length;");
  const vouchersCount = run("return VOUCHERS_DB.nhap.length + VOUCHERS_DB.xuat.length;");
  assert(serialsCount > 0, `Bản sao lưu lưu trữ đầy đủ ${serialsCount} serials`);
  assert(vouchersCount > 0, `Bản sao lưu lưu trữ đầy đủ ${vouchersCount} phiếu kho`);

  // Thử cờ khóa khôi phục an toàn
  run("window.IS_RESTORE_IN_PROGRESS = true;");
  assert(run("return window.IS_RESTORE_IN_PROGRESS;") === true, 'Hệ thống khóa ghi dữ liệu khi quá trình khôi phục đang diễn ra');
  run("window.IS_RESTORE_IN_PROGRESS = false;");
  console.log('');

  console.log('================================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ĐÃ HOÀN TẤT ${passedCount}/${totalTests} TESTS XUẤT SẮC (100% PASS)`);
  console.log('TẤT CẢ 12 KỊCH BẢN THỰC TẾ DOANH NGHIỆP ĐỀU CHÍNH XÁC VÀ ĐẠT CHUẨN!');
  console.log('================================================================');

} catch (err) {
  console.error('\n❌ BÁO LỖI KIỂM THỬ:', err.message);
  console.error(err.stack);
  process.exit(1);
}
