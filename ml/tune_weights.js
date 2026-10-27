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
  return { y: Number(r.slice(i + 1)), ml: PD.mlScore(f), h: PD.heuristics(url).score };
}).filter(Boolean);

const totalPhish = rows.filter(r => r.y === 1).length;
console.log('ml-weight  threshold  precision  recall');
for (let k = 5; k <= 10; k++) {
  const w = k / 10;
  let best = null;
  for (let t = 30; t <= 99; t++) {
    const flagged = rows.filter(r => w * r.ml + (1 - w) * r.h >= t / 100);
    if (!flagged.length) continue;
    const tp = flagged.filter(r => r.y === 1).length;
    const prec = tp / flagged.length, rec = tp / totalPhish;
    if (prec >= 0.99 && (!best || rec > best.rec)) best = { t: t / 100, prec, rec };
  }
  console.log(
    w.toFixed(1).padEnd(10),
    best ? best.t.toFixed(2).padEnd(10) + best.prec.toFixed(3).padEnd(10) + best.rec.toFixed(3) : 'no threshold reaches 0.99 precision'
  );
}