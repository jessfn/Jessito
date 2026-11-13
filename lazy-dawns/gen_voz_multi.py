# Genera la voz de un episodio con varias voces (narrador + personajes). Uso: python3 gen_voz_multi.py script.json carpeta
import json, subprocess, base64, sys, time, os
script, out = sys.argv[1], sys.argv[2]
VOICES = {'N': 'cgSgspJ2msm6clMCkdW9',   # Narrador: Jessica (FIJA, no cambiar)
          'M': 'FGY2WhTYpPnrIDTdsKH5',   # Mari: Laura
          'D': 'nPczCjzI2devNBz1zQrb',   # Dr. Mendoza: Brian (voz grave)
          'V': 'pFZP5JQG7iQjIQuC4Bku',   # Vero (estilista): Lily
          'E': 'TX3LPaxmHKxFdv7VOQHJ',   # Memo (ayudante): Liam
          'B': 'hpp4J3VqNfWAUOO0d1Us',   # Karla (cejista): Bella
          'S': 'Xb7hH8MSUJpSbSDYk0k2',   # Dra. Valentina: Alice
          'K': 'EXAVITQu4vr4xnSDxMaL'}   # Nina (maquilladora): Sarah
VS = {'N': dict(stability=0.5, similarity_boost=0.75, style=0.0, use_speaker_boost=True),
      'M': dict(stability=0.4, similarity_boost=0.75, style=0.3, use_speaker_boost=True),
      'D': dict(stability=0.55, similarity_boost=0.75, style=0.15, use_speaker_boost=True),
      'V': dict(stability=0.4, similarity_boost=0.75, style=0.35, use_speaker_boost=True),
      'E': dict(stability=0.35, similarity_boost=0.75, style=0.4, use_speaker_boost=True),
      'B': dict(stability=0.4, similarity_boost=0.75, style=0.35, use_speaker_boost=True),
      'S': dict(stability=0.55, similarity_boost=0.75, style=0.15, use_speaker_boost=True),
      'K': dict(stability=0.4, similarity_boost=0.75, style=0.4, use_speaker_boost=True)}
lines = json.load(open(script)); os.makedirs(out + '/lines', exist_ok=True)
for L in lines:
    cache = f"{out}/lines/{L['id']}.json"
    if os.path.exists(cache) and os.path.exists(f"{out}/lines/{L['id']}.mp3"):
        c = json.load(open(cache))
        if c['text'] == L['text'] and c['who'] == L['who']:
            L['words'] = c['words']; L['dur'] = c['dur']; print(L['id'], 'cache'); continue
    body = json.dumps({"text": L['text'], "model_id": "eleven_v4", "language_code": "es", "voice_settings": VS[L['who']]})
    for k in range(6):
        r = subprocess.run(["curl", "-sS", "-X", "POST", f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[L['who']]}/with-timestamps", "-H", "Content-Type: application/json", "-d", body], capture_output=True, text=True)
        try: d = json.loads(r.stdout)
        except Exception: d = {}
        if 'audio_base64' in d: break
        time.sleep(3 + 2 * k)
    else: print('FALLO', L['id'], r.stdout[:200]); sys.exit(1)
    open(f"{out}/lines/{L['id']}.mp3", 'wb').write(base64.b64decode(d['audio_base64']))
    a = d['alignment']; words = []; cur = ''; s = e = None
    for c, x, y in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if c in ' \n':
            if cur: words.append([cur, s, e]); cur = ''
        else:
            if not cur: s = x
            cur += c; e = y
    if cur: words.append([cur, s, e])
    L['words'] = words
    L['dur'] = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f"{out}/lines/{L['id']}.mp3"]).decode())
    json.dump({'text': L['text'], 'who': L['who'], 'words': L['words'], 'dur': L['dur']}, open(cache, 'w'), ensure_ascii=False)
    print(L['id'], L['who'], round(L['dur'], 2))
t = 0.0
for L in lines:
    t += L.get('pad', 0.3); L['start'] = round(t, 3); L['end'] = round(t + L['dur'], 3); t = L['end']
    L['words'] = [[w, round(L['start'] + s, 3), round(L['start'] + e, 3)] for w, s, e in L['words']]
total = round(t + 1.0, 2)
json.dump({'lines': lines, 'total': total}, open(out + '/lines.json', 'w'), ensure_ascii=False)
# voces mezcladas (cada linea normalizada y colocada en su momento)
inp = []; fc = []; labs = []
for i, L in enumerate(lines):
    inp += ['-i', f"{out}/lines/{L['id']}.mp3"]; ms = int(L['start'] * 1000)
    gain = {'N': 1.0, 'M': 1.0, 'D': 1.1, 'V': 1.05, 'E': 1.0, 'S': 1.05, 'K': 1.05, 'B': 1.05}[L['who']]
    fc.append(f"[{i}:a]loudnorm=I=-17:TP=-1.5:LRA=7,aresample=44100,pan=stereo|c0=c0|c1=c0,volume={gain},adelay={ms}|{ms}[v{i}]"); labs.append(f"[v{i}]")
fc.append(''.join(labs) + f"amix=inputs={len(labs)}:normalize=0:duration=longest,apad=whole_dur={total}[a]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', ';'.join(fc), '-map', '[a]', '-ar', '44100', out + '/voces.wav'], check=True)
print('TOTAL', total)
