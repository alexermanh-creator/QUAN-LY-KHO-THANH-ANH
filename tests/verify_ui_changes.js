const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'demo_quan_ly_kho.html');
const content = fs.readFileSync(filePath, 'utf8');

const checks = [
  { name: '1. Không còn logo/chữ Thành An ở topbar', pass: !content.includes('<span class="fw-bold text-dark fs-5">THÀNH AN ERP</span>') },
  { name: '2. Bỏ chữ "(thiết bị)" khỏi dataset label biểu đồ', pass: !content.includes("label: 'Nhập kho (thiết bị)'") && !content.includes("label: 'Xuất kho (thiết bị)'") },
  { name: '3. Plugin vẽ số tồn kho trên từng điểm (data point labels)', pass: content.includes('lineDataLabelsPlugin') && content.includes('ctx.fillText(text, point.x, point.y - 5)') },
  { name: '4. Bảng Hoạt động gần đây có cột Model / Serial', pass: content.includes('Model / Serial') },
  { name: '5. Dữ liệu mẫu chuẩn ảnh 3: Canon LBP6030 / SN123456', pass: content.includes('Canon LBP6030 / SN123456') },
  { name: '6. Dữ liệu mẫu chuẩn ảnh 3: HP Laser 107w', pass: content.includes('HP Laser 107w') },
  { name: '7. Bảng có nút mũi tên > điều hướng nhanh', pass: content.includes('fa-chevron-right') },
  { name: '8. Layout 100vh không bị cuộn ngoài (compact container)', pass: content.includes('max-height: calc(100vh - 54px)') }
];

let allPass = true;
checks.forEach(c => {
  console.log(`${c.pass ? '✅' : '❌'} ${c.name}`);
  if (!c.pass) allPass = false;
});

if (allPass) {
  console.log('\n🎉 TẤT CẢ 8 ĐIỂM KIỂM TRA ĐỀU ĐẠT CHUẨN!');
} else {
  process.exit(1);
}
