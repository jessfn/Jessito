import fs from "node:fs";

const PAGE_ID = process.env.FB_PAGE_ID;
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const GRAPH_VERSION = "v21.0";

// Publica una foto con texto (caption) en la Pagina de Facebook.
export async function postPhoto(imagePath, caption) {
  if (!PAGE_ID || !PAGE_TOKEN) {
    throw new Error("Faltan FB_PAGE_ID o FB_PAGE_ACCESS_TOKEN en las variables de entorno.");
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PAGE_ID}/photos`;

  const form = new FormData();
  form.append("caption", caption);
  form.append("access_token", PAGE_TOKEN);
  form.append("source", new Blob([fs.readFileSync(imagePath)]), "post.png");

  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Error al publicar en Facebook: ${JSON.stringify(data)}`);
  }

  return data;
}
