const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function listedAssets() {
  const md = fs.readFileSync(path.join(root, 'ASSETS.md'), 'utf8');
  return [...new Set([...md.matchAll(/`(img\/[^`]+\.png)`/g)].map(m => m[1]))];
}

test('ASSETS.md lists the required core images', () => {
  const a = listedAssets();
  for (const req of ['img/office.png', 'img/sheet.png', 'img/corr/lit.png', 'img/vent/sahil.png',
    'img/doorway/avukat.png', 'img/cam/cold.png', 'img/scare/itsme.png', 'img/doc/paper.png', 'img/ending.png'])
    assert.ok(a.includes(req), req + ' missing from ASSETS.md');
});

test('every listed asset exists as a PNG', () => {
  for (const rel of listedAssets()) {
    const p = path.join(root, rel);
    assert.ok(fs.existsSync(p), rel + ' does not exist');
    const sig = fs.readFileSync(p).subarray(0, 8).toString('hex');
    assert.strictEqual(sig, '89504e470d0a1a0a', rel + ' is not a PNG');
  }
});
