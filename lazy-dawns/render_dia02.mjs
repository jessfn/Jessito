// Lazy Dawns - Dia 2: "La clinica Glow" (piel y granos). Historia tipo pelicula: clinica, tratamiento, imprevisto (cara roja), solucion y gancho al dia 3.
// Uso: node render_dia02.mjs preview 5 12 ...        (PNGs de prueba)
//      node render_dia02.mjs motion nombre t0 t1 n    (tira del personaje)
//      node render_dia02.mjs <inicio> <fin> <salida.mp4>   (rango de fotogramas)
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawMari, drawDoc } from './chars.mjs';
import { makeDirector } from './director2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia02');
const W = 1080, H = 1920, FPS = 30;
const ropt = { font: { fontFiles: [path.join(here, '../assets/fonts/Anton-Regular.ttf')], loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const pop = (t, t0, d = 0.35) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const win = (t, a, b, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * clamp((b - t) / fo); // ventana con entrada/salida
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const words = JSON.parse(readFileSync(path.join(B, 'words.json'), 'utf8'));
const wt = (w, n = 0) => words.filter((x) => x[0].toLowerCase() === w.toLowerCase())[n][1];
const OUT = '#12090a';
const DUR = words[words.length - 1][2] + 1.4;

const T = {
  slateEnd: wt('Ustedes') - 0.15, clinic: wt('Mari', 0) - 0.3, lupa: wt('lupa') - 0.4, breath: wt('respiró') - 0.1, dx: wt('tranquila,') - 0.3,
  clean: wt('Primero,'), steam: wt('Luego,'), mask: wt('Después,'), timer: wt('quince') - 0.1, maskOff: wt('quitaron,') - 0.3,
  extract: wt('reventar') - 0.2, warn: wt('doctora', 0), hurt: wt('Dolió,'), cover: wt('Mari', 1), pops: [wt('Pop,', 0), wt('Pop,', 1), wt('pop.')],
  red: wt('cara') - 0.2, panic: wt('alergiado.') - 0.6, mScream: wt('gritó.') - 0.1, lScream: wt('grité'), calmDoc: wt('Pero'), aloe: wt('aloe'), ice: wt('compresa'), normal: wt('Es'), redFade: wt('Poco'),
  patches: wt('parches,'), tonic: wt('tónico,'), cream: wt('crema,'), spf: wt('protector'), routine: wt('rutina:'), magic: wt('magia:'),
  mirror: wt('miré') - 0.3, glow: wt('piel', 1) - 0.9, cry: wt('Lloré.'), mCry: wt('Mari', 3), smile: wt('sonreí...') - 0.1, silence: wt('callados.') - 1.1, missing: wt('algo.') - 0.5,
  vote: wt('¿Qué') - 0.1, optA: wt('dientes') - 0.2, optB: wt('cejas?') - 0.2, cta1: wt('Comenta'), cta2: wt('sígueme'),
};
T.scenes = [T.slateEnd, T.clinic, T.lupa, T.dx, T.clean, T.steam, T.mask, T.maskOff, T.extract, T.red, T.aloe, T.redFade, T.patches, T.mirror, T.cry, T.smile, T.missing, T.vote];
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector(words, T, DUR, wt);

// ---------------- FONDO: clinica Glow ----------------
function roomSvg() {
  const tiles = [...Array(10)].map((_, r) => [...Array(7)].map((__, c) => `<rect x="${c * 160 - (r % 2) * 80}" y="${1100 + r * 0}" width="0" height="0"/>`).join('')).join('');
  const floorGrid = [...Array(9)].map((_, i) => `<line x1="0" y1="${1400 + i * 64}" x2="1080" y2="${1400 + i * 64}" stroke="#a7c4d1" stroke-width="3"/>`).join('') + [...Array(10)].map((_, i) => `<line x1="${i * 120}" y1="1400" x2="${i * 120 + (i - 4.5) * 60}" y2="1920" stroke="#a7c4d1" stroke-width="3"/>`).join('');
  const wallTiles = [...Array(16)].map((_, r) => `<line x1="0" y1="${400 + r * 60}" x2="1080" y2="${400 + r * 60}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>`).join('') + [...Array(10)].map((_, c) => `<line x1="${c * 120}" y1="400" x2="${c * 120}" y2="1100" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3"/>`).join('');
  const blinds = [...Array(10)].map((_, i) => `<rect x="0" y="${i * 36}" width="300" height="26" rx="6" fill="#ffffff" stroke="${OUT}" stroke-width="4" opacity="0.95"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4fffb"/><stop offset="1" stop-color="#bdeedd"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dbeaf0"/><stop offset="1" stop-color="#9dbccb"/></linearGradient>
  <radialGradient id="lamp" cx="0.5" cy="0" r="0.9"><stop offset="0" stop-color="#fffbe0" stop-opacity="0.9"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b2a2a" stop-opacity="0.5"/></radialGradient>
  <linearGradient id="ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.45"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
  <filter id="b10"><feGaussianBlur stdDeviation="10"/></filter><filter id="b24"><feGaussianBlur stdDeviation="24"/></filter></defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>${wallTiles}
  <rect x="0" y="1100" width="${W}" height="300" fill="#14b8a6"/><rect x="0" y="1088" width="${W}" height="24" fill="#ffffff" stroke="${OUT}" stroke-width="6"/>
  <path d="M0,1180 H${W} M0,1260 H${W}" stroke="#0f9488" stroke-width="4"/>
  <rect x="0" y="1380" width="${W}" height="540" fill="url(#floor)"/>${floorGrid}<rect x="0" y="1376" width="${W}" height="22" fill="#e2f4f1" stroke="${OUT}" stroke-width="5"/>
  <rect x="90" y="80" width="900" height="120" rx="20" fill="#ffffff" stroke="${OUT}" stroke-width="7" opacity="0.95"/><rect x="90" y="80" width="900" height="120" rx="20" fill="url(#lamp)"/>
  <ellipse cx="540" cy="360" rx="520" ry="360" fill="url(#lamp)" opacity="0.55"/>
  <!-- letrero neon -->
  <g transform="translate(540,470)"><rect x="-330" y="-62" width="660" height="124" rx="30" fill="#ffffff" stroke="${OUT}" stroke-width="7"/><rect x="-312" y="-46" width="624" height="92" rx="22" fill="#ff4d8d"/>
    <text x="30" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="8" paint-order="stroke" letter-spacing="3">CLÍNICA GLOW</text><path d="M-262,-4 h52 M-236,-30 v52" stroke="#fff" stroke-width="16" stroke-linecap="round"/></g>
  <!-- cartel de capas de piel -->
  <g transform="translate(70,560) rotate(-3)"><rect x="8" y="14" width="250" height="340" fill="#000" opacity="0.25" filter="url(#b10)"/><rect width="250" height="340" fill="#fff" stroke="${OUT}" stroke-width="7"/>
    <ellipse cx="125" cy="120" rx="70" ry="84" fill="#f2c4a2" stroke="${OUT}" stroke-width="5"/><path d="M60,100 Q125,10 190,100 Q175,60 125,56 Q75,60 60,100Z" fill="#3b2314"/><circle cx="104" cy="118" r="8" fill="#2a1a10"/><circle cx="146" cy="118" r="8" fill="#2a1a10"/><path d="M104,160 Q125,176 146,160" stroke="${OUT}" stroke-width="5" fill="none"/>
    ${[[168, '#ffd1b0'], [196, '#ffb38a'], [224, '#e08a6a']].map(([y, c]) => `<rect x="30" y="${y + 40}" width="190" height="24" fill="${c}" stroke="${OUT}" stroke-width="4"/>`).join('')}
    <text x="125" y="322" font-family="Anton" font-size="30" text-anchor="middle" fill="${OUT}">CAPAS DE LA PIEL</text></g>
  <!-- ventana -->
  <g transform="translate(740,560)"><rect x="-12" y="-12" width="324" height="384" rx="14" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect width="300" height="360" fill="#bfe9ff" stroke="${OUT}" stroke-width="6"/>${blinds}<path d="M300,0 L-120,520 L100,520 L300,200Z" fill="url(#ray)" opacity="0.7"/></g>
  <!-- estante de productos -->
  <g transform="translate(400,700)"><rect x="6" y="14" width="260" height="16" fill="#000" opacity="0.25" filter="url(#b10)"/><rect width="260" height="16" fill="#ffffff" stroke="${OUT}" stroke-width="5"/>
    ${[[16, '#ff4d8d', 70], [58, '#22d3ee', 90], [100, '#a3e635', 60], [136, '#ffe14d', 80]].map(([x, c, h]) => `<rect x="${x}" y="${-h}" width="30" height="${h}" rx="9" fill="${c}" stroke="${OUT}" stroke-width="4"/><rect x="${x + 8}" y="${-h - 14}" width="14" height="16" fill="#fff" stroke="${OUT}" stroke-width="3"/>`).join('')}
    <rect x="186" y="-56" width="56" height="56" rx="12" fill="#fff" stroke="${OUT}" stroke-width="4"/><text x="214" y="-22" font-family="Anton" font-size="22" text-anchor="middle" fill="#ff4d8d">CREMA</text></g>
  <!-- carrito, planta, silla -->
  <g transform="translate(70,1330)"><ellipse cx="90" cy="86" rx="130" ry="22" fill="#000" opacity="0.25" filter="url(#b10)"/><rect x="0" y="0" width="190" height="14" fill="#fff" stroke="${OUT}" stroke-width="5"/><rect x="10" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/><rect x="168" y="14" width="12" height="70" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/>
    <rect x="20" y="-50" width="40" height="50" rx="9" fill="#a78bfa" stroke="${OUT}" stroke-width="4"/><rect x="74" y="-38" width="56" height="38" rx="12" fill="#7fb069" stroke="${OUT}" stroke-width="4"/><circle cx="154" cy="-18" r="18" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>
  <g transform="translate(960,1380)"><path d="M-36,0 L-28,-70 L36,-70 L44,0Z" fill="#e8629c" stroke="${OUT}" stroke-width="6"/><path d="M4,-70 Q-60,-170 -30,-230 Q-8,-150 8,-70 Q40,-180 96,-200 Q60,-120 28,-70Z" fill="#4caf50" stroke="${OUT}" stroke-width="6"/></g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
}
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const roomPng = b64(new Resvg(roomSvg(), ropt).render().asPng());
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.32"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');

// ---------------- CAMARA y POSICIONES ----------------
const camKF = [[0, 1, 540, 960], [T.clinic, 1, 540, 960], [T.lupa, 1.35, 620, 860], [T.breath, 1.5, 860, 900], [T.dx, 1.15, 700, 900], [T.clean - 0.1, 1.15, 700, 900], [T.clean + 0.5, 1.7, 540, 840], [T.mask + 0.5, 1.5, 540, 860],
  [T.maskOff, 1.6, 540, 840], [T.extract, 1.8, 560, 850], [T.cover - 0.25, 1.8, 560, 850], [T.cover, 1.0, 540, 960], [T.pops[0] - 0.4, 1.0, 540, 960], [T.pops[0] - 0.1, 1.9, 560, 850],
  [T.red, 2.0, 540, 840], [T.red + 1.4, 2.0, 540, 840], [T.mScream - 0.3, 1.0, 540, 960], [T.calmDoc, 1.45, 860, 900], [T.aloe - 0.2, 1.7, 600, 850], [T.redFade, 1.5, 560, 850], [T.patches, 1.6, 540, 840],
  [T.routine, 1.0, 540, 960], [T.magic, 1.0, 540, 960], [T.mirror, 1.8, 540, 840], [T.cry - 0.2, 1.8, 540, 840], [T.cry + 0.6, 1.0, 540, 960], [T.smile, 1.9, 540, 860], [T.silence - 0.2, 1.9, 540, 860],
  [T.silence, 1.0, 540, 960], [T.missing, 1.25, 540, 900], [T.vote - 0.45, 2.3, 540, 905], [T.vote - 0.1, 2.3, 540, 905], [T.vote + 0.4, 1.0, 540, 960], [9999, 1.0, 540, 960]];
function camAt(t) {
  let i = 0; while (i < camKF.length - 1 && camKF[i + 1][0] <= t) i++;
  const a = camKF[i], b = camKF[Math.min(i + 1, camKF.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  let [z, fx, fy] = [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
  fx = clamp(fx, 540 / z, 1080 - 540 / z); fy = clamp(fy, 960 / z, 1920 - 960 / z);
  const sh = win(t, T.red, T.red + 1.2, 0.05, 0.4) * 5 + win(t, T.mScream - 0.2, T.lScream + 1.0, 0.05, 0.3) * 7;       // temblor de camara en el susto
  return { z, x: fx + Math.sin(t * 61) * sh, y: fy + Math.cos(t * 53) * sh };
}
const lazyPos = (t) => { const k = smooth((t - T.vote) / 0.5); return { x: 540, S: lerp(0.62, 0.5, k), fy: lerp(1480, 1300, k) }; };

// ---------------- UI / EFECTOS ----------------
function bubble(t, t0, t1, x, y, lines, tail = 'l', col = '#fff', tcol = OUT, size = 34) {
  const a = win(t, t0, t1, 0.18, 0.2); if (a <= 0) return '';
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + 56, h = lines.length * (size + 10) + 34;
  const tx = tail === 'l' ? -w * 0.28 : w * 0.28;
  return `<g transform="translate(${x},${y}) scale(${pop(t, t0, 0.22) * (t > t1 - 0.2 ? clamp((t1 - t) / 0.2) : 1)})" opacity="${a}">
    <path d="M${tx - 22},${h / 2 - 6} L${tx + (tail === 'l' ? -22 : 22)},${h / 2 + 48} L${tx + 22},${h / 2 - 6}Z" fill="${col}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="30" fill="${col}" stroke="${OUT}" stroke-width="6"/>
    <path d="M${tx - 20},${h / 2 - 4} h40" stroke="${col}" stroke-width="10"/>
    ${lines.map((l, i) => `<text x="0" y="${-h / 2 + 24 + size * 0.82 + i * (size + 10)}" font-family="Inter" font-weight="800" font-size="${size}" text-anchor="middle" fill="${tcol}">${esc(l)}</text>`).join('')}</g>`;
}
function banner(t, t0, t1, n, text, col = '#ffe14d') {
  const a = win(t, t0, t1, 0.25, 0.25); if (a <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, t0, 0.3)})" opacity="${a}"><rect x="-300" y="-46" width="600" height="92" rx="46" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-300" y="-46" width="600" height="92" rx="46" fill="${col}" stroke="${OUT}" stroke-width="7"/>
    <circle cx="-244" cy="0" r="34" fill="${OUT}"/><text x="-244" y="16" font-family="Anton" font-size="46" text-anchor="middle" fill="#fff">${n}</text><text x="20" y="18" font-family="Anton" font-size="58" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`;
}
function slate(t) {
  if (t > T.slateEnd + 0.7) return '';
  const out = ease((t - T.slateEnd) / 0.6);
  const clap = clamp((t - 0.7) / 0.12);                      // la tapa baja y hace CLAC
  const open = lerp(-32, 0, clap) + (t > 0.82 ? Math.sin((t - 0.82) * 40) * 2 * Math.exp(-(t - 0.82) * 8) : 0);
  const stripes = [...Array(7)].map((_, i) => `<polygon points="${i * 110},0 ${i * 110 + 60},0 ${i * 110 + 20},70 ${i * 110 - 40},70" fill="${i % 2 ? '#fff' : OUT}"/>`).join('');
  return `<g><rect width="${W}" height="${H}" fill="#0b0b10" opacity="${1 - out}"/><g transform="translate(540,${900 - out * 1300}) rotate(${-4 + out * 20})" opacity="${1 - out * 0.6}">
    <g transform="translate(-340,-250) rotate(${open} 0 70)"><rect width="680" height="70" fill="#fff" stroke="#fff" stroke-width="6"/><g clip-path="inset(0 0 0 0)">${stripes}</g></g>
    <rect x="-340" y="-170" width="680" height="440" rx="12" fill="#1a1a22" stroke="#fff" stroke-width="6"/>
    <text x="-310" y="-120" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">PRODUCCIÓN</text><text x="-310" y="-56" font-family="Anton" font-size="54" fill="#fff">LAZY DAWNS</text>
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">ESCENA</text><text x="-310" y="50" font-family="Anton" font-size="52" fill="#ffe14d">LA CLÍNICA GLOW</text>
    <text x="-310" y="108" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">DÍA</text><text x="-310" y="172" font-family="Anton" font-size="56" fill="#ff4d8d">2 / 30</text><text x="60" y="108" font-family="Inter" font-weight="800" font-size="26" fill="#9ca3af">TOMA</text><text x="60" y="172" font-family="Anton" font-size="56" fill="#fff">1</text>
    ${clap >= 1 && t < 1.15 ? `<text x="0" y="-300" font-family="Anton" font-size="110" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡CLAC!</text>` : ''}</g></g>`;
}
function subtitle(t) {
  const groups = []; let g = [];
  words.forEach(([w, s, e]) => { g.push({ w, s, e }); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(w)) { groups.push(g); g = []; } });
  if (g.length) groups.push(g);
  const cur = groups.find((gr) => t >= gr[0].s - 0.05 && t <= gr[gr.length - 1].e + 0.25);
  if (!cur) return '';
  const sp = cur.map((o) => `<tspan fill="${t >= o.s && t < o.e + 0.05 ? '#ffe14d' : '#fff'}">${esc(o.w.replace(/\.\.\./g, '').toUpperCase())} </tspan>`).join('');
  return `<text x="540" y="1580" font-family="Anton" font-size="84" text-anchor="middle" stroke="${OUT}" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${sp}</text>`;
}
const star = (r, c = '#ffe14d') => `<path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="${c}" stroke="${OUT}" stroke-width="4"/>`;
function popFx(t, t0, x, y) { const d = t - t0; if (d < 0 || d > 0.7) return '';
  const p = pop(t, t0, 0.18), o = clamp((0.7 - d) / 0.25);
  return `<g transform="translate(${x},${y})" opacity="${o}">${[...Array(8)].map((_, i) => `<line x1="${Math.cos(i * 0.785) * 30 * p}" y1="${Math.sin(i * 0.785) * 30 * p}" x2="${Math.cos(i * 0.785) * (54 + 40 * d) * p}" y2="${Math.sin(i * 0.785) * (54 + 40 * d) * p}" stroke="#ffe14d" stroke-width="7" stroke-linecap="round"/>`).join('')}
    <g transform="translate(0,${-58 - d * 30}) rotate(-8) scale(${p})"><text x="0" y="0" font-family="Anton" font-size="56" text-anchor="middle" fill="#ff4d8d" stroke="${OUT}" stroke-width="9" paint-order="stroke">¡POP!</text></g></g>`; }
function steamFx(t, cx, cy, S) { const a = win(t, T.steam, T.mask - 0.3, 0.4, 0.5); if (a <= 0) return '';
  return `<g opacity="${a * 0.85}">${[...Array(12)].map((_, i) => { const ph = ((t * 0.5 + i * 0.37) % 1); const x = cx + (Math.sin(i * 2.1 + t * 1.3) * 150 + (i % 3 - 1) * 90) * S, y = cy + 220 * S - ph * 560 * S; const r = (46 + (i % 4) * 14) * S * (0.6 + ph);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${(1 - ph) * 0.7}" filter="url(#b10)"/>`; }).join('')}</g>`; }
function dropsFx(t, cx, cy, S) { const a = win(t, T.clean + 0.2, T.clean + 1.4, 0.2, 0.3); if (a <= 0) return '';
  return [...Array(14)].map((_, i) => { const ph = ((t * 1.6 + i * 0.29) % 1); return `<path d="M${cx + (i - 7) * 36 * S},${cy - 320 * S + ph * 480 * S} q9,16 0,26 q-9,-10 0,-26Z" fill="#7cc8ff" stroke="#fff" stroke-width="2" opacity="${a * (1 - ph * 0.6)}"/>`; }).join('');
}
function coolFx(t, cx, cy, S) { const a = win(t, T.aloe, T.redFade, 0.3, 0.6); if (a <= 0) return '';
  return [...Array(7)].map((_, i) => { const ph = ((t * 0.7 + i * 0.31) % 1); return `<g transform="translate(${cx + Math.sin(i * 1.9) * 160 * S},${cy - 40 * S - ph * 160 * S}) scale(${S * (0.7 + ph * 0.3)})" opacity="${a * (1 - ph)}">${star(18, '#9bdcff')}</g>`; }).join('');
}
function sirenFx(t) { const a = win(t, T.red, T.redFade - 0.5, 0.2, 0.8); if (a <= 0) return '';
  const p = 0.5 + 0.5 * Math.sin(t * 9);
  return `<g opacity="${a * (0.35 + 0.3 * p)}"><rect width="${W}" height="${H}" fill="url(#siren)"/></g>
    <g opacity="${a}" transform="translate(935,300) scale(${0.9 + 0.12 * p})"><path d="M0,-46 L52,44 L-52,44Z" fill="#ffe14d" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><text x="0" y="30" font-family="Anton" font-size="56" text-anchor="middle" fill="${OUT}">!</text></g>`; }
function timerFx(t) { const a = win(t, T.timer, T.maskOff - 0.5, 0.3, 0.3); if (a <= 0) return '';
  const k = clamp((t - T.timer - 0.3) / 1.9); const m = Math.max(0, Math.round(15 * (1 - k))), s = Math.max(0, Math.round(59 * (1 - ((k * 15) % 1))));
  return `<g transform="translate(850,640) scale(${pop(t, T.timer, 0.3)})" opacity="${a}"><circle r="104" fill="#fff" stroke="${OUT}" stroke-width="8"/><circle r="90" fill="none" stroke="#e5e7eb" stroke-width="4"/>
    ${[...Array(12)].map((_, i) => `<line x1="0" y1="-82" x2="0" y2="-72" stroke="${OUT}" stroke-width="5" transform="rotate(${i * 30})"/>`).join('')}
    <line x1="0" y1="0" x2="0" y2="-66" stroke="${OUT}" stroke-width="8" stroke-linecap="round" transform="rotate(${k * 360 * 3})"/><line x1="0" y1="0" x2="0" y2="-44" stroke="#ff4d8d" stroke-width="10" stroke-linecap="round" transform="rotate(${k * 360})"/><circle r="9" fill="${OUT}"/>
    <rect x="-86" y="116" width="172" height="62" rx="16" fill="${OUT}"/><text x="0" y="162" font-family="Anton" font-size="46" text-anchor="middle" fill="#7cf29a">${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</text>
    ${k > 0.02 && k < 0.98 ? `<text x="0" y="-130" font-family="Anton" font-size="40" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="8" paint-order="stroke">▶▶ AVANCE RÁPIDO</text>` : ''}</g>`; }
function badges(t) {
  const items = [['PARCHES', T.patches, '#ffb020', 'patch'], ['TÓNICO', T.tonic, '#22d3ee', 'bottle'], ['CREMA', T.cream, '#ff4d8d', 'jar'], ['SPF', T.spf, '#fb7185', 'sun']];
  const icon = (k) => ({ patch: '<circle r="26"/><circle r="10" fill="#d6453a" stroke="none"/>', bottle: '<rect x="-14" y="-10" width="28" height="42" rx="9"/><rect x="-8" y="-30" width="16" height="22" rx="4"/>', jar: '<rect x="-30" y="-10" width="60" height="38" rx="12"/><rect x="-26" y="-26" width="52" height="18" rx="6"/>', sun: '<circle r="18"/>' + [...Array(8)].map((_, i) => `<line x1="0" y1="-26" x2="0" y2="-38" stroke="${OUT}" stroke-width="6" transform="rotate(${i * 45})"/>`).join('') })[k];
  const a = win(t, T.patches - 0.1, T.routine - 0.3, 0.1, 0.3); if (a <= 0) return '';
  return items.map(([label, t0, col, ic], i) => { const p = pop(t, t0, 0.4); if (p <= 0) return ''; const x = 160 + i * 253;
    return `<g transform="translate(${x},560) scale(${p})" opacity="${a}"><circle cx="4" cy="8" r="62" fill="#000" opacity="0.3"/><circle r="62" fill="${col}" stroke="${OUT}" stroke-width="7"/><circle cx="-18" cy="-24" r="14" fill="#fff" opacity="0.3"/>
      <g fill="#fff" stroke="${OUT}" stroke-width="4" stroke-linejoin="round">${icon(ic)}</g><text x="0" y="112" font-family="Anton" font-size="36" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="9" paint-order="stroke">${label}</text></g>`; }).join('');
}
function routineCard(t) {
  const a = win(t, T.routine, T.magic - 0.1, 0.3, 0.3); if (a <= 0) return '';
  const col = (x, title, items, bg, ic) => `<g transform="translate(${x},0)"><rect x="-190" y="-170" width="380" height="340" rx="34" fill="${bg}" stroke="${OUT}" stroke-width="7"/><text x="0" y="-112" font-family="Anton" font-size="52" text-anchor="middle" fill="${OUT}">${ic} ${title}</text>
    ${items.map((s, i) => `<g transform="translate(-150,${-60 + i * 62})"><circle r="19" fill="#fff" stroke="${OUT}" stroke-width="4"/><path d="M-9,0 l7,8 l13,-16" stroke="#16a34a" stroke-width="6" fill="none" stroke-linecap="round" opacity="${clamp((t - T.routine - 0.3 - i * 0.3) * 6)}"/><text x="34" y="10" font-family="Inter" font-weight="800" font-size="30" fill="${OUT}">${s}</text></g>`).join('')}</g>`;
  return `<g transform="translate(540,590) scale(${0.85 * pop(t, T.routine, 0.4)})" opacity="${a}">${col(-205, 'MAÑANA', ['Limpiar', 'Tónico', 'Crema', 'Protector'], '#fff3b0', '☀')}${col(205, 'NOCHE', ['Limpiar', 'Tónico', 'Crema', 'Parches'], '#c7d2fe', '☾')}
    <text x="0" y="230" font-family="Anton" font-size="46" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="10" paint-order="stroke">TODOS LOS DÍAS</text></g>`;
}
function magicSticker(t) { const a = win(t, T.magic, T.magic + 2.2, 0.2, 0.4); if (a <= 0) return '';
  return `<g transform="translate(540,560) rotate(-6) scale(${pop(t, T.magic, 0.35)})" opacity="${a}"><rect x="-370" y="-90" width="740" height="180" rx="30" fill="#ffe14d" stroke="${OUT}" stroke-width="9"/><text x="0" y="-8" font-family="Anton" font-size="60" text-anchor="middle" fill="${OUT}">NADA DE MAGIA</text><text x="0" y="62" font-family="Anton" font-size="76" text-anchor="middle" fill="#ff4d8d" stroke="${OUT}" stroke-width="8" paint-order="stroke">= CONSTANCIA</text></g>`; }
function warnBanner(t) { const a = win(t, T.warn, wt('casa.') + 0.6, 0.25, 0.4); if (a <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, T.warn, 0.3)})" opacity="${a}"><rect x="-420" y="-64" width="840" height="128" rx="30" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect x="-410" y="-54" width="820" height="108" rx="24" fill="#ffe14d"/>
    <path d="M-368,28 L-330,-30 L-292,28Z" fill="#ef4444" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><text x="-330" y="20" font-family="Anton" font-size="34" text-anchor="middle" fill="#fff">!</text>
    <text x="40" y="-8" font-family="Anton" font-size="46" text-anchor="middle" fill="${OUT}">SOLO UNA PROFESIONAL</text><text x="40" y="34" font-family="Inter" font-weight="800" font-size="30" text-anchor="middle" fill="#7f1d1d">NUNCA LO INTENTES EN CASA</text></g>`; }
function mirrorFx(t) { const a = win(t, T.mirror, T.cry - 0.1, 0.3, 0.35); if (a <= 0) return '';
  const g = ((t - T.mirror) * 0.9) % 2;
  return `<g opacity="${a}"><path d="M0,0 H${W} V${H} H0Z M540,890 m-440,0 a440,640 0 1,0 880,0 a440,640 0 1,0 -880,0Z" fill="#0b0b10" fill-rule="evenodd" opacity="0.88"/>
    <ellipse cx="540" cy="890" rx="440" ry="640" fill="none" stroke="#e8c27a" stroke-width="22"/><ellipse cx="540" cy="890" rx="418" ry="618" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/>
    <g opacity="0.6" transform="translate(${-400 + g * 800},0)"><path d="M300,300 L420,300 L240,1480 L120,1480Z" fill="#fff" opacity="0.18"/></g></g>`; }
function glowStars(t, cx, cy, S) { const a = win(t, T.glow + 0.7, T.cry - 0.1, 0.3, 0.4); if (a <= 0) return '';
  return [[-150, -120, 22], [140, -80, 30], [-100, 70, 18], [170, 40, 22], [0, -190, 26], [-190, -10, 16]].map(([x, y, r], i) => `<g transform="translate(${cx + x * S * 1.4},${cy + y * S * 1.4}) scale(${(0.7 + 0.3 * Math.sin(t * 8 + i)) * pop(t, T.glow + 0.7 + i * 0.1, 0.3)}) rotate(${t * 40})" opacity="${a}">${star(r)}</g>`).join('');
}
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  const a = pop(t, T.optA), b = pop(t, T.optB);
  let s = `<rect y="0" width="${W}" height="${H}" fill="#12090a" opacity="${0.55 * k}"/>`;
  s += `<text x="540" y="${1040 - 30 * (1 - ease(k))}" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ ARREGLAMOS MAÑANA?</text>`;
  if (a > 0) s += `<g transform="translate(540,1170) scale(${a})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="${OUT}">A · DIENTES</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1310) scale(${b})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff">B · CEJAS</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1448) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1550) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 3</text></g>`;
  return s;
}

// ---------------- PERSONAJES DE APOYO (estado por tiempo) ----------------
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
function mariState(t) {
  const x = lerp(-260, 215, ease((t - T.clinic) / 0.7)) * 1; if (t < T.clinic) return null;
  let mood = 'happy', hands = 'none', tears = false;
  if (t >= T.lupa) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.dx) { mood = 'relief'; hands = 'none'; }
  if (t >= T.clean) mood = 'happy';
  if (t >= T.extract) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.cover) { mood = 'worry'; hands = 'cover'; }
  if (t >= T.pops[2] + 0.8) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.mScream - 0.2) { mood = 'scream'; hands = 'cheeks'; }
  if (t >= T.lScream + 1.2) { mood = 'worry'; hands = 'clasp'; }
  if (t >= T.aloe) mood = 'worry';
  if (t >= T.normal) { mood = 'relief'; hands = 'none'; }
  if (t >= T.patches) mood = 'happy';
  if (t >= T.mirror) { mood = 'happy'; }
  if (t >= T.cry) { mood = 'cry'; hands = 'cheeks'; tears = true; }
  if (t >= T.smile + 1.1) { mood = 'shock'; hands = 'cheeks'; tears = false; }
  if (t >= T.vote - 0.3) { mood = 'worry'; hands = 'clasp'; }
  return { x, mood, hands, tears };
}
function docState(t) {
  const x = lerp(1340, 880, ease((t - T.clinic) / 0.7)); if (t < T.clinic) return null;
  let mood = 'calm', tool = 'none', o = {};
  if (t >= T.lupa) { mood = 'focus'; tool = 'lupa'; o = { lupaX: -300, lupaY: -80 }; }
  if (t >= T.breath) { mood = 'serious'; tool = 'none'; }
  if (t >= T.dx) { mood = 'calm'; }
  if (t >= T.mask) mood = 'calm';
  if (t >= T.extract) { mood = 'focus'; tool = 'extractor'; o = { toolX: -388, toolY: -64, toolR: -78 }; }
  if (t >= T.warn) { mood = 'serious'; tool = 'none'; o = { hand: [-70, 120, 0] }; }
  if (t >= wt('casa.') + 0.6) { mood = 'focus'; tool = 'extractor'; o = { toolX: -388, toolY: -64, toolR: -78 }; }
  if (t >= T.pops[2] + 0.8) { mood = 'calm'; tool = 'none'; o = {}; }
  if (t >= T.red) { mood = 'calm'; }
  if (t >= T.aloe) { mood = 'calm'; tool = 'aloe'; o = { toolX: -330, toolY: -50 }; }
  if (t >= T.ice) { tool = 'ice'; o = { toolX: -390, toolY: -40 }; }
  if (t >= T.normal) { tool = 'none'; o = {}; mood = 'calm'; }
  if (t >= T.redFade) mood = 'relief';
  if (t >= T.mirror) mood = 'relief';
  if (t >= T.smile + 1.1) mood = 'shock';
  if (t >= T.vote - 0.3) mood = 'amused';
  return { x, mood, tool, ...o };
}

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), lp = lazyPos(t);
  const ms = mariState(t), ds = docState(t);
  const py = lp.fy - 830 * lp.S, headY = py - 215 * lp.S;
  const lazy = `<g transform="translate(${lp.x},${py}) scale(${lp.S})">${drawLazy(P)}</g>`;
  const fade = t >= T.vote ? clamp(1 - (t - T.vote) / 0.4) : 1;
  const mari = ms && fade > 0 ? `<g transform="translate(${ms.x},934) scale(0.82)" opacity="${fade}">${drawMari({ mood: ms.mood, hands: ms.hands, tears: ms.tears, blink: blinkOf(t, 0.4), look: 0.7, t })}</g>` : '';
  const doc = ds && fade > 0 ? `<g transform="translate(${ds.x},934) scale(0.82)" opacity="${fade}">${drawDoc({ ...ds, blink: blinkOf(t, 1.9), look: -0.7, t, part: 'body' })}</g>` : '';
  const docTool = ds && fade > 0 ? `<g transform="translate(${ds.x},934) scale(0.82)" opacity="${fade}">${drawDoc({ ...ds, t, part: 'tool' })}</g>` : '';
  const fx = `${dropsFx(t, 540, headY, lp.S)}${steamFx(t, 540, headY, lp.S)}${coolFx(t, 540, headY, lp.S)}${glowStars(t, 540, headY, lp.S)}${T.pops.map((p, i) => popFx(t, p, [467, 580, 607][i], [850, 800, 842][i])).join('')}`;
  const bubbles = ms ? [
    bubble(t, T.clinic + 0.5, T.clinic + 2.2, ms.x + 40, 700, ['¡Vamos, Lazy!'], 'l'),
    bubble(t, wt('dijo:') + 0.2, T.dx + 2.2, 860, 640, ['Tranquila...', 'esto tiene solución'], 'r', '#e0f2fe'),
    bubble(t, T.cover, T.cover + 1.6, 215, 640, ['¡No miro!'], 'l'),
    bubble(t, T.mScream, T.mScream + 1.1, 215, 640, ['¡AAAAAH!'], 'l', '#fff', '#ef4444', 44),
    bubble(t, T.normal, T.normal + 2.8, 860, 640, ['Es normal, solo', 'está irritada'], 'r', '#e0f2fe'),
    bubble(t, T.mCry + 0.3, T.mCry + 1.8, 215, 640, ['¡Qué bonita!'], 'l'),
    bubble(t, T.silence + 0.7, T.missing + 0.3, 215, 640, ['...'], 'l', '#fff', OUT, 60), bubble(t, T.silence + 0.7, T.missing + 0.3, 860, 640, ['...'], 'r', '#e0f2fe', OUT, 60),
  ].join('') : '';
  const scream = t >= T.lScream && t < T.lScream + 1.1 ? `<g transform="translate(540,${headY - 250 * lp.S * 1.4}) scale(${pop(t, T.lScream, 0.2)})"><text x="0" y="0" font-family="Anton" font-size="${70 * cam.z}" text-anchor="middle" fill="#ef4444" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡AAAAAH!</text></g>` : '';
  const world = `<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})"><image href="${roomPng}" width="${W}" height="${H}"/>${doc}${mari}${lazy}${docTool}${fx}${bubbles}${scream}</g>`;
  const dim = t >= T.vote - 0.2 ? '' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}
    <defs><radialGradient id="siren" cx="0.5" cy="0.5" r="0.75"><stop offset="0.4" stop-color="#ef4444" stop-opacity="0"/><stop offset="1" stop-color="#ef4444" stop-opacity="0.9"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter><linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#062a2a" stop-opacity="0.5"/><stop offset="1" stop-color="#062a2a" stop-opacity="0"/></linearGradient></defs>
    ${world}
    <rect width="${W}" height="460" fill="url(#topfade)"/>
    <g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 2/30</text></g>
    ${mirrorFx(t)}${sirenFx(t)}${timerFx(t)}${badges(t)}${routineCard(t)}${magicSticker(t)}${warnBanner(t)}
    ${banner(t, T.clean, T.steam - 0.2, '1', 'LIMPIEZA', '#7cc8ff')}${banner(t, T.steam, T.mask - 0.2, '2', 'VAPOR', '#e5e7eb')}${banner(t, T.mask, T.maskOff - 0.1, '3', 'MASCARILLA', '#a4cf8f')}${banner(t, T.extract, T.warn - 0.1, '4', 'EXTRACCIÓN', '#ffb3a6')}
    ${t < T.vote ? subtitle(t) : ''}${endCard(t)}${slate(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}
const lerpT = (a, b, k) => a + (b - a) * k;
if (process.argv[2] === 'preview') {
  for (const s of process.argv.slice(3)) writeFileSync(path.join(B, `p_${s}.png`), frame(parseFloat(s)));
  console.log('preview ok', 'DUR', DUR.toFixed(2), 'frames', Math.round(DUR * FPS));
} else if (process.argv[2] === 'motion') {
  const [name, t0, t1, n] = [process.argv[3], parseFloat(process.argv[4]), parseFloat(process.argv[5]), parseInt(process.argv[6])];
  let g = ''; for (let i = 0; i < n; i++) { const t = lerpT(t0, t1, i / (n - 1)); g += `<g transform="translate(${i * 330 + 165},262) scale(0.3)">${drawLazy(pose(t))}</g><text x="${i * 330 + 165}" y="40" font-family="Inter" font-weight="700" font-size="30" text-anchor="middle" fill="#fff">${t.toFixed(2)}s</text>`; }
  writeFileSync(path.join(B, `motion_${name}.png`), new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${n * 330}" height="520">${charDefs}<rect width="100%" height="100%" fill="#5b3a8a"/>${g}</svg>`, ropt).render().asPng()); console.log('motion ok');
} else {
  const a0 = parseInt(process.argv[2] ?? '0'), total = Math.round(DUR * FPS), a1 = process.argv[3] && parseInt(process.argv[3]) >= 0 ? Math.min(parseInt(process.argv[3]), total) : total;
  const out = process.argv[4] || path.join(B, 'video_mudo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
