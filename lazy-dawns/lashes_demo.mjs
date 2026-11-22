// Opciones de pestañas largas (textura real: pelos individuales conicos, abanicos, brillo) sobre un ojo detallado.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
const f = (n) => Math.round(n * 10) / 10;
const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const defs = `<defs><radialGradient id="skin" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="#d9a074"/><stop offset="1" stop-color="#b9774e"/></radialGradient>
<radialGradient id="iris" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#d49a52"/><stop offset="0.55" stop-color="#7a4520"/><stop offset="1" stop-color="#2a1208"/></radialGradient>
<linearGradient id="lg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#050203"/><stop offset="0.6" stop-color="#1a0c0a"/><stop offset="1" stop-color="#4a2a1e"/></linearGradient>
<linearGradient id="sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfc6c2"/><stop offset="0.35" stop-color="#f6f1ee"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<linearGradient id="lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3d52"/><stop offset="1" stop-color="#c58862" stop-opacity="0"/></linearGradient>
<clipPath id="eyeC"><path d="M-170,22 C-90,-120 110,-125 182,-16 Q90,58 -20,62 Q-110,60 -170,22Z"/></clipPath></defs>`;
const up = (t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return { x: a * -172 + b * -90 + c * 110 + d * 182, y: a * 24 + b * -120 + c * -125 + d * -16 }; };   // linea de pestanas superior (ajustada al borde del parpado)
const upN = (t) => { const e = 0.01, a = up(Math.max(0, t - e)), b = up(Math.min(1, t + e)); const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy); return { x: dy / l, y: -dx / l }; };
const lo = (t) => { const u = 1 - t; return { x: u * u * -170 + 2 * u * t * 0 + t * t * 178, y: u * u * 22 + 2 * u * t * 92 + t * t * -14 }; };
function hair(x, y, ang, len, curl, w, col = 'url(#lg)') { // pelo conico curvo: base ancha, punta fina
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, k = curl * len * 0.5;
  const mx = x + dx * len * 0.5 + nx * k * 0.35, my = y + dy * len * 0.5 + ny * k * 0.35, tx = x + dx * len + nx * k, ty = y + dy * len + ny * k;
  return `<path d="M${f(x - nx * w)},${f(y - ny * w)} Q${f(mx - nx * w * 0.5)},${f(my - ny * w * 0.5)} ${f(tx)},${f(ty)} Q${f(mx + nx * w * 0.5)},${f(my + ny * w * 0.5)} ${f(x + nx * w)},${f(y + ny * w)}Z" fill="${col}"/>`; }
function lashes(style) { const R = rng(11 + style.charCodeAt(0)); let s = '', low = '';
  const N = { A: 44, B: 30, C: 34, D: 40, E: 32 }[style];
  for (let i = 0; i < N; i++) { const t = (i + 0.5) / N, p = up(t), n = upN(t); const outer = t, base = Math.atan2(n.y, n.x); let ang = base + (t - 0.35) * 0.55 + (R() - 0.5) * 0.12, len, curl = -1.3, w = 1.6, fan = 1;
    if (style === 'A') { len = 50 + 36 * Math.sin(t * 3.1) + R() * 10; w = 1.7; }
    if (style === 'B') { len = 58 + 30 * Math.sin(t * 3) + R() * 12; fan = 4; w = 1.35; }
    if (style === 'C') { len = 44 + 74 * Math.pow(t, 1.6) + (i % 3 === 0 ? 26 : 0) + R() * 8; ang += 0.18 * t; w = 1.5; fan = i % 3 === 0 ? 3 : 1; }
    if (style === 'D') { len = 78 + R() * 12 - Math.abs(t - 0.5) * 24; w = 1.6; ang = base + (t - 0.5) * 0.9 + (R() - 0.5) * 0.1; fan = 2; }
    if (style === 'E') { len = 56 + 40 * Math.pow(t, 1.3) + (i % 4 === 0 ? 32 : 0) + R() * 8; fan = i % 4 === 0 ? 1 : 3; w = i % 4 === 0 ? 2 : 1.3; ang += 0.12 * t; }
    for (let k = 0; k < fan; k++) { const sp = fan === 1 ? 0 : (k - (fan - 1) / 2) * 0.17; const L2 = len * (0.86 + R() * 0.2 - (fan > 1 && k % 2 ? 0.08 : 0)); s += hair(p.x + (k - (fan - 1) / 2) * 0.6, p.y, ang + sp, L2, curl * (0.9 + R() * 0.3), w); } }
  if (style === 'D' || style === 'E') for (let i = 0; i < 16; i++) { const t = 0.1 + 0.8 * (i / 15), p = lo(t); const dir = Math.PI / 2 + (t - 0.5) * 0.7; low += hair(p.x, p.y, dir, 30 + R() * 14 + (style === 'E' ? 10 : 0), 0.7, 1.1); }
  return s + low; }
function eye(style) {
  return `<g><rect x="-260" y="-250" width="520" height="460" rx="36" fill="url(#skin)"/>
  <path d="M-220,-190 Q0,-250 220,-150" stroke="#3a1c10" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.8"/>${[...Array(26)].map((_, i) => `<path d="M${-210 + i * 16},${-190 - Math.sin(i / 26 * 3.14) * 38 + 6 + i * 1.8} l9,-9" stroke="#2a1208" stroke-width="3" opacity="0.7"/>`).join('')}
  <path d="M-176,16 Q-70,-118 40,-114 Q140,-108 188,-22 Q100,-70 20,-76 Q-80,-76 -176,16Z" fill="url(#lid)" opacity="0.9"/>
  <path d="M-150,-18 Q-40,-100 70,-92 Q140,-86 170,-40" stroke="#7a3a2a" stroke-width="3.4" fill="none" opacity="0.6"/>
  <path d="M-170,22 C-90,-120 110,-125 182,-16 Q90,58 -20,62 Q-110,60 -170,22Z" fill="url(#sc)"/>
  <g clip-path="url(#eyeC)"><circle cx="8" cy="-8" r="62" fill="url(#iris)"/>${[...Array(40)].map((_, i) => `<path d="M8,-8 L${f(8 + Math.cos(i / 40 * 6.283) * 62)},${f(-8 + Math.sin(i / 40 * 6.283) * 62)}" stroke="#e9b878" stroke-opacity="0.35" stroke-width="1.4"/>`).join('')}<circle cx="8" cy="-8" r="62" fill="none" stroke="#1a0a05" stroke-width="5"/><circle cx="8" cy="-8" r="26" fill="#060203"/><circle cx="-10" cy="-30" r="14" fill="#fff" opacity="0.95"/><circle cx="30" cy="12" r="6" fill="#fff" opacity="0.6"/><path d="M-170,22 Q-70,-95 40,-92 Q130,-88 178,-14" stroke="#000" stroke-opacity="0.35" stroke-width="22" fill="none"/></g>
  <path d="M-172,24 C-90,-120 110,-125 182,-16" stroke="#0a0506" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M178,-14 Q205,-30 214,-52" stroke="#0a0506" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M-170,22 Q-110,60 -20,62 Q90,58 178,-14" stroke="#6a2a22" stroke-width="3" fill="none" opacity="0.7"/>
  ${lashes(style)}</g>`; }
const names = { A: 'A · Clásicas largas', B: 'B · Volumen ruso', C: 'C · Gatita (cat-eye wispy)', D: 'D · Muñeca con inferiores', E: 'E · Híbrida dramática' };
let body = ''; 'ABCDE'.split('').forEach((k, i) => { const cx = 280 + (i % 3) * 540, cy = 300 + Math.floor(i / 3) * 560; body += `<g transform="translate(${cx},${cy})">${eye(k)}</g><text x="${cx}" y="${cy + 250}" font-family="Anton" font-size="38" text-anchor="middle" fill="#fff">${names[k]}</text>`; });
writeFileSync('OpcionesPestanas.png', new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1620" height="1200">${defs}<rect width="1620" height="1200" fill="#241a30"/>${body}</svg>`, { font: { loadSystemFonts: true } }).render().asPng());
