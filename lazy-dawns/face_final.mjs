// Rostro FINAL de Lazy (versión aprobada: mandíbula B con puntita del mentón redondeada T4, sin pómulos marcados, sin líneas de sonrisa,
// sin marcas en el mentón, sonrisa un poco más grande, pestañas gatita postizas).
import { JAW, NECK } from './rig2d/character.mjs';
import { NOSMILE, LASHX, EYEX, MOUTHX } from './rig.mjs';
export function applyFinalFace(lashes = true) {
  JAW.style = 'T4'; NECK.dy = 12; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = true; JAW.noChin = true; JAW.mouthK = 1.14; JAW.mouthUp = 0;
  Object.assign(EYEX, { corner: 1, sx: 1.1, sy: 0.86, irK: 1.4, irX: 1.04, prK: 0.68, dx: 5, dy: 0, tilt: -2, tex: 1, anime: 1, thick: 8, pal: null });
  MOUTHX.k = 1.08; MOUTHX.dy = -5;
  NOSMILE.on = true; if (lashes) LASHX.style = 'P3'; }

export function resetFace() { MOUTHX.k = 1; MOUTHX.dy = 0; Object.assign(EYEX, { corner: 0, sx: 1, sy: 1, irK: 1, irX: 1, prK: 1, dx: 0, dy: 0, tilt: 0, tex: 0, anime: 0, thick: null, pal: null }); JAW.style = null; JAW.noLines = false; JAW.noChin = false; JAW.mouthK = 1; JAW.mouthUp = 0; JAW.w = 1; JAW.cheek = 0; JAW.light = 0; JAW.d = 0; NECK.dy = 0; NOSMILE.on = false; }
