import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Modelos gratuitos de generacion de imagenes en Hugging Face, en orden de preferencia.
// Si uno deja de estar disponible o esta sobrecargado, se prueba el siguiente automaticamente.
const HF_MODELS = [
  "stabilityai/stable-diffusion-xl-base-1.0",
  "stabilityai/stable-diffusion-2-1",
  "runwayml/stable-diffusion-v1-5",
  "CompVis/stable-diffusion-v1-4",
];

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

  let lastError;
  for (const model of HF_MODELS) {
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
