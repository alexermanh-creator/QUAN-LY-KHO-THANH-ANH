const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('gas/Index.html', 'utf8');
const lines = html.split('\n');

let inScript9 = false;
let s9Lines = [];
lines.forEach((l, i) => {
  if (i + 1 === 5116) inScript9 = true;
  if (inScript9) {
    s9Lines.push(l);
    if (l.includes('</script>')) inScript9 = false;
  }
});

const ctx = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  location: { reload: () => {}, search: '', hash: '' },
  navigator: { userAgent: 'Chrome' },
  addEventListener: () => {},
  removeEventListener: () => {},
  document: {
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: (id) => ({
      value: id.includes('password') ? '123456' : 'admin',
      textContent: '',
      innerHTML: '',
      classList: { add: ()=>{}, remove: ()=>{} },
      style: {},
      querySelectorAll: ()=>[],
      addEventListener: () => {},
      removeEventListener: () => {}
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ style: {}, classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} }),
    body: { appendChild: ()=>{} }
  }
};
ctx.window = ctx;

try {
  let s9Code = s9Lines.join('\n').replace('<script>', '').replace('</script>', '');
  vm.createContext(ctx);
  vm.runInContext(s9Code, ctx);
  console.log('Script 9 executed successfully!');
  console.log('Type of window.handleSystemLogin:', typeof ctx.handleSystemLogin);

  console.log('\nInvoking handleSystemLogin("screen")...');
  ctx.handleSystemLogin('screen');
  console.log('Finished handleSystemLogin call successfully!');
} catch(err) {
  console.error('Error during execution:', err);
}
