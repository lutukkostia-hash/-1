// Проверка баланса осад без браузера.
// Запуск из корня репозитория:  node tools/siege_balance.js
// Берёт данные и движок боя прямо из index.html (от начала основного <script> до /*SIEGE_SIM_END*/).
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const code = html.slice(html.lastIndexOf('<script>\n') + 9, html.indexOf('/*SIEGE_SIM_END*/'));
const G = new Function(code + `
  function formatNum(n) { return String(Math.round(n)); }
  return { HERO_DEFS, SIEGE_LADDER, SIEGE_TIERS, SG_ROUNDS, sgDeckUnits, sgBattleFoes, simulateBattle, sgLevelFor, sgTopLevelFor, sgSize,
           heroSiegeStats, statPower, rankCost };`)();

const ids = G.HERO_DEFS.map(d => d.id);
const fmt = n => n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n));

// Урон одной атаки колодой из 10 героев одинакового ранга по боссу «своего» уровня
function attack(r, top, power, N = 12) {
  const ranks = Object.fromEntries(ids.map(id => [id, r]));
  const deck = ids.slice().sort((a, b) => G.statPower(G.heroSiegeStats(b, r)) - G.statPower(G.heroSiegeStats(a, r)));
  const R = r * ids.length, L = top ? G.sgTopLevelFor(R) : G.sgLevelFor(R);
  const b = { id: 1, L, size: G.sgSize(L), loc: 'volcano', key: 'boss_volcano', name: 'X', maxHp: G.SIEGE_LADDER[L].hp };
  let dead = 0, dmg = 0, wipes = 0, rounds = 0;
  for (let k = 0; k < N; k++) {
    const u = G.sgDeckUnits(deck.slice(0, 6), deck.slice(6, 10), ranks, { power });
    const bf = G.sgBattleFoes(Object.assign({}, b, { hp: b.maxHp * 100 }));     // пул не кончается: меряем чистый урон за 10 раундов
    const res = G.simulateBattle({ front: u.front, reserve: u.reserve, foes: bf.foes, summonAt: bf.summonAt, seed: 31 + k * 977, lite: true });
    dead += res.units.filter(x => x.side === 0 && !x.alive).length; dmg += res.dmgBoss; rounds += res.rounds;
    if (res.reason === 'wipe') wipes++;
  }
  return { L, b, dead: dead / N, dmg: dmg / N, wipes, rounds: rounds / N };
}

console.log('Атака колодой 6+4 по боссу своего уровня (среднее по 12 боям)');
for (const r of [1, 2, 3, 5, 8, 12, 17, 21]) {
  const a = attack(r, false, false), p = attack(r, false, true, 6);
  console.log(`  ранг ${String(r).padStart(2)} → L${String(a.L).padStart(2)} ${fmt(a.b.maxHp).padStart(7)} (${G.sgSize(a.L)}, ${fmt(G.SIEGE_LADDER[a.L].v)} очк.):` +
    ` обычная ${(a.dmg / a.b.maxHp * 100).toFixed(1)}%, мощная ${(p.dmg / a.b.maxHp * 100).toFixed(0)}% (×${(p.dmg / a.dmg).toFixed(1)}),` +
    ` пало ${a.dead.toFixed(1)}/10${a.wipes ? `, разгромов ${a.wipes}` : ''}`);
}
console.log('Большие Боссы (ББ):');
for (const r of [3, 6, 12, 20]) {
  const a = attack(r, true, false, 6);
  console.log(`  ранг ${String(r).padStart(2)} → ${fmt(a.b.maxHp).padStart(7)}: обычная ${(a.dmg / a.b.maxHp * 100).toFixed(2)}% (${fmt(a.dmg)}), пало ${a.dead.toFixed(1)}/10`);
}

let sum = 0;
const cum = [];
for (let r = 1; r < 40; r++) { sum += G.rankCost(r); if ([5, 10, 15, 20, 30, 39].includes(r + 1)) cum.push(`${r + 1}: ${sum}`); }
console.log('Медалей на одного героя до ранга —', cum.join(', '));
let m = 0;
const tiers = G.SIEGE_TIERS.map(([t, r]) => { m += r.m || 0; return [t, m]; }).filter((x, i) => [4, 9, 14, 19, 24, 32].includes(i));
console.log('Медалей с порогов недели (накопительно) —', tiers.map(([t, s]) => `${fmt(t)}: ${s}`).join(', '));
