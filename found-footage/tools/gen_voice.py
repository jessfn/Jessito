import json,sys,os,subprocess,base64,time
VOICES={"Tomas":"EQdYdxpkGKpMCC5nZMgi","Beto":"dcEM0WOwbt9XwI31mBIu","Diego":"4rOzDieCbHQQyo9tzqZv","Marta":"tMzxR2W7o3RLIY7zWBbG","Lucia":"ewn5JTa3lNPY8QVuZJi6","Sofi":"iFhPOZcajR7W3sDL39qJ","Vecino":"htFfPSZGJwjBv1CL0aMD","Altavoz":"htFfPSZGJwjBv1CL0aMD","Soldado":"htFfPSZGJwjBv1CL0aMD","Sargento":"htFfPSZGJwjBv1CL0aMD","Radio":"htFfPSZGJwjBv1CL0aMD"}
script,out=sys.argv[1],sys.argv[2]
os.makedirs(out,exist_ok=True)
lines=json.load(open(script))
res={}
for ln in lines:
    mp3=f"{out}/{ln['id']}.mp3";js=f"{out}/{ln['id']}.json"
    if not os.path.exists(js):
        body={"text":ln.get("say",ln["text"]),"model_id":"eleven_v3","language_code":"es","voice_settings":{"stability":ln.get("stab",0.0),"similarity_boost":0.75,"style":0.0,"use_speaker_boost":True}}
        json.dump(body,open(f"{out}/_b.json","w"))
        for attempt in range(6):
            r=subprocess.run(["curl","-sS","-m","90","-X","POST",f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[ln['who']]}/with-timestamps?output_format=mp3_44100_128","-H","Content-Type: application/json","-d",f"@{out}/_b.json","-o",f"{out}/_r.json","-w","%{http_code}"],capture_output=True,text=True)
            if r.stdout.strip()=="200":break
            print(ln['id'],'retry',r.stdout,open(f"{out}/_r.json").read()[:200]);time.sleep(4*(attempt+1))
        d=json.load(open(f"{out}/_r.json"))
        open(mp3,"wb").write(base64.b64decode(d["audio_base64"]))
        a=d.get("alignment") or d.get("normalized_alignment")
        json.dump({"chars":a["characters"],"start":a["character_start_times_seconds"],"end":a["character_end_times_seconds"]},open(js,"w"))
    print('ok',ln['id'])
