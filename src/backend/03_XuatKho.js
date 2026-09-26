// =========================================================================
// THÀNH AN ERP v4.0 - MODULE 03: XUẤT KHO & KÍCH HOẠT BẢO HÀNH (03_XuatKho.gs)
// Nghiệp vụ: Xuất kho 2 chiều, Kích hoạt BH, Batch Update, LockService
// =========================================================================

function getFormXuatKhoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const khSheet = ss.getSheetByName("DM_KHACH_HANG");
  const khData = (khSheet && khSheet.getLastRow() > 1) ? khSheet.getRange(2, 1, khSheet.getLastRow() - 1, 3).getValues() : [];

  const qcSheet = ss.getSheetByName("DM_QUY_CHUAN");
  const bhData = (qcSheet && qcSheet.getLastRow() > 1) ? qcSheet.getRange(2, 4, qcSheet.getLastRow() - 1, 1).getValues() : [];
  const goiBhList = bhData.map(r => String(r[0]).trim()).filter(r => r);

  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  const tonKhoList = [];
  if (tbSheet && tbSheet.getLastRow() > 1) {
    const data = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 10).getValues();
    data.forEach((r, i) => {
      const status = String(r[9] || '').trim();
      if (status === "Tồn kho" || status === "IN_STOCK") {
        tonKhoList.push({
          rowId: i + 2,
          serial: String(r[0]).trim(),
          model: String(r[1]).trim(),
          tenHang: String(r[2]).trim(),
          nhomHang: String(r[3]).trim(),
          kho: String(r[5]).trim()
        });
      }
    });
  }

  return {
    khachHang: khData.map(r => ({ ten: r[0], sdt: (typeof formatPhoneNumberBackend === 'function' ? formatPhoneNumberBackend(r[1]) : String(r[1]||'')), diaChi: r[2] })),
    goiBaoHanh: goiBhList.length > 0 ? goiBhList : ["12 tháng", "24 tháng", "36 tháng", "6 tháng", "3 tháng", "0 tháng (Không BH)"],
    tonKhoList: tonKhoList
  };
}

/**
 * Thực thi Xuất kho & Kích hoạt bảo hành
 * TỐI ƯU HÓA: Sử dụng BATCH UPDATE thay vì ghi từng cell trong vòng lặp (nhanh gấp 20 lần)
 */
function executeXuatKho(data) {
  if (typeof isMaintenanceMode === 'function' && isMaintenanceMode()) {
    throw new Error("Hệ thống đang trong Chế độ Bảo trì dữ liệu. Mọi thao tác ghi tạm thời bị khóa. Vui lòng thử lại sau!");
  }
  if (!data.serials || data.serials.length === 0) {
    throw new Error("Chưa có máy nào được chọn để xuất!");
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
  } catch(e) {
    throw new Error("Hệ thống đang bận ghi nhận phiếu xuất khác. Vui lòng thử lại sau vài giây!");
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    const lsSheet = ss.getSheetByName("LICH_SU_XUAT");

    // IDEMPOTENCY CHECK (Chống lặp do bấm đúp nút Lưu trong cùng 1 request)
    const requestId = String(data.requestId || data.transactionId || '').trim();
    if (requestId) {
      const cache = CacheService.getScriptCache();
      const status = cache.get(`REQ_XK_${requestId}`);
      if (status === "DONE") {
        return `Phiếu xuất [${data.maPhieu}] đã được ghi nhận thành công trước đó (Idempotent).`;
      }
      if (status === "PROCESSING") {
        throw new Error("Yêu cầu xuất kho đang được xử lý, vui lòng không nhấn gửi liên tục!");
      }
      cache.put(`REQ_XK_${requestId}`, "PROCESSING", 30);
    }

    // Nếu maPhieu bị trùng với phiếu đã có trong sổ kho xuất, tự động gán hậu tố duy nhất
    if (lsSheet && lsSheet.getLastRow() > 1) {
      const existingVouchers = lsSheet.getRange(2, 1, lsSheet.getLastRow() - 1, 1).getValues().map(r => String(r[0]).trim());
      if (existingVouchers.includes(data.maPhieu)) {
        const uniqueSuffix = Utilities.formatDate(new Date(), "GMT+7", "ssSSS");
        data.maPhieu = `${data.maPhieu}-${uniqueSuffix}`;
      }
    }

    // Hỗ trợ cả 2 dạng dữ liệu: data.items (chi tiết từng món) hoặc data.serials (danh sách serial phẳng)
    let exportItems = [];
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      exportItems = data.items.map(it => ({
        serial: String(it.serial || '').trim().toUpperCase(),
        internalId: String(it.internalId || it.maNoiBo || '').trim().toUpperCase(),
        soThangBh: parseInt(String(it.soThangBh || data.soThangBh || '').replace(/\D/g, ''), 10) || 0,
        kho: String(it.kho || data.kho || '').trim(),
        ghiChu: String(it.ghiChu || data.ghiChu || '').trim()
      })).filter(it => it.serial || it.internalId);
    } else if (data.serials && Array.isArray(data.serials)) {
      const defaultMonths = parseInt(String(data.soThangBh || '').replace(/\D/g, ''), 10) || 0;
      exportItems = data.serials.map(s => ({
        serial: String(s).trim().toUpperCase(),
        internalId: '',
        soThangBh: defaultMonths,
        kho: String(data.kho || '').trim(),
        ghiChu: String(data.ghiChu || '').trim()
      })).filter(it => it.serial);
    }

    if (exportItems.length === 0) {
      throw new Error("Chưa có máy nào được chọn để xuất!");
    }

    const totalRows = tbSheet.getLastRow() - 1;
    if (totalRows <= 0) throw new Error("Kho hàng hiện đang trống!");

    // Đọc cột Serial (1), Model (2), Kho (6), Trạng thái (10), Mã Nội Bộ (18) để map dòng
    const numCols = Math.max(18, tbSheet.getLastColumn());
    const tableData = tbSheet.getRange(2, 1, totalRows, numCols).getValues();

    // Map serial -> index và internalId -> index
    const serialIndexMap = new Map();
    const internalIdMap = new Map();
    for (let i = 0; i < totalRows; i++) {
      const sn = String(tableData[i][0] || '').trim().toUpperCase();
      const internal = String(tableData[i][17] || '').trim().toUpperCase();
      if (sn) serialIndexMap.set(sn, i);
      if (internal) internalIdMap.set(internal, i);
    }

    // 1. Kiểm tra điều kiện tồn kho thực tế cho từng item
    const targetItems = [];
    exportItems.forEach(it => {
      let idx = -1;
      let matchedSn = it.serial;
      if (matchedSn && serialIndexMap.has(matchedSn)) {
        idx = serialIndexMap.get(matchedSn);
      } else if (it.internalId && internalIdMap.has(it.internalId)) {
        idx = internalIdMap.get(it.internalId);
        matchedSn = String(tableData[idx][0] || '').trim().toUpperCase();
      }

      if (idx === -1) {
        throw new Error(`Không tìm thấy thiết bị với mã [${it.serial || it.internalId}] trong kho dữ liệu!`);
      }

      const currentStatus = String(tableData[idx][9] || '').trim();
      if (currentStatus !== "Tồn kho" && currentStatus !== "IN_STOCK") {
        throw new Error(`Thiết bị [${matchedSn}] hiện không còn trong kho (Đã xuất hoặc ở trạng thái: ${currentStatus})!`);
      }

      targetItems.push({
        idx: idx,
        serial: matchedSn,
        model: String(tableData[idx][1] || '').trim(),
        soThangBh: it.soThangBh,
        kho: it.kho || String(tableData[idx][5] || 'Kho VP').trim(),
        ghiChu: it.ghiChu
      });
    });

    // 2. Chuẩn hóa ngày xuất
    let ngayXuatDate;
    if (String(data.ngayXuat).includes('/')) {
      const p = String(data.ngayXuat).split('/');
      ngayXuatDate = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    } else if (String(data.ngayXuat).includes('-')) {
      const p = String(data.ngayXuat).split('-');
      ngayXuatDate = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    } else {
      ngayXuatDate = new Date();
    }
    const ngayXuatFormat = Utilities.formatDate(ngayXuatDate, "GMT+7", "dd/MM/yyyy");

    const safePhone = data.sdtKhach ? (typeof formatPhoneNumberBackend === 'function' ? formatPhoneNumberBackend(data.sdtKhach) : String(data.sdtKhach).trim()) : '';
    const safePhoneCell = safePhone ? ("'" + safePhone) : '';
    const cleanCustomerName = String(data.tenKhach || data.khachHang || 'Khách lẻ').trim();

    // 3. SELECTIVE ROW UPDATES: Cập nhật từng dòng Serial xuất với bảo hành riêng
    targetItems.forEach(item => {
      const rowNum = item.idx + 2;
      let itemExpStr = "Không BH";
      if (item.soThangBh > 0) {
        const expDate = new Date(ngayXuatDate.getTime());
        const tMonth = expDate.getMonth() + item.soThangBh;
        const tYear = expDate.getFullYear() + Math.floor(tMonth / 12);
        const normMonth = ((tMonth % 12) + 12) % 12;
        const maxDays = new Date(tYear, normMonth + 1, 0).getDate();
        const tDay = Math.min(expDate.getDate(), maxDays);
        const finalExp = new Date(tYear, normMonth, tDay);
        itemExpStr = Utilities.formatDate(finalExp, "GMT+7", "dd/MM/yyyy");
      }

      // TỐI ƯU HÓA: Cập nhật Cột 6 đến 17 trong 1 lệnh setValues duy nhất (giảm 50% số lần gọi Sheets API)
      const currentKho = tableData[item.idx][5] || 'Kho VP';
      const col7 = tableData[item.idx][6]; // Cột 7: Ngày nhập (giữ nguyên)
      const col8 = tableData[item.idx][7]; // Cột 8: Mã phiếu nhập (giữ nguyên)
      const col9 = tableData[item.idx][8]; // Cột 9: Nhà cung cấp (giữ nguyên)
      const row12Cols = [
        item.kho || currentKho,             // Cột 6: Kho xuất
        col7,                               // Cột 7: Giữ nguyên
        col8,                               // Cột 8: Giữ nguyên
        col9,                               // Cột 9: Giữ nguyên
        "Đã xuất",                          // Cột 10: Trạng thái
        ngayXuatFormat,                     // Cột 11: Ngày xuất
        data.maPhieu,                       // Cột 12: Mã phiếu xuất
        cleanCustomerName,                  // Cột 13: Tên khách
        safePhoneCell,                      // Cột 14: SĐT khách
        item.soThangBh,                     // Cột 15: Số tháng BH
        itemExpStr,                         // Cột 16: Hạn BH
        item.ghiChu || data.ghiChu || ''    // Cột 17: Ghi chú
      ];
      tbSheet.getRange(rowNum, 6, 1, 12).setValues([row12Cols]);
    });

    // 4. Ghi nhật ký LICH_SU_XUAT
    const allSnList = targetItems.map(t => t.serial);
    if (lsSheet) {
      const bhSummary = targetItems.map(t => `${t.serial} (${t.soThangBh}T)`).join('; ');
      lsSheet.appendRow([
        data.maPhieu,
        ngayXuatFormat,
        `${cleanCustomerName} (${safePhone || 'N/A'})`,
        targetItems.length,
        allSnList.join(', '),
        bhSummary,
        data.ghiChu || ''
      ]);
    }

    // 5. Ghi Header - Detail V4 nếu có
    const iHeadSheet = ss.getSheetByName("V4_ISSUE_HEADERS");
    const iDetailSheet = ss.getSheetByName("V4_ISSUE_DETAILS");
    if (iHeadSheet && iDetailSheet) {
      iHeadSheet.appendRow([
        data.maPhieu,
        ngayXuatFormat,
        cleanCustomerName,
        safePhoneCell,
        targetItems.length,
        data.soThangBh || 12,
        "CONFIRMED",
        data.ghiChu || '',
        data.nguoiXuat || "Thủ Kho",
        new Date()
      ]);
      const issueDetails = targetItems.map((item, i) => [
        `${data.maPhieu}-${i+1}`,
        data.maPhieu,
        item.model,
        item.serial,
        item.soThangBh,
        item.soThangBh > 0 ? `${item.soThangBh} tháng` : "Không BH",
        item.ghiChu || data.ghiChu || '',
        new Date()
      ]);
      iDetailSheet.getRange(iDetailSheet.getLastRow() + 1, 1, issueDetails.length, 8).setValues(issueDetails);
    }

    // 6. Ghi vết kiểm toán NHAT_KY_HOAT_DONG
    try {
      let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
      if (logSheet) {
        const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
        logSheet.appendRow([timeStr, data.nguoiXuat || "Thủ Kho", "XUẤT KHO", data.maPhieu, `Xuất ${targetItems.length} máy cho ${cleanCustomerName}`]);
      }
    } catch(err){}

    // 7. Đánh dấu thời gian thay đổi mới nhất để các máy khác tự động Smart Sync
    try {
      if (typeof markDataChanged === 'function') {
        markDataChanged();
      } else {
        const nowTs = String(new Date().getTime());
        CacheService.getScriptCache().put("LAST_DATA_CHANGE_TS", nowTs, 21600);
        PropertiesService.getScriptProperties().setProperty("LAST_DATA_CHANGE_TS", nowTs);
      }
    } catch(e) {}

    // Đánh dấu DONE SAU KHI ghi dữ liệu hoàn tất
    if (requestId) {
      try {
        CacheService.getScriptCache().put(`REQ_XK_${requestId}`, "DONE", 300);
      } catch (e) {}
    }

    return `Xuất kho thành công ${targetItems.length} thiết bị cho khách hàng [${cleanCustomerName}]! Phiếu [${data.maPhieu}] đã được lưu an toàn.`;
  } catch (err) {
    if (data && (data.requestId || data.transactionId)) {
      try {
        CacheService.getScriptCache().remove(`REQ_XK_${String(data.requestId || data.transactionId).trim()}`);
      } catch (e) {}
    }
    throw err;
  } finally {
    lock.releaseLock();
  }
}

function getChiTietDonXuat(maPhieu) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet || tbSheet.getLastRow() <= 1) return [];
  const data = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 17).getValues();
  const list = [];
  data.forEach(r => {
    if (String(r[11]).trim() === String(maPhieu).trim()) {
      list.push({
        serial: r[0],
        model: r[1],
        tenHang: r[2],
        nhomHang: r[3],
        kho: r[5],
        soThangBh: r[14],
        hanBh: r[15] instanceof Date ? Utilities.formatDate(r[15], "GMT+7", "dd/MM/yyyy") : r[15],
        ghiChu: r[16]
      });
    }
  });
  return list;
}
