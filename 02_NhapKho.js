// =========================================================================
// THÀNH AN ERP v4.0 - MODULE 02: NHẬP KHO ĐA THIẾT BỊ (02_NhapKho.gs)
// Nghiệp vụ: Nhập kho Header-Detail, Tự sinh Serial an toàn, Batch Write, LockService
// =========================================================================

function getFormNhapKhoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const spSheet = ss.getSheetByName("DM_SAN_PHAM");
  const spData = (spSheet && spSheet.getLastRow() > 1) ? spSheet.getRange(2, 1, spSheet.getLastRow() - 1, 3).getValues() : [];
  
  const nccSheet = ss.getSheetByName("DM_NCC");
  const nccData = (nccSheet && nccSheet.getLastRow() > 1) ? nccSheet.getRange(2, 1, nccSheet.getLastRow() - 1, 1).getValues() : [];

  const qcSheet = ss.getSheetByName("DM_QUY_CHUAN");
  const qcData = (qcSheet && qcSheet.getLastRow() > 1) ? qcSheet.getRange(2, 1, qcSheet.getLastRow() - 1, 4).getValues() : [];

  const khoList = [], loaiHangList = [];
  qcData.forEach(r => {
    if (r[1]) khoList.push(r[1]);
    if (r[2]) loaiHangList.push(r[2]);
  });

  const tbSheet = ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  const existingSerials = (tbSheet && tbSheet.getLastRow() > 1) 
    ? tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 1).getValues().map(r => String(r[0]).trim().toUpperCase()) 
    : [];

  return {
    products: spData.map(r => ({ model: r[0], ten: r[1], nhom: r[2] })),
    ncc: nccData.map(r => r[0]),
    kho: khoList.length > 0 ? khoList : ['Kho VP', 'Kho Chi Nhánh'],
    loaiHang: loaiHangList.length > 0 ? loaiHangList : ['Mới 100%', 'Chính hãng', 'Thanh lý'],
    existingSerials: existingSerials
  };
}

/**
 * Tự sinh mã Serial an toàn (hỗ trợ tiền tố linh hoạt theo Nhóm/Hãng)
 * Chuẩn: {PREFIX}YYMMDD-XXX
 * Tối ưu: Dùng Sequence Counter trong PropertiesService + LockService (không scan 20.000 dòng)
 */
function generateAutoSerials(count, customPrefix) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfgSheet = ss.getSheetByName("CAU_HINH");

  let prefix = customPrefix || "TA-";
  if (!customPrefix && cfgSheet && cfgSheet.getLastRow() > 1) {
    const cData = cfgSheet.getRange(2, 1, cfgSheet.getLastRow() - 1, 2).getValues();
    const f = cData.find(r => r[0] === 'TIEN_TO_SERIAL');
    if (f && f[1]) prefix = f[1];
  }

  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${prefix}${yy}${mm}${dd}-`;

  const reqCount = Math.min(100, Math.max(1, Number(count) || 1));
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch(e){}

  let startIndex = 0;
  let props = null;
  const seqKey = `SEQ_${datePrefix}`;

  try {
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) {
      props = PropertiesService.getScriptProperties();
      const cachedSeq = props.getProperty(seqKey);
      if (cachedSeq) {
        startIndex = parseInt(cachedSeq, 10) || 0;
      }
    }
  } catch(e){}

  // Nếu chưa có trong cache sequence, quét nhanh 100 dòng cuối của Sheet
  if (startIndex === 0) {
    const tbSheet = ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    if (tbSheet && tbSheet.getLastRow() > 1) {
      const lastRow = tbSheet.getLastRow();
      const scanRows = Math.min(150, lastRow - 1);
      const startScanRow = Math.max(2, lastRow - scanRows + 1);
      const recentSerials = tbSheet.getRange(startScanRow, 1, scanRows, 1).getValues();
      recentSerials.forEach(r => {
        const sn = String(r[0]).trim();
        if (sn.startsWith(datePrefix)) {
          const numPart = parseInt(sn.replace(datePrefix, ''), 10);
          if (!isNaN(numPart) && numPart > startIndex) startIndex = numPart;
        }
      });
    }
  }

  const generated = [];
  for (let i = 1; i <= reqCount; i++) {
    generated.push(`${datePrefix}${String(startIndex + i).padStart(3, '0')}`);
  }

  // Cập nhật lại counter mới
  if (props) {
    try {
      props.setProperty(seqKey, String(startIndex + reqCount));
    } catch(e){}
  }

  try {
    lock.releaseLock();
  } catch(e){}

  return generated;
}

/**
 * Thực thi Nhập kho Đa Model / Nhiều mặt hàng trong 1 phiếu
 * Áp dụng LockService và BATCH UPDATE (tốc độ cao < 1 giây)
 */
function executeNhapKhoMulti(data) {
  if (typeof isMaintenanceMode === 'function' && isMaintenanceMode()) {
    throw new Error("Hệ thống đang trong Chế độ Bảo trì dữ liệu. Mọi thao tác ghi tạm thời bị khóa. Vui lòng thử lại sau!");
  }
  if (!data.items || data.items.length === 0) throw new Error("Chưa có mặt hàng nào trong phiếu nhập!");

  // KHÓA ĐỒNG THỜI (CONCURRENCY LOCK) TRÁNH TRÙNG DỮ LIỆU
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000); // Đợi tối đa 25 giây
  } catch (e) {
    throw new Error("Hệ thống đang bận xử lý một giao dịch khác. Vui lòng thử lại sau vài giây!");
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tbSheet = ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    const lsSheet = ss.getSheetByName("LICH_SU_NHAP");

    // IDEMPOTENCY CHECK (Chống lặp do bấm đúp nút Lưu trong cùng 1 request)
    const requestId = String(data.requestId || data.transactionId || '').trim();
    if (requestId) {
      const cache = CacheService.getScriptCache();
      const status = cache.get(`REQ_NK_${requestId}`);
      if (status === "DONE") {
        return `Phiếu nhập [${data.maPhieu}] đã được lưu thành công trước đó (Idempotent).`;
      }
      if (status === "PROCESSING") {
        throw new Error("Yêu cầu nhập kho đang được xử lý, vui lòng không nhấn gửi liên tục!");
      }
      cache.put(`REQ_NK_${requestId}`, "PROCESSING", 30);
    }

    // Nếu maPhieu bị trùng với phiếu đã có trong sổ kho, tự động gán hậu tố duy nhất để không bị đè hoặc nuốt phiếu
    if (lsSheet && lsSheet.getLastRow() > 1) {
      const existingVouchers = lsSheet.getRange(2, 1, lsSheet.getLastRow() - 1, 1).getValues().map(r => String(r[0]).trim());
      if (existingVouchers.includes(data.maPhieu)) {
        const uniqueSuffix = Utilities.formatDate(new Date(), "GMT+7", "ssSSS");
        data.maPhieu = `${data.maPhieu}-${uniqueSuffix}`;
      }
    }

    // 1. Quét kiểm tra trùng Serial trên toàn bộ các món hàng
    const allCleanSerials = [];
    const internalCheck = new Set();

    data.items.forEach(item => {
      if (!item.serials || !Array.isArray(item.serials)) return;
      item.serials.forEach(s => {
        const sn = String(s).trim().toUpperCase();
        if (!sn) return;
        if (internalCheck.has(sn)) {
          throw new Error(`Serial [${sn}] bị trùng lặp ngay trong phiếu nhập này!`);
        }
        internalCheck.add(sn);
        allCleanSerials.push({ sn, item });
      });
    });

    if (allCleanSerials.length === 0) throw new Error("Chưa có mã Serial nào được nhập!");

    // Check trùng với CSDL Sheet dưới Lock
    const lastRow = tbSheet.getLastRow();
    if (lastRow > 1) {
      const existing = tbSheet.getRange(2, 1, lastRow - 1, 1).getValues().map(r => String(r[0]).trim().toUpperCase());
      const dupes = allCleanSerials.filter(obj => existing.includes(obj.sn));
      if (dupes.length > 0) {
        throw new Error(`Các mã Serial sau đã tồn tại trong hệ thống: ${dupes.map(d => d.sn).join(', ')}`);
      }
    }

    // 2. BATCH WRITE: Ghi toàn bộ máy vào bảng thiết bị trong 1 lần duy nhất
    const newRows = allCleanSerials.map(obj => [
      obj.sn, 
      obj.item.model, 
      obj.item.tenHang, 
      obj.item.nhomHang || 'Khác', 
      data.loaiHang || 'Mới 100%', 
      data.kho || 'Kho VP',
      data.ncc, 
      data.ngayNhap, 
      data.maPhieu, 
      "Tồn kho", 
      "", "", "", "", "", "", 
      data.ghiChu || ''
    ]);
    tbSheet.getRange(lastRow + 1, 1, newRows.length, 17).setValues(newRows);

    // 3. Ghi vào LICH_SU_NHAP
    if (lsSheet) {
      const allSnStr = allCleanSerials.map(d => d.sn).join(', ');
      const modelSummary = data.items.map(i => `${i.model} (${i.serials.length})`).join(' + ');
      lsSheet.appendRow([
        data.maPhieu, 
        data.ngayNhap, 
        data.ncc, 
        modelSummary,
        allCleanSerials.length, 
        allSnStr, 
        data.kho, 
        data.ghiChu || ''
      ]);
    }

    // 4. Nếu có bảng V4_RECEIPT_HEADERS & V4_RECEIPT_DETAILS, ghi Header-Detail chuẩn
    const rHeadSheet = ss.getSheetByName("V4_RECEIPT_HEADERS");
    const rDetailSheet = ss.getSheetByName("V4_RECEIPT_DETAILS");
    if (rHeadSheet && rDetailSheet) {
      rHeadSheet.appendRow([
        data.maPhieu, 
        data.ngayNhap, 
        data.ncc, 
        data.kho, 
        data.loaiHang, 
        allCleanSerials.length, 
        "CONFIRMED", 
        data.ghiChu || '', 
        "Thủ Kho", 
        new Date()
      ]);
      const detailRows = allCleanSerials.map((obj, i) => [
        `${data.maPhieu}-${i+1}`, 
        data.maPhieu, 
        obj.item.model, 
        obj.sn, 
        1, 
        data.ghiChu || '', 
        new Date()
      ]);
      rDetailSheet.getRange(rDetailSheet.getLastRow() + 1, 1, detailRows.length, 7).setValues(detailRows);
    }

    // 5. Ghi Audit Log
    try {
      let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
      if (logSheet) {
        const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
        logSheet.appendRow([timeStr, "Thủ Kho", "NHẬP KHO", data.maPhieu, `Nhập ${allCleanSerials.length} thiết bị từ ${data.ncc}`]);
      }
    } catch(err){}

    // Đánh dấu DONE SAU KHI ghi dữ liệu hoàn tất
    if (requestId) {
      try {
        CacheService.getScriptCache().put(`REQ_NK_${requestId}`, "DONE", 300);
      } catch (e) {}
    }

    return `Đã nhập thành công lô hàng ${allCleanSerials.length} thiết bị (${data.items.length} chủng loại)!`;
  } catch (err) {
    if (data && (data.requestId || data.transactionId)) {
      try {
        CacheService.getScriptCache().remove(`REQ_NK_${String(data.requestId || data.transactionId).trim()}`);
      } catch (e) {}
    }
    throw err;
  } finally {
    lock.releaseLock();
  }
}

function getChiTietDonNhap(maPhieu) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet || tbSheet.getLastRow() <= 1) return [];
  const data = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 17).getValues();
  const list = [];
  data.forEach(r => {
    if (String(r[8]).trim() === String(maPhieu).trim()) {
      list.push({
        serial: r[0],
        model: r[1],
        tenHang: r[2],
        nhomHang: r[3],
        kho: r[5],
        trangThai: r[9],
        ngayXuat: r[10] instanceof Date ? Utilities.formatDate(r[10], "GMT+7", "dd/MM/yyyy") : (r[10] || '-'),
        khachHang: r[12] || '-'
      });
    }
  });
  return list;
}
