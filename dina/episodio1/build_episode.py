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
data={'T':T,'dur':dur,'env':env,'lines':[[a,b,d] for a,b,c,d in lines],'FPS':FPS}
tpl=open('episode_template.html').read()
html=tpl.replace('__DEFS__',defs2).replace('__BODY__',body).replace('__DATA__',json.dumps(data,ensure_ascii=False))
open('episode.html','w').write(html)
print('html ok',len(html))
