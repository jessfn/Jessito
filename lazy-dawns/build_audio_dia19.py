# Mezcla del Dia 19: voces + instrumentales de suspenso (ElevenLabs Music) por escena + efectos, con ducking bajo la voz.
import json, subprocess
tl = json.load(open('build/dia19/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia19/lines.json')); L = {l['id']: l for l in d['lines']}
S = 'build/dia19/sfx/'; M = 'build/dia19/music/'
# (archivo, inicio en video, duracion usada, fade in, fade out, volumen)
MUS = [('intro', 0.0, T['slateA'] + 0.25, 0.3, 0.5, 0.95), ('home', T['slateA'] + 2.4, T['mirrorA'] - 0.3 - (T['slateA'] + 2.4), 1.6, 0.8, 0.75),
       ('reveal', T['mirrorA'] - 0.45, 4.3, 0.3, 0.7, 0.95), ('tension', T['ringA'] - 0.6, T['vote'] + 0.5 - (T['ringA'] - 0.6), 0.4, 1.0, 0.85),
       ('endcard', T['vote'] - 0.3, D - (T['vote'] - 0.3), 0.8, 0.9, 0.8)]
ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
t0 = 0.0
while t0 < T['slateA']: add('cellar_amb', t0, 0.5, 10.0); t0 += 10.0
add('drip_cellar', 1.0, 0.5, 4.5); add('drip_cellar', 5.6, 0.45, 2.5); add('chair_creak', 0.9, 0.6, 3.2); add('chair_creak', 4.8, 0.5, 2.5); add('heartbeat5', 0.6, 0.35, 4.0); add('villain_laugh', L['i2']['end'] - 0.9, 0.35, 3.0)
add('whoosh5', T['slateA'] - 0.1, 0.7); add('boom5', T['slateA'] + 0.55, 0.9, 2.5); add('riser5', T['slateA'] + 1.2, 0.5, 2.5); add('whoosh5', T['slateA'] + 3.3, 0.7)
t0 = T['hookA']
while t0 < T['ringA']: add('home_amb', t0, 0.28, 10.0); t0 += 10.0
for a in [T['shamA'], T['condA'], T['combA'], T['creamA'], T['diffA'], T['ironA'], T['tieA']]: add('whoosh5', a - 0.25, 0.5)
add('water_wash', T['shamA'] + 0.1, 0.8, 2.6); add('cream_squirt', T['condA'] + 0.1, 0.7, 1.6); add('comb_detangle', T['combA'] + 0.3, 0.8, 3.8); add('cream_squirt', T['creamA'] + 0.2, 0.7, 2.2); add('hairdryer', T['diffA'] + 0.2, 0.55, 3.2)
add('flatiron', T['ironA'] + 0.1, 0.7, 3.2); add('hairtie_snap', T['tieA'] + 0.3, 0.8, 2.2); add('mirror_sparkle2', T['mirrorA'], 0.8, 3.0); add('sparkle3', T['curlA'], 0.5, 2.0)
add('msg_notify', T['ringA'], 0.9, 3.0); add('pop5', T['l9A'] + 0.05, 0.6); add('pop5', T['l10A'], 0.6); add('heartbeat6', T['l9A'], 0.55, 4.0); add('tension3', T['l10A'] - 0.4, 0.5, 3.0)
add('flash_whoosh', T['l12A'] - 0.25, 0.7, 2.0); add('heartbeat6', T['l11A'], 0.5, 4.0)
add('whoosh5', T['vote'], 0.5); add('pop5', T['optA'], 0.7); add('pop5', T['optB'], 0.7); add('pop5', T['cta1'], 0.55); add('pop5', T['cta2'], 0.55); add('pop5', T['cta3'], 0.55)
inp = ['-i', 'audio_dia19/voces.wav']; fc = []; mlabs = []
for k, (f, st, du, fi, fo, v) in enumerate(MUS):
    inp += ['-i', M + f + '.mp3']; i = 1 + k; ms = int(max(0, st) * 1000)
    fc.append(f"[{i}:a]atrim=0:{du:.2f},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0.1, du - fo):.2f}:d={fo},volume={v},adelay={ms}|{ms}[m{k}]"); mlabs.append(f"[m{k}]")
base = 1 + len(MUS); labs = []
for k, (f, t, v, dur) in enumerate(ev):
    inp += ['-i', S + f + '.mp3']; i = base + k; ms = int(max(0, t) * 1000)
    fc.append((f"[{i}:a]atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=out:st={max(0.05, dur - 0.15)}:d=0.15,volume={v},adelay={ms}|{ms}[e{k}]") if dur else f"[{i}:a]volume={v},adelay={ms}|{ms}[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(mlabs) + f"amix=inputs={len(mlabs)}:normalize=0:duration=longest,apad=whole_dur={D},volume=0.62[mus]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={D}[sfx]")
fc.append("[0:a]asplit=2[vo][vsc]"); fc.append("[mus][vsc]sidechaincompress=threshold=0.015:ratio=9:attack=15:release=450[mduck]")
fc.append(f"[vo]volume=1.25[vo2];[vo2][mduck][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia19/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
