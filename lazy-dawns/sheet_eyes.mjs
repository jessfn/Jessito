import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
const T = { A: ['A · DORADO LUMINOSO', 'Sombra bronce y oro, pliegue suave, ala fina y gloss rosa nude'], B: ['B · ROSA BRILLANTE', 'Sombra rosa con brillitos y gema, pestañas largas, labio rosa vivo'], C: ['C · ESMERALDA Y ORO', 'Cut crease esmeralda que combina con el vestido, ala larga, labio vino'], D: ['D · LILA ELEGANTE', 'Sombra lila difuminada, ala marcada, labio berry'] };
const cell = (k, x, y) => `<image x="${x}" y="${y}" width="540" height="560" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,${readFileSync(`build/eye_${k}.png`).toString('base64')}" clip-path="inset(0)"/>`;
const wr = (t, n) => { const w = t.split(' '); const L = []; let c = ''; for (const x of w) { if ((c + ' ' + x).trim().length > n) { L.push(c.trim()); c = x; } else c += ' ' + x; } L.push(c.trim()); return L; };
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1500"><rect width="100%" height="100%" fill="#1a1024"/>`;
[['A', 0, 0], ['B', 1, 0], ['C', 0, 1], ['D', 1, 1]].forEach(([k, cx, cy]) => { const x = 10 + cx * 550, y = 10 + cy * 740;
  s += `<svg x="${x}" y="${y}" width="540" height="560" viewBox="130 250 840 870" preserveAspectRatio="xMidYMid slice"><image width="1100" height="1500" href="data:image/png;base64,${readFileSync(`build/eye_${k}.png`).toString('base64')}"/></svg>
  <text x="${x + 270}" y="${y + 620}" font-family="Anton" font-size="44" text-anchor="middle" fill="#ffe14d">${T[k][0]}</text>
  ${wr(T[k][1], 34).map((l, q) => `<text x="${x + 270}" y="${y + 668 + q * 34}" font-family="Inter" font-weight="600" font-size="26" text-anchor="middle" fill="#fff">${l}</text>`).join('')}`; });
s += '</svg>';
writeFileSync('build/MaquillajeOpciones.png', new Resvg(s, { font: { fontFiles: ['/home/user/Jessito/assets/fonts/Anton-Regular.ttf'], loadSystemFonts: true, defaultFontFamily: 'Inter' } }).render().asPng()); console.log('ok');
