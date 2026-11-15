// Portadas 1080x1920 (Reels/TikTok/Shorts): fondo tematico + Lazy + titulo 3D real. Uso: node build_cover.mjs <id> ... ; salida: portadas/<id>.png
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { defs } from './lazy_lib.mjs'; import { drawLazy } from './rig.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); mkdirSync(path.join(here, 'portadas'), { recursive: true });
const FD = path.join(here, '../assets/fonts/');
const ropt = { font: { fontFiles: ['Anton-Regular.ttf', 'Bungee-Regular.ttf', 'Righteous-Regular.ttf'].map((f) => FD + f), loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const W = 1080, H = 1920, OUT = '#12090a';
const b64 = (f) => 'data:image/png;base64,' + readFileSync(path.join(here, f)).toString('base64');
const star = (x, y, s, o = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><path d="M0,-30 Q3,-4 30,0 Q3,4 0,30 Q-3,4 -30,0 Q-3,-4 0,-30Z" fill="${c}"/><circle r="6" fill="#fff"/></g>`;
const rays = (cx, cy, col, n, op) => Array.from({ length: n }, (_, i) => { const a0 = i / n * 6.283, a1 = a0 + 0.09; return `<path d="M${cx},${cy} L${cx + Math.cos(a0) * 1400},${cy + Math.sin(a0) * 1400} L${cx + Math.cos(a1) * 1400},${cy + Math.sin(a1) * 1400}Z" fill="${col}" opacity="${i % 2 ? op * 0.5 : op}"/>`; }).join('');
const basePose = () => ({ yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0.1, i: 0 }, r: { r: 0.1, i: 0 } }, mouth: { open: 0.1, wide: 0.5, smile: 0.7, asym: 0, press: 0, teeth: { clean: 1, braces: 0, crooked: 0, shine: true }, lip: '#b0206a' }, armL: { rot1: 4, rot2: 6, w: 0, curl: 0.3 }, armR: { rot1: -4, rot2: -6, w: 0, curl: 0.3 }, skin: { acne: 0.02, glow: 1, mask: 0, dry: 0, foam: 0, patch: 0, red: 0 }, hair: { hd: 'long', len: 0.82, shine: 1, cp: 1, grow: 1, wind: 0.0, sway: 0.2 }, browStyle: { k: 1 }, outfit: { kind: 'gown', prog: 1, jewel: 1 },
  makeup: { found: 1, shade: 'match', contour: 0.9, highlight: 0.8, blush: 0.7, shadow: 1, swL: 1, swR: 1, liner: 1, lsL: 1, lsR: 1, thick: 5, wing: 1, lash: 0.9, lift: 1, mole: 0, cols: { blush: '#e06a7a', contour: '#3a1608', shadow: ['#4b2a73', '#9d6be0', '#f0d8ff'], inner: '#f6ecff', liner: '#120818' } } });
const CFG = {
  d8: { bg: 'plates3d/lair_dof.png', tint: '#ff2a4a', glow: '#ff5a6a', title: 'cov_d8', titleY: 430, badge: 'cov_b8', badgeLabel: 'DÍA 8', tag: 'ALGUIEN LO ESTÁ VIENDO TODO',
    pose: (p) => { p.yaw = 0.12; p.gaze = { x: 0.8, y: -0.1 }; p.brow = { l: { r: 0.8, i: 0.7 }, r: { r: 0.8, i: 0.7 } }; p.lid = { l: 1.2, r: 1.2 }; p.mouth.open = 0.35; p.mouth.smile = -0.1; p.mouth.wide = 0.2; p.shoulders = 0.5; p.roll = -3; p.skin.red = 0.15; }, silhouette: true },
  sp: { bg: 'plates3d/ballroom_dof.png', tint: '#ffd070', glow: '#ffe08a', title: 'cov_sp', titleY: 450, badge: null, tag: 'NADA SERÁ IGUAL',
    pose: (p) => { p.mouth.open = 0.6; p.mouth.smile = 1; p.mouth.wide = 0.8; p.brow = { l: { r: 0.4, i: 0.1 }, r: { r: 0.4, i: 0.1 } }; p.squint = 0.4; p.shoulders = 0.4; p.pitch = -0.3; p.makeup.glitter = 1; p.hair.wind = 0.5; }, silhouette: false },
};
export function cover(id) { const c = CFG[id]; const p = basePose(); c.pose(p);
  const lazy = `<g transform="translate(540,1090) scale(1.22) translate(0,215)">${drawLazy(p)}</g>`;
  const sil = c.silhouette ? `<g opacity="0.7" transform="translate(900,1180) scale(0.9)"><path d="M-110,420 Q-130,40 -40,-10 L40,-10 Q130,40 110,420Z" fill="#000"/><ellipse cx="0" cy="-60" rx="62" ry="68" fill="#000"/><ellipse cx="0" cy="-118" rx="118" ry="20" fill="#000"/><path d="M-60,-122 Q0,-214 60,-122Z" fill="#000"/><circle cx="-22" cy="-70" r="7" fill="#ef4444"/><circle cx="22" cy="-70" r="7" fill="#ef4444"/></g>` : '';
  const badge = c.badge ? `<image href="${b64('plates3d/obj/' + c.badge + '/f000.png')}" x="230" y="1330" width="620" height="472" preserveAspectRatio="xMidYMid meet"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs('e3d')}<defs><radialGradient id="gl" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="${c.glow}" stop-opacity="0.75"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient><radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05030a" stop-opacity="0.75"/></radialGradient><linearGradient id="bt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></linearGradient><linearGradient id="tp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
    <image href="${b64(c.bg)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/><rect width="${W}" height="${H}" fill="#05030a" opacity="0.35"/><rect width="${W}" height="${H}" fill="url(#gl)"/>${rays(540, 900, c.glow, 18, 0.1)}
    ${sil}${lazy}${c.silhouette ? '<g transform="translate(640,1175) rotate(-12)"><rect x="-34" y="-18" width="68" height="36" rx="12" fill="#f2c9a6" stroke="#b98a66" stroke-width="4"/><circle cx="-12" cy="-5" r="2.6" fill="#b98a66"/><circle cx="3" cy="5" r="2.6" fill="#b98a66"/><circle cx="16" cy="-5" r="2.6" fill="#b98a66"/></g>' : ''}
    <rect width="${W}" height="520" fill="url(#tp)"/><rect y="1340" width="${W}" height="580" fill="url(#bt)"/>
    <ellipse cx="540" cy="${c.titleY}" rx="520" ry="260" fill="${c.glow}" opacity="0.22" filter="url(#bl)"/>
    <image href="${b64('plates3d/obj/' + c.title + '/f000.png')}" x="0" y="${c.titleY - 410}" width="${W}" height="820"/>${badge}
    <text x="540" y="${c.badge ? 1830 : 1760}" font-family="Righteous" font-size="46" text-anchor="middle" letter-spacing="8" fill="#fff" stroke="${OUT}" stroke-width="12" paint-order="stroke">${c.tag}</text>
    <text x="540" y="118" font-family="Bungee" font-size="44" text-anchor="middle" letter-spacing="10" fill="#fff" stroke="${OUT}" stroke-width="10" paint-order="stroke" opacity="0.92">LAZY DAWNS</text>
    ${star(130, 330, 1.6, 0.95, c.glow)}${star(940, 250, 1.2, 0.9, '#fff')}${star(980, 880, 1.0, 0.8, c.glow)}${star(100, 1100, 0.9, 0.8, '#fff')}${star(900, 1500, 1.3, 0.9, c.glow)}
    <rect width="${W}" height="${H}" fill="url(#vg)"/></svg>`; }
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['d8', 'sp'];
for (const id of ids) { const svg = cover(id).replace('<defs><radialGradient id="gl"', '<defs><filter id="bl" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="40"/></filter><radialGradient id="gl"'); writeFileSync(path.join(here, 'portadas', id + '.png'), new Resvg(svg, ropt).render().asPng()); console.log('ok', id); }
