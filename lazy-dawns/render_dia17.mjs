// Lazy Dawns - DIA 17: "Ella no sabe que la siguen" (intro de M, clinica de ojos, lentes negro cafe, agua en la calle, Will). Todo 2D.
// Uso: node render_dia16.mjs preview 5 12 ...   |   node render_dia16.mjs <inicio> <fin> <salida.mp4>   |   node render_dia16.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, hand } from './lazy_lib.mjs';
import { drawLazy, LASHX } from './rig.mjs';
import { handsToTargets, salonTool, armIK } from './chars.mjs';
import { drawIvana, drawWill } from './chars17.mjs'; import { dripsFx } from './drips17.mjs'; import { LOOK, MK, JAW } from './rig2d/character.mjs'; import { EYEX } from './rig.mjs'; import { drawMontes, drawNuria } from './chars13.mjs'; import './chars15.mjs'; import { applyFinalFace, resetFace } from './face_final.mjs'; import { renderM } from './rig2d/m_character.mjs'; import { poseClip } from './rig2d/m_clips.mjs';


import { renderCharacter, defaultPose as defPose2, ik2, SK as SK2, ALLDEFS, NAILS } from './rig2d/character.mjs';
import { MDEFS } from './rig2d/m_character.mjs';
import { makeDirector } from './director_d17.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia17');
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
const T = {
  slateA: L.i2.end + 0.2, hookA: L.l1.start, ivaA: L.l3.start - 0.6, sitA: L.l4.start - 1.7, scanA: L.l4.start, lensA: L.l5.start, dropA: L.l6.start, closeA: L.l7.start + 0.3, openA: w('l7', 'abrelos') - 0.3,
  revealA: L.l8.start, leaveA: L.l9.start - 0.2, balcA: w('l10', 'balcon') - 0.5, splashA: w('l10', 'volco'), dripA: L.l11.start, laughA: L.l12.start, willA: L.l13.start - 1.1, coatA: w('l13', 'toma'), n14A: L.l14.start,
  vote: w('l16', 'Que') - 0.1, optA: w('l16', 'maquillaje'), optB: w('l16', 'peinado'), cta1: w('l16', 'Comenta'), cta2: w('l16', 'sigueme'),
};
T.slateEnd = T.slateA + 3.7; T.hitA = T.splashA + 0.8; T.mirrorA = T.revealA + 0.5; T.mirrorB = T.leaveA - 0.3; T.sootA = T.leaveA; T.homeA = T.hookA; T.walks = [[T.leaveA + 0.5, T.hitA - 0.1]];
T.scanIA = L.l4.start + 0.2; T.scanIB = L.l4.end - 0.1; T.lensIA = L.l5.start + 0.2; T.lensIB = L.l5.end - 0.1; T.dropIA = L.l6.start + 0.2; T.dropIB = L.l6.end - 0.05;
T.scenes = [T.slateEnd, T.hookA, T.ivaA, T.scanA, T.lensA, T.dropA, T.closeA, T.openA, T.revealA, T.leaveA, T.balcA, T.splashA, T.hitA, T.dripA, T.laughA, T.willA, T.coatA, T.n14A, T.vote];
const OBJN = {};
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });
const FULL = JSON.parse(JSON.stringify(LOOK));

const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates2d', n + '.png')));
const platePng = { lair: PL('lair17'), clinic: PL('eyeclinic17'), street: PL('street17') };

const lazyThumb = (() => { resetFace(); const P = defPose2(); P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1; P.eyes.lookX = 0.2; P.mouth.smile = 0.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${charDefs}${ALLDEFS}<rect width="1024" height="1500" fill="#2a1830"/>${renderCharacter(P)}</svg>`; return b64(new Resvg(svg, { fitTo: { mode: 'width', value: 700 } }).render().asPng()); })();

// ---------------- escenas, personajes y camara (todo 2D) ----------------
const sceneAt = (t) => (t < T.slateA + 2.0 ? 'lair' : t < T.leaveA ? 'clinic' : 'street');
const NEWS = 0.7, SIT_DROP = 110, HEAD_CY = 788;
const standA = T.leaveA - 1.0;
const seatedK = (t) => ease((t - T.sitA) / 0.7) * (1 - ease((t - standA) / 0.7));
const toLocal = (ch, wx, wy) => ({ x: (wx - ch.x) / ch.s, y: (wy - ch.y) / ch.s });
const ivaCh = (t) => ({ x: 205 - 420 * (1 - ease((t - T.ivaA) / 1.3)), y: 905, s: 0.78 });
const wilCh = (t) => ({ x: 1500 - 700 * ease((t - T.willA) / 1.6), y: 885, s: 0.85 });
function ivaState(t) { if (t < T.ivaA - 0.3 || sceneAt(t) !== 'clinic') return null; const ch = ivaCh(t); let mood = 'happy', hands = 'clasp', tool = 'none', ex = {};
  const at = (k, rot, sc) => { const Lc = toLocal(ch, 500, 905); tool = k; ex = { elbowLow: true, toolSide: 1, toolX: Lc.x, toolY: Lc.y, toolR: rot, toolS: sc }; };
  if (t >= T.scanA && t < T.lensA) { mood = 'focus'; hands = 'none'; at('scanner', 78, 0.45); }
  if (t >= T.lensA && t < T.dropA) { mood = 'focus'; hands = 'none'; at('lensTw', 78, 0.7); }
  if (t >= T.dropA && t < T.closeA) { mood = 'focus'; hands = 'none'; at('dropper', 78, 0.6); }
  if (t >= T.closeA && t < T.openA) { mood = 'calm'; hands = 'clasp'; } if (t >= T.openA) { mood = 'proud'; hands = 'clasp'; } if (t >= T.revealA) mood = 'grin';
  return { mood, hands, tool, ch, ...ex }; }
function wilState(t) { if (t < T.willA - 0.2 || sceneAt(t) !== 'street') return null; const ch = wilCh(t); let mood = 'worry', hands = 'none', tool = 'none', ex = {};
  if (t >= T.willA + 1.4) mood = 'worry'; if (t >= T.coatA - 0.3) { tool = 'coat'; ex = { elbowLow: true, toolSide: -1, toolX: -170, toolY: 340, toolR: 0, toolS: 1.0 }; mood = 'happy'; } if (t >= T.n14A) mood = 'happy';
  return { mood, hands, tool, ch, ...ex }; }
const MOUTHW = (who, t) => { const l = DATA.lines.find((q) => q.who === who && t >= q.start - 0.05 && t <= q.end + 0.1); if (!l) return 0; for (const [ww, s, e] of l.words) if (t >= s - 0.02 && t <= e + 0.04) { const k = (t - s) / Math.max(0.12, e - s); return 0.28 + 0.62 * Math.abs(Math.sin((t - s) * 21 + ww.length)) * (0.7 + 0.3 * Math.sin(k * 3.14)); } return 0.04; };
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
const CAM = [[0, 1.0, 540, 980], [T.slateA, 1.22, 540, 900], [T.slateA + 2.0, 1.0, 540, 960], [T.hookA, 1.08, 540, 980], [T.ivaA, 1.06, 440, 960], [T.sitA + 0.6, 1.12, 540, 1000], [T.scanA, 1.4, 540, 880], [T.lensA, 1.4, 540, 880], [T.dropA, 1.4, 540, 880], [T.closeA, 1.5, 540, 860], [T.openA - 0.1, 1.7, 540, 850], [T.revealA, 1.3, 540, 900], [T.mirrorB, 1.0, 540, 960], [T.leaveA, 1.0, 540, 960], [T.balcA, 1.0, 600, 960], [T.splashA, 1.06, 560, 930], [T.hitA, 1.35, 545, 900], [T.dripA, 1.6, 540, 860], [T.laughA, 1.0, 600, 940], [T.willA, 1.05, 680, 960], [T.n14A, 1.25, 660, 900], [T.vote - 0.2, 1.1, 540, 960], [9999, 1.1, 540, 960]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.hitA, T.hitA + 1.0, 0.02, 0.7) * 14 + win(t, T.laughA, T.laughA + 1.2, 0.1, 0.6) * 4 + win(t, T.slateA + 0.55, T.slateA + 1.1, 0.02, 0.4) * 8; const sway = Math.sin(t * 0.55) * 8;
  return { z: lerp(a[1], b[1], u) * (1 + 0.012 * Math.sin(t * 0.7)), x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6 + sway, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}

// ---------------- fuego, humo, aspersores, alarma (2D animado, con degradados) ----------------
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
// M (rig 2D articulado) con lata de gasolina y encendedor
function mFigure(t, sc) { if (sc !== 'hall') return ''; let x = 540, y = 1000, s = 0.28, clip = 'walk', tt = t, flip = 1;
  if (t < T.mTalkA) { const u = smooth((t - T.chuyA) / (T.mTalkA - T.chuyA)); y = lerp(1005, 1190, u); s = lerp(0.26, 0.42, u); clip = 'walk'; tt = t - T.chuyA; }
  else if (t < T.boomA + 1.2) { y = 1190; s = 0.42; clip = t < T.mTalkA + 3.2 ? 'laugh' : 'idle'; tt = t < T.mTalkA + 3.2 ? t - T.mTalkA : t; }
  else if (t < T.hall2A) { const u = ease((t - T.boomA - 1.2) / 1.2); y = lerp(1190, 1020, u); s = lerp(0.42, 0.28, u); clip = 'walk'; tt = t; }
  else { const u = smooth((t - T.hall2A) / (T.jumpA - T.hall2A)); y = lerp(1020, 990, u); s = lerp(0.28, 0.24, u); clip = 'walk'; tt = t * 1.6; if (t >= T.jumpA) return ''; }
  const P = poseClip(clip, Math.max(0, tt)); const can = t < T.boomA ? `<g transform="translate(722,820) rotate(-8)"><rect x="-44" y="-10" width="88" height="110" rx="10" fill="#d1182f" stroke="${OUT}" stroke-width="7"/><rect x="-18" y="-34" width="36" height="28" rx="6" fill="#8a0c1c" stroke="${OUT}" stroke-width="5"/><path d="M-30,30 H30 M-30,60 H30" stroke="#fff" stroke-width="6" opacity="0.7"/></g>` : '';
  const fl = (t >= T.lightA && t < T.boomA) ? `<g transform="translate(330,800)"><ellipse cx="0" cy="-26" rx="${f(26 + 8 * Math.sin(t * 20))}" ry="${f(46 + 10 * Math.sin(t * 17))}" fill="url(#fOr)" filter="url(#fb2)"/><ellipse cx="0" cy="-60" rx="80" ry="80" fill="url(#fGlow)" opacity="0.8"/><rect x="-16" y="0" width="32" height="46" rx="5" fill="#cfd4da" stroke="${OUT}" stroke-width="6"/></g>` : '';
  const sh = `<ellipse cx="${x}" cy="${y + 6}" rx="${f(180 * s)}" ry="${f(26 * s)}" fill="#000" opacity="0.35" filter="url(#fb)"/>`;
  return `${sh}<g transform="translate(${x},${y}) scale(${s}) translate(-520,-1385)">${renderM(P)}${can}${fl}</g>`; }
const tintFire = (t, k) => k > 0 ? `<rect width="${W}" height="${H}" fill="#ff6a10" opacity="${(0.1 * k * (0.7 + 0.3 * Math.sin(t * 15))).toFixed(3)}"/>` : '';


let CURPLATE = null;
function wrapIns(t, a, b, inner, tint = '#1a0e24') { const k = win(t, a, b, 0.3, 0.3); if (k <= 0) return ''; const u = clamp((t - a) / (b - a)), s = 1 + 0.12 * u, id = Math.round(a * 10); const e = smooth(k); const entering = u < 0.5;
  const xe = lerp(-120, W + 720, e);
  const pts = entering ? `-400,0 ${xe},0 ${xe - 420},${H} -400,${H}` : `${W + 400},0 ${W - xe},0 ${W - xe - 420},${H} ${W + 400},${H}`;
  const edge = entering ? `M${xe},0 L${xe - 420},${H}` : `M${W - xe},0 L${W - xe - 420},${H}`;
  return `<clipPath id="ic${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#ic${id})"><image href="${CURPLATE}" x="-60" y="-60" width="${W + 120}" height="${H + 120}" preserveAspectRatio="xMidYMid slice"/><rect width="${W}" height="${H}" fill="#06040c" opacity="0.5"/><radialGradient id="ig${id}" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient><rect width="${W}" height="${H}" fill="url(#ig${id})"/><g transform="translate(540,900) scale(${0.9 + 0.1 * e}) translate(-540,-900)"><g transform="translate(0,80)"><g transform="translate(540,880) scale(${s}) translate(-540,-880)">${inner(u)}</g></g></g></g>${k < 1 ? `<path d="${edge}" stroke="#fff" stroke-width="${26 * (1 - k)}" opacity="0.85"/><path d="${edge}" stroke="#7dd3fc" stroke-width="${60 * (1 - k)}" opacity="0.25"/>` : ''}`; }
const insLabel = (txt, col = '#ffe14d', y = 1320, fs = 78) => `<text x="540" y="${y - 118}" font-family="Anton" font-size="${fitFs(txt, 940, fs)}" text-anchor="middle" fill="${col}" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="3">${txt}</text>`;
const sparkle = (x, y, s, o = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><path d="M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z" fill="${c}"/></g>`;
const SPK = (u, n, x0, y0, wv, hv, op = 1) => [...Array(n)].map((_, i) => sparkle(x0 + (i * 83) % wv, y0 + (i * 57) % hv, 0.5 + 0.5 * Math.sin(u * 14 + i), op * (0.5 + 0.5 * Math.sin(u * 9 + i * 2)))).join('');



const OBJDEFS = `<defs><radialGradient id="ir17" cx="0.5" cy="0.5" r="0.5"><stop offset="0.25" stop-color="#6a4426"/><stop offset="0.7" stop-color="#2a170c"/><stop offset="1" stop-color="#0e0805"/></radialGradient><radialGradient id="ir17h" cx="0.5" cy="0.5" r="0.5"><stop offset="0.8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></radialGradient><linearGradient id="bl17" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ff0ea" stop-opacity="0"/><stop offset="0.5" stop-color="#7ff0ea" stop-opacity="0.9"/><stop offset="1" stop-color="#7ff0ea" stop-opacity="0"/></linearGradient><linearGradient id="wt17" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fcdf5" stop-opacity="0.85"/><stop offset="0.5" stop-color="#e4f5ff" stop-opacity="0.95"/><stop offset="1" stop-color="#6fb4e8" stop-opacity="0.85"/></linearGradient><linearGradient id="sk17" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b87a52"/><stop offset="0.5" stop-color="#e0a878"/><stop offset="1" stop-color="#b87a52"/></linearGradient><linearGradient id="gl17" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><filter id="wb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
const irisSvg = (r) => { let fb = ''; for (let i = 0; i < 80; i++) { const a = i / 80 * 6.2832, r0 = r * 0.42, r1 = r * 0.97; fb += `<path d="M${f(Math.cos(a) * r0)},${f(Math.sin(a) * r0)} L${f(Math.cos(a + 0.03) * r1)},${f(Math.sin(a + 0.03) * r1)}" stroke="${i % 2 ? '#d8aa70' : '#0a0402'}" stroke-opacity="${i % 2 ? 0.2 : 0.35}" stroke-width="${i % 5 === 0 ? r * 0.012 + 0.6 : r * 0.006 + 0.4}"/>`; } return `<circle r="${r}" fill="url(#ir17)"/>${fb}<circle r="${r}" fill="url(#ir17h)"/><circle r="${r}" fill="none" stroke="#0e0805" stroke-width="${r * 0.04}"/><circle r="${f(r * 0.42)}" fill="none" stroke="#c4903e" stroke-opacity="0.5" stroke-width="${r * 0.03}"/><circle r="${f(r * 0.34)}" fill="#060302"/><circle cx="${f(-r * 0.3)}" cy="${f(-r * 0.34)}" r="${f(r * 0.17)}" fill="#fff"/><circle cx="${f(r * 0.28)}" cy="${f(r * 0.3)}" r="${f(r * 0.07)}" fill="#fff" opacity="0.85"/>`; };
const EYEP = 'M-250,10 C-150,-150 150,-170 260,-6 C150,150 -120,160 -250,10Z';
const bigEye = (shine = 0, lashes = 1) => { let la = ''; if (lashes) for (let i = 0; i < 30; i++) { const t0 = i / 29, x = -240 + t0 * 490, y = -52 - 100 * Math.sin(Math.PI * Math.min(1, t0 * 0.95 + 0.04)) + 6 + 28 * t0, len = 38 + 30 * Math.sin(Math.PI * t0) + 16 * t0; la += `<path d="M${f(x)},${f(y)} q${f(8 + t0 * 14)},${f(-len * 0.6)} ${f(14 + t0 * 22)},${f(-len)}" stroke="#0a0406" stroke-width="${(4.2 - t0 * 1.2).toFixed(1)}" stroke-linecap="round" fill="none"/>`; }
  return `<clipPath id="ep17"><path d="${EYEP}"/></clipPath><path d="${EYEP}" fill="#fffaf2" stroke="#0e0805" stroke-width="8"/><g clip-path="url(#ep17)"><g transform="translate(0,6)">${irisSvg(112)}</g><path d="M-260,-60 C-120,-200 150,-210 270,-40 L270,-120 L-260,-120Z" fill="#000" opacity="0.18"/>${shine ? `<ellipse cx="${f(-60 + 140 * shine)}" cy="-20" rx="70" ry="${f(14 + 10 * shine)}" fill="#fff" opacity="${(0.35 * (1 - Math.abs(shine - 0.5) * 2)).toFixed(2)}" filter="url(#wb)"/>` : ''}</g>${la}`; };
function obj2d(kind, u) { const pu = 0.5 + 0.5 * Math.sin(u * 22);
  if (kind === 'scan') { const sy = -150 + 300 * ((u * 1.5) % 1); return `<g transform="translate(540,760) scale(1.5)">${bigEye(0)}<g clip-path="url(#ep17)"><rect x="-280" y="${f(sy - 22)}" width="560" height="44" fill="url(#bl17)"/></g><g stroke="#7ff0ea" stroke-width="2.4" fill="none" opacity="0.8"><circle cx="0" cy="6" r="130" stroke-dasharray="8 8"/><circle cx="0" cy="6" r="60" stroke-dasharray="4 6"/><path d="M-250,6 H250 M0,-140 V150" stroke-dasharray="10 8"/></g>${[-180, 0, 180].map((x, i) => `<text x="${x}" y="${190 + (i % 2) * 22}" font-family="Anton" font-size="28" text-anchor="middle" fill="#7ff0ea">${['Ø 11.8', 'Ø 12.4', 'Ø 11.9'][i]} mm</text>`).join('')}</g>`; }
  if (kind === 'lens') { const k = ease(u * 2.2); return `<g transform="translate(540,780)"><path d="M-110,560 L-96,180 Q0,60 96,180 L110,560Z" fill="url(#sk17)" stroke="#12090a" stroke-width="8" stroke-linejoin="round"/><path d="M-70,300 q70,-30 140,0" stroke="#7a4a2a" stroke-width="4" fill="none" opacity="0.5"/><g transform="translate(0,${f(130 - 10 * (1 - k))}) rotate(${f(u * 40)}) scale(${f(0.7 + 0.3 * k)})"><circle r="170" fill="#cfefff" opacity="0.35"/>${irisSvg(158)}<circle r="158" fill="none" stroke="#dff4ff" stroke-width="6" opacity="0.7"/><path d="M-100,-100 A140,140 0 0 1 20,-136" stroke="url(#gl17)" stroke-width="12" fill="none" stroke-linecap="round"/></g></g>`; }
  const fall = clamp((u - 0.42) / 0.3), grow = clamp(u / 0.42), hit = clamp((u - 0.72) / 0.28); const dy = -330 + fall * fall * 340;
  return `<g transform="translate(540,830)"><g transform="translate(0,140) scale(1.2)">${bigEye(hit > 0 ? hit : 0)}</g><g transform="translate(0,-420)"><path d="M-34,0 L34,0 L26,150 L-26,150Z" fill="#d7eaf5" stroke="#12090a" stroke-width="6" stroke-linejoin="round"/><rect x="-40" y="-120" width="80" height="124" rx="30" fill="#22c6d8" stroke="#12090a" stroke-width="6"/><path d="M-12,150 L0,196 L12,150Z" fill="#cfefff" stroke="#12090a" stroke-width="4"/></g>${fall < 1 && u < 0.78 ? `<ellipse cx="0" cy="${f(fall > 0 ? dy : -222 + grow * 10)}" rx="${f(8 + 10 * grow)}" ry="${f(11 + 16 * grow)}" fill="url(#wt17)" stroke="#fff" stroke-width="2"/>` : ''}${hit > 0 ? [0, 1, 2].map((i) => `<ellipse cx="0" cy="40" rx="${f(30 + (hit + i * 0.2) * 150)}" ry="${f(10 + (hit + i * 0.2) * 40)}" fill="none" stroke="#fff" stroke-width="4" opacity="${clamp(1 - hit - i * 0.2 + 0.2).toFixed(2)}"/>`).join('') : ''}</g>`; }
const ins2d = (t, a, b, kind, label, col) => wrapIns(t, a, b, (u) => `${obj2d(kind, u)}${SPK(u, 9, 200, 260, 680, 520, 0.7)}${insLabel(label, col, 1330)}`);
const insScan = (t) => ins2d(t, T.scanIA, T.scanIB, 'scan', 'MAPA DE LA MIRADA', '#9ffaf4');
const insLens = (t) => ins2d(t, T.lensIA, T.lensIB, 'lens', 'LENTES A MEDIDA', '#e9d6ff');
const insDrop = (t) => ins2d(t, T.dropIA, T.dropIB, 'drops', 'GOTAS DE BRILLO', '#bff3ff');

const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const fitFs = (txt, maxW, fs0) => { let fs = fs0, wd = inkWidth(esc(txt), fs); if (wd > maxW) fs = Math.max(26, Math.floor(fs * maxW / wd)); return fs; };
const SPEAK = { N: { col: '#ffe14d', name: null }, K: { col: '#c4b5fd', name: 'DRA. IVANA' }, Y: { col: '#7dd3fc', name: 'WILL' }, D: { col: '#ff5a6a', name: 'M' } };
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



const stepBanners = [['1', 'MAPA DE LA MIRADA', T.scanA, T.lensA - 0.3, '#9ffaf4'], ['2', 'LENTES NEGRO CAFÉ', T.lensA, T.dropA - 0.3, '#e9d6ff'], ['3', 'GOTAS DE BRILLO', T.dropA, T.closeA - 0.2, '#bff3ff']];
const ICON = {
  MAQUILLAJE: `<rect x="-13" y="-4" width="26" height="30" rx="4" fill="#111827" stroke="${OUT}" stroke-width="4"/><rect x="-10" y="-30" width="20" height="28" rx="3" fill="#b0206a" stroke="${OUT}" stroke-width="4"/><path d="M-10,-30 L10,-30 L6,-40 L-6,-42Z" fill="#d63a8a" stroke="${OUT}" stroke-width="3"/><circle cx="26" cy="14" r="10" fill="#f472b6" stroke="${OUT}" stroke-width="3"/>`,
  PEINADO: `<path d="M-20,-30 C-38,-8 -34,18 -24,34 C-12,26 -10,4 -6,-10 C-4,-22 -12,-30 -20,-30Z" fill="#6a4026" stroke="${OUT}" stroke-width="3.4" stroke-linejoin="round"/><path d="M-6,-32 C-24,-10 -18,16 -10,34" stroke="#c98f5c" stroke-width="3" fill="none"/><g transform="translate(14,2) rotate(18)"><rect x="-8" y="-30" width="16" height="64" rx="5" fill="#f472b6" stroke="${OUT}" stroke-width="3.4"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M-8,${-24 + i * 11} h-10" stroke="${OUT}" stroke-width="3.4" stroke-linecap="round"/>`).join('')}</g>`,
};

function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  let s = `<defs><radialGradient id="ecg" cx="0.5" cy="0.42" r="0.8"><stop offset="0" stop-color="#3a1030"/><stop offset="1" stop-color="#08040c"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#ecg)" opacity="${k}"/>${[...Array(30)].map((_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 311) % H}" r="${1.5 + (i % 3)}" fill="#ffb84a" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * k}"/>`).join('')}<text x="540" y="${690 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ HACEMOS</text><text x="540" y="${776 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">MAÑANA?</text>`;
  const a = pop(t, T.optA, 0.35), b = pop(t, T.optB, 0.35);
  if (a > 0) s += `<g transform="translate(540,960) scale(${a})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON.MAQUILLAJE}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('A · ARREGLAR EL MAQUILLAJE', 620, 58)}" text-anchor="middle" fill="${OUT}">A · ARREGLAR EL MAQUILLAJE</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1136) scale(${b})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON.PEINADO}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('B · ARREGLAR EL PEINADO', 620, 58)}" text-anchor="middle" fill="#fff">B · ARREGLAR EL PEINADO</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1400) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1510) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 18</text></g>`;
  return s;
}
const TRANS = [[T.slateA + 3.4, 'in', 0.6], [T.leaveA, 'cut', 0.6], [T.hitA, 'cut', 0.25]];
const redEyes = (t) => { const o = 0.5 + 0.5 * Math.sin(t * 2.2), bl = (t % 3.1) < 0.14 ? 0.1 : 1; return [-1, 1].map((s) => `<g transform="translate(${540 + s * 130},300)"><ellipse cx="0" cy="0" rx="110" ry="${f(56 * bl)}" fill="url(#fGlow)" opacity="${(0.5 + 0.3 * o).toFixed(2)}"/><path d="M-52,0 Q0,${f(-34 * bl)} 52,0 Q0,${f(30 * bl)} -52,0Z" fill="#ff2a3a"/><ellipse cx="0" cy="0" rx="7" ry="${f(24 * bl)}" fill="#12040a"/></g>`).join(''); };
// ---------------- portada animada 2D del dia (claqueta articulada, fondo con movimiento) ----------------
function slateIntro(t) { const END = 3.7; if (t < 0 || t > END) return ''; const ex = ease(clamp((t - 2.9) / 0.8)); const k = 1 - ex; const clap = t < 0.55 ? 1 - ease(t / 0.55) : t < 0.7 ? 0 : 0;
  const ang = t < 0.45 ? -34 * (1 - ease(t / 0.45)) - 0 : (t < 0.62 ? -34 * (1 - ease(t / 0.45)) : 0); const flash = clamp((t - 0.55) / 0.06) * (1 - clamp((t - 0.62) / 0.3));
  const rays = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * 6.283 + t * 0.15; return `<path d="M540,760 L${f(540 + Math.cos(a) * 1500)},${f(760 + Math.sin(a) * 1500)} L${f(540 + Math.cos(a + 0.11) * 1500)},${f(760 + Math.sin(a + 0.11) * 1500)}Z" fill="#ff8a3a" opacity="${(0.07 + 0.04 * Math.sin(t * 2 + i)).toFixed(3)}"/>`; }).join('');
  const emb = Array.from({ length: 60 }, (_, i) => { const age = (t * (0.12 + (i % 5) * 0.04) + rnd(i)) % 1; return `<circle cx="${f(rnd(i + 3) * W + Math.sin(t * 2 + i) * 24)}" cy="${f(H - age * (H + 100))}" r="${(1.5 + rnd(i + 9) * 3).toFixed(1)}" fill="${i % 3 ? '#ffb84a' : '#ff5a2a'}" opacity="${((1 - age) * 0.9).toFixed(2)}"/>`; }).join('');
  const tl = ['ELLA NO SABE', 'QUE LA SIGUEN']; const fs = Math.min(...tl.map((l) => fitFs(l, 640, 64)));
  const board = `<g transform="translate(540,${f(900 + 40 * ex)}) scale(${f(1 + 0.5 * ex)})" opacity="${k.toFixed(2)}"><ellipse cx="0" cy="470" rx="400" ry="40" fill="#000" opacity="0.4" filter="url(#fb)"/><rect x="-360" y="-240" width="720" height="640" rx="22" fill="url(#slB)" stroke="${OUT}" stroke-width="10"/><path d="M-360,-80 H360 M-360,200 H360" stroke="#fff" stroke-opacity="0.7" stroke-width="5"/><text x="-330" y="-176" font-family="Bungee" font-size="${fitFs('LAZY DAWNS', 640, 50)}" fill="#fff">LAZY DAWNS</text><text x="-330" y="-112" font-family="Bungee" font-size="${fitFs('DÍA 17/30', 640, 50)}" fill="#ffb84a">DÍA 17/30</text>${tl.map((l, i) => `<text x="-330" y="${i * 86 + 10}" font-family="Righteous" font-size="${fs}" fill="#fff">${esc(l)}</text>`).join('')}<text x="-330" y="266" font-family="Righteous" font-size="30" fill="#9ca3af">TOMA 1 · ESCENA A</text>
    <g transform="translate(-360,-240) rotate(${f(ang)} 0 0)"><rect x="0" y="-90" width="720" height="90" rx="14" fill="#f5f5f5" stroke="${OUT}" stroke-width="8"/>${[...Array(9)].map((_, i) => `<path d="M${i * 88 - 10},-84 l60,0 l-34,78 l-60,0Z" fill="#7a0a18"/>`).join('')}</g><circle cx="-360" cy="-240" r="14" fill="#cfd4da" stroke="${OUT}" stroke-width="5"/>
    <rect x="-360" y="-240" width="720" height="90" rx="14" fill="#f5f5f5" stroke="${OUT}" stroke-width="8" opacity="0"/></g>`;
  return `<g><defs><linearGradient id="slB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a0f22"/><stop offset="1" stop-color="#1c0610"/></linearGradient><radialGradient id="slBg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#7a1424"/><stop offset="0.5" stop-color="#2a0814"/><stop offset="1" stop-color="#07030a"/></radialGradient></defs>${FDEFS}<rect width="${W}" height="${H}" fill="url(#slBg)" opacity="${k.toFixed(2)}"/><g opacity="${k.toFixed(2)}">${rays}</g><g opacity="${k.toFixed(2)}">${redEyes(t)}</g>${emb}${board}<rect width="${W}" height="${H}" fill="#fff" opacity="${(flash * 0.5).toFixed(3)}"/></g>`; }

function transitionAt(t) { for (const [t0, kind, d] of TRANS) { const a = t0 - (kind === 'cut' ? d / 2 : 0), p = (t - a) / d; if (p < 0 || p > 1) continue;
    if (kind === 'in') { const e = ease(p); return { on: true, ghost: p < 0.85, sc: 1.4 - 0.4 * e, v: (1 - e), fl: 0.35 * Math.max(0, 1 - p * 3), gx: 0 }; }
    const e = smooth(p), mid = 1 - Math.abs(e - 0.5) * 2; const sc = e < 0.5 ? 1 + e * 2 * 0.2 : 1.2 - (e * 2 - 1) * 0.2; return { on: true, ghost: true, sc, v: mid, fl: 0.5 * mid * mid, gx: (e < 0.5 ? 1 : -1) * mid * 40 }; } return { on: false }; }

// espejo dorado con comparacion antes / despues (cortina que barre)
function mirrorCard(t) { const a = T.mirrorA, b = T.mirrorB; const k = win(t, a, b, 0.4, 0.4); if (k <= 0) return ''; const u = clamp((t - T.revealA + 0.3) / 1.4); const cx = lerp(300, 780, ease(u));
  resetFace(); const before = ''; const mk = () => { const P2 = defPose2(); P2.noseStyle = 'D'; P2.noseK = 1.35; P2.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P2.hair.t = t; P2.skirt.t = t; P2.eyes.lookX = 0.1; P2.mouth.smile = 0.8; P2.mouth.open = 0.1; return renderCharacter(P2); };
  resetFace(); const A = mk(); applyFinalFace(); const Bf = mk(); if (t < T.revealA) resetFace();
  const S = 1.95; const ctr = `translate(${540 - 512 * S},${720 - 262 * S}) scale(${S})`;
  return `<g opacity="${k.toFixed(2)}"><rect width="${W}" height="${H}" fill="#05030a" opacity="0.6"/><g transform="translate(0,${f(40 * (1 - k))})"><defs><clipPath id="mrC"><ellipse cx="540" cy="760" rx="400" ry="560"/></clipPath><linearGradient id="mrG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d98a"/><stop offset="0.5" stop-color="#b8860b"/><stop offset="1" stop-color="#fff0b0"/></linearGradient><clipPath id="mrL"><rect x="0" y="0" width="${f(cx + 0)}" height="${H}"/></clipPath><clipPath id="mrR"><rect x="${f(cx)}" y="0" width="${f(W - cx)}" height="${H}"/></clipPath></defs>
    <ellipse cx="540" cy="760" rx="420" ry="580" fill="url(#mrG)" stroke="${OUT}" stroke-width="10"/><ellipse cx="540" cy="760" rx="400" ry="560" fill="#20283a"/><g clip-path="url(#mrC)"><g clip-path="url(#mrL)"><g transform="${ctr}">${A}</g></g><g clip-path="url(#mrR)"><g transform="${ctr}">${Bf}</g></g><path d="M${f(cx)},200 V1320" stroke="#fff" stroke-width="5" opacity="0.8"/><circle cx="${f(cx)}" cy="760" r="26" fill="#fff" stroke="${OUT}" stroke-width="5"/><text x="300" y="260" font-family="Anton" font-size="44" fill="#fff" stroke="${OUT}" stroke-width="8" paint-order="stroke" text-anchor="middle" opacity="${(1 - ease(u)).toFixed(2)}">ANTES</text><text x="780" y="260" font-family="Anton" font-size="44" fill="#ffe14d" stroke="${OUT}" stroke-width="8" paint-order="stroke" text-anchor="middle" opacity="${ease(u).toFixed(2)}">DESPUÉS</text></g>${SPK(clamp((t - a) / 6), 12, 160, 220, 760, 1000, 0.85)}</g></g>`; }

// ---------------- balcon de M, agua y salpicaduras ----------------
const BAL = { x: 830, y: 578, s: 0.17 };
function balcony(t) { if (sceneAt(t) !== 'street' || t < T.balcA) return ''; const k = ease((t - T.balcA) / 0.5); const clip = t >= T.laughA ? 'laugh' : 'idle', tt = t >= T.laughA ? t - T.laughA : t; const P = poseClip(clip, Math.max(0, tt));
  const tilt = t < T.splashA - 0.3 ? 0 : 105 * smooth((t - (T.splashA - 0.3)) / 0.8); const bk = `<g transform="translate(724,520) rotate(${f(-tilt)})"><path d="M-46,-6 L46,-6 L34,86 L-34,86Z" fill="#9aa4b0" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-6" rx="46" ry="9" fill="#3a4450" stroke="${OUT}" stroke-width="4"/><path d="M-44,-6 Q0,-70 44,-6" stroke="#5a6470" stroke-width="5" fill="none"/><path d="M-30,10 H30 M-28,38 H28" stroke="#fff" stroke-width="3" opacity="0.5"/></g>`;
  return `<g opacity="${k.toFixed(2)}"><g transform="translate(${BAL.x},${f(BAL.y + 30 * (1 - k))}) scale(${BAL.s}) translate(-520,-1385)">${renderM(P)}</g>${bk}</g>`; }
function waterFx(t) { if (sceneAt(t) !== 'street') return ''; const a = T.splashA, hit = T.hitA; let s = '';
  const P0 = [700, 534], P1 = [640, 600], P2 = [548, 738]; const at = (u) => { const m = 1 - u; return [m * m * P0[0] + 2 * m * u * P1[0] + u * u * P2[0], m * m * P0[1] + 2 * m * u * P1[1] + u * u * P2[1] + 160 * u * u]; };
  const head = clamp((t - a) / 0.8), tail = clamp((t - (a + 0.6)) / 1.0); if (head > 0 && tail < 1) { const pts = []; for (let i = 0; i <= 18; i++) pts.push(at(tail + (head - tail) * i / 18)); const wd = 30 * (1 - tail * 0.6);
    s += `<path d="M${pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' L')}" stroke="url(#wt17)" stroke-width="${f(wd)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/><path d="M${pts.map((p) => f(p[0] - 5) + ',' + f(p[1])).join(' L')}" stroke="#fff" stroke-width="${f(wd * 0.22)}" fill="none" stroke-linecap="round" opacity="0.7"/>`;
    for (let i = 0; i < 16; i++) { const p = at(tail + (head - tail) * rnd(i + 3)); s += `<ellipse cx="${f(p[0] + (rnd(i) - 0.5) * wd * 1.6)}" cy="${f(p[1] + (rnd(i + 9) - 0.5) * 30)}" rx="${(3 + rnd(i + 5) * 4).toFixed(1)}" ry="${(5 + rnd(i + 7) * 7).toFixed(1)}" fill="#dff2ff" opacity="0.85"/>`; } }
  const d = t - hit; if (d > 0 && d < 1.6) { for (let i = 0; i < 46; i++) { const ang = rnd(i + 2) * Math.PI * 2, sp = 140 + rnd(i + 4) * 360, x = 548 + Math.cos(ang) * sp * d * 0.9, y = 740 + Math.sin(ang) * sp * d * 0.6 - 200 * d + 520 * d * d; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${(3 + rnd(i + 8) * 5).toFixed(1)}" ry="${(4 + rnd(i + 6) * 8).toFixed(1)}" fill="#e4f5ff" opacity="${clamp(1 - d / 1.6).toFixed(2)}"/>`; } s += `<ellipse cx="548" cy="760" rx="${f(40 + d * 240)}" ry="${f(30 + d * 120)}" fill="none" stroke="#fff" stroke-width="${f(8 * (1 - d / 1.6))}" opacity="${clamp(1 - d / 1.6).toFixed(2)}"/>`; }
  return s; }
const lairFg = (t) => { const pT = t - L.i2.start; const clip = t >= L.i2.end - 0.9 ? 'laugh' : (t >= L.i2.start && pT < 0.9 ? 'point' : 'idle'); const tt = clip === 'laugh' ? t - (L.i2.end - 0.9) : clip === 'point' ? pT : t; const P = poseClip(clip, Math.max(0, tt)); P.eyes.glow = 1 + 0.25 * Math.sin(t * 7);
  const mon = [[70, 180], [400, 180], [730, 180], [70, 520], [730, 520]].map(([x, y], i) => `<g opacity="${(0.82 + 0.1 * Math.sin(t * 9 + i * 2)).toFixed(2)}"><clipPath id="mn${i}"><rect x="${x}" y="${y}" width="300" height="290" rx="8"/></clipPath><g clip-path="url(#mn${i})"><image href="${lazyThumb}" transform="translate(${f(x - 330 * 0.564)},${f(y - 40 * 0.564)}) scale(0.564)" x="0" y="0" width="1024" height="1500"/></g><rect x="${x}" y="${y}" width="300" height="290" rx="8" fill="#ff2a3a" opacity="0.28"/>${[...Array(5)].map((_, k) => `<rect x="${x}" y="${f(y + ((t * 60 + k * 58) % 290))}" width="300" height="4" fill="#ff8a9a" opacity="0.25"/>`).join('')}<rect x="${x + 110}" y="${y + 120}" width="80" height="80" fill="none" stroke="#ff4a5a" stroke-width="3" opacity="${(0.5 + 0.4 * Math.sin(t * 5 + i)).toFixed(2)}"/></g>`).join('');
  const k = clamp((t - 0.3) / 1.0);
  return `${mon}<g opacity="${k.toFixed(2)}"><ellipse cx="540" cy="1322" rx="${f(300 * 0.62)}" ry="26" fill="#000" opacity="0.5" filter="url(#fb)"/><g transform="translate(540,1230) scale(0.62) translate(-520,-1385)">${renderM(P)}</g></g>`; };

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t); CURPLATE = platePng[sc === 'lair' ? 'clinic' : sc]; NAILS.on = true;
  const wet = clamp((t - T.hitA) / 3.5);
  const mkLazy = () => { Object.assign(LOOK, FULL); MK.lips = 1; EYEX.nomk = 0; EYEX.nomk2 = 1; JAW.fxK = 1; if (t >= T.openA) applyFinalFace(); else resetFace(); EYEX.nomk = 0; LASHX.style = 'P3';
    if (wet > 0) { for (const q of ['blush', 'shadow', 'liner', 'contour', 'highlight']) LOOK[q] = FULL[q] * (1 - wet); if (wet > 0.55) MK.lips = 0; if (wet > 0.85) EYEX.nomk = 1; JAW.fxK = 1 - 0.75 * wet; EYEX.nomk2 = 1 - 0.7 * wet; }
    const P2 = defPose2(); const e = P2.eyes; e.blinkL = P.blink.l; e.blinkR = P.blink.r; e.lookX = P.gaze.x; e.lookY = P.gaze.y; e.wide = Math.max(0, (P.lid.l - 1) * 2); e.squint = P.squint || 0;
    P2.brows.Lraise = P.brow.l.r; P2.brows.Rraise = P.brow.r.r; P2.brows.Lfrown = -P.brow.l.i; P2.brows.Rfrown = -P.brow.r.i; P2.mouth.open = Math.min(0.35, P.mouth.open); P2.mouth.wide = P.mouth.wide; P2.mouth.smile = P.mouth.smile; P2.mouth.upperTeeth = P.mouth.open > 0.2 ? 1 : 0.2;
    P2.head.yaw = P.yaw || 0; P2.head.rot = (P.roll || 0) * 0.6; P2.chest.breath = P.breath || 0; P2.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1, sway: P.hair.sway }; P2.hair.t = t; P2.hair.swayL = (P.hair.sway || 0) * 6; P2.hair.swayR = (P.hair.sway || 0) * 6; P2.skirt.t = t; P2.skirt.hem = 0.5; P2.skirt.swayL = 5 * Math.sin(t * 1.3) + 10 * P.walk * Math.sin(P.walkPh); P2.skirt.swayR = 5 * Math.sin(t * 1.3 + 1) - 10 * P.walk * Math.sin(P.walkPh);
    P2.noseStyle = 'D'; P2.noseK = 1.35;
    const arm = (tx, ty, k) => { const kL = ik2(SK2.shoulderL, SK2.elbowL, SK2.wristL, [512 - tx, ty], -1), kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [512 + tx, ty], 1); P2.armL.r1 = kL.r1 * k; P2.armL.r2 = kL.r2 * k; P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; };
    const kHit = clamp((t - T.hitA) / 0.3) * (1 - clamp((t - T.hitA - 2.2) / 0.5)); if (kHit > 0) { arm(150, 300, kHit); P2.handL.curl = P2.handR.curl = [0.7, 0.7, 0.7, 0.7, 0.7]; }
    const kRev = clamp((t - T.openA) / 0.5) * (1 - clamp((t - T.mirrorB) / 0.4)); if (kRev > 0) { arm(170, 470, kRev); P2.handL.spread = P2.handR.spread = 0.5; P2.handL.curl = P2.handR.curl = [0.1, 0.1, 0.1, 0.1, 0.1]; }
    const kSh = clamp((t - T.dripA + 1.0) / 0.6) * (1 - clamp((t - T.coatA - 1.0) / 0.6)) * (1 - kHit); if (kSh > 0) { arm(34, 520, kSh * 0.9); P2.chest.breath = (P2.chest.breath || 0) + 0.3 * Math.sin(t * 22) * kSh; }
    if (t > w('l16', 'sigueme') - 0.3) { const k = clamp((t - w('l16', 'sigueme') + 0.3) / 0.3); const kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [800, 330], 1); P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; P2.handR.spread = 1.2; P2.armL.r1 = 0; P2.armL.r2 = 0; }
    return renderCharacter(P2); };
  const sK = sc === 'clinic' ? seatedK(t) : 0, drop = SIT_DROP * sK, hy = HEAD_CY + drop, seated = sK > 0.01;
  const chairBack = seated ? `<g opacity="${sK.toFixed(2)}"><ellipse cx="540" cy="1722" rx="250" ry="34" fill="#000" opacity="0.3"/><rect x="${540 - 150}" y="${hy - 10}" width="300" height="${1480 - hy}" rx="70" fill="#e7f1f5" stroke="${OUT}" stroke-width="8"/><rect x="${540 - 118}" y="${hy - 30}" width="236" height="150" rx="60" fill="#f7fbfd" stroke="${OUT}" stroke-width="7"/><path d="M${540 - 150},${hy + 60} L${540 - 150},1440 M${540 + 150},${hy + 60} L${540 + 150},1440" stroke="#22c6d8" stroke-width="7" opacity="0.9"/></g>` : '';
  const gownSvg = seated ? `<g opacity="${sK.toFixed(2)}"><defs><linearGradient id="cpG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfd6df"/><stop offset="0.45" stop-color="#f6fbfd"/><stop offset="1" stop-color="#b2cbd6"/></linearGradient></defs><path d="M${540 - 62},${hy + 142} C${540 - 120},${hy + 150} ${540 - 250},${hy + 190} ${540 - 264},${hy + 330} C${540 - 280},${hy + 480} ${540 - 262},${hy + 600} ${540 - 270},1570 Q540,1620 ${540 + 270},1570 C${540 + 262},${hy + 600} ${540 + 280},${hy + 480} ${540 + 264},${hy + 330} C${540 + 250},${hy + 190} ${540 + 120},${hy + 150} ${540 + 62},${hy + 142} Q540,${hy + 190} ${540 - 62},${hy + 142}Z" fill="url(#cpG)" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><path d="M${540 - 62},${hy + 142} Q540,${hy + 192} ${540 + 62},${hy + 142}" stroke="#22c6d8" stroke-width="8" fill="none"/><path d="M${540 - 130},${hy + 220} C${540 - 160},${hy + 420} ${540 - 170},${hy + 620} ${540 - 190},1560 M${540 + 130},${hy + 220} C${540 + 160},${hy + 420} ${540 + 170},${hy + 620} ${540 + 190},1560" stroke="#6a8a98" stroke-opacity="0.45" stroke-width="9" fill="none" stroke-linecap="round"/></g>` : '';
  const chairFront = seated ? `<g opacity="${sK.toFixed(2)}"><rect x="${540 - 300}" y="${1250 + drop * 0.3}" width="64" height="190" rx="26" fill="#dfe9ee" stroke="${OUT}" stroke-width="8"/><rect x="${540 + 236}" y="${1250 + drop * 0.3}" width="64" height="190" rx="26" fill="#dfe9ee" stroke="${OUT}" stroke-width="8"/><rect x="${540 - 26}" y="1590" width="52" height="100" fill="#cfd9df" stroke="${OUT}" stroke-width="6"/><ellipse cx="540" cy="1700" rx="230" ry="30" fill="#cfd9df" stroke="${OUT}" stroke-width="7"/><rect x="${540 - 210}" y="1540" width="420" height="56" rx="28" fill="#eef5f8" stroke="${OUT}" stroke-width="8"/></g>` : '';
  const wa = P.walk || 0, bobW = -Math.abs(Math.sin(P.walkPh || 0)) * 14 * wa;
  const tf = `translate(${540 - 512 * NEWS},${1655 - 1500 * NEWS + drop + bobW}) rotate(${(2.2 * wa * Math.sin(P.walkPh || 0)).toFixed(2)} 512 1500) scale(${NEWS})`;
  const lazyBody = () => { const sh = seated ? '' : `<ellipse cx="540" cy="1650" rx="${380 * NEWS}" ry="26" fill="#000" opacity="0.35"/>`; const clipS = seated ? `<clipPath id="seatClip"><rect x="0" y="0" width="${W}" height="1580"/></clipPath>` : '';
    return `${sh}${clipS}${chairBack}<g ${seated ? 'clip-path="url(#seatClip)"' : ''}><g transform="${tf}">${mkLazy()}${dripsFx(clamp(wet * 1.3), clamp(wet))}</g></g>${gownSvg}${chairFront}`; };
  const lazy = (sc === 'lair') ? '' : lazyBody();
  const sm = (h, tt) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(h(Math.max(0, tt - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const char = (st, fn, look, seed, stateFn, who) => { if (!st) return { body: '', tool: '' }; const { ch } = st; const hs = (tt) => { const q = stateFn(tt); return q ? q.hands : 'none'; }; const nsm = sm(hs, t);
    const base = { ...st, elbowDown: true, armL: nsm.L, armR: nsm.R, blink: blinkOf(t, seed), look, t, mouthOpen: MOUTHW(who, t) };
    const shd = `<ellipse cx="${ch.x + 30 * ch.s}" cy="${ch.y + 712 * ch.s}" rx="${150 * ch.s}" ry="${22 * ch.s}" fill="#000" opacity="0.28" filter="url(#b10)"/>`;
    return { body: `${shd}<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'body' })}</g>`, tool: `<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'tool' })}</g>` }; };
  const iva = char(ivaState(t), drawIvana, 0.7, 0.6, ivaState, 'K'), wil = char(wilState(t), drawWill, -0.6, 2.1, wilState, 'Y');
  const par = (f2) => `translate(540,960) scale(${1 + (cam.z - 1) * f2}) translate(${-(540 + (cam.x - 540) * f2)},${-(960 + (cam.y - 960) * f2)})`;
  const bgLayer = `<g transform="${par(0.85)}"><image href="${platePng[sc]}" width="${W}" height="${H}" preserveAspectRatio="none"/></g>`;
  const worldInner = `${bgLayer}<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})">${sc === 'lair' ? lairFg(t) : ''}${sc === 'clinic' ? iva.body : ''}${sc === 'street' ? balcony(t) : ''}${sc === 'street' ? wil.body : ''}${lazy}${sc === 'clinic' ? iva.tool : ''}${sc === 'street' ? wil.tool : ''}${waterFx(t)}</g>`;
  const tr = transitionAt(t); const wrapW = (scl, dx, op) => `<g opacity="${op}" transform="translate(${540 + dx},960) scale(${scl}) translate(-540,-960)">${worldInner}</g>`;
  const glitch = (g) => g > 2 ? [0, 1, 2, 3].map((i) => `<rect x="0" y="${300 + i * 380 + Math.sin(t * 40 + i) * 40}" width="${W}" height="${50 + i * 14}" fill="#fff" opacity="${0.1 * Math.min(1, g / 20)}" transform="translate(${Math.sin(t * 77 + i) * g * 0.8},0)"/>`).join('') : '';
  const world0 = tr.on ? (tr.ghost ? wrapW(tr.sc * 1.05, tr.gx * 1.4, 0.4) + wrapW(tr.sc * 1.025, tr.gx * 0.7, 0.55) : '') + wrapW(tr.sc, 0, 1) + glitch(Math.abs(tr.gx)) + `<rect width="${W}" height="${H}" fill="#fff" opacity="${tr.fl}"/>` : worldInner;
  const wetTint = (sc === 'street' && t > T.hitA) ? `<rect width="${W}" height="${H}" fill="#4a8ad8" opacity="${(0.1 * (1 - clamp((t - T.hitA - 3) / 3)) + 0.02).toFixed(3)}"/>` : '';
  const nightTint = sc === 'street' ? `<rect width="${W}" height="${H}" fill="#0a1040" opacity="0.1"/>` : '';
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${sc === 'lair' ? '#05000a' : '#05202a'}" stop-opacity="${sc === 'lair' ? 0.6 : 0.35}"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const bnOn = stepBanners.some(([n, tx, a, b]) => t > a - 0.1 && t < b + 0.1); const chipTop = (t < T.slateEnd + 0.4 || bnOn) ? '' : `<g transform="translate(540,300)"><defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd84a"/><stop offset="1" stop-color="#b8780f"/></linearGradient></defs><rect x="-226" y="-40" width="440" height="88" rx="44" fill="#000" opacity="0.3"/><rect x="-230" y="-46" width="440" height="88" rx="44" fill="#1a1024" stroke="#d4a24c" stroke-width="6"/><text x="0" y="18" font-family="Bungee" font-size="48" text-anchor="middle" letter-spacing="3" fill="url(#chg)" stroke="${OUT}" stroke-width="4" paint-order="stroke">DÍA 17/30</text></g>`;
  const flashR = Math.max(0, 1 - Math.abs(t - T.hitA) / 0.2) * 0.65 + Math.max(0, 1 - Math.abs(t - (T.openA + 0.4)) / 0.25) * 0.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}${ALLDEFS}${MDEFS}${FDEFS}${OBJDEFS}<defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter></defs>${world0}${nightTint}${wetTint}${vignette}${slateIntro(t - T.slateA)}
    ${chipTop}${insScan(t)}${insLens(t)}${insDrop(t)}${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}${mirrorCard(t)}
    ${t < T.vote ? captions(t) : ''}${endCard(t)}<rect width="${W}" height="${H}" fill="#fff" opacity="${flashR.toFixed(3)}"/>
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
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
