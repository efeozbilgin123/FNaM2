// Mırık'la 5 Gece: MORG — saf oyun mantığı (DOM yok, ses yok). Tarayıcıda window.Core, Node'da require.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(this, function () {
  'use strict';

  const PARAMS = {
    NIGHT_SEC: 300,
    SUBSTEP: 0.05,
    POWER_BASE: 0.12,
    POWER_DEV: { doorL: .24, lightL: .15, flash: .18, ventLight: .15, monitor: .09, cooling: .21 },
    POWER_NIGHT_MUL: 0.02,
    POWEROUT_DEATH: [10, 20],
    LIGHT_OUT: 2.2,        // ışık tutulan yerde hareket olunca o ışık bu kadar saniye yanmaz
  };

  const CAMS = ['corr', 'autopsy', 'cold', 'ventA', 'ventB', 'archive', 'lift', 'wash'];
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
      grace: Math.max(0, +opts.grace || 0),   // gecenin başında karakterlerin hareketsiz kaldığı süre (telefon konuşması)
      pending: { sheet: false, door: false },
      lightOut: { flash: 0, lightL: 0, ventLight: 0 },
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
    d.monitor = free && !!inp.monitor;
    const hands = free && !d.monitor; // monitöre bakarken ışık/fener kullanılamaz
    const lo = G.lightOut;
    d.lightL = hands && !!inp.lightL && lo.lightL <= 0;
    d.flash = hands && !!inp.flash && lo.flash <= 0;
    d.ventLight = hands && !!inp.ventLight && lo.ventLight <= 0;
    d.cooling = d.monitor && !!inp.cooling && !(G.muh && G.muh.cam === 'cold');   // soğuk oda kamerası bozukken soğutma kilitli
    d.cam = d.monitor && CAMS.includes(inp.cam) ? inp.cam : null;
    d.reboot = CAMS.includes(inp.reboot) ? inp.reboot : null;   // onarım başladıysa monitör kapalıyken de sürer
  }

  // FNaF tarzı: ışık tutulan yerde biri hareket ederse o ışık bir süre bozulur
  function knockOut(G, light) {
    if (!G.dev[light]) return;
    G.lightOut[light] = PARAMS.LIGHT_OUT; G.dev[light] = false;
    // hareketten ÖNCEKİ durum: ışık titrerken karakter hâlâ eski yerinde görünür, ışık gelince gitmiş olur
    emit(G, { type: 'lightout', light, was: { pasta: G.pasta ? G.pasta.stage : 0, avukat: G.avukat ? G.avukat.at : false, sahil: G.sahil ? G.sahil.stage : 0 } });
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
    for (const k in G.lightOut) if (G.lightOut[k] > 0) G.lightOut[k] -= dt;
    applyInput(G, inp);
    G.extraDrain = 0;
    const calm = G.t < G.grace;
    for (const f of TICKS) { if (G.over) return; if (calm && /^tick/.test(f.name) && f.name !== 'tickDenek5') continue; f(G, dt, inp); }   // 5 numara telefon sırasında da ısınır
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

  // ---------- Pasta Mırık (koridor, fener) ----------
  Object.assign(PARAMS, { PASTA_TICK: 5, PASTA_WINDOW: 5, PASTA_FLASH: 1.5 });
  const PASTA_ROUTE = ['autopsy', 'corr', 'corr', 'end'];
  INIT.pasta = () => ({ stage: 0, tick: 0, window: 0, flashT: 0 });
  TICKS.push(function tickPasta(G, dt) {
    const s = G.pasta;
    if (s.stage === 3) {
      if (G.dev.flash) s.flashT += dt;
      if (s.flashT >= PARAMS.PASTA_FLASH) { knockOut(G, 'flash'); s.stage = 0; s.flashT = 0; s.tick = 0; emit(G, { type: 'move', who: 'pasta', to: PASTA_ROUTE[0], stage: 0 }); emit(G, { type: 'sound', id: 'retreat', from: 'corr' }); return; }
      if (!G.dev.sheet) s.window -= dt; // örtü altındayken seni ölü sanıp bekler
      if (s.window <= 0) die(G, 'pasta');
      return;
    }
    if (G.sultan && G.sultan.phase !== 'none') return; // koridor Sultan'ın
    s.tick += dt;
    if (s.tick < PARAMS.PASTA_TICK) return;
    s.tick = 0;
    if (!roll(G, G.lv.pasta)) return;
    knockOut(G, 'flash');
    s.stage++;
    if (s.stage === 3) { s.window = PARAMS.PASTA_WINDOW; s.flashT = 0; }
    emit(G, { type: 'move', who: 'pasta', to: PASTA_ROUTE[s.stage], stage: s.stage });
    emit(G, { type: 'sound', id: 'step', from: 'corr', stage: s.stage });
  });

  // ---------- Avukat Mırık (sol kapı) ----------
  Object.assign(PARAMS, { AVUKAT_TICK: 5, AVUKAT_ATTACK: 8, AVUKAT_KNOCK: 10, AVUKAT_DRAIN: 0.12, AVUKAT_COOLDOWN: 15 });
  INIT.avukat = () => ({ at: false, t: 0, knock: 0, tick: 0, pos: 'archive', knockSound: 0 });
  TICKS.push(function tickAvukat(G, dt) {
    const s = G.avukat;
    G.pending.door = s.at;   // kapıda bekliyor ya da vuruyor: kapı kapatmak gerçekten gerekli
    if (s.knock > 0) {
      s.knock -= dt; G.extraDrain += PARAMS.AVUKAT_DRAIN;
      s.knockSound -= dt;
      if (s.knockSound <= 0) { s.knockSound = 1.6; emit(G, { type: 'sound', id: 'knock', from: 'door' }); }
      if (s.knock <= 0) { knockOut(G, 'lightL'); s.at = false; s.pos = 'archive'; s.tick = -PARAMS.AVUKAT_COOLDOWN; emit(G, { type: 'move', who: 'avukat', to: 'archive' }); }
      return;
    }
    if (s.at) {
      s.t += dt;
      if (s.t >= PARAMS.AVUKAT_ATTACK) {
        if (G.dev.doorL) { s.knock = PARAMS.AVUKAT_KNOCK; s.knockSound = 0; }
        else die(G, 'avukat');
      }
      return;
    }
    s.tick += dt;
    if (s.tick < PARAMS.AVUKAT_TICK) return;
    s.tick = 0;
    if (!roll(G, G.lv.avukat)) return;
    // asansöre geçerken de aynı ayak sesi: ses 'kapıda' demez, sadece 'hareket etti' der; nerede olduğunu kamera söyler
    if (s.pos === 'archive') { s.pos = 'lift'; emit(G, { type: 'move', who: 'avukat', to: 'lift' }); emit(G, { type: 'sound', id: 'step', from: 'door', far: true }); }
    else { knockOut(G, 'lightL'); s.pos = 'door'; s.at = true; s.t = 0; emit(G, { type: 'move', who: 'avukat', to: 'door' }); emit(G, { type: 'sound', id: 'step', from: 'door' }); }
  });

  // ---------- Sultan Mırık Han (koridor, motor: her şeyi kapat) ----------
  Object.assign(PARAMS, { SULTAN_TICK: 15, SULTAN_APPROACH: 6, SULTAN_HERE: 8, SULTAN_GRACE: 60 });
  INIT.sultan = () => ({ phase: 'none', t: 0, tick: 0 });
  TICKS.push(function tickSultan(G, dt) {
    const s = G.sultan, d = G.dev;
    if (s.phase === 'none') {
      if (G.t < PARAMS.SULTAN_GRACE) return;
      s.tick += dt;
      if (s.tick < PARAMS.SULTAN_TICK) return;
      s.tick = 0;
      if (!roll(G, G.lv.sultan)) return;
      s.phase = 'approach'; s.t = PARAMS.SULTAN_APPROACH;
      if (G.pasta.stage >= 2) { knockOut(G, 'flash'); G.pasta.stage = 1; G.pasta.flashT = 0; emit(G, { type: 'move', who: 'pasta', to: 'corr', stage: 1 }); }
      emit(G, { type: 'phase', who: 'sultan', phase: 'approach' });
      emit(G, { type: 'sound', id: 'motor', from: 'corr' });
      return;
    }
    s.t -= dt;
    if (s.phase === 'approach') {
      if (s.t <= 0) { s.phase = 'here'; s.t = PARAMS.SULTAN_HERE; emit(G, { type: 'phase', who: 'sultan', phase: 'here' }); }
      return;
    }
    if (d.lightL || d.flash || d.ventLight || d.monitor || d.cooling) { die(G, 'sultan'); return; }
    if (s.t <= 0) { s.phase = 'none'; s.tick = 0; emit(G, { type: 'phase', who: 'sultan', phase: 'none' }); }
  });

  // ---------- Sahil Mırık (havalandırma, ölü taklidi) ----------
  // yol: soğuk oda -> yıkama odası -> havalandırma A -> B -> ağız (SAHIL_MOUTH = son durak)
  Object.assign(PARAMS, { SAHIL_TICK: 4.4, SAHIL_ATTACK: 7, SAHIL_HIDE: 5, SAHIL_EARLY: 2, SAHIL_MOUTH: 4, SAHIL_COOLDOWN: 15 });
  const SAHIL_ROUTE = ['cold', 'wash', 'ventA', 'ventB', 'mouth'];
  INIT.sahil = () => ({ stage: 0, t: 0, hide: 0, tick: 0 });
  TICKS.push(function tickSahil(G, dt) {
    const s = G.sahil, sheet = G.dev.sheet;
    if (s.stage === PARAMS.SAHIL_MOUTH) {
      s.t -= dt;
      if (sheet) {
        s.hide += dt;
        if (s.hide >= PARAMS.SAHIL_HIDE) { s.stage = 0; s.hide = 0; s.tick = -PARAMS.SAHIL_COOLDOWN;   // gidince bir süre havalandırma sakin
 emit(G, { type: 'move', who: 'sahil', to: SAHIL_ROUTE[0], stage: 0 }); emit(G, { type: 'sound', id: 'dragAway', from: 'vent' }); }
        return;
      }
      if (s.hide > 0) { s.hide = 0; s.t = Math.min(s.t, PARAMS.SAHIL_EARLY); }
      if (s.t <= 0) die(G, 'sahil');
      return;
    }
    if (G.arda.fake) return;   // Arda taklit yaparken Sahil ilerlemez
    s.tick += dt;
    if (s.tick < PARAMS.SAHIL_TICK) return;
    s.tick = 0;
    if (!roll(G, G.lv.sahil)) return;
    if (s.stage + 1 === PARAMS.SAHIL_MOUTH) knockOut(G, 'ventLight');   // ışık sadece Sahil ağızda belirirken söner
    s.stage++;
    if (s.stage === PARAMS.SAHIL_MOUTH) { s.t = PARAMS.SAHIL_ATTACK; s.hide = 0; }
    emit(G, { type: 'move', who: 'sahil', to: SAHIL_ROUTE[s.stage], stage: s.stage });
    emit(G, { type: 'sound', id: 'drag', from: 'vent' });
  });

  // ---------- Sayıcı Mırık (havalandırma, sadece ses) ----------
  Object.assign(PARAMS, { SAYICI_TICK: 6, SAYICI_GAP: 4 });
  INIT.sayici = () => ({ active: false, count: 0, t: 0, tick: 0 });
  TICKS.push(function tickSayici(G, dt) {
    const s = G.sayici;
    if (s.active) {
      s.t += dt * (G.dev.ventLight ? 2 : 1);
      if (s.t < PARAMS.SAYICI_GAP) return;
      s.t = 0;
      if (s.count === 4) { s.count = 5; emit(G, { type: 'sound', id: 'say5', from: 'vent' }); return; }
      emit(G, { type: 'sound', id: 'say6', from: 'vent' });
      if (!G.dev.sheet) { die(G, 'sayici'); return; }
      s.active = false; s.count = 0; s.tick = 0;
      return;
    }
    s.tick += dt;
    if (s.tick < PARAMS.SAYICI_TICK) return;
    s.tick = 0;
    if (!roll(G, G.lv.sayici)) return;
    s.active = true; s.count = 4; s.t = 0;
    emit(G, { type: 'sound', id: 'say4', from: 'vent' });
  });
  TICKS.push(function pendingSheet(G) { G.pending.sheet = G.sahil.stage === PARAMS.SAHIL_MOUTH || G.sayici.active; });

  // ---------- Denek 5 (soğuk oda) ----------
  Object.assign(PARAMS, { D5_BASE: 0.35, D5_PER_LV: 0.08, D5_COOL: 6, D5_OPEN_DELAY: 4, D5_RATTLE: 70, D5_RATTLE_EVERY: 3 });
  INIT.denek5 = () => ({ temp: 0, open: false, openT: 0, rattleT: 0 });
  TICKS.push(function tickDenek5(G, dt) {
    const s = G.denek5, lv = G.lv.denek5;
    if (s.open) { s.openT -= dt; if (s.openT <= 0) die(G, 'denek5'); return; }
    if (lv > 0) s.temp += (PARAMS.D5_BASE + PARAMS.D5_PER_LV * lv) * dt * (G.muh.cam === 'cold' ? PARAMS.MUH_HEAT : 1);
    if (G.dev.cooling) s.temp -= PARAMS.D5_COOL * dt;
    s.temp = Math.max(0, s.temp);
    if (s.temp >= 100) { s.temp = 100; s.open = true; s.openT = PARAMS.D5_OPEN_DELAY; emit(G, { type: 'sound', id: 'drawer', from: 'cold' }); return; }
    if (s.temp >= PARAMS.D5_RATTLE) {
      s.rattleT -= dt;
      if (s.rattleT <= 0) { s.rattleT = PARAMS.D5_RATTLE_EVERY; emit(G, { type: 'sound', id: 'rattle', from: 'cold' }); }
    } else s.rattleT = 0;
  });

  // ---------- Mühendis Hasan: soğuk oda kamerasını bozar ----------
  // Öldürmez. Bozukken sıcaklık okunmaz, soğutma kilitlenir, 5 numara MUH_HEAT kat hızlı ısınır; onarana kadar sürer.
  Object.assign(PARAMS, { MUH_TICK: 20, MUH_REBOOT: 3, MUH_COOLDOWN: 30, MUH_HEAT: 2 });
  INIT.muh = () => ({ cam: null, age: 0, rebootT: 0, frozenTemp: 0, tick: 0 });
  function hack(G, cam) {
    const m = G.muh; m.cam = cam; m.age = 0; m.rebootT = 0; m.frozenTemp = G.denek5.temp;
    emit2(G, { type: 'hack', cam });
  }
  function emit2(G, ev) { if (G._ev) G._ev.push(ev); }
  TICKS.push(function tickMuh(G, dt) {
    const m = G.muh;
    G.dev.camBlind = G.dev.reboot != null;
    if (m.cam) {
      m.age += dt;
      if (G.dev.reboot === m.cam) {
        m.rebootT += dt;
        if (m.rebootT >= PARAMS.MUH_REBOOT) { const cam = m.cam; m.cam = null; m.rebootT = 0; m.tick = -PARAMS.MUH_COOLDOWN; emit(G, { type: 'unhack', cam }); return; }
      }
      return;
    }
    m.tick += dt;
    if (m.tick < PARAMS.MUH_TICK) return;
    m.tick = 0;
    if (roll(G, G.lv.muh)) hack(G, 'cold');
  });
  // ---------- Arda Baz (Denek 4, taklitçi) ----------
  Object.assign(PARAMS, { ARDA_TICK: 10, ARDA_WINDOW: 6, ARDA_MIYAV: 5.5, ARDA_MAX: 3 });
  const FAKE_SOUNDS = {
    sahil: [[0, 'drag'], [2.6, 'drag']],
    sayici: [[0, 'say4'], [4, 'say5']],
    avukat: [[0, 'knock'], [1.6, 'knock'], [3.2, 'knock']],
  };
  const FAKE_FROM = { sahil: 'vent', sayici: 'vent', avukat: 'door' };
  INIT.arda = () => ({ fake: null, mistakes: 0, tick: 0, prevSheet: false, prevDoor: false });
  function startFake(G, mimic) {
    G.arda.fake = { mimic, t: 0, next: 0, miyav: false, counted: false };
  }
  TICKS.push(function tickArda(G, dt) {
    const a = G.arda, d = G.dev;
    const sheetOn = d.sheet && !a.prevSheet, doorOn = d.doorL && !a.prevDoor;
    a.prevSheet = d.sheet; a.prevDoor = d.doorL;
    const f = a.fake;
    if (f) {
      const list = FAKE_SOUNDS[f.mimic];
      while (f.next < list.length && f.t >= list[f.next][0]) {
        emit(G, { type: 'sound', id: list[f.next][1], from: FAKE_FROM[f.mimic], fake: true }); f.next++;
      }
      if (!f.miyav && f.t >= PARAMS.ARDA_MIYAV) { f.miyav = true; emit(G, { type: 'sound', id: 'miyav', from: FAKE_FROM[f.mimic], fake: true }); }
      const wrong = f.mimic === 'avukat' ? (doorOn && !G.pending.door) : (sheetOn && !G.pending.sheet);
      if (wrong && !f.counted) {
        f.counted = true; a.mistakes++;
        if (a.mistakes >= PARAMS.ARDA_MAX) { die(G, 'arda'); return; }
      }
      f.t += dt;
      if (f.t >= PARAMS.ARDA_WINDOW) { a.fake = null; a.tick = 0; }
      return;
    }
    a.tick += dt;
    if (a.tick < PARAMS.ARDA_TICK) return;
    a.tick = 0;
    if (G.sahil.stage >= 2) return;   // Sahil havalandırmadayken Arda taklide başlamaz (ikisi aynı anda gelmez)
    if (!roll(G, G.lv.arda)) return;
    const opts = ['sahil', 'sayici', 'avukat'].filter(c => G.lv[c] > 0);
    if (!opts.length) return;
    startFake(G, opts[Math.floor(G.rng() * opts.length)]);
  });

  // ---------- ITS ME ----------
  Object.assign(PARAMS, { ITSME_CHANCE: 0.03 });
  INIT.itsme = (G, opts) => {
    if (opts.noItsMe || G.rng() >= PARAMS.ITSME_CHANCE) return { at: null, variant: null, done: false };
    const r = G.rng();
    return { at: 30 + G.rng() * 240, variant: r < 0.5 ? 'cam' : r < 0.9 ? 'corr' : 'crash', done: false };
  };
  TICKS.push(function tickItsMe(G) {
    const i = G.itsme;
    if (i.at == null || i.done || G.t < i.at) return;
    i.done = true;
    emit(G, { type: 'itsme', variant: i.variant });
    if (i.variant === 'crash') { G.over = true; G.result = 'itsme'; }
  });

  function shownTemp(G) { return G.muh.cam === 'cold' ? G.muh.frozenTemp : G.denek5.temp; }

  return { PARAMS, CAMS, CHARS, createGame, step, usage, shownTemp, _internal: { INIT, TICKS, roll, emit, die, mul, hack, startFake, knockOut } };
});
