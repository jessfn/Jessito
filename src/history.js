import fs from "node:fs";
import path from "node:path";

const HISTORY_PATH = path.join(process.cwd(), "data", "history.json");
const MAX_ENTRIES = 150;

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export function loadHistory() {
  try {
    const raw = fs.readFileSync(HISTORY_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { hooks: [], temas: [] };
  }
}

export function isRepeated(history, text) {
  const normalized = normalize(text);
  return history.hooks.some((h) => normalize(h) === normalized);
}

export function isTemaUsed(history, tema) {
  return history.temas.includes(tema);
}

export function recordUsage(history, { hook, tema }) {
  if (hook) history.hooks.push(hook);
  if (tema) history.temas.push(tema);

  history.hooks = history.hooks.slice(-MAX_ENTRIES);
  history.temas = history.temas.slice(-MAX_ENTRIES);

  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}
