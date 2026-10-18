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
