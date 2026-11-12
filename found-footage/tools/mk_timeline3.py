import json,subprocess,sys
voz=sys.argv[1]
ids=[str(i) for i in range(0,22)]+['a1','a2','a3']
D={i:float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{voz}/'+(f'l{i}' if i.isdigit() else i)+'.mp3'],capture_output=True,text=True).stdout) for i in ids}
D={(int(k) if k.isdigit() else k):v for k,v in D.items()}
S={0:3.2,1:10.6};ev={}
end=lambda i:S[i]+D[i]
for i,g in {2:-.25,3:.1,4:-.2,5:.1}.items():S[i]=end(i-1)+g
S['a1']=end(5)+.15;S['a2']=end('a1')+.1;S['a3']=end('a2')+.05
S[6]=end('a3')+.25
for i,g in {7:.1,8:.35,9:.15,10:.45}.items():S[i]=end(i-1)+g
ev['tB']=end(10)+1.8;ev['flick0']=ev['tB']-.9;ev['birds']=9999
S[11]=ev['tB']+.9;S[12]=end(11)+.2
ev['rumble0']=end(12)+.4;ev['flash1']=end(12)+1.8;ev['boom1']=ev['flash1']+.55
S[13]=ev['boom1']+.9;S[14]=end(13)+.1;S[15]=end(14)+.1
ev['flash2']=end(15)+.7;ev['boom2']=ev['flash2']+.3
S[16]=ev['boom2']+1.4;S[17]=end(16)+.2
ev['roar']=end(17)+.8
S[18]=ev['roar']+3.0;S[19]=end(18)+.15;S[20]=end(19)+.15
ev['collapse']=end(20)+.3;S[21]=ev['collapse']+.7
ev['impact']=end(21)+.4;ev['fall']=ev['impact']+.15;ev['black']=ev['impact']+2.2;ev['endcard']=ev['black']+.9
dur=ev['endcard']+11.0
json.dump({'start':{(f'l{i}' if isinstance(i,int) else i):round(S[i],2) for i in S},'ev':{k:round(v,2) for k,v in ev.items()},'dur':round(dur,2),'durs':{(f'l{i}' if isinstance(i,int) else i):round(D[i],2) for i in D}},open('ep1/timeline.json','w'))
print({str(i):round(S[i],1) for i in S});print({k:round(v,1) for k,v in ev.items()});print('dur',round(dur,1))
