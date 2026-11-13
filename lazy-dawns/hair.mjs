// Sistema de pelo de Lazy: rizado (nube), lacio largo (cortinas con mechones y brillo), color, espuma, frizz, largo variable.
const OUT = '#12090a';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
export const HAIR_DEFAULT = { rl: 0, s: 0, len: 0.5, green: 0, cut: 0, foam: 0, frizz: 0, wet: 0, shine: 0.3, sway: 0 };
const mixHex = (a, b, k) => { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
function cols(h) { const g = h.green || 0, w = h.wet || 0;
  return { base: mixHex(mixHex('#1a1412', '#14ad3a', g), '#000000', w * 0.3), mid: mixHex('#3a2f2c', '#4fe06a', g), hi: mixHex('#a39a98', '#d6ffd9', g), dark: mixHex('#050303', '#0a5a1d', g) }; }
export function hairDefs(h) { const c = cols(h);
  return `<radialGradient id="hxC" cx="0.4" cy="0.25" r="0.9"><stop offset="0" stop-color="${c.mid}"/><stop offset="0.5" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>
  <linearGradient id="hxS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.dark}"/><stop offset="0.3" stop-color="${c.base}"/><stop offset="0.55" stop-color="${c.mid}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>
  <linearGradient id="hxSm" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${c.dark}"/><stop offset="0.3" stop-color="${c.base}"/><stop offset="0.55" stop-color="${c.mid}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>`; }

const CURL_PTS = (() => { const a = []; for (let i = 0; i < 26; i++) { const t = Math.PI * (1.05 + (i / 25) * 0.9), r = 200 + (i % 3) * 18; a.push([Math.cos(t) * r * 1.02, Math.sin(t) * r * 0.95 - 8, 46 + (i % 4) * 7]); } return a; })();
const FRIZZ_PTS = (() => { const a = []; let s = 7; const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; for (let i = 0; i < 30; i++) { const t = Math.PI * (0.95 + r() * 1.1), d = 215 + r() * 70; a.push([Math.cos(t) * d, Math.sin(t) * d * 0.95 - 8, 10 + r() * 16]); } return a; })();
const FOAM_PTS = [[-150, -150, 44], [-60, -210, 50], [40, -220, 46], [130, -170, 48], [-190, -70, 40], [190, -60, 42], [0, -150, 40], [-100, -100, 36], [90, -110, 38], [-210, -10, 34], [215, 0, 36], [-30, -250, 34], [-130, -230, 30], [150, -240, 30], [-230, 60, 28], [230, 70, 28]];
export function hairCurly(h) {
  const o = 1 - clamp(h.s); if (o <= 0.01) return '';
  const k = 1 - (h.cut || 0) * 0.1 + (h.frizz || 0) * 0.06 - (h.wet || 0) * 0.08;
  const body = CURL_PTS.map(([x, y, r]) => `<circle cx="${x * k}" cy="${y * k}" r="${r * k}" fill="url(#hxC)" stroke="${OUT}" stroke-width="8"/>`).join('');
  const fr = (h.frizz || 0) > 0.03 ? FRIZZ_PTS.map(([x, y, r], i) => `<circle cx="${x * (0.95 + 0.1 * Math.sin(i))}" cy="${y}" r="${r * h.frizz}" fill="url(#hxC)" stroke="${OUT}" stroke-width="4" opacity="${0.9}"/>`).join('') : '';
  const hi = `<g opacity="${0.35 * (1 - (h.wet || 0))}">${[...Array(8)].map((_, i) => `<path d="M${-150 + i * 40},${-215 - (i % 3) * 14} q25,-20 44,2" stroke="${cols(h).hi}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
  const foam = (h.foam || 0) > 0.02 ? FOAM_PTS.map(([x, y, r], i) => { const q = clamp(h.foam * 1.5 - (i % 5) * 0.1); return q > 0.02 ? `<g transform="translate(${x},${y})"><circle r="${r * q}" fill="#fff" stroke="#b9cde0" stroke-width="3"/><circle cx="${-r * q * 0.3}" cy="${-r * q * 0.3}" r="${r * q * 0.28}" fill="#dff1ff"/></g>` : ''; }).join('') : '';
  return `<g opacity="${o}">${fr}${body}${hi}${foam}</g>`;
}
export function hairBehind(h) {
  const s = clamp(h.s); if (s <= 0.01) return '';
  return `<g opacity="${s}"><ellipse cx="0" cy="-26" rx="222" ry="228" fill="url(#hxC)" stroke="${OUT}" stroke-width="8"/></g>`;
}
export function hairTop(h) {
  const s = clamp(h.s); if (s <= 0.01) return '';
  const c = cols(h), sh = h.shine ?? 0.3;
  const half = (m) => `<path d="M0,-216 C${m * 140},-216 ${m * 216},-142 ${m * 210},-24 C${m * 206},8 ${m * 202},30 ${m * 196},46 C${m * 192},-34 ${m * 152},-100 ${m * 90},-132 C${m * 52},-150 ${m * 20},-160 0,-176Z" fill="url(#${m < 0 ? 'hxSm' : 'hxS'})" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M${m * 20},-200 C${m * 110},-196 ${m * 176},-140 ${m * 184},-56" stroke="${c.hi}" stroke-width="12" fill="none" stroke-linecap="round" opacity="${0.35 + 0.4 * sh}"/>
    <path d="M${m * 60},-186 C${m * 120},-176 ${m * 160},-140 ${m * 170},-100" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="${0.25 + 0.4 * sh}"/>`;
  return `<g opacity="${s}">${half(-1)}${half(1)}<path d="M0,-176 L0,-214" stroke="#b07a54" stroke-width="5" opacity="0.8"/></g>`;
}
export function hairCurtains(h, yaw = 0) {
  const s = clamp(h.s); if (s <= 0.01) return '';
  const c = cols(h), L = clamp(h.len ?? 0.5), yb = 200 + 520 * L, sw = (h.sway || 0), sh = h.shine ?? 0.3, wob = (u, t) => Math.sin(u * 5 + t) * 4;
  const side = (m) => {
    const O = [[-196, -92], [-262, 40], [-312 + sw * 10 * L, 300], [-300 + sw * 30 * L, yb]].map(([x, y]) => [m * x, y]);
    const I = [[-176, -30], [-142, 120], [-132 + sw * 6 * L, 320], [-150 + sw * 26 * L, yb - 14]].map(([x, y]) => [m * x, y]);
    const P = (a) => `${a[0]},${a[1]}`;
    const panel = `M${P(O[0])} C${P(O[1])} ${P(O[2])} ${P(O[3])} Q${(O[3][0] + I[3][0]) / 2},${yb + 22} ${P(I[3])} C${P(I[2])} ${P(I[1])} ${P(I[0])} Z`;
    const strands = [...Array(16)].map((_, i) => { const u = (i + 0.5) / 16, q = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
      const p = [0, 1, 2, 3].map((j) => q(O[j], I[j], u)); const dd = wob(u * 3, i);
      return `<path d="M${P(p[0])} C${p[1][0] + dd},${p[1][1]} ${p[2][0] - dd},${p[2][1]} ${p[3][0]},${p[3][1] - (i % 3) * 8}" stroke="${i % 3 === 0 ? c.hi : '#000'}" stroke-width="${i % 3 === 0 ? 2.5 : 3}" fill="none" opacity="${i % 3 === 0 ? 0.28 * (0.5 + sh) : 0.3}" stroke-linecap="round"/>`; }).join('');
    const gloss = [0.3, 0.62].map((u, k) => { const q = (a, b, kk) => [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk)]; const p = [0, 1, 2, 3].map((j) => q(O[j], I[j], u));
      return `<path d="M${p[0][0]},${p[0][1] + 60} C${p[1][0]},${p[1][1] + 40} ${p[2][0]},${p[2][1] - 80} ${p[3][0]},${p[3][1] - 120}" stroke="#fff" stroke-width="${k ? 12 : 22}" fill="none" stroke-linecap="round" opacity="${(k ? 0.18 : 0.32) * (0.3 + sh * 1.2)}"/>`; }).join('');
    return `<path d="${panel}" transform="translate(${m * 22},14) scale(1.0)" fill="${c.dark}" stroke="${OUT}" stroke-width="7" stroke-linejoin="round" opacity="0.95"/><path d="${panel}" fill="url(#${m < 0 ? 'hxSm' : 'hxS'})" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>${strands}${gloss}`;
  };
  return `<g opacity="${s}" transform="translate(${yaw * 10},0)">${side(-1)}${side(1)}</g>`;
}

// Rizos largos y definidos: mechones en espiral (cuerdas onduladas con bucles), con brillo y sombra.
export function hairRinglets(h, yaw = 0, t = 0) {
  const rl = clamp(h.rl || 0); if (rl <= 0.01) return '';
  const c = cols(h), L = clamp(h.len ?? 0.5), yEnd = 130 + 560 * L, sw = (h.sway || 0), sh = h.shine ?? 0.5;
  const strand = (x0, m, col, ph, lam, amp) => { const pts = []; for (let y = 6; y <= yEnd; y += 6) { const u = y / yEnd; const x = x0 + m * (u * 26) + amp * (0.6 + 0.5 * u) * Math.sin((y / lam) * Math.PI * 2 + ph) + sw * 24 * u * u * m; pts.push([x, y]); }
    const d = 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L');
    const loops = pts.filter((_, i) => i % 6 === 3).map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${15 - 3 * (y / yEnd)}" fill="${c.mid}" opacity="0.55"/>`).join('');
    return `<path d="${d}" stroke="${OUT}" stroke-width="${44 - 8 * col}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${rl}"/><path d="${d}" stroke="url(#hxC)" stroke-width="${34 - 7 * col}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${rl}"/><path d="${d}" stroke="${c.dark}" stroke-width="${10 - 2 * col}" fill="none" stroke-linecap="round" transform="translate(7,0)" opacity="${0.5 * rl}"/><path d="${d}" stroke="${c.hi}" stroke-width="${4 + 3 * sh}" fill="none" stroke-linecap="round" transform="translate(-9,-3)" opacity="${(0.25 + 0.5 * sh) * rl}"/><g opacity="${rl}">${loops}</g>`; };
  const side = (m) => [3, 2, 1, 0].map((col) => strand(m * (190 + col * 36), m, col, col * 1.7 + (m > 0 ? 0.8 : 0), 78 + col * 9, 20 - col * 2)).join('');
  return `<g transform="translate(${yaw * 10},0)">${side(-1)}${side(1)}</g>`;
}
