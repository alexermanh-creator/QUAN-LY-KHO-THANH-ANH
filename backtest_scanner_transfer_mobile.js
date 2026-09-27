/**
 * BACKTEST 3 CA NGHIỆP VỤ:
 * 1. Quét 360 đóng modal dứt khoát khi bấm Đưa vào form (không kẹt popup/backdrop)
 * 2. Toast notification không chặn click trên Mobile (pointer-events: none)
 * 3. Chuyển kho hàng loạt 3-5 máy đồng thời từ ảnh thư viện
 */
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('gas/Index.html', 'utf8');
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
let mainScript = '';
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code.length > 500000) { mainScript = code; break; }
}

if (!mainScript) { console.error('Script chính không tìm thấy!'); process.exit(1); }
console.log(`📦 Đã load script chính: ${mainScript.length} ký tự`);

// DOM Mock
const mockElements = {};
function createStyleMock() {
  const s = {
    display: '', opacity: '', pointerEvents: '', bottom: '', right: '',
    removeProperty(p) { delete this[p]; }
  };
  let _cssText = '';
  Object.defineProperty(s, 'cssText', {
    get() { return _cssText; },
    set(val) {
      _cssText = val;
      const bMatch = val.match(/bottom:\s*([^;]+);/);
      if (bMatch) s.bottom = bMatch[1].trim();
      const pMatch = val.match(/pointer-events:\s*([^;]+);/);
      if (pMatch) s.pointerEvents = pMatch[1].trim();
    }
  });
  return s;
}

function createEl(id, tag = 'div') {
  return {
    id: id || '',
    tagName: tag.toUpperCase(),
    value: '',
    textContent: '',
    innerText: '',
    innerHTML: '',
    disabled: false,
    style: createStyleMock(),
    className: '',
    classList: {
      _c: new Set(),
      add(c) { this._c.add(c); },
      remove(c) { this._c.delete(c); },
      contains(c) { return this._c.has(c); },
      toggle(c) { this._c.has(c) ? this._c.delete(c) : this._c.add(c); }
    },
    addEventListener() {},
    removeEventListener() {},
    focus() {},
    closest() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getAttribute(attr) { return this[attr] || null; },
    setAttribute(attr, val) { this[attr] = val; },
    removeAttribute(attr) { delete this[attr]; },
    parentElement: null,
    children: [],
    appendChild(child) { this.children.push(child); return child; },
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
    },
    dataset: {}
  };
}

// Danh sách các element cần cho test
[
  'scannerModal', 'serial-360-search-input', 'transfer-serial', 'transfer-target-kho',
  'transfer-serial-counter', 'transfer-batch-note', 'nhap-serial-input', 'nhap-serial-counter',
  'scanner-results-container', 'btn-submit-extracted-serials'
].forEach(id => { mockElements[id] = createEl(id); });

let activeBackdrops = [];

const sandbox = {
  console: console,
  setTimeout: (fn, ms) => { fn(); return 1; },
  clearTimeout: () => {},
  setInterval: (fn, ms) => 1,
  clearInterval: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: (id) => mockElements[id] || null,
    createElement: (tag) => createEl('', tag),
    querySelectorAll: (sel) => {
      if (sel === '.modal-backdrop') return activeBackdrops;
      return [];
    },
    querySelector: (sel) => {
      if (sel === '.modal-backdrop') return activeBackdrops[0] || null;
      return null;
    },
    body: {
      classList: {
        _c: new Set(),
        add(c) { this._c.add(c); },
        remove(c) { this._c.delete(c); },
        contains(c) { return this._c.has(c); }
      },
      style: {
        removeProperty(p) { delete this[p]; }
      },
      appendChild: (el) => {
        if (el.id) mockElements[el.id] = el;
        return el;
      }
    }
  },
  bootstrap: {
    Modal: {
      getInstance: (el) => ({
        hide: () => {
          el.style.display = 'none';
          el.classList.remove('show');
        }
      }),
      getOrCreateInstance: (el) => ({
        hide: () => {
          el.style.display = 'none';
          el.classList.remove('show');
        }
      })
    }
  },
  Swal: {
    fire: () => Promise.resolve({ isConfirmed: true })
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {}
  }
};

sandbox.window = sandbox;
sandbox.global = sandbox;

const context = vm.createContext(sandbox);
vm.runInContext(mainScript, context);

console.log('✅ Khởi chạy môi trường VM thành công!\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// ----------------------------------------------------
// TEST 1: Quét 360 đóng modal dứt khoát khi bấm Đưa vào form
// ----------------------------------------------------
console.log('--- TEST 1: BẤM ĐƯA VÀO FORM (360) -> MODAL ĐÓNG TỨC THÌ & KHÔNG KẸT BACKDROP ---');
try {
  const modalEl = mockElements['scannerModal'];
  modalEl.style.display = 'block';
  modalEl.classList.add('show');

  // Giả lập backdrop mồ côi
  const backdropMock = {
    remove: () => {
      activeBackdrops = [];
    }
  };
  activeBackdrops = [backdropMock];
  sandbox.document.body.classList.add('modal-open');

  // Lấy 1 thiết bị thực tế đang có trong kho
  const existingItem = (sandbox.window.SERIAL_DB && sandbox.window.SERIAL_DB.length > 0)
    ? sandbox.window.SERIAL_DB[0]
    : { serial: 'SN-TEST-360', model: 'MacBook Pro M3 Max', kho: 'Kho VP' };
  const existingSn = existingItem.serial;

  sandbox.setScanContext('AUTO_UNIVERSAL');
  sandbox.extractedSerialsList = [{ serial: existingSn }];

  let switchedTabName = '';
  sandbox.switchTab = (tab) => { switchedTabName = tab; };
  let lookedUpSerial = '';
  sandbox.lookupSerial360 = (sn) => { lookedUpSerial = sn; };

  // Thực hiện bấm nút Đưa Vào Form
  sandbox.submitExtractedSerialsToContext();

  // Kiểm tra kết quả
  assert(modalEl.style.display === 'none', 'Modal scanner đã được ẩn hoàn toàn (display: none)');
  assert(!modalEl.classList.contains('show'), 'Class "show" đã được gỡ bỏ khỏi modal');
  assert(activeBackdrops.length === 0, 'Toàn bộ thẻ .modal-backdrop mồ côi đã bị dọn sạch');
  assert(!sandbox.document.body.classList.contains('modal-open'), 'Class "modal-open" đã được gỡ khỏi body');
  assert(switchedTabName === 'Serial360', 'Hệ thống đã tự động chuyển tab sang Serial360');
  assert(mockElements['serial-360-search-input'].value === existingSn, `Số Serial (${existingSn}) đã được nạp chuẩn xác vào ô tìm kiếm 360`);
  assert(lookedUpSerial === existingSn, 'Đã kích hoạt hàm tra cứu hồ sơ 360 với đúng Serial');
} catch (e) {
  console.error('Lỗi khi chạy Test 1:', e);
  failCount++;
}

// ----------------------------------------------------
// TEST 2: Toast notification có pointer-events: none (không chặn click trên mobile)
// ----------------------------------------------------
console.log('\n--- TEST 2: TOAST NOTIFICATION KHÔNG CHẶN CLICK TRÊN MOBILE ---');
try {
  sandbox.showFloatingScannerToast('✨ Đã quét thành công 1 thiết bị');
  const toast = mockElements['scanner-floating-toast'];
  assert(toast !== undefined, 'Element scanner-floating-toast tồn tại trong DOM');
  assert(toast.style.pointerEvents === 'none', 'Toast được thiết lập pointer-events: none (ngón tay bấm xuyên qua)');
  assert(parseInt(toast.style.bottom) >= 60, `Toast đặt ở vị trí cao hơn đáy (${toast.style.bottom}) để tránh menu đáy mobile`);
} catch (e) {
  console.error('Lỗi khi chạy Test 2:', e);
  failCount++;
}

// ----------------------------------------------------
// TEST 3: Chuyển kho hàng loạt 3-5 máy cùng lúc từ bóc tách ảnh thư viện
// ----------------------------------------------------
console.log('\n--- TEST 3: CHUYỂN KHO HÀNG LOẠT 4 MÁY TỪ BÓC TÁCH ẢNH THƯ VIỆN ---');
try {
  // Lấy 4 máy thực tế trong CSDL
  const sampleDevices = sandbox.window.SERIAL_DB.slice(0, 4);
  const serials = sampleDevices.map(d => d.serial);
  const originalKho = sampleDevices[0].kho || 'Kho VP';
  const targetKho = originalKho === 'Kho Tổng VP' ? 'Kho Chi Nhánh Đà Nẵng' : 'Kho Tổng VP';

  // Đảm bảo cả 4 máy đang ở originalKho và có timeline mảng
  sampleDevices.forEach(d => {
    d.kho = originalKho;
    if (!Array.isArray(d.timeline)) d.timeline = [];
  });

  // Giả lập bóc tách 4 ảnh từ thư viện
  sandbox.setScanContext('TRANSFER_WAREHOUSE');
  sandbox.extractedSerialsList = serials.map(s => ({ serial: s }));

  // Bấm Đưa vào form
  sandbox.submitExtractedSerialsToContext();

  const transferVal = mockElements['transfer-serial'].value.trim();
  const serialsInTextarea = transferVal.split('\n');

  assert(serialsInTextarea.length === 4, `Form Chuyển kho đã nhận đủ 4 serial (thực tế: ${serialsInTextarea.length})`);
  assert(serialsInTextarea.includes(serials[0]) && serialsInTextarea.includes(serials[3]), 'Danh sách serial chứa đầy đủ từ máy đầu tới máy cuối');
  assert(mockElements['transfer-serial-counter'].textContent === '4 máy', `Huy hiệu đếm số máy hiển thị chính xác "4 máy" (thực tế: ${mockElements['transfer-serial-counter'].textContent})`);

  // Chọn kho đến
  mockElements['transfer-target-kho'].value = targetKho;
  mockElements['transfer-batch-note'].value = 'Điều chuyển gấp cho chi nhánh';

  // Bấm Xác nhận chuyển kho
  sandbox.submitTransferWarehouse();

  // Kiểm tra kho của cả 4 máy trong SERIAL_DB
  const allTransferred = sampleDevices.every(d => d.kho === targetKho);
  assert(allTransferred, `Cả 4 máy đã chuyển thành công sang [${targetKho}]`);

  const m1 = sampleDevices[0];
  assert(m1.timeline.length > 0 && m1.timeline[0].action === 'Chuyển kho', 'Timeline máy 1 được lưu vết Chuyển kho');
  assert(m1.timeline[0].note.includes(targetKho), `Timeline máy 1 ghi chi tiết đích đến [${targetKho}]`);

  assert(mockElements['transfer-serial'].value === '', 'Ô nhập serial tự động reset sạch sẽ sau khi hoàn tất');
  assert(mockElements['transfer-serial-counter'].textContent === '0 máy', 'Huy hiệu đếm tự động reset về "0 máy"');

} catch (e) {
  console.error('Lỗi khi chạy Test 3:', e);
  failCount++;
}

console.log('\n====================================================');
console.log(`TỔNG KẾT BACKTEST: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ 3 CA NGHIỆP VỤ ĐÃ ĐƯỢC BACKTEST THÀNH CÔNG 100%!');
  process.exit(0);
}
