// Yavaş denge testi: npm run balance
const test = require('node:test');
const assert = require('node:assert');
const { simNight, simCustom, passiveBot, wastefulBot, expertBot } = require('../tools/sim.js');
const { NIGHTS } = require('../nights.js');

const TARGET = { 1: [0.85, 1], 2: [0.70, 0.85], 3: [0.45, 0.60], 4: [0.30, 0.45], 5: [0.08, 0.15], 6: [0.02, 0.06] };

for (const n of [1, 2, 3, 4, 5, 6]) {
  test(`night ${n} good-bot win rate in ${TARGET[n]}`, () => {
    const r = simNight(n, { runs: 2000, seed: 1000 * n });
    assert.ok(r.winRate >= TARGET[n][0] && r.winRate <= TARGET[n][1], `night ${n}: ${(r.winRate * 100).toFixed(1)}% deaths ${JSON.stringify(r.deaths)}`);
  });
}

test('night 1: winners end with 30-40% power on average', () => {
  const r = simNight(1, { runs: 2000, seed: 77 });
  assert.ok(r.avgPowerLeft >= 30 && r.avgPowerLeft <= 40, 'power ' + r.avgPowerLeft.toFixed(1));
});

test('night 1: a passive bot dies to characters, not to power', () => {
  const r = simNight(1, { runs: 300, seed: 5, bot: passiveBot });
  assert.ok(r.winRate < 0.05);
  assert.ok(!r.deaths.powerout, JSON.stringify(r.deaths));
});

test('night 1: a wasteful bot runs out of power', () => {
  const r = simNight(1, { runs: 300, seed: 6, bot: wastefulBot, levels: { ...NIGHTS[1].levels, pasta: 0, avukat: 0 } });
  assert.ok(r.deaths.powerout / 300 > 0.9, JSON.stringify(r.deaths));
});

// 20/20: bot hiç kazanamıyor (bkz. ledger kararı); en azından anında ölmemeli ve kazanma <%1 olmalı.
test('20/20 is under 1% and the expert bot is not killed instantly', () => {
  const r = simCustom({ pasta: 20, avukat: 20, sahil: 20, sayici: 20, muh: 20, arda: 20, sultan: 20, denek5: 20 }, { runs: 2000, seed: 9, bot: expertBot });
  assert.ok(r.winRate < 0.01, `20/20: ${r.wins} wins`);
  assert.ok(r.medianT >= 30, 'median survival ' + r.medianT);
});
