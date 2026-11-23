import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS } from './rig2d/character.mjs'; import { applyFinalFace, resetFace } from './face_final.mjs'; import { MOUTHX } from './rig.mjs'; import { defs } from './lazy_lib.mjs';
const EX = [
 ['Antes (boca anterior)', 'old', { smile: 0.8, open: 0.12, wide: 0.3, teeth: 0.6 }],
 ['Neutra', 'new', { smile: 0.12, open: 0, wide: 0, teeth: 0.2 }],
 ['Sonrisa', 'new', { smile: 0.8, open: 0.1, wide: 0.3, teeth: 0.7 }],
 ['Sonrisa abierta', 'new', { smile: 1, open: 0.45, wide: 0.6, teeth: 1 }],
 ['Risa', 'new', { smile: 1, open: 0.85, wide: 0.8, teeth: 1 }],
 ['Asombro "O"', 'new', { smile: 0, open: 0.6, wide: 0, round: 1, teeth: 0.4 }],
 ['Hablando "A"', 'new', { smile: 0.2, open: 0.7, wide: 0.1, teeth: 0.9 }],
 ['Triste', 'new', { smile: -0.7, open: 0, wide: 0, teeth: 0 }],
 ['Labios apretados', 'new', { smile: 0, open: 0, wide: 0, press: 0.9, teeth: 0 }]];
const tiles = [];
EX.forEach(([name, ver, m], i) => { if (ver === 'old') { resetFace(); applyFinalFace(); MOUTHX.k = 1.0; MOUTHX.dy = 0; } else { applyFinalFace(); }
  const P = dp(); P.eyes.lookX = 0.1; P.mouth.smile = m.smile; P.mouth.open = m.open; P.mouth.wide = m.wide || 0; P.mouth.round = m.round || 0; P.mouth.press = m.press || 0; P.mouth.upperTeeth = m.teeth; P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`;
  writeFileSync(`/tmp/mo_${i}.png`, new Resvg(svg, { fitTo: { mode: 'zoom', value: 3 }, font: { loadSystemFonts: true } }).render().asPng()); execSync(`ffmpeg -y -loglevel error -i /tmp/mo_${i}.png -vf crop=1100:760:986:660,scale=640:442 /tmp/moc_${i}.png`); tiles.push([name, readFileSync(`/tmp/moc_${i}.png`)]); });
const b64 = (b) => 'data:image/png;base64,' + Buffer.from(b).toString('base64'); let body = '';
tiles.forEach(([n, t], i) => { const x = (i % 3) * 660 + 10, y = Math.floor(i / 3) * 520 + 10; body += `<image href="${b64(t)}" x="${x}" y="${y}" width="640" height="442"/><text x="${x + 320}" y="${y + 486}" font-family="Anton" font-size="34" text-anchor="middle" fill="#fff">${n}</text>`; });
writeFileSync('Boca_expresiones.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1980" height="1580"><rect width="1980" height="1580" fill="#1d1426"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
