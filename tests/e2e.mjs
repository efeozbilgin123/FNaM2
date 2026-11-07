// Tarayıcı duman testi: npm run e2e
import { createRequire } from 'module';
import { spawn } from 'child_process';
import assert from 'node:assert';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PORT = 8765 + Math.floor(Math.random() * 500);
const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: new URL('..', import.meta.url).pathname, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const browser = await chromium.launch();
let failed = 0;
const results = [];
async function check(name, fn) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  try { await fn(page, errors); results.push('ok - ' + name); }
  catch (e) { failed++; results.push('not ok - ' + name + '\n    ' + e.message.split('\n')[0]); }
  await ctx.close();
}
const URL0 = `http://localhost:${PORT}/index.html`;
async function boot(page) {
  await page.goto(URL0);
  await page.waitForFunction(() => window.__m5g && window.__m5g.ready, null, { timeout: 20000 });
  await page.click('#splash');
  await page.waitForSelector('#title.on', { timeout: 5000 });
}
async function startNight(page, n = 1, opts = {}) {
  await page.evaluate(([n, o]) => window.__m5g.startNight(n, o), [n, opts]);
  await page.waitForSelector('#game.on', { timeout: 5000 });
}

// ---- Task 9: ofis ----
await check('menu loads without console errors', async (page, errors) => {
  await boot(page);
  assert.ok(await page.isVisible('#bNew'));
  assert.deepStrictEqual(errors, []);
});
await check('new game goes through the document to night 1', async (page) => {
  await boot(page);
  await page.click('#bNew');
  await page.waitForSelector('#doc.on', { timeout: 5000 });
  await page.click('#doc');
  await page.waitForSelector('#game.on', { timeout: 8000 });
  assert.strictEqual(await page.evaluate(() => window.__game.night), 1);
});
await check('F held turns the flashlight on', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.down('f'); await page.waitForTimeout(200);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.flash), true);
  await page.keyboard.up('f'); await page.waitForTimeout(200);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.flash), false);
});
await check('S pulls the sheet and drops the monitor', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.press('Space'); await page.waitForTimeout(700);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.monitor), true);
  await page.keyboard.press('s'); await page.waitForTimeout(300);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.sheet), true);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.monitor), false);
});
await check('a missing image does not break the game loop', async (page, errors) => {
  await page.route('**/img/corr/lit.png', r => r.fulfill({ status: 404, body: '' }));
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.down('f');
  const t0 = await page.evaluate(() => window.__game.t);
  await page.waitForTimeout(600);
  await page.keyboard.up('f');
  assert.ok(await page.evaluate(() => window.__game.t) > t0);
  assert.deepStrictEqual(errors, []);
});

// ---- Task 10: kameralar ----
async function openCold(page) {
  await page.keyboard.press('Space'); await page.waitForTimeout(700);
  await page.keyboard.press('3'); await page.waitForTimeout(700); // kamera uygulaması açılır
}
await check('toggle mode: one press turns the flashlight on, a second press turns it off', async (page) => {
  await page.addInitScript(() => localStorage.setItem('m5g_morg_opts', JSON.stringify({ toggle: true })));
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.press('f'); await page.waitForTimeout(200);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.flash), true);
  await page.keyboard.press('f'); await page.waitForTimeout(200);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.flash), false);
});
await check('toggle mode: lights switch off when the monitor opens and stay off after it closes', async (page) => {
  await page.addInitScript(() => localStorage.setItem('m5g_morg_opts', JSON.stringify({ toggle: true })));
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.press('a'); await page.waitForTimeout(200);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.lightL), true);
  await page.keyboard.press('Space'); await page.waitForTimeout(900); await page.keyboard.press('Space'); await page.waitForTimeout(900);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.lightL), false);
});
await check('holding C on the cold cam lowers the temperature', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.evaluate(() => { window.__game.denek5.temp = 50; });
  await openCold(page);
  await page.keyboard.down('c'); await page.waitForTimeout(800); await page.keyboard.up('c');
  assert.ok(await page.evaluate(() => window.__game.denek5.temp) < 47);
});
await check('a hacked cold cam shows an unreadable temperature and locks cooling', async (page) => {
  await boot(page); await startNight(page, 2, { quiet: true });
  await page.evaluate(() => { window.__game.denek5.temp = 30; Core._internal.hack(window.__game, 'cold'); });
  await openCold(page);
  assert.ok(!/\d/.test(await page.textContent('#tempTxt')), 'temperature should be unreadable');
  assert.strictEqual(await page.textContent('#bCool'), 'KİLİTLİ');
  await page.keyboard.down('c'); await page.waitForTimeout(600); await page.keyboard.up('c');
  assert.ok(await page.evaluate(() => window.__game.denek5.temp) >= 30);
});
await check('holding R for 3 s reboots the hacked camera', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.evaluate(() => Core._internal.hack(window.__game, 'cold'));
  await openCold(page);
  await page.keyboard.down('r'); await page.waitForTimeout(3400); await page.keyboard.up('r');
  assert.strictEqual(await page.evaluate(() => window.__game.muh.cam), null);
});

// ---- Task 11: ekranlar ----
await check('Custom Night is hidden on a fresh save and shown at maxNight 7', async (page) => {
  await boot(page);
  assert.strictEqual(await page.isVisible('#bCustom'), false);
  await page.evaluate(() => localStorage.setItem('m5g_morg', JSON.stringify({ maxNight: 7, docs: [], itsme: [], custom2020: false })));
  await boot(page);
  assert.strictEqual(await page.isVisible('#bCustom'), true);
});
await check('the 20/20 preset sets every level to 20', async (page) => {
  await page.goto(URL0);
  await page.evaluate(() => localStorage.setItem('m5g_morg', JSON.stringify({ maxNight: 7, docs: [], itsme: [], custom2020: false })));
  await boot(page);
  await page.click('#bCustom'); await page.waitForSelector('#custom.on');
  await page.click('#cpresets [data-p="max"]');
  const v = await page.$$eval('#ccards .v', s => s.map(x => +x.textContent));
  assert.deepStrictEqual(v, Array(8).fill(20));
});
await check('a forced death shows the jumpscare, then game over', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.evaluate(() => { window.__game.pasta.stage = 3; window.__game.pasta.window = 0.01; });
  await page.waitForSelector('#scare.on', { timeout: 3000 });
  assert.ok((await page.getAttribute('#scareImg', 'src')).includes('scare/pasta'));
  await page.waitForSelector('#over.on', { timeout: 6000 });
});
await check('winning a night shows 6 AM and unlocks the next night', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.evaluate(() => { window.__game.t = 299.9; });
  await page.waitForSelector('#six.on', { timeout: 3000 });
  assert.strictEqual(await page.evaluate(() => window.__m5g.save().maxNight), 2);
});

// ---- son inceleme düzeltmeleri ----
await check('losing window focus releases held keys', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.down('f'); await page.waitForTimeout(150);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(150);
  assert.strictEqual(await page.evaluate(() => window.__game.dev.flash), false);
});
await check('flicking the monitor fast never leaves it powered but hidden', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.press('Space'); await page.waitForTimeout(200);
  await page.keyboard.press('Space'); await page.waitForTimeout(300);
  await page.keyboard.press('Space'); await page.waitForTimeout(900);
  const [mon, shown] = await page.evaluate(() => [window.__game.dev.monitor, document.getElementById('cam').classList.contains('on')]);
  assert.strictEqual(shown, mon, `monitor powered=${mon} but overlay shown=${shown}`);
});

await check('an office variant replaces the flat door overlay when it exists', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.down('a'); await page.waitForTimeout(250);
  const [on, hidden] = await page.evaluate(() => [!!document.querySelector('#v_door_lit.on'), document.getElementById('game').classList.contains('vdoor')]);
  await page.keyboard.up('a');
  assert.ok(on && hidden, `variant on=${on} flat hidden=${hidden}`);
});
await check('without variants the flat door overlay is used', async (page) => {
  await page.route('**/img/office_v/**', r => r.fulfill({ status: 404, body: '' }));
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.down('a'); await page.waitForTimeout(250);
  assert.strictEqual(await page.evaluate(() => document.querySelectorAll('.vimg.on').length), 0);
  assert.strictEqual(await page.evaluate(() => document.getElementById('game').classList.contains('vdoor')), false);
  await page.keyboard.up('a');
});
await check('the repair app fixes a hacked camera with the mouse; a healthy one reports no problem', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.press('Space'); await page.waitForTimeout(800);
  await page.evaluate(() => Core._internal.hack(window.__game, 'cold'));
  await page.click('#bStart'); await page.click('#startMenu .smi[data-app="fix"]'); await page.waitForTimeout(500);
  await page.click('#fixList div[data-cam="lift"]'); await page.click('#bFix'); await page.waitForTimeout(3400);
  assert.strictEqual(await page.textContent('#fixMsg'), 'Sorun bulunamadı.');
  assert.strictEqual(await page.evaluate(() => window.__game.muh.cam), 'cold');
  await page.click('#fixList div[data-cam="cold"]'); await page.click('#bFix'); await page.waitForTimeout(3400);
  assert.strictEqual(await page.evaluate(() => window.__game.muh.cam), null);
  assert.ok((await page.textContent('#fixMsg')).includes('onarıldı'));
});

await check('the PC starts on an empty desktop and lore files open in Notepad', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.press('Space'); await page.waitForTimeout(800);
  assert.strictEqual(await page.evaluate(() => document.querySelectorAll('.win.open').length), 0);
  await page.dblclick('.dicon[data-app="pc"]'); await page.waitForTimeout(600);
  await page.dblclick('#pcFiles .file:has-text("MORG_ARSIV")'); await page.dblclick('#pcFiles .file:has-text("nobet_defteri")'); await page.waitForTimeout(600);
  assert.ok((await page.textContent('#noteText')).includes('DENEK 6'));
});

await check('closing the door shows the steel shutter', async (page) => {
  await boot(page); await startNight(page, 1, { quiet: true });
  await page.keyboard.press('q'); await page.waitForTimeout(500);
  const [op, tr] = await page.evaluate(() => { const e = document.getElementById('vDoorS'); const c = getComputedStyle(e); return [c.opacity, c.transform]; });
  assert.strictEqual(op, '1', 'shutter opacity ' + op);
  assert.ok(tr === 'none' || tr === 'matrix(1, 0, 0, 1, 0, 0)', 'shutter transform ' + tr);
});

await check('right-click menu and image dragging are disabled', async (page) => {
  await boot(page);
  const [ctx, drag] = await page.evaluate(() => {
    const c = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); document.body.dispatchEvent(c);
    const d = new DragEvent('dragstart', { bubbles: true, cancelable: true }); document.querySelector('img').dispatchEvent(d);
    return [c.defaultPrevented, d.defaultPrevented];
  });
  assert.ok(ctx && drag, `contextmenu prevented=${ctx} dragstart prevented=${drag}`);
});

await browser.close(); server.kill();
console.log(results.join('\n'));
console.log(`# pass ${results.length - failed}\n# fail ${failed}`);
process.exit(failed ? 1 : 0);
