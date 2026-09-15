import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Modelos de Pollinations a intentar en orden, por si uno especifico falla.
const MODELS = ["flux", "turbo", null];

function buildUrl(prompt, model) {
  const seed = Math.floor(Math.random() * 1_000_000);
  const modelParam = model ? `&model=${model}` : "";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&seed=${seed}&nologo=true${modelParam}`;
}

async function requestImage(url) {
  const res = await fetch(url, {
    headers: process.env.POLLINATIONS_TOKEN
      ? { Authorization: `Bearer ${process.env.POLLINATIONS_TOKEN}` }
      : {},
  });

  if (!res.ok) {
    throw new Error(`Pollinations fallo: ${res.status} ${res.statusText}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// Genera una imagen gratis e ilimitada con Pollinations.ai a partir de un prompt
// ya formado. La marca de agua solo se quita de forma confiable con una cuenta
// registrada (token gratis en auth.pollinations.ai) enviado como Bearer token,
// no solo con nologo=true. Reintenta con distintos modelos/pausas ante errores
// temporales del servicio.
export async function generateImage(prompt) {
  let lastError;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const buffer = await requestImage(buildUrl(prompt, model));
        const filePath = path.join(os.tmpdir(), `post-image-${Date.now()}-${Math.random()}.png`);
        fs.writeFileSync(filePath, buffer);
        return filePath;
      } catch (err) {
        lastError = err;
        console.warn(String(err));
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  throw new Error(`Pollinations no genero la imagen tras varios intentos. Ultimo error: ${lastError}`);
}
