import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const base = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0, i: 0 }, r: { r: 0, i: 0 } }, mouth: { open: 0.3, wide: 0.5, smile: 0.8, asym: 0, press: 0, teeth: { clean: 1, braces: 0, crooked: 0 } }, armL: { t: { x: -392, y: 335 }, w: 0 }, armR: { t: { x: 392, y: 335 }, w: 0 }, skin: { acne: 0.03, glow: 0.9, mask: 0, dry: 0, foam: 0, patch: 0, red: 0 } });
const S = [['lunar', {}, {}], ['base blanca', {}, { found: 1, shade: 'pale', mole: 1 }], ['base', {}, { found: 1, shade: 'match', mole: 0 }], ['contorno+ilum', {}, { found: 1, shade: 'match', mole: 0, contour: 1, highlight: 1, blush: 1 }], ['sombras+liner', {}, { found: 1, shade: 'match', mole: 0, contour: 1, highlight: 1, blush: 1, shadow: 1, liner: 1, lash: 1 }], ['gloss final', {}, { found: 1, shade: 'match', mole: 0, contour: 1, highlight: 1, blush: 1, shadow: 1, liner: 1, lash: 1, lip: true }]];
S.forEach(([n, h, mk], i) => { const p = base(); p.hair = { s: 1, len: 1, shine: 0.9 }; p.makeup = mk; if (mk.lip) { p.mouth.lip = '#e0788f'; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100">${defs('e3d')}<rect width="100%" height="100%" fill="#f4c8dc"/><g transform="translate(450,420) scale(0.78)">${drawLazy(p)}</g><text x="450" y="50" font-family="Inter" font-weight="800" font-size="40" text-anchor="middle" fill="#12090a">${n}</text></svg>`;
  writeFileSync(`build/h_${i}.png`, new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Inter' } }).render().asPng()); });
execSync('ffmpeg -y -loglevel error -i build/h_0.png -i build/h_1.png -i build/h_2.png -i build/h_3.png -i build/h_4.png -i build/h_5.png -filter_complex "[0][1][2]hstack=3[a];[3][4][5]hstack=3[b];[a][b]vstack,scale=1800:-1" build/makeup_test.png');
console.log('ok');
