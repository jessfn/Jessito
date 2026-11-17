import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs'; import { renderCharacter, svgDoc, defaultPose, applyExpr } from './character.mjs';
const P = defaultPose(); applyExpr(P, 'smile', 1);
const svg = svgDoc(`<rect width="1024" height="1536" fill="#f4f1ee"/>${renderCharacter(P)}`);
writeFileSync('/tmp/rest.svg', svg);
const t = Date.now(); writeFileSync('/tmp/rest.png', new Resvg(svg, { fitTo: { mode: 'width', value: 1024 } }).render().asPng()); console.log('ms', Date.now() - t);
