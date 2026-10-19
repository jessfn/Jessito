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

## Parte 3 "Sin dormir" (estilo ilustración con tinta)
- Estilo unificado: contorno de tinta oscuro + relleno plano + sombreado con trama; nada de iconos brillantes tipo emoji. Utilidades en tools/video-2d/sleep/parts/c_ink.js.
- Tipografía: Outfit 900 (títulos/sellos/subtítulos, letras que entran una a una), Playfair Display (periódico), Space Mono (relojes/contadores); fuentes vía @fontsource.
- Personaje Open Peeps con pijama azul / sudadera gris, ojeras y ojos rojos según cansancio; transiciones distintas por corte (reloj radial, glitch, párpados, página, iris, flash).
- Texto: títulos y sellos ocultos 0.3 s antes de cada corte; subtítulos y=1650.

## Parte 4 "Enterrado vivo"
- Mismo estilo de tinta; corte transversal de la tierra (estratos con piedras, raíces, gusanos), tarjetas con medidores (O₂, ECG, CO₂), sepia para el siglo XIX, cartel de 1915. Atuendo: chaqueta oscura con camisa blanca; jersey cuello alto; sudadera con taza.
- Transiciones: tierra que sube, iris, glitch, grieta, página, destello. Título del cierre en y≈325 para no chocar con la etiqueta superior (y≈196).

## Regla de lógica de escenas (pedida por el usuario, aplica a todos los videos)
- La escena debe ser **lógica con el tema**: si el tema es estar dentro de algo (ataúd, etc.), el personaje está dentro de ese espacio, en corte transversal, con el entorno real (tierra, tapa, aire) y la cámara acercándose a su cara. Nada de personaje "narrador" delante de un fondo que no tiene que ver; los gráficos informativos van como anotaciones dentro de la escena.
- Parte 4 v2: persona acostada (busto rotado -90°) dentro del ataúd en corte lateral, manta que tapa el corte; cámara con planos amplio/cerrado (d_coffin.js, e2_scenes.js). Fuera del ataúd: médico con bata blanca y estetoscopio (hospital), teatro (Houdini), espacio (cierre).
- Open Peeps: en `Jacket`, `jacketColor` solo pinta el cuello; el cuerpo usa `outlineColor` (negro). Para prendas blancas usar `ButtonShirt` con `topColor`.

## Zona segura de TikTok y textos (pedido por el usuario, aplica desde ahora)
- Investigado (ninguna cifra es oficial de TikTok; TikTok solo dice que la zona segura se achica con subtítulos/descripciones largas): en 1080x1920 dejar libres **arriba ≈130 px** (pestañas Siguiendo/Para ti, búsqueda), **abajo ≈484 px** (usuario, descripción, sonido, barra de progreso; hay guías que usan hasta ~700 px), **derecha ≈140 px** (perfil, me gusta, comentarios, guardar, compartir) e **izquierda ≈44 px**. Ventana segura ≈ x 44–940, y 130–1436; pero **todo el texto y las barras van CENTRADOS en el video (x=540)**, nunca desplazados hacia un lado: la zona segura solo limita hasta dónde pueden llegar (texto ancho máx. ≈780 px, barra de progreso x 90–990).
- **Subtítulos (regla del usuario, para siempre)**: van ABAJO, pequeños (≈52–58 px, no 88), pero **por encima de la interfaz de TikTok**: centro en y≈1350 (texto entre y≈1300 y 1400, nunca más abajo de y≈1400) y centrados en x=540 y con ancho máx. ≈780 px. Negrita sans-serif blanca con contorno oscuro. El usuario NO quiere los subtítulos arriba. Quitar la barra de progreso de y=112 (bajarla a y≈150).
- Sellos/botones: los de arriba en y≈440; los que iban abajo, en y≈1230 (encima de los subtítulos). Nada por debajo de y≈1400 ni a la derecha de x≈930.
- **Llamada a la acción**: no poner "Sígueme/Comenta" como botón abajo; ponerlo dentro de la ventana segura (y≈1230, encima de los subtítulos) y siempre al final.
- **No numerar partes** ("PARTE 2/3/4"): usar "SIGUIENTE" + la pregunta del próximo video.
- Probar el export con una máscara de zona segura antes de entregar.

## Más reglas del usuario (aplican siempre)
- **Nunca decir ni escribir el número de parte**, ni en la voz ni en pantalla ("parte cuatro", "PARTE 4"...). El cierre dice "¿Quieres ver lo siguiente? ¿Qué pasa si …? Sígueme y comenta." y en pantalla "SIGUIENTE".
- **Los subtítulos no pueden tapar la cara.** En escenas con el personaje de pie, la cara debe quedar por encima de y≈1290 (barbilla) y los subtítulos (y≈1350) caen sobre cuello/hombros. Para lograrlo el busto va más pequeño (≈.72) con pivote bajo y un elemento en primer plano (mostrador, escenario, consola) que oculta el corte del busto.
- **Cuidar cada detalle**: nada de elementos que se solapen o se corten (sellos detrás de tarjetas, texto cortado), contraste legible (fondo oscuro tras sellos), ropa legible sobre el fondo, objetos con sentido (el médico verifica pulso/respiración/pupilas y sella el certificado).

## Video "La Tierra deja de girar" (ciudad costera)
- Panorama de ciudad costera en tinta (rascacielos de colores, palmeras, mar, paseo) con el personaje (sudadera naranja, pelo FlatTop) detrás de una barandilla en primer plano; cada escena transforma ese mismo lugar: frenazo (edificios inclinados y desplazados al este), viento supersónico (ciudad arrasada), tsunami, mundo partido día/noche, polos, luna que desaparece.
- Estampas y textos: en escenas con personaje de pie TODOS los sellos van arriba (y≈440) porque la cara ocupa hasta y≈1290; el botón "SÍGUEME" va bajo el título (y≈790), no sobre la cara.
- Cuidar los tiempos de los sellos: la palabra clave debe ser única en su segmento (p. ej. "gira" aparecía antes en "giras") o el sello se queda pegado.
