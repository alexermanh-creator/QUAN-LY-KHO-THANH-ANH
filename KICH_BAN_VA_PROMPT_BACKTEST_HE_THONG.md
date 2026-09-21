# 🎯 KỊCH BẢN & PROMPT BACK-TEST TOÀN DIỆN HỆ THỐNG QUẢN LÝ KHO THÀNH AN

Tài liệu này cung cấp **kịch bản kiểm thử (Test Cases)** và **Prompt chuẩn hóa** để Quản lý, Kỹ thuật viên hoặc AI có thể kiểm tra (back-test) đối soát 100% tính năng và luồng dữ liệu của hệ thống.

---

## 📌 PHẦN 1: PROMPT SẴN SÀNG DÙNG ĐỂ CHẠY BACK-TEST (COPY & PASTE)

> **Hướng dẫn sử dụng:** Bạn có thể copy toàn bộ đoạn khung dưới đây gửi cho trợ lý AI hoặc người kiểm thử độc lập để rà soát hệ thống:

```text
Bạn là chuyên gia kiểm thử phần mềm (QA/QC Lead). Hãy thực hiện kịch bản Back-test toàn diện hệ thống "Quản Lý Kho Thành An" dựa trên các tiêu chí sau và báo cáo kết quả chi tiết từng phần:

1. KIỂM TRA DASHBOARD & CHUYỂN HƯỚNG:
- Số liệu KPI (Tổng tồn, Nhập kỳ này, Xuất kỳ này, Biến động tồn) có khớp với dữ liệu kho không?
- Biểu đồ biến động: Cột Nhập (xanh lá), Cột Xuất (cam) và Đường Tồn kho lũy kế (xanh dương đè lên trên) có hiển thị chính xác không?
- Trong bảng "Hoạt động gần đây", click vào 1 dòng bất kỳ: Có chuyển hướng chính xác đến tab "Lịch Sử & Audit" và lọc đúng phiếu đó không (không được nhảy sang tạo phiếu mới)?

2. KIỂM TRA NHẬP KHO & TỰ SINH SERIAL:
- Tạo phiếu nhập mới gồm 2 thiết bị (1 máy gõ tay, 1 máy test quét súng/mã vạch).
- Kiểm tra tính năng Lưu nháp và Xác nhận nhập kho. Số tồn kho có tăng lên tương ứng không?

3. KIỂM TRA XUẤT KHO & CHẶN XUẤT KHỐNG:
- Thử xuất 1 serial không tồn tại hoặc đã xuất rồi -> Hệ thống có chặn và báo lỗi cảnh báo màu đỏ không?
- Xuất 1 serial đang có sẵn trong kho, chọn gói bảo hành (12 tháng hoặc 24 tháng).
- Xác nhận xuất kho và kiểm tra hạn bảo hành tự động tính toán (Ngày xuất + số tháng).

4. KIỂM TRA SỬA PHIẾU FULL TRƯỜNG THÔNG TIN:
- Mở danh sách Lịch sử -> Bấm nút "Sửa phiếu" trên một phiếu Nhập hoặc Xuất.
- Modal sửa có cho phép sửa toàn bộ trường Header (Kho, Nhà cung cấp/Khách hàng, SĐT, Ngày, Ghi chú) không?
- Bảng thiết bị bên dưới có cho phép sửa từng dòng: Serial, Model, Loại hàng, Gói bảo hành, Ngày hết hạn bảo hành không? Có cho phép thêm dòng hoặc xóa dòng không?
- Nếu không nhập "Lý do chỉnh sửa" thì hệ thống có chặn không?
- Sau khi bấm Lưu, phiếu có cập nhật đầy đủ và số tồn kho/bảo hành có được cập nhật lại chính xác không?

5. KIỂM TRA NHẬT KÝ KIỂM TOÁN (AUDIT TRAIL):
- Mở tab "Lịch Sử & Audit" -> Chọn "Nhật Ký Kiểm Toán (Audit Trail)".
- Thao tác sửa phiếu vừa thực hiện có được ghi nhận chi tiết: Người sửa, Thời gian, Hành động, Before -> After của từng trường và Lý do giải trình không?
- Kiểm tra Google Sheet sheet "NHAT_KY_HOAT_DONG" xem có dòng ghi nhận tương ứng không?

6. KIỂM TRA HỒ SƠ SERIAL 360°:
- Tra cứu 1 serial vừa xuất (hoặc mã mẫu CNB1T5GC6X).
- Kiểm tra toàn bộ các trường: Mã nội bộ, Tên thiết bị, Nhóm hàng, Kho, Ngày nhập, Ngày xuất, Hạn BH. Có xuất hiện chữ "undefined" nào không?
- Dòng thời gian luân chuyển (Timeline) có hiển thị đủ từ lúc Nhập -> Xuất -> Sửa đổi không?

7. KIỂM TRA TÍNH NĂNG MÁY QUÉT BARCODE:
- Súng quét USB/Bluetooth (tốc độ gõ <50ms) có tự động nhận diện trực tiếp vào bảng mà không cần click chuột không?
- Mở popup "Quét Điện Thoại / Camera Ngoài" -> Mã QR kết nối có hiển thị không? Thử quét và kiểm tra xem mã có đồng bộ thời gian thực về màn hình làm việc không?

Hãy tổng kết bằng bảng: [Tên chức năng | Trạng thái (PASS/FAIL) | Chi tiết nhận xét | Đánh giá rủi ro].
```

---

## 📋 PHẦN 2: BẢNG KỊCH BẢN BACK-TEST CHI TIẾT (STEP-BY-STEP CHECKLIST)

### Test Case 1: Dashboard & Điều Hướng Nhanh
| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| 1.1 | Mở trang chủ Dashboard | 4 thẻ KPI hiển thị số liệu thực tế, không bị NaN hoặc 0 bất thường. Thẻ "Biến động tồn" hiển thị đúng chênh lệch (Nhập - Xuất). | [ ] PASS |
| 1.2 | Xem biểu đồ cột & đường | Cột Nhập màu xanh lá, cột Xuất màu cam. Đường biến động Tồn kho màu xanh dương (`#2563eb`) nằm **nổi bật đè lên trên** các cột, có chấm tròn rõ ràng. | [ ] PASS |
| 1.3 | Click vào 1 dòng bất kỳ trong bảng **"Hoạt động gần đây"** | Màn hình lập tức chuyển sang tab **Lịch Sử & Audit**, chuyển đúng sub-tab (Nhập hoặc Xuất) và hiển thị đúng phiếu được chọn (KHÔNG mở form nhập mới). | [ ] PASS |

---

### Test Case 2: Nghiệp Vụ Nhập Kho & Nháp
| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| 2.1 | Vào tab **Nhập Kho**, chọn NCC, Kho nhập | Danh sách gợi ý Nhà cung cấp hiển thị đầy đủ, chọn được kho hàng. | [ ] PASS |
| 2.2 | Nhập Serial máy bằng bàn phím hoặc máy quét | Hệ thống tự động sinh Mã nội bộ (`NB-...`), nhận diện đúng Model và Gói bảo hành mặc định. | [ ] PASS |
| 2.3 | Bấm nút **"Lưu nháp"** | Phiếu được lưu vào hàng đợi nháp, có thể tải lại phiếu nháp khi cần. | [ ] PASS |
| 2.4 | Bấm **"Xác nhận nhập kho"** | Xuất hiện thông báo thành công, phiếu nhập được ghi vào Lịch sử và Tồn kho tăng thêm. | [ ] PASS |

---

### Test Case 3: Nghiệp Vụ Xuất Kho & Kiểm Soát Tồn Kho
| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| 3.1 | Vào tab **Xuất Kho**, nhập 1 Serial **không có trong kho** | Hệ thống hiển thị cảnh báo đỏ: *Thiết bị không tồn tại trong kho hoặc đã xuất bán*. Không cho xuất khống. | [ ] PASS |
| 3.2 | Nhập 1 Serial đang có sẵn trong kho | Hệ thống tự động điền Model, Tên hàng, Kho xuất và tính hạn bảo hành. | [ ] PASS |
| 3.3 | Thay đổi gói bảo hành (ví dụ: từ 12 tháng lên 24 tháng) | Hạn bảo hành tự động nhảy tương ứng = Ngày xuất + 24 tháng. | [ ] PASS |
| 3.4 | Bấm **"Xác nhận xuất kho"** | Thông báo xuất kho thành công, Serial chuyển trạng thái sang `SOLD` (Đã xuất). | [ ] PASS |

---

### Test Case 4: Chỉnh Sửa Phiếu FULL Trường (Cả Header & Từng Thiết Bị)
| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| 4.1 | Vào tab **Lịch Sử & Audit**, chọn 1 phiếu bất kỳ và bấm **"Sửa phiếu"** | Modal sửa phiếu mở rộng (`modal-xl`) hiển thị đầy đủ: Thông tin Header + Bảng chi tiết từng thiết bị. | [ ] PASS |
| 4.2 | Thử sửa Header (Kho, Nhà cung cấp / Khách hàng, SĐT, Ngày, Ghi chú) | Các trường đều cho phép chỉnh sửa nội dung dễ dàng. | [ ] PASS |
| 4.3 | Thử sửa dòng thiết bị (Sửa Serial, Model, Loại hàng, Gói bảo hành) | Cho phép sửa trực tiếp trên từng dòng thiết bị trong bảng. | [ ] PASS |
| 4.4 | Thử bấm nút **"Thêm thiết bị"** hoặc **"Xóa"** một dòng máy trong phiếu | Danh sách thiết bị tăng/giảm chính xác, giao diện mượt mà. | [ ] PASS |
| 4.5 | Thử bấm **"Lưu thay đổi"** khi để trống ô **Lý do chỉnh sửa** | Hệ thống chặn lại và thông báo yêu cầu bắt buộc nhập lý do giải trình. | [ ] PASS |
| 4.6 | Điền lý do (ví dụ: *"Khách đổi sang gói bảo hành 24 tháng"*) và bấm **Lưu** | Thông báo lưu thành công, hiển thị số trường đã thay đổi, dữ liệu phiếu cập nhật ngay lập tức. | [ ] PASS |

---

### Test Case 5: Nhật Ký Kiểm Toán (Audit Trail)
| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| 5.1 | Chuyển sang sub-tab **"Nhật Ký Kiểm Toán (Audit Trail)"** | Hiển thị ngay dòng ghi nhật ký của hành động sửa phiếu vừa thực hiện. | [ ] PASS |
| 5.2 | Kiểm tra chi tiết dòng nhật ký | Ghi rõ: Thời gian chính xác, Người thực hiện (`Quản Lý` hoặc tên tài khoản), Hành động (`SỬA PHIẾU ...`), Mục tiêu (Mã phiếu), và danh sách từng trường Before $\rightarrow$ After kèm Lý do giải trình. | [ ] PASS |
| 5.3 | Mở Google Sheet CSDL, vào sheet **`NHAT_KY_HOAT_DONG`** | Một dòng nhật ký mới tương ứng đã được chèn vào bảng dữ liệu trên Google Sheets. | [ ] PASS |

---

### Test Case 6: Hồ Sơ Thiết Bị Serial 360°
| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| 6.1 | Vào tab **Hồ Sơ Serial 360°**, nhập mã serial máy vừa xuất (hoặc `CNB1T5GC6X`) | Thẻ hồ sơ 360° nạp thông tin tức thì. | [ ] PASS |
| 6.2 | Rà soát toàn bộ các ô thông tin trên thẻ | **100% không còn chữ `undefined`**. Mã nội bộ, Tên hàng, Nhóm hàng, Mã phiếu nhập, Ngày nhập, Gói bảo hành đều hiển thị rõ ràng. | [ ] PASS |
| 6.3 | Xem dòng thời gian (Timeline) | Hiển thị rõ: Ngày giờ Nhập kho từ ai $\rightarrow$ Ngày giờ Xuất kho cho ai $\rightarrow$ Lịch sử sửa đổi nếu có. | [ ] PASS |

---

### Test Case 7: Thiết Bị Quét (Súng Quét Barcode & Camera Điện Thoại)
| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| 7.1 | Cắm súng quét barcode USB vào máy tính, bấm quét thử 1 mã bất kỳ | Không cần click chuột vào ô nhập liệu, súng quét gửi mã (<50ms) hệ thống tự động nhận diện và nạp mã. | [ ] PASS |
| 7.2 | Bấm nút **"Quét Điện Thoại / Camera Ngoài"** | Mở cửa sổ quét độc lập hoặc hiển thị mã QR. Quét mã QR bằng điện thoại để mở camera sau quét mã vạch và tự động truyền mã về màn hình máy tính. | [ ] PASS |

---

## 💡 ĐÁNH GIÁ CHUNG SAU KHI BACK-TEST
* **Số Test Cases đạt (PASS)**: `___ / 7`
* **Số Test Cases cần lưu ý**: `___ / 7`
* **Người kiểm thử**: `_________________________`
* **Thời gian hoàn thành**: `___:___ - Ngày ___/___/2026`
