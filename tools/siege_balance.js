// Проверка баланса осад без браузера.
// Запуск из корня репозитория:  node tools/siege_balance.js
// Берёт данные и движок боя прямо из index.html (между началом основного <script> и /*SIEGE_SIM_END*/).
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const code = html.slice(html.lastIndexOf('<script>\n') + 9, html.indexOf('/*SIEGE_SIM_END*/'));
const G = new Function(code + `
  function formatNum(n) { return String(Math.round(n)); }
  return { HERO_DEFS, squadUnits, siegeStageDef, simulateBattle, siegeWinChance, rankCost };`)();

const ranks = r => Object.fromEntries(G.HERO_DEFS.map(d => [d.id, r]));
const squads = {
  'первые 3': ['ena', 'brath', 'feral'],
  'ранние 5': ['ena', 'brath', 'feral', 'rage', 'tikola'],
  'с танком': ['rage', 'brath', 'tikola', 'frost', 'paladin']
};

console.log('Минимальный одинаковый ранг отряда для шанса победы ≥ 60% (осада:ранг)');
for (const [name, ids] of Object.entries(squads)) {
  const row = [];
  for (let s = 1; s <= 20; s++) {
    let r = 1;
    while (r < 200 && G.siegeWinChance(ids, ranks(r), s, 30) < 0.6) r++;
    row.push(`${s}:${r}`);
  }
  console.log(name.padEnd(9), row.join(' '));
}

let rounds = 0, timeouts = 0, n = 0;
const ids = squads['ранние 5'];
for (let s = 1; s <= 16; s++) for (let r = 1; r <= 40; r += 3) {
  const res = G.simulateBattle(G.squadUnits(ids, ranks(r)), G.siegeStageDef(s).foes, s * 97 + r);
  n++; rounds += res.rounds; if (res.reason === 'time') timeouts++;
}
console.log(`Средняя длина боя: ${(rounds / n).toFixed(1)} ходов, таймаутов ${timeouts} из ${n}`);

let sum = 0;
const cum = [];
for (let r = 1; r < 40; r++) { sum += G.rankCost(r); if ([5, 10, 15, 20, 30, 39].includes(r + 1)) cum.push(`${r + 1}: ${sum}`); }
console.log('Медалей на одного героя до ранга —', cum.join(', '));
