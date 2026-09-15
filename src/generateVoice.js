import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const VOICE = "es-MX-JorgeNeural";

// Narra cada segmento del guion por separado con la voz gratuita de Microsoft
// Edge (Read Aloud) y devuelve un archivo de audio por segmento, en orden.
// Tener el audio por beat permite sincronizar cada imagen con lo que se narra.
export async function generateVoice(segments) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "voice-"));
  const audioPaths = [];

  for (let i = 0; i < segments.length; i++) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioFilePath } = await tts.toFile(tmpDir, segments[i]);

    const renamedPath = path.join(tmpDir, `seg-${String(i).padStart(3, "0")}.mp3`);
    fs.renameSync(audioFilePath, renamedPath);
    audioPaths.push(renamedPath);
  }

  return { audioPaths, tmpDir };
}
