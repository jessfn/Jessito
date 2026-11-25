# Mezcla del ESPECIAL: voces (narrador, Dante, Memo) + efectos reales + musica epica sintetizada con ducking (silencio antes de la revelacion y golpe).
import json, subprocess, numpy as np, wave, unicodedata
tl = json.load(open('build/dia18/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia18/lines.json')); L = {l['id']: l for l in d['lines']}
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
def lowpass(x, k=40):
    return np.convolve(x, np.ones(k) / k, mode='same')
def stab(freqs, dur, vel=0.6):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs: s += (2 * ((f * t) % 1) - 1) * 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * f * 1.003 * t)) * 0.3
    s = lowpass(s / len(freqs), 10) * np.exp(-t * 7) * (1 - np.exp(-t * 400)) * vel
    return s
def sub_bass(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * 2.4) * (1 - np.exp(-t * 200)) * vel
def noise_sweep(dur, vel=0.4, up=True):
    n = int(dur * SR); t = np.arange(n) / SR; x = rs.randn(n); x = x - lowpass(x, 40 if up else 8); k = (t / dur) if up else (1 - t / dur); return x * k ** 2 * vel
def ofh(vel=0.3):
    n = int(0.22 * SR); t = np.arange(n) / SR; x = rs.randn(n); x = x - lowpass(x, 5); return x * np.exp(-t * 14) * vel
FM = [([53, 56, 60, 63], 41), ([49, 53, 56, 60], 37), ([51, 54, 58, 61], 39), ([48, 51, 55, 58], 36)]   # fa menor: Fm7 - Dbmaj7ish - Ab - Eb
DM = [([57, 60, 64, 67], 45), ([53, 57, 60, 64], 41), ([55, 59, 62, 66], 43), ([52, 55, 59, 62], 40)]
SEC = [
 (0.0, T['slateA'], 'creepy', 70), (T['slateA'], T['slateEnd'], 'slate', 80), (T['slateEnd'], T['enterA'], 'lofi', 72), (T['enterA'], T['cleanA'], 'lofi', 84),
 (T['cleanA'], T['shadowA'], 'lofi', 90), (T['shadowA'], T['mirrorA'], 'glam', 96), (T['mirrorA'], T['ringA'], 'glam', 96),
 (T['ringA'], T['flashA'], 'tick', 90), (T['flashA'], T['l17A'], 'creepy', 70), (T['l17A'], T['vote'] - 0.1, 'tick', 80), (T['vote'] - 0.1, D, 'hook', 118)]
for (a0, b0, sty, bpm) in SEC:
    be, starts = secs(a0, b0, bpm)
    for bar, t in enumerate(starts):
        L4 = min(4 * be, b0 - t); ch, root = FM[bar % 4]
        if sty == 'slate':
            put(pad([N(53), N(60), N(65)], L4 + 1, 0.6), t, 0, 0.6); put(timp(55, 2.0, 1.0), 0.55, 0, 0.9)
        elif sty == 'lofi':
            for k, idx in enumerate([0, 1, 2, 3, 2, 1, 2, 0]): put(piano(N(ch[idx] + 12), 1.6, 0.8), t + k * be / 2, 0.15, 0.36)
            put(pad([N(m) for m in ch[:3]], L4, 0.3, 1.2), t, 0, 0.4); put(sub_bass(N(root - 12), be * 3, 0.9), t, 0, 0.5)
        elif sty in ('house', 'house_t', 'groove', 'drop', 'hook'):
            heavy = sty in ('groove', 'drop', 'hook')
            for k in range(4): put(kick(0.9), t + k * be, 0, 0.75 if heavy else 0.6)
            for k in range(4): put(ofh(0.5 if heavy else 0.35), t + (k + 0.5) * be, 0.2, 0.55)
            for k in (1, 3): put(clapd(0.8), t + k * be, 0, 0.5)
            for k in range(8): put(hat(0.28), t + k * be / 2 + be / 4, -0.2, 0.4)
            for k in range(8): put(saw_bass(N(root - 12 + (0 if k % 4 != 3 else 7)), be * 0.45, 0.9), t + k * be / 2, 0, 0.42 if heavy else 0.32)
            for k, off in enumerate([0, 1.5, 2.5, 3.5]): put(stab([N(m + 12) for m in ch], be * 0.5, 0.7), t + off * be, 0.2 * (-1 if k % 2 else 1), 0.34 if heavy else 0.24)
            if sty in ('drop', 'hook'):
                for k, idx in enumerate([0, 2, 3, 2, 1, 3, 2, 1]): put(pluck(N(ch[idx] + 24), 0.22, 0.8, 1.6), t + k * be / 2, -0.3 if k % 2 else 0.3, 0.3)
        elif sty == 'tech':
            for k in range(4): put(kick(0.7), t + k * be, 0, 0.5)
            for k in range(16): put(pluck(N(ch[[0, 2, 1, 3][k % 4]] + 24 + (12 if k % 8 > 4 else 0)), 0.14, 0.7, 1.8), t + k * be / 4, -0.3 if k % 2 else 0.3, 0.26)
            put(sub_bass(N(root - 12), be * 3, 0.9), t, 0, 0.5)
        elif sty == 'build':
            for k in range(4 + bar * 2): put(kick(0.7), t + k * be * (4 / (4 + bar * 2)), 0, 0.55)
            put(noise_sweep(L4, 0.5), t, 0, 0.6); put(strings([N(m) for m in ch[:3]], L4 + 0.3, 0.6, att=0.4), t, 0, 0.55)
            for k in range(8 + 4 * bar): put(hat(0.3), t + k * L4 / (8 + 4 * bar), 0, 0.4)
        elif sty == 'blackout':
            put(pad([N(m - 12) for m in ch[:3]], L4, 0.3, 1.0), t, 0, 0.5); put(timp(36, 2.5, 1.0), t, 0, 0.5)
        elif sty == 'villain':
            put(pad([N(40), N(44), N(47)], L4, 0.4, 0.8), t, 0, 0.55)
            for k in range(8): put(saw_bass(N(33 + (k % 3 == 2) * 3), be * 0.4, 0.9), t + k * be / 2, 0, 0.45)
            for k in (0, 2): put(kick(0.9), t + k * be, 0, 0.6)
        elif sty == 'tick':
            for k in range(8): put(hat(0.5, 0.03), t + k * be / 2, 0.3 if k % 2 else -0.3, 0.5)
            put(strings([N(m) for m in ch[:2]], L4, 0.4, trem=0.7, att=0.4), t, 0, 0.5); put(kick(0.7), t, 0, 0.5)
        elif sty == 'glam':
            put(strings([N(m) for m in ch], L4 + 0.5, 0.7, att=0.6), t, 0, 0.7); put(choir([N(m + 12) for m in ch[:3]], L4 + 0.6, 0.6), t, 0, 0.55)
            for k, idx in enumerate([3, 2, 1, 0, 1, 2, 3, 2]): put(bell(N(ch[idx] + 24), 1.6, 0.8), t + k * be / 2, 0.3 if k % 2 else -0.3, 0.28)
            put(sub_bass(N(root - 12), be * 3, 0.9), t, 0, 0.5)
        elif sty == 'creepy':
            put(pad([N(m - 12) for m in ch[:3]], L4, 0.3, 1.0), t, 0, 0.45)
            for k, idx in enumerate([2, 0, 1, 0]): put(bell(N(ch[idx] + 24), 1.4, 0.7), t + k * 1.3 * be, 0.3 if k % 2 else -0.3, 0.26)
put(riser(2.0, 150, 1500, 0.45), T['ringA'] - 2.0, 0, 0.6); put(timp(36, 3.0, 1.0), T['ringA'], 0, 0.9); put(timp(40, 2.0, 1.0), T['flashA'] + 1.7, 0, 0.8); put(riser(2.5, 150, 1800, 0.45), T['flashA'] - 0.5, 0, 0.7)
for i, m in enumerate([65, 69, 72, 76]): put(pluck(N(m), 2.0, 1.0), T['mirrorA'] + i * 0.08, 0.2, 0.5)
put(timp(38, 2.2, 1.0), T['slateA'] + 0.55, 0, 0.9)
mus = np.clip(mus, -1, 1) * 0.5
with wave.open('build/dia18/musica.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mus * 32767).astype('<i2').tobytes())
S = 'build/dia18/sfx/'; ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
t0 = 0.0
while t0 < T['slateA']: add('lair_amb', t0, 0.45, 10.0); t0 += 10.0
add('heartbeat5', 0.6, 0.35, 4.0); add('villain_laugh', L['i2']['end'] - 0.9, 0.4, 3.0); add('whoosh5', T['slateA'] - 0.1, 0.7); add('boom5', T['slateA'] + 0.55, 0.9, 2.5); add('riser5', T['slateA'] + 1.2, 0.5, 2.5); add('whoosh5', T['slateA'] + 3.3, 0.7)
t0 = T['hookA']
while t0 < T['enterA']: add('night_amb', t0, 0.3, 10.0); t0 += 10.0
add('porch_steps', T['hookA'] + 0.1, 0.55, 5.0); add('whoosh5', T['enterA'] - 0.3, 0.6)
t0 = T['enterA']
while t0 < T['ringA']: add('home_amb', t0, 0.3, 10.0); t0 += 10.0
add('sofa_creak', T['sitA'], 0.7, 2.0); add('whoosh5', T['micA'] - 0.2, 0.5); add('cotton_wipe', T['cleanA'], 0.8, 3.0); add('whoosh5', T['creamA'] - 0.2, 0.5); add('jar_open', T['creamA'] + 0.1, 0.8, 2.5)
add('whoosh5', T['baseA'] - 0.2, 0.5); add('sponge_pat', T['baseA'] + 0.1, 0.8, 3.0); add('whoosh5', T['shadowA'] - 0.4, 0.5); add('palette_brush', T['shadowA'] + 0.1, 0.8, 3.0); add('sparkle3', T['shadowB'] - 0.5, 0.5, 2.0)
add('whoosh5', T['linerA'] - 0.2, 0.5); add('liner_stroke', T['linerA'] + 0.2, 0.8, 2.5); add('whoosh5', T['blushA'] - 0.2, 0.5); add('palette_brush', T['blushA'] + 0.2, 0.7, 2.5); add('whoosh5', T['lipsA'] - 0.2, 0.5); add('lipstick_twist', T['lipsA'] + 0.1, 0.8, 2.5)
add('mirror_sparkle2', T['mirrorA'], 0.8, 3.0)
add('phones_ring3', T['ringA'], 0.9, 3.9); add('news_sting', T['newsA'], 0.7, 3.0); add('heartbeat6', T['l15A'], 0.55, 4.0); add('flash_whoosh', T['flashA'] - 0.2, 0.8, 2.5); add('car_door_flash', T['flashA'] + 1.2, 0.8, 3.5); add('tension3', T['flashA'], 0.5, 3.0)
add('hair_tug', T['l18A'] + 0.9, 0.7, 2.0); add('heartbeat6', T['l18A'], 0.4, 4.0)
add('whoosh5', T['vote'], 0.5); add('pop5', T['optA'], 0.7); add('pop5', T['optB'], 0.7); add('pop5', T['cta1'], 0.55); add('pop5', T['cta2'], 0.55)
inp = ['-i', 'build/dia18/voces.wav', '-i', 'build/dia18/musica.wav']
fc = ["[1:a]volume=0.65[m0]"]; labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 2 + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia18/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
