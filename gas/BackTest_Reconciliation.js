// =========================================================================
// THÀNH AN ERP v4.0 - MODULE BACK-TEST & RECONCILIATION KIỂM TOÁN (BackTest_Reconciliation.gs)
// Nhiệm vụ: Tự động chạy 7 kịch bản kiểm tra đối chiếu dữ liệu trước và sau Migration
// =========================================================================

function runReconciliationAudit() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = {
    testDate: new Date(),
    allPassed: true,
    totalTests: 7,
    passedCount: 0,
    failedCount: 0,
    details: []
  };

  const addTest = (id, name, pass, expected, actual, note) => {
    if (pass) results.passedCount++;
    else {
      results.failedCount++;
      results.allPassed = false;
    }
    results.details.push({
      id: id,
      name: name,
      passed: pass,
      expected: expected,
      actual: actual,
      note: note
    });
  };

  // 1. LẤY DỮ LIỆU NGUỒN V3
  const v3TbSheet = ss.getSheetByName("DATA_THIET_BI");
  const v3NhapSheet = ss.getSheetByName("LICH_SU_NHAP");
  const v3XuatSheet = ss.getSheetByName("LICH_SU_XUAT");

  if (!v3TbSheet) {
    throw new Error("Không tìm thấy bảng nguồn DATA_THIET_BI để đối chiếu!");
  }

  const v3TbData = (v3TbSheet.getLastRow() > 1) ? v3TbSheet.getRange(2, 1, v3TbSheet.getLastRow() - 1, 17).getValues() : [];
  const v3TotalSerials = v3TbData.filter(r => String(r[0] || '').trim()).length;
  const v3TonKhoCount = v3TbData.filter(r => String(r[9] || '').trim() === "Tồn kho").length;
  const v3DaXuatCount = v3TbData.filter(r => String(r[9] || '').trim() === "Đã xuất").length;

  // 2. LẤY DỮ LIỆU ĐÍCH V4
  const v4MasterSheet = ss.getSheetByName("V4_SERIAL_MASTER");
  const v4ReceiptHead = ss.getSheetByName("V4_RECEIPT_HEADERS");
  const v4ReceiptDetail = ss.getSheetByName("V4_RECEIPT_DETAILS");
  const v4IssueHead = ss.getSheetByName("V4_ISSUE_HEADERS");
  const v4IssueDetail = ss.getSheetByName("V4_ISSUE_DETAILS");

  if (!v4MasterSheet) {
    throw new Error("Chưa khởi tạo hoặc chưa chạy migration sang V4_SERIAL_MASTER!");
  }

  const v4MasterData = (v4MasterSheet.getLastRow() > 1) ? v4MasterSheet.getRange(2, 1, v4MasterSheet.getLastRow() - 1, 20).getValues() : [];
  const v4TotalSerials = v4MasterData.filter(r => String(r[0] || '').trim()).length;
  const v4TonKhoCount = v4MasterData.filter(r => String(r[9] || '').trim() === "IN_STOCK" || String(r[9] || '').trim() === "Tồn kho").length;
  const v4DaXuatCount = v4MasterData.filter(r => String(r[9] || '').trim() === "SOLD" || String(r[9] || '').trim() === "Đã xuất").length;

  // BT-01: TỔNG SỐ LƯỢNG SERIAL
  addTest(
    "BT-01",
    "Tổng số lượng Serial Number",
    v3TotalSerials === v4TotalSerials,
    v3TotalSerials,
    v4TotalSerials,
    v3TotalSerials === v4TotalSerials ? "Khớp chính xác 100%" : "Sai lệch số lượng Serial sau migration!"
  );

  // BT-02: SỐ LƯỢNG MÁY TỒN KHO
  addTest(
    "BT-02",
    "Số lượng thiết bị Tồn kho",
    v3TonKhoCount === v4TonKhoCount,
    v3TonKhoCount,
    v4TonKhoCount,
    v3TonKhoCount === v4TonKhoCount ? "Khớp hoàn toàn số lượng máy tồn kho" : "Lệch số máy tồn kho!"
  );

  // BT-03: SỐ LƯỢNG MÁY ĐÃ XUẤT
  addTest(
    "BT-03",
    "Số lượng thiết bị Đã xuất bán",
    v3DaXuatCount === v4DaXuatCount,
    v3DaXuatCount,
    v4DaXuatCount,
    v3DaXuatCount === v4DaXuatCount ? "Khớp hoàn toàn số lượng máy đã xuất" : "Lệch số máy đã xuất!"
  );

  // BT-04: TOÀN VẸN CHI TIẾT PHIẾU NHẬP
  let v3TotalSnInNhap = 0;
  if (v3NhapSheet && v3NhapSheet.getLastRow() > 1) {
    const nhapData = v3NhapSheet.getRange(2, 6, v3NhapSheet.getLastRow() - 1, 1).getValues();
    nhapData.forEach(r => {
      const sArr = String(r[0] || '').split(',').map(s => s.trim()).filter(s => s);
      v3TotalSnInNhap += sArr.length;
    });
  }
  const v4DetailNhapCount = (v4ReceiptDetail && v4ReceiptDetail.getLastRow() > 1) ? v4ReceiptDetail.getLastRow() - 1 : 0;
  addTest(
    "BT-04",
    "Toàn vẹn Chi tiết Dòng Phiếu Nhập (Receipt Details)",
    v3TotalSnInNhap === v4DetailNhapCount,
    v3TotalSnInNhap,
    v4DetailNhapCount,
    v3TotalSnInNhap === v4DetailNhapCount ? "Phân rã chuỗi serial thành Detail khớp 100%" : "Có Serial trong lịch sử nhập chưa được phân rã!"
  );

  // BT-05: TOÀN VẸN CHI TIẾT PHIẾU XUẤT
  let v3TotalSnInXuat = 0;
  if (v3XuatSheet && v3XuatSheet.getLastRow() > 1) {
    const xuatData = v3XuatSheet.getRange(2, 5, v3XuatSheet.getLastRow() - 1, 1).getValues();
    xuatData.forEach(r => {
      const sArr = String(r[0] || '').split(',').map(s => s.trim()).filter(s => s);
      v3TotalSnInXuat += sArr.length;
    });
  }
  const v4DetailXuatCount = (v4IssueDetail && v4IssueDetail.getLastRow() > 1) ? v4IssueDetail.getLastRow() - 1 : 0;
  addTest(
    "BT-05",
    "Toàn vẹn Chi tiết Dòng Phiếu Xuất (Issue Details)",
    v3TotalSnInXuat === v4DetailXuatCount,
    v3TotalSnInXuat,
    v4DetailXuatCount,
    v3TotalSnInXuat === v4DetailXuatCount ? "Phân rã chuỗi serial xuất thành Detail khớp 100%" : "Có Serial trong lịch sử xuất chưa được phân rã!"
  );

  // BT-06: CHÍNH XÁC HẠN BẢO HÀNH CỦA CÁC MÁY ĐÃ XUẤT
  let warrantyMismatches = 0;
  v4MasterData.forEach(r4 => {
    const sn = String(r4[0]).trim().toUpperCase();
    const r3 = v3TbData.find(m => String(m[0]).trim().toUpperCase() === sn);
    if (r3) {
      let exp3 = r3[15] instanceof Date ? Utilities.formatDate(r3[15], "GMT+7", "dd/MM/yyyy") : String(r3[15] || '').trim();
      let exp4 = String(r4[15] || '').trim();
      if (exp3 !== exp4) {
        warrantyMismatches++;
      }
    }
  });
  addTest(
    "BT-06",
    "Toàn vẹn Hạn Bảo Hành của thiết bị",
    warrantyMismatches === 0,
    "0 sai lệch",
    `${warrantyMismatches} sai lệch`,
    warrantyMismatches === 0 ? "Toàn bộ hạn bảo hành được bảo tồn chính xác tuyệt đối" : "Phát hiện sai lệch ngày hết hạn BH!"
  );

  // BT-07: CHỐNG SERIAL MỒ CÔI (ORPHAN SERIALS)
  let orphanCount = 0;
  v4MasterData.forEach(r => {
    const maNhap = String(r[8] || '').trim();
    if (!maNhap) orphanCount++;
  });
  addTest(
    "BT-07",
    "Kiểm tra Serial không có nguồn gốc (Orphan Check)",
    orphanCount === 0,
    "0 serial mồ côi",
    `${orphanCount} mồ côi`,
    orphanCount === 0 ? "100% Serial đều gắn liền với Mã phiếu nhập hợp lệ" : "Cảnh báo: Có Serial thiếu mã phiếu nhập gốc!"
  );

  return results;
}
