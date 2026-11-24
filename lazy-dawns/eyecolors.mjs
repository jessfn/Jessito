import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { applyFinalFace } from './face_final.mjs'; import { EYEX } from './rig.mjs'; import { defs } from './lazy_lib.mjs';
const C = [
 ['Miel (actual)', null],
 ['Negro café profundo', ['#0e0805', '#2a170c', '#5a3a22', '#8a6040']],
 ['Verde esmeralda', ['#0c2412', '#1f6a3a', '#4aa868', '#a8e0a0']],
 ['Verde oliva dorado', ['#1c200c', '#58601e', '#a89a3c', '#e0d078']],
 ['Azul claro', ['#0a1c34', '#2a63a8', '#6aa6dc', '#c4e4ff']],
 ['Gris azulado', ['#14202a', '#566a7a', '#98acba', '#dce8f0']],
 ['Violeta', ['#1c0c2e', '#6a3aa0', '#a678d8', '#e6d0ff']],
 ['Ámbar dorado', ['#2a1004', '#b0641a', '#e09a3a', '#ffd88a']]];
const tiles = [];
C.forEach(([n, pal], i) => { applyFinalFace(); if (pal) EYEX.pal = pal;
  const P = dp(); P.eyes.lookX = 0.15; P.mouth.smile = 0.5; P.mouth.open = 0.05; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`;
  writeFileSync(`/tmp/ecol_${i}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 }, font: { loadSystemFonts: true } }).render().asPng()); execSync(`ffmpeg -y -loglevel error -i /tmp/ecol_${i}.png -vf crop=720:900:664:170,scale=480:600 /tmp/ecolc_${i}.png`); tiles.push([n, readFileSync(`/tmp/ecolc_${i}.png`)]); });
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); let body = '';
tiles.forEach(([n, t], i) => { const x = (i % 4) * 490 + 5, y = Math.floor(i / 4) * 660 + 5; body += `<image href="${b64(t)}" x="${x}" y="${y}" width="480" height="600"/><text x="${x + 240}" y="${y + 640}" font-family="Anton" font-size="32" text-anchor="middle" fill="#fff">${(i ? String.fromCharCode(64 + i) + ' · ' : '') + n}</text>`; });
writeFileSync('ColoresOjos.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1970" height="1330"><rect width="1970" height="1330" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
