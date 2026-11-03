// Lecciones infantiles: [emoji, palabra, dato, cantidad (opcional)].
// Cada dia se usa la primera leccion que todavia no se ha publicado.
export const LESSONS = [
  { tema: "colores", titulo: "Los colores", items: [
    ["🍎", "Rojo", "Rojo como una manzana."], ["🐳", "Azul", "Azul como el mar."],
    ["⭐", "Amarillo", "Amarillo como una estrella."], ["🐸", "Verde", "Verde como una ranita."],
    ["🍊", "Naranja", "Naranja como una naranja."] ] },
  { tema: "numeros-1-5", titulo: "Los números del 1 al 5", items: [
    ["⭐", "Uno", "Una estrella.", 1], ["🐱", "Dos", "Dos gatitos.", 2], ["🎈", "Tres", "Tres globos.", 3],
    ["🍓", "Cuatro", "Cuatro fresas.", 4], ["🐥", "Cinco", "Cinco pollitos.", 5] ] },
  { tema: "formas", titulo: "Las formas", items: [
    ["🔴", "Círculo", "Redondo como una pizza."], ["🟦", "Cuadrado", "Cuadrado como una ventana."],
    ["🔺", "Triángulo", "Un triángulo, como el techo de una casa."], ["⭐", "Estrella", "Brilla como en el cielo."],
    ["❤", "Corazón", "El corazón es para dar cariño."] ] },
  { tema: "granja", titulo: "Los animales de la granja", items: [
    ["🐄", "La vaca", "La vaca hace muuu."], ["🐓", "El gallo", "El gallo hace kikirikí."],
    ["🐑", "La oveja", "La oveja hace beee."], ["🦆", "El pato", "El pato hace cuac cuac."],
    ["🐷", "El cerdito", "El cerdito hace oink."], ["🐴", "El caballo", "El caballo hace iiijiji."] ] },
  { tema: "frutas", titulo: "Las frutas", items: [
    ["🍌", "El plátano", "El plátano es amarillo."], ["🍓", "La fresa", "La fresa es roja y dulce."],
    ["🍇", "Las uvas", "Las uvas crecen en racimos."], ["🍉", "La sandía", "La sandía es grande y jugosa."],
    ["🍍", "La piña", "La piña tiene una corona."] ] },
  { tema: "selva", titulo: "Los animales de la selva", items: [
    ["🦁", "El león", "El león ruge muy fuerte."], ["🐘", "El elefante", "El elefante tiene una trompa larga."],
    ["🐒", "El mono", "El mono salta de árbol en árbol."], ["🦒", "La jirafa", "La jirafa tiene el cuello larguísimo."],
    ["🐯", "El tigre", "El tigre tiene rayas."] ] },
  { tema: "numeros-6-10", titulo: "Los números del 6 al 10", items: [
    ["🍪", "Seis", "Seis galletas.", 6], ["🦋", "Siete", "Siete mariposas.", 7], ["🍎", "Ocho", "Ocho manzanas.", 8],
    ["🐸", "Nueve", "Nueve ranitas.", 9], ["⭐", "Diez", "Diez estrellas.", 10] ] },
  { tema: "mar", titulo: "Los animales del mar", items: [
    ["🐟", "El pez", "El pez nada con su cola."], ["🐙", "El pulpo", "El pulpo tiene ocho brazos."],
    ["🐢", "La tortuga", "La tortuga camina despacito."], ["🐬", "El delfín", "El delfín salta muy alto."],
    ["🦀", "El cangrejo", "El cangrejo camina de lado."] ] },
  { tema: "vehiculos", titulo: "Los vehículos", items: [
    ["🚗", "El coche", "El coche hace brum brum."], ["🚌", "El autobús", "El autobús lleva a muchos niños."],
    ["🚒", "El camión de bomberos", "Los bomberos apagan el fuego."], ["🚑", "La ambulancia", "La ambulancia ayuda a los enfermitos."],
    ["✈", "El avión", "El avión vuela por el cielo."] ] },
  { tema: "emociones", titulo: "Las emociones", items: [
    ["😀", "Feliz", "Estoy feliz cuando juego."], ["😢", "Triste", "Estoy triste cuando algo me duele."],
    ["😡", "Enojado", "Estoy enojado, ¡respira hondo!"], ["😴", "Con sueño", "Tengo sueño, es hora de dormir."],
    ["😮", "Sorprendido", "¡Qué sorpresa!"] ] },
  { tema: "verduras", titulo: "Las verduras", items: [
    ["🥕", "La zanahoria", "La zanahoria es naranja y crujiente."], ["🌽", "El maíz", "El maíz es amarillo."],
    ["🍅", "El jitomate", "El jitomate es rojo y jugoso."], ["🥦", "El brócoli", "El brócoli parece un arbolito."],
    ["🥒", "El pepino", "El pepino es verde y fresquito."] ] },
  { tema: "clima", titulo: "El clima", items: [
    ["☀", "El sol", "Hace sol y hace calor."], ["🌧", "La lluvia", "Llueve, ¡saca tu paraguas!"],
    ["❄", "La nieve", "La nieve es blanca y fría."], ["🌈", "El arcoíris", "El arcoíris sale después de la lluvia."],
    ["💨", "El viento", "El viento sopla fuerte."] ] },
  { tema: "cuerpo", titulo: "Las partes del cuerpo", items: [
    ["👀", "Los ojos", "Con los ojos vemos."], ["👂", "Las orejas", "Con las orejas escuchamos."],
    ["👃", "La nariz", "Con la nariz olemos."], ["👄", "La boca", "Con la boca hablamos y comemos."],
    ["✋", "Las manos", "Con las manos aplaudimos."] ] },
  { tema: "insectos", titulo: "Los insectos", items: [
    ["🐝", "La abeja", "La abeja hace miel."], ["🦋", "La mariposa", "La mariposa tiene alas de colores."],
    ["🐞", "La catarina", "La catarina tiene puntitos."], ["🐜", "La hormiga", "La hormiga es muy trabajadora."],
    ["🐛", "La oruga", "La oruga se convierte en mariposa."] ] },
  { tema: "instrumentos", titulo: "Los instrumentos musicales", items: [
    ["🥁", "El tambor", "El tambor hace pum pum."], ["🎸", "La guitarra", "La guitarra tiene cuerdas."],
    ["🎹", "El piano", "El piano tiene teclas blancas y negras."], ["🎺", "La trompeta", "La trompeta suena muy fuerte."],
    ["🎻", "El violín", "El violín suena muy bonito."] ] },
  { tema: "ropa", titulo: "La ropa", items: [
    ["👕", "La camiseta", "La camiseta nos cubre el cuerpo."], ["👖", "El pantalón", "El pantalón cubre las piernas."],
    ["🧦", "Los calcetines", "Los calcetines abrigan los pies."], ["🧢", "La gorra", "La gorra cubre del sol."],
    ["👟", "Los tenis", "Los tenis son para correr."] ] },
  { tema: "espacio", titulo: "El espacio", items: [
    ["🌙", "La luna", "La luna brilla de noche."], ["☀", "El sol", "El sol es una estrella enorme."],
    ["⭐", "Las estrellas", "Las estrellas titilan."], ["🪐", "Los planetas", "Saturno tiene anillos."],
    ["🚀", "El cohete", "El cohete viaja al espacio."] ] },
  { tema: "comida", titulo: "Los alimentos", items: [
    ["🍞", "El pan", "El pan está hecho de harina."], ["🥛", "La leche", "La leche nos hace fuertes."],
    ["🧀", "El queso", "El queso es muy rico."], ["🥚", "El huevo", "El huevo viene de la gallina."],
    ["🍪", "La galleta", "La galleta es un premio dulce."] ] },
  { tema: "juguetes", titulo: "Los juguetes", items: [
    ["🧸", "El osito", "El osito es suavecito."], ["⚽", "La pelota", "La pelota rueda y rebota."],
    ["🪁", "El papalote", "El papalote vuela con el viento."], ["🎈", "El globo", "El globo flota en el aire."],
    ["🚂", "El tren", "El tren hace chu chu."] ] },
  { tema: "escuela", titulo: "Los útiles escolares", items: [
    ["✏", "El lápiz", "El lápiz sirve para escribir."], ["📚", "Los libros", "Los libros cuentan historias."],
    ["✂", "Las tijeras", "Las tijeras cortan papel."], ["🎒", "La mochila", "La mochila carga mis cosas."],
    ["📏", "La regla", "La regla sirve para medir."] ] },
  { tema: "aves", titulo: "Las aves", items: [
    ["🐦", "El pajarito", "El pajarito canta en el árbol."], ["🦉", "El búho", "El búho ve de noche."],
    ["🦜", "El loro", "El loro repite lo que dices."], ["🦅", "El águila", "El águila vuela muy alto."],
    ["🐧", "El pingüino", "El pingüino nada en el hielo."] ] },
];
