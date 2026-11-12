// Lazy Dawns - Dia 4: "El salon" (pelo). Voces: narrador, Mari, Vero (estilista), Memo (ayudante). Los personajes NO mueven la boca para hablar.
// Formato 1080x1920, mismo encuadre y tamanos que los dias 1-3.
// Uso: node render_dia04.mjs preview 5 12 ...   |   node render_dia04.mjs <inicio> <fin> <salida.mp4>   |   node render_dia04.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawMari, drawStylist, drawMemo } from './chars.mjs';
import { makeDirector } from './director4.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia04');
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
  slateEnd: 1.6, sit: L.l3.end + 0.15, memoIn: L.l7.start - 0.4,
  combA: L.l5.start + 1.0, combStuck: w('l6', 'entro'), combOut: L.l8.start + 0.4,
  washA: L.l9.start + 0.5, washB: L.l9.end + 0.2, cutA: L.l10.start + 0.3, cutB: L.l10.end,
  keratA: L.l11.start + 0.2, dryA: w('l11', 'secadora') + 0.2, ironA: w('l11', 'plancha') + 0.2, straightA: L.l12.start + 0.5, straightB: w('l12', 'seda') + 0.5,
  bottleA: w('l14', 'botella') - 0.5, greenA: w('l17', 'verde'), neutA: L.l20.start + 0.5, neutB: w('l20', 'perfecto') + 0.4,
  tapeA: L.l21.start + 1.5, growA: L.l22.start + 0.4, growB: L.l22.end - 0.1,
  mirrorStart: L.l23.start + 0.2, mirrorEnd: L.l24.start + 0.4, reveal: L.l23.start + 0.4, fanA: L.l23.start + 1.2,
  eyebrow: w('l26', 'cejas'), vote: w('l27', 'Que') - 0.1, optA: w('l27', 'cejas'), optB: w('l27', 'maquillaje'), cta1: w('l27', 'Comenta'), cta2: w('l27', 'sigueme'),
};
T.scenes = [T.slateEnd, T.sit, T.combStuck, T.washA, T.cutA, T.straightA, T.greenA, T.neutA, T.growA, T.mirrorStart, T.eyebrow, T.vote];
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });

// ---------------- FONDO: Salon Rapunzel ----------------
function roomSvg() {
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
  <g transform="translate(540,250)"><rect x="-380" y="-64" width="760" height="128" rx="34" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect x="-362" y="-48" width="724" height="96" rx="24" fill="#ec4899"/>
    <text x="30" y="26" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="8" paint-order="stroke" letter-spacing="3">SALÓN RAPUNZEL</text>
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
    <path d="M55,70 Q95,34 135,70 Q100,60 55,70Z" fill="#2a1a10"/><text x="95" y="290" font-family="Anton" font-size="26" text-anchor="middle" fill="#be185d">LARGO Y LACIO</text></g>
  <!-- carrito -->
  <g transform="translate(900,1330)"><ellipse cx="80" cy="86" rx="120" ry="18" fill="#000" opacity="0.25" filter="url(#b10)"/><rect x="0" y="0" width="170" height="14" fill="#fff" stroke="${OUT}" stroke-width="5"/><rect x="10" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/><rect x="148" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/>${prod(36, 0, '#ec4899', 56)}${prod(76, 0, '#38bdf8', 70)}${prod(116, 0, '#fde047', 50)}</g>
  <g transform="translate(1010,1380)"><path d="M-36,0 L-28,-70 L36,-70 L44,0Z" fill="#e8629c" stroke="${OUT}" stroke-width="6"/><path d="M4,-70 Q-60,-170 -30,-230 Q-8,-150 8,-70 Q40,-180 96,-200 Q60,-120 28,-70Z" fill="#4caf50" stroke="${OUT}" stroke-width="6"/></g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
}
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const roomPng = b64(new Resvg(roomSvg(), ropt).render().asPng());

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
const LZ = { x: 540, S: 0.62 };
const MARI = { x: 170, y: 930, s: 0.85 }, VERO = { x: 800, y: 880, s: 0.92 }, MEMO = { x: 985, y: 930, s: 0.85 };
const lazyFy = (t) => lerp(1480, 1380, smooth((t - T.sit) / 0.55));
const lazyHeadWorld = (t) => { const py = lazyFy(t) - 830 * LZ.S; return { x: 540, y: py - 215 * LZ.S }; };
// colocar una herramienta de un personaje de modo que su extremo de trabajo quede en (tx,ty)
function toolPose(ch, tipX, tipY, len, theta) { const r = theta * Math.PI / 180, ox = tipX - len * -Math.sin(r), oy = tipY - len * Math.cos(r); return { toolX: (ox - ch.x) / ch.s, toolY: (oy - ch.y) / ch.s, toolR: theta, toolS: 1 / ch.s * 0.92 * ch.s }; }
function veroState(t) {
  let mood = 'happy', tool = 'none', o = {}; const hh = lazyHeadWorld(t), Hx = hh.x, Hy = hh.y;
  if (t >= L.l3.start) mood = 'happy';
  if (t >= L.l5.start) { mood = 'focus'; }
  if (t >= T.combA && t < T.combStuck + 0.25) { tool = 'comb'; o = toolPose(VERO, Hx + 40, Hy - 70 + (t < T.combStuck ? Math.sin(t * 5) * 14 : 0), 198, 80); }
  if (t >= T.combStuck) mood = 'shock';
  if (t >= L.l8.start) { mood = 'calm'; }
  if (t >= T.washA && t < T.washB) { tool = 'none'; mood = 'happy'; }
  if (t >= T.cutA && t < T.cutB) { tool = 'scissors'; mood = 'focus'; o = toolPose(VERO, Hx - 80 + Math.sin(t * 3) * 20, Hy + 130, 236, 82); }
  if (t >= T.keratA && t < T.dryA) { tool = 'brush'; mood = 'happy'; o = toolPose(VERO, Hx + 40, Hy + 40, 258, 80); }
  if (t >= T.dryA && t < T.ironA) { tool = 'dryer'; o = toolPose(VERO, Hx + 100, Hy - 20, 270, 78); }
  if (t >= T.ironA && t < T.greenA - 3.6) { tool = 'iron'; mood = 'focus'; const k = clamp((t - T.straightA) / (T.straightB - T.straightA)); o = toolPose(VERO, Hx - 150, Hy + 130 + k * 260, 280, 86); }
  if (t >= T.straightB) { tool = 'none'; mood = 'proud'; }
  if (t >= L.l16.start) { mood = 'shock'; tool = 'none'; }
  if (t >= T.greenA) { mood = 'scream'; }
  if (t >= L.l19.start) { mood = 'calm'; tool = 'neutral'; o = toolPose(VERO, Hx + 120, Hy - 120, 150, 40); }
  if (t >= T.neutA) { tool = 'bottle'; mood = 'focus'; o = toolPose(VERO, Hx + 60, Hy - 60 + Math.sin(t * 4) * 20, 150, 70); }
  if (t >= T.neutB) { tool = 'none'; mood = 'proud'; }
  if (t >= L.l21.start) { mood = 'happy'; }
  if (t >= T.tapeA && t < T.growB + 0.5) { tool = 'tape'; mood = 'focus'; const k = clamp((t - T.growA) / (T.growB - T.growA)); o = toolPose(VERO, Hx + 200 - k * 20, Hy + 330 + k * 60, 320, 0); }
  if (t >= T.growB + 0.5) { tool = 'none'; mood = 'proud'; }
  if (t >= T.mirrorStart) { mood = 'happy'; tool = 'none'; }
  if (t >= L.l26.start) mood = 'amused';
  return { mood, tool, ...o };
}
function memoState(t) {
  let mood = 'happy', tool = 'none', o = {}; const x = lerp(1250, MEMO.x, ease((t - T.memoIn) / 0.7));
  if (t >= L.l7.start) mood = 'grin';
  if (t >= L.l8.start) mood = 'worry';
  if (t >= T.bottleA) { tool = 'bottleG'; mood = 'happy'; o = { toolX: -210, toolY: -10, toolR: 20, toolS: 0.9 }; }
  if (t >= L.l15.start) { mood = 'worry'; }
  if (t >= L.l16.start) { mood = 'shock'; }
  if (t >= T.greenA) { mood = 'shock'; tool = 'bottleG'; }
  if (t >= T.neutA) { tool = 'none'; mood = 'worry'; }
  if (t >= T.mirrorStart) mood = 'happy';
  return { x, mood, tool, ...o };
}
function mariState(t) {
  let mood = 'happy', hands = 'none', tears = false;
  if (t >= L.l3.start) { mood = 'relief'; hands = 'clasp'; }
  if (t >= L.l6.start) { mood = 'worry'; }
  if (t >= T.combStuck) { mood = 'shock'; hands = 'cheeks'; }
  if (t >= L.l8.start) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.washA) mood = 'happy';
  if (t >= T.cutA) { mood = 'worry'; hands = 'cover'; }
  if (t >= T.cutB) { mood = 'happy'; hands = 'clasp'; }
  if (t >= T.straightB) { mood = 'grin'; hands = 'cheeks'; }
  if (t >= L.l14.start) { mood = 'happy'; hands = 'clasp'; }
  if (t >= L.l16.start) { mood = 'worry'; hands = 'cheeks'; }
  if (t >= T.greenA) { mood = 'scream'; hands = 'cheeks'; }
  if (t >= L.l19.start) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.neutB) { mood = 'relief'; hands = 'clasp'; }
  if (t >= T.growA) { mood = 'shock'; hands = 'cheeks'; }
  if (t >= T.mirrorStart) { mood = 'cry'; hands = 'cheeks'; tears = true; }
  if (t >= L.l25.start) { mood = 'worry'; tears = false; hands = 'clasp'; }
  if (t >= L.l26.start) { mood = 'amused'; hands = 'none'; }
  return { mood, hands, tears };
}
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };

// ---------------- camara (encuadre Reels: foco en la zona segura, zoom grande) ----------------
const camKF = [[0, 1.0, 540, 900], [T.slateEnd, 1.0, 540, 900], [T.slateEnd + 1.2, 1.45, 540, 900], [L.l3.start, 1.45, 540, 900], [L.l3.start + 0.3, 1.5, 700, 930], [L.l3.end, 1.45, 540, 900],
  [L.l4.start, 1.5, 330, 930], [L.l4.end, 1.45, 540, 900], [L.l5.start, 1.55, 680, 900], [L.l5.end, 1.5, 560, 860], [T.combStuck - 0.3, 1.7, 540, 760], [T.combStuck + 1.6, 1.55, 540, 860],
  [L.l7.start, 1.5, 800, 930], [L.l7.end, 1.5, 700, 900], [L.l8.start, 1.5, 760, 900], [L.l8.end, 1.45, 540, 900], [T.washA - 0.3, 1.6, 540, 820], [T.washB, 1.55, 540, 860], [T.cutA - 0.2, 1.65, 540, 880], [T.cutB, 1.5, 540, 900],
  [L.l11.start, 1.5, 700, 900], [L.l11.end, 1.5, 560, 880], [T.straightA, 1.65, 540, 900], [T.straightB, 1.6, 540, 900], [L.l13.start, 1.5, 330, 930], [L.l13.end, 1.45, 540, 900],
  [L.l14.start, 1.5, 860, 930], [L.l15.end, 1.5, 860, 930], [L.l16.start, 1.55, 760, 900], [T.greenA - 0.2, 1.45, 540, 900], [T.greenA + 0.2, 1.7, 540, 840], [L.l18.start, 1.5, 330, 930], [L.l18.end, 1.45, 540, 900],
  [L.l19.start, 1.5, 760, 900], [T.neutA, 1.55, 560, 880], [T.neutB, 1.5, 540, 900], [L.l21.start, 1.5, 720, 900], [T.growA, 1.35, 540, 960], [T.growB, 1.35, 540, 960], [T.mirrorStart - 0.3, 1.45, 540, 900], [T.mirrorStart + 0.5, 1.5, 540, 880], [T.mirrorEnd, 1.5, 540, 880],
  [L.l24.start, 1.5, 330, 930], [L.l25.start, 1.45, 540, 900], [L.l26.start, 1.5, 330, 930], [L.l26.end, 1.5, 330, 930], [T.vote - 0.2, 1.3, 540, 900], [T.vote + 0.5, 1.0, 540, 900], [9999, 1.0, 540, 900]];
function camAt(t) {
  let i = 0; while (i < camKF.length - 1 && camKF[i + 1][0] <= t) i++;
  const a = camKF[i], b = camKF[Math.min(i + 1, camKF.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  let [z, fx, fy] = [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
  z = Math.max(z, 1.0);
  fx = clamp(fx, 540 / z, 1080 - 540 / z); fy = clamp(fy, SAFE.cy / z, H - (H - SAFE.cy) / z);
  const sh = win(t, T.sit + 0.3, T.sit + 0.7, 0.02, 0.3) * 6 + win(t, T.greenA - 0.05, T.greenA + 0.6, 0.02, 0.4) * 10 + win(t, T.combStuck, T.combStuck + 0.4, 0.02, 0.3) * 6;
  return { z, x: fx + Math.sin(t * 61) * sh, y: fy + Math.cos(t * 53) * sh };
}
const worldT = (cam) => `translate(540,${SAFE.cy}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`;

// ---------------- efectos de pelo y herramientas ----------------
function showerFx(t) { const a = win(t, T.washA, T.washB, 0.3, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return `<g opacity="${a}"><rect x="${hh.x - 12}" y="${hh.y - 420}" width="24" height="170" fill="#9ca3af" stroke="${OUT}" stroke-width="5"/><ellipse cx="${hh.x}" cy="${hh.y - 240}" rx="74" ry="22" fill="url(#chrome)" stroke="${OUT}" stroke-width="6"/>
    ${[...Array(26)].map((_, i) => { const ph = ((t * 1.8 + i * 0.173) % 1), x = hh.x + (i - 13) * 11, y = hh.y - 220 + ph * 330; return `<path d="M${x},${y} l-3,24" stroke="#7cc8ff" stroke-width="5" stroke-linecap="round" opacity="${0.9 - ph * 0.5}"/>`; }).join('')}</g>`; }
function steamFx(t) { const a = win(t, T.ironA, T.straightB + 0.4, 0.3, 0.6) + win(t, T.dryA, T.ironA, 0.3, 0.3) * 0.5; if (a <= 0) return ''; const hh = lazyHeadWorld(t); const ik = clamp((t - T.straightA) / (T.straightB - T.straightA));
  return `<g opacity="${clamp(a) * 0.85}">${[...Array(12)].map((_, i) => { const ph = ((t * 0.7 + i * 0.37) % 1); const x = hh.x - 150 + Math.sin(i * 2.1 + t * 2) * 50, y = hh.y + 150 + ik * 260 - ph * 260; return `<circle cx="${x}" cy="${y}" r="${24 + (i % 4) * 8 + ph * 18}" fill="#fff" opacity="${(1 - ph) * 0.55}" filter="url(#b10)"/>`; }).join('')}</g>`; }
function snippetsFx(t) { const a = win(t, T.cutA, T.cutB + 0.8, 0.1, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return [...Array(16)].map((_, i) => { const t0 = T.cutA + i * ((T.cutB - T.cutA) / 16), d = t - t0; if (d < 0 || d > 1.3) return ''; const x = hh.x + (i % 2 ? 1 : -1) * (120 + (i * 37) % 120) + Math.sin(d * 5 + i) * 18, y = hh.y + 60 + d * 360 + (i % 3) * 10;
    return `<g transform="translate(${x},${y}) rotate(${d * 200 + i * 40})" opacity="${1 - d / 1.3}"><path d="M-16,0 C-16,-18 8,-22 14,-8 C20,8 -4,16 -8,6" stroke="#1a1412" stroke-width="8" fill="none" stroke-linecap="round"/></g>`; }).join(''); }
function combProp(t) { if (t < T.combStuck || t >= T.combOut) return ''; const hh = lazyHeadWorld(t); const tug = t > T.combStuck + 0.6 ? Math.sin(t * 28) * 3 : 0;
  return `<g transform="translate(${hh.x + 70 + tug},${hh.y - 130}) rotate(-50) scale(0.8)"><g transform="translate(0,-40)">${(() => { return `<rect x="-14" y="-120" width="28" height="140" rx="12" fill="#ff7ab6" stroke="${OUT}" stroke-width="7"/><rect x="-90" y="10" width="180" height="30" rx="12" fill="#ff7ab6" stroke="${OUT}" stroke-width="7"/>${[...Array(12)].map((_, i) => `<rect x="${-84 + i * 15}" y="40" width="8" height="40" rx="3" fill="#ff7ab6" stroke="${OUT}" stroke-width="5"/>`).join('')}`; })()}</g></g>
    <g transform="translate(${hh.x + 20},${hh.y - 150})">${[...Array(7)].map((_, i) => `<path d="M${-30 + i * 12},${i % 2 ? 6 : -4} q${(i - 3) * 6},-30 ${(i - 3) * 14},-46" stroke="#1a1412" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9"/>`).join('')}</g>`; }
function dyeFx(t) { const a = win(t, T.greenA, T.greenA + 3.0, 0.05, 0.6); if (a <= 0) return ''; const hh = lazyHeadWorld(t); const pk = pop(t, T.greenA, 0.25);
  return `<g opacity="${a}"><g transform="translate(${hh.x},${hh.y - 40}) scale(${pk})"><text x="0" y="-210" font-family="Anton" font-size="110" text-anchor="middle" fill="#7cf29a" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡POOF!</text>${[...Array(8)].map((_, i) => `<circle cx="${Math.cos(i * 0.785) * 190}" cy="${Math.sin(i * 0.785) * 170}" r="${24 + (i % 3) * 8}" fill="#fff" opacity="0.8" filter="url(#b10)"/>`).join('')}</g>
    ${[...Array(10)].map((_, i) => { const ph = ((t - T.greenA) * 0.7 + i * 0.17) % 1, x = hh.x + (i % 2 ? 1 : -1) * (120 + (i * 29) % 140), y = hh.y + 130 + ph * 330; return `<path d="M${x},${y} q10,18 0,30 q-10,-12 0,-30Z" fill="#22c55e" stroke="${OUT}" stroke-width="3"/>`; }).join('')}</g>`; }
function growFx(t) { const a = win(t, T.growA, T.growB + 0.4, 0.2, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t); const k = clamp((t - T.growA) / (T.growB - T.growA));
  return `<g opacity="${a}">${[...Array(14)].map((_, i) => { const side = i % 2 ? 1 : -1, y = hh.y + 100 + ((i * 53 + t * 260) % 1) * 0 + (i * 0.07 * 600 * 0 ) + ((t * 190 + i * 47) % (200 + k * 560)); const x = hh.x + side * (200 + (i % 5) * 16 + Math.sin(t * 6 + i) * 8); return `<g transform="translate(${x},${y}) scale(${0.7 + 0.3 * Math.sin(t * 8 + i)}) rotate(${t * 60})"><path d="M0,-16 Q3,-3 16,0 Q3,3 0,16 Q-3,3 -16,0 Q-3,-3 0,-16Z" fill="#fff" stroke="${OUT}" stroke-width="3"/></g>`; }).join('')}</g>`; }
function windFx(t) { const a = win(t, T.fanA, L.l24.end, 0.5, 0.6); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return `<g opacity="${a * 0.8}">${[...Array(9)].map((_, i) => { const ph = ((t * 1.1 + i * 0.23) % 1), y = hh.y - 80 + i * 70, x = hh.x - 520 + ph * 300; return `<path d="M${x},${y} q60,-18 120,0 q50,14 90,-6" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="${Math.sin(ph * Math.PI)}"/>`; }).join('')}</g>`; }
function foamTowel(t) { const a = win(t, T.washA - 0.2, T.washB + 0.2, 0.3, 0.3); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return `<g opacity="${a}"><path d="M${hh.x - 170},${hh.y + 150} Q${hh.x},${hh.y + 210} ${hh.x + 170},${hh.y + 150} L${hh.x + 200},${hh.y + 230} Q${hh.x},${hh.y + 290} ${hh.x - 200},${hh.y + 230}Z" fill="#fde68a" stroke="${OUT}" stroke-width="7"/><path d="M${hh.x - 150},${hh.y + 190} Q${hh.x},${hh.y + 240} ${hh.x + 150},${hh.y + 190}" stroke="#f59e0b" stroke-width="7" fill="none"/></g>`; }

// ---------------- UI (zona segura) ----------------
const stepBanners = [['1', 'LAVADO', T.washA - 0.2, T.washB, '#7dd3fc'], ['2', 'CORTE', T.cutA - 0.2, T.cutB + 0.6, '#fbcfe8'], ['3', 'ALISADO', T.keratA, T.straightB + 0.6, '#fde68a'], ['4', 'COLOR', T.greenA + 0.3, T.neutB, '#86efac'], ['5', 'EXTENSIONES', T.growA - 0.1, T.growB + 0.6, '#c4b5fd']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="34" y="20" font-family="Anton" font-size="${text.length > 9 ? 56 : 66}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const SPEAK = { N: { col: '#ffe14d', name: null }, M: { col: '#ff9ad0', name: 'MARI' }, V: { col: '#c4b5fd', name: 'VERO' }, E: { col: '#86efac', name: 'MEMO' } };
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
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">ESCENA</text><text x="-310" y="52" font-family="Anton" font-size="54" fill="#f9a8d4">EL SALÓN</text>
    <text x="-310" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">DÍA</text><text x="-310" y="172" font-family="Anton" font-size="58" fill="#ff4d8d">4 / 30</text><text x="60" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">TOMA</text><text x="60" y="172" font-family="Anton" font-size="58" fill="#fff">1</text>
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
  if (a > 0) s += `<g transform="translate(540,1170) scale(${a})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="${OUT}">A · CEJAS</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1310) scale(${b})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><text x="0" y="26" font-family="Anton" font-size="68" text-anchor="middle" fill="#fff">B · MAQUILLAJE</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1448) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1550) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 5</text></g>`;
  return s;
}
function sparklesAll(t) { const a = win(t, T.reveal, T.mirrorEnd, 0.3, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return [[-230, 40, 28], [250, 120, 34], [-260, 300, 24], [270, 420, 30], [-220, 560, 26], [240, 640, 24], [0, -150, 30]].map(([x, y, r], i) => `<g transform="translate(${hh.x + x},${hh.y + y}) scale(${(0.7 + 0.3 * Math.sin(t * 8 + i)) * pop(t, T.reveal + i * 0.12, 0.3)}) rotate(${t * 40})" opacity="${a}"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join(''); }

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), seated = t >= T.sit + 0.28;
  const ms = mariState(t), vs = veroState(t), es = memoState(t);
  const py = lazyFy(t) - 830 * LZ.S;
  const lazy = `<g transform="translate(${LZ.x},${py}) scale(${LZ.S})">${drawLazy(P)}</g>`;
  const mari = `<g transform="translate(${MARI.x},${MARI.y}) scale(${MARI.s})">${drawMari({ mood: ms.mood, hands: ms.hands, tears: ms.tears, blink: blinkOf(t, 0.4), look: 0.7, t })}</g>`;
  const vero = `<g transform="translate(${VERO.x},${VERO.y}) scale(${VERO.s})">${drawStylist({ ...vs, blink: blinkOf(t, 1.9), look: -0.7, t, part: 'body' })}</g>`;
  const veroTool = `<g transform="translate(${VERO.x},${VERO.y}) scale(${VERO.s})">${drawStylist({ ...vs, t, part: 'tool' })}</g>`;
  const memo = es.x < 1180 ? `<g transform="translate(${es.x},${MEMO.y}) scale(${MEMO.s})">${drawMemo({ ...es, blink: blinkOf(t, 2.7), look: -0.7, t, part: 'body' })}</g><g transform="translate(${es.x},${MEMO.y}) scale(${MEMO.s})">${drawMemo({ ...es, t, part: 'tool' })}</g>` : '';
  const icons = talkIcon(t, 'M', MARI.x + 120, MARI.y - 150) + talkIcon(t, 'V', VERO.x - 120, VERO.y - 160) + talkIcon(t, 'E', es.x - 110, MEMO.y - 140);
  const fx = foamTowel(t) + showerFx(t) + steamFx(t) + snippetsFx(t) + combProp(t) + dyeFx(t) + growFx(t) + sparklesAll(t) + windFx(t);
  const world = `<g transform="${worldT(cam)}"><image href="${roomPng}" width="${W}" height="${H}"/>${chairBack(seated)}${mari}${vero}${lazy}${seated ? chairFront() : ''}${veroTool}${memo}${icons}${fx}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}
    <defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world}
    ${mirrorOverlay(t)}
    <g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 4/30</text></g>
    ${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}
    ${t < T.vote ? captions(t) : ''}${endCard(t)}${slate(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
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
