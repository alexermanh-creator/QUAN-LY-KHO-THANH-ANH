// =========================================================================
// THÀNH AN ERP v4.0 - MODULE MIGRATION V3 -> V4 (ETL Engine)
// Nhiệm vụ: Chuyển đổi dữ liệu phẳng từ V3 sang mô hình quan hệ V4 chuẩn hóa
// An toàn 100%: Chỉ đọc từ tab V3, không sửa/xóa bất kỳ dữ liệu cũ nào
// =========================================================================

function formatPhoneHelper(phone) {
  if (phone === null || phone === undefined || phone === '') return '';
  let s = String(phone).trim();
  if (s.startsWith("'")) s = s.substring(1).trim();
  const cleanDigits = s.replace(/\D/g, '');
  if (/^[1-9]\d{8}$/.test(cleanDigits)) return '0' + cleanDigits;
  if (/^0\d{9}$/.test(cleanDigits)) return cleanDigits;
  if (!s.startsWith('0') && /^[1-9]/.test(s)) return '0' + s;
  return s;
}

function runMigrationV3toV4() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = {
    startTime: new Date(),
    tablesCreated: [],
    serialsMigrated: 0,
    receiptsMigrated: 0,
    receiptDetailsMigrated: 0,
    issuesMigrated: 0,
    issueDetailsMigrated: 0,
    status: "SUCCESS",
    messages: []
  };

  // 1. KIỂM TRA NGUỒN V3
  const v3TbSheet = ss.getSheetByName("DATA_THIET_BI");
  if (!v3TbSheet || v3TbSheet.getLastRow() <= 1) {
    throw new Error("Không tìm thấy tab dữ liệu nguồn DATA_THIET_BI hoặc tab không có dữ liệu!");
  }

  // 2. KHỞI TẠO CÁC TAB ĐÍCH V4 (NẾU CHƯA CÓ)
  const getOrCreateSheet = (name, headers) => {
    let s = ss.getSheetByName(name);
    if (!s) {
      s = ss.insertSheet(name);
      s.appendRow(headers);
      s.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
      report.tablesCreated.push(name);
    }
    return s;
  };

  const v4MasterSheet = getOrCreateSheet("V4_SERIAL_MASTER", [
    "Serial Number", "Model", "Tên Hàng Hóa", "Nhóm Hàng", "Loại Hàng", "Vị Trí Kho",
    "Nhà Cung Cấp", "Ngày Nhập", "Mã Phiếu Nhập", "Trạng Thái", "Ngày Xuất",
    "Mã Phiếu Xuất", "Khách Hàng", "SĐT Khách", "Số Tháng BH", "Hạn Bảo Hành",
    "Ghi Chú", "Record Status", "Created At", "Updated At"
  ]);

  const v4ReceiptHead = getOrCreateSheet("V4_RECEIPT_HEADERS", [
    "Receipt ID", "Ngày Nhập", "Nhà Cung Cấp", "Kho Nhập", "Loại Hàng", "Tổng Số Lượng",
    "Trạng Thái", "Ghi Chú", "Người Tạo", "Created At"
  ]);

  const v4ReceiptDetail = getOrCreateSheet("V4_RECEIPT_DETAILS", [
    "Detail ID", "Receipt ID", "Model", "Serial Number", "Số Lượng", "Ghi Chú", "Created At"
  ]);

  const v4IssueHead = getOrCreateSheet("V4_ISSUE_HEADERS", [
    "Issue ID", "Ngày Xuất", "Khách Hàng", "SĐT Khách", "Tổng Số Lượng", "Gói Bảo Hành",
    "Trạng Thái", "Ghi Chú", "Người Tạo", "Created At"
  ]);

  const v4IssueDetail = getOrCreateSheet("V4_ISSUE_DETAILS", [
    "Detail ID", "Issue ID", "Model", "Serial Number", "Số Tháng BH", "Hạn BH", "Ghi Chú", "Created At"
  ]);

  const v4HistorySheet = getOrCreateSheet("V4_SERIAL_HISTORY", [
    "History ID", "Serial Number", "Thời Gian", "Loại Hành Động", "Mã Chứng Từ",
    "Kho / Vị Trí", "Trạng Thái Đổi Thành", "Người Thực Hiện", "Ghi Chú"
  ]);

  // 3. MIGRATION SERIAL MASTER
  const v3Data = v3TbSheet.getRange(2, 1, v3TbSheet.getLastRow() - 1, 17).getValues();
  const v4MasterRows = [];
  const historyRows = [];
  const now = new Date();

  v3Data.forEach((r, idx) => {
    const sn = String(r[0] || '').trim().toUpperCase();
    if (!sn) return;

    const rawStatus = String(r[9] || '').trim();
    let normStatus = "IN_STOCK";
    if (rawStatus === "Đã xuất" || rawStatus === "SOLD") normStatus = "SOLD";

    let ngayNhapStr = r[7] instanceof Date ? Utilities.formatDate(r[7], "GMT+7", "dd/MM/yyyy") : String(r[7] || '');
    let ngayXuatStr = r[10] instanceof Date ? Utilities.formatDate(r[10], "GMT+7", "dd/MM/yyyy") : String(r[10] || '');
    let expStr = r[15] instanceof Date ? Utilities.formatDate(r[15], "GMT+7", "dd/MM/yyyy") : String(r[15] || '');

    v4MasterRows.push([
      sn,
      String(r[1] || '').trim(),
      String(r[2] || '').trim(),
      String(r[3] || 'Khác').trim(),
      String(r[4] || 'Mới 100%').trim(),
      String(r[5] || 'Kho VP').trim(),
      String(r[6] || '').trim(),
      ngayNhapStr,
      String(r[8] || '').trim(),
      normStatus,
      ngayXuatStr,
      String(r[11] || '').trim(),
      String(r[12] || '').trim(),
      formatPhoneHelper(r[13]),
      r[14] || 0,
      expStr,
      String(r[16] || '').trim(),
      "ACTIVE",
      now,
      now
    ]);

    // Tạo sự kiện mở đầu trong lịch sử
    historyRows.push([
      `HIST-INIT-${idx+1}`,
      sn,
      ngayNhapStr || Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy"),
      "MIGRATION_IMPORT",
      String(r[8] || 'LEGACY-V3').trim(),
      String(r[5] || 'Kho VP').trim(),
      normStatus,
      "Migration Engine",
      "Khởi tạo từ dữ liệu V3"
    ]);

    if (normStatus === "SOLD" && ngayXuatStr) {
      historyRows.push([
        `HIST-EXP-${idx+1}`,
        sn,
        ngayXuatStr,
        "MIGRATION_EXPORT",
        String(r[11] || 'LEGACY-V3').trim(),
        String(r[12] || 'Khách hàng').trim(),
        "SOLD",
        "Migration Engine",
        `Xuất bán cho ${r[12]}`
      ]);
    }
  });

  // Xóa dữ liệu cũ nếu chạy lại batch V4 (giữ header)
  if (v4MasterSheet.getLastRow() > 1) {
    v4MasterSheet.getRange(2, 1, v4MasterSheet.getLastRow() - 1, 20).clearContent();
  }
  if (v4MasterRows.length > 0) {
    v4MasterSheet.getRange(2, 1, v4MasterRows.length, 20).setValues(v4MasterRows);
    report.serialsMigrated = v4MasterRows.length;
  }

  if (v4HistorySheet.getLastRow() > 1) {
    v4HistorySheet.getRange(2, 1, v4HistorySheet.getLastRow() - 1, 9).clearContent();
  }
  if (historyRows.length > 0) {
    v4HistorySheet.getRange(2, 1, historyRows.length, 9).setValues(historyRows);
  }

  // 4. MIGRATION CHỨNG TỪ NHẬP KHO (PHÂN RÃ SERIAL DETAIL)
  const lsNhapSheet = ss.getSheetByName("LICH_SU_NHAP");
  if (lsNhapSheet && lsNhapSheet.getLastRow() > 1) {
    const lsNhapData = lsNhapSheet.getRange(2, 1, lsNhapSheet.getLastRow() - 1, 8).getValues();
    const rHeadRows = [];
    const rDetailRows = [];
    let detailCount = 0;

    lsNhapData.forEach(r => {
      const maphieu = String(r[0] || '').trim();
      if (!maphieu) return;

      const rawSnStr = String(r[5] || '').trim();
      const snArr = rawSnStr.split(',').map(s => s.trim().toUpperCase()).filter(s => s);

      rHeadRows.push([
        maphieu,
        r[1] instanceof Date ? Utilities.formatDate(r[1], "GMT+7", "dd/MM/yyyy") : String(r[1] || ''),
        String(r[2] || '').trim(),
        String(r[6] || 'Kho VP').trim(),
        "Chính hãng",
        snArr.length || Number(r[4] || 1),
        "CONFIRMED",
        String(r[7] || '').trim(),
        "Admin (Legacy)",
        now
      ]);

      snArr.forEach(sn => {
        detailCount++;
        // Tìm model từ V4 master
        const found = v4MasterRows.find(m => m[0] === sn);
        rDetailRows.push([
          `${maphieu}-${detailCount}`,
          maphieu,
          found ? found[1] : String(r[3] || ''),
          sn,
          1,
          String(r[7] || ''),
          now
        ]);
      });
    });

    if (v4ReceiptHead.getLastRow() > 1) v4ReceiptHead.getRange(2, 1, v4ReceiptHead.getLastRow() - 1, 10).clearContent();
    if (rHeadRows.length > 0) v4ReceiptHead.getRange(2, 1, rHeadRows.length, 10).setValues(rHeadRows);

    if (v4ReceiptDetail.getLastRow() > 1) v4ReceiptDetail.getRange(2, 1, v4ReceiptDetail.getLastRow() - 1, 7).clearContent();
    if (rDetailRows.length > 0) v4ReceiptDetail.getRange(2, 1, rDetailRows.length, 7).setValues(rDetailRows);

    report.receiptsMigrated = rHeadRows.length;
    report.receiptDetailsMigrated = rDetailRows.length;
  }

  // 5. MIGRATION CHỨNG TỪ XUẤT KHO (PHÂN RÃ DETAIL)
  const lsXuatSheet = ss.getSheetByName("LICH_SU_XUAT");
  if (lsXuatSheet && lsXuatSheet.getLastRow() > 1) {
    const lsXuatData = lsXuatSheet.getRange(2, 1, lsXuatSheet.getLastRow() - 1, 7).getValues();
    const iHeadRows = [];
    const iDetailRows = [];
    let detailCount = 0;

    lsXuatData.forEach(r => {
      const maphieu = String(r[0] || '').trim();
      if (!maphieu) return;

      const rawSnStr = String(r[4] || '').trim();
      const snArr = rawSnStr.split(',').map(s => s.trim().toUpperCase()).filter(s => s);

      iHeadRows.push([
        maphieu,
        r[1] instanceof Date ? Utilities.formatDate(r[1], "GMT+7", "dd/MM/yyyy") : String(r[1] || ''),
        String(r[2] || '').trim(),
        "", // SĐT
        snArr.length || Number(r[3] || 1),
        String(r[5] || '12 tháng').trim(),
        "CONFIRMED",
        String(r[6] || '').trim(),
        "Admin (Legacy)",
        now
      ]);

      snArr.forEach(sn => {
        detailCount++;
        const found = v4MasterRows.find(m => m[0] === sn);
        iDetailRows.push([
          `${maphieu}-${detailCount}`,
          maphieu,
          found ? found[1] : 'Thiết bị',
          sn,
          found ? found[14] : 12,
          found ? found[15] : '--/--/----',
          String(r[6] || ''),
          now
        ]);
      });
    });

    if (v4IssueHead.getLastRow() > 1) v4IssueHead.getRange(2, 1, v4IssueHead.getLastRow() - 1, 10).clearContent();
    if (iHeadRows.length > 0) v4IssueHead.getRange(2, 1, iHeadRows.length, 10).setValues(iHeadRows);

    if (v4IssueDetail.getLastRow() > 1) v4IssueDetail.getRange(2, 1, v4IssueDetail.getLastRow() - 1, 8).clearContent();
    if (iDetailRows.length > 0) v4IssueDetail.getRange(2, 1, iDetailRows.length, 8).setValues(iDetailRows);

    report.issuesMigrated = iHeadRows.length;
    report.issueDetailsMigrated = iDetailRows.length;
  }

  report.endTime = new Date();
  report.durationSeconds = (report.endTime - report.startTime) / 1000;
  return report;
}
