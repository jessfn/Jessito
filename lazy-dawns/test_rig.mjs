import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
const base = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 0,
  gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 },
  brow: { l: { r: 0, i: 0 }, r: { r: 0, i: 0 } }, mouth: { open: 0, wide: 0, smile: 0.1, asym: 0, press: 0 },
  armL: { t: { x: -392, y: 335 }, w: 0 }, armR: { t: { x: 392, y: 335 }, w: 0 } });
const P = [];
let p = base(); P.push(['neutral', p]);
p = base(); p.mouth.smile = 0.9; p.brow.l.r = p.brow.r.r = 0.35; p.squint = 0.4; p.mouth.open = 0.25; p.mouth.wide = 0.6; p.armR.t = { x: 430, y: -190 }; P.push(['feliz + saludo', p]);
p = base(); p.brow.l.i = p.brow.r.i = 0.9; p.lid.l = p.lid.r = 0.8; p.mouth.smile = -0.7; p.tears = 0.9; p.tearT = 0.3; p.pitch = 0.5; p.roll = -6; p.gaze.y = 0.6; p.armR.t = { x: 70, y: 120 }; P.push(['triste + llanto', p]);
p = base(); p.brow.l.r = p.brow.r.r = 0.9; p.lid.l = p.lid.r = 1.25; p.mouth.open = 0.7; p.mouth.wide = -0.5; p.armL.t = { x: -270, y: -20 }; p.armR.t = { x: 270, y: -20 }; P.push(['sorpresa', p]);
p = base(); p.lid.l = p.lid.r = 0.12; p.mouth.smile = 1; p.mouth.open = 0.85; p.mouth.wide = 0.8; p.squint = 1; p.roll = 8; p.pitch = -0.4; p.armL.t = { x: -110, y: 300 }; p.armR.t = { x: 110, y: 300 }; P.push(['carcajada', p]);
p = base(); p.brow.l.r = p.brow.r.r = -0.25; p.brow.l.i = p.brow.r.i = -0.7; p.mouth.press = 0.8; p.mouth.smile = 0.1; p.yaw = 0.6; p.gaze.x = 0.8; p.pitch = -0.3; p.armR.t = { x: 360, y: -260 }; P.push(['decidida + giro', p]);
p = base(); p.blink.l = p.blink.r = 0.6; P.push(['parpadeo (60%)', p]);
p = base(); p.brow.l.r = 0.6; p.mouth.asym = 0.6; p.gaze = { x: -0.6, y: -0.7 }; p.lid.l = p.lid.r = 0.9; p.armR.t = { x: 150, y: -150 }; P.push(['pensando + mano', p]);
p = base(); p.mouth.open = 0.9; p.mouth.wide = 0.2; p.mouth.smile = 0.2; P.push(['vocal A', p]);
p = base(); p.mouth.open = 0.5; p.mouth.wide = -1; p.mouth.smile = 0; P.push(['vocal O/U', p]);
p = base(); p.blink.r = 1; p.mouth.smile = 0.8; p.squint = 0.4; p.mouth.open = 0.2; P.push(['guiño', p]);
p = base(); p.brow.l.r = 0.5; p.brow.r.r = 0.5; p.brow.l.i = p.brow.r.i = 0.5; p.mouth.smile = 0.3; p.armL.t = { x: -330, y: 120 }; p.armR.t = { x: 330, y: 120 }; P.push(['esperanza + manos abiertas', p]);
const cols = 4, cw = 560, ch = 760, sc = 0.52;
const FACE = process.argv[2] === 'face';
let g = ''; P.forEach(([name, pp], i) => { const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
  g += `<g transform="translate(${x + cw / 2},${y + (FACE ? 500 : 380)}) scale(${FACE ? 1.05 : sc})">${FACE ? `<g transform="translate(0,215)">` : ''}${drawLazy(pp)}${FACE ? '</g>' : ''}</g><text x="${x + cw / 2}" y="${y + 40}" font-family="Inter" font-weight="700" font-size="30" text-anchor="middle" fill="#fff">${name}</text>`; });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${Math.ceil(P.length / cols) * ch}">${defs('e3d')}<rect width="100%" height="100%" fill="#5b3a8a"/>${g}</svg>`;
writeFileSync(FACE ? 'build/rig_face.png' : 'build/rig_test.png', new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Inter' } }).render().asPng());
console.log('ok');
