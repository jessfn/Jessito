// Opciones de pestañas postizas (muy llenas, enchinadas, con inferiores) puestas en Lazy.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { LASHX as LASH } from './rig.mjs'; import { JAW } from './rig2d/character.mjs';
import { defs } from './lazy_lib.mjs';
const NM0 = { P1: 'A · Postizas volumen total', P2: 'B · Mega curvas muñeca', P3: 'C · Gatita postiza', P4: 'D · Mariposa wispy llena' };
import { readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
const tiles = [];
const NM = { J0: 'Actual (redondeada)', O: 'A · Ovalada fina', V: 'B · V suave (sin punta)', H: 'C · Corazón suave', D: 'D · Definida redondeada', M: 'E · Contorno de modelo fino' };
['J0','O','V','H','D','M'].forEach((k) => { LASH.style = 'P3'; JAW.style = k; JAW.w = k === 'J0' ? 1 : 0.86; const P = dp(); P.eyes.lookX = 0.2; P.mouth.smile = 0.7; P.mouth.open = 0.1; P.mouth.upperTeeth = 0.3; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect x="0" y="0" width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`;
  writeFileSync(`/tmp/lf_${k}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 }, font: { loadSystemFonts: true } }).render().asPng()); execSync(`ffmpeg -y -loglevel error -i /tmp/lf_${k}.png -vf crop=800:800:624:300 /tmp/lfc_${k}.png`); tiles.push(readFileSync(`/tmp/lfc_${k}.png`)); });
LASH.style = null;
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64');
let body = ''; tiles.forEach((t, i) => { const x = (i % 3) * 800, y = Math.floor(i / 3) * 900; body += `<image href="${b64(t)}" x="${x}" y="${y}" width="800" height="800"/><text x="${x + 400}" y="${y + 850}" font-family="Anton" font-size="40" text-anchor="middle" fill="#fff">${NM[Object.keys(NM)[i]]}</text>`; });
writeFileSync('OpcionesMandibula2.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1800"><rect width="2400" height="1800" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
