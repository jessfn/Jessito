// Rostro FINAL de Lazy (versión aprobada: mandíbula B con puntita del mentón redondeada T4, sin pómulos marcados, sin líneas de sonrisa,
// sin marcas en el mentón, sonrisa un poco más grande, pestañas gatita postizas).
import { JAW, NECK } from './rig2d/character.mjs';
import { NOSMILE, LASHX } from './rig.mjs';
export function applyFinalFace(lashes = true) {
  JAW.style = 'T4'; NECK.dy = 14; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = true; JAW.noChin = true; JAW.mouthK = 1.14; JAW.mouthUp = 0;
  NOSMILE.on = true; if (lashes) LASHX.style = 'P3'; }
