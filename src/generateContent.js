import { CONFESSION_PROMPTS, TURBIO_PROMPTS, pickRandom } from "./topics.js";

// Modelos preferidos en orden, por si alguno deja de estar disponible en Groq.
const PREFERRED_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

let cachedModel = null;

// Pregunta a Groq que modelos estan disponibles y elige el mejor de la lista de
// preferencia (o el primero disponible si ninguno coincide), para no romperse
// cuando Groq renombra o retira un modelo.
async function resolveModel() {
  if (cachedModel) return cachedModel;

  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
  });
  if (!res.ok) {
    cachedModel = PREFERRED_MODELS[0];
    return cachedModel;
  }

  const data = await res.json();
  const availableIds = new Set((data.data ?? []).map((m) => m.id));

  cachedModel =
    PREFERRED_MODELS.find((m) => availableIds.has(m)) ??
    [...availableIds][0] ??
    PREFERRED_MODELS[0];

  return cachedModel;
}

const STYLE_GUIDE = `Eres un redactor de contenido de entretenimiento para una pagina de Facebook mexicana.
Escribes relatos anonimos de suspenso/morbo estilo "confesion" o "historia que me contaron",
en primera persona, como si alguien lo estuviera contando de verdad.

Estilo de escritura:
- Espanol neutro/narrativo, cuidado y bien redactado. Nada de modismos o jerga coloquial
  (nada de "naco", "wey", "no manches", groserias, ni muletillas de habla informal).
- Puede sonar cercano y conversacional, pero correcto gramaticalmente, como una buena narracion.

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
- No incluyas hashtags ni emojis en exceso (maximo 2-3 emojis).`;

// Convierte texto normal a "negritas" usando caracteres Unicode matematicos,
// ya que Facebook no soporta Markdown en las publicaciones.
function toBoldUnicode(text) {
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

  return text
    .split("")
    .map((ch) => boldMap[ch] ?? ch)
    .join("");
}

function parseStoryResponse(raw) {
  const ganchoMatch = raw.match(/GANCHO:\s*(.+)/i);
  const cuerpoMatch = raw.match(/CUERPO:\s*([\s\S]+)/i);

  const gancho = ganchoMatch ? ganchoMatch[1].trim() : "";
  const cuerpo = cuerpoMatch ? cuerpoMatch[1].trim() : raw.trim();

  if (!gancho) return cuerpo;

  return `${toBoldUnicode(gancho)}\n\n${cuerpo}`;
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

async function askGroq(prompt) {
  const model = await resolveModel();

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq fallo: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export async function generateStory(contentType) {
  const tema =
    contentType === "confesion_anonima"
      ? pickRandom(CONFESSION_PROMPTS)
      : pickRandom(TURBIO_PROMPTS);

  const prompt = `${STYLE_GUIDE}

Escribe un relato sobre: ${tema}

Responde SOLO con las dos lineas GANCHO: y CUERPO:, sin comillas ni explicaciones adicionales.`;

  const text = await withRetry(() => askGroq(prompt));
  return parseStoryResponse(text);
}

// Genera una descripcion corta (en ingles) para pedir la imagen ilustrativa del post.
export async function generateImagePrompt(storyText) {
  const prompt = `Basado en esta historia de suspenso/misterio, describe en ingles UNA escena ilustrativa
para generar una imagen estilo dibujo animado/ilustracion (NO fotorrealista, NO rostros reconocibles,
sin texto en la imagen, ambiente misterioso/intrigante, colores oscuros o atardecer).
Responde solo con la descripcion de la escena, una sola linea, maximo 40 palabras.

Historia:
${storyText}`;

  return withRetry(() => askGroq(prompt));
}
