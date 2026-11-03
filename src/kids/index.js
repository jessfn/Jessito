import fs from "node:fs";
import { LESSONS } from "./curriculum.js";
import { loadKidsHistory, recordKidsUsage, pickLesson } from "./history.js";
import { buildKidsVideo } from "./buildKidsVideo.js";
import { uploadToYouTube } from "./uploadYoutube.js";

const CREDITS =
  "Dibujos: Twemoji (CC BY 4.0). Voz: Microsoft Edge Read Aloud. Música y animación originales.";

function metadata(lesson) {
  const items = lesson.items.map((i) => i[1]).join(", ");
  return {
    title: `${lesson.titulo} para niños 🎈 Aprende jugando #Shorts`.slice(0, 100),
    description:
      `¡Ven a aprender ${lesson.titulo.toLowerCase()}! Hoy vemos: ${items}.\n\n` +
      "🔔 ¡Suscríbete para un video nuevo cada día!\n👍 Dale like y compártelo con otros peques.\n" +
      "💬 Para papás: pídele a tu peque que repita cada palabra y la busque en casa.\n\n" +
      `#Shorts #ParaNiños #AprenderJugando #VideosInfantiles #Preescolar\n\n${CREDITS}`,
    tags: ["para niños", "aprender jugando", lesson.titulo.toLowerCase(), "videos educativos", "shorts para niños", "preescolar", "animación infantil"],
  };
}

async function main() {
  const history = loadKidsHistory();
  const lesson = pickLesson(LESSONS, history);
  console.log(`Leccion de hoy: ${lesson.tema}`);

  const { videoPath, tmpDir } = await buildKidsVideo(lesson);
  console.log("Video listo:", videoPath);

  if (process.env.SKIP_UPLOAD) {
    const dest = `kids-${lesson.tema}.mp4`;
    fs.copyFileSync(videoPath, dest);
    console.log(`SKIP_UPLOAD activo: copiado a ${dest}`);
  } else {
    const result = await uploadToYouTube(videoPath, metadata(lesson));
    console.log("Subido a YouTube:", `https://youtube.com/shorts/${result.id}`);
    recordKidsUsage(history, lesson.tema);
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error("Fallo el agente de YouTube:", err);
  process.exit(1);
});
