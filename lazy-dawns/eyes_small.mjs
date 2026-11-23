import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { LASHX, EYEX } from './rig.mjs'; import { applyFinalFace } from './face_final.mjs'; import { defs } from './lazy_lib.mjs';
const OPTS = [
 ['Anterior (A)', { corner: 1, sx: 1.3, sy: 1.0, irK: 1.85, irX: 1.0, prK: 0.8, dx: 10, dy: 0, tilt: 0, tex: 1, anime: 1, thick: 11, pal: null }],
 ['A · Un poco más chicos', { corner: 1, sx: 1.15, sy: 0.9, irK: 1.5, irX: 1.0, prK: 0.7, dx: 6, dy: 0, tilt: 0, tex: 1, anime: 1, thick: 9, pal: null }],
 ['B · Más chicos', { corner: 1, sx: 1.05, sy: 0.82, irK: 1.28, irX: 1.0, prK: 0.66, dx: 3, dy: 0, tilt: 0, tex: 1, anime: 1, thick: 8, pal: null }],
 ['C · Chicos estirados', { corner: 1, sx: 1.18, sy: 0.78, irK: 1.28, irX: 1.1, prK: 0.66, dx: 6, dy: 0, tilt: -3, tex: 1, anime: 1, thick: 8, pal: null }]];
const tiles = [];
OPTS.forEach(([name, o], i) => { if (!o) { Object.assign(EYEX, { corner: 0, sx: 1, sy: 1, irK: 1, irX: 1, prK: 1, dx: 0, dy: 0, tilt: 0, tex: 0, anime: 0, thick: null, pal: null }); } else Object.assign(EYEX, o); applyFinalFace(); LASHX.style = 'P3';
  const P = dp(); P.eyes.lookX = 0.25; P.mouth.smile = 0.8; P.mouth.open = 0.12; P.mouth.upperTeeth = 0.6; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`;
  writeFileSync(`/tmp/ey_${i}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 3 }, font: { loadSystemFonts: true } }).render().asPng()); execSync(`ffmpeg -y -loglevel error -i /tmp/ey_${i}.png -vf crop=1000:380:1036:560,scale=1000:380 /tmp/eyc_${i}.png`); tiles.push([name, readFileSync(`/tmp/eyc_${i}.png`)]); });
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); let body = '';
tiles.forEach(([n, t], i) => { const x = (i % 2) * 1000, y = Math.floor(i / 2) * 440; body += `<image href="${b64(t)}" x="${x}" y="${y}" width="1000" height="380"/><text x="${x + 500}" y="${y + 420}" font-family="Anton" font-size="38" text-anchor="middle" fill="#fff">${n}</text>`; });
writeFileSync('OjosChicos.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1330"><rect width="2000" height="1330" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
