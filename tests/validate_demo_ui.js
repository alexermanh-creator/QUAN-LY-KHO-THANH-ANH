const fs = require('fs');
const path = require('path');

const demoPath = path.join(__dirname, '..', 'demo_quan_ly_kho.html');
const content = fs.readFileSync(demoPath, 'utf8');

// 1. Kiểm tra sự hiện diện của các element UI theo đúng yêu cầu
const requiredElements = [
  { id: 'global-search-input', desc: 'Thanh tìm kiếm viên thuốc (Pill search)' },
  { id: 'roleDropdownBtn', desc: 'Nút QUẢN LÝ (Role Switcher)' },
  { id: 'app-sidebar', desc: 'Thanh Sidebar bên trái' },
  { id: 'kpi-total-stock', desc: 'Thẻ KPI: Tổng tồn hiện tại' },
  { id: 'kpi-models-count', desc: 'Thẻ KPI: Số Model đang tồn' },
  { id: 'kpi-period-import', desc: 'Thẻ KPI: Nhập trong kỳ' },
  { id: 'kpi-period-export', desc: 'Thẻ KPI: Xuất trong kỳ' },
  { id: 'kpi-warranty-cases', desc: 'Thẻ KPI: Bảo hành đang xử lý' },
  { id: 'kpi-draft-vouchers', desc: 'Thẻ KPI: Phiếu nháp / chờ duyệt' },
  { id: 'chart-import-export', desc: 'Biểu đồ Combo: Nhập - Xuất theo thời gian' },
  { id: 'chart-category-stock', desc: 'Biểu đồ Donut: Cơ cấu tồn kho theo nhóm thiết bị' },
  { id: 'chart-stock-aging', desc: 'Biểu đồ Bar: Tuổi tồn kho' },
  { id: 'donut-total-val', desc: 'Chữ số Tổng tồn ở tâm Donut' },
  { id: 'tab-top-stock', desc: 'Tab Top Model: Tồn nhiều' },
  { id: 'tab-top-import', desc: 'Tab Top Model: Nhập nhiều' },
  { id: 'tab-top-export', desc: 'Tab Top Model: Xuất nhiều' },
  { id: 'tab-top-aging', desc: 'Tab Top Model: Tồn lâu' },
  { id: 'top-models-container', desc: 'Container Top Model kèm progress bar' },
  { id: 'recent-activities-tbody', desc: 'Bảng Hoạt động gần đây' }
];

console.log('--- 1. KIỂM TRA CÁC PHẦN TỬ UI TRÊN DEMO HTML ---');
let allPassed = true;
requiredElements.forEach(item => {
  const hasId = content.includes('id="' + item.id + '"') || content.includes("id='" + item.id + "'");
  if (hasId) {
    console.log(`[PASS] ${item.desc} (id: ${item.id})`);
  } else {
    console.error(`[FAIL] Thiếu phần tử: ${item.desc} (id: ${item.id})`);
    allPassed = false;
  }
});

// 2. Kiểm tra Logo Thành An vector trong Sidebar
console.log('\n--- 2. KIỂM TRA LOGO THÀNH AN TRONG SIDEBAR ---');
if (content.includes('sidebar-brand-header') && content.includes('THÀNH AN') && content.includes('KHO &amp; THIẾT BỊ')) {
  console.log('[PASS] Logo vector Thành An đã được tích hợp chuẩn xác ở đầu Sidebar!');
} else {
  console.error('[FAIL] Chưa tìm thấy logo Thành An ở đầu Sidebar');
  allPassed = false;
}

// 3. Kiểm tra 3 nút thao tác trên Topbar (QUẢN LÝ, Quét SN, Kho Mobile)
console.log('\n--- 3. KIỂM TRA 3 NÚT THAO TÁC TOPBAR ---');
const hasQuanLy = content.includes('QUẢN LÝ') && content.includes('btn-topbar-role');
const hasQuetSN = content.includes('Quét SN') && content.includes('btn-topbar-scan');
const hasKhoMobile = content.includes('Kho Mobile') && content.includes('btn-topbar-mobile');
console.log(`- Nút QUẢN LÝ: ${hasQuanLy ? '[PASS]' : '[FAIL]'}`);
console.log(`- Nút Quét SN: ${hasQuetSN ? '[PASS]' : '[FAIL]'}`);
console.log(`- Nút Kho Mobile: ${hasKhoMobile ? '[PASS]' : '[FAIL]'}`);
if (!hasQuanLy || !hasQuetSN || !hasKhoMobile) allPassed = false;

// 4. Kiểm tra cú pháp JavaScript
console.log('\n--- 4. KIỂM TRA CÚ PHÁP JAVASCRIPT ---');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let jsErrors = 0;
while ((match = scriptRegex.exec(content)) !== null) {
  count++;
  try {
    new Function(match[1]);
  } catch (err) {
    console.error(`[FAIL] Lỗi cú pháp trong script block #${count}:`, err.message);
    jsErrors++;
  }
}
if (jsErrors === 0) {
  console.log(`[PASS] Đã kiểm tra ${count} khối mã JavaScript. 0 lỗi cú pháp!`);
} else {
  allPassed = false;
}

console.log('\n========================================');
if (allPassed) {
  console.log('>>> TẤT CẢ KIỂM TRA THÀNH CÔNG 100%! GIAO DIỆN DEMO SẴN SÀNG <<<');
} else {
  console.error('>>> CÒN MỤC CHƯA ĐẠT YÊU CẦU <<<');
  process.exit(1);
}
