import json,subprocess,sys
voz=sys.argv[1]
ids=[f'b{i}' for i in range(0,21)]
D={i:float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{voz}/{i}.mp3'],capture_output=True,text=True).stdout) for i in ids}
S={};ev={}
end=lambda i:S[i]+D[i]
S['b0']=.35;ev['cam']=7.4
S['b1']=ev['cam']+.9;ev['lever']=end('b1')+.3
S['b2']=ev['lever']+.7;ev['lift']=S['b2']+D['b2']*.78
S['b3']=ev['lift']+1.0
S['b4']=end('b3')+.5
S['b5']=end('b4')+.4;ev['dim']=S['b5']+.2
S['b6']=end('b5')+.4;ev['phone']=S['b6']+.3
ev['go']=end('b6')+.8
S['b7']=ev['go']+3.4;ev['arrive']=S['b7']+1.0;ev['door1']=end('b7')+.5;ev['lobby']=ev['door1']+1.3
S['b8']=ev['lobby']+1.0;S['b9']=end('b8')+.9;S['b10']=end('b9')+.9;ev['keys']=S['b10']+.7
S['b11']=end('b10')+.9;ev['scratch']=S['b11']-.4
S['b12']=end('b11')+.6;ev['unlock']=end('b12')+.5;ev['doorsOpen']=ev['unlock']+1.1;ev['street']=ev['doorsOpen']+1.5
S['b13']=ev['street']+1.2
S['b14']=end('b13')+1.0;ev['truck']=S['b14']
S['b15']=end('b14')+.8
S['b16']=end('b15')+.5;ev['metro']=S['b16']+1.2
ev['drain']=end('b16')+.8;S['b17']=ev['drain']+.5
S['b18']=end('b17')+.3;ev['run']=S['b18']+.2
ev['heli']=S['b18']+1.8;S['b19']=ev['heli']+.8
ev['gstep']=end('b19')+1.0;S['b20']=ev['gstep']+.5
ev['metroIn']=end('b20')+1.2;ev['fall']=ev['metroIn']+1.4;ev['black']=ev['fall']+1.3;ev['endcard']=ev['black']+.9
dur=ev['endcard']+11
json.dump({'start':{k:round(v,2) for k,v in S.items()},'ev':{k:round(v,2) for k,v in ev.items()},'dur':round(dur,2),'durs':{k:round(v,2) for k,v in D.items()}},open('ep3/timeline.json','w'))
print({k:round(v,1) for k,v in S.items()});print({k:round(v,1) for k,v in ev.items()});print('dur',round(dur,1))
