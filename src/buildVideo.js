import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TITLE_FONT = path.join(__dirname, "..", "assets", "fonts", "Anton-Regular.ttf");

async function getAudioDuration(filePath) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  return parseFloat(stdout.trim());
}

// Concatena los audios de cada segmento (en orden) en la pista de narracion.
async function concatAudio(audioPaths, tmpDir) {
  const listPath = path.join(tmpDir, "concat.txt");
  const listContent = audioPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  fs.writeFileSync(listPath, listContent);

  const combinedPath = path.join(tmpDir, "narration.mp3");
  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", combinedPath]);
  return combinedPath;
}

function findFont() {
  if (fs.existsSync(TITLE_FONT)) return TITLE_FONT;
  const fallbacks = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  ];
  return fallbacks.find((f) => fs.existsSync(f));
}

// Parte el gancho en varias lineas para que quepa en el ancho del video vertical.
function wrapText(text, maxCharsPerLine = 18) {
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

// Cama sonora de tension (sin derechos de autor): drone grave con batido +
// latido tipo corazon + viento, todo sintetizado con ffmpeg.
async function buildAmbience(duration, tmpDir) {
  const ambiencePath = path.join(tmpDir, "ambience.wav");
  await run("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", `sine=frequency=55:duration=${duration}`,
    "-f", "lavfi", "-i", `sine=frequency=58:duration=${duration}`,
    "-f", "lavfi", "-i", `anoisesrc=color=brown:amplitude=0.28:duration=${duration}`,
    "-filter_complex",
    "[0:a][1:a]amix=inputs=2[drone];" +
    "[drone]tremolo=f=1.1:d=0.7,volume=0.9[dr];" +
    "[2:a]lowpass=f=450,volume=0.8[wind];" +
    "[dr][wind]amix=inputs=2:duration=first[amb]",
    "-map", "[amb]",
    ambiencePath,
  ]);
  return ambiencePath;
}

// Arma un video vertical (Reel) donde CADA imagen dura exactamente lo que dura
// la narracion de su segmento, con movimiento continuo tipo Ken Burns y
// transiciones de cruce que caen justo en cada cambio de frase, mas la cama
// sonora de tension bajo la voz y el gancho centrado como titulo al inicio.
export async function buildVideo({ segments, tmpDir, hookText }) {
  const n = segments.length;
  const fps = 25;
  const T = 0.6; // duracion de la transicion de cruce

  const durations = [];
  for (const s of segments) durations.push(await getAudioDuration(s.audioPath));

  const narrationPath = await concatAudio(segments.map((s) => s.audioPath), tmpDir);
  const total = await getAudioDuration(narrationPath);
  const ambiencePath = await buildAmbience(total, tmpDir);

  const outputPath = path.join(tmpDir, "output.mp4");
  const hookPath = path.join(tmpDir, "hook.txt");
  fs.writeFileSync(hookPath, wrapText(hookText));
  const fontFile = findFont();
  const fontOption = fontFile ? `fontfile='${fontFile}':` : "";

  // Entradas: una imagen por segmento (con material extra para el crossfade),
  // luego la narracion y la cama sonora.
  const inputArgs = [];
  segments.forEach((s, i) => {
    const clipDur = durations[i] + T;
    inputArgs.push("-loop", "1", "-t", String(clipDur), "-r", String(fps), "-i", s.imagePath);
  });
  const narrationIdx = n;
  const ambienceIdx = n + 1;
  inputArgs.push("-i", narrationPath, "-i", ambiencePath);

  const filterParts = [];
  segments.forEach((_, i) => {
    const clipFrames = Math.ceil((durations[i] + T) * fps);
    // Recorta el 10% inferior (posible marca de agua), escala a vertical y
    // aplica un zoom lento y CONSTANTE (nunca queda una imagen estatica).
    filterParts.push(
      `[${i}:v]crop=iw:ih*0.90:0:0,scale=1080:1920:force_original_aspect_ratio=increase,` +
      `crop=1080:1920,zoompan=z='zoom+0.0006':d=${clipFrames}:s=1080x1920:fps=${fps},` +
      `format=yuv420p,setsar=1[v${i}]`
    );
  });

  // Encadena las transiciones: cada cruce arranca justo al terminar la
  // narracion del segmento anterior (offset = suma de sus duraciones).
  let lastLabel = "v0";
  let acc = 0;
  for (let i = 1; i < n; i++) {
    acc += durations[i - 1];
    const outLabel = i === n - 1 ? "vxfade" : `vx${i}`;
    filterParts.push(
      `[${lastLabel}][v${i}]xfade=transition=fade:duration=${T}:offset=${acc.toFixed(3)}[${outLabel}]`
    );
    lastLabel = outLabel;
  }
  if (n === 1) {
    filterParts.push(`[v0]null[vxfade]`);
    lastLabel = "vxfade";
  }

  filterParts.push(
    `[${lastLabel}]drawtext=${fontOption}textfile='${hookPath}':fontcolor=white:fontsize=76:` +
    `borderw=6:bordercolor=black@0.85:shadowcolor=black@0.6:shadowx=2:shadowy=2:` +
    `x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(t,4)':line_spacing=18[vfinal]`
  );

  filterParts.push(
    `[${narrationIdx}:a]volume=1.0[narr];` +
    `[${ambienceIdx}:a]volume=0.45[amb2];` +
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
    "-t", String(total),
    outputPath,
  ]);

  return outputPath;
}
