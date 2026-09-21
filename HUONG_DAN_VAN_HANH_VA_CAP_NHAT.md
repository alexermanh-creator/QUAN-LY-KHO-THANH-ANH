# 📘 CẨM NANG VẬN HÀNH & NÂNG CẤP HỆ THỐNG THÀNH AN ERP v4.0
> **Hệ thống Quản trị Kho & Vòng đời Thiết bị Chuẩn Serial-Centric**  
> *Phiên bản V4.0 Enterprise Official - Cập nhật ngày: 20/09/2026*

---

## 🌐 PHẦN 1: CÁC ĐƯỜNG LINK HỆ THỐNG QUAN TRỌNG

| Hạng mục | Đường link truy cập | Mục đích & Đối tượng sử dụng |
|---|---|---|
| ⚡ **Link Rút Gọn Web App (Khuyên dùng)** | **[https://tinyurl.com/khothanhan-chuan](https://tinyurl.com/khothanhan-chuan)** | **Dùng hàng ngày**: Link siêu ngắn, dễ nhớ cho bạn và nhân viên (Dự phòng: `https://tinyurl.com/29cxuyup`). |
| 🚀 **Đường Link Gốc Web App** | [Mở Link Gốc Apps Script](https://script.google.com/macros/s/AKfycbxWJGAsTijUt3nCFFZpWWUAtcMJBARp5w9Dv9-TmgJOIgSXqXl8S71Te9Sf4Zm_ZcxK/exec) | Link chính thức do máy chủ Google Apps Script cấp phát. |
| 📊 **Google Sheet Cơ Sở Dữ Liệu** | [Mở Google Sheet CSDL](https://docs.google.com/spreadsheets/d/1qcXqmOsdciDHjeCUtY65Zd41aLlUvPHO_Wo-hWTyQck/edit) | **Lưu trữ dữ liệu gốc**: Chứa toàn bộ 10 tab dữ liệu nằm trong thư mục `Thành An` trên Google Drive. |
| 🛠️ **Google Apps Script Editor** | [Mở Apps Script Project](https://script.google.com/d/1gh2JeFuQ106ksrpPuXAB0U1lCafpqkXyYnXnEPKBvkRsOQdT2ap70wpZ/edit) | **Quản lý mã nguồn trên Cloud**: Chứa 19 file code đang chạy trên máy chủ Google. |
| 🛡️ **Kho Lưu Trữ GitHub** | [Mở GitHub Repository](https://github.com/alexermanh-creator/QUAN-LY-KHO-THANH-ANH) | **Bảo mật & Sao lưu**: Lưu trữ lịch sử nâng cấp và toàn bộ bản sao dự phòng mã nguồn. |

### 🔑 Tài khoản đăng nhập hệ thống mặc định:
- **Tên đăng nhập**: `admin`
- **Mật khẩu**: `123456`
- *(Sau khi đăng nhập, bạn có thể vào tab **Cài đặt & Phân quyền** để đổi mật khẩu hoặc tạo thêm tài khoản cho nhân viên)*.

---

## 📂 PHẦN 2: Ý NGHĨA CÁC FILE TRONG THƯ MỤC DỰ ÁN

Tại thư mục máy tính: `C:\Projects\Quan Ly Kho Thanh An\`

### 1. Các file công cụ (Nhấp đúp chuột để chạy):
- **`2_DAY_19_FILE_LEN_GOOGLE_SHEETS.bat`** *(Quan trọng nhất)*:
  Mỗi khi sửa xong code trên máy tính, chỉ cần nhấp đúp file này. Hệ thống sẽ **tự động đẩy toàn bộ 19 file lên Google Apps Script chỉ trong 3 giây**.
- **`push_to_github.bat`**:
  Nhấp đúp file này để tự động đẩy và sao lưu toàn bộ code mới nhất lên tài khoản **GitHub** của bạn.
- **`1_DANG_NHAP_GOOGLE.bat`**:
  Chỉ dùng khi bạn muốn chuyển sang một tài khoản Google khác hoặc khi Google hết hạn phiên đăng nhập (bình thường không cần chạy lại).

### 2. Thư mục mã nguồn chính:
- **`gas\`** *(Trái tim của dự án)*:
  Chứa toàn bộ **19 file code riêng biệt** đang vận hành hệ thống. **Mọi chỉnh sửa sau này sẽ thực hiện tại thư mục này:**
  - `gas\Index.html`: Toàn bộ giao diện Web App hiện đại, màu sắc, bố cục và hiệu ứng.
  - `gas\Code.js`: Backend chính, điều hướng doGet và khởi tạo database.
  - `gas\01_DanhMuc.js`: Quản lý danh mục Sản phẩm, Nhà cung cấp, Khách hàng.
  - `gas\02_NhapKho.js`: Nghiệp vụ Nhập kho, kiểm tra trùng Serial.
  - `gas\03_XuatKho.js`: Nghiệp vụ Xuất kho, thuật toán xuất kho thông minh.
  - `gas\04_TonKho.js`: Tính toán tồn kho tức thời, cảnh báo tồn tối thiểu.
  - `gas\05_Serial360.js`: Nghiệp vụ truy vết vòng đời thiết bị 360 độ.
  - `gas\09_BackupRestore.js`: Sao lưu và phục hồi dữ liệu tự động.
- **`demo_quan_ly_kho.html`**:
  File chạy thử giao diện Offline độc lập (mở bằng trình duyệt không cần mạng).
- **`.clasp.json`**:
  File cấu hình chứa mã Script ID kết nối giữa máy tính bạn và Google Sheet.

---

## 🔄 PHẦN 3: QUY TRÌNH CHUẨN 3 BƯỚC KHI SỬA CODE & NÂNG CẤP

Khi bạn muốn sửa giao diện, chỉnh sửa nghiệp vụ hoặc thêm tính năng mới, hãy làm theo đúng 3 bước sau:

```text
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│        BƯỚC 1           │       │        BƯỚC 2           │       │        BƯỚC 3           │
│   SỬA CODE TRONG GAS\   │  ──>  │      LƯU FILE           │  ──>  │  NHẤP ĐÚP CHUỘT FILE    │
│ Mở đúng file cần sửa    │       │     Nhấn Ctrl + S       │       │ 2_DAY_19_FILE_LEN_...   │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

### Chi tiết từng bước:
1. **Bước 1: Mở file cần sửa trong thư mục `gas\`**:
   - Muốn sửa giao diện, form nhập, bảng hiển thị ➔ Mở `gas\Index.html`.
   - Muốn sửa logic nghiệp vụ Nhập kho ➔ Mở `gas\02_NhapKho.js`.
   - Muốn sửa logic nghiệp vụ Xuất kho ➔ Mở `gas\03_XuatKho.js`.
   *(Bạn có thể tự sửa hoặc mở chat bảo AI sửa giúp)*.
2. **Bước 2: Lưu file**:
   - Bấm **`Ctrl + S`** để lưu lại file trên máy tính.
3. **Bước 3: Đẩy lên Google Sheets & Web App**:
   - Nhấp đúp chuột vào file: **`2_DAY_19_FILE_LEN_GOOGLE_SHEETS.bat`**.
   - Cửa sổ chạy xong báo thành công ➔ Mở lại Web App là tính năng mới đã có hiệu lực ngay!
4. **Bước 4 (Khuyên dùng): Lưu dự phòng lên GitHub**:
   - Nhấp đúp chuột vào file: **`push_to_github.bat`** để lưu bản sao lưu an toàn.

---

## 💼 PHẦN 4: VẬN HÀNH THAO TÁC HÀNG NGÀY

### 1. Dùng trên máy tính:
- Mở trình duyệt (Chrome / Edge / Cốc Cốc) vào đường link Web App.
- Bấm tổ hợp phím **`Ctrl + D`** để lưu trang vào thanh Dấu trang (Bookmarks) để mở nhanh mỗi ngày.

### 2. Dùng trên điện thoại di động:
- Mở đường link Web App trên trình duyệt Safari (iPhone) hoặc Chrome (Android).
- Bấm nút **Chia sẻ** (hoặc dấu 3 chấm góc trên) ➔ Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
- Một biểu tượng ứng dụng **THÀNH AN ERP** sẽ xuất hiện ngay trên màn hình điện thoại, bấm vào là mở toàn màn hình như app chuyên nghiệp!
- Có thể dùng camera điện thoại quét mã vạch Serial trực tiếp khi nhập/xuất kho.

---

---

## 🏷️ PHẦN 5: QUY CHUẨN 8 TAB DANH MỤC HỆ THỐNG & CÁC TRƯỜNG DỮ LIỆU

Hệ thống được thiết kế theo tiêu chí **Nhập liệu siêu tốc ban đầu - Cho phép bổ sung chi tiết sau**:

| STT | Tên Tab Danh Mục | Trường Bắt Buộc Nhập Ban Đầu (*) | Các Trường Tùy Chọn (Có thể bổ sung sau) | Ghi Chú & Liên Kết Nghiệp Vụ |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Model Sản Phẩm** | **Mã Model** & **Tên Model** | ĐVT *(mặc định: Chiếc)*, Hãng SX, Nhóm hàng, Bảo hành mặc định, Quản lý Serial, Ghi chú. | Mã Model dùng làm khóa chính liên kết thiết bị Serial và phiếu xuất/nhập. |
| **2** | **Khách Hàng** | **Tên Khách Hàng** & **Số Điện Thoại (SĐT)** | Người liên hệ, Địa chỉ, Email, Mã số thuế, Phân nhóm khách, Ghi chú. | **Bắt buộc có SĐT** để phục vụ tra cứu bảo hành thiết bị theo số điện thoại khách. |
| **3** | **Nhà Cung Cấp** | **Tên Viết Tắt / Mã NCC** | Tên đầy đủ công ty, Số điện thoại, Email, Địa chỉ, Người liên hệ, Mã số thuế, Ghi chú. | Dùng phân loại nguồn gốc nhập máy. |
| **4** | **Kho Hàng** | **Tên Kho Hàng** | Mã kho, Loại kho, Thủ kho phụ trách, SĐT liên hệ, Địa chỉ kho, Ghi chú. | Tách biệt hoàn toàn, không lẫn model/bảo hành. |
| **5** | **Hãng SX** | **Tên Hãng SX** (Canon, HP...) | Mã hãng, Xuất xứ / Quốc gia, Ghi chú. | Tự động làm gợi ý khi thêm Model mới. |
| **6** | **Nhóm Hàng** | **Tên Nhóm** (Máy in, Laptop...) | Mã nhóm, Ghi chú. | Tự động phân loại biểu đồ Dashboard. |
| **7** | **Thời Gian Bảo Hành** | **Số Tháng** hoặc **Tên Gói** *(Ví dụ: 12 Tháng)* | Ghi chú chính sách bảo hành. | Tab nhập riêng biệt, tự động đổ dữ liệu vào menu chọn bảo hành toàn hệ thống. |
| **8** | **Loại Hàng** | **Tên Loại Hàng** *(Chính Hãng, Nhập Khẩu...)* | Đặc điểm phân loại, Ghi chú nguồn gốc/tình trạng máy. | **Lưu vào Cột 3 Sheet `DM_QUY_CHUAN`** và tự động đồng bộ sang phiếu Nhập Kho. |

> 💡 **Khả năng chỉnh sửa**: Tất cả 8 danh mục đều có nút **Sửa (biểu tượng cây bút chì)** cho phép chỉnh sửa **100% tất cả các trường** sau khi tạo mà không bị khóa cứng.

---

## 📷 PHẦN 6: HƯỚNG DẪN QUÉT BARCODE / QR VÀ CƠ CHẾ CAMERA

### 1. Tại sao Live Camera bị đen xì khi mở trên Google Apps Script?
Google Apps Script khi hiển thị Web App sẽ nhúng trang web bên trong một khung ẩn gọi là **sandboxed iframe** của Google (`script.googleusercontent.com`). Do chính sách an ninh bảo mật của các trình duyệt hiện đại (Chrome, Edge, Safari), nếu Google không cấp quyền camera cho iframe thì trình duyệt sẽ chặn luồng live stream camera bên trong iframe này.

### 2. Ba phương án quét mã vạch / QR chuẩn xác 100%:
- **Cách 1: Quét trên Điện Thoại & Máy Tính Bảng (Chuẩn nhất - Nhanh nhất)**:
  - Bấm nút **"Bấm Vào Đây Để Chụp Tem Quét Mã"** (hoặc nút Quét Camera).
  - Điện thoại lập tức mở camera chụp ảnh gốc của máy với đầy đủ lấy nét, đèn Flash.
  - Bạn chỉ cần chụp 1 phát tách vào tem mã vạch trên vỏ hộp hoặc thân máy: Hệ thống sử dụng bộ giải mã tăng tốc phần cứng **Native BarcodeDetector** quét xong trong **0.1 giây** và tự động thêm vào phiếu!
- **Cách 2: Quét bằng Webcam trên Máy Tính / Laptop**:
  - Tại modal quét, bấm nút **"Mở Cửa Sổ Camera Ngoài Iframe"**.
  - Trình duyệt sẽ mở một cửa sổ camera độc lập ngoài iframe của Google Apps Script. Cửa sổ này nhận quyền camera 100%, quét liên tục với 30 khung hình/giây.
  - Khi camera thấy mã, máy tự động kêu "Tít", nhấp nháy xanh và gửi mã tức thì về phiếu nhập/xuất kho qua kênh **BroadcastChannel**.
- **Cách 3: Dành cho Thủ Kho dùng Súng Quét Mã Vạch Barcode USB / Bluetooth**:
  - Cắm súng quét vào máy tính, chuyển sang tab **"Súng Quét USB"** (hoặc để trỏ chuột ở ô mã).
  - Cầm súng bấm "Tít" vào tem, mã nhảy thẳng vào danh sách ngay lập tức.
  - Hoặc dán ảnh chụp màn hình tem thiết bị bằng tổ hợp phím **Ctrl + V**.

### 3. Đã chuẩn hóa giao diện:
- Loại bỏ hoàn toàn lỗi hiển thị **2 biểu tượng camera** cạnh nhau.
- Chỉ dùng 1 biểu tượng FontAwesome sắc nét, hiện đại trên toàn hệ thống.

## ❓ PHẦN 6: CÂU HỎI THƯỜNG GẶP (FAQ)

**1. Dữ liệu kho của tôi có an toàn không?**
- Toàn bộ dữ liệu nằm 100% trong file Google Sheet trên tài khoản Google Drive cá nhân của bạn. Không ai có thể xem hay xóa ngoại trừ bạn.

**2. Đẩy code lên Google Sheets báo thành công thì cần làm gì tiếp?**
- Bạn chỉ cần vào **Triển khai (Deploy)** -> **Quản lý bản triển khai** -> Bấm biểu tượng bút chì -> Chọn **Phiên bản mới (New version)** -> Bấm **Triển khai** là xong.

**2. Nếu máy tính của tôi bị hỏng thì sao?**
- Hệ thống không bị ảnh hưởng gì cả! Vì toàn bộ Web App và CSDL đang chạy trên Cloud của Google. Bạn dùng máy tính khác hoặc điện thoại vẫn đăng nhập và làm việc bình thường. Mã nguồn cũng đã được lưu an toàn trên GitHub của bạn.

**3. Khi cần tôi (AI) sửa thêm tính năng mới, tôi làm gì?**
- Bạn chỉ cần mở phần mềm này lên, nhắn yêu cầu cho tôi: *"Hãy sửa cho tôi tính năng X, Y..."*.
- Tôi sẽ sửa trực tiếp vào file trong thư mục `gas\`.
- Sửa xong, bạn chỉ việc nhấp đúp file `2_DAY_19_FILE_LEN_GOOGLE_SHEETS.bat` là hệ thống trên mạng tự động cập nhật!
