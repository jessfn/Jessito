import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs'; import * as C from './character.mjs'; import { drawLazyHeadBack } from '../rig.mjs';
const s = drawLazyHeadBack({ ...C.oldHeadPose(C.defaultPose()), hair: { hd: 'long', len: 0, grow: 0 } });
const mk = (h) => `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="-210 -230 420 420">${C.ALLDEFS}<rect x="-210" y="-230" width="420" height="420" fill="#fff"/>${h}</svg>`;
const names = ['blur3', 'blur8', 'blur20', 'eb', 'eb2']; let out = '';
const variants = [s, ...names.map((n) => s.replace(new RegExp(`filter="url\\(#${n}\\)"`, 'g'), ''))];
variants.forEach((v, i) => { writeFileSync(`out/dbg9_${i}.png`, new Resvg(mk(v)).render().asPng()); });
