import numpy as np, json, wave, sys
S=sys.argv[1]
SR=48000
d=json.load(open(f'{S}/w_marianas/timeline.json'))
starts=d['starts']; total=d['total']; segs=d['segs']
n=int((total+0.5)*SR); t=np.arange(n)/SR
rng=np.random.default_rng(7)
bpm=68; beat=60/bpm
def env_exp(tt,dec): return np.exp(-tt/dec)
mix=np.zeros(n)
# voice file
v=np.zeros(n)
for i,s in enumerate(starts):
    w=wave.open(f'{S}/w_marianas/s{i}.wav'); raw=np.frombuffer(w.readframes(w.getnframes()),dtype=np.uint8); assert w.getsampwidth()==3 and w.getnchannels()==1
    r3=raw.reshape(-1,3).astype(np.int32); x=((r3[:,0]|(r3[:,1]<<8)|(r3[:,2]<<16))<<8>>8)/8388608.0
    a=int(s*SR); dd=int(segs[i]['dur']*SR); x=x[:dd].copy(); x[-int(0.05*SR):]*=np.linspace(1,0,int(0.05*SR)); v[a:a+len(x)]+=x[:n-a]
# music
def note(f): return 440*2**((f-69)/12)
chords=[(45,[45,48,52]),(41,[41,45,48]),(48,[48,52,55]),(43,[43,47,50])]
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



def wx(seg,word,n=0):
    k=0
    for w in segs[seg]['words']:
        if w[0].lower()==word:
            if k==n: return starts[seg]+w[1]
            k+=1
    return starts[seg]+0.5
spo=wt(0,'spoiler'); tfall=1.0; tspl=1.0+math.sqrt(2*420/2600)
cas=wt(1,'casi'); ever=wt(1,'everest'); dos=wt(2,'doscientos'); osc=wt(2,'oscuridad'); pres=wt(3,'presión'); mil3=wt(3,'mil'); carg=wt(3,'cargar')
pul=wt(4,'pulmones'); oid=wt(4,'oídos'); romp=wt(4,'romperían'); fon=wt(4,'fondo'); pec=wt(5,'peces'); cru=wt(5,'crustáceos'); bri=wt(5,'brillan'); land=bri+1.85
cam=wt(6,'cameron'); subm=wt(6,'submarino'); volc=wt(7,'volcán'); sig=wt(7,'sígueme')
def trans(t0,kind):
    if kind=='whip': put(t0-0.36,whoosh(0.5,True,int(t0*7)),0.25); put(t0,thump(0.4,60),0.35)
    elif kind=='dark': put(t0-0.5,lp(bp_noise(1.0,80,900,int(t0*3)),700)*np.hanning(int(1.0*SR)),0.35)
    else: put(t0-0.34,whoosh(0.34,False,int(t0*17)),0.25); put(t0,thump(0.4,56),0.35)
for b_,k_ in zip(range(1,8),['whip','dark','dark','dark','whip','whip','iris']): trans(starts[b_],k_)
# ---- surface: sea, gulls, creak, fall, splash ----
sea=lp(bp_noise(tspl+0.4,150,2200,5),1600)*(0.5+0.5*np.abs(np.sin(2*np.pi*0.22*tt_(tspl+0.4)))); put(0,sea*np.hanning(len(sea)),0.22)
for k in range(5): put(0.1+k*0.28+R.uniform(0,.1),reverb(chirp(R.uniform(1800,2800),R.uniform(1200,2000),R.uniform(.15,.3)),.6,.25),0.07)
put(0.1,lp(np.sin(2*np.pi*np.cumsum(np.linspace(90,70,int(0.8*SR)))/SR)*np.hanning(int(0.8*SR)),400),0.2)
put(tfall-0.05,whoosh(0.6,True,81),0.4)
put(tspl,padd(impact(1.8,60,.8,1.0,82),bp_noise(1.2,300,7000,83)*np.exp(-tt_(1.2)/.35)),0.9)
# underwater: muffled rumble + bubbles
uw=lp(bp_noise(starts[2]-tspl,50,500,84),420)*np.hanning(int((starts[2]-tspl)*SR)); put(tspl,uw,0.5)
for k in range(40): put(tspl+0.1+k*0.23+R.uniform(0,.15),pop(R.uniform(300,900),R.uniform(120,260),R.uniform(.05,.12)),0.10)
put(spo,reverb(padd(ping(440,1.6,.7),ping(660,1.4,.5)),1.4,.4),0.15)
# ---- depth: shark pass, darkness drone ----
put(dos+0.4,lp(bp_noise(2.4,60,500,85),400)*np.hanning(int(2.4*SR)),0.5)
dr=lp(np.sin(2*np.pi*np.cumsum(np.linspace(110,46,int((starts[4]-osc)*SR)))/SR),600)*np.hanning(int((starts[4]-osc)*SR)); put(osc,dr,0.35)
# ---- pressure: creaks, heartbeat, impact ----
for k in range(9): put(pres+k*0.55+R.uniform(0,.2),lp(chirp(R.uniform(120,260),R.uniform(60,110),R.uniform(.4,.8)),700),0.20)
for k in range(int((carg-pres)/0.7)): heart(pres+k*(0.9-0.012*k*3),0.9)
put(carg,padd(impact(2.2,40,1.2,.9,86),lp(bp_noise(1.6,80,1500,87),900)*np.exp(-tt_(1.6)/.6)),0.95)
# ---- body: lungs squeak, ears crack ----
for k in range(6): put(pul+0.1*k+R.uniform(0,.05),chirp(R.uniform(900,1600),R.uniform(300,600),.12),0.10)
put(romp-0.15,whoosh(0.4,True,88),0.3); put(romp,padd(click(1200,0.05,1.2),impact(0.9,90,.5,.8,89)),0.7)
for k in range(5): put(romp+0.25+k*0.12,click(R.uniform(900,2200),0.03),0.2)
# ---- creatures: soft bioluminescent chimes ----
for t0,nt in [(pec,84),(cru,79),(bri,88)]: put(t0,reverb(padd(ping(note(nt),1.6,.6),0.5*ping(note(nt+7),1.4,.5)),1.5,.45),0.22)
for k in range(8): put(pec+k*0.55+R.uniform(0,.2),reverb(ping(note(R.integers(84,96)),0.5,.18),.8,.3),0.08)
# landing + silt
put(land,padd(thump(0.4,52),lp(bp_noise(0.5,200,3500,91),2500)*np.exp(-tt_(.5)/.15)),0.8)
put(land+0.05,lp(bp_noise(1.4,150,2000,92),1500)*np.hanning(int(1.4*SR)),0.25)
# ---- submarine: hum + sonar ping ----
hum=np.sin(2*np.pi*95*tt_(5.0))+0.4*np.sin(2*np.pi*190*tt_(5.0)); put(cam-1.1,hum*np.hanning(len(hum)),0.12)
put(cam-0.2,reverb(ping(1650,2.2,1.0),1.8,.5),0.35)
put(cam+1.6,reverb(ping(1650,2.0,.9),1.8,.5),0.2)
put(subm,reverb(padd(bell(660,1.6),0.5*bell(990,1.2)),1.2,.4),0.22)
# ---- CTA: volcano rumble + ding ----
rb=lp(bp_noise(4.6,30,300,93),240)*np.linspace(0.3,1,int(4.6*SR))*np.hanning(int(4.6*SR)); put(volc-1.2,rb,0.75)
put(volc,padd(impact(2.2,36,1.2,.8,94),bp_noise(0.5,1500,7000,95)*np.exp(-tt_(.5)/.1)),0.7)
put(sig+0.2,reverb(padd(bell(1320,1.2),0.6*bell(1760,1.0)),1.0,.35),0.3)
rw=tt_(0.25); put(sig+0.6,np.sin(2*np.pi*np.cumsum(900+2400*(rw/0.25))/SR)*np.exp(-rw/0.1),0.26)

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
w=wave.open(f'{S}/w_marianas/mix_sfx.wav','wb'); w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR)
q=(st*8388607).astype(np.int32); b=np.zeros((q.size,3),np.uint8); f=q.reshape(-1); b[:,0]=f&255; b[:,1]=(f>>8)&255; b[:,2]=(f>>16)&255; w.writeframes(b.tobytes()); w.close()
print('mix ok',total)
