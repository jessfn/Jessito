import json,wave,subprocess,sys
S=sys.argv[1]
old=json.load(open(f'{S}/w_fall_alvaro/timeline.json'));st=old['starts'];tot=old['total']
D=f'{S}/w_fall';words=json.load(open(f'{D}/words.json'))
segs=[]
for i,s in enumerate(words):
    w=wave.open(f'{D}/s{i}.wav');dur=min(w.getnframes()/w.getframerate(),s['words'][-1][2]+0.35)
    win=(st[i+1]-st[i]-0.22) if i<len(st)-1 else old['segs'][i]['dur']
    f=max(1.0,dur/win);print(i,round(dur,2),round(win,2),'factor',round(f,3))
    if f>1.0001:
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{D}/s{i}.wav','-af',f'atempo={f:.5f}','-c:a','pcm_s24le',f'{D}/t{i}.wav'],check=True)
        subprocess.run(['mv',f'{D}/t{i}.wav',f'{D}/s{i}.wav'])
        s['words']=[[a,b/f,c/f] for a,b,c in s['words']];dur=dur/f
    s['dur']=min(dur,win)
json.dump({'starts':st,'total':tot,'segs':words},open(f'{D}/timeline.json','w'),ensure_ascii=False)
