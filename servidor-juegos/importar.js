// Importa juegos (ya copiados al VPS) a la biblioteca de un usuario, sin necesitar su contraseña.
// Uso en el VPS:  sudo -u gamesdata node importar.js <correo-del-usuario> <archivo> [archivo...]
// (los archivos deben poder leerse por el usuario gamesdata, p.ej. copiados a /tmp)
// El servicio los procesa solo (descomprimir, .ecm, .chd, consola y portada) en menos de 30 s.
const fs = require('fs'), path = require('path');
const { Pool } = require('pg');
(async () => {
  const [correo, ...archivos] = process.argv.slice(2);
  if (!correo || !archivos.length) { console.log('Uso: node importar.js <correo> <archivo> [archivo...]'); process.exit(1); }
  const db = new Pool({ host: '/var/run/postgresql', database: 'gamesdata', user: 'gamesdata' });
  const { rows } = await db.query(`SELECT id, nombre FROM usuarios WHERE correo=$1`, [correo.toLowerCase()]);
  if (!rows[0]) { console.log('No existe una cuenta con el correo ' + correo); process.exit(1); }
  const uid = rows[0].id, entrada = '/var/lib/gamesdata/entrada';
  for (const a of archivos) {
    if (!fs.existsSync(a)) { console.log('No existe: ' + a); continue; }
    const original = path.basename(a).replace(/[^\w .()\[\]+,&'-]/g, '_').slice(0, 180);
    const r = await db.query(`INSERT INTO juegos (nombre, original, estado, usuario_id, tamano) VALUES ($1,$2,'subiendo',$3,$4) RETURNING id`,
      [original.replace(/\.[^.]+$/, ''), original, uid, fs.statSync(a).size]);
    const id = r.rows[0].id, destino = path.join(entrada, id + '-' + original);
    fs.copyFileSync(a, destino);
    await db.query(`UPDATE juegos SET estado='en cola' WHERE id=$1`, [id]);
    console.log(`#${id} ${original} → en cola para ${rows[0].nombre}`);
  }
  await db.end();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
