// Genera opciones de diseño de lazyp3 (antes) en SVG -> PNG 1080x1920
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const font = path.join(here, '../../assets/fonts/Anton-Regular.ttf');

function defs(mode) {
  const g = (id, a, b, c) => `<radialGradient id="${id}" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  return `<defs>
  ${g('skin', '#c98a5a', '#9a5a32', '#5e2f15')}
  ${g('skinB', '#b87648', '#8a4e2b', '#4f2711')}
  <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffa63d"/><stop offset="0.6" stop-color="#e8741a"/><stop offset="1" stop-color="#b24f0c"/></linearGradient>
  <linearGradient id="pants" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8e4fc0"/><stop offset="1" stop-color="#43206a"/></linearGradient>
  <radialGradient id="hair" cx="0.4" cy="0.25" r="0.9"><stop offset="0" stop-color="#3a2f2c"/><stop offset="0.5" stop-color="#17110f"/><stop offset="1" stop-color="#050303"/></radialGradient>
  <radialGradient id="eye" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#8a5a2e"/><stop offset="0.6" stop-color="#3b2312"/><stop offset="1" stop-color="#150b05"/></radialGradient>
  <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#1b0a3d"/><stop offset="0.55" stop-color="#5b1a7a"/><stop offset="1" stop-color="#d1307f"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff7ad9" stop-opacity="0.55"/><stop offset="1" stop-color="#ff7ad9" stop-opacity="0"/></radialGradient>
  <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
  <clipPath id="torso"><path d="M-330,90 C-390,330 -300,570 0,580 C300,570 390,330 330,90 C300,-90 -300,-90 -330,90Z"/></clipPath>
  <clipPath id="headclip"><ellipse cx="0" cy="0" rx="205" ry="205"/></clipPath>
  </defs>`;
}

function lazy(mode) {
  const O = mode === 'comic' ? 'stroke="#12090a" stroke-width="9" stroke-linejoin="round"' : '';
  const skin = mode === 'comic' ? '#9a5a32' : 'url(#skin)';
  const skinB = mode === 'comic' ? '#8a4e2b' : 'url(#skinB)';
  const shirt = mode === 'comic' ? '#f08a24' : 'url(#shirt)';
  const pants = mode === 'comic' ? '#6b3a98' : 'url(#pants)';
  const hair = mode === 'comic' ? '#14100e' : 'url(#hair)';
  const soft = mode !== 'comic';
  const pimple = ([x, y, r]) => `<g transform="translate(${x},${y})"><circle r="${r + 4}" fill="#8f1d14" opacity="0.35"/><circle r="${r}" fill="#d6453a" ${O && 'stroke="#12090a" stroke-width="3"'}/>${soft ? `<circle r="${r * 0.55}" cx="${-r * 0.25}" cy="${-r * 0.25}" fill="#ffb3a6" opacity="0.8"/>` : ''}<circle r="${r * 0.25}" cx="${-r * 0.3}" cy="${-r * 0.35}" fill="#fff"/></g>`;
  const pims = [[-75,-20,15],[62,-42,13],[108,26,16],[-118,38,12],[24,56,14],[-34,-78,12],[88,-96,13],[-98,-92,11],[2,-4,10],[54,100,12],[-60,92,10],[130,-20,9]].map(pimple).join('');
  const teeth = [[-56,0,-10,24],[-30,3,-3,22],[-6,5,5,30],[20,3,-6,20],[42,0,12,26]].map(([x, y, r, h], i) => `<rect x="${x}" y="${y}" width="22" height="${h}" rx="6" fill="${['#e3cf6a','#d4be52','#e8d77a','#c6b04a','#dcc860'][i]}" ${O && 'stroke="#12090a" stroke-width="3"'} transform="rotate(${r} ${x + 11} ${y})"/>`).join('');
  // pelo rizado: nube de circulos
  const curls = [];
  for (let i = 0; i < 26; i++) { const a = Math.PI * (1.05 + (i / 25) * 0.9); const r = 200 + (i % 3) * 18; curls.push(`<circle cx="${Math.cos(a) * r * 1.02}" cy="${Math.sin(a) * r * 0.95 - 8}" r="${46 + (i % 4) * 7}" fill="${hair}" ${O}/>`); }
  const hairHi = soft ? `<g opacity="0.35">${[...Array(8)].map((_, i) => `<path d="M${-150 + i * 40},${-215 - (i % 3) * 14} q25,-20 44,2" stroke="#9a8782" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</g>` : '';
  const stripes = [0,1,2,3,4,5,6].map(i => `<rect x="${-340 + i * 105}" y="-100" width="52" height="720" fill="#2ecc71" opacity="0.92"/>`).join('');
  const dots = [[-210,70],[-70,170],[110,80],[230,230],[-170,280],[40,300],[-40,420],[170,380],[-250,400]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="#ffd23f" ${O && 'stroke="#12090a" stroke-width="3"'}/>`).join('');
  const folds = soft ? `<g fill="none" stroke="#000" stroke-opacity="0.2" stroke-width="7" stroke-linecap="round">
      <path d="M-250,300 Q-100,380 40,330"/><path d="M-120,420 Q60,490 240,400"/><path d="M-230,160 Q-150,200 -90,150"/><path d="M130,170 Q220,210 280,150"/></g>
    <ellipse cx="-120" cy="140" rx="160" ry="110" fill="#fff" opacity="0.12" filter="url(#blur20)"/>` : '';
  const eye = (x, flip) => `<g transform="translate(${x},-6)">
      <ellipse rx="36" ry="40" fill="#fff" ${O && 'stroke="#12090a" stroke-width="7"'}/>
      <ellipse rx="36" ry="40" fill="#000" opacity="0.07" cy="14" clip-path="none"/>
      <circle cx="${flip * 6}" cy="6" r="22" fill="${mode === 'comic' ? '#4a2c14' : 'url(#eye)'}"/><circle cx="${flip * 6}" cy="6" r="11" fill="#0a0503"/>
      <circle cx="${flip * 6 + 8}" cy="-4" r="7" fill="#fff"/><circle cx="${flip * 6 - 6}" cy="14" r="3.5" fill="#fff" opacity="0.8"/>
      <path d="M-40,-18 Q0,-52 40,-18" stroke="#12090a" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${[-30,-12,8,26].map((lx) => `<path d="M${lx},-34 l${flip * -4},-14" stroke="#12090a" stroke-width="5" stroke-linecap="round"/>`).join('')}
      <ellipse cy="46" rx="34" ry="12" fill="#3d1f0e" opacity="0.5"/>
    </g>`;
  return `
  <!-- sombra de suelo -->
  <ellipse cx="0" cy="690" rx="420" ry="46" fill="#000" opacity="0.4" filter="url(#blur20)"/>
  <!-- piernas y zapatos -->
  <rect x="-175" y="380" width="140" height="240" rx="55" fill="${pants}" ${O}/><rect x="35" y="380" width="140" height="240" rx="55" fill="${pants}" ${O}/>
  <ellipse cx="-115" cy="650" rx="105" ry="46" fill="#e0482f" ${O}/><ellipse cx="115" cy="650" rx="105" ry="46" fill="#14b8a6" ${O}/>
  ${soft ? `<ellipse cx="-140" cy="636" rx="48" ry="12" fill="#fff" opacity="0.35"/><ellipse cx="90" cy="636" rx="48" ry="12" fill="#fff" opacity="0.35"/>` : ''}
  <!-- brazos -->
  <g transform="rotate(14 -365 170)"><ellipse cx="-365" cy="180" rx="88" ry="180" fill="${shirt}" ${O}/></g><circle cx="-408" cy="355" r="64" fill="${skinB}" ${O}/>
  <g transform="rotate(-14 365 170)"><ellipse cx="365" cy="180" rx="88" ry="180" fill="${shirt}" ${O}/></g><circle cx="408" cy="355" r="64" fill="${skinB}" ${O}/>
  <!-- torso obeso con camiseta fea -->
  <path d="M-330,90 C-390,330 -300,570 0,580 C300,570 390,330 330,90 C300,-90 -300,-90 -330,90Z" fill="${shirt}" ${O}/>
  <g clip-path="url(#torso)">${stripes}${dots}${folds}
    ${soft ? `<ellipse cx="170" cy="420" rx="260" ry="200" fill="#000" opacity="0.28" filter="url(#blur20)"/><rect x="-420" y="470" width="840" height="140" fill="#000" opacity="0.15" filter="url(#blur20)"/>` : ''}</g>
  <!-- cuello + papada -->
  <rect x="-80" y="-120" width="160" height="150" fill="${skinB}" ${O}/>
  <!-- cabeza -->
  <g transform="translate(0,-215)">
    <ellipse cx="0" cy="60" rx="188" ry="170" fill="${skinB}" ${O}/>
    <ellipse cx="0" cy="0" rx="208" ry="210" fill="${skin}" ${O}/>
    ${soft ? `<ellipse cx="-70" cy="-70" rx="110" ry="80" fill="#fff" opacity="0.13" filter="url(#blur20)"/><ellipse cx="90" cy="130" rx="150" ry="70" fill="#000" opacity="0.18" filter="url(#blur20)"/>` : ''}
    <!-- orejas -->
    <ellipse cx="-205" cy="8" rx="32" ry="50" fill="${skinB}" ${O}/><ellipse cx="205" cy="8" rx="32" ry="50" fill="${skinB}" ${O}/>
    <!-- pelo -->
    <g>${curls.join('')}</g>${hairHi}
    <!-- mejillas -->
    <ellipse cx="-120" cy="60" rx="52" ry="34" fill="#e0624a" opacity="0.4"/><ellipse cx="120" cy="60" rx="52" ry="34" fill="#e0624a" opacity="0.4"/>
    ${eye(-78, 1)}${eye(78, 1)}
    <!-- uniceja -->
    <path d="M-132,-62 Q-70,-112 -8,-64 Q0,-72 8,-64 Q70,-112 132,-62 Q70,-84 8,-46 Q0,-52 -8,-46 Q-70,-84 -132,-62Z" fill="#0f0a08" ${O}/>
    <!-- nariz -->
    <ellipse cx="0" cy="48" rx="34" ry="26" fill="${mode === 'comic' ? '#7a4222' : '#7d4524'}" ${O}/>
    ${soft ? `<ellipse cx="-9" cy="38" rx="10" ry="6" fill="#fff" opacity="0.4"/>` : ''}
    <ellipse cx="-12" cy="58" rx="7" ry="5" fill="#2a130a"/><ellipse cx="12" cy="58" rx="7" ry="5" fill="#2a130a"/>
    <!-- boca -->
    <g transform="translate(0,102)"><path d="M-78,0 Q0,70 78,0 Q0,22 -78,0Z" fill="#4a0f12" ${O}/><g transform="translate(0,0)">${teeth}</g>
      <path d="M-84,-6 Q0,52 84,-6" fill="none" stroke="#7b2a2a" stroke-width="12" stroke-linecap="round" opacity="0.9"/></g>
    ${pims}
  </g>`;
}

function scene(mode, label, sub) {
  const rim = mode === 'semi3d' ? `<path d="M-330,90 C-390,330 -300,570 0,580" fill="none" stroke="#ff9ae8" stroke-width="10" opacity="0.5" transform="translate(540,1010) scale(0.78)" filter="url(#blur8)"/>` : '';
  const halftone = mode === 'comic' ? [...Array(30)].map((_, r) => [...Array(18)].map((__, c) => `<circle cx="${c * 64 + (r % 2) * 32}" cy="${r * 64}" r="${6 + (r / 30) * 10}" fill="#000" opacity="0.07"/>`).join('')).join('') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${defs(mode)}
  <rect width="1080" height="1920" fill="${mode === 'comic' ? '#ffd23f' : 'url(#bg)'}"/>${halftone}
  ${mode === 'semi3d' ? `<circle cx="540" cy="1000" r="520" fill="url(#glow)"/>` : ''}
  <g transform="translate(540,1010) scale(0.78)">${lazy(mode)}</g>${rim}
  <g transform="translate(540,300)"><rect x="-300" y="-48" width="600" height="96" rx="48" fill="${mode === 'comic' ? '#ff4d8d' : '#ffe14d'}" stroke="#14100e" stroke-width="8"/><text x="0" y="25" font-family="Anton" font-size="66" text-anchor="middle" fill="${mode === 'comic' ? '#fff' : '#14100e'}">${label}</text></g>
  <text x="540" y="1760" font-family="Anton" font-size="70" text-anchor="middle" fill="#fff" stroke="#14100e" stroke-width="12" paint-order="stroke">${sub}</text>
  </svg>`;
}
for (const [mode, label, sub, file] of [
  ['semi3d', 'OPCIÓN A', 'SEMI-3D VECTORIAL', 'opcion-A-semi3d.png'],
  ['comic', 'OPCIÓN C', 'CÓMIC CON CONTORNO', 'opcion-C-comic.png'],
]) {
  const png = new Resvg(scene(mode, label, sub), { font: { fontFiles: [font], loadSystemFonts: false, defaultFontFamily: 'Anton' } }).render().asPng();
  writeFileSync(path.join(here, file), png); console.log(file);
}
