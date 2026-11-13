// Lazy Dawns - Dia 6: "Ropa de gala" (fondos 3D: limusina, boutique, pasarela; Dante y Pia). Voces: narrador, Mari, Vero (estilista), Memo (ayudante). Los personajes NO mueven la boca para hablar.
// Formato 1080x1920, mismo encuadre y tamanos que los dias 1-3.
// Uso: node render_dia04.mjs preview 5 12 ...   |   node render_dia04.mjs <inicio> <fin> <salida.mp4>   |   node render_dia04.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawDante, drawPia, handsToTargets } from './chars.mjs';
import { makeDirector } from './director6.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia06');
const W = 1080, H = 1920, FPS = 30;
const SAFE = { cy: 960 }; // centro de pantalla (mismo encuadre que los dias anteriores)
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

// ---------------- guion con tiempos ----------------
const DATA = JSON.parse(readFileSync(path.join(B, 'lines.json'), 'utf8'));
const L = Object.fromEntries(DATA.lines.map((l) => [l.id, l]));
const DUR = DATA.total;
const w = (id, word, n = 0) => { const r = L[id].words.filter((x) => nm(x[0]) === nm(word))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + word); return r[1]; };
const T = {
  slateEnd: 1.4, limoOut: 3.2, sceneB: L.l3.start - 0.35,
  measureA: L.l5.start + 0.4, measureB: L.l5.end + 0.2, neonA: w('l7', 'neon') - 0.1, neonB: L.l8.end + 0.15,
  sewA: w('l9', 'cortar') - 0.4, sewB: w('l9', 'ajustar') + 0.6, jewelA: w('l10', 'aretes'), heelsA: w('l10', 'tacones'),
  curtainA: w('l11', 'cortina') - 0.5, curtainOpen: w('l11', 'aliento') - 0.4, runA: L.l12.end + 0.1, runWalkA: L.l12.end + 0.6, runWalkB: L.l13.end + 0.5,
  endPose: L.l13.end + 0.6, hookA: w('l14', 'falta') - 0.3,
  vote: w('l15', 'Que') - 0.1, optA: w('l15', 'maquillaje'), optB: w('l15', 'rizos'), cta1: w('l15', 'Comenta'), cta2: w('l15', 'sigueme'),
};
T.walks = [[T.limoOut, T.sceneB - 0.1], [T.runWalkA, T.runWalkB]];
T.scenes = [T.slateEnd, T.limoOut, T.sceneB, T.measureA, T.neonA, T.neonB, T.sewA, T.curtainA, T.curtainOpen, T.runA, T.hookA, T.vote];
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });

// ---------------- FONDO: Salon Rapunzel ----------------
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates3d', n + '.png')));
const platePng = { limo: PL('limo'), boutique: PL('boutique'), runway: PL('runway') };

// ---------------- escenas, personajes y camara ----------------
const sceneAt = (t) => (t < T.sceneB ? 'limo' : t < T.runA ? 'boutique' : 'runway');
const sceneU = (t) => { const sc = sceneAt(t); const a = sc === 'limo' ? 0 : sc === 'boutique' ? T.sceneB : T.runA, b = sc === 'limo' ? T.sceneB : sc === 'boutique' ? T.runA : DUR; return clamp((t - a) / Math.max(1e-3, b - a)); };
const BASE_S = 0.62;
function lazyPlace(t) { // posicion (x), pies (fy) y escala segun escena (perspectiva)
  const sc = sceneAt(t);
  if (sc === 'limo') { const u = clamp((t - T.limoOut) / (T.sceneB - 0.1 - T.limoOut)); return { x: lerp(330, 720, ease(u)), fy: 1560, S: 0.62, vis: t >= T.limoOut - 0.3 }; }
  if (sc === 'boutique') return { x: 540, fy: 1330, S: 0.62, vis: true };
  const u = clamp((t - T.runWalkA) / (T.runWalkB - T.runWalkA)), e = u * u * (3 - 2 * u); const fy = lerp(1070, 1730, e);
  return { x: 540 + Math.sin(u * 6) * 8 * (1 - u), fy, S: 0.14 + 0.6 * ((fy - 1040) / 690), vis: true };
}
const lazyHeadWorld = (t) => { const p = lazyPlace(t); const py = p.fy - 790 * p.S; return { x: p.x, y: py - 215 * p.S, S: p.S, py }; };
function toolPose(ch, tipX, tipY, len, theta) { const r = theta * Math.PI / 180, wl = len * ch.s, ox = tipX - wl * -Math.sin(r), oy = tipY - wl * Math.cos(r); return { toolX: (ox - ch.x) / ch.s, toolY: (oy - ch.y) / ch.s, toolR: theta, toolS: 1 }; }
const lz = (t, lx, ly) => { const p = lazyPlace(t); const py = p.fy - 790 * p.S; return { x: p.x + lx * p.S, y: py + ly * p.S }; }; // punto del cuerpo de Lazy (coordenadas locales de drawLazy)
const DANTE_B = { x: 880, y: 800, s: 0.74 }, DANTE_R = { x: 150, y: 1010, s: 0.66 }, PIA = { x: 1010, y: 820, s: 0.7 };
const danteCh = (t) => (sceneAt(t) === 'runway' ? DANTE_R : DANTE_B);
function danteState(t) {
  if (sceneAt(t) === 'limo') return null; const ch = danteCh(t); let mood = 'happy', tool = 'none', o = {}, hands = 'none';
  const at = (len, th, lx, ly) => { const p = lz(t, lx, ly); return toolPose(ch, p.x, p.y, len, th); };
  if (t >= L.l3.start) mood = 'happy';
  if (t >= L.l4.start) { mood = 'focus'; hands = 'none'; }
  if (t >= T.measureA && t < T.measureB) { tool = 'tape'; mood = 'focus'; const k = clamp((t - T.measureA) / (T.measureB - T.measureA)); o = at(40, 96, -90 + k * 20, lerp(0, 430, k)); }
  if (t >= T.measureB) { tool = 'none'; mood = 'proud'; }
  if (t >= T.neonA && t < T.neonB) { mood = 'shock'; }
  if (t >= L.l8.start && t < T.neonB) { mood = 'scream'; }
  if (t >= T.neonB) mood = 'serious';
  if (t >= L.l9.start && t < w('l9', 'cortar') - 0.2) { tool = 'fabric'; mood = 'proud'; o = { toolX: -170, toolY: 40, toolR: 0, toolS: 1 }; }
  if (t >= w('l9', 'cortar') - 0.2 && t < w('l9', 'coser')) { tool = 'scissors'; mood = 'focus'; o = at(236, 96, -40 + Math.sin(t * 6) * 120, 620); }
  if (t >= w('l9', 'coser') && t < T.sewB) { tool = 'needleT'; mood = 'focus'; const k = clamp((t - T.sewA) / (T.sewB - T.sewA)); o = at(150, 96, -200 + Math.sin(t * 5) * 130, lerp(120, 700, k)); }
  if (t >= T.sewB) { tool = 'none'; mood = 'proud'; }
  if (t >= T.curtainOpen) mood = 'grin';
  if (sceneAt(t) === 'runway') { mood = t >= T.hookA ? 'amused' : 'grin'; tool = 'none'; }
  hands = (mood === 'scream' || mood === 'shock') && tool === 'none' ? 'cheeks' : (mood === 'proud' || mood === 'grin' || mood === 'amused') ? 'clasp' : 'none';
  return { mood, tool, hands, ...o };
}
function piaState(t) {
  const x0 = T.neonA - 1.1, x1 = L.l8.end + 0.3; if (t < x0 || t > x1 + 0.9 || sceneAt(t) !== 'boutique') return null;
  const x = t < T.neonA ? lerp(1250, PIA.x, ease((t - x0) / 1.0)) : t < x1 ? PIA.x : lerp(PIA.x, 1250, ease((t - x1) / 0.9));
  const hang = t < T.neonB; return { x, mood: t < L.l8.start ? 'happy' : 'worry', tool: hang ? 'hanger' : 'none', toolX: -160, toolY: 40, toolR: 0, toolS: 1, hands: 'none' };
}
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
function camAt(t) { // encuadre 9:16 completo, sin recortar nada importante; empuje suave de camara (dolly) y temblor en flashes
  const sc = sceneAt(t), u = sceneU(t); const z = sc === 'limo' ? 1.0 + 0.06 * u : sc === 'boutique' ? 1.0 + 0.07 * ease(u) : 1.0 + 0.1 * ease(u);
  const flash = win(t, T.neonA, T.neonA + 0.5, 0.02, 0.3) * 6 + win(t, T.neonB, T.neonB + 0.4, 0.02, 0.3) * 5 + win(t, T.curtainOpen, T.curtainOpen + 0.6, 0.02, 0.4) * 5 + win(t, T.hookA, T.hookA + 0.4, 0.02, 0.3) * 4;
  const pan = sc === 'limo' ? (u - 0.5) * 36 : sc === 'runway' ? 0 : Math.sin(u * 3) * 10;
  return { z: z + flash * 0.002, x: 540 + pan + Math.sin(t * 61) * flash * 0.5, y: 960 + Math.cos(t * 53) * flash * 0.5 };
}
const worldT = (cam) => `translate(540,${SAFE.cy}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`;

// ---------------- efectos ----------------
function tapeFx(t) { const a = win(t, T.measureA, T.measureB + 0.4, 0.25, 0.4); if (a <= 0) return ''; const k = clamp((t - T.measureA) / (T.measureB - T.measureA)); const p0 = lazyPlace(t);
  const lines = [[-60, 330], [150, 350], [420, 346], [520, 352]];
  return `<g opacity="${a}">${lines.map(([ly, hw], i) => { const q = clamp(k * 4.2 - i * 0.8); if (q <= 0) return ''; const c = lz(t, 0, ly); const w = hw * p0.S * 2 * q;
    return `<g><rect x="${c.x - hw * p0.S}" y="${c.y - 9}" width="${w}" height="18" rx="4" fill="#fde047" stroke="${OUT}" stroke-width="3"/>${[...Array(18)].map((_, j) => `<line x1="${c.x - hw * p0.S + j * w / 17}" y1="${c.y - 9}" x2="${c.x - hw * p0.S + j * w / 17}" y2="${c.y - 2 - (j % 2) * 5}" stroke="${OUT}" stroke-width="2"/>`).join('')}${q >= 1 ? `<circle cx="${c.x + hw * p0.S}" cy="${c.y}" r="14" fill="#22c55e" stroke="${OUT}" stroke-width="3"/><path d="M${c.x + hw * p0.S - 6},${c.y} l4,5 l8,-10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` : ''}</g>`; }).join('')}</g>`; }
function neonFlash(t) { const fl = (t0) => { const d = t - t0; return d >= 0 && d < 0.3 ? 0.9 * (1 - d / 0.3) : 0; }; const f = Math.max(fl(T.neonA), fl(T.neonB)); const pk = t >= T.neonA && t < T.neonA + 1.1 ? `<g transform="translate(540,640) scale(${pop(t, T.neonA, 0.25)})"><text x="0" y="0" font-family="Anton" font-size="150" text-anchor="middle" fill="#ff2bd6" stroke="${OUT}" stroke-width="14" paint-order="stroke">¡¿...?!</text></g>` : '';
  return `${f > 0 ? `<rect width="${W}" height="${H}" fill="#fff" opacity="${f}"/>` : ''}${pk}`; }
function curtainFx(t) { const a = T.curtainA, o = T.curtainOpen; if (t < a - 0.05 || t > o + 1.3) return '';
  const close = ease((t - a) / 0.45), open = ease((t - o) / 0.9), cv = t < o ? close : 1 - open; if (cv <= 0.01) return '';
  const panel = (side) => { const wd = 560 * cv; const x = side < 0 ? 0 : W - wd; return `<g><rect x="${x}" y="0" width="${wd}" height="${H}" fill="url(#velvet)" stroke="${OUT}" stroke-width="6"/>${[...Array(8)].map((_, i) => `<path d="M${x + (i + 0.5) * wd / 8},0 Q${x + (i + 0.5) * wd / 8 + 14},${H / 2} ${x + (i + 0.5) * wd / 8},${H}" stroke="#450a0a" stroke-width="10" fill="none" opacity="0.7"/>`).join('')}<rect x="${x}" y="0" width="${wd}" height="260" fill="url(#velvet)" opacity="0.0"/></g>`; };
  return `<defs><linearGradient id="velvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#450a0a"/><stop offset="0.5" stop-color="#b91c1c"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient></defs>${panel(-1)}${panel(1)}<rect y="0" width="${W}" height="150" fill="#ffd47a" opacity="0.0"/>`; }
function revealFx(t) { const a = win(t, T.curtainOpen + 0.4, T.curtainOpen + 2.6, 0.2, 0.6); if (a <= 0) return ''; const h = lazyHeadWorld(t);
  return `<g opacity="${a}"><circle cx="${h.x}" cy="${h.y + 300 * h.S / 0.62}" r="${380 * pop(t, T.curtainOpen + 0.4, 0.6)}" fill="url(#revGlow)" opacity="0.5"/><defs><radialGradient id="revGlow"><stop offset="0" stop-color="#fff4c2" stop-opacity="0.9"/><stop offset="1" stop-color="#fff4c2" stop-opacity="0"/></radialGradient></defs>${[...Array(12)].map((_, i) => { const ang = i * 0.52 + t * 0.6, d = 260 + (i % 4) * 40; return `<g transform="translate(${h.x + Math.cos(ang) * d},${h.y + 380 + Math.sin(ang) * d * 1.3}) scale(${(0.6 + 0.4 * Math.sin(t * 9 + i)) * pop(t, T.curtainOpen + 0.4 + i * 0.05, 0.3)}) rotate(${t * 60})"><path d="M0,-24 Q5,-5 24,0 Q5,5 0,24 Q-5,5 -24,0 Q-5,-5 0,-24Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`; }).join('')}</g>`; }
function flashesFx(t) { if (sceneAt(t) === 'boutique') return ''; const sc = sceneAt(t); let s = ''; const n = sc === 'runway' ? 16 : 6;
  for (let i = 0; i < n; i++) { const per = 0.9 + (i * 0.137) % 0.9, ph = (t + i * 0.43) % per; if (ph > 0.12) continue; const k = 1 - ph / 0.12; const x = sc === 'runway' ? (i % 2 ? 120 + (i * 73) % 220 : 760 + (i * 91) % 240) : 700 + (i * 111) % 330; const y = sc === 'runway' ? 760 + (i * 53) % 260 : 1300 + (i * 67) % 160;
    s += `<g transform="translate(${x},${y})" opacity="${k}"><circle r="${60 + 30 * k}" fill="url(#fl)"/>${[0, 1, 2, 3].map((j) => `<line x1="0" y1="0" x2="${Math.cos(j * 0.785) * 90}" y2="${Math.sin(j * 0.785) * 90}" stroke="#fff" stroke-width="4" opacity="0.8"/>`).join('')}</g>`; }
  return `<defs><radialGradient id="fl"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>${s}`; }
function spotFx(t) { if (sceneAt(t) !== 'runway') return ''; const p = lazyPlace(t); return `<g opacity="0.55"><defs><radialGradient id="spG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff4d6" stop-opacity="0.8"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></radialGradient></defs><ellipse cx="${p.x}" cy="${p.fy + 6}" rx="${300 * p.S / 0.6}" ry="${70 * p.S / 0.6}" fill="url(#spG)"/></g>`; }
function hookFx(t) { const a = win(t, T.hookA, T.vote + 0.1, 0.25, 0.4); if (a <= 0) return ''; const h = lazyHeadWorld(t); const s = h.S / 0.62, pl = 0.5 + 0.5 * Math.sin(t * 7);
  const c = 190 * s, p = (cx, cy, sx, sy) => `<path d="M${cx},${cy} h${sx * 56} M${cx},${cy} v${sy * 56}" stroke="#fde047" stroke-width="9" stroke-linecap="round"/>`;
  return `<g opacity="${a}">${p(h.x - c, h.y - c * 1.1, 1, 1)}${p(h.x + c, h.y - c * 1.1, -1, 1)}${p(h.x - c, h.y + c * 1.1, 1, -1)}${p(h.x + c, h.y + c * 1.1, -1, -1)}<g transform="translate(${h.x + 250 * s},${h.y - 150 * s}) scale(${pop(t, T.hookA, 0.35) * (1 + 0.06 * pl)})"><circle r="70" fill="#fff" stroke="${OUT}" stroke-width="8"/><text x="0" y="36" font-family="Anton" font-size="104" text-anchor="middle" fill="#ef4444">?</text></g></g>`; }
function sceneTitle(t) { const items = [['NOCHE EN LA CIUDAD', 0.4, 3.0], ['MAISON DAWNS · BOUTIQUE', T.sceneB, T.sceneB + 2.6], ['LA PASARELA', T.runA, T.runA + 2.4]]; return items.map(([txt, a, b]) => { const k = win(t, a, b, 0.4, 0.5); if (k <= 0) return ''; return `<g opacity="${k}" transform="translate(540,${1560 - 12 * (1 - k)})"><text x="0" y="0" font-family="Anton" font-size="46" text-anchor="middle" fill="#ffe6a8" stroke="${OUT}" stroke-width="9" paint-order="stroke" letter-spacing="8">${txt}</text></g>`; }).join(''); }

// ---------------- UI (zona segura) ----------------
const stepBanners = [['1', 'MEDIDAS', T.measureA - 0.1, T.markA + 1.0, '#fde68a'], ['2', 'CERA', T.waxA, T.ripA + 1.4, '#fbbf24'], ['3', 'PINZA', T.tweezA - 0.1, T.tweezB + 0.2, '#c4b5fd'], ['4', 'DISEÑO', T.designA - 0.1, T.designB, '#86efac'], ['5', 'RETOQUE', T.fixA, T.gelA + 1.8, '#fda4af']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="34" y="20" font-family="Anton" font-size="${text.length > 9 ? 56 : 66}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const SPEAK = { N: { col: '#ffe14d', name: null }, B: { col: '#5eead4', name: 'KARLA' } };
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
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">ESCENA</text><text x="-310" y="52" font-family="Anton" font-size="52" fill="#5eead4">CEJAS DE MODELO</text>
    <text x="-310" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">DÍA</text><text x="-310" y="172" font-family="Anton" font-size="58" fill="#ff4d8d">5 / 30</text><text x="60" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">TOMA</text><text x="60" y="172" font-family="Anton" font-size="58" fill="#fff">1</text>
    ${clap >= 1 && t < 1.15 ? `<text x="0" y="-300" font-family="Anton" font-size="110" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡CLAC!</text>` : ''}</g></g>`;
}
function mirrorOverlay(t) { const a = win(t, T.mirrorStart + 0.2, T.mirrorEnd, 0.3, 0.4); if (a <= 0) return '';
  const g = ((t - T.mirrorStart) * 0.9) % 2;
  return `<g opacity="${a}"><path d="M0,0 H${W} V${H} H0Z M540,890 m-440,0 a440,640 0 1,0 880,0 a440,640 0 1,0 -880,0Z" fill="#0b0b10" fill-rule="evenodd" opacity="0.9"/><ellipse cx="540" cy="890" rx="440" ry="640" fill="none" stroke="#e8c27a" stroke-width="22"/><ellipse cx="540" cy="890" rx="418" ry="618" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/>
    <g opacity="0.55" transform="translate(${-400 + g * 800},0)"><path d="M300,300 L420,300 L240,1260 L120,1260Z" fill="#fff" opacity="0.18"/></g></g>`; }
function endCard(t) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  const a = pop(t, T.optA), b = pop(t, T.optB);
  let s = `<rect width="${W}" height="${H}" fill="#12090a" opacity="${0.55 * k}"/><text x="540" y="${1040 - 30 * (1 - ease(k))}" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ ARREGLAMOS MAÑANA?</text>`;
  if (a > 0) s += `<g transform="translate(540,1170) scale(${a})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><text x="0" y="26" font-family="Anton" font-size="64" text-anchor="middle" fill="${OUT}">A · MAQUILLAJE</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1310) scale(${b})"><rect x="-416" y="-62" width="840" height="130" rx="40" fill="#000" opacity="0.35"/><rect x="-420" y="-70" width="840" height="130" rx="40" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-60" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><text x="0" y="26" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff">B · ROPA</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1448) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1550) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 6</text></g>`;
  return s;
}
function sparklesAll(t) { const a = win(t, T.reveal, T.mirrorEnd, 0.3, 0.5); if (a <= 0) return ''; const hh = lazyHeadWorld(t);
  return [[-230, 40, 28], [250, 120, 34], [-260, 300, 24], [270, 420, 30], [-220, 560, 26], [240, 640, 24], [0, -150, 30]].map(([x, y, r], i) => `<g transform="translate(${hh.x + x},${hh.y + y}) scale(${(0.7 + 0.3 * Math.sin(t * 8 + i)) * pop(t, T.reveal + i * 0.12, 0.3)}) rotate(${t * 40})" opacity="${a}"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join(''); }

// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), seated = t >= T.sit + 0.28;
  const ks = karlaState(t), cs = catState(t);
  const py = lazyFy(t) - 830 * LZ.S, lx = lazyX(t);
  const lazy = t >= T.doorA + 0.3 ? `<g transform="translate(${lx},${py}) scale(${LZ.S})">${drawLazy(P)}</g>` : '';
  const smH = (hands) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(hands(Math.max(0, t - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const ksm = smH((tt) => karlaState(tt).hands);
  const drawK = (part) => drawKarla({ ...ks, elbowDown: true, armL: ksm.L, armR: ksm.R, blink: blinkOf(t, 1.9), look: -0.7, t, part });
  const proBody = `<g transform="translate(${PRO.x},${PRO.y}) scale(${PRO.s})">${drawK('body')}</g>`;
  const proTool = `<g transform="translate(${PRO.x},${PRO.y}) scale(${PRO.s})">${drawK('tool')}</g>`;
  const table = tableSvg(false);
  const cat = `<g transform="translate(${cs.x},${cs.y}) scale(${CATP.s})">${drawCat({ t, blink: cs.mood === 'sleep' ? 0.9 : blinkOf(t, 0.7), mood: cs.mood === 'shock' ? 'shock' : 'ok', pose: cs.pose, rot: cs.rot, look: 0 })}</g>`;
  const icons = talkIcon(t, 'B', PRO.x - 100, PRO.y - 150 * PRO.s);
  const fx = zzzFx(t) + measureFx(t) + marksFx(t) + waxFx(t) + tweezFx(t) + moleFx(t) + heartsFx(t) + sparklesAll(t);
  const chairG = (g) => `<g transform="translate(540,1690) scale(${K}) translate(-540,-1660)">${g}</g>`;
  const world = `<g transform="${worldT(cam)}"><image href="${studioPng}" width="${W}" height="${H}"/>${doorSvg(t)}${chairG(chairBack(seated))}${proBody}${table}${lazy}${seated ? chairG(chairFront()) : ''}${cat}${proTool}${icons}${fx}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}
    <defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world}
    ${mirrorOverlay(t)}${beforeAfter(t, P)}
    <g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 5/30</text></g>
    ${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}
    ${t < T.vote ? captions(t) : ''}${endCard(t)}${slate(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
}
function beforeAfter(t, P) {
  const a0 = T.mirrorEnd - 3.2, a1 = T.mirrorEnd + 0.9, a = win(t, a0, a1, 0.35, 0.4); if (a <= 0) return '';
  const before = { ...P, browStyle: { k: 0, kl: 0, kr: 0, red: 0, shortL: 0 } };
  const card = (cx, label, pp, col) => `<g transform="translate(${cx},800) scale(${pop(t, a0, 0.4)})"><circle r="226" fill="#000" opacity="0.35" transform="translate(6,10)"/><clipPath id="ba${cx}"><circle r="212"/></clipPath><circle r="212" fill="#fde68a"/><g clip-path="url(#ba${cx})"><g transform="translate(0,170) scale(1.5) translate(0,215)">${drawLazy(pp)}</g></g><circle r="212" fill="none" stroke="#fff" stroke-width="12"/><circle r="218" fill="none" stroke="${OUT}" stroke-width="7"/><g transform="translate(0,268)"><rect x="-150" y="-44" width="300" height="88" rx="44" fill="${col}" stroke="${OUT}" stroke-width="7"/><text x="0" y="22" font-family="Anton" font-size="62" text-anchor="middle" fill="${OUT}">${label}</text></g></g>`;
  return `<g opacity="${a}"><rect width="${W}" height="${H}" fill="#0b0b10" opacity="0.88"/>${card(280, 'ANTES', before, '#e5e7eb')}${card(800, 'DESPUÉS', P, '#ffe14d')}<text x="540" y="1030" font-family="Anton" font-size="90" text-anchor="middle" fill="#5eead4" stroke="${OUT}" stroke-width="12" paint-order="stroke">→</text></g>`;
}
function tableSvg(clinic) {
  const top = clinic ? '#e2e8f0' : '#fbcfe8', body = clinic ? '#f8fafc' : '#f9a8d4', edge = clinic ? '#94a3b8' : '#be185d';
  const items = clinic ? `<rect x="800" y="1056" width="70" height="64" rx="10" fill="#38bdf8" stroke="${OUT}" stroke-width="5"/><rect x="900" y="1070" width="120" height="50" rx="10" fill="#e5e7eb" stroke="${OUT}" stroke-width="5"/><path d="M920,1070 q40,-34 80,0" stroke="${OUT}" stroke-width="5" fill="none"/>`
    : [['#ff4d8d', 70], ['#22d3ee', 90], ['#fbbf24', 60], ['#a78bfa', 80], ['#34d399', 66]].map(([c, h], i) => `<g transform="translate(${780 + i * 54},1120)"><rect x="-16" y="${-h}" width="32" height="${h}" rx="9" fill="${c}" stroke="${OUT}" stroke-width="4"/><rect x="-9" y="${-h - 12}" width="18" height="14" fill="#fff" stroke="${OUT}" stroke-width="3"/></g>`).join('') + `<ellipse cx="1000" cy="1100" rx="56" ry="20" fill="#fde68a" stroke="${OUT}" stroke-width="5"/>`;
  return `<g><rect x="700" y="1120" width="400" height="44" rx="12" fill="${top}" stroke="${OUT}" stroke-width="7"/><rect x="712" y="1164" width="376" height="260" fill="${body}" stroke="${OUT}" stroke-width="7"/><path d="M730,1200 h330 M730,1290 h330" stroke="${edge}" stroke-width="4" opacity="0.5"/><circle cx="900" cy="1250" r="10" fill="${edge}"/>${items}</g>`;
}
if (process.argv[2] === 'audit') {
  let n = 0, shrunk = 0, worst = 0;
  for (const l of DATA.lines) { const groups = []; let g = []; l.words.forEach(([ww]) => { g.push(ww); if (g.length === 3 || /[.?!:]$|\.\.\.$/.test(ww)) { groups.push(g); g = []; } }); if (g.length) groups.push(g);
    for (const gr of groups) { const txt = esc(gr.map((x) => x.replace(/\.\.\./g, '').toUpperCase()).join(' ')); let fs = 84, wd = inkWidth(txt, fs); if (wd > SAFE_W) { fs = Math.max(44, Math.floor(fs * SAFE_W / wd)); wd = inkWidth(txt, fs); shrunk++; console.log('ajustado', fs, txt); } n++; worst = Math.max(worst, wd); } }
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
