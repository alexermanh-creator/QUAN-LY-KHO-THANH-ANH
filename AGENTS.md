# QUY TẮC LÀM VIỆC DỰ ÁN QUẢN LÝ KHO THANH AN

## ⚠️ NGUYÊN TẮC TỐI THƯỢNG CỦA NGƯỜI DÙNG (BẮT BUỘC TUÂN THỦ 100%)
> **"PHÂN TÍCH, GIẢI THÍCH VÀ ĐƯA HƯỚNG XỬ LÝ TRƯỚC KHI CODE"**

Mỗi khi người dùng yêu cầu sửa lỗi, thêm tính năng mới hoặc điều chỉnh logic hệ thống, Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý SỬA CODE NGAY**. Thay vào đó, Agent phải thực hiện đầy đủ 3 bước sau:

1. **PHÂN TÍCH (Analysis)**:
   - Xác định chính xác triệu chứng và nguyên nhân gốc rễ (Root Cause).
   - Kiểm tra code hiện tại (Chỉ rõ file, hàm, dòng code liên quan).
   - Đánh giá luồng dữ liệu và các module bị ảnh hưởng.
2. **GIẢI THÍCH (Explanation)**:
   - Trình bày rõ ràng, mạch lạc bằng tiếng Việt, ngôn từ dễ hiểu (người dùng không phải lập trình viên chuyên nghiệp).
   - Giải thích vì sao hệ thống đang chạy như vậy và vì sao phát sinh lỗi/bất cập.
3. **ĐƯA HƯỚNG XỬ LÝ (Solution & Action Plan)**:
   - Đề xuất giải pháp khắc phục cụ thể, rõ ràng từng bước.
   - Nêu rõ các phương án (nếu có) và khuyến nghị phương án tối ưu nhất.
   - Trình bày kế hoạch kiểm tra, xác minh (Test plan) sau khi sửa.
   - Nhận diện rủi ro tiềm ẩn (nếu có).
   - Chờ người dùng xác nhận trước khi bắt tay vào sửa code.

---

## 🔒 NGUYÊN TẮC NGHIỆP VỤ & QUẢN TRỊ DỮ LIỆU

### 1. Ràng Buộc Dữ Liệu Đầu Vào Ngay Tại Cửa (Fail-Fast Input Validation)
- **Nhập Kho**:
  - Không có Nhà Cung Cấp hợp lệ (hoặc gõ linh tinh không có trong `INITIAL_SUPPLIERS`) => **CHẶN NGAY TẠI CHỖ**, không cho bấm "Đưa vào danh sách Draft".
  - Chưa chọn Kho nhập => **CHẶN NGAY TẠI CHỖ**.
  - Không cho phép bất kỳ model/serial nào lọt vào bảng Draft nếu thông tin Nhà Cung Cấp / Kho chưa hợp lệ.
- **Xuất Kho**:
  - Chưa chọn Khách Hàng hợp lệ (hoặc gõ sai không có trong `INITIAL_CUSTOMERS`) => **CHẶN NGAY TẠI CHỖ**, không cho thêm serial vào Draft xuất kho.
  - Chưa chọn Kho xuất => **CHẶN NGAY TẠI CHỖ**.

### 2. Không Thêm Nhanh (Master Data Gatekeeping)
- Tuyệt đối KHÔNG có nút thêm nhanh Nhà Cung Cấp, Khách Hàng, Model mới, Loại hàng tại các tab Nhập kho / Xuất kho.
- Mọi thông tin danh mục ĐỀU PHẢI ĐƯỢC TẠO VÀ QUẢN LÝ TẬP TRUNG TẠI **DANH MỤC HỆ THỐNG**.

### 3. Sắp Xếp Danh Mục
- Toàn bộ các bảng trong Danh Mục Hệ Thống (Sản phẩm, Khách hàng, NCC, Kho, Loại hàng,...) luôn được sắp xếp theo thứ tự **từ mới nhất đến cũ nhất**.

### 4. Đồng Bộ Dữ Liệu Toàn Diện (Cascade Synchronization)
- Tuân thủ nghiêm ngặt tài liệu `NGUYEN_TAC_DONG_BO_DU_LIEU.md`.
- Sửa/Xóa/Xuất/Nhập ở một vị trí thì toàn bộ hệ thống (RAM, LocalStorage, Google Sheets, Phiếu, Lịch sử, Serial 360) phải đồng bộ 100%.

### 5. Quy Trình Đóng Gói & Triển Khai
- Sau khi sửa code, luôn chạy test kiểm tra cú pháp và backtest các ca nghiệp vụ.
- Chạy script `build_demo.ps1` và `build_gas_index.ps1` để cập nhật đồng bộ các file HTML.
- Đẩy code lên Google Apps Script (`clasp push -f`) và commit/push lên GitHub (`main` và `master`).
