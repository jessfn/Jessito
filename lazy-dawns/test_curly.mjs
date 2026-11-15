import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const base = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0.1, i: 0 }, r: { r: 0.1, i: 0 } }, mouth: { open: 0.22, wide: 0.5, smile: 0.85, asym: 0, press: 0, teeth: { clean: 1, braces: 0, crooked: 0, shine: true }, lip: '#b0206a' }, armL: { rot1: 4, rot2: 6, w: 0, curl: 0.3 }, armR: { rot1: -4, rot2: -6, w: 0, curl: 0.3 }, skin: { acne: 0.02, glow: 1, mask: 0, dry: 0, foam: 0, patch: 0, red: 0 }, browStyle: { k: 1 }, outfit: { kind: 'gown', prog: 1, jewel: 1 },
  makeup: { found: 1, shade: 'match', contour: 0.9, highlight: 0.8, blush: 0.7, shadow: 1, liner: 1, thick: 5, wing: 1, lash: 0.9, lift: 1, mole: 0, cols: { blush: '#e06a7a', shadow: ['#4b2a73', '#9d6be0', '#f0d8ff'], inner: '#f6ecff', liner: '#120818' } } });
const ST = [['A', process.env.ST || 'long', 'X'], ['B', 'half', 'MEDIA COLETA DE RIZOS'], ['C', 'afro', 'AFRO CON DIADEMA'], ['D', 'side', 'RAYA LATERAL Y FLOR']];
const SC = +process.env.SC || 1.0, CY = +process.env.CY || 620, VB = process.env.VB;
for (const [k, st, ti] of ST) { const p = base(); p.hair = { hd: st, len: 0.7, shine: 0.9, sway: 0.2, cp: +(process.env.CP ?? 1), bounce: +(process.env.BN || 0), wind: +(process.env.WD || 0) };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1500" ${VB ? `viewBox="${VB}"` : ''}>${defs('e3d')}<rect width="100%" height="100%" fill="#1a1024"/><g transform="translate(550,${CY}) scale(${SC})"><g transform="translate(0,215)">${drawLazy(p)}</g></g></svg>`;
  writeFileSync(`build/curly_${k}.png`, new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng()); }
console.log('ok');
