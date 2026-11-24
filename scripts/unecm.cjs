// Convierte un .ecm en .bin + .cue (para juegos de PlayStation en Jessito Emu).
// Uso: node scripts/unecm.js "juego.bin.ecm" [carpeta_salida]
const fs = require('fs'), path = require('path');
const { decode } = require(process.env.ECM_LIB || '../emulador/ecm.js');
(async () => {
  const src = process.argv[2]; if (!src) { console.log('Uso: node scripts/unecm.js juego.bin.ecm [salida]'); process.exit(1); }
  const outDir = process.argv[3] || path.dirname(src);
  const base = path.basename(src).replace(/\.ecm$/i, '').replace(/\.bin$/i, '');
  const blob = await fs.openAsBlob(src);
  const t = Date.now();
  const parts = await decode(blob, p => process.stdout.write(`\r${Math.round(p * 100)}%   `));
  const bin = path.join(outDir, base + '.bin');
  const fd = fs.openSync(bin, 'w'); for (const p of parts) fs.writeSync(fd, p); fs.closeSync(fd);
  fs.writeFileSync(path.join(outDir, base + '.cue'), `FILE "${base}.bin" BINARY\r\n  TRACK 01 MODE2/2352\r\n    INDEX 01 00:00:00\r\n`);
  console.log(`\nListo en ${((Date.now() - t) / 1000).toFixed(0)}s: ${bin} (${fs.statSync(bin).size} bytes)`);
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
