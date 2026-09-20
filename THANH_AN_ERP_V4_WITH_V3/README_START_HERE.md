# Bộ khởi động THÀNH AN ERP V4 cho ANTI — ĐÃ CÓ CODE V3

Bản 1.1 · 16/09/2026 · Tài liệu UTF-8 + code V3 nguyên byte

## Dùng ngay

1. Giải nén gói `THANH_AN_ERP_V4_WITH_V3.zip` vào thư mục V4 DEV riêng, ngoài dự án cũ. Nếu cần đưa vào repo V4 đã tạo, copy **nội dung bên trong thư mục THANH_AN_ERP_V4_WITH_V3** vào gốc repo đó. Không ghi vào dự án V3 đang dùng.
2. Nếu repo đã có AGENTS.md, .gitignore hoặc file trùng tên, so sánh và hợp nhất; không ghi đè quy tắc/công việc hiện có. Bật hiển thị file ẩn để không bỏ sót .gitignore. Không cần thay README chính của repo.
3. Mở repo trong ANTI.
4. Copy khối prompt trong [ANTI_START_PROMPT.md](ANTI_START_PROMPT.md) vào ANTI.
5. ANTI bắt đầu Phase 0. Chỉ cung cấp repo/tài nguyên truy cập còn thiếu khi ANTI xác định cần; không cần trả lời toàn bộ câu hỏi nghiệp vụ trước khi backup.

## Các file

| File | Vai trò |
|---|---|
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Tổng quan ANTI đọc đầu tiên |
| [AGENTS.md](AGENTS.md) | Quy tắc triển khai và bất biến |
| [MASTER_HANDOFF.md](MASTER_HANDOFF.md) | Trạng thái ban đầu, task tiếp theo, mẫu bàn giao |
| [THANH_AN_ERP_V4_BLUEPRINT.md](THANH_AN_ERP_V4_BLUEPRINT.md) | Đặc tả nghiệp vụ và schema đã chốt |
| [ROADMAP.md](ROADMAP.md) | 10 phase 0–9, task, phạm vi và tiêu chí hoàn thành |
| [ANTI_START_PROMPT.md](ANTI_START_PROMPT.md) | Prompt Phase 0 và prompt tiếp tục |
| [docs/IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md) | Chi tiết kỹ thuật bổ sung, quy tắc toàn vẹn và quyết định còn mở |
| [docs/MIGRATION_V3_TO_V4.md](docs/MIGRATION_V3_TO_V4.md) | Backup, DEV, mapping, dry-run, đối soát, cutover, rollback |
| [docs/TEST_PLAN.md](docs/TEST_PLAN.md) | Test theo phase, concurrency, phân quyền, performance |
| [docs/DECISION_TRACE.md](docs/DECISION_TRACE.md) | Nguồn và cách giải quyết đề xuất cũ mâu thuẫn |
| [docs/V3_CODE_RECONCILIATION.md](docs/V3_CODE_RECONCILIATION.md) | Đối chiếu code thật, mapping 14 phần, 13 hàm trùng, việc giữ/thay ở V4 |
| [reference/V3/README.md](reference/V3/README.md) | Quy tắc giữ nguyên bản V3 và hash xác minh |
| [reference/V3/Quan ly kho.txt](<reference/V3/Quan ly kho.txt>) | Bản code người dùng cung cấp, giữ nguyên byte |
| .gitignore | Tránh tự commit bản TXT chứa hằng số xác thực/reset cũ |

## Trạng thái và giới hạn

Bộ này đã có code V3 gốc và báo cáo đối chiếu tĩnh. Code gốc chứa hằng số xác thực/reset cũ nên gói chỉ dùng riêng, không đăng công khai hoặc tự commit bản TXT; .gitignore không ngăn file đã được track từ trước. Chưa có Sheet dữ liệu, manifest hoặc tài nguyên Google mới. Chưa backup hệ thống, chưa deploy, chưa test ứng dụng; handoff vẫn **Phase 0 — NOT STARTED**.

Nội dung dựa trên lịch sử thiết kế và tệp V3 người dùng đã cung cấp. Không cần bản ChatGPT cũ hoặc gửi lại code để ANTI hiểu phạm vi. V3 nằm trong reference để đối chiếu; chưa tách thành dự án thực thi vì cần xử lý 13 tên hàm backend trùng và xác minh binding DEV. Ảnh Dashboard thật vẫn cần chụp ở Phase 0. Nâng cấp từng module từ V3, không tự viết lại toàn bộ giao diện.

Blueprint là quyết định nghiệp vụ. Ghi chú triển khai tách rõ phần bổ sung kỹ thuật và phần cần xác nhận; không gán các chi tiết chưa thống nhất thành yêu cầu người dùng đã duyệt.

Phạm vi chưa gồm in phiếu/PDF/giá/kế toán/công nợ/hóa đơn. Bộ tài liệu không kích hoạt bất kỳ công việc tự động nào.
