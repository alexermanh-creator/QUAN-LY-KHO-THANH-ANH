# ROADMAP — 10 phase, từ 0 đến 9

Đây là lộ trình triển khai duy nhất, thay thế các lộ trình 8/9 phase từng được đề xuất trước. Mỗi phase chia tối đa vài task chính, có test, commit và handoff trước khi chuyển tiếp. Các file code dưới đây là **phạm vi module**, không phải tên file đã xác minh trong repo.

## Điều kiện chung

- Phase trước đã đạt các tiêu chí liên quan; môi trường DEV đã xác minh.
- Đọc phần Blueprint liên quan; chọn file thực tế cần sửa và ghi vào handoff.
- Không mở rộng phạm vi. Phân quyền, audit, chống trùng và hiệu năng làm ngay cùng module; Phase 9 là kiểm thử tổng, không phải lúc mới bổ sung an toàn.
- Test xem [TEST_PLAN.md](docs/TEST_PLAN.md). Bất kỳ test chưa chạy phải ghi NOT RUN.
- “Hoàn thành” nghĩa là có kết quả chạy được trên DEV, bằng chứng, commit và handoff. Tài liệu hoặc code riêng lẻ chưa đủ.

## Phase 0 — Safety

Đầu vào đã có ở gói 1.1: `reference/V3/Quan ly kho.txt` và docs/V3_CODE_RECONCILIATION.md. Task 0.1 dùng mapping 14 phần, xác minh 13 hàm trùng và binding Script–Sheet; không yêu cầu người dùng gửi lại code. Chưa chạy bất kỳ hàm V3 nào trên PROD để khảo sát nếu chưa xét tác dụng ghi.

**Mục tiêu:** có thể phát triển mà không ảnh hưởng vận hành thật.

Task:
1. 0.1 Xác định repo/branch, code V3, Sheet, deployment, properties, triggers và tài nguyên phụ thuộc. Lưu ảnh Dashboard làm chuẩn.
2. 0.2 Backup code + dữ liệu + manifest; tạo DEV độc lập; kiểm tra restore vào bản sao khác và kiểm tra cách ly.
3. 0.3 Snapshot Git, đo baseline V3 trên DEV, ghi handoff.

Phạm vi sửa: cấu hình DEV, báo cáo, tài liệu và snapshot; **chưa sửa nghiệp vụ, chưa tạo schema V4**.

Đầu ra: manifest môi trường/backup, bằng chứng phục hồi/cách ly, baseline UI và hiệu năng, commit.

Đạt khi: DEV không có đường ghi tới PROD; backup mở/khôi phục được; biết rõ code/Sheet nào là PROD, DEV, BACKUP; không bịa số đo. Test E01–E03. Thiếu quyền thì ghi rõ blocker của mục tương ứng, không đánh dấu cả phase xong.

## Phase 1 — Data Model

**Mục tiêu:** cấu trúc V4 và nền tảng ghi dữ liệu có thể phục hồi.

Task:
1. 1.1 Data dictionary: danh mục, SERIAL_MASTER, Header/Detail nhập/xuất, LICH_SU_SERIAL, AUDIT_LOG; chuẩn hóa trạng thái, khóa, kiểu dữ liệu.
2. 1.2 Repository/service: validation, authorization, LockService, version, idempotency và recovery; chứng minh tính nhất quán bằng lỗi giả lập.
3. 1.3 Khung migration: mapping V3, dry-run, checkpoint, báo cáo exception và reconciliation trên DEV.

Phạm vi: schema/data layer/migration; không redesign UI. Khung cho Operations/BH có thể khai báo trước, triển khai đầy đủ ở Phase 7–8.

Đạt khi: khởi tạo schema chạy lại an toàn; không trùng khóa; detail tham chiếu đúng; migration thử chạy lại không nhân bản; lỗi giữa chừng không tạo tồn có thể bán từ giao dịch chưa hoàn tất. Test D01–D04, X03. Ghi rõ các lựa chọn kỹ thuật và quyết định còn mở trước khi module phụ thuộc dùng.

## Phase 2 — Danh mục

Task:
1. 2.1 Model và BH mặc định; NCC; khách hàng; kho; giữ mapping DM_QUY_CHUAN.
2. 2.2 Normalize + unique server dưới lock, sửa, INACTIVE; danh mục cũ vẫn tra được.
3. 2.3 Khóa nút, phản hồi lỗi, cập nhật đúng row/dropdown, cache invalidation.

Phạm vi: danh mục, client state/cache và API liên quan.

Đạt khi: Kho được sửa danh mục; Sale bị chặn ở backend; Song Hùng với khác hoa/thường/khoảng trắng không tạo trùng; 6030 và 6030w khác nhau; bản ghi đã dùng không bị hard-delete; lưu một NCC không reload toàn app. Test M01–M04, A01, P01.

## Phase 3 — Nhập kho

Task:
1. 3.1 Tạo Header + Detail nhiều Model, nhập tay/dán SN và scan barcode/QR liên tục.
2. 3.2 Sửa/hủy theo lịch sử phụ thuộc; sửa lỗi SN có lý do; duy trì timeline/audit.
3. 3.3 Nối UI, duplicate check local/server, LockService, retry an toàn.

Phạm vi: form/danh sách/chi tiết nhập, Serial, transaction service.

Đạt khi: một SN/một detail; trùng trong phiếu hoặc hệ thống bị chặn trước ghi; sửa rộng khi đủ điều kiện; dòng đã có nghiệp vụ sau bị khóa đúng; hủy bỏ hiệu lực tồn mà giữ hồ sơ. Kho thực hiện được. Camera bị từ chối vẫn nhập tay được. Test I01–I06, X01, X03, A01.

## Phase 4 — Xuất kho

Task:
1. 4.1 Chọn khách và snapshot; chọn nhiều SN còn tồn; BH mỗi dòng và bulk chỉ áp dòng chọn.
2. 4.2 Sửa/hủy: đổi khách/ngày/BH có audit; đổi SN bằng hoàn tác cũ + xuất mới; kiểm tra phụ thuộc.
3. 4.3 Kiểm thử hai người, double-submit, mất phản hồi và lỗi ghi giữa chừng.

Phạm vi: form/danh sách/chi tiết xuất, bảo hành khi bán, transaction service.

Đạt khi: cùng phiếu lưu SN BH 12 và 36 tháng đúng riêng; một SN bị người khác xuất thì toàn phiếu bị từ chối trước ghi; hủy hợp lệ trả SN đúng kho/trạng thái và giữ lịch sử; không ghi đè BH của lần xuất sau. Test O01–O06, X01–X03, A01.

## Phase 5 — Tồn kho

Task:
1. 5.1 Search text và filter Model exact-match; nhóm/kho/NCC/loại hàng/tuổi tồn.
2. 5.2 KPI cùng dataset lọc, tuổi tồn, nguồn gốc NCC/phiếu nhập, sort và chọn nhiều.
3. 5.3 Bỏ xóa Serial; chỉ cho hành động hợp lệ, cập nhật cục bộ sau mutation.

Phạm vi: màn hình tồn, API truy vấn và client state. Nút Operations chưa triển khai ở Phase 7 phải ẩn/disable có lý do; không làm thao tác giả.

Đạt khi: chọn 6030 không lấy 6030w; “Tồn” bằng số SN của toàn bộ kết quả lọc, không chỉ trang hiện tại; không có hard-delete; chọn nhiều giữ đúng tập SN. Test S01–S04, P02.

## Phase 6 — Serial 360°

Task:
1. 6.1 Hồ sơ nguồn gốc, hiện trạng, khách, phiếu xuất và BH từng SN.
2. 6.2 Timeline đầy đủ, liên kết phiếu, dấu vết sửa/hủy và sửa mã SN.
3. 6.3 Global search Serial/Model/phiếu/khách hàng; giữ tìm SĐT hiện có.

Phạm vi: tra cứu và điều hướng.

Đạt khi: click Serial từ các bảng mở cùng hồ sơ; timeline không bị mất sau hủy; dữ liệu thiếu do migration được ghi rõ; chọn gợi ý Model áp exact filter. Test R01–R03, A01.

## Phase 7 — Operations

Task:
1. 7.1 Hoàn nhập từng SN tham chiếu phiếu xuất; hàng tốt về tồn, hàng lỗi cách ly/BH.
2. 7.2 Phiếu chuyển kho, trả NCC và lịch sử.
3. 7.3 Kiểm kê: snapshot, scan thực tế, đúng/thiếu/thừa/sai vị trí, điều chỉnh bằng transaction.

Phạm vi: Header + Detail Operations, workflow, UI và tích hợp Serial.

Đạt khi: trả một SN không hủy cả phiếu xuất; chuyển kho không đổi tổng tồn bán được khi chuyển SN IN_STOCK giữa hai kho hợp lệ; trả NCC không xóa SN; scan kiểm kê không tự làm thay đổi tồn. Test B01–B05, X02–X03, A01. Nếu chọn hướng WARRANTY trước Phase 8, ghi yêu cầu chờ xử lý và trạng thái hợp lệ, không giả báo đã có phiếu BH hoàn chỉnh.

## Phase 8 — Bảo hành

Task:
1. 8.1 Tiếp nhận SN, khách, lỗi, tình trạng, thông tin quyền lợi BH của lần xuất liên quan.
2. 8.2 Workflow kiểm tra/xử lý/gửi NCC/nhận về/sẵn sàng trả/hoàn thành.
3. 8.3 Lịch sử thao tác, trả khách, liên kết Serial 360° và kiểm tra quyền.

Phạm vi: phiếu BH, lịch sử BH, trạng thái/vị trí Serial liên quan.

Đạt khi: trạng thái xử lý BH tách khỏi trạng thái Serial và tình trạng còn/hết BH; gửi bảo hành NCC không nhầm với trả hàng thương mại cho NCC; trả khách không biến thành tồn bán; mọi bước có timeline. Test W01–W04, A01, X03.

## Phase 9 — Dashboard + Hardening

Task:
1. 9.1 Nối dữ liệu V4 vào Dashboard cũ, KPI drill-down, giữ bố cục/biểu đồ/quick actions/FIFO.
2. 9.2 Test hồi quy, role, đồng thời, lỗi ghi, performance và backup tự động hàng ngày; so baseline.
3. 9.3 Migration cuối có dry-run/đối soát/rollback; chuẩn bị cutover và xin phép chủ hệ thống khi gói triển khai đã sẵn sàng.

Phạm vi: tích hợp, tối ưu, hardening, migration/cutover có kiểm soát.

Đạt DEV khi: test bắt buộc PASS; không có lỗi mất lịch sử/trùng SN/nửa phiếu/vượt quyền; KPI khớp danh sách; số đo trước/sau cùng điều kiện; backup/restore được kiểm chứng.

Đạt toàn phase khi: có cho phép cutover, backup mới, đối soát migration đạt, chuyển đúng deployment, smoke test thật phù hợp và theo dõi sau chuyển; rollback sẵn sàng. Nếu chưa được phép chuyển PROD, ghi **DEV_READY / WAITING_CUTOVER**, chưa báo V4 đã lên PROD. Test H01–H04 và toàn bộ hồi quy liên quan.

## Definition of Done cuối dự án

- 10 phase có trạng thái và bằng chứng; không có NOT RUN bị che thành PASS.
- Serial → hồ sơ → lịch sử → phiếu đối soát được.
- Kho vận hành đầy đủ theo thiết kế; Sale không mutation.
- Không hard-delete giao dịch, không nửa phiếu, không xuất trùng SN.
- Dashboard giữ trải nghiệm cũ, hiệu năng có số đo.
- Migration bảo toàn nguồn V3; backup và đường rollback được kiểm chứng.
- Không triển khai chức năng ngoài phạm vi.
