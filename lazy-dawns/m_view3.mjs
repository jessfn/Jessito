import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
import { MDEFS, renderM } from './rig2d/m_character.mjs'; import { poseClip } from './rig2d/m_clips.mjs';
const T = [['idle', 0.2], ['walk', 0.15], ['walk', 0.55]];
let body = ''; T.forEach(([c, t], i) => { const P = poseClip(c, t); body += `<g transform="translate(${i * 700},0) scale(0.78)">${renderM(P)}</g>`; });
writeFileSync(process.argv[2] || '/tmp/mv.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2100" height="1240" viewBox="0 0 2100 1240"><rect width="2100" height="1240" fill="#c9d6dc"/>${MDEFS}${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
