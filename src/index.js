import fs from "node:fs";
import { pickContentType } from "./topics.js";
import { generateStory, buildSegments, generateSegmentImagePrompts } from "./generateContent.js";
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

  const { text: caption, hook, tema, narration } = await generateStory(contentType, {
    history,
    trends,
  });
  console.log("Historia generada:\n", caption);

  // Guion segmentado: cada beat tendra su propia imagen y su propia voz.
  const segmentTexts = buildSegments(narration);
  console.log(`Guion en ${segmentTexts.length} segmentos.`);

  const imagePrompts = await generateSegmentImagePrompts(segmentTexts);

  console.log("Generando imagenes por segmento...");
  const imagePaths = [];
  for (const prompt of imagePrompts) {
    imagePaths.push(await generateImage(prompt));
  }

  console.log("Narrando cada segmento...");
  const { audioPaths, tmpDir } = await generateVoice(segmentTexts);

  const segments = segmentTexts.map((_, i) => ({
    imagePath: imagePaths[i],
    audioPath: audioPaths[i],
  }));

  console.log("Editando el video...");
  const videoPath = await buildVideo({ segments, tmpDir, hookText: hook });
  console.log("Video listo:", videoPath);

  const result = await postVideo(videoPath, caption);
  console.log("Publicado en Facebook:", result);

  for (const p of imagePaths) fs.unlinkSync(p);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  recordUsage(history, { hook, tema });
}

main().catch((err) => {
  console.error("Fallo el agente:", err);
  process.exit(1);
});
