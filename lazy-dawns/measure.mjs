import { Resvg } from '@resvg/resvg-js';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const base = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 0, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0, i: 0 }, r: { r: 0, i: 0 } }, mouth: { open: 0, wide: 0, smile: 0.1, asym: 0, press: 0 }, armL: { t: { x: -392, y: 335 }, w: 0 }, armR: { t: { x: 392, y: 335 }, w: 0 } });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1600" viewBox="-500 -600 1000 1600">${defs('e3d')}<g>${drawLazy(base())}</g></svg>`;
const img = new Resvg(svg).render(); const px = img.pixels, w = img.width, h = img.height;
let top = h, bot = 0, left = w, right = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const a = px[(y * w + x) * 4 + 3]; if (a > 200) { if (y < top) top = y; if (y > bot) bot = y; if (x < left) left = x; if (x > right) right = x; } }
console.log('top', top - 600, 'bottom', bot - 600, 'left', left - 500, 'right', right - 500);
