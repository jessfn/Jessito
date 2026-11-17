// Rig de Lazy Dawns: personaje articulado (cuello, hombros, codos, muñecas con IK), cara con parpadeo,
// miradas, cejas, boca por visemas, mejillas/pliegues (pomulos, mandibula) y respiracion.
import { hand, foot } from './lazy_lib.mjs';
import { hdDefs, hdBack, hdTop, hdFront } from './hair_hd.mjs';
import { hairDefs, hairCurly, hairBehind, hairTop, hairCurtains, hairRinglets, HAIR_DEFAULT } from './hair.mjs';

const OUT = '#12090a';
const O8 = `stroke="${OUT}" stroke-width="8" stroke-linejoin="round"`;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
let SHIRT = 'url(#shirt)';
const SKIN = 'url(#skin)', SKINB = 'url(#skinB)', HAIR = 'url(#hair)'; let PANTS = 'url(#pants)'; let GYM = null; let SLIM = 0; let LOOSE = 0; let FACEW = 0; let BODYW = 0; let FEM = 0; let SKINT = null;
const LID = '#a1613a';

// ---------- IK de 2 huesos (hombro -> codo -> mano) ----------
const L1 = 165, L2 = 145;
export function setSlim(v) { SLIM = v; }
export function solveArm(side, target) {
  const S = { x: side * 296 * Math.max(0.46, 1 - 0.115 * SLIM), y: 58 };
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
function eyeSvg(x, open, blink, squint, gx, gy, tear, tearT, side, mk) {
  mk = mk || {}; const o = clamp(open * (1 - blink), 0, 1.25);
  const c = 1 - Math.min(o, 1);                 // 0 abierto .. 1 cerrado
  const yu = -44 + c * 50;                      // borde del parpado superior
  const yl = 46 - squint * 26 - c * 8;          // borde del parpado inferior
  const ix = gx * 13, iy = gy * 10 + 4;
  const dir = -side;                             // +1 si la esquina externa esta hacia +x
  const tearDrop = tear > 0.5 ? `<path d="M${side * 22},${yl + ((tearT * 0.9) % 1) * 70} q7,12 0,20 q-7,-8 0,-20Z" fill="#bfe9ff" stroke="#fff" stroke-width="2" opacity="${clamp((tear - 0.5) * 3)}"/>` : '';
  const col = mk.cols || {}; const lsh = clamp(mk.lash ?? 0.35), sh = clamp(mk.shadow || 0), lift = mk.lift ? 1 : 0, cut = mk.cut ? 1 : 0;
  // borde real del parpado superior sobre el globo (x local, 0 = centro): el mayor entre el arco del ojo y la linea del parpado
  const arcY = (xx) => -40 * Math.sqrt(Math.max(0, 1 - (xx / 36) * (xx / 36)));
  const lidY = (xx) => yu + lerp(-16, 8, c) * 0.5 * (1 - (xx / 46) * (xx / 46));
  const edge = (u) => { const xx = clamp(u, -0.97, 0.97) * 36; return Math.max(arcY(xx), lidY(xx)); };   // u: -1 interno .. +1 externo
  const PX = (u) => (dir * clamp(u, -0.97, 0.97) * 36);
  const f1 = (n) => n.toFixed(1);
  const swp = (id, s) => { const x0 = -dir * 58, x1 = x0 + dir * 124 * clamp(s); return `<clipPath id="${id}${side}"><rect x="${Math.min(x0, x1).toFixed(1)}" y="-130" width="${(Math.abs(x1 - x0) + 0.01).toFixed(1)}" height="230"/></clipPath>`; };
  const gid = 'es' + side + ((col.shadow || ['a', 'b', 'c']).join('')).replace(/[^0-9a-f]/gi, '');
  // ---- sombra de parpado ----
  let shadow = '';
  if (sh > 0.02 && c < 0.85) { const sc = col.shadow || ['#8a4b1e', '#e0a84a', '#f6d98a'];
    const hgt = (u) => (11 + 9 * lift) * Math.sin(Math.PI * Math.min(1, Math.max(0, (u + 1) / 2) * 0.9 + 0.08)) + 5 + 4 * Math.max(0, u);   // alto del pliegue
    const bot = [], top = []; for (let i = 0; i <= 20; i++) { const u = -0.95 + (i / 20) * 2.0; bot.push(`${f1(PX(u) + dir * (u > 0.7 ? (u - 0.7) * 14 : 0))},${f1(edge(u) + 1)}`); top.push(`${f1(PX(u) + dir * (u > 0.6 ? (u - 0.6) * 26 : 0))},${f1(edge(u) - hgt(u) * (u > 0.75 ? 1.15 : 1))}`); }
    const poly = 'M' + bot.join(' L') + ' L' + top.slice().reverse().join(' L') + 'Z';
    const wedge = `M${f1(dir * 8)},${f1(edge(0.2) - 2)} L${f1(dir * 50)},${f1(edge(1) - 28 - 6 * lift)} L${f1(dir * 46)},${f1(edge(1) + 4)} L${f1(dir * 22)},${f1(edge(0.6) + 1)}Z`;
    shadow = `<defs>${swp("sw", mk[side > 0 ? "swL" : "swR"] ?? 1)}<linearGradient id="${gid}" x1="${dir > 0 ? 0 : 1}" y1="0" x2="${dir > 0 ? 1 : 0}" y2="0"><stop offset="0" stop-color="${sc[2]}"/><stop offset="0.5" stop-color="${sc[1]}"/><stop offset="1" stop-color="${sc[0]}"/></linearGradient><filter id="eb" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="2.6"/></filter><filter id="eb2" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="4.5"/></filter></defs>
      <g clip-path="url(#sw${side})" opacity="${0.95 * sh}"><path d="${poly}" fill="url(#${gid})" filter="url(#eb)"/><path d="${wedge}" fill="${sc[0]}" opacity="${0.6 + 0.25 * cut}" filter="url(#eb2)"/>
      <path d="M${top.slice(2, 19).join(' L')}" stroke="${sc[0]}" stroke-width="${cut ? 4 : 6}" fill="none" stroke-linecap="round" opacity="${cut ? 0.95 : 0.3}" ${cut ? '' : 'filter="url(#eb)"'}/>
      <ellipse cx="${f1(-dir * 24)}" cy="${f1(edge(-0.75) - 4)}" rx="9" ry="4.5" fill="${col.inner || '#fff6cf'}" opacity="0.95" filter="url(#eb)"/>
      <ellipse cx="${f1(dir * 4)}" cy="${f1(edge(0) - 8)}" rx="15" ry="4" fill="${sc[2]}" opacity="0.55" filter="url(#eb)"/></g>
      ${clamp(mk.sparkle || 0) > 0.02 ? [...Array(9)].map((_, i) => { const u = -0.5 + i * 0.13; return `<circle cx="${f1(PX(u))}" cy="${f1(edge(u) - 6 - (i % 3) * 4)}" r="${1.2 + (i % 3) * 0.7}" fill="#fff" opacity="${0.9 * mk.sparkle}"/>`; }).join('') + `<circle cx="${f1(-dir * 25)}" cy="${f1(edge(-0.8) - 3)}" r="3.6" fill="${col.gem || '#fff'}" stroke="#fff" stroke-width="1.2"/>` : ''}`; }
  // ---- linea de pestanas / delineado: engrosa hacia la esquina externa y termina en ala ----
  const lnk = clamp(mk.liner || 0) * ((side > 0 ? mk.linerL : mk.linerR) ?? 1), lc = col.liner || '#0f0708';
  const th = (mk.thick || 4) * 0.8, wing = (mk.wing ?? 0.8) * (lnk > 0.02 ? 1 : 0);
  let liner = '';
  if (c < 0.9) { const up = [], dn = []; for (let i = 0; i <= 16; i++) { const u = -0.96 + (i / 16) * 1.96, t = (u + 1) / 2, w = 2.2 + (lnk > 0.02 ? th * Math.pow(t, 1.5) : 1.2 * t); up.push(`${f1(PX(u))},${f1(edge(u) - w * 0.7)}`); dn.push(`${f1(PX(u))},${f1(edge(u) + w * 0.35)}`); }
    const ex = PX(1.0), ey = edge(1.0);
    const tipX = ex + dir * (10 + 26 * wing), tipY = ey - (4 + 15 * wing) - 2;
    const wingP = wing > 0.05 ? ` Q${f1(ex + dir * (6 + 10 * wing))},${f1(ey - 2 - 4 * wing)} ${f1(tipX)},${f1(tipY)} Q${f1(ex + dir * (8 + 8 * wing))},${f1(ey + 1)} ${dn[dn.length - 1]}` : ` L${dn[dn.length - 1]}`;
    liner = `<defs>${swp('lw', mk[side > 0 ? 'lsL' : 'lsR'] ?? 1)}</defs><g clip-path="url(#lw${side})"><path d="M${up.join(' L')}${wingP} L${dn.slice(0, -1).reverse().join(' L')}Z" fill="${lc}"/></g>`; }
  // ---- pestanas superiores: curvas, afiladas, de afuera hacia adentro mas largas; salen del borde del parpado ----
  let lashes = '';
  if (c < 0.75) { const n = Math.round(5 + 3 * lsh), Lmax = 12 + 20 * lsh;
    for (let i = 0; i < n; i++) { const k = i / (n - 1), u = 0.05 + k * 0.92;           // 0 centro .. 1 esquina externa
      const rx = PX(u), ry = edge(u) - 0.5;
      const len = Lmax * (0.6 + 0.5 * k) * (1 - c);
      const rot = (10 + 62 * Math.pow(k, 0.8)) * Math.PI / 180;                       // inclinacion hacia afuera
      const dx = dir * Math.sin(rot), dy = -Math.cos(rot);
      const mx = rx + dx * len * 0.5 - dir * 1.5, my = ry + dy * len * 0.5;           // curva: sale recta y remata hacia afuera/arriba
      const tx = rx + dx * len + dir * len * 0.22, ty = ry + dy * len * 0.85 - 3;
      const w = 3.6 + 1.6 * lsh;
      lashes += `<path d="M${f1(rx - dir * w * 0.6)},${f1(ry + 2)} Q${f1(mx - dir * w * 0.3)},${f1(my)} ${f1(tx)},${f1(ty)} Q${f1(mx + dir * w * 0.9)},${f1(my + 1)} ${f1(rx + dir * w * 0.6)},${f1(ry + 2)}Z" fill="#0b0506"/>`; } }
  return `<g transform="translate(${x},-6)">
    ${shadow}
    <ellipse rx="36" ry="40" fill="#fff"/>
    <g clip-path="url(#eyeClip)">
      <ellipse rx="36" ry="40" fill="#000" opacity="0.08" cy="14"/>
      <g transform="translate(${ix},${iy}) scale(${1 - Math.abs(gx) * 0.12},1)"><circle r="22" fill="url(#eye)"/><circle r="11" fill="#0a0503"/><circle cx="8" cy="-9" r="7" fill="#fff"/><circle cx="-6" cy="10" r="3.5" fill="#fff" opacity="0.8"/></g>
      ${tear > 0.2 ? `<ellipse cx="0" cy="${yl - 2}" rx="34" ry="${4 + tear * 5}" fill="#dff3ff" opacity="${0.35 + tear * 0.4}"/>` : ''}
      <path d="M-46,-62 L46,-62 L46,${yu} Q0,${yu + lerp(-16, 8, c)} -46,${yu}Z" fill="${LID}"/>
      ${sh > 0.02 ? `<path d="M-46,-62 L46,-62 L46,${yu} Q0,${yu + lerp(-16, 8, c)} -46,${yu}Z" fill="${(col.shadow || ['#8a4b1e', '#e0a84a'])[1]}" opacity="${0.8 * sh * Math.min(1, c * 2) * clamp(mk[side > 0 ? 'swL' : 'swR'] ?? 1)}"/>` : ''}
      <path d="M-46,70 L-46,${yl} Q0,${yl + 10} 46,${yl} L46,70Z" fill="${LID}"/>
    </g>
    <ellipse rx="36" ry="40" fill="none" stroke="${OUT}" stroke-width="${c < 0.5 ? 4.5 : 7}"/>
    ${liner}${lashes}${tearDrop}
  </g>`;
}
function browSvg(side, r, i, k = 0, shortF = 0) {
  const dy = -r * 24, th = lerp(22, 13, k);
  let o = { x: side * 132, y: -58 + dy + i * 12 + 8 * k };
  const a = { x: side * lerp(70, 86, k), y: -108 - 20 * k + dy - i * 6 };
  const n = { x: side * lerp(6, 46, k), y: -62 + dy - i * 28 + 4 * k };
  if (shortF > 0) o = { x: o.x + (a.x - o.x) * shortF * 0.7, y: o.y + (a.y - o.y) * shortF * 0.7 };
  const stray = k < 0.7 ? [0.2, 0.45, 0.7].map((u, j) => `<path d="M${lerp(o.x, a.x, u)},${lerp(o.y, a.y, u) - 14} l${side * (3 + j)},-${12 + j * 3}" stroke="#0f0a08" stroke-width="3.5" stroke-linecap="round" opacity="${(1 - k / 0.7) * 0.8}"/>`).join('') : '';
  return `<path d="M${o.x},${o.y} Q${a.x},${a.y} ${n.x},${n.y} L${n.x},${n.y + th} Q${a.x},${a.y + th * 1.4} ${o.x},${o.y + 6}Z" fill="#0f0a08" stroke="${OUT}" stroke-width="${lerp(5, 4, k)}" stroke-linejoin="round"/>${stray}`;
}

// ---------- dientes y lengua realistas ----------
// Proporciones (literatura odontologica): lateral ~ 66% del central, canino ~ 84% del central visto de frente; premolares algo mas angostos.
function realTeethSvg(pts, w, open, smile, N, sty = 'A') {
  const ST = { A: { W0: 16, hu: 17, hl: 11, can: 0, wl: 0.86 }, B: { W0: 22, hu: 17, hl: 12, can: 0.4, wl: 0.85 }, C: { W0: 20, hu: 19, hl: 13, can: 0.25, wl: 0.9 } }[sty] || { W0: 16, hu: 17, hl: 11, can: 0, wl: 0.86 };
  const at = (x) => { const t = clamp((x / w + 1) / 2, 0, 1), f = t * N, i = Math.min(N - 1, Math.floor(f)), k = f - i; const a = pts[i], b = pts[i + 1]; return { yu: a.yu + (b.yu - a.yu) * k, yl: a.yl + (b.yl - a.yl) * k }; };
  const W0 = ST.W0, SP = [[1.0, 1.0], [0.66, 0.84], [0.84, 0.86], [0.7, 0.72], [0.66, 0.66]];   // [ancho rel., alto rel.]
  const tooth = (cx, wd, ht, up, k, isCanine) => { const s = up ? 1 : -1, hw = wd / 2; const y0 = 0, y1 = s * ht; const cor = Math.min(hw * 0.9, 6);
    const edge = isCanine ? `L${hw - 1},${y1 - s * 6} L0,${y1 + s * 3} L${-hw + 1},${y1 - s * 6}` : `Q${hw * 0.9},${y1 + s * 1} ${hw - cor},${y1} L${-hw + cor},${y1} Q${-hw * 0.9},${y1 + s * 1} ${-hw},${y1 - s * cor}`;
    return `<g transform="translate(${cx.toFixed(1)},0)"><path d="M${-hw},${y0} L${hw},${y0} L${hw},${y1 - s * cor} ${isCanine ? '' : `Q${hw * 0.98},${y1} ${hw - cor},${y1}`} ${isCanine ? edge.replace(/^L[^L]*/, '') : ''}${isCanine ? '' : ''}Z" fill="none"/></g>`; };
  void tooth;
  const canK = ST.can; const toothPath = (wd, ht, up, canine) => { const s = up ? 1 : -1, hw = wd / 2, c = Math.min(6, hw * 0.8);
    if (canine) return `M${-hw},0 L${hw},0 L${hw * 0.98},${s * ht * 0.62} Q${hw * 0.5},${s * ht * 0.9} 0,${s * (ht + 4 * canK)} Q${-hw * 0.5},${s * ht * 0.9} ${-hw * 0.98},${s * ht * 0.62}Z`;
    return `M${-hw},0 L${hw},0 L${hw},${s * (ht - c)} Q${hw},${s * ht} ${hw - c},${s * ht} L${-hw + c},${s * ht} Q${-hw},${s * ht} ${-hw},${s * (ht - c)}Z`; };
  const defsT = `<linearGradient id="enU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1dfc2"/><stop offset="0.28" stop-color="#fbf3e2"/><stop offset="0.7" stop-color="#ffffff"/><stop offset="1" stop-color="#e3eef2"/></linearGradient>
    <linearGradient id="enL" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#eadfca"/><stop offset="0.3" stop-color="#f8f1e2"/><stop offset="0.75" stop-color="#ffffff"/><stop offset="1" stop-color="#e6eff2"/></linearGradient>
    <linearGradient id="gum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b94a5a"/><stop offset="1" stop-color="#e58b96"/></linearGradient>
    <radialGradient id="tng" cx="0.5" cy="0.25" r="0.85"><stop offset="0" stop-color="#f19aa4"/><stop offset="0.55" stop-color="#d9687b"/><stop offset="1" stop-color="#9c3345"/></radialGradient>
    <linearGradient id="cav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0407"/><stop offset="1" stop-color="#4a1018"/></linearGradient>`;
  const row = (up) => { let out = '', shadow = '', gums = ''; const items = [];
    for (const sg of [-1, 1]) { let x = 0; for (let i = 0; i < 5; i++) { const [rw, rh] = SP[i]; const wd = W0 * rw * (up ? 1 : ST.wl * 0.92), ht = (up ? ST.hu : ST.hl) * rh; const cx = (i === 0 ? sg * wd / 2 : x + sg * wd / 2); items.push({ cx: sg === 1 ? cx : cx, wd, ht, i, sg }); x = (i === 0 ? sg * wd : x + sg * wd); if (Math.abs(x) > w * 0.86) break; } }
    items.sort((a, b) => Math.abs(b.cx) - Math.abs(a.cx));
    for (const it of items) { const e = at(it.cx), y = up ? e.yu + 1 : e.yl - 1, canine = false; const depth = 1 - Math.abs(it.cx) / w; const tilt = 0;
      const path = toothPath(it.wd - 1.2, it.ht, up, canine); const dark = clamp(Math.abs(it.cx) / w * 0.75);
      out += `<g transform="translate(${it.cx.toFixed(1)},${y.toFixed(1)}) rotate(${(up ? -1 : 1) * -tilt * 0.5})"><path d="${path}" fill="url(#${up ? 'enU' : 'enL'})" stroke="#bda98a" stroke-width="1.6" stroke-linejoin="round"/><path d="${path}" fill="#7a5a48" opacity="${(dark * 0.38).toFixed(2)}"/>
        <path d="M${(-it.wd * 0.22).toFixed(1)},${up ? 7 : -7} Q${(-it.wd * 0.28).toFixed(1)},${(up ? it.ht * 0.55 : -it.ht * 0.55).toFixed(1)} ${(-it.wd * 0.12).toFixed(1)},${(up ? it.ht * 0.82 : -it.ht * 0.82).toFixed(1)}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>
        <path d="M${(it.wd * 0.5 - 1).toFixed(1)},${up ? 4 : -4} L${(it.wd * 0.5 - 1).toFixed(1)},${(up ? it.ht - 4 : -(it.ht - 4)).toFixed(1)}" stroke="#a8927a" stroke-width="1.4" opacity="0.55"/></g>`;
      gums += `<ellipse cx="${it.cx.toFixed(1)}" cy="${(up ? e.yu - 2 : e.yl + 2).toFixed(1)}" rx="${(it.wd * 0.62).toFixed(1)}" ry="${up ? 9 : 7}" fill="url(#gum)"/>`; }
    return { out, gums }; };
  const U = row(true), Lw = open > 0.2 || smile > 0.55 ? row(false) : { out: '', gums: '' };
  const cavity = `<rect x="${-w - 10}" y="-60" width="${2 * w + 20}" height="260" fill="url(#cav)"/>`;
  const shade = `<path d="M${-w},${at(-w).yu} L${w},${at(w).yu} L${w},${at(w).yu + 14} L${-w},${at(-w).yu + 14}Z" fill="#000" opacity="0.18"/>`;
  return { defs: defsT, cav: cavity, upper: U.gums + U.out, lower: Lw.gums + Lw.out, shade };
}
function tongueSvg(w, bot, open) { const rx = w * 0.5, ry = 16 + open * 22, cy = bot - ry * 0.7; const dots = Array.from({ length: 26 }, (_, i) => { const a = i * 2.4, rr = (i % 7) / 7; return `<circle cx="${(Math.cos(a) * rx * 0.7 * rr).toFixed(1)}" cy="${(Math.sin(a) * ry * 0.5 * rr - ry * 0.1).toFixed(1)}" r="1.6" fill="#f7b8c0" opacity="0.7"/>`; }).join('');
  return `<g transform="translate(0,${cy.toFixed(1)})"><path d="M${-rx},${ry * 0.5} Q${-rx * 0.9},${-ry * 0.7} 0,${-ry} Q${rx * 0.9},${-ry * 0.7} ${rx},${ry * 0.5} Q0,${ry * 1.6} ${-rx},${ry * 0.5}Z" fill="url(#tng)" stroke="#7d2a3a" stroke-width="2.4"/><path d="M0,${-ry * 0.85} Q${rx * 0.04},${ry * 0.1} 0,${ry * 0.9}" stroke="#9c3345" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>${dots}<ellipse cx="${-rx * 0.28}" cy="${-ry * 0.45}" rx="${rx * 0.22}" ry="${ry * 0.16}" fill="#fff" opacity="0.4"/></g>`; }
function mouthSvg(m, yaw) {
  const open = clamp(m.open, 0, 1), wide = m.wide, smile = m.smile, asym = m.asym || 0, press = m.press || 0;
  const w = 78 * (1 + 0.22 * wide + 0.12 * smile) * (1 - 0.1 * open);
  const cl = { x: -w, y: -smile * 24 - asym * 8 + press * 3 + open * 8 };
  const cr = { x: w, y: -smile * 24 + asym * 8 + press * 3 + open * 8 };
  const mid = (cl.y + cr.y) / 2;
  const up = mid + 6 - open * 12;
  const lo = Math.min(58, mid + 8 + open * 90 * (1 - 0.3 * Math.max(0, wide)) + (smile > 0.5 ? 14 : 0));
  const shape = `M${cl.x},${cl.y} Q0,${up} ${cr.x},${cr.y} Q0,${lo} ${cl.x},${cl.y}Z`;
  const showTeeth = open > 0.08 || smile > 0.3;
  const tq = m.teeth || { clean: 0, braces: 0, crooked: 1 };
  const crk = tq.crooked ?? 1;
  const mix = (hex, k) => { const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)), b = [247, 247, 240]; return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const T = (x, y, w, h, rot, col) => `<g transform="rotate(${rot * crk} ${x + w / 2} ${y})"><path d="M${x},${y} h${w} v${h - 8} q0,8 ${-w / 2},8 q${-w / 2},0 ${-w / 2},-8Z" fill="${mix(col, tq.clean)}" stroke="${OUT}" stroke-width="3"/>${tq.clean < 0.7 ? `<path d="M${x + 3},${y + 4} v${h * 0.5}" stroke="#7a5a12" stroke-width="3" opacity="${0.5 * (1 - tq.clean)}"/>` : `<path d="M${x + 4},${y + 3} v${h * 0.4}" stroke="#fff" stroke-width="3" opacity="0.7"/>`}</g>`;
  const BR = (x, y, w, h, rot, i) => tq.braces > 0.02 ? `<g transform="rotate(${rot * crk} ${x + w / 2} ${y}) translate(${x + w / 2},${y + h * 0.45}) scale(${tq.braces})"><rect x="-8" y="-7" width="16" height="14" rx="3" fill="#cbd5e1" stroke="${OUT}" stroke-width="2.5"/><rect x="-5" y="-4" width="10" height="8" rx="2" fill="${i % 2 ? '#a855f7' : '#ff4d8d'}"/></g>` : '';
  const drop = smile > 0.3 && open < 0.1 ? 6 : 0;
  const UP = [[-66, -2 + drop, 20, 20, -14, '#cdb64a'], [-44, 2 + drop, 16, 30, 8, '#e3cf6a'], [-27, 0 + drop, 26, 38, -5, '#d9c35a'], [2, 4 + drop, 16, 22, 12, '#b9a23e'], [24, -1 + drop, 20, 34, -10, '#e0cd6a'], [52, 2 + drop, 14, 18, 18, '#b59a36']];
  const upper = UP.map((u) => T(...u)).join('') + UP.map((u, i) => BR(...u, i)).join('') + (tq.braces > 0.02 ? `<path d="M-60,${6 + drop} Q0,${14 + drop} 60,${10 + drop}" stroke="#94a3b8" stroke-width="${3 * tq.braces}" fill="none"/>` : '');
  const fang = T(40, 6 + drop, 12, 30, 24, '#d8c458');
  const lower = open > 0.35 ? [T(-40, 70 + open * 20, 16, 22, 6, '#c2ab46'), T(-18, 74 + open * 22, 18, 26, -12, '#d3bd52'), T(8, 72 + open * 20, 16, 20, 14, '#b89f3c'), T(28, 76 + open * 22, 14, 18, -6, '#cdb54a')].join('') : '';
  const perfect = (tq.crooked ?? 1) < 0.08;
  const topY = (cl.y + 2 * up + cr.y) / 4, botY = (cl.y + 2 * lo + cr.y) / 4;
  const PU = [-66, -44, -22, 0, 22, 44].map((x, i) => [x, topY - 4, 22, 30 + (i === 2 || i === 3 ? 3 : 0), 0, '#e3cf6a']);
  const PL = open > 0.55 ? [-36, -18, 0, 18].map((x, i) => [x, botY - 22, 18, 22, 0, '#e3cf6a']).map((u) => T(...u)).join('') : '';
  const perfTeeth = PU.map((u) => T(...u)).join('') + PL;
  const teeth = perfect ? perfTeeth : upper + fang + lower;
  const buck = (open < 0.1 && smile < 0.3 && !perfect) ? `<g>${T(-18, 8, 20, 26, 6, '#e3cf6a')}${T(4, 9, 18, 22, -8, '#d4be52')}</g>` : '';
  // ---------- labios anatomicos: arco de cupido, borde bermellon, labio inferior mas lleno, brillo y sombra de esquinas ----------
  const N = 52, lipC = m.lip || null; const g = (x, mu, s) => Math.exp(-((x - mu) / s) * ((x - mu) / s));
  const qy = (t, c0, cy, c1) => (1 - t) * (1 - t) * c0 + 2 * t * (1 - t) * cy + t * t * c1;
  const pts = []; for (let i = 0; i <= N; i++) { const t = i / N, x = w * (2 * t - 1); pts.push({ x, yu: qy(t, cl.y, up, cr.y), yl: qy(t, cl.y, lo, cr.y), e: Math.pow(Math.max(0, 1 - (x / w) * (x / w)), 0.75) }); }
  const full = (m.fullness ?? 1);
  const tU = (p) => (3 + 14 * full * p.e) - 6.5 * g(p.x, 0, 8) + 5 * (g(Math.abs(p.x), 22, 9)) * p.e;
  const tL = (p) => 4 + (30 * full) * p.e + (open < 0.15 ? 2 : 0);
  const top = pts.map((p) => `${p.x.toFixed(1)},${(p.yu - tU(p)).toFixed(1)}`), upE = pts.map((p) => `${p.x.toFixed(1)},${p.yu.toFixed(1)}`);
  const loE = pts.map((p) => `${p.x.toFixed(1)},${p.yl.toFixed(1)}`), bot = pts.map((p) => `${p.x.toFixed(1)},${(p.yl + tL(p)).toFixed(1)}`);
  const upperPoly = 'M' + top.join(' L') + ' L' + upE.slice().reverse().join(' L') + 'Z', lowerPoly = 'M' + loE.join(' L') + ' L' + bot.slice().reverse().join(' L') + 'Z';
  const RT = perfect ? realTeethSvg(pts, w, open, smile, N, m.tstyle) : null;
  const base = lipC || '#9a4a44', dark = lipC ? shade2(lipC, 0.4) : '#5e2a2a', light = lipC ? shade2(lipC, -0.35) : '#c0766a';
  const gid = 'lp' + (lipC || 'n').replace('#', '');
  const defsLip = `<defs><linearGradient id="${gid}U" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade2(base, 0.04)}"/><stop offset="1" stop-color="${shade2(base, 0.24)}"/></linearGradient>
    <linearGradient id="${gid}L" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${base}"/><stop offset="0.55" stop-color="${light}"/><stop offset="1" stop-color="${shade2(base, 0.12)}"/></linearGradient>
    <linearGradient id="${gid}H" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${dark}" stop-opacity="0.65"/><stop offset="0.22" stop-color="${dark}" stop-opacity="0"/><stop offset="0.78" stop-color="${dark}" stop-opacity="0"/><stop offset="1" stop-color="${dark}" stop-opacity="0.65"/></linearGradient></defs>`;
  const yb = pts[Math.round(N / 2)].yl, yu0 = pts[Math.round(N / 2)].yu;
  const gloss = lipC ? `<ellipse cx="0" cy="${yb + 13 * full}" rx="${w * 0.3}" ry="${3.6 + 2 * full}" fill="#fff" opacity="0.6" filter="url(#blur3)"/><ellipse cx="${-w * 0.12}" cy="${yb + 9 * full}" rx="${w * 0.1}" ry="2" fill="#fff" opacity="0.7"/><ellipse cx="${-16}" cy="${yu0 - 10}" rx="9" ry="2.4" fill="#fff" opacity="0.4"/><ellipse cx="16" cy="${yu0 - 10}" rx="9" ry="2.4" fill="#fff" opacity="0.4"/>` : `<ellipse cx="0" cy="${yb + 12 * full}" rx="${w * 0.22}" ry="3" fill="#fff" opacity="0.22" filter="url(#blur3)"/>`;
  const outline = `<path d="${upperPoly}" fill="none" stroke="${dark}" stroke-width="3.2" stroke-linejoin="round" opacity="0.85"/><path d="${lowerPoly}" fill="none" stroke="${dark}" stroke-width="3.2" stroke-linejoin="round" opacity="0.85"/>`;
  const lipLine = `<path d="M${(-w * 0.9).toFixed(1)},${pts[3].yu.toFixed(1)} ${loE.slice(3, N - 2).map((s2) => 'L' + s2).join(' ')}" stroke="${shade2(dark, 0.3)}" stroke-width="${open < 0.1 ? 4.2 : 0}" fill="none" stroke-linecap="round" opacity="0.9" transform="translate(0,${open < 0.1 ? -0.5 : 0})"/>`;
  const corners = [-1, 1].map((sg) => `<ellipse cx="${sg * (w + 2)}" cy="${(sg < 0 ? cl.y : cr.y) + 1}" rx="9" ry="6" fill="${shade2('#5a2a22', 0)}" opacity="0.3" filter="url(#blur3)"/>`).join('');
  const philtrum = `<path d="M-9,${yu0 - 36} Q-8,${yu0 - 24} -12,${yu0 - 15} M9,${yu0 - 36} Q8,${yu0 - 24} 12,${yu0 - 15}" stroke="#000" stroke-opacity="0.15" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="${yb + tL(pts[Math.round(N / 2)]) + 7}" rx="${w * 0.22}" ry="5" fill="#000" opacity="0.14" filter="url(#blur3)"/>`;
  return `<g><defs><filter id="blur3" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="3"/></filter><clipPath id="mouthClip"><path d="${shape}"/></clipPath></defs>${defsLip}
    ${philtrum}${corners}
    <path d="${shape}" fill="#3a0c10"/>
    <g clip-path="url(#mouthClip)">${perfect ? `<defs>${RT.defs}</defs>${RT.cav}${open > 0.3 ? tongueSvg(w, botY - 14, open) : ''}${showTeeth ? RT.lower + RT.upper : ''}` : `${showTeeth ? teeth : ''}${open > 0.35 ? `<ellipse cx="0" cy="${lo * 0.62}" rx="${w * 0.55}" ry="${22 + open * 14}" fill="#b84a58"/>` : ''}`}<path d="${shape}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="10"/></g>
    <path d="${lowerPoly}" fill="url(#${gid}L)"/><path d="${lowerPoly}" fill="url(#${gid}H)"/><path d="${upperPoly}" fill="url(#${gid}U)"/><path d="${upperPoly}" fill="url(#${gid}H)"/>
    ${lipLine}${gloss}${outline}${buck}
    ${press > 0.4 ? `<path d="M${-w - 6},${cl.y - 6} q-6,8 0,16 M${w + 6},${cr.y - 6} q6,8 0,16" stroke="#3a1d10" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6"/>` : ''}
  </g>`;
}
const shade2 = (hex, k) => { const A = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); const f = (v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v * (1 - k) : v + (255 - v) * -k))); return '#' + A.map((v) => f(v).toString(16).padStart(2, '0')).join(''); };

const PIM_DATA = [[-75, -20, 15], [-4, 20, 17], [-150, 78, 13], [148, 70, 14], [-22, -112, 11], [60, -132, 12], [112, -70, 11], [-40, 128, 11], [62, -42, 13], [108, 26, 16], [-118, 38, 12], [24, 56, 14], [-34, -78, 12], [88, -96, 13], [-98, -92, 11], [2, -4, 10], [54, 100, 12], [-60, 92, 10], [130, -20, 9]];
const femPathStr = (yaw) => `M${yaw * 4},-210 C${yaw * 4 + 92 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},-210 ${yaw * 4 + 188 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},-130 ${yaw * 4 + 188 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},-14 C${yaw * 4 + 188 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},70 ${yaw * 4 + (158 - 26 * FEM) * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},168 ${yaw * 4 + (92 - 26 * FEM) * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},208 Q${yaw * 4},${246 + 4 * FEM} ${yaw * 4 - (92 - 26 * FEM) * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},208 C${yaw * 4 - (158 - 26 * FEM) * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},168 ${yaw * 4 - 188 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},70 ${yaw * 4 - 188 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},-14 C${yaw * 4 - 188 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},-130 ${yaw * 4 - 92 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)},-210 ${yaw * 4},-210Z`;
function femFace(F, tex) { if (F <= 0.02) return '';
  const k = F, sd = '#5a2a18', hl = '#ffe2c4';
  const sides = [-1, 1].map((s) => `
    <path d="M${s * 150},60 Q${s * 112},118 ${s * 58},150" stroke="${sd}" stroke-width="30" fill="none" stroke-linecap="round" opacity="${(0.2 * k).toFixed(2)}" filter="url(#blur8)"/>
    <ellipse cx="${s * 128}" cy="30" rx="44" ry="15" fill="${hl}" opacity="${(0.5 * k).toFixed(2)}" filter="url(#blur8)" transform="rotate(${s * -26} ${s * 128} 30)"/>
    <path d="M${s * 170},100 Q${s * 150},180 ${s * 70},214" stroke="${sd}" stroke-width="14" fill="none" stroke-linecap="round" opacity="${(0.28 * k).toFixed(2)}" filter="url(#blur8)"/>
    <ellipse cx="${s * 22}" cy="-34" rx="12" ry="40" fill="${hl}" opacity="${(0.22 * k).toFixed(2)}" filter="url(#blur8)"/>`).join('');
  const nose = `<path d="M-8,-30 Q0,10 -14,40 M8,-30 Q0,10 14,40" stroke="${sd}" stroke-width="8" fill="none" stroke-linecap="round" opacity="${(0.12 * k).toFixed(2)}" filter="url(#blur3)"/>`;
  const chin = `<ellipse cx="0" cy="196" rx="30" ry="12" fill="${hl}" opacity="${(0.28 * k).toFixed(2)}" filter="url(#blur8)"/><path d="M-64,190 Q0,232 64,190" stroke="${sd}" stroke-width="10" fill="none" opacity="${(0.15 * k).toFixed(2)}" filter="url(#blur8)"/>`;
  let t = '';
  if (tex === 'glass') t = `<ellipse cx="-24" cy="-92" rx="70" ry="22" fill="#fff" opacity="0.5" filter="url(#blur8)"/><ellipse cx="60" cy="-6" rx="26" ry="14" fill="#fff" opacity="0.45" filter="url(#blur8)"/><ellipse cx="0" cy="44" rx="14" ry="7" fill="#fff" opacity="0.6" filter="url(#blur3)"/><ellipse cx="0" cy="152" rx="26" ry="9" fill="#fff" opacity="0.4" filter="url(#blur8)"/>${[...Array(24)].map((_, i) => `<circle cx="${(i * 53) % 340 - 170}" cy="${(i * 37) % 280 - 90}" r="1.3" fill="#fff" opacity="0.28"/>`).join('')}`;
  if (tex === 'freckle') t = [-1, 1].map((s) => [...Array(16)].map((_, i) => `<circle cx="${s * (30 + (i * 11) % 78) + (i % 3)}" cy="${6 + (i * 7) % 30}" r="${1.6 + (i % 3) * 0.6}" fill="#7a3b1c" opacity="${0.45 + (i % 4) * 0.08}"/>`).join('')).join('') + `<ellipse cx="0" cy="-90" rx="80" ry="24" fill="#ffd9b0" opacity="0.28" filter="url(#blur8)"/>`;
  if (tex === 'pore') t = [...Array(120)].map((_, i) => `<circle cx="${(i * 61) % 330 - 165}" cy="${(i * 43) % 270 - 90}" r="0.95" fill="#6a3418" opacity="0.28"/>`).join('') + `<ellipse cx="-30" cy="-80" rx="60" ry="18" fill="#fff" opacity="0.18" filter="url(#blur8)"/><ellipse cx="0" cy="40" rx="150" ry="140" fill="url(#shim)" opacity="0.4"/>`;
  return `<g>${sides}${nose}${chin}${t}</g>`; }
function faceWrinkles(L, yaw) { if (L <= 0.02) return '';
  const k = L, dk = '#2a1208', ln = (d, w, o, col = dk) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${(o * k).toFixed(2)}"/>`, hl = (d, w, o) => ln(d, w, o, '#ffd9b8');
  const sides = [-1, 1].map((s) => `
    <ellipse cx="${s * 112}" cy="104" rx="40" ry="26" fill="#1a0a04" opacity="${0.2 * k}" filter="url(#blur8)"/><ellipse cx="${s * 132}" cy="40" rx="30" ry="12" fill="#ffd9b8" opacity="${0.22 * k}" filter="url(#blur8)" transform="rotate(${s * -24} ${s * 132} 40)"/>
    ${ln(`M${s * 36},66 Q${s * 62},86 ${s * 88},124`, 6, 0.5)}${hl(`M${s * 42},64 Q${s * 68},84 ${s * 94},120`, 3, 0.5)}${ln(`M${s * 40},72 Q${s * 58},90 ${s * 78},118`, 3, 0.35)}
    ${ln(`M${s * 84},132 Q${s * 78},150 ${s * 66},168`, 4, 0.2)}
    ${ln(`M${s * 52},38 Q${s * 78},56 ${s * 108},36`, 4, 0.4)}${ln(`M${s * 56},48 Q${s * 80},64 ${s * 104},46`, 3, 0.28)}
    ${ln(`M${s * 124},-14 l${s * 24},-8 M${s * 126},-2 l${s * 28},2 M${s * 124},10 l${s * 24},12`, 3.4, 0.4)}`).join('');
  const fore = [0, 1, 2].map((i) => ln(`M-90,${-122 + i * 16} Q0,${-136 + i * 16} 90,${-122 + i * 16}`, 3.4 - i * 0.4, 0.3 - i * 0.04)).join('');
  return `<g>${sides}${fore}${ln('M-44,172 Q0,186 44,172', 5, 0.35)}${ln('M-30,196 Q0,208 30,196', 3.4, 0.28)}${ln('M-50,112 Q-20,124 0,120', 2.4, 0.18)}</g>`; }
const SHIM_DEFS = '<linearGradient id="shim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd9a8" stop-opacity="0"/><stop offset="0.5" stop-color="#fff3d8" stop-opacity="0.5"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></linearGradient>';
function pimplesSvg(acne) {
  const N = PIM_DATA.length;
  return PIM_DATA.map(([x, y, r], i) => { const k = clamp((acne - (i / N) * 0.75) / 0.25) * (0.45 + 0.55 * clamp(acne)); if (k < 0.05) return ''; const q = r * k;
    return `<g transform="translate(${x},${y})"><circle r="${q + 4}" fill="#8f1d14" opacity="0.35"/><circle r="${q}" fill="#d6453a" stroke="${OUT}" stroke-width="3"/><circle r="${q * 0.55}" cx="${-q * 0.25}" cy="${-q * 0.25}" fill="#ffb3a6" opacity="0.8"/><circle r="${q * 0.25}" cx="${-q * 0.3}" cy="${-q * 0.35}" fill="#fff"/></g>`; }).join('');
}
function patchesSvg(acne, patch) {
  if (patch <= 0.02) return '';
  const N = PIM_DATA.length;
  return PIM_DATA.map(([x, y, r], i) => { const k = clamp((acne - (i / N) * 0.75) / 0.25) * (0.45 + 0.55 * clamp(acne)); if (k < 0.3) return '';
    return `<g transform="translate(${x},${y}) scale(${clamp(patch * 1.2)})" opacity="${clamp(patch * 2)}"><circle r="${r * k + 9}" fill="#f6e2c4" stroke="#c9a67a" stroke-width="3"/><circle r="${r * k + 3}" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/></g>`; }).join('');
}
const FOAM = [[-120, 40, 38], [-60, 74, 30], [120, 40, 38], [70, 78, 32], [0, 158, 42], [-70, 134, 34], [70, 134, 34], [-100, -70, 30], [0, -92, 36], [100, -70, 30], [-156, 4, 26], [156, 4, 26], [0, 64, 26], [-44, -12, 22], [44, -12, 22], [-176, 74, 24], [176, 74, 24], [-30, 110, 24], [30, 110, 24], [-130, -30, 24], [130, -30, 24]];
function foamSvg(foam, t) {
  if (foam <= 0.02) return '';
  return FOAM.map(([x, y, r], i) => { const k = clamp(foam * 1.4 - (i % 6) * 0.08); if (k <= 0.02) return ''; const jig = Math.sin(t * 4 + i * 1.7) * 3;
    return `<g transform="translate(${x + jig},${y + Math.cos(t * 3.4 + i) * 2.5})"><circle r="${r * k}" fill="#fff" stroke="#b9cde0" stroke-width="3"/><circle cx="${-r * k * 0.3}" cy="${-r * k * 0.3}" r="${r * k * 0.28}" fill="#dff1ff"/><circle cx="${r * k * 0.35}" cy="${r * k * 0.25}" r="${r * k * 0.12}" fill="#fff" stroke="#b9cde0" stroke-width="1.5"/></g>`; }).join('');
}
function maskSvg(m, dry) {
  if (m <= 0.02) return '';
  const k = 0.55 + 0.45 * clamp(m * 1.2);
  const cracks = dry > 0.05 ? `<g stroke="#4b6b3a" stroke-width="4" fill="none" stroke-linecap="round" opacity="${clamp(dry)}"><path d="M-120,-60 l30,24 l-14,28 l34,22 M60,-90 l-18,34 l30,20 l-12,30 M-30,80 l22,16 l-8,34 M110,50 l-28,10 l10,28 M-150,70 l30,-8 l6,30"/></g>` : '';
  return `<g opacity="${clamp(m * 1.5)}"><clipPath id="maskClip"><rect x="-230" y="-124" width="460" height="420"/></clipPath>
    <radialGradient id="clay" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stop-color="#a4cf8f"/><stop offset="0.6" stop-color="#7fb069"/><stop offset="1" stop-color="#5d8f4c"/></radialGradient>
    <g clip-path="url(#maskClip)"><g transform="translate(0,40) scale(${k}) translate(0,-40)"><path d="M-176,30 C-190,-70 -120,-130 0,-134 C120,-130 190,-70 176,30 C178,120 110,210 0,216 C-110,210 -178,120 -176,30Z" fill="url(#clay)" stroke="#4b6b3a" stroke-width="5"/>
    ${[[-100,-30],[80,-60],[-40,60],[120,60],[0,150],[-110,100],[30,-100],[-60,-90]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${5 + (i % 3) * 3}" fill="#5d8f4c" opacity="0.5"/>`).join('')}${cracks}</g></g></g>`;
}
function redSvg(r) {
  if (r <= 0.02) return '';
  return `<g opacity="${clamp(r)}"><ellipse cx="-124" cy="52" rx="74" ry="52" fill="#e3342f" opacity="0.5" filter="url(#blur8)"/><ellipse cx="124" cy="52" rx="74" ry="52" fill="#e3342f" opacity="0.5" filter="url(#blur8)"/>
    <ellipse cx="0" cy="44" rx="40" ry="30" fill="#e3342f" opacity="0.55" filter="url(#blur8)"/><ellipse cx="0" cy="-92" rx="100" ry="34" fill="#e3342f" opacity="0.4" filter="url(#blur8)"/><ellipse cx="0" cy="150" rx="70" ry="26" fill="#e3342f" opacity="0.38" filter="url(#blur8)"/>
    ${[[-150, 90], [150, 90], [-100, -20], [100, -20], [-60, 120], [60, 120]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${12 + (i % 3) * 4}" fill="#ff5a4a" opacity="0.5"/>`).join('')}</g>`;
}
function glowSvg(g) {
  if (g <= 0.02) return '';
  return `<g opacity="${clamp(g)}"><ellipse cx="0" cy="40" rx="190" ry="180" fill="#ffe2b8" opacity="0.12" filter="url(#blur20)"/>
    <ellipse cx="-24" cy="-92" rx="84" ry="26" fill="#fff" opacity="0.38" filter="url(#blur8)"/><ellipse cx="-120" cy="34" rx="46" ry="24" fill="#fff" opacity="0.34" filter="url(#blur8)"/><ellipse cx="120" cy="34" rx="46" ry="24" fill="#fff" opacity="0.3" filter="url(#blur8)"/>
    <ellipse cx="0" cy="36" rx="18" ry="8" fill="#fff" opacity="0.5" filter="url(#blur8)"/><ellipse cx="0" cy="152" rx="44" ry="12" fill="#fff" opacity="0.3" filter="url(#blur8)"/></g>`;
}
const CURLS = (() => { const a = []; for (let i = 0; i < 26; i++) { const t = Math.PI * (1.05 + (i / 25) * 0.9), r = 200 + (i % 3) * 18; a.push(`<circle cx="${Math.cos(t) * r * 1.02}" cy="${Math.sin(t) * r * 0.95 - 8}" r="${46 + (i % 4) * 7}" fill="${HAIR}" ${O8}/>`); } return a.join(''); })();
const HAIRHI = `<g opacity="0.35">${[...Array(8)].map((_, i) => `<path d="M${-150 + i * 40},${-215 - (i % 3) * 14} q25,-20 44,2" stroke="#9a8782" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</g>`;


function makeupSvg(mk, blinkOpen) {
  if (!mk) return '';
  const f = clamp(mk.found || 0), ghost = (mk.shade || 'pale') === 'pale', C = mk.cols || {};
  const base = f > 0.02 ? `<clipPath id="faceClip"><ellipse cx="0" cy="34" rx="198" ry="178"/></clipPath><g clip-path="url(#faceClip)" opacity="${ghost ? 0.88 * f : 0.3 * f}"><ellipse cx="0" cy="40" rx="200" ry="200" fill="${ghost ? '#f6efe6' : '#a96a42'}"/></g>` : '';
  const dew = f > 0.5 && !ghost ? `<ellipse cx="-70" cy="-96" rx="86" ry="30" fill="#fff" opacity="${0.16 * f}" filter="url(#blur8)"/>` : '';
  const bl = clamp(mk.blush || 0), bc = C.blush || '#ff8f7a', blx = mk.blushHigh ? 56 : 74;
  const blush = bl > 0.02 ? [-1, 1].map((s) => `<ellipse cx="${s * 124}" cy="${blx}" rx="${mk.blushHigh ? 56 : 40}" ry="${mk.blushHigh ? 30 : 38}" fill="${bc}" opacity="${0.55 * bl}" filter="url(#blur8)" transform="rotate(${s * (mk.blushHigh ? -14 : 0)} ${s * 124} ${blx})"/>`).join('') : '';
  const ct = clamp(mk.contour || 0), contour = ct > 0.02 ? [-1, 1].map((s) => `<path d="M${s * 196},40 Q${s * 150},70 ${s * 108},118" stroke="${C.contour || '#4a2410'}" stroke-width="30" fill="none" stroke-linecap="round" opacity="${0.32 * ct}" filter="url(#blur8)"/>`).join('') + `<ellipse cx="0" cy="-190" rx="120" ry="26" fill="${C.contour || '#4a2410'}" opacity="${0.22 * ct}" filter="url(#blur8)"/>` : '';
  const hl = clamp(mk.highlight || 0), hc = C.hl || '#fff4d6', highlight = hl > 0.02 ? [-1, 1].map((s) => `<ellipse cx="${s * 150}" cy="18" rx="28" ry="9" fill="${hc}" opacity="${0.85 * hl}" transform="rotate(${s * -28} ${s * 150} 18)" filter="url(#blur8)"/>`).join('') + `<path d="M0,-30 L0,28" stroke="${hc}" stroke-width="12" stroke-linecap="round" opacity="${0.5 * hl}" filter="url(#blur8)"/><ellipse cx="0" cy="80" rx="16" ry="7" fill="${hc}" opacity="${0.5 * hl}" filter="url(#blur8)"/><ellipse cx="0" cy="136" rx="22" ry="8" fill="${hc}" opacity="${0.4 * hl}" filter="url(#blur8)"/>` : '';
  const sh = clamp(mk.shadow || 0), sc = C.shadow || ['#8a4b1e', '#e0a84a', '#f6d98a'];
  const shadow = sh > 0.02 ? `<defs><linearGradient id="shG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${sc[0]}"/><stop offset="0.5" stop-color="${sc[1]}"/><stop offset="1" stop-color="${sc[2]}"/></linearGradient></defs>` + [-78, 78].map((x) => `<ellipse cx="${x}" cy="${mk.lift ? -66 : -58}" rx="${mk.wide ? 64 : 54}" ry="${(mk.lift ? 30 : 24) + 8 * (1 - blinkOpen)}" fill="url(#shG)" opacity="${0.95 * sh}"/><ellipse cx="${x + (x < 0 ? 16 : -16)}" cy="-52" rx="18" ry="9" fill="${C.inner || '#fff6cf'}" opacity="${0.85 * sh}"/>`).join('') : '';
  const sp = clamp(mk.sparkle || 0), spark = sp > 0.02 ? [-1, 1].map((s) => [...Array(9)].map((_, i) => `<circle cx="${s * (50 + i * 9)}" cy="${-60 + (i % 3) * 9 - Math.sin(i) * 6}" r="${1.8 + (i % 3)}" fill="#fff" opacity="${0.9 * sp}"/>`).join('') + `<circle cx="${s * 62}" cy="-50" r="5" fill="${C.gem || '#fff'}" stroke="#fff" stroke-width="1.5" opacity="${sp}"/>`).join('') : '';
  const ln = clamp(mk.liner || 0), lc = C.liner || '#1a0d12', wing = mk.wing ?? 1;
  const liner = ln > 0.02 ? [[-1, -78, mk.linerL ?? 1], [1, 78, mk.linerR ?? 1]].map(([s, x, q]) => q < 0.02 ? '' : `<path d="M${x - s * 38},-36 Q${x},-58 ${x + s * 38},-36 Q${x + s * 62 * wing * q},-44 ${x + s * (40 + 40 * wing * q)},-${44 + 24 * wing * q}" stroke="${lc}" stroke-width="${(mk.thick || 5) * ln}" fill="none" stroke-linecap="round"/>`).join('') : '';
  const ls = clamp(mk.lash || 0), lashes = ls > 0.02 ? [[-1, -78], [1, 78]].map(([s, x]) => [...Array(8)].map((_, i) => `<path d="M${x - 36 + i * 10.5},${-44 - Math.sin(i / 7 * Math.PI) * 14} l${s * 11 * ls},${-20 * ls - (i % 2) * 8 * ls}" stroke="#0a0508" stroke-width="4.5" stroke-linecap="round"/>`).join('')).join('') : '';
  const fr = clamp(mk.freckles || 0), freckles = fr > 0.02 ? [-1, 1].map((s) => [...Array(14)].map((_, i) => `<circle cx="${s * (30 + (i * 13) % 70)}" cy="${34 + (i * 7) % 26}" r="${1.8 + (i % 3) * 0.7}" fill="#5a2d14" opacity="${0.55 * fr}"/>`).join('')).join('') : '';
  const gl = clamp(mk.glitter || 0), glit = gl > 0.02 ? [...Array(46)].map((_, i) => { const sd = ((i * 7919 + 13) % 1009) / 1009, sd2 = ((i * 104729 + 7) % 997) / 997; const x = (sd - 0.5) * 300, y = -120 + sd2 * 230; const cols = ['#ffe14d', '#ff9ad0', '#ffffff', '#c4b5fd']; return `<path transform="translate(${x.toFixed(1)},${y.toFixed(1)})" d="M0,-4 L1.6,0 L0,4 L-1.6,0Z" fill="${cols[i % 4]}" opacity="${(0.5 + 0.5 * ((i * 37) % 10) / 10) * gl}"/>`; }).join('') : '';
  return `${base}${dew}${contour}${blush}${highlight}${freckles}${glit}`;
}
function headSvg(p) {
  const hr = { ...HAIR_DEFAULT, ...(p.hair || {}) };
  const yaw = p.yaw || 0, jaw = clamp(p.mouth.open, 0, 1) * 26;
  const sm = clamp(p.mouth.smile, -1, 1), up = Math.max(0, sm);
  const sk = p.skin || { acne: 1, mask: 0, dry: 0, foam: 0, patch: 0, glow: 0 };
  const fx = yaw * 26;                                   // desplazamiento de rasgos por giro de cabeza
  const squint = clamp(p.squint + up * 0.45, 0, 1);      // AU6: mejillas suben al sonreir de verdad
  const brL = p.brow.l, brR = p.brow.r;
  const furrow = Math.max(0, -(brL.i + brR.i) / 2);
  const wrinkle = Math.max(0, (brL.r + brR.r) / 2 - 0.35);
  const ear = (s) => `<ellipse cx="${s * (205 * (1 - 0.07 * Math.min(SLIM, 1.4)) + (s > 0 ? -yaw * 24 : -yaw * 12))}" cy="8" rx="${32 * (s > 0 ? 1 - 0.3 * Math.max(0, yaw) : 1 + 0.1 * Math.max(0, yaw))}" ry="50" fill="${SKINB}" ${O8}/>`;
  return `<g>${hr.hd ? hdBack(hr) : hairBehind(hr)}
    ${FEM > 0.02 ? `` : `<ellipse cx="${yaw * 6}" cy="${60 + jaw * 0.6}" rx="${188 * (1 - 0.14 * Math.min(SLIM, 1.4) - 0.06 * FACEW)}" ry="${170 + jaw * 0.6}" fill="${SKINB}" ${O8}/>`}
    <ellipse cx="${yaw * 4}" cy="${150 + jaw * 0.9}" rx="130" ry="22" fill="#000" opacity="0.16" filter="url(#blur8)"/>
    ${FEM > 0.02 ? `<path d="${femPathStr(yaw)}" fill="${SKIN}" ${O8}/>` : `<ellipse cx="${yaw * 4}" cy="0" rx="${208 * (1 - 0.07 * Math.min(SLIM, 1.4) - 0.03 * FACEW)}" ry="210" fill="${SKIN}" ${O8}/>`}
    <ellipse cx="${-70 + yaw * 10}" cy="-70" rx="110" ry="80" fill="#fff" opacity="0.13" filter="url(#blur20)"/>
    <ellipse cx="${90 + yaw * 10}" cy="${130 + jaw * 0.6}" rx="150" ry="70" fill="#000" opacity="0.18" filter="url(#blur20)"/>
    ${ear(-1)}${ear(1)}
    ${hr.hd ? `<g transform="translate(${yaw * 10},0)">${hdTop(hr, yaw)}</g>` : `<g transform="translate(${yaw * 10},0)">${hairCurly(hr)}${hairTop(hr)}</g>`}
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
      ${FEM > 0.02 ? `<clipPath id="femClip"><path d="${femPathStr(yaw)}"/></clipPath><g clip-path="url(#femClip)">` : ''}${makeupSvg(p.makeup, 1 - clamp(p.blink.l))}${pimplesSvg(sk.acne)}${patchesSvg(sk.acne, sk.patch)}${foamSvg(sk.foam, p.tearT || 0)}${maskSvg(sk.mask, sk.dry)}${FEM > 0.02 ? '</g>' : ''}
      ${eyeSvg(-78, p.lid.l, p.blink.l, squint, p.gaze.x, p.gaze.y, p.tears, p.tearT, 1, p.makeup)}${eyeSvg(78, p.lid.r, p.blink.r, squint, p.gaze.x, p.gaze.y, p.tears, p.tearT, -1, p.makeup)}
      ${(() => { const bs = p.browStyle || {}; const kl = bs.kl ?? bs.k ?? 0, kr = bs.kr ?? bs.k ?? 0, rd = bs.red || 0; return `${rd > 0.02 ? [-1, 1].map((s) => `<ellipse cx="${s * 76}" cy="-84" rx="72" ry="22" fill="#ff5a5a" opacity="${0.35 * rd}" filter="url(#blur8)"/>`).join('') : ''}${browSvg(-1, brL.r, brL.i, kl, bs.shortL || 0)}${browSvg(1, brR.r, brR.i, kr, bs.shortR || 0)}<ellipse cx="0" cy="${-70 + (brL.r + brR.r) * -10}" rx="18" ry="12" fill="#0f0a08" opacity="${clamp(1 - Math.max(kl, kr) * 2.2)}"/>`; })()}
      <g transform="translate(${yaw * 14},${(p.breath || 0) * 1.2})">
        <ellipse cx="0" cy="48" rx="${34 + (p.flare || 0) * 3}" ry="26" fill="#7d4524" ${O8}/><ellipse cx="-9" cy="38" rx="10" ry="6" fill="#fff" opacity="0.4"/>
        <ellipse cx="-12" cy="58" rx="${7 + (p.flare || 0) * 2}" ry="5" fill="#2a130a"/><ellipse cx="12" cy="58" rx="${7 + (p.flare || 0) * 2}" ry="5" fill="#2a130a"/>
      </g>
      ${FEM > 0.02 ? '<g clip-path="url(#femClip)">' : ''}${glowSvg(sk.glow)}${redSvg(sk.red || 0)}${faceWrinkles(FACEW, yaw)}${femFace(FEM, SKINT)}${FEM > 0.02 ? '</g>' : ''}
      ${FEM > 0.02 ? `<g clip-path="url(#femClip)" fill="none"><path d="${femPathStr(yaw)}" stroke="#3a1a0a" stroke-width="22" opacity="${0.34 * FEM}" filter="url(#blur3)"/><path d="M${yaw * 4 - 128},112 C${yaw * 4 - 104},166 ${yaw * 4 - 64},196 ${yaw * 4 - 26},208 M${yaw * 4 + 128},112 C${yaw * 4 + 104},166 ${yaw * 4 + 64},196 ${yaw * 4 + 26},208" stroke="#ffe2c4" stroke-width="5" stroke-linecap="round" opacity="${0.32 * FEM}"/></g>` : ''}
      <g transform="translate(${yaw * 6},${102 + jaw * 0.8 + (p.mouth.lip ? 14 : 0)})">${(p.mouth.lip && (p.mouth.lipP ?? 1) < 1) ? `<defs><clipPath id="lipSw"><rect x="-130" y="-90" width="${(260 * clamp(p.mouth.lipP)).toFixed(1)}" height="260"/></clipPath></defs>${mouthSvg({ ...p.mouth, lip: null }, yaw)}<g clip-path="url(#lipSw)">${mouthSvg(p.mouth, yaw)}</g>` : mouthSvg(p.mouth, yaw)}</g>
      ${(() => { const mk = p.makeup || {}; const m = mk.mole ?? 1, sc = mk.scab ?? 0; return `${m > 0.02 ? `<g transform="translate(108,70)" opacity="${m}"><circle r="9" fill="#2a1208" stroke="${OUT}" stroke-width="3"/><path d="M-2,-8 q-6,-18 -2,-28 M3,-8 q4,-16 12,-22 M6,-4 q16,-6 24,-4" stroke="#12090a" stroke-width="3" fill="none" stroke-linecap="round"/></g>` : ''}${sc > 0.02 ? `<g transform="translate(124,50)" opacity="${sc}"><circle r="12" fill="#e3342f" opacity="0.35"/><circle r="6.5" fill="#6b2a1a" stroke="#3a1409" stroke-width="2"/></g>` : ''}`; })()}
      ${FEM > 0.02 ? '<g clip-path="url(#femClip)">' : ''}<ellipse cx="-46" cy="-56" rx="30" ry="12" fill="#fff" opacity="0.14" filter="url(#blur8)"/>
      <ellipse cx="-130" cy="20" rx="40" ry="18" fill="#2e1a0c" opacity="0.3" filter="url(#blur8)"/><ellipse cx="110" cy="110" rx="46" ry="16" fill="#2e1a0c" opacity="0.3" filter="url(#blur8)"/>${FEM > 0.02 ? '</g>' : ''}
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
  if (GYM) return `M-78,-96 C-150,-92 -262,-52 -312,34 C-352,110 -368,190 -364,270 C-362,340 -352,420 -330,500 Q0,540 330,500 C352,420 362,340 364,270 C368,190 352,110 312,34 C262,-52 150,-92 78,-96 Z`;
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

function gymTopDetail(g) { const c = g.top === 'white' ? '#9ca3af' : g.top === 'black' ? '#ff4d8d' : '#fff';
  return `<rect x="-380" y="-110" width="760" height="520" fill="url(#gyKnit)" opacity="0.5"/><path d="M-120,-96 Q0,-40 120,-96 L120,-60 Q0,-6 -120,-60Z" fill="${c}" opacity="0.55"/><path d="M-330,150 Q0,230 330,150" stroke="#000" stroke-opacity="0.2" stroke-width="10" fill="none"/><path d="M-330,380 Q0,420 330,380" stroke="${c}" stroke-width="16" fill="none" opacity="0.8"/><path d="M-260,40 Q-300,200 -280,360" stroke="#fff" stroke-opacity="0.12" stroke-width="14" fill="none" stroke-linecap="round"/>${g.logo ? `<text x="0" y="250" font-family="Anton" font-size="84" text-anchor="middle" fill="${c}" opacity="0.9" letter-spacing="6">GYM</text>` : ''}`; }
function gymShoe(side, sty = 'A') { const s = side;
  const P = { A: { acc: '#ec4899', acc2: '#fbcfe8', dk: '#9d174d' }, B: { acc: '#64748b', acc2: '#cbd5e1', dk: '#334155' }, C: { acc: '#a855f7', acc2: '#e9d5ff', dk: '#6b21a8' } }[sty] || {};
  const chunky = sty === 'B', hi = sty === 'C'; const MS = chunky ? 30 : 20; const gid = 'sn' + sty + (s > 0 ? 'r' : 'l');
  const top = hi ? 540 : 590;                                            // altura del cuello
  const upper = `M-96,690 L-100,${top + 56} Q-102,${top + 14} -86,${top + 4} Q-66,${top - 4} -46,${top + 2} Q-28,${top + 16} -10,${top + 12} L4,${top - 12} Q18,${top - 20} 28,${top - 6} L58,${top + 40} Q98,${top + 52} 112,${top + 78} Q122,${top + 102} 110,696 L-92,696Z`;
  const mesh = `<pattern id="${gid}m" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="1.5" cy="1.5" r="0.95" fill="#8b95a5" fill-opacity="0.6"/><circle cx="4.5" cy="4.5" r="0.95" fill="#8b95a5" fill-opacity="0.6"/></pattern>`;
  const laceOn = (t) => ({ x: lerp(-6, 54, t), y: lerp(top + 6, top + 44, t) });
  const laces = [0, 1, 2, 3, 4].map((i) => { const t = (i + 0.4) / 5, p = laceOn(t), nx = 0.55, ny = -0.83; const x1 = p.x - nx * 11, y1 = p.y - ny * 11, x2 = p.x + nx * 11, y2 = p.y + ny * 11;
    return `<path d="M${(x1 - 6).toFixed(1)},${(y1 + 4).toFixed(1)} L${(x2 + 6).toFixed(1)},${(y2 - 4).toFixed(1)}" stroke="${OUT}" stroke-width="8" stroke-linecap="round"/><path d="M${(x1 - 6).toFixed(1)},${(y1 + 4).toFixed(1)} L${(x2 + 6).toFixed(1)},${(y2 - 4).toFixed(1)}" stroke="#fff" stroke-width="4.8" stroke-linecap="round"/><path d="M${(x1 - 4).toFixed(1)},${(y1 + 3).toFixed(1)} L${(x2 + 4).toFixed(1)},${(y2 - 5).toFixed(1)}" stroke="#cbd5e1" stroke-width="1" opacity="0.8"/><circle cx="${(p.x - 6).toFixed(1)}" cy="${(p.y + 9).toFixed(1)}" r="3.2" fill="#e5e7eb" stroke="${OUT}" stroke-width="1.8"/><circle cx="${(p.x + 9).toFixed(1)}" cy="${(p.y - 10).toFixed(1)}" r="3.2" fill="#e5e7eb" stroke="${OUT}" stroke-width="1.8"/>`; }).join('');
  const bow = `<g transform="translate(-14,${top + 4})"><path d="M0,0 C-26,-22 -40,-4 -24,8 C-14,12 -6,6 0,0Z" fill="#fff" stroke="${OUT}" stroke-width="3.2"/><path d="M0,0 C22,-26 38,-14 28,0 C20,8 8,6 0,0Z" fill="#fff" stroke="${OUT}" stroke-width="3.2"/><circle r="5" fill="#fff" stroke="${OUT}" stroke-width="3"/><path d="M-2,4 q-10,22 -20,30 M2,4 q8,22 16,32" stroke="${OUT}" stroke-width="6.5" fill="none" stroke-linecap="round"/><path d="M-2,4 q-10,22 -20,30 M2,4 q8,22 16,32" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round"/></g>`;
  const inner = `<g transform="scale(${s},1)"><defs>${mesh}<linearGradient id="${gid}u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.65" stop-color="#eef2f6"/><stop offset="1" stop-color="#c3ccd8"/></linearGradient><linearGradient id="${gid}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d5dbe4"/></linearGradient></defs>
    <ellipse cx="6" cy="${718 + (MS - 20) * 0.6}" rx="138" ry="20" fill="#000" opacity="0.3"/>
    <path d="M-104,${690 - 2} L116,${692} Q132,${704} 118,${698 + MS} L-98,${702 + MS} Q-112,${690 + MS / 2} -104,688Z" fill="url(#${gid}s)" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M-100,${700 + MS - 6} L118,${696 + MS - 6}" stroke="#aab4c2" stroke-width="3" opacity="0.8"/><path d="M-100,${696} Q8,${704} 116,${698}" stroke="${P.acc}" stroke-width="6" fill="none"/>
    ${[...Array(12)].map((_, i) => `<path d="M${-86 + i * 17.5},${700 + MS - 14} v7" stroke="#8b95a5" stroke-width="2.6" stroke-linecap="round" opacity="0.7"/>`).join('')}
    <path d="M-98,${702 + MS} L118,${698 + MS}" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/>
    <path d="${upper}" fill="url(#${gid}u)" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><path d="${upper}" fill="url(#${gid}m)"/>
    <path d="M60,${top + 42} Q100,${top + 54} 112,${top + 80} Q121,${top + 102} 109,694 L70,694 Q82,${top + 90} 60,${top + 42}Z" fill="#fff" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M64,${top + 50} Q96,${top + 62} 104,${top + 84}" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4 3.4" fill="none"/>${[0, 1, 2, 3].map((i) => `<circle cx="${96 + i * 3}" cy="${top + 74 + i * 6}" r="1.8" fill="#8b95a5"/>`).join('')}
    <path d="M-92,${top + 72} Q-40,${top + 70} 10,${top + 84} Q52,${top + 96} 64,${top + 60} L72,${top + 62} Q60,${top + 112} 8,${top + 104} Q-44,${top + 92} -92,${top + 92}Z" fill="${P.acc}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M-84,${top + 78} Q-36,${top + 76} 10,${top + 90} Q46,${top + 100} 60,${top + 66}" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.7"/>
    <path d="M-100,${top + 56} L-100,${top + 8} Q-104,${top - 4} -86,${top - 6} L-84,${top + 56}Z" fill="#fff" stroke="${OUT}" stroke-width="4.5" stroke-linejoin="round"/><path d="M-98,${top + 50} L-98,${top + 14}" stroke="${P.acc}" stroke-width="6" stroke-linecap="round"/>
    <path d="M-86,${top + 4} Q-66,${top - 10} -46,${top - 2} Q-28,${top + 12} -10,${top + 8} L4,${top - 16} Q18,${top - 24} 30,${top - 8}" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-86,${top + 4} Q-66,${top - 10} -46,${top - 2} Q-28,${top + 12} -10,${top + 8} L4,${top - 16} Q18,${top - 24} 30,${top - 8}" stroke="${OUT}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
    <path d="M6,${top - 12} Q18,${top - 20} 26,${top - 6} L44,${top + 26} Q26,${top + 30} 8,${top + 18}Z" fill="#f8fafc" stroke="${OUT}" stroke-width="4.5" stroke-linejoin="round"/><rect x="10" y="${top - 4}" width="20" height="9" rx="3" fill="${P.acc}" stroke="${OUT}" stroke-width="2.2" transform="rotate(32 20 ${top})"/>
    ${laces}${bow}
    <ellipse cx="26" cy="${top + 64}" rx="34" ry="8" fill="#fff" opacity="0.6" transform="rotate(14 26 ${top + 64})"/><path d="M-90,688 Q-92,${top + 100} -88,${top + 92}" stroke="#fff" stroke-width="3" opacity="0.5" fill="none"/>
  </g>`;
  return `<g transform="translate(${s * 10},0)">${inner}</g>`; }
function gymPantDetail(len, w1) { return `<rect x="${-w1}" y="0" width="${2 * w1}" height="${len}" fill="url(#gyKnit)" opacity="0.55"/>`; }
function legSvg(side, leg) {
  const hx = side * 100, hy = 520;
  const thighRot = leg.thigh || 0, kneeRot = leg.knee || 0;
  const pant = (len, w0, wm, w1) => `<path d="${taper(len, w0, wm, w1)}" fill="${PANTS}" ${O8}/><path d="${taper(len, w0, wm, w1)}" fill="url(#pantG)"/>${GYM ? `<clipPath id="lc${side}"><path d="${taper(len, w0, wm, w1)}"/></clipPath><g clip-path="url(#lc${side})">${gymPantDetail(len, w0)}<path d="M${-side * (w0 * 0.55)},0 L${-side * (w1 * 0.55)},${len}" stroke="#fff" stroke-width="8" opacity="0.85"/></g>` : ''}`;
  return `<g transform="translate(${hx},${hy}) rotate(${thighRot})">
    ${pant(112, 92, 88, 66)}
    <g transform="translate(0,108) rotate(${kneeRot})">
      <path d="${taper(96, 56, 56, 40)}" fill="${SKINB}" ${O8} transform="translate(0,20)"/><path d="${taper(96, 56, 56, 40)}" fill="url(#limbG)" transform="translate(0,20)"/>
      <path d="${taper(62, 70, 66, 62)}" fill="${PANTS}" ${O8} transform="translate(0,-8)"/><path d="${taper(62, 70, 66, 62)}" fill="url(#pantG)" transform="translate(0,-8)"/>
      ${GYM ? `<rect x="-62" y="52" width="124" height="22" rx="6" fill="#8a919d" stroke="${OUT}" stroke-width="5"/>${[...Array(9)].map((_, i) => `<path d="M${-54 + i * 13.5},54 v18" stroke="#fff" stroke-opacity="0.35" stroke-width="2.4"/>`).join('')}` : '<path d="M-62,62 l9,-8 l7,10 l8,-9 l9,10 l8,-9 l9,10 l8,-9 l8,10 l8,-9 l8,8" stroke="#e9d9b8" stroke-width="3" fill="none"/>'}
      ${GYM ? '' : `<ellipse cx="0" cy="-6" rx="38" ry="28" fill="${SKINB}" stroke="${OUT}" stroke-width="5"/><path d="M-30,-14 l8,6 l6,-8 l7,8 l7,-8 l7,8 l8,-6" stroke="#e9d9b8" stroke-width="3" fill="none"/>`}
      <path d="M-18,0 q18,12 36,0" stroke="#000" stroke-opacity="0.22" stroke-width="4" fill="none"/>
      <ellipse cx="${-side * 22}" cy="62" rx="9" ry="12" fill="#fff" opacity="0.1"/>
      <g transform="translate(0,120) rotate(${-(thighRot + kneeRot)}) translate(0,-650)">${GYM ? gymShoe(side, GYM.shoe) : foot(0, O8, SKINB, true, side < 0 ? '#e8629c' : '#7fb069')}</g>
    </g>
  </g>`;
}

function armSvg(side, arm) {
  const k = arm.rot1 !== undefined ? { S: { x: side * 296 * Math.max(0.46, 1 - 0.115 * SLIM), y: 58 }, rot1: arm.rot1, rot2: arm.rot2 } : solveArm(side, arm.t);
  const wrist = arm.w || 0;
  const aw0 = Math.max(0.5, 1 - 0.12 * SLIM), aw = Math.max(0.5, 1 - 0.12 * SLIM), sw = Math.max(0.62, 1 - 0.07 * SLIM), hs = 0.95 * Math.max(0.74, 1 - 0.06 * SLIM);
  const sleeve = `<g transform="translate(0,-26) scale(${sw},1)"><path d="${taper(112, 82, 84, 74)}" fill="${SHIRT}" ${O8}/><path d="${taper(112, 82, 84, 74)}" fill="url(#pantG)" opacity="0.55"/>
      ${GYM ? `<path d="M-76,96 Q0,116 76,96 L72,118 Q0,138 -72,118Z" fill="#8a919d" stroke="${OUT}" stroke-width="5"/>${[0,1,2,3,4,5].map((i) => `<path d="M${-58 + i * 23},100 v18" stroke="#fff" stroke-opacity="0.35" stroke-width="2.4"/>`).join('')}` : `<path d="M-72,74 Q0,92 72,74" stroke="#2ecc71" stroke-width="16" fill="none" opacity="0.9"/><path d="M-76,100 Q0,122 76,100 L72,122 Q0,144 -72,122Z" fill="#c95f12" stroke="${OUT}" stroke-width="5" transform="translate(0,-8)"/>`}</g>`;
  return `<g transform="translate(${k.S.x},${k.S.y}) rotate(${k.rot1})">
    <path d="${taper(L1 + 6, 58 * Math.max(0.5, 1 - 0.12 * SLIM), 62 * Math.max(0.5, 1 - 0.12 * SLIM), 46 * Math.max(0.55, 1 - 0.1 * SLIM))}" fill="${SKINB}" ${O8}/><path d="${taper(L1 + 6, 58 * Math.max(0.5, 1 - 0.12 * SLIM), 62 * Math.max(0.5, 1 - 0.12 * SLIM), 46 * Math.max(0.55, 1 - 0.1 * SLIM))}" fill="url(#limbG)"/>${BODYW > 0.02 ? `<g opacity="${(0.55 * BODYW).toFixed(2)}" stroke="#2a1208" stroke-linecap="round" fill="none">${[0,1,2,3,4,5].map((i) => `<path d="M${-18 * aw0},${40 + i * 18} q${18 * aw0},${6 + (i % 2) * 5} ${36 * aw0},${(i % 3) - 1}" stroke-width="${2.6 + (i % 2)}"/>`).join('')}<path d="M${-22 * aw0},${L1 - 30} q${20 * aw0},22 ${44 * aw0},0" stroke-width="4"/></g>` : ''}
    <g transform="translate(0,${L1}) rotate(${k.rot2})">
      <path d="${taper(L2 + 8, 46 * aw, 50 * aw, 34 * aw)}" fill="${SKINB}" ${O8}/><path d="${taper(L2 + 8, 46 * aw, 50 * aw, 34 * aw)}" fill="url(#limbG)"/>
      <path d="M-26,8 q26,18 52,0" stroke="#000" stroke-opacity="0.25" stroke-width="4" fill="none"/>${BODYW > 0.02 ? `<g opacity="${(0.5 * BODYW).toFixed(2)}" stroke="#2a1208" stroke-linecap="round" fill="none">${[0,1,2,3,4].map((i) => `<path d="M${-16 * aw},${30 + i * 20} q${16 * aw},${5 + (i % 2) * 4} ${32 * aw},${(i % 3) - 1}" stroke-width="${2.4 + (i % 2)}"/>`).join('')}</g>` : ''}<ellipse cx="${-side * 10}" cy="2" rx="14" ry="9" fill="#fff" opacity="0.12"/>
      <path d="M-26,70 q-6,26 0,52 M10,66 q8,28 2,56" stroke="#000" stroke-opacity="0.12" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g transform="translate(0,${L2}) rotate(${wrist})">
        <ellipse cx="0" cy="-4" rx="${38 * aw}" ry="10" fill="#ff7ab6" stroke="${OUT}" stroke-width="4"/>${[-24, -8, 8, 24].map((x) => `<circle cx="${x * aw}" cy="-4" r="4.5" fill="#ffe14d" stroke="${OUT}" stroke-width="1.5"/>`).join('')}
        <g transform="scale(${hs})">${hand(0, 34, side, O8, SKINB, true, arm.curl ?? 0.3, arm.spread ?? 0.15, arm.tt || 0)}</g>
      </g>
    </g>
    ${sleeve}
  </g>`;
}


// ---------- ropa elegante / traje neon / joyas / tacones ----------
const GOWN_PATH = 'M-78,-96 C-150,-92 -262,-52 -312,34 C-352,110 -368,190 -364,270 C-360,330 -346,380 -352,430 C-362,520 -396,640 -424,742 Q0,800 424,742 C396,640 362,520 352,430 C346,380 360,330 364,270 C368,190 352,110 312,34 C262,-52 150,-92 78,-96 Z';
const GYM_DEFS = `<defs><linearGradient id="gyPant" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b7280"/><stop offset="0.45" stop-color="#a8afb9"/><stop offset="1" stop-color="#69707c"/></linearGradient>
  <pattern id="gyKnit" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="none"/><path d="M0,9 L4.5,0 L9,9" stroke="#fff" stroke-opacity="0.16" stroke-width="1.6" fill="none"/><circle cx="2" cy="3" r="0.8" fill="#3b4150" fill-opacity="0.5"/><circle cx="6.5" cy="6.5" r="0.8" fill="#fff" fill-opacity="0.25"/></pattern>
  <linearGradient id="gyTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8fc6"/><stop offset="0.5" stop-color="#ec4899"/><stop offset="1" stop-color="#a21d63"/></linearGradient>
  <linearGradient id="gyTopW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#e5e7eb"/><stop offset="1" stop-color="#b6bcc6"/></linearGradient>
  <linearGradient id="gyTopK" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3f4c"/><stop offset="0.5" stop-color="#1f232d"/><stop offset="1" stop-color="#0f1218"/></linearGradient></defs>`;
const OUTFIT_DEFS = `<defs>
  <linearGradient id="gownG" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0" stop-color="#064e3b"/><stop offset="0.22" stop-color="#10b981"/><stop offset="0.38" stop-color="#6ee7b7"/><stop offset="0.52" stop-color="#059669"/><stop offset="0.8" stop-color="#065f46"/><stop offset="1" stop-color="#022c22"/></linearGradient>
  <linearGradient id="neonG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff2bd6"/><stop offset="0.5" stop-color="#fff200"/><stop offset="1" stop-color="#00f0ff"/></linearGradient>
  <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.5" stop-color="#d4a017"/><stop offset="1" stop-color="#8a6508"/></linearGradient>
  <clipPath id="gownClip"><path d="${GOWN_PATH}"/></clipPath></defs>`;
function jewelHead(of) {
  const j = of && of.jewel ? clamp(of.jewel) : 0; if (j <= 0.02) return '';
  const drop = (s) => `<g transform="translate(${s * 205},58)" opacity="${j}"><circle r="9" fill="url(#goldG)" stroke="${OUT}" stroke-width="3"/><path d="M0,9 L0,34" stroke="#d4a017" stroke-width="4"/><path d="M0,30 l-11,22 l11,16 l11,-16Z" fill="url(#goldG)" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/><circle cx="-3" cy="48" r="4" fill="#fff" opacity="0.9"/></g>`;
  return `<g transform="translate(0,0)">${drop(-1)}${drop(1)}</g>`;
}
function gownWrinkles(L) { const o = 0.18 + 0.25 * L; const lines = [[-300,130,-120,230],[300,130,120,230],[-320,300,-150,380],[320,300,150,380],[-210,180,-60,300],[210,180,60,300],[-100,210,-30,330],[100,210,30,330]].map(([x1,y1,x2,y2]) => `<path d="M${x1},${y1} Q${(x1+x2)/2 + (x1<0?-18:18)},${(y1+y2)/2 + 26} ${x2},${y2}" stroke="#021f17" stroke-width="${7 + 4 * L}" fill="none" stroke-linecap="round" opacity="${o}"/><path d="M${x1 + (x1<0?10:-10)},${y1 - 2} Q${(x1+x2)/2 + (x1<0?-6:6)},${(y1+y2)/2 + 20} ${x2 + (x1<0?10:-10)},${y2 - 2}" stroke="#a7f3d0" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="${o * 0.8}"/>`).join('');
  const belt = [-1,1].map((s) => [0,1,2,3].map((i) => `<path d="M${s * (60 + i * 44)},392 q${s * 8},-30 ${s * 2},-66" stroke="#021f17" stroke-width="${6 + 3 * L}" fill="none" stroke-linecap="round" opacity="${o}"/>`).join('')).join('');
  const fine = [...Array(46)].map((_, i) => { const x = -330 + (i * 61) % 660, y = 60 + (i * 97) % 640, l = 40 + (i % 5) * 18, sg = i % 2 ? 1 : -1; return `<path d="M${x},${y} q${sg * 10},${l / 2} ${sg * 2},${l}" stroke="#021f17" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${(0.3 * L).toFixed(2)}"/><path d="M${x + 4},${y + 2} q${sg * 10},${l / 2} ${sg * 2},${l}" stroke="#b9f7dc" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="${(0.25 * L).toFixed(2)}"/>`; }).join('');
  const sag = `<path d="M-330,400 Q-160,470 0,440 Q160,470 330,400 L330,430 Q160,500 0,470 Q-160,500 -330,430Z" fill="#064e3b" opacity="${0.3 * L}"/><path d="M-300,640 Q-150,690 0,670 Q150,690 300,640" stroke="#021f17" stroke-width="${6 + 3 * L}" fill="none" opacity="${0.3 * L}"/>`;
  return `<g clip-path="url(#gownClip)">${fine}${sag}${lines}${belt}<path d="M-340,430 Q-150,486 0,470 Q150,486 340,430 L350,470 Q0,520 -350,470Z" fill="#064e3b" opacity="${0.25 * L}"/></g>`; }
function outfitLayer(of, t) {
  if (!of || !of.kind) return '';
  const prog = of.prog ?? 1, neon = of.kind === 'neon', fill = neon ? 'url(#neonG)' : 'url(#gownG)';
  const wipe = `<clipPath id="wipeClip"><rect x="-480" y="-130" width="960" height="${Math.max(0, 900 * clamp(prog))}"/></clipPath>`;
  const sequins = neon ? '' : `<path d="M-340,70 C-200,200 40,330 350,420 L350,470 C60,380 -190,260 -352,128Z" fill="url(#goldG)" stroke="${OUT}" stroke-width="5" opacity="0.9"/>${[...Array(44)].map((_, i) => `<circle cx="${-330 + (i * 83) % 660}" cy="${-20 + (i * 47) % 740}" r="${2.5 + (i % 3)}" fill="#fff" opacity="${0.35 + (i % 4) * 0.12}"/>`).join('')}`;
  const folds = neon ? '' : `${sequins}<g fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="7" stroke-linecap="round"><path d="M-40,430 Q-120,600 -200,742"/><path d="M40,430 Q130,610 220,742"/><path d="M0,440 Q10,600 0,745"/><path d="M-200,430 Q-280,590 -340,730"/><path d="M200,430 Q290,590 350,730"/></g><g fill="none" stroke="#fff" stroke-opacity="0.32" stroke-width="12" stroke-linecap="round"><path d="M-120,440 Q-170,600 -250,740"/><path d="M110,436 Q150,590 190,738"/><path d="M-250,60 Q-300,200 -300,330"/></g><path d="M-300,60 Q-330,200 -320,330" stroke="#000" stroke-opacity="0.18" stroke-width="14" fill="none" filter="url(#blur8)"/><ellipse cx="170" cy="560" rx="210" ry="180" fill="#000" opacity="0.2" filter="url(#blur20)"/>`;
  const neonStuff = neon ? `${[...Array(26)].map((_, i) => `<circle cx="${-300 + (i * 97) % 600}" cy="${-40 + (i * 61) % 760}" r="${9 + i % 3 * 4}" fill="${['#fff', '#ffe14d', '#ff4dd8', '#4df3ff'][i % 4]}" stroke="${OUT}" stroke-width="2.5"/>`).join('')}<path d="M-424,742 ${[...Array(14)].map((_, i) => `l${60},${i % 2 ? 24 : -24}`).join(' ')} L424,742 L424,700 L-424,700Z" fill="#ff2bd6" stroke="${OUT}" stroke-width="5" opacity="0.95"/>` : '';
  const feathers = neon ? `<g>${[-1, 1].map((s) => [...Array(9)].map((_, i) => `<ellipse cx="${s * (250 + i * 8)}" cy="${-30 + i * 34}" rx="60" ry="22" fill="${['#ff2bd6', '#fff200', '#00f0ff'][i % 3]}" stroke="${OUT}" stroke-width="4" transform="rotate(${s * (30 + i * 6)} ${s * (250 + i * 8)} ${-30 + i * 34})"/>`).join('')).join('')}</g>` : '';
  const belt = `<path d="M-346,392 Q0,430 346,392 L350,426 Q0,466 -350,426Z" fill="url(#goldG)" stroke="${OUT}" stroke-width="6"/><rect x="-34" y="396" width="68" height="46" rx="12" fill="url(#goldG)" stroke="${OUT}" stroke-width="6"/><circle cx="0" cy="419" r="9" fill="#10b981" stroke="${OUT}" stroke-width="3"/>`;
  const neck = `<path d="M-96,-98 L0,60 L96,-98 Q0,-50 -96,-98Z" fill="${SKINB}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>`;
  const necklace = of.jewel > 0.02 ? `<g opacity="${of.jewel}"><path d="M-84,-92 Q0,-6 84,-92" stroke="url(#goldG)" stroke-width="9" fill="none" stroke-linecap="round"/>${[-60, -30, 0, 30, 60].map((x) => `<circle cx="${x}" cy="${-72 + Math.abs(x) * -0.18 + 64 * (1 - Math.pow(x / 84, 2)) * 0.9 - 40}" r="7" fill="url(#goldG)" stroke="${OUT}" stroke-width="2.5"/>`).join('')}<path d="M0,-6 l-14,20 l14,22 l14,-22Z" fill="#10b981" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/><circle cx="-3" cy="14" r="3" fill="#fff"/></g>` : '';
  const sparkle = prog > 0 && prog < 1 ? [...Array(7)].map((_, i) => { const y = -130 + 900 * prog, x = -380 + i * 126 + Math.sin(i * 2 + t * 8) * 20; return `<g transform="translate(${x},${y}) rotate(${t * 80 + i * 20}) scale(${0.7 + 0.3 * Math.sin(t * 9 + i)})"><path d="M0,-18 Q4,-4 18,0 Q4,4 0,18 Q-4,4 -18,0 Q-4,-4 0,-18Z" fill="#fff" stroke="${OUT}" stroke-width="3"/></g>`; }).join('') : '';
  const lk = LOOSE ? 1 + 0.15 * LOOSE : 1; const wr = LOOSE ? gownWrinkles(LOOSE) : '';
  return `<g transform="scale(${lk.toFixed(3)},1)">${wipe}<g clip-path="url(#wipeClip)"><path d="${GOWN_PATH}" fill="${fill}" ${O8}/><g clip-path="url(#gownClip)">${folds}${neonStuff}</g><path d="${GOWN_PATH}" fill="none" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/>${neck}${belt}${feathers}${necklace}${wr}</g>${sparkle}</g>`;
}
function heelsLayer(of, p) {
  if (!of || !of.kind || (of.prog ?? 1) < 0.9) return '';
  const lift = p.heel || { l: 0, r: 0 }; const col = of.kind === 'neon' ? '#ff2bd6' : '#111827';
  const heel = (x, up, s) => `<g transform="translate(${x},${748 - up})"><path d="M${-s * 56},0 C${-s * 70},-26 ${-s * 20},-52 ${s * 14},-34 L${s * 90},-6 Q${s * 110},6 ${s * 80},16 L${-s * 48},16 Q${-s * 70},10 ${-s * 56},0Z" fill="${col}" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><path d="M${-s * 52},12 L${-s * 66},58 L${-s * 46},58 L${-s * 30},16Z" fill="url(#goldG)" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M${-s * 30},-30 Q${s * 10},-44 ${s * 60},-12" stroke="#fff" stroke-opacity="0.35" stroke-width="5" fill="none"/></g>`;
  return `<g>${heel(-130, lift.l, 1)}${heel(130, lift.r, -1)}</g>`;
}

export function drawLazy(p) {
  const br = p.breath || 0, sh = (p.shoulders || 0) * 14;
  const of = p.outfit && p.outfit.kind && p.outfit.kind !== 'gym' ? p.outfit : null; const gownOn = of && (of.prog ?? 1) > 0.02; SHIRT = of && (of.prog ?? 1) >= 1 ? (of.kind === 'neon' ? 'url(#neonG)' : 'url(#gownG)') : 'url(#shirt)';
  SLIM = p.slim || 0; LOOSE = (p.outfit && p.outfit.loose) || 0; FACEW = p.faceWrinkle || 0; BODYW = p.bodyWrinkle || 0; FEM = p.fem || 0; SKINT = p.skinTex || null; GYM = (p.outfit && p.outfit.kind === 'gym') ? p.outfit : null; PANTS = GYM ? 'url(#gyPant)' : 'url(#pants)'; if (GYM) SHIRT = GYM.top === 'white' ? 'url(#gyTopW)' : GYM.top === 'black' ? 'url(#gyTopK)' : 'url(#gyTop)';
  const lg = p.legs || { l: {}, r: {} };
  const slimK = Math.max(0.46, 1 - 0.115 * (p.slim || 0));
  const chest = `<g transform="translate(0,230) scale(${(1 + 0.012 * br) * slimK},${1 + 0.016 * br}) translate(0,-230)">
    <!-- cadera + panza -->
    <path d="M-262,470 C-300,510 -296,556 -236,582 L236,582 C296,556 300,510 262,470 Z" fill="${PANTS}" ${O8}/><path d="M-262,470 C-300,510 -296,556 -236,582 L236,582 C296,556 300,510 262,470 Z" fill="url(#pantG)" opacity="0.6"/>
    <path d="M-334,368 C-362,420 -342,492 -262,520 C-120,548 120,548 262,520 C342,492 362,420 334,368 Z" fill="${SKINB}" ${O8}/>
    <path d="M-334,368 C-362,420 -342,492 -262,520 C-120,548 120,548 262,520 C342,492 362,420 334,368 Z" fill="url(#limbG)" opacity="0.8"/>
    <ellipse cx="0" cy="448" rx="24" ry="9" fill="#2a1608" opacity="0.7"/><path d="M-230,490 Q0,540 230,490" stroke="#000" stroke-opacity="0.25" stroke-width="7" fill="none"/><path d="M-300,420 Q-250,470 -170,478" stroke="#fff" stroke-opacity="0.14" stroke-width="9" fill="none" stroke-linecap="round"/>
    ${GYM ? `<path d="M-262,500 Q0,548 262,500 L262,540 Q0,584 -262,540Z" fill="#7f8693" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>${[...Array(30)].map((_, i) => `<path d="M${-250 + i * 17.3},${512 + Math.sin(i * 0.11) * 4} v34" stroke="#fff" stroke-opacity="0.22" stroke-width="3"/>`).join('')}<path d="M-26,538 Q-48,600 -40,640 M26,538 Q50,596 42,636" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="-40" cy="644" r="9" fill="#fff" stroke="${OUT}" stroke-width="3"/><circle cx="42" cy="640" r="9" fill="#fff" stroke="${OUT}" stroke-width="3"/>` : '<path d="M-262,520 Q0,560 262,520" stroke="#e9d9b8" stroke-width="12" fill="none" opacity="0.9"/>'}
    <!-- playera -->
    <path d="${SHIRT_PATH()}" fill="${SHIRT}" ${O8}/>
    <clipPath id="shirtClip2"><path d="${SHIRT_PATH()}"/></clipPath><g clip-path="url(#shirtClip2)">${GYM ? gymTopDetail(GYM) : STRIPES + DOTS + SHIRT_DETAIL}</g>
    <path d="${SHIRT_PATH()}" fill="none" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M-118,-96 Q0,-50 118,-96" fill="${SKINB}" stroke="${OUT}" stroke-width="8"/>${GYM ? `<path d="M-122,-100 Q0,-54 122,-100" stroke="${GYM.top === 'white' ? '#9ca3af' : GYM.top === 'black' ? '#ff4d8d' : '#fff'}" stroke-width="16" fill="none"/>` : `<path d="M-120,-100 Q0,-56 120,-100" stroke="#c95f12" stroke-width="16" fill="none"/>`}
    ${gownOn ? outfitLayer(of, p.tearT || 0) : ''}
  </g>`;
  const rollY = -100;
  return `<g transform="rotate(${p.sway || 0} 0 770)">
    ${SHADE_DEFS}${OUTFIT_DEFS}${GYM_DEFS}<defs>${SHIM_DEFS}</defs><defs>${hairDefs({ ...HAIR_DEFAULT, ...(p.hair || {}) })}${hdDefs(p.hair || {})}</defs>
    <clipPath id="eyeClip"><ellipse rx="36" ry="40"/></clipPath>
    <ellipse cx="0" cy="780" rx="420" ry="46" fill="#000" opacity="0.4" filter="url(#blur20)"/>
    <g transform="translate(0,${p.hop || 0})">${of && (of.prog ?? 1) >= 0.9 ? '' : legSvg(-1, lg.l) + legSvg(1, lg.r)}<g transform="translate(${p.lean || 0},0)">${chest}
    ${heelsLayer(of, p)}<g transform="translate(0,${-sh * 0.4})">
      ${FEM > 0.02 ? `<path d="M${-34 + 6 * FEM},-190 L${34 - 6 * FEM},-190 C${34 - 6 * FEM},-130 50,-108 96,-84 L-96,-84 C-50,-108 ${-34 + 6 * FEM},-130 ${-34 + 6 * FEM},-190Z" fill="${SKINB}" ${O8}/><path d="M-26,-150 Q0,-120 26,-150 L24,-96 Q0,-84 -24,-96Z" fill="#000" opacity="0.14" filter="url(#blur8)"/><path d="M-28,-176 Q0,-160 28,-176" stroke="#fff" stroke-opacity="0.18" stroke-width="8" fill="none"/>` : `<path d="M-62,-150 C-70,-110 -86,-96 -110,-84 L110,-84 C86,-96 70,-110 62,-150Z" fill="${SKINB}" ${O8}/>`}
      <path d="M-40,-90 C-30,-70 30,-70 40,-90" stroke="#000" stroke-opacity="0.2" stroke-width="6" fill="none"/>
      <ellipse cx="0" cy="-60" rx="104" ry="24" fill="#000" opacity="0.18" filter="url(#blur8)"/>
      <g transform="translate(0,${rollY}) rotate(${p.roll || 0}) translate(0,${-rollY}) translate(0,${-215 - 104 * FEM + (p.pitch || 0) * 10 + (p.bob || 0)}) scale(${1 - 0.2 * FEM},${1 - 0.14 * FEM}) ">${headSvg(p)}${(p.hair || {}).hd ? hdFront(p.hair, p.yaw || 0, p.tearT || 0) : hairCurtains({ ...HAIR_DEFAULT, ...(p.hair || {}) }, p.yaw || 0) + hairRinglets({ ...HAIR_DEFAULT, ...(p.hair || {}) }, p.yaw || 0, p.tearT || 0)}${jewelHead(p.outfit)}</g>
    </g>
    <g transform="translate(0,${-sh})">${armSvg(-1, p.armL)}${armSvg(1, p.armR)}</g>
  </g></g></g>`;
}
