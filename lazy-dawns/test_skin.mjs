import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const base = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0, i: 0 }, r: { r: 0, i: 0 } }, mouth: { open: 0, wide: 0, smile: 0.3, asym: 0, press: 0 }, armL: { t: { x: -392, y: 335 }, w: 0 }, armR: { t: { x: 392, y: 335 }, w: 0 } });
const S = [['inicio', { acne: 1, mask: 0, dry: 0, foam: 0, patch: 0, glow: 0 }], ['espuma', { acne: 1, mask: 0, dry: 0, foam: 1, patch: 0, glow: 0 }], ['mascarilla', { acne: 1, mask: 1, dry: 0.8, foam: 0, patch: 0, glow: 0 }], ['sin granos 55%', { acne: 0.55, mask: 0, dry: 0, foam: 0, patch: 0, glow: 0 }], ['parches', { acne: 0.45, mask: 0, dry: 0, foam: 0, patch: 1, glow: 0 }], ['brillo final', { acne: 0.12, mask: 0, dry: 0, foam: 0, patch: 0, glow: 1 }]];
let g = ''; S.forEach(([n, sk], i) => { const p = base(); p.skin = sk; const x = (i % 3) * 620, y = Math.floor(i / 3) * 640;
  g += `<g transform="translate(${x + 310},${y + 330}) scale(1.0)"><g transform="translate(0,215)">${drawLazy(p)}</g></g><text x="${x + 310}" y="${y + 40}" font-family="Inter" font-weight="700" font-size="30" text-anchor="middle" fill="#fff">${n}</text>`; });
// un personaje por SVG para evitar ids duplicados de clipPath
const out = [];
S.forEach(([n, sk], i) => { const p = base(); p.skin = sk;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="1500">${defs('e3d')}<rect width="100%" height="100%" fill="#5b3a8a"/><g transform="translate(350,640)">${drawLazy(p)}</g><text x="350" y="60" font-family="Inter" font-weight="700" font-size="30" text-anchor="middle" fill="#fff">${n}</text></svg>`;
  out.push(new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Inter' } }).render().asPng()); });
import { execSync } from 'node:child_process';
out.forEach((b, i) => writeFileSync(`build/skin_${i}.png`, b));
execSync('ffmpeg -y -loglevel error -i build/skin_0.png -i build/skin_1.png -i build/skin_2.png -i build/skin_3.png -i build/skin_4.png -i build/skin_5.png -filter_complex "[0]crop=620:560:40:90[c0];[1]crop=620:560:40:90[c1];[2]crop=620:560:40:90[c2];[3]crop=620:560:40:90[c3];[4]crop=620:560:40:90[c4];[5]crop=620:560:40:90[c5];[c0][c1][c2]hstack=3[a];[c3][c4][c5]hstack=3[b];[a][b]vstack=2" build/skin_test.png');
console.log('ok');
