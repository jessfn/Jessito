// Genera tu ENLACE DE VINCULACIÓN: ábrelo una vez en cada dispositivo y queda autorizado para siempre,
// sin contraseña. Trátalo como una llave: quien lo tenga puede ver y descargar tu biblioteca.
// Uso en el VPS:  node /opt/jessito/servidor-juegos/vincular.js
const fs = require('fs'), crypto = require('crypto');
const ENV = process.env.ENV_FILE || '/etc/gamesdata.env';
const APP = process.env.APP_URL || 'https://jessfn.github.io/Jessito/';
let env = fs.existsSync(ENV) ? fs.readFileSync(ENV, 'utf8') : '';
let secreto = (env.match(/^TOKEN_SECRET=(.+)$/m) || [])[1];
if (!secreto) {
  secreto = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(ENV, env.replace(/\n?$/, '\n') + 'TOKEN_SECRET=' + secreto + '\n', { mode: 0o640 });
  try { require('child_process').execSync('systemctl restart gamesdata'); } catch (e) {}
}
const exp = Date.now() + 3650 * 864e5; // ~10 años
const token = exp + '.' + crypto.createHmac('sha256', secreto).update(String(exp)).digest('base64url');
console.log('\nTu enlace de vinculación (ábrelo una vez en cada dispositivo):\n\n  ' + APP + '#vincular=' + token + '\n');
console.log('Para invalidar TODOS los enlaces y dispositivos: borra la línea TOKEN_SECRET de ' + ENV + ' y vuelve a correr este script.\n');
