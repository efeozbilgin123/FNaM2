const test = require('node:test');
const assert = require('node:assert');
const { Core, game, run } = require('./helpers');

const P = Core.PARAMS;
function pastaAtEnd(G) { G.pasta.stage = 3; G.pasta.window = P.PASTA_WINDOW; G.pasta.flashT = 0; }

test('Pasta at stage 3 is driven back by PASTA_FLASH seconds of flashlight', () => {
  const G = game(1); pastaAtEnd(G);
  run(G, P.PASTA_FLASH + 0.05, { flash: true }); run(G, P.PASTA_WINDOW);
  assert.strictEqual(G.pasta.stage, 0); assert.strictEqual(G.over, false);
});

test('Pasta kills if flashed too briefly', () => {
  const G = game(1); pastaAtEnd(G);
  run(G, P.PASTA_FLASH - 0.1, { flash: true });
  const evs = run(G, P.PASTA_WINDOW);
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'pasta'));
});

test('flash does nothing to Pasta before stage 3', () => {
  const G = game(1); G.pasta.stage = 1;
  run(G, 3, { flash: true });
  assert.strictEqual(G.pasta.stage, 1);
});

test('Avukat does not kill with the door closed and drains extra power while knocking', () => {
  const G = game(1); G.avukat.at = true; G.avukat.t = 0;
  const p0 = G.power;
  const T = P.AVUKAT_ATTACK + P.AVUKAT_KNOCK + 1;
  const evs = run(G, T, { doorL: true });
  assert.ok(!G.over);
  assert.ok(evs.some(e => e.type === 'sound' && e.id === 'knock'));
  const expected = (P.POWER_BASE + P.POWER_DEV.doorL) * T + P.AVUKAT_DRAIN * P.AVUKAT_KNOCK;
  assert.ok(Math.abs((p0 - G.power) - expected) < 0.1, 'used ' + (p0 - G.power));
  assert.strictEqual(G.avukat.at, false);
});

test('Avukat kills if the door is open when he attacks', () => {
  const G = game(1); G.avukat.at = true; G.avukat.t = 0;
  const evs = run(G, 9);
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'avukat'));
});

test('Sultan here: monitor on kills', () => {
  const G = game(1); G.sultan.phase = 'here'; G.sultan.t = 8;
  const evs = run(G, 1, { monitor: true });
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'sultan'));
});

test('Sultan here: everything off survives, closed door is allowed', () => {
  const G = game(1); G.sultan.phase = 'here'; G.sultan.t = 8;
  run(G, 9, { doorL: true });
  assert.ok(!G.over); assert.strictEqual(G.sultan.phase, 'none');
});

test('Sultan approach lasts 6 s with motor sound, then here', () => {
  const G = game(1); G.sultan.phase = 'approach'; G.sultan.t = 6;
  const evs = run(G, 6.1);
  assert.strictEqual(G.sultan.phase, 'here');
  assert.ok(evs.some(e => e.type === 'phase' && e.who === 'sultan' && e.phase === 'here'));
});

test('characters at level 0 never move', () => {
  const G = game(1);
  const evs = run(G, 120);
  assert.strictEqual(G.pasta.stage, 0); assert.strictEqual(G.avukat.at, false); assert.strictEqual(G.sultan.phase, 'none');
  assert.ok(!evs.some(e => e.type === 'move'));
});

test('Pasta at level 20 advances and reports moves', () => {
  const G = game(1, { pasta: 20 });
  const evs = run(G, 11);
  assert.ok(G.pasta.stage >= 2);
  assert.ok(evs.some(e => e.type === 'move' && e.who === 'pasta'));
});

test('movement under the flashlight knocks it out for a while (FNaF style)', () => {
  const G = game(1, { pasta: 20 });
  run(G, Core.PARAMS.PASTA_TICK + 0.2, { flash: true });           // Pasta ışık altında ilerler
  assert.ok(G.lightOut.flash > 0, 'flash should be out');
  run(G, 0.2, { flash: true });
  assert.strictEqual(G.dev.flash, false);
  run(G, Core.PARAMS.LIGHT_OUT + 0.1, {});
  run(G, 0.1, { flash: true });
  assert.strictEqual(G.dev.flash, true);
});

test('Avukat arriving under the door light knocks the door light out', () => {
  const G = game(1, { avukat: 20 }); G.avukat.pos = 'lift';
  run(G, Core.PARAMS.AVUKAT_TICK + 0.2, { lightL: true });
  assert.ok(G.lightOut.lightL > 0);
  assert.strictEqual(G.dev.lightL, false);
});
