import numpy as np,subprocess,json,os
TL=json.load(open('ep4/timeline.json'));S_=TL['start'];E=TL['ev'];DUR=TL['dur'];SR=44100;N=int(SR*DUR)
B='build/ep4';B1='build/ep1';rng=np.random.default_rng(5)
script=json.load(open('ep4/script.json'));who={l['id']:l['who'] for l in script}
PAN={'Beto':-.45,'Diego':-.2,'Marta':.35,'Lucia':.15,'Tomas':0,'Sofi':-.05,'Soldado':-.3};GAIN={'Tomas':1.15,'Beto':1.0,'Diego':1.0,'Marta':1.0,'Lucia':1.0,'Sofi':1.1,'Soldado':.9}
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
    x=load(f'{B}/voz_t/{lid}.mp3',('lowpass=f=3200,' if who[lid]=='Soldado' else '')+'highpass=f=100,lowpass=f=9500,equalizer=f=3200:t=q:w=1:g=3,acompressor=threshold=0.1:ratio=3:attack=5:release=80:makeup=2,aecho=0.8:0.4:25|50:0.10|0.05')
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
# hook: train arrives
sfx('train_arrive',0.0,1.0,8,fade=.1);sfx('station_amb',0,.5,loop_to=E_['jump'],fade=.5)
subboom(E_['stop']-.2,.7,1.4)
# station
sfx('train_doors',E_['doors'],1.0,4)
sfx('light_flicker',E_['flick'],.7,5)
sfx('heartbeat',E_['pass']-1,.6,8,fade=1.0)
sfx('ceiling_skitter',E_['creat'],.9,8,fade=.5)
sfx('creatures_drop',E_['drop'],1.0,5);hit1('hit',E_['drop'],.6,2.0)
sfx('ceiling_skitter',E_['drop']+1.0,.8,5,fade=.3)
# tunnel
sfx('tunnel_amb',E_['jump'],.8,loop_to=E_['black']-E_['jump'],fade=.6)
sfx('footsteps_rails',E_['jump']+.6,.6,E_['crack']-E_['jump'],fade=.5)
sfx('light_flicker',L('c11'),.6,4)
sfx('quake_rumble',E_['tremor'],1.0,8,fade=.5)
sfx('train_crush',E_['crush']-.3,1.0,8);subboom(E_['crush'],1.0,2.0);hit1('hit',E_['crush'],.8,2.0);tinnitus(E_['crush']+.2,.07)
sfx('footsteps_rails',E_['crush']+1.2,.8,3,fade=.2)
sfx('door_bang',L('c16'),1.0,5)
sfx('door_push',E_['open']-.3,1.0,3);sfx('rifle_cock',E_['open']+.2,.9,4)
hit1('hit',E_['open'],.7,2.0);subboom(E_['black']-.2,.9,1.6)
sfx('heartbeat',E_['endcard']+.5,.5,8,fade=.5)
# ---------- music
M=np.zeros((N,2))
def mus(name,t,g,dur=None,fade=1.0,filt=None):
    x=load(f'{B}/music/{name}.mp3',filt);place(M,x,t,g,0,dur,fade)
mus('platform',0.5,.7,E_['jump']-.5,fade=1.5)
mus('tunnel',E_['jump']-.5,.8,E_['tremor']-E_['jump']+.5,fade=2.0)
mus('crush',E_['tremor']-.5,.95,E_['open']-E_['tremor']+.5,fade=.8)
mus('end4',E_['open']-.3,.8,E_['black']-E_['open']+.3,fade=.5)
mus('end4',E_['endcard'],.7,DUR-E_['endcard'],fade=.8)
# ---------- duck + dips + mix
env=np.abs(V).max(axis=1);k=int(.03*SR);env=np.convolve(env,np.ones(k)/k,'same')
rel=np.exp(-1/(0.25*SR));e2=np.zeros_like(env);c=0.0;step=SR//200
for i in range(0,N,step):
    v=env[i:i+step].max();c=max(v,c*rel**step);e2[i:i+step]=c
env=np.clip(e2/0.12,0,1)
dip=np.ones(N)
for tb in (E_['crush'],E_['open'],E_['drop']):
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
