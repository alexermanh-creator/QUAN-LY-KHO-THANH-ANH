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

## ❓ PHẦN 5: CÂU HỎI THƯỜNG GẶP (FAQ)

**1. Dữ liệu kho của tôi có an toàn không?**
- Toàn bộ dữ liệu nằm 100% trong file Google Sheet trên tài khoản Google Drive cá nhân của bạn. Không ai có thể xem hay xóa ngoại trừ bạn.

**2. Nếu máy tính của tôi bị hỏng thì sao?**
- Hệ thống không bị ảnh hưởng gì cả! Vì toàn bộ Web App và CSDL đang chạy trên Cloud của Google. Bạn dùng máy tính khác hoặc điện thoại vẫn đăng nhập và làm việc bình thường. Mã nguồn cũng đã được lưu an toàn trên GitHub của bạn.

**3. Khi cần tôi (AI) sửa thêm tính năng mới, tôi làm gì?**
- Bạn chỉ cần mở phần mềm này lên, nhắn yêu cầu cho tôi: *"Hãy sửa cho tôi tính năng X, Y..."*.
- Tôi sẽ sửa trực tiếp vào file trong thư mục `gas\`.
- Sửa xong, bạn chỉ việc nhấp đúp file `2_DAY_19_FILE_LEN_GOOGLE_SHEETS.bat` là hệ thống trên mạng tự động cập nhật!
