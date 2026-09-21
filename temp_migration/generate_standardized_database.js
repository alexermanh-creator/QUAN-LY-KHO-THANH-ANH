const fs = require('fs');
const path = require('path');
const db = require('./parsed_db.json');

// Helper: Excel date number to DD/MM/YYYY
function excelDateToDateStr(serial) {
  if (!serial) return '';
  const num = parseFloat(serial);
  if (isNaN(num) || num < 1000) {
    return String(serial).trim();
  }
  const utcDays = Math.floor(num - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

// Helper: Clean serial number from scientific notation or .0
function cleanSerial(sn) {
  if (!sn) return '';
  let s = String(sn).trim();
  if (s.includes('E+') || s.includes('E10') || s.includes('E11')) {
    const num = Number(s);
    if (!isNaN(num)) s = String(BigInt(Math.round(num)));
  }
  if (s.endsWith('.0')) {
    s = s.substring(0, s.length - 2);
  }
  return s;
}

// Helper: Format phone number properly
function cleanPhone(phone) {
  if (!phone) return '';
  let s = String(phone).trim();
  if (s.startsWith("'")) s = s.substring(1).trim();

  // If in scientific notation
  if (s.includes('E+') || s.includes('E7') || s.includes('E8') || s.includes('E9')) {
    const num = Number(s);
    if (!isNaN(num)) {
      s = String(Math.round(num));
    }
  }

  // Extract digits
  let digits = s.replace(/\D/g, '');
  if (!digits) return s;

  if (digits.length === 9) {
    digits = '0' + digits;
  }
  return digits;
}

// =========================================================================
// 1. CHUẨN HÓA DANH MỤC SẢN PHẨM (DM_SAN_PHAM) VÀ BẢN ĐỒ MODEL CHUẨN
// =========================================================================
const CATALOG_MAPPING = {
  "HP Laserjet Pro 4003dw": {
    standardModel: "HP LaserJet Pro 4003dw",
    brand: "HP",
    fullTen: "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "HP Laser 108a": {
    standardModel: "HP Laser 108a",
    brand: "HP",
    fullTen: "Máy in laser đen trắng đơn năng HP Laser 108a (USB 2.0)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Canon LBP 6030w": {
    standardModel: "Canon LBP 6030w",
    brand: "Canon",
    fullTen: "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Canon LBP 6030": {
    standardModel: "Canon LBP 6030",
    brand: "Canon",
    fullTen: "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Hp Laserjet M211DW": {
    standardModel: "HP LaserJet M211dw",
    brand: "HP",
    fullTen: "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Canon G2010": {
    standardModel: "Canon PIXMA G2010",
    brand: "Canon",
    fullTen: "Máy in phun màu đa năng Canon PIXMA G2010 (In, Scan, Copy)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Brother ADS-4300DN": {
    standardModel: "Brother ADS-4300DN",
    brand: "Brother",
    fullTen: "Máy quét tài liệu chuyên dụng tốc độ cao Brother ADS-4300DN (LAN/USB)",
    category: "Máy Scan",
    dvt: "Chiếc",
    defaultBh: 24
  },
  "Canon LBP121dn": {
    standardModel: "Canon LBP 121dn",
    brand: "Canon",
    fullTen: "Máy in laser đen trắng Canon LBP 121dn (In 2 mặt, Kết nối LAN)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "HP 108W": {
    standardModel: "HP Laser 108w",
    brand: "HP",
    fullTen: "Máy in laser đen trắng đơn năng HP Laser 108w (Kết nối Wifi)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Canon LBP 243dw II": {
    standardModel: "Canon LBP 243dw II",
    brand: "Canon",
    fullTen: "Máy in laser đen trắng Canon LBP243dw II (Tốc độ cao, In 2 mặt, Wifi/LAN)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Halloya": {
    standardModel: "Halloya 85A/325 Toner",
    brand: "Halloya",
    fullTen: "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    category: "Mực In",
    dvt: "Hộp",
    defaultBh: 0
  },
  "TJ INK": {
    standardModel: "TJ INK Toner Cartridge",
    brand: "TJ INK",
    fullTen: "Hộp mực in tương thích cao cấp TJ INK (Dùng cho máy in Canon/HP)",
    category: "Mực In",
    dvt: "Hộp",
    defaultBh: 0
  },
  "76A": {
    standardModel: "HP 76A Toner Cartridge",
    brand: "HP",
    fullTen: "Hộp mực in laser HP 76A Black LaserJet Toner Cartridge (CF276A - Dùng cho HP M404, M428)",
    category: "Mực In",
    dvt: "Hộp",
    defaultBh: 0
  },
  "Canon LBP246dw II": {
    standardModel: "Canon LBP 246dw II",
    brand: "Canon",
    fullTen: "Máy in laser đen trắng Canon LBP246dw II (In 2 mặt, Wifi/LAN, 40 trang/phút)",
    category: "Máy In",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Chuột LM103": {
    standardModel: "DAREU LM103",
    brand: "DAREU",
    fullTen: "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    category: "Chuột, Bàn Phím",
    dvt: "Chiếc",
    defaultBh: 24
  },
  "Bàn phím LK185": {
    standardModel: "DAREU LK185",
    brand: "DAREU",
    fullTen: "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    category: "Chuột, Bàn Phím",
    dvt: "Chiếc",
    defaultBh: 24
  },
  "Lenovo ThinkPad E14 GEN 7": {
    standardModel: "Lenovo ThinkPad E14 Gen 7",
    brand: "Lenovo",
    fullTen: "Laptop Lenovo ThinkPad E14 Gen 7 (Intel Core Ultra 7 256V / 16GB / 512GB SSD / 14 inch WUXGA / Vỏ nhôm)",
    category: "Laptop",
    dvt: "Chiếc",
    defaultBh: 24
  },
  "DAHUA DHI-LM22-A210Y": {
    standardModel: "Dahua DHI-LM22-A210Y",
    brand: "Dahua",
    fullTen: "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    category: "Màn Hình",
    dvt: "Chiếc",
    defaultBh: 24
  },
  "Nguồn máy tính AIGO VK550, CST 550W,": {
    standardModel: "AIGO VK550 550W",
    brand: "AIGO",
    fullTen: "Nguồn máy tính AIGO VK550 (Công suất thực 550W, Quạt tản nhiệt 12cm)",
    category: "Nguồn Máy Tính",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "Vỏ case Darkflash A290 Black": {
    standardModel: "Darkflash A290 Black",
    brand: "Darkflash",
    fullTen: "Vỏ case máy tính Darkflash A290 Black (Kèm 3 Quạt LED, Mặt lưới thoáng khí, Form ATX)",
    category: "Vỏ Máy Tính",
    dvt: "Chiếc",
    defaultBh: 12
  },
  "Ram PC Hiksemi Armor 16GB DDR4 bus 3200Mhz": {
    standardModel: "RAM Hiksemi Armor 16GB DDR4",
    brand: "Hiksemi",
    fullTen: "Bộ nhớ trong RAM PC Hiksemi Armor 16GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    category: "Bộ Nhớ Trong (RAM)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "Mainboard DarkFlash H610M": {
    standardModel: "Darkflash H610M-VGD-V1",
    brand: "Darkflash",
    fullTen: "Bo mạch chủ Mainboard DarkFlash H610M-VGD-V1 (Chipset H610, Socket LGA1700, 2xDDR4, Khe M.2 NVMe)",
    category: "Bo Mạch Chủ (Mainboard)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "Bộ vi xử lý Intel Core i5-12400": {
    standardModel: "Intel Core i5-12400",
    brand: "Intel",
    fullTen: "Bộ vi xử lý CPU Intel Core i5-12400 (2.5GHz Turbo 4.4GHz, 6 Nhân 12 Luồng, 18MB Cache, Socket LGA1700)",
    category: "Bộ Vi Xử Lý (CPU)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "VGA MSI GeForce RTX 3050": {
    standardModel: "MSI GeForce RTX 3050 Ventus 2X",
    brand: "MSI",
    fullTen: "Card màn hình VGA MSI GeForce RTX 3050 VENTUS 2X 8G OC (8GB GDDR6, 128-bit)",
    category: "Card Màn Hình (VGA)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "SSD CUSU 512GB": {
    standardModel: "SSD CUSU 512GB NVMe",
    brand: "CUSU",
    fullTen: "Ổ cứng thể rắn SSD CUSU 512GB M.2 2280 NVMe PCIe Gen3x4 (Tốc độ đọc 3500MB/s - Ghi 2500MB/s)",
    category: "Ổ Cứng (SSD)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "SSD Kingston KC600 512": {
    standardModel: "SSD Kingston KC600 512GB",
    brand: "Kingston",
    fullTen: "Ổ cứng thể rắn SSD Kingston KC600 512GB 2.5 inch SATA3 (Tốc độ đọc 550MB/s - Ghi 520MB/s)",
    category: "Ổ Cứng (SSD)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "i3-12100": {
    standardModel: "Intel Core i3-12100",
    brand: "Intel",
    fullTen: "Bộ vi xử lý CPU Intel Core i3-12100 (3.3GHz Turbo 4.3GHz, 4 Nhân 8 Luồng, 12MB Cache, Socket LGA1700)",
    category: "Bộ Vi Xử Lý (CPU)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "Ram PC Hiksemi Armor 8GB DDR4": {
    standardModel: "RAM Hiksemi Armor 8GB DDR4",
    brand: "Hiksemi",
    fullTen: "Bộ nhớ trong RAM PC Hiksemi Armor 8GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    category: "Bộ Nhớ Trong (RAM)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "SSD Hiksemi  256GB": {
    standardModel: "SSD Hiksemi Wave 256GB",
    brand: "Hiksemi",
    fullTen: "Ổ cứng thể rắn SSD Hiksemi Wave 256GB M.2 2280 NVMe PCIe (HS-SSD-WAVE(S) 256GB)",
    category: "Ổ Cứng (SSD)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "Nguồn máy tính AIGO VK350   350W": {
    standardModel: "AIGO VK350 350W",
    brand: "AIGO",
    fullTen: "Nguồn máy tính AIGO VK350 (Công suất thực 350W, Quạt làm mát 12cm)",
    category: "Nguồn Máy Tính",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "HDD WD 1TB 3.5\" Sata3, màu xanh": {
    standardModel: "HDD WD Blue 1TB",
    brand: "Western Digital",
    fullTen: "Ổ cứng HDD Western Digital Blue 1TB 3.5 inch SATA3 64MB Cache 5400RPM (WD10EARZ)",
    category: "Ổ Cứng (HDD)",
    dvt: "Chiếc",
    defaultBh: 24
  },
  "HDD WD 1TB 3.5&quot; Sata3, màu xanh": {
    standardModel: "HDD WD Blue 1TB",
    brand: "Western Digital",
    fullTen: "Ổ cứng HDD Western Digital Blue 1TB 3.5 inch SATA3 64MB Cache 5400RPM (WD10EARZ)",
    category: "Ổ Cứng (HDD)",
    dvt: "Chiếc",
    defaultBh: 24
  },
  "HDD 8GB": {
    standardModel: "HDD Seagate SkyHawk 8TB",
    brand: "Seagate",
    fullTen: "Ổ cứng HDD chuyên dụng camera/máy chủ Seagate SkyHawk 8TB 3.5 inch SATA3 (ST8000VX004)",
    category: "Ổ Cứng (HDD)",
    dvt: "Chiếc",
    defaultBh: 36
  },
  "Bộ mở rộng HDMI qua dây LAN": {
    standardModel: "Jasonz T-G183",
    brand: "Jasonz",
    fullTen: "Bộ mở rộng tín hiệu HDMI qua LAN 150m có KVM (Jasonz T-G183)",
    category: "Thiết Bị Mạng & Kết Nối",
    dvt: "Bộ",
    defaultBh: 12
  }
};

// Helper: Tra cứu Model chuẩn hóa
function getStandardModel(rawModel) {
  if (!rawModel) return '';
  const trimmed = rawModel.trim();
  if (CATALOG_MAPPING[trimmed]) {
    return CATALOG_MAPPING[trimmed].standardModel;
  }
  // Thử bỏ khoảng trắng thừa
  const normalized = trimmed.replace(/\s+/g, ' ');
  for (const k of Object.keys(CATALOG_MAPPING)) {
    if (k.replace(/\s+/g, ' ') === normalized) {
      return CATALOG_MAPPING[k].standardModel;
    }
  }
  return trimmed;
}

// Bảng danh mục sản phẩm chuẩn hóa
const standardizedProducts = db['DM_SAN_PHAM'].rows.map(p => {
  const rawModel = p['Model'].trim();
  const info = CATALOG_MAPPING[rawModel] || {
    standardModel: rawModel,
    brand: "Chính Hãng",
    fullTen: p['Tên hàng hóa'] || rawModel,
    category: p['Nhóm hàng'] || "Linh Kiện Máy Tính",
    dvt: "Chiếc",
    defaultBh: 12
  };

  const stdModel = info.standardModel || rawModel;

  return {
    productId: stdModel,
    model: stdModel,
    rawModel: rawModel,
    ten: info.fullTen,
    name: info.fullTen,
    brand: info.brand,
    hang: info.brand,
    category: info.category,
    nhom: info.category,
    nhomHang: info.category,
    dvt: info.dvt,
    defaultBh: info.defaultBh,
    manageSerial: info.defaultBh > 0,
    active: true,
    ghiChu: "Chuẩn hóa từ CSDL cũ Thành An ERP"
  };
});

// =========================================================================
// 2. CHUẨN HÓA DANH MỤC NHÀ CUNG CẤP (DM_NCC)
// =========================================================================
const standardizedSuppliers = db['DM_NCC'].rows.map(n => {
  const code = (n['Tên viết tắt'] || '').trim();
  const name = (n['Tên đầy đủ công ty'] || code).trim();
  const phone = cleanPhone(n['Số điện thoại']);
  const address = (n['Địa chỉ / Ghi chú'] || '').trim();

  return {
    supplierId: code,
    code: code,
    tenTat: code,
    name: name,
    tenDayDu: name,
    phone: phone,
    sdt: phone,
    email: "",
    diaChi: address,
    nguoiLienHe: "",
    mst: "",
    active: true,
    ghiChu: ""
  };
});

// =========================================================================
// 3. CHUẨN HÓA DANH MỤC KHÁCH HÀNG (DM_KHACH_HANG) - LÀM SẠCH & GỘP TRÙNG
// =========================================================================
const rawKhList = db['DM_KHACH_HANG'].rows;
const customerMap = new Map();

rawKhList.forEach(k => {
  let name = (k['Tên Khách hàng'] || '').trim();
  let rawPhone = (k['Số điện thoại'] || '').trim();
  let address = (k['Địa chỉ'] || '').trim();
  let note = (k['Ghi chú'] || '').trim();

  if (rawPhone.includes('-')) {
    const parts = rawPhone.split('-');
    rawPhone = parts[0].trim();
    if (!note) note = parts.slice(1).join('-').trim();
  }

  if (name.includes('Số L3-125')) {
    name = "Mr. Đỉnh";
    rawPhone = "0969898168";
    address = "Số L3-125 đường Limoni, Khu đô thị New An Thới, Đặc khu Phú Quốc, Tỉnh An Giang";
  }

  const phone = cleanPhone(rawPhone);
  const key = phone || name.toLowerCase();
  if (!customerMap.has(key)) {
    customerMap.set(key, {
      customerId: 'KH_' + (customerMap.size + 1).toString().padStart(3, '0'),
      name: name,
      ten: name,
      phone: phone,
      sdt: phone,
      diaChi: address,
      address: address,
      ghiChu: note,
      active: true
    });
  } else {
    const exist = customerMap.get(key);
    if (!exist.diaChi && address) exist.diaChi = address;
    if (!exist.ghiChu && note) exist.ghiChu = note;
  }
});

const standardizedCustomers = [...customerMap.values()];

// =========================================================================
// 4. CHUẨN HÓA SỔ KHO THIẾT BỊ (DATA_THIET_BI / SERIAL_MASTER) & XỬ LÝ ĐỐI SOÁT
// =========================================================================
let internalIdCounter = 1;
const standardizedSerials = db['DATA_THIET_BI'].rows.map((r, idx) => {
  let sn = cleanSerial(r['Serial']);
  const rawModel = (r['Model'] || '').trim();
  const stdModel = getStandardModel(rawModel);
  const prodInfo = CATALOG_MAPPING[rawModel] || {};

  const rawStatus = (r['Trạng thái'] || '').trim();
  const isSold = (rawStatus === 'Đã xuất' || rawStatus === 'SOLD');
  const status = isSold ? 'SOLD' : 'IN_STOCK';

  let kho = (r['Vị trí kho'] || '').trim();
  if (kho === 'Văn Phòng' || !kho) kho = 'Kho VP';

  let rawKhach = (r['Khách hàng'] || '').trim();
  let rawSdt = (r['SĐT Khách'] || '').trim();
  if (rawKhach.includes('Số L3-125')) {
    rawKhach = 'Mr. Đỉnh';
    rawSdt = '0969898168';
  }
  const sdtKhach = cleanPhone(rawSdt);

  const ngayNhap = excelDateToDateStr(r['Ngày nhập']);
  const ngayXuat = isSold ? excelDateToDateStr(r['Ngày xuất']) : '';
  const hanBh = isSold ? excelDateToDateStr(r['Ngày hết hạn BH']) : '';
  const soThangBh = parseInt(r['Số tháng BH'], 10) || prodInfo.defaultBh || 12;

  let maPhieuNhap = r['Mã phiếu nhập'] || '';
  let ncc = r['Nhà cung cấp'] || 'N/A';

  // XỬ LÝ ĐỐI SOÁT XUNG ĐỘT 2: Serial VNM0WW42908 gán chuẩn về PN-260912-083643 (NCC để N/A theo yêu cầu)
  if (sn === 'VNM0WW42908') {
    maPhieuNhap = 'PN-260912-083643';
    ncc = 'N/A';
  }

  // XỬ LÝ ĐỐI SOÁT XUNG ĐỘT 1: 2 Serial VNM0W42889 & VNM0W40960 chuẩn về HP LaserJet M211dw
  if (sn === 'VNM0W42889' || sn === 'VNM0W40960') {
    maPhieuNhap = 'PN-260915-171953';
  }

  const internalId = `TA-${String(internalIdCounter++).padStart(3, '0')}`;

  const item = {
    serial: sn,
    internalId: internalId,
    model: stdModel,
    tenHang: prodInfo.fullTen || r['Tên hàng hóa'] || stdModel,
    nhomHang: prodInfo.category || r['Nhóm hàng'] || 'Linh Kiện',
    loaiHang: r['Loại hàng'] || 'Chính Hãng',
    kho: kho,
    ncc: ncc,
    ngayNhap: ngayNhap,
    maPhieuNhap: maPhieuNhap,
    status: status,
    ngayXuat: ngayXuat,
    maPhieuXuat: isSold ? (r['Mã phiếu xuất'] || '') : '',
    khachHang: isSold ? rawKhach : '',
    sdtKhach: isSold ? sdtKhach : '',
    soThangBh: soThangBh,
    ngayHetHanBh: hanBh,
    ghiChu: r['Ghi chú'] || '',
    timeline: [
      {
        date: `${ngayNhap} 08:00:00`,
        user: 'admin',
        action: 'Nhập kho',
        note: `Nhập kho theo phiếu ${maPhieuNhap} từ ${ncc}`
      }
    ]
  };

  if (isSold) {
    item.timeline.unshift({
      date: `${ngayXuat} 09:30:00`,
      user: 'admin',
      action: 'Xuất kho',
      note: `Xuất bán theo phiếu ${r['Mã phiếu xuất']} cho ${rawKhach} (SĐT: ${sdtKhach}). Hạn BH: ${hanBh}`
    });
  }

  return item;
});

// =========================================================================
// 5. CHUẨN HÓA LỊCH SỬ NHẬP (LICH_SU_NHAP) - TỰ ĐỘNG XỬ LÝ XUNG ĐỘT
// =========================================================================
const standardizedNhapVouchers = [];

db['LICH_SU_NHAP'].rows.forEach(n => {
  const ma = n['Mã phiếu'].trim();

  // ĐỐI SOÁT XUNG ĐỘT 1: Loại bỏ phiếu nháp nhập nhầm PN-260911-141121 (Canon LBP121dn với serial HP)
  if (ma === 'PN-260911-141121') {
    console.log(`[ĐỐI SOÁT] Đã loại bỏ phiếu nháp nhập nhầm: ${ma}`);
    return;
  }

  // ĐỐI SOÁT XUNG ĐỘT 2: Loại bỏ phiếu lặp 2 phút PN-260912-083809 (giữ lại phiếu chính thức PN-260912-083643 từ FPS)
  if (ma === 'PN-260912-083809') {
    console.log(`[ĐỐI SOÁT] Đã loại bỏ phiếu lặp trùng lặp: ${ma}`);
    return;
  }

  const ngay = excelDateToDateStr(n['Ngày nhập']);
  let ncc = (n['Nhà cung cấp'] || 'N/A').trim();
  if (ma === 'PN-260912-083643') {
    ncc = 'N/A';
  }
  let rawModel = (n['Model'] || '').trim();
  let qty = parseFloat(n['Số lượng']) || 0;
  let kho = (n['Vị trí kho'] || 'Kho VP').trim();
  if (kho === 'Văn Phòng') kho = 'Kho VP';

  let rawSnList = String(n['Danh sách Serial'] || '').split(/[\n,;]+/).map(s => cleanSerial(s)).filter(Boolean);

  // ĐỐI SOÁT XUNG ĐỘT 3: Phiếu PN-260915-171953
  // Khổng Mạnh Cường đã xóa máy VNM0W12908 khỏi kho vào 15/09/2026 (theo NHAT_KY_HOAT_DONG),
  // Do đó phiếu chính thức giữ đúng 2 máy thực xuất: VNM0W42889 và VNM0W40960.
  if (ma === 'PN-260915-171953') {
    rawSnList = ['VNM0W42889', 'VNM0W40960'];
    qty = 2;
    console.log(`[ĐỐI SOÁT] Đã cân bằng số lượng phiếu ${ma}: số lượng = 2, serials = ${rawSnList.join(', ')}`);
  }

  // Chuẩn hóa tên Model hiển thị trên phiếu nhập
  // Dạng: "Canon LBP 6030w (5)"
  const modelMatch = rawModel.match(/^(.*?)(?:\s*\((\d+)\))?$/);
  let baseModel = modelMatch ? modelMatch[1].trim() : rawModel;
  let stdBaseModel = getStandardModel(baseModel);
  let stdModelStr = `${stdBaseModel} (${qty || rawSnList.length})`;

  standardizedNhapVouchers.push({
    maPhieu: ma,
    ngay: ngay,
    createdAt: `${ngay} 08:00:00`,
    updatedAt: '',
    updatedBy: '',
    ncc: ncc,
    kho: kho,
    model: stdModelStr,
    soLuong: qty,
    status: 'CONFIRMED',
    nguoiTao: 'Khổng Mạnh Cường',
    ghiChu: n['Ghi chú'] || 'Phiếu nhập kho Thành An ERP',
    items: rawSnList.map(sn => {
      const match = standardizedSerials.find(s => s.serial === sn);
      return {
        serial: sn,
        internalId: match ? match.internalId : '',
        model: match ? match.model : stdBaseModel,
        loaiHang: 'Chính Hãng'
      };
    }),
    history: [
      { time: `${ngay} 08:00:00`, user: 'Khổng Mạnh Cường', action: 'TẠO PHIẾU', note: `Nhập kho từ ${ncc}` }
    ]
  });
});

// =========================================================================
// 6. CHUẨN HÓA LỊCH SỬ XUẤT (LICH_SU_XUAT)
// =========================================================================
const standardizedXuatVouchers = db['LICH_SU_XUAT'].rows.map(x => {
  const ma = x['Mã phiếu'].trim();
  const ngay = excelDateToDateStr(x['Ngày xuất']);
  let rawKhach = (x['Khách hàng'] || '').trim();
  let sdt = '';

  const phoneMatch = rawKhach.match(/\(([^)]+)\)/);
  if (phoneMatch) {
    sdt = cleanPhone(phoneMatch[1]);
    rawKhach = rawKhach.replace(/\([^)]+\)/, '').trim();
  }
  if (rawKhach.includes('Số L3-125')) {
    rawKhach = 'Mr. Đỉnh';
    sdt = '0969898168';
  }

  const rawSnList = String(x['Danh sách Serial'] || '').split(/[\n,;]+/).map(s => cleanSerial(s)).filter(Boolean);
  const qty = parseFloat(x['Số lượng']) || rawSnList.length;

  let rawModelStr = (x['Model'] || '').trim();
  let stdModelStr = rawModelStr;
  if (rawModelStr) {
    // Nếu là combo: replace từng thành phần
    stdModelStr = rawModelStr.split('+').map(part => {
      const m = part.trim().match(/^(.*?)(?:\s*\((\d+)\))?$/);
      if (m) {
        const bm = m[1].trim();
        const count = m[2] ? ` (${m[2]})` : '';
        return `${getStandardModel(bm)}${count}`;
      }
      return part.trim();
    }).join(' + ');
  }

  return {
    maPhieu: ma,
    ngay: ngay,
    createdAt: `${ngay} 09:30:00`,
    updatedAt: '',
    updatedBy: '',
    khachHang: rawKhach,
    sdtKhach: sdt,
    diaChi: '',
    kho: 'Kho VP',
    model: stdModelStr,
    status: 'CONFIRMED',
    nguoiTao: 'Khổng Mạnh Cường',
    ghiChu: x['Ghi chú'] || 'Phiếu xuất kho bán hàng',
    items: rawSnList.map(sn => {
      const match = standardizedSerials.find(s => s.serial === sn);
      return {
        model: match ? match.model : getStandardModel(rawModelStr),
        serial: sn,
        internalId: match ? match.internalId : '',
        soThangBh: match ? match.soThangBh : 12,
        ngayHetHanBh: match ? match.ngayHetHanBh : ''
      };
    }),
    history: [
      { time: `${ngay} 09:30:00`, user: 'Khổng Mạnh Cường', action: 'TẠO PHIẾU', note: `Xuất bán cho ${rawKhach}` }
    ]
  };
});

// =========================================================================
// 7. LƯU TẤT CẢ DỮ LIỆU ĐÃ CHUẨN HÓA VÀO JSON
// =========================================================================
const finalNormalizedDb = {
  metadata: {
    generatedAt: new Date().toISOString(),
    sourceFile: "THÀNH AN ERP - DATABASE (1).xlsx",
    totalProducts: standardizedProducts.length,
    totalSuppliers: standardizedSuppliers.length,
    totalCustomers: standardizedCustomers.length,
    totalSerials: standardizedSerials.length,
    inStockCount: standardizedSerials.filter(s => s.status === 'IN_STOCK').length,
    soldCount: standardizedSerials.filter(s => s.status === 'SOLD').length,
    totalNhapVouchers: standardizedNhapVouchers.length,
    totalXuatVouchers: standardizedXuatVouchers.length
  },
  products: standardizedProducts,
  suppliers: standardizedSuppliers,
  customers: standardizedCustomers,
  serials: standardizedSerials,
  vouchers: {
    nhap: standardizedNhapVouchers,
    xuat: standardizedXuatVouchers
  },
  auditLogs: db['NHAT_KY_HOAT_DONG'].rows.map((a, i) => ({
    time: excelDateToDateStr(a['Thời gian']) || '11/09/2026',
    user: a['Người thực hiện'] || 'admin',
    action: a['Hành động'] || 'CẬP NHẬT',
    target: a['Mã Serial'] || '',
    note: a['Chi tiết'] || '',
    module: 'Kho'
  }))
};

fs.writeFileSync(path.join(__dirname, 'standardized_data_ready.json'), JSON.stringify(finalNormalizedDb, null, 2), 'utf8');
console.log('===============================================================');
console.log('XUẤT DỮ LIỆU ĐÃ CHUẨN HÓA THÀNH CÔNG VÀO temp_migration/standardized_data_ready.json');
console.log('===============================================================');
console.log(`✓ Sản phẩm / Model:   ${standardizedProducts.length} model (đầy đủ Hãng SX, Model chuẩn kèm Tên Hãng)`);
console.log(`✓ Nhà cung cấp:       ${standardizedSuppliers.length} NCC`);
console.log(`✓ Khách hàng:         ${standardizedCustomers.length} khách hàng (đã làm sạch trùng lặp & SĐT)`);
console.log(`✓ Thiết bị (Serial):   ${standardizedSerials.length} máy (${finalNormalizedDb.metadata.inStockCount} Tồn kho, ${finalNormalizedDb.metadata.soldCount} Đã xuất)`);
console.log(`✓ Phiếu nhập:         ${standardizedNhapVouchers.length} phiếu (đã loại bỏ 2 phiếu nháp lặp và cân bằng số lượng)`);
console.log(`✓ Phiếu xuất:         ${standardizedXuatVouchers.length} phiếu`);
console.log(`✓ Nhật ký hoạt động:  ${finalNormalizedDb.auditLogs.length} logs`);
