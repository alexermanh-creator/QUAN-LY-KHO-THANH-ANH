# NHẬT KÝ PHIÊN LÀM VIỆC & PROMPT BÀN GIAO TIẾP TỤC DỰ ÁN QUẢN LÝ KHO THÀNH AN
**Ngày ghi nhận:** 29/09/2026  
**Trạng thái phiên làm việc:** Đã giải quyết triệt để vấn đề đồng bộ dữ liệu đa máy, nâng cấp Force Sync, tối ưu Dashboard Hoạt động gần đây (7 dòng) và Redeploy toàn bộ Google Apps Script.

---

```markdown
Bạn là trợ lý AI lập trình viên cấp cao đang hỗ trợ dự án "Hệ Thống Quản Lý Kho Thiết Bị Máy In & Mực In Thành An" (Thanh An Warehouse Management System v4.0).

Hãy đọc kỹ toàn bộ bối cảnh, lịch sử xử lý và hiện trạng hệ thống dưới đây trước khi thực hiện bất kỳ yêu cầu nào tiếp theo:

### 1. QUY TẮC TỐI THƯỢNG CỦA NGƯỜI DÙNG (BẮT BUỘC TUÂN THỦ 100%):
- "PHÂN TÍCH, GIẢI THÍCH VÀ ĐƯA HƯỚNG XỬ LÝ TRƯỚC KHI CODE" (Theo AGENTS.md).
- Tuyệt đối KHÔNG tự ý sửa code khi chưa giải thích nguyên nhân và được người dùng đồng ý.
- Giao tiếp, giải thích mạch lạc bằng Tiếng Việt thân thiện, dễ hiểu (người dùng không phải lập trình viên).
- Nguyên tắc fail-fast: Bắt buộc chọn đúng NCC/Khách hàng/Kho ngay từ đầu, không thêm nhanh danh mục tại tab Nhập/Xuất.
- Luôn giữ nguyên tắc đồng bộ dữ liệu (RAM, LocalStorage, Google Sheets, Phiếu, Lịch sử, Serial 360°).
- Sau khi sửa code: Bắt buộc chạy `build_demo.ps1`, `build_gas_index.ps1`, commit/merge cả `main` lẫn `master`, và đẩy lên Google Apps Script (`clasp push -f` kèm redeploy).

---

### 2. CÁC VẤN ĐỀ ĐÃ XỬ LÝ TRIỆT ĐỂ Ở PHIÊN LÀM VIỆC 29/09/2026:

#### A. Khắc phục triệt để sự cố "Lệch dữ liệu giữa các máy tính" (Máy Anh Cường vs Máy Minh Quân):
1. **Nguyên nhân gốc rễ phát hiện được:**
   - Trong Google Apps Script có nhiều bản triển khai (Deployments) khác nhau.
   - Máy của Anh Cường đang chạy bản triển khai `...fAUktCAM7` (bị ghim ở Version cũ @129).
   - Máy của Minh Quân đang chạy bản triển khai `...4Zm_ZcxK` (bị ghim ở Version cũ @116).
   - Khi sửa code, `clasp push` chỉ đưa code lên `@HEAD` chứ chưa cập nhật vào các Deployment ID đang chạy thực tế ngoài browser.
   - Nút `[Cập nhật]` trước đó có cơ chế Smart Sync so sánh version, khi server chưa nhảy version thì nó chặn lệnh và báo "Dữ liệu đã là mới nhất", khiến client không tải dữ liệu thật từ Google Sheets về.
2. **Giải pháp đã thực hiện:**
   - Nâng cấp nút `[Cập nhật]` trên thanh Topbar thành **FORCE SYNC** (truyền `handleManualSyncClick(true)`): Luôn luôn cưỡng chế gọi trực tiếp `getAllVouchersBackend` trên Google Sheets về máy 100%, bỏ qua bộ lọc cache.
   - Tối ưu **Auto-Sync Heartbeat** chạy định kỳ mỗi 8 giây: Tự động so sánh phiên bản và timestamp, nếu phát hiện máy khác có phát sinh dữ liệu mới thì tự động tải ngầm về máy.
   - Bổ sung logic tự động sắp xếp lại mảng `VOUCHERS_DB.nhap` và `VOUCHERS_DB.xuat` theo thời gian giảm dần sau khi merge từ server.
   - Chạy lệnh `clasp deploy -i <id>` nâng cấp trực tiếp cả 2 bản triển khai thực tế:
     + Bản triển khai của Anh Cường (`...fAUktCAM7`): **Đã nâng cấp lên Version @132**.
     + Bản triển khai của Minh Quân (`...4Zm_ZcxK`): **Đã nâng cấp lên Version @133**.
   - Cả 2 máy hiện tại đều nhận đầy đủ toàn bộ code mới và đồng bộ dữ liệu 100%.

#### B. Sửa lỗi máy quét tem nhãn (Camera Scanner):
- Sửa hàm gọi `updateTransferSerialCounter()` trong `src_demo/07_camera_scanner.js` giúp huy hiệu đếm số máy chuyển kho tự động nhảy số chính xác ngay khi nạp serial từ ảnh/camera.

#### C. Tối ưu bảng "Hoạt động gần đây" trên Bảng điều khiển (Dashboard):
1. **Sửa lỗi tính thời gian:**
   - Hàm `parseVoucherTimestamp` trước đó nhầm lẫn số thứ tự với số giờ/phút/giây trong mã phiếu (lấy cụm `214430` nhân 60,000 khiến ngày 12/09 bị nhảy sang 148 ngày sau).
   - Bổ sung regex nhận diện đầy đủ cả tiền tố `PN-` (Phiếu Nhập) bên cạnh `PX-` (Phiếu Xuất).
   - Bóc tách chuẩn xác: Năm, Tháng, Ngày, Giờ, Phút, Giây.
2. **Quy chuẩn hiển thị:**
   - Giới hạn đúng **7 dòng giao dịch gần nhất** (thay vì 8 dòng) giúp giao diện gọn gàng, thoáng đãng.
   - **Ghi nhận góc nhìn nghiệp vụ của Anh Cường:** Vị trí của phiếu phản ánh đúng **thời điểm thao tác thực tế** (phiếu mới nhập lên hệ thống hôm nay thì luôn nổi lên trên cùng), còn nhãn hiển thị ("Hôm nay" / "Hôm qua") phản ánh đúng **ngày chứng từ của lô hàng** (ví dụ hàng hóa đơn ngày 28/09 nhưng ngày 29/09 kho mới nhập máy). Giữ nguyên cơ chế này để người quản lý dễ dàng nhận diện các phiếu nhập bù.

---

### 3. KIẾN TRÚC MÃ NGUỒN & CÁC TẬP TIN TRỌNG TÂM:
- `src_demo/06_app_logic.js`: Bộ điều phối API, cơ chế Force Sync, Auto-Sync Heartbeat 8 giây, xử lý đăng nhập và phân quyền.
- `src_demo/02_topbar_and_sidebar.html`: Giao diện Topbar (chứa nút Cập nhật Force Sync) và Sidebar điều hướng.
- `src_demo/07_camera_scanner.js`: Bộ xử lý quét tem nhãn Barcode/QR và OCR Gemini Vision.
- `src_demo/13_nghiep_vu_kho_and_dashboard.js`: Xử lý Dashboard, bảng Hoạt động gần đây (7 dòng), Chuyển kho, Xuất trả NCC, Kiểm kê.
- `src_demo/08_nhap_kho_logic.js` & `09_xuat_kho_logic.js`: Nghiệp vụ Nhập/Xuất kho và xử lý Phiếu Nháp đa thiết bị.
- `gas/Code.js`: Toàn bộ backend Google Apps Script xử lý Google Sheets (`getAllVouchersBackend`, `getSystemDataVersion`, v.v.).

---

### 4. QUY TRÌNH ĐÓNG GÓI & TRIỂN KHAI CHUẨN:
Mỗi khi có thay đổi code, bắt buộc thực hiện đầy đủ chuỗi lệnh sau:
1. `powershell -ExecutionPolicy Bypass -File .\build_demo.ps1`
2. `powershell -ExecutionPolicy Bypass -File .\build_gas_index.ps1`
3. `& ".\.tools\node-v20.18.0-win-x64\node.exe" check_syntax.js`
4. Chạy các bài test nghiệp vụ trong `tests/`.
5. Đẩy code lên Google Apps Script:
   `& ".\.tools\node-v20.18.0-win-x64\clasp.cmd" push -f`
6. Redeploy vào các Deployment ID đang chạy (để giữ nguyên URL cho người dùng):
   `& ".\.tools\node-v20.18.0-win-x64\clasp.cmd" deploy -i AKfycbxw71Y4ok0rbG9fGf8GlYJddX4g9luLIYssbiYX5h4NWb0VsRSEGmAuh_-fAuktCAM7 -d "Cập nhật"`
   `& ".\.tools\node-v20.18.0-win-x64\clasp.cmd" deploy -i AKfycbxWJGAsTijUt3nCFFZpWWUAtcMJBARp5w9Dv9-TmgJOIgSXqXl8S71Te9Sf4Zm_ZcxK -d "Cập nhật"`
7. Commit và Push lên GitHub cả 2 nhánh `main` và `master`.

---

### 5. ĐƯỜNG LINK WEB APP CHÍNH THỨC CỦA HỆ THỐNG:
- **Link rút gọn chính thức:** [https://tinyurl.com/khothanhan-chuan](https://tinyurl.com/khothanhan-chuan)
- **Deployment Máy Anh Cường:** `https://script.google.com/macros/s/AKfycbxw71Y4ok0rbG9Fgf8GIYJddX4g9IuLiYSsbiYX5h4NWb0vsRSEGmAUh_-fAUktCAM7/exec` (Version @132)
- **Deployment Máy Minh Quân:** `https://script.google.com/macros/s/AKfycbxWJGAstTjUt3nCFFZpWWUAtcMJBARp5w9Dv9-TmgJOlgSXqXl8S7lTe9Sf4Zm_ZcxK/exec` (Version @133)
```
