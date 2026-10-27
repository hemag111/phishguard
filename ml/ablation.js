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

const nPhish = rows.filter(r => r.y === 1).length;
const configs = {
  'Rules only': r => r.h,
  'ML only': r => r.ml,
  'ML + rules (0.8/0.2)': r => 0.8 * r.ml + 0.2 * r.h
};
console.log('Configuration'.padEnd(22), 'threshold  precision  recall  F1     false alarms');
for (const [name, fn] of Object.entries(configs)) {
  let best = null;
  for (let t = 1; t <= 100; t++) {
    const th = t / 100;
    const fl = rows.filter(r => fn(r) >= th);
    if (!fl.length) continue;
    const tp = fl.filter(r => r.y === 1).length;
    const prec = tp / fl.length, rec = tp / nPhish;
    if (prec >= 0.99 && (!best || rec > best.rec)) best = { th, prec, rec, fp: fl.length - tp };
  }
  if (!best) { console.log(name.padEnd(22), 'no threshold reaches 0.99 precision'); continue; }
  const f1 = 2 * best.prec * best.rec / (best.prec + best.rec);
  console.log(name.padEnd(22), best.th.toFixed(2).padEnd(10), best.prec.toFixed(3).padEnd(10),
    best.rec.toFixed(3).padEnd(7), f1.toFixed(3).padEnd(6), best.fp);
}