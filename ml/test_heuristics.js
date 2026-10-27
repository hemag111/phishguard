require('../lib/features.js');
require('../lib/heuristics.js');
process.argv.slice(2).forEach(u => console.log(u, JSON.stringify(PD.heuristics(u), null, 1)));