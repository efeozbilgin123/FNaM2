const Core = require('../core.js');
const ZERO = { pasta:0, avukat:0, sahil:0, sayici:0, muh:0, arda:0, sultan:0, denek5:0 };
const IDLE = { doorL:false, lightL:false, flash:false, ventLight:false, monitor:false, cooling:false, sheet:false, cam:null, reboot:null };
function game(night = 1, lv = {}, seed = 1) {
  return Core.createGame({ night, levels: { ...ZERO, ...lv }, seed, noItsMe: true });
}
function run(G, sec, inp = {}, dt = 0.05) {
  const evs = []; const n = Math.round(sec / dt);
  for (let i = 0; i < n; i++) evs.push(...Core.step(G, dt, { ...IDLE, ...(typeof inp === 'function' ? inp(G) : inp) }));
  return evs;
}
module.exports = { Core, ZERO, IDLE, game, run };
