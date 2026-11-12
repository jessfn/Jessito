import json,subprocess,sys
voz=sys.argv[1]
ids=['l0']+[f'a{i}' for i in range(1,21)]
D={i:float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{voz}/{i}.mp3'],capture_output=True,text=True).stdout) for i in ids}
S={};ev={}
end=lambda i:S[i]+D[i]
ev['cam']=7.4
S['l0']=7.9
S['a1']=end('l0')+.5;S['a2']=end('a1')+.1;S['a3']=end('a2')+3.2;S['a4']=end('a3')+1.6
ev['rush']=end('a4')+.1
S['a5']=ev['rush']+.5
S['a6']=end('a5')+2.4;ev['stop']=S['a6']-1.2
S['a7']=end('a6')+.5;S['a8']=end('a7')+.1;S['a9']=end('a8')+.15
ev['clicks']=end('a9')+.3
S['a10']=end('a9')+2.6;S['a11']=end('a10')+.3
ev['reveal']=end('a11')+.4;ev['drop']=ev['reveal']+1.6
S['a12']=ev['drop']+.1;ev['smash']=end('a12')+.5;S['a13']=ev['smash']+.1
S['a14']=end('a13')+1.8;S['a15']=end('a14')+.3
ev['gstep']=end('a15')+.8;S['a16']=ev['gstep']+.4;ev['run']=S['a16']
ev['collapse']=end('a16')+1.0;S['a17']=ev['collapse']+.6;S['a18']=end('a17')+.2
ev['wallburst']=end('a18')+2.6;ev['eye']=ev['wallburst']+.6
S['a19']=ev['wallburst']+1.0;S['a20']=end('a19')+.4
ev['fall']=end('a20')+2.6;ev['black']=ev['fall']+1.3;ev['endcard']=ev['black']+.9
dur=ev['endcard']+11.0
json.dump({'start':{k:round(v,2) for k,v in S.items()},'ev':{k:round(v,2) for k,v in ev.items()},'dur':round(dur,2),'durs':{k:round(v,2) for k,v in D.items()}},open('ep2/timeline.json','w'))
print({k:round(v,1) for k,v in S.items()});print({k:round(v,1) for k,v in ev.items()});print('dur',round(dur,1))
