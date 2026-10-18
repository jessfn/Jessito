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
