# Kế hoạch kiểm thử và nghiệm thu

Chưa có test nào trong tài liệu này được chạy. ANTI ghi kết quả **PASS / FAIL / NOT RUN / BLOCKED** kèm bằng chứng thực tế.

## 1. Bộ dữ liệu DEV đề nghị

Dữ liệu giả, không dùng tài khoản/khách thật:
- Hai Model khác nhau: Canon LBP 6030 (4 SN), Canon LBP 6030w (6 SN).
- Model máy in mặc định BH 12 tháng, máy scan BH 36 tháng.
- NCC Song Hùng; một NCC INACTIVE; hai kho; khách A/B.
- Tài khoản Admin, Kho, Sale và hai phiên Kho độc lập.
- Phiếu nhập chưa có phụ thuộc; phiếu đã xuất một phần; phiếu có SN xuất rồi hoàn nhập; phiếu xuất chưa phụ thuộc; phiếu đã có BH/hoàn nhập.
- Giữ fixture riêng từng test hoặc khôi phục trạng thái ban đầu để kết quả không phụ thuộc thứ tự chạy.

## 2. Danh sách test bắt buộc

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| E01 | Backup code + Sheet và restore thử | Mở/khôi phục được; đối soát số dòng/schema/code; không chỉ kiểm tên file |
| E02 | Ghi từ DEV và chạy trigger DEV | Chỉ DEV thay đổi, không có writer trỏ PROD |
| E03 | Git/config/deployment và baseline | Không commit secrets/dữ liệu thật; ảnh UI và số đo có bằng chứng |
| D01 | Khởi tạo schema hai lần | Không tạo trùng sheet/cột/ID; lỗi schema lệch có thông báo |
| D02 | Migration dry-run và thực thi DEV | Dry-run không ghi; nguồn V3 nguyên trạng; đích đối soát đúng |
| D03 | Chạy lại/resume migration | Không nhân bản SN/phiếu/event; source mapping nhất quán |
| D04 | Thiếu phiếu, SN trùng, ngày lỗi/BH xung đột | Có exception; không bịa lịch sử, không tự bỏ dữ liệu |
| M01 | Lưu “Song Hùng”, “ song hùng ”, bấm hai lần và hai phiên cùng tạo | Tối đa một NCC theo khóa normalize; lỗi/response rõ |
| M02 | Thêm 6030 và 6030w; sửa tên Model | Hai ID khác; phiếu cũ giữ snapshot/liên kết |
| M03 | Inactive danh mục đã dùng | Không hard-delete; phiếu cũ vẫn mở; tạo mới không chọn inactive |
| M04 | Sửa danh mục rồi mở form/phiên khác | Cache invalidation/version đúng; không hiển thị vĩnh viễn dữ liệu cũ |
| I01 | Nhập nhiều Model, dán nhiều SN | Một Header, mỗi SN một Detail/Master, timeline/audit đủ |
| I02 | Trùng SN trong phiếu/hệ thống, SN rỗng, số 0 đầu | Trùng/rỗng bị chặn toàn phiếu; số 0 đầu còn nguyên |
| I03 | Sửa nhập chưa có phụ thuộc: NCC/ngày/kho/Model/thêm bớt SN | Dữ liệu nhất quán, giữ revision/lịch sử; không mất detail cũ |
| I04 | Sửa nhập đã xuất một phần hoặc xuất rồi hoàn tồn | Dòng phụ thuộc/trường chung bị khóa đúng; không dựa status đơn lẻ |
| I05 | Kho hủy nhập hợp lệ; thử hủy khi có phụ thuộc; hủy lặp | Hợp lệ bỏ hiệu lực tồn, giữ hồ sơ; không hợp lệ không ghi; retry không tác động lần hai |
| I06 | Scan liên tục/trùng scan/camera bị từ chối; sửa lỗi SN | Không trùng, camera giữ luồng; nhập tay được; correction có lý do/alias/timeline |
| O01 | Xuất cùng phiếu một SN BH 12, một SN BH 36 | Mỗi detail và hồ sơ lưu đúng tháng/ngày; không lấy BH Header |
| O02 | Bulk BH chỉ chọn một nhóm; đổi mặc định Model sau xuất | Chỉ dòng chọn đổi; phiếu cũ không bị đổi theo Model |
| O03 | Một SN hết tồn giữa lúc chọn và submit | Từ chối toàn phiếu trước ghi, không xuất các SN còn lại |
| O04 | Sửa khách/SĐT/địa chỉ/ngày/BH | Snapshot và ngày BH nhất quán; before/after/audit có đủ |
| O05 | Đổi SN A → B; B không còn tồn hoặc A có phụ thuộc | Hợp lệ hoàn A + xuất B một giao dịch; trường hợp lỗi không ghi một nửa |
| O06 | Kho hủy xuất; hủy sau hoàn nhập/BH; hủy lặp | Hợp lệ về đúng trạng thái/kho trước xuất, giữ lịch sử; có phụ thuộc bị chặn; không hoàn tồn hai lần |
| S01 | Search “6030”, sau đó chọn Model exact | Search có thể 10 SN; chọn 6030 chỉ 4, không chứa 6030w |
| S02 | Kết hợp Model/kho/NCC/loại/tuổi tồn, đổi trang | KPI bằng toàn bộ kết quả của tất cả filter, không bằng số dòng của một trang |
| S03 | Tồn tuổi 60/61/90/91 ngày và ngày tương lai | >60 và >90 đúng ranh giới; dữ liệu ngày lỗi không bị lặng lẽ tính như hợp lệ |
| S04 | Chọn nhiều SN rồi đổi filter; kiểm nút xóa | Phạm vi chọn rõ ràng, không tác động SN ngoài ý muốn; không có hard-delete |
| R01 | Click SN từ tồn, phiếu nhập/xuất/BH | Cùng hồ sơ 360°, nguồn gốc/trạng thái/BH đúng |
| R02 | Timeline sau sửa/hủy/correction/migration | Vẫn có toàn bộ lịch sử; tra liên kết SN cũ được; dữ liệu thiếu có nhãn |
| R03 | Search SN/Model/phiếu/khách/SĐT | Điều hướng đúng; chọn Model áp exact, không lẫn loại kết quả |
| B01 | Khách trả một SN trong phiếu nhiều SN | Phiếu xuất gốc còn; SN khác không đổi; không hoàn trùng |
| B02 | Hoàn hàng tốt/hàng lỗi | Đúng IN_STOCK hoặc QUARANTINE/WARRANTY và đúng kho, có liên kết nguồn |
| B03 | Chuyển kho A → B, nguồn không khớp | Hợp lệ đổi vị trí có phiếu, tổng tồn không tăng; nguồn sai bị chặn |
| B04 | Chờ trả NCC → đã trả; thử xuất SN chờ trả | Timeline đủ, không xóa SN; không cho xuất hàng không IN_STOCK |
| B05 | Kiểm kê đúng/thiếu/thừa/sai kho và có giao dịch sau snapshot | Scan không tự đổi tồn; xác nhận tái kiểm tra, điều chỉnh có transaction/lý do |
| W01 | Nhận BH máy 12/36 tháng, còn/hết BH | Tham chiếu đúng lần xuất; xử lý tách khỏi quyền lợi BH |
| W02 | Kiểm tra → xử lý/gửi NCC → nhận về → trả khách | Workflow/vị trí/timeline đúng; gửi BH không trở thành trả NCC thương mại |
| W03 | Trả BH và hoàn thành | SN ở khách, không cộng vào tồn bán; không hoàn thành hai lần |
| W04 | Nhảy bước, hủy BH khi đã gửi NCC | Chặn chuyển sai; chỉ hoàn tác theo rule đã chốt, không đổi status mù |
| X01 | Double-click + mất phản hồi rồi retry cùng request_id | Một phiếu, một tác động tồn; trả kết quả cũ; UI không trừ KPI lần hai |
| X02 | Hai phiên cùng xuất SN001; đồng thời xuất với chuyển/hủy | Chỉ một mutation tương thích thành công; bên kia đọc lại và bị chặn |
| X03 | Giả lập lỗi sau Header/Detail/Master/history/audit, timeout và dừng tiến trình | Không lộ tồn/phiếu nửa vời; journal phát hiện, phục hồi; retry không nhân bản |
| A01 | Kho sửa/hủy; Sale gọi API mutation trực tiếp; giả role client | Kho được phép khi đủ điều kiện; Sale/giả role bị chặn ở server; không có ghi dữ liệu |
| A02 | Sửa danh mục/phiếu, hủy, correction | Audit server có actor/time/lý do/before-after; không lộ secrets |
| A03 | Gọi API khi chưa đăng nhập, giả currentUser/sessionStorage; xem payload khởi tạo | Server từ chối truy cập không có quyền, không trả mật khẩu USERS; kiểm nền ở Phase 1, không đợi Phase 9 |
| D05 | Dựng source DEV từ 14 phần V3 | Không còn hai khai báo global cùng tên trong tập source được deploy; các khác biệt giữa bản hàm đã được ghi và kiểm tra |
| P01 | Lưu NCC/Model | Cập nhật đúng row, không reload toàn app hoặc audit gọi riêng; có số đo |
| P02 | Tab/search/filter/sort, mở lịch sử lớn | Client state/lazy load hoạt động; lịch sử phân trang; KPI vẫn đầy đủ |
| H01 | So Dashboard V4 với ảnh V3 | Giữ bố cục/phong cách/KPI/biểu đồ/quick actions/FIFO; drill-down khớp |
| H02 | Test toàn vòng đời và toàn bộ role | Nhập → chuyển → xuất → BH/hoàn → trả NCC đối soát được |
| H03 | Backup tay/hàng ngày, restore và diễn tập rollback | Tạo được bản dùng để phục hồi, biết xử lý giao dịch phát sinh sau cutover |
| H04 | Migration cuối/cutover sau khi được cho phép | Backup mới, nguồn không đổi trong cửa sổ, đối soát đạt, smoke test đúng môi trường |

## 3. Trường hợp phải bổ sung khi đã chốt nghiệp vụ

- Q01: ngày 31/01 + 1 tháng, 29/02 + 12 tháng, ngày hết hạn, 0 tháng, tháng âm/lẻ/quá giới hạn.
- Q02/Q03: xuất → hoàn nhập → xuất lại, BH và tuổi tồn đúng chính sách được chọn.
- Q04: khách cùng tên, cùng SĐT nhưng khác pháp nhân; không gộp sai.
- Q06: tái nhập SN sau hủy/trả NCC và SN đã correction; không sinh thiết bị trùng.
- Q08/Q10: xử lý SN thừa không có nguồn, hủy BH từng bước, đổi máy nếu được bổ sung phạm vi.

Không đánh dấu module liên quan hoàn thành khi chính sách chưa chốt khiến test không thể có expected result.

## 4. Mẫu báo cáo

| ID | Môi trường/commit | Dữ liệu và bước tái hiện | Expected | Actual | Kết quả | Bằng chứng |
|---|---|---|---|---|---|---|
| Ví dụ X02 | DEV / hash thật | Hai phiên, cùng SN | Một thành công | Chưa chạy | NOT RUN | — |

Bằng chứng có thể là log đã bỏ dữ liệu nhạy cảm, ảnh UI, snapshot trước/sau, số phiếu/detail/event và kết quả đối soát. Test đồng thời phải có hai request thực sự giao nhau; gọi nối tiếp không chứng minh chống race condition.

## 5. Điều kiện chặn nghiệm thu

Không nghiệm thu nếu còn mất lịch sử, trùng SN, xuất trùng, ghi nửa phiếu, KPI lệch dữ liệu, vượt quyền hoặc DEV ghi PROD. Lỗi UI nhỏ ghi rõ ảnh hưởng; không dùng để che các test nghiệp vụ chưa chạy.
