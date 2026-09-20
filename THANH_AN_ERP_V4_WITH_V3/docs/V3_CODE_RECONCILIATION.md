# Đối chiếu code V3 với thiết kế V4

Bản tích hợp 1.1 · 16/09/2026 · Kiểm tra tĩnh trên tệp người dùng cung cấp, chưa chạy Apps Script.

## 1. Nguồn đã xác minh

- Tệp gốc: Quan ly kho.txt trong thư mục C:\Projects\Quan Ly Kho Thanh An.
- Bản sao nguyên gốc trong gói: [Quan ly kho.txt](<../reference/V3/Quan ly kho.txt>).
- Kích thước: **180.925 byte**, **3.152 dòng**, **14 phần code**.
- SHA-256: `2DA3EF01966D230AA34F13EF4A7E2550EB3E957DBB60D9792AC30C0F0CD3E48A`.
- Bản sao được kiểm tra hash bằng bản gốc; không sửa nội dung nguồn.
- Đây là bản code V3 người dùng xác nhận dùng làm nền. Chưa xác minh nó trùng deployment PROD hiện đang chạy, chưa có Sheet dữ liệu, manifest hay ID deployment.

Số dòng trong báo cáo là số dòng của tệp TXT nguyên gốc. Không suy diễn nhận xét về deployment chỉ từ tệp này.

## 2. Kết luận triển khai

**Thiết kế V4 vẫn phù hợp. Không cần viết lại toàn bộ tài liệu hoặc toàn bộ giao diện.** Giữ Dashboard, khung menu, các form và luồng nhập liệu phù hợp; thay dần data layer và nghiệp vụ theo 10 phase.

Hai điều cần điều chỉnh trong cách ANTI bắt đầu:
1. Đã có code V3 trong gói, không yêu cầu người dùng cung cấp lại.
2. Không tách 14 phần rồi deploy toàn bộ ngay: có **13 tên hàm backend được khai báo hai lần** giữa phần tổng hợp và các module riêng. Phải xác định cấu trúc nguồn sẽ dùng trước khi dựng bản chạy DEV.

## 3. Bản đồ 14 phần

| Phần | Dòng nội dung | Nội dung / tên đích dự kiến |
|---|---|---|
| 1 | 2–514 | Backend tổng hợp; tên file gốc chưa được ghi rõ, có thể đặt Code.gs khi dựng DEV |
| 2 | 516–1350 | Index.html; suy ra từ doGet và include |
| 3 | 1352–1491 | 01_Module_DanhMuc.gs, có tên trong chú thích |
| 4 | 1493–1723 | Tab_DanhMuc.html, suy ra từ include và nội dung |
| 5 | 1725–1853 | 02_Module_NhapKho.gs, có tên trong chú thích |
| 6 | 1855–1950 | 04_Module_TonKho.gs, có tên trong chú thích |
| 7 | 1952–2063 | Tab_NhapKho.html |
| 8 | 2065–2168 | Tab_TonKho.html |
| 9 | 2170–2346 | 03_Module_XuatKho.gs, gồm cả tra cứu BH |
| 10 | 2348–2499 | Tab_XuatKho.html |
| 11 | 2501–2576 | Tab_BaoHanh.html |
| 12 | 2578–2762 | Tab_LichSu.html |
| 13 | 2764–2926 | Tab_Dashboard.html |
| 14 | 2928–3152 | Tab_CaiDat.html |

Các dòng đánh dấu “File” không phải mã nguồn để deploy. Tên HTML là mapping có căn cứ từ include ở dòng 647–654; ANTI kiểm lại khi dựng DEV. Chưa tạo các file thực thi trong gói để tránh biến một lựa chọn chưa kiểm chứng thành bản chạy chính thức.

## 4. Đối chiếu chính

| Hạng mục | Bằng chứng V3 | Cách làm V4 |
|---|---|---|
| Dashboard | Phần 13, dòng 2764–2926; render trong Index | Giữ bố cục thực tế, thay nguồn dữ liệu và bổ sung drill-down phù hợp |
| Client state | getInitAppData dòng 21; switchTab dòng 862 trở đi | Đã có nền tải dữ liệu chung và chuyển tab cục bộ; tận dụng, không viết lại chỉ vì nhận định cũ “mỗi tab gọi server” |
| Reload sau Save | refreshAllDataFast dòng 848; Save Model/NCC dòng 1037/1047; xuất dòng 1158 | Trả patch, cập nhật phần liên quan; tránh đọc lại tất cả sau thao tác nhỏ |
| Nhập nhiều Model | executeNhapKhoMulti dòng 191 và 1798; batch setValues dòng 221/1840 | Giữ luồng nhập nhiều Model, chuẩn hóa Header + Detail và transaction |
| Lịch sử nhập | Dòng 223–224 và 1843–1848 ghép SN thành chuỗi | Tách một SN/một detail, bảo toàn nguồn V3 khi migration |
| BH cùng phiếu | executeXuatKho dòng 310 và 2247 tính một soThang cho toàn phiếu | BH từng detail, mặc định Model, override/bulk theo dòng |
| BH bằng 0 | Cùng phép tính có fallback “hoặc 12” | Giá trị 0 có thể thành 12 trong code này; chốt và test “Không BH” riêng |
| Kiểm tồn trước xuất | Dòng 291–306 và 2224–2242 | Có kiểm trạng thái server nhưng cần khóa bao trùm kiểm tra–ghi |
| Lock/cache | Không tìm thấy LockService hoặc CacheService trong toàn tệp | Bổ sung theo roadmap, không nói V3 đã có |
| Lưu NCC trùng | saveNcc dòng 361/1425 thêm trực tiếp, không unique check | Normalize + kiểm unique dưới lock + idempotency |
| Double-submit | saveNccBtn dòng 1047 không disable; submitXuatKhoBtn dòng 1158 đã disable | Không khẳng định tất cả nút đều thiếu khóa; hoàn thiện success/error/retry phía client và server |
| Model gần đúng | filterTonKho dòng 1083 dùng includes, chỉ có filter nhóm/kho | Thêm Model exact-match độc lập với search |
| Sửa/hủy phiếu | Có getChiTietDonNhap/Xuat và updateThietBi; không thấy API sửa/hủy phiếu đúng transaction trong tệp | Xây Phase 3–4, không dùng sửa thiết bị để giả làm sửa phiếu |
| Hard-delete | deleteThietBi dòng 276/1946; danh mục dòng 359/368/377 và module riêng | Loại khỏi vận hành V4; hủy/hoàn tác hoặc inactive |
| Quyền Kho | checkPermission dòng 836–840 chặn DELETE; applyRBAC chủ yếu ẩn menu | Cấp quyền sửa/hủy theo nghiệp vụ, xác thực server; không mở DELETE chung |
| Serial 360° | openPassportModal dòng 1226 hiển thị hồ sơ máy và BH hiện tại | Tận dụng UI, thêm timeline và nguồn giao dịch; chưa phải hồ sơ vòng đời hoàn chỉnh |
| Bảo hành xử lý | baoHanhList là dữ liệu hạn BH; phần 11 là tra cứu | Xây phiếu và workflow BH, không coi danh sách sắp hết hạn là phiếu đang xử lý |
| Camera | Có textarea dán/quét SN dòng 2433; không thấy API camera/scanner trong tệp | Giữ nhập/dán/máy quét dạng bàn phím; camera continuous scan cần triển khai mới |
| Audit | writeAuditLogClient dòng 471, nhận tên người từ client, bắt lỗi rồi log; nguồn NHAT_KY_HOAT_DONG | Audit server với actor xác thực, before/after, liên kết transaction; map đúng tên sheet cũ |
| Backup | createInstantBackup dòng 482 sao chép file Sheet; schedule dòng 493 | Có nền backup, nhưng chưa chứng minh đã có trigger đang bật hay đã restore được |
| Cấu hình môi trường | getActiveSpreadsheet dùng trong backend; CAU_HINH dòng 396 | Phải xác minh binding Script–Sheet DEV; đổi tên thư mục không cách ly dữ liệu |

## 5. Dashboard thực tế cần giữ

Code hiện có:
- Tìm nhanh Serial / SĐT khách / Model.
- Nút Nhập kho, Xuất bán.
- Bốn thẻ chính: **Tồn kho thực tế; Xuất tháng này; Sắp hết hạn BH ≤30 ngày; Lưu kho lâu >60 ngày**.
- Biểu đồ luân chuyển nhập/xuất với lựa chọn 3/6/12 tháng.
- Biểu đồ cơ cấu tồn theo nhóm.
- Bảng thiết bị lưu kho lâu/FIFO.

Danh sách KPI V4 trong Blueprint là mục tiêu thông tin, **không phải lệnh thay bốn thẻ cũ bằng bảy thẻ mới**. Giữ bốn thẻ và bố cục hiện tại; bổ sung số Model, nhập tháng, >90 ngày và BH đang xử lý ở vị trí phù hợp trong Phase 9. Không nhầm “sắp hết hạn BH” với “phiếu BH đang xử lý”.

Đã xác minh cấu trúc từ code, chưa render hay so ảnh với deployment thật. Chụp baseline UI thực tế vẫn là công việc Phase 0.

## 6. Hàm backend trùng tên

| Hàm | Các dòng khai báo |
|---|---|
| generateAutoSerials | 154, 1766 |
| executeNhapKhoMulti | 191, 1798 |
| updateThietBi | 244, 1899 |
| deleteThietBi | 276, 1946 |
| executeXuatKho | 285, 2215 |
| saveProduct | 343, 1393 |
| deleteProduct | 359, 1419 |
| saveNcc | 361, 1425 |
| deleteNcc | 368, 1441 |
| saveKhachHang | 370, 1447 |
| deleteKhachHang | 377, 1464 |
| addQuyChuan | 379, 1470 |
| deleteQuyChuan | 387, 1485 |

Không phải mọi bản hàm đều giống hệt: ví dụ nhập kho ở dòng 1823 có kiểm danh sách SN rỗng; bản tổng hợp không có kiểm tương ứng trước ghi. Vì vậy không tự xóa một bản chỉ dựa vào tên.

Phase 0: xác định file nào hiện có trong Apps Script thật, đánh dấu phần tổng hợp/module nào dùng; giữ nguồn TXT nguyên trạng. Nếu không có deployment để đối chiếu, ghi rõ chưa xác minh, chọn phương án dựng DEV có báo cáo khác biệt trước khi sửa nghiệp vụ. Không dựa vào thứ tự file để xử lý trùng hàm. Việc refactor hành vi thuộc phase triển khai, không lẫn với snapshot V3.

## 7. Mapping dữ liệu đã xác minh từ code

DATA_THIET_BI sử dụng 17 cột:

| Cột | Nghĩa theo code |
|---|---|
| A | Serial |
| B | Model |
| C | Tên hàng |
| D | Nhóm hàng |
| E | Loại hàng |
| F | Kho |
| G | NCC |
| H | Ngày nhập |
| I | Mã phiếu nhập |
| J | Trạng thái |
| K | Ngày xuất |
| L | Mã phiếu xuất |
| M | Tên khách |
| N | SĐT khách |
| O | Số tháng BH |
| P | Ngày hết hạn BH |
| Q | Ghi chú |

Các bảng khác:
- DM_SAN_PHAM: Model, tên, nhóm — chưa có BH mặc định.
- DM_NCC: tên tắt, tên đầy đủ, SĐT, ghi chú — chưa có địa chỉ/ID/inactive trong cách ghi hiện tại.
- DM_KHACH_HANG: tên, SĐT, địa chỉ, ghi chú.
- DM_QUY_CHUAN: bốn cột độc lập nhóm hàng, kho, loại hàng, gói BH.
- LICH_SU_NHAP: mã phiếu, ngày, NCC, tóm tắt Model, số lượng, chuỗi SN, kho, ghi chú.
- LICH_SU_XUAT: mã phiếu, ngày, chuỗi khách/SĐT, số lượng, chuỗi SN, BH chung, ghi chú.
- CAU_HINH: key/value; không phải CONFIG trong tệp này.
- NHAT_KY_HOAT_DONG: thời gian, người thực hiện, hành động, Serial, chi tiết.
- USERS: tài khoản, thông tin xác thực, họ tên, vai trò, trạng thái.

Đây là cấu trúc **code đang kỳ vọng**, chưa phải đối soát header/số dòng/dữ liệu trong Sheet thật.

Tự sinh Serial nội bộ có trong V3 (generateAutoSerials). Blueprint chưa chốt rõ việc giữ/tắt cho hàng không có SN hãng: ghi thêm Q12 để xác nhận trước Phase 3, không tự loại bỏ hoặc mặc định bật. Nếu giữ phải chống cấp trùng dưới cơ chế khóa/cấp mã phù hợp.

## 8. Xác thực và dữ liệu nhạy cảm — phát hiện cụ thể

- getCaiDatData ở dòng 392–432 trả danh sách user có thông tin mật khẩu; handleLogin ở dòng 760–792 so sánh mật khẩu tại client.
- currentUser được lưu sessionStorage; các hàm mutation được xem không có kiểm tra role/session server tương ứng.
- saveUserAccount dòng 454 ghi giá trị mật khẩu được truyền vào; có seed tài khoản và giá trị reset nhúng trong nguồn.
- getCaiDatData là hàm đọc theo tên nhưng có thể tạo USERS, tài khoản mặc định và sheet log khi thiếu. Không gọi nó vào PROD chỉ để “kiểm tra đọc”.
- Factory reset có thao tác clearContent ở dòng 500 trở đi. Không chạy khi khảo sát hoặc tạo baseline.

Đây là phát hiện trên tệp, chưa chứng minh mức truy cập công khai của deployment. Đưa xác thực/authorization vào nền Phase 1 và test cùng từng module; không đợi Phase 9 mới sửa.

Nguồn gốc được giữ nguyên phục vụ đối chiếu, nên gói ZIP chứa cả hằng số nhạy cảm có sẵn trong code cũ. Không công khai gói; bản TXT được thêm vào .gitignore của gói mới để tránh commit vô ý. .gitignore không bảo vệ tệp đã từng được track; ANTI phải kiểm tra trước commit. Không tự upload V3 lên GitHub hoặc deploy từ bản reference.

## 9. Trạng thái sau đối chiếu

- Đã nhận và đọc các phần code liên quan; lập bản đồ 14 phần, duplicate và mapping.
- Đã tích hợp nguyên bản V3; không sửa file tại C:\Projects.
- Đã cập nhật hướng dẫn để ANTI kế thừa V3, không yêu cầu gửi lại file.
- Chưa tách thành dự án Apps Script chạy được; chưa tạo Sheet/Script DEV hay BACKUP hệ thống.
- Chưa benchmark, test runtime, xác minh trigger hoặc deployment PROD.
- Phase 0 vẫn NOT STARTED; chỉ phần thu thập nguồn và đối chiếu tĩnh đã có đầu vào.

