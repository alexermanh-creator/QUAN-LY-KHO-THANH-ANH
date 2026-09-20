# 💬 BỘ MẪU CÂU LỆNH (PROMPT TEMPLATES) KHI YÊU CẦU AI SỬA ĐỔI HỆ THỐNG
> **Dự án: THÀNH AN ERP v4.0**  
> *Dành cho Quản trị viên khi cần nâng cấp, sửa lỗi hoặc tinh chỉnh hệ thống*

---

## 📌 LƯU Ý QUY TRÌNH 2 BƯỚC:
1. **Bước 1**: Copy một trong các mẫu câu lệnh bên dưới, điền nội dung bạn muốn sửa rồi dán vào khung chat với AI.
2. **Bước 2**: Sau khi AI báo *"Đã sửa xong"*, bạn ra thư mục máy tính và nhấp đúp file:  
   👉 **`2_DAY_19_FILE_LEN_GOOGLE_SHEETS.bat`** (3 giây là hệ thống tự cập nhật lên mạng!).

---

### 🌟 MẪU 1: TỔNG QUÁT (DÙNG CHO MỌI YÊU CẦU)
```text
Tôi đang back-test hệ thống Thành An ERP v4.0 và cần sửa điểm sau:
- Vị trí cần sửa: [Ví dụ: Tab Nhập kho / Dashboard / Xuất kho / Cài đặt]
- Hiện trạng: [Mô tả hiện tại đang hiển thị hoặc hoạt động thế nào]
- Mong muốn: [Mô tả chi tiết bạn muốn thay đổi ra sao]
Hãy kiểm tra code trong thư mục gas/, thực hiện sửa đổi và đồng bộ giúp tôi.
```

---

### 🎨 MẪU 2: SỬA GIAO DIỆN / BỐ CỤC / MÀU SẮC
```text
Tôi muốn điều chỉnh giao diện ở Tab [Tên Tab, ví dụ: Quản lý Tồn kho]:
- Yêu cầu cụ thể: [Ví dụ: Đổi màu nút bấm, chỉnh lại độ rộng cột bảng, sắp xếp lại các ô nhập liệu...]
- Đảm bảo giữ nguyên các hiệu ứng responsive trên điện thoại di động.
Hãy sửa trực tiếp trong gas/Index.html giúp tôi.
```

---

### 📝 MẪU 3: THÊM HOẶC BỚT TRƯỜNG THÔNG TIN (Ô NHẬP LIỆU / CỘT DỮ LIỆU)
```text
Tôi muốn thêm một trường thông tin mới vào phiếu [Nhập kho / Xuất kho / Thông tin khách hàng]:
- Tên trường mới: [Ví dụ: "Số Seri Thùng", "Người giao hàng", "Thời hạn thanh toán"...]
- Loại dữ liệu: [Chữ / Số / Ngày tháng / Danh sách chọn]
- Vị trí: [Nằm ở form nhập và lưu vào cột mới trong Google Sheet]
Hãy cập nhật cả giao diện (Index.html), backend xử lý và bảng dữ liệu tương ứng.
```

---

### ⚙️ MẪU 4: ĐIỀU CHỈNH LOGIC NGHIỆP VỤ / TÍNH TOÁN
```text
Tôi cần điều chỉnh logic tính toán ở phân hệ [Tên phân hệ, ví dụ: Tính Tuổi tồn kho / Cảnh báo tồn]:
- Quy tắc hiện tại: [Ví dụ: Đang tính tồn lâu là > 60 ngày]
- Quy tắc mới mong muốn: [Ví dụ: Đổi thành > 90 ngày mới báo đỏ, và bổ sung thêm mức 45-90 ngày]
Hãy cập nhật lại hàm tính toán trong thư mục gas/ giúp tôi.
```

---

### 🐛 MẪU 5: SỬA LỖI HỆ THỐNG (KHI GẶP BÁO ĐỎ / KHÔNG LƯU ĐƯỢC)
```text
Tôi gặp lỗi khi thực hiện thao tác sau:
- Bước thực hiện: [Ví dụ: Bấm nút "Lưu Phiếu Xuất" sau khi đã chọn 2 máy Canon]
- Thông báo lỗi hiển thị: [Gõ nội dung lỗi hoặc chụp ảnh gửi lên]
- Kết quả không mong muốn: [Ví dụ: Dữ liệu chưa ghi vào Google Sheet]
Hãy tìm nguyên nhân gốc (root cause), sửa triệt để và test lại giúp tôi.
```

---

### 📊 MẪU 6: BỔ SUNG BÁO CÁO / BIỂU ĐỒ MỚI
```text
Tôi muốn thêm một biểu đồ / bảng báo cáo mới vào Tab [Dashboard / Báo cáo]:
- Tên báo cáo: [Ví dụ: Top 5 Khách hàng mua nhiều nhất / Thống kê tồn theo loại hàng...]
- Dạng hiển thị: [Biểu đồ cột / Biểu đồ tròn / Bảng tổng hợp số liệu]
- Nguồn dữ liệu lấy từ: [Bảng xuất kho / Bảng Serial Master...]
Hãy cập nhật cả logic tổng hợp số liệu và vẽ biểu đồ lên giao diện giúp tôi.
```
