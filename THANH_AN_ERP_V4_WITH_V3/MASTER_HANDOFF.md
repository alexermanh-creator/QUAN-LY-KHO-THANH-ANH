# MASTER HANDOFF — THÀNH AN ERP V4

Cập nhật: 16/09/2026 · Gói v1.1 — code V3 đã tích hợp

## Trạng thái xác thực

| Mục | Trạng thái |
|---|---|
| Tài liệu khởi động | Đã soạn từ cuộc trò chuyện thiết kế |
| Phase hiện tại | **Phase 0 — NOT STARTED** |
| Task tiếp theo | 0.1 — Đọc báo cáo V3, xác minh cấu trúc hàm trùng và tài nguyên PROD cần backup |
| Code V3 tham chiếu | ĐÃ CÓ: reference/V3/Quan ly kho.txt, kiểm tra SHA-256 trùng nguồn |
| Repo / branch | CHƯA XÁC ĐỊNH |
| Commit triển khai gần nhất | CHƯA CÓ THÔNG TIN |
| PROD Spreadsheet / Script / Deployment | CHƯA XÁC ĐỊNH |
| BACKUP dữ liệu / code / manifest | CHƯA TẠO HOẶC CHƯA XÁC MINH |
| DEV Spreadsheet / Script / Deployment | CHƯA TẠO HOẶC CHƯA XÁC MINH |
| Test ERP V4 | NOT RUN |
| Migration V3 → V4 | NOT RUN |
| Cho phép cutover PROD | CHƯA CÓ |

**Không đánh dấu Phase 0 hoàn tất chỉ vì đã có bộ tài liệu này.**

## Những gì đã hoàn thành

- Tổng hợp thiết kế, quy tắc ANTI, roadmap 10 phase và prompt bắt đầu.
- Chốt theo yêu cầu: Dashboard giữ nguyên, Serial trung tâm, phiếu Header + Detail, sửa/hủy nhập/xuất, Kho có quyền sửa/hủy, BH từng SN, exact Model, chống trùng, LockService, hiệu năng và ba môi trường.
- Các đề xuất cũ về in/PDF và roadmap ít phase hơn đã được loại khỏi phạm vi hiện hành.
- Không thực hiện sửa code ERP, backup, deploy hoặc thao tác dữ liệu thật trong lúc soạn tài liệu.

## Nguồn đã có / chưa có

Nguồn thiết kế: cuộc trò chuyện “Phân tích hệ thống kho” và yêu cầu đóng gói ngày 16/09/2026. Đã đọc các trang lịch sử đến đầu cuộc trò chuyện.

Người dùng đã cung cấp đường dẫn `C:\Projects\Quan Ly Kho Thanh An\Quan ly kho.txt`. Gói 1.1 chứa bản sao nguyên gốc tại `reference/V3/Quan ly kho.txt`, 180.925 byte, 3.152 dòng, 14 phần code. Đã đối chiếu tĩnh và ghi mapping/bằng chứng trong [V3_CODE_RECONCILIATION.md](docs/V3_CODE_RECONCILIATION.md). Không yêu cầu gửi lại code.

Phát hiện 13 tên hàm backend khai báo hai lần; cần xác minh cấu trúc đang chạy trước dựng DEV. Đã có client state/chuyển tab cục bộ, nút xuất đã disable; chưa có LockService/CacheService trong tệp. Tên sheet cấu hình/log xác minh từ code là CAU_HINH và NHAT_KY_HOAT_DONG. Chưa có snapshot Sheet, appsscript.json, Script ID, deployment hoặc ảnh baseline thực tế; chưa xác minh bản TXT trùng code PROD.

## Bước tiếp theo — Phase 0

1. Đọc bộ tài liệu theo PROJECT_OVERVIEW.md.
2. Đọc báo cáo V3, xác định repo, trạng thái Git, cách giải quyết hàm trùng và tài nguyên PROD bằng bằng chứng thực tế. Giữ nguyên reference; không chạy hàm có tác dụng ghi chỉ vì tên giống hàm đọc.
3. Backup dữ liệu + code + cấu hình cần phục hồi; ghi vào manifest trong nơi lưu trữ phù hợp.
4. Tạo DEV riêng; xác minh tất cả đường ghi chỉ đến DEV; kiểm tra trigger không ghi về PROD.
5. Tạo snapshot Git an toàn, không đưa secrets/dữ liệu thật vào repo.
6. Lưu baseline Dashboard và hiệu năng. Nếu chưa thể đo thì đánh dấu NOT RUN, không điền số giả.
7. Hoàn thành báo cáo Phase 0, commit và cập nhật handoff. Chưa sửa nghiệp vụ.

## Điểm còn mở

Xem [IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md), mục “Quyết định cần xác nhận”. Không điểm nào ngăn soạn tài liệu hay khảo sát Phase 0; phải giải quyết trước phần triển khai phụ thuộc.

## Bảng theo dõi phase

| Phase | Trạng thái | Commit | Bằng chứng |
|---|---|---|---|
| 0 | NOT STARTED | — | — |
| 1 | NOT STARTED | — | — |
| 2 | NOT STARTED | — | — |
| 3 | NOT STARTED | — | — |
| 4 | NOT STARTED | — | — |
| 5 | NOT STARTED | — | — |
| 6 | NOT STARTED | — | — |
| 7 | NOT STARTED | — | — |
| 8 | NOT STARTED | — | — |
| 9 | NOT STARTED | — | — |

## Mẫu cập nhật mỗi phiên

- Ngày / người thực hiện:
- Phase / task:
- Branch / commit triển khai đã kiểm thử:
- File đã đổi:
- Kết quả và điều kiện nghiệm thu đã đạt:
- Test PASS / FAIL / NOT RUN + đường dẫn bằng chứng:
- Môi trường đã xác minh:
- Thay đổi schema / migration:
- Vấn đề đang mở / quyết định mới được người dùng chốt:
- Blocker và thông tin còn thiếu:
- Task kế tiếp, file cần đọc:
- Phục hồi / rollback nếu cần:
