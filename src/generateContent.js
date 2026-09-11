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

const STYLE_GUIDE = `Eres un redactor de contenido de entretenimiento para una pagina de Facebook mexicana.
Escribes relatos anonimos de suspenso/morbo estilo "confesion" o "historia que me contaron",
en primera persona, como si alguien lo estuviera contando de verdad. El objetivo es generar
morbo e intriga genuinos: revelaciones fuertes, giros inesperados, secretos incomodos.

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
  para que evites parecerte a ellos).`;

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
      max_tokens: 700,
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

  if (contentType === "tendencia_del_dia" && trends.length > 0) {
    const unusedTrends = trends.filter((t) => !isTemaUsed(history, t));
    trendUsed = pickRandom(unusedTrends.length > 0 ? unusedTrends : trends);
    tema = `un relato de suspenso/morbo inspirado libremente en el tema del momento "${trendUsed}" (ficcion, sin presentarlo como hecho real relacionado a ese tema)`;
  } else if (contentType === "confesion_anonima") {
    tema = pickUnusedTema(CONFESSION_PROMPTS, history);
  } else {
    tema = pickUnusedTema(TURBIO_PROMPTS, history);
  }

  const yaUsados = history?.hooks?.slice(-15).join(" | ") || "ninguno";

  const prompt = `${STYLE_GUIDE}

Escribe un relato sobre: ${tema}

Ganchos ya usados recientemente (NO los repitas ni te parezcas a ellos): ${yaUsados}

Responde SOLO con las dos lineas GANCHO: y CUERPO:, sin comillas ni explicaciones adicionales.`;

  let gancho, cuerpo;
  for (let attempt = 0; attempt < 3; attempt++) {
    const text = await askGroq(prompt);
    ({ gancho, cuerpo } = parseStoryResponse(text));

    const isWellFormed = gancho.length > 0 && gancho.length < 120 && cuerpo.length > 300;
    if (!isWellFormed) continue;
    if (!history || !isRepeated(history, gancho)) break;
  }

  const fullText = gancho ? `${toBoldUnicode(gancho)}\n\n${cuerpo}` : cuerpo;

  return { text: fullText, hook: gancho, tema: trendUsed ?? tema };
}

// Genera una descripcion corta (en ingles) para pedir la imagen ilustrativa del post.
export async function generateImagePrompt(storyText) {
  const prompt = `Basado en esta historia de suspenso/misterio, describe en ingles UNA escena ilustrativa
para generar una imagen estilo dibujo animado/ilustracion (NO fotorrealista, NO rostros reconocibles,
sin texto en la imagen, ambiente misterioso/intrigante, colores oscuros o atardecer).
Responde solo con la descripcion de la escena, una sola linea, maximo 40 palabras.

Historia:
${storyText}`;

  return askGroq(prompt);
}
