# 📘 TÀI LIỆU HƯỚNG DẪN SỬ DỤNG TOÀN DIỆN THÀNH AN ERP v4.0
> **HỆ THỐNG QUẢN TRỊ KHO & VÒNG ĐỜI THIẾT BỊ IT SERIAL-CENTRIC CHUYÊN NGHIỆP**  
> *Dành cho: Ban Giám Đốc, Quản Lý Kho, Thủ Kho và Kỹ Thuật Viên Công Ty Thành An*  
> *Phiên bản: v4.0 Enterprise Official | Ngày ban hành: 21/09/2026*

---

## 📑 MỤC LỤC
1. [Tổng Quan Hệ Thống & Các Đường Link Quan Trọng](#1-tổng-quan-hệ-thống--các-đường-link-quan-trọng)
2. [Tài Khoản Đăng Nhập & Phân Quyền Người Dùng](#2-tài-khoản-đăng-nhập--phân-quyền-người-dùng)
3. [Bảng Điều Khiển Dashboard & Tìm Kiếm Nhanh Spotlight (Ctrl + K)](#3-bảng-điều-khiển-dashboard--tìm-kiếm-nhanh-spotlight-ctrl--k)
4. [Quản Lý Tồn Kho 2 Góc Nhìn & Tra Cứu Hồ Sơ Serial 360°](#4-quản-lý-tồn-kho-2-góc-nhìn--tra-cứu-hồ-sơ-serial-360)
5. [Quy Trình Nhập Kho Đơn Chiếc, Hàng Loạt & Bộ Linh Kiện](#5-quy-trình-nhập-kho-đơn-chiếc-hàng-loạt--bộ-linh-kiện)
6. [Quy Trình Xuất Kho Bán Hàng & Xuất Bộ Combo PC Hoàn Chỉnh](#6-quy-trình-xuất-kho-bán-hàng--xuất-bộ-combo-pc-hoàn-chỉnh)
7. [Tính Năng Chỉnh Sửa Phiếu Nhập / Xuất Toàn Diện (Full Fields)](#7-tính-năng-chỉnh-sửa-phiếu-nhập--xuất-toàn-diện-full-fields)
8. [Hướng Dẫn Quét Mã Vạch: Súng Quét USB/Bluetooth & Camera Live Video](#8-hướng-dẫn-quét-mã-vạch-súng-quét-usbbluetooth--camera-live-video)
9. [Quản Lý Danh Mục Chuẩn Hóa (Hãng, Model Chuẩn, Khách Hàng, NCC)](#9-quản-lý-danh-mục-chuẩn-hóa-hãng-model-chuẩn-khách-hàng-ncc)
10. [Nghiệp Vụ Kho Mở Rộng & Quản Lý Bảo Hành Sửa Chữa](#10-nghiệp-vụ-kho-mở-rộng--quản-lý-bảo-hành-sửa-chữa)
11. [Sao Lưu, Khôi Phục, Nạp CSDL Chuẩn Hóa & Reset Hệ Thống](#11-sao-lưu-khôi-phục-nạp-csdl-chuẩn-hóa--reset-hệ-thống)
12. [Cẩm Nang Kỹ Thuật 1-Click Cập Nhật Code Lên Google Sheets & GitHub](#12-cẩm-nang-kỹ-thuật-1-click-cập-nhật-code-lên-google-sheets--github)

---

## 1. TỔNG QUAN HỆ THỐNG & CÁC ĐƯỜNG LINK QUAN TRỌNG

Hệ thống **Thành An ERP v4.0** được thiết kế theo triết lý **Serial-Centric** (mỗi thiết bị IT là một thực thể định danh duy nhất). Hệ thống giải quyết triệt để các bài toán đặc thù của doanh nghiệp phân phối thiết bị tin học, máy in, linh kiện máy tính:
* Không bao giờ bị mất dấu vết thiết bị: Biết chính xác máy này nhập ngày nào, từ nhà cung cấp nào, nằm ở kho nào, đã bán cho ai, ai nhận máy, và còn bao nhiêu ngày bảo hành.
* Đồng bộ 2 chiều thời gian thực giữa Web App trực quan và Google Sheets làm cơ sở dữ liệu nền tảng.

### Các đường link truy cập chính thức:

| Hạng mục | Đường link truy cập | Mục đích sử dụng |
| :--- | :--- | :--- |
| ⚡ **Link Rút Gọn Web App (Khuyên dùng)** | **[https://tinyurl.com/khothanhan-chuan](https://tinyurl.com/khothanhan-chuan)** | **Sử dụng hàng ngày**: Link ngắn gọn, dễ nhớ để mở ứng dụng quản lý kho trên mọi trình duyệt. |
| 🚀 **Link Gốc Google Apps Script** | [Mở Link Gốc Apps Script](https://script.google.com/macros/s/AKfycbxWJGAsTijUt3nCFFZpWWUAtcMJBARp5w9Dv9-TmgJOIgSXqXl8S71Te9Sf4Zm_ZcxK/exec) | Link chính thức do máy chủ Google cấp phát. |
| 📱 **Camera Live Scanner (Mobile & PC)** | [https://alexermanh-creator.github.io/QUAN-LY-KHO-THANH-ANH/scanner.html](https://alexermanh-creator.github.io/QUAN-LY-KHO-THANH-ANH/scanner.html) | Mở trực tiếp trên Smartphone để biến điện thoại thành máy quét mã vạch không dây siêu tốc. |
| 📊 **Google Sheet Cơ Sở Dữ Liệu** | [Mở Google Sheet CSDL](https://docs.google.com/spreadsheets/d/1qcXqmOsdciDHjeCUtY65Zd41aLlUvPHO_Wo-hWTyQck/edit) | Bảng tính Google lưu trữ toàn bộ dữ liệu gốc của kho. |
| 🛡️ **Kho Lưu Trữ GitHub** | [Mở GitHub Repository](https://github.com/alexermanh-creator/QUAN-LY-KHO-THANH-ANH) | Lưu trữ mã nguồn, lịch sử cập nhật và phiên bản sao lưu an toàn. |

---

## 2. TÀI KHOẢN ĐĂNG NHẬP & PHÂN QUYỀN NGƯỜI DÙNG

Hệ thống quản lý phiên đăng nhập thực tế theo từng tài khoản, không sử dụng menu chuyển vai trò ảo:

### 2.1 Danh sách tài khoản đã định danh:
1. **Tài khoản Quản trị viên (Admin)**:
   * **Tên đăng nhập**: `admin`
   * **Mật khẩu mặc định**: `123456`
   * **Người sử dụng**: **Khổng Mạnh Cường**
   * **Quyền hạn**: Toàn quyền tối cao (Full Control): Quản lý người dùng, phân quyền RBAC, sao lưu dữ liệu, nạp CSDL chuẩn hóa, reset kho, xóa log, chỉnh sửa tất cả các loại phiếu.
   * **Mật khẩu duyệt thao tác nhạy cảm**: `654321` (hoặc `admin123`).

2. **Tài khoản Thủ kho**:
   * **Tên đăng nhập**: `minhquan`
   * **Mật khẩu mặc định**: `123456`
   * **Người sử dụng**: **Khổng Minh Quân**
   * **Quyền hạn**: Tạo phiếu nhập kho, tạo phiếu xuất kho, quét mã vạch, thực hiện kiểm kê kho, tra cứu tồn kho và hồ sơ bảo hành.

### 2.2 Cách đăng xuất & đổi tài khoản:
* Trên thanh Topbar ở góc phải trên cùng, hệ thống luôn hiển thị rõ: **`Khổng Mạnh Cường (Quản trị viên)`** hoặc **`Khổng Minh Quân (Thủ kho)`**.
* Bấm vào tên người dùng -> Chọn **Đăng xuất / Chuyển tài khoản**.
* Hộp thoại Đăng nhập hiển thị -> Nhập tên đăng nhập và mật khẩu để vào đúng vai trò làm việc của mình.

---

## 3. BẢNG ĐIỀU KHIỂN DASHBOARD & TÌM KIẾM NHANH SPOTLIGHT (CTRL + K)

### 3.1 Tìm kiếm Spotlight siêu tốc (`Ctrl + K`):
* Bấm tổ hợp phím **`Ctrl + K`** tại bất kỳ màn hình nào (hoặc nhấp chuột vào ô tìm kiếm trên thanh đỉnh).
* Bạn có thể gõ bất kỳ thông tin nào để tìm ra kết quả sau **0.1 giây**:
  * **Số Serial máy**: `CNB1T5GC6X`, `NTMA681531`, `VNM0W42889`...
  * **Mã nội bộ**: `TA-001`, `TA-037`...
  * **Model máy**: `Canon LBP 6030w`, `HP LaserJet M211dw`, `Intel Core i5-12400`...
  * **Tên Khách hàng / Số điện thoại**: `Khoa Nhân`, `0909689886`, `0383500018`, `Trung Tín`...
  * **Mã phiếu nhập / xuất**: `PN-260915-171953`, `PX-260912-083937`...
* Bấm trực tiếp vào dòng kết quả: Hệ thống tự động chuyển thẳng đến **Hồ sơ Serial 360°** của con máy đó.

### 3.2 Thống kê KPI & Biểu đồ dòng thời gian:
* **Thẻ KPI thời gian thực**:
  * *Tổng máy tồn kho*: Số lượng thiết bị thực tế đang lưu trữ tại các kho.
  * *Tổng số Model*: Số chủng loại mặt hàng đang hoạt động.
  * *Xuất trong kỳ*: Số lượng máy đã xuất bán theo bộ lọc thời gian.
  * *Biến động tồn*: Hiển thị mức chênh lệch `(Nhập - Xuất)` với chỉ báo màu xanh dương nổi bật.
* **Biểu đồ kép Nhập - Tồn - Xuất lũy kế**:
  * Cột xanh lá: Thiết bị nhập kho trong kỳ.
  * Cột màu cam: Thiết bị xuất kho trong kỳ.
  * **Đường Line màu xanh dương**: Biểu diễn số lượng tồn kho lũy kế thực tế theo từng mốc thời gian (Tuần 1, Tuần 2, Tuần 3, Tuần 4 hoặc theo các Tháng).
* **Bảng Hoạt động gần đây**: Liệt kê 5 giao dịch nhập/xuất mới nhất. Click chuột vào bất kỳ dòng nào sẽ tự động chuyển sang tab Lịch sử và lọc đúng mã phiếu để bạn kiểm tra chi tiết.

---

## 4. QUẢN LÝ TỒN KHO 2 GÓC NHÌN & TRA CỨU HỒ SƠ SERIAL 360°

Nằm tại menu **1. Quản Lý Tồn Kho**, hỗ trợ 2 góc nhìn linh hoạt:

### 4.1 Chế độ xem theo Model (Dành cho Quản lý & Bán hàng):
* Gom nhóm tự động theo từng Model thiết bị (VD: `Canon LBP 6030w`, `HP Laser 108a`...).
* Hiển thị: Hãng sản xuất, Phân nhóm, Số lượng tồn tại *Kho VP*, Số lượng tồn tại *Kho Nhà*, và **Tổng Tồn**.
* Nút **"Xem Serial"** bên cạnh mỗi model: Bấm vào để bung danh sách tất cả các số Serial cụ thể của Model đó đang còn trong kho.

### 4.2 Chế độ xem theo Serial (Dành cho Thủ kho & Kỹ thuật):
* Danh sách chi tiết từng con máy với đầy đủ:
  * Mã Serial nhà sản xuất.
  * Mã nội bộ định danh Thành An (`TA-xxx`).
  * Tên sản phẩm chuẩn và Hãng sản xuất.
  * Vị trí kho hiện tại (Kho VP / Kho Nhà).
  * Ngày nhập và Nhà cung cấp nguồn gốc.
  * **Huy hiệu Tuổi Tồn Kho (Aging Badge)**:
    * 🟢 Xanh lá: Tồn dưới 30 ngày (Hàng mới về).
    * 🟡 Màu vàng: Tồn từ 30 - 60 ngày.
    * 🟠 Màu cam: Tồn từ 60 - 90 ngày.
    * 🔴 Màu đỏ: Tồn trên 90 ngày (Cảnh báo hàng tồn lâu cần ưu tiên xuất).

### 4.3 Hồ Sơ Thiết Bị Serial 360°:
Nằm tại menu **4. Hồ Sơ Serial 360°** (hoặc click icon con mắt ở bất kỳ đâu):
* **Trạng thái vòng đời**: Báo rõ máy đang `LƯU KHO` hay `ĐÃ XUẤT CHO KHÁCH HÀNG`.
* **Trạng thái Bảo hành**:
  * Hiển thị thanh đo trực quan: Ngày kích hoạt BH, Ngày hết hạn BH, Số ngày còn lại.
  * Huy hiệu trạng thái: `CÒN BẢO HÀNH (x ngày)` màu xanh lá hoặc `HẾT BẢO HÀNH` màu đỏ.
* **Nguồn gốc nhập kho**: Mã phiếu nhập gốc, Ngày nhập, Nhà cung cấp, Vị trí kho lúc nhập.
* **Hồ sơ xuất hàng**: Mã phiếu xuất, Ngày xuất bán, Tên khách hàng, Số điện thoại, Địa chỉ nhận máy.
* **Dòng thời gian (Timeline)**: Lịch sử đầy đủ qua từng giai đoạn (Nhập kho -> Chuyển kho -> Xuất bán -> Tiếp nhận bảo hành -> Trả bảo hành).

---

## 5. QUY TRÌNH NHẬP KHO ĐƠN CHIẾC, HÀNG LOẠT & BỘ LINH KIỆN

Nằm tại menu **2. Nhập Kho**:

### 5.1 Các bước nhập kho chuẩn:
1. **Thông tin chung**:
   * Chọn **Kho nhận hàng**: `Kho VP` (Số 18 Ngõ 241 Khâm Thiên) hoặc `Kho Nhà`.
   * Chọn **Nhà cung cấp**: Chọn từ danh sách (Thanh Nga, Nam Phát, FPS, Hưng Phúc...) hoặc bấm nút `+` để thêm NCC mới ngay lập tức.
   * Chọn **Ngày nhập** (mặc định là ngày hôm nay).
2. **Chọn sản phẩm**:
   * Gõ tên hoặc Model vào ô tìm kiếm: Danh sách gợi ý chuẩn hóa sẽ hiện ra (VD gõ `Canon` sẽ ra toàn bộ máy in Canon, gõ `SSD` sẽ ra toàn bộ ổ cứng).
   * Khi chọn Model, hệ thống tự động điền Tên đầy đủ, Hãng sản xuất, Ngành hàng và Thời hạn bảo hành tiêu chuẩn.
3. **Nhập danh sách mã Serial**:
   * **Cách 1 (Dùng súng quét mã vạch)**: Đặt con trỏ vào ô Serial, dùng súng quét mã vạch bắn liên tiếp lên tem thùng máy.
   * **Cách 2 (Quét bằng Camera)**: Bấm nút **"Bật Camera Quét"** trên giao diện để quét mã vạch qua webcam.
   * **Cách 3 (Nhập hàng loạt bằng Paste)**: Nếu nhà cung cấp gửi file Excel danh sách Serial, bạn chỉ cần Copy cột Serial và Paste vào ô nhập liệu (hệ thống tự động tách dấu phẩy hoặc xuống dòng).
4. **Cấp mã nội bộ Thành An**:
   * Bấm nút **"Cấp mã nội bộ"**: Hệ thống tự động sinh dãy mã liên tiếp `TA-001`, `TA-002`, `TA-003`... gán riêng cho từng con máy.
5. **Thêm vào phiếu**:
   * Bấm **`+ Thêm vào phiếu`** để đưa thiết bị xuống bảng danh sách tạm thời. Bạn có thể thêm tiếp nhiều Model khác nhau vào cùng 1 phiếu nhập.
6. **Lưu phiếu nhập kho**:
   * Kiểm tra lại bảng danh sách thiết bị.
   * Bấm **"Hoàn Tất & Lưu Phiếu Nhập Kho"**:
     * Hệ thống tự động sinh mã phiếu dạng `PN-YYMMDD-HHMMSS`.
     * Cập nhật ngay vào tồn kho, ghi nhận nguồn gốc từng Serial và lưu lịch sử vào Audit Log.

---

## 6. QUY TRÌNH XUẤT KHO BÁN HÀNG & XUẤT BỘ COMBO PC HOÀN CHỈNH

Nằm tại menu **3. Xuất Kho**:

### 6.1 Xuất bán thiết bị đơn lẻ hoặc nhiều máy:
1. **Chọn Khách hàng**: Chọn khách hàng quen thuộc trong dropdown hoặc bấm `+` để thêm nhanh khách mới. Số điện thoại và địa chỉ sẽ tự động điền.
2. **Quét chọn Serial xuất kho**:
   * Quét mã Serial của máy lấy từ kệ ra.
   * Hệ thống tự động kiểm tra tồn kho tức thời:
     * Nếu máy hợp lệ (đang lưu kho): Tự động điền Model, Tên máy và Thời hạn bảo hành.
     * Nếu máy không có trong kho hoặc đã xuất bán trước đó: Hệ thống phát chuông cảnh báo và chặn lại ngay lập tức.
3. **Điều chỉnh gói bảo hành**: Bạn có thể chọn lại gói BH cho đơn hàng này (12 tháng, 24 tháng, 36 tháng hoặc Không BH).
4. **Bấm "Lưu Phiếu Xuất Kho"**:
   * Trạng thái thiết bị tự động chuyển từ `Lưu kho` sang `Đã xuất`.
   * Thời hạn bảo hành bắt đầu được tính chính xác từ ngày xuất kho ghi trên phiếu.

### 6.2 Xuất kho nguyên bộ PC (Combo linh kiện lắp ráp):
Khi bán một bộ máy tính hoàn chỉnh gồm nhiều linh kiện khác nhau (CPU, Bo mạch chủ, RAM, Ổ cứng SSD, Nguồn, Vỏ case, Màn hình, Phím chuột):
* Chọn khách hàng như bình thường.
* Lần lượt quét từng mã Serial của các linh kiện có quản lý Serial trong bộ PC đó (hoặc bấm chọn nhanh từ bảng danh sách tồn kho).
* Bấm **Lưu phiếu xuất**: Hệ thống sẽ gom toàn bộ các linh kiện này vào **1 phiếu xuất duy nhất** với tên Model hiển thị dạng:  
  `Intel Core i3-12100 (1) + Darkflash H610M-VGD-V1 (1) + RAM Hiksemi Armor 8GB DDR4 (1) + SSD Hiksemi Wave 256GB (1) + AIGO VK350 350W (1)...`
* Tất cả linh kiện được trừ tồn kho đồng loạt và được liên kết chung 1 ngày xuất và thông tin khách hàng.

---

## 7. TÍNH NĂNG CHỈNH SỬA PHIẾU NHẬP / XUẤT TOÀN DIỆN (FULL FIELDS)

Đây là tính năng nâng cao giúp bạn khắc phục mọi sai sót khi thủ kho nhập nhầm thông tin mà không cần phải xóa phiếu làm lại:

### 7.1 Cách mở chức năng Sửa phiếu:
1. Vào tab **3. Lịch Sử & Audit**.
2. Chọn tab con **Lịch Sử Phiếu Nhập** hoặc **Lịch Sử Phiếu Xuất**.
3. Tìm dòng phiếu cần sửa -> Bấm nút **Sửa** (icon chiếc bút màu vàng cam ở cột Thao tác).

### 7.2 Các mục bạn có thể chỉnh sửa trực tiếp trong modal:
* **Thông tin chung (Header)**:
  * Sửa lại **Ngày lập phiếu**.
  * Sửa lại **Vị trí kho**.
  * Sửa lại **Nhà cung cấp** (Phiếu nhập) hoặc **Khách hàng & SĐT** (Phiếu xuất).
  * Sửa lại **Ghi chú phiếu**.
* **Chi tiết từng thiết bị trong phiếu (Items Table)**:
  * Sửa lại **Mã Serial** (nếu trước đó gõ sai ký tự).
  * Chọn lại **Model** thiết bị.
  * Sửa lại **Loại hàng** (Chính Hãng / 99% / Like New).
  * Sửa lại **Số tháng bảo hành** và **Ngày hết hạn BH**.
* **Thêm / Xóa thiết bị**:
  * Bấm nút **`+ Thêm thiết bị vào phiếu`** nếu phiếu bị thiếu máy.
  * Bấm nút icon **Thùng rác đỏ** ở cuối dòng để xóa bớt một thiết bị khỏi phiếu.
* **Lý do chỉnh sửa**:
  * Bắt buộc nhập lý do (VD: *"Đổi đúng nhà cung cấp thực tế"*, *"Sửa lại số Serial bị gõ nhầm"*).
  * Toàn bộ thay đổi và người thực hiện sẽ được ghi vĩnh viễn vào **Nhật ký Audit Log** để phục vụ kiểm toán nội bộ.
* Bấm **"LƯU THAY ĐỔI"**: Hệ thống tự động cập nhật phiếu nhập/xuất, cập nhật lại hồ sơ thiết bị trong kho và đóng modal thành công.

---

## 8. HƯỚNG DẪN QUÉT MÃ VẠCH: SÚNG QUÉT USB/BLUETOOTH & CAMERA LIVE VIDEO

### 8.1 Súng quét mã vạch phần cứng (USB / Bluetooth):
* **Cơ chế thông minh**: Hệ thống tích hợp bộ lắng nghe bàn phím toàn cục (Global Keyboard Hook) với tốc độ nhận diện phím cực cao (<50ms giữa các ký tự).
* **Cách dùng**: Cắm súng quét vào máy tính. Khi cầm súng bấm quét tem mã vạch trên vỏ hộp, hệ thống sẽ **tự động nhận diện mã và đưa vào phiếu** dù con trỏ chuột của bạn đang ở bất kỳ vị trí nào trên màn hình.

### 8.2 Quét mã vạch bằng Smartphone (Khuyên dùng khi đi kho):
Để biến chiếc điện thoại của bạn thành máy quét mã vạch cầm tay chuyên nghiệp:
1. Mở trang quét độc lập trên điện thoại:
   👉 **[https://alexermanh-creator.github.io/QUAN-LY-KHO-THANH-ANH/scanner.html](https://alexermanh-creator.github.io/QUAN-LY-KHO-THANH-ANH/scanner.html)**  
   *(Hoặc quét mã QR kết nối nhanh trên giao diện Web App để mở)*.
2. Cho phép trình duyệt truy cập Camera trên điện thoại.
3. Đưa camera vào mã vạch (Barcode 1D) hoặc mã QR:
   * Điện thoại sẽ phát tiếng kêu **BEEP** và rung nhẹ báo hiệu nhận diện thành công.
   * Mã Serial vừa quét trên điện thoại sẽ **tự động nhảy ngay lập tức vào màn hình máy tính của bạn** qua kênh truyền thời gian thực (`BroadcastChannel` & `localStorage`).

---

## 9. QUẢN LÝ DANH MỤC CHUẨN HÓA (HÃNG, MODEL CHUẨN, KHÁCH HÀNG, NCC)

Nằm tại menu **5. Danh Mục**:

### 9.1 Nguyên tắc đặt tên Model chuẩn hóa:
Tất cả 33 sản phẩm của kho Thành An đều tuân thủ cấu trúc chuẩn:  
`[Tên Hãng / Chủng Loại] + [Ký hiệu Model / Quy cách]`  
*Ví dụ*:
* `Canon LBP 6030w` (thay vì viết tắt LBP6030W)
* `HP LaserJet M211dw` (thay vì viết tắt M211DW)
* `Intel Core i5-12400`
* `SSD Hiksemi Wave 256GB`
* `Darkflash H610M-VGD-V1`
* `DAREU LM103`

### 9.2 Danh mục Nhà cung cấp (DM_NCC):
* Quản lý đầy đủ mã viết tắt và tên công ty: `Thanh Nga`, `Nam Phát`, `FPS`, `Hưng Phúc`, `Trí Việt`, `Thiên Trường`, `Song Hùng`, `NAKIO`, `Minh Chính`...
* Có số điện thoại và địa chỉ liên hệ rõ ràng.

### 9.3 Danh mục Khách hàng (DM_KHACH_HANG):
* Đã được làm sạch 100%, không còn hiện tượng số điện thoại bị hiển thị thành số mũ khoa học (`0909689886`, `0325470077`, `0383500018`).
* Đã gộp sạch các khách hàng trùng lặp và tách riêng tên người đại diện liên hệ.

---

## 10. NGHIỆP VỤ KHO MỞ RỘNG & QUẢN LÝ BẢO HÀNH SỬA CHỮA

### 10.1 Các nghiệp vụ kho đặc thù (Menu Nghiệp Vụ Kho):
* **Điều chuyển kho nội bộ**: Chuyển một hoặc nhiều thiết bị giữa `Kho VP`, `Kho Nhà` và `Kho Cách Ly`. Lịch sử chuyển kho được ghi lại trong hồ sơ Serial.
* **Hoàn nhập hàng từ Khách**: Nhận lại máy khách trả về kho. Hệ thống tự kiểm tra số Serial có đúng từng bán cho khách đó không trước khi cho phép nhập kho lại.
* **Xuất trả hàng cho Nhà cung cấp**: Xuất các thiết bị lỗi nằm tại `Kho Cách Ly` để trả về cho hãng sản xuất.
* **Kiểm kê kho Barcode (Stocktake)**:
  * Tạo phiên kiểm kê cho từng kho.
  * Cầm súng quét hoặc điện thoại quét lần lượt các máy thực tế trên kệ.
  * Hệ thống tự động so khớp với số liệu sổ sách trên phần mềm, phát hiện ngay các máy **Đủ**, máy **Thừa** và máy **Thiếu** để xuất biên bản kiểm kê.

### 10.2 Quản lý Ca Bảo Hành & Tiếp Nhận Sửa Chữa (Menu Bảo Hành):
* **Tiếp nhận bảo hành**: Nhập Serial máy khách mang đến sửa -> Hệ thống tự tra cứu hạn bảo hành và thông tin bán hàng trước đây.
* **Cập nhật tiến độ**: Ghi nhận tình trạng lỗi (VD: *"Hỏng cụm sấy"*, *"Lỗi nguồn"*), cập nhật phương án xử lý (Gửi hãng, Sửa dịch vụ, Đổi máy mới).
* **Trả máy cho khách**: Xuất biên bản bàn giao máy đã sửa xong cho khách hàng.

---

## 11. SAO LƯU, KHÔI PHỤC, NẠP CSDL CHUẨN HÓA & RESET HỆ THỐNG

Nằm tại menu **5. Cài Đặt** -> Tab **4. Sao Lưu, Khôi Phục & Reset**:

### 11.1 Tạo sao lưu thủ công (Snapshot):
* Bất cứ khi nào chuẩn bị thực hiện giao dịch lớn hoặc trước khi kiểm kê, bạn nên bấm **"TẠO SAO LƯU THỦ CÔNG"**.
* Hệ thống sẽ chụp lại nguyên trạng toàn bộ cơ sở dữ liệu (Google Sheets, Danh mục, Lịch sử, Serial) và lưu thành một bản Snapshot an toàn trong danh sách.

### 11.2 Khôi phục dữ liệu (Restore):
* Trong danh sách các bản sao lưu, tìm bản muốn quay lại -> Bấm **"Khôi Phục"** -> Nhập mật khẩu Admin (`654321`). Toàn bộ kho sẽ quay trở lại chính xác thời điểm đó.

### 11.3 Cứu Serial bị VOID nhầm:
* Nếu nhân viên lỡ tay hủy nhầm một mã Serial, bạn chỉ cần bấm nút **"Cứu Dữ Liệu Serial VOID"** -> Nhập mã Serial cần cứu để phục hồi máy về lại trạng thái hoạt động bình thường trong kho.

### 11.4 Đồng bộ CSDL Chuẩn Hóa lên Google Sheets:
* Đây là tính năng đặc biệt giúp nạp toàn bộ 33 Model sản phẩm chuẩn, 86 Thiết bị (60 Tồn kho, 26 Đã xuất), 32 Phiếu nhập, 14 Phiếu xuất và 10 Khách hàng đã làm sạch từ file Excel cũ vào Google Sheets.
* **Cách thực hiện**:
  1. Vào tab **Cài Đặt** -> chọn mục **Sao Lưu, Khôi Phục & Reset**.
  2. Bấm nút xanh **"Nạp CSDL Chuẩn Hóa Vào Google Sheets"**.
  3. Nhập mật khẩu Admin: **`654321`**.
  4. Hệ thống sẽ ghi đè dữ liệu chuẩn vào Google Sheets và thông báo hoàn tất.

### 11.5 Vùng Quản trị Reset Hệ Thống:
* Chỉ dành cho Quản trị viên khi muốn dọn dẹp kho:
  * *Xóa Lịch Sử Giao Dịch & Tồn Kho (Giữ Danh Mục)*: Xóa trắng phiếu nhập/xuất và serial, giữ lại danh mục sản phẩm, khách hàng, nhà cung cấp.
  * *Reset Toàn Bộ Hệ Thống Về Trắng (Full Clean)*: Khởi tạo lại hệ thống sạch 100%.
* **Cơ chế an toàn tuyệt đối**: Trước khi dọn dẹp, hệ thống **luôn tự động tạo 1 bản sao lưu khẩn cấp mang tên `PRE_RESET`**, giúp bạn có thể bấm Khôi Phục lại bất cứ lúc nào nếu lỡ tay bấm nhầm!

---

## 12. CẨM NANG KỸ THUẬT 1-CLICK CẬP NHẬT CODE LÊN GOOGLE SHEETS & GITHUB

Dành cho người quản trị khi muốn cập nhật mã nguồn từ máy tính lên Cloud:

Tại thư mục máy tính: `C:\Projects\Quan Ly Kho Thanh An\`

### 1. Đẩy code lên Google Apps Script:
* Chỉ cần **nhấp đúp chuột vào file: `2_DAY_19_FILE_LEN_GOOGLE_SHEETS.bat`**.
* Hệ thống sẽ tự động biên dịch và đẩy toàn bộ 21 file mã nguồn lên Google Apps Script trong vòng **3 giây**.
* Sau đó bạn chỉ cần tải lại (F5) trang Web App là có ngay phiên bản mới nhất!

### 2. Đẩy code sao lưu lên GitHub:
* Chỉ cần **nhấp đúp chuột vào file: `push_to_github.bat`**.
* Toàn bộ mã nguồn sẽ được tự động Commit và đẩy lên GitHub an toàn.

### 3. Đăng nhập lại Google (Nếu bị hết hạn):
* Nếu máy tính báo lỗi phiên đăng nhập Google Apps Script hết hạn, bạn nhấp đúp file **`1_DANG_NHAP_GOOGLE.bat`** để đăng nhập lại tài khoản Google của mình.

---

> **LIÊN HỆ HỖ TRỢ KỸ THUẬT**:  
> CÔNG TY TNHH THƯƠNG MẠI VÀ ĐẦU TƯ CÔNG NGHỆ THÀNH AN  
> Địa chỉ: Số 18 Ngõ 241 Phố Chợ Khâm Thiên, Phường Văn Miếu - Quốc Tử Giám, TP Hà Nội  
> Hệ thống vận hành: **Thành An ERP v4.0 Enterprise Official**
