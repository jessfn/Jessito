import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Usa el modelo de imagenes de Gemini (estilo ilustracion/dibujo) y guarda el resultado
// en un archivo temporal, devolviendo la ruta local.
export async function generateImage(sceneDescription) {
  const prompt = `Digital illustration, cartoon/animated art style (not photorealistic), mysterious and
intriguing mood, no readable text in the image, no recognizable real faces: ${sceneDescription}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart) {
    throw new Error("Gemini no devolvio ninguna imagen para el prompt dado.");
  }

  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  const filePath = path.join(os.tmpdir(), `post-image-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
