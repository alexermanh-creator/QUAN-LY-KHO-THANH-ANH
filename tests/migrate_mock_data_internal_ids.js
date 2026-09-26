const fs = require('fs');
const vm = require('vm');

console.log('=== CHUẨN HÓA MÃ TỰ SINH NỘI BỘ TOÀN DIỆN (SERIAL_DB & VOUCHERS_DB) ===');

let content = fs.readFileSync('src_demo/05_mock_data.js', 'utf8');

// 1. Chuẩn hóa 7 mã Serial tự sinh của mực: TA-260911-001 -> TA-260911-000001 ... TA-260911-007 -> TA-260911-000007
for (let i = 1; i <= 7; i++) {
  const oldSerial = `TA-260911-00${i}`;
  const newSerial = `TA-260911-00000${i}`;
  const regex = new RegExp(oldSerial, 'g');
  const count = (content.match(regex) || []).length;
  content = content.replace(regex, newSerial);
  console.log(`Đã thay thế ${oldSerial} -> ${newSerial} (${count} vị trí)`);
}

// 2. Chạy sandbox để lấy danh sách ánh xạ từ SERIAL_DB
const sandbox = { window: {}, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
vm.runInContext(content.replace(/<\/?script[^>]*>/gi, ''), sandbox);

const serialDb = sandbox.window.SERIAL_DB || sandbox.SERIAL_DB || [];
console.log(`Số thiết bị trong SERIAL_DB: ${serialDb.length}`);

// Tạo bảng ánh xạ: oldInternalId -> newInternalId
// Và serial -> newInternalId
const internalIdMap = new Map();

serialDb.forEach((item, idx) => {
  const oldId = item.internalId;
  const ngayNhap = item.ngayNhap || '20/09/2026';
  const num = idx + 1;
  const padNum = String(num).padStart(6, '0');

  let datePart = '260920';
  if (ngayNhap) {
    const parts = ngayNhap.trim().split('/');
    if (parts.length === 3) {
      const dd = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      const yy = parts[2].slice(-2);
      datePart = `${yy}${mm}${dd}`;
    }
  }

  const newId = `TA-${datePart}-${padNum}`;
  // Nếu oldId là dạng TA-XXX thì lưu ánh xạ
  if (oldId && /^TA-\d{3}$/.test(oldId)) {
    internalIdMap.set(oldId, newId);
  }
});

console.log(`Bảng ánh xạ internalId cũ -> mới: ${internalIdMap.size} mã`);

// 3. Thay thế toàn bộ internalId cũ trong nội dung file (cả trong SERIAL_DB và VOUCHERS_DB)
internalIdMap.forEach((newId, oldId) => {
  const regex = new RegExp(`"internalId":\\s*"${oldId}"`, 'g');
  const matches = (content.match(regex) || []).length;
  content = content.replace(regex, `"internalId": "${newId}"`);
  console.log(`  ${oldId} -> ${newId} (${matches} vị trí)`);
});

// 4. Bổ sung cơ chế Auto-Migration cho LocalStorage khi mở trình duyệt:
// Nếu localStorage chứa các mã cũ, tự động migrate lên định dạng 6 chữ số
fs.writeFileSync('src_demo/05_mock_data.js', content, 'utf8');
console.log('\nĐã ghi thành công src_demo/05_mock_data.js!');
