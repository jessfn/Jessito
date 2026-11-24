import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
import { renderCharacter as rc, defaultPose as dp, ALLDEFS, LOOK, MK } from './rig2d/character.mjs'; import { JAW } from './rig2d/character.mjs'; import { applyFinalFace } from './face_final.mjs'; import { defs } from './lazy_lib.mjs';
applyFinalFace(); if (process.argv[3] === 'nolight') { JAW.light = 0; JAW.d = 0; } if (process.argv[3] === 'noshadow') LOOK.shadow = 0; const P = dp(); P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${defs('e3d')}${ALLDEFS}<rect width="1024" height="1500" fill="#3a2540"/>${rc(P)}</svg>`;
writeFileSync(process.argv[2], new Resvg(svg, { fitTo: { mode: 'zoom', value: 3 }, font: { loadSystemFonts: true } }).render().asPng());
