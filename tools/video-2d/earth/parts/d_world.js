// ===================== seaside city panorama =====================
const HZ=1000;const BCOL=['#f2c6a0','#9ad0e8','#f0e08a','#c4a8e8','#f2a0a8','#a8e0b8','#ffd1a0','#8fb8f0'];
const BLD=[],BLD2=[];
(function(){let x=-60,i=0;while(x<1160){const w=54+rng(i)*44,h=150+rng(i+9)*250;BLD.push({x,w,h,c:BCOL[Math.floor(rng(i+3)*BCOL.length)],i,ant:rng(i+7)>.6});x+=w+6+rng(i+2)*10;i++;}
 x=-30;i=100;while(x<1160){const w=40+rng(i)*40,h=90+rng(i+9)*150;BLD2.push({x,w,h,i});x+=w+4;i++;}})();
function skyBands(g,c0,c1,c2){g.fillStyle=lin(g,0,0,0,HZ+60,[[0,c0],[.62,c1],[1,c2]]);g.fillRect(-100,-100,W+200,HZ+260);}
function cloudInk(g,x,y,s,c='#ffffff',a=1){g.save();g.globalAlpha=a;g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(-90,20);g.bezierCurveTo(-110,-20,-60,-40,-34,-24);g.bezierCurveTo(-28,-64,30,-70,44,-30);g.bezierCurveTo(80,-40,110,-8,92,20);g.closePath();inkS(g,c,5);g.restore();}
function birdInk(g,x,y,s,t,ph){const fl=Math.sin(t*10+ph);g.save();g.translate(x,y);g.scale(s,s);g.strokeStyle=INK;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-22,6*fl);g.quadraticCurveTo(-10,-14*fl-6,0,0);g.quadraticCurveTo(10,-14*fl-6,22,6*fl);g.stroke();g.restore();}
function drawCity(g,t,o){ // o:{shear,tx,raze,tint,lit,haze,fly}
  const sh0=o.shear||0,tx=o.tx||0,rz=o.raze||0;
  for(const b of BLD2){const hh=b.h*(1-rz*.85),x=b.x+tx*.6,sh=sh0*.6*(hh/200);g.beginPath();g.moveTo(x,HZ);g.lineTo(x+b.w,HZ);g.lineTo(x+b.w+sh,HZ-hh);g.lineTo(x+sh,HZ-hh);g.closePath();g.fillStyle=o.haze||'#9a8fc4';g.fill();}
  for(const b of BLD){const frag=rng(b.i+31),k=clamp((rz*1.4-frag*.5)),hh=b.h*(1-k*.8),x=b.x+tx+(o.fly?(o.fly*(.4+frag)*(b.h/260)):0),sh=sh0*(hh/260),y=HZ+(o.sink||0)*frag;
    g.save();g.translate(0,y-HZ);
    g.beginPath();g.moveTo(x,HZ);g.lineTo(x+b.w,HZ);g.lineTo(x+b.w+sh,HZ-hh);g.lineTo(x+sh,HZ-hh);g.closePath();inkS(g,lin(g,x,0,x+b.w,0,[[0,shade(col(b.c),.12)],[1,shade(col(b.c),-.12)]]),6);
    g.save();g.clip();g.fillStyle=o.lit?`rgba(255,226,140,.95)`:'rgba(40,50,90,.55)';for(let r=0;r<Math.floor(hh/34);r++)for(let c=0;c<Math.floor(b.w/22);c++){if(rng(b.i*13+r*5+c)<.25)continue;const wx=x+8+c*22+sh*((HZ-(HZ-8-r*34))/hh),wy=HZ-26-r*34;g.fillRect(wx,wy,11,15);}
    if(o.tint){g.fillStyle=o.tint;g.fillRect(x-40,HZ-hh-40,b.w+120,hh+60);}
    g.restore();
    if(b.ant&&k<.2){g.strokeStyle=INK;g.lineWidth=5;g.beginPath();g.moveTo(x+b.w/2+sh,HZ-hh);g.lineTo(x+b.w/2+sh+sh*.1,HZ-hh-38);g.stroke();}
    g.restore();}
}
function palmInk(g,x,base,h,t,lean=0,s=1){g.save();g.translate(x,base);g.rotate(lean);g.scale(s,s);const sw=Math.sin(t*1.4+x)*.03;g.strokeStyle=INK;g.lineCap='round';g.lineWidth=22;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(26,-h*.5,10+sw*80,-h);g.stroke();g.lineWidth=12;g.strokeStyle='#b8864a';g.stroke();
  for(let i=0;i<7;i++){const a=-2.6+i*.55+sw;g.save();g.translate(10+sw*80,-h);g.rotate(a);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(70,-40,150,10);g.quadraticCurveTo(70,-12,0,0);inkS(g,i%2?'#2fa86a':'#1e8a52',5);g.restore();}g.restore();}
function seaBand(g,t,y0,y1,c0,c1,lvl=0){g.fillStyle=lin(g,0,y0,0,y1,[[0,c0],[1,c1]]);g.fillRect(-100,y0,W+200,y1-y0);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=4;g.lineCap='round';for(let r=0;r<6;r++){for(let i=0;i<9;i++){const x=((i*140+r*70+t*30*(1+r*.2))%1300)-120,y=y0+14+r*((y1-y0)/6);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+26,y-8,x+52,y);g.stroke();}}}
function boatInk(g,x,y,s,rot){g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);g.beginPath();g.moveTo(-60,0);g.lineTo(60,0);g.lineTo(40,26);g.lineTo(-40,26);g.closePath();inkS(g,'#e8553a',5);g.beginPath();g.moveTo(0,-4);g.lineTo(0,-70);g.lineTo(38,-12);g.closePath();inkS(g,'#fff',5);g.restore();}
function railingFG(g,t){const y=1690;g.save();g.beginPath();g.rect(-20,y+28,W+40,H);g.fillStyle=lin(g,0,y,0,H,[[0,'#7a8aa8'],[1,'#3a4560']]);g.fill();g.strokeStyle=INK;g.lineWidth=6;g.beginPath();g.moveTo(-20,y+28);g.lineTo(W+20,y+28);g.stroke();
  for(let x=20;x<W+60;x+=120){g.beginPath();g.roundRect(x-12,y-84,24,116,8);inkS(g,'#c8d4e8',6);}
  g.beginPath();g.roundRect(-20,y-96,W+40,26,12);inkS(g,'#e6edf8',7);g.beginPath();g.roundRect(-20,y-30,W+40,16,8);inkS(g,'#c8d4e8',6);g.restore();}
// debris + speed lines
function debris(g,t,t0,dur,n,spd,dir=1,col='#7a6a58'){const a=t-t0;if(a<0||a>dur+1.5)return;g.save();for(let i=0;i<n;i++){const r=rng(i*7+t0*3),x=((r*W*1.4)+a*spd*(.5+rng(i+3)))*dir,xx=dir>0?x-200:W-(x-200),y=420+rng(i+9)*900,rot=a*(3+rng(i)*6)*dir,s=14+rng(i+5)*34;g.save();g.translate(xx,y+Math.sin(a*6+i)*18);g.rotate(rot);g.globalAlpha=Math.min(1,clamp(a/.3))*(1-clamp((a-dur)/1.5));
  const k=i%4;g.beginPath();if(k===0)g.rect(-s,-s*.25,s*2,s*.5);else if(k===1){g.moveTo(-s,s*.6);g.lineTo(0,-s*.7);g.lineTo(s,s*.6);g.closePath();}else if(k===2)g.ellipse(0,0,s*.7,s*.4,0,0,7);else g.rect(-s*.6,-s*.6,s*1.2,s*1.2);inkS(g,k%2?col:'#c4a070',4);g.restore();}g.restore();}
function speedLines(g,t,k,col='255,255,255',dir=1){if(k<=.01)return;g.save();g.strokeStyle=`rgba(${col},${.5*k})`;g.lineCap='round';for(let i=0;i<26;i++){const y=380+rng(i)*1250,len=180+rng(i+3)*420,sp=1800+rng(i+5)*1500,x=(((rng(i+7)*2400)+t*sp*dir)%2600)-400,xx=dir>0?x:W-x;g.lineWidth=3+rng(i+2)*5;g.beginPath();g.moveTo(xx,y);g.lineTo(xx-len*dir,y);g.stroke();}g.restore();}
function globeInk(g,x,y,r,rot){g.save();g.translate(x,y);g.beginPath();g.arc(0,0,r,0,7);g.save();g.clip();g.fillStyle=lin(g,-r,-r,r,r,[[0,'#4fc0ff'],[1,'#1b5ad0']]);g.fillRect(-r,-r,r*2,r*2);g.fillStyle='#4fd070';for(const [lx,ly,lr] of [[-.25,-.3,.4],[.5,.1,.32],[-.5,.4,.3],[.1,.6,.22],[.9,-.2,.3]]){const px=((lx*r*2+rot*r*.8)%(r*3.2))-r*1.1;g.beginPath();g.ellipse(px,ly*r,lr*r*.8,lr*r*.55,lx,0,7);g.fill();}
  g.fillStyle=lin(g,-r,0,r,0,[[0,'rgba(0,0,40,0)'],[.6,'rgba(0,0,40,0)'],[1,'rgba(0,0,40,.5)']]);g.fillRect(-r,-r,r*2,r*2);g.restore();g.beginPath();g.arc(0,0,r,0,7);g.lineWidth=8;g.strokeStyle=INK;g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-r*.4,-r*.5,r*.16,r*.08,-.7,0,7);g.fill();g.restore();}
function groundBand(g,t,tint,lamp=true){g.save();const y0=HZ+170;
  g.fillStyle=lin(g,0,y0,0,y0+130,[[0,'#f2dca4'],[1,'#e0c080']]);g.fillRect(-100,y0,W+200,130);g.strokeStyle=INK;g.lineWidth=6;g.beginPath();g.moveTo(-100,y0);g.lineTo(W+100,y0);g.stroke();
  g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<40;i++){g.beginPath();g.ellipse(rng(i)*W,y0+8+rng(i+3)*110,3+rng(i+5)*8,2,0,0,7);g.fill();}
  const y1=y0+130;g.fillStyle=lin(g,0,y1,0,H,[[0,'#8a82a8'],[1,'#5a5478']]);g.fillRect(-100,y1,W+200,H);g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(-100,y1);g.lineTo(W+100,y1);g.stroke();
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=4;for(let x=-600;x<1700;x+=150){g.beginPath();g.moveTo(540+(x-540)*.25,y1);g.lineTo(x,H);g.stroke();}for(let k=1;k<7;k++){const yy=y1+Math.pow(k/7,1.6)*(H-y1);g.beginPath();g.moveTo(-100,yy);g.lineTo(W+100,yy);g.stroke();}
  if(lamp)for(const x of [180,900]){g.strokeStyle=INK;g.lineWidth=16;g.beginPath();g.moveTo(x,y1+30);g.lineTo(x,y1-300);g.quadraticCurveTo(x,y1-340,x+50,y1-340);g.stroke();g.strokeStyle='#4a4f68';g.lineWidth=8;g.stroke();g.beginPath();g.ellipse(x+54,y1-332,24,12,0,0,7);inkS(g,'#fff1b0',5);}
  if(tint){g.fillStyle=tint;g.fillRect(-100,y0,W+200,H);}g.restore();}
