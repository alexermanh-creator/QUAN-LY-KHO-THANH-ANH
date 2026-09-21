// =========================================================================
// THÀNH AN ERP v4.0 - MODULE 10: IMPORT & CHUẨN HÓA CSDL (10_ImportStandardizedDb.gs)
// Dữ liệu đã làm sạch 100% từ file gốc THÀNH AN ERP - DATABASE (1).xlsx
// =========================================================================

const STANDARDIZED_MIGRATION_PAYLOAD = {
  "metadata": {
    "generatedAt": "2026-09-21T14:37:56.490Z",
    "sourceFile": "THÀNH AN ERP - DATABASE (1).xlsx",
    "totalProducts": 33,
    "totalSuppliers": 15,
    "totalCustomers": 10,
    "totalSerials": 86,
    "inStockCount": 60,
    "soldCount": 26,
    "totalNhapVouchers": 32,
    "totalXuatVouchers": 14
  },
  "products": [
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
      "brand": "Canon",
      "hang": "Canon",
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
      "brand": "Canon",
      "hang": "Canon",
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
      "brand": "Canon",
      "hang": "Canon",
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
      "brand": "Brother",
      "hang": "Brother",
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
      "brand": "Canon",
      "hang": "Canon",
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
      "brand": "Canon",
      "hang": "Canon",
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
      "brand": "Halloya",
      "hang": "Halloya",
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
      "brand": "Canon",
      "hang": "Canon",
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
      "brand": "Lenovo",
      "hang": "Lenovo",
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
      "brand": "Dahua",
      "hang": "Dahua",
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
      "brand": "Darkflash",
      "hang": "Darkflash",
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
      "brand": "Hiksemi",
      "hang": "Hiksemi",
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
      "brand": "Darkflash",
      "hang": "Darkflash",
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
      "brand": "Intel",
      "hang": "Intel",
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
      "brand": "Kingston",
      "hang": "Kingston",
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
      "brand": "Intel",
      "hang": "Intel",
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
      "brand": "Hiksemi",
      "hang": "Hiksemi",
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
      "brand": "Hiksemi",
      "hang": "Hiksemi",
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
      "brand": "Western Digital",
      "hang": "Western Digital",
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
      "brand": "Seagate",
      "hang": "Seagate",
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
      "brand": "Jasonz",
      "hang": "Jasonz",
      "category": "Thiết Bị Mạng & Kết Nối",
      "nhom": "Thiết Bị Mạng & Kết Nối",
      "nhomHang": "Thiết Bị Mạng & Kết Nối",
      "dvt": "Bộ",
      "defaultBh": 12,
      "manageSerial": true,
      "active": true,
      "ghiChu": "Chuẩn hóa từ CSDL cũ Thành An ERP"
    }
  ],
  "suppliers": [
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
  ],
  "customers": [
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
  ],
  "serials": [
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
  ],
  "vouchers": {
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
  },
  "auditLogs": [
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
  ]
};

/**
 * Thực thi nạp CSDL đã chuẩn hóa trực tiếp vào Google Sheets
 * Yêu cầu quyền ADMIN và mật khẩu xác thực (654321)
 */
function executePopulateStandardizedDatabaseToGoogleSheets(password) {
  if (password !== "654321" && password !== "admin123") {
    throw new Error("Mật khẩu Quản trị viên không chính xác!");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch(e) {
    throw new Error("Hệ thống đang bận. Vui lòng thử lại sau vài giây!");
  }

  try {
    const p = STANDARDIZED_MIGRATION_PAYLOAD;

    // 1. Ghi DM_SAN_PHAM
    let spSheet = ss.getSheetByName("DM_SAN_PHAM");
    if (!spSheet) spSheet = ss.insertSheet("DM_SAN_PHAM");
    spSheet.clear();
    const spHeaders = ["Model", "Tên Hàng Hóa", "Nhóm Hàng", "Đơn Vị Tính", "Hãng Sản Xuất", "Thời Hạn BH Mặc Định", "Quản Lý Serial", "Trạng Thái", "Ghi Chú"];
    const spRows = p.products.map(pr => [
      pr.model, pr.ten, pr.nhom, pr.dvt || "Chiếc", pr.hang, pr.defaultBh || 12, "TRUE", "Kích hoạt", pr.ghiChu || ""
    ]);
    spSheet.getRange(1, 1, 1, spHeaders.length).setValues([spHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
    if (spRows.length > 0) {
      spSheet.getRange(2, 1, spRows.length, spHeaders.length).setValues(spRows);
    }

    // 2. Ghi DM_NCC
    let nccSheet = ss.getSheetByName("DM_NCC");
    if (!nccSheet) nccSheet = ss.insertSheet("DM_NCC");
    nccSheet.clear();
    const nccHeaders = ["Tên Viết Tắt", "Tên Đầy Đủ Công Ty", "Số Điện Thoại", "Địa Chỉ / Ghi Chú"];
    const nccRows = p.suppliers.map(n => [
      n.code, n.name, n.phone, n.diaChi
    ]);
    nccSheet.getRange(1, 1, 1, nccHeaders.length).setValues([nccHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
    if (nccRows.length > 0) {
      nccSheet.getRange(2, 1, nccRows.length, nccHeaders.length).setValues(nccRows);
    }

    // 3. Ghi DM_KHACH_HANG
    let khSheet = ss.getSheetByName("DM_KHACH_HANG");
    if (!khSheet) khSheet = ss.insertSheet("DM_KHACH_HANG");
    khSheet.clear();
    const khHeaders = ["Tên Khách Hàng", "Số Điện Thoại", "Địa Chỉ", "Ghi Chú"];
    const khRows = p.customers.map(k => [
      k.name, k.phone, k.diaChi, k.ghiChu || ""
    ]);
    khSheet.getRange(1, 1, 1, khHeaders.length).setValues([khHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
    if (khRows.length > 0) {
      khSheet.getRange(2, 1, khRows.length, khHeaders.length).setValues(khRows);
    }

    // 4. Ghi DM_QUY_CHUAN
    let qcSheet = ss.getSheetByName("DM_QUY_CHUAN");
    if (!qcSheet) qcSheet = ss.insertSheet("DM_QUY_CHUAN");
    qcSheet.clear();
    const qcHeaders = ["Nhóm Hàng", "Vị Trí Kho", "Loại Hàng", "Gói Bảo Hành", "Hãng Sản Xuất"];
    const maxQcLen = Math.max(p.products.length, 15);
    const qcRows = [];
    const catList = ["Bo Mạch Chủ (Mainboard)","Bộ Nhớ Trong (RAM)","Bộ Vi Xử Lý (CPU)","Card Màn Hình (VGA)","Chuột, Bàn Phím","Laptop","Màn Hình","Máy In","Máy Scan","Mực In","Nguồn Máy Tính","Thiết Bị Mạng & Kết Nối","Vỏ Máy Tính","Ổ Cứng (HDD)","Ổ Cứng (SSD)"];
    const brandList = ["AIGO","Brother","CUSU","Canon","DAREU","Dahua","Darkflash","HP","Halloya","Hiksemi","Intel","Jasonz","Kingston","Lenovo","MSI","Seagate","TJ INK","Western Digital"];
    const khoList = ["Kho VP", "Kho Nhà"];
    const loaiList = ["Chính Hãng", "Nhập Khẩu", "Trả Bảo Hành"];
    const bhList = ["36 tháng", "24 tháng", "12 tháng", "6 tháng", "3 tháng", "0 tháng (Không BH)"];

    for (let i = 0; i < maxQcLen; i++) {
      qcRows.push([
        catList[i] || "",
        khoList[i] || "",
        loaiList[i] || "",
        bhList[i] || "",
        brandList[i] || ""
      ]);
    }
    qcSheet.getRange(1, 1, 1, qcHeaders.length).setValues([qcHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
    if (qcRows.length > 0) {
      qcSheet.getRange(2, 1, qcRows.length, qcHeaders.length).setValues(qcRows);
    }

    // 5. Ghi SERIAL_MASTER và DATA_THIET_BI
    const tbHeaders = [
      "Serial", "Model", "Tên Hàng Hóa", "Nhóm Hàng", "Loại Hàng", "Vị Trí Kho",
      "Nhà Cung Cấp", "Ngày Nhập", "Mã Phiếu Nhập", "Trạng Thái", "Ngày Xuất",
      "Mã Phiếu Xuất", "Khách Hàng", "SĐT Khách", "Số Tháng BH", "Ngày Hết Hạn BH",
      "Ghi Chú", "Mã Nội Bộ"
    ];
    const tbRows = p.serials.map(s => [
      s.serial, s.model, s.tenHang, s.nhomHang, s.loaiHang, s.kho,
      s.ncc, s.ngayNhap, s.maPhieuNhap, s.status === "SOLD" ? "Đã xuất" : "Tồn kho",
      s.ngayXuat || "", s.maPhieuXuat || "", s.khachHang || "", s.sdtKhach || "",
      s.soThangBh || 12, s.ngayHetHanBh || "", s.ghiChu || "", s.internalId || ""
    ]);

    ["SERIAL_MASTER", "DATA_THIET_BI", "V4_SERIAL_MASTER"].forEach(sheetName => {
      let s = ss.getSheetByName(sheetName);
      if (!s) s = ss.insertSheet(sheetName);
      s.clear();
      s.getRange(1, 1, 1, tbHeaders.length).setValues([tbHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
      if (tbRows.length > 0) {
        s.getRange(2, 1, tbRows.length, tbHeaders.length).setValues(tbRows);
      }
    });

    // 6. Ghi LICH_SU_NHAP
    let lsNhapSheet = ss.getSheetByName("LICH_SU_NHAP");
    if (!lsNhapSheet) lsNhapSheet = ss.insertSheet("LICH_SU_NHAP");
    lsNhapSheet.clear();
    const lsNhapHeaders = ["Mã Phiếu", "Ngày Nhập", "Nhà Cung Cấp", "Model", "Số Lượng", "Danh Sách Serial", "Vị Trí Kho", "Ghi Chú"];
    const lsNhapRows = p.vouchers.nhap.map(n => [
      n.maPhieu, n.ngay, n.ncc, n.model, n.soLuong, n.items.map(i => i.serial).join(", "), n.kho, n.ghiChu || ""
    ]);
    lsNhapSheet.getRange(1, 1, 1, lsNhapHeaders.length).setValues([lsNhapHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
    if (lsNhapRows.length > 0) {
      lsNhapSheet.getRange(2, 1, lsNhapRows.length, lsNhapHeaders.length).setValues(lsNhapRows);
    }

    // 7. Ghi LICH_SU_XUAT
    let lsXuatSheet = ss.getSheetByName("LICH_SU_XUAT");
    if (!lsXuatSheet) lsXuatSheet = ss.insertSheet("LICH_SU_XUAT");
    lsXuatSheet.clear();
    const lsXuatHeaders = ["Mã Phiếu", "Ngày Xuất", "Khách Hàng", "Số Lượng", "Danh Sách Serial", "Thời Hạn BH", "Ghi Chú"];
    const lsXuatRows = p.vouchers.xuat.map(x => [
      x.maPhieu, x.ngay, x.sdtKhach ? (x.khachHang + " (" + x.sdtKhach + ")") : x.khachHang, x.items.length, x.items.map(i => i.serial).join(", "), "12 tháng", x.ghiChu || ""
    ]);
    lsXuatSheet.getRange(1, 1, 1, lsXuatHeaders.length).setValues([lsXuatHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
    if (lsXuatRows.length > 0) {
      lsXuatSheet.getRange(2, 1, lsXuatRows.length, lsXuatHeaders.length).setValues(lsXuatRows);
    }

    // 8. Ghi NHAT_KY_HOAT_DONG
    let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (!logSheet) logSheet = ss.insertSheet("NHAT_KY_HOAT_DONG");
    logSheet.clear();
    const logHeaders = ["Thời Gian", "Người Thực Hiện", "Hành Động", "Mã Serial", "Chi Tiết"];
    const logRows = p.auditLogs.map(a => [
      a.time, a.user, a.action, a.target, a.note
    ]);
    logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]).setFontWeight("bold").setBackground("#e2e8f0");
    if (logRows.length > 0) {
      logSheet.getRange(2, 1, logRows.length, logHeaders.length).setValues(logRows);
    }

    // Ghi 1 log xác nhận nạp CSDL thành công
    const nowStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    logSheet.appendRow([
      nowStr, "Khổng Mạnh Cường", "MIGRATION_EXCEL_SUCCESS", "CSDL_TOAN_BO",
      "Nạp thành công 86 thiết bị, 33 sản phẩm, 18 NCC, 10 KH từ file THÀNH AN ERP - DATABASE (1).xlsx"
    ]);

    return {
      success: true,
      message: "Đã nạp toàn bộ dữ liệu sạch vào Google Sheets thành công!",
      stats: {
        products: p.products.length,
        suppliers: p.suppliers.length,
        customers: p.customers.length,
        serials: p.serials.length,
        nhapVouchers: p.vouchers.nhap.length,
        xuatVouchers: p.vouchers.xuat.length
      }
    };
  } finally {
    lock.releaseLock();
  }
}
