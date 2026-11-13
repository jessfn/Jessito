import json,subprocess,os
script=json.load(open('ep7/script.json'))
D={}
for l in script:
    p=f"build/ep7/voz_t/{l['id']}.mp3"
    D[l['id']]=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout) if os.path.exists(p) else max(1.3,0.075*len(l['text'])+0.9)
S={};ev={}
end=lambda i:S[i]+D[i]
# ---- 1) ROOF (continuity with chapter 6): the colossus smashes the roof and leaves after the helicopter
S['j0']=.35;ev['lunge0']=.9;ev['cam']=7.4
S['j1']=ev['cam']+.8;ev['monLeaves']=S['j1']+.4
S['j2']=end('j1')+.7;ev['tele']=S['j2']-.4
S['j3']=end('j2')+1.6
ev['cutH']=end('j3')+.7
# ---- 2) HELICOPTER: Diego on the cable, the chase, his death
S['j4']=ev['cutH']+.8;S['j5']=end('j4')+.5;S['j6']=end('j5')+.5;S['j7']=end('j6')+.6
ev['ext1']=end('j7')+.2;S['j8']=end('j7')+1.8
ev['close']=end('j8')+.2;S['j9']=end('j8')+1.3;ev['snap']=end('j9')+.8
S['j10']=ev['snap']+1.6;S['j11']=end('j10')+.6
ev['cutB']=end('j11')+1.4
S['j12']=ev['cutB']+1.0;ev['bridge']=ev['cutB']-.2
ev['metro']=end('j12')+.3;S['j13']=end('j12')+1.3
ev['street']=end('j13')+.4;S['j14']=end('j13')+.8
# ---- 3) ROOF II: the colossus comes back, the sergeant's sacrifice
ev['cutC']=end('j14')+1.6
S['j15']=ev['cutC']+2.4;S['j16']=end('j15')+1.0;ev['peek']=S['j16']+.3
S['j17']=end('j16')+1.2;S['j18']=end('j17')+1.6;S['j19']=end('j18')+.9;S['j20']=end('j19')+1.0
S['j21']=end('j20')+1.4;S['j22']=end('j21')+1.3
ev['attack']=S['j22']+D['j22']*.55;ev['run']=ev['attack']+1.5;ev['death']=ev['attack']+.9
ev['stairs']=ev['attack']+3.1;S['j23']=ev['stairs']+1.8
ev['rope']=end('j23')+.6
# ---- 4) FACADE DESCENT and street
ev['cutD']=ev['rope']+2.6
S['j24']=ev['cutD']+2.0;S['j25']=end('j24')+2.2
ev['eyeWin']=end('j25')+2.0;ev['shatter']=ev['eyeWin']+2.6;ev['alley']=ev['shatter']+2.0
S['j26']=ev['alley']+3.0;S['j27']=end('j26')+1.8
# ---- 5) SERVICE TUNNEL
ev['cutE']=end('j27')+2.4
S['j28']=ev['cutE']+2.6;ev['pierce']=end('j28')+.8
S['j29']=ev['pierce']+1.4;S['j30']=end('j29')+1.2;S['j31']=end('j30')+1.2
ev['doorBreak']=end('j31')+1.2;S['j32']=ev['doorBreak']+3.0
# ---- 6) BOMBING seen from the helicopter, Tomás survives in the tunnel, aftermath, Tomás emerges
ev['cutF']=end('j32')+1.6;ev['jets']=ev['cutF']+.3;S['j33']=ev['cutF']+1.4
ev['white']=end('j33')+2.2;ev['tunnelB']=ev['white']+1.8;ev['cabAfter']=ev['tunnelB']+3.2
S['j34']=ev['cabAfter']+1.2;S['j35']=end('j34')+.9
ev['dawn']=end('j35')+1.4;ev['mirror']=ev['dawn']+3.4;S['j36']=ev['mirror']+1.8;ev['reveal']=end('j36')+1.8;S['j37']=ev['reveal']+.9;ev['sil']=end('j37')+1.8;ev['turn']=ev['sil']+3.6;ev['eyes']=ev['turn']+3.0;ev['dead']=ev['eyes']+3.0
ev['black']=ev['dead']+2.0;ev['endcard']=ev['black']+1.2
dur=ev['endcard']+8
json.dump({'start':{k:round(v,2) for k,v in S.items()},'ev':{k:round(v,2) for k,v in ev.items()},'dur':round(dur,2),'durs':{k:round(v,2) for k,v in D.items()}},open('ep7/timeline.json','w'))
print({k:round(v,1) for k,v in ev.items()},round(dur,1))
