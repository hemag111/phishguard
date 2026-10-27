(function () {
  globalThis.PD = globalThis.PD || {};
  const KW = ['login','verify','secure','account','update','bank','payment','confirm','signin','password','wallet','otp'];
  const FEATURE_NAMES = ['url_length','host_length','num_dots','num_subdomains','num_hyphens_host','num_digits_url','has_at','has_ip','is_https','path_depth','num_query_params','has_punycode','kw_count','host_entropy','special_chars'];
  const count = (s, chars) => [...s].filter(c => chars.includes(c)).length;
  function entropy(s) {
    const m = {};
    for (const c of s) m[c] = (m[c] || 0) + 1;
    let e = 0;
    for (const k in m) { const p = m[k] / s.length; e -= p * Math.log2(p); }
    return e;
  }
  function extract(raw) {
    let u;
    try { u = new URL(raw); } catch (e) { return null; }
    const host = u.hostname, labels = host.split('.'), low = raw.toLowerCase();
    const isIP = labels.length === 4 && labels.every(p => p !== '' && !isNaN(p));
    return {
      url_length: raw.length, host_length: host.length,
      num_dots: labels.length - 1,
      num_subdomains: isIP ? 0 : Math.max(0, labels.length - 2),
      num_hyphens_host: count(host, '-'),
      num_digits_url: count(raw, '0123456789'),
      has_at: raw.includes('@') ? 1 : 0,
      has_ip: isIP ? 1 : 0,
      is_https: u.protocol === 'https:' ? 1 : 0,
      path_depth: u.pathname.split('/').filter(Boolean).length,
      num_query_params: [...u.searchParams.keys()].length,
      has_punycode: host.includes('xn--') ? 1 : 0,
      kw_count: KW.filter(k => low.includes(k)).length,
      host_entropy: entropy(host),
      special_chars: count(raw, '?&=_%~#')
    };
  }
  Object.assign(PD, { extract, FEATURE_NAMES });
})();