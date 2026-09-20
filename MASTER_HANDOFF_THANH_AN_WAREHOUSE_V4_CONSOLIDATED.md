# MASTER HANDOFF – THANH AN ERP / QUẢN LÝ KHO V4
**Tài liệu duy nhất dùng để bàn giao cho Antigravity (ANTI)**  
**Trạng thái:** Blueprint/thiết kế nghiệp vụ đã chốt – ANTI cần audit source V3 hiện tại trước khi triển khai  
**Nền tảng hiện hành:** Google Sheets + Google Apps Script  
**Nguyên tắc kiến trúc:** Serial Number là trung tâm dữ liệu

---

# 1. MỤC ĐÍCH

File này thay thế vai trò của các tài liệu rời trước đây như:

- `README_START_HERE.md`
- `PROJECT_OVERVIEW.md`
- `MASTER_HANDOFF.md`
- `THANH_AN_ERP_V4_BLUEPRINT.md`
- `ROADMAP.md`
- `AGENTS.md`
- `ANTI_START_PROMPT.md`
- `docs/DECISION_TRACE.md`
- `docs/IMPLEMENTATION_NOTES.md`
- `docs/MIGRATION_V3_TO_V4.md`
- `docs/TEST_PLAN.md`
- `docs/V3_CODE_RECONCILIATION.md`

Mục tiêu là để ANTI chỉ cần đọc **một file này + source code thực tế** là có thể hiểu đúng dự án và tiếp tục phát triển.

`Quan ly kho.txt` của V3 chỉ là **reference/source cũ**, không phải đặc tả hiện hành.

---

# 2. BỐI CẢNH DOANH NGHIỆP

Công ty Thành An kinh doanh:

- Máy tính
- Laptop
- Máy in
- Máy photocopy
- Máy scan
- Máy chủ
- Thiết bị và phụ kiện máy văn phòng

Đặc thù quan trọng:

1. Phần lớn thiết bị giá trị cao có Serial Number.
2. Cần biết chính xác từng Serial đang ở đâu và trạng thái gì.
3. Một sản phẩm có thể có nhiều Serial.
4. Cần truy ngược nguồn gốc thiết bị từ lúc nhập đến khi xuất và bảo hành.
5. Công ty quy mô nhỏ nên hệ thống phải đơn giản, nhanh và ít thao tác.
6. Người dùng không nên phải sửa dữ liệu trực tiếp trong Google Sheet để xử lý nghiệp vụ thông thường.

---

# 3. PHẠM VI V4 ĐÃ CHỐT

V4 tập trung vào **quản trị kho và vòng đời thiết bị**.

Bao gồm:

1. Danh mục hàng hóa
2. Hãng / nhóm hàng / model
3. Nhà cung cấp
4. Khách hàng
5. Kho
6. Nhập kho
7. Xuất kho
8. Tồn kho
9. Serial Number
10. Serial 360°
11. Sửa phiếu
12. Hủy phiếu
13. Hoàn nhập
14. Trả nhà cung cấp
15. Chuyển kho
16. Kiểm kê
17. Bảo hành
18. Dashboard vận hành
19. Nhật ký hệ thống
20. Kiểm soát dữ liệu và cảnh báo

---

# 4. NHỮNG PHẦN KHÔNG LÀM TRONG V4

Không mở rộng sang:

- Kế toán
- Giá nhập
- Giá bán
- Lợi nhuận
- Công nợ
- Doanh thu
- Thu chi
- Hóa đơn
- In/PDF chứng từ
- CRM đầy đủ
- Quản lý sale/doanh số
- ERP tài chính tổng thể

Các phần này có thể phát triển sau khi hệ thống kho V4 ổn định.

ANTI không được tự ý mở rộng sang các module trên.

---

# 5. NGUYÊN TẮC KIẾN TRÚC CHÍNH

## 5.1. Serial Number là trung tâm

Mỗi Serial phải có một hồ sơ xuyên suốt vòng đời:

**Nhập kho → tồn kho → xuất kho → khách hàng → bảo hành/đổi trả → trạng thái hiện tại**

Hệ thống phải trả lời được ngay:

- Serial này là sản phẩm nào?
- Nhập ngày nào?
- Nhập từ nhà cung cấp nào?
- Thuộc phiếu nhập nào?
- Hiện đang ở kho nào?
- Đã xuất chưa?
- Xuất ngày nào?
- Xuất cho khách hàng nào?
- Thuộc phiếu xuất nào?
- Bảo hành còn hay hết?
- Đã bảo hành bao nhiêu lần?
- Hiện thiết bị đang ở đâu?
- Có từng hoàn nhập, trả NCC, chuyển kho hay không?

Không được chỉ quản lý số lượng mà mất dấu Serial.

---

## 5.2. Phiếu dùng mô hình Header + Detail

Mọi chứng từ nhiều mặt hàng phải dùng:

### Header
- ID / số phiếu
- Ngày
- Loại phiếu
- Nhà cung cấp / khách hàng
- Kho
- Người tạo
- Trạng thái
- Ghi chú
- CreatedAt / UpdatedAt

### Detail
- ID dòng
- ID phiếu
- Mã hàng
- Model
- Số lượng
- Serial (nếu quản lý SN)
- Ghi chú dòng

Mục tiêu:

- Không lặp dữ liệu Header ở mỗi dòng.
- Dễ sửa/hủy.
- Dễ audit.
- Dễ mở rộng.
- Dễ migration và kiểm tra tính toàn vẹn.

---

## 5.3. Không hard-delete nghiệp vụ

Không xóa vật lý dữ liệu chứng từ đã phát sinh.

Ưu tiên:

- ACTIVE
- CANCELLED
- ARCHIVED

Việc hủy phải tạo dấu vết và hoàn tác đúng ảnh hưởng đến tồn/Serial.

---

## 5.4. Audit/History bắt buộc

Các hành động quan trọng phải ghi log:

- Tạo
- Sửa
- Hủy
- Nhập
- Xuất
- Hoàn nhập
- Trả NCC
- Chuyển kho
- Kiểm kê
- Bảo hành
- Đổi trạng thái Serial

Log tối thiểu:

- Thời gian
- Người thực hiện
- Hành động
- Đối tượng
- ID đối tượng
- Dữ liệu trước
- Dữ liệu sau
- Lý do nếu có

---

# 6. DANH MỤC SẢN PHẨM

Một sản phẩm/model cần tối thiểu:

- ProductID
- Mã hàng
- Tên hàng
- Hãng
- Model
- Nhóm hàng
- Đơn vị tính
- Có quản lý Serial hay không
- Số tháng bảo hành mặc định
- Trạng thái sử dụng
- Ghi chú

## Quy tắc tìm Model

- Bộ lọc Model: ưu tiên **khớp chính xác**.
- Ô tìm kiếm chung: có thể dùng **contains/fuzzy**.

Không dùng logic contains cho bộ lọc chính xác nếu dễ gây nhầm model gần giống.

---

# 7. SERIAL MASTER

Serial là bảng lõi.

Mỗi Serial phải có khóa duy nhất và tối thiểu các trường:

- SerialID
- SerialNumber
- ProductID
- Mã hàng
- Model
- WarehouseID / vị trí hiện tại
- CurrentStatus
- ImportReceiptID
- ImportDate
- SupplierID
- ExportReceiptID
- ExportDate
- CustomerID
- WarrantyStart
- WarrantyEnd
- CreatedAt
- UpdatedAt
- Ghi chú

Không được có hai SerialNumber đang cùng đại diện cho một thiết bị vật lý.

---

# 8. TRẠNG THÁI SERIAL

ANTI có thể chuẩn hóa enum kỹ thuật, nhưng ý nghĩa nghiệp vụ phải giữ nguyên.

Đề xuất:

- `IN_STOCK` – đang trong kho
- `SOLD` – đã xuất cho khách hàng
- `WARRANTY` – đang tiếp nhận bảo hành
- `WARRANTY_VENDOR` – đang gửi NCC/hãng bảo hành
- `WARRANTY_RETURNED` – đã xử lý xong / trả khách
- `RETURNED_FROM_CUSTOMER` – khách trả lại
- `RETURNED_TO_VENDOR` – trả nhà cung cấp
- `TRANSFER` – đang chuyển kho
- `DAMAGED` – hỏng/lỗi
- `LOST` – thất lạc
- `OTHER` – trạng thái đặc biệt khác

## Quy tắc bất biến

Một Serial không được đồng thời:

- vừa `IN_STOCK` vừa `SOLD`
- vừa nằm ở hai kho
- vừa xuất cho hai khách hàng
- vừa bị hủy phiếu nguồn nhưng vẫn tồn tại trạng thái phát sinh từ phiếu đó

---

# 9. NHẬP KHO

Luồng chuẩn:

**Tạo phiếu → chọn NCC → chọn hàng → nhập số lượng → nhập/dán Serial → validate → lưu phiếu → cập nhật tồn → cập nhật Serial**

## Validation bắt buộc

- Serial không được trùng.
- Số lượng Serial phải khớp số lượng đối với hàng có quản lý Serial.
- Hàng không quản lý Serial chỉ quản lý số lượng.
- Phiếu không hợp lệ không được cập nhật một phần.
- Không được lưu double-submit.
- Không được tạo dữ liệu nửa chừng khi một bước lỗi.

## Kết quả

Serial mới hợp lệ chuyển thành:

`IN_STOCK`

---

# 10. XUẤT KHO

Luồng:

**Tạo phiếu → chọn khách hàng → chọn hàng → chọn Serial đang tồn → validate → xác nhận → cập nhật tồn → cập nhật Serial**

## Quy tắc

Chỉ Serial `IN_STOCK` mới được xuất.

Không cho:

- xuất Serial đã SOLD
- xuất Serial đang bảo hành
- xuất Serial đã trả NCC
- xuất Serial không tồn tại
- tạo tồn âm
- xuất cùng Serial hai lần do double-submit

Khi xuất thành công:

`IN_STOCK → SOLD`

Phải lưu:

- khách hàng
- ngày xuất
- phiếu xuất
- người thực hiện

---

# 11. SỬA VÀ HỦY PHIẾU

Đây là nghiệp vụ bắt buộc của V4.

Không xử lý bằng cách sửa trực tiếp dữ liệu Sheet.

## Khi sửa phiếu

1. Đọc bản hiện tại.
2. Kiểm tra các nghiệp vụ phát sinh sau đó.
3. Hoàn tác ảnh hưởng cũ.
4. Áp dụng dữ liệu mới.
5. Validate lại.
6. Cập nhật tồn/Serial.
7. Ghi audit log.

## Khi hủy phiếu

Ví dụ hủy phiếu xuất:

`SOLD → IN_STOCK`

Nhưng chỉ được hủy nếu không làm hỏng chuỗi nghiệp vụ sau đó.

Ví dụ: nếu Serial đã phát sinh bảo hành sau khi xuất thì hệ thống phải chặn hủy hoặc yêu cầu xử lý nghiệp vụ sau trước.

---

# 12. HOÀN NHẬP

Dùng khi:

- xuất nhầm
- khách không nhận hàng
- giao hàng thất bại
- giao dịch bị hủy sau khi xuất

Không dùng chỉnh sửa thủ công.

Luồng:

**Phiếu xuất gốc → hoàn nhập → Serial về kho**

Thông thường:

`SOLD → IN_STOCK`

Phải lưu:

- phiếu xuất gốc
- ngày hoàn nhập
- lý do
- người thực hiện
- kho nhận lại

---

# 13. TRẢ NHÀ CUNG CẤP

Dùng khi:

- hàng lỗi
- giao sai
- đổi hàng
- trả hàng sau nhập

Trạng thái:

`IN_STOCK → RETURNED_TO_VENDOR`

Phải lưu:

- Serial
- NCC
- phiếu nhập gốc
- ngày trả
- lý do
- người thực hiện

---

# 14. CHUYỂN KHO

Nếu có nhiều kho:

**Kho A → phiếu chuyển → Kho B**

Không coi là bán hàng.

Serial vẫn thuộc công ty.

Phải lưu:

- kho nguồn
- kho đích
- thời gian
- người chuyển
- người nhận/xác nhận nếu cần

Trong quá trình chuyển có thể dùng trạng thái `TRANSFER`.

---

# 15. KIỂM KÊ

Luồng:

**Tạo phiên kiểm kê → chọn kho → hệ thống chốt danh sách dự kiến → đối chiếu thực tế → ghi chênh lệch → xác nhận xử lý**

Phải phân biệt:

- Đủ
- Thiếu
- Thừa
- Sai Serial
- Sai vị trí

Không tự động sửa tồn chỉ vì nhập kết quả kiểm kê.

Mọi điều chỉnh phải được xác nhận và ghi log.

---

# 16. BẢO HÀNH

Bảo hành quản lý **theo từng Serial**, không chỉ theo Model.

Mỗi lần bảo hành là một case độc lập.

Thông tin tối thiểu:

- WarrantyCaseID
- Serial
- Product/Model
- Khách hàng
- Ngày nhận
- Tình trạng/lỗi khách báo
- Kết quả kiểm tra
- Phương án xử lý
- NCC/hãng nhận xử lý
- Ngày gửi
- Ngày nhận lại
- Ngày trả khách
- Kết quả cuối
- Trạng thái
- Ghi chú

## Luồng điển hình

**Tiếp nhận → kiểm tra → tự xử lý hoặc gửi NCC/hãng → nhận lại → trả khách → đóng case**

Timeline bảo hành phải hiện trong Serial 360°.

---

# 17. SERIAL 360°

Đây là màn hình quan trọng nhất của V4.

Khi tìm một Serial phải xem được trên một màn hình:

## Thiết bị
- Serial
- Mã hàng
- Model
- Hãng

## Nguồn gốc
- Phiếu nhập
- Ngày nhập
- Nhà cung cấp

## Hiện trạng
- Trạng thái
- Kho/vị trí hiện tại

## Xuất bán
- Phiếu xuất
- Ngày xuất
- Khách hàng

## Bảo hành
- Bắt đầu
- Hết hạn
- Còn/hết hạn
- Các case đã phát sinh

## Timeline
Ví dụ:

- 10/09 – nhập kho
- 15/09 – xuất khách A
- 22/10 – tiếp nhận bảo hành
- 23/10 – gửi NCC
- 30/10 – nhận lại
- 31/10 – trả khách

Serial 360° là “hồ sơ thiết bị” chứ không phải chỉ một dòng dữ liệu.

---

# 18. TỒN KHO

Phải xem được hai lớp.

## Theo sản phẩm

Ví dụ:

`Canon LBP246DW II – 5`

## Theo Serial

- SN001
- SN002
- SN003
- SN004
- SN005

Bộ lọc:

- Hãng
- Nhóm
- Mã hàng
- Model
- Kho
- Trạng thái
- Serial

Không dựa duy nhất vào một ô “số lượng tồn” nếu dữ liệu Serial có thể tự tính được.

---

# 19. TÌM KIẾM TOÀN HỆ THỐNG

Ô tìm kiếm chung nên hỗ trợ:

- Serial
- Mã hàng
- Model
- Tên hàng
- Khách hàng
- Nhà cung cấp
- Số phiếu

Ưu tiên tìm Serial nhanh nhất.

---

# 20. DASHBOARD

Dashboard là màn hình vận hành, không phải kế toán.

## Tổng quan

- Tổng mã hàng
- Tổng thiết bị tồn
- Tổng Serial trong kho
- Phiếu nhập trong kỳ
- Phiếu xuất trong kỳ
- Bảo hành đang xử lý

## Cảnh báo

- Serial/dữ liệu bất thường
- Phiếu lỗi/chưa hoàn tất
- Hàng tồn lâu
- Bảo hành sắp hết
- Sai lệch kiểm kê
- Serial thiếu liên kết chứng từ

---

# 21. QUY TẮC AN TOÀN KHI GHI DỮ LIỆU

Vì hệ thống chạy Google Apps Script/Sheets:

1. Validate ở phía server.
2. Không tin dữ liệu chỉ vì UI đã kiểm tra.
3. Dùng cơ chế khóa khi ghi dữ liệu quan trọng (`LockService` hoặc tương đương).
4. Chống double-submit.
5. Chống ghi một nửa giao dịch.
6. Nếu cập nhật nhiều bảng, phải coi đó là một nghiệp vụ logic thống nhất.
7. Có thông báo lỗi dễ hiểu cho người dùng.
8. Không để người dùng tạo dữ liệu trùng do bấm nút nhiều lần.

---

# 22. MÔI TRƯỜNG DEV / BACKUP / PROD

Phải tách rõ:

- `PROD` – hệ thống đang sử dụng
- `DEV` – bản phát triển
- `BACKUP` – snapshot trước migration/thay đổi lớn

Không thử migration trực tiếp trên PROD.

Trước thay đổi lớn:

1. Backup Sheet.
2. Backup Apps Script/source.
3. Ghi lại cấu trúc hiện tại.
4. Test trên DEV.
5. Có phương án rollback.

---

# 23. V3 HIỆN TẠI – NHỮNG GÌ CẦN BẢO TOÀN

Source V3 (`Quan ly kho.txt`) là code Google Apps Script/HTML đang có các thành phần:

- quản lý model/sản phẩm
- kho
- nhà cung cấp
- khách hàng
- cấu hình doanh nghiệp
- tài khoản/người dùng
- nhật ký hoạt động
- nhập hàng
- lịch sử nhập
- dữ liệu thiết bị/Serial
- thông tin bảo hành theo Serial/khách hàng

Các chi tiết đang tồn tại trong V3 cần được ANTI đối chiếu trước migration:

- trạng thái tồn kho cũ dùng chuỗi `"Tồn kho"`
- có tính `soNgayLuuKho`
- có kiểm tra chống trùng Serial
- có cảnh báo bảo hành khoảng 30 ngày
- có cảnh báo tồn kho lâu khoảng 60 ngày
- tiền tố Serial mặc định từng dùng `TA-`
- lịch sử nhập từng được ghi ở `LICH_SU_NHAP`
- dữ liệu tồn/thiết bị từng đọc từ `DATA_THIET_BI`

## Nguyên tắc migration

Không bê nguyên cấu trúc V3 sang V4.

Phải:

1. Hiểu V3.
2. Mapping dữ liệu sang V4.
3. Giữ dữ liệu lịch sử.
4. Không mất Serial.
5. Không thay đổi ý nghĩa chứng từ cũ.
6. Giữ các nghiệp vụ cũ đang chạy tốt nếu không xung đột V4.
7. Chuẩn hóa trạng thái cũ sang enum V4.
8. Tạo báo cáo đối chiếu trước/sau migration.

---

# 24. V3 → V4: NHỮNG THAY ĐỔI CỐT LÕI

| V3 | V4 |
|---|---|
| Logic dữ liệu có thể phân tán | Serial Master là trung tâm |
| Một số trạng thái dạng text tự do | Trạng thái chuẩn hóa |
| Chứng từ có thể chưa tách chuẩn | Header + Detail |
| Sửa dữ liệu có thể phụ thuộc Sheet | Sửa/hủy qua nghiệp vụ |
| Theo dõi bảo hành có sẵn một phần | Warranty Case đầy đủ |
| Tồn + Serial có sẵn | Tồn được kiểm soát từ lifecycle Serial |
| Audit có một phần | Audit bắt buộc cho nghiệp vụ quan trọng |
| Chức năng rời | Serial 360° gom vòng đời thiết bị |
| Chưa chuẩn hóa rollback | DEV/BACKUP/PROD + rollback |

---

# 25. ROADMAP CHÍNH THỨC – 10 PHASE

## PHASE 0 – SAFETY / BACKUP / DEV

Mục tiêu:

- Đọc toàn bộ source V3.
- Xác định Google Sheet/tab hiện tại.
- Backup.
- Tạo DEV.
- Mapping dependency.
- Không tác động PROD.

**Không được bỏ qua Phase 0.**

---

## PHASE 1 – DATA MODEL & MIGRATION

Mục tiêu:

- Serial Master.
- Header/Detail.
- Status chuẩn.
- ID chuẩn.
- Audit structure.
- Mapping V3→V4.
- Migration dữ liệu mẫu.
- Reconciliation.

---

## PHASE 2 – DANH MỤC

- Sản phẩm
- Hãng
- Nhóm
- Model
- NCC
- Khách hàng
- Kho
- Cấu hình liên quan

---

## PHASE 3 – NHẬP KHO

- Phiếu nhập
- Detail
- Serial
- Validation
- Chống trùng
- Sửa
- Hủy
- Rollback

---

## PHASE 4 – XUẤT KHO

- Phiếu xuất
- Chọn Serial
- Khách hàng
- Validation
- Không tồn âm
- Sửa
- Hủy
- Rollback

---

## PHASE 5 – TỒN KHO

- Tồn sản phẩm
- Tồn Serial
- Bộ lọc
- Tìm kiếm
- Cảnh báo
- Reconciliation

---

## PHASE 6 – SERIAL 360°

- Hồ sơ Serial
- Nguồn gốc
- Timeline
- Khách hàng
- Phiếu nhập/xuất
- Warranty history
- Current status

---

## PHASE 7 – OPERATIONS

- Hoàn nhập
- Trả NCC
- Chuyển kho
- Kiểm kê
- Điều chỉnh có kiểm soát

---

## PHASE 8 – BẢO HÀNH

- Warranty Case
- Workflow
- NCC/hãng
- Nhận/trả
- Timeline
- Trạng thái
- Lịch sử theo Serial

---

## PHASE 9 – DASHBOARD + HARDENING

- Dashboard
- Cảnh báo
- Audit
- Validation toàn hệ thống
- Tối ưu tốc độ
- UI cleanup
- Permission nếu cần
- Backup/recovery
- Full test

---

# 26. QUY TẮC THỰC HIỆN THEO PHASE

Mỗi Phase phải:

1. Xác định phạm vi.
2. Kiểm tra code liên quan trước khi sửa.
3. Không sửa ngoài phạm vi nếu không cần thiết.
4. Triển khai trên DEV.
5. Test.
6. Đối chiếu dữ liệu.
7. Ghi lại thay đổi.
8. Commit/version rõ ràng nếu repo có Git.
9. Báo kết quả.
10. Chỉ sang Phase tiếp theo khi Phase hiện tại đạt tiêu chí nghiệm thu.

Không thực hiện nhiều Phase lớn cùng lúc nếu chưa kiểm tra Phase trước.

---

# 27. TEST PLAN TỐI THIỂU

ANTI phải test ít nhất:

## Serial
- nhập Serial mới
- Serial trùng
- Serial rỗng
- Serial không tồn tại
- Serial đã xuất
- Serial đang bảo hành

## Nhập
- một sản phẩm
- nhiều sản phẩm
- nhiều Serial
- số lượng SN không khớp
- double-submit
- hủy phiếu nhập
- sửa phiếu nhập

## Xuất
- xuất Serial hợp lệ
- xuất Serial không tồn
- xuất Serial đã bán
- xuất quá tồn
- double-submit
- sửa phiếu xuất
- hủy phiếu xuất

## Hoàn nhập
- hoàn nhập hợp lệ
- hoàn nhập phiếu đã hủy
- hoàn nhập Serial có nghiệp vụ sau

## Bảo hành
- còn hạn
- hết hạn
- nhiều lần bảo hành cùng Serial
- gửi NCC
- nhận lại
- trả khách

## Kiểm kê
- đủ
- thiếu
- thừa
- sai Serial

## Migration
- tổng số Serial trước/sau
- số Serial tồn
- số Serial đã xuất
- linkage phiếu nhập
- linkage phiếu xuất
- lịch sử bảo hành
- dữ liệu lỗi

---

# 28. TIÊU CHÍ NGHIỆM THU

Một Phase chỉ hoàn thành khi:

- Không phá chức năng cũ đang dùng.
- Không mất Serial.
- Không tạo Serial trùng.
- Không tạo tồn âm sai.
- Sửa/hủy hoàn tác đúng.
- Không double-submit.
- Validation phía server hoạt động.
- Dữ liệu trước/sau đối chiếu được.
- Log đúng.
- UI báo lỗi rõ.
- Test case chính đã chạy.
- Không có lỗi nghiêm trọng chưa giải thích.

---

# 29. NGUYÊN TẮC GIAO DIỆN

Người dùng chính không phải lập trình viên.

UI cần:

- ít bước
- nút rõ
- tiếng Việt dễ hiểu
- hạn chế popup dư thừa
- tìm Serial nhanh
- không bắt nhập lại dữ liệu đã có
- chọn dữ liệu từ danh mục thay vì gõ tự do nếu có thể
- xác nhận thao tác nguy hiểm
- thông báo lỗi chỉ rõ phải sửa gì

Ưu tiên:

**Đúng dữ liệu → dễ dùng → nhanh → đẹp**

Không đảo thứ tự này.

---

# 30. NHỮNG ĐIỀU ANTI KHÔNG ĐƯỢC TỰ Ý LÀM

1. Không viết lại toàn bộ hệ thống nếu chưa audit code.
2. Không xóa dữ liệu V3.
3. Không sửa PROD trực tiếp để thử nghiệm.
4. Không đổi cấu trúc dữ liệu mà không có migration.
5. Không bỏ lịch sử.
6. Không hard-delete chứng từ.
7. Không bỏ kiểm tra Serial.
8. Không thêm giá/kế toán/công nợ/doanh thu.
9. Không bỏ Dashboard hiện tại nếu phần đó vẫn có giá trị.
10. Không coi UI validation là đủ – phải validate server.
11. Không làm Phase sau khi Phase trước còn lỗi dữ liệu nghiêm trọng.

---

# 31. TRẠNG THÁI BÀN GIAO HIỆN TẠI

Trạng thái được coi là:

**Blueprint V4 đã chốt.**

Chưa được phép giả định rằng code hiện tại đã triển khai xong một Phase nào.

ANTI phải audit thực tế source V3/V4 và Google Sheet để xác định:

- phần nào đã có
- phần nào chưa có
- phần nào khác Blueprint
- phần nào có thể tái sử dụng
- phần nào phải migration
- Phase thực tế hiện tại

---

# 32. BÁO CÁO ĐẦU TIÊN ANTI PHẢI TRẢ LẠI

Trước khi sửa code, ANTI cần trả một báo cáo ngắn gồm:

## A. Hiện trạng

- cấu trúc project
- các file chính
- các Sheet/tab chính
- module hiện có

## B. Đối chiếu Blueprint

Bảng 4 cột:

| Hạng mục | Đã có | Mức hoàn thiện | Ghi chú |
|---|---|---|---|

## C. Rủi ro

Đặc biệt:

- mất Serial
- Serial trùng
- trạng thái không nhất quán
- sửa/hủy làm lệch tồn
- dữ liệu V3 khó migration
- nghiệp vụ ghi nhiều Sheet không nguyên vẹn

## D. Phase đề xuất bắt đầu

Chỉ ra Phase hiện tại và bước tiếp theo.

---

# 33. PROMPT MỞ ĐẦU CHO ANTI

**Copy nguyên phần này cho ANTI khi bắt đầu phiên làm việc:**

> Hãy đọc toàn bộ file `MASTER_HANDOFF_THANH_AN_WAREHOUSE_V4.md` và coi đây là nguồn đặc tả nghiệp vụ chính thức của dự án Quản lý kho Thành An V4.
>
> Sau đó đọc toàn bộ source code hiện tại và cấu trúc Google Sheets/Apps Script trước khi sửa bất kỳ code nào.
>
> Nhiệm vụ đầu tiên:
>
> 1. Xác định kiến trúc hiện tại của V3/V4.
> 2. Xác định các Sheet/tab và module đang được sử dụng.
> 3. Đối chiếu hệ thống hiện tại với Blueprint trong file này.
> 4. Lập bảng:
>    - Đã có
>    - Chưa có
>    - Có nhưng chưa hoàn chỉnh
>    - Khác/sai Blueprint
> 5. Kiểm tra đặc biệt:
>    - Serial Master
>    - trạng thái Serial
>    - Header/Detail
>    - nhập kho
>    - xuất kho
>    - sửa/hủy
>    - rollback
>    - tồn kho
>    - bảo hành
>    - audit log
>    - migration V3→V4
> 6. Không sửa code ngay cho đến khi hoàn thành audit.
> 7. Sau audit, xác định dự án đang ở Phase nào trong roadmap 0–9.
> 8. Đề xuất bước triển khai tiếp theo.
> 9. Không mở rộng sang kế toán, giá, công nợ, doanh thu hoặc PDF.
> 10. Luôn ưu tiên bảo toàn dữ liệu hiện có, đặc biệt là Serial và lịch sử chứng từ.
>
> Mục tiêu cuối cùng là một hệ thống quản lý kho ổn định, dễ sử dụng và truy được đầy đủ vòng đời từng thiết bị từ nhập kho, tồn kho, xuất khách đến bảo hành.

---

# 34. ĐỊNH HƯỚNG SAU V4 – CHỈ ĐỂ THAM KHẢO

Sau khi V4 kho ổn định, có thể mở rộng:

- Sale
- Báo giá
- Đơn hàng
- Hợp đồng
- Nhân viên sale
- Doanh số
- Giá
- Lợi nhuận
- Công nợ
- Thu chi
- Dự án B2B
- Đại lý
- CRM
- Báo cáo quản trị

Nhưng **không triển khai trong scope V4 hiện tại**.

---

# 35. KẾT LUẬN

Nguồn dữ liệu trung tâm của hệ thống phải là **vòng đời Serial**.

Mọi module khác phải phục vụ nguyên tắc:

> **Một Serial – một lịch sử rõ ràng – một trạng thái hiện tại – truy xuất được toàn bộ vòng đời.**

Nếu một thay đổi làm hệ thống đẹp hơn nhưng khiến Serial khó truy vết, dữ liệu khó audit hoặc tăng nguy cơ lệch tồn thì không được ưu tiên thay đổi đó.

**Tài liệu này là file bàn giao duy nhất cho ANTI.**
