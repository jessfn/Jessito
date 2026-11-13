import sys, json, subprocess, re, math, os
import numpy as np
sys.path.insert(0,'..')
import build_sheet as bs
FPS=24
lines=json.load(open('lines.json'))
dur={}
for lid,who,vid,text in lines:
    dur[lid]=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'audio/{lid}.mp3']))
# ---- timeline ----
T={}
T['L1']=0.4
T['S1']=T['L1']+dur['L1']+0.15; T['L2']=T['S1']+0.3
T['S2']=T['L2']+dur['L2']+0.2; T['L3']=T['S2']+0.6; T['L4']=T['L3']+dur['L3']+0.2; T['L5']=T['L4']+dur['L4']+0.2
T['S3']=T['L5']+dur['L5']+0.25; T['L6']=T['S3']+0.6; T['L7']=T['L6']+dur['L6']+0.35; T['L8']=T['L7']+dur['L7']+0.35
T['S4']=T['L8']+dur['L8']+0.2; T['L9']=T['S4']+0.3
T['S5']=T['L9']+dur['L9']+0.2; T['L10']=T['S5']+0.3
T['END']=T['L10']+dur['L10']+1.6
T['S0']=0
print({k:round(v,2) for k,v in T.items()})
SR=44100
def load(path):
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',path,'-f','f32le','-ac','1','-ar',str(SR),'-'])
    return np.frombuffer(raw,dtype=np.float32).copy()
# ---- envelopes (mouth) ----
env={}
for lid,who,vid,text in lines:
    a=load(f'audio/{lid}.mp3'); n=int(len(a)/SR*FPS)+2
    e=[]
    for i in range(n):
        seg=a[int(i/FPS*SR):int((i+1)/FPS*SR)]
        e.append(float(np.sqrt(np.mean(seg**2))) if len(seg) else 0)
    e=np.array(e); e=e/ (np.percentile(e,95)+1e-6); e=np.clip(e,0,1)
    # smooth
    k=np.array([.25,.5,.25]); e=np.convolve(e,k,'same')
    env[lid]=[round(float(x),2) for x in e]

# ---- word timing + caption chunks ----
chunks=[]; cid=0
for lid,who,vid,text in lines:
    e=env[lid]; idx=[i for i,v in enumerate(e) if v>0.12]
    s0=T[lid]+(idx[0]/FPS if idx else 0); s1=T[lid]+((idx[-1]+1)/FPS if idx else dur[lid])
    words=text.split(); wts=[len(re.sub(r'\W','',w))+(5 if re.search(r'[,.?!…:]$',w) else 0)+1 for w in words]
    tot=sum(wts); acc=0; wl=[]
    for w,wt in zip(words,wts):
        a=s0+(s1-s0)*acc/tot; b=s0+(s1-s0)*(acc+wt)/tot; acc+=wt
        wl.append({'w':w,'t0':round(a,3),'t1':round(b,3)})
    cur=[]
    def flush():
        global cid
        if cur:
            chunks.append({'id':cid,'lid':lid,'who':who,'words':list(cur),'t0':cur[0]['t0'],'t1':0}); cid+=1; cur.clear()
    for w in wl:
        cur.append(w)
        if len(cur)>=3 or re.search(r'[,.?!…:]$',w['w']): flush()
    flush()
for i,c in enumerate(chunks):
    nxt=chunks[i+1]['t0'] if i+1<len(chunks) else None
    end=T[c['lid']]+dur[c['lid']]+0.25
    c['t1']=round(min(end, nxt) if nxt and nxt<end+0.4 and chunks[i+1]['lid']==c['lid'] else end,3)

# ---- audio mix ----
total=int((T['END']+0.5)*SR)
mix=np.zeros(total,dtype=np.float32); voice=np.zeros(total,dtype=np.float32)
for lid,who,vid,text in lines:
    a=load(f'audio/{lid}.mp3'); s=int(T[lid]*SR)
    g=1.0 if who!='crowd' else 0.9
    voice[s:s+len(a)]+=a*g
rng=np.random.default_rng(3)
t_=np.arange(total)/SR
def env_ad(n,a=0.005,d=0.3,p=3):
    x=np.arange(n)/SR; return np.minimum(x/a,1)*np.exp(-x/d*p/3)
def put(arr,start,sig,gain=1.0):
    s=int(start*SR); e=min(len(arr),s+len(sig))
    if s<0 or s>=len(arr): return
    arr[s:e]+=sig[:e-s]*gain
def tone(f,d,kind='sine',decay=0.4):
    n=int(d*SR); x=np.arange(n)/SR; ph=2*np.pi*f*x
    if kind=='sine': y=np.sin(ph)+0.3*np.sin(2*ph)+0.1*np.sin(3*ph)
    elif kind=='saw': y=2*((f*x)%1)-1
    elif kind=='pluck': y=np.sin(ph)+0.5*np.sin(2*ph)+0.25*np.sin(3*ph)
    else: y=np.sin(ph)
    return (y*np.exp(-x/decay)*np.minimum(x/0.004,1)).astype(np.float32)
def noise(d,lo=None):
    n=int(d*SR); y=rng.standard_normal(n).astype(np.float32); return y
def lowpass(y,k):
    ker=np.ones(k)/k; return np.convolve(y,ker,'same').astype(np.float32)
mf=lambda m:440*2**((m-69)/12)
music=np.zeros(total,dtype=np.float32)
# lullaby music-box (hook + sleep) from 0 to S2
bpm=72; beat=60/bpm
prog=[(60,64,67,72),(57,60,64,69),(53,57,60,65),(55,59,62,67)]
tt=0.0; bar=0
while tt<T['S2']:
    ch=prog[bar%4]
    for i,n in enumerate(ch*2):
        put(music,tt+i*beat/2,tone(mf(n+12),1.2,'sine',0.5),0.30)
    put(music,tt,tone(mf(ch[0]-12),2.2,'sine',0.9),0.22)
    tt+=beat*4; bar+=1
# stage: pop beat 124bpm  from S2 to S3
bpm=124; beat=60/bpm; tt=T['S2']; k=0
chords=[(57,60,64),(53,57,60),(48,52,55),(55,59,62)]
while tt<T['S3']:
    for q in range(4):
        b=tt+q*beat
        n=int(0.25*SR); x=np.arange(n)/SR
        kick=np.sin(2*np.pi*(120*np.exp(-x*30)+40)*x)*np.exp(-x*12)
        put(music,b,kick.astype(np.float32),0.75)
        put(music,b+beat/2,lowpass(noise(0.05),3)*np.exp(-np.arange(int(.05*SR))/SR*60).astype(np.float32),0.18)
        if q%2==1: put(music,b,(noise(0.18)*np.exp(-np.arange(int(.18*SR))/SR*25)).astype(np.float32),0.22)
        ch=chords[(k)%4]
        put(music,b,tone(mf(ch[0]-24),beat*0.9,'saw',0.25),0.18)
        for m_ in ch: put(music,b+beat/2,tone(mf(m_),0.3,'pluck',0.25),0.12)
    tt+=beat*4; k+=1
# playful bed S3..END
bpm=108; beat=60/bpm; tt=T['S3']; k=0
mel=[72,74,76,79,76,74,72,67]
while tt<T['END']:
    for q in range(8):
        put(music,tt+q*beat/2,tone(mf(mel[q]),0.35,'pluck',0.22),0.16)
    for q in range(4):
        put(music,tt+q*beat,tone(mf([48,48,43,45][k%4]),0.35,'pluck',0.2),0.2)
        n=int(0.12*SR); put(music,tt+q*beat+beat/2,(noise(0.12)*np.exp(-np.arange(n)/SR*40)).astype(np.float32),0.07)
    tt+=beat*4; k+=1
# sidechain duck
vol=np.abs(voice); w=int(0.12*SR)
env_v=np.convolve(vol,np.ones(w)/w,'same')
duck=1-0.55*np.clip(env_v/0.06,0,1)
music*=duck.astype(np.float32)
mix+=music*0.9
# crowd noise during stage
cs=int(T['S2']*SR); ce=int(T['S3']*SR)
cn=noise((ce-cs)/SR); cn=lowpass(cn,6)*3
cn=(cn*(0.5+0.5*np.sin(np.arange(len(cn))/SR*2))).astype(np.float32)
cn*=np.minimum(np.arange(len(cn))/SR/0.8,1)*np.minimum((len(cn)-np.arange(len(cn)))/SR/0.6,1)
mix[cs:ce]+=cn*0.10
# applause burst after L3 and L4
for st in (T['L3']+dur['L3']-0.4,T['L4']+dur['L4']-0.2):
    n=int(1.8*SR); a=lowpass(noise(1.8),5)*3
    a*= (np.minimum(np.arange(n)/SR/0.2,1)*np.exp(-np.arange(n)/SR*1.2)*(0.6+0.4*np.sin(np.arange(n)/SR*40))).astype(np.float32)
    put(mix,st,a.astype(np.float32),0.16)
# snore during sleep
st=T['S1']+0.5
while st<T['S2']-0.5:
    n=int(1.3*SR); x=np.arange(n)/SR
    s=lowpass(noise(1.3),30)*4*np.sin(np.pi*np.clip(x/1.3,0,1))**2
    put(mix,st,(s*np.sin(2*np.pi*70*x)).astype(np.float32),0.5)
    st+=2.6
# whooshes
def whoosh(at,d=0.6,up=True):
    n=int(d*SR); x=np.arange(n)/SR; y=lowpass(noise(d),int(8+(40 if up else 4)*(1-x/d)[0]))
    y=y*np.sin(np.pi*x/d)**2; put(mix,at,y.astype(np.float32),0.5)
for at in (T['S1']-0.2,T['S2']-0.15,T['S3']-0.15,T['S4']-0.1,T['S5']-0.1): whoosh(at)
# ding for choices
for f,fr in zip((0.46,0.64,0.83),(76,79,83)):
    put(mix,T['L9']+dur['L9']*f-0.1,tone(mf(fr),0.6,'sine',0.4),0.35)
put(mix,T['S5']+0.2,tone(mf(88),0.6,'sine',0.4),0.3)

# ---- SFX ----
def sw(f0,f1,d,decay=18,shape='sine'):
    n=int(d*SR); x=np.arange(n)/SR; f=f0+(f1-f0)*(x/d); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.exp(-x*decay)).astype(np.float32)
def pop(f=760): return sw(f,f*0.45,0.09,40)
def slam():
    a=sw(140,38,0.5,7); n=int(0.35*SR); b=lowpass(noise(0.35),10)*np.exp(-np.arange(n)/SR*12).astype(np.float32)*2
    out=a.copy(); out[:n]+=b[:len(out[:n])]; return out
def riser(d=0.7):
    n=int(d*SR); x=np.arange(n)/SR; y=noise(d); y=y-lowpass(y,int(40-34*x[-1]/d)+2)
    return (y*(x/d)**2*np.sin(np.pi*0.5*x/d)).astype(np.float32)
def boing(): return sw(260,520,0.12,6)+0.0*sw(520,200,0.3,8)
def boing2():
    a=sw(220,640,0.14,3); b=sw(640,180,0.45,6); out=np.zeros(int(0.6*SR),dtype=np.float32); out[:len(a)]+=a; out[len(a)-100:len(a)-100+len(b)]+=b[:len(out)-len(a)+100]; return out
def sparkle():
    out=np.zeros(int(0.9*SR),dtype=np.float32)
    for i,f in enumerate([1318,1568,1976,2349,2637,3136]): 
        t_=tone(f,0.5,'sine',0.18); put(out,i*0.06,t_,0.5)
    return out
def tada():
    out=np.zeros(int(1.2*SR),dtype=np.float32)
    for f in (523,659,784,1047): put(out,0.0,tone(f,1.1,'pluck',0.5),0.4)
    return out
def click(): return (noise(0.02)*np.exp(-np.arange(int(0.02*SR))/SR*200)).astype(np.float32)
def heart():
    out=np.zeros(int(0.2*SR),dtype=np.float32); a=sw(500,900,0.12,20); b=sw(900,1400,0.16,18); out[:len(a)]+=a; out[:len(b)]+=0.7*b; return out
ev=[]
# word-chunk pops
for c in chunks:
    last=c['words'][-1]['w']; f=980 if re.search(r'[!?]$',last) else (820 if c['who']=='dina' else 700)
    put(mix,c['t0'],pop(f),0.22)
# hook slams (kinetic title words)
for i,tt in enumerate((0.3,0.52,0.74,0.96,1.18,1.40)): put(mix,tt,slam()*0.5,0.4)
# title cards
put(mix,T['S2']-0.5,riser(0.6),0.35); put(mix,T['S2']+0.12,slam(),0.65); put(mix,T['S2']+0.12,sparkle(),0.35)
put(mix,T['S3']+0.05,boing2(),0.5); put(mix,T['S3']+0.05,slam()*0.6,0.4)
put(mix,T['S4']+0.1,slam(),0.55); put(mix,T['S4']+0.1,sparkle(),0.3)
for f in (0.46,0.64,0.83): put(mix,T['L9']+dur['L9']*f-0.18,pop(1100),0.4)
put(mix,T['L9']+dur['L9']*0.83+0.1,tada(),0.35)
put(mix,T['S5']+0.15,riser(0.35),0.3); put(mix,T['S5']+0.35,slam()*0.7,0.5); put(mix,T['END']-3.0,slam()*0.6,0.4)
put(mix,T['S5']+0.55,pop(900),0.4); put(mix,T['S5']+0.8,pop(1100),0.4)
put(mix,T['L10']+dur['L10']*0.9,click(),0.8); put(mix,T['L10']+dur['L10']*0.9+0.15,heart(),0.5)
put(mix,T['END']-1.2,sparkle(),0.35)

mix+=voice*1.0
mix=np.tanh(mix*0.9)
import wave
pcm=(np.clip(mix,-1,1)*32767).astype(np.int16)
with wave.open('mix.wav','wb') as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(pcm.tobytes())
# ---- HTML ----
defs=bs.defs
def cut(gid,marker,newid):
    i=defs.index(f'<g id="{gid}">'); j=defs.index(marker,i)
    return f'<g id="{newid}">'+defs[i+len(f'<g id="{gid}">'):j]+'</g>'
extra=cut('exprSurp','<ellipse cx="0" cy="78" rx="24" ry="30" fill="#4a1520"/>','eyesSurp')
extra+=cut('exprSad','<path d="M-34,98 Q0,66 34,98"','eyesSad')
extra+=cut('exprHappy','<path d="M-46,60 Q0,50 46,60','eyesHappy')
defs2=defs.replace('</defs>',extra+'</defs>')
body=bs.body
body=body.replace('<g transform="translate(0,52)">','')  # unused
body=re.sub(r'<g transform="translate\(450,196\)"><use href="#headFace"/>.*?<use href="#headB"/></g>',
   '<g id="dinaHead" transform="translate(450,196)"></g>',body,flags=re.S)
body=body.replace('<g id="dina" transform="translate(0,52)">','<g id="dina" transform="translate(0,52)">')
data={'chunks':chunks,'T':T,'dur':dur,'env':env,'lines':[[a,b,d] for a,b,c,d in lines],'FPS':FPS}
tpl=open('episode_template.html').read()
html=tpl.replace('__DEFS__',defs2).replace('__BODY__',body).replace('__DATA__',json.dumps(data,ensure_ascii=False))
open('episode.html','w').write(html)
print('html ok',len(html))
