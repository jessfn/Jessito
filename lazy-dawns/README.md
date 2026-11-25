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

## Reglas permanentes (actualizacion dia 3)
- Los personajes de apoyo (Mari, Dr. Mendoza, etc.) tienen VOZ PROPIA distinta al narrador (Mari = Laura, Dr. Mendoza = Brian, narrador = Jessica, fija),
  pero NO mueven la boca: solo se escucha su voz y se muestra un icono de "hablando" + subtitulo con su nombre. gen_voz_multi.py arma el audio por linea.
- Efectos de sonido REALISTAS: se generan con ElevenLabs sound-generation (build/dia03/sfx), ambiente de clinica y musica sintetizada con ducking.
- Cada capitulo es una historia con imprevisto y se resuelve bien. Puede pasar de 1 minuto (dia 3: ~150 s).
- Al final del arco de dientes: sonrisa derecha y blanca (salto de tiempo "Meses despues", quitan los brackets).
- Cierre: pregunta A/B + "COMENTA TU ELECCION" + "SIGUEME PARA EL DIA N+1" (sin encuesta).
- Dia 4 sale de lo que voten: CEJAS o PELO.
- Subtitulos: SIN fondo oscuro (solo letras con contorno); siempre dentro de pantalla (ajuste automatico de tamano, ver `node render_dia03.mjs audit`); etiqueta de nombre separada del texto.

## Tamano / encuadre (decision del creador, dia 4)
- Se descarto el ajuste especial para Reels: el tamano y encuadre se quedan igual que en los dias 1-3 (1080x1920, subtitulos en y=1580, pill en y=300).
- Dia 4 = El salon (pelo): voces Jessica (narrador), Laura (Mari), Lily (Vero, estilista), Liam (Memo, ayudante). Final: pelo LARGO y LACIO. Siguiente voto: CEJAS vs MAQUILLAJE.

## Regla de guion (voz): evitar sonidos pegados
- ElevenLabs funde palabras cuando una termina como empieza la siguiente ("botella. La" -> "botela"; "peine entro" -> "peinentro").
  Antes de generar voz, revisar el guion y reescribir esos pares (ej. "botella. Y era la equivocada"). Ver el escaneo en la historia del dia 4.

## Personajes (regla permanente)
- Todos los personajes (Mari, Vero, Memo, Dr. Mendoza) tienen BRAZOS articulados (hombro-codo-mano con IK), no manos sueltas.
- Sin personajes encimados: cada uno ocupa su lugar (Mari izquierda, Vero derecha, Memo al fondo derecha) y solo se superponen por profundidad
  detras de Lazy. Las herramientas las sostiene la mano del brazo que llega hasta ellas.

## ENCUADRE 9:16 (regla permanente, decision del creador)
- El video es 1080x1920 (9:16) y SIEMPRE se ve completo: NADA se corta ni se queda abajo. Prohibido acercar la camara (zoom) o recortar:
  escenario, silla, pies y personajes enteros dentro del cuadro. Camara fija (solo un temblor minimo en sustos).
- Los personajes se hacen grandes componiendo la escena para 9:16 (Lazy ~0.68 de escala, apoyo ~0.58-0.7), no con zoom.
- Sin disenos malos: brazos afilados con mangas y puno, manos con pulgar interno, nada de tubos rigidos ni formas encimadas.

## Logica de las acciones (regla permanente)
- Cada herramienta trabaja en el lugar CORRECTO y NUNCA apunta a la cara salvo que sea un tratamiento facial (dia 2). En el pelo (dia 4): peine por arriba del cabello,
  tijeras en las puntas del lado, secadora hacia el pelo desde arriba/lado, plancha en los mechones del lado, tinte/neutralizador en la raiz, extensiones junto a las cortinas de pelo.
- Quien usa la herramienta debe poder ALCANZAR con el brazo el punto de trabajo (IK); si no alcanza, se reubica al personaje.
- Antes de dar un video por bueno: revisar cuadros clave y verificar (1) nada cortado, (2) herramienta en el sitio logico, (3) manos/brazos correctos, (4) texto sin encimarse.

## Logica de brazos de Lazy (regla permanente)
- Codo SIEMPRE hacia afuera y abajo (IK de 2 huesos con codo exterior); las manos nunca cruzan el pecho ni tapan los ojos sin razon.
- Susto/sorpresa: manos a los COSTADOS de la cara (x=+-246, y=-118), no sobre los ojos. Tocarse la cabeza: lado de la cabeza (x=262).
- Peinarse/mostrar el pelo: brazo hacia afuera junto al torso (x=318-350). Referencia IK: pole vector hacia afuera/atras del codo (Unreal/Godot TwoBoneIK).

## Dia 5 (El maquillaje): decisiones
- Se quito el lunar con laser (dermatologa, con revision previa, costra y sanado). Maquillaje MODERNO y natural: piel luminosa, contorno, iluminador, sombras doradas,
  delineado suave, pestanas largas y gloss rosado (NO labial rojo clasico). Imprevisto: base demasiado clara (fantasma) -> se busca el tono que combina con su piel morena.
- Duracion < 2 min (1:58). Comparacion ANTES/DESPUES en el espejo. Voces: Dra. Valentina (Alice), Nina (Sarah), Mari (Laura), narrador Jessica. Siguiente voto: ROPA vs GIMNASIO.
- Profesionales alcanzan la cara con el brazo: se sientan tras una mesa (cintura oculta) para que el brazo IK llegue a la cara.

## Dia 5 = CEJAS (el de maquillaje se descarto; el voto real fue cejas)
- Sin Mari. Nuevos: Karla (cejista, voz Bella) y Chispa (gato). Puerta con campana (se abre y suena), cejas de uniceja -> separadas, arqueadas y finas tipo modelo,
  imprevisto del gato, retoque, comparacion ANTES/DESPUES de cejas, gancho: el lunar se ve enorme. Duracion 1:29 (limite 1:30). Siguiente voto: MAQUILLAJE vs ROPA.
- Regla de logica: lo que se nombra se ve (puerta/campana, cera, pinza, gato), con su sonido. El codo de quien trabaja sobre la cara va hacia ABAJO (no cruza su propia cara).

## Rizos (decision del creador)
- Los rizos largos y bonitos NO van en el dia 6: son una OPCION de votacion (dia 7: maquillaje vs rizos). Mientras tanto Lazy conserva su pelo largo y lacio.
- Sistema listo: hair.mjs -> hairRinglets (rl=1, len=1) + hairCurly reducido; usar si ganan los rizos.

## Vestuario (decision del creador, dia 6)
- Desde el dia 6 Lazy se viste SIEMPRE con el vestido de satin esmeralda con cinturon dorado, aretes, collar y tacones (outfit.kind='gown', prog=1, jewel=1). Ya no usa la ropa rota.
- La PASARELA se descarto del dia 6: queda para mas adelante. Final del dia 6: terraza de noche (plates3d 'terrace'), mensajero con sobre dorado/invitacion misteriosa.

## Dia 7 (maquillaje de gala) - decisiones
- Look elegido: C "cut crease cobre" (ojos ahumados cobre, ala larga, piel mate, labio vino brillante). El LUNAR SE QUEDA (queda como opcion de votacion despues: dia 8 = rizos vs lunar).
- Arreglo del rig: sin linea rosa/clara cruzando los dientes (se quito el trazo de brillo y las rayitas de labio seco con labial).
- Narrativa constante: gancho, imprevisto (apagon), truco de cinta, giro final (nota "No vayas a la gala", firma M). SIEMPRE incluir inserts cinematograficos de los objetos nombrados
  (paleta, cinta, labial, reloj, nota) con iris, empuje de camara y efectos; punch-ins moderados en la camara principal sobre el paso del maquillaje.
- Nuevos fondos 3D: camerino (espejo de focos) y pasillo. Personaje nuevo: ninguno (Nina vuelve).

## Ajuste dia 7 (creador)
- La historia NO menciona el lunar (se quito la frase de Nina y la de la narradora). El lunar solo aparece como opcion final de votacion: "QUITAR EL LUNAR" (se ve feo).
- Los RIZOS ya NO son opcion. Opciones del dia 8: A = QUITAR EL LUNAR, B = UNAS Y MANOS.

## Reglas nuevas (especial de rizos)
- TODOS los objetos que el narrador menciona en un insert (caja, frascos, atomizador, difusor, guante, nota, etc.) se muestran en 3D real: se modelan en Three.js (`plates3d/objects.html`, render con `plates3d/obj3d.mjs`) con materiales PBR (oro cepillado, raso, vidrio, cuero, pergamino), luces y entorno propio, y se insertan como secuencias PNG con fondo transparente (`plates3d/obj/<nombre>/fNNN.png`).
- Titulos grandes (por ejemplo "ESPECIAL") en 3D real con `TextGeometry` + fuente Bungee (OFL), con barrido de luz y entrada escalonada. Nada de spoilers en los titulos: frases de suspenso ("UNA GRAN REVELACION").
- Rotulos de inserts siempre por encima de las etiquetas de personaje/subtitulos (sin traslapes).
- Texturas: los sitios de texturas (PolyHaven/ambientCG) estan bloqueados desde este entorno; se usan texturas procedurales generadas en canvas (y archivos de GitHub cuando sirven).
- Los videos "especial" no cuentan como dia; terminan pidiendo comentarios sobre cambiar/mejorar SOLO lo ya arreglado (piel, dientes, pelo, cejas, ropa, maquillaje). Lunar y nariz son para los videos normales.

## Regla permanente: PORTADA con cada video (decision del creador)
- Cada vez que se entregue un video (dia o especial) se entrega TAMBIEN su portada 1080x1920 (TikTok/Reels/Shorts), tematica del dia, sin spoilers y UNICA: expresion, manos, personajes y composicion distintos a las demas.
- Todo dentro de la zona segura (caja 3:4 central, margen >= 60 px); sin texto en la parte inferior; logo oficial (logo_lazydawns.png) pequeno arriba al centro, titulo 3D, cuadro DIA N bien visible. Los personajes (Lazy y acompanantes) deben verse completos dentro del margen, con reaccion en la cara. Generador: build_cover2.mjs (CFG/UQ por episodio).

## Reglas permanentes: espejo y tarjeta de votacion (decision del creador)
- ESPEJO: cuando aparece el espejo (marco ovalado), Lazy debe verse COMPLETA y centrada dentro del ovalo (cabeza y cuerpo), sin cortarse; camara ajustada para eso. Nada de la UI (chip de DIA) tapando el marco.
- TARJETA DE VOTACION: fondo limpio y opaco (degradado oscuro con brillitos), sin personajes ni pantallas detras; solo la pregunta, las 2 opciones y los botones de comentar/seguir.
- ICONOS DE LA VOTACION: cada opcion lleva un icono que represente EXACTAMENTE lo que se vota (por ejemplo: piel = carita con arrugas y brillo; vestido = vestido verde con cinturon; nariz = nariz; unas = mano con unas; gimnasio = mancuerna). Nunca reutilizar el icono de otra opcion.

## Dia 10 (El regalo perfecto): decisiones
- Look fijo desde ahora: cuerpo "C" (cintura marcada, clavículas) con brazos/manos "A" continuos (silueta unica, sin bolas) y vestido muy arrugado/flojo (loose 2: arrugas, cinturon caido, tono apagado). Rostro femenino ovalado (fem 1, piel "cristal"). NO se usan las opciones de hombros (se descartaron).
- Historia (logica con el dia 9): -28 kg dejaron la piel floja y arrugada (sin granos); Dante invita al spa Aura (sello con D, Lazy aun no sabe que es aliado de M), radiofrecuencia + colageno, sérum falso del paquete, 3 semanas, espejo, tonico -> cabello se cae, M revela a Dante. Musica distinta por escena (build_audio_dia10.py).
- Voces nuevas: Renata = Rachel (21m00Tcm4TlvDq8ikWAM), Isa = Elli (MF3mGyEYCl7XYWbV9V6O). Pipeline: render_dia10.mjs + director11.mjs + build_audio_dia10.py + resume_dia10.sh.

## Dia 11 (Un hilo de esperanza): decisiones
- Voto del dia 10 = vestido. Empieza con la Lazy anterior (vestido verde flojo, pelo caido) y termina con la Lazy nueva (rig2d, vestido rojo) con el pelo cada vez mas feo y calvas. Voto: CABELLO vs NARIZ (dia 12).
- Personajes: Greta (modista nueva, voz Charlotte), M (rig2d/m_character.mjs) en la guarida con voz de villano. Pipeline: render_dia11.mjs + director12.mjs + build_audio_dia11.py + resume_dia11.sh. Duracion 1:36.

## Dia 12 (pendiente de decidir): decisiones guardadas
- Voto del dia 11 = cabello. Para el dia 12 la nariz se queda la VIEJA; la nariz nueva (opcion D, respingada, puente desvanecido: `noseStyle:'D'` en rig.mjs) se guarda para el dia siguiente (dia 13).
- Cabello nuevo: LACIO y no tan largo (opciones A-D en hair_lacio.mjs, `hair.lacio:'A'..'D'`), sin halo negro detras del rostro.

## Dia 12 (Una noche en neon): decisiones
- Voto del dia 11 = cabello (nariz vieja se queda; la nariz D respingada va en el dia 13). Cabello final: bob lacio C2 (hair_lacio.mjs, mechon al frente sobre el pecho, sin halo negro).
- REGLAS NUEVAS (creador): NO reutilizar escenas ni objetos; todo nuevo cada dia. Escenas del dia 12: neonstudio12, bedroom12, rooftop12 (plates3d/scenes12.html). Objetos 3D nuevos: scanner, ampoule, ledcap, weft, shears, iron, slate12 (plates3d/objects12.html, obj3d12.mjs). SFX y musica nuevos (build/dia12/sfx, build_audio_dia12.py).
- Personajes secundarios NUEVOS con voz nueva y BOCA que habla sincronizada (chars12.mjs: Zoe=Aria, Kai=Will); brazos continuos con manos de dedos y herramientas modernas. Lazy NO mueve la boca para hablar.
- Proceso del cabello visible con tomas cinematograficas: Lazy sentada con capa, escaner, ampolla, casco LED, extensiones, corte a oscuras, alisado con barrido. Pipeline: render_dia12.mjs + director13.mjs.

## FINAL DE LA SERIE (idea del creador, guardada)
- M = Mari (amiga del dia 1). Se revela el dia 29; el dia 28 queda en suspenso. Motivo: alguien que le gustaba la rechazo porque le gustaba Lazy (a quien no le importaba como se viera por fuera); Mari juro que Lazy se arrepentiria, porque Lazy siempre era la mejor (escuela, padres, le "quito" a quien le gustaba). Le dira que no la soporta, y tampoco queria que fuera aun mas bonita que ella. Al intentar agredir a Lazy, llegan los padres de Mari y dicen que la internaran. Dante es aliado de M.
- Dia 29 (final): invitacion especial a una pasarela mundialmente famosa. Dia 30: Lazy cumple su sueno en la pasarela; llega una mujer elegante de rojo con gafas y la invita a ser actriz en Hollywood (papel importante).
- Decisiones: la voz de M NO cambia hasta la revelacion final (dia 29). Mari aparece en ALGUNOS dias (no todos) como amiga/pista sutil (dia 13+). Mari termina internada en una clinica con ayuda (final trágico, no cruel). Pistas sugeridas: like/publicacion, perfume, la mujer de rojo con gafas de fondo antes del dia 30.

## REGLAS PERMANENTES (todos los dias, creador)
- CADA dia: escenarios nuevos (3D, con texturas/profundidad), objetos 3D nuevos, voces nuevas para personajes nuevos, SFX y musica nuevos segun la escena. Nunca reutilizar fondos ni objetos de dias anteriores.
- Personajes extra nuevos con diseno moderno y distinto, brazos continuos con manos de dedos, boca que habla sincronizada (Lazy NO mueve la boca para hablar; solo expresiones).
- Algunos personajes YA APARECIDOS pueden volver (Mari, Dante, Greta, Zoe, Kai, Dra. Renata, etc.) con su misma voz y diseno; usarlos con intencion (pistas, giros), no en todos los dias.
- El proceso (cabello, piel, etc.) se muestra paso a paso en el cuerpo de Lazy con tomas cinematograficas. Gancho constante.

## Dia 13 (Armonia de perfil): decisiones
- Voto del dia 12 = nariz (opcion D respingada, puente desvanecido: `noseStyle:'D', noseK:1.35`). Clinica Aurora (sin cirugia: acido hialuronico), Dr. Montes (voz George) y Nuria (voz Nicole) NUEVOS con boca hablante (chars13.mjs). Sabotaje de M por hackeo (pantalla). Pista de Mari: mensajes ("llego tarde", "mañana te alcanzo") sin revelar nada.
- Escenas nuevas: balcony13, auroraclinic13 (scenes13.html). Objetos nuevos: facearch, syringe, tube, compress, holonose, slate13 (objects13.html). Pipeline: render_dia13.mjs + director14.mjs + build_audio_dia13.py. Siguiente voto: UÑAS vs ZAPATOS (dia 14).

## REGLAS DE LAYOUT (creador, permanentes)
- NINGUN texto puede salirse de su recuadro/boton/burbuja/banner: SIEMPRE ajustar el tamano de fuente al ancho disponible (fitFs/inkWidth) y partir lineas por palabras. Revisar cada rotulo en los cuadros de prueba.
- Celulares/mensajes: mostrar SIEMPRE un celular real (cuerpo, barra de estado, encabezado de chat con la FOTO DE PERFIL de la persona, burbujas, barra de mensaje). Mari tiene su foto de perfil (cara de Mari). Nada de tarjetas sueltas.
- Opciones del final: el icono de cada opcion debe ser EXACTAMENTE la cosa que se quiere arreglar (unas = mano con unas pintadas, zapatos = tacon), centrado dentro del circulo sin salirse.
- Nada se traslapa: lo que aparece (celular, rotulos, personajes) no debe tapar subtitulos ni caras importantes.
- SECUENCIA LOGICA (creador): los mensajes y todo evento deben seguir una secuencia coherente (quien escribe, a quien, respuestas en orden; la pista debe tener sentido: ej. Mari felicita la nariz nueva sin que Lazy le haya contado = pista).
- PORTADAS (creador): la protagonista aparece de medio cuerpo hacia arriba y grande; cada portada con relacion/pose DISTINTA con el/los personajes extra detras.
- PORTADAS DE PELICULA (creador, todas en adelante): protagonista de medio cuerpo hacia arriba; pose y relacion distintas con los extras; incluir objetos/personajes que dan trama (dia 11: tela roja rasgada; dia 12: linterna/apagon; dia 13: pantalla hackeada de M). Props definidos en propsSvg de build_cover2.mjs.
- PORTADAS: Lazy CERCA (plano medio-cercano, cara grande, hombros arriba); extras y props visibles pero secundarios.

## Día 14 — "Alguien del pasado regresó... pero"
- Votado: uñas. Uñas de Lazy: rojo con glitter dorado, largas y picudas (stiletto), un poco menos largas que la opción F (opción C ajustada). En rig2d: `NAILS.on` (rig2d/character.mjs).
- Nuevo personaje: **Dustin** (alto, flaco, pelo café ondulado, lentes circulares, piel blanca; voz ElevenLabs "Chris", letra X). Se encuentra con Lazy en la calle Mariposa; no se dice que le gustara. Manda mensaje (con foto de perfil) y luego llega un número desconocido: "Bonitas uñas, Lazy."
- Nueva extra: **Yaz** (manicurista del salón Rouge; voz "Domi", letra J).
- Escenas nuevas: calle al atardecer, salón Rouge. Objetos nuevos: lima, esmalte, polvo dorado, lámpara UV, claqueta. Proceso paso a paso con inserts 3D + mano en primer plano (hand14.mjs).
- Regla nueva: los títulos de cada día deben ser de suspenso ("Alguien del pasado regresó... pero").
- Votación al final: zapatos o pestañas (día 15).
- Archivos: render_dia14.mjs, director_d14.mjs, chars14.mjs, build_audio_dia14.py, resume_dia14.sh, script_dia14.json, plates3d/scenes14.html, objects14.html.

## REGLAS NUEVAS (día 15 en adelante)
- Revisar el video SEGUNDO A SEGUNDO antes de entregar (cuadros cada ~1 s): lógica de todo lo que aparece.
- Celular/chat: cada pantalla muestra SOLO el chat de UNA persona (nombre, foto de perfil y mensajes de esa persona). Nunca mezclar mensajes de otro contacto en el mismo chat (error del día 14: el mensaje de Dustin aparecía dentro del chat "Número desconocido").
- Reacciones del rostro coherentes con lo que pasa en cada instante; manos/brazos/objetos coherentes.
- Pestañas (voto día 14→15): mostrar opciones largas, bien diseñadas, con textura y realistas; el usuario elige antes del video.

## Día 15 — "Alguien me observa desde el inicio"
- Votado: pestañas (opción C "gatita postiza", llenas, enchinadas, inferiores muy cortas; `LASHX.style='P3'` en rig.mjs). Uñas rojas picudas con dorado se mantienen (NAILS.on).
- Mari aparece con rig nuevo hablante (chars15.mjs, drawMari2). Nueva extra: Bruna (artista de pestañas, voz Freya "F"). Escenas: Café Luna (terraza), Lash Lab. Objetos: bandeja de abanicos, rizador, pegamento, pinzas, claqueta. Primer plano del ojo con progreso (eye15.mjs).
- Chats: un solo contacto por pantalla ("Número desconocido" con sus dos mensajes en orden).
- Pista Mari: guarda su celular rápido mientras llega el mensaje desconocido (sin decir que es ella).
- Votación: ojos o mandíbula (día 16). Revisión: cuadros cada segundo (86 cuadros) antes de entregar.
- REGLA PORTADAS: cada portada con pose, reacción y relación con extras DIFERENTES a las anteriores (d14: saludo con mano junto a la cara; d15: susto sosteniendo celular con Mari sonriendo detrás).

## ROSTRO FINAL DE LAZY (aprobado; usar desde el Día 16)
- `face_final.mjs` → `applyFinalFace()`: mandíbula R1 (redondeada, ancho 0.95), sin pómulos marcados, sin líneas de sonrisa ni "filtrum", sin marcas en el mentón, boca/sonrisa +14 %, pestañas P3 (gatita postiza). Mentón: se descartó acortarlo/redondearlo más; se queda como en Sonrisa_v2.png.

## REGLAS PERMANENTES NUEVAS (desde Día 16) — sustituyen cualquier regla anterior contraria
- LENGUAJE: español neutro y natural, que suene a personas reales, pero SIN lenguaje coloquial ni jerga ("la neta", "mija", "chido", etc.) y JAMÁS groserías ni insultos. (Se anula la regla anterior que permitía groserías.) Mantener las mismas voces de cada personaje.
- FPS: todos los videos a 60 cuadros por segundo (permitido hasta 120) para que todo se vea fluido; el director calcula las poses a 60 Hz.
- FONDOS Y OBJETOS: otra vez 2D (sin Three.js): capas con texturas procedurales, degradados, sombras, articulaciones y movimiento; claqueta/portada animada con fondo en movimiento.
- DEGRADADOS: todo efecto (fuego, humo, luces, brillos) debe desvanecerse con degradado/máscara; nunca bordes rectos ni líneas visibles en la base. Textos nunca encimados (usar fitFs y filas separadas).
- Descargar de internet lo necesario cuando la red lo permita (hoy el proxy bloquea ambientcg/polyhaven: usar texturas procedurales).
- Opciones del voto del día 16: maquillaje o ojos (día 17).
- OJOS FINALES (opción D "Almendra mediana", aprobada): forma almendrada con esquinas (interna redondeada, externa en punta), iris anime texturizado, pupila pequeña, pestañas P3 adaptadas al contorno del párpado. Ya incluidos en `applyFinalFace()`.

## Día 17 — "Ella no sabe que la siguen"
- Votado: ojos → ojos negro café profundo (rostro final aprobado desde aquí). Estructura nueva PERMANENTE: intro corta de M planeando en la oscuridad (sin spoilers), luego claqueta con el título del día sobre fondo animado, luego el episodio. Votación final siempre con fondo animado.
- Nuevos: Dra. Ivana (oculista, voz K), Will (voz Y). Escenas 2D: guarida de M, clínica Iris, calle nocturna con balcón. M rehecho: piernas articuladas con rodilla y botas pegadas (rig2d/m_legs2.mjs).
- M moja a Lazy con un cubo de agua: maquillaje corrido, labios sin labial, pestañas se quedan. Will le ofrece su abrigo.
- Votación: maquillaje o peinado (día 18).
- ElevenLabs: SIN CRÉDITOS al terminar el día 17; hace falta recargar para generar voces del día 18.

## Día 18 — "Todo cambia con una llamada" (EN PREPARACIÓN)
- Votado: maquillaje → look A final (`face_final.mjs` → `applyDay18Face()`: sombra vino/ciruela con brillos, rubor terracota, labios rojo oscuro, cejas D difuminadas, ojos clásicos almendrados `EYEX.shp='clasico'` con delineado interno A, cuello −10, nariz +8, ojos juntos −3, boca −1).
- Guion en `script_dia18.json` (Will + doña Susan, mamá de Lazy, la limpia y maquilla; suenan los celulares: Mari desaparecida, M la raptó; Lazy no puede salir por su cabello; voto cabello o piel para el día 19).
- BLOQUEO: ElevenLabs con 0 créditos (comprobado de nuevo); falta recargar para generar voces y SFX. Doña Susan usa voz `S` provisional (hay que agregar voz propia en gen_voz_multi.py si se prefiere otra); presentadora de noticias voz `T`.
