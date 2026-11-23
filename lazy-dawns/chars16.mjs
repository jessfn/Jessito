// Dia 16: Don Chuy (conserje de la clinica, voz Harry). Boca hablante, brazos continuos, trapeador.
import { eyes, MOODS } from './chars.mjs';
import { armsC, TOOLS, mouthT } from './chars12.mjs';
import './chars13.mjs'; import './chars15.mjs';
const OUT = '#12090a'; const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
TOOLS.mop = (k) => `<g><rect x="-6" y="-160" width="12" height="330" rx="5" fill="#b08a5a" stroke="${OUT}" stroke-width="5"/><path d="M-50,170 Q0,150 50,170 L60,250 Q0,270 -60,250Z" fill="#cfd4da" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>${[...Array(9)].map((_, i) => `<path d="M${-48 + i * 12},176 q${((i % 2) ? 5 : -5) + Math.sin(k * 3 + i) * 2},40 ${((i % 2) ? -4 : 4)},78" stroke="#8d949c" stroke-width="3" fill="none"/>`).join('')}</g>`;
export function drawChuy(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.9 + 0.4) * 2.4, blink = p.blink || 0, SK = '#b98660', SKD = '#9a6c48', HR = '#cfd2d8';
  const spec = { sleeve: '#4b6584', skin: SK, frac: 0.35, cuff: null, sh: 116, shy: 204, wU: 52, wF: 40 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-70" y="470" width="58" height="210" rx="22" fill="#33425a" ${O}/><rect x="12" y="470" width="58" height="210" rx="22" fill="#33425a" ${O}/>
    <path d="M-84,684 q-4,22 14,22 h66 q4,-16 -6,-22Z" fill="#3a2a20" ${O}/><path d="M84,684 q4,22 -14,22 h-66 q-4,-16 6,-22Z" fill="#3a2a20" ${O}/>
    <path d="M-136,600 Q-142,170 -80,150 L80,150 Q142,170 136,600Z" fill="#4b6584" ${O}/><path d="M-50,150 L0,230 L50,150Z" fill="${SKD}" ${O}/><rect x="40" y="300" width="70" height="44" rx="6" fill="#e5e7eb" ${O}/><text x="75" y="330" font-family="Anton" font-size="22" text-anchor="middle" fill="#12090a">CHUY</text><path d="M-136,430 H136" stroke="#2f405a" stroke-width="6" opacity="0.6"/>
    <rect x="-22" y="96" width="44" height="60" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="0" rx="98" ry="112" fill="${SK}" ${O}/><ellipse cx="-102" cy="12" rx="14" ry="23" fill="${SK}" ${O}/><ellipse cx="102" cy="12" rx="14" ry="23" fill="${SK}" ${O}/>
    <path d="M-96,-40 Q-100,-120 0,-128 Q100,-120 96,-40 Q70,-84 0,-88 Q-70,-84 -96,-40Z" fill="${HR}" ${O}/><path d="M-100,-36 Q-110,0 -98,36 M100,-36 Q110,0 98,36" stroke="${HR}" stroke-width="20" fill="none" stroke-linecap="round"/>
    ${eyes(40, -4, blink, p.look || 0, m.big * 0.9, m.b)}<path d="M-74,-26 q18,-12 40,-6 M74,-26 q-18,-12 -40,-6" stroke="#8d949c" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M0,14 q-9,18 0,26 q9,-2 10,-8" stroke="#7a4e30" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-60,30 q10,26 40,22 M60,30 q-10,26 -40,22" stroke="#8a5a3c" stroke-width="3" fill="none" opacity="0.5"/>
    ${mouthT(p.mood || 'calm', 62, p.mouthOpen || 0, '#8a3a30', 0.5)}
    <path d="M-52,48 Q-26,36 0,46 Q26,36 52,48 Q26,62 0,54 Q-26,62 -52,48Z" fill="#aab0b8" ${O}/>
    ${armsC(p, spec, 'body')}
  </g>`; }

TOOLS.extint = (k) => `<g><rect x="-30" y="0" width="60" height="170" rx="18" fill="#e11d48" stroke="${OUT}" stroke-width="6"/><rect x="-14" y="-26" width="28" height="30" fill="#444" stroke="${OUT}" stroke-width="4"/><path d="M14,-18 Q60,-40 54,20" stroke="#222" stroke-width="7" fill="none"/><rect x="-20" y="50" width="40" height="60" rx="6" fill="#fff" opacity="0.9"/><path d="M54,20 L150,-40 L190,60Z" fill="#f4f8ff" opacity="${(0.55 + 0.25 * Math.sin(k * 40)).toFixed(2)}"/>${[...Array(14)].map((_, i) => `<circle cx="${(60 + ((k * 90 + i * 17) % 130)).toFixed(0)}" cy="${(10 - ((k * 60 + i * 23) % 70) + (i % 3) * 10).toFixed(0)}" r="${4 + (i % 4) * 2}" fill="#fff" opacity="0.8"/>`).join('')}</g>`;
