# 📋 BIÊN BẢN GHI NHẬN PHIÊN LÀM VIỆC (23/09/2026)

---

## I. TỔNG QUAN CÁC HẠNG MỤC ĐÃ HOÀN THÀNH TRONG PHIÊN

### 1. Phân loại lại Hãng cho toàn bộ danh mục Model sản phẩm:
- Rà soát và chuẩn hóa trường Hãng (`hang`) cho toàn bộ các Model trong hệ thống:
  - Máy in & Thiết bị văn phòng: `CANON`, `HP`, `BROTHER`, `RICOH`, `EPSON`.
  - Linh kiện & Máy tính: `INTEL`, `MSI`, `GIGABYTE`, `HIKSEMI`, `KINGSTON`, `WESTERN DIGITAL`, `SEAGATE`, `DAREU`, `AIGO`, `DARKFLASH`.
- Khắc phục triệt để tình trạng một số Model bị để trống hoặc hiển thị dấu gạch ngang `--`.
- Đảm bảo sự nhất quán trên toàn bộ các màn hình: Danh mục sản phẩm, Form nhập kho, Chi tiết thiết bị Serial 360°, Xuất kho và Báo cáo tồn.

---

### 2. Xử lý triệt để trùng lặp Nhà Cung Cấp (NCC):
- Dọn dẹp và hợp nhất các bản ghi NCC bị trùng lặp mã hoặc tên (ví dụ: `SYNNEX_FPT` / `FPT`, `Song Hùng`, `FPS`, `Mai Hoàng`...).
- Bổ sung cơ chế chống trùng lặp tự động khi thêm mới NCC từ giao diện: Kiểm tra theo cả Mã viết tắt và Tên đầy đủ trước khi lưu vào danh mục.
- Đồng bộ danh mục NCC chuẩn hóa trên Google Sheets (`DM_NHA_CUNG_CAP`) và `localStorage`.

---

### 3. Thắt chặt Phân quyền tài khoản (RBAC & Security Audit):
- Khắc phục lỗi bảo mật: Tài khoản Quản lý / Thủ kho vẫn có thể xem được dữ liệu Nhật ký hệ thống (Audit Logs) dù quyền `viewAudit` đã bị tắt.
- Siết chặt ở cả 2 lớp:
  - **Lớp Giao diện (Navigation)**: Tự động ẩn tab `Lịch Sử & Audit` hoặc sub-tab Audit nếu người dùng không có quyền quản trị viên (`isAdmin = true` hoặc `hasPermission('viewAudit')`).
  - **Lớp Xử lý dữ liệu (Controller)**: Hàm `renderAuditLogsTable` và các hàm truy xuất audit log chặn từ chối hiển thị và xóa sạch dữ liệu khỏi DOM nếu tài khoản không đủ thẩm quyền.

---

### 4. Khóa cứng NCC & Model, Tinh gọn giao diện theo chuẩn ERP (Select2 / Ant Design):
- **Khóa cứng (Locked Catalog)**:
  - Không cho phép nhập tay chuỗi ký tự tự do ngoài danh mục vào cơ sở dữ liệu.
  - Mọi giao dịch Nhập / Xuất đều bắt buộc phải liên kết với NCC và Model chính thức trong danh mục hệ thống.
- **Loại bỏ sự rườm rà & thiếu chuyên nghiệp (Refactoring UX)**:
  - Loại bỏ hoàn toàn các khung cảnh báo viền đỏ to cồng kềnh, các câu chữ giáo điều dài dòng (*"Hệ thống khóa cứng danh mục..."*).
  - Loại bỏ việc bật popup SweetAlert đột ngột khi rời chuột (blur) gây gián đoạn luồng nhập liệu của nhân viên kho.
  - Loại bỏ icon tích xanh `is-valid` đè lên nút mũi tên dropdown gây lệch layout ô nhập.
- **Giao diện Combobox & Thêm nhanh tinh gọn (Chuẩn ERP)**:
  - **Đối với Nhà Cung Cấp**:
    - Sửa triệt để lỗi so khớp chuỗi ghép (`FPS - Công ty FPS`), nhận diện chính xác 100% khi người dùng tìm kiếm hoặc chọn lại.
    - Khi gõ từ khóa NCC chưa có trong hệ thống, dropdown hiển thị duy nhất 1 dòng phẳng trang nhã:
      > `+ Thêm mới NCC: "[từ_khóa]"` kèm nhãn nhỏ `Tạo mới`.
    - Click vào dòng này lập tức mở Modal Thêm NCC Nhanh, tự động điền sẵn Mã viết tắt (in hoa) và Tên NCC.
  - **Đối với Model Sản Phẩm**:
    - Khi tìm Model chưa có trong danh mục, dropdown hiển thị duy nhất 1 dòng tinh tế:
      > `+ Thêm mới Model: "[từ_khóa]"` kèm nhãn `Tạo mới`.
    - Click vào sẽ mở Modal Thêm Model Nhanh, tự động điền sẵn Model, Tên sản phẩm, và **tự động nhận diện Hãng sản xuất** (nhận diện từ khóa Canon, HP, Brother, Epson, Ricoh... để chọn sẵn hãng tương ứng).
  - **Cơ chế Validation tại điểm chốt (Cửa submit)**:
    - Khi bấm **"Lưu Nháp"** hoặc **"Xác Nhận Nhập Kho"**, hệ thống mới kiểm tra NCC và Model: nếu chưa chọn từ danh mục sẽ nhẹ nhàng thông báo và cung cấp nút mở form thêm nhanh, đảm bảo 100% dữ liệu sạch sẽ trước khi vào CSDL.

---

### 5. Kiểm tra, Biên dịch & Triển khai toàn hệ thống:
- **Kiểm tra cú pháp**: Chạy bộ kiểm tra `check_syntax.js` trên toàn bộ 9 file logic frontend và 10 file backend Google Apps Script: **0 syntax errors**.
- **Biên dịch**:
  - `build_demo.ps1` $\rightarrow$ `demo_quan_ly_kho.html` (1,068 KB).
  - `build_gas_index.ps1` $\rightarrow$ `gas/Index.html` & `src/frontend/Index.html` (1,083 KB).
- **Triển khai Google Apps Script**:
  - Đẩy thành công 22 files mã nguồn lên Google Apps Script bằng công cụ `clasp push --force`.
- **Quản lý mã nguồn**:
  - Đã commit đầy đủ toàn bộ các mốc thay đổi vào Git repository.

---

## II. DANH SÁCH FILE VÀ MODULE ĐÃ THAY ĐỔI
1. `src_demo/03_modules_html.html`: Chuẩn hóa giao diện ô input NCC và Model trong màn hình Nhập kho.
2. `src_demo/08_nhap_kho_logic.js`:
   - Nâng cấp `handleSuggestNccNhap` và `handleSuggestModelNhap` sang giao diện 1 dòng tinh gọn.
   - Viết lại `onBlurNccNhap`, loại bỏ SweetAlert gây phiền hà.
   - Nâng cấp `openQuickAddModelModal` & `submitQuickAddModel`: hỗ trợ pre-fill tên, tự nhận diện Hãng, tự động chọn sau khi lưu và đồng bộ lên Google Sheets.
   - Nâng cấp `openQuickAddSupplierModal` & `submitQuickAddSupplier`: chống trùng lặp, tự động chọn sau khi lưu và đồng bộ lên Google Sheets.
   - Bổ sung export toàn cục ra `window` cho các hàm nghiệp vụ.
3. `src_demo/05_mock_data.js`: Chuẩn hóa danh mục Hãng sản xuất và khử trùng lặp NCC.
4. `src_demo/06_app_logic.js`: Tăng cường bảo mật và kiểm tra phân quyền tab Audit.
5. `demo_quan_ly_kho.html`: File ứng dụng demo đã được build lại hoàn chỉnh.
6. `gas/Index.html` & `src/frontend/Index.html`: File giao diện Google Apps Script chính thức.

---

## III. HƯỚNG DẪN KIỂM THỬ (BACKTEST CHECKLIST)
- [ ] **Test 1 - Chọn NCC có sẵn**: Gõ `FPS` hoặc `Song Hùng`, chọn từ gợi ý $\rightarrow$ Ô hiển thị chuẩn `Mã - Tên`, không báo lỗi vô cớ.
- [ ] **Test 2 - Thêm nhanh NCC mới**: Gõ `Phúc Anh` $\rightarrow$ Dropdown hiện `+ Thêm mới NCC: "Phúc Anh"` $\rightarrow$ Bấm vào mở Modal $\rightarrow$ Điền SĐT/Email và Lưu $\rightarrow$ Hệ thống tự chọn `PHÚC ANH` vào phiếu nhập.
- [ ] **Test 3 - Thêm nhanh Model mới**: Gõ `Canon 2900` $\rightarrow$ Dropdown hiện `+ Thêm mới Model: "Canon 2900"` $\rightarrow$ Bấm vào mở Modal $\rightarrow$ Tự động nhận diện Hãng `CANON` $\rightarrow$ Bấm Lưu $\rightarrow$ Tự động chọn vào phiếu nhập.
- [ ] **Test 4 - Khóa cứng**: Để trống NCC hoặc gõ chuỗi bất kỳ rồi bấm "Xác Nhận Nhập Kho" $\rightarrow$ Hệ thống chặn lưu và yêu cầu chọn hoặc thêm NCC vào danh mục.
- [ ] **Test 5 - Phân quyền**: Đăng nhập tài khoản không phải Admin $\rightarrow$ Kiểm tra không truy cập được vào Audit Log.
