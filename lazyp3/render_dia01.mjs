// Render del Dia 1 de lazyp3: 1080x1920 @30fps -> frames PNG por stdout hacia ffmpeg.
// Uso: node render_dia01.mjs build/video_mudo.mp4
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, FPS = 30, DUR = 21.5;
const words = JSON.parse(readFileSync(path.join(here, 'build/words.json'), 'utf8'));
const font = path.join(here, '../assets/fonts/Anton-Regular.ttf');
const out = process.argv[2] || path.join(here, 'build/video_mudo.mp4');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const pop = (t, t0) => { const x = (t - t0) / 0.35; if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

// beats (segundos)
const B = { granos: 6.28, cejas: 8.32, sonrisa: 9.91, outfit: 11.77, vote: 13.77, optA: 16.3, optB: 17.52 };

function character(t, S) {
  const bob = Math.sin(t * 4) * 8;
  const blink = (t % 3.2) < 0.12 ? 0.1 : 1;
  const wob = Math.sin(t * 2.2) * 2;
  const tone = '#8a4e2b', toneD = '#6e3b1f', toneL = '#a8683f';
  const browS = 1 + 0.35 * pop(t, B.cejas) * (t < B.cejas + 1.5 ? 1 : 0.4);
  const pimples = [[-70,-20],[60,-40],[100,30],[-110,40],[20,50],[-30,-70],[85,-95],[-95,-85],[0,-5],[50,90]];
  const pimpleSvg = pimples.map(([x, y], i) => {
    const p = clamp(pop(t, B.granos + i * 0.12));
    const r = 14 * p;
    return `<g transform="translate(${x},${y})"><circle r="${r}" fill="#c0392b"/><circle r="${r * 0.4}" cy="${-r*0.2}" fill="#f7d6d0"/></g>`;
  }).join('');
  const teethShow = t >= B.sonrisa - 0.2;
  const teeth = `
    <path d="M-62,92 Q0,150 62,92 Q0,112 -62,92Z" fill="#3b0d0d"/>
    <rect x="-52" y="92" width="22" height="30" rx="5" fill="#d8c25a" transform="rotate(-8 -52 92)"/>
    <rect x="-28" y="96" width="20" height="24" rx="5" fill="#cdb44a"/>
    <rect x="-6" y="98" width="24" height="34" rx="5" fill="#d8c25a" transform="rotate(6 -6 98)"/>
    <rect x="20" y="96" width="18" height="22" rx="5" fill="#bda640"/>
    <rect x="40" y="92" width="20" height="28" rx="5" fill="#d8c25a" transform="rotate(12 40 92)"/>`;
  const mouth = teethShow ? teeth : `<path d="M-60,92 Q0,140 60,92 Q0,112 -60,92Z" fill="#3b0d0d"/>`;
  const eyeY = -10;
  const eye = (x) => `<g transform="translate(${x},${eyeY}) scale(1,${blink})">
      <ellipse rx="30" ry="34" fill="#fff"/><circle cx="${Math.sin(t*1.3)*6}" cy="4" r="14" fill="#2b1a10"/><circle cx="${Math.sin(t*1.3)*6+5}" cy="-2" r="5" fill="#fff"/></g>`;
  const hair = `<path d="M-175,-30 Q-215,-170 -120,-200 Q-110,-290 -20,-240 Q50,-310 110,-230 Q220,-230 180,-70 Q150,-150 80,-140 Q0,-190 -70,-140 Q-150,-150 -175,-30Z" fill="#14100e"/>
    <path d="M-170,-60 Q-250,-40 -215,40 Q-190,-10 -160,10Z" fill="#14100e"/><path d="M175,-60 Q250,-30 220,50 Q190,0 160,10Z" fill="#14100e"/>
    <path d="M-30,-235 Q-40,-310 0,-300 Q20,-270 -5,-235Z" fill="#14100e"/>`;
  const outfitStripe = [0,1,2,3,4,5].map(i => `<rect x="${-330 + i*110}" y="-50" width="55" height="420" fill="#2ecc71" opacity="0.9"/>`).join('');
  const outfitShow = clamp((t - B.outfit) * 3);
  const dots = [[-200,60],[-60,140],[120,60],[220,200],[-150,220],[40,260]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="${16*outfitShow}" fill="#f1c40f"/>`).join('');
  return `
  <g transform="translate(${540 + wob},${1010 + bob}) scale(${S})">
    <!-- piernas -->
    <rect x="-170" y="330" width="130" height="200" rx="50" fill="#5b2c83"/><rect x="40" y="330" width="130" height="200" rx="50" fill="#5b2c83"/>
    <ellipse cx="-110" cy="540" rx="90" ry="38" fill="#e67e22"/><ellipse cx="110" cy="540" rx="90" ry="38" fill="#16a085"/>
    <!-- cuerpo (obesa) -->
    <ellipse cx="0" cy="170" rx="350" ry="290" fill="#e67e22"/>
    <clipPath id="bodyclip"><ellipse cx="0" cy="170" rx="350" ry="290"/></clipPath>
    <g clip-path="url(#bodyclip)" opacity="${outfitShow}">${outfitStripe}${dots}</g>
    <ellipse cx="0" cy="250" rx="300" ry="120" fill="#000" opacity="0.08"/>
    <!-- brazos -->
    <ellipse cx="-360" cy="160" rx="85" ry="170" fill="#e67e22" transform="rotate(14 -360 160)"/><circle cx="-395" cy="320" r="62" fill="${tone}"/>
    <ellipse cx="360" cy="160" rx="85" ry="170" fill="#e67e22" transform="rotate(-14 360 160)"/><circle cx="395" cy="320" r="62" fill="${tone}"/>
    <!-- cuello -->
    <rect x="-70" y="-90" width="140" height="120" fill="${toneD}"/>
    <!-- cabeza -->
    <g transform="translate(0,-210)">
      <ellipse cx="0" cy="0" rx="205" ry="210" fill="${tone}"/>
      <ellipse cx="-70" cy="-60" rx="90" ry="70" fill="${toneL}" opacity="0.35"/>
      <ellipse cx="-190" cy="10" rx="30" ry="45" fill="${tone}"/><ellipse cx="190" cy="10" rx="30" ry="45" fill="${tone}"/>
      ${hair}
      ${eye(-75)}${eye(75)}
      <g transform="translate(0,-62) scale(${browS},1)"><path d="M-120,-4 Q-60,-50 -6,-6 Q0,-12 6,-6 Q60,-50 120,-4 Q60,-26 6,10 Q0,6 -6,10 Q-60,-26 -120,-4Z" fill="#14100e"/></g>
      <ellipse cx="0" cy="45" rx="26" ry="20" fill="${toneD}"/>
      <g transform="translate(0,40)">${mouth}</g>
      ${pimpleSvg}
    </g>
  </g>`;
}

function callout(t, t0, text, x, y) {
  const p = pop(t, t0); if (p <= 0 || t > t0 + 1.9) return '';
  const fade = clamp((t0 + 1.9 - t) * 4);
  return `<g transform="translate(${x},${y}) scale(${p})" opacity="${fade}">
    <rect x="-230" y="-52" width="460" height="104" rx="52" fill="#ffe14d" stroke="#14100e" stroke-width="8"/>
    <text x="0" y="22" font-family="Anton" font-size="68" text-anchor="middle" fill="#14100e">${text}</text></g>`;
}

function subtitle(t) {
  // grupos de hasta 3 palabras, palabra activa resaltada
  const groups = []; let g = [];
  words.forEach(([w, s, e], i) => { g.push({ w, s, e }); if (g.length === 3 || /[.?!…]$/.test(w) || /\.\.\.$/.test(w)) { groups.push(g); g = []; } });
  if (g.length) groups.push(g);
  const cur = groups.find((gr) => t >= gr[0].s - 0.05 && t <= gr[gr.length - 1].e + 0.25);
  if (!cur) return '';
  const spans = cur.map((o) => {
    const act = t >= o.s && t < o.e + 0.05;
    const txt = o.w.replace(/\.\.\./g, '').replace(/&/g, '&amp;').toUpperCase();
    return `<tspan fill="${act ? '#ffe14d' : '#ffffff'}">${txt} </tspan>`;
  }).join('');
  return `<text x="540" y="1500" font-family="Anton" font-size="92" text-anchor="middle" stroke="#14100e" stroke-width="14" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${spans}</text>`;
}

function voteCards(t) {
  const a = pop(t, B.optA), b = pop(t, B.optB);
  const slideT = ease((t - B.vote) / 0.6);
  let s = `<g opacity="${clamp((t - B.vote) * 4)}"><text x="540" y="${1215 - 40 * (1 - slideT)}" font-family="Anton" font-size="84" text-anchor="middle" fill="#fff" stroke="#14100e" stroke-width="12" paint-order="stroke">¿QUÉ ARREGLAMOS?</text></g>`;
  if (a > 0) s += `<g transform="translate(540,1340) scale(${a})"><rect x="-420" y="-70" width="840" height="140" rx="40" fill="#ff4d8d" stroke="#14100e" stroke-width="8"/><text x="0" y="28" font-family="Anton" font-size="80" text-anchor="middle" fill="#fff">A · PIEL Y GRANOS</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1490) scale(${b})"><rect x="-420" y="-70" width="840" height="140" rx="40" fill="#22d3ee" stroke="#14100e" stroke-width="8"/><text x="0" y="28" font-family="Anton" font-size="80" text-anchor="middle" fill="#14100e">B · DIENTES</text></g>`;
  return s;
}

function frame(t) {
  // camara: zoom suave a la cara en granos/cejas/sonrisa
  let S = 0.78, focusY = 0;
  if (t >= B.vote) { S = 0.78 - 0.18 * ease((t - B.vote) / 0.6); }
  else if (t >= B.granos - 0.3 && t < B.outfit - 0.3) { S = 0.78 + 0.1 * Math.sin(clamp((t - B.granos + 0.3) / 0.5) * Math.PI / 2); }
  const intro = ease(t / 0.5);
  const hue = (t * 12) % 360;
  const bg = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b1055"/><stop offset="1" stop-color="#7f1d6e"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>` +
    [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${(i * 230 + 80 + Math.sin(t + i) * 40) % W}" cy="${(i * 340 + t * 40) % H}" r="${60 + i * 14}" fill="#fff" opacity="0.05"/>`).join('');
  const pill = `<g transform="translate(540,310)"><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="#14100e" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="#14100e">DÍA 1/30</text></g>`;
  const name = `<text x="540" y="470" font-family="Anton" font-size="120" text-anchor="middle" fill="#fff" stroke="#14100e" stroke-width="14" paint-order="stroke" opacity="${t < B.vote ? 1 : clamp(1 - (t - B.vote) * 4)}" letter-spacing="4">LAZYP3</text>`;
  const shake = t >= B.granos && t < B.granos + 0.2 ? Math.sin(t * 200) * 6 : 0;
  const charY = t >= B.vote ? -110 * ease((t - B.vote) / 0.6) : 0;
  let ch = `<g transform="translate(${shake},${charY})" opacity="${intro}">${character(t, S)}</g>`;
  const calls = callout(t, B.granos, 'GRANOS', 540, 545) + callout(t, B.cejas, 'CEJAS', 540, 545) +
    callout(t, B.sonrisa, 'SONRISA', 540, 545) + callout(t, B.outfit, 'OUTFIT', 540, 545);
  const flash = t >= B.vote && t < B.vote + 0.12 ? `<rect width="${W}" height="${H}" fill="#fff" opacity="${0.6 * (1 - (t - B.vote) / 0.12)}"/>` : '';
  const cta = t >= B.optB + 0.8 ? `<text x="540" y="1680" font-family="Anton" font-size="64" text-anchor="middle" fill="#ffe14d" stroke="#14100e" stroke-width="10" paint-order="stroke" opacity="${0.6 + 0.4 * Math.sin(t * 8)}">VOTA EN LA ENCUESTA ↓</text>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg}${pill}${name}${ch}${calls}${t >= B.vote ? voteCards(t) : ''}${t < B.vote ? subtitle(t) : ''}${cta}${flash}</svg>`;
  return new Resvg(svg, { font: { fontFiles: [font], loadSystemFonts: true, defaultFontFamily: 'Anton' } }).render().asPng();
}

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(DUR * FPS);
for (let i = 0; i < total; i++) {
  const png = frame(i / FPS);
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (process.env.SAVE_FRAMES && [30, 200, 290, 350, 470, 560].includes(i)) (await import('node:fs')).writeFileSync(path.join(here, `build/f${i}.png`), png);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
console.log('listo', out);
