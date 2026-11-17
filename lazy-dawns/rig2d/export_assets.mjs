// Exporta piezas PNG transparentes (recortadas, con desplazamiento en el lienzo 1024x1536), SVG maestro, rig_map.json y hoja de piezas.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, mkdirSync } from 'node:fs'; import { execSync } from 'node:child_process';
import * as C from './character.mjs';
const P = C.defaultPose(); C.applyExpr(P, 'smile', 1); const OUTD = 'assets/piezas', ALT = 'assets/alt_cara_referencia'; mkdirSync(OUTD, { recursive: true }); mkdirSync(ALT, { recursive: true }); mkdirSync('assets/proyecto', { recursive: true });
const pieces = {};
const add = (id, svg, dir = OUTD) => { pieces[id] = { svg, dir }; };
const skin = 'url(#zSkin)', S = C.SK;
const limb = (a, b, w0, w1) => { const d = C.taperPath(a, b, w0, w1); return `<path d="${d}" fill="${C.OUT}" stroke="${C.OUT}" stroke-width="9" stroke-linejoin="round"/><path d="${d}" fill="${skin}"/>`; };
// cuerpo
add('cuello', C.part_neck(P)); add('torso_pecho', C.part_chest(P)); add('corse_rojo', C.part_corset(P)); add('abdomen', C.part_midriff(P)); add('collar_dije', C.part_necklace(P)); add('cintura_banda', C.part_waistband(P));
add('falda_base', C.part_skirt_back(P)); add('falda_interior_abertura', C.part_slit_inner(P)); add('falda_panel_izq', C.part_skirt_panel(P)); add('rosetón_flor', C.part_rosette(P));
for (let i = 0; i < 7; i++) add(`falda_olan_${i + 1}`, C.part_skirt_ruffle(P, i));
for (const s of ['L', 'R']) { const sh = S['shoulder' + s], el = S['elbow' + s], wr = S['wrist' + s];
  add(`brazo_superior_${s}`, limb(sh, el, 56, 44)); add(`antebrazo_${s}`, limb(el, wr, 44, 34));
  add(`pulsera_${s}`, `<g transform="translate(${wr[0]},${wr[1] - 10})"><ellipse rx="24" ry="8" fill="url(#zGold)" stroke="${C.OUT}" stroke-width="3.6"/></g>`);
  const hand = (only) => `<g transform="translate(${wr[0]},${wr[1] + 2})">${C.part_hand(s, P, 'o', only)}${C.part_hand(s, P, 'f', only)}</g>`;
  add(`mano_${s}_palma`, hand(['palm'])); for (const f of ['thumb', 'index', 'middle', 'ring', 'pinky']) add(`mano_${s}_dedo_${f}`, hand([f]));
  const hp = S['hip' + s], kn = S['knee' + s], an = S['ankle' + s];
  add(`muslo_${s}`, limb(hp, kn, 84, 58)); add(`pantorrilla_${s}`, limb(kn, an, 56, 34)); add(`pie_sandalia_${s}`, `${C.part_foot(s, 'o')}${C.part_foot(s, 'f')}`); }
// cabeza y pelo (modulo original de Lazy) + contorno de cara nuevo
add('cabeza_rostro_pelo_trasero', C.headBack(P)); add('pelo_frontal_aretes', C.headFront(P)); add('contorno_cara_y_orejas', `${C.part_ear('L', P)}${C.part_ear('R', P)}${C.part_face(P)}`);
// kit alternativo de cara (referencia): ojos por componentes, cejas, nariz, labios, dientes, lengua
for (const s of ['L', 'R']) { const e = C.part_eye(s, P); add(`alt_ojo_${s}_esclera`, e.sclera, ALT); add(`alt_ojo_${s}_iris_pupila_brillos`, e.iris, ALT); add(`alt_ojo_${s}_parpado_sup_sombra`, e.lidUp, ALT); add(`alt_ojo_${s}_pestanas`, e.lashes, ALT); add(`alt_ceja_${s}`, C.part_brow(s, P), ALT); }
add('alt_nariz', C.part_nose(P), ALT); const Po = C.defaultPose(); Po.mouth = { ...Po.mouth, open: 0.6, upperTeeth: 1, lowerTeeth: 1, tongue: 0.6, smile: 0.5 }; const m = C.part_mouth(Po);
add('alt_boca_cavidad', m.cavity, ALT); add('alt_boca_dientes_superiores', `${m.cavity}${m.teethU}`.replace(/fill="#50081c"[^>]*>/, 'fill="none"/>'), ALT); add('alt_boca_dientes_inferiores', `${m.cavity}${m.teethL}`.replace(/fill="#50081c"[^>]*>/, 'fill="none"/>'), ALT); add('alt_boca_lengua', `${m.cavity}${m.tongue}`.replace(/fill="#50081c"[^>]*>/, 'fill="none"/>'), ALT);
add('alt_labio_superior', m.upperLipSvg, ALT); add('alt_labio_inferior', m.lowerLipSvg, ALT);
const manifest = {};
for (const [id, { svg, dir }] of Object.entries(pieces)) {
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">${C.ALLDEFS}${svg}</svg>`; const png = new Resvg(doc).render().asPng(); writeFileSync(`${dir}/${id}.full.png`, png);
  writeFileSync(`${dir}/${id}.svg`, doc);
}
execSync(`python3 - <<'PY'
import glob, json, os
from PIL import Image
man = {}
for f in sorted(glob.glob('assets/**/*.full.png', recursive=True)):
    im = Image.open(f).convert('RGBA'); bb = im.getbbox(); out = f.replace('.full.png', '.png')
    if bb: im.crop(bb).save(out); man[out] = {'offset_x': bb[0], 'offset_y': bb[1], 'width': bb[2]-bb[0], 'height': bb[3]-bb[1], 'canvas': [1024, 1536]}
    os.remove(f)
json.dump(man, open('assets/piezas_manifest.json', 'w'), indent=1, ensure_ascii=False)
print(len(man), 'piezas PNG')
PY`, { stdio: 'inherit' });
// SVG maestro + mapa del rig
writeFileSync('assets/proyecto/lazy2d_maestro_reposo.svg', `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Lazy 2D: pose de reposo, grupos con id por pieza. Abrir en Inkscape/navegador. El rig animable esta en character.mjs -->\n${C.svgDoc(C.renderCharacter(C.defaultPose()))}`);
const parent = { root: null, hips: 'root', spine: 'hips', chest: 'spine', neck: 'chest', head: 'neck', jaw: 'head', shoulder_L: 'chest', upper_arm_L: 'shoulder_L', forearm_L: 'upper_arm_L', hand_L: 'forearm_L', shoulder_R: 'chest', upper_arm_R: 'shoulder_R', forearm_R: 'upper_arm_R', hand_R: 'forearm_R', thigh_L: 'hips', shin_L: 'thigh_L', foot_L: 'shin_L', thigh_R: 'hips', shin_R: 'thigh_R', foot_R: 'shin_R', hair_sway_L: 'head', hair_sway_R: 'head', hair_top: 'head', skirt_sway_L: 'hips', skirt_sway_R: 'hips', earring_L: 'head', earring_R: 'head', pendant: 'chest' };
for (const s of ['L', 'R']) for (const f of ['thumb', 'index', 'middle', 'ring', 'pinky']) { parent[`${f}_${s}_1`] = `hand_${s}`; parent[`${f}_${s}_2`] = `${f}_${s}_1`; }
const piv = { root: C.SK.root, hips: C.SK.hips, chest: C.SK.chest, neck: C.SK.neck, head: C.SK.head, jaw: C.SK.jaw, shoulder_L: C.SK.shoulderL, upper_arm_L: C.SK.shoulderL, forearm_L: C.SK.elbowL, hand_L: C.SK.wristL, shoulder_R: C.SK.shoulderR, upper_arm_R: C.SK.shoulderR, forearm_R: C.SK.elbowR, hand_R: C.SK.wristR, thigh_L: C.SK.hipL, shin_L: C.SK.kneeL, foot_L: C.SK.ankleL, thigh_R: C.SK.hipR, shin_R: C.SK.kneeR, foot_R: C.SK.ankleR };
writeFileSync('assets/proyecto/rig_map.json', JSON.stringify({ canvas: { width: 1024, height: 1536 }, bones: C.BONES.map((b) => ({ name: b, parent: parent[b] ?? null, pivot: piv[b] || null })), ik: { arms: 'ik2(shoulder, elbowRest, wristRest, target, bendSign) -> {r1, r2}', legs: 'rotaciones r1/r2 por pierna (ik2 reutilizable)' },
  face_controls: { eyes: ['blinkL', 'blinkR', 'lookX', 'lookY', 'squint', 'wide'], brows: ['Lraise', 'Rraise', 'Lfrown', 'Rfrown'], mouth: ['open', 'wide', 'round', 'smile', 'upperTeeth', 'lowerTeeth', 'tongue', 'fv', 'press'], head: ['rot', 'yaw', 'pitch'], expressions: Object.keys(C.EXPR), visemes: Object.keys(C.VISEME) },
  secondary_motion: ['hair.swayL/swayR/top (resortes en anim_test.mjs)', 'skirt.swayL/swayR/hem/ruffle (deformacion de vertices)', 'acc.earL/earR/pendant (pendulos)'] }, null, 1));
console.log('proyecto ok');
