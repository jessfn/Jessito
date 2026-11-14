import sys, json, subprocess, re, math, os
import numpy as np
sys.path.insert(0,'..')
import build_sheet as bs
FPS=24
lines=json.load(open('lines.json'))
i4=[i for i,l in enumerate(lines) if l[0]=='L4'][0]
lines.insert(i4+1,['SING','sing',None,'♪ Voy a brillar... voy a brillar... esta noche el mundo me va a escuchar ♪'])
dur={}
for lid,who,vid,text in lines:
    dur[lid]=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'audio/{lid}.mp3']))
# ---- timeline ----
T={}
T['L1']=0.4
T['S1']=T['L1']+dur['L1']+0.15; T['L2']=T['S1']+0.3
T['S2']=T['L2']+dur['L2']+0.2; T['L3']=T['S2']+0.6; T['L4']=T['L3']+dur['L3']+0.2; T['SING']=T['L4']+dur['L4']+0.15; T['L5']=T['SING']+dur['SING']+0.25
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

# card times from word timing
cw=[w for c in chunks if c['lid']=='L9' for w in c['words']]
cardT=[next(w['t0'] for w in cw if 'dientes' in w['w'].lower()), next(w['t0'] for w in cw if 'piel' in w['w'].lower())]
print('cardT',cardT)
# ---- audio mix ----
total=int((T['END']+0.5)*SR)
voice=np.zeros(total,dtype=np.float32); bed=np.zeros(total,dtype=np.float32)
def fftconv(a,b):
    n=len(a)+len(b)-1; N=1<<(n-1).bit_length()
    return np.fft.irfft(np.fft.rfft(a,N)*np.fft.rfft(b,N),N)[:n].astype(np.float32)
_r=np.random.default_rng(5); _n=int(0.45*SR)
IR=(_r.standard_normal(_n)*np.exp(-np.arange(_n)/SR*7)).astype(np.float32); IR/=np.sqrt(np.sum(IR**2))
def resamp(a,f):
    return np.interp(np.arange(0,len(a)-1,f),np.arange(len(a)),a).astype(np.float32)
def put(arr,start,sig,gain=1.0):
    st=int(start*SR)
    if st<0: sig=sig[-st:]; st=0
    e=min(len(arr),st+len(sig))
    if st>=len(arr) or e<=st: return
    arr[st:e]+=sig[:e-st]*gain
def clip(name,rms=None,maxd=None):
    a=load(f'sfx/{name}.mp3')
    if maxd: a=a[:int(maxd*SR)]
    if rms: a=a*(rms/(np.sqrt(np.mean(a**2))+1e-6))
    return a
def fade(a,fi=0.05,fo=0.2):
    a=a.copy(); n=len(a); i=int(fi*SR); o=int(fo*SR)
    if i>0: a[:i]*=np.linspace(0,1,i)
    if o>0: a[-o:]*=np.linspace(1,0,o)
    return a
for lid,who,vid,text in lines:
    a=load(f'audio/{lid}.mp3'); st=int(T[lid]*SR)
    w_=int(0.02*SR); n_=len(a)//w_; rms=np.sqrt(np.mean(a[:n_*w_].reshape(n_,w_)**2,axis=1)); p90=np.percentile(rms[rms>1e-4],90)
    a=a*((0.16 if who!='sing' else 0.2)/p90)
    if who=='crowd':
        l2=np.zeros(len(a)+SR//10,dtype=np.float32); l2[:len(a)]+=a
        for f,dl in ((0.93,0.03),(1.07,0.06)):
            r_=resamp(a,f)*0.7; d_=int(dl*SR)
            if d_+len(r_)>len(l2): l2=np.pad(l2,(0,d_+len(r_)-len(l2)))
            l2[d_:d_+len(r_)]+=r_
        a=l2*0.7
    if who in ('anun','crowd'):
        wet=fftconv(a,IR)*(0.16 if who=='crowd' else 0.07); a=np.pad(a,(0,len(wet)-len(a)))+wet
    a=(np.tanh(a*1.3)/1.3).astype(np.float32)
    voice[st:st+len(a)]+=a[:max(0,len(voice)-st)]
# ---- music (ElevenLabs) ----
def seg(name,t0,t1,gain,fi=0.4,fo=0.8):
    a=clip(name,rms=0.1); n=int((t1-t0)*SR)
    if len(a)<n: a=np.tile(a,int(np.ceil(n/len(a))))
    put(bed,t0,fade(a[:n],fi,fo),gain)
seg('m_lullaby',0,T['S2']+0.3,0.55)
seg('m_stage',T['S2']-0.2,T['S3']+0.3,0.6)
seg('m_play',T['S3']-0.1,T['END']+0.4,0.5,0.4,1.2)
# ---- ambience & foley ----
put(bed,T['S1']-0.1,fade(clip('night',rms=0.05,maxd=T['S2']-T['S1']+0.3),0.4,0.4),0.8)
put(bed,T['S1']+0.5,clip('snore',rms=0.1),0.8); put(bed,T['S1']+3.2,clip('snore',rms=0.1),0.8)
# transitions
for k in ('S1','S2','S3','S4','S5'): put(bed,T[k]-0.25,clip('whoosh',rms=0.12),0.9)
# hook kinetic words
put(bed,0.3,clip('impact',rms=0.14,maxd=1.0),0.7)
for tt in (0.52,0.74,0.96,1.18,1.40): put(bed,tt,clip('pop',rms=0.1),0.6)
# dream title
put(bed,T['S2']-0.7,clip('riser',rms=0.12),0.8); put(bed,T['S2']+0.1,clip('impact',rms=0.16),0.9); put(bed,T['S2']+0.12,clip('sparkle',rms=0.1),0.7)
# crowd
put(bed,T['L3']+dur['L3']-0.5,fade(clip('applause',rms=0.12,maxd=5.0),0.2,1.0),0.9)
put(bed,T['L4']-0.2,fade(clip('cheer',rms=0.13,maxd=3.6),0.1,0.8),0.9); put(bed,T['SING']+0.2,fade(clip('cheer',rms=0.1,maxd=3.6),0.3,1.0),0.7); put(bed,T['SING']+dur['SING']-0.3,fade(clip('applause',rms=0.12,maxd=3.0),0.2,0.8),0.9)
put(bed,T['L5']+dur['L5']-0.3,fade(clip('applause',rms=0.1,maxd=2.5),0.1,0.6),0.7)
# wake up
put(bed,T['S3']+0.0,clip('boing',rms=0.12),0.8); put(bed,T['S3']+0.05,clip('impact',rms=0.1,maxd=0.8),0.5)
put(voice,T['S3']+0.02,clip('gasp',rms=0.12,maxd=0.8),1.0)
# day title + cards
put(bed,T['S4']+0.1,clip('impact',rms=0.14,maxd=1.0),0.8); put(bed,T['S4']+0.12,clip('sparkle',rms=0.09),0.6)
for ct in cardT: put(bed,ct-0.12,clip('pop',rms=0.13),0.9)
put(bed,cardT[1]+0.2,clip('tada',rms=0.11),0.6)
# CTA
put(bed,T['S5']+0.05,clip('riser',rms=0.1,maxd=0.8),0.6); put(bed,T['S5']+0.25,clip('impact',rms=0.12,maxd=0.8),0.6)
put(bed,T['S5']+0.55,clip('pop',rms=0.12),0.8); put(bed,T['S5']+0.8,clip('pop',rms=0.12),0.8)
put(bed,T['L10']+dur['L10']*0.9+0.1,clip('heart',rms=0.12),0.9); put(bed,T['END']-1.1,clip('sparkle',rms=0.08),0.6)
# sidechain duck of the whole bed under dialogue
vol=np.abs(voice); w=int(0.15*SR); env_v=np.convolve(vol,np.ones(w)/w,'same')
duck=(1-0.8*np.clip(env_v/0.025,0,1)).astype(np.float32)
mix=bed*duck+voice*1.0
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

def limb(up,fo,wid,skin):
    pass
arm_up='<path d="M-35,0 C-38,40 -33,85 -29,106 A29,29 0 0 0 29,106 C33,85 38,40 35,0 A35,35 0 0 0 -35,0 Z" fill="url(#limbG)" stroke="#6b4a3a" stroke-width="4" stroke-linejoin="round"/><path d="M-26,52 q10,9 24,3 M-24,72 q9,7 20,2" stroke="#b78a72" stroke-width="3.2" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="104" rx="14" ry="5" fill="#e2bfa8" opacity=".6"/>'
arm_fo='<path d="M-28,0 C-29,30 -25,70 -22,92 A22,22 0 0 0 22,92 C25,70 29,30 28,0 Z" fill="url(#limbG)" stroke="#6b4a3a" stroke-width="4" stroke-linejoin="round"/><path d="M-20,40 q8,6 18,2" stroke="#b78a72" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
MIC='<g id="micR" style="display:none"><rect x="-6" y="30" width="12" height="50" rx="5" fill="#222" stroke="#000" stroke-width="2"/><circle cx="0" cy="90" r="16" fill="#777" stroke="#111" stroke-width="3"/><path d="M-11,84 l22,12 M-13,90 l26,0 M-11,96 l20,-12" stroke="#222" stroke-width="2" opacity=".6"/></g>'
def arm_group(side):
    tr='translate(384,352)' if side=='L' else 'translate(516,352) scale(-1,1)'
    return (f'<g transform="{tr}"><g id="arm{side}"><g id="fore{side}" transform="translate(0,108)">{arm_fo}<g id="hand{side}" transform="translate(0,104) scale(1.05)"><use href="#hand"/>{MIC if side=='R' else ''}</g></g>{arm_up}</g></g>')
body=bs.body
i0=body.index(' <!-- arms -->'); i1=body.index(' <!-- shorts -->')
body=body[:i0]+' '+arm_group('L')+arm_group('R')+'\n'+body[i1:]
body=body.replace('<g transform="translate(0,52)">','')  # unused
body=re.sub(r'<g transform="translate\(450,196\)"><use href="#headFace"/>.*?<use href="#headB"/></g>',
   '<g id="dinaHead" transform="translate(450,196)"></g>',body,flags=re.S)
body=body.replace('<g id="dina" transform="translate(0,52)">','<g id="dina" transform="translate(0,52)">')
data={'cardT':cardT,'chunks':chunks,'T':T,'dur':dur,'env':env,'lines':[[a,b,d] for a,b,c,d in lines],'FPS':FPS}
tpl=open('episode_template.html').read()
html=tpl.replace('__DEFS__',defs2).replace('__BODY__',body).replace('__DATA__',json.dumps(data,ensure_ascii=False))
open('episode.html','w').write(html)
print('html ok',len(html))
