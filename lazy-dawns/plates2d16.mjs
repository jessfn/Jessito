// Fondos 2D del dia 16 (sin 3D): capas con texturas procedurales (turbulencia + iluminacion difusa), degradados, sombras y brillos.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, mkdirSync } from 'node:fs';
const W = 1080, H = 1920; mkdirSync('plates2d', { recursive: true });
const FD = '../assets/fonts/'; const ropt = { font: { fontFiles: ['Anton-Regular.ttf', 'Bungee-Regular.ttf', 'Righteous-Regular.ttf'].map((f) => FD + f), loadSystemFonts: true } };
const f = (n) => Math.round(n * 10) / 10;
const rnd = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const TEX = (id, freq, oct, seed, surf = 2, elev = 55, az = 225) => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" result="n"/><feDiffuseLighting in="n" lighting-color="#ffffff" surfaceScale="${surf}" diffuseConstant="1.05"><feDistantLight azimuth="${az}" elevation="${elev}"/></feDiffuseLighting></filter>`;
const DEFS = `<defs>${TEX('plaster', '0.035', 4, 3, 2.4)}${TEX('grain', '0.8', 2, 8, 1.2, 60)}${TEX('wood', '0.012 0.18', 4, 5, 2.4, 50)}${TEX('tilen', '0.12', 3, 11, 1.6)}${TEX('conc', '0.02', 5, 2, 3.2, 40)}
<filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b14"><feGaussianBlur stdDeviation="14"/></filter><filter id="b30"><feGaussianBlur stdDeviation="30"/></filter><filter id="b3"><feGaussianBlur stdDeviation="3"/></filter>
<linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d4dc"/><stop offset="0.55" stop-color="#d4edf0"/><stop offset="1" stop-color="#bfe0e4"/></linearGradient>
<linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd9de"/><stop offset="1" stop-color="#8fa3ab"/></linearGradient>
<linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1030"/><stop offset="0.6" stop-color="#2a2560"/><stop offset="1" stop-color="#7a4a7a"/></linearGradient>
<linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a8590"/><stop offset="0.35" stop-color="#e6edf2"/><stop offset="0.7" stop-color="#aab5bf"/><stop offset="1" stop-color="#5f6a74"/></linearGradient>
<linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b88c"/><stop offset="1" stop-color="#a47a4c"/></linearGradient>
<radialGradient id="gGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="gVig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#050a18" stop-opacity="0.55"/></radialGradient></defs>`;
const tex = (id, x, y, w, h, op = 0.28, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${id})" opacity="${op}" ${extra}/>`;
const OUT = '#12090a';
const plant = (x, y, s = 1) => { const R = rnd(Math.floor(x + y)); let g = `<ellipse cx="${x}" cy="${y + 8 * s}" rx="${70 * s}" ry="${14 * s}" fill="#000" opacity="0.25" filter="url(#b6)"/><path d="M${x - 46 * s},${y - 70 * s} L${x + 46 * s},${y - 70 * s} L${x + 36 * s},${y} L${x - 36 * s},${y}Z" fill="#e9eef2" stroke="${OUT}" stroke-width="4"/><path d="M${x - 40 * s},${y - 56 * s} L${x + 40 * s},${y - 56 * s}" stroke="#bfc9d0" stroke-width="6"/>`; for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i / 13 - 0.5) * 2.2, L = (90 + R() * 80) * s; const ex = x + Math.cos(a) * L, ey = y - 70 * s + Math.sin(a) * L; g += `<path d="M${x},${y - 70 * s} Q${f(x + Math.cos(a) * L * 0.5 + 14 * (R() - 0.5))},${f(y - 70 * s + Math.sin(a) * L * 0.55)} ${f(ex)},${f(ey)} Q${f(x + Math.cos(a) * L * 0.5 + 22)},${f(y - 70 * s + Math.sin(a) * L * 0.5 + 8)} ${x},${y - 70 * s}Z" fill="${i % 3 ? '#2f9a58' : '#46bf78'}" stroke="#14532d" stroke-width="2.4"/>`; } return g; };
// ---------------- CLINICA (interior) ----------------
function clinic() {
  let s = `${DEFS}<rect width="${W}" height="${H}" fill="url(#gWall)"/>${tex('plaster', 0, 0, W, 1250, 0.3)}`;
  // techo + paneles de luz
  s += `<rect width="${W}" height="260" fill="#eef6f8"/><path d="M0,260 L${W},260 L${W},300 L0,300Z" fill="#c9dde2"/>${tex('conc', 0, 0, W, 260, 0.18)}`;
  for (let i = 0; i < 3; i++) { const x = 90 + i * 330; s += `<rect x="${x}" y="70" width="260" height="120" rx="12" fill="#fff"/><rect x="${x}" y="70" width="260" height="120" rx="12" fill="none" stroke="#b7c9cf" stroke-width="5"/><ellipse cx="${x + 130}" cy="260" rx="190" ry="60" fill="url(#gGlow)" opacity="0.55"/>`; }
  // ventana izquierda con ciudad nocturna
  s += `<g><rect x="40" y="340" width="360" height="680" fill="url(#gNight)"/>`; const R = rnd(5); for (let i = 0; i < 12; i++) { const bx = 48 + i * 30, bh = 120 + R() * 280; s += `<rect x="${bx}" y="${1020 - bh}" width="28" height="${bh}" fill="#150f34"/>`; for (let k = 0; k < 9; k++) if (R() > 0.45) s += `<rect x="${bx + 5 + (k % 2) * 12}" y="${1020 - bh + 14 + k * 28}" width="7" height="10" fill="#ffd98a" opacity="${0.5 + R() * 0.5}"/>`; } s += `<ellipse cx="300" cy="420" rx="40" ry="40" fill="#fff6d0" opacity="0.9"/><ellipse cx="300" cy="420" rx="90" ry="90" fill="url(#gGlow)" opacity="0.6"/><rect x="40" y="340" width="360" height="680" fill="url(#gGlow)" opacity="0.08"/>`;
  s += `<path d="M220,340 V1020 M40,680 H400" stroke="#e8f1f4" stroke-width="12"/><rect x="40" y="340" width="360" height="680" fill="none" stroke="#e8f1f4" stroke-width="18"/><rect x="28" y="1020" width="384" height="30" rx="6" fill="#dbe8ec" stroke="${OUT}" stroke-width="4"/></g>`;
  s += `<path d="M400,360 L740,560 L740,1250 L400,1050Z" fill="#cfe9ff" opacity="0.07"/>`;
  // zocalo + pared inferior con panel
  s += `<rect x="0" y="1040" width="${W}" height="210" fill="#8fbfc8"/>${tex('plaster', 0, 1040, W, 210, 0.26)}<path d="M0,1040 H${W}" stroke="#e8f4f6" stroke-width="10"/><path d="M0,1250 H${W}" stroke="#5e8c96" stroke-width="12"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M${i * 135},1050 V1240" stroke="#7aa9b3" stroke-width="3" opacity="0.7"/>`;
  // poster anatomico (rostro) en pared central-derecha
  s += `<g transform="translate(700,440)"><rect x="-120" y="-30" width="240" height="320" rx="10" fill="#f6fbfc" stroke="${OUT}" stroke-width="5"/><ellipse cx="0" cy="120" rx="64" ry="86" fill="#e9c7a6" stroke="${OUT}" stroke-width="4"/><path d="M-60,150 Q-46,214 0,222 Q46,214 60,150" stroke="#d1182f" stroke-width="5" fill="none" stroke-dasharray="10 6"/><path d="M-90,60 L-70,70 M90,60 L70,70 M-90,220 L-52,196 M90,220 L52,196" stroke="#22b8cf" stroke-width="3"/><text x="0" y="-4" font-family="Anton" font-size="24" text-anchor="middle" fill="#0e7490">MANDÍBULA · MAPA</text><circle cx="-70" cy="70" r="6" fill="#22b8cf"/><circle cx="70" cy="70" r="6" fill="#22b8cf"/></g>`;
  // reloj
  s += `<g transform="translate(900,520)"><circle r="54" fill="#fff" stroke="${OUT}" stroke-width="6"/><circle r="46" fill="none" stroke="#d6e4e8" stroke-width="3"/><path d="M0,0 L0,-30 M0,0 L22,10" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/></g>`;
  // repisa con frascos
  s += `<g><rect x="480" y="760" width="440" height="16" rx="6" fill="url(#gWood)" stroke="${OUT}" stroke-width="4"/>${tex('wood', 480, 760, 440, 16, 0.5)}`; const cols = ['#22c6d8', '#f472b6', '#fbbf24', '#a78bfa', '#34d399']; for (let i = 0; i < 9; i++) s += `<rect x="${500 + i * 46}" y="${724 - (i % 3) * 8}" width="28" height="${36 + (i % 3) * 8}" rx="6" fill="${cols[i % 5]}" stroke="${OUT}" stroke-width="3"/><rect x="${506 + i * 46}" y="${718 - (i % 3) * 8}" width="16" height="12" rx="3" fill="#f6f8fb" stroke="${OUT}" stroke-width="2"/><rect x="${504 + i * 46}" y="${736 - (i % 3) * 8}" width="6" height="22" rx="3" fill="#fff" opacity="0.5"/>`; s += `</g>`;
  // piso con perspectiva y brillo
  s += `<rect y="1250" width="${W}" height="${H - 1250}" fill="url(#gFloor)"/>`;
  const vp = [540, 1010]; for (let i = -9; i <= 9; i++) s += `<path d="M${vp[0] + i * 40},1250 L${vp[0] + i * 340},${H}" stroke="#7d8f97" stroke-width="3" opacity="0.7"/>`; let y = 1250, d = 26; while (y < H) { s += `<path d="M0,${f(y)} H${W}" stroke="#7d8f97" stroke-width="3" opacity="0.7"/>`; y += d; d *= 1.22; }
  s += tex('tilen', 0, 1250, W, H - 1250, 0.2) + `<path d="M130,1250 L300,1250 L190,${H} L-120,${H}Z" fill="#fff" opacity="0.1" filter="url(#b14)"/><path d="M500,1250 L760,1250 L900,${H} L420,${H}Z" fill="#fff" opacity="0.08" filter="url(#b14)"/>`;
  s += `<path d="M40,1050 L400,1050 L760,1500 L330,1500Z" fill="#cfe9ff" opacity="0.1" filter="url(#b14)"/>`;
  // carrito de ultrasonido a la derecha
  s += `<g transform="translate(880,1190)"><ellipse cx="0" cy="190" rx="130" ry="20" fill="#000" opacity="0.28" filter="url(#b6)"/><rect x="-70" y="-10" width="140" height="190" rx="14" fill="url(#gMetal)" stroke="${OUT}" stroke-width="5"/><rect x="-52" y="-170" width="104" height="164" rx="12" fill="#0a1622" stroke="${OUT}" stroke-width="5"/><rect x="-44" y="-162" width="88" height="148" rx="8" fill="#062a38"/><path d="M-36,-90 Q-18,-130 0,-90 T36,-90" stroke="#7ff0ea" stroke-width="4" fill="none"/><rect x="-36" y="-60" width="72" height="8" fill="#22c6d8" opacity="0.8"/><circle cx="-40" cy="190" r="14" fill="#222" stroke="${OUT}" stroke-width="4"/><circle cx="40" cy="190" r="14" fill="#222" stroke="${OUT}" stroke-width="4"/><path d="M-50,60 H50 M-50,100 H50" stroke="#5f6a74" stroke-width="3"/></g>`;
  s += plant(120, 1250, 1.2) + plant(1000, 1240, 0.9);
  s += `<rect width="${W}" height="${H}" fill="url(#gVig)"/>`;
  return s; }
// ---------------- PASILLO (perspectiva) ----------------
function hall() {
  const vp = [540, 860]; let s = `${DEFS}<rect width="${W}" height="${H}" fill="#cfe0e6"/>`;
  // pared fondo (ventana grande)
  s += `<rect x="300" y="640" width="480" height="400" fill="url(#gNight)"/>`; const R = rnd(9); for (let i = 0; i < 18; i++) { const bx = 306 + i * 26, bh = 40 + R() * 160; s += `<rect x="${bx}" y="${1040 - bh}" width="22" height="${bh}" fill="#150f34"/>`; for (let k = 0; k < 6; k++) if (R() > 0.5) s += `<rect x="${bx + 4}" y="${1040 - bh + 8 + k * 22}" width="6" height="8" fill="#ffd98a" opacity="0.8"/>`; } s += `<path d="M540,640 V1040 M300,840 H780" stroke="#e8f1f4" stroke-width="10"/><rect x="300" y="640" width="480" height="400" fill="none" stroke="#e8f1f4" stroke-width="14"/>`;
  // paredes laterales
  s += `<path d="M0,0 L300,640 L300,1040 L0,${H}Z" fill="#b6d3da"/><path d="M${W},0 L780,640 L780,1040 L${W},${H}Z" fill="#a8c8d0"/>${tex('plaster', 0, 0, 300, H, 0.3)}${tex('plaster', 780, 0, 300, H, 0.3)}`;
  s += `<path d="M0,0 L300,640 L780,640 L${W},0Z" fill="#e6f0f3"/><path d="M0,${H} L300,1040 L780,1040 L${W},${H}Z" fill="url(#gFloor)"/>${tex('tilen', 0, 1040, W, H - 1040, 0.22)}`;
  // baldosas
  for (let i = -8; i <= 8; i++) s += `<path d="M${vp[0] + i * 28},1040 L${vp[0] + i * 300},${H}" stroke="#7d8f97" stroke-width="3" opacity="0.6"/>`; let y = 1040, d = 24; while (y < H) { s += `<path d="M${f(300 - (y - 1040) * 0.9 > 0 ? 300 - (y - 1040) * 0.9 : 0)},${f(y)} H${f(780 + (y - 1040) * 0.9 < W ? 780 + (y - 1040) * 0.9 : W)}" stroke="#7d8f97" stroke-width="3" opacity="0.6"/>`; y += d; d *= 1.25; }
  // luces del techo
  for (let i = 0; i < 4; i++) { const t = i / 4, yy = 40 + t * 560, w = 520 - t * 400; s += `<rect x="${f(540 - w / 2)}" y="${f(yy)}" width="${f(w)}" height="${f(30 - t * 18)}" rx="6" fill="#fff"/><ellipse cx="540" cy="${f(yy + 80)}" rx="${f(w * 0.7)}" ry="${f(40 - t * 22)}" fill="url(#gGlow)" opacity="0.5"/>`; }
  // puertas laterales
  for (let i = 0; i < 3; i++) { const t0 = i * 0.28, t1 = t0 + 0.2; const xl0 = 300 * t0 * 0 + 0; const k = (t) => 1 - t; const lx = (t) => 300 * t, ly1 = (t) => 640 * t, ly2 = (t) => H - (H - 1040) * t; const a = 0.14 + i * 0.2, b = a + 0.1; const X = (t) => 300 * (t), Y1 = (t) => 640 * t, Y2 = (t) => H - 880 * t;
    s += `<path d="M${f(X(a))},${f(Y1(a) + 160 * (1 - a))} L${f(X(b))},${f(Y1(b) + 130 * (1 - b))} L${f(X(b))},${f(Y2(b) - 40)} L${f(X(a))},${f(Y2(a) - 60)}Z" fill="#7aa9b3" stroke="${OUT}" stroke-width="4"/>`; s += `<path d="M${f(W - X(a))},${f(Y1(a) + 160 * (1 - a))} L${f(W - X(b))},${f(Y1(b) + 130 * (1 - b))} L${f(W - X(b))},${f(Y2(b) - 40)} L${f(W - X(a))},${f(Y2(a) - 60)}Z" fill="#6f9fa9" stroke="${OUT}" stroke-width="4"/>`; }
  // exit
  s += `<g transform="translate(540,560)"><rect x="-60" y="-18" width="120" height="36" rx="6" fill="#16a34a" stroke="${OUT}" stroke-width="4"/><text x="0" y="8" font-family="Anton" font-size="24" text-anchor="middle" fill="#fff">SALIDA</text><ellipse cx="0" cy="0" rx="120" ry="50" fill="#22c55e" opacity="0.25" filter="url(#b14)"/></g>`;
  // extintor en la pared derecha
  s += `<g transform="translate(900,1100)"><ellipse cx="0" cy="170" rx="60" ry="12" fill="#000" opacity="0.25" filter="url(#b6)"/><rect x="-26" y="0" width="52" height="150" rx="16" fill="#e11d48" stroke="${OUT}" stroke-width="4"/><rect x="-10" y="-22" width="20" height="26" fill="#444" stroke="${OUT}" stroke-width="3"/><path d="M10,-14 Q40,-30 36,10" stroke="#222" stroke-width="5" fill="none"/><rect x="-18" y="40" width="36" height="50" rx="6" fill="#fff" opacity="0.9"/></g>`;
  s += `<rect width="${W}" height="${H}" fill="url(#gVig)"/>`; return s; }
// ---------------- ENTRADA (exterior de noche) ----------------
function door() {
  let s = `${DEFS}<rect width="${W}" height="${H}" fill="url(#gNight)"/>`; const R = rnd(4); for (let i = 0; i < 90; i++) s += `<circle cx="${R() * W}" cy="${R() * 700}" r="${0.6 + R() * 1.6}" fill="#fff" opacity="${0.4 + R() * 0.6}"/>`;
  s += `<ellipse cx="860" cy="260" rx="70" ry="70" fill="#fff6d0"/><ellipse cx="860" cy="260" rx="190" ry="190" fill="url(#gGlow)" opacity="0.45"/>`;
  for (let i = 0; i < 14; i++) { const bx = i * 80 - 20, bh = 220 + R() * 420; s += `<rect x="${bx}" y="${1150 - bh}" width="76" height="${bh}" fill="#17123a"/>`; for (let k = 0; k < 14; k++) if (R() > 0.55) s += `<rect x="${bx + 10 + (k % 3) * 20}" y="${1150 - bh + 20 + Math.floor(k / 3) * 36}" width="10" height="16" fill="#ffd98a" opacity="${0.4 + R() * 0.6}"/>`; }
  // fachada
  s += `<rect x="0" y="720" width="${W}" height="520" fill="#eaf4f7"/>${tex('conc', 0, 720, W, 520, 0.32)}<rect x="0" y="700" width="${W}" height="34" fill="#9bb9c2"/>`;
  s += `<rect x="150" y="760" width="780" height="120" rx="18" fill="#08121e" stroke="#7ff0ea" stroke-width="6"/><text x="540" y="846" font-family="Bungee" font-size="76" text-anchor="middle" fill="#9ffaf4" letter-spacing="3">CLÍNICA AURORA</text><rect x="150" y="760" width="780" height="120" rx="18" fill="#22c6d8" opacity="0.14" filter="url(#b14)"/>`;
  // puerta de vidrio
  s += `<rect x="300" y="900" width="480" height="340" fill="#0d2a38"/><rect x="300" y="900" width="240" height="340" fill="#7ff0ea" opacity="0.16"/><rect x="540" y="900" width="240" height="340" fill="#7ff0ea" opacity="0.1"/><path d="M540,900 V1240" stroke="#cfe9ef" stroke-width="10"/><rect x="300" y="900" width="480" height="340" fill="none" stroke="#cfe9ef" stroke-width="14"/><path d="M340,940 L420,1240 M420,940 L500,1240" stroke="#fff" stroke-width="12" opacity="0.1"/>`;
  s += `<rect x="150" y="900" width="120" height="340" fill="#0d2a38" stroke="#cfe9ef" stroke-width="10"/><rect x="810" y="900" width="120" height="340" fill="#0d2a38" stroke="#cfe9ef" stroke-width="10"/>`;
  // banqueta y calle
  s += `<rect y="1240" width="${W}" height="${H - 1240}" fill="#40384a"/>${tex('conc', 0, 1240, W, H - 1240, 0.35)}<rect y="1240" width="${W}" height="120" fill="#6b6478"/><path d="M0,1360 H${W}" stroke="#2a2434" stroke-width="10"/>`;
  for (let i = 0; i < 6; i++) s += `<path d="M${i * 190},1360 L${i * 190 + 60},${H}" stroke="#2a2434" stroke-width="3" opacity="0.5"/>`;
  s += `<ellipse cx="540" cy="1340" rx="420" ry="40" fill="#7ff0ea" opacity="0.18" filter="url(#b14)"/>`;
  // farolas
  for (const x of [70, 1010]) s += `<g><rect x="${x - 6}" y="760" width="12" height="520" fill="#1c1a22"/><ellipse cx="${x}" cy="760" rx="26" ry="16" fill="#ffd98a"/><ellipse cx="${x}" cy="770" rx="140" ry="120" fill="url(#gGlow)" opacity="0.4"/></g>`;
  s += plant(240, 1250, 1) + plant(860, 1250, 1) + `<rect width="${W}" height="${H}" fill="url(#gVig)"/>`; return s; }
for (const [n, fn] of [['clinic16', clinic], ['hall16', hall], ['door16', door]]) { const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn()}</svg>`; writeFileSync(`plates2d/${n}.png`, new Resvg(svg, ropt).render().asPng()); console.log('ok', n); }
