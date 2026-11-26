import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { applyDay18Face } from './face_final.mjs'; import { defs } from './lazy_lib.mjs';
const OPT = [['Coletas por detrás, pegadas', 'lowb'], ['Más largas y más pegadas', 'lowb2']]; const tiles = [];
OPT.forEach(([n, tv], i) => { applyDay18Face(); const P = dp(); P.eyes.lookX = 0.1; P.mouth.smile = 0.5; P.mouth.open = 0.03; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { hd: 'twin', tv, len: 0.7, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect width="1024" height="1500" fill="#2a1830"/>${rc(P)}</svg>`;
  writeFileSync(`/tmp/hc_${i}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 1 }, font: { loadSystemFonts: true } }).render().asPng()); tiles.push([n, readFileSync(`/tmp/hc_${i}.png`)]); });
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); let body = '';
tiles.forEach(([n, t], i) => { const x = i * 700 + 5; body += `<image href="${b64(t)}" x="${x}" y="5" width="690" height="1012"/><text x="${x + 345}" y="1066" font-family="Anton" font-size="40" text-anchor="middle" fill="#ffe14d">${n}</text>`; });
writeFileSync('Lazy_peinado_D2_completa.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1410" height="1100"><rect width="1410" height="1100" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
