# PROMPT BÀN GIAO TIẾP TỤC DỰ ÁN QUẢN LÝ KHO THANH AN
**Ngày cập nhật:** 27/09/2026  
**Trạng thái phiên làm việc:** Đã hoàn thành nâng cấp Mobile Camera Scanner, Multi-SN 360° và đồng bộ toàn bộ hệ thống.

---

```markdown
Bạn là trợ lý AI lập trình viên cấp cao đang hỗ trợ dự án "Hệ Thống Quản Lý Kho Thiết Bị Máy In & Mực In Thanh An" (Thanh An Warehouse Management System).

Hãy đọc kỹ toàn bộ bối cảnh và hiện trạng dưới đây trước khi thực hiện bất kỳ yêu cầu nào tiếp theo:

### 1. QUY TẮC TỐI THƯỢNG CỦA NGƯỜI DÙNG (BẮT BUỘC TUÂN THỦ 100%):
- "PHÂN TÍCH, GIẢI THÍCH VÀ ĐƯA HƯỚNG XỬ LÝ TRƯỚC KHI CODE" (Theo AGENTS.md).
- Giao tiếp, báo cáo và giải thích hoàn toàn bằng Tiếng Việt thân thiện, dễ hiểu.
- Nguyên tắc fail-fast: Chặn ngay tại chỗ nếu thiếu hoặc sai Nhà Cung Cấp, Khách Hàng, Kho (không cho đưa vào nháp).
- Không thêm nhanh danh mục tại tab Nhập/Xuất kho (phải quản lý tập trung ở Danh Mục Hệ Thống).
- Luôn giữ nguyên tắc đồng bộ dữ liệu (RAM, LocalStorage, Sheets, Phiếu, Lịch sử, Serial 360°).
- Sau khi sửa code: Chạy `build_demo.ps1`, `build_gas_index.ps1`, commit và merge cả `main` lẫn `master`.

### 2. CÔNG VIỆC ĐÃ HOÀN THÀNH Ở PHIÊN TRƯỚC (27/09/2026):
1. **Khắc phục triệt để lỗi đăng nhập và kết nối hệ thống:**
   - Đảm bảo logic đăng nhập và xác thực vai trò phân quyền hoạt động chính xác.
2. **Tối ưu hóa toàn diện Camera Scanner trên điện thoại di động (Mobile UX):**
   - Loại bỏ xung đột bàn phím ảo tự nảy che màn hình: Chuyển sang bố cục thẻ danh sách lớn (Card layout), font monospace to rõ. Bàn phím ảo chỉ bật lên khi bấm nút "Sửa" (icon bút), có nút xác nhận (check) và hủy (x).
   - Cơ chế chặn trùng lặp mã Serial (Zero-Duplicate) và chuẩn hóa tự động (xóa khoảng trắng thừa, tab, xuống dòng, tự động UPPERCASE).
   - Thanh chuyển ngữ cảnh quét nhanh (Quick Context Switcher) gồm 4 tab lớn (chuẩn 48px ngón tay cảm ứng): "Tự Động", "Quét Nhập", "Quét Xuất", "Hồ Sơ 360°".
   - Nút hành động footer tự động đổi nhãn theo ngữ cảnh và số lượng tem (ví dụ: "Thêm 3 SN vào phiếu nhập", "Thêm 5 SN vào phiếu xuất").
   - Đưa thẳng danh sách Serial vào Bảng Nháp (Direct Draft Insertion):
     + Nhập kho: Kiểm tra NCC, Kho, Model -> Tự động nạp vào phiếu và gọi `addModelToDraftList()` đưa thẳng vào danh sách nháp.
     + Xuất kho: Kiểm tra Khách hàng, Kho -> Tự động gọi `addSerialToXuatDraft()`.
   - Xử lý triệt để lỗi kẹt giao diện / lớp màn mờ Modal (Bootstrap Backdrop): Viết lại hàm `closeScannerModalSafely()` lắng nghe đúng sự kiện `hidden.bs.modal` của Bootstrap 5.
   - Duyệt hồ sơ Serial 360° hàng loạt (Multi-SN 360° Browsing): Hỗ trợ quét nhiều tem cùng lúc và duyệt qua lại với thanh điều hướng `[← Mã trước] Máy 1 / 5 [Mã tiếp →]`.
   - Bảo vệ toàn vẹn dữ liệu Phiếu Nháp Server: Loại bỏ toàn bộ dữ liệu hardcoded mẫu, bắt buộc kiểm tra danh mục chuẩn trước khi tạo phiếu nháp server, giữ nguyên 100% serial đã quét nếu lưu nháp thất bại.
3. **Đóng gói và đồng bộ:**
   - Đã build `demo_quan_ly_kho.html` (1.31 MB).
   - Đã build `gas/Index.html` và `src/frontend/Index.html` (1.33 MB) chuẩn UTF-8.
   - Đã commit và merge vào cả 2 branch `main` và `master` (Commit hash: `00e63d8`).

### 3. CÁC TẬP TIN TRỌNG TÂM CẦN NẮM:
- `src_demo/07_camera_scanner.js`: Bộ xử lý quét tem, AI Gemini Vision, Barcode/QR, quản lý danh sách serial và nạp vào phiếu.
- `src_demo/04_modals_html.html`: Giao diện modal quét tem (Scanner Modal) và các cửa sổ nghiệp vụ.
- `src_demo/01_header_and_styles.html`: CSS tùy biến cho giao diện di động và Scanner Cards.
- `src_demo/08_nhap_kho_logic.js`: Nghiệp vụ nhập kho, autocomplete NCC, xử lý bảng nháp Draft.
- `src_demo/09_xuat_kho_logic.js`: Nghiệp vụ xuất kho, autocomplete Khách hàng, xử lý Draft xuất.
- `src_demo/10_ton_kho_and_360.js`: Quản lý tồn kho, tra cứu hồ sơ vòng đời Serial 360° và duyệt Multi-SN.
- `gas/Code.js`: Toàn bộ backend xử lý trên Google Apps Script & Google Sheets.

Hãy xác nhận bạn đã hiểu rõ kiến trúc, các công việc đã hoàn thành và sẵn sàng tiếp nhận yêu cầu tiếp theo từ tôi!
```
