import * as THREE from 'three';

// ---------- utilidades ----------
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const tex = (c, rep) => {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
};
function grain(w, h, base, n, amt = 0.07) {
  const c = cv(w, h), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    x.fillStyle = rnd() > .5 ? `rgba(255,255,255,${amt})` : `rgba(0,0,0,${amt})`;
    const s = 1 + rnd() * 3; x.fillRect(rnd() * w, rnd() * h, s, s);
  }
  return c;
}
function leaf(x, ctx, px, py, len, ang, col, wid = .22) {
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.bezierCurveTo(len * wid * 1.6, -len * .25, len * wid * 1.3, -len * .75, 0, -len);
  ctx.bezierCurveTo(-len * wid * 1.3, -len * .75, -len * wid * 1.6, -len * .25, 0, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(0,50,0,.35)'; ctx.lineWidth = Math.max(1, len * .025);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len * .9); ctx.stroke(); ctx.restore();
}
function cob(ctx, cx, cy, w, h) {
  ctx.save(); ctx.translate(cx, cy);
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, '#d89c00'); g.addColorStop(.5, '#ffdc33'); g.addColorStop(1, '#e0aa00');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 7); ctx.fill();
  ctx.clip(); const k = w / 5;
  for (let r = -h / 2; r < h / 2; r += k * .9) for (let c = -w / 2; c < w / 2; c += k) {
    const o = (Math.round(r / (k * .9)) % 2) * k / 2;
    ctx.fillStyle = 'rgba(255,245,140,.65)'; ctx.strokeStyle = 'rgba(150,95,0,.55)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(c + o, r, k * .42, k * .4, 0, 0, 7); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
function emblem(ctx, cx, cy, s) { // mazorca con hojas
  const L = (a, l, c, dy = .5) => leaf(0, ctx, cx, cy + s * dy, s * l, a, c);
  L(-1.1, .62, '#2e8a2e'); L(1.1, .62, '#2e8a2e'); L(-.6, .78, '#3aa03a'); L(.6, .78, '#3aa03a');
  cob(ctx, cx, cy - s * .05, s * .36, s * .8);
  L(-.45, .5, '#58b84a', .52); L(.45, .5, '#58b84a', .52);
}
function chili(ctx, x, y, len, ang) { leaf(0, ctx, x, y, len, ang, '#c8141c', .12); leaf(0, ctx, x, y, len * .14, ang + 3.14, '#2e8a2e', .5); }
function muralV(w, h, corn) {
  const c = cv(w, h), x = c.getContext('2d');
  x.strokeStyle = '#2e8a2e'; x.lineWidth = 8; x.beginPath(); x.moveTo(w / 2, h); x.bezierCurveTo(w * .3, h * .7, w * .7, h * .4, w / 2, 0); x.stroke();
  for (let i = 0; i < 9; i++) {
    const y = h * (.1 + i * .1), d = i % 2 ? 1 : -1;
    leaf(0, x, w / 2, y, w * .42, d * 1.0, i % 3 ? '#3aa03a' : '#2e8a2e');
    if (i % 3 == 1) chili(x, w / 2, y + 20, w * .45, -d * 1.4);
  }
  if (corn) emblem(x, w / 2, h * .5, w * .85);
  return c;
}
function muralWide(w, h) {
  const c = cv(w, h), x = c.getContext('2d');
  emblem(x, w / 2, h * .48, h * .75);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      leaf(0, x, w / 2 + s * w * .22, h * .85, h * (.25 + i * .06), s * (.4 + i * .28), i % 2 ? '#3aa03a' : '#2e8a2e');
      chili(x, w / 2 + s * w * .3, h * .8 - i * 20, h * .3, s * (.7 + i * .2));
    }
    for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#c8141c' : '#2e8a2e'; x.beginPath(); x.arc(w / 2 + s * (w * .2 + i * w * .045), h * .93, 9, 0, 7); x.fill(); }
  }
  return c;
}
function signCanvas() {
  const W = 2048, H = 700, c = cv(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fbf1da'); g.addColorStop(1, '#efdfbe');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  emblem(x, W / 2, 150, 300);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) leaf(0, x, W / 2 + s * 430, 210, 150 + i * 14, s * (.5 + i * .35), i % 2 ? '#3aa03a' : '#2e8a2e', .25);
    chili(x, W / 2 + s * 520, 200, 180, s * 1.1); chili(x, W / 2 + s * 600, 190, 160, s * 1.5);
    // flor lateral
    const fx = W / 2 + s * 880, fy = 300;
    for (let k = 0; k < 4; k++) leaf(0, x, fx, fy, 85, k * 1.57 + .78, k % 2 ? '#c8141c' : '#2e8a2e', .4);
    x.fillStyle = '#e8a600'; x.beginPath(); x.arc(fx, fy, 13, 0, 7); x.fill();
    for (let i = 0; i < 3; i++) leaf(0, x, W / 2 + s * 720, 420, 120, s * (.9 + i * .3), '#3aa03a', .25);
  }
  let size = 300, txt = 'TORTILLERÍA';
  x.font = `${size}px "Lilita One","Arial Black",sans-serif`; x.letterSpacing = '3px';
  const mw = x.measureText(txt).width; size *= Math.min(1, 1780 / mw);
  x.font = `${size}px "Lilita One","Arial Black",sans-serif`;
  x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  x.lineJoin = 'round'; x.strokeStyle = '#7d0a12'; x.lineWidth = 11; x.strokeText(txt, W / 2, 505);
  x.fillStyle = '#c4111c'; x.fillText(txt, W / 2, 500);
  x.fillStyle = 'rgba(255,110,100,.28)'; x.fillText(txt, W / 2 - 2, 493);
  return c;
}
function chalkCanvas() {
  const c = grain(512, 820, '#252b2c', 9000, .05), x = c.getContext('2d');
  x.fillStyle = '#e9e9e2'; x.textAlign = 'center';
  x.font = '78px "Comic Sans MS","Chalkboard SE","DejaVu Sans",cursive';
  x.fillText('Tortillas', 256, 200); x.fillText('de Maíz', 256, 300);
  x.strokeStyle = '#f2d96a'; x.lineWidth = 5; x.beginPath(); x.ellipse(256, 560, 62, 135, .6, 0, 7); x.stroke();
  for (let i = -3; i < 4; i++) { x.beginPath(); x.moveTo(256 + i * 22 - 40, 480); x.lineTo(256 + i * 22 + 40, 640); x.stroke(); }
  x.strokeStyle = '#e9e9e2'; x.beginPath(); x.moveTo(150, 350); x.quadraticCurveTo(256, 390, 360, 350); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(0, 0, 512, 820);
  return c;
}
function papelCanvas(col) {
  const c = cv(256, 320), x = c.getContext('2d');
  x.fillStyle = col; x.fillRect(0, 0, 256, 320); x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(21 + i * 43, 318, 24, 0, 7); x.fill(); }
  for (let i = 0; i < 8; i++) { x.save(); x.translate(16 + i * 32, 52); x.rotate(.785); x.fillRect(-7, -7, 14, 14); x.restore(); }
  x.beginPath(); x.arc(128, 160, 70, 0, 7); x.fill(); x.fillStyle = col; x.globalCompositeOperation = 'source-over';
  x.beginPath(); x.arc(128, 160, 52, 0, 7); x.fill(); x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.beginPath(); x.arc(128 + Math.cos(a) * 36, 160 + Math.sin(a) * 36, 9, 0, 7); x.fill(); }
  x.beginPath(); x.arc(128, 160, 14, 0, 7); x.fill();
  for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(24 + i * 70, 265); x.lineTo(44 + i * 70, 290); x.lineTo(4 + i * 70, 290); x.fill(); }
  x.fillStyle = '#000'; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, 256, 16); x.fillStyle = col; x.fillRect(0, 0, 256, 16);
  return c;
}
function potCanvas() {
  const c = grain(512, 256, '#b5532b', 7000, .09), x = c.getContext('2d');
  x.fillStyle = '#5c2310'; x.fillRect(0, 100, 512, 8); x.fillRect(0, 150, 512, 8);
  for (let i = 0; i < 32; i++) { x.beginPath(); x.moveTo(i * 16, 156); x.lineTo(i * 16 + 8, 110); x.lineTo(i * 16 + 16, 156); x.fill(); }
  return c;
}
function tortillaCanvas() {
  const c = cv(128, 128), x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 5, 64, 64, 64); g.addColorStop(0, '#f2d98a'); g.addColorStop(1, '#e3bd66');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(150,95,30,${.12 + rnd() * .25})`; x.beginPath(); x.arc(rnd() * 128, rnd() * 128, 2 + rnd() * 6, 0, 7); x.fill(); }
  return c;
}
function burlapCanvas(label) {
  const c = cv(512, 512), x = c.getContext('2d'); x.fillStyle = '#c9a36b'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 512; i += 4) { x.fillStyle = `rgba(90,60,20,${.1 + rnd() * .12})`; x.fillRect(i, 0, 2, 512); x.fillRect(0, i, 512, 2); }
  if (label) {
    x.fillStyle = '#2e7d2e'; x.font = '120px "Lilita One","Arial Black",sans-serif'; x.textAlign = 'center'; x.fillText('MAÍZ', 256, 160);
    emblem(x, 256, 330, 220);
  }
  return c;
}
function basketCanvas() {
  const c = cv(256, 256), x = c.getContext('2d'); x.fillStyle = '#d9a63c'; x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 16; r++) for (let q = 0; q < 16; q++) {
    x.fillStyle = (r + q) % 2 ? '#e8b94c' : '#b98622'; x.fillRect(q * 16 + 1, r * 16 + 1, 14, 14);
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(q * 16 + 1, r * 16 + 12, 14, 3);
  }
  return c;
}
function tileCanvas() {
  const c = grain(512, 512, '#9c6b4c', 9000, .08), x = c.getContext('2d');
  x.strokeStyle = '#4a3326'; x.lineWidth = 4; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 128, 0); x.lineTo(i * 128, 512); x.stroke(); x.beginPath(); x.moveTo(0, i * 128); x.lineTo(512, i * 128); x.stroke(); }
  return c;
}

// ---------- modelo ----------
export function buildStall() {
  seed = 7;
  const root = new THREE.Group(); root.name = 'Tortilleria';
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...o });
  const stucco = (hex, rep = [1.5, 1.5]) => std(0xffffff, { map: tex(grain(512, 512, hex, 14000, .06), rep) });
  const cream = stucco('#f1e2c3'), redW = stucco('#d1301f'), ochre = stucco('#c98d52');
  const wood = std(0x6b3a1e, { roughness: .7 }), woodD = std(0x4a2814, { roughness: .7 });
  const metal = std(0x9aa0a8, { metalness: .7, roughness: .4 }), metalD = std(0x555a60, { metalness: .7, roughness: .5 });
  const rust = std(0xffffff, { map: tex(grain(256, 256, '#6d5a4f', 6000, .22)), metalness: .5, roughness: .75 });
  const terra = std(0xb5532b), tortMat = std(0xffffff, { map: tex(tortillaCanvas()), roughness: .9 });
  const red = std(0xc8141c), green = std(0x2e8a2e), yellow = std(0xffd22e);

  const add = (m, x, y, z, p = root) => { m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, p) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), x, y, z, p);
  const cyl = (rt, rb, h, mat, x, y, z, p, seg = 32, open = false) => add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), mat), x, y, z, p);
  const decal = (canvas, w, h, x, y, z, ry = 0, p = root) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex(canvas), transparent: true, alphaTest: .4, roughness: .9, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.y = ry; m.position.set(x, y, z); m.receiveShadow = true; p.add(m); return m;
  };

  // piso
  box(6.6, .14, 5.8, std(0x8a8580), 0, -.07, 0);
  const floorTex = tex(tileCanvas(), [4, 3]);
  box(4.2, .03, 4, std(0xffffff, { map: floorTex }), 0, .01, 0);

  // muros laterales (con forma que sigue el techo)
  const wallShape = new THREE.Shape(); [[-2, 0], [2, 0], [2, 3.3], [0, 4.17], [-2, 3.3]].forEach(([a, b], i) => i ? wallShape.lineTo(a, b) : wallShape.moveTo(a, b));
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.ExtrudeGeometry(wallShape, { depth: .9, bevelEnabled: false }), cream);
    w.rotation.y = -Math.PI / 2; w.position.x = s < 0 ? -2.1 : 3.0; w.castShadow = w.receiveShadow = true; w.name = 'muro'; root.add(w);
    box(.98, .65, 4.06, redW, s * 2.55, .325, 0);
    box(.04, .9, 3.8, redW, s * 2.08, .45, .1); // zócalo interior
    decal(muralWide(1024, 768), 4.0, 2.6, s * 3.006, 2.0, 0, s * Math.PI / 2);
  }
  decal(muralV(256, 768, false), .9, 2.7, -2.55, 1.95, 2.006);
  decal(muralV(256, 768, true), .9, 2.7, 2.55, 1.95, 2.006);

  // muro trasero
  const bw = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.3, .2), [cream, cream, cream, cream, ochre, cream]);
  add(bw, 0, 1.65, -1.9); box(4.2, .9, .04, redW, 0, .45, -1.78); box(4.3, .65, .1, redW, 0, .325, -2.04);
  decal(muralWide(1024, 768), 2.9, 2.2, -.8, 2.0, -2.006, Math.PI);
  // ventana trasera
  const wx = 1.2, wy = 1.9, wz = -2.04;
  box(.9, .08, .1, wood, wx, wy + .55, wz); box(.9, .08, .1, wood, wx, wy - .55, wz);
  box(.08, 1.1, .1, wood, wx - .45, wy, wz); box(.08, 1.1, .1, wood, wx + .45, wy, wz); box(.04, 1.1, .1, wood, wx, wy, wz);
  box(.82, 1.0, .02, std(0x1d2a30, { metalness: .6, roughness: .2 }), wx, wy, wz + .04);
  box(1.0, .2, .22, wood, wx, wy - .7, wz - .08);
  for (let i = 0; i < 5; i++) add(new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), i % 2 ? green : red), wx - .36 + i * .18, wy - .55, wz - .08);
  box(.4, 1.2, .05, wood, wx - .72, wy, wz - .05); box(.4, 1.2, .05, wood, wx + .72, wy, wz - .05); // postigos

  // viga frontal + ménsulas
  box(4.2, .4, .3, woodD, 0, 3.1, 1.88);
  for (const s of [-1, 1]) { box(.35, .3, .18, wood, s * 2.0, 2.78, 2.0); box(.2, .2, .16, wood, s * 1.85, 2.62, 2.0); }

  // ---- techo de tejas ----
  const th = Math.atan(1.15 / 2.7), L = Math.hypot(1.15, 2.7);
  const tileGeo = new THREE.CylinderGeometry(.1, .125, .56, 12, 1, true, 0, Math.PI); tileGeo.rotateZ(Math.PI / 2); tileGeo.rotateY(Math.PI / 2);
  const capGeo = new THREE.CircleGeometry(.118, 14, 0, Math.PI);
  const tileMats = ['#c4522a', '#b84a24', '#cf6035', '#a9421f', '#c05a30'].map(c => std(c, { roughness: .75, side: THREE.DoubleSide }));
  const capMat = std(0x3a140a, { side: THREE.DoubleSide });
  const slope = () => {
    const g = new THREE.Group(); g.name = 'techo';
    box(7.0, .08, L + .1, std(0x7a3520), 0, -.04, L / 2, g);
    for (let i = 0; i < 26; i++) for (let j = 0; j < 6; j++) {
      const t = new THREE.Mesh(tileGeo, tileMats[(i * 3 + j * 2) % 5]);
      t.position.set(-3.375 + i * .27, .01, .28 + j * .5 + (i % 2) * .05); t.rotation.x = -.05; t.castShadow = t.receiveShadow = true; g.add(t);
      if (j === 5) { const c = new THREE.Mesh(capGeo, capMat); c.position.set(t.position.x, .01, t.position.z + .28); g.add(c); }
    }
    for (let k = -4; k <= 4; k++) { const r = cyl(.05, .05, L + .5, wood, k * .8, -.14, L / 2 + .15, g, 10); r.rotation.x = Math.PI / 2; }
    for (const s of [-1, 1]) box(.08, .22, L + .1, std(0x6b3a1e), s * 3.5, -.04, L / 2, g);
    box(7.04, .22, .08, wood, 0, -.06, L + .08, g); // fascia
    return g;
  };
  const front = slope(); front.position.set(0, 4.25, 0); front.rotation.x = th; root.add(front);
  const backW = new THREE.Group(); backW.position.set(0, 4.25, 0); backW.rotation.y = Math.PI; const back = slope(); back.rotation.x = th; backW.add(back); root.add(backW);
  const ridge = cyl(.17, .17, 7.1, std(0x8c3418), 0, 4.3, 0, root, 14); ridge.rotation.z = Math.PI / 2;

  // ---- letrero ----
  const sg = new THREE.Group(); sg.name = 'letrero'; sg.position.set(0, 3.25, 2.1); sg.rotation.x = -.12; root.add(sg);
  const sh = new THREE.Shape();
  sh.moveTo(-2.2, .12); sh.quadraticCurveTo(-2.2, 0, -2.08, 0); sh.lineTo(2.08, 0); sh.quadraticCurveTo(2.2, 0, 2.2, .12); sh.lineTo(2.2, .95);
  sh.quadraticCurveTo(2.2, 1.05, 2.1, 1.07); sh.lineTo(1.3, 1.1); sh.bezierCurveTo(1.1, 1.1, 1.05, 1.5, .7, 1.5); sh.lineTo(-.7, 1.5);
  sh.bezierCurveTo(-1.05, 1.5, -1.1, 1.1, -1.3, 1.1); sh.lineTo(-2.1, 1.07); sh.quadraticCurveTo(-2.2, 1.05, -2.2, .95); sh.closePath();
  const border = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .1, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2 }), std(0xc41a14, { roughness: .9 }));
  border.castShadow = true; sg.add(border);
  const signTex = tex(signCanvas()); const faceMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: .9, envMapIntensity: .3, emissiveMap: signTex, emissive: 0x777777 });
  const mkFace = () => {
    const g = new THREE.ShapeGeometry(sh); const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + 2.2) / 4.4, p.getY(i) / 1.5);
    g.translate(0, -.75, 0); g.scale(.94, .94, 1); g.translate(0, .75, 0); return g;
  };
  const f1 = new THREE.Mesh(mkFace(), faceMat); f1.position.z = .135; sg.add(f1);
  const f2 = new THREE.Mesh(mkFace(), faceMat); f2.rotation.y = Math.PI; f2.position.set(0, 0, -.035); sg.add(f2);
  for (const s of [-1, 1]) { const p = box(.12, .8, .12, woodD, s * 1.3, -.2, .05, sg); p.rotation.x = .12; }

  // ---- papel picado ----
  const cols = ['#2ea84a', '#fbf1da', '#d9261c', '#2ea84a', '#fbf1da', '#d9261c', '#fbf1da'];
  const string = cyl(.012, .012, 4.1, std(0x333333), 0, 2.93, 1.78, root, 6); string.rotation.z = Math.PI / 2;
  cols.forEach((c, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.56, .7), new THREE.MeshStandardMaterial({ map: tex(papelCanvas(c)), transparent: true, alphaTest: .5, side: THREE.DoubleSide, roughness: .9 }));
    m.position.set(-1.8 + i * .6, 2.58, 1.78); m.castShadow = true; m.name = 'papel_picado'; root.add(m);
  });

  // ---- vasijas ----
  const potMat = std(0xffffff, { map: tex(potCanvas()), roughness: .8 });
  const potProfiles = [
    [[0, 0], [.45, 0], [.6, .1], [.95, .4], [1, .6], [.85, .85], [.55, .98], [.58, 1.08], [.68, 1.14], [.68, 1.2], [.5, 1.2]],
    [[0, 0], [.5, 0], [.8, .2], [1, .5], [.95, .8], [.6, 1.0], [.7, 1.12], [.5, 1.12]],
    [[0, 0], [.4, 0], [.55, .15], [.75, .6], [.7, .95], [.45, 1.2], [.35, 1.55], [.5, 1.7], [.4, 1.7]]
  ];
  const pot = (t, r, x, y, z, p = root) => {
    const pts = potProfiles[t].map(([a, b]) => new THREE.Vector2(a * r, b * r));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), potMat); m.material.side = THREE.DoubleSide;
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; m.name = 'vasija'; p.add(m);
    if (t === 1) { const lid = new THREE.Mesh(new THREE.SphereGeometry(r * .5, 14, 8, 0, 7, 0, 1.2), terra); lid.position.set(x, y + 1.1 * r, z); lid.castShadow = true; p.add(lid); }
    return m;
  };
  const shelf = (x, y, z, len, depth, alongZ) => {
    const b = box(alongZ ? depth : len, .06, alongZ ? len : depth, wood, x, y, z);
    for (const s of [-.4, .4]) { alongZ ? box(.05, .22, .05, woodD, x, y - .13, z + s * len) : box(.05, .22, .05, woodD, x + s * len, y - .13, z); }
    return b;
  };
  shelf(-.8, 2.05, -1.72, 1.4, .3); [-1.2, -.8, -.4].forEach((x, i) => pot(i % 2, .2, x, 2.08, -1.72));
  shelf(1.4, 2.05, -1.72, 1.8, .3); [.7, 1.05, 1.4, 1.75, 2.0].forEach((x, i) => pot((i + 1) % 2, .17, x, 2.08, -1.72));
  shelf(-1.92, 1.2, -.6, 1.7, .28, true); shelf(-1.92, 2.0, -.6, 1.7, .28, true);
  [-1.3, -.8, -.3, .15].forEach((z, i) => { pot(i % 2, .17, -1.92, 1.23, z); pot((i + 1) % 2, .15, -1.92, 2.03, z); });

  // mesa + olla de metal
  const tbl = box(.9, .06, .6, wood, -1.7, .6, -1.25); for (const [a, b] of [[-.4, -.25], [.4, -.25], [-.4, .25], [.4, .25]]) box(.06, .6, .06, woodD, -1.7 + a, .3, -1.25 + b);
  cyl(.22, .22, .42, metalD, -1.7, .84, -1.25, root, 24); cyl(.24, .24, .05, metal, -1.7, 1.07, -1.25, root, 24); cyl(.04, .04, .06, metalD, -1.7, 1.12, -1.25, root, 10);

  // ---- mostrador ----
  box(2.1, 1.0, .9, redW, -.85, .5, 1.05); box(2.25, .1, 1.05, std(0x9a9a98, { roughness: .6 }), -.85, 1.05, 1.05);
  const mk = (x, z, n, r) => { for (let i = 0; i < n; i++) { const t = cyl(r, r, .018, tortMat, x + (rnd() - .5) * .03, 1.1 + i * .018, z + (rnd() - .5) * .03, root, 40); t.rotation.y = rnd() * 6; } };
  mk(-1.0, 1.05, 30, .36); mk(-.1, 1.2, 2, .26);

  // ---- máquina tortilladora ----
  const mg = new THREE.Group(); mg.name = 'maquina'; mg.position.set(1.35, 0, -.85); root.add(mg);
  box(1.1, .9, .9, metalD, 0, .45, 0, mg); box(1.0, 1.2, .8, metal, 0, 1.5, 0, mg); box(1.06, .1, .86, metalD, 0, 2.15, 0, mg);
  cyl(.15, .33, .4, metal, -.2, 2.42, 0, mg, 20, true); cyl(.34, .34, .04, metalD, -.2, 2.62, 0, mg, 20);
  for (const y of [1.15, 1.5]) { const r = cyl(.14, .14, .9, std(0xb8bcc2, { metalness: .8, roughness: .3 }), 0, y, .45, mg, 20); r.rotation.z = Math.PI / 2; }
  for (const s of [-1, 1]) box(.08, .75, .55, metalD, s * .5, 1.3, .45, mg);
  box(.32, .36, .12, metalD, .25, 1.75, .45, mg);
  [[-.08, red], [.05, green], [.18, yellow]].forEach(([dx, m]) => { const k = cyl(.03, .03, .05, m, .12 + dx, 1.8, .53, mg, 10); k.rotation.x = Math.PI / 2; });
  const motor = cyl(.18, .18, .4, metalD, .75, 1.0, 0, mg, 20); motor.rotation.z = Math.PI / 2;
  cyl(.06, .06, .55, metal, .4, 2.5, -.2, mg, 10);
  for (let i = 0; i < 6; i++) { const b = cyl(.02, .02, .03, metal, -.4 + (i % 3) * .4, 1.2 + Math.floor(i / 3) * .6, .41, mg, 8); b.rotation.x = Math.PI / 2; }
  // cinta
  const belt = new THREE.Group(); belt.position.set(0, 1.28, .85); belt.rotation.x = .6; mg.add(belt);
  box(.5, .03, .75, std(0x232323, { roughness: .9 }), 0, 0, 0, belt); box(.4, .02, .5, std(0xe8c75a), 0, .025, -.05, belt);
  for (const s of [-1, 1]) box(.03, .08, .75, metalD, s * .27, .03, 0, belt);
  // comal
  cyl(.78, .8, .9, rust, 1.25, .45, .75, root, 40); cyl(.88, .88, .06, std(0x1b1b1d, { metalness: .6, roughness: .5 }), 1.25, .93, .75, root, 48);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.88, .03, 8, 48), metalD); rim.rotation.x = Math.PI / 2; add(rim, 1.25, .96, .75);
  box(.35, .45, .05, metalD, 1.25, .5, 1.55); const hd = new THREE.Mesh(new THREE.TorusGeometry(.07, .015, 8, 16), metal); add(hd, 1.25, .5, 1.6);
  for (let a = 0; a < 3; a++) cyl(.05, .05, .1, metalD, 1.25 + Math.cos(a * 2.1) * .6, .03, .75 + Math.sin(a * 2.1) * .6, root, 8);
  [[1.0, .55], [1.4, .6], [1.15, 1.0], [1.55, 1.05], [.9, .95]].forEach(([x, z]) => cyl(.14, .14, .014, tortMat, x, .97, z, root, 28));
  // bidón
  cyl(.2, .22, .75, metal, .45, .38, -.55, root, 24); cyl(.14, .2, .12, metal, .45, .8, -.55, root, 24); cyl(.1, .1, .08, metalD, .45, .9, -.55, root, 16);
  for (const s of [-1, 1]) box(.05, .12, .05, metalD, .45 + s * .2, .6, -.55);

  // ---- pizarrón ----
  const cb = new THREE.Group(); cb.position.set(-2.55, 1.75, 2.02); root.add(cb);
  box(.78, 1.12, .06, wood, 0, 0, 0, cb);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(.66, 1.0), new THREE.MeshStandardMaterial({ map: tex(chalkCanvas()), roughness: .9 })); board.position.z = .035; cb.add(board);

  // ---- canasta con tortillas ----
  const bpts = [[0, 0], [.4, 0], [.52, .1], [.62, .35], [.68, .6], [.72, .66], [.6, .66]].map(([a, b]) => new THREE.Vector2(a, b));
  const basket = new THREE.Mesh(new THREE.LatheGeometry(bpts, 32), new THREE.MeshStandardMaterial({ map: tex(basketCanvas(), [4, 1]), roughness: .9, side: THREE.DoubleSide }));
  add(basket, -2.55, 0, 2.55); basket.name = 'canasta';
  const brim = new THREE.Mesh(new THREE.TorusGeometry(.7, .03, 8, 36), std(0x9b6a14)); brim.rotation.x = Math.PI / 2; add(brim, -2.55, .66, 2.55);
  for (let i = 0; i < 12; i++) { const t = cyl(.5, .5, .02, tortMat, -2.55 + (rnd() - .5) * .04, .5 + i * .02, 2.55 + (rnd() - .5) * .04, root, 36); t.rotation.y = rnd() * 6; }

  // ---- costal de maíz ----
  const spts = [[0, 0], [.4, 0], [.5, .1], [.53, .45], [.45, .75], [.3, .9], [.22, .96], [.3, 1.04], [.38, 1.12], [.2, 1.1]].map(([a, b]) => new THREE.Vector2(a, b));
  const sack = new THREE.Mesh(new THREE.LatheGeometry(spts, 28), new THREE.MeshStandardMaterial({ map: tex(burlapCanvas(false), [3, 2]), roughness: 1, side: THREE.DoubleSide }));
  add(sack, 2.6, 0, 2.5); sack.name = 'costal';
  for (const s of [1, -1]) { const lab = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshStandardMaterial({ map: tex(burlapCanvas(true)), roughness: 1 })); lab.position.set(2.6, .45, 2.5 + s * .535); lab.rotation.y = s > 0 ? 0 : Math.PI; root.add(lab); }
  // mazorcas 3D sueltas
  const cobTex = (() => { const c = cv(128, 256), x = c.getContext('2d'); x.fillStyle = '#f2c21a'; x.fillRect(0, 0, 128, 256); for (let r = 0; r < 26; r++) for (let q = 0; q < 10; q++) { x.fillStyle = 'rgba(255,235,120,.6)'; x.strokeStyle = 'rgba(150,95,0,.5)'; x.beginPath(); x.ellipse(q * 13 + (r % 2) * 6, r * 10, 5, 4.5, 0, 0, 7); x.fill(); x.stroke(); } return tex(c); })();
  const cobMat = new THREE.MeshStandardMaterial({ map: cobTex, roughness: .6 });
  [[1.95, 2.75, .6], [2.2, 3.0, 1.9], [3.0, 2.95, 3.4]].forEach(([x, z, a]) => {
    const g = new THREE.Group(); g.name = 'mazorca';
    const m = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 12), cobMat); m.scale.set(1, 2.6, 1); m.rotation.y = 0; m.castShadow = true; g.add(m);
    for (let k = 0; k < 4; k++) { const h = new THREE.Mesh(new THREE.ConeGeometry(.06, .22, 6), green); h.position.set(Math.cos(k * 1.57) * .04, -.2, Math.sin(k * 1.57) * .04); h.rotation.set(Math.sin(k * 1.57) * .4, 0, -Math.cos(k * 1.57) * .4); h.rotation.x += Math.PI; g.add(h); }
    g.rotation.z = Math.PI / 2; g.rotation.y = a; g.position.set(x, .08, z); root.add(g);
  });
  return root;
}
