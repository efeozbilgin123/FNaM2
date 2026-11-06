const test = require('node:test');
const assert = require('node:assert');
const { Core, game, run } = require('./helpers');
const { hack } = Core._internal;

const P = Core.PARAMS;
test('Denek 5 warms by D5_BASE + D5_PER_LV*lv per second without cooling', () => {
  const G = game(1, { denek5: 3 });
  run(G, 10);
  assert.ok(Math.abs(G.denek5.temp - 10 * (P.D5_BASE + 3 * P.D5_PER_LV)) < 0.05, 'temp ' + G.denek5.temp);
});

test('Denek 5 at 100 kills 4 s later', () => {
  const G = game(1, { denek5: 3 }); G.denek5.temp = 99.9;
  const evs = run(G, 6);
  const d = evs.find(e => e.type === 'death');
  assert.ok(d && d.who === 'denek5');
  assert.ok(G.t > 4 && G.t < 4.3, 'died at ' + G.t);
});

test('cooling lowers temperature by 6/s and stops at 0', () => {
  const G = game(1, { denek5: 3 }); G.denek5.temp = 10;
  run(G, 1, { monitor: true, cam: 'cold', cooling: true });
  assert.ok(G.denek5.temp < 10 - 5 && G.denek5.temp > 0);
  run(G, 5, { monitor: true, cam: 'cold', cooling: true });
  assert.strictEqual(G.denek5.temp, 0);
});

test('cooling cannot save you once the drawer has opened', () => {
  const G = game(1, { denek5: 3 }); G.denek5.temp = 99.95;
  run(G, 0.2);
  const evs = run(G, 5, { monitor: true, cam: 'cold', cooling: true });
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'denek5'));
});

test('rattle sound when temp is 70 or more', () => {
  const G = game(1, { denek5: 3 }); G.denek5.temp = 72;
  const evs = run(G, 4);
  assert.ok(evs.some(e => e.type === 'sound' && e.id === 'rattle'));
  const H = game(1, { denek5: 3 }); H.denek5.temp = 30;
  assert.ok(!run(H, 4).some(e => e.id === 'rattle'));
});

test('a hack on the cold cam freezes shown temperature while real temp rises', () => {
  const G = game(1, { denek5: 5 }); G.denek5.temp = 20;
  hack(G, 'cold');
  run(G, 5);
  assert.strictEqual(Core.shownTemp(G), 20);
  assert.ok(G.denek5.temp > 20 + 5 * (P.D5_BASE + 5 * P.D5_PER_LV) - 0.1, 'real temp ' + G.denek5.temp);
});

test('holding reboot 3 s clears the hack; 2.9 s does not', () => {
  const G = game(1, { muh: 0 }); hack(G, 'corr');
  run(G, 2.9, { monitor: true, cam: 'corr', reboot: 'corr' });
  assert.strictEqual(G.muh.cam, 'corr');
  run(G, 0.5);
  run(G, 3.05, { monitor: true, cam: 'corr', reboot: 'corr' });
  assert.strictEqual(G.muh.cam, null);
});

test('reboot blinds the camera while held', () => {
  const G = game(1, {}); hack(G, 'corr');
  run(G, 1, { monitor: true, cam: 'corr', reboot: 'corr' });
  assert.strictEqual(G.dev.camBlind, true);
});

test('an unfixed hack kills after 25 s', () => {
  const G = game(1, {}); hack(G, 'archive');
  const evs = run(G, 26);
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'muh'));
});

test('Mühendis at level 0 never hacks; at 20 hacks within one tick', () => {
  const G = game(1, { muh: 0 });
  assert.ok(!run(G, 120).some(e => e.type === 'hack'));
  const H = game(1, { muh: 20 });
  const evs = run(H, P.MUH_TICK + 1);
  assert.ok(evs.some(e => e.type === 'hack' && Core.CAMS.includes(e.cam)));
});
