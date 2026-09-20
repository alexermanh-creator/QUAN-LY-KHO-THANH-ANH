// =========================================================================
// TEST HARNESS: Google Apps Script Mock + Migration & BackTest Runner
// =========================================================================

const fs = require('fs');
const path = require('path');

// 1. MOCK GOOGLE APPS SCRIPT API
class SheetMock {
  constructor(name, initialData = []) {
    this.name = name;
    this.data = JSON.parse(JSON.stringify(initialData)); // 2D array
  }

  getLastRow() {
    return this.data.length;
  }

  getLastColumn() {
    return this.data.length > 0 ? this.data[0].length : 0;
  }

  appendRow(row) {
    this.data.push(row);
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
      },
      setFontWeight: function() { return this; },
      setBackground: function() { return this; }
    };
  }
}

class SpreadsheetMock {
  constructor() {
    this.sheets = {};
  }

  getSheetByName(name) {
    return this.sheets[name] || null;
  }

  insertSheet(name) {
    const sheet = new SheetMock(name);
    this.sheets[name] = sheet;
    return sheet;
  }
}

const ssMock = new SpreadsheetMock();

// Mock global GAS objects
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ssMock
};

global.Utilities = {
  formatDate: (date, tz, fmt) => {
    if (!date) return "";
    const d = (date instanceof Date) ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

global.LockService = {
  getScriptLock: () => ({
    tryLock: () => true,
    releaseLock: () => {}
  })
};

// 2. TẠO DỮ LIỆU FIXTURE V3 CHUẨN THEO ĐẶC TẢ
// Tab DATA_THIET_BI
const headersV3Tb = [
  "Serial Number", "Model", "Tên Hàng Hóa", "Nhóm Hàng", "Loại Hàng", "Vị Trí Kho",
  "Nhà Cung Cấp", "Ngày Nhập", "Mã Phiếu Nhập", "Trạng Thái", "Ngày Xuất",
  "Mã Phiếu Xuất", "Khách Hàng", "SĐT Khách", "Số Tháng BH", "Hạn Bảo Hành", "Ghi Chú"
];

const mockV3TbData = [
  headersV3Tb,
  // 4 máy Canon 6030 tồn kho
  ["CANON-6030-001", "Canon LBP 6030", "Máy in Laser đen trắng", "Máy in", "Mới 100%", "Kho VP", "Song Hùng", new Date(2025, 0, 15), "PN-20250115-01", "Tồn kho", "", "", "", "", 12, "", "Hàng nguyên seal"],
  ["CANON-6030-002", "Canon LBP 6030", "Máy in Laser đen trắng", "Máy in", "Mới 100%", "Kho VP", "Song Hùng", new Date(2025, 0, 15), "PN-20250115-01", "Tồn kho", "", "", "", "", 12, "", "Hàng nguyên seal"],
  ["CANON-6030-003", "Canon LBP 6030", "Máy in Laser đen trắng", "Máy in", "Mới 100%", "Kho VP", "Song Hùng", new Date(2025, 0, 15), "PN-20250115-01", "Tồn kho", "", "", "", "", 12, "", "Hàng nguyên seal"],
  ["CANON-6030-004", "Canon LBP 6030", "Máy in Laser đen trắng", "Máy in", "Mới 100%", "Kho VP", "Song Hùng", new Date(2025, 0, 15), "PN-20250115-01", "Tồn kho", "", "", "", "", 12, "", "Hàng nguyên seal"],
  
  // 6 máy Canon 6030w: 3 tồn, 3 đã xuất
  ["CANON-6030W-001", "Canon LBP 6030w", "Máy in Laser Wifi", "Máy in", "Mới 100%", "Kho Tổng", "Song Hùng", new Date(2025, 1, 10), "PN-20250210-01", "Tồn kho", "", "", "", "", 12, "", ""],
  ["CANON-6030W-002", "Canon LBP 6030w", "Máy in Laser Wifi", "Máy in", "Mới 100%", "Kho Tổng", "Song Hùng", new Date(2025, 1, 10), "PN-20250210-01", "Tồn kho", "", "", "", "", 12, "", ""],
  ["CANON-6030W-003", "Canon LBP 6030w", "Máy in Laser Wifi", "Máy in", "Mới 100%", "Kho Tổng", "Song Hùng", new Date(2025, 1, 10), "PN-20250210-01", "Tồn kho", "", "", "", "", 12, "", ""],
  ["CANON-6030W-004", "Canon LBP 6030w", "Máy in Laser Wifi", "Máy in", "Mới 100%", "Kho Tổng", "Song Hùng", new Date(2025, 1, 10), "PN-20250210-01", "Đã xuất", new Date(2025, 2, 1), "PX-20250301-01", "Công ty TNHH Á Châu", "0901234567", 12, "28/02/2026", "Giao VP 1"],
  ["CANON-6030W-005", "Canon LBP 6030w", "Máy in Laser Wifi", "Máy in", "Mới 100%", "Kho Tổng", "Song Hùng", new Date(2025, 1, 10), "PN-20250210-01", "Đã xuất", new Date(2025, 2, 1), "PX-20250301-01", "Công ty TNHH Á Châu", "0901234567", 12, "28/02/2026", "Giao VP 2"],
  ["CANON-6030W-006", "Canon LBP 6030w", "Máy in Laser Wifi", "Máy in", "Mới 100%", "Kho Tổng", "Song Hùng", new Date(2025, 1, 10), "PN-20250210-01", "Đã xuất", new Date(2025, 2, 5), "PX-20250305-02", "Trường THCS Lê Quý Đôn", "0987654321", 12, "05/03/2026", "Phòng hiệu bộ"],

  // 2 máy Ricoh MP 5054 (Máy cũ 95%): 1 tồn, 1 đã xuất
  ["RICOH-5054-001", "Ricoh MP 5054", "Máy photocopy đa năng", "Máy Photocopy", "Cũ 95%", "Kho VP", "Phú Sơn", new Date(2024, 10, 20), "PN-20241120-01", "Tồn kho", "", "", "", "", 6, "", "Bàn giao kèm chân kê"],
  ["RICOH-5054-002", "Ricoh MP 5054", "Máy photocopy đa năng", "Máy Photocopy", "Cũ 95%", "Kho VP", "Phú Sơn", new Date(2024, 10, 20), "PN-20241120-01", "Đã xuất", new Date(2024, 11, 1), "PX-20241201-01", "UBND Phường 1", "0912348888", 6, "31/05/2025", "Hợp đồng thuê 1 năm"]
];

// Tab LICH_SU_NHAP
const headersV3Nhap = ["Mã Phiếu Nhập", "Ngày Nhập", "Nhà Cung Cấp", "Model", "Số Lượng", "Danh Sách Serial", "Kho Nhập", "Ghi Chú"];
const mockV3NhapData = [
  headersV3Nhap,
  ["PN-20250115-01", new Date(2025, 0, 15), "Song Hùng", "Canon LBP 6030", 4, "CANON-6030-001, CANON-6030-002, CANON-6030-003, CANON-6030-004", "Kho VP", "Nhập đợt 1"],
  ["PN-20250210-01", new Date(2025, 1, 10), "Song Hùng", "Canon LBP 6030w", 6, "CANON-6030W-001, CANON-6030W-002, CANON-6030W-003, CANON-6030W-004, CANON-6030W-005, CANON-6030W-006", "Kho Tổng", "Nhập bổ sung wifi"],
  ["PN-20241120-01", new Date(2024, 10, 20), "Phú Sơn", "Ricoh MP 5054", 2, "RICOH-5054-001, RICOH-5054-002", "Kho VP", "Máy thanh lý cơ quan"]
];

// Tab LICH_SU_XUAT
const headersV3Xuat = ["Mã Phiếu Xuất", "Ngày Xuất", "Khách Hàng", "Số Lượng", "Danh Sách Serial", "Gói Bảo Hành", "Ghi Chú"];
const mockV3XuatData = [
  headersV3Xuat,
  ["PX-20250301-01", new Date(2025, 2, 1), "Công ty TNHH Á Châu", 2, "CANON-6030W-004, CANON-6030W-005", "12 tháng", "Xuất lô 2 máy"],
  ["PX-20250305-02", new Date(2025, 2, 5), "Trường THCS Lê Quý Đôn", 1, "CANON-6030W-006", "12 tháng", "Xuất máy lẻ"],
  ["PX-20241201-01", new Date(2024, 11, 1), "UBND Phường 1", 1, "RICOH-5054-002", "6 tháng", "Xuất máy photo"]
];

// Nạp các sheet V3 vào Mock Spreadsheet
ssMock.sheets["DATA_THIET_BI"] = new SheetMock("DATA_THIET_BI", mockV3TbData);
ssMock.sheets["LICH_SU_NHAP"] = new SheetMock("LICH_SU_NHAP", mockV3NhapData);
ssMock.sheets["LICH_SU_XUAT"] = new SheetMock("LICH_SU_XUAT", mockV3XuatData);

// 3. LOAD VÀ THỰC THI MIGRATION V3 -> V4 SCRIPT
console.log("================================================================");
console.log("BẮT ĐẦU CHẠY THỬ NGHIỆM SIMULATION: MIGRATION V3 -> V4");
console.log("================================================================");

const migrationCode = fs.readFileSync(path.join(__dirname, '../src/backend/Migration_V3_to_V4.js'), 'utf8');
const backTestCode = fs.readFileSync(path.join(__dirname, '../src/backend/BackTest_Reconciliation.js'), 'utf8');

eval(migrationCode);
eval(backTestCode);

// Chạy Migration
const migReport = runMigrationV3toV4();
console.log("\n--- KẾT QUẢ ETL MIGRATION ENGINE ---");
console.log(`- Trạng thái: ${migReport.status}`);
console.log(`- Bảng V4 đã tạo: ${migReport.tablesCreated.join(', ')}`);
console.log(`- Số lượng Serial chuyển đổi: ${migReport.serialsMigrated}`);
console.log(`- Số lượng Phiếu Nhập Header: ${migReport.receiptsMigrated}`);
console.log(`- Số lượng Chi tiết Dòng Phiếu Nhập (Detail): ${migReport.receiptDetailsMigrated}`);
console.log(`- Số lượng Phiếu Xuất Header: ${migReport.issuesMigrated}`);
console.log(`- Số lượng Chi tiết Dòng Phiếu Xuất (Detail): ${migReport.issueDetailsMigrated}`);
console.log(`- Thời gian xử lý: ${migReport.durationSeconds}s`);

// Chạy Back-Test Reconciliation
console.log("\n================================================================");
console.log("BẮT ĐẦU CHẠY KIỂM TOÁN TỰ ĐỘNG (7 TEST CASES: BT-01 ĐẾN BT-07)");
console.log("================================================================");

const auditReport = runReconciliationAudit();
console.log(`\nKết quả tổng thể: ${auditReport.allPassed ? '>>> 100% PASS ALL TESTS <<<' : '!!! FAILED !!!'}`);
console.log(`Tổng số bài test: ${auditReport.totalTests} | Đạt: ${auditReport.passedCount} | Thất bại: ${auditReport.failedCount}`);
console.log("\nChi tiết từng bài kiểm tra đối soát:");
auditReport.details.forEach(t => {
  const icon = t.passed ? '[PASS]' : '[FAIL]';
  console.log(`${icon} ${t.id} - ${t.name}`);
  console.log(`       Kỳ vọng (V3): ${t.expected}`);
  console.log(`       Thực tế (V4): ${t.actual}`);
  console.log(`       Ghi chú:      ${t.note}`);
});

// 4. KIỂM TRA TÍNH BẢO TOÀN KHI CHẠY LẠI MIGRATION (IDEMPOTENCY - D03)
console.log("\n================================================================");
console.log("KIỂM TRA TÍNH TOÀN VẸN KHI CHẠY LẠI LẦN 2 (IDEMPOTENCY - TEST D03)");
console.log("================================================================");

const rerunReport = runMigrationV3toV4();
console.log(`- Trạng thái chạy lại lần 2: ${rerunReport.status}`);
console.log(`- Serial ghi nhận sau lần 2: ${rerunReport.serialsMigrated}`);

const auditReport2 = runReconciliationAudit();
console.log(`- Kết quả audit sau lần 2: ${auditReport2.allPassed ? '100% PASS' : 'FAIL'} (Serial V4: ${auditReport2.details[0].actual}, Kỳ vọng: ${auditReport2.details[0].expected})`);

if (!auditReport2.allPassed || auditReport2.details[0].actual !== 12) {
  console.error("!!! LỖI: Chạy lại migration bị nhân bản dữ liệu!");
  process.exit(1);
} else {
  console.log(">>> IDEMPOTENCY ĐẠT CHUẨN: Dữ liệu không bị nhân bản khi chạy lại! <<<");
}

if (!auditReport.allPassed) {
  process.exit(1);
} else {
  console.log("\n>>> ĐỐI SOÁT DỮ LIỆU THÀNH CÔNG RỰC RỠ: 100% SERIAL VÀ CHỨNG TỪ KHỚP TUYỆT ĐỐI <<<");
}

