// Pelo rizado HD v2: mechones CONECTADOS. Cada rizo es una helice (zigzag adelante/atras) a lo largo de una "espina" que sale del cuero cabelludo,
// se curva por gravedad y se agrupa en clumps. Textura: contorno, base, sombra inferior, brillo por direccion de luz, hebras finas.
// Investigado: los rizos se dibujan como helice (la parte de atras queda oculta), el pelo crece en bloques (clumps) del nacimiento a la coronilla, la parte de abajo
// de cada rizo va mas oscura y la de arriba mas clara, y hay que variar tamano/paso para que no parezca peluca.
const OUT = '#12090a';
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const f1 = (n) => n.toFixed(1);
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
export const hdDefs = (h) => `<radialGradient id="hdScr" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#ff9ad0"/><stop offset="0.6" stop-color="#ec4899"/><stop offset="1" stop-color="#9d174d"/></radialGradient><radialGradient id="hdBase" cx="0.4" cy="0.3" r="0.9"><stop offset="0" stop-color="#2e221d"/><stop offset="0.6" stop-color="#150f0d"/><stop offset="1" stop-color="#070404"/></radialGradient>
  <linearGradient id="hdGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.5" stop-color="#d4a24c"/><stop offset="1" stop-color="#8a5f1c"/></linearGradient>`;
const LIGHT = [-0.55, -0.83];
let CUR = { cp: 1, bounce: 0, wind: 0, grow: 1 };
const MEMO = new Map(); const memo = (tag, h, fn) => { const key = tag + JSON.stringify([h.hd, h.len, Math.round((h.cp ?? 1) * 40), Math.round((h.bounce || 0) * 40), Math.round((h.wind || 0) * 40), Math.round((h.sway || 0) * 20), Math.round((h.grow ?? 1) * 40)]); if (MEMO.has(key)) return MEMO.get(key); CUR = { cp: h.cp ?? 1, bounce: h.bounce || 0, wind: h.wind || 0, grow: h.grow ?? 1 }; const v = fn(); if (MEMO.size > 400) MEMO.clear(); MEMO.set(key, v); return v; };
const styleOf = (h) => h.hd === true ? 'long' : h.hd;

// espina: nace en p0, sale en direccion ang, y la gravedad la curva hacia abajo
function spine(p0, ang0, L0, g0, R, step = 5) { const ang = ang0 + CUR.wind * 0.35 * (Math.sin(ang0) > 0 ? 1 : 0.5), L = L0 * (1 + 0.45 * (1 - CUR.cp)) * (1 + 0.06 * CUR.bounce) * (0.5 + 0.5 * CUR.grow), g = g0 * (1 + 0.5 * (1 - CUR.cp)); const dx = Math.cos(ang), dy = Math.sin(ang), ph = R() * 6, wob = (R() - 0.5) * 0.5; const pts = [];
  for (let s = 0; s <= L; s += step) { const u = s / L; pts.push([p0[0] + dx * s + wob * Math.sin(u * 4 + ph) * s * 0.18, p0[1] + dy * s + g * s * s]); }
  return pts; }
// helice alrededor de la espina: devuelve puntos y profundidad (cos): >0 = parte de adelante
function helix(pts, A, pitch, ph, taper = 0.4) { const P = [], D = [], U = []; let s = 0; const n = pts.length;
  for (let i = 0; i < n; i++) { if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const u = i / (n - 1), th = ph + 2 * Math.PI * s / pitch, am = A * (1 - taper * u);
    P.push([pts[i][0] - ty * am * Math.sin(th) + tx * am * 0.42 * Math.cos(th), pts[i][1] + tx * am * Math.sin(th) + ty * am * 0.42 * Math.cos(th)]); D.push(Math.cos(th)); U.push(u); }
  return { P, D, U }; }
const runs = (P, D, U, front) => { const out = []; let cur = null, u0 = 0; for (let i = 0; i < P.length; i++) { const ok = front ? D[i] > 0 : D[i] <= 0; if (ok) { if (!cur) { cur = []; u0 = U[i]; if (i) cur.push(P[i - 1]); } cur.push(P[i]); } else if (cur) { cur.push(P[i]); cur.u = u0; out.push(cur); cur = null; } } if (cur) { cur.u = u0; out.push(cur); } return out; };
const dPath = (r, off = [0, 0]) => 'M' + r.map((p) => `${f1(p[0] + off[0])},${f1(p[1] + off[1])}`).join(' L');
const normOf = (r) => { const a = r[0], b = r[r.length - 1]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; let nx = -ty, ny = tx; if (nx * LIGHT[0] + ny * LIGHT[1] < 0) { nx = -nx; ny = -ny; } return { nx, ny, lit: clamp(nx * LIGHT[0] + ny * LIGHT[1], 0, 1) }; };
const COL = { base: '#2c1f1a', back: '#0f0907', hi: '#9c6b49', hi2: '#e2b284', line: '#6d4a37' };

function lock(spn, W0, A0, pitch, ph, R, o = {}) { const A = A0 * Math.max(0.02, CUR.cp) * (1 - 0.14 * CUR.bounce) * (0.72 + 0.28 * CUR.grow); const { P, D, U } = helix(spn, A, pitch * (1 + 0.5 * (1 - CUR.cp)), ph, o.taper ?? 0.4); let s = '';
  // atras (oscuro, mas fino)
  for (const r of runs(P, D, U, false)) { const W = W0 * (1 - 0.5 * r.u); s += `<path d="${dPath(r)}" stroke="${OUT}" stroke-width="${f1(W * 0.9 + 5)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${dPath(r)}" stroke="${COL.back}" stroke-width="${f1(W * 0.9)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
  // adelante (cuerpo, sombra inferior, brillo segun luz, hebras)
  for (const r of runs(P, D, U, true)) { const W = W0 * (1 - 0.5 * r.u), { nx, ny, lit } = normOf(r), d = dPath(r);
    s += `<path d="${d}" stroke="${OUT}" stroke-width="${f1(W + 5)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${COL.base}" stroke-width="${f1(W)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${dPath(r, [-nx * W * 0.24, -ny * W * 0.24])}" stroke="#0a0605" stroke-width="${f1(W * 0.42)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`;
    if (lit > 0.1) s += `<path d="${dPath(r, [nx * W * 0.2, ny * W * 0.2])}" stroke="${COL.hi}" stroke-width="${f1(W * 0.3)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${f1(0.35 + 0.55 * lit)}"/><path d="${dPath(r, [nx * W * 0.24, ny * W * 0.24])}" stroke="${COL.hi2}" stroke-width="${f1(Math.max(1.6, W * 0.09))}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${f1(0.25 + 0.5 * lit)}"/>`;
    for (const k of [-0.32, 0.0, 0.3]) s += `<path d="${dPath(r, [nx * W * k, ny * W * k])}" stroke="${k === 0 ? '#000' : COL.line}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${k === 0 ? 0.35 : 0.3}"/>`; }
  return s; }
// clump: 2-4 rizos casi paralelos con distinta fase, grosor y largo
function clump(p0, ang, L, g, W, R, n = 3, o = {}) { let s = ''; for (let k = 0; k < n; k++) { const ofs = (k - (n - 1) / 2) * W * 0.55, a2 = ang + (R() - 0.5) * 0.18, nx = -Math.sin(ang), ny = Math.cos(ang);
    const sp = spine([p0[0] + nx * ofs, p0[1] + ny * ofs], a2, L * (0.78 + R() * 0.3), g * (0.85 + R() * 0.3), R);
    s += lock(sp, W * (0.8 + R() * 0.3), W * (0.6 + R() * 0.25), W * (3.0 + R() * 1.0), R() * 6.28, R, o); } return s; }
const scalp = (a, rx = 186, ry = 186) => [Math.cos(a) * rx, -24 + Math.sin(a) * ry];
const deg = (d) => d * Math.PI / 180;

export function hdBack(h) { const st = styleOf(h); if (!st || st === 'turban' || st === 'twin' || st === 'twinhigh') return ''; return memo('b', h, () => hdBackI(h, st)); }
function hdBackI(h, st) { const R = rng(11);
  const g = Math.min(1, Math.max(0, h.grow ?? 1)), sh = g >= 0.99 ? 0 : 1 - g;   // pelo ralo: la masa oscura de atras se encoge (sin halo negro)
  const sm = st === 'bob' || st === 'ponyhigh' || st === 'sidepony'; let o = `<ellipse cx="0" cy="${(sm ? -44 : -24) - 50 * sh}" rx="${(st === 'afro' ? 262 : sm ? 214 : 226) - 60 * sh}" ry="${(st === 'afro' ? 258 : sm ? 196 : 232) - 70 * sh}" fill="url(#hdBase)" stroke="${OUT}" stroke-width="${g >= 0.99 ? 8 : 8 * Math.max(0, g - 0.4) / 0.6}"/>`;
  if (st === 'afro') { for (let a = 150; a <= 390; a += 7) o += clump(scalp(deg(a), 200, 200), deg(a), 130 + R() * 50, 0.0009, 22, R, 3); return `<g>${o}</g>`; }
  const hang = st === 'half' ? 0.8 : st === 'side' ? 0.62 : st === 'bob' ? 0.22 : st === 'ponyhigh' ? 0.12 : st === 'sidepony' ? 0.2 : 1;
  for (let a = 150; a <= 215; a += 13) o += clump(scalp(deg(a), 196, 150), lerp(deg(a), Math.PI / 2, 0.6), (200 + R() * 60) * (0.7 + 0.5 * hang) * 0.55, 0.0030, 19, R, 3);
  for (let a = 325; a <= 390; a += 13) o += clump(scalp(deg(a), 196, 150), lerp(deg(a), Math.PI / 2, 0.6), (200 + R() * 60) * (0.7 + 0.5 * hang) * 0.55, 0.0030, 19, R, 3);
  return `<g>${o}</g>`; }

export function hdTop(h, yaw = 0) { const st = styleOf(h); if (!st) return ''; if (st === 'turban') return turban(h); if (st === 'twin' || st === 'twinhigh') return memo('t', h, () => twinTop(h, st)); return memo('t', h, () => hdTopI(h, st)); }
function hdTopI(h, st) { const R = rng(23);
  const cap = (m) => `<path d="M0,-218 C${m * 140},-218 ${m * 218},-146 ${m * 212},-24 C${m * 208},8 ${m * 204},30 ${m * 198},48 C${m * 194},-34 ${m * 154},-100 ${m * 92},-134 C${m * 52},-152 ${m * 20},-162 0,-178Z" fill="url(#hdBase)" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>`;
  let o = `<g>${cap(-1)}${cap(1)}`;
  const part = st === 'side' ? -0.32 : 0;           // posicion de la raya (-1..1 sobre el arco)
  // bloques de rizos del nacimiento del pelo hacia la coronilla, saliendo hacia afuera y cayendo
  const ringA = (a0, a1, step, rx, ry, L, g, W, n) => { for (let a = a0; a <= a1; a += step) { const aa = deg(a + (R() - 0.5) * 6); const flow = st === 'afro' ? 0.25 : 0.6; o += clump(scalp(aa, rx, ry), aa + (a < 270 ? -1 : 1) * flow * (0.55 + 0.45 * Math.abs(Math.cos(aa))), L * (0.8 + R() * 0.4), g, W * (0.85 + R() * 0.3), R, n); } };
  if (st === 'afro') { ringA(160, 380, 7, 208, 206, 170, 0.0012, 22, 3); ringA(172, 368, 9, 178, 176, 140, 0.0012, 19, 3); }
  else if (st === 'half') { ringA(160, 380, 9, 206, 204, 200, 0.0030, 19, 3); ringA(176, 364, 11, 178, 176, 160, 0.0028, 17, 3); }
  else if (st === 'side') { ringA(160, 380, 8, 206, 204, 240, 0.0030, 19, 3); ringA(176, 364, 10, 176, 172, 200, 0.0028, 17, 3); }
  else if (st === 'bob') { ringA(160, 380, 8, 206, 204, 150, 0.0030, 20, 3); ringA(176, 364, 10, 176, 172, 120, 0.0028, 18, 3); }
  else if (st === 'ponyhigh') { ringA(160, 380, 8, 206, 204, 70, 0.0012, 18, 3); ringA(176, 364, 10, 176, 172, 50, 0.0012, 16, 3); }
  else if (st === 'sidepony') { ringA(160, 380, 8, 206, 204, 90, 0.0020, 18, 3); ringA(176, 364, 10, 176, 172, 70, 0.0018, 16, 3); }
  else if (st === 'vol') { ringA(160, 380, 7, 214, 212, 250, 0.0034, 22, 3); ringA(170, 370, 8, 190, 188, 220, 0.0030, 20, 3); ringA(180, 360, 10, 160, 158, 180, 0.0028, 18, 3); }
  else { ringA(160, 380, 8, 206, 204, 260, 0.0030, 19, 3); ringA(176, 364, 10, 176, 172, 210, 0.0028, 17, 3); }
  // raya
  if (st !== 'afro') o += `<path d="M${st === 'side' ? -62 : 0},-198 q${st === 'side' ? 10 : 0},22 ${st === 'side' ? 28 : 0},46" stroke="#b07a54" stroke-width="7" stroke-linecap="round" opacity="0.9"/>`;
  // frente limpia: linea de nacimiento difuminada + rizos que barren hacia los lados (sienes) en vez de caer sobre la frente
  o += `<path d="M-130,-114 C-100,-130 -60,-148 -30,-160 C-14,-166 0,-172 0,-178 C0,-172 14,-166 30,-160 C60,-148 100,-130 130,-114" stroke="#1a0f0b" stroke-width="14" fill="none" opacity="0.32" filter="url(#blur8)"/>`;
  // (sin rizos sobre las sienes: la cara queda despejada junto a los ojos)
  if (st === 'half') { // pompon de rizos arriba y liga dorada
    for (let a = 200; a <= 340; a += 14) { const aa = deg(a); o += clump([Math.cos(aa) * 30, -232], aa, 150, 0.0052, 24, R, 3); }
    o += `<g transform="translate(0,-232)"><ellipse rx="92" ry="21" fill="url(#hdGold)" stroke="${OUT}" stroke-width="6"/><ellipse cx="-14" cy="-6" rx="56" ry="6" fill="#fff" opacity="0.5"/>${[-54, -27, 0, 27, 54].map((x) => `<circle cx="${x}" cy="3" r="5" fill="#fff6c8" stroke="${OUT}" stroke-width="2"/>`).join('')}</g>`; }

  if (st === 'ponyhigh') { // coleta alta: cascada de rizos que cae por detras/derecha, con liga dorada y perlas
    for (let a = 205; a <= 335; a += 10) { const aa = deg(a); o += clump([Math.cos(aa) * 26, -236], deg(300 + (a - 270) * 0.35), 330 + R() * 90, 0.0016, 24, R, 3); }
    for (let a = 215; a <= 325; a += 14) { const aa = deg(a); o += clump([Math.cos(aa) * 22, -238], deg(255 + (a - 270) * 0.3), 260 + R() * 80, 0.0014, 22, R, 3); }
    o += `<g transform="translate(0,-238)"><ellipse rx="70" ry="18" fill="url(#hdGold)" stroke="${OUT}" stroke-width="6"/><ellipse cx="-12" cy="-5" rx="42" ry="5" fill="#fff" opacity="0.5"/>${[-42, -21, 0, 21, 42].map((x) => `<circle cx="${x}" cy="3" r="5" fill="#fff6e8" stroke="${OUT}" stroke-width="2"/>`).join('')}</g>`; }
  if (st === 'sidepony') { // coleta baja lateral sobre el hombro izquierdo con moño de listón
    for (let k = 0; k < 9; k++) o += clump([-150 + k * 4, 40 + k * 6], deg(96 - k * 1.5), 360 + R() * 80, 0.00025, 24, R, 3);
    o += `<g transform="translate(-150,86) rotate(-12)"><path d="M0,0 L-52,-30 Q-64,0 -52,30Z" fill="#c4122a" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M0,0 L52,-30 Q64,0 52,30Z" fill="#c4122a" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M-40,-14 L-10,-2 M40,-14 L10,-2" stroke="#ff7080" stroke-width="3" opacity="0.8"/><rect x="-11" y="-13" width="22" height="26" rx="8" fill="#9c0f1c" stroke="${OUT}" stroke-width="5"/></g>`; }
  if (st === 'bob') o += `<g transform="translate(150,-104) rotate(12)"><rect x="-44" y="-8" width="88" height="16" rx="8" fill="url(#hdGold)" stroke="${OUT}" stroke-width="5"/>${[-30, -10, 10, 30].map((x) => `<circle cx="${x}" cy="0" r="9" fill="#fff6ee" stroke="${OUT}" stroke-width="3"/><circle cx="${x - 3}" cy="-3" r="3" fill="#fff" opacity="0.9"/>`).join('')}</g>`;
  if (st === 'vol') o += [[-150, -104, -14], [156, -92, 16]].map(([x, y, r]) => `<g transform="translate(${x},${y}) rotate(${r})"><path d="M0,-26 L8,-8 L28,-6 L12,6 L18,26 L0,14 L-18,26 L-12,6 L-28,-6 L-8,-8Z" fill="url(#hdGold)" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><circle r="5" fill="#fff6c8"/></g>`).join('');
  if (st === 'afro') o += `<g><path d="M-212,-52 Q0,-248 212,-52" stroke="${OUT}" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M-212,-52 Q0,-248 212,-52" stroke="url(#hdGold)" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M-196,-62 Q0,-236 196,-62" stroke="#fff" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round"/>${[-120, -60, 0, 60, 120].map((x, i) => `<g transform="translate(${x},${-151 - (1 - Math.pow(x / 120, 2)) * 18 + (Math.abs(x) > 100 ? 4 : 0)})"><circle r="${i === 2 ? 15 : 10}" fill="${['#34d399', '#f472b6', '#fde68a', '#f472b6', '#34d399'][i]}" stroke="${OUT}" stroke-width="4"/><circle cx="-3" cy="-4" r="3.4" fill="#fff" opacity="0.8"/></g>`).join('')}</g>`;
  return o + '</g>'; }

export function hdFront(h, yaw = 0, t = 0) { const st = styleOf(h); if (!st || st === 'turban') return ''; if (st === 'twin' || st === 'twinhigh') return `<g transform="translate(${yaw * 10},0)">${memo('f', h, () => twinFront(h, st))}</g>`; return `<g transform="translate(${yaw * 10},0)">${memo('f', h, () => hdFrontI(h, st))}</g>`; }
function hdFrontI(h, st) { const R = rng(41), sw = (h.sway || 0), L = clamp(h.len ?? 1); let o = '';
  const sway = (g) => g; void sway;
  if (st === 'afro') { for (const m of [-1, 1]) for (let i = 0; i < 3; i++) o += clump([m * (196 + i * 4), -6 + i * 36], deg(90 - m * 14), 90 + i * 16, 0.0004, 18, R, 2); return o; }
  const ln = (st === 'half' ? 0.74 : st === 'side' ? 0.86 : st === 'bob' ? 0.36 : st === 'ponyhigh' ? 0.1 : st === 'sidepony' ? 0.3 : st === 'vol' ? 0.95 : 1) * (190 + 540 * L) * 0.62;
  for (const m of [-1, 1]) {
    for (let i = 0; i < 5; i++) { const ang = deg(90 - m * (8 + i * 2.2) + sw * 6 * m); o += clump([m * (206 + i * 7), 14 + i * 24], ang, ln * (0.62 + 0.38 * (i / 4)) * (0.9 + R() * 0.2), 0.00012 * (1 + i * 0.2), 18 - i * 0.5, R, 3); }
    for (let i = 0; i < 3; i++) o += clump([m * (214 + i * 3), -20 + i * 22], deg(92 - m * 5), 120 + i * 50, 0.0002, 11, R, 2);
  }
  if (st === 'side') o += `<g transform="translate(150,-92) rotate(14)">${[0, 1, 2, 3, 4].map((i) => `<g transform="rotate(${i * 72})"><ellipse cx="0" cy="-30" rx="21" ry="33" fill="#fb7185" stroke="${OUT}" stroke-width="5"/><ellipse cx="-4" cy="-38" rx="7" ry="14" fill="#fecdd3" opacity="0.7"/></g>`).join('')}<circle r="11" fill="#fde047" stroke="${OUT}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${Math.cos(i * 1.047) * 5}" cy="${Math.sin(i * 1.047) * 5}" r="2" fill="#b45309"/>`).join('')}</g>`;
  return o; }

// pañuelo dorado de satin: domo con pliegues, banda enrollada y nudo con dos lazos
export const turbanSvg = (o = {}) => turban({ tw: o.tw || 0 });
function turban(h) { const w = h.tw || 0;
  const dome = 'M-208,-8 C-216,-150 -122,-266 0,-266 C122,-266 216,-150 208,-8 Q192,-64 122,-98 Q0,-134 -122,-98 Q-192,-64 -208,-8Z';
  const folds = [[-170,-60,-60,-250],[-120,-90,-10,-262],[-60,-108,50,-262],[0,-116,110,-250],[60,-112,160,-210],[110,-98,190,-150]].map(([x0,y0,x1,y1],i)=>`<path d="M${x0},${y0} Q${(x0+x1)/2 + (i%2?-24:24)},${(y0+y1)/2 + 8} ${x1},${y1}" stroke="${i%2?'#7a4f12':'#fff6c8'}" stroke-width="${i%2?7:5}" fill="none" stroke-linecap="round" opacity="${i%2?0.45:0.55}"/>`).join('');
  return `<g><defs><linearGradient id="tbG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4d36a"/><stop offset="0.45" stop-color="#c8922e"/><stop offset="1" stop-color="#6e460f"/></linearGradient></defs>
  <path d="${dome}" fill="url(#tbG)" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/>${folds}
  <path d="M-196,-30 Q-120,-70 0,-122 Q120,-70 196,-30" stroke="${OUT}" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M-196,-30 Q-120,-70 0,-122 Q120,-70 196,-30" stroke="#c89430" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M-188,-40 Q-120,-80 0,-134 Q120,-80 188,-40" stroke="#fff6c8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"/>
  <g transform="translate(84,-168) rotate(${-18 + w * 6})"><path d="M0,0 C-30,-40 -78,-34 -70,6 C-66,36 -22,24 0,0Z" fill="url(#tbG)" stroke="${OUT}" stroke-width="6"/><path d="M0,0 C30,-44 78,-40 70,2 C64,34 24,24 0,0Z" fill="url(#tbG)" stroke="${OUT}" stroke-width="6"/><circle r="17" fill="#d9a83e" stroke="${OUT}" stroke-width="6"/><path d="M-6,-8 Q4,-14 8,-4" stroke="#fff6c8" stroke-width="4" fill="none" stroke-linecap="round"/></g>
  <circle cx="-120" cy="-150" r="5" fill="#fff6c8"/><circle cx="40" cy="-224" r="4" fill="#fff"/><circle cx="130" cy="-170" r="4.5" fill="#fff6c8"/></g>`; }

// demostracion para inserts: un mechon grande que pasa de liso a rizo (cp 0..1) con textura completa
export function demoLock(x, y, len, W, cp, ph = 0, ang = Math.PI / 2, g = 0.0004) { CUR = { cp, bounce: 0, wind: 0, grow: 1 }; const R = rng(5 + Math.round(ph * 10));
  const sp = spine([x, y], ang, len / (1 + 0.45 * (1 - cp)) / (0.5 + 0.5), g, R, 6);
  return lock(sp, W, W * 0.62, W * 3.2, ph, R, { taper: 0.25 }); }

// ---- coletas: casquete liso con raya central, rizos barridos hacia las coletas, y dos coletas rizadas con liga ----
function twinTop(h, st) { const R = rng(31); const cap = (m) => `<path d="M0,-218 C${m * 140},-218 ${m * 218},-146 ${m * 212},-24 C${m * 208},8 ${m * 204},30 ${m * 198},48 C${m * 194},-34 ${m * 154},-100 ${m * 92},-134 C${m * 52},-152 ${m * 20},-162 0,-178Z" fill="url(#hdBase)" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>`;
  let o = `<g>${cap(-1)}${cap(1)}`;
  // hebras largas y brillantes barridas desde la raya hacia atras-lateral (pelo recogido)
  for (const m of [-1, 1]) for (let i = 0; i < 9; i++) { const u = i / 8, a = deg(lerp(-86, -8, u)) * 1; const sx = m * 8, sy = -186 + u * 6; const ex = m * lerp(60, 205, u), ey = lerp(-150, -64, u * u);
    o += `<path d="M${sx},${sy} Q${m * lerp(30, 140, u)},${lerp(-196, -150, u)} ${ex},${ey}" stroke="${OUT}" stroke-width="13" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M${sx},${sy} Q${m * lerp(30, 140, u)},${lerp(-196, -150, u)} ${ex},${ey}" stroke="#2a1d17" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M${sx},${sy - 2} Q${m * lerp(30, 140, u)},${lerp(-198, -152, u)} ${ex},${ey - 2}" stroke="#a87a54" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.6"/>`; }
  o += `<path d="M0,-198 L0,-168" stroke="#b07a54" stroke-width="7" stroke-linecap="round" opacity="0.9"/>`;
  // rizos sueltos delante de las orejas y en la linea de nacimiento (pequenos)
  for (const m of [-1, 1]) for (let i = 0; i < 3; i++) { const sp = spine([m * (182 + i * 4), -86 + i * 22], deg(90 - m * 12), 60 + i * 16, 0.0006, R, 3); o += lock(sp, 9, 6.5, 22, R() * 6, R, { taper: 0.3 }); }
  return o + '</g>'; }
function twinFront(h, st) { const R = rng(37); let o = ''; const high = st === 'twinhigh';
  for (const m of [-1, 1]) { const tx = m * (high ? 176 : 206), ty = high ? -134 : -52; const base = deg(90 + m * (high ? -62 : -26));
    // masa trasera de la coleta
    for (let k = 0; k < 11; k++) { const a = base + m * (k - 5) * 0.09; o += clump([tx + m * (k - 5) * 3.4, ty], a, (high ? 270 : 300) * (0.85 + R() * 0.25), high ? 0.0046 : 0.0028, 22, R, 3); }
    // liga/scrunchie
    o += `<g transform="translate(${tx},${ty}) rotate(${m * 20})"><ellipse rx="30" ry="22" fill="url(#hdScr)" stroke="${OUT}" stroke-width="6"/>${[-18, -6, 6, 18].map((x) => `<path d="M${x},-17 Q${x + 6},0 ${x},17" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.5"/>`).join('')}<ellipse cx="-8" cy="-8" rx="10" ry="4" fill="#fff" opacity="0.5"/></g>`; }
  return o; }
