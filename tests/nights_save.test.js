const test = require('node:test');
const assert = require('node:assert');
const { NIGHTS, DOCS } = require('../nights.js');
const Save = require('../save.js');

test('night roster: who appears when', () => {
  assert.ok(NIGHTS[1].levels.pasta > 0 && NIGHTS[1].levels.avukat > 0 && NIGHTS[1].levels.denek5 > 0);
  assert.strictEqual(NIGHTS[1].levels.sahil, 0);
  assert.ok(NIGHTS[2].levels.sahil > 0); assert.strictEqual(NIGHTS[2].levels.sayici, 0);
  assert.ok(NIGHTS[3].levels.sayici > 0 && NIGHTS[3].levels.muh > 0);
  assert.strictEqual(NIGHTS[3].levels.arda, 0); assert.strictEqual(NIGHTS[3].levels.sultan, 0);
  assert.ok(NIGHTS[4].levels.arda > 0 && NIGHTS[4].levels.sultan > 0);
  for (let n = 1; n <= 6; n++) for (const c in NIGHTS[n].levels) assert.ok(NIGHTS[n].levels[c] >= 0 && NIGHTS[n].levels[c] <= 20);
});

test('each night 1-5 has a document and a phone call; docs have title and html', () => {
  for (let n = 1; n <= 5; n++) {
    assert.ok(DOCS[NIGHTS[n].doc], 'doc for night ' + n);
    assert.ok(DOCS[NIGHTS[n].doc].title && DOCS[NIGHTS[n].doc].html.length > 100);
    assert.strictEqual(NIGHTS[n].phone, `voice/phone${n}.mp3`);
  }
  assert.ok(DOCS.secret && DOCS.secret.html.length > 50);
});

function mem(init) { const m = { ...init }; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m }; }

test('load returns defaults on empty, corrupt or throwing storage', () => {
  const def = { maxNight: 1, night: 1, docs: [], itsme: [], custom2020: false };
  assert.deepStrictEqual(Save.load(mem({})), def);
  assert.deepStrictEqual(Save.load(mem({ m5g_morg: '{bozuk' })), def);
  assert.deepStrictEqual(Save.load({ getItem() { throw new Error('denied'); } }), def);
  assert.deepStrictEqual(Save.load(mem({ m5g_morg: '{"maxNight":"x"}' })), def);
});

test('save then load round-trips', () => {
  const s = mem({});
  Save.save({ maxNight: 4, docs: ['doc1'], itsme: ['cam'], custom2020: false }, s);
  assert.strictEqual(Save.load(s).maxNight, 4);
});

test('save never throws on a broken storage', () => {
  assert.doesNotThrow(() => Save.save({ maxNight: 2, docs: [], itsme: [], custom2020: false }, { setItem() { throw new Error('quota'); } }));
});

test('newGame resets the night but keeps the archive and unlocks', () => {
  const p = Save.newGame({ maxNight: 7, docs: ['doc1'], itsme: ['cam'], custom2020: true });
  assert.strictEqual(p.night, 1);
  assert.deepStrictEqual(p.docs, ['doc1']); assert.deepStrictEqual(p.itsme, ['cam']);
  assert.strictEqual(p.custom2020, true); assert.strictEqual(p.maxNight, 7);
});

test('unlock rules', () => {
  let p = { maxNight: 1, docs: [], itsme: [], custom2020: false };
  p = Save.unlock(p, { night: 1, result: 'win' }); assert.strictEqual(p.maxNight, 2);
  p = Save.unlock(p, { night: 1, result: 'win' }); assert.strictEqual(p.maxNight, 2);
  p = Save.unlock(p, { night: 3, result: 'death' }); assert.strictEqual(p.maxNight, 2);
  p = Save.unlock({ ...p, maxNight: 5 }, { night: 5, result: 'win' }); assert.strictEqual(p.maxNight, 6);
  p = Save.unlock(p, { night: 6, result: 'win' }); assert.strictEqual(p.maxNight, 7);
  p = Save.unlock(p, { night: 7, result: 'win', levels: { a: 20, b: 19 } }); assert.strictEqual(p.custom2020, false);
  p = Save.unlock(p, { night: 7, result: 'win', levels: { a: 20, b: 20 } }); assert.strictEqual(p.custom2020, true);
  p = Save.unlock(p, { night: 2, result: 'itsme', itsme: 'crash' }); assert.deepStrictEqual(p.itsme, ['crash']);
  p = Save.unlock(p, { night: 2, result: 'death', itsme: 'crash' }); assert.deepStrictEqual(p.itsme, ['crash']);
  p = Save.unlock(p, { night: 2, result: 'death', doc: 'doc2' }); assert.deepStrictEqual(p.docs, ['doc2']);
});
