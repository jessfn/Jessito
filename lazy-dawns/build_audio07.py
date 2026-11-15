# Mezcla del Dia 4: voces (narrador, Mari, Vero, Memo) + efectos reales + ambiente de salon + musica con ducking.
import json, subprocess, numpy as np, wave
tl = json.load(open('build/dia07/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia07/lines.json')); L = {l['id']: l for l in d['lines']}
import unicodedata
DUR = D
d = json.load(open('build/dia07/lines.json')); L = {l['id']: l for l in d['lines']}
def w(id, word, n=0):
    nm = lambda x: ''.join(c for c in unicodedata.normalize('NFD', x.lower()) if c.isalnum())
    return [x for x in L[id]['words'] if nm(x[0]) == nm(word)][n][1]
SR = 44100
def pluck(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 12) + 0.25 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 18)) * np.exp(-t * 7.0) * (1 - np.exp(-t * 400)) * vel
def pad(freqs, dur, vel=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-0.6, 0.0, 0.6): s += np.sin(2 * np.pi * (f + det) * t + det)
    return s / (3 * len(freqs)) * np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8) * vel
N = lambda m: 440.0 * 2 ** ((m - 69) / 12)
total = int(D * SR); mus = np.zeros((total, 2))
def put(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= total: return
    j = min(total, i + len(sig)); seg = sig[:j - i] * gain
    mus[i:j, 0] += seg * (1 - max(0, pan)); mus[i:j, 1] += seg * (1 + min(0, pan))
bpm = 112; beat = 60 / bpm
prog = [([62, 66, 69, 73], 50), ([59, 62, 66, 69], 47), ([55, 59, 62, 66], 43), ([57, 61, 64, 68], 45)]
tens = [(T['outA'] - 0.2, T['outB'] + 0.2), (T['knockA'] - 0.3, T['noteB'])]
t = 1.6; bar = 0
while t < D - 1:
    ch, root = prog[bar % 4]
    if any(a <= t < b for a, b in tens):
        put(pad([N(45), N(48) * 1.0595, N(52) * 0.99, N(57)], 4 * beat, 0.5), t, 0, 0.9); put(pluck(N(33), 4 * beat, 0.7), t, 0, 0.9)
    else:
        put(pad([N(m) for m in ch], 4 * beat, 0.5), t, 0, 0.55)
        put(pluck(N(root - 12), beat * 1.5, 0.8), t, 0, 0.7); put(pluck(N(root - 12 + 7), beat, 0.6), t + 2 * beat, 0, 0.55)
        for k, idx in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): put(pluck(N(ch[idx] + 12), beat * 0.5, 0.7), t + k * beat / 2, -0.3 if k % 2 else 0.3, 0.4)
    t += 4 * beat; bar += 1
for t0 in (T['tapeB'], T['lipA'] + 1.5, T['mirrorA']):
    for i, m in enumerate([74, 78, 81, 86, 90]): put(pluck(N(m), 1.1, 1.0), t0 + i * 0.1, 0.2, 0.5)
put(pad([N(62), N(66), N(69), N(74)], 6.0, 0.8), T['mirrorA'], 0, 0.7)
mus = np.clip(mus, -1, 1) * 0.5
with wave.open('build/dia07/musica.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mus * 32767).astype('<i2').tobytes())
S = 'build/dia07/sfx/'; ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
add('clap', 0.7, 0.9); add('whoosh', T['slateEnd'] - 0.1, 0.5)
add('city_night', 0.0, 0.5, 8.7); add('car_idle', 0.3, 0.45, 2.6); add('limo_door', T['limoOut'] - 0.4, 0.9); add('footsteps', T['limoOut'], 0.55, 3.6); add('paparazzi', T['limoOut'] + 0.3, 0.7, 3.5); add('heels', T['limoOut'] + 1.0, 0.7, 3.5)
t0 = T['sceneB']
while t0 < T['knockA']: add('backstage_amb', t0, 0.4, 10.0); t0 += 10.0
add('door_chime', T['sceneB'], 0.6); add('rustle', T['sitA'], 0.5); add('pop', T['sitA'] + 0.2, 0.4)
add('zoom_in', T['camA'] - 0.1, 0.6)
add('sponge', T['baseA'], 0.8, 2.4); add('zoom_in', T['baseA'] - 0.2, 0.5); add('powderbrush', T['contourA'], 0.8, 2.0); add('sparkle', T['hiA'], 0.55); add('shine', T['hiA'] + 0.2, 0.5)
add('whoosh', T['shadowA'] - 0.4, 0.6); add('brush_sweep', T['shadowA'], 0.7, 3.0); add('brush_blend', T['shadowA'] + 1.2, 0.7, 2.5); add('sparkle', T['shadowB'] - 0.6, 0.5); add('ding', T['shadowB'] - 0.3, 0.5)
add('marker_wing', T['linerA'], 0.9, 2.0); add('zoom_in', T['linerA'] - 0.2, 0.5)
add('glitter_bottle', T['outA'] - 0.1, 1.0, 3.5); add('glitter_shower', T['outA'] + 0.5, 0.8, 2.5); add('heart_fast', T['outA'] + 0.3, 0.5, 2.5); add('gasp', T['outA'] + 0.2, 0.6, 1.4)
add('whoosh', T['tapeA'] - 0.3, 0.5); add('tape_peel', T['tapeA'] + 0.1, 0.9); add('marker_wing', T['tapeA'] + 1.0, 0.9, 2.0); add('ding', T['tapeB'], 0.55)
add('whoosh', T['lashA'] - 0.3, 0.4); add('lashes', T['lashA'], 0.8, 2.2); add('whoosh', T['lipA'] - 0.4, 0.5); add('lipstick', T['lipA'], 0.9, 2.2); add('sparkle', T['lipA'] + 1.6, 0.5)
add('sparkle', T['mirrorA'] + 0.2, 0.6); add('shine', T['mirrorA'] + 0.3, 0.8); add('wow', T['mirrorA'] + 0.8, 0.7)
add('compact', L['l12']['start'] + 0.1, 0.5)
add('whoosh', T['clockA'] - 0.2, 0.5); add('clock_tick', T['clockA'], 0.8, 4.0); add('heartbeat', T['clockA'], 0.4, 3.0)
add('knock3', T['knockA'] - 0.1, 1.0); add('rise', T['knockA'] - 0.3, 0.4); add('paper_slide', T['noteA'] - 0.2, 0.9); add('whisper', T['noteA'] + 0.8, 0.5); add('impact', T['noteA'] + 0.3, 0.6, 1.2); add('hall_amb', T['noteA'] - 0.5, 0.4, 8.0)
add('whoosh', T['vote'], 0.5); add('pop', T['optA'], 0.6); add('pop', T['optB'], 0.6); add('ding', T['cta1'], 0.55); add('ding', T['cta2'], 0.55)
for t0 in (T['baseA'] - 0.1, T['contourA'] - 0.1, T['shadowA'] - 0.1, T['linerA'] - 0.1, T['lipA'] - 0.1): add('pop', t0 + 0.05, 0.5)
inp = ['-i', 'build/dia07/voces.wav', '-i', 'build/dia07/musica.wav', '-stream_loop', '-1', '-i', S + 'salon_amb.mp3']
fc = ["[1:a]volume=0.5[m0]", f"[2:a]atrim=0:{D},asetpts=PTS-STARTPTS,volume=0.0,adelay=1600|1600[amb]"]; labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 3 + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx][amb]amix=inputs=4:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia07/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
