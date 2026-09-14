import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const run = promisify(execFile);

async function getAudioDuration(filePath) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  return parseFloat(stdout.trim());
}

// Concatena los fragmentos de audio de la narracion en un solo archivo.
async function concatAudio(chunkPaths, tmpDir) {
  const listPath = path.join(tmpDir, "concat.txt");
  const listContent = chunkPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  fs.writeFileSync(listPath, listContent);

  const combinedPath = path.join(tmpDir, "narration.mp3");
  await run("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0",
    "-i", listPath,
    "-c", "copy",
    combinedPath,
  ]);
  return combinedPath;
}

// Arma un video vertical (formato Reel) a partir de una imagen fija con
// movimiento tipo "Ken Burns" (zoom/paneo lento) y la narracion de audio,
// con el gancho como titulo quemado al inicio.
export async function buildVideo({ imagePath, chunkPaths, tmpDir, hookText }) {
  const audioPath = await concatAudio(chunkPaths, tmpDir);
  const duration = await getAudioDuration(audioPath);
  const fps = 25;
  const totalFrames = Math.ceil(duration * fps);

  const outputPath = path.join(tmpDir, "output.mp4");
  const safeHook = hookText.replace(/'/g, "\\'").replace(/:/g, "\\:");

  const fontCandidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  ];
  const fontFile = fontCandidates.find((f) => fs.existsSync(f));
  const fontOption = fontFile ? `fontfile='${fontFile}':` : "";

  const zoompan =
    `zoompan=z='min(zoom+0.0007,1.25)':d=${totalFrames}:s=1080x1920:fps=${fps}`;
  const titleCard =
    `drawtext=${fontOption}text='${safeHook}':fontcolor=white:fontsize=64:` +
    `box=1:boxcolor=black@0.55:boxborderw=20:x=(w-text_w)/2:y=120:` +
    `enable='lt(t,4)':line_spacing=10`;

  await run("ffmpeg", [
    "-y",
    "-loop", "1", "-i", imagePath,
    "-i", audioPath,
    "-vf", `${zoompan},${titleCard}`,
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-t", String(duration),
    "-shortest",
    outputPath,
  ]);

  return outputPath;
}
