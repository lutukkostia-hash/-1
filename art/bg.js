/* Location backgrounds (original vector art, generated deterministically). */
const ART_BG = (() => {
  const O = '#1d1220';
  const rng = (a) => () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const f = Math.round, f1 = (n) => Math.round(n * 10) / 10;
  const R = (q, a, b) => a + (b - a) * q();
  const st = (a) => a.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('');
  const lin = (id, x1, y1, x2, y2, s) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st(s)}</linearGradient>`;
  const rad = (id, cx, cy, r, s) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">${st(s)}</radialGradient>`;
  const circ = (x, y, r) => { const g = r < 6 ? f1 : f; return `M${g(x - r)} ${g(y)}a${g(r)} ${g(r)} 0 1 1 ${g(2 * r)} 0a${g(r)} ${g(r)} 0 1 1 ${g(-2 * r)} 0`; };
  const pt = (p) => f(p[0]) + ' ' + f(p[1]);
  const P = (a) => 'M' + a.map(pt).join('L') + 'Z';
  const PL = (a) => 'M' + a.map(pt).join('L');
  const P1 = (a) => 'M' + a.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
  const MX = (a) => a.map((p) => [450 - p[0], p[1]]);
  const smooth = (p, closed = 1) => {
    const n = p.length, g = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
    let s = 'M' + pt(p[0]);
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
      s += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (d[0] - b[0]) / 6)} ${f(c[1] - (d[1] - b[1]) / 6)} ${pt(c)}`;
    }
    return s + (closed ? 'Z' : '');
  };
  const ridge = (fn, n = 18, yb = 810) => {
    const p = [];
    for (let i = 0; i <= n; i++) { const x = -20 + (490 * i) / n; p.push([x, fn(x)]); }
    return smooth(p, 0) + `L470 ${yb}L-20 ${yb}Z`;
  };
  const mir = (d) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (m, a, b) => `${f1(450 - a)} ${b}`);
  const ribbon = (pts, w0, w1) => {
    const n = pts.length, L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
      const w = (w0 + ((w1 - w0) * i) / (n - 1)) / 2;
      L.push([pts[i][0] - (dy / l) * w, pts[i][1] + (dx / l) * w]);
      Rr.push([pts[i][0] + (dy / l) * w, pts[i][1] - (dx / l) * w]);
    }
    return smooth(L.concat(Rr.reverse()));
  };

  const scene = () => {
    const d = [], b = [];
    let n = 0;
    return {
      id: () => 'k' + (n++).toString(36),
      def: (s) => { d.push(s); },
      add: (...s) => { b.push(...s); },
      out: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 800" preserveAspectRatio="xMidYMid slice"><defs>${d.join('')}</defs>${b.join('')}</svg>`,
    };
  };
  // cel-shaded shape: outline + shadow fill + lit fill shifted up-left (clipped) + optional highlight markup
  const cel = (S, d, base, shade, o = {}) => {
    const id = S.id(), sw = o.sw ?? 3.5, dx = o.dx ?? 6, dy = o.dy ?? 6, oc = o.oc || O;
    S.def(`<path id="${id}" d="${d}"/><clipPath id="${id}c"><use href="#${id}"/></clipPath>`);
    return (sw ? `<use href="#${id}" fill="${oc}" stroke="${oc}" stroke-width="${sw * 2}" stroke-linejoin="round"/>` : '')
      + `<use href="#${id}" fill="${shade}"/><g clip-path="url(#${id}c)"><use href="#${id}" fill="${base}" transform="translate(${f1(-dx)} ${f1(-dy)})"/>${o.hi || ''}</g>`;
  };
  // reusable soft glow (radial gradient in bounding-box units)
  const glowDef = (S, c, a = 0.6) => {
    const id = S.id();
    S.def(`<radialGradient id="${id}">${st([[0, c, a], [0.35, c, a * 0.5], [1, c, 0]])}</radialGradient>`);
    return (x, y, r, sy = 1) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * sy)}" fill="url(#${id})"/>`;
  };
  const vign = (S, c, a = 0.8, top = 560, side = 0.55) => {
    const v = S.id(), w = S.id();
    S.def(lin(v, 0, top, 0, 800, [[0, c, 0], [0.5, c, a * 0.55], [1, c, a]])
      + `<radialGradient id="${w}" cx=".5" cy=".46" r=".74">${st([[0.6, c, 0], [1, c, side]])}</radialGradient>`);
    S.add(`<rect y="${top}" width="450" height="${800 - top}" fill="url(#${v})"/><rect width="450" height="800" fill="url(#${w})"/>`);
  };
  const rockD = (q, cx, by, w, h) => {
    const n = 7, p = [[cx - w / 2, by]];
    for (let i = 1; i < n; i++) { const a = Math.PI * (1 - i / n); p.push([cx + (Math.cos(a) * w) / 2 * R(q, 0.82, 1.05), by - Math.sin(a) * h * R(q, 0.72, 1.05)]); }
    p.push([cx + w / 2, by]);
    return P(p);
  };
  const rock = (S, q, cx, by, w, h, c, sw = 3) => cel(S, rockD(q, cx, by, w, h), c[0], c[1], {
    dx: w * 0.16, dy: h * 0.12, sw,
    hi: c[2] ? `<path d="${P([[cx - w * 0.44, by - h * 0.2], [cx - w * 0.28, by - h * 0.8], [cx - w * 0.04, by - h * 0.95], [cx - w * 0.14, by - h * 0.55]])}" fill="${c[2]}"/>` : '',
  });
  // crystal prisms defined once per colour set, placed with <use>
  const crystalDef = (S, id, c) => S.def(`<path id="${id}s" d="M-10 2L-10 -40L0 -56L10 -40L10 2Z"/><g id="${id}"><use href="#${id}s" fill="${c[2]}"/><path d="M-10 2L-10 -40L0 -56L1.5 2Z" fill="${c[1]}"/><path d="M-7 -5L-7 -37L-3 -45L-3 -9Z" fill="${c[0]}"/><use href="#${id}s" fill="none" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/></g>`);
  const cry = (id, x, y, s, a, sx = 1) => `<use href="#${id}" transform="translate(${f(x)} ${f(y)}) rotate(${a}) scale(${f1(s * sx)} ${f1(s)})"/>`;
  const flameDef = (S, id) => S.def(`<path id="${id}p" d="M0 0C-12 -2 -14 -14 -7 -22C-6 -15 -2 -16 -3 -27C3 -21 10 -31 6 -38C17 -27 15 -6 0 0Z"/><g id="${id}"><use href="#${id}p" fill="#ff5a16"/><use href="#${id}p" fill="#ffae2c" transform="translate(0 -1) scale(.7)"/><use href="#${id}p" fill="#fff4b8" transform="translate(0 -1) scale(.4)"/></g>`);
  // tiny round particles as zero-length round-capped strokes (compact)
  const dots = (q, n, box, avoid) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const x = f(R(q, box[0], box[2])), y = f(R(q, box[1], box[3]));
      if (avoid && x > 130 && x < 320 && y > 330 && y < 620 && q() < avoid) continue;
      d += `M${x} ${y}h0`;
    }
    return d;
  };
  const dotP = (d, c, w, o = 1) => `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
  const use = (id, x, y, s = 1, extra = '') => `<use href="#${id}" transform="translate(${f(x)} ${f(y)})${s !== 1 ? ` scale(${s})` : ''}"${extra}/>`;

  /* ------------------------------------------------------------ FOREST */
  function forest() {
    const S = scene(), q = rng(11);
    S.def(lin('sk', 0, 0, 0, 470, [[0, '#4db6e6'], [0.5, '#9adbee'], [1, '#e8f7c8']])
      + rad('sn', 80, 0, 480, [[0, '#fffce4'], [0.25, '#fff3b0', 0.6], [1, '#fff3b0', 0]])
      + lin('gr', 0, 460, 0, 800, [[0, '#a6dc6c'], [0.2, '#80c658'], [0.55, '#4f9c44'], [1, '#22492a']])
      + lin('ls', 0, 0, 240, 640, [[0, '#fffbe0', 0.5], [1, '#fffbe0', 0]]));
    S.add('<rect width="450" height="800" fill="url(#sk)"/><rect width="450" height="620" fill="url(#sn)"/>');
    const row = (y, a, b, col, seed) => {
      const r = rng(seed);
      let d = '';
      for (let x = -30; x < 490;) { const c = Math.min(1, Math.abs(x - 225) / 190), rr = R(r, a, b) * (0.5 + 0.5 * c); d += circ(x, y - rr * 0.4, rr); x += rr * R(r, 0.75, 1.15); }
      return `<g fill="${col}"><path d="${d}"/><rect x="-20" y="${y}" width="490" height="90"/></g>`;
    };
    S.add(row(402, 34, 54, '#b6e2cc', 3), row(428, 26, 42, '#8fcda6', 4), row(450, 18, 32, '#6db783', 5));
    // mid-depth trees
    const midT = (x, w, cs) => cel(S, `M${x - w / 2} 480C${x - w * 0.45} 400 ${x - w * 0.3} 300 ${x - w * 0.25} 60L${x + w * 0.25} 60C${x + w * 0.3} 300 ${x + w * 0.45} 400 ${x + w / 2} 480Z`, '#86a17e', '#62806a', { sw: 1, dx: w * 0.35, dy: 0, oc: '#3f5e4c' })
      + cel(S, cs.map((k) => circ(...k)).join(''), '#62ac68', '#4a8c58', { sw: 1, dx: 8, dy: 10, oc: '#3f6e4c' });
    S.add(midT(120, 20, [[95, 150, 40], [130, 120, 46], [160, 160, 30], [120, 190, 30]]), midT(334, 18, [[360, 140, 40], [322, 116, 42], [296, 160, 28], [334, 186, 30]]));
    // ground
    S.add(`<path d="${ridge((x) => 464 + 4 * Math.sin(x / 29) + 3 * Math.sin(x / 11), 30)}" fill="url(#gr)"/>`);
    const bush = (cs) => cel(S, cs.map((k) => circ(...k)).join(''), '#62b054', '#3f8644', { sw: 1.5, dx: 5, dy: 7, oc: '#2c5a34' });
    S.add(bush([[10, 464, 32], [52, 468, 25], [88, 474, 17], [116, 480, 10]]), bush([[440, 460, 34], [398, 466, 26], [362, 472, 17], [334, 479, 10]]));
    S.add('<ellipse cx="225" cy="582" rx="180" ry="56" fill="#dcf59a" opacity=".32"/><ellipse cx="215" cy="575" rx="110" ry="28" fill="#f4ffc8" opacity=".28"/>');
    // grass marks
    let g = '';
    for (let i = 0; i < 70; i++) {
      const y = R(q, 485, 790), x = R(q, -10, 460), s = 0.5 + ((y - 470) / 330) * 1.3;
      if (Math.abs(x - 225) < 130 && y < 650 && q() < 0.8) continue;
      const a = f(2 * s), b = f(6 * s), c = f(4 * s);
      g += `M${f(x)} ${f(y)}l-${a} -${b}m${a} ${b}l${c} -${b}`;
    }
    S.add(`<path d="${g}" stroke="#3a7d36" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".75"/>`);
    // light shafts
    S.add('<g fill="url(#ls)"><path d="M40 -10H110L340 650H250Z"/><path d="M135 -10H160L385 560H350Z" opacity=".7"/><path d="M-20 70L15 -10L195 630H140Z" opacity=".8"/></g>');
    // flowers
    S.def(`<path id="fp" d="${[0, 1, 2, 3, 4].map((i) => circ(Math.cos(i * 1.2566 - 1.57) * 3.4, Math.sin(i * 1.2566 - 1.57) * 3.4, 2.7)).join('')}"/><g id="fl"><use href="#fp" stroke="${O}" stroke-width="2.4"/><use href="#fp"/><circle r="1.9" fill="#ffd23a"/></g>`);
    const fc = ['#ff8fc0', '#ffe066', '#ffffff', '#c39cff'];
    let fls = '';
    for (let i = 0; i < 22; i++) {
      const y = R(q, 500, 770), x = q() < 0.5 ? R(q, 30, 140) : R(q, 310, 420);
      fls += use('fl', x, y, f1(0.5 + ((y - 480) / 300) * 0.9), ` fill="${fc[i % 4]}"`);
    }
    S.add(fls);
    // mushrooms
    const stem = 'M-5 0C-6 -6 -5 -12 -4 -16L4 -16C5 -12 6 -6 5 0C2 2 -2 2 -5 0Z', cap = 'M-14 -13C-14 -26 -6 -31 0 -31C6 -31 14 -26 14 -13C8 -10 -8 -10 -14 -13Z';
    S.def(`<g id="mr"><path d="${stem}" fill="#f4e4c4" stroke="${O}" stroke-width="2"/>${cel(S, cap, '#ec4a3c', '#a8283a', { sw: 2, dx: 3, dy: 3, hi: '<g fill="#fff3e2"><circle cx="-6" cy="-22" r="2.8"/><circle cx="3" cy="-26" r="2"/><circle cx="8" cy="-18" r="2.2"/><circle cx="-1" cy="-16" r="1.6"/></g>' })}</g>`);
    S.def(`<g id="mg"><path d="${stem}" fill="#d6f4ff" stroke="${O}" stroke-width="2"/>${cel(S, cap, '#7ae8ff', '#2c9fd6', { sw: 2, dx: 3, dy: 3, hi: '<g fill="#eafdff"><circle cx="-5" cy="-23" r="2.4"/><circle cx="5" cy="-20" r="1.8"/></g>' })}</g>`);
    const gl = glowDef(S, '#9af4ff', 0.7);
    S.add(use('mr', 128, 500, 0.5), use('mr', 140, 503, 0.35), use('mg', 318, 500, 0.5), gl(318, 492, 22));
    // foreground trees
    const trA = 'M-40 806L-40 -20L74 -20C78 110 70 280 78 440C84 560 92 616 108 652C122 684 142 698 168 708C142 714 124 712 112 708C118 736 130 766 150 806Z';
    const trB = 'M-40 806L-40 -20L70 -20C76 120 66 300 74 460C80 570 88 622 104 662C118 692 136 704 158 716C136 720 120 718 108 714C112 740 122 770 138 806Z';
    const barkA = 'M30 100C34 200 28 320 36 420M52 470C54 540 60 600 74 650M18 540C20 620 28 690 42 760M60 140C62 200 58 260 62 320';
    const tcol = ['#7d5438', '#4c3024'];
    S.add(cel(S, trA, tcol[0], tcol[1], { dx: 12, dy: 2 }), `<path d="${barkA}" stroke="#4a2e22" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="48" cy="380" rx="7" ry="11" fill="#3a2219" stroke="${O}" stroke-width="2"/>`);
    S.add(cel(S, mir(trB), tcol[0], tcol[1], { dx: 12, dy: 2, hi: `<path d="${mir('M70 60L66 760')}" stroke="#a87650" stroke-width="5" opacity=".7"/>` }), `<path d="${mir(barkA)}" stroke="#4a2e22" stroke-width="3" stroke-linecap="round" fill="none"/>`);
    const canopy = (cs) => cel(S, cs.map((k) => circ(...k)).join(''), '#47a74e', '#2b7140', {
      dx: 14, dy: 16,
      hi: `<g fill="#8ad86a">${cs.map(([x, y, r]) => `<ellipse cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.42)}" rx="${f(r * 0.42)}" ry="${f(r * 0.26)}"/>`).join('')}</g><path d="${cs.map(([x, y, r]) => `M${f(x + r * 0.05)} ${f(y + r * 0.42)}q${f(r * 0.16)} ${f(r * 0.16)} ${f(r * 0.32)} 0M${f(x - r * 0.45)} ${f(y + r * 0.2)}q${f(r * 0.14)} ${f(r * 0.14)} ${f(r * 0.28)} 0`).join('')}" stroke="#2b7140" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    });
    const cA = [[-30, 20, 100], [72, -24, 72], [138, 4, 46], [44, 100, 60], [104, 72, 42], [-6, 186, 58], [170, -36, 42]];
    const cB = [[-24, 0, 96], [64, -14, 68], [128, 24, 44], [34, 116, 60], [92, 92, 40], [-4, 214, 56]];
    S.add(canopy(cA), canopy(cB.map(([x, y, r]) => [450 - x, y, r])));
    // vines
    S.def(`<ellipse id="lf" rx="5" ry="2.6" fill="#5cb84a" stroke="${O}" stroke-width="1.2"/>`);
    const vine = (x, y, l) => { let d = `M${x} ${y}`, lv = ''; for (let i = 1; i <= 6; i++) { const yy = f(y + (l * i) / 6), xx = f(x + Math.sin(i * 1.3) * 4), s = i % 2 ? 1 : -1; d += `L${xx} ${yy}`; lv += `<use href="#lf" transform="translate(${xx + s * 5} ${yy - 3}) rotate(${s * 30})"/>`; } return `<path d="${d}" stroke="${O}" stroke-width="4" fill="none"/><path d="${d}" stroke="#3f8a3a" stroke-width="2" fill="none"/>${lv}`; };
    S.add(vine(128, 60, 110), vine(96, 110, 80), vine(330, 70, 100), vine(362, 120, 70));
    // tufts
    S.def(`<g id="tf">${cel(S, 'M-16 0C-15 -6 -16 -12 -20 -18C-12 -15 -9 -9 -8 -4C-9 -12 -7 -20 -3 -27C-2 -17 -1 -10 0 -4C1 -12 4 -19 10 -23C7 -15 5 -9 5 -3C7 -8 11 -12 18 -14C13 -9 13 -4 14 0Z', '#5fbc4c', '#367a36', { sw: 1.8, dx: 3, dy: 2 })}</g>`);
    S.add([[58, 604, 1], [150, 668, 0.9], [22, 706, 1.3], [190, 770, 1.4], [92, 768, 1.6], [398, 612, 1], [298, 672, 0.9], [430, 702, 1.3], [262, 776, 1.4], [366, 772, 1.6], [130, 560, 0.6], [324, 556, 0.6]].map((t) => use('tf', t[0], t[1], t[2])).join(''));
    S.add(use('mr', 106, 694, 1.3), use('mr', 136, 704, 0.9), gl(352, 680, 70), use('mg', 350, 698, 1.2), use('mg', 326, 710, 0.8), use('mg', 376, 716, 0.9));
    S.add(rock(S, q, 40, 790, 80, 46, ['#8a9a90', '#5a6a66', '#b4c4b4']), rock(S, q, 420, 786, 70, 40, ['#8a9a90', '#5a6a66', '#b4c4b4']));
    S.add(dotP(dots(q, 24, [60, 120, 380, 560], 0.6), '#fffbe0', 3, 0.75));
    vign(S, '#0a160e', 0.8);
    return S.out();
  }

  /* ------------------------------------------------------------ DESERT */
  function desert() {
    const S = scene(), q = rng(202);
    S.def(lin('sk', 0, 0, 0, 470, [[0, '#2f9fe4'], [0.45, '#88cdf0'], [0.82, '#f6e4b8'], [1, '#ffd99a']])
      + rad('sn', 165, 150, 320, [[0, '#fffdf0'], [0.1, '#fff6cc', 0.95], [0.3, '#ffe9a6', 0.4], [1, '#ffe9a6', 0]])
      + lin('sa', 0, 462, 0, 800, [[0, '#f8d898'], [0.25, '#f0bf7a'], [0.65, '#d48f52'], [1, '#7a4628']])
      + lin('hz', 0, 380, 0, 480, [[0, '#fff3d6', 0], [0.7, '#fff3d6', 0.6], [1, '#fff3d6', 0]])
      + lin('dl', 0, 486, 0, 610, [[0, '#fde0a6'], [0.55, '#f6cd8a', 0.7], [1, '#f2c27e', 0]])
      + lin('ds', 0, 486, 0, 600, [[0, '#dc9a5a'], [0.6, '#e2a466', 0.6], [1, '#e8b070', 0]]));
    S.add('<rect width="450" height="800" fill="url(#sk)"/><rect width="450" height="520" fill="url(#sn)"/><circle cx="165" cy="150" r="30" fill="#fffef6"/>');
    S.add('<g fill="#fff" opacity=".6"><ellipse cx="330" cy="215" rx="70" ry="6"/><ellipse cx="372" cy="206" rx="40" ry="5"/><ellipse cx="300" cy="292" rx="40" ry="4"/><ellipse cx="40" cy="320" rx="50" ry="4"/></g>');
    // distant mesas
    S.add(`<path d="${P([[-20, 462], [-20, 398], [14, 394], [44, 398], [56, 414], [92, 418], [104, 436], [130, 462]])}${P([[300, 462], [318, 432], [348, 428], [362, 408], [440, 404], [470, 408], [470, 462]])}" fill="#eac8a4"/>`);
    // ruins (left): columns + lintel
    let col = '', cs = '';
    [[40, 86], [74, 104], [106, 104], [138, 48]].forEach(([x, h], i) => {
      const t = 458 - h;
      col += `M${x - 8} 458L${x - 8} ${t}L${x - 11} ${t}L${x - 11} ${t - 7}L${x + 11} ${t - 7}L${x + 11} ${t}L${x + 8} ${t}L${x + 8} 458Z`;
      if (i === 3) col += `M${x - 8} ${t}L${x - 2} ${t - 10}L${x + 3} ${t - 3}L${x + 8} ${t - 9}L${x + 8} ${t}Z`;
      cs += `M${x + 1} 458L${x + 1} ${t}L${x + 8} ${t}L${x + 8} 458Z`;
    });
    col += 'M62 348L120 348L120 335L62 335Z';
    S.add(`<path d="${col}" fill="#e2b483" stroke="#b9845a" stroke-width="1.2"/><path d="${cs}" fill="#c99464" opacity=".8"/>`);
    // obelisks + step pyramid (right)
    const obe = (x, h, w) => `<path d="${P([[x - w / 2, 460], [x - w * 0.36, 460 - h], [x, 460 - h - w * 0.8], [x + w * 0.36, 460 - h], [x + w / 2, 460]])}" fill="#e0ad7a" stroke="#b9845a" stroke-width="1.2"/><path d="${P([[x, 460 - h - w * 0.8], [x + w * 0.36, 460 - h], [x + w / 2, 460], [x, 460]])}" fill="#c48d5e"/><path d="M${x - 2} ${460 - h + 14}h4M${x - 3} ${460 - h + 26}h6M${x - 3} ${460 - h + 38}h5" stroke="#a87048" stroke-width="2"/>`;
    S.add(`<path d="${P([[384, 462], [384, 446], [394, 446], [394, 432], [406, 432], [406, 418], [420, 418], [420, 404], [470, 404], [470, 462]])}" fill="#e6bb8c" stroke="#c4936a" stroke-width="1.2"/>`, obe(342, 122, 20), obe(390, 78, 16));
    S.add('<rect y="380" width="450" height="100" fill="url(#hz)"/>');
    // ground + soft dunes
    S.add(`<path d="${ridge((x) => 466 + 4 * Math.sin(x / 45) + 3 * Math.sin(x / 17 + 1), 24)}" fill="url(#sa)"/>`);
    S.add('<path d="M40 478C80 470 130 472 170 482C130 478 90 478 40 478Z M260 476C300 466 350 468 390 478C350 474 300 474 260 476Z" fill="#e2a86a" opacity=".7"/>');
    S.add('<path d="M-20 520C10 500 40 490 66 490C110 492 160 512 214 552L214 620L-20 620Z" fill="url(#dl)"/><path d="M66 490C110 492 160 512 214 552C170 546 120 540 92 560C96 530 86 506 66 490Z" fill="url(#ds)"/><path d="M-20 520C10 500 40 490 66 490C110 492 160 512 214 552" stroke="#fff3cf" stroke-width="2" fill="none" opacity=".8"/>');
    S.add('<path d="M470 512C440 494 412 486 386 486C350 488 296 512 240 552L240 620L470 620Z" fill="url(#dl)"/><path d="M386 486C412 486 440 494 470 512L470 560C440 540 414 520 400 500C396 494 392 490 386 486Z" fill="url(#ds)"/><path d="M470 512C440 494 412 486 386 486C350 488 296 512 240 552" stroke="#fff3cf" stroke-width="2" fill="none" opacity=".8"/>');
    // ripples
    let rp = '';
    for (let i = 0; i < 40; i++) {
      const y = R(q, 500, 790), x = R(q, -10, 450), s = 0.5 + ((y - 480) / 320) * 1.4;
      if (x > 120 && x < 330 && y < 640 && q() < 0.8) continue;
      const a = f(9 * s), b = f(3 * s);
      rp += `M${f(x)} ${f(y)}q${a} -${b} ${2 * a} 0t${2 * a} 0`;
    }
    S.add(`<path d="${rp}" stroke="#c98a50" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>`);
    S.add('<path d="M130 452q12 -4 24 0t24 0t24 0M250 456q12 -4 24 0t24 0t24 0M180 470q10 -3 20 0t20 0t20 0" stroke="#fff6dc" stroke-width="1.6" fill="none" opacity=".55"/>');
    // foreground dunes
    S.add(cel(S, 'M-20 666C40 632 100 630 150 654C200 678 230 734 252 812L-20 812Z', '#f2c27c', '#d08e50', { sw: 3, dx: 20, dy: 0 }));
    S.add(cel(S, 'M470 646C420 634 370 644 330 676C300 704 286 752 280 812L470 812Z', '#f2c27c', '#d08e50', { sw: 3, dx: 6, dy: -4 }));
    S.add('<path d="M10 690q40 -18 90 -10M30 720q50 -16 110 -4M24 756q60 -14 120 4M330 704q40 -26 110 -26M314 742q50 -24 140 -20M308 778q60 -16 150 -8" stroke="#c98a50" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>');
    const rc = ['#d8894e', '#9a5634', '#f2b47a'];
    S.add(rock(S, q, 120, 650, 34, 18, rc, 2.5), rock(S, q, 334, 640, 28, 15, rc, 2.5), rock(S, q, 60, 736, 74, 46, rc), rock(S, q, 400, 724, 86, 50, rc), rock(S, q, 440, 744, 50, 30, rc));
    S.add(cel(S, 'M66 610L118 600C126 600 130 612 128 622C126 632 120 636 114 636L64 640Z', '#e6b884', '#bb8558', { sw: 2.5, dx: 4, dy: 4 }), `<ellipse cx="66" cy="625" rx="8" ry="15" fill="#f2cc9a" stroke="${O}" stroke-width="2.5"/><path d="M80 608L80 638M96 605L96 637" stroke="#bb8558" stroke-width="2"/>`);
    // palms: one frond shape reused with transforms
    const up = [], dn = [], sp = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, x = 100 * t, y = -34 * t + 62 * t * t, tx = 100, ty = -34 + 124 * t, l = Math.hypot(tx, ty), nx = -ty / l, ny = tx / l;
      const w = 15 * Math.pow(Math.sin(Math.PI * (0.04 + 0.96 * t)), 0.7);
      up.push([x - nx * w * 0.5, y - ny * w * 0.5]); dn.push([x + nx * w * (i % 2 ? 1 : 0.35), y + ny * w * (i % 2 ? 1 : 0.35)]); sp.push([x, y]);
    }
    S.def(`<path id="fu" d="${P1(up.concat(dn.slice().reverse()))}"/><path id="fd" d="${P1(sp.concat(dn.slice().reverse()))}"/><g id="F"><use href="#fu" fill="#5cb84c"/><use href="#fd" fill="#3f9440"/><use href="#fu" fill="none" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/></g><g id="G"><use href="#fu" fill="#3f8a3c"/><use href="#fd" fill="#2c6a32"/><use href="#fu" fill="none" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/></g>`);
    const fr = (cx, cy, a, s, fl, id) => `<use href="#${id}" transform="translate(${cx} ${cy}) rotate(${a}) scale(${fl ? -s : s} ${s})"/>`;
    const palm = (bx, by, cx, cy, m) => {
      const B = (t) => { const u = 1 - t, p1 = [bx + (cx - bx) * 0.05, by - (by - cy) * 0.4], p2 = [bx + (cx - bx) * 0.6, by - (by - cy) * 0.78]; return [0, 1].map((k) => u * u * u * [bx, by][k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * [cx, cy][k]); };
      const L = [], Rt = [];
      let rings = '';
      for (let i = 0; i <= 14; i++) {
        const t = i / 14, p = B(t), a = B(Math.max(0, t - 0.01)), b = B(Math.min(1, t + 0.01)), tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty), nx = -ty / l, ny = tx / l, w = 17 - 8 * t;
        L.push([p[0] + nx * w, p[1] + ny * w]); Rt.push([p[0] - nx * w, p[1] - ny * w]);
        if (i && i < 14) rings += `M${pt([p[0] + nx * w, p[1] + ny * w])}Q${pt([p[0] - (tx / l) * 7, p[1] - (ty / l) * 7])} ${pt([p[0] - nx * w, p[1] - ny * w])}`;
      }
      const set = (list) => list.map(([a, s, fl, id]) => fr(cx, cy, m ? -a : a, s, m ? !fl : fl, id)).join('');
      return set([[-62, 0.82, 0, 'G'], [52, 0.78, 1, 'G'], [-96, 0.62, 0, 'G']])
        + cel(S, P(L.concat(Rt.reverse())), '#c08a56', '#83552f', { dx: 8, dy: 1, sw: 3 }) + `<path d="${rings}" stroke="#7a4a2a" stroke-width="2" fill="none"/>`
        + `<path d="${circ(cx - 7, cy + 7, 6.5) + circ(cx + 6, cy + 8, 6.5) + circ(cx, cy + 14, 6)}" fill="#7a4a2a" stroke="${O}" stroke-width="2"/>`
        + set([[-24, 1.05, 0, 'F'], [18, 0.95, 0, 'F'], [24, 1.02, 1, 'F'], [-16, 0.9, 1, 'F'], [56, 0.7, 0, 'F']]);
    };
    S.add(palm(22, 800, 92, 262, 0), palm(436, 790, 364, 246, 1));
    S.add(`<path d="M180 720l-8 -16m8 16l2 -20m-2 20l10 -14m-10 14l-14 -6M300 690l-6 -14m6 14l3 -18m-3 18l9 -10" stroke="${O}" stroke-width="4" stroke-linecap="round"/><path d="M180 720l-8 -16m8 16l2 -20m-2 20l10 -14m-10 14l-14 -6M300 690l-6 -14m6 14l3 -18m-3 18l9 -10" stroke="#9a6a3a" stroke-width="2" stroke-linecap="round"/>`);
    vign(S, '#2a1208', 0.72);
    return S.out();
  }

  /* ------------------------------------------------------------ CRYPT */
  function crypt() {
    const S = scene(), q = rng(303);
    S.def(lin('wl', 0, 0, 0, 480, [[0, '#0d0b1c'], [0.45, '#1f2142'], [1, '#353b62']])
      + lin('fl', 0, 470, 0, 800, [[0, '#4a4f78'], [0.35, '#363a60'], [1, '#141228']])
      + lin('op', 0, 240, 0, 475, [[0, '#06050e'], [0.6, '#111a36'], [1, '#2c4274']]));
    S.add('<rect width="450" height="800" fill="url(#wl)"/>');
    let m = '', blk = '';
    for (let r = 0, y = 140; y < 472; r++, y += 26) {
      m += `M0 ${y}H450`;
      for (let x = (r % 2) * 26 - 26; x < 450; x += 52) m += `M${x} ${y}V${Math.min(y + 26, 472)}`;
    }
    for (let i = 0; i < 24; i++) { const r = Math.floor(R(q, 0, 13)), y = 140 + r * 26, x = Math.floor(R(q, 0, 10)) * 52 + (r % 2) * 26 - 26; blk += `M${x + 2} ${y + 2}h48v22h-48Z`; }
    S.add(`<path d="${blk}" fill="#55608f" opacity=".28"/><path d="${m}" stroke="#0c0b1c" stroke-width="2.5" opacity=".6"/>`);
    // rear archway with receding corridor
    const gw = glowDef(S, '#6f94e8', 0.5);
    S.add(`<path d="M144 474L144 332A81 81 0 0 1 306 332L306 474Z" fill="url(#op)"/>${gw(225, 462, 70, 0.5)}`);
    S.add('<path d="M176 474V352A49 49 0 0 1 274 352V474M198 474V366A27 27 0 0 1 252 366V474" stroke="#2c3c6c" stroke-width="3" fill="none" opacity=".8"/><path d="M150 474h150M160 466h130M170 458h110" stroke="#3a4f86" stroke-width="2" opacity=".6"/>');
    let vj = '';
    for (let a = 180; a <= 360; a += 15) { const r = (a * Math.PI) / 180; vj += `M${f(225 + 81 * Math.cos(r))} ${f(332 + 81 * Math.sin(r))}L${f(225 + 107 * Math.cos(r))} ${f(332 + 107 * Math.sin(r))}`; }
    S.add(`<path d="M118 474L118 332A107 107 0 0 1 332 332L332 474L306 474L306 332A81 81 0 0 0 144 332L144 474Z" fill="#474e7c" stroke="${O}" stroke-width="2.5"/><path d="M306 474L306 332A81 81 0 0 0 296 293L320 282A107 107 0 0 1 332 332L332 474Z" fill="#30365c"/><path d="${vj}M118 360h26M118 390h26M118 420h26M118 450h26M306 360h26M306 390h26M306 420h26M306 450h26" stroke="${O}" stroke-width="2" opacity=".7"/><path d="M212 222L238 222L235 254L215 254Z" fill="#5a6294" stroke="${O}" stroke-width="2.5"/>`);
    // floor with perspective tiles
    S.add('<rect y="472" width="450" height="330" fill="url(#fl)"/>');
    const vy = 290, X = (xb, y) => 225 + ((xb - 225) * (y - vy)) / (800 - vy), rows = [474, 486, 502, 524, 552, 588, 634, 692, 764, 860];
    let tl = '', th = '', tint = '', tint2 = '', cr = '';
    rows.forEach((y) => { tl += `M-20 ${y}H470`; th += `M-20 ${y + 2}H470`; });
    for (let xb = -555; xb <= 1005; xb += 90) tl += `M${f(X(xb, 474))} 474L${f(X(xb, 820))} 820`;
    for (let i = 0; i < 20; i++) {
      const k = Math.floor(R(q, 1, 9)), xi = Math.floor(R(q, -6, 13)), xb = -555 + xi * 90, y0 = rows[k - 1], y1 = rows[k];
      const quad = P([[X(xb, y0), y0], [X(xb + 90, y0), y0], [X(xb + 90, y1), y1], [X(xb, y1), y1]]);
      if (i % 2) tint += quad; else tint2 += quad;
      if (i % 3 === 0 && (xi < 4 || xi > 8)) { const cx = X(xb + 45, (y0 + y1) / 2); cr += `M${f(cx - 14)} ${f(y0 + 3)}l8 ${f((y1 - y0) * 0.3)}l-4 ${f((y1 - y0) * 0.25)}l12 ${f((y1 - y0) * 0.3)}`; }
    }
    S.add(`<path d="${tint}" fill="#6a72a8" opacity=".18"/><path d="${tint2}" fill="#0c0a1c" opacity=".25"/><path d="${th}" stroke="#7a84bc" stroke-width="1" opacity=".25"/><path d="${tl}" stroke="#15132a" stroke-width="2.2" opacity=".85"/><path d="${cr}" stroke="#110f22" stroke-width="1.6" fill="none"/>`);
    S.add('<ellipse cx="225" cy="510" rx="120" ry="26" fill="#6a8ad8" opacity=".14"/>');
    // big framing arch + vault ceiling
    let aj = '';
    for (let a = 190; a <= 350; a += 16) { const r = (a * Math.PI) / 180; aj += `M${f(225 + 125 * Math.cos(r))} ${f(190 + 140 * Math.sin(r))}L${f(225 + 151 * Math.cos(r))} ${f(190 + 166 * Math.sin(r))}`; }
    S.add(`<path d="M-10 -10H460V200H350A125 140 0 0 0 100 200H-10Z" fill="#17152c"/><path d="M350 190A125 140 0 0 0 100 190" stroke="${O}" stroke-width="31" fill="none"/><path d="M350 190A125 140 0 0 0 100 190" stroke="#3f4572" stroke-width="25" fill="none"/><path d="M350 190A125 140 0 0 0 100 190" stroke="#5a6296" stroke-width="5" fill="none" transform="translate(-3 -2)" opacity=".6"/><path d="${aj}" stroke="${O}" stroke-width="2.5"/>`);
    // hanging cobwebs under the arch
    const web = (hx, hy, a0, a1) => {
      const ang = [0, 1, 2, 3, 4].map((i) => ((a0 + ((a1 - a0) * i) / 4) * Math.PI) / 180), len = [58, 66, 70, 62, 52];
      let d = '';
      ang.forEach((a, i) => { d += `M${hx} ${hy}l${f(Math.cos(a) * len[i])} ${f(Math.sin(a) * len[i])}`; });
      [0.3, 0.55, 0.8].forEach((k) => {
        for (let i = 0; i < 4; i++) {
          const p0 = [hx + Math.cos(ang[i]) * len[i] * k, hy + Math.sin(ang[i]) * len[i] * k], p1 = [hx + Math.cos(ang[i + 1]) * len[i + 1] * k, hy + Math.sin(ang[i + 1]) * len[i + 1] * k];
          d += `M${pt(p0)}Q${pt([((p0[0] + p1[0]) / 2) * 0.8 + hx * 0.2, ((p0[1] + p1[1]) / 2) * 0.8 + hy * 0.2])} ${pt(p1)}`;
        }
      });
      return d;
    };
    S.add(`<path d="${web(118, 116, 20, 105)}${web(332, 116, 75, 160)}" stroke="#d6dcf0" stroke-width="1.2" fill="none" opacity=".5"/>`);
    // pillars
    const pillar = (x0, x1) => {
      let j = '';
      for (let y = 260; y < 690; y += 56) j += `M${x0} ${y}H${x1}`;
      return cel(S, `M${x0} 690L${x0} 210L${x1} 210L${x1} 690Z`, '#5a6290', '#383d64', { dx: 14, dy: 0, hi: `<path d="M${x0 + 4} 210V690" stroke="#7880b0" stroke-width="6"/>` })
        + `<path d="${j}" stroke="${O}" stroke-width="2" opacity=".55"/>`
        + cel(S, `M${x0 - 12} 214L${x0 - 12} 186L${x1 + 12} 186L${x1 + 12} 214Z`, '#646ca0', '#3e4470', { dx: 8, dy: 4 })
        + cel(S, `M${x0 - 10} 724L${x0 - 6} 690L${x1 + 6} 690L${x1 + 10} 724Z M${x0 - 18} 770L${x0 - 18} 724L${x1 + 18} 724L${x1 + 18} 770Z`, '#5a6290', '#383d64', { dx: 10, dy: 4 });
    };
    S.add(pillar(6, 92), pillar(358, 444));
    // torches
    flameDef(S, 'fm');
    const wg = glowDef(S, '#ffae4a', 0.75), hg = glowDef(S, '#ffd27a', 0.8), pg = glowDef(S, '#ff9a3a', 0.5);
    const torch = (x, s) => `<path d="M${x - s * 14} 352L${x} 352L${x + s * 2} 340" stroke="${O}" stroke-width="7" fill="none"/><path d="M${x - s * 14} 352L${x} 352L${x + s * 2} 340" stroke="#4a4258" stroke-width="3.5" fill="none"/><path d="M${x - 4} 346L${x + 4} 346L${x + 6} 318L${x - 6} 318Z" fill="#6a4228" stroke="${O}" stroke-width="2.5"/><path d="M${x - 8} 318L${x + 8} 318L${x + 6} 324L${x - 6} 324Z" fill="#3a3448" stroke="${O}" stroke-width="2"/>${use('fm', x, 318, 1.25)}`;
    S.add(wg(108, 300, 175), wg(342, 300, 175), pg(140, 650, 160, 0.32), pg(310, 650, 160, 0.32));
    S.add(torch(106, 1), torch(344, -1), hg(106, 296, 30), hg(344, 296, 30));
    // rubble, bones, skulls
    S.def(`<g id="sk">${cel(S, 'M-13 -12C-14 -24 -6 -30 0 -30C8 -30 14 -24 13 -12C13 -8 10 -6 9 -2L9 2L-9 2L-9 -2C-10 -6 -13 -8 -13 -12Z', '#eadfc2', '#a8987a', { sw: 2, dx: 3, dy: 3 })}<ellipse cx="-5" cy="-14" rx="3.6" ry="4.2" fill="#241a2a"/><ellipse cx="5" cy="-14" rx="3.6" ry="4.2" fill="#241a2a"/><path d="M0 -10l-2 4h4z" fill="#241a2a"/><path d="M-5 2v-4M0 2v-4M5 2v-4" stroke="${O}" stroke-width="1.2"/></g>`);
    S.def(`<path id="bp" d="M-16 -3L16 -3L16 3L-16 3Z${circ(-17, -3, 4)}${circ(-17, 3, 4)}${circ(17, -3, 4)}${circ(17, 3, 4)}"/><g id="bn"><use href="#bp" fill="#e6dcc0" stroke="${O}" stroke-width="4" stroke-linejoin="round"/><use href="#bp" fill="#e6dcc0"/><path d="M-14 1H14" stroke="#b0a284" stroke-width="2"/></g>`);
    const rcol = ['#5a6290', '#383d64', '#7880b0'];
    S.add(rock(S, q, 118, 742, 40, 22, rcol, 2.5), rock(S, q, 140, 752, 26, 14, rcol, 2.5), rock(S, q, 330, 736, 36, 20, rcol, 2.5));
    S.add(`<use href="#bn" transform="translate(150 712) rotate(-20) scale(.9)"/><use href="#bn" transform="translate(132 716) rotate(25) scale(.8)"/>${use('sk', 128, 710, 1.15)}<use href="#bn" transform="translate(304 712) rotate(12) scale(.85)"/><use href="#sk" transform="translate(318 706) rotate(-12)"/>${use('sk', 352, 760, 0.8)}`);
    S.add(dotP(dots(q, 14, [80, 220, 170, 380]) + dots(q, 14, [280, 220, 370, 380]), '#ffd27a', 2.4, 0.7));
    vign(S, '#07060f', 0.85, 540, 0.6);
    return S.out();
  }

  /* ------------------------------------------------------------ SWAMP */
  function swamp() {
    const S = scene(), q = rng(404);
    S.def(lin('sk', 0, 0, 0, 470, [[0, '#1d1a44'], [0.35, '#40306a'], [0.72, '#a2506e'], [1, '#f39a60']])
      + lin('wa', 0, 456, 0, 800, [[0, '#8a7a86'], [0.08, '#3a7270'], [0.45, '#1e4d4a'], [1, '#0b2224']])
      + lin('bk', 0, 570, 0, 800, [[0, '#6a8a44'], [0.2, '#4c6634'], [0.6, '#2c3a20'], [1, '#121810']]));
    S.add('<rect width="450" height="800" fill="url(#sk)"/>');
    const sg = glowDef(S, '#ffc07a', 0.7);
    S.add(sg(350, 420, 190, 0.7), '<circle cx="350" cy="418" r="22" fill="#ffd8a0" opacity=".85"/>');
    // far treeline + dead trees
    S.add(`<path d="${ridge((x) => 446 - 10 * Math.abs(Math.sin(x / 23)) - 6 * Math.abs(Math.sin(x / 9)) - (Math.abs(x - 225) > 120 ? 10 : 0), 40, 470)}" fill="#55395e"/>`);
    const dead = (x, by, h, s) => `M${x} ${by}C${x + 3 * s} ${by - h * 0.4} ${x - 6 * s} ${by - h * 0.7} ${x + 2 * s} ${by - h}M${x - s} ${f(by - h * 0.55)}q${12 * s} -6 ${18 * s} -${f(h * 0.25)}M${x + s} ${f(by - h * 0.75)}q${-10 * s} -4 ${-14 * s} -${f(h * 0.2)}`;
    S.add(`<path d="${dead(30, 450, 90, 1)}${dead(80, 446, 60, -1)}${dead(370, 448, 80, -1)}${dead(420, 450, 100, 1)}" stroke="#4a3256" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${dead(130, 450, 40, 1)}${dead(310, 448, 46, -1)}" stroke="#634468" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    // water
    S.add('<rect y="452" width="450" height="350" fill="url(#wa)"/>');
    let rf = '', rf2 = '';
    for (let i = 0; i < 16; i++) { const y = 462 + i * i * 0.5 + R(q, 0, 4), w = 40 - i * 1.5; rf += `M${f(350 - w / 2 + R(q, -8, 8))} ${f(y)}h${f(w)}`; }
    for (let i = 0; i < 30; i++) { const y = R(q, 470, 700), x = q() < 0.5 ? R(q, -10, 120) : R(q, 300, 450), w = 8 + ((y - 460) / 240) * 26; rf2 += `M${f(x)} ${f(y)}h${f(w)}`; }
    S.add(`<path d="${rf}" stroke="#ffc690" stroke-width="2" opacity=".55"/><path d="${rf2}" stroke="#7fc2b8" stroke-width="1.6" opacity=".35"/>`);
    const fg = glowDef(S, '#e2d0ee', 0.55);
    S.add(fg(90, 462, 170, 0.12), fg(340, 470, 180, 0.1), fg(225, 500, 210, 0.08));
    // lily pads
    S.def(`<g id="lp"><path d="M0 0L14 -1A14 6 0 1 0 13.5 1.6Z" fill="#4f9a52" stroke="${O}" stroke-width="2" stroke-linejoin="round"/><path d="M-11 -2A11 4 0 0 1 4 -4.5" stroke="#86cc6c" stroke-width="2" fill="none"/></g>`);
    S.def(`<g id="lt"><path d="M0 0C-8 -2 -10 -8 -9 -12C-5 -10 -2 -7 0 -3C2 -7 5 -10 9 -12C10 -8 8 -2 0 0Z" fill="#f08ac4" stroke="${O}" stroke-width="1.6"/><path d="M0 -1C-3 -6 -2 -12 0 -16C2 -12 3 -6 0 -1Z" fill="#ffc4e4" stroke="${O}" stroke-width="1.6"/></g>`);
    S.add([[96, 492, 0.8], [138, 522, 0.9], [302, 488, 0.7], [326, 520, 1], [62, 560, 1.4], [392, 556, 1.4], [44, 626, 1.8], [412, 620, 1.7]].map((p) => use('lp', p[0], p[1], p[2])).join(''), use('lt', 330, 518, 0.9), use('lt', 64, 558, 1.2));
    // center mud bank (flat top, muddy sides)
    const bank = smooth([[34, 812], [52, 700], [84, 626], [130, 592], [225, 578], [320, 590], [366, 622], [398, 700], [416, 812]]);
    S.add(`<path d="${bank}" fill="#2a2a1c" stroke="${O}" stroke-width="3" transform="translate(4 8)"/><path d="${bank}" fill="url(#bk)" stroke="${O}" stroke-width="3"/>`);
    S.def(`<clipPath id="bc"><path d="${bank}"/></clipPath>`);
    S.add(`<g clip-path="url(#bc)"><path d="${bank}" fill="none" stroke="#9cc066" stroke-width="7" opacity=".7"/><ellipse cx="225" cy="604" rx="150" ry="24" fill="#8cb058" opacity=".35"/>${dotP(dots(q, 22, [70, 640, 380, 790]), '#24301a', 5, 0.7)}</g>`);
    S.def(`<g id="gt"><path d="M-10 0C-10 -8 -12 -14 -16 -20C-9 -16 -6 -10 -4 -4C-4 -12 -2 -20 1 -26C2 -16 2 -8 2 -3C4 -10 8 -15 13 -18C9 -11 8 -5 9 0Z" fill="#5a8040" stroke="${O}" stroke-width="2" stroke-linejoin="round"/></g>`);
    S.add([[96, 640, 1], [124, 604, 0.7], [330, 606, 0.7], [362, 642, 1], [76, 720, 1.3], [380, 724, 1.3]].map((p) => use('gt', p[0], p[1], p[2])).join(''));
    S.add(fg(60, 600, 120, 0.14), fg(400, 610, 120, 0.14));
    // twisted trees
    const trL = 'M-40 800L-40 120C-20 110 8 100 30 80C60 50 110 40 160 50C190 56 214 70 232 88C206 80 186 76 164 78C120 82 88 100 72 130C62 160 76 200 70 240C64 300 78 360 72 420C68 480 82 540 98 590C106 620 126 640 152 652C126 656 110 650 98 644C102 670 116 700 136 720C110 716 92 690 80 672C74 700 72 730 78 800Z';
    const trR = 'M-40 800L-40 150C-14 130 14 116 40 96C70 74 112 66 150 72C176 76 196 86 210 98C188 94 170 92 150 94C116 98 92 114 80 140C70 170 82 210 76 250C70 310 82 370 76 430C72 490 84 548 100 598C108 628 126 646 150 658C124 662 108 656 96 650C100 676 112 704 130 724C106 720 88 696 78 678C72 706 70 736 76 800Z';
    const tc = ['#463646', '#271d2c'];
    S.add(cel(S, trL, tc[0], tc[1], { dx: 10, dy: 4, hi: '<path d="M40 82C80 56 130 50 170 60" stroke="#7a5a6a" stroke-width="4" fill="none" opacity=".7"/>' }));
    S.add(cel(S, mir(trR), tc[0], tc[1], { dx: 10, dy: 4, hi: `<path d="${mir('M86 150C78 200 84 300 80 420')}" stroke="#7a5a6a" stroke-width="5" fill="none" opacity=".6"/>` }));
    // hanging moss (thin wavy strands with clumps)
    let ms = '', cl = '';
    const moss = (x0, y0, x1, y1, n, seed) => {
      const r = rng(seed);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, x = f(x0 + (x1 - x0) * t), y = f(y0 + (y1 - y0) * t + R(r, -3, 3)), l = R(r, 30, 120), w = R(r, 3, 6);
        ms += `M${x} ${y}c${f(w)} ${f(l * 0.25)} ${f(-w)} ${f(l * 0.5)} 0 ${f(l * 0.7)}s${f(w * 0.6)} ${f(l * 0.2)} ${f(-w * 0.3)} ${f(l * 0.3)}`;
        if (i % 2 === 0) cl += circ(x, y + 3, R(r, 4, 7));
      }
    };
    moss(44, 92, 128, 56, 7, 1); moss(130, 54, 222, 82, 7, 2); moss(406, 118, 330, 76, 6, 3); moss(326, 76, 246, 94, 6, 4);
    S.add(`<path d="${ms}" stroke="${O}" stroke-width="5.5" fill="none" stroke-linecap="round"/><path d="${ms}" stroke="#6f8f58" stroke-width="3" fill="none" stroke-linecap="round"/><path d="${cl}" fill="#6f8f58" stroke="${O}" stroke-width="2"/>`);
    // reeds + cattails
    let rd = '', ct = '';
    [[24, 700, -1], [44, 690, 1], [120, 668, -1], [138, 676, 1], [306, 666, 1], [326, 674, -1], [404, 688, -1], [426, 700, 1]].forEach(([x, y, s], i) => {
      const h = 70 + (i % 3) * 22;
      rd += `M${x} ${y}Q${x + s * 6} ${f(y - h * 0.6)} ${x + s * 12} ${y - h}M${x + 4} ${y}Q${x + 4 - s * 10} ${f(y - h * 0.4)} ${x + 4 - s * 22} ${f(y - h * 0.6)}`;
      if (i % 2 === 0) ct += `<rect x="${x + s * 10 - 4}" y="${y - h - 4}" width="8" height="22" rx="4" transform="rotate(${s * 10} ${x + s * 10} ${y - h + 6})"/>`;
    });
    S.add(`<path d="${rd}" stroke="${O}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${rd}" stroke="#5f8a46" stroke-width="3" fill="none" stroke-linecap="round"/><g fill="#7a4a30" stroke="${O}" stroke-width="2">${ct}</g>`);
    // fireflies
    const ff = glowDef(S, '#e6ff7a', 0.7);
    let fl = '', fd = '';
    for (let i = 0; i < 26; i++) {
      const x = R(q, 20, 430), y = R(q, 200, 700);
      if (x > 140 && x < 310 && y > 330 && y < 600) continue;
      fl += ff(x, y, R(q, 7, 12)); fd += `M${f(x)} ${f(y)}h0`;
    }
    S.add(fl, dotP(fd, '#f6ffc0', 3.4));
    vign(S, '#060a0c', 0.8);
    return S.out();
  }

  /* ------------------------------------------------------------ ICE */
  function ice() {
    const S = scene(), q = rng(505);
    S.def(lin('sk', 0, 0, 0, 470, [[0, '#6aaee6'], [0.5, '#b8def8'], [1, '#eef8ff']])
      + lin('au', 0, 130, 0, 260, [[0, '#7dffd0', 0], [0.75, '#7dffd0', 0.55], [1, '#7dffd0', 0]])
      + lin('av', 0, 170, 0, 290, [[0, '#c49bff', 0], [0.75, '#c49bff', 0.45], [1, '#c49bff', 0]])
      + lin('sn', 0, 455, 0, 800, [[0, '#f6fbff'], [0.3, '#d6e6f6'], [0.7, '#a4bcdc'], [1, '#55689a']])
      + lin('hz', 0, 300, 0, 470, [[0, '#f0f8ff', 0], [1, '#f0f8ff', 0.8]])
      + '<filter id="ab" x="-.2" y="-.5" width="1.4" height="2"><feGaussianBlur stdDeviation="4"/></filter>');
    S.add('<rect width="450" height="800" fill="url(#sk)"/>');
    const sg = glowDef(S, '#ffffff', 0.8);
    S.add(sg(60, 40, 260));
    // aurora ribbons with curtain streaks
    const t1 = [[-20, 196], [80, 156], [190, 190], [290, 146], [380, 170], [470, 134]], t2 = [[-20, 250], [90, 216], [200, 242], [300, 208], [470, 228]];
    const band = (pts, h) => smooth(pts, 0) + 'L' + pts.slice().reverse().map((p) => pt([p[0], p[1] + h])).join('L') + 'Z';
    let ln = '';
    for (let x = -16; x < 470; x += 9) ln += `M${x} 120V300`;
    S.def(`<clipPath id="ac"><path d="${band(t1, 64)}${band(t2, 50)}"/></clipPath>`);
    S.add(`<g filter="url(#ab)"><path d="${band(t1, 64)}" fill="url(#au)"/><path d="${band(t2, 50)}" fill="url(#av)"/><path d="${ln}" stroke="#e6fff6" stroke-width="2.5" opacity=".3" clip-path="url(#ac)"/></g>`);
    // mountains
    const mountain = (px, py, wl, wr, by, c, sf) => {
      const L = [], Rr = [], n = 5;
      for (let i = 0; i <= n; i++) { const t = i / n, j = i && i < n; L.push([px - wl * t + (j ? R(q, -8, 8) : 0), py + (by - py) * t + (j ? R(q, -10, 10) : 0)]); }
      for (let i = 1; i <= n; i++) { const t = i / n, j = i < n; Rr.push([px + wr * t + (j ? R(q, -8, 8) : 0), py + (by - py) * t + (j ? R(q, -10, 10) : 0)]); }
      const full = L.slice().reverse().concat(Rr), rid = [];
      for (let i = 1; i <= n; i++) { const t = i / n; rid.push([px + wr * 0.18 * t + (i < n ? R(q, -7, 7) : 0), py + (by - py) * t]); }
      const sh = [[px, py], ...Rr, ...rid.reverse()];
      const ys = py + (by - py) * sf, sn = [[px - wl * 1.3, py - 30], [px + wr * 1.3, py - 30]];
      for (let i = 0; i <= 8; i++) { const t = i / 8; sn.push([px + wr * sf * 1.2 - (wr + wl) * sf * 1.2 * t, ys + (i % 2 ? R(q, 6, 16) : R(q, -12, -2))]); }
      const id = S.id();
      S.def(`<path id="${id}" d="${P(full)}"/><clipPath id="${id}c"><use href="#${id}"/></clipPath>`);
      return `<g clip-path="url(#${id}c)"><use href="#${id}" fill="${c[0]}"/><path d="${P(sn)}" fill="${c[1]}"/><path d="${P(sh)}" fill="${c[2]}" opacity="${c[3]}"/></g>`;
    };
    const far = ['#a6b8de', '#f4f8ff', '#4a64a8', 0.38];
    S.add(mountain(40, 246, 150, 120, 470, far, 0.42), mountain(450, 280, 120, 100, 470, far, 0.4), mountain(330, 226, 150, 140, 470, far, 0.45), mountain(190, 296, 110, 120, 470, far, 0.4));
    S.add('<rect y="290" width="450" height="190" fill="url(#hz)"/>');
    const near = ['#c4d4ee', '#ffffff', '#5a7ab8', 0.3];
    S.add(mountain(96, 372, 170, 150, 490, near, 0.75), mountain(370, 362, 160, 170, 490, near, 0.75));
    S.def(`<g id="pn"><path d="M0 -60L14 -36H8L20 -16H10L24 0H-24L-10 -16H-20L-8 -36H-14Z" fill="#3a6a80" stroke="#1d3a4c" stroke-width="2" stroke-linejoin="round"/><path d="M0 -60L8 -47Q0 -43 -8 -47ZM-6 -36L8 -36L13 -27Q2 -24 -10 -28ZM-8 -16L10 -16L18 -6Q2 -2 -16 -7Z" fill="#fff"/></g>`);
    S.add([[132, 470, 0.45], [150, 476, 0.55], [114, 478, 0.6], [304, 468, 0.45], [320, 474, 0.55], [340, 480, 0.6]].map((p) => use('pn', p[0], p[1], p[2], ' opacity=".85"')).join(''));
    // snow ground
    S.add(`<path d="${ridge((x) => 470 + 5 * Math.sin(x / 40) + 3 * Math.sin(x / 13), 26)}" fill="url(#sn)"/>`);
    S.add('<path d="M20 520q40 -10 80 0M300 512q50 -12 100 2M60 580q60 -14 110 0M290 590q60 -16 120 -2" stroke="#a8c0e0" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/><ellipse cx="225" cy="580" rx="160" ry="34" fill="#ffffff" opacity=".35"/>');
    // icy cliffs: vertical prism facets + lumpy snow cap + icicles
    const E = [[72, 184], [94, 250], [84, 304], [110, 362], [100, 430], [118, 500], [106, 562], [126, 630], [118, 745]];
    const s1 = [[8, 180], [16, 320], [6, 460], [18, 600], [10, 745]], s2 = [[34, 182], [44, 300], [34, 430], [50, 560], [42, 745]], s3 = [[58, 183], [70, 280], [60, 400], [78, 520], [70, 745]];
    const strip = (a, b) => P(a.concat(b.slice().reverse()));
    const capP = [[-20, 150], [12, 138], [44, 144], [72, 160], [90, 180], [84, 196], [72, 190], [64, 206], [54, 194], [42, 202], [30, 190], [16, 204], [2, 192], [-20, 198]];
    const cliff = (m) => {
      const M = (a) => (m ? MX(a) : a), edge = [[-20, 745], [-20, 170]];
      const cols = m ? ['#7fc4ee', '#a8defa', '#86cdf2', '#dcf6ff'] : ['#c6ecff', '#86cdf2', '#a8defa', '#4a94d2'];
      const L0 = [[-20, 170], [-20, 745]];
      return `<path d="${P(M(edge.concat(E)))}" fill="${O}" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>`
        + `<path d="${strip(M(L0), M(s1))}" fill="${cols[0]}"/><path d="${strip(M(s1), M(s2))}" fill="${cols[1]}"/><path d="${strip(M(s2), M(s3))}" fill="${cols[2]}"/><path d="${strip(M(s3), M(E))}" fill="${cols[3]}"/>`
        + `<path d="${PL(M(s1))}${PL(M(s2))}${PL(M(s3))}" stroke="#2a5a96" stroke-width="1.5" fill="none" opacity=".6"/><path d="${PL(M([[22, 230], [26, 300]]))}${PL(M([[50, 340], [46, 400]]))}${PL(M([[14, 480], [10, 540]]))}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`
        + cel(S, smooth(M(capP)), '#ffffff', '#bcd2ee', { dx: m ? -3 : 3, dy: 6, sw: 3 })
        + `<path d="${P(M([[66, 204], [70, 226], [74, 202]]))}${P(M([[40, 200], [44, 218], [48, 198]]))}${P(M([[14, 202], [18, 230], [22, 200]]))}" fill="#e6f8ff" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`;
    };
    S.add(cliff(0), cliff(1));
    // glowing crystals
    const cc = ['#ffffff', '#a6f2ff', '#3aa6e0'];
    crystalDef(S, 'c', cc);
    const cg = glowDef(S, '#8ff4ff', 0.7);
    S.add(cg(110, 580, 90, 0.8), cg(346, 572, 90, 0.8));
    S.add(cry('c', 96, 610, 1.1, -14, 0.9), cry('c', 122, 612, 1.5, 6), cry('c', 142, 614, 0.8, 26), cry('c', 108, 616, 0.6, -32));
    S.add(cry('c', 330, 604, 0.85, -20), cry('c', 352, 606, 1.45, 4), cry('c', 374, 608, 1, 20, 0.9));
    S.add(cry('c', 160, 486, 0.4, -6), cry('c', 168, 487, 0.28, 20), cry('c', 290, 484, 0.36, 8));
    // foreground snow drifts
    S.add(cel(S, smooth([[-20, 690], [40, 652], [110, 662], [170, 702], [214, 812], [-20, 812]]), '#ffffff', '#a8c0e6', { dx: 12, dy: 10, sw: 3 }), cel(S, smooth([[470, 672], [400, 642], [330, 662], [282, 722], [262, 812], [470, 812]]), '#ffffff', '#a8c0e6', { dx: 12, dy: 10, sw: 3 }));
    S.add(cry('c', 56, 690, 0.65, -12), cry('c', 72, 692, 0.95, 8), cry('c', 392, 676, 0.75, 14));
    // snowfall
    S.add(dotP(dots(q, 60, [0, 120, 450, 800], 0.5), '#fff', 2.6, 0.85), dotP(dots(q, 26, [0, 120, 450, 800], 0.7), '#fff', 5, 0.5));
    vign(S, '#0e1a40', 0.62, 590, 0.45);
    return S.out();
  }

  /* ------------------------------------------------------------ VOLCANO */
  function volcano() {
    const S = scene(), q = rng(606);
    S.def(lin('sk', 0, 0, 0, 470, [[0, '#1a0816'], [0.3, '#3e0f24'], [0.66, '#9a2a20'], [1, '#f2782a']])
      + rad('cg', 334, 296, 270, [[0, '#ffb04a', 0.8], [0.3, '#ff6a2a', 0.35], [1, '#ff6a2a', 0]])
      + lin('gd', 0, 462, 0, 800, [[0, '#6a3430'], [0.25, '#3e2026'], [0.6, '#24131a'], [1, '#0a0507']])
      + '<filter id="lb" x="-.3" y="-.3" width="1.6" height="1.6"><feGaussianBlur stdDeviation="6"/></filter>');
    S.add('<rect width="450" height="800" fill="url(#sk)"/><rect width="450" height="600" fill="url(#cg)"/>');
    // smoke plume
    let pl = '', pl2 = '';
    [[330, 270, 22], [318, 236, 30], [300, 196, 38], [270, 156, 44], [232, 120, 52], [186, 86, 58], [130, 60, 64], [70, 40, 70], [10, 30, 74], [356, 250, 20], [248, 168, 30]].forEach(([x, y, r]) => { pl += circ(x, y, r); pl2 += circ(x + r * 0.2, y + r * 0.3, r); });
    S.add(`<path d="${pl2}" fill="#8a2a22" opacity=".9"/><path d="${pl}" fill="#2e1420"/>`);
    // far ridge
    S.add('<path d="M-20 470L-20 352C10 344 30 326 52 332C72 338 84 356 112 362C142 368 162 396 200 418C228 434 248 452 262 470Z" fill="#5a1e2a"/><path d="M-20 352C10 344 30 326 52 332C72 338 84 356 112 362C142 368 162 396 200 418" stroke="#a8402e" stroke-width="2" fill="none" opacity=".6"/>');
    // volcano
    S.add('<path d="M150 470C210 440 262 352 302 300L314 292C326 288 344 288 356 292L368 300C392 340 430 420 480 452L480 470Z" fill="#4a2430"/><path d="M356 292L368 300C392 340 430 420 480 452L480 470L384 470C374 420 362 350 350 296Z" fill="#2a131c"/><path d="M302 300C270 340 240 400 200 450M314 300C300 340 290 390 272 440" stroke="#7a3a3a" stroke-width="3" fill="none" opacity=".6"/>');
    const s1 = [[322, 294], [316, 320], [302, 350], [296, 382], [280, 412], [262, 442], [250, 470]], s2 = [[348, 296], [354, 330], [366, 362], [372, 400], [390, 432], [400, 470]];
    const sd = smooth(s1, 0) + smooth(s2, 0);
    S.add(`<g filter="url(#lb)"><path d="${sd}" stroke="#ff5a1e" stroke-width="14" fill="none"/></g><path d="${sd}" stroke="#ff7a22" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${sd}" stroke="#ffd04a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
    const eg = glowDef(S, '#ffcf5a', 0.9);
    S.add(eg(335, 288, 60, 0.8), '<path d="M318 292C320 270 326 256 334 244C340 258 348 270 352 292Z" fill="#ffb03a"/><path d="M326 292C328 276 332 266 335 258C338 268 342 278 344 292Z" fill="#fff0a0"/><ellipse cx="335" cy="293" rx="22" ry="5" fill="#ffcf5a"/>');
    S.add(dotP('M306 240h0M364 226h0M290 262h0M376 256h0M340 212h0M322 228h0', '#ffc04a', 7));
    // ground
    S.add(`<path d="${ridge((x) => 470 + 4 * Math.sin(x / 33) + 3 * Math.sin(x / 12), 26)}" fill="url(#gd)"/>`);
    // lava rivers + glow on the ground
    const lg = glowDef(S, '#ff6a2a', 0.5);
    const rv = [[480, 476], [440, 482], [396, 496], [360, 520], [352, 552], [372, 590], [420, 628], [480, 660]];
    const lv = [[-20, 494], [30, 500], [80, 512], [118, 534], [124, 566], [96, 604], [50, 640], [-20, 676]];
    const river = (p, a, b) => `<g filter="url(#lb)"><path d="${ribbon(p, a + 22, b + 34)}" fill="#ff4a1a" opacity=".55"/></g><path d="${ribbon(p, a + 7, b + 9)}" fill="#1a0a0c"/><path d="${ribbon(p, a, b)}" fill="#ff6a1e"/><path d="${ribbon(p, a * 0.45, b * 0.45)}" fill="#ffc23a"/>`;
    S.add(lg(400, 560, 120, 0.7), lg(70, 570, 120, 0.7), river(rv, 6, 40), river(lv, 8, 40));
    S.add('<path d="M360 548q4 6 3 12M392 604q8 4 14 2M108 540q3 6 1 12M70 616q-6 4 -12 4" stroke="#fff2b0" stroke-width="2" fill="none" stroke-linecap="round"/>');
    // mid-ground boulders with lava rim light
    const rc = ['#4a2e34', '#24141a', '#7a4446'];
    S.add(rock(S, q, 150, 506, 40, 22, rc, 2.5), rock(S, q, 300, 504, 34, 18, rc, 2.5), rock(S, q, 186, 498, 18, 10, rc, 2));
    S.add('<path d="M128 640l14 6l6 -8l16 10l10 -4M300 650l-12 8l-10 -6l-14 10M160 720l20 -4l8 8l18 -6M290 730l-16 -6l-10 8" stroke="#ff7a2a" stroke-width="2" fill="none" opacity=".55"/>');
    // basalt columns (one unit reused)
    S.def(`<g id="bc"><path d="M-15 520V0L-7.5 -6.6H7.5L15 0V520Z" fill="#3e2630"/><path d="M-15 0L-7.5 6.6V520H-15Z" fill="#5c3c46"/><path d="M7.5 6.6L15 0V520H7.5Z" fill="#26161c"/><path d="M-15 0L-7.5 -6.6H7.5L15 0L7.5 6.6H-7.5Z" fill="#7a4e4c"/><path d="M-15 0L-7.5 6.6H7.5L15 0" stroke="#ff8a3a" stroke-width="1.6" fill="none"/><path d="M-7.5 6.6V520M7.5 6.6V520" stroke="${O}" stroke-width="1.3"/><path d="M-15 520V0L-7.5 -6.6H7.5L15 0V520" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round"/></g>`);
    S.add([[-8, 1.2, 392], [24, 1.05, 446], [52, 0.95, 520], [76, 0.8, 610], [458, 1.2, 380], [426, 1.05, 436], [398, 0.95, 506], [372, 0.8, 640]].map(([x, s, y]) => use('bc', x, y, s)).join(''));
    S.add(rock(S, q, 150, 772, 64, 34, rc), rock(S, q, 300, 780, 70, 36, rc), rock(S, q, 196, 792, 40, 20, rc));
    // embers
    const em = glowDef(S, '#ff9a3a', 0.6);
    let eg2 = '', ed = '';
    for (let i = 0; i < 46; i++) { const x = R(q, 0, 450), y = R(q, 130, 760); if (x > 140 && x < 310 && y > 340 && y < 610 && q() < 0.75) continue; ed += `M${f(x)} ${f(y)}h0`; if (i % 4 === 0) eg2 += em(x, y, 8); }
    S.add(eg2, dotP(ed, '#ffc45a', 3));
    vign(S, '#0a0306', 0.82);
    return S.out();
  }

  /* ------------------------------------------------------------ CASTLE */
  function castle() {
    const S = scene(), q = rng(707);
    S.def(lin('sk', 0, 0, 0, 480, [[0, '#090b24'], [0.5, '#19205a'], [1, '#3b4590']])
      + rad('mh', 150, 208, 250, [[0, '#dfe4ff', 0.55], [0.3, '#a9b4f0', 0.2], [1, '#a9b4f0', 0]])
      + rad('mn', 134, 190, 70, [[0, '#fffef4'], [0.7, '#f6eec8'], [1, '#e0d29a']])
      + lin('pv', 0, 478, 0, 800, [[0, '#4c5488'], [0.35, '#363c6a'], [1, '#121330']]));
    S.add('<rect width="450" height="800" fill="url(#sk)"/><rect width="450" height="520" fill="url(#mh)"/>');
    S.add(dotP(dots(q, 50, [0, 0, 450, 380]), '#fff', 1.6, 0.7), dotP(dots(q, 14, [0, 0, 450, 320]), '#fff', 2.8, 0.85));
    S.add('<circle cx="152" cy="208" r="54" fill="url(#mn)"/><g fill="#d6c890" opacity=".55"><circle cx="134" cy="194" r="9"/><circle cx="168" cy="228" r="11"/><circle cx="172" cy="184" r="6"/><circle cx="128" cy="230" r="5"/></g>');
    S.add('<path d="M10 268C60 258 120 262 200 254C150 266 90 270 10 274ZM260 168C320 160 380 164 460 156C400 170 330 174 260 172Z" fill="#2a3272" opacity=".9"/><path d="M40 262C90 256 140 258 190 255" stroke="#6a76c0" stroke-width="1.5" fill="none" opacity=".7"/>');
    S.def('<path id="bt" d="M0 0q4 -6 10 -4q-2 3 2 5q-6 0 -12 2q-6 -2 -12 -2q4 -2 2 -5q6 -2 10 4z"/>');
    S.add(`<g fill="${O}">${use('bt', 236, 132)}${use('bt', 268, 156, 0.7)}${use('bt', 214, 168, 0.55)}</g>`);
    // far spire
    S.add('<path d="M226 400V300H220L234 262L248 300H242V400Z" fill="#283070"/>');
    // citadel
    let cr = 'M-10 482L-10 396';
    for (let x = -10; x < 460; x += 18) cr += `H${x}V386H${x + 10}V396`;
    cr += 'H460V482Z';
    const tower = (x0, x1, top, tip) => `M${x0} 482V${top}H${x1}V482ZM${x0 - 8} ${top + 2}L${(x0 + x1) / 2} ${tip}L${x1 + 8} ${top + 2}Z`;
    let gh = 'M176 482V342';
    for (let x = 176; x < 274; x += 16) gh += `H${x}V334H${x + 9}V342`;
    gh += 'H274V482Z';
    S.add(`<path d="${cr}${tower(120, 166, 256, 178)}${tower(290, 340, 234, 150)}${tower(14, 44, 322, 270)}${tower(406, 436, 330, 282)}${gh}" fill="#1a1d4c"/>`);
    S.add('<path d="M120 482V256M112 258L143 178M290 482V234M282 236L315 150M176 482V342M14 482V322M6 324L29 270" stroke="#5462aa" stroke-width="2" fill="none" opacity=".7"/>');
    S.add('<path d="M206 482L206 432A19 19 0 0 1 244 432L244 482Z" fill="#0b0d26"/><path d="M212 482V430M219 482V420M226 482V417M233 482V420M240 482V430M206 448H244M206 464H244" stroke="#2a2f62" stroke-width="2"/>');
    const wg = glowDef(S, '#ffb447', 0.55);
    const wins = [[140, 300], [140, 352], [140, 404], [312, 280], [312, 330], [312, 384], [26, 360], [418, 372], [192, 372], [252, 372], [70, 436], [96, 440], [360, 440], [384, 436]];
    S.add(wins.map(([x, y]) => wg(x + 3, y - 4, 16)).join(''), `<path d="${wins.map(([x, y]) => `M${x} ${y}v-8a3 3 0 0 1 6 0v8z`).join('')}" fill="#ffd36e"/>`);
    // courtyard paving
    S.add('<rect y="480" width="450" height="322" fill="url(#pv)"/>');
    const vy = 300, X = (xb, y) => 225 + ((xb - 225) * (y - vy)) / (800 - vy), rows = [480, 492, 507, 527, 553, 586, 628, 682, 750, 840];
    let pv = '';
    rows.forEach((y) => { pv += `M-20 ${y}H470`; });
    for (let k = 0; k < rows.length - 1; k++) for (let xb = -560 + (k % 2) * 45; xb < 1010; xb += 90) pv += `M${f(X(xb, rows[k]))} ${rows[k]}L${f(X(xb, rows[k + 1]))} ${rows[k + 1]}`;
    S.add(`<path d="${pv}" stroke="#1a1c3c" stroke-width="2" opacity=".8"/><path d="${rows.map((y) => `M-20 ${y + 2}H470`).join('')}" stroke="#7a84c4" stroke-width="1" opacity=".22"/><ellipse cx="225" cy="560" rx="170" ry="44" fill="#8a96d8" opacity=".16"/>`);
    // low courtyard walls
    const lw = 'M-20 556L-20 496L150 480L150 500Z';
    S.add(cel(S, lw, '#363d72', '#252a56', { sw: 2.5, dx: 0, dy: -6 }), cel(S, mir(lw), '#363d72', '#252a56', { sw: 2.5, dx: 0, dy: -6 }), '<path d="M-20 496L150 480M470 496L300 480" stroke="#6a76b8" stroke-width="2" opacity=".7"/>');
    // braziers
    flameDef(S, 'fm');
    const bg = glowDef(S, '#ffa040', 0.6), pg = glowDef(S, '#ff9a3a', 0.4);
    const braz = (x, y) => `<path d="M${x - 10} ${y}L${x - 4} ${y - 30}M${x + 10} ${y}L${x + 4} ${y - 30}M${x} ${y}V${y - 30}" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M${x - 10} ${y}L${x - 4} ${y - 30}M${x + 10} ${y}L${x + 4} ${y - 30}M${x} ${y}V${y - 30}" stroke="#4a4058" stroke-width="2.5" stroke-linecap="round"/><path d="M${x - 18} ${y - 34}H${x + 18}L${x + 12} ${y - 22}Q${x} ${y - 18} ${x - 12} ${y - 22}Z" fill="#4a4058" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x - 14} ${y - 31}H${x + 2}" stroke="#7a7090" stroke-width="2"/>${use('fm', x, y - 33, 1.3)}`;
    S.add(pg(100, 560, 120, 0.3), pg(350, 560, 120, 0.3), bg(100, 488, 120), bg(350, 488, 120), braz(100, 560), braz(350, 560));
    // foreground pillars + banners
    const pil = (x0, x1) => cel(S, `M${x0} 740L${x0} -20L${x1} -20L${x1} 740Z`, '#3e4680', '#272c5a', { dx: 14, dy: 0, hi: `<path d="M${x0 + 4} -20V740" stroke="#6a76b8" stroke-width="5" opacity=".8"/>` })
      + cel(S, `M${x0 - 12} 780L${x0 - 12} 736L${x1 + 12} 736L${x1 + 12} 780Z`, '#3e4680', '#272c5a', { dx: 10, dy: 4 })
      + `<path d="M${x0} 140H${x1}M${x0} 300H${x1}M${x0} 460H${x1}M${x0} 620H${x1}" stroke="${O}" stroke-width="2" opacity=".5"/>`;
    S.add(pil(-20, 66), pil(384, 470));
    const banner = (x0, x1) => {
      const m = (x0 + x1) / 2;
      return `<path d="M${x0 - 8} 118H${x1 + 8}" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M${x0 - 8} 118H${x1 + 8}" stroke="#b8945a" stroke-width="3" stroke-linecap="round"/>`
        + cel(S, `M${x0} 120L${x1} 120L${x1} 330L${m} 306L${x0} 330Z`, '#c8283e', '#84162c', { dx: 9, dy: 0, sw: 3, hi: `<path d="M${x0 + 9} 120V322M${m + 4} 120V312" stroke="#e8506a" stroke-width="4" opacity=".7"/><path d="M${m - 5} 120V314" stroke="#84162c" stroke-width="3" opacity=".6"/>` });
    };
    S.add(banner(66, 106), banner(344, 384));
    vign(S, '#05060f', 0.85);
    return S.out();
  }

  /* ------------------------------------------------------------ ABYSS */
  function abyss() {
    const S = scene(), q = rng(808);
    S.def(lin('sk', 0, 0, 0, 800, [[0, '#06031a'], [0.35, '#1c0a46'], [0.58, '#3a1062'], [1, '#14061f']])
      + '<filter id="bl" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="16"/></filter>'
      + lin('pl', 0, 478, 0, 800, [[0, '#5e4696'], [0.25, '#3a2a68'], [1, '#0e0820']])
      + rad('pn', 340, 160, 34, [[0, '#ffd0ff'], [0.5, '#c06ae0'], [1, '#5a1a8a']]));
    S.add('<rect width="450" height="800" fill="url(#sk)"/>');
    S.add('<g filter="url(#bl)"><ellipse cx="110" cy="260" rx="160" ry="70" fill="#c43ad0" opacity=".6" transform="rotate(-25 110 260)"/><ellipse cx="340" cy="210" rx="150" ry="60" fill="#5a3af0" opacity=".6" transform="rotate(20 340 210)"/><ellipse cx="250" cy="380" rx="170" ry="46" fill="#ff4fa8" opacity=".4"/><ellipse cx="300" cy="320" rx="70" ry="28" fill="#3ad8f0" opacity=".3"/><ellipse cx="80" cy="440" rx="110" ry="40" fill="#8a3af0" opacity=".45"/></g>');
    S.add(dotP(dots(q, 70, [0, 0, 450, 480]), '#fff', 1.6, 0.75), dotP(dots(q, 18, [0, 0, 450, 460]), '#fff', 2.8, 0.85));
    S.def('<path id="sp" d="M0 -7L1.3 -1.3L7 0L1.3 1.3L0 7L-1.3 1.3L-7 0L-1.3 -1.3Z" fill="#fff"/>');
    S.add([[60, 150, 1], [410, 300, 0.8], [180, 230, 0.6], [270, 120, 0.7], [30, 380, 0.7], [420, 460, 0.6]].map((p) => use('sp', p[0], p[1], p[2])).join(''));
    // ringed planet
    S.add('<ellipse cx="340" cy="160" rx="52" ry="11" fill="none" stroke="#ffb8f0" stroke-width="3" opacity=".5" transform="rotate(-14 340 160)"/><circle cx="340" cy="160" r="30" fill="url(#pn)"/><path d="M288 160A52 11 0 0 0 392 160" stroke="#ffd0f6" stroke-width="3" fill="none" opacity=".85" transform="rotate(-14 340 160)"/>');
    // floating islands
    const island = (cx, ty, w, d, c, sw) => {
      const hw = w / 2, th = w * 0.1, pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([cx + hw - w * t, ty + 3 + d * Math.pow(Math.sin(Math.PI * t), 0.9) * (i === 4 ? 1 : R(q, 0.55, 0.95))]); }
      const body = `M${f(cx - hw)} ${f(ty)}C${f(cx - hw)} ${f(ty - th)} ${f(cx + hw)} ${f(ty - th)} ${f(cx + hw)} ${f(ty)}L` + pts.map(pt).join('L') + 'Z';
      const top = `M${f(cx - hw)} ${f(ty)}C${f(cx - hw)} ${f(ty - th)} ${f(cx + hw)} ${f(ty - th)} ${f(cx + hw)} ${f(ty)}C${f(cx + hw)} ${f(ty + th * 0.8)} ${f(cx - hw)} ${f(ty + th * 0.8)} ${f(cx - hw)} ${f(ty)}Z`;
      return cel(S, body, c[0], c[1], { sw, dx: w * 0.12, dy: 0, oc: sw ? O : c[1] }) + `<path d="${top}" fill="${c[2]}"${sw ? ` stroke="${O}" stroke-width="${sw}"` : ''}/>`;
    };
    S.add(island(225, 200, 50, 36, ['#4a3a82', '#33285e', '#7a62c0'], 0), island(392, 286, 86, 58, ['#4a3a82', '#33285e', '#7a62c0'], 0));
    crystalDef(S, 'm', ['#ffd0f8', '#f060e0', '#9a2ab0']);
    crystalDef(S, 'n', ['#e0fdff', '#62e6ff', '#2a8ad0']);
    const ig = glowDef(S, '#ff6ae8', 0.6), cyg = glowDef(S, '#62e6ff', 0.6);
    S.add(ig(74, 236, 70, 0.6), island(70, 254, 130, 96, ['#5a4296', '#2e2258', '#8a6ad0'], 3), cry('m', 52, 254, 0.65, -10, 0.8), cry('m', 72, 252, 1, 4, 0.9), cry('m', 92, 254, 0.5, 20, 0.8));
    S.add('<path d="M52 288l8 9l-8 9M72 290v18M66 300h12M92 286l-5 8h10z" stroke="#62e6ff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');
    S.add(island(402, 430, 64, 46, ['#5a4296', '#2e2258', '#8a6ad0'], 2.5), cry('n', 404, 430, 0.55, 6, 0.7));
    // platform
    const plat = 'M-20 524C40 494 120 480 225 480C330 480 410 494 470 524L470 812L-20 812Z';
    const pg = glowDef(S, '#ff5ad0', 0.5);
    S.add(pg(225, 486, 260, 0.12), `<path d="${plat}" fill="url(#pl)"/><path d="M-20 524C40 494 120 480 225 480C330 480 410 494 470 524" stroke="#a88af0" stroke-width="3" fill="none"/><path d="M-20 527C40 497 120 483 225 483C330 483 410 497 470 527" stroke="${O}" stroke-width="2" fill="none" opacity=".6"/>`);
    let cr = '';
    for (let i = 0; i < 14; i++) { const x = R(q, 0, 450), y = R(q, 510, 790); if (x > 120 && x < 330 && y < 620) continue; cr += `M${f(x)} ${f(y)}l${f(R(q, 10, 24))} ${f(R(q, -4, 6))}l${f(R(q, 6, 18))} ${f(R(q, 2, 10))}`; }
    S.add(`<path d="${cr}" stroke="#1c1236" stroke-width="2.4" fill="none"/><path d="M30 700l20 -6l12 8l22 -4M330 720l18 6l14 -8l20 4" stroke="#ff6ae0" stroke-width="2" fill="none" opacity=".7"/>`);
    // rune circle under the enemy
    let rt = '';
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, x = 225 + Math.cos(a) * 112, y = 586 + Math.sin(a) * 28; rt += `M${f1(x - 3)} ${f1(y)}h6`; }
    S.add(`<ellipse cx="225" cy="586" rx="130" ry="34" fill="#62e6ff" opacity=".08"/><ellipse cx="225" cy="586" rx="124" ry="32" stroke="#8af0ff" stroke-width="2" fill="none" opacity=".45"/><ellipse cx="225" cy="586" rx="100" ry="25" stroke="#8af0ff" stroke-width="1.2" fill="none" opacity=".35"/><path d="${rt}" stroke="#8af0ff" stroke-width="2" opacity=".5"/>`);
    // monoliths with abstract runes
    const mono = (pts) => cel(S, P(pts), '#4e3e80', '#2a1f4c', { dx: 12, dy: 0 });
    S.add(cyg(76, 470, 60, 1.6), cyg(380, 480, 56, 1.6));
    S.add(mono([[44, 616], [50, 380], [74, 350], [98, 374], [106, 616]]), mono([[346, 604], [352, 404], [370, 372], [396, 394], [404, 604]]));
    const gl = 'M74 396v26M66 404l8 -8l8 8M68 418h12'
      + 'M66 462l8 14l8 -14zM74 486v12'
      + 'M70 530a5 5 0 1 0 8 0M74 536v14M68 546l12 0'
      + 'M374 418l-8 10h16zM374 438v14M368 446h12'
      + 'M374 486a6 6 0 1 1 0.1 0M374 498v12'
      + 'M366 540l8 -10l8 10M370 548h8';
    S.add(`<path d="${gl}" stroke="#62e6ff" stroke-width="6" fill="none" opacity=".3" stroke-linecap="round" stroke-linejoin="round"/><path d="${gl}" stroke="#c4faff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    // crystal clusters in the foreground
    S.add(ig(70, 700, 90, 0.7), ig(388, 690, 90, 0.7));
    S.add(cry('m', 40, 726, 1.2, -18, 0.95), cry('m', 70, 730, 1.85, 2), cry('m', 100, 734, 1.05, 22, 0.95), cry('n', 126, 740, 0.6, 34, 0.9));
    S.add(cry('m', 360, 716, 1.1, -16, 0.95), cry('m', 392, 720, 1.7, 6), cry('m', 420, 726, 0.95, 24, 1.05), cry('n', 336, 726, 0.55, -30, 0.9));
    const rc = ['#5a4296', '#2e2258', '#8a6ad0'];
    S.add(rock(S, q, 150, 312, 18, 12, rc, 2), rock(S, q, 300, 268, 14, 9, rc, 2), rock(S, q, 20, 520, 22, 14, rc, 2), rock(S, q, 428, 540, 18, 12, rc, 2));
    S.add(dotP(dots(q, 24, [10, 300, 440, 760], 0.7), '#ffb8f6', 3.2, 0.8));
    vign(S, '#05020c', 0.82);
    return S.out();
  }

  return { forest: forest(), desert: desert(), crypt: crypt(), swamp: swamp(), ice: ice(), volcano: volcano(), castle: castle(), abyss: abyss() };
})();
