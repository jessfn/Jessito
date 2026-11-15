// Lazy Dawns - ESPECIAL (no cuenta como dia): "La revelacion de los rizos". Voces: narrador, Dante (estilista), Memo (ayudante). Los personajes NO mueven la boca para hablar.
// Uso: node render_especial.mjs preview 5 12 ...   |   node render_especial.mjs <inicio> <fin> <salida.mp4>   |   node render_especial.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, hand } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { turbanSvg, demoLock } from './hair_hd.mjs';
import { drawDante, drawMemo, handsToTargets, salonTool, armIK } from './chars.mjs';
import { makeDirector } from './director8.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/especial');
const W = 1080, H = 1920, FPS = 30;
const ropt = { font: { fontFiles: [path.join(here, '../assets/fonts/Anton-Regular.ttf')], loadSystemFonts: true, defaultFontFamily: 'Inter' } };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const pop = (t, t0, d = 0.35) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const win = (t, a, b, fi = 0.25, fo = 0.25) => clamp((t - a) / fi) * clamp((b - t) / fo);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const OUT = '#12090a';
const nm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9]/g, '');
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------- guion con tiempos ----------------
const DATA = JSON.parse(readFileSync(path.join(B, 'lines.json'), 'utf8'));
const L = Object.fromEntries(DATA.lines.map((l) => [l.id, l]));
const DUR = DATA.total;
const w = (id, word, n = 0) => { const r = L[id].words.filter((x) => nm(x[0]) === nm(word))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + word); return r[1]; };
const T = {
  slateEnd: 1.4, boxA: w('l1', 'caja') - 0.3, noteA: w('l2', 'confia') - 0.55, enter: w('l2', 'llego') - 0.1, wrap: w('l3', 'Cierra') + 0.3,
  sprayA: w('l4', 'atomizador') - 0.3, creamA: w('l4', 'crema') - 0.3, coilA: w('l5', 'mechon') - 0.3, diffA: w('l6', 'difusor') - 0.4, shakeA: w('l7', 'movio') - 0.3,
  hallA: L.l8.start - 0.1, walkA: L.l8.start + 0.5, countA: L.l9.start - 0.2, reveal: L.l10.start + 0.12, calmA: L.l12.start - 0.2,
  mEnter: w('l14', 'alguien') - 0.3, gloveA: w('l14', 'guante') - 0.3, mGone: w('l14', 'desaparecio') - 0.2, mEnd: L.l14.end,
  vote: w('l15', 'Que') - 0.1, optA: w('l15', 'lunar'), optB: w('l15', 'nariz'), cta1: w('l15', 'Comenta'), cta2: w('l15', 'sigueme'),
};
T.arrive = T.countA - 0.4; T.noteB = T.noteA + 2.6; T.sprayB = T.creamA - 0.2; T.creamB = L.l4.end + 0.4; T.coilB = L.l5.end + 0.4; T.diffB = T.diffA + 3.6; T.boxB = T.boxA + 2.6; T.gloveB = T.gloveA + 2.4;
T.walks = [[T.walkA, T.arrive]];
T.scenes = [T.slateEnd, T.boxA, T.noteA, T.enter, T.wrap, T.sprayA, T.creamA, T.coilA, T.diffA, T.hallA, T.countA, T.reveal, T.calmA, T.mEnter, T.gloveA, T.vote];
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });

// ---------------- fondos 3D y defs ----------------
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates3d', n + '.png')));
const platePng = { backstage: PL('backstage'), ballroom: PL('ballroom') };
const VIN = `<linearGradient id="vin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#be185d"/><stop offset="0.35" stop-color="#ec4899"/><stop offset="0.7" stop-color="#db2777"/><stop offset="1" stop-color="#831843"/></linearGradient><linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ca3af"/><stop offset="0.4" stop-color="#f3f4f6"/><stop offset="1" stop-color="#6b7280"/></linearGradient>`;
function chairBack() { return `<defs>${VIN}</defs><ellipse cx="540" cy="1650" rx="330" ry="34" fill="#000" opacity="0.3"/><rect x="496" y="1490" width="88" height="170" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/><ellipse cx="540" cy="1660" rx="210" ry="30" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>
  <rect x="300" y="820" width="480" height="470" rx="120" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M336,870 Q336,846 400,846" stroke="#fff" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="236" y="1080" width="96" height="46" rx="22" fill="#831843" stroke="${OUT}" stroke-width="7"/><rect x="748" y="1080" width="96" height="46" rx="22" fill="#831843" stroke="${OUT}" stroke-width="7"/>`; }
function chairFront() { return `<path d="M276,1246 Q540,1226 804,1246 L822,1470 Q540,1498 258,1470Z" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M316,1280 Q540,1264 764,1280" stroke="#fff" stroke-opacity="0.3" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="300" y="1470" width="480" height="36" rx="14" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>`; }

// ---------------- personajes, lugares y camara ----------------
const sceneAt = (t) => (t < T.hallA ? 'backstage' : 'ballroom');
const K = 0.68 / 0.62;
function lazyPlace(t) {
  if (t < T.hallA) return { x: 540, fy: 1355, S: 0.68, vis: true, seated: true };
  const u = ease(clamp((t - T.walkA) / (T.arrive - T.walkA))); return { x: 540, fy: lerp(1190, 1620, u), S: lerp(0.36, 0.68, u), vis: true, seated: false };
}
const headOf = (t) => { const p = lazyPlace(t); const py = p.fy - 790 * p.S; return { x: p.x, y: py - 215 * p.S, S: p.S }; };
const facePt = (t, lx, ly) => { const h = headOf(t); return { x: h.x + lx * h.S, y: h.y + ly * h.S }; };
function toolPose(ch, tipX, tipY, len, theta) { const r = theta * Math.PI / 180, wl = len * ch.s, ox = tipX - wl * -Math.sin(r), oy = tipY - wl * Math.cos(r); return { toolX: (ox - ch.x) / ch.s, toolY: (oy - ch.y) / ch.s, toolR: theta, toolS: 1 }; }
const toLocal = (ch, x, y) => ({ x: (x - ch.x) / ch.s, y: (y - ch.y) / ch.s });
const DANTE = { x: 905, y: 745, s: 0.8 }, MEMO = { x: 150, y: 790, s: 0.74 };
const DANTE_B = { x: 760, y: 1066, s: 0.74 }, MEMO_B = { x: 330, y: 1100, s: 0.68 };
const danteCh = (t) => (t < T.hallA ? { ...DANTE, x: DANTE.x + 420 * (1 - ease((t - T.enter) / 1.4)) } : { ...DANTE_B, x: lerp(1250, DANTE_B.x, ease((t - T.hallA - 0.3) / 1.6)) });
const memoCh = (t) => (t < T.hallA ? { ...MEMO, x: MEMO.x - 420 * (1 - ease((t - T.enter - 0.3) / 1.4)) } : { ...MEMO_B, x: lerp(-200, MEMO_B.x, ease((t - T.hallA - 0.3) / 1.6)) });
function danteState(t) { const ch = danteCh(t); if (t < T.enter - 0.2) return null; let mood = 'happy', tool = 'none', o = {}, hands = 'none';
  const at = (len, th, lx, ly) => { const p = facePt(t, lx, ly); return toolPose(ch, p.x, p.y, len, th); };
  if (t >= T.enter && t < T.wrap) mood = 'amused';
  if (t >= L.l3.start && t < T.wrap) mood = 'calm';
  if (t >= T.wrap && t < T.sprayA - 0.1) { mood = 'proud'; }
  if (t >= T.sprayA - 0.1 && t < T.creamA - 0.1) { tool = 'spray'; mood = 'focus'; o = at(150, 96, 110 + Math.sin(t * 6) * 22, -70); }
  if (t >= T.creamA - 0.1 && t < T.coilA - 0.1) { tool = 'bottle'; mood = 'focus'; o = at(150, 100, 130, -40 + Math.sin(t * 5) * 30); }
  if (t >= T.coilA - 0.1 && t < T.diffA - 0.1) { tool = 'comb'; mood = 'focus'; o = at(130, 98, 120, -80 + Math.sin(t * 7) * 24); }
  if (t >= T.diffA - 0.1 && t < T.hallA) { tool = 'dryer'; mood = 'focus'; o = at(260, 70, 130, -90 + Math.sin(t * 9) * 12); }
  if (t >= T.hallA) { mood = 'happy'; hands = 'none'; }
  if (t >= T.countA - 0.1) { mood = 'grin'; } if (t >= T.reveal) mood = 'shock'; if (t >= T.reveal + 1.5) mood = 'grin'; if (t >= L.l13.start) mood = 'proud'; if (t >= T.mEnter) mood = 'worry';
  const reach = t >= T.countA - 0.6 && t < T.reveal + 0.9 ? (() => { const h = headOf(t), tg = toLocal(ch, h.x + 70 * h.S, h.y - 215 * h.S); return { x: tg.x, y: tg.y }; })() : null;
  return { mood, tool, hands, ...o, armR: reach || undefined, reach: !!reach, ch };
}
function memoState(t) { const ch = memoCh(t); if (t < T.enter + 0.1) return null; let mood = 'happy', hands = 'none';
  if (t >= L.l6.start && t < T.hallA) mood = 'scream'; if (t >= T.hallA) mood = 'happy'; if (t >= T.reveal) mood = 'shock'; if (t >= T.reveal + 1.5) { mood = 'grin'; hands = 'wave'; } if (t >= T.mEnter) mood = 'worry';
  return { mood, hands, ch };
}
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
const CAM = [[0, 1.0, 540, 960], [T.slateEnd, 1.0, 540, 960], [T.boxA - 0.2, 1.08, 540, 930], [T.noteB, 1.0, 540, 940], [T.enter, 1.0, 540, 960], [T.wrap - 0.4, 1.12, 540, 800], [T.wrap + 1.2, 1.0, 540, 900], [T.sprayA, 1.18, 560, 760], [T.coilA, 1.1, 540, 820], [T.diffA, 1.22, 600, 780], [T.shakeA, 1.14, 540, 780], [T.hallA - 0.1, 1.04, 540, 900],
  [T.hallA + 0.1, 1.0, 540, 1000], [T.walkA, 1.0, 540, 1000], [T.arrive, 1.02, 540, 1040], [T.countA, 1.2, 540, 960], [T.reveal - 0.1, 1.45, 540, 930], [T.reveal + 0.4, 1.9, 540, 900], [T.reveal + 2.4, 1.55, 560, 960], [T.calmA, 1.1, 540, 1000], [T.calmA + 3.4, 1.0, 540, 1000],
  [T.mEnter - 0.2, 1.0, 540, 1000], [T.mEnter + 0.4, 2.3, 540, 1230], [T.gloveA, 2.3, 540, 1230], [T.mGone + 0.3, 1.0, 540, 1000], [T.vote - 0.2, 1.0, 540, 1000], [9999, 1.0, 540, 1000]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.reveal, T.reveal + 0.7, 0.02, 0.5) * 12 + win(t, T.boxA, T.boxA + 0.3, 0.02, 0.3) * 4 + win(t, T.mEnter, T.mEnter + 0.4, 0.02, 0.3) * 5 + win(t, T.shakeA, T.hallA - 0.3, 0.1, 0.2) * 2.5;
  const orbit = win(t, T.reveal + 1.2, T.calmA + 3.5, 0.6, 0.8) * Math.sin((t - T.reveal) * 0.9) * 40;
  return { z: lerp(a[1], b[1], u) * (1 + 0.015 * Math.sin(t * 0.7)), x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6 + orbit, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}
