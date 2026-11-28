// Lazy Dawns - DIA 20: "Ella se vistio para el bosque... pero nadie estaba a salvo" (cabana con Mari, ropa comoda negra, bosque de noche, persecucion, lodo, policia, voto ropa o zapatillas). Todo 2D.
// Uso: node render_dia20.mjs preview 5 12 ...   |   node render_dia20.mjs <inicio> <fin> <salida.mp4>   |   node render_dia20.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, hand } from './lazy_lib.mjs';
import { drawLazy, LASHX, EYEX, BROWX, LIPX, NOSEDY, MOUTHX } from './rig.mjs';
import { handsToTargets } from './chars.mjs';
import { TOOLS } from './chars12.mjs';
import { drawWill } from './chars17.mjs'; import { drawSusan } from './chars18.mjs'; import './chars19.mjs'; import { drawOfficer, drawMariRun } from './chars20.mjs'; import { mariCabina } from './mari_cabina20.mjs'; import { drawMari2 } from './chars15.mjs'; import { renderM } from './rig2d/m_character.mjs'; import { poseClip } from './rig2d/m_clips.mjs';
import { LOOK, MK, JAW, FACEK, NECK, FIT } from './rig2d/character.mjs';
import { applyFinalFace, resetFace, applyDay16Face, applyDay18Face } from './face_final.mjs';
import { renderCharacter, defaultPose as defPose2, ik2, SK as SK2, ALLDEFS, NAILS } from './rig2d/character.mjs';
import { MDEFS } from './rig2d/m_character.mjs';
import { makeDirector } from './director_d20.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia20');

const W = 1080, H = 1920, FPS = 60;
const FDIR = path.join(here, '../assets/fonts/');
const ropt = { font: { fontFiles: ['Anton-Regular.ttf', 'Bungee-Regular.ttf', 'Righteous-Regular.ttf'].map((f) => FDIR + f), loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const pop = (t, t0, d = 0.35) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const win = (t, a, b, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * clamp((b - t) / fo);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const OUT = '#12090a'; const f = (n) => Math.round(n * 10) / 10;

const imgCache = new Map();
const obj3 = (name, u, cx, cy, w, h = w) => { const i = Math.min(OBJN[name] - 1, Math.max(0, Math.round(clamp(u) * (OBJN[name] - 1)))); const key = name + i; if (!imgCache.has(key)) imgCache.set(key, 'data:image/png;base64,' + readFileSync(path.join(here, 'plates3d/obj', OBJF[name], 'f' + String(i).padStart(3, '0') + '.png')).toString('base64')); if (name === 'title' || name === 'slate10') return `<image href="${imgCache.get(key)}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/>`; return `<defs><radialGradient id="mk${name}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff"/><stop offset="0.62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="mm${name}" maskUnits="userSpaceOnUse" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="url(#mk${name})"/></mask></defs><image href="${imgCache.get(key)}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" mask="url(#mm${name})"/>`; };
const nm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9]/g, '');
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };





// ---------------- guion con tiempos ----------------
const DATA = JSON.parse(readFileSync(path.join(B, 'lines.json'), 'utf8'));
const L = Object.fromEntries(DATA.lines.map((l) => [l.id, l]));
const DUR = DATA.total;
const w = (id, word, n = 0) => { const r = L[id].words.filter((x) => nm(x[0]) === nm(word))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + word); return r[1]; };
const T = { SIGN: 1,
  slateA: L.i2.end + 0.2, hookA: L.l1.start, l2A: L.l2.start, vestA: w('l2', 'chaleco') - 0.45, legA: w('l2', 'leggings') - 0.45, teeA: w('l2', 'playera') - 0.45, dressA: L.l2.end - 0.45,
  forestA: L.l3.start - 0.55, l3A: L.l3.start, l4A: L.l4.start, l5A: L.l5.start, l6A: L.l6.start, recA: L.l7.start - 0.1, pubA: w('l7', 'publicar') - 0.45, l8A: L.l8.start, mariA: L.l8.start - 0.7, runA: L.l9.start - 0.15,
  l10A: L.l10.start, l11A: L.l11.start, pushA: w('l11', 'empujo') - 0.2, mudA: w('l11', 'lodo') - 0.05, l12A: L.l12.start, policeA: L.l13.start - 2.0, l13A: L.l13.start, l14A: L.l14.start,
  vote: w('l15', 'Ropa') - 0.1, optA: w('l15', 'Ropa'), optB: w('l15', 'zapatillas'), cta1: w('l15', 'Comenta'), cta2: w('l15', 'comparte'), cta3: w('l15', 'sigueme'),
};
T.slateEnd = T.slateA + 3.7; T.homeA = T.hookA; T.closeA = 9999; T.openA = 9999; T.walks = [[0, 0.01]]; T.mirrorA = 9999; T.ringA = T.l8A;
T.scenes = [T.slateEnd, T.hookA, T.vestA, T.legA, T.teeA, T.dressA, T.forestA, T.l4A, T.recA, T.pubA, T.mariA, T.runA, T.l10A, T.pushA, T.l12A, T.policeA, T.l13A, T.vote];
const OBJN = {};
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });
const FULL = JSON.parse(JSON.stringify(LOOK));

const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates2d', n + '.png')));
const platePng = { home: PL('home18') };
const FDEFS = `<defs><linearGradient id="fRed" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a00"/><stop offset="0.55" stop-color="#e01a10"/><stop offset="1" stop-color="#7a0a08" stop-opacity="0.8"/></linearGradient><linearGradient id="fOr" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd23a"/><stop offset="0.6" stop-color="#ff8a00"/><stop offset="1" stop-color="#ff3a10" stop-opacity="0.7"/></linearGradient><linearGradient id="fYe" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#fff2a0"/><stop offset="1" stop-color="#ffc83a" stop-opacity="0.6"/></linearGradient><radialGradient id="fSmoke" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2a2a32" stop-opacity="0.85"/><stop offset="1" stop-color="#2a2a32" stop-opacity="0"/></radialGradient><radialGradient id="fGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff9a30" stop-opacity="0.8"/><stop offset="1" stop-color="#ff5a10" stop-opacity="0"/></radialGradient><filter id="fb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter><filter id="fb2" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
const flame = (x, y, wd, h, t, i, grad) => { const sw = Math.sin(t * 11 + i * 1.9) * wd * 0.25, hh = h * (0.7 + 0.3 * Math.sin(t * 9 + i * 2.3)); return `<path d="M${f(x - wd / 2)},${f(y)} C${f(x - wd * 0.6)},${f(y - hh * 0.4)} ${f(x - wd * 0.2 + sw)},${f(y - hh * 0.6)} ${f(x + sw)},${f(y - hh)} C${f(x + wd * 0.2 + sw * 0.5)},${f(y - hh * 0.55)} ${f(x + wd * 0.6)},${f(y - hh * 0.35)} ${f(x + wd / 2)},${f(y)}Z" fill="url(#${grad})"/>`; };
function fireLayer(t, x0, x1, y, hMax, k, seed = 0) { if (k <= 0.08) return ''; const n = Math.max(3, Math.round((x1 - x0) / 46)); let g = '';
  for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / n + Math.sin(t * 3 + i) * 6, h = hMax * k * (0.7 + 0.5 * rnd(i + seed)), wd = (x1 - x0) / n * 1.7; g += flame(x, y + 10, wd, h, t, i + seed, 'fRed'); }
  for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / n + Math.sin(t * 4 + i) * 5, h = hMax * k * 0.7 * (0.7 + 0.5 * rnd(i + seed + 40)); g += flame(x, y + 10, (x1 - x0) / n * 1.1, h, t, i + seed + 9, 'fOr'); }
  for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / n, h = hMax * k * 0.4 * (0.7 + 0.5 * rnd(i + seed + 80)); g += flame(x, y + 10, (x1 - x0) / n * 0.6, h, t, i + seed + 17, 'fYe'); }
  const top = y - hMax * k * 1.5 - 40, bot = y + 50, mx0 = x0 - 80, mw = x1 - x0 + 160, pB = Math.min(0.97, Math.max(0.3, (y - hMax * k * 0.1 - top) / (bot - top))); const id = 'fm' + seed + '_' + Math.round(x0);
  const glow = `<ellipse cx="${f((x0 + x1) / 2)}" cy="${f(y - hMax * k * 0.35)}" rx="${f((x1 - x0) * 0.75)}" ry="${f(hMax * k * 0.8)}" fill="url(#fGlow)" opacity="${(0.65 * k).toFixed(2)}"/><ellipse cx="${f((x0 + x1) / 2)}" cy="${f(y + 6)}" rx="${f((x1 - x0) * 0.6)}" ry="${f(26 + 30 * k)}" fill="#ff7a1a" opacity="${(0.4 * k).toFixed(2)}" filter="url(#fb)"/>`;
  let emb = ''; for (let i = 0; i < 26; i++) { const age = (t * 0.6 + rnd(i + seed)) % 1; emb += `<circle cx="${f(x0 + rnd(i + 5 + seed) * (x1 - x0) + Math.sin(t * 3 + i) * 20)}" cy="${f(y - age * (hMax * k * 1.8 + 200))}" r="${(2 + rnd(i + 9) * 3).toFixed(1)}" fill="#ffc03a" opacity="${((1 - age) * Math.min(1, k * 2)).toFixed(2)}"/>`; }
  return `<defs><linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.22" stop-color="#fff" stop-opacity="1"/><stop offset="${pB.toFixed(3)}" stop-color="#fff" stop-opacity="0.95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.14" stop-color="#fff" stop-opacity="1"/><stop offset="0.86" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${id}mv" maskUnits="userSpaceOnUse" x="${f(mx0)}" y="${f(top)}" width="${f(mw)}" height="${f(bot - top)}"><rect x="${f(mx0)}" y="${f(top)}" width="${f(mw)}" height="${f(bot - top)}" fill="url(#${id}v)"/></mask><mask id="${id}mh" maskUnits="userSpaceOnUse" x="${f(mx0)}" y="${f(top)}" width="${f(mw)}" height="${f(bot - top)}"><rect x="${f(mx0)}" y="${f(top)}" width="${f(mw)}" height="${f(bot - top)}" fill="url(#${id}h)"/></mask></defs>${glow}<g mask="url(#${id}mh)"><g mask="url(#${id}mv)"><g>${g}</g></g></g>${emb}`; }
function smokeLayer(t, x0, x1, y, k, seed = 0) { if (k <= 0.02) return ''; let s = ''; for (let i = 0; i < 12; i++) { const age = (t * 0.25 + i / 12) % 1, r = 70 + age * 220; s += `<ellipse cx="${f(x0 + rnd(i + seed) * (x1 - x0) + Math.sin(t + i) * 30)}" cy="${f(y - age * 900)}" rx="${f(r)}" ry="${f(r * 0.8)}" fill="url(#fSmoke)" opacity="${(k * (1 - age) * 0.9).toFixed(2)}"/>`; } return s; }
function sprinklers(t, k) { if (k <= 0.02) return ''; let s = `<rect width="${W}" height="${H}" fill="#4a78a8" opacity="${(0.16 * k).toFixed(2)}"/>`; for (let i = 0; i < 150; i++) { const x = rnd(i) * (W + 200) - 100, sp = 1500 + rnd(i + 3) * 900, y = ((t * sp + rnd(i + 7) * 2400) % 2300) - 200; s += `<path d="M${f(x)},${f(y)} l-14,${f(46 + rnd(i + 1) * 30)}" stroke="#e8f4ff" stroke-width="${(1.6 + rnd(i + 2) * 1.6).toFixed(1)}" stroke-linecap="round" opacity="${(k * (0.3 + rnd(i + 4) * 0.4)).toFixed(2)}"/>`; } for (let i = 0; i < 14; i++) { const x = rnd(i + 20) * W, ph = (t * 2.2 + rnd(i + 30)) % 1; s += `<ellipse cx="${f(x)}" cy="${f(1500 + rnd(i + 31) * 380)}" rx="${f(10 + ph * 40)}" ry="${f(3 + ph * 10)}" fill="none" stroke="#e8f4ff" stroke-width="2" opacity="${(k * (1 - ph) * 0.6).toFixed(2)}"/>`; } return s; }
function alarmLight(t, k) { if (k <= 0.02) return ''; const p = 0.5 + 0.5 * Math.sin(t * 9); return `<rect width="${W}" height="${H}" fill="#ff1a2a" opacity="${(k * (0.07 + 0.11 * p)).toFixed(3)}"/><ellipse cx="540" cy="40" rx="${f(300 + 120 * p)}" ry="${f(150 + 60 * p)}" fill="#ff2a3a" opacity="${(k * 0.35).toFixed(2)}" filter="url(#fb)"/>`; }
let CURPLATE = null;
function wrapIns(t, a, b, inner, tint = '#1a0e24') { const k = win(t, a, b, 0.3, 0.3); if (k <= 0) return ''; const u = clamp((t - a) / (b - a)), s = 1 + 0.12 * u, id = Math.round(a * 10); const e = smooth(k); const entering = u < 0.5;
  const xe = lerp(-120, W + 720, e);
  const pts = entering ? `-400,0 ${xe},0 ${xe - 420},${H} -400,${H}` : `${W + 400},0 ${W - xe},0 ${W - xe - 420},${H} ${W + 400},${H}`;
  const edge = entering ? `M${xe},0 L${xe - 420},${H}` : `M${W - xe},0 L${W - xe - 420},${H}`;
  return `<clipPath id="ic${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#ic${id})"><image href="${CURPLATE}" x="-60" y="-60" width="${W + 120}" height="${H + 120}" preserveAspectRatio="xMidYMid slice"/><rect width="${W}" height="${H}" fill="#06040c" opacity="0.5"/><radialGradient id="ig${id}" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient><rect width="${W}" height="${H}" fill="url(#ig${id})"/><g transform="translate(540,900) scale(${0.9 + 0.1 * e}) translate(-540,-900)"><g transform="translate(0,80)"><g transform="translate(540,880) scale(${s}) translate(-540,-880)">${inner(u)}</g></g></g></g>${k < 1 ? `<path d="${edge}" stroke="#fff" stroke-width="${26 * (1 - k)}" opacity="0.85"/><path d="${edge}" stroke="#7dd3fc" stroke-width="${60 * (1 - k)}" opacity="0.25"/>` : ''}`; }
const insLabel = (txt, col = '#ffe14d', y = 1320, fs = 78) => `<text x="540" y="${y - 118}" font-family="Anton" font-size="${fitFs(txt, 940, fs)}" text-anchor="middle" fill="${col}" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="3">${txt}</text>`;
const sparkle = (x, y, s, o = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><path d="M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z" fill="${c}"/></g>`;
const SPK = (u, n, x0, y0, wv, hv, op = 1) => [...Array(n)].map((_, i) => sparkle(x0 + (i * 83) % wv, y0 + (i * 57) % hv, 0.5 + 0.5 * Math.sin(u * 14 + i), op * (0.5 + 0.5 * Math.sin(u * 9 + i * 2)))).join('');

const insObj = (kind, label, col, extra = '') => (u) => `<ellipse cx="540" cy="780" rx="380" ry="380" fill="url(#fGlow)" opacity="0.55"/><g transform="translate(540,780) rotate(${f(-14 + 6 * Math.sin(u * 6))}) scale(${f(3.6 + 0.2 * Math.sin(u * 5))})">${TOOLS[kind](u)}</g>${extra}<ellipse cx="540" cy="1130" rx="300" ry="30" fill="#000" opacity="0.28" filter="url(#b10)"/>${SPK(u, 12, 150, 220, 780, 640, 0.8)}${insLabel(label, col, 1330)}`;
const ins18 = (t, a, b, kind, label, col, extra) => wrapIns(t, a, b, insObj(kind, label, col, extra));
const T_INS_RAW = [[T.vestA, 'vest', 'CHALECO ACOLCHADO', '#ffe2a0'], [T.legA, 'leggings', 'LEGGINGS NEGROS', '#a5e4ff'], [T.teeA, 'tee', 'PLAYERA MANGA LARGA', '#ffc8e4']];
const T_INS = T_INS_RAW.map(([a, k, l, c], i) => { const nxt = i < T_INS_RAW.length - 1 ? T_INS_RAW[i + 1][0] - 0.05 : 1e9; return [a, Math.min(a + 1.25, nxt, T.dressA - 0.1), k, l, c]; });
const insAll = (t) => T_INS.map(([a, b, k, l, c]) => ins18(t, a, b, k, l, c)).join('');

const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const fitFs = (txt, maxW, fs0) => { let fs = fs0, wd = inkWidth(esc(txt), fs); if (wd > maxW) fs = Math.max(26, Math.floor(fs * maxW / wd)); return fs; };
const SPEAK = { N: { col: '#ffe14d', name: null }, S: { col: '#ffb8d0', name: 'DOÑA SUSAN' }, Y: { col: '#7dd3fc', name: 'WILL' }, D: { col: '#ff5a6a', name: 'M' }, M: { col: '#c9b7ff', name: 'MARI' }, T: { col: '#9ad0ff', name: 'NOTICIAS' }, Q: { col: '#9ad0ff', name: 'POLICÍA' } };
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
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,300) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="40" y="20" font-family="Anton" font-size="${fitFs(text, 500, 62)}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }



const ICON = {
  ZAPATILLAS: `<path d="M-34,14 L-34,-18 Q-34,-28 -22,-24 L-8,-18 Q6,-8 22,-4 Q38,0 38,14 L38,22 L-34,22Z" fill="#ff4d8d" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M-34,22 H38 V30 Q38,34 34,34 H-30 Q-34,34 -34,30Z" fill="#fff" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M-12,-14 l8,8 M-2,-8 l8,8 M8,-4 l8,8" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M-34,6 H20" stroke="#fff" stroke-width="3" opacity="0.6"/>`,
  ROPA: `<path d="M-10,-34 L10,-34 L16,-10 L34,38 L-34,38 L-16,-10Z" fill="#22d3ee" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M-10,-34 Q0,-18 10,-34" fill="#fff" stroke="${OUT}" stroke-width="3.4"/><path d="M-16,-10 H16" stroke="#0c6b7d" stroke-width="5"/><path d="M-22,14 Q0,26 22,14" stroke="#fff" stroke-width="3" fill="none" opacity="0.6"/>`,
};
const pill = (y, bg, txt, tcol, iconKey, label, k) => `<g transform="translate(540,${y}) scale(${k})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="${bg}" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.22"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.3)">${ICON[iconKey]}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs(label, 620, 58)}" text-anchor="middle" fill="${tcol}">${label}</text></g>`;
const cta = (y, bg, icon, label, k) => `<g transform="translate(540,${y}) scale(${k})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="${bg}" stroke="${OUT}" stroke-width="7"/>${icon}<text x="40" y="18" font-family="Anton" font-size="${fitFs(label, 600, 50)}" text-anchor="middle" fill="${OUT}">${label}</text></g>`;
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  const bounce = Math.sin(t * 2) * 0.5;
  let s = `<defs><radialGradient id="ecg" cx="0.5" cy="0.42" r="0.8"><stop offset="0" stop-color="#1a1440"/><stop offset="1" stop-color="#05040c"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#ecg)" opacity="${k}"/>${[...Array(26)].map((_, i) => `<circle cx="${f((i * 197 + 40 * Math.sin(t * 0.6 + i)) % W)}" cy="${f(((i * 311) - t * (14 + i % 5 * 5)) % H + (((i * 311) - t * (14 + i % 5 * 5)) % H < 0 ? H : 0))}" r="${1.5 + (i % 3)}" fill="#bfeaff" opacity="${((0.25 + 0.3 * Math.sin(t * 2 + i)) * k).toFixed(2)}"/>`).join('')}<path d="M0,${H} L${W},${H} L${W},1500 Q540,${f(1420 + 20 * bounce)} 0,1500Z" fill="#0a0814" opacity="${k}"/><text x="540" y="${690 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ ARREGLAMOS</text><text x="540" y="${776 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">MAÑANA?</text>`;
  const a = pop(t, T.optA, 0.35), b = pop(t, T.optB, 0.35);
  if (a > 0) s += pill(960, '#22d3ee', '', OUT, 'ROPA', 'A · ARREGLAR LA ROPA', a);
  if (b > 0) s += pill(1136, '#ff4d8d', '', '#fff', 'ZAPATILLAS', 'B · ARREGLAR LAS ZAPATILLAS', b);
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3), c3 = pop(t, T.cta3, 0.3);
  const chat = `<path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/>`;
  const share = `<g transform="translate(-338,0)"><circle r="32" fill="#1fd0a0" stroke="${OUT}" stroke-width="5"/><circle cx="-11" cy="0" r="6.5" fill="#fff"/><circle cx="10" cy="-12" r="6.5" fill="#fff"/><circle cx="10" cy="12" r="6.5" fill="#fff"/><path d="M-11,0 L10,-12 M-11,0 L10,12" stroke="#fff" stroke-width="3.6"/></g>`;
  const fol = `<circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
  if (c1 > 0) s += cta(1330, '#ffe14d', chat, 'COMENTA TU ELECCIÓN', c1);
  if (c2 > 0) s += cta(1440, '#7dffcf', share, 'COMPARTE ESTE VIDEO', c2 * (1 + 0.04 * Math.sin(t * 8) * clamp((t - T.cta2) / 0.6)));
  if (c3 > 0) s += cta(1550, '#fff', fol, 'SÍGUEME PARA EL DÍA 21', c3);
  return s;
}
const redEyes = (t) => { const o = 0.5 + 0.5 * Math.sin(t * 2.2), bl = (t % 3.1) < 0.14 ? 0.1 : 1; return [-1, 1].map((s) => `<g transform="translate(${540 + s * 130},300)"><ellipse cx="0" cy="0" rx="110" ry="${f(56 * bl)}" fill="url(#fGlow)" opacity="${(0.5 + 0.3 * o).toFixed(2)}"/><path d="M-52,0 Q0,${f(-34 * bl)} 52,0 Q0,${f(30 * bl)} -52,0Z" fill="#ff2a3a"/><ellipse cx="0" cy="0" rx="7" ry="${f(24 * bl)}" fill="#12040a"/></g>`).join(''); };
function slateIntro(t) { const END = 3.7; if (t < 0 || t > END) return ''; const ex = ease(clamp((t - 2.9) / 0.8)); const k = 1 - ex; const clap = t < 0.55 ? 1 - ease(t / 0.55) : t < 0.7 ? 0 : 0;
  const ang = t < 0.45 ? -34 * (1 - ease(t / 0.45)) - 0 : (t < 0.62 ? -34 * (1 - ease(t / 0.45)) : 0); const flash = clamp((t - 0.55) / 0.06) * (1 - clamp((t - 0.62) / 0.3));
  const rays = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * 6.283 + t * 0.15; return `<path d="M540,760 L${f(540 + Math.cos(a) * 1500)},${f(760 + Math.sin(a) * 1500)} L${f(540 + Math.cos(a + 0.11) * 1500)},${f(760 + Math.sin(a + 0.11) * 1500)}Z" fill="#ff8a3a" opacity="${(0.07 + 0.04 * Math.sin(t * 2 + i)).toFixed(3)}"/>`; }).join('');
  const emb = Array.from({ length: 60 }, (_, i) => { const age = (t * (0.12 + (i % 5) * 0.04) + rnd(i)) % 1; return `<circle cx="${f(rnd(i + 3) * W + Math.sin(t * 2 + i) * 24)}" cy="${f(H - age * (H + 100))}" r="${(1.5 + rnd(i + 9) * 3).toFixed(1)}" fill="${i % 3 ? '#ffb84a' : '#ff5a2a'}" opacity="${((1 - age) * 0.9).toFixed(2)}"/>`; }).join('');
  const tl = ['ELLA LLEGÓ AL BOSQUE', 'PERO NO ESTABA SOLA']; const fs = Math.min(...tl.map((l) => { const w0 = measure(l, 64, 400, 'Righteous'); return w0 > 590 ? Math.floor(64 * 590 / w0) : 64; }));

  const aur = [0, 1, 2].map((j) => { let top = '', bot = ''; for (let i = 0; i <= 12; i++) { const x = i * W / 12, y = 520 + j * 280 + 120 * Math.sin(t * 0.9 + i * 0.7 + j * 2); top += (i ? 'L' : 'M') + f(x) + ',' + f(y - 110 - 40 * Math.sin(t * 0.6 + i + j)); } for (let i = 12; i >= 0; i--) { const x = i * W / 12, y = 520 + j * 280 + 120 * Math.sin(t * 0.9 + i * 0.7 + j * 2); bot += 'L' + f(x) + ',' + f(y + 130 + 40 * Math.cos(t * 0.7 + i + j)); } return `<path d="${top}${bot}Z" fill="url(#au${j})" filter="url(#sl30)" opacity="${(0.6 + 0.2 * Math.sin(t + j)).toFixed(2)}"/>`; }).join('');
  const cos = Array.from({ length: 16 }, (_, i) => { const age = (t * (0.07 + (i % 4) * 0.025) + rnd(i + 21)) % 1, x = rnd(i + 4) * W + Math.sin(t * 1.2 + i) * 30, y = H + 80 - age * (H + 160), rot = f(t * 40 * (i % 2 ? 1 : -1) + i * 40), c = ['#ff7ab6', '#ffd98a', '#b07aff', '#7ae8e0'][i % 4], o = (0.5 * Math.sin(age * Math.PI)).toFixed(2);
    const g = i % 3 === 0 ? `<rect x="-9" y="0" width="18" height="40" rx="4" fill="${c}"/><path d="M-8,0 L8,0 L5,-22 L-5,-26Z" fill="#fff"/>` : i % 3 === 1 ? `<circle r="24" fill="${c}"/><circle r="14" fill="#fff" opacity="0.5"/>` : `<rect x="-4" y="-10" width="8" height="52" rx="4" fill="${c}"/><path d="M-12,-10 Q0,-48 12,-10Z" fill="#fff"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${f(0.9 + 0.6 * rnd(i + 8))})" opacity="${o}">${g}</g>`; }).join('');
  const bok = Array.from({ length: 22 }, (_, i) => `<circle cx="${f(rnd(i + 31) * W + Math.sin(t * 0.7 + i) * 40)}" cy="${f(rnd(i + 41) * H + Math.cos(t * 0.5 + i) * 50)}" r="${f(18 + rnd(i + 51) * 50)}" fill="${['#ffd0e8', '#d8c0ff', '#bff3ff'][i % 3]}" opacity="${(0.07 + 0.06 * Math.sin(t * 1.5 + i)).toFixed(3)}"/>`).join('');
    const STARS = Array.from({ length: 70 }, (_, i) => `<circle cx="${f(rnd(i + 3) * W)}" cy="${f(rnd(i + 8) * H * 0.75)}" r="${f(1 + rnd(i + 14) * 2.2)}" fill="#fff" opacity="${(0.25 + 0.5 * Math.abs(Math.sin(t * (0.8 + rnd(i) * 1.5) + i))).toFixed(2)}"/>`).join('');
  const CURLS = Array.from({ length: 6 }, (_, j) => { let d = ''; for (let i = 0; i < 34; i++) { const r = 4 + i * 2.7, an = i * 0.46; d += (i ? 'L' : 'M') + f(Math.cos(an) * r) + ',' + f(Math.sin(an) * r); } return `<g transform="translate(${f(rnd(j + 60) * W)},${f(300 + rnd(j + 70) * 1300 + Math.sin(t * 0.5 + j) * 50)}) rotate(${f(t * (14 + j * 4) * (j % 2 ? 1 : -1))}) scale(${f(1.1 + rnd(j + 80) * 1.2)})" opacity="${(0.25 + 0.2 * Math.sin(t + j)).toFixed(2)}"><path d="${d}" stroke="#ffcf7a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff6dd" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/></g>`; }).join('');
  const FOG = Array.from({ length: 7 }, (_, i) => `<ellipse cx="${f(((i * 210 + t * 26 * (1 + i % 3)) % 1500) - 220)}" cy="${f(1100 + (i % 5) * 150)}" rx="360" ry="80" fill="url(#fogG)" opacity="0.8"/>`).join('');
  const FLY = Array.from({ length: 26 }, (_, i) => { const x = rnd(i + 90) * W + Math.sin(t * 0.9 + i * 1.7) * 60, y = 900 + rnd(i + 99) * 900 + Math.cos(t * 0.7 + i) * 50, o = (0.4 + 0.6 * Math.abs(Math.sin(t * 1.6 + i * 2.1))).toFixed(2); return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + rnd(i + 5) * 3)}" fill="#e8ff9a" opacity="${o}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(16 + rnd(i + 7) * 10)}" fill="#e8ff9a" opacity="${(o * 0.2).toFixed(2)}"/>`; }).join('');
const bgNew = `<defs><linearGradient id="slBg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020a0c"/><stop offset="0.6" stop-color="#06222a"/><stop offset="1" stop-color="#0c1620"/></linearGradient><radialGradient id="beamG" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#d8fff4" stop-opacity="0.55"/><stop offset="1" stop-color="#d8fff4" stop-opacity="0"/></radialGradient><radialGradient id="sirR" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff2a3a" stop-opacity="0.8"/><stop offset="1" stop-color="#ff2a3a" stop-opacity="0"/></radialGradient><radialGradient id="sirB" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2a6aff" stop-opacity="0.8"/><stop offset="1" stop-color="#2a6aff" stop-opacity="0"/></radialGradient></defs><g opacity="${k.toFixed(2)}"><rect width="${W}" height="${H}" fill="url(#slBg4)"/>
  ${[0, 1, 2, 3, 4].map((i) => { const ph = ((t * 0.45 + i / 5) % 1); return `<circle cx="540" cy="1250" r="${f(60 + ph * 980)}" fill="none" stroke="#5fe8c8" stroke-width="${f(10 * (1 - ph) + 2)}" opacity="${(0.55 * (1 - ph)).toFixed(2)}"/>`; }).join('')}
  ${[0, 1].map((j) => { const a = Math.sin(t * 0.8 + j * 3) * 0.55 + (j ? 0.5 : -0.5); return `<g transform="translate(${j ? 900 : 180},-40) rotate(${f(a * 40)})"><path d="M-40,0 L-340,1700 L340,1700 L40,0Z" fill="url(#beamG)" opacity="0.5"/></g>`; }).join('')}
  ${Array.from({ length: 22 }, (_, i) => { const age = (t * (0.1 + (i % 4) * 0.035) + rnd(i + 7)) % 1, x = rnd(i + 2) * W + Math.sin(t * 1.3 + i) * 50, y = -60 + age * (H + 120); return `<path d="M0,-18 Q14,-4 0,22 Q-14,-4 0,-18Z" transform="translate(${f(x)},${f(y)}) rotate(${f(t * 80 * (i % 2 ? 1 : -1) + i * 33)}) scale(${f(0.9 + rnd(i + 5))})" fill="#02080a" opacity="0.85"/>`; }).join('')}
  <ellipse cx="60" cy="1860" rx="${f(420 + 80 * Math.sin(t * 6))}" ry="${f(300)}" fill="url(#sirR)" opacity="${(0.5 + 0.5 * Math.sin(t * 6)).toFixed(2)}"/><ellipse cx="1020" cy="1860" rx="${f(420 + 80 * Math.cos(t * 6))}" ry="300" fill="url(#sirB)" opacity="${(0.5 + 0.5 * Math.cos(t * 6)).toFixed(2)}"/>
  ${Array.from({ length: 20 }, (_, i) => `<circle cx="${f(rnd(i + 90) * W + Math.sin(t * 0.9 + i * 1.7) * 60)}" cy="${f(1000 + rnd(i + 99) * 800 + Math.cos(t * 0.7 + i) * 50)}" r="${f(3 + rnd(i + 3) * 3)}" fill="#d8ff7a" opacity="${(0.35 + 0.6 * Math.abs(Math.sin(t * 1.6 + i * 2.1))).toFixed(2)}" filter="url(#fb)"/>`).join('')}</g>`;
  const board = `<g transform="translate(540,${f(900 + 40 * ex)}) scale(${f(1 + 0.16 * ex)})" opacity="${k.toFixed(2)}"><ellipse cx="0" cy="470" rx="400" ry="40" fill="#000" opacity="0.4" filter="url(#fb)"/><rect x="-360" y="-240" width="720" height="640" rx="22" fill="url(#slB)" stroke="${OUT}" stroke-width="10"/><path d="M-360,-80 H360 M-360,200 H360" stroke="#fff" stroke-opacity="0.7" stroke-width="5"/><text x="-330" y="-176" font-family="Bungee" font-size="${fitFs('LAZY DAWNS', 640, 50)}" fill="#fff">LAZY DAWNS</text><text x="-330" y="-112" font-family="Bungee" font-size="${fitFs('DÍA 20/30', 640, 50)}" fill="#ffb84a">DÍA 20/30</text>${tl.map((l, i) => `<text x="-330" y="${i * 86 + 10}" font-family="Righteous" font-size="${fs}" fill="#fff">${esc(l)}</text>`).join('')}<text x="-330" y="266" font-family="Righteous" font-size="30" fill="#9ca3af">TOMA 1 · ESCENA A</text>
    <g transform="translate(-360,-240) rotate(${f(ang)} 0 0)"><rect x="0" y="-90" width="720" height="90" rx="14" fill="#f5f5f5" stroke="${OUT}" stroke-width="8"/>${[...Array(9)].map((_, i) => `<path d="M${i * 88 - 10},-84 l60,0 l-34,78 l-60,0Z" fill="#7a0a18"/>`).join('')}</g><circle cx="-360" cy="-240" r="14" fill="#cfd4da" stroke="${OUT}" stroke-width="5"/>
    <rect x="-360" y="-240" width="720" height="90" rx="14" fill="#f5f5f5" stroke="${OUT}" stroke-width="8" opacity="0"/></g>`;
  return `<g><defs><linearGradient id="slB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a1040"/><stop offset="1" stop-color="#14061c"/></linearGradient><radialGradient id="slBg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#7a1424"/><stop offset="0.5" stop-color="#2a0814"/><stop offset="1" stop-color="#07030a"/></radialGradient></defs>${FDEFS}${bgNew}${board}<rect width="${W}" height="${H}" fill="#fff" opacity="${(flash * 0.5).toFixed(3)}"/></g>`; }

function transitionAt(t) { for (const [t0, kind0, d] of TRANS) { const kind = kind0 === 'cut2' ? 'cut' : kind0; const zk = kind0 === 'cut2' ? 0.04 : 0.2; const a = t0 - (kind === 'cut' ? d / 2 : 0), p = (t - a) / d; if (p < 0 || p > 1) continue;
    if (kind === 'in') { const e = ease(p); return { on: true, ghost: p < 0.85, sc: 1.4 - 0.4 * e, v: (1 - e), fl: 0.35 * Math.max(0, 1 - p * 3), gx: 0 }; }
    const e = smooth(p), mid = 1 - Math.abs(e - 0.5) * 2; const sc = e < 0.5 ? 1 + e * 2 * zk : 1 + zk - (e * 2 - 1) * zk; return { on: true, ghost: true, sc, v: mid, fl: 0.5 * mid * mid, gx: (e < 0.5 ? 1 : -1) * mid * 40 }; } return { on: false }; }


function setFace() {
  Object.assign(LOOK, JSON.parse(JSON.stringify(FULL))); Object.assign(EYEX, { glit: 0, side: 0, inn: null, shp: null, ip: 0, shH: null, drape: 0, blushK: null, shK: null, blushCol: null, dx: 0 });
  BROWX.style = null; LIPX.gloss = 1; LIPX.tex = 0; LIPX.shimmer = 0; FACEK.hi = 1; FACEK.glow = 1; NOSEDY.dy = 0; MOUTHX.dy = 0; NECK.w = 1; MK.lips = 1; EYEX.nomk = 0; EYEX.nomk2 = 1; JAW.fxK = 1;
  applyDay18Face(); EYEX.nomk = 0; EYEX.nomk2 = 1; JAW.fxK = 1; LOOK.found = 1; BROWX.style = 'ombre';
}
const mCache2 = new Map();
function measure(str, fs, wt = 500, fam = 'Inter') { const key = fam + '|' + fs + '|' + wt + '|' + str; if (mCache2.has(key)) return mCache2.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${Math.ceil(fs * 2)}"><text x="10" y="${fs * 1.3}" font-family="${fam}" font-weight="${wt}" font-size="${fs}" fill="#000">${esc(str)}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache2.set(key, r); return r; }
function wrapTxt(txt, maxW, fs, wt) { const words = txt.split(' '), lines = []; let cur = ''; for (const w2 of words) { const t2 = cur ? cur + ' ' + w2 : w2; if (measure(t2, fs, wt) <= maxW) cur = t2; else { lines.push(cur); cur = w2; } } if (cur) lines.push(cur); return lines; }
const stepBanners = [];
const TRANS = [[T.dressA, 'cut2', 0.5], [T.forestA, 'cut2', 0.4], [T.runA, 'cut2', 0.3], [T.policeA, 'cut2', 0.4]];
const OUTL = '#12090a';
// ---------------- BOSQUE (capas 2D prerenderizadas con parallax) ----------------
const pineS = (x, by, h, w0, c1, c2) => { let o = `<rect x="${f(x - w0 * 0.05)}" y="${f(by - h * 0.22)}" width="${f(w0 * 0.1)}" height="${f(h * 0.26)}" fill="${c1}"/>`;
  for (let j = 0; j < 6; j++) { const ty = by - h * (0.16 + j * 0.15), tw = w0 * (1 - j * 0.15), th = h * 0.28; let d = `M${f(x)},${f(ty - th)}`; for (let i = 1; i <= 7; i++) d += ` L${f(x + tw / 2 * (i / 7) + (i % 2 ? 9 : -5))},${f(ty - th + th * (i / 7) + (i % 2 ? -7 : 5))}`; d += ` L${f(x + tw / 2)},${f(ty)} Q${f(x)},${f(ty + 14)} ${f(x - tw / 2)},${f(ty)}`; for (let i = 7; i >= 1; i--) d += ` L${f(x - tw / 2 * (i / 7) - (i % 2 ? 9 : -5))},${f(ty - th + th * (i / 7) + (i % 2 ? -7 : 5))}`; o += `<path d="${d}Z" fill="${j % 2 ? c1 : c2}"/>`; }
  return o; };
const trunkS = (x, by, wd, h, c, seed) => { let o = `<path d="M${f(x - wd / 2)},${f(by)} Q${f(x - wd * 0.42)},${f(by - h * 0.5)} ${f(x - wd * 0.3)},${f(by - h)} L${f(x + wd * 0.3)},${f(by - h)} Q${f(x + wd * 0.42)},${f(by - h * 0.5)} ${f(x + wd / 2)},${f(by)}Z" fill="${c}"/>`;
  for (let i = 0; i < 7; i++) { const yy = by - h * (0.1 + 0.12 * i); o += `<path d="M${f(x - wd * 0.3 + rnd(seed + i) * wd * 0.3)},${f(yy)} q${f(wd * 0.1)},${f(-h * 0.05)} ${f(wd * 0.12)},${f(-h * 0.1)}" stroke="#000" stroke-width="3" fill="none" opacity="0.5"/>`; }
  o += `<path d="M${f(x + wd * 0.18)},${f(by)} Q${f(x + wd * 0.22)},${f(by - h * 0.5)} ${f(x + wd * 0.14)},${f(by - h)}" stroke="#2a4a6a" stroke-width="${f(wd * 0.08)}" fill="none" opacity="0.28"/>`;
  for (const sd of [-1, 1]) o += `<path d="M${f(x + sd * wd * 0.45)},${f(by)} Q${f(x + sd * wd * 0.9)},${f(by - 8)} ${f(x + sd * wd * 1.2)},${f(by + 16)} L${f(x + sd * wd * 0.2)},${f(by + 10)}Z" fill="${c}"/>`;
  for (let j = 0; j < 3; j++) { const yy = by - h * (0.45 + j * 0.18), sd = j % 2 ? 1 : -1; o += `<path d="M${f(x)},${f(yy)} q${f(sd * wd * 1.4)},${f(-wd * 0.7)} ${f(sd * wd * 2.2)},${f(-wd * 1.4)}" stroke="${c}" stroke-width="${f(wd * 0.18)}" fill="none" stroke-linecap="round"/>`; }
  return o; };
const mkLayer = (wd, hh, body) => b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${wd}" height="${hh}" viewBox="0 0 ${wd} ${hh}">${body}</svg>`, ropt).render().asPng());
const FOR = (() => {
  const sky = mkLayer(W, H, `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02040e"/><stop offset="0.55" stop-color="#0b1738"/><stop offset="0.8" stop-color="#18284a"/><stop offset="1" stop-color="#0a1226"/></linearGradient><radialGradient id="mg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#eaf2ff" stop-opacity="0.85"/><stop offset="0.3" stop-color="#9fbcff" stop-opacity="0.35"/><stop offset="1" stop-color="#9fbcff" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#sk)"/>${Array.from({ length: 90 }, (_, i) => `<circle cx="${f(rnd(i + 3) * W)}" cy="${f(rnd(i + 8) * 900)}" r="${f(0.8 + rnd(i + 14) * 2)}" fill="#fff" opacity="${f(0.25 + 0.6 * rnd(i + 22))}"/>`).join('')}<circle cx="760" cy="440" r="440" fill="url(#mg)"/><circle cx="760" cy="440" r="92" fill="#f3f7ff"/><circle cx="734" cy="418" r="20" fill="#cdd8ee" opacity="0.6"/><circle cx="792" cy="462" r="13" fill="#cdd8ee" opacity="0.5"/><path d="M-20,380 Q300,330 620,380 T1100,350" stroke="#7a8fc0" stroke-width="30" fill="none" opacity="0.12"/>`);
  const mk = (wd, n, fn) => { let o = ''; for (let i = 0; i < n; i++) { const x = (i + 0.5) * wd / n + (rnd(i * 3 + wd) - 0.5) * wd / n * 0.6; for (const dx of [0, -wd, wd]) o += fn(x + dx, i); } return o; };
  const fogG = `<defs><linearGradient id="fgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2c4c" stop-opacity="0"/><stop offset="1" stop-color="#1a2c4c" stop-opacity="0.85"/></linearGradient></defs>`;
  const far = mkLayer(1620, H, `${fogG}${mk(1620, 12, (x, i) => pineS(x, 1220 + rnd(i) * 30, 520 + rnd(i + 4) * 160, 190 + rnd(i + 7) * 70, '#0a1a36', '#0d2040'))}<rect y="900" width="1620" height="${H - 900}" fill="url(#fgb)"/>`);
  const mid = mkLayer(2160, H, `${fogG}${mk(2160, 11, (x, i) => (i % 3 === 1 ? trunkS(x, 1340, 74, 880 + rnd(i) * 160, '#06101e', i * 5) : pineS(x, 1330 + rnd(i) * 24, 780 + rnd(i + 4) * 220, 250 + rnd(i + 7) * 80, '#050d1c', '#071426')))}<rect y="1000" width="2160" height="${H - 1000}" fill="url(#fgb)" opacity="0.7"/>`);
  const near = mkLayer(2880, H, `${mk(2880, 6, (x, i) => trunkS(x, 1500 + rnd(i) * 40, 150 + rnd(i + 2) * 60, 1250 + rnd(i + 4) * 200, '#02050c', i * 9) + Array.from({ length: 4 }, (_, q) => `<path d="M${f(x + (q - 1.5) * 30)},${f(560 + q * 80)} q${f((q % 2 ? 1 : -1) * 12)},${f(120 + 40 * rnd(i + q))} 0,${f(220)}" stroke="#16341e" stroke-width="5" fill="none" opacity="0.7"/>`).join(''))}${mk(2880, 14, (x, i) => `<ellipse cx="${f(x)}" cy="${1560 + (i % 3) * 20}" rx="${f(90 + rnd(i) * 60)}" ry="${f(70 + rnd(i + 3) * 40)}" fill="#030610"/>`)}`);
  const ground = mkLayer(2160, 760, `<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1a1c"/><stop offset="1" stop-color="#050a0c"/></linearGradient><linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2a28"/><stop offset="1" stop-color="#4a3a2a"/></linearGradient></defs><rect width="2160" height="760" fill="url(#gr)"/><path d="M0,330 Q540,300 1080,340 T2160,320 L2160,560 Q1620,640 1080,600 T0,570Z" fill="url(#pa)" opacity="0.95"/>${Array.from({ length: 80 }, (_, i) => `<path d="M${f(rnd(i + 11) * 2160)},${f(20 + rnd(i + 12) * 720)} q${f(rnd(i) * 10 - 5)},${f(-26)} ${f(rnd(i + 3) * 14 - 7)},${f(-36)}" stroke="#1b3a22" stroke-width="3" fill="none" opacity="0.6"/>`).join('')}${Array.from({ length: 40 }, (_, i) => `<ellipse cx="${f(rnd(i + 31) * 2160)}" cy="${f(370 + rnd(i + 32) * 200)}" rx="${f(10 + rnd(i) * 20)}" ry="${f(4 + rnd(i + 5) * 8)}" fill="#1a130c" opacity="0.5"/>`).join('')}`);
  return { sky, far, mid, near, ground };
})();
const layerX = (img, wd, hh, sc, y0 = 0, op = 1) => { const x = -(((sc % wd) + wd) % wd); return `<g opacity="${op}"><image href="${img}" x="${f(x)}" y="${y0}" width="${wd}" height="${hh}"/><image href="${img}" x="${f(x + wd)}" y="${y0}" width="${wd}" height="${hh}"/></g>`; };
const forestScene = (t, scroll, o = {}) => { const fogA = 0.55 + (o.fog ?? 0);
  const fog = (k0, y0, a) => Array.from({ length: 6 }, (_, i) => `<ellipse cx="${f((((i * 260 + t * 22 * (1 + i % 3) - scroll * k0) % 1700) + 1700) % 1700 - 300)}" cy="${f(y0 + (i % 4) * 60)}" rx="360" ry="70" fill="url(#fogG2)" opacity="${a.toFixed(2)}"/>`).join('');
  const fly = Array.from({ length: 22 }, (_, i) => { const x = ((rnd(i + 90) * 1500 - scroll * 0.7 + Math.sin(t * 0.9 + i * 1.7) * 50) % 1500 + 1500) % 1500 - 200, y = 900 + rnd(i + 99) * 700 + Math.cos(t * 0.7 + i) * 40; return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + rnd(i) * 3)}" fill="#d8ff7a" opacity="${(0.3 + 0.65 * Math.abs(Math.sin(t * 1.6 + i * 2.1))).toFixed(2)}" filter="url(#b6)"/>`; }).join('');
  return { back: `<defs><radialGradient id="fogG2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#9fb4d8" stop-opacity="0.4"/><stop offset="1" stop-color="#9fb4d8" stop-opacity="0"/></radialGradient></defs><image href="${FOR.sky}" width="${W}" height="${H}"/>${layerX(FOR.far, 1620, H, scroll * 0.18)}${fog(0.25, 1100, fogA * 0.6)}${layerX(FOR.mid, 2160, H, scroll * 0.45)}${layerX(FOR.ground, 2160, 760, scroll * 1.0, 1160)}${layerX(FOR.near, 2880, H, scroll * 1.1, 0, 0.8)}${fog(0.5, 1250, fogA * 0.7)}<defs><radialGradient id="moonLight" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#cfe0ff" stop-opacity="0.4"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient></defs><ellipse cx="${f(o.lightX ?? 540)}" cy="1450" rx="520" ry="900" fill="url(#moonLight)"/>`,
    front: `${fog(1.2, 1500, fogA * 0.55)}${fly}<rect width="${W}" height="${H}" fill="#02050c" opacity="${o.dark ?? 0.22}"/>` }; };
// ---------------- cabana (cold open) ----------------
const cabinFg = (t) => { const s = mariCabina(t, { talk: Math.min(1, MOUTHW('M', t) * 1.1), struggle: 0.35 + 0.5 * Math.min(1, t / 2.5) });
  const body = s.replace(/id="/g, 'id="c20_').replace(/url\(#/g, 'url(#c20_').replace(/href="#/g, 'href="#c20_').replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>\s*$/, '</g>');
  const ek = win(t, L.i2.start - 0.5, L.i2.end + 0.2, 0.6, 0.4);
  const Pm = poseClip('idle', t);
  const m = ek > 0.01 ? `<g opacity="${(ek * 0.92).toFixed(2)}" transform="translate(${f(880 - 90 * (1 - ek))},1050) scale(0.5)"><filter id="mdk"><feColorMatrix values="0.45 0 0 0 0  0 0.45 0 0 0  0 0 0.5 0 0  0 0 0 1 0"/></filter><g filter="url(#mdk)">${renderM(Pm)}</g></g>` : '';
  return `${body}${m}`; };
// ---------------- closet (ropa rapida) ----------------
const closetSvg = (t) => { const k = clamp((t - T.l2A) / 0.5), open = ease(clamp((t - T.l2A) / 0.6)), sw = (i) => Math.sin(t * 3 + i) * 1.2 * open;
  const hang = [['#c0452a', 30], ['#3b8ad0', 40], ['#e8d24a', 34], ['#2f9a6a', 44], ['#a04ac8', 38], ['#e07aa8', 34], ['#4a5568', 40]];
  const clothes = hang.map(([c, wd], i) => `<g transform="translate(${f(560 + i * 56 + sw(i))},640)"><path d="M0,-30 q-8,-18 8,-22" stroke="#caa" stroke-width="4" fill="none"/><path d="M-${wd / 2},-20 L${wd / 2},-20 L${wd / 2 + 8},170 L-${wd / 2 - 8},170Z" fill="${c}" stroke="${OUTL}" stroke-width="4" stroke-linejoin="round"/><path d="M-${wd / 3},0 l0,150" stroke="#fff" stroke-width="2" opacity="0.2"/></g>`).join('');
  const vest = `<g transform="translate(${f(560 + 7 * 56 + 10)},690)"><path d="M0,-40 q-8,-18 8,-22" stroke="#caa" stroke-width="4" fill="none"/><g transform="scale(0.7)">${TOOLS.vest()}</g></g>`;
  return `<g opacity="${k.toFixed(2)}"><defs><linearGradient id="cwd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2c16"/><stop offset="0.5" stop-color="#7a4a26"/><stop offset="1" stop-color="#3a2210"/></linearGradient></defs>
    <rect x="500" y="420" width="560" height="1010" rx="14" fill="#1a0e08" stroke="${OUTL}" stroke-width="9"/><rect x="520" y="440" width="520" height="970" fill="#0c0705"/><rect x="520" y="560" width="520" height="14" fill="#8a8f9a" stroke="${OUTL}" stroke-width="3"/>${clothes}${vest}
    <rect x="520" y="1100" width="520" height="12" fill="url(#cwd)" stroke="${OUTL}" stroke-width="3"/><rect x="540" y="1140" width="200" height="120" rx="8" fill="#3a2a1a" stroke="${OUTL}" stroke-width="5"/><rect x="760" y="1140" width="200" height="120" rx="8" fill="#2a1a2a" stroke="${OUTL}" stroke-width="5"/>
    <g transform="translate(500,420)"><path d="M0,0 L${f(-130 * open)},${f(30 * open)} L${f(-130 * open)},${f(1010 - 30 * open)} L0,1010Z" fill="url(#cwd)" stroke="${OUTL}" stroke-width="9" stroke-linejoin="round"/><circle cx="${f(-26 * open)}" cy="520" r="9" fill="#e8c060" stroke="${OUTL}" stroke-width="3"/></g>
    <g transform="translate(1060,420)"><path d="M0,0 L${f(130 * open)},${f(30 * open)} L${f(130 * open)},${f(1010 - 30 * open)} L0,1010Z" fill="url(#cwd)" stroke="${OUTL}" stroke-width="9" stroke-linejoin="round"/><circle cx="${f(26 * open)}" cy="520" r="9" fill="#e8c060" stroke="${OUTL}" stroke-width="3"/></g></g>`; };
// ---------------- pantalla del celular que graba ----------------
const camPhone = (t) => { const a = T.recA - 0.1, b = T.pubA + 1.9, k = win(t, a, b, 0.25, 0.3); if (k <= 0) return '';
  const pubK = clamp((t - (T.pubA - 0.2)) / 0.3), rec = 1 - pubK, tremble = Math.sin(t * 52) * 2.4 * pubK;
  const sw = 340, sh = 700, sTop = -sh / 2; const lab = 'Jamás estaría en una pasarela de modelo'; const lines = wrapTxt(lab, sw - 70, 34, 800);
  const secs = Math.max(0, t - T.recA);
  const rUI = `<g opacity="${rec.toFixed(2)}"><circle cx="${-sw / 2 + 36}" cy="${sTop + 50}" r="11" fill="#ff2a3a" opacity="${(0.5 + 0.5 * Math.sin(t * 8)).toFixed(2)}"/><text x="${-sw / 2 + 56}" y="${sTop + 58}" font-family="Inter" font-weight="800" font-size="24" fill="#fff">REC 00:${String(Math.floor(secs)).padStart(2, '0')}</text>
    <rect x="${-sw / 2 + 14}" y="${sTop + 90}" width="${sw - 28}" height="${lines.length * 44 + 30}" rx="16" fill="#000" opacity="0.55"/>${lines.map((l, i) => `<text x="0" y="${sTop + 130 + i * 44}" font-family="Inter" font-weight="800" font-size="34" text-anchor="middle" fill="#fff">${esc(l)}</text>`).join('')}
    <circle cx="0" cy="${sh / 2 - 70}" r="34" fill="none" stroke="#fff" stroke-width="6"/><circle cx="0" cy="${sh / 2 - 70}" r="24" fill="#ff2a3a"/></g>`;
  const l1 = 'Jamás estaría en una', l2 = 'pasarela de modelo';
  const pUI = `<g opacity="${pubK.toFixed(2)}"><rect x="${-sw / 2}" y="${sTop}" width="${sw}" height="${sh}" fill="#0f1218"/><text x="0" y="${sTop + 70}" font-family="Inter" font-weight="800" font-size="30" text-anchor="middle" fill="#fff">Nueva publicación</text><rect x="${-sw / 2 + 24}" y="${sTop + 100}" width="${sw - 48}" height="250" rx="16" fill="#1c2230"/><text x="0" y="${sTop + 232}" font-family="Inter" font-weight="800" font-size="30" text-anchor="middle" fill="#fff">${l1}</text><text x="0" y="${sTop + 270}" font-family="Inter" font-weight="800" font-size="30" text-anchor="middle" fill="#fff">${l2}</text>
    <rect x="${-sw / 2 + 24}" y="${sh / 2 - 150}" width="${sw - 48}" height="84" rx="42" fill="#2f7bff" stroke="#fff" stroke-width="3" opacity="${(0.85 + 0.15 * Math.sin(t * 6)).toFixed(2)}"/><text x="0" y="${sh / 2 - 94}" font-family="Inter" font-weight="800" font-size="36" text-anchor="middle" fill="#fff">Publicar</text></g>`;
  const fx = lerp(190, 0, ease(pubK)) + Math.sin(t * 40) * 3 * pubK, fy = sh / 2 - 108 + lerp(220, 0, ease(pubK)) + tremble; const finger = pubK > 0.02 ? `<g transform="translate(${f(fx)},${f(fy)}) rotate(-20)"><path d="M-26,140 L-24,6 Q-24,-26 0,-28 Q24,-26 24,6 L26,140Z" fill="#c58a5c" stroke="${OUTL}" stroke-width="6"/><ellipse cx="0" cy="-6" rx="17" ry="12" fill="#f0c8a0" opacity="0.5"/></g>` : '';
  return `<g opacity="${k.toFixed(2)}"><rect width="${W}" height="${H}" fill="#04030a" opacity="0.82"/><g transform="translate(540,${f(880 + tremble)}) scale(1.35)"><rect x="${-sw / 2 - 16}" y="${sTop - 16}" width="${sw + 32}" height="${sh + 32}" rx="56" fill="#2a2a34" stroke="${OUTL}" stroke-width="7"/><defs><clipPath id="cpS"><rect x="${-sw / 2}" y="${sTop}" width="${sw}" height="${sh}" rx="42"/></clipPath></defs><g clip-path="url(#cpS)"><rect x="${-sw / 2}" y="${sTop}" width="${sw}" height="${sh}" fill="#0b1420"/><image href="${FOR.sky}" x="${-sw / 2 - 220}" y="${sTop - 300}" width="${W * 0.9}" height="${H * 0.9}" opacity="0.55"/><rect x="${-sw / 2}" y="${sTop}" width="${sw}" height="${sh}" fill="#000" opacity="0.2"/>${rUI}${pUI}</g><rect x="-44" y="${sTop + 10}" width="88" height="24" rx="12" fill="#05050a"/>${finger}</g></g>`; };
// ---------------- patrulla con luces ----------------
const patrol = (t, x, y, sc = 1) => { const p = 0.5 + 0.5 * Math.sin(t * 9), q = 1 - p;
  return `<g transform="translate(${x},${y}) scale(${sc})"><defs><radialGradient id="sirR2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff2a3a" stop-opacity="0.8"/><stop offset="1" stop-color="#ff2a3a" stop-opacity="0"/></radialGradient><radialGradient id="sirB2" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2a6aff" stop-opacity="0.8"/><stop offset="1" stop-color="#2a6aff" stop-opacity="0"/></radialGradient></defs><ellipse cx="0" cy="40" rx="420" ry="40" fill="#000" opacity="0.4"/>
   <path d="M-380,0 Q-380,-90 -300,-110 L-170,-120 Q-110,-230 20,-236 Q170,-236 220,-130 L340,-110 Q400,-100 400,-30 L400,30 L-380,30Z" fill="#e8eef8" stroke="${OUTL}" stroke-width="9" stroke-linejoin="round"/>
   <path d="M-170,-118 Q-110,-216 20,-222 Q150,-222 200,-122Z" fill="#1d2c4d" stroke="${OUTL}" stroke-width="7"/><path d="M-380,-6 H400 V28 H-380Z" fill="#1d2c4d" stroke="${OUTL}" stroke-width="6"/>
   <rect x="-60" y="-262" width="160" height="30" rx="10" fill="#222" stroke="${OUTL}" stroke-width="6"/><rect x="-54" y="-258" width="70" height="22" rx="8" fill="#ff2a3a" opacity="${(0.4 + 0.6 * p).toFixed(2)}"/><rect x="26" y="-258" width="70" height="22" rx="8" fill="#2a6aff" opacity="${(0.4 + 0.6 * q).toFixed(2)}"/>
   <ellipse cx="-20" cy="-250" rx="220" ry="130" fill="url(#sirR2)" opacity="${(0.9 * p).toFixed(2)}"/><ellipse cx="60" cy="-250" rx="240" ry="140" fill="url(#sirB2)" opacity="${(0.9 * q).toFixed(2)}"/>
   <text x="-100" y="-40" font-family="Anton" font-size="${fitFs('POLICÍA', 220, 62)}" text-anchor="middle" fill="#1d2c4d">POLICÍA</text>
   ${[-240, 250].map((wx) => `<circle cx="${wx}" cy="36" r="64" fill="#101014" stroke="${OUTL}" stroke-width="8"/><circle cx="${wx}" cy="36" r="30" fill="#8a8f9a" stroke="${OUTL}" stroke-width="5"/>`).join('')}
   <path d="M360,-60 q60,10 60,40" stroke="#fff6a0" stroke-width="6" fill="none"/><ellipse cx="420" cy="-30" rx="150" ry="70" fill="#fff6c8" opacity="0.2" filter="url(#b10)"/></g>`; };
// ---------------- ESCENAS Y ACTORES ----------------
const sceneAt = (t) => (t < T.slateA + 2.0 ? 'cabin' : t < T.forestA ? 'home' : t < T.policeA ? 'forest' : 'police');
const NEWS = 0.7;
const MOUTHW = (who, t) => { const l = DATA.lines.find((q) => q.who === who && t >= q.start - 0.05 && t <= q.end + 0.1); if (!l) return 0; for (const [ww, s, e] of l.words) if (t >= s - 0.02 && t <= e + 0.04) { const k = (t - s) / Math.max(0.12, e - s); return 0.28 + 0.62 * Math.abs(Math.sin((t - s) * 21 + ww.length)) * (0.7 + 0.3 * Math.sin(k * 3.14)); } return 0.04; };
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
const hairAt = (t, sway) => ({ hd: 'twin', tv: 'lowb2', len: 0.7, shine: 1, cp: 1, grow: 1, sway });
const scrollAt = (t) => (t < T.forestA ? 0 : t < T.l4A ? (t - T.forestA) * 150 : t < T.runA ? 150 * (T.l4A - T.forestA) + (t - T.l4A) * 6 : 150 * (T.l4A - T.forestA) + 6 * (T.runA - T.l4A) + (t - T.runA) * 700);
const running = (t) => t >= T.runA && t < T.policeA - 0.2 && !(t >= T.pushA && t < T.pushA + 1.5);
const walking = (t) => t >= T.forestA && t < T.l4A;
const mudK = (t) => clamp((t - T.mudA) / 0.9);
const CAM = [[0, 1.0, 540, 960], [L.i1.start, 1.18, 540, 840], [L.i1.end - 0.2, 1.5, 540, 640], [L.i2.start - 0.1, 1.1, 640, 900], [T.slateA, 1.0, 540, 960], [T.slateA + 2.0, 1.0, 540, 960], [T.hookA, 1.04, 540, 990], [T.l2A, 1.15, 800, 900], [T.vestA, 1.2, 760, 900], [T.dressA - 0.2, 1.0, 540, 960], [T.dressA + 0.4, 1.05, 540, 980], [T.forestA + 0.05, 1.0, 540, 960], [T.l3A, 1.1, 540, 1000], [T.l4A - 0.3, 1.0, 540, 960], [T.l4A, 1.18, 660, 940], [T.l5A, 1.4, 760, 840], [T.l6A, 1.45, 440, 880], [T.recA, 1.0, 540, 960], [T.mariA - 0.1, 1.15, 380, 960], [T.runA, 1.05, 540, 1020], [T.pushA - 0.6, 1.2, 540, 1000], [T.pushA, 1.55, 540, 1140], [T.mudA, 1.5, 540, 1200], [T.l12A, 1.05, 540, 1020], [T.policeA - 0.1, 1.05, 540, 1020], [T.l13A - 0.2, 1.0, 540, 960], [T.l13A, 1.18, 700, 900], [T.l14A, 1.12, 440, 980], [T.vote, 1.0, 540, 960]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.l8A - 0.2, T.l8A + 0.4, 0.02, 0.3) * 8 + win(t, T.slateA + 0.55, T.slateA + 1.1, 0.02, 0.4) * 8 + (t >= T.runA && t < T.pushA ? 6 : 0) + win(t, T.pushA, T.pushA + 0.6, 0.02, 0.4) * 18 + (t >= T.l12A && t < T.policeA ? 5 : 0) + win(t, L.i1.start, L.i1.end, 0.1, 0.2) * 3;
  return { z: lerp(a[1], b[1], u) * (1 + 0.012 * Math.sin(t * 0.7)), x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}
const mariState = (t) => { if (t >= T.mariA && t < T.runA) return { mode: 'burst' }; if (t >= T.runA && t < T.policeA - 0.3) return { mode: 'run' }; if (t >= T.policeA - 0.3 && t < T.vote) return { mode: 'stand' }; return null; };
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t); CURPLATE = platePng.home; NAILS.on = true;
  const mk = mudK(t);
  const mkLazy = () => { setFace(); FIT.on = t >= T.dressA; FIT.kind = 'vest'; FIT.mud = mk;
    const P2 = defPose2(); const e = P2.eyes; e.blinkL = P.blink.l; e.blinkR = P.blink.r; e.lookX = P.gaze.x; e.lookY = P.gaze.y; e.wide = Math.max(0, (P.lid.l - 1) * 2); e.squint = P.squint || 0;
    P2.brows.Lraise = P.brow.l.r; P2.brows.Rraise = P.brow.r.r; P2.brows.Lfrown = -P.brow.l.i; P2.brows.Rfrown = -P.brow.r.i; P2.mouth.open = Math.min(0.35, P.mouth.open); P2.mouth.wide = P.mouth.wide; P2.mouth.smile = P.mouth.smile; P2.mouth.upperTeeth = P.mouth.open > 0.2 ? 1 : 0.2;
    P2.head.yaw = P.yaw || 0; P2.head.rot = (P.roll || 0) * 0.6; P2.chest.breath = P.breath || 0; P2.hairOv = hairAt(t, P.hair.sway); P2.hair.t = t; P2.hair.swayL = (P.hair.sway || 0) * 6; P2.hair.swayR = (P.hair.sway || 0) * 6; P2.skirt.t = t; P2.skirt.hem = 0.5;
    P2.noseStyle = 'D'; P2.noseK = 1.35;
    if (running(t) || walking(t)) { const spd = running(t) ? 3.0 : 1.5, ph = t * spd * Math.PI * 2, s = Math.sin(ph), amp = running(t) ? 1 : 0.45;
      P2.legL.r1 = 36 * s * amp; P2.legR.r1 = -36 * s * amp; P2.legL.r2 = (Math.sin(ph + 1.9) > 0 ? -55 * Math.sin(ph + 1.9) : 0) * amp; P2.legR.r2 = (Math.sin(ph + 1.9) < 0 ? 55 * Math.sin(ph + 1.9) : 0) * amp;
      P2.armL.r1 = -10 * s * amp; P2.armR.r1 = 10 * s * amp; P2.armL.r2 = (34 + 18 * s) * amp; P2.armR.r2 = -(34 - 18 * s) * amp; P2.chest.rot = running(t) ? 7 : 0; }
    if (t > T.cta3 - 0.3) { const k = clamp((t - T.cta3 + 0.3) / 0.3); const kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [800, 330], 1); P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; P2.handR.spread = 1.2; P2.armL.r1 = 0; P2.armL.r2 = 0; }
    return renderCharacter(P2); };
  const lzInner = (sc === 'cabin') ? '' : mkLazy();
  let lx = 540, ly = 1655, ls = NEWS, lrot = 0; const lvis = sc !== 'cabin';
  if (sc === 'home') lx = 330;
  if (sc === 'forest') { if (t < T.l4A) lx = lerp(-160, 360, ease((t - T.forestA) / (T.l4A - T.forestA))); else if (t < T.mariA) lx = 330; else if (t < T.runA) lx = 380; else if (t < T.pushA) lx = 560 + 30 * Math.sin(t * 6); else lx = 540;
    if (t >= T.pushA) { const u = clamp((t - T.pushA) / 0.55), v = clamp((t - (T.pushA + 0.55)) / 0.9); const fall = ease(u) * (1 - smooth(v)); lrot = 78 * fall; ly = 1655 + 200 * fall; lx += 60 * fall; } }
  if (sc === 'police') lx = lerp(-200, 470, ease((t - T.policeA) / 1.4));
  const lazyG = lvis ? `<g transform="translate(${f(lx)},${f(ly)}) rotate(${f(lrot)}) translate(${f(-lx)},${f(-ly)})"><g transform="translate(${f(lx - 512 * ls)},${f(ly - 1500 * ls)}) scale(${ls})"><use href="#lzSrc"/></g></g>` : '';
  const shadowL = lvis ? `<ellipse cx="${f(lx)}" cy="${f(ly - 6)}" rx="${f(300 * ls)}" ry="22" fill="#000" opacity="0.35"/>` : '';
  const mari = mariState(t); let mariG = '';
  if (mari && (sc === 'forest' || sc === 'police')) {
    if (mari.mode === 'burst') { const u = ease(clamp((t - T.mariA) / 1.0)); const mx = lerp(-300, 200, u); mariG = `<g transform="translate(${f(mx)},1413) scale(0.75)">${drawMariRun(t, { talk: MOUTHW('M', t), speed: 3.2 * (1 - 0.7 * smooth(clamp((t - T.mariA - 0.7) / 0.5))) })}</g>`; }
    else if (mari.mode === 'run') { const mx = t < T.pushA + 1.6 ? 150 : 170; mariG = `<g transform="translate(${f(mx)},${f(1413 + 4 * Math.sin(t * 12))}) scale(0.75)">${drawMariRun(t, { talk: 0, speed: 3.3 })}</g>`; }
    else { const u = ease(clamp((t - (T.policeA - 0.3)) / 1.4)); mariG = `<g transform="translate(${f(lerp(-300, 740, u))},1060) scale(0.85)"><ellipse cx="0" cy="700" rx="150" ry="22" fill="#000" opacity="0.3"/>${drawMari2({ mood: 'worry', t, part: 'body', mouthOpen: 0, hands: 'none', blink: blinkOf(t, 1.3) })}</g>`; }
  }
  let mG = ''; if (sc === 'forest' && t >= T.l4A - 0.4 && t < T.l8A + 0.3) { const ap = ease(clamp((t - (T.l4A - 0.4)) / 0.9)); const Pm = poseClip('idle', t); mG = `<g transform="translate(${f(lerp(1320, 800, ap) - 520 * 0.7)},${f(1650 - 1420 * 0.7)}) scale(0.7)">${renderM(Pm)}</g>`; }
  let mFront = '';
  if (sc === 'forest' && t >= T.l8A + 0.3 && t < T.pushA - 0.25) { const Pm = poseClip('run', t); const u = smooth((t - T.runA) / Math.max(1, T.pushA - T.runA)); const ms = lerp(0.42, 0.62, u), mx = lerp(960, 760, u); mG = `<g transform="translate(${f(mx - 520 * ms)},${f(1600 - 12 * Math.abs(Math.sin(t * 9)) - 1420 * ms)}) scale(${f(ms)})">${renderM(Pm)}</g>`; }
  if (sc === 'forest' && t >= T.pushA - 0.25 && t < T.pushA + 0.9) { const Pm = poseClip(t < T.pushA + 0.2 ? 'run' : 'idle', t); const u = smooth((t - (T.pushA - 0.25)) / 0.45); const ms = lerp(0.62, 0.8, u), mx = lerp(760, 880, u); mFront = `<g opacity="${(1 - clamp((t - T.pushA - 0.5) / 0.4)).toFixed(2)}" transform="translate(${f(mx - 520 * ms)},${f(1690 - 1420 * ms)}) scale(${f(ms)})">${renderM(Pm)}</g>`; }
    const off = (t >= T.policeA - 0.1 && sc === 'police') ? `<g transform="translate(170,900) scale(0.85)">${drawOfficer({ mood: 'serious', t, part: 'body', mouthOpen: MOUTHW('Q', t), hands: 'none', blink: blinkOf(t, 0.7) })}</g>` : '';
  const sx = scrollAt(t), fs = forestScene(t, sx, { dark: sc === 'police' ? 0.06 : 0.1, fog: sc === 'police' ? 0.15 : 0, lightX: lx });
  const par = (f2) => `translate(540,960) scale(${1 + (cam.z - 1) * f2}) translate(${-(540 + (cam.x - 540) * f2)},${-(960 + (cam.y - 960) * f2)})`;
  let bg = ''; let fgFront = '';
  if (sc === 'home') bg = `<g transform="${par(0.85)}"><image href="${platePng.home}" width="${W}" height="${H}" preserveAspectRatio="none"/></g>`;
  if (sc === 'forest') { bg = `<g transform="${par(0.9)}">${fs.back}</g>`; fgFront = `<g transform="${par(1.15)}">${fs.front}</g>`; }
  if (sc === 'police') bg = `<g transform="${par(0.9)}">${fs.back}<rect x="0" y="1140" width="${W}" height="${H - 1140}" fill="#161820" opacity="0.55"/>${patrol(t, 880, 1470, 0.95)}</g>`;
  const mudPuddle = (sc === 'forest' && t >= T.pushA - 1.2 && t < T.policeA - 0.2) ? `<g opacity="${clamp((t - (T.pushA - 1.2)) / 0.4).toFixed(2)}"><defs><radialGradient id="pud" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#5a3c1e"/><stop offset="0.7" stop-color="#3a2410"/><stop offset="1" stop-color="#3a2410" stop-opacity="0"/></radialGradient></defs><ellipse cx="560" cy="1650" rx="420" ry="70" fill="url(#pud)"/><ellipse cx="520" cy="1640" rx="220" ry="22" fill="#a07a4a" opacity="0.25"/></g>` : '';
  const splash = (sc === 'forest' && t >= T.pushA + 0.4 && t < T.pushA + 1.5) ? Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * Math.PI - Math.PI, u = clamp((t - T.pushA - 0.4) / 1.0), r2 = u * (120 + rnd(i) * 260), x = 600 + Math.cos(a) * r2, y = 1650 + Math.sin(a) * r2 * 1.4 + 450 * u * u; return `<circle cx="${f(x)}" cy="${f(y)}" r="${f((10 + rnd(i + 4) * 18) * (1 - u * 0.5))}" fill="#6a4524" opacity="${(0.9 * (1 - u)).toFixed(2)}"/>`; }).join('') : '';
  const worldInner = `${bg}<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})">${sc === 'cabin' ? cabinFg(t) : ''}${sc === 'home' ? closetSvg(t) : ''}${mudPuddle}${mG}${off}${mariG}${shadowL}${lazyG}${mFront}${splash}</g>${fgFront}`;
  const tr = transitionAt(t); const wrapW = (scl, dx, op) => `<g opacity="${op}" transform="translate(${540 + dx},960) scale(${scl}) translate(-540,-960)">${worldInner}</g>`;
  const glitch = (g) => g > 2 ? [0, 1, 2, 3].map((i) => `<rect x="0" y="${300 + i * 380 + Math.sin(t * 40 + i) * 40}" width="${W}" height="${50 + i * 14}" fill="#fff" opacity="${0.1 * Math.min(1, g / 20)}" transform="translate(${Math.sin(t * 77 + i) * g * 0.8},0)"/>`).join('') : '';
  const world0 = tr.on ? wrapW(tr.sc, 0, 1) + glitch(Math.abs(tr.gx)) + `<rect width="${W}" height="${H}" fill="#fff" opacity="${tr.fl}"/>` : worldInner;
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${sc === 'cabin' ? '#05000a' : '#02040a'}" stop-opacity="${sc === 'cabin' ? 0.6 : 0.4}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const chipTime = (sc === 'forest' && t >= T.forestA + 0.3 && t < T.l4A) ? `<g transform="translate(540,300)" opacity="${win(t, T.forestA + 0.3, T.l4A, 0.3, 0.3).toFixed(2)}"><rect x="-210" y="-60" width="420" height="120" rx="60" fill="#000" opacity="0.6"/><rect x="-210" y="-60" width="420" height="120" rx="60" fill="none" stroke="#5fe8c8" stroke-width="6"/><text x="0" y="22" font-family="Bungee" font-size="76" text-anchor="middle" fill="#fff">10:00 PM</text></g>` : '';
  const flashR = Math.max(0, 1 - Math.abs(t - T.dressA) / 0.18) * 0.55 + Math.max(0, 1 - Math.abs(t - T.pushA) / 0.1) * 0.5 + Math.max(0, 1 - Math.abs(t - T.mariA) / 0.12) * 0.25;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}${ALLDEFS}${MDEFS}${FDEFS}<defs><g id="lzSrc">${lzInner}</g></defs><defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter></defs>${world0}${vignette}${slateIntro(t - T.slateA)}
    ${chipTime}${insAll(t)}${camPhone(t)}
    ${t < T.vote ? captions(t) : ''}${endCard(t)}<rect width="${W}" height="${H}" fill="#fff" opacity="${flashR.toFixed(3)}"/>
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}

if (process.argv[2] === 'audit') {
  let n = 0, shrunk = 0, worst = 0;
  for (const l of DATA.lines) { const groups = []; let g = []; l.words.forEach(([ww]) => { g.push(ww); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(ww)) { groups.push(g); g = []; } }); if (g.length) groups.push(g);
    for (const gr of groups) { const txt = esc(gr.map((x) => x.replace(/\.\.\./g, '').toUpperCase()).join(' ')); let fs = 84, wd = inkWidth(txt, fs); if (wd > SAFE_W) { fs = Math.max(44, Math.floor(fs * SAFE_W / wd)); wd = inkWidth(txt, fs); shrunk++; } n++; worst = Math.max(worst, wd); } }
  console.log('grupos', n, 'ajustados', shrunk, 'ancho maximo', worst, '(limite', SAFE_W + ')');
} else if (process.argv[2] === 'plate') {
  const fsx = forestScene(3, 2400, { dark: 0.15, fog: 0.2, lightX: 540 }); writeFileSync(path.join(here, 'plates2d/forest20.png'), new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${FDEFS}<defs><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter></defs>${fsx.back}${fsx.front}</svg>`, ropt).render().asPng()); console.log('plate ok');
} else if (process.argv[2] === 'preview') {
  for (const s of process.argv.slice(3)) writeFileSync(path.join(B, `p_${s}.png`), frame(parseFloat(s)));
  console.log('preview ok', 'DUR', DUR.toFixed(2), 'frames', Math.round(DUR * FPS));
} else {
  const a0 = parseInt(process.argv[2] ?? '0'), total = Math.round(DUR * FPS), a1 = process.argv[3] && parseInt(process.argv[3]) >= 0 ? Math.min(parseInt(process.argv[3]), total) : total;
  const out = process.argv[4] || path.join(B, 'video_mudo.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
