const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    f = path.join(dir, f);
    if (fs.statSync(f).isDirectory()) results = results.concat(walk(f));
    else if (f.endsWith('.jsx')) results.push(f);
  });
  return results;
}

const files = walk('C:/Users/ADMIN/Downloads/NeedADMIN/Health Care Clinic Query Solution/frontend/src');

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('toISOString().split')) {
    c = c.replace(/\.toISOString\(\)\.split\(['"]T['"]\)\[0\]/g, ".toLocaleDateString('en-CA')");
    fs.writeFileSync(f, c, 'utf8');
    console.log('Fixed timezone in:', f);
  }
});
