import json, subprocess
tl = json.load(open('build/dia02/timeline.json')); T = tl['T']; D = tl['DUR']
ev = [('thud', 0.7), ('whoosh', T['slateEnd']), ('whoosh', T['clinic']), ('notif', T['lupa']), ('pop', T['dx']),
      ('pop', T['clean']), ('whoosh', T['steam']), ('pop', T['mask']), ('ding', T['maskOff']), ('pop', T['extract']),
      ('pop', T['pops'][0]), ('pop', T['pops'][1]), ('pop', T['pops'][2]), ('thud', T['red']), ('whoosh', T['red']), ('notif', T['red'] + 0.1), ('thud', T['mScream']),
      ('ding', T['aloe'] + 0.2), ('ding', T['normal']), ('pop', T['patches']), ('pop', T['tonic']), ('pop', T['cream']), ('pop', T['spf']), ('pop', T['routine']),
      ('thud', T['magic']), ('whoosh', T['mirror']), ('ding', T['glow'] + 0.9), ('pop', T['cry']), ('ding', T['smile']), ('thud', T['silence'] + 0.7), ('whoosh', T['vote']),
      ('pop', T['optA']), ('pop', T['optB']), ('ding', T['cta1']), ('ding', T['cta2'])]
files = sorted(set(e[0] for e in ev)); idx = {f: i + 2 for i, f in enumerate(files)}
inp = ['-i', 'build/dia02/voz.mp3', '-i', 'build/musica.wav']
for f in files: inp += ['-i', f'build/{f}.wav']
fc = [f"[0:a]volume=1.5,apad=whole_dur={D}[v]", "[1:a]volume=0.14[m]"]; labs = ['[v]', '[m]']
for k, (f, t) in enumerate(ev):
    ms = int(t * 1000); fc.append(f"[{idx[f]}:a]adelay={ms}|{ms},volume=0.55[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '44100', 'build/dia02/audio_final.wav'], capture_output=True, text=True)
print(r.stderr or 'audio ok')
