// Director de actuacion de Lazy Dawns: convierte el guion (tiempos de cada palabra) en una pose por fotograma.
// Principios aplicados (investigados): parpadeo espontaneo 100-150 ms cada 2-4.5 s al hablar; micro-saccades de la mirada;
// cejas que enfatizan palabras; boca por visemas (Preston Blair) sincronizada por letra; sonrisa real = boca + mejillas (AU6+AU12);
// primero se bloquean las poses de emocion y luego se agrega la boca; anticipacion/seguimiento en cabeza y brazos.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------- emociones (bloqueo de poses) ----------
const E = (o) => ({ bl: 0, bli: 0, br: 0, bri: 0, lid: 1, squint: 0, smile: 0.1, wide: 0, asym: 0, press: 0, baseOpen: 0, roll: 0, pitch: 0, tears: 0, shoulders: 0, flare: 0, ...o });
const EMO = {
  neutral: E({}),
  happy: E({ bl: 0.3, br: 0.3, lid: 1, squint: 0.35, smile: 0.9, wide: 0.3, roll: -2 }),
  sad: E({ bli: 0.8, bri: 0.8, bl: -0.1, br: -0.1, lid: 0.82, smile: -0.7, tears: 0.9, pitch: 0.5, roll: -5, shoulders: -0.4 }),
  touched: E({ bli: 0.6, bri: 0.6, lid: 0.9, smile: 0.35, tears: 0.55, pitch: 0.25, roll: -3 }),
  surprise: E({ bl: 0.9, br: 0.9, bli: 0.1, bri: 0.1, lid: 1.25, smile: 0.1, baseOpen: 0.25, wide: -0.3, shoulders: 0.7, flare: 0.5 }),
  hopeful: E({ bl: 0.45, br: 0.45, bli: 0.5, bri: 0.5, lid: 1.1, smile: 0.35, roll: -3 }),
  laugh: E({ bl: 0.3, br: 0.3, lid: 0.12, squint: 1, smile: 1, wide: 0.8, baseOpen: 0.55, roll: 8, pitch: -0.4, shoulders: 0.5 }),
  hurt: E({ bli: 0.7, bri: 0.7, bl: -0.1, br: -0.1, lid: 0.8, smile: -0.5, tears: 0.3, pitch: 0.35, roll: 4, shoulders: -0.3 }),
  thinking: E({ bl: 0.65, br: 0.1, lid: 0.9, smile: -0.05, asym: 0.6, roll: 4, pitch: -0.1 }),
  serious: E({ lid: 0.95, smile: 0.0, bl: 0.05, br: 0.05 }),
  wince: E({ bli: 0.5, bri: 0.5, lid: 0.85, squint: 0.25, smile: -0.25, asym: -0.3, pitch: 0.2 }),
  awkward: E({ bl: 0.3, br: 0.15, lid: 1, squint: 0.3, smile: 0.7, wide: 0.6, asym: 0.4, roll: 3 }),
  determined: E({ bl: -0.2, br: -0.2, bli: -0.7, bri: -0.7, lid: 0.9, smile: 0.1, press: 0.8, pitch: -0.4, shoulders: 0.4 }),
  proud: E({ bl: 0.25, br: 0.25, lid: 1, squint: 0.4, smile: 1, wide: 0.5, pitch: -0.3, roll: -3, shoulders: 0.3 }),
};

// ---------- visemas por letra (espanol) ----------
const VOW = { a: [0.9, 0.15, 0], e: [0.55, 0.75, 0], i: [0.3, 1, 0], o: [0.65, -0.55, 0], u: [0.4, -1, 0] };
function letterShape(ch) {
  if (VOW[ch]) return VOW[ch];
  if ('mbp'.includes(ch)) return [0, 0, 1];
  if ('fv'.includes(ch)) return [0.16, 0.45, 0];
  if ('wq'.includes(ch)) return [0.3, -0.8, 0];
  return [0.27, 0.2, 0];
}
const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ]/g, '');
function buildVisemes(words) {
  const A = [];
  words.forEach(([w, s, e], idx) => {
    const L = [...norm(w)]; if (!L.length) return;
    const prevEnd = idx ? words[idx - 1][2] : -9, nextStart = idx < words.length - 1 ? words[idx + 1][1] : 99;
    if (s - prevEnd > 0.11) A.push({ t: s - 0.05, v: [0, 0, 0] });
    L.forEach((c, i) => A.push({ t: s + ((i + 0.5) / L.length) * (e - s), v: letterShape(c) }));
    if (nextStart - e > 0.11) A.push({ t: e + 0.04, v: [0, 0, 0] });
  });
  A.sort((a, b) => a.t - b.t);
  return (t) => {
    if (!A.length || t < A[0].t || t > A[A.length - 1].t) return { open: 0, wide: 0, press: 0 };
    let lo = 0, hi = A.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (A[m].t <= t) lo = m; else hi = m; }
    const a = A[lo], b = A[hi], u = smooth((t - a.t) / Math.max(1e-3, b.t - a.t));
    return { open: lerp(a.v[0], b.v[0], u), wide: lerp(a.v[1], b.v[1], u), press: lerp(a.v[2], b.v[2], u) };
  };
}

export function makeDirector(words, T, DUR, wt) {
  const R = rng(20250);
  const visemeAt = buildVisemes(words);

  // ----- parpadeos espontaneos (+ en cambios de escena) -----
  const blinkStarts = []; { let t = 0.7; while (t < DUR) { blinkStarts.push(t); if (R() < 0.2) blinkStarts.push(t + 0.3); t += 2.2 + R() * 2.4; } }
  [T.open, T.close, T.mirror, T.sparkle, T.d30, T.vote, T.mirOut].forEach((x) => blinkStarts.push(x + 0.05));
  const blinkAt = (t) => { let m = 0; for (const b of blinkStarts) { const d = t - b; if (d < 0 || d > 0.22) continue; const k = d < 0.07 ? d / 0.07 : d < 0.1 ? 1 : 1 - (d - 0.1) / 0.12; m = Math.max(m, clamp(k)); } return m; };
  const winkT = wt('vemos'); const winkAt = (t) => { const d = t - winkT; return d < 0 || d > 0.7 ? 0 : d < 0.12 ? d / 0.12 : d < 0.5 ? 1 : 1 - (d - 0.5) / 0.2; };

  // ----- micro-saccades -----
  const sacc = []; { let t = 0; while (t < DUR) { sacc.push({ t, x: (R() - 0.5) * 0.26, y: (R() - 0.5) * 0.18 }); t += 0.35 + R() * 0.9; } }
  const saccAt = (t) => { let i = 0; while (i < sacc.length - 1 && sacc[i + 1].t <= t) i++; const a = sacc[i], p = sacc[Math.max(0, i - 1)]; const u = smooth((t - a.t) / 0.07); return { x: lerp(p.x, a.x, u), y: lerp(p.y, a.y, u) }; };

  // ----- mirada de contexto -----
  const gazeKF = [[0, 0, 0], [T.notif - 0.1, 0, 0], [T.notif + 0.2, 0.35, 0.65], [T.open + 0.3, 0.7, -0.5], [T.m5, 0.1, 0.75], [T.m6 + 0.2, 0.7, -0.5], [wt('pensando.') - 0.4, -0.55, -0.7],
    [T.close + 0.2, 0.0, 0.1], [T.mirror + 0.3, 0.85, 0.05], [T.sparkle - 0.2, 0.85, 0.05], [T.sparkle + 0.2, 0, 0], [DUR, 0, 0]];
  const kfAt = (K, t, n) => { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++; const a = K[i], b = K[Math.min(i + 1, K.length - 1)]; const u = smooth((t - a[0]) / Math.max(1e-3, b[0] - a[0])); return Array.from({ length: n }, (_, k) => lerp(a[1 + k], b[1 + k], u)); };
  const yawKF = [[0, 0], [T.notif, 0.1], [T.open + 0.3, 0.35], [T.close, 0.2], [T.mirror + 0.2, 0.5], [T.sparkle - 0.2, 0.5], [T.sparkle + 0.3, 0], [DUR, 0]];

  // ----- guion de emociones -----
  const emoScript = [[0, 'happy'], [wt('mensaje') - 0.2, 'neutral'], [wt('casi') - 0.1, 'sad'], [wt('Mi') - 0.1, 'happy'], [wt('casting') - 0.05, 'surprise'], [wt('tienes') - 0.1, 'hopeful'],
    [wt('una') + 0.0, 'laugh'], [wt('¿Yo,') - 0.1, 'hurt'], [wt('Pero') + 0.0, 'hopeful'], [wt('nadie') - 0.2, 'touched'], [wt('pensando.') - 0.5, 'thinking'], [wt('paré') + 0.3, 'serious'],
    [wt('piel,', 0) - 0.15, 'wince'], [wt('cejas,', 0) - 0.15, 'wince'], [wt('sonrisa...') - 0.2, 'awkward'], [wt('por') + 0.0, 'touched'], [wt('ganas') - 0.2, 'determined'],
    [wt('treinta') - 0.2, 'proud'], [wt('Piel,', 1) - 0.3, 'happy'], [wt('Pero', 1) - 0.1, 'hopeful'], [wt('decides') - 0.1, 'happy'], [wt('Hoy') - 0.1, 'hopeful'], [wt('Vota') - 0.1, 'happy']];
  const emoAt = (t) => { let i = 0; while (i < emoScript.length - 1 && emoScript[i + 1][0] <= t) i++; const cur = EMO[emoScript[i][1]], prev = EMO[emoScript[Math.max(0, i - 1)][1]]; const u = smooth((t - emoScript[i][0]) / 0.38); const o = {}; for (const k of Object.keys(cur)) o[k] = lerp(prev[k], cur[k], u); o._laugh = emoScript[i][1] === 'laugh' ? u : emoScript[Math.max(0, i - 1)][1] === 'laugh' ? 1 - u : 0; return o; };

  // ----- gestos de brazos (objetivos de la mano para el IK) -----
  const IDLE_L = { x: -392, y: 335 }, IDLE_R = { x: 392, y: 335 };
  const G = [
    { arm: 'R', t0: wt('Hola,') - 0.1, t1: wt('Lazy.') + 0.9, tgt: (t) => ({ x: 438 + Math.sin(t * 10) * 34, y: -205 }), wr: (t) => Math.sin(t * 10) * 14 },
    { arm: 'R', t0: wt('casi') - 0.1, t1: wt('llorar.') + 0.9, tgt: () => ({ x: 62, y: 130 }) },
    { arm: 'B', t0: wt('casting') - 0.05, t1: wt('modelos...') + 0.55, tgt: (t, s) => ({ x: s * 252, y: 18 }) },
    { arm: 'B', t0: wt('una'), t1: wt('¿Yo,') - 0.15, tgt: (t, s) => ({ x: s * 116, y: 318 + Math.sin(t * 13) * 10 }) },
    { arm: 'B', t0: wt('modelo?') - 0.1, t1: wt('Mírame.') + 0.4, tgt: (t, s) => ({ x: s * 342, y: 150 }) },
    { arm: 'R', t0: wt('piel,', 0) - 0.2, t1: wt('piel,', 0) + 0.9, tgt: () => ({ x: 150, y: -150 }) },
    { arm: 'R', t0: wt('cejas,', 0) - 0.15, t1: wt('cejas,', 0) + 0.9, tgt: () => ({ x: 118, y: -288 }) },
    { arm: 'R', t0: wt('sonrisa...') - 0.15, t1: wt('sonrisa...') + 0.9, tgt: () => ({ x: 98, y: -112 }) },
    { arm: 'R', t0: wt('treinta') - 0.1, t1: wt('transformarme.') + 0.2, tgt: () => ({ x: 352, y: -268 }) },
    { arm: 'B', t0: wt('Pero', 1), t1: wt('paso.') + 0.3, tgt: (t, s) => ({ x: s * 336, y: 132 }) },
    { arm: 'R', t0: wt('nos') - 0.1, t1: DUR, tgt: (t) => ({ x: 440 + Math.sin(t * 10) * 34, y: -205 }), wr: (t) => Math.sin(t * 10) * 14 },
  ];
  const armAt = (t, side) => {
    const idle = side < 0 ? IDLE_L : IDLE_R; let x = idle.x, y = idle.y, w = 0;
    // balanceo pasivo
    x += Math.sin(t * 1.3 + (side > 0 ? 1 : 0)) * 6; y += Math.sin(t * 1.9) * 4;
    for (const g of G) { if (!(g.arm === 'B' || (g.arm === 'R' && side > 0) || (g.arm === 'L' && side < 0))) continue;
      const k = smooth((t - g.t0) / 0.32) * (1 - smooth((t - (g.t1 - 0.3)) / 0.3)); if (k <= 0) continue; const tg = g.tgt(t, side); x = lerp(x, tg.x, k); y = lerp(y, tg.y, k); if (g.wr) w = lerp(w, g.wr(t), k); }
    return { t: { x, y }, w };
  };

  // ----- enfasis de palabras (cabeceo + cejas) -----
  const emph = (t) => { let m = 0; for (const [w, s] of words) { if (norm(w).length < 5) continue; const d = t - s; if (d >= 0 && d < 0.5) m = Math.max(m, Math.exp(-d / 0.16)); } return m; };

  return (t) => {
    const e = emoAt(t), v = visemeAt(t), em = emph(t), gz = kfAt(gazeKF, t, 2), sc = saccAt(t);
    const lw = e._laugh, shake = lw * Math.sin(t * 24);
    const breath = Math.sin(t * 2.0) * 0.5 + 0.5;
    const look = { x: clamp(gz[0] + sc.x, -1, 1), y: clamp(gz[1] + sc.y, -1, 1) };
    const bl = blinkAt(t), wk = winkAt(t);
    const open = clamp(e.baseOpen + lw * 0.35 * Math.abs(Math.sin(t * 13)) + v.open * (1 - e.baseOpen * 0.4));
    return {
      yaw: kfAt(yawKF, t, 1)[0], pitch: e.pitch + em * 0.45 + shake * 0.06, roll: e.roll + Math.sin(t * 0.9) * 0.8 + lw * Math.sin(t * 12) * 2, bob: Math.sin(t * 2.0) * 2,
      sway: Math.sin(t * 0.7) * 0.8, breath, shoulders: e.shoulders + breath * 0.15 + lw * Math.sin(t * 24) * 0.25, flare: e.flare + breath * 0.3,
      squint: e.squint, tears: e.tears, tearT: t,
      gaze: look, lid: { l: e.lid - Math.max(0, look.y) * 0.18, r: e.lid - Math.max(0, look.y) * 0.18 }, blink: { l: Math.max(bl, 0), r: Math.max(bl, wk) },
      brow: { l: { r: e.bl + em * 0.3, i: e.bli }, r: { r: e.br + em * 0.3, i: e.bri } },
      mouth: { open, wide: clamp(e.wide + v.wide * 0.85, -1, 1), smile: e.smile + v.wide * 0.04, asym: e.asym, press: Math.max(e.press * (1 - v.open), v.press) },
      armL: armAt(t, -1), armR: armAt(t, 1),
      legs: { l: { thigh: Math.sin(t * 0.7) * 1.1, knee: Math.max(0, Math.sin(t * 0.7)) * 2 }, r: { thigh: -Math.sin(t * 0.7) * 1.1, knee: Math.max(0, -Math.sin(t * 0.7)) * 2 } },
    };
  };
}
