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

function findFont() {
  const candidates = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  ];
  return candidates.find((f) => fs.existsSync(f));
}

// Arma un video vertical (formato Reel) a partir de varias imagenes fijas,
// cada una con movimiento tipo "Ken Burns" (zoom lento, alternando entrada y
// salida) conectadas con transiciones de cruce (crossfade), sincronizado con
// la narracion de audio, y el gancho como titulo quemado al inicio.
export async function buildVideo({ imagePaths, chunkPaths, tmpDir, hookText }) {
  const audioPath = await concatAudio(chunkPaths, tmpDir);
  const duration = await getAudioDuration(audioPath);
  const fps = 25;
  const transitionDur = 0.8;
  const n = imagePaths.length;

  // Duracion de cada clip individual (con solape) para que la suma, quitando
  // los traslapes de las transiciones, de exactamente la duracion del audio.
  const segDur = (duration + (n - 1) * transitionDur) / n;
  const segFrames = Math.ceil(segDur * fps);

  const outputPath = path.join(tmpDir, "output.mp4");
  const safeHook = hookText.replace(/'/g, "\\'").replace(/:/g, "\\:");
  const fontFile = findFont();
  const fontOption = fontFile ? `fontfile='${fontFile}':` : "";

  const inputArgs = [];
  imagePaths.forEach((img) => {
    inputArgs.push("-loop", "1", "-t", String(segDur), "-r", String(fps), "-i", img);
  });
  inputArgs.push("-i", audioPath);

  const filterParts = [];
  imagePaths.forEach((_, i) => {
    // Alterna zoom-in y zoom-out entre imagenes para que se sienta mas dinamico.
    const zoomExpr = i % 2 === 0 ? "min(zoom+0.0015,1.3)" : "if(eq(on,1),1.3,max(zoom-0.0015,1.0))";
    filterParts.push(
      `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,` +
      `zoompan=z='${zoomExpr}':d=${segFrames}:s=1080x1920:fps=${fps},setsar=1[v${i}]`
    );
  });

  let lastLabel = "v0";
  for (let i = 1; i < n; i++) {
    const offset = i * (segDur - transitionDur);
    const outLabel = `vx${i}`;
    filterParts.push(
      `[${lastLabel}][v${i}]xfade=transition=fade:duration=${transitionDur}:offset=${offset.toFixed(3)}[${outLabel}]`
    );
    lastLabel = outLabel;
  }

  filterParts.push(
    `[${lastLabel}]drawtext=${fontOption}text='${safeHook}':fontcolor=white:fontsize=64:` +
    `box=1:boxcolor=black@0.55:boxborderw=20:x=(w-text_w)/2:y=120:` +
    `enable='lt(t,4)':line_spacing=10[vfinal]`
  );

  await run("ffmpeg", [
    "-y",
    ...inputArgs,
    "-filter_complex", filterParts.join(";"),
    "-map", "[vfinal]",
    "-map", `${n}:a`,
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-t", String(duration),
    outputPath,
  ]);

  return outputPath;
}
