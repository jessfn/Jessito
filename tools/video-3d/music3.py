import numpy as np, json, wave, sys
S=sys.argv[1]
SR=44100
d=json.load(open(f'{S}/w2/timeline.json'))
starts=d['starts']; total=d['total']; segs=d['segs']
n=int((total+0.5)*SR); t=np.arange(n)/SR
rng=np.random.default_rng(7)
bpm=92; beat=60/bpm
def env_exp(tt,dec): return np.exp(-tt/dec)
mix=np.zeros(n)
# voice file
v=np.zeros(n)
for i,s in enumerate(starts):
    w=wave.open(f'{S}/w2/s{i}.wav'); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768.0
    a=int(s*SR); dd=int(segs[i]['dur']*SR); x=x[:dd].copy(); x[-int(0.05*SR):]*=np.linspace(1,0,int(0.05*SR)); v[a:a+len(x)]+=x[:n-a]
# music
def note(f): return 440*2**((f-69)/12)
chords=[(50,[50,53,57]),(46,[46,50,53]),(53,[53,57,60]),(48,[48,52,55])]
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
    kick[a:a+l]+=0.55*np.sin(ph)*env_exp(tb,0.09)
    a2=a+int(beat/2*SR); l=min(int(0.06*SR),n-a2)
    if l>0:
        nz=rng.standard_normal(l); nz=np.diff(nz,prepend=0)
        hat[a2:a2+l]+=0.07*nz*env_exp(np.arange(l)/SR,0.02)
# impacts + whooshes at each scene start
fx=np.zeros(n)
for s in starts[1:]:
    a=int(s*SR)
    l=min(int(0.7*SR),n-a); tb=np.arange(l)/SR
    fx[a:a+l]+=0.5*np.sin(2*np.pi*(38+70*np.exp(-tb*9))*tb)*env_exp(tb,0.25)
    wl=int(0.45*SR); a0=max(0,a-wl); L=a-a0
    if L>0:
        nz=rng.standard_normal(L)
        k=np.ones(40)/40; nz=np.convolve(nz,k,'same')*6
        fx[a0:a]+=0.10*nz*(np.arange(L)/L)**2
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
# --- scene 0: hook
put(0.02,impact(2.0,60,1.0,.35,11),0.8)
for tp in (0.05,0.2,0.35): put(tp,whoosh(0.4,True,int(tp*100)),0.35)
te=wt(0,'espagueti'); put(te-0.35,whoosh(0.5,True,21),0.55); put(te,impact(1.8,55,1.0,.6,12),1.0)
put(te+0.03,lp(bp_noise(0.45,900,3500,9)*np.sin(np.pi*np.linspace(0,1,int(.45*SR)))**1.5,6000),0.55)  # gasp (inhale)
put(te,reverb(ping(310,2.2,0.9),1.4,.45),0.3)
# --- scene 1: horizon
put(starts[1]+0.05,reverb(ping(1320,2.0,0.45),1.2,.4),0.55); put(starts[1]+0.55,reverb(ping(1320,1.5,0.3),1.2,.4),0.25)
tp_=starts[1]+3.4; put(tp_-0.4,whoosh(0.5,True,31),0.5); put(tp_,impact(2.4,46,1.2,.5,13),1.0)
# --- scene 2: calm
put(starts[2]+1.6,reverb(bell(660,1.8),1.6,.5),0.38); put(starts[2]+1.75,reverb(bell(990,1.6),1.6,.5),0.22)
# --- scene 3: gravity, tension
d3=starts[4]-starts[3]; tb=starts[3]; p=0.9
while tb<starts[4]+d3*0.0+ (starts[5]-starts[4])*0.9:
    heart(tb,0.9 if tb<starts[4] else 1.0); p=max(0.38,0.92-(tb-starts[3])*0.045); tb+=p
rt_=tt_(d3+0.3); f_=170*2**(rt_/ (d3+0.3)*2.2); ph=2*np.pi*np.cumsum(f_)/SR
riser=(np.sign(np.sin(ph))*0.5+np.sin(ph))*0.5*np.sin(np.pi*np.minimum(1,rt_/(d3+0.3))**0.7)
put(starts[3]-0.05,lp(riser,1800),0.16)
put(starts[3]+0.5,padd(thump(0.5,70),click(500,0.2,0.4)),0.8); put(starts[3]+0.95,click(2400,0.05,0.9),0.5)
# --- scene 4: stretching (twang glide, creaks, counter ticks, stamp)
d4=starts[5]-starts[4]; r4=tt_(d4); f4=180*np.exp(r4/d4*np.log(2000/180)); fm=np.sin(2*np.pi*7*r4)*40*(r4/d4)
ph4=2*np.pi*np.cumsum(f4+fm)/SR; g4=np.minimum(1,r4/0.3)*np.minimum(1,(d4-r4)/0.4)
put(starts[4],(np.sin(ph4)*0.6+0.25*np.sin(2*ph4+0.5*np.sin(ph4)))*g4,0.22)
rr=np.random.default_rng(44)
for k in range(14):
    tc=starts[4]+0.4+k*(d4-0.8)/14+rr.uniform(-0.15,0.15); put(tc,bp_noise(0.18,500,2200,70+k)*np.hanning(int(.18*SR)),0.25)
tk=starts[4]
while tk<starts[5]-0.2:
    fr_=800+1600*(tk-starts[4])/d4; put(tk,click(fr_,0.03,0.7),0.35); tk+=0.085
ts4=wt(4,'espaguetización')-0.05; put(ts4-0.3,whoosh(0.4,True,51),0.5); put(ts4,impact(1.8,62,1.0,.6,14),0.95)
put(starts[4]+0.05,whoosh(0.5,True,41),0.45)
# --- scene 5: time dilation (slowing clock), ice
u5=0.0; tk=starts[5]
while tk<starts[6]-0.2:
    put(tk,padd(click(900-250*(tk-starts[5])/(starts[6]-starts[5]),0.05,1.0),lp(thump(0.15,120),400)),0.55)
    u=tk-starts[5]; tk+=0.28*np.exp(0.55*u)
r5=tt_(starts[6]-starts[5]); f5=220*np.exp(-r5/ (starts[6]-starts[5])*1.3); put(starts[5],np.sin(2*np.pi*np.cumsum(f5)/SR)*np.minimum(1,r5/0.5)*np.minimum(1,(len(r5)/SR-r5)/0.6),0.22)
tc5=wt(5,'congelarte'); put(tc5-0.5,whoosh(0.6,True,61),0.45)
for k,f in enumerate([2093,2637,3136,3951]): put(tc5+0.12*k,reverb(ping(f,1.8,0.8),1.5,.5),0.3)
put(tc5,impact(1.4,90,0.6,.7,15),0.7)
# --- scene 6: countdown + singularity
D6=starts[7]-starts[6]; tk=starts[6]+0.6; last=60
while tk<starts[6]+D6-0.6:
    secs=round(60*(1-min(1,max(0,(tk-starts[6]-0.6)/(D6-1.2)))))
    fr_=500+1500*(1-secs/60); put(tk,click(fr_,0.03,0.8),0.3); tk+=(D6-1.2)/60.0
r6=tt_(D6); f6=40*np.exp(r6/D6*np.log(3.2)); put(starts[6],np.sin(2*np.pi*np.cumsum(f6)/SR)*(np.minimum(1,r6/1.0)*(r6/D6)**1.2),0.34)
r6n=bp_noise(D6,80,900,66)*(r6/D6)**2.2; put(starts[6],r6n,0.35)
tsg=starts[6]+D6*0.8; put(tsg-0.7,whoosh(0.7,True,71),0.6); put(tsg,impact(3.5,34,1.4,.9,16),1.2)
put(tsg+0.15,reverb(ping(3900,3.0,2.0),2.0,.3),0.09)
sfx_cut=int((tsg+0.05)*SR)
# --- scene 7: CTA
u7=starts[7]; put(u7+0.05,reverb(np.sin(2*np.pi*(300+500*np.exp(-tt_(0.15)*25))*tt_(0.15))*np.exp(-tt_(0.15)/0.05),0.8,.3),0.6)
put(u7+0.55,whoosh(0.4,True,81),0.35); put(u7+0.75,whoosh(0.4,True,82),0.35)
put(u7+2.2,reverb(padd(bell(1320,1.2),0.6*bell(1760,1.0)),1.0,.35),0.35)
rw=tt_(0.25); put(u7+2.5,np.sin(2*np.pi*np.cumsum(900+2400*(rw/0.25))/SR)*np.exp(-rw/0.1),0.3)
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
w=wave.open(f'{S}/w2/mix_sfx.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
print('mix ok',total)
