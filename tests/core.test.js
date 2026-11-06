const test = require('node:test');
const assert = require('node:assert');
const { Core, IDLE, game, run } = require('./helpers');

test('new game starts at t=0 with full power', () => {
  const G = game();
  assert.strictEqual(G.t, 0); assert.strictEqual(G.power, 100); assert.strictEqual(G.over, false);
});

test('a night with no threats is won after 300 s with exactly one win event', () => {
  const G = game();
  const evs = run(G, 301);
  assert.strictEqual(G.result, 'win');
  assert.strictEqual(evs.filter(e => e.type === 'win').length, 1);
});

test('usage: base, devices, night multiplier', () => {
  const G = game(1);
  Core.step(G, 0.01, IDLE);
  assert.ok(Math.abs(Core.usage(G) - 0.08) < 1e-9);
  Core.step(G, 0.01, { ...IDLE, doorL: true, monitor: true, cooling: true });
  assert.ok(Math.abs(Core.usage(G) - (0.08 + .16 + .06 + .14)) < 1e-9);
  const G3 = game(3); Core.step(G3, 0.01, IDLE);
  assert.ok(Math.abs(Core.usage(G3) - 0.08 * 1.08) < 1e-9);
});

test('sheet forces lights, flash, monitor and cooling off but keeps the door', () => {
  const G = game();
  Core.step(G, 0.05, { ...IDLE, sheet: true, doorL: true, lightL: true, flash: true, ventLight: true, monitor: true, cooling: true });
  const d = G.dev;
  assert.deepStrictEqual([d.sheet, d.doorL, d.lightL, d.flash, d.ventLight, d.monitor, d.cooling], [true, true, false, false, false, false, false]);
});

test('with the monitor down, cooling, cam and reboot are ignored', () => {
  const G = game();
  Core.step(G, 0.05, { ...IDLE, monitor: false, cooling: true, cam: 'cold', reboot: 'cold' });
  assert.strictEqual(G.dev.cooling, false); assert.strictEqual(G.dev.cam, null); assert.strictEqual(G.dev.reboot, null);
});

test('power out: one powerout event, devices off, then death within 10-20 s', () => {
  const G = game(); G.power = 0.01;
  const evs = run(G, 25, { doorL: true });
  assert.strictEqual(evs.filter(e => e.type === 'powerout').length, 1);
  const d = evs.find(e => e.type === 'death');
  assert.ok(d && d.who === 'powerout');
  assert.ok(G.t >= 10 && G.t <= 20.1, 'died at ' + G.t);
});

test('power out near 6 AM is a win', () => {
  const G = game(); G.t = 295; G.power = 0.01;
  run(G, 10);
  assert.strictEqual(G.result, 'win');
});

test('a big dt is split into sub-steps (same result as many small steps)', () => {
  const A = game(1, {}, 7), B = game(1, {}, 7);
  const inp = { ...IDLE, doorL: true };
  Core.step(A, 2, inp);
  for (let i = 0; i < 40; i++) Core.step(B, 0.05, inp);
  assert.ok(Math.abs(A.t - B.t) < 1e-9); assert.ok(Math.abs(A.power - B.power) < 1e-9);
});

test('after the game is over, step returns nothing and time stops', () => {
  const G = game(); G.power = 0.01; run(G, 25);
  assert.ok(G.over);
  const t = G.t;
  assert.deepStrictEqual(Core.step(G, 1, IDLE), []);
  assert.strictEqual(G.t, t);
});
