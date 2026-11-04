import fs from "node:fs";

async function accessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YT_CLIENT_ID,
      client_secret: process.env.YT_CLIENT_SECRET,
      refresh_token: process.env.YT_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`No se pudo renovar el token de YouTube: ${JSON.stringify(data)}`);
  return data.access_token;
}

// Sube el video a YouTube con la API oficial (subida resumable), marcado como "para ninos".
export async function uploadToYouTube(videoPath, { title, description, tags }) {
  const token = await accessToken();
  const size = fs.statSync(videoPath).size;
  const meta = {
    snippet: { title, description, tags, categoryId: "27", defaultLanguage: "es", defaultAudioLanguage: "es" },
    status: {
      privacyStatus: process.env.YT_PRIVACY || "public",
      selfDeclaredMadeForKids: true,
      embeddable: true,
    },
  };
  const init = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(size),
        "X-Upload-Content-Type": "video/mp4",
      },
      body: JSON.stringify(meta),
    }
  );
  if (!init.ok) throw new Error(`YouTube rechazo iniciar la subida: ${init.status} ${await init.text()}`);
  const uploadUrl = init.headers.get("location");

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(size) },
    body: fs.readFileSync(videoPath),
  });
  const result = await put.json();
  if (!put.ok) throw new Error(`Fallo la subida a YouTube: ${put.status} ${JSON.stringify(result)}`);
  return result;
}

// Pone la miniatura personalizada (el canal debe estar verificado por telefono en YouTube).
export async function uploadThumbnail(videoId, thumbPath) {
  const token = await accessToken();
  const res = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}&uploadType=media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
    body: fs.readFileSync(thumbPath),
  });
  if (!res.ok) throw new Error(`YouTube rechazo la miniatura: ${res.status} ${await res.text()}`);
}
