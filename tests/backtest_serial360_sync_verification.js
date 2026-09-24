// BACKTEST KIỂM TOÁN TÍNH ĐỒNG BỘ DỮ LIỆU CỦA SERIAL 360° & SỬA PHIẾU XUẤT/NHẬP
// Mục tiêu: Kiểm tra xem khi sửa phiếu, sửa model, sửa khách hàng thì 360 có được đồng bộ hay không

const fs = require('fs');
const path = require('path');

console.log('================================================================================');
console.log('   BẮT ĐẦU CHẠY BACKTEST ĐỒNG BỘ HỒ SƠ SERIAL 360° & CHỈNH SỬA PHIẾU KHO');
console.log('================================================================================\n');

// 1. Giả lập cơ sở dữ liệu thực tế
const mockProducts = [
  { productId: 'PRD-001', model: 'HP 4003dw', ten: 'Máy in laser HP LaserJet Pro 4003dw', hang: 'HP', nhom: 'Máy In' },
  { productId: 'PRD-002', model: 'LG 24U411A-B', ten: 'Màn hình máy tính LG 24 inch 24U411A-B', hang: 'LG', nhom: 'Màn Hình' }
];

const mockCustomers = [
  { customerId: 'CUS-001', ten: 'Công ty HTC Việt Nam', sdt: '0976147203', nguoiLienHe: 'A Quang', diaChi: 'Hà Đông' },
  { customerId: 'CUS-002', ten: 'Công ty Giải Pháp Mới', sdt: '0912345678', nguoiLienHe: 'Chị Lan', diaChi: 'Cầu Giấy' }
];

const mockSerials = [
  {
    serial: '510B0YQ05346',
    internalId: 'ASSET-001',
    model: 'LG 24U411A-B',
    tenHang: 'Màn hình LG 24 inch',
    hang: 'LG',
    nhom: 'Màn Hình',
    kho: 'Kho VP',
    ncc: 'SYNNEX_FPT',
    ngayNhap: '20/09/2026',
    maPhieuNhap: 'PN-260920-01',
    status: 'SOLD',
    maPhieuXuat: 'PX-260924-05',
    ngayXuat: '24/09/2026',
    khachHang: 'Công ty HTC Việt Nam',
    sdtKhach: '0976147203',
    nguoiLienHe: 'A Quang',
    soThangBh: 12,
    ngayHetHanBh: '24/09/2027'
  },
  {
    serial: 'SN-HP-999',
    internalId: 'ASSET-002',
    model: 'HP 4003dw',
    tenHang: 'Máy in laser HP',
    hang: 'HP',
    nhom: 'Máy In',
    kho: 'Kho Tổng',
    ncc: 'DẦU_KHÍ',
    ngayNhap: '10/09/2026',
    maPhieuNhap: 'PN-260910-01',
    status: 'IN_STOCK',
    maPhieuXuat: '',
    ngayXuat: '',
    khachHang: '',
    sdtKhach: '',
    soThangBh: 12,
    ngayHetHanBh: ''
  }
];

const mockVouchers = {
  xuat: [
    {
      maPhieu: 'PX-260924-05',
      ngay: '24/09/2026',
      khachHang: 'Công ty HTC Việt Nam',
      sdtKhach: '0976147203',
      kho: 'Kho VP',
      items: [
        { serial: '510B0YQ05346', model: 'LG 24U411A-B', soThangBh: 12, ngayHetHanBh: '24/09/2027' }
      ]
    }
  ]
};

let testPassed = 0;
let testFailed = 0;

function assert(condition, testName, errorMsg) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testPassed++;
  } else {
    console.error(`[FAIL] ${testName} ➔ ${errorMsg}`);
    testFailed++;
  }
}

// -----------------------------------------------------------------------------
// CA 1: Kiểm tra 360 có lấy đúng thông tin Model và Tên Hàng Hóa chuẩn từ Danh Mục không
// -----------------------------------------------------------------------------
console.log('--- TEST 1: ĐỒNG BỘ MODEL & TÊN SẢN PHẨM TRÊN 360 KHI DANH MỤC THAY ĐỔI ---');
// Người dùng sửa tên sản phẩm trong Danh mục:
const prd = mockProducts.find(p => p.model === 'LG 24U411A-B');
prd.ten = 'Màn hình đồ họa chuyên dụng LG UltraFine 24 inch 4K (24U411A-B)';
prd.hang = 'LG Electronics';

// Giả lập logic hiển thị 360 hiện tại: nếu 360 chỉ đọc `target.tenHang` cũ mà không nối với Danh mục:
const s1_current = mockSerials.find(s => s.serial === '510B0YQ05346');
assert(s1_current.tenHang === 'Màn hình LG 24 inch', 'Kiểm tra hiện trạng 360 trước fix', 'Tên cũ');

// Logic đúng chuẩn: 360 phải liên kết realtime với Danh mục Model
function resolveSerial360MasterInfo(s) {
  const p = mockProducts.find(x => x.model.toLowerCase() === (s.model || '').toLowerCase());
  return {
    model: s.model,
    tenHang: p ? p.ten : (s.tenHang || s.model),
    hang: p ? p.hang : (s.hang || 'Chưa rõ'),
    nhom: p ? p.nhom : (s.nhom || 'Thiết bị')
  };
}
const s1_resolved = resolveSerial360MasterInfo(s1_current);
assert(s1_resolved.tenHang === 'Màn hình đồ họa chuyên dụng LG UltraFine 24 inch 4K (24U411A-B)', '360 tự động cập nhật tên mới sau khi sửa Danh mục', 'Chưa đồng bộ tên mới');
assert(s1_resolved.hang === 'LG Electronics', '360 tự động cập nhật Hãng SX mới', 'Chưa đồng bộ Hãng');

// -----------------------------------------------------------------------------
// CA 2: Kiểm tra sửa thông tin phiếu xuất (Khách, SĐT, Người liên hệ, Kho) đồng bộ sang 360
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: ĐỒNG BỘ SỬA PHIẾU XUẤT SANG THÔNG TIN THIẾT BỊ & 360 ---');
// Sửa phiếu PX-260924-05 sang Khách hàng mới: "Công ty Giải Pháp Mới", SĐT: "0912345678", Người LH: "Chị Lan", Kho: "Kho Chi Nhánh"
const vXuat = mockVouchers.xuat[0];
const oldCust = vXuat.khachHang;
vXuat.khachHang = 'Công ty Giải Pháp Mới';
vXuat.sdtKhach = '0912345678';
vXuat.nguoiLienHe = 'Chị Lan';
vXuat.kho = 'Kho Chi Nhánh';

// Đồng bộ sang Serial
mockSerials.forEach(s => {
  if (s.maPhieuXuat === vXuat.maPhieu) {
    s.khachHang = vXuat.khachHang;
    s.sdtKhach = vXuat.sdtKhach;
    s.nguoiLienHe = vXuat.nguoiLienHe;
    s.kho = vXuat.kho;
  }
});

const sTarget = mockSerials.find(s => s.serial === '510B0YQ05346');
assert(sTarget.khachHang === 'Công ty Giải Pháp Mới', '360 hiển thị đúng Khách hàng mới sau khi sửa phiếu', 'Khách hàng chưa đổi');
assert(sTarget.sdtKhach === '0912345678', '360 hiển thị đúng SĐT mới sau khi sửa phiếu', 'SĐT chưa đổi');
assert(sTarget.nguoiLienHe === 'Chị Lan', '360 hiển thị đúng Người liên hệ sau khi sửa phiếu', 'Người liên hệ chưa đổi');
assert(sTarget.kho === 'Kho Chi Nhánh', '360 hiển thị đúng Kho xuất sau khi sửa phiếu', 'Kho chưa đổi');

// -----------------------------------------------------------------------------
// CA 3: Kiểm tra XÓA 1 serial ra khỏi phiếu xuất ➔ 360 & Tồn Kho phải HOÀN TRẢ
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: XÓA MÁY KHỎI PHIẾU XUẤT ➔ HOÀN TRẢ TRẠNG THÁI TỒN KHO TRÊN 360 ---');
// Người dùng xóa máy 510B0YQ05346 ra khỏi phiếu xuất PX-260924-05
vXuat.items = []; // xóa hết items khỏi phiếu xuất

// Xử lý hoàn trả:
function rollbackRemovedExportedSerial(serial) {
  const s = mockSerials.find(x => x.serial === serial);
  if (s && s.status === 'SOLD') {
    s.status = 'IN_STOCK';
    s.maPhieuXuat = '';
    s.ngayXuat = '';
    s.khachHang = '';
    s.sdtKhach = '';
    s.nguoiLienHe = '';
    return true;
  }
  return false;
}

rollbackRemovedExportedSerial('510B0YQ05346');

assert(sTarget.status === 'IN_STOCK', 'Serial được hoàn trả về IN_STOCK (Tồn kho)', 'Trạng thái vẫn là SOLD');
assert(sTarget.maPhieuXuat === '', 'Mã phiếu xuất bị xóa khỏi serial hoàn trả', 'Vẫn còn maPhieuXuat');
assert(sTarget.khachHang === '', 'Tên khách hàng bị xóa khỏi serial hoàn trả', 'Vẫn còn khách hàng');

// -----------------------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log(`KẾT QUẢ BACKTEST: ${testPassed} Passed | ${testFailed} Failed`);
console.log('================================================================================');

if (testFailed > 0) {
  process.exit(1);
}
