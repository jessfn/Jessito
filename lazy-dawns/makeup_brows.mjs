import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS, LOOK, MK, JAW, FACEK, BROW } from './rig2d/character.mjs'; import { applyFinalFace } from './face_final.mjs'; import { EYEX, LIPX, BROWX } from './rig.mjs'; import { defs } from './lazy_lib.mjs';
const FULL = JSON.parse(JSON.stringify(LOOK));
const D = { blush: 0, contour: 0.35, highlight: 0.25, shadow: 1, liner: 0.9, wing: 0.9, thick: 4, cols: { blush: '#ff7aa8', contour: '#7a3a4a', shadow: ['#8a1658', '#f060a8', '#ffd0e8'], inner: '#fff0f8', hl: '#fff0f4', liner: '#2a0a1a' } };
const OP = [['Actual (look D anterior)', null], ['A · Recta moderna', 'straight'], ['B · Arco fino', 'arch'], ['C · Esponjosa (laminada)', 'fluffy'], ['D · Difuminada soft glam', 'ombre']];
const tiles = [];
OP.forEach(([n, st], i) => { applyFinalFace(); Object.assign(EYEX, { sx: 0.85, sy: 0.68, irK: 0.95, prK: 0.49 }); Object.keys(LOOK).forEach((q) => delete LOOK[q]); Object.assign(LOOK, JSON.parse(JSON.stringify(FULL)));
  Object.assign(LOOK, D); LOOK.tex = 1; MK.lipColor = '#b0185a'; LIPX.tex = 1; LIPX.shimmer = 1; EYEX.glit = 1; EYEX.glitCol = ['#ffe0f4', '#ffffff', '#ff9ad0']; EYEX.blushCol = '#ff7aa8'; EYEX.shK = 1; EYEX.drape = 1; EYEX.blushK = 1.1; BROWX.style = null; FACEK.hi = 1; FACEK.glow = 1; EYEX.shH = null; EYEX.side = 0;
  if (st) { BROWX.style = st; LIPX.gloss = 0.55; JAW.light = 0.25; JAW.d = 0.3; FACEK.hi = 0.35; FACEK.glow = 0.4; EYEX.shH = 1.4; EYEX.side = 1; EYEX.sideCol = ['#ffffff', '#ffc0e0', '#ff7ac0']; } else { LIPX.gloss = 1; LOOK.highlight = 0.9; }
  const P = dp(); P.eyes.lookX = 0.1; P.mouth.smile = 0.5; P.mouth.open = 0.03; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`;
  writeFileSync(`/tmp/br_${i}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 }, font: { loadSystemFonts: true } }).render().asPng());
  execSync(`ffmpeg -y -loglevel error -i /tmp/br_${i}.png -vf crop=860:900:582:150,scale=600:628 /tmp/brc_${i}.png`); tiles.push([n, readFileSync(`/tmp/brc_${i}.png`)]); });
BROWX.style = null; FACEK.hi = 1; FACEK.glow = 1;
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); let body = '';
tiles.forEach(([n, t], i) => { const x = (i % 3) * 610 + 5, y = Math.floor(i / 3) * 690 + 5; body += `<image href="${b64(t)}" x="${x}" y="${y}" width="600" height="628"/><text x="${x + 300}" y="${y + 665}" font-family="Anton" font-size="34" text-anchor="middle" fill="#fff">${n}</text>`; });
writeFileSync('OpcionesCejas.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1840" height="1390"><rect width="1840" height="1390" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
