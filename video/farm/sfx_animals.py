# Sonidos de animales al estilo caricatura (sintesis de formantes). Salida: sfx/<animal>.npy a 48 kHz.
import numpy as np, os
from scipy.signal import butter, lfilter
sr = 48000; os.makedirs('sfx', exist_ok=True); rng = np.random.default_rng(9)
def tt(d): return np.arange(int(d * sr)) / sr
def env(n, a=.04, r=.15):
    e = np.ones(n); na, nr = int(a * sr), int(r * sr); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def source(f0, vib_hz=5, vib=.02, rough=0.0):
    ph = 2 * np.pi * np.cumsum(f0 * (1 + vib * np.sin(2 * np.pi * vib_hz * np.arange(len(f0)) / sr))) / sr
    s = sum(np.sin(k * ph) / k for k in range(1, 28))            # diente de sierra suave (armonicos)
    if rough: s *= 1 + rough * np.sin(2 * np.pi * 70 * np.arange(len(f0)) / sr)
    return s
def formants(x, fs, bws, gains):
    y = np.zeros_like(x)
    for f, bw, g in zip(fs, bws, gains):
        lo, hi = max(40, f - bw / 2), min(sr / 2 - 100, f + bw / 2)
        b, a = butter(2, [lo / (sr / 2), hi / (sr / 2)], btype='band'); y += g * lfilter(b, a, x)
    return y
def glide(pts, d):  # puntos (t_rel, hz) -> curva
    t = np.linspace(0, 1, int(d * sr)); xs = [p[0] for p in pts]; ys = [p[1] for p in pts]; return np.interp(t, xs, ys)
def norm(x, g=.8): return x / np.max(np.abs(x)) * g
def moo():
    d = 1.5; f0 = glide([(0, 150), (.25, 165), (.7, 125), (1, 100)], d); s = source(f0, 5, .025)
    t = tt(d); f1 = glide([(0, 380), (.3, 620), (.8, 520), (1, 360)], d)
    y = formants(s, [520, 1000, 2300], [220, 260, 400], [1, .5, .15]) * env(len(s), .12, .3)
    return norm(y)
def rooster():
    parts = []
    for pts, d, a in [([(0, 520), (1, 760)], .22, 1), ([(0, 700), (1, 640)], .13, .8), ([(0, 620), (1, 980)], .24, 1), ([(0, 960), (.35, 1180), (1, 640)], .75, 1)]:
        f0 = glide(pts, d); s = source(f0, 18, .03, .2); y = formants(s, [1100, 2600, 3800], [500, 700, 900], [1, .7, .3]) * env(len(s), .015, .06) * a
        parts.append(y); parts.append(np.zeros(int(.03 * sr)))
    return norm(np.concatenate(parts))
def baa():
    d = 1.3; f0 = glide([(0, 300), (.3, 340), (1, 290)], d); s = source(f0, 9, .06, .5)
    y = formants(s, [750, 1250, 2600], [260, 300, 500], [1, .6, .2]) * env(len(s), .05, .25)
    return norm(y)
def quack():
    outs = []
    for f in (340, 300):
        d = .26; f0 = glide([(0, f), (1, f * .72)], d); s = source(f0, 0.1, 0, 0) + .15 * rng.standard_normal(len(f0))
        y = formants(s, [950, 2100, 3300], [350, 600, 800], [1, .8, .3]) * env(len(s), .012, .16); outs += [y, np.zeros(int(.12 * sr))]
    return norm(np.concatenate(outs))
def oink():
    outs = []
    for f in (200, 170):
        d = .32; f0 = glide([(0, f), (.5, f * .8), (1, f * .62)], d); s = source(f0, 28, .05, .6) + .25 * rng.standard_normal(len(f0))
        y = formants(s, [520, 1150, 2400], [250, 400, 600], [1, .7, .3]) * env(len(s), .02, .12); outs += [y, np.zeros(int(.14 * sr))]
    return norm(np.concatenate(outs))
def neigh():
    d = 1.7; f0 = glide([(0, 420), (.2, 1050), (.5, 1150), (1, 330)], d); s = source(f0, 22, .05, .15) + .2 * rng.standard_normal(len(f0))
    y = formants(s, [900, 2500, 4000], [400, 800, 1000], [1, .6, .3]) * env(len(s), .04, .35)
    return norm(y)
for n, fn in [('vaca', moo), ('gallo', rooster), ('oveja', baa), ('pato', quack), ('cerdito', oink), ('caballo', neigh)]:
    x = fn(); np.save(f'sfx/{n}.npy', x); print(n, round(len(x) / sr, 2), 's')
