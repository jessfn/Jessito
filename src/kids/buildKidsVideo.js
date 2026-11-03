import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { frameSvg, renderPng, loadEmojis } from "./render.js";

const run = promisify(execFile);
const FPS = 24;
const PAD = 0.5; // pausa al final de cada segmento
const VOICE = "es-MX-DaliaNeural";

function buildSegments(lesson) {
  const segs = [{ kind: "intro", text: `¡Hola, amiguitos! Hoy vamos a aprender ${lesson.titulo.toLowerCase()}.` }];
  lesson.items.forEach(([, word, dato], itemIndex) => {
    segs.push({ kind: "item", itemIndex, text: `${word}. ${dato}` });
  });
  segs.push({ kind: "outro", text: "¡Muy bien! Suscríbete para ver más videos. ¡Hasta mañana!" });
  return segs;
}

async function duration(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]);
  return parseFloat(stdout.trim());
}

// Voz de cada segmento, con pausa al final, concatenada en un solo wav.
async function buildNarration(segs, tmpDir) {
  const wavs = [];
  for (let i = 0; i < segs.length; i++) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioFilePath } = await tts.toFile(tmpDir, segs[i].text, { pitch: "+6Hz", rate: "-8%" });
    const wav = path.join(tmpDir, `seg-${i}.wav`);
    await run("ffmpeg", ["-y", "-i", audioFilePath, "-af", `apad=pad_dur=${PAD}`, "-ar", "44100", "-ac", "1", wav]);
    segs[i].duration = await duration(wav);
    wavs.push(wav);
  }
  const list = path.join(tmpDir, "list.txt");
  fs.writeFileSync(list, wavs.map((w) => `file '${w.replace(/\\/g, "/")}'`).join("\n"));
  const narration = path.join(tmpDir, "narration.wav");
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", narration]);
  return narration;
}

// Musica suave y libre de derechos, sintetizada con ffmpeg (acorde con trémolo).
async function buildMusic(seconds, tmpDir) {
  const out = path.join(tmpDir, "music.wav");
  await run("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `sine=frequency=261.6:duration=${seconds}`,
    "-f", "lavfi", "-i", `sine=frequency=329.6:duration=${seconds}`,
    "-f", "lavfi", "-i", `sine=frequency=392:duration=${seconds}`,
    "-filter_complex", "[0][1][2]amix=inputs=3,tremolo=f=2:d=0.5,lowpass=f=1200,volume=0.6[m]",
    "-map", "[m]", out,
  ]);
  return out;
}

export async function buildKidsVideo(lesson) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kids-"));
  await loadEmojis(lesson);
  const segs = buildSegments(lesson);
  const narration = await buildNarration(segs, tmpDir);
  const total = segs.reduce((a, s) => a + s.duration, 0);
  const music = await buildMusic(total, tmpDir);
  console.log(`Duracion: ${total.toFixed(1)}s`);

  const outPath = path.join(tmpDir, "output.mp4");
  const ff = spawn("ffmpeg", [
    "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-i", narration, "-i", music,
    "-filter_complex", "[1:a]volume=1.0[n];[2:a]volume=0.12[m];[n][m]amix=inputs=2:duration=first:dropout_transition=0[a]",
    "-map", "0:v", "-map", "[a]",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-t", String(total), outPath,
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
    const svg = frameSvg({ lesson, seg: segs[segIndex], segT: t - segStart, t, index: segIndex, total });
    const png = renderPng(svg);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await closed;
  return { videoPath: outPath, tmpDir, seconds: total };
}
