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
  proud: { b: [0.3, 0.3], m: 'smile', big: 0.2 }, shock: { b: [0.7, 0.7], m: 'o', big: 0.8 }, relief: { b: [0.6, 0], m: 'smile', big: 0.1 },
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

// Dr. Mendoza (dentista): cubrebocas (no se le ve la boca => no habla con la boca), lampara frontal, guantes, bata.
export function drawDentist(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.7 + 2) * 2.5, blink = p.blink || 0, lamp = p.lamp ?? 0;
  const SK = '#d3a070', SKD = '#b98558';
  const tool = { mirror: `<g transform="translate(${p.toolX ?? 150},${p.toolY ?? 150}) rotate(${p.toolR ?? -20})"><rect x="-6" y="0" width="12" height="190" rx="6" fill="#cbd5e1" ${O}/><circle cx="0" cy="-26" r="34" fill="#cfefff" opacity="0.8" stroke="${OUT}" stroke-width="7"/><path d="M-16,-40 q14,-14 30,-8" stroke="#fff" stroke-width="6" fill="none"/></g>`,
    pointer: `<g transform="translate(${p.toolX ?? 150},${p.toolY ?? 150}) rotate(${p.toolR ?? -50})"><rect x="-5" y="0" width="10" height="230" rx="5" fill="#475569" ${O}/><circle cx="0" cy="0" r="9" fill="#ef4444" ${O}/></g>`,
    tooth: `<g transform="translate(${p.toolX ?? 120},${p.toolY ?? 120}) rotate(${p.toolR ?? -14})"><rect x="-8" y="0" width="16" height="170" rx="8" fill="#e5e7eb" ${O}/><path d="M-30,-40 C-30,-70 30,-70 30,-40 C32,-10 18,40 8,40 C0,40 0,10 0,10 C0,10 0,40 -8,40 C-18,40 -32,-10 -30,-40Z" fill="#f5f5ef" ${O}/></g>`,
    none: '' }[p.tool || 'none'] || '';
  const handSvg = p.hand ? `<g transform="translate(${p.hand[0]},${p.hand[1]}) rotate(${p.hand[2] || 0})"><ellipse rx="36" ry="32" fill="#7cc3ff" ${O}/>${[-22, -8, 6, 20].map((fx) => `<rect x="${fx - 8}" y="-54" width="16" height="36" rx="8" fill="#7cc3ff" ${O}/>`).join('')}</g>` : '';
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${tool}${handSvg}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-84" y="470" width="70" height="200" rx="26" fill="#1e3a5f" ${O}/><rect x="14" y="470" width="70" height="200" rx="26" fill="#1e3a5f" ${O}/>
    <ellipse cx="-50" cy="684" rx="58" ry="24" fill="#f8fafc" ${O}/><ellipse cx="50" cy="684" rx="58" ry="24" fill="#f8fafc" ${O}/>
    <path d="M-168,560 Q-154,170 -84,150 L84,150 Q154,170 168,560Z" fill="#ffffff" ${O}/><path d="M-44,150 L0,260 L44,150Z" fill="#0ea5e9" ${O}/><path d="M-74,150 L0,214 L74,150" fill="none" stroke="${OUT}" stroke-width="7"/>
    <path d="M0,150 L0,560" stroke="#cbd5e1" stroke-width="5"/><rect x="56" y="262" width="104" height="38" rx="7" fill="#e0f2fe" ${O}/><text x="108" y="288" font-family="Inter" font-weight="800" font-size="13" text-anchor="middle" fill="#0f172a">DR. MENDOZA</text>
    <rect x="-24" y="96" width="48" height="60" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="0" rx="102" ry="116" fill="${SK}" ${O}/><ellipse cx="-106" cy="10" rx="14" ry="24" fill="${SK}" ${O}/><ellipse cx="106" cy="10" rx="14" ry="24" fill="${SK}" ${O}/>
    <path d="M-104,-6 Q-112,-120 0,-124 Q112,-120 104,-6 Q70,-62 0,-66 Q-70,-62 -104,-6Z" fill="#1f1a17" ${O}/><path d="M-104,-4 Q-110,-30 -96,-50 M104,-4 Q110,-30 96,-50" stroke="#9ca3af" stroke-width="12" fill="none" stroke-linecap="round"/>
    ${eyes(40, -8, blink, p.look || 0, m.big, m.b)}
    <rect x="-80" y="-34" width="64" height="52" rx="14" fill="#7dd3fc" opacity="0.18" stroke="${OUT}" stroke-width="6"/><rect x="16" y="-34" width="64" height="52" rx="14" fill="#7dd3fc" opacity="0.18" stroke="${OUT}" stroke-width="6"/><path d="M-16,-12 h32" stroke="${OUT}" stroke-width="6"/>
    <path d="M-92,18 Q-96,96 -50,112 Q0,128 50,112 Q96,96 92,18 Q40,34 0,30 Q-40,34 -92,18Z" fill="#9be7f7" ${O}/><path d="M-70,52 Q0,66 70,52 M-66,76 Q0,90 66,76" stroke="#5bbad1" stroke-width="4" fill="none"/><path d="M-92,22 Q-120,50 -108,76 M92,22 Q120,50 108,76" stroke="#5bbad1" stroke-width="4" fill="none"/>
    <path d="M-12,18 Q0,8 12,18" stroke="#5bbad1" stroke-width="5" fill="none"/>
    <path d="M-110,-76 Q0,-118 110,-76" stroke="#374151" stroke-width="13" fill="none" stroke-linecap="round"/><g transform="translate(0,-92)"><rect x="-26" y="-16" width="52" height="30" rx="10" fill="#374151" ${O}/><circle cx="0" cy="0" r="12" fill="${lamp > 0.05 ? '#fffbe0' : '#9ca3af'}" stroke="${OUT}" stroke-width="4"/>${lamp > 0.05 ? `<circle cx="0" cy="0" r="30" fill="#fffbe0" opacity="${0.5 * lamp}"/>` : ''}</g>
    ${handSvg}</g>`;
}

// ---------- Salon: Vero (estilista) y Memo (ayudante). No mueven la boca para hablar: solo la expresion cambia con el animo. ----------
const gripHand = (col = '#d9a37c') => `<g><ellipse rx="38" ry="32" fill="${col}" ${O}/>${[-22, -8, 6, 20].map((fx) => `<rect x="${fx - 8}" y="-48" width="16" height="30" rx="8" fill="${col}" ${O}/>`).join('')}</g>`;
function salonTool(kind, o = {}) {
  const k = o.k ?? 0; // animacion 0..1
  switch (kind) {
    case 'comb': return `<g><rect x="-14" y="0" width="28" height="130" rx="12" fill="#ff7ab6" ${O}/><rect x="-90" y="120" width="180" height="30" rx="12" fill="#ff7ab6" ${O}/>${[...Array(12)].map((_, i) => `<rect x="${-84 + i * 15}" y="150" width="8" height="48" rx="3" fill="#ff7ab6" ${O}/>`).join('')}</g>`;
    case 'scissors': { const a = 10 + Math.abs(Math.sin(k * 40)) * 22; return `<g><g transform="rotate(${-a})"><path d="M0,0 L30,230 L8,236 L-16,10Z" fill="#e5e7eb" ${O}/><circle cx="-12" cy="-30" r="26" fill="none" stroke="#ec4899" stroke-width="14"/></g><g transform="rotate(${a})"><path d="M0,0 L-30,230 L-8,236 L16,10Z" fill="#cbd5e1" ${O}/><circle cx="12" cy="-30" r="26" fill="none" stroke="#ec4899" stroke-width="14"/></g><circle r="9" fill="#475569" ${O}/></g>`; }
    case 'brush': return `<g><rect x="-12" y="-10" width="24" height="170" rx="12" fill="#a855f7" ${O}/><g transform="translate(0,200) rotate(${k * 360})"><circle r="58" fill="#7c3aed" ${O}/>${[...Array(16)].map((_, i) => `<rect x="-3" y="-80" width="6" height="26" rx="3" fill="#312e81" transform="rotate(${i * 22.5})"/>`).join('')}</g></g>`;
    case 'dryer': return `<g><rect x="-16" y="-10" width="32" height="130" rx="14" fill="#f472b6" ${O}/><path d="M-40,110 L-60,260 Q-6,300 60,260 L40,110Z" fill="#fb7185" ${O}/><ellipse cx="0" cy="270" rx="60" ry="18" fill="#1f2937" ${O}/>${[...Array(5)].map((_, i) => `<path d="M${-40 + i * 20},${300 + (i % 2) * 8} q${6 + Math.sin(k * 30 + i) * 4},${40} 0,${80}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="${0.5 + 0.3 * Math.sin(k * 20 + i)}"/>`).join('')}</g>`;
    case 'iron': return `<g><g transform="rotate(${(Math.sin(k * 6) * 4)})"><rect x="-24" y="-10" width="48" height="250" rx="14" fill="#1f2937" ${O}/><rect x="-30" y="-10" width="60" height="120" rx="14" fill="#ec4899" ${O}/><rect x="-18" y="130" width="36" height="150" rx="10" fill="#9ca3af" ${O}/><path d="M-26,0 v280 M26,0 v280" stroke="#f9a8d4" stroke-width="5" opacity="0.7"/></g>${[...Array(6)].map((_, i) => `<circle cx="${Math.sin(i * 2 + k * 9) * 30}" cy="${300 + ((k * 90 + i * 40) % 160)}" r="${14 + (i % 3) * 5}" fill="#fff" opacity="${0.55 - ((k * 90 + i * 40) % 160) / 320}"/>`).join('')}</g>`;
    case 'bottleG': return `<g><rect x="-34" y="0" width="68" height="150" rx="22" fill="#22c55e" ${O}/><rect x="-18" y="-44" width="36" height="50" rx="8" fill="#f1f5f9" ${O}/><rect x="-30" y="48" width="60" height="64" rx="8" fill="#bbf7d0" ${O}/><text x="0" y="90" font-family="Anton" font-size="26" text-anchor="middle" fill="#14532d">VERDE</text></g>`;
    case 'bottleB': return `<g><rect x="-34" y="0" width="68" height="150" rx="22" fill="#1f2937" ${O}/><rect x="-18" y="-44" width="36" height="50" rx="8" fill="#f1f5f9" ${O}/><rect x="-30" y="48" width="60" height="64" rx="8" fill="#e5e7eb" ${O}/><text x="0" y="90" font-family="Anton" font-size="26" text-anchor="middle" fill="#111827">NEGRO</text></g>`;
    case 'bottle': return `<g><rect x="-34" y="0" width="68" height="150" rx="22" fill="#38bdf8" ${O}/><rect x="-18" y="-44" width="36" height="50" rx="8" fill="#f1f5f9" ${O}/><rect x="-30" y="48" width="60" height="64" rx="8" fill="#e0f2fe" ${O}/><text x="0" y="88" font-family="Anton" font-size="22" text-anchor="middle" fill="#0c4a6e">SERUM</text></g>`;
    case 'neutral': return `<g><rect x="-34" y="0" width="68" height="150" rx="22" fill="#a78bfa" ${O}/><rect x="-18" y="-44" width="36" height="50" rx="8" fill="#f1f5f9" ${O}/><rect x="-30" y="48" width="60" height="64" rx="8" fill="#ede9fe" ${O}/><text x="0" y="82" font-family="Anton" font-size="18" text-anchor="middle" fill="#4c1d95">NEUTRAL.</text></g>`;
    case 'tape': return `<g>${[...Array(5)].map((_, i) => `<path d="M${-60 + i * 30},0 C${-64 + i * 30},90 ${-56 + i * 30},200 ${-60 + i * 30},320" stroke="#12090a" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M${-60 + i * 30},0 C${-64 + i * 30},90 ${-56 + i * 30},200 ${-60 + i * 30},320" stroke="#4b3b36" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/>`).join('')}<rect x="-84" y="-14" width="170" height="34" rx="8" fill="#fde68a" ${O}/></g>`;
    case 'spray': return `<g><rect x="-26" y="0" width="52" height="130" rx="18" fill="#f9a8d4" ${O}/><rect x="-18" y="-40" width="36" height="46" rx="8" fill="#ec4899" ${O}/><path d="M18,-40 h50 l6,-10" stroke="#ec4899" stroke-width="12" fill="none" stroke-linecap="round"/>${[...Array(8)].map((_, i) => `<circle cx="${90 + i * 14}" cy="${-52 + Math.sin(i * 2 + k * 30) * 14}" r="${6 - i * 0.4}" fill="#e0f2fe" opacity="${0.8 - i * 0.09}"/>`).join('')}</g>`;
    case 'towel': return `<g><rect x="-60" y="-10" width="120" height="150" rx="16" fill="#fde68a" ${O}/><path d="M-40,20 h80 M-40,50 h80 M-40,80 h80" stroke="#f59e0b" stroke-width="7"/></g>`;
    default: return '';
  }
}
export function drawStylist(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.9 + 3) * 2.5, blink = p.blink || 0;
  const SK = '#c98f66', SKD = '#b0764f';
  const tool = p.tool && p.tool !== 'none' ? `<g transform="translate(${p.toolX ?? -250},${p.toolY ?? -40}) rotate(${p.toolR ?? 70}) ${p.toolS ? `scale(${p.toolS})` : ''}">${salonTool(p.tool, { k: t })}${p.noHand ? '' : `<g transform="translate(0,${p.gripY ?? 4})">${gripHand(SK)}</g>`}</g>` : '';
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${tool}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-84" y="470" width="70" height="200" rx="26" fill="#111827" ${O}/><rect x="14" y="470" width="70" height="200" rx="26" fill="#111827" ${O}/>
    <ellipse cx="-50" cy="684" rx="58" ry="24" fill="#ec4899" ${O}/><ellipse cx="50" cy="684" rx="58" ry="24" fill="#ec4899" ${O}/>
    <path d="M-160,560 Q-150,170 -84,150 L84,150 Q150,170 160,560Z" fill="#d946ef" ${O}/><path d="M-90,270 L90,270 L110,560 L-110,560Z" fill="#111827" ${O}/><path d="M-90,270 Q0,300 90,270" fill="#111827" ${O}/><path d="M-60,150 L-50,270 M60,150 L50,270" stroke="#111827" stroke-width="14"/>
    <rect x="-70" y="380" width="60" height="64" rx="10" fill="#1f2937" ${O}/><rect x="10" y="380" width="60" height="64" rx="10" fill="#1f2937" ${O}/><path d="M-50,380 v-34 M-36,380 v-40" stroke="#e5e7eb" stroke-width="7" stroke-linecap="round"/><path d="M30,380 v-40" stroke="#ec4899" stroke-width="12" stroke-linecap="round"/>
    <path d="M-48,150 Q0,214 48,150" fill="${SKD}" ${O}/>
    <rect x="-24" y="96" width="48" height="60" fill="${SKD}" ${O}/>
    <circle cx="0" cy="-122" r="74" fill="#f3e9c6" ${O}/><path d="M-30,-170 Q-10,-130 -40,-100" stroke="#ec4899" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M20,-176 Q40,-140 14,-110" stroke="#ec4899" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.9"/>
    <ellipse cx="0" cy="0" rx="102" ry="116" fill="${SK}" ${O}/><ellipse cx="-106" cy="10" rx="14" ry="24" fill="${SK}" ${O}/><ellipse cx="106" cy="10" rx="14" ry="24" fill="${SK}" ${O}/>
    <circle cx="-110" cy="48" r="22" fill="none" stroke="#fbbf24" stroke-width="7"/><circle cx="110" cy="48" r="22" fill="none" stroke="#fbbf24" stroke-width="7"/>
    <path d="M-104,-8 Q-112,-110 0,-114 Q112,-110 104,-8 Q70,-70 0,-76 Q-70,-70 -104,-8Z" fill="#f3e9c6" ${O}/>
    ${eyes(40, -6, blink, p.look || 0, m.big, m.b)}<path d="M-76,-30 l-14,-10 M76,-30 l14,-10" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="-58" cy="34" rx="22" ry="11" fill="#fb7185" opacity="0.5"/><ellipse cx="58" cy="34" rx="22" ry="11" fill="#fb7185" opacity="0.5"/>
    ${(() => { const mm = mouth(m.m, 54, t); return mm.replace(/stroke="#12090a"/g, 'stroke="#12090a"').replace(/fill="#7a1f2a"/g, 'fill="#b91c1c"'); })()}<path d="M-26,64 Q0,82 26,64" stroke="#be123c" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.65"/>
  </g>`;
}
export function drawMemo(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 2.3 + 1) * 3, blink = p.blink || 0;
  const SK = '#8d5a3b', SKD = '#744a30';
  const tool = p.tool && p.tool !== 'none' ? `<g transform="translate(${p.toolX ?? -230},${p.toolY ?? 40}) rotate(${p.toolR ?? 80}) ${p.toolS ? `scale(${p.toolS})` : ''}">${salonTool(p.tool, { k: t })}<g transform="translate(0,4)">${gripHand(SK)}</g></g>` : '';
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${tool}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-80" y="470" width="68" height="200" rx="26" fill="#475569" ${O}/><rect x="12" y="470" width="68" height="200" rx="26" fill="#475569" ${O}/>
    <ellipse cx="-48" cy="684" rx="56" ry="24" fill="#f97316" ${O}/><ellipse cx="48" cy="684" rx="56" ry="24" fill="#f97316" ${O}/>
    <path d="M-150,560 Q-140,170 -80,150 L80,150 Q140,170 150,560Z" fill="#fbbf24" ${O}/><path d="M-84,230 L84,230 L96,560 L-96,560Z" fill="#16a34a" ${O}/><path d="M-60,150 L-50,230 M60,150 L50,230" stroke="#16a34a" stroke-width="14"/>
    <rect x="-24" y="96" width="48" height="60" fill="${SKD}" ${O}/><path d="M-48,150 Q0,206 48,150" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="0" rx="98" ry="112" fill="${SK}" ${O}/><ellipse cx="-102" cy="10" rx="14" ry="24" fill="${SK}" ${O}/><ellipse cx="102" cy="10" rx="14" ry="24" fill="${SK}" ${O}/>
    <path d="M-100,-20 Q-108,-100 0,-108 Q108,-100 100,-20 Q70,-70 0,-72 Q-70,-70 -100,-20Z" fill="#1f1611" ${O}/>
    <path d="M-110,-70 Q0,-150 110,-70 L120,-46 Q0,-100 -120,-46Z" fill="#2563eb" ${O}/><path d="M-100,-96 Q0,-176 100,-96" fill="#3b82f6" ${O}/><rect x="-26" y="-150" width="52" height="16" rx="8" fill="#1d4ed8" ${O}/>
    ${eyes(38, -4, blink, p.look || 0, Math.max(m.big, 0.4), m.b)}
    <ellipse cx="-54" cy="34" rx="20" ry="10" fill="#fb7185" opacity="0.4"/><ellipse cx="54" cy="34" rx="20" ry="10" fill="#fb7185" opacity="0.4"/>
    ${mouth(m.m, 54, t)}
  </g>`;
}
