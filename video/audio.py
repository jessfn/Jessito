import numpy as np, wave, subprocess
sr=48000;D=24;n=sr*D;rng=np.random.default_rng(7)
M=np.zeros((n,2));V=np.zeros((n,2));X=np.zeros((n,2))
def put(buf,t,sig,g=1,pan=0):
    i=int(t*sr);
    if i>=n:return
    j=min(n,i+len(sig));s=sig[:j-i]*g
    buf[i:j,0]+=s*np.sqrt((1-pan)/2);buf[i:j,1]+=s*np.sqrt((1+pan)/2)
def tt(d):return np.arange(int(d*sr))/sr
def hz(m):return 440*2**((m-69)/12)
def marimba(f,d=.45,v=.5):
    t=tt(d);e=np.exp(-t*9);w=np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*f*4*t)*np.exp(-t*30)+.12*np.sin(2*np.pi*f*10*t)*np.exp(-t*60)
    return w*e*v*np.minimum(1,t*600)
def pluck(f,d=.3,v=.3):
    t=tt(d);e=np.exp(-t*14);w=np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*2*t)+.25*np.sin(2*np.pi*f*3*t);return w*e*v*np.minimum(1,t*800)
def bass(f,d=.4,v=.55):
    t=tt(d);e=np.exp(-t*6);return (np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*2*f*t))*e*v*np.minimum(1,t*400)
def noise(d):return rng.standard_normal(int(d*sr))
def lp(x,a):  # filtro simple
    y=np.zeros_like(x);s=0
    for i in range(len(x)):s+=a*(x[i]-s);y[i]=s
    return y
def hp(x,a):return x-lp(x,a)
# ---- musica: 12 compases de 2 s, C-Am-F-G
chords=[(60,64,67),(57,60,64),(53,57,60),(55,59,62)]
roots=[36,33,29,31]
pent=[72,74,76,79,81,84]
pat=[0,2,4,2,3,2,1,0, 2,4,5,4,3,2,4,2]
for bar in range(12):
    t0=bar*2.0;ch=chords[bar%4];vol=1.0
    for b in (0,2):put(M,t0+b*.5,bass(hz(roots[bar%4]),.45),.9,-.15)
    for b in (1,3):
        for m in ch:put(M,t0+b*.5,pluck(hz(m)),.5,.2)
    for e in range(4):
        m=pent[pat[(bar*4+e)%16]%6]
        # elige notas del acorde para que suene consonante
        m=min([c+12*k for c in ch for k in (1,2)],key=lambda x:abs(x-m))
        put(M,t0+e*.5+(0.25 if e%2 else 0),marimba(hz(m)),.9,-.3+.2*e/3)
    for e in range(8):put(M,t0+e*.25,lp(hp(noise(.07),.3),.6)*np.exp(-tt(.07)*60)*.5*(1 if e%2 else .6),.5,.4 if e%2 else -.4)
M*=.32
# ---- voz: narradora (Kokoro, voz en espanol)
V=np.zeros((n,2))
def vo(name,t,g=1.0):
    a=np.load('voz/%s.npy'%name);a=np.interp(np.arange(int(len(a)*sr/22050))*22050/sr,np.arange(len(a)),a)
    a=a/np.max(np.abs(a))*g;put(V,t,a,1,0)
vo('n_hola',.5,.95)
for k,c in enumerate(['rojo','azul','amarillo','verde']):
    vo('n_'+c,3+4*k+1.78,.95)
vo('n_sub',19.4,.95);vo('n_chao',22.3,.95)
# ---- efectos
def whoosh(d,up=True,pan=0,g=.5):
    x=noise(d);t=tt(d);e=np.sin(np.pi*t/d)**2;f=np.linspace(.03,.35,len(x)) if up else np.linspace(.35,.03,len(x))
    y=np.zeros_like(x);s=0
    for i in range(len(x)):s+=f[i]*(x[i]-s);y[i]=s
    return y*e*g*3
def boing(g=.45):
    t=tt(.5);f=180+520*np.exp(-t*7);ph=2*np.pi*np.cumsum(f)/sr+.6*np.sin(2*np.pi*14*t);return (np.sin(ph)+.3*np.sin(2*ph))*np.exp(-t*6)*g*np.minimum(1,t*300)
def pop(g=.9):
    t=tt(.3);n_=lp(hp(noise(.3),.2),.8)*np.exp(-t*28)*1.3;th=np.sin(2*np.pi*(150-90*t/.3)*t)*np.exp(-t*20);return (n_+th*.9)*g
def thump(g=.8):
    t=tt(.25);return np.sin(2*np.pi*(95-50*t/.25)*t)*np.exp(-t*16)*g+lp(noise(.25),.15)*np.exp(-t*40)*.3
def sparkle(root=84,g=.35):
    o=np.zeros(int(.9*sr))
    for j,m in enumerate([0,4,7,12,16,19]):
        sg=marimba(hz(root+m),.35,1)*1.0;i=int(j*.07*sr);o[i:i+len(sg)]+=sg[:len(o)-i]
    return o*g
def shimmer(d=1.2,g=.25):
    t=tt(d);return hp(noise(d),.5)*np.exp(-t*2.5)*(.5+.5*np.sin(2*np.pi*22*t))*g
def squeak(g=.25):
    t=tt(.3);f=500+300*t/.3;return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-t*8)*g
for k in range(4):
    s=3+4*k;sd=-1 if k%2 else 1
    put(X,s+.05,whoosh(1.0,False,sd*.7,.5),1,sd*.6)
    put(X,s+.95,squeak(),1,-.2);put(X,s+1.1,squeak(.2),1,.2)
    put(X,s+1.25,boing(),1,0);put(X,s+1.3,whoosh(.45,True,0,.55),1,0)
    put(X,s+1.75,pop(),1,0);put(X,s+1.8,sparkle(84+[0,2,4,7][k]),1,0);put(X,s+1.85,shimmer(),1,0)
    put(X,s+1.95,whoosh(.3,False,0,.4),1,0);put(X,s+2.2,thump(),1,0)
    put(X,s+2.35,marimba(hz(72+[0,2,4,7][k]),.5,.5),1,0)
for j in range(5):put(X,[.2,.5,.9,1.3,1.7][j],pluck(hz(72+j*3),.3,.3),1,0)
put(X,1.9,sparkle(79,.3),1,0)
put(X,19.0,sparkle(84,.4),1,0);put(X,21.0,pop(.4),1,0);put(X,21.55,marimba(hz(84),.6,.6),1,0)
# ---- ducking de la musica bajo la voz
env=np.abs(V).mean(1);k=int(.05*sr);env=np.convolve(env,np.ones(k)/k,'same');env=np.convolve(np.minimum(1,env*8),np.ones(int(.15*sr))/int(.15*sr),'same')
duck=1-.55*np.clip(env,0,1);M*=duck[:,None]
k=np.ones(8)/8
for ch in (0,1):X[:,ch]=np.convolve(X[:,ch],k,'same')  # suaviza los golpes agudos de los efectos
mix=M*.9+V*1.5+X*.32
mix[:int(.03*sr)]*=np.linspace(0,1,int(.03*sr))[:,None];mix[-sr:]*=np.linspace(1,0,sr)[:,None]
mix/=max(1e-9,np.max(np.abs(mix)))*1.02
with wave.open('audio_raw.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((mix*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','audio_raw.wav','-af','loudnorm=I=-18:TP=-3:LRA=7','-ar','48000','audio.wav'],check=True)
