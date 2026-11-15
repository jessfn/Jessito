// Lazy Dawns - DIA 9: "Lo que queda despues" (gimnasio, -28 kg, villano M). Voces: narrador, Mei (recepcion), coach Tadeo, M. Los personajes NO mueven la boca para hablar.
// Uso: node render_dia09.mjs preview 5 12 ...   |   node render_dia09.mjs <inicio> <fin> <salida.mp4>   |   node render_dia09.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, hand } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawTadeo, drawMei, handsToTargets, salonTool, armIK } from './chars.mjs';
import { makeDirector } from './director10.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia09');
const W = 1080, H = 1920, FPS = 30;
const FDIR = path.join(here, '../assets/fonts/');
const ropt = { font: { fontFiles: ['Anton-Regular.ttf', 'Bungee-Regular.ttf', 'Righteous-Regular.ttf'].map((f) => FDIR + f), loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const pop = (t, t0, d = 0.35) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const win = (t, a, b, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * clamp((b - t) / fo);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const OUT = '#12090a';

const imgCache = new Map();
const obj3 = (name, u, cx, cy, w, h = w) => { const i = Math.min(OBJN[name] - 1, Math.max(0, Math.round(clamp(u) * (OBJN[name] - 1)))); const key = name + i; if (!imgCache.has(key)) imgCache.set(key, 'data:image/png;base64,' + readFileSync(path.join(here, 'plates3d/obj', name, 'f' + String(i).padStart(3, '0') + '.png')).toString('base64')); if (name === 'title' || name === 'slate9') return `<image href="${imgCache.get(key)}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/>`; return `<defs><radialGradient id="mk${name}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff"/><stop offset="0.62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="mm${name}" maskUnits="userSpaceOnUse" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="url(#mk${name})"/></mask></defs><image href="${imgCache.get(key)}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" mask="url(#mm${name})"/>`; };
const nm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9]/g, '');
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------- guion con tiempos ----------------
const DATA = JSON.parse(readFileSync(path.join(B, 'lines.json'), 'utf8'));
const L = Object.fromEntries(DATA.lines.map((l) => [l.id, l]));
const DUR = DATA.total;
const w = (id, word, n = 0) => { const r = L[id].words.filter((x) => nm(x[0]) === nm(word))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + word); return r[1]; };
const T = {
  slateEnd: 1.4, noteA: L.l2.start - 0.1, miA: L.l3.start, taA: L.l4.start, scaleA: w('l5', 'bascula') - 0.5, cableA: L.l6.start, resetA: L.l7.start, trainA: L.l8.start, cheerA: L.l9.start, homeA: L.l10.start - 0.2, tapeA: w('l10', 'kilos') - 0.8,
  mirrorA: L.l11.start, mvoice: L.l12.start, lairA: L.l13.start - 0.1,
  vote: w('l14', 'Que') - 0.1, optA: w('l14', 'piel'), optB: w('l14', 'vestido'), cta1: w('l14', 'Comenta'), cta2: w('l14', 'sigueme'),
};
T.noteB = T.noteA + 2.8; T.scaleB = T.scaleA + 3.4; T.resetB = T.resetA + 3.4; T.trainB = T.trainA + 3.2; T.tapeB = T.tapeA + 3.0; T.mirrorB = L.l12.end + 0.2;
T.walks = [];
T.scenes = [T.slateEnd, T.noteA, T.miA, T.taA, T.scaleA, T.cableA, T.resetA, T.trainA, T.cheerA, T.homeA, T.mirrorA, T.mvoice, T.lairA, T.vote];
const OBJD = { slate9: 3.6, note9: T.noteB - T.noteA, scalea: T.scaleB - T.scaleA, scaleb: T.resetB - T.resetA, dumbbell: T.trainB - T.trainA, tape: T.tapeB - T.tapeA };
const OBJN = Object.fromEntries(Object.entries(OBJD).map(([k, v]) => [k, Math.ceil(v * 30)]));
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
writeFileSync(path.join(B, 'objdur.json'), JSON.stringify(OBJD));
const pose = makeDirector({ L, T, DUR });
// ---------------- fondos 3D y defs ----------------
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates3d', n + '.png')));
const platePng = { gym: PL('gym_dof'), home: PL('home_dof'), lair: PL('lair_dof') };
const VIN = `<linearGradient id="vin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f766e"/><stop offset="0.35" stop-color="#2dd4bf"/><stop offset="0.7" stop-color="#14b8a6"/><stop offset="1" stop-color="#134e4a"/></linearGradient><linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ca3af"/><stop offset="0.4" stop-color="#f3f4f6"/><stop offset="1" stop-color="#6b7280"/></linearGradient>`;
function chairBack() { return `<defs>${VIN}</defs><ellipse cx="540" cy="1650" rx="330" ry="34" fill="#000" opacity="0.3"/><rect x="496" y="1490" width="88" height="170" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/><ellipse cx="540" cy="1660" rx="210" ry="30" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>
  <rect x="300" y="820" width="480" height="470" rx="120" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M336,870 Q336,846 400,846" stroke="#fff" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="236" y="1080" width="96" height="46" rx="22" fill="#115e59" stroke="${OUT}" stroke-width="7"/><rect x="748" y="1080" width="96" height="46" rx="22" fill="#115e59" stroke="${OUT}" stroke-width="7"/>`; }
function chairFront() { return `<path d="M276,1246 Q540,1226 804,1246 L822,1470 Q540,1498 258,1470Z" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M316,1280 Q540,1264 764,1280" stroke="#fff" stroke-opacity="0.3" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="300" y="1470" width="480" height="36" rx="14" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>`; }
// ---------------- personajes, lugares y camara ----------------
const sceneAt = (t) => (t >= T.lairA ? 'lair' : t >= T.homeA ? 'home' : 'gym');
const lazyPlace = (t) => ({ x: 540, fy: 1655, S: 0.7, vis: sceneAt(t) !== 'lair', seated: false });
const headOf = (t) => { const p = lazyPlace(t); const py = p.fy - 790 * p.S; return { x: p.x, y: py - 215 * p.S, S: p.S }; };
const facePt = (t, lx, ly) => { const h = headOf(t); return { x: h.x + lx * h.S, y: h.y + ly * h.S }; };
const TAD = { x: 905, y: 880, s: 0.78 }, MEI = { x: 200, y: 905, s: 0.72 };
const tadCh = (t) => ({ ...TAD, x: TAD.x + 420 * (1 - ease((t - T.taA + 0.2) / 1.2)) });
const meiCh = (t) => ({ ...MEI, x: MEI.x - 420 * (1 - ease((t - T.miA + 0.2) / 1.2)) });
function tadState(t) { if (t < T.taA - 0.3 || t >= T.homeA) return null; const ch = tadCh(t); let mood = 'happy', hands = 'none', tool = 'none';
  if (t >= T.scaleA) mood = 'focus'; if (t >= T.cableA) { mood = 'worry'; } if (t >= T.resetA) mood = 'proud'; if (t >= T.trainA) { mood = 'grin'; hands = 'hips'; } if (t >= T.cheerA) { mood = 'grin'; hands = 'wave'; }
  return { mood, hands, tool, ch }; }
function meiState(t) { if (t < T.miA - 0.3 || t >= T.homeA) return null; const ch = meiCh(t); let mood = 'happy', hands = 'wave';
  if (t >= L.l4.start) { mood = 'calm'; hands = 'none'; } if (t >= T.scaleA + 2) mood = 'shock'; if (t >= T.resetA) mood = 'happy';
  return { mood, hands, ch }; }

const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
// camara cinematografica: empujes, grua, empuje extremo al lunar, movimientos de paralaje
const CAM = [[0, 1.0, 540, 960], [T.slateEnd, 1.0, 540, 960], [T.noteA, 1.1, 560, 900], [T.noteB, 1.0, 540, 960], [T.miA + 1, 1.1, 480, 940], [T.taA, 1.1, 640, 940], [T.scaleA - 0.3, 1.25, 560, 1000], [T.scaleA + 2.4, 1.4, 540, 960], [T.cableA, 1.1, 640, 960], [T.resetA, 1.2, 560, 1000], [T.trainA, 1.15, 540, 980], [T.trainA + 2.5, 1.3, 540, 940], [T.cheerA, 1.1, 600, 960],
  [T.homeA - 0.1, 1.0, 540, 960], [T.homeA + 1.2, 1.25, 540, 900], [T.mirrorA, 1.1, 540, 1090], [T.mirrorA + 3.5, 1.25, 540, 1060], [T.mvoice - 0.2, 1.1, 540, 900], [T.lairA, 1.0, 540, 960], [T.vote - 0.2, 1.1, 540, 960], [9999, 1.1, 540, 960]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.scaleA + 2.2, T.scaleA + 2.7, 0.02, 0.3) * 8 + win(t, T.cableA, T.cableA + 0.3, 0.02, 0.3) * 4 + win(t, T.mvoice, T.mvoice + 0.4, 0.02, 0.3) * 6;
  const sway = Math.sin(t * 0.55) * 8;
  return { z: lerp(a[1], b[1], u) * (1 + 0.012 * Math.sin(t * 0.7)), x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6 + sway, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}

// ---------------- efectos epicos de la revelacion ----------------
const headPx = (t) => { const h = headOf(t); return { x: h.x, y: h.y - 40 * h.S, S: h.S }; };
function godRays(t) { return ''; }
function flashScreen(t) { return ''; }
function flashFx(t) { return ''; }
function glitterBurst(t) { return ''; }
function confetti(t) { const a = T.calmA - 0.3, b = T.calmA + 5; if (t < a || t > b) return ''; const d = t - a; const cols = ['#fbbf24', '#f472b6', '#fff', '#a78bfa', '#34d399'];
  return [...Array(70)].map((_, i) => { const x0 = rnd(i) * W, age = d - rnd(i + 7) * 1.5; if (age < 0) return ''; const y = -60 + age * (260 + rnd(i + 2) * 260), x = x0 + Math.sin(age * 3 + i) * 40; if (y > H + 40) return ''; return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${10 + rnd(i + 4) * 10}" height="${18 + rnd(i + 6) * 10}" fill="${cols[i % 5]}" stroke="${OUT}" stroke-width="2" transform="rotate(${(age * 240 + i * 33) % 360} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }).join(''); }
function flyTurban(t) { return ''; }
function titleFx(t) { return ''; }
function letterbox(t) { return ''; }
function spotDark(t) { return ''; }
function doorsFx(t) { const d = t - T.hallA; if (d < -0.1 || d > 1.3) return ''; const o = ease(d / 1.1); return `<g opacity="${1 - clamp((d - 0.9) / 0.4)}"><rect x="0" y="0" width="${540 * (1 - o)}" height="${H}" fill="#3a1218" stroke="${OUT}" stroke-width="10"/><rect x="${540 + 540 * o}" y="0" width="${540 * (1 - o)}" height="${H}" fill="#3a1218" stroke="${OUT}" stroke-width="10"/><rect x="${540 * (1 - o) - 22}" y="0" width="22" height="${H}" fill="#d4a24c"/><rect x="${540 + 540 * o}" y="0" width="22" height="${H}" fill="#d4a24c"/><rect width="${W}" height="${H}" fill="#fff6d0" opacity="${0.55 * (1 - o)}"/></g>`; }


// ---------------- inserts cinematograficos (objetos disenados a detalle) ----------------
let CURPLATE = null;
function wrapIns(t, a, b, inner, tint = '#1a0e24') { const k = win(t, a, b, 0.3, 0.3); if (k <= 0) return ''; const u = clamp((t - a) / (b - a)), s = 1 + 0.12 * u, id = Math.round(a * 10); const e = smooth(k); const entering = u < 0.5;
  const xe = lerp(-120, W + 720, e);
  const pts = entering ? `-400,0 ${xe},0 ${xe - 420},${H} -400,${H}` : `${W + 400},0 ${W - xe},0 ${W - xe - 420},${H} ${W + 400},${H}`;
  const edge = entering ? `M${xe},0 L${xe - 420},${H}` : `M${W - xe},0 L${W - xe - 420},${H}`;
  return `<clipPath id="ic${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#ic${id})"><image href="${CURPLATE}" x="-60" y="-60" width="${W + 120}" height="${H + 120}" preserveAspectRatio="xMidYMid slice"/><rect width="${W}" height="${H}" fill="#06040c" opacity="0.5"/><radialGradient id="ig${id}" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient><rect width="${W}" height="${H}" fill="url(#ig${id})"/><g transform="translate(540,900) scale(${0.9 + 0.1 * e}) translate(-540,-900)"><g transform="translate(0,80)"><g transform="translate(540,880) scale(${s}) translate(-540,-880)">${inner(u)}</g></g></g></g>${k < 1 ? `<path d="${edge}" stroke="#fff" stroke-width="${26 * (1 - k)}" opacity="0.85"/><path d="${edge}" stroke="#7dd3fc" stroke-width="${60 * (1 - k)}" opacity="0.25"/>` : ''}`; }
const insLabel = (txt, col = '#ffe14d', y = 1320, fs = 78) => `<text x="540" y="${y - 118}" font-family="Anton" font-size="${fs}" text-anchor="middle" fill="${col}" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="3">${txt}</text>`;
const sparkle = (x, y, s, o = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><path d="M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z" fill="${c}"/></g>`;
const SPK = (u, n, x0, y0, wv, hv, op = 1) => [...Array(n)].map((_, i) => sparkle(x0 + (i * 83) % wv, y0 + (i * 57) % hv, 0.5 + 0.5 * Math.sin(u * 14 + i), op * (0.5 + 0.5 * Math.sin(u * 9 + i * 2)))).join('');
// ---------------- inserts cinematograficos 3D (objetos modelados en Three.js) ----------------
function ins3(t, a, b, name, label, col, cy = 700, size = 1160) { return wrapIns(t, a, b, (u) => `${obj3(name, u, 540, cy, size)}${SPK(u, 9, 200, 260, 680, 520, 0.7)}${insLabel(label, col, 1330)}`); }
const insNote = (t) => ins3(t, T.noteA, T.noteB, 'note9', 'UNA NOTA DE M', '#fca5a5', 700, 1180);
const insScaleA = (t) => ins3(t, T.scaleA + 0.9, T.scaleB, 'scalea', '¡LA BÁSCULA!', '#ff9a9a', 720, 1180);
const insScaleB = (t) => ins3(t, T.resetA, T.resetB, 'scaleb', 'PESO VERDADERO', '#86efac', 720, 1180);
const insDumb = (t) => ins3(t, T.trainA + 0.2, T.trainB, 'dumbbell', 'ENTRENAMIENTO', '#fde68a', 700, 1180);
const insTape = (t) => ins3(t, T.tapeA, T.tapeB, 'tape', '−28 KILOS', '#fef08a', 720, 1180);

const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const SPEAK = { N: { col: '#ffe14d', name: null }, T: { col: '#93c5fd', name: 'DANTE' }, E: { col: '#fdba74', name: 'MEMO' } };
const SUB_Y = 1580;
function captions(t) {
  const cur = DATA.lines.find((l) => t >= l.start - 0.15 && t <= l.end + 0.3); if (!cur) return '';
  const sp = SPEAK[cur.who]; const groups = []; let g = [];
  cur.words.forEach(([ww, s, e]) => { g.push({ w: ww, s, e }); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(ww)) { groups.push(g); g = []; } }); if (g.length) groups.push(g);
  const grp = groups.find((gr) => t >= gr[0].s - 0.05 && t <= gr[gr.length - 1].e + 0.25) || groups[groups.length - 1];
  const txt = grp.map((o) => esc(o.w.replace(/\.\.\./g, '').toUpperCase())).join(' ');
  let fs = 84, wdt = inkWidth(txt, fs); if (wdt > SAFE_W) { fs = Math.max(44, Math.floor(fs * SAFE_W / wdt)); wdt = inkWidth(txt, fs); }
  const spans = grp.map((o) => `<tspan fill="${t >= o.s && t < o.e + 0.05 ? sp.col : '#fff'}">${esc(o.w.replace(/\.\.\./g, '').toUpperCase())} </tspan>`).join('');
  const tag = sp.name ? `<g transform="translate(540,${SUB_Y - fs * 0.98 - 58})"><rect x="-${sp.name.length * 19 + 34}" y="-36" width="${sp.name.length * 38 + 68}" height="72" rx="36" fill="${sp.col}" stroke="${OUT}" stroke-width="7"/><text x="0" y="15" font-family="Anton" font-size="48" text-anchor="middle" fill="${OUT}" letter-spacing="2">${sp.name}</text></g>` : '';
  return `${tag}<text x="540" y="${SUB_Y}" font-family="Anton" font-size="${fs}" text-anchor="middle" stroke="${OUT}" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${spans}</text>`;
}
function talkIcon(t, who, x, y) { const l = DATA.lines.find((q) => q.who === who && t >= q.start && t <= q.end); if (!l) return '';
  const p = 0.5 + 0.5 * Math.sin(t * 14), col = SPEAK[who].col;
  return `<g transform="translate(${x},${y})"><circle r="42" fill="#fff" stroke="${OUT}" stroke-width="6"/>${[0, 1, 2].map((i) => `<path d="M${-15 + i * 15},${-13 - (i === 1 ? 4 : 0) * p} v${26 + (i === 1 ? 8 : 0) * p}" stroke="${col}" stroke-width="8" stroke-linecap="round" transform="translate(0,${-(i === 1 ? 4 : 0) * p / 2})"/>`).join('')}</g>`; }
const ICON = {
  PIEL: `<circle r="24" fill="#d9a073" stroke="${OUT}" stroke-width="5"/><path d="M-12,-4 q6,-8 12,0 M2,-4 q6,-8 12,0 M-10,10 q10,8 20,0" stroke="${OUT}" stroke-width="4" fill="none" stroke-linecap="round"/>${sparkle(22, -22, 0.9, 1, '#fff')}`,
  DIENTES: `<path d="M-26,-6 Q0,28 26,-6 Q0,6 -26,-6Z" fill="#fff" stroke="${OUT}" stroke-width="5"/><path d="M-26,-6 Q0,-18 26,-6" stroke="#be123c" stroke-width="9" fill="none" stroke-linecap="round"/>${[-14, -4, 6, 16].map((x) => `<path d="M${x},-2 v10" stroke="${OUT}" stroke-width="2"/>`).join('')}`,
  PELO: `<path d="M-18,22 Q-30,-6 -10,-14 Q10,-24 14,-4 Q20,14 2,12 Q-8,10 -4,0" stroke="${OUT}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M-18,22 Q-30,-6 -10,-14 Q10,-24 14,-4 Q20,14 2,12 Q-8,10 -4,0" stroke="#4a2f22" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  CEJAS: `<path d="M-28,6 Q-14,-14 0,4 M2,4 Q16,-14 30,6" stroke="${OUT}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-26,6 Q-14,-10 -2,4 M4,4 Q16,-10 28,6" stroke="#2a1d18" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  ROPA: `<path d="M-18,-24 L-30,-6 L-18,0 L-22,26 L22,26 L18,0 L30,-6 L18,-24 Q0,-12 -18,-24Z" fill="#10b981" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M-20,8 h40" stroke="#fbbf24" stroke-width="5"/>`,
  MAQUILLAJE: `<rect x="-12" y="-4" width="24" height="30" rx="4" fill="#111827" stroke="${OUT}" stroke-width="4"/><rect x="-9" y="-28" width="18" height="28" rx="3" fill="#b0206a" stroke="${OUT}" stroke-width="4"/><path d="M-9,-28 L9,-28 L5,-36 L-5,-38Z" fill="#d63a8a" stroke="${OUT}" stroke-width="3"/>`,
  LUNAR: `<circle r="10" fill="#2a1208" stroke="${OUT}" stroke-width="3"/><path d="M-2,-8 q-6,-14 -2,-20 M3,-8 q4,-12 10,-16" stroke="${OUT}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  NARIZ: `<ellipse rx="22" ry="18" fill="#7d4524" stroke="${OUT}" stroke-width="5"/><ellipse cx="-8" cy="6" rx="5" ry="4" fill="#2a130a"/><ellipse cx="8" cy="6" rx="5" ry="4" fill="#2a130a"/><ellipse cx="-6" cy="-8" rx="6" ry="3" fill="#fff" opacity="0.5"/>`,
};
function chip(name, x, y, w, col, pp, label) { return `<g transform="translate(${x},${y}) scale(${pp})"><rect x="${-w / 2 + 4}" y="-52" width="${w}" height="104" rx="30" fill="#000" opacity="0.35"/><rect x="${-w / 2}" y="-56" width="${w}" height="104" rx="30" fill="${col}" stroke="${OUT}" stroke-width="7"/><rect x="${-w / 2 + 12}" y="-48" width="${w - 24}" height="26" rx="13" fill="#fff" opacity="0.22"/><g transform="translate(${-w / 2 + 52},-4)"><circle r="38" fill="#fff" stroke="${OUT}" stroke-width="5"/><g transform="scale(0.9)">${ICON[name]}</g></g><text x="${-w / 2 + 108}" y="${label ? -2 : 14}" font-family="Anton" font-size="${name.length > 8 ? 36 : 44}" fill="${OUT}" letter-spacing="1">${name}</text>${label ? `<text x="${-w / 2 + 108}" y="30" font-family="Inter" font-weight="800" font-size="24" fill="${OUT}" opacity="0.8">${label}</text>` : ''}</g>`; }
const SPEAK8 = { N: { col: '#ffe14d', name: null }, C: { col: '#fca5a5', name: 'COACH TADEO' }, W: { col: '#5eead4', name: 'MEI' }, D: { col: '#ff5a6a', name: 'M' } };
Object.assign(SPEAK, SPEAK8);
function counterChip(t) { const marks = [[T.trainA + 0.2, 'SEMANA 1'], [T.trainA + 1.6, 'MES 1'], [T.trainA + 3.0, 'MES 3'], [T.homeA - 0.05, 'MES 5']]; let cur = null; for (const [a, tx] of marks) if (t >= a) cur = [a, tx]; if (!cur || t > T.homeA + 3.0 || t < T.trainA) return ''; const p = pop(t, cur[0], 0.3);
  return `<g transform="translate(540,392) scale(${p})"><rect x="-200" y="-34" width="400" height="68" rx="34" fill="#12090a" fill-opacity="0.85" stroke="#fde68a" stroke-width="5"/><text x="0" y="16" font-family="Bungee" font-size="42" text-anchor="middle" fill="#fde68a" letter-spacing="2">${cur[1]}</text></g>`; }
const stepBanners = [['1', 'CALENTAMIENTO', T.scaleA - 1.6, T.scaleA + 0.3, '#a5f3fc'], ['2', 'ENTRENAMIENTO', T.trainA + 0.1, T.trainB, '#fde68a'], ['3', 'CINCO MESES DESPUÉS', T.homeA + 0.2, T.homeA + 2.8, '#fbcfe8']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,300) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="34" y="20" font-family="Anton" font-size="${text.length > 11 ? 50 : 62}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
// ---------------- villano M: figura de espaldas / de frente, silla giratoria, guante, pantallas con feed de Lazy ----------------
function mFigure(t) { const a = T.lairA - 0.1, b = DUR + 5; const inA = win(t, a, b, 0.2, 0.2), inB = 0; const vis = Math.max(inA, inB); if (vis <= 0) return '';
  const turn = clamp((t - (T.lairA + 0.6)) / 1.4); const sq = turn < 0.5 ? 1 - turn * 2 : (turn - 0.5) * 2, front = turn >= 0.5; const sx = Math.max(0.05, sq);
  const press = win(t, T.lairA + 0.5, T.lairA + 1.4, 0.1, 0.2), smileK = clamp((t - (T.lairA + 2.4)) / 0.4);
  const back = `<g><path d="M-120,10 Q-150,-190 -50,-270 L50,-270 Q150,-190 120,10Z" fill="#0d0b14" stroke="${OUT}" stroke-width="6"/><ellipse cx="0" cy="-300" rx="64" ry="70" fill="#14141c"/><ellipse cx="0" cy="-366" rx="118" ry="22" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-62,-370 Q0,-474 62,-370Z" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-64,-376 H64" stroke="#d4a24c" stroke-width="10"/><path d="M-100,-40 Q0,-70 100,-40" stroke="#241c30" stroke-width="10" fill="none"/></g>`;
  const frontV = `<g><path d="M-120,10 Q-130,-250 -40,-300 L40,-300 Q130,-250 120,10Z" fill="#0b0b10" stroke="${OUT}" stroke-width="6"/><path d="M-26,-296 L0,-230 L26,-296Z" fill="#7f1d1d"/><ellipse cx="0" cy="-330" rx="66" ry="72" fill="#12121a"/><ellipse cx="0" cy="-392" rx="118" ry="22" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-62,-396 Q0,-496 62,-396Z" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-64,-402 H64" stroke="#d4a24c" stroke-width="10"/>
    <circle cx="-24" cy="-344" r="${5 + 3 * smileK}" fill="#ef4444"/><circle cx="24" cy="-344" r="${5 + 3 * smileK}" fill="#ef4444"/><path d="M-34,${-316} Q0,${-316 + 34 * smileK} 34,-316 Q0,${-316 + 12 * smileK + 4} -34,-316Z" fill="#fff" stroke="#fff" stroke-width="3"/>
    <g transform="translate(112,-96) rotate(${-24 + Math.sin(t * 3) * 4})"><path d="M-18,0 q-6,-54 8,-78 l24,0 q10,40 -4,78Z" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-12,-72 l-10,-30 M-2,-78 l0,-34 M8,-76 l10,-30 M18,-70 l16,-24" stroke="#0b0b10" stroke-width="12" stroke-linecap="round"/><text x="2" y="-18" font-family="Anton" font-size="34" text-anchor="middle" fill="#fde68a">M</text></g></g>`;
  const btn = press > 0 ? `<g transform="translate(150,-40)"><circle r="${22 + 8 * press}" fill="#ff2a4a" opacity="${0.8 * press}"/><circle r="12" fill="#ff7a8a"/></g>` : '';
  return `<g opacity="${vis}"><g transform="translate(540,1180) scale(0.78)"><ellipse cx="0" cy="30" rx="150" ry="26" fill="#000" opacity="0.5"/><g transform="scale(${sx},1)">${front ? frontV : back}</g>${btn}</g></g>`; }
function feeds(t) { const lairNow = sceneAt(t) === 'lair'; if (!lairNow) return ''; const flick = 0.82 + 0.18 * Math.sin(t * 23) * Math.sin(t * 7);
  const lz = (cx, cy, w, h, who) => `<g><clipPath id="fd${who}"><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/></clipPath><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="#1a0610" opacity="0.9"/><g clip-path="url(#fd${who})" opacity="${flick}"><g transform="translate(${cx + Math.sin(t * 31) * 1.5},${cy + h * 0.22}) scale(${h / 600})"><g transform="translate(0,215)">${drawLazy({ ...FEEDPOSE, makeup: { ...FEEDPOSE.makeup, mole: 0 } })}</g></g>${[...Array(Math.floor(h / 6))].map((_, i) => `<rect x="${cx - w / 2}" y="${cy - h / 2 + i * 6}" width="${w}" height="2" fill="#000" opacity="0.28"/>`).join('')}<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="#ff2a4a" opacity="0.14"/></g><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="none" stroke="#ff2a4a" stroke-width="3"/><circle cx="${cx - w / 2 + 14}" cy="${cy - h / 2 + 14}" r="5" fill="#ff2a4a" opacity="${0.5 + 0.5 * Math.sin(t * 6)}"/><text x="${cx + w / 2 - 8}" y="${cy - h / 2 + 20}" font-family="Anton" font-size="16" text-anchor="end" fill="#ff7a8a">REC</text></g>`;
  return `<g>${lz(790, 735, 214, 160, 'a')}${lz(300, 735, 214, 160, 'b')}</g>`; }
const FEEDPOSE = { yaw: 0, pitch: 0, roll: 0, bob: 0, sway: 0, breath: 0, shoulders: 0, flare: 0, squint: 0, tears: 0, tearT: 1, gaze: { x: 0, y: 0 }, lid: { l: 1, r: 1 }, blink: { l: 0, r: 0 }, brow: { l: { r: 0.1, i: 0 }, r: { r: 0.1, i: 0 } }, mouth: { open: 0.1, wide: 0.5, smile: 0.7, asym: 0, press: 0, teeth: { clean: 1, braces: 0, crooked: 0, shine: true }, lip: '#b0206a' }, armL: { rot1: 4, rot2: 6, w: 0, curl: 0.3 }, armR: { rot1: -4, rot2: -6, w: 0, curl: 0.3 }, skin: { acne: 0.02, glow: 1, mask: 0, dry: 0, foam: 0, patch: 0, red: 0 }, hair: { hd: 'long', len: 0.82, shine: 1, cp: 1, grow: 1 }, browStyle: { k: 1 }, outfit: { kind: 'gown', prog: 1, jewel: 1 }, makeup: { found: 1, shade: 'match', contour: 0.9, highlight: 0.8, blush: 0.7, shadow: 1, swL: 1, swR: 1, liner: 1, lsL: 1, lsR: 1, thick: 5, wing: 1, lash: 0.9, lift: 1, mole: 1, cols: { blush: '#e06a7a', shadow: ['#4b2a73', '#9d6be0', '#f0d8ff'], inner: '#f6ecff', liner: '#120818' } } };
function lairFx(t) { if (sceneAt(t) !== 'lair') return ''; const p = 0.6 + 0.4 * Math.sin(t * 3.1); return `<rect width="${W}" height="${H}" fill="#ff2a4a" opacity="${0.04 + 0.03 * p}"/>${[...Array(18)].map((_, i) => { const y = ((t * 90 + i * 140) % 2000) - 40; return `<rect x="0" y="${y}" width="${W}" height="3" fill="#ff5a6a" opacity="0.05"/>`; }).join('')}`; }
function mirrorOverlay(t) { const a = win(t, T.mirrorA + 0.3, T.mirrorB, 0.35, 0.4); if (a <= 0) return ''; const u = clamp((t - T.mirrorA) / (T.mirrorB - T.mirrorA)), ap = smooth((t - (T.mvoice - 0.2)) / 0.7), h = headOf(t);
  return `<g opacity="${a}"><path d="M0,0 H${W} V${H} H0Z M540,860 m-430,0 a430,610 0 1,0 860,0 a430,610 0 1,0 -860,0Z" fill="#05060a" fill-rule="evenodd" opacity="0.93"/><ellipse cx="540" cy="860" rx="430" ry="610" fill="none" stroke="#e8c27a" stroke-width="24"/><ellipse cx="540" cy="860" rx="406" ry="586" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/>
    <g transform="translate(${760 + (1 - ap) * 40},${700 + (1 - ap) * 20}) scale(${0.34 * ap})" opacity="${ap * 0.85}"><path d="M-120,300 Q-130,50 -40,0 L40,0 Q130,50 120,300Z" fill="#0b0b10" stroke="${OUT}" stroke-width="6"/><ellipse cx="0" cy="-30" rx="66" ry="72" fill="#12121a"/><ellipse cx="0" cy="-92" rx="118" ry="22" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-62,-96 Q0,-196 62,-96Z" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-64,-102 H64" stroke="#d4a24c" stroke-width="10"/><circle cx="-24" cy="-44" r="8" fill="#ef4444"/><circle cx="24" cy="-44" r="8" fill="#ef4444"/></g>
    <g opacity="${0.4 + 0.2 * Math.sin(t * 2)}"><path d="M300,300 L420,300 L240,1260 L120,1260Z" fill="#fff" opacity="0.1" transform="translate(${((t - T.mirrorA) * 120) % 600},0)"/></g></g>`; }
function slateIntro(t) { const END = 4.3; if (t > END) return ''; const ex = ease(clamp((t - 3.4) / 0.9)); const k = 1 - clamp((t - 3.8) / 0.7);
  const fade = Math.max(0, k * (1 - ex)); const clap = clamp((t - 0.55) / 0.08) * (1 - clamp((t - 0.7) / 0.3)); const shk = t > 0.6 && t < 1.0 ? Math.sin(t * 90) * 7 * (1 - (t - 0.6) / 0.4) : 0;
  const stripes = Array.from({ length: 16 }, (_, i) => `<path d="M${-200 + i * 150 + (t * 40) % 150},0 L${60 + i * 150 + (t * 40) % 150},0 L${-340 + i * 150 + (t * 40) % 150},${H} L${-600 + i * 150 + (t * 40) % 150},${H}Z" fill="#ff5a6a" opacity="${(i % 2 ? 0.05 : 0.025) * fade}"/>`).join('');
  const dust = Array.from({ length: 46 }, (_, i) => `<circle cx="${((i * 197) + t * (12 + i % 5 * 6)) % W}" cy="${((i * 311) - t * (14 + i % 4 * 8) + 4000) % H}" r="${1.5 + (i % 3)}" fill="#ff9aa6" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * fade}"/>`).join('');
  const sil = clamp((t - 2.2) / 1.0) * 0.8;
  const sl = obj3('slate9', clamp(t / 3.6), 0, 0, 1300).replace('<image ', `<image opacity="${fade}" `);
  return `<g><defs><radialGradient id="bgB" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="#5a0f1e"/><stop offset="0.55" stop-color="#1c0610"/><stop offset="1" stop-color="#060208"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bgB)" opacity="${fade}"/>${stripes}
    <g opacity="${fade * sil}" transform="translate(860,1330)"><path d="M-110,300 Q-130,40 -40,-10 L40,-10 Q130,40 110,300Z" fill="#000"/><ellipse cx="0" cy="-60" rx="62" ry="68" fill="#000"/><ellipse cx="0" cy="-118" rx="118" ry="20" fill="#000"/><path d="M-60,-122 Q0,-214 60,-122Z" fill="#000"/><circle cx="-22" cy="-70" r="6" fill="#ef4444"/><circle cx="22" cy="-70" r="6" fill="#ef4444"/></g>${dust}
    <ellipse cx="560" cy="1440" rx="440" ry="50" fill="#000" opacity="${0.3 * fade}"/><g transform="translate(${540 + 20 + shk},${900 + shk * 0.6}) scale(${1 + ex * 0.5})">${fade > 0.04 ? sl : ''}</g><rect width="${W}" height="${H}" fill="#fff" opacity="${clap * 0.55}"/></g>`; }
ICON['PIEL9'] = `<rect x="-22" y="-4" width="44" height="8" fill="#9ca3af" stroke="${OUT}" stroke-width="3"/><rect x="-28" y="-16" width="10" height="32" rx="3" fill="#374151" stroke="${OUT}" stroke-width="3"/><rect x="18" y="-16" width="10" height="32" rx="3" fill="#374151" stroke="${OUT}" stroke-width="3"/>`;
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  let s = `<defs><radialGradient id="ecg" cx="0.5" cy="0.42" r="0.8"><stop offset="0" stop-color="#2a1236"/><stop offset="1" stop-color="#08040c"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#ecg)" opacity="${k}"/>${[...Array(30)].map((_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 311) % H}" r="${1.5 + (i % 3)}" fill="#ff9ad0" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * k}"/>`).join('')}<text x="540" y="${690 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ HACEMOS</text><text x="540" y="${776 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">MAÑANA?</text>`;
  const a = pop(t, T.optA, 0.35), b = pop(t, T.optB, 0.35);
  if (a > 0) s += `<g transform="translate(540,960) scale(${a})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.6)">${ICON['PIEL9']}</g></g><text x="50" y="26" font-family="Anton" font-size="54" text-anchor="middle" fill="${OUT}">A · ARREGLAR LA PIEL</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1136) scale(${b})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.7)">${ICON['NARIZ']}</g></g><text x="50" y="26" font-family="Anton" font-size="62" text-anchor="middle" fill="#fff">B · ARREGLAR EL VESTIDO</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1400) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1510) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 10</text></g>`;
  return s;
}
// transiciones de camara: giro 360 con zoom (roll) y barrido, centradas en los cambios de escena
const TRANS = [[3.55, 'in', 0.8], [T.homeA, 'cut', 0.5], [T.lairA, 'cut', 0.5], [T.trainA, 'cut', 0.4], [T.cheerA, 'cut', 0.4]];
function transitionAt(t) { for (const [t0, kind, d] of TRANS) { const a = t0 - (kind === 'cut' ? d / 2 : 0), p = (t - a) / d; if (p < 0 || p > 1) continue;
    if (kind === 'in') { const e = ease(p); return { on: true, ghost: p < 0.85, sc: 1.4 - 0.4 * e, v: (1 - e), fl: 0.35 * Math.max(0, 1 - p * 3), gx: 0 }; }
    const e = smooth(p), mid = 1 - Math.abs(e - 0.5) * 2; const sc = e < 0.5 ? 1 + e * 2 * 0.45 : 1.45 - (e * 2 - 1) * 0.45; return { on: true, ghost: true, sc, v: mid, fl: 0.5 * mid * mid, gx: (e < 0.5 ? 1 : -1) * mid * 40 }; } return { on: false }; }
// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t), lp = lazyPlace(t), clinic = sc !== 'lair'; CURPLATE = platePng[sc];
  const py = lp.fy - 790 * lp.S;
  const lazySvg = drawLazy(P);
  const lazy = lp.vis ? `<g transform="translate(${lp.x},${py}) scale(${lp.S})">${lazySvg}</g>` : '';
  const shadowLz = lp.vis ? `<g transform="translate(${lp.x + 90},${lp.fy - 30}) skewX(-32) scale(${lp.S * 0.9},${0.2 * lp.S}) translate(0,-790)" opacity="0.3" filter="url(#shf)">${lazySvg}</g>` : '';
  const sm = (h, tt) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(h(Math.max(0, tt - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const ds = tadState(t), ms = meiState(t);
  const char = (st, fn, look, seed, who) => { if (!st) return ''; const { ch } = st; const hs = (tt) => { const q = who === 'D' ? tadState(tt) : meiState(tt); return q ? q.hands : 'none'; }; const nsm = sm(hs, t);
    const base = { ...st, elbowDown: true, armL: nsm.L, armR: nsm.R, blink: blinkOf(t, seed), look, t };
    const shd = `<ellipse cx="${ch.x + 30 * ch.s}" cy="${ch.y + 712 * ch.s}" rx="${150 * ch.s}" ry="${22 * ch.s}" fill="#000" opacity="0.34" filter="url(#b10)"/><ellipse cx="${ch.x}" cy="${ch.y + 708 * ch.s}" rx="${110 * ch.s}" ry="${14 * ch.s}" fill="#000" opacity="0.3"/>`;
    return `${shd}<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'body' })}</g><g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'tool' })}</g>`; };
  const derm = char(ds, drawTadeo, -0.7, 1.9, 'D'), memo = char(ms, drawMei, 0.7, 0.6, 'M');
  const icons = (ds ? talkIcon(t, 'C', ds.ch.x - 110 * ds.ch.s, ds.ch.y - 150 * ds.ch.s) : '') + (ms ? talkIcon(t, 'W', ms.ch.x + 110 * ms.ch.s, ms.ch.y - 150 * ms.ch.s) : '');
  const chairG = (g) => `<g transform="translate(540,1690) scale(${K}) translate(-540,-1660)">${g}</g>`;
  const par = (f) => `translate(540,960) scale(${1 + (cam.z - 1) * f}) translate(${-(540 + (cam.x - 540) * f)},${-(960 + (cam.y - 960) * f)})`;
  const bgLayer = `<g transform="${par(0.85)}"><image href="${platePng[sc]}" width="${W}" height="${H}" preserveAspectRatio="none"/>${feeds(t)}</g>`;
  const patchOn = t > T.serumA + 2.4 ? `<g transform="translate(${facePt(t, 108, 70).x},${facePt(t, 108, 70).y}) rotate(-12) scale(${lp.S * pop(t, T.serumA + 2.4, 0.3)})"><rect x="-26" y="-14" width="52" height="28" rx="10" fill="#f2c9a6" stroke="#b98a66" stroke-width="3"/><circle cx="-10" cy="-4" r="2" fill="#b98a66"/><circle cx="2" cy="4" r="2" fill="#b98a66"/><circle cx="12" cy="-4" r="2" fill="#b98a66"/></g>` : '';
  const worldInner = `${bgLayer}<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})">${clinic ? shadowLz : ''}${clinic ? derm : ''}${clinic ? memo : ''}${lazy}${clinic ? icons : mFigure(t)}</g>`;
  const tr = transitionAt(t); const wrapW = (scl, dx, op) => `<g opacity="${op}" transform="translate(${540 + dx},960) scale(${scl}) translate(-540,-960)">${worldInner}</g>`;
  const glitch = (g) => g > 2 ? [0, 1, 2, 3].map((i) => `<rect x="0" y="${300 + i * 380 + Math.sin(t * 40 + i) * 40}" width="${W}" height="${50 + i * 14}" fill="#fff" opacity="${0.1 * Math.min(1, g / 20)}" transform="translate(${Math.sin(t * 77 + i) * g * 0.8},0)"/>`).join('') : '';
  const world = tr.on ? (tr.ghost ? wrapW(tr.sc * 1.05, tr.gx * 1.4, 0.4) + wrapW(tr.sc * 1.025, tr.gx * 0.7, 0.55) : '') + wrapW(tr.sc, 0, 1) + glitch(Math.abs(tr.gx)) + `<rect width="${W}" height="${H}" fill="#fff" opacity="${tr.fl}"/>` : worldInner;
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05030a" stop-opacity="0.5"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const bnOn = stepBanners.some(([n, tx, a, b]) => t > a - 0.1 && t < b + 0.1); const chipTop = (t < 4.5 || bnOn || (t > T.mirrorA && t < T.mirrorB + 0.3)) ? '' : `<g transform="translate(540,300)"><defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd84a"/><stop offset="1" stop-color="#b8780f"/></linearGradient></defs><rect x="-226" y="-40" width="440" height="88" rx="44" fill="#000" opacity="0.3"/><rect x="-230" y="-46" width="440" height="88" rx="44" fill="#1a1024" stroke="#d4a24c" stroke-width="6"/><text x="0" y="18" font-family="Bungee" font-size="48" text-anchor="middle" letter-spacing="3" fill="url(#chg)" stroke="${OUT}" stroke-width="4" paint-order="stroke">DÍA 9/30</text></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}<defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter><filter id="shf" x="-40%" y="-40%" width="180%" height="180%"><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="9"/></filter></defs>${world}${lairFx(t)}${vignette}${slateIntro(t)}
    ${chipTop}${counterChip(t)}${insNote(t)}${insScaleA(t)}${insScaleB(t)}${insDumb(t)}${insTape(t)}${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}${mirrorOverlay(t)}${letterbox(t)}
    ${t < T.vote ? captions(t) : ''}${endCard(t)}${flashScreen(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}

if (process.argv[2] === 'audit') {
  let n = 0, shrunk = 0, worst = 0;
  for (const l of DATA.lines) { const groups = []; let g = []; l.words.forEach(([ww]) => { g.push(ww); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(ww)) { groups.push(g); g = []; } }); if (g.length) groups.push(g);
    for (const gr of groups) { const txt = esc(gr.map((x) => x.replace(/\.\.\./g, '').toUpperCase()).join(' ')); let fs = 84, wd = inkWidth(txt, fs); if (wd > SAFE_W) { fs = Math.max(44, Math.floor(fs * SAFE_W / wd)); wd = inkWidth(txt, fs); shrunk++; } n++; worst = Math.max(worst, wd); } }
  console.log('grupos', n, 'ajustados', shrunk, 'ancho maximo', worst, '(limite', SAFE_W + ')');
} else if (process.argv[2] === 'preview') {
  for (const s of process.argv.slice(3)) writeFileSync(path.join(B, `p_${s}.png`), frame(parseFloat(s)));
  console.log('preview ok', 'DUR', DUR.toFixed(2), 'frames', Math.round(DUR * FPS));
} else {
  const a0 = parseInt(process.argv[2] ?? '0'), total = Math.round(DUR * FPS), a1 = process.argv[3] && parseInt(process.argv[3]) >= 0 ? Math.min(parseInt(process.argv[3]), total) : total;
  const out = process.argv[4] || path.join(B, 'video_mudo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
