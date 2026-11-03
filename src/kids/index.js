import fs from "node:fs";
import { LESSONS } from "./curriculum.js";
import { loadKidsHistory, recordKidsUsage, pickLesson } from "./history.js";
import { buildKidsVideo } from "./buildKidsVideo.js";
import { uploadToYouTube, uploadThumbnail } from "./uploadYoutube.js";

const CREDITS =
  "Dibujos: Twemoji (CC BY 4.0). Voz: Microsoft Edge Read Aloud. Música, sonidos y animación originales.";

function metadata(lesson, chapters) {
  const items = lesson.items.map((i) => i[1]).join(", ");
  return {
    title: `${lesson.titulo} para niños 🎈 Aprende jugando con Pompi | Videos educativos`.slice(0, 100),
    description:
      `¡Ven a aprender ${lesson.titulo.toLowerCase()} con Pompi! Hoy vemos: ${items}. Además hay juegos para adivinar, un repaso y un baile final. 🎉\n\n` +
      `⏱️ Capítulos\n${chapters.join("\n")}\n\n` +
      "🔔 ¡Suscríbete para un video nuevo cada día!\n👍 Dale like y compártelo con otros peques.\n" +
      "💬 Para papás: pídele a tu peque que repita cada palabra, juegue a adivinar y baile al final.\n\n" +
      `#ParaNiños #AprenderJugando #VideosInfantiles #Preescolar #CancionesInfantiles\n\n${CREDITS}`,
    tags: ["para niños", "aprender jugando", lesson.titulo.toLowerCase(), "videos educativos", "videos infantiles", "preescolar", "animación infantil", "juegos para niños", "aprender en español"],
  };
}

async function main() {
  const history = loadKidsHistory();
  const forced = process.env.KIDS_TEMA && LESSONS.find((l) => l.tema === process.env.KIDS_TEMA);
  const lesson = forced || pickLesson(LESSONS, history);
  console.log(`Leccion de hoy: ${lesson.tema}`);

  const { videoPath, thumbPath, tmpDir, chapters } = await buildKidsVideo(lesson);
  console.log("Video listo:", videoPath);

  if (process.env.SKIP_UPLOAD) {
    fs.copyFileSync(videoPath, `kids-${lesson.tema}.mp4`);
    fs.copyFileSync(thumbPath, `kids-${lesson.tema}-miniatura.png`);
    console.log(`SKIP_UPLOAD activo: copiado a kids-${lesson.tema}.mp4 y miniatura`);
  } else {
    const result = await uploadToYouTube(videoPath, metadata(lesson, chapters));
    console.log("Subido a YouTube:", `https://youtube.com/watch?v=${result.id}`);
    try {
      await uploadThumbnail(result.id, thumbPath);
      console.log("Miniatura subida");
    } catch (err) {
      console.error("No se pudo subir la miniatura (el video ya quedo publicado):", err.message);
    }
    if (!forced) recordKidsUsage(history, lesson.tema);
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error("Fallo el agente de YouTube:", err);
  process.exit(1);
});
