# Nguồn quyết định và xử lý mâu thuẫn

## Cập nhật nguồn — gói 1.1

Người dùng đã cung cấp `C:\Projects\Quan Ly Kho Thanh An\Quan ly kho.txt`. Đã copy nguyên gốc vào reference/V3, xác minh SHA-256 và lập [báo cáo đối chiếu](V3_CODE_RECONCILIATION.md). Các điểm hiện trạng trong báo cáo có bằng chứng dòng code; không còn chỉ dựa vào lời phân tích ở cuộc trò chuyện cũ. Chưa xác minh runtime hoặc deployment PROD.

Bổ sung cách giữ Dashboard theo đúng bốn thẻ/biểu đồ thực tế; ghi rõ đã có client state, nút xuất đã disable, tên sheet CAU_HINH/NHAT_KY_HOAT_DONG và 13 hàm trùng. Thêm Q12 về tự sinh SN nội bộ có sẵn trong V3. Không đổi 10 phase hoặc mở rộng phạm vi nghiệp vụ.

Nguồn chính: cuộc trò chuyện [Phân tích hệ thống kho](chatgpt-conversation://6aaa9787-e868-83ec-b0b4-8ff35fc63c76), cùng yêu cầu đóng gói ngày 16/09/2026. Đã đọc 24 lượt hội thoại qua ba trang đến đầu lịch sử. Văn bản cuộc trò chuyện là đầu vào thiết kế, không phải bằng chứng code hiện tại đã đúng hoặc đã lỗi.

## Quyết định ưu tiên

| Quyết định | Căn cứ từ người dùng / bản chốt cuối | Thể hiện trong bộ tài liệu |
|---|---|---|
| Giữ Dashboard | “Tôi vẫn thích dashboard như bây giờ hơn” | Overview; Blueprint §4; Phase 9; H01 |
| Sửa/hủy nhập/xuất | Người dùng nêu hiện không sửa được phiếu | Blueprint §14–15, §21–22; Phase 3–4 |
| Kho có quyền sửa/hủy | “Phân quyền cho kho là sửa, xóa được phiếu nhập, xuất...” | AGENTS; Blueprint §36; A01 |
| Không hard-delete | “Xóa” được diễn giải thành hủy; yêu cầu hiện tại nêu rõ không hard-delete giao dịch | Blueprint §37 sửa ngoại lệ Admin của nháp cũ |
| BH riêng từng SN | Người dùng nêu cùng khách có máy BH 12 và 36 tháng | Header/Detail xuất; O01–O02 |
| Exact Model | Người dùng nêu bất cập 6030 lẫn 6030w | Blueprint §30–32; S01–S02 |
| Chống lưu lặp và lag | NCC bị lưu hai lần, lag danh mục/xuất | AGENTS; notes §4/6; M01/X01/P01 |
| An toàn hai người dùng | Người dùng hỏi RAM khi hai người thao tác | Server validation/LockService; X02 |
| BACKUP/DEV/PROD | Có dữ liệu thật, cần backup trước khi sửa | Phase 0; migration checklist |
| Serial trung tâm, Header + Detail | Blueprint cuối được người dùng yêu cầu tiếp tục đóng gói | Overview; Blueprint |
| 10 phase | Hỏi “có bao nhiêu phase”, bản cuối xác nhận 0–9 | ROADMAP thống nhất 10 phase |
| Chưa in phiếu | “Thôi tạm thời ko dùng tính năng in phiếu” | Ngoài phạm vi; không prompt triển khai printing |
| Tổng quan ANTI đọc đầu tiên | “phải có tổng quan cho ANTI biết chứ” | PROJECT_OVERVIEW và prompt |

## Đề xuất cũ được thay thế hoặc giới hạn

- Lộ trình trước từng ghi 8 phase nhưng liệt kê 0–8, và một lộ trình khác ghép Bảo hành với Dashboard. Dùng bản cuối **10 phase 0–9**.
- Có đề xuất “performance trước” như một đợt vá V3. Trong V4, Phase 0 chỉ đo baseline; hiệu năng được làm cùng từng module và kiểm tổng Phase 9.
- Ngoại lệ Admin hard-delete ở §37 nháp cũ mâu thuẫn nguyên tắc không xóa giao dịch. Yêu cầu hiện tại ưu tiên: không triển khai ngoại lệ đó.
- Menu/đồ thị Dashboard mới trong các phác thảo là minh họa; không thay cho yêu cầu giữ Dashboard thật.
- In/PDF/tem và OCR từng được bàn như hướng tương lai. V4 chỉ làm barcode/QR scan và nhập tay; không làm printing/OCR.
- Các ví dụ thời gian cải thiện, số tồn, mã phiếu, Model và kho không phải số đo hay dữ liệu thật.
- Lời khuyên cũ về audit lại code không phải nhiệm vụ của gói này; ANTI chỉ khảo sát code đủ để triển khai thiết kế đã chốt.

## Nội dung bổ sung khi đóng gói

Các phần sau được thêm để đặc tả có thể thực thi, không giả nhận là quyết định nghiệp vụ đã được duyệt từng chi tiết:
- Bảng trạng thái handoff trung thực, tiêu chí vào/ra phase và test có mã.
- Idempotency request_id, version, journal/recovery và kiểm thử lỗi ghi dở.
- device_id/alias đề xuất cho sửa mã SN mà giữ lịch sử; hiệu lực bản ghi tách trạng thái nghiệp vụ.
- Data dictionary cần hoàn thiện; tên detail Operations; phương án schema kiểm kê/BH.
- Checklist restore, đối soát, cutover và rollback có xử lý giao dịch phát sinh mới.
- Sổ câu hỏi về BH ngày cuối tháng, xuất lại, tuổi tồn, khách trùng, SN tái nhập và các luồng ngoại lệ.

Xem IMPLEMENTATION_NOTES.md để phân biệt bổ sung kỹ thuật với quyết định cần xác nhận. Không thêm phase 10 để xử lý những ghi chú này; giải quyết tại phase phụ thuộc.
