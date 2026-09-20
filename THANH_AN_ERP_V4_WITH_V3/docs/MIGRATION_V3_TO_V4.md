# Migration V3 → V4 và phục hồi

Tài liệu thực thi theo phase; **chưa có migration nào được chạy**. Gói 1.1 đã đối chiếu code V3: xem [báo cáo V3](V3_CODE_RECONCILIATION.md) cho cấu trúc 17 cột DATA_THIET_BI và các bảng liên quan. Vẫn phải kiểm tra Sheet thật trước migration; code không chứng minh dữ liệu thực tế sạch/đủ.

## 1. Ba môi trường

| Môi trường | Mục đích | Yêu cầu |
|---|---|---|
| PROD | V3 đang vận hành; sau cutover là V4 đã nghiệm thu | Không phát triển/thử ghi trực tiếp |
| BACKUP | Snapshot code + dữ liệu để phục hồi | Bảo toàn nguyên trạng, kiểm tra khả năng phục hồi |
| DEV | Phát triển, migration thử, test | Script và Sheet riêng, cấu hình không trỏ PROD |

Copy Sheet không đồng nghĩa đã backup mọi deployment, properties, trigger hoặc tài nguyên Drive liên quan. Liệt kê và xác minh từng thành phần cần phục hồi.

## 2. Phase 0 — Checklist backup và DEV

- [ ] Xác định repo/branch/commit và code đang chạy thực tế; ghi nhận khác biệt nếu có.
- [ ] Xác định Spreadsheet ID, Script ID, deployment/version, timezone, properties, triggers, người sở hữu/quyền và thư mục backup.
- [ ] Snapshot toàn bộ Sheet có dữ liệu, code Apps Script, manifest và cấu hình cần thiết.
- [ ] Ghi thời điểm snapshot, danh sách sheet/số dòng, nơi lưu, quyền truy cập và checksum cho file export nếu có.
- [ ] Không lưu secrets/USERS/dữ liệu khách vào repo; manifest repo chỉ ghi tham chiếu nơi lưu có kiểm soát.
- [ ] Kiểm tra mở bản backup và restore thử vào tài nguyên tạm riêng; so dữ liệu và chạy smoke test chỉ trên bản phục hồi.
- [ ] Tạo DEV từ snapshot, cấu hình lại mọi ID/đường ghi; kiểm tra code dùng active sheet lẫn openById.
- [ ] Kiểm kê trigger DEV; vô hiệu hóa/chỉnh trên DEV các trigger có thể ghi/gửi tới tài nguyên PROD.
- [ ] Xác minh deployment DEV dùng code DEV và Sheet DEV; hiện nhãn DEV rõ ràng.
- [ ] Test ghi đánh dấu trên DEV; xác minh chỉ DEV thay đổi, PROD không đổi.
- [ ] Giữ BACKUP nguyên trạng; không dùng làm dữ liệu thử nghiệm.
- [ ] Lưu ảnh Dashboard và baseline V3 trên DEV với bộ dữ liệu tương đương.

Manifest tối thiểu: thời gian; môi trường; code revision; spreadsheet/script/deployment reference; danh sách sheet/số dòng; cấu hình/triggers cần phục hồi; người xác minh; bằng chứng restore; dữ liệu còn thiếu. Giá trị chưa biết để CHƯA XÁC ĐỊNH.

## 3. Mapping nguồn → đích dự kiến

| Nguồn V3 | Đích V4 | Việc cần kiểm tra |
|---|---|---|
| DM_SAN_PHAM | DM_SAN_PHAM | ID ổn định, Model normalize unique, BH mặc định thiếu |
| DM_NCC | DM_NCC | NCC trùng tên tắt, mapping alias sang ID, giữ tham chiếu cũ |
| DM_KHACH_HANG | DM_KHACH_HANG | Không tự gộp khách trùng tên/SĐT |
| DM_QUY_CHUAN | DM_QUY_CHUAN hoặc mapping cấu hình tương đương | Giữ loại hàng/nhóm/kho/quy chuẩn đang được dùng |
| DATA_THIET_BI | SERIAL_MASTER | SN text, trạng thái, nguồn nhập, kho, lần xuất/BH |
| LICH_SU_NHAP | PHIEU_NHAP + CT_PHIEU_NHAP | Tách chuỗi SN khi parse chắc chắn; đối soát số lượng/Model |
| LICH_SU_XUAT | PHIEU_XUAT + CT_PHIEU_XUAT | Snapshot khách, ngày xuất, BH từng SN |
| Nguồn BH nếu có | PHIEU_BAO_HANH / lịch sử BH | Xác minh cấu trúc thực tế, không suy từ thời hạn BH thành phiếu xử lý |
| USERS | USERS / cấu trúc xác thực đã chọn | Giữ mapping role, không đưa credential thô vào Git/log |
| CAU_HINH | Cấu hình V4 | Tên xác minh từ code; tách ID theo môi trường |
| NHAT_KY_HOAT_DONG | AUDIT_LOG hoặc kho lịch sử legacy có liên kết | Tên nguồn xác minh từ code; không bịa before/after mà nguồn không có |
| Backup / sheet khác nếu có | Bảo toàn nguồn và mapping tương ứng | Không bỏ chỉ vì không xuất hiện trong bảng này |

Danh mục kho DM_KHO lấy từ nguồn kho hiện tại đã được xác minh. Không tự coi tên minh họa KHO_VP/KHO_BH là dữ liệu kho thật.

## 4. Dry-run và dữ liệu không đủ

1. Chụp snapshot nguồn dùng cho lượt thử; ghi batch_id và schema_version.
2. Đọc nguồn không thay đổi; profile duplicate, trường thiếu, enum lạ, sai FK và ngày không hợp lệ.
3. Sinh mapping ID và báo cáo dự kiến **không ghi dữ liệu đích**.
4. Phân loại: chuyển được; cần xác nhận; không thể tự chuyển.
5. Chỉ chạy migration vào DEV sau khi có mapping và cách xử lý exception.
6. Lưu source_sheet/source_row/source_key để mỗi bản ghi truy về nguồn.
7. Chạy lại cùng batch/source_key không nhân bản phiếu/SN/event; resume từ checkpoint an toàn.

Không suy diễn lịch sử không có bằng chứng:
- Có trạng thái “Đã xuất” nhưng không tìm thấy phiếu thì ghi exception/nguồn gốc thiếu; không bịa mã phiếu, ngày hay khách.
- Chuỗi SN không parse chắc chắn không được đoán bằng việc cắt mọi dấu phẩy hoặc khoảng trắng.
- V3 có BH cấp phiếu nhưng dữ liệu từng SN khác nhau: báo xung đột, không lấy BH Model hiện tại để ghi đè.
- Timeline tái dựng có nhãn migration và nguồn. Sự kiện mở đầu theo snapshot, nếu được chấp nhận, phải ghi rõ là số dư/trạng thái chuyển đổi, không giả làm lịch sử gốc.
- Giữ nguyên nguồn V3 và báo cáo dữ liệu loại trừ. Không “dọn sạch” bằng xóa duplicate mà không có mapping.
- Không bỏ qua lỗi nghiệp vụ để làm đủ tỷ lệ migration. Vấn đề chưa giải quyết phải hiện trên báo cáo và có hướng xử lý trước cutover.

## 5. Đối soát

- [ ] Số SN duy nhất và tổng theo từng trạng thái trước/sau.
- [ ] Số tồn theo Model, kho, NCC và loại hàng; khác biệt có giải thích.
- [ ] Header/Detail: số phiếu, số dòng từng phiếu, SN không mồ côi, khóa không trùng.
- [ ] Mỗi SN có trạng thái/vị trí phù hợp các giao dịch hiệu lực.
- [ ] Snapshot khách và BH từng SN đối chiếu nguồn.
- [ ] Timeline/audit bảo toàn dấu vết; event migration phân biệt với event vận hành.
- [ ] Danh mục trùng đã được mapping; không mất liên kết phiếu.
- [ ] Role và cấu hình môi trường đúng; không kéo ID PROD vào DEV.
- [ ] Chạy lại migration không tăng số dòng do trùng.
- [ ] KPI Dashboard/drill-down khớp dữ liệu đã chuyển.

Không đặt tỷ lệ “99% đủ” cho mất SN/giao dịch. Mọi chênh lệch phải giải thích, xử lý hoặc được chủ hệ thống chấp nhận rõ với phạm vi dữ liệu.

## 6. Phase 9 — Cutover

Chỉ chuẩn bị trong các phase trước; chưa được coi là cho phép triển khai PROD.

1. DEV đạt test và đối soát; chốt gói code/schema/migration/rollback, danh sách exception đã xử lý.
2. Chủ hệ thống cho phép thời điểm chuyển đổi. Thống nhất cửa sổ ngừng ghi để không bỏ sót giao dịch mới.
3. Khóa đường ghi V3 trong cửa sổ chuyển; tạo backup mới nhất code + dữ liệu + cấu hình. Nếu nguồn vẫn tiếp tục đổi, dừng và giải quyết trước khi migrate.
4. Migration nguồn cuối vào đích đã xác định; đối soát trước khi mở ghi cho người dùng.
5. Chuyển deployment/cấu hình đã duyệt; kiểm tra đúng IDs, quyền và triggers.
6. Smoke test theo role với kịch bản được kiểm soát; kiểm tra Dashboard/tra cứu và chức năng backup.
7. Mở vận hành khi đạt; theo dõi lỗi/transaction dở và đối soát sau chuyển. Ghi người thực hiện, thời gian và bằng chứng.
8. Giữ V3 và backup theo kế hoạch lưu trữ; chưa xóa nguồn cũ.

## 7. Rollback

Điều kiện kích hoạt: mất/trùng SN, sai tồn, phiếu dở chưa phục hồi, vượt quyền hoặc lỗi chặn vận hành không thể sửa an toàn trong cửa sổ.

- Dừng các writer/trigger liên quan; chụp snapshot trạng thái lỗi và journal.
- Xác định đã có giao dịch thật trên V4 sau cutover hay chưa.
- Nếu chưa có: phục hồi code/deployment/config và dữ liệu theo backup đã kiểm tra.
- Nếu đã có: không ghi đè bằng backup cũ rồi làm mất giao dịch mới. Xuất phần giao dịch phát sinh, đối soát và lập kế hoạch chuyển lại/replay có kiểm soát trước khi mở ghi.
- Kiểm tra số tồn, SN, phiếu, quyền, triggers và backup sau phục hồi.
- Ghi nguyên nhân, giao dịch bị ảnh hưởng, kết quả và quyết định mở lại hệ thống vào handoff.

Restore thử ở Phase 0 và rehearsal migration ở DEV là bằng chứng bắt buộc, không thay bằng “đã có file backup”.
