const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('demo_quan_ly_kho.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let combinedCode = '';
while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1];
  if (content && content.trim().length > 0) {
    combinedCode += content + '\n';
  }
}

console.log('Total extracted JS code length:', combinedCode.length);

const mockWindow = {
  addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') fn(); },
  removeEventListener: () => {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { href: 'http://localhost' },
  document: {
    getElementById: (id) => ({ 
      innerHTML: '', 
      style: {}, 
      classList: { add: ()=>{}, remove: ()=>{} }, 
      appendChild: ()=>{}, 
      addEventListener: ()=>{} 
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ 
      innerHTML: '', 
      style: {}, 
      classList: { add: ()=>{}, remove: ()=>{} }, 
      appendChild: ()=>{} 
    }),
    addEventListener: () => {},
    body: { classList: { add: ()=>{}, remove: ()=>{} } }
  },
  console: console,
  setTimeout: (fn) => {},
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {}
};
mockWindow.window = mockWindow;
mockWindow.document.defaultView = mockWindow;

try {
  vm.createContext(mockWindow);
  vm.runInContext(combinedCode, mockWindow);
  console.log('SUCCESS: Script parsed and evaluated with 0 syntax or initialization errors!');
  
  if (typeof mockWindow.switchTab === 'function') {
    mockWindow.switchTab('Dashboard');
    console.log('SUCCESS: switchTab("Dashboard") executed smoothly!');
    mockWindow.switchTab('NhapKho');
    console.log('SUCCESS: switchTab("NhapKho") executed smoothly!');
    mockWindow.switchTab('XuatKho');
    console.log('SUCCESS: switchTab("XuatKho") executed smoothly!');
  } else {
    console.warn('WARNING: switchTab function not found on window');
  }
} catch (e) {
  console.error('ERROR during runtime execution:', e);
}
