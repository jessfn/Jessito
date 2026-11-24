// Decodificador ECM -> BIN (formato "Error Code Modeler" de Neill Corlett).
// Reconstruye las sectores de CD (sync, EDC y ECC) que el formato ECM elimina.
// Funciona en el navegador (Web Worker) y en Node. Lee la entrada por partes para no gastar memoria.
(function (root) {
  const F = new Uint8Array(256), B = new Uint8Array(256), E = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    const j = ((i << 1) ^ (i & 0x80 ? 0x11D : 0)) & 0xFF;
    F[i] = j; B[i ^ j] = i;
    let e = i; for (let k = 0; k < 8; k++) e = (e >>> 1) ^ (e & 1 ? 0xD8018001 : 0);
    E[i] = e >>> 0;
  }
  function edc(s, from, len) { let e = 0; for (let i = from; i < from + len; i++) e = (e >>> 8) ^ E[(e ^ s[i]) & 0xFF]; return e >>> 0; }
  function putLE(s, at, v) { s[at] = v & 255; s[at + 1] = (v >>> 8) & 255; s[at + 2] = (v >>> 16) & 255; s[at + 3] = (v >>> 24) & 255; }
  function eccBlock(s, src, majC, minC, majM, minI, dst) {
    const size = majC * minC;
    for (let maj = 0; maj < majC; maj++) {
      let idx = (maj >> 1) * majM + (maj & 1), a = 0, b = 0;
      for (let min = 0; min < minC; min++) {
        const t = s[src + idx]; idx += minI; if (idx >= size) idx -= size;
        a ^= t; b ^= t; a = F[a];
      }
      a = B[F[a] ^ b];
      s[dst + maj] = a; s[dst + maj + majC] = a ^ b;
    }
  }
  function ecc(s, zeroAddr) {
    const h = s.slice(12, 16); if (zeroAddr) s.fill(0, 12, 16);
    eccBlock(s, 0xC, 86, 24, 2, 86, 0x81C);
    eccBlock(s, 0xC, 52, 43, 86, 88, 0x81C + 0xAC);
    if (zeroAddr) s.set(h, 12);
  }
  // Lector por partes sobre un Blob/File
  function reader(blob) {
    let pos = 0, buf = new Uint8Array(0), off = 0; const CH = 8 << 20;
    return {
      get done() { return off >= buf.length && pos >= blob.size; },
      async need(n) {
        if (buf.length - off >= n) return;
        const rest = buf.subarray(off), add = new Uint8Array(await blob.slice(pos, pos + Math.max(CH, n)).arrayBuffer());
        pos += add.length; const nb = new Uint8Array(rest.length + add.length); nb.set(rest); nb.set(add, rest.length); buf = nb; off = 0;
        if (buf.length < n) throw new Error('ECM truncado');
      },
      byte() { return buf[off++]; },
      take(n) { const r = buf.subarray(off, off + n); off += n; return r; },
    };
  }
  // Devuelve un array de partes Uint8Array (unirlas con new Blob(partes)). onProgress(0..1)
  async function decode(blob, onProgress) {
    const r = reader(blob);
    await r.need(4);
    const m = r.take(4); if (m[0] !== 0x45 || m[1] !== 0x43 || m[2] !== 0x4D || m[3] !== 0) throw new Error('No es un archivo ECM');
    const parts = []; let out = new Uint8Array(16 << 20), o = 0, total = 0, lastP = 0;
    const flush = () => { if (o) { parts.push(out.slice(0, o)); total += o; o = 0; } };
    const write = (src, from, len) => { if (o + len > out.length) flush(); out.set(src.subarray(from, from + len), o); o += len; };
    const s = new Uint8Array(2352);
    for (;;) {
      await r.need(1); let c = r.byte(), type = c & 3, num = (c >> 2) & 0x1F, bits = 5;
      while (c & 0x80) { await r.need(1); c = r.byte(); num += (c & 0x7F) * Math.pow(2, bits); bits += 7; }
      if (num === 0xFFFFFFFF) break;
      num += 1;
      if (type === 0) {
        while (num > 0) { const n = Math.min(num, 1 << 20); await r.need(n); const d = r.take(n); write(d, 0, n); num -= n; }
      } else {
        for (let k = 0; k < num; k++) {
          if (type === 1) {
            s.fill(0); s[0] = 0; s.fill(0xFF, 1, 11); s[11] = 0;
            await r.need(3 + 0x800); s.set(r.take(3), 12); s[15] = 1; s.set(r.take(0x800), 16);
            putLE(s, 0x810, edc(s, 0, 0x810)); s.fill(0, 0x814, 0x81C); ecc(s, false);
            write(s, 0, 2352);
          } else if (type === 2) {
            s.fill(0); await r.need(0x804); s.set(r.take(0x804), 0x14); s.copyWithin(0x10, 0x14, 0x18);
            putLE(s, 0x818, edc(s, 0x10, 0x808)); ecc(s, true);
            write(s, 0x10, 2336);
          } else {
            s.fill(0); await r.need(0x918); s.set(r.take(0x918), 0x14); s.copyWithin(0x10, 0x14, 0x18);
            putLE(s, 0x92C, edc(s, 0x10, 0x91C));
            write(s, 0x10, 2336);
          }
        }
      }
      if (onProgress && total + o - lastP > (8 << 20)) { lastP = total + o; onProgress(Math.min(.99, lastP / (blob.size * 1.1))); }
    }
    flush();
    return parts;
  }
  const api = { decode };
  if (typeof module !== 'undefined') module.exports = api; else root.ECM = api;
  // Modo Web Worker: postMessage({file}) -> {progress} ... {blob}
  if (typeof WorkerGlobalScope !== 'undefined' && root instanceof WorkerGlobalScope) {
    root.onmessage = async e => {
      try { const parts = await decode(e.data.file, p => root.postMessage({ progress: p })); root.postMessage({ blob: new Blob(parts) }); }
      catch (err) { root.postMessage({ error: err.message }); }
    };
  }
})(typeof self !== 'undefined' ? self : globalThis);
