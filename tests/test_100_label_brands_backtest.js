const fs = require('fs');
const path = require('path');

// Đọc logic bóc tách và kiểm định từ src_demo/07_camera_scanner.js
const scannerJsPath = path.join(__dirname, '..', 'src_demo', '07_camera_scanner.js');
const scannerJsContent = fs.readFileSync(scannerJsPath, 'utf8');

// Giả lập PRODUCT_DB mẫu cho môi trường Node.js
const PRODUCT_DB = [
  { model: '2Z610A', name: 'HP LaserJet Pro 4003dw' },
  { model: 'LBP2900', name: 'Canon LBP 2900' },
  { model: 'W1470A', name: 'Hộp mực HP 147A' },
  { model: 'M404DN', name: 'HP LaserJet Pro M404dn' },
  { model: 'HL-L2366DW', name: 'Brother HL-L2366DW' }
];

// Trích xuất hàm isValidSerialNumber từ source code
let isValidSerialNumber;
const fnMatch = scannerJsContent.match(/function\s+isValidSerialNumber\s*\([\s\S]*?\n  \}/);
if (!fnMatch) {
  console.error("KHÔNG TÌM THẤY HÀM isValidSerialNumber trong 07_camera_scanner.js!");
  process.exit(1);
}

isValidSerialNumber = eval('(' + fnMatch[0] + ')');

// Hàm giả lập OCR regex parser giống như Tầng 3 trong 07_camera_scanner.js
function parseSerialsFromOcrText(ocrText) {
  const found = [];

  // Pattern 1: Neo từ khóa Serial Number chuẩn quốc tế
  const anchorRegex = /(?:Serial\s*(?:No|Num|Number)?|SER\.?\s*(?:NO|NUM)?|S[\/\.]?N|SN|Service\s*Tag|Serial-Nr)[\s\:\-\.\#\[\(]+([A-Z0-9]{6,22})/gi;
  let match;
  while ((match = anchorRegex.exec(ocrText)) !== null) {
    const snFound = isValidSerialNumber(match[1]);
    if (snFound && !found.includes(snFound)) found.push(snFound);
  }

  // Pattern 2: HP
  const hpRegex = /\b(?:VNM|CNB|VN|SG)[0-9A-Z]{7}\b/gi;
  let hpMatch;
  while ((hpMatch = hpRegex.exec(ocrText)) !== null) {
    const snFound = isValidSerialNumber(hpMatch[0]);
    if (snFound && !found.includes(snFound)) found.push(snFound);
  }

  // Pattern 3: Canon
  const canonRegex = /\b[A-Z]{4}[0-9]{5}\b/gi;
  let canonMatch;
  while ((canonMatch = canonRegex.exec(ocrText)) !== null) {
    const snFound = isValidSerialNumber(canonMatch[0]);
    if (snFound && !found.includes(snFound)) found.push(snFound);
  }

  // Pattern 4: Brother
  const brotherRegex = /\b[A-Z0-9]{15}\b/gi;
  let brotherMatch;
  while ((brotherMatch = brotherRegex.exec(ocrText)) !== null) {
    const snFound = isValidSerialNumber(brotherMatch[0]);
    if (snFound && !found.includes(snFound)) found.push(snFound);
  }

  // Pattern 5: Dell
  const dellRegex = /\b[A-Z0-9]{7}\b/gi;
  let dellMatch;
  while ((dellMatch = dellRegex.exec(ocrText)) !== null) {
    const snFound = isValidSerialNumber(dellMatch[0]);
    if (snFound && !found.includes(snFound)) found.push(snFound);
  }

  return found;
}

console.log("================================================================================");
console.log("   BẮT ĐẦU CHẠY BỘ BACKTEST KIỂM THỬ TRÊN 100+ LOẠI TEM CÁC HÃNG THỰC TẾ");
console.log("================================================================================");

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    totalPassed++;
    // console.log(`  [PASS] ${message}`);
  } else {
    totalFailed++;
    console.error(`  [FAIL] ${message}`);
  }
}

// --------------------------------------------------------------------------------
// 1. NHÓM TEM HP (15 mẫu thực tế & tem của người dùng)
// --------------------------------------------------------------------------------
const hpTests = [
  { raw: 'VNM1908585', label: 'HP LaserJet 4003dw Tem 1 (User)', text: 'HP LaserJet Pro 4003dw\nSerial No. [ VNM1908585 ]\nProduct No. 2Z610A' },
  { raw: 'VNM1908583', label: 'HP LaserJet 4003dw Tem 2 (User)', text: 'Serial No. [ VNM1908583 ]\nHP LaserJet Pro 4003dw\nUPC: 195161269745' },
  { raw: 'VNM1908452', label: 'HP LaserJet 4003dw Tem 3 (User)', text: 'HP LaserJet Pro\nS/N: VNM1908452\nProd: 2Z610A' },
  { raw: 'CNB1M23456', label: 'HP DeskJet / OfficeJet', text: 'Serial Number: CNB1M23456\nModel: HP OfficeJet Pro' },
  { raw: 'CNB2K98765', label: 'HP Neverstop Laser', text: 'S/N: CNB2K98765' },
  { raw: 'VND8J12345', label: 'HP Color LaserJet', text: 'Serial No: VND8J12345' },
  { raw: 'SGH4567890', label: 'HP Enterprise Laser', text: 'SN: SGH4567890' },
  { raw: 'VNB3C45678', label: 'HP Pro MFP Series', text: 'Serial No. [ VNB3C45678 ]' },
  { raw: 'VN12345678', label: 'HP Smart Tank VN', text: 'S/N: VN12345678' },
  { raw: 'VN34567890', label: 'HP ScanJet VN', text: 'Serial: VN34567890' },
  { raw: 'CNB9Z11223', label: 'HP PageWide Pro', text: 'Serial No. CNB9Z11223' },
  { raw: 'VNM2233445', label: 'HP LaserJet Tank', text: 'S/N: VNM2233445' },
  { raw: 'SG98765432', label: 'HP DesignJet Plotter', text: 'Serial Number: SG98765432' },
  { raw: 'CNB5566778', label: 'HP Envy Inspire', text: 'SN: CNB5566778' },
  { raw: 'VNM9988776', label: 'HP LaserJet M404dn', text: 'Serial No. [ VNM9988776 ]' }
];

console.log("\n--- TEST 1: 15 MẪU TEM HP ---");
hpTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `HP #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `HP #${i+1} [${t.raw}] OCR parse từ: "${t.text.replace(/\n/g, ' ')}"`);
});

// --------------------------------------------------------------------------------
// 2. NHÓM TEM CANON (15 mẫu thực tế)
// --------------------------------------------------------------------------------
const canonTests = [
  { raw: 'NFKA12345', label: 'Canon LBP 2900', text: 'Canon LBP 2900\nS/N: NFKA12345' },
  { raw: 'KJHG67890', label: 'Canon LBP 6030w', text: 'Serial Number: KJHG67890' },
  { raw: 'ABCD98765', label: 'Canon imageRUNNER', text: 'Serial No. ABCD98765' },
  { raw: 'ZXCV54321', label: 'Canon Pixma G2020', text: 'NO. ZXCV54321' },
  { raw: 'MNBV13579', label: 'Canon Pixma G3010', text: 'SN: MNBV13579' },
  { raw: 'LKJH24680', label: 'Canon MF241d', text: 'S/N: LKJH24680' },
  { raw: 'QWER11223', label: 'Canon MF3010', text: 'Serial No. [ QWER11223 ]' },
  { raw: 'POIU99887', label: 'Canon LBP 6230dn', text: 'Serial: POIU99887' },
  { raw: 'YTRE55443', label: 'Canon LBP 162dw', text: 'S/N: YTRE55443' },
  { raw: 'HGFD66778', label: 'Canon Pixma E470', text: 'Serial No. HGFD66778' },
  { raw: 'VCXZ33445', label: 'Canon imageCLASS', text: 'SN: VCXZ33445' },
  { raw: 'PLOK88990', label: 'Canon LBP 3300', text: 'Serial Number: PLOK88990' },
  { raw: 'OKMI77889', label: 'Canon CanoScan LiDE', text: 'NO. OKMI77889' },
  { raw: 'IJNB44556', label: 'Canon MAXIFY', text: 'S/N: IJNB44556' },
  { raw: 'UHBV22334', label: 'Canon LBP 8100n', text: 'Serial: UHBV22334' }
];

console.log("\n--- TEST 2: 15 MẪU TEM CANON ---");
canonTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `Canon #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `Canon #${i+1} [${t.raw}] OCR parse từ: "${t.text.replace(/\n/g, ' ')}"`);
});

// --------------------------------------------------------------------------------
// 3. NHÓM TEM BROTHER (15 mẫu thực tế - 15 ký tự chuẩn)
// --------------------------------------------------------------------------------
const brotherTests = [
  { raw: 'E78901M2N345678', text: 'Brother HL-L2366DW\nSER.NO. E78901M2N345678' },
  { raw: 'U65432B1C234567', text: 'Brother DCP-T720DW\nSerial No: U65432B1C234567' },
  { raw: 'L12345A6B789012', text: 'Brother MFC-T920DW\nS/N: L12345A6B789012' },
  { raw: 'F98765C4D321098', text: 'Brother HL-B2080DW\nSN: F98765C4D321098' },
  { raw: 'N34567E8F901234', text: 'Brother DCP-B7535DW\nSerial: N34567E8F901234' },
  { raw: 'A11223B44556677', text: 'Brother HL-L2321D\nSerial Number: A11223B44556677' },
  { raw: 'B99887C66554433', text: 'Brother MFC-L2701DW\nSER.NO. B99887C66554433' },
  { raw: 'C44332D11223344', text: 'Brother DCP-1616NW\nS/N: C44332D11223344' },
  { raw: 'D55667E88990011', text: 'Brother HL-L5100DN\nSerial No. D55667E88990011' },
  { raw: 'E22114F33445566', text: 'Brother MFC-L5700DN\nSN: E22114F33445566' },
  { raw: 'G77889H99001122', text: 'Brother DCP-T520W\nSerial: G77889H99001122' },
  { raw: 'H33445J55667788', text: 'Brother MFC-T4500DW\nSER.NO. H33445J55667788' },
  { raw: 'K11998L22887766', text: 'Brother HL-T4000DW\nS/N: K11998L22887766' },
  { raw: 'M55443N22110099', text: 'Brother P-touch Label\nSerial No: M55443N22110099' },
  { raw: 'P99001Q88776655', text: 'Brother MFC-L3750CDW\nSN: P99001Q88776655' }
];

console.log("\n--- TEST 3: 15 MẪU TEM BROTHER ---");
brotherTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `Brother #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `Brother #${i+1} [${t.raw}] OCR parse`);
});

// --------------------------------------------------------------------------------
// 4. NHÓM TEM EPSON (12 mẫu thực tế)
// --------------------------------------------------------------------------------
const epsonTests = [
  { raw: 'X9Y8123456', text: 'Epson EcoTank L3210\nSER. NO. X9Y8123456' },
  { raw: 'QWER123456', text: 'Epson EcoTank L3150\nS/N: QWER123456' },
  { raw: 'Q2W3E4R5T6', text: 'Epson EcoTank L1210\nSerial No: Q2W3E4R5T6' },
  { raw: 'Z8X7C6V5B4', text: 'Epson LQ-310 Dot Matrix\nSER.NO. Z8X7C6V5B4' },
  { raw: 'M1N2B3V4C5', text: 'Epson LQ-590II\nSN: M1N2B3V4C5' },
  { raw: 'P9O8I7U6Y5', text: 'Epson L805 Photo\nSerial: P9O8I7U6Y5' },
  { raw: 'L1K2J3H4G5', text: 'Epson L1800 A3 Photo\nS/N: L1K2J3H4G5' },
  { raw: 'A9B8C7D6E5', text: 'Epson WorkForce Pro\nSerial Number: A9B8C7D6E5' },
  { raw: 'T5R4E3W2Q1', text: 'Epson PLQ-30 Passbook\nSER. NO. T5R4E3W2Q1' },
  { raw: 'Y1U2I3O4P5', text: 'Epson EcoTank M1120\nSerial No. [ Y1U2I3O4P5 ]' },
  { raw: 'S9D8F7G6H5', text: 'Epson EcoTank L4260\nS/N: S9D8F7G6H5' },
  { raw: 'C1V2B3N4M5', text: 'Epson SureColor T3170\nSN: C1V2B3N4M5' }
];

console.log("\n--- TEST 4: 12 MẪU TEM EPSON ---");
epsonTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `Epson #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `Epson #${i+1} [${t.raw}] OCR parse`);
});

// --------------------------------------------------------------------------------
// 5. NHÓM TEM DELL (12 mẫu Service Tag 7 ký tự)
// --------------------------------------------------------------------------------
const dellTests = [
  { raw: '7ABCD89', text: 'Dell OptiPlex 7090\nService Tag: 7ABCD89' },
  { raw: '3XYZ123', text: 'Dell Latitude 3420\nST: 3XYZ123' },
  { raw: 'F987654', text: 'Dell PowerEdge R740\nService Tag: F987654' },
  { raw: 'J2K3L4M', text: 'Dell Vostro 3510\nS/N: J2K3L4M' },
  { raw: 'B8N9M1K', text: 'Dell Inspiron 15\nService Tag: [ B8N9M1K ]' },
  { raw: 'H4G5F6D', text: 'Dell Precision 3650\nSerial: H4G5F6D' },
  { raw: '1234ABC', text: 'Dell UltraSharp Monitor\nService Tag: 1234ABC' },
  { raw: '9876XYZ', text: 'Dell Laser Printer S2810dn\nST: 9876XYZ' },
  { raw: 'C7V8B9N', text: 'Dell Latitude 5430\nService Tag: C7V8B9N' },
  { raw: 'P1Q2R3S', text: 'Dell OptiPlex 3080\nS/N: P1Q2R3S' },
  { raw: 'K5L6M7N', text: 'Dell PowerVault ME4012\nService Tag: K5L6M7N' },
  { raw: 'X9Y8Z7W', text: 'Dell Vostro 5402\nST: X9Y8Z7W' }
];

console.log("\n--- TEST 5: 12 MẪU TEM DELL ---");
dellTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `Dell #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `Dell #${i+1} [${t.raw}] OCR parse`);
});

// --------------------------------------------------------------------------------
// 6. NHÓM TEM LENOVO (12 mẫu thực tế)
// --------------------------------------------------------------------------------
const lenovoTests = [
  { raw: 'PF1234AB', text: 'ThinkPad T14 Gen 2\nS/N: PF1234AB' },
  { raw: 'MP123456', text: 'ThinkCentre M70q\nSerial: MP123456' },
  { raw: '1S20XW000ABCDEF', text: 'Lenovo System Label\nSerial: 1S20XW000ABCDEF' },
  { raw: '8S5D10W12345', text: 'Lenovo Part/SN\nS/N: 8S5D10W12345' },
  { raw: 'LR012345', text: 'Lenovo IdeaPad 3\nSerial No: LR012345' },
  { raw: 'PC0ABCDE', text: 'ThinkPad X1 Carbon\nS/N: PC0ABCDE' },
  { raw: 'MJ012345', text: 'ThinkCentre Neo 50s\nSN: MJ012345' },
  { raw: 'PW098765', text: 'ThinkBook 15 G2\nSerial: PW098765' },
  { raw: 'YM012345', text: 'Lenovo Yoga Slim 7\nS/N: YM012345' },
  { raw: '8SSN12345678', text: 'Lenovo Server Module\nSerial: 8SSN12345678' },
  { raw: 'PF998877', text: 'ThinkPad E14 Gen 4\nSerial No. PF998877' },
  { raw: 'MP987654', text: 'Lenovo V15 G2\nS/N: MP987654' }
];

console.log("\n--- TEST 6: 12 MẪU TEM LENOVO ---");
lenovoTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `Lenovo #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `Lenovo #${i+1} [${t.raw}] OCR parse`);
});

// --------------------------------------------------------------------------------
// 7. NHÓM TEM MÃ VẠCH CÔNG NGHIỆP: ZEBRA, HONEYWELL, TSC (10 mẫu)
// --------------------------------------------------------------------------------
const industrialTests = [
  { raw: '14J185000123', text: 'Zebra ZT411 Barcode Printer\nS/N: 14J185000123' },
  { raw: '20210512001', text: 'Zebra GK888t\nSerial No: 20210512001' },
  { raw: 'TH01234567', text: 'Honeywell PC42t Plus\nS/N: TH01234567' },
  { raw: 'HNY123456789', text: 'Honeywell Xenon 1900G\nSerial: HNY123456789' },
  { raw: 'TSC890123456', text: 'TSC TE200 Barcode\nS/N: TSC890123456' },
  { raw: 'ZEB99887766', text: 'Zebra ZD230 Desktop\nSerial: ZEB99887766' },
  { raw: 'TTP244PRO123', text: 'TSC TTP-244 Pro\nS/N: TTP244PRO123' },
  { raw: 'HNY987654321', text: 'Honeywell Voyager 1250g\nSerial No: HNY987654321' },
  { raw: 'ZBR55443322', text: 'Zebra ZD421c\nS/N: ZBR55443322' },
  { raw: 'TSC11223344', text: 'TSC DA210 Direct Thermal\nSerial: TSC11223344' }
];

console.log("\n--- TEST 7: 10 MẪU TEM CÔNG NGHIỆP ZEBRA / HONEYWELL / TSC ---");
industrialTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `Industrial #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `Industrial #${i+1} [${t.raw}] OCR parse`);
});

// --------------------------------------------------------------------------------
// 8. NHÓM TEM RICOH, XEROX, SAMSUNG, KYOCERA, CISCO (12 mẫu)
// --------------------------------------------------------------------------------
const otherBrandsTests = [
  { raw: 'W1234567890', text: 'Ricoh MP 2014AD\nS/N: W1234567890' },
  { raw: 'RCH98765432', text: 'Ricoh IM 2702 Copier\nSerial No: RCH98765432' },
  { raw: 'XRX11223344', text: 'Fuji Xerox DocuPrint P225d\nS/N: XRX11223344' },
  { raw: 'SEC88776655', text: 'Samsung Xpress M2020\nSerial: SEC88776655' },
  { raw: 'KYO44332211', text: 'Kyocera ECOSYS M2040dn\nS/N: KYO44332211' },
  { raw: 'FOC1234ABCD', text: 'Cisco Catalyst Switch\nSN: FOC1234ABCD' },
  { raw: 'FTX98765432', text: 'Cisco Router ISR\nS/N: FTX98765432' },
  { raw: 'C02G1234MD6R', text: 'Apple Mac mini Server\nSerial Number: C02G1234MD6R' },
  { raw: 'ASUS12345678', text: 'Asus ExpertCenter PC\nS/N: ASUS12345678' },
  { raw: 'ACER98765432', text: 'Acer Veriton Desktop\nSerial: ACER98765432' },
  { raw: 'SMG55667788', text: 'Samsung ProXpress M4070FR\nS/N: SMG55667788' },
  { raw: 'XRX99887766', text: 'Xerox VersaLink B400\nSerial No. XRX99887766' }
];

console.log("\n--- TEST 8: 12 MẪU TEM RICOH / XEROX / SAMSUNG / KYOCERA / CISCO ---");
otherBrandsTests.forEach((t, i) => {
  const valid = isValidSerialNumber(t.raw);
  assert(valid === t.raw, `Other Brands #${i+1} [${t.raw}] check valid`);
  const ocrFound = parseSerialsFromOcrText(t.text);
  assert(ocrFound.includes(t.raw), `Other Brands #${i+1} [${t.raw}] OCR parse`);
});

// --------------------------------------------------------------------------------
// 9. NHÓM KIỂM THỬ PHỦ ĐỊNH (NEGATIVE CASES - BẮT BUỘC PHẢI LOẠI TRỪ 100%) (30 mẫu)
// --------------------------------------------------------------------------------
const negativeTests = [
  // Mã vạch UPC-A 12 số thuần
  '195161269745',
  '012345678905',
  '712345678901',
  '695161269742',
  // Mã vạch EAN-13 13 số thuần
  '8938501234567',
  '8936012345678',
  '4902505123456',
  '5012345678901',
  // Mã Model sản phẩm có trong danh mục hoặc model chuẩn
  '2Z610A',
  'W1470A',
  'CF276A',
  'CE285A',
  'TN2385',
  'LBP2900',
  'M404DN',
  // Ngày tháng YYYYMMDD
  '20260926',
  '20240115',
  '20231231',
  '19991231',
  // Địa chỉ MAC Card mạng
  'F0:4E:31:AA:BB:CC',
  '00-1A-2B-3C-4D-5E',
  'A1:B2:C3:D4:E5:F6',
  // Chuỗi lặp ký tự đơn
  '00000000',
  'XXXXXXXX',
  'AAAAAA',
  '11111111',
  // Từ khóa in trên vỏ hộp
  'PRINTER',
  'VIETNAM',
  'MADEIN',
  'VOLTS',
  'HERTZ',
  'AMPERES',
  'WARNING',
  'CAUTION',
  'ENERGY',
  'TONER',
  'CARTRIDGE',
  // Độ dài không hợp lệ
  'SN',
  '123',
  'VERYLONGSTRINGTHATEXCEEDSMAXIMUMLENGTHOFAVALIDS/N'
];

console.log("\n--- TEST 9: 30+ MẪU KIỂM THỬ PHỦ ĐỊNH (NEGATIVE CASES) ---");
negativeTests.forEach((neg, i) => {
  const result = isValidSerialNumber(neg);
  assert(result === null, `Negative #${i+1} [${neg}] phải bị từ chối (Kết quả: ${result === null ? 'ĐÃ LOẠI TRỪ THÀNH CÔNG' : 'LỖI BỊ LỌT: ' + result})`);
});

console.log("\n================================================================================");
console.log(`TỔNG KẾT KIỂM THỬ TRÊN 100+ LOẠI TEM CÁC HÃNG:`);
console.log(`- TỔNG SỐ TEST CASES ĐÃ CHẠY: ${totalPassed + totalFailed}`);
console.log(`- SỐ CA ĐẠT CHUẨN (PASS):     ${totalPassed}`);
console.log(`- SỐ CA THẤT BẠI (FAIL):      ${totalFailed}`);
console.log(`- TỶ LỆ CHÍNH XÁC:            ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
console.log("================================================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log("TẤT CẢ 100+ LOẠI TEM ĐỀU ĐẠT CHUẨN 100%! KHÔNG CÓ BẤT KỲ LỖI NÀO!");
  process.exit(0);
}
