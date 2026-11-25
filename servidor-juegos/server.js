// Servidor privado de juegos para Jessito Emu — https://gamesdata.geodatos.com.mx
// Solo entra quien tenga la contraseña. Los juegos son del dueño y no se comparten públicamente.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { Pool } = require('pg');
const { procesar } = require('./lib/procesar');

const PUERTO = +process.env.PORT || 3077;
const BASE = process.env.DATA_DIR || '/var/lib/gamesdata';
const DIR = { juegos: path.join(BASE, 'juegos'), entrada: path.join(BASE, 'entrada'), trabajo: path.join(BASE, 'trabajo') };
const ORIGENES = (process.env.ALLOWED_ORIGINS || 'https://jessfn.github.io').split(',').map(s => s.trim());
const SECRETO = process.env.TOKEN_SECRET || '';
const HASH = process.env.PASSWORD_HASH || '';            // "scrypt:<sal>:<hash>" — lo crea poner-contrasena.js
const MAX_SUBIDA = +process.env.MAX_UPLOAD_BYTES || 4 * 1024 ** 3;
Object.values(DIR).forEach(d => fs.mkdirSync(d, { recursive: true }));

// Base de datos: conexión local sin contraseña (autenticación del sistema, usuario "gamesdata")
const db = new Pool({ host: process.env.PGHOST || '/var/run/postgresql', database: process.env.PGDATABASE || 'gamesdata', user: process.env.PGUSER || 'gamesdata', max: 4 });
async function prepararBD() {
  await db.query(`CREATE TABLE IF NOT EXISTS juegos (
    id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, original TEXT NOT NULL, consola TEXT,
    archivo TEXT, tamano BIGINT DEFAULT 0, estado TEXT NOT NULL DEFAULT 'en cola', mensaje TEXT,
    creado TIMESTAMPTZ NOT NULL DEFAULT now())`);
  // Si el servidor se reinició a mitad de un proceso, se reintenta
  await db.query(`UPDATE juegos SET estado='en cola' WHERE estado NOT IN ('listo','error')`);
}

// ===== Seguridad =====
function verificarContrasena(pw) {
  const [tipo, sal, hash] = HASH.split(':');
  if (tipo !== 'scrypt' || !sal || !hash || typeof pw !== 'string') return false;
  const calc = crypto.scryptSync(pw, Buffer.from(sal, 'hex'), 64);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === calc.length && crypto.timingSafeEqual(calc, esperado);
}
const firmar = exp => crypto.createHmac('sha256', SECRETO).update(String(exp)).digest('base64url');
function crearToken(dias = 60) { const exp = Date.now() + dias * 864e5; return exp + '.' + firmar(exp); }
function tokenValido(t) {
  if (!t || !SECRETO) return false;
  const [exp, sig] = String(t).split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(firmar(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
// Freno a fuerza bruta: 10 intentos fallidos por IP cada 15 minutos
const intentos = new Map();
function bloqueado(ip) { const r = intentos.get(ip); return r && r.n >= 10 && Date.now() - r.t < 15 * 60e3; }
function fallo(ip) { const r = intentos.get(ip); if (!r || Date.now() - r.t > 15 * 60e3) intentos.set(ip, { n: 1, t: Date.now() }); else r.n++; }

// ===== Utilidades HTTP =====
function cors(req, res) {
  const o = req.headers.origin;
  if (o && ORIGENES.includes(o)) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Range, X-Nombre');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Disposition');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}
function json(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); }
function leerJson(req, max = 4096) {
  return new Promise((ok, ko) => { let s = ''; req.on('data', c => { s += c; if (s.length > max) { ko(new Error('demasiado grande')); req.destroy(); } }); req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch (e) { ko(e); } }); });
}
const ipDe = req => (req.headers['x-real-ip'] || req.socket.remoteAddress || '').toString();
const tokenDe = (req, url) => (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('t');
const nombreSeguro = n => path.basename(String(n || 'juego')).replace(/[^\w .()\[\]+,&'-]/g, '_').slice(0, 180) || 'juego';

// ===== Cola de procesamiento (un juego a la vez) =====
let trabajando = false;
async function siguiente() {
  if (trabajando) return; trabajando = true;
  try {
    for (;;) {
      const { rows } = await db.query(`SELECT * FROM juegos WHERE estado='en cola' ORDER BY id LIMIT 1`);
      const j = rows[0]; if (!j) break;
      const entrada = path.join(DIR.entrada, j.id + '-' + j.original);
      if (!fs.existsSync(entrada)) { await db.query(`UPDATE juegos SET estado='error', mensaje='archivo subido no encontrado' WHERE id=$1`, [j.id]); continue; }
      const avisar = m => db.query(`UPDATE juegos SET estado=$2 WHERE id=$1`, [j.id, m]).catch(() => {});
      try {
        await avisar('procesando');
        const r = await procesar(entrada, j.original, path.join(DIR.trabajo, String(j.id)), path.join(DIR.juegos, String(j.id)), avisar);
        const tam = fs.statSync(r.ruta).size;
        await db.query(`UPDATE juegos SET estado='listo', mensaje=NULL, consola=$2, archivo=$3, tamano=$4, nombre=$5 WHERE id=$1`, [j.id, r.consola, path.basename(r.ruta), tam, r.nombre]);
        console.log(`[listo] #${j.id} ${r.nombre} (${r.consola}, ${Math.round(tam / 1e6)} MB)`);
      } catch (e) {
        console.error(`[error] #${j.id}`, e.message);
        await db.query(`UPDATE juegos SET estado='error', mensaje=$2 WHERE id=$1`, [j.id, e.message.slice(0, 300)]);
      }
    }
  } finally { trabajando = false; }
}

// ===== Rutas =====
async function manejar(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://x');
  const ruta = url.pathname.replace(/\/+$/, '') || '/';
  const ip = ipDe(req);

  if (ruta === '/api/salud') return json(res, 200, { ok: true, configurado: !!(HASH && SECRETO) });

  if (ruta === '/api/entrar' && req.method === 'POST') {
    if (bloqueado(ip)) return json(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
    const { contrasena } = await leerJson(req).catch(() => ({}));
    if (!verificarContrasena(contrasena)) { fallo(ip); return json(res, 401, { error: 'Contraseña incorrecta' }); }
    intentos.delete(ip);
    return json(res, 200, { token: crearToken() });
  }

  // Todo lo demás requiere sesión
  if (!tokenValido(tokenDe(req, url))) return json(res, 401, { error: 'Necesitas iniciar sesión' });

  if (ruta === '/api/juegos' && req.method === 'GET') {
    const { rows } = await db.query(`SELECT id, nombre, original, consola, archivo, tamano, estado, mensaje, creado FROM juegos ORDER BY creado DESC`);
    return json(res, 200, { juegos: rows });
  }

  // Subida: el cuerpo es el archivo tal cual (sin formularios), así no se carga en memoria
  if (ruta === '/api/subir' && req.method === 'PUT') {
    const original = nombreSeguro(decodeURIComponent(req.headers['x-nombre'] || url.searchParams.get('nombre') || 'juego'));
    const largo = +req.headers['content-length'] || 0;
    if (largo > MAX_SUBIDA) return json(res, 413, { error: 'Archivo demasiado grande' });
    const { rows } = await db.query(`INSERT INTO juegos (nombre, original, estado) VALUES ($1,$2,'subiendo') RETURNING id`, [original.replace(/\.[^.]+$/, ''), original]);
    const id = rows[0].id, destino = path.join(DIR.entrada, id + '-' + original);
    const out = fs.createWriteStream(destino);
    let recibido = 0, cortado = false;
    req.on('data', c => { recibido += c.length; if (recibido > MAX_SUBIDA && !cortado) { cortado = true; req.destroy(); } });
    req.pipe(out);
    out.on('finish', async () => {
      if (cortado || (largo && recibido < largo)) { fs.rmSync(destino, { force: true }); await db.query(`DELETE FROM juegos WHERE id=$1`, [id]); return json(res, 400, { error: 'Subida incompleta' }); }
      await db.query(`UPDATE juegos SET estado='en cola', tamano=$2 WHERE id=$1`, [id, recibido]);
      json(res, 200, { id, estado: 'en cola' });
      siguiente();
    });
    req.on('aborted', async () => { out.destroy(); fs.rmSync(destino, { force: true }); await db.query(`DELETE FROM juegos WHERE id=$1`, [id]).catch(() => {}); });
    return;
  }

  let m;
  // Descarga del juego preparado, por partes (Range) para no cargar todo de golpe
  if ((m = ruta.match(/^\/api\/juegos\/(\d+)\/archivo$/)) && req.method === 'GET') {
    const { rows } = await db.query(`SELECT * FROM juegos WHERE id=$1 AND estado='listo'`, [+m[1]]);
    const j = rows[0]; if (!j) return json(res, 404, { error: 'No existe o aún se está preparando' });
    const archivo = path.join(DIR.juegos, j.archivo);
    const st = fs.statSync(archivo), nombre = j.nombre + path.extname(j.archivo);
    const cab = { 'Content-Type': 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=31536000, immutable',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}` };
    const r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (r) {
      const ini = r[1] ? +r[1] : st.size - +r[2], fin = r[1] && r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1;
      if (ini >= st.size || ini > fin) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { ...cab, 'Content-Range': `bytes ${ini}-${fin}/${st.size}`, 'Content-Length': fin - ini + 1 });
      return fs.createReadStream(archivo, { start: ini, end: fin }).pipe(res);
    }
    res.writeHead(200, { ...cab, 'Content-Length': st.size });
    return fs.createReadStream(archivo).pipe(res);
  }

  if ((m = ruta.match(/^\/api\/juegos\/(\d+)$/)) && req.method === 'DELETE') {
    const { rows } = await db.query(`DELETE FROM juegos WHERE id=$1 RETURNING archivo, original`, [+m[1]]);
    if (rows[0]?.archivo) fs.rmSync(path.join(DIR.juegos, rows[0].archivo), { force: true });
    if (rows[0]) fs.rmSync(path.join(DIR.entrada, m[1] + '-' + rows[0].original), { force: true });
    return json(res, 200, { ok: true });
  }

  if ((m = ruta.match(/^\/api\/juegos\/(\d+)\/reintentar$/)) && req.method === 'POST') {
    await db.query(`UPDATE juegos SET estado='en cola', mensaje=NULL WHERE id=$1 AND estado='error'`, [+m[1]]);
    siguiente(); return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: 'No encontrado' });
}

const server = http.createServer((req, res) => manejar(req, res).catch(e => { console.error(e); if (!res.headersSent) json(res, 500, { error: 'Error interno' }); else res.end(); }));
server.requestTimeout = 0;          // las subidas grandes pueden tardar
server.headersTimeout = 60e3;
prepararBD().then(() => {
  server.listen(PUERTO, '127.0.0.1', () => console.log(`Servidor de juegos en http://127.0.0.1:${PUERTO} (configurado: ${!!(HASH && SECRETO)})`));
  siguiente();
}).catch(e => { console.error('No se pudo preparar la base de datos:', e.message); process.exit(1); });
