// Portadas de los juegos, desde las miniaturas públicas de libretro (las mismas que usa RetroArch).
// Se descargan una vez y se guardan en el VPS; el celular las pide al servidor, no a GitHub.
const fs = require('fs'), path = require('path');

const REPO = {
  nes: 'Nintendo_-_Nintendo_Entertainment_System', snes: 'Nintendo_-_Super_Nintendo_Entertainment_System',
  gba: 'Nintendo_-_Game_Boy_Advance', gb: ['Nintendo_-_Game_Boy', 'Nintendo_-_Game_Boy_Color'],
  n64: 'Nintendo_-_Nintendo_64', nds: 'Nintendo_-_Nintendo_DS', psx: 'Sony_-_PlayStation', ps2: 'Sony_-_PlayStation_2',
  segaMD: 'Sega_-_Mega_Drive_-_Genesis', segaMS: 'Sega_-_Master_System_-_Mark_III', segaGG: 'Sega_-_Game_Gear',
  pce: 'NEC_-_PC_Engine_-_TurboGrafx_16', atari2600: 'Atari_-_2600',
};
// libretro reemplaza estos caracteres por "_" en los nombres de archivo
const limpiar = n => n.replace(/[&*\/:`<>?\\|"]/g, '_').trim();

function candidatos(nombre) {
  const base = limpiar(nombre);
  const sinEtiquetas = base.replace(/\s*[\[(][^\])]*[\])]/g, '').trim();
  const lista = [base];
  if (sinEtiquetas !== base) lista.push(sinEtiquetas + ' (USA)', sinEtiquetas + ' (World)', sinEtiquetas + ' (Europe)', sinEtiquetas + ' (USA, Europe)', sinEtiquetas);
  else lista.push(base + ' (USA)', base + ' (World)', base + ' (Europe)', base + ' (USA, Europe)', base + ' (Japan, USA)');
  return [...new Set(lista)];
}

// ===== Búsqueda inteligente: índice de portadas por consola (se descarga una vez y se guarda una semana) =====
const DIR_IDX = path.join(process.env.DATA_DIR || '/var/lib/gamesdata', 'indices');
const memIdx = new Map();
async function indice(repo) {
  if (memIdx.has(repo)) return memIdx.get(repo);
  const f = path.join(DIR_IDX, repo + '.json');
  try { const st = fs.statSync(f); if (Date.now() - st.mtimeMs < 7 * 864e5) { const l = JSON.parse(fs.readFileSync(f, 'utf8')); memIdx.set(repo, l); return l; } } catch (e) {}
  try {
    const r = await fetch(`https://api.github.com/repos/libretro-thumbnails/${repo}/git/trees/master?recursive=1`,
      { headers: { 'User-Agent': 'jessito-emu', Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error('GitHub ' + r.status);
    const lista = (await r.json()).tree.filter(t => t.path.startsWith('Named_Boxarts/') && t.path.endsWith('.png')).map(t => t.path.slice(14, -4));
    fs.mkdirSync(DIR_IDX, { recursive: true }); fs.writeFileSync(f, JSON.stringify(lista));
    memIdx.set(repo, lista); return lista;
  } catch (e) {
    try { const l = JSON.parse(fs.readFileSync(f, 'utf8')); memIdx.set(repo, l); return l; } catch (_) { return []; }   // índice viejo mejor que nada
  }
}
// Normaliza para comparar: sin región/versión, sin símbolos, minúsculas
const norm = s => s.toLowerCase().replace(/\s*[\[(][^\])]*[\])]/g, '').replace(/^the\s+|,\s*the\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const PREF = n => /\(USA/.test(n) ? 0 : /\(World/.test(n) ? 1 : /\(Europe/.test(n) ? 2 : 3;   // preferencia de región
async function mejorNombre(nombre, consola) {
  const objetivo = norm(nombre); if (!objetivo) return null;
  let mejor = null;
  for (const repo of [].concat(REPO[consola] || [])) {
    for (const n of await indice(repo)) {
      const k = norm(n);
      // exacto (ignorando región/versión) gana; si no, que uno empiece con el otro (p.ej. subtítulos)
      const puntos = k === objetivo ? 100 : (k.startsWith(objetivo + ' ') || objetivo.startsWith(k + ' ')) ? 50 - Math.abs(k.length - objetivo.length) / 10 : 0;
      if (!puntos) continue;
      const score = puntos * 10 - PREF(n) - (/\((Beta|Proto|Demo|Sample|Pirate)/i.test(n) ? 5 : 0);
      if (!mejor || score > mejor.score) mejor = { repo, n, score };
    }
  }
  return mejor;
}

async function descargar(url, destino) {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!r.ok || !(r.headers.get('content-type') || '').includes('image')) return false;
  const buf = Buffer.from(await r.arrayBuffer()); if (buf.length < 500) return false;
  fs.mkdirSync(path.dirname(destino), { recursive: true }); fs.writeFileSync(destino, buf); return true;
}

async function buscarPortada(nombre, consola, destino) {
  const repos = [].concat(REPO[consola] || []);
  // 1) Búsqueda inteligente en el índice (encuentra "Tetris" → "Tetris (World) (Rev 1)")
  try {
    const m = await mejorNombre(nombre, consola);
    if (m && await descargar(`https://raw.githubusercontent.com/libretro-thumbnails/${m.repo}/master/Named_Boxarts/${encodeURIComponent(m.n)}.png`, destino)) return true;
  } catch (e) {}
  // 2) Variantes directas del nombre (por si GitHub no dio el índice)
  for (const repo of repos) for (const n of candidatos(nombre)) {
    const url = `https://raw.githubusercontent.com/libretro-thumbnails/${repo}/master/Named_Boxarts/${encodeURIComponent(n)}.png`;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!r.ok || !(r.headers.get('content-type') || '').includes('image')) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 500) continue;
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, buf);
      return true;
    } catch (e) { /* sin internet o tiempo agotado: se intenta el siguiente */ }
  }
  return false;
}

module.exports = { buscarPortada };
