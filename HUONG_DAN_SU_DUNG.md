# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ KHO THÀNH AN
*(Dành cho Ban Giám Đốc, Quản Lý Kho, Kỹ Thuật Viên và Thủ Kho)*

---

## 1. TỔNG QUAN GIAO DIỆN & VAI TRÒ NGƯỜI DÙNG (RBAC)

### 1.1 Bố cục màn hình
- **Thanh đỉnh (Topbar):** Chứa thanh tìm kiếm nhanh Spotlight (`Ctrl + K`), nút đổi tài khoản/vai trò, nút Quét SN và nút chuyển sang chế độ Kho Mobile.
- **Thanh bên trái (Sidebar):** Menu chuyển đổi giữa 10 phân hệ nghiệp vụ chính.
- **Khu vực trung tâm:** Bảng số liệu, biểu đồ thống kê và các biểu mẫu thao tác.

### 1.2 Bốn vai trò người dùng trong hệ thống
1. **THỦ KHO:** Tạo phiếu Nhập, Xuất, kiểm kê kho, quét mã vạch và xem báo cáo tồn kho.
2. **BẢO HÀNH:** Mở và cập nhật ca bảo hành, tra cứu hồ sơ Serial 360°, tạo phiếu hoàn nhập máy từ khách.
3. **QUẢN LÝ:** Toàn quyền của Thủ kho + Sửa/Hủy phiếu kho, đóng phiên kiểm kê, điều chuyển kho, xem nhật ký Audit và quản lý danh mục.
4. **ADMIN (Quản trị viên):** Quyền cao nhất: Quản lý người dùng, thay đổi ma trận phân quyền 20 chức năng, cấu hình cảnh báo, sao lưu và reset hệ thống.

*Cách đổi vai trò test:* Bấm vào tên người đăng nhập ở góc trên bên phải màn hình -> Chọn vai trò mong muốn.

---

## 2. THANH TÌM KIẾM THÔNG MINH SPOTLIGHT (CTRL + K)

- **Phím tắt:** Bấm tổ hợp `Ctrl + K` (hoặc nhấp chuột vào ô tìm kiếm trên thanh đỉnh).
- **Tìm kiếm tức thì:** Gõ bất kỳ thông tin nào:
  - Số Serial máy (ví dụ: `CN29-998811`).
  - Mã nội bộ Thành An (ví dụ: `TA-260920-000101`).
  - Tên Model (ví dụ: `Canon 2900`, `Ricoh 5054`).
  - Tên hoặc SĐT Khách hàng, Nhà cung cấp (ví dụ: `Hòa Bình`, `0903123456`).
  - Số phiếu kho (ví dụ: `NK-2609-001`).
- **Nút "Scan":** Bật camera để quét thẳng mã vạch/QR trên máy cần tìm.

---

## 3. BẢNG ĐIỀU KHIỂN KPI & BÁO CÁO QUẢN TRỊ (DASHBOARD)

- **4 thẻ chỉ số nhanh:** Tổng máy tồn kho, Số chủng loại Model, Phiếu xuất trong tháng, Ca bảo hành đang mở.
- **Biểu đồ Nhập - Xuất:** Biểu đồ kép kết hợp cột và đường thể hiện biến động nhập/xuất theo thời gian (Hôm nay, 7 ngày, Tháng này, 3 tháng hoặc Tùy chọn ngày).
- **Biểu đồ Cơ cấu hàng hóa:** Tỷ lệ phần trăm giữa Máy in, Máy photocopy, Laptop, Máy scan...
- **Biểu đồ Tuổi tồn kho (Aging):** Phân bổ số lượng máy tồn <30N, 30-60N, 60-90N và >90N.

---

## 4. QUẢN LÝ TỒN KHO 2 CHẾ ĐỘ

Hệ thống cho phép chuyển đổi qua lại giữa 2 góc nhìn bằng nút bấm:
- **Chế độ xem theo Model (Quản lý & Bán hàng):** Bảng gom nhóm theo từng mã máy, hiển thị số lượng tồn tại từng kho (*Kho VP*, *Kho Chi Nhánh*, *Kho Cách Ly lỗi*) và Tổng tồn toàn hệ thống. Có nút xem danh sách chi tiết các Serial của từng Model.
- **Chế độ xem theo Serial (Thủ kho & Kỹ thuật):** Danh sách chi tiết từng con máy với: Số Serial hãng, Mã nội bộ Thành An, Vị trí kho, Ngày nhập và **Huy hiệu Tuổi tồn** (Xanh <30N, Vàng 30-60N, Cam 60-90N, Đỏ >90N). Có nút xem Hồ sơ 360° cho từng máy.

---

## 5. QUY TRÌNH NHẬP KHO THỰC TẾ

1. **Bước 1:** Vào menu **Nhập kho** -> Chọn Nhà cung cấp, chọn Kho nhận hàng (Kho VP / Kho Chi Nhánh), chọn ngày nhập.
2. **Bước 2:** Chọn Model máy cần nhập -> Hệ thống tự hiển thị hãng và thời hạn bảo hành chuẩn.
3. **Bước 3:** Nhập số Serial bằng 1 trong 3 cách:
   - Dùng đầu đọc quét mã vạch trên thùng máy.
   - Bấm nút **"Camera Scan"** để dùng camera quét.
   - Dán danh sách nhiều số Serial (mỗi số 1 dòng).
4. **Bước 4:** Bấm **"Cấp mã nội bộ Thành An"** để hệ thống tự động sinh mã liên tiếp `TA-YYMMDD-XXXXXX`.
5. **Bước 5:** Bấm `+ Thêm vào phiếu` để đưa xuống danh sách kiểm tra tạm (Draft).
6. **Bước 6:** Kiểm tra lại số lượng, nếu sai số SN nào thì bấm nút thùng rác đỏ xóa dòng đó. Bấm **"Lưu Phiếu Nhập Kho"** để hoàn tất ghi sổ kho.

---

## 6. QUY TRÌNH XUẤT KHO & KÍCH HOẠT BẢO HÀNH

1. **Bước 1:** Vào menu **Xuất kho** -> Chọn Khách hàng (hoặc bấm `+ Thêm KH` tạo nhanh), chọn Kho xuất, chọn ngày xuất.
2. **Bước 2:** Quét số Serial con máy lấy từ kệ ra:
   - Hệ thống tự động kiểm tra: Nếu máy đang có trong kho (`IN_STOCK`), hệ thống điền thông tin Model. Nếu quét nhầm máy đã xuất hoặc máy đang ở Kho Cách Ly, hệ thống sẽ chặn lại và cảnh báo chuông ngay.
3. **Bước 3:** Chọn gói bảo hành riêng cho con máy đó (`0 tháng`, `3 tháng`, `6 tháng`, `12 tháng`, `24 tháng` hoặc `36 tháng`).
4. **Bước 4:** Bấm **"Lưu Phiếu Xuất Kho"**:
   - Tồn kho tự động trừ.
   - Thời hạn bảo hành của Serial đó bắt đầu kích hoạt và tính chính xác từ ngày xuất.

---

## 7. TRA CỨU HỒ SƠ THIẾT BỊ SERIAL 360°

- Vào menu **Hồ sơ Serial 360°** -> Nhập số Serial bất kỳ:
  - **Trạng thái bảo hành:** Báo rõ *Còn hạn (còn x ngày)* hoặc *Đã hết hạn* kèm thanh đo trực quan.
  - **Nguồn gốc nhập:** Nhập ngày nào, từ NCC nào, số phiếu nhập gốc là gì.
  - **Lịch sử xuất hàng:** Xuất ngày nào, bán cho ai, địa chỉ lắp đặt, SĐT liên hệ.
  - **Dòng thời gian (Timeline):** Toàn bộ lịch sử luân chuyển kho, các lần mang đi sửa chữa bảo hành.

---

## 8. CÁC NGHIỆP VỤ KHO NÂNG CAO

Nằm tại menu **Nghiệp vụ kho**:
- **Hoàn nhập hàng từ Khách:** Thu hồi máy khách trả lại vào kho sau khi kiểm tra đúng lịch sử đã xuất.
- **Trả hàng cho Nhà cung cấp:** Xuất trả máy lỗi từ nhà sản xuất nằm ở Kho Cách Ly cho hãng.
- **Chuyển kho nội bộ:** Điều chuyển máy giữa Kho VP, Kho Chi Nhánh và Kho Cách Ly.
- **Kiểm kê kho (Stocktake):** Tạo đợt kiểm kê, quét barcode thực tế đối chiếu với sổ sách máy tính, tự động lập biên bản máy thừa/thiếu.

---

## 9. QUẢN LÝ BẢO HÀNH & TIẾP NHẬN SỬA CHỮA

1. Vào menu **Bảo hành** -> Bấm **"+ Tiếp nhận ca mới"**.
2. Quét Serial máy: Hệ thống tự điền tên khách, model và kiểm tra hạn bảo hành.
3. Nhập mô tả triệu chứng hư hỏng.
4. Cập nhật trạng thái xử lý: `TIẾP NHẬN` -> `ĐANG SỬA` -> `GỬI HÃNG` -> `HOÀN TẤT` / `ĐỔI MÁY`.

---

## 10. XỬ LÝ KHI NHẬP / XUẤT NHẦM THÔNG TIN

- **Khi đang soạn (chưa bấm Lưu phiếu):** Sửa trực tiếp trên các ô chọn (đổi NCC, đổi Khách) hoặc bấm icon thùng rác đỏ xóa dòng máy có SN sai rồi quét lại.
- **Khi phiếu đã lưu (đã vào sổ kho):** Vào menu **"Lịch sử giao dịch"**:
  - **Sửa phiếu (Icon bút vàng):** Áp dụng khi nhầm Nhà cung cấp, Khách hàng, Kho, Địa chỉ, SĐT, Gói bảo hành. Chọn lại thông tin đúng, nhập lý do sửa và bấm Lưu.
  - **Hủy phiếu hoàn nguyên (Icon dấu cấm đỏ):** Áp dụng khi nhầm số Serial máy. Bấm Hủy phiếu -> Hệ thống tự động thu hồi/trả máy về trạng thái cũ 100% -> Quay lại lập phiếu mới với số SN chuẩn.

---

## 11. NHẬT KÝ KIỂM TOÁN (AUDIT TRAIL)

- Tự động ghi lại 100% mọi hành động của mọi tài khoản: Ai làm gì, lúc mấy giờ, giá trị cũ là gì, giá trị mới là gì, lý do thay đổi.
- Không thể can thiệp hay xóa sửa nhật ký, đảm bảo chống gian lận và thất thoát tài sản tuyệt đối.

---

## 12. QUẢN TRỊ DANH MỤC HỆ THỐNG

Gồm 6 bảng danh mục chuẩn:
1. **Model / Sản phẩm**
2. **Nhà cung cấp**
3. **Khách hàng**
4. **Kho hàng**
5. **Hãng sản xuất**
6. **Nhóm hàng**

---

## 13. CÀI ĐẶT, SAO LƯU & AN TOÀN DỮ LIỆU

- **Phân quyền người dùng:** Quản lý tài khoản và ma trận 20 quyền hạn.
- **Trường dữ liệu tùy chỉnh (Custom Fields):** Tự thêm trường quản lý riêng (Số PO, Màu máy...).
- **Sao lưu & Phục hồi:** Tạo bản sao lưu dự phòng định kỳ chỉ bằng 1 nút bấm.
- **Reset hệ thống:** Cơ chế an toàn 5 lớp yêu cầu nhập mã `RESET-THANHAN` và mật khẩu Admin.

---

## 14. ĐỔI MẬT KHẨU QUẢN TRỊ VIÊN (ADMIN)

Mật khẩu Admin bảo vệ các thao tác nhạy cảm tối cao: sửa/hủy phiếu đã duyệt, reset hệ thống, sao lưu dữ liệu và phân quyền tài khoản.

- **Vị trí đổi mật khẩu:**
  - *Cách 1:* Bấm vào tên người đăng nhập (**Khổng Mạnh Cường**) ở góc trên bên phải màn hình -> Chọn **"Đổi mật khẩu Admin"** (icon chìa khóa vàng).
  - *Cách 2:* Vào menu **Cài đặt** -> Tab **2. Tài Khoản Nhân Viên (RBAC)** -> Tại dòng tài khoản `admin`, bấm nút **icon chìa khóa** ở cột Thao tác.
- **Các bước thực hiện:**
  1. Nhập **Mật khẩu hiện tại** (mật khẩu mặc định khởi tạo là `admin123`).
  2. Nhập **Mật khẩu mới** (tối thiểu từ 6 ký tự trở lên).
  3. Nhập **Xác nhận mật khẩu mới** (phải khớp với mật khẩu mới).
  4. Bấm **"Lưu Mật Khẩu"**.
- **Lưu ý bảo mật:**
  - Sau khi đổi thành công, hệ thống tự động lưu mật khẩu mới và ghi nhận nhật ký vào **Audit Trail**.
  - Các bước xác thực nhạy cảm sau đó (như xác thực Re-auth khi sao lưu hoặc reset dữ liệu) sẽ lập tức yêu cầu nhập mật khẩu mới này.

