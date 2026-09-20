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
    ? khSheet.getRange(2, 1, khSheet.getLastRow() - 1, 4).getValues().map((r, i) => ({ rowId: i + 2, ten: r[0], sdt: formatPhoneNumberBackend(r[1]), diaChi: r[2], ghiChu: r[3] })) 
    : [];

  const qcSheet = ss.getSheetByName("DM_QUY_CHUAN");
  const nhomHang = [], kho = [], loaiHang = [], baoHanh = [];
  if (qcSheet && qcSheet.getLastRow() > 1) {
    qcSheet.getRange(2, 1, qcSheet.getLastRow() - 1, 4).getValues().forEach((r, i) => {
      const rowId = i + 2;
      if (r[0]) nhomHang.push({ rowId, col: 1, val: r[0] });
      if (r[1]) kho.push({ rowId, col: 2, val: r[1] });
      if (r[2]) loaiHang.push({ rowId, col: 3, val: r[2] });
      if (r[3]) baoHanh.push({ rowId, col: 4, val: r[3] });
    });
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

  if (tbSheet && tbSheet.getLastRow() > 1) {
    const numRows = tbSheet.getLastRow() - 1;
    const numCols = Math.min(20, tbSheet.getLastColumn());
    const tbData = tbSheet.getRange(2, 1, numRows, numCols).getValues();

    tbData.forEach((r, idx) => {
      const sn = String(r[0] || '').trim().toUpperCase();
      if (sn) existingSerials.push(sn);

      const statusVal = String(r[9] || '').trim();
      const modelVal = String(r[1] || '').trim();

      if (statusVal === "Tồn kho" || statusVal === "IN_STOCK") {
        totalStock++;
        if (modelVal) distinctModelsSet.add(modelVal);
        tonKhoList.push({
          rowId: idx + 2,
          serial: sn,
          model: modelVal,
          tenHang: String(r[2] || ''),
          nhomHang: String(r[3] || ''),
          loaiHang: String(r[4] || ''),
          kho: String(r[5] || ''),
          ncc: String(r[6] || ''),
          ngayNhap: r[7] instanceof Date ? Utilities.formatDate(r[7], "GMT+7", "dd/MM/yyyy") : String(r[7] || ''),
          maPhieu: String(r[8] || ''),
          ghiChu: String(r[16] || '')
        });
      } else if (statusVal === "Đã xuất" || statusVal === "SOLD") {
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

        baoHanhList.push({
          serial: sn,
          model: modelVal,
          tenHang: String(r[2] || ''),
          kho: String(r[5] || ''),
          ngayXuat: r[10] instanceof Date ? Utilities.formatDate(r[10], "GMT+7", "dd/MM/yyyy") : String(r[10] || ''),
          khachHang: String(r[12] || ''),
          sdtKhach: formatPhoneNumberBackend(r[13]),
          ngayHetHanBh: r[15] instanceof Date ? Utilities.formatDate(r[15], "GMT+7", "dd/MM/yyyy") : String(r[15] || '')
        });
      }
    });
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

  const bootstrapData = {
    version: "4.0.0",
    serverTime: Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss"),
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
    alertSettings: alertSettings,
    existingSerials: existingSerials,
    tonKhoList: tonKhoList,
    baoHanhList: baoHanhList
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

  if (period === 'today') {
    fromDate = new Date(today);
    toDate = new Date(today);
    toDate.setHours(23, 59, 59, 999);
  } else if (period === '7days') {
    fromDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    toDate = new Date(today);
    toDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'custom' && customFrom && customTo) {
    const fParts = customFrom.split('-');
    fromDate = new Date(fParts[0], fParts[1] - 1, fParts[2]);
    const tParts = customTo.split('-');
    toDate = new Date(tParts[0], tParts[1] - 1, tParts[2], 23, 59, 59, 999);
  }

  // Đếm tồn kho hiện tại
  let inStockCount = 0;
  if (tbSheet && tbSheet.getLastRow() > 1) {
    const statusCol = tbSheet.getRange(2, 10, tbSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < statusCol.length; i++) {
      const s = String(statusCol[i][0] || '').trim();
      if (s === "Tồn kho" || s === "IN_STOCK") inStockCount++;
    }
  }

  // Đếm nhập trong kỳ
  let importCount = 0;
  if (vSheet && vSheet.getLastRow() > 1) {
    const isV4Header = (vSheet.getName() === "V4_RECEIPT_HEADERS");
    // Nếu V4_RECEIPT_HEADERS: col 2 (ngày), col 6 (số lượng) -> lấy 5 cột từ col 2: r[0]=ngày, r[4]=số lượng
    // Nếu LICH_SU_NHAP: col 2 (ngày), col 5 (số lượng) -> lấy 4 cột từ col 2: r[0]=ngày, r[3]=số lượng
    const numColsToRead = isV4Header ? 5 : 4;
    const vData = vSheet.getRange(2, 2, vSheet.getLastRow() - 1, numColsToRead).getValues();
    vData.forEach(r => {
      let d = null;
      if (r[0] instanceof Date) d = r[0];
      else if (r[0]) {
        const parts = String(r[0]).split('/');
        if (parts.length === 3) d = new Date(parts[2], parts[1] - 1, parts[0]);
      }
      if (d) {
        if (fromDate && d < fromDate) return;
        if (toDate && d > toDate) return;
        const qty = isV4Header ? parseInt(r[4], 10) : parseInt(r[3], 10);
        importCount += (isNaN(qty) ? 1 : qty);
      }
    });
  }

  // Đếm xuất trong kỳ
  let exportCount = 0;
  if (xSheet && xSheet.getLastRow() > 1) {
    const xData = xSheet.getRange(2, 2, xSheet.getLastRow() - 1, 4).getValues();
    xData.forEach(r => {
      let d = null;
      if (r[0] instanceof Date) d = r[0];
      else if (r[0]) {
        const parts = String(r[0]).split('/');
        if (parts.length === 3) d = new Date(parts[2], parts[1] - 1, parts[0]);
      }
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

  // 1. DANH MỤC SẢN PHẨM
  const spSheet = createOrGetSheet("DM_SAN_PHAM", ["Model", "Tên Sản Phẩm", "Nhóm Hàng", "Ghi Chú"], "#1e40af");
  if (spSheet.getLastRow() === 1) {
    spSheet.appendRow(["CANON-2900", "Máy in Laser Canon LBP 2900", "Máy in", "Hàng chính hãng"]);
    spSheet.appendRow(["RICOH-MP3054", "Máy photocopy Ricoh Aficio MP 3054", "Máy photocopy", "Hàng bãi Nhật"]);
    spSheet.appendRow(["THINKPAD-T480", "Laptop Lenovo Thinkpad T480 Core i5", "Laptop", "Bảo hành 12T"]);
  }

  // 2. DANH MỤC NHÀ CUNG CẤP
  const nccSheet = createOrGetSheet("DM_NCC", ["Tên Viết Tắt", "Tên Đầy Đủ", "Số Điện Thoại", "Ghi Chú"], "#1e40af");
  if (nccSheet.getLastRow() === 1) {
    nccSheet.appendRow(["LE_BAO_MINH", "Công ty Cổ phần Lê Bảo Minh", "'02838386688", "Nhà phân phối Canon chính hãng"]);
    nccSheet.appendRow(["RICOH_VN", "Công ty TNHH Ricoh Việt Nam", "'02439366666", "Máy văn phòng Ricoh"]);
    nccSheet.appendRow(["FPT_SYNEX", "Công ty TNHH Phân Phối FPT Synnex", "'02473006666", "Laptop & Linh kiện"]);
  }

  // 3. DANH MỤC KHÁCH HÀNG
  const khSheet = createOrGetSheet("DM_KHACH_HANG", ["Tên Khách Hàng", "Số Điện Thoại", "Địa Chỉ", "Ghi Chú"], "#1e40af");
  if (khSheet.getLastRow() === 1) {
    khSheet.appendRow(["Trường THPT Chu Văn An", "'0912345678", "Thụy Khuê, Tây Hồ, Hà Nội", "Dự án phòng tin học"]);
    khSheet.appendRow(["UBND Quận Cầu Giấy", "'0987654321", "Cầu Giấy, Hà Nội", "Hợp đồng máy in văn phòng"]);
    khSheet.appendRow(["Ngân hàng Vietcombank", "'0903123456", "Trần Quang Khải, Hoàn Kiếm", "Máy photocopy chi nhánh"]);
  }

  // 4. DANH MỤC QUY CHUẨN
  const qcSheet = createOrGetSheet("DM_QUY_CHUAN", ["Loại Quy Chuẩn", "Giá Trị", "Mã / Viết Tắt", "Ghi Chú"], "#0f766e");
  if (qcSheet.getLastRow() === 1) {
    qcSheet.appendRow(["NHOM_HANG", "Máy in", "IN", "Thiết bị in ấn"]);
    qcSheet.appendRow(["NHOM_HANG", "Máy photocopy", "PHOTO", "Thiết bị sao chụp"]);
    qcSheet.appendRow(["NHOM_HANG", "Laptop", "LAPTOP", "Máy tính xách tay"]);
    qcSheet.appendRow(["KHO", "Kho Tổng Hà Nội", "KHO_HN", "Kho chính trung tâm"]);
    qcSheet.appendRow(["KHO", "Kho Đà Nẵng", "KHO_DN", "Kho miền Trung"]);
    qcSheet.appendRow(["KHO", "Kho TP.HCM", "KHO_HCM", "Kho miền Nam"]);
    qcSheet.appendRow(["LOAI_HANG", "Hàng Mới 100%", "NEW", "Nguyên seal"]);
    qcSheet.appendRow(["LOAI_HANG", "Hàng Đã Qua Sử Dụng (Like New)", "USED", "Hàng lướt 99%"]);
    qcSheet.appendRow(["LOAI_HANG", "Hàng Đổi Trả / Demo", "DEMO", "Trưng bày"]);
    qcSheet.appendRow(["BAO_HANH", "6 Tháng", "6M", "Bảo hành 6 tháng"]);
    qcSheet.appendRow(["BAO_HANH", "12 Tháng", "12M", "Bảo hành tiêu chuẩn 1 năm"]);
    qcSheet.appendRow(["BAO_HANH", "24 Tháng", "24M", "Bảo hành 2 năm"]);
  }

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

