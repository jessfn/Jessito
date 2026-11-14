// Lazy Dawns - Dia 7: "Maquillaje de gala" (look C cobre, lunar se queda; camerino y pasillo 3D; tomas cinematograficas). Voces: narrador, Mari, Vero (estilista), Memo (ayudante). Los personajes NO mueven la boca para hablar.
// Formato 1080x1920, mismo encuadre y tamanos que los dias 1-3.
// Uso: node render_dia04.mjs preview 5 12 ...   |   node render_dia04.mjs <inicio> <fin> <salida.mp4>   |   node render_dia04.mjs audit
import { Resvg } from '@resvg/resvg-js';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defs } from './lazy_lib.mjs';
import { drawLazy } from './rig.mjs';
import { drawNina, handsToTargets, salonTool } from './chars.mjs';
import { makeDirector } from './director7.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, 'build/dia07');
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
  slateEnd: 1.4, limoOut: 2.6, sceneB: w('l2', 'maquillista') - 0.3, sitA: w('l3', 'Lazy') + 0.5, camA: w('l3', 'estelar') - 0.2,
  baseA: w('l4', 'base') - 0.1, contourA: w('l4', 'contorno') - 0.1, hiA: w('l4', 'iluminador') - 0.1,
  shadowA: w('l5', 'sombras') - 0.2, shadowB: L.l5.end - 0.1, linerA: w('l6', 'delineado') - 0.1, outA: w('l7', 'luz') - 0.15, outB: w('l11', 'Volvio') - 0.1,
  tapeA: w('l9', 'cinta') - 0.5, tapeB: w('l9', 'perfecta') + 0.5, lashA: w('l10', 'pestanas') - 0.1, lipA: w('l10', 'labial') - 0.1,
  mirrorA: w('l11', 'mire') - 0.25, reveal: w('l11', 'mire') - 0.2, mirrorB: L.l12.start - 0.2, clockA: L.l13.start + 0.1, knockA: w('l13', 'toco') - 0.15, noteA: w('l13', 'nota') - 0.3, noteB: L.l14.end + 0.3,
  vote: w('l15', 'Que') - 0.1, optA: w('l15', 'rizos'), optB: w('l15', 'lunar'), cta1: w('l15', 'Comenta'), cta2: w('l15', 'sigueme'),
};
T.walks = [[T.limoOut, T.sceneB - 0.2]];
T.scenes = [T.slateEnd, T.limoOut, T.sceneB, T.baseA, T.contourA, T.shadowA, T.linerA, T.outA, T.tapeA, T.lipA, T.mirrorA, T.clockA, T.knockA, T.noteA, T.vote];
writeFileSync(path.join(B, 'timeline.json'), JSON.stringify({ T, DUR }));
const pose = makeDirector({ L, T, DUR });

// ---------------- FONDOS 3D ----------------
const b64 = (buf) => 'data:image/png;base64,' + Buffer.from(buf).toString('base64');
const grainPng = b64(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.42"/></filter><rect width="${W}" height="${H}" filter="url(#g)" opacity="0.28"/></svg>`, ropt).render().asPng());
const charDefs = defs('e3d');
const PL = (n) => b64(readFileSync(path.join(here, 'plates3d', n + '.png')));
const platePng = { limo: PL('limo'), backstage: PL('backstage'), hall: PL('hall') };

const VIN = `<linearGradient id="vin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#be185d"/><stop offset="0.35" stop-color="#ec4899"/><stop offset="0.7" stop-color="#db2777"/><stop offset="1" stop-color="#831843"/></linearGradient><linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ca3af"/><stop offset="0.4" stop-color="#f3f4f6"/><stop offset="1" stop-color="#6b7280"/></linearGradient>`;
function chairBack(sat) {
  return `<defs>${VIN}</defs><ellipse cx="540" cy="1650" rx="330" ry="34" fill="#000" opacity="0.3"/>
  <rect x="496" y="1490" width="88" height="170" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/><ellipse cx="540" cy="1660" rx="210" ry="30" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/>
  <rect x="300" y="820" width="480" height="470" rx="120" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M336,870 Q336,846 400,846" stroke="#fff" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/>
  <rect x="236" y="1080" width="96" height="46" rx="22" fill="#831843" stroke="${OUT}" stroke-width="7"/><rect x="748" y="1080" width="96" height="46" rx="22" fill="#831843" stroke="${OUT}" stroke-width="7"/>
  ${sat ? '' : `<rect x="276" y="1200" width="528" height="110" rx="40" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/>`}`;
}
function chairFront() {
  return `<path d="M276,1246 Q540,1226 804,1246 L822,1470 Q540,1498 258,1470Z" fill="url(#vin)" stroke="${OUT}" stroke-width="8"/><path d="M316,1280 Q540,1264 764,1280" stroke="#fff" stroke-opacity="0.3" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="300" y="1470" width="480" height="36" rx="14" fill="url(#chrome)" stroke="${OUT}" stroke-width="7"/><path d="M282,1300 Q540,1324 798,1300" stroke="#000" stroke-opacity="0.18" stroke-width="10" fill="none"/>`;
}


// ---------------- escenas, personajes y camara ----------------
const sceneAt = (t) => (t < T.sceneB ? 'limo' : 'backstage');
const K = 0.68 / 0.62;
function lazyPlace(t) {
  if (t < T.sceneB) { const u = clamp((t - T.limoOut) / (T.sceneB - 0.2 - T.limoOut)); return { x: lerp(300, 650, ease(u)), fy: 1560, S: 0.62, vis: t >= T.limoOut - 0.3, seated: false }; }
  const k = smooth((t - T.sitA) / 0.5); return { x: lerp(300, 540, ease(clamp((t - T.sceneB) / (T.sitA - T.sceneB)))), fy: lerp(1560, 1355, k), S: lerp(0.62, 0.68, k), vis: true, seated: t >= T.sitA + 0.3 };
}
const headOf = (t) => { const p = lazyPlace(t); const py = p.fy - 790 * p.S; return { x: p.x, y: py - 215 * p.S, S: p.S }; };
const facePt = (t, lx, ly) => { const h = headOf(t); return { x: h.x + lx * h.S, y: h.y + ly * h.S }; };
function toolPose(ch, tipX, tipY, len, theta) { const r = theta * Math.PI / 180, wl = len * ch.s, ox = tipX - wl * -Math.sin(r), oy = tipY - wl * Math.cos(r); return { toolX: (ox - ch.x) / ch.s, toolY: (oy - ch.y) / ch.s, toolR: theta, toolS: 1 }; }
const NINA = { x: 930, y: 760, s: 0.78 };
function ninaState(t) {
  if (t < T.sceneB - 0.2) return null; let mood = 'happy', tool = 'none', o = {};
  const at = (len, th, lx, ly) => { const p = facePt(t, lx, ly); return toolPose(NINA, p.x, p.y, len, th); };
  if (t >= T.baseA && t < T.contourA - 0.1) { tool = 'sponge'; mood = 'focus'; o = at(180, 96, 60 + Math.sin(t * 5) * 60, 10 + Math.cos(t * 4) * 70); }
  if (t >= T.contourA - 0.1 && t < T.shadowA - 0.2) { tool = 'brushM'; mood = 'focus'; o = at(190, 100, 140 + Math.sin(t * 7) * 8, 30 + Math.sin(t * 5) * 30); }
  if (t >= T.shadowA - 0.2 && t < T.linerA - 0.1) { tool = 'brushM'; mood = 'focus'; o = at(190, 98, 76 + Math.sin(t * 6) * 18, -52); }
  if (t >= T.linerA - 0.1 && t < T.outA) { tool = 'wandL'; mood = 'focus'; o = at(206, 96, 100, -50); }
  if (t >= T.outA && t < T.outB) { mood = 'scream'; }
  if (t >= T.tapeA && t < T.tapeB) { tool = 'wandL'; mood = 'focus'; o = at(206, 96, 130 - Math.min(1, (t - T.tapeA) / 2) * 20, -52); }
  if (t >= T.tapeB && t < T.lashA) { tool = 'none'; mood = 'proud'; }
  if (t >= T.lashA && t < T.lipA - 0.2) { tool = 'wandL'; mood = 'focus'; o = at(206, 96, 74, -54 + Math.sin(t * 9) * 4); }
  if (t >= T.lipA - 0.2 && t < T.lipA + 2.2) { tool = 'gloss'; mood = 'focus'; o = at(190, 96, 20, 104); }
  if (t >= T.lipA + 2.2) { tool = 'none'; mood = 'proud'; }
  if (t >= T.mirrorA) mood = 'happy'; if (t >= L.l12.start) mood = 'grin'; if (t >= T.knockA) mood = 'worry'; if (t >= T.noteA) mood = 'shock';
  const hands = (mood === 'scream' || mood === 'shock') && tool === 'none' ? 'cheeks' : (mood === 'proud' || mood === 'grin') ? 'clasp' : 'none';
  return { mood, tool, hands, ...o };
}
const blinkOf = (t, seed) => { const m = (t + seed) % 3.4; return m < 0.14 ? Math.sin((m / 0.14) * Math.PI) : 0; };
// camara cinematografica: empujes (punch-in) sobre la cara en cada paso del maquillaje; el escenario siempre se ve completo en los planos generales
const CAM = [[0, 1.0, 540, 960], [T.slateEnd, 1.0, 540, 960], [T.sceneB, 1.0, 540, 960], [T.sitA, 1.04, 540, 900], [T.baseA, 1.12, 560, 720], [T.contourA, 1.16, 560, 740], [T.shadowA - 0.3, 1.0, 540, 900], [T.shadowA + 0.2, 1.2, 560, 660], [T.shadowB, 1.04, 540, 860],
  [T.linerA, 1.22, 570, 660], [T.outA - 0.2, 1.22, 570, 660], [T.outA + 0.15, 1.05, 540, 860], [T.tapeA, 1.1, 560, 720], [T.tapeB, 1.0, 540, 900], [T.lashA, 1.2, 560, 670], [T.lipA, 1.22, 550, 780], [T.lipA + 2.2, 1.0, 540, 900],
  [T.mirrorA, 1.05, 540, 800], [T.mirrorA + 1.2, 1.2, 540, 720], [T.mirrorB, 1.0, 540, 900], [T.knockA - 0.5, 1.0, 540, 900], [T.knockA + 0.2, 1.14, 560, 720], [T.noteA, 1.0, 540, 900], [T.vote - 0.2, 1.0, 540, 900], [9999, 1.0, 540, 900]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 1 && CAM[i + 1][0] <= t) i++; const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const shake = win(t, T.outA, T.outA + 0.5, 0.02, 0.35) * 6 + win(t, T.knockA, T.knockA + 0.3, 0.02, 0.3) * 5 + win(t, T.knockA + 0.9, T.knockA + 1.2, 0.02, 0.3) * 5;
  const slow = 1 + 0.015 * Math.sin(t * 0.7); // respiracion de camara
  return { z: lerp(a[1], b[1], u) * slow, x: lerp(a[2], b[2], u) + Math.sin(t * 61) * shake * 0.6, y: lerp(a[3], b[3], u) + Math.cos(t * 53) * shake * 0.6 };
}

// ---------------- efectos e inserts cinematograficos ----------------
const flick = (t) => { if (t < T.outA) return 1; if (t < T.outA + 0.06) return 0.4; if (t < T.outA + 0.12) return 1; if (t < T.outA + 0.2) return 0; if (t < T.outB) return 0; const d = t - T.outB; if (d < 0.08) return 1; if (d < 0.16) return 0; if (d < 0.26) return 1; if (d < 0.34) return 0.2; return 1; };
function darkOverlay(t) { const lit = flick(t); const d = 1 - lit; if (d <= 0.01) return '';
  const h = headOf(t); const np = ninaState(t); const torch = t > T.outA + 0.5 && t < T.outB; const wob = Math.sin(t * 3) * 10;
  return `<defs><radialGradient id="tg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000"/><stop offset="0.6" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient><mask id="dm"><rect width="${W}" height="${H}" fill="#fff"/>${torch ? `<circle cx="${h.x + 40 + wob}" cy="${h.y + 20}" r="${360}" fill="url(#tg)"/><circle cx="${NINA.x - 120}" cy="${NINA.y - 60}" r="150" fill="url(#tg)" opacity="0.6"/>` : ''}</mask></defs><rect width="${W}" height="${H}" fill="#04020a" opacity="${0.94 * d}" mask="url(#dm)"/>''`; }
function wrapIns(t, a, b, inner, tint = '#1a0e24') { const k = win(t, a, b, 0.3, 0.3); if (k <= 0) return ''; const u = clamp((t - a) / (b - a)), s = 1 + 0.12 * u;
  return `<clipPath id="ic${Math.round(a * 10)}"><circle cx="540" cy="900" r="${lerp(0, 1500, k)}"/></clipPath><g clip-path="url(#ic${Math.round(a * 10)})"><rect width="${W}" height="${H}" fill="${tint}"/><radialGradient id="ig${Math.round(a * 10)}" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient><rect width="${W}" height="${H}" fill="url(#ig${Math.round(a * 10)})"/><g transform="translate(540,880) scale(${s}) translate(-540,-880)">${inner(u)}</g>${k < 1 ? `<circle cx="540" cy="900" r="${lerp(0, 1500, k)}" fill="none" stroke="${OUT}" stroke-width="14"/>` : ''}</g>`; }
const insLabel = (txt, col = '#ffe14d', y = 1320) => `<text x="540" y="${y}" font-family="Anton" font-size="78" text-anchor="middle" fill="${col}" stroke="${OUT}" stroke-width="14" paint-order="stroke" letter-spacing="3">${txt}</text>`;
function insPalette(t) { const a = T.shadowA - 0.35, b = T.shadowA + 2.3; return wrapIns(t, a, b, (u) => { const pans = ['#3b1a0c', '#7a3b12', '#b4572a', '#e8a066', '#f8dc92', '#a96a42'];
  const bx = lerp(260, 760, u) + Math.sin(u * 14) * 24, by = lerp(930, 760, Math.sin(u * 3.1)) ;
  return `<g transform="translate(540,780) rotate(-5)"><rect x="-380" y="-250" width="760" height="500" rx="46" fill="#000" opacity="0.4" transform="translate(10,16)"/><rect x="-380" y="-250" width="760" height="500" rx="46" fill="#1c1218" stroke="#d4a24c" stroke-width="10"/>
    ${pans.map((c, i) => { const x = -250 + (i % 3) * 250, y = -90 + Math.floor(i / 3) * 190; return `<g transform="translate(${x},${y})"><circle r="92" fill="${c}" stroke="#12090a" stroke-width="6"/><circle r="92" fill="url(#shin)" opacity="0.5"/><path d="M-60,-30 Q0,-70 60,-30" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.25"/>${Math.abs(u * 3 - (i % 3)) < 0.55 ? `<circle r="${40 + 20 * Math.sin(u * 20)}" fill="#fff" opacity="0.12"/>` : ''}</g>`; }).join('')}<defs><radialGradient id="shin" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/></radialGradient></defs></g>
    <g transform="translate(${bx},${by}) rotate(-35) scale(1.5)">${salonTool('brushM', { k: u })}</g>${[...Array(14)].map((_, i) => { const ph = (u * 3 + i * 0.23) % 1; return `<circle cx="${bx + Math.sin(i * 2) * 60}" cy="${by - ph * 160}" r="${3 + (i % 3) * 2}" fill="#e8a066" opacity="${(1 - ph) * 0.9}"/>`; }).join('')}${insLabel('SOMBRAS COBRE', '#f8c27a')}`; }, '#150a12'); }
function insTape(t) { const a = T.tapeA - 0.2, b = T.tapeB + 0.5; return wrapIns(t, a, b, (u) => { const wing = clamp((u - 0.35) / 0.45);
  return `<g transform="translate(540,800)"><ellipse rx="400" ry="230" fill="#8a4e2b" opacity="0.0"/><g><ellipse cx="0" cy="-30" rx="330" ry="150" fill="url(#shT)" opacity="0.9"/><defs><linearGradient id="shT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b1a0c"/><stop offset="0.5" stop-color="#b4572a"/><stop offset="1" stop-color="#e8a066"/></linearGradient></defs>
    <path d="M-300,60 Q0,210 300,60 Q0,-160 -300,60Z" fill="#fff" stroke="#12090a" stroke-width="10"/><circle cx="0" cy="40" r="96" fill="#5a3320" stroke="#12090a" stroke-width="8"/><circle cx="0" cy="40" r="52" fill="#0a0503"/><circle cx="26" cy="12" r="20" fill="#fff"/>
    <path d="M-310,64 Q0,-196 310,64" stroke="#0a0508" stroke-width="22" fill="none" stroke-linecap="round"/>${[...Array(12)].map((_, i) => `<path d="M${-260 + i * 48},${-60 - Math.sin(i / 11 * Math.PI) * 70} l${14 + i},-46" stroke="#0a0508" stroke-width="9" stroke-linecap="round"/>`).join('')}
    <g transform="translate(${lerp(20, 0, wing)},${lerp(0, 0, wing)})"><path d="M300,60 L${300 + 250 * wing},${60 - 130 * wing}" stroke="#0a0508" stroke-width="22" stroke-linecap="round" opacity="${wing > 0.02 ? 1 : 0}"/></g>
    <g transform="rotate(-27 300 60) translate(300,60)" opacity="${clamp(u * 3)}"><rect x="-12" y="-26" width="${300}" height="52" fill="#f3e4c0" opacity="0.8" stroke="#c9b27a" stroke-width="4"/><path d="M0,-26 v52 M${300},-26 v52" stroke="#c9b27a" stroke-width="4" stroke-dasharray="8 6"/></g></g></g>${insLabel('EL TRUCO DE LA CINTA', '#fff', 1350)}`; }, '#121018'); }
function insLip(t) { const a = T.lipA - 0.35, b = T.lipA + 2.3; return wrapIns(t, a, b, (u) => { const rise = clamp(u * 2.2), sw = clamp((u - 0.45) / 0.45);
  return `<g transform="translate(430,800)"><g transform="rotate(${-8 + Math.sin(u * 8) * 2})"><rect x="-90" y="20" width="180" height="300" rx="26" fill="#12090a" stroke="#d4a24c" stroke-width="8"/><rect x="-90" y="20" width="180" height="46" fill="#d4a24c"/><rect x="-70" y="${-150 - 120 * rise}" width="140" height="${200 + 120 * rise}" rx="18" fill="#8f1d3a" stroke="#12090a" stroke-width="8"/><path d="M-70,${-150 - 120 * rise} L70,${-150 - 120 * rise} L50,${-200 - 120 * rise} L-50,${-210 - 120 * rise}Z" fill="#b02a4f" stroke="#12090a" stroke-width="7" stroke-linejoin="round"/><path d="M-40,${-120 - 120 * rise} v${160 + 120 * rise}" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.3"/></g>
    <g transform="translate(330,210)"><rect x="-190" y="-120" width="380" height="240" rx="26" fill="#fff" stroke="${OUT}" stroke-width="7"/><path d="M-150,40 Q-70,-50 10,20 Q90,90 150,-10" stroke="#8f1d3a" stroke-width="44" fill="none" stroke-linecap="round" stroke-dasharray="${500 * sw} 600"/><path d="M-150,10 Q-70,-80 10,-10 Q90,60 150,-40" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity="${0.5 * sw}" stroke-dasharray="${500 * sw} 600"/></g>
    ${[...Array(6)].map((_, i) => `<g transform="translate(${-250 + (i * 97) % 500},${-300 + (i * 61) % 160}) scale(${0.6 + 0.4 * Math.sin(u * 12 + i)})"><path d="M0,-16 Q3,-3 16,0 Q3,3 0,16 Q-3,3 -16,0 Q-3,-3 0,-16Z" fill="#fff"/></g>`).join('')}</g>${insLabel('VINO BRILLANTE', '#ff9ab8', 1330)}`; }, '#16090f'); }
function insClock(t) { const a = T.clockA, b = T.clockA + 2.1; return wrapIns(t, a, b, (u) => { const tk = Math.floor((t - a) * 2) % 2; const pulse = 0.5 + 0.5 * Math.sin(t * 9);
  return `<g transform="translate(540,780)"><circle r="360" fill="#000" opacity="0.4" transform="translate(10,16)"/><circle r="350" fill="#fff8e8" stroke="#d4a24c" stroke-width="22"/>${[...Array(12)].map((_, i) => `<text x="${Math.cos(i / 12 * 6.283 - 1.5708 + 0.5236) * 270}" y="${Math.sin(i / 12 * 6.283 - 1.5708 + 0.5236) * 270 + 24}" font-family="Anton" font-size="72" text-anchor="middle" fill="${OUT}">${i + 1}</text>`).join('')}
    <line x1="0" y1="0" x2="${Math.cos(-1.5708 - 0.2) * 190}" y2="${Math.sin(-1.5708 - 0.2) * 190}" stroke="${OUT}" stroke-width="22" stroke-linecap="round"/><line x1="0" y1="0" x2="${Math.cos(-1.5708 + 2.0) * 260}" y2="${Math.sin(-1.5708 + 2.0) * 260}" stroke="${OUT}" stroke-width="14" stroke-linecap="round"/><line x1="0" y1="0" x2="${Math.cos(-1.5708 + (t * 6.283 * 1)) * 300}" y2="${Math.sin(-1.5708 + t * 6.283) * 300}" stroke="#ef4444" stroke-width="6"/><circle r="22" fill="${OUT}"/>
    <circle r="356" fill="none" stroke="#ef4444" stroke-width="${8 * pulse}" opacity="${pulse}"/></g>${insLabel('FALTAN 10 MINUTOS', '#ff6b6b', 1280)}`; }, '#10060a'); }
function insNote(t) { const a = T.noteA - 0.1, b = T.noteB; const k = win(t, a, b, 0.35, 0.35); if (k <= 0) return ''; const u = clamp((t - a) / (b - a)), s = 1 + 0.18 * u;
  return `<g opacity="${k}"><g transform="translate(540,960) scale(${s * 1.5}) translate(-540,-1180)"><image href="${platePng.hall}" width="${W}" height="${H}" preserveAspectRatio="none"/></g><rect width="${W}" height="${H}" fill="#000" opacity="${0.35 + 0.2 * Math.sin(t * 9)}"/>
    <g transform="translate(540,1010) rotate(-6) scale(${pop(t, a + 0.3, 0.4)})"><rect x="-320" y="-220" width="640" height="440" rx="10" fill="#000" opacity="0.45" transform="translate(12,18)"/><rect x="-320" y="-220" width="640" height="440" rx="10" fill="#f6ecd2" stroke="#8a6a30" stroke-width="6"/><path d="M-290,-150 h580 M-290,-100 h580" stroke="#d8c898" stroke-width="3"/>
    <text x="0" y="-90" font-family="Anton" font-size="104" text-anchor="middle" fill="#7f1d1d" stroke="#3a0a0a" stroke-width="2" letter-spacing="3" transform="rotate(-2)">NO VAYAS</text><text x="0" y="30" font-family="Anton" font-size="104" text-anchor="middle" fill="#7f1d1d" stroke="#3a0a0a" stroke-width="2" letter-spacing="3" transform="rotate(1.5)">A LA GALA</text><text x="150" y="170" font-family="Anton" font-size="96" fill="#12090a" transform="rotate(-8 150 170)">M</text></g></g>`; }
function sparkleFx(t) { const a = win(t, T.mirrorA + 0.4, T.mirrorB + 0.6, 0.3, 0.5); if (a <= 0) return ''; const h = headOf(t);
  return [[-190, 20, 30], [220, 70, 36], [-230, 260, 24], [240, 360, 30], [0, -190, 28], [-150, 470, 22], [190, 520, 26]].map(([x, y, r], i) => `<g transform="translate(${h.x + x * h.S / 0.62},${h.y + y * h.S / 0.62}) scale(${(0.7 + 0.3 * Math.sin(t * 9 + i)) * pop(t, T.mirrorA + 0.4 + i * 0.1, 0.3)}) rotate(${t * 50})" opacity="${a}"><path d="M0,${-r} Q${r * 0.14},${-r * 0.14} ${r},0 Q${r * 0.14},${r * 0.14} 0,${r} Q${-r * 0.14},${r * 0.14} ${-r},0 Q${-r * 0.14},${-r * 0.14} 0,${-r}Z" fill="#fff" stroke="${OUT}" stroke-width="4"/></g>`).join(''); }
function mirrorGlow(t) { if (sceneAt(t) !== 'backstage') return ''; const p = 0.85 + 0.15 * Math.sin(t * 2.1); return `<g opacity="${0.18 * p}"><rect x="60" y="500" width="960" height="560" rx="30" fill="#ffe2a0" filter="url(#b10)"/></g>`; }
function arriveFx(t) { if (t > T.sceneB) return ''; const h = headOf(t); const a = win(t, T.limoOut, T.sceneB, 0.3, 0.3); return a > 0 ? [...Array(7)].map((_, i) => { const per = 0.7 + (i * 0.17) % 0.7, ph = (t + i * 0.37) % per; if (ph > 0.1) return ''; const x = 700 + (i * 97) % 330, y = 1300 + (i * 61) % 200; return `<g transform="translate(${x},${y})" opacity="${1 - ph / 0.1}"><circle r="70" fill="url(#fl)"/>${[0, 1, 2, 3].map((j) => `<line x1="0" y1="0" x2="${Math.cos(j * 0.785) * 100}" y2="${Math.sin(j * 0.785) * 100}" stroke="#fff" stroke-width="4"/>`).join('')}</g>`; }).join('') + '<defs><radialGradient id="fl"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' : ''; }

// ---------------- UI (zona segura) ----------------
const stepBanners = [['1', 'BASE', T.baseA - 0.1, T.contourA - 0.2, '#fde68a'], ['2', 'CONTORNO', T.contourA - 0.1, T.shadowA - 0.4, '#fdba74'], ['3', 'SOMBRAS', T.shadowA - 0.1, T.shadowB + 0.2, '#f59e0b'], ['4', 'DELINEADO', T.linerA - 0.1, T.outA - 0.1, '#c4b5fd'], ['5', 'LABIOS', T.lipA - 0.1, T.lipA + 2.3, '#fda4af']];
function banner(t, n, text, a, b, col) { const k = win(t, a, b, 0.25, 0.25); if (k <= 0) return '';
  return `<g transform="translate(540,455) scale(${pop(t, a, 0.3)})" opacity="${k}"><rect x="-330" y="-50" width="660" height="100" rx="50" fill="#000" opacity="0.3" transform="translate(4,6)"/><rect x="-330" y="-50" width="660" height="100" rx="50" fill="${col}" stroke="${OUT}" stroke-width="8"/><circle cx="-272" cy="0" r="36" fill="${OUT}"/><text x="-272" y="17" font-family="Anton" font-size="50" text-anchor="middle" fill="#fff">${n}</text><text x="34" y="20" font-family="Anton" font-size="${text.length > 9 ? 56 : 66}" text-anchor="middle" fill="${OUT}" letter-spacing="2">${esc(text)}</text></g>`; }
const mCache = new Map();
function inkWidth(str, fs) { const key = fs.toFixed(1) + '|' + str; if (mCache.has(key)) return mCache.get(key);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="${Math.ceil(fs * 2)}"><text x="40" y="${fs * 1.3}" font-family="Anton" font-size="${fs}" letter-spacing="2" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" fill="#fff">${str}</text></svg>`;
  const im = new Resvg(svg, ropt).render(), px = im.pixels, wd = im.width, ht = im.height; let lo = wd, hi = 0;
  for (let y = 0; y < ht; y += 2) for (let x = 0; x < wd; x++) if (px[(y * wd + x) * 4 + 3] > 20) { if (x < lo) lo = x; if (x > hi) hi = x; }
  const r = Math.max(0, hi - lo); mCache.set(key, r); return r; }
const SAFE_W = 920;
const SPEAK = { N: { col: '#ffe14d', name: null }, K: { col: '#f9a8d4', name: 'NINA' } };
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
    <text x="-310" y="-8" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">ESCENA</text><text x="-310" y="52" font-family="Anton" font-size="52" fill="#fbbf24">MAQUILLAJE DE GALA</text>
    <text x="-310" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">DÍA</text><text x="-310" y="172" font-family="Anton" font-size="58" fill="#ff4d8d">7 / 30</text><text x="60" y="108" font-family="Inter" font-weight="800" font-size="28" fill="#9ca3af">TOMA</text><text x="60" y="172" font-family="Anton" font-size="58" fill="#fff">1</text>
    ${clap >= 1 && t < 1.15 ? `<text x="0" y="-300" font-family="Anton" font-size="110" text-anchor="middle" fill="#ffe14d" stroke="${OUT}" stroke-width="12" paint-order="stroke">¡CLAC!</text>` : ''}</g></g>`;
}
function mirrorOverlay(t) { const a = win(t, T.mirrorStart + 0.2, T.mirrorEnd, 0.3, 0.4); if (a <= 0) return '';
  const g = ((t - T.mirrorStart) * 0.9) % 2;
  return `<g opacity="${a}"><path d="M0,0 H${W} V${H} H0Z M540,890 m-440,0 a440,640 0 1,0 880,0 a440,640 0 1,0 -880,0Z" fill="#0b0b10" fill-rule="evenodd" opacity="0.9"/><ellipse cx="540" cy="890" rx="440" ry="640" fill="none" stroke="#e8c27a" stroke-width="22"/><ellipse cx="540" cy="890" rx="418" ry="618" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/>
    <g opacity="0.55" transform="translate(${-400 + g * 800},0)"><path d="M300,300 L420,300 L240,1260 L120,1260Z" fill="#fff" opacity="0.18"/></g></g>`; }
function thumb(pp, r) { const sc = r / 235; return `<g><clipPath id="th${Math.round(r * 10)}${pp.__id}"><circle r="${r}"/></clipPath><circle r="${r}" fill="#fde68a"/><g clip-path="url(#th${Math.round(r * 10)}${pp.__id})"><g transform="translate(0,${0.28 * r}) scale(${sc}) translate(0,215)">${drawLazy(pp)}</g></g><circle r="${r}" fill="none" stroke="#fff" stroke-width="6"/><circle r="${r + 4}" fill="none" stroke="${OUT}" stroke-width="4"/></g>`; }
function endCard(t, P) {
  const k = clamp((t - T.vote) / 0.6); if (k <= 0) return '';
  const a = pop(t, T.optA), b = pop(t, T.optB);
  const A = { ...P, __id: 'A', hair: { rl: 1, s: 0, len: 1, shine: 0.95, sway: 0.2 } };
  const Bp = { ...P, __id: 'B', makeup: { ...P.makeup, mole: 0 } };
  let s = `<rect width="${W}" height="${H}" fill="#12090a" opacity="${0.6 * k}"/><text x="540" y="${1010 - 30 * (1 - ease(k))}" font-family="Anton" font-size="78" text-anchor="middle" fill="#fff" stroke="${OUT}" stroke-width="14" paint-order="stroke" opacity="${k}">¿QUÉ ARREGLAMOS MAÑANA?</text>`;
  if (a > 0) s += `<g transform="translate(540,1170) scale(${a})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#22d3ee" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.25"/><g transform="translate(-320,-5)">${thumb(A, 62)}</g><text x="50" y="26" font-family="Anton" font-size="72" text-anchor="middle" fill="${OUT}">A · RIZOS</text></g>`;
  if (b > 0) s += `<g transform="translate(540,1336) scale(${b})"><rect x="-416" y="-72" width="840" height="150" rx="44" fill="#000" opacity="0.35"/><rect x="-420" y="-80" width="840" height="150" rx="44" fill="#ff4d8d" stroke="${OUT}" stroke-width="8"/><rect x="-400" y="-70" width="800" height="36" rx="18" fill="#fff" opacity="0.2"/><g transform="translate(-320,-5)">${thumb(Bp, 62)}</g><text x="50" y="26" font-family="Anton" font-size="72" text-anchor="middle" fill="#fff">B · EL LUNAR</text></g>`;
  const c1 = pop(t, T.cta1, 0.3), c2 = pop(t, T.cta2, 0.3);
  if (c1 > 0) s += `<g transform="translate(540,1500) scale(${c1})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#ffe14d" stroke="${OUT}" stroke-width="7"/><path d="M-352,-18 h60 a10,10 0 0 1 10,10 v22 a10,10 0 0 1 -10,10 h-34 l-16,14 v-14 h-10 a10,10 0 0 1 -10,-10 v-22 a10,10 0 0 1 10,-10Z" fill="#fff" stroke="${OUT}" stroke-width="5" transform="translate(0,-4)"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">COMENTA TU ELECCIÓN</text></g>`;
  if (c2 > 0) s += `<g transform="translate(540,1600) scale(${c2})"><rect x="-400" y="-44" width="800" height="88" rx="44" fill="#fff" stroke="${OUT}" stroke-width="7"/><circle cx="-338" cy="0" r="30" fill="#ff4d8d" stroke="${OUT}" stroke-width="5"/><path d="M-338,-14 v28 M-352,0 h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/><text x="40" y="18" font-family="Anton" font-size="50" text-anchor="middle" fill="${OUT}">SÍGUEME PARA EL DÍA 8</text></g>`;
  return s;
}
// ---------------- FRAME ----------------
// ---------------- FRAME ----------------
function frame(t) {
  const P = pose(t), cam = camAt(t), sc = sceneAt(t), lp = lazyPlace(t), ns = ninaState(t);
  const py = lp.fy - 790 * lp.S;
  const lazy = lp.vis ? `<g transform="translate(${lp.x},${py}) scale(${lp.S})">${drawLazy(P)}</g>` : '';
  const smH = (fn) => { const o = { L: { x: 0, y: 0 }, R: { x: 0, y: 0 } }; for (let k = 0; k < 6; k++) { const tg = handsToTargets(fn(Math.max(0, t - k * 0.055))); o.L.x += tg.L.x / 6; o.L.y += tg.L.y / 6; o.R.x += tg.R.x / 6; o.R.y += tg.R.y / 6; } return o; };
  const nsm = smH((tt) => (ninaState(tt) || { hands: 'none' }).hands);
  const nina = ns ? `<g transform="translate(${NINA.x},${NINA.y}) scale(${NINA.s})">${drawNina({ ...ns, elbowDown: true, armL: nsm.L, armR: nsm.R, blink: blinkOf(t, 1.9), look: -0.7, t, part: 'body' })}</g><g transform="translate(${NINA.x},${NINA.y}) scale(${NINA.s})">${drawNina({ ...ns, elbowDown: true, t, part: 'tool' })}</g>` : '';
  const icons = ns ? talkIcon(t, 'K', NINA.x - 100, NINA.y - 150 * NINA.s) : '';
  const chairG = (g) => `<g transform="translate(540,1690) scale(${K}) translate(-540,-1660)">${g}</g>`;
  const seated = sc === 'backstage' && lp.seated;
  const world = `<g transform="translate(540,960) scale(${cam.z}) translate(${-cam.x},${-cam.y})"><image href="${platePng[sc]}" width="${W}" height="${H}" preserveAspectRatio="none"/>${mirrorGlow(t)}${sc === 'backstage' ? chairG(chairBack(seated)) : ''}${nina}${lazy}${seated ? chairG(chairFront()) : ''}${icons}${sparkleFx(t)}${arriveFx(t)}</g>`;
  const vignette = `<defs><radialGradient id="vgn" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05030a" stop-opacity="0.5"/></radialGradient><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="${W}" height="${H}" fill="url(#vgn)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${charDefs}<defs><filter id="b10"><feGaussianBlur stdDeviation="10"/></filter></defs>${world}${darkOverlay(t)}${vignette}
    <g transform="translate(540,300)"><rect x="-206" y="-42" width="420" height="96" rx="48" fill="#000" opacity="0.3"/><rect x="-210" y="-48" width="420" height="96" rx="48" fill="#ffe14d" stroke="${OUT}" stroke-width="8"/><text x="0" y="24" font-family="Anton" font-size="68" text-anchor="middle" fill="${OUT}">DÍA 7/30</text></g>
    ${stepBanners.map(([n, tx, a, b, c]) => banner(t, n, tx, a, b, c)).join('')}${insPalette(t)}${insTape(t)}${insLip(t)}${insClock(t)}${insNote(t)}
    ${t < T.vote ? captions(t) : ''}${endCard(t, P)}${slate(t)}
    <image href="${grainPng}" width="${W}" height="${H}"/></svg>`;
  return new Resvg(svg, ropt).render().asPng();
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
