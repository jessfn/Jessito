// Rig de Lazy Dawns: personaje articulado (cuello, hombros, codos, muñecas con IK), cara con parpadeo,
// miradas, cejas, boca por visemas, mejillas/pliegues (pomulos, mandibula) y respiracion.
import { hand, foot } from './lazy_lib.mjs';

const OUT = '#12090a';
const O8 = `stroke="${OUT}" stroke-width="8" stroke-linejoin="round"`;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const SKIN = 'url(#skin)', SKINB = 'url(#skinB)', SHIRT = 'url(#shirt)', PANTS = 'url(#pants)', HAIR = 'url(#hair)';
const LID = '#a1613a';

// ---------- IK de 2 huesos (hombro -> codo -> mano) ----------
const L1 = 165, L2 = 145;
export function solveArm(side, target) {
  const S = { x: side * 296, y: 58 };
  let dx = target.x - S.x, dy = target.y - S.y;
  let d = Math.hypot(dx, dy); const dmax = L1 + L2 - 2, dmin = Math.abs(L1 - L2) + 2;
  const dc = clamp(d, dmin, dmax); if (d > 0) { dx *= dc / d; dy *= dc / d; } d = dc;
  const base = Math.atan2(dy, dx);
  const A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const cands = [base + A, base - A].map((a) => ({ a, ex: S.x + L1 * Math.cos(a) }));
  // el codo se dobla hacia afuera del cuerpo
  const pick = side < 0 ? (cands[0].ex < cands[1].ex ? cands[0] : cands[1]) : (cands[0].ex > cands[1].ex ? cands[0] : cands[1]);
  const a1 = pick.a; const ex = S.x + L1 * Math.cos(a1), ey = S.y + L1 * Math.sin(a1);
  const a2 = Math.atan2(S.y + dy - ey, S.x + dx - ex);
  const deg = (r) => (r * 180) / Math.PI;
  return { S, rot1: deg(a1) - 90, rot2: deg(a2) - deg(a1) };
}

// ---------- cara ----------
function eyeSvg(x, open, blink, squint, gx, gy, tear, tearT, side) {
  const o = clamp(open * (1 - blink), 0, 1.25);
  const c = 1 - Math.min(o, 1);                 // 0 abierto .. 1 cerrado
  const yu = -44 + c * 50;                      // borde del parpado superior
  const yl = 46 - squint * 26 - c * 8;          // borde del parpado inferior
  const lashY = Math.max(yu, -30);
  const ctrl = lerp(-34, 18, c);
  const ix = gx * 13, iy = gy * 10 + 4;
  const tearDrop = tear > 0.5 ? `<path d="M${side * 22},${yl + ((tearT * 0.9) % 1) * 70} q7,12 0,20 q-7,-8 0,-20Z" fill="#bfe9ff" stroke="#fff" stroke-width="2" opacity="${clamp((tear - 0.5) * 3)}"/>` : '';
  const ticks = c < 0.65 ? [-30, -12, 8, 26].map((lx) => `<path d="M${lx},${lashY - 4 + (ctrl + 10) * 0.45 * (1 - c)} l${-4 * side},-13" stroke="${OUT}" stroke-width="5" stroke-linecap="round" opacity="${1 - c * 1.4}"/>`).join('') : '';
  return `<g transform="translate(${x},-6)">
    <ellipse rx="36" ry="40" fill="#fff"/>
    <g clip-path="url(#eyeClip)">
      <ellipse rx="36" ry="40" fill="#000" opacity="0.08" cy="14"/>
      <g transform="translate(${ix},${iy}) scale(${1 - Math.abs(gx) * 0.12},1)"><circle r="22" fill="url(#eye)"/><circle r="11" fill="#0a0503"/><circle cx="8" cy="-9" r="7" fill="#fff"/><circle cx="-6" cy="10" r="3.5" fill="#fff" opacity="0.8"/></g>
      ${tear > 0.2 ? `<ellipse cx="0" cy="${yl - 2}" rx="34" ry="${4 + tear * 5}" fill="#dff3ff" opacity="${0.35 + tear * 0.4}"/>` : ''}
      <path d="M-46,-62 L46,-62 L46,${yu} Q0,${yu + ctrl * 0.0 + lerp(-16, 8, c)} -46,${yu}Z" fill="${LID}"/>
      <path d="M-46,70 L-46,${yl} Q0,${yl + 10} 46,${yl} L46,70Z" fill="${LID}"/>
    </g>
    <ellipse rx="36" ry="40" fill="none" stroke="${OUT}" stroke-width="7"/>
    <path d="M-40,${lashY + 10} Q0,${lashY + ctrl} 40,${lashY + 10}" stroke="${OUT}" stroke-width="9" fill="none" stroke-linecap="round"/>
    ${ticks}${tearDrop}
    <ellipse cy="48" rx="34" ry="${12 + squint * 8}" fill="#3d1f0e" opacity="${0.4 + squint * 0.2}"/>
  </g>`;
}
function browSvg(side, r, i) {
  const dy = -r * 24;
  const o = { x: side * 132, y: -62 + dy + i * 12 };
  const a = { x: side * 70, y: -108 + dy - i * 6 };
  const n = { x: side * 6, y: -62 + dy - i * 28 };
  return `<path d="M${o.x},${o.y} Q${a.x},${a.y} ${n.x},${n.y} L${n.x},${n.y + 20} Q${a.x},${a.y + 30} ${o.x},${o.y + 6}Z" fill="#0f0a08" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>`;
}
function mouthSvg(m, yaw) {
  const open = clamp(m.open, 0, 1), wide = m.wide, smile = m.smile, asym = m.asym || 0, press = m.press || 0;
  const w = 78 * (1 + 0.22 * wide + 0.12 * smile);
  const cl = { x: -w, y: -smile * 24 - asym * 8 + press * 3 };
  const cr = { x: w, y: -smile * 24 + asym * 8 + press * 3 };
  const mid = (cl.y + cr.y) / 2;
  const up = mid + 6 - open * 6;
  const lo = mid + 8 + open * 150 * (1 - 0.3 * Math.max(0, wide)) + (smile > 0.5 ? 14 : 0);
  const shape = `M${cl.x},${cl.y} Q0,${up} ${cr.x},${cr.y} Q0,${lo} ${cl.x},${cl.y}Z`;
  const showTeeth = open > 0.1 || smile > 0.35;
  const teeth = [[-56, 0, -10, 24], [-30, 3, -3, 22], [-6, 5, 5, 30], [20, 3, -6, 20], [42, 0, 12, 26]].map(([x, y, r, h], k) => `<rect x="${x}" y="${y - 2 + (smile > 0.35 && open < 0.1 ? 6 : 0)}" width="22" height="${h}" rx="6" fill="${['#e3cf6a', '#d4be52', '#e8d77a', '#c6b04a', '#dcc860'][k]}" stroke="${OUT}" stroke-width="3" transform="rotate(${r} ${x + 11} ${y})"/>`).join('');
  return `<g>
    <clipPath id="mouthClip"><path d="${shape}"/></clipPath>
    <path d="${shape}" fill="#4a0f12"/>
    <g clip-path="url(#mouthClip)">${showTeeth ? teeth : ''}${open > 0.35 ? `<ellipse cx="0" cy="${lo * 0.62}" rx="${w * 0.55}" ry="${22 + open * 14}" fill="#c4505e"/>` : ''}</g>
    <path d="${shape}" fill="none" stroke="#7b2a2a" stroke-width="${12 + press * 4}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${shape}" fill="none" stroke="${OUT}" stroke-width="3" opacity="0.5"/>
    ${press > 0.4 ? `<path d="M${-w - 6},${cl.y - 6} q-6,8 0,16 M${w + 6},${cr.y - 6} q6,8 0,16" stroke="#3a1d10" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6"/>` : ''}
  </g>`;
}

const PIMPLES = [[-75, -20, 15], [62, -42, 13], [108, 26, 16], [-118, 38, 12], [24, 56, 14], [-34, -78, 12], [88, -96, 13], [-98, -92, 11], [2, -4, 10], [54, 100, 12], [-60, 92, 10], [130, -20, 9]]
  .map(([x, y, r]) => `<g transform="translate(${x},${y})"><circle r="${r + 4}" fill="#8f1d14" opacity="0.35"/><circle r="${r}" fill="#d6453a" stroke="${OUT}" stroke-width="3"/><circle r="${r * 0.55}" cx="${-r * 0.25}" cy="${-r * 0.25}" fill="#ffb3a6" opacity="0.8"/><circle r="${r * 0.25}" cx="${-r * 0.3}" cy="${-r * 0.35}" fill="#fff"/></g>`).join('');
const CURLS = (() => { const a = []; for (let i = 0; i < 26; i++) { const t = Math.PI * (1.05 + (i / 25) * 0.9), r = 200 + (i % 3) * 18; a.push(`<circle cx="${Math.cos(t) * r * 1.02}" cy="${Math.sin(t) * r * 0.95 - 8}" r="${46 + (i % 4) * 7}" fill="${HAIR}" ${O8}/>`); } return a.join(''); })();
const HAIRHI = `<g opacity="0.35">${[...Array(8)].map((_, i) => `<path d="M${-150 + i * 40},${-215 - (i % 3) * 14} q25,-20 44,2" stroke="#9a8782" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</g>`;

function headSvg(p) {
  const yaw = p.yaw || 0, jaw = clamp(p.mouth.open, 0, 1) * 26;
  const sm = clamp(p.mouth.smile, -1, 1), up = Math.max(0, sm);
  const fx = yaw * 26;                                   // desplazamiento de rasgos por giro de cabeza
  const squint = clamp(p.squint + up * 0.45, 0, 1);      // AU6: mejillas suben al sonreir de verdad
  const brL = p.brow.l, brR = p.brow.r;
  const furrow = Math.max(0, -(brL.i + brR.i) / 2);
  const wrinkle = Math.max(0, (brL.r + brR.r) / 2 - 0.35);
  const ear = (s) => `<ellipse cx="${s * (205 + (s > 0 ? -yaw * 24 : -yaw * 12))}" cy="8" rx="${32 * (s > 0 ? 1 - 0.3 * Math.max(0, yaw) : 1 + 0.1 * Math.max(0, yaw))}" ry="50" fill="${SKINB}" ${O8}/>`;
  return `<g>
    <ellipse cx="${yaw * 6}" cy="${60 + jaw * 0.6}" rx="188" ry="${170 + jaw * 0.6}" fill="${SKINB}" ${O8}/>
    <ellipse cx="${yaw * 4}" cy="${150 + jaw * 0.9}" rx="130" ry="22" fill="#000" opacity="0.16" filter="url(#blur8)"/>
    <ellipse cx="${yaw * 4}" cy="0" rx="208" ry="210" fill="${SKIN}" ${O8}/>
    <ellipse cx="${-70 + yaw * 10}" cy="-70" rx="110" ry="80" fill="#fff" opacity="0.13" filter="url(#blur20)"/>
    <ellipse cx="${90 + yaw * 10}" cy="${130 + jaw * 0.6}" rx="150" ry="70" fill="#000" opacity="0.18" filter="url(#blur20)"/>
    ${ear(-1)}${ear(1)}
    <g transform="translate(${yaw * 10},0)">${CURLS}${HAIRHI}</g>
    <g transform="translate(${fx},${(p.pitch || 0) * 12})">
      <!-- pomulos / mejillas -->
      <ellipse cx="-124" cy="${58 - up * 14}" rx="${52 + up * 10}" ry="${34 + up * 6}" fill="#e0624a" opacity="${0.4 + up * 0.15}"/><ellipse cx="124" cy="${58 - up * 14}" rx="${52 + up * 10}" ry="${34 + up * 6}" fill="#e0624a" opacity="${0.4 + up * 0.15}"/>
      <ellipse cx="-138" cy="${22 - up * 10}" rx="46" ry="16" fill="#fff" opacity="${0.1 + up * 0.12}" filter="url(#blur8)"/><ellipse cx="138" cy="${22 - up * 10}" rx="46" ry="16" fill="#fff" opacity="${0.1 + up * 0.12}" filter="url(#blur8)"/>
      <!-- arrugas de expresion -->
      <g fill="none" stroke="#3a1d10" stroke-linecap="round" stroke-width="5">
        ${wrinkle > 0 ? `<g opacity="${clamp(wrinkle * 1.6) * 0.5}"><path d="M-110,-142 Q0,-158 110,-142"/><path d="M-96,-122 Q0,-136 96,-122"/></g>` : ''}
        ${furrow > 0.15 ? `<g opacity="${clamp(furrow) * 0.55}"><path d="M-14,-96 q-4,-16 0,-30 M14,-96 q4,-16 0,-30"/></g>` : ''}
        ${squint > 0.3 ? `<g opacity="${clamp(squint) * 0.5}"><path d="M-128,-12 l-18,-8 M-128,6 l-20,2 M128,-12 l18,-8 M128,6 l20,2"/></g>` : ''}
        <g opacity="${clamp(Math.abs(sm) * 0.6 + jaw / 60) * 0.55}"><path d="M-38,66 Q-92,96 -${86 + up * 10},${128 - up * 6}"/><path d="M38,66 Q92,96 ${86 + up * 10},${128 - up * 6}"/></g>
      </g>
      ${eyeSvg(-78, p.lid.l, p.blink.l, squint, p.gaze.x, p.gaze.y, p.tears, p.tearT, 1)}${eyeSvg(78, p.lid.r, p.blink.r, squint, p.gaze.x, p.gaze.y, p.tears, p.tearT, -1)}
      ${browSvg(-1, brL.r, brL.i)}${browSvg(1, brR.r, brR.i)}
      <ellipse cx="0" cy="${-70 + (brL.r + brR.r) * -10}" rx="18" ry="12" fill="#0f0a08"/>
      <g transform="translate(${yaw * 14},${(p.breath || 0) * 1.2})">
        <ellipse cx="0" cy="48" rx="${34 + (p.flare || 0) * 3}" ry="26" fill="#7d4524" ${O8}/><ellipse cx="-9" cy="38" rx="10" ry="6" fill="#fff" opacity="0.4"/>
        <ellipse cx="-12" cy="58" rx="${7 + (p.flare || 0) * 2}" ry="5" fill="#2a130a"/><ellipse cx="12" cy="58" rx="${7 + (p.flare || 0) * 2}" ry="5" fill="#2a130a"/>
      </g>
      <g transform="translate(${yaw * 6},${102 + jaw * 0.8})">${mouthSvg(p.mouth, yaw)}</g>
      ${PIMPLES}
      <ellipse cx="-130" cy="20" rx="40" ry="18" fill="#2e1a0c" opacity="0.3" filter="url(#blur8)"/><ellipse cx="110" cy="110" rx="46" ry="16" fill="#2e1a0c" opacity="0.3" filter="url(#blur8)"/>
    </g>
  </g>`;
}

// ---------- cuerpo con anatomia ----------
// Miembro afilado (musculo/grasa) a lo largo de +y con tapas redondeadas. w0 base, wm medio, w1 punta.
function taper(len, w0, wm, w1) {
  return `M${-w0},0 A${w0},${w0} 0 0 1 ${w0},0 C${w0},${len * 0.25} ${wm},${len * 0.3} ${wm},${len * 0.5} C${wm},${len * 0.75} ${w1},${len * 0.85} ${w1},${len} A${w1},${w1} 0 0 1 ${-w1},${len} C${-w1},${len * 0.85} ${-wm},${len * 0.75} ${-wm},${len * 0.5} C${-wm},${len * 0.3} ${-w0},${len * 0.25} ${-w0},0Z`;
}
const SHADE_DEFS = `<defs>
  <linearGradient id="limbG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.12"/><stop offset="0.62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.34"/></linearGradient>
  <linearGradient id="pantG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.14"/><stop offset="0.65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.38"/></linearGradient>
  <clipPath id="shirtClip"><path d="${SHIRT_PATH()}"/></clipPath>
</defs>`;
function SHIRT_PATH() {
  const hem = []; for (let i = 0; i <= 15; i++) { const x = -330 + i * 44; hem.push(`L${x},${i % 2 ? 404 : 378}`); }
  return `M-78,-96 C-150,-92 -262,-52 -312,34 C-352,110 -368,190 -364,270 C-362,320 -350,352 -330,374 ${hem.join(' ')} L330,374 C350,352 362,320 364,270 C368,190 352,110 312,34 C262,-52 150,-92 78,-96 Z`;
}
const STRIPES = [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${-345 + i * 105}" y="-110" width="50" height="560" fill="#2ecc71" opacity="0.92"/>`).join('');
const DOTS = [[-230, 90], [-90, 160], [120, 90], [250, 220], [-190, 270], [50, 280], [-50, 350], [180, 340], [-270, 340]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#ffd23f" stroke="${OUT}" stroke-width="3"/>`).join('');
const SHIRT_DETAIL = `
  <path d="M-300,40 C-330,120 -338,220 -334,300" stroke="#000" stroke-opacity="0.18" stroke-width="10" fill="none" filter="url(#blur8)"/>
  <path d="M300,40 C330,120 338,220 334,300" stroke="#000" stroke-opacity="0.28" stroke-width="12" fill="none" filter="url(#blur8)"/>
  <g fill="none" stroke="#000" stroke-opacity="0.2" stroke-width="6" stroke-linecap="round"><path d="M-230,250 Q-110,310 20,262"/><path d="M-90,330 Q60,372 220,320"/><path d="M-250,130 Q-170,168 -110,118"/><path d="M120,140 Q210,176 270,118"/></g>
  <ellipse cx="-110" cy="110" rx="170" ry="120" fill="#fff" opacity="0.12" filter="url(#blur20)"/>
  <ellipse cx="170" cy="330" rx="260" ry="150" fill="#000" opacity="0.22" filter="url(#blur20)"/>
  <ellipse cx="-190" cy="250" rx="58" ry="42" fill="#3a1d10" opacity="0.9"/>
  <path d="M-246,232 l16,-22 l14,18 l14,-24 l14,22 l16,-18 l14,22 l-8,26 l-18,10 l-24,-6Z" fill="${SKINB}" stroke="${OUT}" stroke-width="4"/>
  <g transform="translate(150,170) rotate(-6)"><rect x="-68" y="-58" width="136" height="116" fill="#4f7cac" stroke="${OUT}" stroke-width="5"/><path d="M-60,-50 H60 V50 H-60Z" stroke="#f4e9c8" stroke-width="5" stroke-dasharray="14 9" fill="none"/><path d="M-30,-20 h60 M-30,10 h40" stroke="#fff" stroke-opacity="0.25" stroke-width="8"/></g>
  <ellipse cx="-60" cy="300" rx="110" ry="44" fill="#4a2f14" opacity="0.32" filter="url(#blur8)"/>
  <g fill="#4a2f14" opacity="0.5">${[[-250, 120, 9], [-215, 150, 6], [40, 90, 8], [90, 310, 11], [-120, 350, 8], [250, 280, 7], [10, 345, 9], [-300, 300, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;

function legSvg(side, leg) {
  const hx = side * 100, hy = 520;
  const thighRot = leg.thigh || 0, kneeRot = leg.knee || 0;
  const pant = (len, w0, wm, w1) => `<path d="${taper(len, w0, wm, w1)}" fill="${PANTS}" ${O8}/><path d="${taper(len, w0, wm, w1)}" fill="url(#pantG)"/>`;
  return `<g transform="translate(${hx},${hy}) rotate(${thighRot})">
    ${pant(112, 92, 88, 66)}
    <g transform="translate(0,108) rotate(${kneeRot})">
      <path d="${taper(96, 56, 56, 40)}" fill="${SKINB}" ${O8} transform="translate(0,20)"/><path d="${taper(96, 56, 56, 40)}" fill="url(#limbG)" transform="translate(0,20)"/>
      <path d="${taper(62, 70, 66, 62)}" fill="${PANTS}" ${O8} transform="translate(0,-8)"/><path d="${taper(62, 70, 66, 62)}" fill="url(#pantG)" transform="translate(0,-8)"/>
      <path d="M-62,62 l9,-8 l7,10 l8,-9 l9,10 l8,-9 l9,10 l8,-9 l8,10 l8,-9 l8,8" stroke="#e9d9b8" stroke-width="3" fill="none"/>
      <ellipse cx="0" cy="-6" rx="38" ry="28" fill="${SKINB}" stroke="${OUT}" stroke-width="5"/><path d="M-30,-14 l8,6 l6,-8 l7,8 l7,-8 l7,8 l8,-6" stroke="#e9d9b8" stroke-width="3" fill="none"/>
      <path d="M-18,0 q18,12 36,0" stroke="#000" stroke-opacity="0.22" stroke-width="4" fill="none"/>
      <ellipse cx="${-side * 22}" cy="62" rx="9" ry="12" fill="#fff" opacity="0.1"/>
      <g transform="translate(0,120) rotate(${-(thighRot + kneeRot)}) translate(0,-650)">${foot(0, O8, SKINB, true, side < 0 ? '#e8629c' : '#7fb069')}</g>
    </g>
  </g>`;
}

function armSvg(side, target, wrist) {
  const k = solveArm(side, target);
  const sleeve = `<g transform="translate(0,-26)"><path d="${taper(112, 82, 84, 74)}" fill="${SHIRT}" ${O8}/><path d="${taper(112, 82, 84, 74)}" fill="url(#pantG)" opacity="0.55"/>
      <path d="M-72,74 Q0,92 72,74" stroke="#2ecc71" stroke-width="16" fill="none" opacity="0.9"/><path d="M-76,100 Q0,122 76,100 L72,122 Q0,144 -72,122Z" fill="#c95f12" stroke="${OUT}" stroke-width="5" transform="translate(0,-8)"/></g>`;
  return `<g transform="translate(${k.S.x},${k.S.y}) rotate(${k.rot1})">
    <path d="${taper(L1 + 6, 58, 62, 46)}" fill="${SKINB}" ${O8}/><path d="${taper(L1 + 6, 58, 62, 46)}" fill="url(#limbG)"/>
    <g transform="translate(0,${L1}) rotate(${k.rot2})">
      <path d="${taper(L2 + 8, 46, 50, 34)}" fill="${SKINB}" ${O8}/><path d="${taper(L2 + 8, 46, 50, 34)}" fill="url(#limbG)"/>
      <path d="M-26,8 q26,18 52,0" stroke="#000" stroke-opacity="0.25" stroke-width="4" fill="none"/><ellipse cx="${-side * 10}" cy="2" rx="14" ry="9" fill="#fff" opacity="0.12"/>
      <path d="M-26,70 q-6,26 0,52 M10,66 q8,28 2,56" stroke="#000" stroke-opacity="0.12" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g transform="translate(0,${L2}) rotate(${wrist})">
        <ellipse cx="0" cy="-4" rx="38" ry="10" fill="#ff7ab6" stroke="${OUT}" stroke-width="4"/>${[-24, -8, 8, 24].map((x) => `<circle cx="${x}" cy="-4" r="4.5" fill="#ffe14d" stroke="${OUT}" stroke-width="1.5"/>`).join('')}
        <g transform="scale(0.95)">${hand(0, 34, side, O8, SKINB, true)}</g>
      </g>
    </g>
    ${sleeve}
  </g>`;
}

export function drawLazy(p) {
  const br = p.breath || 0, sh = (p.shoulders || 0) * 14;
  const lg = p.legs || { l: {}, r: {} };
  const chest = `<g transform="translate(0,230) scale(${1 + 0.012 * br},${1 + 0.016 * br}) translate(0,-230)">
    <!-- cadera + panza -->
    <path d="M-262,470 C-300,510 -296,556 -236,582 L236,582 C296,556 300,510 262,470 Z" fill="${PANTS}" ${O8}/><path d="M-262,470 C-300,510 -296,556 -236,582 L236,582 C296,556 300,510 262,470 Z" fill="url(#pantG)" opacity="0.6"/>
    <path d="M-334,368 C-362,420 -342,492 -262,520 C-120,548 120,548 262,520 C342,492 362,420 334,368 Z" fill="${SKINB}" ${O8}/>
    <path d="M-334,368 C-362,420 -342,492 -262,520 C-120,548 120,548 262,520 C342,492 362,420 334,368 Z" fill="url(#limbG)" opacity="0.8"/>
    <ellipse cx="0" cy="448" rx="24" ry="9" fill="#2a1608" opacity="0.7"/><path d="M-230,490 Q0,540 230,490" stroke="#000" stroke-opacity="0.25" stroke-width="7" fill="none"/><path d="M-300,420 Q-250,470 -170,478" stroke="#fff" stroke-opacity="0.14" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M-262,520 Q0,560 262,520" stroke="#e9d9b8" stroke-width="12" fill="none" opacity="0.9"/>
    <!-- playera -->
    <path d="${SHIRT_PATH()}" fill="${SHIRT}" ${O8}/>
    <g clip-path="url(#shirtClip)">${STRIPES}${DOTS}${SHIRT_DETAIL}</g>
    <path d="${SHIRT_PATH()}" fill="none" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M-118,-96 Q0,-50 118,-96" fill="${SKINB}" stroke="${OUT}" stroke-width="8"/><path d="M-120,-100 Q0,-56 120,-100" stroke="#c95f12" stroke-width="16" fill="none"/>
  </g>`;
  const rollY = -100;
  return `<g transform="rotate(${p.sway || 0} 0 770)">
    ${SHADE_DEFS}
    <clipPath id="eyeClip"><ellipse rx="36" ry="40"/></clipPath>
    <ellipse cx="0" cy="780" rx="420" ry="46" fill="#000" opacity="0.4" filter="url(#blur20)"/>
    ${legSvg(-1, lg.l)}${legSvg(1, lg.r)}${chest}
    <g transform="translate(0,${-sh * 0.4})">
      <path d="M-62,-150 C-70,-110 -86,-96 -110,-84 L110,-84 C86,-96 70,-110 62,-150Z" fill="${SKINB}" ${O8}/>
      <path d="M-40,-90 C-30,-70 30,-70 40,-90" stroke="#000" stroke-opacity="0.2" stroke-width="6" fill="none"/>
      <ellipse cx="0" cy="-60" rx="104" ry="24" fill="#000" opacity="0.18" filter="url(#blur8)"/>
      <g transform="translate(0,${rollY}) rotate(${p.roll || 0}) translate(0,${-rollY}) translate(0,${-215 + (p.pitch || 0) * 10 + (p.bob || 0)})">${headSvg(p)}</g>
    </g>
    <g transform="translate(0,${-sh})">${armSvg(-1, p.armL.t, p.armL.w)}${armSvg(1, p.armR.t, p.armR.w)}</g>
  </g>`;
}
