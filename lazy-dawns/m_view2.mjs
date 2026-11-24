import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
import { MDEFS, renderM } from './rig2d/m_character.mjs'; import { poseClip } from './rig2d/m_clips.mjs';
const T = [0,1,2,3,4,5,6,7].map((i) => ['walk', i * 0.1125]);
let body = ''; T.forEach(([c, t], i) => { const P = poseClip(c, t); body += `<g transform="translate(${i * 420},0) scale(0.34)">${renderM(P)}</g>`; });
writeFileSync(process.argv[2] || '/tmp/mv3.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="3360" height="640" viewBox="0 0 3360 640"><rect width="3360" height="640" fill="#c9d6dc"/>${MDEFS}${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
