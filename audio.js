// MIRIK'LA 5 GECE — ses motoru (dosya yok, hepsi Web Audio ile sentezleniyor)
const Audio5 = (() => {
  let ctx = null, master, comp, verb, verbIn, sfxBus, musicBus, ambBus;
  let muted = localStorage.getItem('m5g_morg_mute') === '1';
  let musicTimer = null, musicNodes = [], ambNodes = [], ambTimer = null, buzz = null;
  const buffers = {};

  let graphReady = false;
  function init() {
    if (ctx && graphReady) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    initGraph(); if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function initGraph() {
    if (graphReady) return; graphReady = true;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
    master.connect(comp).connect(ctx.destination);
    // reverb (sentetik oda yankısı)
    verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.6);
    verbIn = ctx.createGain(); verbIn.gain.value = 1;
    const verbOut = ctx.createGain(); verbOut.gain.value = 0.55;
    verbIn.connect(verb).connect(verbOut).connect(master);
    sfxBus = bus(1); musicBus = bus(0.75); ambBus = bus(0.8);
    buffers.white = noiseBuf('white', 2); buffers.brown = noiseBuf('brown', 4); buffers.pink = noiseBuf('pink', 3);
  }
  function bus(v) { const g = ctx.createGain(); g.gain.value = v; g.connect(master); return g; }
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function noiseBuf(kind, sec) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w;
      else if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else { b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.1) * 0.9; }
    }
    return b;
  }
  const now = () => ctx.currentTime;
  const samples = {};
  async function loadSamples() {
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); ctx.suspend && ctx.suspend(); initGraph(); }
    const list = { doorClose: 'sfx/door_close.mp3', doorOpen: 'sfx/door_open.mp3', switchOn: 'sfx/switch_on.mp3', switchOff: 'sfx/switch_off.mp3',
      say4: 'sfx/sayici_4.mp3', say5: 'sfx/sayici_5.mp3', say6: 'sfx/sayici_6.mp3', miyav: 'sfx/miyav.mp3' }; // kayıt yoksa sentez
    await Promise.all(Object.entries(list).map(async ([k, url]) => {
      try { const r = await fetch(url); const ab = await r.arrayBuffer(); samples[k] = await new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)); } catch (e) {}
    }));
  }
  function play(name, { pan = 0, vol = 1, wet = 0.15, rate = 1 } = {}) {
    const b = samples[name]; if (!b) return false;
    const s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = rate;
    const g = ctx.createGain(); g.gain.value = vol; s.connect(g); out(g, { pan, wet }); s.start(); return true;
  }
  function out(node, { bus = sfxBus, pan = 0, wet = 0.25 } = {}) {
    let n = node;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; n.connect(p); n = p; }
    n.connect(bus);
    if (wet) { const s = ctx.createGain(); s.gain.value = wet; n.connect(s); s.connect(verbIn); }
  }
  function env(g, t, a, peak, d, sustain = 0.0001) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(sustain, t + a + d);
  }
  function noise({ t = now(), dur = 0.3, type = 'lowpass', f = 1000, f2 = null, q = 0.7, vol = 0.5, a = 0.003, kind = 'white', pan = 0, wet = 0.25, bus } = {}) {
    const s = ctx.createBufferSource(); s.buffer = buffers[kind]; s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain(); env(g, t, a, vol, dur);
    s.connect(fl).connect(g); out(g, { pan, wet, bus });
    s.start(t, Math.random()); s.stop(t + a + dur + 0.05);
  }
  function osc({ t = now(), type = 'sine', f = 440, f2 = null, dur = 0.5, vol = 0.2, a = 0.005, detune = 0, pan = 0, wet = 0.25, bus, lp = null } = {}) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), t + dur);
    const g = ctx.createGain(); env(g, t, a, vol, dur);
    let n = o; if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); n = fl; }
    n.connect(g); out(g, { pan, wet, bus }); o.start(t); o.stop(t + a + dur + 0.05);
  }
  function distCurve(k) { const n = 2048, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (3 + k) * x * 20 * Math.PI / 180 / (Math.PI + k * Math.abs(x)); } return c; }

  // ---------- SFX ----------
  const sfx = {

    // ---------- MORG sesleri ----------
    knock(side = -1) { // çelik kapıya yumruk
      const t = now(), p = side * 0.7;
      for (let i = 0; i < 3; i++) {
        const tt = t + i * 0.32 + Math.random() * 0.04;
        osc({ t: tt, f: 90, f2: 45, dur: 0.22, vol: 0.9, pan: p, wet: 0.4 });
        noise({ t: tt, dur: 0.12, f: 1400, f2: 300, vol: 0.5, kind: 'pink', pan: p, wet: 0.4 });
        [212, 371, 590].forEach(f => osc({ t: tt, f, dur: 0.7, vol: 0.035, type: 'triangle', pan: p, wet: 0.6 }));
      }
    },
    drag(side = 1) { // ıslak sürünme: havalandırmada
      const t = now(), p = side * 0.8;
      for (let i = 0; i < 4; i++) {
        const tt = t + i * 0.55 + Math.random() * 0.1;
        noise({ t: tt, dur: 0.45, type: 'bandpass', f: 500, f2: 260, q: 1.4, vol: 0.32, kind: 'brown', pan: p, wet: 0.45 });
        noise({ t: tt + 0.05, dur: 0.25, type: 'highpass', f: 2600, vol: 0.06, pan: p, wet: 0.3 }); // ıslak şıpırtı
        osc({ t: tt, f: 60, f2: 45, dur: 0.3, vol: 0.12, pan: p, wet: 0.5 });
      }
    },
    say(n = 4, fake = false) { // Sayıcı: kayıt varsa onu, yoksa fısıltı sentezi
      if (![4, 5, 6].includes(n)) n = 4;
      const pan = 0.75, rate = fake ? 0.96 : 1;
      if (play('say' + n, { pan, rate, vol: 1.1, wet: 0.45 })) return;
      const t = now(), syll = n === 6 ? 2 : 1, loud = n === 6 ? 0.9 : 0.45;
      const form = { 4: [[700, 1200]], 5: [[500, 1900]], 6: [[750, 1250], [400, 2200]] }[n];
      for (let i = 0; i < syll; i++) {
        const tt = t + i * 0.28, [f1, f2] = form[i];
        noise({ t: tt, dur: 0.32, type: 'bandpass', f: f1 * rate, q: 6, vol: loud, pan, wet: 0.5 });
        noise({ t: tt, dur: 0.32, type: 'bandpass', f: f2 * rate, q: 8, vol: loud * 0.7, pan, wet: 0.5 });
        noise({ t: tt, dur: 0.08, type: 'highpass', f: 4500, vol: loud * 0.4, pan, wet: 0.3 });
      }
      if (n === 6) osc({ t, f: 55, f2: 35, dur: 0.8, vol: 0.6, wet: 0.4 });
    },
    miyav() { // Arda Baz'ın bozuk miyavı: kısa, boğuk, yarıda kesik
      if (play('miyav', { pan: 0.3, vol: 0.9, wet: 0.4, rate: 0.9 })) return;
      const t = now(), dur = 0.38;
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(330, t); o.frequency.linearRampToValueAtTime(470, t + dur * 0.4); o.frequency.exponentialRampToValueAtTime(240, t + dur);
      const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 5; f1.frequency.setValueAtTime(800, t); f1.frequency.linearRampToValueAtTime(1300, t + dur * 0.4);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.04); g.gain.setValueAtTime(0.35, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f1).connect(g); out(g, { pan: 0.3, wet: 0.5 }); o.start(t); o.stop(t + dur + 0.05);
      noise({ t: t + dur * 0.75, dur: 0.05, type: 'bandpass', f: 3000, q: 2, vol: 0.2, wet: 0.2 }); // kesik
    },
    rattle() { // morg çekmecesi takırdıyor
      const t = now();
      for (let i = 0; i < 9; i++) {
        const tt = t + i * 0.07 + Math.random() * 0.03;
        noise({ t: tt, dur: 0.04, type: 'bandpass', f: 1800 + Math.random() * 900, q: 5, vol: 0.18, pan: -0.3, wet: 0.6 });
        osc({ t: tt, f: 140, f2: 90, dur: 0.06, vol: 0.12, pan: -0.3, wet: 0.5 });
      }
    },
    drawer() { // 5 numaralı çekmece açılıyor: uzun metal sürtünmesi + gümleme
      const t = now();
      noise({ t, dur: 1.6, type: 'bandpass', f: 900, f2: 500, q: 9, vol: 0.5, pan: -0.3, wet: 0.6 });
      osc({ t, f: 180, f2: 120, dur: 1.6, vol: 0.12, type: 'sawtooth', lp: 900, pan: -0.3, wet: 0.5 });
      osc({ t: t + 1.6, f: 60, f2: 30, dur: 0.8, vol: 1, wet: 0.6 });
    },
    motor() { // koridordan yaklaşan motor
      const t = now(), dur = 6;
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(38, t); o.frequency.linearRampToValueAtTime(70, t + dur);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(200, t); lp.frequency.linearRampToValueAtTime(900, t + dur);
      const am = ctx.createGain(); const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.setValueAtTime(9, t); lfo.frequency.linearRampToValueAtTime(18, t + dur); lg.gain.value = 0.4; lfo.connect(lg).connect(am.gain);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + dur);
      o.connect(lp).connect(am).connect(g); out(g, { wet: 0.5 }); o.start(t); lfo.start(t); o.stop(t + dur + 8.5); lfo.stop(t + dur + 8.5);
      g.gain.setValueAtTime(0.9, t + dur + 7.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 8.4);
    },
    reboot() { noise({ dur: 0.6, type: 'bandpass', f: 600, f2: 3200, q: 1, vol: 0.3, wet: 0.1 }); osc({ f: 900, f2: 1800, dur: 0.5, vol: 0.05, type: 'square', wet: 0 }); },
    phoneRing() {
      const t = now();
      for (let r = 0; r < 2; r++) for (let i = 0; i < 16; i++) { const tt = t + r * 1.2 + i * 0.05; osc({ t: tt, f: 1300, dur: 0.03, vol: 0.06, type: 'square', lp: 2500, pan: 0.3, wet: 0.3 }); }
    },
    breath() { noise({ dur: 1.4, type: 'bandpass', f: 900, f2: 500, q: 1.2, vol: 0.12, a: 0.5, wet: 0.2 }); },
    sheet() { for (let i = 0; i < 4; i++) noise({ t: now() + i * 0.05, dur: 0.18, type: 'bandpass', f: 1800 + Math.random() * 1500, q: 0.9, vol: 0.12, wet: 0.15 }); sfx.breath(); },
    flashClick() { noise({ dur: 0.015, type: 'highpass', f: 3500, vol: 0.3, wet: 0 }); osc({ f: 3000, f2: 1500, dur: 0.02, vol: 0.05, wet: 0 }); },
    door(side = 0, closing = true) { // ağır sürgülü çelik kepenk
      if (play(closing ? 'doorClose' : 'doorOpen', { pan: side * 0.6, vol: closing ? 1 : 0.85, wet: 0.18 })) return;
      const t = now(), p = side * 0.6, slide = closing ? 0.34 : 0.4;
      // motor/ray uğultusu
      noise({ t, dur: slide, type: 'lowpass', f: closing ? 420 : 300, f2: closing ? 220 : 520, vol: 0.5, a: 0.03, kind: 'brown', pan: p, wet: 0.25 });
      // lamellerin tıkırdaması (amplitüd modülasyonlu)
      const s1 = ctx.createBufferSource(); s1.buffer = buffers.white; s1.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.2; bp.frequency.setValueAtTime(closing ? 1300 : 850, t); bp.frequency.linearRampToValueAtTime(closing ? 800 : 1300, t + slide);
      const am = ctx.createGain(); am.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.setValueAtTime(closing ? 34 : 26, t); lfo.frequency.linearRampToValueAtTime(closing ? 22 : 34, t + slide);
      const lg = ctx.createGain(); lg.gain.value = 0.5; lfo.connect(lg).connect(am.gain);
      const g = ctx.createGain(); env(g, t, 0.02, 0.32, slide);
      s1.connect(bp).connect(am).connect(g); out(g, { pan: p, wet: 0.2 }); s1.start(t); lfo.start(t); s1.stop(t + slide + .05); lfo.stop(t + slide + .05);
      const e = t + slide;
      if (closing) { // yere çarpma: tok gümleme + metal tınlaması + küçük sekme
        osc({ t: e, f: 75, f2: 38, dur: 0.38, vol: 1, pan: p, wet: 0.35 });
        noise({ t: e, dur: 0.22, f: 1800, f2: 200, vol: 0.75, kind: 'pink', pan: p, wet: 0.35 });
        [[211, .07], [347, .05], [529, .04], [884, .025]].forEach(([f, v]) => osc({ t: e, f, f2: f * 0.985, dur: 1.1, vol: v, type: 'sine', pan: p, wet: 0.55 }));
        osc({ t: e + 0.11, f: 95, f2: 50, dur: 0.12, vol: 0.35, pan: p, wet: 0.3 });
        noise({ t: e + 0.11, dur: 0.06, f: 1200, vol: 0.25, kind: 'pink', pan: p, wet: 0.3 });
      } else { // yukarıda kilitlenme
        osc({ t: e, f: 140, f2: 90, dur: 0.12, vol: 0.4, pan: p, wet: 0.25 });
        noise({ t: e, dur: 0.05, type: 'bandpass', f: 2200, q: 4, vol: 0.3, pan: p, wet: 0.2 });
        [[420, .03], [690, .02]].forEach(([f, v]) => osc({ t: e, f, dur: 0.5, vol: v, pan: p, wet: 0.5 }));
      }
    },
    click() { noise({ dur: 0.012, type: 'highpass', f: 3000, vol: 0.35, wet: 0.05 }); osc({ f: 2400, f2: 1200, dur: 0.015, vol: 0.06, wet: 0 }); },
    light(on, side = 0) { // röle "klak" + ampul uğultusu
      const t = now(), p = side * 0.6;
      const usedSample = play(on ? 'switchOn' : 'switchOff', { pan: p, vol: 0.9, wet: 0.08 });
      if (!usedSample) {
      noise({ t, dur: 0.015, type: 'highpass', f: 2500, vol: 0.4, pan: p, wet: 0.08 });
      noise({ t: t + 0.03, dur: 0.02, type: 'bandpass', f: 1400, q: 2, vol: 0.25, pan: p, wet: 0.08 });
      osc({ t, f: 180, f2: 110, dur: 0.05, vol: 0.12, pan: p, wet: 0.05 });
      }
      if (buzz) { try { buzz.stop(); } catch (e) {} buzz = null; }
      if (!on) return;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.08);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
      const os = [[50, 1], [100, .6], [150, .35], [200, .15]].map(([f, v]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = f; og.gain.value = v; o.connect(og).connect(lp); o.start(t); return o; });
      const cr = ctx.createBufferSource(); cr.buffer = buffers.white; cr.loop = true; const cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 3500; cf.Q.value = 1; const cg = ctx.createGain(); cg.gain.value = 0.12;
      const cl = ctx.createOscillator(); cl.type = 'square'; cl.frequency.value = 9; const clg = ctx.createGain(); clg.gain.value = 0.1; cl.connect(clg).connect(cg.gain);
      cr.connect(cf).connect(cg).connect(lp); cr.start(t); cl.start(t);
      lp.connect(g); out(g, { pan: p, wet: 0.12 });
      buzz = { stop() { const s0 = now(); g.gain.cancelScheduledValues(s0); g.gain.setValueAtTime(g.gain.value, s0); g.gain.linearRampToValueAtTime(0.0001, s0 + 0.05); [...os, cr, cl].forEach(x => x.stop(s0 + 0.08)); } };
    },
    flicker() { // lamba titremesi: tel cızırtısı
      const t = now();
      for (let i = 0; i < 4; i++) { const tt = t + i * 0.06 + Math.random() * 0.03; noise({ t: tt, dur: 0.03, type: 'bandpass', f: 2800 + Math.random() * 2000, q: 3, vol: 0.12, pan: -0.25, wet: 0.2 }); osc({ t: tt, f: 100, dur: 0.04, vol: 0.05, type: 'sawtooth', lp: 600, pan: -0.25, wet: 0.1 }); }
    },
    camOpen() { noise({ dur: 0.25, type: 'bandpass', f: 300, f2: 2500, q: 1, vol: 0.3, wet: 0.1 }); osc({ f: 60, dur: 0.2, vol: 0.2, wet: 0 }); },
    camClose() { noise({ dur: 0.22, type: 'bandpass', f: 2500, f2: 300, q: 1, vol: 0.3, wet: 0.1 }); },
    blip() { sfx.click(); noise({ dur: 0.18, type: 'bandpass', f: 2600, q: 0.8, vol: 0.25, wet: 0.05 }); osc({ f: 1250, dur: 0.05, vol: 0.05, type: 'square', wet: 0 }); },
    step(side = 0) { // koridorda ayak sesleri
      const p = side * 0.8, t = now();
      for (let i = 0; i < 4; i++) {
        const tt = t + i * 0.42 + Math.random() * 0.05, v = 0.25 + i * 0.12;
        osc({ t: tt, f: 75, f2: 45, dur: 0.12, vol: v, pan: p, wet: 0.5 });
        noise({ t: tt, dur: 0.09, f: 700, f2: 200, vol: v * 0.8, kind: 'pink', pan: p, wet: 0.5 });
      }
    },
    bang() { // Sahil Mırık kapıya çarpıyor
      const t = now();
      for (let i = 0; i < 5; i++) {
        const tt = t + i * 0.24 + Math.random() * 0.04;
        osc({ t: tt, f: 70, f2: 30, dur: 0.3, vol: 1, pan: 0.6, wet: 0.45 });
        noise({ t: tt, dur: 0.25, f: 900, f2: 150, vol: 0.8, kind: 'brown', pan: 0.6, wet: 0.45 });
        [287, 433, 691].forEach(f => osc({ t: tt, f, dur: 0.5, vol: 0.04, type: 'triangle', pan: 0.6, wet: 0.6 }));
      }
    },
    alarm() { // "maç bulundu" — parlak, çınlayan iki ton
      const t = now();
      [[880, 0], [1318.5, 0.16], [1760, 0.32]].forEach(([f, d]) => { osc({ t: t + d, f, dur: 0.7, vol: 0.14, type: 'triangle', wet: 0.4 }); osc({ t: t + d, f: f * 2, dur: 0.4, vol: 0.04, wet: 0.4 }); });
    },
    tick() { osc({ f: 2200, dur: 0.03, vol: 0.05, type: 'square', wet: 0 }); },
    sting() { // ışıkta biri görününce
      const t = now();
      [0, 3, 6, 11].forEach((st, i) => osc({ t, f: 220 * Math.pow(2, st / 12), dur: 1.4, vol: 0.09, type: 'sawtooth', detune: (Math.random() - 0.5) * 30, lp: 1800, wet: 0.6 }));
      noise({ t, dur: 1.2, type: 'bandpass', f: 3000, f2: 6000, q: 4, vol: 0.12, wet: 0.6 });
      osc({ t, f: 55, f2: 40, dur: 1.2, vol: 0.5, wet: 0.3 });
    },
    scream() { // jumpscare: diğer her şeyi sustur, sonra bozuk animatronik çığlık
      stopMusic(0.05); stopAmbience(0.05);
      const t = now() + 0.02, dur = 2.2;
      const shaper = ctx.createWaveShaper(); shaper.curve = distCurve(400); shaper.oversample = '4x';
      const pre = ctx.createGain(); pre.gain.value = 1.6;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.0, t + 0.012); g.gain.setValueAtTime(1.0, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const wob = ctx.createOscillator(), wg = ctx.createGain(); wob.type = 'square'; wob.frequency.setValueAtTime(42, t); wob.frequency.linearRampToValueAtTime(18, t + dur); wg.gain.value = 120;
      wob.connect(wg); wob.start(t); wob.stop(t + dur + 0.1);
      [[620, 1], [655, 0.9], [930, 0.7], [1240, 0.5], [310, 0.8], [1860, 0.3]].forEach(([f, v], i) => {
        const o = ctx.createOscillator(), og = ctx.createGain(); o.type = i % 2 ? 'sawtooth' : 'square';
        o.frequency.setValueAtTime(f * 0.7, t); o.frequency.exponentialRampToValueAtTime(f * 1.25, t + 0.12); o.frequency.exponentialRampToValueAtTime(f * 0.45, t + dur);
        wg.connect(o.frequency); og.gain.value = v * 0.35; o.connect(og).connect(pre); o.start(t); o.stop(t + dur + 0.1);
      });
      const bp1 = ctx.createBiquadFilter(); bp1.type = 'peaking'; bp1.frequency.value = 2400; bp1.gain.value = 9; bp1.Q.value = 1;
      pre.connect(shaper).connect(bp1).connect(g); out(g, { wet: 0.25 });
      // cızırtı + metal çığlık katmanı
      noise({ t, dur, type: 'bandpass', f: 4200, f2: 1500, q: 0.7, vol: 1, wet: 0.2 });
      noise({ t, dur: 1.2, type: 'highpass', f: 6000, vol: 0.5, wet: 0.1 });
      // darbe
      osc({ t, f: 70, f2: 28, dur: 1.2, vol: 1, wet: 0.2 });
      noise({ t, dur: 0.5, f: 400, f2: 80, vol: 1, kind: 'brown', wet: 0.3 });
    },
    meow(scary = false) { // miyav: perdesi kayan testere + ağız formantı
      const t = now(), dur = scary ? 1.1 : 0.62;
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      const base = scary ? 380 : 620;
      o.frequency.setValueAtTime(base, t); o.frequency.linearRampToValueAtTime(base * 1.45, t + dur * 0.35); o.frequency.exponentialRampToValueAtTime(base * 0.62, t + dur);
      const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 5; f1.frequency.setValueAtTime(700, t); f1.frequency.linearRampToValueAtTime(1500, t + dur * 0.35); f1.frequency.linearRampToValueAtTime(600, t + dur);
      const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 7; f2.frequency.setValueAtTime(2200, t); f2.frequency.linearRampToValueAtTime(3000, t + dur * 0.4); f2.frequency.linearRampToValueAtTime(1800, t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(scary ? 1.4 : 0.5, t + 0.06); g.gain.setValueAtTime(scary ? 1.4 : 0.5, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const mix = ctx.createGain(); mix.gain.value = 1;
      o.connect(f1).connect(mix); o.connect(f2).connect(mix);
      if (scary) { const sh = ctx.createWaveShaper(); sh.curve = distCurve(200); mix.connect(sh).connect(g); } else mix.connect(g);
      out(g, { wet: scary ? 0.4 : 0.25 }); o.start(t); o.stop(t + dur + 0.05);
    },
    hover() { osc({ f: 1650, f2: 1400, dur: 0.035, vol: 0.05, type: 'triangle', wet: 0.15 }); noise({ dur: 0.02, type: 'highpass', f: 4000, vol: 0.06, wet: 0 }); },
    static() { noise({ dur: 0.26, type: 'bandpass', f: 3000, q: 0.5, vol: 0.45, wet: 0.05 }); noise({ dur: 0.18, type: 'highpass', f: 6000, vol: 0.2, wet: 0 }); osc({ f: 120, f2: 60, dur: 0.12, vol: 0.18, type: 'square', lp: 900, wet: 0 }); },
    paper() { for (let i = 0; i < 6; i++) noise({ t: now() + i * 0.07 + Math.random() * 0.04, dur: 0.12 + Math.random() * 0.1, type: 'bandpass', f: 2500 + Math.random() * 3000, q: 0.8, vol: 0.18, wet: 0.2 }); },
    neck() { // menüde: kemik kırılması + kısa bozuk çığlık
      const t = now();
      [0, 0.018, 0.041].forEach((d, i) => { noise({ t: t + d, dur: 0.03, type: 'highpass', f: 1800 + i * 600, vol: 0.55, wet: 0.15 }); osc({ t: t + d, f: 220 - i * 40, f2: 90, dur: 0.05, vol: 0.25, wet: 0.1 }); });
      noise({ t, dur: 0.22, type: 'bandpass', f: 1600, f2: 900, q: 1.2, vol: 0.28, wet: 0.5 });
      [0, 1, 2].forEach(i => osc({ t, f: 740 + i * 47, f2: 380, dur: 0.22, vol: 0.05, type: 'triangle', wet: 0.6 }));
      osc({ t, f: 55, f2: 35, dur: 0.6, vol: 0.4, wet: 0.4 });
    },
    boom() { osc({ f: 50, f2: 28, dur: 2.5, vol: 0.9, wet: 0.6 }); noise({ dur: 2.2, f: 200, f2: 60, vol: 0.6, kind: 'brown', wet: 0.6 }); },
    chime() { // 6 AM çanları
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      notes.forEach((f, i) => bell(now() + i * 0.32, f, 0.22));
      setTimeout(() => cheer(), 2100);
    },
    powerdown() {
      sfx.light(false); osc({ f: 420, f2: 25, dur: 2.6, vol: 0.25, type: 'sawtooth', lp: 1200, wet: 0.4 });
      noise({ dur: 0.3, f: 400, vol: 0.8, kind: 'brown', wet: 0.5 });
      stopAmbience(1.5);
    },
    darkTune() { // elektrik bitince karanlıkta çalan bozuk müzik kutusu
      const mel = [76, 74, 72, 71, 72, 69, 71, 68, 69, 0, 64, 0];
      mel.forEach((m, i) => { if (m) musicBox(now() + 0.6 + i * 0.38, midi(m) * (1 + (Math.random() - 0.5) * 0.012), 0.16, { bus: sfxBus }); });
    }
  };
  function bell(t, f, vol) { [[1, 1], [2.76, 0.4], [5.4, 0.2], [8.93, 0.1]].forEach(([r, v]) => osc({ t, f: f * r, dur: 2.2 / r + 0.3, vol: vol * v, wet: 0.5 })); }
  function cheer() { for (let i = 0; i < 14; i++) noise({ t: now() + Math.random() * 0.8, dur: 0.6 + Math.random() * 0.6, type: 'bandpass', f: 900 + Math.random() * 1500, q: 3, vol: 0.08, wet: 0.5 }); }
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  function musicBox(t, f, vol, o = {}) {
    osc({ t, f, dur: 1.6, vol, a: 0.002, wet: 0.55, bus: o.bus || musicBus });
    osc({ t, f: f * 2.01, dur: 0.7, vol: vol * 0.35, a: 0.002, wet: 0.55, bus: o.bus || musicBus });
    osc({ t, f: f * 4.03, dur: 0.25, vol: vol * 0.12, a: 0.001, wet: 0.55, bus: o.bus || musicBus });
    noise({ t, dur: 0.012, type: 'highpass', f: 5000, vol: vol * 0.4, wet: 0.2, bus: o.bus || musicBus });
  }

  // ---------- MENÜ MÜZİĞİ: sinematik karanlık ambient (orijinal) ----------
  // Akorlar (MIDI): Am(add9) → Fmaj7 → Dm(add9) → E(sus4→3). Kare/testere dalga YOK.
  const CHORDS = [
    { pad: [45, 52, 57, 60, 64, 71], root: 33, mel: [[0.6, 76], [2.4, 72], [4.1, 71], [6.6, 69]] },
    { pad: [41, 48, 53, 57, 60, 64], root: 29, mel: [[0.9, 72], [2.8, 76], [5.2, 77, 69], [7.4, 76]] },
    { pad: [38, 45, 50, 53, 57, 64], root: 26, mel: [[0.5, 74], [2.6, 69], [4.4, 72], [6.9, 65]] },
    { pad: [40, 47, 52, 57, 59, 64], root: 28, mel: [[0.7, 71], [2.9, 68], [4.6, 64], [7.2, 68, 71]] }
  ];
  const CHORD_LEN = 9.6;
  let mg = null, mVerb = null, mSched = null;
  function musicVerb() {
    if (mVerb) return mVerb;
    const cv = ctx.createConvolver(); cv.buffer = impulse(6.5, 3.2);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    const g = ctx.createGain(); g.gain.value = 0.9;
    cv.connect(lp).connect(g).connect(musicBus); mVerb = cv; return cv;
  }
  function voiceOut(node, dry = 0.35, wet = 1) {
    const d = ctx.createGain(); d.gain.value = dry; node.connect(d).connect(mg.dry);
    const w = ctx.createGain(); w.gain.value = wet; node.connect(w).connect(mg.wet);
  }
  function padNote(t, m, len, vol) {
    const f = midi(m), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = m < 50 ? 520 : 1100; lp.Q.value = 0.4;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 3.2);
    g.gain.setValueAtTime(vol, t + len - 1); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 3.5);
    [[-7, 'sine', 1], [6, 'triangle', 0.55], [0, 'sine', 0.18, 2]].forEach(([dt, type, v, mul = 1]) => {
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f * mul; o.detune.value = dt; og.gain.value = v;
      const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 0.15 + Math.random() * 0.2; vg.gain.value = 3; vib.connect(vg).connect(o.detune);
      o.connect(og).connect(lp); o.start(t); vib.start(t); o.stop(t + len + 4); vib.stop(t + len + 4);
    });
    lp.connect(g); voiceOut(g, 0.25, 1);
  }
  function piano(t, m, vol = 0.09) { // keçeli piyano tınısı: yumuşak çekiç + uzun sönüm
    const f = midi(m), g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(700, t + 3);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);
    [[1, 1], [2.003, 0.38], [3.008, 0.14], [4.02, 0.07], [5.04, 0.03]].forEach(([r, v]) => {
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * r; og.gain.value = v; o.connect(og).connect(lp); o.start(t); o.stop(t + 6);
    });
    const hn = ctx.createBufferSource(); hn.buffer = buffers.pink; const hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 1200; const hg = ctx.createGain();
    hg.gain.setValueAtTime(vol * 0.5, t); hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.03); hn.connect(hf).connect(hg).connect(lp); hn.start(t, Math.random()); hn.stop(t + 0.05);
    lp.connect(g); voiceOut(g, 0.5, 0.85);
  }
  function swell(t) { // ters zil gibi yükselip kesilen metal ses
    const s = ctx.createBufferSource(); s.buffer = buffers.white; s.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.setValueAtTime(2500, t); hp.frequency.exponentialRampToValueAtTime(7000, t + 3); hp.Q.value = 1.5;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 3); g.gain.linearRampToValueAtTime(0, t + 3.05);
    s.connect(hp).connect(g); voiceOut(g, 0.3, 1); s.start(t); s.stop(t + 3.2);
  }
  function scheduleChord(t, i) {
    const c = CHORDS[i % CHORDS.length];
    c.pad.forEach((m, k) => padNote(t, m, CHORD_LEN, k < 2 ? 0.05 : 0.032));
    // sub bas
    const so = ctx.createOscillator(), sg = ctx.createGain(); so.frequency.value = midi(c.root + 12); so.type = 'sine';
    sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.13, t + 2.5); sg.gain.setValueAtTime(0.13, t + CHORD_LEN - 0.8); sg.gain.exponentialRampToValueAtTime(0.0001, t + CHORD_LEN + 2);
    so.connect(sg); voiceOut(sg, 0.8, 0.2); so.start(t); so.stop(t + CHORD_LEN + 2.2);
    // piyano motifi (hafif rubato)
    if (i >= 1) c.mel.forEach(([off, ...ns]) => ns.forEach((m, j) => piano(t + off + j * 0.09 + (Math.random() - 0.5) * 0.15, m, 0.085 - j * 0.02)));
    if (i % 4 === 0 && i > 0) { // döngü başında uzaktan gümleme
      const bo = ctx.createOscillator(), bg = ctx.createGain(); bo.frequency.setValueAtTime(48, t); bo.frequency.exponentialRampToValueAtTime(30, t + 2.5);
      bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.35, t + 0.05); bg.gain.exponentialRampToValueAtTime(0.0001, t + 3); bo.connect(bg); voiceOut(bg, 0.6, 0.9); bo.start(t); bo.stop(t + 3.1);
    }
    if (i % 4 === 3) swell(t + CHORD_LEN - 3.1);
  }
  function playMenuMusic() {
    init(); if (mg) return;
    const t = now();
    mg = { dry: ctx.createGain(), wet: ctx.createGain() };
    mg.dry.gain.setValueAtTime(0.0001, t); mg.dry.gain.exponentialRampToValueAtTime(1, t + 2);
    mg.wet.gain.setValueAtTime(0.0001, t); mg.wet.gain.exponentialRampToValueAtTime(1, t + 2);
    mg.dry.connect(musicBus); mg.wet.connect(musicVerb());
    // rüzgâr dokusu
    const w = ctx.createBufferSource(); w.buffer = buffers.pink; w.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.Q.value = 1.1; wf.frequency.value = 500;
    const wl = ctx.createOscillator(), wlg = ctx.createGain(); wl.frequency.value = 0.05; wlg.gain.value = 300; wl.connect(wlg).connect(wf.frequency);
    const wg = ctx.createGain(); wg.gain.value = 0.045; w.connect(wf).connect(wg); voiceOut(wg, 0.6, 0.6); w.start(t); wl.start(t);
    mg.nodes = [w, wl];
    let i = 0, next = t + 0.3;
    const tick = () => { while (next < now() + 1.5) { scheduleChord(next, i++); next += CHORD_LEN; } };
    tick(); mSched = setInterval(tick, 300);
  }
  function stopMusic(fade = 1) {
    if (!mg) return; clearInterval(mSched); mSched = null;
    const g = mg, t = now();
    [g.dry, g.wet].forEach(x => { x.gain.cancelScheduledValues(t); x.gain.setValueAtTime(Math.max(x.gain.value, 0.0001), t); x.gain.exponentialRampToValueAtTime(0.0001, t + fade); });
    setTimeout(() => { g.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); g.dry.disconnect(); g.wet.disconnect(); }, fade * 1000 + 200);
    mg = null;
  }

  // ---------- OYUN İÇİ ATMOSFER: havalandırma + uğultu + rastgele gıcırtılar ----------
  function startAmbience() {
    init(); if (ambTimer) return;
    const t = now(), g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1, t + 2);
    const fan = ctx.createBufferSource(); fan.buffer = buffers.brown; fan.loop = true; const ff = ctx.createBiquadFilter(); ff.type = 'lowpass'; ff.frequency.value = 260; const fg = ctx.createGain(); fg.gain.value = 0.22;
    const flfo = ctx.createOscillator(), flg = ctx.createGain(); flfo.frequency.value = 4.3; flg.gain.value = 0.05; flfo.connect(flg).connect(fg.gain);
    fan.connect(ff).connect(fg).connect(g); fan.start(); flfo.start();
    const hum = ctx.createOscillator(); hum.frequency.value = 50; const hg = ctx.createGain(); hg.gain.value = 0.05; hum.connect(hg).connect(g); hum.start();
    const hum2 = ctx.createOscillator(); hum2.frequency.value = 100; const hg2 = ctx.createGain(); hg2.gain.value = 0.015; hum2.connect(hg2).connect(g); hum2.start();
    out(g, { bus: ambBus, wet: 0.15 });
    ambNodes = [fan, flfo, hum, hum2]; ambNodes.gain = g;
    const creak = () => {
      const r = Math.random(), p = (Math.random() - 0.5) * 1.6;
      if (r < 0.4) noise({ dur: 1.2 + Math.random(), type: 'bandpass', f: 300 + Math.random() * 300, f2: 500 + Math.random() * 600, q: 18, vol: 0.18, pan: p, wet: 0.7, bus: ambBus }); // gıcırtı
      else if (r < 0.65) for (let i = 0; i < 3; i++) osc({ t: now() + i * (0.6 + Math.random()), f: 1800 + Math.random() * 600, f2: 900, dur: 0.06, vol: 0.05, pan: p, wet: 0.8, bus: ambBus }); // damla
      else if (r < 0.85) osc({ f: 70, f2: 40, dur: 0.5, vol: 0.18, pan: p, wet: 0.8, bus: ambBus }); // uzaktan gümleme
      else noise({ dur: 2.5, type: 'bandpass', f: 1200, f2: 300, q: 8, vol: 0.06, pan: p, wet: 0.9, bus: ambBus }); // fısıltı gibi
      ambTimer = setTimeout(creak, 7000 + Math.random() * 14000);
    };
    ambTimer = setTimeout(creak, 5000);
  }

  // Morg: soğuk oda kompresörü (yavaş açılıp kapanan uğultu) + normal atmosfer
  let comp2 = null;
  function morgAmbience() {
    startAmbience(); if (comp2) return;
    const t = now(), o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 59;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    const g = ctx.createGain(); g.gain.value = 0.03; const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.05; lg.gain.value = 0.025; lfo.connect(lg).connect(g.gain);
    o.connect(lp).connect(g); out(g, { bus: ambBus, wet: 0.2 }); o.start(t); lfo.start(t);
    comp2 = [o, lfo]; ambNodes.push(o, lfo);
  }
  function playVoice(url, vol = 0.9) { const a = new Audio(url); a.volume = muted ? 0 : vol; a.play().catch(() => {}); return a; }
  function stopAmbience(fade = 0.5) {
    comp2 = null;
    if (ambTimer) { clearTimeout(ambTimer); ambTimer = null; }
    if (buzz) { try { buzz.stop(); } catch (e) {} buzz = null; }
    if (!ambNodes.gain) return;
    const g = ambNodes.gain, t = now(); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.exponentialRampToValueAtTime(0.0001, t + fade);
    const ns = ambNodes; setTimeout(() => ns.forEach(n => { try { n.stop(); } catch (e) {} }), fade * 1000 + 100); ambNodes = [];
  }
  function setMuted(m) { muted = m; localStorage.setItem('m5g_morg_mute', m ? '1' : '0'); if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, now(), 0.05); }

  return { init, sfx, loadSamples, play, playMenuMusic, stopMusic, startAmbience, morgAmbience, playVoice, stopAmbience, setMuted, get muted() { return muted; }, get debug() { return { music: !!mg, sched: !!mSched, amb: !!ambTimer, ctx: ctx && ctx.state }; } };
})();
