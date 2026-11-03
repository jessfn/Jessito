import fs from "node:fs";
import path from "node:path";

const HISTORY_PATH = path.join(process.cwd(), "data", "kids_history.json");

export function loadKidsHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf-8"));
  } catch {
    return { temas: [] };
  }
}

export function recordKidsUsage(history, tema) {
  history.temas.push(tema);
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

// Primera leccion no usada; si ya se usaron todas, vuelve a empezar la rotacion.
export function pickLesson(lessons, history) {
  const used = new Set(history.temas.slice(-lessons.length));
  return lessons.find((l) => !used.has(l.tema)) ?? lessons[0];
}
