// Pelo rizado HD v2: mechones CONECTADOS. Cada rizo es una helice (zigzag adelante/atras) a lo largo de una "espina" que sale del cuero cabelludo,
// se curva por gravedad y se agrupa en clumps. Textura: contorno, base, sombra inferior, brillo por direccion de luz, hebras finas.
// Investigado: los rizos se dibujan como helice (la parte de atras queda oculta), el pelo crece en bloques (clumps) del nacimiento a la coronilla, la parte de abajo
// de cada rizo va mas oscura y la de arriba mas clara, y hay que variar tamano/paso para que no parezca peluca.
const OUT = '#12090a';
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const f1 = (n) => n.toFixed(1);
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
export const hdDefs = (h) => `<radialGradient id="hdBase" cx="0.4" cy="0.3" r="0.9"><stop offset="0" stop-color="#2e221d"/><stop offset="0.6" stop-color="#150f0d"/><stop offset="1" stop-color="#070404"/></radialGradient>
  <linearGradient id="hdGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.5" stop-color="#d4a24c"/><stop offset="1" stop-color="#8a5f1c"/></linearGradient>`;
const LIGHT = [-0.55, -0.83];
const styleOf = (h) => h.hd === true ? 'long' : h.hd;

// espina: nace en p0, sale en direccion ang, y la gravedad la curva hacia abajo
function spine(p0, ang, L, g, R, step = 5) { const dx = Math.cos(ang), dy = Math.sin(ang), ph = R() * 6, wob = (R() - 0.5) * 0.5; const pts = [];
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

function lock(spn, W0, A, pitch, ph, R, o = {}) { const { P, D, U } = helix(spn, A, pitch, ph, o.taper ?? 0.4); let s = '';
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

export function hdBack(h) { const st = styleOf(h); if (!st) return ''; const R = rng(11);
  let o = `<ellipse cx="0" cy="-24" rx="${st === 'afro' ? 262 : 226}" ry="${st === 'afro' ? 258 : 232}" fill="url(#hdBase)" stroke="${OUT}" stroke-width="8"/>`;
  if (st === 'afro') { for (let a = 150; a <= 390; a += 7) o += clump(scalp(deg(a), 200, 200), deg(a), 130 + R() * 50, 0.0009, 22, R, 3); return `<g>${o}</g>`; }
  const hang = st === 'half' ? 0.8 : st === 'side' ? 0.62 : 1;
  for (let a = 150; a <= 215; a += 13) o += clump(scalp(deg(a), 196, 150), deg(a) + 0.05, (200 + R() * 60) * (0.7 + 0.5 * hang), 0.0030, 19, R, 3);
  for (let a = 325; a <= 390; a += 13) o += clump(scalp(deg(a), 196, 150), deg(a) - 0.05, (200 + R() * 60) * (0.7 + 0.5 * hang), 0.0030, 19, R, 3);
  return `<g>${o}</g>`; }

export function hdTop(h, yaw = 0) { const st = styleOf(h); if (!st) return ''; const R = rng(23);
  const cap = (m) => `<path d="M0,-218 C${m * 140},-218 ${m * 218},-146 ${m * 212},-24 C${m * 208},8 ${m * 204},30 ${m * 198},48 C${m * 194},-34 ${m * 154},-100 ${m * 92},-134 C${m * 52},-152 ${m * 20},-162 0,-178Z" fill="url(#hdBase)" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>`;
  let o = `<g>${cap(-1)}${cap(1)}`;
  const part = st === 'side' ? -0.32 : 0;           // posicion de la raya (-1..1 sobre el arco)
  // bloques de rizos del nacimiento del pelo hacia la coronilla, saliendo hacia afuera y cayendo
  const ringA = (a0, a1, step, rx, ry, L, g, W, n) => { for (let a = a0; a <= a1; a += step) { const aa = deg(a + (R() - 0.5) * 6); const flow = st === 'afro' ? 0.25 : 0.95; o += clump(scalp(aa, rx, ry), aa + (a < 270 ? -1 : 1) * flow * (0.55 + 0.45 * Math.abs(Math.cos(aa))), L * (0.8 + R() * 0.4), g, W * (0.85 + R() * 0.3), R, n); } };
  if (st === 'afro') { ringA(160, 380, 7, 208, 206, 170, 0.0012, 22, 3); ringA(172, 368, 9, 178, 176, 140, 0.0012, 19, 3); }
  else if (st === 'half') { ringA(160, 380, 9, 206, 204, 200, 0.0030, 19, 3); ringA(176, 364, 11, 178, 176, 160, 0.0028, 17, 3); }
  else if (st === 'side') { ringA(160, 380, 8, 206, 204, 240, 0.0030, 19, 3); ringA(176, 364, 10, 176, 172, 200, 0.0028, 17, 3); }
  else { ringA(160, 380, 8, 206, 204, 260, 0.0030, 19, 3); ringA(176, 364, 10, 176, 172, 210, 0.0028, 17, 3); }
  // raya
  if (st !== 'afro') o += `<path d="M${st === 'side' ? -62 : 0},-198 q${st === 'side' ? 10 : 0},22 ${st === 'side' ? 28 : 0},46" stroke="#b07a54" stroke-width="7" stroke-linecap="round" opacity="0.9"/>`;
  // baby hairs: mini rizos en espiral sobre la frente
  for (let i = 0; i < 18; i++) { const u = i / 17, a = deg(lerp(206, 334, u)), x = Math.cos(a) * 178, y = -126 + Math.pow(Math.abs(u - 0.5) * 2, 2.2) * 40 - (1 - Math.abs(u - 0.5) * 2) * 28;
    const sp = spine([x, y], deg(90 + (u - 0.5) * 60), 26 + R() * 16, 0.0, R, 3); o += lock(sp, 5.5, 4.2, 15, R() * 6, R, { taper: 0.2 }); }
  if (st === 'half') { // pompon de rizos arriba y liga dorada
    for (let a = 200; a <= 340; a += 14) { const aa = deg(a); o += clump([Math.cos(aa) * 30, -232], aa, 150, 0.0052, 24, R, 3); }
    o += `<g transform="translate(0,-232)"><ellipse rx="92" ry="21" fill="url(#hdGold)" stroke="${OUT}" stroke-width="6"/><ellipse cx="-14" cy="-6" rx="56" ry="6" fill="#fff" opacity="0.5"/>${[-54, -27, 0, 27, 54].map((x) => `<circle cx="${x}" cy="3" r="5" fill="#fff6c8" stroke="${OUT}" stroke-width="2"/>`).join('')}</g>`; }
  if (st === 'afro') o += `<g><path d="M-212,-52 Q0,-248 212,-52" stroke="${OUT}" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M-212,-52 Q0,-248 212,-52" stroke="url(#hdGold)" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M-196,-62 Q0,-236 196,-62" stroke="#fff" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round"/>${[-120, -60, 0, 60, 120].map((x, i) => `<g transform="translate(${x},${-151 - (1 - Math.pow(x / 120, 2)) * 18 + (Math.abs(x) > 100 ? 4 : 0)})"><circle r="${i === 2 ? 15 : 10}" fill="${['#34d399', '#f472b6', '#fde68a', '#f472b6', '#34d399'][i]}" stroke="${OUT}" stroke-width="4"/><circle cx="-3" cy="-4" r="3.4" fill="#fff" opacity="0.8"/></g>`).join('')}</g>`;
  return o + '</g>'; }

export function hdFront(h, yaw = 0, t = 0) { const st = styleOf(h); if (!st) return ''; const R = rng(41), sw = (h.sway || 0), L = clamp(h.len ?? 1); let o = '';
  const sway = (g) => g; void sway;
  if (st === 'afro') { for (const m of [-1, 1]) for (let i = 0; i < 3; i++) o += clump([m * (196 + i * 4), -6 + i * 36], deg(90 - m * 14), 90 + i * 16, 0.0004, 18, R, 2); return `<g transform="translate(${yaw * 10},0)">${o}</g>`; }
  const ln = (st === 'half' ? 0.74 : st === 'side' ? 0.86 : 1) * (190 + 540 * L);
  for (const m of [-1, 1]) {
    for (let i = 0; i < 5; i++) { const ang = deg(90 - m * (8 + i * 2.2) + sw * 6 * m); o += clump([m * (206 + i * 7), 14 + i * 24], ang, ln * (0.62 + 0.38 * (i / 4)) * (0.9 + R() * 0.2), 0.00012 * (1 + i * 0.2), 18 - i * 0.5, R, 3); }
    for (let i = 0; i < 3; i++) o += clump([m * (190 - i * 4), -46 + i * 22], deg(92 - m * 4), 120 + i * 50, 0.0002, 11, R, 2);
  }
  if (st === 'side') o += `<g transform="translate(150,-92) rotate(14)">${[0, 1, 2, 3, 4].map((i) => `<g transform="rotate(${i * 72})"><ellipse cx="0" cy="-30" rx="21" ry="33" fill="#fb7185" stroke="${OUT}" stroke-width="5"/><ellipse cx="-4" cy="-38" rx="7" ry="14" fill="#fecdd3" opacity="0.7"/></g>`).join('')}<circle r="11" fill="#fde047" stroke="${OUT}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${Math.cos(i * 1.047) * 5}" cy="${Math.sin(i * 1.047) * 5}" r="2" fill="#b45309"/>`).join('')}</g>`;
  return `<g transform="translate(${yaw * 10},0)">${o}</g>`; }
