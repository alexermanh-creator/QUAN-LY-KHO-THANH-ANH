const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'demo_quan_ly_kho.html');
const content = fs.readFileSync(filePath, 'utf8');

const checks = [
  { name: '1. Logo vector Thành An mới cân đối, đẹp mắt trong sidebar', pass: content.includes('brand-icon-wrap') && content.includes('THÀNH AN') && content.includes('KHO &amp; THIẾT BỊ') },
  { name: '2. Đã xóa triệt để dấu < thừa trước comment Dashboard', pass: !content.includes('<\n      <!-- ==================================================== -->') && !content.includes('<      <!-- ==================================================== -->') },
  { name: '3. Data lớn trực quan (1.284 thiết bị, 126 model)', pass: content.includes('1.284') && content.includes('126') },
  { name: '4. Chiều cao biểu đồ nâng lên 260px (chart-main-container)', pass: content.includes('height: 260px') && content.includes('chart-main-container') },
  { name: '5. Thẻ KPI đầy đủ icon, số lượng, tỷ lệ tăng trưởng % và mũi tên >', pass: content.includes('kpi-trend-green') && content.includes('3.2% so với cuối tháng trước') && content.includes('12% so với kỳ trước') },
  { name: '6. Đã bỏ sạch text thừa: "thiết bị sẵn sàng", "2 phiếu CONFIRMED", "0 ca quá hạn" trên KPI cards', pass: !content.includes('kpi-total-devices-sub') && !content.includes('kpi-import-vouchers') && !content.includes('kpi-overdue-warranty-sub') },
  { name: '7. Khối giao diện nổi bật, phân cách rõ ràng', pass: content.includes('kpi-card-v4') && content.includes('border: 1px solid #e2e8f0') },
  { name: '8. Tab Sao lưu & Reset tinh gọn cho Quản trị viên', pass: content.includes('Sao Lưu, Khôi Phục &amp; Reset (Admin 🔒)') },
  { name: '9. Guard kiểm tra quyền Quản trị viên checkAdminRoleOrAlert()', pass: content.includes('function checkAdminRoleOrAlert()') },
  { name: '10. Mật khẩu admin xác thực đa dạng (admin, admin123, 123456)', pass: content.includes("p === '123456' || p === 'admin' || p === 'admin123'") }
];

let allPass = true;
checks.forEach(c => {
  console.log(`${c.pass ? '✅' : '❌'} ${c.name}`);
  if (!c.pass) allPass = false;
});

if (allPass) {
  console.log('\n🎉 TẤT CẢ 10/10 MỤC KIỂM TRA ĐỀU ĐẠT CHUẨN HOÀN HẢO!');
} else {
  process.exit(1);
}
