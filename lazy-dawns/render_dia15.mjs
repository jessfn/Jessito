// Lazy Dawns - DIA 15: "Alguien me observa desde el inicio" (cafe, Mari, Lash Lab, pestanas postizas gatita). Voces: narrador, Dante, Dra. Renata, Isa, M. Los personajes NO mueven la boca para hablar.
// Uso: node render_dia15.mjs preview 5 12 ...   |   node render_dia15.mjs <inicio> <fin> <salida.mp4>   |   node render_dia15.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, hand } from './lazy_lib.mjs';
import { drawLazy, LASHX } from './rig.mjs';
import { handsToTargets, salonTool, armIK } from './chars.mjs';
import { drawMari2, drawBruna } from './chars15.mjs';
import { eye15 } from './eye15.mjs';

import { renderCharacter, defaultPose as defPose2, ik2, SK as SK2, ALLDEFS, NAILS } from './rig2d/character.mjs';
import { MDEFS } from './rig2d/m_character.mjs';
import { makeDirector } from './director_d15.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia15');
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
const obj3 = (name, u, cx, cy, w, h = w) => { const i = Math.min(OBJN[name] - 1, Math.max(0, Math.round(clamp(u) * (OBJN[name] - 1)))); const key = name + i; if (!imgCache.has(key)) imgCache.set(key, 'data:image/png;base64,' + readFileSync(path.join(here, 'plates3d/obj', OBJF[name], 'f' + String(i).padStart(3, '0') + '.png')).toString('base64')); if (name === 'title' || name === 'slate10') return `<image href="${imgCache.get(key)}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/>`; return `<defs><radialGradient id="mk${name}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff"/><stop offset="0.62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="mm${name}" maskUnits="userSpaceOnUse" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="url(#mk${name})"/></mask></defs><image href="${imgCache.get(key)}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" mask="url(#mm${name})"/>`; };
const nm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9]/g, '');
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };



// ---------------- guion con tiempos ----------------
const DATA = JSON.parse(readFileSync(path.join(B, 'lines.json'), 'utf8'));
const L = Object.fromEntries(DATA.lines.map((l) => [l.id, l]));
const DUR = DATA.total;
const w = (id, word, n = 0) => { const r = L[id].words.filter((x) => nm(x[0]) === nm(word))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + word); return r[1]; };
const T = {
  slateEnd: 1.4, hookA: L.l1.start + 0.3, msgA: L.l2.start - 0.5, mariA: L.l3.start - 0.9, lashA: L.l5.start - 0.1, brunaA: L.l6.start, closeA: w('l6', 'Cierra'), mapA: L.l7.start - 0.1, curlA: L.l8.start - 0.1, glueA: L.l9.start - 0.1,
  marOutA: L.l10.start, msg2A: w('l11', 'vibro') - 0.3, dryA: L.l13.start, openA: w('l13', 'abri') - 0.4, revealA: L.l14.start, guardaA: L.l15.start,
  vote: w('l16', 'Que') - 0.1, optA: w('l16', 'ojos'), optB: w('l16', 'mandibula'), cta1: w('l16', 'Comenta'), cta2: w('l16', 'sigueme'),
};
T.homeA = T.hookA; T.walks = []; T.sitA = T.brunaA + 3.2;
T.trayA = w('l5', 'bandejas') - 1.2; T.trayB = T.trayA + 2.6;
T.mapIA = T.mapA + 0.9; T.mapIB = L.l7.end;
T.curlIA = T.curlA + 0.1; T.curlIB = T.curlA + 2.6; T.eCurlA = T.curlIB + 0.1; T.eCurlB = L.l8.end + 0.3;
T.glueIA = T.glueA + 0.1; T.glueIB = T.glueA + 2.1; T.tweIA = T.glueIB + 0.1; T.tweIB = T.tweIA + 2.0; T.eApA = T.tweIB + 0.1; T.eApB = L.l10.start - 0.35;
T.scenes = [T.slateEnd, T.hookA, T.msgA, T.mariA, T.lashA, T.brunaA, T.closeA, T.mapA, T.curlA, T.glueA, T.marOutA, T.msg2A, T.dryA, T.openA, T.revealA, T.guardaA, T.vote];
const OBJF = { slate15: 'slate15', tweezers: 'tweezers15', glue: 'glue15', curler: 'curler15', lashtray: 'lashtray15' };
const OBJN = Object.fromEntries(Object.entries(OBJF).map(([k, v]) => [k, readdirSync(path.join(here, 'plates3d/obj', v)).filter((f) => f.endsWith('.png')).length]));
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });

// ---------------- fondos 3D y defs ----------------
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates3d', n + '.png')));
const platePng = { cafe: PL('cafe15_dof'), lab: PL('lashlab15_dof') };


// ---------------- personajes, lugares y camara ----------------
const sceneAt = (t) => (t >= T.lashA - 0.2 ? 'lab' : 'cafe');
const NEWS = 0.7;
const SIT_DROP = 110, HEAD_CX = 540, HEAD_CY = 788;
const seatedK = (t) => ease((t - T.sitA) / 0.7);
const toLocal = (ch, wx, wy) => ({ x: (wx - ch.x) / ch.s, y: (wy - ch.y) / ch.s });
const MX = 850;
const mariX = (t) => { if (t < T.lashA - 0.2) return MX + 520 * (1 - ease((t - T.mariA) / 1.4)); if (t < T.marOutA + 0.9) return MX; if (t < T.marOutA + 2.3) return MX + 520 * ease((t - T.marOutA - 0.9) / 1.4); if (t < T.revealA - 1.0) return 1500; return MX + 520 * (1 - ease((t - T.revealA + 1.0) / 1.3)); };
const marCh = (t) => ({ x: mariX(t), y: 880, s: 0.8 });
const BRU = { x: 205, y: 905, s: 0.78 };
const bruCh = (t) => { const e = 1 - ease((t - T.lashA - 0.8) / 1.2); return { x: BRU.x - 420 * e, y: BRU.y, s: BRU.s }; };
function marState(t) { if (t < T.mariA - 0.2 || t >= T.vote || mariX(t) > 1300) return null; const ch = marCh(t); let mood = 'happy', hands = 'none', tool = 'none', ex = {};
  const at = (k, side, rot, x, y, sc = 1) => { tool = k; ex = { elbowLow: true, toolSide: side, toolX: x, toolY: y, toolR: rot, toolS: sc }; };
  if (t >= L.l3.start && t < L.l4.start) { mood = 'happy'; hands = 'hips'; } if (t >= L.l4.start) { mood = 'happy'; hands = 'none'; }
  if (t >= T.lashA) { mood = 'proud'; hands = 'clasp'; } if (t >= T.brunaA) { mood = 'happy'; }
  if (t >= T.marOutA - 0.2 && t < T.marOutA + 1.4) { mood = 'calm'; at('dphone', 1, 10, 150, 90, 0.9); }
  if (t >= T.revealA - 1.0) { mood = 'grin'; hands = 'none'; } if (t >= T.revealA + 3.0) { mood = 'proud'; }
  if (t >= T.guardaA && t < T.guardaA + 1.4) { mood = 'grin'; at('dphone', 1, 10, 150, 290, 0.9); } if (t >= T.guardaA + 1.4) { mood = 'grin'; hands = 'hips'; tool = 'none'; }
  return { mood, hands, tool, ch, ...ex }; }
function bruState(t) { if (t < T.lashA + 0.2 || t >= T.vote) return null; const ch = bruCh(t); let mood = 'happy', hands = 'clasp', tool = 'none', ex = {};
  const at = (wx, wy, k, rot, side = 1, sc = 1) => { const Lc = toLocal(ch, wx, wy); tool = k; ex = { elbowLow: true, toolSide: side, toolX: Lc.x, toolY: Lc.y, toolR: rot, toolS: sc }; };
  if (t >= T.brunaA) { mood = 'proud'; hands = 'hips'; }
  if (t >= T.mapA && t < T.curlA) { mood = 'focus'; hands = 'none'; at(500 + 6 * Math.sin(t * 6), 905 + 4 * Math.sin(t * 9), 'marker', 78, 1, 0.8); }
  if (t >= T.curlA && t < T.glueA) { mood = 'focus'; hands = 'clasp'; }
  if (t >= T.glueA && t < T.dryA) { mood = 'focus'; hands = 'none'; at(500, 900 + 5 * Math.sin(t * 4), 'ltweez', 78, 1, 0.8); }
  if (t >= T.dryA && t < T.openA) { mood = 'focus'; hands = 'none'; at(470, 905, 'minifan', 78, 1, 0.8); }
  if (t >= T.openA) { mood = 'proud'; hands = 'clasp'; } if (t >= T.revealA) mood = 'grin'; if (t >= T.guardaA) mood = 'worry';
  return { mood, hands, tool, ch, ...ex }; }
const MOUTHW = (who, t) => { const l = DATA.lines.find((q) => q.who === who && t >= q.start - 0.05 && t <= q.end + 0.1); if (!l) return 0; for (const [ww, s, e] of l.words) if (t >= s - 0.02 && t <= e + 0.04) { const k = (t - s) / Math.max(0.12, e - s); return 0.28 + 0.62 * Math.abs(Math.sin((t - s) * 21 + ww.length)) * (0.7 + 0.3 * Math.sin(k * 3.14)); } return 0.04; };
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
const CAM = [[0, 1.0, 540, 960], [T.slateEnd, 1.0, 540, 960], [T.hookA, 1.12, 540, 960], [T.msgA - 0.2, 1.2, 540, 900], [T.mariA - 0.3, 1.05, 620, 960], [T.mariA + 1.5, 1.2, 700, 940], [L.l4.start, 1.3, 560, 880], [T.lashA - 0.2, 1.0, 540, 960], [T.brunaA, 1.1, 440, 980], [T.sitA + 0.5, 1.12, 540, 960], [T.mapA, 1.5, 540, 900], [T.curlA, 1.5, 540, 900], [T.glueA, 1.5, 540, 900], [T.marOutA - 0.3, 1.1, 700, 960], [T.msg2A - 0.2, 1.2, 540, 900], [T.dryA, 1.5, 520, 900], [T.openA - 0.2, 1.7, 540, 880], [T.revealA - 0.1, 1.3, 540, 900], [T.revealA + 2.5, 1.55, 540, 870], [T.guardaA, 1.2, 720, 920], [T.vote - 0.2, 1.1, 540, 960], [9999, 1.1, 540, 960]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.msgA + 1.4, T.msgA + 1.9, 0.02, 0.4) * 6 + win(t, T.msg2A + 1.4, T.msg2A + 1.9, 0.02, 0.4) * 6; const sway = Math.sin(t * 0.55) * 8;
  return { z: lerp(a[1], b[1], u) * (1 + 0.012 * Math.sin(t * 0.7)), x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6 + sway, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}
function revealFx(t) { const d = t - T.revealA; if (d < 0.1 || d > 4.5) return ''; let s = '';
  for (let i = 0; i < 26; i++) { const a = d - 0.1 - i * 0.07; if (a < 0 || a > 1.6) continue; const ang = i * 2.399, rr = 40 + a * 200; s += sparkle(540 + Math.cos(ang) * rr * 1.2, 880 + Math.sin(ang) * rr * 0.8, 1.4 + (i % 3) * 0.5, 1 - a / 1.6, i % 2 ? '#fff' : '#e9d6ff'); }
  return s; }

const UNK_AV = (rr = 44) => `<circle r="${rr + 3}" fill="#4b5563" stroke="#12090a" stroke-width="3"/><circle r="${rr}" fill="#9ca3af"/><circle cx="0" cy="-${rr * 0.25}" r="${rr * 0.3}" fill="#e5e7eb"/><path d="M${-rr * 0.55},${rr * 0.8} Q0,${rr * 0.1} ${rr * 0.55},${rr * 0.8}Z" fill="#e5e7eb"/>`;
function phoneChat(t, a, name, avatar, status, msgs, newIdx, dur = 4.6) { const b = a + dur; if (t < a - 0.1 || t > b) return ''; const k = ease((t - a) / 0.45) * (1 - ease((t - b + 0.45) / 0.45)); if (k <= 0.01) return ''; const rise = lerp(520, 0, k);
  const tNew = a + 1.4; const shown = t >= tNew; const typing = !shown && t > a + 0.5;
  const bub = (txt, mine) => { const words = txt.split(' '); const lines = []; let cur = ''; for (const wd of words) { if ((cur + ' ' + wd).trim().length > 24) { lines.push(cur.trim()); cur = wd; } else cur = (cur + ' ' + wd).trim(); } if (cur) lines.push(cur); const wd = Math.min(470, 44 + Math.max(...lines.map((l) => l.length)) * 15), hh = lines.length * 44 + 26;
    return { h: hh, svg: (y) => `<g transform="translate(${mine ? 250 - wd : -250},${y})"><rect width="${wd}" height="${hh}" rx="26" fill="${mine ? '#3b82f6' : '#e5e7eb'}"/>${lines.map((l, i) => `<text x="22" y="${40 + i * 44}" font-family="Inter" font-weight="700" font-size="25" fill="${mine ? '#fff' : '#111'}">${esc(l)}</text>`).join('')}</g>` }; };
  let chat = '', y = -410; msgs.forEach((m, i) => { if (i < newIdx || shown) { const o = bub(m.t, !!m.mine); chat += o.svg(y); y += o.h + 18; } });
  if (typing) chat += `<g transform="translate(-250,${y})"><rect width="130" height="64" rx="30" fill="#e5e7eb"/>${[0, 1, 2].map((d) => `<circle cx="${34 + d * 30}" cy="32" r="${8 + 3 * Math.sin(t * 9 + d * 1.2)}" fill="#9ca3af"/>`).join('')}</g>`;
  return `<g><rect width="${W}" height="${H}" fill="#05030a" opacity="${(0.55 * k).toFixed(2)}"/><g transform="translate(540,${(850 + rise).toFixed(0)}) scale(0.82) rotate(${(-3 * (1 - k)).toFixed(1)})"><rect x="-290" y="-640" width="580" height="1280" rx="78" fill="#0b0b12" stroke="#374151" stroke-width="8"/><rect x="-276" y="-626" width="552" height="1252" rx="66" fill="#f8fafc"/><rect x="-100" y="-626" width="200" height="40" rx="20" fill="#0b0b12"/><text x="-228" y="-596" font-family="Inter" font-weight="800" font-size="24" fill="#111">9:41</text><rect x="196" y="-612" width="38" height="18" rx="5" fill="none" stroke="#111" stroke-width="3"/><rect x="200" y="-608" width="26" height="10" rx="2" fill="#111"/><rect x="-276" y="-570" width="552" height="130" fill="#fff"/><path d="M-276,-440 h552" stroke="#e5e7eb" stroke-width="3"/><path d="M-240,-505 l-22,0 m0,0 l12,-12 m-12,12 l12,12" stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/><g transform="translate(-170,-505)">${avatar(48)}</g><text x="-98" y="-512" font-family="Inter" font-weight="800" font-size="30" fill="#111">${esc(name)}</text><text x="-98" y="-480" font-family="Inter" font-weight="600" font-size="22" fill="${status[1]}">${esc(status[0])}</text><g>${chat}</g><rect x="-250" y="540" width="500" height="64" rx="32" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="3"/><text x="-224" y="582" font-family="Inter" font-weight="600" font-size="26" fill="#9ca3af">Mensaje</text><circle cx="214" cy="572" r="24" fill="#3b82f6"/></g></g>`; }
// ---------------- inserts cinematograficos (objetos disenados a detalle) ----------------
let CURPLATE = null;
function wrapIns(t, a, b, inner, tint = '#1a0e24') { const k = win(t, a, b, 0.3, 0.3); if (k <= 0) return ''; const u = clamp((t - a) / (b - a)), s = 1 + 0.12 * u, id = Math.round(a * 10); const e = smooth(k); const entering = u < 0.5;
  const xe = lerp(-120, W + 720, e);
  const pts = entering ? `-400,0 ${xe},0 ${xe - 420},${H} -400,${H}` : `${W + 400},0 ${W - xe},0 ${W - xe - 420},${H} ${W + 400},${H}`;
  const edge = entering ? `M${xe},0 L${xe - 420},${H}` : `M${W - xe},0 L${W - xe - 420},${H}`;
  return `<clipPath id="ic${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#ic${id})"><image href="${CURPLATE}" x="-60" y="-60" width="${W + 120}" height="${H + 120}" preserveAspectRatio="xMidYMid slice"/><rect width="${W}" height="${H}" fill="#06040c" opacity="0.5"/><radialGradient id="ig${id}" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></radialGradient><rect width="${W}" height="${H}" fill="url(#ig${id})"/><g transform="translate(540,900) scale(${0.9 + 0.1 * e}) translate(-540,-900)"><g transform="translate(0,80)"><g transform="translate(540,880) scale(${s}) translate(-540,-880)">${inner(u)}</g></g></g></g>${k < 1 ? `<path d="${edge}" stroke="#fff" stroke-width="${26 * (1 - k)}" opacity="0.85"/><path d="${edge}" stroke="#7dd3fc" stroke-width="${60 * (1 - k)}" opacity="0.25"/>` : ''}`; }
const insLabel = (txt, col = '#ffe14d', y = 1320, fs = 78) => `<text x="540" y="${y - 118}" font-family="Anton" font-size="${fitFs(txt, 940, fs)}" text-anchor="middle" fill="${col}" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="3">${txt}</text>`;
const sparkle = (x, y, s, o = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}"><path d="M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z" fill="${c}"/></g>`;
const SPK = (u, n, x0, y0, wv, hv, op = 1) => [...Array(n)].map((_, i) => sparkle(x0 + (i * 83) % wv, y0 + (i * 57) % hv, 0.5 + 0.5 * Math.sin(u * 14 + i), op * (0.5 + 0.5 * Math.sin(u * 9 + i * 2)))).join('');
// ---------------- inserts cinematograficos 3D (objetos modelados en Three.js) ----------------
function ins3(t, a, b, name, label, col, cy = 700, size = 1160) { return wrapIns(t, a, b, (u) => `${obj3(name, u, 540, cy, size)}${SPK(u, 9, 200, 260, 680, 520, 0.7)}${insLabel(label, col, 1330)}`); }

const insTray = (t) => ins3(t, T.trayA, T.trayB, 'lashtray', 'BANDEJAS DE PESTAÑAS', '#e9d6ff', 700, 1180);
const insCurl = (t) => ins3(t, T.curlIA, T.curlIB, 'curler', 'RIZADOR', '#d6c4ff', 700, 1180);
const insGlue = (t) => ins3(t, T.glueIA, T.glueIB, 'glue', 'PEGAMENTO', '#ffe0f0', 700, 1180);
const insTwe = (t) => ins3(t, T.tweIA, T.tweIB, 'tweezers', 'PINZAS DE PRECISIÓN', '#c4f1ff', 700, 1180);
function eyeIns(t, a, b, stateFn, label, col) { return wrapIns(t, a, b, (u) => { const st = stateFn(u); return `<g transform="translate(540,760) scale(1.9)">${eye15(st)}</g>${SPK(u, 8, 160, 300, 760, 640, 0.8)}${insLabel(label, col, 1330)}`; }); }
const eyeMap = (t) => eyeIns(t, T.mapIA, T.mapIB, (u) => ({ map: clamp(u * 1.4), nat: 0, fake: 0 }), 'MAPA: MÁS LARGAS HACIA AFUERA', '#ffe14d');
const eyeCurl = (t) => eyeIns(t, T.eCurlA, T.eCurlB, (u) => ({ map: 0, nat: clamp(u * 1.5), fake: 0 }), 'PESTAÑAS ENCHINADAS', '#d6c4ff');
const eyeApply = (t) => eyeIns(t, T.eApA, T.eApB, (u) => ({ map: 0, nat: 1, fake: clamp(u * 1.3) }), 'ABANICO POR ABANICO', '#ffc2e0');

const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const fitFs = (txt, maxW, fs0) => { let fs = fs0, wd = inkWidth(esc(txt), fs); if (wd > maxW) fs = Math.max(26, Math.floor(fs * maxW / wd)); return fs; };
const SPEAK = { N: { col: '#ffe14d', name: null }, M: { col: '#f9a8d4', name: 'MARI' }, F: { col: '#c4b5fd', name: 'BRUNA' } };
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

const stepBanners = [['1', 'MAPA DE PESTAÑAS', T.mapA - 0.1, T.curlA - 0.3, '#fde68a'], ['2', 'RIZADO', T.curlA, T.glueA - 0.3, '#ddd6fe'], ['3', 'PEGADO PESTAÑA POR PESTAÑA', T.glueA, T.marOutA - 0.2, '#fbcfe8']];
const ICON = {
  OJOS: `<path d="M-32,4 Q0,-26 32,4 Q0,34 -32,4Z" fill="#fff" stroke="${OUT}" stroke-width="3.6" stroke-linejoin="round"/><circle cx="0" cy="4" r="12" fill="#6b3a1c" stroke="${OUT}" stroke-width="2.6"/><circle cx="0" cy="4" r="5.4" fill="#111"/><circle cx="-4" cy="0" r="2.6" fill="#fff"/>`,
  MANDIBULA: `<path d="M-30,-22 Q-34,14 -16,30 Q0,38 16,30 Q34,14 30,-22" fill="#e6b08a" stroke="${OUT}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-26,0 Q-18,26 0,32 Q18,26 26,0" stroke="#e01a30" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-12,16 q12,8 24,0" stroke="${OUT}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
};

function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  let s = `<defs><radialGradient id="ecg" cx="0.5" cy="0.42" r="0.8"><stop offset="0" stop-color="#3a1030"/><stop offset="1" stop-color="#08040c"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#ecg)" opacity="${k}"/>${[...Array(30)].map((_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 311) % H}" r="${1.5 + (i % 3)}" fill="#ffd24a" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * k}"/>`).join('')}<text x="540" y="${690 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ HACEMOS</text><text x="540" y="${776 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">MAÑANA?</text>`;
  const a = pop(t, T.optA, 0.35), b = pop(t, T.optB, 0.35);
  if (a > 0) s += `<g transform="translate(540,960) scale(${a})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON.OJOS}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('A · ARREGLAR LOS OJOS', 620, 58)}" text-anchor="middle" fill="${OUT}">A · ARREGLAR LOS OJOS</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1136) scale(${b})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON.MANDIBULA}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('B · ARREGLAR LA MANDÍBULA', 620, 58)}" text-anchor="middle" fill="#fff">B · ARREGLAR LA MANDÍBULA</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1400) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1510) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 16</text></g>`;
  return s;
}
const TRANS = [[3.55, 'in', 0.8], [T.lashA, 'cut', 0.6], [T.msg2A, 'cut', 0.3]];
function slateIntro(t) { const END = 4.3; if (t > END) return ''; const ex = ease(clamp((t - 3.4) / 0.9)); const k = 1 - clamp((t - 3.8) / 0.7);
  const fade = Math.max(0, k * (1 - ex)); const clap = clamp((t - 0.55) / 0.08) * (1 - clamp((t - 0.7) / 0.3)); const shk = t > 0.6 && t < 1.0 ? Math.sin(t * 90) * 7 * (1 - (t - 0.6) / 0.4) : 0;
  const stripes = Array.from({ length: 16 }, (_, i) => `<path d="M${-200 + i * 150 + (t * 40) % 150},0 L${60 + i * 150 + (t * 40) % 150},0 L${-340 + i * 150 + (t * 40) % 150},${H} L${-600 + i * 150 + (t * 40) % 150},${H}Z" fill="#ff5a6a" opacity="${(i % 2 ? 0.05 : 0.025) * fade}"/>`).join('');
  const dust = Array.from({ length: 46 }, (_, i) => `<circle cx="${((i * 197) + t * (12 + i % 5 * 6)) % W}" cy="${((i * 311) - t * (14 + i % 4 * 8) + 4000) % H}" r="${1.5 + (i % 3)}" fill="#ff9aa6" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * fade}"/>`).join('');
  const sil = clamp((t - 2.2) / 1.0) * 0.8;
  const sl = obj3('slate15', clamp(t / 3.6), 0, 0, 1300).replace('<image ', `<image opacity="${fade}" `);
  return `<g><defs><radialGradient id="bgB" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="#5a0f1e"/><stop offset="0.55" stop-color="#1c0610"/><stop offset="1" stop-color="#060208"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bgB)" opacity="${fade}"/>${stripes}
    <g opacity="${fade * sil}" transform="translate(860,1330)"><path d="M-110,300 Q-130,40 -40,-10 L40,-10 Q130,40 110,300Z" fill="#000"/><ellipse cx="0" cy="-60" rx="62" ry="68" fill="#000"/><ellipse cx="0" cy="-118" rx="118" ry="20" fill="#000"/><path d="M-60,-122 Q0,-214 60,-122Z" fill="#000"/><circle cx="-22" cy="-70" r="6" fill="#ef4444"/><circle cx="22" cy="-70" r="6" fill="#ef4444"/></g>${dust}
    <ellipse cx="560" cy="1440" rx="440" ry="50" fill="#000" opacity="${0.3 * fade}"/><g transform="translate(${540 + 20 + shk},${900 + shk * 0.6}) scale(${1 + ex * 0.5})">${fade > 0.04 ? sl : ''}</g><rect width="${W}" height="${H}" fill="#fff" opacity="${clap * 0.55}"/></g>`; }
function transitionAt(t) { for (const [t0, kind, d] of TRANS) { const a = t0 - (kind === 'cut' ? d / 2 : 0), p = (t - a) / d; if (p < 0 || p > 1) continue;
    if (kind === 'in') { const e = ease(p); return { on: true, ghost: p < 0.85, sc: 1.4 - 0.4 * e, v: (1 - e), fl: 0.35 * Math.max(0, 1 - p * 3), gx: 0 }; }
    const e = smooth(p), mid = 1 - Math.abs(e - 0.5) * 2; const sc = e < 0.5 ? 1 + e * 2 * 0.45 : 1.45 - (e * 2 - 1) * 0.45; return { on: true, ghost: true, sc, v: mid, fl: 0.5 * mid * mid, gx: (e < 0.5 ? 1 : -1) * mid * 40 }; } return { on: false }; }
// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t); CURPLATE = platePng[sc]; NAILS.on = true; LASHX.style = t >= T.openA ? 'P3' : null;
  const mkLazy = () => { const P2 = defPose2(); const e = P2.eyes; e.blinkL = P.blink.l; e.blinkR = P.blink.r; e.lookX = P.gaze.x; e.lookY = P.gaze.y; e.wide = Math.max(0, (P.lid.l - 1) * 2); e.squint = P.squint || 0;
    P2.brows.Lraise = P.brow.l.r; P2.brows.Rraise = P.brow.r.r; P2.brows.Lfrown = -P.brow.l.i; P2.brows.Rfrown = -P.brow.r.i; P2.mouth.open = Math.min(0.35, P.mouth.open); P2.mouth.wide = P.mouth.wide; P2.mouth.smile = P.mouth.smile; P2.mouth.upperTeeth = P.mouth.open > 0.2 ? 1 : 0.2;
    P2.head.yaw = P.yaw || 0; P2.head.rot = (P.roll || 0) * 0.6; P2.chest.breath = P.breath || 0; P2.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1, sway: P.hair.sway }; P2.hair.t = t; P2.hair.swayL = (P.hair.sway || 0) * 6; P2.hair.swayR = (P.hair.sway || 0) * 6; P2.skirt.t = t; P2.skirt.hem = 0.5; P2.skirt.swayL = 5 * Math.sin(t * 1.3) + 10 * P.walk * Math.sin(P.walkPh); P2.skirt.swayR = 5 * Math.sin(t * 1.3 + 1) - 10 * P.walk * Math.sin(P.walkPh);
    P2.noseStyle = 'D'; P2.noseK = 1.35;
    const arm = (tx, ty, k) => { const kL = ik2(SK2.shoulderL, SK2.elbowL, SK2.wristL, [512 - tx, ty], -1), kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [512 + tx, ty], 1); P2.armL.r1 = kL.r1 * k; P2.armL.r2 = kL.r2 * k; P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; };
    const kRev = clamp((t - T.revealA) / 0.5) * (1 - clamp((t - T.guardaA - 1.6) / 0.4)); if (kRev > 0) { arm(170, 470, kRev); P2.handL.spread = P2.handR.spread = 0.5; P2.handL.curl = P2.handR.curl = [0.1, 0.1, 0.1, 0.1, 0.1]; }
    const kPh = Math.max(clamp((t - T.msgA) / 0.5) * (1 - clamp((t - T.msgA - 3.6) / 0.5)), clamp((t - T.msg2A) / 0.5) * (1 - clamp((t - T.msg2A - 6.6) / 0.5))); if (kPh > 0) { arm(120, 300, kPh * 0.8); }
    if (t > w('l16', 'sigueme') - 0.3) { const k = clamp((t - w('l16', 'sigueme') + 0.3) / 0.3); const kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [800, 330], 1); P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; P2.handR.spread = 1.2; P2.armL.r1 = 0; P2.armL.r2 = 0; }
    return renderCharacter(P2); };
  const sK = sc === 'lab' ? seatedK(t) : 0, drop = SIT_DROP * sK, hy = HEAD_CY + drop, seated = sK > 0.01;
  const chairBack = seated ? `<g opacity="${sK.toFixed(2)}"><ellipse cx="540" cy="1722" rx="250" ry="34" fill="#000" opacity="0.3"/><rect x="${540 - 150}" y="${hy - 10}" width="300" height="${1480 - hy}" rx="70" fill="#e4d4ff" stroke="${OUT}" stroke-width="8"/><rect x="${540 - 118}" y="${hy - 30}" width="236" height="150" rx="60" fill="#f3eaff" stroke="${OUT}" stroke-width="7"/><path d="M${540 - 150},${hy + 60} L${540 - 150},1440 M${540 + 150},${hy + 60} L${540 + 150},1440" stroke="#d4a24c" stroke-width="7" opacity="0.95"/></g>` : '';
  const gownSvg = seated ? `<g opacity="${sK.toFixed(2)}"><defs><linearGradient id="cpG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a0c1c"/><stop offset="0.45" stop-color="#d1182f"/><stop offset="1" stop-color="#7a0a18"/></linearGradient></defs><path d="M${540 - 62},${hy + 142} C${540 - 120},${hy + 150} ${540 - 250},${hy + 190} ${540 - 264},${hy + 330} C${540 - 280},${hy + 480} ${540 - 262},${hy + 600} ${540 - 270},1570 Q540,1620 ${540 + 270},1570 C${540 + 262},${hy + 600} ${540 + 280},${hy + 480} ${540 + 264},${hy + 330} C${540 + 250},${hy + 190} ${540 + 120},${hy + 150} ${540 + 62},${hy + 142} Q540,${hy + 190} ${540 - 62},${hy + 142}Z" fill="url(#cpG)" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><path d="M${540 - 130},${hy + 220} C${540 - 160},${hy + 420} ${540 - 170},${hy + 620} ${540 - 190},1560 M${540 + 130},${hy + 220} C${540 + 160},${hy + 420} ${540 + 170},${hy + 620} ${540 + 190},1560" stroke="#4a0610" stroke-opacity="0.45" stroke-width="9" fill="none" stroke-linecap="round"/></g>` : '';
  const chairFront = seated ? `<g opacity="${sK.toFixed(2)}"><rect x="${540 - 300}" y="${1250 + drop * 0.3}" width="64" height="190" rx="26" fill="#e4d4ff" stroke="${OUT}" stroke-width="8"/><rect x="${540 + 236}" y="${1250 + drop * 0.3}" width="64" height="190" rx="26" fill="#e4d4ff" stroke="${OUT}" stroke-width="8"/><path d="M${540 - 280},1280 v50 M${540 + 280},1280 v50" stroke="#d4a24c" stroke-width="6"/><rect x="${540 - 26}" y="1590" width="52" height="100" fill="#d4a24c" stroke="${OUT}" stroke-width="6"/><ellipse cx="540" cy="1700" rx="230" ry="30" fill="#d4a24c" stroke="${OUT}" stroke-width="7"/><rect x="${540 - 210}" y="1540" width="420" height="56" rx="28" fill="#f3eaff" stroke="${OUT}" stroke-width="8"/></g>` : '';
  const wa = P.walk || 0, bobW = -Math.abs(Math.sin(P.walkPh || 0)) * 14 * wa;
  const tf = `translate(${540 - 512 * NEWS},${1655 - 1500 * NEWS + drop + bobW}) rotate(${(2.2 * wa * Math.sin(P.walkPh || 0)).toFixed(2)} 512 1500) scale(${NEWS})`;
  const lazyBody = () => { const sh = seated ? '' : `<ellipse cx="540" cy="1650" rx="${380 * NEWS}" ry="26" fill="#000" opacity="0.35"/>`; const clipS = seated ? `<clipPath id="seatClip"><rect x="0" y="0" width="${W}" height="1580"/></clipPath>` : '';
    return `${sh}${clipS}${chairBack}<g ${seated ? 'clip-path="url(#seatClip)"' : ''}><g transform="${tf}">${mkLazy()}</g></g>${gownSvg}${chairFront}`; };
  const lazy = lazyBody();
  const sm = (h, tt) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(h(Math.max(0, tt - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const ds = marState(t), ys = bruState(t);
  const char = (st, fn, look, seed, stateFn, who) => { if (!st) return { body: '', tool: '' }; const { ch } = st; const hs = (tt) => { const q = stateFn(tt); return q ? q.hands : 'none'; }; const nsm = sm(hs, t);
    const base = { ...st, elbowDown: true, armL: nsm.L, armR: nsm.R, blink: blinkOf(t, seed), look, t, mouthOpen: MOUTHW(who, t) };
    const shd = `<ellipse cx="${ch.x + 30 * ch.s}" cy="${ch.y + 712 * ch.s}" rx="${150 * ch.s}" ry="${22 * ch.s}" fill="#000" opacity="0.28" filter="url(#b10)"/>`;
    return { body: `${shd}<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'body' })}</g>`, tool: `<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'tool' })}</g>` }; };
  const dus = char(ds, drawMari2, -0.6, 0.6, marState, 'M'), yaz = char(ys, drawBruna, 0.5, 2.1, bruState, 'F');
  const par = (f) => `translate(540,960) scale(${1 + (cam.z - 1) * f}) translate(${-(540 + (cam.x - 540) * f)},${-(960 + (cam.y - 960) * f)})`;
  const bgLayer = `<g transform="${par(0.85)}"><image href="${platePng[sc]}" width="${W}" height="${H}" preserveAspectRatio="none"/></g>`;
  const inSalon = sc === 'lab';
  const worldInner = `${bgLayer}<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})">${dus.body}${inSalon ? yaz.body : ''}${lazy}${dus.tool}${inSalon ? yaz.tool : ''}${revealFx(t)}</g>`;
  const tr = transitionAt(t); const wrapW = (scl, dx, op) => `<g opacity="${op}" transform="translate(${540 + dx},960) scale(${scl}) translate(-540,-960)">${worldInner}</g>`;
  const glitch = (g) => g > 2 ? [0, 1, 2, 3].map((i) => `<rect x="0" y="${300 + i * 380 + Math.sin(t * 40 + i) * 40}" width="${W}" height="${50 + i * 14}" fill="#fff" opacity="${0.1 * Math.min(1, g / 20)}" transform="translate(${Math.sin(t * 77 + i) * g * 0.8},0)"/>`).join('') : '';
  const world0 = tr.on ? (tr.ghost ? wrapW(tr.sc * 1.05, tr.gx * 1.4, 0.4) + wrapW(tr.sc * 1.025, tr.gx * 0.7, 0.55) : '') + wrapW(tr.sc, 0, 1) + glitch(Math.abs(tr.gx)) + `<rect width="${W}" height="${H}" fill="#fff" opacity="${tr.fl}"/>` : worldInner;
  const tense = clamp((t - T.msg2A) / 0.3) * (1 - clamp((t - T.vote + 0.2) / 0.4)); const darkTint = tense > 0.01 ? `<rect width="${W}" height="${H}" fill="#12031a" opacity="${(0.28 * tense).toFixed(3)}"/>` : '';
  const uvTint = '';
  const warm = '';
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#20061a" stop-opacity="0.35"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const bnOn = stepBanners.some(([n, tx, a, b]) => t > a - 0.1 && t < b + 0.1); const chipTop = (t < 4.5 || bnOn) ? '' : `<g transform="translate(540,300)"><defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd84a"/><stop offset="1" stop-color="#b8780f"/></linearGradient></defs><rect x="-226" y="-40" width="440" height="88" rx="44" fill="#000" opacity="0.3"/><rect x="-230" y="-46" width="440" height="88" rx="44" fill="#1a1024" stroke="#d4a24c" stroke-width="6"/><text x="0" y="18" font-family="Bungee" font-size="48" text-anchor="middle" letter-spacing="3" fill="url(#chg)" stroke="${OUT}" stroke-width="4" paint-order="stroke">DÍA 15/30</text></g>`;
  const flashR = Math.max(0, 1 - Math.abs(t - T.openA - 0.5) / 0.2) * 0.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}${ALLDEFS}${MDEFS}<defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world0}${warm}${darkTint}${uvTint}${vignette}${slateIntro(t)}
    ${chipTop}${insTray(t)}${eyeMap(t)}${insCurl(t)}${eyeCurl(t)}${insGlue(t)}${insTwe(t)}${eyeApply(t)}${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}${phoneChat(t, T.msgA, 'Número desconocido', UNK_AV, ['sin contacto', '#9ca3af'], [{ t: 'Dormiste poco, ¿verdad, Lazy?' }], 0, 4.0)}${phoneChat(t, T.msg2A, 'Número desconocido', UNK_AV, ['sin contacto', '#9ca3af'], [{ t: 'Dormiste poco, ¿verdad, Lazy?' }, { t: 'Ya casi estás lista, Lazy.' }], 1, 7.2)}
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
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a0; i < a1; i++) { if (!ff.stdin.write(frame(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if ((i - a0) % 60 === 0) console.log('frame', i, '/', a1); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out);
}
