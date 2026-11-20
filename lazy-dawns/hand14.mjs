// Mano de primer plano del proceso de unas (dia 14). st = { len, red, glit, uv }: 0..1 cada una.
//  len: de unas cortas y redondas a largas y picudas (la lima) | red: esmalte rojo cubriendo de la base a la punta | glit: polvo dorado | uv: brillo de lampara
const OUT = '#2a0d08', f1 = (n) => Math.round(n * 10) / 10;
export const HAND14_DEFS = `<defs><linearGradient id="sk14" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a5a32"/><stop offset="0.35" stop-color="#d89a68"/><stop offset="0.7" stop-color="#c98a5a"/><stop offset="1" stop-color="#8a4e2b"/></linearGradient>
<linearGradient id="rd14" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4a5c"/><stop offset="0.45" stop-color="#d0102a"/><stop offset="1" stop-color="#6a0614"/></linearGradient>
<linearGradient id="gd14" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.5" stop-color="#e0a820"/><stop offset="1" stop-color="#9a6a08"/></linearGradient>
<linearGradient id="nd14" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe0d2"/><stop offset="1" stop-color="#e8b09c"/></linearGradient></defs>`;
const FING = [[-92, 262, 150, -12, 44], [-32, 218, 190, -3, 46], [30, 218, 200, 3, 46], [88, 240, 168, 11, 40]];
const cl = (x) => Math.min(1, Math.max(0, x)), lerp = (a, b, k) => a + (b - a) * k;
function nail(i, w, L, st, uid) {
  const tipW = w * 0.44, x = tipW * 0.88, tipY = -L - 4, pf = cl(st.len), ln = lerp(0.85, 2.5, pf) * tipW * 1.25, y1 = tipY + 5, y0 = y1 + ln, AP = 42 * pf;
  const top = y1 - 1 - AP, shy = y1 + 14 + 12 * pf, cy = y1 - 1 + 7 * pf;
  const shape = `M${-x},${f1(y0)} L${-x},${f1(shy)} Q${-x},${f1(cy)} 0,${f1(top)} Q${x},${f1(cy)} ${x},${f1(shy)} L${x},${f1(y0)} Q0,${f1(y0 + 6)} ${-x},${f1(y0)}Z`;
  const id = `nl${uid}${i}`, delay = i * 0.12, red = cl((st.red - delay) / (1 - 0.5)); const ry = lerp(y0 + 8, top - 2, red);
  let g = ''; if (st.glit > 0) { const n = Math.round(30 * cl(st.glit)); g = [...Array(n)].map((_, k) => { const t = k / 29; return `<circle cx="${f1((((k * 47 + i * 13) % 100) / 100 - 0.5) * 2 * x * 0.85)}" cy="${f1(y1 + 4 - AP * 0.6 + t * (ln - 8 + AP * 0.6))}" r="${(1.3 + (k % 3) * 0.7).toFixed(1)}" fill="url(#gd14)" opacity="${(0.4 + t * 0.6).toFixed(2)}"/>`; }).join(''); }
  const gloss = `<path d="M${-x * 0.5},${f1(y1 + 12)} Q${-x * 0.55},${f1((y0 + y1) / 2)} ${-x * 0.3},${f1(y0 - 10)}" stroke="#fff" stroke-opacity="${(0.35 + 0.4 * (st.red > 0.5 ? 1 : 0) + 0.2 * (st.uv || 0)).toFixed(2)}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  return `<clipPath id="${id}"><path d="${shape}"/></clipPath><path d="${shape}" fill="url(#nd14)" stroke="#40040e" stroke-width="2" stroke-opacity="${(0.4 + 0.6 * cl(st.red * 3)).toFixed(2)}"/><g clip-path="url(#${id})"><rect x="${-x - 2}" y="${f1(ry)}" width="${2 * x + 4}" height="${f1(y0 - ry + 10)}" fill="url(#rd14)"/>${g}</g><path d="${shape}" fill="none" stroke="#40040e" stroke-width="2"/>${gloss}`;
}
export function hand14(st, uid = 'a') {
  const fingers = FING.map(([dx, dy, L, rot, w], i) => `<g transform="translate(${dx},${dy}) rotate(${rot})"><path d="M${-w / 2},0 L${-w * 0.44},${-L + 26} Q${-w * 0.44},${-L - 4} 0,${-L - 4} Q${w * 0.44},${-L - 4} ${w * 0.44},${-L + 26} L${w / 2},0Z" fill="url(#sk14)" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>${nail(i, w, L, st, uid)}<path d="M${-w * 0.3},${-L * 0.45} h${w * 0.6}" stroke="#5a2e16" stroke-opacity="0.35" stroke-width="2.5"/></g>`).join('');
  const thumb = `<g transform="translate(-118,330) rotate(-58)"><path d="M-26,0 L-23,-126 Q0,-146 23,-126 L26,0Z" fill="url(#sk14)" stroke="${OUT}" stroke-width="6" stroke-linejoin="round"/>${nail(9, 52, 130, st, uid)}</g>`;
  return `${HAND14_DEFS}${thumb}<path d="M-118,260 C-124,330 -110,420 -70,470 L70,470 C110,420 124,330 112,235Z" fill="url(#sk14)" stroke="${OUT}" stroke-width="6"/>${fingers}<path d="M-70,320 q70,28 140,0" stroke="#5a2e16" stroke-opacity="0.25" stroke-width="3" fill="none"/>`;
}
