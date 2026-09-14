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
  "llevar a una persona mayor a su casa esa noche, y despues descubrir que ya habia fallecido antes de esa noche",
  "dar aventon a alguien en la carretera que desaparece sin explicacion al llegar al destino",
  "una conversacion larga con un desconocido en un velorio que resulto ser alguien que no deberia estar ahi",
  "cuidar a un vecino anciano varias noches, y despues enterarse de que llevaba tiempo muerto",
];

export const TURBIO_PROMPTS = [
  "un pueblo pequeño donde la gente evita hablar de algo aterrador que paso hace años",
  "una carretera con fama siniestra entre los choferes de la zona, por lo que le pasa a quien se detiene ahi",
  "un rumor local sobre una casa abandonada y la persona que vivia ahi antes de desaparecer",
  "una tradicion de un pueblo con un origen macabro que nadie de fuera entiende",
  "una anciana del pueblo que cuidaba niños y de la que nunca se volvio a saber de varios de ellos",
  "un negocio familiar con una reputacion siniestra por lo que le paso a sus antiguos empleados",
  "una fiesta patronal con una costumbre que esconde un pacto oscuro del pueblo",
  "un edificio o rancho donde han desaparecido varias personas a lo largo de los años",
  "un orfanato o casa hogar cerrado hace años por algo que nunca se explico bien",
  "un cuidador de ancianos o niños del que la gente empezo a sospechar",
  "una serie de desapariciones en un mismo pueblo que nadie logro conectar hasta ahora",
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
