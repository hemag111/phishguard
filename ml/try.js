require('../lib/features.js');
require('../model/model.js');
require('../lib/ml.js');
process.argv.slice(2).forEach(u => console.log(u, PD.mlScore(PD.extract(u)).toFixed(3)));