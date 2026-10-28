# Musical 3 "Las formas": pop de juguete a 120 BPM (bajo saltarin, pulso cuadrado, palmas) + efectos + voz de hombre (la del video 1).
import numpy as np, wave, subprocess, os
sr = 48000; D = 39; n = sr * D; rng = np.random.default_rng(3)
B = .5; BAR = 2.0
M = np.zeros((n, 2)); V = np.zeros((n, 2)); X = np.zeros((n, 2))
def put(buf, t, sig, g=1.0, pan=0.0):
    i = int(t * sr)
    if i >= n or i < 0: return
    j = min(n, i + len(sig)); s = sig[:j - i] * g
    buf[i:j, 0] += s * np.sqrt((1 - pan) / 2); buf[i:j, 1] += s * np.sqrt((1 + pan) / 2)
def tt(d): return np.arange(int(d * sr)) / sr
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def noise(d): return rng.standard_normal(int(d * sr))
def lp(x, a):
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y
def hp(x, a): return x - lp(x, a)
def pulse(f, d=.22, v=.4, duty=.25):
    t = tt(d); w = np.where((f * t) % 1 < duty, 1.0, -1.0); w = lp(w, .35)
    return w * np.exp(-t * 6) * v * np.minimum(1, t * 800)
def bassn(f, d=.28, v=.55):
    t = tt(d); w = 2 * ((f * t) % 1) - 1; w = lp(w, .08 + .25 * np.exp(-t * 20).mean())
    return (w * .7 + np.sin(2 * np.pi * f * t)) * np.exp(-t * 7) * v * np.minimum(1, t * 500)
def stab(freqs, d=.16, v=.2):
    t = tt(d); w = sum(np.where((f * t) % 1 < .5, 1.0, -1.0) for f in freqs) / len(freqs); w = lp(w, .3)
    return w * np.exp(-t * 18) * v * np.minimum(1, t * 800)
def kick(g=.85):
    t = tt(.26); f = 48 + 100 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t * 14) * g
def clap(g=.4):
    o = np.zeros(int(.14 * sr))
    for k in range(3):
        t = tt(.05); b = lp(hp(noise(.05), .2), .7) * np.exp(-t * 60); i = int(k * .011 * sr); o[i:i + len(b)] += b[:len(o) - i]
    t = tt(.14); o += lp(hp(noise(.14), .2), .6) * np.exp(-t * 22) * .6
    return o * g
def hat(g=.16, d=.045):
    t = tt(d); return hp(noise(d), .5) * np.exp(-t * 80) * g
def blip(m, d=.14, v=.3):
    t = tt(d); f = hz(m) * (1 + .5 * np.exp(-t * 40)); w = np.sign(np.sin(2 * np.pi * np.cumsum(f) / sr)); return lp(w, .3) * np.exp(-t * 14) * v
def whoosh(d, up=True, g=.3):
    x = noise(d); t = tt(d); e = np.sin(np.pi * t / d) ** 2; f = np.linspace(.03, .3, len(x)) if up else np.linspace(.3, .03, len(x))
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s += f[i] * (x[i] - s); y[i] = s
    return y * e * g * 3
def sparkle(root=84, g=.22):
    o = np.zeros(int(1.0 * sr))
    for j, m in enumerate([0, 4, 7, 12, 16, 19]):
        sg = blip(root + m, .35, 1); i = int(j * .06 * sr); o[i:i + len(sg)] += sg[:len(o) - i]
    return o * g

CH = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]     # C Am F G
ROOT = [36, 33, 29, 31]
LEAD = [[72, None, 76, 79, None, 76, 72, None], [69, None, 72, 76, None, 72, 69, None], [77, None, 74, 77, None, 74, 69, None], [71, None, 74, 79, None, 74, 71, None]]
NB = int(np.ceil(D / BAR))
for bar in range(NB):
    t0 = bar * BAR; c = bar % 4; sec = 0 if bar < 2 else 2 if bar >= 14 and bar < 17 else 1 if bar < 17 else 3
    last = (bar >= 17)
    for b in range(4):
        if bar >= 1 and not (last and b > 0 and bar == NB - 1): put(M, t0 + b * B, kick(.8 if not last else .5), 1, 0)
    for b in (1, 3):
        if bar >= 2 and not last: put(M, t0 + b * B, clap(.42), 1, .1)
    for e in range(8):
        if bar >= 1: put(M, t0 + e * B / 2, hat(.18 if e % 2 else .1), 1, .3 if e % 2 else -.3)
    if sec == 2:
        for e in range(16): put(M, t0 + e * B / 4, hat(.05, .03), 1, .45)
    # bajo saltarin
    for k, on in enumerate([1, 0, 1, 1, 0, 1, 1, 0]):
        if on and bar >= 1: put(M, t0 + k * B / 2, bassn(hz(ROOT[c] + (12 if k in (3, 6) else 0)), .26, .5), 1, -.1)
    # acordes a contratiempo
    if bar >= 2:
        for b in range(4): put(M, t0 + b * B + B / 2, stab([hz(m) for m in CH[c]], .15, .2 if not last else .12), 1, .25)
    # melodia con pulso cuadrado
    if bar >= 2 and not (last and bar >= NB - 1):
        for k, m in enumerate(LEAD[c]):
            if m is None: continue
            put(M, t0 + k * B / 2, pulse(hz(m + (12 if sec == 2 else 0)), .26, .32 if sec != 2 else .4), 1, -.2 + .4 * k / 7)
for m in (72, 76, 79, 84): put(M, 38.0, pulse(hz(m), 1.0, .22, .5), 1, 0)
M *= .55

# ----- voz del hombre (la del video 1) -----
def vo(name, t, g=.95, d='voz4'):
    a = np.load('%s/%s.npy' % (d, name)); a = np.interp(np.arange(int(len(a) * sr / 22050)) * 22050 / sr, np.arange(len(a)), a)
    a = a / np.max(np.abs(a)) * g; put(V, t, a, 1, 0)
vo('hola', .5)
for k in range(4):
    tk = 4 + 6 * k; vo('s%da' % (k + 1), tk + .05); vo('s%db' % (k + 1), tk + 1.7); vo('s%dc' % (k + 1), tk + 3.9)
vo('r1', 28.05)
for i, tt_ in enumerate([29.0, 29.9, 30.8, 31.7]): vo('r%d' % (i + 2), tt_)
vo('r6', 32.6); vo('n_sub', 34.3, d='voz'); vo('n_chao', 36.6, d='voz')

# ----- efectos -----
put(X, .1, whoosh(1.5, False, .3), 1, -.2)
for j in range(4): put(X, 1.0 + j * .5, blip(84 + 3 * j, .2, .5), 1, -.4 + .27 * j)
for k in range(4):
    tk = 4 + 6 * k
    put(X, tk, whoosh(.5, True, .3), 1, 0); put(X, tk, sparkle(88, .22), 1, 0)
    put(X, tk + 1.7, blip(91, .3, .5), 1, .3); put(X, tk + 1.7, sparkle(91, .15), 1, .3)
    put(X, tk + 3.0, whoosh(.5, True, .25), 1, 0); put(X, tk + 3.9, sparkle(93, .22), 1, -.3)
for i, tt_ in enumerate([29.0, 29.9, 30.8, 31.7]): put(X, tt_, blip(84 + 2 * i, .3, .5), 1, 0)
put(X, 28.0, whoosh(.7, True, .3), 1, 0); put(X, 32.6, sparkle(91, .3), 1, 0); put(X, 34.0, sparkle(84, .3), 1, 0)

# ----- mezcla -----
env = np.abs(V).mean(1); k = int(.05 * sr); env = np.convolve(env, np.ones(k) / k, 'same')
env = np.convolve(np.minimum(1, env * 8), np.ones(int(.15 * sr)) / int(.15 * sr), 'same')
M *= (1 - .55 * np.clip(env, 0, 1))[:, None]
kk = np.ones(8) / 8
for ch in (0, 1): X[:, ch] = np.convolve(X[:, ch], kk, 'same')
mix = M * .9 + V * 1.5 + X * .35
mix[:int(.03 * sr)] *= np.linspace(0, 1, int(.03 * sr))[:, None]; mix[-int(1.2 * sr):] *= np.linspace(1, 0, int(1.2 * sr))[:, None]
mix /= max(1e-9, np.max(np.abs(mix))) * 1.02
with wave.open('audio4_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'audio4_raw.wav', '-af', 'loudnorm=I=-18:TP=-3:LRA=7', '-ar', '48000', 'audio4.wav'], check=True)
print('audio4 listo')
