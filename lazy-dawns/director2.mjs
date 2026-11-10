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
  pain: E({ bli: 0.9, bri: 0.9, lid: 0.12, squint: 0.7, smile: -0.5, press: 0.4, pitch: 0.2, shoulders: 0.5 }),
  scream: E({ bl: 0.9, br: 0.9, bli: 0.6, bri: 0.6, lid: 1.25, smile: -0.2, baseOpen: 0.95, wide: -0.2, shoulders: 0.8, pitch: -0.3, flare: 0.7 }),
  scared: E({ bl: 0.8, br: 0.8, bli: 0.8, bri: 0.8, lid: 1.2, smile: -0.4, baseOpen: 0.25, shoulders: 0.7, pitch: 0.1 }),
  relaxed: E({ lid: 0.25, smile: 0.35, pitch: -0.1, bl: 0.1, br: 0.1 }),
  bored: E({ lid: 0.7, smile: -0.1, asym: 0.2, bl: 0, br: 0.1, pitch: 0.1 }),
  joycry: E({ bli: 0.5, bri: 0.5, bl: 0.2, br: 0.2, lid: 0.8, squint: 0.7, smile: 0.9, wide: 0.5, tears: 1, pitch: 0.1, roll: -3 }),
  proud: E({ bl: 0.25, br: 0.25, squint: 0.4, smile: 1, wide: 0.5, pitch: -0.3, roll: -3, shoulders: 0.3 }),
};
const mag = (e) => Math.abs(e.smile - 0.1) + Math.abs(e.bl) + Math.abs(e.br) + Math.abs(e.bli) + Math.abs(e.bri) + Math.abs(1 - e.lid) + e.squint + e.baseOpen + e.tears + e.press;

export function makeDirector(words, T, DUR, wt) {
  const R = rng(20250);
  const LAT = 0.2; // latencia de reaccion

  // ----- parpadeos -----
  const blinkStarts = []; { let t = 0.7; while (t < DUR) { blinkStarts.push(t); if (R() < 0.2) blinkStarts.push(t + 0.3); t += 2.2 + R() * 2.4; } }
  T.scenes.forEach((x) => blinkStarts.push(x + 0.05));
  const blinkAt = (t) => { let m = 0; for (const b of blinkStarts) { const d = t - b; if (d < 0 || d > 0.22) continue; const k = d < 0.07 ? d / 0.07 : d < 0.1 ? 1 : 1 - (d - 0.1) / 0.12; m = Math.max(m, clamp(k)); } return m; };
  const longBlink = wt('brillaba.') + 0.2; // parpadeo lento y emotivo
  const slowBlink = (t) => { const d = t - longBlink; return d < 0 || d > 0.5 ? 0 : d < 0.18 ? d / 0.18 : d < 0.28 ? 1 : 1 - (d - 0.28) / 0.22; };
  const winkT = 99999; const winkAt = (t) => { const d = t - winkT; return d < 0 || d > 0.7 ? 0 : d < 0.12 ? d / 0.12 : d < 0.5 ? 1 : 1 - (d - 0.5) / 0.2; };

  // ----- mirada (objetivo de contexto + micro-saccades) -----
  const sacc = []; { let t = 0; while (t < DUR) { sacc.push({ t, x: (R() - 0.5) * 0.24, y: (R() - 0.5) * 0.16 }); t += 0.35 + R() * 0.9; } }
  const saccAt = (t) => { let i = 0; while (i < sacc.length - 1 && sacc[i + 1].t <= t) i++; const a = sacc[i], p = sacc[Math.max(0, i - 1)]; const u = smooth((t - a.t) / 0.06); return { x: lerp(p.x, a.x, u), y: lerp(p.y, a.y, u) }; };
  const gazeKF = [[0, 0, 0], [T.clinic, 0, 0], [T.lupa, 0.15, 0.1], [T.dx, 0.65, -0.1], [T.clean, 0, 0.25], [T.timer - 0.3, 0.9, -0.1], [T.maskOff, 0, 0], [T.extract - 0.2, 0.7, 0], [T.panic, -0.7, 0],
    [T.aloe - 0.2, 0.6, -0.2], [T.normal, 0.6, 0], [T.redFade, 0, 0.1], [T.patches, 0.5, 0], [T.routine, 0.6, 0], [T.mirror, 0.85, 0.05], [T.glow + 1.2, 0.85, 0.05], [T.smile - 0.2, 0, 0], [T.smile + 0.6, -0.5, 0.1], [T.silence, 0.5, 0.1],
    [T.missing, 0, 0], [DUR, 0, 0]];
  const gazeStep = (() => { const out = []; for (let i = 1; i < gazeKF.length; i++) if (Math.hypot(gazeKF[i][1] - gazeKF[i - 1][1], gazeKF[i][2] - gazeKF[i - 1][2]) > 0.5) out.push(gazeKF[i - 1][0] + 0.02); return out; })();
  gazeStep.forEach((x) => blinkStarts.push(x)); // se parpadea al cambiar la mirada de forma grande
  const kfAt = (K, t, n) => { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++; const a = K[i], b = K[Math.min(i + 1, K.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0])); return Array.from({ length: n }, (_, k) => lerp(a[1 + k], b[1 + k], u)); };
  const yawKF = [[0, 0], [T.mirror - 0.2, 0], [T.mirror + 0.3, 0.5], [T.glow + 1.2, 0.5], [T.smile - 0.2, 0], [DUR, 0]];

  // ----- guion de emociones (con latencia de reaccion) -----
  const L = (t) => t + LAT;
  const emoScript = [[0, 'happy'], [wt('piel', 0), 'neutral'], [wt('casi'), 'hurt'], [L(wt('Mari', 0)), 'hopeful'], [L(wt('lupa')), 'wince'], [wt('respiró'), 'hurt'], [L(wt('tranquila,')), 'touched'], [wt('solución.') + 0.3, 'hopeful'],
    [wt('Primero,'), 'relaxed'], [wt('vapor.') - 0.4, 'relaxed'], [wt('mascarilla'), 'bored'], [wt('quince'), 'thinking'], [wt('quitaron,'), 'surprise'], [wt('temía:'), 'wince'], [wt('reventar'), 'scared'], [wt('Dolió,'), 'wince'],
    [wt('Yo', 1) + 0.2, 'pain'], [wt('Pop,', 0) - 0.2, 'pain'], [wt('pop.') + 0.7, 'serious'], [L(wt('cara')), 'surprise'], [L(wt('alergiado.')) - 0.8, 'scared'], [wt('grité') - 0.1, 'scream'], [wt('Pero') + 0.4, 'scared'],
    [wt('aloe') + 0.1, 'relaxed'], [wt('Es') , 'touched'], [wt('Poco'), 'hopeful'], [wt('parches,'), 'serious'], [wt('rutina:'), 'hopeful'], [wt('magia:'), 'proud'], [wt('miré'), 'serious'],
    [wt('piel', 1) - 0.4, 'touched'], [wt('Lloré.') - 0.2, 'joycry'], [wt('sonreí...') - 0.1, 'proud'], [L(wt('callados.')) - 1.2, 'awkward'], [wt('algo.') - 0.4, 'wince'], [wt('¿Qué') + 0.2, 'hopeful'], [wt('Comenta'), 'happy']];
  const emoAt = (t) => {
    let i = 0; while (i < emoScript.length - 1 && emoScript[i + 1][0] <= t) i++;
    const cur = EMO[emoScript[i][1]], prev = EMO[emoScript[Math.max(0, i - 1)][1]];
    const dur = mag(cur) >= mag(prev) ? 0.25 : 0.7;                 // aparece rapido, se va despacio
    const u = smooth((t - emoScript[i][0]) / dur); const o = {};
    for (const k of Object.keys(cur)) o[k] = lerp(prev[k], cur[k], u);
    const lc = emoScript[i][1] === 'laugh' ? u : emoScript[Math.max(0, i - 1)][1] === 'laugh' ? 1 - u : 0;
    o._laugh = lc; o._cur = emoScript[i][1]; o._t0 = emoScript[i][0]; return o;
  };
  const laughStart = 9999, laughEnd = 9999;

  // ----- gestos de brazos (objetivos de la mano -> IK -> resortes en articulaciones) -----
  const IDLE_L = { x: -392, y: 335 }, IDLE_R = { x: 392, y: 335 };
  const circ = (t, s, r = 20) => ({ x: s * (150 + Math.cos(t * 2 * Math.PI * 2.2) * r), y: -132 + Math.sin(t * 2 * Math.PI * 2.2) * r });
  const G = [
    { arm: 'R', t0: 0.15, t1: 1.5, tgt: (t) => ({ x: 438 + Math.sin(t * 9) * 30, y: -205 }), wr: (t) => Math.sin(t * 9) * 16 },
    { arm: 'B', t0: wt('casi') + 0.2, t1: wt('arrepiento.') + 0.8, tgt: (t, s) => ({ x: s * 110, y: 300 }) },
    { arm: 'B', t0: T.lupa, t1: wt('solución.') - 0.2, tgt: (t, s) => ({ x: s * 120, y: 296 }) },
    { arm: 'B', t0: wt('Primero,') + 0.4, t1: wt('Luego,') - 0.3, tgt: (t, s) => circ(t, s) },
    { arm: 'B', t0: wt('reventar') + 0.3, t1: wt('Dolió,') + 0.5, tgt: (t, s) => ({ x: s * 126, y: 170 + Math.sin(t * 22) * 3 }) },
    { arm: 'B', t0: wt('Yo', 1) + 0.1, t1: wt('pop.') + 0.8, tgt: (t, s) => ({ x: s * 150, y: -118 + Math.sin(t * 20) * 3 }) },
    { arm: 'B', t0: L(wt('cara')), t1: wt('Pero') + 0.2, tgt: (t, s) => ({ x: s * 168, y: -96 + Math.sin(t * 18) * 6 }) },
    { arm: 'R', t0: wt('piel', 1) - 0.1, t1: wt('brillaba.') + 0.9, tgt: () => ({ x: 150, y: -140 }) },
    { arm: 'B', t0: wt('Lloré.') - 0.1, t1: wt('Mari', 3) + 0.6, tgt: (t, s) => ({ x: s * 150, y: -128 + Math.sin(t * 10) * 3 }) },
    { arm: 'R', t0: wt('sígueme') - 0.2, t1: DUR + 1, tgt: (t) => ({ x: 440 + Math.sin(t * 9) * 30, y: -205 }), wr: (t) => Math.sin(t * 9) * 16 },
  ];
  const armTarget = (t, side) => {
    const idle = side < 0 ? IDLE_L : IDLE_R; let x = idle.x + Math.sin(t * 1.1 + (side > 0 ? 1.3 : 0)) * 5, y = idle.y + Math.sin(t * 1.7) * 3, w = 0;
    for (const g of G) {
      if (!(g.arm === 'B' || (g.arm === 'R' && side > 0) || (g.arm === 'L' && side < 0))) continue;
      const k = smooth((t - g.t0) / 0.3) * (1 - smooth((t - (g.t1 - 0.3)) / 0.3)); if (k <= 0) continue;
      const tg = g.tgt(t, side); x = lerp(x, tg.x, k); y = lerp(y, tg.y, k); if (g.wr) w = lerp(w, g.wr(t), k);
    }
    return { x, y, w };
  };

  // ----- eventos de cabeza (semantica: asentir vertical, negar horizontal) -----
  const EV = [
    { t: 0.2, type: 'nod', amp: 0.4 }, { t: L(wt('tranquila,')), type: 'nod', amp: 0.5 }, { t: L(wt('cara')), type: 'recoil' }, { t: L(wt('alergiado.')), type: 'shake', amp: 0.6 },
    { t: wt('Es'), type: 'nod', amp: 0.4 }, { t: wt('rutina:') + 0.2, type: 'nod', amp: 0.4 }, { t: wt('magia:') + 0.2, type: 'nod', amp: 0.5 }, { t: wt('sonreí...') + 0.1, type: 'nod', amp: 0.35 },
    { t: wt('sígueme'), type: 'nod', amp: 0.35 },
  ];
  const evAt = (t) => {
    let yaw = 0, pitch = 0, hop = 0;
    for (const e of EV) { const d = t - e.t; if (d < 0 || d > 1.4) continue;
      if (e.type === 'nod') pitch += e.amp * Math.sin(2 * Math.PI * 2.0 * d) * Math.exp(-2.6 * d);
      else if (e.type === 'shake') yaw += e.amp * Math.sin(2 * Math.PI * 2.4 * d) * Math.exp(-2.4 * d);
      else if (e.type === 'recoil') pitch += -0.5 * Math.sin(Math.PI * clamp(d / 0.5)) * (d < 0.5 ? 1 : Math.exp(-3 * (d - 0.5)));
      else if (e.type === 'hop') hop += d < 0.5 ? -26 * Math.sin(Math.PI * d / 0.5) : 0; }
    return { yaw, pitch, hop };
  };
  const sobStarts = [wt('Lloré.'), wt('Lloré.') + 1.1, wt('Mari', 3) + 0.3];

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

  const ramp = (t, a, b) => smooth((t - a) / Math.max(1e-3, b - a));
  const skinAt = (t) => {
    const pop = (tp) => ramp(t, tp, tp + 0.15);
    let acne = 1 - 0.15 * ramp(t, wt('quitaron,') + 0.4, wt('quitaron,') + 1.2) - 0.25 * pop(wt('Pop,', 0)) - 0.25 * pop(wt('Pop,', 1)) - 0.2 * pop(wt('pop.')) - 0.07 * ramp(t, wt('parches,'), wt('crema,')) - 0.04 * ramp(t, T.glow, T.glow + 1);
    const foam = ramp(t, wt('Primero,') + 0.3, wt('Primero,') + 0.9) * (1 - ramp(t, wt('Luego,') - 0.4, wt('Luego,')));
    const mask = ramp(t, wt('mascarilla') - 0.2, wt('mascarilla') + 0.8) * (1 - ramp(t, wt('quitaron,') - 0.1, wt('quitaron,') + 0.8));
    const dry = ramp(t, wt('quince'), wt('paciencia.')) * (1 - ramp(t, wt('quitaron,') - 0.1, wt('quitaron,') + 0.5));
    const red = ramp(t, wt('cara') - 0.1, wt('cara') + 0.8) * (1 - 0.3 * ramp(t, wt('aloe'), wt('aloe') + 0.8) - 0.2 * ramp(t, wt('compresa'), wt('compresa') + 0.8)) * (1 - ramp(t, wt('Poco'), wt('fue.') + 0.2));
    const patch = ramp(t, wt('parches,') - 0.1, wt('parches,') + 0.4) * (1 - ramp(t, wt('rutina:') - 0.2, wt('rutina:') + 0.8));
    const glow = ramp(t, T.glow, wt('brillaba.'));
    return { acne: Math.max(0.05, acne), foam, mask, dry, red, patch, glow };
  };
  return (t) => {
    const T0 = track[Math.min(N - 1, Math.max(0, Math.round(t * 30)))];
    const e = emoAt(t), ev = evAt(t);
    const lc = e._laugh, laughDecay = Math.exp(-Math.max(0, t - laughStart) * 0.55), ph = 2 * Math.PI * 4.6 * Math.max(0, t - laughStart);
    const burst = lc * laughDecay * Math.sin(ph), pulse = lc * (0.55 + 0.45 * laughDecay) * Math.abs(Math.sin(ph / 2));
    const breath = (1 - Math.cos((2 * Math.PI * t) / 4.3)) / 2;                          // ~14 respiraciones/min
    let sob = 0; for (const s of sobStarts) { const d = t - s; if (d >= 0 && d < 0.8) sob = Math.max(sob, d < 0.15 ? d / 0.15 : Math.exp(-(d - 0.15) * 4)); }
    const trem = e.tears > 0.4 ? Math.sin(t * 2 * Math.PI * 7) * 0.12 * e.tears : 0;      // temblor del labio al llorar
    const bl = Math.max(blinkAt(t), slowBlink(t)), wk = winkAt(t);
    const lidDrop = Math.max(0, T0.ey) * 0.18;
    const mouthOpen = clamp(e.baseOpen + lc * 0.35 * pulse);                              // NO hay sincronia labial: ella no habla
    return {
      yaw: T0.yaw, pitch: T0.pitch, roll: T0.roll, lean: T0.lean, hop: ev.hop, bob: Math.sin(t * 2 * Math.PI / 4.3) * 2.5 + burst * 4,
      sway: T0.lean * 0.12, breath: breath + Math.abs(burst) * 0.6, shoulders: e.shoulders + breath * 0.18 + sob * 0.7 + burst * 0.6, flare: e.flare + breath * 0.3 + sob * 0.4,
      squint: e.squint, tears: e.tears, tearT: t,
      gaze: { x: T0.ex, y: T0.ey }, lid: { l: e.lid - lidDrop, r: e.lid - lidDrop }, blink: { l: bl, r: Math.max(bl, wk) },
      brow: { l: { r: e.bl, i: e.bli }, r: { r: e.br, i: e.bri } },
      mouth: { open: mouthOpen, wide: clamp(e.wide, -1, 1), smile: e.smile + trem, asym: e.asym + trem * 0.5, press: e.press },
      armL: T0.L, armR: T0.R, skin: skinAt(t),
      legs: { l: { thigh: T0.lean * 0.12, knee: Math.max(0, T0.lean) * 0.15 }, r: { thigh: T0.lean * 0.12, knee: Math.max(0, -T0.lean) * 0.15 } },
    };
  };
}
