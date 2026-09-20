const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('========================================================================');
console.log('GIẢ LẬP KIỂM THỬ PHẢN HỒI HỆ THỐNG TRÊN GOOGLE SHEETS & APPS SCRIPT');
console.log('Dự án: Quản Lý Kho Thành An V4');
console.log('Kiến trúc: Serial-Centric, Batched Writes, Selective Updates, Pagination');
console.log('========================================================================\n');

// 1. Tải toàn bộ mã nguồn backend thực tế từ thư mục src/backend/
const backendFiles = [
  '01_DanhMuc.js',
  '02_NhapKho.js',
  '03_XuatKho.js',
  '04_TonKho.js',
  '05_Serial360.js',
  'Code.js'
];

let backendCombinedSource = '';
backendFiles.forEach(f => {
  const fp = path.join(__dirname, '..', 'src', 'backend', f);
  if (fs.existsSync(fp)) {
    backendCombinedSource += fs.readFileSync(fp, 'utf8') + '\n;\n';
  }
});

// 2. Định nghĩa Mock Google Sheets Engine với bộ đếm RPC Roundtrips
class MockRange {
  constructor(sheet, startRow, startCol, numRows, numCols) {
    this.sheet = sheet;
    this.startRow = startRow;
    this.startCol = startCol;
    this.numRows = numRows;
    this.numCols = numCols;
  }

  getValues() {
    this.sheet.stats.readCalls++;
    this.sheet.stats.readCells += (this.numRows * this.numCols);
    const res = new Array(this.numRows);
    for (let r = 0; r < this.numRows; r++) {
      const rowIdx = (this.startRow - 1) + r;
      const row = new Array(this.numCols);
      for (let c = 0; c < this.numCols; c++) {
        const colIdx = (this.startCol - 1) + c;
        row[c] = this.sheet.data[rowIdx] ? (this.sheet.data[rowIdx][colIdx] !== undefined ? this.sheet.data[rowIdx][colIdx] : '') : '';
      }
      res[r] = row;
    }
    return res;
  }

  getValue() {
    this.sheet.stats.readCalls++;
    this.sheet.stats.readCells++;
    const rowIdx = this.startRow - 1;
    const colIdx = this.startCol - 1;
    return this.sheet.data[rowIdx] ? (this.sheet.data[rowIdx][colIdx] !== undefined ? this.sheet.data[rowIdx][colIdx] : '') : '';
  }

  setValues(newVals) {
    this.sheet.stats.writeCalls++;
    for (let r = 0; r < newVals.length; r++) {
      const rowIdx = (this.startRow - 1) + r;
      if (!this.sheet.data[rowIdx]) this.sheet.data[rowIdx] = [];
      for (let c = 0; c < newVals[r].length; c++) {
        const colIdx = (this.startCol - 1) + c;
        this.sheet.data[rowIdx][colIdx] = newVals[r][c];
        this.sheet.stats.writeCells++;
      }
    }
  }

  setValue(val) {
    this.setValues([[val]]);
  }
}

class MockSheet {
  constructor(name, initialData = []) {
    this.name = name;
    this.data = initialData.map(row => [...row]);
    this.stats = {
      readCalls: 0,
      readCells: 0,
      writeCalls: 0,
      writeCells: 0
    };
  }

  getLastRow() {
    return this.data.length;
  }

  getLastColumn() {
    let maxCol = 0;
    this.data.forEach(r => {
      if (r && r.length > maxCol) maxCol = r.length;
    });
    return maxCol || 17;
  }

  getDataRange() {
    return new MockRange(this, 1, 1, this.getLastRow(), this.getLastColumn());
  }

  getRange(row, col, numRows = 1, numCols = 1) {
    return new MockRange(this, row, col, numRows, numCols);
  }

  appendRow(rowArr) {
    this.stats.writeCalls++;
    this.stats.writeCells += rowArr.length;
    this.data.push([...rowArr]);
  }

  deleteRow(rowNum) {
    this.stats.writeCalls++;
    this.data.splice(rowNum - 1, 1);
  }

  resetStats() {
    this.stats = { readCalls: 0, readCells: 0, writeCalls: 0, writeCells: 0 };
  }
}

class MockSpreadsheet {
  constructor() {
    this.sheets = {};
  }
  getSheetByName(name) {
    return this.sheets[name] || null;
  }
  addSheet(sheet) {
    this.sheets[sheet.name] = sheet;
  }
  resetAllStats() {
    Object.values(this.sheets).forEach(s => s.resetStats());
  }
  getTotalRpcCalls() {
    let reads = 0, writes = 0, readCells = 0, writeCells = 0;
    Object.values(this.sheets).forEach(s => {
      reads += s.stats.readCalls;
      writes += s.stats.writeCalls;
      readCells += s.stats.readCells;
      writeCells += s.stats.writeCells;
    });
    return { reads, writes, totalCalls: reads + writes, readCells, writeCells };
  }
}

// 3. Hàm tạo Dataset quy mô N dòng dữ liệu kho thật
function generateRealisticWarehouseData(datasetSize) {
  const models = [
    { model: 'CANON-LBP2900', ten: 'Máy in Laser Canon LBP 2900', nhom: 'Máy In', bh: 12 },
    { model: 'RICOH-MP3055', ten: 'Máy Photocopy Ricoh MP 3055', nhom: 'Máy Photocopy', bh: 24 },
    { model: 'LENOVO-T14', ten: 'Laptop ThinkPad T14 Gen 3', nhom: 'Laptop', bh: 36 },
    { model: 'DELL-P2419H', ten: 'Màn hình Dell 24 inch IPS', nhom: 'Màn Hình', bh: 24 },
    { model: 'HP-M404DN', ten: 'Máy in HP LaserJet Pro M404dn', nhom: 'Máy In', bh: 12 }
  ];

  const warehouses = ['Kho Tổng Cầu Giấy', 'Kho Chi Nhánh Hà Đông', 'Kho Trưng Bày Phố Vọng'];
  const suppliers = ['Công ty TNHH Canon VN', 'Nhà Phân Phối FPT Synnex', 'Dầu Khí Petrosetco'];
  const customers = ['Bệnh Viện Bạch Mai', 'Trường ĐH Bách Khoa', 'Ngân Hàng Vietcombank', 'Tập Đoàn Viettel', 'Công ty FPT Software'];

  // Cột V4_SERIAL_MASTER:
  // 0: Serial | 1: Model | 2: Tên hàng | 3: Nhóm hàng | 4: Loại hàng | 5: Kho | 6: NCC | 7: Ngày nhập
  // 8: Mã phiếu nhập | 9: Trạng thái | 10: Phiếu xuất | 11: Ngày xuất | 12: Khách hàng | 13: SĐT khách
  // 14: Địa chỉ | 15: Hạn BH | 16: Ghi chú
  const serialMasterHeader = [
    'Mã Serial', 'Model', 'Tên Hàng Hóa', 'Nhóm Hàng', 'Loại Hàng', 'Kho Lưu Trữ',
    'Nhà Cung Cấp', 'Ngày Nhập', 'Mã Phiếu Nhập', 'Trạng Thái', 'Mã Phiếu Xuất',
    'Ngày Xuất', 'Khách Hàng', 'Số Điện Thoại Khách', 'Địa Chỉ Giao', 'Hạn Bảo Hành', 'Ghi Chú'
  ];

  const serialRows = [serialMasterHeader];
  const importRows = [['Mã Phiếu', 'Ngày Nhập', 'Nhà Cung Cấp', 'Model', 'Số Lượng', 'Serials', 'Kho Lưu', 'Ghi Chú']];
  const exportRows = [['Mã Phiếu', 'Ngày Xuất', 'Khách Hàng', 'Số Lượng', 'Serials', 'Số Tháng BH', 'Ghi Chú']];
  const auditRows = [['Thời Gian', 'Người Thực Hiện', 'Hành Động', 'Đối Tượng', 'Chi Tiết Thay Đổi']];

  // Tỉ lệ: 70% Tồn kho, 30% Đã xuất bán
  for (let i = 1; i <= datasetSize; i++) {
    const mod = models[i % models.length];
    const wh = warehouses[i % warehouses.length];
    const ncc = suppliers[i % suppliers.length];
    const sn = `TA-${String(mod.model).replace(/[^A-Z0-9]/g, '').slice(0, 5)}-${String(i).padStart(6, '0')}`;
    const pnCode = `PN-2609-${String(Math.floor(i / 10) + 1).padStart(4, '0')}`;
    const importDate = new Date(2026, 8, Math.max(1, (i % 28)));

    const isExported = (i % 10 < 3); // 30% xuất
    let status = 'Tồn kho';
    let pxCode = '';
    let exportDate = '';
    let custName = '';
    let custPhone = '';
    let custAddr = '';
    let expWarranty = '';

    if (isExported) {
      status = 'Đã xuất';
      pxCode = `PX-2609-${String(Math.floor(i / 5) + 1).padStart(4, '0')}`;
      exportDate = '15/09/2026';
      const cust = customers[i % customers.length];
      custName = cust;
      custPhone = '0987654321';
      custAddr = 'Hà Nội';
      expWarranty = '15/09/2028';
    }

    serialRows.push([
      sn, mod.model, mod.ten, mod.nhom, 'Mới 100%', wh,
      ncc, importDate, pnCode, status, pxCode,
      exportDate, custName, custPhone, custAddr, expWarranty, 'Hàng chính hãng'
    ]);

    if (i % 10 === 0) {
      importRows.push([pnCode, '10/09/2026', ncc, mod.model, 10, `${sn}...`, wh, 'Nhập định kỳ']);
    }
    if (isExported && i % 5 === 0) {
      exportRows.push([pxCode, '15/09/2026', custName, 5, `${sn}...`, 24, 'Xuất dự án']);
    }
    if (i % 2 === 0) {
      auditRows.push(['18/09/2026 10:00:00', 'Thủ Kho', 'NHẬP KHO', sn, `Nhập máy ${mod.model} vào kho ${wh}`]);
    }
  }

  const ss = new MockSpreadsheet();
  ss.addSheet(new MockSheet('V4_SERIAL_MASTER', serialRows));
  ss.addSheet(new MockSheet('LICH_SU_NHAP', importRows));
  ss.addSheet(new MockSheet('LICH_SU_XUAT', exportRows));
  ss.addSheet(new MockSheet('NHAT_KY_HOAT_DONG', auditRows));
  ss.addSheet(new MockSheet('DM_SAN_PHAM', [
    ['model', 'ten', 'nhom'],
    ...models.map(m => [m.model, m.ten, m.nhom])
  ]));
  ss.addSheet(new MockSheet('DM_NCC', [
    ['tenTat', 'tenDayDu', 'sdt', 'ghiChu'],
    ...suppliers.map(s => [s, s, '0912345678', ''])
  ]));
  ss.addSheet(new MockSheet('DM_KHACH_HANG', [
    ['ten', 'sdt', 'diaChi', 'ghiChu'],
    ...customers.map(c => [c, '0987654321', 'Hà Nội', ''])
  ]));
  ss.addSheet(new MockSheet('DM_QUY_CHUAN', [
    ['nhom', 'kho', 'loai', 'bh'],
    ['Máy In', 'Kho Tổng Cầu Giấy', 'Mới 100%', '12 tháng']
  ]));

  return ss;
}

// 4. Tạo môi trường Sandbox chuẩn Google Apps Script
function createAppsScriptSandbox(mockSS) {
  const memoryCache = {};
  const scriptProps = {};

  const sandbox = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => mockSS
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => memoryCache[k] || null,
        put: (k, v, ttl) => { memoryCache[k] = String(v); },
        remove: (k) => { delete memoryCache[k]; }
      })
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => scriptProps[k] || null,
        setProperty: (k, v) => { scriptProps[k] = String(v); }
      })
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => true,
        releaseLock: () => true
      })
    },
    Utilities: {
      formatDate: (d, tz, fmt) => {
        if (!(d instanceof Date)) return '';
        const pad = (n) => String(n).padStart(2, '0');
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();
        if (fmt.includes('HH:mm:ss')) {
          const h = pad(d.getHours());
          const m = pad(d.getMinutes());
          const s = pad(d.getSeconds());
          return `${day}/${month}/${year} ${h}:${m}:${s}`;
        }
        return `${day}/${month}/${year}`;
      }
    },
    console: console,
    Date: Date,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    String: String,
    Array: Array,
    Object: Object
  };

  vm.createContext(sandbox);
  vm.runInContext(backendCombinedSource, sandbox);
  return sandbox;
}

// 5. Hàm đo thời gian chính xác (ms)
function measureExecution(fn) {
  const start = process.hrtime.bigint();
  const res = fn();
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1000000;
  return { res, durationMs: parseFloat(durationMs.toFixed(2)) };
}

// 6. Chạy Benchmark qua các quy mô: 100, 500, 2000, 10000, 20000
const DATASET_SIZES = [100, 500, 2000, 10000, 20000];
const benchmarkResults = [];

console.log('>>> BẮT ĐẦU CHẠY BENCHMARK MÔ PHỎNG GOOGLE SHEETS TRÊN 5 QUY MÔ DỮ LIỆU <<<\n');

DATASET_SIZES.forEach(size => {
  const ss = generateRealisticWarehouseData(size);
  const app = createAppsScriptSandbox(ss);

  // A. Khởi tạo Slim Bootstrap (getInitAppData)
  ss.resetAllStats();
  const initMetric = measureExecution(() => app.getInitAppData());
  const initCalls = ss.getTotalRpcCalls();

  // B. Phân trang Tồn kho Trang 1 (getStockPage 50 rows)
  ss.resetAllStats();
  const stockPage1Metric = measureExecution(() => app.getStockPage({ page: 1, pageSize: 50 }));
  const stockCalls = ss.getTotalRpcCalls();

  // C. Phân trang Tồn kho Trang Giữa (getStockPage middle)
  const totalStockFound = stockPage1Metric.res.total;
  const totalPages = stockPage1Metric.res.totalPages;
  const midPage = Math.max(1, Math.floor(totalPages / 2));
  ss.resetAllStats();
  const stockPageMidMetric = measureExecution(() => app.getStockPage({ page: midPage, pageSize: 50 }));

  // D. Tra cứu tức thì Serial 360° Profile (getSerial360Profile)
  const targetSerialIdx = Math.floor(size * 0.8);
  const targetSerial = `TA-CANON-${String(targetSerialIdx).padStart(6, '0')}`;
  ss.resetAllStats();
  const serial360Metric = measureExecution(() => app.getSerial360Profile(targetSerial));
  const serial360Calls = ss.getTotalRpcCalls();

  // E. Giao dịch Nhập kho theo lô 10 máy (sinh serials + executeNhapKhoMulti)
  ss.resetAllStats();
  const importMetric = measureExecution(() => {
    const autoSerials = app.generateAutoSerials('TA-CANON', 10);
    return app.executeNhapKhoMulti({
      requestId: `REQ-BENCHMARK-${size}-${Date.now()}`,
      maPhieu: `PN-BENCH-${size}-${Date.now()}`,
      ngay: '19/09/2026',
      ncc: 'Công ty TNHH Canon VN',
      kho: 'Kho Tổng Cầu Giấy',
      ghiChu: 'Test nhập lô benchmark',
      items: [
        {
          model: 'CANON-LBP2900',
          tenHang: 'Máy in Laser Canon LBP 2900',
          nhomHang: 'Máy In',
          soLuong: 10,
          kho: 'Kho Tổng Cầu Giấy',
          ncc: 'Công ty TNHH Canon VN',
          serials: autoSerials
        }
      ]
    });
  });
  const importCalls = ss.getTotalRpcCalls();

  // F. Giao dịch Xuất kho Selective Update 10 máy (executeXuatKho)
  const exportSerials = stockPage1Metric.res.rows.slice(0, 10).map(r => r.serial);
  ss.resetAllStats();
  let exportMetric = { durationMs: 0, res: null };
  let exportCalls = { reads: 0, writes: 0, totalCalls: 0, writeCells: 0 };
  if (exportSerials.length > 0) {
    exportMetric = measureExecution(() => {
      return app.executeXuatKho({
        requestId: `REQ-EXP-${size}-${Date.now()}`,
        maPhieu: `PX-BENCH-${size}-${Date.now()}`,
        ngayXuat: '19/09/2026',
        khachHang: 'Tập Đoàn Viettel',
        sdt: '0988888888',
        diaChi: 'Hà Nội',
        soThangBh: '24 tháng',
        ghiChu: 'Test xuất kho selective benchmark',
        serials: exportSerials
      });
    });
    exportCalls = ss.getTotalRpcCalls();
  }

  // G. Tổng hợp Dashboard KPI (getDashboardSummary)
  ss.resetAllStats();
  const dashboardMetric = measureExecution(() => app.getDashboardSummary('month'));
  const dashboardCalls = ss.getTotalRpcCalls();

  // H. Phân trang Audit Nhật ký (getAuditPage)
  ss.resetAllStats();
  const auditMetric = measureExecution(() => app.getAuditPage({}, 1, 25));

  // I. Hủy thiết bị an toàn Soft Void (deleteThietBi)
  ss.resetAllStats();
  const voidMetric = measureExecution(() => app.deleteThietBi(2, 'Hỏng hóc trong kho test'));
  const voidCalls = ss.getTotalRpcCalls();

  // Ước tính thời gian thực tế trên Google Sheets (Apps Script Real-world Latency):
  // Trên Google Sheets thật: Mỗi lượt gọi RPC getValues/setValues tốn trung bình ~150ms - 250ms mạng/Google infrastructure.
  // Vì kiến trúc V4 dùng Batched calls, mỗi thao tác chỉ tốn 1-3 calls RPC thay vì hàng nghìn calls!
  const estimatedSheetsLatencyMs = (totalRpcCalls, codeTimeMs) => {
    return Math.round(codeTimeMs + (totalRpcCalls * 180)); // 180ms TB mỗi đợt RPC Google Sheet
  };

  benchmarkResults.push({
    'Quy Mô Dữ Liệu': `${size.toLocaleString()} dòng`,
    'Tồn Kho Thực': `${totalStockFound.toLocaleString()} máy`,
    'Slim Init (ms)': `${initMetric.durationMs} ms`,
    'Query Tồn Kho (ms)': `${stockPage1Metric.durationMs} ms`,
    'Tra Cứu 360 (ms)': `${serial360Metric.durationMs} ms`,
    'Nhập Kho 10 máy (ms)': `${importMetric.durationMs} ms`,
    'Xuất Kho 10 máy (ms)': `${exportMetric.durationMs} ms`,
    'Dashboard KPI (ms)': `${dashboardMetric.durationMs} ms`,
    'Soft Void (ms)': `${voidMetric.durationMs} ms`,
    'Sheets RPC Calls (Nhập/Xuất)': `${importCalls.totalCalls} / ${exportCalls.totalCalls} calls`,
    'Phản Hồi GG Sheets Thật': `~${estimatedSheetsLatencyMs(Math.max(stockCalls.totalCalls, exportCalls.totalCalls), stockPage1Metric.durationMs)} ms`
  });
});

// In bảng kết quả đo
console.table(benchmarkResults);
