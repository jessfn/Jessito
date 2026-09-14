// Banco de temas/estilos para rotar el contenido y no repetir siempre lo mismo.
export const CONFESSION_PROMPTS = [
  "una persona descubre que su pareja la engañaba con un familiar, y algo mas oscuro detras de eso",
  "alguien vive una noche de terror en una fiesta de un pueblo chico y nunca entendio que paso",
  "un mensaje de un numero desconocido que sabia cosas que nadie mas podia saber",
  "una mudanza a una casa con un vecino que resulta ser aterrador",
  "un secreto familiar oscuro que salio a la luz en una comida navideña",
  "un viaje en autobus nocturno donde algo profundamente inquietante ocurrio",
  "una amistad de años que termino al descubrir algo siniestro sobre esa persona",
  "una herencia familiar que revelo un secreto macabro que nadie queria contar",
  "un compañero de trabajo que resulto ser alguien completamente distinto y peligroso",
  "una boda que se cancelo por algo aterrador que nadie esperaba",
  "un objeto heredado que empezo a traer sucesos que no tienen explicacion",
  "una llamada telefonica de alguien que ya habia muerto",
];

export const TURBIO_PROMPTS = [
  "un pueblo pequeño donde la gente evita hablar de algo que pasó hace años",
  "una carretera con fama de rara entre los choferes de la zona",
  "un rumor local sobre una casa abandonada y quién vivía ahí",
  "una tradición de un pueblo que nadie de fuera entiende bien",
  "una historia que se cuenta de boca en boca en un mercado o feria",
  "un negocio familiar con una reputacion extraña en su comunidad",
  "una fiesta patronal con una costumbre que nadie de afuera entiende",
  "un edificio o rancho con mala fama entre los locales",
];

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 2 de las 3 publicaciones diarias (9am y 3pm hora de Mexico, cron a las 15:00
// y 21:00 UTC) se basan en tendencias/ultimo momento; la de las 9pm rota entre
// confesion y suceso turbio para variar el tono.
export function pickContentType(now = new Date()) {
  const isTrendSlot = now.getUTCHours() === 15 || now.getUTCHours() === 21;
  if (isTrendSlot) return "tendencia_del_dia";
  return pickRandom(["confesion_anonima", "suceso_turbio_mexico"]);
}
