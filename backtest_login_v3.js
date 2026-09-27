/**
 * BACKTEST ĐĂNG NHẬP V3 - SỬA MỌI LỖI MOCK VÀ CHẨN ĐOÁN CHÍNH XÁC
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
console.log(`📦 Script chính: ${mainScript.length} chars`);

// Syntax check
try { new Function(mainScript); console.log('✅ Syntax OK'); } 
catch (e) { console.error('❌ Syntax ERROR:', e.message); process.exit(1); }

// DOM mock
const mockElements = {};
function createEl(id) {
  return {
    id, value: '', textContent: '', innerText: '', innerHTML: '',
    disabled: false, style: { display: '', opacity: '' }, className: '',
    classList: {
      _c: new Set(),
      add(c) { this._c.add(c); }, remove(c) { this._c.delete(c); },
      contains(c) { return this._c.has(c); }, toggle(c) { this._c.has(c) ? this._c.delete(c) : this._c.add(c); }
    },
    addEventListener: function() {}, removeEventListener: function() {},
    focus: function() {}, select: function() {}, click: function() {},
    closest: function() { return null; },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    getAttribute: function() { return null; }, setAttribute: function() {},
    removeAttribute: function() {},
    offsetWidth: 100, offsetHeight: 50, scrollTop: 0, scrollHeight: 1000,
    parentElement: null, children: [], childNodes: [],
    appendChild: function() {}, removeChild: function() {},
    insertBefore: function() {},
    getBoundingClientRect: function() { return { top: 0, left: 0, width: 100, height: 50 }; },
    cloneNode: function() { return createEl(id + '_clone'); },
    dataset: {}
  };
}

['screen-login-username', 'screen-login-password', 'modal-login-username', 'modal-login-password',
 'login-screen-error-msg', 'login-screen-error-text', 'login-error-msg', 
 'btn-submit-screen-login', 'btn-submit-login', 'app-login-screen', 'loginModal',
 'currentRoleLabel', 'currentRoleBadge', 'dropdown-user-name', 'dropdown-user-role',
 'topbar-menu-changepass', 'sidebar-nav-caidat', 'tab-ls-audit-btn', 'tab-ls-audit',
 'btn-submit-stock-adj', 'btn-close-inventory-session', 'form-screen-login',
 'cfg-gemini-model-custom', 'history-audit-table-body'
].forEach(id => { mockElements[id] = createEl(id); });

mockElements['screen-login-username'].value = 'admin';
mockElements['screen-login-password'].value = '123456';

const gasCallLog = [];
const runtimeErrors = [];
let domContentLoadedHandlers = [];

const mockGSR = {
  _sh: null, _fh: null,
  withSuccessHandler(h) { this._sh = h; return this; },
  withFailureHandler(h) { this._fh = h; return this; }
};

['authenticateUser', 'getInitAppData', 'getAllVouchersBackend', 'confirmNhapKho', 'confirmXuatKho',
 'cancelVoucher', 'addProductBackend', 'editProductBackend', 'deleteProductBackend',
 'addSupplierBackend', 'editSupplierBackend', 'deleteSupplierBackend',
 'addCustomerBackend', 'editCustomerBackend', 'deleteCustomerBackend',
 'addWarehouseBackend', 'editWarehouseBackend', 'deleteWarehouseBackend',
 'verifyAdminPassword', 'getStockPage', 'editSerialBackend',
 'createSystemBackup', 'listSystemBackups', 'changePassword',
 'createWarrantyCase', 'getGeminiConfig', 'saveGeminiConfig', 'saveClientAuditLog'
].forEach(fn => {
  mockGSR[fn] = function(...args) {
    gasCallLog.push({ fn, args });
    const handler = this._sh;
    if (handler) {
      setTimeout(() => {
        try {
          if (fn === 'authenticateUser') {
            handler({ success: true, user: { username: args[0], name: 'Admin Test', role: 'ADMIN', status: 'Hoạt động' }, sessionToken: 'SES-TEST-' + Date.now() });
          } else if (fn === 'getAllVouchersBackend') {
            handler({ nhap: [], xuat: [], serials: [] });
          } else {
            handler({ success: true });
          }
        } catch(callbackErr) {
          console.error('  ❌ [CALLBACK ERROR]', fn, ':', callbackErr.message);
          runtimeErrors.push('CALLBACK ' + fn + ': ' + callbackErr.message);
        }
      }, 100);
    }
    this._sh = null; this._fh = null;
  };
});

const ctx = vm.createContext({
  window: {},
  document: {
    getElementById(id) { if (!mockElements[id]) mockElements[id] = createEl(id); return mockElements[id]; },
    querySelector(s) { return createEl('qs_' + s); },
    querySelectorAll() { return []; },
    createElement(t) { return createEl('new_' + t); },
    createTextNode(t) { return { textContent: t }; },
    addEventListener(ev, fn) { if (ev === 'DOMContentLoaded') domContentLoadedHandlers.push(fn); },
    body: createEl('body'), head: createEl('head'), documentElement: createEl('html'),
    readyState: 'loading'
  },
  google: { script: { run: new Proxy(mockGSR, {
    get(t, p) {
      if (['withSuccessHandler', 'withFailureHandler', '_sh', '_fh'].includes(p)) return typeof t[p] === 'function' ? t[p].bind(t) : t[p];
      if (typeof t[p] === 'function') return t[p].bind(t);
      return function(...a) { gasCallLog.push({fn:p,args:a}); if(t._sh) { const h=t._sh; setTimeout(()=>{try{h({success:true});}catch(e){runtimeErrors.push('CALLBACK ' + String(p) + ': ' + e.message);}},100); } t._sh=null;t._fh=null; };
    }
  }) } },
  bootstrap: {
    Modal: { getOrCreateInstance(e) { return { show(){}, hide(){} }; }, getInstance(e) { return { show(){}, hide(){}, _isShown: false }; } },
    Tab: { getInstance(e) { return null; } }, Collapse: { getOrCreateInstance() { return { show(){}, hide(){} }; } }
  },
  Chart: function(c, cfg) { this.destroy=function(){}; this.update=function(){}; this.data=cfg?cfg.data:{}; },
  Swal: {
    fire(o) { console.log('  [Swal] ' + JSON.stringify(o).substring(0,120)); return Promise.resolve({isConfirmed:true,value:true}); },
    showLoading(){}, close(){}, getPopup(){ return createEl('swal'); }, isVisible(){ return false; }
  },
  JsBarcode: function() {},
  Tesseract: { createWorker() { return { load(){}, loadLanguage(){}, initialize(){}, recognize(){} }; } },
  console: {
    log(...a) { /* silent */ },
    warn(...a) { console.warn('  [VM WARN]', ...a); },
    error(...a) { console.error('  [VM ERROR]', ...a); runtimeErrors.push(a.join(' ')); },
    info() {}, debug() {}
  },
  setTimeout, setInterval(fn,ms) { return 999; }, clearInterval() {}, clearTimeout,
  Promise, JSON, Date, Math, Object, Array, String, Number, Boolean, RegExp, Map, Set,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  atob(s) { return Buffer.from(s,'base64').toString(); },
  btoa(s) { return Buffer.from(s).toString('base64'); },
  alert(m) { console.log('  [ALERT]', m); }, confirm() { return true; }, prompt() { return ''; },
  navigator: { userAgent: 'Mozilla/5.0', clipboard: { writeText(t) { return Promise.resolve(); } }, vibrate(){}, mediaDevices: { getUserMedia() { return Promise.reject(new Error('no')); } } },
  location: { href: 'https://script.google.com/macros/s/test/exec', hostname: 'script.google.com', search: '', hash: '' },
  localStorage: { _d: {}, getItem(k) { return this._d[k]||null; }, setItem(k,v) { this._d[k]=String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d={}; } },
  sessionStorage: { _d: {}, getItem(k) { return this._d[k]||null; }, setItem(k,v) { this._d[k]=String(v); }, removeItem(k) { delete this._d[k]; }, clear() { this._d={}; } },
  fetch() { return Promise.resolve({ ok: true, json() { return Promise.resolve({}); }, text() { return Promise.resolve(''); } }); },
  URL, Blob: function(p,o) { this.size=0; this.type=(o&&o.type)||''; },
  FileReader: function() { this.readAsDataURL=function(){}; this.readAsText=function(){}; },
  Image: function() { this.onload=null; this.onerror=null; this.src=''; },
  requestAnimationFrame(fn) { return setTimeout(fn, 16); }, cancelAnimationFrame: clearTimeout,
  ResizeObserver: function() { this.observe=function(){}; this.unobserve=function(){}; this.disconnect=function(){}; },
  IntersectionObserver: function() { this.observe=function(){}; this.unobserve=function(){}; this.disconnect=function(){}; },
  MutationObserver: function() { this.observe=function(){}; this.disconnect=function(){}; },
  performance: { now() { return Date.now(); } },
  screen: { width: 1920, height: 1080 }, innerWidth: 1920, innerHeight: 1080, devicePixelRatio: 1,
  matchMedia() { return { matches: false, addListener(){}, addEventListener(){} }; }
});

ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
ctx.addEventListener = function(ev, fn) {
  if (ev === 'DOMContentLoaded') domContentLoadedHandlers.push(fn);
};
ctx.removeEventListener = function() {};
ctx.dispatchEvent = function() {};

console.log('\n🚀 Thực thi script...');
let execError = null;
try {
  const script = new vm.Script(mainScript, { filename: 'gas_Index.js', timeout: 15000 });
  script.runInContext(ctx, { timeout: 15000 });
  console.log('✅ Script thực thi THÀNH CÔNG');
} catch (err) {
  execError = err;
  console.error('❌ RUNTIME ERROR:', err.message);
  const stk = err.stack.split('\n');
  stk.forEach(l => {
    const m = l.match(/gas_Index\.js:(\d+):(\d+)/);
    if (m) {
      const ln = parseInt(m[1]);
      const lines = mainScript.split('\n');
      console.log('   📍 Dòng ' + ln + ': ' + (lines[ln-1]||'').substring(0,200));
    }
  });
}

console.log('\n📊 Kiểm tra hàm:');
console.log('  handleSystemLogin:    ' + typeof ctx.window.handleSystemLogin);
console.log('  checkAuthOnStartup:   ' + typeof ctx.window.checkAuthOnStartup);
console.log('  WarehouseAPI:         ' + typeof ctx.WarehouseAPI);
if (typeof ctx.WarehouseAPI === 'object') console.log('  isAppsScript():       ' + ctx.WarehouseAPI.isAppsScriptEnvironment());
console.log('  renderAuditTable:     ' + typeof ctx.renderAuditTable);

if (typeof ctx.window.handleSystemLogin === 'function') {
  console.log('\n🔑 Gọi handleSystemLogin("screen")...');
  try {
    ctx.window.handleSystemLogin('screen');
    console.log('✅ handleSystemLogin chạy OK');
  } catch (e) {
    console.error('❌ handleSystemLogin THROW:', e.message);
  }
  
  setTimeout(() => {
    console.log('\n--- Kết quả sau 1.5s ---');
    console.log('CURRENT_ROLE: ' + (ctx.CURRENT_ROLE || ctx.window.CURRENT_ROLE || 'undefined'));
    console.log('CURRENT_USER_NAME: ' + (ctx.CURRENT_USER_NAME || ctx.window.CURRENT_USER_NAME || 'undefined'));
    console.log('app-login-screen display: ' + mockElements['app-login-screen'].style.display);
    console.log('GAS calls: ' + gasCallLog.length);
    gasCallLog.forEach((c,i) => console.log('  ' + (i+1) + '. ' + c.fn + '(' + JSON.stringify(c.args).substring(0,80) + ')'));
    
    console.log('\n' + '='.repeat(60));
    if (runtimeErrors.length > 0) {
      console.log('⚠️ RUNTIME ERRORS TRONG LUỒNG ĐĂNG NHẬP:');
      runtimeErrors.forEach((e,i) => console.log('  ' + (i+1) + '. ' + e));
      console.log('\n📋 KẾT LUẬN: Hàm handleSystemLogin gọi được nhưng callback bị lỗi.');
      console.log('   Người dùng thấy: Nút chuyển "Đang đăng nhập..." rồi ĐỨNG YÊN.');
    } else if ((ctx.CURRENT_ROLE || ctx.window.CURRENT_ROLE) === 'ADMIN') {
      console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!');
      console.log('   Logic code OK. Vấn đề có thể do deployment/cache/network.');
    } else {
      console.log('❌ ĐĂNG NHẬP THẤT BẠI');
    }
    console.log('='.repeat(60));
  }, 1500);
} else {
  console.log('\n❌ handleSystemLogin KHÔNG TỒN TẠI!');
  if (execError) console.log('   Do runtime error: ' + execError.message);
}
