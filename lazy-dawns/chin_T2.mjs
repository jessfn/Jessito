// Opciones de pestañas postizas (muy llenas, enchinadas, con inferiores) puestas en Lazy.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { LASHX as LASH } from './rig.mjs'; import { JAW } from './rig2d/character.mjs'; import { NOSMILE } from './rig.mjs';
import { defs } from './lazy_lib.mjs';
const NM0 = { P1: 'A · Postizas volumen total', P2: 'B · Mega curvas muñeca', P3: 'C · Gatita postiza', P4: 'D · Mariposa wispy llena' };
import { readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
const NM = { A: 'Anterior (T2)', B: 'Un poquito más (T3)', C: 'Un poco más aún (T4)' };
const CFGS = [['T2', 0, 1.14], ['T3', 0, 1.14], ['T4', 0, 1.14]];
const tiles = []; const zooms = [];
CFGS.forEach(([sty, up, mk], idx) => { const off = true; const smile = 0.9; LASH.style = 'P3'; JAW.style = sty; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = off; NOSMILE.on = off; JAW.noChin = off; JAW.mouthK = mk; JAW.mouthUp = up; const P = dp(); P.eyes.lookX = 0.2; P.mouth.smile = smile || 0.15; P.mouth.open = smile ? 0.15 : 0.02; P.mouth.upperTeeth = smile ? 0.6 : 0.2; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect x="0" y="0" width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`; const k = tiles.length; writeFileSync(`/tmp/lf_${k}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 }, font: { loadSystemFonts: true } }).render().asPng()); execSync(`ffmpeg -y -loglevel error -i /tmp/lf_${k}.png -vf crop=800:800:624:300 /tmp/lfc_${k}.png`); tiles.push(readFileSync(`/tmp/lfc_${k}.png`)); execSync(`ffmpeg -y -loglevel error -i /tmp/lf_${k}.png -vf crop=360:200:844:690,scale=800:444 /tmp/lfz_${k}.png`); zooms.push(readFileSync(`/tmp/lfz_${k}.png`)); });
LASH.style = null; JAW.style = null; NOSMILE.on = false;
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); const names = Object.values(NM);
let body = ''; zooms.forEach((z, i) => { body += `<image href="${b64(z)}" x="${i * 800}" y="830" width="800" height="444"/>`; }); tiles.forEach((t, i) => { const x = i * 800; body += `<image href="${b64(t)}" x="${x}" y="0" width="800" height="800"/><text x="${x + 400}" y="850" font-family="Anton" font-size="40" text-anchor="middle" fill="#fff">${names[i]}</text>`; });
writeFileSync('Menton_T2.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1300"><rect width="2400" height="1300" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
