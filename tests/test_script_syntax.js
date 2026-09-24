const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const html = fs.readFileSync('gas/Index.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let index = 0;
let hasError = false;

while ((match = scriptRegex.exec(html)) !== null) {
  index++;
  const code = match[1];
  if (!code.trim()) continue;
  const tempPath = path.join(__dirname, `temp_script_${index}.js`);
  fs.writeFileSync(tempPath, code, 'utf8');
  try {
    execSync(`"${process.execPath}" --check "${tempPath}"`);
    console.log(`Script block ${index}: OK`);
  } catch (err) {
    console.error(`Script block ${index}: ERROR!`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    hasError = true;
  } finally {
    try { fs.unlinkSync(tempPath); } catch (e) {}
  }
}

if (!hasError) {
  console.log(`ALL SCRIPT BLOCKS SYNTAX CHECK PASSED!`);
}
