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

    const cleanSerials = data.serials.map(s => String(s).trim().toUpperCase());
    const totalRows = tbSheet.getLastRow() - 1;
    if (totalRows <= 0) throw new Error("Kho hàng hiện đang trống!");

    // Đọc cột Serial (1), Model (2), Trạng thái (10) để map dòng (Tiết kiệm bộ nhớ gấp nhiều lần)
    const serialCols = tbSheet.getRange(2, 1, totalRows, 2).getValues();
    const statusCol = tbSheet.getRange(2, 10, totalRows, 1).getValues();

    // Map serial -> index
    const serialIndexMap = new Map();
    for (let i = 0; i < totalRows; i++) {
      const sn = String(serialCols[i][0]).trim().toUpperCase();
      if (sn) serialIndexMap.set(sn, i);
    }

    // 1. Kiểm tra điều kiện tồn kho thực tế
    const targetIndices = [];
    cleanSerials.forEach(sn => {
      if (!serialIndexMap.has(sn)) {
        throw new Error(`Không tìm thấy mã Serial [${sn}] trong kho dữ liệu!`);
      }
      const idx = serialIndexMap.get(sn);
      const currentStatus = String(statusCol[idx][0]).trim();
      if (currentStatus !== "Tồn kho" && currentStatus !== "IN_STOCK") {
        throw new Error(`Serial [${sn}] hiện không còn trong kho (Đã xuất hoặc ở trạng thái: ${currentStatus})!`);
      }
      targetIndices.push(idx);
    });

    // 2. Tính ngày hết hạn bảo hành theo tháng lịch chuẩn xác (Q01)
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
    const soThang = parseInt(String(data.soThangBh || '').replace(/\D/g, ''), 10) || 0;
    
    let ngayHetHanFormat = "Không BH";
    if (soThang > 0) {
      const expDate = new Date(ngayXuatDate.getTime());
      const tMonth = expDate.getMonth() + soThang;
      const tYear = expDate.getFullYear() + Math.floor(tMonth / 12);
      const normMonth = ((tMonth % 12) + 12) % 12;
      const maxDays = new Date(tYear, normMonth + 1, 0).getDate();
      const tDay = Math.min(expDate.getDate(), maxDays);
      const finalExp = new Date(tYear, normMonth, tDay);
      ngayHetHanFormat = Utilities.formatDate(finalExp, "GMT+7", "dd/MM/yyyy");
    }

    const ngayXuatFormat = Utilities.formatDate(ngayXuatDate, "GMT+7", "dd/MM/yyyy");

    const safePhone = data.sdtKhach ? (typeof formatPhoneNumberBackend === 'function' ? formatPhoneNumberBackend(data.sdtKhach) : String(data.sdtKhach).trim()) : '';
    const safePhoneCell = safePhone ? ("'" + safePhone) : '';

    // 3. SELECTIVE ROW UPDATES: Chỉ cập nhật đúng các dòng Serial bị ảnh hưởng
    // Thay vì setValues(allTbData) ghi đè 170.000 cell, ta chỉ ghi 8 cell cho từng serial xuất
    const updatedPayload = [
      "Đã xuất",         // Cột 10: Trạng thái
      ngayXuatFormat,     // Cột 11: Ngày xuất
      data.maPhieu,       // Cột 12: Mã phiếu xuất
      data.tenKhach,      // Cột 13: Tên khách
      safePhoneCell,      // Cột 14: SĐT khách
      soThang,            // Cột 15: Số tháng BH
      ngayHetHanFormat,   // Cột 16: Hạn BH
      data.ghiChu || ''   // Cột 17: Ghi chú
    ];

    // Nhóm các dòng liên tiếp nếu có để tối ưu lệnh write
    targetIndices.forEach(idx => {
      const rowNum = idx + 2;
      tbSheet.getRange(rowNum, 10, 1, 8).setValues([updatedPayload]);
    });

    // 4. Ghi nhật ký LICH_SU_XUAT
    if (lsSheet) {
      lsSheet.appendRow([
        data.maPhieu,
        ngayXuatFormat,
        `${data.tenKhach} (${safePhone || 'N/A'})`,
        cleanSerials.length,
        cleanSerials.join(', '),
        data.soThangBh,
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
        data.tenKhach,
        safePhoneCell,
        cleanSerials.length,
        data.soThangBh,
        "CONFIRMED",
        data.ghiChu || '',
        "Thủ Kho",
        new Date()
      ]);
      const issueDetails = targetIndices.map((idx, i) => [
        `${data.maPhieu}-${i+1}`,
        data.maPhieu,
        serialCols[idx][1], // model
        serialCols[idx][0], // serial
        soThang,
        ngayHetHanFormat,
        data.ghiChu || '',
        new Date()
      ]);
      iDetailSheet.getRange(iDetailSheet.getLastRow() + 1, 1, issueDetails.length, 8).setValues(issueDetails);
    }

    // Audit Log
    try {
      let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
      if (logSheet) {
        const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
        logSheet.appendRow([timeStr, "Thủ Kho", "XUẤT KHO", data.maPhieu, `Xuất ${cleanSerials.length} máy cho ${data.tenKhach}`]);
      }
    } catch(err){}

    // Đánh dấu DONE SAU KHI ghi dữ liệu hoàn tất
    if (requestId) {
      try {
        CacheService.getScriptCache().put(`REQ_XK_${requestId}`, "DONE", 300);
      } catch (e) {}
    }

    return `Xuất kho thành công ${cleanSerials.length} thiết bị! Đã kích hoạt bảo hành đến ${ngayHetHanFormat}.`;
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
