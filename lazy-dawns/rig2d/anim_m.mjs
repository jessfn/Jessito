// Muestra de 5 s de M (1080x1920, 30 fps): node anim_m.mjs [salida.mp4] | preview t...
import { Resvg } from '@resvg/resvg-js'; import { spawn } from 'node:child_process'; import { writeFileSync, mkdirSync } from 'node:fs';
import { DEFS } from './character.mjs'; import { MDEFS, MSK, defaultM, renderM, ik2 } from './m_character.mjs';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)); const lerp = (a, b, k) => a + (b - a) * k; const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); }; const ramp = (t, a, b) => sm((t - a) / (b - a));
const FPS = 30, DUR = 5, N = FPS * DUR;
const laugh = (t) => ramp(t, 4.0, 4.15) * (1 - ramp(t, 4.8, 5.0)); const lph = (t) => Math.sin((t - 4) * 2 * Math.PI * 4.2);
const SIM = []; { let a = 0, av = 0, b = 0, bv = 0, prev = 0, prevB = 0; for (let i = 0; i < N * 8; i++) { const t = i / (FPS * 8), dt = 1 / (FPS * 8); const x = 10 * Math.sin(t * 1.2) + 12 * laugh(t) * lph(t) + 14 * ramp(t, 0.2, 1.0) * (1 - ramp(t, 1.0, 1.6)); const v = (x - prev) / dt; prev = x;
    av += (-70 * a - 5 * av - v * 0.6) * dt; a += av * dt; bv += (-55 * b - 4 * bv - v * 0.45) * dt; b += bv * dt; if (i % 8 === 0) SIM.push({ a, b, x }); } }
export function poseAt(t) { const P = defaultM(); const s = SIM[Math.min(SIM.length - 1, Math.round(t * FPS))]; P.t = t;
  P.chest.breath = Math.sin(t * 2 * Math.PI / 3.2) + 1.6 * laugh(t) * lph(t); P.chest.rot = 0.6 * Math.sin(t * 1.1);
  P.hips.y = 24 * (1 - ramp(t, 0, 0.9)) + 3 * Math.sin(t * 1.7); P.hips.x = s.x * 0.3;
  P.eyes.glow = ramp(t, 0.35, 0.8) * (0.85 + 0.15 * Math.sin(t * 7)) + 0.6 * laugh(t) * Math.abs(lph(t)); P.eyes.open = 1 - 0.45 * ramp(t, 1.0, 1.4) * (1 - ramp(t, 2.6, 3.0)) - 0.3 * ramp(t, 4.0, 4.1); P.eyes.look = 0.8 * ramp(t, 1.0, 1.4) * (1 - ramp(t, 1.9, 2.3)) - 0.6 * ramp(t, 2.2, 2.6) * (1 - ramp(t, 3.0, 3.4));
  P.eyes.brow = 0.35 + 0.6 * ramp(t, 1.0, 1.5) + 0.2 * laugh(t);
  P.smile = 36 + 26 * ramp(t, 1.0, 1.6) + 26 * laugh(t) * (0.6 + 0.4 * Math.abs(lph(t)));
  P.head.rot = -5 * ramp(t, 1.0, 1.5) * (1 - ramp(t, 2.0, 2.4)) + 3 * ramp(t, 3.0, 3.4) * (1 - ramp(t, 3.7, 4.0)) + 3 * laugh(t) * lph(t); P.head.yaw = 0.35 * ramp(t, 1.0, 1.4) * (1 - ramp(t, 1.9, 2.3));
  P.hat.rot = 1.2 * Math.sin(t * 1.3) + 8 * ramp(t, 3.2, 3.5) * (1 - ramp(t, 3.8, 4.1)); P.hat.lift = 22 * ramp(t, 3.25, 3.5) * (1 - ramp(t, 3.7, 3.95));
  // brazo derecho (pantalla): sube y llama con los dedos (2-3 s)
  const up = ramp(t, 1.9, 2.4) * (1 - ramp(t, 3.0, 3.5)); const tgR = [lerp(MSK.wristR[0], 800, up), lerp(MSK.wristR[1], 520, up)]; const kR = ik2(MSK.shoulderR, MSK.elbowR, MSK.wristR, tgR, 1);
  P.armR.r1 = kR.r1; P.armR.r2 = kR.r2; P.armR.wrist = -18 * up + 6 * up * Math.sin(t * 6); const beck = up * (0.5 + 0.5 * Math.sin((t - 2.3) * 9)); P.handR.curl = [0.2, 0.9 * beck + 0.1, 0.9 * beck + 0.1, 0.9 * beck + 0.1, 0.9 * beck + 0.1].map((c, i) => lerp(0.3 + 0.05 * i, c, up)); P.handR.spread = lerp(0.1, 0.6, up); P.handR.t = t; P.handR.wig = up * 0.4;
  // brazo izquierdo (pantalla): toca el ala del sombrero (3-4 s)
  const hu = ramp(t, 2.95, 3.35) * (1 - ramp(t, 3.85, 4.25)); const tgL = [lerp(MSK.wristL[0], 392, hu), lerp(MSK.wristL[1], 232, hu)]; const kL = ik2(MSK.shoulderL, MSK.elbowL, MSK.wristL, tgL, -1);
  P.armL.r1 = kL.r1; P.armL.r2 = kL.r2; P.armL.wrist = 20 * hu; P.handL.curl = [0.2, 0.2, 0.2, 0.25, 0.3].map((c) => lerp(0.4, c, hu)); P.handL.spread = lerp(0.1, 0.3, hu); P.handL.t = t;
  // laugh: brazos tiemblan un poco
  P.armL.r1 += 2 * laugh(t) * lph(t); P.armR.r1 -= 2 * laugh(t) * lph(t);
  P.cape.swayL = clamp(s.a * 30 + Math.sin(t * 1.6) * 8, -50, 50); P.cape.swayR = clamp(s.b * 30 + Math.sin(t * 1.6 + 1.1) * 8, -50, 50); P.cape.flap = 0.6 + 1.2 * laugh(t) + 0.8 * ramp(t, 3.0, 3.5) * (1 - ramp(t, 3.5, 4.0)); P.cape.t = t;
  return P; }
const SC = 1.17, TX = 540 - 512 * SC, TY = (1920 - 1536 * SC) / 2;
export function frameSvg(t) { const P = poseAt(t); const ap = ramp(t, 0, 0.8); const flash = Math.max(0, 1 - Math.abs(t - 0.45) / 0.18) * 0.5 + 0.25 * laugh(t) * Math.abs(lph(t));
  const ember = [...Array(26)].map((_, i) => { const x0 = (i * 211) % 1080, ph = (t * (50 + (i % 5) * 18) + i * 130) % 2000, y = 1980 - ph, x = x0 + Math.sin(t * 1.5 + i) * 24; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${1.6 + (i % 4)}" fill="${i % 3 ? '#ff3a4a' : '#ff9a60'}" opacity="${(0.25 + 0.35 * Math.sin(t * 3 + i)).toFixed(2)}"/>`; }).join('');
  const bg = `<defs><radialGradient id="bgM" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stop-color="#52061a"/><stop offset="0.55" stop-color="#1e030b"/><stop offset="1" stop-color="#050102"/></radialGradient><filter id="mAura" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.05  0 0 0 0 0.14  0 0 0 1.3 0"/><feGaussianBlur stdDeviation="20"/></filter></defs><rect width="1080" height="1920" fill="url(#bgM)"/><ellipse cx="540" cy="${TY + 1520 * SC}" rx="420" ry="60" fill="#ff1a3a" opacity="0.28"/><ellipse cx="${540 + P.hips.x * SC}" cy="${TY + 1525 * SC}" rx="330" ry="26" fill="#000" opacity="0.55"/>${ember}`;
  const fig = renderM(P); const sc = `translate(${TX.toFixed(1)},${TY.toFixed(1)}) scale(${SC})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${DEFS}${MDEFS}${bg}<g opacity="${(0.55 * ap).toFixed(2)}" filter="url(#mAura)" transform="${sc}">${fig}</g><g opacity="${ap.toFixed(3)}" transform="${sc}">${fig}</g><rect width="1080" height="1920" fill="#ff2a3c" opacity="${flash.toFixed(3)}"/></svg>`; }
const png = (t) => new Resvg(frameSvg(t), { fitTo: { mode: 'width', value: 1080 } }).render().asPng();
if (process.argv[2] === 'preview') { mkdirSync('out', { recursive: true }); for (const t of process.argv.slice(3)) writeFileSync(`out/m_${t}.png`, png(parseFloat(t))); console.log('ok'); }
else { const out = process.argv[2] || 'out/M_prueba_5s.mp4'; mkdirSync('out', { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-g', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { if (!ff.stdin.write(png(i / FPS))) await new Promise((r) => ff.stdin.once('drain', r)); if (i % 30 === 0) console.log('frame', i); } ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('listo', out); }
