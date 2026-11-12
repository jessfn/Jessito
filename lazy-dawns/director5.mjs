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
  const R = rng(5150);
  const LAT = 0.2;
  const nmz = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zñ0-9]/g, '');
  const W = (id, w, n = 0) => { const r = L[id].words.filter((x) => nmz(x[0]) === nmz(w))[n]; if (!r) throw new Error('palabra no encontrada ' + id + ' ' + w); return r[1]; };
  const ramp = (t, a, b) => smooth((t - a) / Math.max(1e-3, b - a));

  const blinkStarts = []; { let t = 0.8; while (t < DUR) { blinkStarts.push(t); if (R() < 0.2) blinkStarts.push(t + 0.3); t += 2.2 + R() * 2.4; } }
  T.scenes.forEach((x) => blinkStarts.push(x + 0.05));
  const blinkAt = (t) => { let m = 0; for (const b of blinkStarts) { const d = t - b; if (d < 0 || d > 0.22) continue; const k = d < 0.07 ? d / 0.07 : d < 0.1 ? 1 : 1 - (d - 0.1) / 0.12; m = Math.max(m, clamp(k)); } return m; };
  const shut = (t) => Math.max(ramp(t, T.laserA - 0.2, T.laserA + 0.2) * (1 - ramp(t, T.laserB, T.laserB + 0.3)), ramp(t, T.needleA, T.needleA + 0.2) * (1 - ramp(t, T.needleA + 1.0, T.needleA + 1.3)));
  const slowBlink = (t) => { const d = t - T.reveal; return d < 0 || d > 0.5 ? 0 : d < 0.18 ? d / 0.18 : d < 0.28 ? 1 : 1 - (d - 0.28) / 0.22; };

  const sacc = []; { let t = 0; while (t < DUR) { sacc.push({ t, x: (R() - 0.5) * 0.2, y: (R() - 0.5) * 0.14 }); t += 0.35 + R() * 0.9; } }
  const saccAt = (t) => { let i = 0; while (i < sacc.length - 1 && sacc[i + 1].t <= t) i++; const a = sacc[i], p = sacc[Math.max(0, i - 1)]; const u = smooth((t - a.t) / 0.06); return { x: lerp(p.x, a.x, u), y: lerp(p.y, a.y, u) }; };
  const gazeKF = [[0, 0, 0]], yawKF = [[0, 0]];
  Object.keys(L).forEach((id) => { const l = L[id]; const gx = l.who === 'M' ? -0.78 : (l.who === 'S' || l.who === 'K') ? 0.78 : 0; gazeKF.push([l.start - 0.12, gx, 0.05]); yawKF.push([l.start - 0.12, gx * 0.34]); });
  gazeKF.push([T.mirrorStart, 0.0, 0.0]); yawKF.push([T.mirrorStart, 0.0]);
  gazeKF.sort((a, b) => a[0] - b[0]); yawKF.sort((a, b) => a[0] - b[0]); gazeKF.push([DUR, 0, 0]); yawKF.push([DUR, 0]);
  const kfAt = (K, t, n) => { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++; const a = K[i], b = K[Math.min(i + 1, K.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, Math.min(0.3, b[0] - a[0]))); return Array.from({ length: n }, (_, k) => lerp(a[1 + k], b[1 + k], u)); };
  gazeKF.forEach((g) => { if (Math.hypot(g[1], g[2]) > 0.5) blinkStarts.push(g[0] + 0.02); });

  const emoScript = [[0, 'neutral'], [T.slateEnd, 'wince'], [L.l2.start, 'awkward'], [L.l3.start + 0.3, 'surprise'], [L.l4.start + 0.3, 'scared'], [L.l5.start + 0.3, 'scared'], [L.l6.start + 0.3, 'hopeful'], [L.l7.start, 'scared'], [T.laserA, 'pain'], [T.laserB, 'numb'],
    [L.l8.start + 0.3, 'relaxed'], [L.l9.start, 'touched'], [L.l10.start, 'happy'], [L.l11.start + 0.3, 'hopeful'], [T.ghostA, 'surprise'], [L.l13.start, 'scared'], [L.l14.start + 0.3, 'wince'], [L.l15.start + 0.3, 'hopeful'], [T.matchB - 0.3, 'touched'],
    [L.l16.start, 'relaxed'], [L.l17.start, 'relaxed'], [T.mirrorStart, 'touched'], [T.mirrorStart + 1.4, 'joycry'], [L.l18.end - 2.4, 'radiant'], [L.l19.start, 'radiant'], [L.l20.start + 0.2, 'thinking'], [L.l21.start + 0.1, 'surprise'], [L.l22.start + 0.2, 'wince'], [W('l22', 'Comenta') - 0.1, 'happy']];
  emoScript.sort((a, b) => a[0] - b[0]);
  const emoAt = (t) => { let i = 0; while (i < emoScript.length - 1 && emoScript[i + 1][0] <= t) i++;
    const cur = EMO[emoScript[i][1]], prev = EMO[emoScript[Math.max(0, i - 1)][1]]; const dur = mag(cur) >= mag(prev) ? 0.25 : 0.7; const u = smooth((t - emoScript[i][0]) / dur); const o = {};
    for (const k of Object.keys(cur)) o[k] = lerp(prev[k], cur[k], u); o._laugh = 0; return o; };

  const IDLE_L = { x: -392, y: 335 }, IDLE_R = { x: 392, y: 335 };
  const G = [
    { arm: 'B', t0: T.sit + 0.3, t1: T.weekA, tgt: (t, s) => ({ x: s * 340, y: 300 }) },
    { arm: 'R', t0: L.l9.start + 0.2, t1: L.l9.end, tgt: () => ({ x: 258, y: -90 }) },
    { arm: 'B', t0: T.ghostA + 0.1, t1: L.l13.end + 0.2, tgt: (t, s) => ({ x: s * 246, y: -118 + Math.sin(t * 20) * 4 }) },
    { arm: 'B', t0: L.l16.start, t1: L.l17.end, tgt: (t, s) => ({ x: s * 345, y: 300 }) },
    { arm: 'B', t0: T.mirrorStart + 1.0, t1: L.l19.end, tgt: (t, s) => ({ x: s * 350, y: 250 + Math.sin(t * 3) * 12 }) },
    { arm: 'R', t0: W('l22', 'sigueme'), t1: DUR + 1, tgt: (t) => ({ x: 440 + Math.sin(t * 9) * 30, y: -205 }), wr: (t) => Math.sin(t * 9) * 16 },
  ];
  const armTarget = (t, side) => {
    const idle = side < 0 ? IDLE_L : IDLE_R; let x = idle.x + Math.sin(t * 1.1 + (side > 0 ? 1.3 : 0)) * 5, y = idle.y + Math.sin(t * 1.7) * 3, w = 0;
    for (const g of G) { if (!(g.arm === 'B' || (g.arm === 'R' && side > 0) || (g.arm === 'L' && side < 0))) continue;
      const k = smooth((t - g.t0) / 0.3) * (1 - smooth((t - (g.t1 - 0.3)) / 0.3)); if (k <= 0) continue; const tg = g.tgt(t, side); x = lerp(x, tg.x, k); y = lerp(y, tg.y, k); if (g.wr) w = lerp(w, g.wr(t), k); }
    return { x, y, w };
  };

  const EV = [{ t: L.l3.start + 0.4, type: 'recoil' }, { t: T.laserA, type: 'recoil' }, { t: L.l9.start + 0.8, type: 'nod', amp: 0.4 }, { t: T.ghostA, type: 'recoil' }, { t: L.l13.start + 0.5, type: 'shake', amp: 0.6 },
    { t: T.matchB, type: 'nod', amp: 0.45 }, { t: T.mirrorStart + 1.6, type: 'nod', amp: 0.4 }, { t: L.l21.start + 0.1, type: 'recoil' }, { t: W('l22', 'sigueme'), type: 'nod', amp: 0.35 }];
  const evAt = (t) => { let yaw = 0, pitch = 0, hop = 0;
    for (const e of EV) { const d = t - e.t; if (d < 0 || d > 1.4) continue;
      if (e.type === 'nod') pitch += e.amp * Math.sin(2 * Math.PI * 2.0 * d) * Math.exp(-2.6 * d);
      else if (e.type === 'shake') yaw += e.amp * Math.sin(2 * Math.PI * 2.4 * d) * Math.exp(-2.4 * d);
      else if (e.type === 'recoil') pitch += -0.5 * Math.sin(Math.PI * clamp(d / 0.5)) * (d < 0.5 ? 1 : Math.exp(-3 * (d - 0.5))); }
    const sd = t - T.sit; if (sd > 0 && sd < 0.55) hop = -50 * Math.sin(Math.PI * sd / 0.55);
    return { yaw, pitch, hop }; };
  const sobStarts = [T.mirrorStart + 0.6, T.mirrorStart + 1.7];
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

  // ----- maquillaje y lunar -----
  const makeupAt = (t) => {
    const pale = t < T.matchA;
    const found = pale ? ramp(t, T.foundA, T.foundA + 2.2) : ramp(t, T.matchA, T.matchB - 0.4);
    return { mole: 1 - ramp(t, T.laserA + 0.5, T.laserA + 1.1), scab: ramp(t, T.laserA + 1.0, T.laserA + 1.6) * (1 - ramp(t, T.weekA, T.weekA + 1.0)),
      found, shade: pale ? 'pale' : 'match', contour: ramp(t, T.contourA, T.contourA + 1.2), highlight: ramp(t, T.hiA, T.hiA + 1.2), blush: ramp(t, T.contourA - 0.3, T.contourA + 0.8),
      shadow: ramp(t, T.shadowA, T.shadowA + 1.2), liner: ramp(t, T.linerA, T.linerA + 1.0), lash: ramp(t, T.lashA, T.lashA + 1.0) };
  };
  const TEETH = { clean: 1, braces: 0, crooked: 0, extra: 0, shine: true };
  const skinAt = (t) => ({ acne: 0.03, mask: 0, dry: 0, foam: 0, patch: 0, glow: 0.9, red: 0 });
  const HAIR = { s: 1, len: 1, cut: 0, foam: 0, frizz: 0, wet: 0, green: 0, shine: 0.9, sway: 0.3 };

  return (t) => {
    const T0 = track[Math.min(N - 1, Math.max(0, Math.round(t * 30)))];
    const e = emoAt(t), ev = evAt(t);
    const breath = (1 - Math.cos((2 * Math.PI * t) / 4.3)) / 2;
    let sob = 0; for (const s of sobStarts) { const d = t - s; if (d >= 0 && d < 0.8) sob = Math.max(sob, d < 0.15 ? d / 0.15 : Math.exp(-(d - 0.15) * 4)); }
    const trem = e.tears > 0.4 ? Math.sin(t * 2 * Math.PI * 7) * 0.12 * e.tears : 0;
    const sh = shut(t); const bl = Math.max(blinkAt(t), slowBlink(t), sh);
    const lidDrop = Math.max(0, T0.ey) * 0.18;
    const lip = t >= T.glossA ? '#e0788f' : undefined;
    return {
      yaw: T0.yaw, pitch: T0.pitch, roll: T0.roll, lean: T0.lean, hop: ev.hop, bob: Math.sin(t * 2 * Math.PI / 4.3) * 2.5,
      sway: T0.lean * 0.12, breath, shoulders: e.shoulders + breath * 0.18 + sob * 0.7, flare: e.flare + breath * 0.3 + sob * 0.4,
      squint: e.squint, tears: e.tears, tearT: t,
      gaze: { x: T0.ex, y: T0.ey }, lid: { l: e.lid - lidDrop, r: e.lid - lidDrop }, blink: { l: bl, r: bl },
      brow: { l: { r: e.bl, i: e.bli }, r: { r: e.br, i: e.bri } },
      mouth: { open: e.baseOpen, wide: clamp(e.wide, -1, 1), smile: e.smile + trem, asym: e.asym + trem * 0.5, press: e.press * (1 - e.baseOpen), teeth: TEETH, lip },
      armL: T0.L, armR: T0.R, skin: skinAt(t), hair: { ...HAIR, sway: Math.sin(t * 1.3) * 0.25 }, makeup: makeupAt(t),
      legs: { l: { thigh: T0.lean * 0.12, knee: Math.max(0, T0.lean) * 0.15 }, r: { thigh: T0.lean * 0.12, knee: Math.max(0, -T0.lean) * 0.15 } },
      teeth: TEETH,
    };
  };
}
