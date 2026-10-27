globalThis.PD = globalThis.PD || {};
PD.fuse = function (ml, h, dom, hasSensitive) {
  const score = 0.4 * ml + 0.25 * h + 0.35 * dom;
  let level = score >= 0.65 ? 'High Risk' : score >= 0.35 ? 'Suspicious' : 'Safe';
  if (hasSensitive && dom >= 0.6 && level === 'Safe') level = 'Suspicious';
  if (!hasSensitive) level = 'Safe';   // nothing to steal on this page, so no warning
  return { score, level };
};