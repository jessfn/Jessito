// Se corre UNA vez en tu PC para obtener el YT_REFRESH_TOKEN:
//   YT_CLIENT_ID=xxx YT_CLIENT_SECRET=xxx node src/kids/getYoutubeToken.js
// Abre el enlace que imprime, acepta el permiso con la cuenta del canal y copia el token.
import http from "node:http";

const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}`;
const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: YT_CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload",
    access_type: "offline",
    prompt: "consent",
  });
console.log("Abre este enlace en el navegador:\n\n" + authUrl + "\n");

http
  .createServer(async (req, res) => {
    const code = new URL(req.url, REDIRECT).searchParams.get("code");
    if (!code) return res.end("Falta el codigo");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: YT_CLIENT_ID,
        client_secret: YT_CLIENT_SECRET,
        redirect_uri: REDIRECT,
        grant_type: "authorization_code",
      }),
    });
    const data = await tokenRes.json();
    res.end("Listo, ya puedes cerrar esta pestana y volver a la terminal.");
    console.log("YT_REFRESH_TOKEN =", data.refresh_token ?? data);
    process.exit(0);
  })
  .listen(PORT);
