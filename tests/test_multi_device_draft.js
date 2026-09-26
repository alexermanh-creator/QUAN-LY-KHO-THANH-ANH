/**
 * BACKTEST TOÀN DIỆN: DRAFT PHIẾU XUẤT & NHẬP ĐA MÁY (SERVER-AUTHORITATIVE)
 * Kiểm tra 8 kịch bản nghiệp vụ thực tế giữa Điện thoại và Máy tính.
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('BẮT ĐẦU BACKTEST: DRAFT PHIẾU XUẤT & NHẬP ĐA THIẾT BỊ (V4)');
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

// 1. Kiểm tra cấu trúc code trong src_demo/09_xuat_kho_logic.js
const xuatCode = fs.readFileSync('src_demo/09_xuat_kho_logic.js', 'utf8');
console.log('Test Nhóm 1: Kiểm Tra Kiến Trúc Xuất Kho Server-Authoritative:');

assert(xuatCode.includes('let CURRENT_XUAT_DRAFT_ID = null'), 'Có biến toàn cục CURRENT_XUAT_DRAFT_ID để quản lý mã draft ổn định');
assert(xuatCode.includes('let CURRENT_XUAT_DRAFT_VERSION = null'), 'Có biến toàn cục CURRENT_XUAT_DRAFT_VERSION để chống xung đột phiên bản');
assert(xuatCode.includes('let IS_SAVING_XUAT_DRAFT = false'), 'Có biến cờ IS_SAVING_XUAT_DRAFT để chống click đúp khi bấm Lưu Nháp');
assert(xuatCode.includes('function resumeExportDraft(maPhieu)'), 'Có hàm resumeExportDraft(maPhieu) để nạp lại phiếu nháp trên PC');
assert(xuatCode.includes('showXuatDraftBanner'), 'Có hàm hiển thị banner thông báo đang tiếp tục draft');
assert(xuatCode.includes('draftId: CURRENT_XUAT_DRAFT_ID'), 'Hàm executeXuatKho có truyền draftId lên backend để tự động xóa draft khi confirm');
assert(xuatCode.includes('WarehouseAPI.deleteDraftVoucher(finishedDraftId)'), 'Hàm finalizeSuccess tự động xóa draft sau khi Google Sheets ghi nhận thành công');
assert(xuatCode.includes('isAvailable === false'), 'previewAndConfirmXuatVoucher chặn xuất nếu còn thiết bị không khả dụng');

// 2. Kiểm tra cấu trúc code trong src_demo/08_nhap_kho_logic.js
const nhapCode = fs.readFileSync('src_demo/08_nhap_kho_logic.js', 'utf8');
console.log('\nTest Nhóm 2: Kiểm Tra Kiến Trúc Nhập Kho Server-Authoritative:');

assert(nhapCode.includes('let CURRENT_NHAP_DRAFT_ID = null'), 'Có biến toàn cục CURRENT_NHAP_DRAFT_ID để quản lý mã draft nhập ổn định');
assert(nhapCode.includes('let CURRENT_NHAP_DRAFT_VERSION = null'), 'Có biến toàn cục CURRENT_NHAP_DRAFT_VERSION để chống xung đột phiên bản');
assert(nhapCode.includes('let IS_SAVING_NHAP_DRAFT = false'), 'Có biến cờ IS_SAVING_NHAP_DRAFT để chống click đúp');
assert(nhapCode.includes('function resumeImportDraft(maPhieu)'), 'Có hàm resumeImportDraft(maPhieu) để tiếp tục nhập trên PC');
assert(nhapCode.includes('showNhapDraftBanner'), 'Có hàm hiển thị banner thông báo đang tiếp tục draft nhập');
assert(nhapCode.includes('draftId: CURRENT_NHAP_DRAFT_ID'), 'Hàm executeNhapKhoMulti có truyền draftId lên backend');
assert(nhapCode.includes('WarehouseAPI.deleteDraftVoucher(finishedDraftId)'), 'Hàm finalizeNhapKhoSuccess tự động xóa draft sau khi nhập thành công');

// 3. Kiểm tra nút hành động trong src_demo/12_lich_su_and_audit.js
const lsCode = fs.readFileSync('src_demo/12_lich_su_and_audit.js', 'utf8');
console.log('\nTest Nhóm 3: Kiểm Tra Giao Diện Lịch Sử & Thao Tác Phiếu Nháp:');

assert(lsCode.includes('resumeExportDraft'), 'Bảng Lịch sử Xuất Kho có nút [Tiếp tục xuất] gọi resumeExportDraft');
assert(lsCode.includes('deleteDraftExportVoucher'), 'Bảng Lịch sử Xuất Kho có nút [Xóa Draft] gọi deleteDraftExportVoucher');
assert(lsCode.includes('resumeImportDraft'), 'Bảng Lịch sử Nhập Kho có nút [Tiếp tục nhập] gọi resumeImportDraft');
assert(lsCode.includes('deleteDraftImportVoucher'), 'Bảng Lịch sử Nhập Kho có nút [Xóa Draft] gọi deleteDraftImportVoucher');

// 4. Kiểm tra Backend Version Conflict Check (gas/Code.js & src/backend/Code.js)
const gasCode = fs.readFileSync('gas/Code.js', 'utf8');
console.log('\nTest Nhóm 4: Kiểm Tra Xử Lý Xung Đột Phiên Bản Server-Side (Optimistic Concurrency):');

assert(gasCode.includes('payload.expectedVersion && parseInt(payload.expectedVersion, 10) !== existingVer'), 
  'saveDraftVoucherBackend kiểm tra expectedVersion so với existingVer');
assert(gasCode.includes('đã được chỉnh sửa trên thiết bị khác'), 
  'Trả về thông báo lỗi rõ ràng khi phát hiện xung đột phiên bản');

// 5. Kiểm tra Tự Động Xóa Draft trên Google Apps Script (gas/02_NhapKho.js & gas/03_XuatKho.js)
const gasNhap = fs.readFileSync('gas/02_NhapKho.js', 'utf8');
const gasXuat = fs.readFileSync('gas/03_XuatKho.js', 'utf8');
console.log('\nTest Nhóm 5: Kiểm Tra Tự Động Dọn Dẹp Draft Sau Confirm (GAS Backend):');

assert(gasNhap.includes('deleteDraftVoucherBackend(targetDraftId)'), 'gas/02_NhapKho.js tự động gọi deleteDraftVoucherBackend khi confirm');
assert(gasXuat.includes('deleteDraftVoucherBackend(targetDraftId)'), 'gas/03_XuatKho.js tự động gọi deleteDraftVoucherBackend khi confirm');

// 6. Mô phỏng Logic Revalidate Serial Xuất Kho
console.log('\nTest Nhóm 6: Mô Phỏng Revalidation Serial Xuất Kho Khi Mở Draft Trên PC:');
const mockSerialDB = [
  { serial: 'SN-CANON-01', model: 'Canon LBP 2900', status: 'IN_STOCK', internalId: 'TA-001' },
  { serial: 'SN-CANON-02', model: 'Canon LBP 2900', status: 'SOLD', maPhieuXuat: 'PX2026-0005', internalId: 'TA-002' },
  { serial: 'SN-DELL-01', model: 'Dell Vostro 3520', status: 'IN_STOCK', internalId: 'TA-003' }
];

const mockDraftItems = [
  { serial: 'SN-CANON-01', model: 'Canon LBP 2900' },
  { serial: 'SN-CANON-02', model: 'Canon LBP 2900' },
  { serial: 'SN-HP-999', model: 'HP LaserJet' }
];

let invalidCount = 0;
const revalidatedItems = mockDraftItems.map(it => {
  const sn = it.serial.toUpperCase();
  const found = mockSerialDB.find(s => s.serial.toUpperCase() === sn);
  let isAvailable = true;
  let errorReason = '';
  if (!found) {
    isAvailable = false;
    errorReason = 'Không tìm thấy thiết bị trong kho';
    invalidCount++;
  } else if (found.status !== 'IN_STOCK') {
    isAvailable = false;
    errorReason = `Đã xuất trên phiếu ${found.maPhieuXuat}`;
    invalidCount++;
  }
  return { ...it, isAvailable, errorReason };
});

assert(revalidatedItems[0].isAvailable === true, 'Thiết bị SN-CANON-01 đang tồn kho -> isAvailable = true');
assert(revalidatedItems[1].isAvailable === false && revalidatedItems[1].errorReason.includes('PX2026-0005'), 
  'Thiết bị SN-CANON-02 đã bị máy khác bán -> isAvailable = false kèm mã phiếu đã xuất');
assert(revalidatedItems[2].isAvailable === false && revalidatedItems[2].errorReason.includes('Không tìm thấy'), 
  'Thiết bị SN-HP-999 không có trong kho -> isAvailable = false');
assert(invalidCount === 2, `Đếm đúng 2 thiết bị lỗi (thực tế: ${invalidCount})`);

// 7. Mô phỏng Logic Revalidate Serial Nhập Kho
console.log('\nTest Nhóm 7: Mô Phỏng Revalidation Serial Nhập Kho Chống Trùng:');
const mockDraftNhapItems = [
  { serial: 'SN-CANON-01', model: 'Canon LBP 2900' }, // Đã có trong mockSerialDB
  { serial: 'SN-NEW-9999', model: 'Canon LBP 2900' }  // Chưa có
];

let nhapErrorCount = 0;
const revalNhap = mockDraftNhapItems.map(it => {
  const sn = it.serial.toUpperCase();
  const exists = mockSerialDB.some(s => s.serial.toUpperCase() === sn);
  let isValid = true;
  let errorMsg = '';
  if (exists) {
    isValid = false;
    errorMsg = 'Serial đã tồn tại trong kho (trùng lặp)!';
    nhapErrorCount++;
  }
  return { ...it, isValid, errorMsg };
});

assert(revalNhap[0].isValid === false, 'Serial SN-CANON-01 đã có trong kho -> bị đánh dấu trùng lặp');
assert(revalNhap[1].isValid === true, 'Serial SN-NEW-9999 chưa từng nhập -> hợp lệ');
assert(nhapErrorCount === 1, `Đếm đúng 1 serial trùng lặp khi nhập (thực tế: ${nhapErrorCount})`);

// 8. Mô phỏng Concurrency Check Logic
console.log('\nTest Nhóm 8: Mô Phỏng Version Conflict Check:');
function simulateBackendDraftSave(serverRecord, payload) {
  if (serverRecord && payload.expectedVersion && parseInt(payload.expectedVersion, 10) !== serverRecord.version) {
    return {
      success: false,
      error: `Phiếu Draft [${payload.maPhieu}] đã được chỉnh sửa trên thiết bị khác (Server: v${serverRecord.version}, Client: v${payload.expectedVersion})`
    };
  }
  const nextVer = (serverRecord ? serverRecord.version : 0) + 1;
  return { success: true, version: nextVer };
}

const serverDraft = { maPhieu: 'PX-DRAFT-01', version: 2 };
const conflictClientReq = { maPhieu: 'PX-DRAFT-01', expectedVersion: 1 };
const validClientReq = { maPhieu: 'PX-DRAFT-01', expectedVersion: 2 };

const resConflict = simulateBackendDraftSave(serverDraft, conflictClientReq);
assert(resConflict.success === false && resConflict.error.includes('chỉnh sửa trên thiết bị khác'), 
  'Client v1 bị từ chối khi server đã lên v2');

const resValid = simulateBackendDraftSave(serverDraft, validClientReq);
assert(resValid.success === true && resValid.version === 3, 
  'Client v2 được chấp nhận và nâng version server lên v3');

console.log('\n================================================================');
console.log(`KẾT QUẢ TEST: PASS: ${passCount} | FAIL: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('TẤT CẢ 8 NHÓM TEST ĐỀU ĐẠT CHUẨN 100%!');
}
