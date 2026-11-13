# Mezcla del Dia 4: voces (narrador, Mari, Vero, Memo) + efectos reales + ambiente de salon + musica con ducking.
import json, subprocess, numpy as np, wave
tl = json.load(open('build/dia06/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia06/lines.json')); L = {l['id']: l for l in d['lines']}
import unicodedata
DUR = D
d = json.load(open('build/dia06/lines.json')); L = {l['id']: l for l in d['lines']}
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
tens = [(T['neonA'] - 0.2, T['neonB'] - 3.0)]
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
for t0 in (T['sewB'], T['curtainOpen'], T['runA']):
    for i, m in enumerate([74, 78, 81, 86, 90]): put(pluck(N(m), 1.1, 1.0), t0 + i * 0.1, 0.2, 0.5)
put(pad([N(62), N(66), N(69), N(74)], 6.0, 0.8), T['curtainOpen'], 0, 0.7)
mus = np.clip(mus, -1, 1) * 0.5
with wave.open('build/dia06/musica.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mus * 32767).astype('<i2').tobytes())
S = 'build/dia06/sfx/'; ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
add('clap', 0.7, 0.9); add('whoosh', T['slateEnd'] - 0.1, 0.5)
add('city_night', 0.0, 0.5, 10.8); add('car_idle', 0.4, 0.5, 4.0); add('limo_door', T['limoOut'] - 0.5, 0.9); add('footsteps', T['limoOut'] + 0.1, 0.55, 3.8); add('footsteps', T['limoOut'] + 3.9, 0.5, 3.4)
add('paparazzi', T['limoOut'] + 0.5, 0.7, 3.5); add('paparazzi', T['limoOut'] + 4.0, 0.6, 3.5)
t0 = T['sceneB']
while t0 < T['runA']: add('boutique_amb', t0, 0.35, 10.0); t0 += 10.0
add('bell_boutique', T['sceneB'] + 0.1, 0.7); add('rustle', L['l3']['start'] + 0.2, 0.4)
add('tape_measure', T['measureA'], 0.9); add('tape_measure', T['measureA'] + 2.6, 0.7); add('lamp_click', T['measureA'] - 0.2, 0.5)
add('neon_pop', T['neonA'] - 0.1, 0.9); add('gasp', T['neonA'] + 0.1, 0.6, 1.4); add('record_scratch', L['l8']['start'] - 0.1, 0.8); add('whoosh', T['neonB'], 0.6)
add('cloth_cut', w('l9', 'cortar') - 0.1, 0.9); add('sew_machine', w('l9', 'coser') - 0.1, 0.8, 3.6); add('zipper', T['sewB'], 0.8); add('shine', T['sewB'] + 0.3, 0.6)
add('sparkle', T['jewelA'], 0.6); add('ding', T['jewelA'] + 0.3, 0.5); add('heel_step', T['heelsA'], 0.8)
add('curtain', T['curtainA'] - 0.1, 0.9); add('heartbeat', T['curtainA'], 0.4, 2.0); add('curtain', T['curtainOpen'] - 0.25, 0.9); add('spotlight', T['curtainOpen'], 0.8); add('shine', T['curtainOpen'] + 0.2, 0.8); add('wow', T['curtainOpen'] + 0.3, 0.7); add('sparkle', T['curtainOpen'] + 0.5, 0.6)
add('cheer', T['curtainOpen'] + 0.8, 0.6, 4.0)
add('whoosh', T['runA'] - 0.2, 0.6); add('city_night', T['runA'], 0.5, 10.0)
add('heels', T['runWalkA'], 0.9, 3.5); add('bell_boutique', T['envA'] - 0.2, 0.7); add('rustle', T['envA'] + 0.8, 0.6); add('sparkle', T['envB'], 0.6); add('whoosh', T['hookA'] - 0.2, 0.6)
add('rise', T['hookA'] - 0.4, 0.4); add('gasp', T['hookA'] - 0.1, 0.6, 1.4); add('ding', T['hookA'], 0.6)
add('whoosh', T['vote'], 0.5); add('pop', T['optA'], 0.6); add('pop', T['optB'], 0.6); add('ding', T['cta1'], 0.55); add('ding', T['cta2'], 0.55)
for t0 in (T['measureA'] - 0.1, T['sewA'] - 0.1, T['jewelA'] - 0.1, T['envA']): add('pop', t0 + 0.05, 0.5)
inp = ['-i', 'build/dia06/voces.wav', '-i', 'build/dia06/musica.wav', '-stream_loop', '-1', '-i', S + 'salon_amb.mp3']
fc = ["[1:a]volume=0.5[m0]", f"[2:a]atrim=0:{D},asetpts=PTS-STARTPTS,volume=0.0,adelay=1600|1600[amb]"]; labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 3 + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx][amb]amix=inputs=4:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia06/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
