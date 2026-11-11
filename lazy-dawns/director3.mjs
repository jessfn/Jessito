// Director de actuacion de Lazy Dawns (v2): ELLA NO HABLA. Solo reacciona con rostro y cuerpo mientras el narrador (ElevenLabs) cuenta.
// Fisica del movimiento (investigado/aplicado):
//  - Los ojos saltan primero (saccade) y la cabeza los sigue mas lenta; la cabeza aporta solo una parte del giro (resortes con distinta frecuencia).
//  - Los brazos se mueven en espacio de articulaciones (hombro/codo) => la mano dibuja arcos, con anticipacion y ligero rebote (resorte subamortiguado);
//    la muneca se retrasa respecto al antebrazo (seguimiento / overlapping action).
//  - Semantica: asentir = cabeceo vertical; negar = giro horizontal; reir = rebote vertical de hombros/pecho a ~4-5 Hz que decae;
//    respirar = movimiento vertical lento (~14/min); cambio de peso = desplazamiento lateral del torso con pies fijos; salto = vertical.
//  - Expresion: aparece rapido (~0.25 s) y se va despacio (~0.7 s); reaccion con ~0.2 s de latencia tras el estimulo; parpadeo espontaneo
//    100-150 ms cada 2.2-4.6 s y tambien al cambiar la mirada.
import { solveArm } from './rig.mjs';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

const E = (o) => ({ bl: 0, bli: 0, br: 0, bri: 0, lid: 1, squint: 0, smile: 0.1, wide: 0, asym: 0, press: 0, baseOpen: 0, roll: 0, pitch: 0, tears: 0, shoulders: 0, flare: 0, ...o });
const EMO = {
  neutral: E({}),
  happy: E({ bl: 0.3, br: 0.3, squint: 0.35, smile: 0.9, wide: 0.3, roll: -2 }),
  sad: E({ bli: 0.8, bri: 0.8, bl: -0.1, br: -0.1, lid: 0.82, smile: -0.7, tears: 0.9, pitch: 0.55, roll: -5, shoulders: -0.4 }),
  touched: E({ bli: 0.6, bri: 0.6, lid: 0.9, smile: 0.35, tears: 0.55, pitch: 0.2, roll: -4 }),
  surprise: E({ bl: 0.9, br: 0.9, bli: 0.1, bri: 0.1, lid: 1.25, smile: 0.1, baseOpen: 0.3, wide: -0.3, shoulders: 0.7, flare: 0.5, pitch: -0.35 }),
  hopeful: E({ bl: 0.45, br: 0.45, bli: 0.5, bri: 0.5, lid: 1.1, smile: 0.35, roll: -3 }),
  laugh: E({ bl: 0.3, br: 0.3, lid: 0.12, squint: 1, smile: 1, wide: 0.8, baseOpen: 0.5, roll: 7, pitch: -0.45, shoulders: 0.4 }),
  hurt: E({ bli: 0.7, bri: 0.7, bl: -0.1, br: -0.1, lid: 0.8, smile: -0.5, tears: 0.3, pitch: 0.35, roll: 4, shoulders: -0.3 }),
  thinking: E({ bl: 0.65, br: 0.1, lid: 0.9, smile: -0.05, asym: 0.6, roll: 5, pitch: -0.05 }),
  serious: E({ lid: 0.95, smile: 0.0, bl: 0.05, br: 0.05 }),
  wince: E({ bli: 0.5, bri: 0.5, lid: 0.85, squint: 0.25, smile: -0.25, asym: -0.3, pitch: 0.2 }),
  awkward: E({ bl: 0.3, br: 0.15, squint: 0.3, smile: 0.7, wide: 0.6, asym: 0.4, roll: 3 }),
  determined: E({ bl: -0.2, br: -0.2, bli: -0.7, bri: -0.7, lid: 0.9, smile: 0.1, press: 0.8, pitch: -0.45, shoulders: 0.4 }),
  numb: E({ lid: 0.78, smile: 0.35, asym: 0.9, bl: 0, br: 0.15, roll: 3 }),
  radiant: E({ bl: 0.35, br: 0.35, bli: 0.1, bri: 0.1, lid: 1, squint: 0.55, smile: 1, wide: 0.75, baseOpen: 0.42, pitch: -0.2, roll: -2, shoulders: 0.3 }),
  pain: E({ bli: 0.9, bri: 0.9, lid: 0.12, squint: 0.7, smile: -0.5, press: 0.4, pitch: 0.2, shoulders: 0.5 }),
  scream: E({ bl: 0.9, br: 0.9, bli: 0.6, bri: 0.6, lid: 1.25, smile: -0.2, baseOpen: 0.95, wide: -0.2, shoulders: 0.8, pitch: -0.3, flare: 0.7 }),
  scared: E({ bl: 0.8, br: 0.8, bli: 0.8, bri: 0.8, lid: 1.2, smile: -0.4, baseOpen: 0.25, shoulders: 0.7, pitch: 0.1 }),
  relaxed: E({ lid: 0.25, smile: 0.35, pitch: -0.1, bl: 0.1, br: 0.1 }),
  bored: E({ lid: 0.7, smile: -0.1, asym: 0.2, bl: 0, br: 0.1, pitch: 0.1 }),
  joycry: E({ bli: 0.5, bri: 0.5, bl: 0.2, br: 0.2, lid: 0.8, squint: 0.7, smile: 0.9, wide: 0.5, tears: 1, pitch: 0.1, roll: -3 }),
  proud: E({ bl: 0.25, br: 0.25, squint: 0.4, smile: 1, wide: 0.5, baseOpen: 0.32, pitch: -0.3, roll: -3, shoulders: 0.3 }),
};
const mag = (e) => Math.abs(e.smile - 0.1) + Math.abs(e.bl) + Math.abs(e.br) + Math.abs(e.bli) + Math.abs(e.bri) + Math.abs(1 - e.lid) + e.squint + e.baseOpen + e.tears + e.press;

export function makeDirector({ L, T, DUR }) {
  const R = rng(777);
  const LAT = 0.2;
  const W = (id, w, n = 0) => { const nm = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zñ0-9]/g, ''); const r = L[id].words.filter((x) => nm(x[0]) === nm(w))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + w); return r[1]; };
  const ramp = (t, a, b) => smooth((t - a) / Math.max(1e-3, b - a));

  // ----- parpadeos -----
  const blinkStarts = []; { let t = 0.8; while (t < DUR) { blinkStarts.push(t); if (R() < 0.2) blinkStarts.push(t + 0.3); t += 2.2 + R() * 2.4; } }
  T.scenes.forEach((x) => blinkStarts.push(x + 0.05));
  const blinkAt = (t) => { let m = 0; for (const b of blinkStarts) { const d = t - b; if (d < 0 || d > 0.22) continue; const k = d < 0.07 ? d / 0.07 : d < 0.1 ? 1 : 1 - (d - 0.1) / 0.12; m = Math.max(m, clamp(k)); } return m; };
  const closeWins = [[T.needle, T.needle + 99]]; // placeholder (los ojos cerrados se definen abajo)
  const shut = (t) => { // ojos cerrados con fuerza durante la aguja y la extraccion
    const a = ramp(t, T.needle + 0.5, T.needle + 0.8) * (1 - ramp(t, T.crack + 0.7, T.crack + 1.0)); return a; };
  const slowBlink = (t) => { const d = t - T.reveal; return d < 0 || d > 0.5 ? 0 : d < 0.18 ? d / 0.18 : d < 0.28 ? 1 : 1 - (d - 0.28) / 0.22; };

  // ----- mirada: sigue al que habla -----
  const sacc = []; { let t = 0; while (t < DUR) { sacc.push({ t, x: (R() - 0.5) * 0.2, y: (R() - 0.5) * 0.14 }); t += 0.35 + R() * 0.9; } }
  const saccAt = (t) => { let i = 0; while (i < sacc.length - 1 && sacc[i + 1].t <= t) i++; const a = sacc[i], p = sacc[Math.max(0, i - 1)]; const u = smooth((t - a.t) / 0.06); return { x: lerp(p.x, a.x, u), y: lerp(p.y, a.y, u) }; };
  const gazeKF = [[0, 0, 0]], yawKF = [[0, 0]];
  const ids = Object.keys(L);
  ids.forEach((id) => { const l = L[id]; const gx = l.who === 'M' ? -0.78 : l.who === 'D' ? 0.78 : 0; const gy = l.who === 'N' ? 0.0 : 0.05;
    gazeKF.push([l.start - 0.12, gx, gy]); yawKF.push([l.start - 0.12, gx * 0.34]); });
  gazeKF.push([T.finalA - 0.2, 0.0, 0.0], [T.xrayStart, 0.7, -0.35], [T.xrayEnd, 0.7, -0.35], [T.needle, 0.2, -0.7], [T.crack + 0.8, 0.5, 0.1], [T.dark, 0.0, 0.0], [T.power, 0.0, -0.5], [T.mirrorStart, 0.85, 0.05], [T.mirrorEnd, 0.1, 0.1]);
  gazeKF.sort((a, b) => a[0] - b[0]); yawKF.sort((a, b) => a[0] - b[0]);
  gazeKF.push([DUR, 0, 0]); yawKF.push([T.mirrorStart, 0.5], [T.mirrorEnd, 0.1], [T.finalA - 0.2, 0.0]); yawKF.sort((a, b) => a[0] - b[0]); yawKF.push([DUR, 0]);
  const kfAt = (K, t, n) => { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++; const a = K[i], b = K[Math.min(i + 1, K.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, Math.min(0.3, b[0] - a[0]))); return Array.from({ length: n }, (_, k) => lerp(a[1 + k], b[1 + k], u)); };
  gazeKF.forEach((g) => { if (Math.hypot(g[1], g[2]) > 0.5) blinkStarts.push(g[0] + 0.02); });

  // ----- emociones -----
  const emoScript = [[0, 'neutral'], [T.slateEnd, 'wince'], [L.l2.start, 'awkward'], [L.l3.start + 0.3, 'hopeful'], [L.l4.start + 0.3, 'scared'], [L.l5.start, 'scared'], [W('l5', 'serio') - 0.2, 'wince'], [L.l6.start + 0.3, 'scared'],
    [W('l7', 'pantalla:') - 0.2, 'surprise'], [L.l8.start + 0.2, 'surprise'], [L.l9.start + 0.3, 'scared'], [L.l10.start + 0.3, 'thinking'], [L.l11.start + 0.2, 'scared'], [L.l12.start, 'scared'], [T.needle + 0.3, 'pain'], [W('l13', 'turbina...') - 0.2, 'pain'],
    [T.crack + 0.1, 'surprise'], [L.l14.start + 0.1, 'numb'], [L.l15.start + 0.3, 'relaxed'], [T.dark, 'scared'], [L.l17.start + 0.4, 'scared'], [L.l18.start + 1.0, 'bored'], [T.power, 'surprise'], [W('l19', 'parecian') - 0.3, 'touched'],
    [L.l20.start, 'hopeful'], [L.l21.start + 0.3, 'proud'], [L.l22.start, 'joycry'], [W('l22', 'sonrei,') - 0.1, 'proud'], [L.l22b.start + 0.3, 'relaxed'], [W('l22b', 'quito') - 0.3, 'surprise'], [T.bracesOff + 0.6, 'touched'], [T.finalA - 0.3, 'touched'], [T.finalA + 0.2, 'radiant'], [L.l22d.start, 'radiant'], [L.l23.start + 0.15, 'surprise'], [W('l23', 'cejas?') - 0.2, 'wince'], [L.l24.start + 0.4, 'thinking'], [W('l24', 'Comenta') - 0.1, 'happy']];
  emoScript.sort((a, b) => a[0] - b[0]);
  const emoAt = (t) => { let i = 0; while (i < emoScript.length - 1 && emoScript[i + 1][0] <= t) i++;
    const cur = EMO[emoScript[i][1]], prev = EMO[emoScript[Math.max(0, i - 1)][1]]; const dur = mag(cur) >= mag(prev) ? 0.25 : 0.7; const u = smooth((t - emoScript[i][0]) / dur); const o = {};
    for (const k of Object.keys(cur)) o[k] = lerp(prev[k], cur[k], u); o._laugh = 0; return o; };

  // ----- gestos de brazos -----
  const IDLE_L = { x: -392, y: 335 }, IDLE_R = { x: 392, y: 335 };
  const G = [
    { arm: 'L', t0: L.l3.start, t1: T.crack + 0.6, tgt: () => ({ x: -360, y: 250 }) },                       // toma la mano de Mari
    { arm: 'R', t0: T.sit + 0.3, t1: T.crack + 0.6, tgt: () => ({ x: 340, y: 300 }) },                       // agarra el descansabrazos
    { arm: 'R', t0: L.l14.start, t1: L.l15.start + 0.8, tgt: () => ({ x: 130, y: -38 }) },                  // se toca la mejilla dormida
    { arm: 'B', t0: T.dark, t1: L.l18.start, tgt: (t, s) => ({ x: s * 120, y: 150 + Math.sin(t * 22) * 3 }) },   // se abraza del susto
    { arm: 'R', t0: W('l19', 'parecian'), t1: L.l20.start + 0.2, tgt: () => ({ x: 120, y: -60 }) },
    { arm: 'R', t0: W('l23', 'cejas?') - 0.2, t1: W('l23', 'cejas?') + 1.1, tgt: () => ({ x: 120, y: -290 }) }, // se tapa las cejas
    { arm: 'R', t0: W('l24', 'sigueme'), t1: DUR + 1, tgt: (t) => ({ x: 440 + Math.sin(t * 9) * 30, y: -205 }), wr: (t) => Math.sin(t * 9) * 16 },
  ];
  const armTarget = (t, side) => {
    const idle = side < 0 ? IDLE_L : IDLE_R; let x = idle.x + Math.sin(t * 1.1 + (side > 0 ? 1.3 : 0)) * 5, y = idle.y + Math.sin(t * 1.7) * 3, w = 0;
    for (const g of G) { if (!(g.arm === 'B' || (g.arm === 'R' && side > 0) || (g.arm === 'L' && side < 0))) continue;
      const k = smooth((t - g.t0) / 0.3) * (1 - smooth((t - (g.t1 - 0.3)) / 0.3)); if (k <= 0) continue; const tg = g.tgt(t, side); x = lerp(x, tg.x, k); y = lerp(y, tg.y, k); if (g.wr) w = lerp(w, g.wr(t), k); }
    return { x, y, w };
  };

  // ----- eventos de cabeza -----
  const EV = [{ t: L.l4.start + 0.4, type: 'nod', amp: 0.35 }, { t: W('l7', 'pantalla:') , type: 'recoil' }, { t: L.l8.start + 0.4, type: 'shake', amp: 0.5 }, { t: L.l10.start + 0.6, type: 'nod', amp: 0.4 },
    { t: T.crack, type: 'recoil' }, { t: T.dark, type: 'recoil' }, { t: T.power, type: 'recoil' }, { t: L.l21.start + 1.2, type: 'nod', amp: 0.6 }, { t: L.l22.start + 1.4, type: 'nod', amp: 0.4 }, { t: T.bracesOff, type: 'recoil' }, { t: T.finalA + 0.5, type: 'nod', amp: 0.5 },
    { t: L.l23.start + 0.2, type: 'recoil' }, { t: W('l24', 'sigueme'), type: 'nod', amp: 0.35 }];
  const evAt = (t) => { let yaw = 0, pitch = 0, hop = 0;
    for (const e of EV) { const d = t - e.t; if (d < 0 || d > 1.4) continue;
      if (e.type === 'nod') pitch += e.amp * Math.sin(2 * Math.PI * 2.0 * d) * Math.exp(-2.6 * d);
      else if (e.type === 'shake') yaw += e.amp * Math.sin(2 * Math.PI * 2.4 * d) * Math.exp(-2.4 * d);
      else if (e.type === 'recoil') pitch += -0.5 * Math.sin(Math.PI * clamp(d / 0.5)) * (d < 0.5 ? 1 : Math.exp(-3 * (d - 0.5))); }
    const sd = t - T.sit; if (sd > 0 && sd < 0.55) hop = -50 * Math.sin(Math.PI * sd / 0.55); // salto para subirse a la silla
    return { yaw, pitch, hop }; };
  const sobStarts = [L.l22.start + 0.2, L.l22.start + 1.3];
  const laughStart = 9999;

  // ----- simulacion de resortes (fisica de movimiento) -----
  const N = Math.ceil((DUR + 0.5) * 30) + 1, SUB = 8, DT = 1 / (30 * SUB);
  const spring = (x0 = 0) => ({ x: x0, v: 0 });
  const st = { yaw: spring(), pitch: spring(), roll: spring(), hgx: spring(), hgy: spring(), ex: spring(), ey: spring(), lean: spring(),
    aL1: spring(0), aL2: spring(0), aR1: spring(0), aR2: spring(0), wL: spring(), wR: spring() };
  const step = (s, target, w, z) => { const a = w * w * (target - s.x) - 2 * z * w * s.v; s.v += a * DT; s.x += s.v * DT; };
  { const a = solveArm(-1, IDLE_L), b = solveArm(1, IDLE_R); st.aL1.x = a.rot1; st.aL2.x = a.rot2; st.aR1.x = b.rot1; st.aR2.x = b.rot2; }
  const track = [];
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < SUB; k++) {
      const t = (i * SUB + k) * DT;
      const gz = kfAt(gazeKF, t, 2), sc = saccAt(t), e = emoAt(t), ev = evAt(t);
      const g = { x: clamp(gz[0] + sc.x, -1, 1), y: clamp(gz[1] + sc.y, -1, 1) };
      // cabeza: lenta, aporta una parte del giro; ojos: rapidos, compensan (VOR)
      step(st.hgx, 0.38 * g.x, 9, 0.85); step(st.hgy, 0.3 * g.y, 9, 0.85);
      step(st.ex, clamp(g.x - st.hgx.x), 70, 0.9); step(st.ey, clamp(g.y - st.hgy.x), 70, 0.9);
      const lc = e._laugh; const ph = 2 * Math.PI * 4.6 * Math.max(0, t - laughStart);
      const laughDecay = Math.exp(-Math.max(0, t - laughStart) * 0.55);
      step(st.yaw, kfAt(yawKF, t, 1)[0] + ev.yaw, 9, 0.85);
      step(st.pitch, e.pitch + ev.pitch + lc * laughDecay * Math.sin(ph) * 0.1, 11, 0.8);
      step(st.roll, e.roll + Math.sin(t * 0.8) * 0.7, 8, 0.85);
      step(st.lean, Math.sin(t * 2 * Math.PI / 5.3) * 7, 3, 1);        // cambio de peso lateral cada ~5 s
      const aL = armTarget(t, -1), aR = armTarget(t, 1), kL = solveArm(-1, aL), kR = solveArm(1, aR);
      step(st.aL1, kL.rot1, 13, 0.72); step(st.aL2, kL.rot2, 13, 0.72); step(st.aR1, kR.rot1, 13, 0.72); step(st.aR2, kR.rot2, 13, 0.72);
      step(st.wL, clamp(aL.w - 0.12 * st.aL2.v, -30, 30), 9, 0.5); step(st.wR, clamp(aR.w - 0.12 * st.aR2.v, -30, 30), 9, 0.5);
    }
    const t = i / 30;
    track.push({ yaw: st.yaw.x + st.hgx.x, pitch: st.pitch.x + st.hgy.x, roll: st.roll.x, ex: st.ex.x, ey: st.ey.x, lean: st.lean.x,
      L: { rot1: st.aL1.x, rot2: st.aL2.x, w: st.wL.x }, R: { rot1: st.aR1.x, rot2: st.aR2.x, w: st.wR.x } });
  }

  // ----- estado de los dientes -----
  const teethAt = (t) => {
    const fin = ramp(t, T.bracesOff, T.bracesOff + 0.5);
    const clean = Math.max(0.0, 0.35 * ramp(t, T.cleanA, T.cleanB) + 0.65 * ramp(t, T.whiteA, T.whiteB));
    const braces = ramp(t, T.bracketA, T.bracketB) * (t < T.bracesOff ? 1 : 0);
    const crooked = (1 - 0.1 * ramp(t, T.crack, T.crack + 1) - 0.4 * ramp(t, T.bracketA, T.bracketB)) * (1 - fin);
    const extra = t < T.crack + 0.02 ? 1 : 0;
    return { clean: Math.max(clean, fin), braces, crooked, extra, shine: fin > 0.9 };
  };
  const mouthOpenAt = (t) => { let k = 0; for (const [a, b] of T.mouthWins) k = Math.max(k, ramp(t, a, a + 0.35) * (1 - ramp(t, b - 0.3, b))); return k; };
  const skinAt = (t) => { const f = ramp(t, T.bracesOff, T.bracesOff + 1.5); return { acne: lerp(0.12, 0.03, f), mask: 0, dry: 0, foam: 0, patch: 0, glow: lerp(0.35, 0.9, f), red: 0 }; };

  return (t) => {
    const T0 = track[Math.min(N - 1, Math.max(0, Math.round(t * 30)))];
    const e = emoAt(t), ev = evAt(t);
    const breath = (1 - Math.cos((2 * Math.PI * t) / 4.3)) / 2;
    let sob = 0; for (const s of sobStarts) { const d = t - s; if (d >= 0 && d < 0.8) sob = Math.max(sob, d < 0.15 ? d / 0.15 : Math.exp(-(d - 0.15) * 4)); }
    const trem = e.tears > 0.4 ? Math.sin(t * 2 * Math.PI * 7) * 0.12 * e.tears : 0;
    const sh = shut(t); const bl = Math.max(blinkAt(t), slowBlink(t), sh);
    const lidDrop = Math.max(0, T0.ey) * 0.18;
    const mo = Math.max(e.baseOpen, mouthOpenAt(t) * 0.9);
    const scared = t >= T.dark && t < L.l18.start ? Math.sin(t * 40) * 0.5 : 0;
    return {
      yaw: T0.yaw, pitch: T0.pitch, roll: T0.roll, lean: T0.lean, hop: ev.hop, bob: Math.sin(t * 2 * Math.PI / 4.3) * 2.5,
      sway: T0.lean * 0.12, breath, shoulders: e.shoulders + breath * 0.18 + sob * 0.7 + scared * 0.3, flare: e.flare + breath * 0.3 + sob * 0.4,
      squint: e.squint, tears: e.tears, tearT: t,
      gaze: { x: T0.ex, y: T0.ey }, lid: { l: e.lid - lidDrop, r: e.lid - lidDrop }, blink: { l: bl, r: bl },
      brow: { l: { r: e.bl, i: e.bli }, r: { r: e.br, i: e.bri } },
      mouth: { open: mo, wide: clamp(e.wide, -1, 1), smile: e.smile + trem, asym: e.asym + trem * 0.5, press: e.press * (1 - mo), teeth: teethAt(t) },
      armL: T0.L, armR: T0.R, skin: skinAt(t),
      legs: { l: { thigh: T0.lean * 0.12, knee: Math.max(0, T0.lean) * 0.15 }, r: { thigh: T0.lean * 0.12, knee: Math.max(0, -T0.lean) * 0.15 } },
      teeth: teethAt(t),
    };
  };
}
