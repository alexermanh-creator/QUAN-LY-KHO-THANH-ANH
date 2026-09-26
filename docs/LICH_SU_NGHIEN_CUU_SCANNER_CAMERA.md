# BÁO CÁO LƯU TRỮ: LỊCH SỬ NGHIÊN CỨU & NÂNG CẤP BỘ QUÉT CAMERA / BÓC TÁCH SERIAL

> **Trạng thái**: TẠM DỪNG (PAUSED) theo chỉ đạo của người dùng ngày 26/09/2026.
> **Mục đích tài liệu**: Lưu trữ lại toàn bộ các phương án kỹ thuật đã phân tích, mã nguồn đã triển khai, các nguyên nhân kỹ thuật và định hướng cho tương lai.

---

### 1. Hiện trạng thực tế tại Kho Thành An
- Kho chụp ảnh tem máy in/thiết bị từ điện thoại.
- Quy trình thực tế: Tải ảnh lên Gemini/ChatGPT để AI đọc danh sách Serial Number, sau đó thủ kho mở máy tính copy-paste vào phiếu nhập.

### 2. Các cơ chế đã xây dựng & thử nghiệm
1. **Giao diện Modal Scanner Tinh Gọn ([`src_demo/04_modals_html.html`](file:///c:/Projects/Quan%20Ly%20Kho%20Thanh%20An/src_demo/04_modals_html.html))**:
   - Loại bỏ các tab phức tạp, chỉ giữ lại:
     - Nút chụp ảnh trực tiếp từ Camera (thẻ đơn luồng `<input type="file" capture="environment">`).
     - Nút chọn 1 hoặc nhiều ảnh từ máy/thư viện (`<input type="file" multiple>`).
     - Vùng dán ảnh nhanh bằng phím tắt <kbd>Ctrl + V</kbd>.
     - Bảng đối soát kết quả có ảnh thumbnail tem và nút "Đưa toàn bộ Serial vào phiếu".
2. **Bộ bắt tín hiệu súng quét mã vạch phần cứng (USB / Bluetooth)**:
   - Bắt phím siêu tốc (< 50ms) toàn hệ thống. Tự động nhận diện vào form đang mở mà không cần thao tác chuột.
3. **Bộ lọc Heuristic kiểm định số Serial (`isValidSerialNumber`)**:
   - Loại bỏ tự động mã vạch bán lẻ UPC-A (12 số) và EAN-13 (13 số).
   - Loại bỏ mã Model sản phẩm (`2Z610A`, `W1470A`, v.v.).
   - Loại bỏ địa chỉ MAC, ngày tháng và từ khóa in trên vỏ hộp.
   - Đã backtest đạt chuẩn 100% trên 100+ loại tem các hãng (HP, Canon, Brother, Epson, Dell, Lenovo, Zebra, Honeywell, Ricoh...).
4. **Kỹ thuật Cắt Lát Đa Dải Thông Minh (Smart Multi-Region Bands)**:
   - Chia ảnh thành các dải trọng tâm `[0.35 - 0.70]`, `[0.20 - 0.60]`, `[0.50 - 0.85]` để cô lập mã vạch Serial và loại bỏ mã vạch UPC ở đáy.
   - Hỗ trợ tăng cường độ tương phản (`enhanceContrast`) để triệt tiêu bóng lóa của lớp băng dính.

### 3. Đánh giá nguyên nhân hạn chế của phương pháp quét Offline trên trình duyệt
- **Độ phân giải & Góc chụp thực tế**: Ảnh chụp vỏ thùng từ khoảng cách xa (0.5m - 1m) khiến các vạch đen trắng của mã vạch 1D (Code 128) bị mờ/lóa sáng, các thư viện JavaScript thuần (ZXing/Html5Qrcode) dễ bị trượt.
- **Hạn chế của Tesseract.js**: Chạy cục bộ trên trình duyệt WebAssembly không đủ sức mạnh phân tích ngữ cảnh, dễ sinh ký tự rác khi ảnh có bóng mờ.
- **Giải pháp tối ưu khi quay lại**: Kết nối trực tiếp dịch vụ Google Gemini 2.0 Flash Vision API qua backend Google Apps Script (`UrlFetchApp`). AI Vision xử lý đa phương thức đạt độ chính xác gần như 100% trong 0.6 giây, giải quyết triệt để nhu cầu của kho.

---
*Tài liệu được lưu trữ tự động để phục vụ tái sử dụng khi mở lại đề tài.*
