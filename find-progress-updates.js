const fs = require('fs');
const path = require('path');
const file = fs.readFileSync(path.join(__dirname, 'public', 'js', 'rastreamento.js'), 'utf8');

const lines = file.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('progress-fill') || line.includes('progress-label') || line.includes('.style.width') || line.includes('innerText')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
