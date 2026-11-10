import json,subprocess,base64,sys
model=sys.argv[1]; voice=sys.argv[2]
text=open('script_dia01.txt').read().strip()
vs={"stability":0.5,"similarity_boost":0.75,"style":0.0,"use_speaker_boost":True}
body=json.dumps({"text":text,"model_id":model,"language_code":"es","voice_settings":vs})
r=subprocess.run(["curl","-sS","-X","POST",f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps","-H","Content-Type: application/json","-d",body],capture_output=True,text=True)
try: d=json.loads(r.stdout)
except Exception: print(r.stdout[:300]); sys.exit(1)
if "audio_base64" not in d: print(json.dumps(d)[:400]); sys.exit(1)
open("build/voz.mp3","wb").write(base64.b64decode(d["audio_base64"]))
a=d["alignment"];ch,st,en=a['characters'],a['character_start_times_seconds'],a['character_end_times_seconds']
words=[];cur='';s=e=None
for c,x,y in zip(ch,st,en):
    if c in ' \n':
        if cur: words.append((cur,s,e)); cur=''
    else:
        if not cur: s=x
        cur+=c; e=y
if cur: words.append((cur,s,e))
json.dump(words,open('build/words.json','w'),ensure_ascii=False)
print(model,len(words),'palabras; fin',round(words[-1][2],2))
