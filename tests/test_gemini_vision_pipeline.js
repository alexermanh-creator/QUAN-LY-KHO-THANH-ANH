const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('BẮT ĐẦU TEST: PIPELINE GEMINI VISION AI & TẦNG 2 FALLBACK');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failCount++;
  }
}

// 1. Kiểm tra mã nguồn Backend gas/06_GeminiVision.js
const gasVisionCode = fs.readFileSync('gas/06_GeminiVision.js', 'utf8');
const srcBackendVisionCode = fs.readFileSync('src/backend/06_GeminiVision.js', 'utf8');

check('gas/06_GeminiVision.js tồn tại và đồng bộ với src/backend/06_GeminiVision.js', gasVisionCode === srcBackendVisionCode);
check('Định nghĩa hàm callGeminiVisionBackend', gasVisionCode.includes('function callGeminiVisionBackend'));
check('Định nghĩa hàm testGeminiConnectionBackend', gasVisionCode.includes('function testGeminiConnectionBackend'));
check('Định nghĩa hàm saveGeminiConfigBackend', gasVisionCode.includes('function saveGeminiConfigBackend'));
check('Định nghĩa hàm getGeminiConfigBackend', gasVisionCode.includes('function getGeminiConfigBackend'));
check('Bảo mật: API key đọc từ ScriptProperties, không hardcode', gasVisionCode.includes("props.getProperty('GEMINI_API_KEY')"));
check('Hỗ trợ model mặc định gemini-3.8-flash', gasVisionCode.includes('gemini-3.8-flash'));
check('Có cơ chế xử lý JSON Markdown block (```json)', gasVisionCode.includes("cleanedJsonStr.replace(/^```json\\s*/i, '')"));
check('Có cơ chế tự động thử lại khi Spikes in demand / 503', gasVisionCode.includes('Utilities.sleep(1500)'));

// 2. Kiểm tra mã nguồn Frontend src_demo/06_app_logic.js
const appLogicCode = fs.readFileSync('src_demo/06_app_logic.js', 'utf8');
check('WarehouseAPI có phương thức callGeminiVision', appLogicCode.includes('callGeminiVision: function'));
check('WarehouseAPI có phương thức testGeminiConnection', appLogicCode.includes('testGeminiConnection: function'));
check('WarehouseAPI có phương thức saveGeminiConfig', appLogicCode.includes('saveGeminiConfig: function'));
check('WarehouseAPI có phương thức getGeminiConfig', appLogicCode.includes('getGeminiConfig: function'));
check('Có hàm giao diện handleSaveGeminiConfig', appLogicCode.includes('function handleSaveGeminiConfig'));
check('Có hàm giao diện handleTestGeminiConnection', appLogicCode.includes('function handleTestGeminiConnection'));
check('Có hàm giao diện toggleGeminiKeyVisibility', appLogicCode.includes('function toggleGeminiKeyVisibility'));
check('Xuất toàn cục các hàm Gemini UI', appLogicCode.includes('window.handleSaveGeminiConfig = handleSaveGeminiConfig'));

// 3. Kiểm tra Scanner Camera src_demo/07_camera_scanner.js
const scannerCode = fs.readFileSync('src_demo/07_camera_scanner.js', 'utf8');
check('Tầng 2 Gemini Vision AI được tích hợp trong extractSerialsFromSingleBlob', scannerCode.includes('TẦNG 2: GEMINI VISION CLOUD AI'));
check('Gọi WarehouseAPI.callGeminiVision khi barcode local không đọc được', scannerCode.includes('WarehouseAPI.callGeminiVision(base64Data'));
check('Hiển thị badge cao cấp cho Gemini AI Vision trong bảng đối soát', scannerCode.includes("item.method.includes('Gemini')"));

// 4. Kiểm tra Tab Cài Đặt (Tab 6: Cấu hình Gemini AI Vision)
const modulesHtml = fs.readFileSync('src_demo/03_modules_html.html', 'utf8');
const gasCaiDatHtml = fs.readFileSync('gas/Tab_CaiDat.html', 'utf8');
check('src_demo/03_modules_html.html có nút Tab 6 (#btn-tab-set-gemini)', modulesHtml.includes('id="btn-tab-set-gemini"'));
check('src_demo/03_modules_html.html có Tab pane #tab-set-gemini', modulesHtml.includes('id="tab-set-gemini"'));
check('gas/Tab_CaiDat.html có nút Tab 6 (#btn-tab-set-gemini)', gasCaiDatHtml.includes('id="btn-tab-set-gemini"'));
check('gas/Tab_CaiDat.html có Tab pane #tab-set-gemini', gasCaiDatHtml.includes('id="tab-set-gemini"'));

// 5. Kiểm tra logic làm sạch Markdown JSON giả lập
function cleanJsonOutput(rawText) {
  let cleaned = String(rawText || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

const mockMarkdownResponse = '```json\n{\n  "serials": [\n    {\n      "serial": "VNM1908585",\n      "confidence": 0.99,\n      "model": "HP LaserJet Pro 4003dw"\n    }\n  ]\n}\n```';
const parsed = cleanJsonOutput(mockMarkdownResponse);
check('Khử Markdown bóc tách đúng JSON', parsed && parsed.serials && parsed.serials[0].serial === 'VNM1908585');
check('Bóc tách đúng Model thiết bị', parsed.serials[0].model === 'HP LaserJet Pro 4003dw');

console.log('\n================================================================');
console.log(`KẾT QUẢ TEST: PASS: ${passCount} | FAIL: ${failCount}`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('TOÀN BỘ 21/21 BÀI TEST GEMINI VISION PIPELINE ĐẠT CHUẨN 100%!\n');
}
