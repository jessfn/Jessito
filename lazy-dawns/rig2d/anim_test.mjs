// Animacion de prueba de 5 s (1080x1920, 30 fps): node anim_test.mjs [salida.mp4] | preview t1 t2 ...
import { Resvg } from '@resvg/resvg-js'; import { spawn } from 'node:child_process'; import { writeFileSync, mkdirSync } from 'node:fs';
import { defaultPose, applyExpr, applyViseme, renderCharacter, ALLDEFS as DEFS, ik2, SK } from './character.mjs';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)); const lerp = (a, b, k) => a + (b - a) * k; const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ramp = (t, a, b) => sm((t - a) / (b - a)); const FPS = 30, DUR = 5, N = FPS * DUR;
// ---- controles animados (claves) ----
const blinkAt = (t, t0) => { const d = t - t0; return d < 0 || d > 0.2 ? 0 : d < 0.07 ? d / 0.07 : d < 0.1 ? 1 : 1 - (d - 0.1) / 0.1; };
const winkR = (t) => ramp(t, 4.05, 4.2) * (1 - ramp(t, 4.55, 4.75));
const headYaw = (t) => 0.62 * ramp(t, 1.0, 1.55) * (1 - ramp(t, 2.0, 2.45)) + 0.1 * ramp(t, 4.0, 4.6);
const lookX = (t) => 0.95 * ramp(t, 0.9, 1.15) * (1 - ramp(t, 1.9, 2.1)) + 0.25 * ramp(t, 3.9, 4.0);
const VIS = [['rest', 3.0], ['A', 3.1], ['E', 3.24], ['O', 3.38], ['MBP', 3.52], ['A', 3.62], ['I', 3.76], ['U', 3.88], ['FV', 3.98], ['rest', 4.06]];
// ---- fisica secundaria (resortes) ----
const SIM = []; { let hx = 0, hv = 0, sw = 0, swv = 0, hr = 0, hrv = 0, sk = 0, skv = 0, sk2 = 0, sk2v = 0, ea = 0, eav = 0; let prevHipX = 0, prevYaw = 0;
  const hipX = (t) => 16 * Math.sin(Math.PI * 2 * (t - 4.05) * 0.85) * ramp(t, 4.0, 4.4) * (1 - 0.0 * ramp(t, 4.9, 5)); const hipRot = (t) => 3.2 * Math.sin(Math.PI * 2 * (t - 4.05) * 0.85 + 0.6) * ramp(t, 4.0, 4.4);
  for (let i = 0; i < N * 8; i++) { const t = i / (FPS * 8), dt = 1 / (FPS * 8); const x = hipX(t), vx = (x - prevHipX) / dt; prevHipX = x; const yw = headYaw(t), vy = (yw - prevYaw) / dt; prevYaw = yw;
    const drive = -vx * 0.05 + -vy * 7; hv += (-150 * hx - 9 * hv + drive * 60) * dt; hx += hv * dt;
    skv += (-110 * sk - 7 * skv - vx * 0.55 * 1.0) * dt; sk += skv * dt; sk2v += (-90 * sk2 - 6 * sk2v - vx * 0.4) * dt; sk2 += sk2v * dt;
    eav += (-260 * ea - 6 * eav - vx * 0.6) * dt; ea += eav * dt;
    if (i % 8 === 0) SIM.push({ hair: hx, sk, sk2, ea, hipX: x, hipRot: hipRot(t) }); } }
export function poseAt(t) {
  const P = defaultPose(); const s = SIM[Math.min(SIM.length - 1, Math.round(t * FPS))];
  P.chest.breath = Math.sin((Math.PI * 2 * t) / 3.4); P.chest.rot = 0.6 * Math.sin((Math.PI * 2 * t) / 4.1);
  // expresiones: neutral -> sonrisa (1-2 s) -> feliz (2-3) -> habla -> feliz
  applyExpr(P, 'neutral', 1); applyExpr(P, 'smile', ramp(t, 1.4, 1.9)); applyExpr(P, 'happy', ramp(t, 2.2, 2.7) * (1 - ramp(t, 2.95, 3.05)));
  if (t >= 3.0 && t < 4.06) { const base = { ...P.mouth }; let cur = VIS[0]; for (let i = 0; i < VIS.length; i++) if (t >= VIS[i][1]) cur = VIS[i]; const idx = VIS.indexOf(cur); const t0 = cur[1], k = sm((t - t0) / 0.06); applyViseme(P, cur[0], 1); const pv = VIS[Math.max(0, idx - 1)][0]; const tmp = defaultPose(); applyViseme(tmp, pv, 1);
    for (const key of ['open', 'wide', 'round', 'upperTeeth', 'lowerTeeth', 'tongue', 'fv']) P.mouth[key] = lerp(tmp.mouth[key], P.mouth[key], k); P.mouth.smile = 0.35; P.brows.Lraise = 0.2 * Math.sin(t * 9) + 0.15; P.brows.Rraise = 0.2 * Math.sin(t * 9 + 1) + 0.15; }
  if (t >= 4.06) applyExpr(P, 'happy', ramp(t, 4.06, 4.3));
  P.eyes.blinkL = Math.max(blinkAt(t, 0.55), blinkAt(t, 2.85)); P.eyes.blinkR = Math.max(blinkAt(t, 0.55), blinkAt(t, 2.85), winkR(t)); P.eyes.lookX = lookX(t); P.eyes.lookY = -0.1 * Math.sin(t * 1.3);
  if (winkR(t) > 0.1) { P.brows.Rraise = -0.2; P.eyes.squint = 0.3; }
  P.head.yaw = headYaw(t); P.head.rot = 3.5 * ramp(t, 1.0, 1.5) * (1 - ramp(t, 2.0, 2.4)) + (t > 3 && t < 4 ? 2.5 * Math.sin(t * 6) : 0) + 2.5 * Math.sin(Math.PI * 2 * (t - 4.05) * 0.85) * ramp(t, 4.0, 4.4); P.head.pitch = 0.3 * Math.sin(t * 1.7);
  // brazo derecho (de la pantalla) saluda: sube 2-3 s, agita, baja 3.0-3.5
  const up = ramp(t, 2.0, 2.45) * (1 - ramp(t, 3.05, 3.55)); const waveA = Math.sin((t - 2.45) * 13) * ramp(t, 2.4, 2.6) * (1 - ramp(t, 2.95, 3.1));
  const SR = SK.shoulderR, E0 = SK.elbowR, W0 = SK.wristR; const tgt = [lerp(W0[0], 770 + waveA * 16, up), lerp(W0[1], 345 - Math.abs(waveA) * 4, up)];
  const k = ik2(SR, E0, W0, tgt, 1); P.armR.r1 = k.r1; P.armR.r2 = k.r2 + waveA * 8; P.armR.wrist = waveA * 22 * up - 10 * up;
  P.handR.curl = [0.0, 0.0, 0.0, 0.0, 0.0].map((c, i) => lerp(0.2 + 0.03 * i, 0, up)); P.handR.spread = lerp(0.1, 1.4, up); P.handR.wig = up * ramp(t, 2.5, 2.7) * (1 - ramp(t, 3.0, 3.1)) * 1.0; P.handR.t = t;
  // mano izquierda se mueve al hablar
  const g = ramp(t, 3.0, 3.25) * (1 - ramp(t, 4.0, 4.3)); const tgL = [lerp(SK.wristL[0], 300 + 8 * Math.sin(t * 5), g), lerp(SK.wristL[1], 760 + 14 * Math.sin(t * 6.5), g)]; const kL = ik2(SK.shoulderL, SK.elbowL, SK.wristL, tgL, 1);
  P.armL.r1 = kL.r1; P.armL.r2 = kL.r2; P.armL.wrist = 8 * g * Math.sin(t * 5); P.handL.curl = [0.1, 0.3 - 0.2 * g, 0.3 - 0.2 * g, 0.35, 0.4].map((c) => c); P.handL.spread = 0.1 + 0.6 * g; P.handL.t = t; P.handL.wig = g * 0.3;
  // cadera, falda, cabello, accesorios
  P.hips.x = s.hipX; P.hips.rot = s.hipRot; P.hips.y = -3 * Math.abs(Math.sin(Math.PI * 2 * (t - 4.05) * 0.85)) * ramp(t, 4, 4.4);
  P.legR.r1 = -s.hipRot * 0.6; P.legL.r1 = -s.hipRot * 0.6;
  P.skirt.swayL = clamp(s.sk * 36, -40, 40); P.skirt.swayR = clamp(s.sk2 * 36, -48, 48); P.skirt.hem = 1; P.skirt.ruffle = 1; P.skirt.t = t;
  P.hair.swayL = clamp(s.hair * 0.9 + Math.sin(t * 1.7) * 0.8, -9, 9); P.hair.swayR = clamp(s.hair * 0.9 + Math.sin(t * 1.7 + 0.8) * 0.8, -9, 9); P.hair.top = clamp(s.hair * 0.4, -5, 5); P.hair.t = t;
  P.acc.earL = clamp(s.ea * 60 + P.head.yaw * -10, -35, 35); P.acc.earR = clamp(s.ea * 60 + P.head.yaw * -10, -35, 35); P.acc.pendant = clamp(s.ea * 40, -25, 25) + 2 * Math.sin(t * 2);
  return P;
}
const SC = 1.12, TX = 540 - 512 * SC, TY = (1920 - 1536 * SC) / 2;
export function frameSvg(t) { const P = poseAt(t); const ap = ramp(t, 0, 0.6), sc = SC * lerp(0.9, 1, ap), ty = TY + (1 - ap) * 40;
  const char = `<g opacity="${ap.toFixed(3)}" transform="translate(${540},${1920 / 2 + 0}) scale(${(sc / SC).toFixed(4)}) translate(-540,-960)"><g transform="translate(${TX.toFixed(1)},${TY.toFixed(1)}) scale(${SC})">${renderCharacter(P)}</g></g>`;
  const bg = `<defs><linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1f4d"/><stop offset="0.55" stop-color="#6b3f7a"/><stop offset="1" stop-color="#e49a8a"/></linearGradient><radialGradient id="spot" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#bgG)"/><rect width="1080" height="1920" fill="url(#spot)"/><ellipse cx="${540 + P.hips.x * SC}" cy="${TY + 1520 * SC}" rx="380" ry="34" fill="#000" opacity="0.32"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${DEFS}${bg}${char}</svg>`; }
const png = (t) => new Resvg(frameSvg(t), { fitTo: { mode: 'width', value: 1080 } }).render().asPng();
if (process.argv[2] === 'preview') { mkdirSync('out', { recursive: true }); for (const t of process.argv.slice(3)) writeFileSync(`out/p_${t}.png`, png(parseFloat(t))); console.log('ok'); }
else if (process.argv[1].endsWith('anim_test.mjs')) { const out = process.argv[2] || 'out/Lazy2D_prueba_5s.mp4'; mkdirSync('out', { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { if (!ff.stdin.write(png(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if (i % 30 === 0) console.log('frame', i); } ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out); }
