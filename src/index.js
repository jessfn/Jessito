import fs from "node:fs";
import { pickContentType } from "./topics.js";
import { generateStory, generateImagePrompt } from "./generateContent.js";
import { generateImage } from "./generateImage.js";
import { postPhoto } from "./postToFacebook.js";

async function main() {
  const contentType = pickContentType();
  console.log(`Tipo de contenido: ${contentType}`);

  const story = await generateStory(contentType);
  console.log("Historia generada:\n", story);

  const scene = await generateImagePrompt(story);
  console.log("Prompt de imagen:", scene);

  const imagePath = await generateImage(scene);
  console.log("Imagen guardada en:", imagePath);

  const result = await postPhoto(imagePath, story);
  console.log("Publicado en Facebook:", result);

  fs.unlinkSync(imagePath);
}

main().catch((err) => {
  console.error("Fallo el agente:", err);
  process.exit(1);
});
