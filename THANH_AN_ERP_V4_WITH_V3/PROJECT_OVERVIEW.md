# THÀNH AN ERP V4 — Tổng quan dự án

Phiên bản gói: 1.1 — đã tích hợp code V3 · Ngày đóng gói: 16/09/2026 · Đơn vị triển khai: ANTI

Đã có bản V3 nguyên gốc tại `reference/V3/Quan ly kho.txt`. Xem [đối chiếu code](docs/V3_CODE_RECONCILIATION.md) trước khi dựng DEV: 14 phần code có 13 tên hàm backend trùng. Kế thừa V3 và thay dần lõi theo phase; không viết lại toàn bộ giao diện, không deploy tất cả các phần trùng hàm cùng lúc.

**Đọc file này đầu tiên.** Đây là bộ đặc tả khởi động; chưa phải phần mềm đã triển khai, chưa tạo BACKUP/DEV và chưa migration dữ liệu.

## 1. Mục tiêu

THÀNH AN kinh doanh máy tính, laptop, máy in, máy scan, server và thiết bị văn phòng. V4 tiếp tục dùng **Google Sheets + Google Apps Script + giao diện web hiện có**.

Giữ Dashboard hiện tại về phong cách, bố cục chính, thẻ KPI, biểu đồ, tìm kiếm nhanh, cảnh báo hàng tồn lâu/FIFO và nút Nhập/Xuất. Xây lại lõi dữ liệu và nghiệp vụ để thao tác nhanh hơn, nhiều người dùng an toàn, sửa/hủy phiếu đúng nghiệp vụ và tra cứu đầy đủ vòng đời Serial. Không redesign toàn bộ, không chuyển nền tảng.

## 2. Nguyên tắc đã chốt

1. **Serial là trung tâm:** một SN chuẩn hóa đại diện một thiết bị duy nhất toàn hệ thống.
2. **Phiếu là giao dịch:** Header chứa thông tin chung; Detail có một Serial trên mỗi dòng. Không lưu chuỗi SN làm dữ liệu chính.
3. **Hiện tại tách khỏi lịch sử:** SERIAL_MASTER giữ trạng thái hiện tại; LICH_SU_SERIAL giữ diễn biến.
4. **Sửa/hủy nhập và xuất là chức năng bắt buộc.** Kiểm tra nghiệp vụ phát sinh sau trước khi cho thao tác; không overwrite làm mất dấu vết.
5. **Kho được tạo/sửa/hủy phiếu nhập, xuất**, thực hiện các nghiệp vụ kho, bảo hành, danh mục. Admin có thêm quyền quản trị. Sale ban đầu chỉ xem tồn, Serial, bảo hành.
6. **Không hard-delete giao dịch**, kể cả bằng quyền Admin. “Xóa phiếu” trong vận hành nghĩa là hủy có lý do và hoàn tác; danh mục đã dùng chuyển INACTIVE.
7. **Bảo hành theo từng Serial của phiếu xuất:** mặc định từ Model; sửa từng dòng hoặc áp hàng loạt cho dòng đang chọn.
8. **Search text có thể gần đúng; chọn Model phải exact-match.** 6030 khác 6030w. KPI Tồn tính sau tất cả bộ lọc.
9. **Chống double-submit và chống trùng ở cả client/server.** Mutation phải kiểm quyền, đọc lại dữ liệu thật và dùng LockService cho vùng kiểm tra–ghi chung.
10. **Hiệu năng là yêu cầu xuyên suốt:** cập nhật client state cục bộ, batch read/write, cache danh mục, lazy load; không reload cả app sau thao tác nhỏ.
11. **PROD / BACKUP / DEV tách biệt cả code và Sheet.** ANTI phát triển trên DEV. Giữ nguyên BACKUP để phục hồi.
12. Hoàn thành, kiểm thử, commit và bàn giao từng phase; tổng cộng **10 phase từ 0 đến 9**.

## 3. Phạm vi

- Danh mục Model, NCC, khách hàng, kho; bảo toàn quy chuẩn hiện có.
- Nhập kho nhiều Model/SN; nhập tay, dán nhiều SN, barcode/QR và quét liên tục.
- Phiếu nhập/xuất: danh sách, chi tiết, tạo, sửa, hủy.
- Tồn kho: lọc, tìm kiếm, tuổi tồn, chọn nhiều SN; không có nút xóa thiết bị.
- Serial 360° và tìm nhanh Serial/Model/phiếu/khách hàng.
- Hoàn nhập khách trả, chuyển kho, trả NCC, kiểm kê.
- Phiếu bảo hành và lịch sử xử lý.
- Phân quyền, audit, backup, migration V3 → V4.

**Chưa làm:** in phiếu, PDF, in tem QR, OCR/AI ảnh, giá nhập/giá vốn/giá bán, kế toán, công nợ, hóa đơn, CRM, OEE và quản lý tài sản nội bộ phức tạp. Quét barcode/QR để nhập SN thuộc phạm vi; in tem QR thì không.

## 4. Bức tranh dữ liệu

```text
Danh mục → Phiếu nhập Header + Detail → SERIAL_MASTER → Phiếu xuất Header + Detail
                                            ↕
                        Hoàn nhập / Chuyển kho / Trả NCC / Kiểm kê / Bảo hành
                                            ↓
                                     LICH_SU_SERIAL
                                            ↓
                                Serial 360° / Tồn kho / Dashboard
```

Mọi mutation có AUDIT_LOG phía server. Cache và browser chỉ phục vụ hiển thị; Google Sheets là dữ liệu chuẩn để xác nhận nghiệp vụ.

## 5. Lộ trình duy nhất

| Phase | Kết quả chính |
|---|---|
| 0 — Safety | BACKUP, DEV, snapshot Git, baseline |
| 1 — Data Model | Schema V4, ràng buộc, nền giao dịch, khung migration |
| 2 — Danh mục | Chống trùng, inactive, BH mặc định, lưu cục bộ |
| 3 — Nhập kho | Tạo/sửa/hủy, scan, LockService |
| 4 — Xuất kho | BH từng SN, bulk BH, sửa/hủy, đồng thời |
| 5 — Tồn kho | Exact Model, KPI theo filter, tuổi tồn, chọn nhiều |
| 6 — Serial 360° | Hồ sơ, timeline, global search |
| 7 — Operations | Hoàn nhập, chuyển kho, trả NCC, kiểm kê |
| 8 — Bảo hành | Phiếu BH và workflow xử lý |
| 9 — Dashboard + Hardening | Giữ Dashboard, tối ưu, test tổng, migration cuối |

Chi tiết và điều kiện hoàn thành: [ROADMAP.md](ROADMAP.md).

## 6. Cách ANTI sử dụng bộ tài liệu

Phiên đầu đọc: Tổng quan → [AGENTS.md](AGENTS.md) → [MASTER_HANDOFF.md](MASTER_HANDOFF.md) → [Blueprint](THANH_AN_ERP_V4_BLUEPRINT.md) → roadmap và tài liệu hỗ trợ của phase hiện tại → chỉ code liên quan.

Phiên sau: đọc lại tổng quan và handoff; tra quy tắc/đặc tả liên quan thay vì quét toàn repo. Khởi động bằng [ANTI_START_PROMPT.md](ANTI_START_PROMPT.md).

Quyết định nghiệp vụ đã chốt có trong Blueprint. Chi tiết triển khai bổ sung và các điểm cần xác nhận được phân biệt trong [IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md). Không coi thông tin còn thiếu là đã được duyệt.
