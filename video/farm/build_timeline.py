# Arma la linea de tiempo del video (frases, sonidos, pausas para que el nino repita) a partir de las duraciones reales.
import json, numpy as np, os
ANIM = ['vaca', 'gallo', 'oveja', 'pato', 'cerdito', 'caballo']
NAMES = ['LA VACA', 'EL GALLO', 'LA OVEJA', 'EL PATO', 'EL CERDITO', 'EL CABALLO']
SOUND_WORD = ['¡MUUU!', '¡KIKIRIKÍ!', '¡BEEE!', '¡CUAC, CUAC!', '¡OINK, OINK!', '¡IIIJIJIJI!']
LINES = json.load(open('../voz5/lines.json'))
def dv(n): return len(np.load(f'../voz5/{n}.npy')) / 22050
def ds(k): return len(np.load(f'sfx/{ANIM[k]}.npy')) / 48000
items, segs, hops, child, mouth = [], [], [], [], {k: [] for k in range(6)}
t = 0.8
def say(n, gap=.35, cap=True, k=None):
    global t
    d = dv(n); items.append({'t': round(t, 3), 'dur': round(d, 3), 'kind': 'voice', 'id': n, 'k': k, 'cap': LINES[n] if cap else None}); t += d + gap; return t - d - gap
def sfx(k, gap=.3, show=True, mouth_open=True):
    global t
    d = ds(k); items.append({'t': round(t, 3), 'dur': round(d, 3), 'kind': 'sfx', 'id': ANIM[k], 'k': k, 'cap': None})
    if mouth_open: mouth[k].append([round(t, 3), round(t + d, 3)])
    t += d + gap; return t - d - gap
# --- intro ---
s0 = 0; say('i1', .4); i2 = say('i2', 1.0)
segs.append({'type': 'intro', 't0': 0, 't1': round(t, 3), 'pop0': round(i2, 3)})
# --- animales ---
for k in range(6):
    T = t; say(f'a{k+1}', .25); say(f'b{k+1}', .05)
    t0 = t; o = say(f'o{k+1}', .05); st = sfx(k, .45)
    say(f'c{k+1}', .4); say(f'd{k+1}', .1)
    c0 = t; t += 2.6; child.append([round(c0, 3), round(t, 3), k])
    sfx(k, .3); hb = say('bien', .8); hops.append(round(hb, 3))
    segs.append({'type': 'animal', 'k': k, 't0': round(T, 3), 't1': round(t, 3), 'sound0': round(st, 3), 'word0': round(o, 3)})
# --- adivina quien ---
T = t; say('q0', .3); say('q_listen', .25)
rounds = [3, 4, 2]; keys = ['q_pato', 'q_cerdito', 'q_oveja']; rd = []
for r, k in enumerate(rounds):
    r0 = t; st = sfx(k, .2, mouth_open=False); t += 2.4; rv = say(keys[r], 1.0, k=k)
    mouth[k].append([round(rv, 3), round(rv + dv(keys[r]), 3)]); rd.append({'k': k, 't0': round(r0, 3), 'reveal': round(rv, 3), 'sound': round(st, 3)}); hops.append(round(rv + .3, 3))
    if r == 0: pass
segs.append({'type': 'quiz', 't0': round(T, 3), 't1': round(t, 3), 'rounds': rd})
# --- cierre ---
T = t; t += .3; say('z1', .35); z = say('z2', 1.0); hops.append(round(z, 3))
t += 2.2
segs.append({'type': 'outro', 't0': round(T, 3), 't1': round(t, 3), 'sub0': round(z, 3)})
TL = {'total': round(t, 3), 'fps': 24, 'items': items, 'segs': segs, 'hops': hops, 'child': child, 'mouth': mouth, 'names': NAMES, 'words': SOUND_WORD}
json.dump(TL, open('timeline.json', 'w'), ensure_ascii=False)
open('timeline.js', 'w').write('const TL=' + json.dumps(TL, ensure_ascii=False) + ';')
print('duracion total', TL['total'], 's  frames', int(TL['total'] * 24), '| segmentos', [(s['type'], s['t0']) for s in segs])
