export function defs(mode) {
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
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.35"/></filter><filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
  <clipPath id="torso"><path d="M-330,90 C-390,330 -300,570 0,580 C300,570 390,330 330,90 C300,-90 -300,-90 -330,90Z"/></clipPath>
  <clipPath id="headclip"><ellipse cx="0" cy="0" rx="205" ry="205"/></clipPath>
  </defs>`;
}


export function hand(cx, cy, side, O, skinB, soft) {
  const nail = (len, chip) => `<path d="M-9,${len - 16} Q-12,${len + 12} -5,${len + 36} Q3,${len + 44} 10,${len + 32} Q13,${len + 8} 9,${len - 16}Z" fill="#d7a1b6" ${O ? 'stroke="#12090a" stroke-width="3"' : ''}/>
    <path d="M-7,${len + 14} Q0,${len + 30} 8,${len + 14} Q6,${len + 38} 0,${len + 40} Q-6,${len + 36} -7,${len + 14}Z" fill="#2a1608" opacity="0.75"/>
    ${chip ? `<path d="M-10,${len + 6} l7,6 l-6,7 l8,6 l-9,2Z" fill="#8a4e2b"/>` : ''}<path d="M-5,${len - 6} q1,18 3,30" stroke="#fff" stroke-opacity="0.45" stroke-width="3" fill="none"/>`;
  const f = (dx, dy, len, rot, i) => `<g transform="translate(${dx},${dy}) rotate(${rot})"><rect x="-13" y="0" width="26" height="${len}" rx="13" fill="${skinB}" ${O}/>
    ${nail(len, i % 2 === 0)}<path d="M-8,${len - 4} h16" stroke="#2a1608" stroke-width="3" opacity="0.7"/>
    <path d="M-9,${len * 0.5} h18" stroke="#000" stroke-opacity="0.25" stroke-width="3"/></g>`;
  const sd = side;
  return `<g transform="translate(${cx},${cy})">
    <ellipse cx="0" cy="0" rx="60" ry="54" fill="${skinB}" ${O}/>
    ${f(-36 * sd, 34, 52, -14 * sd, 0)}${f(-12 * sd, 44, 62, -4 * sd, 1)}${f(12 * sd, 44, 66, 4 * sd, 2)}${f(36 * sd, 34, 54, 14 * sd, 3)}
    <g transform="translate(${52 * sd},-6) rotate(${-40 * sd})"><rect x="-13" y="-6" width="26" height="50" rx="13" fill="${skinB}" ${O}/>${nail(44, true)}</g>
    ${soft ? `<ellipse cx="-14" cy="-16" rx="30" ry="16" fill="#fff" opacity="0.14"/>` : ''}
    <path d="M-30,-8 q12,10 24,0 M2,-10 q12,10 24,0" stroke="#000" stroke-opacity="0.25" stroke-width="3" fill="none"/>
    <ellipse cx="14" cy="26" rx="20" ry="9" fill="#3b2412" opacity="0.28"/>
  </g>`;
}
export function foot(cx, O, skinB, soft, strapCol) {
  const toes = [-58, -30, -2, 24, 48].map((x, i) => `<g><circle cx="${cx + x}" cy="${676 - (i === 0 ? 0 : Math.abs(i - 2) * -2 + 4)}" r="${i === 0 ? 20 : 15 - i * 0.6}" fill="${skinB}" ${O}/>
    <ellipse cx="${cx + x}" cy="${684}" rx="${i === 0 ? 10 : 8}" ry="5" fill="#d9bfa0" ${O ? 'stroke="#12090a" stroke-width="2"' : ''}/><ellipse cx="${cx + x}" cy="${686}" rx="6" ry="2.5" fill="#2a1608" opacity="0.55"/></g>`).join('');
  return `<g>
    <ellipse cx="${cx}" cy="676" rx="128" ry="54" fill="#2f2420" ${O}/>
    <path d="M${cx - 120},670 q20,28 60,26 M${cx + 30},700 q40,-6 82,-26" stroke="#1a1210" stroke-width="5" fill="none" opacity="0.7"/>
    <ellipse cx="${cx}" cy="650" rx="104" ry="42" fill="${skinB}" ${O}/>
    ${soft ? `<ellipse cx="${cx - 24}" cy="636" rx="56" ry="14" fill="#fff" opacity="0.15"/>` : ''}
    ${toes}
    <path d="M${cx - 100},640 Q${cx},600 ${cx + 100},640" stroke="${strapCol}" stroke-width="22" fill="none" stroke-linecap="round" ${O ? '' : ''}/>
    <path d="M${cx + 20},622 l12,-10 l8,12 l10,-8" stroke="#2a1a10" stroke-width="4" fill="none"/>
    <ellipse cx="${cx + 46}" cy="662" rx="26" ry="9" fill="#4a3020" opacity="0.5"/>
  </g>`;
}

export function lazy(mode) {
  const O = mode !== 'semi3d' ? 'stroke="#12090a" stroke-width="8" stroke-linejoin="round"' : '';
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
  ${foot(-120, O, skinB, soft, "#e8629c")}${foot(120, O, skinB, soft, "#7fb069")}
  <!-- brazos -->
  <g transform="rotate(14 -365 170)"><ellipse cx="-365" cy="180" rx="88" ry="180" fill="${shirt}" ${O}/></g>${hand(-408, 362, -1, O, skinB, soft)}
  <g transform="rotate(-14 365 170)"><ellipse cx="365" cy="180" rx="88" ry="180" fill="${shirt}" ${O}/></g>${hand(408, 362, 1, O, skinB, soft)}
  <!-- torso obeso con camiseta fea -->
  <path d="M-330,90 C-390,330 -300,570 0,580 C300,570 390,330 330,90 C300,-90 -300,-90 -330,90Z" fill="${shirt}" ${O}/>
  <g clip-path="url(#torso)">${stripes}${dots}${folds}
    ${soft ? `<ellipse cx="170" cy="420" rx="260" ry="200" fill="#000" opacity="0.28" filter="url(#blur20)"/><rect x="-420" y="470" width="840" height="140" fill="#000" opacity="0.15" filter="url(#blur20)"/>` : ''}</g>
  
  <g clip-path="url(#torso)">
    <path d="M-250,430 l30,-34 l24,40 l30,-36 l28,44 l30,-30 l28,38 l30,-34 l26,40 l30,-30 l28,40 l30,-34 l24,36 L300,620 L-300,620Z" fill="${skinB}" ${O && 'stroke="#12090a" stroke-width="5"'}/>
    <ellipse cx="-190" cy="250" rx="62" ry="46" fill="#3a1d10" opacity="0.9"/>
    <path d="M-250,230 l16,-22 l14,18 l14,-24 l14,22 l16,-18 l14,22 l-8,26 l-18,10 l-24,-6Z" fill="${skinB}" ${O && 'stroke="#12090a" stroke-width="4"'}/>
    <g transform="translate(150,170) rotate(-6)"><rect x="-70" y="-60" width="140" height="120" fill="#4f7cac" ${O && 'stroke="#12090a" stroke-width="5"'}/><path d="M-62,-52 H62 V52 H-62Z" stroke="#f4e9c8" stroke-width="5" stroke-dasharray="14 9" fill="none"/><path d="M-30,-20 h60 M-30,10 h40" stroke="#fff" stroke-opacity="0.25" stroke-width="8"/></g>
    <ellipse cx="-60" cy="330" rx="120" ry="50" fill="#4a2f14" opacity="0.35" filter="url(#blur8)"/>
    <ellipse cx="200" cy="420" rx="90" ry="40" fill="#2b2b2b" opacity="0.35" filter="url(#blur8)"/>
    <g fill="#4a2f14" opacity="0.55">${[[-250,120,10],[-210,150,6],[40,90,9],[90,330,12],[-120,500,8],[250,300,7],[10,470,10],[-300,330,6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
  </g>
  <!-- pantalon roto en rodillas -->
  <ellipse cx="-105" cy="505" rx="40" ry="28" fill="${skinB}" ${O && 'stroke="#12090a" stroke-width="4"'}/>
  <path d="M-135,492 l14,12 l10,-14 l12,16 l12,-10" stroke="#e9d9b8" stroke-width="3" fill="none"/>
  <ellipse cx="105" cy="560" rx="75" ry="26" fill="#3a2a1a" opacity="0.4" filter="url(#blur8)"/>

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
    <ellipse cx='-130' cy='20' rx='40' ry='18' fill='#2e1a0c' opacity='0.3' filter='url(#blur8)'/><ellipse cx='110' cy='110' rx='46' ry='16' fill='#2e1a0c' opacity='0.3' filter='url(#blur8)'/>
  </g>`;
}

