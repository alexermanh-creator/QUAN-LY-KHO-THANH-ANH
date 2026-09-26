const fs = require('fs');
const vm = require('vm');

console.log('=== ĐỒNG BỘ INTERNAL_ID CHO VOUCHERS_DB TỪ SERIAL_DB ===');

let content = fs.readFileSync('src_demo/05_mock_data.js', 'utf8');

const sandbox = { window: {}, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
vm.runInContext(content.replace(/<\/?script[^>]*>/gi, ''), sandbox);

const serialDb = sandbox.window.SERIAL_DB || sandbox.SERIAL_DB || [];
console.log(`Số thiết bị trong SERIAL_DB: ${serialDb.length}`);

// Tạo map: serial -> internalId
const serialToInternalIdMap = new Map();
serialDb.forEach(s => {
  if (s.serial && s.internalId) {
    serialToInternalIdMap.set(s.serial.trim().toUpperCase(), s.internalId.trim());
  }
});

console.log(`Số mapping serial -> internalId: ${serialToInternalIdMap.size}`);

// Đọc VOUCHERS_DB từ sandbox
const vouchersDb = sandbox.window.VOUCHERS_DB || sandbox.VOUCHERS_DB || { nhap: [], xuat: [] };
let updatedVoucherItems = 0;

['nhap', 'xuat'].forEach(type => {
  if (Array.isArray(vouchersDb[type])) {
    vouchersDb[type].forEach(voucher => {
      if (Array.isArray(voucher.items)) {
        voucher.items.forEach(it => {
          const sn = String(it.serial || '').trim().toUpperCase();
          if (serialToInternalIdMap.has(sn)) {
            const newInternalId = serialToInternalIdMap.get(sn);
            if (it.internalId !== newInternalId) {
              it.internalId = newInternalId;
              updatedVoucherItems++;
            }
          }
        });
      }
    });
  }
});

console.log(`Số items trong VOUCHERS_DB đã được chuẩn hóa internalId: ${updatedVoucherItems}`);

// Ghi lại VOUCHERS_DB vào file src_demo/05_mock_data.js
const vouchersJson = JSON.stringify(vouchersDb, null, 2);
const vouchersDbRegex = /let VOUCHERS_DB = \{[\s\S]*?\n\s*\}\s*;/;

if (vouchersDbRegex.test(content)) {
  content = content.replace(vouchersDbRegex, `let VOUCHERS_DB = ${vouchersJson};`);
  fs.writeFileSync('src_demo/05_mock_data.js', content, 'utf8');
  console.log('Ghi thành công VOUCHERS_DB vào src_demo/05_mock_data.js!');
} else {
  console.error('Không tìm thấy regex VOUCHERS_DB trong 05_mock_data.js!');
}
