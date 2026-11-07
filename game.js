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
// görsel adreslerine sürüm eklenir: güncellemeden sonra tarayıcı eski görseli önbellekten getirmesin
const ASSET_V = '20261108q';
const av = u => /^img\//.test(u) && !u.includes('?') ? u + '?v=' + ASSET_V : u;
function setSrc(img, src) { if (img.dataset.want !== src) { img.dataset.want = src; img.src = av(src); } }

// ---------- ses ----------
const A = Audio5; // audio.js global (const, window özelliği değil)
const sfx = A.sfx;
function snd(name, ...a) { try { A.init(); if (sfx[name]) sfx[name](...a); } catch (e) { } }
const PAN = { door: -1, corr: 0, vent: 1, cold: -0.3 };

// ---------- ekranlar ----------
const MUSIC = ['splash', 'title', 'archive', 'custom', 'over'];
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  $('mute').style.display = ['splash', 'title'].includes(id) ? '' : 'none';
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
  $('bCont').textContent = `DEVAM ET · ${n}. GECE`;
  $('bCont').hidden = n < 2;
  $('bSix').hidden = P.maxNight < 6;
  $('bCustom').hidden = P.maxNight < 7;
}

// menü: kayıt saati akar
setInterval(() => { if (!$('title').classList.contains('on')) return; const d = new Date(), sec = String(d.getSeconds()).padStart(2, '0'); $('vts').innerHTML = `14.06.1998 &nbsp;03:12:${sec}`; }, 1000);
// menü: ▲▼ ile gezin
addEventListener('keydown', e => {
  if (!$('title').classList.contains('on') || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
  const bs = [...document.querySelectorAll('#menu button')].filter(b => !b.hidden), i = bs.indexOf(document.activeElement);
  bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus(); snd('hover'); e.preventDefault();
});

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
const ui = { doorL: false, lightL: false, flash: false, ventLight: false, monitor: false, sheet: false, cam: 'corr', cooling: false, reboot: false,
  app: 'cctv', loading: false, fixing: false, fixCam: 'corr', fixT: 0, fixMsg: '' };
const look = { x: 209, mouse: null, keys: 0, zoom: false, drag: null };
const VIEW_SCALE = 720 / 848, PAN_MAX = 2000 * VIEW_SCALE - 1280, PAN_Y = 0;
const CAM_NAMES = { corr: 'CAM 01 — KORİDOR', autopsy: 'CAM 02 — OTOPSİ SALONU', cold: 'CAM 03 — SOĞUK ODA', ventA: 'CAM 04 — HAVALANDIRMA A', ventB: 'CAM 05 — HAVALANDIRMA B', archive: 'CAM 06 — ARŞİV', lift: 'CAM 07 — ASANSÖR', wash: 'CAM 08 — YIKAMA ODASI' };
const CAM_SHORT = { corr: 'KORİDOR', autopsy: 'OTOPSİ', cold: 'SOĞUK', ventA: 'HAV. A', ventB: 'HAV. B', archive: 'ARŞİV', lift: 'ASANSÖR', wash: 'YIKAMA' };
// Kat planı: oda merkezleri (348×286 harita). Koridor çizgileri merkezden merkeze, dik açılı.
const MAP_C = { archive: [64, 66], lift: [174, 66], cold: [64, 130], wash: [174, 130], ventA: [284, 130], autopsy: [64, 196], corr: [174, 196], ventB: [284, 196], you: [174, 254] };
const MAP_LINKS = [['archive', 'lift'], ['lift', 'wash'], ['wash', 'corr'], ['cold', 'autopsy'], ['autopsy', 'corr'], ['corr', 'you'], ['cold', 'wash'], ['wash', 'ventA'], ['ventA', 'ventB'], ['ventB', 'you', 'v']];
const CAM_POS = Object.fromEntries(Object.entries(MAP_C).map(([k, [x, y]]) => [k, [x - 38, y - 14]]));
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
  Object.assign(ui, { doorL: false, lightL: false, flash: false, ventLight: false, monitor: false, sheet: false, cam: 'corr', cooling: false, reboot: false,
    app: 'cctv', loading: false, fixing: false, fixCam: 'corr', fixT: 0, fixMsg: 'Onarmak istediğiniz kamerayı seçin.' });
  wm.open = []; wm.min.clear(); wm.z = []; wm.active = null; closeStart(); pcStack.length = 0; renderPc();
  document.querySelectorAll('.win').forEach(w => { w.style.left = ''; w.style.top = ''; });
  frozen = null; itsmeCorrUntil = 0; lastNote = ''; whisperT = 25; itsmePop = { t: nextPop(true), due: 0 };
  closeCam(true);
  $('game').className = 'screen on';
  show('game');
  look.x = PAN_MAX / 2; applyLook();
  try { A.morgAmbience(); } catch (e) { }
  if (!quiet) setTimeout(playPhone, 2000);
  note('Sistem hazır. Nöbet başladı.');
  last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
}
// Telefon: iki kez çalar, ahize kalkar (tık), sonra kayıt başlar. Telefona tıklamak her aşamada susturur.
let phoneTimers = [];
function playPhone() {
  stopPhone();
  if (!G || G.over) return;
  const src = night <= 6 ? NIGHTS[night].phone : null; if (!src) return;
  $('game').classList.add('ringing');
  const at = (ms, f) => phoneTimers.push(setTimeout(() => { if (G && !G.over) f(); }, ms));
  snd('phoneRing'); at(3800, () => snd('phoneRing'));
  at(7300, () => {
    snd('click');
    phone = A.playVoice(src, 0.95);
    phone.onended = phone.onerror = () => { $('game').classList.remove('ringing'); phone = null; };
  });
}
function stopPhone() {
  phoneTimers.forEach(clearTimeout); phoneTimers = [];
  if (phone) { try { phone.pause(); } catch (e) { } phone = null; } $('game').classList.remove('ringing');
}
$('phone').onclick = () => { snd('click'); stopPhone(); };

function input() {
  return { doorL: ui.doorL, lightL: ui.lightL, flash: ui.flash, ventLight: ui.ventLight, monitor: ui.monitor, sheet: ui.sheet,
    cam: ui.monitor && cctvOn() ? ui.cam : null, cooling: ui.monitor && cctvOn() && ui.cam === 'cold' && ui.cooling,
    reboot: ui.monitor && ui.fixing ? ui.fixCam : null };
}

function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!G) return;
  updateLook(dt);
  whisper(dt);
  itsmePopTick(dt);
  fixTick(dt);
  drawGrain(dt);
  const evs = Core.step(G, dt, input());
  for (const e of evs) handle(e);
  if (!G.over) { render(); raf = requestAnimationFrame(loop); }
}

// Monitörde arada bir "IT'S ME" hata penceresi: 2. geceden itibaren, gece ilerledikçe sıklaşır.
// Zararsız ama kameraları kapatır; kapatınca gider. Monitör kapalıyken sırası gelirse monitör açılınca biraz sonra çıkar.
let itsmePop = { t: 999, due: 0 };
function nextPop(first) { const n = night === 7 ? 5 : night; return (first ? 45 : 0) + (70 + Math.random() * 110) / (1 + 0.3 * (n - 2)); }
function itsmePopTick(dt) {
  if (quiet || night < 2 || G.over) return;
  if (itsmePop.due > 0) {
    if (!ui.monitor || camBusy) return;
    itsmePop.due -= dt; if (itsmePop.due > 0) return;
    itsmePop.due = 0; itsmePop.t = nextPop();
    if (wm.open.includes('itsme')) return;
    const w = $('winItsme'); w.style.left = (60 + Math.random() * 380) + 'px'; w.style.top = (60 + Math.random() * 300) + 'px';
    snd('static'); openApp('itsme');
    return;
  }
  itsmePop.t -= dt;
  if (itsmePop.t <= 0) itsmePop.due = ui.monitor ? 0.05 : 0.4 + Math.random() * 1.2;
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
    case 'lightout': snd('flicker'); flick[e.light] = { t0: performance.now(), was: e.was }; setTimeout(() => snd('light', false), FLICK_MS); return;
    case 'powerout': return powerOut();
    case 'itsme': return itsMe(e.variant);
    case 'death': return die(e.who);
    case 'win': return win();
  }
}
function moveNote(e) {
  const where = { autopsy: 'OTOPSİ', corr: 'KORİDOR', archive: 'ARŞİV', lift: 'ASANSÖR', door: 'SOL KAPI', cold: 'SOĞUK ODA', wash: 'YIKAMA ODASI', ventA: 'HAV. A', ventB: 'HAV. B', mouth: 'HAVALANDIRMA ÇIKIŞI', end: 'KORİDOR' }[e.to] || e.to;
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
    stopPhone(); closeCam(true); snd('breathing', false);
    $('scareImg').src = av('img/scare/itsme.png'); show('scare'); A.stopMusic && A.stopMusic(0); snd('static');
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
  cancelAnimationFrame(raf); stopPhone(); closeCam(true); snd('breathing', false);
  const img = who === 'powerout' ? 'denek5' : who;
  $('scareImg').src = av(`img/scare/${img}.png`);
  show('scare'); snd('scream'); if (who === 'sayici') snd('sayScare'); $('scare').classList.add('shakeAll');
  // jumpscare -> parazitle bozulup yavaşça kararır -> "Öldün" ekranı karanlıktan belirir
  setTimeout(() => { $('scare').classList.remove('shakeAll'); $('scare').classList.add('dying'); snd('static'); }, 1500);
  setTimeout(() => {
    $('scare').classList.remove('dying'); $('overWhy').textContent = WHY[who] || '';
    show('over'); $('over').classList.remove('rise'); void $('over').offsetWidth; $('over').classList.add('rise');
  }, 3300);
}
function win() {
  cancelAnimationFrame(raf); stopPhone(); closeCam(true); snd('breathing', false);
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
// Versiyonlar (tools/variants.py): sadece değişen bölgeye kırpılmış WebP + variants.json konumları.
// Hepsi açılışta yüklenip çözülür; oyunda sadece görünürlükleri değişir (ilk basışta takılma olmaz).
const haveVar = new Set(), varImg = {};
const variantsReady = fetch(av('img/office_v/variants.json')).then(r => r.ok ? r.json() : {}).catch(() => ({})).then(man => Promise.all(Object.entries(man).map(([name, [x, y, w, h]]) => {
  const img = new Image(); img.alt = ''; img.className = 'vimg'; img.id = 'v_' + name;
  Object.assign(img.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  if (name === 'door_shutter') { img.id = 'vDoorS'; img.className = ''; $('doorClip').appendChild(img); } // kepenk hep görünür, CSS kaydırır
  else $('view').querySelector('.bg').after(img);
  img.src = av(`img/office_v/${name}.webp`);
  return (img.decode ? img.decode() : Promise.resolve()).then(() => { haveVar.add(name); varImg[name] = img; }).catch(() => { });
})));
// bölgenin (door/corr/vent) istenen versiyonunu göster; yoksa eski düz katman kullanılır
function useVar(region, name) {
  for (const [n, img] of Object.entries(varImg)) if (n.startsWith(region + '_') && n !== 'door_shutter') img.classList.toggle('on', n === name);
  const ok = name && haveVar.has(name);
  $('game').classList.toggle('v' + region, !!ok || (name === null && [...haveVar].some(v => v.startsWith(region + '_') && v !== 'door_shutter')));
}

// ---------- duvardaki jeneratör ekranı (tuval) ----------
const pctx = $('pscreen').getContext('2d');
let powerKey = '';
function drawPower(pw, n) {
  const low = pw < 20, blink = low && Math.floor(performance.now() / 500) % 2;
  const key = pw + '|' + n + '|' + blink; if (key === powerKey) return; powerKey = key;
  const c = pctx, W = 400, H = 300, col = low ? '#ff7a5a' : '#8dffa0';
  const gr = c.createRadialGradient(W / 2, H * .45, 20, W / 2, H / 2, 260);
  gr.addColorStop(0, '#16421f'); gr.addColorStop(1, '#030b05');
  c.fillStyle = gr; c.fillRect(0, 0, W, H);
  c.shadowColor = col; c.fillStyle = col;
  c.shadowBlur = 8; c.font = '30px VT323, monospace'; c.globalAlpha = .85; c.fillText('JENERATÖR', 34, 52);
  c.globalAlpha = blink ? .35 : 1; c.shadowBlur = 16; c.font = '128px VT323, monospace'; c.fillText('%' + pw, 30, 170);
  c.globalAlpha = 1; c.shadowBlur = 10;
  for (let i = 0; i < 6; i++) {
    const x = 34 + i * 56, on = i < n, hot = i >= 4;
    c.strokeStyle = 'rgba(141,255,160,.4)'; c.lineWidth = 2; c.strokeRect(x, 205, 48, 34);
    if (on) { c.fillStyle = hot ? '#ff6a4a' : col; c.shadowColor = c.fillStyle; c.fillRect(x + 3, 208, 42, 28); }
  }
  c.shadowBlur = 0; c.fillStyle = 'rgba(0,0,0,.3)';
  for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2);   // tarama çizgileri
  c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.ellipse(120, 60, 140, 50, -.2, 0, Math.PI * 2); c.fill();
}
if (document.fonts) document.fonts.load('30px VT323').then(() => { powerKey = ''; });

// ---------- çizim ----------
function clock() { const h = Math.floor(G.t / (Core.PARAMS.NIGHT_SEC / 6)); return h === 0 ? 12 : h; }
function camSrc(cam) {
  const g = G, v = {
    corr: g.pasta.stage === 1 || g.pasta.stage === 2 ? 'corr_pasta' : 'corr',
    autopsy: g.pasta.stage === 0 && g.lv.pasta > 0 && g.t > 8 ? 'autopsy_pasta' : 'autopsy',
    cold: g.denek5.open ? 'cold_open' : g.denek5.temp >= 70 ? 'cold_hot' : 'cold',
    wash: g.sahil.stage === 1 ? 'wash_sahil' : 'wash',
    ventA: g.sahil.stage === 2 ? 'ventA_sahil' : 'ventA',
    ventB: g.sahil.stage === 3 ? 'ventB_sahil' : 'ventB',
    archive: g.avukat.pos === 'archive' && !g.avukat.at && g.lv.avukat > 0 ? 'archive_avukat' : 'archive',
    lift: g.sultan.phase === 'approach' ? 'lift_sultan' : g.avukat.pos === 'lift' ? 'lift_avukat' : 'lift',
  }[cam];
  return `img/cam/${v}.png`;
}
// ışık bozulunca önce birkaç kez yanıp söner, sonra kapanır (aç/kapa süreleri, ms)
const FLICK = [70, 60, 110, 80, 50, 140, 60], FLICK_MS = FLICK.reduce((a, b) => a + b, 0);
const flick = {};
function flickOn(k) {
  const f = flick[k]; if (!f) return false;
  let t = performance.now() - f.t0; if (t >= FLICK_MS) { delete flick[k]; return false; }
  for (let i = 0; i < FLICK.length; i++) { if (t < FLICK[i]) return i % 2 === 0; t -= FLICK[i]; }
  return false;
}
function render() {
  const g = G, c = $('game').classList;
  const fl = { flash: flickOn('flash'), lightL: flickOn('lightL'), ventLight: flickOn('ventLight') };
  const d = Object.assign({}, g.dev); if (!G.dark && !g.dev.sheet && !ui.monitor) for (const k in fl) if (fl[k]) d[k] = true;
  c.toggle('doorL', d.doorL); c.toggle('lightL', d.lightL); c.toggle('flash', d.flash); c.toggle('ventLight', d.ventLight);
  c.toggle('sheet', d.sheet); c.toggle('cam-mode', ui.monitor && !d.sheet);
  snd('breathing', !!d.sheet && !g.over);
  if (d.sheet && ui.monitor) { ui.monitor = false; closeCam(); }
  // koridor
  // ışık titrerken hareketten önceki durum gösterilir (karakter ışık sönmeden yer değiştirmez)
  const was = k => flick[k] && !g.dev[k] ? flick[k].was : null;
  const pst = was('flash') ? was('flash').pasta : g.pasta.stage;
  const corrVar = g.sultan.phase === 'here' ? 'corr_sultan' : !d.flash ? null : itsmeCorrUntil > g.t && !g.pasta.stage ? 'corr_itsme' : pst ? 'corr_pasta' + pst : 'corr_lit';
  useVar('corr', corrVar);
  // kapalı kapı ayrı katman (#vDoorS): çelik kepenk, CSS ile tavandan kayar
  $('game').classList.toggle('vdoorc', haveVar.has('door_shutter'));
  useVar('door', d.doorL ? null : d.lightL ? ((was('lightL') ? was('lightL').avukat : g.avukat.at) ? 'door_avukat' : 'door_lit') : null);
  useVar('vent', d.ventLight ? ((was('ventLight') ? was('ventLight').sahil : g.sahil.stage) === Core.PARAMS.SAHIL_MOUTH ? 'vent_sahil' : 'vent_lit') : null);
  // masa
  const h = clock();
  const clk = `${h}:${String(Math.floor((g.t % 50) / 50 * 60)).padStart(2, '0')} AM`;
  $('monClock').textContent = clk; $('camClock').textContent = clk;
  renderClock(h, (g.t % 50) / 50 * 60);
  drawPower(Math.ceil(g.power), Math.min(6, Math.round(Core.usage(g) / 0.12)));
  const u = Core.usage(g), n = Math.min(6, Math.round(u / 0.12));
  $('camTimeR').textContent = `${h} AM  │  JEN %${Math.ceil(g.power)}`;
  if (ui.monitor) renderCam();
}
function renderCam() {
  renderDesk();
  if (visible('fix')) renderFix();
  if (!cctvOn()) return;
  const g = G, cam = ui.cam, fb = $('feedBox');
  $('camName').textContent = CAM_NAMES[cam];
  const hacked = frozen && frozen.cam === cam;
  const src = hacked ? frozen.src : camSrc(cam);
  // izlediğin kamerada biri gelir/giderse görüntü bir an parazitlenir (FNaF gibi)
  if (lastFeed.cam === cam && lastFeed.src !== src && !hacked) staticBurst();
  lastFeed = { cam, src };
  setSrc($('feedImg'), src);
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
  document.querySelectorAll('#map button').forEach(b => b.classList.toggle('sel', b.dataset.cam === cam));
  $('mapSel').textContent = `CAM ${Core.CAMS.indexOf(cam) + 1} - ${CAM_SHORT[cam]}`;
  $('camPow').textContent = `JEN %${Math.ceil(g.power)}`;
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
  pscreen: { w: 400, h: 300, p: [[95, 258], [303, 278], [302, 447], [97, 468]] },     // duvardaki MIRIKVISION ekranının camı
  mon: { w: 400, h: 300, p: [[674, 530], [848, 520], [850, 658], [678, 676]] },        // masadaki monitörün camı
};
// Yazı içeren katmanlar (masadaki saat, duvar ekranı, kamera arayüzü) 3B perspektif yerine 2B eğmeyle oturur:
// bazı ekran kartlarında Chrome 3B dönüştürülmüş katmandaki yazıları bozuk çiziyor. Camlar neredeyse paralelkenar, fark görünmez.
function quadAffine(w, h, p) { // (0,0)(w,0)(w,h)(0,h) -> p, en küçük kareler afin
  const [p0, p1, p2, p3] = p, mx = (p0[0] + p1[0] + p2[0] + p3[0]) / 4, my = (p0[1] + p1[1] + p2[1] + p3[1]) / 4;
  const a = (p1[0] + p2[0] - p0[0] - p3[0]) / (2 * w), b = (p1[1] + p2[1] - p0[1] - p3[1]) / (2 * w);
  const c = (p2[0] + p3[0] - p0[0] - p1[0]) / (2 * h), d = (p2[1] + p3[1] - p0[1] - p1[1]) / (2 * h);
  const e = mx - a * w / 2 - c * h / 2, f = my - b * w / 2 - d * h / 2;
  return { a, b, c, d, e, f, css: `matrix(${[a, b, c, d, e, f].map(v => +v.toFixed(6)).join(',')})` };
}
const TEXT_LAYERS = new Set(['mon']); // pscreen tuval: tam perspektif
for (const [id, q] of Object.entries(QUADS)) $(id).style.transform = TEXT_LAYERS.has(id) ? quadAffine(q.w, q.h, q.p).css : quadMatrix(q.w, q.h, q.p);

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
const MON = { x: 762, y: 604 }, ZOOM = 4.0;        // camın merkezi ve yakınlaşma
function zoomTransform() { return `translate(${640 - MON.x * ZOOM}px, ${360 - MON.y * ZOOM}px) scale(${ZOOM})`; }
// cam köşelerini yakınlaşmış sahnede ekrana çevir, kamera arayüzünü (808×632) oraya oturt
const SCREEN_AFF = quadAffine(808, 632, MON_GLASS.map(([x, y]) => [640 + (x - MON.x) * ZOOM, 360 + (y - MON.y) * ZOOM]));
$('screenWrap').style.transform = SCREEN_AFF.css;
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
let lastFeed = {}, burstT = null;
function staticBurst() {
  const st = $('static'); st.classList.remove('burst'); void st.offsetWidth; st.classList.add('burst');
  snd('static'); clearTimeout(burstT); burstT = setTimeout(() => st.classList.remove('burst'), 900);
}
function selCam(cam) { if (!cctvOn() || ui.cam === cam) return; ui.cam = cam; snd('blip'); $('static').style.opacity = 1; setTimeout(() => $('static').style.opacity = '', 160); }

// ---------- monitör masaüstü: küçük bir pencere yöneticisi ----------
// Pencereler sürüklenir, tıklanınca öne gelir, simge durumuna küçülür, görev çubuğundan geri açılır.
const ICONS = {
  pc: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="4" y="3" width="24" height="18" fill="#d8d4c8" stroke="#333"/><rect x="7" y="6" width="18" height="12" fill="#1c5fb0"/><rect x="8" y="7" width="7" height="3" fill="#7fb2ff"/><rect x="12" y="21" width="8" height="3" fill="#b8b4a8" stroke="#333"/><rect x="6" y="24" width="20" height="5" fill="#d8d4c8" stroke="#333"/><rect x="20" y="26" width="4" height="1" fill="#2a2"/></svg>',
  bin: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M7 8h18l-2 21H9z" fill="#dfe6ea" stroke="#333"/><rect x="6" y="5" width="20" height="3" fill="#c8d0d4" stroke="#333"/><path d="M10 10v17M13 10v17M16 10v17M19 10v17M22 10v17" stroke="#9aa4aa"/><path d="M13 14l3-3 3 3h-2v3h-2v-3z M11 22l-2 3h4z M21 22l2 3h-4z" fill="#1a9a3a"/></svg>',
  cctv: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="3" y="9" width="20" height="10" fill="#4a5058" stroke="#111"/><rect x="23" y="11" width="6" height="6" fill="#2a2e33" stroke="#111"/><circle cx="26" cy="14" r="2" fill="#5fb0ff"/><rect x="5" y="11" width="3" height="2" fill="#e22"/><rect x="11" y="19" width="3" height="6" fill="#888" stroke="#111"/><rect x="6" y="25" width="13" height="3" fill="#777" stroke="#111"/></svg>',
  fix: '<svg viewBox="0 0 32 32"><path d="M7 25l11-11" stroke="#555" stroke-width="5" stroke-linecap="round"/><circle cx="21" cy="11" r="6" fill="#9aa0a6" stroke="#333"/><circle cx="23" cy="9" r="3" fill="#c0c0c0"/><path d="M25 25L14 14" stroke="#c0c0c0" stroke-width="2.5"/><path d="M27 27l-5-5" stroke="#c22" stroke-width="5" stroke-linecap="round"/></svg>',
  floppy: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="5" y="4" width="22" height="24" fill="#333"/><rect x="9" y="4" width="13" height="8" fill="#c8c8c8"/><rect x="18" y="5" width="3" height="6" fill="#333"/><rect x="8" y="16" width="16" height="12" fill="#eee"/></svg>',
  drive: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="3" y="11" width="26" height="12" fill="#c8c4b8" stroke="#333"/><rect x="5" y="20" width="22" height="1" fill="#888"/><rect x="23" y="15" width="3" height="2" fill="#2c2"/></svg>',
  cd: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#cfd8e0" stroke="#666"/><circle cx="16" cy="16" r="3" fill="#fff" stroke="#666"/><path d="M8 11a10 10 0 0 1 8-5" stroke="#9ae" stroke-width="2" fill="none"/></svg>',
  doc: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M7 3h13l6 6v20H7z" fill="#fff" stroke="#333"/><path d="M20 3v6h6" fill="#ddd" stroke="#333"/><path d="M10 13h12M10 16h12M10 19h12M10 22h8" stroke="#1c5fb0"/></svg>',
  img: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#333"/><rect x="6" y="8" width="20" height="16" fill="#3a6ea5"/><path d="M6 24l7-8 5 5 3-3 5 6z" fill="#2a7a3a"/><circle cx="21" cy="12" r="2" fill="#ff0"/></svg>',
  power: '<svg viewBox="0 0 32 32"><circle cx="16" cy="17" r="9" fill="none" stroke="#c22" stroke-width="3"/><path d="M16 5v11" stroke="#c22" stroke-width="3"/></svg>',
  folder: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M3 9h10l2 3h14v15H3z" fill="#f2d16b" stroke="#7a5a00"/><path d="M3 13h26" stroke="#c9a640"/></svg>',
  txt: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><path d="M8 3h12l5 5v21H8z" fill="#fff" stroke="#333"/><path d="M11 11h11M11 14h11M11 17h11M11 20h11M11 23h7" stroke="#555"/></svg>',
  flag: '<svg viewBox="0 0 32 32" shape-rendering="crispEdges"><rect x="3" y="4" width="12" height="11" fill="#e33"/><rect x="17" y="4" width="12" height="11" fill="#3a3"/><rect x="3" y="17" width="12" height="11" fill="#36d"/><rect x="17" y="17" width="12" height="11" fill="#ec2"/></svg>',
};
ICONS.note = ICONS.txt;
const fillIcons = root => root.querySelectorAll('i[data-ico]').forEach(i => { i.innerHTML = ICONS[i.dataset.ico] || ''; });
fillIcons(document);
const APPS = {
  cctv: { el: 'winCctv', title: 'MORG-SEC CCTV' }, fix: { el: 'winFix', title: 'Sistem Onarım' },
  pc: { el: 'winPc', title: 'Bilgisayarım' }, bin: { el: 'winBin', title: 'Geri Dönüşüm Kutusu' }, msg: { el: 'winMsg', title: 'Hata', noTask: true }, itsme: { el: 'winItsme', title: "IT'S ME", noTask: true },
  note: { el: 'winNote', title: 'Not Defteri' }, img: { el: 'winImg', title: 'Resim' },
};
const wm = { open: [], min: new Set(), z: [], active: null };
const visible = a => wm.open.includes(a) && !wm.min.has(a);
let appTimer = 0;
function openApp(name) {
  closeStart();
  if (wm.open.includes(name)) { wm.min.delete(name); focusWin(name); return; }
  clearTimeout(appTimer); ui.loading = true; snd('click'); renderDesk();
  appTimer = setTimeout(() => { ui.loading = false; wm.open.push(name); focusWin(name); snd('blip'); if (G && ui.monitor) renderCam(); }, name === 'msg' ? 0 : 380);
}
function closeApp(name) { wm.open = wm.open.filter(a => a !== name); wm.min.delete(name); if (wm.active === name) wm.active = topVisible(); snd('click'); renderDesk(); }
function minimizeApp(name) { wm.min.add(name); if (wm.active === name) wm.active = topVisible(); renderDesk(); }
function focusWin(name) { wm.z = wm.z.filter(a => a !== name).concat(name); wm.active = name; renderDesk(); }
function topVisible() { for (let i = wm.z.length - 1; i >= 0; i--) if (visible(wm.z[i])) return wm.z[i]; return null; }
function showMsg(t) { $('msgTxt').textContent = t; snd('static'); openApp('msg'); }
function renderDesk() {
  for (const [a, o] of Object.entries(APPS)) {
    const el = $(o.el); el.classList.toggle('open', visible(a)); el.classList.toggle('active', wm.active === a);
    el.style.zIndex = 10 + wm.z.indexOf(a);
  }
  $('screen').classList.toggle('loading', ui.loading);
  const tasks = wm.open.filter(a => !APPS[a].noTask);
  const key = tasks.join(',') + '|' + wm.active + '|' + [...wm.min].join(',');
  if ($('tasks').dataset.key !== key) {
    $('tasks').dataset.key = key;
    $('tasks').innerHTML = tasks.map(a => `<span class="tbtn${wm.active === a && !wm.min.has(a) ? ' act' : ''}" data-app="${a}"><i data-ico="${a}" class="sm"></i><span>${APPS[a].title}</span></span>`).join('');
    fillIcons($('tasks'));
  }
}
$('tasks').addEventListener('click', e => {
  const b = e.target.closest('.tbtn'); if (!b) return; const a = b.dataset.app;
  if (wm.active === a && !wm.min.has(a)) minimizeApp(a); else { wm.min.delete(a); focusWin(a); }
});
document.querySelectorAll('.win').forEach(w => w.addEventListener('pointerdown', () => { const a = Object.keys(APPS).find(k => APPS[k].el === w.id); if (a && wm.active !== a) focusWin(a); }));
document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); closeApp(el.dataset.close); }));
document.querySelectorAll('[data-min]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); minimizeApp(el.dataset.min); }));
// masaüstü simgeleri: tek tık seçer, çift tık açar
document.querySelectorAll('.dicon').forEach(d => {
  d.addEventListener('click', () => { document.querySelectorAll('.dicon').forEach(x => x.classList.toggle('selected', x === d)); closeStart(); });
  d.addEventListener('dblclick', () => openApp(d.dataset.app));
  d.addEventListener('pointerup', e => { if (e.pointerType === 'touch') openApp(d.dataset.app); }); // telefonda tek dokunuş açar
});
$('desk').parentElement.addEventListener('pointerdown', e => { if (e.target === $('screen')) { document.querySelectorAll('.dicon').forEach(x => x.classList.remove('selected')); closeStart(); } });
// ---------- dosya gezgini (Bilgisayarım), Geri Dönüşüm, Not Defteri, resim ----------
const pcStack = [];
function fileEl(node, onOpen) {
  const el = document.createElement('div'); el.className = 'file';
  el.innerHTML = `<i data-ico="${node.ico}"></i><span>${node.name}</span>`; fillIcons(el);
  el.addEventListener('click', () => { el.parentElement.querySelectorAll('.file').forEach(x => x.classList.toggle('selected', x === el)); });
  el.addEventListener('dblclick', () => onOpen(node));
  el.addEventListener('pointerup', e => { if (e.pointerType === 'touch') onOpen(node); });
  return el;
}
function openNode(node) {
  if (node.dir) { pcStack.push(node); renderPc(); snd('click'); return; }
  if (node.text) { $('noteTitle').textContent = node.name + ' - Not Defteri'; $('noteText').textContent = node.text; $('noteText').scrollTop = 0; APPS.note.title = node.name; openApp('note'); return; }
  if (node.img) { $('imgTitle').textContent = node.name + ' - Resim'; $('imgView').src = av(node.img); document.querySelector('.imgv .imgerr').textContent = node.note || 'Görüntü kısmen bozuk.'; APPS.img.title = node.name; openApp('img'); return; }
  if (node.deny) showMsg(node.deny);
}
function renderPc() {
  const cur = pcStack[pcStack.length - 1], items = cur ? cur.dir : Lore.FS;
  $('pcFiles').innerHTML = ''; items.forEach(n => $('pcFiles').appendChild(fileEl(n, openNode)));
  const name = cur ? cur.name : 'Bilgisayarım';
  $('pcTitle').textContent = name; APPS.pc.title = name;
  $('pcPath').textContent = pcStack.length ? pcStack.map(n => n.name.replace(/.*\((\w:)\)/, '$1')).join('\\') : 'Bilgisayarım';
  $('pcCount').textContent = items.length + ' nesne';
  $('tasks').dataset.key = ''; renderDesk();
}
$('pcUp').addEventListener('click', () => { if (pcStack.length) { pcStack.pop(); renderPc(); snd('click'); } });
Lore.BIN.forEach(n => $('binFiles').appendChild(fileEl(n, n.text || n.img ? openNode : () => showMsg('Bu dosya bozuk ya da erişim engellendi.'))));
renderPc();
// masadaki monitör: Tarih/Saat Özellikleri takvimi (gerçek bugünün ayı)
(function buildCal() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  $('calMonth').textContent = AY[m]; $('calYear').textContent = y;
  const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  $('calGrid').innerHTML = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map(d => `<b>${d}</b>`).join('') + '<span></span>'.repeat(first) +
    Array.from({ length: days }, (_, i) => `<span class="${i + 1 === now.getDate() ? 'today' : ''}">${i + 1}</span>`).join('');
})();
function renderClock(h, minF) {
  const sec = new Date().getSeconds(), min = Math.floor(minF);
  $('hHour').style.transform = `rotate(${(h % 12) * 30 + minF * 0.5}deg)`;
  $('hMin').style.transform = `rotate(${minF * 6}deg)`;
  $('hSec').style.transform = `rotate(${sec * 6}deg)`;
  $('monBig').textContent = `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
// Başlat menüsü
function closeStart() { $('startMenu').classList.remove('open'); $('bStart').classList.remove('on'); }
$('bStart').addEventListener('click', e => { e.stopPropagation(); const o = !$('startMenu').classList.contains('open'); $('startMenu').classList.toggle('open', o); $('bStart').classList.toggle('on', o); snd('click'); });
document.querySelectorAll('#startMenu .smi[data-app]').forEach(m => m.addEventListener('click', () => openApp(m.dataset.app)));
document.querySelectorAll('#startMenu .smi[data-deny]').forEach(m => m.addEventListener('click', () => { closeStart(); showMsg('Bu işlem için yönetici izni gerekiyor.'); }));
$('smShut').addEventListener('click', () => { closeStart(); closeCam(); });
// sürükleme: ekran perspektifli olduğu için fare konumu ters homografiyle ekranın kendi koordinatına çevrilir
// sürükleme: fare konumunu ekranın kendi koordinatına çevir (afin dönüşümün tersi)
const toLocal = (() => { const { a, b, c, d, e, f } = SCREEN_AFF, det = a * d - b * c;
  return (X, Y) => [(d * (X - e) - c * (Y - f)) / det, (-b * (X - e) + a * (Y - f)) / det]; })();
function stageXY(e) { const r = stage.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 1280, (e.clientY - r.top) / r.height * 720]; }
let drag = null;
document.querySelectorAll('.win .tb').forEach(tb => tb.addEventListener('pointerdown', e => {
  if (e.target.closest('.wb')) return;
  const w = tb.parentElement; const [x, y] = toLocal(...stageXY(e));
  drag = { w, dx: x - w.offsetLeft, dy: y - w.offsetTop }; tb.setPointerCapture(e.pointerId);
}));
addEventListener('pointermove', e => {
  if (!drag) return; const [x, y] = toLocal(...stageXY(e)), w = drag.w;
  w.style.left = Math.max(-w.offsetWidth + 80, Math.min(808 - 80, x - drag.dx)) + 'px';
  w.style.top = Math.max(0, Math.min(592 - 24 - 4, y - drag.dy)) + 'px';
});
addEventListener('pointerup', () => { drag = null; });
// eski adlar: kamera ve onarım
function cctvOn() { return visible('cctv'); }
// Sistem Onarım: kamerayı seç, Onar. 3 sn video yok. Hangi kameranın bozuk olduğunu söylemez.
$('fixList').innerHTML = Core.CAMS.map(c => `<div data-cam="${c}">${CAM_NAMES[c]}</div>`).join('');
document.querySelectorAll('#fixList div').forEach(d => d.addEventListener('click', () => { if (ui.fixing) return; ui.fixCam = d.dataset.cam; ui.fixMsg = 'Onar düğmesine basın.'; snd('tick'); renderFix(); }));
$('bFix').addEventListener('click', () => startFix());
function startFix() {
  if (!G || G.over || ui.fixing) return;
  ui.fixing = true; ui.fixT = 0; ui.fixHadHack = G.muh.cam === ui.fixCam; ui.fixMsg = 'Onarılıyor: ' + CAM_SHORT[ui.fixCam] + '...'; snd('reboot');
}
function fixTick(dt) {
  if (!ui.fixing || !ui.monitor) return;          // monitörden kalkınca onarım duraklar
  ui.fixT += dt;
  // bitiş oyunun gerçek durumuna bağlı: bozuk kamera düzelince ya da (bozuk değilse) süre dolunca
  const fixed = ui.fixHadHack && G.muh.cam !== ui.fixCam;
  if (!fixed && ui.fixT < Core.PARAMS.MUH_REBOOT + (ui.fixHadHack ? 1 : 0.05)) return;
  ui.fixing = false;
  ui.fixMsg = fixed ? '✔ ' + CAM_SHORT[ui.fixCam] + ' onarıldı.' : 'Sorun bulunamadı.';
  snd('blip');
}
function renderFix() {
  $('fixSel').textContent = CAM_NAMES[ui.fixCam];
  document.querySelectorAll('#fixList div').forEach(d => d.classList.toggle('sel', d.dataset.cam === ui.fixCam));
  $('fixBar').style.width = (ui.fixing ? Math.min(1, ui.fixT / Core.PARAMS.MUH_REBOOT) * 100 : 0) + '%';
  $('bFix').classList.toggle('on', ui.fixing);
  $('fixMsg').textContent = ui.fixMsg;
}

// harita düğmeleri
$('map').querySelector('.plan').innerHTML = MAP_LINKS.map(([a, b, v]) => {
  const [x1, y1] = MAP_C[a], [x2, y2] = MAP_C[b];
  return `<path d="M${x1} ${y1} ${v ? `V${y2} H${x2}` : `H${x2} V${y2}`}"/>`;   // v: önce dikey
}).join('');
$('map').querySelector('.you').style.cssText = `left:${CAM_POS.you[0]}px;top:${CAM_POS.you[1]}px`;
$('map').insertAdjacentHTML('beforeend', Core.CAMS.map(c => `<button data-cam="${c}" style="left:${CAM_POS[c][0]}px;top:${CAM_POS[c][1]}px">${CAM_SHORT[c]}</button>`).join(''));
document.querySelectorAll('#map button').forEach(b => b.onclick = () => selCam(b.dataset.cam));

// ---------- kontroller ----------
function hold(el, key) {
  const on = e => { e.preventDefault(); if (G && !G.over && !G.dark) { ui[key] = true; if (key === 'flash') snd('flashClick'); if (key === 'reboot') snd('reboot'); if (key === 'lightL' || key === 'ventLight') snd('light', true, key === 'lightL' ? -1 : 1); } };
  const off = () => { if (ui[key]) { ui[key] = false; if (key !== 'flash' && key !== 'cooling' && key !== 'reboot') snd('light', false); } };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointerleave', off); el.addEventListener('pointercancel', off);
}
hold($('corrHit'), 'flash'); hold($('bLight'), 'lightL'); hold($('ventBtn'), 'ventLight'); hold($('bCool'), 'cooling');
$('bDoor').onclick = () => {
  if (!G || G.over || G.dark) return;
  ui.doorL = !ui.doorL; snd('door', -1, ui.doorL);
  if (ui.doorL) setTimeout(() => { $('office').classList.add('slam'); setTimeout(() => $('office').classList.remove('slam'), 260); }, 250);
};
$('barMon').addEventListener('mouseenter', toggleMonitor); $('barMon').addEventListener('click', e => { if (e.pointerType !== 'mouse') toggleMonitor(); });
$('barSheet').addEventListener('mouseenter', toggleSheet); $('barSheet').addEventListener('click', e => { if (e.pointerType !== 'mouse') toggleSheet(); });

$('mon').addEventListener('click', () => { if (!ui.monitor) toggleMonitor(); }); // masadaki monitöre tıklayınca kameralar açılır
const HOLD_KEYS = { f: 'flash', a: 'lightL', v: 'ventLight', c: 'cooling' };
addEventListener('keydown', e => {
  if (!G || G.over || !$('game').classList.contains('on')) return;
  const k = e.key.toLowerCase();
  if (HOLD_KEYS[k]) { if (!e.repeat && !G.dark) { ui[HOLD_KEYS[k]] = true; if (k === 'f') snd('flashClick'); if (k === 'a' || k === 'v') snd('light', true, k === 'a' ? -1 : 1); } return; }
  if (e.repeat) return;
  if (k === 'q') $('bDoor').onclick();
  if (k === ' ' || k === 'tab') { e.preventDefault(); toggleMonitor(); }
  if (k === 's') toggleSheet();
  if (k >= '1' && k <= '8' && ui.monitor) { if (cctvOn()) selCam(Core.CAMS[+k - 1]); else { ui.cam = Core.CAMS[+k - 1]; openApp('cctv'); } }
  if (k === 'r' && ui.monitor) { const c = cctvOn() && wm.active !== 'fix' ? ui.cam : ui.fixCam; openApp('fix'); ui.fixCam = c; startFix(); }
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
  const tape = (id, t, sub, lock) => lock ? `<div class="tapebox lock"><div class="lab">???<small>${sub}</small></div></div>` : `<div class="tapebox" tabindex="0" ${id ? `data-doc="${id}"` : ''}><div class="lab">${t}<small>${sub}</small></div></div>`;
  const items = ['doc1', 'doc2', 'doc3', 'doc4', 'doc5'].map((id, i) => P.docs.includes(id) ? tape(id, DOCS[id].title, `${i + 1}. gece`) : tape(0, 0, `${i + 1}. gece · bulunmadı`, true));
  items.push(P.itsme.length ? tape(0, "IT'S ME", `görülen: ${P.itsme.length} / 3`) : tape(0, 0, 'bazen gece bir şey görürsün', true));
  items.push(P.custom2020 ? tape('secret', DOCS.secret.title, '20/20 ödülü') : tape(0, 0, "20/20'de hayatta kal", true));
  items.push(tape(0, 0, 'kayıt dışı', true));
  $('arcList').innerHTML = items.join('');
  $('arcCount').textContent = `${P.docs.length + (P.custom2020 ? 1 : 0)} / 6 KASET`;
  document.querySelectorAll('#arcList [data-doc]').forEach(el => el.onclick = () => showDoc(el.dataset.doc, () => { renderArchive(); show('archive'); }));
}
const CNAME = { pasta: 'PASTA', avukat: 'AVUKAT', sahil: 'SAHİL', sayici: 'SAYICI', muh: 'MÜHENDİS', arda: 'ARDA BAZ', sultan: 'SULTAN', denek5: 'DENEK 5' };
let cLv = { pasta: 5, avukat: 5, sahil: 5, sayici: 5, muh: 5, arda: 5, sultan: 5, denek5: 5 };
function renderCustom() {
  $('ccards').innerHTML = Core.CHARS.map(c => `<div class="cc"><div class="pic" style="background-image:url(${av(`img/scare/${c}.png`)})"></div><b>${CNAME[c]}</b><div class="lvbar">${Array.from({ length: 20 }, (_, i) => `<i class="${i < cLv[c] ? (i >= 15 ? 'hot' : 'on') : ''}"></i>`).join('')}</div><button data-c="${c}" data-d="-1" aria-label="${CNAME[c]} azalt">◀</button><span class="v">${String(cLv[c]).padStart(2, '0')}</span><button data-c="${c}" data-d="1" aria-label="${CNAME[c]} artır">▶</button></div>`).join('');
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
function muteLabel() { $('mute').classList.toggle('off', A.muted); const v = Math.round(A.volume * 100); $('vol').value = v; $('vol').style.setProperty('--v', v + '%'); }
$('muteBtn').onclick = e => { e.stopPropagation(); A.init(); A.setMuted(!A.muted); muteLabel(); };
$('vol').addEventListener('input', e => { A.init(); if (A.muted) A.setMuted(false); A.setVolume(e.target.value / 100); muteLabel(); });
$('vol').addEventListener('change', () => snd('hover'));
muteLabel();
new MutationObserver(() => { for (const n of [...document.body.children]) if (n.id !== 'stage' && n.tagName !== 'SCRIPT') n.remove(); }).observe(document.body, { childList: true });

// ---------- ön yükleme ----------
// açılış: kaset karı (statik) ve yüklenince kaset takılır
(function snow() {
  const c = $('snow').getContext('2d'), im = c.createImageData(320, 180);
  (function f() { if (!$('splash').classList.contains('on')) return; const d = im.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } c.putImageData(im, 0, 0); requestAnimationFrame(f); })();
})();
setTimeout(() => $('splash').querySelector('.cassette').classList.add('in'), 100);
let ready = false;
$('splash').onclick = () => { if (!ready) return; A.init(); try { A.playMenuMusic(); } catch (e) { } glitchBurst(() => { refreshMenu(); show('title'); }); };
(function preload() {
  const imgs = ['office', 'menu_face', 'menu_face_scary', 'doc/paper', 'ending', 'itsme_photo', 'ui/monitor',
    'corr/empty', 'corr/lit', 'corr/pasta1', 'corr/pasta2', 'corr/pasta3', 'corr/sultan', 'vent/empty', 'vent/sahil', 'doorway/empty', 'doorway/avukat',
    ...['corr', 'corr_pasta', 'autopsy', 'autopsy_pasta', 'cold', 'cold_hot', 'cold_open', 'ventA', 'ventA_sahil', 'ventB', 'ventB_sahil', 'archive', 'archive_avukat', 'lift', 'lift_avukat', 'lift_sultan', 'wash', 'wash_sahil'].map(c => 'cam/' + c),
    ...Core.CHARS.concat('itsme').map(c => 'scare/' + c)].map(s => `img/${s}.png`);
  const keep = window.__preloaded = []; let done = 0; const total = imgs.length + 2;
  const tick = () => { done++; $('splashTxt').textContent = `KASET YÜKLENİYOR %${Math.round(done / total * 100)}`; if (done >= total) finish(); };
  const finish = () => { if (ready) return; ready = true; window.__m5g.ready = true; $('splashTxt').textContent = '▶ OYNATMAK İÇİN TIKLA'; $('splash').classList.add('ready'); $('spOsd').textContent = '▶ PLAY'; };
  imgs.forEach(src => { const i = new Image(); keep.push(i); i.onload = i.onerror = tick; i.src = av(src); });
  Promise.resolve(A.loadSamples ? A.loadSamples() : null).catch(() => { }).then(tick);
  variantsReady.then(tick);
  setTimeout(finish, 15000);
})();
const unlock = () => { try { A.init(); } catch (e) { } removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true); };
addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);

// sağ tık menüsü ve görsel sürükleme kapalı
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('dragstart', e => e.preventDefault());

// test kancası
window.__m5g = Object.assign(window.__m5g || {}, { startNight, get G() { return G; }, save: () => P, show, popItsme: () => { itsmePop.t = 0; } });
