// Mari atada en una silla, con una bolsa en la cabeza, en un sotano oscuro (intro del Dia 19). 2D con texturas, sombras y degradados.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
const OUT = '#0c0709', O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
export function mariSilla(t = 0, o = {}) {
  const br = Math.sin(t * 2.6) * 0.5 + 0.5, sw = Math.sin(t * 1.3) * 3, tilt = o.tilt ?? -5;
  const cord = Math.sin(t * 1.1) * 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
<defs>
 <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060a"/><stop offset="0.55" stop-color="#0d1118"/><stop offset="1" stop-color="#141a22"/></linearGradient>
 <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171b22"/><stop offset="1" stop-color="#07090d"/></linearGradient>
 <radialGradient id="cone" cx="0.5" cy="0.12" r="0.75"><stop offset="0" stop-color="#ffe2a0" stop-opacity="0.8"/><stop offset="0.35" stop-color="#ffcf7a" stop-opacity="0.4"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
 <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.85"/></radialGradient>
 <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe2a0" stop-opacity="0.35"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
 <linearGradient id="pipe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4452"/><stop offset="0.35" stop-color="#6b7889"/><stop offset="1" stop-color="#1b212a"/></linearGradient>
 <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2c16"/><stop offset="0.5" stop-color="#7a4a26"/><stop offset="1" stop-color="#3a2210"/></linearGradient>
 <linearGradient id="sack" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#c9a974"/><stop offset="0.55" stop-color="#a98655"/><stop offset="1" stop-color="#6e5232"/></linearGradient>
 <linearGradient id="top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2fe0f5"/><stop offset="1" stop-color="#1696ab"/></linearGradient>
 <linearGradient id="hairp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a3aa8"/><stop offset="1" stop-color="#3f1b63"/></linearGradient>
 <filter id="tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="4" seed="4"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0 0.6  0 0 0 0.55 -0.15"/></filter>
 <filter id="weave" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.5" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0.9 -0.3"/></filter>
 <filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b20"><feGaussianBlur stdDeviation="20"/></filter>
 <clipPath id="sackc"><path d="M-104,-16 C-112,-118 -56,-170 0,-170 C56,-170 112,-118 104,-16 C100,50 84,92 60,118 L-60,118 C-84,92 -100,50 -104,-16Z"/></clipPath>
</defs>
<rect width="1080" height="1920" fill="url(#wall)"/>
<rect width="1080" height="1250" filter="url(#tex)" opacity="0.5"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * 220 - 20}" y="0" width="14" height="1250" fill="#000" opacity="0.28"/>`).join('')}
<g><rect x="-20" y="250" width="1120" height="64" fill="url(#pipe)" ${O}/><rect x="-20" y="262" width="1120" height="10" fill="#fff" opacity="0.18"/>${[160, 520, 880].map((x) => `<rect x="${x}" y="240" width="26" height="84" fill="#2a313c" ${O}/>`).join('')}
 <rect x="-20" y="380" width="1120" height="40" fill="url(#pipe)" ${O}/><circle cx="820" cy="316" r="5" fill="#9fd6ff" opacity="0.9"/><ellipse cx="820" cy="${316 + ((t * 0.9) % 1) * 240}" rx="5" ry="9" fill="#9fd6ff" opacity="0.8"/></g>
<rect y="1250" width="1080" height="670" fill="url(#floor)"/><path d="M0,1250 H1080" stroke="#000" stroke-width="8" opacity="0.6"/>
<ellipse cx="540" cy="1590" rx="520" ry="150" fill="url(#pool)"/>
<ellipse cx="250" cy="1750" rx="190" ry="40" fill="#1d3550" opacity="0.5"/><ellipse cx="236" cy="1744" rx="120" ry="18" fill="#6aa6d8" opacity="0.18"/>
<g transform="translate(${540 + cord},0)"><path d="M0,0 V190" stroke="#000" stroke-width="5"/><path d="M-26,210 Q0,168 26,210Z" fill="#2a2a2e" ${O}/><circle cx="0" cy="222" r="22" fill="#ffe8b0" ${O}/><circle cx="0" cy="222" r="46" fill="#ffe2a0" opacity="0.35" filter="url(#b6)"/></g>
<path d="M540,224 L120,1620 L960,1620Z" fill="url(#cone)" opacity="0.9" filter="url(#b20)"/>
<g transform="translate(${sw},0)">
 <!-- patas de la silla y atras -->
 <rect x="372" y="1180" width="38" height="430" rx="10" fill="url(#wood)" ${O}/><rect x="670" y="1180" width="38" height="430" rx="10" fill="url(#wood)" ${O}/>
 <rect x="398" y="720" width="284" height="470" rx="14" fill="url(#wood)" ${O}/>${[0, 1, 2, 3].map((i) => `<rect x="${420 + i * 66}" y="748" width="48" height="400" rx="8" fill="#000" opacity="0.18"/>`).join('')}
 <rect x="392" y="700" width="296" height="40" rx="14" fill="url(#wood)" ${O}/>
 <rect x="360" y="1160" width="360" height="50" rx="12" fill="url(#wood)" ${O}/>
 <!-- piernas: muslos hacia el frente, espinillas, zapatos y cuerdas en tobillos -->
 <path d="M436,1120 Q430,1300 452,1340 L526,1340 Q540,1240 536,1120Z" fill="#3b4cca" ${O}/><path d="M544,1120 Q540,1240 554,1340 L628,1340 Q650,1300 644,1120Z" fill="#3b4cca" ${O}/>
 <rect x="440" y="1330" width="84" height="230" rx="30" fill="#3b4cca" ${O}/><rect x="556" y="1330" width="84" height="230" rx="30" fill="#3b4cca" ${O}/>
 <ellipse cx="480" cy="1585" rx="64" ry="26" fill="#ff4d8d" ${O}/><ellipse cx="598" cy="1585" rx="64" ry="26" fill="#ff4d8d" ${O}/>
 ${[[482, 1524], [598, 1524]].map(([x, y]) => `<path d="M${x - 46},${y} q46,16 92,0 v18 q-46,16 -92,0Z" fill="#a98655" ${O}/><path d="M${x - 40},${y + 6} l80,12 M${x - 40},${y + 14} l80,12" stroke="#5a4020" stroke-width="3"/>`).join('')}
 <!-- tronco caido hacia delante -->
 <path d="M404,806 Q400,760 450,740 L630,740 Q684,760 680,806 Q700,980 660,1160 L420,1160 Q380,980 404,806Z" fill="url(#top)" ${O}/>
 <path d="M440,800 Q540,846 640,800" stroke="#0c6b7d" stroke-width="6" fill="none" opacity="0.7"/>
 <!-- brazos hacia atras: se ven los hombros y codos jalados, cuerda en el pecho y brazos -->
 <path d="M404,806 Q356,860 372,990 Q384,1040 410,1040 L440,1010 Q420,900 440,800Z" fill="url(#top)" ${O}/><path d="M680,806 Q724,860 708,990 Q696,1040 670,1040 L640,1010 Q660,900 640,800Z" fill="url(#top)" ${O}/>
 ${[880, 930, 980].map((y, i) => `<path d="M${392 + i * 2},${y} Q540,${y + 36} ${688 - i * 2},${y}" stroke="#6e5232" stroke-width="16" fill="none" stroke-linecap="round" ${i ? '' : ''}/><path d="M${392 + i * 2},${y} Q540,${y + 36} ${688 - i * 2},${y}" stroke="#c9a974" stroke-width="6" fill="none" stroke-dasharray="10 8" stroke-linecap="round"/>`).join('')}
 <path d="M490,900 q-16,40 6,70 M590,900 q16,40 -6,70" stroke="#0c0709" stroke-width="4" fill="none" opacity="0.5"/>
 <ellipse cx="381" cy="1052" rx="26" ry="20" fill="#f2c4a2" ${O}/><ellipse cx="699" cy="1052" rx="26" ry="20" fill="#f2c4a2" ${O}/>
 <path d="M355,1050 q26,18 52,0 M673,1050 q26,18 52,0" stroke="#a98655" stroke-width="9" fill="none"/>
 <!-- cuello, pelo morado bajo la bolsa y bolsa -->
 <rect x="498" y="690" width="84" height="72" fill="#e0a584" ${O}/>
 <path d="M440,700 Q410,800 428,900 L470,880 Q462,790 480,720Z" fill="url(#hairp)" ${O}/><path d="M640,700 Q670,800 652,900 L610,880 Q618,790 600,720Z" fill="url(#hairp)" ${O}/>
 <g transform="translate(540,${580 + br * 3}) rotate(${tilt})">
  <path d="M-104,-16 C-112,-118 -56,-170 0,-170 C56,-170 112,-118 104,-16 C100,50 84,92 60,118 L-60,118 C-84,92 -100,50 -104,-16Z" fill="url(#sack)" ${O}/>
  <g clip-path="url(#sackc)"><rect x="-120" y="-180" width="240" height="310" filter="url(#weave)" opacity="0.55"/>
   ${[-70, -34, 4, 40, 72].map((x, i) => `<path d="M${x},-160 Q${x + (i % 2 ? 10 : -10)},-20 ${x + (i % 2 ? -6 : 8)},118" stroke="#5a4020" stroke-width="3" fill="none" opacity="0.5"/>`).join('')}
   <path d="M-100,-40 Q0,-70 100,-40" stroke="#5a4020" stroke-width="4" fill="none" opacity="0.5"/>
   <ellipse cx="${-8 + br * 2}" cy="${14}" rx="${26 + br * 4}" ry="${14 + br * 5}" fill="#3a2810" opacity="0.28" filter="url(#b6)"/>
   <path d="M-94,-92 Q-30,-150 40,-150" stroke="#fff" stroke-width="12" fill="none" opacity="0.18" stroke-linecap="round" filter="url(#b6)"/>
   <path d="M64,-110 Q100,-60 98,10" stroke="#000" stroke-width="16" fill="none" opacity="0.2" filter="url(#b6)"/>
  </g>
  <path d="M-64,96 Q0,134 64,96 L56,126 Q0,150 -56,126Z" fill="#6e5232" ${O}/><path d="M-60,104 Q0,140 60,104" stroke="#c9a974" stroke-width="5" fill="none" stroke-dasharray="9 7"/>
  <path d="M0,124 q-26,30 -10,62 M0,124 q26,26 14,56" stroke="#6e5232" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="0" cy="122" r="12" fill="#8a6a3e" ${O}/>
 </g>
</g>
${(o.dust ?? true) ? [...Array(26)].map((_, i) => { const x = (i * 211) % 1000 + 40, y = 260 + ((i * 331 + t * (14 + i % 6) * 6) % 1200), r = 1.4 + (i % 3); return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe8b8" opacity="${0.12 + (i % 4) * 0.06}"/>`; }).join('') : ''}
<rect width="1080" height="1920" fill="url(#vig)"/>
</svg>`; }
const svg = mariSilla(0.6);
writeFileSync('Mari_silla_bolsa.png', new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
