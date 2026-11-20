// Renderiza una escena 3D de scenes14.html a PNG 1080x1920. Uso: node shot.mjs <escena> <salida.png>
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/')('playwright');
import { spawn, execSync } from 'node:child_process';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)); const [sc, out] = [process.argv[2], process.argv[3]];
const srv = spawn('python3', ['-m', 'http.server', '8788'], { cwd: here, stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 1200));
const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await br.newPage({ viewport: { width: 1296, height: 2304 } });
pg.on('pageerror', (e) => console.log('pageerror', e.message)); pg.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
await pg.goto(`http://localhost:8788/scenes14.html?s=${sc}`); await pg.waitForFunction('window.__done === true', null, { timeout: 120000 });
await pg.locator('#c').screenshot({ path: out + '.raw.png' }); await br.close(); srv.kill();
execSync(`ffmpeg -y -loglevel error -i ${out}.raw.png -vf scale=1080:1920 ${out}`); console.log('ok', out);
