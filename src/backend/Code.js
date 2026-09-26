// =========================================================================
// THÀNH AN ERP v4.0 - BACKEND CHÍNH (Code.gs)
// Nền tảng: Google Apps Script + Google Sheets
// Kiến trúc: Serial-Centric Architecture
// =========================================================================

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('THÀNH AN ERP v4.0 - Quản Trị Kho & Vòng Đời Thiết Bị')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Chuẩn hóa và bảo toàn số 0 ở đầu cho SĐT
 */
function formatPhoneNumberBackend(phone) {
  if (phone === null || phone === undefined || phone === '') return '';
  let s = String(phone).trim();
  if (s.startsWith("'")) s = s.substring(1).trim();
  const cleanDigits = s.replace(/\D/g, '');
  if (/^[1-9]\d{8}$/.test(cleanDigits)) {
    return '0' + cleanDigits;
  }
  if (/^0\d{9}$/.test(cleanDigits)) {
    return cleanDigits;
  }
  if (!s.startsWith('0') && /^[1-9]/.test(s)) {
    return '0' + s;
  }
  return s;
}

/**
 * Tải dữ liệu ban đầu siêu tốc vào RAM (Init Engine - V4 Slim Bootstrap)
 * Mặc định trả config, catalog và summary gọn nhẹ; tránh load toàn bộ hàng chục nghìn Serial gây quá tải
 */
function getInitAppData(options) {
  const opts = options || {};
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // TỰ ĐỘNG NẠP CƠ SỞ DỮ LIỆU CHUẨN HÓA NẾU GOOGLE SHEETS ĐANG TRỐNG
  const spSheetCheck = ss.getSheetByName("DM_SAN_PHAM");
  const tbSheetCheck = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if ((!spSheetCheck || spSheetCheck.getLastRow() <= 1 || !tbSheetCheck || tbSheetCheck.getLastRow() <= 1) && typeof executePopulateStandardizedDatabaseToGoogleSheets === 'function') {
    try {
      executePopulateStandardizedDatabaseToGoogleSheets("654321");
    } catch(errAuto) {
      Logger.log("[GAS] Auto populate error: " + errAuto.message);
    }
  }

  // 1. CÁC BẢNG DANH MỤC CƠ BẢN (Gọn nhẹ, được nén/lọc trường cần thiết)
  const spSheet = ss.getSheetByName("DM_SAN_PHAM");
  const products = (spSheet && spSheet.getLastRow() > 1) 
    ? spSheet.getRange(2, 1, spSheet.getLastRow() - 1, 3).getValues().map((r, i) => ({ rowId: i + 2, model: r[0], ten: r[1], nhom: r[2] })) 
    : [];

  const nccSheet = ss.getSheetByName("DM_NCC");
  const ncc = (nccSheet && nccSheet.getLastRow() > 1) 
    ? nccSheet.getRange(2, 1, nccSheet.getLastRow() - 1, 4).getValues().map((r, i) => ({ rowId: i + 2, tenTat: r[0], tenDayDu: r[1], sdt: formatPhoneNumberBackend(r[2]), ghiChu: r[3] })) 
    : [];

  const khSheet = ss.getSheetByName("DM_KHACH_HANG");
  const khachHang = (khSheet && khSheet.getLastRow() > 1) 
    ? khSheet.getRange(2, 1, khSheet.getLastRow() - 1, Math.min(9, khSheet.getLastColumn())).getValues()
        .map((r, i) => {
          // Xử lý thông minh tương thích cả Sheet chuẩn 9 cột lẫn Sheet cũ 4 cột
          const is9Col = String(r[0] || '').trim().startsWith('KH') || String(r[0] || '').trim().startsWith('CUS') || (r[2] && String(r[2]).replace(/\D/g, '').length >= 8);
          if (is9Col) {
            return {
              rowId: i + 2,
              customerId: String(r[0] || `KH${String(i + 1).padStart(3, '0')}`).trim(),
              ten: String(r[1] || r[0] || '').trim(),
              sdt: formatPhoneNumberBackend(r[2]),
              nguoiLienHe: String(r[3] || '').trim(),
              email: String(r[4] || '').trim(),
              diaChi: String(r[5] || '').trim(),
              mst: String(r[6] || '').trim(),
              nhomKhach: String(r[7] || 'Khách lẻ').trim(),
              ghiChu: String(r[8] || '').trim()
            };
          } else {
            return {
              rowId: i + 2,
              customerId: `KH${String(i + 1).padStart(3, '0')}`,
              ten: String(r[0] || '').trim(),
              sdt: formatPhoneNumberBackend(r[1]),
              nguoiLienHe: '',
              email: '',
              diaChi: String(r[2] || '').trim(),
              mst: '',
              nhomKhach: 'Khách lẻ',
              ghiChu: String(r[3] || '').trim()
            };
          }
        }).filter(k => k.ten) 
    : [];

  const qcSheet = ss.getSheetByName("DM_QUY_CHUAN");
  const nhomHang = [], kho = [], loaiHang = [], baoHanh = [], hangSx = [];
  if (qcSheet && qcSheet.getLastRow() > 1) {
    const headerVal = String(qcSheet.getRange(1, 1).getValue() || '').trim();
    const maxCols = Math.max(5, qcSheet.getLastColumn());
    const allQcRows = qcSheet.getRange(2, 1, qcSheet.getLastRow() - 1, maxCols).getValues();

    if (headerVal === "Loại Quy Chuẩn") {
      // Tương thích ngược: Xử lý dạng dòng Key-Value cũ
      allQcRows.forEach((r, i) => {
        const rowId = i + 2;
        const type = String(r[0] || '').trim().toUpperCase();
        const val = String(r[1] || '').trim();
        if (!val) return;
        if (type === "NHOM_HANG") nhomHang.push({ rowId, col: 1, val });
        else if (type === "KHO") kho.push({ rowId, col: 2, val });
        else if (type === "LOAI_HANG") loaiHang.push({ rowId, col: 3, val });
        else if (type === "BAO_HANH") baoHanh.push({ rowId, col: 4, val });
        else if (type === "HANG_SX") hangSx.push({ rowId, col: 5, val });
      });
    } else {
      // Cấu trúc 5 cột độc lập chuẩn: Cột 1 Nhóm Hàng, Cột 2 Kho Hàng, Cột 3 Loại Hàng, Cột 4 Bảo Hành, Cột 5 Hãng SX
      allQcRows.forEach((r, i) => {
        const rowId = i + 2;
        if (r[0] && String(r[0]).trim()) nhomHang.push({ rowId, col: 1, val: String(r[0]).trim() });
        if (r[1] && String(r[1]).trim()) kho.push({ rowId, col: 2, val: String(r[1]).trim() });
        if (r[2] && String(r[2]).trim()) loaiHang.push({ rowId, col: 3, val: String(r[2]).trim() });
        if (r[3] && String(r[3]).trim()) baoHanh.push({ rowId, col: 4, val: String(r[3]).trim() });
        if (r[4] && String(r[4]).trim()) hangSx.push({ rowId, col: 5, val: String(r[4]).trim() });
      });
    }
  }

  // 2. TÍNH TOÁN METRICS VÀ THU THẬP DỮ LIỆU TỒN KHO/SERIAL (ĐỌC 1 LẦN DUY NHẤT)
  let tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  let totalStock = 0;
  let totalSold = 0;
  let totalWarrantyActive = 0;
  let totalWarrantyWarning = 0;
  let totalWarrantyExpired = 0;
  const distinctModelsSet = new Set();
  const existingSerials = [];
  const tonKhoList = [];
  const baoHanhList = [];
  const allSerialsList = [];

  if (tbSheet && tbSheet.getLastRow() > 1) {
    const numRows = tbSheet.getLastRow() - 1;
    const numCols = Math.min(20, tbSheet.getLastColumn());
    const tbData = tbSheet.getRange(2, 1, numRows, numCols).getValues();

    tbData.forEach((r, idx) => {
      const sn = String(r[0] || '').trim().toUpperCase();
      if (sn) existingSerials.push(sn);

      const statusVal = String(r[9] || '').trim();
      const modelVal = String(r[1] || '').trim();
      const isSold = (statusVal === "Đã xuất" || statusVal === "SOLD");
      const isStock = (statusVal === "Tồn kho" || statusVal === "IN_STOCK");

      const serialItem = {
        rowId: idx + 2,
        serial: sn,
        internalId: String(r[17] || r[0] || ''),
        maNoiBo: String(r[17] || r[0] || ''),
        model: modelVal,
        tenHang: String(r[2] || ''),
        name: String(r[2] || ''),
        nhom: String(r[3] || 'Khác'),
        nhomHang: String(r[3] || 'Khác'),
        category: String(r[3] || 'Khác'),
        loaiHang: String(r[4] || ''),
        kho: String(r[5] || 'Kho VP'),
        warehouse: String(r[5] || 'Kho VP'),
        ncc: String(r[6] || ''),
        supplier: String(r[6] || ''),
        ngayNhap: r[7] instanceof Date ? Utilities.formatDate(r[7], "GMT+7", "dd/MM/yyyy") : String(r[7] || ''),
        maPhieuNhap: String(r[8] || ''),
        maPhieu: String(r[8] || ''),
        status: isSold ? 'SOLD' : 'IN_STOCK',
        ngayXuat: r[10] instanceof Date ? Utilities.formatDate(r[10], "GMT+7", "dd/MM/yyyy") : String(r[10] || ''),
        maPhieuXuat: String(r[11] || ''),
        khachHang: String(r[12] || ''),
        sdtKhach: formatPhoneNumberBackend(r[13]),
        soThangBh: parseInt(String(r[14] || '').replace(/\D/g, '')) || 12,
        warrantyMonths: parseInt(String(r[14] || '').replace(/\D/g, '')) || 12,
        ngayHetHanBh: r[15] instanceof Date ? Utilities.formatDate(r[15], "GMT+7", "dd/MM/yyyy") : String(r[15] || ''),
        ghiChu: String(r[16] || '')
      };

      allSerialsList.push(serialItem);

      if (isStock) {
        totalStock++;
        if (modelVal) distinctModelsSet.add(modelVal);
        tonKhoList.push(serialItem);
      } else if (isSold) {
        totalSold++;
        const expVal = r[15];
        if (expVal) {
          let expDate = null;
          if (expVal instanceof Date && !isNaN(expVal.getTime())) {
            expDate = expVal;
          } else {
            const expStr = String(expVal).trim();
            if (expStr.includes('/')) {
              const p = expStr.split('/');
              expDate = new Date(p[2], p[1] - 1, p[0]);
            }
          }
          if (expDate && !isNaN(expDate.getTime())) {
            expDate.setHours(0, 0, 0, 0);
            const diff = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
            if (diff > 30) totalWarrantyActive++;
            else if (diff >= 0) totalWarrantyWarning++;
            else totalWarrantyExpired++;
          }
        }

        baoHanhList.push(serialItem);
      }
    });
  }

  // 3. LỊCH SỬ PHIẾU NHẬP (Lấy tối đa 200 phiếu gần nhất)
  const lsNhapList = [];
  const lsNhapSheet = ss.getSheetByName("LICH_SU_NHAP");
  if (lsNhapSheet && lsNhapSheet.getLastRow() > 1) {
    const numRows = Math.min(200, lsNhapSheet.getLastRow() - 1);
    const startRow = Math.max(2, lsNhapSheet.getLastRow() - numRows + 1);
    const dataNhap = lsNhapSheet.getRange(startRow, 1, numRows, 8).getValues();
    for (let i = dataNhap.length - 1; i >= 0; i--) {
      const r = dataNhap[i];
      const mp = String(r[0] || '').trim();
      if (!mp) continue;
      const ngayVal = r[1] instanceof Date ? Utilities.formatDate(r[1], "GMT+7", "dd/MM/yyyy") : String(r[1] || '');
      lsNhapList.push({
        maPhieu: mp,
        ngayNhap: ngayVal,
        ngay: ngayVal,
        ncc: String(r[2] || ''),
        modelSummary: String(r[3] || ''),
        soLuong: parseInt(r[4], 10) || 1,
        serials: String(r[5] || ''),
        kho: String(r[6] || 'Kho VP'),
        ghiChu: String(r[7] || ''),
        status: 'CONFIRMED'
      });
    }
  }

  // 4. LỊCH SỬ PHIẾU XUẤT (Lấy tối đa 200 phiếu gần nhất)
  const lsXuatList = [];
  const lsXuatSheet = ss.getSheetByName("LICH_SU_XUAT");
  if (lsXuatSheet && lsXuatSheet.getLastRow() > 1) {
    const numRows = Math.min(200, lsXuatSheet.getLastRow() - 1);
    const startRow = Math.max(2, lsXuatSheet.getLastRow() - numRows + 1);
    const dataXuat = lsXuatSheet.getRange(startRow, 1, numRows, 7).getValues();
    for (let i = dataXuat.length - 1; i >= 0; i--) {
      const r = dataXuat[i];
      const mp = String(r[0] || '').trim();
      if (!mp) continue;
      const ngayVal = r[1] instanceof Date ? Utilities.formatDate(r[1], "GMT+7", "dd/MM/yyyy") : String(r[1] || '');
      const firstSn = String(r[4] || '').split(',')[0].trim().toUpperCase();
      const refItem = allSerialsList.find(s => s.serial === firstSn) || {};
      lsXuatList.push({
        maPhieu: mp,
        ngayXuat: ngayVal,
        ngay: ngayVal,
        khachHang: String(r[2] || ''),
        sdtKhach: refItem.sdtKhach || '',
        kho: refItem.kho || 'Kho VP',
        nguoiTao: String(r[7] || 'Thủ Kho'),
        soLuong: parseInt(r[3], 10) || 1,
        serials: String(r[4] || ''),
        baoHanh: String(r[5] || ''),
        ghiChu: String(r[6] || ''),
        status: 'CONFIRMED'
      });
    }
  }

  // 5. NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (Lấy 100 log mới nhất)
  const auditLogsList = [];
  const logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
  if (logSheet && logSheet.getLastRow() > 1) {
    const numRows = Math.min(100, logSheet.getLastRow() - 1);
    const startRow = Math.max(2, logSheet.getLastRow() - numRows + 1);
    const dataLog = logSheet.getRange(startRow, 1, numRows, 5).getValues();
    for (let i = dataLog.length - 1; i >= 0; i--) {
      const r = dataLog[i];
      const timeStr = r[0] instanceof Date ? Utilities.formatDate(r[0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : String(r[0] || '');
      auditLogsList.push({
        id: 'LOG-' + (startRow + i),
        time: timeStr,
        timestamp: timeStr,
        user: String(r[1] || 'Thủ Kho'),
        action: String(r[2] || 'HỆ THỐNG'),
        target: String(r[3] || ''),
        detail: String(r[4] || '')
      });
    }
  }

  // Cấu hình cảnh báo & hệ thống
  const alertSettings = {
    draftVoucher: true,
    warrantyWaiting: true,
    warrantyOverdue: true,
    stockAging: true,
    stockAgingThreshold: 60,
    openInventory: true
  };

  // Nhận diện tài khoản Google thực tế đang truy cập
  let activeEmail = '';
  try {
    activeEmail = Session.getActiveUser().getEmail();
  } catch(e) {}
  if (!activeEmail) {
    try {
      activeEmail = Session.getEffectiveUser().getEmail();
    } catch(e) {}
  }

  let currentUserInfo = null; // Bắt buộc người dùng phải đăng nhập qua màn hình đăng nhập hệ thống

  const bootstrapData = {
    version: "4.0.0",
    serverTime: Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss"),
    currentUser: currentUserInfo,
    summary: {
      totalStock: totalStock,
      totalModels: distinctModelsSet.size,
      totalSold: totalSold,
      warrantyActive: totalWarrantyActive,
      warrantyWarning: totalWarrantyWarning,
      warrantyExpired: totalWarrantyExpired
    },
    products: products,
    ncc: ncc,
    khachHang: khachHang,
    nhomHang: nhomHang,
    kho: kho,
    loaiHang: loaiHang,
    baoHanh: baoHanh,
    hangSx: hangSx,
    alertSettings: alertSettings,
    existingSerials: existingSerials,
    allSerials: allSerialsList,
    tonKhoList: tonKhoList,
    baoHanhList: baoHanhList,
    lsNhap: lsNhapList,
    lsXuat: lsXuatList,
    auditLogs: auditLogsList
  };

  return bootstrapData;
}

/**
 * API SERVER-SIDE: Phân trang danh sách Tồn kho (Server-side Pagination & Filtering)
 * Định dạng trả về chuẩn: { rows, page, pageSize, total, totalPages }
 */
function getStockPage(params) {
  params = params || {};
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const pageSize = Math.min(200, Math.max(10, parseInt(params.pageSize, 10) || 50));
  const keyword = String(params.keyword || '').trim().toLowerCase();
  const warehouse = String(params.warehouse || '').trim();
  const category = String(params.category || '').trim();
  const agingDays = parseInt(params.agingDays || params.minAgingDays, 10) || 0;
  const maxAgingDays = parseInt(params.maxAgingDays, 10) || 0;
  const fromDateStr = String(params.fromDate || '').trim();
  const toDateStr = String(params.toDate || '').trim();

  let filterFromDate = null;
  let filterToDate = null;
  if (fromDateStr) {
    const p = fromDateStr.split('-');
    filterFromDate = new Date(p[0], p[1] - 1, p[2], 0, 0, 0, 0);
  }
  if (toDateStr) {
    const p = toDateStr.split('-');
    filterToDate = new Date(p[0], p[1] - 1, p[2], 23, 59, 59, 999);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet || tbSheet.getLastRow() <= 1) {
    return { rows: [], page: 1, pageSize: pageSize, total: 0, totalPages: 0 };
  }

  const data = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 17).getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const matched = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    const status = String(r[9] || '').trim();
    if (status !== "Tồn kho" && status !== "IN_STOCK") continue;

    const sn = String(r[0] || '').trim();
    const model = String(r[1] || '').trim();
    const tenHang = String(r[2] || '').trim();
    const nhom = String(r[3] || '').trim();
    const kho = String(r[5] || '').trim();

    if (warehouse && kho !== warehouse) continue;
    if (category && nhom !== category) continue;

    if (keyword) {
      const matchKey = sn.toLowerCase().includes(keyword) || 
                       model.toLowerCase().includes(keyword) || 
                       tenHang.toLowerCase().includes(keyword);
      if (!matchKey) continue;
    }

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
      const d = new Date(ngayNhapDate.getTime());
      d.setHours(0, 0, 0, 0);
      soNgayLuuKho = Math.max(0, Math.floor((today - d) / (1000 * 60 * 60 * 24)));
      if (filterFromDate && d < filterFromDate) continue;
      if (filterToDate && d > filterToDate) continue;
    } else if (filterFromDate || filterToDate) {
      continue;
    }

    if (agingDays > 0 && soNgayLuuKho < agingDays) continue;
    if (maxAgingDays > 0 && soNgayLuuKho > maxAgingDays) continue;

    matched.push({
      rowId: i + 2,
      serial: sn,
      model: model,
      tenHang: tenHang,
      nhomHang: nhom,
      loaiHang: String(r[4] || ''),
      kho: kho,
      ncc: String(r[6] || ''),
      ngayNhap: ngayNhapStr,
      maPhieu: String(r[8] || ''),
      ghiChu: String(r[16] || ''),
      soNgayLuuKho: soNgayLuuKho
    });
  }

  const total = matched.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIdx = (page - 1) * pageSize;
  const pageRows = matched.slice(startIdx, startIdx + pageSize);

  return {
    rows: pageRows,
    page: page,
    pageSize: pageSize,
    total: total,
    totalPages: totalPages
  };
}

/**
 * API SERVER-SIDE: Phân trang Lịch sử Phiếu Nhập
 */
function getImportVoucherPage(filters, page, pageSize) {
  filters = filters || {};
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
  const keyword = String(filters.keyword || '').trim().toLowerCase();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("LICH_SU_NHAP");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { rows: [], page: 1, pageSize: pageSize, total: 0, totalPages: 0 };
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  const matched = [];

  for (let i = data.length - 1; i >= 0; i--) {
    const r = data[i];
    const maPhieu = String(r[0] || '').trim();
    const ncc = String(r[2] || '').trim();
    const model = String(r[3] || '').trim();
    const serials = String(r[5] || '').trim();

    if (keyword) {
      const match = maPhieu.toLowerCase().includes(keyword) || 
                    ncc.toLowerCase().includes(keyword) || 
                    model.toLowerCase().includes(keyword) || 
                    serials.toLowerCase().includes(keyword);
      if (!match) continue;
    }

    matched.push({
      id: i + 1,
      maPhieu: maPhieu,
      ngayNhap: r[1] instanceof Date ? Utilities.formatDate(r[1], "GMT+7", "dd/MM/yyyy") : String(r[1] || ''),
      ncc: ncc || 'Chưa gán',
      model: model,
      soLuong: r[4] || 1,
      serials: serials,
      kho: String(r[6] || 'Kho VP'),
      ghiChu: String(r[7] || '')
    });
  }

  const total = matched.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIdx = (page - 1) * pageSize;

  return {
    rows: matched.slice(startIdx, startIdx + pageSize),
    page: page,
    pageSize: pageSize,
    total: total,
    totalPages: totalPages
  };
}

/**
 * API SERVER-SIDE: Phân trang Lịch sử Phiếu Xuất
 */
function getExportVoucherPage(filters, page, pageSize) {
  filters = filters || {};
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
  const keyword = String(filters.keyword || '').trim().toLowerCase();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("LICH_SU_XUAT");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { rows: [], page: 1, pageSize: pageSize, total: 0, totalPages: 0 };
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  const matched = [];

  for (let i = data.length - 1; i >= 0; i--) {
    const r = data[i];
    const maPhieu = String(r[0] || '').trim();
    const khach = String(r[2] || '').trim();
    const serials = String(r[4] || '').trim();

    if (keyword) {
      const match = maPhieu.toLowerCase().includes(keyword) || 
                    khach.toLowerCase().includes(keyword) || 
                    serials.toLowerCase().includes(keyword);
      if (!match) continue;
    }

    matched.push({
      id: i + 1,
      maPhieu: maPhieu,
      ngayXuat: r[1] instanceof Date ? Utilities.formatDate(r[1], "GMT+7", "dd/MM/yyyy") : String(r[1] || ''),
      khachHang: khach,
      soLuong: r[3] || 1,
      serials: serials,
      baoHanh: r[5],
      ghiChu: String(r[6] || '')
    });
  }

  const total = matched.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIdx = (page - 1) * pageSize;

  return {
    rows: matched.slice(startIdx, startIdx + pageSize),
    page: page,
    pageSize: pageSize,
    total: total,
    totalPages: totalPages
  };
}

/**
 * API SERVER-SIDE: Phân trang Lịch sử Kiểm toán / Nhật ký hoạt động (Audit Log)
 */
function getAuditPage(filters, page, pageSize) {
  filters = filters || {};
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
  const keyword = String(filters.keyword || '').trim().toLowerCase();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
  if (!sheet || sheet.getLastRow() <= 1) {
    return { rows: [], page: 1, pageSize: pageSize, total: 0, totalPages: 0 };
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  const matched = [];

  for (let i = data.length - 1; i >= 0; i--) {
    const r = data[i];
    const timeStr = r[0] instanceof Date ? Utilities.formatDate(r[0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : String(r[0] || '');
    const user = String(r[1] || '');
    const action = String(r[2] || '');
    const target = String(r[3] || '');
    const detail = String(r[4] || '');

    if (keyword) {
      const match = user.toLowerCase().includes(keyword) || 
                    action.toLowerCase().includes(keyword) || 
                    target.toLowerCase().includes(keyword) || 
                    detail.toLowerCase().includes(keyword);
      if (!match) continue;
    }

    matched.push({
      id: i + 1,
      time: timeStr,
      user: user,
      action: action,
      target: target,
      detail: detail
    });
  }

  const total = matched.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIdx = (page - 1) * pageSize;

  return {
    rows: matched.slice(startIdx, startIdx + pageSize),
    page: page,
    pageSize: pageSize,
    total: total,
    totalPages: totalPages
  };
}

/**
 * API SERVER-SIDE: Phân trang Danh sách Thiết bị Bảo Hành
 */
function getWarrantyPage(filters, page, pageSize) {
  filters = filters || {};
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
  const keyword = String(filters.keyword || '').trim().toLowerCase();
  const statusFilter = String(filters.status || '').trim(); // 'ACTIVE', 'WARNING', 'EXPIRED'

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet || tbSheet.getLastRow() <= 1) {
    return { rows: [], page: 1, pageSize: pageSize, total: 0, totalPages: 0 };
  }

  const data = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 17).getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const matched = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    const statusVal = String(r[9] || '').trim();
    if (statusVal !== "Đã xuất" && statusVal !== "SOLD" && !r[15]) continue;

    const sn = String(r[0] || '').trim();
    const model = String(r[1] || '').trim();
    const tenHang = String(r[2] || '').trim();
    const khach = String(r[12] || '').trim();
    const phone = formatPhoneNumberBackend(r[13]);

    if (keyword) {
      const match = sn.toLowerCase().includes(keyword) || 
                    model.toLowerCase().includes(keyword) || 
                    tenHang.toLowerCase().includes(keyword) || 
                    khach.toLowerCase().includes(keyword) || 
                    phone.includes(keyword);
      if (!match) continue;
    }

    let expDate = null;
    let expStr = "--/--/----";
    if (r[15] instanceof Date && !isNaN(r[15].getTime())) {
      expDate = r[15];
      expStr = Utilities.formatDate(r[15], "GMT+7", "dd/MM/yyyy");
    } else if (r[15]) {
      expStr = String(r[15]).trim();
      if (expStr.includes('/')) {
        const p = expStr.split('/');
        expDate = new Date(p[2], p[1] - 1, p[0]);
      }
    }

    let diffDays = -999;
    let statusColor = "RED";
    let statusText = "Hết hạn";
    let badgeType = "EXPIRED";

    if (expDate && !isNaN(expDate.getTime())) {
      expDate.setHours(0, 0, 0, 0);
      diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        statusColor = "GREEN";
        statusText = `Còn ${diffDays} ngày`;
        badgeType = "ACTIVE";
      } else if (diffDays >= 0) {
        statusColor = "YELLOW";
        statusText = `Còn ${diffDays} ngày (Gấp)`;
        badgeType = "WARNING";
      } else {
        statusColor = "RED";
        statusText = `Quá hạn ${Math.abs(diffDays)} ngày`;
        badgeType = "EXPIRED";
      }
    }

    if (statusFilter) {
      const sf = statusFilter.toUpperCase();
      const matchStatus = (sf === badgeType || sf === statusColor ||
                          (sf === 'GREEN' && (badgeType === 'ACTIVE' || statusColor === 'GREEN')) ||
                          (sf === 'YELLOW' && (badgeType === 'WARNING' || statusColor === 'YELLOW')) ||
                          (sf === 'RED' && (badgeType === 'EXPIRED' || statusColor === 'RED')) ||
                          (sf === 'ACTIVE' && (badgeType === 'ACTIVE' || statusColor === 'GREEN')) ||
                          (sf === 'WARNING' && (badgeType === 'WARNING' || statusColor === 'YELLOW')) ||
                          (sf === 'EXPIRED' && (badgeType === 'EXPIRED' || statusColor === 'RED')));
      if (!matchStatus) continue;
    }

    let ngayXuatStr = "--/--/----";
    if (r[10] instanceof Date) ngayXuatStr = Utilities.formatDate(r[10], "GMT+7", "dd/MM/yyyy");
    else if (r[10]) ngayXuatStr = String(r[10]);

    matched.push({
      serial: sn,
      model: model,
      tenHang: tenHang,
      kho: String(r[5] || ''),
      ngayXuat: ngayXuatStr,
      khachHang: khach,
      sdtKhach: phone,
      soThangBh: r[14] || '',
      ngayHetHanBh: expStr,
      statusColor: statusColor,
      statusText: statusText,
      badgeType: badgeType
    });
  }

  const total = matched.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIdx = (page - 1) * pageSize;

  return {
    rows: matched.slice(startIdx, startIdx + pageSize),
    page: page,
    pageSize: pageSize,
    total: total,
    totalPages: totalPages
  };
}

/**
 * API SERVER-SIDE: Tổng hợp KPI Dashboard theo chu kỳ (Hôm nay, 7 ngày, Tháng này, Toàn bộ, Custom)
 */
function getDashboardSummary(period, customFrom, customTo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const vSheet = ss.getSheetByName("V4_RECEIPT_HEADERS") || ss.getSheetByName("LICH_SU_NHAP");
  const xSheet = ss.getSheetByName("V4_ISSUE_HEADERS") || ss.getSheetByName("LICH_SU_XUAT");
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let fromDate = null;
  let toDate = null;

  function parseGasDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val;
    const str = String(val).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3 && parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return null;
  }

  if (period === 'today') {
    fromDate = new Date(today);
    toDate = new Date(today);
    toDate.setHours(23, 59, 59, 999);
  } else if (period === '7days') {
    fromDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    toDate = new Date(today);
    toDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    fromDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === '3months') {
    fromDate = new Date(today.getFullYear(), today.getMonth() - 2, 1, 0, 0, 0, 0);
    toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === '6months') {
    fromDate = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);
    toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === '9months') {
    fromDate = new Date(today.getFullYear(), today.getMonth() - 8, 1, 0, 0, 0, 0);
    toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === '1year') {
    fromDate = new Date(today.getFullYear() - 1, today.getMonth(), 1, 0, 0, 0, 0);
    toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'all') {
    fromDate = null;
    toDate = null;
  } else if (period === 'custom' && customFrom && customTo) {
    fromDate = parseGasDate(customFrom);
    toDate = parseGasDate(customTo);
    if (toDate) toDate.setHours(23, 59, 59, 999);
  }

  // Đếm tồn kho hiện tại (chuẩn hóa Unicode, loại bỏ khoảng trắng và không phân biệt hoa thường)
  let inStockCount = 0;
  if (tbSheet && tbSheet.getLastRow() > 1) {
    const statusCol = tbSheet.getRange(2, 10, tbSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < statusCol.length; i++) {
      const s = String(statusCol[i][0] || '').trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (s === "TON KHO" || s === "IN_STOCK" || s === "IN STOCK" || s === "TON" || s === "LUU KHO" || s === "DANG LUU KHO" || s === "SAN SANG") {
        inStockCount++;
      }
    }
  }

  // Đếm nhập trong kỳ
  let importCount = 0;
  if (vSheet && vSheet.getLastRow() > 1) {
    const isV4Header = (vSheet.getName() === "V4_RECEIPT_HEADERS");
    const numColsToRead = isV4Header ? 5 : 4;
    const vData = vSheet.getRange(2, 2, vSheet.getLastRow() - 1, numColsToRead).getValues();
    vData.forEach(r => {
      const d = parseGasDate(r[0]);
      if (d) {
        if (fromDate && d < fromDate) return;
        if (toDate && d > toDate) return;
        const qty = isV4Header ? parseInt(r[4], 10) : parseInt(r[3], 10);
        importCount += (isNaN(qty) ? 1 : qty);
      }
    });
  }

  // Fallback: Nếu vSheet không có dữ liệu phiếu nhập, đếm trực tiếp từ SERIAL_MASTER
  if (importCount === 0 && tbSheet && tbSheet.getLastRow() > 1) {
    const datesCol = tbSheet.getRange(2, 8, tbSheet.getLastRow() - 1, 1).getValues();
    datesCol.forEach(r => {
      const d = parseGasDate(r[0]);
      if (d) {
        if (fromDate && d < fromDate) return;
        if (toDate && d > toDate) return;
        importCount++;
      }
    });
  }

  // Đếm xuất trong kỳ
  let exportCount = 0;
  if (xSheet && xSheet.getLastRow() > 1) {
    const xData = xSheet.getRange(2, 2, xSheet.getLastRow() - 1, 4).getValues();
    xData.forEach(r => {
      const d = parseGasDate(r[0]);
      if (d) {
        if (fromDate && d < fromDate) return;
        if (toDate && d > toDate) return;
        exportCount += (parseInt(r[3], 10) || 1);
      }
    });
  }

  // Tính toán cảnh báo bảo hành và tồn lâu ngày
  let warrantyWarningCount = 0;
  let agingCount = 0;
  if (tbSheet && tbSheet.getLastRow() > 1) {
    const numRows = tbSheet.getLastRow() - 1;
    const dataSlice = tbSheet.getRange(2, 1, numRows, 17).getValues();
    for (let i = 0; i < dataSlice.length; i++) {
      const r = dataSlice[i];
      const s = String(r[9] || '').trim();
      if (s === "Tồn kho" || s === "IN_STOCK") {
        if (r[7]) {
          let nDate = null;
          if (r[7] instanceof Date) nDate = r[7];
          else if (String(r[7]).includes('/')) {
            const p = String(r[7]).split('/');
            nDate = new Date(p[2], p[1] - 1, p[0]);
          }
          if (nDate && !isNaN(nDate.getTime())) {
            nDate.setHours(0, 0, 0, 0);
            const daysInStock = Math.floor((today - nDate) / (1000 * 60 * 60 * 24));
            if (daysInStock > 60) agingCount++;
          }
        }
      } else if ((s === "Đã xuất" || s === "SOLD") && r[15]) {
        let expDate = null;
        if (r[15] instanceof Date) expDate = r[15];
        else if (String(r[15]).includes('/')) {
          const p = String(r[15]).split('/');
          expDate = new Date(p[2], p[1] - 1, p[0]);
        }
        if (expDate && !isNaN(expDate.getTime())) {
          expDate.setHours(0, 0, 0, 0);
          const diff = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
          if (diff >= 0 && diff <= 30) warrantyWarningCount++;
        }
      }
    }
  }

  return {
    period: period,
    inStock: inStockCount,
    totalStock: inStockCount,
    imported: importCount,
    periodImport: importCount,
    exported: exportCount,
    periodExport: exportCount,
    monthExportCount: exportCount,
    netChange: importCount - exportCount,
    stockChange: importCount - exportCount,
    warrantyWarningCount: warrantyWarningCount,
    warrantyWarning: warrantyWarningCount,
    agingCount: agingCount
  };
}

/**
 * Các API Wrapper chuẩn hóa cho Frontend phân trang (Paged APIs)
 */
function getLichSuNhapPaged(params) {
  params = params || {};
  return getImportVoucherPage({ keyword: params.keyword }, params.page || 1, params.pageSize || 50);
}

function getLichSuXuatPaged(params) {
  params = params || {};
  return getExportVoucherPage({ keyword: params.keyword }, params.page || 1, params.pageSize || 50);
}

function getBaoHanhPaged(params) {
  params = params || {};
  return getWarrantyPage({ keyword: params.keyword, status: params.status }, params.page || 1, params.pageSize || 50);
}

/**
 * Tính năng V4 Mới: Tra cứu nhanh Model & Tồn khả dụng ngay trên Dashboard
 */
function searchModelQuickAvailability(modelKeyword) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet || tbSheet.getLastRow() <= 1) return { found: false };

  const cleanKey = String(modelKeyword || '').trim().toLowerCase();
  if (!cleanKey) return { found: false };

  const data = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 10).getValues();
  const availableSerials = [];
  const warehouseBreakdown = {};

  let matchedModelName = "";
  let matchedProductName = "";

  data.forEach(r => {
    const sn = String(r[0] || '').trim();
    const model = String(r[1] || '').trim();
    const tenHang = String(r[2] || '').trim();
    const kho = String(r[5] || 'Kho VP').trim();
    const status = String(r[9] || '').trim();

    if (model.toLowerCase().includes(cleanKey) || tenHang.toLowerCase().includes(cleanKey)) {
      if (!matchedModelName) {
        matchedModelName = model;
        matchedProductName = tenHang;
      }
      if (status === "Tồn kho" || status === "IN_STOCK") {
        availableSerials.push({ serial: sn, kho: kho, model: model });
        warehouseBreakdown[kho] = (warehouseBreakdown[kho] || 0) + 1;
      }
    }
  });

  return {
    found: availableSerials.length > 0,
    model: matchedModelName,
    productName: matchedProductName,
    totalInStock: availableSerials.length,
    byWarehouse: warehouseBreakdown,
    serials: availableSerials.slice(0, 50)
  };
}
// =========================================================================
// HÀM KHỞI TẠO TOÀN BỘ CƠ SỞ DỮ LIỆU GOOGLE SHEETS TỰ ĐỘNG 100%
// Người dùng chỉ cần bấm nút "Run / Chạy" hàm này 1 lần duy nhất trong Apps Script!
// =========================================================================
function khoiTaoHeThongThanhAnTuDong() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  const createOrGetSheet = (name, headers, headerColor) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const range = sheet.getRange(1, 1, 1, headers.length);
      range.setFontWeight("bold")
           .setFontColor("#ffffff")
           .setBackground(headerColor || "#1e40af")
           .setHorizontalAlignment("center")
           .setVerticalAlignment("middle");
      sheet.setRowHeight(1, 35);
      sheet.setFrozenRows(1);
    }
    return sheet;
  };

  // 1. DANH MỤC SẢN PHẨM (Dữ liệu trắng sạch, chỉ tạo Header)
  const spSheet = createOrGetSheet("DM_SAN_PHAM", ["Mã Model", "Tên Sản Phẩm", "Nhóm Hàng", "ĐVT", "Hãng SX", "Bảo Hành (Tháng)", "Ghi Chú"], "#1e40af");

  // 2. DANH MỤC NHÀ CUNG CẤP (Dữ liệu trắng sạch, chỉ tạo Header)
  const nccSheet = createOrGetSheet("DM_NCC", ["Mã NCC", "Tên Đầy Đủ", "Số Điện Thoại", "Email", "Địa Chỉ", "Người Liên Hệ", "Mã Số Thuế", "Ghi Chú"], "#1e40af");

  // 3. DANH MỤC KHÁCH HÀNG (Dữ liệu trắng sạch, chỉ tạo Header)
  const khSheet = createOrGetSheet("DM_KHACH_HANG", ["Mã Khách Hàng", "Tên Khách Hàng", "Số Điện Thoại", "Người Liên Hệ", "Email", "Địa Chỉ", "Mã Số Thuế", "Nhóm Khách", "Ghi Chú"], "#1e40af");

  // 4. DANH MỤC QUY CHUẨN (Chuẩn 5 cột độc lập: Nhóm Hàng, Kho Hàng, Loại Hàng, Bảo Hành, Hãng SX - Sạch 100%, không dữ liệu mẫu)
  const qcSheet = createOrGetSheet("DM_QUY_CHUAN", ["Nhóm Hàng", "Kho Hàng", "Loại Hàng", "Bảo Hành", "Hãng SX"], "#0f766e");

  // 5. SERIAL MASTER (V4)
  createOrGetSheet("V4_SERIAL_MASTER", [
    "Serial Number", "Model", "Tên Hàng Hóa", "Nhóm Hàng", "Loại Hàng", "Vị Trí Kho",
    "Nhà Cung Cấp", "Ngày Nhập", "Mã Phiếu Nhập", "Trạng Thái", "Ngày Xuất",
    "Mã Phiếu Xuất", "Khách Hàng", "SĐT Khách", "Số Tháng BH", "Hạn Bảo Hành",
    "Ghi Chú", "Record Status", "Created At", "Updated At"
  ], "#15803d");

  // 6. PHIẾU NHẬP
  createOrGetSheet("V4_RECEIPT_HEADERS", [
    "Receipt ID", "Ngày Nhập", "Nhà Cung Cấp", "Kho Nhập", "Loại Hàng", "Tổng Số Lượng",
    "Trạng Thái", "Ghi Chú", "Người Tạo", "Created At"
  ], "#0369a1");

  createOrGetSheet("V4_RECEIPT_DETAILS", [
    "Detail ID", "Receipt ID", "Model", "Serial Number", "Số Lượng", "Ghi Chú", "Created At"
  ], "#0284c7");

  // 7. PHIẾU XUẤT
  createOrGetSheet("V4_ISSUE_HEADERS", [
    "Issue ID", "Ngày Xuất", "Khách Hàng", "SĐT Khách", "Kho Xuất", "Loại Hàng", "Tổng Số Lượng",
    "Trạng Thái", "Ghi Chú", "Người Tạo", "Created At"
  ], "#c2410c");

  createOrGetSheet("V4_ISSUE_DETAILS", [
    "Detail ID", "Issue ID", "Model", "Serial Number", "Số Lượng", "Ghi Chú", "Created At"
  ], "#ea580c");

  // 8. NGƯỜI DÙNG HỆ THỐNG
  const userSheet = createOrGetSheet("USERS", ["Username", "PasswordHash", "FullName", "Role", "Status", "Email", "Phone"], "#475569");
  if (userSheet.getLastRow() === 1) {
    userSheet.appendRow(["admin", "123456", "Quản Trị Viên Thành An", "ADMIN", "ACTIVE", "admin@thanhan.vn", "'0900000001"]);
    userSheet.appendRow(["thukho", "123456", "Thủ Kho Trưởng", "THU_KHO", "ACTIVE", "thukho@thanhan.vn", "'0900000002"]);
    userSheet.appendRow(["ketoan", "123456", "Kế Toán Kho", "KE_TOAN", "ACTIVE", "ketoan@thanhan.vn", "'0900000003"]);
    userSheet.appendRow(["kythuat", "123456", "Kỹ Thuật Viên Bảo Hành", "KY_THUAT", "ACTIVE", "kythuat@thanhan.vn", "'0900000004"]);
  }

  // 9. CẤU HÌNH DOANH NGHIỆP
  const confSheet = createOrGetSheet("CAI_DAT", ["Khóa Cấu Hình", "Giá Trị", "Mô Tả"], "#334155");
  if (confSheet.getLastRow() === 1) {
    confSheet.appendRow(["COMPANY_NAME", "CÔNG TY TNHH THƯƠNG MẠI & DỊCH VỤ THÀNH AN", "Tên doanh nghiệp"]);
    confSheet.appendRow(["COMPANY_HOTLINE", "0988.888.888", "Hotline kỹ thuật và bán hàng"]);
    confSheet.appendRow(["COMPANY_ADDRESS", "Hà Nội, Việt Nam", "Địa chỉ trụ sở"]);
    confSheet.appendRow(["SYSTEM_VERSION", "v4.0 Enterprise", "Phiên bản ERP"]);
  }

  // 10. SAO LƯU DỰ PHÒNG
  createOrGetSheet("SYS_BACKUPS", ["Backup ID", "Thời Gian", "Loại", "File URL", "Dung Lượng", "Người Thực Hiện"], "#4b5563");

  // Tự động điều chỉnh độ rộng cột cho đẹp mắt
  const sheets = ss.getSheets();
  sheets.forEach(s => {
    const lastCol = s.getLastColumn();
    if (lastCol > 0) {
      for (let c = 1; c <= Math.min(lastCol, 15); c++) {
        s.autoResizeColumn(c);
      }
    }
  });

  // Tự động gom file Google Sheet và thư mục Backup vào thư mục "Thành An" trên Google Drive
  try {
    toChucThuMucGoogleDriveThanhAn();
  } catch(driveErr) {
    Logger.log("To chuc thu muc Drive: " + driveErr.message);
  }

  try {
    ui.alert(" THÀNH AN ERP v4.0", "Khởi tạo toàn bộ 10 bảng dữ liệu thành công!\nĐã tự động tạo thư mục 'Thành An' trên Google Drive chứa file Bảng tính và thư mục Sao lưu.\nBạn đã có thể mở Web App để đăng nhập (Tài khoản: admin / Mật khẩu: 123456).", ui.ButtonSet.OK);
  } catch(e) {
    Logger.log("Khoi tao CSDL thanh cong!");
  }
}

// =========================================================================
// HÀM TỔ CHỨC THƯ MỤC "Thành An" TRÊN GOOGLE DRIVE
// Tự động gom file Google Sheet chính và thư mục Backup vào chung 1 nơi
// =========================================================================
function toChucThuMucGoogleDriveThanhAn() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tạo hoặc lấy thư mục chính "Thành An" trên Google Drive
  let thanhAnFolder = null;
  const mainFolders = DriveApp.getFoldersByName("Thành An");
  if (mainFolders.hasNext()) {
    thanhAnFolder = mainFolders.next();
  } else {
    thanhAnFolder = DriveApp.createFolder("Thành An");
  }

  // 2. Chuyển file Google Sheet chính vào thư mục "Thành An"
  try {
    const ssFile = DriveApp.getFileById(ss.getId());
    ssFile.moveTo(thanhAnFolder);
  } catch (e) {
    Logger.log("Chuyen file Google Sheet: " + e.message);
  }

  // 3. Tạo hoặc lấy thư mục con "Sao Lưu & Khôi Phục (Backups)" bên trong "Thành An"
  let backupFolder = null;
  const subFolders = thanhAnFolder.getFoldersByName("Sao Lưu & Khôi Phục (Backups)");
  if (subFolders.hasNext()) {
    backupFolder = subFolders.next();
  } else {
    backupFolder = thanhAnFolder.createFolder("Sao Lưu & Khôi Phục (Backups)");
  }

  return {
    thanhAnFolderUrl: thanhAnFolder.getUrl(),
    backupFolderUrl: backupFolder.getUrl()
  };
}

/**
 * Ghi nhận nhật ký kiểm toán từ Client lên Google Sheet NHAT_KY_HOAT_DONG
 */
function saveClientAuditLog(logItem) {
  try {
    if (!logItem) return { success: false };
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
    if (!logSheet) {
      logSheet = ss.insertSheet("NHAT_KY_HOAT_DONG");
      logSheet.appendRow(["Thời gian", "Người dùng", "Hành động", "Mục tiêu", "Chi tiết"]);
    }
    const timeStr = logItem.time || logItem.timestamp || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    logSheet.appendRow([
      timeStr,
      logItem.user || 'Thủ Kho',
      logItem.action || 'THAO TÁC',
      logItem.target || logItem.voucherCode || '',
      logItem.detail || logItem.reason || ''
    ]);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * Lưu chỉnh sửa thông tin phiếu (Manager/Admin) xuống Google Sheets
 */
function saveVoucherEdit(payload) {
  try {
    if (!payload || !payload.maPhieu) return { success: false, error: 'Thiếu mã phiếu' };
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const type = payload.type; // 'NHAP' hoặc 'XUAT'
    const maPhieu = payload.maPhieu;
    const v = payload.voucher || {};
    const reason = payload.reason || 'Chỉnh sửa phiếu';

    // 1. Cập nhật sheet lịch sử tương ứng
    const sheetName = (type === 'NHAP') ? "LICH_SU_NHAP" : "LICH_SU_XUAT";
    const historySheet = ss.getSheetByName(sheetName);
    if (historySheet && historySheet.getLastRow() > 1) {
      const data = historySheet.getRange(2, 1, historySheet.getLastRow() - 1, 8).getValues();
      for (let i = 0; i < data.length; i++) {
        if (String(data[i][0]).trim() === maPhieu) {
          const row = i + 2;
          if (v.ngay) historySheet.getRange(row, 2).setValue(v.ngay);
          if (type === 'NHAP') {
            if (v.ncc) historySheet.getRange(row, 3).setValue(v.ncc);
            if (v.kho) historySheet.getRange(row, 4).setValue(v.kho);
          } else {
            if (v.khachHang) historySheet.getRange(row, 3).setValue(v.khachHang);
            if (v.sdtKhach) historySheet.getRange(row, 4).setValue(formatPhoneNumberBackend(v.sdtKhach));
            if (v.kho) historySheet.getRange(row, 5).setValue(v.kho);
          }
          if (v.ghiChu) historySheet.getRange(row, 7).setValue(v.ghiChu);
          break;
        }
      }
    }

    // 2. Cập nhật SERIAL_MASTER nếu có danh sách items
    const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    if (tbSheet && tbSheet.getLastRow() > 1 && v.items && v.items.length > 0) {
      const numRows = tbSheet.getLastRow() - 1;
      const serialData = tbSheet.getRange(2, 1, numRows, 18).getValues();
      v.items.forEach(it => {
        for (let i = 0; i < serialData.length; i++) {
          const sn = String(serialData[i][0]).trim();
          if (sn === it.serial || (it.oldSerial && sn === it.oldSerial)) {
            const row = i + 2;
            tbSheet.getRange(row, 1).setValue(it.serial);
            if (it.model) tbSheet.getRange(row, 2).setValue(it.model);
            if (it.loaiHang) tbSheet.getRange(row, 5).setValue(it.loaiHang);
            if (it.kho) tbSheet.getRange(row, 6).setValue(it.kho);
            if (type === 'NHAP') {
              if (v.ncc) tbSheet.getRange(row, 7).setValue(v.ncc);
              if (v.ngay) tbSheet.getRange(row, 8).setValue(v.ngay);
            } else {
              if (v.ngay) tbSheet.getRange(row, 11).setValue(v.ngay);
              if (v.khachHang) tbSheet.getRange(row, 13).setValue(v.khachHang);
              if (v.sdtKhach) tbSheet.getRange(row, 14).setValue(formatPhoneNumberBackend(v.sdtKhach));
              if (it.soThangBh !== undefined) tbSheet.getRange(row, 15).setValue(it.soThangBh + ' tháng');
              if (it.ngayHetHanBh) tbSheet.getRange(row, 16).setValue(it.ngayHetHanBh);
            }
            if (it.internalId) tbSheet.getRange(row, 18).setValue(it.internalId);
            break;
          }
        }
      });
    }

    // 2B. XỬ LÝ HOÀN TRẢ SERIAL NẾU CÓ THIẾT BỊ BỊ GỠ BỎ KHỎI PHIẾU (DIFFERENTIAL ROLLBACK)
    if (tbSheet && payload.removedSerials && Array.isArray(payload.removedSerials) && payload.removedSerials.length > 0) {
      const numRows = tbSheet.getLastRow() - 1;
      if (numRows > 0) {
        const serialCol = tbSheet.getRange(2, 1, numRows, 1).getValues();
        payload.removedSerials.forEach(remSn => {
          for (let i = 0; i < serialCol.length; i++) {
            if (String(serialCol[i][0]).trim() === remSn) {
              const row = i + 2;
              if (type === 'XUAT') {
                tbSheet.getRange(row, 10).setValue('IN_STOCK'); // Hoàn trả tồn kho
                tbSheet.getRange(row, 11).setValue('');          // Xóa ngày xuất
                tbSheet.getRange(row, 12).setValue('');          // Xóa mã phiếu xuất
                tbSheet.getRange(row, 13).setValue('');          // Xóa khách hàng
                tbSheet.getRange(row, 14).setValue('');          // Xóa SĐT khách
              } else {
                tbSheet.getRange(row, 10).setValue('CANCELLED_IMPORT'); // Hủy nhập
              }
              break;
            }
          }
        });
      }
    }

    // 3. Ghi vết kiểm toán vào sheet NHAT_KY_HOAT_DONG
    saveClientAuditLog({
      time: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss"),
      user: payload.user || payload.nguoiSua || 'Quản Lý',
      action: 'SỬA PHIẾU ' + type,
      target: maPhieu,
      detail: `Điều chỉnh thông tin phiếu${payload.removedSerials && payload.removedSerials.length > 0 ? ` (Hoàn trả ${payload.removedSerials.length} serial: ${payload.removedSerials.join(', ')})` : ''}. Lý do: ${reason}`
    });

    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * SỬA NHANH THIẾT BỊ / SERIAL TỪ TỒN KHO HOẶC 360°
 */
function saveQuickEditSerial(payload) {
  try {
    if (!payload || !payload.oldSerial) return { success: false, error: 'Thiếu serial' };
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    if (!tbSheet || tbSheet.getLastRow() <= 1) return { success: false, error: 'Không tìm thấy sheet thiết bị' };

    const numRows = tbSheet.getLastRow() - 1;
    const serialCol = tbSheet.getRange(2, 1, numRows, 1).getValues();
    let foundRow = -1;
    for (let i = 0; i < serialCol.length; i++) {
      if (String(serialCol[i][0]).trim() === payload.oldSerial) {
        foundRow = i + 2;
        break;
      }
    }

    if (foundRow === -1) return { success: false, error: 'Không tìm thấy serial trên sheet' };

    if (payload.newSerial && payload.newSerial !== payload.oldSerial) {
      tbSheet.getRange(foundRow, 1).setValue(payload.newSerial);
    }
    if (payload.model) tbSheet.getRange(foundRow, 2).setValue(payload.model);
    if (payload.tenHang) tbSheet.getRange(foundRow, 3).setValue(payload.tenHang);
    if (payload.loaiHang) tbSheet.getRange(foundRow, 5).setValue(payload.loaiHang);
    if (payload.kho) tbSheet.getRange(foundRow, 6).setValue(payload.kho);
    if (payload.soThangBh !== undefined) tbSheet.getRange(foundRow, 15).setValue(payload.soThangBh + ' tháng');
    if (payload.ngayHetHanBh) tbSheet.getRange(foundRow, 16).setValue(payload.ngayHetHanBh);
    if (payload.ghiChu !== undefined) tbSheet.getRange(foundRow, 17).setValue(payload.ghiChu);
    if (payload.internalId) tbSheet.getRange(foundRow, 18).setValue(payload.internalId);

    saveClientAuditLog({
      time: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss"),
      user: payload.user || 'Quản Lý',
      action: 'SỬA NHANH THIẾT BỊ',
      target: payload.newSerial || payload.oldSerial,
      detail: `Điều chỉnh thông tin thiết bị. Lý do: ${payload.reason || 'Sửa nhanh'}`
    });

    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * LƯU / SỬA TÀI KHOẢN NHÂN VIÊN VÀO SHEET USERS (DYNAMIC RBAC)
 */
function saveUserAccountBackend(userData) {
  try {
    if (!userData || !userData.username) return { success: false, error: "Thiếu username" };
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let uSheet = ss.getSheetByName("USERS");
    if (!uSheet) {
      uSheet = ss.insertSheet("USERS");
      uSheet.appendRow(["Username", "PasswordHash", "FullName", "Role", "Status", "Email", "Phone"]);
    }
    const totalRows = uSheet.getLastRow() - 1;
    let foundRow = -1;
    if (totalRows > 0) {
      const users = uSheet.getRange(2, 1, totalRows, 1).getValues();
      for (let i = 0; i < totalRows; i++) {
        if (String(users[i][0]).toLowerCase().trim() === String(userData.username).toLowerCase().trim()) {
          foundRow = i + 2;
          break;
        }
      }
    }

    let finalPassword = userData.password;
    if (!finalPassword) {
      if (foundRow > 0) {
        finalPassword = String(uSheet.getRange(foundRow, 2).getValue() || '');
      } else {
        finalPassword = 'admin';
      }
    }

    const rowData = [
      userData.username,
      finalPassword,
      userData.fullName || userData.username,
      userData.role || 'THỦ KHO',
      userData.status || 'ACTIVE',
      userData.email || '',
      userData.phone ? ("'" + userData.phone) : ''
    ];
    if (foundRow > 0) {
      uSheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      uSheet.appendRow(rowData);
    }
    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * XÓA TÀI KHOẢN NHÂN VIÊN TRONG SHEET USERS
 */
function deleteUserAccountBackend(username) {
  try {
    username = String(username || '').trim().toLowerCase();
    if (!username || username === 'admin') return { success: false, error: "Không được phép xóa admin" };
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const uSheet = ss.getSheetByName("USERS");
    if (uSheet && uSheet.getLastRow() > 1) {
      const users = uSheet.getRange(2, 1, uSheet.getLastRow() - 1, 1).getValues();
      for (let i = users.length - 1; i >= 0; i--) {
        if (String(users[i][0]).toLowerCase().trim() === username) {
          uSheet.deleteRow(i + 2);
          break;
        }
      }
    }
    return { success: true };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * XÓA KHÁCH HÀNG THEO TÊN HOẶC SỐ ĐIỆN THOẠI TRONG SHEET DM_KHACH_HANG
 */
function deleteCustomerByNameOrPhone(nameOrPhone) {
  try {
    nameOrPhone = String(nameOrPhone || '').trim();
    if (!nameOrPhone) return { success: false, error: "Thiếu thông tin khách hàng" };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("DM_KHACH_HANG");
    let deletedCount = 0;
    if (sheet && sheet.getLastRow() > 1) {
      const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
      for (let i = data.length - 1; i >= 0; i--) {
        const name = String(data[i][1] || '').trim();
        const phone = String(data[i][2] || '').trim();
        if (name.includes(nameOrPhone) || phone.includes(nameOrPhone)) {
          sheet.deleteRow(i + 2);
          deletedCount++;
        }
      }
    }
    if (typeof invalidateMasterCache === 'function') invalidateMasterCache();
    return { success: true, deletedCount: deletedCount };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * HỦY PHIẾU XUẤT VÀ ROLLBACK TOÀN BỘ THIẾT BỊ VỀ TỒN KHO TRÊN GOOGLE SHEETS
 */
function cancelExportVoucherBackend(maPhieu, reason, user) {
  try {
    maPhieu = String(maPhieu || '').trim();
    reason = String(reason || 'Hủy phiếu xuất kho').trim();
    user = String(user || 'Quản Lý').trim();
    if (!maPhieu) throw new Error("Mã phiếu không được để trống!");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    const lsSheet = ss.getSheetByName("LICH_SU_XUAT");
    const iHead = ss.getSheetByName("V4_ISSUE_HEADERS");

    // 1. Rollback SERIAL_MASTER
    let rollbackCount = 0;
    if (tbSheet && tbSheet.getLastRow() > 1) {
      const totalRows = tbSheet.getLastRow() - 1;
      const data = tbSheet.getRange(2, 12, totalRows, 1).getValues(); // Cột 12: Mã phiếu xuất
      for (let i = 0; i < totalRows; i++) {
        if (String(data[i][0]).trim() === maPhieu) {
          const row = i + 2;
          tbSheet.getRange(row, 10).setValue("Tồn kho"); // Cột 10: Trạng thái
          tbSheet.getRange(row, 11).setValue(""); // Cột 11: Ngày xuất
          tbSheet.getRange(row, 12).setValue(""); // Cột 12: Mã phiếu xuất
          tbSheet.getRange(row, 13).setValue(""); // Cột 13: Tên khách
          tbSheet.getRange(row, 14).setValue(""); // Cột 14: SĐT khách
          tbSheet.getRange(row, 15).setValue(""); // Cột 15: Số tháng BH
          tbSheet.getRange(row, 16).setValue(""); // Cột 16: Hạn BH
          rollbackCount++;
        }
      }
    }

    // 2. Cập nhật LICH_SU_XUAT
    if (lsSheet && lsSheet.getLastRow() > 1) {
      const lsData = lsSheet.getRange(2, 1, lsSheet.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < lsData.length; i++) {
        if (String(lsData[i][0]).trim() === maPhieu) {
          const curNote = String(lsSheet.getRange(i + 2, 7).getValue() || '');
          lsSheet.getRange(i + 2, 7).setValue(`[CANCELLED: ${reason}] ${curNote}`.trim());
          break;
        }
      }
    }

    // 3. Cập nhật V4_ISSUE_HEADERS nếu có
    if (iHead && iHead.getLastRow() > 1) {
      const hData = iHead.getRange(2, 1, iHead.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < hData.length; i++) {
        if (String(hData[i][0]).trim() === maPhieu) {
          iHead.getRange(i + 2, 7).setValue("CANCELLED");
          break;
        }
      }
    }

    // 4. Ghi vết kiểm toán NHAT_KY_HOAT_DONG
    try {
      const logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
      if (logSheet) {
        const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
        logSheet.appendRow([timeStr, user, "HỦY PHIẾU XUẤT", maPhieu, `Đã rollback ${rollbackCount} thiết bị về Tồn kho. Lý do: ${reason}`]);
      }
    } catch(e) {}

    if (typeof invalidateMasterCache === 'function') invalidateMasterCache();

    return { success: true, rollbackCount: rollbackCount };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * HỦY PHIẾU NHẬP VÀ DỌN DẸP SERIAL TRÊN GOOGLE SHEETS ĐỂ SẴN SÀNG TÁI NHẬP
 */
function cancelImportVoucherBackend(maPhieu, reason, user) {
  try {
    maPhieu = String(maPhieu || '').trim();
    reason = String(reason || 'Hủy phiếu nhập kho').trim();
    user = String(user || 'Quản Lý').trim();
    if (!maPhieu) throw new Error("Mã phiếu không được để trống!");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    const lsSheet = ss.getSheetByName("LICH_SU_NHAP");
    const rHead = ss.getSheetByName("V4_RECEIPT_HEADERS");

    // 1. Quét SERIAL_MASTER: Xóa các thiết bị thuộc phiếu nhập bị hủy để có thể tái nhập không bị trùng
    let cancelledCount = 0;
    if (tbSheet && tbSheet.getLastRow() > 1) {
      const totalRows = tbSheet.getLastRow() - 1;
      const data = tbSheet.getRange(2, 9, totalRows, 1).getValues(); // Cột 9: Mã phiếu nhập
      for (let i = totalRows - 1; i >= 0; i--) {
        const pNhap = String(data[i][0] || '').trim();
        if (pNhap === maPhieu) {
          tbSheet.deleteRow(i + 2);
          cancelledCount++;
        }
      }
    }

    // 2. Cập nhật LICH_SU_NHAP
    if (lsSheet && lsSheet.getLastRow() > 1) {
      const lsData = lsSheet.getRange(2, 1, lsSheet.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < lsData.length; i++) {
        if (String(lsData[i][0]).trim() === maPhieu) {
          const curNote = String(lsSheet.getRange(i + 2, 8).getValue() || '');
          lsSheet.getRange(i + 2, 8).setValue(`[CANCELLED: ${reason}] ${curNote}`.trim());
          break;
        }
      }
    }

    // 3. Cập nhật V4_RECEIPT_HEADERS nếu có
    if (rHead && rHead.getLastRow() > 1) {
      const hData = rHead.getRange(2, 1, rHead.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < hData.length; i++) {
        if (String(hData[i][0]).trim() === maPhieu) {
          rHead.getRange(i + 2, 7).setValue("CANCELLED");
          break;
        }
      }
    }

    // 4. Audit Log
    try {
      const logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
      if (logSheet) {
        const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
        logSheet.appendRow([timeStr, user, "HỦY PHIẾU NHẬP", maPhieu, `Hủy phiếu nhập và dọn dẹp ${cancelledCount} thiết bị để sẵn sàng tái nhập. Lý do: ${reason}`]);
      }
    } catch(e) {}

    if (typeof invalidateMasterCache === 'function') invalidateMasterCache();
    markDataChanged();

    return { success: true, cancelledCount: cancelledCount };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

/**
 * Đánh dấu mốc thời gian cập nhật dữ liệu để hỗ trợ Smart Sync siêu nhẹ (<0.1s)
 */
function markDataChanged() {
  try {
    const ts = String(new Date().getTime());
    if (typeof CacheService !== 'undefined' && CacheService.getScriptCache) {
      CacheService.getScriptCache().put("LAST_DATA_CHANGE_TS", ts, 21600);
    }
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) {
      PropertiesService.getScriptProperties().setProperty("LAST_DATA_CHANGE_TS", ts);
    }
  } catch(e){}
}

/**
 * API kiểm tra phiên bản dữ liệu nhẹ (chỉ trả về timestamp, không đọc sheet)
 */
function getSystemDataVersion() {
  try {
    let ts = "";
    if (typeof CacheService !== 'undefined' && CacheService.getScriptCache) {
      ts = CacheService.getScriptCache().get("LAST_DATA_CHANGE_TS");
    }
    if (!ts && typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) {
      ts = PropertiesService.getScriptProperties().getProperty("LAST_DATA_CHANGE_TS");
    }
    return { success: true, timestamp: ts || String(new Date().getTime()) };
  } catch(e) {
    return { success: false, timestamp: String(new Date().getTime()) };
  }
}

/**
 * API SERVER-SIDE: Tải toàn bộ danh sách Phiếu Nhập & Phiếu Xuất từ Google Sheets về Client (Hỗ trợ Multi-client Auto-Sync)
 */
function getAllVouchersBackend() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lsXuatSheet = ss.getSheetByName("LICH_SU_XUAT");
    const lsNhapSheet = ss.getSheetByName("LICH_SU_NHAP");
    const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
    const custSheet = ss.getSheetByName("DM_KHACH_HANG");

    // Map thông tin chuẩn từ DM_KHACH_HANG để bổ sung thông tin liên hệ khi cần
    const custInfoByName = new Map();
    if (custSheet && custSheet.getLastRow() > 1) {
      const cData = custSheet.getRange(2, 1, custSheet.getLastRow() - 1, Math.min(9, custSheet.getLastColumn())).getValues();
      cData.forEach(r => {
        const is9Col = String(r[0] || '').trim().startsWith('KH') || String(r[0] || '').trim().startsWith('CUS') || (r[2] && String(r[2]).replace(/\D/g, '').length >= 8);
        const cTen = is9Col ? String(r[1] || r[0] || '').trim() : String(r[0] || '').trim();
        const cPhone = is9Col ? formatPhoneNumberBackend(r[2]) : formatPhoneNumberBackend(r[1]);
        const cDiaChi = is9Col ? String(r[5] || '').trim() : String(r[2] || '').trim();
        const info = { ten: cTen, sdt: cPhone, diaChi: cDiaChi };
        if (cTen) custInfoByName.set(cTen.toLowerCase(), info);
      });
    }

    // Map serial -> { model, tenHang, kho } từ SERIAL_MASTER
    const serialInfoMap = new Map();
    if (tbSheet && tbSheet.getLastRow() > 1) {
      const tbData = tbSheet.getRange(2, 1, tbSheet.getLastRow() - 1, 6).getValues();
      tbData.forEach(r => {
        const sn = String(r[0] || '').trim().toUpperCase();
        if (sn) {
          serialInfoMap.set(sn, {
            model: String(r[1] || '').trim(),
            tenHang: String(r[2] || '').trim(),
            kho: String(r[5] || 'Kho VP').trim()
          });
        }
      });
    }

    // 1. Đọc phiếu Xuất Kho
    const xuatList = [];
    if (lsXuatSheet && lsXuatSheet.getLastRow() > 1) {
      const xData = lsXuatSheet.getRange(2, 1, lsXuatSheet.getLastRow() - 1, Math.min(8, lsXuatSheet.getLastColumn())).getValues();
      for (let i = xData.length - 1; i >= 0; i--) {
        const r = xData[i];
        const maPhieu = String(r[0] || '').trim();
        if (!maPhieu) continue;

        const rawDate = r[1];
        const ngay = rawDate instanceof Date ? Utilities.formatDate(rawDate, "GMT+7", "dd/MM/yyyy") : String(rawDate || '');
        const khachRaw = String(r[2] || '').trim();
        const sl = parseInt(r[3], 10) || 1;
        const serialsStr = String(r[4] || '').trim();
        const bh = String(r[5] || '12 tháng').trim();
        const ghiChu = String(r[6] || '').trim();

        // Bóc tách tên và SĐT sạch
        let khachName = khachRaw;
        let sdt = '';
        if (khachRaw.includes('(') && khachRaw.includes(')')) {
          const match = khachRaw.match(/^(.*?)\s*\((.*?)\)$/);
          if (match) {
            khachName = match[1].trim();
            sdt = match[2].trim();
          }
        }

        // Ưu tiên SĐT giao hàng thực tế đã ghi nhận trên phiếu xuất.
        // Chỉ bổ sung SĐT từ danh mục nếu phiếu chưa ghi nhận SĐT.
        if (sdt) {
          sdt = formatPhoneNumberBackend(sdt);
        } else if (khachName && custInfoByName.has(khachName.toLowerCase())) {
          const cInfo = custInfoByName.get(khachName.toLowerCase());
          sdt = cInfo.sdt || '';
        }

        // Xác định trạng thái
        const isCancelled = ghiChu.includes('[CANCELLED:') || ghiChu.toUpperCase().includes('CANCELLED');
        const status = isCancelled ? 'CANCELLED' : 'CONFIRMED';

        // Phân rã items
        const snArr = serialsStr.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
        const items = snArr.map(sn => {
          const info = serialInfoMap.get(sn) || {};
          return {
            serial: sn,
            model: info.model || 'Thiết bị xuất',
            tenHang: info.tenHang || info.model || 'Thiết bị xuất',
            kho: info.kho || 'Kho VP',
            soThangBh: bh
          };
        });

        xuatList.push({
          maPhieu: maPhieu,
          ngay: ngay,
          khachHang: khachName,
          sdtKhach: sdt,
          kho: (items[0] && items[0].kho) || 'Kho VP',
          items: items.length > 0 ? items : [{ serial: 'N/A', model: 'Thiết bị', soThangBh: bh }],
          status: status,
          ghiChu: ghiChu
        });
      }
    }

    // 2. Đọc phiếu Nhập Kho (Đúng chuẩn cột: 0: mã, 1: ngày, 2: ncc, 3: modelSummary, 4: sl, 5: serials, 6: kho, 7: ghiChu)
    const nhapList = [];
    if (lsNhapSheet && lsNhapSheet.getLastRow() > 1) {
      const nData = lsNhapSheet.getRange(2, 1, lsNhapSheet.getLastRow() - 1, Math.min(8, lsNhapSheet.getLastColumn())).getValues();
      for (let i = nData.length - 1; i >= 0; i--) {
        const r = nData[i];
        const maPhieu = String(r[0] || '').trim();
        if (!maPhieu) continue;

        const rawDate = r[1];
        const ngay = rawDate instanceof Date ? Utilities.formatDate(rawDate, "GMT+7", "dd/MM/yyyy") : String(rawDate || '');
        const ncc = String(r[2] || '').trim();
        const modelSummary = String(r[3] || '').trim();
        const sl = parseInt(r[4], 10) || 1;
        const serialsStr = String(r[5] || '').trim();
        const khoNhap = String(r[6] || 'Kho VP').trim();
        const ghiChu = String(r[7] || '').trim();

        const isCancelled = ghiChu.includes('[CANCELLED:') || ghiChu.toUpperCase().includes('CANCELLED');
        const status = isCancelled ? 'CANCELLED' : 'CONFIRMED';

        const snArr = serialsStr.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
        const items = snArr.map(sn => {
          const info = serialInfoMap.get(sn) || {};
          return {
            serial: sn,
            model: info.model || modelSummary || 'Thiết bị nhập',
            kho: khoNhap
          };
        });

        nhapList.push({
          maPhieu: maPhieu,
          ngay: ngay,
          ncc: ncc,
          kho: khoNhap,
          items: items.length > 0 ? items : [{ serial: 'N/A', model: modelSummary || 'Thiết bị', kho: khoNhap }],
          status: status,
          ghiChu: ghiChu
        });
      }
    }

    const version = getSystemDataVersion();

    return {
      success: true,
      timestamp: version.timestamp,
      xuat: xuatList,
      nhap: nhapList
    };
  } catch(err) {
    return { success: false, message: err.message, xuat: [], nhap: [] };
  }
}
