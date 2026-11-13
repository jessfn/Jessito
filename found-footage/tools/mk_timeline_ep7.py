import json,subprocess,os
script=json.load(open('ep7/script.json'))
D={}
for l in script:
    p=f"build/ep7/voz_t/{l['id']}.mp3"
    if os.path.exists(p):D[l['id']]=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
    else:D[l['id']]=max(1.3,0.075*len(l['text'])+0.9)
S={};ev={}
end=lambda i:S[i]+D[i]
# ---- Block A: chase (hook, title, cam)
S['h0']=.35;ev['cam']=7.4;ev['mon0']=2.0
S['h1']=ev['cam']+.8;S['h2']=end('h1')+.6;ev['ext1']=end('h2')+.15;S['h3']=end('h2')+2.4;S['h4']=end('h3')+.8
ev['close']=end('h4')+.2
S['h5']=end('h4')+1.4;ev['snap']=end('h5')+.9
S['h6']=ev['snap']+1.6;S['h7']=end('h6')+.6
# ---- Block B: cabin + overflight
ev['cutB']=end('h7')+3.2
S['h8']=ev['cutB']+1.0;ev['bridge']=ev['cutB']-.2
S['h9']=end('h8')+1.6;ev['metro']=end('h8')+.2
S['h10']=end('h9')+3.0;ev['street']=end('h9')+.6
S['h11']=end('h10')+1.0;S['h12']=end('h11')+1.2
# ---- Block C: rooftop II
ev['cutC']=end('h12')+4.5
S['h13']=ev['cutC']+3.2;S['h14']=end('h13')+1.2;S['h15']=end('h14')+.9
ev['crack1']=end('h15')+.2;S['h16']=end('h15')+1.0
S['h17']=end('h16')+1.4;ev['peek']=S['h17']+1.0
S['h18']=end('h17')+3.2;S['h19']=end('h18')+2.0
ev['attack']=end('h19')+3.0;S['h20']=ev['attack']-.5;ev['death']=end('h20')+1.6
# ---- Block D: facade descent
ev['cutD']=ev['death']+5.0
S['h21']=ev['cutD']+2.0;S['h22']=end('h21')+3.0;ev['eyeWin']=end('h22')+2.0
S['h23']=ev['eyeWin']+4.5
# ---- Block E: tunnel + door
ev['cutE']=end('h23')+5.5
S['h24']=ev['cutE']+3.5;S['h25']=end('h24')+1.8;S['h26']=end('h25')+1.4
ev['pierce']=end('h26')+1.0;S['h27']=ev['pierce']+2.2;ev['doorBreak']=end('h27')+1.8
S['h28']=ev['doorBreak']+5.0
# ---- Block F: jets, whiteout, dead city, suspense
ev['cutF']=end('h28')+2.5;S['h29']=ev['cutF']+1.5;ev['jets']=S['h29']-.3
ev['white']=end('h29')+3.2;ev['dawn']=ev['white']+5.5;ev['sil']=ev['dawn']+9.0;ev['turn']=ev['sil']+7.0;ev['eyes']=ev['turn']+5.0;ev['dead']=ev['eyes']+5.0
ev['black']=ev['dead']+2.0;ev['endcard']=ev['black']+1.2
dur=ev['endcard']+9
json.dump({'start':{k:round(v,2) for k,v in S.items()},'ev':{k:round(v,2) for k,v in ev.items()},'dur':round(dur,2),'durs':{k:round(v,2) for k,v in D.items()},'est':not all(os.path.exists(f"build/ep7/voz_t/{l['id']}.mp3") for l in script)},open('ep7/timeline.json','w'))
print({k:round(v,1) for k,v in ev.items()},round(dur,1))
