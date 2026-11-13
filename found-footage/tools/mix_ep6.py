import numpy as np,subprocess,json,os
TL=json.load(open('ep6/timeline.json'));S_=TL['start'];E=TL['ev'];DUR=TL['dur'];SR=44100;N=int(SR*DUR)
B='build/ep6';B1='build/ep1';rng=np.random.default_rng(5)
script=json.load(open('ep6/script.json'));who={l['id']:l['who'] for l in script}
PAN={'Beto':-.45,'Diego':-.2,'Marta':.35,'Lucia':.15,'Tomas':0,'Sofi':-.05,'Sargento':.3,'Radio':0};GAIN={'Tomas':1.15,'Beto':1.0,'Diego':1.0,'Marta':1.0,'Lucia':1.0,'Sofi':1.1,'Sargento':1.0,'Radio':.9}
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
    x=load(f'{B}/voz_t/{lid}.mp3',('highpass=f=500,lowpass=f=3200,acrusher=bits=10:mix=.3,' if who[lid]=='Radio' else '')+'highpass=f=100,lowpass=f=9500,equalizer=f=3200:t=q:w=1:g=3,acompressor=threshold=0.1:ratio=3:attack=5:release=80:makeup=2,aecho=0.8:0.4:25|50:0.10|0.05')
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
# hook: roof door + run
sfx('roof_door',0.0,1.0,3);sfx('stairs_run',0,.5,5,fade=.3);sfx('roof_wind',0,.6,loop_to=E_['black']+1,fade=1.0)
sfx('monster_breath',E_['tease'],.5,3,fade=.3);sfx('heartbeat',E_['tease'],.5,6,fade=.5)
sfx('heli_land',E_['heli'],1.0,14,fade=1.0);sfx('radio_static',E_['heli']+.3,.7,3)
sfx('monster_step',E_['smoke'],.7,8,fade=.5);sfx('heartbeat',E_['smoke'],.5,8,fade=1.0)
sfx('claw_scrape',E_['rise']-.5,.9,6);sfx('building_crash',E_['rise'],.8,10,fade=.3);subboom(E_['rise']+1.0,.9,2.0)
sfx('monster_roar',E_['roar'],1.0,9);subboom(E_['roar'],1.0,2.4);sfx('glass_rain',E_['roar']+.3,.8,6)
sfx('building_crash',E_['crash'],1.0,10);subboom(E_['crash'],1.0,2.0);sfx('monster_breath',E_['crash']+1,.7,10,fade=.5)
sfx('winch',E_['cable'],.9,6);sfx('heli_land',E_['cable']+.5,.9,16,fade=1.0)
sfx('monster_roar',E_['lunge']-.4,1.0,9);sfx('monster_step',E_['lunge'],.9,6);subboom(E_['lunge'],1.0,2.0);hit1('hit',E_['lunge']+.9,.9,2.0)
tinnitus(E_['lunge']+1.2,.08)
sfx('heartbeat',E_['endcard']+.5,.5,8,fade=.5)
# ---------- music
M=np.zeros((N,2))
def mus(name,t,g,dur=None,fade=1.0,filt=None):
    x=load(f'{B}/music/{name}.mp3',filt);place(M,x,t,g,0,dur,fade)
mus('climb',0.5,.7,L('g5')-.5,fade=1.5)
mus('farewell',L('g4')-.5,.75,L('g6')-L('g4')+.5,fade=2.0)
mus('reveal',E_['heli']-.5,.85,E_['roar']-E_['heli']+.5,fade=2.0)
mus('climax',E_['roar']-.3,.95,E_['lunge']-E_['roar']+.5,fade=.5)
mus('end6',E_['lunge']-.2,.8,E_['black']-E_['lunge']+.2,fade=.3)
mus('end6',E_['endcard'],.6,DUR-E_['endcard'],fade=.8)
# ---------- duck + dips + mix
env=np.abs(V).max(axis=1);k=int(.03*SR);env=np.convolve(env,np.ones(k)/k,'same')
rel=np.exp(-1/(0.25*SR));e2=np.zeros_like(env);c=0.0;step=SR//200
for i in range(0,N,step):
    v=env[i:i+step].max();c=max(v,c*rel**step);e2[i:i+step]=c
env=np.clip(e2/0.12,0,1)
dip=np.ones(N)
for tb in (E_['roar'],E_['crash'],E_['lunge']):
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
