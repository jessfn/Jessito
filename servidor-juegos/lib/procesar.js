// Prepara un juego subido para que el celular lo juegue con el menor esfuerzo posible:
// descomprime (.7z/.zip/.rar), reconstruye discos .ecm, convierte discos de PlayStation a .chd
// (más pequeño y se lee directo) y detecta la consola.
const fs = require('fs'), path = require('path');
const { spawn } = require('child_process');
const { detectar } = require('./detectar');
const { decode } = require('./ecm.cjs');

const META = /\.(txt|nfo|diz|jpe?g|png|gif|bmp|pdf|htm|html|url|sfv|md5|sha1|xml|ini|cfg|sbi|sub|ccd|mds)$/i;

function correr(cmd, args, cwd) {
  return new Promise((ok, ko) => {
    const p = spawn(cmd, args, { cwd, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = ''; p.stderr.on('data', d => { err = (err + d).slice(-2000); });
    p.on('error', ko);
    p.on('close', c => c === 0 ? ok() : ko(new Error(cmd + ' falló (' + c + '): ' + err.trim().split('\n').pop())));
  });
}

function listar(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listar(p)); else out.push(p);
  }
  return out;
}

const esComprimido = n => /\.(7z|zip|rar)$/i.test(n);

async function deEcm(ruta) {
  const salida = ruta.replace(/\.ecm$/i, '');
  const parts = await decode(await fs.openAsBlob(ruta));
  const fd = fs.openSync(salida, 'w');
  try { for (const p of parts) fs.writeSync(fd, p); } finally { fs.closeSync(fd); }
  fs.unlinkSync(ruta);
  return salida;
}

// Crea una hoja de pistas .cue sencilla para un .bin de PlayStation que venga sin ella
function crearCue(bin) {
  const cue = bin.replace(/\.bin$/i, '') + '.cue';
  fs.writeFileSync(cue, `FILE "${path.basename(bin)}" BINARY\n  TRACK 01 MODE2/2352\n    INDEX 01 00:00:00\n`);
  return cue;
}

/**
 * @param {string} archivo  ruta del archivo subido
 * @param {string} nombre   nombre original
 * @param {string} trabajo  carpeta temporal (se borra al final)
 * @param {string} destinoBase ruta final SIN extensión (p.ej. /var/lib/gamesdata/juegos/12)
 * @returns {{consola, ruta, nombre}}
 */
async function procesar(archivo, nombre, trabajo, destinoBase, avisar = () => {}) {
  fs.mkdirSync(trabajo, { recursive: true });
  try {
    let archivos;
    if (esComprimido(nombre)) {
      avisar('descomprimiendo');
      await correr('7z', ['x', '-y', '-o' + trabajo, archivo], trabajo);
      archivos = listar(trabajo);
    } else {
      const copia = path.join(trabajo, nombre);
      fs.renameSync(archivo, copia);
      archivos = [copia];
    }
    // Reconstruir discos .ecm
    for (let i = 0; i < archivos.length; i++) if (/\.ecm$/i.test(archivos[i])) { avisar('reconstruyendo disco'); archivos[i] = await deEcm(archivos[i]); }

    const juegos = archivos.filter(f => !META.test(f) && !/\.cue$/i.test(f)).sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
    const principal = juegos[0];
    if (!principal) throw new Error('no encontré ningún juego dentro del archivo');
    const consola = detectar(principal, path.basename(principal));
    const nombreJuego = path.basename(principal).replace(/\.[^.]+$/, '');

    // PlayStation: convertir a .chd (comprimido, lo lee el emulador directo)
    if (consola === 'psx' && !/\.(chd|pbp)$/i.test(principal)) {
      let cue = archivos.find(f => /\.cue$/i.test(f));
      if (!cue && /\.(bin|img|iso)$/i.test(principal)) cue = /\.iso$/i.test(principal) ? principal : crearCue(principal);
      if (cue) {
        avisar('convirtiendo a CHD');
        const chd = destinoBase + '.chd';
        await correr('chdman', ['createcd', '-f', '-i', cue, '-o', chd], path.dirname(cue));
        return { consola, ruta: chd, nombre: nombreJuego };
      }
    }
    const ext = path.extname(principal).toLowerCase() || '.bin';
    const destino = destinoBase + ext;
    fs.renameSync(principal, destino);
    return { consola, ruta: destino, nombre: nombreJuego };
  } finally {
    fs.rmSync(trabajo, { recursive: true, force: true });
    fs.rmSync(archivo, { force: true });
  }
}

module.exports = { procesar };
