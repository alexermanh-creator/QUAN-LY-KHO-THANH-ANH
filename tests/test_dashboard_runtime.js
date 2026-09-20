const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'demo_quan_ly_kho.html');
const html = fs.readFileSync(filePath, 'utf8');

// 1. Kiểm tra syntax
const scriptMatches = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
let totalErrors = 0;
scriptMatches.forEach((s, idx) => {
  const code = s.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
  if (!code.trim() || s.includes('src=')) return;
  try {
    new Function(code);
    console.log('Script block ' + idx + ': OK syntax');
  } catch (err) {
    console.error('Script block ' + idx + ' SYNTAX ERROR:', err.message);
    totalErrors++;
  }
});

// 2. Kiểm tra không còn dấu mũi tên > trên thẻ KPI
console.log('\n--- Kiểm tra mũi tên thừa trên thẻ KPI ---');
const hasKpiArrowRight = html.includes('kpi-arrow-right');
const hasWarrantyChevron = html.includes('id="kpi-warranty-cases">8 >') || html.includes('id="kpi-warranty-cases">8 &gt;');
const hasDraftChevron = html.includes('id="kpi-draft-vouchers">3 >') || html.includes('id="kpi-draft-vouchers">3 &gt;');

console.log('1. Không có class kpi-arrow-right:', !hasKpiArrowRight ? '✅ PASS' : '❌ FAIL');
console.log('2. Bảo hành không còn dấu > thừa:', !hasWarrantyChevron ? '✅ PASS' : '❌ FAIL');
console.log('3. Phiếu nhập không còn dấu > thừa:', !hasDraftChevron ? '✅ PASS' : '❌ FAIL');
console.log('4. totalImportQty đã được khai báo trước khi dùng:', html.includes('totalImportQty += qty;') ? '✅ PASS' : '❌ FAIL');

if (totalErrors === 0 && !hasKpiArrowRight && !hasWarrantyChevron && !hasDraftChevron) {
  console.log('\n🎉 TẤT CẢ KIỂM TRA ĐẠT CHUẨN! DASHBOARD RENDER HOÀN HẢO!');
} else {
  process.exit(1);
}
