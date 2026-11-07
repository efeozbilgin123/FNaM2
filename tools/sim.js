// Denge simülasyonu: çekirdeği "iyi oyuncu" botuyla binlerce kez oynatır.
// Kullanım: node tools/sim.js [koşu sayısı]
'use strict';
const Core = require('../core.js');
const { NIGHTS } = require('../nights.js');

const DT = 0.1, DELAY = 0.6, FAKE_SPOT = 0.7;

function mulberry32(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Oyuncunun algılayabildiği bilgiler (sesler, ışıkla bakınca görülenler, monitör).
function perceive(G, mem) {
  return {
    t: G.t,
    sultan: G.sultan.phase !== 'none' && mem.heardMotor,
    sahilMouth: G.sahil.stage === Core.PARAMS.SAHIL_MOUTH && mem.ventSeen,
    sayici: G.sayici.active && G.sayici.count === 5,
    avukat: G.avukat.at && G.avukat.knock <= 0 && mem.doorSeen,
    knocking: G.avukat.knock > 0,
    pasta: G.pasta.stage === 3 && mem.corrSeen,
    temp: Core.shownTemp(G),
    hack: G.muh.cam,
  };
}

// İyi oyuncu: gecikmeli tepki, aynı anda tek odak, öncelik sırası.
function goodBot({ delay = DELAY, spot = FAKE_SPOT } = {}) {
  const mem = { hist: [], heardMotor: false, ventSeen: false, heardDrag: false, doorSeen: false, corrSeen: false,
    door: false, cooling: false, urgent: [], fakeSheet: 0, fakeDoor: 0, peek: 0, peekWhat: null, nextDoorPeek: 1, nextVentPeek: 3, nextCorrPeek: 2 };
  return function (G, evs, rng) {
    for (const e of evs) {
      if (e.type === 'sound') {
        if (e.id === 'motor') mem.heardMotor = true;
        if (e.fake && (e.id === 'drag' || e.id === 'say4' || e.id === 'knock') && rng() > spot) {
          if (e.id === 'knock') mem.fakeDoor = 3; else mem.fakeSheet = 3;
        }
        if (e.id === 'drag' && !mem.fakeSheet) { if (mem.heardMotor) mem.fakeSheet = Math.max(mem.fakeSheet, 7); else mem.urgent.push(['vent', G.t + delay]); }
        if (e.id === 'step' && e.from === 'corr') mem.urgent.push(['corr', G.t + delay]);
        if (e.id === 'step' && e.from === 'door') { mem.urgent.push(['door', G.t + delay]); mem.doorStepT = G.t; }
      }
      if (e.type === 'phase' && e.who === 'sultan' && e.phase === 'none') mem.heardMotor = false;
      if (e.type === 'move' && e.who === 'sahil' && e.stage === 0) { mem.heardDrag = false; mem.ventSeen = false; }
      if (e.type === 'move' && e.who === 'avukat' && e.to === 'archive') mem.doorSeen = false;
      if (e.type === 'move' && e.who === 'pasta' && e.stage === 0) mem.corrSeen = false;
    }
    mem.fakeSheet = Math.max(0, mem.fakeSheet - DT); mem.fakeDoor = Math.max(0, mem.fakeDoor - DT);
    mem.hist.push(perceive(G, mem));
    while (mem.hist.length > 1 && mem.hist[1].t <= G.t - delay) mem.hist.shift();
    const p = mem.hist[0];
    const inp = { doorL: false, lightL: false, flash: false, ventLight: false, monitor: false, cooling: false, sheet: false, cam: null, reboot: null };

    // Kapı: Avukat görüldüyse ya da vuruyorsa kapalı tut.
    if (p.avukat || p.knocking || mem.fakeDoor > 0 || (mem.heardMotor && G.t - (mem.doorStepT || -99) < 9)) mem.door = true;
    else if (!G.avukat.at) mem.door = false;
    inp.doorL = mem.door;

    const needSheet = p.sahilMouth || p.sayici || mem.fakeSheet > 0;
    if (p.sultan) { inp.sheet = needSheet; return inp; } // her şeyi kapat, karanlıkta bekle
    if (needSheet) { inp.sheet = true; return inp; }
    if (p.pasta) { inp.flash = true; return inp; }
    if (mem.peek > 0) {
      mem.peek -= DT;
      if (mem.peekWhat === 'door') { inp.lightL = true; if (G.avukat.at) mem.doorSeen = true; }
      if (mem.peekWhat === 'vent') { inp.ventLight = true; if (G.sahil.stage === Core.PARAMS.SAHIL_MOUTH) mem.ventSeen = true; }
      if (mem.peekWhat === 'corr') { inp.flash = true; if (G.pasta.stage === 3) mem.corrSeen = true; }
      return inp;
    }
    const u = mem.urgent.findIndex(x => x[1] <= G.t);
    if (u >= 0) { mem.peekWhat = mem.urgent[u][0]; mem.urgent.splice(u, 1); mem.peek = 0.4; return inp; }
    if (p.temp > 55) mem.cooling = true;
    if (p.temp < 20) mem.cooling = false;
    if (p.hack && p.hack !== 'cold' || (p.hack === 'cold' && G.muh.age > 6)) {
      inp.monitor = true; inp.cam = p.hack; inp.reboot = p.hack; return inp;
    }
    if (mem.cooling) { inp.monitor = true; inp.cam = 'cold'; inp.cooling = true; return inp; }
    if (G.t >= mem.nextDoorPeek) { mem.nextDoorPeek = G.t + 4; mem.peek = 0.3; mem.peekWhat = 'door'; return inp; }
    if (G.t >= mem.nextVentPeek && G.lv.sahil > 0) { mem.nextVentPeek = G.t + 6; mem.peek = 0.3; mem.peekWhat = 'vent'; return inp; }
    if (G.t >= mem.nextCorrPeek) { mem.nextCorrPeek = G.t + 3; mem.peek = 0.3; mem.peekWhat = 'corr'; return inp; }
    return inp;
  };
}

const expertBot = () => goodBot({ delay: 0.35, spot: 0.95 });
function passiveBot() { return () => ({}); }
function wastefulBot() {
  return () => ({ doorL: true, lightL: true, flash: true, ventLight: true, monitor: true, cooling: true, cam: 'cold' });
}

function runOne(levels, night, seed, bot, grace = 0) {
  const G = Core.createGame({ night, levels, seed, noItsMe: true, grace });
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const b = bot();
  let evs = [];
  while (!G.over) evs = Core.step(G, DT, b(G, evs, rng));
  return G;
}

function simulate(levels, night, { runs = 1000, seed = 1, bot = goodBot, grace = 0 } = {}) {
  let wins = 0, power = 0; const deaths = {}, ts = [];
  for (let i = 0; i < runs; i++) {
    const G = runOne(levels, night, seed + i, bot, grace);
    ts.push(G.t);
    if (G.result === 'win') { wins++; power += G.power; }
    else deaths[G.killer] = (deaths[G.killer] || 0) + 1;
  }
  ts.sort((x, y) => x - y);
  return { runs, wins, winRate: wins / runs, deaths, avgPowerLeft: wins ? power / wins : 0, medianT: ts[Math.floor(ts.length / 2)] };
}

function simNight(night, opts = {}) { return simulate(opts.levels || NIGHTS[night].levels, night, { grace: NIGHTS[night].grace || 0, ...opts }); }
function simCustom(levels, opts = {}) { return simulate(levels, 7, opts); }

if (require.main === module) {
  const runs = +process.argv[2] || 1000;
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const r = simNight(n, { runs, seed: 1000 * n });
    console.log(`Gece ${n}: kazanma %${(r.winRate * 100).toFixed(1)}  elektrik %${r.avgPowerLeft.toFixed(0)}  ölümler ${JSON.stringify(r.deaths)}`);
  }
  const all20 = { pasta: 20, avukat: 20, sahil: 20, sayici: 20, muh: 20, arda: 20, sultan: 20, denek5: 20 };
  const r = simCustom(all20, { runs: runs * 5, seed: 9, bot: expertBot });
  console.log(`20/20 (uzman bot): ${r.wins}/${r.runs} kazanma  ölümler ${JSON.stringify(r.deaths)}`);
}

module.exports = { simNight, simCustom, goodBot, expertBot, passiveBot, wastefulBot };
