(function () {
  globalThis.PD = globalThis.PD || {};
  const BRANDS = ['google','paypal','amazon','microsoft','apple','facebook','instagram','netflix','sbi','hdfc','icici','paytm','phonepe','flipkart','linkedin','github'];
  const SUSP_TLD = ['xyz','top','tk','ml','ga','cf','gq','click','link','zip','work','support'];
  const KW = ['login','signin','verify','secure','account','update','confirm','payment','password','wallet','otp','bank'];

  // registered domain: example.com, or example.co.in for two-part endings
  function regDomain(host) {
    const p = host.split('.');
    if (p.length >= 3 && p[p.length - 1].length === 2 && ['co','com','org','net','gov','ac','edu'].includes(p[p.length - 2])) return p.slice(-3).join('.');
    return p.slice(-2).join('.');
  }

  // how many single-letter edits turn word a into word b
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  PD.heuristics = function (url) {
    let u;
    try { u = new URL(url); } catch (e) { return { score: 0, reasons: [] }; }
    const host = u.hostname, reg = regDomain(host), reasons = [];
    let s = 0;
    const add = (w, r) => { s += w; reasons.push(r); };

    if (host.includes('xn--')) add(0.35, 'Domain uses punycode (possible look-alike characters)');
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) add(0.3, 'Uses a raw IP address instead of a domain name');

    const labels = host.split(/[.-]/);
    for (const b of BRANDS) {
      const official = reg.split('.')[0] === b;
      if (!official && labels.includes(b)) { add(0.4, 'Contains the brand name ' + b + ' but the real domain is ' + reg); break; }
      const near = b.length >= 6 ? labels.find(l => l.length > 3 && l !== b && lev(l, b) === 1) : null;
      if (near) { add(0.4, 'Looks like a misspelling of ' + b + ' (' + near + ')'); break; }
    }

    const kws = KW.filter(k => (host + u.pathname).toLowerCase().includes(k));
    if (kws.length) add(Math.min(0.3, 0.1 * kws.length), 'Sensitive words in the link: ' + kws.join(', '));

    const subs = Math.max(0, host.split('.').length - reg.split('.').length);
    if (subs >= 3) add(0.2, 'Too many subdomains (' + subs + ')');

    const tld = host.split('.').pop();
    if (SUSP_TLD.includes(tld)) add(0.15, 'Uses a domain ending often abused for phishing (.' + tld + ')');
    if (u.href.includes('@')) add(0.2, 'Link contains an @ symbol');
    if (u.protocol === 'http:') add(0.1, 'Not using HTTPS');
    if ((host.match(/-/g) || []).length >= 3) add(0.1, 'Many hyphens in the domain');
    if (u.href.length > 100) add(0.1, 'Very long link');

    return { score: Math.min(1, s), reasons };
  };
})();