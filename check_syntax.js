const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src_demo');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
let errCount = 0;

const vm = require('vm');

files.forEach(f => {
  const filePath = path.join(srcDir, f);
  let code = fs.readFileSync(filePath, 'utf8');
  // Strip opening and closing script tags if present
  code = code.replace(/^\s*<script\b[^>]*>/i, '');
  code = code.replace(/<\/script>\s*<\/body>\s*<\/html>\s*$/i, '');
  code = code.replace(/<\/script>\s*$/i, '');
  try {
    new vm.Script(code, { filename: f });
    console.log('OK:', f);
  } catch(e) {
    console.error('SYNTAX ERROR in', f, ':', e.stack || e.message);
    errCount++;
  }
});

// Check scripts inside demo_quan_ly_kho.html
try {
  const html = fs.readFileSync(path.join(__dirname, 'demo_quan_ly_kho.html'), 'utf8');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let sIdx = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    sIdx++;
    const sContent = match[1];
    if (sContent && sContent.trim().length > 0) {
      try {
        new Function(sContent);
        console.log(`Script tag #${sIdx}: OK`);
      } catch(e) {
        console.error(`SYNTAX ERROR in Script tag #${sIdx}:`, e.message);
        errCount++;
      }
    }
  }
} catch(e) {
  console.error('Error checking html:', e.message);
}

// Check scripts inside gas/Index.html
try {
  const html = fs.readFileSync(path.join(__dirname, 'gas', 'Index.html'), 'utf8');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let sIdx = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    sIdx++;
    const sContent = match[1];
    if (sContent && sContent.trim().length > 0) {
      try {
        new Function(sContent);
        console.log(`gas/Index Script tag #${sIdx}: OK`);
      } catch(e) {
        console.error(`SYNTAX ERROR in gas/Index Script tag #${sIdx}:`, e.message);
        errCount++;
      }
    }
  }
} catch(e) {
  console.error('Error checking gas/Index html:', e.message);
}

console.log('Finished check. Total errors:', errCount);
