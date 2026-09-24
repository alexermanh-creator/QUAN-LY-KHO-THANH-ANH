/**
 * ============================================================================
 * HỆ THỐNG KIỂM THỬ BACKTEST TOÀN DIỆN (SYSTEM ARCHITECT BACKTEST SUITE)
 * PHÂN HỆ: QUẢN LÝ KHO THÀNH AN ERP v4.0
 * KIẾN TRÚC: ĐỒNG BỘ DỮ LIỆU ĐA CHIỀU (MULTI-DIRECTIONAL DATA SYNCHRONIZATION)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================================');
console.log('   BẮT ĐẦU CHẠY KIỂM TOÁN HỆ THỐNG TOÀN DIỆN - SYSTEM ARCHITECT E2E BACKTEST');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// KHỞI TẠO MÔ HÌNH DỮ LIỆU CHUẨN KIẾN TRÚC THÀNH AN
// -----------------------------------------------------------------------------
let MASTER_PRODUCTS = [
  { productId: 'PRD-001', model: 'HP 4003dw', ten: 'Máy in laser HP LaserJet Pro 4003dw', hang: 'HP', nhom: 'Máy In', dvt: 'Chiếc', defaultBh: 12, manageSerial: true },
  { productId: 'PRD-002', model: 'LG 24U411A-B', ten: 'Màn hình máy tính LG 24 inch 24U411A-B', hang: 'LG', nhom: 'Màn Hình', dvt: 'Chiếc', defaultBh: 24, manageSerial: true },
  { productId: 'PRD-003', model: 'CANON LBP 2900', ten: 'Máy in laser Canon LBP 2900 trắng đen', hang: 'CANON', nhom: 'Máy In', dvt: 'Chiếc', defaultBh: 12, manageSerial: true }
];

let MASTER_CUSTOMERS = [
  { customerId: 'CUS-001', ten: 'CÔNG TY TNHH THƯƠNG MẠI VÀ DU LỊCH HTC VIỆT NAM', sdt: '0976147203', nguoiLienHe: 'A Quang', email: 'htc@vietnam.vn', mst: '0109998888', diaChi: 'căn D03-L20, An Vượng villa, Dương Nội, Hà Đông' },
  { customerId: 'CUS-002', ten: 'CÔNG TY CP GIẢI PHÁP SỐ TOÀN CẦU', sdt: '0912345678', nguoiLienHe: 'Chị Lan Phụ Trách Máy', email: 'lan@giaiphapso.com', mst: '0101112222', diaChi: 'Tầng 5, Tòa Nhà Keangnam, Hà Nội' }
];

let MASTER_SUPPLIERS = [
  { supplierId: 'SUP-001', tenTat: 'SYNNEX_FPT', tenDayDu: 'Công ty Cổ phần Phân phối Synnex FPT', sdt: '024.73006666', nguoiLienHe: 'Anh Hoàng Phụ Trách Kho', mst: '0101777888', diaChi: 'Hà Nội' }
];

let MASTER_WAREHOUSES = [
  { warehouseId: 'WH-001', maKho: 'KHO_VP', tenKho: 'Kho Văn Phòng (Hà Nội)', loaiKho: 'Kho Trung Tâm', active: true },
  { warehouseId: 'WH-002', maKho: 'KHO_CN', tenKho: 'Kho Chi Nhánh Miền Nam', loaiKho: 'Kho Vệ Tinh', active: true }
];

let SERIAL_STORE = [];
let VOUCHER_STORE = { nhap: [], xuat: [] };
let AUDIT_LOGS = [];

let stats = {
  totalPassed: 0,
  totalFailed: 0,
  categories: {}
};

function recordTest(category, name, passed, details = '') {
  if (!stats.categories[category]) {
    stats.categories[category] = { passed: 0, failed: 0 };
  }
  if (passed) {
    stats.totalPassed++;
    stats.categories[category].passed++;
    console.log(`  [PASS] [${category}] ${name}`);
  } else {
    stats.totalFailed++;
    stats.categories[category].failed++;
    console.error(`  [FAIL] [${category}] ${name} ➔ ${details}`);
  }
}

// -----------------------------------------------------------------------------
// MODULE KIẾN TRÚC: TRÌNH GIẢI QUYẾT ĐỒNG BỘ 360° (RESOLVER)
// -----------------------------------------------------------------------------
function resolveSerial360FullProfile(serialQuery) {
  const q = String(serialQuery || '').trim().toLowerCase();
  const s = SERIAL_STORE.find(x => x.serial.toLowerCase() === q || (x.internalId && x.internalId.toLowerCase() === q));
  if (!s) return null;

  // 1. Đồng bộ động với Master Product: Tên hàng, Hãng SX, Nhóm hàng không bao giờ bị cũ
  const p = MASTER_PRODUCTS.find(item => item.model.toLowerCase() === (s.model || '').toLowerCase());
  const actualModel = s.model;
  const actualTenHang = p ? p.ten : (s.tenHang || s.model);
  const actualHang = p ? p.hang : (s.hang || 'Chưa rõ');
  const actualNhom = p ? p.nhom : (s.nhomHang || s.nhom || 'Thiết bị');
  const actualDvt = p ? p.dvt : 'Chiếc';

  // 2. Đồng bộ thông tin Khách hàng hiện tại (nếu máy đã xuất)
  let custProfile = null;
  if (s.status === 'EXPORTED' && s.khachHang) {
    const c = MASTER_CUSTOMERS.find(item => item.ten.toLowerCase() === s.khachHang.toLowerCase() || item.sdt === s.sdtKhach);
    custProfile = {
      tenKhach: s.khachHang,
      sdt: s.sdtKhach || (c ? c.sdt : ''),
      nguoiLienHe: s.nguoiLienHe || (c ? c.nguoiLienHe : ''),
      email: s.emailKhach || (c ? c.email : ''),
      mst: s.mstKhach || (c ? c.mst : ''),
      diaChi: s.diaChiGiao || (c ? c.diaChi : ''),
      maPhieuXuat: s.maPhieuXuat,
      ngayXuat: s.ngayXuat,
      khoXuat: s.kho,
      chungTuKemTheo: s.chungTuKemTheo || []
    };
  }

  // 3. Đồng bộ thông tin Nguồn gốc Nhà cung cấp
  const nccProfile = {
    ncc: s.ncc,
    maPhieuNhap: s.maPhieuNhap,
    ngayNhap: s.ngayNhap,
    khoNhap: s.khoNhap || s.kho,
    loaiHang: s.loaiHang || 'Chính Hãng',
    soHoaDonNcc: s.soHoaDonNcc || ''
  };

  return {
    serial: s.serial,
    internalId: s.internalId || s.serial,
    model: actualModel,
    tenHang: actualTenHang,
    hang: actualHang,
    nhom: actualNhom,
    dvt: actualDvt,
    khoHienTai: s.kho,
    status: s.status, // 'IN_STOCK' hoặc 'EXPORTED'
    nccProfile,
    custProfile,
    soThangBh: s.soThangBh || (p ? p.defaultBh : 12),
    ngayHetHanBh: s.ngayHetHanBh || ''
  };
}

// =============================================================================
// GIAI ĐOẠN 1: KIỂM THỬ NHẬP KHO & TỰ ĐỘNG KHỞI TẠO TỒN KHO 360°
// =============================================================================
console.log('--- GIAI ĐOẠN 1: KIỂM THỬ NHẬP KHO VÀ ĐỒNG BỘ NGUỒN GỐC SẢN PHẨM 360° ---');

// Tạo phiếu nhập PN-260920-01 nhập 2 máy LG 24U411A-B từ SYNNEX_FPT
const phieuNhap1 = {
  maPhieu: 'PN-260920-01',
  ngay: '20/09/2026',
  ncc: 'SYNNEX_FPT',
  kho: 'Kho Văn Phòng (Hà Nội)',
  loaiHang: 'Chính Hãng',
  soHoaDonNcc: 'HD-FPT-88992',
  nguoiGiaoNcc: 'Nguyễn Văn Giao',
  nguoiNhan: 'Thủ kho Quân',
  ghiChu: 'Nhập lô màn hình đợt 1',
  items: [
    { serial: '510B0YQ05346', internalId: 'LG24-001', model: 'LG 24U411A-B' },
    { serial: '510B0YQ05347', internalId: 'LG24-002', model: 'LG 24U411A-B' }
  ]
};

VOUCHER_STORE.nhap.push(phieuNhap1);

// Đưa vào SERIAL_STORE
phieuNhap1.items.forEach(it => {
  SERIAL_STORE.push({
    serial: it.serial,
    internalId: it.internalId,
    model: it.model,
    kho: phieuNhap1.kho,
    khoNhap: phieuNhap1.kho,
    ncc: phieuNhap1.ncc,
    soHoaDonNcc: phieuNhap1.soHoaDonNcc,
    ngayNhap: phieuNhap1.ngay,
    maPhieuNhap: phieuNhap1.maPhieu,
    loaiHang: phieuNhap1.loaiHang,
    status: 'IN_STOCK',
    khachHang: '',
    sdtKhach: '',
    nguoiLienHe: '',
    maPhieuXuat: '',
    ngayXuat: ''
  });
});

let p360_after_inbound = resolveSerial360FullProfile('510B0YQ05346');
recordTest('1. INBOUND', 'Máy mới nhập có trạng thái IN_STOCK', p360_after_inbound.status === 'IN_STOCK');
recordTest('1. INBOUND', '360 nhận diện đúng NCC SYNNEX_FPT', p360_after_inbound.nccProfile.ncc === 'SYNNEX_FPT');
recordTest('1. INBOUND', '360 nhận diện đúng Số HĐ NCC HD-FPT-88992', p360_after_inbound.nccProfile.soHoaDonNcc === 'HD-FPT-88992');
recordTest('1. INBOUND', '360 tự động liên kết Tên hàng chuẩn từ Danh mục Model', p360_after_inbound.tenHang === 'Màn hình máy tính LG 24 inch 24U411A-B');
recordTest('1. INBOUND', '360 xác nhận chưa xuất bán (custProfile === null)', p360_after_inbound.custProfile === null);

// =============================================================================
// GIAI ĐOẠN 2: KIỂM THỬ XUẤT KHO & ĐỒNG BỘ KHÁCH HÀNG / NGƯỜI LIÊN HỆ / BẢO HÀNH
// =============================================================================
console.log('\n--- GIAI ĐOẠN 2: KIỂM THỬ XUẤT KHO VÀ ĐỒNG BỘ ĐẦY ĐỦ THÔNG TIN XUẤT 360° ---');

// Lập phiếu xuất PX-260924-05 xuất máy 510B0YQ05346 cho Cty HTC Việt Nam
const phieuXuat1 = {
  maPhieu: 'PX-260924-05',
  ngay: '24/09/2026',
  khachHang: 'CÔNG TY TNHH THƯƠNG MẠI VÀ DU LỊCH HTC VIỆT NAM',
  sdtKhach: '0976147203',
  nguoiLienHe: 'A Quang Phụ Trách IT',
  emailKhach: 'it.htc@vietnam.vn',
  mstKhach: '0109998888',
  diaChiGiao: 'căn D03-L20, An Vượng villa, Dương Nội, Hà Đông',
  kho: 'Kho Văn Phòng (Hà Nội)',
  chungTuKemTheo: ['Hóa đơn VAT', 'Biên bản bàn giao'],
  nguoiXuat: 'Khổng Minh Quân',
  ghiChu: 'Xuất bán khách hàng',
  items: [
    { serial: '510B0YQ05346', model: 'LG 24U411A-B', soThangBh: 24, ngayHetHanBh: '24/09/2028' }
  ]
};

VOUCHER_STORE.xuat.push(phieuXuat1);

// Chuyển trạng thái máy trong SERIAL_STORE sang EXPORTED
const s_out = SERIAL_STORE.find(x => x.serial === '510B0YQ05346');
s_out.status = 'EXPORTED';
s_out.maPhieuXuat = phieuXuat1.maPhieu;
s_out.ngayXuat = phieuXuat1.ngay;
s_out.khachHang = phieuXuat1.khachHang;
s_out.sdtKhach = phieuXuat1.sdtKhach;
s_out.nguoiLienHe = phieuXuat1.nguoiLienHe;
s_out.emailKhach = phieuXuat1.emailKhach;
s_out.mstKhach = phieuXuat1.mstKhach;
s_out.diaChiGiao = phieuXuat1.diaChiGiao;
s_out.kho = phieuXuat1.kho;
s_out.chungTuKemTheo = phieuXuat1.chungTuKemTheo;
s_out.soThangBh = phieuXuat1.items[0].soThangBh;
s_out.ngayHetHanBh = phieuXuat1.items[0].ngayHetHanBh;

let p360_after_outbound = resolveSerial360FullProfile('510B0YQ05346');
recordTest('2. OUTBOUND', 'Máy sau xuất có trạng thái EXPORTED', p360_after_outbound.status === 'EXPORTED');
recordTest('2. OUTBOUND', '360 hiển thị đúng Tên khách hàng công ty', p360_after_outbound.custProfile.tenKhach.includes('HTC VIỆT NAM'));
recordTest('2. OUTBOUND', '360 hiển thị đúng Người liên hệ nhận máy', p360_after_outbound.custProfile.nguoiLienHe === 'A Quang Phụ Trách IT');
recordTest('2. OUTBOUND', '360 hiển thị đúng Địa chỉ giao hàng', p360_after_outbound.custProfile.diaChi.includes('An Vượng villa'));
recordTest('2. OUTBOUND', '360 hiển thị đúng Hạn bảo hành 24/09/2028', p360_after_outbound.ngayHetHanBh === '24/09/2028');
recordTest('2. OUTBOUND', '360 hiển thị đúng Chứng từ đi kèm (VAT, BBBG)', p360_after_outbound.custProfile.chungTuKemTheo.includes('Hóa đơn VAT'));

// =============================================================================
// GIAI ĐOẠN 3: KIỂM THỬ SỬA PHIẾU XUẤT (HEADER MUTATION & CASCADE)
// =============================================================================
console.log('\n--- GIAI ĐOẠN 3: SỬA THÔNG TIN HEADER PHIẾU XUẤT ➔ CASCADE ĐỒNG BỘ 360° ---');

// Giả lập người dùng bấm "Chỉnh Sửa Thông Tin Phiếu" (hình ảnh người dùng gửi):
// Đổi Khách sang "CÔNG TY CP GIẢI PHÁP SỐ TOÀN CẦU", SĐT sang "0912345678", Người LH sang "Chị Lan Phụ Trách Máy", Kho xuất sang "Kho Chi Nhánh Miền Nam", Hạn BH thêm 1 năm (24/09/2029)
function applyEditVoucherOutbound(voucherCode, newHeaderData, updatedItems) {
  const v = VOUCHER_STORE.xuat.find(x => x.maPhieu === voucherCode);
  if (!v) throw new Error('Không tìm thấy phiếu xuất');

  // Ghi nhận Audit
  AUDIT_LOGS.push({
    action: 'SỬA PHIẾU XUẤT',
    target: voucherCode,
    reason: 'Khách hàng cập nhật thông tin nhận máy và gia hạn BH',
    oldCust: v.khachHang,
    newCust: newHeaderData.khachHang
  });

  // Cập nhật Header
  Object.assign(v, newHeaderData);
  v.items = updatedItems;

  // CASCADE: Đồng bộ sang toàn bộ serial thuộc phiếu này
  SERIAL_STORE.forEach(s => {
    if (s.maPhieuXuat === voucherCode) {
      s.khachHang = newHeaderData.khachHang;
      s.sdtKhach = newHeaderData.sdtKhach;
      s.nguoiLienHe = newHeaderData.nguoiLienHe;
      s.emailKhach = newHeaderData.emailKhach;
      s.mstKhach = newHeaderData.mstKhach;
      s.diaChiGiao = newHeaderData.diaChiGiao;
      s.kho = newHeaderData.kho; // Đổi cả kho máy
      s.chungTuKemTheo = newHeaderData.chungTuKemTheo;

      const itemInfo = updatedItems.find(it => it.serial === s.serial);
      if (itemInfo) {
        if (itemInfo.soThangBh) s.soThangBh = itemInfo.soThangBh;
        if (itemInfo.ngayHetHanBh) s.ngayHetHanBh = itemInfo.ngayHetHanBh;
      }
    }
  });
}

applyEditVoucherOutbound('PX-260924-05', {
  khachHang: 'CÔNG TY CP GIẢI PHÁP SỐ TOÀN CẦU',
  sdtKhach: '0912345678',
  nguoiLienHe: 'Chị Lan Phụ Trách Máy',
  emailKhach: 'lan@giaiphapso.com',
  mstKhach: '0101112222',
  diaChiGiao: 'Tầng 5, Tòa Nhà Keangnam, Hà Nội',
  kho: 'Kho Chi Nhánh Miền Nam',
  chungTuKemTheo: ['Hóa đơn VAT', 'Biên bản bàn giao', 'Phiếu bảo hành', 'CO/CQ']
}, [
  { serial: '510B0YQ05346', model: 'LG 24U411A-B', soThangBh: 36, ngayHetHanBh: '24/09/2029' }
]);

let p360_after_edit_header = resolveSerial360FullProfile('510B0YQ05346');
recordTest('3. EDIT VOUCHER', '360 tự động đổi sang Tên Khách Hàng mới', p360_after_edit_header.custProfile.tenKhach.includes('GIẢI PHÁP SỐ'));
recordTest('3. EDIT VOUCHER', '360 tự động đổi sang SĐT mới', p360_after_edit_header.custProfile.sdt === '0912345678');
recordTest('3. EDIT VOUCHER', '360 tự động đổi sang Người Liên Hệ mới (Chị Lan)', p360_after_edit_header.custProfile.nguoiLienHe === 'Chị Lan Phụ Trách Máy');
recordTest('3. EDIT VOUCHER', '360 tự động đổi Vị Trí Kho sang Kho Chi Nhánh', p360_after_edit_header.khoHienTai === 'Kho Chi Nhánh Miền Nam');
recordTest('3. EDIT VOUCHER', '360 tự động cập nhật Hạn BH mới (2029)', p360_after_edit_header.ngayHetHanBh === '24/09/2029');
recordTest('3. EDIT VOUCHER', '360 nhận diện đủ 4 loại chứng từ đi kèm', p360_after_edit_header.custProfile.chungTuKemTheo.length === 4);

// =============================================================================
// GIAI ĐOẠN 4: KIỂM THỬ XÓA MÁY KHỎI PHIẾU XUẤT ➔ HOÀN TRẢ TỒN KHO & 360°
// =============================================================================
console.log('\n--- GIAI ĐOẠN 4: XÓA MÁY KHỎI PHIẾU XUẤT ➔ TỰ ĐỘNG HOÀN TRẢ TỒN KHO ---');

// Người dùng mở sửa phiếu PX-260924-05, bấm nút Thùng rác đỏ xóa máy 510B0YQ05346 khỏi phiếu
function removeSerialFromExportVoucher(voucherCode, serialToRemove, reason) {
  const v = VOUCHER_STORE.xuat.find(x => x.maPhieu === voucherCode);
  if (!v) throw new Error('Không tìm thấy phiếu');

  const idx = v.items.findIndex(it => it.serial === serialToRemove);
  if (idx !== -1) {
    v.items.splice(idx, 1);
  }

  // ROLLBACK LOGIC HOÀN TRẢ TỒN KHO
  const s = SERIAL_STORE.find(x => x.serial === serialToRemove);
  if (s && s.status === 'EXPORTED') {
    s.status = 'IN_STOCK';
    s.maPhieuXuat = '';
    s.ngayXuat = '';
    s.khachHang = '';
    s.sdtKhach = '';
    s.nguoiLienHe = '';
    s.emailKhach = '';
    s.mstKhach = '';
    s.diaChiGiao = '';
    s.chungTuKemTheo = [];

    AUDIT_LOGS.push({
      action: 'HOÀN TRẢ TỒN KHO',
      serial: serialToRemove,
      fromVoucher: voucherCode,
      reason: reason || 'Gỡ bỏ khỏi phiếu xuất khi chỉnh sửa'
    });
  }
}

removeSerialFromExportVoucher('PX-260924-05', '510B0YQ05346', 'Xuất nhầm số serial, gỡ bỏ khỏi phiếu xuất');

let p360_after_rollback = resolveSerial360FullProfile('510B0YQ05346');
recordTest('4. ROLLBACK', 'Máy bị gỡ khỏi phiếu xuất lập tức hoàn trả về IN_STOCK', p360_after_rollback.status === 'IN_STOCK');
recordTest('4. ROLLBACK', '360 xóa bỏ thông tin khách hàng sở hữu', p360_after_rollback.custProfile === null);
recordTest('4. ROLLBACK', 'Mã phiếu xuất bị gỡ bỏ khỏi thiết bị', !s_out.maPhieuXuat);
recordTest('4. ROLLBACK', 'Ghi nhận Audit Trail lý do hoàn trả tồn kho', AUDIT_LOGS.some(a => a.action === 'HOÀN TRẢ TỒN KHO' && a.serial === '510B0YQ05346'));

// =============================================================================
// GIAI ĐOẠN 5: KIỂM THỬ SỬA MODEL Ở DANH MỤC ➔ CASCADE ĐỒNG BỘ 360°
// =============================================================================
console.log('\n--- GIAI ĐOẠN 5: SỬA MODEL Ở DANH MỤC ➔ TOÀN BỘ 360° CẬP NHẬT TỨC THÌ ---');

// Quản trị viên sửa Model PRD-002: Đổi tên thành "Màn Hình Chuyên Đồ Họa LG UltraFine 24 inch (4K IPS)", Hãng thành "LG KOREA"
const prdLG = MASTER_PRODUCTS.find(p => p.model === 'LG 24U411A-B');
prdLG.ten = 'Màn Hình Chuyên Đồ Họa LG UltraFine 24 inch (4K IPS)';
prdLG.hang = 'LG KOREA';
prdLG.nhom = 'Màn Hình Cao Cấp';

// Kiểm tra máy 510B0YQ05346 (vừa được hoàn trả vào kho) xem ở 360 có lập tức hiển thị tên và hãng mới không:
let p360_after_model_edit = resolveSerial360FullProfile('510B0YQ05346');
recordTest('5. MASTER SYNC', '360 tự động cập nhật Tên mới từ Danh mục Model', p360_after_model_edit.tenHang === 'Màn Hình Chuyên Đồ Họa LG UltraFine 24 inch (4K IPS)');
recordTest('5. MASTER SYNC', '360 tự động cập nhật Hãng SX mới (LG KOREA)', p360_after_model_edit.hang === 'LG KOREA');
recordTest('5. MASTER SYNC', '360 tự động cập nhật Phân Nhóm mới (Màn Hình Cao Cấp)', p360_after_model_edit.nhom === 'Màn Hình Cao Cấp');

// =============================================================================
// BÁO CÁO TỔNG KẾT SYSTEM ARCHITECT
// =============================================================================
console.log('\n================================================================================');
console.log('   BÁO CÁO TỔNG KẾT KIỂM THỬ HỆ THỐNG (SYSTEM ARCHITECT REPORT)');
console.log('================================================================================');
console.log(`- Tổng số tiêu chí kiểm định: ${stats.totalPassed + stats.totalFailed}`);
console.log(`- Số tiêu chuẩn ĐẠT CHUẨN:    ${stats.totalPassed}`);
console.log(`- Số lỗi phát hiện:           ${stats.totalFailed}`);
console.log('--------------------------------------------------------------------------------');
Object.keys(stats.categories).forEach(cat => {
  const c = stats.categories[cat];
  console.log(`+ Phân hệ [${cat}]: ${c.passed} Đạt / ${c.passed + c.failed} Tiêu chí (${((c.passed / (c.passed + c.failed)) * 100).toFixed(1)}%)`);
});
console.log('================================================================================');

if (stats.totalFailed > 0) {
  process.exit(1);
}
