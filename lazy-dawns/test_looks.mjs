import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const base = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0.1, i: 0 }, r: { r: 0.1, i: 0 } }, mouth: { open: 0.22, wide: 0.5, smile: 0.85, asym: 0, press: 0, teeth: { clean: 1, braces: 0, crooked: 0, shine: true } }, armL: { rot1: 4, rot2: 6, w: 0, curl: 0.3 }, armR: { rot1: -4, rot2: -6, w: 0, curl: 0.3 }, skin: { acne: 0.02, glow: 1, mask: 0, dry: 0, foam: 0, patch: 0, red: 0 }, hair: { s: 1, len: 1, shine: 0.95 }, browStyle: { k: 1 }, outfit: { kind: 'gown', prog: 1, jewel: 1 } });
const LOOKS = [
 ['A · GLOW DORADO', 'Piel luminosa, sombras doradas y bronce, rubor durazno alto, delineado suave y gloss nude brillante.',
  { found: 1, shade: 'match', mole: 0, contour: 1, highlight: 1, blush: 1, blushHigh: 1, shadow: 1, wide: 1, liner: 1, thick: 4, wing: 0.7, lash: 1, freckles: 0.6, cols: { blush: '#ff9a7a', shadow: ['#7a3b12', '#d99a3a', '#f8dc92'], inner: '#fff1c2', hl: '#fff0cf' } }, '#d98a6a'],
 ['B · ROSA CRISTAL', 'Efecto "glass skin": rubor rosa lavado, sombra rosa con brillitos y gema en el lagrimal, gloss rosa chicle.',
  { found: 1, shade: 'match', mole: 0, contour: 0.5, highlight: 1, blush: 1, blushHigh: 1, shadow: 1, wide: 1, lift: 1, sparkle: 1, liner: 1, thick: 3, wing: 0.5, lash: 1, cols: { blush: '#ff6fa8', shadow: ['#b8336a', '#f58ab8', '#ffd1e6'], inner: '#ffffff', hl: '#fff', gem: '#ffd1f0', liner: '#3a0d2a' } }, '#ff7fb0'],
 ['C · CUT CREASE COBRE', 'Ojos ahumados cobre con delineado alado largo, piel mate perfecta y labio vino brillante. Look de noche.',
  { found: 1, shade: 'match', mole: 0, contour: 1, highlight: 0.8, blush: 0.7, shadow: 1, wide: 1, lift: 1, liner: 1, thick: 7, wing: 1.3, lash: 1, cols: { blush: '#d4684a', contour: '#3a1608', shadow: ['#3b1a0c', '#b4572a', '#e8a066'], inner: '#ffd9a8', hl: '#ffe6c2', liner: '#0a0508' } }, '#8f1d3a'],
 ['D · DELINEADO GRÁFICO', 'Look editorial moderno: delineado azul eléctrico con ala, sombra lila difuminada y labio berry.',
  { found: 1, shade: 'match', mole: 0, contour: 0.8, highlight: 1, blush: 0.8, blushHigh: 1, shadow: 0.9, wide: 1, liner: 1, thick: 8, wing: 1.2, lash: 1, sparkle: 0.5, cols: { blush: '#e0608f', shadow: ['#5b2bbf', '#a77bf0', '#e4d0ff'], inner: '#e8f4ff', liner: '#1d6bff', gem: '#bfe0ff' } }, '#b0206a'],
];
const wrap = (t, n) => { const w = t.split(' '); const L = []; let c = ''; for (const x of w) { if ((c + ' ' + x).trim().length > n) { L.push(c.trim()); c = x; } else c += ' ' + x; } L.push(c.trim()); return L; };
const out = [];
LOOKS.forEach(([title, desc, mk, lip], i) => { const p = base(); p.makeup = mk; p.mouth.lip = lip;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1500">${defs('e3d')}<rect width="100%" height="100%" fill="#1a1024"/><g transform="translate(550,560) scale(1.25)"><g transform="translate(0,215)">${drawLazy(p)}</g></g>
    <rect x="30" y="1180" width="1040" height="290" rx="30" fill="#000" opacity="0.4"/><text x="550" y="1250" font-family="Anton" font-size="62" text-anchor="middle" fill="#ffe14d" letter-spacing="2">${title}</text>
    ${wrap(desc, 46).map((l, k) => `<text x="550" y="${1320 + k * 44}" font-family="Inter" font-weight="600" font-size="34" text-anchor="middle" fill="#fff">${l.trim()}</text>`).join('')}</svg>`;
  out.push(new Resvg(svg, { font: { fontFiles: ['/home/user/Jessito/assets/fonts/Anton-Regular.ttf'], loadSystemFonts: true, defaultFontFamily: 'Inter' } }).render().asPng()); writeFileSync(`build/look_${i}.png`, out[i]); });
console.log('ok');
