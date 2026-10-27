const fs = require('fs');
require('../lib/features.js');
const { extract, FEATURE_NAMES } = globalThis.PD;
const NL = String.fromCharCode(10);
const rows = fs.readFileSync(process.argv[2], 'utf8').split(NL).slice(1).filter(Boolean);
const out = [[...FEATURE_NAMES, 'label'].join(',')];
for (const r of rows) {
  const i = r.lastIndexOf(',');
  const url = r.slice(0, i).trim().replace(/^"|"$/g, '');
  const label = r.slice(i + 1).trim();
  const f = extract(url.startsWith('http') ? url : 'http://' + url);
  if (f) out.push([...FEATURE_NAMES.map(n => f[n]), label].join(','));
}
fs.writeFileSync(process.argv[3], out.join(NL));
console.log('wrote', out.length - 1, 'rows');