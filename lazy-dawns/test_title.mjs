// Prueba de titulo 3D "ESPECIAL" (3 estilos) con luces, brillos y extrusion. Salida: build/title_{A,B,C}.png
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
const FD = '/home/user/Jessito/assets/fonts/';
const ropt = { font: { fontFiles: ['Anton-Regular.ttf', 'Bungee-Regular.ttf', 'BungeeShade-Regular.ttf', 'Monoton-Regular.ttf', 'Righteous-Regular.ttf', 'LilitaOne-Regular.ttf'].map((f) => FD + f), loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const plate = 'data:image/png;base64,' + readFileSync('plates3d/ballroom.png').toString('base64');
const W = 1080, H = 1920, OUT = '#12090a';
const star = (x, y, s, o = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><path d="M0,-30 Q3,-4 30,0 Q3,4 0,30 Q-3,4 -30,0 Q-3,-4 0,-30Z" fill="${c}"/><circle r="7" fill="#fff"/></g>`;
const extrude = (txt, x, y, font, fs, n, dx, dy, cA, cB, ls = 6) => Array.from({ length: n }, (_, i) => { const k = 1 - i / (n - 1); const t = n - 1 - i; const c = [0, 1, 2].map((j) => Math.round(cA[j] + (cB[j] - cA[j]) * k)); return `<text x="${x + dx * t}" y="${y + dy * t}" font-family="${font}" font-size="${fs}" text-anchor="middle" letter-spacing="${ls}" fill="rgb(${c})" stroke="rgb(${c.map((v) => Math.max(0, v - 40))})" stroke-width="3" stroke-linejoin="round">${txt}</text>`; }).join('');
const rays = (cx, cy, col, n = 18, op = 0.14, rot = 0) => Array.from({ length: n }, (_, i) => { const a0 = i / n * 6.283 + rot, a1 = a0 + 0.12; return `<path d="M${cx},${cy} L${cx + Math.cos(a0) * 1300},${cy + Math.sin(a0) * 1300} L${cx + Math.cos(a1) * 1300},${cy + Math.sin(a1) * 1300}Z" fill="${col}" opacity="${i % 2 ? op * 0.6 : op}"/>`; }).join('');
const base = (inner, tint) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="bl" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="14"/></filter><filter id="bl2" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5"/></filter><radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${tint}" stop-opacity="0.7"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/></radialGradient></defs><image href="${plate}" width="${W}" height="${H}" preserveAspectRatio="none"/><rect width="${W}" height="${H}" fill="#05030a" opacity="0.55"/>${inner}</svg>`;
// A: oro cromado
const A = (() => { const x = 540, y = 760, fs = 168; const T = 'ESPECIAL';
  return base(`${rays(540, 700, '#ffe9a8', 20, 0.16, 0.1)}<circle cx="540" cy="700" r="520" fill="url(#halo)"/>
  <text x="${x + 10}" y="${y + 50}" font-family="Bungee" font-size="${fs}" text-anchor="middle" letter-spacing="4" fill="#000" opacity="0.5" filter="url(#bl)">${T}</text>
  ${extrude(T, x, y, 'Bungee', fs, 26, 1.0, 1.5, [255, 216, 110], [92, 52, 8], 4)}
  <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.38" stop-color="#ffd84a"/><stop offset="0.5" stop-color="#b8780f"/><stop offset="0.62" stop-color="#ffe9a0"/><stop offset="1" stop-color="#f2a712"/></linearGradient><linearGradient id="sw" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0.35" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.85"/><stop offset="0.65" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <text x="${x}" y="${y}" font-family="Bungee" font-size="${fs}" text-anchor="middle" letter-spacing="4" fill="url(#gA)" stroke="${OUT}" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${T}</text>
  <text x="${x - 2}" y="${y - 3}" font-family="Bungee" font-size="${fs}" text-anchor="middle" letter-spacing="4" fill="none" stroke="#fff" stroke-width="2" opacity="0.8">${T}</text>
  <text x="${x}" y="${y}" font-family="Bungee" font-size="${fs}" text-anchor="middle" letter-spacing="4" fill="url(#sw)">${T}</text>
  ${star(150, 640, 1.6)}${star(930, 600, 1.2)}${star(520, 600, 1.0, 0.9, '#ffe9a8')}${star(880, 790, 1.4)}${star(230, 800, 0.9)}
  <text x="540" y="900" font-family="Righteous" font-size="50" text-anchor="middle" letter-spacing="6" fill="#fff" stroke="${OUT}" stroke-width="10" paint-order="stroke">NADA SERÁ IGUAL</text>
  <g transform="translate(540,990)"><rect x="-300" y="-38" width="600" height="76" rx="38" fill="#ff4d8d" stroke="${OUT}" stroke-width="7"/><text x="0" y="14" font-family="Righteous" font-size="40" text-anchor="middle" letter-spacing="4" fill="#fff">NO CUENTA COMO DÍA</text></g>`, '#ffcf6a'); })();
// B: neon rosa 3D
const B = (() => { const x = 540, y = 760, fs = 160; const T = 'ESPECIAL';
  return base(`${rays(540, 700, '#ff7ac8', 16, 0.14, 0.3)}<circle cx="540" cy="700" r="560" fill="url(#halo)"/>
  <text x="${x}" y="${y}" font-family="Monoton" font-size="${fs}" text-anchor="middle" letter-spacing="2" fill="none" stroke="#ff2d9c" stroke-width="26" opacity="0.35" filter="url(#bl)">${T}</text>
  <text x="${x}" y="${y}" font-family="Monoton" font-size="${fs}" text-anchor="middle" letter-spacing="2" fill="none" stroke="#ff2d9c" stroke-width="12" opacity="0.6" filter="url(#bl2)">${T}</text>
  ${extrude(T, x, y, 'Monoton', fs, 14, 0.9, 1.4, [255, 80, 170], [70, 10, 60], 2)}
  <text x="${x}" y="${y}" font-family="Monoton" font-size="${fs}" text-anchor="middle" letter-spacing="2" fill="#fff3fb" stroke="#ff9ad8" stroke-width="2">${T}</text>
  ${star(170, 650, 1.5, 1, '#ffd1f0')}${star(910, 610, 1.1, 1, '#ffd1f0')}${star(540, 590, 0.9, 0.9, '#fff')}
  <text x="540" y="890" font-family="Righteous" font-size="50" text-anchor="middle" letter-spacing="6" fill="#fff" stroke="#8a1458" stroke-width="10" paint-order="stroke">UNA GRAN REVELACIÓN</text>
  <g transform="translate(540,985)"><rect x="-300" y="-38" width="600" height="76" rx="38" fill="#1a0a24" stroke="#ff4dc0" stroke-width="6"/><text x="0" y="14" font-family="Righteous" font-size="40" text-anchor="middle" letter-spacing="4" fill="#ffd1f0">NO CUENTA COMO DÍA</text></g>`, '#ff4dc0'); })();
// C: cristal/violeta con Bungee Shade
const C = (() => { const x = 540, y = 760, fs = 150; const T = 'ESPECIAL';
  return base(`${rays(540, 700, '#c4b5fd', 22, 0.15, 0.6)}<circle cx="540" cy="700" r="540" fill="url(#halo)"/>
  <text x="${x + 8}" y="${y + 40}" font-family="Bungee Shade" font-size="${fs}" text-anchor="middle" fill="#000" opacity="0.5" filter="url(#bl)">${T}</text>
  <defs><linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#a5f3fc"/><stop offset="0.55" stop-color="#7c3aed"/><stop offset="1" stop-color="#f0abfc"/></linearGradient></defs>
  <text x="${x}" y="${y}" font-family="Bungee Shade" font-size="${fs}" text-anchor="middle" fill="url(#gC)" stroke="${OUT}" stroke-width="6" paint-order="stroke" stroke-linejoin="round">${T}</text>
  <text x="${x - 2}" y="${y - 2}" font-family="Bungee Shade" font-size="${fs}" text-anchor="middle" fill="none" stroke="#fff" stroke-width="1.6" opacity="0.8">${T}</text>
  ${star(160, 640, 1.5, 1, '#e0f2fe')}${star(920, 600, 1.2, 1, '#e0f2fe')}${star(540, 600, 1.0)}${star(900, 800, 0.9)}
  <text x="540" y="890" font-family="Righteous" font-size="50" text-anchor="middle" letter-spacing="6" fill="#fff" stroke="${OUT}" stroke-width="10" paint-order="stroke">ALGO VA A CAMBIAR</text>
  <g transform="translate(540,985)"><rect x="-300" y="-38" width="600" height="76" rx="38" fill="#7c3aed" stroke="${OUT}" stroke-width="7"/><text x="0" y="14" font-family="Righteous" font-size="40" text-anchor="middle" letter-spacing="4" fill="#fff">NO CUENTA COMO DÍA</text></g>`, '#a78bfa'); })();
for (const [k, s] of [['A', A], ['B', B], ['C', C]]) writeFileSync(`build/title_${k}.png`, new Resvg(s, ropt).render().asPng());
console.log('ok');
