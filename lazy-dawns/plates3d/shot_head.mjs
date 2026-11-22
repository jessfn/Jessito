import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/')('playwright');
import { spawn } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)); const [qs, out] = [process.argv[2], process.argv[3]]; const port = 8800 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: here, stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 900));
const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await br.newPage({ viewport: { width: 800, height: 1000 } }); pg.on('pageerror', (e) => console.log('pageerror', e.message)); pg.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
await pg.goto(`http://localhost:${port}/head3d.html?${qs}`); await pg.waitForFunction('window.__done === true', null, { timeout: 120000 }); await pg.locator('#c').screenshot({ path: out }); await br.close(); srv.kill(); console.log('ok', out);
