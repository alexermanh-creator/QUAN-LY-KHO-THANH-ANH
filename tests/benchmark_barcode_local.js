const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = 8992;

const img1 = fs.readFileSync('tests/fixtures/sample_images/sample_1_VNM1908585.png').toString('base64');
const img2 = fs.readFileSync('tests/fixtures/sample_images/sample_2_VNM1908583.png').toString('base64');
const img3 = fs.readFileSync('tests/fixtures/sample_images/sample_3_VNM1908452.png').toString('base64');
const html5QrJs = fs.readFileSync('tests/html5-qrcode.min.js', 'utf8');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Fine Slice Barcode Benchmark</title>
  <script src="/html5-qrcode.min.js"></script>
</head>
<body>
  <div id="html5-qr-reader" style="display:none;"></div>
  <script>
    async function sendLog(msg) {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg })
      }).catch(() => {});
    }

    const testImages = [
      { name: 'sample_1_VNM1908585', b64: '${img1}', expected: 'VNM1908585' },
      { name: 'sample_2_VNM1908583', b64: '${img2}', expected: 'VNM1908583' },
      { name: 'sample_3_VNM1908452', b64: '${img3}', expected: 'VNM1908452' }
    ];

    function loadImage(b64) {
      return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    function canvasToFile(canvas) {
      return new Promise(res => {
        canvas.toBlob(blob => {
          if (!blob) return res(null);
          const file = new File([blob], 'slice.jpg', { type: 'image/jpeg' });
          res(file);
        }, 'image/jpeg', 0.95);
      });
    }

    async function runBenchmark() {
      await sendLog('=== KIỂM TRA PHÂN ĐOẠN CHI TIẾT (FINE-GRAINED SLICES) ===\\n');
      const scanner = new Html5Qrcode('html5-qr-reader', { verbose: false });

      // Cắt 10 dải ngang gối đầu (overlapping slices: mỗi dải cao 20% chiều cao ảnh, bước nhảy 8%)
      const slices = [];
      for (let y = 0; y <= 80; y += 8) {
        slices.push({ yPercent: y, hPercent: 20 });
      }

      for (let i = 0; i < testImages.length; i++) {
        const item = testImages[i];
        await sendLog('--------------------------------------------------');
        await sendLog('ẢNH ' + (i+1) + ': ' + item.name + ' (Kỳ vọng: ' + item.expected + ')');
        const img = await loadImage(item.b64);

        const foundCodes = [];

        for (const s of slices) {
          const sy = Math.round((s.yPercent / 100) * img.height);
          const sh = Math.round((s.hPercent / 100) * img.height);

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = sh;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, sy, img.width, sh, 0, 0, img.width, sh);

          const file = await canvasToFile(canvas);
          const code = await scanner.scanFile(file, false).catch(() => null);
          if (code && !foundCodes.some(c => c.code === code)) {
            foundCodes.push({ code, slice: s.yPercent + '% - ' + (s.yPercent + s.hPercent) + '%' });
          }
        }

        await sendLog('-> Tìm thấy ' + foundCodes.length + ' mã vạch qua các lát cắt:');
        foundCodes.forEach(f => {
          const isTarget = f.code.includes(item.expected) || item.expected.includes(f.code);
          sendLog('   [' + f.slice + '] code: "' + f.code + '"' + (isTarget ? ' <=== KHỚP SERIAL!' : ''));
        });

        if (foundCodes.length === 0) {
          await sendLog('   (Không có mã vạch nào được thư viện Barcode đọc được)');
        }
      }

      await sendLog('\\n=== BENCHMARK HOÀN TẤT ===');
      await fetch('/api/done', { method: 'POST' }).catch(() => {});
    }

    window.onload = runBenchmark;
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
  } else if (req.url === '/html5-qrcode.min.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    res.end(html5QrJs);
  } else if (req.url === '/api/log' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log(data.msg);
      } catch(e) {}
      res.writeHead(200);
      res.end('OK');
    });
  } else if (req.url === '/api/done' && req.method === 'POST') {
    res.writeHead(200);
    res.end('OK');
    setTimeout(() => {
      if (chromeProc) chromeProc.kill();
      server.close();
      process.exit(0);
    }, 500);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

let chromeProc = null;
server.listen(PORT, () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  chromeProc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-crash-reporter',
    `http://localhost:${PORT}/index.html`
  ]);

  chromeProc.on('error', err => {
    console.error('Lỗi khởi động Chrome:', err);
    server.close();
    process.exit(1);
  });
});
