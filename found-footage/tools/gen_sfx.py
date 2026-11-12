import json,sys,os,subprocess,time
out=sys.argv[1];os.makedirs(out,exist_ok=True)
SFX=json.load(open(sys.argv[2]))
for name,(prompt,dur) in SFX.items():
    f=f"{out}/{name}.mp3"
    if os.path.exists(f):continue
    json.dump({"text":prompt,"duration_seconds":dur,"prompt_influence":0.6},open(f"{out}/_b.json","w"))
    for attempt in range(6):
        r=subprocess.run(["curl","-sS","-m","120","-X","POST","https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128","-H","Content-Type: application/json","-d",f"@{out}/_b.json","-o",f,"-w","%{http_code}"],capture_output=True,text=True)
        if r.stdout.strip()=="200":break
        print(name,'retry',r.stdout,open(f).read()[:200]);time.sleep(4*(attempt+1))
    print('ok',name)
