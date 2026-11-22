// Opciones de pestañas postizas (muy llenas, enchinadas, con inferiores) puestas en Lazy.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { LASHX as LASH } from './rig.mjs'; import { JAW } from './rig2d/character.mjs'; import { NOSMILE } from './rig.mjs';
import { defs } from './lazy_lib.mjs';
const NM0 = { P1: 'A · Postizas volumen total', P2: 'B · Mega curvas muñeca', P3: 'C · Gatita postiza', P4: 'D · Mariposa wispy llena' };
import { readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
const NM = { A: 'Antes', B: 'A · Mentón más corto', C: 'B · Más corto y afinado', D: 'C · Corto + boca más arriba' };
const CFGS = [['R1', 0, 1], ['C1', 0, 1.14], ['C2', 0, 1.14], ['C3', 6, 1.14]];
const tiles = [];
CFGS.forEach(([sty, up, mk], idx) => { const off = idx > 0; const smile = 0.9; LASH.style = 'P3'; JAW.style = sty; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = off; NOSMILE.on = off; JAW.noChin = off; JAW.mouthK = mk; JAW.mouthUp = up; const P = dp(); P.eyes.lookX = 0.2; P.mouth.smile = smile || 0.15; P.mouth.open = smile ? 0.15 : 0.02; P.mouth.upperTeeth = smile ? 0.6 : 0.2; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect x="0" y="0" width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`; const k = tiles.length; writeFileSync(`/tmp/lf_${k}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 }, font: { loadSystemFonts: true } }).render().asPng()); execSync(`ffmpeg -y -loglevel error -i /tmp/lf_${k}.png -vf crop=800:800:624:300 /tmp/lfc_${k}.png`); tiles.push(readFileSync(`/tmp/lfc_${k}.png`)); });
LASH.style = null; JAW.style = null; NOSMILE.on = false;
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); const names = Object.values(NM);
let body = ''; tiles.forEach((t, i) => { const x = i * 800; body += `<image href="${b64(t)}" x="${x}" y="0" width="800" height="800"/><text x="${x + 400}" y="850" font-family="Anton" font-size="40" text-anchor="middle" fill="#fff">${names[i]}</text>`; });
writeFileSync('Menton_opciones.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="900"><rect width="3200" height="900" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
