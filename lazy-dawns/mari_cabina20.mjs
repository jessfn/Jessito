// Mari atada en una silla, con una bolsa en la cabeza, en un sotano oscuro (intro del Dia 19). 2D con texturas, sombras y degradados.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
const OUT = '#0c0709', O = `stroke="${OUT}" stroke-width="7" stroke-linejoin="round"`;
export function mariCabina(t = 0, o = {}) {
  const st = o.struggle ?? 0, tk = o.talk ?? 0, br = Math.sin(t * (2.6 + 3 * st)) * 0.5 + 0.5, sw = Math.sin(t * 1.3) * 3 + st * Math.sin(t * 13) * 5, tilt = (o.tilt ?? -5) + st * Math.sin(t * 8.5) * 4 + tk * Math.sin(t * 17) * 2;
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
${[...Array(14)].map((_, i) => `<rect x="${i * 80 - 10}" y="0" width="76" height="1250" fill="${i % 2 ? '#241812' : '#2c1d15'}"/><path d="M${i * 80 + 30},0 V1250" stroke="#000" stroke-width="3" opacity="0.45"/><path d="M${i * 80 + 12},${120 + (i * 97) % 400} q14,40 0,90 M${i * 80 + 50},${600 + (i * 53) % 300} q-10,30 4,70" stroke="#0e0905" stroke-width="3" fill="none" opacity="0.6"/>`).join('')}
<rect width="1080" height="1250" filter="url(#tex)" opacity="0.35"/>
<g transform="translate(820,430)"><rect x="-130" y="-170" width="260" height="340" fill="#0a1224" stroke="#0e0905" stroke-width="14"/><rect x="-118" y="-158" width="236" height="316" fill="#1a2c52"/><circle cx="46" cy="-70" r="42" fill="#e9f0ff" opacity="0.95"/><circle cx="46" cy="-70" r="110" fill="#bcd0ff" opacity="0.18" filter="url(#b20)"/><path d="M-118,0 H118 M0,-158 V158" stroke="#0e0905" stroke-width="10"/><path d="M-118,-158 L-60,-20 M118,158 L60,40" stroke="#0e0905" stroke-width="3" opacity="0.5"/></g>
<path d="M820,600 L520,1250 L1000,1250Z" fill="#bcd0ff" opacity="0.07" filter="url(#b20)"/>
<g transform="translate(150,640) rotate(-6)"><rect x="-42" y="-120" width="84" height="150" fill="#2a1b10" stroke="#0e0905" stroke-width="5"/><path d="M-30,-100 h60 M-30,-70 h60 M-30,-40 h60" stroke="#0e0905" stroke-width="3" opacity="0.6"/></g>
<rect y="1250" width="1080" height="670" fill="url(#floor)"/>${[...Array(9)].map((_, i) => `<path d="M0,${1250 + i * 80 + i * i * 2} H1080" stroke="#000" stroke-width="${4 + i * 0.6}" opacity="0.55"/>`).join('')}<path d="M0,1250 H1080" stroke="#000" stroke-width="8" opacity="0.6"/>
<ellipse cx="540" cy="1590" rx="520" ry="150" fill="url(#pool)"/>
<g transform="translate(${540 + cord * 0.4},0)"><path d="M0,0 V170" stroke="#000" stroke-width="5"/><rect x="-26" y="170" width="52" height="64" rx="8" fill="#3a2a1a" stroke="#0e0905" stroke-width="6"/><rect x="-18" y="182" width="36" height="42" rx="6" fill="#ffd27a" opacity="${(0.8 + 0.2 * Math.sin(t * 9)).toFixed(2)}"/><circle cx="0" cy="203" r="70" fill="#ffcf7a" opacity="${(0.28 + 0.06 * Math.sin(t * 7)).toFixed(2)}" filter="url(#b20)"/></g>
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
<g transform="translate(540,${590 + br * 2}) rotate(${tilt})">
  <ellipse cx="0" cy="0" rx="104" ry="118" fill="#f2c4a2" ${O}/>
  <path d="M-108,-6 Q-112,-124 0,-128 Q112,-124 108,-6 Q82,-82 0,-84 Q-82,-82 -108,-6Z" fill="url(#hairp)" ${O}/><path d="M-96,-60 Q-40,-110 30,-104" stroke="#c18bff" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round"/>
  <ellipse cx="-62" cy="40" rx="24" ry="12" fill="#ff8fa3" opacity="0.5"/><ellipse cx="62" cy="40" rx="24" ry="12" fill="#ff8fa3" opacity="0.5"/>
  ${[-1, 1].map((s) => `<ellipse cx="${s * 42}" cy="-6" rx="24" ry="${26 + st * 4}" fill="#fff" ${O.replace('7', '5')}/><circle cx="${s * 42 + 6}" cy="${-2 + 3 * Math.sin(t * 1.3)}" r="11" fill="#2a1a10"/><circle cx="${s * 42 + 10}" cy="-8" r="4" fill="#fff"/><path d="M${s * 42 - 30},${-42 - st * 6} Q${s * 42},${-58 - st * 4} ${s * 42 + 30 * s * -0.2},${-40}" stroke="#4a2c16" stroke-width="8" fill="none" stroke-linecap="round" transform="rotate(${s * -10} ${s * 42} -42)"/>`).join('')}
  <path d="M0,10 q-8,16 0,22 q8,-2 8,-6" stroke="#d29a76" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="0" cy="${70 + tk * 4}" rx="${22 + tk * 8}" ry="${5 + tk * 22}" fill="#7a1020" ${O.replace('7', '5')}/>${tk > 0.3 ? '<rect x="-14" y="58" width="28" height="8" rx="3" fill="#fff"/>' : ''}
  <path d="M-66,118 q6,16 0,30 M70,114 q-8,18 0,32" stroke="#7ad0ff" stroke-width="5" fill="none" opacity="${(0.3 + st * 0.5).toFixed(2)}" stroke-linecap="round"/>
 </g>
<g transform="translate(390,1010)"><path d="M0,0 l-8,-10" stroke="#9aa0aa" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="0" r="6" fill="#c9ccd6" stroke="#0e0905" stroke-width="2"/></g>
</g>
${(o.dust ?? true) ? [...Array(26)].map((_, i) => { const x = (i * 211) % 1000 + 40, y = 260 + ((i * 331 + t * (14 + i % 6) * 6) % 1200), r = 1.4 + (i % 3); return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe8b8" opacity="${0.12 + (i % 4) * 0.06}"/>`; }).join('') : ''}
<rect width="1080" height="1920" fill="url(#vig)"/>
</svg>`; }
