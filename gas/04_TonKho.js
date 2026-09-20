// =========================================================================
// THÀNH AN ERP v4.0 - MODULE 04: TỒN KHO & LỌC ĐA NĂNG (04_TonKho.gs)
// Nghiệp vụ: Tra cứu tồn kho, Tính ngày đọng hàng, Lọc theo thời gian nhập kho
// =========================================================================

/**
 * Lấy danh sách tồn kho có hỗ trợ bộ lọc đa năng (Lọc ngày nhập, số ngày đọng kho)
 * Hỗ trợ cả trả toàn bộ (legacy) lẫn phân trang nếu truyền { page, pageSize }
 */
function getTonKhoList(filters) {
  filters = filters || {};
  if (filters.page || filters.pageSize) {
    return getStockPage({
      page: filters.page,
      pageSize: filters.pageSize,
      keyword: filters.keyword || filters.q,
      warehouse: filters.kho,
      category: filters.nhom,
      agingDays: filters.minDays
    });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 17).getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let fromDate = null;
  let toDate = null;

  if (filters.fromDate) {
    const p = filters.fromDate.split('-');
    fromDate = new Date(p[0], p[1] - 1, p[2]);
    fromDate.setHours(0,0,0,0);
  }
  if (filters.toDate) {
    const p = filters.toDate.split('-');
    toDate = new Date(p[0], p[1] - 1, p[2]);
    toDate.setHours(23,59,59,999);
  }

  const tonKho = [];
  data.forEach((r, index) => {
    const status = String(r[9] || '').trim();
    if (status === "Tồn kho" || status === "IN_STOCK") {
      let ngayNhapDate = null;
      let ngayNhapStr = "--/--/----";

      if (r[7] instanceof Date && !isNaN(r[7].getTime())) {
        ngayNhapDate = r[7];
        ngayNhapStr = Utilities.formatDate(r[7], "GMT+7", "dd/MM/yyyy");
      } else if (r[7]) {
        ngayNhapStr = String(r[7]).trim();
        if (ngayNhapStr.includes('-')) {
          const p = ngayNhapStr.split('-');
          ngayNhapDate = new Date(p[0], p[1] - 1, p[2]);
        } else if (ngayNhapStr.includes('/')) {
          const p = ngayNhapStr.split('/');
          ngayNhapDate = new Date(p[2], p[1] - 1, p[0]);
        }
      }

      let soNgayLuuKho = 0;
      if (ngayNhapDate && !isNaN(ngayNhapDate.getTime())) {
        const dCheck = new Date(ngayNhapDate.getTime());
        dCheck.setHours(0,0,0,0);
        soNgayLuuKho = Math.max(0, Math.floor((today - dCheck) / (1000 * 60 * 60 * 24)));
      }

      // Kiểm tra điều kiện lọc ngày
      if (fromDate && ngayNhapDate && ngayNhapDate < fromDate) return;
      if (toDate && ngayNhapDate && ngayNhapDate > toDate) return;

      // Kiểm tra lọc số ngày đọng kho
      if (filters.minDays && soNgayLuuKho < Number(filters.minDays)) return;
      if (filters.maxDays && soNgayLuuKho > Number(filters.maxDays)) return;

      // Kiểm tra kho và nhóm hàng
      if (filters.kho && String(r[5]).trim() !== filters.kho) return;
      if (filters.nhom && String(r[3]).trim() !== filters.nhom) return;

      tonKho.push({
        rowId: index + 2,
        serial: String(r[0] || '').trim(),
        model: String(r[1] || '').trim(),
        tenHang: String(r[2] || '').trim(),
        nhomHang: String(r[3] || '').trim(),
        loaiHang: String(r[4] || '').trim(),
        kho: String(r[5] || '').trim(),
        ncc: String(r[6] || '').trim(),
        ngayNhap: ngayNhapStr,
        maPhieu: String(r[8] || '').trim(),
        ghiChu: String(r[16] || '').trim(),
        soNgayLuuKho: soNgayLuuKho
      });
    }
  });

  return tonKho;
}

function updateThietBi(rowId, serial, model, kho, ncc, ghiChu) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  const spSheet = ss.getSheetByName("DM_SAN_PHAM");

  const cleanSerial = String(serial).trim().toUpperCase();
  const targetRow = Number(rowId);

  // Check trùng
  const allSerials = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < allSerials.length; i++) {
    if (String(allSerials[i][0]).trim().toUpperCase() === cleanSerial && (i + 2) !== targetRow) {
      throw new Error(`Mã Serial [${cleanSerial}] đã tồn tại trên một thiết bị khác!`);
    }
  }

  let tenHang = "", nhomHang = "";
  if (spSheet && spSheet.getLastRow() > 1) {
    const spData = spSheet.getRange(2, 1, spSheet.getLastRow() - 1, 3).getValues();
    for (let r of spData) {
      if (String(r[0]).toUpperCase() === String(model).toUpperCase()) {
        tenHang = r[1];
        nhomHang = r[2];
        break;
      }
    }
  }

  tbSheet.getRange(targetRow, 1).setValue(cleanSerial);
  tbSheet.getRange(targetRow, 2, 1, 3).setValues([[model, tenHang, nhomHang]]);
  tbSheet.getRange(targetRow, 6, 1, 2).setValues([[kho, ncc]]);
  tbSheet.getRange(targetRow, 17).setValue(ghiChu || '');

  try {
    let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (logSheet) {
      const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      logSheet.appendRow([timeStr, "Thủ Kho", "SỬA MÁY TRONG KHO", cleanSerial, `Đổi Model: ${model}, Kho: ${kho}`]);
    }
  } catch(e){}

  return "Cập nhật thiết bị thành công!";
}

function deleteThietBi(rowId, reason) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  const targetRow = Number(rowId);
  const sn = String(tbSheet.getRange(targetRow, 1).getValue() || '').trim();
  const cancelReason = String(reason || 'Hủy do nhập sai/hỏng hóc/thanh lý').trim();

  // SERIAL WRITE SAFETY: Soft Void, tuyệt đối không xóa dòng cứng làm đứt gãy dữ liệu
  // Chuyển trạng thái sang VOID và ghi chú lý do
  tbSheet.getRange(targetRow, 10).setValue("VOID");
  const currentNote = String(tbSheet.getRange(targetRow, 17).getValue() || '').trim();
  const updatedNote = currentNote ? `${currentNote} | [VOID: ${cancelReason}]` : `[VOID: ${cancelReason}]`;
  tbSheet.getRange(targetRow, 17).setValue(updatedNote);

  try {
    let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (logSheet) {
      const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      logSheet.appendRow([timeStr, "Admin/Quản Lý", "HỦY THIẾT BỊ (VOID)", sn, `Chuyển trạng thái VOID. Lý do: ${cancelReason}`]);
    }
  } catch(e){}

  return "Đã hủy thiết bị khỏi tồn kho an toàn (trạng thái VOID, bảo tồn lịch sử)!";
}
