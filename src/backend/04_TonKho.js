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

function updateThietBiSafe(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet) throw new Error("Không tìm thấy sheet SERIAL_MASTER");

  const oldSerial = String(data.oldSerial || '').trim().toUpperCase();
  const newSerial = String(data.newSerial || data.serial || '').trim().toUpperCase();
  const targetRow = findRowBySerial(tbSheet, oldSerial);
  if (targetRow === -1) throw new Error(`Không tìm thấy thiết bị với serial [${oldSerial}]`);

  if (newSerial !== oldSerial) {
    const dupRow = findRowBySerial(tbSheet, newSerial);
    if (dupRow !== -1 && dupRow !== targetRow) {
      throw new Error(`Serial mới [${newSerial}] đã tồn tại trên một máy khác!`);
    }
  }

  if (newSerial) tbSheet.getRange(targetRow, 1).setValue(newSerial);
  if (data.model) tbSheet.getRange(targetRow, 2).setValue(data.model);
  if (data.tenHang) tbSheet.getRange(targetRow, 3).setValue(data.tenHang);
  if (data.kho) tbSheet.getRange(targetRow, 6).setValue(data.kho);
  if (data.internalId) tbSheet.getRange(targetRow, 18).setValue(data.internalId);

  // 1. ĐỒNG BỘ 2 CHIỀU VÀO DANH MỤC SẢN PHẨM (DM_SAN_PHAM)
  if (data.model) {
    try {
      const newModel = String(data.model).trim();
      const newTenHang = String(data.tenHang || newModel).trim();
      let spSheet = ss.getSheetByName("DM_SAN_PHAM");
      if (!spSheet) {
        spSheet = ss.insertSheet("DM_SAN_PHAM");
        spSheet.appendRow(["Mã Model", "Tên Sản Phẩm", "Nhóm Hàng", "Đơn Vị Tính", "Hãng SX", "Bảo Hành (Tháng)", "Ghi Chú"]);
      }
      let foundModelRow = -1;
      const lastRowSp = spSheet.getLastRow();
      if (lastRowSp > 1) {
        const spData = spSheet.getRange(2, 1, lastRowSp - 1, 2).getValues();
        for (let i = 0; i < spData.length; i++) {
          if (String(spData[i][0]).trim().toUpperCase() === newModel.toUpperCase()) {
            foundModelRow = i + 2;
            break;
          }
        }
      }
      if (foundModelRow !== -1) {
        // Đã có trong danh mục: cập nhật Tên sản phẩm nếu có
        if (newTenHang) spSheet.getRange(foundModelRow, 2).setValue(newTenHang);
      } else {
        // Chưa có trong danh mục: TỰ ĐỘNG THÊM MỚI VÀO DANH MỤC HỆ THỐNG
        const brand = newModel.split(' ')[0] || 'Chính Hãng';
        spSheet.appendRow([newModel, newTenHang, "Phần cứng", "Chiếc", brand, 12, "Tự động tạo từ Đính chính Tồn kho"]);
      }
    } catch(errSp) {
      Logger.log("Lỗi đồng bộ DM_SAN_PHAM: " + errSp.message);
    }
  }

  // 2. ĐỒNG BỘ SANG CHỨNG TỪ GỐC (LICH_SU_NHAP) NẾU CÓ
  try {
    const lsNhapSheet = ss.getSheetByName("LICH_SU_NHAP");
    if (lsNhapSheet && lsNhapSheet.getLastRow() > 1) {
      const numRows = Math.min(200, lsNhapSheet.getLastRow() - 1);
      const startRow = Math.max(2, lsNhapSheet.getLastRow() - numRows + 1);
      const lsData = lsNhapSheet.getRange(startRow, 1, numRows, 6).getValues();
      for (let i = 0; i < lsData.length; i++) {
        let serialsCol = String(lsData[i][5] || '');
        if (serialsCol.toUpperCase().includes(oldSerial)) {
          serialsCol = serialsCol.replace(new RegExp(oldSerial, 'gi'), newSerial);
          lsNhapSheet.getRange(startRow + i, 6).setValue(serialsCol);
          if (data.model) {
            lsNhapSheet.getRange(startRow + i, 4).setValue(data.model);
          }
          break;
        }
      }
    }
  } catch(errLs) {
    Logger.log("Lỗi đồng bộ LICH_SU_NHAP: " + errLs.message);
  }

  try {
    let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (logSheet) {
      const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      logSheet.appendRow([timeStr, "Admin/Quản Lý", "ĐÍNH CHÍNH THIẾT BỊ", newSerial, `Sửa từ [${oldSerial}] sang [${newSerial} | ${data.model || ''}]. Lý do: ${data.reason || 'Sửa thông tin'}`]);
    }
  } catch(e){}

  return { success: true, message: `Đã đính chính thiết bị [${newSerial}] và đồng bộ Danh mục thành công!` };
}

function transferSingleDevice(serial, targetKho, note) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet) throw new Error("Không tìm thấy sheet SERIAL_MASTER");

  const clean = String(serial || '').trim().toUpperCase();
  const targetRow = findRowBySerial(tbSheet, clean);
  if (targetRow === -1) throw new Error(`Không tìm thấy thiết bị [${clean}]`);

  const oldKho = String(tbSheet.getRange(targetRow, 6).getValue() || '');
  tbSheet.getRange(targetRow, 6).setValue(targetKho);

  try {
    let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (logSheet) {
      const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      logSheet.appendRow([timeStr, "Thủ Kho", "ĐIỀU CHUYỂN KHO", clean, `Chuyển từ [${oldKho}] sang [${targetKho}]. ${note || ''}`]);
    }
  } catch(e){}

  return { success: true, message: `Đã chuyển thiết bị [${clean}] sang [${targetKho}] thành công!` };
}

function findRowBySerial(sheet, serial) {
  const clean = String(serial || '').trim().toUpperCase();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === clean) {
      return i + 2;
    }
  }
  return -1;
}

function updateThietBi(rowId, serial, model, kho, ncc, ghiChu) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  const spSheet = ss.getSheetByName("DM_SAN_PHAM");

  const cleanSerial = String(serial).trim().toUpperCase();
  let targetRow = Number(rowId);
  if (isNaN(targetRow) || targetRow < 2) {
    targetRow = findRowBySerial(tbSheet, cleanSerial);
  }
  if (targetRow === -1) throw new Error(`Không tìm thấy thiết bị [${cleanSerial}]`);

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
  let targetRow = Number(rowId);
  if (isNaN(targetRow) || targetRow < 2) {
    targetRow = findRowBySerial(tbSheet, String(rowId).trim().toUpperCase());
  }
  if (targetRow === -1) throw new Error(`Không tìm thấy thiết bị để hủy`);

  const sn = String(tbSheet.getRange(targetRow, 1).getValue() || '').trim();
  const cancelReason = String(reason || 'Hủy do nhập sai/hỏng hóc/thanh lý').trim();

  // SERIAL WRITE SAFETY: Soft Void, tuyệt đối không xóa dòng cứng làm đứt gãy dữ liệu
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
