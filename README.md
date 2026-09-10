# Jessito - Agente de contenido para Facebook

Genera relatos anonimos de suspenso/morbo (estilo confesion, coloquial mexicano) con imagen
ilustrada, y los publica automaticamente en una Pagina de Facebook 3 veces al dia usando
GitHub Actions.

## Que hace

1. Elige un tipo de contenido (confesion anonima o suceso turbio) y un tema al azar.
2. Genera el texto del post con Gemini, siempre etiquetado como relato anonimo/ficcion
   (nunca como noticia verificada).
3. Genera una imagen estilo ilustracion/dibujo animado relacionada con la historia.
4. Publica la foto + texto en la Pagina de Facebook.

## Configuracion necesaria (una sola vez)

### 1. Pagina de Facebook + Meta App
1. Crea o usa una Pagina de Facebook existente.
2. Ve a https://developers.facebook.com/apps y crea una App (tipo "Business").
3. Agrega el producto "Facebook Login" o usa el Graph API Explorer para generar un
   **token de la Pagina** con los permisos `pages_manage_posts` y `pages_read_engagement`.
4. Convierte ese token en uno de **larga duracion** (60 dias) o usalo con un token de
   sistema (System User) si quieres que no caduque tan seguido.
5. Anota el **Page ID** y el **Page Access Token**.

### 2. API Key de Gemini
1. Ve a https://aistudio.google.com/app/apikey y genera una API key (capa gratuita disponible).

### 3. Secrets en GitHub
En el repo: Settings > Secrets and variables > Actions > New repository secret. Agrega:
- `GEMINI_API_KEY`
- `FB_PAGE_ID`
- `FB_PAGE_ACCESS_TOKEN`

### 4. Probar manualmente
Puedes disparar el workflow a mano desde la pestaña "Actions" > "Publicar en Facebook" >
"Run workflow", sin esperar al cron.

## Correr localmente (para pruebas)

```bash
npm install
GEMINI_API_KEY=xxx FB_PAGE_ID=xxx FB_PAGE_ACCESS_TOKEN=xxx npm start
```

## Notas importantes

- El token de Pagina de larga duracion caduca cada ~60 dias; hay que renovarlo a mano
  (o usar un token de sistema de una Business App para que dure indefinidamente).
- El contenido de "noticias de entretenimiento" no esta incluido en esta version porque
  requeriria una fuente de noticias real (ej. una News API) para no inventar informacion.
  Se puede agregar despues como un tercer tipo de contenido.
- Facebook puede limitar el alcance de paginas nuevas que publican contenido con tono
  sensacionalista muy seguido; 3 posts al dia es un ritmo razonable para empezar.
