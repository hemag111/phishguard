const fs = require('fs');
require('../lib/features.js');
require('../lib/heuristics.js');
const NL = String.fromCharCode(10);
const rows = fs.readFileSync('test_urls.csv', 'utf8').split(NL).slice(1).filter(Boolean);
const stats = { 0: { n: 0, flagged: 0 }, 1: { n: 0, flagged: 0 } };
for (const r of rows) {
  const i = r.lastIndexOf(',');
  const url = r.slice(0, i).trim().replace(/^"|"$/g, '');
  const label = Number(r.slice(i + 1));
  const s = PD.heuristics(url).score;
  stats[label].n++;
  if (s >= 0.4) stats[label].flagged++;
}
console.log('legitimate flagged:', stats[0].flagged, 'of', stats[0].n);
console.log('phishing flagged:', stats[1].flagged, 'of', stats[1].n);