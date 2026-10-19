import json,html,sys
S=sys.argv[1]
TL=json.load(open(f'{S}/w_burial/timeline.json'));ST=TL['starts'];TOTAL=TL['total'];SEGS=TL['segs']
def wt(seg,key):
    for w in SEGS[seg]['words']:
        if key in w[0].lower(): return ST[seg]+w[1]
    return ST[seg]+.5
ND=len(ST);END=ST[1:]+[TOTAL]
els=[];js=[];TITLES=set()
def esc(s): return html.escape(s,quote=False)
def row(id_,y,h=160,cls=''): return f'<div class="row {cls}" id="{id_}" style="top:{y}px;height:{h}px;margin-top:-{h//2}px"><div class="in" id="{id_}_i">'
def text_el(id_,y,txt,size,color,weight=900,stroke=0,h=None,extra=''):
    h=h or int(size*1.5)
    inner=''.join(f'<span class="ch">{esc(c) if c!=" " else "&nbsp;"}</span>' for c in txt) if size>=72 else esc(txt)
    if size>=72: TITLES.add(id_)
    els.append(row(id_,y,h)+f'<span class="tx" style="font-size:{size}px;color:{color};font-weight:{weight};{extra}">{inner}</span></div></div>')
def pop(id_,t,dur=.45,ease='back.out(1.7)',s0=.2):
    if id_ in TITLES:
        js.append(f"tl.fromTo('#{id_}_i',{{opacity:0}},{{opacity:1,duration:.05}},{t:.3f});")
        js.append(f"tl.fromTo('#{id_}_i .ch',{{opacity:0,y:70,rotationX:-80,filter:'blur(10px)'}},{{opacity:1,y:0,rotationX:0,filter:'blur(0px)',duration:.6,ease:'expo.out',stagger:.03}},{t:.3f});")
        return
    js.append(f"tl.fromTo('#{id_}_i',{{opacity:0,scale:{s0},y:40,filter:'blur(16px)'}},{{opacity:1,scale:1,y:0,filter:'blur(0px)',duration:{dur+.15},ease:'expo.out'}},{t:.3f});")
def fade(id_,t,dur=.4):
    js.append(f"tl.fromTo('#{id_}_i',{{opacity:0}},{{opacity:1,duration:{dur},ease:'power1.out'}},{t:.3f});")
def hide(id_,t,dur=.15): js.append(f"tl.to('#{id_}_i',{{opacity:0,duration:{dur}}},{t:.3f});")
def stamp(id_,y,txt,color,size,rot,t,t_hide):
    els.append(row(id_,y,int(size*1.6))+f'<span class="tx stamp" style="font-size:{size}px;color:{color};text-shadow:0 0 34px {color},0 0 10px {color}">{esc(txt)}</span></div></div>')
    js.append(f"gsap.set('#{id_}_i',{{rotation:{rot},opacity:0}});")
    js.append(f"tl.fromTo('#{id_}_i',{{opacity:0,scale:.5,filter:'blur(18px)'}},{{opacity:1,scale:1,filter:'blur(0px)',duration:.42,ease:'back.out(2.2)'}},{t:.3f});")
    hide(id_,t_hide)

# ---- chip + progress
from PIL import ImageFont
FB=ImageFont.truetype('bees/assets/fonts/Outfit-900.ttf',72)
els.append('<div id="prog_bg"></div><div id="prog"></div>')
js.append(f"tl.fromTo('#prog',{{scaleX:0}},{{scaleX:1,duration:{TOTAL:.3f},ease:'none'}},0);")
text_el('chip',196,'ENTERRADO VIVO',40,'#ffe29a',800,extra='text-shadow:0 3px 0 rgba(0,0,0,.5);')
fade('chip',.1)
pan0=wt(0,'pánico');horas=wt(1,'horas');panic=wt(2,'pánico');dio=wt(3,'dióxido');mareo=wt(3,'mareo');dos=wt(4,'dos');peso=wt(4,'peso')
s19=wt(5,'diecinueve');camp=wt(5,'campanas');hoy=wt(6,'hoy');pero=wt(6,'pero');hou=wt(6,'houdini');sale=wt(6,'sale');tierra=wt(7,'tierra');golpe=wt(7,'golpe');sig=wt(7,'sígueme')
E_=lambda i:ST[i]-.30
text_el('t0a',290,'¿QUÉ PASA SI',84,'#fff');text_el('t0b',385,'TE ENTIERRAN',100,'#ffd23f');text_el('t0c',475,'VIVO?',110,'#ff7a3c')
pop('t0a',.05);pop('t0b',.20);pop('t0c',.35)
for i in 'abc': hide('t0'+i,E_(1))
stamp('s0',1500,'TU PEOR ENEMIGO: EL PÁNICO','#ff7a8a',52,-3,pan0,E_(1))
text_el('s1a',340,'¿CUÁNTO AIRE?',110,'#9fe0ff',extra='text-shadow:0 8px 0 rgba(0,0,0,.55);');pop('s1a',ST[1]+.1,.5);hide('s1a',E_(2))
stamp('s1b',1500,'UNAS POCAS HORAS','#ffd166',64,-3,horas-.3,E_(2))
stamp('s2a',350,'PÁNICO','#ff4a5e',160,-3,panic,E_(3))
stamp('s2b',1500,'MÁS RÁPIDO SE ACABA','#ffb347',58,3,wt(2,'rápido'),E_(3))
stamp('s3a',350,'CO₂','#d8e3a8',160,-3,dio,E_(4))
stamp('s3b',1500,'MAREO · CONFUSIÓN · DESMAYO','#ff9bb8',44,3,mareo,E_(4))
stamp('s4a',340,'CASI 2 METROS','#ffd9a8',104,-3,dos-.2,E_(5))
stamp('s4b',1500,'TODO ESE PESO','#ff4a5e',80,3,peso-.2,E_(5))
stamp('s5a',340,'SIGLO XIX','#ffd9a8',130,-3,s19,E_(6))
stamp('s5b',1500,'ATAÚDES CON CAMPANAS','#ffe08a',56,3,camp,E_(6))
stamp('s6a',340,'HOY: CASI IMPOSIBLE','#46f0a0',92,-3,hoy,pero-.2)
stamp('s6b',340,'HOUDINI · 1915','#ffe228',100,3,hou-.2,E_(7))
stamp('s6c',1500,'CASI NO SALE','#ff4a5e',84,-3,sale-.1,E_(7))
u=ST[7]
text_el('c7a',325,'PARTE 4',180,'#ffe228',extra='text-shadow:0 8px 0 rgba(0,0,0,.55);');pop('c7a',u,.5)
text_el('c7b',440,'¿Y SI LA TIERRA',58,'#fff');fade('c7b',u+.6)
text_el('c7c',520,'DEJA DE GIRAR?',84,'#ff7a3c');pop('c7c',golpe-.9,.5)
els.append('<div class="row" id="btn" style="top:1470px;height:130px;margin-top:-65px"><div class="in" id="btn_i"><div class="btn"><span class="tx" style="font-size:60px;color:#fff;font-weight:900">SÍGUEME ▶</span></div></div></div>')
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
FNT=ImageFont.truetype('bees/assets/fonts/Outfit-900.ttf',88)
sub=[]
for ci,c in enumerate(chunks):
    a=c['s0']+c['ws'][0][1];nx=chunks[ci+1] if ci+1<len(chunks) else None
    b=(nx['s0']+nx['ws'][0][1]) if nx and nx['si']==c['si'] else c['s0']+c['ws'][-1][2]+.25
    ww=[FNT.getlength(w[0].upper()) for w in c['ws']];tot=sum(ww)+44*(len(ww)-1);scl=min(1.0,900/tot)
    words=''.join(f'<span class="w" data-layout-allow-overlap><span class="b">{esc(w[0].upper())}</span><span class="h" id="h{ci}_{wi}">{esc(w[0].upper())}</span></span>' for wi,w in enumerate(c['ws']))
    sub.append(f'<div class="chunk" id="ck{ci}">{words}</div>')
    js.append(f"tl.fromTo('#ck{ci}',{{opacity:0,scale:{.9*scl:.3f},y:26,filter:'blur(10px)'}},{{opacity:1,scale:{scl:.3f},y:0,filter:'blur(0px)',duration:.26,ease:'expo.out'}},{max(0,a-.02):.3f});")
    js.append(f"tl.set('#ck{ci}',{{opacity:0}},{b-.03:.3f});")
    for wi,w in enumerate(c['ws']):
        ws_=c['s0']+w[1]-.02;we=c['s0']+w[2]+.05
        js.append(f"tl.set('#h{ci}_{wi}',{{opacity:1}},{max(0,ws_):.3f});")
        js.append(f"tl.fromTo('#h{ci}_{wi}',{{scale:1.2}},{{scale:1,duration:.2,ease:'back.out(3)'}},{max(0,ws_):.3f});")
        if wi<len(c['ws'])-1: js.append(f"tl.set('#h{ci}_{wi}',{{opacity:0}},{we:.3f});")
els.append('<div id="subs" style="position:absolute;left:0;top:1730px;width:1080px;height:0">'+''.join(sub)+'</div>')

css='''
@font-face{font-family:'Outfit';font-weight:800;src:url(assets/fonts/outfit-latin-800-normal.woff2) format('woff2')}
@font-face{font-family:'Outfit';font-weight:900;src:url(assets/fonts/outfit-latin-900-normal.woff2) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#000}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:'Outfit','Helvetica Neue',Arial,sans-serif}
#bg{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}
#fx{position:absolute;left:0;top:0;width:1080px;height:1920px}
.row{position:absolute;left:0;width:1080px;display:flex;align-items:center;justify-content:center}
.in{display:flex;align-items:center;justify-content:center;opacity:0;transform-origin:50% 50%}
.tx{display:block;white-space:nowrap;text-align:center;line-height:1;-webkit-text-stroke:0;text-shadow:0 6px 0 rgba(0,0,0,.55)}
.stamp{letter-spacing:.02em}
.ch{display:inline-block;transform-origin:50% 80%}
.tx{letter-spacing:-.01em}
#prog_bg{position:absolute;left:60px;top:112px;width:960px;height:10px;border-radius:5px;background:rgba(255,255,255,.2)}
#prog{position:absolute;left:60px;top:112px;width:960px;height:10px;border-radius:5px;background:#ff9a2e;transform-origin:0 50%;transform:scaleX(0)}
.btn{width:520px;height:130px;border-radius:65px;background:#ff2a5a;display:flex;align-items:center;justify-content:center}
.chunk{position:absolute;left:0;top:-60px;width:1080px;height:120px;display:flex;align-items:center;justify-content:center;gap:44px;opacity:0;transform-origin:50% 50%}
.w{position:relative;display:inline-block;font-size:88px;font-weight:900;line-height:1;white-space:nowrap}
.w .b,.w .h{display:block;-webkit-text-stroke:20px #000;paint-order:stroke fill;text-shadow:0 7px 0 rgba(0,0,0,.55)}
.w .b{color:#fff}
.w .h{position:absolute;left:0;top:0;color:#ffe228;opacity:0}
'''
page=f'''<!doctype html>
<html lang="es" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{css}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.3f}" data-width="1080" data-height="1920">
<video id="bg" class="clip" data-start="0" data-duration="{TOTAL:.3f}" data-track-index="0" src="assets/scene3d.mp4" muted playsinline></video>
<audio id="mix" data-start="0" data-duration="{TOTAL:.3f}" data-track-index="9" src="assets/mix.wav" data-volume="1"></audio>
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
