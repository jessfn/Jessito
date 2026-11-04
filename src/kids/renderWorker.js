// Renderiza un rango de cuadros y los escribe (PNG) por stdout. Se corre en un proceso aparte
// y se reinicia cada pocos cientos de cuadros porque el renderizador SVG acumula memoria.
import fs from "node:fs";
import { once } from "node:events";
import { LESSONS } from "./curriculum.js";
import { frameSvg, renderPng, loadEmojis } from "./render.js";

const [planPath, startArg, endArg] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
const lesson = LESSONS.find((l) => l.tema === plan.tema);
await loadEmojis(lesson);

const starts = [];
let acc = 0;
for (const s of plan.segs) {
  starts.push(acc);
  acc += s.duration;
}

let segIndex = 0;
for (let f = Number(startArg); f < Number(endArg); f++) {
  const t = f / plan.fps;
  segIndex = 0;
  while (segIndex < plan.segs.length - 1 && t >= starts[segIndex + 1]) segIndex++;
  const svg = frameSvg({
    lesson,
    seg: plan.segs[segIndex],
    segT: t - starts[segIndex],
    t,
    total: plan.total,
    scene: plan.scene,
    mascotColor: plan.mascotColor,
  });
  if (!process.stdout.write(renderPng(svg))) await once(process.stdout, "drain");
}
