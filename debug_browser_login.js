const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'file:///c:/Projects/Quan%20Ly%20Kho%20Thanh%20An/demo_quan_ly_kho.html';
const port = 9222;

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--disable-gpu',
  '--no-sandbox',
  targetUrl
]);

console.log('Chrome process started...');

setTimeout(() => {
  http.get(`http://127.0.0.1:${port}/json`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tabs = JSON.parse(data);
        console.log('Open tabs:', tabs.length);
        const tab = tabs.find(t => t.type === 'page');
        if (!tab) {
          console.error('No page tab found');
          chromeProcess.kill();
          return;
        }

        const WebSocket = require('ws'); // If ws not installed, we can use simple http
        console.log('Tab URL:', tab.url);
        console.log('WebSocket Debugger URL:', tab.webSocketDebuggerUrl);
      } catch(e) {
        console.error('Error parsing tabs:', e.message);
      }
    });
  }).on('error', (err) => {
    console.error('Error connecting to Chrome debugger:', err.message);
    chromeProcess.kill();
  });
}, 2000);

setTimeout(() => {
  try { chromeProcess.kill(); } catch(e){}
  process.exit(0);
}, 6000);
