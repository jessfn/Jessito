import json,sys,wave
S,EP=sys.argv[1],sys.argv[2]
d=json.load(open(f'{S}/w_{EP}/words.json'))
starts=[];cur=0.0
for i,s in enumerate(d):
    w=wave.open(f'{S}/w_{EP}/s{i}.wav'); dur=min(w.getnframes()/w.getframerate(), s['words'][-1][2]+0.35)
    starts.append(cur); s['dur']=dur
    cur+=dur+(0.22 if i<len(d)-1 else 0.0)
total=cur+1.6
json.dump({'starts':starts,'total':total,'segs':d},open(f'{S}/w_{EP}/timeline.json','w'),ensure_ascii=False)
print([round(x,2) for x in starts],round(total,2))
