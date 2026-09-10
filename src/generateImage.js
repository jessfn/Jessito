import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HF_MODEL = "black-forest-labs/FLUX.1-schnell";

// Genera una imagen gratis con la API de inferencia de Hugging Face (sin marca de agua)
// y la guarda en un archivo temporal, devolviendo la ruta local.
export async function generateImage(sceneDescription) {
  const prompt = `digital illustration, cartoon/animated art style, not photorealistic, mysterious and
intriguing mood, no readable text in the image, no recognizable real faces: ${sceneDescription}`;

  const res = await fetch(`https://router.huggingface.co/hf-inference/models/${HF_MODEL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Hugging Face no genero la imagen: ${res.status} ${errorText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(os.tmpdir(), `post-image-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
