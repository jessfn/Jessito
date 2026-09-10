// Banco de temas/estilos para rotar el contenido y no repetir siempre lo mismo.
export const CONTENT_TYPES = [
  "confesion_anonima",
  "suceso_turbio_mexico",
  "noticia_entretenimiento",
];

export const CONFESSION_PROMPTS = [
  "una persona descubre a su pareja engañándola con un familiar cercano",
  "alguien vive una noche rara en una fiesta de un pueblo chico y nunca entendió qué pasó",
  "un mensaje de texto que llegó de un número desconocido y cambió una relación",
  "una mudanza a una casa con un vecino que se comporta muy extraño",
  "un secreto familiar que salió a la luz en una comida navideña",
  "un viaje en autobús nocturno donde algo no cuadraba",
  "una amistad de años que terminó por una traición inesperada",
];

export const TURBIO_PROMPTS = [
  "un pueblo pequeño donde la gente evita hablar de algo que pasó hace años",
  "una carretera con fama de rara entre los choferes de la zona",
  "un rumor local sobre una casa abandonada y quién vivía ahí",
  "una tradición de un pueblo que nadie de fuera entiende bien",
  "una historia que se cuenta de boca en boca en un mercado o feria",
];

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickContentType() {
  return pickRandom(CONTENT_TYPES);
}
