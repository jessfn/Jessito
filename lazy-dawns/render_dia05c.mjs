// Lazy Dawns - Dia 5: "Cejas de modelo" (sin Mari; nuevos: Karla y el gato Chispa). Voces: narrador, Mari, Vero (estilista), Memo (ayudante). Los personajes NO mueven la boca para hablar.
// Formato 1080x1920, mismo encuadre y tamanos que los dias 1-3.
// Uso: node render_dia04.mjs preview 5 12 ...   |   node render_dia04.mjs <inicio> <fin> <salida.mp4>   |   node render_dia04.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawKarla, drawCat, handsToTargets } from './chars.mjs';
import { makeDirector } from './director5c.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia05c');
const W = 1080, H = 1920, FPS = 30;
const SAFE = { cy: 960 }; // centro de pantalla (mismo encuadre que los dias anteriores)
const ropt = { font: { fontFiles: [path.join(here, '../assets/fonts/Anton-Regular.ttf')], loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const pop = (t, t0, d = 0.35) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const win = (t, a, b, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * clamp((b - t) / fo);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const OUT = '#12090a';
const nm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9]/g, '');

// ---------------- guion con tiempos ----------------
const DATA = JSON.parse(readFileSync(path.join(B, 'lines.json'), 'utf8'));
const L = Object.fromEntries(DATA.lines.map((l) => [l.id, l]));
const DUR = DATA.total;
const w = (id, word, n = 0) => { const r = L[id].words.filter((x) => nm(x[0]) === nm(word))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + word); return r[1]; };
const T = {
  slateEnd: 1.4, doorA: w('l1', 'sola') - 0.9, enterA: w('l1', 'sola') - 0.5, sitA: w("l1", "sola") + 2.0,
  measureA: L.l4.start + 0.3, markA: w('l4', 'lapiz') - 0.2, tapA: L.l5.start + 1.6,
  waxA: L.l6.start + 0.2, ripA: w('l6', 'tiron') + 0.5, fallA: w('l6', 'cayo') - 0.2,
  tweezA: L.l7.start + 0.4, tweezB: L.l7.end, designA: L.l8.start + 0.2, designB: L.l8.end + 0.2,
  catJump: w('l9', 'salto') - 0.1, catBack: L.l10.end - 0.6, fixA: L.l11.start + 0.5, fixB: w('l11', 'gel') - 0.2, gelA: w('l11', 'gel') - 0.2,
  mirrorStart: L.l12.start + 0.2, reveal: L.l12.start + 0.4, mirrorEnd: L.l12.end + 0.3, approveA: L.l13.start + 0.2, moleA: w('l14', 'lunar') - 0.3,
  vote: w('l15', 'Que') - 0.1, optA: w('l15', 'maquillaje'), optB: w('l15', 'ropa'), cta1: w('l15', 'Comenta'), cta2: w('l15', 'sigueme'),
};
T.sit = T.sitA;
T.scenes = [T.slateEnd, T.enterA, T.sitA, T.measureA, T.waxA, T.ripA, T.tweezA, T.designA, T.catJump, T.fixA, T.mirrorStart, T.moleA, T.vote];
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });

// ---------------- FONDO: Salon Rapunzel ----------------
function studioRoomSvg() {
  const bulbs = (x0, y0, n, dx, dy) => [...Array(n)].map((_, i) => `<circle cx="${x0 + i * dx}" cy="${y0 + i * dy}" r="13" fill="#fff6c8" stroke="${OUT}" stroke-width="3"/><circle cx="${x0 + i * dx}" cy="${y0 + i * dy}" r="30" fill="#fff6c8" opacity="0.25" filter="url(#b10)"/>`).join('');
  const checker = [...Array(14)].map((_, r) => [...Array(10)].map((__, c) => ((r + c) % 2 ? `<rect x="${c * 120 - r * 14}" y="${1390 + r * 40}" width="120" height="40" fill="#f9a8d4" opacity="0.55"/>` : '')).join('')).join('');
  const prod = (x, y, col, h, lab) => `<g transform="translate(${x},${y})"><rect x="-16" y="${-h}" width="32" height="${h}" rx="9" fill="${col}" stroke="${OUT}" stroke-width="4"/><rect x="-9" y="${-h - 12}" width="18" height="14" fill="#fff" stroke="${OUT}" stroke-width="3"/><rect x="-12" y="${-h * 0.7}" width="24" height="${h * 0.3}" rx="4" fill="#fff" opacity="0.8"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde7f3"/><stop offset="1" stop-color="#f5c2dd"/></linearGradient>
  <linearGradient id="mir" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f7ff"/><stop offset="0.5" stop-color="#a5dbf2"/><stop offset="1" stop-color="#6fb4d6"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1f8"/><stop offset="1" stop-color="#e9b6d1"/></linearGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a0a2a" stop-opacity="0.45"/></radialGradient>
  <filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>${[...Array(12)].map((_, i) => `<rect x="${i * 100}" y="0" width="50" height="1400" fill="#fff" opacity="0.28"/>`).join('')}
  <rect x="0" y="1090" width="${W}" height="300" fill="#be185d" opacity="0.88"/><rect x="0" y="1078" width="${W}" height="24" fill="#fff" stroke="${OUT}" stroke-width="6"/>
  <rect x="0" y="1380" width="${W}" height="540" fill="url(#floor)"/>${checker}<rect x="0" y="1376" width="${W}" height="22" fill="#fce7f3" stroke="${OUT}" stroke-width="5"/>
  <!-- letrero -->
  <g transform="translate(540,150) scale(0.82)"><rect x="-380" y="-64" width="760" height="128" rx="34" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect x="-362" y="-48" width="724" height="96" rx="24" fill="#ec4899"/>
    <text x="30" y="26" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="8" paint-order="stroke" letter-spacing="3">CEJAS PERFECTAS</text>
    <g transform="translate(-300,0)"><path d="M0,-36 C20,-20 -20,0 0,20 C20,36 -16,50 0,60" stroke="#fde047" stroke-width="12" fill="none" stroke-linecap="round" transform="scale(1,0.8)"/><circle cx="0" cy="-34" r="12" fill="#fde047" stroke="${OUT}" stroke-width="3"/></g></g>
  <!-- espejo grande -->
  <g transform="translate(540,740)"><rect x="-334" y="-326" width="668" height="720" rx="330" fill="#000" opacity="0.25" transform="translate(10,16)" filter="url(#b10)"/><rect x="-334" y="-326" width="668" height="720" rx="330" fill="#fff" stroke="${OUT}" stroke-width="9"/>
    <rect x="-312" y="-304" width="624" height="676" rx="310" fill="url(#mir)" stroke="${OUT}" stroke-width="6"/>
    <path d="M-220,-200 L-150,-260 M-250,-120 L-90,-250 M-270,-30 L-30,-250" stroke="#fff" stroke-width="22" stroke-linecap="round" opacity="0.5"/>
    ${bulbs(-300, -250, 7, 12, 60).replace(/translate/g, 'translate')}${bulbs(300, -250, 7, -12, 60)}</g>
  <!-- repisa con productos (izq) -->
  <g transform="translate(30,900)"><rect x="6" y="14" width="250" height="16" fill="#000" opacity="0.2" filter="url(#b10)"/><rect width="250" height="16" fill="#fff" stroke="${OUT}" stroke-width="5"/>
    ${prod(30, 0, '#ff4d8d', 70)}${prod(70, 0, '#22d3ee', 90)}${prod(110, 0, '#a3e635', 60)}${prod(150, 0, '#fbbf24', 80)}${prod(190, 0, '#a78bfa', 66)}${prod(226, 0, '#fb7185', 54)}</g>
  <g transform="translate(30,740)"><rect x="6" y="14" width="250" height="16" fill="#000" opacity="0.2" filter="url(#b10)"/><rect width="250" height="16" fill="#fff" stroke="${OUT}" stroke-width="5"/>
    ${prod(30, 0, '#38bdf8', 64)}${prod(70, 0, '#f472b6', 80)}${prod(110, 0, '#34d399', 70)}${prod(150, 0, '#fde047', 56)}${prod(190, 0, '#c084fc', 84)}</g>
  <!-- cartel modelo (der) -->
  <g transform="translate(850,540) rotate(3)"><rect x="8" y="14" width="190" height="300" fill="#000" opacity="0.25" filter="url(#b10)"/><rect width="190" height="300" fill="#fff" stroke="${OUT}" stroke-width="7"/><rect x="12" y="12" width="166" height="276" fill="#fbcfe8" stroke="${OUT}" stroke-width="4"/>
    <ellipse cx="95" cy="104" rx="38" ry="44" fill="#d9a066" stroke="${OUT}" stroke-width="4"/><path d="M52,96 C40,150 34,210 46,270 L72,270 C70,210 74,150 76,110Z" fill="#2a1a10" stroke="${OUT}" stroke-width="3"/><path d="M138,96 C150,150 156,210 144,270 L118,270 C120,210 116,150 114,110Z" fill="#2a1a10" stroke="${OUT}" stroke-width="3"/>
    <path d="M55,70 Q95,34 135,70 Q100,60 55,70Z" fill="#2a1a10"/><text x="95" y="290" font-family="Anton" font-size="26" text-anchor="middle" fill="#be185d">CEJAS DE MODELO</text></g>
  <!-- carrito -->
  <g transform="translate(900,1330)"><ellipse cx="80" cy="86" rx="120" ry="18" fill="#000" opacity="0.25" filter="url(#b10)"/><rect x="0" y="0" width="170" height="14" fill="#fff" stroke="${OUT}" stroke-width="5"/><rect x="10" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/><rect x="148" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/>${prod(36, 0, '#ec4899', 56)}${prod(76, 0, '#38bdf8', 70)}${prod(116, 0, '#fde047', 50)}</g>
  <g transform="translate(1010,1380)"><path d="M-36,0 L-28,-70 L36,-70 L44,0Z" fill="#e8629c" stroke="${OUT}" stroke-width="6"/><path d="M4,-70 Q-60,-170 -30,-230 Q-8,-150 8,-70 Q40,-180 96,-200 Q60,-120 28,-70Z" fill="#4caf50" stroke="${OUT}" stroke-width="6"/></g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
}
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const studioPng = b64(new Resvg(studioRoomSvg(), ropt).render().asPng());

// ---------------- silla de salon ----------------
const VIN = `<linearGradient id="vin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#be185d"/><stop offset="0.35" stop-color="#ec4899"/><stop offset="0.7" stop-color="#db2777"/><stop offset="1" stop-color="#831843"/></linearGradient><linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ca3af"/><stop offset="0.4" stop-color="#f3f4f6"/><stop offset="1" stop-color="#6b7280"/></linearGradient>`;
function chairBack(sat) {
  return `<defs>${VIN}</defs><ellipse cx="540" cy="1650" rx="330" ry="34" fill="#000" opacity="0.3"/>
  <rect x="496" y="1490" width="88" height="170" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/><ellipse cx="540" cy="1660" rx="210" ry="30" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>
  <rect x="300" y="820" width="480" height="470" rx="120" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M336,870 Q336,846 400,846" stroke="#fff" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/>
  <rect x="236" y="1080" width="96" height="46" rx="22" fill="#831843" stroke="${OUT}" stroke-width="7"/><rect x="748" y="1080" width="96" height="46" rx="22" fill="#831843" stroke="${OUT}" stroke-width="7"/>
  ${sat ? '' : `<rect x="276" y="1200" width="528" height="110" rx="40" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/>`}`;
}
function chairFront() {
  return `<path d="M276,1246 Q540,1226 804,1246 L822,1470 Q540,1498 258,1470Z" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M316,1280 Q540,1264 764,1280" stroke="#fff" stroke-opacity="0.3" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="300" y="1470" width="480" height="36" rx="14" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/><path d="M282,1300 Q540,1324 798,1300" stroke="#000" stroke-opacity="0.18" stroke-width="10" fill="none"/>`;
}

// ---------------- personajes en el mundo ----------------
const LZ = { x: 540, S: 0.68 }; const K = LZ.S / 0.62;
const PRO = { x: 800, y: 640, s: 0.78 }, CATP = { s: 0.55, home: { x: 1010, y: 1040 } };
const lazyFy = (t) => lerp(1500, 1382, smooth((t - T.sit) / 0.55));
const lazyX = (t) => lerp(40, 540, ease((t - T.enterA) / 1.5));
const lazyHeadWorld = (t) => { const py = lazyFy(t) - 830 * LZ.S; return { x: lazyX(t), y: py - 215 * LZ.S }; };
const facePt = (t, lx, ly) => { const h = lazyHeadWorld(t); return { x: h.x + lx * LZ.S, y: h.y + ly * LZ.S }; };
function toolPose(ch, tipX, tipY, len, theta) { const r = theta * Math.PI / 180, wl = len * ch.s, ox = tipX - wl * -Math.sin(r), oy = tipY - wl * Math.cos(r); return { toolX: (ox - ch.x) / ch.s, toolY: (oy - ch.y) / ch.s, toolR: theta, toolS: 1 }; }
function karlaState(t) {
  let mood = 'happy', tool = 'none', o = {};
  const at = (len, th, lx, ly) => { const p = facePt(t, lx, ly); return toolPose(PRO, p.x, p.y, len, th); };
  if (t >= L.l4.start && t < T.markA) { tool = 'ruler'; mood = 'focus'; o = at(210, 96, -70 + Math.min(1, (t - T.measureA) / 3) * 140, -92); }
  if (t >= T.markA && t < T.tapA - 0.4) { tool = 'pencilW'; mood = 'focus'; o = at(214, 98, -90 + Math.min(1, (t - T.markA) / 2.5) * 180, -112); }
  if (t >= L.l5.start) { tool = 'none'; mood = 'serious'; }
  if (t >= T.tapA && t < T.waxA - 0.3) { tool = 'ruler'; o = at(210, 96, 0, -76); mood = 'amused'; }
  if (t >= T.waxA - 0.3 && t < T.ripA - 0.1) { tool = 'waxstick'; mood = 'focus'; o = at(190, 96, 0, -76 + Math.sin(t * 6) * 4); }
  if (t >= T.ripA - 0.1) { tool = 'none'; mood = 'shock'; }
  if (t >= T.tweezA && t < T.tweezB) { tool = 'tweezers'; mood = 'focus'; o = at(206, 96, -60 + Math.sin(t * 5) * 70, -86 + Math.sin(t * 9) * 4); }
  if (t >= T.designA && t < T.designB) { tool = 'pencilW'; mood = 'focus'; o = at(214, 98, 20 + Math.sin(t * 2) * 60, -112 + Math.sin(t * 4) * 6); }
  if (t >= L.l9.start) { tool = 'pencilW'; mood = 'focus'; o = at(214, 98, -70, -112); }
  if (t >= T.catJump) { tool = 'none'; mood = 'scream'; }
  if (t >= L.l10.start + 0.4) { mood = 'worry'; }
  if (t >= T.fixA && t < T.fixB) { tool = 'pencilW'; mood = 'focus'; o = at(214, 98, -90 + Math.sin(t * 4) * 20, -112); }
  if (t >= T.gelA && t < T.gelA + 1.6) { tool = 'spoolie'; o = at(198, 98, -50 + Math.sin(t * 5) * 40, -108); }
  if (t >= T.gelA + 1.6) { tool = 'none'; mood = 'proud'; }
  if (t >= T.mirrorStart) mood = 'happy';
  if (t >= T.approveA) mood = 'grin';
  if (t >= T.moleA - 0.3) { tool = 'pencilW'; mood = 'amused'; o = at(214, 94, 96, 94); }
  const hands = (mood === 'scream' && tool === 'none') ? 'cheeks' : (mood === 'proud' || mood === 'grin') ? 'clasp' : 'none';
  return { mood, tool, hands, ...o };
}
function catState(t) {
  // mostrador: dormido (zzz) -> cae (grito) -> vuelve -> salta a las piernas -> regresa -> aprueba
  const home = CATP.home; let x = home.x, y = home.y, pose = 'sit', rot = 0, mood = 'sleep';
  const arc = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - Math.sin(Math.PI * u) * 180 });
  const lap = { x: 600, y: 1170 };
  if (t >= T.fallA) { const u = clamp((t - T.fallA) / 0.5); pose = 'jump'; mood = 'shock'; const q = { x: home.x - 60 * u, y: home.y + 300 * u * u }; x = q.x; y = q.y; rot = 160 * u; }
  if (t >= T.fallA + 0.5) { x = home.x - 60; y = home.y + 300; pose = 'sit'; rot = 0; mood = 'shock'; }
  if (t >= T.fallA + 1.8) { const u = clamp((t - (T.fallA + 1.8)) / 0.5); const q = arc({ x: home.x - 60, y: home.y + 300 }, home, u); x = q.x; y = q.y; pose = u < 1 ? 'jump' : 'sit'; mood = 'awake'; }
  if (t >= T.fallA + 2.3) { x = home.x; y = home.y; mood = 'awake'; }
  if (t >= T.catJump - 0.3 && t < T.catJump + 0.5) { const u = clamp((t - (T.catJump - 0.3)) / 0.7); const q = arc(home, lap, u); x = q.x; y = q.y; pose = 'jump'; rot = -20 * Math.sin(Math.PI * u); mood = 'awake'; }
  if (t >= T.catJump + 0.5 && t < T.catBack) { x = lap.x; y = lap.y; pose = 'sit'; mood = 'awake'; }
  if (t >= T.catBack && t < T.catBack + 0.7) { const u = clamp((t - T.catBack) / 0.7); const q = arc(lap, home, u); x = q.x; y = q.y; pose = 'jump'; mood = 'awake'; }
  if (t >= T.catBack + 0.7) { x = home.x; y = home.y; pose = 'sit'; mood = 'awake'; }
  if (t >= T.approveA) mood = 'happy';
  return { x, y, pose, rot, mood };
}
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
function camAt(t) { // encuadre fijo 9:16 completo: no se acerca ni se recorta nada
  const sh = win(t, T.sit + 0.3, T.sit + 0.7, 0.02, 0.3) * 4 + win(t, T.ripA, T.ripA + 0.5, 0.02, 0.4) * 7 + win(t, T.catJump, T.catJump + 0.5, 0.02, 0.3) * 5;
  return { z: 1 + sh * 0.004, x: 540 + Math.sin(t * 61) * sh * 0.5, y: 960 + Math.cos(t * 53) * sh * 0.5 };
}
const worldT = (cam) => `translate(540,${SAFE.cy}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`;

// ---------------- efectos ----------------
function doorSvg(t) {
  const k = ease((t - T.doorA) / 0.55), wd = 190 * (1 - 0.86 * k); const bell = Math.sin((t - T.doorA) * 22) * Math.exp(-(t - T.doorA) * 2.2) * (t >= T.doorA ? 1 : 0);
  return `<g transform="translate(20,560)"><rect x="-14" y="-18" width="218" height="838" rx="10" fill="#7c2d12" stroke="${OUT}" stroke-width="8"/><rect x="0" y="0" width="190" height="820" fill="${k > 0.02 ? '#fde68a' : '#451a03'}" stroke="${OUT}" stroke-width="6"/>${k > 0.02 ? `<rect x="0" y="0" width="190" height="820" fill="url(#doorGlow)"/>` : ''}
    <defs><linearGradient id="doorGlow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff7c2" stop-opacity="0.95"/><stop offset="1" stop-color="#fde68a" stop-opacity="0.3"/></linearGradient></defs>
    <g><polygon points="0,0 ${wd},${18 * k} ${wd},${820 - 18 * k} 0,820" fill="#b45309" stroke="${OUT}" stroke-width="7"/><rect x="${wd * 0.12}" y="${90 + 20 * k}" width="${wd * 0.62}" height="260" fill="#fbbf24" opacity="0.9" stroke="${OUT}" stroke-width="5"/><circle cx="${wd * 0.82}" cy="430" r="${Math.max(3, 12 - 8 * k)}" fill="#fde047" stroke="${OUT}" stroke-width="4"/>${[0.25, 0.5, 0.75].map((u) => `<line x1="${wd * u * 0.8 + 6}" y1="${130}" x2="${wd * u * 0.8 + 6}" y2="${340}" stroke="${OUT}" stroke-width="2" opacity="0.4"/>`).join('')}</g>
    <g transform="translate(95,-4) rotate(${bell * 20})"><path d="M-18,0 q18,-34 36,0Z" fill="#fbbf24" stroke="${OUT}" stroke-width="5"/><circle cx="0" cy="4" r="6" fill="#92400e"/></g></g>`;
}
function zzzFx(t) { const c = catState(t); if (c.mood !== 'sleep' || t < 1) return ''; const ph = (t * 0.6) % 1;
  return [0, 1, 2].map((i) => { const p = (ph + i / 3) % 1; return `<text x="${c.x + 70 + p * 40}" y="${c.y - 100 - p * 110}" font-family="Anton" font-size="${34 + p * 26}" fill="#fff" stroke="${OUT}" stroke-width="6" paint-order="stroke" opacity="${Math.sin(p * Math.PI)}">Z</text>`; }).join(''); }
function measureFx(t) { const a = win(t, T.measureA, T.markA + 1.2, 0.3, 0.5); if (a <= 0) return ''; const f = (lx, ly) => facePt(t, lx, ly); const u = clamp((t - T.measureA) / 2.4);
  const lines = [[f(-38, -150), f(-38, 120)], [f(38, -150), f(38, 120)], [f(-140, -60), f(140, -60)], [f(-78, -150), f(-78, 120)], [f(78, -150), f(78, 120)]];
  return `<g opacity="${a}">${lines.map(([p, q], i) => `<line x1="${p.x}" y1="${p.y}" x2="${lerp(p.x, q.x, clamp(u * 1.4 - i * 0.12))}" y2="${lerp(p.y, q.y, clamp(u * 1.4 - i * 0.12))}" stroke="#fbbf24" stroke-width="4" stroke-dasharray="14 9" stroke-linecap="round"/>`).join('')}<text x="${f(0, -178).x}" y="${f(0, -178).y}" font-family="Anton" font-size="38" text-anchor="middle" fill="#fde047" stroke="${OUT}" stroke-width="7" paint-order="stroke">1 : 1.618</text></g>`; }
function marksFx(t) { const a = win(t, T.markA, T.designB + 0.4, 0.2, 0.6); if (a <= 0) return ''; const pts = [[-46, -66], [-86, -112], [-132, -58], [46, -66], [86, -112], [132, -58]];
  return `<g opacity="${a}">${pts.map(([x, y], i) => { const p = facePt(t, x, y); return `<circle cx="${p.x}" cy="${p.y}" r="${7 * pop(t, T.markA + i * 0.35, 0.25)}" fill="#fff" stroke="${OUT}" stroke-width="2.5"/>`; }).join('')}</g>`; }
function waxFx(t) { const a = win(t, T.waxA + 0.3, T.ripA, 0.15, 0.05); const p = facePt(t, 0, -78); let s = '';
  if (a > 0) s += `<g opacity="${a}"><rect x="${p.x - 70}" y="${p.y - 22}" width="140" height="46" rx="12" fill="#fbbf24" stroke="${OUT}" stroke-width="5"/><rect x="${p.x - 62}" y="${p.y - 14}" width="124" height="14" rx="7" fill="#fde68a" opacity="0.7"/>${[0, 1, 2].map((i) => `<circle cx="${p.x - 40 + i * 40}" cy="${p.y - 36 - ((t * 40 + i * 12) % 22)}" r="${5 + i % 2 * 2}" fill="#fff" opacity="0.5"/>`).join('')}</g>`;
  const d = t - T.ripA; if (d >= 0 && d < 1.1) s += `<g transform="translate(540,1010) scale(${pop(t, T.ripA, 0.2)})" opacity="${clamp((1.1 - d) / 0.4)}"><text x="0" y="0" font-family="Anton" font-size="120" text-anchor="middle" fill="#ef4444" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡RIIIP!</text></g>${[...Array(8)].map((_, i) => `<line x1="${p.x}" y1="${p.y}" x2="${p.x + Math.cos(i * 0.785) * (50 + d * 120)}" y2="${p.y + Math.sin(i * 0.785) * (50 + d * 120)}" stroke="#ffe14d" stroke-width="6" stroke-linecap="round" opacity="${clamp(1 - d / 0.7)}"/>`).join('')}`;
  return s; }
function tweezFx(t) { const a = win(t, T.tweezA, T.tweezB, 0.2, 0.3); if (a <= 0) return ''; return [...Array(10)].map((_, i) => { const ph = ((t * 1.4 + i * 0.19) % 1); const p = facePt(t, -60 + ((i * 37) % 120), -80); return `<path d="M${p.x},${p.y - ph * 110} q8,-10 16,0" stroke="#1a1412" stroke-width="4" fill="none" stroke-linecap="round" opacity="${(1 - ph) * a}" transform="rotate(${i * 30} ${p.x} ${p.y - ph * 110})"/>`; }).join(''); }
function moleFx(t) { const a = win(t, T.moleA, T.vote + 0.2, 0.2, 0.4); if (a <= 0) return ''; const p = facePt(t, 96, 94); const pl = 0.5 + 0.5 * Math.sin(t * 8);
  return `<g opacity="${a}"><circle cx="${p.x}" cy="${p.y}" r="${34 + pl * 10}" fill="none" stroke="#ef4444" stroke-width="7"/><circle cx="${p.x}" cy="${p.y}" r="${34 + pl * 10}" fill="#ef4444" opacity="0.12"/><g transform="translate(${p.x + 90},${p.y - 70}) scale(${pop(t, T.moleA, 0.3)})"><circle r="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><text x="0" y="22" font-family="Anton" font-size="64" text-anchor="middle" fill="#ef4444">!</text></g></g>`; }
function heartsFx(t) { const a = win(t, T.approveA, T.vote, 0.2, 0.6); if (a <= 0) return ''; const c = catState(t); return [...Array(5)].map((_, i) => { const ph = ((t * 0.7 + i * 0.2) % 1); return `<path d="M0,6 C-18,-8 -18,-26 0,-18 C18,-26 18,-8 0,6Z" transform="translate(${c.x - 50 + i * 26},${c.y - 120 - ph * 150}) scale(${0.8 + 0.3 * (i % 2)})" fill="#fb7185" stroke="${OUT}" stroke-width="3" opacity="${a * Math.sin(ph * Math.PI)}"/>`; }).join(''); }

// ---------------- UI (zona segura) ----------------
const stepBanners = [['1', 'MEDIDAS', T.measureA - 0.1, T.markA + 1.0, '#fde68a'], ['2', 'CERA', T.waxA, T.ripA + 1.4, '#fbbf24'], ['3', 'PINZA', T.tweezA - 0.1, T.tweezB + 0.2, '#c4b5fd'], ['4', 'DISEÑO', T.designA - 0.1, T.designB, '#86efac'], ['5', 'RETOQUE', T.fixA, T.gelA + 1.8, '#fda4af']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="34" y="20" font-family="Anton" font-size="${text.length > 9 ? 56 : 66}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const SPEAK = { N: { col: '#ffe14d', name: null }, B: { col: '#5eead4', name: 'KARLA' } };
const SUB_Y = 1580;
function captions(t) {
  const cur = DATA.lines.find((l) => t >= l.start - 0.15 && t <= l.end + 0.3); if (!cur) return '';
  const sp = SPEAK[cur.who]; const groups = []; let g = [];
  cur.words.forEach(([ww, s, e]) => { g.push({ w: ww, s, e }); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(ww)) { groups.push(g); g = []; } }); if (g.length) groups.push(g);
  const grp = groups.find((gr) => t >= gr[0].s - 0.05 && t <= gr[gr.length - 1].e + 0.25) || groups[groups.length - 1];
  const txt = grp.map((o) => esc(o.w.replace(/\.\.\./g, '').toUpperCase())).join(' ');
  let fs = 84, wdt = inkWidth(txt, fs); if (wdt > SAFE_W) { fs = Math.max(44, Math.floor(fs * SAFE_W / wdt)); wdt = inkWidth(txt, fs); }
  const spans = grp.map((o) => `<tspan fill="${t >= o.s && t < o.e + 0.05 ? sp.col : '#fff'}">${esc(o.w.replace(/\.\.\./g, '').toUpperCase())} </tspan>`).join('');
  const tag = sp.name ? `<g transform="translate(540,${SUB_Y - fs * 0.98 - 58})"><rect x="-${sp.name.length * 19 + 34}" y="-36" width="${sp.name.length * 38 + 68}" height="72" rx="36" fill="${sp.col}" stroke="${OUT}" stroke-width="7"/><text x="0" y="15" font-family="Anton" font-size="48" text-anchor="middle" fill="${OUT}" letter-spacing="2">${sp.name}</text></g>` : '';
  return `${tag}<text x="540" y="${SUB_Y}" font-family="Anton" font-size="${fs}" text-anchor="middle" stroke="${OUT}" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${spans}</text>`;
}
function talkIcon(t, who, x, y) { const l = DATA.lines.find((q) => q.who === who && t >= q.start && t <= q.end); if (!l) return '';
  const p = 0.5 + 0.5 * Math.sin(t * 14), col = SPEAK[who].col;
  return `<g transform="translate(${x},${y})"><circle r="42" fill="#fff" stroke="${OUT}" stroke-width="6"/>${[0, 1, 2].map((i) => `<path d="M${-15 + i * 15},${-13 - (i === 1 ? 4 : 0) * p} v${26 + (i === 1 ? 8 : 0) * p}" stroke="${col}" stroke-width="8" stroke-linecap="round" transform="translate(0,${-(i === 1 ? 4 : 0) * p / 2})"/>`).join('')}</g>`; }
function slate(t) {
  if (t > T.slateEnd + 0.7) return '';
  const out = ease((t - T.slateEnd) / 0.6), clap = clamp((t - 0.7) / 0.12);
  const open = lerp(-32, 0, clap) + (t > 0.82 ? Math.sin((t - 0.82) * 40) * 2 * Math.exp(-(t - 0.82) * 8) : 0);
  const stripes = [...Array(7)].map((_, i) => `<polygon points="${i * 110},0 ${i * 110 + 60},0 ${i * 110 + 20},70 ${i * 110 - 40},70" fill="${i % 2 ? '#fff' : OUT}"/>`).join('');
  return `<g><rect width="${W}" height="${H}" fill="#0b0b10" opacity="${1 - out}"/><g transform="translate(540,${900 - out * 1300}) rotate(${-4 + out * 20})" opacity="${1 - out * 0.6}">
    <g transform="translate(-340,-250) rotate(${open} 0 70)"><rect width="680" height="70" fill="#fff" stroke="#fff" stroke-width="6"/>${stripes}</g>
    <rect x="-340" y="-170" width="680" height="440" rx="12" fill="#1a1a22" stroke="#fff" stroke-width="6"/>
    <text x="-310" y="-120" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">PRODUCCIÓN</text><text x="-310" y="-56" font-family="Anton" font-size="56" fill="#fff">LAZY DAWNS</text>
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">ESCENA</text><text x="-310" y="52" font-family="Anton" font-size="52" fill="#5eead4">CEJAS DE MODELO</text>
    <text x="-310" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">DÍA</text><text x="-310" y="172" font-family="Anton" font-size="58" fill="#ff4d8d">5 / 30</text><text x="60" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">TOMA</text><text x="60" y="172" font-family="Anton" font-size="58" fill="#fff">1</text>
    ${clap >= 1 && t < 1.15 ? `<text x="0" y="-300" font-family="Anton" font-size="110" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡CLAC!</text>` : ''}</g></g>`;
}
function mirrorOverlay(t) { const a = win(t, T.mirrorStart + 0.2, T.mirrorEnd, 0.3, 0.4); if (a <= 0) return '';
  const g = ((t - T.mirrorStart) * 0.9) % 2;
  return `<g opacity="${a}"><path d="M0,0 H${W} V${H} H0Z M540,890 m-440,0 a440,640 0 1,0 880,0 a440,640 0 1,0 -880,0Z" fill="#0b0b10" fill-rule="evenodd" opacity="0.9"/><ellipse cx="540" cy="890" rx="440" ry="640" fill="none" stroke="#e8c27a" stroke-width="22"/><ellipse cx="540" cy="890" rx="418" ry="618" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/>
    <g opacity="0.55" transform="translate(${-400 + g * 800},0)"><path d="M300,300 L420,300 L240,1260 L120,1260Z" fill="#fff" opacity="0.18"/></g></g>`; }
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  const a = pop(t, T.optA), b = pop(t, T.optB);
  let s = `<rect width="${W}" height="${H}" fill="#12090a" opacity="${0.55 * k}"/><text x="540" y="${1040 - 30 * (1 - ease(k))}" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ ARREGLAMOS MAÑANA?</text>`;
  if (a > 0) s += `<g transform="translate(540,1170) scale(${a})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><text x="0" y="26" font-family="Anton" font-size="64" text-anchor="middle" fill="${OUT}">A · MAQUILLAJE</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1310) scale(${b})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff">B · ROPA</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1448) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1550) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 6</text></g>`;
  return s;
}
function sparklesAll(t) { const a = win(t, T.reveal, T.mirrorEnd, 0.3, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return [[-230, 40, 28], [250, 120, 34], [-260, 300, 24], [270, 420, 30], [-220, 560, 26], [240, 640, 24], [0, -150, 30]].map(([x, y, r], i) => `<g transform="translate(${hh.x + x},${hh.y + y}) scale(${(0.7 + 0.3 * Math.sin(t * 8 + i)) * pop(t, T.reveal + i * 0.12, 0.3)}) rotate(${t * 40})" opacity="${a}"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join(''); }

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), seated = t >= T.sit + 0.28;
  const ks = karlaState(t), cs = catState(t);
  const py = lazyFy(t) - 830 * LZ.S, lx = lazyX(t);
  const lazy = t >= T.doorA + 0.3 ? `<g transform="translate(${lx},${py}) scale(${LZ.S})">${drawLazy(P)}</g>` : '';
  const smH = (hands) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(hands(Math.max(0, t - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const ksm = smH((tt) => karlaState(tt).hands);
  const drawK = (part) => drawKarla({ ...ks, elbowDown: true, armL: ksm.L, armR: ksm.R, blink: blinkOf(t, 1.9), look: -0.7, t, part });
  const proBody = `<g transform="translate(${PRO.x},${PRO.y}) scale(${PRO.s})">${drawK('body')}</g>`;
  const proTool = `<g transform="translate(${PRO.x},${PRO.y}) scale(${PRO.s})">${drawK('tool')}</g>`;
  const table = tableSvg(false);
  const cat = `<g transform="translate(${cs.x},${cs.y}) scale(${CATP.s})">${drawCat({ t, blink: cs.mood === 'sleep' ? 0.9 : blinkOf(t, 0.7), mood: cs.mood === 'shock' ? 'shock' : 'ok', pose: cs.pose, rot: cs.rot, look: 0 })}</g>`;
  const icons = talkIcon(t, 'B', PRO.x - 100, PRO.y - 150 * PRO.s);
  const fx = zzzFx(t) + measureFx(t) + marksFx(t) + waxFx(t) + tweezFx(t) + moleFx(t) + heartsFx(t) + sparklesAll(t);
  const chairG = (g) => `<g transform="translate(540,1690) scale(${K}) translate(-540,-1660)">${g}</g>`;
  const world = `<g transform="${worldT(cam)}"><image href="${studioPng}" width="${W}" height="${H}"/>${doorSvg(t)}${chairG(chairBack(seated))}${proBody}${table}${lazy}${seated ? chairG(chairFront()) : ''}${cat}${proTool}${icons}${fx}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}
    <defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world}
    ${mirrorOverlay(t)}${beforeAfter(t, P)}
    <g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 5/30</text></g>
    ${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}
    ${t < T.vote ? captions(t) : ''}${endCard(t)}${slate(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}
function beforeAfter(t, P) {
  const a0 = T.mirrorEnd - 3.2, a1 = T.mirrorEnd + 0.9, a = win(t, a0, a1, 0.35, 0.4); if (a <= 0) return '';
  const before = { ...P, browStyle: { k: 0, kl: 0, kr: 0, red: 0, shortL: 0 } };
  const card = (cx, label, pp, col) => `<g transform="translate(${cx},800) scale(${pop(t, a0, 0.4)})"><circle r="226" fill="#000" opacity="0.35" transform="translate(6,10)"/><clipPath id="ba${cx}"><circle r="212"/></clipPath><circle r="212" fill="#fde68a"/><g clip-path="url(#ba${cx})"><g transform="translate(0,170) scale(1.5) translate(0,215)">${drawLazy(pp)}</g></g><circle r="212" fill="none" stroke="#fff" stroke-width="12"/><circle r="218" fill="none" stroke="${OUT}" stroke-width="7"/><g transform="translate(0,268)"><rect x="-150" y="-44" width="300" height="88" rx="44" fill="${col}" stroke="${OUT}" stroke-width="7"/><text x="0" y="22" font-family="Anton" font-size="62" text-anchor="middle" fill="${OUT}">${label}</text></g></g>`;
  return `<g opacity="${a}"><rect width="${W}" height="${H}" fill="#0b0b10" opacity="0.88"/>${card(280, 'ANTES', before, '#e5e7eb')}${card(800, 'DESPUÉS', P, '#ffe14d')}<text x="540" y="1030" font-family="Anton" font-size="90" text-anchor="middle" fill="#5eead4" stroke="${OUT}" stroke-width="12" paint-order="stroke">→</text></g>`;
}
function tableSvg(clinic) {
  const top = clinic ? '#e2e8f0' : '#fbcfe8', body = clinic ? '#f8fafc' : '#f9a8d4', edge = clinic ? '#94a3b8' : '#be185d';
  const items = clinic ? `<rect x="800" y="1056" width="70" height="64" rx="10" fill="#38bdf8" stroke="${OUT}" stroke-width="5"/><rect x="900" y="1070" width="120" height="50" rx="10" fill="#e5e7eb" stroke="${OUT}" stroke-width="5"/><path d="M920,1070 q40,-34 80,0" stroke="${OUT}" stroke-width="5" fill="none"/>`
    : [['#ff4d8d', 70], ['#22d3ee', 90], ['#fbbf24', 60], ['#a78bfa', 80], ['#34d399', 66]].map(([c, h], i) => `<g transform="translate(${780 + i * 54},1120)"><rect x="-16" y="${-h}" width="32" height="${h}" rx="9" fill="${c}" stroke="${OUT}" stroke-width="4"/><rect x="-9" y="${-h - 12}" width="18" height="14" fill="#fff" stroke="${OUT}" stroke-width="3"/></g>`).join('') + `<ellipse cx="1000" cy="1100" rx="56" ry="20" fill="#fde68a" stroke="${OUT}" stroke-width="5"/>`;
  return `<g><rect x="700" y="1120" width="400" height="44" rx="12" fill="${top}" stroke="${OUT}" stroke-width="7"/><rect x="712" y="1164" width="376" height="260" fill="${body}" stroke="${OUT}" stroke-width="7"/><path d="M730,1200 h330 M730,1290 h330" stroke="${edge}" stroke-width="4" opacity="0.5"/><circle cx="900" cy="1250" r="10" fill="${edge}"/>${items}</g>`;
}
if (process.argv[2] === 'audit') {
  let n = 0, shrunk = 0, worst = 0;
  for (const l of DATA.lines) { const groups = []; let g = []; l.words.forEach(([ww]) => { g.push(ww); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(ww)) { groups.push(g); g = []; } }); if (g.length) groups.push(g);
    for (const gr of groups) { const txt = esc(gr.map((x) => x.replace(/\.\.\./g, '').toUpperCase()).join(' ')); let fs = 84, wd = inkWidth(txt, fs); if (wd > SAFE_W) { fs = Math.max(44, Math.floor(fs * SAFE_W / wd)); wd = inkWidth(txt, fs); shrunk++; console.log('ajustado', fs, txt); } n++; worst = Math.max(worst, wd); } }
  console.log('grupos', n, 'ajustados', shrunk, 'ancho maximo', worst, '(limite', SAFE_W + ')');
} else if (process.argv[2] === 'preview') {
  for (const s of process.argv.slice(3)) writeFileSync(path.join(B, `p_${s}.png`), frame(parseFloat(s)));
  console.log('preview ok', 'DUR', DUR.toFixed(2), 'frames', Math.round(DUR * FPS));
} else {
  const a0 = parseInt(process.argv[2] ?? '0'), total = Math.round(DUR * FPS), a1 = process.argv[3] && parseInt(process.argv[3]) >= 0 ? Math.min(parseInt(process.argv[3]), total) : total;
  const out = process.argv[4] || path.join(B, 'video_mudo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
