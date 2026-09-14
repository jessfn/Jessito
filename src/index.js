import fs from "node:fs";
import { pickContentType } from "./topics.js";
import { generateStory, generateImagePrompt } from "./generateContent.js";
import { generateImage } from "./generateImage.js";
import { generateVoice } from "./generateVoice.js";
import { buildVideo } from "./buildVideo.js";
import { postVideo } from "./postToFacebook.js";
import { loadHistory, recordUsage } from "./history.js";
import { fetchTrendingTopicsMX } from "./trends.js";

async function main() {
  const history = loadHistory();
  const contentType = pickContentType();
  console.log(`Tipo de contenido: ${contentType}`);

  const trends = contentType === "tendencia_del_dia" ? await fetchTrendingTopicsMX() : [];
  if (contentType === "tendencia_del_dia") {
    console.log("Tendencias obtenidas:", trends.slice(0, 5));
  }

  const { text: story, hook, tema, narration } = await generateStory(contentType, {
    history,
    trends,
  });
  console.log("Historia generada:\n", story);

  const scene = await generateImagePrompt(story);
  console.log("Prompt de imagen:", scene);

  const imagePath = await generateImage(scene);
  console.log("Imagen guardada en:", imagePath);

  console.log("Generando narracion de voz...");
  const { chunkPaths, tmpDir } = await generateVoice(narration);
  console.log(`Narracion generada en ${chunkPaths.length} fragmentos.`);

  console.log("Armando el video...");
  const videoPath = await buildVideo({ imagePath, chunkPaths, tmpDir, hookText: hook });
  console.log("Video guardado en:", videoPath);

  const result = await postVideo(videoPath, story);
  console.log("Publicado en Facebook:", result);

  fs.unlinkSync(imagePath);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  recordUsage(history, { hook, tema });
}

main().catch((err) => {
  console.error("Fallo el agente:", err);
  process.exit(1);
});
