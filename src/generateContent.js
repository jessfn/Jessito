import { CONFESSION_PROMPTS, TURBIO_PROMPTS, pickRandom } from "./topics.js";
import { isRepeated, isTemaUsed } from "./history.js";

// Modelos de respaldo por si la consulta en vivo a Groq fallara por completo.
const FALLBACK_MODELS = ["llama-3.1-8b-instant"];

let cachedModelList = null;

// Pregunta a Groq (en el momento de correr, no con nombres fijos que se vencen)
// que modelos de chat/texto simples estan disponibles ahora mismo. Se excluyen
// voz/moderacion (patron conocido) y modelos "razonadores" (qwen/deepseek, que
// exponen su cadena de pensamiento como texto) para no toparse con esos casos.
async function getModelList() {
  if (cachedModelList) return cachedModelList;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    });
    if (res.ok) {
      const data = await res.json();
      const allIds = (data.data ?? []).map((m) => m.id);
      const excluded = /whisper|guard|tts|moderation|embed|qwen|deepseek|orpheus|reasoning/i;
      const candidates = allIds.filter((id) => !excluded.test(id));
      if (candidates.length > 0) {
        cachedModelList = [...candidates, ...FALLBACK_MODELS];
        return cachedModelList;
      }
    }
  } catch {
    // sigue al fallback de abajo
  }

  cachedModelList = FALLBACK_MODELS;
  return cachedModelList;
}

const STYLE_GUIDE = `Eres un redactor de contenido de TERROR/misterio turbio para una pagina de Facebook
mexicana. Escribes relatos anonimos de terror o suceso profundamente turbio, estilo "confesion" o
"historia que me contaron", en primera persona, como si alguien lo estuviera contando de verdad.
SIEMPRE debe sentirse como una historia de terror o algo genuinamente inquietante/paranormal o
criminal turbio, nunca solo un drama romantico sin elemento oscuro/aterrador. El objetivo es generar
miedo, morbo e intriga genuinos: revelaciones fuertes, giros inesperados, algo que inquiete al leerlo.

Estilo de escritura:
- Espanol neutro/narrativo, cuidado y bien redactado. Nada de modismos o jerga coloquial
  (nada de "naco", "wey", "no manches", groserias, ni muletillas de habla informal).
- Puede sonar cercano y conversacional, pero correcto gramaticalmente, como una buena narracion.
- Que el gancho y el desenlace generen ganas de comentar y compartir por el morbo, sin caer en
  contenido explicito ni de mal gusto.

Formato de salida (usa EXACTAMENTE estas dos etiquetas, cada una en su propia linea):
GANCHO: una frase muy corta (6-10 palabras) tipo titular impactante que resuma el morbo/suspenso
del relato, en primera persona (ejemplo de estilo: "Mi hermano me engaño con mi novio").
CUERPO: el relato completo (sin repetir el gancho), entre 1200 y 1800 caracteres, con desarrollo
completo (inicio, nudo y desenlace/giro). Al FINAL del cuerpo (no al inicio) agrega una linea breve
dejando claro que es un relato anonimo/de ficcion enviado por un seguidor de la pagina (ejemplo:
"Historia anonima enviada por un seguidor de la pagina, nombres cambiados por privacidad.").
NUNCA lo presentes como noticia verificada o hecho confirmado. Termina con una pregunta corta para
generar comentarios (ej. "¿ustedes que hubieran hecho?").

Reglas obligatorias:
- Nada de violencia grafica, contenido sexual explicito, odio, menores en situaciones sensibles,
  ni nombres reales de personas identificables.
- No incluyas hashtags ni emojis en exceso (maximo 2-3 emojis).
- No repitas ideas, personajes ni giros que ya se hayan usado antes (se te daran temas ya usados
  para que evites parecerte a ellos).
- IMPORTANTE: el CUERPO debe quedar completo, terminando en una oracion cerrada (punto final,
  signo de interrogacion o exclamacion), nunca cortado a la mitad de una idea o palabra.`;

const NEWS_STYLE_GUIDE = `Eres un redactor de contenido de TERROR/misterio turbio de "ultimo momento"
para una pagina de Facebook mexicana. Escribes con tono de nota urgente/viral (como una alerta de
tendencia), inspirado LIBREMENTE en un tema que esta sonando hoy, pero contando una historia/anecdota
ficticia y anonima de terror o suceso turbio alrededor de ese tema (nunca un simple chisme sin
elemento oscuro/inquietante), y nunca presentandola como informacion verificada o un hecho real
confirmado sobre alguien identificable.

Estilo de escritura:
- Espanol neutro, tono de nota de ultima hora: directo, con gancho fuerte, que genere morbo y
  urgencia por leer/comentar. Nada de modismos o jerga coloquial, ni groserias.
- Correcto gramaticalmente, como una buena nota de entretenimiento viral.

Formato de salida (usa EXACTAMENTE estas dos etiquetas, cada una en su propia linea):
GANCHO: una frase muy corta (6-10 palabras) tipo titular de ultimo momento/tendencia, impactante.
CUERPO: el relato completo (sin repetir el gancho), entre 1200 y 1800 caracteres, con desarrollo
completo (contexto, revelacion/giro, cierre). Al FINAL del cuerpo agrega una linea breve dejando
claro que es contenido de entretenimiento/ficcion inspirado en la tendencia, no una nota verificada
(ejemplo: "Contenido de entretenimiento inspirado en el tema del momento, no representa un hecho
confirmado."). Termina con una pregunta corta para generar comentarios.

Reglas obligatorias:
- Nada de violencia grafica, contenido sexual explicito, odio, menores en situaciones sensibles,
  ni acusar o inventar hechos reales sobre personas identificables (celebridades, politicos, etc.)
  aunque el tema en tendencia mencione a alguien; mantente en el terreno de la ficcion/anecdota.
- No incluyas hashtags ni emojis en exceso (maximo 2-3 emojis).
- No repitas ideas ni ganchos ya usados antes.
- IMPORTANTE: el CUERPO debe quedar completo, terminando en una oracion cerrada, nunca cortado a
  la mitad de una idea o palabra.`;

// Convierte texto normal a "negritas" usando caracteres Unicode matematicos,
// ya que Facebook no soporta Markdown en las publicaciones.
function toBoldUnicode(text) {
  // Los caracteres Unicode "negrita" solo existen para A-Z/a-z/0-9 (sin acentos),
  // asi que quitamos tildes/diéresis antes de mapear para que no queden letras
  // sueltas sin negrita dentro del gancho.
  const normalized = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const boldMap = {};
  const upperStart = "A".charCodeAt(0);
  const lowerStart = "a".charCodeAt(0);
  const digitStart = "0".charCodeAt(0);
  const boldUpper = 0x1d5d4; // Mathematical Sans-Serif Bold (coincide con la tipografia de Facebook)
  const boldLower = 0x1d5ee;
  const boldDigit = 0x1d7ec;

  for (let i = 0; i < 26; i++) {
    boldMap[String.fromCharCode(upperStart + i)] = String.fromCodePoint(boldUpper + i);
    boldMap[String.fromCharCode(lowerStart + i)] = String.fromCodePoint(boldLower + i);
  }
  for (let i = 0; i < 10; i++) {
    boldMap[String.fromCharCode(digitStart + i)] = String.fromCodePoint(boldDigit + i);
  }

  return normalized
    .split("")
    .map((ch) => boldMap[ch] ?? ch)
    .join("");
}

function parseStoryResponse(raw) {
  const ganchoMatch = raw.match(/GANCHO:\s*(.+)/i);
  const cuerpoMatch = raw.match(/CUERPO:\s*([\s\S]+)/i);

  const gancho = ganchoMatch ? ganchoMatch[1].trim() : "";
  const cuerpo = cuerpoMatch ? cuerpoMatch[1].trim() : raw.trim();

  return { gancho, cuerpo };
}

// Reintenta con backoff simple ante errores temporales (429/503) de la API de Groq.
async function withRetry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = i === attempts - 1;
      const isRetryable = /429|503|rate_limit/i.test(String(err));
      if (isLastAttempt || !isRetryable) throw err;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

async function callGroq(model, prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 1.0,
      max_tokens: 1300,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${model} fallo: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// Prueba los modelos disponibles en orden hasta que uno responda.
async function askGroq(prompt) {
  const models = await getModelList();

  let lastError;
  for (const model of models) {
    try {
      return await withRetry(() => callGroq(model, prompt));
    } catch (err) {
      lastError = err;
      console.warn(String(err));
    }
  }
  throw lastError;
}

// Elige un tema del banco que no se haya usado antes segun el historial. Si ya
// se usaron todos, se reutiliza el banco completo (se agotaron las variantes).
function pickUnusedTema(pool, history) {
  const unused = pool.filter((t) => !isTemaUsed(history, t));
  return pickRandom(unused.length > 0 ? unused : pool);
}

// Genera la historia (texto + gancho) evitando repetir temas o ganchos ya
// publicados, usando hasta 3 intentos si el resultado se parece a uno previo.
export async function generateStory(contentType, { history, trends = [] } = {}) {
  let tema;
  let trendUsed = null;
  const isTrend = contentType === "tendencia_del_dia" && trends.length > 0;

  if (isTrend) {
    const unusedTrends = trends.filter((t) => !isTemaUsed(history, t));
    trendUsed = pickRandom(unusedTrends.length > 0 ? unusedTrends : trends);
    tema = trendUsed;
  } else if (contentType === "confesion_anonima") {
    tema = pickUnusedTema(CONFESSION_PROMPTS, history);
  } else {
    tema = pickUnusedTema(TURBIO_PROMPTS, history);
  }

  const yaUsados = history?.hooks?.slice(-15).join(" | ") || "ninguno";
  const styleGuide = isTrend ? NEWS_STYLE_GUIDE : STYLE_GUIDE;
  const temaLine = isTrend
    ? `Tema del momento que esta sonando hoy: "${tema}"`
    : `Escribe un relato sobre: ${tema}`;

  const prompt = `${styleGuide}

${temaLine}

Ganchos ya usados recientemente (NO los repitas ni te parezcas a ellos): ${yaUsados}

Responde SOLO con las dos lineas GANCHO: y CUERPO:, sin comillas ni explicaciones adicionales.`;

  let gancho, cuerpo;
  for (let attempt = 0; attempt < 4; attempt++) {
    const text = await askGroq(prompt);
    ({ gancho, cuerpo } = parseStoryResponse(text));

    const endsProperly = /[.!?"'”]\s*$/.test(cuerpo);
    const isWellFormed =
      gancho.length > 0 && gancho.length < 120 && cuerpo.length > 900 && endsProperly;
    if (!isWellFormed) continue;
    if (!history || !isRepeated(history, gancho)) break;
  }

  const fullText = gancho ? `${toBoldUnicode(gancho)}\n\n${cuerpo}` : cuerpo;

  // Version para narrar en voz: sin negritas Unicode ni emojis, que la
  // sintesis de voz no sabe leer bien.
  const narration = `${gancho}. ${cuerpo}`.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,
    ""
  );

  return { text: fullText, hook: gancho, tema: trendUsed ?? tema, narration };
}

const SCENE_COUNT = 5;

// Genera varias descripciones cortas (en ingles) de escenas del relato -en
// orden narrativo, del inicio al desenlace- para armar un video con varias
// imagenes distintas en vez de una sola.
export async function generateImagePrompts(storyText) {
  const labels = Array.from({ length: SCENE_COUNT }, (_, i) => `ESCENA${i + 1}`);

  const prompt = `Basado en esta historia de terror/misterio, describe en ingles ${SCENE_COUNT} escenas
ilustrativas distintas, EN ORDEN, que sigan la progresion narrativa del relato de principio a fin
(introduccion, desarrollo, tension creciente, clímax/giro, y desenlace/secuela), para generar
imagenes FOTORREALISTAS (no caricatura, no dibujo animado, como fotografias reales tipo
reportaje/cinematografico de terror), con rostros no reconocibles/identificables (de espaldas, en
sombra, a contraluz, o borrosos), sin texto en la imagen, ambiente de terror/misterio,
iluminacion dramatica u oscura. Cada escena debe ser visualmente distinta entre si (diferente
encuadre, lugar o momento) para que se sienta como una progresion, no repeticiones de la misma toma.

Responde EXACTAMENTE en este formato, una escena por linea, sin agregar nada mas:
${labels.map((l) => `${l}: descripcion corta (maximo 30 palabras)`).join("\n")}

Historia:
${storyText}`;

  const text = await askGroq(prompt);
  const scenes = [...text.matchAll(/ESCENA\d+:\s*(.+)/gi)].map((m) => m[1].trim());

  return scenes.length === SCENE_COUNT ? scenes : Array(SCENE_COUNT).fill(text.trim());
}
