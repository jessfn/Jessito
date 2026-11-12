// Lazy Dawns - Dia 5: "El maquillaje" (quitar lunar + maquillaje moderno). Voces: narrador, Mari, Vero (estilista), Memo (ayudante). Los personajes NO mueven la boca para hablar.
// Formato 1080x1920, mismo encuadre y tamanos que los dias 1-3.
// Uso: node render_dia04.mjs preview 5 12 ...   |   node render_dia04.mjs <inicio> <fin> <salida.mp4>   |   node render_dia04.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawMari, drawDerm, drawNina, handsToTargets } from './chars.mjs';
import { makeDirector } from './director5.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia05');
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
  slateEnd: 1.6, sit: L.l3.end + 0.15, lampA: L.l4.start + 0.6, needleA: w('l7', 'anestesia'), laserA: w('l7', 'zumbido'), laserB: L.l8.start - 0.15,
  weekA: L.l10.start - 0.25, weekB: L.l10.start + 1.5, ninaIn: L.l10.start + 1.4,
  foundA: L.l12.start + 0.3, ghostA: w('l12', 'fantasma') - 0.9, swatchA: L.l15.start, matchA: L.l15.start + 0.5, matchB: w('l15', 'perfecto') + 0.3,
  contourA: w('l16', 'contorno'), hiA: w('l16', 'iluminador'), shadowA: w('l16', 'sombras'), linerA: w('l16', 'delineado'), lashA: w('l16', 'pestanas'), glossA: w('l17', 'gloss'),
  mirrorStart: L.l18.start + 0.3, reveal: L.l18.start + 0.5, mirrorEnd: L.l19.start + 0.5, photoA: w('l19', 'estrella') - 0.2,
  hook: L.l21.start, vote: w('l22', 'Que') - 0.1, optA: w('l22', 'ropa'), optB: w('l22', 'gimnasio'), cta1: w('l22', 'Comenta'), cta2: w('l22', 'sigueme'),
};
T.scenes = [T.slateEnd, T.sit, T.lampA, T.needleA, T.laserA, T.weekA, T.weekB, T.foundA, T.ghostA, T.matchA, T.contourA, T.shadowA, T.glossA, T.mirrorStart, T.hook, T.vote];
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
    <text x="30" y="26" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="8" paint-order="stroke" letter-spacing="3">ESTUDIO GLAM</text>
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
    <path d="M55,70 Q95,34 135,70 Q100,60 55,70Z" fill="#2a1a10"/><text x="95" y="290" font-family="Anton" font-size="26" text-anchor="middle" fill="#be185d">GLAM NATURAL</text></g>
  <!-- carrito -->
  <g transform="translate(900,1330)"><ellipse cx="80" cy="86" rx="120" ry="18" fill="#000" opacity="0.25" filter="url(#b10)"/><rect x="0" y="0" width="170" height="14" fill="#fff" stroke="${OUT}" stroke-width="5"/><rect x="10" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/><rect x="148" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/>${prod(36, 0, '#ec4899', 56)}${prod(76, 0, '#38bdf8', 70)}${prod(116, 0, '#fde047', 50)}</g>
  <g transform="translate(1010,1380)"><path d="M-36,0 L-28,-70 L36,-70 L44,0Z" fill="#e8629c" stroke="${OUT}" stroke-width="6"/><path d="M4,-70 Q-60,-170 -30,-230 Q-8,-150 8,-70 Q40,-180 96,-200 Q60,-120 28,-70Z" fill="#4caf50" stroke="${OUT}" stroke-width="6"/></g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
}
function clinicRoomSvg() {
  const wallL = [...Array(14)].map((_, r) => `<line x1="0" y1="${r * 66}" x2="${W}" y2="${r * 66}" stroke="#fff" stroke-opacity="0.5" stroke-width="3"/>`).join('') + [...Array(10)].map((_, c) => `<line x1="${c * 120}" y1="0" x2="${c * 120}" y2="1100" stroke="#fff" stroke-opacity="0.3" stroke-width="3"/>`).join('');
  const blinds = [...Array(9)].map((_, i) => `<rect x="0" y="${i * 34}" width="300" height="24" rx="6" fill="#fff" stroke="${OUT}" stroke-width="4"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eefcf7"/><stop offset="1" stop-color="#b5e8d6"/></linearGradient><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2edf1"/><stop offset="1" stop-color="#a5bcc8"/></linearGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#06323a" stop-opacity="0.45"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>
  <rect width="${W}" height="${H}" fill="url(#wl)"/>${wallL}
  <rect x="0" y="1090" width="${W}" height="300" fill="#0d9488"/><rect x="0" y="1078" width="${W}" height="24" fill="#fff" stroke="${OUT}" stroke-width="6"/>
  <rect x="0" y="1380" width="${W}" height="540" fill="url(#fl)"/>${[...Array(9)].map((_, i) => `<line x1="0" y1="${1400 + i * 64}" x2="${W}" y2="${1400 + i * 64}" stroke="#9fb4c2" stroke-width="3"/>`).join('')}<rect x="0" y="1376" width="${W}" height="22" fill="#e6f1f5" stroke="${OUT}" stroke-width="5"/>
  <g transform="translate(540,150) scale(0.82)"><rect x="-380" y="-64" width="760" height="128" rx="34" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect x="-362" y="-48" width="724" height="96" rx="24" fill="#14b8a6"/><text x="30" y="26" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="8" paint-order="stroke" letter-spacing="3">DERMA GLOW</text><path d="M-322,-4 h52 M-296,-30 v52" stroke="#fff" stroke-width="16" stroke-linecap="round"/></g>
  <g transform="translate(70,540)"><rect x="-12" y="-12" width="324" height="404" rx="14" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect width="300" height="380" fill="#bfe9ff" stroke="${OUT}" stroke-width="6"/>${blinds}</g>
  <g transform="translate(470,600) rotate(-2)"><rect x="8" y="14" width="190" height="260" fill="#000" opacity="0.2" filter="url(#b10)"/><rect width="190" height="260" fill="#fff" stroke="${OUT}" stroke-width="7"/><ellipse cx="95" cy="100" rx="50" ry="60" fill="#f2c4a2" stroke="${OUT}" stroke-width="4"/>${[0, 1, 2].map((i) => `<rect x="24" y="${176 + i * 24}" width="142" height="20" fill="${['#ffd1b0', '#ffb38a', '#e08a6a'][i]}" stroke="${OUT}" stroke-width="3"/>`).join('')}<text x="95" y="250" font-family="Anton" font-size="22" text-anchor="middle" fill="${OUT}">LA PIEL</text></g>
  <g transform="translate(800,560) rotate(3)"><rect x="8" y="14" width="200" height="130" fill="#000" opacity="0.2" filter="url(#b10)"/><rect width="200" height="130" fill="#fff" stroke="${OUT}" stroke-width="7"/><rect x="12" y="12" width="176" height="106" fill="#fffbe6" stroke="#c9a227" stroke-width="3"/><path d="M28,48 h144 M28,68 h110" stroke="#94a3b8" stroke-width="5"/><circle cx="160" cy="98" r="12" fill="#ef4444" stroke="${OUT}" stroke-width="3"/></g>
  <g transform="translate(30,1000)"><rect x="6" y="14" width="250" height="16" fill="#000" opacity="0.2" filter="url(#b10)"/><rect width="250" height="16" fill="#fff" stroke="${OUT}" stroke-width="5"/>${[['#22d3ee', 70], ['#a3e635', 90], ['#f472b6', 60], ['#fbbf24', 80]].map(([c, h], i) => `<g transform="translate(${34 + i * 56},0)"><rect x="-16" y="${-h}" width="32" height="${h}" rx="9" fill="${c}" stroke="${OUT}" stroke-width="4"/><rect x="-9" y="${-h - 12}" width="18" height="14" fill="#fff" stroke="${OUT}" stroke-width="3"/></g>`).join('')}</g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
}
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const studioPng = b64(new Resvg(studioRoomSvg(), ropt).render().asPng());
const clinicPng = b64(new Resvg(clinicRoomSvg(), ropt).render().asPng());

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
const MARI = { x: 135, y: 888, s: 0.72 }, PRO = { x: 925, y: 720, s: 0.78 };
const lazyFy = (t) => lerp(1500, 1382, smooth((t - T.sit) / 0.55));
const lazyHeadWorld = (t) => { const py = lazyFy(t) - 830 * LZ.S; return { x: 540, y: py - 215 * LZ.S }; };
const facePt = (t, lx, ly) => { const h = lazyHeadWorld(t); return { x: h.x + lx * LZ.S, y: h.y + ly * LZ.S }; }; // punto de la cara en coordenadas de cabeza
function toolPose(ch, tipX, tipY, len, theta) { const r = theta * Math.PI / 180, wl = len * ch.s, ox = tipX - wl * -Math.sin(r), oy = tipY - wl * Math.cos(r); return { toolX: (ox - ch.x) / ch.s, toolY: (oy - ch.y) / ch.s, toolR: theta, toolS: 1 }; }
const inClinic = (t) => t < T.weekA + 0.6;
function dermState(t) {
  if (t >= T.weekA + 0.7) return null; let mood = 'calm', tool = 'none', o = {}; const mp = facePt(t, 96, 94);
  const at = (len, th, p) => toolPose(PRO, p.x, p.y, len, th);
  if (t >= L.l4.start) mood = 'calm';
  if (t >= T.lampA && t < T.needleA - 0.3) { tool = 'lupa'; mood = 'focus'; o = at(200, 98, { x: mp.x + 10, y: mp.y - 4 }); }
  if (t >= L.l6.start) { tool = 'none'; mood = 'calm'; }
  if (t >= T.needleA - 0.3 && t < T.needleA + 1.3) { tool = 'syringe'; mood = 'serious'; o = at(214, 98, { x: mp.x + 14, y: mp.y + 6 }); }
  if (t >= T.laserA - 0.3 && t < T.laserB + 0.3) { tool = 'laser'; mood = 'focus'; o = at(200, 98, { x: mp.x + 12, y: mp.y }); }
  if (t >= T.laserB + 0.3) { tool = 'none'; mood = 'proud'; }
  return { mood, tool, hands: 'none', ...o };
}
function ninaState(t) {
  if (t < T.ninaIn - 0.9) return null; const x = lerp(1250, PRO.x, ease((t - (T.ninaIn - 0.9)) / 0.9)); let mood = 'happy', tool = 'none', o = {};
  const at = (len, th, lx, ly) => { const p = facePt(t, lx, ly); return toolPose(PRO, p.x, p.y, len, th); };
  if (t >= T.foundA && t < T.matchA) { tool = 'sponge'; mood = 'focus'; o = at(180, 96, 70 + Math.sin(t * 5) * 38, 20 + Math.cos(t * 4) * 70); }
  if (t >= T.ghostA) { mood = 'shock'; }
  if (t >= L.l14.start) { tool = 'none'; mood = 'worry'; }
  if (t >= T.swatchA && t < T.matchB + 0.6) { tool = 'palette'; mood = 'focus'; o = at(150, 92, 118, 138); }
  if (t >= T.matchB + 0.6) { tool = 'none'; mood = 'happy'; }
  if (t >= T.contourA - 0.3 && t < T.shadowA - 0.2) { tool = 'brushM'; mood = 'focus'; o = at(190, 100, 142 + Math.sin(t * 7) * 8, 40 + Math.sin(t * 5) * 22); }
  if (t >= T.shadowA - 0.2 && t < T.linerA - 0.2) { tool = 'brushM'; o = at(190, 98, 74, -52); }
  if (t >= T.linerA - 0.2 && t < T.lashA - 0.2) { tool = 'wandL'; o = at(206, 96, 118, -44); }
  if (t >= T.lashA - 0.2 && t < T.glossA - 0.4) { tool = 'wandL'; o = at(206, 96, 74, -54 + Math.sin(t * 9) * 4); }
  if (t >= T.glossA - 0.4 && t < T.glossA + 2.0) { tool = 'gloss'; o = at(190, 96, 30, 102); }
  if (t >= T.glossA + 2.0) { tool = 'none'; mood = 'proud'; }
  if (t >= T.mirrorStart) mood = 'happy';
  if (t >= L.l19.start) mood = 'grin';
  const hands = (mood === 'shock' || mood === 'worry') && tool === 'none' ? 'cheeks' : (mood === 'proud' || mood === 'grin') ? 'clasp' : 'none';
  return { x, mood, tool, hands, ...o };
}
function mariState(t) {
  let mood = 'happy', hands = 'none', tears = false;
  if (t >= L.l3.start) { mood = 'relief'; hands = 'clasp'; }
  if (t >= L.l5.start) { mood = 'worry'; }
  if (t >= T.laserA) { mood = 'worry'; hands = 'cover'; }
  if (t >= T.laserB + 0.3) { mood = 'happy'; hands = 'clasp'; }
  if (t >= L.l9.start) { mood = 'grin'; hands = 'cheeks'; }
  if (t >= T.ninaIn) { mood = 'happy'; hands = 'clasp'; }
  if (t >= T.ghostA) { mood = 'scream'; hands = 'cheeks'; }
  if (t >= L.l14.start) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.matchB) { mood = 'relief'; hands = 'clasp'; }
  if (t >= L.l16.start) { mood = 'happy'; }
  if (t >= T.mirrorStart) { mood = 'cry'; hands = 'cheeks'; tears = true; }
  if (t >= L.l19.start) { mood = 'grin'; tears = false; hands = 'cheeks'; }
  if (t >= L.l20.start) { mood = 'worry'; hands = 'clasp'; }
  if (t >= L.l21.start) { mood = 'amused'; hands = 'none'; }
  return { mood, hands, tears };
}
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
function camAt(t) { // encuadre fijo 9:16 completo: no se acerca ni se recorta nada
  const sh = win(t, T.sit + 0.3, T.sit + 0.7, 0.02, 0.3) * 4 + win(t, T.ghostA, T.ghostA + 0.6, 0.02, 0.4) * 6 + win(t, T.laserA, T.laserA + 0.4, 0.02, 0.3) * 3;
  return { z: 1 + sh * 0.004, x: 540 + Math.sin(t * 61) * sh * 0.5, y: 960 + Math.cos(t * 53) * sh * 0.5 };
}
const worldT = (cam) => `translate(540,${SAFE.cy}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`;

// ---------------- efectos ----------------
function laserFx(t) { const a = win(t, T.laserA, T.laserB, 0.1, 0.2); if (a <= 0) return ''; const mp = facePt(t, 96, 94);
  return `<g opacity="${a}"><circle cx="${mp.x}" cy="${mp.y}" r="${18 + Math.abs(Math.sin(t * 40)) * 10}" fill="#ff4d4d" opacity="0.5" filter="url(#b10)"/>${[...Array(6)].map((_, i) => { const ph = ((t * 2 + i * 0.31) % 1); return `<circle cx="${mp.x + Math.sin(i * 2.3) * 16}" cy="${mp.y - 14 - ph * 90}" r="${10 + ph * 18}" fill="#d1d5db" opacity="${(1 - ph) * 0.6}" filter="url(#b10)"/>`; }).join('')}${[...Array(5)].map((_, i) => `<line x1="${mp.x}" y1="${mp.y}" x2="${mp.x + Math.cos(i * 1.3 + t * 30) * 34}" y2="${mp.y + Math.sin(i * 1.3 + t * 30) * 34}" stroke="#ffe14d" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>`; }
function needleFx(t) { const a = win(t, T.needleA, T.needleA + 1.0, 0.1, 0.4); if (a <= 0) return ''; const mp = facePt(t, 96, 94);
  return `<g opacity="${a}" transform="translate(${mp.x},${mp.y})"><circle r="${26 * pop(t, T.needleA, 0.3)}" fill="#bfe9ff" opacity="0.5"/><text x="30" y="-30" font-family="Anton" font-size="44" fill="#fff" stroke="${OUT}" stroke-width="8" paint-order="stroke">¡AU!</text></g>`; }
function checkFx(t) { const a = win(t, T.laserB + 0.3, T.laserB + 2.2, 0.2, 0.4); if (a <= 0) return ''; const mp = facePt(t, 96, 94);
  return `<g opacity="${a}" transform="translate(${mp.x + 90},${mp.y - 70}) scale(${pop(t, T.laserB + 0.3, 0.35)})"><circle r="46" fill="#22c55e" stroke="${OUT}" stroke-width="7"/><path d="M-20,2 l14,16 l28,-32" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`; }
function ghostFx(t) { const a = win(t, T.ghostA, L.l13.end + 0.5, 0.15, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t); const fl = Math.sin(t * 6) * 8;
  return `<g opacity="${a}"><g transform="translate(${hh.x},${hh.y - 205 + fl}) scale(${pop(t, T.ghostA, 0.3)})"><text x="0" y="0" font-family="Anton" font-size="84" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡BUU!</text></g>${[...Array(6)].map((_, i) => `<path d="M${hh.x - 250 + i * 100},${hh.y - 120 + Math.sin(t * 5 + i) * 18} q-10,-30 0,-50 q14,-20 28,0 q10,20 0,50z" fill="#fff" opacity="0.5" stroke="${OUT}" stroke-width="3"/>`).join('')}</g>`; }
function swatchFx(t) { const a = win(t, T.swatchA, T.matchB + 0.8, 0.2, 0.4); if (a <= 0) return ''; const k = clamp((t - T.swatchA) / (T.matchB - T.swatchA)); const cols = ['#f6e7d6', '#e8c8a3', '#cfa070', '#b07b4f', '#8f5d3a'];
  return `<g opacity="${a}" transform="translate(540,470)">${cols.map((c, i) => { const act = Math.min(4, Math.floor(k * 5.4)); const ok = i === 3 && k > 0.95; return `<g transform="translate(${(i - 2) * 112},${i === act ? -10 : 0}) scale(${pop(t, T.swatchA + i * 0.2, 0.3)})"><rect x="-44" y="-44" width="88" height="88" rx="22" fill="${c}" stroke="${ok ? '#22c55e' : OUT}" stroke-width="${ok ? 10 : 6}"/>${ok ? `<path d="M-16,2 l12,14 l24,-28" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : (i < act ? `<path d="M-14,-14 l28,28 M14,-14 l-28,28" stroke="${OUT}" stroke-width="7" stroke-linecap="round" opacity="0.5"/>` : '')}</g>`; }).join('')}</g>`; }
function glamFx(t) { const a = win(t, T.photoA, L.l19.end + 1.2, 0.2, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  const flash = [0, 0.5, 1.0].map((d) => { const x = t - (T.photoA + d); return x >= 0 && x < 0.18 ? `<rect width="${W}" height="${H}" fill="#fff" opacity="${0.7 * (1 - x / 0.18)}"/>` : ''; }).join('');
  return `<g opacity="${a}">${[[-250, 20, 30], [260, 60, 36], [-270, 280, 26], [280, 330, 32], [-230, 520, 28], [240, 560, 26]].map(([x, y, r], i) => `<g transform="translate(${hh.x + x},${hh.y + y}) scale(${(0.7 + 0.3 * Math.sin(t * 9 + i)) * pop(t, T.photoA + i * 0.1, 0.3)}) rotate(${t * 50})"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join('')}</g>${flash}`; }
function weekCard(t) {
  const a = win(t, T.weekA, T.weekB, 0.3, 0.4); if (a <= 0) return ''; const k = clamp((t - T.weekA) / (T.weekB - T.weekA)); const day = Math.min(7, Math.floor(k * 7) + 1);
  const dias = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  return `<g opacity="${a}"><rect width="${W}" height="${H}" fill="#0b1226"/>${[...Array(26)].map((_, i) => `<circle cx="${(i * 211) % W}" cy="${(i * 337 + t * 40) % H}" r="${3 + i % 4}" fill="#fff" opacity="0.25"/>`).join('')}
    <text x="540" y="620" font-family="Anton" font-size="140" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="4">UNA SEMANA</text><text x="540" y="810" font-family="Anton" font-size="140" text-anchor="middle" fill="#ff4d8d" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="4">DESPUÉS</text>
    <g transform="translate(540,1150)"><rect x="-230" y="-170" width="460" height="360" rx="34" fill="#fff" stroke="${OUT}" stroke-width="9"/><rect x="-230" y="-170" width="460" height="100" rx="34" fill="#14b8a6" stroke="${OUT}" stroke-width="9"/><rect x="-226" y="-110" width="452" height="40" fill="#14b8a6"/><text x="0" y="-98" font-family="Anton" font-size="60" text-anchor="middle" fill="#fff">DÍA ${day}</text><text x="0" y="60" font-family="Anton" font-size="150" text-anchor="middle" fill="${OUT}">${dias[day - 1]}</text></g></g>`;
}

// ---------------- UI (zona segura) ----------------
const stepBanners = [['1', 'REVISIÓN', T.lampA, T.needleA - 0.5, '#7dd3fc'], ['2', 'LÁSER', T.needleA - 0.4, T.laserB + 0.9, '#fbcfe8'], ['3', 'BASE', T.foundA - 0.2, T.ghostA + 0.8, '#fde68a'], ['4', 'TONO PERFECTO', T.swatchA, T.matchB + 0.9, '#86efac'], ['5', 'CONTORNO', T.contourA - 0.2, T.shadowA - 0.2, '#fdba74'], ['6', 'OJOS', T.shadowA - 0.1, T.glossA - 0.3, '#c4b5fd'], ['7', 'GLOSS', T.glossA - 0.2, T.glossA + 2.3, '#fda4af']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="34" y="20" font-family="Anton" font-size="${text.length > 9 ? 56 : 66}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const SPEAK = { N: { col: '#ffe14d', name: null }, M: { col: '#ff9ad0', name: 'MARI' }, S: { col: '#7dd3fc', name: 'DRA. VALENTINA' }, K: { col: '#f9a8d4', name: 'NINA' } };
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
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">ESCENA</text><text x="-310" y="52" font-family="Anton" font-size="54" fill="#f9a8d4">EL MAQUILLAJE</text>
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
  if (a > 0) s += `<g transform="translate(540,1170) scale(${a})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="${OUT}">A · ROPA</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1310) scale(${b})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><text x="0" y="26" font-family="Anton" font-size="68" text-anchor="middle" fill="#fff">B · GIMNASIO</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1448) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1550) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 6</text></g>`;
  return s;
}
function sparklesAll(t) { const a = win(t, T.reveal, T.mirrorEnd, 0.3, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return [[-230, 40, 28], [250, 120, 34], [-260, 300, 24], [270, 420, 30], [-220, 560, 26], [240, 640, 24], [0, -150, 30]].map(([x, y, r], i) => `<g transform="translate(${hh.x + x},${hh.y + y}) scale(${(0.7 + 0.3 * Math.sin(t * 8 + i)) * pop(t, T.reveal + i * 0.12, 0.3)}) rotate(${t * 40})" opacity="${a}"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join(''); }

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), seated = t >= T.sit + 0.28, clinic = inClinic(t);
  const ms = mariState(t), ds = dermState(t), ns = ninaState(t); const pro = clinic ? ds : ns;
  const py = lazyFy(t) - 830 * LZ.S;
  const lazy = `<g transform="translate(${LZ.x},${py}) scale(${LZ.S})">${drawLazy(P)}</g>`;
  const smH = (hands) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(hands(Math.max(0, t - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const msm = smH((tt) => mariState(tt).hands), psm = smH((tt) => { const q = inClinic(tt) ? dermState(tt) : ninaState(tt); return q ? q.hands : 'none'; });
  const mari = `<g transform="translate(${MARI.x},${MARI.y}) scale(${MARI.s})">${drawMari({ mood: ms.mood, armL: msm.L, armR: msm.R, tears: ms.tears, blink: blinkOf(t, 0.4), look: 0.7, t })}</g>`;
  const drawPro = (part) => !pro ? '' : (clinic ? drawDerm : drawNina)({ ...pro, armL: psm.L, armR: psm.R, blink: blinkOf(t, 1.9), look: -0.7, t, part });
  const px = pro && pro.x !== undefined ? pro.x : PRO.x;
  const proBody = pro ? `<g transform="translate(${px},${PRO.y}) scale(${PRO.s})">${drawPro('body')}</g>` : '';
  const proTool = pro ? `<g transform="translate(${px},${PRO.y}) scale(${PRO.s})">${drawPro('tool')}</g>` : '';
  const table = tableSvg(clinic);
  const icons = talkIcon(t, 'M', MARI.x + 100 * MARI.s / 0.8, MARI.y - 150 * MARI.s) + talkIcon(t, clinic ? 'S' : 'K', px - 100, PRO.y - 150 * PRO.s);
  const hhS = lazyHeadWorld(t);
  const fx = laserFx(t) + needleFx(t) + checkFx(t) + ghostFx(t) + glamFx(t) + sparklesAll(t);
  const chairG = (g) => `<g transform="translate(540,1690) scale(${K}) translate(-540,-1660)">${g}</g>`;
  const world = `<g transform="${worldT(cam)}"><image href="${clinic ? clinicPng : studioPng}" width="${W}" height="${H}"/>${chairG(chairBack(seated))}${mari}${proBody}${table}${lazy}${seated ? chairG(chairFront()) : ''}${proTool}${icons}${fx}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}
    <defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world}
    ${mirrorOverlay(t)}${beforeAfter(t, P)}
    <g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 5/30</text></g>
    ${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}
    ${weekCard(t)}${t < T.vote ? captions(t) : ''}${endCard(t)}${slate(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}
function beforeAfter(t, P) {
  const a0 = T.mirrorEnd - 3.4, a1 = T.mirrorEnd + 1.0, a = win(t, a0, a1, 0.35, 0.4); if (a <= 0) return '';
  const before = { ...P, hair: { s: 0, len: 0.5, shine: 0.3 }, makeup: { mole: 1 }, skin: { acne: 1, mask: 0, dry: 0, foam: 0, patch: 0, glow: 0, red: 0 }, mouth: { ...P.mouth, lip: undefined, teeth: { clean: 0, braces: 0, crooked: 1, extra: 0 } }, teeth: { clean: 0, braces: 0, crooked: 1, extra: 0 } };
  const card = (cx, label, pp, col) => `<g transform="translate(${cx},800) scale(${pop(t, a0, 0.4)})"><circle r="226" fill="#000" opacity="0.35" transform="translate(6,10)"/><clipPath id="ba${cx}"><circle r="212"/></clipPath><circle r="212" fill="#fbcfe8"/><g clip-path="url(#ba${cx})"><g transform="translate(0,60) scale(0.9) translate(0,215)">${drawLazy(pp)}</g></g><circle r="212" fill="none" stroke="#fff" stroke-width="12"/><circle r="218" fill="none" stroke="${OUT}" stroke-width="7"/><g transform="translate(0,268)"><rect x="-150" y="-44" width="300" height="88" rx="44" fill="${col}" stroke="${OUT}" stroke-width="7"/><text x="0" y="22" font-family="Anton" font-size="62" text-anchor="middle" fill="${OUT}">${label}</text></g></g>`;
  return `<g opacity="${a}"><rect width="${W}" height="${H}" fill="#0b0b10" opacity="0.88"/>${card(280, 'ANTES', before, '#e5e7eb')}${card(800, 'DESPUÉS', P, '#ffe14d')}<text x="540" y="1030" font-family="Anton" font-size="90" text-anchor="middle" fill="#ff4d8d" stroke="${OUT}" stroke-width="12" paint-order="stroke">→</text></g>`;
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
