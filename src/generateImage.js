import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Modelos de respaldo por si la busqueda dinamica en Hugging Face fallara.
const FALLBACK_MODELS = ["stabilityai/stable-diffusion-xl-base-1.0"];

let cachedCandidates = null;

// Pregunta al Hub de Hugging Face que modelos de texto-a-imagen estan
// actualmente disponibles en el proveedor gratuito "hf-inference", en vez de
// tener nombres fijos que Hugging Face puede retirar o migrar de proveedor.
async function getCandidateModels() {
  if (cachedCandidates) return cachedCandidates;

  try {
    const res = await fetch(
      "https://huggingface.co/api/models?pipeline_tag=text-to-image&inference_provider=hf-inference&sort=likes&direction=-1&limit=15"
    );
    if (res.ok) {
      const data = await res.json();
      const ids = data.map((m) => m.id).filter(Boolean);
      if (ids.length > 0) {
        cachedCandidates = [...ids, ...FALLBACK_MODELS];
        return cachedCandidates;
      }
    }
  } catch {
    // sigue al fallback de abajo
  }

  cachedCandidates = FALLBACK_MODELS;
  return cachedCandidates;
}

async function requestImage(model, prompt) {
  const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${model} fallo: ${res.status} ${errorText}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// Genera una imagen gratis con la API de inferencia de Hugging Face (sin marca de agua)
// y la guarda en un archivo temporal, devolviendo la ruta local.
export async function generateImage(sceneDescription) {
  const prompt = `digital illustration, cartoon/animated art style, not photorealistic, mysterious and
intriguing mood, no readable text in the image, no recognizable real faces: ${sceneDescription}`;

  const candidates = await getCandidateModels();

  let lastError;
  for (const model of candidates) {
    try {
      const buffer = await requestImage(model, prompt);
      const filePath = path.join(os.tmpdir(), `post-image-${Date.now()}.png`);
      fs.writeFileSync(filePath, buffer);
      return filePath;
    } catch (err) {
      lastError = err;
      console.warn(String(err));
    }
  }

  throw new Error(`Ningun modelo de Hugging Face pudo generar la imagen. Ultimo error: ${lastError}`);
}
