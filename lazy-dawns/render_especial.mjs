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
const OBJN = { title: 72, box: 36, note: 24, spray: 30, creamgel: 30, strands: 36, diffuser: 30, glove: 24 };
const imgCache = new Map();
const obj3 = (name, u, cx, cy, w, h = w) => { const i = Math.min(OBJN[name] - 1, Math.max(0, Math.round(clamp(u) * (OBJN[name] - 1)))); const key = name + i; if (!imgCache.has(key)) imgCache.set(key, 'data:image/png;base64,' + readFileSync(path.join(here, 'plates3d/obj', name, 'f' + String(i).padStart(3, '0') + '.png')).toString('base64')); return `<image href="${imgCache.get(key)}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/>`; };
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
  vote: w('l15', 'Que') - 0.1, optA: w('l15', 'cambiar'), optB: w('l15', 'mejorar'), cta1: w('l15', 'Comenta'), cta2: w('l15', 'sigueme'),
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
  [T.mEnter - 0.2, 1.0, 540, 1000], [T.mEnter + 0.4, 2.2, 270, 1180], [T.gloveA, 2.2, 270, 1180], [T.mGone + 0.3, 1.0, 540, 1000], [T.vote - 0.2, 1.0, 540, 1000], [9999, 1.0, 540, 1000]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.reveal, T.reveal + 0.7, 0.02, 0.5) * 12 + win(t, T.boxA, T.boxA + 0.3, 0.02, 0.3) * 4 + win(t, T.mEnter, T.mEnter + 0.4, 0.02, 0.3) * 5 + win(t, T.shakeA, T.hallA - 0.3, 0.1, 0.2) * 2.5;
  const orbit = win(t, T.reveal + 1.2, T.calmA + 3.5, 0.6, 0.8) * Math.sin((t - T.reveal) * 0.9) * 40;
  return { z: lerp(a[1], b[1], u) * (1 + 0.015 * Math.sin(t * 0.7)), x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6 + orbit, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}

// ---------------- invitados (cada uno con diseno distinto) ----------------
const GUESTS = [
  { skin: '#f1c9a5', hair: 'wavy', hc: '#d9a441', cloth: '#be123c', acc: 'phone' }, { skin: '#8d5a3b', hair: 'bald', hc: '#1f1611', cloth: '#111827', acc: 'camera', beard: true }, { skin: '#6b4226', hair: 'puff', hc: '#120c0a', cloth: '#f59e0b', acc: 'glass' },
  { skin: '#e8b890', hair: 'slick', hc: '#2b2118', cloth: '#1d4ed8', acc: 'phone', glasses: true }, { skin: '#c68a5a', hair: 'bun', hc: '#3a2418', cloth: '#ec4899', acc: 'fan', hat: true }, { skin: '#f5d3b4', hair: 'bob', hc: '#0f766e', cloth: '#7c3aed', acc: 'mic' },
  { skin: '#d9a073', hair: 'curly', hc: '#c2410c', cloth: '#15803d', acc: 'phone', mustache: true }, { skin: '#a9714a', hair: 'long', hc: '#0b0b0f', cloth: '#f8fafc', acc: 'camera' },
];
function guest(v, t, react, id) { const g = GUESTS[v % GUESTS.length]; const bob = Math.sin(t * 2.3 + id) * 3 + react * Math.abs(Math.sin(t * 5 + id)) * -10;
  const hairBack = { wavy: `<path d="M-96,40 Q-120,200 -84,300 L84,300 Q120,200 96,40 Q96,-110 0,-112 Q-96,-110 -96,40Z" fill="${g.hc}" stroke="${OUT}" stroke-width="6"/>`, puff: `<circle cx="0" cy="-70" r="118" fill="${g.hc}" stroke="${OUT}" stroke-width="6"/>`, long: `<path d="M-94,0 Q-112,220 -80,330 L80,330 Q112,220 94,0Q94,-108 0,-110 Q-94,-108 -94,0Z" fill="${g.hc}" stroke="${OUT}" stroke-width="6"/>`, bob: `<path d="M-100,60 Q-112,-112 0,-114 Q112,-112 100,60 Q60,90 0,60 Q-60,90 -100,60Z" fill="${g.hc}" stroke="${OUT}" stroke-width="6"/>`, curly: `${[...Array(11)].map((_, i) => `<circle cx="${Math.cos(i * 0.62 + 3.3) * 88}" cy="${-30 + Math.sin(i * 0.62 + 3.3) * 88}" r="34" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>`).join('')}` }[g.hair] || '';
  const hairTop = { wavy: `<path d="M-90,-10 Q-92,-102 0,-104 Q92,-102 90,-10 Q50,-62 -10,-52 Q-60,-48 -90,-10Z" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>`, slick: `<path d="M-84,-20 Q-80,-100 10,-104 Q90,-100 84,-20 Q60,-66 4,-62 Q-50,-60 -84,-20Z" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>`, bun: `<circle cx="0" cy="-130" r="40" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/><path d="M-86,-14 Q-84,-98 0,-100 Q84,-98 86,-14 Q50,-58 0,-54 Q-50,-58 -86,-14Z" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>`, puff: `<path d="M-80,-20 Q-80,-96 0,-98 Q80,-96 80,-20 Q50,-60 0,-56 Q-50,-60 -80,-20Z" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>`, long: `<path d="M-90,-6 Q-90,-104 0,-106 Q90,-104 90,-6 Q40,-66 -4,-60 Q-52,-56 -90,-6Z" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>`, bob: `<path d="M-92,10 Q-90,-104 0,-106 Q90,-104 92,10 Q50,-56 0,-52 Q-50,-56 -92,10Z" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>`, curly: '' }[g.hair] || '';
  const hat = g.hat ? `<g transform="translate(34,-112) rotate(24)"><ellipse rx="52" ry="16" fill="#be185d" stroke="${OUT}" stroke-width="5"/><path d="M-10,-6 Q40,-70 60,-40" stroke="#f9a8d4" stroke-width="7" fill="none" stroke-linecap="round"/></g>` : '';
  const face = `<ellipse cx="0" cy="0" rx="78" ry="88" fill="${g.skin}" stroke="${OUT}" stroke-width="6"/><ellipse cx="-30" cy="-6" rx="13" ry="${15 + react * 6}" fill="#fff" stroke="${OUT}" stroke-width="4"/><ellipse cx="30" cy="-6" rx="13" ry="${15 + react * 6}" fill="#fff" stroke="${OUT}" stroke-width="4"/><circle cx="-28" cy="-4" r="6" fill="#2a1a10"/><circle cx="32" cy="-4" r="6" fill="#2a1a10"/>
    <path d="M-46,${-30 - react * 8} q16,-10 32,0 M14,${-30 - react * 8} q16,-10 32,0" stroke="${OUT}" stroke-width="5" fill="none" stroke-linecap="round"/>${react > 0.5 ? `<ellipse cx="0" cy="48" rx="${16}" ry="${20 * react}" fill="#7a1f2a" stroke="${OUT}" stroke-width="4"/>` : `<path d="M-24,44 Q0,62 24,44" stroke="${OUT}" stroke-width="6" fill="none" stroke-linecap="round"/>`}`;
  const extra = (g.glasses ? `<circle cx="-30" cy="-6" r="21" fill="none" stroke="#374151" stroke-width="5"/><circle cx="30" cy="-6" r="21" fill="none" stroke="#374151" stroke-width="5"/><path d="M-9,-6 h18" stroke="#374151" stroke-width="5"/>` : '') + (g.beard ? `<path d="M-70,20 Q-60,100 0,104 Q60,100 70,20 Q40,62 0,58 Q-40,62 -70,20Z" fill="${g.hc}" stroke="${OUT}" stroke-width="5"/>` : '') + (g.mustache ? `<path d="M-30,34 Q-14,24 0,34 Q14,24 30,34 Q14,46 0,40 Q-14,46 -30,34Z" fill="${g.hc}" stroke="${OUT}" stroke-width="4"/>` : '');
  const raised = react > 0.2 || g.acc === 'phone';
  const accSvg = { phone: `<g transform="translate(118,${raised ? -40 - react * 40 : 90}) rotate(-8)"><rect x="-22" y="-36" width="44" height="72" rx="8" fill="#0f172a" stroke="${OUT}" stroke-width="5"/><rect x="-16" y="-30" width="32" height="54" rx="4" fill="#7dd3fc"/></g>`, camera: `<g transform="translate(110,${-20 - react * 30})"><rect x="-44" y="-26" width="88" height="56" rx="10" fill="#1f2937" stroke="${OUT}" stroke-width="5"/><circle r="20" fill="#94a3b8" stroke="${OUT}" stroke-width="5"/><circle r="9" fill="#0f172a"/></g>`, glass: `<g transform="translate(116,60)"><path d="M-18,-40 h36 l-8,50 h-20Z" fill="#fde68a" fill-opacity="0.8" stroke="${OUT}" stroke-width="5"/><path d="M0,10 v36 M-16,46 h32" stroke="${OUT}" stroke-width="5"/></g>`, fan: `<g transform="translate(112,50) rotate(-30)">${[0, 1, 2, 3, 4].map((i) => `<path d="M0,0 L${Math.cos(i * 0.5 - 1.2) * 70},${Math.sin(i * 0.5 - 1.2) * 70} L${Math.cos(i * 0.5 - 0.7) * 70},${Math.sin(i * 0.5 - 0.7) * 70}Z" fill="${i % 2 ? '#fbcfe8' : '#f472b6'}" stroke="${OUT}" stroke-width="3"/>`).join('')}</g>`, mic: `<g transform="translate(112,20)"><rect x="-8" y="0" width="16" height="70" rx="8" fill="#d4a24c" stroke="${OUT}" stroke-width="4"/><circle cx="0" cy="-8" r="20" fill="#0f172a" stroke="${OUT}" stroke-width="4"/></g>` }[g.acc];
  const body = `<path d="M-150,330 Q-150,170 -70,150 L70,150 Q150,170 150,330Z" fill="${g.cloth}" stroke="${OUT}" stroke-width="7"/><path d="M-30,150 Q0,200 30,150" fill="${g.skin}" stroke="${OUT}" stroke-width="5"/>${g.cloth === '#111827' ? `<path d="M-14,160 l14,14 l14,-14 l-14,-8Z" fill="#b91c1c" stroke="${OUT}" stroke-width="3"/>` : ''}<rect x="-26" y="86" width="52" height="68" fill="${g.skin}" stroke="${OUT}" stroke-width="5"/>`;
  return `<g transform="translate(0,${bob})">${hairBack}${body}${face}${extra}${hairTop}${hat}${accSvg}</g>`; }
const CROWD = [[-1, 70, 1330, 0.46, 0], [-1, 215, 1255, 0.38, 1], [-1, 105, 1180, 0.31, 2], [-1, 250, 1130, 0.27, 3], [-1, 20, 1450, 0.52, 4], [1, 1010, 1330, 0.46, 5], [1, 865, 1255, 0.38, 6], [1, 975, 1180, 0.31, 7], [1, 830, 1130, 0.27, 0], [1, 1060, 1450, 0.52, 3]];
function crowd(t) { const react = clamp((t - T.reveal + 0.1) / 0.5) * (1 - 0.6 * smooth((t - T.mEnter) / 0.6)) + 0.0;
  const fl = (id) => { const ph = (t * 3.1 + id * 0.77) % 1; return react > 0.3 && ph < 0.08 ? 1 - ph / 0.08 : 0; };
  const draw = CROWD.slice().sort((a, b) => a[2] - b[2]).map(([m, x, y, s, v], i) => { const id = i + v * 3; const f = fl(id), flash = f > 0.06 ? `<g transform="translate(${m * 40},-60)"><path fill-opacity="${f.toFixed(2)}" d="M0,-${(40 + 70 * f).toFixed(0)} L12,-12 L${(40 + 70 * f).toFixed(0)},0 L12,12 L0,${(40 + 70 * f).toFixed(0)} L-12,12 L-${(40 + 70 * f).toFixed(0)},0 L-12,-12Z" fill="#fff"/></g>` : '';
    return `<g transform="translate(${x},${y}) scale(${s * (m < 0 ? 1 : -1) * -1},${s})"><g>${guest(v, t, react, id)}</g>${flash}</g>`; }).join('');
  const posts = [-1, 1].map((m) => [0, 1, 2, 3, 4].map((i) => { const x = m < 0 ? 330 - i * 28 : 750 + i * 28, y = 1230 + i * 120, s = 0.4 + i * 0.1; return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-8" y="-130" width="16" height="130" fill="#d4a24c" stroke="${OUT}" stroke-width="5"/><circle cy="-136" r="16" fill="#fde68a" stroke="${OUT}" stroke-width="5"/><ellipse cy="0" rx="34" ry="9" fill="#a16207" stroke="${OUT}" stroke-width="5"/></g>`; }).join('')).join('');
  const ropes = [-1, 1].map((m) => `<path d="M${m < 0 ? 330 : 750},1094 Q${m < 0 ? 300 : 780},1210 ${m < 0 ? 302 : 778},1350 Q${m < 0 ? 270 : 810},1470 ${m < 0 ? 246 : 834},1590" stroke="${OUT}" stroke-width="16" fill="none"/><path d="M${m < 0 ? 330 : 750},1094 Q${m < 0 ? 300 : 780},1210 ${m < 0 ? 302 : 778},1350 Q${m < 0 ? 270 : 810},1470 ${m < 0 ? 246 : 834},1590" stroke="#b91c1c" stroke-width="9" fill="none"/>`).join('');
  return `<defs><radialGradient id="fl"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><g>${draw}</g>${ropes}${posts}`; }

// ---------------- figura misteriosa M ----------------
function mystery(t) { const a = win(t, T.mEnter, T.mGone, 0.8, 0.5); if (a <= 0 && t > T.mGone + 1.2) return ''; const vanish = clamp((t - T.mGone) / 0.8);
  const smoke = vanish > 0 && vanish < 1 ? [...Array(10)].map((_, i) => `<circle cx="${Math.cos(i * 0.9) * 60 * vanish * 1.6}" cy="${-130 - Math.sin(i * 1.3) * 90 * vanish}" r="${30 + 50 * vanish}" fill="#cbd5e1" opacity="${0.55 * (1 - vanish)}"/>`).join('') : '';
  const glove = `<g transform="translate(112,-96) rotate(${-24 + Math.sin(t * 3) * 4})"><path d="M-18,0 q-6,-54 8,-78 l24,0 q10,40 -4,78Z" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-12,-72 l-10,-30 M-2,-78 l0,-34 M8,-76 l10,-30 M18,-70 l16,-24" stroke="#0b0b10" stroke-width="12" stroke-linecap="round"/><text x="2" y="-18" font-family="Anton" font-size="34" text-anchor="middle" fill="#fde68a">M</text></g>`;
  return `<g transform="translate(170,1085) scale(0.5)" opacity="${a * (1 - vanish)}"><ellipse cx="0" cy="8" rx="120" ry="26" fill="#000" opacity="0.5"/><path d="M-120,0 Q-130,-250 -40,-300 L40,-300 Q130,-250 120,0Z" fill="#0b0b10" stroke="${OUT}" stroke-width="6"/><path d="M-26,-296 L0,-230 L26,-296Z" fill="#7f1d1d"/><ellipse cx="0" cy="-330" rx="66" ry="72" fill="#14141c"/><ellipse cx="0" cy="-392" rx="118" ry="22" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-62,-396 Q0,-496 62,-396Z" fill="#0b0b10" stroke="${OUT}" stroke-width="5"/><path d="M-64,-402 H64" stroke="#d4a24c" stroke-width="10"/>
    <path d="M-32,-316 Q0,-282 32,-316 Q0,-300 -32,-316Z" fill="#fff" stroke="#fff" stroke-width="3"/><circle cx="-24" cy="-344" r="5" fill="#ef4444"/><circle cx="24" cy="-344" r="5" fill="#ef4444"/>${glove}</g><g>${smoke ? `<g transform="translate(170,1085) scale(0.5)">${smoke}</g>` : ''}</g>`; }

// ---------------- efectos epicos de la revelacion ----------------
const headPx = (t) => { const h = headOf(t); return { x: h.x, y: h.y - 40 * h.S, S: h.S }; };
function godRays(t) { const d = t - T.reveal; if (d < -0.05 || d > 8) return ''; const a = smooth((d + 0.05) / 0.4) * (1 - smooth((d - 4.5) / 3)); const h = headPx(t), n = 16;
  return `<defs><radialGradient id="grg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6d0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffd98a" stop-opacity="0.35"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs><g opacity="${a}"><circle cx="${h.x}" cy="${h.y}" r="${520 + 40 * Math.sin(t * 6)}" fill="url(#grg)"/>${[...Array(n)].map((_, i) => { const a0 = i / n * 6.283 + d * 0.22, a1 = a0 + 0.1; return `<path d="M${h.x},${h.y} L${h.x + Math.cos(a0) * 1100},${h.y + Math.sin(a0) * 1100} L${h.x + Math.cos(a1) * 1100},${h.y + Math.sin(a1) * 1100}Z" fill="#fff0c0" opacity="${i % 2 ? 0.13 : 0.2}"/>`; }).join('')}</g>`; }
function flashScreen(t) { const d = t - T.reveal; if (d < -0.03 || d > 0.8) return ''; const k = d < 0 ? 0.6 : Math.max(0, 1 - d / 0.45); return `<rect width="${W}" height="${H}" fill="#fff" opacity="${k * 0.9}"/>`; }
function flashFx(t) { const d = t - T.reveal; if (d < -0.03 || d > 0.8) return ''; const h = headPx(t); const ring = d > 0 ? `<circle cx="${h.x}" cy="${h.y}" r="${80 + d * 1500}" fill="none" stroke="#fff" stroke-width="${26 * (1 - d / 0.8)}" opacity="${1 - d / 0.8}"/><circle cx="${h.x}" cy="${h.y}" r="${40 + d * 1000}" fill="none" stroke="#ffe08a" stroke-width="${14 * (1 - d / 0.8)}" opacity="${1 - d / 0.8}"/>` : '';
  const lines = d > 0 && d < 0.7 ? [...Array(28)].map((_, i) => { const a = i / 28 * 6.283 + rnd(i) * 0.2, r0 = 200 + d * 900, r1 = r0 + 400 * (1 - d); return `<line x1="${h.x + Math.cos(a) * r0}" y1="${h.y + Math.sin(a) * r0}" x2="${h.x + Math.cos(a) * r1}" y2="${h.y + Math.sin(a) * r1}" stroke="#fff" stroke-width="${6 + rnd(i + 5) * 10}" opacity="${0.7 * (1 - d / 0.7)}" stroke-linecap="round"/>`; }).join('') : '';
  return `${ring}${lines}`; }
function glitterBurst(t) { const d = t - T.reveal; if (d < 0 || d > 5) return ''; const h = headPx(t); const cols = ['#ffe14d', '#ff9ad0', '#ffffff', '#c4b5fd', '#7dd3fc'];
  return [...Array(110)].map((_, i) => { const a = rnd(i) * 6.283, sp = 160 + rnd(i + 9) * 620, age = d - rnd(i + 3) * 0.12; if (age < 0) return ''; const x = h.x + Math.cos(a) * sp * age * (1 - 0.18 * age) + Math.sin(i) * 6, y = h.y + Math.sin(a) * sp * age * 0.85 + 220 * age * age; const op = clamp(1 - age / 3.8) * (0.5 + 0.5 * Math.sin(t * 16 + i)); if (op <= 0.02 || y > 2100) return ''; const s = 0.7 + rnd(i + 1) * 1.5;
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${i * 40 + t * 120}) scale(${s})" opacity="${op.toFixed(2)}"><path d="M0,-9 L2.6,0 L0,9 L-2.6,0Z M-9,0 L0,2.6 L9,0 L0,-2.6Z" fill="${cols[i % 5]}"/></g>`; }).join(''); }
function confetti(t) { const a = T.calmA - 0.3, b = T.calmA + 5; if (t < a || t > b) return ''; const d = t - a; const cols = ['#fbbf24', '#f472b6', '#fff', '#a78bfa', '#34d399'];
  return [...Array(70)].map((_, i) => { const x0 = rnd(i) * W, age = d - rnd(i + 7) * 1.5; if (age < 0) return ''; const y = -60 + age * (260 + rnd(i + 2) * 260), x = x0 + Math.sin(age * 3 + i) * 40; if (y > H + 40) return ''; return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${10 + rnd(i + 4) * 10}" height="${18 + rnd(i + 6) * 10}" fill="${cols[i % 5]}" stroke="${OUT}" stroke-width="2" transform="rotate(${(age * 240 + i * 33) % 360} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }).join(''); }
function flyTurban(t) { const d = t - T.reveal; if (d < 0 || d > 1.6) return ''; const h = headOf(t), k = ease(d / 1.4); return `<g transform="translate(${h.x + 280 * k},${h.y - 700 * k}) rotate(${d * 520}) scale(${h.S * (1 - 0.35 * k)})" opacity="${1 - clamp((d - 1.0) / 0.6)}">${turbanSvg({ tw: 0 })}</g>`; }
function titleFx(t) { const a = T.reveal + 0.7, b = T.reveal + 3.2; const k = win(t, a, b, 0.25, 0.4); if (k <= 0) return ''; const s = pop(t, a, 0.45);
  return `<g transform="translate(540,590) scale(${s})" opacity="${k}"><defs><linearGradient id="ttl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset="0.5" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></linearGradient></defs><text x="0" y="0" font-family="Anton" font-size="190" text-anchor="middle" fill="url(#ttl)" stroke="${OUT}" stroke-width="22" paint-order="stroke" letter-spacing="6">¡RIZOS!</text><text x="0" y="88" font-family="Anton" font-size="56" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="12" paint-order="stroke" letter-spacing="8">LA REVELACIÓN</text></g>`; }
function letterbox(t) { const k = win(t, T.reveal - 0.7, T.calmA + 3.6, 0.5, 0.7); if (k <= 0) return ''; return `<rect width="${W}" height="${120 * k}" fill="#000"/><rect y="${H - 120 * k}" width="${W}" height="${120 * k}" fill="#000"/>`; }
function spotDark(t) { const k = win(t, T.countA - 0.2, T.reveal + 0.05, 0.5, 0.05); if (k <= 0) return ''; const h = headPx(t); return `<defs><radialGradient id="spd" cx="0.5" cy="0.5" r="0.5"><stop offset="0.25" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.92"/></radialGradient></defs><g opacity="${k}"><rect width="${W}" height="${H}" fill="#000" opacity="0.35"/><ellipse cx="${h.x}" cy="${h.y + 30}" rx="${700 - 220 * k}" ry="${900 - 280 * k}" fill="url(#spd)"/></g>`; }
function doorsFx(t) { const d = t - T.hallA; if (d < -0.1 || d > 1.3) return ''; const o = ease(d / 1.1); return `<g opacity="${1 - clamp((d - 0.9) / 0.4)}"><rect x="0" y="0" width="${540 * (1 - o)}" height="${H}" fill="#3a1218" stroke="${OUT}" stroke-width="10"/><rect x="${540 + 540 * o}" y="0" width="${540 * (1 - o)}" height="${H}" fill="#3a1218" stroke="${OUT}" stroke-width="10"/><rect x="${540 * (1 - o) - 22}" y="0" width="22" height="${H}" fill="#d4a24c"/><rect x="${540 + 540 * o}" y="0" width="22" height="${H}" fill="#d4a24c"/><rect width="${W}" height="${H}" fill="#fff6d0" opacity="${0.55 * (1 - o)}"/></g>`; }

// ---------------- inserts cinematograficos (objetos disenados a detalle) ----------------
function wrapIns(t, a, b, inner, tint = '#1a0e24') { const k = win(t, a, b, 0.3, 0.3); if (k <= 0) return ''; const u = clamp((t - a) / (b - a)), s = 1 + 0.12 * u, id = Math.round(a * 10);
  return `<clipPath id="ic${id}"><circle cx="540" cy="900" r="${lerp(0, 1500, k)}"/></clipPath><g clip-path="url(#ic${id})"><rect width="${W}" height="${H}" fill="${tint}"/><radialGradient id="ig${id}" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient><rect width="${W}" height="${H}" fill="url(#ig${id})"/><g transform="translate(0,80)"><g transform="translate(540,880) scale(${s}) translate(-540,-880)">${inner(u)}</g></g>${k < 1 ? `<circle cx="540" cy="900" r="${lerp(0, 1500, k)}" fill="none" stroke="${OUT}" stroke-width="14"/>` : ''}</g>`; }
const insLabel = (txt, col = '#ffe14d', y = 1320, fs = 78) => `<text x="540" y="${y - 118}" font-family="Anton" font-size="${fs}" text-anchor="middle" fill="${col}" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="3">${txt}</text>`;
const sparkle = (x, y, s, o = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><path d="M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z" fill="${c}"/></g>`;
const SPK = (u, n, x0, y0, wv, hv, op = 1) => [...Array(n)].map((_, i) => sparkle(x0 + (i * 83) % wv, y0 + (i * 57) % hv, 0.5 + 0.5 * Math.sin(u * 14 + i), op * (0.5 + 0.5 * Math.sin(u * 9 + i * 2)))).join('');
function insBox(t) { return wrapIns(t, T.boxA - 0.2, T.boxB, (u) => `<g>${[...Array(12)].map((_, i) => `<path d="M540,760 L${540 + Math.cos(i * 0.52 + u) * 900},${760 + Math.sin(i * 0.52 + u) * 900} L${540 + Math.cos(i * 0.52 + u + 0.14) * 900},${760 + Math.sin(i * 0.52 + u + 0.14) * 900}Z" fill="#fff0b8" opacity="${0.12 * clamp((u - 0.2) * 3)}"/>`).join('')}</g>${obj3('box', u, 540, 670, 1100)}${SPK(u, 12, 200, 200, 700, 520, clamp((u - 0.3) * 3))}${insLabel('UNA CAJA DORADA', '#ffe08a', 1330)}`, '#150a12'); }
function insNote(t) { return wrapIns(t, T.noteA, T.noteB, (u) => `${obj3('note', u, 540, 680, 1180)}${SPK(u, 10, 200, 260, 680, 520, 0.8)}${insLabel('UNA NOTA', '#f6d98a', 1330)}`, '#120a0c'); }
function insSpray(t) { return wrapIns(t, T.sprayA - 0.2, T.sprayB, (u) => `${obj3('spray', u, 520, 670, 1100)}${SPK(u, 8, 520, 360, 400, 300, 0.8)}${insLabel('ATOMIZADOR', '#9de6ff', 1330)}`, '#10131f'); }
function insCream(t) { return wrapIns(t, T.creamA - 0.2, T.creamB, (u) => `${obj3('creamgel', u, 540, 690, 1160)}${SPK(u, 10, 220, 300, 640, 460, 0.8)}${insLabel('CREMA + GEL', '#fbcfe8', 1330)}`, '#150d17'); }
function insCoil(t) { return wrapIns(t, T.coilA - 0.2, T.coilB, (u) => `${obj3('strands', u, 540, 690, 1200)}${SPK(u, 12, 220, 300, 640, 520, clamp(u * 2) * 0.9)}${insLabel('MECHÓN POR MECHÓN', '#ffd6a8', 1330, 70)}`, '#150c12'); }
function insDiffuser(t) { return wrapIns(t, T.diffA - 0.2, T.diffB, (u) => `${obj3('diffuser', u, 540, 690, 1160)}${[...Array(12)].map((_, i) => { const ph = (u * 2.4 + i * 0.137) % 1; return `<circle cx="${230 + (i * 61) % 620}" cy="${1000 - ph * 300}" r="${5 + (i % 3) * 3}" fill="#ffd9a8" opacity="${(1 - ph) * 0.7}"/>`; }).join('')}${insLabel('DIFUSOR', '#ffcf8a', 1330)}`, '#170d10'); }
function insGlove(t) { return wrapIns(t, T.gloveA, T.gloveB, (u) => `<circle cx="540" cy="820" r="470" fill="#2a0a14" opacity="0.5"/>${[...Array(14)].map((_, i) => `<circle cx="${540 + Math.cos(i * 0.9 + u * 2) * (230 + i * 10)}" cy="${820 + Math.sin(i * 1.3 + u * 2) * (200 + i * 8)}" r="${40 + (i % 4) * 16}" fill="#475569" opacity="0.16"/>`).join('')}${obj3('glove', u, 540, 690, 1100)}${insLabel('¿QUIÉN ES M?', '#fca5a5', 1330)}`, '#0e0710'); }
// ---------------- titulo de apertura 3D (sin spoilers) ----------------
function titleIntro(t) { const END = 4.0; if (t > END) return ''; const k = win(t, 0, END, 0.01, 0.7); const u = clamp(t / 2.4); const sub = pop(t, 1.9, 0.4), pill = pop(t, 2.4, 0.4), hold = clamp((t - 2.4) / 1.4);
  return `<g opacity="${k}"><rect width="${W}" height="${H}" fill="#05030a" opacity="${0.78 * k}"/>
    <defs><radialGradient id="tg1" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffd870" stop-opacity="0.75"/><stop offset="1" stop-color="#ffd870" stop-opacity="0"/></radialGradient></defs>
    <circle cx="540" cy="700" r="${520 + 40 * Math.sin(t * 5)}" fill="url(#tg1)" opacity="${clamp(u * 1.5)}"/>
    ${[...Array(18)].map((_, i) => { const a0 = i / 18 * 6.283 + t * 0.25, a1 = a0 + 0.1; return `<path d="M540,700 L${540 + Math.cos(a0) * 1100},${700 + Math.sin(a0) * 1100} L${540 + Math.cos(a1) * 1100},${700 + Math.sin(a1) * 1100}Z" fill="#ffe9a8" opacity="${(i % 2 ? 0.07 : 0.12) * clamp(u * 2)}"/>`; }).join('')}
    ${obj3('title', u, 540, 700, 1080, 460)}
    ${SPK(t, 10, 120, 520, 840, 360, clamp(u * 2))}
    <g transform="translate(540,918) scale(${sub})"><text x="0" y="0" font-family="Righteous" font-size="62" text-anchor="middle" letter-spacing="8" fill="#fff6d8" stroke="#8a5f1c" stroke-width="12" paint-order="stroke">UNA GRAN REVELACIÓN</text><text x="0" y="0" font-family="Righteous" font-size="62" text-anchor="middle" letter-spacing="8" fill="none" stroke="#fff" stroke-width="1.5" opacity="${0.5 + 0.4 * Math.sin(t * 6)}">UNA GRAN REVELACIÓN</text></g>
    <g transform="translate(540,1018) scale(${pill})"><rect x="-290" y="-38" width="580" height="76" rx="38" fill="#ff4d8d" stroke="${OUT}" stroke-width="7"/><rect x="-272" y="-30" width="544" height="22" rx="11" fill="#fff" opacity="0.25"/><text x="0" y="14" font-family="Righteous" font-size="40" text-anchor="middle" letter-spacing="4" fill="#fff">NO CUENTA COMO DÍA</text></g></g>`; }

// ---------------- UI (zona segura) ----------------
const stepBanners = [['1', 'ATOMIZADOR', T.sprayA - 0.1, T.sprayB, '#a5f3fc'], ['2', 'CREMA + GEL', T.creamA - 0.1, T.creamB, '#fbcfe8'], ['3', 'ENROLLAR', T.coilA - 0.1, T.coilB, '#fde68a'], ['4', 'DIFUSOR', T.diffA - 0.1, T.diffB, '#fdba74']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,300) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="34" y="20" font-family="Anton" font-size="${text.length > 9 ? 56 : 66}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
function timerChip(t) { if (t < T.boxA || t > T.hallA) return ''; const left = Math.round(lerp(300, 20, clamp((t - T.boxA) / (T.hallA - T.boxA)))), red = left < 90, p = red ? 0.5 + 0.5 * Math.sin(t * 9) : 0; const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
  return `<g transform="translate(540,372)"><rect x="-190" y="-30" width="380" height="60" rx="30" fill="${red ? '#ef4444' : '#1a1024'}" fill-opacity="${red ? 0.7 + 0.3 * p : 0.8}" stroke="${red ? '#fff' : '#ffe14d'}" stroke-width="5"/><text x="0" y="14" font-family="Anton" font-size="40" text-anchor="middle" fill="#fff" letter-spacing="2">GALA EN ${mm}:${ss}</text></g>`; }
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
function slate(t) {
  if (t > T.slateEnd + 0.7) return '';
  const out = ease((t - T.slateEnd) / 0.6), clap = clamp((t - 0.7) / 0.12);
  const open = lerp(-32, 0, clap) + (t > 0.82 ? Math.sin((t - 0.82) * 40) * 2 * Math.exp(-(t - 0.82) * 8) : 0);
  const stripes = [...Array(7)].map((_, i) => `<polygon points="${i * 110},0 ${i * 110 + 60},0 ${i * 110 + 20},70 ${i * 110 - 40},70" fill="${i % 2 ? '#fff' : OUT}"/>`).join('');
  return `<g><rect width="${W}" height="${H}" fill="#0b0b10" opacity="${1 - out}"/><g transform="translate(540,${900 - out * 1300}) rotate(${-4 + out * 20})" opacity="${1 - out * 0.6}">
    <g transform="translate(-340,-250) rotate(${open} 0 70)"><rect width="680" height="70" fill="#fff" stroke="#fff" stroke-width="6"/>${stripes}</g>
    <rect x="-340" y="-170" width="680" height="440" rx="12" fill="#1a1a22" stroke="#fff" stroke-width="6"/>
    <text x="-310" y="-120" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">PRODUCCIÓN</text><text x="-310" y="-56" font-family="Anton" font-size="56" fill="#fff">LAZY DAWNS</text>
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">ESPECIAL</text><text x="-310" y="52" font-family="Anton" font-size="52" fill="#fbbf24">LA REVELACIÓN DE LOS RIZOS</text>
    <text x="-310" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">SECUENCIA</text><text x="-310" y="172" font-family="Anton" font-size="52" fill="#ff4d8d">NO CUENTA COMO DÍA</text><text x="150" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">TOMA</text><text x="150" y="172" font-family="Anton" font-size="58" fill="#fff">1</text>
    ${clap >= 1 && t < 1.15 ? `<text x="0" y="-300" font-family="Anton" font-size="110" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡CLAC!</text>` : ''}</g></g>`;
}
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
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  let s = `<rect width="${W}" height="${H}" fill="#12090a" opacity="${0.66 * k}"/><text x="540" y="${640 - 24 * (1 - ease(k))}" font-family="Anton" font-size="68" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ QUIERES CAMBIAR</text><text x="540" y="${720 - 24 * (1 - ease(k))}" font-family="Anton" font-size="68" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">O MEJORAR?</text><text x="540" y="${790 - 16 * (1 - ease(k))}" font-family="Anton" font-size="42" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="10" paint-order="stroke" opacity="${k}">DE LO QUE YA ARREGLAMOS · SIGUIENTE ESPECIAL</text>`;
  const old = [['PIEL', '#fcd34d'], ['DIENTES', '#a5f3fc'], ['PELO', '#fbcfe8'], ['CEJAS', '#c4b5fd'], ['ROPA', '#86efac'], ['MAQUILLAJE', '#fda4af']];
  old.forEach(([n, c], i) => { const p = pop(t, T.optA + 0.1 + i * 0.22, 0.3); if (p > 0) s += chip(n, 300 + (i % 2) * 480, 930 + Math.floor(i / 2) * 150, 440, c, p, '¿otro tipo?'); });
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1500) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU IDEA</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1600) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 8</text></g>`;
  return s;
}
const mirrorGlow = (t) => { if (sceneAt(t) !== 'backstage') return ''; const p = 0.85 + 0.15 * Math.sin(t * 2.1); return `<g opacity="${0.18 * p}"><rect x="60" y="500" width="960" height="560" rx="30" fill="#ffe2a0" filter="url(#b10)"/></g>`; };
function stageLights(t) { if (sceneAt(t) !== 'ballroom') return ''; const a = 0.5 + 0.5 * Math.sin(t * 1.3);
  return [[-1, 0], [1, 2]].map(([m, ph]) => `<path d="M${540 + m * 360},-40 L${540 + m * 160 - 200},1500 L${540 + m * 160 + 200},1500Z" fill="#fff0c8" opacity="${0.035 + 0.025 * Math.sin(t * 1.1 + ph)}"/>`).join('') + [...Array(14)].map((_, i) => sparkle(80 + (i * 211) % 940, 200 + (i * 137) % 900, 0.5 + 0.4 * Math.sin(t * 3 + i), 0.5 + 0.4 * Math.sin(t * 2 + i * 2))).join('') + `<g opacity="${0.2 + 0.1 * a}"><ellipse cx="540" cy="1650" rx="320" ry="60" fill="#fff0c8" filter="url(#b10)"/></g>`; }

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t), lp = lazyPlace(t);
  const py = lp.fy - 790 * lp.S;
  const lazy = lp.vis ? `<g transform="translate(${lp.x},${py}) scale(${lp.S})">${drawLazy(P)}</g>` : '';
  const sm = (h, tt) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(h(Math.max(0, tt - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const ds = danteState(t), ms = memoState(t);
  const char = (st, fn, look, seed, who) => { if (!st) return ''; const { ch } = st; const hs = (tt) => { const q = who === 'D' ? danteState(tt) : memoState(tt); return q ? q.hands : 'none'; }; const nsm = sm(hs, t);
    const base = { ...st, elbowDown: true, armL: nsm.L, armR: st.armR || nsm.R, blink: blinkOf(t, seed), look, t };
    const sh = sceneAt(t) === 'ballroom' ? `<ellipse cx="${ch.x}" cy="${ch.y + 708 * ch.s}" rx="${120 * ch.s}" ry="${18 * ch.s}" fill="#000" opacity="0.4"/>` : '';
    return `${sh}<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'body' })}</g><g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'tool' })}</g>`; };
  const dante = char(ds, drawDante, -0.7, 1.9, 'D'), memo = char(ms, drawMemo, 0.7, 0.6, 'M');
  const icons = (ds ? talkIcon(t, 'T', ds.ch.x - 110 * ds.ch.s, ds.ch.y - 150 * ds.ch.s) : '') + (ms ? talkIcon(t, 'E', ms.ch.x + 110 * ms.ch.s, ms.ch.y - 150 * ms.ch.s) : '');
  const chairG = (g) => `<g transform="translate(540,1690) scale(${K}) translate(-540,-1660)">${g}</g>`;
  const back = sc === 'backstage';
  const world = `<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})"><image href="${platePng[sc]}" width="${W}" height="${H}" preserveAspectRatio="none"/>${mirrorGlow(t)}${stageLights(t)}${back ? chairG(chairBack()) : crowd(t) + mystery(t) + godRays(t)}${dante}${memo}${lazy}${back ? chairG(chairFront()) : ''}${icons}${spotDark(t)}${flashFx(t)}${glitterBurst(t)}${flyTurban(t)}</g>`;
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05030a" stop-opacity="0.5"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const chipOp = 1 - Math.max(win(t, T.countA - 0.6, T.calmA + 3.2, 0.3, 0.3), win(t, T.mEnter - 0.2, T.mGone + 0.5, 0.3, 0.3));
  const chipTop = t < 4.0 ? '' : `<g opacity="${chipOp}" transform="translate(540,300)"><defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd84a"/><stop offset="1" stop-color="#b8780f"/></linearGradient></defs><rect x="-226" y="-40" width="440" height="88" rx="44" fill="#000" opacity="0.3"/><rect x="-230" y="-46" width="440" height="88" rx="44" fill="#1a1024" stroke="#d4a24c" stroke-width="6"/><text x="0" y="18" font-family="Bungee" font-size="50" text-anchor="middle" letter-spacing="3" fill="url(#chg)" stroke="${OUT}" stroke-width="4" paint-order="stroke">ESPECIAL</text><path d="M-196,-2 l8,-14 l8,14 l-8,14Z M164,-2 l8,-14 l8,14 l-8,14Z" fill="#ffd84a"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}<defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world}${vignette}${confetti(t)}${titleIntro(t)}
    ${chipTop}${timerChip(t)}${insBox(t)}${insNote(t)}${insSpray(t)}${insCream(t)}${insCoil(t)}${insDiffuser(t)}${insGlove(t)}${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}${doorsFx(t)}${titleFx(t)}${letterbox(t)}
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
