# Mezcla del ESPECIAL: voces (narrador, Dante, Memo) + efectos reales + musica epica sintetizada con ducking (silencio antes de la revelacion y golpe).
import json, subprocess, numpy as np, wave, unicodedata
tl = json.load(open('build/dia10/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia10/lines.json')); L = {l['id']: l for l in d['lines']}
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
beat = 60 / 104
up = [([57, 61, 64, 69], 45), ([62, 66, 69, 74], 50), ([59, 62, 66, 71], 47), ([55, 59, 62, 67], 43)]
sad = [([57, 60, 64, 69], 45), ([53, 57, 60, 65], 41), ([55, 58, 62, 67], 43), ([52, 55, 59, 64], 40)]
t = 1.6; bar = 0
while t < D - 1:
    lair = t >= T['lairA'] - 0.2 and t < T['homeA'] - 0.2
    mel = T['homeA'] - 0.2 <= t < T['vote'] - 0.2
    epic = T['revealA'] <= t < T['tonicA']
    if lair:
        put(pad([N(45), N(48) * 1.0595, N(52) * 0.99, N(57)], 4 * beat, 0.5), t, 0, 0.9); put(pluck(N(33), 4 * beat, 0.7), t, 0, 0.9)
        for k in range(8): put(pluck(N(45 + (k % 3) * 3), beat * 0.4, 0.5), t + k * beat / 2, -0.2 if k % 2 else 0.2, 0.25)
    else:
        ch, root = (sad if mel else up)[bar % 4]
        g = 0.4 if mel else 0.6
        put(pad([N(m) for m in ch], 4 * beat, 0.5), t, 0, g)
        put(pluck(N(root - 12), beat * 1.5, 0.8), t, 0, 0.7); put(pluck(N(root - 12 + 7), beat, 0.6), t + 2 * beat, 0, 0.55)
        for k, idx in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): put(pluck(N(ch[idx] + 12), beat * 0.5, 0.7), t + k * beat / 2, -0.3 if k % 2 else 0.3, 0.2 if mel else 0.38)
        if epic:
            for k in range(8): put(pluck(N(root - 24), beat * 0.4, 0.9), t + k * beat / 2, 0, 0.5)
    t += 4 * beat; bar += 1
put(riser(T['revealA'] - 0.2 - (T['revealA'] - 2.4), 150, 1800, 0.4), T['revealA'] - 2.4, 0, 1.0)
for i, m in enumerate([62, 66, 69, 74]): put(pluck(N(m), 2.0, 1.0), T['revealA'] + i * 0.08, 0.2, 0.55)
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
add('smoke_poof', T['maskA'] - 1.8, 0.5, 2.0); add('jar_open', T['maskA'], 0.7, 1.6); add('whoosh', T['maskA'] - 0.2, 0.5); add('gel_squish', T['maskA'] + 1.6, 0.8, 1.8); add('sponge', T['maskA'] + 2.6, 0.5, 1.5)
add('whoosh', T['fakeA'] - 0.2, 0.5); add('bottle_clink', T['fakeA'] + 0.2, 0.7, 1.5); add('sizzle', T['fakeA'] + 1.2, 0.6, 2.0); add('rise', T['fakeA'] + 0.5, 0.4)
add('gasp', L['l7']['start'], 0.7, 1.2); add('impact', L['l7']['start'] + 0.1, 0.5, 1.0)
add('whoosh', T['realA'] - 0.2, 0.5); add('serum_drop', T['realA'] + 0.8, 0.9, 1.6); add('ding', T['realA'] + 2.2, 0.6); add('shine', T['realA'] + 2.0, 0.4)
add('whoosh', T['weeksA'] - 0.2, 0.6); add('clock_tick', T['weeksA'], 0.5, 3.0); add('sparkle', T['weeksA'] + 4.4, 0.6); add('shine', T['weeksA'] + 4.6, 0.5)
add('curtain', T['revealA'] - 0.1, 0.9, 2.5); add('epic_boom', T['revealA'] + 0.2, 0.7, 3.0); add('sparkle', T['revealA'] + 1.0, 0.7); add('shine', T['revealA'] + 1.2, 0.6); add('wow', T['revealA'] + 1.6, 0.5)
add('whoosh', T['tonicA'] - 0.2, 0.6); add('bottle_clink', T['tonicA'] + 0.2, 0.5, 1.0); add('spray_hiss', T['tonicA'] + 0.8, 0.9, 2.2)
add('rustle', T['fallA'] - 0.2, 0.7, 2.0); add('hairstuck', T['fallA'] + 0.3, 0.7, 2.0); add('gasp', T['fallA'] + 0.8, 0.9, 1.4); add('heart_fast', T['fallA'] + 1.0, 0.6, 3.5); add('impact', T['fallA'] + 1.8, 0.8, 1.2); add('rustle', T['fallA'] + 2.0, 0.6, 2.5)
add('rise', T['mvoice'] - 0.5, 0.5); add('ghost', T['mvoice'] - 0.2, 0.5); add('impact', T['mvoice'], 0.7, 1.2); add('whoosh', T['lairA'] - 0.2, 0.7); add('monitor_beeps', T['lairA'], 0.5, 6.0); add('chair_swivel', T['lairA'] + 0.5, 0.8, 2.5); add('evil_chuckle', T['danteB'] + 0.4, 0.8, 3.0); add('whisper', T['mvoice'] + 0.4, 0.4)
add('whoosh', T['homeA'] - 0.2, 0.7); add('zoom_in', T['homeA'], 0.5); add('sigh_sad', T['homeA'] + 0.8, 0.7, 2.5); add('sob', T['homeA'] + 2.4, 0.4, 2.0)
add('whoosh', T['vote'], 0.5); add('pop', T['optA'], 0.6); add('pop', T['optB'], 0.6); add('ding', T['cta1'], 0.55); add('ding', T['cta2'], 0.55)
inp = ['-i', 'build/dia10/voces.wav', '-i', 'build/dia10/musica.wav']
fc = ["[1:a]volume=0.5[m0]"]; labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 2 + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia10/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
