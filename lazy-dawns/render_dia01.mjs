// Lazy Dawns - Dia 1 (estilo E con ligero 3D). 1080x1920 @30fps.
// Uso: node render_dia01.mjs build/video_mudo.mp4          (video completo)
//      node render_dia01.mjs preview 2 6 12 14 21           (PNGs de prueba en build/)
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, lazy } from './lazy_lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, FPS = 30;
const ropt = { font: { fontFiles: [path.join(here, '../assets/fonts/Anton-Regular.ttf')], loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const pop = (t, t0, d = 0.35) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const words = JSON.parse(readFileSync(path.join(here, 'build/words.json'), 'utf8'));
const wt = (w, n = 0) => words.filter((x) => x[0].toLowerCase() === w.toLowerCase())[n][1];
const OUT = '#12090a';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const DUR = words[words.length - 1][2] + 1.4;

// ---------- LINEA DE TIEMPO (todo sale de los tiempos de la voz) ----------
const T = {
  name: 0.2, nameOut: 2.3,
  notif: wt('mensaje'), open: wt('Mi') - 0.2,
  m1: wt('Mari') + 0.2, m2: wt('modelos...'), m3: wt('ir.') - 0.2,
  m4: wt('¿Yo,'), m5: wt('Mírame.') + 0.25, m6: wt('rindió.') - 0.1, m7: wt('nadie'), m8: wt('pensando.') - 0.1, close: wt('paré') - 0.3,
  mirror: wt('paré') + 0.1, gr: wt('piel,', 0), ce: wt('cejas,', 0), di: wt('sonrisa...'), sparkle: wt('ganas'), mirOut: wt('Así') - 0.2,
  d30: wt('treinta') - 0.1, bPiel: wt('piel,', 1), bDientes: wt('dientes,'), bCejas: wt('cejas,', 1), bPelo: wt('pelo,'), bEstilo: wt('estilo,'), bGym: wt('gimnasio.') - 0.1,
  decide: wt('decides') - 0.1,
  vote: wt('Hoy') - 0.1, optA: wt('¿Piel'), optB: wt('dientes?') - 0.1, cta: wt('Vota'),
};
writeFileSync(path.join(here, 'build/timeline.json'), JSON.stringify({ T, DUR }));
const kf = [[0, 540, 0.62, 1480], [T.open - 0.3, 540, 0.62, 1480], [T.open + 0.4, 150, 0.28, 1800], [T.close - 0.1, 150, 0.28, 1800],
  [T.mirror + 0.3, 380, 0.66, 1480], [T.mirOut - 0.3, 380, 0.66, 1480], [T.mirOut + 0.5, 540, 0.46, 1600], [T.vote - 0.3, 540, 0.46, 1600], [T.vote + 0.4, 540, 0.44, 1010], [999, 540, 0.44, 1010]];
function camAt(t) {
  for (let i = 0; i < kf.length - 1; i++) { const a = kf[i], b = kf[i + 1]; if (t >= a[0] && t <= b[0]) { const u = ease((t - a[0]) / (b[0] - a[0] || 1)); return [1, 2, 3].map((k) => a[k] + (b[k] - a[k]) * u); } }
  return kf[kf.length - 1].slice(1);
}

// ---------- FONDO ESTATICO (cuarto con luz y volumen) ----------
function roomSvg() {
  const dots = [...Array(32)].map((_, r) => [...Array(18)].map((__, c) => `<circle cx="${c * 64 + (r % 2) * 32}" cy="${r * 64}" r="${5 + (r / 32) * 9}" fill="#b87a0c" opacity="0.2"/>`).join('')).join('');
  const bulbs = [...Array(11)].map((_, i) => { const x = 40 + i * 100, y = 420 + Math.sin(i * 0.9) * 16 + (i % 2) * 6; const c = ['#ff4d8d', '#22d3ee', '#fff', '#a3e635'][i % 4];
    return `<line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y}" stroke="${OUT}" stroke-width="4"/><circle cx="${x}" cy="${y + 12}" r="34" fill="${c}" opacity="0.22" filter="url(#b14)"/><circle cx="${x}" cy="${y + 12}" r="14" fill="${c}" stroke="${OUT}" stroke-width="4"/><circle cx="${x - 4}" cy="${y + 7}" r="4" fill="#fff" opacity="0.8"/>`; }).join('');
  const planks = [...Array(6)].map((_, i) => `<line x1="0" y1="${1390 + i * 90}" x2="1080" y2="${1390 + i * 90}" stroke="#3a2258" stroke-width="5"/>`).join('') +
    [...Array(12)].map((_, i) => `<line x1="${i * 100 + ((i % 2) * 40)}" y1="${1390 + (i % 5) * 90}" x2="${i * 100 + ((i % 2) * 40)}" y2="${1480 + (i % 5) * 90}" stroke="#3a2258" stroke-width="5"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="mir" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d6f1ff"/><stop offset="0.5" stop-color="#7ec8e8"/><stop offset="1" stop-color="#3f7fa8"/></linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1440"/><stop offset="1" stop-color="#4a3a9a"/></linearGradient>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd56b"/><stop offset="1" stop-color="#eeaa2a"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8c5db8"/><stop offset="1" stop-color="#4e2d78"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6d6" stop-opacity="0.65"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0a2a" stop-opacity="0.55"/></radialGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe3ff" stop-opacity="0.35"/><stop offset="1" stop-color="#cfe3ff" stop-opacity="0"/></linearGradient>
  <filter id="b14"><feGaussianBlur stdDeviation="14"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter></defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>${dots}
  <ellipse cx="540" cy="900" rx="620" ry="640" fill="url(#glow)"/>
  <rect x="0" y="1380" width="${W}" height="540" fill="url(#floor)"/>${planks}
  <rect x="0" y="1370" width="${W}" height="26" fill="#fff1c9" stroke="${OUT}" stroke-width="6"/><rect x="0" y="1396" width="${W}" height="22" fill="#000" opacity="0.22" filter="url(#b6)"/>
  <path d="M0,414 Q540,494 1080,414" stroke="${OUT}" stroke-width="5" fill="none"/>${bulbs}
  <!-- ventana + haz de luna -->
  <path d="M90,900 L420,1380 L760,1380 L330,900Z" fill="url(#beam)"/>
  <g transform="translate(70,560)"><rect x="8" y="14" width="344" height="424" rx="14" fill="#000" opacity="0.3" filter="url(#b6)"/><rect x="-12" y="-12" width="344" height="424" rx="14" fill="#fff" stroke="${OUT}" stroke-width="8"/>
    <rect width="320" height="400" fill="url(#sky)" stroke="${OUT}" stroke-width="6"/>
    <circle cx="230" cy="90" r="60" fill="#fff6c8" opacity="0.3" filter="url(#b14)"/><circle cx="230" cy="90" r="46" fill="#fff6c8" stroke="${OUT}" stroke-width="5"/><circle cx="246" cy="78" r="38" fill="#4a3a9a" opacity="0.9"/>
    ${[[50,60],[110,150],[180,40],[60,230],[250,200],[150,300],[280,320]].map(([x, y]) => `<path d="M${x},${y - 9} l3,7 l8,1 l-6,5 l2,8 l-7,-4 l-7,4 l2,-8 l-6,-5 l8,-1Z" fill="#fff"/>`).join('')}
    <path d="M0,400 L0,330 L40,330 L40,290 L90,290 L90,340 L140,340 L140,270 L200,270 L200,350 L260,350 L260,300 L320,300 L320,400Z" fill="#14123a" stroke="${OUT}" stroke-width="4"/>
    ${[[60,310],[110,310],[160,290],[220,300],[280,320]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="12" fill="#ffd56b"/>`).join('')}
    <line x1="160" y1="0" x2="160" y2="400" stroke="${OUT}" stroke-width="8"/><line x1="0" y1="200" x2="320" y2="200" stroke="${OUT}" stroke-width="8"/>
    <path d="M-30,-20 Q40,200 -10,420 L90,420 Q70,200 100,-20Z" fill="#ff7ab6" stroke="${OUT}" stroke-width="6"/><path d="M10,-10 Q60,200 20,410" stroke="#fff" stroke-opacity="0.35" stroke-width="8" fill="none"/></g>
  <!-- estante -->
  <g transform="translate(470,640)"><rect x="6" y="14" width="190" height="16" fill="#000" opacity="0.25" filter="url(#b6)"/>
    <rect x="0" y="0" width="190" height="16" fill="#8a4e2b" stroke="${OUT}" stroke-width="5"/>
    ${[[10,-70,22,70,'#22d3ee'],[34,-86,22,86,'#ff4d8d'],[58,-62,22,62,'#a3e635'],[84,-76,22,76,'#7c3aed']].map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${OUT}" stroke-width="4"/>`).join('')}
    <path d="M130,0 l8,-34 h34 l8,34Z" fill="#e8629c" stroke="${OUT}" stroke-width="4"/><path d="M155,-34 q-24,-30 -6,-56 q10,22 6,56 q24,-30 36,-44 q-4,30 -36,44Z" fill="#4caf50" stroke="${OUT}" stroke-width="4"/></g>
  <!-- poster -->
  <g transform="translate(690,520) rotate(3)"><rect x="10" y="16" width="300" height="400" fill="#000" opacity="0.3" filter="url(#b6)"/><rect width="300" height="400" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect x="16" y="16" width="268" height="368" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/>
    <path d="M150,60 l16,36 l40,4 l-30,26 l10,40 l-36,-20 l-36,20 l10,-40 l-30,-26 l40,-4Z" fill="#ffe14d" stroke="${OUT}" stroke-width="5"/>
    <ellipse cx="150" cy="260" rx="38" ry="42" fill="#d9a066" stroke="${OUT}" stroke-width="5"/><path d="M104,250 Q150,170 196,250 Q190,200 150,196 Q110,200 104,250Z" fill="#2a1a10"/>
    <path d="M100,300 Q150,280 200,300 L214,384 L86,384Z" fill="#22d3ee" stroke="${OUT}" stroke-width="5"/>
    <text x="150" y="364" font-family="Anton" font-size="34" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="6" paint-order="stroke">TOP MODEL</text>
    <rect x="120" y="-18" width="60" height="30" fill="#fff" opacity="0.7" stroke="${OUT}" stroke-width="3" transform="rotate(-4)"/></g>
  <!-- espejo -->
  <g transform="translate(790,930)"><rect x="10" y="20" width="236" height="548" rx="110" fill="#000" opacity="0.3" filter="url(#b6)"/><rect x="-18" y="-18" width="236" height="548" rx="110" fill="#8a4e2b" stroke="${OUT}" stroke-width="8"/>
    <rect x="-6" y="-6" width="212" height="524" rx="102" fill="none" stroke="#c98a5a" stroke-width="5"/>
    <rect width="200" height="512" rx="94" fill="url(#mir)" stroke="${OUT}" stroke-width="6"/>
    <path d="M30,60 L80,20 M20,130 L120,40 M20,220 L150,80" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity="0.6"/></g>
  <!-- ropa, pizza, planta -->
  <g><ellipse cx="190" cy="1540" rx="150" ry="24" fill="#000" opacity="0.3" filter="url(#b6)"/><path d="M80,1500 q40,-50 110,-20 q70,-20 90,30 q-30,40 -100,34 q-70,20 -100,-44Z" fill="#22d3ee" stroke="${OUT}" stroke-width="6"/><path d="M140,1480 q30,-30 70,-10 q20,26 -8,40Z" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/>
   <path d="M190,1540 l44,-24 l16,22 l-40,26Z" fill="#fff" stroke="${OUT}" stroke-width="5"/></g>
  <g transform="translate(790,1620) rotate(-6)"><ellipse cx="110" cy="40" rx="130" ry="20" fill="#000" opacity="0.3" filter="url(#b6)"/><rect width="220" height="26" fill="#d9a066" stroke="${OUT}" stroke-width="6"/><rect y="-100" width="220" height="100" fill="#e8c27a" stroke="${OUT}" stroke-width="6"/>
    <circle cx="70" cy="-55" r="18" fill="#e0482f" stroke="${OUT}" stroke-width="4"/><circle cx="140" cy="-62" r="18" fill="#e0482f" stroke="${OUT}" stroke-width="4"/><circle cx="110" cy="-28" r="14" fill="#7fb069" stroke="${OUT}" stroke-width="4"/></g>
  <g transform="translate(70,1700)"><ellipse cx="10" cy="64" rx="80" ry="14" fill="#000" opacity="0.3" filter="url(#b6)"/><path d="M-40,60 L-30,-20 L50,-20 L60,60Z" fill="#e8629c" stroke="${OUT}" stroke-width="6"/><path d="M0,-20 Q-60,-120 -30,-170 Q-10,-100 10,-20 Q40,-130 90,-150 Q60,-80 30,-20Z" fill="#4caf50" stroke="${OUT}" stroke-width="6"/></g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  </svg>`;
}
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const roomPng = b64(new Resvg(roomSvg(), ropt).render().asPng());
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.35"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const charBody = lazy('e3d');

// ---------- AVATAR de Mari (ilustracion) ----------
function avatar(id, cx, cy, r, kind = 'mari') {
  const k = r / 50;
  if (kind === 'troll') return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#9ca3af"/><circle cx="${cx}" cy="${cy - r * 0.2}" r="${r * 0.32}" fill="#e5e7eb"/><path d="M${cx - r * 0.62},${cy + r * 0.8} q${r * 0.62},-${r * 0.95} ${r * 1.24},0Z" fill="#e5e7eb"/></g>`;
  return `<g><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffd1e8"/>
    <g clip-path="url(#${id})"><g transform="translate(${cx},${cy}) scale(${k})">
      <rect x="-60" y="-60" width="120" height="120" fill="#ffb3d1"/>
      <path d="M-34,-4 Q-44,-46 0,-46 Q44,-46 34,-4 L38,46 L-38,46Z" fill="#5a2d82"/>
      <path d="M-46,52 Q-40,26 0,24 Q40,26 46,52Z" fill="#22d3ee"/>
      <rect x="-8" y="10" width="16" height="18" fill="#e9b18a"/>
      <ellipse cx="0" cy="-6" rx="25" ry="29" fill="#f2c4a2"/>
      <path d="M-27,-8 Q-28,-38 0,-38 Q28,-38 27,-8 Q18,-26 0,-26 Q-18,-26 -27,-8Z" fill="#5a2d82"/>
      <ellipse cx="-10" cy="-4" rx="3.2" ry="4" fill="#2a1a10"/><ellipse cx="10" cy="-4" rx="3.2" ry="4" fill="#2a1a10"/>
      <circle cx="-9" cy="-5.5" r="1.1" fill="#fff"/><circle cx="11" cy="-5.5" r="1.1" fill="#fff"/>
      <path d="M-14,-11 q4,-3 8,0 M6,-11 q4,-3 8,0" stroke="#3b1d55" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="-16" cy="6" rx="6" ry="3.4" fill="#ff8fa3" opacity="0.55"/><ellipse cx="16" cy="6" rx="6" ry="3.4" fill="#ff8fa3" opacity="0.55"/>
      <path d="M-8,12 Q0,20 8,12" stroke="#b03a52" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="-26" cy="4" r="3" fill="#ffe14d"/><circle cx="26" cy="4" r="3" fill="#ffe14d"/>
    </g></g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="${3 * k}"/></g>`;
}

// ---------- CELULAR 3D + CHAT ----------
const msgs = [
  { t: T.m1, side: 'l', lines: ['Amigaaa, mira este', 'casting de modelos!!'], time: '9:41' },
  { t: T.m2, side: 'l', card: true, time: '9:41' },
  { t: T.m3, side: 'l', lines: ['tienes que ir!!'], time: '9:42' },
  { t: T.m4, side: 'r', lines: ['jajaja yo?? modelo??', 'mírame...'], time: '9:43' },
  { t: T.m5, side: 'l', troll: true, lines: ['ni en tus sueños jaja'], time: '9:43' },
  { t: T.m6, side: 'l', lines: ['No les hagas caso,', 'tú puedes!!'], time: '9:44' },
  { t: T.m7, side: 'l', lines: ['Nadie nace listo, Lazy'], time: '9:44' },
  { t: T.m8, side: 'r', lines: ['ok... déjame pensarlo'], time: '9:45' },
];
const msgH = (m) => (m.card ? 330 : m.lines.length * 46 + 70);
function bubbleSvg(m, x, y, a, t) {
  const bw = m.card ? 500 : Math.min(560, Math.max(...m.lines.map((l) => l.length)) * 19.5 + 64);
  const xx = m.side === 'l' ? x : x + 620 - bw;
  const h = msgH(m);
  const fill = m.side === 'r' ? 'url(#ubub)' : m.troll ? '#ffe3d4' : '#ffffff';
  const tc = m.side === 'r' ? '#ffffff' : '#1c1c28';
  const tail = m.side === 'r' ? `<path d="M${xx + bw - 18},${y + h - 30} l26,18 l-34,-2Z" fill="#ff4d8d"/>` : `<path d="M${xx + 18},${y + h - 30} l-26,18 l34,-2Z" fill="${m.troll ? '#ffe3d4' : '#fff'}"/>`;
  let body;
  if (m.card) {
    body = `<rect x="${xx + 14}" y="${y + 14}" width="${bw - 28}" height="200" rx="20" fill="url(#cardg)"/>
      <circle cx="${xx + bw - 70}" cy="${y + 66}" r="70" fill="#fff" opacity="0.12"/>
      <path d="M${xx + 70},${y + 56} l11,25 l27,3 l-20,18 l6,27 l-24,-14 l-24,14 l6,-27 l-20,-18 l27,-3Z" fill="#ffe14d"/>
      <text x="${xx + 124}" y="${y + 84}" font-family="Inter" font-weight="800" font-size="34" fill="#fff">CASTING DE</text>
      <text x="${xx + 124}" y="${y + 124}" font-family="Inter" font-weight="800" font-size="34" fill="#fff">MODELOS</text>
      <text x="${xx + 34}" y="${y + 176}" font-family="Inter" font-weight="600" font-size="24" fill="#e0f7ff">Mañana 5PM · Rostros nuevos</text>
      <text x="${xx + 24}" y="${y + 252}" font-family="Inter" font-weight="700" font-size="28" fill="#1c1c28">Casting abierto para todas</text>
      <rect x="${xx + 24}" y="${y + 266}" width="${bw - 48}" height="40" rx="20" fill="#ffe3ef"/><text x="${xx + bw / 2}" y="${y + 295}" font-family="Inter" font-weight="700" font-size="24" text-anchor="middle" fill="#ff4d8d">Ver detalles y aplicar</text>`;
  } else {
    body = (m.troll ? `<text x="${xx + 22}" y="${y + 36}" font-family="Inter" font-weight="700" font-size="22" fill="#c2410c">karen_91</text>` : '') +
      m.lines.map((l, k) => `<text x="${xx + 30}" y="${y + (m.troll ? 70 : 52) + k * 46}" font-family="Inter" font-weight="500" font-size="34" fill="${tc}">${esc(l)}</text>`).join('');
  }
  const tm = `<text x="${xx + bw - 52}" y="${y + h - 16}" font-family="Inter" font-size="20" text-anchor="end" fill="${m.side === 'r' ? '#ffd9ea' : '#8a8a99'}">${m.time}</text>` +
    (m.side === 'r' ? `<path d="M${xx + bw - 44},${y + h - 24} l6,6 l12,-14 M${xx + bw - 34},${y + h - 24} l6,6 l12,-14" stroke="#cfeeff" stroke-width="3" fill="none" stroke-linecap="round"/>` : '');
  return `<g opacity="${clamp(a * 3)}" transform="translate(0,${(1 - a) * 26})"><rect x="${xx + 3}" y="${y + 5}" width="${bw}" height="${h}" rx="30" fill="#000" opacity="0.1"/>${tail}<rect x="${xx}" y="${y}" width="${bw}" height="${h}" rx="30" fill="${fill}"/>${body}${tm}</g>`;
}
function typingSvg(x, y, t) {
  const d = [0, 1, 2].map((i) => `<circle cx="${x + 44 + i * 30}" cy="${y + 40 - Math.abs(Math.sin(t * 8 + i)) * 7}" r="8" fill="#9a9aaa"/>`).join('');
  return `<rect x="${x}" y="${y}" width="150" height="80" rx="40" fill="#fff"/>${d}`;
}
function phone(t) {
  const open = pop(t, T.open, 0.5);
  if (open <= 0 || t > T.close + 0.4) return '';
  const sc = open * (t > T.close ? clamp(1 - (t - T.close) * 2.5) : 1);
  const PW = 700, PH = 1100, X = 190, Y = 400;
  // layout de mensajes
  let yy = 0; const pos = msgs.map((m) => { const o = { y: yy, h: msgH(m) }; yy += o.h + 28; return o; });
  const vis = msgs.map((m, i) => ({ m, p: pos[i] })).filter(({ m }) => t >= m.t - (m.card || m.side === 'r' ? 0 : 0.8));
  const lastV = vis.length ? vis[vis.length - 1].p : { y: 0, h: 0 };
  const scroll = Math.max(0, lastV.y + lastV.h - 640);
  const area = vis.map(({ m, p }) => {
    const y = 300 + p.y - scroll;
    if (t < m.t) return `<g transform="translate(30,0)">${typingSvg(0, y, t)}</g>`;
    return `<g transform="translate(30,0)">${bubbleSvg(m, 0, y, pop(t, m.t, 0.3), t)}</g>`;
  }).join('');
  const floatY = Math.sin(t * 1.6) * 6, tilt = -2.2 + Math.sin(t * 1.1) * 0.6;
  const battery = `<rect x="${PW - 108}" y="26" width="46" height="22" rx="7" fill="none" stroke="#1c1c28" stroke-width="3"/><rect x="${PW - 104}" y="30" width="32" height="14" rx="4" fill="#1c1c28"/><rect x="${PW - 60}" y="33" width="4" height="8" rx="2" fill="#1c1c28"/>`;
  const signal = [0, 1, 2, 3].map((i) => `<rect x="${PW - 218 + i * 11}" y="${42 - i * 6}" width="7" height="${6 + i * 6}" rx="2" fill="#1c1c28"/>`).join('');
  const wifi = `<path d="M${PW - 160},34 q16,-14 32,0 M${PW - 154},41 q10,-9 20,0" stroke="#1c1c28" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="${PW - 144}" cy="47" r="3" fill="#1c1c28"/>`;
  return `<g transform="translate(${X + PW / 2},${Y + PH / 2 + floatY}) rotate(${tilt}) scale(${sc}) translate(${-PW / 2},${-PH / 2})">
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d6d78"/><stop offset="0.25" stop-color="#2b2b33"/><stop offset="0.7" stop-color="#101014"/><stop offset="1" stop-color="#3a3a44"/></linearGradient>
      <linearGradient id="ubub" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d8d"/><stop offset="1" stop-color="#ff7a59"/></linearGradient>
      <linearGradient id="cardg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>
      <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.04"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="scr"><rect x="22" y="22" width="${PW - 44}" height="${PH - 44}" rx="74"/></clipPath>
      <filter id="b24"><feGaussianBlur stdDeviation="24"/></filter>
    </defs>
    <ellipse cx="${PW / 2 + 20}" cy="${PH + 56}" rx="${PW * 0.46}" ry="36" fill="#000" opacity="0.45" filter="url(#b24)"/>
    <rect x="22" y="26" width="${PW}" height="${PH}" rx="96" fill="#050507"/>
    <rect x="12" y="14" width="${PW}" height="${PH}" rx="96" fill="#17171c"/>
    <rect x="-6" y="190" width="9" height="90" rx="4" fill="#3b3b44"/><rect x="-6" y="300" width="9" height="90" rx="4" fill="#3b3b44"/><rect x="${PW - 3}" y="260" width="9" height="140" rx="4" fill="#3b3b44"/>
    <rect width="${PW}" height="${PH}" rx="96" fill="url(#body)"/>
    <rect x="2" y="2" width="${PW - 4}" height="${PH - 4}" rx="94" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/>
    <rect x="12" y="12" width="${PW - 24}" height="${PH - 24}" rx="84" fill="#050507"/>
    <g clip-path="url(#scr)">
      <rect x="22" y="22" width="${PW - 44}" height="${PH - 44}" fill="#efe6da"/>
      ${[...Array(14)].map((_, r) => [...Array(9)].map((__, c) => `<circle cx="${50 + c * 80 + (r % 2) * 40}" cy="${240 + r * 70}" r="4" fill="#d9c9b4"/>`).join('')).join('')}
      <g transform="translate(22,0)">${area}</g>
      <!-- cabecera -->
      <rect x="22" y="22" width="${PW - 44}" height="190" fill="#fff"/><rect x="22" y="212" width="${PW - 44}" height="6" fill="#000" opacity="0.08"/>
      <text x="64" y="58" font-family="Inter" font-weight="700" font-size="26" fill="#1c1c28">9:41</text>
      <rect x="${PW / 2 - 62}" y="30" width="124" height="38" rx="19" fill="#050507"/><circle cx="${PW / 2 + 38}" cy="49" r="7" fill="#1b2a44"/>
      ${signal}${wifi}${battery}
      <path d="M66,134 l-20,20 l20,20" stroke="#ff4d8d" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${avatar('avm', 150, 154, 50)}
      <circle cx="186" cy="188" r="12" fill="#22c55e" stroke="#fff" stroke-width="4"/>
      <text x="224" y="146" font-family="Inter" font-weight="800" font-size="34" fill="#1c1c28">Mari</text>
      <text x="224" y="182" font-family="Inter" font-weight="500" font-size="24" fill="#22a553">en línea</text>
      <rect x="${PW - 190}" y="132" width="40" height="30" rx="8" fill="#ff4d8d"/><path d="M${PW - 148},142 l22,-10 v30 l-22,-10Z" fill="#ff4d8d"/>
      <path d="M${PW - 106},128 q-8,0 -8,10 q4,24 28,34 q10,0 10,-8 l-10,-12 l-8,4 q-8,-6 -12,-16 l6,-6Z" fill="#ff4d8d"/>
      <!-- barra de escribir -->
      <rect x="22" y="${PH - 150}" width="${PW - 44}" height="128" fill="#fff"/><rect x="22" y="${PH - 150}" width="${PW - 44}" height="3" fill="#000" opacity="0.08"/>
      <circle cx="82" cy="${PH - 88}" r="28" fill="#ffe3ef"/><path d="M82,${PH - 102} v28 M68,${PH - 88} h28" stroke="#ff4d8d" stroke-width="6" stroke-linecap="round"/>
      <rect x="130" y="${PH - 122}" width="${PW - 270}" height="68" rx="34" fill="#f1eef5"/><text x="162" y="${PH - 78}" font-family="Inter" font-size="26" fill="#9a9aaa">Escribe un mensaje…</text>
      <circle cx="${PW - 82}" cy="${PH - 88}" r="32" fill="url(#ubub)"/><rect x="${PW - 91}" y="${PH - 108}" width="18" height="30" rx="9" fill="#fff"/><path d="M${PW - 98},${PH - 84} q16,22 32,0" stroke="#fff" stroke-width="4" fill="none"/>
      <rect x="${PW / 2 - 90}" y="${PH - 40}" width="180" height="8" rx="4" fill="#1c1c28" opacity="0.6"/>
    </g>
    <path d="M22,22 H${PW * 0.78} L${PW * 0.28},${PH - 22} H22Z" fill="url(#gloss)" clip-path="url(#scr)"/>
  </g>`;
}

function subtitle(t) {
  const groups = []; let g = [];
  words.forEach(([w, s, e]) => { g.push({ w, s, e }); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(w)) { groups.push(g); g = []; } });
  if (g.length) groups.push(g);
  const cur = groups.find((gr) => t >= gr[0].s - 0.05 && t <= gr[gr.length - 1].e + 0.25);
  if (!cur) return '';
  const sp = cur.map((o) => `<tspan fill="${t >= o.s && t < o.e + 0.05 ? '#ffe14d' : '#fff'}">${esc(o.w.replace(/\.\.\./g, '').toUpperCase())} </tspan>`).join('');
  const inChat = t > T.open && t < T.close + 0.4;
  const sy = t > T.mirOut ? 1745 : 1590;
  return `<text x="${inChat ? 640 : 540}" y="${sy}" font-family="Anton" font-size="${inChat ? 80 : 88}" text-anchor="middle" stroke="${OUT}" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${sp}</text>`;
}
function callout(t, t0, text, x, y, col = '#ffe14d') {
  const p = pop(t, t0); if (p <= 0 || t > t0 + 0.7) return '';
  return `<g transform="translate(${x},${y}) scale(${p})" opacity="${clamp((t0 + 0.7 - t) * 6)}"><rect x="-206" y="-44" width="420" height="100" rx="50" fill="#000" opacity="0.3"/><rect x="-210" y="-50" width="420" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="66" text-anchor="middle" fill="${OUT}">${text}</text></g>`;
}
function vote(t) {
  let s = `<rect width="${W}" height="${H}" fill="#12090a" opacity="${0.5 * clamp((t - T.vote) * 3)}"/>`;
  const a = pop(t, T.optA), b = pop(t, T.optB), sl = ease((t - T.vote) / 0.6);
  s += `<text x="540" y="${1215 - 40 * (1 - sl)}" font-family="Anton" font-size="86" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${clamp((t - T.vote) * 4)}">¿QUÉ ARREGLAMOS?</text>`;
  if (a > 0) s += `<g transform="translate(540,1340) scale(${a})"><rect x="-416" y="-62" width="840" height="140" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="140" rx="40" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="40" rx="20" fill="#fff" opacity="0.18"/><text x="0" y="28" font-family="Anton" font-size="80" text-anchor="middle" fill="#fff">A · PIEL Y GRANOS</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1490) scale(${b})"><rect x="-416" y="-62" width="840" height="140" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="140" rx="40" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="40" rx="20" fill="#fff" opacity="0.25"/><text x="0" y="28" font-family="Anton" font-size="80" text-anchor="middle" fill="${OUT}">B · DIENTES</text></g>`;
  if (t >= T.cta) s += `<text x="540" y="1690" font-family="Anton" font-size="62" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="10" paint-order="stroke" opacity="${0.65 + 0.35 * Math.sin(t * 8)}">VOTA EN LA ENCUESTA ↓</text>`;
  return s;
}

function badges(t) {
  const items = [['PIEL', T.bPiel, '#ff4d8d', 'drop'], ['DIENTES', T.bDientes, '#22d3ee', 'tooth'], ['CEJAS', T.bCejas, '#a3e635', 'brow'], ['PELO', T.bPelo, '#ffb020', 'hair'], ['ESTILO', T.bEstilo, '#a78bfa', 'shirt'], ['GYM', T.bGym, '#fb7185', 'gym']];
  const icon = (k) => ({
    drop: '<path d="M0,-34 C22,-6 28,6 28,14 A28,28 0 0 1 -28,14 C-28,6 -22,-6 0,-34Z"/>',
    tooth: '<path d="M-26,-22 Q-26,-34 -12,-32 Q0,-26 12,-32 Q26,-34 26,-22 Q26,-4 18,10 Q16,34 8,34 Q2,34 0,16 Q-2,34 -8,34 Q-16,34 -18,10 Q-26,-4 -26,-22Z"/>',
    brow: '<path d="M-32,10 Q-8,-24 32,-10 Q6,-4 -32,10Z"/>',
    hair: '<circle cx="-16" cy="-6" r="16"/><circle cx="2" cy="-14" r="17"/><circle cx="18" cy="-4" r="16"/><circle cx="0" cy="8" r="16"/>',
    shirt: '<path d="M-18,-30 L-34,-14 L-24,0 L-18,-6 L-18,30 L18,30 L18,-6 L24,0 L34,-14 L18,-30 Q0,-20 -18,-30Z"/>',
    gym: '<rect x="-34" y="-8" width="68" height="16" rx="5"/><rect x="-40" y="-22" width="14" height="44" rx="5"/><rect x="26" y="-22" width="14" height="44" rx="5"/>',
  })[k];
  return items.map(([label, t0, col, ic], i) => { const p = pop(t, t0, 0.4); if (p <= 0) return ''; const x = 140 + i * 160;
    return `<g transform="translate(${x},885) scale(${p})"><circle cx="4" cy="8" r="56" fill="#000" opacity="0.3"/><circle r="56" fill="${col}" stroke="${OUT}" stroke-width="7"/><circle cx="-16" cy="-22" r="14" fill="#fff" opacity="0.3"/><g fill="#fff" stroke="${OUT}" stroke-width="4" stroke-linejoin="round" transform="scale(0.85)">${icon(ic)}</g>
      <text x="0" y="102" font-family="Anton" font-size="34" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="9" paint-order="stroke">${label}</text></g>`; }).join('');
}
function sparkles(t) {
  if (t < T.sparkle || t > T.sparkle + 1.5) return '';
  const o = clamp((T.sparkle + 1.5 - t) * 2);
  return [[250, 760, 34], [520, 740, 26], [190, 960, 22], [560, 930, 30], [400, 640, 24]].map(([x, y, r], i) => { const p = pop(t, T.sparkle + i * 0.08, 0.4) * (0.8 + 0.2 * Math.sin(t * 10 + i));
    return `<g transform="translate(${x},${y}) scale(${p}) rotate(${t * 60})" opacity="${o}"><path d="M0,${-r} Q4,-4 ${r},0 Q4,4 0,${r} Q-4,4 ${-r},0 Q-4,-4 0,${-r}Z" fill="#ffe14d" stroke="${OUT}" stroke-width="4"/></g>`; }).join('');
}

function frame(t) {
  const [cx, S, fy] = camAt(t);
  const bob = Math.sin(t * 5) * 6 * S, sq = 1 + Math.sin(t * 5) * 0.012;
  const py = fy - 700 * S + bob;
  const pill = `<g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 1/30</text></g>`;
  const shadow = `<ellipse cx="${cx}" cy="${fy + 8}" rx="${380 * S}" ry="${34 * S}" fill="#000" opacity="0.4"/>`;
  const ch = `<g transform="translate(${cx},${py}) scale(${S * (2 - sq)},${S * sq})">${charBody}</g>`;
  const inMir = t >= T.mirror - 0.3 && t < T.mirOut + 0.4;
  const refl = inMir ? `<clipPath id="mc"><rect x="790" y="930" width="200" height="512" rx="94"/></clipPath><g clip-path="url(#mc)" opacity="0.9"><rect x="790" y="930" width="200" height="512" fill="#9bd7f0" opacity="0.5"/><g transform="translate(890,${1415 - 700 * 0.3}) scale(${-0.3},0.3)">${charBody}</g><path d="M790,930 h120 l-90,512 h-30Z" fill="#fff" opacity="0.12"/></g>` : '';
  const nameCard = t >= T.name && t < T.nameOut ? `<g transform="translate(540,545) scale(${pop(t, T.name, 0.45) * (t > T.nameOut - 0.3 ? clamp((T.nameOut - t) / 0.3) : 1)})"><text x="0" y="0" font-family="Anton" font-size="150" text-anchor="middle" fill="#ff4d8d" stroke="${OUT}" stroke-width="20" paint-order="stroke" letter-spacing="3">LAZY</text><text x="0" y="86" font-family="Anton" font-size="84" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="14">DAWNS</text></g>` : '';
  const notif = t >= T.notif && t < T.open ? `<g transform="translate(540,720) scale(${pop(t, T.notif)})"><rect x="-296" y="-56" width="620" height="150" rx="44" fill="#000" opacity="0.3"/><rect x="-310" y="-70" width="620" height="150" rx="44" fill="#fff" stroke="${OUT}" stroke-width="6"/>${avatar('avn', -234, 5, 46)}<text x="-170" y="-12" font-family="Inter" font-weight="800" font-size="34" fill="#1c1c28">Mari</text><text x="-170" y="30" font-family="Inter" font-weight="500" font-size="30" fill="#4b4b5c">Amiga, tienes que ver esto…</text><circle cx="270" cy="-30" r="20" fill="#ff4d8d"/><text x="270" y="-21" font-family="Inter" font-weight="800" font-size="26" text-anchor="middle" fill="#fff">1</text></g>` : '';
  const calls = callout(t, T.gr, 'GRANOS', 380, 600) + callout(t, T.ce, 'CEJAS', 380, 600, '#ff9ad0') + callout(t, T.di, 'SONRISA', 380, 600, '#22d3ee');
  const big30 = t >= T.d30 && t < T.vote ? `<g transform="translate(540,640) scale(${pop(t, T.d30, 0.5)})"><text x="0" y="0" font-family="Anton" font-size="230" text-anchor="middle" fill="#ff4d8d" stroke="${OUT}" stroke-width="22" paint-order="stroke">30 DÍAS</text><text x="0" y="130" font-family="Anton" font-size="84" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${pop(t, T.decide)}">TÚ DECIDES CADA PASO</text></g>` : '';
  const flash = t >= T.vote && t < T.vote + 0.12 ? `<rect width="${W}" height="${H}" fill="#fff" opacity="${0.6 * (1 - (t - T.vote) / 0.12)}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}
    <image href="${roomPng}" width="${W}" height="${H}"/>${pill}${shadow}${ch}${refl}${nameCard}${phone(t)}${notif}${calls}${sparkles(t)}${big30}${badges(t)}
    ${t < T.vote ? subtitle(t) : vote(t)}${flash}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}

if (process.argv[2] === 'preview') {
  for (const s of process.argv.slice(3)) writeFileSync(path.join(here, `build/p_${s}.png`), frame(parseFloat(s)));
  console.log('preview ok', 'DUR', DUR.toFixed(2), 'frames', Math.round(DUR * FPS));
} else {
  // uso: node render_dia01.mjs <inicio> <fin> <salida.mp4>   (rango de fotogramas; fin=-1 hasta el final)
  const a0 = parseInt(process.argv[2] ?? '0'), total = Math.round(DUR * FPS), a1 = process.argv[3] && parseInt(process.argv[3]) >= 0 ? Math.min(parseInt(process.argv[3]), total) : total;
  const out = process.argv[4] || path.join(here, 'build/video_mudo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
