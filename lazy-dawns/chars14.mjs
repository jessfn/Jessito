// Personajes nuevos del dia 14: Dustin (chico alto, flaco, pelo cafe ondulado, lentes circulares, piel blanca) y Yaz (manicurista del salon Rouge).
// Boca hablante (p.mouthOpen), brazos continuos con manos de 4 dedos + pulgar.
import { eyes, MOODS } from './chars.mjs';
import { armsC, TOOLS, mouthT } from './chars12.mjs';
const OUT = '#12090a'; const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
TOOLS.nbrush = (k) => `<g><rect x="-14" y="0" width="28" height="120" rx="12" fill="#e01a30" stroke="${OUT}" stroke-width="6"/><rect x="-12" y="-30" width="24" height="36" rx="8" fill="#12090a"/><path d="M-5,120 L0,168 L5,120Z" fill="#7a1020" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="${(170 + ((k * 2) % 1) * 8).toFixed(0)}" r="4" fill="#e01a30"/></g>`;
TOOLS.nfile = (k) => `<g><path d="M-18,0 L18,0 L22,150 L-22,150Z" fill="#f5f5f7" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><path d="M-18,30 h36 M-19,60 h38 M-20,90 h40 M-21,120 h42" stroke="#d6a1ba" stroke-width="3"/><path d="M-18,0 L18,0 L22,30 L-22,30Z" fill="#f2b8d2" stroke="${OUT}" stroke-width="4"/></g>`;
TOOLS.dphone = () => `<g><rect x="-34" y="0" width="68" height="124" rx="14" fill="#0e0e14" stroke="${OUT}" stroke-width="6"/><rect x="-27" y="8" width="54" height="104" rx="8" fill="#1f2a3a"/><rect x="-18" y="22" width="36" height="12" rx="6" fill="#3b82f6"/><rect x="-6" y="40" width="24" height="12" rx="6" fill="#e5e7eb"/><circle cx="-18" cy="16" r="3" fill="#fff6d8"/></g>`;
TOOLS.coffee = () => `<g><path d="M-30,0 L30,0 L24,100 L-24,100Z" fill="#f4e6d2" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><rect x="-34" y="-12" width="68" height="16" rx="7" fill="#3a2418" stroke="${OUT}" stroke-width="5"/><path d="M-27,30 h54 v36 h-54Z" fill="#c2410c"/><text x="0" y="58" font-family="Anton" font-size="22" text-anchor="middle" fill="#fff">CAFÉ</text></g>`;

export function drawDustin(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.8 + 0.9) * 2.4, blink = p.blink || 0, SK = '#f3d6c3', SKD = '#e3b9a3', HR = '#6b4326', HR2 = '#8a5a35';
  const spec = { sleeve: '#6f7a3c', skin: SK, frac: 1, cuff: '#e8e6dc', sh: 96, shy: 214, wU: 34, wF: 28 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <path d="M-66,470 L-6,470 L-10,760 L-72,760Z" fill="#26324a" ${O}/><path d="M66,470 L6,470 L10,760 L72,760Z" fill="#26324a" ${O}/><path d="M0,470 V760" stroke="${OUT}" stroke-width="3" opacity="0.4"/>
    <path d="M-80,764 q-8,26 12,26 h70 q6,-16 -6,-26Z" fill="#f7f7fb" ${O}/><path d="M80,764 q8,26 -12,26 h-70 q-6,-16 6,-26Z" fill="#f7f7fb" ${O}/><path d="M-84,782 h82 M84,782 h-82" stroke="#d1d5db" stroke-width="5"/><rect x="-70" y="758" width="40" height="10" rx="5" fill="#ef4444" ${O}/><rect x="30" y="758" width="40" height="10" rx="5" fill="#ef4444" ${O}/>
    <path d="M-102,600 Q-110,230 -62,196 L62,196 Q110,230 102,600Z" fill="#e8e6dc" ${O}/><path d="M-100,620 Q-108,260 -66,204 L-30,204 L-42,640Z" fill="#6f7a3c" ${O}/><path d="M100,620 Q108,260 66,204 L30,204 L42,640Z" fill="#6f7a3c" ${O}/><path d="M-30,204 L0,300 L30,204Z" fill="#e8e6dc" ${O}/><path d="M-42,420 h6 M42,420 h-6 M-42,500 h6 M42,500 h-6" stroke="#2a3012" stroke-width="5" stroke-linecap="round"/>
    <path d="M-86,250 Q-30,420 60,560" stroke="#3a2418" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.8"/><rect x="40" y="520" width="80" height="70" rx="12" fill="#3a2418" ${O}/>
    <rect x="-16" y="100" width="32" height="104" fill="${SKD}" ${O}/><path d="M-40,200 Q0,232 40,200" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="0" rx="80" ry="114" fill="${SK}" ${O}/><ellipse cx="-84" cy="10" rx="11" ry="21" fill="${SK}" ${O}/><ellipse cx="84" cy="10" rx="11" ry="21" fill="${SK}" ${O}/>
    <path d="M-86,-20 C-100,-110 -50,-150 6,-146 C70,-142 104,-100 90,-20 C76,-56 54,-72 20,-80 C-20,-70 -56,-58 -86,-20Z" fill="${HR}" ${O}/>
    <path d="M-80,-60 C-96,-40 -92,-10 -84,10 M82,-60 C98,-40 94,-10 86,10" stroke="${HR}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M-80,-60 C-96,-40 -92,-10 -84,10 M82,-60 C98,-40 94,-10 86,10" stroke="${OUT}" stroke-width="3" fill="none" opacity="0.4"/>
    ${[-60, -30, 0, 30, 58].map((x, i) => `<path d="M${x},-100 q10,${16 - (i % 2) * 8} ${-6},${34 + i % 2 * 6}" stroke="${HR2}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.85"/>`).join('')}
    <path d="M-60,-120 Q0,-150 60,-120" stroke="#b37a4a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
    ${eyes(34, -4, blink, p.look || 0, m.big * 0.7, m.b)}
    <circle cx="-34" cy="-4" r="34" fill="#cfefff" fill-opacity="0.14" stroke="#1a1a22" stroke-width="5"/><circle cx="34" cy="-4" r="34" fill="#cfefff" fill-opacity="0.14" stroke="#1a1a22" stroke-width="5"/><path d="M-2,-8 q2,-5 4,0 M-68,-6 l-14,-6 M68,-6 l14,-6" stroke="#1a1a22" stroke-width="5" fill="none"/><path d="M-50,-18 q10,-8 20,-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M-68,-30 q18,-10 36,-4 M68,-30 q-18,-10 -36,-4" stroke="#4a2c16" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M0,14 q-7,16 0,22 q7,-2 8,-6" stroke="#b8856a" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-48" cy="34" rx="16" ry="8" fill="#ee8a8a" opacity="0.3"/><ellipse cx="48" cy="34" rx="16" ry="8" fill="#ee8a8a" opacity="0.3"/>${mouthT(p.mood || 'calm', 60, p.mouthOpen || 0, '#b4565a', 0.7)}
    ${armsC(p, spec, 'body')}
  </g>`; }

export function drawYaz(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 2.1 + 2.0) * 2.8, blink = p.blink || 0, SK = '#a8704a', SKD = '#8a5736', HR = '#120a0a';
  const spec = { sleeve: '#fbcfe8', skin: SK, frac: 0.32, cuff: null, sh: 108, shy: 200, wU: 44, wF: 34 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-62" y="470" width="50" height="210" rx="22" fill="#1f1830" ${O}/><rect x="12" y="470" width="50" height="210" rx="22" fill="#1f1830" ${O}/>
    <ellipse cx="-38" cy="690" rx="48" ry="20" fill="#f9a8d4" ${O}/><ellipse cx="38" cy="690" rx="48" ry="20" fill="#f9a8d4" ${O}/>
    <path d="M-118,590 Q-124,170 -68,150 L68,150 Q124,170 118,590Z" fill="#fbcfe8" ${O}/><path d="M-60,150 L0,250 L60,150Z" fill="${SKD}" ${O}/><path d="M-60,150 L0,250 L60,150" stroke="#be185d" stroke-width="8" fill="none"/><rect x="26" y="330" width="74" height="86" rx="10" fill="#fff" ${O}/><path d="M38,352 h46 M38,372 h34" stroke="#be185d" stroke-width="5" stroke-linecap="round"/><circle cx="62" cy="396" r="7" fill="#d4a24c"/>
    <path d="M-110,440 H110" stroke="#f472b6" stroke-width="6" opacity="0.7"/>
    <rect x="-18" y="96" width="36" height="60" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="-140" rx="44" ry="40" fill="${HR}" ${O}/><circle cx="0" cy="-168" r="26" fill="#d4a24c" opacity="0.0"/><path d="M-30,-146 q30,-30 60,0" stroke="#d4a24c" stroke-width="10" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="0" rx="88" ry="108" fill="${SK}" ${O}/><ellipse cx="-92" cy="12" rx="12" ry="21" fill="${SK}" ${O}/><ellipse cx="92" cy="12" rx="12" ry="21" fill="${SK}" ${O}/>
    <circle cx="-100" cy="44" r="22" fill="none" stroke="#fbbf24" stroke-width="7"/><circle cx="100" cy="44" r="22" fill="none" stroke="#fbbf24" stroke-width="7"/>
    <path d="M-92,-24 Q-100,-120 0,-130 Q100,-120 92,-24 Q60,-86 0,-92 Q-60,-86 -92,-24Z" fill="${HR}" ${O}/><path d="M-70,-80 Q0,-116 70,-80" stroke="#6b7280" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6"/>
    ${eyes(38, -4, blink, p.look || 0, m.big + 0.1, m.b)}<path d="M-74,-24 q18,-14 40,-4 M74,-24 q-18,-14 -40,-4" stroke="${HR}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M-52,6 l12,4 M52,6 l-12,4" stroke="${HR}" stroke-width="3" opacity="0.6"/><path d="M0,16 q-8,16 0,22 q8,-2 8,-6" stroke="#6e3f22" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-56" cy="34" rx="20" ry="10" fill="#f472b6" opacity="0.4"/><ellipse cx="56" cy="34" rx="20" ry="10" fill="#f472b6" opacity="0.4"/>${mouthT(p.mood || 'calm', 56, p.mouthOpen || 0, '#be123c', 0.8)}
    ${armsC(p, spec, 'body')}
  </g>`; }
