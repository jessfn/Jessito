import fs from "node:fs";

// Musica de fondo, ambiente y efectos sintetizados (sin derechos de autor) en JS puro.
const SR = 44100;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

function note(buf, start, dur, freq, vol, kind) {
  const i0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n && i0 + i < buf.length; i++) {
    const t = i / SR;
    let s;
    let env;
    if (kind === "bell") {
      s = Math.sin(2 * Math.PI * freq * t) + 0.4 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t * 9) + 0.15 * Math.sin(2 * Math.PI * freq * 3.01 * t) * Math.exp(-t * 14);
      env = Math.min(1, t / 0.005) * Math.exp(-t * 5);
    } else if (kind === "bass") {
      s = Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(2 * Math.PI * freq * 2 * t);
      env = Math.min(1, t / 0.01) * Math.exp(-t * 3.2);
    } else {
      s = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
      env = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.35);
    }
    buf[i0 + i] += s * env * vol;
  }
}

function noiseBurst(buf, start, dur, vol, rand) {
  const i0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  let prev = 0;
  for (let i = 0; i < n && i0 + i < buf.length; i++) {
    const w = rand() * 2 - 1;
    buf[i0 + i] += (w - prev) * vol * Math.exp(-(i / n) * 6);
    prev = w;
  }
}

// Cancion alegre: acordes Do-Lam-Fa-Sol, bajo, campanitas pentatonicas y shaker.
export function makeMusic(seconds, seed) {
  const buf = new Float32Array(Math.ceil(seconds * SR));
  const rand = rng(seed);
  const beat = 60 / 104;
  const chords = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
  const penta = [72, 74, 76, 79, 81, 84];
  let last = 2;
  for (let b = 0; b * beat < seconds; b++) {
    const bar = Math.floor(b / 4) % 4;
    const t = b * beat;
    const chord = chords[bar];
    if (b % 4 === 0) chord.forEach((m) => note(buf, t, beat * 4, hz(m + 12), 0.07, "pad"));
    if (b % 2 === 0) note(buf, t, beat * 1.8, hz(chord[0] - 12), 0.22, "bass");
    for (let h = 0; h < 2; h++) {
      const tt = t + h * beat * 0.5;
      noiseBurst(buf, tt, 0.05, h === 0 ? 0.05 : 0.03, rand);
      if (rand() < 0.62) {
        last = Math.max(0, Math.min(penta.length - 1, last + Math.round((rand() - 0.5) * 4)));
        note(buf, tt, 0.9, hz(penta[last]), 0.11, "bell");
      }
    }
  }
  return buf;
}

// Sonidos ambientales segun la escena: pajaritos de dia, grillos de noche, burbujas en el mar.
export function makeAmbience(seconds, scene, seed) {
  const buf = new Float32Array(Math.ceil(seconds * SR));
  const rand = rng(seed + 7);
  if (scene === "noche") {
    for (let t = 0.5; t < seconds; t += 0.9 + rand() * 0.6) {
      for (let k = 0; k < 3; k++) {
        const i0 = Math.floor((t + k * 0.11) * SR);
        for (let i = 0; i < 0.07 * SR && i0 + i < buf.length; i++) {
          const tt = i / SR;
          buf[i0 + i] += Math.sin(2 * Math.PI * 4300 * tt) * Math.sin(Math.PI * (i / (0.07 * SR))) * 0.05;
        }
      }
    }
  } else if (scene === "mar") {
    let lp = 0;
    for (let i = 0; i < buf.length; i++) {
      lp += (rand() * 2 - 1 - lp) * 0.02;
      buf[i] += lp * (0.5 + 0.5 * Math.sin((2 * Math.PI * i) / SR / 6)) * 0.5;
    }
    for (let t = 0.7; t < seconds; t += 0.5 + rand() * 1.2) {
      const f0 = 300 + rand() * 300;
      const i0 = Math.floor(t * SR);
      for (let i = 0; i < 0.09 * SR && i0 + i < buf.length; i++) {
        const tt = i / SR;
        buf[i0 + i] += Math.sin(2 * Math.PI * (f0 + tt * 5000) * tt) * Math.exp(-tt * 28) * 0.08;
      }
    }
  } else {
    for (let t = 1; t < seconds; t += 1.6 + rand() * 2.6) {
      const base = 2600 + rand() * 1600;
      const notes = 2 + Math.floor(rand() * 3);
      for (let k = 0; k < notes; k++) {
        const i0 = Math.floor((t + k * 0.13) * SR);
        const len = Math.floor(0.1 * SR);
        for (let i = 0; i < len && i0 + i < buf.length; i++) {
          const tt = i / SR;
          const f = base + 900 * Math.sin(tt * 60) + (k % 2 ? 500 : -300) * (tt / 0.1);
          buf[i0 + i] += Math.sin(2 * Math.PI * f * tt) * Math.sin(Math.PI * (i / len)) * 0.06;
        }
      }
    }
  }
  return buf;
}

// Efectos puntuales: pop, ding, whoosh, destellos.
export function addSfx(buf, events, seed) {
  const rand = rng(seed + 13);
  for (const { t, type } of events) {
    const i0 = Math.floor(t * SR);
    if (type === "pop") {
      for (let i = 0; i < 0.12 * SR && i0 + i < buf.length; i++) {
        const tt = i / SR;
        buf[i0 + i] += Math.sin(2 * Math.PI * (350 + tt * 4500) * tt) * Math.exp(-tt * 28) * 0.45;
      }
    } else if (type === "ding") {
      note(buf, t, 1.0, 880, 0.3, "bell");
      note(buf, t + 0.12, 1.0, 1318.5, 0.25, "bell");
      note(buf, t + 0.24, 1.2, 1760, 0.2, "bell");
    } else if (type === "whoosh") {
      let lp = 0;
      for (let i = 0; i < 0.45 * SR && i0 + i < buf.length; i++) {
        const tt = i / SR;
        lp += (rand() * 2 - 1 - lp) * (0.04 + tt * 0.5);
        buf[i0 + i] += lp * Math.sin(Math.PI * (tt / 0.45)) * 0.7;
      }
    } else if (type === "sparkle") {
      [1046.5, 1318.5, 1568, 2093, 2637].forEach((f, k) => note(buf, t + k * 0.08, 0.7, f, 0.18, "bell"));
    }
  }
}

export function writeWav(buf, filePath, gain = 1) {
  let peak = 0.0001;
  for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
  const scale = (0.9 / peak) * gain;
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(buf[i] * scale * 32767))), i * 2);
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(SR, 24);
  head.writeUInt32LE(SR * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(data.length, 40);
  fs.writeFileSync(filePath, Buffer.concat([head, data]));
}
