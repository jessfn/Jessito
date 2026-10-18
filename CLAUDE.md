# Instrucciones del proyecto

## Videos con audio (regla permanente)

Los visores de archivos de la app pueden no reproducir el audio de un MP4 (H.264/AAC) o arrancarlo silenciado. Para que el usuario siempre oiga el video, cada vez que se genere un video:

1. **Audio y formatos**
   - Normalizar el audio a -14 LUFS (`loudnorm=I=-14:TP=-1.0:LRA=7`).
   - Exportar MP4 (H.264 yuv420p + AAC 48 kHz estéreo, `+faststart`) **y** WebM (VP9 + Opus). Con `.mp3` del audio suelto.
   - Verificar el audio decodificado del archivo final (nivel por tramos con `ffmpeg`), no solo el `.wav` de origen.
2. **Publicar una página (Artifact) con el video**
   - `<video controls playsinline>` con `<source>` MP4 y luego WebM, más poster.
   - Botón grande "Reproducir con sonido": en el clic poner `muted=false`, `volume=1`, reanudar el `AudioContext` y llamar a `play()`.
   - Medidor "Señal de audio" (WebAudio `AnalyserNode`) para mostrar si sale sonido.
   - Reproductor `<audio>` con el MP3 como respaldo.
   - Cada archivo publicado debe pesar 15 MB o menos (reducir `crf` del MP4 si hace falta).
3. **Probar en Chromium** (Playwright) que tras el clic el medidor detecta audio, antes de entregar.
4. Entregar al usuario el enlace de la página y, además, los archivos MP4, WebM y MP3.

Voz usada hasta ahora: `es-MX-JorgeNeural` (edge-tts, con `certifi.where` apuntando a `/root/.ccr/ca-bundle.crt` por el proxy).

## Preferencias de estilo para los videos (pedidas por el usuario)

- **Personajes realistas y juveniles**: modelo 3D con piel natural y ropa de joven (camiseta, pantalón, zapatillas). Avatar usado: `PreviewMesh.glb` de ReadyPlayerMe (`rpm-unity-sdk-core`, vía jsDelivr).
- **Las reacciones van en el rostro del propio personaje**, nunca en un recuadro aparte. Se sintetizan rasgos faciales (cejas, párpados, comisuras, ancho de boca) sobre la cabeza y se usan **primeros planos** de la cara en los momentos clave (sorpresa, miedo, calma, esfuerzo, grito, ojos cerrados, guiño).
- **Efectos de sonido** sincronizados con los eventos en pantalla (impactos en los sellos, latido, tic-tac, estallido, "ding" del botón), mezclados con voz y música.
- **Usar HyperFrames** (`npx hyperframes`, paquete de HeyGen) para la capa de texto (título, sellos, subtítulos palabra por palabra, llamada a la acción), el audio y el render final. La capa 3D (three.js + shader del agujero negro) se renderiza aparte con `?textless=1` y entra como `<video>`.
- **Botón de descargar** en la página HTML: capacidad `downloads` del Artifact (`claude.use("downloads")`, `save({filename,data})`) para MP4 y WebM. Los enlaces `<a download>` no funcionan en el visor.
- Rapidez: renderizar el fondo 3D a 0,4 de resolución y reutilizarlo cada 2 fotogramas; render en 4 procesos en paralelo.

Herramientas del proceso en `tools/video-3d/` (los modelos `.glb` no se guardan en el repositorio).

## Reglas permanentes de calidad (pedidas por el usuario, aplican a todos los videos)

- **Movimientos realistas del personaje**: usar animaciones tipo captura de movimiento (caminar, correr, caer, reaccionar) en lugar de poses con senos; peso, inercia y transiciones suaves entre acciones.
- **Edición realista y fluida**: cámara con movimiento continuo, desenfoque de movimiento, profundidad de campo, cortes con ritmo, curvas de aceleración naturales, sin saltos bruscos.
- **Fondos realistas y fluidos en cada detalle**: iluminación coherente con la escena, partículas, atmósfera y movimiento constante; nada estático.
- **Vestuario distinto y acorde al tema de cada video**; nunca repetir el mismo atuendo entre videos.
- **Temas variados**, no solo espacio.
- **No ejecutar trabajos pesados (renders, publicaciones, commits o push) sin que el usuario lo indique primero**: proponer y esperar su visto bueno.

## Video "Qué pasa sin abejas" (3D con captura de movimiento)

- **Movimiento realista**: animaciones de captura de movimiento de Ready Player Me (`readyplayerme/animation-library`, esqueleto `masculine`). Los FBX están en Git LFS: bajarlos de `https://media.githubusercontent.com/media/readyplayerme/animation-library/master/masculine/fbx/<carpeta>/<nombre>.fbx` (no de raw.githubusercontent). Los huesos se llaman igual que los del avatar, así que se aplican directo; quitar las pistas `.scale`, pasar la cadera de cm a m y quitar la deriva de las caminatas para controlar el desplazamiento.
- **Vestuario por video**: se cambia con colores y piezas procedurales sobre el avatar (aquí traje y sombrero de apicultor). Cada video nuevo debe llevar un atuendo distinto y acorde al tema.
- **Cámara**: planos amplios con travelling suave y primeros planos de la cara que siguen hacia dónde mira; en gestos con la cabeza gacha (facepalm) usar plano medio.
- **Escenas**: prado con hierba y flores instanciadas, abejas con alas, huerto, supermercado y campo de trigo, todo con viento y marchitamiento progresivo.
- **HyperFrames**: usarlo para texto, subtítulos y audio. Su gradación con grano (`media-treatment`) es demasiado lenta aquí (más de 30 min sin terminar); el acabado de color y grano se aplica después con FFmpeg.
- **Peso**: la hierba y el trigo hacen el video muy pesado; para la página publicar MP4 a 864x1536 con crf 34 y WebM VP9 a 720x1280 con bitrate objetivo de ~2,3 Mbps (límite de 15 MB por archivo).
- **Render paralelo**: repartir los fotogramas en procesos por tramos; los tramos con trigo y primeros planos son los más lentos, así que conviene dividirlos en más procesos.

## Estilo 2D profesional (abejas v2, preferido por el usuario)
- Personaje: Open Peeps (@opeepsfun/open-peeps, MIT) por capas SVG (cuerpo/pelo/cara) + sombrero/velo propio; caras intercambiadas para emociones y labio-sync; ropa distinta por video.
- Pipeline: tools/video-2d (Canvas2D frame(t), 4 workers Playwright, 30fps) -> HyperFrames (texto+audio) -> ffmpeg. Sin GPU.
- Subtítulos abajo (y≈1650) para no tapar la cara; sellos sobre la cabeza (y≈890).
