# QUY TẮC CỐT LÕI: NGUYÊN TẮC ĐỒNG BỘ DỮ LIỆU TOÀN HỆ THỐNG
> **NGUYÊN TẮC BẤT BIẾN THEO CHỈ ĐẠO CỦA NGƯỜI DÙNG:**
> *"Một sản phẩm, một model khi nhập, xuất hay sửa thì toàn bộ hệ thống phải đồng bộ tuyệt đối dữ liệu từ khu A tới tất cả các vị trí B. Tuyệt đối không để xảy ra tình trạng một nơi tên này, một nơi tên khác, hoặc một nơi đã sửa/hủy mà nơi khác vẫn giữ dữ liệu cũ."*

---

## 1. NGUYÊN TẮC ĐỒNG BỘ SẢN PHẨM & MODEL (VÒNG ĐỜI TOÀN DIỆN)
Mỗi khi có một Model sản phẩm được tạo mới, chỉnh sửa thông tin, hoặc tham gia vào giao dịch Nhập/Xuất kho:
1. **Định danh duy nhất**: Model là khóa liên kết xuyên suốt giữa Danh mục sản phẩm (`DM_SAN_PHAM`), Danh mục Serial (`SERIAL_MASTER`), Phiếu nhập, Phiếu xuất và Quản lý Tồn kho.
2. **Cascade thông tin chuẩn**:
   - Khi Model thay đổi (Tên sản phẩm, Đơn vị tính, Hãng SX, Nhóm hàng, Bảo hành): Toàn bộ các Serial mang Model đó trong `SERIAL_DB` và `SERIAL_MASTER` phải được cập nhật đồng bộ 100%.
   - Không được phép để Model mang tên A ở Danh mục nhưng ở phiếu hoặc ở Tồn kho lại mang tên B.
3. **Cập nhật tức thì các bộ lọc & dropdown**:
   - Khi tạo Model mới ở Nhập kho hoặc Danh mục: Lập tức xuất hiện trên ô chọn Model của Xuất kho, bộ lọc Tồn kho, Hồ sơ Serial 360 và Bảng Danh mục (ưu tiên xếp lên đầu).

---

## 2. NGUYÊN TẮC ĐỒNG BỘ PHIẾU XUẤT KHO
1. **Đầy đủ các trường thông tin Header**:
   - Mã phiếu xuất, Ngày xuất kho (*).
   - Khách hàng (*), Số điện thoại (*), **Người liên hệ trực tiếp (*)**, Email, Mã số thuế, Địa chỉ giao hàng (*).
   - Kho xuất (*).
   - **Yêu cầu giấy tờ / chứng từ kèm theo** (Hóa đơn VAT, Biên bản bàn giao, Phiếu BH, CO/CQ).
   - Người tạo / Thủ kho xuất, Ghi chú phiếu.
2. **Đồng bộ danh sách thiết bị khi Sửa Phiếu Xuất**:
   - **Khi xóa 1 máy khỏi phiếu xuất**: Máy đó **BẮT BUỘC PHẢI ĐƯỢC HOÀN TRẢ TRẠNG THÁI TỒN KHO (`IN_STOCK`)**, xóa bỏ liên kết `maPhieuXuat`, `ngayXuat`, `khachHang`, `sdtKhach`, `nguoiLienHe`. Số lượng tồn kho của model đó phải được hoàn trả lại (+1).
   - **Khi thêm 1 máy vào phiếu xuất**: Máy đó phải được chuyển từ `IN_STOCK` sang `EXPORTED`, gắn đầy đủ thông tin khách hàng, số điện thoại, người liên hệ, ngày xuất, hạn bảo hành.
   - **Khi sửa thông tin Header (Khách, SĐT, Người LH, Kho, Ngày)**: TẤT CẢ các thiết bị trong phiếu xuất đó phải được cập nhật đồng bộ các trường tương ứng trong `SERIAL_DB` và `SERIAL_MASTER`.

---

## 3. NGUYÊN TẮC ĐỒNG BỘ PHIẾU NHẬP KHO
1. **Đầy đủ các trường thông tin Header**:
   - Mã phiếu nhập, Ngày nhập kho (*).
   - Nhà cung cấp (*), Số điện thoại NCC, **Người liên hệ NCC**, Số hóa đơn / Chứng từ NCC.
   - Kho nhận hàng (*), Loại hàng quy chuẩn (*).
   - Người nhận / Thủ kho nhập, Ghi chú phiếu nhập.
2. **Đồng bộ danh sách thiết bị khi Sửa Phiếu Nhập**:
   - **Khi xóa 1 máy khỏi phiếu nhập**: Máy đó phải bị loại bỏ hoàn toàn khỏi Tồn kho `SERIAL_DB` và `SERIAL_MASTER` (nếu máy đó chưa từng xuất). Số lượng tồn kho của model đó phải giảm đi (-1).
   - **Khi sửa thông tin NCC, Kho nhận, Ngày nhập**: Toàn bộ serial thuộc phiếu nhập đó phải được cascade cập nhật lại chính xác.
   - **Khi sửa Model của dòng máy**: Model mới phải tự động kéo theo Tên sản phẩm chuẩn, Hãng SX và Nhóm hàng từ Danh mục Model.

---

## 4. NGUYÊN TẮC ĐỒNG BỘ KHÁCH HÀNG & NHÀ CUNG CẤP
1. Thêm nhanh ở Xuất kho hoặc Danh mục phải lưu đầy đủ: Mã, Tên đơn vị, SĐT, **Người liên hệ**, Email, MST, Địa chỉ.
2. Sửa thông tin Khách hàng / NCC ở Danh mục phải đồng bộ sang:
   - Các gợi ý chọn Khách / NCC tại phiếu.
   - Hồ sơ Serial 360 (tra cứu nguồn gốc máy và chủ sở hữu hiện tại).
   - Lịch sử phiếu và Google Sheets (`DM_KHACH_HANG`, `DM_NCC`, `SERIAL_MASTER`).

---

## 5. NGUYÊN TẮC LƯU TRỮ & VẾT KIỂM TOÁN (AUDIT TRAIL)
Mọi thao tác chỉnh sửa phiếu, chỉnh sửa model, đổi thông tin thiết bị:
1. Phải ghi nhận lý do điều chỉnh bắt buộc.
2. Phải ghi nhận vết thay đổi chi tiết từng trường (Field-level changes: Giá trị cũ -> Giá trị mới).
3. Phải đồng bộ 3 tầng dữ liệu song song:
   - **Bộ nhớ Runtime (RAM)**: Cập nhật ngay không khựng lag (60fps).
   - **Bộ nhớ LocalStorage**: Lưu bền vững trên trình duyệt khách hàng.
   - **Google Sheets (Backend)**: Đẩy trực tiếp qua Google Apps Script API.

---

## 6. NGUYÊN TẮC RÀNG BUỘC CHẶT CHẼ DỮ LIỆU ĐẦU VÀO (FAIL-FAST INPUT VALIDATION)
1. **Chặn ngay tại cửa (Fail-Fast)**:
   - Tại màn hình **Nhập Kho**: Bắt buộc phải chọn đúng Nhà Cung Cấp hợp lệ (có trong `INITIAL_SUPPLIERS`) và Kho nhập hợp lệ thì MỚI ĐƯỢC PHÉP bấm "Đưa vào danh sách Draft". Nếu để trống hoặc gõ tên NCC không tồn tại trong danh mục, hệ thống lập tức phát âm thanh cảnh báo `Beep!`, hiển thị thông báo yêu cầu chọn lại NCC từ danh mục và chặn đứng việc nạp thiết bị vào danh sách Draft.
   - Tại màn hình **Xuất Kho**: Bắt buộc phải chọn đúng Khách Hàng hợp lệ (có trong `INITIAL_CUSTOMERS`) và Kho xuất hợp lệ thì MỚI ĐƯỢC PHÉP thêm serial vào danh sách chuẩn bị xuất.
2. **Tuyệt đối không cho phép "Thêm nhanh" tại phiếu**:
   - Toàn bộ Nhà Cung Cấp, Khách Hàng, Model mới, Loại hàng, Kho hàng... bắt buộc phải được tạo quy chuẩn từ tab **Danh Mục Hệ Thống**.
3. **Quy tắc phân tích trước khi code**:
   - Mọi can thiệp vào logic hệ thống đều phải tuân thủ nghiêm ngặt quy trình: **Phân tích -> Giải thích -> Đưa hướng xử lý trước khi code**.
