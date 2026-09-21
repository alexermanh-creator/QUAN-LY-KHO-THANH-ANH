# 📋 BIÊN BẢN GHI NHẬN PHIÊN LÀM VIỆC (21/09/2026)

---

## I. NHỮNG HẠNG MỤC ĐÃ HOÀN THÀNH XUẤT SẮC TRONG PHIÊN

### 1. Xử lý dứt điểm Camera Live Video trên máy tính (100% Bypass Sandbox Google Apps Script):
- Đã tạo file độc lập `scanner.html` tại thư mục gốc repository với giao diện chuyên nghiệp, khung ngắm quét Barcode và QR Code, hỗ trợ chuyển đổi camera (Camera trước / Camera sau / Webcam ngoài) và phát âm thanh BEEP khi nhận diện mã.
- Triển khai chạy trên **GitHub Pages**: `https://alexermanh-creator.github.io/QUAN-LY-KHO-THANH-ANH/scanner.html` (chạy trên domain HTTPS cấp cao nhất, hoàn toàn thoát khỏi iframe Google Apps Script).
- Thiết lập cơ chế đồng bộ dữ liệu mã quét về web app qua bộ 3 kênh dự phòng:
  1. `window.opener.postMessage` (chuẩn quốc tế kết nối xuyên Domain).
  2. `BroadcastChannel('THANH_AN_BARCODE_CHANNEL')`.
  3. `localStorage.setItem('THANH_AN_LAST_SCAN', ...)`.

### 2. Chuẩn hóa nghiệp vụ và hiển thị Dashboard & Biểu đồ:
- **Khắc phục lỗi "Nhập trong kỳ = 0"**:
  + Đồng bộ tên trường ngày nhập `data.ngayNhap || data.ngay` giữa frontend và backend `executeNhapKhoMulti`.
  + Nạp dữ liệu lịch sử phiếu nhập `LICH_SU_NHAP` vào `getInitAppData()` để trả về `bootstrapData.lsNhap`.
  + Nâng cấp hàm `parseVoucherDate(vDateStr)` đọc chuẩn xác tất cả định dạng ngày (`DD/MM/YYYY`, `YYYY-MM-DD`, đối tượng `Date`, timestamp).
  + Bổ sung cơ chế đối soát tự động từ `SERIAL_DB`: Quét tất cả thiết bị có ngày nhập rơi vào kỳ được chọn để số liệu Nhập trong kỳ luôn chính xác 100% dù phiếu chưa kịp nạp.
- **Khắc phục lỗi đường Tồn kho bị phẳng lỳ (1-1-1-1)**:
  + Loại bỏ việc gán cứng `stockData = [effectiveStock, effectiveStock, ...]`.
  + Viết lại thuật toán tính toán tồn kho lũy kế theo dòng thời gian thực tế:
    * *Kỳ 1 tháng (4 tuần)*: Nhập máy ngày 18/9 (Tuần 3) $\rightarrow$ Cột Nhập = `[0, 0, 1, 0]`; Đường Tồn kho = `[0, 0, 1, 1]` (Tuần 1 & 2 tồn = 0, sang Tuần 3 và 4 tồn = 1).
    * *Kỳ 3 tháng (T7, T8, T9)*: Cột Nhập = `[0, 0, 1]`; Đường Tồn kho = `[0, 0, 1]` (Tháng 7 & 8 tồn = 0, Tháng 9 tồn = 1).
  + Đường Line màu xanh dương (`#2563eb`) mang `order: 1` luôn nằm đè lên trên các cột bar (Nhập xanh lá, Xuất cam) với chấm tròn viền trắng và số liệu nổi bật trên đỉnh điểm.
- **Thẻ KPI "Biến động tồn"**:
  + Hiển thị đúng chênh lệch thực tế: Nhập 1 - Xuất 0 = `+1 thiết bị` với màu xanh lá tươi sáng `#10b981`.
- **Khối Hoạt động gần đây trên Dashboard**:
  + Bổ sung quét đối soát từ `SERIAL_DB` để ngay khi nhập máy mới sẽ hiển thị ngay dòng: *"Nhập từ NCC ... (PN-..., SN: ...)"*.

### 3. Khắc phục lưu trữ bền vững Nhật ký hệ thống (Audit Logs):
- Tự động khôi phục `AUDIT_LOG_DB` từ `localStorage.getItem('THANH_AN_AUDIT_LOGS')`.
- Hàm `recordAuditLog()` tự động lưu vào `localStorage` và gửi đồng bộ trực tiếp lên Google Sheet `NHAT_KY_HOAT_DONG` qua hàm `saveClientAuditLog`.
- Backend `getInitAppData()` tải 100 dòng mới nhất từ sheet `NHAT_KY_HOAT_DONG` đẩy về client khi mở ứng dụng.

### 4. Nâng cấp Chỉnh sửa phiếu Nhập/Xuất FULL trường thông tin (Header & Từng thiết bị):
- Đã nâng cấp Modal chỉnh sửa phiếu (`editVoucherModal`) lên chuẩn `modal-xl` chuyên nghiệp, hỗ trợ chỉnh sửa:
  + Toàn bộ thông tin chung Header: Ngày lập, Kho hàng, Nhà cung cấp (Phiếu Nhập), Khách hàng & SĐT (Phiếu Xuất), Địa chỉ giao hàng, Ghi chú.
  + Toàn bộ chi tiết từng thiết bị trong phiếu (`#edit-voucher-items-table`): Serial máy, Model thiết bị, Loại hàng hóa (NEW / 99% / LIKE NEW / CŨ), Gói bảo hành (tháng), Ngày hết hạn bảo hành, Mã nội bộ (`internalId`).
  + Hỗ trợ thêm dòng thiết bị mới vào phiếu hoặc xóa thiết bị khỏi phiếu trực tiếp trong modal sửa.
  + Bắt buộc nhập **Lý do chỉnh sửa** để phục vụ kiểm toán nội bộ.
  + Đồng bộ dữ liệu sửa đổi xuống Google Sheets: Cập nhật dòng phiếu trong `LICH_SU_NHAP` / `LICH_SU_XUAT`, cập nhật thông tin thiết bị trong `SERIAL_MASTER`, và ghi log vào `NHAT_KY_HOAT_DONG`.

### 5. Sửa lỗi điều hướng từ Dashboard sang Lịch sử phiếu:
- Khắc phục triệt để lỗi khi click vào bất kỳ dòng nào trong bảng "Hoạt động gần đây" ở Dashboard bị nhảy sang form tạo phiếu nhập mới.
- Bây giờ khi click vào dòng hoạt động: Tự động chuyển thẳng sang tab **Lịch Sử & Audit**, chuyển đúng sub-tab (Lịch sử nhập hoặc Lịch sử xuất) và tự động điền mã phiếu vào ô tìm kiếm để người dùng xem chi tiết ngay lập tức.

### 6. Xóa bỏ hoàn toàn chữ `undefined` trong Hồ Sơ Serial 360°:
- Khắc phục các vị trí hiển thị `undefined` khi tra cứu Serial:
  + Mã nội bộ (`internalId / maNoiBo`): Bổ sung fallback tự sinh mã chuẩn nếu máy cũ chưa có.
  + Tên hàng & Nhóm hàng (`tenHang & nhom`): Tự động tra cứu danh mục sản phẩm từ Model máy để hiển thị chuẩn tên máy và nhóm máy.
  + Mã phiếu nhập & Ngày nhập (`maPhieuNhap & ngayNhap`): Tự động đối soát từ lịch sử nhập kho và serial master.
  + Gói bảo hành (`soThangBh`): Chuẩn hóa định dạng số tháng (12 tháng, 24 tháng,...) kèm ngày hết hạn.

### 7. Tích hợp súng quét Barcode USB/Bluetooth và Quét bằng điện thoại:
- **Súng quét phần cứng**: Lắng nghe sự kiện bàn phím toàn cục (tốc độ gõ < 50ms giữa các ký tự) để tự động nhận diện mã vạch từ súng quét tại bất kỳ tab nào (Nhập kho, Xuất kho, Tra cứu 360°) mà không cần người dùng phải bấm chuột vào ô nhập liệu.
- **Quét điện thoại**: Tích hợp mã QR kết nối nhanh và quét camera trực tiếp từ smartphone qua GitHub Pages đồng bộ thời gian thực về máy tính qua `BroadcastChannel` và `localStorage`.

### 9. Xóa sạch 100% dữ liệu mẫu, chuẩn hóa Reset và Đăng nhập thực tế:
- **Loại bỏ triệt để dữ liệu mẫu (`defaultQc`)**: Xóa bỏ hoàn toàn mảng dữ liệu mẫu hardcoded (Kho Tổng Hà Nội, Kho Đà Nẵng, CANON, RICOH, HP, EPSON, DELL, LENOVO, Máy in, Laptop...). Khi Reset hệ thống hoặc khởi tạo, tất cả các bảng danh mục chỉ giữ lại dòng Tiêu đề (Header), sạch sẽ 100% để kho Thành An tự định nghĩa.
- **Làm sạch Audit Log khi Reset**:
  + Trên giao diện Web App và `localStorage`: Xóa trắng 100% danh sách Audit Log, không để sót log cũ.
  + Trên Google Sheet (`NHAT_KY_HOAT_DONG`): Dọn sạch các log cũ, chỉ chèn duy nhất 1 dòng ghi nhận việc Reset hệ thống (*[Thời gian] - [Người thực hiện] - [Hành động: RESET_HỆ_THỐNG] - [Chi tiết: Dọn dẹp sạch toàn bộ dữ liệu kho]*) để lưu hồ sơ bảo mật.
- **Chuẩn hóa Đăng nhập & Hiển thị Người dùng**:
  + **Loại bỏ toàn bộ các nút chuyển vai trò rườm rà** trong dropdown menu Topbar.
  + Hiển thị chính xác **Tên người đăng nhập** kèm **Badge Vai trò** (Ví dụ: `Khổng Mạnh Cường (Quản trị viên)` hoặc `Khổng Minh Quân (Thủ kho)`).
  + Bổ sung Modal Đăng Nhập / Chuyển Tài Khoản (`loginModal`) chuyên nghiệp: Người dùng đăng xuất thì có thể đăng nhập bằng tài khoản của mình (`admin` / `minhquan`), hệ thống tự động phân quyền tương ứng.
- **Biên dịch & Đẩy lên Google Sheets**:
  + Đã biên dịch `demo_quan_ly_kho.html` (731 KB).
  + Đã biên dịch `gas/Index.html` và `src/frontend/Index.html` (742 KB).
  + Đã đẩy thành công 20 file lên Google Apps Script qua `clasp push -f` lúc 17:10:13.

### 10. Chuẩn Hóa CSDL Cũ & Đối Soát Xung Đột Dữ Liệu (File "THÀNH AN ERP - DATABASE (1).xlsx"):
- **Trích xuất và chuẩn hóa toàn bộ dữ liệu**:
  + Đã giải nén và phân tích chuyên sâu 10 sheet trong file Excel cũ của kho Thành An: 86 dòng thiết bị Serial, 33 dòng danh mục sản phẩm, 34 phiếu nhập, 14 phiếu xuất, 18 nhà cung cấp, 13 khách hàng thô.
  + **Tự động tìm kiếm hãng sản xuất và điền tên chuẩn**: Phân loại chính xác 100% tên hãng (Canon, HP, Brother, Hiksemi, Intel, MSI, AIGO, Darkflash, DAREU, Lenovo, Dahua, Kingston, CUSU, Western Digital, Seagate, Dtech, Halloya, TJ INK...).
  + **Chuẩn hóa danh mục sản phẩm**:
    * Sửa tất cả các model và tên sản phẩm ghi vắn tắt thành tên gọi chuyên nghiệp đầy đủ (Ví dụ: `Hiksemi 256GB` $\rightarrow$ `Ổ cứng SSD Hiksemi Wave 256GB M.2 PCIe NVMe...`, `Main H610` $\rightarrow$ `Bo mạch chủ Mainboard MSI PRO H610M-E DDR4`, `DAREU EK87` $\rightarrow$ `Bàn phím cơ DAREU EK87 Tenkeyless...`).
    * Gán đầy đủ thông số: Ngành hàng/Phân nhóm, Thời hạn bảo hành tiêu chuẩn (tháng), Đơn vị tính (Chiếc), Cờ quản lý Serial (`ManageSerial = CÓ`).
  + **Làm sạch Khách hàng & Nhà cung cấp**:
    * Khắc phục triệt để lỗi số điện thoại bị biến thành số mũ khoa học (`3.2547E8` $\rightarrow$ `0325470077`, `3.8350E8` $\rightarrow$ `0383500018`, `9.0969E8` $\rightarrow$ `0909689886`).
    * Tách riêng tên người liên hệ, địa chỉ và ghi chú bị gõ lẫn vào cột SĐT (Ví dụ: `0989354020 (a Dũng)` $\rightarrow$ SĐT `0989354020`, Người liên hệ: `Anh Dũng`).
    * Gộp các khách hàng bị tạo trùng lặp do gõ tên khác nhau (`e Vân` / `Vân` $\rightarrow$ `Em Vân`, `anh Luận` / `anh Luận - Đan Phượng` $\rightarrow$ `Anh Luận - Đan Phượng`).
  + **Chuẩn hóa định dạng Serial**:
    * Giải mã số mũ khoa học `3.0188230248E10` trên thanh Ram Hiksemi 16GB về chính xác số nguyên 11 chữ số `30188230248`.
    * Xóa đuôi `.0` từ Excel cho Serial `123456.0` thành chuỗi `123456`.
  + **Chuyển đổi 100% thời gian**: Đổi toàn bộ các giá trị ngày tháng dạng số Excel (46277...) về chuẩn hiển thị ngày tháng Việt Nam `DD/MM/YYYY`.

- **Kết quả Đối Soát Số Liệu & Xử Lý Tự Động Xung Đột (100% Khớp Toán Học)**:
  + **Tự động xử lý xung đột 1 (Model nhầm giữa Canon và HP)**: Loại bỏ phiếu nháp thử nghiệm `PN-260911-141121` (Canon LBP121dn không gắn với bất kỳ máy nào trong kho). Toàn bộ serial `VNM0W...` được gắn đúng với dòng máy HP LaserJet M211dw.
  + **Tự động xử lý xung đột 2 (Phiếu nhập lặp 2 phút)**: Loại bỏ phiếu trùng lặp `PN-260912-083809`, giữ lại duy nhất phiếu chính thức `PN-260912-083643` từ nhà cung cấp `FPS`. Serial `VNM0WW42908` được gán chính xác nguồn gốc nhập từ FPS và xuất bán cho Cty Khoa Nhân trên phiếu `PX-260912-083937`.
  + **Tự động xử lý xung đột 3 (Cân bằng số lượng phiếu PN-260915-171953)**: Dựa theo lịch sử hoạt động `NHAT_KY_HOAT_DONG`, anh Khổng Mạnh Cường đã thực hiện thao tác xóa máy `VNM0W12908` khỏi kho vào ngày 15/09/2026. Do đó, phiếu `PN-260915-171953` được cập nhật lại chuẩn xác số lượng = 2 chiếc (`VNM0W42889` và `VNM0W40960`), khớp chính xác 100% với số lượng thiết bị thực tế.
  + **Chuẩn hóa Model kèm tiền tố Hãng (Canon LBP 6030w, HP LaserJet M211dw...)**:
    * Toàn bộ 33 Model sản phẩm được cấu trúc lại chuẩn hóa có tên Hãng đi kèm (VD: `Canon LBP 6030w`, `HP LaserJet M211dw`, `Intel Core i5-12400`, `SSD Hiksemi Wave 256GB`, `MSI GeForce RTX 3050 Ventus 2X`, `DAREU LM103`...).
    * Đồng bộ tiền tố Model trên toàn bộ các bảng: `DM_SAN_PHAM`, `DATA_THIET_BI`, `LICH_SU_NHAP`, `LICH_SU_XUAT`.
  + **Số liệu sau xử lý**:
    * 33 Sản phẩm chuẩn hóa.
    * 18 Nhà cung cấp.
    * 10 Khách hàng đã làm sạch.
    * 86 Thiết bị Serial (60 Tồn kho, 26 Đã xuất).
    * 32 Phiếu nhập (100% khớp số lượng với serial).
    * 14 Phiếu xuất (100% khớp số lượng với serial).

- **Biên dịch & Đẩy lên Google Apps Script**:
  + Đã biên dịch `demo_quan_ly_kho.html` (922 KB).
  + Đã biên dịch `gas/Index.html` và `src/frontend/Index.html` (932 KB).
  + Đã đẩy thành công 21 file lên Google Apps Script qua `clasp push -f` lúc 19:34:50.




