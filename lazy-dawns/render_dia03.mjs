// Lazy Dawns - Dia 3: "El dentista" (dientes). Varias voces (narrador, Mari, Dr. Mendoza): los personajes NO mueven la boca, solo se oye su voz.
// Uso: node render_dia03.mjs preview 5 12 ...        (PNGs de prueba)   |   node render_dia03.mjs <inicio> <fin> <salida.mp4>
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawMari, drawDentist } from './chars.mjs';
import { makeDirector } from './director3.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia03');
const W = 1080, H = 1920, FPS = 30;
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
  slateEnd: 1.5, sit: L.l3.end + 0.1, xrayStart: L.l6.start + 0.5, xrayEnd: L.l9.end + 0.3,
  exA: w('l4', 'grande') - 0.2, exB: w('l5', 'serio') - 0.4,
  needle: w('l12', 'piquetito'), nA: L.l11.start - 0.2, nB: L.l12.end + 0.7,
  drillW: w('l13', 'turbina'), crack: w('l13', 'crac'), eA: L.l13.start - 0.3, eB: L.l14.end + 0.3,
  dark: w('l15', 'luz'), power: w('l19', 'volvio'),
  cA: L.l18.start + 0.5, cB: w('l19', 'volvio') - 0.15, whA: w('l19', 'volvio') + 0.25, whB: L.l20.start - 0.1,
  brA: L.l20.start, brB: L.l21.start - 0.35,
  mirrorStart: L.l22.start + 0.1, mirrorEnd: L.l22.end - 0.1, reveal: L.l22.start + 0.4,
  skipA: L.l22b.start + 0.05, skipB: L.l22b.start + 3.6, bracesOff: w('l22b', 'quito'), finalA: w('l22c', 'derecha') - 0.25, finalB: w('l22c', 'mia') + 0.6,
  eyebrow: w('l23', 'cejas'), vote: w('l24', 'Que') - 0.1, optA: w('l24', 'cejas'), optB: w('l24', 'pelo'), cta1: w('l24', 'Comenta'), cta2: w('l24', 'sigueme'),
};
T.cleanA = T.cA; T.cleanB = T.cB; T.whiteA = T.whA; T.whiteB = T.whB; T.bracketA = T.brA + 0.3; T.bracketB = T.brB;
T.closeups = [[T.exA, T.exB, 'exam'], [T.nA, T.nB, 'needle'], [T.eA, T.eB, 'extract'], [T.cA, T.cB, 'clean'], [T.whA, T.whB, 'white'], [T.brA, T.brB, 'brackets'], [T.finalA, T.finalB, 'final']];
T.mouthWins = T.closeups.filter((c) => c[2] !== 'final').map(([a, b]) => [a, b]);
T.scenes = [T.slateEnd, T.sit, T.exA, T.exB, T.xrayStart, T.xrayEnd, T.nA, T.eA, T.dark, T.cA, T.power, T.whA, T.brA, T.mirrorStart, T.skipA, T.skipB, T.bracesOff, T.finalA, T.eyebrow, T.vote];
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });

// ---------------- FONDO: consultorio dental ----------------
function roomSvg() {
  const wall = [...Array(14)].map((_, r) => `<line x1="0" y1="${360 + r * 62}" x2="${W}" y2="${360 + r * 62}" stroke="#fff" stroke-opacity="0.45" stroke-width="3"/>`).join('') + [...Array(10)].map((_, c) => `<line x1="${c * 120}" y1="360" x2="${c * 120}" y2="1100" stroke="#fff" stroke-opacity="0.3" stroke-width="3"/>`).join('');
  const floor = [...Array(9)].map((_, i) => `<line x1="0" y1="${1400 + i * 64}" x2="${W}" y2="${1400 + i * 64}" stroke="#9fb4c2" stroke-width="3"/>`).join('') + [...Array(10)].map((_, i) => `<line x1="${i * 120}" y1="1400" x2="${i * 120 + (i - 4.5) * 70}" y2="1920" stroke="#9fb4c2" stroke-width="3"/>`).join('');
  const blinds = [...Array(9)].map((_, i) => `<rect x="0" y="${i * 34}" width="300" height="24" rx="6" fill="#fff" stroke="${OUT}" stroke-width="4"/>`).join('');
  // radiografia panoramica (caja de luz)
  const xr = (() => { let s = ''; for (let i = 0; i < 8; i++) { const x = 40 + i * 31, yU = 84 + Math.pow(i - 3.5, 2) * 2, yL = 138 - Math.pow(i - 3.5, 2) * 2; s += `<rect x="${x}" y="${yU}" width="22" height="${38 + (i % 3) * 4}" rx="9" fill="#e5f3ff" opacity="0.88" transform="rotate(${[-9, 6, -5, 9, -8, 5, -10, 8][i]} ${x + 11} ${yU})"/><rect x="${x}" y="${yL}" width="20" height="${-30 - (i % 2) * 4}" rx="8" fill="#e5f3ff" opacity="0.8" transform="rotate(${[6, -7, 4, -8, 6, -5, 8, -6][i]} ${x + 10} ${yL})"/>`; } return s; })();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3fbff"/><stop offset="1" stop-color="#cfe9f4"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe7ec"/><stop offset="1" stop-color="#a9b9c4"/></linearGradient>
  <radialGradient id="lampg" cx="0.5" cy="0" r="0.9"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.9"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#06242e" stop-opacity="0.5"/></radialGradient>
  <linearGradient id="ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.4"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
  <filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>${wall}
  <rect x="0" y="1090" width="${W}" height="300" fill="#0e7490"/><rect x="0" y="1078" width="${W}" height="24" fill="#fff" stroke="${OUT}" stroke-width="6"/><path d="M0,1180 H${W}" stroke="#0a5c72" stroke-width="4"/>
  <rect x="0" y="1380" width="${W}" height="540" fill="url(#floor)"/>${floor}<rect x="0" y="1376" width="${W}" height="22" fill="#e6f1f5" stroke="${OUT}" stroke-width="5"/>
  <rect x="80" y="70" width="920" height="110" rx="20" fill="#fff" stroke="${OUT}" stroke-width="7" opacity="0.95"/><rect x="80" y="70" width="920" height="110" rx="20" fill="url(#lampg)"/>
  <ellipse cx="540" cy="360" rx="520" ry="340" fill="url(#lampg)" opacity="0.5"/>
  <!-- letrero -->
  <g transform="translate(850,505) scale(0.52)"><rect x="-300" y="-54" width="600" height="108" rx="28" fill="#fff" stroke="${OUT}" stroke-width="7"/><rect x="-284" y="-40" width="568" height="80" rx="20" fill="#0ea5e9"/><text x="34" y="24" font-family="Anton" font-size="66" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="7" paint-order="stroke" letter-spacing="3">DR. MENDOZA</text>
    <g transform="translate(-236,0)"><path d="M-26,-26 C-26,-44 26,-44 26,-26 C28,-4 16,30 8,30 C2,30 2,10 0,10 C-2,10 -2,30 -8,30 C-16,30 -28,-4 -26,-26Z" fill="#fff" stroke="${OUT}" stroke-width="5"/></g></g>
  <!-- ventana -->
  <g transform="translate(60,580)"><rect x="-12" y="-12" width="324" height="364" rx="14" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect width="300" height="340" fill="#bfe9ff" stroke="${OUT}" stroke-width="6"/>${blinds}<path d="M300,0 L-100,520 L120,520 L300,200Z" fill="url(#ray)"/></g>
  <!-- diplomas -->
  ${[[400, 600, 150], [400, 780, 150]].map(([x, y, ww]) => `<g transform="translate(${x},${y})"><rect x="6" y="10" width="${ww}" height="120" fill="#000" opacity="0.2" filter="url(#b10)"/><rect width="${ww}" height="120" fill="#fff" stroke="${OUT}" stroke-width="6"/><rect x="12" y="12" width="${ww - 24}" height="96" fill="#fffbe6" stroke="#c9a227" stroke-width="3"/><path d="M28,50 h${ww - 56} M28,70 h${ww - 80}" stroke="#94a3b8" stroke-width="5"/><circle cx="${ww - 38}" cy="92" r="12" fill="#ef4444" stroke="${OUT}" stroke-width="3"/></g>`).join('')}
  <!-- cartel de diente -->
  <g transform="translate(870,560) rotate(2)"><rect x="8" y="14" width="190" height="300" fill="#000" opacity="0.25" filter="url(#b10)"/><rect width="190" height="300" fill="#fff" stroke="${OUT}" stroke-width="7"/><rect x="12" y="12" width="166" height="276" fill="#7dd3fc" stroke="${OUT}" stroke-width="4"/>
    <path d="M95,60 C40,60 40,110 52,150 C60,190 70,230 84,230 C94,230 92,190 95,190 C98,190 96,230 106,230 C120,230 130,190 138,150 C150,110 150,60 95,60Z" fill="#fff" stroke="${OUT}" stroke-width="5"/><circle cx="78" cy="112" r="7" fill="${OUT}"/><circle cx="112" cy="112" r="7" fill="${OUT}"/><path d="M78,140 Q95,156 112,140" stroke="${OUT}" stroke-width="5" fill="none"/>
    <text x="95" y="270" font-family="Anton" font-size="34" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="6" paint-order="stroke">¡SONRÍE!</text></g>
  <!-- caja de luz con radiografia -->
  <g transform="translate(700,820)"><rect x="6" y="12" width="300" height="220" fill="#000" opacity="0.25" filter="url(#b10)"/><rect width="300" height="220" rx="12" fill="#e5e7eb" stroke="${OUT}" stroke-width="7"/><rect x="14" y="14" width="272" height="192" fill="#0b1b2b"/><g transform="translate(0,10)">${xr}</g><path d="M30,60 Q150,20 270,60" stroke="#e5f3ff" stroke-opacity="0.35" stroke-width="4" fill="none"/></g>
  <!-- estante con mandibula y vasos -->
  <g transform="translate(60,1000)"><rect x="6" y="14" width="260" height="16" fill="#000" opacity="0.25" filter="url(#b10)"/><rect width="260" height="16" fill="#fff" stroke="${OUT}" stroke-width="5"/>
    <path d="M30,0 C20,-50 40,-70 90,-70 C140,-70 160,-50 150,0Z" fill="#fff7ed" stroke="${OUT}" stroke-width="5"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${48 + i * 18}" y="-60" width="14" height="22" rx="5" fill="#fff" stroke="${OUT}" stroke-width="3"/>`).join('')}
    <rect x="190" y="-56" width="48" height="56" rx="10" fill="#bfe9ff" stroke="${OUT}" stroke-width="5"/>${[0, 1, 2].map((i) => `<rect x="${198 + i * 14}" y="${-84 + i * 4}" width="9" height="34" rx="4" fill="${['#ff4d8d', '#22d3ee', '#a3e635'][i]}" stroke="${OUT}" stroke-width="3"/>`).join('')}</g>
  <!-- carrito de instrumentos -->
  <g transform="translate(790,1330)"><ellipse cx="90" cy="86" rx="130" ry="20" fill="#000" opacity="0.25" filter="url(#b10)"/><rect x="0" y="0" width="190" height="14" fill="#e5e7eb" stroke="${OUT}" stroke-width="5"/><rect x="10" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/><rect x="168" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/>
    ${[[16, -4, 80, -30], [60, -2, 100, -50], [110, -4, 62, -22]].map(([x, y, ww, hh]) => `<rect x="${x}" y="${hh}" width="6" height="${-hh}" rx="3" fill="#cbd5e1" stroke="${OUT}" stroke-width="2"/>`).join('')}<path d="M130,0 l24,-26 l24,26Z" fill="#7dd3fc" stroke="${OUT}" stroke-width="4"/></g>
  <g transform="translate(980,1380)"><path d="M-36,0 L-28,-70 L36,-70 L44,0Z" fill="#e8629c" stroke="${OUT}" stroke-width="6"/><path d="M4,-70 Q-60,-170 -30,-230 Q-8,-150 8,-70 Q40,-180 96,-200 Q60,-120 28,-70Z" fill="#4caf50" stroke="${OUT}" stroke-width="6"/></g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
}
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const roomPng = b64(new Resvg(roomSvg(), ropt).render().asPng());
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.3"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');

// ---------------- silla dental ----------------
const VINYL = `<linearGradient id="vin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d4ed8"/><stop offset="0.35" stop-color="#3b82f6"/><stop offset="0.7" stop-color="#2563eb"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient>`;
function chairBack(sat) {
  return `<defs>${VINYL}</defs><ellipse cx="540" cy="1650" rx="330" ry="34" fill="#000" opacity="0.3"/>
  <rect x="496" y="1490" width="88" height="170" fill="#9ca3af" stroke="${OUT}" stroke-width="7"/><ellipse cx="540" cy="1660" rx="210" ry="30" fill="#6b7280" stroke="${OUT}" stroke-width="7"/><rect x="496" y="1490" width="30" height="170" fill="#fff" opacity="0.3"/>
  <rect x="296" y="590" width="488" height="700" rx="130" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M330,640 Q330,600 400,600" stroke="#fff" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M540,640 V1240" stroke="#1e3a8a" stroke-width="5" opacity="0.6"/>
  <rect x="436" y="500" width="208" height="140" rx="60" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/>
  <rect x="236" y="1080" width="96" height="46" rx="22" fill="#1e3a8a" stroke="${OUT}" stroke-width="7"/><rect x="748" y="1080" width="96" height="46" rx="22" fill="#1e3a8a" stroke="${OUT}" stroke-width="7"/>
  ${sat ? '' : `<rect x="276" y="1200" width="528" height="110" rx="40" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/>`}`;
}
function chairFront() {
  return `<path d="M270,1190 Q540,1166 810,1190 L826,1470 Q540,1500 254,1470Z" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M310,1230 Q540,1212 770,1230" stroke="#fff" stroke-opacity="0.3" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M540,1196 V1478" stroke="#1e3a8a" stroke-width="5" opacity="0.6"/><rect x="300" y="1470" width="480" height="36" rx="14" fill="#6b7280" stroke="${OUT}" stroke-width="7"/>
  <path d="M276,1260 Q540,1290 804,1260" stroke="#000" stroke-opacity="0.18" stroke-width="10" fill="none"/>`;
}
function lampSvg(on, t) {
  const glow = on ? `<path d="M380,500 L240,1160 L840,1160 L700,500Z" fill="#fffbe0" opacity="${0.16 + 0.03 * Math.sin(t * 3)}"/><ellipse cx="540" cy="480" rx="190" ry="56" fill="#fffbe0" opacity="0.5" filter="url(#b10)"/>` : '';
  return `${glow}<g><path d="M860,60 L860,260 Q860,330 760,360 L640,402" stroke="#9ca3af" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M860,60 L860,260 Q860,330 760,360 L640,402" stroke="#fff" stroke-opacity="0.4" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="860" cy="260" r="20" fill="#6b7280" stroke="${OUT}" stroke-width="6"/><ellipse cx="540" cy="430" rx="190" ry="50" fill="${on ? '#fffbe0' : '#9ca3af'}" stroke="${OUT}" stroke-width="8"/><ellipse cx="540" cy="420" rx="150" ry="30" fill="${on ? '#fff' : '#cbd5e1'}" opacity="0.9"/><rect x="480" y="392" width="120" height="30" rx="12" fill="#6b7280" stroke="${OUT}" stroke-width="6"/></g>`;
}

// ---------------- camara ----------------
const MARI_X = 170, DR_X = 905, CHAR_Y = 934;
const camKF = [[0, 1, 540, 960], [L.l3.start, 1, 540, 960], [L.l3.start + 0.4, 1.5, 330, 1010], [L.l3.end + 0.1, 1, 540, 960], [L.l4.start + 0.3, 1.5, 760, 1010], [L.l4.end - 0.6, 1, 540, 960],
  [L.l5.start, 1, 540, 960], [L.l6.start + 0.2, 1.5, 760, 1010], [L.l6.end, 1, 540, 960], [T.xrayEnd, 1, 540, 960], [L.l8.start, 1.5, 330, 1010], [L.l8.end + 0.2, 1, 540, 960], [L.l9.start, 1.5, 760, 1010], [L.l10.end, 1, 540, 960],
  [L.l12.start, 1.3, 760, 1000], [L.l12.end, 1, 540, 960], [L.l14.start, 1.4, 760, 1010], [L.l14.end, 1, 540, 960], [L.l15.start, 1, 540, 960], [L.l16.start, 1.45, 330, 1010], [L.l16.end, 1, 540, 960], [L.l17.start, 1.45, 760, 1010], [L.l17.end, 1, 540, 960],
  [L.l19.start, 1, 540, 960], [T.whB, 1, 540, 960], [L.l21.start, 1.5, 760, 1010], [L.l21.end, 1, 540, 960], [T.mirrorStart - 0.3, 1, 540, 960], [T.mirrorStart + 0.4, 1.9, 540, 800], [T.mirrorEnd - 0.1, 1.9, 540, 800], [T.skipA, 1, 540, 960], [T.bracesOff - 0.4, 1, 540, 960], [T.bracesOff + 0.3, 1.6, 540, 840], [T.finalA, 2.0, 540, 790], [L.l22d.end, 2.0, 540, 790], [L.l22d.end + 0.6, 1, 540, 960],
  [L.l23.start, 1.5, 330, 1010], [T.eyebrow - 0.3, 1.5, 330, 1010], [T.eyebrow + 0.2, 1.8, 480, 850], [L.l23.end + 0.2, 1.8, 480, 850], [T.vote - 0.3, 1.1, 540, 960], [T.vote + 0.4, 1, 540, 960], [9999, 1, 540, 960]];
function camAt(t) {
  let i = 0; while (i < camKF.length - 1 && camKF[i + 1][0] <= t) i++;
  const a = camKF[i], b = camKF[Math.min(i + 1, camKF.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  let [z, fx, fy] = [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
  fx = clamp(fx, 540 / z, 1080 - 540 / z); fy = clamp(fy, 960 / z, 1920 - 960 / z);
  const sh = win(t, T.sit + 0.3, T.sit + 0.7, 0.02, 0.3) * 6 + win(t, T.dark - 0.05, T.dark + 0.5, 0.02, 0.4) * 9 + win(t, T.power, T.power + 0.5, 0.02, 0.4) * 7 + win(t, T.crack, T.crack + 0.4, 0.02, 0.3) * 8;
  return { z, x: fx + Math.sin(t * 61) * sh, y: fy + Math.cos(t * 53) * sh };
}
const lazyPos = (t) => { const k = clamp((t - T.sit) / 0.55); const up = Math.sin(Math.PI * k) * 0; return { x: 540, S: 0.62, fy: lerp(1480, 1380, smooth(k)) }; };

// ---------------- primer plano de la boca ----------------
const hexMix = (hex, k) => { const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)), b = [248, 248, 242]; return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
// Anatomia frontal real (proporciones: central 8.7 mm, lateral 6.8, canino 7.8; largo 10.2 / 8.6 / 9.9; central y canino al mismo nivel, lateral ~1.3 mm mas arriba)
const UP_SPEC = [ // desde el centro hacia atras: ancho, alto, encia (y rel.), borde (y rel.), tipo
  { w: 92, gum: -142, edge: -10, t: 'inc' }, { w: 70, gum: -130, edge: -26, t: 'inc' }, { w: 78, gum: -142, edge: -10, t: 'can' }, { w: 58, gum: -134, edge: -30, t: 'pre' }, { w: 48, gum: -126, edge: -46, t: 'pre' }];
const LO_SPEC = [{ w: 58, gum: 152, edge: 62, t: 'inc' }, { w: 62, gum: 152, edge: 60, t: 'inc' }, { w: 68, gum: 154, edge: 56, t: 'can' }, { w: 58, gum: 148, edge: 70, t: 'pre' }, { w: 48, gum: 142, edge: 86, t: 'pre' }];
const JIT = { rot: [-9, 8, 15, -11, 7], dx: [-6, 9, 12, -8, 5], dy: [10, -12, 16, 8, -6] }; // desorden (se multiplica por "crooked")
function layout(spec, cx, cy, crk, up) {
  const out = []; let off = 0;
  for (let i = 0; i < spec.length; i++) { const sp = spec[i];
    for (const side of [1, -1]) { const k = i + (side < 0 ? 0 : 1);
      const jr = JIT.rot[(i + (side < 0 ? 2 : 0)) % 5] * (side < 0 ? -1 : 1) * crk, jx = JIT.dx[(i + (side < 0 ? 1 : 3)) % 5] * crk, jy = JIT.dy[(i + (side < 0 ? 3 : 1)) % 5] * crk * (up ? 1 : -1);
      const x = cx + side * (off + sp.w / 2) + jx, y = cy + sp.gum + jy, h = Math.abs(sp.edge - sp.gum);
      out.push({ x: up && crk > 0.3 && i === 2 && side > 0 ? x + 14 * crk : x, y, w: sp.w, h, rot: jr + (up && i === 2 && side > 0 ? 20 * crk : 0), t: sp.t, i, side }); }
    off += sp.w; }
  return out.sort((a, b) => a.x - b.x);
}
function toothPath(t, ww, hh) {
  if (t === 'can') return `M${-ww * 0.4},0 L${ww * 0.4},0 C${ww * 0.52},${hh * 0.3} ${ww * 0.5},${hh * 0.62} ${ww * 0.44},${hh * 0.8} Q${ww * 0.2},${hh * 0.95} 0,${hh} Q${-ww * 0.2},${hh * 0.95} ${-ww * 0.44},${hh * 0.8} C${-ww * 0.5},${hh * 0.62} ${-ww * 0.52},${hh * 0.3} ${-ww * 0.4},0Z`;
  if (t === 'pre') return `M${-ww * 0.4},0 L${ww * 0.4},0 C${ww * 0.5},${hh * 0.4} ${ww * 0.5},${hh * 0.72} ${ww * 0.42},${hh - 8} Q${ww * 0.3},${hh} ${ww * 0.12},${hh - 6} Q0,${hh - 14} ${-ww * 0.12},${hh - 6} Q${-ww * 0.3},${hh} ${-ww * 0.42},${hh - 8} C${-ww * 0.5},${hh * 0.72} ${-ww * 0.5},${hh * 0.4} ${-ww * 0.4},0Z`;
  return `M${-ww * 0.42},0 L${ww * 0.42},0 C${ww * 0.5},${hh * 0.2} ${ww * 0.52},${hh * 0.65} ${ww * 0.5},${hh - 12} Q${ww * 0.5},${hh} ${ww * 0.38},${hh} L${-ww * 0.38},${hh} Q${-ww * 0.5},${hh} ${-ww * 0.5},${hh - 12} C${-ww * 0.52},${hh * 0.65} ${-ww * 0.5},${hh * 0.2} ${-ww * 0.42},0Z`;
}
function tooth(d, clean, seed, flip = false) {
  const base = ['#d9c35a', '#cdb64a', '#e0cd6a', '#c6af46', '#dcc860', '#d2bb52'][seed % 6];
  const stain = clamp(1 - clean) * 0.75, shade = hexMix('#a8903a', clean * 0.9), mid = hexMix(base, clean), tip = hexMix('#efe6a8', clean);
  const gid = 'tg' + seed + (flip ? 'l' : 'u') + Math.round(d.x);
  return `<g transform="translate(${d.x},${d.y}) rotate(${d.rot}) ${flip ? 'scale(1,-1)' : ''}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade}"/><stop offset="0.25" stop-color="${mid}"/><stop offset="0.8" stop-color="${mid}"/><stop offset="1" stop-color="${tip}"/></linearGradient></defs>
    <path d="${toothPath(d.t, d.w, d.h)}" fill="url(#${gid})" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M${-d.w * 0.28},${d.h * 0.1} Q${-d.w * 0.3},${d.h * 0.45} ${-d.w * 0.22},${d.h * 0.78}" stroke="#fff" stroke-width="${clean > 0.7 ? 8 : 6}" stroke-linecap="round" fill="none" opacity="${0.3 + clean * 0.5}"/>
    <path d="M${d.w * 0.3},${d.h * 0.12} Q${d.w * 0.34},${d.h * 0.5} ${d.w * 0.26},${d.h * 0.8}" stroke="#000" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.1"/>
    <path d="M${-d.w * 0.4},0 h${d.w * 0.8} v${d.h * 0.16} q${-d.w * 0.4},10 ${-d.w * 0.8},0Z" fill="#8a6a20" opacity="${stain * 0.75}"/>
    ${[[-0.18, 0.45], [0.14, 0.68]].map(([sx, sy], i) => `<ellipse cx="${sx * d.w}" cy="${sy * d.h}" rx="${5 + i * 2}" ry="${4 + i}" fill="#6b4a14" opacity="${stain * 0.55}"/>`).join('')}</g>`;
}
const gloveHand = (x, y, rot, s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><ellipse rx="66" ry="52" fill="#7cc3ff" stroke="${OUT}" stroke-width="7"/>${[-36, -12, 12, 36].map((fx) => `<rect x="${fx - 12}" y="-96" width="24" height="60" rx="12" fill="#7cc3ff" stroke="${OUT}" stroke-width="6"/>`).join('')}<path d="M-30,10 q30,16 60,0" stroke="#4aa0e8" stroke-width="5" fill="none"/></g>`;
function closeup(t, P, mode, a, b) {
  const prog = clamp((t - a) / Math.max(1e-3, b - a)), tq = P.teeth, crk = tq.crooked, cl = tq.clean;
  const cx = 540, cy = 900;
  // --- base: piel, labios, cavidad
  let s = `<defs><radialGradient id="cuSkin" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stop-color="#9a5a32"/><stop offset="1" stop-color="#4f2711"/></radialGradient><radialGradient id="cuSpot" cx="0.5" cy="0.5" r="0.6"><stop offset="0.5" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#cuSkin)"/>
    <ellipse cx="${cx}" cy="${cy + 20}" rx="470" ry="350" fill="#7a2f33" stroke="${OUT}" stroke-width="10"/><ellipse cx="${cx}" cy="${cy + 20}" rx="470" ry="350" fill="none" stroke="#b8645a" stroke-width="46" opacity="0.9"/><path d="M${cx - 300},${cy - 300} Q${cx},${cy - 380} ${cx + 300},${cy - 300}" stroke="#d68f80" stroke-width="12" fill="none" opacity="0.5" stroke-linecap="round"/>
    <ellipse cx="${cx}" cy="${cy + 10}" rx="420" ry="296" fill="#3a0a10" stroke="${OUT}" stroke-width="7"/>`;
  s += `<clipPath id="cavity"><ellipse cx="${cx}" cy="${cy + 10}" rx="420" ry="296"/></clipPath><g clip-path="url(#cavity)">`;
  // lengua
  s += `<ellipse cx="${cx}" cy="${cy + 240 + Math.sin(t * 2) * 6}" rx="270" ry="130" fill="#c4505e" stroke="${OUT}" stroke-width="6"/><path d="M${cx},${cy + 130} V${cy + 330}" stroke="#9a2f40" stroke-width="7" opacity="0.7"/>${[...Array(14)].map((_, i) => `<circle cx="${cx - 150 + (i * 53) % 300}" cy="${cy + 190 + (i * 37) % 80}" r="5" fill="#d98b96" opacity="0.7"/>`).join('')}`;
  // encias
  s += `<ellipse cx="${cx}" cy="${cy - 140}" rx="430" ry="170" fill="#e8798a" stroke="${OUT}" stroke-width="6"/><ellipse cx="${cx}" cy="${cy - 150}" rx="400" ry="130" fill="#f08c9c" opacity="0.7"/>`;
  s += `<ellipse cx="${cx}" cy="${cy + 190}" rx="380" ry="120" fill="#e8798a" stroke="${OUT}" stroke-width="6" opacity="0.0"/>`;
  s += `<path d="M${cx - 380},${cy + 130} Q${cx},${cy + 270} ${cx + 380},${cy + 130} L${cx + 380},${cy + 300} L${cx - 380},${cy + 300}Z" fill="#e8798a" stroke="${OUT}" stroke-width="6" opacity="0.95"/>`;
  // diente extra (detras de los incisivos)
  const crackT = T.crack;
  if (tq.extra) s += `<g transform="translate(${cx + 4},${cy - 40})"><path d="M-22,0 L22,0 L0,86Z" fill="${hexMix('#d6c25a', cl)}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M-8,8 l4,40" stroke="#fff" stroke-width="5" opacity="0.5"/></g>`;
  else s += `<ellipse cx="${cx + 4}" cy="${cy - 30}" rx="22" ry="16" fill="#7a1f2a" stroke="${OUT}" stroke-width="4"/>${t < crackT + 2.5 ? `<ellipse cx="${cx + 4}" cy="${cy - 30}" rx="12" ry="8" fill="#b3293a"/>` : ''}`;
  // dientes: filas completas (10 arriba, 10 abajo) con anatomia real; arriba y abajo separados (la boca esta abierta)
  const upr = layout(UP_SPEC, cx, cy, crk, true), lwr = layout(LO_SPEC, cx, cy, crk, false);
  lwr.forEach((d, i) => { s += tooth(d, cl, i + 2, true); });
  upr.forEach((d, i) => { s += tooth(d, cl, i, false); });
  // brackets + alambre + ligas (solo arriba, uno por diente)
  const NB = upr.length, bs = (mode === 'brackets' ? prog * (NB + 2) : (tq.braces > 0.99 ? 99 : tq.braces * (NB + 2)));
  const bp = [];
  upr.forEach((d, i) => { const k = clamp(bs - i * 0.9); const bx = d.x + Math.sin(d.rot * 0.0174) * d.h * 0.5, by = d.y + Math.cos(d.rot * 0.0174) * d.h * 0.5; bp.push([bx, by]);
    if (k > 0) s += `<g transform="translate(${bx},${by}) rotate(${d.rot}) scale(${pop(k, 0, 1)})"><rect x="-19" y="-16" width="38" height="32" rx="7" fill="#cbd5e1" stroke="${OUT}" stroke-width="4"/><rect x="-12" y="-10" width="24" height="20" rx="5" fill="${i % 2 ? '#a855f7' : '#ff4d8d'}" stroke="${OUT}" stroke-width="2.5"/><path d="M-14,-6 h28" stroke="#fff" stroke-opacity="0.5" stroke-width="3"/></g>`; });
  const wk = clamp((bs - (NB - 0.5)) / 1.2); const wire = mode === 'brackets' || tq.braces > 0.5;
  if (wire) { const pts = bp.map(([x, y]) => `${x},${y}`); const reveal = mode === 'brackets' ? wk : 1; s += `<clipPath id="wireClip"><rect x="${cx - 460}" y="${cy - 300}" width="${920 * reveal}" height="500"/></clipPath><path d="M${pts.join(' L')}" stroke="#e2e8f0" stroke-width="7" fill="none" stroke-linejoin="round" clip-path="url(#wireClip)"/><path d="M${pts.join(' L')}" stroke="#64748b" stroke-width="2.5" fill="none" clip-path="url(#wireClip)"/>`; }
  s += `</g>`;
  // luz focal y vineta
  s += `<rect width="${W}" height="${H}" fill="url(#cuSpot)"/>`;
  // ---------- herramientas ----------
  const wob = Math.sin(t * 18);
  if (mode === 'exam') {
    const k = ease(prog * 3); const x = lerp(1120, 740, k) + Math.sin(t * 2.2) * 24, y = lerp(760, 880, k) + Math.cos(t * 1.7) * 14;
    s += `<g transform="translate(${x},${y}) rotate(-25)"><rect x="0" y="-5" width="360" height="10" rx="5" fill="#cbd5e1" stroke="${OUT}" stroke-width="5"/>${gloveHand(420, 0, -90)}<circle cx="-18" cy="0" r="54" fill="#cfefff" opacity="0.85" stroke="${OUT}" stroke-width="7"/><path d="M-44,-20 q22,-24 52,-14" stroke="#fff" stroke-width="7" fill="none" opacity="0.8"/></g>`;
  }
  if (mode === 'needle') {
    const k = ease((prog - 0.08) / 0.4), hit = clamp((t - T.needle) / 0.4), push = clamp((t - T.needle - 0.4) / 1.2);
    const x = lerp(1160, 640, k), y = lerp(560, 760, k);
    s += `<g transform="translate(${x},${y}) rotate(205)"><rect x="0" y="-22" width="300" height="44" rx="14" fill="#f1f5f9" stroke="${OUT}" stroke-width="6"/><rect x="${30 + push * 120}" y="-14" width="${210 - push * 120}" height="28" rx="8" fill="#93c5fd" opacity="0.9"/><rect x="${300 - push * 100}" y="-8" width="60" height="16" fill="#cbd5e1" stroke="${OUT}" stroke-width="5"/><rect x="${352 - push * 100}" y="-40" width="14" height="80" rx="6" fill="#94a3b8" stroke="${OUT}" stroke-width="5"/><path d="M0,0 L-80,0" stroke="#e5e7eb" stroke-width="5"/>${gloveHand(470 - push * 100, 0, -90)}</g>`;
    if (hit > 0) s += `<g transform="translate(${cx + 6},${cy - 70})"><circle r="${30 + push * 60}" fill="#bfe9ff" opacity="${0.45 * (1 - push * 0.6)}"/><circle r="${14 + push * 30}" fill="#fff" opacity="0.4"/></g>`;
  }
  if (mode === 'extract') {
    const drillP = clamp((t - T.drillW + 0.1) / Math.max(0.2, T.crack - T.drillW - 0.2)), crack = t >= T.crack;
    if (!crack) {
      if (t >= T.drillW - 0.1) { const x = lerp(1200, 520, ease(drillP * 2)), y = lerp(520, 790, ease(drillP * 2)) + wob * 3;
        s += `<g transform="translate(${x},${y}) rotate(210)"><rect x="0" y="-26" width="320" height="52" rx="20" fill="#e5e7eb" stroke="${OUT}" stroke-width="6"/><rect x="40" y="-26" width="60" height="52" fill="#64748b" opacity="0.5"/><path d="M-40,0 h40" stroke="#475569" stroke-width="10" stroke-linecap="round"/>${gloveHand(420, 0, -90)}</g>
          <g transform="translate(${x - 10},${y + 4})">${[...Array(10)].map((_, i) => `<line x1="0" y1="0" x2="${-30 - (i * 37 + t * 600) % 70}" y2="${-24 + i * 6 + Math.sin(t * 40 + i) * 5}" stroke="#e0f4ff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`).join('')}</g>`; }
      s += `<g transform="translate(300,1020) rotate(-30)"><path d="M0,0 Q110,-90 280,-70" stroke="#bfe9ff" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.55"/><path d="M0,0 Q110,-90 280,-70" stroke="${OUT}" stroke-width="5" fill="none" opacity="0.5"/><circle cx="296" cy="-68" r="20" fill="#e2e8f0" stroke="${OUT}" stroke-width="5"/></g>`;
    } else {
      const pk = clamp((t - T.crack) / 0.5), tr = ease((t - T.crack - 0.25) / 1.0);
      const fx = lerp(cx + 4, 540, tr), fy = lerp(cy + 30, 820, tr) + (1 - tr) * pk * 80, sc = lerp(1, 2.6, tr);
      s += `<g transform="translate(${fx},${fy}) rotate(${lerp(-20, 8, tr)}) scale(${sc})"><g transform="translate(0,24)"><g><path d="M-34,-20 C-34,-52 34,-52 34,-20 C38,10 26,40 14,40 C8,40 6,18 0,18 C-6,18 -8,40 -14,40 C-26,40 -38,10 -34,-20Z" fill="#fffbe6" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M-22,-30 q-4,18 0,34" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.9"/><path d="M-14,40 q-4,30 -10,52 M14,40 q4,30 10,52" stroke="#e7d9a8" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M-14,40 q-4,30 -10,52 M14,40 q4,30 10,52" stroke="${OUT}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.5"/></g></g><rect x="-6" y="-100" width="12" height="100" rx="6" fill="#e5e7eb" stroke="${OUT}" stroke-width="4" transform="rotate(14) translate(0,-6)"/><rect x="-6" y="-100" width="12" height="100" rx="6" fill="#e5e7eb" stroke="${OUT}" stroke-width="4" transform="rotate(-14) translate(0,-6)"/></g>
        ${tr > 0.6 ? `<g transform="translate(${fx},${fy - 140 * sc * 0.45})">${[[-120, -40, 22], [120, -10, 28], [-80, 70, 16], [90, 80, 20]].map(([x, y, r], i) => `<g transform="translate(${x},${y}) scale(${(0.7 + 0.3 * Math.sin(t * 8 + i)) * clamp((tr - 0.6) * 4)}) rotate(${t * 40})"><path d="M0,${-r} Q4,-4 ${r},0 Q4,4 0,${r} Q-4,4 ${-r},0 Q-4,-4 0,${-r}Z" fill="#ffe14d" stroke="${OUT}" stroke-width="4"/></g>`).join('')}</g>` : ''}
        ${win(t, T.crack, T.crack + 0.6, 0.02, 0.3) > 0 ? `<g transform="translate(${cx},${cy - 240}) scale(${pop(t, T.crack, 0.2)})" opacity="${win(t, T.crack, T.crack + 0.6, 0.02, 0.3)}"><text x="0" y="0" font-family="Anton" font-size="120" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="14" paint-order="stroke">¡CRAC!</text></g>` : ''}`;
    }
  }
  if (mode === 'clean') {
    const sx = cx + Math.sin(t * 3.2) * 280, sy = cy - 30 + Math.sin(t * 6.4) * 12;
    s += `<g transform="translate(${sx + 360},${sy + 160}) rotate(-62)"><rect x="0" y="-5" width="360" height="10" rx="5" fill="#cbd5e1" stroke="${OUT}" stroke-width="5"/><path d="M-4,0 q-26,-4 -34,-26" stroke="#cbd5e1" stroke-width="9" fill="none" stroke-linecap="round"/>${gloveHand(430, 0, -90)}</g>
      ${[...Array(9)].map((_, i) => { const ph = (t * 2 + i * 0.27) % 1; return `<circle cx="${sx + (i - 4) * 22 + ph * 40}" cy="${sy + 40 + ph * 160}" r="${5 + (i % 3) * 2}" fill="#8a6a20" opacity="${(1 - ph) * (1 - cl)}"/>`; }).join('')}
      <g transform="translate(260,1130) rotate(-24)"><path d="M0,0 Q110,-100 300,-70" stroke="#bfe9ff" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.55"/><path d="M0,0 Q110,-100 300,-70" stroke="${OUT}" stroke-width="5" fill="none" opacity="0.5"/></g>`;
    if (prog > 0.62) { const px = cx + Math.sin(t * 2.1) * 250, py = cy + 40; s += `<g transform="translate(${px},${py})"><g transform="rotate(${t * 900})"><circle r="48" fill="#f472b6" stroke="${OUT}" stroke-width="6"/>${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="0" y1="0" x2="${Math.cos(a * 0.0174) * 44}" y2="${Math.sin(a * 0.0174) * 44}" stroke="#fff" stroke-width="5" opacity="0.7"/>`).join('')}</g><rect x="-12" y="-300" width="24" height="260" rx="10" fill="#94a3b8" stroke="${OUT}" stroke-width="6" transform="rotate(30)"/></g>${[...Array(8)].map((_, i) => `<circle cx="${px + Math.cos(i * 0.8 + t * 9) * 66}" cy="${py + Math.sin(i * 1.3 + t * 7) * 40}" r="${7 + i % 3 * 3}" fill="#fff" opacity="0.8"/>`).join('')}`; }
  }
  if (mode === 'white') {
    const k = ease(prog * 3), p = 0.6 + 0.4 * Math.sin(t * 6);
    s += `<g transform="translate(${cx},${lerp(340, 470, k)})"><path d="M-380,0 Q0,-110 380,0 Q0,70 -380,0Z" fill="#4c1d95" stroke="${OUT}" stroke-width="9"/><path d="M-340,6 Q0,-80 340,6" stroke="#a78bfa" stroke-width="12" fill="none" opacity="0.8"/>${[...Array(8)].map((_, i) => `<circle cx="${-300 + i * 86}" cy="${-4 + Math.abs(Math.sin(i * 0.4)) * 4}" r="15" fill="#c4b5fd" stroke="${OUT}" stroke-width="4"/><path d="M${-300 + i * 86},22 L${(-300 + i * 86) * 1.1},${330}" stroke="#c4b5fd" stroke-width="${30}" opacity="${0.08 + 0.06 * p}"/>`).join('')}</g>
      <ellipse cx="${cx}" cy="${cy}" rx="440" ry="300" fill="#a78bfa" opacity="${0.12 * p}"/>
      ${[...Array(10)].map((_, i) => { const ph = (t * 1.2 + i * 0.19) % 1; return `<g transform="translate(${cx - 330 + i * 73},${cy + 120 - ph * 280}) scale(${1 - ph * 0.5})" opacity="${Math.sin(ph * Math.PI)}"><path d="M0,-16 Q3,-3 16,0 Q3,3 0,16 Q-3,3 -16,0 Q-3,-3 0,-16Z" fill="#fff" stroke="${OUT}" stroke-width="3"/></g>`; }).join('')}`;
  }
  if (mode === 'brackets') {
    const ul = layout(UP_SPEC, cx, cy, crk, true), i = clamp(Math.floor(prog * 11), 0, ul.length - 1), tx = ul[i].x + 380 - (prog * 11 % 1) * 40, ty = ul[i].y + ul[i].h * 0.5 + 180;
    s += `<g transform="translate(${tx},${ty}) rotate(-65)"><rect x="0" y="-4" width="320" height="8" rx="4" fill="#cbd5e1" stroke="${OUT}" stroke-width="5"/><rect x="-8" y="-16" width="38" height="32" rx="7" fill="#cbd5e1" stroke="${OUT}" stroke-width="4"/>${gloveHand(390, 0, -90)}</g>
      <g transform="translate(300,1150) rotate(-26)"><path d="M0,0 Q110,-100 300,-70" stroke="#bfe9ff" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.55"/><path d="M0,0 Q110,-100 300,-70" stroke="${OUT}" stroke-width="5" fill="none" opacity="0.5"/></g>`;
  }
  if (mode === 'final') {
    const sw = clamp((t - a) / (b - a)) * 1.3 - 0.15;
    s += `<g opacity="${0.8 * win(t, a + 0.2, b, 0.2, 0.4)}"><path d="M${cx - 420 + sw * 840},${cy - 200} l90,0 l-60,420 l-90,0Z" fill="#fff" opacity="0.7"/></g>`;
    s += [[-300, -90, 30], [-170, -40, 22], [-40, -110, 34], [110, -50, 24], [250, -100, 30], [-220, 120, 20], [70, 130, 26], [210, 110, 22]].map(([x, y, r], i) => `<g transform="translate(${cx + x},${cy + y}) scale(${pop(t, a + 0.3 + i * 0.12, 0.3) * (0.75 + 0.25 * Math.sin(t * 10 + i))}) rotate(${t * 50})"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join('');
    s += `<g transform="translate(${cx},${cy - 330}) scale(${pop(t, a + 0.4, 0.4)})" opacity="${win(t, a + 0.4, b, 0.2, 0.3)}"><text x="0" y="0" font-family="Anton" font-size="96" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡SONRISA NUEVA!</text></g>`;
  }
  return { svg: s, a, b };
}
function mouthOverlay(t, P) {
  const c = T.closeups.find(([a, b]) => t >= a - 0.01 && t <= b + 0.01); if (!c) return '';
  const [a, b, mode] = c; const open = ease((t - a) / 0.35), close = ease((b - t) / 0.3), k = Math.min(open, close);
  const inner = closeup(t, P, mode, a, b);
  const dark = t >= T.dark && t < T.power;
  const inset = `<g transform="translate(905,1370)"><circle r="158" fill="#000" opacity="0.35" transform="translate(5,8)"/><clipPath id="inset"><circle r="150"/></clipPath><circle r="150" fill="#cfe9f4"/><g clip-path="url(#inset)"><g transform="translate(0,${215 * 0.62 + 18}) scale(0.62)">${drawLazy(P)}</g></g><circle r="150" fill="none" stroke="#fff" stroke-width="10"/><circle r="154" fill="none" stroke="${OUT}" stroke-width="6"/></g>`;
  const darkMask = dark ? `<rect width="${W}" height="${H}" fill="#02030a" opacity="0.9" mask="url(#spotMask)"/>` : '';
  return `<clipPath id="iris"><circle cx="540" cy="900" r="${lerp(0, 1500, k)}"/></clipPath><g clip-path="url(#iris)">${inner.svg}${darkMask}${inset}</g>${k < 1 ? `<circle cx="540" cy="900" r="${lerp(0, 1500, k)}" fill="none" stroke="${OUT}" stroke-width="14"/>` : ''}`;
}
function xrayOverlay(t) {
  const a = win(t, T.xrayStart, T.xrayEnd, 0.35, 0.35); if (a <= 0) return '';
  const p = pop(t, T.xrayStart, 0.4), scan = ((t - T.xrayStart) * 0.8) % 1;
  const arch = (cy, dir, n, rots) => [...Array(n)].map((_, i) => { const x = 160 + i * 110, y = cy + dir * Math.pow(i - 3.5, 2) * 7; return `<g transform="translate(${x},${y}) rotate(${rots[i]})"><path d="M-30,0 h60 v${dir * 120 - dir * 20} q0,${dir * 20} -30,${dir * 20} q-30,0 -30,${-dir * 20}Z" fill="#e5f3ff" opacity="0.92"/><path d="M-30,0 h60" stroke="#fff" stroke-width="4"/></g>`; }).join('');
  const pulse = 0.5 + 0.5 * Math.sin(t * 9);
  return `<g opacity="${a}" transform="translate(540,900) scale(${p}) translate(-540,-900)"><rect x="60" y="420" width="960" height="760" rx="46" fill="#0b1b2b" stroke="${OUT}" stroke-width="10"/><rect x="60" y="420" width="960" height="760" rx="46" fill="#e5e7eb" opacity="0.08"/>
    <rect x="86" y="446" width="908" height="708" rx="30" fill="#05101c"/><g transform="translate(86,446)"><g transform="translate(0,160)">${arch(150, 1, 8, [-12, 8, -6, 12, -10, 7, -13, 10])}</g><g transform="translate(0,380)">${arch(120, -1, 8, [8, -9, 6, -11, 9, -7, 10, -8])}</g>
    <path d="M60,250 Q454,170 848,250" stroke="#7dd3fc" stroke-opacity="0.35" stroke-width="6" fill="none"/>
    <g transform="translate(442,298)"><path d="M-22,0 L22,0 L0,90Z" fill="#fff7ae"/><circle cx="0" cy="40" r="${70 + pulse * 16}" fill="none" stroke="#ef4444" stroke-width="9"/><circle cx="0" cy="40" r="${70 + pulse * 16}" fill="#ef4444" opacity="${0.1 + 0.1 * pulse}"/><path d="M150,-120 L72,-6" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/><path d="M72,-6 l10,-26 M72,-6 l28,10" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/></g>
    <rect x="530" y="150" width="330" height="76" rx="18" fill="#ef4444" stroke="#fff" stroke-width="5"/><text x="695" y="204" font-family="Anton" font-size="52" text-anchor="middle" fill="#fff" letter-spacing="2">DIENTE EXTRA</text>
    <rect x="0" y="${scan * 700}" width="908" height="10" fill="#7cf29a" opacity="0.35"/></g>
    <text x="540" y="486" font-family="Anton" font-size="42" text-anchor="middle" fill="#7dd3fc" letter-spacing="6">RADIOGRAFÍA PANORÁMICA</text></g>`;
}
function skipCard(t) {
  const a = win(t, T.skipA, T.skipB, 0.3, 0.4); if (a <= 0) return '';
  const k = (t - T.skipA) / (T.skipB - T.skipA), month = Math.min(12, Math.floor(k * 12) + 1), fl = ((k * 12) % 1);
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return `<g opacity="${a}"><rect width="${W}" height="${H}" fill="#0b1226"/>${[...Array(30)].map((_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 331 + t * 40) % H}" r="${3 + i % 4}" fill="#fff" opacity="0.25"/>`).join('')}
    <text x="540" y="560" font-family="Anton" font-size="150" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="16" paint-order="stroke" letter-spacing="4">MESES</text><text x="540" y="720" font-family="Anton" font-size="150" text-anchor="middle" fill="#ff4d8d" stroke="${OUT}" stroke-width="16" paint-order="stroke" letter-spacing="4">DESPUÉS</text>
    <g transform="translate(540,1050)"><rect x="-230" y="-200" width="460" height="400" rx="34" fill="#000" opacity="0.3" transform="translate(8,12)"/><rect x="-230" y="-200" width="460" height="400" rx="34" fill="#fff" stroke="${OUT}" stroke-width="9"/><rect x="-230" y="-200" width="460" height="110" rx="34" fill="#ef4444" stroke="${OUT}" stroke-width="9"/>
      <text x="0" y="-122" font-family="Anton" font-size="68" text-anchor="middle" fill="#fff">MES ${month}</text><g transform="scale(1,${1 - Math.abs(Math.sin(fl * Math.PI)) * 0.0})"><text x="0" y="60" font-family="Anton" font-size="190" text-anchor="middle" fill="${OUT}" transform="translate(0,${Math.sin(fl * Math.PI) * -14})">${meses[month - 1]}</text></g>
      <rect x="-140" y="104" width="280" height="40" rx="20" fill="#ffe3ef"/><path d="M-120,124 h240" stroke="#ff4d8d" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 26"/></g></g>`;
}
function flashFx(t) { const d = t - T.bracesOff; if (d < 0 || d > 0.5) return ''; return `<rect width="${W}" height="${H}" fill="#fff" opacity="${0.85 * (1 - d / 0.5)}"/><g transform="translate(540,900) scale(${pop(t, T.bracesOff, 0.25)})" opacity="${1 - d / 0.5}"><text x="0" y="0" font-family="Anton" font-size="140" text-anchor="middle" fill="#7cf29a" stroke="${OUT}" stroke-width="14" paint-order="stroke">¡LISTO!</text></g>`; }
function mirrorOverlay(t) { if (T.closeups.find(([a, b]) => t >= a && t <= b)) return ''; const a = (win(t, T.mirrorStart + 0.2, T.mirrorEnd, 0.3, 0.35) + win(t, L.l22c.start + 0.1, T.finalA - 0.15, 0.3, 0.2) + win(t, T.finalB, L.l22d.end, 0.2, 0.4)); if (a <= 0) return '';
  const g = ((t - T.mirrorStart) * 0.9) % 2;
  return `<g opacity="${Math.min(1, a)}"><path d="M0,0 H${W} V${H} H0Z M540,890 m-440,0 a440,640 0 1,0 880,0 a440,640 0 1,0 -880,0Z" fill="#0b0b10" fill-rule="evenodd" opacity="0.88"/><ellipse cx="540" cy="890" rx="440" ry="640" fill="none" stroke="#e8c27a" stroke-width="22"/><ellipse cx="540" cy="890" rx="418" ry="618" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/><g opacity="0.55" transform="translate(${-400 + g * 800},0)"><path d="M300,300 L420,300 L240,1480 L120,1480Z" fill="#fff" opacity="0.18"/></g></g>`; }

// ---------------- apagon y linternas ----------------
function flickerOn(t) { // 1 = luz encendida
  if (t < T.dark) return 1; if (t < T.dark + 0.06) return 0.4; if (t < T.dark + 0.12) return 1; if (t < T.dark + 0.18) return 0.1;
  if (t < T.power) return 0;
  const d = t - T.power; if (d < 0.08) return 1; if (d < 0.16) return 0; if (d < 0.26) return 1; if (d < 0.34) return 0.1; return 1;
}
function beamLayers(sx, sy, tx, ty, ww) {
  const ang = Math.atan2(ty - sy, tx - sx), nx = -Math.sin(ang), ny = Math.cos(ang);
  return [0, 1, 2].map((i) => { const k = ww * (1 + (2 - i) * 0.38); return `<polygon points="${sx - nx * 14},${sy - ny * 14} ${sx + nx * 14},${sy + ny * 14} ${tx + nx * k},${ty + ny * k} ${tx - nx * k},${ty - ny * k}" fill="#000" opacity="0.5"/>`; }).join('');
}
function darkWorld(t) {
  const lit = flickerOn(t); const d = 1 - lit; if (d <= 0.01) return '';
  const hx = DR_X - 6, hy = CHAR_Y - 78 * 0.82 - 70 * 0.82 + 60, wobble = Math.sin(t * 3) * 14;
  const on = t >= L.l16.start + 1.2 && t < T.power;
  const b1 = beamLayers(hx, hy, 520, 930 + wobble, 150), b2 = beamLayers(MARI_X + 110, 1030, 640, 960 + wobble, 130);
  return `<defs><mask id="bm"><rect x="-50" y="-50" width="1180" height="2020" fill="#fff"/>${on ? b1 + b2 : ''}</mask></defs>
    <rect x="-50" y="-50" width="1180" height="2020" fill="#02030a" opacity="${0.94 * d}" mask="url(#bm)"/>
    ${on ? `<g opacity="${d * 0.4}"><polygon points="${hx - 14},${hy} ${hx + 14},${hy} 650,${780 + wobble} 400,${1080 + wobble}" fill="#fffbe0" opacity="0.5"/><polygon points="${MARI_X + 100},1020 ${MARI_X + 120},1040 740,${860 + wobble} 560,${1100 + wobble}" fill="#e0f2fe" opacity="0.4"/></g>` : ''}`;
}

// ---------------- UI ----------------
const stepBanners = [['1', 'RADIOGRAFÍA', T.xrayStart, T.xrayEnd, '#7dd3fc'], ['2', 'ANESTESIA', T.nA, T.needle + 1.6, '#c4b5fd'], ['3', 'EXTRACCIÓN', T.drillW - 0.1, T.eB - 0.5, '#ffb3a6'], ['4', 'LIMPIEZA', T.cA, T.cB - 0.3, '#a7f3d0'], ['5', 'BLANQUEAMIENTO', T.whA, T.whB, '#fde68a'], ['6', 'BRACKETS', T.brA, T.brB, '#fbcfe8']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-46" width="660" height="92" rx="46" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-46" width="660" height="92" rx="46" fill="${col}" stroke="${OUT}" stroke-width="7"/><circle cx="-276" cy="0" r="34" fill="${OUT}"/><text x="-276" y="16" font-family="Anton" font-size="46" text-anchor="middle" fill="#fff">${n}</text><text x="28" y="18" font-family="Anton" font-size="${text.length > 11 ? 50 : 58}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
function slate(t) {
  if (t > T.slateEnd + 0.7) return '';
  const out = ease((t - T.slateEnd) / 0.6), clap = clamp((t - 0.7) / 0.12);
  const open = lerp(-32, 0, clap) + (t > 0.82 ? Math.sin((t - 0.82) * 40) * 2 * Math.exp(-(t - 0.82) * 8) : 0);
  const stripes = [...Array(7)].map((_, i) => `<polygon points="${i * 110},0 ${i * 110 + 60},0 ${i * 110 + 20},70 ${i * 110 - 40},70" fill="${i % 2 ? '#fff' : OUT}"/>`).join('');
  return `<g><rect width="${W}" height="${H}" fill="#0b0b10" opacity="${1 - out}"/><g transform="translate(540,${900 - out * 1300}) rotate(${-4 + out * 20})" opacity="${1 - out * 0.6}">
    <g transform="translate(-340,-250) rotate(${open} 0 70)"><rect width="680" height="70" fill="#fff" stroke="#fff" stroke-width="6"/>${stripes}</g>
    <rect x="-340" y="-170" width="680" height="440" rx="12" fill="#1a1a22" stroke="#fff" stroke-width="6"/>
    <text x="-310" y="-120" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">PRODUCCIÓN</text><text x="-310" y="-56" font-family="Anton" font-size="54" fill="#fff">LAZY DAWNS</text>
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">ESCENA</text><text x="-310" y="50" font-family="Anton" font-size="52" fill="#7dd3fc">EL DENTISTA</text>
    <text x="-310" y="108" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">DÍA</text><text x="-310" y="172" font-family="Anton" font-size="56" fill="#ff4d8d">3 / 30</text><text x="60" y="108" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">TOMA</text><text x="60" y="172" font-family="Anton" font-size="56" fill="#fff">1</text>
    ${clap >= 1 && t < 1.15 ? `<text x="0" y="-300" font-family="Anton" font-size="110" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡CLAC!</text>` : ''}</g></g>`;
}
const SPEAK = { N: { col: '#ffe14d', name: null }, M: { col: '#ff9ad0', name: 'MARI' }, D: { col: '#7cc3ff', name: 'DR. MENDOZA' } };
function captions(t, closeupOn) {
  const cur = DATA.lines.find((l) => t >= l.start - 0.15 && t <= l.end + 0.3); if (!cur) return '';
  const sy = closeupOn ? 1700 : 1580, sp = SPEAK[cur.who];
  const groups = []; let g = [];
  cur.words.forEach(([ww, s, e]) => { g.push({ w: ww, s, e }); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(ww)) { groups.push(g); g = []; } }); if (g.length) groups.push(g);
  const grp = groups.find((gr) => t >= gr[0].s - 0.05 && t <= gr[gr.length - 1].e + 0.25) || groups[groups.length - 1];
  const spans = grp.map((o) => `<tspan fill="${t >= o.s && t < o.e + 0.05 ? sp.col : '#fff'}">${esc(o.w.replace(/\.\.\./g, '').toUpperCase())} </tspan>`).join('');
  const tag = sp.name ? `<g transform="translate(540,${sy - 112})"><rect x="-${sp.name.length * 17 + 30}" y="-34" width="${sp.name.length * 34 + 60}" height="68" rx="34" fill="${sp.col}" stroke="${OUT}" stroke-width="7"/><text x="0" y="14" font-family="Anton" font-size="44" text-anchor="middle" fill="${OUT}" letter-spacing="2">${sp.name}</text></g>` : '';
  return `${tag}<text x="540" y="${sy}" font-family="Anton" font-size="84" text-anchor="middle" stroke="${OUT}" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${spans}</text>`;
}
function talkIcon(t, who, x, y) { const l = DATA.lines.find((q) => q.who === who && t >= q.start && t <= q.end); if (!l) return '';
  const p = 0.5 + 0.5 * Math.sin(t * 14), col = SPEAK[who].col;
  return `<g transform="translate(${x},${y})"><circle r="38" fill="#fff" stroke="${OUT}" stroke-width="6"/>${[0, 1, 2].map((i) => `<path d="M${-14 + i * 12},${-12 - (i === 1 ? 4 : 0) * p} v${24 + (i === 1 ? 8 : 0) * p}" stroke="${col}" stroke-width="7" stroke-linecap="round" transform="translate(0,${-(i === 1 ? 4 : 0) * p / 2})"/>`).join('')}</g>`;
}
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  const a = pop(t, T.optA), b = pop(t, T.optB);
  let s = `<rect width="${W}" height="${H}" fill="#12090a" opacity="${0.55 * k}"/><text x="540" y="${1040 - 30 * (1 - ease(k))}" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ ARREGLAMOS MAÑANA?</text>`;
  if (a > 0) s += `<g transform="translate(540,1170) scale(${a})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="${OUT}">A · CEJAS</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1310) scale(${b})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff">B · PELO</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1448) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1550) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 4</text></g>`;
  return s;
}
function sparklesMouth(t, cx, cy, S, t0, t1) { const a = win(t, t0, t1, 0.2, 0.4); if (a <= 0) return '';
  return [[-60, 20, 20], [70, -10, 26], [-20, 70, 16], [100, 50, 20], [0, -50, 22]].map(([x, y, r], i) => `<g transform="translate(${cx + x * S * 1.6},${cy + y * S * 1.6}) scale(${(0.7 + 0.3 * Math.sin(t * 8 + i)) * pop(t, t0 + i * 0.1, 0.3)}) rotate(${t * 40})" opacity="${a}"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join(''); }

// ---------------- estados de los personajes de apoyo ----------------
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
function mariState(t) {
  let mood = 'happy', hands = 'none', tears = false;
  if (t >= L.l3.start) { mood = 'relief'; hands = 'clasp'; }
  if (t >= L.l5.start) { mood = 'worry'; }
  if (t >= T.xrayStart) { mood = 'worry'; hands = 'clasp'; }
  if (t >= L.l8.start) { mood = 'shock'; hands = 'cheeks'; }
  if (t >= L.l9.start) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.needle) { mood = 'worry'; hands = 'cover'; }
  if (t >= T.crack + 0.5) { mood = 'relief'; hands = 'clasp'; }
  if (t >= T.dark) { mood = 'scream'; hands = 'cheeks'; }
  if (t >= L.l17.start) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.power + 0.3) { mood = 'relief'; hands = 'none'; }
  if (t >= L.l21.start) mood = 'happy';
  if (t >= T.mirrorStart) { mood = 'happy'; hands = 'clasp'; }
  if (t >= T.bracesOff) { mood = 'shock'; hands = 'cheeks'; }
  if (t >= T.finalA) { mood = 'cry'; hands = 'cheeks'; tears = true; }
  if (t >= L.l23.start) { mood = 'shock'; tears = false; hands = 'cheeks'; }
  if (t >= T.vote) { mood = 'amused'; hands = 'none'; }
  return { mood, hands, tears };
}
function drState(t) {
  let mood = 'calm', tool = 'none', o = {};
  if (t >= L.l4.start) mood = 'calm';
  if (t >= L.l5.start) { mood = 'focus'; tool = 'mirror'; o = { toolX: -310, toolY: -10, toolR: -70 }; }
  if (t >= W5()) { mood = 'shock'; tool = 'none'; }
  if (t >= L.l6.start) { mood = 'serious'; tool = 'pointer'; o = { toolX: -330, toolY: 40, toolR: 62 }; }
  if (t >= L.l9.start) { mood = 'serious'; tool = 'none'; o = {}; }
  if (t >= L.l12.start) { mood = 'calm'; }
  if (t >= T.crack + 0.6) { mood = 'proud'; tool = 'tooth'; o = { toolX: -250, toolY: -110, toolR: 50 }; }
  if (t >= L.l15.start) { mood = 'calm'; tool = 'none'; o = {}; }
  if (t >= T.dark) mood = 'shock';
  if (t >= L.l17.start) mood = 'serious';
  if (t >= T.power + 0.3) { mood = 'calm'; }
  if (t >= L.l21.start) { mood = 'serious'; }
  if (t >= T.mirrorStart) mood = 'relief';
  if (t >= T.bracesOff) mood = 'proud';
  if (t >= L.l23.start) mood = 'amused';
  return { mood, tool, ...o, lamp: t >= L.l15.start - 0.001 && t < T.power ? (t >= T.dark ? 1 : 0) : t >= T.power + 0.4 ? 0 : 0 };
}
function W5() { return w('l5', 'serio') - 0.2; }

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), lp = lazyPos(t), seated = t >= T.sit + 0.28;
  const ms = mariState(t), ds = drState(t), lampOn = flickerOn(t) > 0.5;
  const py = lp.fy - 830 * lp.S, headY = py - 215 * lp.S;
  const lazy = `<g transform="translate(${lp.x},${py}) scale(${lp.S})">${drawLazy(P)}</g>`;
  const mari = `<g transform="translate(${MARI_X},${CHAR_Y}) scale(0.82)">${drawMari({ mood: ms.mood, hands: ms.hands, tears: ms.tears, blink: blinkOf(t, 0.4), look: 0.7, t })}</g>`;
  const dr = `<g transform="translate(${DR_X},${CHAR_Y}) scale(0.82)">${drawDentist({ ...ds, blink: blinkOf(t, 1.9), look: -0.7, t, part: 'body' })}</g><g transform="translate(${DR_X},${CHAR_Y}) scale(0.82)">${drawDentist({ ...ds, t, part: 'tool' })}</g>`;
  const icons = talkIcon(t, 'M', MARI_X + 110, CHAR_Y - 150) + talkIcon(t, 'D', DR_X - 110, CHAR_Y - 160);
  const fx = sparklesMouth(t, 540, headY + 60, lp.S, T.reveal, T.mirrorEnd) + sparklesMouth(t, 540, headY + 60, lp.S, T.finalB - 0.2, L.l22d.end + 0.4);
  const world = `<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})"><image href="${roomPng}" width="${W}" height="${H}"/>${chairBack(seated)}${lampSvg(lampOn, t)}${mari}${dr}${lazy}${seated ? chairFront() : ''}${icons}${fx}${darkWorld(t)}</g>`;
  const closeupOn = !!T.closeups.find(([a, b]) => t >= a && t <= b);
  const dark = t >= T.dark && t < T.power;
  const spotMask = `<defs><radialGradient id="sg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000"/><stop offset="0.55" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient><mask id="spotMask"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="540" cy="900" r="${400 + Math.sin(t * 3) * 14}" fill="url(#sg)"/><circle cx="${300 + Math.sin(t * 2) * 30}" cy="1000" r="230" fill="url(#sg)" opacity="0.5"/></mask></defs>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}${spotMask}
    <defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter><linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06242e" stop-opacity="0.5"/><stop offset="1" stop-color="#06242e" stop-opacity="0"/></linearGradient></defs>
    ${world}<rect width="${W}" height="460" fill="url(#topfade)"/>
    ${mouthOverlay(t, P)}${xrayOverlay(t)}${mirrorOverlay(t)}${skipCard(t)}${flashFx(t)}
    <g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 3/30</text></g>
    ${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}
    ${t < T.vote ? captions(t, closeupOn) : ''}${endCard(t)}${slate(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}
if (process.argv[2] === 'preview') {
  for (const s of process.argv.slice(3)) writeFileSync(path.join(B, `p_${s}.png`), frame(parseFloat(s)));
  console.log('preview ok', 'DUR', DUR.toFixed(2), 'frames', Math.round(DUR * FPS));
} else {
  const a0 = parseInt(process.argv[2] ?? '0'), total = Math.round(DUR * FPS), a1 = process.argv[3] && parseInt(process.argv[3]) >= 0 ? Math.min(parseInt(process.argv[3]), total) : total;
  const out = process.argv[4] || path.join(B, 'video_mudo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
