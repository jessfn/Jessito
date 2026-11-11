# Mezcla del Dia 3: voces (varias) + efectos reales (ElevenLabs sound-generation) + ambiente + musica con ducking.
import json, subprocess, numpy as np, wave, os
tl = json.load(open('build/dia03/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia03/lines.json')); L = {l['id']: l for l in d['lines']}
def w(id, word, n=0):
    nm = lambda x: ''.join(c for c in __import__('unicodedata').normalize('NFD', x.lower()) if c.isalnum())
    return [x for x in L[id]['words'] if nm(x[0]) == nm(word)][n][1]
SR = 44100
# ---------------- musica sintetizada (pizzicato + pad + bajo) ----------------
def pluck(f, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.exp(-t * 7.0) * (1 - np.exp(-t * 400))
    s = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 12) + 0.25 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 18))
    return s * env * vel
def pad(freqs, dur, vel=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-0.6, 0.0, 0.6): s += np.sin(2 * np.pi * (f + det) * t + det)
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)
    return s / (3 * len(freqs)) * env * vel
N = lambda m: 440.0 * 2 ** ((m - 69) / 12)
total = int(D * SR); mus = np.zeros((total, 2))
def put(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= total: return
    j = min(total, i + len(sig)); seg = sig[:j - i] * gain
    mus[i:j, 0] += seg * (1 - max(0, pan)); mus[i:j, 1] += seg * (1 + min(0, pan))
bpm = 104; beat = 60 / bpm
prog = [([60, 64, 67, 71], 48), ([57, 60, 64, 67], 45), ([53, 57, 60, 64], 41), ([55, 59, 62, 65], 43)]
dark0, dark1 = T['dark'], T['power']
t = 1.5; bar = 0
while t < D - 1:
    ch, root = prog[bar % 4]; tension = dark0 <= t < dark1
    if tension:
        put(pad([N(45), N(48) * 1.0595, N(52) * 0.99, N(57)], 4 * beat, 0.5), t, 0, 0.9)
        put(pluck(N(33), 4 * beat, 0.7), t, 0, 0.9)
    else:
        put(pad([N(m) for m in ch], 4 * beat, 0.5), t, 0, 0.55)
        put(pluck(N(root - 12), beat * 1.5, 0.8), t, 0, 0.7); put(pluck(N(root - 12 + 7), beat, 0.6), t + 2 * beat, 0, 0.55)
        pat = [0, 2, 1, 3, 2, 1, 3, 2]
        for k, idx in enumerate(pat):
            put(pluck(N(ch[idx] + 12), beat * 0.5, 0.7), t + k * beat / 2, -0.3 if k % 2 else 0.3, 0.4)
    t += 4 * beat; bar += 1
# resolucion brillante al volver la luz
for i, m in enumerate([72, 76, 79, 84]): put(pluck(N(m), 0.9, 1.0), T['power'] + i * 0.09, 0.2, 0.5)
for i, m in enumerate([72, 76, 79, 84, 88, 91]): put(pluck(N(m), 1.2, 1.0), T['finalA'] + i * 0.11, 0.2, 0.55)
put(pad([N(60), N(64), N(67), N(72)], 5.0, 0.8), T['finalA'], 0, 0.7)
mus = np.clip(mus, -1, 1) * 0.5
with wave.open('build/dia03/musica.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mus * 32767).astype('<i2').tobytes())
# ---------------- efectos ----------------
S = 'build/dia03/sfx/'
ev = []  # (archivo, tiempo, volumen, duracion_max)
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
add('clap', 0.7, 0.9); add('door_chime', 1.7, 0.6); add('footsteps', 2.0, 0.45, 2.4); add('whoosh', T['slateEnd'] - 0.1, 0.5)
add('chair', T['sit'] - 0.15, 0.55, 2.2); add('tools_clink', T['sit'] + 0.4, 0.5, 1.5)
add('tools_clink', L['l5']['start'] + 0.1, 0.55, 1.6)
for n, (a, b, _m) in enumerate(T['closeups']): add('whoosh', a - 0.15, 0.55)
add('xray', T['xrayStart'] - 0.1, 0.7); add('whoosh', T['xrayStart'] - 0.2, 0.5); add('ding', T['xrayStart'] + 1.0, 0.5); add('rise', w('l7', 'pantalla') - 0.3, 0.45)
add('impact', w('l7', 'diente') , 0.45, 1.2)
for k in range(4): add('heartbeat', T['nA'] + 0.3 + 3.0 * k, 0.4, 3.0)
add('needle', T['needle'] + 0.1, 0.9); add('gulp', T['nA'] + 1.2, 0.6)
add('drill', T['drillW'] - 0.1, 0.85, 1.9); add('suction', T['drillW'] - 0.1, 0.5, 2.0)
add('crack', T['crack'] - 0.05, 1.0); add('impact', T['crack'], 0.5, 1.0); add('tooth_drop', T['crack'] + 1.0, 0.8); add('sparkle', T['crack'] + 1.2, 0.5)
add('tools_clink', T['crack'] + 1.6, 0.45, 1.2)
add('power_down', T['dark'] - 0.25, 1.0); add('heartbeat', T['dark'] + 0.8, 0.5, 3.0); add('heartbeat', T['dark'] + 3.8, 0.5, 3.0)
add('flash', L['l17']['start'] - 0.2, 0.7); add('flash', L['l17']['start'] + 0.6, 0.7)
add('suction', T['cA'] + 0.2, 0.5); add('scrape', T['cA'] + 0.4, 0.8); add('scrape', T['cA'] + 3.0, 0.8); add('polish', T['cA'] + 6.1, 0.8, 2.6)
add('power_up', T['power'] - 0.35, 1.0); add('uvlamp', T['whA'] - 0.05, 0.6); add('sparkle', T['whA'] + 2.2, 0.55); add('ding', T['whB'] - 0.2, 0.5)
n = 8
for k in range(n): add('bracket', T['bracketA'] + k * (T['bracketB'] - T['bracketA']) / (n + 0.6), 0.85, 1.0)
add('tools_clink', T['brA'] + 0.2, 0.4, 1.0)
add('sparkle', T['reveal'], 0.5); add('ding', T['mirrorStart'] + 0.2, 0.4)
add('whoosh', T['skipA'] - 0.1, 0.6); add('pageflip', T['skipA'], 0.7, 2.0); add('pageflip', T['skipA'] + 1.8, 0.6, 1.8)
add('unbracket', T['bracesOff'] - 0.15, 0.9); add('whoosh', T['bracesOff'], 0.5); add('ding', T['bracesOff'] + 0.1, 0.6)
add('shine', T['finalA'] + 0.1, 0.8); add('sparkle', T['finalA'] + 0.6, 0.6); add('applause', L['l22d']['start'] - 0.35, 0.7, 3.2); add('sparkle', L['l22d']['start'] + 0.3, 0.5)
add('pop', T['eyebrow'], 0.55); add('gasp', L['l23']['start'] - 0.25, 0.5, 1.2)
add('whoosh', T['vote'], 0.5); add('pop', T['optA'], 0.6); add('pop', T['optB'], 0.6); add('ding', T['cta1'], 0.55); add('ding', T['cta2'], 0.55)
for t0 in (T['xrayStart'], T['nA'], T['drillW'] - 0.1, T['cA'], T['whA'], T['brA']): add('pop', t0 + 0.05, 0.5)
# ---------------- mezcla ----------------
inp = ['-i', 'build/dia03/voces.wav', '-i', 'build/dia03/musica.wav', '-stream_loop', '-1', '-i', S + 'ambience.mp3']
fc = []
fc.append("[1:a]volume=0.55[m0]")
fc.append(f"[2:a]atrim=0:{D},asetpts=PTS-STARTPTS,volume=0.35,volume=enable='between(t,{T['dark']},{T['power'] - 0.2})':volume=0.05,adelay=1500|1500[amb]")
labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 3 + k; ms = int(max(0, t) * 1000)
    trim = f"atrim=0:{dur}," if dur else ""
    fc.append(f"[{i}:a]{trim}asetpts=PTS-STARTPTS,afade=t=out:st={(dur or 0.5) - 0.15 if dur else 0}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]" if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]")
    labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]")
fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx][amb]amix=inputs=4:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '44100', 'build/dia03/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
