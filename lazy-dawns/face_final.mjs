// Rostro FINAL de Lazy (versión aprobada: mandíbula B con puntita del mentón redondeada T4, sin pómulos marcados, sin líneas de sonrisa,
// sin marcas en el mentón, sonrisa un poco más grande, pestañas gatita postizas).
import { JAW, NECK } from './rig2d/character.mjs';
import { NOSMILE, LASHX } from './rig.mjs';
export function applyFinalFace(lashes = true) {
  JAW.style = 'T4'; NECK.dy = 12; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = true; JAW.noChin = true; JAW.mouthK = 1.14; JAW.mouthUp = 0;
  NOSMILE.on = true; if (lashes) LASHX.style = 'P3'; }

export function resetFace() { JAW.style = null; JAW.noLines = false; JAW.noChin = false; JAW.mouthK = 1; JAW.mouthUp = 0; JAW.w = 1; JAW.cheek = 0; JAW.light = 0; JAW.d = 0; NECK.dy = 0; NOSMILE.on = false; }
