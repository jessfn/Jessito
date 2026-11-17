# Mezcla del ESPECIAL: voces (narrador, Dante, Memo) + efectos reales + musica epica sintetizada con ducking (silencio antes de la revelacion y golpe).
import json, subprocess, numpy as np, wave, unicodedata
tl = json.load(open('build/dia10/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia10/lines.json')); L = {l['id']: l for l in d['lines']}
SR = 44100
N = lambda m: 440.0 * 2 ** ((m - 69) / 12)
rs = np.random.RandomState(5)
def env(n, att=0.01, rel=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / max(att, 1e-4)) * np.minimum(1, np.maximum(0, (n / SR - t)) / max(rel, 1e-4))
def pluck(f, dur, vel=1.0, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.5 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 12) + 0.25 * bright * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 18)) * np.exp(-t * 7.0) * (1 - np.exp(-t * 400)) * vel
def piano(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for k, a in enumerate([1, 0.6, 0.35, 0.2, 0.12], 1): s += a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (2.5 + 1.8 * k))
    return s * (1 - np.exp(-t * 600)) * vel * 0.9
def bell(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + 0.4 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)) * np.exp(-t * 2.2) * (1 - np.exp(-t * 800)) * vel * 0.7
def pad(freqs, dur, vel=0.5, att=0.6):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-0.6, 0.0, 0.6): s += np.sin(2 * np.pi * (f + det) * t + det)
    return s / (3 * len(freqs)) * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, dur - t) / 0.8) * vel
def strings(freqs, dur, vel=0.5, trem=0.0, att=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-1.2, 0.0, 1.3): s += (2 * ((f + det) * t % 1) - 1) * 0.5 + np.sin(2 * np.pi * (f + det) * t) * 0.3
    s = s / (3 * len(freqs)); lp = np.convolve(s, np.ones(6) / 6, mode='same')
    g = (1 - trem + trem * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t))) if trem else 1
    return lp * g * np.minimum(1, t / att) * np.minimum(1, np.maximum(0, dur - t) / 0.6) * vel
def choir(freqs, dur, vel=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        v = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t)
        for k, a in [(1, 1), (2, 0.5), (3, 0.35), (4, 0.2), (5, 0.25)]: s += a * np.sin(2 * np.pi * f * k * t * v)
    return s / (len(freqs) * 2.3) * np.minimum(1, t / 1.0) * np.minimum(1, np.maximum(0, dur - t) / 1.0) * vel
def bass(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)) * np.exp(-t * 3.2) * (1 - np.exp(-t * 300)) * vel
def saw_bass(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = 2 * (f * t % 1) - 1; s = np.convolve(s, np.ones(24) / 24, mode='same')
    return s * np.exp(-t * 2.2) * (1 - np.exp(-t * 200)) * vel
def kick(vel=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (45 + 110 * np.exp(-t * 30)) * t) * np.exp(-t * 9) * vel
def hat(vel=0.4, dur=0.06):
    n = int(dur * SR); t = np.arange(n) / SR; x = rs.randn(n); x = x - np.convolve(x, np.ones(6) / 6, mode='same'); return x * np.exp(-t * 70) * vel
def clapd(vel=0.6):
    n = int(0.2 * SR); t = np.arange(n) / SR; x = rs.randn(n); x = x - np.convolve(x, np.ones(10) / 10, mode='same'); return x * (np.exp(-t * 28) + 0.6 * np.exp(-((t - 0.015) * 90) ** 2)) * vel
def timp(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (f + 25 * np.exp(-t * 12)) * t) * np.exp(-t * 4) * (1 - np.exp(-t * 300)) * vel
def riser(dur, f0=200, f1=1800, vel=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / dur) ** 2) / SR
    return (np.sin(ph) * 0.6 + np.random.RandomState(3).randn(n) * 0.15) * (t / dur) ** 1.5 * vel
total = int(D * SR); mus = np.zeros((total, 2))
def put(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= total or i < 0: return
    j = min(total, i + len(sig)); seg = sig[:j - i] * gain
    mus[i:j, 0] += seg * (1 - max(0, pan)); mus[i:j, 1] += seg * (1 + min(0, pan))
def secs(a, b, bpm):
    be = 60 / bpm; t = a; out = []
    while t < b - 0.05: out.append(t); t += 4 * be
    return be, out
# progresiones (raiz MIDI + acorde)
CM = [([57, 61, 64, 69], 45), ([62, 66, 69, 74], 50), ([59, 62, 66, 71], 47), ([55, 59, 62, 67], 43)]          # A mayor luminoso
AM = [([57, 60, 64, 69], 45), ([53, 57, 60, 65], 41), ([55, 58, 62, 67], 43), ([52, 55, 59, 64], 40)]          # A menor triste
DK = [([45, 48, 52, 57], 33), ([46, 50, 53, 58], 34), ([45, 48, 52, 57], 33), ([44, 47, 51, 56], 32)]          # oscuro
EP = [([57, 64, 69, 73], 45), ([53, 60, 65, 69], 41), ([60, 64, 67, 72], 48), ([55, 62, 67, 71], 43)]          # epico
SEC = [  # (inicio, fin, estilo, bpm)
 (0.0, T['slateEnd'] + 3.0, 'slate', 80), (4.3, T['noteA'] - 0.2, 'mystery', 72), (T['noteA'] - 0.2, T['danteA'] - 0.2, 'curious', 96), (T['danteA'] - 0.2, T['spaA'] - 0.2, 'warm', 100),
 (T['spaA'] - 0.2, T['dermoA'] - 0.2, 'spa', 70), (T['dermoA'] - 0.2, T['fakeA'] - 0.3, 'treat', 104), (T['fakeA'] - 0.3, T['realA'] - 0.3, 'tension', 90), (T['realA'] - 0.3, T['weeksA'] - 0.2, 'relief', 88),
 (T['weeksA'] - 0.2, T['revealA'] - 0.1, 'montage', 124), (T['revealA'] - 0.1, T['tonicA'] - 0.2, 'epic', 84), (T['tonicA'] - 0.2, T['fallA'] - 0.1, 'creep', 70), (T['fallA'] - 0.1, T['lairA'] - 0.2, 'shock', 90),
 (T['lairA'] - 0.2, T['homeA'] - 0.2, 'lair', 96), (T['homeA'] - 0.2, T['vote'] - 0.1, 'sad', 64), (T['vote'] - 0.1, D, 'hook', 112)]
for (a, b, sty, bpm) in SEC:
    be, starts = secs(a, b, bpm)
    for bar, t in enumerate(starts):
        L4 = min(4 * be, b - t)
        if sty == 'slate':
            put(pad([N(45), N(52), N(57)], L4 + 1, 0.6), t, 0, 0.6); put(timp(55, 2.0, 1.0), 0.55, 0, 0.9)
        elif sty == 'mystery':
            ch, root = AM[bar % 4]; put(pad([N(m) for m in ch[:3]], L4, 0.4, 1.2), t, 0, 0.55)
            for k, idx in enumerate([0, 2, 1]): put(piano(N(ch[idx] + 12), 1.6, 0.6), t + k * 1.1 * be, 0.2, 0.35)
            put(bass(N(root - 12), L4, 0.7), t, 0, 0.5)
        elif sty == 'curious':
            ch, root = AM[bar % 4]
            for k in range(8): put(pluck(N(ch[[0, 2, 1, 3, 2, 1, 3, 0][k]] + 12), beat_ := 0.22, 0.8, 1.4), t + k * be / 2, -0.3 if k % 2 else 0.3, 0.38)
            put(bass(N(root - 12), be * 1.5, 0.8), t, 0, 0.55); put(bass(N(root - 12), be * 1.5, 0.8), t + 2 * be, 0, 0.5)
        elif sty == 'warm':
            ch, root = CM[bar % 4]; put(pad([N(m) for m in ch], L4, 0.4, 0.5), t, 0, 0.5)
            for k, idx in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): put(bell(N(ch[idx] + 12), 1.0, 0.6), t + k * be / 2, -0.3 if k % 2 else 0.3, 0.22)
            put(bass(N(root - 12), be * 1.6, 0.8), t, 0, 0.55); put(hat(0.35), t + be * 1.0, 0, 0.6); put(hat(0.35), t + be * 3.0, 0, 0.6)
        elif sty == 'spa':
            ch, root = CM[bar % 4]; put(pad([N(m) for m in ch], L4 + 0.5, 0.5, 1.4), t, 0, 0.55)
            for k, idx in enumerate([0, 1, 2, 3, 2, 1]): put(bell(N(ch[idx] + 24), 2.0, 0.6), t + k * be * 0.66, -0.4 if k % 2 else 0.4, 0.2)
        elif sty == 'treat':
            ch, root = CM[bar % 4]
            for k in range(4): put(kick(0.55), t + k * be, 0, 0.55)
            for k in range(8): put(hat(0.3 + 0.1 * (k % 2)), t + k * be / 2 + be / 4, 0, 0.5)
            for k, idx in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): put(pluck(N(ch[idx] + 12), 0.25, 0.8, 1.2), t + k * be / 2, -0.3 if k % 2 else 0.3, 0.3)
            put(saw_bass(N(root - 12), be * 1.8, 0.7), t, 0, 0.4); put(saw_bass(N(root - 12 + 7), be * 1.8, 0.7), t + 2 * be, 0, 0.35)
        elif sty == 'tension':
            ch, root = DK[bar % 4]; put(strings([N(m) for m in ch[:3]], L4 + 0.3, 0.5, trem=0.7, att=0.4), t, 0, 0.7)
            for k in range(4): put(kick(0.5 + 0.1 * k), t + k * be, 0, 0.5 if k % 2 == 0 else 0.35)
            put(saw_bass(N(root - 12), L4, 0.8), t, 0, 0.4)
        elif sty == 'relief':
            ch, root = CM[(bar + 1) % 4]; put(strings([N(m) for m in ch], L4 + 0.5, 0.5, att=0.7), t, 0, 0.5)
            for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 3]): put(piano(N(ch[idx] + 12), 0.9, 0.7), t + k * be / 2, 0.2, 0.34)
            put(bass(N(root - 12), be * 1.8, 0.8), t, 0, 0.5)
        elif sty == 'montage':
            ch, root = CM[bar % 4]
            for k in range(4): put(kick(0.7), t + k * be, 0, 0.6); put(clapd(0.6), t + (k + 0.5) * be if False else t + k * be + be / 2 * 0, 0, 0.0)
            for k in (1, 3): put(clapd(0.7), t + k * be, 0, 0.55)
            for k in range(16): put(hat(0.3), t + k * be / 4, 0, 0.4)
            for k, idx in enumerate([0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 1, 3, 2]): put(pluck(N(ch[idx] + 12), 0.2, 0.8, 1.5), t + k * be / 4, -0.3 if k % 2 else 0.3, 0.3)
            put(saw_bass(N(root - 12), be * 0.9, 0.8), t, 0, 0.4); put(saw_bass(N(root - 12), be * 0.9, 0.8), t + 2 * be, 0, 0.35); put(saw_bass(N(root - 5), be * 0.9, 0.8), t + 3 * be, 0, 0.35)
        elif sty == 'epic':
            ch, root = EP[bar % 4]; put(strings([N(m) for m in ch], L4 + 0.6, 0.8, att=0.5), t, 0, 0.8); put(choir([N(m + 12) for m in ch[:3]], L4 + 0.6, 0.7), t, 0, 0.7)
            put(timp(N(root - 12), 1.5, 1.0), t, 0, 0.8)
            for k in range(8): put(timp(N(root - 12), 0.4, 0.8), t + k * be / 2, 0, 0.35)
            for k, idx in enumerate([3, 2, 1, 0]): put(bell(N(ch[idx] + 24), 1.6, 0.7), t + k * be, 0.3, 0.25)
        elif sty == 'creep':
            ch, root = DK[bar % 4]; put(pad([N(m) for m in ch[:3]], L4, 0.3, 1.0), t, 0, 0.4)
            for k, idx in enumerate([2, 0, 1, 0]): put(bell(N(ch[idx] + 24), 1.4, 0.7), t + k * 1.3 * be, 0.3 if k % 2 else -0.3, 0.25)
            put(bass(N(root - 12), L4, 0.6), t, 0, 0.5)
        elif sty == 'shock':
            put(strings([N(45), N(46) , N(51), N(52)], L4 + 0.3, 0.7, trem=0.9, att=0.1), t, 0, 0.7)
            for k in range(6): put(kick(0.9), t + k * be * 0.66, 0, 0.7)
            put(timp(40, 2.0, 1.0), t + 1.0, 0, 0.9)
        elif sty == 'lair':
            ch, root = DK[bar % 4]
            put(pad([N(m) for m in ch], 4 * be, 0.5), t, 0, 0.7); put(saw_bass(N(root - 12), be, 0.9), t, 0, 0.55)
            for k in range(8): put(saw_bass(N(root - 12 + (7 if k % 4 == 3 else 0)), be * 0.4, 0.8), t + k * be / 2, 0, 0.4)
            for k in (0, 2): put(kick(0.9), t + k * be, 0, 0.7)
            for k in range(8): put(hat(0.35), t + k * be / 2 + be / 4, 0, 0.5)
            for k, idx in enumerate([2, 1, 0]): put(pluck(N(ch[idx] + 12), 0.5, 0.9, 0.6), t + k * 1.33 * be, -0.2, 0.35)
        elif sty == 'sad':
            ch, root = AM[bar % 4]
            for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 1]): put(piano(N(ch[idx]), 1.4, 0.8), t + k * be / 2, 0.1, 0.4)
            put(strings([N(m - 12) for m in ch[:3]], L4 + 0.5, 0.35, att=1.0), t, 0, 0.5)
        elif sty == 'hook':
            ch, root = CM[bar % 4]
            for k in range(4): put(kick(0.7), t + k * be, 0, 0.6)
            for k in (1, 3): put(clapd(0.8), t + k * be, 0, 0.55)
            for k in range(8): put(hat(0.3), t + k * be / 2 + be / 4, 0, 0.5)
            for k, idx in enumerate([0, 2, 3, 2, 1, 3, 2, 1]): put(pluck(N(ch[idx] + 12), 0.25, 0.9, 1.4), t + k * be / 2, -0.3 if k % 2 else 0.3, 0.38)
            put(saw_bass(N(root - 12), be * 1.8, 0.8), t, 0, 0.4); put(saw_bass(N(root - 12 + 7), be * 1.8, 0.8), t + 2 * be, 0, 0.35)
put(riser(2.4, 150, 1800, 0.45), T['revealA'] - 2.4, 0, 1.0)
for i, m in enumerate([62, 66, 69, 74]): put(pluck(N(m), 2.0, 1.0), T['revealA'] + i * 0.08, 0.2, 0.55); put(timp(50, 2.5, 1.0), T['revealA'], 0, 0.9)
put(riser(1.6, 100, 900, 0.5), T['fakeA'] - 1.0 + 3.6, 0, 0.8); put(timp(38, 2.0, 1.0), T['fallA'] + 1.8, 0, 1.0)
put(riser(1.8, 120, 1400, 0.5), T['lairA'] - 1.8, 0, 0.8); put(timp(36, 2.5, 1.0), T['danteB'], 0, 1.0)
mus = np.clip(mus, -1, 1) * 0.5
with wave.open('build/dia10/musica.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mus * 32767).astype('<i2').tobytes())
S = 'build/dia10/sfx/'; ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
add('clap', 0.6, 0.9); add('epic_boom', 0.55, 0.8, 3.5); add('sparkle', 1.0, 0.6); add('rise', 2.6, 0.5); add('whoosh', 3.35, 0.9); add('zoom_in', 3.45, 0.6)
add('whoosh', T['noteA'] - 0.2, 0.5); add('paper_slide', T['noteA'], 0.8); add('heartbeat', T['noteA'] + 0.6, 0.4, 2.0)
add('whoosh', T['danteA'] - 0.2, 0.5); add('door_chime', T['danteA'], 0.5); add('footsteps', T['danteA'] - 0.2, 0.5, 1.8)
t0 = T['spaA']
while t0 < T['lairA']: add('diffuser_hum', t0, 0.22, 10.0); t0 += 10.0
add('whoosh', T['spaA'] - 0.2, 0.7); add('door_chime', T['spaA'], 0.4); add('footsteps', T['renA'] - 0.5, 0.4, 1.5)
add('uvlamp', T['dermoA'], 0.5, 2.4); add('laser_zap', T['dermoA'] + 0.8, 0.4, 1.5); add('smoke_poof', T['maskA'] - 3.2, 0.5, 2.0); add('jar_open', T['maskA'], 0.7, 1.6); add('whoosh', T['maskA'] - 0.2, 0.5); add('gel_squish', T['maskA'] + 1.6, 0.8, 1.8); add('sponge', T['maskA'] + 2.6, 0.5, 1.5)
add('whoosh', T['fakeA'] - 0.2, 0.5); add('bottle_clink', T['fakeA'] + 0.2, 0.7, 1.5); add('sizzle', T['fakeA'] + 1.2, 0.6, 2.0); add('rise', T['fakeA'] + 0.5, 0.4)
add('gasp', L['l9']['start'], 0.7, 1.2); add('impact', L['l9']['start'] + 0.1, 0.5, 1.0)
add('whoosh', T['realA'] - 0.2, 0.5); add('serum_drop', T['realA'] + 0.8, 0.9, 1.6); add('ding', T['realA'] + 2.2, 0.6); add('shine', T['realA'] + 2.0, 0.4)
add('whoosh', T['weeksA'] - 0.2, 0.6); add('clock_tick', T['weeksA'], 0.5, 3.0); add('sparkle', T['weeksA'] + 4.4, 0.6); add('shine', T['weeksA'] + 4.6, 0.5)
add('curtain', T['revealA'] - 0.1, 0.9, 2.5); add('epic_boom', T['revealA'] + 0.2, 0.7, 3.0); add('sparkle', T['revealA'] + 1.0, 0.7); add('shine', T['revealA'] + 1.2, 0.6); add('wow', T['revealA'] + 1.6, 0.5)
add('whoosh', T['tonicA'] - 0.2, 0.6); add('bottle_clink', T['tonicA'] + 0.2, 0.5, 1.0); add('spray_hiss', T['tonicA'] + 0.8, 0.9, 2.2)
add('rustle', T['fallA'] - 0.2, 0.7, 2.0); add('hairstuck', T['fallA'] + 0.3, 0.7, 2.0); add('gasp', T['fallA'] + 0.8, 0.9, 1.4); add('heart_fast', T['fallA'] + 1.0, 0.6, 3.5); add('impact', T['fallA'] + 1.8, 0.8, 1.2); add('rustle', T['fallA'] + 2.0, 0.6, 2.5)
add('rise', T['mvoice'] - 0.5, 0.5); add('ghost', T['mvoice'] - 0.2, 0.5); add('impact', T['mvoice'], 0.7, 1.2); add('whoosh', T['lairA'] - 0.2, 0.7); add('monitor_beeps', T['lairA'], 0.5, 6.0); add('chair_swivel', T['lairA'] + 0.5, 0.8, 2.5); add('evil_chuckle', T['danteB'] + 0.4, 0.8, 3.0); add('whisper', T['mvoice'] + 0.4, 0.4)
add('whoosh', T['homeA'] - 0.2, 0.7); add('zoom_in', T['homeA'], 0.5); add('sigh_sad', T['homeA'] + 0.8, 0.7, 2.5); add('sob', T['homeA'] + 2.4, 0.4, 2.0)
add('whoosh', T['vote'], 0.5); add('pop', T['optA'], 0.6); add('pop', T['optB'], 0.6); add('ding', T['cta1'], 0.55); add('ding', T['cta2'], 0.55)
inp = ['-i', 'build/dia10/voces.wav', '-i', 'build/dia10/musica.wav']
fc = ["[1:a]volume=0.65[m0]"]; labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 2 + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia10/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
