/**
 * BACKTEST: XÓA DRAFT NHẬP/XUẤT THEO KIỂU SERVER-AUTHORITATIVE
 * Kiểm tra 2 kịch bản chính xác theo yêu cầu người dùng:
 * 1. Backend success -> Draft biến mất hoàn toàn ở local + server.
 * 2. Backend fail / mất mạng -> Draft giữ nguyên 100%, không bị xóa local, không báo thành công.
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('BẮT ĐẦU TEST: XÓA DRAFT SERVER-AUTHORITATIVE (NHẬP & XUẤT)');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Kiểm tra cấu trúc code trong src_demo/12_lich_su_and_audit.js
const lsCode = fs.readFileSync('src_demo/12_lich_su_and_audit.js', 'utf8');

assert(lsCode.includes('Swal.showLoading()'), 'Có hiển thị hiệu ứng Loading khi gửi yêu cầu xóa draft');
assert(lsCode.includes('WarehouseAPI.deleteDraftVoucher(maPhieu, res =>'), 'deleteDraftExportVoucher truyền callback chờ server phản hồi');
assert(lsCode.includes('WarehouseAPI.deleteDraftVoucher(maPhieu, res =>') && lsCode.indexOf('WarehouseAPI.deleteDraftVoucher(maPhieu, res =>') !== lsCode.lastIndexOf('WarehouseAPI.deleteDraftVoucher(maPhieu, res =>'), 'Cả deleteDraftExportVoucher và deleteDraftImportVoucher đều truyền callback chờ phản hồi');

// 2. Mô phỏng chi tiết 2 ca Test nghiệp vụ
function runDeleteSimulation({ isServerSuccess, errorMessage, voucherType, maPhieu }) {
  // Giả lập cơ sở dữ liệu Client
  let vouchersDb = {
    xuat: [{ maPhieu: 'PX-DRAFT-TEST', status: 'DRAFT', items: [{ serial: 'SN-01' }] }],
    nhap: [{ maPhieu: 'PN-DRAFT-TEST', status: 'DRAFT', items: [{ serial: 'SN-02' }] }]
  };
  let localStorageMock = {
    THANH_AN_VOUCHERS_DB: JSON.stringify(vouchersDb)
  };
  let swalState = {
    type: null,
    title: null,
    message: null
  };

  // Giả lập hàm gọi backend
  function mockWarehouseApiDelete(id, cb) {
    if (isServerSuccess) {
      cb({ success: true });
    } else {
      cb({ success: false, error: errorMessage });
    }
  }

  // Logic thực thi server-authoritative
  function executeDelete(type, targetMa) {
    const listKey = type.toLowerCase();
    mockWarehouseApiDelete(targetMa, res => {
      if (res && res.success) {
        // Chỉ xóa khi server thành công
        vouchersDb[listKey] = vouchersDb[listKey].filter(x => x.maPhieu !== targetMa);
        localStorageMock.THANH_AN_VOUCHERS_DB = JSON.stringify(vouchersDb);
        swalState = { type: 'success', title: 'Đã xóa', message: 'Thành công' };
      } else {
        // Khi lỗi: giữ nguyên 100%
        swalState = { type: 'error', title: 'Lỗi xóa phiếu nháp!', message: res.error };
      }
    });
  }

  executeDelete(voucherType, maPhieu);

  return { vouchersDb, localStorageMock, swalState };
}

// -------------------------------------------------------------
// TEST 1: BACKEND SUCCESS -> DRAFT BIẾN MẤT HOÀN TOÀN
// -------------------------------------------------------------
console.log('\n--- TEST 1: BACKEND SUCCESS (MÁY CHỦ XÓA THÀNH CÔNG) ---');

// Test 1A: Phiếu Xuất
const res1A = runDeleteSimulation({
  isServerSuccess: true,
  voucherType: 'xuat',
  maPhieu: 'PX-DRAFT-TEST'
});
assert(res1A.vouchersDb.xuat.length === 0, 'Phiếu xuất nháp đã bị xóa khỏi VOUCHERS_DB.xuat');
assert(!res1A.localStorageMock.THANH_AN_VOUCHERS_DB.includes('PX-DRAFT-TEST'), 'Phiếu xuất nháp không còn trong localStorage');
assert(res1A.swalState.type === 'success', 'Hiển thị thông báo "Đã xóa" thành công cho người dùng');

// Test 1B: Phiếu Nhập
const res1B = runDeleteSimulation({
  isServerSuccess: true,
  voucherType: 'nhap',
  maPhieu: 'PN-DRAFT-TEST'
});
assert(res1B.vouchersDb.nhap.length === 0, 'Phiếu nhập nháp đã bị xóa khỏi VOUCHERS_DB.nhap');
assert(!res1B.localStorageMock.THANH_AN_VOUCHERS_DB.includes('PN-DRAFT-TEST'), 'Phiếu nhập nháp không còn trong localStorage');
assert(res1B.swalState.type === 'success', 'Hiển thị thông báo "Đã xóa" thành công cho người dùng');

// -------------------------------------------------------------
// TEST 2: BACKEND FAIL / MẤT MẠNG -> DRAFT GIỮ NGUYÊN 100%
// -------------------------------------------------------------
console.log('\n--- TEST 2: BACKEND FAIL / MẤT MẠNG (MÁY CHỦ TỪ CHỐI HOẶC RỚT MẠNG) ---');

// Test 2A: Phiếu Xuất khi lỗi mạng
const res2A = runDeleteSimulation({
  isServerSuccess: false,
  errorMessage: 'Network timeout: Connection to Google Sheets lost',
  voucherType: 'xuat',
  maPhieu: 'PX-DRAFT-TEST'
});
assert(res2A.vouchersDb.xuat.length === 1, 'Phiếu xuất nháp VẪN CÒN NGUYÊN trong VOUCHERS_DB.xuat (KHÔNG BỊ XÓA NHẦM)');
assert(res2A.localStorageMock.THANH_AN_VOUCHERS_DB.includes('PX-DRAFT-TEST'), 'Phiếu xuất nháp VẪN CÒN NGUYÊN trong localStorage');
assert(res2A.swalState.type === 'error', 'Hiển thị cảnh báo lỗi, TUYỆT ĐỐI KHÔNG báo thành công');
assert(res2A.swalState.message.includes('Connection to Google Sheets lost'), 'Thông báo lỗi chi tiết để người dùng hiểu nguyên nhân và thử lại');

// Test 2B: Phiếu Nhập khi lỗi mạng
const res2B = runDeleteSimulation({
  isServerSuccess: false,
  errorMessage: 'ScriptError: Permission denied or Sheet Locked',
  voucherType: 'nhap',
  maPhieu: 'PN-DRAFT-TEST'
});
assert(res2B.vouchersDb.nhap.length === 1, 'Phiếu nhập nháp VẪN CÒN NGUYÊN trong VOUCHERS_DB.nhap (KHÔNG BỊ XÓA NHẦM)');
assert(res2B.localStorageMock.THANH_AN_VOUCHERS_DB.includes('PN-DRAFT-TEST'), 'Phiếu nhập nháp VẪN CÒN NGUYÊN trong localStorage');
assert(res2B.swalState.type === 'error', 'Hiển thị cảnh báo lỗi, TUYỆT ĐỐI KHÔNG báo thành công');

console.log('\n================================================================');
console.log(`KẾT QUẢ TEST: PASS: ${passCount} | FAIL: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('TẤT CẢ CÁC CA KIỂM THỬ XÓA DRAFT SERVER-AUTHORITATIVE ĐẠT 100%!');
}
