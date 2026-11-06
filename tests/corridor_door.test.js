const test = require('node:test');
const assert = require('node:assert');
const { Core, game, run } = require('./helpers');

function pastaAtEnd(G) { G.pasta.stage = 3; G.pasta.window = 6; G.pasta.flashT = 0; }

test('Pasta at stage 3 is driven back by 1.2 s of flashlight', () => {
  const G = game(1); pastaAtEnd(G);
  run(G, 1.25, { flash: true }); run(G, 6);
  assert.strictEqual(G.pasta.stage, 0); assert.strictEqual(G.over, false);
});

test('Pasta kills if flashed only 1.1 s', () => {
  const G = game(1); pastaAtEnd(G);
  run(G, 1.1, { flash: true });
  const evs = run(G, 6);
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
  const evs = run(G, 19, { doorL: true });
  assert.ok(!G.over);
  assert.ok(evs.some(e => e.type === 'sound' && e.id === 'knock'));
  const expected = (0.08 + 0.16) * 19 + 1.2;
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
