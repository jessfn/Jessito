# Jessito - Agente de contenido para Facebook

Genera relatos anonimos de suspenso/morbo (estilo confesion) con imagen ilustrada, y los publica
automaticamente en una Pagina de Facebook 3 veces al dia usando GitHub Actions.

## Que hace

1. Elige un tipo de contenido segun la hora: a las 9am (hora de Mexico) usa un tema en tendencia
   del dia en Mexico (Google Trends); las otras 2 publicaciones rotan entre "confesion anonima" y
   "suceso turbio".
2. Genera el texto del post con Groq (Llama), siempre etiquetado como relato anonimo/ficcion
   (nunca como noticia verificada), evitando repetir temas o ganchos ya usados (ver `data/history.json`).
3. Genera una imagen estilo ilustracion/dibujo animado relacionada con la historia (Hugging Face,
   gratis, sin marca de agua).
4. Publica la foto + texto en la Pagina de Facebook.
5. Guarda el tema y el gancho usados en `data/history.json` (el workflow lo commitea de vuelta al
   repo) para no repetirlos en publicaciones futuras.

## Configuracion necesaria (una sola vez)

### 1. Pagina de Facebook + Meta App
1. Crea o usa una Pagina de Facebook existente (debe ser una Pagina de negocio real; los perfiles
   en "modo profesional" no son compatibles con la API de publicaciones).
2. Ve a https://developers.facebook.com/apps y crea una App (tipo "Business").
3. Genera un **Page Access Token** con los permisos `pages_manage_posts`, `pages_read_engagement`
   y `pages_show_list` (recomendado: via un Usuario del Sistema en Meta Business Suite, con acceso
   "parcial" que incluya la tarea de Contenido — el acceso "total" no sirve para publicar por API).
4. Anota el **Page ID** y el **Page Access Token** (los de sistema no caducan).

### 2. API Key de Groq (texto, gratis)
1. Ve a https://console.groq.com/keys y genera una API key (no pide tarjeta).

### 3. Token de Hugging Face (imagenes, gratis)
1. Ve a https://huggingface.co/settings/tokens y crea un token tipo "Read".

### 4. Secrets en GitHub
En el repo: Settings > Secrets and variables > Actions > New repository secret. Agrega:
- `GROQ_API_KEY`
- `HF_TOKEN`
- `FB_PAGE_ID`
- `FB_PAGE_ACCESS_TOKEN`

### 5. Probar manualmente
Puedes disparar el workflow a mano desde la pestaña "Actions" > "Publicar en Facebook" >
"Run workflow", sin esperar al cron.

## Correr localmente (para pruebas)

```bash
npm install
GROQ_API_KEY=xxx HF_TOKEN=xxx FB_PAGE_ID=xxx FB_PAGE_ACCESS_TOKEN=xxx npm start
```

## Notas importantes

- Facebook puede limitar el alcance de paginas nuevas que publican contenido con tono
  sensacionalista muy seguido; 3 posts al dia es un ritmo razonable para empezar.
- `data/history.json` se va llenando solo; no hace falta tocarlo a mano.
- Las tendencias vienen de un endpoint no oficial de Google Trends; si algun dia deja de responder,
  ese post simplemente cae de vuelta en el tipo "suceso turbio".
