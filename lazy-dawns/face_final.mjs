// Rostro FINAL de Lazy (versión aprobada: mandíbula B "Encanto" redondeada, sin pómulos marcados, sin líneas de sonrisa,
// sin marcas en el mentón, sonrisa un poco más grande, pestañas gatita postizas).
import { JAW } from './rig2d/character.mjs';
import { NOSMILE, LASHX } from './rig.mjs';
export function applyFinalFace(lashes = true) {
  JAW.style = 'R1'; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = true; JAW.noChin = true; JAW.mouthK = 1.14; JAW.mouthUp = 0;
  NOSMILE.on = true; if (lashes) LASHX.style = 'P3'; }
