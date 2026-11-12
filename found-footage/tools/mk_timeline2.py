import json,subprocess,sys
voz=sys.argv[1]
def dur(i):return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{voz}/l{i}.mp3'],capture_output=True,text=True).stdout)
D={i:dur(i) for i in range(0,19)}
S={};ev={}
S[0]=3.5;S[1]=11.5
def end(i):return S[i]+D[i]
gaps={2:1.8,3:2.0,4:1.6,5:3.0,6:1.6,7:2.2,8:1.8}
for i in range(2,9):S[i]=end(i-1)+gaps[i]
S[9]=end(8)+3.0;ev['flick0']=S[9]-2.4;ev['birds']=S[6]+1.2
S[10]=end(9)+2.6;ev['tB']=S[10]-0.5
ev['rumble0']=end(10)+1.8;ev['flash1']=end(10)+5.2;ev['boom1']=ev['flash1']+0.6
S[11]=ev['boom1']+2.2
S[12]=end(11)+2.4
ev['flash2']=end(12)+1.8;ev['boom2']=ev['flash2']+0.35
S[13]=ev['boom2']+2.6
S[14]=end(13)+1.8
ev['roar']=end(14)+1.8
S[15]=ev['roar']+5.0
S[16]=end(15)+0.8
S[17]=end(16)+0.7
ev['collapse']=end(17)+0.6
S[18]=ev['collapse']+1.3
ev['impact']=end(18)+0.8;ev['fall']=ev['impact']+0.15;ev['black']=ev['impact']+2.4;ev['endcard']=ev['black']+0.9
dur_total=ev['endcard']+11.0
start={f'l{i}':round(S[i],2) for i in S}
ev={k:round(v,2) for k,v in ev.items()}
json.dump({'start':start,'ev':ev,'dur':round(dur_total,2),'durs':{f'l{i}':round(D[i],2) for i in D}},open('ep1/timeline.json','w'))
print(start);print(ev);print('dur',dur_total)
