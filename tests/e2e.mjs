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

if (globalThis.EXTRA_E2E) await globalThis.EXTRA_E2E(check, { boot, startNight });
await browser.close(); server.kill();
console.log(results.join('\n'));
console.log(`# pass ${results.length - failed}\n# fail ${failed}`);
process.exit(failed ? 1 : 0);
