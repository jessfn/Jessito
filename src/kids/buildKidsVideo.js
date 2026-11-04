import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { renderPng, thumbnailSvg, loadEmojis, MASCOT_COLORS } from "./render.js";
import { makeMusic, makeAmbience, addSfx, writeWav } from "./audio.js";

const run = promisify(execFile);
const FPS = 24;
const CHUNK = 150;
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

function choicesFor(t, n, q) {
  const others = [(t + 1) % n, (t + 2) % n];
  const m = q % 3;
  return m === 0 ? [t, ...others] : m === 1 ? [others[0], t, others[1]] : [others[0], others[1], t];
}

// Video largo (~4 min, horizontal): aprender, juego 1, repaso adivinando, juego 2, baile y despedida.
function buildSegments(lesson) {
  const items = lesson.items;
  const n = items.length;
  const segs = [{ kind: "intro", chapter: "Introducción", pad: 0.6, text: `¡Hola, amiguitos! Soy Pompi. Hoy vamos a aprender ${lesson.titulo.toLowerCase()}. ¡Prepárate para jugar y divertirte!` }];
  items.forEach(([, word, dato], itemIndex) => {
    segs.push({ kind: "present", itemIndex, chapter: itemIndex === 0 ? "Aprendemos" : undefined, pad: 0.6, text: `${word}. ${dato}` });
    segs.push({ kind: "repeat", itemIndex, pad: 1.6, text: `Repite conmigo: ${word}.` });
  });
  segs.push({ kind: "quizintro", chapter: "Primer juego", pad: 0.6, text: "¡Ahora un juego! Mira bien y encuentra la respuesta correcta." });
  [1, 3, 0].forEach((target, q) => {
    const t = target % n;
    const choices = choicesFor(t, n, q);
    segs.push({ kind: "quizq", itemIndex: t, choices, pad: 2.4, text: `Encuentra: ${items[t][1]}.` });
    segs.push({ kind: "quiza", itemIndex: t, choices, pad: 0.8, text: `¡Muy bien! ${items[t][1]}.` });
  });
  segs.push({ kind: "guessintro", chapter: "A repasar", pad: 0.6, text: "¡Vamos a repasar! Dime qué ves en cada tarjeta, ¡tú puedes!" });
  const order = items.map((_, i) => (i * 2 + 1) % n);
  [...new Set(order)].forEach((i) => {
    segs.push({ kind: "guess", itemIndex: i, pad: 2.6, text: "¿Qué es esto?" });
    segs.push({ kind: "reveal", itemIndex: i, pad: 0.8, text: `¡Muy bien! ${items[i][1]}. ${items[i][2]}` });
  });
  segs.push({ kind: "quizintro", chapter: "Segundo juego", pad: 0.6, text: "¡Otro juego! Toca la respuesta correcta." });
  items.forEach((_, i) => {
    const t = (i * 2 + 2) % n;
    const choices = choicesFor(t, n, i + 1);
    segs.push({ kind: "quizq", itemIndex: t, choices, pad: 2.2, text: `Encuentra: ${items[t][1]}.` });
    segs.push({ kind: "quiza", itemIndex: t, choices, pad: 0.8, text: `¡Excelente! ${items[t][1]}.` });
  });
  segs.push({ kind: "dance", chapter: "¡A bailar!", pad: 16, text: "¡Momento de bailar! Mueve tu cuerpecito con Pompi." });
  segs.push({ kind: "recap", chapter: "Repaso y despedida", pad: 1.0, text: `Hoy aprendimos: ${items.map((i) => i[1].toLowerCase()).join(", ")}. ¡Qué bien lo hiciste!` });
  segs.push({ kind: "outro", pad: 1.2, text: "Si te gustó el video, suscríbete y dale like. ¡Nos vemos mañana con un video nuevo! ¡Adiós!" });
  return segs;
}

async function duration(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]);
  return parseFloat(stdout.trim());
}

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
    if (s.kind === "guess") events.push({ t: t + 0.05, type: "pop" });
    if (s.kind === "quiza" || s.kind === "reveal") events.push({ t: t + 0.05, type: "ding" });
    if (s.kind === "recap" || s.kind === "dance") events.push({ t, type: "sparkle" });
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

const stamp = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

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

  let acc = 0;
  const chapters = [];
  for (const s of segs) {
    if (s.chapter) chapters.push(`${stamp(acc)} ${s.chapter}`);
    acc += s.duration;
  }

  const thumbPath = path.join(tmpDir, "thumbnail.png");
  fs.writeFileSync(thumbPath, renderPng(thumbnailSvg({ lesson, scene, mascotColor }), 1280));

  const outPath = path.join(tmpDir, "output.mp4");
  const ff = spawn("ffmpeg", [
    "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-i", narration, "-i", musicPath, "-i", sfxPath,
    "-filter_complex",
    `[1:a]volume=1.15[n];[2:a]volume=0.2,afade=t=in:d=1.5,afade=t=out:st=${(total - 2).toFixed(2)}:d=2[m];[3:a]volume=0.55[s];` +
      "[n][m][s]amix=inputs=3:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95[a]",
    "-map", "0:v", "-map", "[a]",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-t", String(total), outPath,
  ], { stdio: ["pipe", "ignore", "inherit"] });
  const closed = new Promise((resolve, reject) => {
    ff.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg salio con ${code}`))));
    ff.on("error", reject);
  });

  // El renderizador acumula memoria, asi que se dibuja por tandas en procesos hijos que se reinician.
  const frames = Math.floor(total * FPS);
  const planPath = path.join(tmpDir, "plan.json");
  fs.writeFileSync(planPath, JSON.stringify({
    tema: lesson.tema, fps: FPS, total, scene, mascotColor,
    segs: segs.map((s) => ({ kind: s.kind, itemIndex: s.itemIndex, choices: s.choices, duration: s.duration })),
  }));
  const worker = fileURLToPath(new URL("./renderWorker.js", import.meta.url));
  for (let start = 0; start < frames; start += CHUNK) {
    const end = Math.min(frames, start + CHUNK);
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [worker, planPath, String(start), String(end)], { stdio: ["ignore", "pipe", "inherit"] });
      child.stdout.on("data", (d) => {
        if (!ff.stdin.write(d)) {
          child.stdout.pause();
          ff.stdin.once("drain", () => child.stdout.resume());
        }
      });
      child.on("error", reject);
      child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`El render de cuadros ${start}-${end} salio con ${code}`))));
    });
  }
  ff.stdin.end();
  await closed;
  return { videoPath: outPath, thumbPath, tmpDir, seconds: total, chapters };
}
