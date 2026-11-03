# Linea de tiempo del video "Las vocales" a partir de las duraciones reales de las voces.
import json, numpy as np
V = ['A', 'E', 'I', 'O', 'U']
W = [['Avión', 'Abeja', 'Árbol'], ['Elefante', 'Estrella', 'Escoba'], ['Isla', 'Iguana', 'Imán'], ['Oso', 'Ojo', 'Oveja'], ['Uvas', 'Unicornio', 'Universo']]
EM = [['✈️', '🐝', '🌳'], ['🐘', '⭐', '🧹'], ['🏝️', '🦎', '🧲'], ['🐻', '👁️', '🐑'], ['🍇', '🦄', '🌌']]
LINES = json.load(open('../voz6/lines.json'))
LINES['n_sub'] = '¡Suscríbete y dale a la campanita!'; LINES['n_chao'] = '¡Hasta pronto, amiguitos!'
def dv(n, d='voz6'): return len(np.load(f'../{d}/{n}.npy')) / 22050
items, segs, hops = [], [], []
t = 0.8
def say(n, gap=.35, d='voz6', cap=True):
    global t
    du = dv(n, d); items.append({'t': round(t, 3), 'dur': round(du, 3), 'id': n, 'dir': d, 'cap': LINES[n] if cap else None}); t += du + gap; return t - du - gap
say('i1', .4); i2 = say('i2', 1.2)
segs.append({'type': 'intro', 't0': 0, 't1': round(t, 3), 'pop0': round(i2, 3)})
for k in range(5):
    T = t; say(f'a{k+1}', .3); s0 = say(f's{k+1}', .5); ws = []
    for j in range(3): ws.append(round(say(f'w{k+1}{j+1}', .5), 3))
    say(f'd{k+1}', .1); c0 = t; t += 2.4
    hb = say('bien', .8); hops.append(round(hb, 3))
    segs.append({'type': 'vocal', 'k': k, 't0': round(T, 3), 't1': round(t, 3), 'sound0': round(s0, 3), 'words': ws, 'child': [round(c0, 3), round(c0 + 2.4, 3)]})
T = t; say('q0', .4); rounds = []
for (k, j, r) in [(4, 0, 'r_u'), (3, 0, 'r_o'), (0, 0, 'r_a')]:
    r0 = t; say(f'w{k+1}{j+1}', .2); t += 2.2; rv = say(r, 1.0); rounds.append({'k': k, 'j': j, 't0': round(r0, 3), 'reveal': round(rv, 3)}); hops.append(round(rv + .3, 3))
segs.append({'type': 'quiz', 't0': round(T, 3), 't1': round(t, 3), 'rounds': rounds})
T = t; t += .3; say('z1', .4); say('n_sub', .3, 'voz'); z = say('n_chao', 1.0, 'voz'); hops.append(round(z, 3)); t += 2.0
segs.append({'type': 'outro', 't0': round(T, 3), 't1': round(t, 3), 'sub0': round(z, 3)})
TL = {'total': round(t, 3), 'fps': 24, 'items': items, 'segs': segs, 'hops': hops, 'V': V, 'W': W, 'EM': EM}
json.dump(TL, open('timeline.json', 'w'), ensure_ascii=False); open('timeline.js', 'w').write('const TL=' + json.dumps(TL, ensure_ascii=False) + ';')
print('duracion', TL['total'], 's  frames', int(TL['total'] * 24), [(s['type'], s['t0']) for s in segs])
