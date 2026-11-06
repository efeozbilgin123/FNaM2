// Mırık'la 5 Gece: MORG — saf oyun mantığı (DOM yok, ses yok). Tarayıcıda window.Core, Node'da require.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(this, function () {
  'use strict';

  const PARAMS = {
    NIGHT_SEC: 300,
    SUBSTEP: 0.05,
    POWER_BASE: 0.08,
    POWER_DEV: { doorL: .16, lightL: .10, flash: .12, ventLight: .10, monitor: .06, cooling: .14 },
    POWER_NIGHT_MUL: 0.04,
    POWEROUT_DEATH: [10, 20],
  };

  const CAMS = ['corr', 'autopsy', 'cold', 'ventA', 'ventB', 'archive', 'lift'];
  const CHARS = ['pasta', 'avukat', 'sahil', 'sayici', 'muh', 'arda', 'sultan', 'denek5'];

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function createGame(opts) {
    const night = opts.night;
    const seed = opts.seed != null ? opts.seed : Math.floor(Math.random() * 2 ** 31);
    const lv = {};
    for (const c of CHARS) lv[c] = Math.max(0, Math.min(20, (opts.levels && opts.levels[c]) | 0));
    const G = {
      night, seed, t: 0, power: 100, over: false, result: null, rng: mulberry32(seed), lv,
      dev: { doorL: false, lightL: false, flash: false, ventLight: false, monitor: false, cooling: false, sheet: false, cam: null, reboot: null, camBlind: false },
      dark: false, darkT: 0,
      pending: { sheet: false, door: false },
      _ev: null,
    };
    for (const k of Object.keys(INIT)) G[k] = INIT[k](G, opts);
    return G;
  }

  // Karakter başlangıç durumları ve tick fonksiyonları sonraki task'larda eklenir.
  const INIT = {};
  const TICKS = [];

  function roll(G, lv) { return lv > 0 && G.rng() * 20 < lv; }
  function emit(G, ev) { G._ev.push(ev); }

  function mul(G) { return 1 + PARAMS.POWER_NIGHT_MUL * (G.night - 1); }

  function usage(G) {
    if (G.dark) return 0;
    let u = PARAMS.POWER_BASE;
    for (const k in PARAMS.POWER_DEV) if (G.dev[k]) u += PARAMS.POWER_DEV[k];
    return u * mul(G) + (G.extraDrain || 0);
  }

  function applyInput(G, inp) {
    const d = G.dev;
    if (G.dark) {
      Object.assign(d, { doorL: false, lightL: false, flash: false, ventLight: false, monitor: false, cooling: false, sheet: !!inp.sheet, cam: null, reboot: null });
      return;
    }
    d.sheet = !!inp.sheet;
    d.doorL = !!inp.doorL;
    const free = !d.sheet;
    d.lightL = free && !!inp.lightL;
    d.flash = free && !!inp.flash;
    d.ventLight = free && !!inp.ventLight;
    d.monitor = free && !!inp.monitor;
    d.cooling = d.monitor && !!inp.cooling;
    d.cam = d.monitor && CAMS.includes(inp.cam) ? inp.cam : null;
    d.reboot = d.monitor && CAMS.includes(inp.reboot) ? inp.reboot : null;
  }

  function die(G, who) {
    if (G.over) return;
    G.over = true; G.result = 'death'; G.killer = who;
    emit(G, { type: 'death', who });
  }
  function win(G) {
    if (G.over) return;
    G.over = true; G.result = 'win';
    emit(G, { type: 'win' });
  }

  function sub(G, dt, inp) {
    applyInput(G, inp);
    G.extraDrain = 0;
    for (const f of TICKS) { if (G.over) return; f(G, dt, inp); }
    if (G.over) return;
    if (!G.dark) {
      G.power -= usage(G) * dt;
      if (G.power <= 0) {
        G.power = 0; G.dark = true;
        const [a, b] = PARAMS.POWEROUT_DEATH;
        G.darkT = a + G.rng() * (b - a);
        applyInput(G, inp);
        emit(G, { type: 'powerout' });
      }
    } else {
      G.darkT -= dt;
    }
    G.t += dt;
    if (G.t >= PARAMS.NIGHT_SEC) { win(G); return; }
    if (G.dark && G.darkT <= 0) die(G, 'powerout');
  }

  function step(G, dt, inp) {
    if (G.over) return [];
    G._ev = [];
    let left = dt;
    while (left > 1e-12 && !G.over) {
      const h = Math.min(PARAMS.SUBSTEP, left);
      sub(G, h, inp || {});
      left -= h;
    }
    const out = G._ev; G._ev = null;
    return out;
  }

  return { PARAMS, CAMS, CHARS, createGame, step, usage, _internal: { INIT, TICKS, roll, emit, die, mul } };
});
