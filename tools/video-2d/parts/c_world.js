// ===================== palettes =====================
const PAL={
 day:{skyT:'#4fb2f4',skyM:'#9bdcff',skyB:'#fff1c9',sun:'#fff6cf',h1:'#8fd3b0',h2:'#63bb86',h3:'#3f9f63',tree:'#35a85a',treeD:'#1f7d41',treeL:'#7fe08a',g1:'#9bdc62',g2:'#62b843',gr:'#4db03e',grD:'#2f8a35',grL:'#9be660',cloud:'#ffffff'},
 dry:{skyT:'#86aec6',skyM:'#c9d8d6',skyB:'#f4e4bc',sun:'#fff0c8',h1:'#c3c39b',h2:'#aaa778',h3:'#8f8d58',tree:'#a2a24d',treeD:'#72763a',treeL:'#c9c46a',g1:'#cfc274',g2:'#aea35a',gr:'#a99b4a',grD:'#776c33',grL:'#d1c26a',cloud:'#eef0ea'},
 dusk:{skyT:'#2f2a66',skyM:'#bb4f7e',skyB:'#ffb468',sun:'#ffdca8',h1:'#7a5388',h2:'#573a70',h3:'#3a2852',tree:'#46405e',treeD:'#2a2540',treeL:'#6a5a78',g1:'#80695a',g2:'#5e4a42',gr:'#76604a',grD:'#403226',grL:'#a08560',cloud:'#f2a8a0'},
 wheat:{skyT:'#5fb0ee',skyM:'#b9e1f5',skyB:'#ffe1a6',sun:'#fff3c4',h1:'#d9c27a',h2:'#c4a85c',h3:'#a98c44',tree:'#8f9a48',treeD:'#6f7a34',treeL:'#c0c060',g1:'#e0b84e',g2:'#c99a38',gr:'#e8bd4a',grD:'#b8862c',grL:'#ffe07a',cloud:'#fffaf0'}
};
const PW=W+500; // layer canvases are wider than the screen to allow parallax panning
function mk(h=H){return offscreen(PW,h);}
function skyLayer(p){const c=mk(),g=c.getContext('2d');
  g.fillStyle=lin(g,0,0,0,1000,[[0,p.skyT],[.55,p.skyM],[1,p.skyB]]);g.fillRect(0,0,PW,H);
  // sun glow
  g.fillStyle=rad(g,PW*.68,360,0,620,[[0,p.sun,.95],[.18,p.sun,.5],[1,p.sun,0]]);g.fillRect(0,0,PW,H);
  g.fillStyle=rad(g,PW*.68,360,0,70,[[0,'#ffffff',1],[1,'#fff6cf',0]]);g.fillRect(0,0,PW,H);
  return c;}
function ridge(g,y0,amp,seed,color,top,bot,freq=.0035,haze=0){
  g.beginPath();g.moveTo(0,H);for(let x=0;x<=PW;x+=8){const y=y0-amp*(.5+.5*fbm1(x*freq+seed*7.1,4));g.lineTo(x,y);}g.lineTo(PW,H);g.closePath();
  g.fillStyle=lin(g,0,y0-amp,0,y0+160,[[0,top],[1,bot]]);g.fill();
  if(haze>0){g.fillStyle=lin(g,0,y0-amp,0,y0+60,[[0,'#ffffff',haze],[1,'#ffffff',0]]);g.fill();}}
function treeBlob(g,cx,cy,R,p,seed){ // layered canopy with light from top-left
  const cols=[];for(let i=0;i<9;i++){const a=rng(seed*13+i)*6.28,d=rng(seed*13+i+40)*R*.62;cols.push([cx+Math.cos(a)*d,cy+Math.sin(a)*d*.7,R*(.5+.32*rng(seed*13+i+80))]);}
  cols.push([cx,cy,R*.78]);
  for(const [x,y,r] of cols){g.fillStyle=rad(g,x-r*.3,y-r*.35,r*.1,r*1.05,[[0,p.treeL],[.45,p.tree],[1,p.treeD]]);g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  for(let i=0;i<24;i++){const a=rng(seed*7+i)*6.28,d=rng(seed*7+i+20)*R*.8;g.fillStyle=rgb(col(p.treeL),.25+.25*rng(i+seed));g.beginPath();g.arc(cx-R*.12+Math.cos(a)*d*.8,cy-R*.18+Math.sin(a)*d*.55,R*(.05+.09*rng(i+seed*3)),0,7);g.fill();}}
const TREE_POS=[]; // apple positions per tree (shared by all palettes)
(function(){const xs=[120,380,640,900,1160,1400,1620];for(let i=0;i<xs.length;i++){const R=118+36*rng(i*3+1),x=xs[i]+rng(i)*40,y=1002-R*.55-rng(i+9)*20;TREE_POS.push({x,y,R,apples:[]});
  for(let a=0;a<13;a++){const an=rng(i*50+a)*6.28,d=Math.sqrt(rng(i*50+a+17))*R*.82;TREE_POS[i].apples.push({x:x+Math.cos(an)*d,y:y+Math.sin(an)*d*.62+R*.06,tv:0});}}})();
function orchardLayer(p){const c=mk(),g=c.getContext('2d');
  for(const T of TREE_POS){const tw=T.R*.12;g.fillStyle=lin(g,T.x-tw,0,T.x+tw,0,[[0,'#8a5a36'],[1,'#4a2e1c']]);g.beginPath();g.moveTo(T.x-tw*1.2,1010);g.quadraticCurveTo(T.x-tw*.6,T.y+T.R*.3,T.x-tw*.5,T.y+T.R*.5);g.lineTo(T.x+tw*.5,T.y+T.R*.5);g.quadraticCurveTo(T.x+tw*.6,T.y+T.R*.3,T.x+tw*1.2,1010);g.closePath();g.fill();
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(T.x,1012,T.R*.8,14,0,0,7);g.fill();
    treeBlob(g,T.x,T.y,T.R,p,T.x|0);}
  return c;}
function groundLayer(p){const c=mk(),g=c.getContext('2d');
  g.fillStyle=lin(g,0,990,0,H,[[0,p.g1],[.35,p.g2],[1,shade(col(p.g2),-.25)]]);g.fillRect(0,990,PW,H-990);
  // mowed perspective stripes
  const vx=PW/2;for(let i=-14;i<=14;i++){const x0=vx+i*86,x1=vx+i*430;g.fillStyle=(i&1)?'rgba(255,255,255,.055)':'rgba(0,0,0,.05)';g.beginPath();g.moveTo(x0,990);g.lineTo(x0+86,990);g.lineTo(x1+430,H);g.lineTo(x1,H);g.closePath();g.fill();}
  // horizon haze + soft noise dabs
  g.fillStyle=lin(g,0,990,0,1090,[[0,'#ffffff',.28],[1,'#ffffff',0]]);g.fillRect(0,990,PW,100);
  for(let i=0;i<900;i++){const x=rng(i)*PW,y=990+Math.pow(rng(i+50),1.6)*(H-990),r=2+rng(i+90)*7*(.4+(y-990)/930);g.fillStyle=rgb(col(rng(i+9)<.5?p.grL:p.grD),.10+.1*rng(i+7));g.beginPath();g.ellipse(x,y,r*2.2,r*.8,0,0,7);g.fill();}
  return c;}
function hivesLayer(p){const c=mk(1200),g=c.getContext('2d');
  const cols=['#f4c542','#e86a4a','#4fb3d9'];
  [[540,1050,.8],[760,1062,.9],[1380,1055,.85]].forEach(([x,y,s],k)=>{g.save();g.translate(x,y);g.scale(s,s);
   g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,6,70,12,0,0,7);g.fill();
   for(const dx of [-30,30]){g.fillStyle='#5a3a22';g.fillRect(dx-5,-8,10,16);}
   for(let r=0;r<3;r++){g.fillStyle=lin(g,0,-70+r*0,0,-70+0,[[0,cols[k]],[1,shade(col(cols[k]),-.2)]]);const yy=-30-r*26;g.fillStyle=lin(g,-52,yy,52,yy,[[0,shade(col(cols[k]),.18)],[1,shade(col(cols[k]),-.22)]]);rrect(g,-52,yy,104,26,5);g.fill();g.fillStyle='rgba(0,0,0,.22)';g.fillRect(-52,yy+22,104,4);}
   g.fillStyle=lin(g,-60,0,60,0,[[0,'#8a5a36'],[1,'#5a3a22']]);rrect(g,-60,-122,120,16,5);g.fill();
   g.fillStyle='#2a1a10';rrect(g,-14,-22,28,8,3);g.fill();
   g.restore();});
  // fence
  g.fillStyle='#8a6a44';for(let x=-100;x<PW;x+=70){g.fillStyle=lin(g,x,0,x+14,0,[[0,'#a88050'],[1,'#6e4e2c']]);g.fillRect(x,1030,14,70);}
  g.fillStyle='#8f6c44';g.fillRect(-100,1048,PW+200,8);g.fillRect(-100,1072,PW+200,8);
  return c;}
const LAYERS={};
for(const k of ['day','dry','dusk','wheat']){const p=PAL[k];LAYERS[k]={sky:skyLayer(p),far:(()=>{const c=mk(),g=c.getContext('2d');ridge(g,930,95,1,p.h1,p.h1,shade(col(p.h1),-.05),.0025,.25);return c;})(),
  mid:(()=>{const c=mk(),g=c.getContext('2d');ridge(g,985,70,2,p.h2,shade(col(p.h2),.08),p.h2,.004,.12);return c;})(),orchard:orchardLayer(p),ground:groundLayer(p)};}
const HIVES=hivesLayer(PAL.day);
// ===================== sprites =====================
function cloudSprite(seed,p){const c=offscreen(520,240),g=c.getContext('2d');const base=col(p.cloud);
  for(let i=0;i<9;i++){const x=90+rng(seed*9+i)*340,y=130-Math.sin(rng(seed*9+i+3)*3)*40,r=46+rng(seed*9+i+6)*50;g.fillStyle=rad(g,x-r*.2,y-r*.3,r*.1,r,[[0,shade(base,.1)],[.7,base],[1,shade(base,-.12)]]);g.beginPath();g.arc(x,y,r,0,7);g.fill();}
  g.globalCompositeOperation='destination-out';g.fillStyle='#000';g.fillRect(0,196,520,60);g.globalCompositeOperation='source-over';return c;}
const CLOUDS={day:[0,1,2,3].map(i=>cloudSprite(i,PAL.day)),dusk:[0,1,2,3].map(i=>cloudSprite(i,PAL.dusk)),wheat:[0,1,2,3].map(i=>cloudSprite(i,PAL.wheat))};
function flowerSprite(type,dry){const c=offscreen(96,96),g=c.getContext('2d');g.translate(48,48);
  const T=[{p:'#fffdf5',c:'#f7b500',n:12,r:30,l:.52},{p:'#ffd43b',c:'#b8700f',n:14,r:28,l:.5},{p:'#e8412f',c:'#2b1a14',n:6,r:30,l:.8},{p:'#7aa2ff',c:'#f5d76e',n:10,r:28,l:.55},{p:'#ff8fb8',c:'#ffe08a',n:9,r:28,l:.6}][type];
  const pc=dry?mixc(col(T.p),[120,88,50],.8):col(T.p);
  for(let i=0;i<T.n;i++){g.save();g.rotate(i/T.n*Math.PI*2+type);g.fillStyle=lin(g,0,-6,0,-T.r,[[0,shade(pc,-.18)],[1,shade(pc,.12)]]);g.beginPath();g.ellipse(0,-T.r*.62,T.r*.2*(T.l*2),T.r*.46,0,0,7);g.fill();g.restore();}
  g.fillStyle=rad(g,-3,-3,1,12,[[0,dry?'#9a7a40':shade(col(T.c),.25)],[1,dry?'#5a4020':shade(col(T.c),-.2)]]);g.beginPath();g.arc(0,0,11,0,7);g.fill();return c;}
const FSP=[0,1,2,3,4].map(t=>[flowerSprite(t,false),flowerSprite(t,true)]);
function tuftSprite(seed,p,blur){const c=offscreen(200,240),g=c.getContext('2d');if(blur)g.filter=`blur(${blur}px)`;g.translate(100,236);
  const n=9+Math.floor(rng(seed)*5);for(let i=0;i<n;i++){const a=(i/(n-1)-.5)*1.5+(rng(seed*5+i)-.5)*.3,h=120+rng(seed*9+i)*100,w=7+rng(seed*3+i)*6;
   const tx=Math.sin(a)*h*.8,ty=-Math.cos(a)*h,cx=Math.sin(a)*h*.18+(rng(i+seed)-.5)*14,cy=-h*.55;
   g.fillStyle=lin(g,0,0,0,-h,[[0,p.grD],[.6,p.gr],[1,p.grL]]);g.beginPath();g.moveTo(-w,0);g.quadraticCurveTo(cx-w*.5,cy,tx,ty);g.quadraticCurveTo(cx+w*.5,cy,w,0);g.closePath();g.fill();}
  return c;}
const TUFT={day:[...Array(7)].map((_,i)=>tuftSprite(i,PAL.day,0)),dry:[...Array(7)].map((_,i)=>tuftSprite(i,PAL.dry,0)),dusk:[...Array(7)].map((_,i)=>tuftSprite(i,PAL.dusk,0)),wheat:[...Array(7)].map((_,i)=>tuftSprite(i,PAL.wheat,0))};
const TUFTB={day:[...Array(4)].map((_,i)=>tuftSprite(i+9,PAL.day,5)),dry:[...Array(4)].map((_,i)=>tuftSprite(i+9,PAL.dry,5)),dusk:[...Array(4)].map((_,i)=>tuftSprite(i+9,PAL.dusk,5))};
const DOT=(function(){const c=offscreen(64,64),g=c.getContext('2d');g.fillStyle=rad(g,32,32,0,32,[[0,'#fff',1],[.35,'#fff',.55],[1,'#fff',0]]);g.fillRect(0,0,64,64);return c;})();
const STAR=(function(){const c=offscreen(96,96),g=c.getContext('2d');g.translate(48,48);g.fillStyle=rad(g,0,0,0,48,[[0,'#fff',1],[.25,'#fff6c0',.7],[1,'#ffd36a',0]]);g.beginPath();g.arc(0,0,48,0,7);g.fill();g.fillStyle='#fffbe0';g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?7:44;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();return c;})();
const BEEBODY=(function(){const c=offscreen(72,56),g=c.getContext('2d');g.translate(34,30);
  // abdomen
  g.fillStyle=lin(g,0,-14,0,14,[[0,'#ffd94a'],[1,'#e8a317']]);g.beginPath();g.ellipse(-8,0,19,12.5,0,0,7);g.fill();g.save();g.beginPath();g.ellipse(-8,0,19,12.5,0,0,7);g.clip();g.fillStyle='#2b1d12';for(const x of [-16,-6,4]){g.fillRect(x,-14,5,28);}g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-10,-6,12,3.4,-.1,0,7);g.fill();g.restore();
  // stinger + thorax + head
  g.fillStyle='#2b1d12';g.beginPath();g.moveTo(-26,0);g.lineTo(-33,1.5);g.lineTo(-26,3.5);g.fill();
  g.fillStyle=lin(g,0,-10,0,10,[[0,'#a8782a'],[1,'#6a4a1a']]);g.beginPath();g.ellipse(14,0,12,11,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.ellipse(12,-5,7,3,0,0,7);g.fill();
  g.fillStyle='#2b1d12';g.beginPath();g.ellipse(26,-1,8,8,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(28,-3,2.6,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.arc(28.6,-3,1.3,0,7);g.fill();
  g.strokeStyle='#2b1d12';g.lineWidth=1.4;g.beginPath();g.moveTo(31,-8);g.quadraticCurveTo(38,-16,41,-14);g.stroke();
  return c;})();
function drawBee(g,x,y,s,ang,flap,flip){g.save();g.translate(x,y);g.rotate(ang);g.scale(flip?-s:s,s);
  // wings
  g.fillStyle='rgba(235,245,255,.62)';g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1;
  for(const k of [-1,1]){g.save();g.translate(10,-8);g.rotate(-.5+flap*k*.55);g.beginPath();g.ellipse(-6,-12*Math.abs(.45+.55*Math.abs(flap)),8,18*(.45+.55*Math.abs(flap)),-.3,0,7);g.fill();g.stroke();g.restore();}
  g.drawImage(BEEBODY,-34,-30);g.restore();}
// ===================== honeycomb transition =====================
const HEX_R=118,HEXC=(function(){const a=[];const w=Math.sqrt(3)*HEX_R,h=HEX_R*1.5;for(let r=-1;r<Math.ceil(H/h)+2;r++)for(let c=-1;c<Math.ceil(W/w)+2;c++)a.push({x:c*w+(r&1?w/2:0),y:r*h});return a;})();
function drawHoneycomb(g,k,cx,cy){ // k: 0 uncovered .. 1 covered
  if(k<=0)return;g.save();
  for(const hx of HEXC){const d=Math.hypot(hx.x-cx,hx.y-cy)/1500;const kk=clamp((k*1.5-d)/.5);if(kk<=0)continue;const r=HEX_R*1.04*eo(kk);
    g.beginPath();for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;const x=hx.x+Math.cos(a)*r,y=hx.y+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();
    g.fillStyle=lin(g,hx.x,hx.y-r,hx.x,hx.y+r,[[0,'#ffd34a'],[1,'#f09a12']]);g.fill();g.strokeStyle='#b86a08';g.lineWidth=5;g.stroke();
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(hx.x-r*.2,hx.y-r*.45,r*.4,r*.12,-.3,0,7);g.fill();}
  g.restore();}
