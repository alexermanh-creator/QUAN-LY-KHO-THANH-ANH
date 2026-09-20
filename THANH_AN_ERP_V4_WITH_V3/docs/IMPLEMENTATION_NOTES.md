# Ghi chú triển khai, tính nhất quán và các điểm còn mở

## 1. Cách đọc

**ĐÃ CHỐT**: quy tắc nghiệp vụ trong PROJECT_OVERVIEW.md và Blueprint cuối cuộc trò chuyện.

**BỔ SUNG KỸ THUẬT**: phương án dưới đây giúp ANTI triển khai đúng các quy tắc đó, không phải lời khẳng định người dùng đã duyệt từng tên cột/API. ANTI có thể chọn cách tương đương, ghi quyết định kỹ thuật và bằng chứng test; không được làm yếu bất biến.

**CẦN XÁC NHẬN**: quyết định nghiệp vụ còn thiếu. Ghi trong handoff; chỉ dừng phần phụ thuộc, không chặn khảo sát/backup Phase 0.

## 2. Quy ước dữ liệu bổ sung

- ID nội bộ ổn định là text; mã phiếu hiển thị unique và không đổi khi sửa ngày. Mẫu PN-260916-001 chỉ là ví dụ, chưa là format bắt buộc.
- Số thứ tự dòng Sheet không phải ID. Header 1–n Detail; mỗi detail một SN, số lượng thiết bị suy ra từ các dòng hiệu lực.
- Tham chiếu bằng ID; trường model/tên trong giao dịch là snapshot nếu cần bảo toàn thông tin thời điểm lập. Không tự đổi phiếu cũ khi danh mục thay đổi.
- Serial/Model/mã kho/SĐT lưu text, bảo toàn số 0 đầu. Serial normalize tối thiểu trim + uppercase; không tự xóa dấu gạch, ký tự nội bộ hoặc đổi O thành 0.
- Model exact-match theo product_id hoặc khóa normalize thống nhất. Không bỏ hậu tố W/DW để “gộp” Model.
- NCC kiểm unique tên tắt normalize (trim, chuẩn hóa khoảng trắng, hoa/thường). Khách hàng chưa chốt khóa unique; không gộp hai khách chỉ vì trùng tên hoặc dùng chung SĐT.
- Ngày nghiệp vụ và timestamp hệ thống tách nhau; thống nhất timezone Sheet/Script/UI sau khi kiểm tra cấu hình thật.
- Mọi bản ghi quan trọng có version hoặc tương đương để phát hiện màn hình cũ; timestamps/actor sinh phía server.
- Danh mục ACTIVE/INACTIVE; khi chọn mới chỉ hiện ACTIVE, phiếu cũ vẫn hiển thị danh mục INACTIVE.

### Phần schema cần bổ sung ở Phase 1

Blueprint đã liệt kê trường nghiệp vụ chính. Lập data dictionary thực tế gồm tên cột, kiểu, bắt buộc/null, default, khóa, FK, enum, validation và mapping V3 cho **tất cả** bảng trước khi sử dụng.

| Nhóm | Bổ sung kỹ thuật đề xuất |
|---|---|
| SERIAL_MASTER | device_id ổn định nếu cần sửa mã SN; serial_normalized; record_status ACTIVE/INACTIVE tách khỏi current_status; version; last_transaction_id |
| Header/Detail | version; transaction_id; hiệu lực dòng hoặc revision để giữ detail cũ khi sửa; khóa tham chiếu ổn định |
| LICH_SU_SERIAL | transaction_id; sequence; effective_at nếu khác event_time; old/new serial khi correction; liên kết event bị hoàn tác |
| AUDIT_LOG | request_id/transaction_id; lý do; before/after theo diff; không chứa secrets |
| Kho, quy chuẩn | khóa normalize, ACTIVE/INACTIVE; created/updated metadata |
| Idempotency/recovery | nhật ký bền vững request/transaction; không chỉ cache tạm |
| Migration | batch_id, schema_version, source_sheet/source_row/source_key, trạng thái và exception |

Việc thêm device_id không thay đổi nguyên tắc SN duy nhất: SN vẫn là khóa nghiệp vụ. Nếu không dùng device_id, ANTI phải chứng minh cơ chế alias/liên kết tương đương không làm đứt lịch sử khi sửa SN.

### Các bảng Operations và bảo hành

Tên dưới đây là **đề xuất thống nhất** để hoàn thiện các detail chưa được đặt tên trong Blueprint:

| Bảng | Trường tối thiểu ngoài metadata/version/transaction |
|---|---|
| CT_HOAN_NHAP | line_id, return_no, serial, original_export_line_id, action_after_return, receiving_warehouse_id, condition, reason |
| CT_TRA_NCC | line_id, supplier_return_no, serial, original_receipt_no, from_warehouse_id |
| CT_CHUYEN_KHO | line_id, transfer_no, serial, from_warehouse_id, to_warehouse_id |
| PHIEU_KIEM_KE | count_id, count_no, warehouse_id, snapshot_time, status, created_by, created_at, confirmed_by, confirmed_at |
| CT_KIEM_KE | line_id, count_no, serial, expected_warehouse, observed_warehouse, expected_status, observed_at, discrepancy, resolution_transaction_id |
| LICH_SU_BAO_HANH | event_id, warranty_ticket_no, serial, from_processing_status, to_processing_status, supplier_id, location, result, actor, event_time |

PHIEU_BAO_HANH theo bản chốt là **một phiếu cho một Serial**, không tự thêm phiếu gom nhiều máy. Bổ sung tham chiếu chi tiết xuất, ngày gửi/nhận/trả, kết quả xử lý và trạng thái/vị trí trước tiếp nhận khi cần để phục hồi đúng.

Các phiếu nhiều SN đều Header + Detail. Workflow trả NCC/BH có bước xử lý riêng; không dùng chung enum CONFIRMED/CANCELLED để thay cho trạng thái xử lý. Chốt enum kỹ thuật từng bảng trước khi code module.

## 3. Trạng thái và hoàn tác

Tách ba trục: **hiệu lực bản ghi**; **trạng thái nghiệp vụ SN**; **trạng thái xử lý phiếu**. Hủy nhập không được gán RETURNED_SUPPLIER hay ADJUSTED_OUT chỉ vì muốn bỏ khỏi tồn.

| Nghiệp vụ | Điều kiện chính | Kết quả có hiệu lực |
|---|---|---|
| Nhập mới | SN chưa tồn tại theo khóa toàn hệ thống, danh mục hợp lệ | Hồ sơ ACTIVE, IN_STOCK tại kho nhập |
| Xuất | ACTIVE + IN_STOCK tại kho hợp lệ, không bị giữ bởi giao dịch dở | EXPORTED; snapshot khách/BH theo detail |
| Hủy nhập | Phiếu còn hiệu lực, không có phụ thuộc cản trở | Phiếu CANCELLED, SN INACTIVE khỏi tồn; giữ mọi lịch sử |
| Hủy xuất | Lần xuất đang có hiệu lực, chưa có phụ thuộc cản trở | Hoàn trạng thái/kho trước xuất; điều chỉnh con trỏ khách/BH về dữ liệu còn hiệu lực |
| Chuyển kho | SN có tại kho nguồn, đích hợp lệ, đủ điều kiện | Đổi kho qua transaction; không tạo thiết bị mới |
| Khách trả | Đúng SN của detail xuất, chưa hoàn trùng | IN_STOCK hoặc QUARANTINE/WARRANTY theo đánh giá |
| Trả NCC | SN thuộc nguồn phù hợp và chưa có phụ thuộc cản trở | WAIT_RETURN_SUPPLIER → RETURNED_SUPPLIER |
| Kiểm kê | Có chênh lệch đã xác nhận và lý do | Transaction điều chỉnh; thiếu có thể ADJUSTED_OUT |
| Nhận BH | Có thiết bị và nguồn quyền lợi được xác minh | WARRANTY; lưu chủ sở hữu/vị trí trước nhận |
| Trả BH cho khách | Phiếu BH đủ điều kiện hoàn tất | EXPORTED/ở khách; không cộng vào tồn bán |

RETURNED_CUSTOMER là trạng thái trong Blueprint nhưng thời điểm sử dụng cần chốt: có thể là bước tiếp nhận trước phân loại. Không triển khai đồng thời hai luồng mâu thuẫn; xem mục 8.

**Tồn bán được** chỉ gồm SN có hiệu lực, IN_STOCK, không nằm trong giao dịch chưa hoàn tất. Hàng BH/cách ly/chờ trả NCC phải hiện riêng nếu có mặt vật lý, không trộn vào số tồn bán.

### Quy tắc sửa/hủy chi tiết

- Kiểm tra quyền, version phiếu, lịch sử và tất cả SN bị ảnh hưởng dưới lock.
- Nhập chưa có nghiệp vụ sau: sửa ngày/NCC/kho/loại hàng/ghi chú/Model/SN, thêm/bớt dòng; bản cũ phải truy vết được.
- Nhập đã xuất một phần: có thể sửa dòng chưa bị ràng buộc nếu không làm thay đổi dòng bị khóa. Trường Header chung tác động cả phiếu phải bị khóa hoặc đi qua nghiệp vụ điều chỉnh đã xác định; không “sửa mỗi header” rồi bỏ detail mâu thuẫn.
- SN đã xuất rồi hoàn về tồn vẫn có lịch sử; không tự mở khóa sửa nhập chỉ vì current_status lại là IN_STOCK.
- Sửa xuất: đổi snapshot khách/ngày/BH phải kiểm tra phụ thuộc; ghi before/after và tính lại dữ liệu liên quan. Không âm thầm sửa phiếu BH đã lập.
- Đổi A → B trên xuất: A phải được hoàn tác hợp lệ, B phải còn tồn; validate cả hai trước ghi. Giữ detail A bằng revision/superseded, không overwrite A thành B.
- Hủy cả phiếu chỉ thành công nếu **tất cả** dòng đủ điều kiện. Có một dòng cản trở thì từ chối cả phiếu, nêu SN/lý do và hướng nghiệp vụ phù hợp. Khách trả một máy dùng hoàn nhập.
- Phiếu CANCELLED không sửa/hủy lại như phiếu còn hiệu lực; retry của cùng thao tác trả kết quả cũ.
- Sửa lỗi SN yêu cầu lý do, kiểm unique cả SN hiệu lực/không hiệu lực và alias; giữ SN cũ trong lịch sử, liên kết cùng thiết bị. Không sửa chuỗi toàn bộ lịch sử để làm mất tên SN cũ.
- Không tái tạo thiết bị mới với SN vừa hủy nhập. Chính sách tái kích hoạt/tái nhập SN cũ chưa chốt phải được xử lý riêng.

### Tên sự kiện thống nhất

Dùng IMPORT, EDIT_RECEIPT, CANCEL_RECEIPT; EXPORT, EDIT_EXPORT, CANCEL_EXPORT, RETURN_TO_STOCK; RETURN_CUSTOMER, TRANSFER, RETURN_SUPPLIER; WARRANTY_RECEIVE, WARRANTY_SEND_SUPPLIER, WARRANTY_RETURN, WARRANTY_COMPLETE; INVENTORY_ADJUSTMENT, SERIAL_CORRECTION.

Blueprint nháp từng lẫn CANCEL_IMPORT/CANCEL_RECEIPT và EDIT_IMPORT/EDIT_RECEIPT. Bộ này dùng tên RECEIPT cho sửa/hủy nhập. Mapping dữ liệu cũ nếu có, không đổi/xóa event gốc.

CANCEL_EXPORT và RETURN_TO_STOCK có thể là hai event liên kết cùng transaction, nhưng chỉ có **một lần tác động trạng thái/tồn**. Không đếm hai event thành hai máy.

## 4. Chống double-submit, lock và lỗi ghi dở

**Đã chốt:** khóa nút + duplicate validation server + LockService, đọc lại dữ liệu thật, không ghi nửa phiếu, audit server.

**Thiết kế kỹ thuật bổ sung đề xuất:**

1. Client sinh request_id cho một thao tác; disable nút đồng bộ ngay. Retry cùng thao tác giữ cùng request_id.
2. Server kiểm session/quyền và payload; nhận lock dùng chung cho các writer của cùng ứng dụng.
3. Kiểm tra journal: cùng request_id + payload đã commit thì trả kết quả cũ; payload khác bị từ chối; request đang xử lý phải trả trạng thái rõ ràng.
4. Đọc dữ liệu thật dưới lock; kiểm version, duplicate, trạng thái, dependencies của toàn phiếu.
5. Tạo transaction_id, kế hoạch thay đổi và before-image; lưu journal bền vững trước khi áp dụng thay đổi.
6. Ghi theo batch có liên kết transaction; hoàn tất Header/Detail/Serial/history/audit.
7. Đánh dấu COMMITTED khi dữ liệu đầy đủ, sau đó trả patch và version mới cho UI.
8. Bảo đảm flush/hoàn tất ghi cần thiết trước release; release trong finally. Timeout lấy lock không được tiếp tục ghi không khóa.

LockService ngăn chồng lấn vùng code; ScriptLock bảo vệ các lượt chạy trong cùng script, UserLock chỉ khóa theo user và không đủ cho hai người cùng xuất. DocumentLock có thể null trong web app. Các writer ở script khác hoặc sửa Sheet thủ công không tự được bảo vệ bởi ScriptLock; kiến trúc phải gom writer và giới hạn đường ghi ngoài ứng dụng. [Google LockService](https://developers.google.com/apps-script/reference/lock/lock-service).

**Không coi việc có lock hoặc batch write là bằng chứng có transaction rollback nhiều bảng.** Phải thiết kế recovery ở ứng dụng và kiểm thử lỗi tại từng bước.

Yêu cầu recovery (có thể chọn cơ chế tương đương):
- Journal PREPARED/APPLYING/COMMITTED/RECOVERY_REQUIRED, đủ before/after và kết quả idempotent.
- Reader không trình bày thay đổi chưa commit như giao dịch thành công; writer khác không dùng SN đang có transaction dở.
- Khi lỗi: hoàn tác hoặc hoàn tất theo journal có kiểm tra version; không ghi đè thay đổi mới hơn. Nếu chưa tự phục hồi được, khóa các SN liên quan và báo cần phục hồi.
- Lần chạy tiếp theo phải phát hiện transaction dở; không dựa vào catch/finally vì tiến trình có thể bị dừng đột ngột.
- Hồi phục tạo log, không xóa chứng cứ. Mất phản hồi sau COMMITTED phải truy vấn lại bằng request_id, không tạo phiếu khác.
- Nếu thiết kế ban đầu không bảo đảm reader nhất quán, dùng khóa bảo trì ghi/đọc nghiệp vụ bị ảnh hưởng đến khi phục hồi; không trả số tồn sai.
- Tính nhất quán journal và audit cũng phải kiểm thử; không được báo success trước khi ghi audit cần thiết hoàn tất.

## 5. Bảo hành và dữ liệu lịch sử

- Detail xuất là nguồn điều khoản bảo hành của từng lần bán. SERIAL_MASTER chỉ phản ánh lần đang có hiệu lực.
- Theo thiết kế, ngày bắt đầu BH là ngày xuất; đổi ngày xuất phải tính lại BH từng detail và kiểm phụ thuộc.
- Đổi mặc định BH Model không thay đổi phiếu đã lập; bulk chỉ cập nhật dòng được chọn, không thay toàn phiếu.
- Snapshot khách lưu tại Header; không lấy danh mục hiện tại để thay ngược lịch sử.
- Ngày cuối tháng, không BH, khoảng hợp lệ và chính sách xuất lại sau khách trả cần xác nhận tại mục 8.
- Bảo hành tiếp nhận/trả khách là dịch vụ của máy đã bán; gửi NCC bảo hành không đồng nghĩa trả NCC thương mại.

## 6. Hiệu năng có thể nghiệm thu

Giảm các lần gọi dịch vụ, gom read/write và dùng cache khi phù hợp là hướng dẫn chính thức của Google. Bộ tài liệu áp dụng hướng đó vào V4, không cam kết một mức thời gian chưa đo. [Google Apps Script best practices](https://developers.google.com/apps-script/guides/support/best-practices).

- Save trả object/patch đã commit; client cập nhật đúng row/SN, giữ tab/filter/scroll.
- Không gọi audit riêng từ client sau xuất; không reload toàn app sau lưu.
- Build Map Serial/Model trong lượt đọc, tránh lặp SN × toàn bộ bảng.
- Lazy load theo module; lịch sử lớn phân trang. Khi phân trang, KPI phải tính toàn bộ tập lọc phía server hoặc từ tập đầy đủ, không đếm riêng trang hiện tại.
- Cache danh mục có version/TTL và invalidation sau Save; không cache quyết định xuất.
- Form không cần tải toàn bộ SN để chống trùng: check local trong phiếu và validate server khi submit.
- Patch sau mutation phải chống áp hai lần cùng request; không cứ retry là trừ KPI thêm lần nữa.
- Khi người khác đổi dữ liệu, có làm mới giới hạn theo module/version, hiển thị trạng thái stale khi cần. Không hứa realtime nếu chưa triển khai.

Baseline ghi dataset, số SN/phiếu, trình duyệt/thiết bị/mạng, cold/warm load, số lần thử, thời gian tổng/server/render, số request và số thao tác Sheet. Đo lặp cùng kịch bản; báo median và p95 nếu đủ mẫu. Mục tiêu số giây cụ thể phải đặt sau baseline, không dùng ước lượng cuộc trò chuyện làm SLA.

## 7. Phân quyền và hardening

| Quyền | Admin | Kho | Sale |
|---|---|---|---|
| Dashboard | Có | Có | Chưa chốt |
| Xem tồn / Serial / BH | Có | Có | Có |
| Tạo/sửa/hủy nhập, xuất | Có | Có | Không |
| Hoàn nhập/chuyển/trả NCC/kiểm kê | Có | Có | Không |
| Xử lý BH | Có | Có | Không |
| Danh mục | Có | Có | Không |
| User/cấu hình/backup/restore | Có | Không | Không |
| Hard-delete giao dịch | Không | Không | Không |

Role phải được xác minh server-side cho từng endpoint, kể cả gọi trực tiếp bỏ qua UI. Giới hạn dữ liệu trả về theo quyền; dữ liệu tra cứu không kéo theo USERS hoặc secrets.

Đã xác minh trên bản TXT V3: getCaiDatData trả danh sách users có mật khẩu; đăng nhập so sánh tại client; mutation được kiểm tra chưa có xác thực role/session server; có giá trị seed/reset nhúng trong nguồn. Xem V3_CODE_RECONCILIATION.md để có số dòng, không đưa giá trị bí mật vào báo cáo. Chưa xác minh deployment đang dùng đúng bản này hoặc mức truy cập công khai. Nền xác thực/authorization phải làm ở Phase 1, kiểm từng module, không để đến Phase 9. Escape dữ liệu hiển thị, bảo vệ endpoint và không thêm Factory Reset vào phạm vi V4.

## 8. Quyết định cần xác nhận trước phần phụ thuộc

| ID | Chưa chốt | Khi cần | Đề xuất để người dùng cân nhắc, chưa mặc định |
|---|---|---|---|
| Q01 | BH ngày cuối tháng/năm nhuận; ngày hết hạn có tính hết ngày; 0 tháng; giới hạn tháng | Trước hoàn tất Phase 4 | Cộng tháng lịch, chặn ở ngày cuối tháng đích; 0 = không BH; không dùng ngày cố định × 30 |
| Q02 | BH khi hoàn nhập rồi xuất lại; giữ/reset thời hạn và quyền override ngày bắt đầu | Phase 4 thiết kế, Phase 7 nghiệp vụ | Lưu từng lần xuất; không tự reset quyền lợi cũ |
| Q03 | Tuổi tồn khi khách trả; KPI dùng ngày nhập gốc hay lần vào kho gần nhất | Phase 5, trước Phase 7 | Giữ cả ngày gốc và ngày vào kho gần nhất; chốt một định nghĩa cho KPI |
| Q04 | Khóa unique khách hàng; tên giống/SĐT dùng chung | Phase 2 | Chống gửi lặp theo request trước; cảnh báo trùng, không tự gộp khách |
| Q05 | Sửa trường nào khi có giao dịch phụ thuộc; cách xử lý điều chỉnh chuỗi | Phase 3–4 | Khóa trường tác động lịch sử, cho metadata không ảnh hưởng có audit; không tự cascade |
| Q06 | Nhập lại SN đã hủy/trả NCC; SN sai được sửa nhưng mã cũ có tái sử dụng không | Phase 3/7 | Không tạo thiết bị thứ hai; quy trình tái kích hoạt riêng có truy vết |
| Q07 | RETURNED_CUSTOMER có là bước trung gian; phân loại tốt/lỗi và chuyển BH | Phase 7 | Chốt trạng thái trung gian hoặc phân loại ngay, không song song hai cách |
| Q08 | Xử lý thiếu/thừa kiểm kê, SN chưa có nguồn gốc, xác nhận chênh lệch | Phase 7 | Ghi exception, không tự tạo nguồn nhập giả hoặc tự giảm tồn chỉ do scan thiếu |
| Q09 | Sale được Dashboard nào; phạm vi thông tin khách/NCC được xem | Trước nghiệm thu quyền Phase 9 | Chỉ cấp ba quyền xem đã chốt, mở rộng khi được yêu cầu |
| Q10 | Hủy phiếu BH từng giai đoạn; đổi máy/đổi SN khi bảo hành | Phase 8 | Không coi CANCELLED là đủ để tự trả trạng thái; đổi máy chưa có đặc tả |
| Q11 | Tên/ID/schema V3, timezone, deployment, thư viện scan, giới hạn batch và SLA | Khảo sát Phase 0–1 | Xác minh thực tế, ANTI quyết kỹ thuật có căn cứ; không cần hỏi lại nếu repo đã rõ |
| Q12 | Giữ/tắt tự sinh SN nội bộ khi hàng không có SN hãng | Trước Phase 3 | V3 có generateAutoSerials; không tự bỏ chức năng, nếu giữ phải chống cấp trùng và phân biệt SN nội bộ |

Gói 1.1 đã làm rõ một phần Q11: code dùng CAU_HINH, NHAT_KY_HOAT_DONG, getActiveSpreadsheet và định dạng GMT+7. ID/binding/timezone cấu hình thật vẫn cần kiểm tra. Q09 có bằng chứng hành vi V3: Sale không thấy Dashboard; giữ mặc định ba quyền xem đã chốt, không tự mở Dashboard cho Sale.

ANTI ghi câu trả lời và ngày chốt vào handoff, cập nhật Blueprint/notes liên quan. Không cần hỏi đồng loạt ngay ngày đầu.
