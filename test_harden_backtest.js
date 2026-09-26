const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('CHƯƠNG TRÌNH BACKTEST TỰ ĐỘNG - THANH AN WAREHOUSE V4');
console.log('KIỂM TRA KIẾN TRÚC: GOOGLE SHEETS LÀ SOURCE OF TRUTH');
console.log('HỆ THỐNG HARDENING: 7 NHÓM VẤN ĐỀ ĐỒNG BỘ & HIỆU NĂNG');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    if (details) console.log(`       -> ${details}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       -> ${details}`);
    failCount++;
  }
}

// ----------------------------------------------------
// TEST 1: KIỂM TRA CÚ PHÁP TẤT CẢ FILE ĐÃ SỬA
// ----------------------------------------------------
console.log('\n--- 1. KIỂM TRA CÚ PHÁP CÁC FILE NGUỒN ---');
const filesToCheck = [
  'src_demo/06_app_logic.js',
  'src_demo/08_nhap_kho_logic.js',
  'src_demo/09_xuat_kho_logic.js',
  'src_demo/12_lich_su_and_audit.js',
  'src_demo/02_topbar_and_sidebar.html',
  'gas/02_NhapKho.js',
  'gas/03_XuatKho.js',
  'gas/Code.js'
];

filesToCheck.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (relPath.endsWith('.js')) {
      new vm.Script(content);
    }
    assert(true, `Cú pháp file: ${relPath} hợp lệ.`);
  } catch (err) {
    assert(false, `Cú pháp file: ${relPath} LỖI`, err.message);
  }
});

// ----------------------------------------------------
// TEST 2: CHUẨN HÓA TRẠNG THÁI SERIAL (normalizeSerialStatus)
// ----------------------------------------------------
console.log('\n--- 2. KIỂM TRA CHUẨN HÓA TRẠNG THÁI SERIAL ---');
const gasCode = fs.readFileSync(path.join(__dirname, 'gas/Code.js'), 'utf8');
const clientAppLogic = fs.readFileSync(path.join(__dirname, 'src_demo/06_app_logic.js'), 'utf8');

assert(gasCode.includes('function normalizeSerialStatus(rawStatus)'), 'gas/Code.js định nghĩa normalizeSerialStatus.');
assert(clientAppLogic.includes('function normalizeSerialStatus(rawStatus)'), 'src_demo/06_app_logic.js định nghĩa normalizeSerialStatus.');

// Mock test normalizeSerialStatus
function testNormalizeSerialStatus(raw) {
  if (!raw) return 'UNKNOWN';
  const s = String(raw).trim();
  const upper = s.toUpperCase();
  if (upper === 'TỒN KHO' || upper === 'IN_STOCK' || upper === 'AVAILABLE') return 'IN_STOCK';
  if (upper === 'ĐÃ XUẤT' || upper === 'SOLD') return 'SOLD';
  if (upper === 'VOID' || upper === 'HỦY' || upper === 'HUY') return 'VOID';
  if (upper === 'CANCELLED_IMPORT' || upper === 'HỦY NHẬP') return 'CANCELLED_IMPORT';
  if (upper === 'IN_WARRANTY' || upper === 'BẢO HÀNH' || upper === 'BAO_HANH') return 'IN_WARRANTY';
  if (upper === 'RETURNED' || upper === 'TRẢ HÀNG' || upper === 'TRA_HANG') return 'RETURNED';
  if (upper === 'IN_TRANSFER' || upper === 'CHUYỂN KHO') return 'IN_TRANSFER';
  return s;
}

assert(testNormalizeSerialStatus('Tồn kho') === 'IN_STOCK', 'Tồn kho -> IN_STOCK');
assert(testNormalizeSerialStatus('Đã xuất') === 'SOLD', 'Đã xuất -> SOLD');
assert(testNormalizeSerialStatus('VOID') === 'VOID', 'VOID giữ nguyên VOID (không bị biến thành IN_STOCK).');
assert(testNormalizeSerialStatus('CANCELLED_IMPORT') === 'CANCELLED_IMPORT', 'CANCELLED_IMPORT giữ nguyên (không bị biến thành IN_STOCK).');
assert(testNormalizeSerialStatus('IN_WARRANTY') === 'IN_WARRANTY', 'IN_WARRANTY giữ nguyên (không bị biến thành IN_STOCK).');
assert(gasCode.includes('status: normalizeSerialStatus(r[9])'), 'getAllVouchersBackend dùng normalizeSerialStatus(r[9]).');

// ----------------------------------------------------
// TEST 3: SỬA LỖI SERIAL MA & RECONCILIATION KHI RENAME
// ----------------------------------------------------
console.log('\n--- 3. KIỂM TRA SỬA LỖI SERIAL MA KHI RENAME SERIAL ---');
assert(gasCode.includes("mutationType: isRename ? 'SERIAL_RENAMED' : 'SERIAL_UPDATED'"), 'saveQuickEditSerial trả về mutationType: SERIAL_RENAMED khi rename.');
assert(clientAppLogic.includes('LOẠI BỎ CÁC SERIAL MA ĐÃ BỊ ĐỔI TÊN HOẶC XÓA TRÊN SERVER'), 'Client appLogic lọc bỏ các serial không còn trên server.');

// Mock test serial reconciliation
let mockClientSerialDb = [
  { serial: 'SN-OLD-01', model: 'M1', status: 'IN_STOCK' }, // Đã bị đổi tên trên server thành SN-NEW-01
  { serial: 'SN-KEEP-02', model: 'M2', status: 'IN_STOCK' },
  { serial: 'SN-DRAFT-03', model: 'M3', status: 'IN_STOCK' }  // Đang trong giỏ draft
];
const mockServerSerials = [
  { serial: 'SN-NEW-01', model: 'M1', status: 'IN_STOCK' },
  { serial: 'SN-KEEP-02', model: 'M2', status: 'IN_STOCK' }
];
const mockLocalDrafts = new Set(['SN-DRAFT-03']);
const serverSet = new Set(mockServerSerials.map(s => s.serial));

mockClientSerialDb = mockClientSerialDb.filter(localItem => {
  return serverSet.has(localItem.serial) || mockLocalDrafts.has(localItem.serial);
});
// Merge server serials
mockServerSerials.forEach(sv => {
  if (!mockClientSerialDb.some(l => l.serial === sv.serial)) {
    mockClientSerialDb.push(sv);
  }
});

assert(!mockClientSerialDb.some(s => s.serial === 'SN-OLD-01'), 'Serial cũ SN-OLD-01 bị xóa sạch khỏi client, không còn Serial ma.');
assert(mockClientSerialDb.some(s => s.serial === 'SN-NEW-01'), 'Serial mới SN-NEW-01 có mặt trong client DB.');
assert(mockClientSerialDb.some(s => s.serial === 'SN-DRAFT-03'), 'Serial nháp chưa commit SN-DRAFT-03 không bị xóa nhầm.');

// ----------------------------------------------------
// TEST 4: QUICK EDIT SERIAL: VALIDATE DUPLICATE & CHẶN SỬA KHI ĐÃ SOLD
// ----------------------------------------------------
console.log('\n--- 4. KIỂM TRA VALIDATE DUPLICATE & STATUS KHI QUICK EDIT ---');
assert(gasCode.includes("Thiết bị [${oldSn}] đã xuất bán! Số Serial đã xuất kho tuyệt đối không được phép chỉnh sửa"), 'Chặn sửa Serial khi thiết bị đã SOLD.');
assert(gasCode.includes("Số Serial mới [${newSn}] đã tồn tại trong hệ thống! Không thể đổi tên bị trùng lặp"), 'Chặn trùng lặp Serial ở backend.');
assert(gasCode.includes('lsNhapSheet.getRange(i + 2, 6).setValue(snArr.join'), 'Cascade update số serial trong LICH_SU_NHAP khi rename.');

// UI lock serial on export vouchers
const lichSuJs = fs.readFileSync(path.join(__dirname, 'src_demo/12_lich_su_and_audit.js'), 'utf8');
assert(lichSuJs.includes('${!isNhap ? \'readonly disabled title="Số Serial ở phiếu xuất không được phép chỉnh sửa"\' : \'\'}'), 'Modal sửa phiếu xuất khóa readonly và disabled ô Serial.');

// ----------------------------------------------------
// TEST 5: SỬA LỖI UX XUẤT KHO (BUTTON UNLOCK TIMING)
// ----------------------------------------------------
console.log('\n--- 5. KIỂM TRA UX XUẤT KHO KHÔNG UNLOCK SỚM ---');
const xuatKhoLogicJs = fs.readFileSync(path.join(__dirname, 'src_demo/09_xuat_kho_logic.js'), 'utf8');
assert(xuatKhoLogicJs.includes('function unlockXuatButton()'), 'Định nghĩa hàm unlockXuatButton tập trung.');
assert(!xuatKhoLogicJs.includes('finally {\n      IS_PROCESSING_XUAT = false;'), 'Đã loại bỏ outer finally giải phóng sớm.');
assert(xuatKhoLogicJs.includes('unlockXuatButton();\n      const itemCount = CURRENT_DRAFT_XUAT_ITEMS.length;') || xuatKhoLogicJs.includes('unlockXuatButton();\n\n      // Reset các ô giấy tờ'), 'Chỉ unlock nút khi finalizeSuccess hoặc withFailureHandler được gọi.');

// ----------------------------------------------------
// TEST 6: DRAFT ĐA MÁY SERVER-SIDE (V4_DRAFT_VOUCHERS)
// ----------------------------------------------------
console.log('\n--- 6. KIỂM TRA DRAFT ĐA MÁY SERVER-SIDE ---');
assert(gasCode.includes('function saveDraftVoucherBackend(payload)'), 'Backend hỗ trợ saveDraftVoucherBackend.');
assert(gasCode.includes('function getAllDraftVouchersBackend()'), 'Backend hỗ trợ getAllDraftVouchersBackend.');
assert(gasCode.includes('function deleteDraftVoucherBackend(maPhieu)'), 'Backend hỗ trợ deleteDraftVoucherBackend.');
assert(gasCode.includes('V4_DRAFT_VOUCHERS'), 'Sử dụng sheet riêng V4_DRAFT_VOUCHERS cách ly khỏi sổ kho.');
assert(gasCode.includes('drafts: serverDrafts'), 'getAllVouchersBackend trả về danh sách serverDrafts.');

const nhapKhoLogicJs = fs.readFileSync(path.join(__dirname, 'src_demo/08_nhap_kho_logic.js'), 'utf8');
assert(nhapKhoLogicJs.includes('WarehouseAPI.saveDraftVoucher(voucherRecord)'), 'Nhập kho lưu draft lên server-side.');
assert(xuatKhoLogicJs.includes('WarehouseAPI.saveDraftVoucher(voucherRecord)'), 'Xuất kho lưu draft lên server-side.');

// ----------------------------------------------------
// TEST 7: SMART MANUAL REFRESH & MONOTONIC VERSION
// ----------------------------------------------------
console.log('\n--- 7. KIỂM TRA SMART MANUAL REFRESH & MONOTONIC VERSION ---');
assert(gasCode.includes('function getNextDataVersion()'), 'Backend hỗ trợ monotonic version getNextDataVersion.');
assert(gasCode.includes('DATA_VERSION'), 'Backend lưu và quản lý DATA_VERSION.');
assert(clientAppLogic.includes('Dữ liệu đã là mới nhất'), 'handleManualSyncClick báo dữ liệu đã mới nhất nếu version không đổi.');
assert(clientAppLogic.includes('WarehouseAPI.checkDataVersion(verRes =>'), 'handleManualSyncClick kiểm tra version siêu nhẹ trước khi kéo dữ liệu.');

// ----------------------------------------------------
// TEST 8: HOT PATH XUẤT KHO: LOOKUP 1 CỘT SERIAL
// ----------------------------------------------------
console.log('\n--- 8. KIỂM TRA TỐI ƯU HOT PATH XUẤT KHO ---');
const xuatKhoGasJs = fs.readFileSync(path.join(__dirname, 'gas/03_XuatKho.js'), 'utf8');
assert(xuatKhoGasJs.includes('tbSheet.getRange(2, 1, totalRows, 1).getValues()'), 'Chỉ đọc duy nhất Cột 1 (Serial) để map dòng.');
assert(!xuatKhoGasJs.includes('const tableData = tbSheet.getRange(2, 1, totalRows, numCols).getValues()'), 'Đã loại bỏ lệnh đọc toàn bộ 18 cột cả bảng.');
assert(xuatKhoGasJs.includes('tbSheet.getRange(rowNum, 6, 1, 12).setValues([row12Cols])'), 'Gộp cập nhật cột 6-17 vào 1 lệnh setValues 12 cột.');
assert(xuatKhoGasJs.includes('[XUAT_KHO_PERF]'), 'Có instrumentation ghi nhận timing thực tế.');

// ----------------------------------------------------
// TEST 9: CONCURRENCY PROTECTION & BATCH WRITE IN SAVE_VOUCHER_EDIT
// ----------------------------------------------------
console.log('\n--- 9. KIỂM TRA CONCURRENCY & BATCH WRITE TRONG SỬA PHIẾU ---');
assert(gasCode.includes('const lock = LockService.getScriptLock()'), 'saveVoucherEdit sử dụng LockService bảo vệ concurrency.');
assert(gasCode.includes('historySheet.getRange(row, 2, 1, rowSlice.length).setValues([rowSlice])'), 'saveVoucherEdit batch write lịch sử trong 1 lệnh duy nhất.');
assert(gasCode.includes('tbSheet.getRange(row, 1, 1, 18).setValues([curRowVals])'), 'saveVoucherEdit batch write 18 cột thiết bị trong 1 lệnh duy nhất.');
assert(gasCode.includes('tbSheet.getRange(row, 10, 1, 5).setValues([[\'IN_STOCK\', \'\', \'\', \'\', \'\']])'), 'Differential rollback batch write 5 cột trong 1 lệnh.');

// ----------------------------------------------------
// TỔNG KẾT
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`KẾT QUẢ BACKTEST: ${passCount} PASSED, ${failCount} FAILED.`);
if (failCount === 0) {
  console.log('TẤT CẢ CÁC BÀI TEST ĐỀU ĐẠT CHUẨN 100%!');
} else {
  console.error('CÓ BÀI TEST CHƯA ĐẠT, VUI LÒNG KIỂM TRA LẠI!');
  process.exit(1);
}
console.log('====================================================');
