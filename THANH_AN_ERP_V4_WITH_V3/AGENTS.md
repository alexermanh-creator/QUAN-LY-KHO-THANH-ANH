# Quy tắc làm việc cho ANTI — THÀNH AN ERP V4

## Đầu vào V3 đã tích hợp — gói 1.1

- Nguồn đã có: `reference/V3/Quan ly kho.txt`; không yêu cầu người dùng gửi lại. Đọc docs/V3_CODE_RECONCILIATION.md để tìm đúng phần liên quan.
- Giữ bản tham chiếu nguyên trạng. Đây là code gốc nhiều phần, chưa phải cây source sẵn sàng deploy; xử lý 13 tên hàm trùng theo báo cáo trước khi dựng DEV.
- Giữ Dashboard thực tế gồm bốn thẻ cũ, hai biểu đồ, tìm nhanh và bảng FIFO. Không thay toàn bộ bố cục theo ví dụ KPI trong Blueprint.
- Không chạy code từ bản tham chiếu, đặc biệt factory reset hoặc getCaiDatData trên PROD: hàm đọc cài đặt cũng có thể tạo dữ liệu.
- Code gốc có hằng số xác thực/reset cũ; giữ riêng tư, không tự commit TXT. Hợp nhất .gitignore vào repo hiện có, không ghi đè quy tắc cũ; kiểm tra tệp đã track trước commit.
- Chưa có deployment/Sheet/trigger thật để kiểm chứng. Đối chiếu tĩnh đã làm không thay thế Phase 0 backup/cách ly DEV.

## Đọc và xác định phạm vi

- Đọc PROJECT_OVERVIEW.md đầu tiên; sau đó file này, MASTER_HANDOFF.md, Blueprint, ROADMAP.md và tài liệu của phase hiện tại.
- Làm đúng phase trong handoff. Phiên đầu chỉ Phase 0; không triển khai cả V4 trong một lượt.
- Lập danh sách file thực tế dự kiến sửa trước khi sửa. Tên file code, nhánh, ID và deployment chưa có bằng chứng đều phải ghi CHƯA XÁC ĐỊNH.
- Không cần audit lại toàn bộ code để tranh luận thiết kế. Chỉ khảo sát đủ để xác định môi trường, dependency, mapping dữ liệu và phạm vi phase.
- Nếu repo có quy tắc sẵn, hợp nhất phần V4, không ghi đè làm mất quy tắc không liên quan. Mâu thuẫn ảnh hưởng dữ liệu phải ghi vào handoff và xử lý trước phần phụ thuộc.
- Không tự mở rộng nghiệp vụ, đổi nền tảng, redesign Dashboard hoặc thực hiện các mục ngoài phạm vi.

## Bất biến nghiệp vụ

- Serial duy nhất sau chuẩn hóa; phiếu Header + Detail, một Serial/một dòng.
- SERIAL_MASTER không thay thế lịch sử. Mọi thay đổi tồn/trạng thái/vị trí có giao dịch và LICH_SU_SERIAL.
- Không hard-delete phiếu, detail đã phát sinh, lịch sử hoặc hồ sơ thiết bị. Admin không được bỏ qua nguyên tắc này.
- Danh mục đã dùng chuyển INACTIVE; lịch sử vẫn tham chiếu và hiển thị được.
- Kho có quyền tạo/sửa/hủy phiếu nhập và xuất. Phân quyền không thay thế kiểm tra điều kiện nghiệp vụ; Admin cũng chịu ràng buộc toàn vẹn.
- Sửa/hủy kiểm tra các giao dịch phát sinh sau, không chỉ nhìn current_status. SN đã xuất rồi hoàn về tồn vẫn có lịch sử phụ thuộc.
- Đổi SN trong phiếu xuất là hoàn tác SN cũ và xuất SN mới có liên kết lịch sử. Sửa lỗi mã SN là nghiệp vụ SERIAL_CORRECTION riêng có lý do.
- Bảo hành nằm ở chi tiết từng Serial; đổi mặc định Model không sửa ngược phiếu cũ.
- Filter Model exact-match, ưu tiên product_id. Search text gần đúng phải tách rõ trên UI. KPI theo cùng dataset đã lọc.
- Không tự đặt chính sách còn bỏ ngỏ trong docs/IMPLEMENTATION_NOTES.md thành quyết định đã chốt.

## Quy tắc ghi dữ liệu

- Backend xác thực danh tính/quyền; không tin role, user, số lượng tồn, giá trị tính sẵn hoặc thời hạn BH gửi từ client.
- Nút mutation disable ngay, có trạng thái đang xử lý và xử lý lỗi; không gửi lại mù khi chưa rõ request đã ghi hay chưa.
- Kiểm tra trùng và trạng thái dưới cùng LockService với thao tác ghi. Mọi đường ghi cùng tài nguyên dùng chung cơ chế khóa.
- Dùng dữ liệu thật trên server khi xác nhận; cache không quyết định tồn kho.
- Kiểm tra toàn bộ phiếu trước khi ghi. Có kế hoạch xử lý lỗi giữa các lần ghi; không coi LockService là rollback tự động.
- Ghi audit ở server trong cùng luồng nghiệp vụ; before/after, actor, thời gian, lý do và liên kết phiếu.
- Không ghi mật khẩu, token hoặc dữ liệu bí mật vào audit, repo hay báo cáo.
- Chi tiết idempotency, version và recovery trong docs/IMPLEMENTATION_NOTES.md là thiết kế kỹ thuật bổ sung để đáp ứng yêu cầu chống ghi trùng và không để nửa phiếu.

## Hiệu năng và giao diện

- Giữ Dashboard hiện tại, đối chiếu ảnh/baseline Phase 0.
- Server trả kết quả thay đổi; frontend cập nhật đúng danh mục/SN/KPI liên quan. Không gọi refreshAllDataFast để reload toàn app sau mỗi Save.
- Batch read/write, index Map trong lượt xử lý, lazy load và phân trang lịch sử.
- Cache danh mục phải invalidation khi thay đổi; client state có cơ chế làm mới khi stale.
- Không tải tất cả SN/lịch sử khi login hoặc mở form chỉ để kiểm tra trùng.
- Đo trước/sau cùng điều kiện; không báo nhanh hơn bằng số ước lượng.

## DEV / BACKUP / PROD

- Chỉ code và test mutation trên DEV đã xác minh tách biệt code, Sheet, properties, deployment và trigger.
- BACKUP là snapshot nguyên trạng của code + dữ liệu + thông tin cấu hình/triển khai cần phục hồi; không dùng BACKUP để dev.
- Không push/deploy nhầm PROD, không chạy migration/restore/reset trên PROD trong Phase 0–8.
- Phase 9 chuẩn bị đủ bằng chứng DEV, backup mới, migration dry-run, đối soát và rollback trước khi đề nghị chuyển PROD. Chỉ thực hiện cutover sau khi chủ hệ thống cho phép rõ ràng.
- Không xóa V3 trước nghiệm thu. Không xóa dữ liệu người dùng, reset repo hoặc ghi đè thay đổi chưa commit.
- Không đưa dữ liệu thật, thông tin khách hàng, tài khoản hay secrets vào Git.

## Kiểm thử, commit, handoff

- Kiểm thử theo docs/TEST_PLAN.md cho từng phase. Quyền, duplicate, concurrency phải test server trực tiếp, không chỉ nhìn UI.
- Phân biệt PASS, FAIL, NOT RUN, BLOCKED; không suy diễn PASS từ việc code đã viết.
- Chỉ commit phạm vi phase đã kiểm tra, bảo toàn công việc có sẵn. Ghi hash thật; không tạo hash giả.
- Cập nhật MASTER_HANDOFF.md sau mỗi task đáng kể và cuối phiên: đã làm, file đổi, test, commit, lỗi, blocker, việc tiếp theo.
- Nếu handoff nằm trong commit, dùng hash commit triển khai/test trước đó hoặc ghi “commit chứa handoff này” để tránh tự tham chiếu hash không tồn tại.
- Kết phase: báo kết quả ngắn, test và bằng chứng, rủi ro còn lại, commit, phase tiếp theo. Dừng ở ranh giới phase; tiếp tục khi được giao phase kế tiếp.
- Nếu thiếu quyền truy cập hoặc tài nguyên, hoàn tất việc độc lập còn làm được, ghi BLOCKED cho đúng hạng mục; chỉ hỏi thông tin thực sự thiếu. Không hỏi lại quyết định đã chốt.
