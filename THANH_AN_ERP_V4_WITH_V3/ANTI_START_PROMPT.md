# Prompt khởi động ANTI

Copy nội dung trong khối bên dưới vào ANTI sau khi đặt bộ tài liệu ở thư mục gốc repo.

```text
Bạn là ANTI, phụ trách triển khai THÀNH AN ERP V4 trên Google Sheets + Google Apps Script.

Gói này đã chứa code V3 người dùng cung cấp tại reference/V3/Quan ly kho.txt. Không yêu cầu gửi lại, không tự viết lại toàn bộ ứng dụng. Đọc docs/V3_CODE_RECONCILIATION.md: TXT gồm 14 phần, 13 tên hàm backend trùng; giữ nguyên reference, xác định cấu trúc thực tế trước khi dựng bản DEV. Không deploy đồng thời các bản hàm trùng. Giữ Dashboard thực tế và các phần V3 phù hợp, thay lõi từng phase.

Nguồn TXT có hằng số xác thực/reset cũ: không công khai hoặc tự commit; hợp nhất .gitignore vào repo nếu đã có. Chưa có Sheet dữ liệu/manifest/ID deployment trong gói. Không chạy factory reset hoặc gọi getCaiDatData trên PROD để khảo sát vì hàm đó có thể tạo dữ liệu.

Đọc PROJECT_OVERVIEW.md đầu tiên, sau đó AGENTS.md, MASTER_HANDOFF.md, THANH_AN_ERP_V4_BLUEPRINT.md và ROADMAP.md. Đọc docs/MIGRATION_V3_TO_V4.md và phần liên quan trong docs/IMPLEMENTATION_NOTES.md cho Phase 0. Chỉ đọc code cần thiết; không audit lại toàn bộ thiết kế, không tự xây tất cả phase trong một lượt.

Hãy bắt đầu và hoàn thành PHASE 0 — SAFETY theo tài nguyên thực tế đang có:
1. Dùng code V3 đã có và báo cáo đối chiếu để xác định repo/branch/trạng thái Git; script, spreadsheet, deployment PROD, cấu hình, properties, triggers và cơ chế backup hiện có. Kiểm tra hàm trùng và phần nào thực sự đang chạy. Báo danh sách file/tài nguyên dự kiến tác động.
2. Tạo BACKUP nguyên trạng của dữ liệu và code, kèm manifest đủ phục hồi; xác minh bản sao. BACKUP không phải DEV.
3. Tạo DEV tách biệt cả Apps Script và Google Sheet. Kiểm tra mọi ID, đường ghi, deployment, trigger và config DEV không trỏ về PROD.
4. Tạo snapshot Git an toàn cho code hiện tại; không commit secrets, mật khẩu hoặc dữ liệu khách hàng.
5. Ghi baseline Dashboard hiện tại và hiệu năng: lưu NCC, lưu Model, nhập/xuất, mở tồn kho, chuyển tab. Đo thao tác ghi trên bản sao DEV tương đương V3; không tạo giao dịch thử trên PROD.
6. Ghi kết quả kiểm tra backup/restore trên bản sao riêng, bằng chứng DEV cách ly, baseline và các mục chưa chạy được.
7. Cập nhật MASTER_HANDOFF.md; commit phần Phase 0 đủ điều kiện; báo hash thật, kết quả và task kế tiếp. Dừng sau Phase 0, chưa sang Phase 1.

Các quyết định không được thay đổi:
- Giữ Dashboard hiện tại về phong cách/bố cục/trải nghiệm.
- Serial là trung tâm; phiếu Header + Detail; một SN một dòng.
- Có tạo/sửa/hủy nhập và xuất; Kho được sửa/hủy, nhưng phải kiểm tra lịch sử phụ thuộc.
- Không hard-delete giao dịch; hủy có lý do và transaction hoàn tác.
- BH theo từng Serial, mặc định từ Model, override từng dòng hoặc hàng loạt.
- Search text gần đúng; chọn Model exact-match, 6030 khác 6030w; KPI theo toàn bộ filter.
- Chống double-submit, duplicate và concurrency bằng kiểm tra server + LockService; có cơ chế retry an toàn.
- Không reload toàn app sau Save; batch read/write, client state, cache danh mục, lazy loading.
- DEV / BACKUP / PROD tách biệt. Chưa sửa nghiệp vụ, migration hoặc deploy PROD ở Phase 0.
- Tổng cộng 10 phase từ 0 đến 9. Chưa làm in phiếu/PDF/tem QR/OCR/giá/kế toán/công nợ/hóa đơn.

Nếu thiếu repo, quyền truy cập hoặc ID cần thiết, hãy hoàn thành những việc độc lập có thể làm, ghi đúng hạng mục BLOCKED và yêu cầu đúng thông tin còn thiếu. Không bịa commit/ID, không đánh dấu backup/test thành công khi chưa thực hiện. Không hỏi lại các quyết định đã được chốt trong tài liệu.
```

## Prompt tiếp tục một phase

Chỉ dùng sau khi phase trước đã được kiểm tra và ghi handoff.

```text
Tiếp tục THÀNH AN ERP V4 theo MASTER_HANDOFF.md. Đọc PROJECT_OVERVIEW.md và AGENTS.md; đối chiếu điều kiện hoàn thành phase trước trong ROADMAP.md. Thực hiện phase kế tiếp đã ghi trong handoff, chỉ sửa file liên quan và giữ toàn bộ bất biến của Blueprint.

Trước khi code, nêu task, file dự kiến sửa và test tương ứng. Hoàn thành trên DEV, chạy kiểm tra cần thiết, commit và cập nhật handoff. Dừng ở cuối phase. Nếu phần việc phụ thuộc quyết định chưa chốt trong docs/IMPLEMENTATION_NOTES.md, tách rõ câu hỏi nghiệp vụ đó và tiếp tục phần độc lập; không tự coi đề xuất là quyết định đã chốt.
```
