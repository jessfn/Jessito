import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Genera una imagen gratis con Pollinations.ai (no requiere API key) y la guarda
// en un archivo temporal, devolviendo la ruta local.
export async function generateImage(sceneDescription) {
  const prompt = `digital illustration, cartoon/animated art style, not photorealistic, mysterious and
intriguing mood, no readable text in the image, no recognizable real faces: ${sceneDescription}`;

  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=2048&height=2048&seed=${seed}&nologo=true&nofeed=true&model=turbo`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Pollinations no genero la imagen: ${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(os.tmpdir(), `post-image-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
