import numpy as np,subprocess,json,os
TL=json.load(open('ep7/timeline.json'));S_=TL['start'];E=TL['ev'];DUR=TL['dur'];SR=44100;N=int(SR*DUR)
B='build/ep7';B1='build/ep1';rng=np.random.default_rng(5)
script=json.load(open('ep7/script.json'));who={l['id']:l['who'] for l in script}
PAN={'Beto':-.45,'Diego':-.2,'Marta':.35,'Lucia':.15,'Tomas':0,'Sofi':-.05,'Sargento':.3,'Radio':0,'Piloto':-.3};GAIN={'Tomas':1.15,'Beto':1.0,'Diego':1.0,'Marta':1.0,'Lucia':1.0,'Sofi':1.1,'Sargento':1.0,'Radio':.9,'Piloto':1.0}
def load(path,filt=None):
    cmd=['ffmpeg','-v','error','-i',path]+(['-af',filt] if filt else [])+['-f','f32le','-ac','2','-ar',str(SR),'-']
    d=np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,dtype=np.float32);return d.reshape(-1,2).astype(np.float64)
def place(buf,x,t,g=1.0,pan=0.0,dur=None,fade=0.05):
    if dur is not None:x=x[:int(dur*SR)]
    x=x.copy();n=len(x);f=int(fade*SR)
    if f>0 and n>2*f:x[:f]*=np.linspace(0,1,f)[:,None];x[-f:]*=np.linspace(1,0,f)[:,None]
    x[:,0]*=g*(1-max(0,pan));x[:,1]*=g*(1+min(0,pan))
    a=int(t*SR);b=min(N,a+n)
    if a<N and b>a:buf[a:b]+=x[:b-a]
def noise(n):return rng.standard_normal((n,2))*.3
def loop(x,total):
    cf=int(1.0*SR);out=x
    while len(out)<total*SR+cf:
        out=np.concatenate([out[:-cf],out[-cf:]*np.linspace(1,0,cf)[:,None]+x[:cf]*np.linspace(0,1,cf)[:,None],x[cf:]])
    return out[:int(total*SR)]
# ---------- voices
V=np.zeros((N,2))
for lid,t0 in S_.items():
    x=load(f'{B}/voz_t/{lid}.mp3',('highpass=f=500,lowpass=f=3200,acrusher=bits=10:mix=.3,' if who[lid]=='Radio' else ('asetrate=47628,aresample=44100,highpass=f=300,lowpass=f=5200,' if who[lid]=='Piloto' else ''))+'highpass=f=100,lowpass=f=9500,equalizer=f=3200:t=q:w=1:g=3,acompressor=threshold=0.1:ratio=3:attack=5:release=80:makeup=2,aecho=0.8:0.4:25|50:0.10|0.05')
    m=np.abs(x).max(axis=1);act=m>0.02;rms=np.sqrt(np.mean(m[act]**2)) if act.any() else .1
    x=x*(0.13/rms);pk=np.abs(x).max();x=x*min(1,0.85/pk)
    w=who[lid];place(V,x,t0,GAIN[w],PAN[w])
# ---------- sfx
S=np.zeros((N,2))
def sfx(name,t,g=1,dur=None,pan=0,fade=.05,loop_to=None,d='sfx'):
    x=load(f'{B}/sfx/{name}.mp3')
    if loop_to:x=loop(x,loop_to);dur=loop_to
    place(S,x,t,g,pan,dur,fade)
def ramp(name,t0,t1,g0,g1,d='sfx'):
    x=loop(load(f'{B}/sfx/{name}.mp3'),t1-t0);x=x*np.linspace(g0,g1,len(x))[:,None];place(S,x,t0,1,0,None,fade=1.0)
def glitch(t0,t1,g):
    n=int((t1-t0)*SR);x=noise(n)*(rng.random((n//900+1,1)).repeat(900,0)[:n]>.5)*3;x=np.sign(x)*np.minimum(abs(x),1);place(S,x,t0,g,0,fade=.01)

def subboom(t,g,dur=1.6,f0=75,f1=26):
    n=int(dur*SR);tt=np.arange(n)/SR;ph=2*np.pi*(f1*tt+(f0-f1)*(1-np.exp(-tt*5))/5);x=np.sin(ph)*np.exp(-tt*2.2);place(S,np.stack([x,x],1),t,g,0,fade=.005)
def tinnitus(t,g,dur=2.6):
    n=int(dur*SR);tt=np.arange(n)/SR;x=(np.sin(2*np.pi*3900*tt)+.5*np.sin(2*np.pi*4300*tt))*np.exp(-tt*1.3)*np.minimum(1,tt*40);place(S,np.stack([x,x],1),t,g,0,fade=.01)

def subboom(t,g,dur=1.6,f0=75,f1=26):
    n=int(dur*SR);tt=np.arange(n)/SR;ph=2*np.pi*(f1*tt+(f0-f1)*(1-np.exp(-tt*5))/5);x=np.sin(ph)*np.exp(-tt*2.2);place(S,np.stack([x,x],1),t,g,0,fade=.005)
def tinnitus(t,g,dur=2.6):
    n=int(dur*SR);tt=np.arange(n)/SR;x=(np.sin(2*np.pi*3900*tt)+.5*np.sin(2*np.pi*4300*tt))*np.exp(-tt*1.3)*np.minimum(1,tt*40);place(S,np.stack([x,x],1),t,g,0,fade=.01)
def hit1(name,t,g=1,dur=None,fade=.05):
    place(S,load(f'{B1}/sfx/{name}.mp3'),t,g,0,dur,fade)
E_=E;cam=E_['cam']
def L(a):return S_[a]
# 1) roof (continuity): the colossus smashes the roof and leaves
sfx('roof_wind',0,.7,loop_to=E_['cutH']+1,fade=.5);sfx('monster_roar',E_['lunge0']-.2,1.0,9);sfx('building_crash',E_['lunge0'],.9,10);subboom(E_['lunge0']+.1,1.0,2.0)
sfx('monster_step',E_['monLeaves'],.8,8,fade=.4);sfx('heli_flight',E_['tele']-1,.6,loop_to=E_['cutH']-E_['tele']+2,fade=1.0);sfx('heartbeat',E_['tele'],.5,8,fade=1.0)
# 2) helicopter chase + Diego's death
sfx('heli_flight',E_['cutH'],.9,loop_to=E_['cutB']-E_['cutH']+2,fade=.5);sfx('cable_wind',E_['cutH'],.6,loop_to=E_['snap']-E_['cutH'],fade=.5)
sfx('monster_growl',E_['cutH']+2,.8,8,fade=.3);sfx('heartbeat',E_['cutH']+2,.6,10,fade=1.0)
sfx('monster_roar',E_['close']-.2,.9,9);sfx('monster_snap',E_['snap']-.15,1.0,5);sfx('flesh_crunch',E_['snap'],1.0,3);sfx('blood_splat',E_['snap']+.1,1.0,4);subboom(E_['snap'],1.0,2.0);sfx('cable_snap',E_['snap']+.1,.7,3);tinnitus(E_['snap']+.3,.06)
sfx('heli_flight',E_['cutB'],.6,loop_to=E_['cutC']-E_['cutB']+1,fade=.6);sfx('explosion_far',E_['cutB'],.5,loop_to=E_['cutC']-E_['cutB'],fade=1.0);sfx('radio_static',L('j13')-.5,.8,3)
# 3) roof II: return of the colossus, the sergeant's sacrifice
sfx('roof_wind',E_['cutC'],.8,loop_to=E_['stairs']-E_['cutC']+1,fade=.8);sfx('roof_crack',E_['peek']-4,.8,8)
sfx('laser_beep',E_['peek']-1,.5,4);sfx('monster_breath',E_['peek'],.8,loop_to=E_['attack']-E_['peek'],fade=1.0)
sfx('rifle_burst',E_['attack']-1.2,.9,5);sfx('monster_roar',E_['attack']-.1,1.0,9);subboom(E_['attack'],1.0,2.2);sfx('claw_scrape',E_['attack']+.2,.9,6)
sfx('flesh_crunch',E_['attack']+.5,1.0,3);sfx('blood_splat',E_['attack']+.6,1.0,4);sfx('body_drop',E_['attack']+1.4,.8,3)
sfx('stairs_run',E_['run'],.7,5,fade=.3);sfx('building_crash',E_['stairs']-.5,.7,10,fade=.3)
sfx('cable_wind',E_['rope'],.6,6)
# 4) facade + street
sfx('glass_facade',E_['cutD'],.8,loop_to=E_['alley']-E_['cutD']+1,fade=.6);sfx('explosion_far',E_['cutD'],.5,loop_to=E_['cutE']-E_['cutD'],fade=1.0)
sfx('monster_growl',E_['eyeWin']-.3,.9,8);sfx('glass_rain',E_['shatter'],1.0,6);subboom(E_['shatter']+.1,.9,1.8)
sfx('stairs_run',E_['alley'],.7,loop_to=E_['cutE']-E_['alley'],fade=.3);sfx('monster_step',E_['alley'],.8,loop_to=E_['cutE']-E_['alley'],fade=.5)
# 5) tunnel + Marta's sacrifice
sfx('tunnel_amb',E_['cutE'],.8,loop_to=E_['cutF']-E_['cutE']+1,fade=.6)
sfx('door_bend',L('j28'),.8,loop_to=E_['pierce']-L('j28'),fade=1.0);sfx('claw_pierce',E_['pierce'],1.0,7);sfx('door_bend',E_['pierce']+1,.9,8)
sfx('building_crash',E_['doorBreak'],1.0,10);sfx('monster_roar',E_['doorBreak']+.2,1.0,9);sfx('flesh_crunch',E_['doorBreak']+.3,1.0,3);sfx('blood_splat',E_['doorBreak']+.4,1.0,4);subboom(E_['doorBreak'],1.0,2.4)
sfx('heartbeat',E_['doorBreak']+1.5,.6,8,fade=1.0)
# 6) jets, bombing, dead city
sfx('jets_flyby',E_['jets'],1.0,9);sfx('radio_static',L('j33')-.3,.7,3);sfx('bomb_blast',E_['white']-1.4,1.0,12);subboom(E_['white'],1.0,3.0);tinnitus(E_['white']+1.0,.09,4.0)
sfx('ash_wind',E_['dawn'],.8,loop_to=E_['black']-E_['dawn']+1,fade=1.2)
sfx('monster_growl',E_['turn'],.8,8,fade=.5);sfx('heartbeat',E_['eyes']-1,.7,8,fade=1.0)
sfx('vhs_end',E_['dead']+.4,.9,3)
# ---------- music
M=np.zeros((N,2))
def mus(name,t,g,dur=None,fade=1.0,filt=None):
    x=load(f'{B}/music/{name}.mp3',filt);place(M,x,t,g,0,dur,fade)
mus('dread7',0.3,.8,E_['cutH']-.3,fade=1.0)
mus('chase',E_['cutH']-.3,.85,E_['cutB']-E_['cutH']+.6,fade=1.0)
mus('grief',E_['cutB']-.3,.75,E_['cutC']-E_['cutB']+.3,fade=1.5)
mus('dread7',E_['cutC']-.3,.8,E_['attack']-E_['cutC']+.6,fade=1.5)
mus('descent',E_['attack']+1.0,.85,E_['cutE']-E_['attack']-.7,fade=1.0)
mus('tunnel7',E_['cutE']-.3,.75,E_['cutF']-E_['cutE']+.3,fade=1.5)
mus('climax7',E_['cutF']-.3,.95,E_['white']-E_['cutF']+1.2,fade=.8)
mus('suspense',E_['dawn']-.5,.7,E_['black']-E_['dawn']+1.0,fade=2.0)
# ---------- duck + dips + mix
env=np.abs(V).max(axis=1);k=int(.03*SR);env=np.convolve(env,np.ones(k)/k,'same')
rel=np.exp(-1/(0.25*SR));e2=np.zeros_like(env);c=0.0;step=SR//200
for i in range(0,N,step):
    v=env[i:i+step].max();c=max(v,c*rel**step);e2[i:i+step]=c
env=np.clip(e2/0.12,0,1)
dip=np.ones(N)
for tb in (E_['lunge0'],E_['snap'],E_['attack'],E_['shatter'],E_['doorBreak'],E_['white']):
    a=int((tb-.4)*SR);b=int(tb*SR);dip[a:b]=.15
dip=np.convolve(dip,np.ones(int(.06*SR))/int(.06*SR),'same')
S=S/max(1e-9,np.abs(S).max())*0.8
M=M/max(1e-9,np.abs(M).max())*0.42
mix=V+(S*(1-.62*env)[:,None]+M*(1-.7*env)[:,None])*dip[:,None]
out=(np.clip(np.tanh(mix*1.05)*.95,-1,1)*32767).astype('<i2')
open(f'{B}/mix_raw.raw','wb').write(out.tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-f','s16le','-ar',str(SR),'-ac','2','-i',f'{B}/mix_raw.raw','-af','loudnorm=I=-15:TP=-1.5:LRA=14','-ar','44100',f'{B}/mix.wav'])
vr=np.sqrt(np.mean(V[env>.5]**2));sr=np.sqrt(np.mean(((S*(1-.62*env)[:,None]+M*(1-.7*env)[:,None]))[env>.5]**2))
print('mix done; during speech: voice rms %.3f  sfx+music rms %.3f  ratio %.1f dB'%(vr,sr,20*np.log10(vr/sr)))
