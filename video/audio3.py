# Musical 2 "Contemos estrellitas": musica original suave (celesta, arpa, colchon de cuerdas) a 96 BPM + efectos + voz.
import numpy as np, wave, subprocess, sys
sr = 48000; D = 30; n = sr * D; rng = np.random.default_rng(5)
B3 = 60 / 96; BAR3 = B3 * 4
VOZ = sys.argv[1] if len(sys.argv) > 1 else 'voz3'
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
def celesta(f, d=1.2, v=.5):   # campanita dulce: parciales casi armonicos con caida larga
    t = tt(d); w = np.sin(2*np.pi*f*t) + .45*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*5) + .25*np.sin(2*np.pi*f*3.99*t)*np.exp(-t*9) + .1*np.sin(2*np.pi*f*6.2*t)*np.exp(-t*18)
    return w * np.exp(-t*3.2) * v * np.minimum(1, t*500)
def harp(f, d=.9, v=.4):
    t = tt(d); w = np.sin(2*np.pi*f*t) + .4*np.sin(2*np.pi*f*2*t)*np.exp(-t*4) + .2*np.sin(2*np.pi*f*3*t)*np.exp(-t*8)
    return w * np.exp(-t*4.5) * v * np.minimum(1, t*800)
def pad(freqs, d, v=.12):
    t = tt(d); w = sum(np.sin(2*np.pi*f*t) + .3*np.sin(2*np.pi*f*2*t + .5) for f in freqs) / len(freqs)
    e = np.minimum(1, t / .6) * np.minimum(1, (d - t) / .8)
    return w * e * v
def bassn(f, d=.9, v=.5):
    t = tt(d); return (np.sin(2*np.pi*f*t) + .2*np.sin(2*np.pi*2*f*t)) * np.exp(-t*3) * v * np.minimum(1, t*300)
def soft_kick(g=.5):
    t = tt(.3); f = 50 + 60*np.exp(-t*25); return np.sin(2*np.pi*np.cumsum(f)/sr) * np.exp(-t*12) * g
def brush(g=.1, d=.12):
    t = tt(d); return lp(hp(noise(d), .35), .5) * np.exp(-t*30) * g
def whoosh(d, up=True, g=.3):
    x = noise(d); t = tt(d); e = np.sin(np.pi*t/d)**2; f = np.linspace(.03, .3, len(x)) if up else np.linspace(.3, .03, len(x))
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s += f[i]*(x[i]-s); y[i] = s
    return y * e * g * 3
def sparkle(root=88, g=.3):
    o = np.zeros(int(1.4*sr))
    for j, m in enumerate([0, 4, 7, 12, 16, 19, 24]):
        sg = celesta(hz(root+m), .9, 1); i = int(j*.07*sr); o[i:i+len(sg)] += sg[:len(o)-i]
    return o * g
def shimmer(d=1.2, g=.18):
    t = tt(d); return hp(noise(d), .5) * np.exp(-t*2.2) * (.5 + .5*np.sin(2*np.pi*20*t)) * g

# ----- armonia G - D - Em - C (3 vueltas de 4 compases) -----
CH = [(55, 59, 62), (50, 54, 57), (52, 55, 59), (48, 52, 55)]   # tonica en octava grave para el pad
ROOT = [43, 38, 40, 36]
ARP = [[67, 71, 74, 79], [66, 69, 74, 78], [67, 71, 76, 79], [64, 67, 72, 76]]
MEL = [[79, None, 76, None, 74, 76, 71, None], [74, None, 78, None, 81, 78, 74, None], [76, None, 79, None, 76, 74, 71, None], [72, None, 76, None, 79, None, 76, None]]
for bar in range(12):
    t0 = bar * BAR3; c = bar % 4; sec = bar // 4
    put(M, t0, pad([hz(m) for m in CH[c]] + [hz(CH[c][0] + 12)], BAR3 + .3, .13 if bar < 10 else .16), 1, 0)
    put(M, t0, bassn(hz(ROOT[c]), 1.3, .5), 1, -.1); put(M, t0 + 2*B3, bassn(hz(ROOT[c] + (7 if c in (0, 2) else 0)), 1.0, .4), 1, -.1)
    if 1 <= bar <= 9:
        put(M, t0, soft_kick(.45), 1, 0); put(M, t0 + 2*B3, soft_kick(.4), 1, 0)
        for e in range(8): put(M, t0 + e*B3/2, brush(.1 if e % 2 else .06), 1, .3 if e % 2 else -.3)
    for k, m in enumerate(ARP[c] * 2):                                         # arpa en corcheas
        put(M, t0 + k*B3/2, harp(hz(m - 12 if sec == 0 else m), .9, .32), 1, -.35 + .7*k/7)
    if bar >= 1:                                                                  # melodia de celesta
        for k, m in enumerate(MEL[c]):
            if m is None: continue
            put(M, t0 + k*B3/2, celesta(hz(m + (12 if sec == 2 else 0)), 1.3, .55 if sec else .38), 1, .15)
for m in (79, 83, 86, 91): put(M, 29.0 - .0, celesta(hz(m), 2.2, .35), 1, 0)
M *= .5

# ----- voz (la opcion elegida) -----
def vo(name, t, g=.95):
    a = np.load('%s/%s.npy' % (VOZ, name)); a = np.interp(np.arange(int(len(a)*sr/22050))*22050/sr, np.arange(len(a)), a)
    a = a / np.max(np.abs(a)) * g; put(V, t, a, 1, 0)
vo('v_vamos', .5)
for b in range(1, 6): vo('c_%d' % b, b*BAR3 + .05); vo('p_%d' % b, b*BAR3 + 2*B3)
vo('v_otra', 6*BAR3 + .05)
for i in range(5): vo('c_%d' % (i+1), 6*BAR3 + (1+i)*B3)
vo('v_bien', 7*BAR3 + 2*B3); vo('v_juntas', 8*BAR3 + .05)
for i in range(5): vo('c_%d' % (i+1), 8*BAR3 + (2+i)*B3)
vo('v_sub', 25.3); vo('v_noches', 27.6)

# ----- efectos suaves sincronizados -----
put(X, 0.1, whoosh(1.4, False, .25), 1, -.3); put(X, 1.6, sparkle(88, .3), 1, 0)
for b in range(1, 6):
    tb = b * BAR3; put(X, tb, sparkle(91, .2), 1, 0)
    for i in range(b): put(X, tb + (i*B3 if i < 4 else 3.5*B3), celesta(hz(88 + 2*i), .8, .6), 1, -.5 + i*.25)
for i in range(5): put(X, 6*BAR3 + (1+i)*B3, celesta(hz(83 + 2*i), .8, .55), 1, 0)
for bar in (8, 9):
    t0 = bar * BAR3
    for b in range(4): put(X, t0 + b*B3, whoosh(.25, True, .2), 1, 0)
    put(X, t0, shimmer(1.6, .2), 1, 0); put(X, t0, sparkle(95, .3), 1, 0)
put(X, 25.0, sparkle(88, .3), 1, 0)

# ----- mezcla -----
env = np.abs(V).mean(1); k = int(.05*sr); env = np.convolve(env, np.ones(k)/k, 'same')
env = np.convolve(np.minimum(1, env*8), np.ones(int(.15*sr))/int(.15*sr), 'same')
M *= (1 - .5*np.clip(env, 0, 1))[:, None]
kk = np.ones(8)/8
for ch in (0, 1): X[:, ch] = np.convolve(X[:, ch], kk, 'same')
mix = M * .95 + V * 1.45 + X * .4
mix[:int(.03*sr)] *= np.linspace(0, 1, int(.03*sr))[:, None]; mix[-int(1.5*sr):] *= np.linspace(1, 0, int(1.5*sr))[:, None]
mix /= max(1e-9, np.max(np.abs(mix))) * 1.02
with wave.open('audio3_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'audio3_raw.wav', '-af', 'loudnorm=I=-18:TP=-3:LRA=7', '-ar', '48000', 'audio3.wav'], check=True)
print('audio3 listo')
