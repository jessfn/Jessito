import { GoogleGenAI } from "@google/genai";
import { CONFESSION_PROMPTS, TURBIO_PROMPTS, pickRandom } from "./topics.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export async function generateStory(contentType) {
  const tema =
    contentType === "confesion_anonima"
      ? pickRandom(CONFESSION_PROMPTS)
      : pickRandom(TURBIO_PROMPTS);

  const prompt = `${STYLE_GUIDE}

Escribe un relato sobre: ${tema}

Responde SOLO con las dos lineas GANCHO: y CUERPO:, sin comillas ni explicaciones adicionales.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return parseStoryResponse(response.text.trim());
}

// Genera una descripcion corta (en ingles) para pedir la imagen ilustrativa del post.
export async function generateImagePrompt(storyText) {
  const prompt = `Basado en esta historia de suspenso/misterio, describe en ingles UNA escena ilustrativa
para generar una imagen estilo dibujo animado/ilustracion (NO fotorrealista, NO rostros reconocibles,
sin texto en la imagen, ambiente misterioso/intrigante, colores oscuros o atardecer).
Responde solo con la descripcion de la escena, una sola linea, maximo 40 palabras.

Historia:
${storyText}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text.trim();
}
