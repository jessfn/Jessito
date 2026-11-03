import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { frameSvg, renderPng, loadEmojis, MASCOT_COLORS } from "./render.js";
import { makeMusic, makeAmbience, addSfx, writeWav } from "./audio.js";

const run = promisify(execFile);
const FPS = 24;
const VOICE = "es-MX-DaliaNeural";

function hashOf(text) {
  let h = 7;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function pickScene(tema) {
  if (tema === "mar") return "mar";
  if (tema === "espacio") return "noche";
  return hashOf(tema) % 2 === 0 ? "dia" : "atardecer";
}

// Guion de ~1:20: presentacion, cada item (presentar + repetir), juego de adivinar, repaso y despedida.
function buildSegments(lesson) {
  const items = lesson.items;
  const n = items.length;
  const segs = [{ kind: "intro", pad: 0.5, text: `¡Hola, amiguitos! Soy Pompi. Hoy vamos a aprender ${lesson.titulo.toLowerCase()}.` }];
  items.forEach(([, word, dato], itemIndex) => {
    segs.push({ kind: "present", itemIndex, pad: 0.5, text: `${word}. ${dato}` });
    segs.push({ kind: "repeat", itemIndex, pad: 1.4, text: `Repite conmigo: ${word}.` });
  });
  segs.push({ kind: "quizintro", pad: 0.5, text: "¡Ahora un juego! Encuentra la respuesta." });
  [1, 3].forEach((target, q) => {
    const t = target % n;
    const others = [(t + 1) % n, (t + 2) % n];
    const choices = q % 3 === 0 ? [t, ...others] : q % 3 === 1 ? [others[0], t, others[1]] : [others[0], others[1], t];
    segs.push({ kind: "quizq", itemIndex: t, choices, pad: 2.0, text: `Encuentra: ${items[t][1]}.` });
    segs.push({ kind: "quiza", itemIndex: t, choices, pad: 0.8, text: `¡Muy bien! ${items[t][1]}.` });
  });
  segs.push({ kind: "recap", pad: 0.9, text: `Hoy aprendimos: ${items.map((i) => i[1].toLowerCase()).join(", ")}. ¡Qué bien lo hiciste!` });
  segs.push({ kind: "outro", pad: 1.0, text: "¡Suscríbete y dale like! ¡Hasta mañana!" });
  return segs;
}

async function duration(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]);
  return parseFloat(stdout.trim());
}

// Voz de cada segmento (con pausa al final) concatenada en un solo wav.
async function buildNarration(segs, tmpDir) {
  const wavs = [];
  for (let i = 0; i < segs.length; i++) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioFilePath } = await tts.toFile(tmpDir, segs[i].text, { pitch: "+3Hz", rate: "-3%" });
    const wav = path.join(tmpDir, `seg-${i}.wav`);
    await run("ffmpeg", ["-y", "-i", audioFilePath, "-af", `apad=pad_dur=${segs[i].pad},highpass=f=80`, "-ar", "44100", "-ac", "1", wav]);
    segs[i].duration = await duration(wav);
    wavs.push(wav);
  }
  const list = path.join(tmpDir, "list.txt");
  fs.writeFileSync(list, wavs.map((w) => `file '${w.replace(/\\/g, "/")}'`).join("\n"));
  const narration = path.join(tmpDir, "narration.wav");
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", narration]);
  return narration;
}

function buildSoundtrack(segs, total, scene, seed, tmpDir) {
  const music = makeMusic(total, seed);
  const ambience = makeAmbience(total, scene, seed);
  const events = [];
  let t = 0;
  for (const s of segs) {
    if (s.kind === "present") events.push({ t: t + 0.05, type: "pop" }, { t: t - 0.15, type: "whoosh" });
    if (s.kind === "quiza") events.push({ t: t + 0.05, type: "ding" });
    if (s.kind === "recap") events.push({ t, type: "sparkle" });
    if (s.kind === "quizq" || s.kind === "outro") events.push({ t: t - 0.1, type: "whoosh" });
    t += s.duration;
  }
  const sfx = new Float32Array(ambience.length);
  addSfx(sfx, events.filter((e) => e.t >= 0), seed);
  for (let i = 0; i < sfx.length; i++) sfx[i] += ambience[i];
  const musicPath = path.join(tmpDir, "music.wav");
  const sfxPath = path.join(tmpDir, "sfx.wav");
  writeWav(music, musicPath);
  writeWav(sfx, sfxPath);
  return { musicPath, sfxPath };
}

export async function buildKidsVideo(lesson) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kids-"));
  await loadEmojis(lesson);
  const segs = buildSegments(lesson);
  const narration = await buildNarration(segs, tmpDir);
  const total = segs.reduce((a, s) => a + s.duration, 0);
  const seed = hashOf(lesson.tema);
  const scene = pickScene(lesson.tema);
  const mascotColor = MASCOT_COLORS[seed % MASCOT_COLORS.length];
  const { musicPath, sfxPath } = buildSoundtrack(segs, total, scene, seed, tmpDir);
  console.log(`Duracion: ${total.toFixed(1)}s, escena: ${scene}`);

  const outPath = path.join(tmpDir, "output.mp4");
  const ff = spawn("ffmpeg", [
    "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-i", narration, "-i", musicPath, "-i", sfxPath,
    "-filter_complex",
    `[1:a]volume=1.15[n];[2:a]volume=0.2,afade=t=in:d=1.5,afade=t=out:st=${(total - 2).toFixed(2)}:d=2[m];[3:a]volume=0.55[s];` +
      "[n][m][s]amix=inputs=3:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95[a]",
    "-map", "0:v", "-map", "[a]",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-t", String(total), outPath,
  ], { stdio: ["pipe", "ignore", "inherit"] });
  const closed = new Promise((resolve, reject) => {
    ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg salio con ${code}`))));
    ff.on("error", reject);
  });

  const frames = Math.floor(total * FPS);
  let segIndex = 0;
  let segStart = 0;
  for (let f = 0; f < frames; f++) {
    const t = f / FPS;
    while (segIndex < segs.length - 1 && t >= segStart + segs[segIndex].duration) {
      segStart += segs[segIndex].duration;
      segIndex++;
    }
    const svg = frameSvg({ lesson, seg: segs[segIndex], segT: t - segStart, t, total, scene, mascotColor });
    const png = renderPng(svg);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await closed;
  return { videoPath: outPath, tmpDir, seconds: total };
}
