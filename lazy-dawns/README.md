# Lazy Dawns - Glow up de 30 dias (Instagram Stories 9:16)

Serie interactiva: cada dia se arregla UNA cosa de Lazy Dawns, segun lo que voto la gente el dia anterior.

## Formato tecnico
- 1080x1920 px, 9:16, 30 fps, H.264/MP4, 15-45 s por episodio.
- Zonas seguras: 250 px arriba y 340 px abajo libres de texto/elementos clave.
- Votacion: sticker de encuesta de Stories con 2 opciones (o "comenta A/B" en Reel).
- Voz: ElevenLabs (espanol latino). SFX: whoosh, pop, ding, glitch. Subtitulos palabra por palabra.

## Decisiones del creador (recordar siempre)
- Nombre: **Lazy Dawns**. En el dia a dia solo "Lazy"; el apellido "Dawns" solo cuando haga falta.
- Estilo elegido: **opcion E** (ilustracion con contorno + textura/grano), con fondo detallado (cuarto), ligero efecto 3D
  (sombras, brillos, volumen), detalle fino: manos, pies, ropa rota y sucia, celular/chat realista moderno.
- Cada video cuenta una historia (chat, casting de modelos, espejo) y termina con votacion A/B para el dia siguiente.
- NO es automatico: el creador pide cada video cuando quiere; se entrega terminado (MP4 con voz ElevenLabs).
- VOZ DEFINITIVA (no cambiar nunca): ElevenLabs voz "Jessica" (id cgSgspJ2msm6clMCkdW9), modelo eleven_v4, language_code es,
  stability 0.5, similarity_boost 0.75, style 0.0, speaker_boost on. Primera persona como Lazy. Script: gen_voz.py.
- Duracion de cada video: entre 40 y 59 s. Se entrega solo cuando termino de generarlo (sin automatizar).
- Personaje con animacion de persona real: parpadeo, miradas, cejas, boca sincronizada con la voz, huesos/articulaciones.
- Obesa y morena; el arco del gimnasio llega mas adelante segun voten.

## Personaje: Lazy Dawns
- Morena, obesa, caricatura 2D flat moderno, ojos grandes expresivos, mucha personalidad y humor.
- "Antes" exagerado y comico: granos, cejas descuidadas, dientes chuecos/manchados, pelo desastre,
  ropa espantosa, mala postura.
- Reglas fijas: su tono de piel NO cambia en toda la serie (solo se cuida: textura, manchas, brillo).
  El humor va hacia las situaciones y los "errores" de estilo, no hacia insultos a su cuerpo o rostro.
- Se mantiene su cuerpo hasta que la gente vote el arco de gimnasio.

## Estructura de episodio
1. Gancho (0-2 s): estado actual, zoom + whoosh.
2. Resultado del voto anterior (2-5 s): "Gano: X (63%)".
3. El arreglo (5-30 s): animacion del proceso.
4. Revelacion (30-38 s): barrido antes/despues + brillo.
5. Cierre (38-45 s): opciones A/B para manana (sticker de encuesta).

## Los 30 dias
Dia 1 = presentacion (antes completo). Dias 2-29 = lo que gane cada voto. Dia 30 = final completo.
Cada voto ofrece 2 opciones del banco de abajo (las que no hayan ganado se reciclan).

### Banco de opciones
| Area | Ideas de episodio |
|---|---|
| Piel | limpieza, granos, manchas, rutina skincare, hidratacion |
| Dientes | limpieza, brackets/alineadores, blanqueamiento |
| Cejas/pestanas | depilacion, diseno, pestanas |
| Pelo | corte, color, tratamiento, peinado |
| Maquillaje | base, ojos, labios, look de noche |
| Outfit | ropa casual, ropa de salir, accesorios, zapatos |
| Gimnasio | rutina, alimentacion, progreso (arco de varios dias) |
| Actitud | postura, caminar, confianza, mirada |
| Manos/unas | manicure, cuidado |
| Final | look completo, entrada triunfal |

## Pendiente (necesita tus accesos)
- API key de ElevenLabs (se guarda como secret, nunca en el chat ni en el repo).
- Decidir si se renderiza con Remotion o con otra herramienta.

## Animacion del personaje (rig.mjs + director.mjs)
- `rig.mjs`: personaje articulado. Cuello/cabeza (giro, cabeceo, inclinacion), hombros, brazo-antebrazo-muneca-mano con IK de 2 huesos,
  cadera, muslo-rodilla-pantorrilla-tobillo-pie, respiracion, parpados (parpadeo, guino), pupilas, cejas (alzar/fruncir),
  boca por visemas, mejillas y arrugas de expresion (frente, patas de gallo, pliegues nasogenianos), lagrimas.
- `director.mjs`: actuacion por fotograma a partir de los tiempos de cada palabra de la voz: parpadeo espontaneo (100-150 ms cada
  2-4.5 s), micro-saccades, enfasis de palabras (cabeceo + cejas), emociones (feliz, triste, sorpresa, risa, duda, determinada...),
  boca sincronizada por letra, y gestos de brazos (saludo, mano al pecho, tocarse mejilla/ceja, puno, manos abiertas).
- Principios y fuentes: parpadeo humano 100-150 ms (Wikipedia/UCL), parpadeos basados en datos reales se ven mas naturales (Disney
  Research), mirada con saccades, visemas Preston Blair, sonrisa genuina = comisura + mejillas (AU12+AU6).
- Para un episodio nuevo: escribir `script_dia0N.txt`, generar voz con `gen_voz.py`, definir tiempos/gestos y correr `run_dia01.sh`.

## Diseno del personaje (definitivo, 'antes')
- Dientes chuecos, amarillentos, con colmillo montado y dos dientes de conejo asomados en reposo; unas largas, descascaradas, rosa desteñido y con mugre;
  muchos granos, ojeras marcadas, labios resecos, lunar con pelos, uniceja, ropa rota y sucia, sandalias gastadas.
- Ella NO habla en pantalla: solo reacciona (cara y cuerpo). La voz es el narrador de ElevenLabs.

## Reglas permanentes (del creador, recordar SIEMPRE)
- El Día 1 queda como está (ya aprobado).
- Del Día 2 en adelante, el cierre NO menciona "encuesta" ni sticker: se pide que la gente ELIJA una opción y la COMENTE en los comentarios
  (ej.: "Comenta A o B: ¿qué le arreglamos mañana?"). En pantalla: botones A/B + texto "COMENTA TU ELECCIÓN" en vez de "VOTA EN LA ENCUESTA".
- Ella no habla en pantalla; solo reacciona. La voz es el narrador (Jessica, eleven_v4, ajustes fijos de gen_voz.py).
- Entre 40 y 59 s por video; se entrega solo cuando termino de generarlo; nada automático.
- Cierre de TODOS los videos desde el Día 2: además de pedir que comenten su elección, la voz dice que SIGAN la cuenta para ver el siguiente día
  (ej.: "Comenta A o B, y sígueme para ver el día 3"). En pantalla: texto "SÍGUEME PARA EL DÍA N+1" junto a "COMENTA TU ELECCIÓN".
- ACTUALIZACION (creador): cada video es una HISTORIA tipo escena de pelicula: cómo se hizo el cambio (ej. clinica/skincare, reventar granos),
  algo inesperado que surge a medio camino, y se resuelve bien; cierra con gancho al siguiente dia. Ya puede pasar de 1 minuto (objetivo ~80-95 s).
  Personajes de apoyo (Mari, doctora) NO hablan con voz: solo globos de texto; la voz es el narrador. Dia 2 = "La clinica Glow" (piel y granos).
