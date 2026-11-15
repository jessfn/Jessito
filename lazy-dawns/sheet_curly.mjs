import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
const T = { A: ['A · RIZOS SUELTOS', 'Rizos definidos largos, raya al centro, mechones en la cara'], B: ['B · MEDIA COLETA', 'Corona de rizos arriba con broche dorado y rizos cayendo'], C: ['C · AFRO CON DIADEMA', 'Halo de rizos cerrados 4A con diadema dorada y gemas'], D: ['D · RAYA LATERAL + FLOR', 'Rizos de lado con raya profunda y flor de hibisco'] };
const wr = (t, n) => { const w = t.split(' '); const L = []; let c = ''; for (const x of w) { if ((c + ' ' + x).trim().length > n) { L.push(c.trim()); c = x; } else c += ' ' + x; } L.push(c.trim()); return L; };
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1500"><rect width="100%" height="100%" fill="#1a1024"/>`;
[['A', 0, 0], ['B', 1, 0], ['C', 0, 1], ['D', 1, 1]].forEach(([k, cx, cy]) => { const x = 10 + cx * 550, y = 10 + cy * 740;
  s += `<svg x="${x}" y="${y}" width="540" height="590" viewBox="130 130 820 930" preserveAspectRatio="xMidYMid slice"><image width="1100" height="1500" href="data:image/png;base64,${readFileSync(`build/curly_${k}.png`).toString('base64')}"/></svg>
  <text x="${x + 270}" y="${y + 640}" font-family="Anton" font-size="42" text-anchor="middle" fill="#ffe14d">${T[k][0]}</text>${wr(T[k][1], 32).map((l, q) => `<text x="${x + 270}" y="${y + 676 + q * 34}" font-family="Inter" font-weight="600" font-size="27" text-anchor="middle" fill="#fff">${l}</text>`).join('')}`; });
writeFileSync('build/OpcionesPeinado.png', new Resvg(s + '</svg>', { font: { fontFiles: ['/home/user/Jessito/assets/fonts/Anton-Regular.ttf'], loadSystemFonts: true, defaultFontFamily: 'Inter' } }).render().asPng()); console.log('ok');
