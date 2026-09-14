import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Genera una imagen gratis e ilimitada con Pollinations.ai. La marca de agua
// solo se quita de forma confiable con una cuenta registrada (token gratis en
// auth.pollinations.ai) enviado como Bearer token, no solo con nologo=true.
export async function generateImage(sceneDescription) {
  const prompt = `photorealistic cinematic photograph, dramatic moody lighting, mysterious and
intriguing atmosphere, shot like a real news/documentary photo (not a cartoon, not an illustration,
not a painting): ${sceneDescription}. Faces must be unrecognizable (turned away, in shadow,
backlit, or blurred) and not resemble any real identifiable person. Absolutely no text, letters,
words, numbers, logos, watermarks, signatures, or captions anywhere in the image, including in the
corners or edges. Clean image with zero written content of any kind.`;

  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&seed=${seed}&nologo=true&model=flux`;

  const res = await fetch(url, {
    headers: process.env.POLLINATIONS_TOKEN
      ? { Authorization: `Bearer ${process.env.POLLINATIONS_TOKEN}` }
      : {},
  });

  if (!res.ok) {
    throw new Error(`Pollinations no genero la imagen: ${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(os.tmpdir(), `post-image-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
