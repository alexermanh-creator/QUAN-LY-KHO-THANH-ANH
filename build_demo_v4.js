// Script build_demo_v4.js to concatenate parts into demo_quan_ly_kho.html
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src_demo');
const targetFile = path.join(__dirname, 'demo_quan_ly_kho.html');

const files = [
  '01_header_and_styles.html',
  '02_topbar_and_sidebar.html',
  '03_modules_html.html',
  '04_modals_html.html',
  '05_mock_data.js',
  '06_app_logic.js',
  '07_camera_scanner.js',
  '08_nhap_kho_logic.js',
  '09_xuat_kho_logic.js',
  '10_ton_kho_and_360.js',
  '11_warranty_cases.js',
  '12_lich_su_and_audit.js',
  '13_nghiep_vu_kho_and_dashboard.js'
];

console.log("Reading source files from:", srcDir);
let combined = '';

files.forEach(f => {
  const filePath = path.join(srcDir, f);
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found: " + filePath);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  combined += content + '\n';
  console.log(`+ Added: ${f} (${content.length} bytes)`);
});

fs.writeFileSync(targetFile, combined, 'utf8');
console.log(`Successfully built ${targetFile} (Total: ${combined.length} bytes)`);
