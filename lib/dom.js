globalThis.PD = globalThis.PD || {};
PD.domAnalyze = function (doc, pageUrl) {
  const host = new URL(pageUrl).hostname;
  const reasons = [];
  let s = 0;
  const same = h => h === host || h.endsWith('.' + host) || host.endsWith('.' + h);

  const pw = doc.querySelectorAll(`input[type=password]`).length;
  const pay = doc.querySelectorAll(`input[autocomplete^='cc-'], input[name*='card' i], input[name*='cvv' i], input[name*='otp' i]`).length;
  if (pw) { s += 0.2; reasons.push('Page asks for a password'); }
  if (pay) { s += 0.25; reasons.push('Page asks for card or OTP details'); }

  doc.querySelectorAll('form').forEach(f => {
    if (!pw && !pay) return;
    const a = f.getAttribute('action') || '';
    if (a === '' || a === '#' || a.startsWith('javascript:')) {
      s += 0.1; reasons.push('Sensitive form has an empty or script action'); return;
    }
    try {
      const au = new URL(a, pageUrl);
      if (!same(au.hostname)) { s += 0.3; reasons.push('Form sends data to a different domain: ' + au.hostname); }
      else if (au.protocol === 'http:') { s += 0.1; reasons.push('Form submits over plain HTTP'); }
    } catch (e) {}
  });

  const els = [...doc.querySelectorAll('img[src], script[src], link[href], a[href]')];
  let ext = 0;
  els.forEach(e => {
    try { const h = new URL(e.src || e.href, pageUrl).hostname; if (h && !same(h)) ext++; } catch (x) {}
  });
  if ((pw || pay) && els.length > 5 && ext / els.length > 0.6) {
    s += 0.15; reasons.push('Most page resources load from other domains');
  }
   const hid = [...doc.querySelectorAll('iframe')].filter(i => i.offsetWidth < 10 || i.offsetHeight < 10).length;
  if (hid) { s += 0.15; reasons.push('Page contains hidden iframes'); }

  let mism = 0;
  doc.querySelectorAll('a[href]').forEach(a => {
    const t = (a.textContent || '').trim().toLowerCase();
    const m = t.match(/^(?:https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})(?:[\/?#]|$)/);
    if (!m) return;
    try {
      const h = new URL(a.href, pageUrl).hostname;
      if (h && !same(h) && h !== m[1] && !h.endsWith('.' + m[1]) && !m[1].endsWith('.' + h)) mism++;
    } catch (e) {}
  });
  if (mism) { s += 0.2; reasons.push('A link shows one web address but goes to another'); }

  return { score: Math.min(1, s), reasons, hasSensitive: !!(pw || pay) };
};