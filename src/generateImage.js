import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Genera una imagen con la API de imagenes de OpenAI y la guarda en un archivo
// temporal, devolviendo la ruta local.
export async function generateImage(sceneDescription) {
  const prompt = `Digital illustration, cartoon/animated art style, not photorealistic, mysterious and
intriguing mood, no readable text in the image, no recognizable real faces: ${sceneDescription}`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI no genero la imagen: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const base64 = data.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error("OpenAI no devolvio ninguna imagen.");
  }

  const buffer = Buffer.from(base64, "base64");
  const filePath = path.join(os.tmpdir(), `post-image-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
