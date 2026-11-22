// Dia 15: Mari (nuevo rig con boca hablante, mismo diseno: cabello morado, top cian) y Bruna (artista de pestanas, Lash Lab).
import { eyes, MOODS } from './chars.mjs';
import { armsC, TOOLS, mouthT } from './chars12.mjs';
import './chars14.mjs';
const OUT = '#12090a'; const O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
TOOLS.ltweez = (k) => `<g><path d="M-8,0 L-4,170 M8,0 L4,170" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/><path d="M-8,0 L-4,170 M8,0 L4,170" stroke="#dfe3ea" stroke-width="6" stroke-linecap="round"/><rect x="-14" y="-6" width="28" height="22" rx="6" fill="#b36bff" stroke="${OUT}" stroke-width="4"/></g>`;
TOOLS.marker = () => `<g><rect x="-12" y="0" width="24" height="120" rx="10" fill="#e9d6ff" stroke="${OUT}" stroke-width="6"/><rect x="-12" y="90" width="24" height="30" rx="8" fill="#b36bff"/><path d="M-5,120 L0,150 L5,120Z" fill="#111" stroke="${OUT}" stroke-width="3"/></g>`;
TOOLS.minifan = (k) => `<g><rect x="-10" y="0" width="20" height="100" rx="9" fill="#f9a8d4" stroke="${OUT}" stroke-width="6"/><circle cx="0" cy="-26" r="40" fill="#fff" fill-opacity="0.5" stroke="${OUT}" stroke-width="5"/>${[0, 1, 2].map((i) => `<path d="M0,-26 L${(Math.cos(k * 30 + i * 2.1) * 34).toFixed(0)},${(-26 + Math.sin(k * 30 + i * 2.1) * 34).toFixed(0)}" stroke="#b36bff" stroke-width="8" stroke-linecap="round"/>`).join('')}</g>`;
export function drawMari2(p) {
  const m = MOODS[p.mood || 'happy'], t = p.t || 0, bob = Math.sin(t * 2.2) * 2.8, blink = p.blink || 0, SK = '#f2c4a2', SKD = '#e0a584';
  const spec = { sleeve: '#22d3ee', skin: SK, frac: 0.35, cuff: null, sh: 118, shy: 205, wU: 48, wF: 38 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <path d="M-120,-20 Q-150,120 -130,250 L130,250 Q150,120 120,-20Z" fill="#5a2d82" ${O}/>
    <rect x="-96" y="420" width="82" height="250" rx="30" fill="#3b4cca" ${O}/><rect x="14" y="420" width="82" height="250" rx="30" fill="#3b4cca" ${O}/>
    <ellipse cx="-62" cy="684" rx="64" ry="26" fill="#ff4d8d" ${O}/><ellipse cx="62" cy="684" rx="64" ry="26" fill="#ff4d8d" ${O}/>
    <path d="M-160,452 Q-150,170 -80,150 L80,150 Q150,170 160,452Z" fill="#22d3ee" ${O}/><path d="M-60,150 Q0,200 60,150" fill="${SK}" ${O}/>
    <rect x="-24" y="96" width="48" height="60" fill="${SKD}" ${O}/>
    <ellipse cx="0" cy="0" rx="106" ry="118" fill="${SK}" ${O}/><ellipse cx="-110" cy="10" rx="14" ry="24" fill="${SK}" ${O}/><ellipse cx="110" cy="10" rx="14" ry="24" fill="${SK}" ${O}/>
    <circle cx="-112" cy="40" r="9" fill="#ffe14d" ${O}/><circle cx="112" cy="40" r="9" fill="#ffe14d" ${O}/>
    <path d="M-108,-10 Q-110,-120 0,-124 Q110,-120 108,-10 Q80,-78 0,-80 Q-80,-78 -108,-10Z" fill="#5a2d82" ${O}/>
    <ellipse cx="-62" cy="34" rx="22" ry="12" fill="#ff8fa3" opacity="0.55"/><ellipse cx="62" cy="34" rx="22" ry="12" fill="#ff8fa3" opacity="0.55"/>
    ${eyes(42, -6, blink, p.look || 0, m.big, m.b)}${mouthT(p.mood || 'happy', 56, p.mouthOpen || 0, '#d6336c', 0.9)}
    ${armsC(p, spec, 'body')}
  </g>`; }
export function drawBruna(p) {
  const m = MOODS[p.mood || 'calm'], t = p.t || 0, bob = Math.sin(t * 2.0 + 0.7) * 2.6, blink = p.blink || 0, SK = '#c98a62', SKD = '#a86d48', HR = '#1a1020';
  const spec = { sleeve: '#c4b5fd', skin: SK, frac: 0.3, cuff: null, sh: 108, shy: 200, wU: 44, wF: 34 };
  if (p.part === 'tool') return `<g transform="translate(0,${bob})">${armsC(p, spec, 'tool')}</g>`;
  return `<g transform="translate(0,${bob})">
    <rect x="-62" y="470" width="50" height="210" rx="22" fill="#4c1d95" ${O}/><rect x="12" y="470" width="50" height="210" rx="22" fill="#4c1d95" ${O}/>
    <ellipse cx="-38" cy="690" rx="48" ry="20" fill="#fff" ${O}/><ellipse cx="38" cy="690" rx="48" ry="20" fill="#fff" ${O}/>
    <path d="M-116,590 Q-122,170 -68,150 L68,150 Q122,170 116,590Z" fill="#c4b5fd" ${O}/><path d="M-58,150 L0,240 L58,150" fill="${SKD}" ${O}/><path d="M-58,150 L0,240 L58,150" stroke="#7c3aed" stroke-width="8" fill="none"/><rect x="28" y="330" width="70" height="80" rx="10" fill="#fff" ${O}/><circle cx="52" cy="352" r="9" fill="#b36bff" ${O}/><path d="M42,382 h44" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>
    <rect x="-18" y="96" width="36" height="60" fill="${SKD}" ${O}/>
    <path d="M60,-120 C140,-150 190,-80 170,10 C160,80 140,150 150,230" stroke="${OUT}" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M60,-120 C140,-150 190,-80 170,10 C160,80 140,150 150,230" stroke="#e879f9" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M80,-110 C150,-130 176,-70 160,0" stroke="#f5d0fe" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8"/>
    <ellipse cx="0" cy="0" rx="88" ry="108" fill="${SK}" ${O}/><ellipse cx="-92" cy="12" rx="12" ry="21" fill="${SK}" ${O}/><ellipse cx="92" cy="12" rx="12" ry="21" fill="${SK}" ${O}/><circle cx="-96" cy="40" r="14" fill="#b36bff" ${O}/><circle cx="96" cy="40" r="14" fill="#b36bff" ${O}/>
    <path d="M-96,-24 Q-100,-124 0,-132 Q100,-124 96,-24 Q60,-82 0,-84 Q-60,-82 -96,-24Z" fill="#e879f9" ${O}/><path d="M-70,-84 Q0,-118 70,-84" stroke="#f5d0fe" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/>
    ${eyes(38, -4, blink, p.look || 0, m.big + 0.1, m.b)}<path d="M-74,-26 q18,-12 40,-4 M74,-26 q-18,-12 -40,-4" stroke="${HR}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M-60,-6 q4,-26 32,-18 M60,-6 q-4,-26 -32,-18" stroke="#12090a" stroke-width="3" fill="none" opacity="0.0"/>
    <path d="M0,16 q-8,16 0,22 q8,-2 8,-6" stroke="#7a4326" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="-56" cy="34" rx="20" ry="10" fill="#f472b6" opacity="0.35"/><ellipse cx="56" cy="34" rx="20" ry="10" fill="#f472b6" opacity="0.35"/>${mouthT(p.mood || 'calm', 56, p.mouthOpen || 0, '#9d174d', 0.8)}
    <circle cx="-38" cy="-4" r="40" fill="none" stroke="#c4b5fd" stroke-width="4" opacity="0.0"/>
    ${armsC(p, spec, 'body')}
  </g>`; }
