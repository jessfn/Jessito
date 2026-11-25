// Dia 18: Dona Susan (mama de Lazy: mujer madura, moño bajo con canas, delantal floral) + herramientas de maquillaje. Boca hablante, brazos continuos.
import { eyes, MOODS } from './chars.mjs';
import { armsC, TOOLS, mouthT } from './chars12.mjs';
import './chars17.mjs';
const OUT = '#12090a'; const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
TOOLS.cotton = (k) => `<g><path d="M-8,0 h16 v70 h-16Z" fill="#f4f4f8" stroke="${OUT}" stroke-width="5" opacity="0"/><ellipse cx="0" cy="${(8 + Math.sin(k * 7) * 3).toFixed(1)}" rx="30" ry="21" fill="#fffdf8" stroke="${OUT}" stroke-width="5"/><ellipse cx="-6" cy="4" rx="14" ry="8" fill="#e8f4fb" opacity="0.8"/></g>`;
TOOLS.micellar = () => `<g><rect x="-26" y="0" width="52" height="116" rx="14" fill="#cfeaf7" stroke="${OUT}" stroke-width="6"/><rect x="-18" y="-26" width="36" height="30" rx="6" fill="#f472b6" stroke="${OUT}" stroke-width="5"/><rect x="-20" y="36" width="40" height="46" rx="6" fill="#fff" opacity="0.9"/><path d="M-10,52 h20 M-10,64 h14" stroke="#4a90c8" stroke-width="3"/></g>`;
TOOLS.jar = () => `<g><rect x="-40" y="0" width="80" height="62" rx="12" fill="#fde7f0" stroke="${OUT}" stroke-width="6"/><rect x="-44" y="-18" width="88" height="24" rx="8" fill="#e8b24a" stroke="${OUT}" stroke-width="5"/><path d="M-26,24 h52" stroke="#e8a0b8" stroke-width="5" stroke-linecap="round"/></g>`;
TOOLS.sponge = () => `<g><ellipse cx="0" cy="0" rx="34" ry="26" fill="#f2c9a4" stroke="${OUT}" stroke-width="5"/><ellipse cx="-8" cy="-6" rx="14" ry="9" fill="#fbe3cc" opacity="0.8"/><circle cx="12" cy="6" r="3" fill="#d89a6c"/><circle cx="-14" cy="8" r="2.4" fill="#d89a6c"/></g>`;
TOOLS.palette = () => `<g><rect x="-60" y="0" width="120" height="84" rx="12" fill="#3a1030" stroke="${OUT}" stroke-width="6"/>${['#4a0f3a', '#8a2a6a', '#e0b0d8', '#c06048'].map((c, i) => `<circle cx="${-36 + i * 24}" cy="30" r="10" fill="${c}"/><circle cx="${-36 + i * 24}" cy="58" r="10" fill="${['#f0d8f0', '#b050a0', '#fff0f4', '#7a2a1a'][i]}"/>`).join('')}</g>`;
TOOLS.brushS = () => `<g><rect x="-6" y="0" width="12" height="100" rx="6" fill="#6a3a22" stroke="${OUT}" stroke-width="4"/><path d="M-9,0 Q0,-40 9,0Z" fill="#8a2a6a" stroke="${OUT}" stroke-width="4"/><rect x="-8" y="-2" width="16" height="12" fill="#d4d8de" stroke="${OUT}" stroke-width="3"/></g>`;
TOOLS.brushL = () => `<g><rect x="-4" y="0" width="8" height="104" rx="4" fill="#1a0a14" stroke="${OUT}" stroke-width="3"/><path d="M-5,0 L0,-34 L5,0Z" fill="#1a0612" stroke="${OUT}" stroke-width="3"/></g>`;
TOOLS.brushB = () => `<g><rect x="-6" y="0" width="12" height="100" rx="6" fill="#f0c070" stroke="${OUT}" stroke-width="4"/><path d="M-22,0 Q0,-52 22,0Z" fill="#c06048" stroke="${OUT}" stroke-width="4"/><rect x="-9" y="-2" width="18" height="12" fill="#d4d8de" stroke="${OUT}" stroke-width="3"/></g>`;
TOOLS.lipstick = () => `<g><rect x="-17" y="20" width="34" height="62" rx="5" fill="#1a1020" stroke="${OUT}" stroke-width="5"/><rect x="-15" y="-6" width="30" height="30" rx="4" fill="#d4a24c" stroke="${OUT}" stroke-width="4"/><path d="M-13,-6 L13,-6 L9,-30 L-9,-34Z" fill="#9c0f1c" stroke="${OUT}" stroke-width="4"/></g>`;
export function drawSusan(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 1.7 + 0.5) * 2.4, blink = p.blink || 0, SK = '#c58a5c', SKD = '#a86e44', HR = '#3a2012', GR = '#c9c4c0';
  const spec = { sleeve: '#7c9a8a', skin: SK, frac: 0.55, cuff: '#e9efe8', sh: 106, shy: 206, wU: 46, wF: 36 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <path d="M-60,500 Q-70,610 -62,760 L-8,760 L-6,500Z" fill="#3a3a4a" ${O}/><path d="M60,500 Q70,610 62,760 L8,760 L6,500Z" fill="#3a3a4a" ${O}/>
    <path d="M-76,764 q-10,26 14,26 h66 q4,-14 -6,-26Z" fill="#7a3a34" ${O}/><path d="M76,764 q10,26 -14,26 h-66 q-4,-14 6,-26Z" fill="#7a3a34" ${O}/>
    <path d="M-122,610 Q-130,180 -70,158 L70,158 Q130,180 122,610Z" fill="#7c9a8a" ${O}/><path d="M-44,158 L0,236 L44,158Z" fill="#e9efe8" ${O}/>
    <path d="M-78,300 Q-86,520 -76,640 L76,640 Q86,520 78,300 L48,300 L48,380 L-48,380 L-48,300Z" fill="#f6e2c8" ${O}/><path d="M-48,300 L-70,196 M48,300 L70,196" stroke="#f6e2c8" stroke-width="14" stroke-linecap="round"/><path d="M-48,300 L-70,196 M48,300 L70,196" stroke="${OUT}" stroke-width="3" opacity="0.5"/>
    ${[[-50, 430], [10, 520], [48, 440], [-20, 590], [-62, 560]].map(([x, y], i) => `<g transform="translate(${x},${y})"><circle r="9" fill="${i % 2 ? '#e8a0b8' : '#c8486a'}"/><circle r="3" fill="#ffe29a"/></g>`).join('')}
    <rect x="-40" y="500" width="80" height="62" rx="10" fill="#e8d0aa" ${O}/><path d="M-22,500 v-12 M22,500 v-12" stroke="${OUT}" stroke-width="4"/>
    <rect x="-18" y="96" width="36" height="64" fill="${SKD}" ${O}/><path d="M-38,160 Q0,196 38,160" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="-112" rx="62" ry="44" fill="${HR}" ${O}/><circle cx="0" cy="-166" r="38" fill="${HR}" ${O}/><path d="M-26,-176 q26,-22 52,0 M-20,-154 q20,-16 40,0" stroke="${GR}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.85"/>
    <ellipse cx="0" cy="0" rx="86" ry="108" fill="${SK}" ${O}/><ellipse cx="-90" cy="12" rx="11" ry="20" fill="${SK}" ${O}/><ellipse cx="90" cy="12" rx="11" ry="20" fill="${SK}" ${O}/>
    <circle cx="-98" cy="38" r="12" fill="none" stroke="#e8c060" stroke-width="5"/><circle cx="98" cy="38" r="12" fill="none" stroke="#e8c060" stroke-width="5"/>
    <path d="M-90,-26 Q-98,-118 0,-128 Q98,-118 90,-26 Q64,-84 0,-90 Q-64,-84 -90,-26Z" fill="${HR}" ${O}/><path d="M-70,-70 Q-30,-104 20,-100" stroke="${GR}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M-82,-40 Q-60,-90 -30,-92" stroke="${GR}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/>
    ${eyes(36, -4, blink, p.look || 0, m.big * 0.85, m.b)}<path d="M-72,-26 q18,-12 40,-4 M72,-26 q-18,-12 -40,-4" stroke="${HR}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M-58,10 q-8,6 -4,14 M58,10 q8,6 4,14" stroke="${SKD}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M0,16 q-8,16 0,22 q8,-2 8,-6" stroke="#7a4426" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-54" cy="34" rx="19" ry="10" fill="#e8808a" opacity="0.4"/><ellipse cx="54" cy="34" rx="19" ry="10" fill="#e8808a" opacity="0.4"/>${mouthT(p.mood || 'calm', 56, p.mouthOpen || 0, '#a8283a', 0.8)}
    ${armsC(p, spec, 'body')}
  </g>`; }
