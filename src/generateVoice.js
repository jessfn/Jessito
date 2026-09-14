import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const TTS_MODEL = "facebook/mms-tts-spa";

// Divide el texto en fragmentos cortos (por oracion) para no exceder los
// limites del modelo de texto-a-voz en una sola llamada.
function splitIntoChunks(text, maxLen = 280) {
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

async function synthesizeChunk(text) {
  const res = await fetch(`https://router.huggingface.co/hf-inference/models/${TTS_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`TTS fallo: ${res.status} ${errorText}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// Genera la narracion en voz de la historia completa (texto plano, sin los
// caracteres Unicode de negrita) y devuelve la ruta del archivo de audio.
export async function generateVoice(plainText) {
  const chunks = splitIntoChunks(plainText);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "voice-"));
  const chunkPaths = [];

  for (let i = 0; i < chunks.length; i++) {
    const buffer = await synthesizeChunk(chunks[i]);
    const chunkPath = path.join(tmpDir, `chunk-${i}.wav`);
    fs.writeFileSync(chunkPath, buffer);
    chunkPaths.push(chunkPath);
  }

  return { chunkPaths, tmpDir };
}
