const test = require('node:test');
const assert = require('node:assert');
const { Core, game, run } = require('./helpers');

function fakeGame(mimic = 'sahil') {
  const G = game(4, { sahil: 1, sayici: 1, avukat: 1 });
  Core._internal.startFake(G, mimic);
  return G;
}

test('Arda fakes a drag sound and ends it with a miyav', () => {
  const G = fakeGame('sahil');
  const evs = run(G, 6.2);
  assert.ok(evs.some(e => e.type === 'sound' && e.id === 'miyav' && e.fake));
  assert.strictEqual(G.arda.fake, null);
});

test('Arda at level 20 eventually produces a fake sound', () => {
  const G = game(4, { arda: 20, sahil: 1, sayici: 1, avukat: 1 });
  const evs = run(G, Core.PARAMS.ARDA_TICK + 1);
  assert.ok(evs.some(e => e.type === 'sound' && e.fake === true));
});

test('hiding during a fake counts one mistake per window', () => {
  const G = fakeGame('sahil');
  run(G, 1, { sheet: true }); run(G, 0.5); run(G, 1, { sheet: true });
  assert.strictEqual(G.arda.mistakes, 1);
});

test('closing the door during a fake knock is a mistake', () => {
  const G = fakeGame('avukat');
  run(G, 1, { doorL: true });
  assert.strictEqual(G.arda.mistakes, 1);
});

test('hiding when Sahil is really at the mouth is not a mistake', () => {
  const G = fakeGame('sahil'); G.sahil.stage = Core.PARAMS.SAHIL_MOUTH; G.sahil.t = 7;
  run(G, 1, { sheet: true });
  assert.strictEqual(G.arda.mistakes, 0);
});

test('the third mistake kills', () => {
  const G = fakeGame('sahil'); G.arda.mistakes = 2;
  const evs = run(G, 1, { sheet: true });
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'arda'));
});

test('ITS ME appears in about 3% of nights', () => {
  let n = 0;
  for (let s = 1; s <= 2000; s++) if (Core.createGame({ night: 1, levels: {}, seed: s }).itsme.at != null) n++;
  assert.ok(n >= 40 && n <= 80, 'count ' + n);
});

test('ITS ME fires once; crash variant ends the game as itsme', () => {
  const G = game(1); G.itsme = { at: 1, variant: 'crash', done: false };
  const evs = run(G, 3);
  assert.strictEqual(evs.filter(e => e.type === 'itsme').length, 1);
  assert.strictEqual(G.result, 'itsme');
  const H = game(1); H.itsme = { at: 1, variant: 'cam', done: false };
  run(H, 3);
  assert.ok(!H.over);
});

test('re-closing the door while the real Avukat is knocking is not an Arda mistake', () => {
  const G = fakeGame('avukat'); G.avukat.at = true; G.avukat.knock = 5;
  run(G, 0.2, { doorL: true }); run(G, 0.2); run(G, 0.2, { doorL: true });
  assert.strictEqual(G.arda.mistakes, 0);
});

test('Arda never starts a mimic while Sahil is in the vents, and Sahil waits while Arda mimics', () => {
  const { Core, game, run } = require('./helpers');
  const G = game(4, { arda: 20, sahil: 0 }); G.sahil.stage = 2;
  const evs = run(G, Core.PARAMS.ARDA_TICK * 3);
  assert.ok(!G.arda.fake && !evs.some(e => e.fake));
  const H = game(4, { arda: 0, sahil: 20 }); Core._internal.startFake(H, 'avukat');
  const st = H.sahil.stage; run(H, Core.PARAMS.SAHIL_TICK * 1.1);
  assert.strictEqual(H.sahil.stage, st);
});
