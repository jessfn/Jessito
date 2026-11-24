// Dia 17: Dra. Ivana (oculista, espejo frontal) y Will (chico amable con chamarra de mezclilla). Boca hablante, brazos continuos.
import { eyes, MOODS } from './chars.mjs';
import { armsC, TOOLS, mouthT } from './chars12.mjs';
import './chars13.mjs'; import './chars14.mjs'; import './chars15.mjs'; import './chars16.mjs';
const OUT = '#12090a'; const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
TOOLS.lensTw = () => `<g><path d="M-8,0 L-4,160 M8,0 L4,160" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="M-8,0 L-4,160 M8,0 L4,160" stroke="#dfe3ea" stroke-width="6" stroke-linecap="round"/><ellipse cx="0" cy="166" rx="16" ry="9" fill="#2a1608" stroke="${OUT}" stroke-width="3"/><ellipse cx="-4" cy="163" rx="6" ry="3" fill="#fff" opacity="0.8"/></g>`;
TOOLS.coat = () => `<g><path d="M-70,-10 Q-80,60 -64,170 L64,170 Q80,60 70,-10 Q0,-40 -70,-10Z" fill="#3b6ea5" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><path d="M-70,-10 L-30,50 L0,-6 L30,50 L70,-10" fill="#e8f0f8" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/><path d="M0,-6 V170" stroke="${OUT}" stroke-width="4"/><rect x="-52" y="70" width="34" height="30" rx="5" fill="#2f5a8a" stroke="${OUT}" stroke-width="3"/><circle cx="-4" cy="40" r="4" fill="#d4a24c"/><circle cx="-4" cy="100" r="4" fill="#d4a24c"/></g>`;
export function drawIvana(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.9 + 1.1) * 2.6, blink = p.blink || 0, SK = '#d8a070', SKD = '#bd8456', HR = '#1a1020';
  const spec = { sleeve: '#f6f8fb', skin: SK, frac: 1, cuff: '#7c6ad8', sh: 118, shy: 200, wU: 46, wF: 36 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-66" y="470" width="54" height="210" rx="22" fill="#4a3a98" ${O}/><rect x="12" y="470" width="54" height="210" rx="22" fill="#4a3a98" ${O}/>
    <path d="M-78,684 q-4,22 14,22 h60 q4,-16 -6,-22Z" fill="#f4f0ff" ${O}/><path d="M78,684 q4,22 -14,22 h-60 q-4,-16 6,-22Z" fill="#f4f0ff" ${O}/>
    <path d="M-130,610 Q-138,170 -78,150 L78,150 Q138,170 130,610Z" fill="#f6f8fb" ${O}/><path d="M-56,150 L0,300 L56,150Z" fill="#7c6ad8" ${O}/><path d="M0,300 V610" stroke="${OUT}" stroke-width="6" opacity="0.45"/><rect x="58" y="360" width="56" height="48" rx="8" fill="#e8ecf4" ${O}/><circle cx="-60" cy="360" r="12" fill="#7ff0ea" ${O}/>
    <rect x="-20" y="96" width="40" height="60" fill="${SKD}" ${O}/><path d="M-40,150 Q0,190 40,150" fill="${SKD}" ${O}/>
    <circle cx="0" cy="-150" r="46" fill="${HR}" ${O}/><path d="M-30,-160 q30,-26 60,0" stroke="#cfd2d8" stroke-width="8" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="90" ry="110" fill="${SK}" ${O}/><ellipse cx="-94" cy="12" rx="12" ry="21" fill="${SK}" ${O}/><ellipse cx="94" cy="12" rx="12" ry="21" fill="${SK}" ${O}/>
    <path d="M-92,-26 Q-100,-120 0,-130 Q100,-120 92,-26 Q60,-84 0,-88 Q-60,-84 -92,-26Z" fill="${HR}" ${O}/><path d="M-30,-84 Q20,-96 64,-72" stroke="#cfd2d8" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/>
    <rect x="-70" y="-96" width="140" height="14" rx="7" fill="#e8ecf4" ${O}/><circle cx="0" cy="-92" r="26" fill="#cfd8e8" ${O}/><circle cx="0" cy="-92" r="14" fill="#fff" opacity="0.8"/><circle cx="-6" cy="-98" r="5" fill="#fff"/>
    ${eyes(38, -4, blink, p.look || 0, m.big * 0.9, m.b)}<path d="M-74,-26 q18,-12 40,-4 M74,-26 q-18,-12 -40,-4" stroke="${HR}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M0,16 q-8,16 0,22 q8,-2 8,-6" stroke="#8a5a36" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-56" cy="34" rx="20" ry="10" fill="#e87a8a" opacity="0.35"/><ellipse cx="56" cy="34" rx="20" ry="10" fill="#e87a8a" opacity="0.35"/>${mouthT(p.mood || 'calm', 56, p.mouthOpen || 0, '#b4345a', 0.7)}
    ${armsC(p, spec, 'body')}
  </g>`; }
export function drawWill(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 2.0 + 0.3) * 2.6, blink = p.blink || 0, SK = '#6a4430', SKD = '#52331f', HR = '#0e0a08';
  const spec = { sleeve: '#3b6ea5', skin: SK, frac: 1, cuff: '#e8f0f8', sh: 112, shy: 204, wU: 48, wF: 38 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <path d="M-66,470 L-6,470 L-10,740 L-72,740Z" fill="#2a2f3c" ${O}/><path d="M66,470 L6,470 L10,740 L72,740Z" fill="#2a2f3c" ${O}/>
    <path d="M-80,744 q-8,26 12,26 h70 q6,-16 -6,-26Z" fill="#f2f2f6" ${O}/><path d="M80,744 q8,26 -12,26 h-70 q-6,-16 6,-26Z" fill="#f2f2f6" ${O}/><path d="M-84,762 h82 M84,762 h-82" stroke="#d1d5db" stroke-width="5"/>
    <path d="M-120,610 Q-128,200 -66,170 L66,170 Q128,200 120,610Z" fill="#3b6ea5" ${O}/><path d="M-48,170 L0,260 L48,170Z" fill="#f6f6fa" ${O}/><path d="M0,260 V610" stroke="${OUT}" stroke-width="5"/><rect x="-100" y="420" width="62" height="54" rx="8" fill="#2f5a8a" ${O}/><circle cx="-6" cy="330" r="6" fill="#d4a24c" ${O}/><circle cx="-6" cy="440" r="6" fill="#d4a24c" ${O}/><circle cx="-6" cy="550" r="6" fill="#d4a24c" ${O}/>
    <rect x="-18" y="100" width="36" height="76" fill="${SKD}" ${O}/><path d="M-36,170 Q0,204 36,170" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="0" rx="82" ry="114" fill="${SK}" ${O}/><ellipse cx="-86" cy="10" rx="11" ry="21" fill="${SK}" ${O}/><ellipse cx="86" cy="10" rx="11" ry="21" fill="${SK}" ${O}/>
    <path d="M-84,-30 C-90,-104 -40,-136 6,-134 C60,-132 96,-100 84,-30 C70,-64 40,-82 0,-84 C-40,-82 -68,-66 -84,-30Z" fill="${HR}" ${O}/><path d="M-60,-102 Q0,-126 60,-102" stroke="#3a2e28" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
    ${eyes(34, -4, blink, p.look || 0, m.big * 0.8, m.b)}<path d="M-66,-28 q16,-10 34,-4 M66,-28 q-16,-10 -34,-4" stroke="#0e0a08" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M0,14 q-8,18 0,24 q8,-2 9,-8" stroke="#3a2214" stroke-width="4" fill="none" stroke-linecap="round"/>${mouthT(p.mood || 'calm', 60, p.mouthOpen || 0, '#8a3a40', 0.6)}
    ${armsC(p, spec, 'body')}
  </g>`; }
