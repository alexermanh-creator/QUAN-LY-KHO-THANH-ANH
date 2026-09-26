# 📋 BIÊN BẢN GHI NHẬN PHIÊN LÀM VIỆC (27/09/2026)

---

## I. TỔNG QUAN CÁC HẠNG MỤC ĐÃ HOÀN THÀNH TRONG PHIÊN

### 1. Kiến Trúc Cốt Lõi: "Google Sheets là Source of Truth – Client chỉ là Cache/View"
- Khắc phục triệt để tình trạng "lạc quan sớm" (Optimistic early clear) ở Client:
  - Form và danh sách thiết bị trên Client chỉ được dọn sạch sau khi máy chủ Google Sheets phản hồi thành công (`res.success === true`).
  - Khi rớt mạng 4G/Wi-Fi hoặc máy chủ lỗi: Giữ nguyên 100% dữ liệu đang nhập để người dùng thử lại, bảo vệ tuyệt đối công sức quét Serial của nhân viên.
- Trang bị mã giao dịch duy nhất (`requestId` / Idempotency Key) cho mọi giao dịch Nhập kho và Xuất kho, đảm bảo không bao giờ bị ghi trùng phiếu khi mạng chập chờn.

---

### 2. Đồng Bộ Đối Xứng Toàn Diện Draft Phiếu Nhập & Phiếu Xuất Đa Thiết Bị:
- **Lưu Nháp Server-Authoritative**:
  - Khi bấm *"Lưu Nháp (DRAFT)"*, nút lập tức bị khóa, hiển thị spinner chống double-click.
  - Quản lý mã Draft ổn định (`CURRENT_XUAT_DRAFT_ID`, `CURRENT_NHAP_DRAFT_ID`), không sinh mã mới nhảy liên tục khi sửa tiếp draft cũ.
- **Chống Xung Đột Phiên Bản Đa Máy (`Optimistic Concurrency v1, v2...`)**:
  - Server kiểm tra `expectedVersion`. Nếu thiết bị khác đã sửa trước lên `v2`, máy cũ gửi `v1` sẽ bị từ chối kèm cảnh báo xung đột để tải lại bản mới nhất, chống ghi đè mất dữ liệu chéo giữa các máy.
- **Khôi Phục & Revalidate Serial Thực Tế (`resumeExportDraft` & `resumeImportDraft`)**:
  - Khi mở lại Draft trên PC từ điện thoại:
    - Đối với Phiếu Xuất: Revalidate với `SERIAL_DB`, phát hiện chính xác máy nào đã bị bán trước đó, bôi đỏ cảnh báo và chặn xuất kho đến khi xóa dòng lỗi.
    - Đối với Phiếu Nhập: Revalidate chống trùng lặp với `SERIAL_DB`, phát hiện chính xác máy nào đã tồn tại trong kho.
- **Tự Động Dọn Dẹp Draft Sau Khi Hoàn Tất**:
  - Khi xác nhận Nhập/Xuất chính thức thành công, Google Apps Script và Client tự động xóa bản ghi nháp tương ứng trong sheet `V4_DRAFT_VOUCHERS` và sổ nháp.

---

### 3. Xóa Phiếu Nháp Chuẩn Server-Authoritative (Bịt Kín Lỗ Hổng "Phiếu Ma"):
- Áp dụng cho cả `deleteDraftExportVoucher` (Xuất) và `deleteDraftImportVoucher` (Nhập):
  - Click Xóa $\rightarrow$ Hiển thị loading `Swal.showLoading()`, khóa giao diện chống bấm lặp.
  - Gửi yêu cầu xóa lên máy chủ Google Sheets (`WarehouseAPI.deleteDraftVoucher`).
  - **Chỉ khi Backend phản hồi thành công**: Xóa khỏi `VOUCHERS_DB`, cập nhật `localStorage`, render lại bảng lịch sử và báo *"Đã xóa thành công"*.
  - **Nếu Backend lỗi hoặc mất mạng**: Giữ nguyên 100% phiếu nháp trên Client, hiển thị thông báo lỗi chi tiết, không bao giờ để xảy ra tình trạng "local xóa nhưng server chưa xóa làm phiếu đột ngột xuất hiện lại".

---

### 4. Tối Ưu Hiệu Năng Hot-Path Xuất Kho & Đồng Bộ Monotonic Version:
- Thay thế việc quét toàn bộ 18 cột bằng việc chỉ đọc Cột 1 (Serial) để lập chỉ mục dòng.
- Gom toàn bộ các lệnh cập nhật cột 6-17 vào duy nhất 1 lệnh `setValues` 12 cột, cắt giảm thời gian thực thi từ 3–5 giây xuống còn ~1.2 giây.
- Bổ sung nút bấm non-reloading *"⟳ Cập nhật dữ liệu"* trên topbar kiểm tra siêu nhẹ phiên bản `DATA_VERSION` trước khi kéo dữ liệu nặng.

---

## II. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (BACKTEST VERIFICATION)

Toàn bộ 3 bộ test suite độc lập đều đạt chuẩn tuyệt đối:
1. `tests/test_delete_draft_server_authoritative.js`: **16/16 PASSED (100%)**
2. `tests/test_multi_device_draft.js`: **32/32 PASSED (100%)**
3. `test_harden_backtest.js`: **47/47 PASSED (100%)**

---

## III. TRẠNG THÁI TRIỂN KHAI

- **Đóng gói Bundle**: `demo_quan_ly_kho.html`, `gas/Index.html`, `src/frontend/Index.html` (100% UTF-8, đã build).
- **Google Apps Script**: Đã triển khai thành công 22 file qua `clasp push -f`.
- **Git Commit**: Commit `fc2a115` và commit nhật ký làm việc đã đồng bộ lên cả nhánh `main` và `master`.
