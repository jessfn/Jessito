// Servidor de juegos para Jessito Emu — https://gamesdata.geodatos.com.mx
// Cada usuario tiene su cuenta, su propia biblioteca privada y sus partidas en la nube.
// Nadie ve ni descarga los juegos de otro usuario.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { Pool } = require('pg');
const { procesar } = require('./lib/procesar');
const { buscarPortada } = require('./lib/portadas');

const PUERTO = +process.env.PORT || 3077;
const BASE = process.env.DATA_DIR || '/var/lib/gamesdata';
const DIR = { juegos: path.join(BASE, 'juegos'), entrada: path.join(BASE, 'entrada'), trabajo: path.join(BASE, 'trabajo'),
  portadas: path.join(BASE, 'portadas'), partidas: path.join(BASE, 'partidas') };
const ORIGENES = (process.env.ALLOWED_ORIGINS || 'https://jessfn.github.io').split(',').map(s => s.trim());
const SECRETO = process.env.TOKEN_SECRET || '';
const MAX_SUBIDA = +process.env.MAX_UPLOAD_BYTES || 4 * 1024 ** 3;
const MAX_PARTIDA = 64 * 1024 ** 2;
Object.values(DIR).forEach(d => fs.mkdirSync(d, { recursive: true }));

// Base de datos local sin contraseña (autenticación del sistema, usuario "gamesdata")
const db = new Pool({ host: process.env.PGHOST || '/var/run/postgresql', database: process.env.PGDATABASE || 'gamesdata', user: process.env.PGUSER || 'gamesdata', max: 6 });
async function prepararBD() {
  await db.query(`CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, correo TEXT NOT NULL UNIQUE, hash TEXT NOT NULL,
    creado TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await db.query(`CREATE TABLE IF NOT EXISTS juegos (
    id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, original TEXT NOT NULL, consola TEXT,
    archivo TEXT, tamano BIGINT DEFAULT 0, estado TEXT NOT NULL DEFAULT 'en cola', mensaje TEXT,
    creado TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await db.query(`ALTER TABLE juegos ADD COLUMN IF NOT EXISTS portada BOOLEAN NOT NULL DEFAULT false`);
  await db.query(`ALTER TABLE juegos ADD COLUMN IF NOT EXISTS portada_intentos INT NOT NULL DEFAULT 0`);
  await db.query(`ALTER TABLE juegos ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE`);
  await db.query(`CREATE TABLE IF NOT EXISTS partidas (
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, clave TEXT NOT NULL, juego TEXT,
    archivo TEXT NOT NULL, tamano INT NOT NULL, tiempo BIGINT NOT NULL, PRIMARY KEY (usuario_id, clave))`);
  await db.query(`UPDATE juegos SET estado='en cola' WHERE estado NOT IN ('listo','error')`);
}

// ===== Contraseñas (solo se guarda la huella scrypt) =====
function huella(pw) { const sal = crypto.randomBytes(16); return 'scrypt:' + sal.toString('hex') + ':' + crypto.scryptSync(pw, sal, 64).toString('hex'); }
function verificar(pw, guardada) {
  const [tipo, sal, h] = String(guardada || '').split(':');
  if (tipo !== 'scrypt' || !sal || !h || typeof pw !== 'string') return false;
  const calc = crypto.scryptSync(pw, Buffer.from(sal, 'hex'), 64), esp = Buffer.from(h, 'hex');
  return esp.length === calc.length && crypto.timingSafeEqual(calc, esp);
}
// ===== Sesión: "usuario.vencimiento.firma" — se pide la contraseña una sola vez por dispositivo =====
const firmar = s => crypto.createHmac('sha256', SECRETO).update(s).digest('base64url');
function crearToken(uid, dias = 3650) { const s = uid + '.' + (Date.now() + dias * 864e5); return s + '.' + firmar(s); }
function usuarioDe(t) {
  if (!t || !SECRETO) return null;
  const p = String(t).split('.'); if (p.length !== 3) return null;
  const [uid, exp, sig] = p; if (+exp < Date.now()) return null;
  const a = Buffer.from(sig), b = Buffer.from(firmar(uid + '.' + exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? +uid : null;
}
// Freno a fuerza bruta: 10 intentos fallidos por IP cada 15 minutos
const intentos = new Map();
function bloqueado(ip) { const r = intentos.get(ip); return r && r.n >= 10 && Date.now() - r.t < 15 * 60e3; }
function fallo(ip) { const r = intentos.get(ip); if (!r || Date.now() - r.t > 15 * 60e3) intentos.set(ip, { n: 1, t: Date.now() }); else r.n++; }

// ===== Utilidades HTTP =====
function cors(req, res) {
  const o = req.headers.origin;
  if (o && ORIGENES.includes(o)) {
    res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Range, X-Nombre');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Disposition, X-Tiempo');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}
function json(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); }
function leerJson(req, max = 4096) {
  return new Promise((ok, ko) => { let s = ''; req.on('data', c => { s += c; if (s.length > max) { ko(new Error('demasiado grande')); req.destroy(); } }); req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch (e) { ko(e); } }); });
}
function leerBinario(req, max) {
  return new Promise((ok, ko) => { const partes = []; let n = 0; req.on('data', c => { n += c.length; if (n > max) { ko(new Error('demasiado grande')); req.destroy(); } else partes.push(c); }); req.on('end', () => ok(Buffer.concat(partes))); req.on('error', ko); });
}
const ipDe = req => (req.headers['x-real-ip'] || req.socket.remoteAddress || '').toString();
const tokenDe = (req, url) => (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('t');
const nombreSeguro = n => path.basename(String(n || 'juego')).replace(/[^\w .()\[\]+,&'-]/g, '_').slice(0, 180) || 'juego';
const correoValido = c => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(c);

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
        portadaDe({ id: j.id, nombre: r.nombre, consola: r.consola });
      } catch (e) {
        console.error(`[error] #${j.id}`, e.message);
        await db.query(`UPDATE juegos SET estado='error', mensaje=$2 WHERE id=$1`, [j.id, e.message.slice(0, 300)]);
      }
    }
  } finally { trabajando = false; }
}

// ===== Portadas =====
async function portadaDe(j) {
  try {
    const ok = await buscarPortada(j.nombre, j.consola, path.join(DIR.portadas, j.id + '.png'));
    await db.query(`UPDATE juegos SET portada=$2, portada_intentos=portada_intentos+1 WHERE id=$1`, [j.id, ok]);
    if (ok) console.log(`[portada] #${j.id} ${j.nombre}`);
  } catch (e) { console.error('[portada]', e.message); }
}
async function completarPortadas() {
  const { rows } = await db.query(`SELECT id, nombre, consola FROM juegos WHERE estado='listo' AND NOT portada AND portada_intentos < 3`);
  for (const j of rows) await portadaDe(j);
}
function enviarArchivo(req, res, archivo, nombre, tipo = 'application/octet-stream') {
  const st = fs.statSync(archivo);
  const cab = { 'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=31536000, immutable' };
  if (nombre) cab['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}`;
  const r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (r) {
    const ini = r[1] ? +r[1] : st.size - +r[2], fin = r[1] && r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1;
    if (ini >= st.size || ini > fin) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
    res.writeHead(206, { ...cab, 'Content-Range': `bytes ${ini}-${fin}/${st.size}`, 'Content-Length': fin - ini + 1 });
    return fs.createReadStream(archivo, { start: ini, end: fin }).pipe(res);
  }
  res.writeHead(200, { ...cab, 'Content-Length': st.size });
  fs.createReadStream(archivo).pipe(res);
}

// ===== Rutas =====
async function manejar(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://x');
  const ruta = url.pathname.replace(/\/+$/, '') || '/';
  const ip = ipDe(req);

  if (ruta === '/api/salud') return json(res, 200, { ok: true, configurado: !!SECRETO });

  // ----- Crear cuenta -----
  if (ruta === '/api/registro' && req.method === 'POST') {
    if (bloqueado(ip)) return json(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
    const b = await leerJson(req).catch(() => ({}));
    const nombre = String(b.nombre || '').trim().slice(0, 60), correo = String(b.correo || '').trim().toLowerCase().slice(0, 254);
    const pw = String(b.contrasena || ''), pw2 = String(b.confirmacion ?? b.contrasena ?? '');
    if (nombre.length < 2) return json(res, 400, { error: 'Escribe tu nombre' });
    if (!correoValido(correo)) return json(res, 400, { error: 'El correo no es válido' });
    if (pw.length < 8) return json(res, 400, { error: 'La contraseña debe tener al menos 8 caracteres' });
    if (pw !== pw2) return json(res, 400, { error: 'Las contraseñas no coinciden' });
    fallo(ip); // cuenta como intento para frenar registros masivos
    try {
      const { rows } = await db.query(`INSERT INTO usuarios (nombre, correo, hash) VALUES ($1,$2,$3) RETURNING id`, [nombre, correo, huella(pw)]);
      const uid = rows[0].id;
      // La primera cuenta se queda con los juegos que ya estaban en el servidor
      const { rows: n } = await db.query(`SELECT count(*)::int AS n FROM usuarios`);
      if (n[0].n === 1) await db.query(`UPDATE juegos SET usuario_id=$1 WHERE usuario_id IS NULL`, [uid]);
      console.log(`[registro] usuario #${uid}`);
      return json(res, 200, { token: crearToken(uid), usuario: { id: uid, nombre, correo } });
    } catch (e) {
      if (e.code === '23505') return json(res, 409, { error: 'Ya existe una cuenta con ese correo' });
      throw e;
    }
  }

  // ----- Entrar -----
  if (ruta === '/api/entrar' && req.method === 'POST') {
    if (bloqueado(ip)) return json(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
    const b = await leerJson(req).catch(() => ({}));
    const correo = String(b.correo || '').trim().toLowerCase();
    const { rows } = await db.query(`SELECT id, nombre, correo, hash FROM usuarios WHERE correo=$1`, [correo]);
    const u = rows[0];
    if (!u || !verificar(String(b.contrasena || ''), u.hash)) { fallo(ip); return json(res, 401, { error: 'Correo o contraseña incorrectos' }); }
    intentos.delete(ip);
    return json(res, 200, { token: crearToken(u.id), usuario: { id: u.id, nombre: u.nombre, correo: u.correo } });
  }

  // ----- Todo lo demás requiere sesión -----
  const uid = usuarioDe(tokenDe(req, url));
  if (!uid) return json(res, 401, { error: 'Necesitas iniciar sesión' });
  const { rows: yo } = await db.query(`SELECT id, nombre, correo FROM usuarios WHERE id=$1`, [uid]);
  if (!yo[0]) return json(res, 401, { error: 'La cuenta ya no existe' });

  if (ruta === '/api/yo' && req.method === 'GET') return json(res, 200, { usuario: yo[0] });

  if (ruta === '/api/juegos' && req.method === 'GET') {
    const { rows } = await db.query(`SELECT id, nombre, original, consola, archivo, tamano, estado, mensaje, portada, creado FROM juegos WHERE usuario_id=$1 ORDER BY creado DESC`, [uid]);
    return json(res, 200, { juegos: rows });
  }

  // Subida: el cuerpo es el archivo tal cual (sin formularios), así no se carga en memoria
  if (ruta === '/api/subir' && req.method === 'PUT') {
    const original = nombreSeguro(decodeURIComponent(req.headers['x-nombre'] || url.searchParams.get('nombre') || 'juego'));
    const largo = +req.headers['content-length'] || 0;
    if (largo > MAX_SUBIDA) return json(res, 413, { error: 'Archivo demasiado grande' });
    const { rows } = await db.query(`INSERT INTO juegos (nombre, original, estado, usuario_id) VALUES ($1,$2,'subiendo',$3) RETURNING id`, [original.replace(/\.[^.]+$/, ''), original, uid]);
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

  // Portada por nombre (para juegos guardados solo en el celular): búsqueda inteligente + caché en el VPS
  if (ruta === '/api/portada' && req.method === 'GET') {
    const nombre = String(url.searchParams.get('nombre') || '').slice(0, 200), consola = String(url.searchParams.get('consola') || '').slice(0, 20);
    if (!nombre || !consola) return json(res, 400, { error: 'Falta nombre o consola' });
    const clave = crypto.createHash('sha1').update(consola + '|' + nombre.toLowerCase()).digest('hex');
    const f = path.join(DIR.portadas, 'nombre', clave + '.png'), nada = f + '.no';
    if (!fs.existsSync(f)) {
      if (fs.existsSync(nada) && Date.now() - fs.statSync(nada).mtimeMs < 7 * 864e5) return json(res, 404, { error: 'Sin portada' });
      const ok = await buscarPortada(nombre, consola, f).catch(() => false);
      if (!ok) { fs.mkdirSync(path.dirname(nada), { recursive: true }); fs.writeFileSync(nada, ''); return json(res, 404, { error: 'Sin portada' }); }
    }
    res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': fs.statSync(f).size, 'Cache-Control': 'private, max-age=2592000' });
    return fs.createReadStream(f).pipe(res);
  }

  // ----- Partidas en la nube (por usuario) -----
  if (ruta === '/api/partida') {
    const clave = String(url.searchParams.get('clave') || '').slice(0, 300);
    if (!clave) return json(res, 400, { error: 'Falta la clave de la partida' });
    const nombreArch = crypto.createHash('sha1').update(clave).digest('hex') + '.state';
    const carpeta = path.join(DIR.partidas, String(uid)), archivo = path.join(carpeta, nombreArch);
    if (req.method === 'GET') {
      const { rows } = await db.query(`SELECT tiempo FROM partidas WHERE usuario_id=$1 AND clave=$2`, [uid, clave]);
      if (!rows[0] || !fs.existsSync(archivo)) return json(res, 404, { error: 'Sin partida guardada' });
      const desde = +url.searchParams.get('desde') || 0;
      if (desde && +rows[0].tiempo <= desde) { res.writeHead(204, { 'X-Tiempo': String(rows[0].tiempo) }); return res.end(); }  // la del dispositivo es igual o más nueva
      res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': fs.statSync(archivo).size, 'X-Tiempo': String(rows[0].tiempo), 'Cache-Control': 'no-store' });
      return fs.createReadStream(archivo).pipe(res);
    }
    if (req.method === 'PUT') {
      const tiempo = +url.searchParams.get('tiempo') || Date.now();
      const { rows } = await db.query(`SELECT tiempo FROM partidas WHERE usuario_id=$1 AND clave=$2`, [uid, clave]);
      if (rows[0] && +rows[0].tiempo > tiempo) return json(res, 409, { error: 'El servidor tiene una partida más reciente', tiempo: +rows[0].tiempo });
      const datos = await leerBinario(req, MAX_PARTIDA);
      if (!datos.length) return json(res, 400, { error: 'Partida vacía' });
      fs.mkdirSync(carpeta, { recursive: true });
      fs.writeFileSync(archivo + '.tmp', datos); fs.renameSync(archivo + '.tmp', archivo);
      await db.query(`INSERT INTO partidas (usuario_id, clave, juego, archivo, tamano, tiempo) VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (usuario_id, clave) DO UPDATE SET archivo=EXCLUDED.archivo, tamano=EXCLUDED.tamano, tiempo=EXCLUDED.tiempo, juego=EXCLUDED.juego`,
        [uid, clave, clave.split(':').slice(1).join(':'), nombreArch, datos.length, tiempo]);
      return json(res, 200, { ok: true, tiempo });
    }
    if (req.method === 'DELETE') {
      fs.rmSync(archivo, { force: true });
      await db.query(`DELETE FROM partidas WHERE usuario_id=$1 AND clave=$2`, [uid, clave]);
      return json(res, 200, { ok: true });
    }
  }

  let m;
  if ((m = ruta.match(/^\/api\/juegos\/(\d+)\/portada$/)) && req.method === 'GET') {
    const { rows } = await db.query(`SELECT id FROM juegos WHERE id=$1 AND usuario_id=$2`, [+m[1], uid]);
    const f = path.join(DIR.portadas, (+m[1]) + '.png');
    if (!rows[0] || !fs.existsSync(f)) return json(res, 404, { error: 'Sin portada' });
    res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': fs.statSync(f).size, 'Cache-Control': 'private, max-age=2592000' });
    return fs.createReadStream(f).pipe(res);
  }
  if ((m = ruta.match(/^\/api\/juegos\/(\d+)\/archivo$/)) && req.method === 'GET') {
    const { rows } = await db.query(`SELECT * FROM juegos WHERE id=$1 AND usuario_id=$2 AND estado='listo'`, [+m[1], uid]);
    const j = rows[0]; if (!j) return json(res, 404, { error: 'No existe o aún se está preparando' });
    return enviarArchivo(req, res, path.join(DIR.juegos, j.archivo), j.nombre + path.extname(j.archivo));
  }
  if ((m = ruta.match(/^\/api\/juegos\/(\d+)$/)) && req.method === 'DELETE') {
    const { rows } = await db.query(`DELETE FROM juegos WHERE id=$1 AND usuario_id=$2 RETURNING archivo, original`, [+m[1], uid]);
    if (rows[0]?.archivo) fs.rmSync(path.join(DIR.juegos, rows[0].archivo), { force: true });
    if (rows[0]) { fs.rmSync(path.join(DIR.entrada, m[1] + '-' + rows[0].original), { force: true }); fs.rmSync(path.join(DIR.portadas, m[1] + '.png'), { force: true }); }
    return json(res, 200, { ok: true });
  }
  if ((m = ruta.match(/^\/api\/juegos\/(\d+)\/reintentar$/)) && req.method === 'POST') {
    await db.query(`UPDATE juegos SET estado='en cola', mensaje=NULL WHERE id=$1 AND usuario_id=$2 AND estado='error'`, [+m[1], uid]);
    siguiente(); return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: 'No encontrado' });
}

const server = http.createServer((req, res) => manejar(req, res).catch(e => { console.error(e); if (!res.headersSent) json(res, 500, { error: 'Error interno' }); else res.end(); }));
server.requestTimeout = 0;          // las subidas grandes pueden tardar
server.headersTimeout = 60e3;
prepararBD().then(() => {
  server.listen(PUERTO, '127.0.0.1', () => console.log(`Servidor de juegos en http://127.0.0.1:${PUERTO} (configurado: ${!!SECRETO})`));
  siguiente(); setInterval(siguiente, 30000);          // también recoge juegos importados por la herramienta
  completarPortadas().catch(() => {});
}).catch(e => { console.error('No se pudo preparar la base de datos:', e.message); process.exit(1); });
