import { Resvg } from '@resvg/resvg-js'; import { writeFileSync } from 'node:fs';
const W = 1080, H = 1920, OUT = '#06030a';
const smoke = Array.from({ length: 14 }, (_, i) => `<ellipse cx="${(i * 233) % W}" cy="${1200 + (i * 97) % 700}" rx="${220 + (i % 4) * 60}" ry="${70 + (i % 3) * 30}" fill="#ff3b4f" opacity="${0.05 + (i % 3) * 0.02}" filter="url(#b)"/>`).join('');
const rays = Array.from({ length: 22 }, (_, i) => { const a = i / 22 * 6.283 + 0.1; return `<path d="M540,800 L${540 + Math.cos(a) * 1500},${800 + Math.sin(a) * 1500} L${540 + Math.cos(a + 0.09) * 1500},${800 + Math.sin(a + 0.09) * 1500}Z" fill="#ff2a4a" opacity="${i % 2 ? 0.05 : 0.1}"/>`; }).join('');
const dust = Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 311) % H}" r="${1.4 + (i % 3)}" fill="#ff8a98" opacity="${0.2 + (i % 4) * 0.12}"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter><filter id="b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
<radialGradient id="bg" cx="0.5" cy="0.42" r="0.8"><stop offset="0" stop-color="#8a0f26"/><stop offset="0.45" stop-color="#3a0714"/><stop offset="1" stop-color="#050208"/></radialGradient>
<radialGradient id="face" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#241824"/><stop offset="1" stop-color="#07040a"/></radialGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff2a4a" stop-opacity="0.9"/><stop offset="0.3" stop-color="#ff2a4a" stop-opacity="0"/><stop offset="0.7" stop-color="#ff2a4a" stop-opacity="0"/><stop offset="1" stop-color="#ff2a4a" stop-opacity="0.9"/></linearGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5f1c"/><stop offset="0.5" stop-color="#f5d37a"/><stop offset="1" stop-color="#8a5f1c"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>${rays}${smoke}
<ellipse cx="540" cy="1000" rx="520" ry="620" fill="#ff1f45" opacity="0.18" filter="url(#b)"/>
<path d="M120,1920 Q130,1480 330,1400 L750,1400 Q950,1480 960,1920Z" fill="#0a050c" stroke="#ff2a4a" stroke-width="3" stroke-opacity="0.5"/><path d="M470,1400 L540,1560 L610,1400Z" fill="#7f1d1d"/>
<path d="M300,1020 Q300,1420 540,1450 Q780,1420 780,1020 Q780,640 540,620 Q300,640 300,1020Z" fill="url(#face)"/>
<path d="M300,1020 Q300,1420 540,1450 Q780,1420 780,1020 Q780,640 540,620 Q300,640 300,1020Z" fill="url(#rim)" opacity="0.5"/>
<ellipse cx="540" cy="620" rx="440" ry="66" fill="#0a060d" stroke="#2a1018" stroke-width="6"/><path d="M290,610 Q300,280 540,230 Q780,280 790,610Q540,540 290,610Z" fill="#0a060d" stroke="#2a1018" stroke-width="6"/><path d="M296,586 Q540,520 784,586 L786,622 Q540,566 294,622Z" fill="url(#gold)"/>
<path d="M360,260 Q420,200 480,230" stroke="#ff2a4a" stroke-width="5" fill="none" opacity="0.35"/>
<path d="M360,860 L500,900 M720,860 L580,900" stroke="#ff2a4a" stroke-width="22" stroke-linecap="round" opacity="0.9"/><path d="M360,860 L500,900 M720,860 L580,900" stroke="#05020a" stroke-width="12" stroke-linecap="round"/>
<g filter="url(#b2)"><ellipse cx="410" cy="960" rx="80" ry="40" fill="#ff1f45" opacity="0.9"/><ellipse cx="670" cy="960" rx="80" ry="40" fill="#ff1f45" opacity="0.9"/></g>
<path d="M330,960 Q410,900 490,960 Q410,1004 330,960Z" fill="#ff2a4a"/><path d="M590,960 Q670,900 750,960 Q670,1004 590,960Z" fill="#ff2a4a"/><ellipse cx="410" cy="958" rx="30" ry="22" fill="#ffd0d6"/><ellipse cx="670" cy="958" rx="30" ry="22" fill="#ffd0d6"/><ellipse cx="410" cy="958" rx="8" ry="20" fill="#2a000a"/><ellipse cx="670" cy="958" rx="8" ry="20" fill="#2a000a"/>
<path d="M320,1180 Q540,1380 760,1180 Q650,1230 540,1236 Q430,1230 320,1180Z" fill="#f8fafc" stroke="#0a0508" stroke-width="8" stroke-linejoin="round"/>
<path d="M320,1180 Q540,1130 760,1180 Q650,1230 540,1236 Q430,1230 320,1180Z" fill="#11060a"/>
${[...Array(14)].map((_, i) => { const x = 360 + i * 30, top = 1170 + Math.abs(i - 6.5) * 3.6 + 4, tip = top + 40 + (i % 2) * 8 + (i === 2 || i === 11 ? 20 : 0); return `<path d="M${x - 10},${top} L${x + 10},${top} L${x},${tip}Z" fill="#fff" stroke="#0a0508" stroke-width="2.4" stroke-linejoin="round"/>`; }).join('')}
<path d="M326,1176 Q300,1140 280,1100 M754,1176 Q780,1140 800,1100" stroke="#0a0508" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M360,1085 Q540,1170 720,1085" stroke="#ff2a4a" stroke-width="4" fill="none" opacity="0.25"/>
<ellipse cx="410" cy="1010" rx="38" ry="9" fill="#ff2a4a" opacity="0.15"/><ellipse cx="670" cy="1010" rx="38" ry="9" fill="#ff2a4a" opacity="0.15"/>
${dust}<rect width="${W}" height="${H}" fill="#000" opacity="0"/>
<radialGradient id="vg" cx="0.5" cy="0.45" r="0.75"><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.85"/></radialGradient><rect width="${W}" height="${H}" fill="url(#vg)"/></svg>`;
writeFileSync('portadas/M_villano.png', new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng()); console.log('ok');
