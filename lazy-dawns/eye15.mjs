// Primer plano del ojo de Lazy para el proceso de pestanas (dia 15): st = { map, nat, fake, uv }.
const f = (n) => Math.round(n * 10) / 10;
const rng15 = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
export const EYE15_DEFS = `<defs><radialGradient id="skin" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="#d9a074"/><stop offset="1" stop-color="#b9774e"/></radialGradient>
<radialGradient id="iris" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#d49a52"/><stop offset="0.55" stop-color="#7a4520"/><stop offset="1" stop-color="#2a1208"/></radialGradient>
<linearGradient id="lg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#050203"/><stop offset="0.6" stop-color="#1a0c0a"/><stop offset="1" stop-color="#4a2a1e"/></linearGradient>
<linearGradient id="sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfc6c2"/><stop offset="0.35" stop-color="#f6f1ee"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<linearGradient id="lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3d52"/><stop offset="1" stop-color="#c58862" stop-opacity="0"/></linearGradient>
<clipPath id="eyeC"><path d="M-170,22 C-90,-120 110,-125 182,-16 Q90,58 -20,62 Q-110,60 -170,22Z"/></clipPath></defs>`;
const up = (t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return { x: a * -172 + b * -90 + c * 110 + d * 182, y: a * 24 + b * -120 + c * -125 + d * -16 }; };   // linea de pestanas superior (ajustada al borde del parpado)
const upN = (t) => { const e = 0.01, a = up(Math.max(0, t - e)), b = up(Math.min(1, t + e)); const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy); return { x: dy / l, y: -dx / l }; };
const lo = (t) => { const u = 1 - t; return { x: u * u * -170 + 2 * u * t * 0 + t * t * 178, y: u * u * 22 + 2 * u * t * 92 + t * t * -14 }; };
function hair(x, y, ang, len, curl, w, col = 'url(#lg)') { // pelo conico curvo: base ancha, punta fina
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, k = curl * len * 0.5;
  const mx = x + dx * len * 0.5 + nx * k * 0.35, my = y + dy * len * 0.5 + ny * k * 0.35, tx = x + dx * len + nx * k, ty = y + dy * len + ny * k;
  return `<path d="M${f(x - nx * w)},${f(y - ny * w)} Q${f(mx - nx * w * 0.5)},${f(my - ny * w * 0.5)} ${f(tx)},${f(ty)} Q${f(mx + nx * w * 0.5)},${f(my + ny * w * 0.5)} ${f(x + nx * w)},${f(y + ny * w)}Z" fill="${col}"/>`; }

function lashes15(st) { const R = rng15(21); let s = '', low = '';
  const nat = Math.min(1, st.nat || 0), fake = Math.min(1, st.fake || 0);
  for (let i = 0; i < 30; i++) { const t = (i + 0.5) / 30, p = up(t), n = upN(t); const base = Math.atan2(n.y, n.x); const ang = base + (t - 0.35) * 0.45 + (R() - 0.5) * 0.1; const len = 34 + 14 * Math.sin(t * 3) + R() * 6; s += hair(p.x, p.y, ang, len * (1 - 0.05 * fake), -0.25 - 1.0 * nat, 1.5); }
  const N = 34, cnt = Math.round(N * fake);
  for (let i = 0; i < N; i++) { if (i >= cnt) continue; const t = (i + 0.5) / N, p = up(t), n = upN(t); const base = Math.atan2(n.y, n.x); let ang = base + (t - 0.35) * 0.55 + (R() - 0.5) * 0.12 + 0.18 * t; const len = 44 + 74 * Math.pow(t, 1.6) + (i % 3 === 0 ? 26 : 0) + R() * 8; const fan = i % 3 === 0 ? 3 : 2;
    for (let k = 0; k < fan; k++) { const sp = (k - (fan - 1) / 2) * 0.17; s += hair(p.x + (k - (fan - 1) / 2) * 0.6, p.y, ang + sp, len * (0.86 + R() * 0.2), -1.3 * (0.9 + R() * 0.3), 1.5); } }
  if (fake > 0.3) for (let i = 0; i < 12; i++) { const t = 0.12 + 0.76 * (i / 11), p = lo(t); low += hair(p.x, p.y, Math.PI / 2 + (t - 0.5) * 0.7, 12 + R() * 5, 0.7, 1.1); }
  return s + low; }
const eyeBody = (st) => `<g><rect x="-260" y="-250" width="520" height="460" rx="36" fill="url(#skin)"/>
  <path d="M-220,-190 Q0,-250 220,-150" stroke="#3a1c10" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.8"/>
  <path d="M-176,16 C-90,-120 110,-125 188,-22 Q100,-70 20,-76 Q-80,-76 -176,16Z" fill="url(#lid)" opacity="0.9"/>
  <path d="M-170,22 C-90,-120 110,-125 182,-16 Q90,58 -20,62 Q-110,60 -170,22Z" fill="url(#sc)"/>
  <g clip-path="url(#eyeC)"><circle cx="8" cy="-8" r="62" fill="url(#iris)"/><circle cx="8" cy="-8" r="62" fill="none" stroke="#1a0a05" stroke-width="5"/><circle cx="8" cy="-8" r="26" fill="#060203"/><circle cx="-10" cy="-30" r="14" fill="#fff" opacity="0.95"/><circle cx="30" cy="12" r="6" fill="#fff" opacity="0.6"/></g>
  <path d="M-172,24 C-90,-120 110,-125 182,-16" stroke="#0a0506" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-170,22 Q-110,60 -20,62 Q90,58 178,-14" stroke="#6a2a22" stroke-width="3" fill="none" opacity="0.7"/>
  ${(st.map || 0) > 0 ? [...Array(12)].map((_, i) => { const t = (i + 0.5) / 12, p = up(t), n = upN(t), k = Math.min(1, (st.map * 1.3) - i / 18); if (k <= 0) return ''; const lab = 8 + Math.round(t * 6); return `<g opacity="${k.toFixed(2)}"><circle cx="${f(p.x + n.x * 18)}" cy="${f(p.y + n.y * 18)}" r="9" fill="#ffe14d" stroke="#12090a" stroke-width="2"/><text x="${f(p.x + n.x * 18)}" y="${f(p.y + n.y * 18 + 4)}" font-family="Anton" font-size="11" text-anchor="middle" fill="#12090a">${lab}</text></g>`; }).join('') : ''}
  ${lashes15(st)}</g>`;
export function eye15(st) { return `${EYE15_DEFS}${eyeBody(st)}`; }
