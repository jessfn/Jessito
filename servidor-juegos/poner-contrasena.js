// Pone (o cambia) la contraseña de tu biblioteca. Se guarda SOLO una huella (scrypt), nunca la contraseña.
// Uso en el VPS:  node /opt/jessito/servidor-juegos/poner-contrasena.js
const fs = require('fs'), crypto = require('crypto'), readline = require('readline');
const ENV = process.env.ENV_FILE || '/etc/gamesdata.env';

function preguntarOculto(texto) {
  return new Promise(ok => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = s => { if (s.includes(texto)) rl.output.write(s); else rl.output.write('*'.repeat(s.length ? 1 : 0)); };
    rl.question(texto, r => { rl.close(); process.stdout.write('\n'); ok(r); });
  });
}

(async () => {
  const a = await preguntarOculto('Nueva contraseña de tu biblioteca: ');
  if (a.length < 8) { console.log('Debe tener al menos 8 caracteres. No se cambió nada.'); process.exit(1); }
  const b = await preguntarOculto('Repítela: ');
  if (a !== b) { console.log('No coinciden. No se cambió nada.'); process.exit(1); }
  const sal = crypto.randomBytes(16);
  const hash = crypto.scryptSync(a, sal, 64);
  const linea = 'PASSWORD_HASH=scrypt:' + sal.toString('hex') + ':' + hash.toString('hex');
  let env = fs.existsSync(ENV) ? fs.readFileSync(ENV, 'utf8') : '';
  env = /^PASSWORD_HASH=.*$/m.test(env) ? env.replace(/^PASSWORD_HASH=.*$/m, linea) : env.replace(/\n?$/, '\n') + linea + '\n';
  if (!/^TOKEN_SECRET=.+$/m.test(env)) env += 'TOKEN_SECRET=' + crypto.randomBytes(32).toString('hex') + '\n';
  fs.writeFileSync(ENV, env, { mode: 0o640 });
  console.log('Listo. Contraseña guardada (solo su huella cifrada). Reiniciando el servicio...');
  try { require('child_process').execSync('systemctl restart gamesdata', { stdio: 'inherit' }); } catch (e) { console.log('Reinicia con: systemctl restart gamesdata'); }
})();
