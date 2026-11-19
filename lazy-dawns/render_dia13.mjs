// Lazy Dawns - DIA 13: "Armonia de perfil" (spa, piel de cristal, Dante aliado de M, el cabello se cae). Voces: narrador, Dante, Dra. Renata, Isa, M. Los personajes NO mueven la boca para hablar.
// Uso: node render_dia13.mjs preview 5 12 ...   |   node render_dia13.mjs <inicio> <fin> <salida.mp4>   |   node render_dia13.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs, hand } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { handsToTargets, salonTool, armIK } from './chars.mjs';
import { drawMontes, drawNuria } from './chars13.mjs';
import { drawMari } from './chars.mjs';
import { renderCharacter, defaultPose as defPose2, ik2, SK as SK2, ALLDEFS } from './rig2d/character.mjs';
import { MDEFS, renderM } from './rig2d/m_character.mjs';
import { poseClip } from './rig2d/m_clips.mjs';
import { makeDirector } from './director14.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia13');
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
  slateEnd: 1.4, hookA: L.l1.start + 0.3, msgA: w('l2', 'Mari') - 0.5, clinicA: L.l3.start - 0.1, meetA: L.l4.start, scanA: w('l5', 'arco') - 0.5, holoA: w('l5', 'perfil') - 0.3, pickA: L.l6.start, numbA: w('l7', 'anestesica') - 0.4, syrA: w('l7', 'jeringa') - 0.5,
  hackA: w('l8', 'parpadeo') - 0.3, mvoice: L.l9.start, alertA: L.l10.start, handA: L.l11.start, sculptA: L.l12.start, coldA: w('l13', 'compresa') - 0.4, revealA: L.l14.start - 0.1, msg2A: w('l15', 'Mari') - 0.5,
  vote: w('l16', 'Que') - 0.1, optA: w('l16', 'unas'), optB: w('l16', 'zapatos'), cta1: w('l16', 'Comenta'), cta2: w('l16', 'sigueme'),
};
T.homeA = T.hookA; T.scanB = T.scanA + 2.6; T.holoB = T.holoA + 2.6; T.numbB = T.numbA + 2.6; T.syrB = T.syrA + 2.8; T.coldB = T.coldA + 2.6; T.walks = [];
T.scenes = [T.slateEnd, T.hookA, T.msgA, T.clinicA, T.meetA, T.scanA, T.holoA, T.pickA, T.numbA, T.syrA, T.hackA, T.mvoice, T.alertA, T.handA, T.sculptA, T.coldA, T.revealA, T.msg2A, T.vote];
const OBJF = { slate13: 'slate13', facearch: 'facearch13', holonose: 'holonose13', tube: 'tube13', syringe: 'syringe13', compress: 'compress13' };
const OBJN = Object.fromEntries(Object.entries(OBJF).map(([k, v]) => [k, readdirSync(path.join(here, 'plates3d/obj', v)).filter((f) => f.endsWith('.png')).length]));
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });
// ---------------- fondos 3D y defs ----------------
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates3d', n + '.png')));
const platePng = { balcony: PL('balcony13_dof'), clinic: PL('auroraclinic13_dof') };
const VIN = `<linearGradient id="vin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f766e"/><stop offset="0.35" stop-color="#2dd4bf"/><stop offset="0.7" stop-color="#14b8a6"/><stop offset="1" stop-color="#134e4a"/></linearGradient><linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ca3af"/><stop offset="0.4" stop-color="#f3f4f6"/><stop offset="1" stop-color="#6b7280"/></linearGradient>`;
function chairBack() { return `<defs>${VIN}</defs><ellipse cx="540" cy="1650" rx="330" ry="34" fill="#000" opacity="0.3"/><rect x="496" y="1490" width="88" height="170" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/><ellipse cx="540" cy="1660" rx="210" ry="30" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>
  <rect x="300" y="820" width="480" height="470" rx="120" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M336,870 Q336,846 400,846" stroke="#fff" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="236" y="1080" width="96" height="46" rx="22" fill="#115e59" stroke="${OUT}" stroke-width="7"/><rect x="748" y="1080" width="96" height="46" rx="22" fill="#115e59" stroke="${OUT}" stroke-width="7"/>`; }
function chairFront() { return `<path d="M276,1246 Q540,1226 804,1246 L822,1470 Q540,1498 258,1470Z" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M316,1280 Q540,1264 764,1280" stroke="#fff" stroke-opacity="0.3" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="300" y="1470" width="480" height="36" rx="14" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>`; }
// ---------------- personajes, lugares y camara ----------------
const sceneAt = (t) => (t >= T.clinicA ? 'clinic' : 'balcony');
const NEWS = 0.7;
const lazyPlace = (t) => ({ x: 540, fy: 1655, S: 0.7, vis: true, seated: false });
const headOf = (t) => ({ x: 540, y: 788 + 110 * (t >= sitA && t < standA ? ease((t - sitA) / 0.7) : 0), S: 0.62 });
const facePt = (t, lx, ly) => { const h = headOf(t); return { x: h.x + lx * h.S, y: h.y + ly * h.S }; };
const SIT_DROP = 110, HEAD_CX = 540, HEAD_CY = 788;
const sitA = L.l4.start + 2.6, workA = T.scanA - 0.6, standA = T.revealA;
const seatedK = (t) => ease((t - sitA) / 0.7) * (t < standA ? 1 : 0);
const workK = (t) => smooth((t - workA) / 0.9) * (t < standA ? 1 : 0);
const headWorld = (t) => ({ x: HEAD_CX, y: HEAD_CY + SIT_DROP * seatedK(t) });
const noseW = (t) => { const h = headWorld(t); return { x: h.x, y: h.y + 42 }; };
const MSTAND = { x: 205, y: 905, s: 0.76 }, NSTAND = { x: 880, y: 895, s: 0.78 }, MWORK = { x: 345, y: 705, s: 0.66 }, NWORK = { x: 735, y: 705, s: 0.66 };
const monCh = (t) => { const k = workK(t), e = 1 - ease((t - T.clinicA - 0.6) / 1.2); return { x: lerp(MSTAND.x - 420 * e, MWORK.x, k), y: lerp(MSTAND.y, MWORK.y, k), s: lerp(MSTAND.s, MWORK.s, k) }; };
const nurCh = (t) => { const k = workK(t), e = 1 - ease((t - T.meetA - 1.6) / 1.1); return { x: lerp(NSTAND.x + 420 * e, NWORK.x, k), y: lerp(NSTAND.y, NWORK.y, k), s: lerp(NSTAND.s, NWORK.s, k) }; };
const toLocal = (ch, wx, wy) => ({ x: (wx - ch.x) / ch.s, y: (wy - ch.y) / ch.s });
function monState(t) { if (t < T.clinicA + 0.6 || t >= T.vote) return null; const ch = monCh(t); const n = noseW(t); let mood = 'happy', hands = 'clasp', tool = 'none', ex = {};
  const at = (wx, wy, k, rot, side = 1, sc = 1) => { const L = toLocal(ch, wx, wy); tool = k; ex = { elbowLow: true, toolSide: side, toolX: L.x, toolY: L.y, toolR: rot, toolS: sc / ch.s * 0.66 }; };
  if (t >= T.scanA) { mood = 'focus'; hands = 'none'; } if (t >= T.pickA) { mood = 'proud'; hands = 'clasp'; }
  if (t >= T.syrA && t < T.hackA) { mood = 'focus'; hands = 'none'; at(n.x - 55, n.y - 12, 'syringe', -62, 1, 0.55); }
  if (t >= T.hackA) { mood = 'shock'; hands = 'cheeks'; tool = 'none'; } if (t >= T.alertA) { mood = 'serious'; hands = 'hips'; }
  if (t >= T.handA && t < T.coldA) { mood = 'focus'; hands = 'none'; at(n.x - 38, n.y + 4 + 6 * Math.sin(t * 3), 'comb2', -70, 1, 0.0001); }
  if (t >= T.coldA) { mood = 'proud'; hands = 'clasp'; tool = 'none'; } if (t >= T.revealA) { mood = 'grin'; } if (t >= T.msg2A) { mood = 'happy'; }
  return { mood, hands, tool, ch, ...ex }; }
function nurState(t) { if (t < T.meetA - 0.3 || t >= T.vote) return null; const ch = nurCh(t); const n = noseW(t); let mood = 'happy', hands = 'hips', tool = 'none', ex = {};
  const at = (wx, wy, k, rot, side = -1, sc = 1) => { const L = toLocal(ch, wx, wy); tool = k; ex = { elbowLow: true, toolSide: side, toolX: L.x, toolY: L.y, toolR: rot, toolS: sc / ch.s * 0.66 }; };
  if (t >= T.scanA) { mood = 'focus'; hands = 'none'; } if (t >= T.pickA && t < T.numbA) { at(n.x + 300, n.y + 330, 'tablet', 12, -1, 0.8); mood = 'proud'; }
  if (t >= T.numbA && t < T.syrA + 0.5) { mood = 'focus'; at(n.x + 40, n.y + 6 + 5 * Math.sin(t * 4), 'cloth', 70, -1, 0.35); }
  if (t >= T.syrA) { mood = 'worry'; hands = 'clasp'; tool = 'none'; }
  if (t >= T.hackA) { mood = 'shock'; hands = 'cheeks'; } if (t >= T.alertA) { mood = 'shock'; at(n.x + 320, n.y + 300, 'tablet', 12, -1, 0.8); }
  if (t >= T.handA) { mood = 'focus'; tool = 'none'; hands = 'clasp'; }
  if (t >= T.coldA && t < T.coldB + 0.8) { mood = 'focus'; hands = 'none'; at(n.x + 46, n.y + 12, 'cloth', 70, -1, 0.4); }
  if (t >= T.revealA) { mood = 'proud'; hands = 'clasp'; tool = 'none'; } if (t >= T.msg2A) { mood = 'worry'; }
  return { mood, hands, tool, ch, ...ex }; }
const MOUTHW = (who, t) => { const l = DATA.lines.find((q) => q.who === who && t >= q.start - 0.05 && t <= q.end + 0.1); if (!l) return 0; for (const [ww, s, e] of l.words) if (t >= s - 0.02 && t <= e + 0.04) { const k = (t - s) / Math.max(0.12, e - s); return 0.28 + 0.62 * Math.abs(Math.sin((t - s) * 21 + ww.length)) * (0.7 + 0.3 * Math.sin(k * 3.14)); } return 0.04; };
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
// camara cinematografica: empujes, grua, empuje extremo al lunar, movimientos de paralaje
const CAM = [[0, 1.0, 540, 960], [T.slateEnd, 1.0, 540, 960], [T.hookA, 1.12, 540, 1000], [T.msgA - 0.2, 1.3, 540, 900], [T.clinicA - 0.3, 1.0, 540, 960], [T.clinicA + 2, 1.1, 460, 960], [T.meetA, 1.12, 440, 950], [sitA, 1.1, 540, 1000], [T.scanA - 0.2, 1.0, 540, 980], [T.scanA + 0.8, 1.6, 540, 930], [T.holoA, 1.05, 540, 940], [T.pickA, 1.12, 640, 950], [T.numbA - 0.2, 1.1, 540, 980], [T.numbA + 0.9, 2.1, 540, 930], [T.syrA - 0.2, 1.3, 500, 940], [T.syrA + 0.9, 2.2, 520, 930], [T.hackA - 0.1, 1.15, 540, 900], [T.mvoice, 1.05, 540, 880], [T.alertA, 1.1, 640, 960], [T.handA, 1.4, 500, 940], [T.sculptA + 0.5, 2.2, 520, 930], [T.sculptA + 4, 1.9, 530, 920], [T.coldA - 0.2, 1.3, 540, 960], [T.coldA + 0.8, 2.0, 540, 930], [T.revealA, 1.0, 540, 960], [T.revealA + 3, 1.7, 540, 800], [T.msg2A, 1.15, 540, 900], [T.vote - 0.2, 1.1, 540, 960], [9999, 1.1, 540, 960]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.hackA, T.hackA + 0.6, 0.02, 0.4) * 9 + win(t, T.alertA, T.alertA + 0.4, 0.02, 0.3) * 6 + win(t, T.mvoice, T.mvoice + 0.4, 0.02, 0.3) * 6;
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
function revealFx(t) { const d = t - T.revealA; if (d < 0.2 || d > 4) return ''; const h = headOf(t); let s = '';
  for (let i = 0; i < 22; i++) { const a = d - 0.2 - i * 0.06; if (a < 0 || a > 1.5) continue; const ang = i * 2.399, rr = 60 + a * 260; s += sparkle(h.x + Math.cos(ang) * rr * 1.1, h.y + 60 + Math.sin(ang) * rr * 0.9, 1.4 + (i % 3) * 0.5, 1 - a / 1.5, i % 2 ? '#fff' : (i % 4 ? '#7ff0ea' : '#ffc2e0')); }
  return s; }
// efectos del proceso sobre la cara de Lazy
function procFx(t) { const h = headOf(t), n = noseW(t); let s = '';
  // arco escaner: aro de luz que baja por la cara + malla
  if (t > T.scanA + 0.4 && t < T.scanB + 0.6) { const k = clamp((t - T.scanA - 0.4) / 0.4) * (1 - clamp((t - T.scanB) / 0.6)); const y = h.y - 130 + ((t - T.scanA) * 160) % 300; s += `<g opacity="${k.toFixed(2)}"><ellipse cx="${h.x}" cy="${y.toFixed(0)}" rx="130" ry="26" fill="none" stroke="#7ff0ea" stroke-width="5"/><ellipse cx="${h.x}" cy="${y.toFixed(0)}" rx="130" ry="26" fill="none" stroke="#7ff0ea" stroke-width="16" opacity="0.25"/>${[...Array(9)].map((_, i) => `<path d="M${h.x - 100 + i * 25},${h.y - 120} Q${h.x - 120 + i * 30},${h.y + 20} ${h.x - 90 + i * 22},${h.y + 140}" stroke="#7ff0ea" stroke-width="1.6" fill="none" opacity="0.5"/>`).join('')}</g>`; }
  // crema anestesica sobre la nariz
  if (t > T.numbA + 0.9 && t < T.syrA + 1.0) { const k = clamp((t - T.numbA - 0.9) / 0.8); s += `<ellipse cx="${n.x}" cy="${n.y}" rx="${34 * k}" ry="${22 * k}" fill="#fff" stroke="#c9dde5" stroke-width="2" opacity="0.92"/>`; }
  // gel inyectado: brillo azul y gotas
  if (t > T.syrA + 0.9 && t < T.hackA + 0.2) { const k = clamp((t - T.syrA - 0.9) / 0.5); for (let i = 0; i < 6; i++) { const age = (t * 1.5 + i / 6) % 1; s += `<ellipse cx="${(n.x - 50 + age * 30).toFixed(0)}" cy="${(n.y - 10 + age * 20).toFixed(0)}" rx="5" ry="8" fill="#8fe8ff" opacity="${(k * (1 - age)).toFixed(2)}"/>`; } s += `<ellipse cx="${n.x}" cy="${n.y}" rx="44" ry="34" fill="#4fd8ff" opacity="${(0.18 * k).toFixed(2)}"/>`; }
  // modelado a mano: halo calido en las yemas
  if (t > T.sculptA + 0.4 && t < T.coldA) { const k = clamp((t - T.sculptA - 0.4) / 0.5); s += `<ellipse cx="${n.x}" cy="${n.y}" rx="${60 + 8 * Math.sin(t * 5)}" ry="${48}" fill="none" stroke="#ffd9a0" stroke-width="5" opacity="${(0.55 * k).toFixed(2)}"/>`; }
  // compresa fria: bruma azul
  if (t > T.coldA + 0.6 && t < T.coldB + 1.2) { const k = clamp((t - T.coldA - 0.6) / 0.5) * (1 - clamp((t - T.coldB - 0.5) / 0.7)); for (let i = 0; i < 8; i++) { const age = (t * 0.8 + i / 8) % 1; s += `<circle cx="${(n.x + Math.sin(i * 3) * 50).toFixed(0)}" cy="${(n.y - age * 90).toFixed(0)}" r="${(16 + age * 26).toFixed(0)}" fill="#d8f5ff" fill-opacity="${(0.28 * k * (1 - age)).toFixed(2)}"/>`; } }
  return s; }
// holograma flotante de perfiles de nariz (SVG) junto a Lazy
function holoPanel(t) { const a = T.holoA, b = T.pickA + 5.5; if (t < a - 0.2 || t > b) return ''; const k = win(t, a - 0.2, b, 0.4, 0.4); const hackK = clamp((t - T.hackA) / 0.3) * (1 - clamp((t - T.alertA - 2.0) / 0.5)); const pick = clamp((t - T.pickA) / 0.8);
  const prof = (i, big) => `<path d="M0,-40 C${4 + i * 1.6},-10 ${22 + i * 1.5},${8 - i * 1.2} ${18 + i * 2},${28} C${14 + i * 2},${38 + (i % 2) * 4} ${-4 + i},${38} ${-8},${26} L-4,-40Z" fill="none" stroke="${big ? '#ff3d9a' : '#7ff0ea'}" stroke-width="${big ? 3.6 : 2.6}"/>`;
  const items = [0, 1, 2, 3, 4, 5].map((i) => { const gx = (i % 3) * 110, gy = Math.floor(i / 3) * 130, sel = i === 3 && pick > 0.2; return `<g transform="translate(${gx + 58},${gy + 70}) scale(${sel ? 1.25 : 1})"><rect x="-48" y="-62" width="96" height="116" rx="10" fill="${sel ? '#ff3d9a' : '#7ff0ea'}" fill-opacity="${sel ? 0.16 : 0.07}" stroke="${sel ? '#ff3d9a' : '#7ff0ea'}" stroke-width="2"/>${hackK > 0.2 && sel ? `<circle cx="14" cy="26" r="${22 + 12 * hackK}" fill="#e01a30" stroke="#800018" stroke-width="3"/>` : prof(i, sel)}</g>`; }).join('');
  return `<g transform="translate(${540 + 220},${700}) skewY(-4)" opacity="${k.toFixed(2)}"><rect x="-6" y="-6" width="350" height="290" rx="16" fill="#062a38" fill-opacity="0.82" stroke="#7ff0ea" stroke-width="3"/><text x="170" y="-18" font-family="Anton" font-size="30" text-anchor="middle" fill="#7ff0ea" stroke="#06222e" stroke-width="6" paint-order="stroke" letter-spacing="2">${hackK > 0.2 ? '¡ERROR 404!' : 'NARIZ'}</text>${items}</g>`; }
// pantalla hackeada con M (rig 2D) sobre la pared de la clinica
function hackScreen(t) { const a = T.hackA + 0.4, b = T.alertA + 3.0; if (t < a || t > b) return ''; const k = win(t, a, b, 0.25, 0.4); const tt = t - a; const P = poseClip(t >= T.mvoice ? 'laugh' : 'idle', t >= T.mvoice ? Math.min(1.4, t - T.mvoice) : tt); if (t >= T.mvoice && t <= L.l9.end) P.smile = 52 + 28 * Math.abs(Math.sin(t * 15)); P.eyes.glow = 1.3;
  const gl = [...Array(6)].map((_, i) => `<rect x="0" y="${(i * 110 + (t * 400) % 110).toFixed(0)}" width="640" height="${6 + (i % 3) * 3}" fill="#ff2a4a" opacity="0.2"/>`).join('');
  return `<g opacity="${k.toFixed(2)}" transform="translate(220,250)"><clipPath id="hsc"><rect x="0" y="0" width="640" height="470" rx="18"/></clipPath><rect x="-10" y="-10" width="660" height="490" rx="24" fill="#0a0a12" stroke="#e01a30" stroke-width="6"/><rect width="640" height="470" rx="18" fill="#1a0610"/><g clip-path="url(#hsc)"><g transform="translate(${320 - 512 * 0.34},${470 - 1250 * 0.34}) scale(0.34)">${renderM(P)}</g>${gl}<rect width="640" height="470" fill="#ff2a4a" opacity="${(0.1 + 0.06 * Math.sin(t * 20)).toFixed(2)}"/></g><text x="22" y="40" font-family="Anton" font-size="30" fill="#ff5a6a">● SEÑAL INTERCEPTADA</text></g>`; }
// celular realista con chat de Mari (foto de perfil = cara de Mari)
const MARI_AV = (rr = 44) => `<clipPath id="mav"><circle cx="0" cy="0" r="${rr}"/></clipPath><circle r="${rr + 3}" fill="#ff7ab6" stroke="#12090a" stroke-width="3"/><g clip-path="url(#mav)"><rect x="${-rr}" y="${-rr}" width="${rr * 2}" height="${rr * 2}" fill="#ffd0e6"/><g transform="translate(0,${rr * 0.1}) scale(${(rr / 120).toFixed(3)})">${drawMari({ part: 'body', mood: 'happy', t: 1, look: 0, hands: 'none' })}</g></g>`;
function marChat(t, a, msgs, newIdx) { const b = a + 4.4; if (t < a - 0.1 || t > b) return ''; const k = ease((t - a) / 0.45) * (1 - ease((t - b + 0.45) / 0.45)); if (k <= 0.01) return ''; const rise = lerp(520, 0, k);
  const typing = t < a + 1.3 ? clamp((t - a - 0.4) / 0.2) : 0; const shown = t >= a + 1.3; const bub = (txt, y, mine, nw) => { let l1 = txt, l2 = ''; if (txt.length > 26) { const cut = txt.lastIndexOf(' ', 26); l1 = txt.slice(0, cut); l2 = txt.slice(cut + 1); } const wd = Math.min(460, 44 + Math.max(l1.length, l2.length) * 14.5), lines = l2 ? 2 : 1; return `<g transform="translate(${mine ? 230 - wd : -230},${y})"><rect width="${wd}" height="${lines * 44 + 26}" rx="26" fill="${mine ? '#3b82f6' : '#e5e7eb'}"/><text x="22" y="40" font-family="Inter" font-weight="700" font-size="25" fill="${mine ? '#fff' : '#111'}">${esc(l1)}</text>${l2 ? `<text x="22" y="84" font-family="Inter" font-weight="700" font-size="25" fill="${mine ? '#fff' : '#111'}">${esc(l2)}</text>` : ''}</g>`; };
  let chat = ''; let y = -300; msgs.forEach((m, i) => { if (i < newIdx || shown) { chat += bub(m, y, false); y += (m.length > 28 ? 126 : 82); } }); if (!shown) chat += `<g transform="translate(-230,${y})"><rect width="130" height="64" rx="30" fill="#e5e7eb"/>${[0, 1, 2].map((d) => `<circle cx="${34 + d * 30}" cy="32" r="${8 + 3 * Math.sin(t * 9 + d * 1.2)}" fill="#9ca3af"/>`).join('')}</g>`;
  return `<g><rect width="${W}" height="${H}" fill="#05030a" opacity="${(0.55 * k).toFixed(2)}"/><g transform="translate(540,${(850 + rise).toFixed(0)}) scale(0.82) rotate(${(-3 * (1 - k)).toFixed(1)})"><rect x="-290" y="-640" width="580" height="1280" rx="78" fill="#0b0b12" stroke="#374151" stroke-width="8"/><rect x="-276" y="-626" width="552" height="1252" rx="66" fill="#f8fafc"/><rect x="-100" y="-626" width="200" height="40" rx="20" fill="#0b0b12"/><text x="-228" y="-596" font-family="Inter" font-weight="800" font-size="24" fill="#111">9:41</text><rect x="196" y="-612" width="38" height="18" rx="5" fill="none" stroke="#111" stroke-width="3"/><rect x="200" y="-608" width="26" height="10" rx="2" fill="#111"/><rect x="-276" y="-570" width="552" height="130" fill="#fff"/><path d="M-276,-440 h552" stroke="#e5e7eb" stroke-width="3"/><path d="M-240,-505 l-22,0 m0,0 l12,-12 m-12,12 l12,12" stroke="#3b82f6" stroke-width="6" fill="none" stroke-linecap="round"/><g transform="translate(-170,-505)">${MARI_AV(48)}</g><text x="-98" y="-512" font-family="Inter" font-weight="800" font-size="32" fill="#111">Mari</text><text x="-98" y="-480" font-family="Inter" font-weight="600" font-size="22" fill="#22c55e">● en línea</text><g transform="translate(0,-60)">${chat}</g><rect x="-250" y="540" width="500" height="64" rx="32" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="3"/><text x="-224" y="582" font-family="Inter" font-weight="600" font-size="26" fill="#9ca3af">Mensaje</text><circle cx="214" cy="572" r="24" fill="#3b82f6"/></g></g>`; }
function marMsg(t, a, txt) { return ''; }

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
const insScan = (t) => ins3(t, T.scanA, T.scanB, 'facearch', 'ESCÁNER FACIAL 3D', '#7ff0ea', 700, 1180);
const insHolo = (t) => ins3(t, T.holoA, T.holoB, 'holonose', 'DISEÑO DE NARIZ', '#ff9ad0', 700, 1180);
const insTube = (t) => ins3(t, T.numbA, T.numbB, 'tube', 'CREMA ANESTÉSICA', '#a5f3fc', 720, 1180);
const insSyr = (t) => ins3(t, T.syrA, T.syrB, 'syringe', 'ÁCIDO HIALURÓNICO', '#bff3ff', 720, 1180);
const insCold = (t) => ins3(t, T.coldA, T.coldB, 'compress', 'COMPRESA FRÍA', '#d8f5ff', 720, 1180);

const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const fitFs = (txt, maxW, fs0) => { let fs = fs0, wd = inkWidth(esc(txt), fs); if (wd > maxW) fs = Math.max(26, Math.floor(fs * maxW / wd)); return fs; };
const SPEAK = { N: { col: '#ffe14d', name: null }, Q: { col: '#7dd3fc', name: 'DR. MONTES' }, U: { col: '#d8b4fe', name: 'NURIA' } };
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
const SPEAK8 = { D: { col: '#ff5a6a', name: 'M' } };
Object.assign(SPEAK, SPEAK8);
function counterChip(t) { return ''; }
const stepBanners = [['1', 'ESCÁNER FACIAL 3D', T.scanA - 0.2, T.pickA - 0.4, '#a5f3fc'], ['2', 'DISEÑO DE LA NARIZ', T.pickA, T.numbA - 0.2, '#fbcfe8'], ['3', '¡SISTEMA HACKEADO!', T.hackA, T.alertA + 2.2, '#fecaca'], ['4', 'MODELADO A MANO', T.sculptA - 0.2, T.coldA - 0.4, '#fde68a']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,300) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="40" y="20" font-family="Anton" font-size="${fitFs(text, 500, 62)}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
// ---------------- villano M: figura de espaldas / de frente, silla giratoria, guante, pantallas con feed de Lazy ----------------
function mFigure(t) { return ''; }
function feeds(t) { return ''; }
function lairFx(t) { return ''; }
function mirrorOverlay(t) { return ''; }
function mirrorOverlayOld(t) { const a = win(t, T.mirrorA + 0.3, T.mirrorB, 0.35, 0.4); if (a <= 0) return ''; const u = clamp((t - T.mirrorA) / (T.mirrorB - T.mirrorA)), h = headOf(t);
  return `<g opacity="${a}"><path d="M0,0 H${W} V${H} H0Z M540,860 m-430,0 a430,610 0 1,0 860,0 a430,610 0 1,0 -860,0Z" fill="#05060a" fill-rule="evenodd" opacity="0.93"/><ellipse cx="540" cy="860" rx="430" ry="610" fill="none" stroke="#e8c27a" stroke-width="24"/><ellipse cx="540" cy="860" rx="406" ry="586" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/>
    <g opacity="${0.4 + 0.2 * Math.sin(t * 2)}"><path d="M300,300 L420,300 L240,1260 L120,1260Z" fill="#fff" opacity="0.1" transform="translate(${((t - T.mirrorA) * 120) % 600},0)"/></g></g>`; }
function slateIntro(t) { const END = 4.3; if (t > END) return ''; const ex = ease(clamp((t - 3.4) / 0.9)); const k = 1 - clamp((t - 3.8) / 0.7);
  const fade = Math.max(0, k * (1 - ex)); const clap = clamp((t - 0.55) / 0.08) * (1 - clamp((t - 0.7) / 0.3)); const shk = t > 0.6 && t < 1.0 ? Math.sin(t * 90) * 7 * (1 - (t - 0.6) / 0.4) : 0;
  const stripes = Array.from({ length: 16 }, (_, i) => `<path d="M${-200 + i * 150 + (t * 40) % 150},0 L${60 + i * 150 + (t * 40) % 150},0 L${-340 + i * 150 + (t * 40) % 150},${H} L${-600 + i * 150 + (t * 40) % 150},${H}Z" fill="#ff5a6a" opacity="${(i % 2 ? 0.05 : 0.025) * fade}"/>`).join('');
  const dust = Array.from({ length: 46 }, (_, i) => `<circle cx="${((i * 197) + t * (12 + i % 5 * 6)) % W}" cy="${((i * 311) - t * (14 + i % 4 * 8) + 4000) % H}" r="${1.5 + (i % 3)}" fill="#ff9aa6" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * fade}"/>`).join('');
  const sil = clamp((t - 2.2) / 1.0) * 0.8;
  const sl = obj3('slate13', clamp(t / 3.6), 0, 0, 1300).replace('<image ', `<image opacity="${fade}" `);
  return `<g><defs><radialGradient id="bgB" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="#5a0f1e"/><stop offset="0.55" stop-color="#1c0610"/><stop offset="1" stop-color="#060208"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bgB)" opacity="${fade}"/>${stripes}
    <g opacity="${fade * sil}" transform="translate(860,1330)"><path d="M-110,300 Q-130,40 -40,-10 L40,-10 Q130,40 110,300Z" fill="#000"/><ellipse cx="0" cy="-60" rx="62" ry="68" fill="#000"/><ellipse cx="0" cy="-118" rx="118" ry="20" fill="#000"/><path d="M-60,-122 Q0,-214 60,-122Z" fill="#000"/><circle cx="-22" cy="-70" r="6" fill="#ef4444"/><circle cx="22" cy="-70" r="6" fill="#ef4444"/></g>${dust}
    <ellipse cx="560" cy="1440" rx="440" ry="50" fill="#000" opacity="${0.3 * fade}"/><g transform="translate(${540 + 20 + shk},${900 + shk * 0.6}) scale(${1 + ex * 0.5})">${fade > 0.04 ? sl : ''}</g><rect width="${W}" height="${H}" fill="#fff" opacity="${clap * 0.55}"/></g>`; }
ICON['PIEL9'] = `<ellipse rx="22" ry="25" fill="#c58a62" stroke="${OUT}" stroke-width="3.5"/><path d="M-14,-12 q14,-6 28,0 M-12,-5 q12,-5 24,0" stroke="#5a2d14" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="-8" cy="2" r="2.6" fill="${OUT}"/><circle cx="8" cy="2" r="2.6" fill="${OUT}"/><path d="M-10,13 q10,8 20,0" stroke="${OUT}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-17,6 q4,5 9,5 M17,6 q-4,5 -9,5" stroke="#5a2d14" stroke-width="1.6" fill="none"/><g transform="translate(20,-20)"><path d="M0,-9 Q1.5,-1.5 9,0 Q1.5,1.5 0,9 Q-1.5,1.5 -9,0 Q-1.5,-1.5 0,-9Z" fill="#fde047" stroke="${OUT}" stroke-width="1.6"/></g>`;
ICON['UNAS12'] = `<path d="M-16,-24 C-34,-8 -30,18 -22,30 C-12,24 -12,4 -8,-6 Z" fill="#3a2418" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/><path d="M16,-24 C34,-8 30,18 22,30 C12,24 12,4 8,-6 Z" fill="#3a2418" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="0" cy="-2" rx="15" ry="19" fill="#c58a62" stroke="${OUT}" stroke-width="3"/><path d="M-17,-8 Q-6,-30 17,-8 Q4,-18 -17,-8Z" fill="#3a2418" stroke="${OUT}" stroke-width="2.4"/><path d="M-22,6 q-4,10 -2,20 M-17,10 q-3,8 -1,16" stroke="#a39a98" stroke-width="1.6" fill="none" stroke-linecap="round"/><g transform="translate(20,-20)"><path d="M0,-9 Q1.5,-1.5 9,0 Q1.5,1.5 0,9 Q-1.5,1.5 -9,0 Q-1.5,-1.5 0,-9Z" fill="#fde047" stroke="${OUT}" stroke-width="1.6"/></g>`;
ICON['UNAS12'] = `<path d="M-26,34 L-26,-2 Q-26,-8 -20,-8 Q-14,-8 -14,-2 L-14,-14 Q-14,-20 -8,-20 Q-2,-20 -2,-14 L-2,-18 Q-2,-24 4,-24 Q10,-24 10,-18 L10,-12 Q10,-18 16,-18 Q22,-18 22,-12 L22,16 Q22,34 4,36 L-14,36Z" fill="#e6b08a" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/>${[[-20,-6],[-8,-16],[4,-21],[16,-14]].map(([x, y]) => `<path d="M${x - 5},${y + 7} L${x - 5},${y - 1} Q${x},${y - 7} ${x + 5},${y - 1} L${x + 5},${y + 7}Z" fill="#ff3d9a" stroke="${OUT}" stroke-width="1.6"/>`).join('')}<path d="M-23,-10 q4,-3 8,0" stroke="#fff" stroke-width="1.4" fill="none"/>`;
ICON['ZAPATO13'] = `<g transform="translate(0,2)"><path d="M-30,6 L-22,-22 Q-12,-24 -4,-6 L10,6 L30,12 Q34,22 26,24 L-24,24 Q-32,20 -30,6Z" fill="#e01a30" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/><path d="M-24,24 L-26,38 L-18,38 L-14,24" fill="#8a0c1c" stroke="${OUT}" stroke-width="2.6"/><path d="M-18,-8 Q-8,0 0,6" stroke="#fff" stroke-opacity="0.6" stroke-width="3" fill="none"/></g>`;
ICON['VESTIDO9'] = `<path d="M-9,-26 L9,-26 L12,-12 L22,24 Q0,32 -22,24 L-12,-12Z" fill="#10b981" stroke="${OUT}" stroke-width="3.6" stroke-linejoin="round"/><path d="M-12,-12 Q0,-4 12,-12" stroke="${OUT}" stroke-width="2.6" fill="none"/><path d="M-13,-8 L13,-8" stroke="#fbbf24" stroke-width="5" stroke-linecap="round"/><path d="M-16,8 q-3,8 -4,14 M-4,4 q-1,12 -2,22 M8,4 q2,12 3,22 M16,8 q4,8 5,14" stroke="#065f46" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.8"/>`;
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  let s = `<defs><radialGradient id="ecg" cx="0.5" cy="0.42" r="0.8"><stop offset="0" stop-color="#2a1236"/><stop offset="1" stop-color="#08040c"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#ecg)" opacity="${k}"/>${[...Array(30)].map((_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 311) % H}" r="${1.5 + (i % 3)}" fill="#ff9ad0" opacity="${(0.25 + 0.3 * Math.sin(t * 2 + i)) * k}"/>`).join('')}<text x="540" y="${690 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ HACEMOS</text><text x="540" y="${776 - 24 * (1 - ease(k))}" font-family="Anton" font-size="74" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">MAÑANA?</text>`;
  const a = pop(t, T.optA, 0.35), b = pop(t, T.optB, 0.35);
  if (a > 0) s += `<g transform="translate(540,960) scale(${a})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON['UNAS12']}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('A · ARREGLAR LAS UÑAS', 620, 58)}" text-anchor="middle" fill="${OUT}">A · ARREGLAR LAS UÑAS</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1136) scale(${b})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><g transform="translate(-320,-5)"><circle r="62" fill="#fff" stroke="${OUT}" stroke-width="6"/><g transform="scale(1.25)">${ICON['ZAPATO13']}</g></g><text x="82" y="24" font-family="Anton" font-size="${fitFs('B · ARREGLAR LOS ZAPATOS', 620, 58)}" text-anchor="middle" fill="#fff">B · ARREGLAR LOS ZAPATOS</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1400) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1510) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 14</text></g>`;
  return s;
}
// transiciones de camara: giro 360 con zoom (roll) y barrido, centradas en los cambios de escena
const TRANS = [[3.55, 'in', 0.8], [T.clinicA, 'cut', 0.6], [T.hackA, 'cut', 0.3]];
function transitionAt(t) { for (const [t0, kind, d] of TRANS) { const a = t0 - (kind === 'cut' ? d / 2 : 0), p = (t - a) / d; if (p < 0 || p > 1) continue;
    if (kind === 'in') { const e = ease(p); return { on: true, ghost: p < 0.85, sc: 1.4 - 0.4 * e, v: (1 - e), fl: 0.35 * Math.max(0, 1 - p * 3), gx: 0 }; }
    const e = smooth(p), mid = 1 - Math.abs(e - 0.5) * 2; const sc = e < 0.5 ? 1 + e * 2 * 0.45 : 1.45 - (e * 2 - 1) * 0.45; return { on: true, ghost: true, sc, v: mid, fl: 0.5 * mid * mid, gx: (e < 0.5 ? 1 : -1) * mid * 40 }; } return { on: false }; }
// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t); CURPLATE = platePng[sc];
  const W2 = (id, word) => w(id, word);
  const mkLazy = (newNose) => { const P2 = defPose2(); const e = P2.eyes; e.blinkL = P.blink.l; e.blinkR = P.blink.r; e.lookX = P.gaze.x; e.lookY = P.gaze.y; e.wide = Math.max(0, (P.lid.l - 1) * 2); e.squint = P.squint || 0;
    P2.brows.Lraise = P.brow.l.r; P2.brows.Rraise = P.brow.r.r; P2.brows.Lfrown = -P.brow.l.i; P2.brows.Rfrown = -P.brow.r.i; P2.mouth.open = Math.min(0.35, P.mouth.open); P2.mouth.wide = P.mouth.wide; P2.mouth.smile = P.mouth.smile; P2.mouth.upperTeeth = P.mouth.open > 0.2 ? 1 : 0.2;
    P2.head.yaw = P.yaw || 0; P2.head.rot = (P.roll || 0) * 0.6; P2.chest.breath = P.breath || 0; P2.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1, sway: P.hair.sway }; P2.hair.t = t; P2.hair.swayL = (P.hair.sway || 0) * 6; P2.hair.swayR = (P.hair.sway || 0) * 6; P2.skirt.t = t; P2.skirt.hem = 0.5; P2.skirt.swayL = 5 * Math.sin(t * 1.3); P2.skirt.swayR = 5 * Math.sin(t * 1.3 + 1);
    if (newNose) { P2.noseStyle = 'D'; P2.noseK = 1.35; }
    const arm = (tx, ty, k) => { const kL = ik2(SK2.shoulderL, SK2.elbowL, SK2.wristL, [512 - tx, ty], -1), kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [512 + tx, ty], 1); P2.armL.r1 = kL.r1 * k; P2.armL.r2 = kL.r2 * k; P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; };
    const kHack = clamp((t - T.hackA) / 0.4) * (1 - clamp((t - T.alertA - 1.2) / 0.5)); if (kHack > 0) { arm(160, 255 + Math.sin(t * 17) * 5, kHack); P2.handL.curl = P2.handR.curl = [0.8, 0.8, 0.8, 0.8, 0.8]; }
    const kRev = clamp((t - T.revealA - 0.4) / 0.5) * (1 - clamp((t - T.msg2A + 0.1) / 0.4)); if (kRev > 0) { arm(150, 330, kRev); P2.handL.spread = P2.handR.spread = 0.4; }
    if (t > W2('l16', 'sigueme') - 0.3) { const k = clamp((t - W2('l16', 'sigueme') + 0.3) / 0.3); const kR = ik2(SK2.shoulderR, SK2.elbowR, SK2.wristR, [800, 330], 1); P2.armR.r1 = kR.r1 * k; P2.armR.r2 = kR.r2 * k; P2.handR.spread = 1.2; P2.armL.r1 = 0; P2.armL.r2 = 0; }
    return renderCharacter(P2); };
  const sK = seatedK(t), drop = SIT_DROP * sK; const hy = 788 + drop; const seated = sK > 0.01; const nz = noseW(t);
  const chairBack = seated ? `<g opacity="${sK.toFixed(2)}"><ellipse cx="540" cy="1722" rx="250" ry="34" fill="#000" opacity="0.3"/><rect x="${540 - 150}" y="${hy - 10}" width="300" height="${1480 - hy}" rx="70" fill="#e7f1f5" stroke="${OUT}" stroke-width="8"/><rect x="${540 - 118}" y="${hy - 30}" width="236" height="150" rx="60" fill="#f7fbfd" stroke="${OUT}" stroke-width="7"/><path d="M${540 - 150},${hy + 60} L${540 - 150},1440 M${540 + 150},${hy + 60} L${540 + 150},1440" stroke="#22c6d8" stroke-width="7" opacity="0.9"/></g>` : '';
  const gownSvg = seated ? `<g opacity="${sK.toFixed(2)}"><defs><linearGradient id="cpG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfd6df"/><stop offset="0.45" stop-color="#f6fbfd"/><stop offset="1" stop-color="#b2cbd6"/></linearGradient></defs><path d="M${540 - 62},${hy + 142} C${540 - 120},${hy + 150} ${540 - 250},${hy + 190} ${540 - 264},${hy + 330} C${540 - 280},${hy + 480} ${540 - 262},${hy + 600} ${540 - 270},1570 Q540,1620 ${540 + 270},1570 C${540 + 262},${hy + 600} ${540 + 280},${hy + 480} ${540 + 264},${hy + 330} C${540 + 250},${hy + 190} ${540 + 120},${hy + 150} ${540 + 62},${hy + 142} Q540,${hy + 190} ${540 - 62},${hy + 142}Z" fill="url(#cpG)" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><path d="M${540 - 62},${hy + 142} Q540,${hy + 192} ${540 + 62},${hy + 142}" stroke="#22c6d8" stroke-width="8" fill="none"/><path d="M${540 - 130},${hy + 220} C${540 - 160},${hy + 420} ${540 - 170},${hy + 620} ${540 - 190},1560 M${540 + 130},${hy + 220} C${540 + 160},${hy + 420} ${540 + 170},${hy + 620} ${540 + 190},1560 M540,${hy + 190} L540,1600" stroke="#6a8a98" stroke-opacity="0.45" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="540" cy="${hy + 150}" r="12" fill="#22c6d8" stroke="${OUT}" stroke-width="3"/></g>` : '';
  const chairFront = seated ? `<g opacity="${sK.toFixed(2)}"><rect x="${540 - 300}" y="${1250 + drop * 0.3}" width="64" height="190" rx="26" fill="#dfe9ee" stroke="${OUT}" stroke-width="8"/><rect x="${540 + 236}" y="${1250 + drop * 0.3}" width="64" height="190" rx="26" fill="#dfe9ee" stroke="${OUT}" stroke-width="8"/><path d="M${540 - 280},1280 v50 M${540 + 280},1280 v50" stroke="#22c6d8" stroke-width="6"/><rect x="${540 - 26}" y="1590" width="52" height="100" fill="#cfd9df" stroke="${OUT}" stroke-width="6"/><ellipse cx="540" cy="1700" rx="230" ry="30" fill="#cfd9df" stroke="${OUT}" stroke-width="7"/><rect x="${540 - 210}" y="1540" width="420" height="56" rx="28" fill="#eef5f8" stroke="${OUT}" stroke-width="8"/></g>` : '';
  const tf = `translate(${540 - 512 * NEWS},${1655 - 1500 * NEWS + drop}) scale(${NEWS})`;
  const nR = clamp((t - T.sculptA - 0.5) / 3.6) * 60; const flipNew = t >= T.revealA - 0.1;
  const lazyBody = () => { const sh = seated ? '' : `<ellipse cx="540" cy="1650" rx="${380 * NEWS}" ry="26" fill="#000" opacity="0.35"/>`; const clipS = seated ? `<clipPath id="seatClip"><rect x="0" y="0" width="${W}" height="1580"/></clipPath>` : '';
    let fig; if (flipNew) fig = `<g transform="${tf}">${mkLazy(true)}</g>`; else if (nR > 1) fig = `<g transform="${tf}">${mkLazy(false)}</g><clipPath id="noseC"><circle cx="${nz.x}" cy="${nz.y}" r="${nR.toFixed(0)}"/></clipPath><g clip-path="url(#noseC)"><g transform="${tf}">${mkLazy(true)}</g></g><circle cx="${nz.x}" cy="${nz.y}" r="${nR.toFixed(0)}" fill="none" stroke="#ffd9a0" stroke-width="4"/>`; else fig = `<g transform="${tf}">${mkLazy(false)}</g>`;
    return `${sh}${clipS}${chairBack}<g ${seated ? 'clip-path="url(#seatClip)"' : ''}>${fig}</g>${gownSvg}${chairFront}`; };
  const lazy = lazyBody();
  const sm = (h, tt) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(h(Math.max(0, tt - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const ms = monState(t), ns = nurState(t);
  const char = (st, fn, look, seed, stateFn, who) => { if (!st) return { body: '', tool: '' }; const { ch } = st; const hs = (tt) => { const q = stateFn(tt); return q ? q.hands : 'none'; }; const nsm = sm(hs, t);
    const base = { ...st, elbowDown: true, armL: nsm.L, armR: nsm.R, blink: blinkOf(t, seed), look, t, mouthOpen: MOUTHW(who, t) };
    const shd = `<ellipse cx="${ch.x + 30 * ch.s}" cy="${ch.y + 712 * ch.s}" rx="${150 * ch.s}" ry="${22 * ch.s}" fill="#000" opacity="0.28" filter="url(#b10)"/>`;
    return { body: `${shd}<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'body' })}</g>`, tool: `<g transform="translate(${ch.x},${ch.y}) scale(${ch.s})">${fn({ ...base, part: 'tool' })}</g>` }; };
  const mon = char(ms, drawMontes, 0.7, 0.6, monState, 'Q'), nur = char(ns, drawNuria, -0.6, 2.1, nurState, 'U');
  const par = (f) => `translate(540,960) scale(${1 + (cam.z - 1) * f}) translate(${-(540 + (cam.x - 540) * f)},${-(960 + (cam.y - 960) * f)})`;
  const bgLayer = `<g transform="${par(0.85)}"><image href="${platePng[sc]}" width="${W}" height="${H}" preserveAspectRatio="none"/></g>`;
  const inClinic = sc === 'clinic';
  const worldInner = `${bgLayer}<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})">${inClinic ? mon.body : ''}${inClinic ? nur.body : ''}${lazy}${inClinic ? mon.tool : ''}${inClinic ? nur.tool : ''}${procFx(t)}${revealFx(t)}${holoPanel(t)}</g>`;
  const tr = transitionAt(t); const wrapW = (scl, dx, op) => `<g opacity="${op}" transform="translate(${540 + dx},960) scale(${scl}) translate(-540,-960)">${worldInner}</g>`;
  const glitch = (g) => g > 2 ? [0, 1, 2, 3].map((i) => `<rect x="0" y="${300 + i * 380 + Math.sin(t * 40 + i) * 40}" width="${W}" height="${50 + i * 14}" fill="#fff" opacity="${0.1 * Math.min(1, g / 20)}" transform="translate(${Math.sin(t * 77 + i) * g * 0.8},0)"/>`).join('') : '';
  const world0 = tr.on ? (tr.ghost ? wrapW(tr.sc * 1.05, tr.gx * 1.4, 0.4) + wrapW(tr.sc * 1.025, tr.gx * 0.7, 0.55) : '') + wrapW(tr.sc, 0, 1) + glitch(Math.abs(tr.gx)) + `<rect width="${W}" height="${H}" fill="#fff" opacity="${tr.fl}"/>` : worldInner;
  const hackK = clamp((t - T.hackA) / 0.2) * (1 - clamp((t - T.alertA - 3.0) / 0.5)); const redTint = hackK > 0.01 ? `<rect width="${W}" height="${H}" fill="#ff1a3a" opacity="${(0.12 * hackK + 0.06 * hackK * Math.sin(t * 22)).toFixed(3)}"/>${[0, 1, 2].map((i) => `<rect x="0" y="${((t * 700 + i * 640) % 1920).toFixed(0)}" width="${W}" height="14" fill="#fff" opacity="${(0.1 * hackK).toFixed(2)}"/>`).join('')}` : '';
  const blueK = (t > T.coldA + 1.5 && t < T.coldB + 1.5) ? 0.08 : 0; const lampTint = blueK ? `<rect width="${W}" height="${H}" fill="#4fd8ff" opacity="${blueK}"/>` : '';
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05202a" stop-opacity="0.35"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const bnOn = stepBanners.some(([n, tx, a, b]) => t > a - 0.1 && t < b + 0.1); const chipTop = (t < 4.5 || bnOn) ? '' : `<g transform="translate(540,300)"><defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.5" stop-color="#ffd84a"/><stop offset="1" stop-color="#b8780f"/></linearGradient></defs><rect x="-226" y="-40" width="440" height="88" rx="44" fill="#000" opacity="0.3"/><rect x="-230" y="-46" width="440" height="88" rx="44" fill="#1a1024" stroke="#d4a24c" stroke-width="6"/><text x="0" y="18" font-family="Bungee" font-size="48" text-anchor="middle" letter-spacing="3" fill="url(#chg)" stroke="${OUT}" stroke-width="4" paint-order="stroke">DÍA 13/30</text></g>`;
  const flashR = Math.max(0, 1 - Math.abs(t - T.revealA) / 0.2) * 0.6;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}${ALLDEFS}${MDEFS}<defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world0}${hackScreen(t)}${redTint}${lampTint}${vignette}${slateIntro(t)}
    ${chipTop}${insScan(t)}${insHolo(t)}${insTube(t)}${insSyr(t)}${insCold(t)}${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}${marChat(t, T.msgA, ['Hoy te acompaño, pero llego tarde.', 'Empieza sin mí. Te quiero ♥'], 0)}${marChat(t, T.msg2A, ['Hoy te acompaño, pero llego tarde.', 'Qué linda te ves, amiga.', 'Mañana te alcanzo.'], 1)}
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
