# Mezcla del Dia 20: voces + instrumentales de suspenso (ElevenLabs Music) por escena + efectos, con ducking bajo la voz.
import json, subprocess
tl = json.load(open('build/dia20/timeline.json')); T = tl['T']; D = tl['DUR']
d = json.load(open('build/dia20/lines.json')); L = {l['id']: l for l in d['lines']}
S = 'build/dia20/sfx/'; M = 'build/dia20/music/'
# (archivo, inicio en video, duracion usada, fade in, fade out, volumen)
MUS = [('intro', 0.0, T['slateA'] + 0.25, 0.3, 0.5, 0.95), ('home', T['slateA'] + 2.4, T['forestA'] - (T['slateA'] + 2.4) + 0.4, 1.4, 0.6, 0.75),
       ('forest', T['forestA'] - 0.2, T['mariA'] - (T['forestA'] - 0.2) + 0.3, 1.0, 0.4, 0.8), ('chase', T['mariA'] - 0.3, T['policeA'] - (T['mariA'] - 0.3) + 0.4, 0.3, 0.8, 0.9),
       ('safe', T['policeA'] - 0.2, T['vote'] - (T['policeA'] - 0.2) + 0.3, 0.8, 0.6, 0.8), ('endcard', T['vote'] - 0.3, D - (T['vote'] - 0.3), 0.8, 0.9, 0.8)]
ev = []
def add(f, t, v=0.6, dur=None): ev.append((f, t, v, dur))
t0 = 0.0
while t0 < T['slateA']: add('cabin_amb', t0, 0.5, 10.0); t0 += 10.0
add('rope_rub', 0.4, 0.6, 4.0); add('rope_rub', 4.2, 0.5, 2.5); add('chair_creak20', 1.0, 0.5, 3.0); add('chair_creak20', 4.6, 0.45, 2.5); add('heartbeat20', 0.6, 0.35, 5.0); add('villain_growl', L['i2']['start'] - 0.1, 0.55, 3.0)
add('whoosh20', T['slateA'] - 0.1, 0.7); add('boom20', T['slateA'] + 0.55, 0.9, 2.5); add('riser20', T['slateA'] + 1.2, 0.5, 2.5); add('whoosh20', T['slateA'] + 3.3, 0.7)
add('closet_open', T['l2A'] - 0.1, 0.8, 2.0)
for a in [T['vestA'], T['legA'], T['teeA']]: add('whoosh20', a - 0.2, 0.5); add('cloth_swish', a + 0.1, 0.6, 1.6)
add('zip_up', T['dressA'] - 0.3, 0.7, 1.5); add('whoosh20', T['dressA'] - 0.1, 0.7)
t0 = T['forestA']
while t0 < T['policeA']: add('forest_night_amb', t0, 0.4, 12.0); t0 += 12.0
add('footsteps_leaves', T['forestA'], 0.65, 5.0); add('twig_snap', T['l4A'] - 0.7, 0.7, 1.5); add('stinger20', T['l4A'] - 0.4, 0.5, 2.0); add('heartbeat20', T['l4A'], 0.5, 5.0); add('villain_growl', T['l5A'], 0.35, 3.0)
add('phone_rec_beep', T['recA'], 0.8, 1.0); add('heartbeat20', T['recA'], 0.45, 5.0); add('phone_tap', T['pubA'] + 0.3, 0.8, 0.6)
add('stinger20', T['mariA'], 0.6, 2.0); add('branch_whip', T['mariA'] + 0.2, 0.6, 2.0)
t0 = T['runA'] - 0.1
while t0 < T['pushA']: add('run_leaves', t0, 0.8, 8.0); t0 += 7.5
add('breath_heavy', T['runA'] + 0.3, 0.55, 4.0); add('branch_whip', T['runA'] + 1.5, 0.6, 2.0); add('branch_whip', T['runA'] + 3.5, 0.6, 2.0); add('heartbeat20', T['runA'], 0.55, 5.0)
add('boom20', T['pushA'] - 0.05, 0.8, 2.5); add('mud_fall', T['pushA'] + 0.3, 1.0, 2.5); add('mud_squelch', T['mudA'] + 0.2, 0.8, 3.0); add('run_leaves', T['pushA'] + 1.6, 0.7, 6.0); add('breath_heavy', T['pushA'] + 2.0, 0.5, 4.0)
add('whoosh20', T['policeA'] - 0.3, 0.6); add('police_siren', T['policeA'] - 0.6, 0.8, 6.0); add('car_door20', T['policeA'] + 1.6, 0.7, 2.0)
add('whoosh20', T['vote'], 0.5); add('pop20', T['optA'], 0.7); add('pop20', T['optB'], 0.7); add('pop20', T['cta1'], 0.55); add('pop20', T['cta2'], 0.55); add('pop20', T['cta3'], 0.55)
inp = ['-i', 'audio_dia20/voces.wav']; fc = []; mlabs = []
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
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '48000', 'build/dia20/audio_final.wav'], capture_output=True, text=True)
print(r.stderr[-1500:] or 'audio ok', len(ev), 'efectos')
