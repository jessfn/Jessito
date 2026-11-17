import { writeFileSync } from 'node:fs'; import * as C from './character.mjs'; import { drawLazyHeadBack } from '../rig.mjs';
const p = C.oldHeadPose(C.defaultPose()); const H = { ...p, hair: { hd: 'long', len: 0, grow: 0 } };
writeFileSync('/tmp/head.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="-210 -230 420 420">${C.ALLDEFS}<rect x="-210" y="-230" width="420" height="420" fill="#fff"/>${drawLazyHeadBack(H)}</svg>`);
