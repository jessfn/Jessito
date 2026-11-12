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
def sfx(name,t,g=1,dur=None,pan=0,fade=.05,loop_to=None):
    x=load(f'{B}/sfx/{name}.mp3')
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
# synth wind + fire + glitch
def wind(t0,t1,g):
    n=int((t1-t0)*SR);x=lp(noise(n),500)*4;m=1+.5*np.sin(np.arange(n)/SR*.4)[:,None]+.3*np.sin(np.arange(n)/SR*1.1)[:,None];x*=m
    ramp=np.linspace(0,1,n)[:,None]**.5;place(S,x*ramp,t0,g,0,fade=1.0)
wind(W(67),W(121.4),.22)
def fire(t0,t1,g):
    n=int((t1-t0)*SR);x=hp(noise(n),2000)*(rng.random((n,1))>.995)*8;x=lp(x,6000)+lp(noise(n),300)*.5;place(S,x,t0,g,0,fade=1.0)
fire(W(95),W(121.4),.12)
def glitch(t0,t1,g):
    n=int((t1-t0)*SR);x=noise(n)*(rng.random((n//900+1,1)).repeat(900,0)[:n]>.5)*3;x=np.sign(x)*np.minimum(abs(x),1);place(S,x,t0,g,0,fade=.01)
glitch(2.0,2.4,.5);glitch(10.0,10.25,.35);glitch(W(66.95),W(67.2),.4);glitch(W(119.3),W(121.5),.45)
# ---------- music
def kick(f0=130,f1=42,d=.22):
    n=int(d*SR);t=np.arange(n)/SR;ph=2*np.pi*(f1*t+(f0-f1)*(1-np.exp(-t*30))/30);return np.sin(ph)*np.exp(-t*14)
def saw(f,n):t=np.arange(n)/SR;return 2*((t*f)%1)-1
M=np.zeros((N,2))
bpm=118;beat=60/bpm
a0=int(10*SR);a1=int(W(67)*SR);Pm=np.zeros(a1-a0)
nb=int((W(67)-10)/beat)
bass=[55,55,65.4,82.4,55,55,73.4,82.4]
for i in range(nb):
    o=int(i*beat*SR);k=kick();Pm[o:o+len(k)]+=k[:len(Pm)-o]*.9
    if i%2==1:
        h=hp(noise(int(.06*SR)),6000)[:,0]*np.exp(-np.arange(int(.06*SR))/SR*60);Pm[o+int(beat*SR/2):o+int(beat*SR/2)+len(h)]+=h[:max(0,len(Pm)-o-int(beat*SR/2))][:len(h)]*.7 if o+int(beat*SR/2)+len(h)<len(Pm) else 0
    f=bass[i%8];n=int(beat*SR*.9);env=np.exp(-np.arange(n)/SR*4);bs=(saw(f,n)*env)
    Pm[o:o+n]+=lp(bs[:,None],400)[:,0][:min(n,len(Pm)-o)]*.55 if o+n<len(Pm) else 0
chords=[(220,261.6,329.6),(174.6,220,261.6),(261.6,329.6,392),(196,246.9,293.7)]
for i in range(int((W(67)-10)/(beat*4))):
    o=int(i*beat*4*SR);n=int(beat*4*SR);ch=chords[i%4]
    pad=sum(saw(f,n)+saw(f*1.004,n) for f in ch)*.08;env=np.minimum(1,np.arange(n)/SR*2)*np.minimum(1,(n-np.arange(n))/SR*2)
    seg=lp((pad*env)[:,None],1800)[:,0]
    if o+n<=len(Pm):Pm[o:o+n]+=seg*.5
Pst=np.stack([Pm,Pm],1);Pst=lp(Pst,1100)*1.1  # muffled speakers
fadeout=int(.03*SR);Pst[-fadeout:]*=np.linspace(1,0,fadeout)[:,None]
M[a0:a1]+=Pst*.55
# dark drone from 3.0-7.0 and 67-121.4, ending pulse 122.4-136
def drone(t0,t1,g0,g1):
    n=int((t1-t0)*SR);t=np.arange(n)/SR;lfo=1+.3*np.sin(t*.35)
    x=(np.sin(2*np.pi*41.2*t)+.7*np.sin(2*np.pi*55*t*(1+.002*np.sin(t*.2)))+.35*saw(82.4,n)*.5+.15*np.sin(2*np.pi*233*t)*np.sin(t*.13)**2+.12*np.sin(2*np.pi*246.9*t)*np.sin(t*.17)**2)*lfo
    x=lp(x[:,None],700)[:,0]*np.linspace(g0,g1,n);st=np.stack([x,x],1);place(M,st,t0,1,0,fade=1.5)
drone(3.0,7.2,.0,.5);drone(W(67.0),W(121.4),.28,.85);drone(W(122.4),DUR,.5,.12)
def heart(t0,t1,g):
    t=t0
    while t<t1:
        bp=0.85-0.3*(t-t0)/(t1-t0)
        for d,gg in((0,1),(.2,.7)):
            k=kick(90,38,.18)[:,None].repeat(2,1);place(M,k,t+d,g*gg,0,fade=.005)
        t+=bp
heart(W(78),W(100),.5);heart(W(122.6),DUR,.35)
# ---------- duck + mix (voices always on top)
env=np.abs(V).max(axis=1);k=int(.03*SR);env=np.convolve(env,np.ones(k)/k,'same')
# attack fast / release slow
rel=np.exp(-1/(0.25*SR));e2=np.zeros_like(env);c=0.0
step=SR//200
for i in range(0,N,step):
    v=env[i:i+step].max();c=max(v,c*rel**step);e2[i:i+step]=c
env=np.clip(e2/0.12,0,1)
S=S/ max(1e-9,np.abs(S).max())*0.55
M=M/ max(1e-9,np.abs(M).max())*0.30
mix=V+S*(1-.72*env)[:,None]+M*(1-.78*env)[:,None]
out=(np.clip(np.tanh(mix*1.05)*.95,-1,1)*32767).astype('<i2')
open(f'{B}/mix_raw.raw','wb').write(out.tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-f','s16le','-ar',str(SR),'-ac','2','-i',f'{B}/mix_raw.raw','-af','loudnorm=I=-15:TP=-1.5:LRA=9','-ar','44100',f'{B}/mix.wav'])
print('mix done',os.path.getsize(f'{B}/mix.wav'))
# diagnostics
vr=np.sqrt(np.mean(V[env>.5]**2));sr=np.sqrt(np.mean(((S*(1-.72*env)[:,None]+M*(1-.78*env)[:,None]))[env>.5]**2))
print('during speech: voice rms %.3f  sfx+music rms %.3f  ratio %.1f dB'%(vr,sr,20*np.log10(vr/sr)))
