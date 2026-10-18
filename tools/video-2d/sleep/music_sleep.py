import numpy as np, json, wave, sys
S=sys.argv[1]
SR=44100
d=json.load(open(f'{S}/w_sleep/timeline.json'))
starts=d['starts']; total=d['total']; segs=d['segs']
n=int((total+0.5)*SR); t=np.arange(n)/SR
rng=np.random.default_rng(7)
bpm=76; beat=60/bpm
def env_exp(tt,dec): return np.exp(-tt/dec)
mix=np.zeros(n)
# voice file
v=np.zeros(n)
for i,s in enumerate(starts):
    w=wave.open(f'{S}/w_sleep/s{i}.wav'); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768.0
    a=int(s*SR); dd=int(segs[i]['dur']*SR); x=x[:dd].copy(); x[-int(0.05*SR):]*=np.linspace(1,0,int(0.05*SR)); v[a:a+len(x)]+=x[:n-a]
# music
def note(f): return 440*2**((f-69)/12)
chords=[(45,[45,48,52]),(41,[41,45,48]),(38,[38,41,45]),(40,[40,44,47])]
barlen=4*beat
pad=np.zeros(n); bass=np.zeros(n); arp=np.zeros(n)
nb=int(total/barlen)+2
for b in range(nb):
    root,tri=chords[b%4]
    a=int(b*barlen*SR); L=int(barlen*SR*1.05)
    if a>=n: break
    L=min(L,n-a); tt=np.arange(L)/SR
    e=np.minimum(tt/0.6,1)*np.minimum((barlen*1.05-tt)/0.5,1).clip(0,1)
    for nt in tri:
        f=note(nt+12)
        for dt in (-0.4,0.4):
            pad[a:a+L]+=0.05*np.sin(2*np.pi*(f+dt)*tt)*e
            pad[a:a+L]+=0.02*np.sin(2*np.pi*2*(f+dt)*tt)*e
    for k in (0,2):
        o=int(k*beat*SR); l=min(int(beat*2*SR),n-a-o)
        if l<=0: continue
        tb=np.arange(l)/SR
        bass[a+o:a+o+l]+=0.30*np.sin(2*np.pi*note(root-12)*tb)*env_exp(tb,0.5)
    ar=[tri[0],tri[1],tri[2],tri[1]+12,tri[2],tri[1],tri[0]+12,tri[1]]
    for k in range(8):
        o=int(k*beat/2*SR); l=min(int(0.5*SR),n-a-o)
        if l<=0: continue
        tb=np.arange(l)/SR; f=note(ar[k]+12)
        arp[a+o:a+o+l]+=0.06*(np.sin(2*np.pi*f*tb)+0.3*np.sin(2*np.pi*2*f*tb))*env_exp(tb,0.18)
# echo on arp
dl=int(beat*0.75*SR); arp2=arp.copy(); arp2[dl:]+=0.45*arp[:-dl]
# drums
kick=np.zeros(n); hat=np.zeros(n)
for k in range(int(total/beat)+2):
    a=int(k*beat*SR)
    if a>=n: break
    l=min(int(0.3*SR),n-a); tb=np.arange(l)/SR
    ph=2*np.pi*(45*tb+105*(1-np.exp(-tb*30))/30)
    kick[a:a+l]+=0.14*np.sin(ph)*env_exp(tb,0.09)
    a2=a+int(beat/2*SR); l=min(int(0.06*SR),n-a2)
    if l>0:
        nz=rng.standard_normal(l); nz=np.diff(nz,prepend=0)
        hat[a2:a2+l]+=0.03*nz*env_exp(np.arange(l)/SR,0.02)
# impacts + whooshes at each scene start
fx=np.zeros(n)
for s in starts[1:]:
    a=int(s*SR)
    l=min(int(0.7*SR),n-a); tb=np.arange(l)/SR
    fx[a:a+l]+=0.22*np.sin(2*np.pi*(38+70*np.exp(-tb*9))*tb)*env_exp(tb,0.25)
    wl=int(0.45*SR); a0=max(0,a-wl); L=a-a0
    if L>0:
        nz=rng.standard_normal(L)
        k=np.ones(40)/40; nz=np.convolve(nz,k,'same')*6
        fx[a0:a]+=0.05*nz*(np.arange(L)/L)**2
# riser before last scene end
a=int((starts[-1]-1.2)*SR)
# music bed
m=pad+bass+arp2+kick+hat
# energy shape: calmer in the dark middle scenes, up for finale
g=np.interp(t,[0,starts[3],starts[5],starts[7],total+0.5],[1.0,0.7,0.85,1.1,0.9])
m=m*g+fx
# ================= SOUND EFFECTS (synchronised with on-screen events) =================
sfx=np.zeros(n)
def wt(seg,key):
    for w in segs[seg]['words']:
        if key in w[0].lower(): return starts[seg]+w[1]
    return starts[seg]+0.5
def put(t0,x,g=1.0):
    a=int(t0*SR)
    if a<0 or a>=n: return
    l=min(len(x),n-a); sfx[a:a+l]+=x[:l]*g
def tt_(d): return np.arange(int(d*SR))/SR
def padd(*xs):
    L=max(len(x) for x in xs); o=np.zeros(L)
    for x in xs: o[:len(x)]+=x
    return o
def reverb(x,tail=1.1,mix=0.35,seed=3):
    r=np.random.default_rng(seed); L=int(tail*SR); ir=r.standard_normal(L)*np.exp(-np.arange(L)/SR/(tail/4.0))
    ir=np.convolve(ir,np.ones(8)/8,'same'); ir/=np.max(np.abs(ir))
    N=len(x)+L; X=np.fft.rfft(x,N); Y=np.fft.rfft(ir,N); y=np.fft.irfft(X*Y,N)[:len(x)+L]
    y*=np.max(np.abs(x))/max(1e-9,np.max(np.abs(y)))*mix
    out=np.zeros(len(x)+L); out[:len(x)]+=x*(1-mix*0.5); out+=y; return out
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s_=0.0
    for i in range(len(x)): s_=(1-a)*x[i]+a*s_; y[i]=s_
    return y
def bp_noise(d,f0,f1,seed=1):
    r=np.random.default_rng(seed); x=r.standard_normal(int(d*SR))
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); m=((fr>f0)&(fr<f1)).astype(float); m=np.convolve(m,np.ones(21)/21,'same')
    y=np.fft.irfft(X*m,len(x)); return y/np.max(np.abs(y))
def impact(d=1.6,f0=70,boom=1.0,noise=0.5,seed=2):
    t=tt_(d); y=boom*np.sin(2*np.pi*(f0*0.45+f0*np.exp(-t*9))*t)*np.exp(-t/0.45)
    y+=noise*bp_noise(d,200,6000,seed)*np.exp(-t/0.12)
    y+=0.25*np.sin(2*np.pi*(f0*2.1)*t)*np.exp(-t/0.25)
    return y
def whoosh(d=0.6,rising=True,seed=5):
    t=tt_(d); x=bp_noise(d,300,5000,seed); e=(t/d)**2*(1-t/d)**0.5*3.2 if rising else (1-t/d)**2*(t/d)**0.3*3.2
    return x*np.clip(e,0,1.2)
def ping(f=1400,d=1.4,decay=0.35):
    t=tt_(d); return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*f*2.01*t))*np.exp(-t/decay)
def bell(f=880,d=1.6):
    t=tt_(d); y=0
    for k,(m,a) in enumerate([(1,1),(2.76,.5),(5.4,.25),(1.5,.4)]): y=y+a*np.sin(2*np.pi*f*m*t)*np.exp(-t/(0.55/(1+0.4*k)))
    return y*(1-np.exp(-t/0.003))
def click(f=1600,d=0.035,g=1.0):
    t=tt_(d); return g*np.sin(2*np.pi*f*t)*np.exp(-t/0.008)+0.4*bp_noise(d,2000,8000,int(f))*np.exp(-t/0.006)
def thump(d=0.35,f=58):
    t=tt_(d); return np.sin(2*np.pi*(f+60*np.exp(-t*25))*t)*np.exp(-t/0.10)
def heart(t0,g=1.0):
    put(t0,thump(0.4,52),0.75*g); put(t0+0.16,thump(0.35,44),0.5*g)
import math
def prng(i):
    v=math.sin(i*127.1+311.7)*43758.5453
    return v-math.floor(v)
R=np.random.default_rng(5)

def buzz(d,f0=215,seed=1):
    t=tt_(d); r=np.random.default_rng(seed)
    f=f0*(1+0.04*np.sin(2*np.pi*0.7*t)+0.02*np.sin(2*np.pi*3.1*t))
    ph=2*np.pi*np.cumsum(f)/SR
    saw=(np.mod(ph/(2*np.pi),1)*2-1)
    y=0.5*saw+0.25*np.sign(np.sin(ph*2))*0.5
    y=y*(0.65+0.35*np.sin(2*np.pi*(11+3*np.sin(2*np.pi*0.3*t))*t))
    y+=0.35*bp_noise(d,700,3200,seed)
    return lp(y,3500)
def chirp(f0,f1,d):
    t=tt_(d); f=f0+(f1-f0)*(t/d)**0.8
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*t/d)**1.5
def pop(f0=1100,f1=280,d=.09):
    t=tt_(d); return np.sin(2*np.pi*np.cumsum(f0+(f1-f0)*(t/d))/SR)*np.exp(-t/0.025)+0.25*bp_noise(d,1500,6000,int(f0))*np.exp(-t/0.012)
def step_tile(g=1.0,seed=1):
    t=tt_(0.12); return g*(0.55*np.sin(2*np.pi*(180+80*np.exp(-t*60))*t)*np.exp(-t/0.02)+0.5*bp_noise(0.12,1800,7000,seed)*np.exp(-t/0.015))
def step_grass(seed=1):
    return 0.6*bp_noise(0.16,1200,6500,seed)*np.sin(np.pi*np.linspace(0,1,int(.16*SR)))**1.4+0.25*thump(0.12,70)[:int(.12*SR)].repeat(1)[:int(.12*SR)].tolist().__len__()*0
def step_grass2(seed=1):
    n=int(.18*SR); y=0.55*bp_noise(.18,1200,6500,seed)*np.sin(np.pi*np.linspace(0,1,n))**1.4
    th=thump(0.12,75)*0.35; y[:len(th)]+=th; return y
def step_wheat(seed=1):
    n=int(.28*SR); y=0.7*bp_noise(.28,2500,9000,seed)*np.sin(np.pi*np.linspace(0,1,n))**1.2
    th=thump(0.12,65)*0.22; y[:len(th)]+=th; return y
def horn(f,d,vib=0):
    t=tt_(d); f_=f*(1+vib*np.sin(2*np.pi*5.5*t)); ph=2*np.pi*np.cumsum(f_)/SR
    y=(np.mod(ph/(2*np.pi),1)*2-1)*0.5+0.3*np.sin(ph); y=lp(y,1100)
    return y*np.minimum(1,t/0.03)*np.minimum(1,(d-t)/0.06)

once=wt(0,'once'); cosas=wt(0,'cosas'); atenc=wt(1,'atención'); alc=wt(1,'alcohol'); aluc=wt(2,'alucinaciones'); desc=wt(2,'desconfías')
apaga=wt(3,'apaga'); micro=wt(3,'microsue'); pill=wt(3,'pillarte'); aguant=wt(4,'aguantó'); despi=wt(4,'despierto'); habl=wt(4,'hablaba'); recor=wt(4,'recordaba')
durm=wt(5,'durmió'); cat=wt(5,'catorce'); recup=wt(5,'recuperó'); ojo=wt(6,'ojo'); cor=wt(6,'corazón'); mente=wt(6,'mente'); entie=wt(7,'entierran')
def tick(t0,hi=True,g=1.0):
    x=click(2100 if hi else 1500,0.04,1.0)*0.9; put(t0,x,0.16*g)
# ---- scene 0: ticking clock, the time-lapse, then things appear
put(0.02,impact(1.4,55,0.6,.25,11),0.4)
k=0.0
while k<once+0.9: tick(k+0.3,k%2==0); k+=0.5

put(once-0.1,whoosh(1.3,True,21),0.35)
for i in range(18): put(once+0.05+i*0.07,click(1200+i*90,0.03),0.12)
put(once+1.3,impact(1.6,48,0.9,.4,22),0.55)
put(cosas-0.5,whoosh(0.5,True,23),0.3); put(cosas,lp(np.sin(2*np.pi*np.cumsum(np.linspace(90,60,int(1.6*SR)))/SR)*np.linspace(1,0,int(1.6*SR)),600),0.5)
for k in range(3): put(cosas+0.1+k*0.12,reverb(ping(2400+k*300,1.0,.4),.8,.3),0.12)
# ---- scene 1: 24 hours, tick bed, yawn-ish, wobble
k=starts[1]
while k<starts[2]-0.1: tick(k,int((k-starts[1])*2)%2==0,0.9); k+=0.5
put(starts[1],whoosh(0.5,False,31),0.3); put(starts[1],impact(1.2,60,.7,.3,32),0.5)
put(atenc,padd(ping(660,.7,.3),ping(520,.9,.4)),0.25)
wob=np.sin(2*np.pi*np.cumsum(180+30*np.sin(2*np.pi*3*tt_(2.2)))/SR)*np.hanning(int(2.2*SR)); put(alc-0.2,lp(wob,900),0.22)
# ---- scene 2: hallucination drone, glitch
put(starts[2]-0.2,whoosh(0.5,True,41),0.3); put(starts[2],impact(1.4,52,.8,.5,42),0.5)
d2=starts[3]-starts[2]; dr=tt_(d2+0.5); drone=np.sin(2*np.pi*55*dr)+0.7*np.sin(2*np.pi*58.5*dr)+0.4*np.sin(2*np.pi*(110+6*np.sin(2*np.pi*0.3*dr))*dr)
put(starts[2],drone*np.hanning(len(dr))*0.12,1.0)
for i in range(7): put(aluc+0.2+i*0.37,reverb(bp_noise(0.25,300,2500,60+i)*np.hanning(int(.25*SR)),.7,.3),0.18)
for i in range(6): put(aluc+0.4+i*0.5,reverb(ping(R.uniform(900,1800),1.2,.5),1.0,.4),0.1)
put(desc-0.1,whoosh(0.5,True,43),0.3); put(desc,impact(1.4,50,.9,.5,44),0.55)
# ---- scene 3: micro-sleeps (thud when lids close)
for tt0 in np.arange(starts[3]+0.8,starts[4]-0.1,1/ (2.4/(2*np.pi))):
    pass
import math as _m
t_=starts[3]
while t_<starts[4]-0.2:
    s1=_m.sin(2.4*(t_-0)); s2=_m.sin(5.3*(t_-0)+2)
    t_+=0.05
for P,ph in ((2.4,0.0),(5.3,2.0)):
    thr=0.35 if P==2.4 else 0.7
    t0=starts[3]; k=0
    while t0+k/ (P/(2*_m.pi))*1.0<starts[4]-0.2 and k<40:
        # up-crossing of sin(P t + ph)=thr
        base=(_m.asin(thr)-ph+2*_m.pi*k)/P
        if base>=starts[3]+0.15 and base<starts[4]-0.3 and not(thr<.5 and base<starts[3]+0.5):
            put(base,thump(0.3,48),0.5); put(base-0.12,whoosh(0.2,True,int(base*50)),0.22)
        k+=1
put(starts[3]+0.05,impact(1.3,54,.7,.3,51),0.4)
for i in range(4): put(micro+0.1+i*0.35,reverb(bell(520-40*i,1.4),1.0,.4),0.12)
put(pill-0.4,whoosh(0.5,True,52),0.3); put(pill,impact(1.6,46,1.0,.5,53),0.7)
# ---- scene 4: 1964 typewriter + calendar crosses
put(starts[4]-0.05,whoosh(0.5,False,61),0.28)
put(starts[4]+0.97,reverb(padd(whoosh(0.4,False,62),0.5*thump(0.3,70)[:int(.4*SR)]),.6,.2),0.3)
for i in range(11):
    tx=aguant+i*0.26
    put(tx,padd(click(1800,0.05,1.0),thump(0.12,110)*0.8),0.32)
for i in range(30): put(starts[4]+1.1+i*0.045+R.uniform(0,.02),click(R.uniform(1600,2600),0.03),0.06)
put(despi+0.6,reverb(bell(440,1.8),1.4,.4),0.2)
for i in range(7): put(habl+i*0.28,lp(np.sin(2*np.pi*np.cumsum(220+120*np.sin(2*np.pi*(2+i*.3)*tt_(0.35)))/SR)*np.hanning(int(.35*SR)),700),0.1)
put(recor,whoosh(0.9,False,63),0.22)
# ---- scene 5: lullaby + sunrise
put(starts[5]-0.05,whoosh(0.6,False,71),0.25)
mel=[(76,0),(79,.5),(83,1.0),(79,1.5),(76,2.0),(74,2.5),(71,3.0),(74,3.5)]
for nt,off in mel:
    f=note(nt); d_=1.6; tb=tt_(d_); y=np.sin(2*np.pi*f*tb)*np.exp(-tb/0.55)+0.3*np.sin(2*np.pi*2*f*tb)*np.exp(-tb/0.25); put(starts[5]+0.2+off*1.0,reverb(y,1.2,.4),0.12)
dz=tt_(recup-starts[5]); put(starts[5],0.05*np.sin(2*np.pi*50*dz)*np.hanning(len(dz)),1.0)
put(recup-0.2,whoosh(0.6,True,72),0.28)
for k,f in enumerate((784,988,1175,1568)): put(recup+0.1+0.12*k,reverb(ping(f,1.0,.4),1.0,.35),0.2)
for k in range(6): put(recup+0.2+k*0.35,reverb(chirp(R.uniform(2400,3200),R.uniform(3200,4300),R.uniform(.09,.18)),.6,.25),0.12)
# ---- scene 6: heartbeat, ECG beeps, flatline
put(starts[6]-0.2,whoosh(0.5,True,81),0.3); put(starts[6],impact(1.4,50,.9,.5,82),0.55)
hb=starts[6]+0.3
while hb<mente: 
    heart(hb,0.8); put(hb+0.02,ping(1000,0.12,.05),0.08); hb+=0.65 if hb<cor else 0.7
hb2=mente
for k in range(4): heart(hb2+k*(0.8+0.35*k),0.7-0.12*k); 
put(mente+3.1,np.sin(2*np.pi*1000*tt_(2.0))*np.hanning(int(2.0*SR))*np.minimum(1,tt_(2.0)/0.05),0.0)
put(ojo-0.3,whoosh(0.4,True,83),0.3); put(ojo,impact(1.5,56,1.0,.5,84),0.75)
# ---- scene 7: spooky bells, knock, owl
put(starts[7]-0.05,whoosh(0.5,False,91),0.25)
wd=bp_noise(total-starts[7]+0.5,150,1200,92)*(0.5+0.5*np.abs(np.sin(2*np.pi*0.2*tt_(total-starts[7]+0.5)))); put(starts[7],wd*np.hanning(len(wd)),0.1)
put(starts[7]+0.5,reverb(padd(bell(392,2.4),0.5*bell(587,2.0)),1.6,.45),0.3)
for k in range(3): put(starts[7]+1.6+k*0.22,padd(thump(0.2,160),0.6*bp_noise(0.1,600,3000,93+k)[:int(.1*SR)]*np.exp(-tt_(.1)/.03)),0.5)
put(entie-0.2,whoosh(0.4,True,94),0.3); put(entie,impact(1.7,44,1.0,.5,95),0.7)
for i in range(6): put(starts[7]+0.4+i*0.9+R.uniform(0,.3),reverb(chirp(R.uniform(1800,2600),R.uniform(2600,3600),R.uniform(.08,.14)),.6,.25),0.06)
put(starts[7]+4.1,reverb(padd(bell(1320,1.2),0.6*bell(1760,1.0)),1.0,.35),0.3)
rw=tt_(0.25); put(starts[7]+4.4,np.sin(2*np.pi*np.cumsum(900+2400*(rw/0.25))/SR)*np.exp(-rw/0.1),0.26)

# SFX sit under the voice a bit
envv=np.convolve(np.abs(v),np.ones(int(0.1*SR))/int(0.1*SR),'same')
sfx*= (1-0.30*np.clip(envv/0.06,0,1))
# ducking
from numpy.lib.stride_tricks import sliding_window_view
win=int(0.12*SR)
env=np.convolve(np.abs(v),np.ones(win)/win,'same')
duck=1-0.62*np.clip(env/0.06,0,1)
duck=np.convolve(duck,np.ones(int(0.08*SR))/int(0.08*SR),'same')
m=m*duck+sfx*0.95
# fade
fade=int(1.2*SR); m[-fade:]*=np.linspace(1,0,fade)
m*= 0.62/np.max(np.abs(m))
vv=v/np.max(np.abs(v))*0.9
# stereo: slight haas on music
R=m.copy(); sh=int(0.012*SR); R[sh:]=m[:-sh]
Lc=vv+m*0.8; Rc=vv+R*0.8
st=np.stack([Lc,Rc],1); st=np.tanh(st*1.1)*0.95
w=wave.open(f'{S}/w_sleep/mix_sfx.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
print('mix ok',total)
