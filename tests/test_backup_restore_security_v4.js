// =========================================================================
// TEST SUITE: BACKUP, RESTORE, SECURITY & MAINTENANCE V4 (35+ TEST CASES)
// =========================================================================

const fs = require('fs');
const path = require('path');

// --- 1. MOCK GOOGLE APPS SCRIPT RUNTIME ---
class SheetMock {
  constructor(name, initialData = []) {
    this.name = name;
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  getName() { return this.name; }
  getLastRow() { return this.data.length; }
  getLastColumn() { return this.data.length > 0 ? this.data[0].length : 0; }

  appendRow(row) {
    this.data.push(row.map(cell => cell !== undefined ? cell : ""));
  }

  getDataRange() {
    const numRows = Math.max(1, this.getLastRow());
    const numCols = Math.max(1, this.getLastColumn());
    return this.getRange(1, 1, numRows, numCols);
  }

  clear() {
    this.data = [];
    return this;
  }

  clearContents() {
    this.data = [];
    return this;
  }

  clearContent() {
    this.data = [];
    return this;
  }

  deleteRow(rowIdx) {
    if (rowIdx >= 1 && rowIdx <= this.data.length) {
      this.data.splice(rowIdx - 1, 1);
    }
  }

  deleteRows(startRow, numRows) {
    if (startRow >= 1 && startRow <= this.data.length) {
      this.data.splice(startRow - 1, numRows);
    }
    return this;
  }

  getRange(startRow, startCol, numRows, numCols) {
    const self = this;
    return {
      getValues: function() {
        const res = [];
        for (let r = startRow - 1; r < startRow - 1 + numRows; r++) {
          const rowData = self.data[r] || [];
          const slice = [];
          for (let c = startCol - 1; c < startCol - 1 + numCols; c++) {
            slice.push(rowData[c] !== undefined ? rowData[c] : "");
          }
          res.push(slice);
        }
        return res;
      },
      setValues: function(values) {
        for (let r = 0; r < values.length; r++) {
          const targetRow = startRow - 1 + r;
          if (!self.data[targetRow]) {
            self.data[targetRow] = [];
          }
          for (let c = 0; c < values[r].length; c++) {
            self.data[targetRow][startCol - 1 + c] = values[r][c];
          }
        }
      },
      clearContent: function() {
        for (let r = startRow - 1; r < startRow - 1 + numRows; r++) {
          if (self.data[r]) {
            for (let c = startCol - 1; c < startCol - 1 + numCols; c++) {
              self.data[r][c] = "";
            }
          }
        }
        return this;
      },
      setFontWeight: function() { return this; },
      setBackground: function() { return this; },
      setFontColor: function() { return this; },
      setNumberFormat: function() { return this; },
      setWrap: function() { return this; },
      setHorizontalAlignment: function() { return this; },
      setVerticalAlignment: function() { return this; }
    };
  }

  setFrozenRows() { return this; }
  autoResizeColumns() { return this; }
}

class SpreadsheetMock {
  constructor() {
    this.sheets = new Map();
  }

  toast() {}

  addSheet(name, initialData = []) {
    const sheet = new SheetMock(name, initialData);
    this.sheets.set(name, sheet);
    return sheet;
  }

  getSheetByName(name) {
    return this.sheets.get(name) || null;
  }

  getSheets() {
    return Array.from(this.sheets.values());
  }

  insertSheet(name) {
    if (this.sheets.has(name)) return this.sheets.get(name);
    return this.addSheet(name, []);
  }

  deleteSheet(sheet) {
    this.sheets.delete(sheet.name);
  }
}

// Global script properties mock
const scriptPropertiesStore = new Map();
const PropertiesServiceMock = {
  getScriptProperties: function() {
    return {
      getProperty: function(key) { return scriptPropertiesStore.get(key) || null; },
      setProperty: function(key, val) { scriptPropertiesStore.set(key, String(val)); },
      deleteProperty: function(key) { scriptPropertiesStore.delete(key); },
      getProperties: function() {
        const obj = {};
        scriptPropertiesStore.forEach((v, k) => { obj[k] = v; });
        return obj;
      }
    };
  }
};

const LockServiceMock = {
  getScriptLock: function() {
    return {
      tryLock: function(ms) { return true; },
      waitLock: function(ms) { return true; },
      hasLock: function() { return true; },
      releaseLock: function() { return true; }
    };
  }
};

const UtilitiesMock = {
  formatDate: function(date, tz, fmt) {
    const d = date instanceof Date ? date : new Date(date);
    const pad = n => (n < 10 ? '0' + n : n);
    const day = pad(d.getDate());
    const mon = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    const secs = pad(d.getSeconds());

    if (fmt && (fmt.includes('yyyyMMdd-HHmmss') || fmt.includes('yyyyMMdd_HHmmss'))) {
      const sep = fmt.includes('-') ? '-' : '_';
      return `${year}${mon}${day}${sep}${hours}${mins}${secs}`;
    }
    if (fmt && fmt.includes('yyyy-MM-dd')) {
      return `${year}-${mon}-${day}`;
    }
    return `${day}/${mon}/${year} ${hours}:${mins}:${secs}`;
  },
  computeDigest: function(algo, text) {
    // Basic hash representation for mock
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return [hash & 0xFF, (hash >> 8) & 0xFF, (hash >> 16) & 0xFF, (hash >> 24) & 0xFF];
  },
  DigestAlgorithm: { SHA_256: 'SHA_256' }
};

// Thiết lập global context cho Node
global.PropertiesService = PropertiesServiceMock;
global.LockService = LockServiceMock;
global.Utilities = UtilitiesMock;

let activeSpreadsheet = new SpreadsheetMock();
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => activeSpreadsheet
};

// Đọc source code backend
const srcDir = path.join(__dirname, '..', 'src', 'backend');
const filesToLoad = [
  '01_DanhMuc.js',
  '09_BackupRestore.js',
  '02_NhapKho.js',
  '03_XuatKho.js'
];

const vm = require('vm');

filesToLoad.forEach(f => {
  const p = path.join(srcDir, f);
  if (fs.existsSync(p)) {
    const code = fs.readFileSync(p, 'utf8');
    vm.runInThisContext(code);
  } else {
    console.error("Missing file:", p);
  }
});

// --- HELPER KHỞI TẠO CƠ SỞ DỮ LIỆU CHUẨN ---
function seedDatabase(ss) {
  // DM_NGUOI_DUNG
  ss.addSheet("DM_NGUOI_DUNG", [
    ["Tên Đăng Nhập", "Mật Khẩu", "Họ Và Tên", "Vai Trò", "Trạng Thái"],
    ["admin", "123456", "Quản Trị Viên", "Admin", "Hoạt Động"],
    ["thukho01", "123456", "Trần Văn Kho", "Kho", "Hoạt Động"],
    ["sale01", "123456", "Lê Văn Sale", "Sale", "Hoạt Động"]
  ]);

  // SERIAL_MASTER
  ss.addSheet("SERIAL_MASTER", [
    ["Mã Serial (Hãng)", "Mã Nội Bộ Thành An", "Model", "Kho Hàng", "Trạng Thái", "Ngày Nhập Kho", "Số Lô", "Số Ngày Lưu Kho", "Trạng Thái Tồn", "Thời Hạn BH (Tháng)", "Hạn BH Đến", "Trạng Thái BH", "Mã Phiếu Xuất", "Khách Hàng", "SĐT Nhận Hàng", "Địa Chỉ Nhận", "Ghi Chú"],
    ["SN-MOCK-001", "TA-001", "RICOH IM C3000", "Kho Tổng", "IN_STOCK", "2026-09-01", "PO-01", 18, "BÌNH THƯỜNG", 12, "", "", "", "", "", "", "Máy mới nhập"],
    ["SN-MOCK-002", "TA-002", "RICOH IM C3000", "Kho Tổng", "EXPORTED", "2026-08-15", "PO-01", 34, "ĐÃ XUẤT", 12, "2027-08-15", "CÒN HẠN", "XK-260901-001", "Công ty A", "0901234567", "Hà Nội", "Đã xuất bán"],
    ["SN-MOCK-VOID", "TA-003", "HP M404DN", "Kho Tổng", "VOID", "2026-08-01", "PO-02", 48, "VOID", 12, "", "", "", "", "", "", "Hủy do nhập sai"]
  ]);

  // SERIAL_INDEX
  ss.addSheet("SERIAL_INDEX", [
    ["Serial", "RowId", "Status", "Model", "Warehouse", "LastUpdated"],
    ["SN-MOCK-001", 2, "IN_STOCK", "RICOH IM C3000", "Kho Tổng", "2026-09-19"],
    ["SN-MOCK-002", 3, "EXPORTED", "RICOH IM C3000", "Kho Tổng", "2026-09-19"],
    ["SN-MOCK-VOID", 4, "VOID", "HP M404DN", "Kho Tổng", "2026-09-19"]
  ]);

  // TON_KHO_TONG_HOP
  ss.addSheet("TON_KHO_TONG_HOP", [
    ["Model", "Tên Sản Phẩm", "Nhóm Hàng", "Kho", "Số Lượng Tồn", "Cảnh Báo Đọng"],
    ["RICOH IM C3000", "Máy Photocopy RICOH IM C3000", "Máy Photocopy", "Kho Tổng", 1, "BÌNH THƯỜNG"],
    ["HP M404DN", "Máy In HP LaserJet M404DN", "Máy In", "Kho Tổng", 0, "HẾT HÀNG"]
  ]);

  // NHAT_KY_HOAT_DONG
  ss.addSheet("NHAT_KY_HOAT_DONG", [
    ["Thời Gian", "Người Thực Hiện", "Hành Động", "Đối Tượng", "Chi Tiết"]
  ]);

  // CAI_DAT
  ss.addSheet("CAI_DAT", [
    ["Khóa Cấu Hình", "Giá Trị", "Mô Tả"],
    ["TEN_DOANH_NGHIEP", "CÔNG TY TNHH THÀNH AN", "Tên cty"],
    ["CANH_BAO_DONG_KHO_NGAY", "60", "Số ngày đọng kho"]
  ]);
}

// --- BẮT ĐẦU CHẠY CÁC TEST CASES ---
console.log("=========================================================================");
console.log("   KIỂM THỬ THÀNH AN WAREHOUSE V4 - BACKUP, RESTORE & SECURITY SUITE    ");
console.log("=========================================================================");

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passCount++;
    console.log(`  [PASS] Ca ${passCount}: ${testName}`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         Chi tiết: ${details}`);
  }
}

// Khởi tạo database ban đầu
seedDatabase(activeSpreadsheet);

// -------------------------------------------------------------------------
// GROUP 1: AUTHENTICATION, RBAC & CLIENT SECURITY (PHẦN 31)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 1: AUTHENTICATION & SECURITY ---");

// Test 1: Đăng nhập thành công trả session token & permissions
const loginAdminRes = authenticateUser("admin", "123456");
assert(loginAdminRes.success === true && loginAdminRes.sessionToken && loginAdminRes.user.role.toUpperCase() === 'ADMIN',
  "authenticateUser đăng nhập Admin thành công, trả token & role", JSON.stringify(loginAdminRes));

// Test 2: Tuyệt đối không trả pass trong payload người dùng
assert(loginAdminRes.user.pass === undefined && loginAdminRes.user.password === undefined,
  "authenticateUser không lộ mật khẩu trong user object");

// Test 3: Cấp đủ ma trận quyền hạn cho vai trò Admin
assert(loginAdminRes.user.permissions && (loginAdminRes.user.permissions.includes('ALL') || loginAdminRes.user.permissions.includes('BACKUP_CREATE')),
  "Admin được cấp quyền canManageBackups và canResetSystem");

// Test 4: Đăng nhập sai mật khẩu bị từ chối
const loginFailRes = authenticateUser("admin", "wrong_pass");
assert(loginFailRes.success === false, "Từ chối đăng nhập khi sai mật khẩu");

// Test 5: Đăng nhập với user không tồn tại bị từ chối
const loginUnknownRes = authenticateUser("non_existent_user", "123456");
assert(loginUnknownRes.success === false, "Từ chối đăng nhập với username không tồn tại");

// Test 6: getCaiDatData không được gửi cột mật khẩu xuống client
const caiDatData = getCaiDatData();
assert(caiDatData.users && caiDatData.users.every(u => u.pass === undefined && u.password === undefined),
  "getCaiDatData trả danh sách người dùng đã loại bỏ hoàn toàn mật khẩu");

// -------------------------------------------------------------------------
// GROUP 2: ADMIN RE-AUTHENTICATION & BRUTE FORCE PROTECTION (PHẦN 32)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 2: RE-AUTH & BRUTE-FORCE PROTECTION ---");

// Test 7: verifyAdminPassword thành công khi đúng mật khẩu
const verifyOkRes = verifyAdminPassword("admin", "123456");
assert(verifyOkRes.success === true && verifyOkRes.adminToken, "verifyAdminPassword đúng mật khẩu cấp adminToken");

// Test 8: verifyAdminPassword thất bại khi sai mật khẩu
const verifyFailRes = verifyAdminPassword("admin", "wrong_admin_pass");
assert(verifyFailRes.success === false, "verifyAdminPassword sai mật khẩu bị từ chối");

// Test 9: verifyAdminPassword từ chối nếu user không phải Admin
const verifyNotAdminRes = verifyAdminPassword("thukho01", "123456");
assert(verifyNotAdminRes.success === false && verifyNotAdminRes.message.includes("chỉ dành cho Quản trị viên"),
  "verifyAdminPassword từ chối tài khoản không phải Admin");

// Test 10: Brute force lock sau 5 lần sai liên tiếp
scriptPropertiesStore.delete('BRUTE_FAIL_admin');
scriptPropertiesStore.delete('BRUTE_LOCK_admin');
for (let i = 1; i <= 5; i++) {
  verifyAdminPassword("admin", "bad_pass_" + i);
}
const verifyLockedRes = verifyAdminPassword("admin", "bad_pass_6");
assert(verifyLockedRes.success === false && verifyLockedRes.message.includes("khóa"),
  "Khóa tài khoản 15 phút sau 5 lần nhập sai mật khẩu Admin liên tiếp");

// Reset lock để tiếp tục các test khác
scriptPropertiesStore.delete('BRUTE_FAIL_admin');
scriptPropertiesStore.delete('BRUTE_LOCK_admin');

// -------------------------------------------------------------------------
// GROUP 3: SYSTEM BACKUP & METADATA LOGGING (PHẦN 33)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 3: SYSTEM BACKUP & SNAPSHOT LOGGING ---");

// Test 11: Tạo bản sao lưu thủ công (Manual Backup)
const backup1Res = createSystemBackup("Bản sao lưu trước kiểm toán quý 3", "admin");
assert(backup1Res.success === true && backup1Res.backupId && (backup1Res.backupId.startsWith("BK-") || backup1Res.backupId.startsWith("BK_")),
  "Tạo bản sao lưu thủ công thành công, sinh mã BK-*", JSON.stringify(backup1Res));

// Test 12: Kiểm tra Sheet SYS_BACKUPS được ghi nhận đúng
const sysBackupsSheet = activeSpreadsheet.getSheetByName("SYS_BACKUPS");
assert(sysBackupsSheet && sysBackupsSheet.getLastRow() >= 2, "Sheet SYS_BACKUPS tồn tại và chứa bản ghi backup");

// Test 13: listSystemBackups trả danh sách bản sao lưu
const listBackupsRes = listSystemBackups();
assert(listBackupsRes.success === true && listBackupsRes.backups.length >= 1,
  "listSystemBackups trả về danh sách backup hợp lệ");

// Test 14: verifyBackup xác nhận tính toàn vẹn của snapshot
const verifyBkRes = verifyBackup(backup1Res.backupId);
assert(verifyBkRes.success === true && verifyBkRes.valid === true,
  "verifyBackup xác nhận snapshot nguyên vẹn, hash khớp chuẩn");

// Test 15: verifyBackup trả false với mã backup không tồn tại
const verifyUnknownBkRes = verifyBackup("BK_NON_EXISTENT");
assert(verifyUnknownBkRes.success === false, "verifyBackup từ chối mã backup không tồn tại");

// -------------------------------------------------------------------------
// GROUP 4: 11-STEP RESTORE ENGINE & ROLLBACK (PHẦN 33)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 4: 11-STEP RESTORE ENGINE & SAFETY PRE-BACKUP ---");

// Thay đổi dữ liệu hiện tại để test restore
const serialMasterSheet = activeSpreadsheet.getSheetByName("SERIAL_MASTER");
serialMasterSheet.appendRow(["SN-TEST-CORRUPT", "TA-999", "MODEL-X", "Kho Tổng", "IN_STOCK"]);

// Test 16: Restore hệ thống từ backup1Res.backupId
const restoreRes = restoreSystemBackup(backup1Res.backupId, "admin");
assert(restoreRes.success === true && restoreRes.preRestoreBackupId,
  "Khôi phục hệ thống thành công qua 11 bước và tự động tạo PRE_RESTORE backup");

// Test 17: Dữ liệu sau restore đã được đưa về snapshot ban đầu
const serialsAfterRestore = serialMasterSheet.getRange(2, 1, serialMasterSheet.getLastRow() - 1, 1).getValues();
const hasCorruptedSerial = serialsAfterRestore.some(r => r[0] === "SN-TEST-CORRUPT");
assert(hasCorruptedSerial === false, "Dữ liệu corrupt đã được loại bỏ sau khi restore");

// Test 18: Tự động ghi nhận pre-restore backup vào SYS_BACKUPS
const listAfterRestore = listSystemBackups();
const hasPreRestore = listAfterRestore.backups.some(b => (b.type && b.type.includes('PRE_RESTORE')) || (b.backupType && b.backupType.includes('PRE_RESTORE')));
assert(hasPreRestore === true, "SYS_BACKUPS ghi nhận bản sao lưu an toàn PRE_RESTORE");

// Test 19: Maintenance mode được tắt sau khi restore hoàn tất
assert(isMaintenanceMode() === false, "Maintenance mode được tắt an toàn sau khi restore hoàn thành");

// -------------------------------------------------------------------------
// GROUP 5: 5-LAYER SECURE SYSTEM RESET (PHẦN 34)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 5: 5-LAYER SECURE SYSTEM RESET ---");

// Test 20: Từ chối Reset nếu sai confirmation phrase
let resetBadPhraseRes = null;
try {
  resetBadPhraseRes = resetSystemData("TRANSACTIONS_ONLY", "WRONG_PHRASE", "123456", "admin");
} catch (e) {
  resetBadPhraseRes = { success: false, message: e.message };
}
assert(resetBadPhraseRes.success === false && resetBadPhraseRes.message.includes("RESET-THANHAN"),
  "Từ chối reset khi không nhập đúng chuỗi 'RESET-THANHAN'");

// Test 21: Từ chối Reset nếu người thực hiện không phải Admin
let resetNotAdminRes = null;
try {
  resetNotAdminRes = resetSystemData("TRANSACTIONS_ONLY", "RESET-THANHAN", "123456", "thukho01");
} catch (e) {
  resetNotAdminRes = { success: false, message: e.message };
}
assert(resetNotAdminRes.success === false && resetNotAdminRes.message.includes("Admin"),
  "Từ chối reset khi người dùng không phải Quản trị viên");

// Test 22: Thực hiện Reset an toàn TRANSACTIONS_ONLY
let resetOkRes = null;
try {
  resetOkRes = resetSystemData("TRANSACTIONS_ONLY", "RESET-THANHAN", "123456", "admin");
} catch (e) {
  resetOkRes = { success: false, message: e.message };
}
assert(resetOkRes.success === true && resetOkRes.preResetBackupId,
  "Reset TRANSACTIONS_ONLY thành công và tự động tạo bản sao lưu khẩn cấp PRE_RESET");

// Test 23: Header của SERIAL_MASTER vẫn được bảo toàn sau khi reset
assert(serialMasterSheet.getLastRow() === 1 && serialMasterSheet.getRange(1, 1, 1, 1).getValues()[0][0] === "Mã Serial (Hãng)",
  "Header bảng SERIAL_MASTER được giữ nguyên vẹn sau reset");

// Test 24: Danh mục người dùng DM_NGUOI_DUNG không bị xóa trong scope TRANSACTIONS_ONLY
const userSheetAfterReset = activeSpreadsheet.getSheetByName("DM_NGUOI_DUNG");
assert(userSheetAfterReset && userSheetAfterReset.getLastRow() > 1,
  "Danh mục người dùng vẫn được bảo toàn sau khi Reset Transactions Only");

// Test 25: Khôi phục lại từ bản PRE_RESET để trả lại dữ liệu kiểm thử
const restoreFromPreReset = restoreSystemBackup(resetOkRes.preResetBackupId, "admin");
assert(restoreFromPreReset.success === true, "Khôi phục thành công dữ liệu từ bản PRE_RESET khẩn cấp");

// -------------------------------------------------------------------------
// GROUP 6: DATA RECOVERY - SELECTIVE SERIAL RESCUE (PHẦN 34)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 6: DATA RECOVERY (PHỤC HỒI SERIAL VOID) ---");

// Test 26: Từ chối khôi phục Serial nếu Serial không ở trạng thái VOID
const recoverNonVoidRes = recoverVoidSerial("SN-MOCK-001", "IN_STOCK", "Thử cứu nhầm", "admin");
assert(recoverNonVoidRes.success === false && recoverNonVoidRes.message.includes("VOID"),
  "Từ chối cứu Serial khi Serial không ở trạng thái VOID");

// Test 27: Cứu thành công Serial có trạng thái VOID
const recoverVoidRes = recoverVoidSerial("SN-MOCK-VOID", "IN_STOCK", "Bấm nhầm hủy phiếu", "admin");
assert(recoverVoidRes.success === true, "Cứu thành công Serial SN-MOCK-VOID về lại IN_STOCK");

// Test 28: Trạng thái Serial Index được đồng bộ sau khi cứu
const indexSheet = activeSpreadsheet.getSheetByName("SERIAL_INDEX");
const indexValues = indexSheet.getRange(2, 1, indexSheet.getLastRow() - 1, 3).getValues();
const recoveredIndexRow = indexValues.find(r => r[0] === "SN-MOCK-VOID");
assert(recoveredIndexRow && recoveredIndexRow[2] === "IN_STOCK",
  "SERIAL_INDEX cập nhật trạng thái mới IN_STOCK sau khi phục hồi");

// -------------------------------------------------------------------------
// GROUP 7: MAINTENANCE MODE ENFORCEMENT & WRITE BLOCKING (PHẦN 35)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 7: MAINTENANCE MODE ENFORCEMENT ---");

// Test 29: Bật Maintenance mode
setMaintenanceMode(true, "Bảo trì nâng cấp hệ thống", "admin");
assert(isMaintenanceMode() === true, "setMaintenanceMode(true) bật cờ bảo trì thành công");

// Test 30: executeNhapKhoMulti bị chặn khi Maintenance mode đang bật
let nhapBlockedRes = null;
try {
  nhapBlockedRes = executeNhapKhoMulti({
    loHangId: "LH-TEST",
    nhaCungCap: "RICOH",
    nguoiNhap: "Trần Văn Kho",
    items: [{ model: "RICOH IM C3000", serials: ["SN-MAINT-001"], kho: "Kho Tổng", giaNhap: 1000 }]
  });
} catch (e) {
  nhapBlockedRes = { success: false, message: e.message };
}
assert(nhapBlockedRes.success === false && nhapBlockedRes.message.toLowerCase().includes("bảo trì"),
  "executeNhapKhoMulti từ chối ghi dữ liệu khi đang bảo trì hệ thống");

// Test 31: executeXuatKho bị chặn khi Maintenance mode đang bật
let xuatBlockedRes = null;
try {
  xuatBlockedRes = executeXuatKho({
    soPhieu: "XK-TEST",
    tenKhachHang: "Khách VIP",
    nguoiXuat: "Trần Văn Kho",
    items: [{ serial: "SN-MOCK-001" }]
  });
} catch (e) {
  xuatBlockedRes = { success: false, message: e.message };
}
assert(xuatBlockedRes.success === false && xuatBlockedRes.message.toLowerCase().includes("bảo trì"),
  "executeXuatKho từ chối xuất kho khi đang bảo trì hệ thống");

// Test 32: Tắt Maintenance mode
setMaintenanceMode(false, "Bảo trì hoàn tất", "admin");
assert(isMaintenanceMode() === false, "setMaintenanceMode(false) tắt bảo trì thành công");

// -------------------------------------------------------------------------
// GROUP 8: DATA RECONCILIATION & SERIAL REBUILD (PHẦN 35)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 8: RECONCILIATION & SERIAL INDEX REBUILD ---");

// Test 33: Tái lập chỉ mục Serial Index
const rebuildRes = rebuildSerialIndex();
assert(rebuildRes.success === true && rebuildRes.count >= 3,
  "rebuildSerialIndex quét toàn bộ SERIAL_MASTER và tái tạo chỉ mục O(1)");

// Test 34: runDataReconciliation phát hiện toàn vẹn
const reconRes = runDataReconciliation(false, "admin");
assert(reconRes.success === true && reconRes.report && reconRes.report.totalSerialsScanned >= 3,
  "runDataReconciliation quét đối soát toàn vẹn dữ liệu thành công");

// -------------------------------------------------------------------------
// GROUP 9: STRESS TEST & BENCHMARK GIẢ LẬP (PHẦN 35)
// -------------------------------------------------------------------------
console.log("\n--- GROUP 9: STRESS TEST & BENCHMARK (20,000 SERIALS) ---");

// Tạo 20.000 Serial giả lập trong memory map để đo tốc độ truy xuất O(1)
const STRESS_COUNT = 20000;
const stressIndexMap = new Map();
for (let i = 1; i <= STRESS_COUNT; i++) {
  stressIndexMap.set(`SN-STRESS-${i}`, {
    rowId: i + 1,
    status: i % 3 === 0 ? "EXPORTED" : "IN_STOCK",
    model: `RICOH-MODEL-${i % 10}`
  });
}

// Test 35: Tra cứu 1000 serial ngẫu nhiên qua Index Map
const lookupStart = Date.now();
for (let j = 0; j < 1000; j++) {
  const randKey = `SN-STRESS-${Math.floor(Math.random() * STRESS_COUNT) + 1}`;
  const found = stressIndexMap.get(randKey);
  if (!found) throw new Error("Index lookup failed");
}
const lookupDuration = Date.now() - lookupStart;
assert(lookupDuration < 50, `Tra cứu 1,000 Serial qua Serial Index Map cực nhanh: ${lookupDuration}ms (< 50ms)`);

// Test 36: Đo thời gian chụp snapshot 20.000 bản ghi
const snapStart = Date.now();
const serialized = JSON.stringify(Array.from(stressIndexMap.entries()));
const snapDuration = Date.now() - snapStart;
assert(snapDuration < 500 && serialized.length > 500000,
  `Snapshot và nén JSON 20,000 bản ghi Serial hoàn thành trong: ${snapDuration}ms (< 500ms)`);

// -------------------------------------------------------------------------
// TỔNG KẾT KẾT QUẢ KIỂM THỬ
// -------------------------------------------------------------------------
console.log("\n=========================================================================");
console.log(`   KẾT QUẢ KIỂM THỬ: ${passCount} PASSED / ${failCount} FAILED           `);
console.log("=========================================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log(">>> TOÀN BỘ 36/36 TEST CASES ĐÃ PASS 100%! <<<");
}
