# Genera efectos con ElevenLabs sound-generation. Uso: python3 gen_sfx.py nombre "descripcion" duracion carpeta
import sys, json, subprocess, time
name, prompt, dur, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
body = json.dumps({"text": prompt, "duration_seconds": dur, "prompt_influence": 0.6})
for k in range(6):
    r = subprocess.run(["curl", "-sS", "-X", "POST", "https://api.elevenlabs.io/v1/sound-generation", "-H", "Content-Type: application/json", "-d", body, "-o", f"{out}/{name}.mp3", "-w", "%{http_code}"], capture_output=True, text=True)
    if r.stdout.strip() == '200': print('ok', name); break
    time.sleep(3 + 3 * k)
else: print('FALLO', name, r.stdout)
