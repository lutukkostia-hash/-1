const ART_ICON = (() => {
  // ---- shared helpers (deterministic) ----
  const O = '#1d1220';
  const f = (n) => +n.toFixed(1);
  const SV = (defs, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${defs ? '<defs>' + defs + '</defs>' : ''}${body}</svg>`;
  const st = (sw = 5) => `stroke="${O}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
  const ol = (d, sw = 5) => `<path d="${d}" fill="none" ${st(sw)}/>`;
  const fp = (d, fill, sw = 0, extra = '') =>
    `<path d="${d}" fill="${fill}"${sw ? ' ' + st(sw) : ''}${extra}/>`;
  const C = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const rr = (x, y, w, h, r) =>
    `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  const poly = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
  const stops = (s) =>
    s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  // cel-shaded part: shadow colour shows on lower-right, base shifted up-left, outline on top
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
  // thick outlined stroke (handles, shafts)
  const bar = (d, w, fill, hi) =>
    `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + 7}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>` +
    (hi || '');
  // small brilliant-cut gem
  const gemS = (x, y, s, c) => {
    const t = y - s * 0.3;
    const out = poly([[x - s, t], [x - s * 0.5, y - s], [x + s * 0.5, y - s], [x + s, t], [x, y + s]]);
    return fp(out, c[1]) +
      fp(poly([[x - s, t], [x - s * 0.5, y - s], [x + s * 0.5, y - s], [x + s, t]]), c[0]) +
      fp(poly([[x, t], [x + s, t], [x, y + s]]), c[2]) +
      fp(poly([[x - s * 0.5, t], [x - s * 0.15, y - s * 0.7], [x - s * 0.62, y - s * 0.7]]), '#fff', 0, ' opacity=".9"') +
      `<path d="M${f(x - s)} ${f(t)}H${f(x + s)}" fill="none" ${st(3)}/>` + ol(out, 4);
  };

  // palette
  const GOLD = lg('gd', [[0, '#fff1a0'], [0.45, '#ffc93a'], [1, '#e88a1c']], 0.1, 0, 0.9, 1);
  const GOLDSH = '#a8560f';
  const STEEL = lg('sl', [[0, '#ffffff'], [0.5, '#d3dbe6'], [1, '#8f9cb2']], 0.1, 0, 0.9, 1);
  const STEELSH = '#5d6a84';

  // ---- sword (vertical, centred on x=64, rotated by caller) ----
  const sword = (p) =>
    fp('M64 -8L51 18V86H64Z', '#f4f7fb') +
    fp('M64 -8L77 18V86H64Z', '#97a4ba') +
    HL('M57 24V80', 3.5, 0.9) +
    ol('M64 -8L77 18V86H51V18Z') +
    fp('M56 96H72V117H56Z', '#c8283a', 5) +
    `<path d="M56 103L72 100M56 110L72 107" stroke="#6e0d1e" stroke-width="3.5"/>` +
    P(p + 'g', 'M24 80Q64 92 104 80Q112 88 104 97Q64 106 24 97Q16 88 24 80Z', 'url(#gd)', GOLDSH, HL('M28 86Q44 91 52 91', 3, 0.8), '-4 -4') +
    fp(C(64, 92, 7.5), '#e8303f', 4) + fp(C(61.5, 89.5, 2.4), '#fff') +
    P(p + 'p', C(64, 125, 10), 'url(#gd)', GOLDSH, '', '-4 -4');

  // ---- icons ----
  const heroes = (() => {
    const H = 'M26 116L28 74C28 46 42 30 60 30C78 30 92 46 92 74L94 116Q60 124 26 116Z';
    const PL = 'M54 38C40 14 60 -1 86 3C108 6 122 22 124 44C116 36 107 35 101 37C111 46 113 58 107 70C99 55 90 47 78 44C70 38 62 36 54 38Z';
    return SV(
      GOLD + STEEL + lg('r', [[0, '#ff7a5e'], [1, '#d01f36']], 0, 0, 1, 1),
      `<g transform="translate(-6 3)">` +
      P('a', PL, 'url(#r)', '#7a0f22',
        `<path d="M62 32C66 16 86 10 108 20M76 41C86 30 102 30 114 38" fill="none" stroke="#8e1426" stroke-width="4" stroke-linecap="round"/>` +
        HL('M58 26C58 16 68 10 80 10', 4, 0.75), '-7 -5') +
      P('h', H, 'url(#sl)', STEELSH,
        fp('M54 20H66V66H54Z', 'url(#gd)', 4) +
        fp('M16 104Q60 114 104 104V130H16Z', 'url(#gd)', 4) +
        HL('M36 64C36 50 42 42 50 38', 5, 0.9), '-9 -6') +
      fp(rr(35, 63, 50, 12, 6), O) +
      fp('M56 74H64V97Q60 102 56 97Z', O) +
      `<path d="M41 84V95M49 86V97M71 86V97M79 84V95" stroke="${O}" stroke-width="4.5" stroke-linecap="round"/>` +
      fp(C(36, 112, 3), '#fff6c0') + fp(C(84, 112, 3), '#fff6c0') +
      `</g>`
    );
  })();

  const artifacts = (() => {
    const B = 'M18 62H110V106Q110 116 100 116H28Q18 116 18 106Z';
    const L = 'M14 50Q14 20 64 16Q114 20 114 50Z';
    const W = lg('w', [[0, '#d0874a'], [1, '#93501f']], 0, 0, 0.6, 1);
    return SV(
      GOLD + W + rg('gl', [[0, '#fff8c0', 1], [0.45, '#ffd24a', 0.6], [1, '#ffb020', 0]]),
      fp(C(64, 58, 62), 'url(#gl)') +
      fp('M64 58L18 -4H42ZM64 58L54 -6H74ZM64 58L86 -4H110ZM64 56L-4 30V50ZM64 56L132 30V50Z', '#fff6b8', 0, ' opacity=".75"') +
      fp('M20 63L16 49H112L108 63Z', '#fffbe0', 4) +
      P('b', B, 'url(#w)', '#5a2a10',
        `<path d="M18 89H110" stroke="#6a3014" stroke-width="3.5"/>` +
        fp('M30 58H42V122H30ZM86 58H98V122H86Z', 'url(#gd)', 4), '-8 -6') +
      P('l', L, 'url(#w)', '#5a2a10',
        fp('M30 6H42V60H30ZM86 6H98V60H86Z', 'url(#gd)', 4) +
        fp('M6 40H122V60H6Z', 'url(#gd)', 4) +
        HL('M24 34Q30 24 48 21', 4, 0.6), '-8 -6') +
      P('k', 'M53 58H75V78Q64 90 53 78Z', 'url(#gd)', GOLDSH, '', '-3 -3', 4) +
      fp(C(64, 68, 4), O) + fp('M62 69H66L67.5 79H60.5Z', O) +
      spark(110, 12, 9, '#fff', 3) + spark(18, 20, 7, '#fff', 3)
    );
  })();

  const quests = (() => {
    const S = 'M30 22H98Q94 62 98 100H30Q34 62 30 22Z';
    const roll = (y) => rr(16, y, 96, 16, 8);
    const knobs = (y) => fp(C(12, y + 8, 6), '#8e4a22', 4) + fp(C(116, y + 8, 6), '#8e4a22', 4);
    const sp = (r, a) => f(88 + r * Math.cos(a)) + ' ' + f(92 + r * Math.sin(a));
    let SD = 'M' + sp(15.5, -Math.PI / 12);
    for (let i = 0; i < 12; i++) SD += 'Q' + sp(21.5, (i * Math.PI) / 6) + ' ' + sp(15.5, ((i + 0.5) * Math.PI) / 6);
    SD += 'Z';
    return SV(
      lg('p', [[0, '#fff3cc'], [1, '#ebc77e']], 0, 0, 0.7, 1) +
      lg('q', [[0, '#ffe9b0'], [1, '#d9a85c']], 0, 0, 0, 1) +
      lg('s', [[0, '#ff5a5e'], [1, '#c01a30']], 0, 0, 1, 1),
      `<g transform="translate(0 -2)">` +
      P('a', S, 'url(#p)', '#c29452',
        `<path d="M44 40H84M44 52H76M44 64H86M44 76H66" stroke="#a0683a" stroke-width="5" stroke-linecap="round"/>`, '-8 -4') +
      knobs(8) + P('t', roll(8), 'url(#q)', '#b07e3e', HL('M26 12H70', 3.5, 0.9), '0 -5') +
      knobs(98) + P('u', roll(98), 'url(#q)', '#b07e3e', HL('M26 102H50', 3.5, 0.9), '0 -5') +
      fp('M80 102L72 126L80 121L86 127L89 104ZM96 102L104 126L96 121L90 127L87 104Z', '#c42234', 4) +
      P('w', SD, 'url(#s)', '#7a0e1e',
        `<circle cx="88" cy="92" r="10" fill="none" stroke="#9a1426" stroke-width="3"/>` +
        spark(88, 92, 6, '#ff9a9a') + HL('M77 88Q78 82 83 79', 3.5, 0.8), '-4 -4', 4.5) +
      `</g>`
    );
  })();

  const daily = (() => {
    const head = 'M64 38L82 44L98 58L86 64L94 76L80 78L76 96Q64 104 52 96L48 78L34 76L42 64L30 58L46 44Z';
    const horns = 'M73 44Q84 30 92 16Q100 36 84 52ZM55 44Q44 30 36 16Q28 36 44 52Z';
    let dots = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      dots += fp(C(f(64 + 47 * Math.cos(a)), f(64 + 47 * Math.sin(a)), 2.6), '#8a4416');
    }
    return SV(
      lg('b', [[0, '#ffd88a'], [0.5, '#e5964a'], [1, '#b0602a']], 0, 0, 1, 1) +
      rg('fl', [[0, '#8a3a1a'], [1, '#3a120a']], 0.45, 0.4, 0.6) +
      lg('d', [[0, '#ff9a46'], [1, '#e0402c']], 0, 0, 1, 1) +
      lg('h', [[0, '#fff6d8'], [1, '#d8bb84']], 0, 0, 1, 1),
      P('m', C(64, 64, 54), 'url(#b)', '#7a3a14', dots + HL('M18 56A46 46 0 0 1 56 18', 4, 0.75, '#fff3c8'), '-7 -7') +
      fp(C(64, 64, 40), 'url(#fl)', 4) +
      P('n', horns, 'url(#h)', '#9c7442', '', '-4 -3', 4.5) +
      P('k', head, 'url(#d)', '#8e1c12',
        `<path d="M54 46L64 58L74 46" fill="none" stroke="#ffc07a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="M64 66V88" stroke="#ffb070" stroke-width="5" stroke-linecap="round" opacity=".8"/>`, '-6 -5', 4.5) +
      fp('M69 61L85 53L82 65Q75 67 69 61Z', '#ffec4a', 3.5) +
      fp('M59 61L43 53L46 65Q53 67 59 61Z', '#ffec4a', 3.5) +
      fp(C(77, 60, 1.8), O) + fp(C(51, 60, 1.8), O) +
      fp(C(58, 90, 2.4), O) + fp(C(70, 90, 2.4), O) +
      fp('M55 96L57 105L60 98ZM73 96L71 105L68 98Z', '#fff', 2.5)
    );
  })();

  const gemFacets = (outer, inner, cols, tableFill, lineC) => {
    let s = '';
    const n = outer.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      s += fp(poly([outer[i], outer[j], inner[j], inner[i]]), cols[i]);
    }
    s += fp(poly(inner), tableFill);
    for (let i = 0; i < n; i++) s += `<path d="M${outer[i][0]} ${outer[i][1]}L${inner[i][0]} ${inner[i][1]}" stroke="${lineC}" stroke-width="2.5"/>`;
    s += ol(poly(inner), 2.5).replace(O, lineC);
    s += ol(poly(outer), 5);
    return s;
  };

  const mines = (() => {
    const outer = [[54, 18], [86, 38], [86, 84], [54, 106], [22, 84], [22, 38]];
    const inner = [[54, 36], [70, 46], [70, 76], [54, 88], [38, 76], [38, 46]];
    const head = 'M64 14Q122 6 116 66Q106 46 92 40Q76 32 64 14Z';
    return SV(
      lg('e', [[0, '#7ff7b4'], [1, '#22b86a']], 0, 0, 1, 1) + STEEL + GOLD,
      gemFacets(outer, inner, ['#5fe39a', '#169a58', '#0c7444', '#1fae66', '#3fd282', '#a2f7c6'], 'url(#e)', '#0b5232') +
      spark(44, 48, 9, '#fff') +
      bar('M24 114L90 46', 10, '#b5683a', HL('M21.7 111.3L87.6 43.4', 3, 0.7, '#f0b070')) +
      fp('M80 44L92 32L100 40L88 52Z', 'url(#gd)', 4) +
      P('h', head, 'url(#sl)', STEELSH, HL('M76 17Q100 14 110 32', 4.5, 0.9), '-5 -5')
    );
  })();

  const shop = (() => {
    const B = 'M42 50C20 60 14 84 20 100C26 116 44 120 64 120C84 120 102 116 108 100C114 84 108 60 86 50Z';
    const NK = 'M42 54Q30 42 32 28H96Q98 42 86 54Z';
    return SV(
      lg('l', [[0, '#dc9050'], [1, '#93501f']], 0, 0, 0.7, 1) + GOLD,
      P('b', B, 'url(#l)', '#5a2a10', HL('M30 92Q30 76 40 66', 5, 0.55, '#ffd6a0'), '-9 -7') +
      P('n', NK, 'url(#l)', '#5a2a10', '', '-6 -4') +
      fp('M34 30Q64 20 94 30Q64 40 34 30Z', '#3a1a0c', 4) +
      gemS(50, 26, 12, ['#ff9aa0', '#e8303f', '#9a1024']) +
      gemS(80, 25, 12, ['#9ae0ff', '#2f9cf0', '#1650b0']) +
      gemS(65, 18, 13, ['#a8f7c8', '#2fcf74', '#0e7a44']) +
      fp('M36 52Q64 62 92 52V60Q64 70 36 60Z', 'url(#gd)', 4) +
      fp('M60 58L54 76L62 72ZM68 58L74 76L66 72Z', 'url(#gd)', 3.5) +
      fp(C(64, 58, 6), 'url(#gd)', 4) +
      gemS(100, 106, 11, ['#9ae0ff', '#2f9cf0', '#1650b0']) +
      gemS(30, 112, 10, ['#e6b0ff', '#a04de0', '#5a1e9a'])
    );
  })();

  const ritual = (() => {
    const CV = 'M20 12H90Q98 12 98 20V96Q98 104 90 104H20Z';
    return SV(
      lg('cv', [[0, '#7040a8'], [1, '#2c1446']], 0, 0, 0.8, 1) +
      rg('g', [[0, '#f0a8ff', 0.95], [0.5, '#c050ff', 0.45], [1, '#a030ff', 0]]) + GOLD,
      fp('M28 18H100Q106 18 106 24V104Q106 112 98 112H28Z', '#f3e2bf', 5) +
      `<path d="M100 28V102M28 107H96" stroke="#c9a070" stroke-width="3"/>` +
      P('c', CV, 'url(#cv)', '#1a0a2c',
        fp('M20 12H32V104H20Z', '#2a1240') +
        fp('M16 24H34V31H16ZM16 85H34V92H16Z', 'url(#gd)', 3.5) +
        fp('M78 4H104V30ZM104 82V108H78Z', 'url(#gd)', 4), '-5 -5') +
      fp(C(64, 58, 30), 'url(#g)') +
      `<path d="M64 32L84 58L64 84L44 58ZM64 22V94" fill="none" stroke="#c040ff" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>` +
      `<path d="M64 32L84 58L64 84L44 58ZM64 22V94" fill="none" stroke="#f6d0ff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>` +
      fp(C(64, 58, 6), '#fff', 3.5) +
      fp('M112 2L98 24H108L98 44L124 16H113L122 2Z', '#f0c8ff', 4) +
      fp('M16 76L4 96H13L6 118L28 90H18L26 76Z', '#f0c8ff', 4) +
      spark(110, 60, 6, '#f6d0ff', 3) + spark(30, 6, 5, '#f6d0ff', 3)
    );
  })();

  const map = (() => {
    const c = 64;
    const kite = (a, L, w, light, dark) => {
      const r = (deg) => (deg * Math.PI) / 180;
      const tip = [c + L * Math.sin(r(a)), c - L * Math.cos(r(a))];
      const li = [c + w * Math.sin(r(a - 45)), c - w * Math.cos(r(a - 45))];
      const ri = [c + w * Math.sin(r(a + 45)), c - w * Math.cos(r(a + 45))];
      return fp(poly([[c, c], li, tip]), light) + fp(poly([[c, c], tip, ri]), dark) + ol(poly([li, tip, ri, [c, c]]), 4.5);
    };
    let s = '';
    s += `<circle cx="64" cy="64" r="33" fill="none" stroke="${O}" stroke-width="14"/>`;
    s += `<circle cx="64" cy="64" r="33" fill="none" stroke="#e6a04a" stroke-width="7"/>`;
    s += HL('M37 46A33 33 0 0 1 46 37', 3, 0.85, '#fff0c0');
    for (const a of [45, 135, 225, 315]) s += kite(a, 50, 13, '#ffcf6a', '#b8601c');
    for (const a of [90, 180, 270]) s += kite(a, 57, 15, '#ffe27a', '#d8861c');
    s += kite(0, 57, 15, '#ff6b6b', '#b81e30');
    s += fp(C(64, 64, 9), '#fff2b0', 4) + fp(C(64, 64, 3.5), '#c41e30');
    return SV('', s);
  })();

  const dps = SV(GOLD, `<g transform="rotate(45 64 64)">${sword('a')}</g>`);

  const click = (() => {
    const T = lg('t', [[0, '#f4c286'], [1, '#c07a40']], 0, 0, 0.6, 1);
    const fingers = [[22, 20, 40], [42, 15, 45], [62, 17, 43], [82, 24, 36]];
    let s = '';
    s += P('c', 'M30 96H96L104 124H22Z', '#9a5428', '#5a2a12',
      `<path d="M32 109H94" stroke="#5a2a12" stroke-width="3.5" stroke-dasharray="5 5"/>`, '-6 -4');
    s += P('h', 'M22 50Q22 40 32 40H94Q104 40 104 50V84Q104 98 90 98H38Q22 98 22 86Z', 'url(#t)', '#8a4a20', '', '-8 -6');
    fingers.forEach(([x, y, h], i) => {
      s += P('f' + i, rr(x, y, 20, h, 10), 'url(#t)', '#8a4a20', '', '-4 -4');
      s += fp(rr(x + 2, y + 4, 16, 12, 5), 'url(#sl)', 3.5);
    });
    s += P('m', 'M17 66Q15 54 30 54H70Q84 54 84 66Q84 78 70 78H32Q19 78 17 66Z', 'url(#t)', '#8a4a20',
      HL('M30 60H62', 4, 0.6, '#ffe2b8'), '-4 -4');
    s += fp('M24 90H102V100H24Z', 'url(#gd)', 4);
    return SV(T + STEEL + GOLD, `<g transform="rotate(-8 64 70)">${s}</g>`);
  })();

  const gold = (() => {
    let st5 = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 9 : 21;
      st5.push([64 + r * Math.cos(a), 66 + r * Math.sin(a)]);
    }
    return SV(
      lg('g', [[0, '#fff3a8'], [0.5, '#ffc93c'], [1, '#ec8f1e']], 0.2, 0, 0.8, 1),
      P('a', C(64, 64, 52), 'url(#g)', '#a8560f',
        `<circle cx="64" cy="64" r="38" fill="none" stroke="#d07a1c" stroke-width="5"/>` +
        HL('M30 54A36 36 0 0 1 54 30', 5, 0.8), '-8 -8') +
      fp(poly(st5), '#fff0a0', 4) +
      spark(36, 34, 11, '#fff')
    );
  })();

  const FL = 'M64 6C72 26 96 36 100 64C104 94 86 118 62 118C38 118 24 100 28 76C31 60 40 54 44 40C50 50 50 58 55 62C53 42 56 24 64 6Z';
  const CORE = 'M64 48C70 62 84 72 82 90C80 104 72 110 63 110C52 110 44 102 46 90C48 76 60 68 64 48Z';

  const soulGray = SV(
    lg('f', [[0, '#ffffff'], [0.45, '#d4d0e2'], [1, '#8a86a0']], 0, 0, 0.6, 1) +
    rg('g', [[0, '#ece8ff', 0.55], [1, '#ece8ff', 0]]),
    fp(C(64, 70, 60), 'url(#g)') +
    P('a', FL, 'url(#f)', '#5a5670', fp(CORE, '#fdfcff') + HL('M40 84Q38 70 46 60', 4, 0.9), '-7 -5') +
    fp(C(104, 22, 4), '#e6e2f2', 3) + fp(C(22, 34, 3), '#e6e2f2', 3)
  );

  const soulBlue = SV(
    lg('f', [[0, '#dcf8ff'], [0.4, '#4ec4ff'], [1, '#1858d0']], 0, 0, 0.6, 1) +
    rg('g', [[0, '#5ad0ff', 0.8], [1, '#2a90ff', 0]]),
    fp(C(64, 70, 62), 'url(#g)') +
    P('a', FL, 'url(#f)', '#0e3a90', fp(CORE, '#b8f0ff') + HL('M40 84Q38 70 46 60', 4, 0.9), '-7 -5') +
    fp('M64 56L80 82L64 108L48 82Z', '#e8fbff') + fp('M64 56L80 82L64 108Z', '#7fd4ff') +
    fp('M48 82H80', 'none', 2.5) + ol('M64 56L80 82L64 108L48 82Z', 4) +
    fp(C(104, 22, 4), '#bdf0ff', 3) + fp(C(22, 34, 3), '#bdf0ff', 3)
  );

  const bottle = (() => {
    const G = 'M54 30V45.3A38 38 0 1 0 74 45.3V30Z';
    return SV(
      lg('lq', [[0, '#d27cff'], [1, '#6a1cb8']], 0, 0, 0.6, 1) +
      lg('cg', [[0, '#e9e2ff'], [1, '#b6a8dc']], 0, 0, 1, 1),
      `<clipPath id="g"><path d="${G}"/></clipPath>` +
      fp(G, 'url(#cg)') +
      `<g clip-path="url(#g)">` +
      fp('M20 66Q42 58 64 66Q86 74 108 66V130H20Z', 'url(#lq)') +
      HL('M20 66Q42 58 64 66Q86 74 108 66', 3.5, 0.9, '#efc8ff') +
      `<path d="${C(64, 82, 38)} ${C(56, 74, 38)}" fill-rule="evenodd" fill="#24063f" opacity=".5"/>` +
      fp(C(78, 96, 5), '#f2d4ff', 0, ' opacity=".8"') + fp(C(90, 82, 3), '#f2d4ff', 0, ' opacity=".8"') + fp(C(70, 108, 3), '#f2d4ff', 0, ' opacity=".7"') +
      `</g>` +
      ol(G) +
      HL('M36 74A30 30 0 0 1 50 54', 6, 0.9) + fp(C(36, 86, 3), '#fff', 0, ' opacity=".85"') +
      P('c', 'M53 4H75Q78 4 77.5 7L75 26H53L50.5 7Q50 4 53 4Z', '#c89058', '#7a4a22',
        `<path d="M55 12H66M56 19H62" stroke="#7a4a22" stroke-width="3" stroke-linecap="round"/>`, '-5 -3', 4.5) +
      P('r', rr(46, 24, 36, 10, 5), 'url(#cg)', '#8a7ab8', '', '-3 -3', 4.5)
    );
  })();

  const gem = (() => {
    const outer = [[44, 10], [84, 10], [106, 32], [106, 96], [84, 118], [44, 118], [22, 96], [22, 32]];
    const inner = [[54, 30], [74, 30], [86, 42], [86, 86], [74, 98], [54, 98], [42, 86], [42, 42]];
    return SV(
      lg('e', [[0, '#7ff5b2'], [1, '#1fae64']], 0, 0, 1, 1),
      gemFacets(outer, inner, ['#b4fad2', '#6ae6a0', '#1a9e5c', '#0f7a46', '#0b6038', '#20a862', '#4fd88e', '#8cf0b6'], 'url(#e)', '#0b4a2e') +
      spark(56, 44, 12, '#fff') + fp(C(76, 80, 3), '#fff', 0, ' opacity=".7"')
    );
  })();

  const skillBlood = (() => {
    const D = 'M64 8C78 32 100 54 100 80C100 102 84 118 64 118C44 118 28 102 28 80C28 54 50 32 64 8Z';
    return SV(
      lg('d', [[0, '#ff6a72'], [0.5, '#e8213a'], [1, '#a00a26']], 0, 0, 0.7, 1) +
      rg('g', [[0, '#ff4058', 0.85], [0.6, '#ff2040', 0.35], [1, '#ff2040', 0]]),
      fp(C(64, 76, 62), 'url(#g)') +
      P('a', D, 'url(#d)', '#5e0414', HL('M42 82Q42 64 54 48', 7, 0.9) + fp(C(46, 96, 3.5), '#fff', 0, ' opacity=".8"'), '-8 -6') +
      P('b', 'M104 20C108 28 112 32 112 37A8 8 0 0 1 96 37C96 32 100 28 104 20Z', 'url(#d)', '#5e0414', '', '-3 -3', 4)
    );
  })();

  const skillArrows = (() => {
    // arrow along +x in local frame: tail at xt, tip at xh, centre line y
    const arrow = (xt, xh, y, p) =>
      `<g transform="translate(0 ${y})">` +
      bar(`M${xt + 2} 0H${xh - 16}`, 7, '#d08a48', HL(`M${xt + 4} -1.5H${xh - 18}`, 2.5, 0.6, '#ffd0a0')) +
      fp(`M${xt + 10} -2L${xt - 2} -13H${xt + 12}L${xt + 24} -2Z`, '#ff6a5e', 4) +
      fp(`M${xt + 10} 2L${xt - 2} 13H${xt + 12}L${xt + 24} 2Z`, '#c01a2e', 4) +
      P(p, `M${xh} 0L${xh - 24} -12L${xh - 18} 0L${xh - 24} 12Z`, 'url(#sl)', STEELSH, '', '-3 -3', 4.5) +
      `</g>`;
    return SV(STEEL,
      `<g transform="rotate(-45 64 64)">` +
      arrow(24, 108, 38, 'a') + arrow(24, 108, 90, 'c') + arrow(8, 124, 64, 'b') +
      `</g>`);
  })();

  const settings = (() => {
    const R = 54, r = 41, n = 8;
    const pt = (rad, deg) => {
      const a = ((deg - 90) * Math.PI) / 180;
      return f(64 + rad * Math.cos(a)) + ' ' + f(64 + rad * Math.sin(a));
    };
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = i * 45;
      d += (i ? 'L' : 'M') + pt(r, a - 14) + 'L' + pt(R, a - 9) + 'L' + pt(R, a + 9) + 'L' + pt(r, a + 14) + `A${r} ${r} 0 0 1 ` + pt(r, a + 31);
    }
    d += 'Z';
    const full = d + C(64, 64, 15);
    return SV(STEEL + GOLD,
      `<clipPath id="a"><path d="${full}" clip-rule="evenodd"/></clipPath>` +
      `<g clip-path="url(#a)"><path d="${d}" fill="${STEELSH}"/><path d="${d}" fill="url(#sl)" transform="translate(-6 -6)"/>` +
      `<circle cx="64" cy="64" r="27" fill="none" stroke="#7d8aa2" stroke-width="5"/></g>` +
      `<path d="${full}" fill="none" fill-rule="evenodd" ${st(5)}/>` +
      `<circle cx="64" cy="64" r="22" fill="none" stroke="${O}" stroke-width="4"/>` +
      `<circle cx="64" cy="64" r="20" fill="none" stroke="url(#gd)" stroke-width="5"/>` +
      HL('M30 46A38 38 0 0 1 44 30', 4, 0.9)
    );
  })();

  const lock = (() => {
    const B = 'M24 58Q24 52 30 52H98Q104 52 104 58V108Q104 118 94 118H34Q24 118 24 108Z';
    return SV(GOLD + STEEL,
      bar('M40 56V40A24 24 0 0 1 88 40V56', 12, '#b8c4d4', HL('M36 46V40A28 28 0 0 1 50 16', 3, 0.9)) +
      P('b', B, 'url(#gd)', GOLDSH,
        `<path d="M24 68H104M24 104H104" stroke="#c87618" stroke-width="3"/>` +
        HL('M32 62V96', 4, 0.75), '-8 -7') +
      fp(C(64, 80, 9), O) + fp('M58 84L55 102H73L70 84Z', O) +
      fp(C(33, 61, 3), '#fff4c0') + fp(C(95, 61, 3), '#fff4c0') + fp(C(33, 111, 3), '#a8560f') + fp(C(95, 111, 3), '#a8560f')
    );
  })();

  const stage = SV(GOLD,
    `<g transform="rotate(-45 64 64) translate(64 64) scale(.92) translate(-64 -64)">${sword('a')}</g>` +
    `<g transform="rotate(45 64 64) translate(64 64) scale(.92) translate(-64 -64)">${sword('b')}</g>`
  );

  return {
    heroes, artifacts, quests, daily, mines, shop, ritual, map,
    dps, click, gold, soulGray, soulBlue, bottle, gem,
    skillBlood, skillArrows, settings, lock, stage,
  };
})();
