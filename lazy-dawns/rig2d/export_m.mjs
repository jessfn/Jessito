// Exporta M: piezas PNG/SVG, SVG maestro, rig_map, clips.json, spritesheets por accion y video demo.
import { Resvg } from '@resvg/resvg-js'; import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'; import { execSync } from 'node:child_process';
import { DEFS, taperPath, part_hand } from './character.mjs'; import * as M from './m_character.mjs'; import { CLIPS, poseClip } from './m_clips.mjs'; import { mFrameSvg } from './m_scene.mjs';
const OUTD = 'assets_M/piezas', SHD = 'assets_M/spritesheets'; mkdirSync(OUTD, { recursive: true }); mkdirSync(SHD, { recursive: true }); mkdirSync('assets_M/proyecto', { recursive: true });
const P = M.defaultM(); const K = '#07040a', pieces = {}; const add = (id, svg) => { pieces[id] = svg; };
add('sombrero_corona', M.m_hat_crown(P)); add('sombrero_ala', M.m_hat_brim(P)); add('cinta_dorada', M.m_hat_band(P)); add('cabeza', M.m_face(P));
for (const s of ['L', 'R']) { add(`ojo_${s}`, M.m_eye(s, P).replace(/<g transform="translate\((\d+)[^"]*"><ellipse cx="0"[^]*?<\/g>/, '')); add(`ceja_${s}`, M.m_brow(s, P)); }
add('boca_sonrisa', M.m_smile(P)); add('capa_cuello_y_broche', M.m_collar(P)); add('torso_camisa', M.m_torso(P)); add('cinturon', M.m_belt(P)); add('capa_paneles_hombros', M.m_cape_front(P));
add('capa_trasera_L', M.m_cape_back(P).replace(/<path d="M1[^]*$/, '')); add('pelvis', M.m_pelvis(P));
for (const s of ['L', 'R']) { add(`muslo_pantorrilla_${s}`, M.m_pantLeg(s)); add(`bota_${s}`, M.m_boot(s));
  const S = M.MSK['shoulder' + s], E = M.MSK['elbow' + s], W = M.MSK['wrist' + s];
  const limb = (a, b, w0, w1) => { const d = taperPath(a, b, w0, w1); return `<path d="${d}" fill="url(#mCloth)" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>`; };
  add(`brazo_superior_${s}`, limb(S, E, 78, 62)); add(`antebrazo_${s}`, limb(E, W, 62, 50)); add(`puno_manga_${s}`, `<g transform="translate(${W[0]},${W[1] + 4}) rotate(${s === 'L' ? 12 : -12})"><rect x="-34" y="-16" width="68" height="30" rx="8" fill="#3a343c" stroke="${K}" stroke-width="5"/></g>`);
  const Hh = M.defaultM()['hand' + s]; const hand = (only) => { const o = part_hand(s, { handL: Hh, handR: Hh }, 'o', only).replace(/#140806/g, K); const f = part_hand(s, { handL: Hh, handR: Hh }, 'f', only).replace(/url\(#zSkin\)/g, '#15101a').replace(/#f08ab8/g, '#241a22').replace(/#8a2e5e|#7a4426/g, '#000'); return `<g transform="translate(${W[0]},${W[1] + 12})">${o}${f}</g>`; };
  add(`mano_${s}_palma`, hand(['palm'])); for (const f of ['thumb', 'index', 'middle', 'ring', 'pinky']) add(`mano_${s}_dedo_${f}`, hand([f])); }
// capa trasera derecha: solo la mitad derecha
add('capa_trasera_R', M.m_cape_back(P)); 
for (const [id, svg] of Object.entries(pieces)) { const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">${DEFS}${M.MDEFS}${svg}</svg>`; writeFileSync(`${OUTD}/${id}.svg`, doc); writeFileSync(`${OUTD}/${id}.full.png`, new Resvg(doc).render().asPng()); }
execSync(`python3 - <<'PY'
import glob, json, os
from PIL import Image
man = {}
for f in sorted(glob.glob('assets_M/piezas/*.full.png')):
    im = Image.open(f).convert('RGBA'); bb = im.getbbox(); out = f.replace('.full.png', '.png')
    if bb: im.crop(bb).save(out); man[os.path.basename(out)] = {'offset_x': bb[0], 'offset_y': bb[1], 'width': bb[2]-bb[0], 'height': bb[3]-bb[1], 'canvas': [1024, 1536]}
    os.remove(f)
json.dump(man, open('assets_M/piezas_manifest.json', 'w'), indent=1)
print(len(man), 'piezas M')
PY`, { stdio: 'inherit' });
writeFileSync('assets_M/proyecto/M_maestro_reposo.svg', `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">${DEFS}${M.MDEFS}${M.renderM(M.defaultM())}</svg>`);
const jsonSpec = JSON.parse(readFileSync('assets_M/proyecto/rig_y_animaciones_original.json', 'utf8').toString());
writeFileSync('assets_M/proyecto/clips.json', JSON.stringify(Object.fromEntries(Object.entries(CLIPS).map(([k, v]) => [k, { duration_sec: v.dur, loop: v.loop, spec_actions: jsonSpec.animation_clips[k]?.actions ?? [] }])), null, 1));
writeFileSync('assets_M/proyecto/rig_map.json', JSON.stringify({ canvas: { width: 1024, height: 1536 }, pivots: M.MSK, hierarchy_implemented: ['hips', 'chest(torso)', 'neck', 'head', 'hat', 'shoulder_L/R -> upper_arm -> forearm -> hand(+5 dedos 2 falanges)', 'leg_L/R (rotacion en la cadera con boton de elevacion)', 'cape_front', 'cape_back_L/R (vertices con retardo)'], controls: { eyes: ['open', 'glow', 'look', 'brow'], mouth: 'smile (profundidad de la sonrisa cosida)', head: ['rot', 'yaw'], hat: ['rot', 'lift'], cape: ['swayL', 'swayR', 'flap'], arms: 'ik2 (hombro-codo-muneca)', hands: ['curl x5', 'spread', 'wig'] } }, null, 1));
// spritesheets por accion (8 cuadros 256x384, fondo transparente)
for (const [name, c] of Object.entries(CLIPS)) { const frames = []; for (let i = 0; i < 8; i++) { const t = (i / 8) * c.dur; const P2 = poseClip(name, t); const svg = mFrameSvg(P2, t, { bg: false }); frames.push(new Resvg(svg, { fitTo: { mode: 'width', value: 256 } }).render().asPng()); frames.forEach((b, j) => writeFileSync(`/tmp/mf_${name}_${j}.png`, b)); }
  execSync(`python3 - <<PY
from PIL import Image
fr=[Image.open('/tmp/mf_${name}_%d.png'%i).convert('RGBA') for i in range(8)]
w,h=fr[0].size; sh=Image.new('RGBA',(w*8,h),(0,0,0,0))
for i,f in enumerate(fr): sh.paste(f,(i*w,0))
sh.save('assets_M/spritesheets/${name}.png')
PY`); }
console.log('listo');
