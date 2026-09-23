<script>
  /* ==================================================== */
  /* 1. KHỞI TẠO DỮ LIỆU DANH MỤC & CẤU HÌNH (THÀNH AN ERP) */
  /* Dữ liệu thực tế đã chuẩn hóa từ CSDL cũ Thành An   */
  /* ==================================================== */

  // 1.1 HÃNG SẢN XUẤT (BRANDS)
  function normalizeBrand(b) {
    if (!b) return b;
    b.brandId = b.brandId || b.id || '';
    b.maHang = (b.maHang || b.code || '').toUpperCase();
    b.tenHang = b.tenHang || b.name || '';
    b.ghiChu = b.ghiChu !== undefined ? b.ghiChu : (b.note || '');
    b.active = b.active !== false;
    b.id = b.brandId;
    b.code = b.maHang;
    b.name = b.tenHang;
    b.note = b.ghiChu;
    return b;
  }

  let INITIAL_BRANDS = [
  {
    "brandId": "BR_01",
    "maHang": "AIGO",
    "tenHang": "AIGO",
    "name": "AIGO",
    "code": "AIGO",
    "ghiChu": "Hãng sản xuất AIGO",
    "active": true
  },
  {
    "brandId": "BR_02",
    "maHang": "BROTHER",
    "tenHang": "Brother",
    "name": "Brother",
    "code": "BROTHER",
    "ghiChu": "Hãng sản xuất Brother",
    "active": true
  },
  {
    "brandId": "BR_03",
    "maHang": "CUSU",
    "tenHang": "CUSU",
    "name": "CUSU",
    "code": "CUSU",
    "ghiChu": "Hãng sản xuất CUSU",
    "active": true
  },
  {
    "brandId": "BR_04",
    "maHang": "CANON",
    "tenHang": "Canon",
    "name": "Canon",
    "code": "CANON",
    "ghiChu": "Hãng sản xuất Canon",
    "active": true
  },
  {
    "brandId": "BR_05",
    "maHang": "DAREU",
    "tenHang": "DAREU",
    "name": "DAREU",
    "code": "DAREU",
    "ghiChu": "Hãng sản xuất DAREU",
    "active": true
  },
  {
    "brandId": "BR_06",
    "maHang": "DAHUA",
    "tenHang": "Dahua",
    "name": "Dahua",
    "code": "DAHUA",
    "ghiChu": "Hãng sản xuất Dahua",
    "active": true
  },
  {
    "brandId": "BR_07",
    "maHang": "DARKFLASH",
    "tenHang": "Darkflash",
    "name": "Darkflash",
    "code": "DARKFLASH",
    "ghiChu": "Hãng sản xuất Darkflash",
    "active": true
  },
  {
    "brandId": "BR_08",
    "maHang": "HP",
    "tenHang": "HP",
    "name": "HP",
    "code": "HP",
    "ghiChu": "Hãng sản xuất HP",
    "active": true
  },
  {
    "brandId": "BR_09",
    "maHang": "HALLOYA",
    "tenHang": "Halloya",
    "name": "Halloya",
    "code": "HALLOYA",
    "ghiChu": "Hãng sản xuất Halloya",
    "active": true
  },
  {
    "brandId": "BR_10",
    "maHang": "HIKSEMI",
    "tenHang": "Hiksemi",
    "name": "Hiksemi",
    "code": "HIKSEMI",
    "ghiChu": "Hãng sản xuất Hiksemi",
    "active": true
  },
  {
    "brandId": "BR_11",
    "maHang": "INTEL",
    "tenHang": "Intel",
    "name": "Intel",
    "code": "INTEL",
    "ghiChu": "Hãng sản xuất Intel",
    "active": true
  },
  {
    "brandId": "BR_12",
    "maHang": "JASONZ",
    "tenHang": "Jasonz",
    "name": "Jasonz",
    "code": "JASONZ",
    "ghiChu": "Hãng sản xuất Jasonz",
    "active": true
  },
  {
    "brandId": "BR_13",
    "maHang": "KINGSTON",
    "tenHang": "Kingston",
    "name": "Kingston",
    "code": "KINGSTON",
    "ghiChu": "Hãng sản xuất Kingston",
    "active": true
  },
  {
    "brandId": "BR_14",
    "maHang": "LENOVO",
    "tenHang": "Lenovo",
    "name": "Lenovo",
    "code": "LENOVO",
    "ghiChu": "Hãng sản xuất Lenovo",
    "active": true
  },
  {
    "brandId": "BR_15",
    "maHang": "MSI",
    "tenHang": "MSI",
    "name": "MSI",
    "code": "MSI",
    "ghiChu": "Hãng sản xuất MSI",
    "active": true
  },
  {
    "brandId": "BR_16",
    "maHang": "SEAGATE",
    "tenHang": "Seagate",
    "name": "Seagate",
    "code": "SEAGATE",
    "ghiChu": "Hãng sản xuất Seagate",
    "active": true
  },
  {
    "brandId": "BR_17",
    "maHang": "TJ_INK",
    "tenHang": "TJ INK",
    "name": "TJ INK",
    "code": "TJ_INK",
    "ghiChu": "Hãng sản xuất TJ INK",
    "active": true
  },
  {
    "brandId": "BR_18",
    "maHang": "WESTERN_DIGITAL",
    "tenHang": "Western Digital",
    "name": "Western Digital",
    "code": "WESTERN_DIGITAL",
    "ghiChu": "Hãng sản xuất Western Digital",
    "active": true
  }
].map(normalizeBrand);

  // 1.2 NHÓM HÀNG (CATEGORIES)
  function normalizeCategory(c) {
    if (!c) return c;
    c.catId = c.catId || c.id || '';
    c.maNhom = (c.maNhom || c.code || '').toUpperCase();
    c.tenNhom = c.tenNhom || c.name || '';
    c.ghiChu = c.ghiChu !== undefined ? c.ghiChu : (c.note || '');
    c.active = c.active !== false;
    c.id = c.catId;
    c.code = c.maNhom;
    c.name = c.tenNhom;
    c.note = c.ghiChu;
    return c;
  }

  let INITIAL_CATEGORIES = [
  {
    "catId": "CAT_01",
    "maNhom": "CAT_01",
    "tenNhom": "Bo Mạch Chủ (Mainboard)",
    "name": "Bo Mạch Chủ (Mainboard)",
    "code": "CAT_01",
    "ghiChu": "Nhóm hàng hóa Bo Mạch Chủ (Mainboard)",
    "active": true
  },
  {
    "catId": "CAT_02",
    "maNhom": "CAT_02",
    "tenNhom": "Bộ Nhớ Trong (RAM)",
    "name": "Bộ Nhớ Trong (RAM)",
    "code": "CAT_02",
    "ghiChu": "Nhóm hàng hóa Bộ Nhớ Trong (RAM)",
    "active": true
  },
  {
    "catId": "CAT_03",
    "maNhom": "CAT_03",
    "tenNhom": "Bộ Vi Xử Lý (CPU)",
    "name": "Bộ Vi Xử Lý (CPU)",
    "code": "CAT_03",
    "ghiChu": "Nhóm hàng hóa Bộ Vi Xử Lý (CPU)",
    "active": true
  },
  {
    "catId": "CAT_04",
    "maNhom": "CAT_04",
    "tenNhom": "Card Màn Hình (VGA)",
    "name": "Card Màn Hình (VGA)",
    "code": "CAT_04",
    "ghiChu": "Nhóm hàng hóa Card Màn Hình (VGA)",
    "active": true
  },
  {
    "catId": "CAT_05",
    "maNhom": "CAT_05",
    "tenNhom": "Chuột, Bàn Phím",
    "name": "Chuột, Bàn Phím",
    "code": "CAT_05",
    "ghiChu": "Nhóm hàng hóa Chuột, Bàn Phím",
    "active": true
  },
  {
    "catId": "CAT_06",
    "maNhom": "CAT_06",
    "tenNhom": "Laptop",
    "name": "Laptop",
    "code": "CAT_06",
    "ghiChu": "Nhóm hàng hóa Laptop",
    "active": true
  },
  {
    "catId": "CAT_07",
    "maNhom": "CAT_07",
    "tenNhom": "Màn Hình",
    "name": "Màn Hình",
    "code": "CAT_07",
    "ghiChu": "Nhóm hàng hóa Màn Hình",
    "active": true
  },
  {
    "catId": "CAT_08",
    "maNhom": "CAT_08",
    "tenNhom": "Máy In",
    "name": "Máy In",
    "code": "CAT_08",
    "ghiChu": "Nhóm hàng hóa Máy In",
    "active": true
  },
  {
    "catId": "CAT_09",
    "maNhom": "CAT_09",
    "tenNhom": "Máy Scan",
    "name": "Máy Scan",
    "code": "CAT_09",
    "ghiChu": "Nhóm hàng hóa Máy Scan",
    "active": true
  },
  {
    "catId": "CAT_10",
    "maNhom": "CAT_10",
    "tenNhom": "Mực In",
    "name": "Mực In",
    "code": "CAT_10",
    "ghiChu": "Nhóm hàng hóa Mực In",
    "active": true
  },
  {
    "catId": "CAT_11",
    "maNhom": "CAT_11",
    "tenNhom": "Nguồn Máy Tính",
    "name": "Nguồn Máy Tính",
    "code": "CAT_11",
    "ghiChu": "Nhóm hàng hóa Nguồn Máy Tính",
    "active": true
  },
  {
    "catId": "CAT_12",
    "maNhom": "CAT_12",
    "tenNhom": "Thiết Bị Mạng & Kết Nối",
    "name": "Thiết Bị Mạng & Kết Nối",
    "code": "CAT_12",
    "ghiChu": "Nhóm hàng hóa Thiết Bị Mạng & Kết Nối",
    "active": true
  },
  {
    "catId": "CAT_13",
    "maNhom": "CAT_13",
    "tenNhom": "Vỏ Máy Tính",
    "name": "Vỏ Máy Tính",
    "code": "CAT_13",
    "ghiChu": "Nhóm hàng hóa Vỏ Máy Tính",
    "active": true
  },
  {
    "catId": "CAT_14",
    "maNhom": "CAT_14",
    "tenNhom": "Ổ Cứng (HDD)",
    "name": "Ổ Cứng (HDD)",
    "code": "CAT_14",
    "ghiChu": "Nhóm hàng hóa Ổ Cứng (HDD)",
    "active": true
  },
  {
    "catId": "CAT_15",
    "maNhom": "CAT_15",
    "tenNhom": "Ổ Cứng (SSD)",
    "name": "Ổ Cứng (SSD)",
    "code": "CAT_15",
    "ghiChu": "Nhóm hàng hóa Ổ Cứng (SSD)",
    "active": true
  }
].map(normalizeCategory);

  // 1.3 DANH MỤC SẢN PHẨM / MODEL (CHUẨN HÓA ĐẦY ĐỦ MODEL & TÊN THIẾT BỊ)
  let INITIAL_PRODUCTS = [
  {
    "productId": "HP LaserJet Pro 4003dw",
    "model": "HP LaserJet Pro 4003dw",
    "rawModel": "HP Laserjet Pro 4003dw",
    "ten": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "name": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "brand": "HP",
    "hang": "HP",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "HP Laser 108a",
    "model": "HP Laser 108a",
    "rawModel": "HP Laser 108a",
    "ten": "Máy in laser đen trắng đơn năng HP Laser 108a (USB 2.0)",
    "name": "Máy in laser đen trắng đơn năng HP Laser 108a (USB 2.0)",
    "brand": "HP",
    "hang": "HP",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Canon LBP 6030w",
    "model": "Canon LBP 6030w",
    "rawModel": "Canon LBP 6030w",
    "ten": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "name": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "brand": "CANON",
    "hang": "CANON",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Canon LBP 6030",
    "model": "Canon LBP 6030",
    "rawModel": "Canon LBP 6030",
    "ten": "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    "name": "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    "brand": "CANON",
    "hang": "CANON",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "HP LaserJet M211dw",
    "model": "HP LaserJet M211dw",
    "rawModel": "Hp Laserjet M211DW",
    "ten": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "name": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "brand": "HP",
    "hang": "HP",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Canon PIXMA G2010",
    "model": "Canon PIXMA G2010",
    "rawModel": "Canon G2010",
    "ten": "Máy in phun màu đa năng Canon PIXMA G2010 (In, Scan, Copy)",
    "name": "Máy in phun màu đa năng Canon PIXMA G2010 (In, Scan, Copy)",
    "brand": "CANON",
    "hang": "CANON",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Brother ADS-4300DN",
    "model": "Brother ADS-4300DN",
    "rawModel": "Brother ADS-4300DN",
    "ten": "Máy quét tài liệu chuyên dụng tốc độ cao Brother ADS-4300DN (LAN/USB)",
    "name": "Máy quét tài liệu chuyên dụng tốc độ cao Brother ADS-4300DN (LAN/USB)",
    "brand": "BROTHER",
    "hang": "BROTHER",
    "category": "Máy Scan",
    "nhom": "Máy Scan",
    "nhomHang": "Máy Scan",
    "dvt": "Chiếc",
    "defaultBh": 24,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Canon LBP 121dn",
    "model": "Canon LBP 121dn",
    "rawModel": "Canon LBP121dn",
    "ten": "Máy in laser đen trắng Canon LBP 121dn (In 2 mặt, Kết nối LAN)",
    "name": "Máy in laser đen trắng Canon LBP 121dn (In 2 mặt, Kết nối LAN)",
    "brand": "CANON",
    "hang": "CANON",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "HP Laser 108w",
    "model": "HP Laser 108w",
    "rawModel": "HP 108W",
    "ten": "Máy in laser đen trắng đơn năng HP Laser 108w (Kết nối Wifi)",
    "name": "Máy in laser đen trắng đơn năng HP Laser 108w (Kết nối Wifi)",
    "brand": "HP",
    "hang": "HP",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Canon LBP 243dw II",
    "model": "Canon LBP 243dw II",
    "rawModel": "Canon LBP 243dw II",
    "ten": "Máy in laser đen trắng Canon LBP243dw II (Tốc độ cao, In 2 mặt, Wifi/LAN)",
    "name": "Máy in laser đen trắng Canon LBP243dw II (Tốc độ cao, In 2 mặt, Wifi/LAN)",
    "brand": "CANON",
    "hang": "CANON",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Halloya 85A/325 Toner",
    "model": "Halloya 85A/325 Toner",
    "rawModel": "Halloya",
    "ten": "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    "name": "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    "brand": "HALLOYA",
    "hang": "HALLOYA",
    "category": "Mực In",
    "nhom": "Mực In",
    "nhomHang": "Mực In",
    "dvt": "Hộp",
    "defaultBh": 0,
    "manageSerial": false,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "TJ INK Toner Cartridge",
    "model": "TJ INK Toner Cartridge",
    "rawModel": "TJ INK",
    "ten": "Hộp mực in tương thích cao cấp TJ INK (Dùng cho máy in Canon/HP)",
    "name": "Hộp mực in tương thích cao cấp TJ INK (Dùng cho máy in Canon/HP)",
    "brand": "TJ INK",
    "hang": "TJ INK",
    "category": "Mực In",
    "nhom": "Mực In",
    "nhomHang": "Mực In",
    "dvt": "Hộp",
    "defaultBh": 0,
    "manageSerial": false,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "HP 76A Toner Cartridge",
    "model": "HP 76A Toner Cartridge",
    "rawModel": "76A",
    "ten": "Hộp mực in laser HP 76A Black LaserJet Toner Cartridge (CF276A - Dùng cho HP M404, M428)",
    "name": "Hộp mực in laser HP 76A Black LaserJet Toner Cartridge (CF276A - Dùng cho HP M404, M428)",
    "brand": "HP",
    "hang": "HP",
    "category": "Mực In",
    "nhom": "Mực In",
    "nhomHang": "Mực In",
    "dvt": "Hộp",
    "defaultBh": 0,
    "manageSerial": false,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Canon LBP 246dw II",
    "model": "Canon LBP 246dw II",
    "rawModel": "Canon LBP246dw II",
    "ten": "Máy in laser đen trắng Canon LBP246dw II (In 2 mặt, Wifi/LAN, 40 trang/phút)",
    "name": "Máy in laser đen trắng Canon LBP246dw II (In 2 mặt, Wifi/LAN, 40 trang/phút)",
    "brand": "CANON",
    "hang": "CANON",
    "category": "Máy In",
    "nhom": "Máy In",
    "nhomHang": "Máy In",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "DAREU LM103",
    "model": "DAREU LM103",
    "rawModel": "Chuột LM103",
    "ten": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "name": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "brand": "DAREU",
    "hang": "DAREU",
    "category": "Chuột, Bàn Phím",
    "nhom": "Chuột, Bàn Phím",
    "nhomHang": "Chuột, Bàn Phím",
    "dvt": "Chiếc",
    "defaultBh": 24,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "DAREU LK185",
    "model": "DAREU LK185",
    "rawModel": "Bàn phím LK185",
    "ten": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "name": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "brand": "DAREU",
    "hang": "DAREU",
    "category": "Chuột, Bàn Phím",
    "nhom": "Chuột, Bàn Phím",
    "nhomHang": "Chuột, Bàn Phím",
    "dvt": "Chiếc",
    "defaultBh": 24,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Lenovo ThinkPad E14 Gen 7",
    "model": "Lenovo ThinkPad E14 Gen 7",
    "rawModel": "Lenovo ThinkPad E14 GEN 7",
    "ten": "Laptop Lenovo ThinkPad E14 Gen 7 (Intel Core Ultra 7 256V / 16GB / 512GB SSD / 14 inch WUXGA / Vỏ nhôm)",
    "name": "Laptop Lenovo ThinkPad E14 Gen 7 (Intel Core Ultra 7 256V / 16GB / 512GB SSD / 14 inch WUXGA / Vỏ nhôm)",
    "brand": "LENOVO",
    "hang": "LENOVO",
    "category": "Laptop",
    "nhom": "Laptop",
    "nhomHang": "Laptop",
    "dvt": "Chiếc",
    "defaultBh": 24,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Dahua DHI-LM22-A210Y",
    "model": "Dahua DHI-LM22-A210Y",
    "rawModel": "DAHUA DHI-LM22-A210Y",
    "ten": "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    "name": "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    "brand": "DAHUA",
    "hang": "DAHUA",
    "category": "Màn Hình",
    "nhom": "Màn Hình",
    "nhomHang": "Màn Hình",
    "dvt": "Chiếc",
    "defaultBh": 24,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "AIGO VK550 550W",
    "model": "AIGO VK550 550W",
    "rawModel": "Nguồn máy tính AIGO VK550, CST 550W,",
    "ten": "Nguồn máy tính AIGO VK550 (Công suất thực 550W, Quạt tản nhiệt 12cm)",
    "name": "Nguồn máy tính AIGO VK550 (Công suất thực 550W, Quạt tản nhiệt 12cm)",
    "brand": "AIGO",
    "hang": "AIGO",
    "category": "Nguồn Máy Tính",
    "nhom": "Nguồn Máy Tính",
    "nhomHang": "Nguồn Máy Tính",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Darkflash A290 Black",
    "model": "Darkflash A290 Black",
    "rawModel": "Vỏ case Darkflash A290 Black",
    "ten": "Vỏ case máy tính Darkflash A290 Black (Kèm 3 Quạt LED, Mặt lưới thoáng khí, Form ATX)",
    "name": "Vỏ case máy tính Darkflash A290 Black (Kèm 3 Quạt LED, Mặt lưới thoáng khí, Form ATX)",
    "brand": "DARKFLASH",
    "hang": "DARKFLASH",
    "category": "Vỏ Máy Tính",
    "nhom": "Vỏ Máy Tính",
    "nhomHang": "Vỏ Máy Tính",
    "dvt": "Chiếc",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "RAM Hiksemi Armor 16GB DDR4",
    "model": "RAM Hiksemi Armor 16GB DDR4",
    "rawModel": "Ram PC Hiksemi Armor 16GB DDR4 bus 3200Mhz",
    "ten": "Bộ nhớ trong RAM PC Hiksemi Armor 16GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    "name": "Bộ nhớ trong RAM PC Hiksemi Armor 16GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    "brand": "HIKSEMI",
    "hang": "HIKSEMI",
    "category": "Bộ Nhớ Trong (RAM)",
    "nhom": "Bộ Nhớ Trong (RAM)",
    "nhomHang": "Bộ Nhớ Trong (RAM)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Darkflash H610M-VGD-V1",
    "model": "Darkflash H610M-VGD-V1",
    "rawModel": "Mainboard DarkFlash H610M",
    "ten": "Bo mạch chủ Mainboard DarkFlash H610M-VGD-V1 (Chipset H610, Socket LGA1700, 2xDDR4, Khe M.2 NVMe)",
    "name": "Bo mạch chủ Mainboard DarkFlash H610M-VGD-V1 (Chipset H610, Socket LGA1700, 2xDDR4, Khe M.2 NVMe)",
    "brand": "DARKFLASH",
    "hang": "DARKFLASH",
    "category": "Bo Mạch Chủ (Mainboard)",
    "nhom": "Bo Mạch Chủ (Mainboard)",
    "nhomHang": "Bo Mạch Chủ (Mainboard)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Intel Core i5-12400",
    "model": "Intel Core i5-12400",
    "rawModel": "Bộ vi xử lý Intel Core i5-12400",
    "ten": "Bộ vi xử lý CPU Intel Core i5-12400 (2.5GHz Turbo 4.4GHz, 6 Nhân 12 Luồng, 18MB Cache, Socket LGA1700)",
    "name": "Bộ vi xử lý CPU Intel Core i5-12400 (2.5GHz Turbo 4.4GHz, 6 Nhân 12 Luồng, 18MB Cache, Socket LGA1700)",
    "brand": "INTEL",
    "hang": "INTEL",
    "category": "Bộ Vi Xử Lý (CPU)",
    "nhom": "Bộ Vi Xử Lý (CPU)",
    "nhomHang": "Bộ Vi Xử Lý (CPU)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "MSI GeForce RTX 3050 Ventus 2X",
    "model": "MSI GeForce RTX 3050 Ventus 2X",
    "rawModel": "VGA MSI GeForce RTX 3050",
    "ten": "Card màn hình VGA MSI GeForce RTX 3050 VENTUS 2X 8G OC (8GB GDDR6, 128-bit)",
    "name": "Card màn hình VGA MSI GeForce RTX 3050 VENTUS 2X 8G OC (8GB GDDR6, 128-bit)",
    "brand": "MSI",
    "hang": "MSI",
    "category": "Card Màn Hình (VGA)",
    "nhom": "Card Màn Hình (VGA)",
    "nhomHang": "Card Màn Hình (VGA)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "SSD CUSU 512GB NVMe",
    "model": "SSD CUSU 512GB NVMe",
    "rawModel": "SSD CUSU 512GB",
    "ten": "Ổ cứng thể rắn SSD CUSU 512GB M.2 2280 NVMe PCIe Gen3x4 (Tốc độ đọc 3500MB/s - Ghi 2500MB/s)",
    "name": "Ổ cứng thể rắn SSD CUSU 512GB M.2 2280 NVMe PCIe Gen3x4 (Tốc độ đọc 3500MB/s - Ghi 2500MB/s)",
    "brand": "CUSU",
    "hang": "CUSU",
    "category": "Ổ Cứng (SSD)",
    "nhom": "Ổ Cứng (SSD)",
    "nhomHang": "Ổ Cứng (SSD)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "SSD Kingston KC600 512GB",
    "model": "SSD Kingston KC600 512GB",
    "rawModel": "SSD Kingston KC600 512",
    "ten": "Ổ cứng thể rắn SSD Kingston KC600 512GB 2.5 inch SATA3 (Tốc độ đọc 550MB/s - Ghi 520MB/s)",
    "name": "Ổ cứng thể rắn SSD Kingston KC600 512GB 2.5 inch SATA3 (Tốc độ đọc 550MB/s - Ghi 520MB/s)",
    "brand": "KINGSTON",
    "hang": "KINGSTON",
    "category": "Ổ Cứng (SSD)",
    "nhom": "Ổ Cứng (SSD)",
    "nhomHang": "Ổ Cứng (SSD)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Intel Core i3-12100",
    "model": "Intel Core i3-12100",
    "rawModel": "i3-12100",
    "ten": "Bộ vi xử lý CPU Intel Core i3-12100 (3.3GHz Turbo 4.3GHz, 4 Nhân 8 Luồng, 12MB Cache, Socket LGA1700)",
    "name": "Bộ vi xử lý CPU Intel Core i3-12100 (3.3GHz Turbo 4.3GHz, 4 Nhân 8 Luồng, 12MB Cache, Socket LGA1700)",
    "brand": "INTEL",
    "hang": "INTEL",
    "category": "Bộ Vi Xử Lý (CPU)",
    "nhom": "Bộ Vi Xử Lý (CPU)",
    "nhomHang": "Bộ Vi Xử Lý (CPU)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "RAM Hiksemi Armor 8GB DDR4",
    "model": "RAM Hiksemi Armor 8GB DDR4",
    "rawModel": "Ram PC Hiksemi Armor 8GB DDR4",
    "ten": "Bộ nhớ trong RAM PC Hiksemi Armor 8GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    "name": "Bộ nhớ trong RAM PC Hiksemi Armor 8GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    "brand": "HIKSEMI",
    "hang": "HIKSEMI",
    "category": "Bộ Nhớ Trong (RAM)",
    "nhom": "Bộ Nhớ Trong (RAM)",
    "nhomHang": "Bộ Nhớ Trong (RAM)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "SSD Hiksemi Wave 256GB",
    "model": "SSD Hiksemi Wave 256GB",
    "rawModel": "SSD Hiksemi  256GB",
    "ten": "Ổ cứng thể rắn SSD Hiksemi Wave 256GB M.2 2280 NVMe PCIe (HS-SSD-WAVE(S) 256GB)",
    "name": "Ổ cứng thể rắn SSD Hiksemi Wave 256GB M.2 2280 NVMe PCIe (HS-SSD-WAVE(S) 256GB)",
    "brand": "HIKSEMI",
    "hang": "HIKSEMI",
    "category": "Ổ Cứng (SSD)",
    "nhom": "Ổ Cứng (SSD)",
    "nhomHang": "Ổ Cứng (SSD)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "AIGO VK350 350W",
    "model": "AIGO VK350 350W",
    "rawModel": "Nguồn máy tính AIGO VK350   350W",
    "ten": "Nguồn máy tính AIGO VK350 (Công suất thực 350W, Quạt làm mát 12cm)",
    "name": "Nguồn máy tính AIGO VK350 (Công suất thực 350W, Quạt làm mát 12cm)",
    "brand": "AIGO",
    "hang": "AIGO",
    "category": "Nguồn Máy Tính",
    "nhom": "Nguồn Máy Tính",
    "nhomHang": "Nguồn Máy Tính",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "HDD WD Blue 1TB",
    "model": "HDD WD Blue 1TB",
    "rawModel": "HDD WD 1TB 3.5&quot; Sata3, màu xanh",
    "ten": "Ổ cứng HDD Western Digital Blue 1TB 3.5 inch SATA3 64MB Cache 5400RPM (WD10EARZ)",
    "name": "Ổ cứng HDD Western Digital Blue 1TB 3.5 inch SATA3 64MB Cache 5400RPM (WD10EARZ)",
    "brand": "WESTERN DIGITAL",
    "hang": "WESTERN DIGITAL",
    "category": "Ổ Cứng (HDD)",
    "nhom": "Ổ Cứng (HDD)",
    "nhomHang": "Ổ Cứng (HDD)",
    "dvt": "Chiếc",
    "defaultBh": 24,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "HDD Seagate SkyHawk 8TB",
    "model": "HDD Seagate SkyHawk 8TB",
    "rawModel": "HDD 8GB",
    "ten": "Ổ cứng HDD chuyên dụng camera/máy chủ Seagate SkyHawk 8TB 3.5 inch SATA3 (ST8000VX004)",
    "name": "Ổ cứng HDD chuyên dụng camera/máy chủ Seagate SkyHawk 8TB 3.5 inch SATA3 (ST8000VX004)",
    "brand": "SEAGATE",
    "hang": "SEAGATE",
    "category": "Ổ Cứng (HDD)",
    "nhom": "Ổ Cứng (HDD)",
    "nhomHang": "Ổ Cứng (HDD)",
    "dvt": "Chiếc",
    "defaultBh": 36,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  },
  {
    "productId": "Jasonz T-G183",
    "model": "Jasonz T-G183",
    "rawModel": "Bộ mở rộng HDMI qua dây LAN",
    "ten": "Bộ mở rộng tín hiệu HDMI qua LAN 150m có KVM (Jasonz T-G183)",
    "name": "Bộ mở rộng tín hiệu HDMI qua LAN 150m có KVM (Jasonz T-G183)",
    "brand": "JASONZ",
    "hang": "JASONZ",
    "category": "Thiết Bị Mạng & Kết Nối",
    "nhom": "Thiết Bị Mạng & Kết Nối",
    "nhomHang": "Thiết Bị Mạng & Kết Nối",
    "dvt": "Bộ",
    "defaultBh": 12,
    "manageSerial": true,
    "active": true,
    "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
  }
];

  // 1.4 DANH MỤC NHÀ CUNG CẤP (DM_NCC)
  let INITIAL_SUPPLIERS = [
  {
    "supplierId": "FPS",
    "code": "FPS",
    "tenTat": "FPS",
    "name": "Công ty FPS",
    "tenDayDu": "Công ty FPS",
    "phone": "12340",
    "sdt": "12340",
    "email": "",
    "diaChi": "fjsdhf",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Thảo Linh",
    "code": "Thảo Linh",
    "tenTat": "Thảo Linh",
    "name": "Cty Thảo Linh",
    "tenDayDu": "Cty Thảo Linh",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Nam Phát",
    "code": "Nam Phát",
    "tenTat": "Nam Phát",
    "name": "Công ty Nam Phát",
    "tenDayDu": "Công ty Nam Phát",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Thanh Nga",
    "code": "Thanh Nga",
    "tenTat": "Thanh Nga",
    "name": "Công ty Thanh Nga",
    "tenDayDu": "Công ty Thanh Nga",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Thiên Trường",
    "code": "Thiên Trường",
    "tenTat": "Thiên Trường",
    "name": "Công ty Thiên Trường",
    "tenDayDu": "Công ty Thiên Trường",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Minh Chính",
    "code": "Minh Chính",
    "tenTat": "Minh Chính",
    "name": "Công ty Minh Chính",
    "tenDayDu": "Công ty Minh Chính",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "TD",
    "code": "TD",
    "tenTat": "TD",
    "name": "Công ty TD",
    "tenDayDu": "Công ty TD",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Neway",
    "code": "Neway",
    "tenTat": "Neway",
    "name": "Công ty Neway",
    "tenDayDu": "Công ty Neway",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Hưng Phúc",
    "code": "Hưng Phúc",
    "tenTat": "Hưng Phúc",
    "name": "Công ty Hưng Phúc",
    "tenDayDu": "Công ty Hưng Phúc",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "N/A",
    "code": "N/A",
    "tenTat": "N/A",
    "name": "N/A",
    "tenDayDu": "N/A",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Hưng Hà",
    "code": "Hưng Hà",
    "tenTat": "Hưng Hà",
    "name": "Công ty Hưng Hà",
    "tenDayDu": "Công ty Hưng Hà",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "A Tài",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Trí Việt",
    "code": "Trí Việt",
    "tenTat": "Trí Việt",
    "name": "Công ty Trí Việt",
    "tenDayDu": "Công ty Trí Việt",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "Song Hùng",
    "code": "Song Hùng",
    "tenTat": "Song Hùng",
    "name": "Công Ty Song Hùng",
    "tenDayDu": "Công Ty Song Hùng",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "NAKIO",
    "code": "NAKIO",
    "tenTat": "NAKIO",
    "name": "CT CPTM VÀ DV NAKIO",
    "tenDayDu": "CT CPTM VÀ DV NAKIO",
    "phone": "2436628900",
    "sdt": "2436628900",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  },
  {
    "supplierId": "EASY",
    "code": "EASY",
    "tenTat": "EASY",
    "name": "Công ty EASY",
    "tenDayDu": "Công ty EASY",
    "phone": "",
    "sdt": "",
    "email": "",
    "diaChi": "",
    "nguoiLienHe": "",
    "mst": "",
    "active": true,
    "ghiChu": ""
  }
];

  // 1.5 DANH MỤC KHÁCH HÀNG (DM_KHACH_HANG - LÀM SẠCH TRÙNG LẶP & SĐT)
  let INITIAL_CUSTOMERS = [
  {
    "customerId": "KH_001",
    "name": "CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ KHOA NHÂN (KACAJOIN)",
    "ten": "CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ KHOA NHÂN (KACAJOIN)",
    "phone": "0963093555",
    "sdt": "0963093555",
    "diaChi": "Hà Nội",
    "address": "Hà Nội",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_002",
    "name": "Công ty cổ phần giải pháp công nghệ và truyền Thông Việt (C Hà)",
    "ten": "Công ty cổ phần giải pháp công nghệ và truyền Thông Việt (C Hà)",
    "phone": "97202266",
    "sdt": "97202266",
    "diaChi": "33C Nhân Hòa",
    "address": "33C Nhân Hòa",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_003",
    "name": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "ten": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "phone": "0909689886",
    "sdt": "0909689886",
    "diaChi": "T2, toà nhà Licogi 12, số 21 Đại Từ, phường Định Công,HN",
    "address": "T2, toà nhà Licogi 12, số 21 Đại Từ, phường Định Công,HN",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_004",
    "name": "e Vân",
    "ten": "e Vân",
    "phone": "0383500018",
    "sdt": "0383500018",
    "diaChi": "Tầng 6,Tòa D8 Đại Học Bách Khoa",
    "address": "Tầng 6,Tòa D8 Đại Học Bách Khoa",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_005",
    "name": "Quang",
    "ten": "Quang",
    "phone": "0976147203",
    "sdt": "0976147203",
    "diaChi": "D03-L20, An Vượng villa, Dương Nội, Hà Đông, Hà Nội",
    "address": "D03-L20, An Vượng villa, Dương Nội, Hà Đông, Hà Nội",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_006",
    "name": "Chị Phương",
    "ten": "Chị Phương",
    "phone": "0325470077",
    "sdt": "0325470077",
    "diaChi": "Yên Lương, Sông Lô, Phú Thọ",
    "address": "Yên Lương, Sông Lô, Phú Thọ",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_007",
    "name": "Nguyễn Thanh Tùng",
    "ten": "Nguyễn Thanh Tùng",
    "phone": "0989966619",
    "sdt": "0989966619",
    "diaChi": "117 Trần Duy Hưng",
    "address": "117 Trần Duy Hưng",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_008",
    "name": "CÔNG TY TNHH THƯƠNG MẠI DƯỢC PHẨM TRUNG TÍN",
    "ten": "CÔNG TY TNHH THƯƠNG MẠI DƯỢC PHẨM TRUNG TÍN",
    "phone": "0868749555",
    "sdt": "0868749555",
    "diaChi": "Số nhà 47, Khu tập thể Viện Khoa học Nông nghiệp, Vĩnh Quỳnh, Thanh Trì",
    "address": "Số nhà 47, Khu tập thể Viện Khoa học Nông nghiệp, Vĩnh Quỳnh, Thanh Trì",
    "ghiChu": "Chị Giang",
    "active": true
  },
  {
    "customerId": "KH_009",
    "name": "Mr. Đỉnh",
    "ten": "Mr. Đỉnh",
    "phone": "0969898168",
    "sdt": "0969898168",
    "diaChi": "Mr. Đỉnh: 096 9898168 Số L3-125 đường Limoni, Khu đô thị New An Thới, Đặc khu Phú Quốc, Tỉnh An Giang",
    "address": "Mr. Đỉnh: 096 9898168 Số L3-125 đường Limoni, Khu đô thị New An Thới, Đặc khu Phú Quốc, Tỉnh An Giang",
    "ghiChu": "",
    "active": true
  },
  {
    "customerId": "KH_010",
    "name": "anh Luận",
    "ten": "anh Luận",
    "phone": "0963732891",
    "sdt": "0963732891",
    "diaChi": "183 Hoàng Hoa Thám Lh: A Luận:",
    "address": "183 Hoàng Hoa Thám Lh: A Luận:",
    "ghiChu": "",
    "active": true
  }
];

  // 1.6 DANH MỤC KHO HÀNG
  let INITIAL_WAREHOUSES = [
  {
    "warehouseId": "KHO_01",
    "code": "Kho VP",
    "name": "Kho Văn Phòng (Số 18 Ngõ 241 Khâm Thiên)",
    "diaChi": "Số 18 Ngõ 241 Phố Chợ Khâm Thiên, Hà Nội",
    "active": true,
    "ghiChu": "Kho chính phân phối"
  },
  {
    "warehouseId": "KHO_02",
    "code": "Kho Nhà",
    "name": "Kho Nhà Riêng",
    "diaChi": "Kho lưu trữ dự phòng",
    "active": true,
    "ghiChu": "Kho phụ"
  }
];

  // Biến đếm sequence mã nội bộ Thành An
  let INTERNAL_SEQ_COUNTER = 87;

  // Danh sách tài khoản nhân sự RBAC
  let INITIAL_USERS = [
    { username: 'admin', fullName: 'Khổng Mạnh Cường', role: 'ADMIN', status: 'ACTIVE', password: '***' },
    { username: 'minhquan', fullName: 'Khổng Minh Quân', role: 'THỦ KHO', status: 'ACTIVE', password: '***' }
  ];
  let USERS_DB = JSON.parse(JSON.stringify(INITIAL_USERS));
  try {
    if (typeof localStorage !== 'undefined') {
      const savedUsers = localStorage.getItem('THANH_AN_USERS_DB');
      if (savedUsers) {
        const parsedU = JSON.parse(savedUsers);
        if (Array.isArray(parsedU) && parsedU.length > 0) USERS_DB = parsedU;
      }
    }
  } catch(e) {}

  // Tài khoản đăng nhập (mặc định chưa đăng nhập / Khách)
  let CURRENT_ROLE = 'GUEST';
  let CURRENT_USER_NAME = '';
  try {
    if (typeof sessionStorage !== 'undefined') {
      const savedSession = sessionStorage.getItem('THANH_AN_LOGGED_SESSION');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.fullName) CURRENT_USER_NAME = parsed.fullName;
        if (parsed.role) CURRENT_ROLE = parsed.role;
      }
    }
  } catch(e) {}

  // 1.7 MA TRẬN 20 QUYỀN HẠN PHÂN QUYỀN
  const ALL_PERMISSIONS = [
    { code: 'Dashboard.View', name: 'Xem Bảng điều khiển KPI', group: 'Dashboard' },
    { code: 'Stock.View', name: 'Xem báo cáo Tồn kho', group: 'Tồn kho' },
    { code: 'Import.Create', name: 'Tạo phiếu Nhập kho', group: 'Nhập kho' },
    { code: 'Export.Create', name: 'Tạo phiếu Xuất kho', group: 'Xuất kho' },
    { code: 'Voucher.Edit', name: 'Sửa phiếu Nhập / Xuất (CONFIRMED)', group: 'Phiếu kho' },
    { code: 'Voucher.Cancel', name: 'Hủy phiếu Nhập / Xuất', group: 'Phiếu kho' },
    { code: 'Return.Customer', name: 'Hoàn nhập hàng từ Khách', group: 'Nghiệp vụ kho' },
    { code: 'Return.Supplier', name: 'Trả hàng cho Nhà cung cấp', group: 'Nghiệp vụ kho' },
    { code: 'Warehouse.Transfer', name: 'Chuyển kho nội bộ', group: 'Nghiệp vụ kho' },
    { code: 'Stocktake.Create', name: 'Tạo & Quét phiên Kiểm kê', group: 'Kiểm kê' },
    { code: 'Stocktake.Close', name: 'Khóa & Đóng phiên Kiểm kê', group: 'Kiểm kê' },
    { code: 'Stock.Adjust', name: 'Điều chỉnh trạng thái Tồn kho', group: 'Tồn kho' },
    { code: 'Warranty.Create', name: 'Tiếp nhận ca Bảo hành', group: 'Bảo hành' },
    { code: 'Warranty.Update', name: 'Cập nhật tiến độ ca Bảo hành', group: 'Bảo hành' },
    { code: 'Catalog.View', name: 'Xem Danh mục Hệ thống', group: 'Danh mục' },
    { code: 'Catalog.Edit', name: 'Thêm / Sửa Danh mục (Model, NCC, KH, Kho)', group: 'Danh mục' },
    { code: 'Audit.View', name: 'Xem Nhật ký Kiểm toán Audit Center', group: 'Audit' },
    { code: 'Users.Manage', name: 'Quản lý Người dùng & Vai trò', group: 'Cài đặt' },
    { code: 'Permissions.Manage', name: 'Thay đổi Ma trận Phân quyền', group: 'Cài đặt' },
    { code: 'CustomFields.Manage', name: 'Quản lý Trường dữ liệu tùy chỉnh', group: 'Cài đặt' }
  ];

  let ROLE_PERMISSIONS = {
    'THỦ KHO': [
      'Dashboard.View', 'Stock.View', 'Import.Create', 'Export.Create',
      'Return.Customer', 'Return.Supplier', 'Warehouse.Transfer',
      'Stocktake.Create', 'Catalog.View'
    ],
    'BẢO HÀNH': [
      'Dashboard.View', 'Stock.View', 'Warranty.Create', 'Warranty.Update',
      'Return.Customer', 'Catalog.View'
    ],
    'QUẢN LÝ': [
      'Dashboard.View', 'Stock.View', 'Import.Create', 'Export.Create',
      'Voucher.Edit', 'Voucher.Cancel', 'Return.Customer', 'Return.Supplier',
      'Warehouse.Transfer', 'Stocktake.Create', 'Stocktake.Close',
      'Stock.Adjust', 'Warranty.Create', 'Warranty.Update', 'Catalog.View',
      'Catalog.Edit', 'Audit.View'
    ],
    'ADMIN': ALL_PERMISSIONS.map(p => p.code)
  };
  try {
    if (typeof localStorage !== 'undefined') {
      const savedPerms = localStorage.getItem('THANH_AN_ROLE_PERMISSIONS');
      if (savedPerms) {
        const parsedP = JSON.parse(savedPerms);
        if (parsedP && typeof parsedP === 'object') {
          ROLE_PERMISSIONS = Object.assign({}, ROLE_PERMISSIONS, parsedP);
        }
      }
    }
  } catch(e) {}

  // 1.8 DANH SÁCH CUSTOM FIELDS
  function normalizeCustomField(f) {
    if (!f) return f;
    f.id = f.id || `CF-${String(f.order || 1).padStart(2, '0')}`;
    f.name = f.name || '';
    f.code = (f.code || '').toUpperCase();
    f.module = f.module || 'Model';
    f.type = f.type || 'Text';
    f.defaultValue = f.defaultValue !== undefined ? f.defaultValue : '';
    f.options = Array.isArray(f.options) ? f.options : [];
    f.required = !!f.required;
    f.showForm = f.showForm !== undefined ? f.showForm : true;
    f.showOnForm = f.showForm;
    f.showTable = f.showTable !== undefined ? f.showTable : true;
    f.showOnTable = f.showTable;
    f.searchable = f.searchable !== undefined ? f.searchable : true;
    f.allowSearch = f.searchable;
    f.filterable = f.filterable !== undefined ? f.filterable : false;
    f.allowFilter = f.filterable;
    f.order = f.order || 1;
    f.active = f.active !== false;
    return f;
  }

  let CUSTOM_FIELDS_DB = [
    {
      id: 'cf_01',
      name: 'Màu sắc thiết bị',
      code: 'COLOR',
      module: 'Model',
      type: 'Dropdown',
      options: ['Trắng', 'Đen', 'Bạc', 'Xám'],
      defaultValue: 'Trắng',
      required: false,
      showForm: true,
      showTable: true,
      searchable: true,
      filterable: true,
      order: 1,
      active: true
    }
  ].map(normalizeCustomField);

  // ====================================================
  // 2. CƠ SỞ DỮ LIỆU SERIAL (SERIAL_DB) - 86 THIẾT BỊ THỰC TẾ
  // ====================================================
  let SERIAL_DB = [
  {
    "serial": "CNB1T5GC6X",
    "internalId": "TA-001",
    "model": "HP Laser 108a",
    "tenHang": "Máy in laser đen trắng đơn năng HP Laser 108a (USB 2.0)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "19/08/2026",
    "maPhieuNhap": "PN-260911-140733",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "19/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-140733 từ N/A"
      }
    ]
  },
  {
    "serial": "NTMA681531",
    "internalId": "TA-002",
    "model": "Canon LBP 6030w",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Nam Phát",
    "ngayNhap": "09/09/2026",
    "maPhieuNhap": "PN-260911-140819",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "09/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-140819 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "NTMA681178",
    "internalId": "TA-003",
    "model": "Canon LBP 6030w",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Nam Phát",
    "ngayNhap": "09/09/2026",
    "maPhieuNhap": "PN-260911-140819",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "09/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-140819 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "NTMA682190",
    "internalId": "TA-004",
    "model": "Canon LBP 6030w",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Nam Phát",
    "ngayNhap": "09/09/2026",
    "maPhieuNhap": "PN-260911-140819",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "09/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-140819 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "NTMA680176",
    "internalId": "TA-005",
    "model": "Canon LBP 6030w",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Nam Phát",
    "ngayNhap": "09/09/2026",
    "maPhieuNhap": "PN-260911-140819",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "09/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-140819 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "NTMA680542",
    "internalId": "TA-006",
    "model": "Canon LBP 6030w",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Nam Phát",
    "ngayNhap": "09/09/2026",
    "maPhieuNhap": "PN-260911-140819",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "09/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-140819 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "NTLA767591",
    "internalId": "TA-007",
    "model": "Canon LBP 6030",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141015",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141015 từ N/A"
      }
    ]
  },
  {
    "serial": "NTLA863393",
    "internalId": "TA-008",
    "model": "Canon LBP 6030",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141015",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260915-172950",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260915-172950 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 15/09/2027"
      },
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141015 từ N/A"
      }
    ]
  },
  {
    "serial": "NTLA863121",
    "internalId": "TA-009",
    "model": "Canon LBP 6030",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141015",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141015 từ N/A"
      }
    ]
  },
  {
    "serial": "NTLA776136",
    "internalId": "TA-010",
    "model": "Canon LBP 6030",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141015",
    "status": "SOLD",
    "ngayXuat": "28/08/2026",
    "maPhieuXuat": "PX-260917-092624",
    "khachHang": "Quang",
    "sdtKhach": "0976147203",
    "soThangBh": 12,
    "ngayHetHanBh": "28/08/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "28/08/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-092624 cho Quang (SĐT: 0976147203). Hạn BH: 28/08/2027"
      },
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141015 từ N/A"
      }
    ]
  },
  {
    "serial": "NTLA863405",
    "internalId": "TA-011",
    "model": "Canon LBP 6030",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030 (USB 2.0)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141015",
    "status": "SOLD",
    "ngayXuat": "28/08/2026",
    "maPhieuXuat": "PX-260917-092624",
    "khachHang": "Quang",
    "sdtKhach": "0976147203",
    "soThangBh": 12,
    "ngayHetHanBh": "28/08/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "28/08/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-092624 cho Quang (SĐT: 0976147203). Hạn BH: 28/08/2027"
      },
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141015 từ N/A"
      }
    ]
  },
  {
    "serial": "KPVF12443",
    "internalId": "TA-012",
    "model": "Canon PIXMA G2010",
    "tenHang": "Máy in phun màu đa năng Canon PIXMA G2010 (In, Scan, Copy)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141202",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141202 từ N/A"
      }
    ]
  },
  {
    "serial": "E81467J5X122374",
    "internalId": "TA-013",
    "model": "Brother ADS-4300DN",
    "tenHang": "Máy quét tài liệu chuyên dụng tốc độ cao Brother ADS-4300DN (LAN/USB)",
    "nhomHang": "Máy Scan",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141233",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141233 từ N/A"
      }
    ]
  },
  {
    "serial": "E81467J5X122321",
    "internalId": "TA-014",
    "model": "Brother ADS-4300DN",
    "tenHang": "Máy quét tài liệu chuyên dụng tốc độ cao Brother ADS-4300DN (LAN/USB)",
    "nhomHang": "Máy Scan",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141233",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141233 từ N/A"
      }
    ]
  },
  {
    "serial": "E81467J5X122298",
    "internalId": "TA-015",
    "model": "Brother ADS-4300DN",
    "tenHang": "Máy quét tài liệu chuyên dụng tốc độ cao Brother ADS-4300DN (LAN/USB)",
    "nhomHang": "Máy Scan",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141233",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141233 từ N/A"
      }
    ]
  },
  {
    "serial": "CNB1T1P98B",
    "internalId": "TA-016",
    "model": "HP Laser 108w",
    "tenHang": "Máy in laser đen trắng đơn năng HP Laser 108w (Kết nối Wifi)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-141318",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141318 từ N/A"
      }
    ]
  },
  {
    "serial": "PHRA105934",
    "internalId": "TA-017",
    "model": "Canon LBP 243dw II",
    "tenHang": "Máy in laser đen trắng Canon LBP243dw II (Tốc độ cao, In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "07/09/2026",
    "maPhieuNhap": "PN-260911-141413",
    "status": "SOLD",
    "ngayXuat": "21/09/2026",
    "maPhieuXuat": "PX-260921-162918",
    "khachHang": "Mr. Đỉnh",
    "sdtKhach": "0969898168",
    "soThangBh": 12,
    "ngayHetHanBh": "21/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260921-162918 cho Mr. Đỉnh (SĐT: 0969898168). Hạn BH: 21/09/2027"
      },
      {
        "date": "07/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141413 từ N/A"
      }
    ]
  },
  {
    "serial": "TA-260911-001",
    "internalId": "TA-018",
    "model": "Halloya 85A/325 Toner",
    "tenHang": "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    "nhomHang": "Mực In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "21/08/2026",
    "maPhieuNhap": "PN-260911-141500",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141500 từ N/A"
      }
    ]
  },
  {
    "serial": "TA-260911-002",
    "internalId": "TA-019",
    "model": "Halloya 85A/325 Toner",
    "tenHang": "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    "nhomHang": "Mực In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "21/08/2026",
    "maPhieuNhap": "PN-260911-141500",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141500 từ N/A"
      }
    ]
  },
  {
    "serial": "TA-260911-003",
    "internalId": "TA-020",
    "model": "Halloya 85A/325 Toner",
    "tenHang": "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    "nhomHang": "Mực In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "21/08/2026",
    "maPhieuNhap": "PN-260911-141500",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141500 từ N/A"
      }
    ]
  },
  {
    "serial": "TA-260911-004",
    "internalId": "TA-021",
    "model": "Halloya 85A/325 Toner",
    "tenHang": "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    "nhomHang": "Mực In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "21/08/2026",
    "maPhieuNhap": "PN-260911-141500",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141500 từ N/A"
      }
    ]
  },
  {
    "serial": "TA-260911-005",
    "internalId": "TA-022",
    "model": "Halloya 85A/325 Toner",
    "tenHang": "Hộp mực in tương thích Halloya 85A/325 (Dùng cho Canon LBP 6030, HP 1102)",
    "nhomHang": "Mực In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "21/08/2026",
    "maPhieuNhap": "PN-260911-141500",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141500 từ N/A"
      }
    ]
  },
  {
    "serial": "TA-260911-006",
    "internalId": "TA-023",
    "model": "TJ INK Toner Cartridge",
    "tenHang": "Hộp mực in tương thích cao cấp TJ INK (Dùng cho máy in Canon/HP)",
    "nhomHang": "Mực In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "11/09/2026",
    "maPhieuNhap": "PN-260911-141624",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "11/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141624 từ N/A"
      }
    ]
  },
  {
    "serial": "TA-260911-007",
    "internalId": "TA-024",
    "model": "TJ INK Toner Cartridge",
    "tenHang": "Hộp mực in tương thích cao cấp TJ INK (Dùng cho máy in Canon/HP)",
    "nhomHang": "Mực In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "11/09/2026",
    "maPhieuNhap": "PN-260911-141624",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "11/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141624 từ N/A"
      }
    ]
  },
  {
    "serial": "PHEA127806",
    "internalId": "TA-025",
    "model": "Canon LBP 246dw II",
    "tenHang": "Máy in laser đen trắng Canon LBP246dw II (In 2 mặt, Wifi/LAN, 40 trang/phút)",
    "nhomHang": "Máy In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "07/09/2026",
    "maPhieuNhap": "PN-260911-141701",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "07/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-141701 từ N/A"
      }
    ]
  },
  {
    "serial": "NTMA779070",
    "internalId": "TA-026",
    "model": "Canon LBP 6030w",
    "tenHang": "Máy in laser đen trắng đơn năng Canon LBP 6030w (Kết nối Wifi)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-153249",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-153249 từ N/A"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127061",
    "internalId": "TA-027",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127062",
    "internalId": "TA-028",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127064",
    "internalId": "TA-029",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127065",
    "internalId": "TA-030",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127067",
    "internalId": "TA-031",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127068",
    "internalId": "TA-032",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127069",
    "internalId": "TA-033",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127070",
    "internalId": "TA-034",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "LK185BSEA260127071",
    "internalId": "TA-035",
    "model": "DAREU LK185",
    "tenHang": "Bàn phím văn phòng có dây DAREU LK185 (Black, Cổng USB)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260911-155551",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260911-155551 từ FPS"
      }
    ]
  },
  {
    "serial": "VNM0WW42908",
    "internalId": "TA-036",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260912-083643",
    "status": "SOLD",
    "ngayXuat": "12/09/2026",
    "maPhieuXuat": "PX-260912-083937",
    "khachHang": "CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ KHOA NHÂN (KACAJOIN)",
    "sdtKhach": "0963093555",
    "soThangBh": 12,
    "ngayHetHanBh": "12/09/2027",
    "ghiChu": "Khách hàng qua vp lấy",
    "timeline": [
      {
        "date": "12/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260912-083937 cho CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ KHOA NHÂN (KACAJOIN) (SĐT: 0963093555). Hạn BH: 12/09/2027"
      },
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260912-083643 từ N/A"
      }
    ]
  },
  {
    "serial": "PF685QNZ",
    "internalId": "TA-037",
    "model": "Lenovo ThinkPad E14 Gen 7",
    "tenHang": "Laptop Lenovo ThinkPad E14 Gen 7 (Intel Core Ultra 7 256V / 16GB / 512GB SSD / 14 inch WUXGA / Vỏ nhôm)",
    "nhomHang": "Laptop",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Hưng Hà",
    "ngayNhap": "12/09/2026",
    "maPhieuNhap": "PN-260912-205001",
    "status": "SOLD",
    "ngayXuat": "12/09/2026",
    "maPhieuXuat": "PX-260912-214430",
    "khachHang": "Công ty cổ phần giải pháp công nghệ và truyền Thông Việt (C Hà)",
    "sdtKhach": "97202266",
    "soThangBh": 12,
    "ngayHetHanBh": "12/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "12/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260912-214430 cho Công ty cổ phần giải pháp công nghệ và truyền Thông Việt (C Hà) (SĐT: 97202266). Hạn BH: 12/09/2027"
      },
      {
        "date": "12/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260912-205001 từ Hưng Hà"
      }
    ]
  },
  {
    "serial": "VNMOY11287",
    "internalId": "TA-038",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNMOY10210",
    "internalId": "TA-039",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNMOY10215",
    "internalId": "TA-040",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNMOY10292",
    "internalId": "TA-041",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904374",
    "internalId": "TA-042",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904390",
    "internalId": "TA-043",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904400",
    "internalId": "TA-044",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904910",
    "internalId": "TA-045",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904918",
    "internalId": "TA-046",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904947",
    "internalId": "TA-047",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904953",
    "internalId": "TA-048",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1904963",
    "internalId": "TA-049",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM1906781",
    "internalId": "TA-050",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNMOY10206",
    "internalId": "TA-051",
    "model": "HP LaserJet Pro 4003dw",
    "tenHang": "Máy in laser đen trắng đơn năng HP LaserJet Pro 4003dw (In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Nhà",
    "ncc": "Nam Phát",
    "ngayNhap": "10/09/2026",
    "maPhieuNhap": "PN-260913-191519",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "10/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260913-191519 từ Nam Phát"
      }
    ]
  },
  {
    "serial": "VNM0W42889",
    "internalId": "TA-052",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "15/08/2026",
    "maPhieuNhap": "PN-260915-171953",
    "status": "SOLD",
    "ngayXuat": "19/09/2026",
    "maPhieuXuat": "PX-260919-085717",
    "khachHang": "CÔNG TY TNHH THƯƠNG MẠI DƯỢC PHẨM TRUNG TÍN",
    "sdtKhach": "0868749555",
    "soThangBh": 12,
    "ngayHetHanBh": "19/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "19/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260919-085717 cho CÔNG TY TNHH THƯƠNG MẠI DƯỢC PHẨM TRUNG TÍN (SĐT: 0868749555). Hạn BH: 19/09/2027"
      },
      {
        "date": "15/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-171953 từ N/A"
      }
    ]
  },
  {
    "serial": "VNM0W40960",
    "internalId": "TA-053",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "15/08/2026",
    "maPhieuNhap": "PN-260915-171953",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260915-174408",
    "khachHang": "e Vân",
    "sdtKhach": "0383500018",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260915-174408 cho e Vân (SĐT: 0383500018). Hạn BH: 15/09/2027"
      },
      {
        "date": "15/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-171953 từ N/A"
      }
    ]
  },
  {
    "serial": "BM501913352103212",
    "internalId": "TA-054",
    "model": "Dahua DHI-LM22-A210Y",
    "tenHang": "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    "nhomHang": "Màn Hình",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Trí Việt",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-172547",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-172547 từ Trí Việt"
      }
    ]
  },
  {
    "serial": "BM501913352100975",
    "internalId": "TA-055",
    "model": "Dahua DHI-LM22-A210Y",
    "tenHang": "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    "nhomHang": "Màn Hình",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Trí Việt",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-172547",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260915-172950",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260915-172950 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 15/09/2027"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-172547 từ Trí Việt"
      }
    ]
  },
  {
    "serial": "U60F4Q2500498",
    "internalId": "TA-056",
    "model": "Intel Core i5-12400",
    "tenHang": "Bộ vi xử lý CPU Intel Core i5-12400 (2.5GHz Turbo 4.4GHz, 6 Nhân 12 Luồng, 18MB Cache, Socket LGA1700)",
    "nhomHang": "Bộ Vi Xử Lý (CPU)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-180940",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260916-154235",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260916-154235 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 15/09/2027"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-180940 từ FPS"
      }
    ]
  },
  {
    "serial": "30188230248",
    "internalId": "TA-057",
    "model": "RAM Hiksemi Armor 16GB DDR4",
    "tenHang": "Bộ nhớ trong RAM PC Hiksemi Armor 16GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    "nhomHang": "Bộ Nhớ Trong (RAM)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-181137",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260916-154906",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260916-154906 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 15/09/2027"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-181137 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "H610M2511201388",
    "internalId": "TA-058",
    "model": "Darkflash H610M-VGD-V1",
    "tenHang": "Bo mạch chủ Mainboard DarkFlash H610M-VGD-V1 (Chipset H610, Socket LGA1700, 2xDDR4, Khe M.2 NVMe)",
    "nhomHang": "Bo Mạch Chủ (Mainboard)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-181217",
    "status": "SOLD",
    "ngayXuat": "16/09/2026",
    "maPhieuXuat": "PX-260916-155029",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "16/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "16/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260916-155029 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 16/09/2027"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-181217 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "602-V809-2885S02601001478",
    "internalId": "TA-059",
    "model": "MSI GeForce RTX 3050 Ventus 2X",
    "tenHang": "Card màn hình VGA MSI GeForce RTX 3050 VENTUS 2X 8G OC (8GB GDDR6, 128-bit)",
    "nhomHang": "Card Màn Hình (VGA)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-181257",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260916-155311",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260916-155311 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 15/09/2027"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-181257 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "TKSMC25C8X01266",
    "internalId": "TA-060",
    "model": "SSD CUSU 512GB NVMe",
    "tenHang": "Ổ cứng thể rắn SSD CUSU 512GB M.2 2280 NVMe PCIe Gen3x4 (Tốc độ đọc 3500MB/s - Ghi 2500MB/s)",
    "nhomHang": "Ổ Cứng (SSD)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-181456",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260916-155311",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260916-155311 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 15/09/2027"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-181456 từ FPS"
      }
    ]
  },
  {
    "serial": "GHD887363300087",
    "internalId": "TA-061",
    "model": "AIGO VK550 550W",
    "tenHang": "Nguồn máy tính AIGO VK550 (Công suất thực 550W, Quạt tản nhiệt 12cm)",
    "nhomHang": "Nguồn Máy Tính",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "15/09/2026",
    "maPhieuNhap": "PN-260915-181623",
    "status": "SOLD",
    "ngayXuat": "15/09/2026",
    "maPhieuXuat": "PX-260916-155311",
    "khachHang": "CÔNG TY TNHH X.E VIỆT NAM (A Dương)",
    "sdtKhach": "0909689886",
    "soThangBh": 12,
    "ngayHetHanBh": "15/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "15/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260916-155311 cho CÔNG TY TNHH X.E VIỆT NAM (A Dương) (SĐT: 0909689886). Hạn BH: 15/09/2027"
      },
      {
        "date": "15/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260915-181623 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "5002687687698BFF",
    "internalId": "TA-062",
    "model": "SSD Kingston KC600 512GB",
    "tenHang": "Ổ cứng thể rắn SSD Kingston KC600 512GB 2.5 inch SATA3 (Tốc độ đọc 550MB/s - Ghi 520MB/s)",
    "nhomHang": "Ổ Cứng (SSD)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "NAKIO",
    "ngayNhap": "17/09/2026",
    "maPhieuNhap": "PN-260917-134355",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 36,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-134355 từ NAKIO"
      }
    ]
  },
  {
    "serial": "50026876876979D6",
    "internalId": "TA-063",
    "model": "SSD Kingston KC600 512GB",
    "tenHang": "Ổ cứng thể rắn SSD Kingston KC600 512GB 2.5 inch SATA3 (Tốc độ đọc 550MB/s - Ghi 520MB/s)",
    "nhomHang": "Ổ Cứng (SSD)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "NAKIO",
    "ngayNhap": "17/09/2026",
    "maPhieuNhap": "PN-260917-134355",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 36,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-134355 từ NAKIO"
      }
    ]
  },
  {
    "serial": "U6QP281903042",
    "internalId": "TA-064",
    "model": "Intel Core i3-12100",
    "tenHang": "Bộ vi xử lý CPU Intel Core i3-12100 (3.3GHz Turbo 4.3GHz, 4 Nhân 8 Luồng, 12MB Cache, Socket LGA1700)",
    "nhomHang": "Bộ Vi Xử Lý (CPU)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "17/09/2026",
    "maPhieuNhap": "PN-260917-173635",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "17/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-173635 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "H610M2511201381",
    "internalId": "TA-065",
    "model": "Darkflash H610M-VGD-V1",
    "tenHang": "Bo mạch chủ Mainboard DarkFlash H610M-VGD-V1 (Chipset H610, Socket LGA1700, 2xDDR4, Khe M.2 NVMe)",
    "nhomHang": "Bo Mạch Chủ (Mainboard)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "17/09/2026",
    "maPhieuNhap": "PN-260917-173635",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "17/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-173635 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "30199802874",
    "internalId": "TA-066",
    "model": "RAM Hiksemi Armor 8GB DDR4",
    "tenHang": "Bộ nhớ trong RAM PC Hiksemi Armor 8GB DDR4 Bus 3200MHz có tản nhiệt nhôm",
    "nhomHang": "Bộ Nhớ Trong (RAM)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "17/09/2026",
    "maPhieuNhap": "PN-260917-173635",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "17/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-173635 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "30200802591",
    "internalId": "TA-067",
    "model": "SSD Hiksemi Wave 256GB",
    "tenHang": "Ổ cứng thể rắn SSD Hiksemi Wave 256GB M.2 2280 NVMe PCIe (HS-SSD-WAVE(S) 256GB)",
    "nhomHang": "Ổ Cứng (SSD)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "17/09/2026",
    "maPhieuNhap": "PN-260917-173635",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "17/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-173635 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "GHD887264200966",
    "internalId": "TA-068",
    "model": "AIGO VK350 350W",
    "tenHang": "Nguồn máy tính AIGO VK350 (Công suất thực 350W, Quạt làm mát 12cm)",
    "nhomHang": "Nguồn Máy Tính",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Song Hùng",
    "ngayNhap": "17/09/2026",
    "maPhieuNhap": "PN-260917-173635",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "17/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-173635 từ Song Hùng"
      }
    ]
  },
  {
    "serial": "LM103BT260212588",
    "internalId": "TA-069",
    "model": "DAREU LM103",
    "tenHang": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260917-175158",
    "status": "SOLD",
    "ngayXuat": "17/09/2026",
    "maPhieuXuat": "PX-260917-175255",
    "khachHang": "Chị Phương",
    "sdtKhach": "0325470077",
    "soThangBh": 24,
    "ngayHetHanBh": "17/09/2028",
    "ghiChu": "",
    "timeline": [
      {
        "date": "17/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260917-175255 cho Chị Phương (SĐT: 0325470077). Hạn BH: 17/09/2028"
      },
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260917-175158 từ FPS"
      }
    ]
  },
  {
    "serial": "VNM0W45624",
    "internalId": "TA-070",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Thanh Nga",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-095134",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-095134 từ Thanh Nga"
      }
    ]
  },
  {
    "serial": "VNM0W43917",
    "internalId": "TA-071",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Thanh Nga",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-095134",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-095134 từ Thanh Nga"
      }
    ]
  },
  {
    "serial": "VNM0W45618",
    "internalId": "TA-072",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Thanh Nga",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-095134",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-095134 từ Thanh Nga"
      }
    ]
  },
  {
    "serial": "VNM0W45625",
    "internalId": "TA-073",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Thanh Nga",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-095134",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-095134 từ Thanh Nga"
      }
    ]
  },
  {
    "serial": "VNM0W42658",
    "internalId": "TA-074",
    "model": "HP LaserJet M211dw",
    "tenHang": "Máy in laser đen trắng HP LaserJet M211dw (In đảo mặt tự động, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Thanh Nga",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-095134",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-095134 từ Thanh Nga"
      }
    ]
  },
  {
    "serial": "LM103BT260212572",
    "internalId": "TA-075",
    "model": "DAREU LM103",
    "tenHang": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260918-100016",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-100016 từ FPS"
      }
    ]
  },
  {
    "serial": "LM103BT260212577",
    "internalId": "TA-076",
    "model": "DAREU LM103",
    "tenHang": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260918-100016",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-100016 từ FPS"
      }
    ]
  },
  {
    "serial": "LM103BT260212578",
    "internalId": "TA-077",
    "model": "DAREU LM103",
    "tenHang": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260918-100016",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-100016 từ FPS"
      }
    ]
  },
  {
    "serial": "LM103BT260212590",
    "internalId": "TA-078",
    "model": "DAREU LM103",
    "tenHang": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260918-100016",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-100016 từ FPS"
      }
    ]
  },
  {
    "serial": "LM103BT260212589",
    "internalId": "TA-079",
    "model": "DAREU LM103",
    "tenHang": "Chuột máy tính có dây Gaming DAREU LM103 (Black, Cảm biến quang học)",
    "nhomHang": "Chuột, Bàn Phím",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "FPS",
    "ngayNhap": "20/08/2026",
    "maPhieuNhap": "PN-260918-100016",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "20/08/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-100016 từ FPS"
      }
    ]
  },
  {
    "serial": "BM501913352103213",
    "internalId": "TA-080",
    "model": "Dahua DHI-LM22-A210Y",
    "tenHang": "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    "nhomHang": "Màn Hình",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Trí Việt",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-120738",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-120738 từ Trí Việt"
      }
    ]
  },
  {
    "serial": "BM501913352100021",
    "internalId": "TA-081",
    "model": "Dahua DHI-LM22-A210Y",
    "tenHang": "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    "nhomHang": "Màn Hình",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Trí Việt",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-120738",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-120738 từ Trí Việt"
      }
    ]
  },
  {
    "serial": "BM501913352103194",
    "internalId": "TA-082",
    "model": "Dahua DHI-LM22-A210Y",
    "tenHang": "Màn hình máy tính Monitor DAHUA DHI-LM22-A210Y (21.5 inch FHD 75Hz, Cổng VGA/HDMI)",
    "nhomHang": "Màn Hình",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "Trí Việt",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260918-120738",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 24,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260918-120738 từ Trí Việt"
      }
    ]
  },
  {
    "serial": "WRD0LQRY",
    "internalId": "TA-083",
    "model": "HDD Seagate SkyHawk 8TB",
    "tenHang": "Ổ cứng HDD chuyên dụng camera/máy chủ Seagate SkyHawk 8TB 3.5 inch SATA3 (ST8000VX004)",
    "nhomHang": "Ổ Cứng (HDD)",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "N/A",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260919-081800",
    "status": "SOLD",
    "ngayXuat": "18/09/2026",
    "maPhieuXuat": "PX-260919-082129",
    "khachHang": "Nguyễn Thanh Tùng",
    "sdtKhach": "0989966619",
    "soThangBh": 12,
    "ngayHetHanBh": "18/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "18/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260919-082129 cho Nguyễn Thanh Tùng (SĐT: 0989966619). Hạn BH: 18/09/2027"
      },
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260919-081800 từ N/A"
      }
    ]
  },
  {
    "serial": "123456",
    "internalId": "TA-084",
    "model": "Jasonz T-G183",
    "tenHang": "Bộ mở rộng tín hiệu HDMI qua LAN 150m có KVM (Jasonz T-G183)",
    "nhomHang": "Thiết Bị Mạng & Kết Nối",
    "loaiHang": "Chính Hãng",
    "kho": "Kho VP",
    "ncc": "EASY",
    "ngayNhap": "18/09/2026",
    "maPhieuNhap": "PN-260919-090539",
    "status": "SOLD",
    "ngayXuat": "21/09/2026",
    "maPhieuXuat": "PX-260921-164736",
    "khachHang": "anh Luận",
    "sdtKhach": "0963732891",
    "soThangBh": 12,
    "ngayHetHanBh": "21/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260921-164736 cho anh Luận (SĐT: 0963732891). Hạn BH: 21/09/2027"
      },
      {
        "date": "18/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260919-090539 từ EASY"
      }
    ]
  },
  {
    "serial": "PHPA117934",
    "internalId": "TA-085",
    "model": "Canon LBP 243dw II",
    "tenHang": "Máy in laser đen trắng Canon LBP243dw II (Tốc độ cao, In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "Hưng Phúc",
    "ngayNhap": "21/09/2026",
    "maPhieuNhap": "PN-260921-155542",
    "status": "IN_STOCK",
    "ngayXuat": "",
    "maPhieuXuat": "",
    "khachHang": "",
    "sdtKhach": "",
    "soThangBh": 12,
    "ngayHetHanBh": "",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260921-155542 từ Hưng Phúc"
      }
    ]
  },
  {
    "serial": "PHPA118726",
    "internalId": "TA-086",
    "model": "Canon LBP 243dw II",
    "tenHang": "Máy in laser đen trắng Canon LBP243dw II (Tốc độ cao, In 2 mặt, Wifi/LAN)",
    "nhomHang": "Máy In",
    "loaiHang": "Nhập Khẩu",
    "kho": "Kho VP",
    "ncc": "Hưng Phúc",
    "ngayNhap": "21/09/2026",
    "maPhieuNhap": "PN-260921-155542",
    "status": "SOLD",
    "ngayXuat": "21/09/2026",
    "maPhieuXuat": "PX-260921-162918",
    "khachHang": "Mr. Đỉnh",
    "sdtKhach": "0969898168",
    "soThangBh": 12,
    "ngayHetHanBh": "21/09/2027",
    "ghiChu": "",
    "timeline": [
      {
        "date": "21/09/2026 09:30:00",
        "user": "admin",
        "action": "Xuất kho",
        "note": "Xuất bán theo phiếu PX-260921-162918 cho Mr. Đỉnh (SĐT: 0969898168). Hạn BH: 21/09/2027"
      },
      {
        "date": "21/09/2026 08:00:00",
        "user": "admin",
        "action": "Nhập kho",
        "note": "Nhập kho theo phiếu PN-260921-155542 từ Hưng Phúc"
      }
    ]
  }
];
  try {
    if (typeof localStorage !== 'undefined') {
      const savedSerials = localStorage.getItem('THANH_AN_SERIAL_DB');
      if (savedSerials) {
        const parsed = JSON.parse(savedSerials);
        if (Array.isArray(parsed) && parsed.length > 0) SERIAL_DB = parsed;
      }
    }
  } catch(e) {}

  // ====================================================
  // 3. CƠ SỞ DỮ LIỆU PHIẾU NHẬP & PHIẾU XUẤT (VOUCHERS_DB)
  // ====================================================
  let VOUCHERS_DB = {
  "nhap": [
    {
      "maPhieu": "PN-260911-140733",
      "ngay": "19/08/2026",
      "createdAt": "19/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "HP Laser 108a (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "CNB1T5GC6X",
          "internalId": "TA-001",
          "model": "HP Laser 108a",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "19/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-140819",
      "ngay": "09/09/2026",
      "createdAt": "09/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Nam Phát",
      "kho": "Kho VP",
      "model": "Canon LBP 6030w (5)",
      "soLuong": 5,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "NTMA681531",
          "internalId": "TA-002",
          "model": "Canon LBP 6030w",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTMA681178",
          "internalId": "TA-003",
          "model": "Canon LBP 6030w",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTMA682190",
          "internalId": "TA-004",
          "model": "Canon LBP 6030w",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTMA680176",
          "internalId": "TA-005",
          "model": "Canon LBP 6030w",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTMA680542",
          "internalId": "TA-006",
          "model": "Canon LBP 6030w",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "09/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Nam Phát"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141015",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "Canon LBP 6030 (5)",
      "soLuong": 5,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "NTLA767591",
          "internalId": "TA-007",
          "model": "Canon LBP 6030",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTLA863393",
          "internalId": "TA-008",
          "model": "Canon LBP 6030",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTLA863121",
          "internalId": "TA-009",
          "model": "Canon LBP 6030",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTLA776136",
          "internalId": "TA-010",
          "model": "Canon LBP 6030",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "NTLA863405",
          "internalId": "TA-011",
          "model": "Canon LBP 6030",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141202",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "Canon PIXMA G2010 (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "KPVF12443",
          "internalId": "TA-012",
          "model": "Canon PIXMA G2010",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141233",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "Brother ADS-4300DN (3)",
      "soLuong": 3,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "E81467J5X122374",
          "internalId": "TA-013",
          "model": "Brother ADS-4300DN",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "E81467J5X122321",
          "internalId": "TA-014",
          "model": "Brother ADS-4300DN",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "E81467J5X122298",
          "internalId": "TA-015",
          "model": "Brother ADS-4300DN",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141318",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "HP Laser 108w (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "CNB1T1P98B",
          "internalId": "TA-016",
          "model": "HP Laser 108w",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141413",
      "ngay": "07/09/2026",
      "createdAt": "07/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "Canon LBP 243dw II (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "PHRA105934",
          "internalId": "TA-017",
          "model": "Canon LBP 243dw II",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "07/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141500",
      "ngay": "21/08/2026",
      "createdAt": "21/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "Halloya 85A/325 Toner (5)",
      "soLuong": 5,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "TA-260911-001",
          "internalId": "TA-018",
          "model": "Halloya 85A/325 Toner",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "TA-260911-002",
          "internalId": "TA-019",
          "model": "Halloya 85A/325 Toner",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "TA-260911-003",
          "internalId": "TA-020",
          "model": "Halloya 85A/325 Toner",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "TA-260911-004",
          "internalId": "TA-021",
          "model": "Halloya 85A/325 Toner",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "TA-260911-005",
          "internalId": "TA-022",
          "model": "Halloya 85A/325 Toner",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "21/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141624",
      "ngay": "11/09/2026",
      "createdAt": "11/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "TJ INK Toner Cartridge (2)",
      "soLuong": 2,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "TA-260911-006",
          "internalId": "TA-023",
          "model": "TJ INK Toner Cartridge",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "TA-260911-007",
          "internalId": "TA-024",
          "model": "TJ INK Toner Cartridge",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "11/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-141701",
      "ngay": "07/09/2026",
      "createdAt": "07/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "Canon LBP 246dw II (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "PHEA127806",
          "internalId": "TA-025",
          "model": "Canon LBP 246dw II",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "07/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-153249",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "Canon LBP 6030w (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "NTMA779070",
          "internalId": "TA-026",
          "model": "Canon LBP 6030w",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260911-155551",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "FPS",
      "kho": "Kho VP",
      "model": "DAREU LK185 (9)",
      "soLuong": 9,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "LK185BSEA260127061",
          "internalId": "TA-027",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127062",
          "internalId": "TA-028",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127064",
          "internalId": "TA-029",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127065",
          "internalId": "TA-030",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127067",
          "internalId": "TA-031",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127068",
          "internalId": "TA-032",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127069",
          "internalId": "TA-033",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127070",
          "internalId": "TA-034",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LK185BSEA260127071",
          "internalId": "TA-035",
          "model": "DAREU LK185",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ FPS"
        }
      ]
    },
    {
      "maPhieu": "PN-260912-083643",
      "ngay": "12/09/2026",
      "createdAt": "12/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "HP LaserJet M211dw (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "VNM0WW42908",
          "internalId": "TA-036",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "12/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260912-205001",
      "ngay": "12/09/2026",
      "createdAt": "12/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Hưng Hà",
      "kho": "Kho VP",
      "model": "Lenovo ThinkPad E14 Gen 7 (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "PF685QNZ",
          "internalId": "TA-037",
          "model": "Lenovo ThinkPad E14 Gen 7",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "12/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Hưng Hà"
        }
      ]
    },
    {
      "maPhieu": "PN-260913-191519",
      "ngay": "10/09/2026",
      "createdAt": "10/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Nam Phát",
      "kho": "Nhà",
      "model": "HP LaserJet Pro 4003dw (14)",
      "soLuong": 14,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "VNMOY11287",
          "internalId": "TA-038",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNMOY10210",
          "internalId": "TA-039",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNMOY10215",
          "internalId": "TA-040",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNMOY10292",
          "internalId": "TA-041",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904374",
          "internalId": "TA-042",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904390",
          "internalId": "TA-043",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904400",
          "internalId": "TA-044",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904910",
          "internalId": "TA-045",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904918",
          "internalId": "TA-046",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904947",
          "internalId": "TA-047",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904953",
          "internalId": "TA-048",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1904963",
          "internalId": "TA-049",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM1906781",
          "internalId": "TA-050",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNMOY10206",
          "internalId": "TA-051",
          "model": "HP LaserJet Pro 4003dw",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "10/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Nam Phát"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-171953",
      "ngay": "15/08/2026",
      "createdAt": "15/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "HP LaserJet M211dw (2)",
      "soLuong": 2,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "VNM0W42889",
          "internalId": "TA-052",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM0W40960",
          "internalId": "TA-053",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-172547",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Trí Việt",
      "kho": "Kho VP",
      "model": "Dahua DHI-LM22-A210Y (2)",
      "soLuong": 2,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "BM501913352103212",
          "internalId": "TA-054",
          "model": "Dahua DHI-LM22-A210Y",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "BM501913352100975",
          "internalId": "TA-055",
          "model": "Dahua DHI-LM22-A210Y",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Trí Việt"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-180940",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "FPS",
      "kho": "Kho VP",
      "model": "Intel Core i5-12400 (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "U60F4Q2500498",
          "internalId": "TA-056",
          "model": "Intel Core i5-12400",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ FPS"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-181137",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Song Hùng",
      "kho": "Kho VP",
      "model": "RAM Hiksemi Armor 16GB DDR4 (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "30188230248",
          "internalId": "TA-057",
          "model": "RAM Hiksemi Armor 16GB DDR4",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Song Hùng"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-181217",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Song Hùng",
      "kho": "Kho VP",
      "model": "Darkflash H610M-VGD-V1 (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "H610M2511201388",
          "internalId": "TA-058",
          "model": "Darkflash H610M-VGD-V1",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Song Hùng"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-181257",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Song Hùng",
      "kho": "Kho VP",
      "model": "MSI GeForce RTX 3050 Ventus 2X (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "602-V809-2885S02601001478",
          "internalId": "TA-059",
          "model": "MSI GeForce RTX 3050 Ventus 2X",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Song Hùng"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-181456",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "FPS",
      "kho": "Kho VP",
      "model": "SSD CUSU 512GB NVMe (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "TKSMC25C8X01266",
          "internalId": "TA-060",
          "model": "SSD CUSU 512GB NVMe",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ FPS"
        }
      ]
    },
    {
      "maPhieu": "PN-260915-181623",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Song Hùng",
      "kho": "Kho VP",
      "model": "AIGO VK550 550W (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "GHD887363300087",
          "internalId": "TA-061",
          "model": "AIGO VK550 550W",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Song Hùng"
        }
      ]
    },
    {
      "maPhieu": "PN-260917-134355",
      "ngay": "17/09/2026",
      "createdAt": "17/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "NAKIO",
      "kho": "Kho VP",
      "model": "SSD Kingston KC600 512GB (2)",
      "soLuong": 2,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "5002687687698BFF",
          "internalId": "TA-062",
          "model": "SSD Kingston KC600 512GB",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "50026876876979D6",
          "internalId": "TA-063",
          "model": "SSD Kingston KC600 512GB",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "17/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ NAKIO"
        }
      ]
    },
    {
      "maPhieu": "PN-260917-173635",
      "ngay": "17/09/2026",
      "createdAt": "17/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Song Hùng",
      "kho": "Kho VP",
      "model": "i3-12100 (1) + Mainboard DarkFlash H610M (1) + Ram PC Hiksemi Armor 8GB DDR4 (1) + SSD Hiksemi  256GB (1) + Nguồn máy tính AIGO VK350   350W (5)",
      "soLuong": 5,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "U6QP281903042",
          "internalId": "TA-064",
          "model": "Intel Core i3-12100",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "H610M2511201381",
          "internalId": "TA-065",
          "model": "Darkflash H610M-VGD-V1",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "30199802874",
          "internalId": "TA-066",
          "model": "RAM Hiksemi Armor 8GB DDR4",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "30200802591",
          "internalId": "TA-067",
          "model": "SSD Hiksemi Wave 256GB",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "GHD887264200966",
          "internalId": "TA-068",
          "model": "AIGO VK350 350W",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "17/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Song Hùng"
        }
      ]
    },
    {
      "maPhieu": "PN-260917-175158",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "FPS",
      "kho": "Kho VP",
      "model": "DAREU LM103 (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "LM103BT260212588",
          "internalId": "TA-069",
          "model": "DAREU LM103",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ FPS"
        }
      ]
    },
    {
      "maPhieu": "PN-260918-095134",
      "ngay": "18/09/2026",
      "createdAt": "18/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Thanh Nga",
      "kho": "Kho VP",
      "model": "HP LaserJet M211dw (5)",
      "soLuong": 5,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "VNM0W45624",
          "internalId": "TA-070",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM0W43917",
          "internalId": "TA-071",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM0W45618",
          "internalId": "TA-072",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM0W45625",
          "internalId": "TA-073",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "VNM0W42658",
          "internalId": "TA-074",
          "model": "HP LaserJet M211dw",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "18/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Thanh Nga"
        }
      ]
    },
    {
      "maPhieu": "PN-260918-100016",
      "ngay": "20/08/2026",
      "createdAt": "20/08/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "FPS",
      "kho": "Kho VP",
      "model": "DAREU LM103 (5)",
      "soLuong": 5,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "LM103BT260212572",
          "internalId": "TA-075",
          "model": "DAREU LM103",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LM103BT260212577",
          "internalId": "TA-076",
          "model": "DAREU LM103",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LM103BT260212578",
          "internalId": "TA-077",
          "model": "DAREU LM103",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LM103BT260212590",
          "internalId": "TA-078",
          "model": "DAREU LM103",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "LM103BT260212589",
          "internalId": "TA-079",
          "model": "DAREU LM103",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "20/08/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ FPS"
        }
      ]
    },
    {
      "maPhieu": "PN-260918-120738",
      "ngay": "18/09/2026",
      "createdAt": "18/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Trí Việt",
      "kho": "Kho VP",
      "model": "Dahua DHI-LM22-A210Y (3)",
      "soLuong": 3,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "BM501913352103213",
          "internalId": "TA-080",
          "model": "Dahua DHI-LM22-A210Y",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "BM501913352100021",
          "internalId": "TA-081",
          "model": "Dahua DHI-LM22-A210Y",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "BM501913352103194",
          "internalId": "TA-082",
          "model": "Dahua DHI-LM22-A210Y",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "18/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Trí Việt"
        }
      ]
    },
    {
      "maPhieu": "PN-260919-081800",
      "ngay": "18/09/2026",
      "createdAt": "18/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "N/A",
      "kho": "Kho VP",
      "model": "HDD Seagate SkyHawk 8TB (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "WRD0LQRY",
          "internalId": "TA-083",
          "model": "HDD Seagate SkyHawk 8TB",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "18/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ N/A"
        }
      ]
    },
    {
      "maPhieu": "PN-260919-090539",
      "ngay": "18/09/2026",
      "createdAt": "18/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "EASY",
      "kho": "Kho VP",
      "model": "Jasonz T-G183 (1)",
      "soLuong": 1,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "123456",
          "internalId": "TA-084",
          "model": "Jasonz T-G183",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "18/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ EASY"
        }
      ]
    },
    {
      "maPhieu": "PN-260921-155542",
      "ngay": "21/09/2026",
      "createdAt": "21/09/2026 08:00:00",
      "updatedAt": "",
      "updatedBy": "",
      "ncc": "Hưng Phúc",
      "kho": "Kho VP",
      "model": "Canon LBP 243dw II (2)",
      "soLuong": 2,
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu nhập kho Thành An ERP",
      "items": [
        {
          "serial": "PHPA117934",
          "internalId": "TA-085",
          "model": "Canon LBP 243dw II",
          "loaiHang": "Chính Hãng"
        },
        {
          "serial": "PHPA118726",
          "internalId": "TA-086",
          "model": "Canon LBP 243dw II",
          "loaiHang": "Chính Hãng"
        }
      ],
      "history": [
        {
          "time": "21/09/2026 08:00:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Nhập kho từ Hưng Phúc"
        }
      ]
    }
  ],
  "xuat": [
    {
      "maPhieu": "PX-260912-083937",
      "ngay": "12/09/2026",
      "createdAt": "12/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ KHOA NHÂN  (0963093555)",
      "sdtKhach": "KACAJOIN",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Khách hàng qua vp lấy",
      "items": [
        {
          "model": "HP LaserJet M211dw",
          "serial": "VNM0WW42908",
          "internalId": "TA-036",
          "soThangBh": 12,
          "ngayHetHanBh": "12/09/2027"
        }
      ],
      "history": [
        {
          "time": "12/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ KHOA NHÂN  (0963093555)"
        }
      ]
    },
    {
      "maPhieu": "PX-260912-214430",
      "ngay": "12/09/2026",
      "createdAt": "12/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "Công ty cổ phần giải pháp công nghệ và truyền Thông Việt  (097202266)",
      "sdtKhach": "C Hà",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Lenovo ThinkPad E14 Gen 7",
          "serial": "PF685QNZ",
          "internalId": "TA-037",
          "soThangBh": 12,
          "ngayHetHanBh": "12/09/2027"
        }
      ],
      "history": [
        {
          "time": "12/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho Công ty cổ phần giải pháp công nghệ và truyền Thông Việt  (097202266)"
        }
      ]
    },
    {
      "maPhieu": "PX-260915-172950",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "CÔNG TY TNHH X.E VIỆT NAM  (0909689886)",
      "sdtKhach": "A Dương",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Dahua DHI-LM22-A210Y",
          "serial": "BM501913352100975",
          "internalId": "TA-055",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        },
        {
          "model": "Canon LBP 6030",
          "serial": "NTLA863393",
          "internalId": "TA-008",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho CÔNG TY TNHH X.E VIỆT NAM  (0909689886)"
        }
      ]
    },
    {
      "maPhieu": "PX-260915-174408",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "e Vân",
      "sdtKhach": "0383500018",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "HP LaserJet M211dw",
          "serial": "VNM0W40960",
          "internalId": "TA-053",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho e Vân"
        }
      ]
    },
    {
      "maPhieu": "PX-260916-154235",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "CÔNG TY TNHH X.E VIỆT NAM  (909689886)",
      "sdtKhach": "A Dương",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Intel Core i5-12400",
          "serial": "U60F4Q2500498",
          "internalId": "TA-056",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho CÔNG TY TNHH X.E VIỆT NAM  (909689886)"
        }
      ]
    },
    {
      "maPhieu": "PX-260916-154906",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "CÔNG TY TNHH X.E VIỆT NAM  (909689886)",
      "sdtKhach": "A Dương",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "RAM Hiksemi Armor 16GB DDR4",
          "serial": "30188230248",
          "internalId": "TA-057",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho CÔNG TY TNHH X.E VIỆT NAM  (909689886)"
        }
      ]
    },
    {
      "maPhieu": "PX-260916-155029",
      "ngay": "16/09/2026",
      "createdAt": "16/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "CÔNG TY TNHH X.E VIỆT NAM  (909689886)",
      "sdtKhach": "A Dương",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Darkflash H610M-VGD-V1",
          "serial": "H610M2511201388",
          "internalId": "TA-058",
          "soThangBh": 12,
          "ngayHetHanBh": "16/09/2027"
        }
      ],
      "history": [
        {
          "time": "16/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho CÔNG TY TNHH X.E VIỆT NAM  (909689886)"
        }
      ]
    },
    {
      "maPhieu": "PX-260916-155311",
      "ngay": "15/09/2026",
      "createdAt": "15/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "CÔNG TY TNHH X.E VIỆT NAM  (909689886)",
      "sdtKhach": "A Dương",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "MSI GeForce RTX 3050 Ventus 2X",
          "serial": "602-V809-2885S02601001478",
          "internalId": "TA-059",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        },
        {
          "model": "SSD CUSU 512GB NVMe",
          "serial": "TKSMC25C8X01266",
          "internalId": "TA-060",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        },
        {
          "model": "AIGO VK550 550W",
          "serial": "GHD887363300087",
          "internalId": "TA-061",
          "soThangBh": 12,
          "ngayHetHanBh": "15/09/2027"
        }
      ],
      "history": [
        {
          "time": "15/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho CÔNG TY TNHH X.E VIỆT NAM  (909689886)"
        }
      ]
    },
    {
      "maPhieu": "PX-260917-092624",
      "ngay": "28/08/2026",
      "createdAt": "28/08/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "Quang",
      "sdtKhach": "0976147203",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Canon LBP 6030",
          "serial": "NTLA863405",
          "internalId": "TA-011",
          "soThangBh": 12,
          "ngayHetHanBh": "28/08/2027"
        },
        {
          "model": "Canon LBP 6030",
          "serial": "NTLA776136",
          "internalId": "TA-010",
          "soThangBh": 12,
          "ngayHetHanBh": "28/08/2027"
        }
      ],
      "history": [
        {
          "time": "28/08/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho Quang"
        }
      ]
    },
    {
      "maPhieu": "PX-260917-175255",
      "ngay": "17/09/2026",
      "createdAt": "17/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "Chị Phương",
      "sdtKhach": "0325470077",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Intel Core i3-12100",
          "serial": "U6QP281903042",
          "internalId": "TA-064",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        },
        {
          "model": "Darkflash H610M-VGD-V1",
          "serial": "H610M2511201381",
          "internalId": "TA-065",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        },
        {
          "model": "RAM Hiksemi Armor 8GB DDR4",
          "serial": "30199802874",
          "internalId": "TA-066",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        },
        {
          "model": "SSD Hiksemi Wave 256GB",
          "serial": "30200802591",
          "internalId": "TA-067",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        },
        {
          "model": "AIGO VK350 350W",
          "serial": "GHD887264200966",
          "internalId": "TA-068",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        },
        {
          "model": "Dahua DHI-LM22-A210Y",
          "serial": "BM501913352103212",
          "internalId": "TA-054",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        },
        {
          "model": "DAREU LK185",
          "serial": "LK185BSEA260127062",
          "internalId": "TA-028",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        },
        {
          "model": "DAREU LM103",
          "serial": "LM103BT260212588",
          "internalId": "TA-069",
          "soThangBh": 24,
          "ngayHetHanBh": "17/09/2028"
        }
      ],
      "history": [
        {
          "time": "17/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho Chị Phương"
        }
      ]
    },
    {
      "maPhieu": "PX-260919-082129",
      "ngay": "18/09/2026",
      "createdAt": "18/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "Nguyễn Thanh Tùng",
      "sdtKhach": "0989966619",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "HDD Seagate SkyHawk 8TB",
          "serial": "WRD0LQRY",
          "internalId": "TA-083",
          "soThangBh": 12,
          "ngayHetHanBh": "18/09/2027"
        }
      ],
      "history": [
        {
          "time": "18/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho Nguyễn Thanh Tùng"
        }
      ]
    },
    {
      "maPhieu": "PX-260919-085717",
      "ngay": "19/09/2026",
      "createdAt": "19/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "CÔNG TY TNHH THƯƠNG MẠI DƯỢC PHẨM TRUNG TÍN",
      "sdtKhach": "0868749555",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "HP LaserJet M211dw",
          "serial": "VNM0W42889",
          "internalId": "TA-052",
          "soThangBh": 12,
          "ngayHetHanBh": "19/09/2027"
        }
      ],
      "history": [
        {
          "time": "19/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho CÔNG TY TNHH THƯƠNG MẠI DƯỢC PHẨM TRUNG TÍN"
        }
      ]
    },
    {
      "maPhieu": "PX-260921-162918",
      "ngay": "21/09/2026",
      "createdAt": "21/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "Mr. Đỉnh",
      "sdtKhach": "0969898168",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Canon LBP 243dw II",
          "serial": "PHRA105934",
          "internalId": "TA-017",
          "soThangBh": 12,
          "ngayHetHanBh": "21/09/2027"
        },
        {
          "model": "Canon LBP 243dw II",
          "serial": "PHPA118726",
          "internalId": "TA-086",
          "soThangBh": 12,
          "ngayHetHanBh": "21/09/2027"
        }
      ],
      "history": [
        {
          "time": "21/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho Mr. Đỉnh"
        }
      ]
    },
    {
      "maPhieu": "PX-260921-164736",
      "ngay": "21/09/2026",
      "createdAt": "21/09/2026 09:30:00",
      "updatedAt": "",
      "updatedBy": "",
      "khachHang": "anh Luận",
      "sdtKhach": "0963732891",
      "diaChi": "",
      "kho": "Kho VP",
      "model": "",
      "status": "CONFIRMED",
      "nguoiTao": "Khổng Mạnh Cường",
      "ghiChu": "Phiếu xuất kho bán hàng",
      "items": [
        {
          "model": "Jasonz T-G183",
          "serial": "123456",
          "internalId": "TA-084",
          "soThangBh": 12,
          "ngayHetHanBh": "21/09/2027"
        }
      ],
      "history": [
        {
          "time": "21/09/2026 09:30:00",
          "user": "Khổng Mạnh Cường",
          "action": "TẠO PHIẾU",
          "note": "Xuất bán cho anh Luận"
        }
      ]
    }
  ]
};
  try {
    if (typeof localStorage !== 'undefined') {
      const savedVouchers = localStorage.getItem('THANH_AN_VOUCHERS_DB');
      if (savedVouchers) {
        const parsed = JSON.parse(savedVouchers);
        if (parsed && Array.isArray(parsed.nhap) && parsed.nhap.length > 0) VOUCHERS_DB = parsed;
      }
    }
  } catch(e) {}

  // 4. CƠ SỞ DỮ LIỆU BẢO HÀNH (WARRANTY CASES)
  let WARRANTY_CASES_DB = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const savedWarranty = localStorage.getItem('THANH_AN_WARRANTY_CASES_DB');
      if (savedWarranty) WARRANTY_CASES_DB = JSON.parse(savedWarranty);
    }
  } catch(e) {}

  // 5. CƠ SỞ DỮ LIỆU PHIÊN KIỂM KÊ KHO
  let INVENTORY_SESSIONS_DB = [];

  // ====================================================
  // 6. NHẬT KÝ HOẠT ĐỘNG (AUDIT_LOG_DB) - 62 LOGS GỐC
  // ====================================================
  let AUDIT_LOG_DB = [
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-115634",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XUẤT KHO",
    "target": "PX-260911-124810",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "A",
    "action": "SỬA THIẾT BỊ",
    "target": "SN-005",
    "note": "Đổi thông tin",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Admin",
    "action": "SAO LƯU DỮ LIỆU",
    "target": "-",
    "note": "Tạo bản sao lưu: [BACKUP] THANH_AN_ERP_20260911_135200",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Admin",
    "action": "RESET HỆ THỐNG",
    "target": "ALL",
    "note": "Đã xóa toàn bộ máy móc tồn kho và lịch sử giao dịch về trắng.",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Admin",
    "action": "SAO LƯU DỮ LIỆU",
    "target": "-",
    "note": "Tạo bản sao lưu: [BACKUP] THANH_AN_ERP_20260911_135207",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Admin",
    "action": "RESET HỆ THỐNG",
    "target": "ALL",
    "note": "Đã xóa toàn bộ máy móc tồn kho và lịch sử giao dịch về trắng.",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-140733",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-140819",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141015",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141121",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141202",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141233",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141318",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141413",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141500",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141624",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260911-141701",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260911-153249",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "11/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260911-155551",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "12/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260912-083643",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "12/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XÓA MÁY",
    "target": "VNM0WW42908",
    "note": "Đã xóa khỏi kho",
    "module": "Kho"
  },
  {
    "time": "12/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260912-083809",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "12/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XUẤT KHO",
    "target": "PX-260912-083937",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "12/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260912-205001",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "12/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "SỬA THIẾT BỊ",
    "target": "PF685QNZ",
    "note": "Đổi thông tin",
    "module": "Kho"
  },
  {
    "time": "12/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XUẤT KHO",
    "target": "PX-260912-214430",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "13/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260913-191519",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XÓA MÁY",
    "target": "VNM0W42889",
    "note": "Đã xóa khỏi kho",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XÓA MÁY",
    "target": "VNM0W12908",
    "note": "Đã xóa khỏi kho",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XÓA MÁY",
    "target": "VNM0W40960",
    "note": "Đã xóa khỏi kho",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "NHẬP KHO",
    "target": "PN-260915-171953",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260915-172547",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260915-172950",
    "note": "Bán 2 máy",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "XÓA MÁY",
    "target": "VNM0W12908",
    "note": "Đã xóa khỏi kho",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260915-174408",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260915-180940",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260915-181137",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260915-181217",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260915-181257",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260915-181456",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "15/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260915-181623",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "16/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260916-154235",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "16/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260916-154906",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "16/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260916-155029",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "16/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260916-155311",
    "note": "Bán 3 máy",
    "module": "Kho"
  },
  {
    "time": "17/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260917-092624",
    "note": "Bán 2 máy",
    "module": "Kho"
  },
  {
    "time": "17/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260917-134355",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "17/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260917-173635",
    "note": "Nhập 5 loại hàng",
    "module": "Kho"
  },
  {
    "time": "17/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260917-175158",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "17/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260917-175255",
    "note": "Bán 8 máy",
    "module": "Kho"
  },
  {
    "time": "18/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260918-095134",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "18/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260918-100016",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "18/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260918-120738",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "19/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260919-081800",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "19/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260919-082129",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "19/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260919-085717",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "19/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260919-090539",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "21/09/2026",
    "user": "Khổng Minh Quân",
    "action": "NHẬP KHO",
    "target": "PN-260921-155542",
    "note": "Nhập 1 loại hàng",
    "module": "Kho"
  },
  {
    "time": "21/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260921-162918",
    "note": "Bán 2 máy",
    "module": "Kho"
  },
  {
    "time": "21/09/2026",
    "user": "Khổng Minh Quân",
    "action": "XUẤT KHO",
    "target": "PX-260921-164736",
    "note": "Bán 1 máy",
    "module": "Kho"
  },
  {
    "time": "21/09/2026",
    "user": "Khổng Mạnh Cường",
    "action": "SỬA THIẾT BỊ",
    "target": "CNB1T5GC6X",
    "note": "Đổi thông tin",
    "module": "Kho"
  }
];
  try {
    if (typeof localStorage !== 'undefined') {
      const savedLogs = localStorage.getItem('THANH_AN_AUDIT_LOGS');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed) && parsed.length > 0) AUDIT_LOG_DB = parsed;
      }
    }
  } catch(e) {}

  if (typeof window !== 'undefined') {
    try { if (typeof INITIAL_BRANDS !== 'undefined') window.INITIAL_BRANDS = INITIAL_BRANDS; } catch(e){}
    try { if (typeof INITIAL_CATEGORIES !== 'undefined') window.INITIAL_CATEGORIES = INITIAL_CATEGORIES; } catch(e){}
    try { if (typeof INITIAL_PRODUCTS !== 'undefined') window.INITIAL_PRODUCTS = INITIAL_PRODUCTS; } catch(e){}
    try { if (typeof INITIAL_SUPPLIERS !== 'undefined') window.INITIAL_SUPPLIERS = INITIAL_SUPPLIERS; } catch(e){}
    try { if (typeof INITIAL_CUSTOMERS !== 'undefined') window.INITIAL_CUSTOMERS = INITIAL_CUSTOMERS; } catch(e){}
    try { if (typeof INITIAL_WAREHOUSES !== 'undefined') window.INITIAL_WAREHOUSES = INITIAL_WAREHOUSES; } catch(e){}
    try { if (typeof CURRENT_ROLE !== 'undefined') window.CURRENT_ROLE = CURRENT_ROLE; } catch(e){}
    try { if (typeof CURRENT_USER_NAME !== 'undefined') window.CURRENT_USER_NAME = CURRENT_USER_NAME; } catch(e){}
    try { if (typeof SERIAL_DB !== 'undefined') window.SERIAL_DB = SERIAL_DB; } catch(e){}
    try { if (typeof VOUCHERS_DB !== 'undefined') window.VOUCHERS_DB = VOUCHERS_DB; } catch(e){}
    try { if (typeof AUDIT_LOG_DB !== 'undefined') window.AUDIT_LOG_DB = AUDIT_LOG_DB; } catch(e){}
    try { if (typeof WARRANTY_CASES_DB !== 'undefined') window.WARRANTY_CASES_DB = WARRANTY_CASES_DB; } catch(e){}
    try { if (typeof USERS_DB !== 'undefined') window.USERS_DB = USERS_DB; } catch(e){}
    try { if (typeof ALL_PERMISSIONS !== 'undefined') window.ALL_PERMISSIONS = ALL_PERMISSIONS; } catch(e){}
    try { if (typeof ROLE_PERMISSIONS !== 'undefined') window.ROLE_PERMISSIONS = ROLE_PERMISSIONS; } catch(e){}
  }
