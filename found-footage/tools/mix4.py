import numpy as np,subprocess,json,os
TL=json.load(open('ep1/timeline.json'));S_=TL['start'];E=TL['ev'];DUR=TL['dur'];SR=44100;N=int(SR*DUR)
B='build/ep1';rng=np.random.default_rng(5)
script=json.load(open('ep1/script.json'));who={l['id']:l['who'] for l in script}
PAN={'Beto':-.35,'Diego':-.1,'Marta':.15,'Lucia':.4,'Tomas':0};GAIN={'Tomas':1.15,'Beto':1.0,'Diego':1.0,'Marta':1.0,'Lucia':1.0}
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
    x=load(f'{B}/voz_c/{lid}.mp3','highpass=f=100,lowpass=f=9500,equalizer=f=3200:t=q:w=1:g=3,acompressor=threshold=0.1:ratio=3:attack=5:release=80:makeup=2,aecho=0.8:0.4:25|50:0.10|0.05')
    m=np.abs(x).max(axis=1);act=m>0.02;rms=np.sqrt(np.mean(m[act]**2)) if act.any() else .1
    x=x*(0.13/rms);pk=np.abs(x).max();x=x*min(1,0.85/pk)
    w=who[lid];place(V,x,t0,GAIN[w],0 if lid=='l0' else PAN[w])
# ---------- sfx
S=np.zeros((N,2))
def sfx(name,t,g=1,dur=None,pan=0,fade=.05,loop_to=None,d='sfx3'):
    x=load(f'{B}/{d}/{name}.mp3')
    if loop_to:x=loop(x,loop_to);dur=loop_to
    place(S,x,t,g,pan,dur,fade)
def ramp(name,t0,t1,g0,g1,d='sfx3'):
    x=loop(load(f'{B}/{d}/{name}.mp3'),t1-t0);x=x*np.linspace(g0,g1,len(x))[:,None];place(S,x,t0,1,0,None,fade=1.0)
def glitch(t0,t1,g):
    n=int((t1-t0)*SR);x=noise(n)*(rng.random((n//900+1,1)).repeat(900,0)[:n]>.5)*3;x=np.sign(x)*np.minimum(abs(x),1);place(S,x,t0,g,0,fade=.01)
# hook + intro
sfx('roar',0.0,.95,2.4,fade=.15,d='sfx');sfx('hit',0.05,.9,2.4,fade=.1,d='sfx');glitch(2.0,2.4,.5)
sfx('hum',3.0,.35,7.0,fade=1.0);sfx('hit',7.0,.8,3.0,fade=.1,d='sfx')
sfx('rec_beep',10.0,.7,d='sfx');glitch(10.0,10.25,.35);sfx('rustle',10.2,.4,4)
for t in (S_['l1']-.4,S_['l7']-.6,S_['l14']-.5):sfx('rustle',t,.22,3.5,fade=.4)
# rooftop at night: unease
sfx('amb_roof',10.0,.55,loop_to=E['tB']-10.0,fade=1.0)
ramp('wind_cold',10.0,E['tB'],.15,.35)
ramp('dogs',S_['l5']-6.0,E['birds']+2.0,.08,.6)
sfx('birds',E['birds']-.2,.95,6,fade=.05)
ramp('hum',E['flick0']-5.0,E['tB'],.05,.5)
sfx('static',S_['l8']-.4,.55,4,fade=.1)
sfx('flicker',E['flick0'],.85,5,fade=.05);sfx('flicker',E['flick0']+3.5,.6,1.8,fade=.05);sfx('flicker',E['flick0']+6.0,.7,2.0,fade=.05)
# blackout
sfx('lights_out',E['tB'],1.0,4,fade=.02);glitch(E['tB']-.05,E['tB']+.2,.4)
sfx('silence_ring',E['tB']+.5,.7,loop_to=E['rumble0']-E['tB']+2.0,fade=1.0)
ramp('wind_cold',E['tB'],E['collapse'],.3,.4)
sfx('siren',E['tB']+4,.25,12,fade=1.5)
sfx('rumble1',E['rumble0'],.95,10,fade=.8);sfx('metal_creak',E['rumble0']+1.2,.6,8,fade=.5)
sfx('boom1',E['boom1'],1.0,7,fade=.02);sfx('heart',E['boom1']+1.0,.6,8,fade=1)
# second quake
sfx('rumble2',E['boom2']-1.2,1.0,10,fade=.2);sfx('boom2',E['boom2'],1.0,7,fade=.02)
sfx('cups_fall',E['boom2']+.3,.9,4,d='sfx2');sfx('glass',E['boom2']+.8,.8,2,d='sfx2');sfx('debris',E['boom2']+1.6,.6,6);sfx('metal_creak',E['boom2']+2.2,.7,8)
sfx('breath',S_['l13']+2.5,.5,8,fade=.5);sfx('heart',E['roar']-7,.7,8,fade=1)
# monster
sfx('roar',E['roar'],1.0,9,fade=.05);sfx('roar2',E['roar']+4.5,.75,8,fade=.1)
sfx('alarms',E['roar']+.6,.55,12,fade=.5);sfx('screams',E['roar']+3,.6,8,fade=.3)
sfx('steps',E['roar']+5.0,.95,12,fade=.3);sfx('helicopter',E['roar']+8,.65,10,fade=1)
sfx('siren',E['roar']+6,.5,12,fade=1);sfx('screams',S_['l15']+3,.55,8,fade=.3)
ramp('fire',E['roar']+2,E['fall'],.1,.45)
sfx('steps',E['roar']+16,.95,min(12,E['collapse']-E['roar']-16),fade=.3)
# collapse and impact
sfx('collapse',E['collapse'],1.0,E['fall']-E['collapse'],fade=.04)
sfx('debris',E['collapse']+1.0,.7,6);sfx('breath',S_['l17']+.5,.45,6,fade=.3)
sfx('roar2',E['impact']-.5,1.0,1.8,fade=.03);sfx('hit',E['impact'],1.0,2.0,fade=.02,d='sfx')
glitch(E['impact']-.2,E['black'],.45)
sfx('static',E['black'],.5,2.0,fade=.05)
sfx('silence_ring',E['endcard'],.5,loop_to=DUR-E['endcard'],fade=1.0);sfx('heart',E['endcard']+.5,.5,8,fade=.5)
# ---------- music
M=np.zeros((N,2))
def mus(name,t,g,dur=None,fade=1.0,filt=None):
    x=load(f'{B}/music/{name}.mp3',filt);place(M,x,t,g,0,dur,fade)
mus('intro',3.0,.9,7.2,fade=.8)
mus('distant_party',10.0,.5,E['flick0']-10.0,fade=1.5,filt='highpass=f=140,lowpass=f=1800')
mus('uneasy',S_['l1']-1.0,.55,S_['l7']-S_['l1']+4,fade=3.0)
mus('musicbox',S_['l7']-1.0,.6,E['tB']-S_['l7']+1.0,fade=2.0)
mus('blackout',E['tB'],.9,E['roar']-E['tB']+4,fade=1.5)
mus('dread',E['boom2']+1.0,.85,E['collapse']-E['boom2']+2,fade=4.0)
mus('climax',E['roar']-.3,1.0,E['fall']-E['roar']+.3,fade=.3)
mus('ending',E['endcard'],.9,DUR-E['endcard'],fade=.8)
# ---------- duck + mix
env=np.abs(V).max(axis=1);k=int(.03*SR);env=np.convolve(env,np.ones(k)/k,'same')
rel=np.exp(-1/(0.25*SR));e2=np.zeros_like(env);c=0.0;step=SR//200
for i in range(0,N,step):
    v=env[i:i+step].max();c=max(v,c*rel**step);e2[i:i+step]=c
env=np.clip(e2/0.12,0,1)
S=S/max(1e-9,np.abs(S).max())*0.95
M=M/max(1e-9,np.abs(M).max())*0.50
mix=V+S*(1-.52*env)[:,None]+M*(1-.62*env)[:,None]
out=(np.clip(np.tanh(mix*1.05)*.95,-1,1)*32767).astype('<i2')
open(f'{B}/mix_raw.raw','wb').write(out.tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-f','s16le','-ar',str(SR),'-ac','2','-i',f'{B}/mix_raw.raw','-af','loudnorm=I=-15:TP=-1.5:LRA=14','-ar','44100',f'{B}/mix.wav'])
vr=np.sqrt(np.mean(V[env>.5]**2));sr=np.sqrt(np.mean(((S*(1-.52*env)[:,None]+M*(1-.62*env)[:,None]))[env>.5]**2))
print('mix done; during speech: voice rms %.3f  sfx+music rms %.3f  ratio %.1f dB'%(vr,sr,20*np.log10(vr/sr)))
