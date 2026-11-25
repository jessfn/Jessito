// Rostro FINAL de Lazy (versión aprobada: mandíbula B con puntita del mentón redondeada T4, sin pómulos marcados, sin líneas de sonrisa,
// sin marcas en el mentón, sonrisa un poco más grande, pestañas gatita postizas).
import { JAW, NECK } from './rig2d/character.mjs';
import { NOSMILE, LASHX, EYEX, MOUTHX } from './rig.mjs';
export function applyFinalFace(lashes = true) {
  JAW.style = 'T4'; NECK.dy = 12; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = true; JAW.noChin = true; JAW.mouthK = 1.14; JAW.mouthUp = 0;
  Object.assign(EYEX, { corner: 1, sx: 1.0, sy: 0.8, irK: 1.12, irX: 1.04, prK: 0.58, dx: 3, dy: 0, tilt: -2, tex: 1, anime: 1, thick: 6, pal: ['#0e0805', '#2a170c', '#5a3a22', '#8a6040'] });
  MOUTHX.k = 1.08; MOUTHX.dy = 4;
  NOSMILE.on = true; if (lashes) LASHX.style = 'P3'; }

export function resetFace() { MOUTHX.k = 1; MOUTHX.dy = 0; Object.assign(EYEX, { corner: 0, sx: 1, sy: 1, irK: 1, irX: 1, prK: 1, dx: 0, dy: 0, tilt: 0, tex: 0, anime: 0, thick: null, pal: null }); JAW.style = null; JAW.noLines = false; JAW.noChin = false; JAW.mouthK = 1; JAW.mouthUp = 0; JAW.w = 1; JAW.cheek = 0; JAW.light = 0; JAW.d = 0; NECK.dy = 0; NOSMILE.on = false; }

// Rostro con el que TERMINO el dia 16 (mandibula T4 sin lineas, ojos y boca anteriores). Es el rostro de Lazy al inicio del dia 17 hasta que le cambian los ojos.
export function applyDay16Face() { resetFace(); JAW.style = 'T4'; NECK.dy = 12; JAW.w = 0.95; JAW.cheek = 0; JAW.light = 0.5; JAW.d = 0.9; JAW.noLines = true; JAW.noChin = true; JAW.mouthK = 1.14; JAW.mouthUp = 0; NOSMILE.on = true; LASHX.style = 'P3'; }

// ROSTRO DIA 18 (aprobado): maquillaje A (sombra vino/ciruela con brillos, rubor terracota diagonal, labios rojo oscuro), cejas D difuminadas,
// brillos al lado de los ojos, cara mate, ojos mas chicos, cuello -10 (dy 22) y nariz +8.
import { LOOK, MK, FACEK } from './rig2d/character.mjs';
import { LIPX, BROWX, NOSEDY } from './rig.mjs';
export function applyDay18Face() {
  applyFinalFace(); Object.assign(EYEX, { sx: 0.85, sy: 0.68, irK: 0.95, prK: 0.49 });
  Object.assign(LOOK, { blush: 0, contour: 0.35, highlight: 0.25, shadow: 1, liner: 0.9, wing: 0.9, thick: 4, tex: 1, cols: { blush: '#c06048', contour: '#5a2038', shadow: ['#4a0f3a', '#8a2a6a', '#e0b0d8'], inner: '#f8e8f4', hl: '#fff0f4', liner: '#1a0612' } });
  MK.lipColor = '#9c0f1c'; LIPX.tex = 1; LIPX.shimmer = 1; LIPX.gloss = 0.5;
  Object.assign(EYEX, { glit: 1, glitCol: ['#f0d8f0', '#ffffff', '#d070c0'], blushCol: '#c06048', shK: 1, drape: 1, blushK: 1.1, shH: 1.4, side: 1, sideCol: ['#ffffff', '#e8b0e0', '#b050a0'] });
  BROWX.style = 'ombre'; JAW.light = 0.25; JAW.d = 0.3; FACEK.hi = 0.35; FACEK.glow = 0.4; NECK.dy = 22; NOSEDY.dy = 8; }
