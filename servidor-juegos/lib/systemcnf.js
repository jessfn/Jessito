// Lee SYSTEM.CNF de un disco de PlayStation (.bin crudo de 2352 bytes/sector o .iso de 2048) navegando
// el directorio ISO 9660. "BOOT2" = PlayStation 2, "BOOT" = PlayStation 1. Es la forma segura de distinguirlos.
const fs = require('fs');

function leerSystemCnf(ruta) {
  const fd = fs.openSync(ruta, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    // Detectar formato: ISO (2048) o crudo (2352, con 24 bytes de cabecera en Mode 2 / 16 en Mode 1)
    const probe = Buffer.alloc(2352 * 17); fs.readSync(fd, probe, 0, probe.length, 0);
    let sec = 2048, off = 0;
    if (probe.toString('latin1', 0x8001, 0x8006) === 'CD001') { sec = 2048; off = 0; }
    else if (probe.toString('latin1', 16 * 2352 + 24 + 1, 16 * 2352 + 24 + 6) === 'CD001') { sec = 2352; off = 24; }
    else if (probe.toString('latin1', 16 * 2352 + 16 + 1, 16 * 2352 + 16 + 6) === 'CD001') { sec = 2352; off = 16; }
    else return null;
    const leer = (lba, bytes) => {   // lee datos de usuario a partir de un sector lógico
      const out = Buffer.alloc(bytes); let hecho = 0;
      while (hecho < bytes) { const n = Math.min(2048, bytes - hecho); const pos = lba * sec + off;
        if (pos + n > size) break; fs.readSync(fd, out, hecho, n, pos); hecho += n; lba++; }
      return out.subarray(0, hecho);
    };
    const pvd = leer(16, 2048);
    const raizLba = pvd.readUInt32LE(156 + 2), raizTam = pvd.readUInt32LE(156 + 10);
    const dir = leer(raizLba, Math.min(raizTam, 64 * 2048));
    for (let i = 0; i < dir.length;) {
      const len = dir[i]; if (!len) { i = (Math.floor(i / 2048) + 1) * 2048; continue; }
      const nlen = dir[i + 32], nombre = dir.toString('latin1', i + 33, i + 33 + nlen).toUpperCase();
      if (nombre.startsWith('SYSTEM.CNF')) {
        const lba = dir.readUInt32LE(i + 2), tam = Math.min(dir.readUInt32LE(i + 10), 4096);
        return leer(lba, tam).toString('latin1');
      }
      i += len;
    }
    return null;
  } catch (e) { return null; } finally { fs.closeSync(fd); }
}

// 'ps2' | 'psx' | null
function consolaPorSystemCnf(ruta) {
  const t = leerSystemCnf(ruta); if (!t) return null;
  if (/BOOT2\s*=/i.test(t)) return 'ps2';
  if (/BOOT\s*=/i.test(t)) return 'psx';
  return null;
}

module.exports = { leerSystemCnf, consolaPorSystemCnf };
