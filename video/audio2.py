# Musical "Contemos del 1 al 5": musica original a 90 BPM + efectos + voces sincronizadas al compas.
import numpy as np, wave, subprocess
sr = 48000; D = 32; n = sr * D; rng = np.random.default_rng(11)
BEAT = 2 / 3; BAR = 8 / 3
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

# ---------- instrumentos ----------
def marimba(f, d=.45, v=.5):
    t = tt(d); w = np.sin(2*np.pi*f*t) + .35*np.sin(2*np.pi*f*4*t)*np.exp(-t*30) + .12*np.sin(2*np.pi*f*10*t)*np.exp(-t*60)
    return w * np.exp(-t*9) * v * np.minimum(1, t*600)
def pluck(f, d=.3, v=.3):
    t = tt(d); w = np.sin(2*np.pi*f*t) + .5*np.sin(2*np.pi*f*2*t) + .25*np.sin(2*np.pi*f*3*t)
    return w * np.exp(-t*14) * v * np.minimum(1, t*800)
def bass(f, d=.35, v=.6):
    t = tt(d); return (np.sin(2*np.pi*f*t) + .3*np.sin(2*np.pi*2*f*t)) * np.exp(-t*7) * v * np.minimum(1, t*400)
def kick(g=.9):
    t = tt(.28); f = 45 + 90*np.exp(-t*28); return np.sin(2*np.pi*np.cumsum(f)/sr) * np.exp(-t*13) * g
def snare(g=.5):
    t = tt(.22); nz = lp(hp(noise(.22), .12), .55) * np.exp(-t*20); tone = np.sin(2*np.pi*190*t) * np.exp(-t*28)
    return (nz * .9 + tone * .5) * g
def clap(g=.45):
    o = np.zeros(int(.14*sr))
    for k in range(3):
        t = tt(.05); b = lp(hp(noise(.05), .2), .7) * np.exp(-t*60); i = int(k*.012*sr); o[i:i+len(b)] += b[:len(o)-i]
    t = tt(.14); o += lp(hp(noise(.14), .2), .6) * np.exp(-t*22) * .6
    return o * g
def hat(g=.2, d=.05):
    t = tt(d); return hp(noise(d), .45) * np.exp(-t*70) * g
def whoosh(d, up=True, g=.4):
    x = noise(d); t = tt(d); e = np.sin(np.pi*t/d)**2; f = np.linspace(.03, .3, len(x)) if up else np.linspace(.3, .03, len(x))
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s += f[i]*(x[i]-s); y[i] = s
    return y * e * g * 3
def sparkle(root=84, g=.3):
    o = np.zeros(int(.9*sr))
    for j, m in enumerate([0, 4, 7, 12, 16, 19]):
        sg = marimba(hz(root+m), .35, 1); i = int(j*.07*sr); o[i:i+len(sg)] += sg[:len(o)-i]
    return o * g
def shimmer(d=1.0, g=.2):
    t = tt(d); return hp(noise(d), .5) * np.exp(-t*2.5) * (.5 + .5*np.sin(2*np.pi*22*t)) * g

# ---------- musica ----------
CH = [(60, 64, 67), (59, 62, 67), (60, 64, 69), (60, 65, 69)]   # C G Am F
ROOT = [36, 43, 45, 41]
MEL = [[76,79,76,72,74,76,72,None], [74,79,74,71,72,74,71,None], [72,76,72,69,71,72,69,None], [77,74,72,69,72,74,77,None]]
for bar in range(12):
    t0 = bar * BAR; c = bar % 4; sec = bar // 4
    # bateria
    for b in (0, 2): put(M, t0 + b*BEAT, kick(), .95, 0)
    if bar >= 1 and bar % 2 == 1: put(M, t0 + 3.5*BEAT, kick(.6), 1, 0)
    for b in (1, 3):
        put(M, t0 + b*BEAT, snare(), .9, .1)
        if bar >= 2: put(M, t0 + b*BEAT, clap(), .8, -.1)
    for e in range(8): put(M, t0 + e*BEAT/2, hat(.2 if e % 2 else .12), 1, .3 if e % 2 else -.3)
    if bar >= 4:
        for e in range(16): put(M, t0 + e*BEAT/4, hat(.06, .03), 1, .45)
    # bajo
    for k, off in enumerate([0, None, 1, 1.5, None, 2.5, 3, None]):
        if off is not None: put(M, t0 + off*BEAT*(1) if False else t0 + k*BEAT/2, bass(hz(ROOT[c] + (7 if k == 6 else 0)), .3), .85, -.1)
    # ukelele a contratiempo
    for b in range(4):
        for m in CH[c]: put(M, t0 + b*BEAT + BEAT/2, pluck(hz(m)), .4, .25)
    # melodia con marimba (entra en el compas 1)
    if bar >= 1:
        for k, m in enumerate(MEL[c]):
            if m is None: continue
            mm = m + (12 if sec == 2 else 0)
            put(M, t0 + k*BEAT/2, marimba(hz(mm), .4, .8 if sec else .55), 1, -.3 + .2*k/7)
            if sec == 2 and k % 2 == 0: put(M, t0 + k*BEAT/2 + BEAT/4, marimba(hz(mm + 7 if False else mm), .25, .35), 1, .2)
# acorde final
for m in CH[0]: put(M, 31.2, marimba(hz(m + 12), 1.0, .5), 1, 0)
M *= .5

# ---------- voces (narradora) ----------
def vo(name, t, g=.95, d='voz2'):
    a = np.load('%s/%s.npy' % (d, name)); a = np.interp(np.arange(int(len(a)*sr/22050))*22050/sr, np.arange(len(a)), a)
    a = a / np.max(np.abs(a)) * g; put(V, t, a, 1, 0)
vo('v_vamos', .6)
for b in range(1, 6):
    tb = b * BAR; vo('c_%d' % b, tb + .05); vo('p_%d' % b, tb + 2*BEAT)
vo('v_otra', 6*BAR + .05)
for i in range(5): vo('c_%d' % (i+1), 6*BAR + (1+i)*BEAT)
vo('v_bien', 7*BAR + 2*BEAT)
vo('v_juntos', 8*BAR + .05)
for i in range(5): vo('c_%d' % (i+1), 8*BAR + (2+i)*BEAT)
vo('n_sub', 26.9, d='voz'); vo('n_chao', 30.0, d='voz')

# ---------- efectos ----------
put(X, 0.2, whoosh(1.2, True, .3), 1, -.4)
for b in range(1, 6):
    tb = b * BAR; put(X, tb, sparkle(88, .25), 1, 0)
    for i in range(b):
        ti = tb + (i*BEAT if i < 4 else 3.5*BEAT)
        put(X, ti, marimba(hz(84 + 2*i), .3, .55), 1, -.5 + i*.25)      # "bloop" de cada pollito
for i in range(5): put(X, 6*BAR + (1+i)*BEAT, marimba(hz(79 + 2*i), .3, .5), 1, 0)
for bar in (8, 9):
    t0 = bar * BAR
    for b in range(4): put(X, t0 + b*BEAT, whoosh(.25, True, .25), 1, 0)
    put(X, t0, shimmer(1.4, .22), 1, 0); put(X, t0, sparkle(91, .3), 1, 0)
put(X, 26.7, sparkle(84, .35), 1, 0)

# ---------- mezcla ----------
env = np.abs(V).mean(1); k = int(.05*sr); env = np.convolve(env, np.ones(k)/k, 'same')
env = np.convolve(np.minimum(1, env*8), np.ones(int(.15*sr))/int(.15*sr), 'same')
M *= (1 - .55*np.clip(env, 0, 1))[:, None]
kk = np.ones(8)/8
for ch in (0, 1): X[:, ch] = np.convolve(X[:, ch], kk, 'same')
mix = M * .9 + V * 1.5 + X * .35
mix[:int(.03*sr)] *= np.linspace(0, 1, int(.03*sr))[:, None]; mix[-sr:] *= np.linspace(1, 0, sr)[:, None]
mix /= max(1e-9, np.max(np.abs(mix))) * 1.02
with wave.open('audio2_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'audio2_raw.wav', '-af', 'loudnorm=I=-18:TP=-3:LRA=7', '-ar', '48000', 'audio2.wav'], check=True)
print('audio2 listo')
