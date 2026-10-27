(function () {
  const url = location.href;
  const f = PD.extract(location.origin);   // the model was trained on domains only
  if (!f) return;
  const ml = PD.mlScore(f);
  const h = PD.heuristics(url);
  const d = PD.decide(ml, h.score);

  if (location.hash === '#phishguard-demo') {   // demo hook: shows the warning screen
    PD.showWarning({ level: 'High Risk', score: 0.95, reasons: ['Demo warning', 'Looks like a misspelling of paypal'] });
    return;
  }
  const forceDeep = location.hash === '#phishguard-deep';   // demo hook: always run the page check
  if (d.route === 'immediate' && !forceDeep) {
    PD.showWarning({ level: 'High Risk', score: d.initial, reasons: h.reasons.concat(['The link matches known phishing patterns']) });
    return;
  }

  const check = () => {
    const dom = PD.domAnalyze(document, url);
    const r = PD.fuse(ml, h.score, dom.score, dom.hasSensitive);
    console.log('PhishGuard deep:', { ml: ml.toFixed(3), rules: h.score, dom: dom.score.toFixed(3), fused: r.score.toFixed(3), level: r.level });
    if (r.level !== 'Safe') PD.showWarning({ level: r.level, score: r.score, reasons: h.reasons.concat(dom.reasons) });
    return r.level !== 'Safe';
  };
  const run = () => { if (!check()) setTimeout(check, 2500); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();