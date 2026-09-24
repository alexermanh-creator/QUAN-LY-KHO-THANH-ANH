/**
 * ============================================================================
 * KIỂM TOÁN LỖ HỔNG ĐỒNG BỘ MÃ NGUỒN THỰC TẾ (CODEBASE SYNC FLAW AUDITOR)
 * SYSTEM ARCHITECT BACKTEST ON ACTUAL CODE FILES
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const srcDemoDir = path.join(__dirname, '../src_demo');
const gasDir = path.join(__dirname, '../gas');

const modalsHtml = fs.readFileSync(path.join(srcDemoDir, '04_modals_html.html'), 'utf8');
const historyJs = fs.readFileSync(path.join(srcDemoDir, '12_lich_su_and_audit.js'), 'utf8');
const serial360Js = fs.readFileSync(path.join(srcDemoDir, '10_ton_kho_and_360.js'), 'utf8');
const nhapKhoJs = fs.readFileSync(path.join(srcDemoDir, '08_nhap_kho_logic.js'), 'utf8');
const xuatKhoJs = fs.readFileSync(path.join(srcDemoDir, '09_xuat_kho_logic.js'), 'utf8');
const gasCodeJs = fs.readFileSync(path.join(gasDir, 'Code.js'), 'utf8');

console.log('================================================================================');
console.log('   BẮT ĐẦU KIỂM TOÁN LỖ HỔNG ĐỒNG BỘ TRÊN TOÀN BỘ MÃ NGUỒN HỆ THỐNG');
console.log('================================================================================\n');

const auditResults = [];

function checkFlaw(section, checkTitle, isFlaw, flawDesc, fixRecommendation) {
  auditResults.push({
    section,
    checkTitle,
    status: isFlaw ? 'VULNERABILITY / GAP' : 'OPTIMAL',
    flawDesc: isFlaw ? flawDesc : 'Đã đáp ứng chuẩn kiến trúc',
    fixRecommendation
  });
}

// -----------------------------------------------------------------------------
// 1. KIỂM TOÁN MODAL SỬA PHIẾU (editVoucherModal & openEditVoucherModal)
// -----------------------------------------------------------------------------
// A. Phiếu Xuất: Kiểm tra các trường Người Liên Hệ, Email, MST, Chứng từ kèm theo
const hasOutboundContactPersonInEdit = historyJs.includes('edit-xuat-nguoilienhe') || historyJs.includes('nguoiLienHe');
const hasOutboundEmailInEdit = historyJs.includes('edit-xuat-email');
const hasOutboundMstInEdit = historyJs.includes('edit-xuat-mst');
const hasOutboundDocsInEdit = historyJs.includes('edit-xuat-chungtu') || historyJs.includes('chungTuKemTheo');

checkFlaw(
  '1. SỬA PHIẾU XUẤT',
  'Trường Người liên hệ nhận máy',
  !hasOutboundContactPersonInEdit,
  'Giao diện sửa phiếu xuất (openEditVoucherModal) thiếu input Người Liên Hệ (nguoiLienHe). Khi sửa khách, không cập nhật được người phụ trách nhận thiết bị.',
  'Thêm input `edit-xuat-nguoilienhe` vào container và đồng bộ sang serial.'
);

checkFlaw(
  '1. SỬA PHIẾU XUẤT',
  'Trường Email & Mã số thuế khách hàng',
  !hasOutboundEmailInEdit || !hasOutboundMstInEdit,
  'Thiếu trường Email (`edit-xuat-email`) và Mã số thuế (`edit-xuat-mst`) trong form chỉnh sửa phiếu xuất.',
  'Bổ sung đầy đủ Email, MST vào form chỉnh sửa phiếu xuất.'
);

checkFlaw(
  '1. SỬA PHIẾU XUẤT',
  'Chứng từ kèm theo (Hóa đơn VAT, BBBG, PBH, CO/CQ)',
  !hasOutboundDocsInEdit,
  'Thiếu 4 checkbox chứng từ đi kèm mà form Tạo Phiếu Xuất có nhưng form Sửa Phiếu lại không có.',
  'Bổ sung cụm checkbox 4 loại chứng từ vào form sửa phiếu xuất.'
);

// B. Phiếu Nhập: Kiểm tra Số hóa đơn NCC, Người giao hàng NCC
const hasInboundInvoiceInEdit = historyJs.includes('edit-nhap-sohoadon') || historyJs.includes('soHoaDonNcc');
const hasInboundDelivererInEdit = historyJs.includes('edit-nhap-nguoigiao');

checkFlaw(
  '2. SỬA PHIẾU NHẬP',
  'Số hóa đơn NCC & Người giao hàng',
  !hasInboundInvoiceInEdit || !hasInboundDelivererInEdit,
  'Form sửa phiếu nhập thiếu trường Số Hóa Đơn / Phiếu NCC và Người Giao Hàng NCC.',
  'Bổ sung `edit-nhap-sohoadon` và `edit-nhap-nguoigiao` vào form sửa phiếu nhập.'
);

// -----------------------------------------------------------------------------
// 2. KIỂM TOÁN LOGIC LƯU SỬA PHIẾU & ROLLBACK TỒN KHO (submitEditVoucher)
// -----------------------------------------------------------------------------
// Kiểm tra nếu xóa thiết bị khỏi phiếu xuất, có tìm thấy và rollback các serial bị gỡ không
const hasRollbackRemovedSerialLogic = historyJs.includes('removedItems') || historyJs.includes('removedSerials') || (historyJs.includes('v.items.filter') && historyJs.includes('IN_STOCK'));

checkFlaw(
  '3. ROLLBACK TỒN KHO KHI SỬA PHIẾU',
  'Hoàn trả trạng thái IN_STOCK khi gỡ serial khỏi phiếu xuất',
  !hasRollbackRemovedSerialLogic,
  'LỖ HỔNG NGHIÊM TRỌNG: Khi quản lý bấm nút Thùng rác xóa 1 serial khỏi phiếu xuất trong modal sửa phiếu, hàm submitEditVoucher chỉ duyệt qua `EDIT_VOUCHER_TEMP_ITEMS`. Serial bị xóa vẫn giữ nguyên status="SOLD", maPhieuXuat trên SERIAL_DB, dẫn đến máy bị khóa oan vĩnh viễn, không trở lại kho!',
  'Trước khi gán `v.items = EDIT_VOUCHER_TEMP_ITEMS`, tìm danh sách serial bị xóa (`removedSerials`), duyệt qua SERIAL_DB đặt lại `s.status = "IN_STOCK"`, xóa `s.maPhieuXuat`, `s.khachHang`, `s.sdtKhach`, `s.nguoiLienHe` và ghi log kiểm toán hoàn trả.'
);

// -----------------------------------------------------------------------------
// 3. KIỂM TOÁN SERIAL 360° (lookupSerial360 trong 10_ton_kho_and_360.js)
// -----------------------------------------------------------------------------
// A. Đồng bộ động với Master Product
const dynamicResolveModelIn360 = serial360Js.includes('INITIAL_PRODUCTS') && serial360Js.includes('.find(') && serial360Js.includes('target.model');
checkFlaw(
  '4. HỒ SƠ THIẾT BỊ SERIAL 360°',
  'Liên kết động tên thiết bị từ Danh mục Model (Master Products)',
  !dynamicResolveModelIn360,
  'LỖ HỔNG LỆCH DỮ LIỆU: Khi người dùng sửa tên Model, Hãng SX hoặc Phân nhóm trong Danh Mục, hàm lookupSerial360 vẫn chỉ hiển thị `target.tenHang` cũ lưu từ ngày nhập kho thay vì liên kết động từ INITIAL_PRODUCTS.',
  'Trong lookupSerial360, ưu tiên lấy tên, hãng, nhóm từ `INITIAL_PRODUCTS.find(p => p.model === target.model)` để đảm bảo khi danh mục đổi thì 360° tự động cập nhật ngay.'
);

// B. Cột 2 Bàn giao & Xuất kho của 360° có hiển thị Người liên hệ, Địa chỉ, Chứng từ không?
const hasContactIn360Outbound = serial360Js.includes('target.nguoiLienHe') || serial360Js.includes('Người liên hệ');
const hasAddressIn360Outbound = serial360Js.includes('target.diaChiGiao') || serial360Js.includes('Địa chỉ giao') || serial360Js.includes('target.diaChi');
const hasDocsIn360Outbound = serial360Js.includes('chungTuKemTheo') || serial360Js.includes('Chứng từ');

checkFlaw(
  '4. HỒ SƠ THIẾT BỊ SERIAL 360°',
  'Hiển thị Người liên hệ nhận máy trong Cột 2 (Xuất Kho)',
  !hasContactIn360Outbound,
  'Cột Bàn giao & Xuất kho của 360° chỉ hiển thị Tên Khách và SĐT, KHÔNG hiển thị Người liên hệ phụ trách nhận máy.',
  'Bổ sung hiển thị `Người liên hệ nhận máy` trong Cột 2 của Serial 360°.'
);

checkFlaw(
  '4. HỒ SƠ THIẾT BỊ SERIAL 360°',
  'Hiển thị Địa chỉ giao nhận máy trong Cột 2 (Xuất Kho)',
  !hasAddressIn360Outbound,
  'Cột Bàn giao & Xuất kho của 360° KHÔNG hiển thị Địa chỉ giao hàng.',
  'Bổ sung hiển thị `Địa chỉ giao hàng` trong Cột 2 của Serial 360°.'
);

// -----------------------------------------------------------------------------
// 4. KIỂM TOÁN GOOGLE APPS SCRIPT BACKEND (saveVoucherEdit)
// -----------------------------------------------------------------------------
const saveVoucherEditMatch = gasCodeJs.match(/function saveVoucherEdit[\s\S]*?return \{ success: true \};/);
const saveVoucherEditCode = saveVoucherEditMatch ? saveVoucherEditMatch[0] : '';
const gasHandlesRemovedItems = saveVoucherEditCode.includes('removedSerials') || saveVoucherEditCode.includes('removedItems');

checkFlaw(
  '5. BACKEND GOOGLE SHEETS SYNC',
  'Xử lý hoàn trả serial bị gỡ bỏ trong SERIAL_MASTER trên Google Sheet',
  !gasHandlesRemovedItems,
  'Hàm saveVoucherEdit trên backend GAS chỉ duyệt qua `v.items.forEach`. Nếu một serial bị xóa khỏi phiếu, trên sheet SERIAL_MASTER serial đó vẫn giữ nguyên trạng thái SOLD!',
  'Bổ sung danh sách `removedSerials` vào payload gửi lên GAS, duyệt tìm trên sheet SERIAL_MASTER để đặt lại Trạng thái = "IN_STOCK", xóa phiếu xuất và thông tin khách hàng.'
);

// -----------------------------------------------------------------------------
// XUẤT BÁO CÁO KIỂM TOÁN
// -----------------------------------------------------------------------------
console.log('KẾT QUẢ KIỂM TOÁN TOÀN DIỆN MÃ NGUỒN:\n');
let vulnCount = 0;
auditResults.forEach((r, idx) => {
  const isVuln = r.status.includes('VULNERABILITY');
  if (isVuln) vulnCount++;
  console.log(`[${idx + 1}] [${r.section}] ${r.checkTitle}`);
  console.log(`    Trạng thái: ${r.status}`);
  console.log(`    Mô tả:      ${r.flawDesc}`);
  console.log(`    Khắc phục:  ${r.fixRecommendation}\n`);
});

console.log('================================================================================');
console.log(`TỔNG KẾT: Phát hiện ${vulnCount} lỗ hổng / khoảng trống đồng bộ cần khắc phục!`);
console.log('================================================================================');
