require('../lib/features.js'); require('../lib/heuristics.js');
require('../model/model.js'); require('../lib/ml.js'); require('../lib/decision.js');
process.argv.slice(2).forEach(u => {
  const ml = PD.mlScore(PD.extract(new URL(u).origin));
  const h = PD.heuristics(u).score;
  const d = PD.decide(ml, h);
  console.log(u.padEnd(42), 'ML', ml.toFixed(2), 'rules', h.toFixed(2), 'initial', d.initial.toFixed(2), d.route);
});