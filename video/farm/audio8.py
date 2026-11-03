# Musica folk de granja (100 BPM) + efectos + sonidos de animales + voces, todo guiado por timeline.json
import numpy as np, json, wave, subprocess
from scipy.signal import lfilter
sr = 48000; TL = json.load(open('timeline.json')); D = TL['total'] + 1.0; n = int(sr * D); rng = np.random.default_rng(21)
BEAT = .6; BAR = 2.4
M = np.zeros((n, 2)); V = np.zeros((n, 2)); X = np.zeros((n, 2))
def put(buf, t, sig, g=1.0, pan=0.0):
    i = int(t * sr)
    if i >= n or i < 0: return
    j = min(n, i + len(sig)); s = sig[:j - i] * g
    buf[i:j, 0] += s * np.sqrt((1 - pan) / 2); buf[i:j, 1] += s * np.sqrt((1 + pan) / 2)
def tt(d): return np.arange(int(d * sr)) / sr
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def hp(x, a=.5):
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = x[i] - s
    return y
def ks(f, d, decay=.996, bright=.5):
    N = int(sr / f); burst = rng.uniform(-1, 1, N); burst = np.convolve(burst, [bright, 1 - bright], 'same')
    x = np.zeros(int(d * sr)); x[:N] = burst; a = np.zeros(N + 2); a[0] = 1; a[N] = -.5 * decay; a[N + 1] = -.5 * decay
    y = lfilter([1], a, x); return y / (np.max(np.abs(y)) + 1e-9)
def banjo(m, d=.45, v=.5): return ks(hz(m), d, .9935, .35) * v * np.exp(-tt(d) * 3)
def guitar(m, d=.7, v=.4): return ks(hz(m), d, .997, .6) * v * np.exp(-tt(d) * 2)
def bass(m, d=.5, v=.7): return ks(hz(m), d, .998, .85) * v * np.exp(-tt(d) * 4)
def whistle(m, d=.5, v=.3):
    t = tt(d); f = hz(m) * (1 + .012 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .2)); ph = 2 * np.pi * np.cumsum(f) / sr
    return (np.sin(ph) + .15 * np.sin(2 * ph) + .02 * rng.standard_normal(len(t))) * np.minimum(1, t / .05) * np.minimum(1, (d - t) / .08) * v
def stomp(g=.55):
    t = tt(.25); f = 55 + 70 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t * 13) * g
def clap(g=.3):
    o = np.zeros(int(.12 * sr)); t = tt(.12); o += hp(rng.standard_normal(len(t)), .3) * np.exp(-t * 28); return o * g
def shaker(g=.08, d=.05): t = tt(d); return hp(rng.standard_normal(len(t)), .5) * np.exp(-t * 70) * g
def wood(g=.3, f=1400): t = tt(.08); return np.sin(2 * np.pi * f * t) * np.exp(-t * 60) * g
def blip(m, d=.3, v=.5):
    t = tt(d); return (np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t)) * np.exp(-t * 9) * v * np.minimum(1, t * 400)
def sparkle(root=84, g=.25):
    o = np.zeros(int(1.0 * sr))
    for j, m in enumerate([0, 4, 7, 12, 16, 19]):
        sg = blip(root + m, .35, 1); i = int(j * .06 * sr); o[i:i + len(sg)] += sg[:len(o) - i]
    return o * g
def whoosh(d, g=.2):
    x = rng.standard_normal(int(d * sr)); t = tt(d); e = np.sin(np.pi * t / d) ** 2; return hp(x, .08 + .5 * (t / d).mean()) * e * g

# ----- secciones -----
def section(t):
    for s in TL['segs']:
        if s['t0'] <= t < s['t1']: return s['type']
    return 'outro'
CH = {'G': (55, 59, 62, 67), 'C': (60, 64, 67, 72), 'D': (62, 66, 69, 74)}
ROOT = {'G': 31, 'C': 36, 'D': 38}
PROG = ['G', 'C', 'G', 'D']
WH = [[79, 83, 86, 83], [81, 84, 88, 84], [79, 83, 86, 91], [90, 86, 83, 79]]
NB = int(np.ceil(D / BAR))
for bar in range(NB):
    t0 = bar * BAR; ch = PROG[bar % 4]; sec = section(t0 + .1); notes = CH[ch]
    for e in range(8):
        te = t0 + e * BEAT / 2; idx = [0, 2, 3, 2, 1, 2, 3, 2][e]
        put(M, te, banjo(notes[idx] + 12, .4, .42 if sec != 'quiz' else .3), 1, -.3 + .1 * (e % 3))
    if sec in ('animal', 'outro', 'intro'):
        for b in range(4):
            for k, m in enumerate(notes): put(M, t0 + b * BEAT + BEAT / 2 + k * .012, guitar(m, .5, .16 if sec != 'intro' else .1), 1, .3)
    if sec in ('animal', 'outro'):
        for b in (0, 2): put(M, t0 + b * BEAT, bass(ROOT[ch], .6, .55), 1, 0)
        for b in (1, 3): put(M, t0 + b * BEAT, bass(ROOT[ch] + 7, .45, .4), 1, 0)
        for b in (0, 2): put(M, t0 + b * BEAT, stomp(.5), 1, 0)
        for b in (1, 3): put(M, t0 + b * BEAT, clap(.28), 1, .1)
    if sec == 'quiz':
        for b in range(4): put(M, t0 + b * BEAT, bass(ROOT[ch], .35, .4), 1, 0)
        for e in range(8): put(M, t0 + e * BEAT / 2, wood(.16 if e % 2 else .26, 1700 if e % 2 else 1300), 1, .2)
    for e in range(16): put(M, t0 + e * BEAT / 4, shaker(.07 if e % 4 else .1), 1, .4 if e % 2 else -.4)
    if sec in ('outro', 'animal'):
        for k, m in enumerate(WH[bar % 4]): put(M, t0 + k * BEAT, whistle(m, BEAT * .85, .16 if sec == 'animal' else .24), 1, -.1)
M *= .55

# ----- voces -----
def load(path, sr0):
    a = np.load(path); return np.interp(np.arange(int(len(a) * sr / sr0)) * sr0 / sr, np.arange(len(a)), a)
for it in TL['items']:
    if it['kind'] == 'voice':
        a = load(f"../voz5/{it['id']}.npy", 22050); put(V, it['t'], a / np.max(np.abs(a)) * .95, 1, 0)
    else:
        a = load(f"sfx/{it['id']}.npy", 48000); put(X, it['t'], a * .55, 1, 0)
# ----- efectos de interfaz -----
for s in TL['segs']:
    put(X, s['t0'], whoosh(.5, .2), 1, 0)
    if s['type'] == 'animal': put(X, s['t0'] + .25, blip(84, .3, .5), 1, 0)
for h in TL['hops']: put(X, h, sparkle(88, .22), 1, 0)
for c in TL['child']: put(X, c[0], blip(91, .4, .5), 1, 0)
for s in TL['segs']:
    if s['type'] == 'quiz':
        for r in s['rounds']: put(X, r['reveal'], sparkle(91, .25), 1, 0)
    if s['type'] == 'outro': put(X, s['sub0'], sparkle(84, .3), 1, 0)

# ----- mezcla -----
env = np.abs(V).mean(1); k = int(.05 * sr); env = np.convolve(env, np.ones(k) / k, 'same')
env = np.convolve(np.minimum(1, env * 8), np.ones(int(.15 * sr)) / int(.15 * sr), 'same')
M *= (1 - .55 * np.clip(env, 0, 1))[:, None]
kk = np.ones(8) / 8
for ch in (0, 1): X[:, ch] = np.convolve(X[:, ch], kk, 'same')
mix = M * .9 + V * 1.5 + X * .5
mix[:int(.03 * sr)] *= np.linspace(0, 1, int(.03 * sr))[:, None]; mix[-int(1.5 * sr):] *= np.linspace(1, 0, int(1.5 * sr))[:, None]
mix /= max(1e-9, np.max(np.abs(mix))) * 1.02
with wave.open('audio8_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'audio8_raw.wav', '-af', 'loudnorm=I=-18:TP=-3:LRA=7', '-ar', '48000', 'audio8.wav'], check=True)
print('audio8 listo')
