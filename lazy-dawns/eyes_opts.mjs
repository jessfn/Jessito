import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { LASHX, EYEX } from './rig.mjs'; import { applyFinalFace } from './face_final.mjs'; import { defs } from './lazy_lib.mjs';
const OPTS = [
 ['Actual', { sx: 1, sy: 1, irK: 1, prK: 1, dx: 0, dy: 0, tilt: 0, tex: 0, pal: null }],
 ['A · Ovalados amplios', { sx: 1.22, sy: 1.0, irK: 1.28, prK: 1.15, dx: 8, dy: 0, tilt: 0, tex: 1, pal: ['#e0aa62', '#8a4a1e', '#2a1208'] }],
 ['B · Almendra estirada', { sx: 1.38, sy: 0.94, irK: 1.32, prK: 1.15, dx: 14, dy: 0, tilt: -4, tex: 1, pal: ['#d9a05a', '#7a3d18', '#24100a'] }],
 ['C · Muñeca iris enorme', { sx: 1.3, sy: 1.12, irK: 1.5, prK: 1.25, dx: 12, dy: 0, tilt: 0, tex: 1, pal: ['#f0b86a', '#9a5420', '#2a1208'] }],
 ['D · Gatuna estirada', { sx: 1.48, sy: 0.9, irK: 1.34, prK: 1.05, dx: 18, dy: 0, tilt: -8, tex: 1, pal: ['#e6b060', '#80411a', '#1e0e08'] }],
 ['E · Disney luminosos', { sx: 1.3, sy: 1.1, irK: 1.42, prK: 1.35, dx: 12, dy: 0, tilt: -3, tex: 1, pal: ['#ffd27a', '#b0662a', '#3a1a0a'] }]];
const tiles = [];
OPTS.forEach(([name, o], i) => { Object.assign(EYEX, o); applyFinalFace(); LASHX.style = 'P3';
  const P = dp(); P.eyes.lookX = 0.25; P.mouth.smile = 0.8; P.mouth.open = 0.12; P.mouth.upperTeeth = 0.6; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`;
  writeFileSync(`/tmp/ey_${i}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 3 }, font: { loadSystemFonts: true } }).render().asPng()); execSync(`ffmpeg -y -loglevel error -i /tmp/ey_${i}.png -vf crop=1400:700:836:380,scale=1000:500 /tmp/eyc_${i}.png`); tiles.push([name, readFileSync(`/tmp/eyc_${i}.png`)]); });
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); let body = '';
tiles.forEach(([n, t], i) => { const x = (i % 2) * 1000, y = Math.floor(i / 2) * 560; body += `<image href="${b64(t)}" x="${x}" y="${y}" width="1000" height="500"/><text x="${x + 500}" y="${y + 540}" font-family="Anton" font-size="38" text-anchor="middle" fill="#fff">${n}</text>`; });
writeFileSync('OpcionesOjos.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1680"><rect width="2000" height="1680" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
