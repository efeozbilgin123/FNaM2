const test = require('node:test');
const assert = require('node:assert');
const { Core, game, run } = require('./helpers');

function sahilAtMouth(G) { G.sahil.stage = 3; G.sahil.t = 7; G.sahil.hide = 0; }

test('Sahil at the mouth leaves if the sheet is held 5 s before he attacks', () => {
  const G = game(2); sahilAtMouth(G);
  run(G, 2); run(G, 5.1, { sheet: true }); run(G, 1);
  assert.ok(!G.over); assert.strictEqual(G.sahil.stage, 0);
});

test('Sahil kills when there is no sheet', () => {
  const G = game(2); sahilAtMouth(G);
  const evs = run(G, 8);
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'sahil'));
});

test('lifting the sheet early gives only 2 s before Sahil attacks', () => {
  const G = game(2); sahilAtMouth(G);
  run(G, 1, { sheet: true });
  run(G, 1.9);
  assert.ok(!G.over);
  const evs = run(G, 0.3);
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'sahil'));
});

test('Sahil advancing makes a drag sound and pending.sheet is set at the mouth', () => {
  const G = game(2, { sahil: 20 });
  const evs = run(G, 17);
  assert.ok(evs.filter(e => e.type === 'sound' && e.id === 'drag' && !e.fake).length >= 3);
  assert.strictEqual(G.sahil.stage, 3); assert.strictEqual(G.pending.sheet, true);
});

test('Sayıcı counts 4, 5, 6 four seconds apart', () => {
  const G = game(3); G.sayici.count = 4; G.sayici.t = 0; G.sayici.active = true;
  const evs = run(G, 9, { sheet: true });
  const said = evs.filter(e => e.type === 'sound' && /^say/.test(e.id)).map(e => e.id);
  assert.deepStrictEqual(said, ['say5', 'say6']);
  assert.ok(!G.over);
});

test('Sayıcı kills at six without the sheet', () => {
  const G = game(3); G.sayici.count = 4; G.sayici.t = 0; G.sayici.active = true;
  const evs = run(G, 9);
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'sayici'));
});

test('vent light makes Sayıcı count twice as fast', () => {
  const G = game(3); G.sayici.count = 4; G.sayici.t = 0; G.sayici.active = true;
  const evs = run(G, 4.2, { ventLight: true });
  assert.ok(evs.some(e => e.type === 'death' && e.who === 'sayici'));
});

test('Sayıcı starts with say4 when a roll succeeds', () => {
  const G = game(3, { sayici: 20 });
  const evs = run(G, 6.1, { sheet: true });
  assert.ok(evs.some(e => e.type === 'sound' && e.id === 'say4'));
});

test('sheet during Sultan forces the monitor off so he does not kill', () => {
  const G = game(4); G.sultan.phase = 'here'; G.sultan.t = 8;
  run(G, 9, { sheet: true, monitor: true, ventLight: true });
  assert.ok(!G.over);
});
