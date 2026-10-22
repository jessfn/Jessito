import json,html,sys
S=sys.argv[1]  # base dir with bees/assets/fonts and w_marianas
TL=json.load(open(f'{S}/w_marianas/timeline.json'));ST=TL['starts'];TOTAL=TL['total'];SEGS=TL['segs']
def wt(seg,key):
    for w in SEGS[seg]['words']:
        if key in w[0].lower(): return ST[seg]+w[1]
    return ST[seg]+.5
ND=len(ST);END=ST[1:]+[TOTAL]
els=[];js=[];TITLES=set()
def esc(s): return html.escape(s,quote=False)
def row(id_,y,h=160,cls=''): return f'<div class="row {cls}" id="{id_}" style="top:{y}px;height:{h}px;margin-top:-{h//2}px"><div class="in" id="{id_}_i">'
from PIL import ImageFont
FB=ImageFont.truetype('bees/assets/fonts/Outfit-900.ttf',72)
def fit(txt,size,maxw=880,pad=0):
    """largest font size <= size so the text (plus padding) fits maxw px"""
    w=FB.getlength(txt)*size/72+len(txt)*.02*size+pad
    return size if w<=maxw else max(24,int(size*(maxw-pad)/(w-pad)))
def text_el(id_,y,txt,size,color,weight=900,stroke=0,h=None,extra=''):
    size=fit(txt,size,900)
    h=h or int(size*1.5)
    inner=''.join(f'<span class="ch">{esc(c) if c!=" " else "&nbsp;"}</span>' for c in txt) if size>=72 else esc(txt)
    if size>=72: TITLES.add(id_)
    els.append(row(id_,y,h)+f'<span class="tx" style="font-size:{size}px;color:{color};font-weight:{weight};{extra}">{inner}</span></div></div>')
def pop(id_,t,dur=.45,ease='back.out(1.7)',s0=.2):
    # opacity is ONLY switched with set() (no tween race); tweens animate transform/blur only
    js.append(f"tl.set('#{id_}_i',{{opacity:1}},{t:.3f});")
    if id_ in TITLES:
        js.append(f"tl.fromTo('#{id_}_i .ch',{{opacity:0,y:70,rotationX:-80,filter:'blur(10px)'}},{{opacity:1,y:0,rotationX:0,filter:'blur(0px)',duration:.6,ease:'expo.out',stagger:.03}},{t:.3f});")
        return
    js.append(f"tl.fromTo('#{id_}_i',{{scale:{s0},y:40,filter:'blur(16px)'}},{{scale:1,y:0,filter:'blur(0px)',duration:{dur+.15},ease:'expo.out'}},{t:.3f});")
def fade(id_,t,dur=.4):
    js.append(f"tl.set('#{id_}_i',{{opacity:1}},{t:.3f});")
    js.append(f"tl.fromTo('#{id_}_i',{{y:14,filter:'blur(8px)'}},{{y:0,filter:'blur(0px)',duration:{dur},ease:'power2.out'}},{t:.3f});")
def hide(id_,t,dur=.15):
    js.append(f"tl.set('#{id_}_i',{{opacity:0}},{t:.3f});")
def stamp(id_,y,txt,color,size,rot,t,t_hide):
    assert t_hide>t+.5,(id_,t,t_hide)
    pill=size<=104
    size=fit(txt,size,900,pad=64 if pill else 0)
    els.append(row(id_,y,int(size*1.6))+f'<span class="tx stamp" style="font-size:{size}px;color:{color};text-shadow:0 0 34px {color},0 0 10px {color};{"background:rgba(12,8,28,.66);padding:8px 28px;border-radius:34px;" if pill else ""}">{esc(txt)}</span></div></div>')
    js.append(f"gsap.set('#{id_}_i',{{rotation:{rot},opacity:0}});")
    js.append(f"tl.set('#{id_}_i',{{opacity:1}},{t:.3f});")
    js.append(f"tl.fromTo('#{id_}_i',{{scale:.5,filter:'blur(18px)'}},{{scale:1,filter:'blur(0px)',duration:.42,ease:'back.out(2.2)'}},{t:.3f});")
    hide(id_,t_hide)

def wtn(seg,key,n=0):
    k=0
    for w in SEGS[seg]['words']:
        if key in w[0].lower():
            if k==n: return ST[seg]+w[1]
            k+=1
    raise Exception(key)
def wx(seg,word,n=0):
    k=0
    for w in SEGS[seg]['words']:
        if w[0].lower()==word:
            if k==n: return ST[seg]+w[1]
            k+=1
    raise Exception(word)
E_=lambda i:ST[i]-.30
spo=wt(0,'spoiler')
text_el('t0a',205,'¿QUÉ PASARÍA SI',84,'#fff',extra='background:rgba(8,28,62,.62);padding:8px 30px;border-radius:36px;');text_el('t0b',330,'CAES A LA FOSA',96,'#ffd23f',extra='background:rgba(8,28,62,.62);padding:8px 30px;border-radius:36px;');text_el('t0c',455,'DE LAS MARIANAS?',92,'#ff7a3c',extra='background:rgba(8,28,62,.62);padding:8px 30px;border-radius:36px;')
pop('t0a',.05);pop('t0b',.20);pop('t0c',.35)
for i in 'abc': hide('t0'+i,spo-.2)
stamp('s0',410,'SPOILER: NUNCA MÁS LUZ','#ff7a8a',64,-3,spo,E_(1))
stamp('s1a',410,'EL PUNTO MÁS PROFUNDO','#9fe0ff',68,-3,wt(1,'punto'),wt(1,'casi')-.1)
stamp('s1b',410,'10 935 METROS','#ffe228',92,3,wt(1,'casi'),wx(1,'más',1)-.1)
stamp('s1c',410,'MÁS QUE EL EVEREST','#ff9a5a',70,-3,wx(1,'más',1),E_(2))
stamp('s2a',410,'200 METROS','#9fe0ff',96,-3,wt(2,'doscientos'),wt(2,'ya')-.1)
stamp('s2b',410,'CASI SIN LUZ','#bfd6ff',84,3,wt(2,'casi'),wx(2,'a',1)-.1)
stamp('s2c',410,'1 000 METROS','#ffe228',90,-3,wx(2,'a',1),wt(2,'oscuridad')-.1)
stamp('s2d',410,'OSCURIDAD TOTAL','#c9b8ff',76,3,wt(2,'oscuridad'),E_(3))
stamp('s3a',410,'PRESIÓN BRUTAL','#ff4a5e',84,-3,wt(3,'presión'),wtn(3,'más')-.1)
stamp('s3b',410,'1 000 VECES MÁS','#ffb347',80,3,wtn(3,'más'),wt(3,'cargar')-.1)
stamp('s3c',410,'50 AVIONES ENCIMA','#fff3d0',66,-3,wt(3,'cargar'),E_(4))
stamp('s4a',410,'PULMONES','#ff9aa8',96,-3,wt(4,'pulmones'),wt(4,'oídos')-.1)
stamp('s4b',410,'OÍDOS','#ffd1a8',104,3,wt(4,'oídos'),wt(4,'mucho')-.1)
stamp('s4c',410,'ANTES DE LLEGAR AL FONDO','#9fe0ff',58,-3,wt(4,'mucho'),E_(5))
stamp('s5a',410,'NO ESTARÍAS SOLO','#46f0a0',80,-3,wt(5,'estarías'),wt(5,'hay')-.1)
stamp('s5b',410,'PECES TRANSPARENTES','#ffc4dc',64,3,wt(5,'peces'),wt(5,'crust')-.1)
stamp('s5c',410,'CRUSTÁCEOS GIGANTES','#ffb27a',64,-3,wt(5,'crust'),wt(5,'criaturas')-.1)
stamp('s5d',410,'BRILLAN EN LA OSCURIDAD','#9ff0ff',60,3,wt(5,'criaturas'),E_(6))
stamp('s6a',410,'POCOS HUMANOS','#fff',84,-3,wt(6,'pocos'),wt(6,'dos')-.1)
stamp('s6b',410,'2012 · 10 908 m','#9fe0ff',78,3,wt(6,'dos'),wt(6,'james')-.1)
stamp('s6c',410,'JAMES CAMERON','#ffe228',84,-3,wt(6,'james'),wt(6,'submarino')-.1)
stamp('s6d',410,'SUBMARINO ESPECIAL','#7fe0ff',68,3,wt(6,'submarino'),wt(6,'sin')-.1)
stamp('s6e',410,'SIN TOCAR EL AGUA','#46f0a0',72,-3,wt(6,'sin'),E_(7))
sig=wt(7,'sígueme');volc=wt(7,'volcán')
u=ST[7]
text_el('c7a',440,'SIGUIENTE',150,'#ffe228',extra='text-shadow:0 8px 0 rgba(0,0,0,.55);');pop('c7a',u,.5)
text_el('c7b',545,'¿Y SI CAES',58,'#fff');fade('c7b',u+.6)
text_el('c7c',625,'DENTRO DE UN VOLCÁN?',62,'#ff7a3c');pop('c7c',volc-.5,.5)
els.append('<div class="row" id="btn" style="top:742px;height:130px;margin-top:-65px"><div class="in" id="btn_i"><div class="btn"><span class="tx" style="font-size:60px;color:#fff;font-weight:900">SÍGUEME ▶</span></div></div></div>')
js.append("gsap.set('#btn_i',{opacity:0});")
js.append(f"tl.fromTo('#btn_i',{{opacity:0,scale:.6}},{{opacity:1,scale:1,duration:.3,ease:'back.out(2)'}},{sig-.1:.3f});")
tp=sig+.3
while tp<TOTAL-.5:
    js.append(f"tl.to('#btn_i',{{scale:1.07,duration:.22,ease:'sine.inOut'}},{tp:.3f});tl.to('#btn_i',{{scale:1,duration:.22,ease:'sine.inOut'}},{tp+.22:.3f});");tp+=.45
# ---- subtitles (karaoke chunks)
chunks=[]
for i,sg in enumerate(SEGS):
    ws=sg['words'];j=0
    while j<len(ws):
        n=2 if len(ws)-j==4 else 3;n=min(n,len(ws)-j)
        if n==1 and chunks and chunks[-1]['si']==i and len(chunks[-1]['ws'])<4: chunks[-1]['ws'].append(ws[j]);j+=1;continue
        chunks.append({'si':i,'s0':ST[i],'ws':list(ws[j:j+n])});j+=n
from PIL import ImageFont
FNT=ImageFont.truetype('bees/assets/fonts/Outfit-900.ttf',56)
sub=[]
for ci,c in enumerate(chunks):
    a=c['s0']+c['ws'][0][1];nx=chunks[ci+1] if ci+1<len(chunks) else None
    b=(nx['s0']+nx['ws'][0][1]) if nx and nx['si']==c['si'] else c['s0']+c['ws'][-1][2]+.25
    ww=[FNT.getlength(w[0].upper()) for w in c['ws']];tot=sum(ww)+36*(len(ww)-1);scl=min(1.0,780/tot)
    words=''.join(f'<span class="w" data-layout-allow-overlap><span class="b">{esc(w[0].upper())}</span><span class="h" id="h{ci}_{wi}">{esc(w[0].upper())}</span></span>' for wi,w in enumerate(c['ws']))
    sub.append(f'<div class="chunk" id="ck{ci}">{words}</div>')
    js.append(f"tl.set('#ck{ci}',{{opacity:1}},{max(0,a-.02):.3f});")
    js.append(f"tl.fromTo('#ck{ci}',{{scale:{.92*scl:.3f},y:22,filter:'blur(8px)'}},{{scale:{scl:.3f},y:0,filter:'blur(0px)',duration:.22,ease:'expo.out'}},{max(0,a-.02):.3f});")
    js.append(f"tl.set('#ck{ci}',{{opacity:0}},{b-.03:.3f});")
    for wi,w in enumerate(c['ws']):
        ws_=c['s0']+w[1]-.02;we=c['s0']+w[2]+.05
        js.append(f"tl.set('#h{ci}_{wi}',{{opacity:1}},{max(0,ws_):.3f});")
        if wi<len(c['ws'])-1: js.append(f"tl.set('#h{ci}_{wi}',{{opacity:0}},{we:.3f});")
els.append('<div id="subs" style="position:absolute;left:0;top:1350px;width:1080px;height:0">'+''.join(sub)+'</div>')

css='''
@font-face{font-family:'Outfit';font-weight:800;src:url(assets/fonts/outfit-latin-800-normal.woff2) format('woff2')}
@font-face{font-family:'Outfit';font-weight:900;src:url(assets/fonts/outfit-latin-900-normal.woff2) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;width:2160px;height:3840px;overflow:hidden;background:transparent}
#root{position:relative;width:2160px;height:3840px;overflow:hidden;font-family:'Outfit','Helvetica Neue',Arial,sans-serif}
#bg{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}
#fx{position:absolute;left:0;top:0;width:1080px;height:1920px;transform:scale(2);transform-origin:0 0}
.row{position:absolute;left:0;width:1080px;display:flex;align-items:center;justify-content:center}
.in{display:flex;align-items:center;justify-content:center;opacity:0;transform-origin:50% 50%}
.tx{display:block;white-space:nowrap;text-align:center;line-height:1;-webkit-text-stroke:0;text-shadow:0 6px 0 rgba(0,0,0,.55)}
.stamp{letter-spacing:.02em}
.ch{display:inline-block;transform-origin:50% 80%}
.tx{letter-spacing:-.01em}
.btn{width:520px;height:130px;border-radius:65px;background:#ff2a5a;display:flex;align-items:center;justify-content:center}
.chunk{position:absolute;left:0;top:-40px;width:1080px;height:80px;display:flex;align-items:center;justify-content:center;gap:44px;opacity:0;transform-origin:50% 50%}
.w{position:relative;display:inline-block;font-size:56px;font-weight:900;line-height:1;white-space:nowrap}
.w .b,.w .h{display:block;-webkit-text-stroke:10px #000;paint-order:stroke fill;text-shadow:0 7px 0 rgba(0,0,0,.55)}
.w .b{color:#fff}
.w .h{position:absolute;left:0;top:0;color:#ffe228;opacity:0}
'''
page=f'''<!doctype html>
<html lang="es" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=2160, height=3840" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{css}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.3f}" data-width="2160" data-height="3840">
<div id="fx" class="clip" data-start="0" data-duration="{TOTAL:.3f}" data-track-index="1">
{chr(10).join(els)}
</div>
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(js)}
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
'''
open(sys.argv[2],'w').write(page)
print('chunks',len(chunks),'bytes',len(page))
