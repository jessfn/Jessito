// M: piernas articuladas (muslo + pantorrilla + rodilla) con bota unida al tobillo por IK de 2 huesos. Pie plantado en el suelo al caminar.
const K = '#07040a', RIM = '#e01a30';
const f1 = (n) => Math.round(n * 10) / 10;
const HIP = { L: [478, 760], R: [569, 760] }, A0 = { L: [395, 1375], R: [659, 1375] };
const LEN = (() => { const a = Math.hypot(A0.L[0] - HIP.L[0], A0.L[1] - HIP.L[1]); return a * 0.5; })();   // muslo = pantorrilla
export const MLEG = { on: true };
function ik(H, T, out) { const dx = T[0] - H[0], dy = T[1] - H[1]; let d = Math.hypot(dx, dy); const dmax = 2 * LEN - 1; if (d > dmax) { T = [H[0] + dx * dmax / d, H[1] + dy * dmax / d]; d = dmax; }
  const base = Math.atan2(T[1] - H[1], T[0] - H[0]), A = Math.acos(Math.min(1, Math.max(-1, d / (2 * LEN)))); const c = [base + A, base - A].map((a) => [H[0] + LEN * Math.cos(a), H[1] + LEN * Math.sin(a)]);
  const E = (c[0][0] - H[0]) * out > (c[1][0] - H[0]) * out ? c[0] : c[1]; return { E, T }; }
const seg = (p, q, w0, w1) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; return `M${f1(p[0] + nx * w0)},${f1(p[1] + ny * w0)} L${f1(q[0] + nx * w1)},${f1(q[1] + ny * w1)} L${f1(q[0] - nx * w1)},${f1(q[1] - ny * w1)} L${f1(p[0] - nx * w0)},${f1(p[1] - ny * w0)}Z`; };
export function m_legs2(P, bootFn) {
  const out = ['L', 'R'].map((s) => { const q = s === 'L' ? P.legL : P.legR, H = HIP[s], a0 = A0[s], sg = s === 'L' ? -1 : 1;
    const hy = P.hips.y || 0, hx = P.hips.x || 0; const raise = Math.max(0, q.lift) * 2.5, stride = -q.r * 4.0;
    const T = [a0[0] + stride - hx, a0[1] - raise - hy]; const { E, T: Tf } = ik(H, T, sg);
    const ang = Math.atan2(Tf[1] - E[1], Tf[0] - E[0]) * 180 / Math.PI - 90; const toe = sg * -1 * Math.min(24, Math.max(0, q.lift) * 0.6) + stride * 0.04;
    const wH = 60, wK = 52, wA = 64;
    const thigh = seg(H, E, wH, wK), shin = seg(E, Tf, wK, wA);
    const boot = `<g transform="translate(${f1(Tf[0] - a0[0])},${f1(Tf[1] - a0[1])}) rotate(${f1(toe)} ${a0[0]} ${a0[1]})">${bootFn(s)}</g>`;
    const cuff = (() => { const dx = Tf[0] - E[0], dy = Tf[1] - E[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux; const c = [Tf[0] - ux * 20, Tf[1] - uy * 20]; return `<path d="M${f1(c[0] + nx * 64)},${f1(c[1] + ny * 64)} L${f1(Tf[0] + nx * 62)},${f1(Tf[1] + ny * 62)} L${f1(Tf[0] - nx * 62)},${f1(Tf[1] - ny * 62)} L${f1(c[0] - nx * 64)},${f1(c[1] - ny * 64)}Z" fill="#0c0709" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>`; })();
    const outer = (p, q, w0, w1, sgn) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; return `M${f1(p[0] + sgn * nx * (w0 - 4))},${f1(p[1] + sgn * ny * (w0 - 4))} L${f1(q[0] + sgn * nx * (w1 - 4))},${f1(q[1] + sgn * ny * (w1 - 4))}`; };
    const fold = (p, q) => `<path d="M${f1(p[0] * 0.55 + q[0] * 0.45)},${f1(p[1] * 0.55 + q[1] * 0.45)} L${f1(q[0] * 0.8 + p[0] * 0.2)},${f1(q[1] * 0.8 + p[1] * 0.2)}" stroke="#000" stroke-opacity="0.4" stroke-width="9" stroke-linecap="round" fill="none"/>`;
    const sgnOut = sg === -1 ? 1 : -1; const op = (p, q, w, sgn, a2, b2) => { const A = a2 || p, B = b2 || q; const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1; const nx = -dy / l, ny = dx / l; return f1(p[0] + sgn * nx * (w - 4)) + ',' + f1(p[1] + sgn * ny * (w - 4)); };
    return { s, o: `<path d="${thigh}" fill="${K}" stroke="${K}" stroke-width="14" stroke-linejoin="round"/><path d="${shin}" fill="${K}" stroke="${K}" stroke-width="14" stroke-linejoin="round"/><circle cx="${f1(E[0])}" cy="${f1(E[1])}" r="${wK + 6}" fill="${K}"/>`,
      f: `<path d="${thigh}" fill="url(#mCloth)"/><path d="${shin}" fill="url(#mCloth)"/><circle cx="${f1(E[0])}" cy="${f1(E[1])}" r="${wK - 1}" fill="url(#mCloth)"/><path d="M${op(H, E, wH, sgnOut)} Q${op(E, E, wK - 2, sgnOut, E, H)} ${op(Tf, E, wA, sgnOut, Tf, E)}" stroke="${RIM}" stroke-width="3" stroke-opacity="0.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${fold(H, E)}${fold(E, Tf)}<path d="M${f1(E[0] - 26)},${f1(E[1] - 8)} Q${f1(E[0])},${f1(E[1] + 14)} ${f1(E[0] + 26)},${f1(E[1] - 8)}" stroke="#000" stroke-opacity="0.35" stroke-width="7" fill="none" stroke-linecap="round"/>${cuff}`, boot, z: Tf[1] }; });
  out.sort((a, b) => a.z - b.z);   // la pierna que esta mas arriba (en el aire) va detras de la que esta plantada
  return `<g id="piernas_articuladas">${out.map((l) => l.o).join('')}${out.map((l) => `<g id="pierna_${l.s}">${l.f}${l.boot}</g>`).join('')}</g>`; }
