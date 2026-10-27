PD.mlScore = function (f) {
  const m = PD.MODEL;
  let z = m.intercept;
  m.features.forEach((n, i) => { z += ((f[n] - m.mean[i]) / (m.scale[i] || 1)) * m.coef[i]; });
  return 1 / (1 + Math.exp(-z));
};