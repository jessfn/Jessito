// Fondos 2D del dia 18 (sin 3D): capas con texturas procedurales (turbulencia + iluminacion difusa), degradados, sombras y brillos.
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


// ---------------- PUERTA DE LA CASA DE LAZY (noche) ----------------
function door() {
  let s = `${DEFS}<rect width="${W}" height="${H}" fill="url(#gNight)"/>`; const R = rnd(41);
  for (let i = 0; i < 100; i++) s += `<circle cx="${f(R() * W)}" cy="${f(R() * 560)}" r="${f(0.6 + R() * 1.6)}" fill="#fff" opacity="${(0.4 + R() * 0.6).toFixed(2)}"/>`;
  s += `<ellipse cx="860" cy="210" rx="56" ry="56" fill="#fff6d0"/><ellipse cx="860" cy="210" rx="170" ry="170" fill="url(#gGlow)" opacity="0.4"/>`;
  // fachada
  s += `<rect x="0" y="420" width="${W}" height="830" fill="#d8b89a"/>${tex('plaster', 0, 420, W, 830, 0.34)}<path d="M0,420 H${W}" stroke="#8a6a4e" stroke-width="12"/>`;
  s += `<path d="M-20,420 L540,250 L1100,420Z" fill="#7a3a34" stroke="${OUT}" stroke-width="6"/>${tex('conc', 0, 250, W, 170, 0.3)}`;
  for (let i = 0; i < 12; i++) s += `<path d="M${-20 + i * 95},420 L540,${250 + (i % 2) * 6}" stroke="#5a2824" stroke-width="3" opacity="0.4"/>`;
  // ventanas con cortina calida
  for (const x of [80, 790]) s += `<g><rect x="${x}" y="560" width="200" height="300" rx="10" fill="#3a2418" stroke="${OUT}" stroke-width="6"/><rect x="${x + 14}" y="574" width="172" height="272" rx="6" fill="#ffcf7a"/><ellipse cx="${x + 100}" cy="710" rx="120" ry="170" fill="#ffcf7a" opacity="0.4" filter="url(#b30)"/><path d="M${x + 14},574 Q${x + 60},700 ${x + 14},846 M${x + 186},574 Q${x + 140},700 ${x + 186},846" stroke="#c0773a" stroke-width="30" fill="none" opacity="0.8"/><path d="M${x + 100},574 V846 M${x + 14},710 H${x + 186}" stroke="#3a2418" stroke-width="6"/></g>`;
  // puerta
  s += `<g><rect x="380" y="540" width="320" height="710" rx="20" fill="#5a2a1c" stroke="${OUT}" stroke-width="8"/><rect x="404" y="566" width="272" height="660" rx="12" fill="#8a4a2e"/>${tex('wood', 404, 566, 272, 660, 0.4)}<rect x="430" y="600" width="220" height="250" rx="10" fill="#6a3822" stroke="${OUT}" stroke-width="4"/><rect x="430" y="880" width="220" height="310" rx="10" fill="#6a3822" stroke="${OUT}" stroke-width="4"/><circle cx="640" cy="900" r="16" fill="#e8c060" stroke="${OUT}" stroke-width="4"/><circle cx="636" cy="896" r="6" fill="#fff" opacity="0.7"/><rect x="480" y="520" width="120" height="40" rx="8" fill="#e8c060" stroke="${OUT}" stroke-width="4"/><text x="540" y="550" font-family="Anton" font-size="30" text-anchor="middle" fill="${OUT}">14</text></g>`;
  // farol de entrada con cono de luz
  s += `<g><rect x="296" y="640" width="16" height="70" fill="#2a1a10"/><path d="M270,640 H340 L324,590 H286Z" fill="#ffe29a" stroke="${OUT}" stroke-width="4"/><ellipse cx="304" cy="640" rx="320" ry="260" fill="#ffd98a" opacity="0.18" filter="url(#b30)"/><path d="M290,712 L180,1250 H430Z" fill="#ffe9b0" opacity="0.14" filter="url(#b14)"/></g>`;
  // escalones y piso
  s += `<rect x="320" y="1250" width="440" height="40" fill="#b3a79a" stroke="${OUT}" stroke-width="5"/><rect x="290" y="1290" width="500" height="44" fill="#9d9184" stroke="${OUT}" stroke-width="5"/>${tex('conc', 290, 1250, 500, 84, 0.3)}`;
  s += `<rect y="1334" width="${W}" height="${H - 1334}" fill="#3a3248"/>${tex('conc', 0, 1334, W, H - 1334, 0.4)}<path d="M0,1334 H${W}" stroke="${OUT}" stroke-width="6"/>`;
  for (let i = 0; i < 7; i++) s += `<path d="M${i * 180},1334 L${i * 180 - 160},${H}" stroke="#1a1424" stroke-width="3" opacity="0.5"/>`;
  s += `<path d="M300,1334 L180,${H} H740 L560,1334Z" fill="#ffe9b0" opacity="0.1" filter="url(#b14)"/>`;
  s += `<rect x="0" y="1250" width="320" height="84" fill="#2a4a2a"/>` + plant(110, 1250, 1.3) + plant(960, 1250, 1.1) + plant(830, 1250, 0.8) + `<rect width="${W}" height="${H}" fill="url(#gVig)"/>`; return s; }
// ---------------- SALA / TOCADOR DE LA CASA DE LAZY (calida) ----------------
function home() {
  let s = `${DEFS}<defs><linearGradient id="gHW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0cdb0"/><stop offset="1" stop-color="#d7a98a"/></linearGradient><radialGradient id="gLamp" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe7b0" stop-opacity="0.95"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#gHW)"/>${tex('plaster', 0, 0, W, 1180, 0.3)}`;
  // papel tapiz con rombos suaves
  for (let j = 0; j < 14; j++) for (let i = 0; i < 9; i++) s += `<path d="M${i * 130 + (j % 2) * 65},${j * 90} l20,28 l-20,28 l-20,-28Z" fill="#c99478" opacity="0.28"/>`;
  s += `<rect y="1000" width="${W}" height="200" fill="#a8704a"/>${tex('wood', 0, 1000, W, 200, 0.35)}<path d="M0,1000 H${W}" stroke="#f6e2c8" stroke-width="12"/><path d="M0,1200 H${W}" stroke="#6a4028" stroke-width="10"/>`;
  // ventana nocturna a la izquierda
  s += `<g transform="translate(70,260)"><rect x="0" y="0" width="260" height="520" rx="10" fill="#fff6e8" stroke="${OUT}" stroke-width="6"/><rect x="16" y="16" width="228" height="488" rx="6" fill="url(#gNight)"/>${[...Array(16)].map((_, i) => `<circle cx="${30 + (i * 53) % 200}" cy="${30 + (i * 37) % 230}" r="${1 + (i % 3) * 0.7}" fill="#fff" opacity="0.8"/>`).join('')}<path d="M130,16 V504 M16,260 H244" stroke="#fff6e8" stroke-width="8"/><path d="M-30,-20 Q40,260 -30,560 L40,560 Q96,260 40,-20Z" fill="#c8486a" opacity="0.9" stroke="${OUT}" stroke-width="4"/><path d="M290,-20 Q220,260 290,560 L220,560 Q164,260 220,-20Z" fill="#c8486a" opacity="0.9" stroke="${OUT}" stroke-width="4"/></g>`;
  // espejo del tocador con foquitos (derecha, de fondo)
  s += `<g transform="translate(660,330)"><ellipse cx="170" cy="320" rx="330" ry="360" fill="url(#gLamp)" opacity="0.55"/><rect x="0" y="0" width="340" height="480" rx="170" fill="#b8860b" stroke="${OUT}" stroke-width="8"/><rect x="18" y="18" width="304" height="444" rx="152" fill="#cfe0ea"/><path d="M60,120 q110,-70 220,0 M60,260 q60,-24 120,-110" stroke="#fff" stroke-width="14" fill="none" opacity="0.5" stroke-linecap="round"/>${[...Array(14)].map((_, i) => { const a = Math.PI + (i / 13) * Math.PI; return `<circle cx="${170 + Math.cos(a) * 190}" cy="${170 + Math.sin(a) * 190 * 1.05}" r="11" fill="#fff4c8" stroke="${OUT}" stroke-width="3"/><circle cx="${170 + Math.cos(a) * 190}" cy="${170 + Math.sin(a) * 190 * 1.05}" r="30" fill="url(#gLamp)" opacity="0.8"/>`; }).join('')}</g>`;
  // marco de fotos en la pared
  s += `<g transform="translate(380,330)"><rect width="150" height="190" rx="8" fill="#6a3a22" stroke="${OUT}" stroke-width="5"/><rect x="14" y="14" width="122" height="162" fill="#f6e2c8"/><circle cx="75" cy="80" r="30" fill="#a8704a"/><path d="M30,176 Q75,110 120,176Z" fill="#c8486a"/></g>`;
  // alfombra y piso
  s += `<rect y="1200" width="${W}" height="${H - 1200}" fill="#8a5a3a"/>${tex('wood', 0, 1200, W, H - 1200, 0.5)}`;
  for (let i = 0; i < 8; i++) s += `<path d="M${i * 140},1200 L${i * 140 - 180},${H}" stroke="#5a3820" stroke-width="3" opacity="0.5"/>`;
  s += `<ellipse cx="540" cy="1560" rx="520" ry="150" fill="#8a2a3e" opacity="0.85" stroke="${OUT}" stroke-width="5"/><ellipse cx="540" cy="1560" rx="420" ry="110" fill="none" stroke="#f0c070" stroke-width="5" stroke-dasharray="26 14"/>`;
  // tocador (mesa con frascos) - al frente derecha
  s += `<g><rect x="620" y="1020" width="420" height="30" rx="8" fill="#f6e2c8" stroke="${OUT}" stroke-width="5"/><rect x="640" y="1050" width="380" height="170" fill="#e6c8a8" stroke="${OUT}" stroke-width="5"/>${tex('wood', 640, 1050, 380, 170, 0.3)}<rect x="660" y="1070" width="160" height="120" rx="8" fill="#d6b08a" stroke="${OUT}" stroke-width="4"/><circle cx="740" cy="1130" r="10" fill="#e8c060" stroke="${OUT}" stroke-width="3"/><rect x="840" y="1070" width="160" height="120" rx="8" fill="#d6b08a" stroke="${OUT}" stroke-width="4"/><circle cx="920" cy="1130" r="10" fill="#e8c060" stroke="${OUT}" stroke-width="3"/>
    <rect x="650" y="965" width="40" height="56" rx="8" fill="#f9a8d4" stroke="${OUT}" stroke-width="4"/><rect x="658" y="945" width="24" height="22" rx="4" fill="#fff" stroke="${OUT}" stroke-width="3"/><rect x="710" y="975" width="48" height="46" rx="10" fill="#fef3c7" stroke="${OUT}" stroke-width="4"/><rect x="772" y="940" width="34" height="80" rx="8" fill="#a5d8ff" stroke="${OUT}" stroke-width="4"/><path d="M830,1020 l10,-60 l22,0 l8,60Z" fill="#c8486a" stroke="${OUT}" stroke-width="4"/><rect x="880" y="950" width="100" height="70" rx="10" fill="#4a1a3a" stroke="${OUT}" stroke-width="4"/><circle cx="910" cy="985" r="14" fill="#8a2a6a"/><circle cx="944" cy="985" r="14" fill="#c06048"/><circle cx="960" cy="1000" r="8" fill="#e0b0d8"/></g>`;
  // sofa izquierda
  s += `<g transform="translate(0,1010)"><rect x="-40" y="0" width="360" height="200" rx="40" fill="#5a2a44" stroke="${OUT}" stroke-width="6"/><rect x="-40" y="-50" width="360" height="90" rx="40" fill="#6a3252" stroke="${OUT}" stroke-width="6"/>${tex('grain', -40, -50, 360, 250, 0.12)}<ellipse cx="260" cy="40" rx="50" ry="40" fill="#f0c070" stroke="${OUT}" stroke-width="5"/></g>`;
  s += `<ellipse cx="540" cy="900" rx="700" ry="600" fill="#ffcf7a" opacity="0.08" filter="url(#b30)"/>` + plant(980, 1220, 1.0) + `<rect width="${W}" height="${H}" fill="url(#gVig)" opacity="0.7"/>`; return s; }

// ---------------- BODEGA ABANDONADA (cold-open de M, oscura, una sola bombilla) ----------------
function warehouse() {
  let s = `${DEFS}<defs><linearGradient id="gWh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060a"/><stop offset="0.6" stop-color="#10131c"/><stop offset="1" stop-color="#07080d"/></linearGradient><radialGradient id="gBulb" cx="0.5" cy="0.3" r="0.75"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.55"/><stop offset="0.5" stop-color="#ffb04a" stop-opacity="0.16"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#gWh)"/>`; const R = rnd(53);
  // muro de ladrillo con textura
  s += `<rect y="120" width="${W}" height="1130" fill="#1a1620"/>${tex('conc', 0, 120, W, 1130, 0.5)}`;
  for (let j = 0; j < 22; j++) for (let i = 0; i < 9; i++) s += `<rect x="${i * 130 + (j % 2) * 65 - 40}" y="${130 + j * 50}" width="124" height="44" rx="3" fill="${R() > 0.5 ? '#2a2230' : '#231c2a'}" opacity="0.55"/>`;
  // vigas de acero y tuberias oxidadas
  s += `<rect y="0" width="${W}" height="120" fill="#0b0a10"/>`; for (let i = 0; i < 4; i++) s += `<path d="M${i * 300 - 40},0 L${i * 300 + 120},130" stroke="#15131c" stroke-width="22"/>`;
  s += `<path d="M0,200 H${W}" stroke="#2a2630" stroke-width="26"/><path d="M0,200 H${W}" stroke="#4a3a34" stroke-width="6" opacity="0.6"/><path d="M0,250 Q540,290 ${W},250" stroke="#221e28" stroke-width="18" fill="none"/>`;
  // ventana alta rota con luz de luna
  s += `<g transform="translate(80,300)"><rect width="260" height="170" fill="#0a1030" stroke="#07060a" stroke-width="10"/><rect x="8" y="8" width="244" height="154" fill="#2a3a78"/><path d="M130,8 V162 M8,85 H252" stroke="#07060a" stroke-width="8"/><path d="M60,8 L120,100 L80,162" stroke="#cfe0ff" stroke-width="3" opacity="0.8" fill="none"/><path d="M-10,170 L260,170 L420,1000 L-160,1000Z" fill="#9fb8ff" opacity="0.07" filter="url(#b14)"/></g>`;
  // tablero de corcho con hilo rojo (sin identificar a nadie)
  s += `<g transform="translate(160,420)"><rect width="760" height="560" rx="10" fill="#4a3220" stroke="#0a0710" stroke-width="10"/>${tex('grain', 0, 0, 760, 560, 0.5)}<rect x="14" y="14" width="732" height="532" fill="#7a5632" opacity="0.7"/>${tex('plaster', 14, 14, 732, 532, 0.4)}</g>`;
  // mapa viejo y notas en el corcho
  s += `<g transform="translate(560,470) rotate(2)"><rect width="300" height="220" fill="#d8c9a0" stroke="#3a2a18" stroke-width="4"/>${tex('plaster', 0, 0, 300, 220, 0.4)}<path d="M20,40 Q80,10 140,60 T280,50 M30,120 Q110,90 170,140 T280,130 M40,190 L260,170" stroke="#6a4a2a" stroke-width="3" fill="none"/><circle cx="200" cy="110" r="10" fill="#c8102a"/><path d="M200,110 l-8,-18 M200,110 l8,-18" stroke="#c8102a" stroke-width="3"/></g>`;
  // cajas de madera y barriles
  const crate = (x, y, w, h) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4a3220" stroke="#0a0710" stroke-width="6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#wood)" opacity="0.5"/><path d="M${x},${y} L${x + w},${y + h} M${x + w},${y} L${x},${y + h}" stroke="#2a1a10" stroke-width="7"/><rect x="${x}" y="${y}" width="${w}" height="12" fill="#6a4a2c" opacity="0.6"/></g>`;
  s += crate(20, 1030, 190, 220) + crate(60, 880, 150, 150) + crate(880, 1060, 190, 190) + `<g><ellipse cx="930" cy="1260" rx="70" ry="14" fill="#000" opacity="0.4"/><rect x="860" y="1060" width="140" height="200" rx="24" fill="#3a3a44" stroke="#0a0710" stroke-width="6"/><path d="M860,1110 H1000 M860,1210 H1000" stroke="#1a1a22" stroke-width="8"/></g>`;
  // piso de concreto manchado + charcos
  s += `<rect y="1250" width="${W}" height="${H - 1250}" fill="#0f0e14"/>${tex('conc', 0, 1250, W, H - 1250, 0.6)}`;
  for (let i = 0; i < 9; i++) s += `<path d="M${540 + (i - 4) * 40},1250 L${540 + (i - 4) * 300},${H}" stroke="#1c1a24" stroke-width="3" opacity="0.25"/>`;
  s += `<ellipse cx="300" cy="1560" rx="180" ry="30" fill="#2a3a58" opacity="0.35" filter="url(#b6)"/><ellipse cx="760" cy="1700" rx="140" ry="22" fill="#2a3a58" opacity="0.3" filter="url(#b6)"/>`;
  s += `<rect width="${W}" height="${H}" fill="#03040a" opacity="0.5"/>`;
  // telaranas en las esquinas
  s += `<g stroke="#8a8a9a" stroke-width="1.5" opacity="0.4" fill="none">${[0, 1, 2, 3, 4].map((i) => `<path d="M0,120 L${60 + i * 36},${40 + i * 34}"/>`).join('')}${[1, 2, 3].map((i) => `<path d="M${i * 40},120 Q${i * 36},${i * 30 + 20} 0,${i * 40 + 120}"/>`).join('')}</g>`;
  // bombilla colgante con cono de luz suave (degradado, sin bordes)
  s += `<path d="M540,0 V230" stroke="#08060c" stroke-width="5"/><ellipse cx="540" cy="250" rx="26" ry="30" fill="#fff0c0"/><ellipse cx="540" cy="250" rx="120" ry="120" fill="url(#gBulb)"/><ellipse cx="540" cy="420" rx="520" ry="620" fill="url(#gBulb)" opacity="0.9" filter="url(#b30)"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#gVig)"/><rect width="${W}" height="${H}" fill="url(#gVig)" opacity="0.7"/>`; return s; }
for (const [n, fn] of [['door18', door], ['home18', home], ['warehouse18', warehouse]]) { const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn()}</svg>`; writeFileSync(`plates2d/${n}.png`, new Resvg(svg, ropt).render().asPng()); console.log(n); }
