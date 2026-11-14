import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const p = { yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0.1, i: 0 }, r: { r: 0.1, i: 0 } }, mouth: { open: 0.22, wide: 0.5, smile: 0.85, asym: 0, press: 0, lip: '#8f1d3a', teeth: { clean: 1, braces: 0, crooked: 0, shine: true } }, armL: { rot1: 4, rot2: 6, w: 0, curl: 0.3 }, armR: { rot1: -4, rot2: -6, w: 0, curl: 0.3 }, skin: { acne: 0.02, glow: 1, mask: 0, dry: 0, foam: 0, patch: 0, red: 0 }, hair: { s: 1, len: 1, shine: 0.95 }, browStyle: { k: 1 }, outfit: { kind: 'gown', prog: 1, jewel: 1 }, makeup: { mole: 1, found: 1, shade: 'match' } };
for (const [n, o] of [['closed', 0], ['open', 0.22], ['talk', 0.6]]) { p.mouth.open = o; const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500">${defs('e3d')}<g transform="translate(500,560) scale(1.5)"><g transform="translate(0,215)">${drawLazy(p)}</g></g></svg>`; writeFileSync(`build/lip_${n}.png`, new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng()); }
console.log('ok');
