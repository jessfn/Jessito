import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
import { MDEFS, renderM } from './rig2d/m_character.mjs'; import { poseClip } from './rig2d/m_clips.mjs';
const T = [['idle', 0.2], ['walk', 0.0], ['walk', 0.225], ['walk', 0.45], ['walk', 0.675]];
let body = ''; T.forEach(([c, t], i) => { const P = poseClip(c, t); body += `<g transform="translate(${i * 560},0) scale(0.46)">${renderM(P)}</g>`; });
writeFileSync(process.argv[2] || '/tmp/mv.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2800" height="820" viewBox="0 0 2800 820"><rect width="2800" height="820" fill="#c9d6dc"/>${MDEFS}${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
