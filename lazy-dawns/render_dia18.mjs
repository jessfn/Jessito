// Lazy Dawns - DIA 18: "Su mamá la maquilló... pero sonaron los celulares" (casa de Lazy, Will, doña Susan, maquillaje look A, aviso de Mari desaparecida). Todo 2D.
// Uso: node render_dia18.mjs preview 5 12 ...   |   node render_dia18.mjs <inicio> <fin> <salida.mp4>   |   node render_dia18.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, hand } from './lazy_lib.mjs';
import { drawLazy, LASHX, EYEX, BROWX, LIPX, NOSEDY, MOUTHX } from './rig.mjs';
import { handsToTargets } from './chars.mjs';
import { TOOLS } from './chars12.mjs';
import { drawWill } from './chars17.mjs'; import { drawSusan } from './chars18.mjs'; import { dripsFx } from './drips17.mjs';
import { LOOK, MK, JAW, FACEK, NECK } from './rig2d/character.mjs'; import { drawMari2 } from './chars15.mjs';
import { applyFinalFace, resetFace, applyDay16Face, applyDay18Face } from './face_final.mjs'; import { renderM } from './rig2d/m_character.mjs'; import { poseClip } from './rig2d/m_clips.mjs';
import { renderCharacter, defaultPose as defPose2, ik2, SK as SK2, ALLDEFS, NAILS } from './rig2d/character.mjs';
import { MDEFS } from './rig2d/m_character.mjs';
import { makeDirector } from './director_d18.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia18');

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
  slateA: L.i2.end + 0.2, hookA: L.l1.start, l2A: L.l2.start, enterA: L.l2.end + 0.35, susA: L.l4.start, sitA: w('l4', 'sientate') - 0.1,
  l5A: L.lm.start, micA: L.lm.start - 0.5, cleanA: L.lm.start - 0.3, cleanB: L.lm.end - 0.1, creamA: L.lc.start - 0.25, baseA: L.lb.start - 0.25, browA: 9999,
  shadowA: L.l8.start + 0.4, shadowB: L.l8.start + 3.8, linerA: L.ll.start - 0.2, blushA: w('l10', 'rubor') - 0.6, lipsA: w('l10', 'labios') - 0.7,
  mirrorA: w('l10', 'Mirate') + 0.05, l12A: L.l12.start, ringA: L.l13.start, newsA: L.l14.start - 0.1, l15A: L.l15.start, flashA: L.l15.end - 0.5, flashB: L.l17.start - 0.1,
  l17A: L.l17.start, l18A: L.l18.start, l19A: L.l19.start, vote: w('l20', 'Cabello') - 0.1, optA: w('l20', 'Cabello'), optB: w('l20', 'piel'), cta1: w('l20', 'Comenta'), cta2: w('l20', 'sigueme'),
};
T.swapA = T.mirrorA - 0.25;
T.slateEnd = T.slateA + 3.7; T.homeA = T.hookA; T.mirrorB = L.l12.end + 0.2; T.closeA = T.shadowA + 0.5; T.openA = T.shadowB; T.walks = [[0, 0.01]];
T.lipsB = T.lipsA + 1.6; T.l8B = L.l8.end;
T.scenes = [T.slateEnd, T.hookA, T.l2A, T.enterA, T.susA, T.micA, T.creamA, T.baseA, T.shadowA, T.linerA, T.blushA, T.lipsA, T.mirrorA, T.ringA, T.newsA, T.l15A, T.flashA, T.l17A, T.l18A, T.l19A, T.vote];
const OBJN = {};
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });
const FULL = JSON.parse(JSON.stringify(LOOK));

const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates2d', n + '.png')));
const platePng = { lair: PL('warehouse18'), door: PL('door18'), home: PL('home18') };
const lazyThumb = (() => { applyDay16Face(); const P = defPose2(); P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 }; P.hair.t = 1; P.skirt.t = 1; P.eyes.lookX = 0.2; P.mouth.smile = 0.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1500" viewBox="0 0 1024 1500">${charDefs}${ALLDEFS}<rect width="1024" height="1500" fill="#2a1830"/>${renderCharacter(P)}</svg>`; return b64(new Resvg(svg, { fitTo: { mode: 'width', value: 700 } }).render().asPng()); })();


// ---------------- escenas, personajes y camara (todo 2D) ----------------
const sceneAt = (t) => (t < T.slateA + 2.0 ? 'lair' : t < T.enterA ? 'door' : 'home');
const NEWS = 0.7, SIT_DROP = 100, HEAD_CY = 788;
const seatedK = (t) => (sceneAt(t) === 'home' ? ease((t - T.sitA) / 0.7) : 0);
const toLocal = (ch, wx, wy) => ({ x: (wx - ch.x) / ch.s, y: (wy - ch.y) / ch.s });
const susCh = () => ({ x: 885, y: 905, s: 0.8 });
const wilCh = (t) => (sceneAt(t) === 'door' ? { x: 1500 - 650 * ease((t - T.hookA) / 1.8), y: 885, s: 0.85 } : { x: 150, y: 885, s: 0.85 });
function susState(t) { if (sceneAt(t) !== 'home') return null; const ch = susCh(); let mood = 'worry', hands = 'clasp', tool = 'none', ex = {};
  const FX = 590, FY = 925; const at = (k, rot, sc) => { const Lc = toLocal(ch, FX, FY); const dab = Math.sin(t * 13) * 5; tool = k; hands = 'none'; ex = { elbowLow: true, toolSide: -1, toolX: Lc.x + dab, toolY: Lc.y + dab * 0.6, toolR: rot, toolS: sc }; };
  if (t >= T.cleanA - 0.3 && t < T.creamA - 0.1) { mood = 'calm'; at('cotton', -70, 0.8); }
  if (t >= T.creamA && t < T.baseA) { mood = 'calm'; at('jar', -70, 0.55); }
  if (t >= T.baseA && t < T.shadowA - 0.2) { mood = 'calm'; at('sponge', -70, 0.8); }
  if (t >= T.shadowA - 0.2 && t < T.linerA) { mood = 'calm'; at('brushS', -78, 0.8); }
  if (t >= T.linerA && t < T.blushA - 0.1) { mood = 'calm'; at('brushL', -78, 0.8); }
  if (t >= T.blushA - 0.1 && t < T.lipsA - 0.1) { mood = 'happy'; at('brushB', -78, 0.8); }
  if (t >= T.lipsA - 0.1 && t < T.lipsB + 0.3) { mood = 'happy'; at('lipstick', -78, 0.7); }
  if (t >= T.lipsB + 0.3) { mood = 'grin'; hands = 'clasp'; } if (t >= T.ringA) mood = 'worry'; if (t >= T.l17A - 0.2) mood = 'worry'; if (t >= T.l19A) mood = 'worry';
  return { mood, hands, tool, ch, ...ex }; }
function wilState(t) { const sc = sceneAt(t); if (sc === 'lair' || t < T.hookA - 0.2) return null; const ch = wilCh(t); let mood = 'worry'; if (t >= T.mirrorA) mood = 'happy'; if (t >= T.ringA) mood = 'worry';
  return { mood, hands: 'clasp', tool: 'none', ch }; }
const MOUTHW = (who, t) => { const l = DATA.lines.find((q) => q.who === who && t >= q.start - 0.05 && t <= q.end + 0.1); if (!l) return 0; for (const [ww, s, e] of l.words) if (t >= s - 0.02 && t <= e + 0.04) { const k = (t - s) / Math.max(0.12, e - s); return 0.28 + 0.62 * Math.abs(Math.sin((t - s) * 21 + ww.length)) * (0.7 + 0.3 * Math.sin(k * 3.14)); } return 0.04; };
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
const CAM = [[0, 1.0, 540, 980], [T.slateA, 1.22, 540, 900], [T.slateA + 2.0, 1.0, 540, 960], [T.hookA, 1.05, 540, 980], [T.l2A, 1.15, 640, 960], [T.enterA, 1.0, 540, 960], [T.susA, 1.0, 600, 990], [T.micA - 0.2, 1.45, 570, 900], [T.l5A, 1.15, 700, 1000], [T.creamA, 1.55, 560, 900], [T.baseA, 1.6, 560, 900], [T.shadowA - 0.2, 1.95, 540, 850], [T.shadowB + 0.3, 1.5, 540, 880], [T.linerA, 1.95, 540, 850], [T.blushA - 0.3, 1.6, 540, 900], [T.lipsA - 0.3, 1.9, 540, 930], [T.lipsB + 0.2, 1.1, 540, 960], [T.l12A, 1.12, 400, 980], [T.ringA, 1.05, 540, 980], [T.l15A, 1.5, 540, 860], [T.l17A, 1.12, 760, 980], [T.l18A, 1.55, 540, 780], [T.l19A, 1.12, 380, 980], [T.vote, 1.0, 540, 980], [DUR, 1.0, 540, 980]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.ringA, T.ringA + 1.0, 0.02, 0.5) * 7 + win(t, T.slateA + 0.55, T.slateA + 1.1, 0.02, 0.4) * 8 + win(t, T.flashA + 1.6, T.flashA + 2.2, 0.02, 0.3) * 10; const sway = Math.sin(t * 0.55) * 6;
  return { z: lerp(a[1], b[1], u) * (1 + 0.012 * Math.sin(t * 0.7)), x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6 + sway, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}

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
const T_INS = [[T.micA, T.micA + 1.7, 'micellar', 'AGUA MICELAR', '#a5e4ff'], [T.creamA, T.creamA + 1.3, 'jar', 'CREMA FRÍA', '#ffd0e4'], [T.baseA, T.baseA + 1.3, 'sponge', 'BASE LIGERA', '#ffe2c4'],
  [T.shadowA - 0.2, T.shadowA + 1.5, 'palette', 'SOMBRA VINO Y CIRUELA', '#e9b6f2'], [T.linerA, T.linerA + 1.5, 'brushL', 'DELINEADO', '#ffffff'], [T.blushA, T.blushA + 1.4, 'brushB', 'RUBOR CÁLIDO', '#ffb08a'], [T.lipsA, T.lipsA + 1.5, 'lipstick', 'LABIOS ROJO OSCURO', '#ff6a7a']];
const insAll = (t) => T_INS.map(([a, b, k, l, c]) => ins18(t, a, b, k, l, c)).join('');

const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const fitFs = (txt, maxW, fs0) => { let fs = fs0, wd = inkWidth(esc(txt), fs); if (wd > maxW) fs = Math.max(26, Math.floor(fs * maxW / wd)); return fs; };
const SPEAK = { N: { col: '#ffe14d', name: null }, S: { col: '#ffb8d0', name: 'DOÑA SUSAN' }, Y: { col: '#7dd3fc', name: 'WILL' }, D: { col: '#ff5a6a', name: 'M' }, T: { col: '#9ad0ff', name: 'NOTICIAS' } };
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
  PIEL: `<ellipse cx="0" cy="2" rx="26" ry="32" fill="#e8b48a" stroke="${OUT}" stroke-width="4"/><path d="M-16,-6 q8,-8 16,0 M4,-6 q8,-8 16,0" stroke="${OUT}" stroke-width="3" fill="none"/><path d="M-10,14 q10,10 20,0" stroke="#b0206a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26,-22 l4,-12 l4,12 l12,4 l-12,4 l-4,12 l-4,-12 l-12,-4Z" fill="#ffe14d" stroke="${OUT}" stroke-width="2.5"/><circle cx="-20" cy="22" r="3" fill="#c8486a" opacity="0.7"/>`,
  CABELLO: `<path d="M-20,-30 C-38,-8 -34,18 -24,34 C-12,26 -10,4 -6,-10 C-4,-22 -12,-30 -20,-30Z" fill="#6a4026" stroke="${OUT}" stroke-width="3.4" stroke-linejoin="round"/><path d="M-6,-32 C-24,-10 -18,16 -10,34" stroke="#c98f5c" stroke-width="3" fill="none"/><g transform="translate(14,2) rotate(18)"><rect x="-8" y="-30" width="16" height="64" rx="5" fill="#f472b6" stroke="${OUT}" stroke-width="3.4"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M-8,${-24 + i * 11} h-10" stroke="${OUT}" stroke-width="3.4" stroke-linecap="round"/>`).join('')}</g>`,
};

function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  let s = `<defs><radialGradient id="ecg" cx="0.5" cy="0.42" r="0.8"><stop offset="0" stop-color="#3a1030"/><stop offset="1" stop-color="#08040c"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#ecg)" opacity="${k}"/>${[...Array(30)].map((_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 311) % H}" r="${1.5 + (i % 3)}" fill="#ffb84a" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * k}"/>`).join('')}<text x="540" y="${690 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ HACEMOS</text><text x="540" y="${776 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">MAÑANA?</text>`;
  const a = pop(t, T.optA, 0.35), b = pop(t, T.optB, 0.35);
  if (a > 0) s += `<g transform="translate(540,960) scale(${a})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON.CABELLO}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('A · ARREGLAR EL CABELLO', 620, 58)}" text-anchor="middle" fill="${OUT}">A · ARREGLAR EL CABELLO</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1136) scale(${b})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON.PIEL}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('B · CUIDAR LA PIEL', 620, 58)}" text-anchor="middle" fill="#fff">B · CUIDAR LA PIEL</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1400) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1510) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 19</text></g>`;
  return s;
}
const redEyes = (t) => { const o = 0.5 + 0.5 * Math.sin(t * 2.2), bl = (t % 3.1) < 0.14 ? 0.1 : 1; return [-1, 1].map((s) => `<g transform="translate(${540 + s * 130},300)"><ellipse cx="0" cy="0" rx="110" ry="${f(56 * bl)}" fill="url(#fGlow)" opacity="${(0.5 + 0.3 * o).toFixed(2)}"/><path d="M-52,0 Q0,${f(-34 * bl)} 52,0 Q0,${f(30 * bl)} -52,0Z" fill="#ff2a3a"/><ellipse cx="0" cy="0" rx="7" ry="${f(24 * bl)}" fill="#12040a"/></g>`).join(''); };
function slateIntro(t) { const END = 3.7; if (t < 0 || t > END) return ''; const ex = ease(clamp((t - 2.9) / 0.8)); const k = 1 - ex; const clap = t < 0.55 ? 1 - ease(t / 0.55) : t < 0.7 ? 0 : 0;
  const ang = t < 0.45 ? -34 * (1 - ease(t / 0.45)) - 0 : (t < 0.62 ? -34 * (1 - ease(t / 0.45)) : 0); const flash = clamp((t - 0.55) / 0.06) * (1 - clamp((t - 0.62) / 0.3));
  const rays = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * 6.283 + t * 0.15; return `<path d="M540,760 L${f(540 + Math.cos(a) * 1500)},${f(760 + Math.sin(a) * 1500)} L${f(540 + Math.cos(a + 0.11) * 1500)},${f(760 + Math.sin(a + 0.11) * 1500)}Z" fill="#ff8a3a" opacity="${(0.07 + 0.04 * Math.sin(t * 2 + i)).toFixed(3)}"/>`; }).join('');
  const emb = Array.from({ length: 60 }, (_, i) => { const age = (t * (0.12 + (i % 5) * 0.04) + rnd(i)) % 1; return `<circle cx="${f(rnd(i + 3) * W + Math.sin(t * 2 + i) * 24)}" cy="${f(H - age * (H + 100))}" r="${(1.5 + rnd(i + 9) * 3).toFixed(1)}" fill="${i % 3 ? '#ffb84a' : '#ff5a2a'}" opacity="${((1 - age) * 0.9).toFixed(2)}"/>`; }).join('');
  const tl = ['ELLA SE ARREGLABA', 'PERO TODOS RECIBIERON UN AVISO']; const fs = Math.min(...tl.map((l) => { const w0 = measure(l, 64, 400, 'Righteous'); return w0 > 590 ? Math.floor(64 * 590 / w0) : 64; }));

  const aur = [0, 1, 2].map((j) => { let top = '', bot = ''; for (let i = 0; i <= 12; i++) { const x = i * W / 12, y = 520 + j * 280 + 120 * Math.sin(t * 0.9 + i * 0.7 + j * 2); top += (i ? 'L' : 'M') + f(x) + ',' + f(y - 110 - 40 * Math.sin(t * 0.6 + i + j)); } for (let i = 12; i >= 0; i--) { const x = i * W / 12, y = 520 + j * 280 + 120 * Math.sin(t * 0.9 + i * 0.7 + j * 2); bot += 'L' + f(x) + ',' + f(y + 130 + 40 * Math.cos(t * 0.7 + i + j)); } return `<path d="${top}${bot}Z" fill="url(#au${j})" filter="url(#sl30)" opacity="${(0.6 + 0.2 * Math.sin(t + j)).toFixed(2)}"/>`; }).join('');
  const cos = Array.from({ length: 16 }, (_, i) => { const age = (t * (0.07 + (i % 4) * 0.025) + rnd(i + 21)) % 1, x = rnd(i + 4) * W + Math.sin(t * 1.2 + i) * 30, y = H + 80 - age * (H + 160), rot = f(t * 40 * (i % 2 ? 1 : -1) + i * 40), c = ['#ff7ab6', '#ffd98a', '#b07aff', '#7ae8e0'][i % 4], o = (0.5 * Math.sin(age * Math.PI)).toFixed(2);
    const g = i % 3 === 0 ? `<rect x="-9" y="0" width="18" height="40" rx="4" fill="${c}"/><path d="M-8,0 L8,0 L5,-22 L-5,-26Z" fill="#fff"/>` : i % 3 === 1 ? `<circle r="24" fill="${c}"/><circle r="14" fill="#fff" opacity="0.5"/>` : `<rect x="-4" y="-10" width="8" height="52" rx="4" fill="${c}"/><path d="M-12,-10 Q0,-48 12,-10Z" fill="#fff"/>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${f(0.9 + 0.6 * rnd(i + 8))})" opacity="${o}">${g}</g>`; }).join('');
  const bok = Array.from({ length: 22 }, (_, i) => `<circle cx="${f(rnd(i + 31) * W + Math.sin(t * 0.7 + i) * 40)}" cy="${f(rnd(i + 41) * H + Math.cos(t * 0.5 + i) * 50)}" r="${f(18 + rnd(i + 51) * 50)}" fill="${['#ffd0e8', '#d8c0ff', '#bff3ff'][i % 3]}" opacity="${(0.07 + 0.06 * Math.sin(t * 1.5 + i)).toFixed(3)}"/>`).join('');
  const bgNew = `<defs><filter id="sl30" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="34"/></filter><linearGradient id="slBg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0a2a"/><stop offset="0.55" stop-color="#241046"/><stop offset="1" stop-color="#3a1038"/></linearGradient>${['#2ad6c0', '#c05aff', '#ff7ab6'].map((c, j) => `<linearGradient id="au${j}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset="0.5" stop-color="${c}" stop-opacity="0.85"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`).join('')}</defs><g opacity="${k.toFixed(2)}"><rect width="${W}" height="${H}" fill="url(#slBg2)"/>${aur}${bok}${cos}</g>`;
  const board = `<g transform="translate(540,${f(900 + 40 * ex)}) scale(${f(1 + 0.16 * ex)})" opacity="${k.toFixed(2)}"><ellipse cx="0" cy="470" rx="400" ry="40" fill="#000" opacity="0.4" filter="url(#fb)"/><rect x="-360" y="-240" width="720" height="640" rx="22" fill="url(#slB)" stroke="${OUT}" stroke-width="10"/><path d="M-360,-80 H360 M-360,200 H360" stroke="#fff" stroke-opacity="0.7" stroke-width="5"/><text x="-330" y="-176" font-family="Bungee" font-size="${fitFs('LAZY DAWNS', 640, 50)}" fill="#fff">LAZY DAWNS</text><text x="-330" y="-112" font-family="Bungee" font-size="${fitFs('DÍA 18/30', 640, 50)}" fill="#ffb84a">DÍA 18/30</text>${tl.map((l, i) => `<text x="-330" y="${i * 86 + 10}" font-family="Righteous" font-size="${fs}" fill="#fff">${esc(l)}</text>`).join('')}<text x="-330" y="266" font-family="Righteous" font-size="30" fill="#9ca3af">TOMA 1 · ESCENA A</text>
    <g transform="translate(-360,-240) rotate(${f(ang)} 0 0)"><rect x="0" y="-90" width="720" height="90" rx="14" fill="#f5f5f5" stroke="${OUT}" stroke-width="8"/>${[...Array(9)].map((_, i) => `<path d="M${i * 88 - 10},-84 l60,0 l-34,78 l-60,0Z" fill="#7a0a18"/>`).join('')}</g><circle cx="-360" cy="-240" r="14" fill="#cfd4da" stroke="${OUT}" stroke-width="5"/>
    <rect x="-360" y="-240" width="720" height="90" rx="14" fill="#f5f5f5" stroke="${OUT}" stroke-width="8" opacity="0"/></g>`;
  return `<g><defs><linearGradient id="slB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a1040"/><stop offset="1" stop-color="#14061c"/></linearGradient><radialGradient id="slBg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stop-color="#7a1424"/><stop offset="0.5" stop-color="#2a0814"/><stop offset="1" stop-color="#07030a"/></radialGradient></defs>${FDEFS}${bgNew}${board}<rect width="${W}" height="${H}" fill="#fff" opacity="${(flash * 0.5).toFixed(3)}"/></g>`; }

function transitionAt(t) { for (const [t0, kind0, d] of TRANS) { const kind = kind0 === 'cut2' ? 'cut' : kind0; const zk = kind0 === 'cut2' ? 0.04 : 0.2; const a = t0 - (kind === 'cut' ? d / 2 : 0), p = (t - a) / d; if (p < 0 || p > 1) continue;
    if (kind === 'in') { const e = ease(p); return { on: true, ghost: p < 0.85, sc: 1.4 - 0.4 * e, v: (1 - e), fl: 0.35 * Math.max(0, 1 - p * 3), gx: 0 }; }
    const e = smooth(p), mid = 1 - Math.abs(e - 0.5) * 2; const sc = e < 0.5 ? 1 + e * 2 * zk : 1 + zk - (e * 2 - 1) * zk; return { on: true, ghost: true, sc, v: mid, fl: 0.5 * mid * mid, gx: (e < 0.5 ? 1 : -1) * mid * 40 }; } return { on: false }; }


const stepBanners = [];
const TRANS = [[T.enterA, 'cut', 0.5], [T.swapA, 'cut2', 0.5]];
// ---- cabello hecho un desastre (hebras sueltas, enredos) en coordenadas del personaje ----
const messyHair = (t, k = 1) => { let s = ''; const R = (i) => rnd(i * 7 + 3);
  const TL = [[72, 512], [100, 460], [140, 400], [210, 375], [330, 372], [430, 385], [500, 405]], TR = [[72, 512], [100, 580], [150, 630], [230, 650], [330, 655], [410, 648], [455, 630]];
  const interp = (TT, y) => { let i = 0; while (i < TT.length - 2 && TT[i + 1][0] <= y) i++; const p = TT[i], q = TT[i + 1], u = clamp((y - p[0]) / (q[0] - p[0])); return lerp(p[1], q[1], u); };
  const edge = (y) => [interp(TL, y), interp(TR, y)];
  const strand = (rx, ry, ang, len, bend, i) => { const sw = Math.sin(t * 1.6 + i) * 3, c = Math.cos(ang), sn = Math.sin(ang), ex = rx + c * len + sw, ey = ry + sn * len, mx = rx + c * len * 0.5 - sn * bend, my = ry + sn * len * 0.5 + c * bend; const d = `M${f(rx)},${f(ry)} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}`;
    return `<path d="${d}" stroke="#1d0d06" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#4a2a16" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#8a5a36" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.8"/>`; };
  for (let i = 0; i < 22; i++) { const y = 92 + R(i) * 350, [lo, hi] = edge(y), side = i % 2 ? 1 : -1; const rx = side > 0 ? hi - 10 : lo + 10, ry = y, ang = (side > 0 ? 0 : Math.PI) + (R(i + 30) - 0.5) * 1.0 + (y < 200 ? -side * 0.6 : 0.25 * side), len = (18 + R(i + 9) * 46) * k + 16, bend = (R(i + 20) - 0.5) * 40; s += strand(rx, ry, ang, len, bend, i); }
  for (let i = 0; i < 9; i++) { const x = 470 + R(i + 60) * 85, y = 82 + R(i + 61) * 8; s += strand(x, y, -Math.PI / 2 + (R(i + 62) - 0.5) * 1.3, (14 + R(i + 63) * 36) * k + 10, (R(i + 64) - 0.5) * 30, i + 40); }
  return `<g opacity="${k.toFixed(2)}">${s}</g>`; };

// ---- estado del rostro (maquillaje por pasos) ----
function stageAt(t) { const ez = (a, d) => ease((t - a) / d); const cl = clamp((t - T.cleanA) / (T.cleanB - T.cleanA));
  return { nw: t >= T.swapA, wet: 1 - ease(cl), base: ez(T.baseA, 1.2), shadow: ez(T.shadowA + 0.3, 3.0), liner: ez(T.linerA + 0.2, 1.4), blush: ez(T.blushA + 0.2, 1.2), lips: ez(T.lipsA + 0.3, 1.0), brows: t >= T.swapA }; }
const R_BEFORE = { nw: false, wet: 1, base: 0, shadow: 0, liner: 0, blush: 0, lips: 0, brows: false }, R_AFTER = { nw: true, wet: 0, base: 1, shadow: 1, liner: 1, blush: 1, lips: 1, brows: true };
function setFace(R) {
  Object.assign(LOOK, JSON.parse(JSON.stringify(FULL))); Object.assign(EYEX, { glit: 0, side: 0, inn: null, shp: null, ip: 0, shH: null, drape: 0, blushK: null, shK: null, blushCol: null, dx: 0 });
  BROWX.style = null; LIPX.gloss = 1; LIPX.tex = 0; LIPX.shimmer = 0; FACEK.hi = 1; FACEK.glow = 1; NOSEDY.dy = 0; MOUTHX.dy = 0; NECK.w = 1; MK.lips = 1; EYEX.nomk = 0; EYEX.nomk2 = 1; JAW.fxK = 1;
  const COLS = { blush: '#c06048', contour: '#5a2038', shadow: ['#4a0f3a', '#8a2a6a', '#e0b0d8'], inner: '#f8e8f4', hl: '#fff0f4', liner: '#1a0612' };
  if (!R.nw) { // ROSTRO DEL DIA 17 (mojado / sin maquillaje) con maquillaje que se va aplicando por pasos; sin rasgos nuevos hasta la revelacion
    applyDay16Face(); Object.assign(LOOK, { found: R.base, blush: 0, shadow: R.shadow, liner: 0.9 * R.liner, wing: 0.9 * R.liner, contour: 0.35 * R.blush, highlight: 0.25 * R.blush, thick: 4, cols: COLS });
    EYEX.nomk = (R.shadow + R.liner + R.blush < 0.02) ? 1 : 0; EYEX.nomk2 = 1 - 0.7 * R.wet; JAW.fxK = 1 - 0.75 * R.wet; EYEX.drape = R.blush > 0.02 ? 1 : 0; EYEX.blushK = 1.1 * R.blush; EYEX.blushCol = '#c06048'; MK.lips = R.lips > 0.5 ? 1 : 0; MK.lipColor = '#9c0f1c'; return; }
  applyDay18Face(); EYEX.nomk = 0; EYEX.nomk2 = 1; JAW.fxK = 1; LOOK.found = 1; BROWX.style = 'ombre';
}
// ---- celulares: tres modelos distintos, MISMA notificacion de Canal 6 Noticias (ordenada: suena, se lee, reaccionan) ----
const mCache2 = new Map();
function measure(str, fs, wt = 500, fam = 'Inter') { const key = fam + '|' + fs + '|' + wt + '|' + str; if (mCache2.has(key)) return mCache2.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${Math.ceil(fs * 2)}"><text x="10" y="${fs * 1.3}" font-family="${fam}" font-weight="${wt}" font-size="${fs}" fill="#000">${esc(str)}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache2.set(key, r); return r; }
function wrapTxt(txt, maxW, fs, wt) { const words = txt.split(' '), lines = []; let cur = ''; for (const w2 of words) { const t2 = cur ? cur + ' ' + w2 : w2; if (measure(t2, fs, wt) <= maxW) cur = t2; else { lines.push(cur); cur = w2; } } if (cur) lines.push(cur); return lines; }
const NOTI = { app: 'CANAL 6 NOTICIAS', title: 'Último aviso: Mari desaparecida', body: 'La joven fue vista por última vez anoche, camino a casa de una amiga. Se pide ayuda.' };
const PHONES = [
  { who: 'LAZY', x: 190, kind: 'island', cse: '#f9a8d4', cse2: '#ec6fb0', body: '#15101c', wall: ['#5a1a6a', '#f472b6', '#ffd0e8'], skin: '#c58a5c', sleeve: '#c1121f', ph: 0 },
  { who: 'DOÑA SUSAN', x: 540, kind: 'bezel', cse: '#d9c08a', cse2: '#a8884a', body: '#26262a', wall: ['#1e3a2a', '#6aa86a', '#d8ecb0'], skin: '#c58a5c', sleeve: '#7c9a8a', ph: 1.7 },
  { who: 'WILL', x: 890, kind: 'punch', cse: '#2a4a7a', cse2: '#16284a', body: '#0c101a', wall: ['#06222e', '#1f7a98', '#9fe0f0'], skin: '#6a4430', sleeve: '#3b6ea5', ph: 3.1 }];
function phoneUnit(P, t, lzId) { const a = T.ringA - 0.05, tR = T.ringA + 1.55; const ringK = win(t, a, tR, 0.05, 0.25), read = clamp((t - tR) / 0.5);
  const sh = (Math.sin(t * 58 + P.ph) * 3.4 + Math.sin(t * 37 + P.ph) * 1.6) * ringK, dyv = Math.sin(t * 47 + P.ph) * 4 * ringK, tilt = -5 * read;
  const sw = 280, sh2 = P.kind === 'bezel' ? 520 : 574, sTop = -sh2 / 2, pad = P.kind === 'bezel' ? 0 : 0;
  const ni = clamp((t - (T.ringA + 0.3)) / 0.35), nOff = (1 - ease(ni)) * -90;
  // notificacion ajustada al recuadro
  const cw = 244, inner = cw - 26, tl = wrapTxt(NOTI.title, inner, 16, 700), bl = wrapTxt(NOTI.body, inner, 14, 500); const chH = 40 + tl.length * 20 + 6 + bl.length * 18 + 14;
  const cy0 = sTop + 190 + nOff;
  const card = `<g opacity="${ni.toFixed(2)}" transform="translate(0,${f(cy0)})"><rect x="${-cw / 2 + 3}" y="6" width="${cw}" height="${chH}" rx="20" fill="#000" opacity="0.25" filter="url(#b6)"/><rect x="${-cw / 2}" y="0" width="${cw}" height="${chH}" rx="20" fill="#ffffff" fill-opacity="0.92"/>
    <rect x="${-cw / 2 + 12}" y="10" width="22" height="22" rx="6" fill="#d1182f"/><text x="${-cw / 2 + 23}" y="27" font-family="Anton" font-size="15" text-anchor="middle" fill="#fff">6</text><text x="${-cw / 2 + 42}" y="26" font-family="Inter" font-weight="700" font-size="12" fill="#3a3a44" letter-spacing="0.5">${esc(NOTI.app)}</text><text x="${cw / 2 - 12}" y="26" font-family="Inter" font-size="12" text-anchor="end" fill="#7a7a86">ahora</text>
    ${tl.map((l, i) => `<text x="${-cw / 2 + 13}" y="${f(54 + i * 20)}" font-family="Inter" font-weight="700" font-size="16" fill="#14141c">${esc(l)}</text>`).join('')}${bl.map((l, i) => `<text x="${-cw / 2 + 13}" y="${f(54 + tl.length * 20 + 8 + i * 18)}" font-family="Inter" font-weight="500" font-size="14" fill="#2a2a34">${esc(l)}</text>`).join('')}</g>`;
  const gid = 'wl' + P.ph * 10 | 0;
  const clk = `<text x="0" y="${f(sTop + 96)}" font-family="Inter" font-weight="700" font-size="68" text-anchor="middle" fill="#fff" fill-opacity="0.95">11:42</text><text x="0" y="${f(sTop + 126)}" font-family="Inter" font-weight="500" font-size="17" text-anchor="middle" fill="#fff" fill-opacity="0.85">martes, 24 de noviembre</text>`;
  const notch = P.kind === 'island' ? `<rect x="-42" y="${f(sTop + 10)}" width="84" height="24" rx="12" fill="#05050a"/>` : P.kind === 'punch' ? `<circle cx="0" cy="${f(sTop + 22)}" r="9" fill="#05050a"/>` : `<rect x="-36" y="${f(sTop - 14)}" width="72" height="6" rx="3" fill="#050508" opacity="0.8"/><circle cx="52" cy="${f(sTop - 11)}" r="4" fill="#0a0a12"/>`;
  const bez = P.kind === 'bezel' ? 14 : 0;
  const body = `<g>
    <rect x="${-sw / 2 - 14}" y="${f(-sh2 / 2 - 14 - bez)}" width="${sw + 28}" height="${sh2 + 28 + bez * 2}" rx="${P.kind === 'bezel' ? 30 : 54}" fill="${P.cse}" stroke="${OUT}" stroke-width="7"/>
    <rect x="${-sw / 2 - 14}" y="${f(-sh2 / 2 - 14 - bez)}" width="${sw + 28}" height="${f((sh2 + 28 + bez * 2) * 0.45)}" rx="${P.kind === 'bezel' ? 30 : 54}" fill="${P.cse2}" opacity="0.22"/>
    <rect x="${-sw / 2 - 3}" y="${f(-sh2 / 2 - 3 - bez)}" width="${sw + 6}" height="${sh2 + 6 + bez * 2}" rx="${P.kind === 'bezel' ? 22 : 46}" fill="${P.body}"/>
    <defs><linearGradient id="${gid}" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${P.wall[0]}"/><stop offset="0.6" stop-color="${P.wall[1]}"/><stop offset="1" stop-color="${P.wall[2]}"/></linearGradient><radialGradient id="${gid}g" cx="0.5" cy="0.3" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><clipPath id="${gid}c"><rect x="${-sw / 2}" y="${f(-sh2 / 2)}" width="${sw}" height="${sh2}" rx="${P.kind === 'bezel' ? 10 : 38}"/></clipPath></defs>
    <g clip-path="url(#${gid}c)"><rect x="${-sw / 2}" y="${f(-sh2 / 2)}" width="${sw}" height="${sh2}" fill="url(#${gid})"/><ellipse cx="${f(Math.sin(t * 0.8 + P.ph) * 40)}" cy="${f(sTop + 140)}" rx="170" ry="140" fill="url(#${gid}g)" opacity="${(0.5 + 0.4 * ringK + 0.3 * read).toFixed(2)}"/>${clk}${card}
      <rect x="-90" y="${f(sh2 / 2 - 22)}" width="180" height="5" rx="2.5" fill="#fff" opacity="0.7"/><circle cx="${-sw / 2 + 34}" cy="${f(sh2 / 2 - 52)}" r="20" fill="#000" opacity="0.35"/><circle cx="${sw / 2 - 34}" cy="${f(sh2 / 2 - 52)}" r="20" fill="#000" opacity="0.35"/></g>${notch}
    <path d="M${-sw / 2 + 20},${f(sTop + 6)} L${f(-sw / 2 + 120)},${f(sTop + 6)} L${f(-sw / 2 + 40)},${f(sh2 / 2 - 20)} L${-sw / 2 + 10},${f(sh2 / 2 - 20)}Z" fill="#fff" opacity="0.05"/></g>`;
  const waves = ringK > 0.05 ? [-1, 1].map((s) => [0, 1].map((i) => { const ph = ((t * 3 + i * 0.5) % 1); return `<path d="M${s * (sw / 2 + 36 + ph * 30)},-80 q${s * 16},80 0,160" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="${(0.7 * (1 - ph) * ringK).toFixed(2)}"/>`; }).join('')).join('') : '';
  const glow = `<ellipse cx="0" cy="0" rx="${f(250 + 20 * ringK)}" ry="${f(360 + 20 * ringK)}" fill="url(#phG)" opacity="${(0.28 + 0.22 * Math.sin(t * 9 + P.ph) * ringK + 0.18 * read).toFixed(2)}"/>`;
  const backHand = `<g transform="translate(0,300)"><path d="M-44,200 L-38,40 L38,40 L44,200Z" fill="${P.sleeve}" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/><rect x="-50" y="18" width="100" height="22" rx="9" fill="#f1efe8" stroke="${OUT}" stroke-width="5"/><ellipse cx="0" cy="-10" rx="64" ry="52" fill="${P.skin}" stroke="${OUT}" stroke-width="7"/>${[-12, 6, 24].map((y) => `<rect x="${sw / 2 - 18}" y="${-70 + y + 14}" width="40" height="22" rx="11" fill="${P.skin}" stroke="${OUT}" stroke-width="5" transform="rotate(${y * 0.4} ${sw / 2} ${-60 + y})" opacity="0"/>`).join('')}</g>`;
  const fingers = `<g>${[-60, -22, 16, 54].map((y, i) => `<rect x="${sw / 2 - 20}" y="${f(60 + y + 80)}" width="46" height="26" rx="13" fill="${P.skin}" stroke="${OUT}" stroke-width="5"/>`).join('')}</g>`;
  const thumb = `<g transform="translate(${-sw / 2 + 6},${f(sh2 / 2 - 70)}) rotate(24)"><rect x="-17" y="-8" width="34" height="86" rx="17" fill="${P.skin}" stroke="${OUT}" stroke-width="6"/><ellipse cx="0" cy="8" rx="10" ry="5" fill="#fff" opacity="0.25"/></g>`;
  return `<g transform="translate(${P.x},${f(720 + dyv)}) scale(0.84) rotate(${f(sh + tilt)})">${glow}${waves}${backHand}${fingers}${body}${thumb}</g>`; }
function phonesCard(t, lzId) { const a = T.ringA - 0.1, b = T.newsA + 0.3, k = win(t, a, b, 0.2, 0.3); if (k <= 0) return '';
  const tR = T.ringA + 1.55, av = clamp((t - tR - 0.7) / 0.3), pa = pop(t, tR + 0.7, 0.35);
  const mkAv = (cx, kind) => { const c = `<circle cx="${cx}" cy="1290" r="58" fill="#1a1020" stroke="#fff" stroke-width="6"/>`;
    const base = { t, blink: blinkOf(t, cx), look: 0, mouthOpen: 0.45 * (0.5 + 0.5 * Math.sin(t * 9 + cx)), hands: 'none', part: 'body' };
    const face = kind === 'Y' ? drawWill({ ...base, mood: 'shock' }) : kind === 'S' ? drawSusan({ ...base, mood: 'worry' }) : '';
    const inner = kind === 'L' ? `<g transform="translate(${cx},1318) scale(-0.3,0.3) translate(-512,-330)"><use href="#${lzId}"/></g>` : `<g transform="translate(${cx},1300) scale(0.36)">${face}</g>`;
    return `<clipPath id="avC${cx}"><circle cx="${cx}" cy="1290" r="52"/></clipPath>${c}<g clip-path="url(#avC${cx})">${inner}</g>`; };
  return `<g opacity="${k.toFixed(2)}"><defs><radialGradient id="phG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#cfe8ff" stop-opacity="0.9"/><stop offset="1" stop-color="#cfe8ff" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="#06040c" opacity="0.78"/>${PHONES.map((P) => phoneUnit(P, t, lzId)).join('')}
    <g opacity="${av.toFixed(2)}" transform="translate(0,${f(10 * (1 - pa))})">${mkAv(190, 'L')}${mkAv(540, 'S')}${mkAv(890, 'Y')}</g>${PHONES.map((P) => `<text x="${P.x}" y="1390" font-family="Anton" font-size="44" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="12" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${P.who}</text>`).join('')}</g>`; }
// ---- tarjeta de noticias ----
function newsCard(t) { const a = T.newsA, b = T.l15A + 0.5, k = win(t, a, b, 0.3, 0.4); if (k <= 0) return '';
  const tick = 'MARI · DESAPARECIDA · SE PIDE A LA CIUDADANÍA COMPARTIR INFORMACIÓN · ';
  const fsT = fitFs('MARI DESAPARECIDA', 900, 110); const l1 = fitFs('VISTA POR ÚLTIMA VEZ ANOCHE', 900, 56), l2 = fitFs('CAMINO A CASA DE UNA AMIGA', 900, 56);
  const mari = drawMari2({ part: 'body', mood: 'worry', t, blink: blinkOf(t, 1.3), look: 0, mouthOpen: 0, hands: 'none' });
  return `<g opacity="${k.toFixed(2)}"><defs><linearGradient id="nwB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1e4a"/><stop offset="1" stop-color="#050b1c"/></linearGradient><clipPath id="nwC"><rect x="270" y="330" width="540" height="640" rx="24"/></clipPath></defs><rect width="${W}" height="${H}" fill="url(#nwB)"/>${[...Array(18)].map((_, i) => `<path d="M${i * 70 - 100},0 L${i * 70 + 200},${H}" stroke="#1a3a7a" stroke-width="3" opacity="0.25"/>`).join('')}
    <g transform="translate(0,${f(8 * Math.sin(t * 5))})"><rect x="60" y="150" width="960" height="120" rx="16" fill="#d1182f" stroke="${OUT}" stroke-width="8"/><text x="540" y="238" font-family="Anton" font-size="${fitFs('ÚLTIMA HORA', 860, 92)}" text-anchor="middle" fill="#fff" letter-spacing="4">ÚLTIMA HORA</text></g>
    <rect x="262" y="322" width="556" height="656" rx="30" fill="#fff" stroke="${OUT}" stroke-width="8"/><rect x="270" y="330" width="540" height="640" rx="24" fill="#2a1d3a"/><g clip-path="url(#nwC)"><g transform="translate(540,860) scale(2.1) translate(0,-30)">${mari}</g></g><rect x="270" y="880" width="540" height="90" fill="#d1182f" opacity="0.92"/><text x="540" y="945" font-family="Anton" font-size="62" text-anchor="middle" fill="#fff" letter-spacing="3">DESAPARECIDA</text>
    <text x="540" y="1100" font-family="Anton" font-size="${fsT}" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="14" paint-order="stroke">MARI DESAPARECIDA</text><text x="540" y="1190" font-family="Anton" font-size="${l1}" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="10" paint-order="stroke">VISTA POR ÚLTIMA VEZ ANOCHE</text><text x="540" y="1262" font-family="Anton" font-size="${l2}" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="10" paint-order="stroke">CAMINO A CASA DE UNA AMIGA</text>
    <clipPath id="tkC"><rect x="0" y="1350" width="${W}" height="70"/></clipPath><rect x="0" y="1350" width="${W}" height="70" fill="#d1182f"/><g clip-path="url(#tkC)"><text x="${f(1080 - ((t * 160) % 1700))}" y="1402" font-family="Anton" font-size="40" fill="#fff" letter-spacing="3">${tick}${tick}</text></g></g>`; }
// ---- recuerdo / flashback (estilizado, sin violencia) ----
function flashCard(t) { const a = T.flashA, b = T.flashB, k = win(t, a, b, 0.25, 0.2); if (k <= 0) return ''; const u = clamp((t - a) / (b - a));
  const mx = lerp(170, 600, ease(u * 1.1)), pull = clamp((u - 0.72) / 0.28), mx2 = mx + 330 * pull * pull;
  const P = poseClip('walk', t * 1.2); const mshadow = `<g filter="url(#blk)" transform="translate(${f(lerp(60, 330, ease(u)))},1330) scale(0.5) translate(-520,-1385)">${renderM(P)}</g>`;
  const eyes = [-1, 1].map((s) => `<ellipse cx="${f(lerp(60, 330, ease(u)) + s * 22)}" cy="860" rx="14" ry="${f(9 * (0.7 + 0.3 * Math.sin(t * 6)))}" fill="#ff2a3a"/><ellipse cx="${f(lerp(60, 330, ease(u)) + s * 22)}" cy="860" rx="40" ry="28" fill="url(#fGlow)" opacity="0.7"/>`).join('');
  const mari = `<g transform="translate(${f(mx2)},${f(1300 + Math.sin(t * 6) * 4)})"><ellipse cx="0" cy="40" rx="60" ry="12" fill="#000" opacity="0.5"/><path d="M-38,-190 Q0,-230 38,-190 L46,-60 L-46,-60Z" fill="#14101e" stroke="#8a7ab0" stroke-width="3" stroke-opacity="0.5"/><circle cx="0" cy="-236" r="34" fill="#14101e" stroke="#8a7ab0" stroke-width="3" stroke-opacity="0.5"/><path d="M-40,-60 L-48,40 M40,-60 L48,40" stroke="#14101e" stroke-width="22" stroke-linecap="round"/></g>`;
  const hand = `<path d="M${f(lerp(120, 360, ease(u)))},960 Q${f(lerp(320, 480, ease(u)))},1030 ${f(mx2 - 30)},1090" stroke="#05030a" stroke-width="34" fill="none" stroke-linecap="round" opacity="${clamp((u - 0.45) / 0.2).toFixed(2)}"/>`;
  return `<g opacity="${k.toFixed(2)}"><defs><linearGradient id="fbG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060f"/><stop offset="0.7" stop-color="#14183a"/><stop offset="1" stop-color="#0a0c1a"/></linearGradient><radialGradient id="fbL" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.7"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient><radialGradient id="fbH" cx="0" cy="0.5" r="1"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.95"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient><filter id="blk"><feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.02  0 0 0 0 0.05  0 0 0 1 0"/></filter></defs>
    <rect width="${W}" height="${H}" fill="url(#fbG)"/><rect y="1260" width="${W}" height="${H - 1260}" fill="#0c0e1c"/>${[...Array(8)].map((_, i) => `<path d="M${540 + (i - 4) * 50},1260 L${540 + (i - 4) * 360},${H}" stroke="#1c2048" stroke-width="3" opacity="0.6"/>`).join('')}
    <rect x="120" y="500" width="16" height="760" fill="#1a1c30"/><ellipse cx="128" cy="500" rx="46" ry="18" fill="#ffd98a"/><path d="M128,510 L-120,1260 H380Z" fill="url(#fbL)" opacity="0.5"/>
    <g transform="translate(830,1180)"><rect x="-150" y="-70" width="300" height="130" rx="40" fill="#05060c"/><path d="M-110,-70 Q-60,-150 60,-150 Q120,-120 140,-70Z" fill="#05060c"/><circle cx="-110" cy="-10" r="26" fill="#05060c"/><circle cx="110" cy="60" r="30" fill="#0a0a14" stroke="#1c2048" stroke-width="4"/><circle cx="-100" cy="60" r="30" fill="#0a0a14" stroke="#1c2048" stroke-width="4"/><ellipse cx="-165" cy="-5" rx="22" ry="14" fill="#fff6c8"/><ellipse cx="-330" cy="-5" rx="220" ry="${f(46 + 8 * Math.sin(t * 9))}" fill="url(#fbH)" opacity="0.8"/></g>
    ${mshadow}${eyes}${hand}${mari}<rect width="${W}" height="${H}" fill="#3a2a10" opacity="0.18"/><rect width="${W}" height="${H}" fill="#fff" opacity="${(Math.max(0, 1 - Math.abs(u - 0.94) / 0.06) * 0.7).toFixed(2)}"/></g>`; }
// ---- espejo EN VIVO: el reflejo es el estado actual de Lazy (mismo rostro, pose, parpadeo, respiracion), volteado ----
const gloss = (t, w2, h2, id) => `<defs><linearGradient id="gls${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g transform="translate(${f(((t * 70) % (w2 * 2.4)) - w2 * 0.7)},0) skewX(-14)"><rect x="${-w2 * 0.22}" y="${-h2}" width="${w2 * 0.28}" height="${h2 * 2}" fill="url(#gls${id})"/></g>`;
function liveMirror(t, id, cx, cy, rx, ry, s, lzId, face) { // glass elliptical, centered (cx,cy)
  const bulbs = [...Array(16)].map((_, i) => { const a = Math.PI + (i / 15) * Math.PI, bx = cx + Math.cos(a) * (rx + 24), by = cy + Math.sin(a) * (ry + 24) * 0.98; const tw = 0.7 + 0.3 * Math.sin(t * 5 + i); return `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(rx * 0.04 + 4)}" fill="#fff4c8" stroke="${OUT}" stroke-width="3"/><circle cx="${f(bx)}" cy="${f(by)}" r="${f(rx * 0.12 + 10)}" fill="url(#fGlow)" opacity="${tw.toFixed(2)}"/>`; }).join('');
  return `<g><defs><linearGradient id="mfG${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d98a"/><stop offset="0.5" stop-color="#b8860b"/><stop offset="1" stop-color="#fff0b0"/></linearGradient><clipPath id="mfC${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath><linearGradient id="mfW${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8c8d8"/><stop offset="1" stop-color="#7f93a8"/></linearGradient></defs>
    ${bulbs}<ellipse cx="${cx}" cy="${cy}" rx="${rx + 18}" ry="${ry + 18}" fill="url(#mfG${id})" stroke="${OUT}" stroke-width="7"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#mfW${id})"/>
    <g clip-path="url(#mfC${id})"><g transform="translate(${cx},${f(cy + ry * 0.05)}) scale(${-s},${s}) translate(-512,-340)"><use href="#${lzId}"/></g><g transform="translate(${cx},${cy})">${gloss(t, rx * 2, ry * 2, id)}</g><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-width="6" opacity="0.12"/></g></g>`; }
function mirrorCard(t, lzId) { const a = T.mirrorA, b = T.mirrorB; const k = win(t, a, b, 0.4, 0.4); if (k <= 0) return '';
  return `<g opacity="${k.toFixed(2)}"><rect width="${W}" height="${H}" fill="#05030a" opacity="0.6"/><g transform="translate(0,${f(40 * (1 - k))})">${liveMirror(t, 'big', 540, 780, 380, 520, 1.7, lzId)}${SPK(t, 14, 160, 260, 760, 900, 0.9)}</g></g>`; }

const lairFg = (t) => { const pT = t - L.i2.start; const clip = t >= L.i2.end - 0.9 ? 'laugh' : (t >= L.i2.start && pT < 0.9 ? 'point' : 'idle'); const tt = clip === 'laugh' ? t - (L.i2.end - 0.9) : clip === 'point' ? pT : t; const P = poseClip(clip, Math.max(0, tt)); P.eyes.glow = 1 + 0.25 * Math.sin(t * 7);
  const pins = [[230, 520, -5], [480, 560, 4], [740, 520, -3], [330, 760, 3], [650, 770, -6]];
  const ph = pins.map(([x, y, r], i) => `<g transform="translate(${x},${y}) rotate(${r})"><rect x="-8" y="-8" width="196" height="224" fill="#000" opacity="0.35" transform="translate(6,8)"/><rect width="180" height="208" fill="#f4f0e6" stroke="#1a1010" stroke-width="3"/><clipPath id="ph${i}"><rect x="10" y="10" width="160" height="164"/></clipPath><g clip-path="url(#ph${i})"><image href="${lazyThumb}" transform="translate(-60,-26) scale(0.48)" x="0" y="0" width="1024" height="1500"/></g><rect x="10" y="10" width="160" height="164" fill="#1a1020" opacity="0.18"/><circle cx="90" cy="-2" r="9" fill="#c8102a" stroke="#1a1010" stroke-width="2"/></g>`).join('');
  const strings = pins.map(([x, y], i) => { const [x2, y2] = pins[(i + 1) % pins.length]; return `<path d="M${x + 90},${y - 2} Q${(x + x2) / 2 + 90},${Math.max(y, y2) + 80} ${x2 + 90},${y2 - 2}" stroke="#c8102a" stroke-width="3" fill="none" opacity="0.85"/>`; }).join('');
  const k = clamp((t - 0.3) / 1.0);
  return `${strings}${ph}<g opacity="${k.toFixed(2)}"><ellipse cx="540" cy="1322" rx="${f(300 * 0.62)}" ry="26" fill="#000" opacity="0.5" filter="url(#fb)"/><g transform="translate(540,1230) scale(0.62) translate(-520,-1385)">${renderM(P)}</g></g>`; };

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t); CURPLATE = platePng[sc]; NAILS.on = true; const R = stageAt(t);
  const mkLazy = () => { setFace(R);
    const P2 = defPose2(); const e = P2.eyes; e.blinkL = P.blink.l; e.blinkR = P.blink.r; e.lookX = P.gaze.x; e.lookY = P.gaze.y; e.wide = Math.max(0, (P.lid.l - 1) * 2); e.squint = P.squint || 0;
    P2.brows.Lraise = P.brow.l.r; P2.brows.Rraise = P.brow.r.r; P2.brows.Lfrown = -P.brow.l.i; P2.brows.Rfrown = -P.brow.r.i; P2.mouth.open = Math.min(0.35, P.mouth.open); P2.mouth.wide = P.mouth.wide; P2.mouth.smile = P.mouth.smile; P2.mouth.upperTeeth = P.mouth.open > 0.2 ? 1 : 0.2;
    P2.head.yaw = P.yaw || 0; P2.head.rot = (P.roll || 0) * 0.6; P2.chest.breath = P.breath || 0; P2.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1, sway: P.hair.sway }; P2.hair.t = t; P2.hair.swayL = (P.hair.sway || 0) * 6; P2.hair.swayR = (P.hair.sway || 0) * 6; P2.skirt.t = t; P2.skirt.hem = 0.5;
    P2.noseStyle = 'D'; P2.noseK = 1.35;
    const arm = (tx, ty, k) => { const kL = ik2(SK2.shoulderL, SK2.elbowL, SK2.wristL, [512 - tx, ty], -1), kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [512 + tx, ty], 1); P2.armL.r1 = kL.r1 * k; P2.armL.r2 = kL.r2 * k; P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; };
    const kSh = clamp((t - T.ringA - 0.3) / 0.4) * (1 - clamp((t - T.l15A - 0.3) / 0.5)); if (kSh > 0) { arm(150, 300, kSh); P2.handL.curl = P2.handR.curl = [0.7, 0.7, 0.7, 0.7, 0.7]; }
    const kHug = clamp((t - T.l15A) / 0.5) * (1 - clamp((t - T.l17A) / 0.5)); if (kHug > 0) { arm(34, 520, kHug * 0.9); }
    const kRev = clamp((t - T.mirrorA) / 0.5) * (1 - clamp((t - T.mirrorB) / 0.4)); if (kRev > 0) { arm(170, 470, kRev); P2.handL.spread = P2.handR.spread = 0.5; P2.handL.curl = P2.handR.curl = [0.1, 0.1, 0.1, 0.1, 0.1]; }
    if (t > T.cta2 - 0.3) { const k = clamp((t - T.cta2 + 0.3) / 0.3); const kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [800, 330], 1); P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; P2.handR.spread = 1.2; P2.armL.r1 = 0; P2.armL.r2 = 0; }
    return renderCharacter(P2) + messyHair(t, 1); };
  const sK = seatedK(t), drop = SIT_DROP * sK, seated = sK > 0.01;
  const tf = `translate(${540 - 512 * NEWS},${1655 - 1500 * NEWS + drop}) scale(${NEWS})`;
  const stool = seated ? `<g opacity="${sK.toFixed(2)}"><ellipse cx="540" cy="1740" rx="250" ry="30" fill="#000" opacity="0.3"/><rect x="${540 - 190}" y="1620" width="14" height="120" fill="#e8c060" stroke="${OUT}" stroke-width="5"/><rect x="${540 + 176}" y="1620" width="14" height="120" fill="#e8c060" stroke="${OUT}" stroke-width="5"/><rect x="540" y="1620" width="14" height="120" fill="#e8c060" stroke="${OUT}" stroke-width="5"/></g>` : '';
  const stoolTop = seated ? `<g opacity="${sK.toFixed(2)}"><ellipse cx="540" cy="1586" rx="236" ry="46" fill="#c8486a" stroke="${OUT}" stroke-width="7"/><ellipse cx="540" cy="1574" rx="190" ry="26" fill="#e87a9a" opacity="0.7"/><path d="M304,1586 Q540,1680 776,1586" fill="none" stroke="#8a2a4a" stroke-width="5"/></g>` : '';
  const lazyBody = () => { const sh = seated ? '' : `<ellipse cx="540" cy="1650" rx="${380 * NEWS}" ry="26" fill="#000" opacity="0.35"/>`; const clipS = seated ? `<clipPath id="seatClip"><rect x="0" y="0" width="${W}" height="1570"/></clipPath>` : '';
    return `${stool}${sh}${clipS}<g ${seated ? 'clip-path="url(#seatClip)"' : ''}><g transform="${tf}"><use href="#lzSrc"/></g></g>${stoolTop}`; };
  const lzInner = (sc === 'lair') ? '' : mkLazy() + (R.wet > 0.02 ? dripsFx(clamp(R.wet * 1.3), clamp(R.wet)) : '');
  const lazy = (sc === 'lair') ? '' : lazyBody();
  const sm = (h, tt) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(h(Math.max(0, tt - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const char = (st, fn, look, seed, stateFn, who) => { if (!st) return { body: '', tool: '' }; const { ch } = st; const hs = (tt) => { const q = stateFn(tt); return q ? q.hands : 'none'; }; const nsm = sm(hs, t);
    const base = { ...st, elbowDown: true, armL: nsm.L, armR: nsm.R, blink: blinkOf(t, seed), look, t, mouthOpen: MOUTHW(who, t) };
    const shd = `<ellipse cx="${ch.x + 30 * ch.s}" cy="${ch.y + 712 * ch.s}" rx="${150 * ch.s}" ry="${22 * ch.s}" fill="#000" opacity="0.28" filter="url(#b10)"/>`;
    return { body: `${shd}<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'body' })}</g>`, tool: `<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'tool' })}</g>` }; };
  const sus = char(susState(t), drawSusan, -0.6, 0.6, susState, 'S'), wil = char(wilState(t), drawWill, sc === 'door' ? 0.6 : -0.6, 2.1, wilState, 'Y');
  const par = (f2) => `translate(540,960) scale(${1 + (cam.z - 1) * f2}) translate(${-(540 + (cam.x - 540) * f2)},${-(960 + (cam.y - 960) * f2)})`;
  const plateRefl = sc === 'home' ? `<defs><clipPath id="pmC"><rect x="680" y="350" width="300" height="440" rx="150"/></clipPath><linearGradient id="pmW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6c6d6"/><stop offset="1" stop-color="#7f93a8"/></linearGradient></defs><g clip-path="url(#pmC)"><rect x="680" y="350" width="300" height="440" fill="url(#pmW)"/><g transform="translate(830,585) scale(-0.7,0.7) translate(-512,-340)"><use href="#lzSrc"/></g><g transform="translate(830,570)">${gloss(t, 300, 440, 'pl')}</g></g>` : '';
  const bgLayer = `<g transform="${par(0.85)}"><image href="${platePng[sc]}" width="${W}" height="${H}" preserveAspectRatio="none"/>${plateRefl}</g>`;
  const worldInner = `${bgLayer}<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})">${sc === 'lair' ? lairFg(t) : ''}${wil.body}${sus.body}${lazy}${sus.tool}${wil.tool}</g>`;
  const tr = transitionAt(t); const wrapW = (scl, dx, op) => `<g opacity="${op}" transform="translate(${540 + dx},960) scale(${scl}) translate(-540,-960)">${worldInner}</g>`;
  const glitch = (g) => g > 2 ? [0, 1, 2, 3].map((i) => `<rect x="0" y="${300 + i * 380 + Math.sin(t * 40 + i) * 40}" width="${W}" height="${50 + i * 14}" fill="#fff" opacity="${0.1 * Math.min(1, g / 20)}" transform="translate(${Math.sin(t * 77 + i) * g * 0.8},0)"/>`).join('') : '';
  const world0 = tr.on ? (tr.ghost ? wrapW(tr.sc * 1.05, tr.gx * 1.4, 0.4) + wrapW(tr.sc * 1.025, tr.gx * 0.7, 0.55) : '') + wrapW(tr.sc, 0, 1) + glitch(Math.abs(tr.gx)) + `<rect width="${W}" height="${H}" fill="#fff" opacity="${tr.fl}"/>` : worldInner;
  const nightTint = sc === 'door' ? `<rect width="${W}" height="${H}" fill="#0a1040" opacity="0.1"/>` : '';
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${sc === 'lair' ? '#05000a' : '#1a0a14'}" stop-opacity="${sc === 'lair' ? 0.6 : 0.35}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const bnOn = stepBanners.some(([n, tx, a, b]) => t > a - 0.1 && t < b + 0.1); const chipTop = (t < T.slateEnd + 0.4 || bnOn) ? '' : `<g transform="translate(540,300)"><defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd84a"/><stop offset="1" stop-color="#b8780f"/></linearGradient></defs><rect x="-226" y="-40" width="440" height="88" rx="44" fill="#000" opacity="0.3"/><rect x="-230" y="-46" width="440" height="88" rx="44" fill="#1a1024" stroke="#d4a24c" stroke-width="6"/><text x="0" y="18" font-family="Bungee" font-size="48" text-anchor="middle" letter-spacing="3" fill="url(#chg)" stroke="${OUT}" stroke-width="4" paint-order="stroke">DÍA 18/30</text></g>`;
  const insOn = T_INS.some(([a0, b0]) => t > a0 - 0.2 && t < b0 + 0.2); const pipK = (sc === 'home' && !insOn && t > T.sitA && t < T.mirrorA - 0.2 && cam.z > 1.25) ? clamp((cam.z - 1.25) / 0.12) : 0; const pipM = pipK > 0.02 ? `<g opacity="${pipK.toFixed(2)}">${liveMirror(t, 'pip', 195, 520, 120, 170, 0.5, 'lzSrc')}</g>` : '';
  const flashR = Math.max(0, 1 - Math.abs(t - T.ringA) / 0.15) * 0.5 + Math.max(0, 1 - Math.abs(t - (T.mirrorA + 0.1)) / 0.25) * 0.45;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}${ALLDEFS}${MDEFS}${FDEFS}<defs><g id="lzSrc">${lzInner}</g></defs><defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter></defs>${world0}${nightTint}${vignette}${slateIntro(t - T.slateA)}
    ${chipTop}${insAll(t)}${pipM}${mirrorCard(t, 'lzSrc')}${phonesCard(t, 'lzSrc')}${newsCard(t)}${flashCard(t)}
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
