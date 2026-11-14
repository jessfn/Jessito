import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const base = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0.1, i: 0 }, r: { r: 0.1, i: 0 } }, mouth: { open: 0.22, wide: 0.5, smile: 0.85, asym: 0, press: 0, teeth: { clean: 1, braces: 0, crooked: 0, shine: true } }, armL: { rot1: 4, rot2: 6, w: 0, curl: 0.3 }, armR: { rot1: -4, rot2: -6, w: 0, curl: 0.3 }, skin: { acne: 0.02, glow: 1, mask: 0, dry: 0, foam: 0, patch: 0, red: 0 }, hair: { s: 1, len: 1, shine: 0.95 }, browStyle: { k: 1 }, outfit: { kind: 'gown', prog: 1, jewel: 1 } });
const base0 = { found: 1, shade: 'match', contour: 1, highlight: 1, blush: 1, wide: 1, lash: 1 };
const L = process.argv[2] ? JSON.parse(process.argv[2]) : null;
const LOOKS = [
 ['A', { ...base0, shadow: 1, liner: 1, thick: 4, wing: 0.9, lash: 0.7, lift: 1, cols: { blush: '#ee7d6a', shadow: ['#6a3d1c', '#d9a24a', '#ffe9a8'], inner: '#fff6d0', liner: '#1a0c08' } }, '#c4566a'],
 ['B', { ...base0, shadow: 1, liner: 1, thick: 4, wing: 0.8, lash: 0.8, lift: 1, sparkle: 1, cols: { blush: '#ff7aa8', shadow: ['#a8305e', '#f2788f', '#ffd0e0'], inner: '#ffffff', gem: '#ffd1f0', liner: '#2a0d1a' } }, '#e0507f'],
 ['C', { ...base0, shadow: 1, liner: 1, thick: 6, wing: 1.2, lash: 1, cut: 1, lift: 1, cols: { blush: '#d9604a', shadow: ['#0e4a3a', '#2fae7c', '#e8c36a'], inner: '#fff0b8', liner: '#06100c' } }, '#8f1d3a'],
 ['D', { ...base0, shadow: 1, liner: 1, thick: 5, wing: 1, lash: 0.9, lift: 1, cols: { blush: '#e06a7a', shadow: ['#4b2a73', '#9d6be0', '#f0d8ff'], inner: '#f6ecff', liner: '#120818' } }, '#b0206a'],
];
LOOKS.forEach(([n, mk, lip], i) => { const p = base(); p.makeup = mk; p.mouth.lip = lip;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1500" viewBox="${process.env.VB||"0 0 1100 1500"}">${defs('e3d')}<rect width="100%" height="100%" fill="#1a1024"/><g transform="translate(550,${+process.env.CY||1250}) scale(${+process.env.SC||3.4})"><g transform="translate(0,215)">${drawLazy(p)}</g></g></svg>`;
  { const m = svg.match(/.{40}(NaN|undefined|Infinity).{20}/g); if (m) console.log(m.slice(0,4)); }
  writeFileSync(`build/eye_${n}.png`, new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng()); });
console.log('ok');
