# THANH_AN_ERP_V4_BLUEPRINT v1.0

> Cập nhật đối chiếu code trong gói 1.1: đã có `reference/V3/Quan ly kho.txt`; xem [báo cáo V3](docs/V3_CODE_RECONCILIATION.md). Giữ đặc tả nghiệp vụ v1.0, bổ sung bằng chứng nguồn và hướng tích hợp; không viết lại toàn bộ ứng dụng.

> Bản đóng gói 16/09/2026, tổng hợp đặc tả cuối cuộc trò chuyện “Phân tích hệ thống kho”. Đây là đặc tả nghiệp vụ, không phải báo cáo code đã triển khai. Ví dụ tên Model, mã phiếu, số lượng và thời gian là dữ liệu minh họa.
>
> Chi tiết kỹ thuật bổ sung, chuẩn hóa tên sự kiện và điểm chưa chốt: [IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md). Kế hoạch kiểm thử: [TEST_PLAN.md](docs/TEST_PLAN.md). Migration: [MIGRATION_V3_TO_V4.md](docs/MIGRATION_V3_TO_V4.md). Điều kiện hoàn thành từng phase nằm trong [ROADMAP.md](ROADMAP.md).
>
> Khi có mâu thuẫn với đề xuất cũ: dùng 10 phase 0–9; không hard-delete giao dịch kể cả Admin; Kho được sửa/hủy nhập/xuất; không in/PDF; giữ Dashboard hiện tại. Bảng schema dưới đây giữ các trường đã có trong bản chốt; trường kỹ thuật bổ sung được tách riêng, không giả định đã được người dùng duyệt.


## 1. Mục tiêu hệ thống

THÀNH AN ERP V4 là hệ thống quản lý kho thiết bị theo **Serial Number**, phục vụ công ty kinh doanh máy tính, máy in, máy scan, server và thiết bị văn phòng.

Hệ thống phải quản lý được toàn bộ vòng đời:

```text
NCC
 ↓
NHẬP KHO
 ↓
TỒN KHO
 ↓
XUẤT KHÁCH
 ↓
 ├─ BẢO HÀNH
 ├─ KHÁCH TRẢ
 └─ HOÀN NHẬP
 ↓
TRẢ NCC / TỒN LẠI / KẾT THÚC
```

Serial là đối tượng trung tâm.

Hệ thống phải trả lời được 4 câu hỏi bất kỳ lúc nào:

```text
1. SN này là máy gì?
2. Hiện SN đang ở đâu / trạng thái gì?
3. SN vào kho từ phiếu nào?
4. SN đã trải qua những giao dịch nào?
```

---

# 2. Nguyên tắc thiết kế

### 2.1 Serial là khóa nghiệp vụ

Một Serial duy nhất trong toàn hệ thống.

Không được tồn tại hai thiết bị có cùng SN.

---

### 2.2 Phiếu là giao dịch

Không thay đổi tồn kho bằng cách sửa trực tiếp dữ liệu.

Mọi biến động phải đi qua nghiệp vụ:

```text
Nhập kho
Xuất kho
Chuyển kho
Hoàn nhập
Trả NCC
Bảo hành
Điều chỉnh kiểm kê
```

---

### 2.3 Không xóa lịch sử

Không dùng:

```text
deleteRow()
```

đối với giao dịch đã phát sinh.

Thay bằng trạng thái:

```text
ĐÃ HỦY
```

và transaction hoàn tác.

---

### 2.4 Tách trạng thái hiện tại khỏi lịch sử

`SERIAL_MASTER`

cho biết:

> SN hiện tại đang ở đâu.

`LICH_SU_SERIAL`

cho biết:

> SN đã trải qua những gì.

---

### 2.5 Frontend nhanh nhưng backend quyết định

Client được phép:

- tìm kiếm;
- lọc;
- sort;
- chuyển tab;
- hiển thị dữ liệu cache.

Nhưng các nghiệp vụ:

- nhập;
- xuất;
- sửa;
- hủy;
- chuyển kho;
- hoàn nhập;

phải xác thực lại trên server.

---

# 3. Các module chính

Menu V4:

```text
🏠 Dashboard

📦 Kho hàng
   ├─ Tồn kho
   ├─ Nhập kho
   ├─ Xuất kho
   ├─ Chuyển kho
   └─ Kiểm kê

📄 Phiếu
   ├─ Phiếu nhập
   ├─ Phiếu xuất
   ├─ Hoàn nhập
   └─ Trả NCC

🛠 Bảo hành

🔎 Tra cứu Serial

📚 Danh mục

⚙️ Cài đặt
```

Không làm:

- giá nhập;
- giá bán;
- kế toán;
- công nợ;
- hóa đơn;
- in phiếu/PDF.

---

# 4. Dashboard

Giữ phong cách Dashboard V3 hiện tại.

Code V3 xác minh có bốn thẻ: Tồn kho thực tế; Xuất tháng này; Sắp hết hạn BH ≤30 ngày; Lưu kho lâu >60 ngày. Giữ các thẻ/bố cục này, hai biểu đồ và bảng FIFO. Danh sách KPI bên dưới là thông tin V4 cần hỗ trợ, không phải yêu cầu thay bốn thẻ bằng một bố cục mới. “Sắp hết hạn BH” khác “phiếu BH đang xử lý”.

Không redesign toàn bộ.

KPI chính:

```text
Tổng thiết bị tồn
Model đang tồn
Nhập tháng này
Xuất tháng này
Tồn > 60 ngày
Tồn > 90 ngày
Bảo hành đang xử lý
```

Quick Actions:

```text
+ Nhập kho
- Xuất kho
Tra Serial
```

Tìm nhanh:

```text
Serial
Model
Phiếu
Khách hàng
```

Click KPI phải drill-down tới danh sách tương ứng.

Ví dụ:

```text
Tồn > 60 ngày: 17
```

click →

hiện 17 Serial.

---

# 5. DANH MỤC

## 5.1 DM_SAN_PHAM

```text
product_id
model
ten_hang
nhom_hang
bao_hanh_mac_dinh_thang
trang_thai
created_at
updated_at
```

Ví dụ:

| Model | Tên | Nhóm | BH mặc định |
|---|---|---|---:|
| LBP246DW | Canon LBP246dw II | Máy in | 12 |
| PS186 | Plustek PS186 | Máy scan | 36 |

Model phải unique sau khi normalize.

---

# 6. DM_NCC

```text
supplier_id
ten_tat
ten_day_du
so_dien_thoai
dia_chi
ghi_chu
trang_thai
created_at
updated_at
```

Không xóa NCC đã phát sinh giao dịch.

Dùng:

```text
ACTIVE
INACTIVE
```

---

# 7. DM_KHACH_HANG

```text
customer_id
ten_khach_hang
so_dien_thoai
dia_chi
ghi_chu
trang_thai
created_at
updated_at
```

Không hard-delete khách đã có phiếu xuất.

---

# 8. DM_KHO

```text
warehouse_id
ma_kho
ten_kho
ghi_chu
trang_thai
```

Ví dụ:

```text
KHO_VP
Kho VP

KHO_BH
Kho bảo hành
```

---

# 9. SERIAL_MASTER

Đây là bảng quan trọng nhất.

```text
serial
product_id
model
ten_hang
nhom_hang
loai_hang

current_status
current_warehouse_id

supplier_id

receipt_no
receipt_date

last_export_no
last_customer_id

warranty_months
warranty_start
warranty_end

note

created_at
updated_at
```

`SERIAL_MASTER` chỉ chứa **trạng thái hiện tại**.

Không dùng bảng này làm lịch sử.

---

# 10. Trạng thái Serial

V4 chuẩn hóa các trạng thái nghiệp vụ sau:

```text
IN_STOCK
EXPORTED
WARRANTY
WAIT_RETURN_SUPPLIER
RETURNED_SUPPLIER
RETURNED_CUSTOMER
QUARANTINE
ADJUSTED_OUT
```

Hiển thị tiếng Việt:

```text
Tồn kho
Đã xuất
Đang bảo hành
Chờ trả NCC
Đã trả NCC
Khách trả
Chờ xử lý
Điều chỉnh giảm
```

Không dùng string tự do.

---

# 11. PHIẾU NHẬP

## PHIEU_NHAP

```text
receipt_id
receipt_no

receipt_date
supplier_id
warehouse_id
loai_hang

status

note

created_by
created_at
updated_by
updated_at

cancelled_by
cancelled_at
cancel_reason
```

Trạng thái:

```text
CONFIRMED
CANCELLED
```

---

# 12. CT_PHIEU_NHAP

```text
receipt_no
line_id

serial
product_id
model

created_at
```

Một Serial = một dòng.

Không lưu:

```text
SN1,SN2,SN3,SN4...
```

trong một cell làm dữ liệu chính.

---

# 13. Tạo phiếu nhập

Workflow:

```text
Chọn NCC
↓
Chọn Kho
↓
Chọn loại hàng
↓
Chọn Model
↓
Nhập / Scan Serial
↓
Kiểm tra trùng
↓
Xác nhận
```

Server:

```text
LockService
↓
Validate phiếu
↓
Check duplicate Serial
↓
Tạo PHIEU_NHAP
↓
Tạo CT_PHIEU_NHAP
↓
Tạo SERIAL_MASTER
↓
Ghi LICH_SU_SERIAL
↓
Audit
↓
Unlock
```

---

# 14. Sửa phiếu nhập

Nếu toàn bộ Serial của phiếu đang IN_STOCK **và chưa có nghiệp vụ phát sinh sau cản trở** thì cho phép sửa các trường dưới đây. Phải kiểm tra lịch sử, không chỉ trạng thái hiện tại (SN xuất rồi hoàn về tồn vẫn có phụ thuộc):

- ngày nhập;
- NCC;
- kho;
- loại hàng;
- ghi chú;
- Serial;
- Model;
- thêm/bớt thiết bị.

Nếu đã có Serial phát sinh nghiệp vụ tiếp theo:

```text
EXPORTED
WARRANTY
RETURNED_SUPPLIER
...
```

thì khóa các trường làm sai lịch sử.

---

# 15. Hủy phiếu nhập

Không delete phiếu.

Phiếu:

```text
CONFIRMED
→ CANCELLED
```

Chỉ cho hủy khi các Serial liên quan chưa phát sinh nghiệp vụ không thể hoàn tác.

Khi hủy:

```text
SERIAL_MASTER
→ ngừng hiệu lực tồn hiện hành, giữ hồ sơ và lịch sử
```

nhưng lịch sử vẫn giữ.

Ghi:

```text
CANCEL_RECEIPT
```

vào `LICH_SU_SERIAL`.

---

# 16. XUẤT KHO

## PHIEU_XUAT

```text
export_id
export_no

export_date

customer_id

customer_name_snapshot
customer_phone_snapshot
customer_address_snapshot

status

note

created_by
created_at
updated_by
updated_at

cancelled_by
cancelled_at
cancel_reason
```

Thông tin snapshot giúp lịch sử không thay đổi khi danh mục khách được sửa.

---

# 17. CT_PHIEU_XUAT

```text
export_no
line_id

serial
product_id
model

warranty_months
warranty_start
warranty_end

created_at
updated_at
```

## Quan trọng

Bảo hành **thuộc từng Serial**, không thuộc cả phiếu.

---

# 18. Bảo hành khi xuất

Model có:

```text
bao_hanh_mac_dinh_thang
```

Ví dụ:

```text
LBP246DW → 12
PS186 → 36
```

Khi chọn Serial:

| Serial | Model | BH |
|---|---|---:|
| SN001 | LBP246DW | 12 tháng |
| SN002 | LBP246DW | 12 tháng |
| SN003 | PS186 | 36 tháng |

Người dùng được override.

---

# 19. Bulk warranty

Cho phép:

```text
☑ SN001
☑ SN002
☑ SN003

Đặt BH:
[ 12 tháng ]
```

Áp cho các dòng được chọn.

---

# 20. Tạo phiếu xuất

Server:

```text
Lock
↓
Đọc trạng thái Serial thật
↓
Tất cả phải IN_STOCK
↓
Tạo PHIEU_XUAT
↓
Tạo CT_PHIEU_XUAT
↓
Update SERIAL_MASTER
↓
Ghi LICH_SU_SERIAL
↓
Audit
↓
Unlock
```

Nếu một Serial vừa bị người khác xuất:

```text
Reject toàn phiếu
```

Không ghi nửa phiếu.

---

# 21. Sửa phiếu xuất

Cho phép sửa:

- khách hàng;
- SĐT;
- địa chỉ snapshot;
- ngày xuất;
- ghi chú;
- thời hạn BH từng Serial.

Đổi Serial:

```text
SN_A → hoàn về tồn
SN_B → xuất
```

Không overwrite SN_A thành SN_B.

---

# 22. Hủy phiếu xuất

Phiếu:

```text
CONFIRMED
→ CANCELLED
```

Serial:

```text
EXPORTED
→ IN_STOCK
```

nếu không có nghiệp vụ phát sinh tiếp theo cản trở.

Lịch sử:

```text
EXPORT
CANCEL_EXPORT
RETURN_TO_STOCK
```

---

# 23. HOÀN NHẬP KHÁCH TRẢ

## PHIEU_HOAN_NHAP

```text
return_id
return_no
original_export_no

return_date
customer_id

reason
condition

status

created_by
created_at
```

Chi tiết:

```text
return_no
serial
action_after_return
```

`action_after_return`:

```text
RETURN_TO_STOCK
QUARANTINE
WARRANTY
```

---

# 24. TRẢ NCC

## PHIEU_TRA_NCC

```text
supplier_return_no
return_date
supplier_id
reason
status
created_by
created_at
```

Chi tiết:

```text
supplier_return_no
serial
```

Workflow:

```text
IN_STOCK
↓
WAIT_RETURN_SUPPLIER
↓
RETURNED_SUPPLIER
```

Không delete Serial.

---

# 25. CHUYỂN KHO

## PHIEU_CHUYEN_KHO

```text
transfer_no
transfer_date

from_warehouse_id
to_warehouse_id

status

created_by
created_at
```

Chi tiết:

```text
transfer_no
serial
```

Không sửa trực tiếp:

```text
current_warehouse_id
```

từ giao diện tồn kho.

---

# 26. KIỂM KÊ

Module kiểm kê trong phạm vi V4:

```text
Tạo đợt kiểm kê
↓
Chọn kho
↓
Scan Serial thực tế
↓
So sánh hệ thống
```

Kết quả:

```text
Đúng
Thiếu
Thừa
Sai vị trí
```

Điều chỉnh phải tạo transaction.

---

# 27. LỊCH SỬ SERIAL

## LICH_SU_SERIAL

```text
event_id

serial

event_type

document_type
document_no

from_status
to_status

from_warehouse
to_warehouse

description

user
event_time
```

`event_type` ví dụ:

```text
IMPORT
EDIT_RECEIPT
CANCEL_RECEIPT

EXPORT
EDIT_EXPORT
CANCEL_EXPORT

RETURN_CUSTOMER

TRANSFER

RETURN_SUPPLIER

WARRANTY_RECEIVE
WARRANTY_SEND_SUPPLIER
WARRANTY_RETURN
WARRANTY_COMPLETE

INVENTORY_ADJUSTMENT
SERIAL_CORRECTION
```

---

# 28. SERIAL 360°

Search Serial →

hiển thị:

```text
SERIAL: ABC123456

Model:
Canon LBP246dw II

Trạng thái:
ĐÃ XUẤT

Khách hàng:
Bệnh viện A

---------------------

NGUỒN GỐC

NCC:
Trí Việt

Phiếu nhập:
PN-260901-001

Ngày nhập:
01/09/2026

---------------------

XUẤT KHO

PX-260916-001
16/09/2026

BH:
12 tháng

Hết hạn:
16/09/2027

---------------------

TIMELINE

01/09 Nhập kho
16/09 Xuất kho
...
```

Serial click ở bất kỳ bảng nào đều mở màn hình này.

---

# 29. BẢO HÀNH

## PHIEU_BAO_HANH

```text
warranty_ticket_no

serial

customer_id

receive_date

reported_issue
condition_received

warranty_status

processing_status

assigned_to

note

created_by
created_at
updated_at
```

`warranty_status`:

```text
IN_WARRANTY
OUT_OF_WARRANTY
```

`processing_status`:

```text
RECEIVED
CHECKING
PROCESSING
SENT_SUPPLIER
RECEIVED_FROM_SUPPLIER
READY_TO_RETURN
COMPLETED
CANCELLED
```

---

# 30. TỒN KHO

Màn hình giữ bố cục tương tự hiện tại.

Filter:

```text
Search text
Model
Nhóm hàng
Kho
NCC
Loại hàng
Tuổi tồn
```

## Quy tắc quan trọng

Search text:

```text
contains
```

Ví dụ:

```text
6030
```

có thể tìm:

```text
6030
6030w
```

Nhưng:

### Filter Model

phải:

```text
exact match
```

Chọn:

```text
Canon LBP 6030
```

không được trả:

```text
Canon LBP 6030w
```

---

# 31. KPI tồn kho

`Tồn: X máy`

phải tính trên **dataset sau khi áp dụng tất cả filter**.

Không tính trên search gần đúng không rõ nghĩa.

---

# 32. Tìm Model

Khi gõ:

```text
Canon LBP 6030
```

gợi ý:

```text
Canon LBP 6030       4 máy
Canon LBP 6030w      6 máy
```

Click Model →

exact filter.

---

# 33. Không cho xóa Serial trực tiếp

Bỏ icon:

```text
🗑
```

khỏi tồn kho.

Các hành động hợp lệ:

```text
Xem
Sửa metadata được phép
Chuyển kho
Trả NCC
Kiểm kê
```

---

# 34. Sửa Serial

Serial là identifier quan trọng.

Không cho sửa như text bình thường.

Nếu cần sửa do nhập sai:

```text
Sửa Serial
↓
Nhập lý do
↓
Kiểm tra SN mới
↓
Audit
↓
LICH_SU_SERIAL
```

---

# 35. Camera / Scan Serial

V4 hỗ trợ:

```text
Nhập tay
Scan Barcode/QR
```

OCR ảnh để Phase sau.

Chế độ:

```text
Continuous Scan
```

Workflow:

```text
Camera
↓
Scan
↓
Normalize
↓
Check duplicate local
↓
Add
↓
Continue
```

Server vẫn kiểm tra lại khi Submit.

---

# 36. PHÂN QUYỀN

## ADMIN

Toàn quyền.

Ngoài nghiệp vụ còn:

- user;
- settings;
- backup;
- cấu hình hệ thống.

---

## KHO

Quyền vận hành đầy đủ:

```text
Dashboard

Tồn kho

Tạo/Sửa/Hủy phiếu nhập

Tạo/Sửa/Hủy phiếu xuất

Hoàn nhập

Chuyển kho

Trả NCC

Bảo hành

Danh mục

Kiểm kê
```

Kho **được sửa/hủy phiếu nhập và xuất**.

---

## SALE

Ban đầu:

```text
Xem tồn
Search Serial
Xem bảo hành
```

Không sửa dữ liệu kho.

---

# 37. Hard delete

Không hard-delete dữ liệu giao dịch, kể cả bằng quyền Admin. Đây là quy tắc ưu tiên theo yêu cầu đóng gói hiện tại, thay cho ngoại lệ Admin trong bản nháp cũ.

Không triển khai endpoint hoặc nút xóa vĩnh viễn phiếu, lịch sử hay Serial. Hủy phiếu bằng trạng thái CANCELLED và giao dịch hoàn tác. Danh mục đã dùng chỉ chuyển INACTIVE.

---

# 38. AUDIT_LOG

```text
audit_id

time
user

action

object_type
object_id

before_data
after_data

note
```

Ví dụ:

```text
21:05
Nguyễn A

EDIT_EXPORT
PX001

BH SN003:
36 → 24
```

---

# 39. Double-submit protection

Mọi nút Save:

```text
Click
↓
disable ngay
↓
spinner
↓
server
↓
success/error
↓
enable
```

Không cho click 2 lần.

---

# 40. Duplicate protection

Không chỉ dựa client.

Backend phải check.

Ví dụ NCC:

```text
normalize(" Song Hùng ")
→ SONG HÙNG
```

không được tạo thêm:

```text
Song Hùng
song hùng
SONG HÙNG
```

---

# 41. Concurrency

Mutation quan trọng dùng:

```text
LockService
```

đặc biệt:

- nhập kho;
- xuất kho;
- hủy phiếu;
- đổi Serial;
- chuyển kho;
- hoàn nhập.

---

# 42. Hiệu năng

## Không làm

```text
save
↓
refreshAllDataFast()
↓
reload toàn app
```

---

## Làm

Server trả về object vừa thay đổi:

```text
saveNcc()
↓
return supplier
```

Frontend:

```text
state.suppliers.push()
```

hoặc update đúng row.

---

# 43. Batch write

Không:

```text
for each SN
   setValue()
   setValue()
   setValue()
```

Ưu tiên:

```text
read once
modify array
write batch
```

---

# 44. Cache

Cache được:

```text
DM_SAN_PHAM
DM_NCC
DM_KHACH_HANG
DM_KHO
DM_QUY_CHUAN
```

Không dùng cache làm nguồn quyết định cho:

```text
Serial status
Stock availability
Export validation
```

---

# 45. Client state

Browser có thể giữ:

```text
master data
stock list hiện tại
```

để:

- search;
- filter;
- sort;
- chuyển tab.

Nhưng mutation luôn server-side.

---

# 46. Không load tất cả ngay

Lazy load theo module.

Ví dụ:

```text
Dashboard
→ chỉ dashboard

Mở Bảo hành
→ mới load bảo hành
```

Không tải toàn bộ lịch sử hàng nghìn dòng khi login.

---

# 47. Backup

Giữ:

```text
Backup tay
Backup tự động hàng ngày
```

Trước migration:

```text
FULL BACKUP
```

---

# 48. Môi trường

Bắt buộc 3 môi trường:

```text
PRODUCTION

BACKUP

DEV
```

ANTI chỉ phát triển trên:

```text
DEV
```

Không sửa trực tiếp PROD.

---

# 49. Migration V3 → V4

Phải migrate:

```text
DM_SAN_PHAM
DM_NCC
DM_KHACH_HANG
DM_QUY_CHUAN

DATA_THIET_BI

LICH_SU_NHAP
LICH_SU_XUAT

USERS

CONFIG
```

Không xóa V3 cho đến khi V4 nghiệm thu.

---

# 50. Migration Serial

Với mỗi row V3:

```text
DATA_THIET_BI
```

tạo:

```text
SERIAL_MASTER
```

Nếu có phiếu nhập:

```text
PHIEU_NHAP
CT_PHIEU_NHAP
```

Nếu đã xuất:

```text
PHIEU_XUAT
CT_PHIEU_XUAT
```

và tạo timeline tương ứng.

---

# 51. Test bắt buộc

### Test duplicate

```text
Bấm Lưu NCC 2 lần
→ chỉ 1 NCC
```

---

### Test đồng thời

```text
User A xuất SN001
User B xuất SN001

→ chỉ 1 người thành công
```

---

### Test search

```text
Model = Canon LBP 6030

→ không có 6030w
```

---

### Test mixed warranty

Phiếu có:

```text
SN001 → 12 tháng
SN002 → 36 tháng
```

→ phải lưu đúng riêng từng máy.

---

### Test cancel export

```text
PX001
SN001 EXPORTED
↓ cancel
SN001 IN_STOCK
```

Timeline vẫn còn.

---

### Test sửa nhập

Phiếu chưa phát sinh xuất:

→ sửa được.

Phiếu có Serial đã xuất:

→ rule hạn chế phải hoạt động.

---

# 52. Các Phase triển khai cho ANTI

## PHASE 0 — Safety

- Backup
- DEV copy
- Git snapshot
- baseline performance

Không sửa nghiệp vụ.

---

## PHASE 1 — Data Model

Tạo cấu trúc:

```text
SERIAL_MASTER

PHIEU_NHAP
CT_PHIEU_NHAP

PHIEU_XUAT
CT_PHIEU_XUAT

LICH_SU_SERIAL
```

và migration framework.

---

## PHASE 2 — Danh mục

Làm:

- Product
- NCC
- Customer
- Warehouse
- Duplicate protection
- soft delete
- BH mặc định
- performance

---

## PHASE 3 — Nhập kho

Làm:

- create;
- edit;
- cancel;
- scan SN;
- duplicate;
- LockService.

---

## PHASE 4 — Xuất kho

Làm:

- create;
- BH từng Serial;
- bulk warranty;
- edit;
- cancel;
- concurrency.

---

## PHASE 5 — Tồn kho

Làm:

- filter chính xác;
- Model dropdown;
- search;
- tuổi tồn;
- bulk selection;
- bỏ hard-delete.

---

## PHASE 6 — Serial 360

Làm:

- Serial Master Profile
- Timeline
- global search.

---

## PHASE 7 — Operations

Làm:

```text
Hoàn nhập
Chuyển kho
Trả NCC
Kiểm kê
```

---

## PHASE 8 — Bảo hành

Làm:

- phiếu BH;
- workflow;
- NCC warranty;
- trả khách.

---

## PHASE 9 — Dashboard + Hardening

Giữ Dashboard hiện tại nhưng:

- nguồn dữ liệu mới;
- drill-down;
- performance;
- concurrency tests;
- permissions;
- migration final.

---

# 53. Không nằm trong V4 hiện tại

Để tránh scope phình quá lớn:

```text
In phiếu
PDF
Tem QR
OCR AI
Kế toán
Giá vốn
Giá bán
Công nợ
Hóa đơn
CRM
```

Những thứ này có thể thêm sau mà không cần phá cấu trúc V4.

---

# 54. Mục tiêu cuối cùng

Khi V4 hoàn thành, một thiết bị phải có vòng đời như:

```text
SN001

01/09
Nhập kho
PN001
Trí Việt

↓

05/09
Chuyển
Kho VP → Kho chính

↓

16/09
Xuất
PX001
BV A
BH 12 tháng

↓

01/12
Bảo hành
BH001

↓

02/12
Gửi NCC

↓

10/12
Nhận lại

↓

11/12
Trả khách
```

Và toàn bộ lịch sử này phải xem được chỉ bằng cách:

```text
Search SN001
```

---

# 55. Nguyên tắc ANTI phải tuân thủ

Tôi đề nghị đưa nguyên văn các rule sau vào đầu dự án:

> Không thay đổi nghiệp vụ ngoài Blueprint.

> Không hard-delete dữ liệu giao dịch.

> Không sửa PROD trực tiếp.

> Không reload toàn bộ ứng dụng sau một thao tác nhỏ.

> Mọi mutation quan trọng phải validate server-side.

> Mọi giao dịch thay đổi tồn kho phải ghi `LICH_SU_SERIAL`.

> Serial là identifier duy nhất.

> Bảo hành thuộc từng Serial của phiếu xuất.

> Filter Model phải exact-match.

> Mọi Phase phải có test trước khi commit.

---

