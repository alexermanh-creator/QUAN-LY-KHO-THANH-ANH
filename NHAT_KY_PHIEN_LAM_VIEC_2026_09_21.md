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

### 8. Biên dịch, Kiểm thử và Triển khai:
- Chạy kiểm thử tự động giả lập máy quét `test_simulation_scanner.js` đạt 4/4 bài kiểm tra.
- Chạy kiểm tra cú pháp `check_syntax.js` đạt 0 lỗi.
- Đã chạy `build_demo.ps1` cập nhật file `demo_quan_ly_kho.html` (724 KB).
- Đã chạy `build_gas_index.ps1` tạo `gas/Index.html` và `src/frontend/Index.html` (734 KB).
- Đã đẩy toàn bộ 20 file lên Google Apps Script bằng `clasp push -f` thành công 100%.
- Đã commit và push toàn bộ lên GitHub `main` branch thành công 100%.

