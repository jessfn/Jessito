import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT = path.join(__dirname, "..", "..", "assets", "fonts", "Anton-Regular.ttf");
const W = 1080;
const H = 1920;

const THEMES = [
  ["#ffd6e8", "#ffb3d1", "#7bd88f"],
  ["#c9ecff", "#8fd3ff", "#ffd166"],
  ["#fff1b8", "#ffd966", "#8ad7a0"],
  ["#e3d4ff", "#c3a6ff", "#ffc2a6"],
  ["#d4f5dc", "#9be3b0", "#ffe08a"],
];
const MASCOT_COLORS = ["#ff8fb8", "#7cc6ff", "#ffcf5c", "#a98bff", "#6fdc9a"];

const emojiCache = new Map();

// Descarga el dibujo vectorial (Twemoji, CC-BY 4.0) de un emoji y devuelve su contenido SVG.
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
const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const clamp01 = (x) => Math.min(1, Math.max(0, x));

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

function mascot(cx, cy, color, t, speaking) {
  const bob = Math.sin(t * 5) * 10;
  const blink = Math.sin(t * 1.7) > 0.96 ? 0.1 : 1;
  const mouth = speaking ? 10 + Math.abs(Math.sin(t * 14)) * 26 : 6;
  const wave = Math.sin(t * 7) * 18;
  return `<g transform="translate(${cx} ${cy + bob})">
    <ellipse cx="0" cy="150" rx="120" ry="22" fill="#000" opacity="0.12"/>
    <path d="M-70 -120 L-95 -200 L-30 -150 Z M70 -120 L95 -200 L30 -150 Z" fill="${color}"/>
    <circle cx="0" cy="0" r="135" fill="${color}"/>
    <circle cx="0" cy="40" r="95" fill="#fff" opacity="0.28"/>
    <circle cx="-120" cy="${60 + wave}" r="34" fill="${color}"/>
    <circle cx="120" cy="${60 - wave}" r="34" fill="${color}"/>
    <circle cx="-48" cy="-20" r="30" fill="#fff"/><circle cx="48" cy="-20" r="30" fill="#fff"/>
    <ellipse cx="-46" cy="-18" rx="14" ry="${18 * blink}" fill="#2b2b3a"/>
    <ellipse cx="50" cy="-18" rx="14" ry="${18 * blink}" fill="#2b2b3a"/>
    <circle cx="-90" cy="25" r="20" fill="#ff6f91" opacity="0.45"/><circle cx="90" cy="25" r="20" fill="#ff6f91" opacity="0.45"/>
    <ellipse cx="0" cy="50" rx="30" ry="${mouth}" fill="#7a1f3a"/>
    <ellipse cx="0" cy="${50 + mouth * 0.45}" rx="16" ry="${mouth * 0.4}" fill="#ff7b9c"/>
  </g>`;
}

function background(theme, t) {
  const [c1, c2, ground] = theme;
  let deco = "";
  for (let i = 0; i < 7; i++) {
    const x = ((i * 190 + t * (12 + i * 3)) % (W + 300)) - 150;
    const y = 220 + ((i * 263) % 900);
    deco += `<g opacity="0.5" transform="translate(${x} ${y + Math.sin(t * 1.3 + i) * 18})">
      <ellipse rx="95" ry="42" fill="#fff"/><ellipse cx="-50" cy="12" rx="55" ry="32" fill="#fff"/><ellipse cx="55" cy="14" rx="60" ry="30" fill="#fff"/></g>`;
  }
  return `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>${deco}
    <ellipse cx="${W / 2}" cy="${H + 100}" rx="900" ry="420" fill="${ground}"/>`;
}

function emojiGroup(emoji, cx, cy, size, rot = 0) {
  const s = size / 36;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(-18 -18)">${emojiCache.get(emoji)}</g>`;
}

function banner(text, t) {
  return `<g transform="translate(${W / 2} 150) rotate(${Math.sin(t * 2) * 1.2})">
    <rect x="-470" y="-80" width="940" height="160" rx="80" fill="#fff" opacity="0.92"/>
    <text text-anchor="middle" y="38" font-family="Anton" font-size="${text.length > 22 ? 74 : 92}" fill="#ff5c8a">${esc(text)}</text></g>`;
}

function caption(text, y) {
  const lines = wrap(text, 24);
  return lines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${y + i * 78}" text-anchor="middle" font-family="Anton" font-size="68" fill="#fff" stroke="#3a2a5a" stroke-width="12" paint-order="stroke" stroke-linejoin="round">${esc(l)}</text>`
    )
    .join("");
}

// Arma el SVG del cuadro en el segundo `t` de la leccion.
export function frameSvg({ lesson, seg, segT, t, index, total }) {
  const theme = THEMES[index % THEMES.length];
  const color = MASCOT_COLORS[index % MASCOT_COLORS.length];
  let body = "";
  if (seg.kind === "item") {
    const [emoji, word, dato, count = 1] = lesson.items[seg.itemIndex];
    const pop = easeOutBack(clamp01(segT / 0.45));
    const bounce = Math.sin(segT * 4.5) * 22;
    if (count === 1) {
      body += emojiGroup(emoji, W / 2, 760 + bounce, 520 * pop, Math.sin(segT * 3) * 6);
    } else {
      const cols = count <= 5 ? count : 5;
      const rows = Math.ceil(count / cols);
      const size = Math.min(190, 900 / cols);
      for (let k = 0; k < count; k++) {
        const r = Math.floor(k / cols);
        const c = k % cols;
        const inRow = Math.min(cols, count - r * cols);
        const x = W / 2 + (c - (inRow - 1) / 2) * (size + 12);
        const y = 760 - ((rows - 1) * (size + 12)) / 2 + r * (size + 12);
        const p = easeOutBack(clamp01((segT - k * 0.12) / 0.4));
        body += emojiGroup(emoji, x, y + Math.sin(segT * 5 + k) * 10, size * p, Math.sin(segT * 3 + k) * 8);
      }
    }
    const wp = easeOutBack(clamp01((segT - 0.15) / 0.4));
    body += `<text x="${W / 2}" y="1160" text-anchor="middle" font-family="Anton" font-size="${word.length > 12 ? 130 : 170}" fill="#ffe14d" stroke="#3a2a5a" stroke-width="16" paint-order="stroke" stroke-linejoin="round" transform="translate(${W / 2} 1100) scale(${wp}) translate(${-W / 2} -1100)">${esc(word.toUpperCase())}</text>`;
    body += caption(dato, 1290);
  } else if (seg.kind === "intro") {
    const pop = easeOutBack(clamp01(segT / 0.6));
    for (let k = 0; k < Math.min(3, lesson.items.length); k++) {
      body += emojiGroup(lesson.items[k][0], 270 + k * 270, 700 + Math.sin(segT * 4 + k) * 30, 270 * pop, Math.sin(segT * 3 + k) * 10);
    }
    body += caption("¡Hola, amiguitos!", 1010);
  } else {
    for (let k = 0; k < Math.min(5, lesson.items.length); k++) {
      body += emojiGroup(lesson.items[k][0], 190 + k * 175, 760 + Math.sin(segT * 5 + k) * 40, 170, Math.sin(segT * 4 + k) * 12);
    }
    body += caption("¡Suscríbete para más!", 1010);
    body += caption("¡Hasta mañana!", 1110);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${background(theme, t)}${banner(lesson.titulo, t)}${body}${mascot(W / 2, 1640, color, t, true)}</svg>`;
  return svg;
}

export function renderPng(svg) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    font: { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: "Anton" },
  })
    .render()
    .asPng();
}
