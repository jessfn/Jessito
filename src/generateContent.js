import { GoogleGenAI } from "@google/genai";
import { CONFESSION_PROMPTS, TURBIO_PROMPTS, pickRandom } from "./topics.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const STYLE_GUIDE = `Eres un redactor de contenido de entretenimiento para una pagina de Facebook mexicana.
Escribes relatos anonimos de suspenso/morbo estilo "confesion" o "historia que me contaron",
con lenguaje coloquial mexicano, en primera persona, como si alguien lo estuviera contando de verdad.

Reglas obligatorias:
- SIEMPRE deja claro, al inicio o al final del texto, que es un relato anonimo/de ficcion enviado a la pagina
  (ejemplo: "Historia anonima que nos compartieron..." o "Relato enviado por un seguidor (nombres cambiados)").
  NUNCA lo presentes como noticia verificada o hecho confirmado.
- Nada de violencia grafica, contenido sexual explicito, odio, menores en situaciones sensibles,
  ni nombres reales de personas identificables.
- Maximo 700 caracteres, con gancho fuerte en la primera linea para generar intriga.
- Termina con una pregunta corta para generar comentarios (ej. "¿ustedes que hubieran hecho?").
- No incluyas hashtags ni emojis en exceso (maximo 2-3 emojis).`;

export async function generateStory(contentType) {
  const tema =
    contentType === "confesion_anonima"
      ? pickRandom(CONFESSION_PROMPTS)
      : pickRandom(TURBIO_PROMPTS);

  const prompt = `${STYLE_GUIDE}

Escribe un relato sobre: ${tema}

Responde SOLO con el texto final del post, sin comillas ni explicaciones adicionales.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
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
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
}
