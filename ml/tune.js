const fs = require('fs');
require('../lib/features.js');
require('../lib/heuristics.js');
require('../model/model.js');
require('../lib/ml.js');
const NL = String.fromCharCode(10);
const rows = fs.readFileSync('test_urls.csv', 'utf8').split(NL).slice(1).filter(Boolean).map(r => {
  const i = r.lastIndexOf(',');
  const raw = r.slice(0, i).trim().replace(/^"|"$/g, '');
  const url = raw.startsWith('http') ? raw : 'http://' + raw;
  const f = PD.extract(url);
  if (!f) return null;
  return { y: Number(r.slice(i + 1)), s: 0.6 * PD.mlScore(f) + 0.4 * PD.heuristics(url).score };
}).filter(Boolean);

const totalPhish = rows.filter(r => r.y === 1).length;
const totalLegit = rows.length - totalPhish;
console.log('threshold  precision  recall  legit-flagged');
for (let t = 0.3; t <= 0.96; t += 0.05) {
  const flagged = rows.filter(r => r.s >= t);
  const tp = flagged.filter(r => r.y === 1).length;
  const fp = flagged.length - tp;
  console.log(
    t.toFixed(2).padEnd(10),
    (tp / (flagged.length || 1)).toFixed(3).padEnd(10),
    (tp / totalPhish).toFixed(3).padEnd(7),
    fp + ' of ' + totalLegit
  );
}