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

// Parte el gancho en varias lineas para que quepa dentro del ancho del video
// vertical (1080px), en vez de desbordarse o quedar demasiado chico.
function wrapText(text, maxCharsPerLine = 22) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines.join("\n");
}

// Genera una pista de sonido ambiente tenue tipo "terror" (ruido bajo + drone
// grave) sintetizada con ffmpeg, sin depender de ningun archivo externo.
async function buildAmbience(duration, tmpDir) {
  const ambiencePath = path.join(tmpDir, "ambience.wav");
  await run("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `anoisesrc=color=brown:amplitude=0.06:duration=${duration}`,
    "-f", "lavfi", "-i", `sine=frequency=52:duration=${duration}`,
    "-filter_complex",
    "[0:a]lowpass=f=300[n];[1:a]volume=0.5[d];[n][d]amix=inputs=2:duration=first[amb]",
    "-map", "[amb]",
    ambiencePath,
  ]);
  return ambiencePath;
}

// Arma un video vertical (formato Reel) a partir de varias imagenes fijas,
// cada una con movimiento tipo "Ken Burns" (zoom lento, alternando entrada y
// salida) conectadas con transiciones de cruce (crossfade) siguiendo el orden
// de la historia, con narracion de voz + un fondo ambiental tenue de terror,
// y el gancho (ajustado al ancho de pantalla) como titulo quemado al inicio.
export async function buildVideo({ imagePaths, chunkPaths, tmpDir, hookText }) {
  const narrationPath = await concatAudio(chunkPaths, tmpDir);
  const duration = await getAudioDuration(narrationPath);
  const ambiencePath = await buildAmbience(duration, tmpDir);

  const fps = 25;
  const transitionDur = 0.7;
  const n = imagePaths.length;

  // Duracion de cada clip individual (con solape) para que la suma, quitando
  // los traslapes de las transiciones, de exactamente la duracion del audio.
  const segDur = (duration + (n - 1) * transitionDur) / n;
  const segFrames = Math.ceil(segDur * fps);

  const outputPath = path.join(tmpDir, "output.mp4");

  const hookPath = path.join(tmpDir, "hook.txt");
  fs.writeFileSync(hookPath, wrapText(hookText));
  const fontFile = findFont();
  const fontOption = fontFile ? `fontfile='${fontFile}':` : "";

  const inputArgs = [];
  imagePaths.forEach((img) => {
    inputArgs.push("-loop", "1", "-t", String(segDur), "-r", String(fps), "-i", img);
  });
  const narrationInputIndex = n;
  const ambienceInputIndex = n + 1;
  inputArgs.push("-i", narrationPath, "-i", ambiencePath);

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
    `[${lastLabel}]drawtext=${fontOption}textfile='${hookPath}':fontcolor=white:fontsize=58:` +
    `box=1:boxcolor=black@0.55:boxborderw=24:x=(w-text_w)/2:y=110:` +
    `enable='lt(t,4)':line_spacing=14[vfinal]`
  );

  // Mezcla la narracion (volumen normal) con el ambiente de terror (tenue).
  filterParts.push(
    `[${narrationInputIndex}:a]volume=1.0[narr];` +
    `[${ambienceInputIndex}:a]volume=0.35[amb2];` +
    `[narr][amb2]amix=inputs=2:duration=first:dropout_transition=0[aout]`
  );

  await run("ffmpeg", [
    "-y",
    ...inputArgs,
    "-filter_complex", filterParts.join(";"),
    "-map", "[vfinal]",
    "-map", "[aout]",
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-t", String(duration),
    outputPath,
  ]);

  return outputPath;
}
