import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT = path.join(__dirname, "..", "..", "assets", "fonts", "Anton-Regular.ttf");
const W = 1080;
const H = 1920;

const SCENES = {
  dia: { sky: ["#6ec6ff", "#d8f3ff"], hill1: "#8fdc7a", hill2: "#62c466", ground: "#4fb35a", accent: "#ff5c8a" },
  atardecer: { sky: ["#ff8fa3", "#ffd9a0"], hill1: "#9ad67a", hill2: "#6fbf6a", ground: "#58a85a", accent: "#ff7a3d" },
  noche: { sky: ["#141a55", "#5b46b5"], hill1: "#3c7a6a", hill2: "#2c6459", ground: "#235247", accent: "#7a5cff" },
  mar: { sky: ["#35c0ff", "#0a4f9e"], hill1: "#f2d78b", hill2: "#e9c872", ground: "#e0bb5e", accent: "#0a8fd6" },
};
const MASCOT_COLORS = ["#ff8fb8", "#7cc6ff", "#ffcf5c", "#a98bff", "#6fdc9a"];

const emojiCache = new Map();

async function emojiSvg(emoji) {
  if (emojiCache.has(emoji)) return emojiCache.get(emoji);
  let cps = [...emoji].map((c) => c.codePointAt(0).toString(16));
  if (!cps.includes("200d")) cps = cps.filter((c) => c !== "fe0f");
  const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${cps.join("-")}.svg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo bajar el emoji ${emoji} (${url}): ${res.status}`);
  const inner = (await res.text()).replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  emojiCache.set(emoji, inner);
  return inner;
}

export async function loadEmojis(lesson) {
  for (const [emoji] of lesson.items) await emojiSvg(emoji);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const rand = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function wrap(text, max) {
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

const star = (cx, cy, r, fill, rot = 0, op = 1) =>
  `<path transform="translate(${cx} ${cy}) rotate(${rot})" d="M0 ${-r} Q${r * 0.18} ${-r * 0.18} ${r} 0 Q${r * 0.18} ${r * 0.18} 0 ${r} Q${-r * 0.18} ${r * 0.18} ${-r} 0 Q${-r * 0.18} ${-r * 0.18} 0 ${-r}Z" fill="${fill}" opacity="${op}"/>`;

function tree(x, y, s, t, seed) {
  const sway = Math.sin(t * 1.4 + seed) * 3;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-16" y="-120" width="32" height="130" rx="10" fill="#8a5a3c"/>
    <g transform="rotate(${sway} 0 -120)">
      <circle cx="0" cy="-190" r="85" fill="#3fa65a"/><circle cx="-55" cy="-140" r="55" fill="#4cb868"/>
      <circle cx="58" cy="-145" r="52" fill="#4cb868"/><circle cx="-20" cy="-215" r="40" fill="#5cc87a" opacity="0.8"/>
    </g></g>`;
}

function flower(x, y, t, i) {
  const colors = ["#ff6f91", "#ffd23f", "#ffffff", "#c58bff"];
  const c = colors[i % 4];
  const sway = Math.sin(t * 2 + i) * 4;
  let petals = "";
  for (let k = 0; k < 5; k++) petals += `<circle cx="${Math.cos((k * 2 * Math.PI) / 5) * 11}" cy="${Math.sin((k * 2 * Math.PI) / 5) * 11 - 34}" r="9" fill="${c}"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${sway})"><rect x="-2" y="-34" width="4" height="36" fill="#3f9a4f"/>${petals}<circle cy="-34" r="6" fill="#ffb300"/></g>`;
}

function background(scene, t) {
  const s = SCENES[scene];
  let out = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  if (scene === "noche") {
    for (let i = 0; i < 36; i++) out += star(rand(i) * W, 80 + rand(i + 50) * 900, 5 + rand(i + 9) * 9, "#fff", t * 20, 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)));
    out += `<circle cx="850" cy="330" r="110" fill="#fff6c8"/><circle cx="815" cy="300" r="105" fill="${s.sky[0]}" opacity="0"/><circle cx="880" cy="300" r="18" fill="#efe3a8"/><circle cx="820" cy="370" r="26" fill="#efe3a8"/>`;
  } else if (scene === "mar") {
    for (let i = 0; i < 5; i++) out += `<path transform="translate(${((t * 20 + i * 260) % 1400) - 150} ${200 + i * 160})" d="M0 0 Q120 -50 240 0 L240 400 L0 400Z" fill="#fff" opacity="0.05"/>`;
    for (let i = 0; i < 14; i++) {
      const y = 1900 - (((t * 60 + rand(i) * 1700) % 1700));
      out += `<circle cx="${80 + rand(i + 3) * 920 + Math.sin(t * 2 + i) * 14}" cy="${y}" r="${8 + rand(i + 5) * 16}" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/>`;
    }
    for (let i = 0; i < 3; i++) {
      const x = ((t * 70 + i * 520) % 1400) - 150;
      out += `<g transform="translate(${x} ${450 + i * 280})"><ellipse rx="42" ry="22" fill="#ffb04d"/><path d="M-38 0 L-70 -22 L-70 22Z" fill="#ff8a3d"/><circle cx="20" cy="-5" r="5" fill="#222"/></g>`;
    }
  } else {
    const sx = scene === "dia" ? 880 : 200;
    const sy = scene === "dia" ? 300 : 520;
    const sunC = scene === "dia" ? "#ffe45e" : "#ffb347";
    let rays = "";
    for (let k = 0; k < 12; k++) rays += `<rect x="-8" y="-170" width="16" height="50" rx="8" fill="${sunC}" opacity="0.7" transform="rotate(${k * 30 + t * 8})"/>`;
    out += `<g transform="translate(${sx} ${sy})">${rays}<circle r="105" fill="${sunC}"/><circle cx="-30" cy="-20" r="9" fill="#e8963a"/><circle cx="30" cy="-20" r="9" fill="#e8963a"/><path d="M-30 25 Q0 55 30 25" stroke="#e8963a" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
    for (let i = 0; i < 6; i++) {
      const x = ((i * 260 + t * (10 + i * 4)) % (W + 400)) - 200;
      const y = 420 + ((i * 197) % 700);
      out += `<g opacity="0.85" transform="translate(${x} ${y + Math.sin(t * 1.2 + i) * 14})"><ellipse rx="100" ry="42" fill="#fff"/><ellipse cx="-55" cy="12" rx="58" ry="32" fill="#fff"/><ellipse cx="60" cy="14" rx="62" ry="30" fill="#fff"/></g>`;
    }
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 90 + i * 480) % 1500) - 200;
      const by = 560 + i * 170 + Math.sin(t * 2 + i) * 30;
      const wing = Math.sin(t * 14 + i) * 14;
      out += `<path transform="translate(${bx} ${by})" d="M-22 ${wing} Q-10 -12 0 0 Q10 -12 22 ${wing}" stroke="#3a3a55" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
  }
  // Colinas, arboles y flores (o fondo arenoso en el mar).
  out += `<path d="M0 1450 Q270 1330 540 1420 T1080 1380 L1080 1920 L0 1920Z" fill="${s.hill1}"/>
    <path d="M0 1560 Q300 1470 620 1540 T1080 1510 L1080 1920 L0 1920Z" fill="${s.hill2}"/>
    <rect y="1640" width="${W}" height="280" fill="${s.ground}"/>`;
  if (scene !== "mar") {
    out += tree(110, 1500, 0.9, t, 1) + tree(980, 1480, 1, t, 2);
    for (let i = 0; i < 9; i++) out += flower(60 + i * 120 + rand(i) * 40, 1700 + rand(i + 20) * 160, t, i);
  } else {
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 190;
      out += `<path transform="translate(${x} 1700)" d="M0 0 Q${Math.sin(t * 2 + i) * 30} -90 0 -180" stroke="#2fa36b" stroke-width="16" fill="none" stroke-linecap="round"/>`;
    }
    out += `<g transform="translate(130 1760)"><path d="M0 0 Q-60 -90 0 -120 Q60 -90 0 0Z" fill="#ff7aa8"/></g>`;
  }
  return out;
}

// Dibuja un item dentro de una tarjeta; maneja las cantidades (numeros).
function itemArt(item, cx, cy, size, t, pop = 1) {
  const [emoji, , , count = 1] = item;
  const place = (x, y, sz, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sz / 36}) translate(-18 -18)">${emojiCache.get(emoji)}</g>`;
  if (count === 1) return place(cx, cy + Math.sin(t * 4) * 12, size * pop, Math.sin(t * 3) * 6);
  const cols = count <= 4 ? count : count <= 6 ? 3 : 5;
  const rows = Math.ceil(count / cols);
  const sz = Math.min(size / cols, size / rows) * 0.95;
  let out = "";
  for (let k = 0; k < count; k++) {
    const r = Math.floor(k / cols);
    const inRow = Math.min(cols, count - r * cols);
    const c = k % cols;
    const x = cx + (c - (inRow - 1) / 2) * sz;
    const y = cy + (r - (rows - 1) / 2) * sz;
    const p = easeOutBack(clamp01((t * 1 - k * 0.1) / 0.4)) * pop;
    out += place(x, y + Math.sin(t * 5 + k) * 6, sz * p, Math.sin(t * 3 + k) * 8);
  }
  return out;
}

function card(item, cx, cy, size, t, accent, opts = {}) {
  const { scale = 1, glow = false, dim = false } = opts;
  const half = (size * scale) / 2;
  return `<g opacity="${dim ? 0.6 : 1}">
    <rect x="${cx - half + 10}" y="${cy - half + 16}" width="${half * 2}" height="${half * 2}" rx="${half * 0.18}" fill="#000" opacity="0.18"/>
    <rect x="${cx - half}" y="${cy - half}" width="${half * 2}" height="${half * 2}" rx="${half * 0.18}" fill="#fff" stroke="${glow ? "#ffd23f" : accent}" stroke-width="${glow ? 14 : 8}"/>
    ${itemArt(item, cx, cy, size * scale * 0.72, t, 1)}</g>`;
}

function mascot(cx, cy, color, t, mood, speaking) {
  const jump = mood === "cheer" ? -Math.abs(Math.sin(t * 7)) * 40 : 0;
  const bob = Math.sin(t * 5) * 8 + jump;
  const blink = Math.sin(t * 1.7) > 0.96 ? 0.1 : 1;
  const mouth = speaking ? 8 + Math.abs(Math.sin(t * 15)) * 24 : 6;
  const up = mood === "cheer" ? -70 : 0;
  const wave = mood === "cheer" ? Math.sin(t * 12) * 14 : Math.sin(t * 6) * 16;
  return `<g transform="translate(${cx} ${cy + bob}) scale(0.95)">
    <ellipse cx="0" cy="${190 - jump}" rx="125" ry="20" fill="#000" opacity="0.16"/>
    <ellipse cx="-50" cy="175" rx="38" ry="18" fill="${color}" stroke="#0002" stroke-width="3"/><ellipse cx="50" cy="175" rx="38" ry="18" fill="${color}" stroke="#0002" stroke-width="3"/>
    <ellipse cx="0" cy="100" rx="95" ry="85" fill="${color}"/><ellipse cx="0" cy="115" rx="62" ry="58" fill="#fff" opacity="0.35"/>
    <path d="M-62 -105 Q-100 -200 -35 -165Z M62 -105 Q100 -200 35 -165Z" fill="${color}"/>
    <path d="M-60 -118 Q-84 -178 -42 -158Z M60 -118 Q84 -178 42 -158Z" fill="#fff" opacity="0.45"/>
    <circle cx="-118" cy="${82 + up + wave}" r="30" fill="${color}"/><circle cx="118" cy="${82 + up - wave}" r="30" fill="${color}"/>
    <circle cx="0" cy="-10" r="128" fill="${color}"/>
    <circle cx="-82" cy="30" r="22" fill="#ff5d85" opacity="0.4"/><circle cx="82" cy="30" r="22" fill="#ff5d85" opacity="0.4"/>
    <circle cx="-46" cy="-25" r="32" fill="#fff"/><circle cx="46" cy="-25" r="32" fill="#fff"/>
    <ellipse cx="-44" cy="-22" rx="17" ry="${21 * blink}" fill="#2b2b3a"/><ellipse cx="48" cy="-22" rx="17" ry="${21 * blink}" fill="#2b2b3a"/>
    <circle cx="-38" cy="-30" r="6" fill="#fff"/><circle cx="54" cy="-30" r="6" fill="#fff"/>
    <path d="M-72 -66 Q-46 -80 -22 -66 M22 -66 Q46 -80 72 -66" stroke="#2b2b3a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="48" rx="34" ry="${mouth}" fill="#7a1f3a"/><ellipse cx="0" cy="${48 + mouth * 0.5}" rx="18" ry="${mouth * 0.42}" fill="#ff7b9c"/>
    <path d="M-24 118 L0 130 L24 118 L24 148 L0 136 L-24 148Z" fill="#ff5c8a"/>
  </g>`;
}

function banner(text, accent, t) {
  return `<g transform="translate(${W / 2} 150) rotate(${Math.sin(t * 2) * 1})">
    <rect x="-470" y="-76" width="940" height="152" rx="76" fill="#000" opacity="0.15" transform="translate(8 12)"/>
    <rect x="-470" y="-76" width="940" height="152" rx="76" fill="#fff" stroke="${accent}" stroke-width="8"/>
    <text text-anchor="middle" y="36" font-family="Anton" font-size="${text.length > 22 ? 70 : 88}" fill="${accent}">${esc(text)}</text></g>`;
}

function caption(text, y, size = 64) {
  return wrap(text, 26)
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${y + i * (size + 14)}" text-anchor="middle" font-family="Anton" font-size="${size}" fill="#fff" stroke="#3a2a5a" stroke-width="12" paint-order="stroke" stroke-linejoin="round">${esc(l)}</text>`
    )
    .join("");
}

function wordPill(word, accent, wp) {
  return `<g transform="translate(${W / 2} 1235) scale(${wp})">
    <rect x="-400" y="-95" width="800" height="150" rx="75" fill="${accent}" stroke="#fff" stroke-width="8"/>
    <text text-anchor="middle" y="40" font-family="Anton" font-size="${word.length > 12 ? 100 : 124}" fill="#fff" stroke="#00000033" stroke-width="6" paint-order="stroke">${esc(word.toUpperCase())}</text></g>`;
}

function sparkles(cx, cy, r, t, n = 7) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.8;
    out += star(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85, 16 + Math.sin(t * 4 + i) * 7, "#ffe45e", t * 40, 0.9);
  }
  return out;
}

function confetti(t) {
  const colors = ["#ff5c8a", "#ffd23f", "#4cc9f0", "#7bd88f", "#a98bff"];
  let out = "";
  for (let i = 0; i < 40; i++) {
    const x = rand(i) * W + Math.sin(t * 3 + i) * 30;
    const y = ((t * 380 + rand(i + 40) * 2200) % 2200) - 200;
    out += `<rect x="${x}" y="${y}" width="16" height="26" fill="${colors[i % 5]}" transform="rotate(${t * 200 + i * 40} ${x} ${y})"/>`;
  }
  return out;
}

// Arma el SVG del cuadro en el segundo `t` de la leccion.
export function frameSvg({ lesson, seg, segT, t, total, scene, mascotColor }) {
  const accent = SCENES[scene].accent;
  let body = "";
  let mood = "idle";
  const items = lesson.items;
  if (seg.kind === "intro" || seg.kind === "outro" || seg.kind === "recap") {
    const pop = easeOutBack(clamp01(segT / 0.6));
    if (seg.kind === "recap") {
      const n = items.length;
      const cols = n > 4 ? 3 : n;
      const rows = Math.ceil(n / cols);
      const size = Math.min(300, 960 / cols - 20);
      items.forEach((it, i) => {
        const r = Math.floor(i / cols);
        const inRow = Math.min(cols, n - r * cols);
        const x = W / 2 + ((i % cols) - (inRow - 1) / 2) * (size + 24);
        const y = 640 + r * (size + 40);
        const p = easeOutBack(clamp01((segT - i * 0.25) / 0.45));
        body += card(it, x, y, size * p, t, accent, { scale: 1 });
        if (p > 0.5) body += `<text x="${x}" y="${y + size / 2 + 56}" text-anchor="middle" font-family="Anton" font-size="46" fill="#fff" stroke="#3a2a5a" stroke-width="9" paint-order="stroke" opacity="${clamp01(p)}">${esc(it[1])}</text>`;
      });
      mood = "cheer";
      body += confetti(segT);
    } else {
      const shown = items.slice(0, 3);
      shown.forEach((it, k) => {
        body += card(it, 270 + k * 270, 760 + Math.sin(t * 3 + k) * 20, 250, t, accent, { scale: pop });
      });
      body += caption(seg.kind === "intro" ? "¡Hola, amiguitos!" : "¡Hasta mañana!", 1130, 84);
      if (seg.kind === "outro") {
        mood = "cheer";
        body += confetti(segT);
      }
    }
  } else if (seg.kind === "present" || seg.kind === "repeat") {
    const it = items[seg.itemIndex];
    const pop = easeOutBack(clamp01(segT / 0.5));
    body += sparkles(W / 2, 780, 400, t);
    body += card(it, W / 2, 780, 640, t, accent, { scale: pop });
    body += wordPill(it[1], accent, easeOutBack(clamp01((segT - 0.1) / 0.4)));
    body += seg.kind === "present" ? caption(it[2], 1380, 58) : caption("¡Repite conmigo!", 1390, 78);
    if (seg.kind === "repeat") mood = "cheer";
  } else if (seg.kind === "quizintro") {
    body += caption("¡Juguemos!", 640, 130);
    body += caption("Encuentra la respuesta", 840, 66);
    body += star(W / 2, 1120, 150 + Math.sin(t * 5) * 14, "#ffe45e", t * 30);
  } else {
    const choices = seg.choices;
    const answering = seg.kind === "quiza";
    choices.forEach((ci, k) => {
      const x = 200 + k * 340;
      const correct = ci === seg.itemIndex;
      const pop = answering ? 1 : easeOutBack(clamp01((segT - k * 0.15) / 0.4));
      const sc = answering && correct ? 1.12 + Math.sin(segT * 8) * 0.03 : 1;
      body += card(items[ci], x, 800, 300 * pop, t, accent, { scale: sc, glow: answering && correct, dim: answering && !correct });
      if (answering && correct) {
        body += `<g transform="translate(${x} 1010)"><circle r="46" fill="#3ccf6b" stroke="#fff" stroke-width="7"/><path d="M-22 2 L-6 20 L24 -16" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      }
    });
    body += caption(answering ? `¡Muy bien! ${items[seg.itemIndex][1]}` : `Encuentra: ${items[seg.itemIndex][1]}`, 1180, 70);
    if (answering) {
      mood = "cheer";
      body += confetti(segT);
    }
  }
  const progress = `<rect width="${W}" height="14" fill="#fff" opacity="0.35"/><rect width="${(W * t) / total}" height="14" fill="${accent}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${background(scene, t)}${banner(lesson.titulo, accent, t)}${body}${mascot(W / 2, 1640, mascotColor, t, mood, true)}${progress}</svg>`;
}

export function renderPng(svg) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: "Anton" },
  })
    .render()
    .asPng();
}

export { SCENES, MASCOT_COLORS };
