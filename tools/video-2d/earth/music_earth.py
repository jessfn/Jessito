import numpy as np, json, wave, sys
S=sys.argv[1]
SR=44100
d=json.load(open(f'{S}/w_earth/timeline.json'))
starts=d['starts']; total=d['total']; segs=d['segs']
n=int((total+0.5)*SR); t=np.arange(n)/SR
rng=np.random.default_rng(7)
bpm=82; beat=60/bpm
def env_exp(tt,dec): return np.exp(-tt/dec)
mix=np.zeros(n)
# voice file
v=np.zeros(n)
for i,s in enumerate(starts):
    w=wave.open(f'{S}/w_earth/s{i}.wav'); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768.0
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



gol0=wt(0,'golpe'); vol=wt(0,'volando'); mil=wt(1,'mil'); eco=wt(1,'ecuador'); notas=wt(1,'notas'); fren=wt(2,'frenara'); edif=wt(2,'edificios'); este=wt(2,'este')
vie=wt(3,'viento'); sup=wt(3,'supersónicas'); arr=wt(3,'arrasaría'); oce=wt(4,'océanos'); desb=wt(4,'desbordarían'); olas=wt(4,'olas')
sol=wt(5,'sol'); noche=wt(5,'noche'); polos=wt(6,'polos'); fre6=wt(6,'frenazo'); vida=wt(6,'vida'); sobre=wt(6,'sobreviviría'); luna=wt(7,'luna'); desap=wt(7,'desaparece'); sig=wt(7,'sígueme')
def trans(t0,kind):
    if kind=='whip': put(t0-0.36,whoosh(0.5,True,int(t0*7)),0.3); put(t0,thump(0.4,60),0.4)
    elif kind=='shock': put(t0-0.2,whoosh(0.3,True,int(t0*5)),0.3); put(t0,impact(1.5,50,1.0,.6,int(t0)),0.65)
    elif kind=='wind': put(t0-0.36,lp(bp_noise(0.8,200,3000,int(t0*3)),2500)*np.hanning(int(.8*SR)),0.35)
    elif kind=='flood': put(t0-0.36,lp(bp_noise(0.9,100,2500,int(t0*11)),1800)*np.hanning(int(.9*SR)),0.4); put(t0,thump(0.5,48),0.4)
    elif kind=='sun': put(t0-0.36,whoosh(0.6,True,int(t0*13)),0.3); put(t0,reverb(padd(ping(660,1.4,.5),ping(990,1.2,.4)),1.2,.4),0.2)
    elif kind=='frost':
        for i in range(14): put(t0-0.3+i*0.045+R.uniform(0,.02),click(R.uniform(3000,6500),0.02),0.1)
        put(t0,thump(0.4,70),0.3)
    else: put(t0-0.34,whoosh(0.34,False,int(t0*17)),0.3); put(t0,thump(0.4,56),0.4)
for b_,k_ in zip(range(1,8),['whip','shock','wind','flood','sun','frost','iris']): trans(starts[b_],k_)
# ---- scene 0: calm seaside, then the stop
put(0.02,impact(1.2,52,0.5,.25,11),0.3)
sea=lp(bp_noise(starts[1]+0.5,200,1800,5),1800)*(0.5+0.5*np.abs(np.sin(2*np.pi*0.18*tt_(starts[1]+0.5)))); put(0,sea*np.hanning(len(sea)),0.10)
for k in range(6): put(0.4+k*0.7+R.uniform(0,.2),reverb(chirp(R.uniform(1800,2800),R.uniform(1200,2000),R.uniform(.15,.3)),.6,.25),0.07)
put(gol0-0.15,lp(np.sin(2*np.pi*np.cumsum(np.linspace(900,40,int(1.2*SR)))/SR)*np.linspace(1,0.2,int(1.2*SR)),2500),0.5)
put(gol0,impact(2.2,40,1.2,.9,12),0.9)
for k in range(18): put(gol0+0.2+k*0.08+R.uniform(0,.04),padd(click(R.uniform(500,2500),0.04),0.4*bp_noise(0.08,500,4000,40+k)*np.exp(-tt_(.08)/.03)),0.13)
put(vol-0.3,whoosh(0.6,True,13),0.4); put(vol,impact(1.6,46,1.0,.6,14),0.6)
# ---- scene 1: speed counter
for k in range(24): put(mil-0.2+k*0.075,click(900+k*60,0.025),0.12)
put(eco,reverb(padd(ping(880,1.0,.4),ping(1320,.8,.3)),1.0,.35),0.25)
dd=tt_(starts[2]-starts[1]+0.3); put(starts[1],0.05*np.sin(2*np.pi*70*dd)*np.hanning(len(dd)),1.0)
put(notas,reverb(padd(bell(660,1.4),0.5*bell(990,1.2)),1.2,.4),0.2)
# ---- scene 2: braking
put(fren-0.1,lp(bp_noise(1.4,400,6000,21)*np.linspace(1,0.1,int(1.4*SR)),5000),0.4)
put(fren,impact(2.2,38,1.2,.9,22),0.95)
for k in range(10): put(edif+k*0.22+R.uniform(0,.1),padd(thump(0.3,R.uniform(60,110)),bp_noise(0.15,300,3000,50+k)[:int(.15*SR)]*np.exp(-tt_(.15)/.05)),0.28)
put(este-0.3,lp(bp_noise(2.2,150,2500,23),2200)*np.hanning(int(2.2*SR)),0.35)
# ---- scene 3: supersonic wind
d3=starts[4]-starts[3]; hw=bp_noise(d3+0.5,200,3500,31)*(0.3+0.7*np.clip(tt_(d3+0.5)/d3,0,1)); put(starts[3],hw*np.hanning(len(hw)),0.4)
put(sup-0.2,whoosh(0.4,True,32),0.35); put(sup,padd(impact(1.6,46,1.0,.9,33),bp_noise(0.3,3000,9000,34)*np.exp(-tt_(.3)/.06)),0.85)
put(arr-0.3,whoosh(0.5,True,35),0.35); put(arr,impact(2.0,36,1.2,1.0,36),1.0)
# ---- scene 4: tsunami
rm=lp(bp_noise(d3*0+ (starts[5]-starts[4])+0.5,60,900,41),700)*np.linspace(0.2,1,int(((starts[5]-starts[4])+0.5)*SR)); put(starts[4],rm*0.5,0.5)
put(desb-0.2,whoosh(0.5,True,42),0.35); put(desb,lp(bp_noise(1.6,100,4000,43),2500)*np.hanning(int(1.6*SR)),0.55)
put(olas-0.3,whoosh(0.6,True,44),0.4); put(olas,impact(2.4,34,1.2,.9,45),1.0)
for k in range(12): put(olas+0.4+k*0.18+R.uniform(0,.1),pop(R.uniform(500,1200),200,.08),0.12)
# ---- scene 5: heat / ice
hs=bp_noise(3.2,2500,9000,51)*np.hanning(int(3.2*SR)); put(sol-0.2,hs,0.07); put(sol,lp(np.sin(2*np.pi*np.cumsum(120+30*np.sin(2*np.pi*3*tt_(3.0)))/SR)*np.hanning(int(3.0*SR)),600),0.15)
for k in range(14): put(noche+0.1+k*0.11+R.uniform(0,.05),click(R.uniform(3500,7000),0.02),0.08)
put(noche,reverb(padd(ping(1760,1.6,.6),ping(2349,1.4,.5)),1.4,.4),0.14)
# ---- scene 6: shiver + silence
sh=bp_noise(starts[7]-starts[6],1500,5000,61)*(0.4+0.6*np.abs(np.sin(2*np.pi*0.6*tt_(starts[7]-starts[6])))); put(starts[6],sh*np.hanning(len(sh)),0.05)
for k in range(10): put(polos+0.8+k*0.2,click(R.uniform(900,1500),0.02),0.1)
put(vida-0.2,lp(np.sin(2*np.pi*np.cumsum(np.linspace(220,45,int(1.6*SR)))/SR)*np.linspace(1,0,int(1.6*SR)),800),0.4)
put(sobre,impact(2.4,34,1.2,.5,62),0.9)
# ---- scene 7: night + moon vanishes
for k in range(5): put(starts[7]+0.3+k*0.9,reverb(ping(R.uniform(3000,4200),.3,.1),.6,.2),0.04)
for i,nt in enumerate([76,81,84,88]): put(luna+0.1*i,reverb(ping(note(nt),1.2,.5),1.2,.4),0.12)
put(desap-0.4,whoosh(0.5,False,71),0.35); put(desap,padd(impact(2.0,40,1.1,.5,72),lp(np.sin(2*np.pi*np.cumsum(np.linspace(1500,60,int(1.0*SR)))/SR)*np.linspace(1,0,int(1.0*SR)),2000)),0.8)
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
w=wave.open(f'{S}/w_earth/mix_sfx.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
print('mix ok',total)
