# Guía para crear series de video animadas (Reels/Stories 9:16) con voces y efectos

Este documento explica, para otro chat o asistente, cómo producimos la serie "Lazy Dawns" y cómo reutilizar el mismo método para otras series (por ejemplo, **historias de terror** con la trama que indique el creador).

## 1. Qué se entrega
- Un MP4 **1080×1920 (9:16)**, 30 fps, H.264 + AAC, **completo en cuadro** (nada cortado, sin zoom que recorte).
- Duración libre: 40 s a 2–3 min según la historia. Se entrega **solo cuando el render terminó**. Nada automático: el creador pide cada episodio.
- Cada episodio es una **historia con inicio, imprevisto y resolución**, y termina con gancho al siguiente episodio.

## 2. Herramientas y entorno
- Node.js + `@resvg/resvg-js` (SVG → PNG por fotograma), `ffmpeg`, Python 3 (numpy), fuente Anton (`assets/fonts/Anton-Regular.ttf`) e Inter.
- Todo el dibujo es **SVG generado por código**; cada fotograma se renderiza y se manda por `image2pipe` a ffmpeg.
- Render **en 4 partes en paralelo** (`run_diaNN.sh`) y se unen con `ffmpeg -f concat`.
- ElevenLabs por API (`api.elevenlabs.io`): voz (`/v1/text-to-speech/{voice}/with-timestamps`), efectos (`/v1/sound-generation`). **Pedir la API key al usuario con un formulario seguro; nunca en el chat ni en el repo.** Si da 429, reintentar con espera.
- Limitación del resvg: no admite `filter` dentro de `mask`; usar degradados.

## 3. Flujo por episodio
1. **Elegir/recibir la trama** del creador (en series interactivas: lo que votaron en comentarios).
2. **Guion en JSON** (`script_diaNN.json`): líneas `{id, who, text, pad}`. `who` = N (narrador) u otro personaje.
3. **Revisar el guion para evitar sonidos pegados** (ElevenLabs funde "botella. La" → "botela", "peine entró" → "peinentro"): reescribir pares donde una palabra termina como empieza la siguiente.
4. **Generar la voz** con `gen_voz_multi.py script.json build/diaNN` → una pista por línea con tiempos por palabra (`lines.json`) y mezcla `voces.wav`. Reutiliza caché por línea para no gastar créditos.
5. **Generar efectos reales** con sound-generation (ambiente del lugar, pasos, golpes, puertas, etc.) en `build/diaNN/sfx/`.
6. **Definir la línea de tiempo** `T` a partir de las palabras (`w('l5','palabra')`): cuándo entra cada personaje, cada acción, cada texto.
7. **Director de actuación** (`directorN.mjs`): emociones, parpadeo, mirada que sigue a quien habla, cabeza/brazos con resortes y IK.
8. **Render de prueba** (`node render_diaNN.mjs preview t1 t2 ...`) y **revisar cuadros clave** antes del render completo.
9. **Mezcla de audio** (`build_audioNN.py`): voces + música con ducking + efectos sincronizados + ambiente.
10. **Render completo** (`./run_diaNN.sh`), verificar con `ffprobe` (1080×1920, duración), commit/push y enviar el archivo.

## 4. Reglas de voz (fijas)
- Narrador: ElevenLabs, modelo `eleven_v4`, `language_code: es`, stability 0.5, similarity 0.75, style 0. En Lazy Dawns: voz *Jessica* (id `cgSgspJ2msm6clMCkdW9`). Para otra serie, elegir una voz de narrador y **no cambiarla** a mitad.
- **Cada personaje tiene voz propia distinta** al narrador. Los personajes **NO mueven la boca para hablar**: se oye su voz, se muestra un icono de "hablando" y un subtítulo con su nombre. Solo el rostro reacciona (emoción).
- Subtítulos palabra por palabra, **sin fondo oscuro**, con contorno; ajustar tamaño automáticamente para que nunca se salgan (medir el texto real) y la etiqueta del nombre va separada del texto.

## 5. Reglas de imagen y diseño
- **Encuadre fijo 9:16 completo.** Prohibido acercar la cámara o dejar cosas cortadas abajo/lados. Hacer personajes grandes componiendo la escena, no con zoom. Subtítulos en y≈1580; título/etiqueta del episodio en y≈300.
- Estilo: ilustración vectorial con contorno grueso, sombras suaves y grano; **fondo detallado y coherente con el lugar**; ligero volumen/brillo (no plano).
- Personajes con **cuerpo articulado**: cuello, hombros, brazo-codo-mano con **IK de 2 huesos** (codo siempre hacia afuera), manos con pulgar del lado interno, piernas, respiración. Sin formas de bola ni tubos rígidos.
- Sin personajes encimados: cada uno en su sitio; solo se solapan por profundidad.
- Cara con parpadeo (100–150 ms cada 2–4.5 s), micro-saccades, cejas, mejillas y arrugas de expresión. Las expresiones **aparecen rápido (~0.25 s) y se van despacio (~0.7 s)**, con ~0.2 s de latencia tras el estímulo.
- **Lógica física de todo**: cada herramienta/acción en el sitio correcto y alcanzable con el brazo; cabeza vertical para asentir, horizontal para negar; los ojos saltan antes que la cabeza; objetos reales con anatomía correcta (investigar referencias en internet cuando haya duda y citar fuentes).
- Antes de entregar, revisar: (1) nada cortado, (2) acciones con lógica, (3) manos/brazos correctos, (4) texto sin encimarse ni salirse, (5) coherencia entre escenas (p. ej. la radiografía debe coincidir con la boca).

## 6. Sonido
- **Efectos realistas** generados con ElevenLabs (puertas, pasos, respiración, golpes, goteo, viento, chirridos, latidos, risas lejanas…) sincronizados a cada acción y a cada aparición de texto.
- Ambiente continuo del lugar y música sintetizada con **ducking** (baja cuando alguien habla). Para terror: drones graves, silencios antes del susto, riser de tensión y un golpe seco en el susto; evitar saturar (limitador a 0.95).

## 7. Estructura de episodio tipo (ajustable)
1. Claqueta/título de la serie y episodio (¡CLAC!).
2. Gancho en los primeros 3 s (algo raro, una pregunta, un sonido).
3. Desarrollo en escenas con **un imprevisto** a mitad.
4. Resolución (en terror: o cliffhanger si el creador lo pide).
5. Cierre: pregunta con 2 opciones A/B para el siguiente episodio + "COMENTA TU ELECCIÓN" + "SÍGUEME PARA EL DÍA N+1" (sin encuesta).

## 8. Adaptación a TERROR (según indique el creador)
- El creador define: premisa, protagonista(s), lugar, nivel de gore (por defecto **sin violencia gráfica explícita**; terror atmosférico/psicológico), número de episodios.
- Paleta oscura (azules/verdes/rojo apagado), viñeta fuerte, luz de linterna con haz, niebla, grano; mantener **personajes en el mismo estilo** (ilustración con contorno) con ojos expresivos y sombras largas.
- Sustos: sacudida de cámara breve, flash rojo, texto "¡AAAH!", golpe de sonido; calma con ambiente (grillos, viento, madera que cruje).
- Mantener la regla de lógica: cada sonido/susto tiene causa visible o intencionalmente ambigua; nada aleatorio.
- Voces de personajes bien distintas (grave/aguda/susurro); el narrador puede susurrar (bajar `stability`, subir `style`).
- Los personajes **no hablan con la boca**: solo voz + icono + subtítulo, igual que en Lazy Dawns.

## 9. Archivos clave (en este repositorio, carpeta `lazy-dawns/`)
- `gen_voz_multi.py` (voces por personaje + tiempos), `lazy_lib.mjs`/`rig.mjs`/`hair.mjs` (personaje articulado), `chars.mjs` (personajes de apoyo con brazos IK y herramientas), `director*.mjs` (actuación), `render_dia0N.mjs` (escenas), `build_audio0N.py` (mezcla), `run_dia0N.sh` (render + unión), `README.md` (decisiones fijas del creador).
- Para una serie nueva: copiar la carpeta como plantilla, cambiar personajes/fondos/guion, mantener las reglas de las secciones 4–6.

## 10. Cosas que NO hacer
- No automatizar publicaciones ni generación sin que el creador lo pida.
- No usar zoom que corte el cuadro; no poner fondo oscuro a los subtítulos; no animar la boca de los personajes al hablar; no encimar personajes; no dejar textos fuera de pantalla.
- No incluir la API key en archivos ni mensajes.
