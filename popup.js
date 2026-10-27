document.getElementById('b').onclick = () => {
  const raw = document.getElementById('u').value.trim();
  const url = raw.startsWith('http') ? raw : 'https://' + raw;
  const out = document.getElementById('out');
  out.textContent = '';
  let origin;
  try { origin = new URL(url).origin; } catch (e) { out.textContent = 'Not a valid link'; return; }
  const ml = PD.mlScore(PD.extract(origin));
  const h = PD.heuristics(url);
  const d = PD.decide(ml, h.score);
     out.textContent = 'ML: ' + Math.round(ml * 100) + '/100, Rules: ' + Math.round(h.score * 100) +
     '/100, Combined: ' + Math.round(d.initial * 100) + '/100. ' +
     (d.route === 'immediate' ? 'High risk.' : 'Not clearly phishing.');
  const ul = document.createElement('ul');
  h.reasons.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
  out.appendChild(ul);
};