import json,sys,wave
S=sys.argv[1]
d=json.load(open(f'{S}/w2/words.json'))
starts=[];cur=0.0
for i,s in enumerate(d):
    w=wave.open(f'{S}/w2/s{i}.wav'); dur=min(w.getnframes()/w.getframerate(), s['words'][-1][2]+0.32)
    starts.append(cur); s['dur']=dur
    cur+=dur+(0.04 if i<len(d)-1 else 0.0)
total=cur+1.3
json.dump({'starts':starts,'total':total,'segs':d},open(f'{S}/w2/timeline.json','w'),ensure_ascii=False)
print(starts,total)
