import json,html,sys
S=sys.argv[1]
TL=json.load(open(f'{S}/w_bees/timeline.json'));ST=TL['starts'];TOTAL=TL['total'];SEGS=TL['segs']
def wt(seg,key):
    for w in SEGS[seg]['words']:
        if key in w[0].lower(): return ST[seg]+w[1]
    return ST[seg]+.5
ND=len(ST);END=ST[1:]+[TOTAL]
els=[];js=[]
def esc(s): return html.escape(s,quote=False)
def row(id_,y,h=160,cls=''): return f'<div class="row {cls}" id="{id_}" style="top:{y}px;height:{h}px;margin-top:-{h//2}px"><div class="in" id="{id_}_i">'
def text_el(id_,y,txt,size,color,weight=900,stroke=0,h=None,extra=''):
    h=h or int(size*1.5)
    els.append(row(id_,y,h)+f'<span class="tx" style="font-size:{size}px;color:{color};font-weight:{weight};{extra}">{esc(txt)}</span></div></div>')
def pop(id_,t,dur=.45,ease='back.out(1.7)',s0=.2):
    js.append(f"tl.fromTo('#{id_}_i',{{opacity:0,scale:{s0}}},{{opacity:1,scale:1,duration:{dur},ease:'{ease}'}},{t:.3f});")
def fade(id_,t,dur=.4):
    js.append(f"tl.fromTo('#{id_}_i',{{opacity:0}},{{opacity:1,duration:{dur},ease:'power1.out'}},{t:.3f});")
def hide(id_,t,dur=.15): js.append(f"tl.to('#{id_}_i',{{opacity:0,duration:{dur}}},{t:.3f});")
def stamp(id_,y,txt,color,size,rot,t,t_hide):
    els.append(row(id_,y,int(size*1.6))+f'<span class="tx stamp" style="font-size:{size}px;color:{color};text-shadow:0 0 34px {color},0 0 10px {color}">{esc(txt)}</span></div></div>')
    js.append(f"gsap.set('#{id_}_i',{{rotation:{rot},opacity:0}});")
    js.append(f"tl.fromTo('#{id_}_i',{{opacity:0,scale:.4}},{{opacity:1,scale:1,duration:.28,ease:'back.out(2.6)'}},{t:.3f});")
    hide(id_,t_hide)

# ---- chip + progress
from PIL import ImageFont
FB=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Black.otf',72)
els.append('<div id="prog_bg"></div><div id="prog"></div>')
js.append(f"tl.fromTo('#prog',{{scaleX:0}},{{scaleX:1,duration:{TOTAL:.3f},ease:'none'}},0);")
text_el('chip',196,'LAS ABEJAS',40,'#ffe29a',800,extra='text-shadow:0 3px 0 rgba(0,0,0,.5);')
fade('chip',.1)
vac=wt(0,'vacía');wA=wt(2,'almendras');wM=wt(2,'manzanas');wB=wt(2,'arándanos');wF=wt(3,'faltarían');wPr=wt(3,'precios')
wAlc=wt(4,'alcanzar');wMito=wt(5,'mito');wEin=wt(5,'einstein');wTri=wt(6,'trigo');wArr=wt(6,'arroz');wFru=wt(6,'fruta');wTer=wt(1,'tercio')
# S0
text_el('t0a',300,'¿QUÉ PASA SI',84,'#fff');text_el('t0b',385,'DESAPARECEN',84,'#ffd23f');text_el('t0c',480,'TODAS LAS ABEJAS?',84,'#fff')
pop('t0a',.05);pop('t0b',.20);pop('t0c',.35)
for i in 'abc': hide('t0'+i,ST[1]-.02)
stamp('s0',1215,'TU SUPERMERCADO SE VACÍA','#ff6a3c',60,-4,vac,ST[1]-.02)
# S1
text_el('st1a',400,'UN TERCIO',150,'#ffd23f',extra='text-shadow:0 8px 0 rgba(0,0,0,.55);');text_el('st1b',525,'DE LOS CULTIVOS DEL MUNDO',44,'#fff',800)
pop('st1a',wTer-.1,.5);fade('st1b',wTer+.15,.5);hide('st1a',ST[2]-.02);hide('st1b',ST[2]-.02)
# S2: three crops get crossed out as they vanish
for k,(txt,tt) in enumerate((('ALMENDRAS',wA),('MANZANAS',wM),('ARÁNDANOS',wB))):
    y=330+k*100;w=int(FB.getlength(txt))
    els.append(row(f'cr{k}',y,100)+f'<span class="tx" style="font-size:72px;color:#fff;font-weight:900">{txt}</span><div id="sk{k}" style="position:absolute;left:50%;top:50%;margin-left:{-w//2}px;width:{w}px;height:12px;margin-top:-4px;background:#ff3b3b;border-radius:6px;transform-origin:0 50%;transform:scaleX(0)"></div></div></div>')
    pop(f'cr{k}',tt-.5,.4)
    js.append(f"tl.fromTo('#sk{k}',{{scaleX:0}},{{scaleX:1,duration:.25,ease:'power2.out'}},{tt+.1:.3f});")
    hide(f'cr{k}',ST[3]-.02)
# S3
stamp('s3a',430,'PRECIOS ↑','#ff4a5e',120,-4,wPr,ST[4]-.02)
stamp('s3b',1215,'FALTAN FRUTAS Y VERDURAS','#ffb347',54,-3,wF,ST[4]-.02)
# S4
stamp('s4',430,'NO ALCANZA','#ffb347',110,-4,wAlc,ST[5]-.02)
# S5
stamp('s5',520,'MITO','#46f0a0',210,-6,wMito,ST[6]-.02)
text_el('l5',680,'FRASE ATRIBUIDA A EINSTEIN',40,'#ffd9a8',800,extra='text-shadow:0 3px 0 rgba(0,0,0,.6);');fade('l5',wEin+.1,.4);hide('l5',ST[6]-.02)
# S6
stamp('s6a',330,'TRIGO','#ffd166',110,-4,wTri,ST[7]-.02)
stamp('s6b',450,'ARROZ','#fff3b0',110,3,wArr,ST[7]-.02)
stamp('s6c',1215,'MENOS FRUTA','#ff9a2e',74,-3,wFru,ST[7]-.02)
# S7 CTA
u=ST[7]
text_el('c7a',430,'PARTE 2',190,'#ffe228',extra='text-shadow:0 8px 0 rgba(0,0,0,.55);');pop('c7a',u,.5)
text_el('c7b',640,'¿Y SI NO DUERMES',62,'#fff');fade('c7b',u+.6)
text_el('c7c',725,'11 DÍAS?',100,'#ff9a2e');fade('c7c',u+.8)
els.append('<div class="row" id="btn" style="top:1205px;height:130px;margin-top:-65px"><div class="in" id="btn_i"><div class="btn"><span class="tx" style="font-size:60px;color:#fff;font-weight:900">SÍGUEME ▶</span></div></div></div>')
js.append("gsap.set('#btn_i',{opacity:0});")
js.append(f"tl.fromTo('#btn_i',{{opacity:0,scale:.6}},{{opacity:1,scale:1,duration:.3,ease:'back.out(2)'}},{u+2.2:.3f});")
tp=u+2.55
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
FNT=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Black.otf',88)
sub=[]
for ci,c in enumerate(chunks):
    a=c['s0']+c['ws'][0][1];nx=chunks[ci+1] if ci+1<len(chunks) else None
    b=(nx['s0']+nx['ws'][0][1]) if nx and nx['si']==c['si'] else c['s0']+c['ws'][-1][2]+.25
    ww=[FNT.getlength(w[0].upper()) for w in c['ws']];tot=sum(ww)+44*(len(ww)-1);scl=min(1.0,900/tot)
    words=''.join(f'<span class="w" data-layout-allow-overlap><span class="b">{esc(w[0].upper())}</span><span class="h" id="h{ci}_{wi}">{esc(w[0].upper())}</span></span>' for wi,w in enumerate(c['ws']))
    sub.append(f'<div class="chunk" id="ck{ci}">{words}</div>')
    js.append(f"tl.fromTo('#ck{ci}',{{opacity:0,scale:{.88*scl:.3f}}},{{opacity:1,scale:{scl:.3f},duration:.16,ease:'back.out(2)'}},{max(0,a-.02):.3f});")
    js.append(f"tl.set('#ck{ci}',{{opacity:0}},{b-.03:.3f});")
    for wi,w in enumerate(c['ws']):
        ws_=c['s0']+w[1]-.02;we=c['s0']+w[2]+.05
        js.append(f"tl.set('#h{ci}_{wi}',{{opacity:1}},{max(0,ws_):.3f});")
        if wi<len(c['ws'])-1: js.append(f"tl.set('#h{ci}_{wi}',{{opacity:0}},{we:.3f});")
els.append('<div id="subs" style="position:absolute;left:0;top:1330px;width:1080px;height:0">'+''.join(sub)+'</div>')

css='''
*{margin:0;padding:0;box-sizing:border-box}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#000}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:Inter,'Helvetica Neue',Arial,sans-serif}
#bg{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}
#fx{position:absolute;left:0;top:0;width:1080px;height:1920px}
.row{position:absolute;left:0;width:1080px;display:flex;align-items:center;justify-content:center}
.in{display:flex;align-items:center;justify-content:center;opacity:0;transform-origin:50% 50%}
.tx{display:block;white-space:nowrap;text-align:center;line-height:1;-webkit-text-stroke:0;text-shadow:0 6px 0 rgba(0,0,0,.55)}
.stamp{letter-spacing:.01em}
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
