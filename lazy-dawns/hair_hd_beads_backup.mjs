// Pelo rizado HD de Lazy: rizos en espiral (cadenas de "cuentas" con volumen), raiz sombreada, brillo calido, mechones de cara y baby hairs.
// Estilos: 'long' (suelto definido), 'half' (media coleta alta), 'afro' (halo 4A con diadema), 'side' (raya lateral, flequillo rizado y flor).
const OUT = '#12090a';
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const f1 = (n) => n.toFixed(1);
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
export const hdDefs = (h) => { const hi = h.hdHi || '#c98f5c';
  return `<radialGradient id="hdB" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stop-color="#4a362e"/><stop offset="0.55" stop-color="#241a16"/><stop offset="1" stop-color="#0b0706"/></radialGradient>
  <radialGradient id="hdBase" cx="0.4" cy="0.3" r="0.9"><stop offset="0" stop-color="#2e221d"/><stop offset="0.6" stop-color="#150f0d"/><stop offset="1" stop-color="#070404"/></radialGradient>
  <linearGradient id="hdHi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="#fff2d8"/></linearGradient>
  <linearGradient id="hdGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.5" stop-color="#d4a24c"/><stop offset="1" stop-color="#8a5f1c"/></linearGradient>`; };
// cuentas: contorno comun, relleno con volumen, sombra inferior, brillo en medialuna
function beads(arr, hiK = 1) { let o = '', f = '', s = '', hl = '';
  for (const [x, y, r] of arr) { o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 4.2)}"/>`; f += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#hdB)"/>`;
    s += `<ellipse cx="${f1(x + r * 0.22)}" cy="${f1(y + r * 0.34)}" rx="${f1(r * 0.78)}" ry="${f1(r * 0.52)}" fill="#050303" opacity="0.38"/>`;
    const rot = (((Math.abs(Math.round(x * 13 + y * 7)) % 90) - 45) * 1.1), len = 0.7 + ((Math.abs(Math.round(x * 5 + y * 11)) % 10) / 10) * 0.6;
    hl += `<path transform="rotate(${f1(rot)} ${f1(x)} ${f1(y)})" d="M${f1(x - r * 0.6 * len)},${f1(y + r * 0.0)} A${f1(r * 0.66)},${f1(r * 0.66)} 0 0 1 ${f1(x + r * 0.05)},${f1(y - r * 0.6 * len)}" stroke="url(#hdHi)" stroke-width="${f1(Math.max(1.6, r * 0.2))}" fill="none" stroke-linecap="round" opacity="${0.5 * hiK}"/>`; }
  return `<g fill="${OUT}">${o}</g>${f}${s}${hl}`; }
function ringlet(x0, y0, len, m, o = {}) { const { r0 = 15, r1 = 8, amp = 0.75, drift = 0, ph = 0, sw = 0, t = 0, i = 0, pitch = 3.4 } = o;
  const n = Math.max(5, Math.round(len / (r0 * 1.05))), pts = [];
  for (let j = 0; j <= n; j++) { const u = j / n, r = lerp(r0, r1, Math.pow(u, 0.8)); const a = Math.sin(u * len / (r0 * pitch) * Math.PI * 2 + ph) * r0 * amp * (0.55 + 0.45 * u);
    pts.push([x0 + m * drift * u + a + sw * m * 22 * u * u + Math.sin(t * 1.3 + i) * 3 * u * u, y0 + len * u * 0.97 + Math.cos(u * len / (r0 * pitch) * Math.PI * 2 + ph) * r0 * 0.18, r]); }
  return pts; }
const arcPts = (cx, cy, rx, ry, a0, a1, n, rr, jit, R) => { const p = []; for (let i = 0; i < n; i++) { const a = lerp(a0, a1, n === 1 ? 0.5 : i / (n - 1)) * Math.PI / 180; p.push([cx + Math.cos(a) * rx + (R() - 0.5) * jit, cy + Math.sin(a) * ry + (R() - 0.5) * jit, rr * (0.85 + R() * 0.35)]); } return p; };
const styleOf = (h) => h.hd === true ? 'long' : h.hd;

// ---- detras de la cabeza: masa de volumen + rizos que asoman por los lados ----
export function hdBack(h) { const st = styleOf(h); if (!st) return ''; const R = rng(11), sw = h.sway || 0;
  let b = [];
  if (st === 'afro') { b = [...arcPts(0, -20, 270, 262, 150, 390, 44, 46, 14, R), ...arcPts(0, -20, 232, 228, 160, 380, 36, 40, 12, R)]; return `<g><ellipse cx="0" cy="-20" rx="262" ry="258" fill="url(#hdBase)" stroke="${OUT}" stroke-width="8"/>${beads(b)}</g>`; }
  b = [...arcPts(0, -30, 236, 236, 170, 370, 30, 42, 14, R)];
  const hang = []; for (const m of [-1, 1]) for (let i = 0; i < 6; i++) hang.push(...ringlet(m * (200 + i * 14), 0 + i * 30, 290 + i * 34, m, { r0: 20, r1: 11, drift: m * 14, ph: i * 1.3, sw, i }));
  return `<g><ellipse cx="0" cy="-26" rx="226" ry="232" fill="url(#hdBase)" stroke="${OUT}" stroke-width="8"/>${beads(hang)}${beads(b)}</g>`; }

// ---- encima de la cabeza: casquete con raya, hileras de rizos, baby hairs, accesorios de cabeza ----
export function hdTop(h, yaw = 0) { const st = styleOf(h); if (!st) return ''; const R = rng(23);
  const cap = (m, w = 1) => `<path d="M0,-218 C${m * 140 * w},-218 ${m * 218},-146 ${m * 212},-24 C${m * 208},8 ${m * 204},30 ${m * 198},48 C${m * 194},-34 ${m * 154},-100 ${m * 92},-134 C${m * 52},-152 ${m * 20},-162 0,-178Z" fill="url(#hdBase)" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>`;
  const sideSplit = st === 'side' ? 0.55 : 0;
  let o = `<g>${cap(-1)}${cap(1)}`;
  // hileras de rizos que siguen la silueta del cuero cabelludo (de afuera hacia el centro, de atras hacia adelante)
  const rows = []; const row = (rx, ry, cy, a0, a1, n, rr, j) => rows.push(...arcPts(0, cy, rx, ry, a0, a1, n, rr, j, R));
  if (st === 'afro') { row(240, 240, -28, 164, 376, 26, 40, 18); row(206, 206, -30, 174, 366, 21, 36, 14); row(170, 168, -34, 186, 354, 16, 30, 10); }
  else if (st === 'half') { row(232, 228, -24, 168, 372, 22, 42, 20); row(198, 194, -30, 184, 356, 16, 36, 14); }
  else if (st === 'side') { row(236, 232, -24, 166, 374, 22, 44, 22); row(202, 198, -30, 180, 360, 17, 38, 16); }
  else { row(236, 232, -24, 168, 372, 22, 44, 22); row(204, 198, -30, 178, 362, 18, 40, 18); row(168, 160, -44, 198, 342, 13, 30, 12); }
  o += beads(rows, 0.7);
  // raya (cuero cabelludo visible)
  const px = st === 'side' ? -64 : 0;
  if (st !== 'afro') o += `<path d="M${px},-196 q${st === 'side' ? 6 : 0},22 ${st === 'side' ? 22 : 0},42" stroke="#b07a54" stroke-width="7" stroke-linecap="round" opacity="0.9"/>`;
  // linea frontal de baby hairs: rizos diminutos en espiral
  const baby = []; for (let i = 0; i < 16; i++) { const u = i / 15, a = lerp(205, 335, u) * Math.PI / 180, x = Math.cos(a) * 176, y = -128 + Math.pow(Math.abs(u - 0.5) * 2, 2.2) * 44 - (1 - Math.abs(u - 0.5) * 2) * 30;
    const a2 = R() * 6; baby.push([x, y, 6 + R() * 3.5], [x + (R() - 0.5) * 14, y + 9 + R() * 6, 4.5 + R() * 2.4], [x + (R() - 0.5) * 18, y + 18 + R() * 7, 3.5 + R() * 1.6]); void a2; }
  o += beads(baby, 0.5);
  // accesorios
  if (st === 'half') { const pf = [...arcPts(0, -262, 80, 40, 180, 360, 9, 36, 10, R), ...arcPts(0, -292, 56, 26, 190, 350, 7, 32, 8, R), [0, -250, 40]]; const pv = [...ringlet(-24, -250, 120, -1, { r0: 17, r1: 10, ph: 0, drift: -40 }), ...ringlet(30, -250, 130, 1, { r0: 17, r1: 10, ph: 2, drift: 44 })];
    o += beads(pv) + beads(pf) + `<g transform="translate(0,-236)"><ellipse rx="86" ry="20" fill="url(#hdGold)" stroke="${OUT}" stroke-width="6"/><ellipse cx="-14" cy="-5" rx="52" ry="6" fill="#fff" opacity="0.5"/>${[-52, -26, 0, 26, 52].map((x) => `<circle cx="${x}" cy="3" r="5" fill="#fff6c8" stroke="${OUT}" stroke-width="2"/>`).join('')}</g>`; }
  if (st === 'afro') o += `<g><path d="M-212,-52 Q0,-248 212,-52" stroke="${OUT}" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M-212,-52 Q0,-248 212,-52" stroke="url(#hdGold)" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M-196,-62 Q0,-236 196,-62" stroke="#fff" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round"/>${[-120, -60, 0, 60, 120].map((x, i) => `<g transform="translate(${x},${-151 - (1 - Math.pow(x / 120, 2)) * 18 + (Math.abs(x) > 100 ? 4 : 0)})"><circle r="${i === 2 ? 15 : 10}" fill="${['#34d399', '#f472b6', '#fde68a', '#f472b6', '#34d399'][i]}" stroke="${OUT}" stroke-width="4"/><circle cx="-3" cy="-4" r="3.4" fill="#fff" opacity="0.8"/></g>`).join('')}</g>`;
  if (st === 'side') { const fl = [...ringlet(-88, -176, 190, -1, { r0: 14, r1: 8, drift: -60, ph: 1, pitch: 3 }), ...ringlet(-40, -190, 170, -1, { r0: 13, r1: 8, drift: -22, ph: 2.3, pitch: 3 })]; o += beads(fl); }
  return o + '</g>'; }

// ---- delante del cuerpo: rizos que caen sobre hombros y mechones de cara ----
export function hdFront(h, yaw = 0, t = 0) { const st = styleOf(h); if (!st) return ''; const R = rng(41), sw = h.sway || 0; const L = clamp(h.len ?? 1);
  let o = ''; const add = (pts) => { o += beads(pts); };
  const lenOf = (k) => (190 + 520 * L) * k;
  if (st === 'afro') { // sin largo: rizos cortos tipo coils al frente de las orejas y en las sienes
    for (const m of [-1, 1]) for (let i = 0; i < 4; i++) add(ringlet(m * (196 + i * 10), -10 + i * 36, 70 + i * 16, m, { r0: 15, r1: 9, drift: m * 16, ph: i * 1.7, sw, t, i })); return `<g transform="translate(${yaw * 10},0)">${o}</g>`; }
  const sets = st === 'half' ? { n: 5, ln: 0.78 } : st === 'side' ? { n: 6, ln: 0.95 } : { n: 7, ln: 1 };
  for (const m of [-1, 1]) {
    for (let i = 0; i < sets.n; i++) { const k = 0.7 + 0.3 * R(); const len = lenOf(sets.ln * (0.55 + 0.45 * (i / (sets.n - 1))) * k) - 20;
      add(ringlet(m * (214 + i * 12 - (i % 2) * 8), 18 + i * 20, len, m, { r0: 19 - i * 0.6, r1: 10, drift: m * (6 + i * 6), ph: i * 1.5 + (m > 0 ? 0.9 : 0), sw, t, i })); }
    // mechones de cara (cortos, en espiral, sobre la mejilla)
    for (let i = 0; i < 3; i++) add(ringlet(m * (192 - i * 4), -20 + i * 18, 110 + i * 40, m, { r0: 13, r1: 7, drift: m * (-4 + i * 4), ph: i * 2.1 + 0.6, sw, t, i, amp: 0.8, pitch: 3 }));
  }
  if (st === 'side') { // flor sobre la oreja derecha
    const fl = `<g transform="translate(150,-92) rotate(14)">${[0, 1, 2, 3, 4].map((i) => `<g transform="rotate(${i * 72})"><ellipse cx="0" cy="-30" rx="21" ry="33" fill="#fb7185" stroke="${OUT}" stroke-width="5"/><ellipse cx="-4" cy="-38" rx="7" ry="14" fill="#fecdd3" opacity="0.7"/></g>`).join('')}<circle r="11" fill="#fde047" stroke="${OUT}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${Math.cos(i * 1.047) * 5}" cy="${Math.sin(i * 1.047) * 5}" r="2" fill="#b45309"/>`).join('')}</g>`; o += fl; }
  return `<g transform="translate(${yaw * 10},0)">${o}</g>`; }
