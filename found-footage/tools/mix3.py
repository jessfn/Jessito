import numpy as np,subprocess,json,os,sys
TL=json.load(open('ep1/timeline.json'));DUR=TL['dur'];SR=44100;N=int(SR*DUR)
AO=[a[0] for a in TL['anchors']];AN=[a[1] for a in TL['anchors']]
def W(t):return float(np.interp(t,AO,AN)) if t<=AO[-1] else t+TL['delay']
B='build/ep1';rng=np.random.default_rng(3)
START=TL['start']
script=json.load(open('ep1/script.json'));who={l['id']:l['who'] for l in script}
PAN={'Beto':-.35,'Diego':-.1,'Marta':.15,'Lucia':.4,'Tomas':0};GAIN={'Tomas':1.15,'Beto':1.0,'Diego':1.0,'Marta':1.0,'Lucia':1.0}
def load(path,filt=None):
    cmd=['ffmpeg','-v','error','-i',path]+(['-af',filt] if filt else [])+['-f','f32le','-ac','2','-ar',str(SR),'-']
    d=np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,dtype=np.float32);return d.reshape(-1,2).astype(np.float64)
def place(buf,x,t,g=1.0,pan=0.0,dur=None,fade=0.05):
    if dur is not None:x=x[:int(dur*SR)]
    x=x.copy();n=len(x);f=int(fade*SR)
    if f>0 and n>2*f:x[:f]*=np.linspace(0,1,f)[:,None];x[-f:]*=np.linspace(1,0,f)[:,None]
    l=g*(1-max(0,pan));r=g*(1+min(0,pan));x[:,0]*=l;x[:,1]*=r
    a=int(t*SR);b=min(N,a+n)
    if a<N:buf[a:b]+=x[:b-a]
def lp(x,fc):
    X=np.fft.rfft(x,axis=0);f=np.fft.rfftfreq(len(x),1/SR);X*=(1/(1+(f/fc)**4))[:,None];return np.fft.irfft(X,len(x),axis=0)
def hp(x,fc):
    X=np.fft.rfft(x,axis=0);f=np.fft.rfftfreq(len(x),1/SR);X*=((f/fc)**4/(1+(f/fc)**4))[:,None];return np.fft.irfft(X,len(x),axis=0)
def noise(n):return rng.standard_normal((n,2))*.3
t_=np.arange(N)/SR
# ---------- voices
V=np.zeros((N,2))
for lid,t0 in START.items():
    x=load(f'{B}/voz_es/{lid}.mp3','highpass=f=100,lowpass=f=9500,equalizer=f=3200:t=q:w=1:g=3,acompressor=threshold=0.1:ratio=3:attack=5:release=80:makeup=2,aecho=0.8:0.4:25|50:0.10|0.05')
    m=np.abs(x).max(axis=1);act=m>0.02;rms=np.sqrt(np.mean(m[act]**2)) if act.any() else .1
    x=x*(0.13/rms);pk=np.abs(x).max();x=x*min(1,0.85/pk)
    w=who[lid];place(V,x,t0,GAIN[w],PAN[w])
# ---------- sfx
S=np.zeros((N,2))
def sfx(name,t,g=1,dur=None,pan=0,fade=.05,loop_to=None,d='sfx'):
    x=load(f'{B}/{d}/{name}.mp3')
    if loop_to:
        reps=int(np.ceil(loop_to*SR/len(x)))+1;cf=int(1.0*SR);out=x
        for _ in range(reps):
            a=out[:-cf].copy();b=out[-cf:]*np.linspace(1,0,cf)[:,None]+x[:cf]*np.linspace(0,1,cf)[:,None];out=np.concatenate([a,b,x[cf:]])
        x=out;dur=loop_to
    place(S,x,t,g,pan,dur,fade)
sfx('roar',W(0.0),.95,2.4,fade=.15);sfx('hit',W(0.05),.9,2.4,fade=.1)
sfx('hit',W(7.0),.7,3.0,fade=.1)
sfx('rec_beep',W(10.0),.8);sfx('handling',W(10.2),.55)
for tt in (19.6,22.8,42.0,45.6,52.4,55.7,59.3):sfx('handling',W(tt),.25,3,fade=.3)
sfx('amb_party',W(10.0),.32,loop_to=W(67)-W(10),fade=1.0)
sfx('toast',W(64.8),.75)
sfx('blackout',W(67.0),1.0)
sfx('rumble',W(78.0),.55,10,fade=.8);sfx('boom_far',W(80.4),.9)
sfx('alarms',W(83.0),.22,12,fade=2.0)
sfx('rumble',W(91.6),.85,10,fade=.3);sfx('boom_far',W(92.0),1.0)
sfx('roar',W(100.0),1.0,7,fade=.1);sfx('alarms',W(100.3),.5,12,fade=.5);sfx('alarms',W(111.0),.5,10.4,fade=.5)
sfx('riser',W(105.0),.55,8,fade=.1);sfx('riser',W(111.4),.6,8,fade=.1)
sfx('collapse',W(116.0),1.0,5.4,fade=.05);sfx('roar',W(119.4),1.0,2.0,fade=.05);sfx('hit',W(119.5),1.0,2.0,fade=.02)

def s2(name,t,g=1,dur=None,pan=0,fade=.05,loop_to=None):sfx(name,t,g,dur,pan,fade,loop_to,d='sfx2')
SH=json.load(open('ep1/shots.json'))
# camera foley
for sh in SH[1:]:
    t0=W(sh[0]+.1)
    if sh[5]=='w':s2('whoosh',t0,.5,1.4,fade=.05)
    if sh[5]=='z':s2('zoom_motor',t0,.55,1.1,fade=.05)
    if sh[5]=='c':s2('cam_bump',t0,.6,1.0,fade=.02)
# party foley
s2('cake',W(41.2),.7,3);s2('pour',W(58.2),.6,3)
s2('laugh_group',W(22.6),.55,4);s2('laugh_group',W(54.4),.75,5);s2('laugh_group',W(64.6),.6,3.5)
# blackout & beyond
s2('wind2',W(67.0),.55,W(121.4)-W(67.0),fade=2.0,loop_to=W(121.4)-W(67.0))
s2('groan',W(78.0),.7,7,fade=.5);s2('heart',W(78.5),.6,8,fade=1);
s2('stinger',W(80.4),.9);s2('stinger',W(92.0),1.0)
s2('cups_fall',W(92.2),.9,4);s2('glass',W(92.8),.8)
s2('breath',W(93.5),.55,6,fade=.5);s2('heart',W(103),.7,8,fade=1)
s2('scream_far',W(100.6),.7,7,fade=.3);s2('siren_far',W(104),.5,12,fade=1);s2('scream_far',W(111.5),.65,6,fade=.3)
s2('fire2',W(95),.5,W(121.4)-W(95),fade=2,loop_to=W(121.4)-W(95))
s2('breath',W(112.5),.6,6,fade=.5);s2('debris',W(116.8),.8,5);s2('footsteps',W(114.8),.5,4)
glitch_f=None
def glitch(t0,t1,g):
    n=int((t1-t0)*SR);x=noise(n)*(rng.random((n//900+1,1)).repeat(900,0)[:n]>.5)*3;x=np.sign(x)*np.minimum(abs(x),1);place(S,x,t0,g,0,fade=.01)
glitch(2.0,2.4,.5);glitch(10.0,10.25,.35);glitch(W(66.95),W(67.2),.4);glitch(W(119.3),W(121.5),.45)
# ---------- music (ElevenLabs instrumental cues, scene by scene)
M=np.zeros((N,2))
def mus(name,t,g,dur=None,fade=1.0,filt=None,start=0.0):
    x=load(f'{B}/music/{name}.mp3',filt)[int(start*SR):]
    place(M,x,t,g,0,dur,fade)
mus('intro',3.0,.9,7.2,fade=.8)
party_end=W(67.0)
# party music heard through rooftop speakers (diegetic): band-limited
PM=np.zeros((N,2));x=load(f'{B}/music/party.mp3','highpass=f=120,lowpass=f=5200,equalizer=f=900:t=q:w=1:g=3')
place(PM,x,10.0,1.0,0,party_end-10.0,fade=.4)
# party dips while piano plays
pe=np.ones(N);a_=int(W(44.8)*SR);b_=int(W(60.5)*SR);pe[a_:b_]=.35
pe=np.convolve(pe,np.ones(int(.8*SR))/int(.8*SR),'same');PM*=pe[:,None]*.6
M+=PM
mus('piano',W(44.8),.8,W(60.5)-W(44.8),fade=2.0)
mus('blackout',W(67.0),.85,W(100)-W(67.0)+4,fade=1.5)
mus('dread',W(87.0),.8,W(116)-W(87.0)+2,fade=4.0)
mus('climax',W(99.8),1.0,W(121.4)-W(99.8),fade=.3)
mus('ending',W(122.4),.9,DUR-W(122.4),fade=.8)
# ---------- duck + mix (voices always on top)
env=np.abs(V).max(axis=1);k=int(.03*SR);env=np.convolve(env,np.ones(k)/k,'same')
# attack fast / release slow
rel=np.exp(-1/(0.25*SR));e2=np.zeros_like(env);c=0.0
step=SR//200
for i in range(0,N,step):
    v=env[i:i+step].max();c=max(v,c*rel**step);e2[i:i+step]=c
env=np.clip(e2/0.12,0,1)
S=S/ max(1e-9,np.abs(S).max())*0.95
M=M/ max(1e-9,np.abs(M).max())*0.50
mix=V+S*(1-.42*env)[:,None]+M*(1-.55*env)[:,None]
out=(np.clip(np.tanh(mix*1.05)*.95,-1,1)*32767).astype('<i2')
open(f'{B}/mix_raw.raw','wb').write(out.tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-f','s16le','-ar',str(SR),'-ac','2','-i',f'{B}/mix_raw.raw','-af','loudnorm=I=-15:TP=-1.5:LRA=9','-ar','44100',f'{B}/mix.wav'])
print('mix done',os.path.getsize(f'{B}/mix.wav'))
# diagnostics
vr=np.sqrt(np.mean(V[env>.5]**2));sr=np.sqrt(np.mean(((S*(1-.42*env)[:,None]+M*(1-.55*env)[:,None]))[env>.5]**2))
print('during speech: voice rms %.3f  sfx+music rms %.3f  ratio %.1f dB'%(vr,sr,20*np.log10(vr/sr)))
