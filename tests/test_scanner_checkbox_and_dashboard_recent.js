const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('====================================================');
console.log('TEST SUITE: SCANNER CHECKBOX SELECTION & RECENT ACTIVITIES');
console.log('====================================================\n');

// Mock DOM
const mockDOM = {};
function getEl(id) {
  if (!mockDOM[id]) {
    mockDOM[id] = {
      id, value: '', textContent: '', innerHTML: '', className: '',
      disabled: false, checked: true, indeterminate: false,
      style: {},
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        contains(c) { return this._set.has(c); },
        toggle(c) { this._set.has(c) ? this._set.delete(c) : this._set.add(c); }
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      focus: () => {},
      select: () => {},
      closest: () => null,
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }
  return mockDOM[id];
}

const context = {
  console: console,
  document: {
    getElementById: (id) => getEl(id),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  window: {
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: (cb) => cb(),
  clearTimeout: () => {},
  escapeHtml: (str) => String(str || '').replace(/[&<>"']/g, ''),
  VOUCHERS_DB: {
    nhap: [
      { maPhieu: 'NK-260928-01', ngayNhap: '28/09/2026', ncc: 'Canon VN', items: [{ model: 'LBP2900', serial: 'CN-001' }] },
      { maPhieu: 'NK-260924-01', ngayNhap: '24/09/2026', ncc: 'HP VN', items: [{ model: 'HP-M404', serial: 'HP-001' }] }
    ],
    xuat: [
      { maPhieu: 'PX-260928-01', ngayXuat: '28/09/2026', createdAt: '28/09/2026 09:03:43', khachHang: 'Công ty A', items: [{ model: 'HP-M404', serial: 'HP-002' }] },
      { maPhieu: 'PX-260927-01', ngayXuat: '27/09/2026', createdAt: '27/09/2026 15:30:00', khachHang: 'Công ty B', items: [{ model: 'HP-M404', serial: 'HP-003' }] },
      { maPhieu: 'PX-260926-03', ngayXuat: '26/09/2026', createdAt: '26/09/2026 23:29:04', khachHang: 'Công ty C', items: [{ model: 'Canon-R10', serial: 'CR-001' }] },
      { maPhieu: 'PX-260926-02', ngayXuat: '26/09/2026', khachHang: 'Công ty D', items: [{ model: 'Dell-15', serial: 'DL-001' }] },
      { maPhieu: 'PX-260926-01', ngayXuat: '26/09/2026', khachHang: 'Công ty E', items: [{ model: 'MX-4', serial: 'MX-001' }] },
      { maPhieu: 'PX-260925-01', ngayXuat: '25/09/2026', khachHang: 'Công ty F', items: [{ model: 'Dell-15', serial: 'DL-002' }] }
    ]
  },
  AUDIT_LOG_DB: [],
  SERIAL_DB: []
};
context.window = context;

function cleanScript(code) {
  let c = code.replace(/^\s*<script\b[^>]*>/i, '');
  c = c.replace(/<\/script>\s*<\/body>\s*<\/html>\s*$/i, '');
  c = c.replace(/<\/script>\s*$/i, '');
  return c;
}

const code13 = cleanScript(fs.readFileSync('src_demo/13_nghiep_vu_kho_and_dashboard.js', 'utf8'));
vm.createContext(context);
vm.runInContext(code13, context);

// TEST 1: Test Dashboard Recent Activities
console.log('--- TEST 1: Kiểm tra Hoạt động gần đây trên Dashboard ---');
context.renderRecentActivities();
const tbodyContent = mockDOM['recent-activities-tbody'].innerHTML;

assert(tbodyContent.includes('Xuất kho'), 'Phải có phiếu xuất kho');
assert(tbodyContent.includes('Nhập kho'), 'Phải có phiếu nhập kho!');
assert(tbodyContent.includes('NK-260928-01'), 'Phiếu nhập ngày 28/09 phải xuất hiện!');
console.log('  [PASS] Cả phiếu Nhập kho và Xuất kho đều hiển thị đầy đủ, không bị nuốt chửng.');

// Kiểm tra thứ tự: NK-260928-01 hoặc PX-260928-01 phải nằm trước PX-260925-01
const pos28Nhap = tbodyContent.indexOf('NK-260928-01');
const pos28Xuat = tbodyContent.indexOf('PX-260928-01');
const pos25Xuat = tbodyContent.indexOf('PX-260925-01');
assert(pos28Nhap < pos25Xuat, 'Phiếu ngày 28/09 phải nằm trước ngày 25/09');
assert(pos28Xuat < pos25Xuat, 'Phiếu ngày 28/09 phải nằm trước ngày 25/09');
console.log('  [PASS] Sắp xếp giảm dần theo thời gian (Timestamp Descending) chuẩn xác.');

// TEST 2: Test Scanner Selection & Checkbox Logic
console.log('\n--- TEST 2: Kiểm tra Checkbox và 1 Nút Hành Động trong Scanner ---');
const code07 = cleanScript(fs.readFileSync('src_demo/07_camera_scanner.js', 'utf8'));
vm.runInContext(code07, context);

context.window.extractedSerialsList = [
  { id: '1', serial: 'SN-001', selected: true },
  { id: '2', serial: 'SN-002', selected: true },
  { id: '3', serial: 'SN-003', selected: true }
];
context.setScanContext('NHAP_KHO');

context.updateScannerSubmitButtonLabel();
assert.strictEqual(getEl('btn-submit-extracted-label').textContent, 'Thêm 3 máy vào phiếu nhập');
assert.strictEqual(String(getEl('scanner-selected-count').textContent), '3');
console.log('  [PASS] Khi chọn 3 máy: Nhãn nút là "Thêm 3 máy vào phiếu nhập".');

// Bỏ chọn 1 máy
context.toggleSelectExtractedSerial('2', false);
assert.strictEqual(getEl('btn-submit-extracted-label').textContent, 'Thêm 2 máy vào phiếu nhập');
assert.strictEqual(String(getEl('scanner-selected-count').textContent), '2');
console.log('  [PASS] Bỏ tick 1 máy: Nhãn tự giảm còn "Thêm 2 máy vào phiếu nhập".');

// Chọn chỉ 1 máy
context.toggleSelectExtractedSerial('1', false);
assert.strictEqual(getEl('btn-submit-extracted-label').textContent, 'Thêm 1 máy vào phiếu nhập');
assert.strictEqual(String(getEl('scanner-selected-count').textContent), '1');
console.log('  [PASS] Chỉ chọn 1 máy: Nhãn tự cập nhật "Thêm 1 máy vào phiếu nhập".');

// Bỏ chọn tất cả
context.toggleSelectAllExtractedSerials(false);
assert.strictEqual(getEl('btn-submit-extracted-serials').disabled, true);
assert.strictEqual(getEl('btn-submit-extracted-label').textContent, 'Vui lòng tick chọn máy');
console.log('  [PASS] Khi không tick máy nào: Nút tự disabled và nhắc "Vui lòng tick chọn máy".');

// Chuyển ngữ cảnh sang XUAT_KHO
context.setScanContext('XUAT_KHO');
context.toggleSelectAllExtractedSerials(true);
assert.strictEqual(getEl('btn-submit-extracted-label').textContent, 'Thêm 3 máy vào phiếu xuất');
console.log('  [PASS] Khi ở Xuất kho: Nhãn tự động đổi thành "Thêm 3 máy vào phiếu xuất".');

console.log('\n====================================================');
console.log('TOÀN BỘ CÁC BÀI TEST CHUẨN ĐÃ ĐẠT 100%!');
console.log('====================================================');
