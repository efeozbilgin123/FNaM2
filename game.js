// Mırık'la 5 Gece: MORG — arayüz, çizim, ekranlar. Oyun kuralları core.js'te.
'use strict';
const { NIGHTS, DOCS } = window.Nights;
const stage = document.getElementById('stage');
const $ = id => document.getElementById(id);
function fit() { const s = Math.min(innerWidth / 1280, innerHeight / 720); stage.style.transform = `translate(-50%,-50%) scale(${s})`; }
addEventListener('resize', fit); fit();

// ---------- kayıp görsel: yer tutucuya düş ----------
const BLANK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQAY3Y2wAAAAAElFTkSuQmCC';
addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && t.src !== BLANK) { t.dataset.missing = t.getAttribute('src'); t.src = BLANK; } }, true);
function setSrc(img, src) { if (img.dataset.want !== src) { img.dataset.want = src; img.src = src; } }

// ---------- ses ----------
const A = Audio5; // audio.js global (const, window özelliği değil)
const sfx = A.sfx;
function snd(name, ...a) { try { A.init(); if (sfx[name]) sfx[name](...a); } catch (e) { } }
const PAN = { door: -1, corr: 0, vent: 1, cold: -0.3 };

// ---------- ekranlar ----------
const MUSIC = ['splash', 'title', 'archive', 'custom', 'over'];
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  $('mute').style.display = ['splash', 'title', 'archive', 'custom'].includes(id) ? '' : 'none';
  try {
    if (MUSIC.includes(id)) { A.stopAmbience && A.stopAmbience(0.3); A.playMenuMusic(); }
    else if (id === 'intro') { A.stopMusic(1.2); snd('boom'); }
    else if (id === 'scare' || id === 'six' || id === 'crash' || id === 'ending') { A.stopMusic(0.2); A.stopAmbience && A.stopAmbience(0.1); }
  } catch (e) { }
}
const gctx = $('glitch').getContext('2d'), gimg = gctx.createImageData(320, 180);
function glitchBurst(after, ms = 260) {
  const g = $('glitch'); g.classList.add('on'); snd('static');
  const end = performance.now() + ms;
  (function frame() {
    const d = gimg.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 235; }
    gctx.putImageData(gimg, 0, 0);
    if (performance.now() < end) requestAnimationFrame(frame); else { g.classList.remove('on'); if (after) after(); }
  })();
}

// ---------- kayıt ----------
let P = Save.load();
function persist(r) { P = Save.unlock(P, r); Save.save(P); refreshMenu(); }
function refreshMenu() {
  const n = P.night || 1;
  $('bCont').textContent = `DEVAM ET — ${n}. GECE`;
  $('bCont').hidden = n < 2;
  $('bSix').hidden = P.maxNight < 6;
  $('bCustom').hidden = P.maxNight < 7;
}

// ---------- menü korku yüzü ----------
function scheduleScare() {
  setTimeout(() => {
    if ($('title').classList.contains('on')) {
      $('faceWrap').classList.add('snap'); $('title').classList.add('flash'); snd('neck');
      setTimeout(() => { $('faceWrap').classList.remove('snap'); $('title').classList.remove('flash'); }, 140 + Math.random() * 160);
    }
    scheduleScare();
  }, 6000 + Math.random() * 9000);
}
scheduleScare();

// ---------- belge ----------
let docNext = null;
function showDoc(id, next) {
  const d = DOCS[id]; if (!d) { next && next(); return; }
  $('paperDoc').innerHTML = d.html; docNext = next; show('doc'); snd('paper');
  persist({ night: 0, result: 'seen', doc: id });
}
$('doc').onclick = () => { if (!docNext) return; const f = docNext; docNext = null; glitchBurst(f); };

// ---------- oyun durumu ----------
let G = null, raf = 0, last = 0, night = 1, customLevels = null, quiet = false;
const ui = { doorL: false, lightL: false, flash: false, ventLight: false, monitor: false, sheet: false, cam: 'corr', cooling: false, reboot: false };
const look = { x: 209, mouse: null, keys: 0, zoom: false, drag: null };
const VIEW_SCALE = 720 / 848, PAN_MAX = 2000 * VIEW_SCALE - 1280, PAN_Y = 0;
const CAM_NAMES = { corr: 'CAM 01 — KORİDOR', autopsy: 'CAM 02 — OTOPSİ SALONU', cold: 'CAM 03 — SOĞUK ODA', ventA: 'CAM 04 — HAVALANDIRMA A', ventB: 'CAM 05 — HAVALANDIRMA B', archive: 'CAM 06 — ARŞİV', lift: 'CAM 07 — ASANSÖR' };
const CAM_SHORT = { corr: 'KORİDOR', autopsy: 'OTOPSİ', cold: 'SOĞUK', ventA: 'HAV. A', ventB: 'HAV. B', archive: 'ARŞİV', lift: 'ASANSÖR' };
const CAM_POS = { archive: [40, 44], lift: [140, 44], cold: [16, 110], autopsy: [16, 180], corr: [140, 140], ventA: [268, 90], ventB: [268, 170] };
let phone = null, itsmeCorrUntil = 0, frozen = null, camBusy = false, lastNote = '';

function startNight(n, opts = {}) {
  night = n; quiet = !!opts.quiet; customLevels = opts.levels || null;
  const go = () => {
    if (quiet) { begin(); return; }
    $('introN').textContent = n === 7 ? 'CUSTOM NIGHT' : `${n}. GECE`;
    show('intro'); setTimeout(begin, 2200);
  };
  const doc = n <= 5 && !opts.skipDoc && !quiet ? NIGHTS[n].doc : null;
  if (doc) showDoc(doc, go); else go();
}
function begin() {
  const levels = night === 7 ? customLevels : NIGHTS[night].levels;
  G = Core.createGame({ night, levels, noItsMe: quiet });
  window.__game = G;
  Object.assign(ui, { doorL: false, lightL: false, flash: false, ventLight: false, monitor: false, sheet: false, cam: 'corr', cooling: false, reboot: false });
  frozen = null; itsmeCorrUntil = 0; lastNote = ''; whisperT = 25;
  closeCam(true);
  $('game').className = 'screen on';
  show('game');
  look.x = PAN_MAX / 2; applyLook();
  try { A.morgAmbience(); } catch (e) { }
  if (!quiet) setTimeout(playPhone, 2000);
  note('Sistem hazır. Nöbet başladı.');
  last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
}
function playPhone() {
  stopPhone();
  if (!G || G.over) return;
  const src = night <= 6 ? NIGHTS[night].phone : null; if (!src) return;
  snd('phoneRing');
  phone = A.playVoice(src, 0.95);
  $('game').classList.add('ringing');
  phone.onended = phone.onerror = () => { $('game').classList.remove('ringing'); phone = null; };
}
function stopPhone() { if (phone) { try { phone.pause(); } catch (e) { } phone = null; } $('game').classList.remove('ringing'); }
$('phone').onclick = () => { snd('click'); stopPhone(); };

function input() {
  return { doorL: ui.doorL, lightL: ui.lightL, flash: ui.flash, ventLight: ui.ventLight, monitor: ui.monitor, sheet: ui.sheet,
    cam: ui.monitor ? ui.cam : null, cooling: ui.monitor && ui.cam === 'cold' && ui.cooling, reboot: ui.monitor && ui.reboot ? ui.cam : null };
}

function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!G) return;
  updateLook(dt);
  whisper(dt);
  drawGrain(dt);
  const evs = Core.step(G, dt, input());
  for (const e of evs) handle(e);
  if (!G.over) { render(); raf = requestAnimationFrame(loop); }
}

// Sayıcı aktif gecelerde havalandırmadan arada bir mırıltı / "kitapta mı" fısıltısı (zararsız, sadece atmosfer)
let whisperT = 25;
function whisper(dt) {
  if (!G || G.lv.sayici <= 0 || G.dark) return;
  whisperT -= dt;
  if (whisperT > 0) return;
  whisperT = 35 + Math.random() * 40;
  snd(Math.random() < 0.6 ? 'murmur' : 'kitapta', 0.8);
}

// ---------- olaylar ----------
function handle(e) {
  switch (e.type) {
    case 'sound': return sound(e);
    case 'move': if (e.who !== 'pasta' || e.stage < 3) note(moveNote(e)); return;
    case 'hack': frozen = { cam: e.cam, src: camSrc(e.cam), time: clock() }; note('UYARI: ' + CAM_SHORT[e.cam] + ' sinyali kararsız'); return;
    case 'unhack': frozen = null; note(CAM_SHORT[e.cam] + ' yeniden başlatıldı.'); snd('blip'); return;
    case 'phase':
      $('game').classList.toggle('sultanA', e.phase === 'approach');
      $('game').classList.toggle('sultanH', e.phase === 'here');
      return;
    case 'powerout': return powerOut();
    case 'itsme': return itsMe(e.variant);
    case 'death': return die(e.who);
    case 'win': return win();
  }
}
function moveNote(e) {
  const where = { autopsy: 'OTOPSİ', corr: 'KORİDOR', archive: 'ARŞİV', lift: 'ASANSÖR', door: 'SOL KAPI', cold: 'SOĞUK ODA', ventA: 'HAV. A', ventB: 'HAV. B', mouth: 'HAVALANDIRMA ÇIKIŞI', end: 'KORİDOR' }[e.to] || e.to;
  return 'Hareket algılandı: ' + where;
}
function sound(e) {
  const p = PAN[e.from] ?? 0;
  switch (e.id) {
    case 'step': case 'retreat': return snd('step', p);
    case 'knock': return snd('knock', p);
    case 'drag': return snd('drag', p);
    case 'say4': case 'say5': case 'say6': return snd('say', +e.id[3], !!e.fake);
    default: return snd(e.id); // miyav, rattle, drawer, motor
  }
}
function note(t) { if (t === lastNote) return; lastNote = t; $('camNote').textContent = t; }
function toast(t, ms = 2200) { const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), ms); }

function itsMe(v) {
  persist({ night, result: v === 'crash' ? 'itsme' : 'seen', itsme: v, itsmeSeen: true });
  if (v === 'cam') { $('feedBox').classList.add('itsme'); snd('static'); setTimeout(() => $('feedBox').classList.remove('itsme'), 1000); }
  if (v === 'corr') itsmeCorrUntil = G.t + 6;
  if (v === 'crash') {
    stopPhone(); closeCam(true);
    $('scareImg').src = 'img/scare/itsme.png'; show('scare'); A.stopMusic && A.stopMusic(0); snd('static');
    setTimeout(() => { show('crash'); setTimeout(() => { refreshMenu(); show('title'); }, 2200); }, 1500);
  }
}
function powerOut() {
  stopPhone(); closeCam(true); Object.assign(ui, { lightL: false, flash: false, ventLight: false, monitor: false, cooling: false, reboot: false });
  $('game').classList.add('dark'); snd('powerdown'); setTimeout(() => snd('darkTune'), 1500);
}
const WHY = {
  pasta: 'Koridordaki şeyi ışıkla tut. Işıktan hoşlanmaz. Ayak seslerini duyunca feneri yak.',
  avukat: 'Kapıda biri vardı. Ayak sesi duyunca kapı ışığını yak; görürsen kapıyı kapat.',
  sahil: 'Havalandırmadan ıslak bir ses geldiyse ışıkla bak. Oradaysa örtüyü çek ve gidene kadar kıpırdama.',
  sayici: '"Beş"i duyduğunda örtünün altında olmalıydın. Altıya kadar saydı.',
  muh: 'Donmuş bir kamera fark etmedin. Saat ilerlemiyorsa o kamerayı yeniden başlat.',
  arda: 'Duyduğun her ses gerçek değildi. Sonundaki bozuk miyavı dinle ve tepki verme.',
  sultan: 'Motor sesini duyunca her şeyi kapat: monitör, ışıklar, fener. Karanlıkta bekle.',
  denek5: '5 numaralı çekmece ısındı. Soğuk oda kamerasında SOĞUT\'a basılı tut.',
  powerout: 'Jeneratör bitti. Karanlıkta 5 numaralı çekmece açıldı.',
};
function die(who) {
  cancelAnimationFrame(raf); stopPhone(); closeCam(true);
  const img = who === 'powerout' ? 'denek5' : who;
  $('scareImg').src = `img/scare/${img}.png`;
  show('scare'); snd('scream'); if (who === 'sayici') snd('sayScare'); $('stage').classList.add('shakeAll');
  setTimeout(() => { $('stage').classList.remove('shakeAll'); $('overWhy').textContent = WHY[who] || ''; show('over'); }, 1700);
}
function win() {
  cancelAnimationFrame(raf); stopPhone(); closeCam(true);
  show('six'); $('sixClock').textContent = '5 AM'; $('sixMsg').textContent = ''; $('bNext').style.visibility = 'hidden';
  setTimeout(() => { $('sixClock').textContent = '6 AM'; snd('chime'); }, 1600);
  persist({ night, result: 'win', levels: night === 7 ? customLevels : undefined });
  const msg = night === 5 ? 'Sabah oldu. Ama telefonda yeni bir mesaj var.' : night === 6 ? 'Custom Night açıldı.' :
    night === 7 ? (Object.values(customLevels).every(v => v === 20) ? '20/20. Arşive bir şey eklendi.' : 'Hayatta kaldın.') : 'Hayatta kaldın. Şimdilik.';
  setTimeout(() => { $('sixMsg').textContent = msg; $('bNext').style.visibility = 'visible'; }, 3200);
}
$('bNext').onclick = () => {
  if (night === 5) return ending();
  if (night >= 6) { refreshMenu(); show('title'); return; }
  startNight(night + 1);
};
function ending() {
  show('ending'); $('ending').classList.remove('show');
  $('endTxt').innerHTML = 'Proje 4-5-6 — Denek 6: tamamlandı.<br>Sabah aynaya baktığında gözlerin simsiyahtı.';
  endVoice = A.playVoice('voice/phone6_secret.mp3');
  setTimeout(() => $('ending').classList.add('show'), 300);
  persist({ night: 5, result: 'seen', doc: 'doc5' });
}
$('bRetry').onclick = () => startNight(night, { skipDoc: true, levels: customLevels });
let endVoice = null;
$('bMenu1').onclick = $('bMenu2').onclick = () => { if (endVoice) { endVoice.pause(); endVoice = null; } refreshMenu(); show('title'); };

// ---------- ofis versiyonları: varsa düz katmanların yerine kullanılır ----------
const VARIANTS = ['door_lit', 'door_avukat', 'door_closed', 'vent_lit', 'vent_sahil', 'corr_lit', 'corr_pasta1', 'corr_pasta2', 'corr_pasta3', 'corr_sultan', 'corr_itsme'];
const haveVar = new Set();
VARIANTS.forEach(v => { const i = new Image(); i.onload = () => haveVar.add(v); i.src = `img/office_v/${v}.png`; });
// istenen versiyon yoksa null döner ve eski katman kullanılır
function useVar(el, cls, name) {
  const ok = name && haveVar.has(name);
  if (ok) setSrc(el, `img/office_v/${name}.png`);
  el.classList.toggle('on', !!ok);
  $('game').classList.toggle(cls, !!ok || (name === null && [...haveVar].some(v => v.startsWith(cls.slice(1)))));
}

// ---------- çizim ----------
function clock() { const h = Math.floor(G.t / (Core.PARAMS.NIGHT_SEC / 6)); return h === 0 ? 12 : h; }
function camSrc(cam) {
  const g = G, v = {
    corr: g.pasta.stage === 1 || g.pasta.stage === 2 ? 'corr_pasta' : 'corr',
    autopsy: g.pasta.stage === 0 && g.lv.pasta > 0 && g.t > 8 ? 'autopsy_pasta' : 'autopsy',
    cold: g.denek5.open ? 'cold_open' : g.denek5.temp >= 70 ? 'cold_hot' : 'cold',
    ventA: g.sahil.stage === 1 ? 'ventA_sahil' : 'ventA',
    ventB: g.sahil.stage === 2 ? 'ventB_sahil' : 'ventB',
    archive: g.avukat.pos === 'archive' && !g.avukat.at && g.lv.avukat > 0 ? 'archive_avukat' : 'archive',
    lift: g.sultan.phase === 'approach' ? 'lift_sultan' : g.avukat.pos === 'lift' ? 'lift_avukat' : 'lift',
  }[cam];
  return `img/cam/${v}.png`;
}
function render() {
  const g = G, d = g.dev, c = $('game').classList;
  c.toggle('doorL', d.doorL); c.toggle('lightL', d.lightL); c.toggle('flash', d.flash); c.toggle('ventLight', d.ventLight);
  c.toggle('sheet', d.sheet); c.toggle('cam-mode', ui.monitor && !d.sheet);
  if (d.sheet && ui.monitor) { ui.monitor = false; closeCam(); }
  // koridor
  let corr = 'img/corr/lit.png';
  if (g.pasta.stage === 3) corr = 'img/corr/pasta3.png';
  else if (g.pasta.stage === 2) corr = 'img/corr/pasta2.png';
  else if (g.pasta.stage === 1) corr = 'img/corr/pasta1.png';
  if (g.sultan.phase === 'here') corr = 'img/corr/sultan.png';
  if (itsmeCorrUntil > g.t) corr = 'img/itsme_photo.png';
  setSrc($('corrImg'), corr);
  setSrc($('dwImg'), g.avukat.at ? 'img/doorway/avukat.png' : 'img/doorway/empty.png');
  setSrc($('ventImg'), g.sahil.stage === 3 ? 'img/vent/sahil.png' : 'img/vent/empty.png');
  const corrVar = g.sultan.phase === 'here' ? 'corr_sultan' : !d.flash ? null : itsmeCorrUntil > g.t ? 'corr_itsme' : g.pasta.stage ? 'corr_pasta' + g.pasta.stage : 'corr_lit';
  useVar($('vCorr'), 'vcorr', corrVar);
  // kapalı kapı ayrı katman (#vDoorC): CSS ile menteşesinden dönerek kapanır
  $('game').classList.toggle('vdoorc', haveVar.has('door_closed'));
  useVar($('vDoor'), 'vdoor', d.doorL ? null : d.lightL ? (g.avukat.at ? 'door_avukat' : 'door_lit') : null);
  useVar($('vVent'), 'vvent', d.ventLight ? (g.sahil.stage === 3 ? 'vent_sahil' : 'vent_lit') : null);
  // masa
  const h = clock();
  const clk = `${h}:${String(Math.floor((g.t % 50) / 50 * 60)).padStart(2, '0')} AM`;
  $('monClock').textContent = clk; $('camClock').textContent = clk;
  $('tPower').textContent = `%${Math.ceil(g.power)}`;
  $('pscreen').classList.toggle('low', g.power < 20);
  const u = Core.usage(g), n = Math.min(6, Math.round(u / 0.12));
  $('tUsage').innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="${i < n ? (i >= 4 ? 'hot' : 'on') : ''}"></i>`).join('');
  $('camTimeR').textContent = `${h} AM  │  JEN %${Math.ceil(g.power)}`;
  if (ui.monitor) renderCam();
}
function renderCam() {
  const g = G, cam = ui.cam, fb = $('feedBox');
  $('camName').textContent = CAM_NAMES[cam];
  const hacked = frozen && frozen.cam === cam;
  setSrc($('feedImg'), hacked ? frozen.src : camSrc(cam));
  fb.classList.toggle('frozen', !!hacked);
  fb.classList.toggle('blind', !!g.dev.camBlind);
  fb.classList.toggle('cold', cam === 'cold');
  $('stamp').textContent = `${hacked ? frozen.time : clock()}:${hacked ? '00' : String(Math.floor(g.t * 7) % 60).padStart(2, '0')} AM  ${CAM_SHORT[cam]}`;
  $('d5').style.opacity = hacked && Math.random() < 0.04 ? 1 : 0;
  const temp = Core.shownTemp(g);
  $('tempFill').style.width = Math.min(100, temp) + '%';
  $('tempTxt').textContent = Math.round(temp) + '°';
  $('coldPanel').classList.toggle('hot', temp >= 70);
  $('bCool').classList.toggle('on', !!g.dev.cooling);
  $('rebootBar').style.width = (g.muh.cam === cam && g.dev.reboot ? Math.min(1, g.muh.rebootT / Core.PARAMS.MUH_REBOOT) * 100 : 0) + '%';
  document.querySelectorAll('#map button').forEach(b => b.classList.toggle('sel', b.dataset.cam === cam));
  $('camPow').textContent = `JENERATÖR %${Math.ceil(g.power)}`;
  drawStatic();
}
const sctx = $('static').getContext('2d'), sImg = sctx.createImageData(320, 180);
// bütün ofise ortak film greni: ek katmanlar ile fotoğraf aynı dokuda görünsün
const grainCtx = $('grain').getContext('2d'), grainImg = grainCtx.createImageData(320, 180);
let grainT = 0;
function drawGrain(dt) { grainT -= dt; if (grainT > 0) return; grainT = 0.06; const d = grainImg.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } grainCtx.putImageData(grainImg, 0, 0); }
function drawStatic() { const d = sImg.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } sctx.putImageData(sImg, 0, 0); }

// ---------- perspektif: düz bir dikdörtgeni ofis görselindeki dört köşeye oturt ----------
// (0,0)(w,0)(w,h)(0,h) -> p[0..3] eşleyen homografiyi CSS matrix3d olarak döndürür.
function quadMatrix(w, h, p) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = p;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den, k = (dx1 * sy - sx * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
  // birim kareden quad'a; sonra w,h ile ölçekle
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.map(v => +v.toFixed(8)).join(',')})`;
}
const QUADS = {
  dwL: { w: 320, h: 750, p: [[402, 82], [570, 160], [572, 672], [404, 664]] },
  vent: { w: 600, h: 440, p: [[1656, 522], [1952, 575], [1945, 812], [1658, 715]] },
  pscreen: { w: 400, h: 300, p: [[91, 254], [307, 275], [306, 450], [94, 472]] },     // duvardaki MIRIKVISION ekranı
  mon: { w: 400, h: 300, p: [[674, 530], [848, 520], [850, 658], [678, 676]] },        // masadaki monitörün camı
};
for (const [id, q] of Object.entries(QUADS)) $(id).style.transform = quadMatrix(q.w, q.h, q.p);

// ---------- bakış ----------
function stageX(cx) { const r = stage.getBoundingClientRect(); return (cx - r.left) / r.width * 1280; }
addEventListener('mousemove', e => { look.mouse = stageX(e.clientX); });
document.addEventListener('mouseleave', () => { look.mouse = null; });
$('office').addEventListener('touchstart', e => { look.drag = stageX(e.touches[0].clientX); look.mouse = null; }, { passive: true });
$('office').addEventListener('touchmove', e => { const x = stageX(e.touches[0].clientX); if (look.drag != null) { look.x = Math.max(0, Math.min(PAN_MAX, look.x - (x - look.drag) * 1.1)); look.drag = x; applyLook(); } }, { passive: true });
$('office').addEventListener('touchend', () => { look.drag = null; });
function applyLook() {
  if (look.zoom) return;
  $('view').style.transform = `translate(${-look.x}px, ${PAN_Y}px) scale(${VIEW_SCALE})`;
  $('edgeL').style.opacity = look.x > 5 ? 1 : 0; $('edgeR').style.opacity = look.x < PAN_MAX - 5 ? 1 : 0;
}
function updateLook(dt) {
  let v = 0;
  if (look.mouse != null && !ui.monitor) {
    const L = 1280 * 0.25, R = 1280 * 0.75;
    if (look.mouse < L) v = -Math.pow(1 - look.mouse / L, 1.3);
    else if (look.mouse > R) v = Math.pow((look.mouse - R) / (1280 - R), 1.3);
  }
  if (look.keys) v = look.keys;
  if (v) { look.x = Math.max(0, Math.min(PAN_MAX, look.x + v * 820 * dt)); applyLook(); }
}

// ---------- monitör (1. oyundaki CRT geçişi) ----------
// Monitör: kamera masadaki gerçek monitöre yakınlaşır, kamera arayüzü o monitörün camına perspektifle oturur.
const MON_GLASS = QUADS.mon.p;                     // masadaki monitörün camı (ofis görseli koordinatı)
const MON = { x: 762, y: 600 }, ZOOM = 4.4;        // camın merkezi ve yakınlaşma
function zoomTransform() { return `translate(${640 - MON.x * ZOOM}px, ${360 - MON.y * ZOOM}px) scale(${ZOOM})`; }
// cam köşelerini yakınlaşmış sahnede ekrana çevir, kamera arayüzünü (808×632) oraya oturt
$('screenWrap').style.transform = quadMatrix(808, 632, MON_GLASS.map(([x, y]) => [640 + (x - MON.x) * ZOOM, 360 + (y - MON.y) * ZOOM]));
function openCam() {
  if (!G || G.over || G.dark || camBusy || ui.monitor || ui.sheet) return;
  camBusy = true; ui.monitor = true; ui.lightL = ui.flash = ui.ventLight = false; snd('camOpen');
  const v = $('view'), c = $('cam'), ease = 'cubic-bezier(.22,1,.36,1)';
  c.classList.add('on'); c.style.transition = 'none'; c.style.opacity = '0';
  renderCam(); void c.offsetWidth;
  look.zoom = true; $('game').classList.add('cam-mode');
  v.style.transition = `transform .5s ${ease}, filter .5s`; v.style.transform = zoomTransform();
  c.style.transition = 'opacity .18s ease-out .3s'; c.style.opacity = '1';
  clearTimeout(camTimer); camTimer = setTimeout(() => { snd('blip'); camBusy = false; }, 500);
}
function closeCam(silent) {
  const c = $('cam'), v = $('view');
  ui.monitor = false; ui.cooling = false; ui.reboot = false;
  if (silent || !c.classList.contains('on')) {
    clearTimeout(camTimer); camBusy = false; c.classList.remove('on', 'booting'); c.style.transition = 'none'; c.style.opacity = '';
    look.zoom = false; v.style.transition = 'none'; applyLook(); $('game').classList.remove('cam-mode'); return;
  }
  camBusy = true; snd('camClose');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  c.style.transition = 'opacity .12s ease-in'; c.style.opacity = '0';
  look.zoom = false; $('game').classList.remove('cam-mode');
  v.style.transition = `transform .44s ${ease} .06s, filter .4s`; applyLook();
  clearTimeout(camTimer); camTimer = setTimeout(() => { c.classList.remove('on'); c.style.transition = 'none'; c.style.opacity = ''; v.style.transition = 'none'; camBusy = false; }, 500);
}
let camTimer = 0;
// Animasyon sürerken gelen geçişler yok sayılır: monitörün açık/kapalı hali ekrandakiyle hep aynı kalır.
function toggleMonitor() { if (camBusy) return; if (ui.monitor) closeCam(); else openCam(); }
function toggleSheet() {
  if (!G || G.over) return;
  if (!ui.sheet && ui.monitor) closeCam(true);
  ui.sheet = !ui.sheet; snd('sheet');
}
function selCam(cam) { if (ui.cam === cam) return; ui.cam = cam; ui.reboot = false; snd('blip'); $('static').style.opacity = 1; setTimeout(() => $('static').style.opacity = '', 160); }

// harita düğmeleri
$('map').insertAdjacentHTML('beforeend', Core.CAMS.map(c => `<button data-cam="${c}" style="left:${CAM_POS[c][0]}px;top:${CAM_POS[c][1]}px">${CAM_SHORT[c]}</button>`).join(''));
document.querySelectorAll('#map button').forEach(b => b.onclick = () => selCam(b.dataset.cam));

// ---------- kontroller ----------
function hold(el, key) {
  const on = e => { e.preventDefault(); if (G && !G.over) { ui[key] = true; if (key === 'flash') snd('flashClick'); if (key === 'reboot') snd('reboot'); if (key === 'lightL' || key === 'ventLight') snd('light', true, key === 'lightL' ? -1 : 1); } };
  const off = () => { if (ui[key]) { ui[key] = false; if (key !== 'flash' && key !== 'cooling' && key !== 'reboot') snd('light', false); } };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointerleave', off); el.addEventListener('pointercancel', off);
}
hold($('corrHit'), 'flash'); hold($('bLight'), 'lightL'); hold($('ventBtn'), 'ventLight'); hold($('bCool'), 'cooling'); hold($('bReboot'), 'reboot');
$('bDoor').onclick = () => {
  if (!G || G.over || G.dark) return;
  ui.doorL = !ui.doorL; snd('door', -1, ui.doorL);
  if (ui.doorL) setTimeout(() => { stage.classList.add('slam'); setTimeout(() => stage.classList.remove('slam'), 200); }, 190);
};
$('barMon').addEventListener('mouseenter', toggleMonitor); $('barMon').addEventListener('click', e => { if (e.pointerType !== 'mouse') toggleMonitor(); });
$('barSheet').addEventListener('mouseenter', toggleSheet); $('barSheet').addEventListener('click', e => { if (e.pointerType !== 'mouse') toggleSheet(); });
$('camClose').onclick = () => closeCam();
$('mon').addEventListener('click', () => { if (!ui.monitor) toggleMonitor(); }); // masadaki monitöre tıklayınca kameralar açılır
const HOLD_KEYS = { f: 'flash', a: 'lightL', v: 'ventLight', c: 'cooling', r: 'reboot' };
addEventListener('keydown', e => {
  if (!G || G.over || !$('game').classList.contains('on')) return;
  const k = e.key.toLowerCase();
  if (HOLD_KEYS[k]) { if (!e.repeat) { ui[HOLD_KEYS[k]] = true; if (k === 'f') snd('flashClick'); if (k === 'r') snd('reboot'); if (k === 'a' || k === 'v') snd('light', true, k === 'a' ? -1 : 1); } return; }
  if (e.repeat) return;
  if (k === 'q') $('bDoor').onclick();
  if (k === ' ' || k === 'tab') { e.preventDefault(); toggleMonitor(); }
  if (k === 's') toggleSheet();
  if (k >= '1' && k <= '7' && ui.monitor) selCam(Core.CAMS[+k - 1]);
  if (e.key === 'Escape' && ui.monitor) closeCam();
  if (e.key === 'ArrowLeft') { look.keys = -1; e.preventDefault(); } if (e.key === 'ArrowRight') { look.keys = 1; e.preventDefault(); }
});
// Pencere odağı kaybedince basılı tuşlar takılı kalmasın
function releaseHolds() { for (const k of Object.values(HOLD_KEYS)) ui[k] = false; look.keys = 0; }
addEventListener('blur', releaseHolds);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseHolds(); });
addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (HOLD_KEYS[k]) { ui[HOLD_KEYS[k]] = false; if (k === 'a' || k === 'v') snd('light', false); }
  if (e.key === 'ArrowLeft' && look.keys < 0) look.keys = 0; if (e.key === 'ArrowRight' && look.keys > 0) look.keys = 0;
});

// ---------- lamba titremesi ----------
function setLamp(v) { $('game').style.setProperty('--lamp', v); }
(function lampFlicker() {
  setTimeout(() => {
    if (G && !G.over && !G.dark && $('game').classList.contains('on')) {
      const seq = Math.random() < .5 ? [[.25, 60], [1, 90], [.4, 50], [1, 0]] : [[.55, 40], [1, 120], [.2, 80], [.8, 60], [1, 0]];
      let t = 0; snd('flicker');
      seq.forEach(([v, d]) => { setTimeout(() => { if (G && !G.dark) setLamp(v); }, t); t += d; });
    }
    lampFlicker();
  }, 3000 + Math.random() * 8000);
})();

// ---------- menü ----------
$('bNew').onclick = () => { P = Save.newGame(P); Save.save(P); refreshMenu(); startNight(1); };
$('bCont').onclick = () => startNight(P.night || 1);
$('bSix').onclick = () => startNight(6);
$('bCustom').onclick = () => { renderCustom(); show('custom'); };
$('bArchive').onclick = () => { renderArchive(); show('archive'); };
$('bArcBack').onclick = $('bCusBack').onclick = () => show('title');

function renderArchive() {
  const items = ['doc1', 'doc2', 'doc3', 'doc4', 'doc5'].map(id => P.docs.includes(id)
    ? `<div class="arc" data-doc="${id}"><b>${DOCS[id].title}</b>Okumak için tıkla</div>`
    : `<div class="arc lock"><b>???</b>Henüz bulunmadı</div>`);
  items.push(P.itsme.length ? `<div class="arc"><b>IT'S ME</b>Gördüğün: ${P.itsme.length} / 3</div>` : `<div class="arc lock"><b>???</b>Bazen gece bir şey görürsün.</div>`);
  items.push(P.custom2020 ? `<div class="arc" data-doc="secret"><b>${DOCS.secret.title}</b>20/20 ödülü</div>` : `<div class="arc lock"><b>20/20</b>Custom Night'ta herkesi 20 yap ve hayatta kal.</div>`);
  $('arcList').innerHTML = items.join('');
  document.querySelectorAll('#arcList [data-doc]').forEach(el => el.onclick = () => showDoc(el.dataset.doc, () => { renderArchive(); show('archive'); }));
}
const CNAME = { pasta: 'PASTA', avukat: 'AVUKAT', sahil: 'SAHİL', sayici: 'SAYICI', muh: 'MÜHENDİS', arda: 'ARDA BAZ', sultan: 'SULTAN', denek5: 'DENEK 5' };
let cLv = { pasta: 5, avukat: 5, sahil: 5, sayici: 5, muh: 5, arda: 5, sultan: 5, denek5: 5 };
function renderCustom() {
  $('ccards').innerHTML = Core.CHARS.map(c => `<div class="cc"><div class="pic" style="background-image:url(img/scare/${c}.png)"></div><b>${CNAME[c]}</b><div class="lv"><button data-c="${c}" data-d="-1">‹</button><span>${cLv[c]}</span><button data-c="${c}" data-d="1">›</button></div></div>`).join('');
  document.querySelectorAll('#ccards button').forEach(b => b.onclick = () => { cLv[b.dataset.c] = Math.max(0, Math.min(20, cLv[b.dataset.c] + +b.dataset.d)); snd('tick'); renderCustom(); });
}
document.querySelectorAll('#cpresets button').forEach(b => b.onclick = () => {
  const p = b.dataset.p;
  for (const c of Core.CHARS) cLv[c] = p === 'easy' ? 5 : p === 'max' ? 20 : NIGHTS[6].levels[c];
  snd('blip'); renderCustom();
});
$('cStart').onclick = () => startNight(7, { levels: { ...cLv } });

// menü düğmeleri: üzerine gelince ses, tıklayınca parazit
document.querySelectorAll('#menu button, .back, .big-btn, #cStart').forEach(b => {
  b.addEventListener('mouseenter', () => snd('hover'));
  const orig = b.onclick; if (!orig) return;
  b.onclick = e => { if (b.dataset.busy) return; b.dataset.busy = 1; glitchBurst(() => { delete b.dataset.busy; orig.call(b, e); }); };
});
function muteLabel() { $('mute').textContent = A.muted ? '🔇 SES KAPALI' : '🔊 SES'; }
$('mute').onclick = e => { e.stopPropagation(); A.init(); A.setMuted(!A.muted); muteLabel(); };
muteLabel();
new MutationObserver(() => { for (const n of [...document.body.children]) if (n.id !== 'stage' && n.tagName !== 'SCRIPT') n.remove(); }).observe(document.body, { childList: true });

// ---------- ön yükleme ----------
let ready = false;
$('splash').onclick = () => { if (!ready) return; A.init(); try { A.playMenuMusic(); } catch (e) { } glitchBurst(() => { refreshMenu(); show('title'); }); };
(function preload() {
  const imgs = ['office', 'door', 'panel', 'sheet', 'menu_face', 'menu_face_scary', 'doc/paper', 'ending', 'itsme_photo', 'ui/monitor', 'office_v/door_closed',
    'corr/empty', 'corr/lit', 'corr/pasta1', 'corr/pasta2', 'corr/pasta3', 'corr/sultan', 'vent/empty', 'vent/sahil', 'doorway/empty', 'doorway/avukat',
    ...['corr', 'corr_pasta', 'autopsy', 'autopsy_pasta', 'cold', 'cold_hot', 'cold_open', 'ventA', 'ventA_sahil', 'ventB', 'ventB_sahil', 'archive', 'archive_avukat', 'lift', 'lift_avukat', 'lift_sultan'].map(c => 'cam/' + c),
    ...Core.CHARS.concat('itsme').map(c => 'scare/' + c)].map(s => `img/${s}.png`);
  const keep = window.__preloaded = []; let done = 0; const total = imgs.length + 1;
  const tick = () => { done++; $('splashTxt').textContent = `YÜKLENİYOR... %${Math.round(done / total * 100)}`; if (done >= total) finish(); };
  const finish = () => { if (ready) return; ready = true; window.__m5g.ready = true; $('splashTxt').textContent = '[ BAŞLAMAK İÇİN TIKLA ]'; };
  imgs.forEach(src => { const i = new Image(); keep.push(i); i.onload = i.onerror = tick; i.src = src; });
  Promise.resolve(A.loadSamples ? A.loadSamples() : null).catch(() => { }).then(tick);
  setTimeout(finish, 15000);
})();
const unlock = () => { try { A.init(); } catch (e) { } removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true); };
addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);

// test kancası
window.__m5g = Object.assign(window.__m5g || {}, { startNight, get G() { return G; }, save: () => P, show });
