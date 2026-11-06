const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Her şeyi kabul eden sahte Web Audio: her özellik çağrılabilir bir düğüm/parametre döndürür.
function fakeNode() {
  const f = function () { return fakeNode(); };
  return new Proxy(f, {
    get(t, k) {
      if (k === 'value' || k === 'currentTime' || k === 'sampleRate') return k === 'sampleRate' ? 8000 : 0;
      if (k === 'state') return 'running';
      if (k === 'getChannelData') return () => new Float32Array(8000 * 7);
      if (k === Symbol.toPrimitive) return () => 0;
      return t[k] !== undefined ? t[k] : (t[k] = fakeNode());
    },
    set(t, k, v) { t[k] = v; return true; },
  });
}
function loadAudio() {
  const store = {};
  const ctx = {
    window: { AudioContext: function () { return fakeNode(); } },
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
    setTimeout: () => 0, clearTimeout: () => {}, Math, Float32Array, Promise, console,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'audio.js'), 'utf8') + '\nthis.Audio5 = Audio5;', ctx);
  ctx.Audio5.init();
  return ctx.Audio5;
}

const NEW_SFX = ['knock', 'drag', 'say', 'miyav', 'rattle', 'drawer', 'motor', 'reboot', 'phoneRing', 'breath', 'sheet', 'flashClick'];

test('every new sound effect exists and plays without throwing', () => {
  const A = loadAudio();
  for (const name of NEW_SFX) {
    assert.strictEqual(typeof A.sfx[name], 'function', name + ' missing');
    assert.doesNotThrow(() => A.sfx[name](0.5), name);
  }
  for (const n of [4, 5, 6]) for (const fake of [false, true]) assert.doesNotThrow(() => A.sfx.say(n, fake));
});

test('morgAmbience and playVoice exist', () => {
  const A = loadAudio();
  assert.strictEqual(typeof A.morgAmbience, 'function');
  assert.doesNotThrow(() => A.morgAmbience());
  assert.strictEqual(typeof A.playVoice, 'function');
});
