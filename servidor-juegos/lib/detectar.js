// Detecta la consola de un juego por su firma interna (igual que la app), y si no, por extensión o nombre.
const fs = require('fs');

const POR_EXTENSION = {
  nes: 'nes', fds: 'nes', unf: 'nes', unif: 'nes',
  sfc: 'snes', smc: 'snes', fig: 'snes', swc: 'snes',
  gba: 'gba', gb: 'gb', gbc: 'gb',
  md: 'segaMD', gen: 'segaMD', smd: 'segaMD',
  sms: 'segaMS', gg: 'segaGG',
  n64: 'n64', z64: 'n64', v64: 'n64',
  pce: 'pce', a26: 'atari2600', nds: 'nds',
  cue: 'psx', chd: 'psx', pbp: 'psx', iso: 'psx', m3u: 'psx', ecm: 'psx',
};

function leerInicio(ruta, n = 0x10400) {
  const fd = fs.openSync(ruta, 'r');
  try { const b = Buffer.alloc(n); const leidos = fs.readSync(fd, b, 0, n, 0); return b.subarray(0, leidos); }
  finally { fs.closeSync(fd); }
}

function porFirma(d) {
  const at = (o, arr) => arr.every((v, i) => d[o + i] === v);
  const str = (o, s) => at(o, [...s].map(c => c.charCodeAt(0)));
  const LOGO = [0x24, 0xFF, 0xAE, 0x51, 0x69, 0x9A];
  if (str(0, 'NES\x1A') || str(0, 'FDS\x1A') || str(1, '*NINTENDO-HVC*')) return 'nes';
  if (at(0, [0x80, 0x37, 0x12, 0x40]) || at(0, [0x37, 0x80, 0x40, 0x12]) || at(0, [0x40, 0x12, 0x37, 0x80])) return 'n64';
  if (at(0xC0, LOGO) && d[0x15C] === 0x56 && d[0x15D] === 0xCF) return 'nds';
  if (at(4, LOGO) && d[0xB2] === 0x96) return 'gba';
  if (at(0x104, [0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D])) return 'gb';
  if (str(0, '\0PBP') || str(0, 'MComprHD')) return 'psx';
  if (str(0x8001, 'CD001') && str(0x8008, 'PLAYSTATION')) return 'psx';
  if (d.length >= 0x9340 && d.subarray(0x9318, 0x9340).toString('latin1').includes('PLAYSTATION')) return 'psx';
  if (str(0x100, 'SEGA') || str(0x101, 'SEGA') || (d[8] === 0xAA && d[9] === 0xBB)) return 'segaMD';
  for (const o of [0x7FF0, 0x3FF0, 0x1FF0]) if (str(o, 'TMR SEGA')) { const r = d[o + 15] >> 4; return (r >= 5 && r <= 7) ? 'segaGG' : 'segaMS'; }
  for (const base of [0x7FC0, 0xFFC0]) for (const off of [0, 512]) {
    const o = base + off; if (o + 0x20 > d.length) continue;
    const chk = d[o + 0x1E] | (d[o + 0x1F] << 8), cmp = d[o + 0x1C] | (d[o + 0x1D] << 8);
    if (chk !== 0 && ((chk ^ cmp) & 0xFFFF) === 0xFFFF) return 'snes';
  }
  return null;
}

function porNombre(nombre) {
  if (/\b(SLES|SLUS|SCUS|SCES|SLPS|SLPM|SCPS|SIPS)[-_ ]?\d/i.test(nombre) || /playstation|\bpsx\b|\bps1\b/i.test(nombre)) return 'psx';
  if (/\bsnes\b|super nintendo|super famicom/i.test(nombre)) return 'snes';
  if (/\bgba\b|game ?boy advance/i.test(nombre)) return 'gba';
  if (/\bgbc?\b|game ?boy/i.test(nombre)) return 'gb';
  if (/genesis|mega ?drive/i.test(nombre)) return 'segaMD';
  if (/\bn64\b|nintendo 64/i.test(nombre)) return 'n64';
  if (/\bnes\b|famicom/i.test(nombre)) return 'nes';
  return null;
}

// Devuelve la consola (nunca pregunta). Último recurso: por tamaño.
function detectar(ruta, nombre) {
  try { const f = porFirma(leerInicio(ruta)); if (f) return f; } catch (e) {}
  const ext = (nombre.split('.').pop() || '').toLowerCase();
  if (POR_EXTENSION[ext]) return POR_EXTENSION[ext];
  const n = porNombre(nombre); if (n) return n;
  const size = fs.statSync(ruta).size;
  if (ext === 'bin') return size > 32e6 ? 'psx' : 'segaMD';
  if (size <= 1.1e6) return 'nes'; if (size <= 6.5e6) return 'snes'; if (size <= 33e6) return 'gba'; if (size <= 65e6) return 'n64';
  return 'psx';
}

module.exports = { detectar, porFirma };
