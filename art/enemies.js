const ART_ENEMY = (() => {
  /* ===================== helpers ===================== */
  const O = '#1d1220';
  let N = 0, DEFS = [], GC = {}, CL = new Set();
  // outline stroke classes (stroke colour O) to keep markup small
  const k = w => { CL.add(w); return 'k' + String(w).replace('.', '_'); };
  const mini = t => t.replace(/ d="([^"]*)"/g, (m, d) => ' d="' + d.replace(/,/g, ' ').replace(/\s+/g, ' ').replace(/ ?([MLCQAZHV]) ?/gi, '$1').replace(/ -/g, '-').replace(/(^|[^\d])0\./g, '$1.') + '"');
  const uid = () => 'i' + (N++).toString(36);
  const def = s => { DEFS.push(s); };
  const svg = body => {
    const d = DEFS.join(''); DEFS = []; N = 0; GC = {};
    const css = [...CL].map(w => `.k${String(w).replace('.', '_')}{stroke:${O};stroke-width:${w}}`).join('') + '.n{fill:none}'; CL = new Set();
    return mini('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" stroke-linejoin="round" stroke-linecap="round"><style>' + css + '</style>' +
      (d ? '<defs>' + d + '</defs>' : '') + body + '</svg>').replace(/(["\s(,-])0\./g, '$1.');
  };
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const dk = (c, t = .3) => mix(c, '#1a0b22', t);
  const lt = (c, t = .35) => mix(c, '#fffbea', t);
  const r1 = v => Math.round(v * 10) / 10;

  const stops = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const cached = (k, f) => GC[k] || (GC[k] = f());
  const lin = (s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => cached(JSON.stringify(['l', s, x1, y1, x2, y2]), () => { const i = uid(); def(`<linearGradient id="${i}"${x1 ? ` x1="${x1}"` : ''}${y1 ? ` y1="${y1}"` : ''}${x2 !== 1 ? ` x2="${x2}"` : ''}${y2 ? ` y2="${y2}"` : ''}>${stops(s)}</linearGradient>`); return `url(#${i})`; });
  const rad = (s, cx = .5, cy = .5, r = .5, fx = cx, fy = cy) => cached(JSON.stringify(['r', s, cx, cy, r, fx, fy]), () => { const i = uid(); def(`<radialGradient id="${i}"${cx !== .5 ? ` cx="${cx}"` : ''}${cy !== .5 ? ` cy="${cy}"` : ''}${r !== .5 ? ` r="${r}"` : ''}${fx !== cx ? ` fx="${fx}"` : ''}${fy !== cy ? ` fy="${fy}"` : ''}>${stops(s)}</radialGradient>`); return `url(#${i})`; });
  const glow = (cx, cy, rx, c, a = .7, ry = rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${rad([[0, c, a], [.45, c, a * .45], [1, c, 0]])}"/>`;

  // ellipse as path (absolute arcs only)
  const E = (cx, cy, rx, ry = rx) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
  // mirror an absolute M/L/C/Q/Z path around x=128
  const mir = d => d.replace(/([MLCQSTHVZA])([^MLCQSTHVZA]*)/g, (m, c, a) => {
    const n = a.trim() ? a.trim().split(/[\s,]+/).map(Number) : [];
    if (c === 'H') return c + n.map(x => 256 - x).join(' ');
    if (c === 'V' || c === 'Z') return c + n.join(' ');
    if (c === 'A') return c + n.map((v, i) => i % 7 === 5 ? 256 - v : (i % 7 === 4 ? 1 - v : v)).join(' ');
    return c + n.map((v, i) => i % 2 ? v : 256 - v).join(' ');
  });
  const flipX = c => c ? `<g transform="matrix(-1 0 0 1 256 0)">${c}</g>` : '';
  const pl = pts => 'M' + pts.map(p => p.join(' ')).join('L');
  const mp = pts => pts.map(([x, y]) => [256 - x, y]);

  // outlined plain shape
  const P = (d, fill, w = 4, x = '') => `<path d="${d}" fill="${fill}"${w ? ` class="${k(w)}"` : ''}${x}/>`;
  const C = (cx, cy, r, fill, w = 4) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${w ? ` class="${k(w)}"` : ''}/>`;
  const L = (d, c = O, w = 4, x = '') => c === O ? `<path d="${d}" class="n ${k(w)}"${x}/>` : `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${x}/>`;

  // cel-shaded part: shadow colour everywhere, lit copy shifted up-left, clipped; then outline
  const part = (d, fill, sh, o = {}) => {
    const i = uid();
    def(`<path id="${i}" d="${d}"/><clipPath id="${i}c"><use href="#${i}"/></clipPath>`);
    const [dx, dy] = o.off || [-6, -6];
    return `<use href="#${i}" fill="${sh}"${o.op ? ` opacity="${o.op}"` : ''}/><g clip-path="url(#${i}c)"${o.op ? ` opacity="${o.op}"` : ''}><use href="#${i}" fill="${fill}" x="${dx}" y="${dy}"/>${o.in || ''}</g>` +
      (o.w === 0 ? '' : o.stroke ? `<use href="#${i}" fill="none" stroke="${o.stroke}" stroke-width="${o.w || 4}"/>` : `<use href="#${i}" class="n ${k(o.w || 4)}"/>`);
  };
  // clip arbitrary content to a shape (no fill)
  const clipTo = (d, content) => { const i = uid(); def(`<clipPath id="${i}"><path d="${d}"/></clipPath>`); return `<g clip-path="url(#${i})">${content}</g>`; };

  // tubes (limbs / bones / poles): outlines first, then fills, so joints merge
  const tubes = (list, c, sh, ow = 4) => {
    let a = '', b = '';
    for (const [d, w] of list) {
      a += `<path d="${d}" class="n ${k(w + 2 * ow)}"/>`;
      b += `<path d="${d}" fill="none" stroke="${sh}" stroke-width="${w}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${r1(w * .55)}" transform="translate(${r1(-w * .17)} ${r1(-w * .17)})"/>`;
    }
    return a + b;
  };

  // tapered shape along a chain of cubic beziers [x0,y0, c1x,c1y,c2x,c2y,x1,y1, ...]
  const bz = (b, k, t) => { const u = 1 - t, o = k * 6; return [0, 1].map(j => u * u * u * b[o + j] + 3 * u * u * t * b[o + 2 + j] + 3 * u * t * t * b[o + 4 + j] + t * t * t * b[o + 6 + j]); };
  const bzd = (b, k, t) => { const u = 1 - t, o = k * 6; return [0, 1].map(j => 3 * u * u * (b[o + 2 + j] - b[o + j]) + 6 * u * t * (b[o + 4 + j] - b[o + 2 + j]) + 3 * t * t * (b[o + 6 + j] - b[o + 4 + j])); };
  const smooth = pts => {
    let d = `M${pts[0]}`;
    for (let i = 1; i < pts.length - 1; i++) d += `Q${pts[i]} ${(pts[i][0] + pts[i + 1][0]) / 2},${(pts[i][1] + pts[i + 1][1]) / 2}`;
    return d + `L${pts[pts.length - 1]}`;
  };
  const taper = (b, w0, w1, n = 10) => {
    const segs = (b.length - 2) / 6, Lp = [], Rp = [];
    const tot = segs * n;
    for (let k = 0; k < segs; k++) for (let s = (k ? 1 : 0); s <= n; s++) {
      const t = s / n, [x, y] = bz(b, k, t); let [dx, dy] = bzd(b, k, t);
      const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const w = (w0 + (w1 - w0) * ((k * n + s) / tot)) / 2;
      Lp.push([Math.round(x - dy * w), Math.round(y + dx * w)]); Rp.push([Math.round(x + dy * w), Math.round(y - dx * w)]);
    }
    return smooth(Lp) + smooth(Rp.reverse()).replace('M', 'L') + 'Z';
  };

  // straight tapered segment
  const seg = (a, b, w0, w1) => {
    let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    const q = (p, w, k) => `${Math.round(p[0] - dy * w * k)} ${Math.round(p[1] + dx * w * k)}`;
    return `M${q(a, w0 / 2, 1)}L${q(b, w1 / 2, 1)}L${q(b, w1 / 2, -1)}L${q(a, w0 / 2, -1)}Z`;
  };
  // cross lines along a bezier chain (segment rings, belly plates)
  const rings = (b, ts, w0, w1, c, sw = 3, bulge = 4) => {
    const segs = (b.length - 2) / 6; let d = '';
    for (const T of ts) {
      const k = Math.min(segs - 1, Math.floor(T * segs)), t = T * segs - k, [x, y] = bz(b, k, t);
      let [dx, dy] = bzd(b, k, t); const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const w = (w0 + (w1 - w0) * T) / 2 + 3;
      d += `M${r1(x - dy * w)} ${r1(y + dx * w)}Q${r1(x + dx * bulge)} ${r1(y + dy * bulge)} ${r1(x + dy * w)} ${r1(y - dx * w)}`;
    }
    return L(d, c, sw);
  };
  // spikes along one side of a bezier chain
  const spikes = (b, ts, w0, w1, len, side = 1) => {
    const segs = (b.length - 2) / 6, pts = [];
    for (const T of ts) {
      const k = Math.min(segs - 1, Math.floor(T * segs)), t = T * segs - k, [x, y] = bz(b, k, t);
      let [dx, dy] = bzd(b, k, t); const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const w = (w0 + (w1 - w0) * T) / 2 * .6, l = w + len * (1 - T * .4);
      pts.push([[r1(x - dy * w * side), r1(y + dx * w * side)], [r1(x - dy * l * side - dx * 6), r1(y + dx * l * side - dy * 6)]]);
    }
    let d = `M${pts[0][0]}`;
    for (let i = 0; i < pts.length; i++) d += `L${pts[i][1]}L${(pts[i + 1] || pts[i])[0]}`;
    return d + 'Z';
  };
  // affine transform of an absolute path (M L C Q A Z)
  const tf = (d, [a, b, c, e, f, g]) => d.replace(/([MLCQA])([^MLCQAZ]*)/g, (m, cmd, args) => {
    const n = args.trim().split(/[\s,]+/).map(Number), o = [], det = a * e - b * c;
    if (cmd === 'A') {
      const sc = Math.sqrt(Math.abs(det));
      for (let i = 0; i < n.length; i += 7) o.push(r1(n[i] * sc), r1(n[i + 1] * sc), n[i + 2], n[i + 3], det < 0 ? 1 - n[i + 4] : n[i + 4], r1(a * n[i + 5] + c * n[i + 6] + f), r1(b * n[i + 5] + e * n[i + 6] + g));
    } else for (let i = 0; i < n.length; i += 2) o.push(Math.round(a * n[i] + c * n[i + 1] + f), Math.round(b * n[i] + e * n[i + 1] + g));
    return cmd + o.join(' ');
  });
  const rot = (deg, tx, ty, sx = 1, s = 1) => { const r = deg * Math.PI / 180, co = Math.cos(r) * s, si = Math.sin(r) * s; return [co * sx, si * sx, -si, co, tx, ty]; };
  // fire / flame shape pointing up, base centre (x,y), height h
  const flame = (x, y, w, h) => { const R = Math.round; return `M${x} ${y}C${R(x - w * .58)} ${y} ${R(x - w * .55)} ${R(y - h * .42)} ${R(x - w * .22)} ${R(y - h * .64)}C${R(x - w * .08)} ${R(y - h * .74)} ${R(x - w * .02)} ${R(y - h * .86)} ${R(x - w * .1)} ${R(y - h)}C${R(x + w * .3)} ${R(y - h * .82)} ${R(x + w * .58)} ${R(y - h * .5)} ${R(x + w * .52)} ${R(y - h * .26)}C${R(x + w * .48)} ${R(y - h * .08)} ${R(x + w * .3)} ${y} ${x} ${y}Z`; };
  const fire = (x, y, w, h, c = ['#ff6a1a', '#ffb02a', '#fff2a0']) =>
    P(flame(x, y, w, h), c[0], 3.5) + `<path d="${flame(x, y - 2, w * .62, h * .72)}" fill="${c[1]}"/><path d="${flame(x, y - 3, w * .3, h * .42)}" fill="${c[2]}"/>`;

  // sparkle star
  const spark =(x, y, r, c, op = 1) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;

  // angry cartoon eye: lid cut by a slanted line (tilt>0: slopes down toward +x)
  const angryEye = (x, y, rx, ry, tilt, o = {}) => {
    const i = uid(), x1 = x - rx - 5, x2 = x + rx + 5, yl = y - ry * (o.cut ?? .3);
    def(`<clipPath id="${i}"><path d="M${x1} ${yl - tilt}L${x2} ${yl + tilt}L${x2} ${y + ry + 6}L${x1} ${y + ry + 6}Z"/></clipPath>`);
    let s = '';
    if (o.glow) s += glow(x, y, rx * 2.3, o.glow, .75, ry * 2.1);
    s += `<g clip-path="url(#${i})"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${o.sc || '#fff'}" class="${k(o.w || 4)}"/>`;
    if (o.pr) {
      const px = x + (o.px || 0), py = y + (o.py || 0);
      s += o.slit ? `<ellipse cx="${px}" cy="${py}" rx="${o.pr * .38}" ry="${o.pr * 1.15}" fill="${o.pc || O}"/>` : `<circle cx="${px}" cy="${py}" r="${o.pr}" fill="${o.pc || O}"/>`;
      s += `<circle cx="${r1(px - o.pr * .35)}" cy="${r1(py - o.pr * .45)}" r="${r1(Math.max(1.6, o.pr * .38))}" fill="#fff"/>`;
    } else s += `<circle cx="${r1(x - rx * .3)}" cy="${r1(y - ry * .05)}" r="${r1(rx * .28)}" fill="#fff" opacity=".9"/>`;
    s += `</g><path d="M${x1 - (o.bx || 0)} ${yl - tilt - (o.by || 0)}L${x2} ${yl + tilt}" class="n ${k(o.bw ?? 5)}"/>`;
    return s;
  };

  /* ===================== SLIME ===================== */
  function slime(p) {
    let s = '', inner = '';
    if (p.aura) s += glow(128, 150, 128, p.aura, .55, 104);
    s += p.back || '';
    s += part('M22 228C22 218 62 212 128 212C194 212 234 218 234 228C234 235 210 237 128 237C46 237 22 235 22 228Z', p.base, p.sh, { off: [-3, -4] });
    if (p.core) inner += `<ellipse cx="128" cy="184" rx="78" ry="54" fill="${rad([[0, p.core, .95], [1, p.core, 0]])}"/>`;
    inner += p.inner || '';
    inner += `<ellipse cx="62" cy="160" rx="10" ry="30" transform="rotate(16 62 160)" fill="#fff" opacity=".45"/><ellipse cx="88" cy="106" rx="10" ry="6" transform="rotate(-38 88 106)" fill="#fff" opacity=".85"/><circle cx="74" cy="124" r="3.5" fill="#fff" opacity=".8"/>`;
    s += part('M126 48C142 60 150 82 168 96C206 112 230 160 226 202C224 226 206 236 182 236L74 236C50 236 30 226 30 202C28 160 52 112 88 96C106 84 112 62 126 48Z',
      rad([[0, p.hi], [.55, p.base], [1, p.base]], .38, .28, .78), p.sh, { off: [-12, -10], in: inner });
    s += p.over || '';
    const eo = { sc: p.sclera || '#fff', pc: p.pupil || O, pr: 10, py: 5, bw: 6, cut: .25 };
    s += angryEye(97, 154, 20, 24, 7, { ...eo, px: 4 }) + angryEye(159, 154, 20, 24, -7, { ...eo, px: -4 });
    const tongue = `<ellipse cx="129" cy="212" rx="16" ry="9" fill="${p.tongue || '#e2557a'}"/>`;
    s += part('M98 186C116 194 142 194 160 186C154 204 141 211 129 211C117 211 104 204 98 186Z', p.mouth || '#4a0f2a', dk(p.mouth || '#4a0f2a', .3), { w: 3.5, off: [0, 0], in: tongue });
    s += P('M108 189L113 201L119 191Z', '#fff', 2.5) + P('M139 191L145 201L150 189Z', '#fff', 2.5);
    s += p.top || '';
    return svg(s);
  }
  const bubble = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" fill-opacity=".75" class="${k(2.5)}"/><circle cx="${r1(x - r * .35)}" cy="${r1(y - r * .35)}" r="${r1(r * .3)}" fill="#fff" opacity=".9"/>`;

  /* ===================== GOBLIN ===================== */
  function goblin(p) {
    let s = '';
    const k = p.skin, ks = p.skinSh;
    const ear = 'M90 84C70 80 48 68 24 56C32 82 54 108 88 112Z', earIn = 'M84 90C68 86 54 78 40 70C48 88 62 100 84 104Z';
    s += p.back || '';
    if (p.spear) {
      s += tubes([['M202 230L202 50', 8]], p.wood, dk(p.wood, .35));
      s += part('M202 14C212 26 214 40 208 52L196 52C190 40 192 26 202 14Z', '#c9d3dc', '#7d8a99', { w: 3.5, off: [-3, -3] });
      s += L('M196 52C186 50 182 40 186 32', O, 7) + L('M196 52C186 50 182 40 186 32', '#a9b5c2', 3);
      s += P('M196 56L208 56L208 66L196 66Z', p.rope, 3) + L('M196 61L208 61', O, 2);
    }
    s += part(ear, k, ks, { in: `<path d="${earIn}" fill="${p.ear}"/>` }) + part(mir(ear), k, ks, { in: `<path d="${mir(earIn)}" fill="${p.ear}"/>` });
    // legs + feet
    s += tubes([['M110 198L106 224', 17], ['M146 198L150 224', 17]], k, ks);
    s += part('M84 236C82 226 92 220 106 220C118 220 124 228 122 236Z', p.boot || k, dk(p.boot || k, .35)) + part('M172 236C174 226 164 220 150 220C138 220 132 228 134 236Z', p.boot || k, dk(p.boot || k, .35));
    // left arm
    s += tubes([['M100 148L82 172L78 190', 15]], k, ks);
    s += part(E(78, 194, 12, 11), k, ks, { off: [-3, -3] });
    // torso
    s += part(p.tunic, p.cloth, dk(p.cloth, .35), { in: p.tunicIn || '' });
    s += p.belt || '';
    // right arm
    s += tubes([p.armR, ], k, ks);
    // head
    s += part('M80 92C78 60 100 40 126 40C154 40 174 60 172 92C170 120 152 140 126 140C100 140 82 120 80 92Z', k, ks, { off: [-8, -7], in: `<ellipse cx="102" cy="62" rx="14" ry="8" transform="rotate(-25 102 62)" fill="${lt(k, .45)}" opacity=".7"/>` });
    s += p.hood || '';
    // face
    s += angryEye(107, 90, 13, 11, 5, { sc: p.eye, pr: 4.5, px: 2, py: 2, bw: 7, bx: 4, by: 4, cut: .2 });
    s += angryEye(147, 90, 13, 11, -5, { sc: p.eye, pr: 4.5, px: -2, py: 2, bw: 7, by: 0, cut: .2 });
    s += part('M100 118C114 126 140 126 154 116C150 134 138 138 127 138C114 138 102 132 100 118Z', '#5a1626', '#3a0c18', { w: 3.5, off: [0, 0] });
    s += P('M106 121L109 110L114 124Z', '#fff4d6', 2.5) + P('M147 120L145 109L140 124Z', '#fff4d6', 2.5);
    s += part('M124 90C116 100 112 112 122 116C132 120 140 112 134 100Z', k, ks, { w: 3.5, off: [-3, -3] });
    s += p.weapon || '';
    return svg(s);
  }

  /* ===================== SKELETON ===================== */
  function skeleton(p) {
    let s = '';
    const B = p.bone, Bs = p.boneSh;
    const hand = (x, y) => C(x, y, 8, B, 3.5) + L(`M${x - 4} ${y + 2}L${x + 4} ${y + 2}`, O, 2);
    s += p.back || '';
    // legs
    s += tubes([[pl([[114, 190], [107, 212], [105, 228]]), 11], [pl([[142, 190], [149, 212], [151, 228]]), 11]], B, Bs);
    s += C(107, 212, 6.5, B, 3.5) + C(149, 212, 6.5, B, 3.5);
    s += part(E(98, 231, 14, 6.5), B, Bs, { w: 3.5, off: [-3, -3] }) + part(E(158, 231, 14, 6.5), B, Bs, { w: 3.5, off: [-3, -3] });
    s += p.legs || '';
    // spine + pelvis
    s += tubes([['M128 112L128 186', 12]], B, Bs);
    s += part('M104 176C98 186 104 198 116 198C122 198 126 192 128 188C130 192 134 198 140 198C152 198 158 186 152 176C144 181 112 181 104 176Z', B, Bs, { off: [-3, -3] });
    s += p.waist || '';
    // ribcage
    const gaps = ['M104 132Q113 128 122 132', 'M102 145Q112 141 122 145', 'M106 158Q114 155 122 158'];
    s += p.torso || part('M128 116C110 116 98 122 96 138C94 154 102 166 114 172L142 172C154 166 162 154 160 138C158 122 146 116 128 116Z', B, Bs,
      { in: gaps.map(g => L(g, O, 5) + L(mir(g), O, 5)).join('') });
    // arms
    s += tubes([[pl(p.armL), 9]], B, Bs) + C(p.armL[0][0], p.armL[0][1], 8, B, 3.5) + C(p.armL[1][0], p.armL[1][1], 5.5, B, 3);
    s += p.midL || '';
    s += hand(...p.armL[2]);
    s += p.shield || '';
    s += tubes([[pl(p.armR), 9]], B, Bs) + C(p.armR[0][0], p.armR[0][1], 8, B, 3.5) + C(p.armR[1][0], p.armR[1][1], 5.5, B, 3);
    s += p.weapon || '';
    s += hand(...p.armR[2]);
    s += p.shoulders || '';
    // skull
    s += part('M106 102L150 102L148 116C140 124 116 124 108 116Z', B, Bs, { off: [-3, -3], w: 3.5 });
    s += part('M94 78C94 52 108 40 128 40C148 40 162 52 162 78C162 92 156 98 152 102L152 109L104 109L104 102C100 98 94 92 94 78Z', B, Bs, { off: [-7, -6], in: `<ellipse cx="110" cy="54" rx="10" ry="6" transform="rotate(-30 110 54)" fill="#fff" opacity=".5"/>` });
    s += L('M108 110L148 110', O, 3) + [114, 121, 128, 135, 142].map(x => L(`M${x} 104L${x} 116`, O, 2.2)).join('');
    s += P('M102 74L124 82C126 90 120 95 113 95C105 95 101 87 102 74Z', O, 2) + P(mir('M102 74L124 82C126 90 120 95 113 95C105 95 101 87 102 74Z'), O, 2);
    s += P('M128 93L123 101L133 101Z', O, 2);
    s += glow(114, 86, 12, p.eye, .9) + glow(142, 86, 12, p.eye, .9) + C(114, 86, 3.6, lt(p.eye, .5), 0) + C(142, 86, 3.6, lt(p.eye, .5), 0);
    s += L('M142 44L137 54L143 60', O, 2.5);
    s += p.head || '';
    return svg(s);
  }

  /* ===================== SPIDER ===================== */
  function spider(p) {
    let s = '';
    if (p.aura) s += glow(128, 130, 128, p.aura, .5, 110);
    const legs = [
      [[104, 186], [68, 164], [56, 231]],
      [[100, 176], [44, 124], [24, 222]],
      [[100, 166], [38, 90], [14, 190]],
      [[108, 154], [62, 62], [28, 146]],
    ];
    const lp = l => { const [b, k, f] = l, sd = Math.sign(k[0] - 128); return `M${b[0]} ${b[1]}Q${(b[0] + k[0]) / 2} ${(b[1] + k[1]) / 2 - 14} ${k[0]} ${k[1]}Q${k[0] + sd * 8} ${(k[1] + f[1]) / 2} ${f[0]} ${f[1]}`; };
    const leg = l => {
      let o = tubes([[lp(l), 11], [lp(mp(l)), 11]], p.leg, p.legSh);
      o += C(l[1][0], l[1][1], 6.5, p.joint, 3) + C(256 - l[1][0], l[1][1], 6.5, p.joint, 3);
      return o;
    };
    s += leg(legs[3]) + leg(legs[2]);
    s += part(E(128, 110, 70, 58), rad([[0, lt(p.body, .3)], [.6, p.body], [1, p.body]], .35, .3, .8), p.bodySh, { off: [-10, -9], in: (p.mark || '') + `<ellipse cx="96" cy="78" rx="16" ry="9" transform="rotate(-30 96 78)" fill="#fff" opacity=".35"/>` });
    s += leg(legs[1]) + leg(legs[0]);
    // fangs
    const fang = 'M110 198C104 210 108 222 120 230C118 220 120 212 124 204Z';
    s += part(fang, p.fang, dk(p.fang, .35), { w: 3.5, off: [-2, -2] }) + part(mir(fang), p.fang, dk(p.fang, .35), { w: 3.5, off: [-2, -2] });
    s += p.drip || '';
    s += part(E(128, 170, 46, 36), p.head || p.body, dk(p.head || p.body, .35), { off: [-7, -6], in: `<ellipse cx="108" cy="146" rx="12" ry="6" transform="rotate(-25 108 146)" fill="#fff" opacity=".3"/>` });
    const g = p.eye;
    const eo = { sc: rad([[0, '#fff'], [.4, lt(g, .3)], [1, g]], .4, .35, .7), glow: g, w: 3, cut: .25 };
    s += angryEye(112, 170, 11, 12, 4, eo) + angryEye(144, 170, 11, 12, -4, eo);
    s += angryEye(98, 154, 6.5, 7, 2, { ...eo, bw: 3 }) + angryEye(158, 154, 6.5, 7, -2, { ...eo, bw: 3 });
    s += C(118, 148, 4.5, g, 2.5) + C(138, 148, 4.5, g, 2.5);
    s += p.top || '';
    return svg(s);
  }

  /* ===================== WOLF ===================== */
  function wolf(p) {
    let s = '';
    const F = p.fur, Fs = p.sh, Fd = p.dark;
    s += p.aura ? glow(128, 140, 128, p.aura, .35, 100) : '';
    // tail
    s += part(taper([206, 132, 228, 122, 238, 96, 238, 56], 34, 12), F, Fs, { in: `<path d="M244 66L230 52L226 76Z" fill="${p.tip || lt(F, .4)}"/>` });
    // far legs
    s += tubes([[pl([[194, 168], [200, 204], [203, 226]]), 18], [pl([[112, 172], [118, 206], [120, 226]]), 18]], Fd, dk(Fd, .3));
    s += part(E(207, 230, 13, 7), Fd, dk(Fd, .3), { w: 3.5, off: [-3, -3] }) + part(E(124, 230, 13, 7), Fd, dk(Fd, .3), { w: 3.5, off: [-3, -3] });
    // body
    s += part('M72 116C98 94 164 92 200 106C228 116 234 152 218 174C206 190 184 192 166 186C144 194 112 192 94 182C70 172 58 138 72 116Z', F, Fs,
      { off: [-8, -9], in: `<ellipse cx="128" cy="190" rx="54" ry="16" fill="${p.belly}"/>` + L('M150 112Q160 118 172 114M176 122Q186 128 196 124M132 120Q140 126 150 122', Fs, 3) });
    s += p.mane || '';
    // near back leg
    s += part('M156 140C162 120 196 116 212 134C224 148 220 172 204 186L200 222C200 230 194 236 186 236L172 236C166 236 164 230 168 226L178 220L180 196C164 190 152 164 156 140Z', F, Fs,
      { in: L('M182 230L182 236M190 230L190 236', O, 3) });
    // near front leg
    s += part('M70 148C86 142 102 154 100 172L94 220C94 230 88 236 80 236L64 236C58 236 56 230 60 226L72 218L70 178C64 168 62 154 70 148Z', F, Fs,
      { in: L('M74 230L74 236M84 230L84 236', O, 3) });
    // chest ruff
    s += part('M50 112C62 100 82 102 96 112C104 132 102 156 94 170L88 164L84 180L76 168L68 178L64 164L56 170L54 154L46 156C46 140 46 124 50 112Z', p.belly, dk(p.belly, .3), { off: [-5, -6] });
    s += p.chestX || '';
    s += '<g transform="translate(106 110) scale(1.16) translate(-100 -110)">';
    // ears
    s += part('M98 70L114 34L126 74Z', Fd, dk(Fd, .3), { w: 4, off: [-3, -3] });
    s += part('M58 72L66 30L94 62Z', F, Fs, { off: [-3, -3], in: `<path d="M65 64L68 42L84 60Z" fill="${p.ear}"/>` });
    // head
    s += part('M48 80C56 60 90 54 112 64C132 74 136 100 126 120L132 128L118 128L120 136L106 134C98 140 84 140 74 136C62 132 54 124 50 116Z', F, Fs,
      { off: [-6, -6], in: `<ellipse cx="72" cy="70" rx="14" ry="7" transform="rotate(-12 72 70)" fill="${lt(F, .5)}" opacity=".6"/>` });
    // jaws
    s += part('M28 112L82 110L86 126C70 138 46 136 32 124Z', '#7a1422', '#4c0a16', { w: 3.5, off: [0, 0] });
    s += P('M36 124L42 114L47 125Z', '#fff', 2.5) + P('M56 127L60 117L64 127Z', '#fff', 2.5);
    s += part('M34 124C44 136 66 142 84 132L86 124C70 130 50 130 38 122Z', p.belly, dk(p.belly, .3), { w: 3.5, off: [-2, -2] });
    s += part('M66 82C50 82 32 90 22 100C16 108 20 116 28 116L80 114C84 100 80 88 66 82Z', p.muzzle || F, dk(p.muzzle || F, .3), { off: [-4, -5] });
    s += P('M33 115L38 127L43 115Z', '#fff', 2.5) + P('M60 114L65 125L70 114Z', '#fff', 2.5);
    s += L('M40 92Q45 88 50 93M46 98Q51 94 56 99', O, 2.5);
    s += part(E(25, 103, 8, 6.5), '#2a1a22', O, { w: 3, off: [-2, -2], in: C(22, 101, 2.2, '#fff', 0) });
    // eyes
    const eo = { sc: p.eye, pr: 3.2, px: -1, cut: .15 };
    s += angryEye(101, 87, 7, 6, -3, { ...eo, bw: 5 });
    s += angryEye(74, 90, 9, 7, 4, { ...eo, bw: 6, bx: 4, by: 3, glow: p.eyeGlow });
    if (p.eyeGlow) s += glow(101, 87, 14, p.eyeGlow, .5);
    s += '</g>' + (p.top || '');
    return svg(s);
  }

  /* ===================== IMP ===================== */
  function imp(p) {
    let s = '';
    const k = p.skin, ks = p.sh;
    s += p.aura ? glow(128, 130, 126, p.aura, .45, 110) : '';
    s += p.wings || '';
    // tail
    s += part(taper([106, 204, 74, 222, 38, 210, 40, 174], 11, 6), k, ks, { off: [-3, -3] });
    s += p.tailTip || '';
    // legs
    s += tubes([[pl([[112, 196], [102, 214], [108, 228]]), 13], [pl([[144, 196], [154, 214], [148, 228]]), 13]], k, ks);
    s += part('M92 236C90 228 98 223 110 225C118 227 122 231 120 236Z', k, ks, { off: [-3, -3] }) + part(mir('M92 236C90 228 98 223 110 225C118 227 122 231 120 236Z'), k, ks, { off: [-3, -3] });
    // left arm (claw out)
    s += tubes([[pl([[100, 156], [78, 178], [66, 160]]), 12]], k, ks);
    s += P('M60 156L54 140L64 150L64 136L70 150L76 142L72 158Z', p.claw, 3);
    s += C(66, 160, 9, k, 3.5);
    // body
    s += part('M96 150C90 172 94 198 110 208C120 214 136 214 146 208C162 198 166 172 160 150C150 140 106 140 96 150Z', k, ks,
      { off: [-6, -6], in: `<ellipse cx="128" cy="186" rx="22" ry="20" fill="${p.belly}"/>` + L('M116 178Q128 182 140 178M116 190Q128 194 140 190', dk(p.belly, .25), 2.5) });
    // right arm (holding)
    s += tubes([[pl([[156, 156], [182, 154], [194, 130]]), 12]], k, ks);
    s += p.held || '';
    s += C(195, 128, 9, k, 3.5);
    // ears
    const ear = 'M84 96C66 90 50 80 36 66C40 90 58 110 84 114Z';
    s += part(ear, k, ks, { in: `<path d="M78 100C66 96 56 88 48 80C52 94 62 104 78 108Z" fill="${dk(k, .3)}"/>` }) + part(mir(ear), k, ks, { in: `<path d="${mir('M78 100C66 96 56 88 48 80C52 94 62 104 78 108Z')}" fill="${dk(k, .3)}"/>` });
    s += p.hornsBack || '';
    // head
    s += part(E(128, 98, 52, 47), rad([[0, lt(k, .3)], [.6, k], [1, k]], .35, .3, .8), ks, { off: [-8, -8] });
    s += p.horns || '';
    s += p.hair || '';
    // face
    const eo = { sc: p.eye, pr: 6, pc: p.pupil || O, slit: true, cut: .3, bw: 6, glow: p.eyeGlow };
    s += angryEye(106, 96, 15, 16, 6, { ...eo, px: 2 }) + angryEye(150, 96, 15, 16, -6, { ...eo, px: -2 });
    s += p.third || '';
    s += L('M123 110Q128 115 133 110', O, 3);
    s += part('M100 120C116 128 140 128 156 120C150 136 140 142 128 142C116 142 106 136 100 120Z', '#4a0d1e', '#300814', { w: 3.5, off: [0, 0] });
    s += P('M104 122L108 131L113 125L118 133L123 127L128 134L133 127L138 133L143 125L148 131L152 122C140 127 116 127 104 122Z', '#fff8e6', 2.2);
    s += p.heldFront || '';
    return svg(s);
  }

  /* ===================== BAT ===================== */
  const batWing = 'M112 124C100 96 82 64 58 48C42 52 24 60 8 70C20 82 22 104 16 124C30 124 38 138 40 152C54 148 68 156 76 170C88 160 102 162 112 166Z';
  const wingBones = 'M58 48L10 72M58 48L18 122M58 48L42 150M58 48L76 168';
  function bat(p) {
    let s = '';
    const W = p.wing, Ws = p.wingSh, k = p.fur, ks = p.sh;
    const wing = d => part(d, rad([[0, lt(W, .25)], [1, W]], .7, .2, .9), Ws, { off: [-6, -8] });
    s += `<g transform="translate(0 ${p.dy || 0})">`;
    s += wing(batWing) + L(wingBones, O, 6) + L(wingBones, p.bone, 2.5) + tubes([['M112 126L58 48', 5]], p.bone, dk(p.bone, .3), 3);
    s += wing(mir(batWing)) + L(mir(wingBones), O, 6) + L(mir(wingBones), p.bone, 2.5) + tubes([[mir('M112 126L58 48'), 5]], p.bone, dk(p.bone, .3), 3);
    s += P('M58 48L52 32L66 42Z', p.claw, 3) + P(mir('M58 48L52 32L66 42Z'), p.claw, 3);
    s += '<g transform="translate(128 150) scale(1.15) translate(-128 -150)">';
    // feet
    s += P('M114 176L116 194L122 184L124 196L128 178Z', p.claw, 3) + P(mir('M114 176L116 194L122 184L124 196L128 178Z'), p.claw, 3);
    // ears
    const ear = 'M104 104C94 84 94 62 102 46C116 60 124 76 124 92Z';
    s += part(ear, k, ks, { in: `<path d="M106 92C102 80 102 68 105 58C112 68 117 78 118 90Z" fill="${p.ear}"/>` }) + part(mir(ear), k, ks, { in: `<path d="${mir('M106 92C102 80 102 68 105 58C112 68 117 78 118 90Z')}" fill="${p.ear}"/>` });
    // body
    s += part(E(128, 146, 30, 36), k, ks, { off: [-6, -6], in: `<path d="M112 140L118 148L122 140L128 150L134 140L138 148L144 140L146 170C138 178 118 178 110 170Z" fill="${p.chest}"/>` });
    // head
    s += part(E(128, 112, 33, 28), rad([[0, lt(k, .3)], [.6, k], [1, k]], .35, .3, .8), ks, { off: [-6, -6] });
    s += angryEye(113, 110, 10, 10, 4, { sc: p.eye, glow: p.eye, cut: .2, bw: 5, pr: 3.5, px: 2, slit: true });
    s += angryEye(143, 110, 10, 10, -4, { sc: p.eye, glow: p.eye, cut: .2, bw: 5, pr: 3.5, px: -2, slit: true });
    s += part('M114 124C122 130 134 130 142 124C138 136 118 136 114 124Z', '#4a0d1e', '#300814', { w: 3, off: [0, 0] });
    s += P('M117 126L120 138L124 128Z', '#fff', 2.2) + P('M132 128L136 138L139 126Z', '#fff', 2.2);
    s += part('M122 118C124 113 132 113 134 118C132 123 124 123 122 118Z', p.nose, dk(p.nose, .3), { w: 2.5, off: [-1, -1] });
    s += '</g></g>';
    return svg(s);
  }

  /* ===================== FLOATING EYE ===================== */
  function eyeBeast(p) {
    let s = '';
    const F = p.flesh, Fs = p.sh;
    s += p.aura ? glow(128, 120, 128, p.aura, .55, 112) + (p.stars || '') : '';
    const T = [[96, 150, 80, 176, 62, 190, 66, 212], [112, 162, 108, 188, 94, 202, 102, 220], [128, 166, 130, 192, 142, 202, 134, 222], [144, 162, 150, 190, 166, 198, 158, 218], [160, 150, 178, 174, 194, 188, 190, 210]];
    s += T.map(b => part(taper(b, 18, 3), p.tent || F, dk(p.tent || F, .35), { off: [-3, -3], w: 3.5 })).join('');
    // side fins
    const fin = 'M62 90C46 78 30 76 16 82C26 92 26 102 22 112C34 108 42 112 46 122C50 112 56 104 62 100Z';
    s += part(fin, p.fin, dk(p.fin, .3), { off: [-3, -3] }) + part(mir(fin), p.fin, dk(p.fin, .3), { off: [-3, -3] });
    // sphere
    s += part(E(128, 104, 72, 70), rad([[0, lt(F, .35)], [.55, F], [1, F]], .35, .28, .8), Fs, { off: [-10, -10], in: (p.spots || '') });
    // sclera
    const veins = 'M82 112Q92 110 98 120M86 96Q94 98 98 104M172 108Q162 108 158 118M168 126Q160 122 154 128M110 146Q114 140 112 134M146 146Q142 140 144 134';
    s += part(E(128, 108, 50, 46), rad([[0, '#fffdf4'], [.7, p.sclera], [1, dk(p.sclera, .15)]], .45, .4, .6), dk(p.sclera, .25),
      { off: [-6, -6], in: L(veins, p.vein, 2) + glow(128, 112, 36, p.iris, .55) });
    s += part(E(128, 112, 25, 27), rad([[0, lt(p.iris, .55)], [.55, p.iris], [1, dk(p.iris, .35)]], .5, .5, .55), dk(p.iris, .45), { w: 3.5, off: [-3, -3] });
    s += `<ellipse cx="128" cy="112" rx="6" ry="19" fill="${O}"/><circle cx="118" cy="100" r="6" fill="#fff"/><circle cx="138" cy="122" r="2.5" fill="#fff"/>`;
    // upper lid (frown)
    s += part('M70 96C80 60 176 60 186 96C172 88 150 88 128 100C106 88 84 88 70 96Z', F, Fs, { off: [-4, -4] });
    s += p.top || '';
    return svg(s);
  }

  /* ===================== GHOST ===================== */
  function ghost(p) {
    let s = '';
    const B = p.body;
    s += glow(128, 120, 124, p.glow, .45, 110);
    const fill = lin([[0, lt(B, .35), .92], [.55, B, .78], [1, B, .25]], 0, 0, .3, 1);
    const stroke = lin([[0, O, .9], [.6, O, .7], [1, O, .1]], 0, 0, 0, 1);
    const body = 'M74 98C70 60 96 36 128 36C162 36 186 62 182 100C180 126 182 150 192 166C202 182 220 188 238 182C230 204 204 216 180 210C172 220 158 222 148 214C136 222 118 220 110 210C98 214 86 206 84 194C94 190 96 178 92 166C82 146 76 124 74 98Z';
    // arms behind body edges
    const armL = taper([98, 128, 72, 120, 50, 128, 30, 146], 38, 12, 8);
    const armR = taper([160, 124, 188, 120, 206, 104, 220, 80], 36, 12, 8);
    s += part(armL, fill, p.sh, { op: .9, stroke, off: [-4, -4] }) + part(armR, fill, p.sh, { op: .9, stroke, off: [-4, -4] });
    s += L('M30 148L18 146M30 148L20 156M32 150L26 162', O, 6) + L('M30 148L18 146M30 148L20 156M32 150L26 162', lt(B, .5), 2.5);
    s += L('M222 76L232 66M222 78L236 74M220 80L232 84', O, 6) + L('M222 76L232 66M222 78L236 74M220 80L232 84', lt(B, .5), 2.5);
    s += part(body, fill, p.sh, { op: .85, stroke, off: [-8, -8], in: `<ellipse cx="104" cy="70" rx="16" ry="9" transform="rotate(-30 104 70)" fill="#fff" opacity=".5"/>` + L('M118 160Q124 186 116 204M150 150Q160 176 158 200', lt(B, .4), 4, ' opacity=".5"') });
    // face
    const sock = 'M94 84L124 96C126 108 118 114 109 114C98 114 92 104 94 84Z';
    s += P(sock, '#1a2450', 3) + P(mir(sock), '#1a2450', 3);
    s += glow(110, 102, 16, p.eye, .9) + glow(146, 102, 16, p.eye, .9) + C(110, 102, 5, '#fff', 0) + C(146, 102, 5, '#fff', 0);
    s += P('M116 126C116 118 140 118 140 126C142 140 136 152 128 152C120 152 114 140 116 126Z', '#1a2450', 3);
    s += [spark(54, 70, 7, '#fff', .8), spark(206, 150, 6, '#fff', .7), spark(40, 196, 5, lt(B, .5), .8)].join('');
    return svg(s);
  }

  /* ===================== SCORPION ===================== */
  function scorpion(p) {
    const A = p.base, As = p.sh, D = p.dark;
    let s = '';
    const legs = [[[98, 200], [64, 190], [54, 234]], [[92, 192], [44, 174], [24, 218]], [[94, 184], [50, 152], [16, 186]]];
    const leg = q => P(seg(q[0], q[1], 15, 11), A, 3.5) + P(seg(q[1], q[2], 11, 3), As, 3.5) + C(q[1][0], q[1][1], 5.5, D, 3);
    s += leg(legs[2]) + leg(mp(legs[2])) + leg(legs[1]) + leg(mp(legs[1]));
    // tail
    const tb = [128, 190, 128, 146, 172, 136, 172, 98, 172, 62, 152, 38, 126, 38];
    s += part(taper(tb, 40, 24, 14), A, As, { off: [-6, -5], in: rings(tb, [.16, .32, .46, .6, .73, .86], 40, 24, As, 3.5, 5) });
    s += part('M112 26C126 22 136 34 132 46C128 58 112 60 104 54Z', A, As, { off: [-3, -3] });
    s += part('M106 32C94 32 84 44 86 56C88 68 102 70 110 62C116 56 116 44 106 32Z', p.sting, dk(p.sting, .3), { off: [-3, -3] });
    s += part('M88 54C80 62 78 74 82 86C88 78 94 72 100 66Z', D, dk(D, .4), { w: 3.5, off: [-2, -2] });
    s += P('M82 90C78 96 78 100 82 100C86 100 86 96 82 90Z', p.venom, 2.5);
    // pincer arms + claws
    const claw = 'M-14 6C-34 -6 -38 -42 -28 -64C-20 -82 -2 -94 16 -88C10 -82 6 -74 3 -64C12 -68 22 -72 32 -68C34 -44 28 -16 14 6Z';
    const pincer = (sx) => {
      const T = sx > 0 ? rot(-8, 52, 128) : rot(8, 204, 128, -1);
      const arm = sx > 0 ? [[96, 178], [66, 164], [54, 134]] : mp([[96, 178], [66, 164], [54, 134]]);
      return part(seg(arm[0], arm[1], 22, 18), A, As, { off: [-3, -3] }) + part(seg(arm[1], arm[2], 18, 16), A, As, { off: [-3, -3] }) + C(arm[1][0], arm[1][1], 7, D, 3) +
        part(tf(claw, T), rad([[0, p.hi], [1, A]], .3, .45, .7), As, { off: [-5, -4], in: `<path d="${tf('M4 -96L22 -90L8 -78Z', T)}" fill="${D}"/><path d="${tf('M24 -76L40 -70L28 -62Z', T)}" fill="${D}"/>` }) +
        L(tf('M3 -64Q8 -50 26 -44', T), O, 3) + L(tf('M-18 -24Q-4 -16 12 -24', T), As, 3);
    };
    s += pincer(1) + pincer(-1);
    // body
    s += part('M68 190C68 164 96 152 128 152C160 152 188 164 188 190C188 210 162 220 128 220C94 220 68 210 68 190Z', rad([[0, p.hi], [.6, A], [1, A]], .38, .3, .75), As,
      { off: [-8, -8], in: L('M78 176Q128 160 178 176M72 198Q128 188 184 198', As, 3.5) });
    s += leg(legs[0]) + leg(mp(legs[0]));
    const mand = 'M114 212C106 218 106 230 116 236C114 228 118 222 124 218Z';
    s += part(mand, D, dk(D, .4), { w: 3.5, off: [-2, -2] }) + part(mir(mand), D, dk(D, .4), { w: 3.5, off: [-2, -2] });
    const eo = { sc: rad([[0, '#fff'], [.35, p.eye], [1, dk(p.eye, .3)]], .4, .35, .7), glow: p.eye, cut: .2, bw: 5, w: 3.5 };
    s += angryEye(110, 186, 11, 10, 4, eo) + angryEye(146, 186, 11, 10, -4, eo);
    s += C(96, 174, 4, p.eye, 2.5) + C(160, 174, 4, p.eye, 2.5);
    return svg(s);
  }

  /* ===================== MUMMY / PHARAOH ===================== */
  function mummy(p) {
    const B = p.wrap, Bs = p.sh, Ln = p.line;
    const K = !!p.king;
    let s = '';
    if (p.aura) s += glow(128, 124, 128, p.aura, .5, 116);
    if (K) s += `<circle cx="128" cy="92" r="84" fill="${rad([[0, '#fff2b0', .7], [.75, '#ffd04a', .35], [1, '#ffd04a', 0]])}"/><circle cx="128" cy="94" r="70" fill="none" stroke="#ffd04a" stroke-width="5" opacity=".7"/>` +
      L(Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8, c = Math.cos(a), si = Math.sin(a); return `M${Math.round(128 + c * 76)} ${Math.round(94 + si * 76)}L${Math.round(128 + c * 88)} ${Math.round(94 + si * 88)}`; }).join(''), '#ffe27a', 4, ' opacity=".75"');
    s += K ? '<g transform="translate(128 236) scale(1.08) translate(-128 -236)">' : '<g transform="translate(24 0)">';
    // trailing bandage

    if (K) s += tubes([['M50 228L50 52', 7]], '#f0c040', '#a8741a') + C(50, 48, 14, rad([[0, '#bff4ff'], [.6, '#2a8ad8'], [1, '#1a4a9a']], .4, .35, .7), 4) +
      P('M30 40C32 54 40 62 50 64C60 62 68 54 70 40C66 50 58 56 50 56C42 56 34 50 30 40Z', '#f0c040', 3.5) + spark(44, 42, 4, '#fff');
    // far arm
    if (K) {
      s += glow(204, 70, 34, '#7affd8', .7);
      s += part('M148 112L192 82L202 92L160 132Z', B, Bs, { off: [-3, -3], in: L('M162 104L172 120M174 96L184 110M186 88L194 98', Ln, 2.5) });
      s += part('M190 70C192 60 202 58 208 64L214 78C214 88 206 94 198 92C190 90 188 80 190 70Z', B, Bs, { w: 3.5, off: [-2, -2] }) + L('M196 66L192 56M202 64L202 52M208 66L212 56', O, 7) + L('M196 66L192 56M202 64L202 52M208 66L212 56', B, 3);
    } else {
      s += part('M146 112L62 104C52 104 48 114 54 122L142 134Z', dk(B, .1), Bs, { off: [-3, -3], in: L('M70 104L74 126M88 106L92 128M106 108L110 130M124 110L126 132', Ln, 2.5) });
      s += part('M58 104C46 102 38 108 38 116C40 126 50 130 58 126Z', dk(B, .1), Bs, { w: 3.5, off: [-2, -2] }) + L('M44 122L38 134M50 126L46 138M56 126L56 136', O, 7) + L('M44 122L38 134M50 126L46 138M56 126L56 136', dk(B, .1), 3);
    }
    // legs
    s += part('M132 184L136 226C136 232 140 236 146 236L164 236C168 236 168 230 164 228L158 222L156 186Z', dk(B, .08), Bs, { off: [-3, -3], in: L('M134 198L158 194M134 212L160 208M136 224L160 222', Ln, 2.5) });
    s += part('M98 184L92 226C92 232 96 236 102 236L124 236C128 236 128 230 124 228L120 224L124 186Z', B, Bs, { off: [-3, -3], in: L('M96 198L124 194M94 212L122 208M92 224L120 222', Ln, 2.5) });
    // torso
    s += part('M96 116C88 140 90 170 96 192L158 192C164 170 166 140 158 116C146 104 110 104 96 116Z', B, Bs,
      { off: [-6, -6], in: L('M88 132Q128 122 168 136M88 150Q128 142 168 154M90 168Q128 160 166 172M92 186Q128 178 164 190', Ln, 3) + L('M120 150L118 168M140 132L138 152', '#4a3a30', 4) });
    if (K) {
      s += part('M88 172L168 172L168 186L88 186Z', '#f0c040', '#a8741a', { w: 3.5, off: [-2, -2] });
      s += part('M108 186L148 186L142 222L114 222Z', '#f0c040', '#a8741a', { w: 3.5, off: [-2, -2], in: L('M108 194L148 194M110 204L146 204M112 214L144 214', '#2a6ad8', 4) });
      s += part('M88 118C96 142 160 142 168 118C168 136 152 156 128 156C104 156 88 136 88 118Z', '#f0c040', '#a8741a', { off: [-2, -3], in: L('M90 126C100 142 156 142 166 126', '#2a6ad8', 5) + L('M92 136C104 150 152 150 164 136', '#3ad8c8', 4) });
    }
    // near arm
    if (K) {
      s += part('M104 122L56 140C48 144 50 156 58 156L110 146Z', B, Bs, { off: [-3, -3], in: L('M66 136L70 154M80 130L84 150M94 126L98 146', Ln, 2.5) });
      s += part(E(52, 148, 11, 12), B, Bs, { w: 3.5, off: [-2, -2] }) + L('M44 144L58 142M44 152L58 150', Ln, 2.5);
    } else {
      s += part('M122 124L46 128C36 130 36 144 46 146L124 150Z', B, Bs, { off: [-3, -3], in: L('M56 126L60 148M72 126L76 148M88 126L92 148M104 126L108 150', Ln, 2.5) });
      s += part('M44 124C32 124 26 132 28 140C30 148 40 150 48 146Z', B, Bs, { w: 3.5, off: [-2, -2] }) + L('M32 144L26 156M38 148L34 160M44 148L44 158', O, 7) + L('M32 144L26 156M38 148L34 160M44 148L44 158', B, 3);
      s += part('M74 146L70 178L78 170L82 184L84 146Z', B, Bs, { w: 3, off: [-2, -2] });
    }
    // head
    s += part('M84 84C82 56 98 38 122 38C146 38 162 54 162 80C162 104 148 122 124 122C100 122 86 108 84 84Z', B, Bs,
      { off: [-6, -6], in: L('M84 60Q124 48 164 62M82 104Q124 96 164 106M90 118Q124 112 158 118', Ln, 3) + L('M140 46L134 62', '#4a3a30', 4) });
    s += P('M86 74C102 70 136 70 156 76L156 96C136 92 104 92 88 96Z', '#3a2c26', 3.5);
    const eo = { sc: rad([[0, '#fff'], [.35, p.eye], [1, dk(p.eye, .2)]], .45, .4, .7), glow: p.eye, cut: .2, bw: 4.5, w: 3 };
    s += angryEye(106, 85, 9, 7, 3, eo) + angryEye(136, 85, 9, 7, -3, eo);
    if (!K) {
      s += part('M120 70C130 72 140 78 146 92L138 98C134 88 128 82 118 80Z', B, Bs, { w: 3, off: [-2, -2] });
      s += P('M108 106C116 112 130 112 138 106L136 114C128 118 118 118 110 114Z', '#3a2c26', 3);
    } else {
      // nemes headdress
      const lap = 'M86 74L70 142C78 148 90 148 96 142L100 92Z';
      const st = L('M60 96L110 96M60 108L110 108M60 120L110 120M60 132L110 132', '#2a6ad8', 5);
      s += part(lap, '#f0c040', '#a8741a', { off: [-3, -3], in: st }) + part(mir(lap).replace(/(\d+(\.\d+)?)/g, v => v), '#f0c040', '#a8741a', { off: [-3, -3], in: L(mir('M60 96L110 96M60 108L110 108M60 120L110 120M60 132L110 132'), '#2a6ad8', 5) });
      s += part('M80 76C78 44 98 26 124 26C150 26 170 44 168 76C152 68 98 68 80 76Z', '#f0c040', '#a8741a', { off: [-4, -4], in: L('M96 70L102 30M112 68L114 26M128 68L128 26M144 68L142 28M158 72L154 36', '#2a6ad8', 5) });
      s += part('M82 74C100 66 148 66 166 74L166 82C148 74 100 74 82 82Z', '#f0c040', '#a8741a', { w: 3.5, off: [-2, -2] });
      s += part('M118 70C114 58 122 50 130 54C136 58 134 68 128 72Z', '#f0c040', '#a8741a', { w: 3, off: [-2, -2] }) + C(125, 62, 3, '#e83a3a', 2);
      s += P('M108 106C116 112 130 112 138 106L136 114C128 118 118 118 110 114Z', '#3a2c26', 3);
      s += part('M114 120L134 120L132 146L116 146Z', '#f0c040', '#a8741a', { w: 3.5, off: [-2, -2], in: L('M112 128L136 128M112 136L136 136', '#2a6ad8', 3.5) });
      s += spark(200, 30, 7, '#fff6c0') + spark(222, 120, 5, '#fff6c0') + spark(30, 200, 5, '#fff6c0');
    }
    s += '</g>';
    return svg(s);
  }

  /* ===================== GARGOYLE ===================== */
  function gargoyle(p) {
    const S = p.stone, Ss = p.sh;
    let s = `<g transform="translate(128 130) scale(1.02) translate(-128 ${-130 + (p.dy || 0)})">`;
    const wing = tf(batWing, [1, 0, 0, 1, 0, -6]);
    const bones = tf(wingBones, [1, 0, 0, 1, 0, -6]);
    s += part(wing, rad([[0, lt(p.wing, .2)], [1, p.wing]], .7, .2, .9), dk(p.wing, .35), { off: [-6, -8], in: L('M30 110L40 118M60 120L66 134', dk(p.wing, .3), 2.5) }) + L(bones, O, 6) + L(bones, S, 2.5);
    s += part(mir(wing), rad([[0, lt(p.wing, .2)], [1, p.wing]], .3, .2, .9), dk(p.wing, .35), { off: [-6, -8], in: L(mir('M30 110L40 118M60 120L66 134'), dk(p.wing, .3), 2.5) }) + L(mir(bones), O, 6) + L(mir(bones), S, 2.5);
    s += tubes([['M112 120L58 42', 6], [mir('M112 120L58 42'), 6]], S, Ss, 3.5);
    s += P('M58 42L50 24L66 36Z', S, 3) + P(mir('M58 42L50 24L66 36Z'), S, 3);
    // tail
    const tb = [140, 186, 168, 214, 198, 214, 210, 188];
    s += part(taper(tb, 12, 6), S, Ss, { off: [-2, -2] }) + part('M210 192L202 180L212 166L222 180Z', S, Ss, { w: 3.5, off: [-2, -2] });
    // legs (crouched)
    const leg = 'M100 166C84 172 82 192 94 200L92 210L114 210L114 196C122 186 118 170 110 166Z';
    s += part(leg, S, Ss, { off: [-4, -4] }) + part(mir(leg), S, Ss, { off: [-4, -4] });
    s += P('M90 210L88 220L96 212L98 222L104 212L108 220L112 210Z', p.claw, 3) + P(mir('M90 210L88 220L96 212L98 222L104 212L108 220L112 210Z'), p.claw, 3);
    // torso
    s += part('M100 126C92 148 96 172 110 184C120 190 136 190 146 184C160 172 164 148 156 126C146 116 110 116 100 126Z', S, Ss,
      { off: [-6, -6], in: L('M112 140Q128 146 144 140M114 156Q128 162 142 156M116 170Q128 174 140 170', Ss, 3) + L('M104 150L110 158L106 166', O, 2) + `<ellipse cx="146" cy="134" rx="8" ry="5" fill="${p.moss}"/>` });
    // arms
    const arm = [[102, 132], [80, 150], [80, 172]];
    s += tubes([[pl(arm), 13], [pl(mp(arm)), 13]], S, Ss);
    const claw = 'M70 172L66 186L76 178L78 190L84 178L90 186L90 172Z';
    s += P(claw, p.claw, 3) + P(mir(claw), p.claw, 3) + C(80, 172, 9, S, 3.5) + C(176, 172, 9, S, 3.5);
    // ears + horns
    const ear = 'M100 96C86 90 76 82 66 70C70 88 80 102 100 108Z';
    s += part(ear, S, Ss, { off: [-3, -3] }) + part(mir(ear), S, Ss, { off: [-3, -3] });
    const horn = 'M108 76C100 66 98 54 104 42C108 52 116 60 122 66Z';
    s += part(horn, p.horn, dk(p.horn, .35), { w: 3.5, off: [-2, -2] }) + part(mir(horn), p.horn, dk(p.horn, .35), { w: 3.5, off: [-2, -2] });
    // head
    s += part('M96 98C94 76 108 62 128 62C148 62 162 76 160 98C160 116 148 130 128 130C108 130 96 116 96 98Z', rad([[0, lt(S, .25)], [.6, S], [1, S]], .35, .3, .8), Ss,
      { off: [-6, -6], in: L('M140 66L136 76L142 80', O, 2) + `<ellipse cx="106" cy="72" rx="7" ry="4" fill="${p.moss}"/>` });
    s += L('M100 88L124 96M156 88L132 96', O, 7);
    s += angryEye(112, 98, 7, 6, 3, { sc: '#fff2a0', glow: p.eye, cut: .1, bw: 0 }) + angryEye(144, 98, 7, 6, -3, { sc: '#fff2a0', glow: p.eye, cut: .1, bw: 0 });
    s += part('M116 104C120 100 136 100 140 104C140 112 116 112 116 104Z', S, Ss, { w: 3, off: [-2, -2] }) + C(123, 107, 1.8, O, 0) + C(133, 107, 1.8, O, 0);
    s += P('M106 116C116 124 140 124 150 116C146 128 110 128 106 116Z', '#2a1a22', 3);
    s += P('M112 120L114 110L118 122Z', '#efe8d8', 2) + P('M144 120L142 110L138 122Z', '#efe8d8', 2);
    s += '</g>';
    return svg(s);
  }

  /* ===================== GOLEM ===================== */
  function golem(p) {
    const S = p.stone, Ss = p.sh;
    let s = '';
    if (p.aura) s += glow(128, 136, 128, p.aura, .5, 112);
    s += p.boss ? `<g transform="translate(128 236) scale(${p.boss}) translate(-128 -236)">` : '';
    s += p.back || '';
    const fill = rad([[0, p.hi], [.6, S], [1, S]], .35, .3, .8);
    // legs
    s += part('M90 180L84 236L124 236L122 180Z', S, Ss, { off: [-4, -4], in: p.legIn || '' }) + part('M134 180L132 236L172 236L166 180Z', S, Ss, { off: [-4, -4], in: p.legIn2 || '' });
    // torso
    s += part('M70 96L100 70L156 70L186 96L192 150L168 194L88 194L64 150Z', fill, Ss, { off: [-9, -9], in: L('M100 70L112 104L96 140L88 194M156 70L146 110L162 150L168 194M112 104L146 110M96 140L128 150L162 150', Ss, 3) + (p.torsoIn || '') });
    s += p.core || '';
    // arms + fists
    const arm = 'M40 112L84 114L82 166L70 178L36 174L28 134Z', fist = 'M20 178L74 172L80 208L62 220L26 216L16 196Z';
    s += part(arm, S, Ss, { off: [-5, -5], in: p.armIn || '' }) + part(mir(arm), S, Ss, { off: [-5, -5], in: flipX(p.armIn) });
    s += part(fist, fill, Ss, { off: [-5, -5], in: L('M38 190L40 214M54 188L56 216', Ss, 3) + (p.fistIn || '') }) + part(mir(fist), S, Ss, { off: [-5, -5], in: L(mir('M38 190L40 214M54 188L56 216'), Ss, 3) + flipX(p.fistIn) });
    s += p.mid || '';
    // shoulders
    const sh = 'M36 112C30 88 48 68 74 70C94 72 104 88 100 106C94 124 50 128 36 112Z';
    s += part(sh, fill, Ss, { off: [-6, -6], in: p.shIn || '' }) + part(mir(sh), S, Ss, { off: [-6, -6], in: flipX(p.shIn) });
    // head
    s += part('M104 42L152 42L160 62L152 86L104 86L96 62Z', fill, Ss, { off: [-5, -5], in: p.headIn || '' });
    s += L('M100 56L126 64M156 56L130 64', O, 6);
    const ey = 'M106 62L124 67L122 74L108 72Z';
    s += glow(115, 68, 18, p.eye, .9) + glow(141, 68, 18, p.eye, .9) + P(ey, lt(p.eye, .55), 3) + P(mir(ey), lt(p.eye, .55), 3);
    s += P('M114 78L142 78', O, 4);
    s += p.top || '';
    s += p.boss ? '</g>' : '';
    s += p.fx || '';
    return svg(s);
  }

  /* ===================== LICH ===================== */
  function lich(p) {
    const G = p.glow, R = p.robe, Rs = dk(p.robe, .4), Bn = '#ece4cc', Bns = '#a89c80', Au = '#d8b04a';
    let s = glow(128, 120, 128, G, .45, 118);
    // staff
    s += tubes([['M206 228L206 50', 8]], '#5a4a5a', '#3a2c3a');
    s += P('M206 58C190 52 186 36 194 24C196 34 200 40 206 42C212 40 216 34 218 24C226 36 222 52 206 58Z', Au, 3.5);
    s += glow(206, 30, 26, G, .8) + part('M206 8L216 28L206 46L196 28Z', lt(G, .4), dk(G, .4), { off: [-3, -3], w: 3.5 });
    // collar behind head
    s += part('M80 116L70 56L98 82L108 44L128 70L148 44L158 82L186 56L176 116Z', R, Rs, { off: [-4, -4], in: L('M74 62L98 86L108 50L128 74L148 50L158 86L182 62', Au, 3) });
    // wisps under hem
    s += `<path d="M70 210C66 226 80 236 92 232C86 226 88 218 96 214M150 216C152 230 170 238 182 228C174 226 172 220 176 212" fill="none" stroke="${G}" stroke-width="7" opacity=".55"/>`;
    // robe
    s += part('M98 106C82 130 68 180 54 226L70 216L80 232L96 220L110 234L124 222L138 234L152 222L166 234L180 220L190 230L204 218C190 180 176 130 158 106C146 98 110 98 98 106Z',
      lin([[0, lt(R, .15)], [1, dk(R, .2)]], 0, 0, 0, 1), Rs, { off: [-8, -6], in: L('M110 108L100 224M146 108L156 224', Au, 4) + `<path d="M104 140L96 224L160 224L152 140Z" fill="${dk(R, .2)}" opacity=".5"/>` });
    s += part('M112 106L128 150L144 106Z', '#1a1020', O, { off: [0, 0], w: 3.5, in: L('M118 116Q128 120 138 116M121 126Q128 129 135 126M124 136Q128 138 132 136', Bn, 3.5) });
    s += part('M100 168L156 168L158 180L98 180Z', dk(R, .25), Rs, { w: 3.5, off: [-2, -2] }) + C(128, 174, 7, G, 3);
    // left sleeve raised with orb
    s += part('M100 112C84 110 70 112 60 120L46 150L80 150L76 138C86 134 96 134 106 136Z', R, Rs, { off: [-4, -4], in: L('M46 148L80 148', Au, 4) });
    s += tubes([['M62 140L60 118', 7]], Bn, Bns, 3.5);
    s += glow(58, 92, 46, G, .8);
    s += part(E(58, 92, 20), rad([[0, '#ffffff'], [.35, lt(G, .4)], [.8, G], [1, dk(G, .3)]], .4, .35, .6), dk(G, .4), { off: [-3, -3], in: L('M44 96Q56 80 72 88M48 104Q60 96 70 104', '#ffffff', 2.5, ' opacity=".7"') });
    s += P('M48 112L46 100L54 110L56 98L62 110L66 100L68 114C62 120 52 120 48 112Z', Bn, 3);
    // right sleeve to staff
    s += part('M156 112C174 114 190 124 198 138L200 160L172 154L176 144C168 140 160 138 150 140Z', R, Rs, { off: [-4, -4], in: L('M172 154L200 160', Au, 4) });
    s += P('M196 132L212 132C216 136 216 150 212 154L196 154C192 150 192 136 196 132Z', Bn, 3.5) + L('M196 140L212 140M196 147L212 147', O, 2);
    // skull
    s += part('M108 102L148 102L146 122C138 130 118 130 110 122Z', Bn, Bns, { off: [-2, -2], w: 3.5 });
    s += L('M112 112L144 112', O, 3) + [119, 128, 137].map(x => L(`M${x} 104L${x} 120`, O, 2)).join('');
    s += part('M96 74C96 48 110 36 128 36C146 36 160 48 160 74C160 88 154 96 150 100L150 108L106 108L106 100C102 96 96 88 96 74Z', Bn, Bns, { off: [-6, -6] });
    const sock = 'M104 72L124 80C126 88 120 94 113 94C106 94 102 86 104 72Z';
    s += P(sock, O, 2) + P(mir(sock), O, 2) + P('M128 92L123 100L133 100Z', O, 2);
    s += glow(114, 84, 16, G, 1) + glow(142, 84, 16, G, 1) + C(114, 84, 4, '#eaffea', 0) + C(142, 84, 4, '#eaffea', 0);
    // crown
    s += part('M96 62L92 30L106 44L114 18L128 38L142 18L150 44L164 30L160 62C142 54 114 54 96 62Z', lin([[0, '#ffe27a'], [1, Au]]), '#8a6a1a', { off: [-3, -3], in: L('M96 56C114 48 142 48 160 56', '#8a6a1a', 3) });
    s += C(128, 48, 5, G, 3) + C(108, 52, 3.5, G, 2.5) + C(148, 52, 3.5, G, 2.5);
    s += spark(30, 50, 6, lt(G, .5)) + spark(232, 120, 5, lt(G, .5)) + spark(24, 190, 4, '#fff') + spark(168, 22, 4, '#fff');
    return svg(s);
  }

  /* ===================== SWAMP SERPENT ===================== */
  function serpent(p) {
    const G = p.skin, Gs = p.sh, Bl = p.belly, F = p.fin;
    let s = glow(128, 120, 128, p.aura, .35, 112);
    const water = 'M6 222C30 208 226 208 250 222C252 234 234 242 128 242C22 242 4 234 6 222Z';
    s += part(water, lin([[0, '#4f7a62'], [1, '#2a4436']]), '#22382c', { off: [0, -3], in: L('M30 226Q60 220 90 226M150 230Q180 224 214 230', '#7fb08a', 3) });
    // back hump
    const hb = [36, 230, 28, 172, 94, 166, 98, 230];
    s += P(spikes(hb, [.22, .36, .5, .64, .78], 34, 34, 14, -1), F, 3.5);
    s += part(taper(hb, 34, 30, 14), G, Gs, { off: [-5, -5], in: rings(hb, [.2, .32, .44, .56, .68, .8], 34, 30, Gs, 3) });
    // main body
    const b = [176, 224, 214, 188, 204, 148, 158, 144, 114, 140, 72, 128, 84, 96];
    s += P(spikes(b, [.08, .18, .28, .4, .52, .64, .76, .88], 50, 38, 18, -1), F, 3.5);
    s += part(taper(b, 50, 38, 16), rad([[0, p.hi], [.6, G], [1, G]], .4, .3, .8), Gs, { off: [-7, -7], in: L('M150 210Q160 196 150 186M120 160Q130 154 140 160', Gs, 3) });
    const bb = [168, 226, 198, 192, 190, 160, 154, 158, 118, 156, 90, 142, 96, 110];
    s += part(taper(bb, 22, 16, 16), Bl, dk(Bl, .3), { w: 3, off: [-3, -3], in: rings(bb, [.08, .16, .24, .32, .4, .48, .56, .64, .72, .8, .88], 22, 16, dk(Bl, .35), 2.5, 2) });
    // head
    s += part('M150 66L194 50L182 68L204 72L184 84L196 98L158 92Z', F, dk(F, .35), { off: [-3, -3], w: 3.5, in: L('M156 72L190 56M158 80L198 76M158 88L190 96', dk(F, .4), 2.5) });
    s += part('M136 42C148 26 166 16 190 16C176 26 164 36 156 52Z', p.horn, dk(p.horn, .35), { off: [-3, -3], w: 3.5 });
    s += part('M120 38C122 22 134 10 152 8C144 18 140 28 140 42Z', p.horn, dk(p.horn, .35), { off: [-3, -3], w: 3.5 });
    s += part('M168 72C170 52 156 34 134 32C116 30 100 38 88 46C74 50 56 52 42 58C34 62 34 74 42 78L112 84C122 94 140 98 152 92C162 88 168 80 168 72Z',
      rad([[0, p.hi], [.6, G], [1, G]], .4, .3, .8), Gs, { off: [-6, -6], in: `<ellipse cx="66" cy="60" rx="16" ry="4" transform="rotate(-8 66 60)" fill="${p.hi}" opacity=".8"/>` + L('M118 42Q128 38 140 40', Gs, 3) });
    s += P('M44 78L112 84L116 96L54 102Z', '#6a1420', 3.5);
    s += [50, 68, 86, 100].map((x, i) => P(`M${x} ${78 + i * 1.5}L${x + 4} ${90 + i * 1.2 - (i > 1 ? 3 : 0)}L${x + 8} ${79 + i * 1.5}Z`, '#fff', 2.2)).join('');
    s += L('M86 94C66 98 50 92 32 100', O, 8) + L('M86 94C66 98 50 92 32 100', '#e04a6a', 4) + L('M32 100L22 94M32 100L24 108', O, 7) + L('M32 100L22 94M32 100L24 108', '#e04a6a', 3);
    s += part('M50 100C70 100 94 98 118 92L124 100C114 114 84 120 60 114C50 110 46 104 50 100Z', Bl, dk(Bl, .3), { w: 3.5, off: [-2, -3] });
    s += [62, 80, 98].map(x => P(`M${x} 101L${x + 4} 91L${x + 8} 100Z`, '#fff', 2.2)).join('');
    s += L('M46 64Q50 60 56 63', O, 3.5);
    s += angryEye(118, 58, 13, 10, 5, { sc: rad([[0, '#fff'], [.4, p.eye], [1, dk(p.eye, .2)]], .4, .4, .7), glow: p.eye, pr: 4.8, px: -2, slit: true, cut: .25, bw: 6, bx: 6, by: 2 });
    s += part('M4 228C30 220 226 220 252 228C252 238 232 244 128 244C24 244 4 238 4 228Z', lin([[0, '#5a8a6e'], [1, '#2a4436']]), '#22382c', { off: [0, -3], w: 3.5, in: L('M40 234Q70 230 96 234M160 236Q190 232 220 236', '#8fc09a', 3) });
    // front ripples + splashes
    s += L('M144 228C150 218 196 218 206 228M18 228C24 220 48 218 56 224M78 224C86 218 104 220 108 228', '#d8f4dc', 4);
    s += P('M206 218C210 208 218 206 220 214C220 220 212 222 206 218Z', '#bfe6c8', 2.5) + P('M140 222C136 214 140 208 146 212C148 218 146 222 140 222Z', '#bfe6c8', 2.5) + C(226, 200, 3, '#bfe6c8', 2) + C(30, 206, 3.5, '#bfe6c8', 2);
    return svg(s);
  }

  /* ===================== DRAGON ===================== */
  function dragon(p) {
    const G = p.skin, Gs = p.sh, Bl = p.belly, W = p.wing, H = p.horn;
    let s = glow(128, 120, 128, p.aura, .5, 116) + (p.fxBack || '');
    const wing = 'M100 122C88 90 68 58 44 34L12 22Q26 56 10 90Q28 100 26 126Q44 128 52 148Q70 146 82 164Q90 156 100 160Z';
    const wb = 'M44 34L10 90M44 34L26 126M44 34L52 148M44 34L82 164';
    s += part(wing, rad([[0, lt(W, .25)], [1, W]], .7, .2, .9), dk(W, .35), { off: [-6, -7] }) + L(wb, O, 6) + L(wb, Gs, 2.5);
    s += part(mir(wing), rad([[0, lt(W, .25)], [1, W]], .3, .2, .9), dk(W, .35), { off: [-6, -7] }) + L(mir(wb), O, 6) + L(mir(wb), Gs, 2.5);
    s += tubes([['M100 122L44 34L12 22', 7], [mir('M100 122L44 34L12 22'), 7]], G, Gs, 4);
    s += P('M44 34L40 16L54 28Z', H, 3) + P(mir('M44 34L40 16L54 28Z'), H, 3);
    // tail
    const tb = [158, 212, 196, 238, 236, 228, 232, 190];
    s += P(spikes(tb, [.3, .5, .7], 26, 10, 10, -1), H, 3);
    s += part(taper(tb, 26, 10), G, Gs, { off: [-3, -3] }) + part(p.tailTip || 'M232 196L222 178L236 162L244 182Z', H, dk(H, .35), { off: [-2, -2], w: 3.5 });
    // back spikes behind body
    s += P('M100 112L92 92L108 104L110 82L122 102L134 102L146 82L148 104L164 92L156 112Z', H, 3.5);
    // haunches
    const leg = 'M66 202C60 174 80 154 102 160C116 164 120 184 112 202L114 222C118 224 120 230 116 236L74 236C68 236 66 228 72 224L80 218C72 214 68 208 66 202Z';
    s += part(leg, G, Gs, { off: [-6, -6] }) + part(mir(leg), G, Gs, { off: [-6, -6] });
    // body
    s += part('M84 152C82 122 104 106 128 106C152 106 174 122 172 152C172 192 156 222 128 222C100 222 84 192 84 152Z', rad([[0, p.hi], [.6, G], [1, G]], .35, .3, .8), Gs, { off: [-8, -8] });
    s += part('M106 128C112 120 144 120 150 128C152 170 144 206 128 214C112 206 104 170 106 128Z', Bl, dk(Bl, .3), { off: [-4, -4], in: L('M104 140Q128 146 152 140M104 156Q128 162 152 156M106 172Q128 178 150 172M110 188Q128 194 146 188M116 202Q128 206 140 202', dk(Bl, .35), 3) });
    s += P('M74 236L72 228L80 232ZM86 236L86 226L92 234ZM98 236L100 228L104 234Z', p.claw, 2.5) + P(mir('M74 236L72 228L80 232ZM86 236L86 226L92 234ZM98 236L100 228L104 234Z'), p.claw, 2.5);
    // arms
    s += tubes([[pl([[100, 140], [90, 170], [104, 188]]), 14], [pl(mp([[100, 140], [90, 170], [104, 188]])), 14]], G, Gs);
    const cl = 'M100 186L98 200L106 192L110 202L114 190L118 196L116 184Z';
    s += P(cl, p.claw, 3) + P(mir(cl), p.claw, 3) + C(106, 188, 8, G, 3.5) + C(150, 188, 8, G, 3.5);
    // head: horns, ears/frills, cranium, muzzle
    const horn = 'M104 54C88 44 78 26 76 6C88 18 102 26 118 38Z';
    s += part(horn, lin([[0, lt(H, .3)], [1, H]]), dk(H, .35), { off: [-3, -3], in: L('M86 22L94 18M92 32L100 28M98 40L106 38', dk(H, .35), 2.5) }) + part(mir(horn), lin([[0, lt(H, .3)], [1, H]]), dk(H, .35), { off: [-3, -3], in: L(mir('M86 22L94 18M92 32L100 28M98 40L106 38'), dk(H, .35), 2.5) });
    const fr = 'M94 72L64 62L76 76L60 84L80 88L70 98L96 94Z';
    s += part(fr, W, dk(W, .35), { off: [-3, -3], w: 3.5 }) + part(mir(fr), W, dk(W, .35), { off: [-3, -3], w: 3.5 });
    s += part('M92 76C90 48 106 34 128 34C150 34 166 48 164 76C164 88 160 96 156 100L100 100C96 96 92 88 92 76Z', rad([[0, p.hi], [.6, G], [1, G]], .35, .3, .8), Gs, { off: [-6, -6] });
    s += P('M120 36L128 20L136 36Z', H, 3);
    s += part('M104 106C114 118 142 118 152 106C148 128 140 136 128 136C116 136 108 128 104 106Z', p.mouth, dk(p.mouth, .35), { w: 3.5, off: [0, 0], in: p.mouthIn || '' });
    s += P('M110 110L113 122L118 112Z', '#fff', 2.2) + P(mir('M110 110L113 122L118 112Z'), '#fff', 2.2) + P('M118 130L122 122L126 132Z', '#fff', 2.2) + P(mir('M118 130L122 122L126 132Z'), '#fff', 2.2);
    s += part('M98 84C96 100 108 112 128 112C148 112 160 100 158 84C150 90 140 92 128 92C116 92 106 90 98 84Z', lt(G, .12), Gs, { off: [-4, -4] });
    s += `<ellipse cx="118" cy="98" rx="4" ry="2.6" fill="${O}"/><ellipse cx="138" cy="98" rx="4" ry="2.6" fill="${O}"/>`;
    const eo = { sc: rad([[0, '#fff'], [.4, p.eye], [1, dk(p.eye, .2)]], .4, .4, .7), glow: p.eye, pr: 4.5, slit: true, cut: .3, bw: 6 };
    s += angryEye(110, 72, 11, 10, 5, { ...eo, px: 1 }) + angryEye(146, 72, 11, 10, -5, { ...eo, px: -1 });
    s += p.fx || '';
    return svg(s);
  }

  /* ===================== DEMON LORD ===================== */
  function demon(p) {
    const K = p.skin, Ks = p.sh, A = p.armor, As = dk(p.armor, .4), T = p.trim;
    let s = (p.auraFx || '') + glow(128, 124, 128, p.aura, .5, 118);
    s += p.back || '';
    // legs
    const leg = [[110, 180], [98, 206], [104, 226]];
    s += tubes([[pl(leg), 22], [pl(mp(leg)), 22]], K, Ks);
    const hoof = 'M88 236C86 226 94 220 106 220C116 220 122 228 120 236Z';
    s += part(hoof, '#2a1e22', O, { off: [-3, -3] }) + part(mir(hoof), '#2a1e22', O, { off: [-3, -3] });
    if (p.armored) s += part('M88 196L112 196L114 222L92 222Z', A, As, { off: [-3, -3], in: L('M90 208L112 208', T, 3) }) + part(mir('M88 196L112 196L114 222L92 222Z'), A, As, { off: [-3, -3], in: L(mir('M90 208L112 208'), T, 3) });
    // torso
    s += part('M80 106C80 94 104 88 128 88C152 88 176 94 176 106L166 150L156 186L100 186L90 150Z', rad([[0, lt(K, .25)], [.6, K], [1, K]], .35, .3, .8), Ks,
      { off: [-7, -7], in: L('M128 110L128 180M104 126Q116 132 126 126M130 126Q140 132 152 126M110 150Q128 156 146 150M112 166Q128 170 144 166', Ks, 3) + (p.torsoIn || '') });
    s += p.chest || '';
    // waist
    s += part('M94 176L162 176L172 214L150 206L128 218L106 206L84 214Z', p.skirt, dk(p.skirt, .4), { off: [-4, -4], in: L('M106 178L104 206M128 178L128 216M150 178L152 206', dk(p.skirt, .4), 3) });
    s += part('M92 172L164 172L164 184L92 184Z', p.belt, dk(p.belt, .4), { w: 3.5, off: [-2, -2] }) + (p.buckle || '');
    // arms
    s += tubes([[pl(p.armL), 20]], K, Ks) + (p.handL || '');
    s += p.weapon || '';
    s += tubes([[pl(p.armR), 20]], K, Ks) + (p.handR || '');
    // shoulders
    s += p.shoulders || '';
    // head
    s += p.hornsBack || '';
    const ear = 'M104 72C94 70 86 64 80 56C82 70 90 80 102 84Z';
    s += part(ear, K, Ks, { off: [-2, -2], w: 3.5 }) + part(mir(ear), K, Ks, { off: [-2, -2], w: 3.5 });
    s += part('M100 70C98 46 112 36 128 36C144 36 158 46 156 70C156 90 146 106 128 106C110 106 100 90 100 70Z', rad([[0, lt(K, .3)], [.6, K], [1, K]], .35, .3, .8), Ks, { off: [-6, -6] });
    s += p.horns || '';
    s += p.eyes || '';
    s += part('M110 86C120 92 136 92 146 86C142 100 136 104 128 104C120 104 114 100 110 86Z', '#3a0a12', '#22060c', { w: 3, off: [0, 0] });
    s += P('M113 88L116 96L120 90Z', '#fff', 2) + P(mir('M113 88L116 96L120 90Z'), '#fff', 2);
    s += p.fx || '';
    return svg(s);
  }

  /* ===================== palettes ===================== */
  const out = {};

  out.forest_slime = slime({ base: '#8fdc32', sh: '#3f8f1e', hi: '#e2ff9a', core: '#d4ff7a',
    inner: bubble(150, 200, 6, '#d8ff8a') + bubble(186, 160, 4, '#d8ff8a') + bubble(70, 206, 5, '#d8ff8a') });
  out.swamp_slime = slime({ base: '#7f8a3a', sh: '#454c22', hi: '#b6b968', mouth: '#2a2a10', tongue: '#9a6a4a', sclera: '#f2f0c8',
    inner: `<ellipse cx="170" cy="200" rx="26" ry="14" fill="#5a5a28" opacity=".7"/><ellipse cx="80" cy="186" rx="18" ry="10" fill="#5a5a28" opacity=".6"/>`,
    over: bubble(58, 196, 8, '#a9b25c') + bubble(196, 178, 10, '#a9b25c') + bubble(178, 214, 6, '#a9b25c') + bubble(186, 70, 7, '#a9b25c') + bubble(204, 50, 5, '#a9b25c') + bubble(170, 44, 3.5, '#a9b25c'),
    top: L('M124 52C112 70 108 92 98 106C92 114 94 126 88 134', O, 9) + L('M124 52C112 70 108 92 98 106C92 114 94 126 88 134', '#3e6a1e', 4.5) +
      L('M128 52C140 72 150 84 164 96C172 104 172 118 180 124', O, 9) + L('M128 52C140 72 150 84 164 96C172 104 172 118 180 124', '#3e6a1e', 4.5) +
      L('M126 50C122 40 128 30 136 26', O, 8) + L('M126 50C122 40 128 30 136 26', '#5d8f2a', 4) + P('M136 26C146 20 152 26 150 32C144 34 138 32 136 26Z', '#6aa82e', 3) });
  out.volcano_slime = slime({ base: '#ff8a1c', sh: '#b8320e', hi: '#fff06a', core: '#ffe14a', aura: '#ff7a1a', mouth: '#5a0c06', tongue: '#ffb03a', sclera: '#fff6b8', pupil: '#3a0606',
    inner: [['M104 80L116 66L136 68L148 80L134 90L114 88Z'], ['M30 192L44 180L62 184L66 198L50 206L34 204Z'], ['M188 196L202 182L218 188L222 204L204 210Z'], ['M152 114L164 104L178 110L176 124L160 124Z']].map(([d]) => P(d, '#4a2a2e', 3) + `<path d="${d}" fill="#7a4e4a" transform="translate(-2 -3) scale(1)" opacity=".85"/>` + L(d.replace(/L.*$/, '').replace('M', 'M') , '#ffd23a', 0)).join(''),
    top: C(196, 60, 4, '#ffd23a', 2) + C(58, 84, 3, '#ffb02a', 2) + C(214, 98, 3, '#ffe066', 2) + spark(176, 36, 7, '#fff2a0') + spark(72, 56, 5, '#ffd060') });

  const goblinTunic = 'M98 136C90 150 86 176 88 204Q96 216 104 206Q112 218 120 206Q128 218 136 206Q144 218 152 206Q160 216 168 204C170 176 166 150 158 136Z';
  out.forest_goblin = goblin({ skin: '#7cc142', skinSh: '#3f7d2a', eye: '#ffe14a', ear: '#a5547a', cloth: '#3d8b3a', boot: '#7a4a26',
    tunic: goblinTunic, tunicIn: L('M110 150L114 170M128 146L128 168M146 150L142 170', '#2b6a2c', 3) + L('M104 198L104 210M120 198L120 210M136 198L136 210M152 198L152 210', '#2b6a2c', 2.5),
    belt: part('M88 180L168 180L168 192L88 192Z', '#8a5a2e', '#5c3a1e', { off: [-2, -2], w: 3.5 }) + P('M122 178L134 178L134 194L122 194Z', '#e8b33a', 3) +
      part('M96 140C104 132 116 134 120 142L164 184L156 190L112 152C104 152 98 148 96 140Z', '#9a6634', '#6a4220', { w: 3.5, off: [-2, -2] }),
    armR: ['M158 148L180 170L190 156', 15],
    weapon: part('M180 172L190 176L206 118C226 108 236 84 228 62C218 42 192 46 186 66C182 86 192 102 196 116Z', '#9a6838', '#5e3a1c',
      { off: [-5, -5], in: L('M204 78Q210 84 206 92M214 62Q220 66 218 72', '#5e3a1c', 3) }) +
      P('M230 72L244 68L232 80Z', '#c8ccd4', 3) + P('M222 50L228 36L230 54Z', '#c8ccd4', 3) + P('M190 76L178 70L190 86Z', '#c8ccd4', 3) +
      part(E(190, 154, 12, 11), '#7cc142', '#3f7d2a', { off: [-3, -3] }) });
  out.swamp_goblin = goblin({ skin: '#9aa04a', skinSh: '#5f6428', eye: '#ffb83a', ear: '#7a5a3a', cloth: '#6e5034', boot: '#4e3a26', wood: '#8a6a40', rope: '#c9a86a', spear: true,
    tunic: 'M98 136C90 150 86 176 88 206L96 198L102 212L110 200L118 214L126 202L134 214L142 200L150 212L158 198L168 206C170 176 166 150 158 136Z',
    tunicIn: L('M100 160L112 168M146 156L156 166M120 184L130 190', '#4e3a26', 3),
    belt: L('M88 182Q128 192 168 182', O, 8) + L('M88 182Q128 192 168 182', '#c9a86a', 4) + P('M104 186L98 204L108 196Z', '#c9a86a', 2.5),
    armR: ['M158 148L184 170L198 160', 15],
    hood: part('M72 106C64 64 92 30 128 30C164 30 192 64 184 106C178 98 172 92 164 92C160 76 146 66 128 66C110 66 96 76 92 92C84 92 78 98 72 106Z', '#4f7a2a', '#2f4f1a',
      { off: [-6, -6], in: `<circle cx="104" cy="48" r="8" fill="#6f9e3a"/><circle cx="148" cy="44" r="7" fill="#6f9e3a"/><circle cx="168" cy="72" r="6" fill="#6f9e3a"/><circle cx="84" cy="74" r="6" fill="#6f9e3a"/>` }) +
      L('M78 100L76 118M178 100L180 118', O, 7) + L('M78 100L76 118M178 100L180 118', '#4f7a2a', 3) +
      P('M126 32C122 22 130 14 138 18C140 24 134 30 126 32Z', '#d8503a', 3) + L('M128 32L130 38', O, 3),
    weapon: part(E(200, 160, 12, 11), '#9aa04a', '#5f6428', { off: [-3, -3] }) });

  out.desert_skeleton = skeleton({ bone: '#f1e4c2', boneSh: '#b39a72', eye: '#ff7a2a',
    armL: [[100, 126], [84, 154], [84, 176]], armR: [[156, 126], [180, 146], [190, 122]],
    waist: part('M100 166C118 172 138 172 156 166L158 180C138 186 118 186 98 180Z', '#c8402e', '#8a2420', { w: 3.5, off: [-2, -3] }) +
      part('M104 176L92 214L100 206L104 222L110 206L118 212L114 180Z', '#c8402e', '#8a2420', { w: 3.5, off: [-2, -2] }),
    shield: part(E(76, 160, 25, 25), rad([[0, '#f0c060'], [1, '#b8782a']], .4, .35, .7), '#7a4a1a', { off: [-4, -4], in: `<circle cx="76" cy="160" r="17" fill="none" stroke="#7a4a1a" stroke-width="3"/>` }) +
      C(76, 160, 7, '#e8d9b0', 3) + C(60, 160, 2.5, '#5a3a1a', 0) + C(92, 160, 2.5, '#5a3a1a', 0) + C(76, 144, 2.5, '#5a3a1a', 0) + C(76, 176, 2.5, '#5a3a1a', 0),
    weapon: part('M184 112C176 82 186 52 214 30C220 28 222 34 218 40C204 60 200 86 198 112Z', lin([[0, '#ffffff'], [1, '#aeb9c6']], 0, 0, 1, 0), '#7d8a99', { off: [-3, -3] }) +
      P('M174 114L208 110L208 118L174 122Z', '#e8b33a', 3) + tubes([['M191 122L191 134', 6]], '#7a4a26', '#4a2a16', 3) + C(191, 138, 4.5, '#e8b33a', 3) });
  out.crypt_skeleton = skeleton({ bone: '#bccbdb', boneSh: '#76869e', eye: '#5ff0ff',
    armL: [[100, 126], [88, 152], [90, 176]], armR: [[156, 126], [178, 152], [186, 140]],
    back: tubes([['M186 230L186 46', 8]], '#6e5a44', '#46382a') +
      part('M186 8C198 24 200 40 192 54L180 54C172 40 174 24 186 8Z', '#b86a34', '#7a3e1c', { off: [-3, -3], in: `<circle cx="190" cy="30" r="4" fill="#5a2c14"/><circle cx="182" cy="42" r="3" fill="#d88a4a"/>` }) +
      P('M180 56L192 56L192 66L180 66Z', '#5a6a8a', 3) + P('M181 66L176 84L184 76Z', '#5a6a8a', 2.5),
    waist: part('M102 172C118 178 138 178 154 172L150 200L142 194L136 204L128 196L120 204L114 194L106 200Z', '#3e4a6a', '#262e46', { w: 3.5, off: [-2, -3] }),
    head: part('M88 72C84 44 104 28 128 28C140 28 150 32 154 38C150 44 156 48 162 46C168 54 170 62 168 72L174 74C174 82 166 84 160 82L96 82C90 84 82 82 82 74Z', '#7f8794', '#4d5360',
      { off: [-5, -5], in: `<ellipse cx="146" cy="68" rx="10" ry="6" fill="#a8653a" opacity=".8"/><ellipse cx="100" cy="56" rx="7" ry="5" fill="#a8653a" opacity=".7"/><ellipse cx="112" cy="44" rx="12" ry="5" transform="rotate(-20 112 44)" fill="#c6ccd6" opacity=".6"/>` }) +
      L('M154 38C150 44 156 48 162 46', O, 3) + [94, 110, 128, 146, 162].map(x => C(x, 78, 2.2, '#c6ccd6', 0)).join('') });
  out.castle_skeleton = skeleton({ bone: '#e9e2d6', boneSh: '#9c9282', eye: '#ff3a3a',
    armL: [[98, 126], [84, 154], [88, 178]], armR: [[158, 126], [182, 144], [190, 120]],
    back: part('M92 124C78 160 66 200 60 232L78 224L90 236L106 226L120 236L136 226L150 236L166 226L178 236L196 224C190 196 178 160 164 124Z', '#8a1f2e', '#561322', { off: [-5, -5] }),
    legs: part('M100 214L114 214L112 230L98 230Z', '#3d4258', '#25283a', { w: 3.5, off: [-2, -2] }) + part(mir('M100 214L114 214L112 230L98 230Z'), '#3d4258', '#25283a', { w: 3.5, off: [-2, -2] }),
    waist: part('M102 172L154 172L158 198L142 192L128 200L114 192L98 198Z', '#3d4258', '#25283a', { off: [-3, -3], in: L('M102 184L154 184', '#c9a24a', 3) }),
    torso: part('M98 120C94 146 100 166 112 176L144 176C156 166 162 146 158 120C146 114 110 114 98 120Z', lin([[0, '#5a617e'], [1, '#2e3248']], 0, 0, 1, 1), '#1f2234',
      { off: [-6, -6], in: L('M128 120L128 174', '#1f2234', 4) + L('M100 124C116 118 140 118 156 124', '#c9a24a', 4) + L('M112 174L144 174', '#c9a24a', 4) + `<ellipse cx="112" cy="136" rx="8" ry="12" fill="#8f97b8" opacity=".5"/>` }),
    shoulders: part('M80 122C80 106 96 98 112 106L112 132C102 138 86 136 80 122Z', '#4a5070', '#25283a', { off: [-4, -4], in: L('M84 122C92 126 104 126 112 122', '#c9a24a', 3) }) +
      part(mir('M80 122C80 106 96 98 112 106L112 132C102 138 86 136 80 122Z'), '#4a5070', '#25283a', { off: [-4, -4], in: L(mir('M84 122C92 126 104 126 112 122'), '#c9a24a', 3) }),
    weapon: part('M185 112L196 30L204 18L210 32L197 114Z', lin([[0, '#ffffff'], [1, '#9aa6b8']], 0, 0, 1, 0), '#6d788a', { off: [-2, -2], in: L('M201 30L191 112', '#7d889a', 2) }) +
      P('M172 116L210 110L212 118L174 124Z', '#c9a24a', 3) + tubes([['M192 124L193 136', 6]], '#5a2a2a', '#3a1818', 3) + C(193, 140, 5, '#c9a24a', 3),
    head: part('M90 80C88 48 106 32 128 32C150 32 168 48 166 80L166 104L154 108L152 82C146 74 110 74 104 82L102 108L90 104Z', lin([[0, '#5a617e'], [1, '#2a2e44']], 0, 0, 1, 1), '#1f2234',
      { off: [-5, -5], in: L('M92 76C110 70 146 70 164 76', '#c9a24a', 3.5) + `<ellipse cx="108" cy="46" rx="10" ry="5" transform="rotate(-30 108 46)" fill="#9aa2c4" opacity=".6"/>` }) +
      part('M120 34C116 20 124 8 140 6C150 6 156 12 158 18C148 16 140 22 136 34Z', '#d0283a', '#8a1424', { off: [-3, -3] }) });

  out.crypt_spider = spider({ body: '#5b3a86', bodySh: '#30204e', leg: '#4a2f6e', legSh: '#2a1a42', joint: '#9a74d4', fang: '#e8dcc8', eye: '#5ff5c8',
    mark: P('M128 70C146 70 156 84 154 98C152 108 146 112 144 118L112 118C110 112 104 108 102 98C100 84 110 70 128 70Z', '#c9b4ec', 3) + C(116, 96, 7, '#30204e', 0) + C(140, 96, 7, '#30204e', 0) + P('M128 104L124 112L132 112Z', '#30204e', 0) + L('M120 118L120 124M128 118L128 126M136 118L136 124', '#c9b4ec', 4) });
  out.swamp_spider = spider({ body: '#7cc22e', bodySh: '#3a6a18', leg: '#3e6a1e', legSh: '#22401a', joint: '#e8e040', fang: '#e8f2a0', eye: '#ff3a6a', head: '#5e9a24',
    mark: L('M64 102Q128 86 192 102M66 124Q128 110 190 124M78 146Q128 134 178 146', '#2a3a10', 7) + L('M64 102Q128 86 192 102M66 124Q128 110 190 124M78 146Q128 134 178 146', '#e8e040', 3.5) + C(128, 70, 7, '#e8e040', 3),
    drip: P('M121 226C117 232 118 236 121 236C125 236 126 232 121 226Z', '#b6ff3a', 2.5) + P(mir('M121 226C117 232 118 236 121 236C125 236 126 232 121 226Z'), '#b6ff3a', 2.5) });
  out.abyss_spider = spider({ body: '#2a1f5a', bodySh: '#120c2e', leg: '#2c2050', legSh: '#160f30', joint: '#e04aff', fang: '#d8c8ff', eye: '#ff4ae0', head: '#33246a', aura: '#8a3aff',
    mark: `<ellipse cx="110" cy="100" rx="40" ry="24" fill="#c03aff" opacity=".35"/><ellipse cx="150" cy="130" rx="34" ry="18" fill="#3ab0ff" opacity=".3"/>` +
      [[90, 90, 4], [120, 76, 3], [150, 92, 5], [170, 116, 3], [104, 128, 3.5], [136, 138, 3], [80, 118, 2.5], [160, 70, 2.5], [128, 108, 2]].map(([x, y, r]) => spark(x, y, r * 1.6, '#fff')).join(''),
    top: spark(40, 60, 6, '#e0a0ff') + spark(220, 40, 5, '#a0d0ff') + spark(228, 200, 4, '#e0a0ff') });

  out.forest_wolf = wolf({ fur: '#8f7c6a', sh: '#5a4840', dark: '#6a5a4e', belly: '#cfbea6', ear: '#5a3a3a', eye: '#ffd23a',
    mane: part('M86 64C100 54 124 60 136 74L148 70L144 88L158 92L146 102L154 112L138 112C124 120 102 116 90 104Z', '#7a6858', '#4e3e36', { off: [-4, -4] }) });
  out.ice_wolf = wolf({ fur: '#e4eef8', sh: '#8eaed4', dark: '#a8c0de', belly: '#ffffff', ear: '#8ab4e0', eye: '#9ff8ff', eyeGlow: '#5ff0ff', muzzle: '#f4f8fc', tip: '#bff4ff', aura: '#8adfff',
    mane: [['M92 76L100 40L114 72Z'], ['M110 70L126 34L134 76Z'], ['M128 80L150 50L152 92Z'], ['M148 96L172 72L170 106Z'], ['M170 102L190 86L188 112Z']].map(([d]) => part(d, '#bff4ff', '#4aa6e0', { off: [-4, -2], w: 3.5, in: '' })).join('') +
      L('M100 40L104 70M126 34L128 72M150 50L144 88', '#ffffff', 2.5, ' opacity=".8"'),
    chestX: part('M58 150L66 128L74 154Z', '#bff4ff', '#4aa6e0', { w: 3, off: [-2, -2] }) + part('M74 164L84 140L90 168Z', '#bff4ff', '#4aa6e0', { w: 3, off: [-2, -2] }),
    top: spark(36, 60, 7, '#ffffff') + spark(222, 30, 6, '#d8f8ff') + spark(150, 26, 4, '#ffffff') });

  out.volcano_imp = imp({ skin: '#e2402e', sh: '#9a1e1e', belly: '#ff9a5a', claw: '#3a2020', eye: '#ffe45a', pupil: '#3a0606',
    horns: part('M100 62C90 48 86 32 92 16C100 30 110 42 118 52Z', '#3a2626', '#1d1220', { off: [-3, -3] }) + part(mir('M100 62C90 48 86 32 92 16C100 30 110 42 118 52Z'), '#3a2626', '#1d1220', { off: [-3, -3] }),
    hair: part('M116 52C112 40 118 30 124 24C124 34 130 36 132 28C138 36 140 44 138 52Z', '#ffb02a', '#e05a14', { w: 3, off: [-2, -2] }),
    tailTip: glow(40, 160, 30, '#ff8a1a', .6) + part('M40 180C26 172 24 156 32 144C34 152 38 154 40 148C40 140 44 132 52 126C50 138 58 146 56 160C56 172 50 180 40 180Z', '#ff8a1a', '#d8401a', { off: [-3, -3], in: `<path d="M40 178C34 172 34 162 38 156C40 162 44 162 46 156C50 164 48 174 40 178Z" fill="#ffe46a"/>` }),
    heldFront: glow(198, 92, 40, '#ff8a1a', .65) + part('M198 52C210 66 222 76 222 94C222 110 210 120 198 120C184 120 174 110 174 96C174 86 180 80 184 72C186 82 190 84 194 80C190 70 192 62 198 52Z', '#ff8a1a', '#d8401a', { off: [-3, -3], in: `<path d="M198 116C188 116 182 108 184 98C186 92 190 90 192 86C194 94 198 94 200 90C202 84 202 80 204 76C212 86 214 96 212 104C208 112 204 116 198 116Z" fill="#ffd84a"/><ellipse cx="198" cy="104" rx="7" ry="9" fill="#fffbe0"/>` }) });
  out.ice_imp = imp({ skin: '#5aa8e8', sh: '#2a62a8', belly: '#bfe6ff', claw: '#e0f6ff', eye: '#eaffff', pupil: '#1a3a7a', eyeGlow: '#7ff0ff', aura: '#9ae6ff',
    horns: part('M100 60L84 22L96 34L100 14L116 52Z', '#c8f4ff', '#5ab0e8', { off: [-3, -3], in: L('M96 34L104 54', '#ffffff', 2) }) + part(mir('M100 60L84 22L96 34L100 14L116 52Z'), '#c8f4ff', '#5ab0e8', { off: [-3, -3], in: L(mir('M96 34L104 54'), '#ffffff', 2) }),
    hair: P('M104 54L112 46L118 54L126 44L132 54L140 46L146 54L152 50C140 40 116 40 104 54Z', '#ffffff', 3),
    tailTip: part('M40 178L28 150L42 160L46 134L54 166Z', '#c8f4ff', '#5ab0e8', { off: [-2, -2] }),
    held: part('M190 138L206 40L214 32L216 44L200 140Z', lin([[0, '#ffffff'], [1, '#8fd8ff']], 0, 0, 1, 0), '#4aa0e0', { off: [-2, -2], in: L('M210 40L198 132', '#ffffff', 2) }) +
      spark(212, 26, 9, '#ffffff') + spark(228, 70, 5, '#dff8ff') + spark(176, 50, 4, '#ffffff') });
  out.abyss_imp = imp({ skin: '#5a3a9a', sh: '#2c1a5a', belly: '#9a7ad8', claw: '#e0c8ff', eye: '#ff5ae8', pupil: '#2a0a3a', eyeGlow: '#ff4ae0', aura: '#7a3aff',
    wings: [0, 1].map(m => { const d = 'M102 146C80 108 50 92 18 94C30 104 32 118 28 130C42 128 50 136 52 148C64 144 74 150 78 162Z'; return part(m ? mir(d) : d, lin([[0, '#8a5ad8'], [1, '#4a2a8a']]), '#2a1650', { off: [-4, -4], in: L(m ? mir('M100 144L22 96M80 130L32 128M84 146L54 146') : 'M100 144L22 96M80 130L32 128M84 146L54 146', '#2a1650', 2.5) }); }).join(''),
    horns: part('M96 64C80 60 70 44 76 28C80 20 90 20 92 26C86 32 88 44 100 50Z', '#2a1f3a', '#120a1e', { off: [-3, -3] }) + part(mir('M96 64C80 60 70 44 76 28C80 20 90 20 92 26C86 32 88 44 100 50Z'), '#2a1f3a', '#120a1e', { off: [-3, -3] }),
    third: glow(128, 70, 14, '#ff4ae0', .8) + `<ellipse cx="128" cy="70" rx="6" ry="8" fill="#ffd0f8" stroke="${O}" stroke-width="3"/><ellipse cx="128" cy="71" rx="2" ry="5" fill="${O}"/>`,
    tailTip: glow(40, 166, 24, '#c03aff', .6) + part('M40 182L26 162L40 150L54 162Z', '#e04aff', '#7a1a9a', { off: [-2, -2] }),
    heldFront: glow(200, 100, 38, '#c03aff', .65) + part(E(200, 100, 20, 20), rad([[0, '#2a0a40'], [.7, '#12051e'], [1, '#c03aff']], .5, .5, .5), '#12051e', { off: [0, 0], in: spark(194, 94, 5, '#fff') + spark(208, 108, 3, '#ff9af0') }) });

  out.crypt_bat = bat({ wing: '#7a4ab8', wingSh: '#3e2470', fur: '#5a3a8a', sh: '#2e1c50', chest: '#8a6ac0', ear: '#d47aa8', eye: '#ffde3a', bone: '#4a2e78', claw: '#e8dcc8', nose: '#d47aa8', dy: 16 });

  out.castle_eye = eyeBeast({ flesh: '#d8394a', sh: '#8a1a2a', fin: '#a82838', sclera: '#fff3dc', vein: '#e0405a', iris: '#ff8a1a',
    spots: `<circle cx="164" cy="60" r="5" fill="#a82838"/><circle cx="178" cy="78" r="3.5" fill="#a82838"/><circle cx="86" cy="150" r="4" fill="#a82838"/>` });
  out.abyss_eye = eyeBeast({ flesh: '#7a3ac8', sh: '#3a1a70', fin: '#5a2a9a', tent: '#5a2aa0', sclera: '#f4e8ff', vein: '#b04ae0', iris: '#30e8ff', aura: '#8a3aff',
    spots: spark(160, 58, 5, '#e8c8ff') + spark(180, 90, 3.5, '#fff') + spark(84, 146, 4, '#e8c8ff'),
    stars: spark(30, 40, 6, '#e0b0ff') + spark(228, 46, 7, '#ffffff') + spark(222, 196, 5, '#b0e0ff') + spark(40, 200, 4, '#ffffff') });

  // Гоблин-казначей: редкий враг с мешком золота (появляется по таймеру, сбегает через 12 сек)
  const coin = (x, y, r = 9) => C(x, y, r, lin([[0, '#fff1a0'], [.5, '#ffc93a'], [1, '#e88a1c']]), 3) + `<circle cx="${x}" cy="${y}" r="${r1(r * .52)}" fill="none" stroke="#b86a10" stroke-width="2"/>` + `<circle cx="${r1(x - r * .35)}" cy="${r1(y - r * .4)}" r="${r1(r * .22)}" fill="#fff" opacity=".9"/>`;
  out.treasure_goblin = goblin({ skin: '#8fd04a', skinSh: '#4a8a2c', eye: '#ffe14a', ear: '#c06a8a', cloth: '#8a2a6a', boot: '#5a3a22',
    back: glow(128, 140, 124, '#ffd23a', .5, 110) +
      part('M150 60C150 40 176 30 196 40C226 52 244 92 240 132C238 168 214 192 182 190C154 188 138 160 140 122C140 96 146 78 150 60Z', '#c08a4a', '#7a5026',
        { off: [-7, -7], in: L('M168 70Q190 96 184 150M204 62Q226 100 214 160', '#7a5026', 3) + P('M176 112L196 112L196 136L176 136Z', '#e8c070', 0) + L('M176 112L196 112L196 136L176 136Z', '#7a5026', 2.5) + L('M180 118L192 130M192 118L180 130', '#7a5026', 2.5) }) +
      part('M152 62C144 50 150 34 162 30C172 26 186 30 190 40C182 50 166 58 152 62Z', '#d09a5a', '#7a5026', { off: [-3, -3], w: 3.5 }) +
      L('M150 62Q170 60 192 42', O, 8) + L('M150 62Q170 60 192 42', '#e03a3a', 4) +
      coin(170, 26, 9) + coin(190, 22, 8) + coin(180, 14, 8),
    tunic: goblinTunic, tunicIn: L('M110 150L114 170M128 146L128 168M146 150L142 170', '#5e1a48', 3) + L('M104 198L104 210M120 198L120 210M136 198L136 210M152 198L152 210', '#5e1a48', 2.5),
    belt: part('M88 180L168 180L168 192L88 192Z', '#8a5a2e', '#5c3a1e', { off: [-2, -2], w: 3.5 }) + P('M122 178L134 178L134 194L122 194Z', '#ffd23a', 3),
    armR: ['M158 148L176 140L172 118', 15],
    hood: part('M84 70C84 44 104 30 128 30C152 30 170 44 170 70C150 58 104 58 84 70Z', '#8a2a6a', '#5e1a48', { off: [-4, -4] }) +
      part('M120 34C126 14 150 6 166 16C156 20 148 28 142 38Z', '#8a2a6a', '#5e1a48', { off: [-3, -3] }) + coin(168, 16, 7),
    weapon: part(E(172, 114, 12, 11), '#8fd04a', '#4a8a2c', { off: [-3, -3] }) +
      coin(70, 228, 9) + coin(88, 236, 8) + coin(190, 230, 9) + coin(206, 238, 7) + coin(56, 238, 7) +
      spark(34, 150, 8, '#fff6b0') + spark(226, 30, 9, '#fff') + spark(48, 40, 6, '#ffe066') + spark(232, 206, 6, '#fff6b0') });

  out.specter = ghost({ body: '#6ab8ff', sh: '#2a5aa8', glow: '#5ac8ff', eye: '#c8ffff' });

  out.desert_scorpion = scorpion({ base: '#f2a43a', sh: '#a8561a', hi: '#ffe08a', dark: '#6a3414', sting: '#e2702a', venom: '#a6ff4a', eye: '#ff3a2a' });
  out.desert_mummy = mummy({ wrap: '#ece0c0', sh: '#a8946c', line: '#bba57a', eye: '#c8ff4a' });
  out.boss_desert = mummy({ wrap: '#ece0c0', sh: '#a8946c', line: '#bba57a', eye: '#5affe0', king: true, aura: '#ffd04a' });
  out.castle_bat = gargoyle({ stone: '#9a9cab', sh: '#5a5c70', wing: '#7c7f94', claw: '#3a3644', horn: '#6a6478', moss: '#6f9a4a', eye: '#ff8a1a', dy: 2 });

  const lava = d => L(d, '#ff5a1a', 8, ' opacity=".55"') + L(d, '#ffb02a', 4) + L(d, '#fff2a0', 1.4);
  out.ice_golem = golem({ stone: '#9fd8ff', sh: '#4a86cc', hi: '#f0fcff', eye: '#5ff0ff', aura: '#8adfff',
    torsoIn: L('M104 78L118 96M150 80L140 98M80 120L94 130', '#ffffff', 3, ' opacity=".8"'),
    core: glow(128, 128, 30, '#5ff0ff', .9) + part('M128 108L142 128L128 150L114 128Z', '#eaffff', '#5ab0e8', { off: [-3, -3], w: 3.5 }),
    shIn: L('M48 86L60 80', '#ffffff', 3, ' opacity=".8"'),
    top: [['M46 82L50 48L66 76Z'], ['M64 74L76 38L86 74Z'], ['M190 76L206 48L210 82Z'], ['M170 74L180 38L192 74Z'], ['M114 44L120 22L130 42Z'], ['M132 42L142 18L146 44Z']].map(([d]) => part(d, '#dcf8ff', '#5ab0e8', { off: [-3, -2], w: 3.5 })).join(''),
    fx: spark(24, 40, 7, '#ffffff') + spark(232, 140, 6, '#dff8ff') + spark(18, 140, 4, '#ffffff') + spark(222, 28, 4, '#ffffff') });
  out.volcano_golem = golem({ stone: '#54444c', sh: '#2c2028', hi: '#86727a', eye: '#ffb02a', aura: '#ff6a1a',
    torsoIn: lava('M110 76L118 96L108 116L120 134M152 80L142 102L154 124M94 156L112 164L128 158L142 168L162 160'),
    armIn: lava('M52 116L62 134L54 150L66 166'), fistIn: lava('M30 192L46 198L58 190'),
    legIn: lava('M104 190L110 206L102 222'), legIn2: lava('M152 190L158 206L150 224'),
    core: glow(128, 130, 34, '#ff8a1a', .95) + part('M128 112L142 130L128 150L114 130Z', '#ffe25a', '#ff7a1a', { off: [-3, -3], w: 3.5 }),
    shIn: lava('M50 84L62 96L58 108'),
    headIn: lava('M140 44L134 54'),
    top: fire(58, 76, 22, 30) + fire(198, 76, 22, 30) + P('M160 214C158 222 162 230 166 230C170 230 172 222 166 214Z', '#ffb02a', 2.5),
    fx: C(24, 60, 3, '#ffb02a', 2) + C(230, 40, 3.5, '#ffd23a', 2) + C(16, 120, 2.5, '#ff8a1a', 2) + spark(236, 110, 5, '#fff2a0') + spark(40, 24, 5, '#fff2a0') });
  const moss = '#5fae3a', mossD = '#3a7a28';
  out.boss_forest = golem({ stone: '#9c9884', sh: '#5e5a4a', hi: '#cfcab2', eye: '#8aff5a', aura: '#8aff5a',
    torsoIn: `<path d="M64 96L100 66L156 66L192 96C178 92 172 104 160 98C150 110 140 100 132 106C120 98 112 110 102 102C92 108 82 96 64 104Z" fill="${moss}"/><path d="M64 176C76 168 86 176 92 170C98 180 108 174 112 184L112 200L64 200Z" fill="${moss}"/>` + L('M98 70C104 90 96 110 104 128C110 140 104 156 110 170', mossD, 4),
    core: glow(128, 128, 30, '#8aff5a', .8) + L('M120 116L128 108L136 116L128 140L120 116M128 124L128 132', '#c8ff9a', 4),
    shIn: `<path d="M30 100C40 80 62 64 90 72C100 78 104 88 102 96C90 90 80 98 70 92C60 100 46 96 30 100Z" fill="${moss}"/>`,
    headIn: `<path d="M96 52C110 40 146 40 160 52L160 58C150 54 140 60 128 54C116 60 106 54 96 58Z" fill="${moss}"/>`,
    armIn: `<path d="M28 132C40 124 60 128 84 122L84 132C78 140 72 132 66 142C58 134 52 146 44 138C38 146 32 138 28 144Z" fill="${moss}"/>`,
    legIn: `<path d="M84 190C96 196 110 190 124 196L124 204L84 204Z" fill="${moss}"/>`, legIn2: `<path d="M132 190C144 196 156 190 170 196L170 204L132 204Z" fill="${moss}"/>`,
    top: tubes([['M112 46L100 30L86 24M100 30L104 18', 6], ['M144 46L156 30L170 24M156 30L152 18', 6], ['M128 44L128 26L118 18M128 26L138 18', 6]], '#8a5a34', '#5a3a1e', 3.5) +
      [[84, 24, -40], [104, 17, 20], [172, 24, 40], [152, 17, -20], [117, 15, -30], [139, 15, 30], [72, 74, -20], [186, 74, 20]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" transform="rotate(${r} ${x} ${y})" fill="#7ad04a" stroke="${O}" stroke-width="3"/>`).join('') +
      part('M180 70C180 60 196 58 200 66C196 70 186 72 180 70Z', '#e04a3a', '#9a2a1a', { w: 3, off: [-1, -1] }) + L('M190 70L190 78', O, 5) + L('M190 70L190 78', '#f0e0c0', 2.5) +
      P('M60 168L56 160L64 162L66 154L70 164Z', '#ffe04a', 2.5),
    fx: [[30, 40], [226, 120], [20, 150], [236, 50], [200, 200], [44, 214]].map(([x, y], i) => glow(x, y, 9, '#c8ff5a', .9) + C(x, y, 2.5, '#f0ffb0', 0)).join('') });

  out.boss_crypt = lich({ robe: '#4a2e70', glow: '#6aff8a' });
  out.boss_swamp = serpent({ skin: '#4aa84a', sh: '#22602c', hi: '#a6e46a', belly: '#e6e2a0', fin: '#f0a83a', horn: '#efe4c0', eye: '#ffd83a', aura: '#7aff8a' });

  out.boss_ice = dragon({ skin: '#8ccaf2', sh: '#3a76b8', hi: '#e6f8ff', belly: '#eefaff', wing: '#5aa2e2', horn: '#e6fbff', claw: '#e6fbff', mouth: '#1a3a6a', eye: '#7ff6ff', aura: '#8adfff',
    mouthIn: glow(128, 128, 22, '#bff8ff', .9),
    tailTip: 'M232 196L222 172L232 178L236 156L244 186Z',
    fx: spark(22, 140, 8, '#ffffff') + spark(236, 140, 7, '#dff8ff') + spark(40, 200, 5, '#ffffff') + spark(200, 20, 6, '#ffffff') + spark(60, 14, 4, '#ffffff') +
      L('M20 180L32 192M32 180L20 192M18 186L34 186M26 178L26 194', '#ffffff', 2.5) + L('M216 210L228 222M228 210L216 222M214 216L230 216M222 208L222 224', '#ffffff', 2.5) });
  out.boss_volcano = dragon({ skin: '#dc3a2a', sh: '#8a1818', hi: '#ff9a6a', belly: '#ffb24a', wing: '#a82a2a', horn: '#5a4044', claw: '#2e1a1a', mouth: '#4a0808', eye: '#ffe45a', aura: '#ff6a1a',
    mouthIn: glow(128, 130, 22, '#ffb02a', 1),
    fxBack: fire(30, 236, 34, 60) + fire(226, 236, 30, 52),
    fx: C(30, 120, 3, '#ffb02a', 2) + C(226, 110, 3.5, '#ffd23a', 2) + C(200, 30, 2.5, '#ff8a1a', 2) + spark(46, 176, 5, '#fff2a0') + spark(216, 176, 5, '#fff2a0') });

  const pauld = 'M60 116C56 94 78 82 104 88L108 122C96 134 68 132 60 116Z';
  out.boss_castle = demon({ skin: '#d8343a', sh: '#861622', armor: '#3d4258', trim: '#e8b33a', skirt: '#3d4258', belt: '#5a3a2a', aura: '#ff5a1a', armored: true,
    back: part('M86 100C70 140 56 190 44 232L66 222L80 234L96 222L112 232L128 222L144 232L160 222L176 234L190 222L212 232C200 190 186 140 170 100Z', '#7a1426', '#460a16', { off: [-5, -5] }),
    chest: part('M84 104C96 96 160 96 172 104L162 150L150 176L106 176L94 150Z', lin([[0, '#5a617e'], [1, '#2e3248']], 0, 0, 1, 1), '#1f2234', { off: [-6, -6], in: L('M128 104L128 176', '#1f2234', 3) + L('M88 108C104 100 152 100 168 108', '#e8b33a', 4) + `<ellipse cx="108" cy="122" rx="8" ry="12" fill="#8f97b8" opacity=".5"/>` }) +
      glow(128, 132, 16, '#ff5a1a', .9) + P('M128 122L136 132L128 144L120 132Z', '#ff8a2a', 3),
    buckle: P('M120 170L136 170L136 186L120 186Z', '#e8b33a', 3),
    armL: [[88, 110], [70, 142], [78, 170]], handL: part(E(78, 172, 12, 12), '#3d4258', '#1f2234', { off: [-3, -3] }),
    armR: [[168, 110], [194, 130], [206, 102]], handR: part(E(206, 102, 12, 12), '#3d4258', '#1f2234', { off: [-3, -3] }),
    weapon: glow(212, 56, 54, '#ff7a1a', .7) + fire(212, 96, 54, 92) +
      part('M200 92L208 18L215 8L221 18L214 94Z', lin([[0, '#ffffff'], [1, '#c0c8d8']], 0, 0, 1, 0), '#7d889a', { off: [-2, -2], w: 3.5, in: L('M215 14L207 92', '#9aa6b8', 2) }) +
      fire(204, 70, 14, 30, ['#ff6a1a', '#ffd23a', '#fff8d0']) + fire(222, 48, 14, 30, ['#ff6a1a', '#ffd23a', '#fff8d0']) + P('M188 90L226 92L224 100L186 98Z', '#e8b33a', 3) + tubes([['M206 104L206 116', 7]], '#5a2a2a', '#3a1818', 3),
    shoulders: part(pauld, '#4a5070', '#25283a', { off: [-4, -4], in: L('M64 116C76 122 96 122 108 116', '#e8b33a', 3) }) + part(mir(pauld), '#4a5070', '#25283a', { off: [-4, -4], in: L(mir('M64 116C76 122 96 122 108 116'), '#e8b33a', 3) }) +
      P('M70 96L58 72L84 90Z', '#c8ccd8', 3) + P(mir('M70 96L58 72L84 90Z'), '#c8ccd8', 3),
    horns: part('M106 52C88 42 76 24 80 4C88 18 102 28 120 38Z', lin([[0, '#fff2d8'], [1, '#6a5a50']]), '#3a2a2a', { off: [-3, -3] }) + part(mir('M106 52C88 42 76 24 80 4C88 18 102 28 120 38Z'), lin([[0, '#fff2d8'], [1, '#6a5a50']]), '#3a2a2a', { off: [-3, -3] }),
    eyes: angryEye(114, 70, 9, 8, 4, { sc: rad([[0, '#fff'], [.5, '#ffe45a'], [1, '#ff9a1a']]), glow: '#ffb02a', cut: .25, bw: 6 }) + angryEye(142, 70, 9, 8, -4, { sc: rad([[0, '#fff'], [.5, '#ffe45a'], [1, '#ff9a1a']]), glow: '#ffb02a', cut: .25, bw: 6 }) });
  const crys = (d) => part(d, '#e08aff', '#7a2ab0', { off: [-3, -3], w: 3.5 });
  out.boss_abyss = demon({ skin: '#6a3ac0', sh: '#341a70', armor: '#2a1a4a', trim: '#e04aff', skirt: '#2a1a4a', belt: '#4a2a7a', aura: '#9a3aff',
    auraFx: `<circle cx="128" cy="112" r="104" fill="none" stroke="${lin([[0, '#ff6af0'], [.5, '#6a3aff'], [1, '#3ad0ff']], 0, 0, 1, 1)}" stroke-width="6" opacity=".75"/><circle cx="128" cy="112" r="96" fill="none" stroke="#e8c8ff" stroke-width="1.5" stroke-dasharray="2 10" opacity=".9"/>` +
      [[34, 60, 6], [222, 70, 7], [30, 168, 5], [228, 176, 6], [70, 16, 4], [190, 18, 5], [128, 8, 4]].map(([x, y, r]) => spark(x, y, r, '#ffffff')).join(''),
    torsoIn: L('M110 110L118 124L112 140M146 110L138 126L144 142M128 150L120 162L128 176', '#ff5ae8', 3.5) + `<ellipse cx="128" cy="168" rx="40" ry="10" fill="#2a1a4a" opacity=".3"/>`,
    chest: glow(128, 132, 20, '#ff4ae0', .9) + part(E(128, 132, 9), rad([[0, '#ffffff'], [.4, '#ff9af0'], [1, '#a02ad0']]), '#5a1a7a', { off: [-2, -2], w: 3.5 }),
    buckle: C(128, 178, 7, '#e04aff', 3),
    armL: [[88, 110], [62, 134], [50, 110]], handL: glow(46, 92, 34, '#c03aff', .8) + part(E(46, 92, 17), rad([[0, '#3a1050'], [.7, '#14061e'], [1, '#e04aff']]), '#14061e', { off: [0, 0], in: spark(42, 88, 5, '#fff') + spark(52, 98, 3, '#ff9af0') }) + C(50, 112, 11, '#6a3ac0', 3.5),
    armR: [[168, 110], [194, 134], [206, 110]], handR: glow(210, 92, 34, '#c03aff', .8) + part(E(210, 92, 17), rad([[0, '#3a1050'], [.7, '#14061e'], [1, '#e04aff']]), '#14061e', { off: [0, 0], in: spark(206, 88, 5, '#fff') + spark(216, 98, 3, '#ff9af0') }) + C(206, 112, 11, '#6a3ac0', 3.5),
    shoulders: crys('M76 104L66 72L90 96Z') + crys('M90 98L88 64L104 92Z') + crys(mir('M76 104L66 72L90 96Z')) + crys(mir('M90 98L88 64L104 92Z')),
    horns: part('M104 54C80 56 64 40 70 22C74 10 92 8 96 18C86 22 84 32 92 38C98 42 108 40 114 38Z', lin([[0, '#d8c8f0'], [1, '#4a3a6a']]), '#2a1a3a', { off: [-3, -3] }) + part(mir('M104 54C80 56 64 40 70 22C74 10 92 8 96 18C86 22 84 32 92 38C98 42 108 40 114 38Z'), lin([[0, '#d8c8f0'], [1, '#4a3a6a']]), '#2a1a3a', { off: [-3, -3] }) +
      P('M118 40L122 24L128 38Z', '#d8c8f0', 3) + P(mir('M118 40L122 24L128 38Z'), '#d8c8f0', 3),
    eyes: [[112, 72, 8, 7, 4], [144, 72, 8, 7, -4], [116, 56, 5, 4.5, 2], [140, 56, 5, 4.5, -2]].map(([x, y, rx, ry, t]) => angryEye(x, y, rx, ry, t, { sc: rad([[0, '#fff'], [.5, '#ff9af0'], [1, '#e02ad0']]), glow: '#ff4ae0', cut: .25, bw: 4 })).join('') +
      glow(128, 46, 12, '#ff4ae0', .9) + `<ellipse cx="128" cy="46" rx="5" ry="7" fill="#ffd0f8" stroke="${O}" stroke-width="3"/>` });

  return out;
})();
