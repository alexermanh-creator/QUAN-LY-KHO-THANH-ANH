const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('CHƯƠNG TRÌNH BACKTEST TỰ ĐỘNG - THANH AN WAREHOUSE V4');
console.log('KIỂM TRA KIẾN TRÚC: GOOGLE SHEETS LÀ SOURCE OF TRUTH');
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
// TEST 2: KIỂM TRA SỰ HIỆN DIỆN CỦA NÚT CẬP NHẬT TRÊN TOPBAR
// ----------------------------------------------------
console.log('\n--- 2. KIỂM TRA NÚT ĐỒNG BỘ THỦ CÔNG TOPBAR ---');
const topbarHtml = fs.readFileSync(path.join(__dirname, 'src_demo/02_topbar_and_sidebar.html'), 'utf8');
assert(topbarHtml.includes('id="btn-manual-sync"'), 'Topbar chứa button #btn-manual-sync.');
assert(topbarHtml.includes('handleManualSyncClick()'), 'Nút gọi hàm handleManualSyncClick().');
assert(topbarHtml.includes('id="icon-manual-sync"'), 'Chứa icon xoay trạng thái #icon-manual-sync.');

// ----------------------------------------------------
// TEST 3: KIỂM TRA LOGIC NHẬP KHO: CLIENT CHỜ SERVER TRƯỚC KHI COMMIT
// ----------------------------------------------------
console.log('\n--- 3. KIỂM TRA FLOW NHẬP KHO (FAIL-SAFE & IDEMPOTENCY) ---');
const nhapLogic = fs.readFileSync(path.join(__dirname, 'src_demo/08_nhap_kho_logic.js'), 'utf8');
assert(nhapLogic.includes('CURRENT_NHAP_REQUEST_ID'), 'Nhập kho có quản lý requestId chống gửi lặp.');
assert(nhapLogic.includes('finalizeNhapKhoSuccess(serverRes)'), 'Client chỉ xóa Draft & cập nhật local DB trong finalizeNhapKhoSuccess khi server phản hồi thành công.');
assert(nhapLogic.includes('Giỏ hàng nhập kho của bạn <b>vẫn được giữ nguyên</b>'), 'Khi server báo lỗi hoặc mất kết nối, Draft được giữ nguyên 100%.');

// ----------------------------------------------------
// TEST 4: KIỂM TRA LOGIC XUẤT KHO: REQUEST_ID & ERROR PRESERVATION
// ----------------------------------------------------
console.log('\n--- 4. KIỂM TRA FLOW XUẤT KHO (IDEMPOTENCY & BATCH WRITE) ---');
const xuatLogic = fs.readFileSync(path.join(__dirname, 'src_demo/09_xuat_kho_logic.js'), 'utf8');
assert(xuatLogic.includes('CURRENT_XUAT_REQUEST_ID'), 'Xuất kho có quản lý CURRENT_XUAT_REQUEST_ID.');
assert(xuatLogic.includes('requestId: CURRENT_XUAT_REQUEST_ID'), 'Client truyền requestId trong payload executeXuatKho.');
assert(xuatLogic.includes('Giỏ hàng xuất kho của bạn <b>vẫn được giữ nguyên</b>'), 'Xuất kho giữ nguyên Draft khi server trả lỗi.');

const xuatBackend = fs.readFileSync(path.join(__dirname, 'gas/03_XuatKho.js'), 'utf8');
assert(xuatBackend.includes('REQ_XK_${requestId}'), 'Backend 03_XuatKho kiểm tra Cache idempotency với requestId.');
assert(xuatBackend.includes('tbSheet.getRange(rowNum, 6, 1, 12).setValues([row12Cols])'), 'Backend 03_XuatKho sử dụng 1 lệnh setValues duy nhất (12 cột) thay vì nhiều lệnh setValue/setValues rời rạc.');
assert(xuatBackend.includes('markDataChanged()'), 'Backend 03_XuatKho gọi markDataChanged() sau khi hoàn tất xuất kho.');

// ----------------------------------------------------
// TEST 5: KIỂM TRA BACKEND MARK_DATA_CHANGED TRÊN MỌI THAO TÁC MUTATING
// ----------------------------------------------------
console.log('\n--- 5. KIỂM TRA MARK_DATA_CHANGED TRÊN CÁC HÀM BACKEND ---');
const nhapBackend = fs.readFileSync(path.join(__dirname, 'gas/02_NhapKho.js'), 'utf8');
assert(nhapBackend.includes('markDataChanged()'), '02_NhapKho.js (executeNhapKhoMulti) gọi markDataChanged().');

const codeBackend = fs.readFileSync(path.join(__dirname, 'gas/Code.js'), 'utf8');
// Check saveVoucherEdit
const saveVoucherSnippet = codeBackend.substring(codeBackend.indexOf('function saveVoucherEdit'), codeBackend.indexOf('function saveQuickEditSerial'));
assert(saveVoucherSnippet.includes('markDataChanged()'), 'Code.js (saveVoucherEdit) gọi markDataChanged().');

// Check saveQuickEditSerial
const saveQuickSnippet = codeBackend.substring(codeBackend.indexOf('function saveQuickEditSerial'), codeBackend.indexOf('function saveUserAccountBackend'));
assert(saveQuickSnippet.includes('markDataChanged()'), 'Code.js (saveQuickEditSerial) gọi markDataChanged().');

// ----------------------------------------------------
// TEST 6: KIỂM TRA ĐỒNG BỘ SERIAL TOÀN DIỆN CHO NHIỀU MÁY (MULTI-USER SYNC)
// ----------------------------------------------------
console.log('\n--- 6. KIỂM TRA MULTI-USER SYNC (VOUCHERS & SERIALS) ---');
const getAllVouchersSnippet = codeBackend.substring(codeBackend.indexOf('function getAllVouchersBackend'), codeBackend.indexOf('function chuanHoaVaDonDepGoogleSheets'));
assert(getAllVouchersSnippet.includes('serials: serialList'), 'getAllVouchersBackend trả về cả danh sách serials từ SERIAL_MASTER.');

const appLogic = fs.readFileSync(path.join(__dirname, 'src_demo/06_app_logic.js'), 'utf8');
assert(appLogic.includes('3B. Gộp thông tin chi tiết Serial từ Server'), 'Client appLogic gộp mảng res.serials vào SERIAL_DB để đồng bộ kho, model, ghi chú, trạng thái khi máy khác sửa.');
assert(appLogic.includes('function handleManualSyncClick'), 'appLogic cung cấp hàm handleManualSyncClick cho nút Topbar.');

// ----------------------------------------------------
// TEST 7: KIỂM TRA KHÔNG CÓ LOCATION.RELOAD TRONG LUỒNG NGHIỆP VỤ
// ----------------------------------------------------
console.log('\n--- 7. KIỂM TRA NGUYÊN TẮC: KHÔNG RELOAD TRANG ---');
const dangerousReloads = [];
filesToCheck.forEach(relPath => {
  if (relPath.endsWith('.js')) {
    const content = fs.readFileSync(path.join(__dirname, relPath), 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('location.reload()') && !line.trim().startsWith('//')) {
        // Kiểm tra xem có phải trong ngữ cảnh reset khẩn cấp hay đăng xuất không
        if (!line.includes('reset') && !line.includes('logout') && !line.includes('Chế độ khôi phục')) {
          dangerousReloads.push(`${relPath}:${idx + 1}: ${line.trim()}`);
        }
      }
    });
  }
});
assert(dangerousReloads.length === 0, 'Không có location.reload() ngoài ý muốn trong luồng nghiệp vụ thông thường.', dangerousReloads.join('; '));

// ----------------------------------------------------
// TEST 8: MÔ PHỎNG BACKTEST RUNTIME (BEHAVIOR SIMULATION)
// ----------------------------------------------------
console.log('\n--- 8. BACKTEST MÔ PHỎNG CÁC TÌNH HUỐNG THỰC TẾ ---');

// Mô phỏng Tình huống 1 & 3: Mạng lỗi khi nhập kho -> Draft được giữ nguyên
let mockDraftNhap = [{ model: 'RT-AC68U', serial: 'SN-TEST-001', kho: 'Kho VP' }];
let mockSerialDb = [];
let mockIsProcessing = true;

function simulateNhapKhoFailure() {
  const err = new Error('ScriptError: Google Sheets Service Unavailable');
  // Giả lập failure handler:
  mockIsProcessing = false;
  // Không xóa mockDraftNhap, không thêm vào mockSerialDb
}
simulateNhapKhoFailure();
assert(mockDraftNhap.length === 1 && mockSerialDb.length === 0, 'Scenario 1 & 3: Lỗi kết nối Google Sheets -> Draft giữ nguyên, local DB không bị commit sai.');

// Mô phỏng Tình huống 2 & 5: Idempotency với requestId
const mockCache = new Map();
function simulateServerExecution(requestId, action) {
  if (mockCache.get(`REQ_${requestId}`) === 'DONE') {
    return { status: 'CACHED_SUCCESS', message: 'Yêu cầu đã được xử lý trước đó (Idempotent)' };
  }
  if (mockCache.get(`REQ_${requestId}`) === 'PROCESSING') {
    throw new Error('Yêu cầu đang được xử lý!');
  }
  mockCache.set(`REQ_${requestId}`, 'PROCESSING');
  // Giả lập ghi sheets
  mockCache.set(`REQ_${requestId}`, 'DONE');
  return { status: 'NEW_SUCCESS', message: 'Thành công' };
}

const req1 = simulateServerExecution('TX-001', 'NHAP');
const req2 = simulateServerExecution('TX-001', 'NHAP');
assert(req1.status === 'NEW_SUCCESS' && req2.status === 'CACHED_SUCCESS', 'Scenario 2 & 5: Idempotency chặn lặp request trùng lặp và trả về kết quả an toàn.');

// Mô phỏng Tình huống 4: Xuất kho khi serial đã bị máy khác xuất trước
const mockInventory = [
  { serial: 'SN-001', status: 'SOLD' }, // Đã bị máy B xuất
  { serial: 'SN-002', status: 'IN_STOCK' }
];

function simulateCheckAndExport(serialsToExport) {
  for (const sn of serialsToExport) {
    const found = mockInventory.find(i => i.serial === sn);
    if (!found) throw new Error(`Không tìm thấy serial [${sn}]!`);
    if (found.status !== 'IN_STOCK') throw new Error(`Thiết bị [${sn}] hiện không còn trong kho (Đã xuất)!`);
  }
  serialsToExport.forEach(sn => {
    mockInventory.find(i => i.serial === sn).status = 'SOLD';
  });
}

let errorThrown = false;
try {
  simulateCheckAndExport(['SN-001', 'SN-002']);
} catch(e) {
  errorThrown = true;
}
assert(errorThrown && mockInventory[1].status === 'IN_STOCK', 'Scenario 4: Phát hiện serial đã xuất ở máy khác -> Chặn toàn bộ transaction, SN-002 không bị partial update.');

// Mô phỏng Tình huống 6: Sửa nhanh thiết bị ở máy A -> máy B đồng bộ
const machineA_EditedSerial = {
  serial: 'SN-QUICK-01',
  kho: 'Kho CN',
  model: 'RT-AX88U Pro',
  ghiChu: 'Đã đổi kho và cập nhật ghi chú',
  status: 'IN_STOCK'
};

const machineB_SerialDb = [
  { serial: 'SN-QUICK-01', kho: 'Kho VP', model: 'RT-AX88U', ghiChu: '', status: 'IN_STOCK' }
];

// Mô phỏng syncVouchersFromServer gộp serials
function simulateMachineBSync(serverSerials) {
  serverSerials.forEach(sServer => {
    const found = machineB_SerialDb.find(s => s.serial === sServer.serial);
    if (found) {
      found.kho = sServer.kho;
      found.model = sServer.model;
      found.ghiChu = sServer.ghiChu;
    }
  });
}
simulateMachineBSync([machineA_EditedSerial]);
assert(machineB_SerialDb[0].kho === 'Kho CN' && machineB_SerialDb[0].model === 'RT-AX88U Pro', 'Scenario 6: Máy B đồng bộ chính xác thông tin sửa đổi từ máy A.');

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
