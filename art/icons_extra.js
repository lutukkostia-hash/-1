const ART_ICON_EXTRA = (() => {
  // ---- helpers: same conventions as ART_ICON (kept local to this IIFE; deterministic) ----
  const O = '#1d1220';
  const f = (n) => +n.toFixed(1);
  const SV = (defs, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${defs ? '<defs>' + defs + '</defs>' : ''}${body}</svg>`;
  // (stroke-linecap is only emitted when the path has open subpaths: identical rendering, fewer bytes)
  const closed = (d) => (d.match(/M/g) || []).length === (d.match(/Z/g) || []).length;
  const st = (sw = 5, d = '') => `stroke="${O}" stroke-width="${sw}" stroke-linejoin="round"${closed(d) ? '' : ' stroke-linecap="round"'}`;
  const ol = (d, sw = 5) => `<path d="${d}" fill="none" ${st(sw, d)}/>`;
  const fp = (d, fill, sw = 0, extra = '') =>
    `<path d="${d}" fill="${fill}"${sw ? ' ' + st(sw, d) : ''}${extra}/>`;
  const C = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z`;
  const rr = (x, y, w, h, r) =>
    `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  const poly = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
  const stops = (s) =>
    s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  // cel-shaded part: shadow colour shows lower-right, base shifted up-left, outline on top
  const P = (id, d, base, shade, extra = '', t = '-6 -6', sw = 5) =>
    `<clipPath id="${id}"><path d="${d}"/></clipPath>` +
    `<g clip-path="url(#${id})"><path d="${d}" fill="${shade}"/><path d="${d}" fill="${base}" transform="translate(${t})"/>${extra}</g>` +
    ol(d, sw);
  const HL = (d, w = 6, o = 0.85, c = '#fff') =>
    `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  const spark = (x, y, s, fill = '#fff', sw = 0) => {
    const k = s * 0.2;
    const d = `M${x} ${y - s}Q${f(x + k)} ${f(y - k)} ${x + s} ${y}Q${f(x + k)} ${f(y + k)} ${x} ${y + s}Q${f(x - k)} ${f(y + k)} ${x - s} ${y}Q${f(x - k)} ${f(y - k)} ${x} ${y - s}Z`;
    return fp(d, fill, sw);
  };
  const bar = (d, w, fill, hi) =>
    `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + 7}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>` +
    (hi || '');
  const star = (cx, cy, R, r, n = 5, rot = -90) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = ((rot + (i * 180) / n) * Math.PI) / 180;
      pts.push([cx + (i % 2 ? r : R) * Math.cos(a), cy + (i % 2 ? r : R) * Math.sin(a)]);
    }
    return poly(pts);
  };
  // scale+translate an absolute path made only of coordinate pairs (M/L/Q/C/Z)
  const tp = (d, s, tx, ty) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, x, y) => f(+x * s + tx) + ' ' + f(+y * s + ty));
  const glow = (id, cx, cy, r) => fp(C(cx, cy, r), `url(#${id})`);

  // palette (as ART_ICON)
  const GOLD = lg('gd', [[0, '#fff1a0'], [0.45, '#ffc93a'], [1, '#e88a1c']], 0.1, 0, 0.9, 1);
  const GOLDSH = '#a8560f';
  const STEEL = lg('sl', [[0, '#ffffff'], [0.5, '#d3dbe6'], [1, '#8f9cb2']], 0.1, 0, 0.9, 1);
  const STEELSH = '#5d6a84';
  const WOOD = '#b5683a';

  // shared shapes
  const HEART = 'M64 30C58 16 48 12 40 12C22 12 10 26 10 46C10 76 40 98 64 116C88 98 118 76 118 46C118 26 106 12 88 12C80 12 70 16 64 30Z';
  const DROP = 'M64 8C78 32 100 54 100 80C100 102 84 118 64 118C44 118 28 102 28 80C28 54 50 32 64 8Z';
  const FLAME = 'M62 4C70 18 80 26 80 42C88 36 96 30 98 20C110 36 116 56 112 76C108 104 88 122 64 122C38 122 18 106 16 80C14 62 20 46 30 34C32 44 38 50 46 54C44 34 50 18 62 4Z';
  const FLAME_IN = 'M64 46C72 60 88 70 86 90C84 106 74 114 64 114C52 114 42 106 42 90C42 76 56 66 64 46Z';
  const FLAME_CORE = 'M64 74C68 84 76 90 75 100C74 106 70 109 64 109C58 109 53 105 53 99C53 90 61 84 64 74Z';

  // ===================== UI =====================
  const siege = (() => {
    const TOP = 'M18 30H40V40H54V30H74V40H88V30H110V58H18Z';
    const BODY = 'M31 56H97L104 121H24Z';
    const DOOR = 'M52 121V103Q52 90 64 90Q76 90 76 103V121Z';
    const PEN = 'M66 6Q88 0 113 9L98 16L112 24Q88 31 66 27Z';
    return SV(
      GOLD + lg('s', [[0, '#f6f4fb'], [0.5, '#c0bcd4'], [1, '#8e89a9']], 0, 0, 0.8, 1) +
      lg('r', [[0, '#ff6a5a'], [1, '#c81e30']], 0, 0, 1, 1) +
      lg('w', [[0, '#d0874a'], [1, '#8a4a1c']], 0, 0, 0.6, 1),
      bar('M64 34V9', 5, '#8a5a3a') +
      P('f', PEN, 'url(#r)', '#7a0e1e', '', '-3 -3', 4) +
      fp(C(64, 7, 5), 'url(#gd)', 3.5) +
      P('b', BODY, 'url(#s)', '#55506e',
        `<path d="M20 80H108M20 101H108M48 58V80M80 58V80M36 80V101M64 80V90M92 80V101M48 101V122M80 101V122" stroke="#7d7898" stroke-width="3.5"/>` +
        HL('M38 66V112', 4, 0.6), '-8 -5') +
      P('t', TOP, 'url(#s)', '#55506e', HL('M24 36V50', 3.5, 0.7), '-6 -5') +
      fp(rr(59, 64, 10, 18, 5), O) +
      P('d', DOOR, 'url(#w)', '#4a2410', `<path d="M60 92V121M68 92V121" stroke="#5a2c12" stroke-width="3"/>`, '-3 -3', 4.5)
    );
  })();

  const medal = (() => {
    const L = poly([[22, 4], [50, 4], [80, 70], [58, 80]]);
    const R = poly([[78, 4], [106, 4], [70, 80], [48, 70]]);
    const sp = (r, a) => f(64 + r * Math.cos(a)) + ' ' + f(86 + r * Math.sin(a));
    let ED = 'M' + sp(31, 0);
    for (let i = 0; i < 16; i++) ED += 'Q' + sp(37.5, ((i + 0.5) * Math.PI) / 8) + ' ' + sp(31, ((i + 1) * Math.PI) / 8);
    ED += 'Z';
    return SV(
      GOLD + lg('rb', [[0, '#ff6a5a'], [1, '#c01a2e']], 0, 0, 1, 1),
      P('l', L, 'url(#rb)', '#6e0a1a', `<path d="M36 4L69 75" stroke="#ffc93a" stroke-width="7"/>`, '-4 -2') +
      P('r', R, 'url(#rb)', '#6e0a1a', `<path d="M92 4L59 75" stroke="#ffc93a" stroke-width="7"/>`, '-4 -2') +
      P('m', ED, 'url(#gd)', GOLDSH,
        `<circle cx="64" cy="86" r="23" fill="none" stroke="#d07a1c" stroke-width="4"/>` +
        HL('M38 80A27 27 0 0 1 56 61', 5, 0.8), '-6 -6') +
      fp(star(64, 87, 15, 6.5), '#e8303f', 4)
    );
  })();

  const torch = (() => {
    const s = 0.6, tx = 80 - 64 * s, ty = 76 - 122 * s;
    return SV(
      GOLD + lg('fo', [[0, '#ff6a1e'], [0.6, '#ff9a22'], [1, '#ffc22a']], 0, 0, 0, 1) +
      lg('wd', [[0, '#d0874a'], [1, '#8a4a1c']], 0, 0, 1, 1) +
      rg('g', [[0, '#ffd24a', 0.8], [0.6, '#ff9a2a', 0.3], [1, '#ff8a1e', 0]]),
      `<g transform="translate(-6 0)">` +
      glow('g', 80, 36, 48) +
      P('fl', tp(FLAME, s, tx, ty), 'url(#fo)', '#c2380c',
        fp(tp(FLAME_IN, s, tx, ty), '#ffe45a') + fp(tp(FLAME_CORE, s, tx, ty), '#fffbe6') +
        HL(tp('M34 74Q32 56 44 42', s, tx, ty), 3.5, 0.75, '#fff3c0'), '-4 -3') +
      `<g transform="rotate(36 74 66)">` +
      P('h', 'M64 74H84L79 130Q74 136 69 130Z', 'url(#wd)', '#5a2a10',
        `<path d="M64 92L84 87M65 106L83 101" stroke="#6a3416" stroke-width="4"/>` + HL('M70 82V122', 3, 0.5, '#ffd0a0'), '-4 -3') +
      P('c', 'M50 56H98L89 78H59Z', 'url(#gd)', GOLDSH, `<path d="M54 65H94" stroke="#c87618" stroke-width="4"/>` + HL('M56 60H76', 3, 0.85), '-4 -3') +
      `</g></g>`
    );
  })();

  const rank = (() => {
    const ch = (y) => `M64 ${y}L112 ${y + 30}V${y + 48}L64 ${y + 18}L16 ${y + 48}V${y + 30}Z`;
    let s = '';
    [12, 42, 72].forEach((y, i) => {
      s += P('c' + i, ch(y), 'url(#gd)', GOLDSH,
        `<path d="M20 ${y + 39}L64 ${y + 10}L108 ${y + 39}" fill="none" stroke="#e08a1c" stroke-width="3" stroke-linejoin="round" opacity=".7"/>` +
        HL(`M24 ${y + 33}L62 ${y + 8}`, 3.5, 0.85), '-4 -4');
    });
    return SV(GOLD, s);
  })();

  // ===================== stats =====================
  const hp = SV(
    lg('h', [[0, '#ff7a80'], [0.5, '#f02840'], [1, '#b00c2a']], 0, 0, 0.7, 1),
    P('a', HEART, 'url(#h)', '#6e0618',
      HL('M24 46Q24 28 40 24', 7, 0.9) + fp(C(25, 62, 4), '#fff', 0, ' opacity=".85"'), '-8 -7')
  );

  const atk = SV(
    GOLD + STEEL,
    `<g transform="translate(3 15) rotate(45 64 64)">` +
    bar('M64 22V110', 10, WOOD, HL('M62 60V82', 3, 0.6, '#f0b070')) +
    fp(rr(56, 86, 16, 22, 4), '#c8283a', 4) +
    `<path d="M56 93L72 90M56 100L72 97" stroke="#6e0d1e" stroke-width="3.5"/>` +
    fp('M70 28L92 38L70 48Z', 'url(#sl)', 4.5) +
    P('b', 'M58 24C44 20 30 12 21 2C2 18 -1 62 21 82C30 70 44 58 58 52Z', 'url(#sl)', STEELSH,
      HL('M17 12C7 30 6 54 17 72', 4.5, 0.95) + `<path d="M31 14C22 30 22 54 31 70" fill="none" stroke="#a9b5c8" stroke-width="3"/>`, '-5 -4') +
    P('s', rr(54, 16, 20, 42, 6), 'url(#gd)', GOLDSH, HL('M59 22V50', 3, 0.8), '-3 -3', 4.5) +
    fp(C(64, 113, 7.5), 'url(#gd)', 4) +
    `</g>`
  );

  const def = (() => {
    let rv = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      rv += C(f(64 + 49.5 * Math.cos(a)), f(64 + 49.5 * Math.sin(a)), 3.2);
    }
    rv = fp(rv, '#4e5a74');
    return SV(
      STEEL + rg('bl', [[0, '#7cc4ff'], [0.6, '#2f7ce8'], [1, '#1a4cb8']], 0.35, 0.3, 0.8),
      P('r', C(64, 64, 57), 'url(#sl)', STEELSH, rv + HL('M22 50A44 44 0 0 1 50 22', 4, 0.9), '-6 -6') +
      P('b', C(64, 64, 41), 'url(#bl)', '#0c2c78',
        `<circle cx="64" cy="64" r="28" fill="none" stroke="#1d52b8" stroke-width="4"/>` +
        HL('M34 56A31 31 0 0 1 56 34', 5, 0.75, '#cfe8ff'), '-6 -6', 4.5) +
      P('c', C(64, 64, 14), 'url(#sl)', STEELSH, '', '-3 -3', 4.5) + fp(C(60, 60, 3), '#fff')
    );
  })();

  const wis = SV(
    GOLD + rg('g', [[0, '#d9a0ff', 0.9], [0.55, '#a050ff', 0.4], [1, '#9040ff', 0]]) +
    rg('og', [[0, '#ffffff'], [0.22, '#ecc8ff'], [0.6, '#a855ff'], [1, '#5418c0']], 0.36, 0.3, 0.75),
    glow('g', 64, 56, 62) +
    P('o', C(64, 52, 38), 'url(#og)', '#2a0866',
      `<path d="M42 62Q50 40 72 42Q88 46 84 62" fill="none" stroke="#f3dcff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` +
      HL('M36 46A30 30 0 0 1 52 26', 6, 0.95), '-7 -7') +
    P('u', 'M32 72Q64 92 96 72L88 100H40Z', 'url(#gd)', GOLDSH, '', '-4 -3') +
    P('v', rr(30, 98, 68, 16, 7), 'url(#gd)', GOLDSH, HL('M38 104H70', 3, 0.8), '-4 -4') +
    spark(106, 18, 10, '#fff', 3) + spark(20, 30, 7, '#fff', 3)
  );

  const agi = (() => {
    const V = 'M66 4C88 16 96 38 93 60L84 64L92 70C88 88 78 98 67 104H61C47 98 37 86 36 68L45 63L37 57C38 32 48 14 66 4Z';
    return SV(
      lg('fe', [[0, '#f6fffd'], [0.45, '#bff6ee'], [1, '#3cc6ba']], 0, 0, 1, 1),
      bar('M58 108Q88 100 102 72', 7, '#bff7f0') + bar('M84 118Q106 110 114 92', 6, '#6ee0d6') +
      `<g transform="translate(-6 -6) rotate(40 64 64)">` +
      bar('M64 96V126', 5, '#e8fffb') +
      P('v', V, 'url(#fe)', '#1f8a86',
        `<path d="M66 14C67 42 66 72 64 102" fill="none" stroke="#fff" stroke-width="4"/>` +
        `<path d="M67 34L84 24M67 50L88 38M66 80L84 72M64 42L46 32M64 72L44 62" stroke="#4cc2b8" stroke-width="3.5"/>`, '-6 -4') +
      `</g>`
    );
  })();

  // ===================== class badges =====================
  const badge = (pl, sh, sym, defs = '') => {
    let studs = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      studs += C(f(64 + 52 * Math.cos(a)), f(64 + 52 * Math.sin(a)), 2.8);
    }
    studs = fp(studs, '#7a3e14');
    return SV(
      lg('bz', [[0, '#ffe0a8'], [0.45, '#dc9a50'], [1, '#9a5420']], 0.1, 0, 0.9, 1) + rg('pl', pl, 0.38, 0.32, 0.75) + defs,
      P('r', C(64, 64, 58), 'url(#bz)', '#4e2408', studs + HL('M20 52A46 46 0 0 1 52 20', 4, 0.8, '#fff3d8'), '-6 -6') +
      P('p', C(64, 64, 46), 'url(#pl)', sh, '', '-5 -5', 4.5) + sym
    );
  };

  const clsWarrior = badge(
    [[0, '#ff8a7a'], [0.55, '#e0303a'], [1, '#8e1222']], '#5a0814',
    `<g transform="rotate(-45 64 64)">` +
    bar('M64 30V104', 6, WOOD) + fp(C(64, 106, 5), 'url(#gd)', 4) +
    P('ab', 'M60 26C50 24 42 20 36 14C26 26 26 48 36 60C42 54 50 50 60 48Z', '#e2e7ef', STEELSH, HL('M33 22Q28 36 33 52', 3, 0.9), '-3 -3', 4.5) +
    fp(rr(59, 24, 10, 22, 3), '#aab5c6', 4) + `</g>` +
    `<g transform="rotate(45 64 64)">` +
    fp('M64 20L56 30V82H64Z', '#f4f7fb') + fp('M64 20L72 30V82H64Z', '#97a4ba') + ol('M64 20L72 30V82H56V30Z', 4.5) +
    fp(rr(59, 86, 10, 16, 3), '#c8283a', 4) +
    fp(rr(44, 80, 40, 9, 4), 'url(#gd)', 4) + fp(C(64, 106, 6), 'url(#gd)', 4) + `</g>`,
    GOLD
  );

  const clsMage = badge(
    [[0, '#e6a8ff'], [0.55, '#9a40e0'], [1, '#56168e']], '#2e0a52',
    P('h', 'M39 84C46 66 52 46 58 32C62 22 70 16 80 18C88 20 95 27 99 40C91 33 83 33 79 39C77 55 81 70 89 84Z', 'url(#ht)', '#141a60',
      HL('M48 74Q54 52 62 34', 4, 0.6), '-5 -4') +
    P('m', 'M24 84Q64 68 104 84Q64 102 24 84Z', 'url(#ht)', '#141a60', '', '-3 -4', 4.5) +
    fp(star(63, 57, 12.5, 5.5), 'url(#gd)', 3.5),
    GOLD + lg('ht', [[0, '#7ab8ff'], [1, '#2a48c8']], 0, 0, 1, 1)
  );

  const clsRanger = badge(
    [[0, '#b8f590'], [0.55, '#3cb04a'], [1, '#1a6a2a']], '#0c3a16',
    `<g transform="rotate(-45 64 64)">` +
    `<path d="M46 28L28 64L46 100" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>` +
    bar('M46 28Q84 34 84 64Q84 94 46 100', 7, '#d08a48') +
    bar('M30 64H96', 4, '#f0c890') +
    fp('M110 64L94 55V73Z', 'url(#sl)', 4) +
    fp('M38 62L28 52H40L48 62ZM38 66L28 76H40L48 66Z', '#e8303f', 3.5) + `</g>`,
    STEEL
  );

  const clsGuardian = badge(
    [[0, '#9ad6ff'], [0.55, '#2f7ce0'], [1, '#163e96']], '#0a2052',
    P('s', 'M40 28Q64 20 88 28V78Q88 96 64 106Q40 96 40 78Z', 'url(#gd)', GOLDSH,
      fp('M47 33Q64 28 81 33V77Q81 91 64 99Q47 91 47 77Z', 'url(#sl)', 3.5), '-5 -4') +
    fp(C(64, 62, 9), 'url(#gd)', 4) + fp(C(61.5, 59.5, 2.5), '#fff'),
    GOLD + STEEL
  );

  // ===================== siege skills =====================
  const lens = (ax, ay, bx, by, w, bend) => {
    const mx = (ax + bx) / 2, my = (ay + by) / 2, L = Math.hypot(bx - ax, by - ay);
    const nx = -(by - ay) / L, ny = (bx - ax) / L;
    const c1 = [mx + nx * 2 * (bend + w / 2), my + ny * 2 * (bend + w / 2)];
    const c2 = [mx + nx * 2 * (bend - w / 2), my + ny * 2 * (bend - w / 2)];
    return `M${f(ax)} ${f(ay)}Q${f(c1[0])} ${f(c1[1])} ${f(bx)} ${f(by)}Q${f(c2[0])} ${f(c2[1])} ${f(ax)} ${f(ay)}Z`;
  };

  const skStrike = (() => {
    const S = [[116, 79, 58, 7], [100, 107, 27, 16], [70, 117, 12, 45]];
    let s = '';
    S.forEach(([ax, ay, bx, by], i) => {
      s += P('s' + i, lens(ax, ay, bx, by, 23, 8), 'url(#sr)', '#9a1020', fp(lens(ax, ay, bx, by, 9, 10), '#fff6e6'), '-3 -3', 4.5);
    });
    return SV(
      lg('sr', [[0, '#ffa070'], [0.5, '#f5342a'], [1, '#b8101e']], 0, 0, 1, 1),
      `<g transform="translate(3 3)">` + s + spark(14, 14, 11, '#fff3b0', 3.5) + spark(112, 110, 8, '#fff3b0', 3) + `</g>`
    );
  })();

  const skAoe = (() => {
    const J = [1, 0.84, 0.96, 0.8, 1, 0.88, 0.82, 0.98, 0.86, 0.94, 0.8, 0.92];
    const burst = (R1, R2, rot) => {
      const pts = [];
      for (let i = 0; i < 24; i++) {
        const a = rot + (i * Math.PI) / 12;
        const r = i % 2 ? R2 : R1 * J[i / 2];
        pts.push([64 + r * Math.cos(a), 64 + r * Math.sin(a)]);
      }
      return poly(pts);
    };
    return SV(
      lg('o', [[0, '#ffb43a'], [0.5, '#ff6a1e'], [1, '#e0301a']], 0, 0, 1, 1) +
      rg('g', [[0, '#ffb040', 0.7], [1, '#ff6a1e', 0]]),
      glow('g', 64, 64, 64) +
      P('a', burst(60, 38, -Math.PI / 2), 'url(#o)', '#8e1a0a',
        fp(burst(42, 26, -Math.PI / 2 + Math.PI / 12), '#ffd23a') + fp(C(64, 64, 17), '#fff6c8'), '-6 -6')
    );
  })();

  const skHeal = SV(
    lg('h', [[0, '#b8ffb4'], [0.5, '#3fd86a'], [1, '#13994a']], 0, 0, 0.7, 1) +
    rg('g', [[0, '#7dff9a', 0.7], [0.6, '#3fd86a', 0.25], [1, '#3fd86a', 0]]),
    glow('g', 60, 66, 60) +
    P('a', tp(HEART, 0.84, 6, 16), 'url(#h)', '#0b5a2c',
      HL('M26 54Q26 40 40 36', 6, 0.9) + fp(C(27, 68, 3.5), '#fff', 0, ' opacity=".85"'), '-7 -6') +
    spark(108, 20, 13, '#f0ffe8', 3.5) + spark(114, 58, 7, '#f0ffe8', 3) + spark(20, 112, 8, '#f0ffe8', 3)
  );

  const skShield = (() => {
    const SH = 'M64 6C80 16 96 20 112 18C114 62 102 98 64 122C26 98 14 62 16 18C32 20 48 16 64 6Z';
    const hx = (x, y, s) => poly([0, 1, 2, 3, 4, 5].map((k) => [x + s * Math.cos(((k * 60 - 90) * Math.PI) / 180), y + s * Math.sin(((k * 60 - 90) * Math.PI) / 180)]));
    const cs = [[0, 0]].concat([0, 1, 2, 3, 4, 5].map((k) => [26 * Math.cos((k * Math.PI) / 3), 26 * Math.sin((k * Math.PI) / 3)]));
    const hex = cs.map(([dx, dy]) => hx(64 + dx, 60 + dy, 15)).join('');
    return SV(
      rg('g', [[0, '#7af0ff', 0.75], [0.6, '#3ac8ff', 0.3], [1, '#3ac8ff', 0]]) +
      rg('sf', [[0, '#f0ffff', 0.95], [0.45, '#7ae8ff', 0.8], [1, '#1a96e0', 0.85]], 0.35, 0.25, 0.85),
      glow('g', 64, 64, 63) +
      `<clipPath id="c"><path d="${SH}"/></clipPath><g clip-path="url(#c)">` +
      fp(SH, '#0a5a9a', 0, ' opacity=".8"') + fp(SH, 'url(#sf)', 0, ' transform="translate(-6 -6)"') +
      `<path d="${hex}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" opacity=".55"/>` +
      `<path d="${SH}" fill="none" stroke="#d8ffff" stroke-width="6" opacity=".9"/>` +
      HL('M30 32Q32 68 50 94', 6, 0.8) +
      `</g>` + ol(SH) + spark(106, 14, 10, '#fff', 3)
    );
  })();

  const skBuff = (() => {
    const A = (cx, top, bot) => `M${cx} ${top}L${cx + 25} ${top + 30}H${cx + 11}V${bot}H${cx - 11}V${top + 30}H${cx - 25}Z`;
    return SV(
      rg('g', [[0, '#ffe066', 0.85], [0.55, '#ff8a2a', 0.35], [1, '#ff5a1e', 0]]) +
      lg('a', [[0, '#fff3a8'], [0.35, '#ffc93a'], [0.7, '#ff6a2a'], [1, '#d81f2a']], 0, 0, 0.3, 1),
      glow('g', 64, 64, 63) +
      P('l', A(42, 40, 116), 'url(#a)', '#7a0e14', HL('M30 68L42 54', 3.5, 0.85), '-4 -4') +
      P('r', A(86, 10, 100), 'url(#a)', '#7a0e14', HL('M74 38L86 24', 3.5, 0.85), '-4 -4') +
      spark(18, 24, 8, '#fff', 3) + spark(112, 114, 7, '#fff', 3)
    );
  })();

  const skDebuff = SV(
    STEEL + lg('p', [[0, '#f0c8ff'], [0.45, '#b45cff'], [1, '#5e1ab0']], 0, 0, 0.6, 1),
    `<g transform="translate(-3 0) rotate(-9 64 122)">` +
    P('s', 'M64 61L56 77L67 89L58 103L64 122Q28 104 30 66Q47 61 64 61Z', 'url(#sl)', STEELSH, HL('M38 74Q38 92 50 104', 4, 0.8), '-5 -5') +
    `</g><g transform="translate(3 0) rotate(9 64 122)">` +
    P('t', 'M64 61Q81 61 98 66Q100 104 64 122L58 103L67 89L56 77Z', 'url(#sl)', STEELSH, '', '-5 -5') + `</g>` +
    P('a', 'M64 84L94 50H77V6H51V50H34Z', 'url(#p)', '#34105e', HL('M57 12V46', 4, 0.8), '-5 -4')
  );

  const skStun = (() => {
    const pts = [];
    for (let t = 0; t <= 4 * Math.PI + 1e-9; t += Math.PI / 6) {
      const r = 4 + 2.95 * t;
      pts.push([64 + r * Math.cos(t + Math.PI / 2), 68 + r * Math.sin(t + Math.PI / 2)]);
    }
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++)
      d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f((pts[i][0] + pts[i + 1][0]) / 2)} ${f((pts[i][1] + pts[i + 1][1]) / 2)}`;
    const l = pts[pts.length - 1];
    d += `L${f(l[0])} ${f(l[1])}`;
    const sw = (w, c, x = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${x}/>`;
    return SV(
      '',
      `<ellipse cx="64" cy="60" rx="55" ry="19" transform="rotate(-16 64 60)" fill="none" stroke="${O}" stroke-width="8"/>` +
      `<ellipse cx="64" cy="60" rx="55" ry="19" transform="rotate(-16 64 60)" fill="none" stroke="#ffe680" stroke-width="3.5"/>` +
      sw(18, O) + sw(10, '#f0a01c') + sw(7, '#ffd83a', ' transform="translate(-1.5 -1.5)"') +
      sw(2.5, '#fff8c8', ' transform="translate(-2.5 -2.5)" opacity=".9"') +
      fp(star(17, 73, 12.5, 5.5), '#ffe23a', 3.5) + fp(star(108, 30, 13, 5.5), '#ffe23a', 3.5) + fp(star(98, 92, 10, 4.5), '#ffe23a', 3.5)
    );
  })();

  const skPoison = SV(
    lg('d', [[0, '#e4ff8a'], [0.5, '#8ae02a'], [1, '#3a9a12']], 0, 0, 0.7, 1) +
    rg('g', [[0, '#b0ff40', 0.7], [0.6, '#7ae02a', 0.25], [1, '#7ae02a', 0]]),
    glow('g', 58, 76, 58) +
    P('a', tp(DROP, 1, -8, 2), 'url(#d)', '#1e5a0a',
      fp(C(46, 94, 8), '#d8ff8a', 3) + fp(C(66, 78, 5), '#d8ff8a', 3) + fp(C(62, 106, 4), '#d8ff8a', 3) +
      HL('M34 82Q34 64 46 50', 6, 0.85), '-7 -6') +
    fp(C(102, 40, 10), '#c8ff6a', 4) + fp(C(99, 37, 3), '#fff') +
    fp(C(112, 72, 6), '#c8ff6a', 3.5) + fp(C(96, 12, 5), '#c8ff6a', 3.5)
  );

  const skBurn = SV(
    lg('o', [[0, '#ff4a1e'], [0.55, '#ff7a1e'], [1, '#ffb02a']], 0, 0, 0, 1) +
    rg('g', [[0, '#ff7a2a', 0.65], [1, '#ff4a1e', 0]]),
    glow('g', 64, 70, 62) +
    P('a', FLAME, 'url(#o)', '#9a1408', fp(FLAME_IN, '#ffc83a') + fp(FLAME_CORE, '#fff3b8'), '-7 -5') +
    fp(C(106, 8, 4), '#ffb02a', 3) + fp(C(20, 20, 3), '#ffb02a', 3)
  );

  const skFreeze = (() => {
    let d = '';
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 - Math.PI / 2;
      const ux = Math.cos(a), uy = Math.sin(a);
      d += `M64 64L${f(64 + 52 * ux)} ${f(64 + 52 * uy)}`;
      for (const s of [-1, 1]) {
        const b = a + s * 0.9;
        d += `M${f(64 + 30 * ux)} ${f(64 + 30 * uy)}L${f(64 + 30 * ux + 17 * Math.cos(b))} ${f(64 + 30 * uy + 17 * Math.sin(b))}`;
      }
    }
    const hexC = poly([0, 1, 2, 3, 4, 5].map((k) => [64 + 15 * Math.cos((k * Math.PI) / 3), 64 + 15 * Math.sin((k * Math.PI) / 3)]));
    return SV(
      `<linearGradient id="i" gradientUnits="userSpaceOnUse" x1="20" y1="14" x2="108" y2="114">${stops([[0, '#ffffff'], [0.5, '#c8ecff'], [1, '#7cc4f0']])}</linearGradient>` +
      rg('g', [[0, '#bfe8ff', 0.6], [1, '#8ad0ff', 0]]),
      glow('g', 64, 64, 62) +
      `<path d="${d}" fill="none" stroke="${O}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="#3f8fd0" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="url(#i)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1.5 -1.5)"/>` +
      P('h', hexC, 'url(#i)', '#3f8fd0', '', '-3 -3', 4.5)
    );
  })();

  const skRevive = (() => {
    const V = 'M62 2C66 12 72 18 76 22C80 20 84 16 86 10C93 26 93 44 89 60L80 63L87 69C84 86 76 96 66 102H62C50 96 42 84 41 70L49 66L42 60C41 46 44 34 48 26C46 22 42 18 40 12C48 16 54 20 56 22C56 14 58 8 62 2Z';
    return SV(
      lg('fv', [[0, '#ff3a1e'], [0.3, '#ff8a1e'], [0.65, '#ffc93a'], [1, '#fff3b0']], 0, 0, 0.25, 1) +
      rg('g', [[0, '#ffe066', 0.85], [0.55, '#ffb02a', 0.35], [1, '#ff8a1e', 0]]),
      glow('g', 64, 60, 62) +
      `<g transform="translate(0 2) rotate(24 64 64)">` +
      bar('M64 96V124', 5, '#ffe27a') +
      P('v', V, 'url(#fv)', '#a8300c',
        fp('M62 22C66 30 70 34 70 42C70 48 66 52 63 52C59 52 56 48 57 42C58 36 61 30 62 22Z', '#ffe45a') +
        `<path d="M64 52C65 70 65 86 64 100" fill="none" stroke="#fff6c8" stroke-width="4"/>` +
        `<path d="M65 66L84 56M65 82L82 74M63 72L46 64M63 88L50 82" stroke="#e8861c" stroke-width="3.5"/>`, '-6 -4') +
      `</g>` +
      spark(108, 98, 10, '#fff', 3) + spark(18, 28, 8, '#fff', 3) + spark(26, 104, 6, '#fff', 2.5)
    );
  })();

  const skLifesteal = (() => {
    const FL = 'M20 30C20 60 30 80 42 96C46 76 48 54 48 30Z';
    const FR = 'M108 30C108 60 98 80 86 96C82 76 80 54 80 30Z';
    return SV(
      lg('t', [[0, '#ffffff'], [0.55, '#f4ecdc'], [1, '#d6c4a0']], 0, 0, 0.8, 1) +
      lg('gm', [[0, '#ff6a7a'], [1, '#b01a3a']], 0, 0, 0.4, 1) +
      lg('d', [[0, '#ff6a72'], [0.5, '#e8213a'], [1, '#a00a26']], 0, 0, 0.7, 1),
      P('l', FL, 'url(#t)', '#9a8466', HL('M27 44Q29 66 38 82', 4.5, 0.9), '-6 -3') +
      P('r', FR, 'url(#t)', '#9a8466', fp('M70 76Q78 82 86 74Q94 82 112 76V110H70Z', '#d81f36') + HL('M87 44Q88 62 90 72', 4.5, 0.9), '-6 -3') +
      fp('M50 30H63V44Q63 50 56.5 50Q50 50 50 44ZM65 30H78V44Q78 50 71.5 50Q65 50 65 44Z', 'url(#t)', 4) +
      P('g', 'M9 18Q64 -2 119 18Q124 34 112 40Q100 32 88 38Q76 30 64 33Q52 30 40 38Q28 32 16 40Q4 34 9 18Z', 'url(#gm)', '#5e0418',
        HL('M18 20Q40 12 60 10', 4, 0.6, '#ffc0c8'), '-4 -4') +
      P('k', tp(DROP, 0.22, 87 - 64 * 0.22, 98 - 8 * 0.22), 'url(#d)', '#5e0414', '', '-3 -3', 4)
    );
  })();

  // ===================== floor DPS =====================
  const dpsTeam = SV(
    GOLD + lg('r', [[0, '#ff6a5a'], [0.5, '#e8283a'], [1, '#a40e24']], 0, 0, 1, 1),
    bar('M28 16V120', 7, WOOD, HL('M26 30V112', 2.5, 0.6, '#f0b070')) +
    P('b', 'M34 24H104C102 50 106 74 104 100L70 86L34 100C36 74 32 50 34 24Z', 'url(#r)', '#6e0a18',
      `<path d="M34 34H104" stroke="#ffc93a" stroke-width="6"/>` + HL('M42 44V86', 4, 0.6), '-6 -5') +
    fp(star(69, 60, 15, 6.5), 'url(#gd)', 4) +
    fp(rr(18, 16, 92, 11, 5), 'url(#gd)', 4) +
    fp('M28 0L37 14H19Z', 'url(#gd)', 4)
  );

  const dpsTime = SV(
    GOLD + lg('sd', [[0, '#ffd27a'], [1, '#e8862a']], 0, 0, 0, 1),
    bar('M30 20V108', 6, '#ffc93a') + bar('M98 20V108', 6, '#ffc93a') +
    `<clipPath id="g"><path d="M40 22H88C88 46 74 56 68 64C74 72 88 82 88 106H40C40 82 54 72 60 64C54 56 40 46 40 22Z"/></clipPath>` +
    `<g clip-path="url(#g)"><path d="M30 10H98V118H30Z" fill="#dff6ff"/>` +
    fp('M40 38H88C84 50 72 58 64 64C56 58 44 50 40 38Z', 'url(#sd)') +
    `<path d="M64 62V104" stroke="#e8862a" stroke-width="3.5"/>` +
    fp('M38 108C44 92 56 86 64 86C72 86 84 92 90 108Z', 'url(#sd)') +
    `<path d="M44 26C44 42 52 52 58 58" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>` +
    `<path d="M88 22C88 46 74 56 68 64C74 72 88 82 88 106" fill="none" stroke="#9ab8d0" stroke-width="5"/></g>` +
    ol('M40 22H88C88 46 74 56 68 64C74 72 88 82 88 106H40C40 82 54 72 60 64C54 56 40 46 40 22Z') +
    P('t', rr(20, 6, 88, 16, 7), 'url(#gd)', GOLDSH, HL('M28 11H72', 3, 0.8), '-3 -3') +
    P('b', rr(20, 106, 88, 16, 7), 'url(#gd)', GOLDSH, HL('M28 111H72', 3, 0.8), '-3 -3')
  );

  const dpsCrit = SV(
    lg('tr', [[0, '#ff6a5a'], [1, '#c01a2e']], 0, 0, 1, 1),
    `<g transform="translate(5 -5)">` +
    P('t', C(54, 74, 48), 'url(#tr)', '#6e0a18',
      fp(C(50, 70, 33), '#fff4e0') + fp(C(48, 68, 19), '#e8303f') + fp(C(48, 68, 7), '#fff4e0') +
      HL('M20 64A34 34 0 0 1 40 40', 4, 0.7), '-4 -4') +
    `<g transform="rotate(-45 54 74)">` +
    bar('M58 74H124', 5, '#d08a48') +
    fp('M112 72L102 61H116L124 72Z', '#ff6a5e', 3.5) + fp('M112 76L102 87H116L124 76Z', '#c01a2e', 3.5) +
    `</g></g>`
  );

  return {
    siege, medal, torch, rank,
    hp, atk, def, wis, agi,
    clsWarrior, clsMage, clsRanger, clsGuardian,
    skStrike, skAoe, skHeal, skShield, skBuff, skDebuff, skStun, skPoison, skBurn, skFreeze, skRevive, skLifesteal,
    dpsTeam, dpsTime, dpsCrit,
  };
})();
