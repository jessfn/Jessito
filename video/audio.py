import numpy as np, wave
sr=44100;D=24;n=sr*D;a=np.zeros(n)
def add(t,sig,g=1):
    i=int(t*sr);j=min(n,i+len(sig));a[i:j]+=sig[:j-i]*g
def tone(f,d,kind='sine',v=.3):
    t=np.arange(int(d*sr))/sr;e=np.minimum(1,t*80)*np.exp(-t*4/d*1.2)
    w=np.sin(2*np.pi*f*t)+(.3*np.sin(4*np.pi*f*t) if kind=='bell' else 0)
    return w*e*v
P=[261.6,293.7,329.6,392,440,523.3,587.3,659.3]
mel=[0,2,4,2,5,4,2,1,0,2,4,7,5,4,2,0]
b=0.25
for i in range(int(D/b)):
    t=i*b;add(t,tone(P[mel[i%16]],.4,'bell',.22))
    if i%2==0:add(t,tone(P[[0,3,4,3][(i//2)%4]]/2,.45,'sine',.2))
    add(t,np.random.randn(int(.03*sr))*np.exp(-np.arange(int(.03*sr))/300)*.05*(i%2==0))
for k in range(4):
    s=3+4*k
    t=np.arange(int(.35*sr))/sr;add(s+1.7,np.sin(2*np.pi*(200+400*t/.35)*t)*np.exp(-t*8)*.4)   # boing
    t=np.arange(int(.25*sr))/sr;add(s+2.3,np.random.randn(len(t))*np.exp(-t*25)*.6+np.sin(2*np.pi*120*t)*np.exp(-t*20)*.5) # pop
    for j,f in enumerate([523,659,784,1047]):add(s+2.4+j*.08,tone(f,.5,'bell',.3))
    t=np.arange(int(.18*sr))/sr;add(s+.4,np.sin(2*np.pi*(300+500*t/.18)*t)*np.exp(-t*10)*.3)  # sorpresa
    t=np.arange(int(.2*sr))/sr;add(s+2.85,np.sin(2*np.pi*90*t)*np.exp(-t*18)*.7)  # aterrizaje
for j,f in enumerate([523,659,784,1047,1319]):add(19+j*.12,tone(f,.6,'bell',.3))
a=np.tanh(a*1.5);a*=.8
a[:int(.05*sr)]*=np.linspace(0,1,int(.05*sr));a[-sr:]*=np.linspace(1,0,sr)
with wave.open('audio.wav','wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((a*32767).astype('<i2').tobytes())
