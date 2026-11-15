# Mezcla del ESPECIAL: voces (narrador, Dante, Memo) + efectos reales + musica epica sintetizada con ducking (silencio antes de la revelacion y golpe).
import json, subprocess, numpy as np, wave, unicodedata
tl = json.load(open('build/especial/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/especial/lines.json')); L = {l['id']: l for l in d['lines']}
SR = 44100
N = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def pluck(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 12) + 0.25 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 18)) * np.exp(-t * 7.0) * (1 - np.exp(-t * 400)) * vel
def pad(freqs, dur, vel=0.5, att=0.6):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-0.6, 0.0, 0.6): s += np.sin(2 * np.pi * (f + det) * t + det)
    return s / (3 * len(freqs)) * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 0.8) * vel
def riser(dur, f0=200, f1=1800, vel=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / dur) ** 2) / SR
    return (np.sin(ph) * 0.6 + np.random.RandomState(3).randn(n) * 0.15) * (t / dur) ** 1.5 * vel
total = int(D * SR); mus = np.zeros((total, 2))
def put(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= total or i < 0: return
    j = min(total, i + len(sig)); seg = sig[:j - i] * gain
    mus[i:j, 0] += seg * (1 - max(0, pan)); mus[i:j, 1] += seg * (1 + min(0, pan))
beat = 60 / 88
minor = [([57, 60, 64, 69], 45), ([53, 57, 60, 65], 41), ([55, 59, 62, 67], 43), ([52, 55, 59, 64], 40)]
major = [([62, 66, 69, 74], 50), ([59, 62, 66, 71], 47), ([55, 59, 62, 67], 43), ([57, 61, 64, 69], 45)]
t = 1.6; bar = 0
while t < D - 1:
    silent = T['countA'] - 0.1 <= t < T['reveal'] - 0.05
    dark = T['mEnter'] - 0.3 <= t < T['mGone'] + 0.5
    after = T['reveal'] <= t < T['vote'] - 0.2 and not dark
    ch, root = (major if (after or t >= T['vote']) else minor)[bar % 4]
    if silent: pass
    elif dark:
        put(pad([N(45), N(48) * 1.0595, N(52) * 0.99, N(57)], 4 * beat, 0.5), t, 0, 0.9); put(pluck(N(33), 4 * beat, 0.7), t, 0, 0.9)
    else:
        g = 0.85 if after else 0.55
        put(pad([N(m) for m in ch], 4 * beat, 0.5), t, 0, g)
        put(pluck(N(root - 12), beat * 1.5, 0.8), t, 0, 0.7); put(pluck(N(root - 12 + 7), beat, 0.6), t + 2 * beat, 0, 0.55)
        for k, idx in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): put(pluck(N(ch[idx] + (24 if after else 12)), beat * 0.5, 0.7), t + k * beat / 2, -0.3 if k % 2 else 0.3, 0.5 if after else 0.35)
    t += 4 * beat; bar += 1
put(riser(T['reveal'] - T['countA'] + 0.1, 150, 2200, 0.55), T['countA'] - 0.1, 0, 1.0)
for i, m in enumerate([62, 66, 69, 74, 78, 81, 86]): put(pluck(N(m), 2.4, 1.0), T['reveal'] + i * 0.07, 0.2, 0.7)
put(pad([N(50), N(57), N(62), N(66), N(74)], 7.0, 0.9, 0.2), T['reveal'], 0, 1.0)
for t0 in (T['wrap'] + 0.2, T['coilA'] + 1.2, T['coilA'] + 2.6, T['coilA'] + 4.0, T['calmA'] + 1.0):
    for i, m in enumerate([74, 78, 81, 86, 90]): put(pluck(N(m), 1.0, 1.0), t0 + i * 0.1, 0.2, 0.4)
mus = np.clip(mus, -1, 1) * 0.5
with wave.open('build/especial/musica.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mus * 32767).astype('<i2').tobytes())
S = 'build/especial/sfx/'; ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
add('epic_boom', 0.35, 0.8, 3.5); add('sparkle', 1.0, 0.6); add('shine', 1.9, 0.6); add('whoosh', 2.3, 0.5)
t0 = T['slateEnd']
while t0 < T['hallA']: add('backstage_amb', t0, 0.35, 10.0); t0 += 10.0
add('knock3', T['boxA'] - 1.0, 0.8); add('rustle', T['boxA'] - 0.5, 0.4); add('box_open', T['boxA'], 0.9, 2.6); add('sparkle', T['boxA'] + 1.2, 0.55); add('whoosh', T['noteA'] - 0.2, 0.5); add('paper_slide', T['noteA'], 0.8)
add('door_chime', T['enter'] - 0.1, 0.5); add('footsteps', T['enter'], 0.5, 2.0); add('whoosh', T['wrap'] - 0.3, 0.4); add('silk_pull', T['wrap'] - 0.2, 0.9, 1.8); add('sparkle', T['wrap'] + 0.3, 0.6); add('ding', T['wrap'] + 0.5, 0.5)
add('whoosh', T['sprayA'] - 0.35, 0.5); add('spray_hiss', T['sprayA'], 0.9, 2.5); add('whoosh', T['creamA'] - 0.35, 0.5); add('jar_open', T['creamA'], 0.9, 2.5); add('gel_squish', T['creamA'] + 2.3, 0.9, 2.5)
add('whoosh', T['coilA'] - 0.35, 0.5)
for k, dt in enumerate((1.2, 2.6, 4.0)): add('boing_spring', T['coilA'] + dt, 0.6, 1.6)
add('sparkle', T['coilA'] + 0.5, 0.5); add('whoosh', T['diffA'] - 0.3, 0.5); add('diffuser_hum', T['diffA'], 0.7, 4.0); add('heartbeat', T['diffA'] + 2.0, 0.4, 3.0); add('rustle', T['shakeA'], 0.6); add('rise', T['shakeA'] - 0.5, 0.4)
add('door_big_open', T['hallA'] - 0.35, 0.9, 3.5); add('crowd_gasp', T['hallA'] + 0.4, 0.4, 3.0); add('paparazzi', T['hallA'] + 1.2, 0.4, 4.0); add('heels', T['walkA'], 0.6, 5.5)
add('heartbeat_slow', T['countA'], 0.9, 3.0)
add('epic_boom', T['reveal'] - 0.1, 1.0, 3.5); add('silk_pull', T['reveal'] - 0.1, 0.8, 1.8); add('boing_spring', T['reveal'] + 0.15, 0.8, 2.0); add('shine', T['reveal'] + 0.3, 0.8); add('sparkle', T['reveal'] + 0.5, 0.7); add('crowd_gasp', T['reveal'] + 0.4, 0.8, 4.0); add('camera_flashes', T['reveal'] + 1.0, 0.8, 5.0)
add('crowd_chant', T['calmA'], 0.7, 6.0); add('applause', T['calmA'] + 1.0, 0.5, 6.0); add('wow', T['calmA'] + 0.2, 0.6)
add('rise', T['mEnter'] - 0.3, 0.5); add('ghost', T['mEnter'], 0.5); add('glove_snap', T['gloveA'] + 0.8, 0.9); add('whisper', T['mEnter'] + 1.0, 0.5); add('smoke_poof', T['mGone'] - 0.1, 0.9, 2.5)
add('whoosh', T['vote'], 0.5)
for i in range(6): add('pop', T['optA'] + 0.1 + i * 0.22, 0.5)
add('ding', T['cta1'], 0.55); add('ding', T['cta2'], 0.55)
inp = ['-i', 'build/especial/voces.wav', '-i', 'build/especial/musica.wav']
fc = ["[1:a]volume=0.5[m0]"]; labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 2 + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/especial/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
