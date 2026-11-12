import json,sys,os,subprocess,time
out=sys.argv[1];os.makedirs(out,exist_ok=True)
M=json.load(open(sys.argv[2]))
for name,(prompt,ms) in M.items():
    f=f"{out}/{name}.mp3"
    if os.path.exists(f) and os.path.getsize(f)>20000:continue
    json.dump({"prompt":prompt,"music_length_ms":ms,"force_instrumental":True},open(f"{out}/_b.json","w"))
    for a in range(4):
        r=subprocess.run(["curl","-sS","-m","300","-X","POST","https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128","-H","Content-Type: application/json","-d",f"@{out}/_b.json","-o",f,"-w","%{http_code}"],capture_output=True,text=True)
        if r.stdout.strip()=="200":break
        print(name,'retry',r.stdout,open(f).read()[:200]);time.sleep(5*(a+1))
    print('ok',name,flush=True)
