import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const VOICE = "es-MX-DaliaNeural";

// Divide el texto en fragmentos cortos (por oracion) para pedidos mas
// confiables al servicio de voz.
function splitIntoChunks(text, maxLen = 500) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

// Genera la narracion en voz de la historia completa (texto plano, sin los
// caracteres Unicode de negrita ni emojis) usando la voz gratuita de Microsoft
// Edge (Read Aloud), y devuelve la ruta de los fragmentos de audio generados.
export async function generateVoice(plainText) {
  const chunks = splitIntoChunks(plainText);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "voice-"));
  const chunkPaths = [];

  for (let i = 0; i < chunks.length; i++) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioFilePath } = await tts.toFile(tmpDir, chunks[i]);

    const renamedPath = path.join(tmpDir, `chunk-${i}.mp3`);
    fs.renameSync(audioFilePath, renamedPath);
    chunkPaths.push(renamedPath);
  }

  return { chunkPaths, tmpDir };
}
