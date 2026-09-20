// =========================================================================
// THÀNH AN ERP v4.0 - MODULE 01: DANH MỤC HỆ THỐNG (01_DanhMuc.gs)
// Nghiệp vụ: Quản lý Sản phẩm, Nhà cung cấp, Khách hàng, Quy chuẩn kho
// =========================================================================

// Chuẩn hóa và bảo toàn số 0 ở đầu cho SĐT
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

// Helper CacheService an toàn (hỗ trợ cả Apps Script thật lẫn mock Node/fallback)
function getCacheServiceSafe() {
  try {
    if (typeof CacheService !== 'undefined' && CacheService.getScriptCache) {
      return CacheService.getScriptCache();
    }
  } catch(e){}
  return null;
}

function invalidateMasterCache() {
  const cache = getCacheServiceSafe();
  if (cache) {
    try {
      cache.remove("MASTER_DATA_CACHE");
      cache.remove("SERIAL_INDEX_CACHE");
    } catch(e){}
  }
}

function getMasterData() {
  const cache = getCacheServiceSafe();
  if (cache) {
    try {
      const cached = cache.get("MASTER_DATA_CACHE");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch(e){}
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const getSheetData = (name, colCount) => {
    const sheet = ss.getSheetByName(name);
    if (!sheet || sheet.getLastRow() <= 1) return [];
    return sheet.getRange(2, 1, sheet.getLastRow() - 1, colCount).getValues();
  };

  const products = getSheetData("DM_SAN_PHAM", 3).map((r, i) => ({ rowId: i + 2, model: r[0], ten: r[1], nhom: r[2] }));
  const ncc = getSheetData("DM_NCC", 4).map((r, i) => ({ rowId: i + 2, tenTat: r[0], tenDayDu: r[1], sdt: formatPhoneNumberBackend(r[2]), ghiChu: r[3] }));
  const khachHang = getSheetData("DM_KHACH_HANG", 4).map((r, i) => ({ rowId: i + 2, ten: r[0], sdt: formatPhoneNumberBackend(r[1]), diaChi: r[2], ghiChu: r[3] }));

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

  const result = { products, ncc, khachHang, nhomHang, kho, loaiHang, baoHanh };

  if (cache) {
    try {
      // Cache 600 giây (10 phút)
      cache.put("MASTER_DATA_CACHE", JSON.stringify(result), 600);
    } catch(e){}
  }

  return result;
}

function saveProduct(model, ten, nhom, rowId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("DM_SAN_PHAM");
  model = String(model || '').trim();
  ten = String(ten || '').trim();
  nhom = String(nhom || '').trim();
  if (!model || !ten || !nhom) throw new Error("Vui lòng điền đủ: Mã Model, Tên hàng và Nhóm hàng!");

  invalidateMasterCache();

  if (rowId) {
    sheet.getRange(Number(rowId), 1, 1, 3).setValues([[model, ten, nhom]]);
    return "Cập nhật sản phẩm thành công!";
  } else {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).toUpperCase() === model.toUpperCase()) throw new Error("Mã Model này đã tồn tại trong danh mục!");
    }
    sheet.appendRow([model, ten, nhom]);
    return "Thêm Model mới thành công!";
  }
}

function deleteProduct(rowId) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DM_SAN_PHAM").deleteRow(Number(rowId));
  invalidateMasterCache();
  return "Đã xóa Model khỏi danh mục!";
}

function saveNcc(tenTat, tenDayDu, sdt, ghiChu, rowId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("DM_NCC");
  tenTat = String(tenTat || '').trim().toUpperCase();
  sdt = formatPhoneNumberBackend(sdt);
  if (!tenTat) throw new Error("Tên viết tắt NCC không được để trống!");

  invalidateMasterCache();

  // Ép kiểu chuỗi ký tự bằng dấu nháy đơn ' để Google Sheets không làm mất số 0
  const safeSdt = sdt ? ("'" + sdt) : "";

  if (rowId) {
    sheet.getRange(Number(rowId), 1, 1, 4).setValues([[tenTat, tenDayDu, safeSdt, ghiChu]]);
    return "Cập nhật Nhà cung cấp thành công!";
  } else {
    sheet.appendRow([tenTat, tenDayDu, safeSdt, ghiChu]);
    return "Thêm Nhà cung cấp mới thành công!";
  }
}

function deleteNcc(rowId) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DM_NCC").deleteRow(Number(rowId));
  invalidateMasterCache();
  return "Đã xóa Nhà cung cấp!";
}

function saveKhachHang(ten, sdt, diaChi, ghiChu, rowId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("DM_KHACH_HANG");
  ten = String(ten || '').trim();
  sdt = formatPhoneNumberBackend(sdt);
  if (!ten || !sdt) throw new Error("Tên khách hàng và Số điện thoại là bắt buộc!");

  invalidateMasterCache();

  // Ép kiểu chuỗi ký tự bằng dấu nháy đơn ' để Google Sheets không làm mất số 0
  const safeSdt = "'" + sdt;

  if (rowId) {
    sheet.getRange(Number(rowId), 1, 1, 4).setValues([[ten, safeSdt, diaChi, ghiChu]]);
    return "Cập nhật Khách hàng thành công!";
  } else {
    sheet.appendRow([ten, safeSdt, diaChi, ghiChu]);
    return "Thêm Khách hàng mới thành công!";
  }
}

function deleteKhachHang(rowId) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DM_KHACH_HANG").deleteRow(Number(rowId));
  invalidateMasterCache();
  return "Đã xóa Khách hàng!";
}

function addQuyChuan(colIndex, val) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DM_QUY_CHUAN");
  if (!val) throw new Error("Giá trị quy chuẩn không được để trống!");
  invalidateMasterCache();
  const colValues = sheet.getRange(1, colIndex, sheet.getMaxRows(), 1).getValues();
  let targetRow = 1;
  while (targetRow <= colValues.length && colValues[targetRow - 1][0] !== "") targetRow++;
  sheet.getRange(targetRow, colIndex).setValue(val);
  return "Thêm quy chuẩn thành công!";
}

function deleteQuyChuan(rowId, colIndex) {
  invalidateMasterCache();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DM_QUY_CHUAN").getRange(Number(rowId), Number(colIndex)).clearContent();
  return "Đã xóa mục quy chuẩn!";
}

/**
 * Xác thực tài khoản an toàn ở phía Backend (Không trả password/hash xuống client)
 */
function authenticateUser(username, password) {
  const user = String(username || '').trim().toLowerCase();
  const pass = String(password || '').trim();

  if (!user || !pass) {
    return { success: false, message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName("USERS");

  let foundUser = null;

  // 1. Kiểm tra tài khoản từ Sheet USERS nếu có
  if (userSheet && userSheet.getLastRow() > 1) {
    const data = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 5).getValues();
    for (let r of data) {
      const u = String(r[0] || '').trim().toLowerCase();
      const p = String(r[1] || '').trim();
      const name = String(r[2] || '').trim();
      const role = String(r[3] || '').trim().toUpperCase();
      const status = String(r[4] || 'Hoạt động').trim();

      if (u === user) {
        if (p === pass) {
          foundUser = { username: u, name: name || u, role: role || 'THỦ KHO', status: status };
        } else {
          return { success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" };
        }
        break;
      }
    }
  }

  // 2. Tài khoản hệ thống dự phòng chuẩn
  if (!foundUser) {
    const defaultAccounts = {
      'admin': { role: 'ADMIN', name: 'Quản Trị Viên Hệ Thống', pass: '123456', status: 'Hoạt động' },
      'quanly': { role: 'QUẢN LÝ', name: 'Lê Tuấn Cường (Quản lý kho)', pass: '123456', status: 'Hoạt động' },
      'thukho': { role: 'THỦ KHO', name: 'Nguyễn Văn Kho (Thủ kho)', pass: '123456', status: 'Hoạt động' },
      'baohanh': { role: 'BẢO HÀNH', name: 'Trần Văn Minh (Kỹ thuật BH)', pass: '123456', status: 'Hoạt động' },
      'sale': { role: 'SALE', name: 'Nhân Viên Kinh Doanh', pass: '123456', status: 'Hoạt động' }
    };

    if (defaultAccounts[user] && defaultAccounts[user].pass === pass) {
      foundUser = {
        username: user,
        name: defaultAccounts[user].name,
        role: defaultAccounts[user].role,
        status: defaultAccounts[user].status
      };
    }
  }

  if (!foundUser) {
    return { success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" };
  }

  if (foundUser.status === 'Bị khóa') {
    return { success: false, message: "Tài khoản này đã bị khóa quyền truy cập! Vui lòng liên hệ Admin." };
  }

  // Cấp quyền chi tiết (RBAC)
  const isAdmin = foundUser.role === 'ADMIN' || foundUser.role === 'QUẢN TRỊ VIÊN';
  const permissions = isAdmin
    ? ['ALL', 'BACKUP_VIEW', 'BACKUP_CREATE', 'BACKUP_DELETE', 'RESTORE_SYSTEM', 'DATA_RECOVERY', 'RESET_SYSTEM', 'BACKUP_SETTINGS', 'SYSTEM_MAINTENANCE']
    : (foundUser.role === 'QUẢN LÝ' 
        ? ['DASHBOARD_VIEW', 'STOCK_VIEW', 'IMPORT_CREATE', 'EXPORT_CREATE', 'WARRANTY_MANAGE', 'CATALOG_MANAGE']
        : ['DASHBOARD_VIEW', 'STOCK_VIEW', 'IMPORT_CREATE', 'EXPORT_CREATE']);

  const sessionToken = `SES-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    success: true,
    sessionToken: sessionToken,
    user: {
      username: foundUser.username,
      name: foundUser.name,
      role: foundUser.role,
      permissions: permissions
    }
  };
}

/**
 * XÁC THỰC LẠI MẬT KHẨU ADMIN (RE-AUTHENTICATION TRƯỚC THAO TÁC NHẠY CẢM)
 * Tích hợp Brute Force Protection (Khóa 15 phút sau 5 lần sai liên tiếp)
 */
function verifyAdminPassword(arg1, arg2) {
  let u = 'admin';
  let pass = '';
  const knownUsers = ['admin', 'quanly', 'thukho', 'thukho01', 'sale', 'sale01', 'baohanh'];

  if (arg2 !== undefined && arg2 !== null && arg2 !== '') {
    const s1 = String(arg1).trim().toLowerCase();
    const s2 = String(arg2).trim().toLowerCase();

    if (knownUsers.includes(s1) && !knownUsers.includes(s2)) {
      // arg1 là username, arg2 là password
      u = s1;
      pass = String(arg2).trim();
    } else {
      // Mặc định: arg1 là password, arg2 là username
      pass = String(arg1).trim();
      u = s2;
    }
  } else {
    pass = String(arg1 || '').trim();
  }

  const now = Date.now();
  let props = null;
  let failKey = `BRUTE_FAIL_${u}`;
  let lockKey = `BRUTE_LOCK_${u}`;

  try {
    if (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) {
      props = PropertiesService.getScriptProperties();
      const lockUntil = Number(props.getProperty(lockKey) || 0);
      if (lockUntil > now) {
        const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
        return {
          success: false,
          cooldown: true,
          message: `Tài khoản tạm thời bị khóa bảo vệ trong ${remainingMinutes} phút do nhập sai mật khẩu quá 5 lần liên tiếp!`
        };
      }
    }
  } catch (e) {}

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName("USERS") || ss.getSheetByName("DM_NGUOI_DUNG");

  // Kiểm tra vai trò Admin trước
  if (userSheet && userSheet.getLastRow() > 1) {
    const rows = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 4).getValues();
    const found = rows.find(r => String(r[0] || '').trim().toLowerCase() === u);
    if (found) {
      const role = String(found[3] || '').trim().toUpperCase();
      if (role !== 'ADMIN' && role !== 'QUẢN TRỊ VIÊN') {
        return { success: false, message: "Thao tác xác thực chỉ dành cho Quản trị viên (Admin)!" };
      }
    }
  }

  // Kiểm tra mật khẩu đúng
  let isMatch = false;
  if (userSheet && userSheet.getLastRow() > 1) {
    const rows = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 4).getValues();
    for (let r of rows) {
      if (String(r[0] || '').trim().toLowerCase() === u) {
        const role = String(r[3] || '').trim().toUpperCase();
        if (role === 'ADMIN' || role === 'QUẢN TRỊ VIÊN') {
          isMatch = (String(r[1] || '').trim() === pass);
        }
        break;
      }
    }
  }

  // Lấy mật khẩu admin từ PropertiesService nếu trong Sheet USERS chưa có
  if (!isMatch && (u === 'admin' || u.includes('admin'))) {
    const savedAdminPass = props ? props.getProperty('ADMIN_PASSWORD') : null;
    if (savedAdminPass) {
      isMatch = (pass === savedAdminPass);
    }
  }

  if (isMatch) {
    // Reset số lần sai khi nhập đúng
    if (props) {
      try {
        props.deleteProperty(failKey);
        props.deleteProperty(lockKey);
      } catch (e) {}
    }
    const adminToken = `ADM-TOKEN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return { success: true, adminToken: adminToken };
  } else {
    // Tăng số lần sai
    let failCount = 1;
    if (props) {
      try {
        failCount = Number(props.getProperty(failKey) || 0) + 1;
        props.setProperty(failKey, String(failCount));
        if (failCount >= 5) {
          const cooldownTime = now + (15 * 60 * 1000); // 15 phút
          props.setProperty(lockKey, String(cooldownTime));
        }
      } catch (e) {}
    }

    // Ghi vết Audit cảnh báo xác thực thất bại (TUYỆT ĐỐI KHÔNG GHI MẬT KHẨU)
    try {
      const logSheet = ss.getSheetByName("NHAT_KY_HOAT_DONG");
      if (logSheet) {
        const timeStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
        logSheet.appendRow([
          timeStr,
          u,
          "ADMIN_REAUTH_FAIL",
          "BẢO MẬT",
          `Nhập sai mật khẩu xác thực Quản trị viên (Lần ${failCount}/5)`
        ]);
      }
    } catch (e) {}

    const remaining = Math.max(0, 5 - failCount);
    return {
      success: false,
      remainingAttempts: remaining,
      message: `Mật khẩu Quản trị viên không chính xác! (Còn ${remaining} lần thử trước khi bị tạm khóa 15 phút)`
    };
  }
}

/**
 * Lấy cấu hình hệ thống & Danh sách Users an toàn (KHÔNG TRẢ MẬT KHẨU VỀ CLIENT)
 */
function getCaiDatData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfgSheet = ss.getSheetByName("CAI_DAT");
  const userSheet = ss.getSheetByName("USERS");

  let config = {
    tenDoanhNghiep: "CÔNG TY TNHH THIẾT BỊ VĂN PHÒNG THÀNH AN",
    tenVietTat: "THÀNH AN",
    nguongDongKho: 60,
    nguongBaoHanh: 30,
    tienToSerial: "TA-"
  };

  if (cfgSheet && cfgSheet.getLastRow() > 1) {
    const cfgData = cfgSheet.getRange(2, 1, cfgSheet.getLastRow() - 1, 2).getValues();
    cfgData.forEach(r => {
      const key = String(r[0] || '').trim();
      const val = r[1];
      if (key === 'TEN_DOANH_NGHIEP') config.tenDoanhNghiep = val;
      if (key === 'TEN_VIET_TAT') config.tenVietTat = val;
      if (key === 'NGUONG_DONG_KHO') config.nguongDongKho = Number(val) || 60;
      if (key === 'NGUONG_BAO_HANH') config.nguongBaoHanh = Number(val) || 30;
      if (key === 'TIEN_TO_SERIAL') config.tienToSerial = val;
    });
  }

  // Danh sách users an toàn (TUYỆT ĐỐI KHÔNG GỬI MẬT KHẨU 'pass' XUỐNG BROWSER)
  const users = [];
  if (userSheet && userSheet.getLastRow() > 1) {
    const uData = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 5).getValues();
    uData.forEach((r, i) => {
      users.push({
        rowId: i + 2,
        username: String(r[0] || '').trim(),
        fullname: String(r[2] || '').trim(),
        role: String(r[3] || 'THỦ KHO').trim(),
        status: String(r[4] || 'Hoạt động').trim()
        // Cột 1 là password -> Cố ý bỏ qua không trả về client
      });
    });
  } else {
    users.push(
      { rowId: 2, username: 'admin', fullname: 'Quản Trị Viên Hệ Thống', role: 'ADMIN', status: 'Hoạt động' },
      { rowId: 3, username: 'quanly', fullname: 'Lê Tuấn Cường', role: 'QUẢN LÝ', status: 'Hoạt động' },
      { rowId: 4, username: 'thukho', fullname: 'Nguyễn Văn Kho', role: 'THỦ KHO', status: 'Hoạt động' }
    );
  }

  return {
    config: config,
    users: users,
    maintenanceMode: (typeof isMaintenanceMode === 'function' ? isMaintenanceMode() : false)
  };
}

/**
 * Đổi mật khẩu Quản trị viên (Admin) và lưu bền vững vào PropertiesService & Sheet USERS
 */
function changeAdminPassword(oldPass, newPass) {
  if (!newPass || String(newPass).trim().length < 6) {
    return { success: false, message: "Mật khẩu mới phải có độ dài từ 6 ký tự trở lên!" };
  }
  const check = verifyAdminPassword(oldPass, 'admin');
  if (!check.success) {
    return { success: false, message: "Mật khẩu hiện tại không chính xác!" };
  }

  const cleanPass = String(newPass).trim();
  const props = PropertiesService.getScriptProperties();
  if (props) {
    props.setProperty('ADMIN_PASSWORD', cleanPass);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName("USERS") || ss.getSheetByName("DM_NGUOI_DUNG");
  if (userSheet && userSheet.getLastRow() > 1) {
    const rows = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 4).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0] || '').trim().toLowerCase() === 'admin') {
        userSheet.getRange(i + 2, 2).setValue(cleanPass);
        break;
      }
    }
  }

  return { success: true, message: "Đổi mật khẩu Quản trị viên thành công!" };
}

/**
 * Alias tương thích cho xác thực quyền Quản trị viên
 */
function verifyAdminAuth(arg1, arg2) {
  return verifyAdminPassword(arg1, arg2);
}
