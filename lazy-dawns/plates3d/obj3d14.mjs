// Renderiza secuencias PNG (fondo transparente) de objetos 3D: node obj3d.mjs <nombre> <frames>
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/')('playwright');
import { spawn } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { mkdirSync } from 'node:fs';
const here = path.dirname(fileURLToPath(import.meta.url)); const [name, nStr] = [process.argv[2], process.argv[3] || '30']; const n = parseInt(nStr);
const outName = process.argv[7] || name; mkdirSync(path.join(here, 'obj', outName), { recursive: true });
const port = 8770 + Math.floor(Math.random() * 100);
const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: here, stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 1000));
const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const dims = (name === 'title' || name === 'title8') ? { width: 1080, height: 460 } : (name === 'cover' ? { width: 1080, height: 820 } : { width: 800, height: 800 });
const pg = await br.newPage({ viewport: dims });
pg.on('pageerror', (e) => console.log('pageerror', e.message)); pg.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
await pg.goto(`http://localhost:${port}/objects14.html?o=${name}&d=${process.argv[4] || 3}&t1=${encodeURIComponent(process.argv[5] || '')}&t2=${encodeURIComponent(process.argv[6] || '')}&s=${encodeURIComponent(process.argv[8] || '')}`); await pg.waitForFunction('window.__done === true', null, { timeout: 120000 });
for (let i = 0; i < n; i++) { await pg.evaluate((u) => window.setFrame(u), n === 1 ? 0.5 : i / (n - 1)); await pg.locator('#c').screenshot({ path: path.join(here, 'obj', outName, `f${String(i).padStart(3, '0')}.png`), omitBackground: true }); }
await br.close(); srv.kill(); console.log('ok', name, n);
