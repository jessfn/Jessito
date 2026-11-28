// Dia 20: ropa (objetos de closet), policia, Mari corriendo (perfil), objetos del bosque. 2D, brazos continuos, boca hablante.
import { eyes, MOODS } from './chars.mjs';
import { armsC, TOOLS, mouthT } from './chars12.mjs';
import './chars19.mjs';
const OUT = '#12090a'; const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
TOOLS.vest = () => `<g><path d="M-52,-60 Q-20,-86 0,-70 Q20,-86 52,-60 L62,40 L66,120 Q0,140 -66,120 L-62,40Z" fill="#1c1c22" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>${[-30, 0, 30, 60, 90].map((y) => `<path d="M-60,${y} Q-30,${y + 8} -2,${y} M2,${y} Q30,${y + 8} 60,${y}" stroke="#000" stroke-width="3" fill="none" opacity="0.6"/><path d="M-56,${y - 4} Q-30,${y + 4} -4,${y - 4}" stroke="#fff" stroke-width="2" fill="none" opacity="0.15"/>`).join('')}<path d="M0,-70 V122" stroke="#c9ccd6" stroke-width="4"/><rect x="-5" y="-72" width="10" height="14" rx="3" fill="#c9ccd6" stroke="${OUT}" stroke-width="2"/></g>`;
TOOLS.leggings = () => `<g><path d="M-44,-80 L44,-80 L52,-60 L30,150 L8,150 L0,-20 L-8,150 L-30,150 L-52,-60Z" fill="#17171c" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><rect x="-46" y="-86" width="92" height="20" rx="8" fill="#2a2a32" stroke="${OUT}" stroke-width="4"/><path d="M-36,-40 L-20,130 M36,-40 L20,130" stroke="#fff" stroke-width="2" opacity="0.15"/></g>`;
TOOLS.tee = () => `<g><path d="M-30,-70 Q0,-52 30,-70 L84,-46 L98,10 L66,22 L56,-2 L56,100 L-56,100 L-56,-2 L-66,22 L-98,10 L-84,-46Z" fill="#202028" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><path d="M-30,-70 Q0,-52 30,-70" stroke="#3a3a44" stroke-width="7" fill="none"/><path d="M-90,-30 L-96,6 M90,-30 L96,6" stroke="#fff" stroke-width="2" opacity="0.15"/></g>`;
TOOLS.phoneIns = () => `<g><rect x="-60" y="-110" width="120" height="220" rx="22" fill="#222" stroke="${OUT}" stroke-width="6"/><rect x="-52" y="-100" width="104" height="200" rx="14" fill="#0d1018"/><circle cx="0" cy="0" r="22" fill="#ff2a3a" opacity="0.9"/></g>`;
const lerp = (a, b, k) => a + (b - a) * k;
// ---- policia (nuevo diseno): gorra, mostacho, uniforme azul marino con placa, radio al hombro ----
export function drawOfficer(p) {
  const m = MOODS[p.mood || 'serious'], t = p.t || 0, bob = Math.sin(t * 1.9) * 2.2, blink = p.blink || 0, SK = '#d9a273', SKD = '#bd8559';
  const spec = { sleeve: '#1d2c4d', skin: SK, frac: 1, cuff: '#10192e', sh: 112, shy: 214, wU: 40, wF: 32 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <path d="M-70,470 L-8,470 L-12,760 L-76,760Z" fill="#16213b" ${O}/><path d="M70,470 L8,470 L12,760 L76,760Z" fill="#16213b" ${O}/>
    <path d="M-84,764 q-8,26 12,26 h72 q6,-16 -6,-26Z" fill="#0d0d10" ${O}/><path d="M84,764 q8,26 -12,26 h-72 q-6,-16 6,-26Z" fill="#0d0d10" ${O}/>
    <path d="M-120,620 Q-128,230 -70,196 L70,196 Q128,230 120,620Z" fill="#1d2c4d" ${O}/><path d="M-30,204 L0,310 L30,204Z" fill="#f2f2f6" ${O}/><path d="M-30,204 L0,310 L30,204" stroke="#7a1020" stroke-width="5" fill="none"/>
    <rect x="-118" y="540" width="236" height="22" fill="#0d0d10" ${O}/><rect x="-14" y="536" width="28" height="30" rx="4" fill="#d4a24c" ${O}/>
    <path d="M56,270 l20,0 l4,26 l-22,8 l-4,-14Z" fill="#d4a24c" ${O}/><circle cx="66" cy="284" r="5" fill="#fff6c0"/>
    <rect x="-98" y="260" width="34" height="44" rx="6" fill="#0d0d10" ${O}/><path d="M-90,296 q6,22 -4,40" stroke="#0d0d10" stroke-width="5" fill="none"/>
    <rect x="-18" y="100" width="36" height="106" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="0" rx="82" ry="108" fill="${SK}" ${O}/><ellipse cx="-86" cy="10" rx="11" ry="20" fill="${SK}" ${O}/><ellipse cx="86" cy="10" rx="11" ry="20" fill="${SK}" ${O}/>
    <path d="M-86,-40 Q-90,-120 0,-124 Q90,-120 86,-40 L88,-70 Q0,-150 -88,-70Z" fill="#1d2c4d" ${O}/><path d="M-96,-52 H96 Q104,-52 102,-36 Q0,-24 -102,-36 Q-104,-52 -96,-52Z" fill="#101a30" ${O}/>
    <path d="M-20,-92 l20,-16 l20,16 l-20,18Z" fill="#d4a24c" ${O}/>
    ${eyes(34, 0, blink, p.look || 0, m.big * 0.6, m.b)}<path d="M-64,-22 q18,-10 38,-4 M64,-22 q-18,-10 -38,-4" stroke="#2a1a10" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M0,16 q-8,16 0,22 q8,-2 8,-6" stroke="#8a5a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-46,52 Q-24,38 0,50 Q24,38 46,52 Q24,66 0,56 Q-24,66 -46,52Z" fill="#2a1a10" ${O.replace('7', '4')}/>${mouthT(p.mood || 'serious', 82, p.mouthOpen || 0, '#a8423a', 0.4)}
    ${armsC(p, spec, 'body')}
  </g>`; }
// ---- Mari corriendo (perfil, mira a la derecha), pelo morado, top cian, pantalon azul, tenis rosas; cuerda colgando de las munecas ----
export function drawMariRun(t, o = {}) {
  const sp = o.speed ?? 3.2, ph = t * sp * Math.PI * 2, talk = o.talk || 0, fear = o.fear ?? 1;
  const S = Math.sin, C = Math.cos, RAD = Math.PI / 180;
  const lean = (o.lean ?? 14) * RAD, bounce = Math.abs(S(ph)) * -14;
  const pt = (x, y, a, l) => [x + S(a) * l, y + C(a) * l];
  const limb = (p0, a1, a2, l1, l2, w, col, shoeCol) => { const p1 = pt(p0[0], p0[1], a1, l1), p2 = pt(p1[0], p1[1], a1 + a2, l2); const d = `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} L${p1[0].toFixed(1)},${p1[1].toFixed(1)} L${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    return { p1, p2, svg: `<path d="${d}" stroke="${OUT}" stroke-width="${w + 12}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` }; };
  const hip = [0, 0 + bounce];
  const legA = (k) => { const a = 40 * S(ph + k * Math.PI) * RAD, kn = (14 + 62 * Math.max(0, S(ph + k * Math.PI + 1.9))) * RAD * -1; return [a, kn]; };
  const mkLeg = (k) => { const [a, kn] = legA(k); const L = limb(hip, a, kn, 150, 150, 52, '#3b4cca'); const shoe = `<g transform="translate(${L.p2[0].toFixed(1)},${L.p2[1].toFixed(1)}) rotate(${((a + kn) / RAD * 0.5 - 8).toFixed(1)})"><path d="M-22,-6 Q-14,-26 10,-18 Q44,-14 50,8 Q50,22 34,22 L-20,22 Q-30,22 -22,-6Z" fill="#ff4d8d" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/><path d="M-20,16 H44" stroke="#fff" stroke-width="5" opacity="0.8"/></g>`; return L.svg + shoe; };
  const shoulder = [S(lean) * 160, hip[1] - C(lean) * 160];
  const arm = (k) => { const a = 55 * S(ph + k * Math.PI + Math.PI) * RAD - 0.1, kn = (-48 - 20 * S(ph + k * Math.PI)) * RAD; const A = limb(shoulder, a, kn, 100, 96, 40, '#22d3ee'); const hand = `<circle cx="${A.p2[0].toFixed(1)}" cy="${A.p2[1].toFixed(1)}" r="21" fill="#f2c4a2" stroke="${OUT}" stroke-width="6"/>`;
    const rope = `<path d="M${A.p2[0].toFixed(1)},${(A.p2[1] + 8).toFixed(1)} q${(-14 + 10 * S(ph * 2 + k)).toFixed(1)},${(26).toFixed(1)} ${(-6 + 16 * S(ph * 2 + k + 1)).toFixed(1)},${(52 + 8 * C(ph * 2)).toFixed(1)}" stroke="#a98655" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M${A.p2[0].toFixed(1)},${(A.p2[1] + 8).toFixed(1)} q${(-14 + 10 * S(ph * 2 + k)).toFixed(1)},26 ${(-6 + 16 * S(ph * 2 + k + 1)).toFixed(1)},${(52 + 8 * C(ph * 2)).toFixed(1)}" stroke="#5a4020" stroke-width="3" fill="none" stroke-dasharray="6 5" stroke-linecap="round"/>`; return A.svg + hand + rope; };
  const torso = `<path d="M${hip[0] - 62},${hip[1]} Q${hip[0] - 70 + S(lean) * 80},${shoulder[1] + 40} ${shoulder[0] - 54},${shoulder[1]} Q${shoulder[0]},${shoulder[1] - 36} ${shoulder[0] + 54},${shoulder[1] + 4} Q${hip[0] + 78 + S(lean) * 30},${(hip[1] + shoulder[1]) / 2} ${hip[0] + 60},${hip[1] + 20}Z" fill="#22d3ee" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><path d="M${shoulder[0] - 30},${shoulder[1] + 30} Q${(hip[0] + shoulder[0]) / 2},${(hip[1] + shoulder[1]) / 2} ${hip[0] - 20},${hip[1] - 20}" stroke="#fff" stroke-width="7" fill="none" opacity="0.18"/>`;
  const hx = shoulder[0] + S(lean) * 50 + 14, hy = shoulder[1] - 86 + bounce * 0.3, fl = 1 + 0.2 * S(ph * 2);
  const hairTail = `<path d="M${hx - 62},${hy - 18} C${hx - 150},${hy - 50 + 20 * S(ph * 2)} ${hx - 210 - 20 * fl},${hy + 10 + 30 * C(ph * 2)} ${hx - 270 - 20 * fl},${hy + 70 + 40 * S(ph * 2 + 1)} C${hx - 220},${hy + 30} ${hx - 150},${hy + 40} ${hx - 70},${hy + 34}Z" fill="#7a3aa8" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/><path d="M${hx - 90},${hy - 8} Q${hx - 170},${hy - 10 + 12 * S(ph * 2)} ${hx - 240},${hy + 40}" stroke="#c18bff" stroke-width="5" fill="none" opacity="0.6"/>`;
  const head = `<ellipse cx="${hx}" cy="${hy}" rx="70" ry="78" fill="#f2c4a2" stroke="${OUT}" stroke-width="8"/><path d="M${hx - 68},${hy + 6} Q${hx - 76},${hy - 84} ${hx + 6},${hy - 86} Q${hx + 64},${hy - 84} ${hx + 60},${hy - 36} Q${hx + 10},${hy - 60} ${hx - 30},${hy - 30} Q${hx - 50},${hy - 10} ${hx - 68},${hy + 6}Z" fill="#7a3aa8" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="${hx + 34}" cy="${hy - 6}" rx="${14 + fear * 3}" ry="${18 + fear * 4}" fill="#fff" stroke="${OUT}" stroke-width="4"/><circle cx="${hx + 40}" cy="${hy - 4}" r="8" fill="#2a1a10"/><circle cx="${hx + 43}" cy="${hy - 8}" r="3" fill="#fff"/>
    <path d="M${hx + 14},${hy - 34 - fear * 4} Q${hx + 36},${hy - 44} ${hx + 56},${hy - 30}" stroke="#4a2c16" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M${hx + 66},${hy + 12} q10,10 0,18" stroke="#d29a76" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="${hx + 34}" cy="${hy + 44}" rx="${14 + talk * 4}" ry="${6 + talk * 18}" fill="#7a1020" stroke="${OUT}" stroke-width="5"/><ellipse cx="${hx - 12}" cy="${hy + 26}" rx="22" ry="11" fill="#ff8fa3" opacity="0.5"/>`;
  return `<g>${mkLeg(1)}${arm(1)}${hairTail}${torso}${mkLeg(0)}${head}${arm(0)}</g>`; }
