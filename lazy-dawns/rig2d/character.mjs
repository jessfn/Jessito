// LAZY 2D RIG HIBRIDO — personaje articulado dibujado por piezas vectoriales (SVG), basado en referencia_original.jpg
// Sistema de coordenadas = lienzo de referencia 1024x1536 (origen arriba-izquierda). Cada pieza se dibuja en coordenadas absolutas de reposo
// y se mueve con grupos anidados  translate(pivote) rotate(angulo) translate(-pivote)  (jerarquia de huesos).
// Lado L = izquierda de la pantalla, R = derecha de la pantalla.
import { Resvg } from '@resvg/resvg-js';
import { drawLazyHeadBack, drawLazyHeadFront } from '../rig.mjs';
import { defs as oldDefs } from '../lazy_lib.mjs';
export const OUT = '#140806';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const rad = (d) => d * Math.PI / 180, deg = (r) => r * 180 / Math.PI;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const f1 = (n) => (Math.round(n * 10) / 10);

// ---------------- ESQUELETO (pivotes en reposo) ----------------
export const SK = {
  root: [512, 1500], hips: [512, 775], chest: [512, 640], neck: [512, 445], head: [512, 425], jaw: [512, 330],
  shoulderL: [432, 482], elbowL: [380, 652], wristL: [330, 835], shoulderR: [592, 482], elbowR: [644, 652], wristR: [694, 835],
  hipL: [482, 780], kneeL: [470, 1110], ankleL: [440, 1400], hipR: [548, 780], kneeR: [566, 1110], ankleR: [590, 1400],
};
export const BONES = ['root', 'hips', 'spine', 'chest', 'neck', 'head', 'jaw', 'shoulder_L', 'upper_arm_L', 'forearm_L', 'hand_L', 'shoulder_R', 'upper_arm_R', 'forearm_R', 'hand_R',
  ...['L', 'R'].flatMap((s) => ['thumb', 'index', 'middle', 'ring', 'pinky'].flatMap((f) => [`${f}_${s}_1`, `${f}_${s}_2`])), 'thigh_L', 'shin_L', 'foot_L', 'thigh_R', 'shin_R', 'foot_R', 'hair_sway_L', 'hair_sway_R', 'hair_top', 'skirt_sway_L', 'skirt_sway_R', 'earring_L', 'earring_R', 'pendant'];
const rot = (a, p) => `translate(${f1(p[0])},${f1(p[1])}) rotate(${f1(a)}) translate(${f1(-p[0])},${f1(-p[1])})`;
const mv = (dx, dy) => `translate(${f1(dx)},${f1(dy)})`;

// ---------------- paleta ----------------
const C = { skin: '#be7143', skinD: '#a45f36', skinL: '#d6894f', blush: '#d65a50', lip: '#cf4aa0', lipD: '#8e1d6a', lipL: '#f58ac8', hair: '#2a0f05', hairM: '#5b2a14', hairL: '#9a5a2e', red: '#ae0017', redD: '#830010', redDD: '#5a050e', redL: '#d4283a', gold: '#f2c040', goldD: '#b88410', goldL: '#fff0a0', shadow: '#a98be0', shadowD: '#6a3fb0' };
export const DEFS = `<defs>
<linearGradient id="zSkin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a5a32"/><stop offset="0.28" stop-color="#d89a68"/><stop offset="0.6" stop-color="#c98a5a"/><stop offset="1" stop-color="#8a4e2b"/></linearGradient>
<radialGradient id="zFace" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#cc7f4a"/><stop offset="0.7" stop-color="#be7143"/><stop offset="1" stop-color="#a45f36"/></radialGradient>
<linearGradient id="zCor" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#4a0009"/><stop offset="0.3" stop-color="#8e0612"/><stop offset="0.5" stop-color="#b3101f"/><stop offset="0.75" stop-color="#780612"/><stop offset="1" stop-color="#3d0008"/></linearGradient>
<linearGradient id="zSk" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#6a000e"/><stop offset="0.35" stop-color="#b00a1e"/><stop offset="0.55" stop-color="#cc1a2e"/><stop offset="0.8" stop-color="#8a0314"/><stop offset="1" stop-color="#4c0008"/></linearGradient>
<linearGradient id="zGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.5" stop-color="#e0a820"/><stop offset="1" stop-color="#9a6a08"/></linearGradient>
<radialGradient id="zIris" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stop-color="#a0602e"/><stop offset="0.55" stop-color="#6a3418"/><stop offset="1" stop-color="#2a1208"/></radialGradient>
<linearGradient id="zLip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e86cb8"/><stop offset="1" stop-color="#b02a86"/></linearGradient>
<radialGradient id="zHi" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>`;

// ---------------- utilidades de forma ----------------
export function taperPath(p0, p1, w0, w1) { return taper(p0, p1, w0, w1); }
function taper(p0, p1, w0, w1) { // cinta con puntas redondas (semicirculos cubicos hacia afuera)
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, nx = -uy, ny = ux, a = w0 / 2, b = w1 / 2, ka = a * 1.3333, kb = b * 1.3333;
  return `M${f1(p0[0] + nx * a)},${f1(p0[1] + ny * a)} L${f1(p1[0] + nx * b)},${f1(p1[1] + ny * b)} C${f1(p1[0] + nx * b + ux * kb)},${f1(p1[1] + ny * b + uy * kb)} ${f1(p1[0] - nx * b + ux * kb)},${f1(p1[1] - ny * b + uy * kb)} ${f1(p1[0] - nx * b)},${f1(p1[1] - ny * b)} L${f1(p0[0] - nx * a)},${f1(p0[1] - ny * a)} C${f1(p0[0] - nx * a - ux * ka)},${f1(p0[1] - ny * a - uy * ka)} ${f1(p0[0] + nx * a - ux * ka)},${f1(p0[1] + ny * a - uy * ka)} ${f1(p0[0] + nx * a)},${f1(p0[1] + ny * a)}Z`;
}
const seg = (path, pass, fill, sw = 9) => pass === 'o' ? `<path d="${path}" fill="${OUT}" stroke="${OUT}" stroke-width="${sw}" stroke-linejoin="round"/>` : `<path d="${path}" fill="${fill}"/>`;

// ---------------- IK 2 huesos (codo hacia fuera/atras) ----------------
export function ik2(S, E0, W0, T, bendSign) {
  const L1 = Math.hypot(E0[0] - S[0], E0[1] - S[1]), L2 = Math.hypot(W0[0] - E0[0], W0[1] - E0[1]);
  let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy); const dc = clamp(d, Math.abs(L1 - L2) + 2, L1 + L2 - 1); if (d > 0) { dx *= dc / d; dy *= dc / d; } d = dc;
  const base = Math.atan2(dy, dx), A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = base + bendSign * A; const E = [S[0] + L1 * Math.cos(a1), S[1] + L1 * Math.sin(a1)]; const a2 = Math.atan2(S[1] + dy - E[1], S[0] + dx - E[0]);
  const a1_0 = Math.atan2(E0[1] - S[1], E0[0] - S[0]), a2_0 = Math.atan2(W0[1] - E0[1], W0[0] - E0[0]);
  const d1 = deg(a1 - a1_0), d2 = deg(a2 - a2_0) - d1; const wrap = (x) => ((x + 540) % 360) - 180;
  return { r1: wrap(d1), r2: wrap(d2) };
}

// ---------------- POSE POR DEFECTO ----------------
export function defaultPose() {
  return {
    hips: { x: 0, y: 0, rot: 0 }, chest: { rot: 0, breath: 0 }, head: { rot: 0, yaw: 0, pitch: 0 }, jaw: 0,
    armL: { r1: 0, r2: 0, wrist: 0 }, armR: { r1: 0, r2: 0, wrist: 0 },
    handL: { curl: [0.12, 0.2, 0.25, 0.28, 0.3], spread: 0.1, wig: 0, t: 0 }, handR: { curl: [0.12, 0.2, 0.25, 0.28, 0.3], spread: 0.1, wig: 0, t: 0 },
    legL: { r1: 0, r2: 0, foot: 0 }, legR: { r1: 0, r2: 0, foot: 0 },
    eyes: { lookX: 0, lookY: 0, blinkL: 0, blinkR: 0, squint: 0, wide: 0 },
    brows: { Lraise: 0, Rraise: 0, Lfrown: 0, Rfrown: 0 },
    mouth: { open: 0, wide: 0, round: 0, smile: 0.3, upperTeeth: 0, lowerTeeth: 0, tongue: 0, fv: 0, press: 0 },
    hair: { swayL: 0, swayR: 0, top: 0, bounce: 0, t: 0 }, skirt: { swayL: 0, swayR: 0, hem: 0, ruffle: 0, t: 0 }, acc: { earL: 0, earR: 0, pendant: 0 },
  };
}
// ---------------- EXPRESIONES ----------------
export const EXPR = {
  neutral: { brows: { Lraise: 0, Rraise: 0, Lfrown: 0, Rfrown: 0 }, mouth: { open: 0, wide: 0, round: 0, smile: 0.25 }, eyes: { squint: 0, wide: 0 } },
  smile: { brows: { Lraise: 0.15, Rraise: 0.15, Lfrown: 0, Rfrown: 0 }, mouth: { open: 0.12, wide: 0.5, round: 0, smile: 0.8, upperTeeth: 1 }, eyes: { squint: 0.15, wide: 0 } },
  happy: { brows: { Lraise: 0.3, Rraise: 0.3, Lfrown: 0, Rfrown: 0 }, mouth: { open: 0.3, wide: 0.7, round: 0, smile: 1, upperTeeth: 1, lowerTeeth: 0.6 }, eyes: { squint: 0.35, wide: 0 } },
  surprised: { brows: { Lraise: 1, Rraise: 1, Lfrown: 0, Rfrown: 0 }, mouth: { open: 0.65, wide: -0.2, round: 0.9, smile: 0, upperTeeth: 0.6 }, eyes: { squint: 0, wide: 0.5 } },
  sad: { brows: { Lraise: 0.5, Rraise: 0.5, Lfrown: -0.8, Rfrown: -0.8 }, mouth: { open: 0.05, wide: -0.3, round: 0, smile: -0.8 }, eyes: { squint: 0.1, wide: 0 } },
  angry: { brows: { Lraise: -0.2, Rraise: -0.2, Lfrown: 1, Rfrown: 1 }, mouth: { open: 0.15, wide: 0.2, round: 0, smile: -0.5, upperTeeth: 1, lowerTeeth: 0.7 }, eyes: { squint: 0.4, wide: 0 } },
  worried: { brows: { Lraise: 0.6, Rraise: 0.6, Lfrown: -0.5, Rfrown: -0.5 }, mouth: { open: 0.1, wide: -0.1, round: 0, smile: -0.35 }, eyes: { squint: 0, wide: 0.15 } },
  laughing: { brows: { Lraise: 0.4, Rraise: 0.4, Lfrown: 0, Rfrown: 0 }, mouth: { open: 0.85, wide: 0.9, round: 0, smile: 1, upperTeeth: 1, lowerTeeth: 1, tongue: 1 }, eyes: { squint: 0.8, wide: 0 } },
};
export const VISEME = { rest: { open: 0, wide: 0, round: 0, upperTeeth: 0.3 }, A: { open: 0.85, wide: 0.1, round: 0, upperTeeth: 1, lowerTeeth: 0.6, tongue: 0.3 }, E: { open: 0.38, wide: 0.75, round: 0, upperTeeth: 1, lowerTeeth: 0.8 }, I: { open: 0.2, wide: 0.95, round: 0, upperTeeth: 1, lowerTeeth: 0.9 },
  O: { open: 0.6, wide: -0.55, round: 1, upperTeeth: 0.4, tongue: 0.2 }, U: { open: 0.28, wide: -0.8, round: 1, upperTeeth: 0 }, FV: { open: 0.14, wide: 0.2, round: 0, upperTeeth: 1, fv: 1 }, L: { open: 0.4, wide: 0.3, round: 0, upperTeeth: 1, lowerTeeth: 0.2, tongue: 1 }, MBP: { open: 0, wide: -0.15, round: 0, upperTeeth: 0, press: 1 } };
export function applyExpr(pose, name, k = 1) { const e = EXPR[name]; if (!e) return pose; for (const g of ['brows', 'mouth', 'eyes']) for (const key of Object.keys(e[g])) pose[g][key] = lerp(pose[g][key] ?? 0, e[g][key], k); return pose; }
export function applyViseme(pose, name, k = 1) { const v = VISEME[name]; if (!v) return pose; for (const key of ['open', 'wide', 'round', 'upperTeeth', 'lowerTeeth', 'tongue', 'fv', 'press']) pose.mouth[key] = lerp(pose.mouth[key] ?? 0, v[key] ?? 0, k); return pose; }

// ================= CABELLO (rizos por grupos que se balancean) =================
function makeLocks(seed, n, spec) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const u = R(); const ang = lerp(spec.a0, spec.a1, u); const rr = 0.9 + 0.12 * R();
    const root = [spec.cx + Math.cos(rad(ang)) * spec.rx * rr, spec.cy + Math.sin(rad(ang)) * spec.ry * rr];
    const len = lerp(spec.l0, spec.l1, R() * R() + 0.25 * R()); const side = Math.cos(rad(ang)) >= 0 ? 1 : -1;
    const r0 = [Math.cos(rad(ang)), Math.sin(rad(ang))], vd = [side * Math.sin(spec.splay), Math.cos(spec.splay)];
    const lam = 15 + R() * 9, amp = 8 + R() * 5, ph = R() * 6.28;
    const pts = []; let x = root[0], y = root[1];
    for (let s = 0; s <= len; s += 4) { const k = smooth(clamp(s / (len * spec.turn))); let vx = lerp(r0[0] * spec.out + vd[0] * (1 - spec.out), vd[0], k), vy = lerp(r0[1] * spec.out + vd[1] * (1 - spec.out), vd[1], k); const m = Math.hypot(vx, vy) || 1; vx /= m; vy /= m; x += vx * 4; y += vy * 4;
      const off = Math.sin((s / lam) * 6.283 + ph) * amp * (0.45 + 0.55 * k), off2 = Math.cos((s / lam) * 6.283 + ph) * amp * 0.8 * (0.45 + 0.55 * k); pts.push([x - vy * off + vx * off2 * 0.6, y + vx * off + vy * off2 * 0.6]); }
    out.push({ root, pts, tone: R(), w: 0.85 + 0.35 * R(), swayK: 0.35 + 0.65 * R() });
  }
  out.sort((a, b) => a.pts[a.pts.length - 1][1] - b.pts[b.pts.length - 1][1]);
  return out;
}
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const HAIR_SPECS = {
  back: { seed: 11, n: 200, cx: 512, cy: 250, rx: 150, ry: 150, a0: 150, a1: 390, l0: 160, l1: 420, splay: 0.35, out: 0.9, turn: 0.9 },
  sideL: { seed: 23, n: 230, cx: 512, cy: 250, rx: 140, ry: 140, a0: 110, a1: 215, l0: 330, l1: 600, splay: 0.28, out: 0.55, turn: 0.55 },
  sideR: { seed: 37, n: 230, cx: 512, cy: 250, rx: 140, ry: 140, a0: -35, a1: 70, l0: 330, l1: 600, splay: 0.28, out: 0.55, turn: 0.55 },
  topL: { seed: 47, n: 90, cx: 512, cy: 250, rx: 146, ry: 146, a0: 215, a1: 268, l0: 120, l1: 280, splay: 0.6, out: 0.95, turn: 0.55 },
  topR: { seed: 53, n: 90, cx: 512, cy: 250, rx: 146, ry: 146, a0: 272, a1: 325, l0: 120, l1: 280, splay: 0.6, out: 0.95, turn: 0.55 },
  frontL: { seed: 61, n: 34, cx: 512, cy: 250, rx: 140, ry: 145, a0: 168, a1: 222, l0: 200, l1: 380, splay: 0.4, out: 0.5, turn: 0.5 },
  frontR: { seed: 67, n: 34, cx: 512, cy: 250, rx: 140, ry: 145, a0: -42, a1: 12, l0: 200, l1: 380, splay: 0.4, out: 0.5, turn: 0.5 },
};
const LOCKS = Object.fromEntries(Object.entries(HAIR_SPECS).map(([k, s]) => [k, makeLocks(s.seed, s.n, s)]));
function lockSvg(lk, sway, t, kPhase) {
  const sw = sway * lk.swayK; const d = lk.pts.map(([x, y], i) => { const u = i / lk.pts.length; const a = rad(sw * u * u * 7) + Math.sin(t * 2.2 + lk.root[0] * 0.02 + kPhase) * 0.012 * u * sway * 0;
    const dx = x - lk.root[0], dy = y - lk.root[1], c = Math.cos(a), s = Math.sin(a); return `${f1(lk.root[0] + dx * c - dy * s)},${f1(lk.root[1] + dx * s + dy * c)}`; });
  const p = 'M' + d.join(' L');
  const mid = lk.tone > 0.6 ? '#3e1a0c' : '#2c1007';
  return `<path d="${p}" stroke="#1a0903" stroke-width="${f1(15 * lk.w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${p}" stroke="${mid}" stroke-width="${f1(8.6 * lk.w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${p}" stroke="#7a3f1d" stroke-width="${f1(2 * lk.w)}" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(-2.4,-2)" opacity="${0.35 + 0.5 * lk.tone}"/>`;
}
function hairGroup(name, sway, t, ph) { return LOCKS[name].map((lk, i) => lockSvg(lk, sway, t, ph + i * 0.01)).join(''); }
export function hairBack(P) { const h = P.hair; return `<g id="hair_back"><path d="M512,22 C690,16 846,150 850,356 C852,540 820,650 740,700 C660,730 364,730 284,700 C204,650 172,540 174,356 C178,150 334,16 512,22Z" fill="#1a0903"/>` + `<g transform="${rot(h.swayL * 0.8 + h.bounce, [512, 200])}">${hairGroup('back', (h.swayL + h.swayR) / 2, h.t, 0)}</g><g transform="${rot(h.swayL, [470, 220])}">${hairGroup('sideL', h.swayL, h.t, 1)}</g><g transform="${rot(h.swayR, [554, 220])}">${hairGroup('sideR', h.swayR, h.t, 2)}</g></g>`; }
export function hairFront(P) { const h = P.hair; return `<g id="hair_front"><g transform="${rot(h.top, [512, 160])}">${hairGroup('topL', h.top, h.t, 3)}${hairGroup('topR', h.top, h.t, 4)}</g><g transform="${rot(h.swayL * 0.6, [440, 200])}">${hairGroup('frontL', h.swayL * 0.6, h.t, 5)}</g><g transform="${rot(h.swayR * 0.6, [584, 200])}">${hairGroup('frontR', h.swayR * 0.6, h.t, 6)}</g><path d="M512,96 L512,140" stroke="#0e0502" stroke-width="7" stroke-linecap="round"/></g>`; }

// ================= CABEZA Y ROSTRO =================
const EYE = { L: [454, 262], R: [570, 262] };
const jawDrop = (P) => P.jaw * 1 + P.mouth.open * 30;
function facePath(P) { const y = P.head.yaw, jd = jawDrop(P) * 0.85, sh = y * 10, nw = 1 - Math.abs(y) * 0.05;
  const X = (dx) => f1(512 + sh + dx * nw * 0.93);
  return `M${X(0)},116 C${X(92)},116 ${X(132)},186 ${X(128)},268 C${X(124)},340 ${X(82)},${f1(408 + jd * 0.8)} ${X(0)},${f1(414 + jd)} C${X(-82)},${f1(408 + jd * 0.8)} ${X(-124)},340 ${X(-128)},268 C${X(-132)},186 ${X(-92)},116 ${X(0)},116Z`; }
export function part_face(P, fillRef = 'url(#zFace)') { const fp = facePath(P); return `<g id="face"><path d="${fp}" fill="${fillRef}" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><clipPath id="faceClip"><path d="${fp}"/></clipPath><g clip-path="url(#faceClip)"><ellipse cx="500" cy="230" rx="110" ry="130" fill="url(#zHi)"/><ellipse cx="512" cy="410" rx="120" ry="30" fill="#8f4f2b" opacity="0.22"/><path d="M400,300 Q420,380 512,404 Q604,380 624,300" stroke="#8f4f2b" stroke-opacity="0.2" stroke-width="16" fill="none"/></g></g>`; }
export function part_ear(side, P) { const x = side === 'L' ? 384 : 640, s = side === 'L' ? -1 : 1; return `<g id="ear_${side}" transform="translate(${P.head.yaw * 8 * 0},0)"><path d="M${x},268 C${x + s * 22},262 ${x + s * 30},310 ${x + s * 12},340 C${x + s * 4},350 ${x},344 ${x},336Z" fill="${C.skin}" stroke="${OUT}" stroke-width="6"/><path d="M${x + s * 6},286 q${s * 10},18 ${s * 0},38" stroke="#8f4f2b" stroke-width="4" fill="none"/></g>`; }
export function part_cheeks(P) { const sh = P.head.yaw * 14; return `<g id="cheeks"><radialGradient id="zBl" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e05a4e" stop-opacity="0.85"/><stop offset="1" stop-color="#e05a4e" stop-opacity="0"/></radialGradient><circle cx="${f1(428 + sh)}" cy="338" r="52" fill="url(#zBl)"/><circle cx="${f1(598 + sh)}" cy="338" r="52" fill="url(#zBl)"/></g>`; }
export function part_eye(side, P) { // devuelve {sclera,iris,pupil,lidUp,lidLow,lashes,all}
  const e = P.eyes, [cx0, cy] = EYE[side]; const sh = P.head.yaw * 22; const cx = cx0 + sh, b = clamp(side === 'L' ? e.blinkL : e.blinkR), wide = e.wide, sq = e.squint;
  const rx = 37, ry = 43 * (1 + wide * 0.12), id = side;
  const sclera = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${f1(ry)}" fill="#fffefa" stroke="${OUT}" stroke-width="6"/>`;
  const gx = cx + e.lookX * 13, gy = cy + e.lookY * 11 + 2;
  const iris = `<circle cx="${f1(gx)}" cy="${f1(gy)}" r="27" fill="url(#zIris)" stroke="#2a1208" stroke-width="3"/><circle cx="${f1(gx)}" cy="${f1(gy)}" r="21" fill="none" stroke="#a8683a" stroke-opacity="0.5" stroke-width="3"/>`;
  const pupil = `<circle cx="${f1(gx)}" cy="${f1(gy)}" r="${12 - wide * 1.5}" fill="#0c0502"/><circle cx="${f1(gx - 9)}" cy="${f1(gy - 11)}" r="7.5" fill="#fff"/><circle cx="${f1(gx + 10)}" cy="${f1(gy + 9)}" r="3.4" fill="#fff" opacity="0.85"/>`;
  const apex = lerp(cy - ry + 2 + sq * 8, cy + 8, b), cornerY = cy - 4, ctrl = 2 * apex - cornerY;
  const edge = (dy = 0) => `M${cx - 42},${cornerY + dy} Q${cx},${f1(ctrl + dy)} ${cx + 42},${cornerY + dy}`;
  const lidPath = `${edge()} L${cx + 42},${cy - 80} L${cx - 42},${cy - 80}Z`;
  const lidUp = `<clipPath id="lc${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx + 2}" ry="${f1(ry + 2)}"/></clipPath><g clip-path="url(#lc${id})"><path d="${lidPath}" fill="url(#zFace)"/><path d="${edge()}" stroke="${OUT}" stroke-width="${f1(5 + b * 2)}" fill="none" stroke-linecap="round"/></g>`;
  const shadow = `<path d="${edge()} L${cx + 46},${f1(cornerY - 4)} Q${cx},${f1(ctrl - 34)} ${cx - 46},${f1(cornerY - 4)}Z" fill="${C.shadow}" opacity="0.92"/><path d="M${cx - 46},${cornerY - 2} Q${cx},${f1(ctrl - 22)} ${cx + 46},${cornerY - 2}" stroke="${C.shadowD}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  const lowY = cy + ry - 2 - sq * 16 - b * 6; const lidLow = (sq + b <= 0.05) ? '' : `<g clip-path="url(#lc${id})"><path d="M${cx - 46},${cy + 4} Q${cx},${f1(lowY * 2 - cy - 4)} ${cx + 46},${cy + 4} L${cx + 46},${cy + 80} L${cx - 46},${cy + 80}Z" fill="url(#zFace)" opacity="${sq + b > 0.05 ? 1 : 0}"/></g>`;
  const sgn = side === 'L' ? -1 : 1; let lash = '';
  for (let i = 0; i < 11; i++) { const t = i / 10, x = lerp(cx - 44, cx + 44, t), yy = (1 - t) * (1 - t) * cornerY + 2 * (1 - t) * t * ctrl + t * t * cornerY; const out = (t - 0.5) * 2; const outer = Math.max(0, out * sgn); const inner = Math.max(0, -out * sgn); const ang = rad(-90 + out * 44); const len = (9 + 10 * (1 - Math.abs(out) * 0.45)) * (1 + 0.55 * outer) * (1 - 0.45 * inner);
    lash += `<path d="M${f1(x)},${f1(yy)} q${f1(Math.cos(ang) * len * 0.45 + out * 3)},${f1(Math.sin(ang) * len * 0.6)} ${f1(Math.cos(ang) * len + out * 7)},${f1(Math.sin(ang) * len)}" stroke="#12081f" stroke-width="3.4" fill="none" stroke-linecap="round"/>`; }
  /* sin pestanas inferiores largas (como la referencia) */
  return { sclera, iris: `<g clip-path="url(#lc${id})">${iris}${pupil}</g>`, lidUp: shadow + lidUp, lidLow, lashes: `<g id="lashes_${side}">${lash}</g>`, all: `<g id="eye_${side}">${sclera}<g clip-path="url(#lc${id})">${iris}${pupil}</g>${lidLow}${shadow}${lidUp}${lash.length ? `<g id="lashes_${side}">${lash}</g>` : ''}</g>` };
}
export function part_brow(side, P) { const b = P.brows, r = side === 'L' ? b.Lraise : b.Rraise, fr = side === 'L' ? b.Lfrown : b.Rfrown; const sh = P.head.yaw * 20; const sg = side === 'L' ? -1 : 1, cx = side === 'L' ? 462 + sh : 562 + sh;
  const dy = -r * 20, inner = [cx - sg * 38, 205 + dy + fr * 12], outer = [cx + sg * 46, 208 + dy - fr * 4 + r * 3], peak = [cx + sg * 4, 188 + dy - r * 4 + fr * 3];
  const top = `M${f1(inner[0])},${f1(inner[1] - 6)} Q${f1(peak[0] - sg * 12)},${f1(peak[1] - 8)} ${f1(peak[0] + sg * 14)},${f1(peak[1] - 6)} Q${f1(outer[0] - sg * 8)},${f1(outer[1] - 12)} ${f1(outer[0])},${f1(outer[1])}`;
  const bot = ` Q${f1(outer[0] - sg * 14)},${f1(outer[1] - 4)} ${f1(peak[0] + sg * 8)},${f1(peak[1] + 10)} Q${f1(peak[0] - sg * 16)},${f1(peak[1] + 8)} ${f1(inner[0])},${f1(inner[1] + 6)}Z`;
  return `<g id="brow_${side}"><path d="${top}${bot}" fill="#1d0f08" stroke="#120804" stroke-width="3" stroke-linejoin="round"/><path d="M${f1(peak[0] - sg * 10)},${f1(peak[1] - 2)} q${sg * 14},-6 ${sg * 28},0" stroke="#5a3322" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.7"/></g>`; }
export function part_nose(P) { const sh = P.head.yaw * 26; const cx = 512 + sh; return `<g id="nose"><ellipse cx="${cx}" cy="298" rx="29" ry="22" fill="#9b5836" stroke="${OUT}" stroke-width="7"/><ellipse cx="${cx - 4}" cy="290" rx="17" ry="10" fill="#c48258" opacity="0.8"/><ellipse cx="${cx - 9}" cy="287" rx="7" ry="4" fill="#e8b890" opacity="0.8"/><path d="M${cx - 14},308 q14,7 28,0" stroke="#5a2e18" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/></g>`; }
// Boca: labios independientes, dientes sup/inf, lengua, mandibula
export function mouthGeom(P) { const m = P.mouth, sh = P.head.yaw * 24, cx = 512 + sh, cy = 352; const w = clamp(46 + 18 * m.wide - 16 * m.round, 26, 70), h = m.open * 36 + P.jaw * 0.6, up = m.smile * 9, cyc = cy - up * 0.4;
  return { cx, cy: cyc, w, h, cornerY: cyc - m.smile * 7 + Math.max(0, -m.smile) * 0 + 4, thick: 11 + m.round * 5 }; }
export function part_mouth(P) { const g = mouthGeom(P), m = P.mouth, { cx, w, h } = g, cy = g.cy, cyc = g.cornerY, tU = g.thick, tL = g.thick + 4; const lx = cx - w, rx = cx + w;
  const lineY = cy + 2, lowEdgeY = lineY + h;
  const cavity = `M${lx},${cyc} Q${cx},${f1(lineY - 4)} ${rx},${cyc} Q${cx},${f1(lowEdgeY + 6)} ${lx},${cyc}Z`;
  const upperLip = `M${lx},${cyc} C${f1(cx - w * 0.55)},${f1(cy - tU - 3)} ${f1(cx - 14)},${f1(cy - tU - 8)} ${cx},${f1(cy - tU + 1)} C${f1(cx + 14)},${f1(cy - tU - 8)} ${f1(cx + w * 0.55)},${f1(cy - tU - 3)} ${rx},${cyc} Q${cx},${f1(lineY - 2)} ${lx},${cyc}Z`;
  const lowerLip = `M${lx},${cyc} Q${cx},${f1(lowEdgeY + 2)} ${rx},${cyc} C${f1(cx + w * 0.6)},${f1(lowEdgeY + tL + 4)} ${f1(cx - w * 0.6)},${f1(lowEdgeY + tL + 4)} ${lx},${cyc}Z`;
  const clipId = 'mc'; const tw = w * 0.74;
  const teethU = m.upperTeeth > 0.05 && h > 2 ? `<g clip-path="url(#${clipId})"><path d="M${f1(cx - tw)},${f1(lineY - 8)} L${f1(cx + tw)},${f1(lineY - 8)} L${f1(cx + tw)},${f1(lineY + 10 + Math.min(h, 14) * 0.9)} Q${cx},${f1(lineY + 14 + Math.min(h, 14))} ${f1(cx - tw)},${f1(lineY + 10 + Math.min(h, 14) * 0.9)}Z" fill="#fffdf6" stroke="#cfc6b8" stroke-width="1.6"/>${[-0.5, -0.25, 0, 0.25, 0.5].map((k) => `<path d="M${f1(cx + k * tw * 1.6)},${f1(lineY)} v${f1(10 + Math.min(h, 14))}" stroke="#d8cfc0" stroke-width="1.6"/>`).join('')}</g>` : '';
  const teethL = m.lowerTeeth > 0.05 && h > 6 ? `<g clip-path="url(#${clipId})"><path d="M${f1(cx - tw * 0.85)},${f1(lowEdgeY + 6)} L${f1(cx + tw * 0.85)},${f1(lowEdgeY + 6)} L${f1(cx + tw * 0.85)},${f1(lowEdgeY - 8 * m.lowerTeeth)} Q${cx},${f1(lowEdgeY - 10 * m.lowerTeeth)} ${f1(cx - tw * 0.85)},${f1(lowEdgeY - 8 * m.lowerTeeth)}Z" fill="#f6f1e6" stroke="#cfc6b8" stroke-width="1.4"/></g>` : '';
  const tongue = h > 8 ? `<g clip-path="url(#${clipId})"><ellipse cx="${cx}" cy="${f1(lowEdgeY - 2 - m.tongue * 6)}" rx="${f1(w * 0.5)}" ry="${f1(Math.min(14, h * 0.5) + m.tongue * 4)}" fill="#e0607a"/><path d="M${cx},${f1(lowEdgeY - 12)} v8" stroke="#b0405a" stroke-width="2.4"/></g>` : '';
  const fv = m.fv > 0.3 ? `<path d="M${f1(cx - tw * 0.8)},${f1(lineY - 2)} L${f1(cx + tw * 0.8)},${f1(lineY - 2)} L${f1(cx + tw * 0.8)},${f1(lineY + 14)} Q${cx},${f1(lineY + 18)} ${f1(cx - tw * 0.8)},${f1(lineY + 14)}Z" fill="#fffdf6" stroke="#cfc6b8" stroke-width="1.6"/>` : '';
  const lipS = `stroke="#6a0f4c" stroke-width="3.6" stroke-linejoin="round"`;
  const lowerLipSvg = `<g id="lip_lower"><path d="${lowerLip}" fill="url(#zLip)" ${lipS}/><path d="M${f1(cx - w * 0.45)},${f1(lowEdgeY + tL * 0.55)} Q${cx},${f1(lowEdgeY + tL * 0.8)} ${f1(cx + w * 0.4)},${f1(lowEdgeY + tL * 0.55)}" stroke="#ffb0e0" stroke-opacity="0.65" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>`;
  const upperLipSvg = `<g id="lip_upper"><path d="${upperLip}" fill="#c43a96" ${lipS}/><path d="M${f1(cx - w * 0.5)},${f1(cy - tU + 1)} Q${f1(cx - 8)},${f1(cy - tU - 3)} ${f1(cx - 2)},${f1(cy - tU + 2)}" stroke="#ffb0e0" stroke-opacity="0.6" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  return { cavity: `<clipPath id="${clipId}"><path d="${cavity}"/></clipPath><path d="${cavity}" fill="#50081c" stroke="#2a0510" stroke-width="2"/>`, teethU, teethL, tongue, fv, lowerLipSvg, upperLipSvg,
    all: `<g id="mouth">${h > 1.5 ? `<clipPath id="${clipId}"><path d="${cavity}"/></clipPath><path d="${cavity}" fill="#50081c" stroke="#2a0510" stroke-width="2"/>${tongue}${teethU}${teethL}` : ''}${lowerLipSvg}${upperLipSvg}${fv}</g>` };
}
export function part_head(P) { const hd = P.head; const jd = jawDrop(P) * 0.0;
  const eL = part_eye('L', P), eR = part_eye('R', P);
  return `<g id="head" transform="${rot(hd.rot, SK.head)} ${mv(hd.yaw * 6, hd.pitch * 8)}">${part_ear('L', P)}${part_ear('R', P)}${part_face(P)}${part_cheeks(P)}${eL.all}${eR.all}${part_brow('L', P)}${part_brow('R', P)}${part_nose(P)}${part_mouth(P).all}${hairFront(P)}${part_earring('L', P)}${part_earring('R', P)}</g>`; }
export function part_earring(side, P) { const x = side === 'L' ? 380 : 641, a = side === 'L' ? P.acc.earL : P.acc.earR; return `<g id="earring_${side}" transform="${rot(a, [x, 332])}"><circle cx="${x}" cy="332" r="7" fill="url(#zGold)" stroke="${OUT}" stroke-width="3"/><path d="M${x},339 v14" stroke="${C.goldD}" stroke-width="4"/><circle cx="${x}" cy="356" r="6.5" fill="url(#zGold)" stroke="${OUT}" stroke-width="3"/><path d="M${x},364 l-15,22 l15,22 l15,-22Z" fill="url(#zGold)" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M${x},364 l-6,22 l6,10" stroke="#fff6b0" stroke-width="3" fill="none" opacity="0.8"/></g>`; }

// ================= CUERPO: cuello, pecho, corse, abdomen =================
export function part_neck(P) { return `<g id="neck"><path d="M480,400 L544,400 L548,462 Q512,482 476,462Z" fill="url(#zSkin)" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/><path d="M478,420 Q512,452 546,420 L546,440 Q512,466 478,440Z" fill="#8f4f2b" opacity="0.28"/></g>`; }
export function part_chest(P) { return `<g id="torso_chest"><path d="M440,470 Q476,452 512,462 Q548,452 584,470 C600,478 606,500 602,548 L428,548 C424,500 430,478 440,470Z" fill="url(#zSkin)" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/><path d="M470,474 Q494,486 508,480 M554,474 Q530,486 516,480" stroke="#8f4f2b" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6"/><path d="M468,480 Q490,492 506,486 M556,480 Q534,492 518,486" stroke="#f0b080" stroke-width="3" fill="none" opacity="0.5" transform="translate(0,4)"/></g>`; }
const CORSET = 'M429,550 C440,534 458,532 476,540 Q494,548 512,556 Q530,548 548,540 C566,532 584,534 597,550 C601,590 598,640 584,686 Q512,696 440,686 C427,640 425,590 429,550Z';
export function part_corset(P) { const bones = [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].map((k) => `<path d="M${f1(512 + k * 76)},${k === 0 ? 556 : 546} C${f1(512 + k * 82)},600 ${f1(512 + k * 66)},650 ${f1(512 + k * 66)},688" stroke="#2a0006" stroke-opacity="0.5" stroke-width="3.4" fill="none"/>`).join('');
  return `<g id="corset"><path d="${CORSET}" fill="url(#zCor)" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/><clipPath id="corClip"><path d="${CORSET}"/></clipPath><g clip-path="url(#corClip)">${bones}<path d="M446,560 C444,600 450,640 458,684" stroke="#e0505a" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M429,550 C440,534 458,532 476,540 Q494,548 512,556 Q530,548 548,540 C566,532 584,534 597,550" stroke="#e0505a" stroke-opacity="0.5" stroke-width="5" fill="none"/><path d="M580,560 C586,610 580,650 574,686" stroke="#20000a" stroke-opacity="0.35" stroke-width="12" fill="none" stroke-linecap="round"/></g></g>`; }
export function part_midriff(P) { return `<g id="midriff"><path d="M441,684 Q512,694 583,684 L586,716 Q512,726 438,716Z" fill="url(#zSkin)" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="512" cy="704" rx="6" ry="8" fill="#5a2e18" opacity="0.7"/><path d="M505,696 q7,-5 14,0" stroke="#f0b080" stroke-width="2.4" fill="none" opacity="0.5"/></g>`; }
export function part_necklace(P) { const a = P.acc.pendant; const beads = [-62, -46, -30, -14, 0, 14, 30, 46, 62].map((x) => { const y = 456 + 24 * (1 - Math.pow(x / 66, 2)); return `<circle cx="${512 + x}" cy="${f1(y)}" r="${x % 28 === 0 ? 7 : 5.5}" fill="url(#zGold)" stroke="${OUT}" stroke-width="2.4"/>`; }).join('');
  return `<g id="necklace"><path d="M446,452 Q512,520 578,452" stroke="${C.goldD}" stroke-width="3.4" fill="none" opacity="0.9"/>${beads}<g id="pendant" transform="${rot(a, [512, 490])}"><path d="M512,488 v10" stroke="${C.goldD}" stroke-width="3.4"/><path d="M512,496 l-15,20 l15,26 l15,-26Z" fill="#d1182f" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M512,496 l-6,20 l6,12" stroke="#ffb0b8" stroke-width="3" fill="none" opacity="0.85"/><path d="M497,516 h30" stroke="#7a0a18" stroke-width="2"/></g></g>`; }

// ================= BRAZOS Y MANOS (cadena 2 pasadas: contorno + relleno => silueta continua sin cortes) =================
const HANDK = { index: { k: [17, 70], len: [27, 23], rot: -7, w: 15 }, middle: { k: [3, 74], len: [30, 25], rot: -1, w: 15.5 }, ring: { k: [-11, 72], len: [27, 22], rot: 5, w: 14.5 }, pinky: { k: [-23, 66], len: [21, 18], rot: 12, w: 13 }, thumb: { k: [24, 24], len: [25, 21], rot: -30, w: 17 } };
export function part_hand(side, P, pass, only = null) { const sd = side === 'L' ? 1 : -1; const H = side === 'L' ? P.handL : P.handR; const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky']; const ow = pass === 'o' ? 9 : 0;
  const W = (x) => x * sd;
  const palm = `M${W(-27)},-2 C${W(-35)},28 ${W(-33)},58 ${W(-25)},74 Q${W(0)},88 ${W(27)},74 C${W(35)},58 ${W(35)},28 ${W(27)},-2Z`;
  const fill = pass === 'o' ? OUT : 'url(#zSkin)'; const stroke = pass === 'o' ? `stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"` : '';
  let s = (!only || only.includes('palm')) ? `<path d="${palm}" fill="${fill}" ${stroke}/>` : '';
  fingers.forEach((fn, i) => { if (only && !only.includes(fn)) return; const F = HANDK[fn]; const cv = clamp(H.curl[i]); const wig = Math.sin(H.t * 9 + i * 1.3) * H.wig * (fn === 'thumb' ? 8 : 14);
    const a1 = (F.rot * sd * (1 + 0)) + (i - 2) * H.spread * 9 * -sd * (fn === 'thumb' ? 0 : 1) + wig, a2 = -sd * cv * 38 * (fn === 'thumb' ? 0.6 : 1) + wig * 0.6; const l1 = F.len[0] * (1 - cv * 0.12), l2 = F.len[1] * (1 - cv * 0.28);
    const seg1 = `M${-F.w / 2},0 L${-F.w * 0.46},${l1} L${F.w * 0.46},${l1} L${F.w / 2},0Z`, seg2 = `M${-F.w * 0.46},0 L${-F.w * 0.38},${l2 - F.w * 0.38} A${F.w * 0.38},${F.w * 0.38} 0 0 0 ${F.w * 0.38},${l2 - F.w * 0.38} L${F.w * 0.46},0Z`;
    const nail = `<path d="M${-F.w * 0.28},${l2 - F.w * 0.8 - 6} Q0,${l2 - F.w * 0.8 - 11} ${F.w * 0.28},${l2 - F.w * 0.8 - 6} L${F.w * 0.24},${l2 - F.w * 0.38} Q0,${l2 - 1} ${-F.w * 0.24},${l2 - F.w * 0.38}Z" fill="#f08ab8" stroke="#8a2e5e" stroke-width="1.4"/>`;
    const jnt = pass === 'f' ? `<path d="M${-F.w * 0.4},${l1 - 1} h${F.w * 0.8}" stroke="#7a4426" stroke-width="2.2" opacity="0.7"/>` : '';
    s += `<g transform="translate(${W(F.k[0])},${F.k[1] - (fn === 'thumb' ? 0 : 6)}) rotate(${f1(a1)})"><path d="${seg1}" fill="${fill}" ${stroke}/><g transform="translate(0,${l1}) rotate(${f1(a2)})"><path d="${seg2}" fill="${fill}" ${stroke}/>${pass === 'f' ? nail : ''}</g>${jnt}</g>`; });
  if (pass === 'f' && (!only || only.includes('palm'))) s += `<path d="M${W(-18)},30 Q${W(0)},40 ${W(18)},30" stroke="#8f4f2b" stroke-opacity="0.35" stroke-width="3" fill="none"/>`;
  return s; }
export function part_arm(side, P, pass) { const S = SK['shoulder' + side], E = SK['elbow' + side], Wr = SK['wrist' + side], A = side === 'L' ? P.armL : P.armR;
  const up = taper(S, E, 56, 44), fo = taper(E, Wr, 44, 34); const fill = 'url(#zSkin)';
  const cap = pass === 'f' ? `<circle cx="${S[0]}" cy="${S[1] + 4}" r="26" fill="url(#zFace)"/>` : '';
  const brace = `<g transform="translate(${Wr[0]},${Wr[1] - 10})"><ellipse rx="24" ry="8" fill="url(#zGold)" stroke="${OUT}" stroke-width="3.6"/><ellipse cx="0" cy="-2" rx="20" ry="3.4" fill="#fff6b0" opacity="0.6"/></g>`;
  const handG = `<g transform="${rot(A.wrist, Wr)}"><g transform="translate(${Wr[0]},${Wr[1] + 2})">${part_hand(side, P, pass)}</g></g>`;
  const shade = pass === 'f' ? `<path d="${up}" fill="url(#zSkin)" opacity="0.0"/>` : '';
  const elbowShade = pass === 'f' ? `<ellipse cx="${E[0] + (side === 'L' ? -8 : 8)}" cy="${E[1] + 2}" rx="12" ry="9" fill="#8f4f2b" opacity="0.2"/>` : '';
  return `<g transform="${rot(A.r1, S)}">${seg(up, pass, fill)}${shade}<g transform="${rot(A.r2, E)}">${seg(fo, pass, fill)}${elbowShade}${handG}${pass === 'f' ? brace : ''}</g>${cap}</g>`; }
export function arms(P, which) { const sides = which || ['L', 'R']; return sides.map((s) => `<g id="arm_${s}">${part_arm(s, P, 'o')}${part_arm(s, P, 'f')}</g>`).join(''); }

// ================= PIERNAS Y PIES =================
export function part_leg(side, P, pass) { const H = SK['hip' + side], K = SK['knee' + side], A = SK['ankle' + side], L = side === 'L' ? P.legL : P.legR; const th = taper(H, K, 84, 58), sh = taper(K, A, 56, 34);
  const foot = `<g transform="${rot(L.foot, A)}">${part_foot(side, pass)}</g>`;
  return `<g transform="${rot(L.r1, H)}">${seg(th, pass, 'url(#zSkin)')}<g transform="${rot(L.r2, K)}">${seg(sh, pass, 'url(#zSkin)')}${pass === 'f' ? `<ellipse cx="${K[0] - 6}" cy="${K[1]}" rx="18" ry="12" fill="#8f4f2b" opacity="0.2"/>` : ''}${foot}</g></g>`; }
export function part_foot(side, pass) { const A = SK['ankle' + side]; const x = A[0], y = A[1]; const body = `M${x - 17},${y - 6} C${x - 22},${y + 40} ${x - 32},${y + 70} ${x - 32},${y + 92} Q${x},${y + 108} ${x + 32},${y + 92} C${x + 32},${y + 70} ${x + 22},${y + 40} ${x + 17},${y - 6}Z`;
  const o = pass === 'o'; let s = `<path d="${body}" fill="${o ? OUT : 'url(#zSkin)'}" ${o ? `stroke="${OUT}" stroke-width="9" stroke-linejoin="round"` : ''}/>`;
  if (!o) { for (let i = 0; i < 5; i++) { const tx = x - 24 + i * 12, ty = y + 100 - Math.abs(i - 2) * 1.5, r = 9 - i * 0.4 * 0 - (i === 4 ? 1.5 : 0); s += `<circle cx="${tx}" cy="${ty}" r="${r}" fill="url(#zSkin)" stroke="${OUT}" stroke-width="3"/><ellipse cx="${tx}" cy="${ty + 2}" rx="4" ry="3" fill="#f08ab8"/>`; }
    s += `<path d="M${x - 26},${y + 98} Q${x},${y + 116} ${x + 26},${y + 98} L${x + 30},${y + 112} Q${x},${y + 128} ${x - 30},${y + 112}Z" fill="${C.redD}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><path d="M${x - 17},${y + 2} Q${x},${y + 12} ${x + 17},${y + 2} L${x + 19},${y + 20} Q${x},${y + 30} ${x - 19},${y + 20}Z" fill="url(#zSk)" stroke="${OUT}" stroke-width="4"/><rect x="${x + 6}" y="${y + 3}" width="10" height="14" rx="2" fill="url(#zGold)" stroke="${OUT}" stroke-width="2.4"/><path d="M${x - 28},${y + 66} Q${x},${y + 78} ${x + 28},${y + 66} L${x + 28},${y + 78} Q${x},${y + 90} ${x - 28},${y + 78}Z" fill="url(#zSk)" stroke="${OUT}" stroke-width="4"/><path d="M${x},${y + 24} L${x},${y + 68}" stroke="${C.redD}" stroke-width="7"/><path d="M${x},${y + 24} L${x},${y + 68}" stroke="${OUT}" stroke-width="2" opacity="0.5"/>`; }
  return s; }
export function legs(P) { return `<g id="leg_L">${part_leg('L', P, 'o')}${part_leg('L', P, 'f')}</g><g id="leg_R">${part_leg('R', P, 'o')}${part_leg('R', P, 'f')}</g>`; }

// ================= FALDA (paneles, olanes, rosetón; reacciona al movimiento) =================
function cr(pts, n = 8) { const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
  for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); } } out.push(pts[pts.length - 1]); return out; }
const LEFT_SIL = [[441, 706], [432, 800], [418, 950], [392, 1100], [340, 1250], [270, 1400], [215, 1495]];
const SLIT_L = [[548, 1000], [540, 1100], [522, 1250], [478, 1400], [432, 1498]];
const RUF_IN = [[606, 790], [630, 900], [640, 1000], [660, 1150], [700, 1300], [750, 1420], [790, 1495]];
const RUF_OUT = [[690, 800], [690, 900], [696, 1000], [715, 1150], [755, 1300], [800, 1420], [832, 1495]];
const u_of = (y) => clamp((y - 705) / 790);
function skirtOff(P, p, side) { const S = P.skirt, u = u_of(p[1]); const sw = side === 'L' ? S.swayL : S.swayR; return [p[0] + Math.pow(u, 1.5) * sw + Math.sin(S.t * 3 + p[0] * 0.01) * S.hem * Math.pow(u, 2) * 6, p[1] + Math.sin(S.t * 2.2 + p[0] * 0.02) * S.hem * Math.pow(u, 2) * 4]; }
const pth = (pts) => 'L' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L');
function hemPts(P, x0, x1, side, n = 14) { const out = []; for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); out.push(skirtOff(P, [x, 1496 + 12 * Math.sin(x * 0.035) + 6 * Math.cos(x * 0.09)], side)); } return out; }
export function part_skirt_back(P) { const L = cr(LEFT_SIL, 6).map((p) => skirtOff(P, p, 'L')), R = cr(RUF_OUT, 6).map((p) => skirtOff(P, p, 'R')).reverse(); const hem = hemPts(P, 215, 832, 'L', 26);
  const d = `M441,706 ${pth(L)} ${pth(hem)} ${pth(R)} L598,706Z`;
  return `<g id="skirt_back"><path d="${d}" fill="${C.redDD}" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/></g>`; }
export function part_slit_inner(P) { const a = cr(SLIT_L, 6).map((p) => skirtOff(P, p, 'L')), b = cr(RUF_IN.slice(2), 6).map((p) => skirtOff(P, p, 'R')).reverse(); const hem = hemPts(P, 432, 790, 'R', 10);
  return `<g id="slit_inner"><path d="M548,1000 ${pth(a.slice(1))} ${pth(hem)} ${pth(b)}Z" fill="#26040a"/></g>`; }
export function part_skirt_panel(P) { const L = cr(LEFT_SIL, 6).map((p) => skirtOff(P, p, 'L')), hem = hemPts(P, 215, 432, 'L', 10), S = cr(SLIT_L, 6).map((p) => skirtOff(P, p, 'L')).reverse();
  const top = cr([[548, 1000], [566, 900], [590, 800], [598, 712]], 6).map((p) => skirtOff(P, p, 'R'));
  const d = `M441,706 ${pth(L)} ${pth(hem)} ${pth(S)} ${pth(top)} L598,706Z`; const clip = `<clipPath id="panelClip"><path d="${d}"/></clipPath>`;
  const fold = (a, b, c, d2, w, col, op) => `<path d="M${a},${b} Q${(a + c) / 2 - 30},${(b + d2) / 2 - 10} ${c},${d2}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
  const folds = [[596, 760, 470, 1010], [596, 780, 430, 1220], [590, 800, 380, 1380], [596, 740, 500, 960], [560, 900, 470, 1180]].map(([a, b, c, e], i) => fold(a, b, c, e, 14 + (i % 3) * 5, '#3a0309', 0.5) + fold(a + 14, b + 6, c + 12, e - 4, 7, '#ff6070', 0.28)).join('');
  const sh = `<path d="M441,706 C432,800 418,950 392,1100" stroke="#ff8090" stroke-opacity="0.25" stroke-width="22" fill="none" stroke-linecap="round" transform="translate(14,0)"/>`;
  return `<g id="skirt_panel_left">${clip}<path d="${d}" fill="url(#zSk)" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><g clip-path="url(#panelClip)">${folds}${sh}</g></g>`; }
export function part_skirt_ruffle(P, only = null) { const N = 7; let out = ''; const ins = cr(RUF_IN, 8), outs = cr(RUF_OUT, 8); const at = (arr, y) => { let b = arr[0]; for (const p of arr) if (p[1] <= y) b = p; return b; };
  const ys = [...Array(N + 1)].map((_, i) => lerp(790, 1495, i / N));
  for (let i = N - 1; i >= 0; i--) { if (only !== null && only !== i) continue; const y0 = ys[i], y1 = Math.min(1500, ys[i + 1] + 26), sw = (p) => skirtOff({ ...P, skirt: { ...P.skirt, swayR: P.skirt.swayR * (1 + i * 0.12) } }, p, 'R'); const wob = Math.sin(P.skirt.t * 3.2 + i * 0.9) * P.skirt.ruffle * (4 + i * 1.6);
    const a = sw([at(ins, y0)[0], y0]), b = sw([at(outs, y0)[0], y0]), c = sw([at(outs, y1)[0] + 12 + i * 2 + wob, y1]), d = sw([at(ins, y1)[0] - 6 + wob * 0.5, y1 + 4]);
    const mid = sw([(c[0] + d[0]) / 2, y1 + 22 + wob * 0.5]);
    const dd = `M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])} Q${f1(b[0] + 10)},${f1((b[1] + c[1]) / 2)} ${f1(c[0])},${f1(c[1])} Q${f1(mid[0] + 14)},${f1(mid[1] + 10)} ${f1(mid[0])},${f1(mid[1])} Q${f1(d[0] - 10)},${f1(d[1] + 8)} ${f1(d[0])},${f1(d[1])} Q${f1(a[0] - 6)},${f1((a[1] + d[1]) / 2)} ${f1(a[0])},${f1(a[1])}Z`;
    out += `<path d="${dd}" fill="${i % 2 ? '#a50a1e' : '#c61a2e'}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><path d="M${f1(a[0] + 8)},${f1(a[1] + 10)} Q${f1((a[0] + b[0]) / 2)},${f1(a[1] + 24)} ${f1(b[0] - 6)},${f1(b[1] + 12)}" stroke="#ff7a88" stroke-opacity="0.5" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${f1(d[0] + 10)},${f1(d[1] - 6)} Q${f1(mid[0])},${f1(mid[1] - 4)} ${f1(c[0] - 10)},${f1(c[1] - 6)}" stroke="#4a0008" stroke-opacity="0.45" stroke-width="7" fill="none" stroke-linecap="round"/>`; }
  return `<g id="skirt_ruffle">${out}</g>`; }
export function part_rosette(P) { const o = skirtOff(P, [598, 745], 'R'); return `<g id="skirt_rosette" transform="translate(${f1(o[0])},${f1(o[1])})"><circle r="38" fill="#5a050e" stroke="${OUT}" stroke-width="6"/><circle r="31" fill="#a00c1f" stroke="#3a0309" stroke-width="3"/><circle r="22" fill="#c8202f" stroke="#3a0309" stroke-width="3"/><path d="M-15,3 a15,15 0 1,1 17,14 a9,9 0 1,1 -10,-10 a4,4 0 1,1 4,4" stroke="#4a0008" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-26,-14 Q0,-38 28,-16" stroke="#ff8a96" stroke-opacity="0.55" stroke-width="5" fill="none" stroke-linecap="round"/></g>`; }
export function part_waistband(P) { return `<g id="waistband"><path d="M440,704 Q512,716 600,704 L602,724 Q512,736 438,724Z" fill="url(#zSk)" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><path d="M452,712 Q512,722 590,712" stroke="#ff7a88" stroke-opacity="0.4" stroke-width="4" fill="none"/></g>`; }

// ================= ENSAMBLE =================
// ---- Cabeza y pelo ORIGINALES de Lazy (rostro, ojos, cejas, nariz, boca, dientes, rizos HD) montados sobre el cuerpo nuevo ----
const LOOK = { shade: 'match', mole: 0, found: 0, contour: 0.9, highlight: 0.8, blush: 0.7, shadow: 1, swL: 1, swR: 1, liner: 1, linerL: 1, linerR: 1, lsL: 1, lsR: 1, lash: 0.9, cols: { blush: '#e06a7a', contour: '#3a1608', shadow: ['#4b2a73', '#9d6be0', '#f0d8ff'], inner: '#f6ecff', hl: '#ffe6c2', liner: '#120818' }, wide: 1, lift: 1, thick: 5, wing: 1, sparkle: 0, glitter: 0 };
export const HEAD_SCALE = 0.84, HEAD_POS = [512, 262];
export function oldHeadPose(P, withFace = true) { const e = P.eyes, b = P.brows, m = P.mouth, h = P.hair; const hs = (h.swayL + h.swayR) / 2;
  const br = (raise, fr) => ({ r: clamp(raise * 0.9, -1, 1), i: clamp(raise * 0.9 - fr * 0.9, -1, 1) });
  return { yaw: P.head.yaw, pitch: P.head.pitch * 0.3, roll: 0, bob: 0, sway: 0, breath: P.chest.breath, shoulders: 0, flare: 0, squint: e.squint, tears: 0, tearT: 0, gaze: { x: e.lookX, y: e.lookY },
    lid: { l: 1 + e.wide * 0.25, r: 1 + e.wide * 0.25 }, blink: { l: e.blinkL, r: e.blinkR }, brow: { l: br(b.Lraise, b.Lfrown), r: br(b.Rraise, b.Rfrown) },
    mouth: { open: clamp(m.open), wide: m.round > 0.5 ? -0.8 * m.round : clamp(m.wide, -1, 1), smile: m.smile, asym: 0, press: m.press || 0, teeth: { clean: 1, braces: 0, crooked: 0, extra: 0, shine: true }, lip: '#b0206a', tstyle: 'A' },
    skin: { acne: 0, mask: 0, dry: 0, foam: 0, patch: 0, glow: 1, red: 0 }, lidColor: lidColor(), hair: { hd: 'long', len: 0.82, shine: 1, cp: 1, grow: 1, ...(P.hairOv || {}), bounce: h.bounce, wind: 0, sway: clamp(hs / 18 + Math.sin(h.t * 1.3) * 0.12, -0.6, 0.6) },
    frontHair: true, noseStyle: P.noseStyle, noseK: P.noseK, makeup: LOOK, browStyle: { k: 1, kl: 1, kr: 1, red: 0, shortL: 0 }, fem: 1, skinTex: { tex: 'glass', shape: 'A' }, slim: 3.8, outfit: { kind: 'gown', prog: 1, jewel: 1 }, faceWrinkle: 0,
    faceSvg: withFace ? `<g transform="scale(${f1(1000 / (HEAD_SCALE * 0.8)) / 1000},${f1(1000 / (HEAD_SCALE * 0.86)) / 1000}) translate(${-HEAD_POS[0]},${-HEAD_POS[1]})">${part_ear('L', P)}${part_ear('R', P)}${part_face(P, lidColor())}</g>` : undefined }; }
let LIDC = null;
function lidColor() { if (LIDC) return LIDC; const P = defaultPose(); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">${oldDefs('e3d')}${DEFS}${part_face(P, 'url(#skin)')}</svg>`;
  const im = new Resvg(svg).render(), px = im.pixels; let R = 0, G = 0, B = 0, n = 0; for (const [x, y] of [[460, 219], [564, 219], [460, 298], [564, 298], [460, 258], [564, 258]]) { const i = (y * im.width + x) * 4; R += px[i]; G += px[i + 1]; B += px[i + 2]; n++; }
  LIDC = '#' + [R, G, B].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join(''); return LIDC; }
const headWrap = (P, inner) => `<g transform="${rot(P.head.rot, SK.neck)} translate(${HEAD_POS[0]},${HEAD_POS[1]}) scale(${HEAD_SCALE})">${inner}</g>`;
export const headBack = (P) => headWrap(P, drawLazyHeadBack(oldHeadPose(P)));
export const headFront = (P) => headWrap(P, drawLazyHeadFront(oldHeadPose(P)));
export const ALLDEFS = DEFS + oldDefs('e3d');

export const PART_FNS = { hair_back: hairBack, hair_front: hairFront, head: part_head, neck: part_neck, torso_chest: part_chest, corset: part_corset, midriff: part_midriff, necklace: part_necklace, skirt_back: part_skirt_back, slit_inner: part_slit_inner, skirt_panel_left: part_skirt_panel, skirt_ruffle: part_skirt_ruffle, skirt_rosette: part_rosette, waistband: part_waistband, legs, arms };
export function hipsT(P) { return `${mv(P.hips.x, P.hips.y)} ${rot(P.hips.rot, SK.hips)}`; }
export function chestT(P) { const b = P.chest.breath; return `${rot(P.chest.rot, SK.chest)} translate(512,640) scale(${f1((1 + 0.006 * b) * 1000) / 1000},${f1((1 + 0.012 * b) * 1000) / 1000}) translate(-512,-640)`; }
export function renderCharacter(P) {
  const HT = hipsT(P), CT = chestT(P);
  return `<g id="lazy2d">
  <g transform="${HT}">${part_skirt_back(P)}${part_slit_inner(P)}${legs(P)}${part_skirt_panel(P)}${part_skirt_ruffle(P)}${part_rosette(P)}${part_midriff(P)}${part_waistband(P)}</g>
  <g transform="${HT} ${CT}">${part_neck(P)}${headBack(P)}${part_chest(P)}${part_corset(P)}${part_necklace(P)}${headFront(P)}</g>
  <g transform="${HT} ${CT}">${arms(P)}</g></g>`;
}
export function svgDoc(inner, w = 1024, h = 1536, vb = null) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb || `0 0 1024 1536`}">${ALLDEFS}${inner}</svg>`; }
