// Mırık'la 5 Gece: MORG — ilerleme kaydı (localStorage, bozulmaya dayanıklı)
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Save = factory();
})(this, function () {
  'use strict';
  const KEY = 'm5g_morg';
  const def = () => ({ maxNight: 1, docs: [], itsme: [], custom2020: false });
  const strArr = a => Array.isArray(a) && a.every(x => typeof x === 'string');

  function store(s) {
    if (s) return s;
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; }
  }
  function load(s) {
    try {
      const st = store(s); if (!st) return def();
      const raw = st.getItem(KEY); if (!raw) return def();
      const p = JSON.parse(raw);
      if (!p || !Number.isInteger(p.maxNight) || p.maxNight < 1 || p.maxNight > 7 || !strArr(p.docs) || !strArr(p.itsme) || typeof p.custom2020 !== 'boolean') return def();
      return { maxNight: p.maxNight, docs: p.docs, itsme: p.itsme, custom2020: p.custom2020 };
    } catch (e) { return def(); }
  }
  function save(p, s) {
    try { const st = store(s); if (st) st.setItem(KEY, JSON.stringify(p)); } catch (e) { /* kayıt yapılamadı, oyun devam eder */ }
  }
  const add = (arr, x) => (x && !arr.includes(x) ? [...arr, x] : arr);
  // r: { night, result: 'win'|'death'|'itsme', levels?, itsme?, doc? }
  function unlock(p, r) {
    const q = { ...p, docs: add(p.docs, r.doc), itsme: r.result === 'itsme' || r.itsmeSeen ? add(p.itsme, r.itsme) : p.itsme };
    if (r.result === 'win') {
      if (r.night <= 6) q.maxNight = Math.max(q.maxNight, Math.min(7, r.night + 1));
      if (r.night === 7 && r.levels && Object.values(r.levels).every(v => v === 20)) q.custom2020 = true;
    }
    return q;
  }
  return { KEY, load, save, unlock, defaults: def };
});
