import numpy as np, json, wave, sys
S=sys.argv[1]
SR=44100
d=json.load(open(f'{S}/w_burial/timeline.json'))
starts=d['starts']; total=d['total']; segs=d['segs']
n=int((total+0.5)*SR); t=np.arange(n)/SR
rng=np.random.default_rng(7)
bpm=70; beat=60/bpm
def env_exp(tt,dec): return np.exp(-tt/dec)
mix=np.zeros(n)
# voice file
v=np.zeros(n)
for i,s in enumerate(starts):
    w=wave.open(f'{S}/w_burial/s{i}.wav'); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768.0
    a=int(s*SR); dd=int(segs[i]['dur']*SR); x=x[:dd].copy(); x[-int(0.05*SR):]*=np.linspace(1,0,int(0.05*SR)); v[a:a+len(x)]+=x[:n-a]
# music
def note(f): return 440*2**((f-69)/12)
chords=[(38,[38,41,45]),(34,[34,38,41]),(31,[31,34,38]),(33,[33,37,40])]
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


entie=wt(0,'entierran'); pan0=wt(0,'pánico'); horas=wt(1,'horas'); agit=wt(1,'agites'); panic=wt(2,'pánico'); resp=wt(2,'respiras')
dio=wt(3,'dióxido'); mareo=wt(3,'mareo'); conf=wt(3,'confusión'); desm=wt(3,'desmayo'); tapa=wt(4,'tapa'); ced=wt(4,'cedería'); peso=wt(4,'peso'); caer=wt(4,'caería')
camp=wt(5,'campanas'); ayuda=wt(5,'ayuda'); med=wt(6,'médico'); cert=wt(6,'certificar'); pero=wt(6,'pero'); hou=wt(6,'houdini'); sale=wt(6,'sale')
girar=wt(7,'girar'); golpe=wt(7,'golpe'); sig=wt(7,'sígueme')
def trans(t0,kind):
    if kind=='dirt': put(t0-0.3,lp(bp_noise(0.7,60,900,int(t0*10)),500)*np.hanning(int(.7*SR)),0.5); put(t0,thump(0.4,45),0.5)
    elif kind=='iris': put(t0-0.35,whoosh(0.35,False,int(t0*7)),0.3); put(t0,thump(0.4,55),0.4)
    elif kind=='glitch':
        for i in range(10): put(t0-0.3+i*0.06,click(R.uniform(600,3500),0.03),0.1)
        put(t0,impact(1.0,60,.6,.4,int(t0)),0.4)
    elif kind=='crack': put(t0-0.3,bp_noise(0.3,2000,9000,int(t0*3))*np.linspace(0,1,int(.3*SR)),0.3); put(t0,impact(1.4,52,.9,.7,int(t0*2)),0.65)
    elif kind=='page': put(t0-0.36,whoosh(0.6,True,int(t0*5)),0.28)
    elif kind=='flash': put(t0-0.25,whoosh(0.3,True,int(t0*9)),0.3); put(t0,impact(1.2,70,.7,.4,int(t0*4)),0.45)
for b_,k_ in zip(range(1,8),['dirt','iris','glitch','crack','page','flash','iris']): trans(starts[b_],k_)
# ---- scene 0: wind, coffin lowered, soil falls, knocks
put(0.02,impact(1.4,52,0.6,.25,11),0.4)
wd=bp_noise(starts[1]+0.5,150,1400,7)*(0.5+0.5*np.abs(np.sin(2*np.pi*0.25*tt_(starts[1]+0.5)))); put(0,wd*np.hanning(len(wd)),0.12)
for k in range(5): put(0.45+k*0.5,0.7*bp_noise(0.18,200,900,20+k)*np.exp(-tt_(.18)/.05),0.12)
put(entie-0.1,impact(1.6,46,1.0,.5,21),0.6)
for k in range(30): put(2.4+k*0.07+R.uniform(0,.03),lp(bp_noise(0.08,500,5000,100+k),3000)*np.exp(-tt_(.08)/.03),0.08)
put(3.0,thump(0.4,60),0.6)
for k in range(5): put(pan0+k*0.26,padd(thump(0.2,170),0.5*bp_noise(0.1,500,3000,30+k)[:int(.1*SR)]*np.exp(-tt_(.1)/.03)),0.5)
# ---- scene 1: air, trickle, bubbles
hb=starts[1]
while hb<starts[2]-0.1: heart(hb,0.55); hb+=1.0
sand=bp_noise(3.2,2500,8000,41)*np.hanning(int(3.2*SR)); put(horas-0.4,sand,0.04)
for k in range(10): put(starts[1]+0.8+k*0.4+R.uniform(0,.2),pop(R.uniform(600,1400),300,.06),0.1)
put(horas,reverb(ping(880,.8,.3),.8,.3),0.2)
# ---- scene 2: panic breathing & heartbeat accelerating
tb=starts[2]+0.2; per=1.1
while tb<starts[3]-0.3:
    ln=0.35; x=bp_noise(ln,300,3500,int(tb*13))*np.hanning(int(ln*SR)); put(tb,x,0.16); tb+=per; per=max(0.42,per*0.93)
hb=starts[2]+0.1; per=0.8
while hb<starts[3]-0.2: heart(hb,0.7); hb+=per; per=max(0.32,per*0.95)
for k in range(5): put(wt(2,'oxígeno')+0.3+k*0.45,np.sin(2*np.pi*1500*tt_(0.1))*np.hanning(int(.1*SR)),0.12)
# ---- scene 3: CO2 drone, dizziness, blackout
d3=starts[4]-starts[3]; dr=tt_(d3+0.5); drone=np.sin(2*np.pi*48*dr)+0.6*np.sin(2*np.pi*(51+2*np.sin(2*np.pi*0.4*dr))*dr)
put(starts[3],drone*np.hanning(len(dr))*0.14,1.0)
wob=np.sin(2*np.pi*np.cumsum(220+60*np.sin(2*np.pi*2.5*tt_(2.0)))/SR)*np.hanning(int(2.0*SR)); put(mareo-0.1,lp(wob,900),0.2)
for k in range(5): put(conf+k*0.18,reverb(ping(R.uniform(500,1200),1.0,.4),1.0,.4),0.1)
put(desm-0.1,whoosh(0.5,False,61),0.3); put(desm+0.1,thump(0.6,40),0.8); put(desm+0.2,lp(bp_noise(1.5,100,2000,62),400)*np.linspace(1,0,int(1.5*SR)),0.3)
# ---- scene 4: soil pressure, cracks, pour
rm=tt_(d3+1.5); put(starts[4],lp(bp_noise(len(rm)/SR,40,200,71),150)*np.hanning(len(rm))*0.5,0.3)
for k in range(4): put(tapa+0.2+k*0.35,padd(bp_noise(0.08,1500,7000,80+k)*np.exp(-tt_(.08)/.02),thump(.15,90)),0.45)
put(ced-0.3,whoosh(0.4,True,72),0.3); put(ced,impact(1.6,46,1.0,.7,73),0.75)
put(peso,lp(bp_noise(1.4,200,4000,74),2500)*np.hanning(int(1.4*SR)),0.3)
put(caer,impact(1.8,40,1.1,.8,75),0.8)
# ---- scene 5: church bell
for k in range(6): put(camp-0.1+k*0.62,reverb(padd(bell(392,2.4),0.5*bell(784,1.8)),1.5,.4),0.22)
put(starts[5],0.05*bp_noise(3,3000,9000,76)*np.hanning(int(3*SR)),0.0)
put(ayuda,reverb(padd(ping(784,1.2,.4),ping(988,1.0,.4)),1.2,.4),0.2)
# ---- scene 6: stamp slam + poster chains
put(med,whoosh(0.4,True,81),0.2)
put(cert,padd(impact(1.2,80,1.0,.6,82),click(1000,0.06,1.0)),0.7)
put(pero-0.2,whoosh(0.5,True,83),0.3)
for k in range(8): put(hou+k*0.12,padd(ping(R.uniform(1800,3200),0.3,.08),0.5*bp_noise(0.06,2000,7000,90+k)),0.12)
for k in range(5): put(sale-0.2+k*0.28,padd(thump(0.2,150),bp_noise(0.1,400,2500,95+k)[:int(.1*SR)]*np.exp(-tt_(.1)/.03)),0.4)
put(sale+0.9,reverb(ping(1320,1.2,.5),1.0,.4),0.15)
# ---- scene 7: spin up, hard stop, riser + CTA
sp=tt_(golpe-starts[7]); put(starts[7],lp(np.sin(2*np.pi*np.cumsum(120+380*(sp/sp[-1])**1.4)/SR)*(0.3+0.7*sp/sp[-1]),1500),0.18)
put(starts[7],0.06*bp_noise(len(sp)/SR,100,2500,97)*np.hanning(len(sp)),1.0)
put(golpe-0.02,impact(2.0,38,1.2,.9,98),1.0); put(golpe,lp(np.sin(2*np.pi*np.cumsum(np.linspace(900,60,int(.9*SR)))/SR)*np.linspace(1,0,int(.9*SR)),1500),0.4)
put(sig-0.1,whoosh(0.4,True,99),0.3)
put(sig+0.3,reverb(padd(bell(1320,1.2),0.6*bell(1760,1.0)),1.0,.35),0.3)
rw=tt_(0.25); put(sig+0.7,np.sin(2*np.pi*np.cumsum(900+2400*(rw/0.25))/SR)*np.exp(-rw/0.1),0.26)

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
w=wave.open(f'{S}/w_burial/mix_sfx.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
print('mix ok',total)
