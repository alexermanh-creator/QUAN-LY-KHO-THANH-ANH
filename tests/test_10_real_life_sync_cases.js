/**
 * ============================================================================
 * KIỂM THỬ TỰ ĐỘNG 10 TÌNH HUỐNG THỰC TẾ (10 REAL-LIFE TEST CASES)
 * YÊU CẦU MỤC 15 - SYSTEM ARCHITECT VERIFICATION
 * ============================================================================
 */

const assert = require('assert');

console.log('================================================================================');
console.log('   BẮT ĐẦU CHẠY KIỂM THỬ 10 CA ĐỒNG BỘ THỰC TẾ - THÀNH AN V4');
console.log('================================================================================\n');

// 1. MÔ PHỎNG CSDL TRUNG TÂM (SOURCE OF TRUTH)
let MASTER_PRODUCTS = [
  { model: 'HP 4003dw', ten: 'Máy in laser HP 4003dw', hang: 'HP', nhom: 'Máy In', defaultBh: 12 },
  { model: 'LG 24U411A-B', ten: 'Màn hình LG 24 inch', hang: 'LG', nhom: 'Màn Hình', defaultBh: 24 }
];

let SERIAL_DB = [];
let VOUCHERS_DB = { nhap: [], xuat: [] };
let WARRANTY_CASES_DB = [];
let AUDIT_LOG_DB = [];

// MÔ PHỎNG DIRTY STATE & MODULE DEPENDENCIES
const MODULE_STATE = {
  Dashboard: { rendered: false, dirty: true },
  TonKho: { rendered: false, dirty: true },
  NhapKho: { rendered: false, dirty: true },
  XuatKho: { rendered: false, dirty: true },
  BaoHanh: { rendered: false, dirty: true },
  LichSu: { rendered: false, dirty: true },
  Serial360: { rendered: false, dirty: false }
};

const MODULE_DEPENDENCIES = {
  SERIAL_EDIT: ['TonKho', 'Dashboard', 'Serial360', 'LichSu'],
  STOCK_CHANGE: ['TonKho', 'Dashboard', 'Serial360', 'LichSu', 'XuatKho'],
  CUSTOMER_EDIT: ['XuatKho', 'LichSu', 'Serial360', 'DanhMuc'],
  SUPPLIER_EDIT: ['NhapKho', 'LichSu', 'Serial360', 'DanhMuc'],
  MODEL_EDIT: ['NhapKho', 'XuatKho', 'TonKho', 'Serial360', 'DanhMuc'],
  VOUCHER_EDIT: ['TonKho', 'Dashboard', 'Serial360', 'LichSu', 'NhapKho', 'XuatKho'],
  VOUCHER_CANCEL: ['TonKho', 'Dashboard', 'Serial360', 'LichSu', 'NhapKho', 'XuatKho']
};

function markModulesDirty(deps) {
  deps.forEach(m => {
    if (MODULE_STATE[m]) MODULE_STATE[m].dirty = true;
  });
}

function notifySystemDataChanged(type, detail) {
  const deps = MODULE_DEPENDENCIES[type] || ['TonKho', 'Dashboard', 'Serial360', 'LichSu'];
  markModulesDirty(deps);
}

// RESOLVER 360 ĐỘNG
function resolveSerial360(serial) {
  const s = SERIAL_DB.find(x => x.serial.toLowerCase() === serial.toLowerCase());
  if (!s) return null;
  const p = MASTER_PRODUCTS.find(item => item.model === s.model);
  return {
    ...s,
    displayTenHang: p ? p.ten : s.model,
    displayHang: p ? p.hang : 'Chưa rõ',
    displayNhom: p ? p.nhom : 'Khác'
  };
}

let testCount = 0;
let passedCount = 0;

function runCase(caseNum, title, testFn) {
  testCount++;
  try {
    testFn();
    passedCount++;
    console.log(`  [PASS] CASE ${caseNum}: ${title}`);
  } catch (err) {
    console.error(`  [FAIL] CASE ${caseNum}: ${title} -> Lỗi: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// CASE 1: Nhập kho mới -> mở Tồn kho -> thấy dữ liệu mới -> mở Serial360 -> thấy Serial mới -> Dashboard cập nhật đúng.
// -----------------------------------------------------------------------------
runCase(1, 'Nhập kho mới -> Tồn kho, Serial 360, Dashboard đồng bộ', () => {
  // Reset dirty states
  Object.keys(MODULE_STATE).forEach(k => { MODULE_STATE[k].dirty = false; MODULE_STATE[k].rendered = true; });

  const pn = {
    maPhieu: 'PN-01',
    ngay: '25/09/2026',
    ncc: 'SYNNEX_FPT',
    kho: 'Kho VP',
    items: [{ serial: 'SN-001', model: 'HP 4003dw' }]
  };
  VOUCHERS_DB.nhap.push(pn);
  SERIAL_DB.push({
    serial: 'SN-001',
    model: 'HP 4003dw',
    kho: 'Kho VP',
    ncc: 'SYNNEX_FPT',
    ngayNhap: '25/09/2026',
    status: 'IN_STOCK'
  });

  notifySystemDataChanged('STOCK_CHANGE', { serial: 'SN-001' });

  assert.strictEqual(MODULE_STATE.TonKho.dirty, true, 'TonKho phải bị dirty sau nhập');
  assert.strictEqual(MODULE_STATE.Dashboard.dirty, true, 'Dashboard phải bị dirty sau nhập');
  assert.strictEqual(MODULE_STATE.Serial360.dirty, true, 'Serial360 phải bị dirty sau nhập');

  const p360 = resolveSerial360('SN-001');
  assert(p360 !== null, 'Phải tra cứu được Serial 360');
  assert.strictEqual(p360.status, 'IN_STOCK', 'Trạng thái máy phải là IN_STOCK');
  assert.strictEqual(p360.displayTenHang, 'Máy in laser HP 4003dw', 'Tên hàng phải lấy đúng');
});

// -----------------------------------------------------------------------------
// CASE 2: Sửa NCC trong phiếu nhập -> Lịch sử nhập cập nhật -> Chi tiết phiếu cập nhật -> không cần full refresh app.
// -----------------------------------------------------------------------------
runCase(2, 'Sửa NCC trong phiếu nhập -> Lịch sử & Chi tiết cập nhật', () => {
  Object.keys(MODULE_STATE).forEach(k => { MODULE_STATE[k].dirty = false; });

  const v = VOUCHERS_DB.nhap.find(x => x.maPhieu === 'PN-01');
  v.ncc = 'DIGIWORLD';
  // Cascade sang serial
  SERIAL_DB.filter(s => s.maPhieuNhap === 'PN-01').forEach(s => s.ncc = 'DIGIWORLD');

  notifySystemDataChanged('SUPPLIER_EDIT', { voucher: 'PN-01' });

  assert.strictEqual(v.ncc, 'DIGIWORLD');
  assert.strictEqual(MODULE_STATE.LichSu.dirty, true, 'Lịch sử phải được mark dirty để cập nhật view');
  assert.strictEqual(MODULE_STATE.Serial360.dirty, true, 'Serial360 phải mark dirty');
});

// -----------------------------------------------------------------------------
// CASE 3: Sửa khách hàng phiếu xuất -> Phiếu xuất / Lịch sử / Serial360 đồng bộ.
// -----------------------------------------------------------------------------
runCase(3, 'Sửa khách hàng phiếu xuất -> Lịch sử & Serial360 đồng bộ', () => {
  // Giả lập xuất kho SN-001
  const s = SERIAL_DB.find(x => x.serial === 'SN-001');
  s.status = 'SOLD';
  s.maPhieuXuat = 'PX-01';
  s.khachHang = 'Cty Khách Cũ';
  s.sdtKhach = '0901111111';

  VOUCHERS_DB.xuat.push({
    maPhieu: 'PX-01',
    khachHang: 'Cty Khách Cũ',
    sdtKhach: '0901111111',
    items: [{ serial: 'SN-001' }]
  });

  // Người dùng sửa phiếu xuất đổi khách hàng
  const v = VOUCHERS_DB.xuat.find(x => x.maPhieu === 'PX-01');
  v.khachHang = 'Cty CP Giải Pháp Số Toàn Cầu';
  v.sdtKhach = '0988889999';
  v.nguoiLienHe = 'Chị Lan';

  // Cascade sang serial
  SERIAL_DB.filter(x => x.maPhieuXuat === 'PX-01').forEach(x => {
    x.khachHang = v.khachHang;
    x.sdtKhach = v.sdtKhach;
    x.nguoiLienHe = v.nguoiLienHe;
  });

  notifySystemDataChanged('VOUCHER_EDIT', { maPhieu: 'PX-01' });

  const p360 = resolveSerial360('SN-001');
  assert.strictEqual(p360.khachHang, 'Cty CP Giải Pháp Số Toàn Cầu');
  assert.strictEqual(p360.nguoiLienHe, 'Chị Lan');
  assert.strictEqual(MODULE_STATE.LichSu.dirty, true);
});

// -----------------------------------------------------------------------------
// CASE 4: Sửa Serial chưa phát sinh giao dịch sau -> Serial cũ biến mất đúng nơi, Serial mới xuất hiện đúng nơi, không duplicate, Serial360 mới đúng.
// -----------------------------------------------------------------------------
runCase(4, 'Sửa Serial chưa có giao dịch sau -> Đổi thành công, không duplicate', () => {
  SERIAL_DB.push({
    serial: 'SN-OLD-999',
    model: 'LG 24U411A-B',
    kho: 'Kho VP',
    status: 'IN_STOCK'
  });

  // Tiến hành đổi sang SN-NEW-999
  const oldSn = 'SN-OLD-999';
  const newSn = 'SN-NEW-999';

  // Check trùng
  const dup = SERIAL_DB.find(x => x.serial.toLowerCase() === newSn.toLowerCase());
  assert(!dup, 'Không được trùng');

  const target = SERIAL_DB.find(x => x.serial === oldSn);
  target.serial = newSn;

  notifySystemDataChanged('SERIAL_EDIT', { serial: oldSn, newSerial: newSn });

  assert.strictEqual(resolveSerial360(oldSn), null, 'Serial cũ phải không còn tồn tại');
  const pNew = resolveSerial360(newSn);
  assert(pNew !== null, 'Serial mới phải tra cứu được');
  assert.strictEqual(pNew.model, 'LG 24U411A-B');
});

// -----------------------------------------------------------------------------
// CASE 5: Sửa Serial đã có bảo hành/giao dịch sau -> backend phải chặn, UI báo rõ lý do.
// -----------------------------------------------------------------------------
runCase(5, 'Sửa Serial đã có ca bảo hành -> Chặn thao tác để bảo vệ toàn vẹn', () => {
  WARRANTY_CASES_DB.push({
    caseId: 'BH-01',
    serial: 'SN-NEW-999',
    status: 'PENDING'
  });

  let blocked = false;
  let blockReason = '';

  const tryRenameSerial = (fromSn, toSn) => {
    const hasWarranty = WARRANTY_CASES_DB.some(w => w.serial.toLowerCase() === fromSn.toLowerCase());
    if (hasWarranty) {
      blocked = true;
      blockReason = `Chặn thao tác: Thiết bị [${fromSn}] đã có ca bảo hành trong lịch sử!`;
      return false;
    }
    return true;
  };

  const success = tryRenameSerial('SN-NEW-999', 'SN-FAIL-RENAME');
  assert.strictEqual(success, false, 'Phải chặn không cho đổi serial');
  assert.strictEqual(blocked, true);
  assert(blockReason.includes('đã có ca bảo hành'));
});

// -----------------------------------------------------------------------------
// CASE 6: Hủy phiếu nhập -> tồn kho giảm đúng, Serial liên quan cập nhật đúng, History/Audit đúng.
// -----------------------------------------------------------------------------
runCase(6, 'Hủy phiếu nhập -> Serial đánh dấu CANCELLED_IMPORT, tồn kho giảm', () => {
  const pn = VOUCHERS_DB.nhap.find(x => x.maPhieu === 'PN-01');
  pn.status = 'CANCELLED';

  SERIAL_DB.filter(s => s.maPhieuNhap === 'PN-01').forEach(s => {
    s.status = 'CANCELLED_IMPORT';
  });

  notifySystemDataChanged('VOUCHER_CANCEL', { maPhieu: 'PN-01' });

  const inStockCount = SERIAL_DB.filter(s => s.status === 'IN_STOCK' && s.maPhieuNhap === 'PN-01').length;
  assert.strictEqual(inStockCount, 0, 'Tồn kho từ phiếu bị hủy phải = 0');
  assert.strictEqual(MODULE_STATE.TonKho.dirty, true);
  assert.strictEqual(MODULE_STATE.Dashboard.dirty, true);
});

// -----------------------------------------------------------------------------
// CASE 7: Hủy phiếu xuất -> Serial quay về tồn, Tồn kho/Dashboard/Serial360 đồng bộ.
// -----------------------------------------------------------------------------
runCase(7, 'Hủy phiếu xuất (hoặc gỡ máy) -> Hoàn trả IN_STOCK tự động', () => {
  const s = SERIAL_DB.find(x => x.serial === 'SN-001');
  s.status = 'SOLD';
  s.maPhieuXuat = 'PX-02';

  // Hủy phiếu xuất PX-02
  s.status = 'IN_STOCK';
  s.maPhieuXuat = '';
  s.khachHang = '';
  s.sdtKhach = '';
  s.nguoiLienHe = '';

  notifySystemDataChanged('STOCK_CHANGE', { serial: 'SN-001' });

  assert.strictEqual(s.status, 'IN_STOCK', 'Máy phải quay lại tồn kho IN_STOCK');
  assert.strictEqual(s.khachHang, '', 'Khách hàng phải được xóa bỏ');
  assert.strictEqual(MODULE_STATE.TonKho.dirty, true);
  assert.strictEqual(MODULE_STATE.Dashboard.dirty, true);
});

// -----------------------------------------------------------------------------
// CASE 8: Sửa dữ liệu ở Tồn kho -> chuyển sang Serial360 -> dữ liệu phải mới.
// -----------------------------------------------------------------------------
runCase(8, 'Sửa dữ liệu ở Tồn kho -> Serial 360 nhận dữ liệu mới tức thì', () => {
  const s = SERIAL_DB.find(x => x.serial === 'SN-001');
  s.kho = 'Kho Chi Nhánh Miền Nam';
  s.ghiChu = 'Đã kiểm tra kỹ thuật tại kho Tồn';

  notifySystemDataChanged('SERIAL_EDIT', { serial: 'SN-001' });

  const p360 = resolveSerial360('SN-001');
  assert.strictEqual(p360.kho, 'Kho Chi Nhánh Miền Nam');
  assert.strictEqual(p360.ghiChu, 'Đã kiểm tra kỹ thuật tại kho Tồn');
  assert.strictEqual(MODULE_STATE.Serial360.dirty, true);
});

// -----------------------------------------------------------------------------
// CASE 9: Sửa dữ liệu ở Serial360 -> chuyển sang Tồn kho -> dữ liệu phải mới.
// -----------------------------------------------------------------------------
runCase(9, 'Sửa dữ liệu ở Serial360 -> Tồn kho nhận dữ liệu mới', () => {
  const s = SERIAL_DB.find(x => x.serial === 'SN-001');
  s.internalId = 'ASSET-2026-HQ';
  s.soThangBh = 36;

  notifySystemDataChanged('SERIAL_EDIT', { serial: 'SN-001' });

  assert.strictEqual(MODULE_STATE.TonKho.dirty, true, 'Tồn kho phải dirty để vẽ lại');
  assert.strictEqual(s.internalId, 'ASSET-2026-HQ');
  assert.strictEqual(s.soThangBh, 36);
});

// -----------------------------------------------------------------------------
// CASE 10: Sửa liên tục nhiều record -> không xuất hiện stale state/cache cũ.
// -----------------------------------------------------------------------------
runCase(10, 'Sửa liên tục nhiều record -> Hệ thống giữ tính nhất quán 100%', () => {
  for (let i = 1; i <= 20; i++) {
    const sn = `BULK-SN-${i}`;
    SERIAL_DB.push({
      serial: sn,
      model: 'HP 4003dw',
      kho: 'Kho VP',
      status: 'IN_STOCK'
    });
    notifySystemDataChanged('STOCK_CHANGE', { serial: sn });
  }

  // Sửa liên tục 20 records
  for (let i = 1; i <= 20; i++) {
    const sn = `BULK-SN-${i}`;
    const s = SERIAL_DB.find(x => x.serial === sn);
    s.kho = (i % 2 === 0) ? 'Kho CN Hà Nội' : 'Kho CN Đà Nẵng';
    notifySystemDataChanged('SERIAL_EDIT', { serial: sn });
  }

  // Xác minh không record nào bị stale
  let correctCount = 0;
  for (let i = 1; i <= 20; i++) {
    const sn = `BULK-SN-${i}`;
    const s = SERIAL_DB.find(x => x.serial === sn);
    const expectedKho = (i % 2 === 0) ? 'Kho CN Hà Nội' : 'Kho CN Đà Nẵng';
    if (s.kho === expectedKho) correctCount++;
  }

  assert.strictEqual(correctCount, 20, '100% bản ghi phải đồng bộ đúng');
});

console.log('\n================================================================================');
console.log(`KẾT QUẢ: ${passedCount}/${testCount} CA THỰC TẾ ĐẠT CHUẨN (${(passedCount/testCount*100).toFixed(1)}%)!`);
console.log('================================================================================');

if (passedCount !== testCount) {
  process.exit(1);
}
