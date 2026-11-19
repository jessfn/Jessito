// Personajes nuevos del dia 13 (clinica Aurora): Dr. Montes y Nuria. Boca hablante (p.mouthOpen), brazos continuos.
import { eyes, MOODS } from './chars.mjs';
import { armsC, TOOLS, mouthT } from './chars12.mjs';
const OUT = '#12090a'; const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
TOOLS.syringe = (k) => `<g><rect x="-24" y="0" width="48" height="130" rx="16" fill="#cfefff" fill-opacity="0.85" stroke="${OUT}" stroke-width="6"/><rect x="-17" y="30" width="34" height="84" rx="10" fill="#8fe8ff"/><rect x="-40" y="-8" width="80" height="18" rx="9" fill="#22c6d8" stroke="${OUT}" stroke-width="5"/><rect x="-6" y="-70" width="12" height="64" fill="#e9eef5" stroke="${OUT}" stroke-width="4"/><rect x="-30" y="-84" width="60" height="16" rx="8" fill="#22c6d8" stroke="${OUT}" stroke-width="5"/><path d="M0,130 L0,200" stroke="#e9eef5" stroke-width="6" stroke-linecap="round"/><ellipse cx="0" cy="${(212 + ((k * 3) % 1) * 24).toFixed(0)}" rx="5" ry="8" fill="#8fe8ff"/></g>`;
TOOLS.tablet = (k) => `<g><rect x="-86" y="-4" width="172" height="124" rx="14" fill="#0e1722" stroke="${OUT}" stroke-width="6"/><rect x="-76" y="6" width="152" height="104" rx="8" fill="#062a38"/><path d="M-10,22 C-10,50 -22,60 -34,76 C-22,84 -2,84 4,72 C4,50 0,34 0,22" stroke="#7ff0ea" stroke-width="4" fill="none"/><path d="M-60,96 h120" stroke="#22c6d8" stroke-width="4"/>${[...Array(5)].map((_, i) => `<rect x="${-62 + i * 26}" y="${78 + (i * 7 + Math.floor(k * 8)) % 14}" width="14" height="${20 - (i * 7 + Math.floor(k * 8)) % 14}" fill="#7ff0ea"/>`).join('')}</g>`;
TOOLS.cloth = () => `<g><path d="M-60,0 Q0,-30 60,0 L50,90 Q0,110 -50,90Z" fill="#d8f5ff" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/><path d="M-30,20 q30,14 60,0" stroke="#7fd8ff" stroke-width="5" fill="none"/></g>`;
export function drawMontes(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.7 + 0.6) * 2.6, blink = p.blink || 0, SK = '#e2b48e', SKD = '#c8946c', HR = '#c9ced8';
  const spec = { sleeve: '#f6f8fb', skin: SK, frac: 1, cuff: '#0d9488', sh: 124, shy: 196, wU: 46, wF: 36 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-72" y="470" width="56" height="210" rx="22" fill="#115e59" ${O}/><rect x="16" y="470" width="56" height="210" rx="22" fill="#115e59" ${O}/>
    <path d="M-86,684 q-4,22 14,22 h60 q4,-16 -6,-22Z" fill="#14b8a6" ${O}/><path d="M86,684 q4,22 -14,22 h-60 q-4,-16 6,-22Z" fill="#14b8a6" ${O}/>
    <path d="M-132,600 Q-138,170 -76,150 L76,150 Q138,170 132,600Z" fill="#f6f8fb" ${O}/><path d="M-60,150 L0,330 L60,150Z" fill="#14b8a6" ${O}/><path d="M0,330 V600" stroke="${OUT}" stroke-width="6" opacity="0.5"/><rect x="62" y="380" width="52" height="46" rx="8" fill="#e2e8f0" ${O}/><path d="M72,380 v-30 M88,380 v-24" stroke="#22c6d8" stroke-width="7" stroke-linecap="round"/>
    <rect x="-20" y="96" width="40" height="60" fill="${SKD}" ${O}/><path d="M-40,150 Q0,196 40,150" fill="${SKD}" ${O}/>
    <path d="M-100,-10 Q-110,-120 0,-130 Q110,-120 100,-10 Q60,-70 0,-76 Q-60,-70 -100,-10Z" fill="${HR}" ${O}/>
    <ellipse cx="0" cy="0" rx="92" ry="112" fill="${SK}" ${O}/><ellipse cx="-96" cy="12" rx="12" ry="22" fill="${SK}" ${O}/><ellipse cx="96" cy="12" rx="12" ry="22" fill="${SK}" ${O}/>
    <path d="M-92,-30 Q-104,-110 -20,-126 Q70,-134 100,-60 Q96,-20 88,-30 Q70,-84 0,-90 Q-60,-86 -92,-30Z" fill="${HR}" ${O}/><path d="M-70,-84 Q0,-120 70,-84" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6"/>
    ${eyes(38, -4, blink, p.look || 0, m.big * 0.7, m.b)}<circle cx="-38" cy="-4" r="38" fill="#cfefff" fill-opacity="0.15" stroke="#d4a24c" stroke-width="5"/><circle cx="38" cy="-4" r="38" fill="#cfefff" fill-opacity="0.15" stroke="#d4a24c" stroke-width="5"/><path d="M-2,-8 h4 M-76,-6 l-24,-8 M76,-6 l24,-8" stroke="#d4a24c" stroke-width="5"/>
    <path d="M0,16 q-9,18 0,24 q9,-2 10,-8" stroke="#8a5a3c" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-34,60 Q0,${74 + (p.mouthOpen || 0) * 30} 34,60 Q50,96 0,104 Q-50,96 -34,60Z" fill="${HR}" ${O} opacity="0.95"/>${mouthT(p.mood || 'calm', 56, p.mouthOpen || 0, '#9a3a30', 0.5)}
    ${armsC(p, spec, 'body')}
  </g>`; }
export function drawNuria(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 2.2 + 3.1) * 2.8, blink = p.blink || 0, SK = '#8a5a3c', SKD = '#6e442a', CAP = '#22c6d8';
  const spec = { sleeve: '#a78bfa', skin: SK, frac: 0.3, cuff: null, sh: 106, shy: 200, wU: 44, wF: 34 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-64" y="470" width="52" height="210" rx="22" fill="#6d28d9" ${O}/><rect x="12" y="470" width="52" height="210" rx="22" fill="#6d28d9" ${O}/>
    <ellipse cx="-38" cy="690" rx="50" ry="20" fill="#f5f5fa" ${O}/><ellipse cx="38" cy="690" rx="50" ry="20" fill="#f5f5fa" ${O}/>
    <path d="M-112,570 Q-116,170 -66,150 L66,150 Q116,170 112,570Z" fill="#a78bfa" ${O}/><path d="M-56,150 L0,236 L56,150" fill="${SKD}" ${O}/><rect x="40" y="320" width="60" height="78" rx="8" fill="#fff" ${O}/><circle cx="70" cy="344" r="12" fill="#c4b5fd" ${O}/><path d="M52,372 h36 M52,384 h26" stroke="#6d28d9" stroke-width="4"/>
    <rect x="-18" y="96" width="36" height="60" fill="${SKD}" ${O}/>
    ${[-3, -1, 1, 3].map((i) => `<path d="M${i * 26},-40 C${i * 32},40 ${i * 30},120 ${i * 36},230" stroke="#0f0a0a" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M${i * 26},-40 C${i * 32},40 ${i * 30},120 ${i * 36},230" stroke="#2a1a14" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="10 6"/>`).join('')}
    <ellipse cx="0" cy="0" rx="90" ry="108" fill="${SK}" ${O}/><ellipse cx="-94" cy="12" rx="12" ry="21" fill="${SK}" ${O}/><ellipse cx="94" cy="12" rx="12" ry="21" fill="${SK}" ${O}/><circle cx="-100" cy="42" r="14" fill="#f2c040" ${O}/><circle cx="100" cy="42" r="14" fill="#f2c040" ${O}/>
    <path d="M-96,-24 Q-100,-124 0,-132 Q100,-124 96,-24 Q60,-78 0,-80 Q-60,-78 -96,-24Z" fill="${CAP}" ${O}/><path d="M-80,-70 Q0,-110 80,-70" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>${[[-50,-92],[0,-108],[50,-92],[-24,-80],[26,-80]].map(([x, y]) => `<path d="M${x},${y - 9} l3,7 l8,1 l-6,5 l2,8 l-7,-4 l-7,4 l2,-8 l-6,-5 l8,-1Z" fill="#fff"/>`).join('')}
    ${eyes(38, -4, blink, p.look || 0, m.big + 0.2, m.b)}<path d="M-72,-24 q18,-12 40,-4 M72,-24 q-18,-12 -40,-4" stroke="${OUT}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M0,16 q-8,16 0,22 q8,-2 8,-6" stroke="#5a3620" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-56" cy="34" rx="20" ry="10" fill="#e06a7a" opacity="0.35"/><ellipse cx="56" cy="34" rx="20" ry="10" fill="#e06a7a" opacity="0.35"/>${mouthT(p.mood || 'calm', 56, p.mouthOpen || 0, '#a02a5a', 0.7)}
    ${armsC(p, spec, 'body')}
  </g>`; }
