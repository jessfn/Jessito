// Portadas de los juegos, desde las miniaturas públicas de libretro (las mismas que usa RetroArch).
// Se descargan una vez y se guardan en el VPS; el celular las pide al servidor, no a GitHub.
const fs = require('fs'), path = require('path');

const REPO = {
  nes: 'Nintendo_-_Nintendo_Entertainment_System', snes: 'Nintendo_-_Super_Nintendo_Entertainment_System',
  gba: 'Nintendo_-_Game_Boy_Advance', gb: ['Nintendo_-_Game_Boy', 'Nintendo_-_Game_Boy_Color'],
  n64: 'Nintendo_-_Nintendo_64', nds: 'Nintendo_-_Nintendo_DS', psx: 'Sony_-_PlayStation',
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

async function buscarPortada(nombre, consola, destino) {
  const repos = [].concat(REPO[consola] || []);
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
