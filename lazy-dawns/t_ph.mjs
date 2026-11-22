import { renderCharacter as rc, defaultPose as dp } from './rig2d/character.mjs';
const P = dp(); P.noseStyle = 'D'; P.noseK = 1.35; P.hairOv = { lacio: 'C2', len: 0.4, shine: 1, cp: 1, grow: 1 };
const s = rc(P); const re = /<path d="(M\s?5[01]\d(?:\.\d)?,3[0-4]\d[^"]*)"[^>]*>/g; let m; while ((m = re.exec(s))) console.log(m[0].slice(0, 200));
const re2 = /<(?:path|line)[^>]*d="M\s?(?:50\d|51\d|52\d)[.\d]*,\s?3[1-4]\d[^"]*"[^>]*>/g; while ((m = re2.exec(s))) console.log('2:', m[0].slice(0, 200));
