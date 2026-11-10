// Personajes de apoyo (no hablan con voz; reaccionan con cara y manos): Mari (amiga) y la Dra. Valentina (dermatologa).
// Origen (0,0) = centro de la cabeza. Se dibujan de medio cuerpo hacia arriba.
const OUT = '#12090a';
const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

function eyes(x, y, blink, look, big = 0, brows) {
  const c = clamp(blink); const o = 1 - c;
  const mk = (sx) => `<g transform="translate(${sx * x},${y})"><ellipse rx="${24 + big * 5}" ry="${(27 + big * 7) * Math.max(0.08, o)}" fill="#fff" ${O}/>
    ${o > 0.35 ? `<circle cx="${look * 6}" cy="2" r="${12 + big * 2}" fill="#2a1a10"/><circle cx="${look * 6 + 5}" cy="-4" r="4.5" fill="#fff"/>` : `<path d="M-22,0 Q0,10 22,0" stroke="${OUT}" stroke-width="6" fill="none"/>`}</g>`;
  const [bi, bo] = brows; // inner / outer raise (-1..1)
  const br = (sx) => `<path d="M${sx * (x + 28)},${y - 38 - bo * 14} Q${sx * x},${y - 52 - (bi + bo) * 7} ${sx * (x - 24)},${y - 36 - bi * 16}" stroke="${OUT}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  return mk(-1) + mk(1) + br(-1) + br(1);
}
function mouth(kind, y, t) {
  switch (kind) {
    case 'grin': return `<path d="M-34,${y} Q0,${y + 44} 34,${y} Q0,${y + 10} -34,${y}Z" fill="#7a1f2a" ${O}/><path d="M-26,${y + 3} Q0,${y + 16} 26,${y + 3} L24,${y + 10} Q0,${y + 20} -24,${y + 10}Z" fill="#fff"/>`;
    case 'scream': return `<ellipse cx="0" cy="${y + 12}" rx="${24 + Math.sin(t * 30) * 2}" ry="${34 + Math.sin(t * 30) * 3}" fill="#7a1f2a" ${O}/><ellipse cx="0" cy="${y + 30}" rx="14" ry="10" fill="#d0606e"/>`;
    case 'worry': return `<path d="M-24,${y + 8} Q-10,${y - 4} 0,${y + 6} Q10,${y - 4} 24,${y + 8}" stroke="${OUT}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'o': return `<ellipse cx="0" cy="${y + 8}" rx="14" ry="18" fill="#7a1f2a" ${O}/>`;
    case 'cry': return `<path d="M-30,${y + 16} Q0,${y - 16} 30,${y + 16}" stroke="${OUT}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'flat': return `<path d="M-20,${y + 6} L20,${y + 6}" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/>`;
    case 'smirk': return `<path d="M-26,${y + 8} Q4,${y + 18} 30,${y - 6}" stroke="${OUT}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    default: return `<path d="M-30,${y} Q0,${y + 30} 30,${y}" stroke="${OUT}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  }
}
const MOODS = { // brows [inner, outer], boca, ojos grandes
  happy: { b: [0.2, 0.2], m: 'smile', big: 0 }, grin: { b: [0.3, 0.3], m: 'grin', big: 0.3 }, worry: { b: [0.9, 0], m: 'worry', big: 0.2 },
  scream: { b: [0.8, 0.8], m: 'scream', big: 1 }, cry: { b: [0.9, 0], m: 'cry', big: 0.2 }, calm: { b: [0, 0.1], m: 'smile', big: 0 },
  focus: { b: [-0.5, -0.1], m: 'flat', big: 0 }, serious: { b: [-0.2, 0], m: 'flat', big: 0 }, amused: { b: [0.1, 0.4], m: 'smirk', big: 0 },
  shock: { b: [0.7, 0.7], m: 'o', big: 0.8 }, relief: { b: [0.6, 0], m: 'smile', big: 0.1 },
};
const hand = (x, y, r = 0, s = 1) => `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><ellipse rx="34" ry="30" fill="#f2c4a2" ${O}/>${[-22, -8, 6, 20].map((fx) => `<rect x="${fx - 7}" y="-52" width="14" height="34" rx="7" fill="#f2c4a2" ${O}/>`).join('')}</g>`;

export function drawMari(p) {
  const m = MOODS[p.mood || 'happy'], t = p.t || 0, bob = Math.sin(t * 2.2) * 3, blink = p.blink || 0;
  const hands = p.hands || 'none';
  const tears = p.tears ? `${[-1, 1].map((s) => `<path d="M${s * 46},${6 + ((t * 0.9) % 1) * 60} q9,14 0,24 q-9,-10 0,-24Z" fill="#bfe9ff" stroke="#fff" stroke-width="2"/>`).join('')}` : '';
  const handSvg = hands === 'cover' ? `${hand(-52, -4, 0, 1.2)}${hand(52, -4, 0, 1.2)}`
    : hands === 'cheeks' ? `${hand(-112, 56, -20)}${hand(112, 56, 20)}`
      : hands === 'wave' ? hand(150, -40 + Math.sin(t * 9) * 8, 18 + Math.sin(t * 9) * 14, 1.1)
        : hands === 'clasp' ? hand(0, 150, 0, 1.2) : '';
  return `<g transform="translate(0,${bob})">
    <path d="M-120,-20 Q-150,120 -130,250 L130,250 Q150,120 120,-20Z" fill="#5a2d82" ${O}/>
    <rect x="-96" y="420" width="82" height="250" rx="30" fill="#3b4cca" ${O}/><rect x="14" y="420" width="82" height="250" rx="30" fill="#3b4cca" ${O}/>
    <ellipse cx="-62" cy="684" rx="64" ry="26" fill="#ff4d8d" ${O}/><ellipse cx="62" cy="684" rx="64" ry="26" fill="#ff4d8d" ${O}/>
    <path d="M-160,452 Q-150,170 -80,150 L80,150 Q150,170 160,452Z" fill="#22d3ee" ${O}/><path d="M-60,150 Q0,200 60,150" fill="#f2c4a2" ${O}/>
    <rect x="-24" y="96" width="48" height="60" fill="#e9b18a" ${O}/>
    <ellipse cx="0" cy="0" rx="106" ry="118" fill="#f2c4a2" ${O}/><ellipse cx="-110" cy="10" rx="14" ry="24" fill="#f2c4a2" ${O}/><ellipse cx="110" cy="10" rx="14" ry="24" fill="#f2c4a2" ${O}/>
    <circle cx="-112" cy="40" r="9" fill="#ffe14d" ${O}/><circle cx="112" cy="40" r="9" fill="#ffe14d" ${O}/>
    <path d="M-108,-10 Q-110,-120 0,-124 Q110,-120 108,-10 Q80,-78 0,-80 Q-80,-78 -108,-10Z" fill="#5a2d82" ${O}/>
    <ellipse cx="-62" cy="34" rx="22" ry="12" fill="#ff8fa3" opacity="0.55"/><ellipse cx="62" cy="34" rx="22" ry="12" fill="#ff8fa3" opacity="0.55"/>
    ${eyes(42, -6, blink, p.look || 0, m.big, m.b)}${tears}${mouth(m.m, 52, t)}
    ${handSvg}</g>`;
}

export function drawDoc(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.8 + 1) * 2.5, blink = p.blink || 0, tool = p.tool || 'none';
  const lupa = `<g transform="translate(${p.lupaX ?? 200},${p.lupaY ?? 80}) rotate(-20)"><circle r="78" fill="#cfefff" opacity="0.55" stroke="${OUT}" stroke-width="9"/><circle r="64" fill="none" stroke="#fff" stroke-width="4" opacity="0.6"/><path d="M-40,-40 q20,-20 50,-14" stroke="#fff" stroke-width="7" fill="none" opacity="0.7"/><rect x="60" y="64" width="26" height="110" rx="13" transform="rotate(-45 60 64)" fill="#7c3aed" ${O}/></g>`;
  const extractor = `<g transform="translate(${p.toolX ?? 150},${p.toolY ?? 40}) rotate(${p.toolR ?? -25})"><rect x="-8" y="0" width="16" height="250" rx="8" fill="#e5e7eb" ${O}/><circle cx="0" cy="-6" r="14" fill="none" stroke="#9ca3af" stroke-width="7"/>
    <g transform="translate(0,220)"><ellipse rx="40" ry="34" fill="#9bdcff" ${O}/>${[-26, -9, 9, 26].map((fx) => `<rect x="${fx - 8}" y="-46" width="16" height="30" rx="8" fill="#9bdcff" ${O}/>`).join('')}</g></g>`;
  const aloe = `<g transform="translate(${p.toolX ?? 150},${p.toolY ?? 70}) rotate(-15)"><rect x="-26" y="0" width="52" height="110" rx="14" fill="#7fb069" ${O}/><rect x="-14" y="-22" width="28" height="26" rx="6" fill="#fff" ${O}/><text x="0" y="66" font-family="Inter" font-weight="800" font-size="22" text-anchor="middle" fill="#fff">ALOE</text>
    <rect x="-34" y="96" width="68" height="300" rx="30" fill="#fff" ${O}/><g transform="translate(0,96)"><ellipse rx="40" ry="32" fill="#9bdcff" ${O}/>${[-26, -9, 9, 26].map((fx) => `<rect x="${fx - 8}" y="-40" width="16" height="26" rx="8" fill="#9bdcff" ${O}/>`).join('')}</g></g>`;
  const ice = `<g transform="translate(${p.toolX ?? 140},${p.toolY ?? 60}) rotate(-12)"><rect x="-54" y="-30" width="108" height="76" rx="22" fill="#9bdcff" ${O}/><path d="M-30,-10 l20,-10 M10,-14 l22,6 M-20,18 l16,-6" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <rect x="30" y="20" width="300" height="68" rx="30" fill="#fff" ${O}/><g transform="translate(40,54)"><ellipse rx="38" ry="30" fill="#9bdcff" ${O}/></g></g>`;
  const toolSvg = { lupa, extractor, aloe, ice, none: '' }[tool] || '';
  const handSvg = p.hand ? hand(p.hand[0], p.hand[1], p.hand[2] || 0) : '';
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${toolSvg}${handSvg}</g>`;
  return `<g transform="translate(0,${bob})">
    <circle cx="0" cy="-118" r="60" fill="#3b2314" ${O}/>
    <rect x="-80" y="470" width="70" height="200" rx="26" fill="#334155" ${O}/><rect x="10" y="470" width="70" height="200" rx="26" fill="#334155" ${O}/>
    <ellipse cx="-50" cy="684" rx="58" ry="24" fill="#111827" ${O}/><ellipse cx="50" cy="684" rx="58" ry="24" fill="#111827" ${O}/>
    <path d="M-164,560 Q-150,170 -80,150 L80,150 Q150,170 164,560Z" fill="#ffffff" ${O}/><path d="M-40,150 L0,250 L40,150Z" fill="#14b8a6" ${O}/><path d="M-70,150 L0,210 L70,150" fill="none" stroke="${OUT}" stroke-width="7"/>
    <path d="M0,150 L0,560" stroke="#cbd5e1" stroke-width="5"/><rect x="60" y="250" width="70" height="36" rx="6" fill="#e0f2fe" ${O}/><text x="95" y="275" font-family="Inter" font-weight="800" font-size="16" text-anchor="middle" fill="#0f172a">DRA. V.</text>
    <path d="M-60,160 Q-70,240 -40,260 M60,160 Q70,240 40,260" stroke="#4b5563" stroke-width="9" fill="none"/><circle cx="-40" cy="262" r="12" fill="#9ca3af" ${O}/>
    <rect x="-24" y="96" width="48" height="60" fill="#b07a54" ${O}/>
    <ellipse cx="0" cy="0" rx="104" ry="116" fill="#c28a62" ${O}/><ellipse cx="-108" cy="10" rx="14" ry="24" fill="#c28a62" ${O}/><ellipse cx="108" cy="10" rx="14" ry="24" fill="#c28a62" ${O}/>
    <path d="M-106,-8 Q-108,-112 0,-116 Q108,-112 106,-8 Q70,-60 0,-62 Q-70,-60 -106,-8Z" fill="#3b2314" ${O}/>
    ${eyes(40, -6, blink, p.look || 0, m.big, m.b)}
    <circle cx="-40" cy="-6" r="36" fill="#bfe9ff" opacity="0.25" stroke="${OUT}" stroke-width="6"/><circle cx="40" cy="-6" r="36" fill="#bfe9ff" opacity="0.25" stroke="${OUT}" stroke-width="6"/><path d="M-4,-8 h8" stroke="${OUT}" stroke-width="6"/><path d="M-20,-24 l12,-10" stroke="#fff" stroke-width="5" opacity="0.8"/>
    ${mouth(m.m, 54, t)}</g>`;
}
