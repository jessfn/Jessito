# Mezcla del ESPECIAL: voces (narrador, Dante, Memo) + efectos reales + musica epica sintetizada con ducking (silencio antes de la revelacion y golpe).
import json, subprocess, numpy as np, wave, unicodedata
tl = json.load(open('build/dia08/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia08/lines.json')); L = {l['id']: l for l in d['lines']}
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
beat = 60 / 96
minor = [([57, 60, 64, 69], 45), ([53, 57, 60, 65], 41), ([55, 59, 62, 67], 43), ([52, 55, 59, 64], 40)]
bright = [([62, 66, 69, 74], 50), ([59, 62, 66, 71], 47), ([55, 59, 62, 67], 43), ([57, 61, 64, 69], 45)]
t = 1.6; bar = 0
while t < D - 1:
    lair = (T['lairA'] - 0.2 <= t < T['lairB']) or t >= T['lairB2'] - 0.2
    after = T['flash'] <= t < T['mirrorA'] - 0.2
    tense = (T['laserA'] - 0.3 <= t < T['flash'] - 0.1) or (T['droneA'] - 0.3 <= t < T['droneB'])
    if lair:
        put(pad([N(45), N(48) * 1.0595, N(52) * 0.99, N(57)], 4 * beat, 0.5), t, 0, 0.9); put(pluck(N(33), 4 * beat, 0.7), t, 0, 0.9)
        for k in range(8): put(pluck(N(45 + (k % 3) * 3), beat * 0.4, 0.5), t + k * beat / 2, -0.2 if k % 2 else 0.2, 0.25)
    else:
        ch, root = (bright if after else minor)[bar % 4]
        g = 0.85 if after else (0.45 if tense else 0.55)
        put(pad([N(m) for m in ch], 4 * beat, 0.5), t, 0, g)
        put(pluck(N(root - 12), beat * 1.5, 0.8), t, 0, 0.7); put(pluck(N(root - 12 + 7), beat, 0.6), t + 2 * beat, 0, 0.55)
        for k, idx in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): put(pluck(N(ch[idx] + (24 if after else 12)), beat * 0.5, 0.7), t + k * beat / 2, -0.3 if k % 2 else 0.3, 0.5 if after else (0.45 if tense else 0.35))
    t += 4 * beat; bar += 1
put(riser(T['flash'] - T['laserA'] + 0.1, 150, 2400, 0.5), T['laserA'] - 0.1, 0, 1.0); put(riser(T['droneB'] - T['droneA'], 200, 1400, 0.35), T['droneA'], 0, 1.0)
for i, m in enumerate([62, 66, 69, 74, 78, 81, 86]): put(pluck(N(m), 2.4, 1.0), T['flash'] + i * 0.07, 0.2, 0.7)
put(pad([N(50), N(57), N(62), N(66), N(74)], 6.0, 0.9, 0.2), T['flash'], 0, 1.0)
for t0 in (T['serumA'] + 2.4, T['planeA'] + 0.3):
    for i, m in enumerate([74, 78, 81, 86, 90]): put(pluck(N(m), 1.0, 1.0), t0 + i * 0.1, 0.2, 0.4)
mus = np.clip(mus, -1, 1) * 0.5
with wave.open('build/dia08/musica.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mus * 32767).astype('<i2').tobytes())
S = 'build/dia08/sfx/'; ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
add('epic_boom', 0.35, 0.8, 3.5); add('sparkle', 1.0, 0.6); add('shine', 1.9, 0.6); add('whoosh', 2.3, 0.5)
t0 = T['slateEnd']
while t0 < T['lairA']: add('backstage_amb', t0, 0.25, 10.0); t0 += 10.0
add('whoosh', T['planeA'] - 0.3, 0.5); add('paper_flight', T['planeA'], 0.9, 2.5); add('sparkle', T['planeA'] + 1.8, 0.5)
add('whoosh', T['noteA'] - 0.2, 0.5); add('paper_slide', T['noteA'], 0.8); add('heartbeat', T['noteA'] + 0.6, 0.4, 2.5)
add('door_chime', T['enter'] - 0.1, 0.5); add('footsteps', T['enter'], 0.5, 2.0)
add('whoosh', T['numbA'] - 0.35, 0.5); add('jar_open', T['numbA'] + 0.8, 0.8, 2.5); add('spray_hiss', T['numbA'] + 1.6, 0.6, 1.8); add('whoosh', T['dermoA'] - 0.35, 0.5); add('scanner_beep', T['dermoA'], 0.8, 2.0); add('sparkle', T['dermoA'] + 1.2, 0.5)
add('whoosh', T['droneA'] - 0.2, 0.6); add('drone_buzz', T['droneA'], 0.9, 3.0); add('bottle_clink', T['droneA'] + 1.2, 0.8, 1.5); add('alarm_blip', T['droneA'] + 2.7, 0.6, 1.8)
add('whoosh', T['lairA'] - 0.2, 0.6); add('monitor_beeps', T['lairA'], 0.5, 4.0); add('glove_snap', T['lairA'] + 0.6, 0.6, 1.8); add('rise', T['lairA'] - 0.3, 0.4)
add('tools_clink', L['l7']['start'] + 0.5, 0.5, 1.5); add('door_chime', L['l7']['start'] + 1.5, 0.3)
add('whoosh', T['laserA'] - 0.3, 0.6); add('laser_zap', T['laserA'] + 0.7, 0.9, 3.0); add('sizzle_soft', T['flash'] - 0.5, 0.8, 2.0); add('epic_boom', T['flash'] - 0.1, 0.9, 3.5); add('shine', T['flash'] + 0.2, 0.8); add('sparkle', T['flash'] + 0.4, 0.7); add('gasp', T['flash'] + 0.3, 0.5, 1.4)
add('whoosh', T['serumA'] - 0.3, 0.5); add('serum_drop', T['serumA'] + 1.3, 0.9, 1.2); add('patch_press', T['serumA'] + 2.4, 0.9, 1.2); add('ding', T['serumA'] + 2.6, 0.5); add('wow', T['serumA'] + 2.9, 0.5)
add('rise', T['mirrorA'] + 1.2, 0.5); add('whisper', T['mirrorA'] + 2.0, 0.5); add('impact', T['mirrorA'] + 2.6, 0.7, 1.2); add('heartbeat_slow', T['mirrorA'] + 0.5, 0.8, 4.0)
add('chair_swivel', L['l10']['start'] - 0.3, 0.8, 2.5); add('monitor_beeps', T['lairB2'], 0.45, 8.0); add('evil_chuckle', T['mSmile'], 0.8, 3.0)
add('whoosh', T['vote'], 0.5)
add('pop', T['optA'], 0.6); add('pop', T['optB'], 0.6); add('ding', T['cta1'], 0.55); add('ding', T['cta2'], 0.55)
inp = ['-i', 'build/dia08/voces.wav', '-i', 'build/dia08/musica.wav']
fc = ["[1:a]volume=0.5[m0]"]; labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = 2 + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=400[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia08/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
