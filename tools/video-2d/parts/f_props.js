// ===================== icons & props =====================
function iconApple(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,46,34,8,0,0,7);g.fill();
  g.fillStyle=rad(g,-14,-12,4,62,[[0,'#ff8c78'],[.45,'#e23a2c'],[1,'#8a1812']]);g.beginPath();g.moveTo(0,-30);g.bezierCurveTo(-22,-40,-48,-22,-44,8);g.bezierCurveTo(-40,38,-18,50,0,42);g.bezierCurveTo(18,50,40,38,44,8);g.bezierCurveTo(48,-22,22,-40,0,-30);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-20,-10,7,13,.4,0,7);g.fill();
  g.strokeStyle='#5a3418';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(0,-28);g.quadraticCurveTo(2,-42,10,-48);g.stroke();
  g.fillStyle=lin(g,0,-40,30,-60,[[0,'#7fd44a'],[1,'#3f9a2a']]);g.beginPath();g.moveTo(6,-40);g.quadraticCurveTo(24,-62,40,-46);g.quadraticCurveTo(26,-34,6,-40);g.fill();g.restore();}
function iconAlmond(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  for(const [dx,dy,r] of [[-18,6,-.5],[16,-4,.35]]){g.save();g.translate(dx,dy);g.rotate(r);g.fillStyle=lin(g,-18,-30,18,30,[[0,'#d29a64'],[.6,'#a86a38'],[1,'#6e4222']]);g.beginPath();g.moveTo(0,-36);g.bezierCurveTo(26,-16,26,22,0,38);g.bezierCurveTo(-26,22,-26,-16,0,-36);g.fill();g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*5,-26);g.quadraticCurveTo(i*7,0,i*4,28);g.stroke();}g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(-8,-10,4,12,.2,0,7);g.fill();g.restore();}g.restore();}
function iconAvocado(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle=lin(g,-30,-40,30,50,[[0,'#6a9a3a'],[1,'#2e5a1c']]);g.beginPath();g.moveTo(0,-46);g.bezierCurveTo(16,-46,22,-20,34,2);g.bezierCurveTo(46,30,28,50,0,50);g.bezierCurveTo(-28,50,-46,30,-34,2);g.bezierCurveTo(-22,-20,-16,-46,0,-46);g.fill();
  g.fillStyle=lin(g,0,-34,0,44,[[0,'#d6e87a'],[1,'#9ac23c']]);g.beginPath();g.moveTo(0,-36);g.bezierCurveTo(12,-36,16,-16,26,2);g.bezierCurveTo(36,26,22,42,0,42);g.bezierCurveTo(-22,42,-36,26,-26,2);g.bezierCurveTo(-16,-16,-12,-36,0,-36);g.fill();
  g.fillStyle=rad(g,-6,12,2,22,[[0,'#b07a4a'],[1,'#6a4020']]);g.beginPath();g.arc(0,16,18,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-6,9,5,7,.3,0,7);g.fill();g.restore();}
function iconBerries(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  for(const [dx,dy,r] of [[-24,10,22],[20,6,24],[0,-20,23]]){g.fillStyle=rad(g,dx-r*.3,dy-r*.3,r*.1,r*1.2,[[0,'#8fa6ff'],[.5,'#3a4fb8'],[1,'#1c2466']]);g.beginPath();g.arc(dx,dy,r,0,7);g.fill();g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(dx-r*.3,dy-r*.4,r*.28,r*.16,-.5,0,7);g.fill();
   g.fillStyle='#14184a';g.beginPath();for(let i=0;i<10;i++){const aa=i*Math.PI/5-Math.PI/2,rr=i%2?3:7;g.lineTo(dx+Math.cos(aa)*rr,dy-r*.1+Math.sin(aa)*rr);}g.closePath();g.fill();}g.restore();}
function iconBread(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,34,66,10,0,0,7);g.fill();
  g.fillStyle=lin(g,0,-40,0,36,[[0,'#e8b25a'],[.6,'#c98a3a'],[1,'#8a5420']]);g.beginPath();g.moveTo(-64,16);g.bezierCurveTo(-76,-30,-30,-46,0,-46);g.bezierCurveTo(30,-46,76,-30,64,16);g.bezierCurveTo(60,34,-60,34,-64,16);g.fill();
  g.strokeStyle='rgba(255,230,170,.75)';g.lineWidth=7;g.lineCap='round';for(const dx of [-30,0,30]){g.beginPath();g.moveTo(dx-8,-30);g.quadraticCurveTo(dx,-16,dx+8,-2);g.stroke();}
  g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(-30,-26,22,6,-.3,0,7);g.fill();g.restore();}
function iconRice(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,44,60,9,0,0,7);g.fill();
  g.fillStyle='#fbfbf6';g.beginPath();g.ellipse(0,-6,46,22,0,Math.PI,Math.PI*2);g.fill();
  for(let i=0;i<70;i++){const an=rng(i)*Math.PI,r=rng(i+9)*40,rx=Math.cos(an)*r,ry=-6-Math.sin(an)*r*.5;g.fillStyle='rgba(235,235,225,.95)';g.save();g.translate(rx,ry);g.rotate(rng(i+3)*3);g.beginPath();g.ellipse(0,0,5,2.2,0,0,7);g.fill();g.restore();}
  g.fillStyle=lin(g,-60,0,60,0,[[0,'#e8eef8'],[.5,'#fff'],[1,'#b8c4d8']]);g.beginPath();g.moveTo(-62,-4);g.bezierCurveTo(-58,34,-30,46,0,46);g.bezierCurveTo(30,46,58,34,62,-4);g.bezierCurveTo(30,4,-30,4,-62,-4);g.fill();
  g.strokeStyle='#4a6ab8';g.lineWidth=4;g.beginPath();g.moveTo(-54,14);g.quadraticCurveTo(0,24,54,14);g.stroke();
  g.strokeStyle='#a8764a';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(14,-34);g.lineTo(58,-58);g.moveTo(26,-30);g.lineTo(66,-46);g.stroke();g.restore();}
function iconWheat(g,x,y,s,rot=0,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.rotate(rot);g.scale(s,s);
  g.strokeStyle='#c9a24a';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(0,70);g.quadraticCurveTo(6,10,0,-30);g.stroke();
  for(let i=0;i<6;i++){for(const sd of [-1,1]){g.save();g.translate(0,-30+i*-10+i*0);g.translate(0,10+i*-9);g.rotate(sd*.7);g.fillStyle=lin(g,0,-14,0,10,[[0,'#ffe07a'],[1,'#d29a2a']]);g.beginPath();g.ellipse(sd*8,-12,6,14,0,0,7);g.fill();g.restore();}}
  g.fillStyle='#e8b43a';g.beginPath();g.ellipse(0,-84,6,16,0,0,7);g.fill();g.restore();}
function drawCross(g,x,y,s,k,col='#ff3b3b'){if(k<=0)return;g.save();g.translate(x,y);g.scale(s,s);g.strokeStyle=col;g.lineWidth=16;g.lineCap='round';g.shadowColor=col;g.shadowBlur=24;
  const a=eob(clamp(k*2)),b=eob(clamp(k*2-1));g.beginPath();g.moveTo(-40,-40);g.lineTo(-40+80*a,-40+80*a);g.stroke();g.beginPath();g.moveTo(40,-40);g.lineTo(40-80*b,-40+80*b);g.stroke();g.restore();}
// ----- S1: glass card with a donut chart ("un tercio") + crop icons -----
function drawChartCard(g,t){const u=t-ST[1];const a=eob(clamp(u/.7),1.1);if(a<=.01)return;
  const cx=540,cy=810;g.save();g.translate(cx,cy);g.scale(.85+.15*a,.85+.15*a);g.globalAlpha=clamp(a);g.translate(-cx,-cy);
  g.shadowColor='rgba(0,40,60,.35)';g.shadowBlur=50;g.shadowOffsetY=18;rrect(g,110,585,860,450,54);g.fillStyle=lin(g,0,585,0,1035,[[0,'rgba(255,255,255,.34)'],[1,'rgba(255,255,255,.14)']]);g.fill();g.shadowColor='transparent';
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=3;g.stroke();
  const dx=330,dy=810,R=130,TH=44;
  g.lineCap='round';g.strokeStyle='rgba(40,70,90,.28)';g.lineWidth=TH;g.beginPath();g.arc(dx,dy,R,0,Math.PI*2);g.stroke();
  const pr=eo((t-(wTer-.6))/1.5);const sw=Math.PI*2/3*pr;
  g.save();g.shadowColor='#ffb000';g.shadowBlur=30;g.strokeStyle=lin(g,dx-R,dy-R,dx+R,dy+R,[[0,'#ffe06a'],[1,'#f59a0a']]);g.lineWidth=TH;g.beginPath();g.arc(dx,dy,R,-Math.PI/2,-Math.PI/2+sw);g.stroke();g.restore();
  // tick marks
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;for(let i=0;i<3;i++){const an=-Math.PI/2+i*Math.PI*2/3;g.beginPath();g.moveTo(dx+Math.cos(an)*(R-TH*.7),dy+Math.sin(an)*(R-TH*.7));g.lineTo(dx+Math.cos(an)*(R+TH*.7),dy+Math.sin(an)*(R+TH*.7));g.stroke();}
  drawBee(g,dx,dy+2,1.5+.1*Math.sin(t*3),Math.sin(t*2)*.1,Math.sin(t*95),false);
  const icons=[[iconApple,640,725],[iconAlmond,820,725],[iconAvocado,640,905],[iconBerries,820,905]];
  icons.forEach(([fn,x,y],i)=>{const k=eob(clamp((u-.4-i*.14)/.5),1.5);g.fillStyle=rgb([255,255,255],.16*k);g.beginPath();g.arc(x,y,70,0,7);g.fill();fn(g,x,y+Math.sin(t*2+i)*4,.95*k);});
  g.restore();}
// ----- S2: table with three bowls that vanish -----
function drawOrchardTable(g,t){const tx=770-CAMS.x*.9,ty=1160;
  g.save();g.translate(tx,ty);
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(0,150,210,30,0,0,7);g.fill();
  for(const dx of [-150,150]){g.fillStyle=lin(g,dx-12,0,dx+12,0,[[0,'#a07a4a'],[1,'#5e4224']]);g.fillRect(dx-12,20,24,128);}
  g.fillStyle=lin(g,0,-20,0,30,[[0,'#d6aa72'],[1,'#a0733c']]);g.beginPath();g.moveTo(-210,12);g.lineTo(210,12);g.lineTo(190,-18);g.lineTo(-190,-18);g.closePath();g.fill();
  g.fillStyle='#8a5e30';rrect(g,-210,12,420,22,6);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-196,-14,370,4);
  const bowls=[[-110,wA,'a'],[0,wM,'m'],[110,wB,'b']];
  bowls.forEach(([bx,tv,k],i)=>{const v=1-ss(tv,tv+.25,t);
    g.save();g.translate(bx,-10);
    g.fillStyle=lin(g,-48,0,48,0,[[0,'#ffffff'],[1,'#c7d4e6']]);g.beginPath();g.moveTo(-52,-6);g.bezierCurveTo(-50,28,-24,36,0,36);g.bezierCurveTo(24,36,50,28,52,-6);g.closePath();g.fill();
    g.save();g.scale(v,v);g.translate(0,-12*(1-v));
    if(k==='a')for(let j=0;j<22;j++){const r=rng(j)*30,an=rng(j+5)*6.28;g.fillStyle=lin(g,0,-6,0,6,[[0,'#d8a470'],[1,'#8a5a2c']]);g.save();g.translate(Math.cos(an)*r*1.3,-14-Math.abs(Math.sin(an))*r*.5);g.rotate(rng(j+2)*3);g.beginPath();g.ellipse(0,0,10,5.5,0,0,7);g.fill();g.restore();}
    if(k==='m')for(const [ax,ay] of [[-22,-16],[8,-22],[26,-12],[-4,-4],[-30,-4],[14,-6]]){iconApple(g,bx*0+ax,ay-4,.3);}
    if(k==='b')for(let j=0;j<26;j++){const r=rng(j)*30,an=rng(j+5)*6.28,xx=Math.cos(an)*r*1.35,yy=-12-Math.abs(Math.sin(an))*r*.55;g.fillStyle=rad(g,xx-2,yy-2,1,8,[[0,'#8fa6ff'],[1,'#27348a']]);g.beginPath();g.arc(xx,yy,7,0,7);g.fill();}
    g.restore();
    g.fillStyle=lin(g,-52,0,52,0,[[0,'rgba(255,255,255,0)'],[.5,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.ellipse(0,-4,48,6,0,0,7);g.fill();
    g.restore();});
  g.restore();}
