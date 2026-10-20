// ===================== ink-style illustration toolkit =====================
const INK='#120d22';
const FONT_D='"Outfit","Arial Black",sans-serif',FONT_S='"Playfair Display",Georgia,serif',FONT_M='"Space Mono","Courier New",monospace';
function inkS(g,fill,w=7){if(fill){g.fillStyle=fill;g.fill();}g.lineWidth=w;g.strokeStyle=INK;g.lineJoin='round';g.lineCap='round';g.stroke();}
function hatch(g,path,ang=-.8,sp=14,alpha=.22,color='#000',lw=3){g.save();path();g.clip();g.strokeStyle=color;g.globalAlpha=alpha;g.lineWidth=lw;g.translate(540,960);g.rotate(ang);
  g.beginPath();for(let x=-1700;x<1700;x+=sp){g.moveTo(x,-1700);g.lineTo(x,1700);}g.stroke();g.restore();}
function glow(g,x,y,r,color,a=1){const c=col(color);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rad(g,x,y,0,r,[[0,c,a],[.4,c,a*.35],[1,c,0]]);g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
function shadowEll(g,x,y,rx,ry,a=.35){g.save();g.fillStyle=rad(g,x,y,0,rx,[[0,'#000',a],[1,'#000',0]]);g.translate(x,y);g.scale(1,ry/rx);g.translate(-x,-y);g.beginPath();g.arc(x,y,rx,0,7);g.fill();g.restore();}
function txtInk(g,s,x,y,size,fill,opts={}){g.save();g.font=`${opts.weight||900} ${size}px ${opts.font||FONT_D}`;g.textAlign=opts.align||'center';g.textBaseline='middle';
  if(opts.rot){g.translate(x,y);g.rotate(opts.rot);x=0;y=0;}g.lineJoin='round';
  if(opts.sh){g.fillStyle='rgba(0,0,0,.45)';g.fillText(s,x+0,y+opts.sh);}
  g.lineWidth=opts.stroke||size*.14;g.strokeStyle=INK;if(opts.stroke!==0)g.strokeText(s,x,y);g.fillStyle=fill;g.fillText(s,x,y);g.restore();}
// ---- time of day ----
const SKY=[[0,'#080a2c','#2b2f78'],[.2,'#1b1b52','#7a4f9e'],[.28,'#ff9a6a','#6f78d0'],[.5,'#4fb0f0','#c4ecff'],[.72,'#ff8a5c','#9a4f9a'],[.82,'#3a2a78','#12123a'],[1,'#080a2c','#2b2f78']];
function skyAt(tod){tod=((tod%1)+1)%1;for(let i=0;i<SKY.length-1;i++){const a=SKY[i],b=SKY[i+1];if(tod>=a[0]&&tod<=b[0]){const k=(tod-a[0])/(b[0]-a[0]);return [rgb(mixc(hex(a[1]),hex(b[1]),k)),rgb(mixc(hex(a[2]),hex(b[2]),k))];}}return [SKY[0][1],SKY[0][2]];}
const nightness=tod=>{tod=((tod%1)+1)%1;return clamp(Math.max(1-ss(.16,.28,tod),ss(.74,.86,tod)));};
// ---- props ----
function drawMoon(g,x,y,r,a=1){glow(g,x,y,r*3.2,'#9fb4ff',.55*a);g.save();g.globalAlpha=a;g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=lin(g,x-r,y-r,x+r,y+r,[[0,'#ffffff'],[1,'#c6d0f4']]);g.fill();
  g.fillStyle='rgba(120,135,190,.35)';for(const [dx,dy,rr] of [[-.3,-.2,.2],[.25,.1,.28],[-.1,.4,.14],[.35,-.38,.11]]){g.beginPath();g.arc(x+dx*r,y+dy*r,rr*r,0,7);g.fill();}
  g.lineWidth=6;g.strokeStyle=INK;g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.restore();}
function drawSun(g,x,y,r,t){glow(g,x,y,r*4,'#ffd27a',.8);g.save();g.translate(x,y);g.rotate(t*.2);g.strokeStyle='#ffcf5a';g.lineWidth=8;g.lineCap='round';for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.moveTo(Math.cos(a)*r*1.3,Math.sin(a)*r*1.3);g.lineTo(Math.cos(a)*r*1.65,Math.sin(a)*r*1.65);g.stroke();}
  g.beginPath();g.arc(0,0,r,0,7);inkS(g,lin(g,0,-r,0,r,[[0,'#fff4b0'],[1,'#ffb43a']]),6);g.restore();}
function drawWallClock(g,x,y,r,hours,mins,t,a=1){g.save();g.globalAlpha=a;g.translate(x,y);
  shadowEll(g,10,r*.2,r*1.1,r*1.1,.35);
  g.beginPath();g.arc(0,0,r,0,7);inkS(g,lin(g,-r,-r,r,r,[[0,'#ffd98a'],[1,'#e0922c']]),9);
  g.beginPath();g.arc(0,0,r*.84,0,7);inkS(g,'#fff7e6',6);
  for(let i=0;i<12;i++){const an=i*Math.PI/6;g.lineWidth=i%3?4:8;g.strokeStyle=INK;g.beginPath();g.moveTo(Math.sin(an)*r*.7,-Math.cos(an)*r*.7);g.lineTo(Math.sin(an)*r*.78,-Math.cos(an)*r*.78);g.stroke();}
  const hand=(an,len,w)=>{g.save();g.rotate(an);g.beginPath();g.moveTo(-w,r*.08);g.lineTo(-w*.6,-len);g.lineTo(w*.6,-len);g.lineTo(w,r*.08);g.closePath();inkS(g,'#1b1530',4);g.restore();};
  hand((hours%12+mins/60)/12*Math.PI*2,r*.45,r*.045);hand(mins/60*Math.PI*2,r*.68,r*.032);
  g.save();g.rotate(t*Math.PI*2/ (mins>0?1:1));g.restore();
  g.beginPath();g.arc(0,0,r*.07,0,7);inkS(g,'#ff4a5a',4);g.restore();}
function drawMug(g,x,y,s,t,steam=1){g.save();g.translate(x,y);g.scale(s,s);shadowEll(g,0,50,60,10,.4);
  g.beginPath();g.moveTo(-42,-40);g.lineTo(42,-40);g.lineTo(36,44);g.quadraticCurveTo(0,54,-36,44);g.closePath();inkS(g,lin(g,-42,0,42,0,[[0,'#fff6e8'],[1,'#d8c8ae']]),7);
  g.beginPath();g.ellipse(0,-40,42,10,0,0,7);inkS(g,'#5a2f18',6);g.beginPath();g.moveTo(40,-18);g.bezierCurveTo(80,-26,80,22,38,20);g.lineWidth=14;g.strokeStyle=INK;g.stroke();g.lineWidth=6;g.strokeStyle='#fff6e8';g.stroke();
  if(steam>0){g.strokeStyle=`rgba(255,255,255,${.5*steam})`;g.lineWidth=7;g.lineCap='round';for(let i=0;i<3;i++){const ph=(t*.7+i*.33)%1;g.globalAlpha=(1-ph)*steam;g.beginPath();g.moveTo(-16+i*16,-52);g.bezierCurveTo(-26+i*16+Math.sin(t*3+i)*10,-80-ph*30,-6+i*16,-104-ph*30,-16+i*16+Math.sin(t*3+i)*12,-130-ph*40);g.stroke();}g.globalAlpha=1;}
  g.restore();}
function drawBrain(g,x,y,s,col1='#ff9bb8',pulse=0){g.save();g.translate(x,y);const k=1+pulse*.05;g.scale(s*k,s*k);
  const P=()=>{g.beginPath();g.moveTo(-100,10);g.bezierCurveTo(-130,-30,-96,-84,-48,-76);g.bezierCurveTo(-30,-110,30,-110,50,-76);g.bezierCurveTo(100,-84,134,-28,100,10);g.bezierCurveTo(112,52,70,70,40,56);g.quadraticCurveTo(0,80,-40,56);g.bezierCurveTo(-72,70,-112,52,-100,10);g.closePath();};
  P();inkS(g,lin(g,0,-110,0,80,[[0,shade(col(col1),.25)],[1,col1]]),8);hatch(g,P,-.7,12,.16);
  g.strokeStyle=INK;g.lineWidth=5;g.lineCap='round';g.globalAlpha=.8;for(const [a,b,c,d,e,f] of [[0,-90,-6,-40,8,-10],[-60,-60,-40,-30,-62,0],[60,-60,44,-26,64,4],[-86,10,-56,26,-30,20],[84,10,56,26,30,22],[0,50,6,30,-4,10]]){g.beginPath();g.moveTo(a,b);g.quadraticCurveTo(c,d,e,f);g.stroke();}
  g.globalAlpha=.9;g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-56,-52,16,8,-.5,0,7);g.fill();g.restore();}
function drawHeart(g,x,y,s,beat=0,c='#ff3d63'){g.save();g.translate(x,y);const k=1+beat*.12;g.scale(s*k,s*k);
  const P=()=>{g.beginPath();g.moveTo(0,70);g.bezierCurveTo(-100,0,-96,-76,-46,-78);g.bezierCurveTo(-18,-80,0,-58,0,-40);g.bezierCurveTo(0,-58,18,-80,46,-78);g.bezierCurveTo(96,-76,100,0,0,70);g.closePath();};
  shadowEll(g,0,92,70,10,.3);P();inkS(g,lin(g,-60,-80,60,70,[[0,shade(col(c),.3)],[1,shade(col(c),-.2)]]),8);hatch(g,P,.7,12,.14);g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-48,-44,16,28,.6,0,7);g.fill();g.restore();}
function drawZ(g,x,y,s,a,rot=0){g.save();g.globalAlpha=a;txtInk(g,'Z',x,y,s,'#cfd8ff',{rot,stroke:s*.16});g.restore();}
function drawGhost(g,x,y,s,t,a=1,seed=0){g.save();g.globalAlpha=a;g.translate(x,y+Math.sin(t*1.3+seed)*10);g.scale(s,s);
  const P=()=>{g.beginPath();g.moveTo(-60,120);g.bezierCurveTo(-90,0,-70,-110,0,-110);g.bezierCurveTo(70,-110,90,0,60,120);for(let i=0;i<4;i++){const xx=60-i*30;g.quadraticCurveTo(xx-8,150+Math.sin(t*3+i+seed)*12,xx-15,122);}g.closePath();};
  P();g.fillStyle=lin(g,0,-110,0,150,[[0,'rgba(20,14,40,.92)'],[1,'rgba(20,14,40,.2)']]);g.fill();g.lineWidth=5;g.strokeStyle='rgba(160,140,255,.7)';g.stroke();
  glow(g,-22,-40,40,'#7a5cff',.5);glow(g,22,-40,40,'#7a5cff',.5);g.fillStyle='#fff';g.beginPath();g.ellipse(-22,-40,10,15,0,0,7);g.ellipse(22,-40,10,15,0,0,7);g.fill();g.fillStyle='#120d22';g.beginPath();g.arc(-20+Math.sin(t*2)*3,-38,5,0,7);g.arc(24+Math.sin(t*2)*3,-38,5,0,7);g.fill();g.restore();}
function drawBookshelf(g,x,y,w,h){g.save();g.translate(x,y);
  g.beginPath();g.rect(0,0,w,h);inkS(g,lin(g,0,0,w,0,[[0,'#6a4430'],[1,'#4a2e20']]),8);
  const rows=3,rh=h/rows;const cols=['#ff6b6b','#ffd166','#06d6a0','#4cc9f0','#a78bfa','#f78fb3','#ffb454'];
  for(let r=0;r<rows;r++){g.fillStyle='#2c1a12';g.fillRect(10,r*rh+rh-14,w-20,14);let bx=16;for(let i=0;bx<w-40;i++){const bw=18+rng(r*9+i)*20,bh=rh*(.45+.4*rng(r*13+i+3));g.beginPath();g.rect(bx,r*rh+rh-14-bh,bw,bh);inkS(g,cols[(r*3+i)%cols.length],4);bx+=bw+3;}}
  g.restore();}
function drawPlant(g,x,y,s,t){g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(-34,0);g.lineTo(34,0);g.lineTo(26,64);g.lineTo(-26,64);g.closePath();inkS(g,'#d9683a',7);
  for(let i=0;i<7;i++){const a=-1.2+i*.4,sw=Math.sin(t*1.2+i)*.04;g.save();g.rotate(a+sw);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-26,-70,0,-130-rng(i)*30);g.quadraticCurveTo(26,-70,0,0);inkS(g,i%2?'#2fa86a':'#1e8a52',6);g.restore();}g.restore();}
