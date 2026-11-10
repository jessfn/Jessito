import json, subprocess
tl = json.load(open('build/timeline.json')); T = tl['T']; D = tl['DUR']
sfx = {'ding': 1318, }
ev = [('whoosh', T['name']), ('pop', T['name']), ('notif', T['notif']), ('whoosh', T['open']),
      ('pop', T['m1']), ('pop', T['m2']), ('pop', T['m3']), ('pop', T['m4']), ('pop', T['m5']), ('pop', T['m6']), ('pop', T['m7']), ('pop', T['m8']),
      ('whoosh', T['close']), ('pop', T['gr']), ('pop', T['ce']), ('pop', T['di']), ('ding', T['sparkle']),
      ('whoosh', T['mirOut']), ('thud', T['d30']), ('pop', T['bPiel']), ('pop', T['bDientes']), ('pop', T['bCejas']), ('pop', T['bPelo']), ('pop', T['bEstilo']), ('pop', T['bGym']),
      ('pop', T['decide']), ('whoosh', T['vote']), ('ding', T['vote'] + 0.1), ('pop', T['optA']), ('pop', T['optB']), ('ding', T['cta'])]
files = sorted(set(e[0] for e in ev)); idx = {f: i + 2 for i, f in enumerate(files)}
inp = ['-i', 'build/voz.mp3', '-i', 'build/musica.wav']
for f in files: inp += ['-i', f'build/{f}.wav']
fc = [f"[0:a]volume=1.5,apad=whole_dur={D}[v]", "[1:a]volume=0.14[m]"]; labs = ['[v]', '[m]']
for k, (f, t) in enumerate(ev):
    ms = int(t * 1000); fc.append(f"[{idx[f]}:a]adelay={ms}|{ms},volume=0.55[e{k}]"); labs.append(f"[e{k}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,alimiter=limit=0.95,atrim=0:{D}[a]")
r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ac', '2', '-ar', '44100', 'build/audio_final.wav'], capture_output=True, text=True)
print(r.stderr or 'audio ok')
