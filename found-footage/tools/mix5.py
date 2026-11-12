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
    x=load(f'{B}/voz_e_t/{lid}.mp3','highpass=f=100,lowpass=f=9500,equalizer=f=3200:t=q:w=1:g=3,acompressor=threshold=0.1:ratio=3:attack=5:release=80:makeup=2,aecho=0.8:0.4:25|50:0.10|0.05')
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

def subboom(t,g,dur=1.6,f0=75,f1=26):
    n=int(dur*SR);tt=np.arange(n)/SR;ph=2*np.pi*(f1*tt+(f0-f1)*(1-np.exp(-tt*5))/5);x=np.sin(ph)*np.exp(-tt*2.2);place(S,np.stack([x,x],1),t,g,0,fade=.005)
def tinnitus(t,g,dur=2.6):
    n=int(dur*SR);tt=np.arange(n)/SR;x=(np.sin(2*np.pi*3900*tt)+.5*np.sin(2*np.pi*4300*tt))*np.exp(-tt*1.3)*np.minimum(1,tt*40);place(S,np.stack([x,x],1),t,g,0,fade=.01)
# hook + intro
sfx('roar',0.0,.95,2.4,fade=.15,d='sfx');sfx('hit',0.05,.9,2.4,fade=.1,d='sfx');glitch(2.0,2.4,.5)
sfx('hum',3.0,.35,6.0,fade=1.0);sfx('hit',7.0,.8,3.0,fade=.1,d='sfx')
sfx('rec_beep',10.0,.7,d='sfx');glitch(10.0,10.25,.35);sfx('rustle',10.2,.4,4)
for t in (S_['l1']+3,S_['a2']-.3,S_['l9']+4):sfx('rustle',t,.22,3.0,fade=.4)
# party bed (diegetic)
sfx('crowd_party',10.0,.85,loop_to=E['tB']-10.0,fade=1.0,d='sfx4')
sfx('cheers',S_['l10']+3.2,.95,5,d='sfx4')
sfx('flicker',E['flick0'],.9,1.4,fade=.05)
sfx('lights_out',E['tB'],1.0,4,fade=.02);glitch(E['tB']-.05,E['tB']+.2,.4)
sfx('crowd_gasp',E['tB']+.3,.8,6,d='sfx4')
sfx('silence_ring',E['tB']+.5,.7,loop_to=E['rumble0']-E['tB']+2.0,fade=1.0)
ramp('wind_cold',E['tB'],E['collapse'],.3,.4)
sfx('siren',E['tB']+3,.3,12,fade=1.5)
sfx('rumble1',E['rumble0'],.95,10,fade=.8);sfx('metal_creak',E['rumble0']+.8,.6,8,fade=.5)
sfx('boom1',E['boom1'],1.0,7,fade=.02);subboom(E['boom1'],.9);sfx('heart',E['boom1']+1.0,.6,8,fade=1)
sfx('rumble2',E['boom2']-1.2,1.0,10,fade=.2);sfx('boom2',E['boom2'],1.0,7,fade=.02);subboom(E['boom2'],1.0);tinnitus(E['boom2']+.1,.07)
sfx('cups_fall',E['boom2']+.3,.9,4,d='sfx2');sfx('glass',E['boom2']+.8,.8,2,d='sfx2');sfx('debris',E['boom2']+1.6,.6,6);sfx('metal_creak',E['boom2']+2.2,.7,8)
sfx('crowd_panic',E['boom2']+.3,.9,8,d='sfx4')
sfx('breath',S_['l16']+2.2,.5,8,fade=.5);sfx('heart',E['roar']-5,.7,8,fade=1)
sfx('roar',E['roar'],1.0,9,fade=.05);subboom(E['roar'],.7,2.0)
sfx('roar2',E['roar']+4.5,.75,8,fade=.1)
sfx('alarms',E['roar']+.6,.55,12,fade=.5);sfx('screams',E['roar']+3,.6,8,fade=.3)
sfx('steps',E['roar']+5.0,.95,12,fade=.3);sfx('helicopter',E['roar']+8,.65,10,fade=1)
sfx('siren',E['roar']+6,.5,12,fade=1);sfx('screams',S_['l18']+3,.55,8,fade=.3)
ramp('fire',E['roar']+2,E['fall'],.1,.45)
sfx('collapse',E['collapse'],1.0,E['fall']-E['collapse'],fade=.04);subboom(E['collapse'],.8,2.0)
sfx('debris',E['collapse']+1.0,.7,6);sfx('breath',S_['l20']+.5,.45,6,fade=.3)
sfx('roar2',E['impact']-.5,1.0,1.8,fade=.03);sfx('hit',E['impact'],1.0,2.0,fade=.02,d='sfx');subboom(E['impact'],1.0);tinnitus(E['impact'],.08)
glitch(E['impact']-.2,E['black'],.45)
sfx('static',E['black'],.5,2.0,fade=.05)
sfx('silence_ring',E['endcard'],.5,loop_to=DUR-E['endcard'],fade=1.0);sfx('heart',E['endcard']+.5,.5,8,fade=.5)
# ---------- music
M=np.zeros((N,2))
def mus(name,t,g,dur=None,fade=1.0,filt=None,buf=None):
    x=load(f'{B}/music/{name}.mp3',filt);place(M if buf is None else buf,x,t,g,0,dur,fade)
mus('intro',3.0,.9,7.2,fade=.8)
PM=np.zeros((N,2));mus('party',10.0,1.0,E['tB']-10.0,fade=.3,filt='highpass=f=90,lowpass=f=7500,equalizer=f=1800:t=q:w=1:g=2',buf=PM)
pe=np.ones(N);a_=int((S_['l8']-.5)*SR);b_=int((S_['l9']+TL['durs']['l9']+.8)*SR);pe[a_:b_]=.35
pe=np.convolve(pe,np.ones(int(.8*SR))/int(.8*SR),'same');M+=PM*pe[:,None]*.9
mus('piano',S_['l8']-.5,.7,S_['l9']+TL['durs']['l9']-S_['l8']+1.5,fade=1.5)
mus('blackout',E['tB'],.9,E['roar']-E['tB']+4,fade=1.5)
mus('dread',E['boom2']+1.0,.85,E['collapse']-E['boom2']+2,fade=4.0)
mus('climax',E['roar']-.3,1.0,E['fall']-E['roar']+.3,fade=.3)
mus('ending',E['endcard'],.9,DUR-E['endcard'],fade=.8)
# ---------- duck + dips + mix
env=np.abs(V).max(axis=1);k=int(.03*SR);env=np.convolve(env,np.ones(k)/k,'same')
rel=np.exp(-1/(0.25*SR));e2=np.zeros_like(env);c=0.0;step=SR//200
for i in range(0,N,step):
    v=env[i:i+step].max();c=max(v,c*rel**step);e2[i:i+step]=c
env=np.clip(e2/0.12,0,1)
dip=np.ones(N)
for tb in (E['boom1'],E['boom2'],E['roar'],E['collapse'],E['impact']):
    a=int((tb-.5)*SR);b=int(tb*SR);dip[a:b]=.12
dip=np.convolve(dip,np.ones(int(.06*SR))/int(.06*SR),'same')
S=S/max(1e-9,np.abs(S).max())*0.95
M=M/max(1e-9,np.abs(M).max())*0.50
mix=V+(S*(1-.52*env)[:,None]+M*(1-.62*env)[:,None])*dip[:,None]
out=(np.clip(np.tanh(mix*1.05)*.95,-1,1)*32767).astype('<i2')
open(f'{B}/mix_raw.raw','wb').write(out.tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-f','s16le','-ar',str(SR),'-ac','2','-i',f'{B}/mix_raw.raw','-af','loudnorm=I=-15:TP=-1.5:LRA=14','-ar','44100',f'{B}/mix.wav'])
vr=np.sqrt(np.mean(V[env>.5]**2));sr=np.sqrt(np.mean(((S*(1-.52*env)[:,None]+M*(1-.62*env)[:,None]))[env>.5]**2))
print('mix done; during speech: voice rms %.3f  sfx+music rms %.3f  ratio %.1f dB'%(vr,sr,20*np.log10(vr/sr)))
