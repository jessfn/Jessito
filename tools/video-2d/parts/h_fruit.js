// ===================== detailed fruit (overrides f_props icons) =====================
function iconApple(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle=rad(g,0,46,2,40,[[0,'#000',.32],[1,'#000',0]]);g.beginPath();g.ellipse(0,46,40,9,0,0,7);g.fill();
  const body=()=>{g.beginPath();g.moveTo(0,-26);g.bezierCurveTo(-18,-44,-52,-26,-48,10);g.bezierCurveTo(-44,40,-22,54,-6,46);g.quadraticCurveTo(0,44,6,46);g.bezierCurveTo(22,54,44,40,48,10);g.bezierCurveTo(52,-26,18,-44,0,-26);g.closePath();};
  body();g.fillStyle=rad(g,-16,-8,4,74,[[0,'#ff9b86'],[.3,'#ea4331'],[.7,'#b9201a'],[1,'#6e0f0e']]);g.fill();
  g.save();body();g.clip();
  g.strokeStyle='rgba(255,214,120,.35)';g.lineWidth=5;for(let i=0;i<7;i++){const xx=-34+i*11;g.beginPath();g.moveTo(xx*.4,-26);g.quadraticCurveTo(xx*1.35,10,xx*.9,50);g.stroke();}
  g.fillStyle='rgba(255,226,170,.55)';for(let i=0;i<26;i++){g.beginPath();g.arc(-40+rng(i)*80,-14+rng(i+30)*58,.9+rng(i+7)*1.4,0,7);g.fill();}
  g.fillStyle=rad(g,26,30,2,46,[[0,'#7a0c10',.0],[1,'#3c0408',.55]]);g.fillRect(-60,-50,120,110);
  g.fillStyle=rad(g,0,-24,1,16,[[0,'#3a0a06',.6],[1,'#3a0a06',0]]);g.fillRect(-20,-40,40,32);
  g.restore();
  g.fillStyle=lin(g,-30,-18,-12,18,[[0,'rgba(255,255,255,.85)'],[1,'rgba(255,255,255,0)']]);g.beginPath();g.ellipse(-24,-6,8,17,.45,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-31,18,3,5,.3,0,7);g.fill();
  g.strokeStyle='#4a2a12';g.lineWidth=5.5;g.lineCap='round';g.beginPath();g.moveTo(1,-28);g.quadraticCurveTo(3,-44,12,-54);g.stroke();
  g.fillStyle=lin(g,6,-44,44,-62,[[0,'#9be25a'],[1,'#2f8a22']]);g.beginPath();g.moveTo(8,-42);g.quadraticCurveTo(26,-72,50,-50);g.quadraticCurveTo(30,-34,8,-42);g.fill();
  g.strokeStyle='rgba(20,80,10,.55)';g.lineWidth=2;g.beginPath();g.moveTo(10,-42);g.quadraticCurveTo(30,-52,46,-50);g.stroke();g.restore();}
function iconAlmond(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle=rad(g,0,40,2,60,[[0,'#000',.28],[1,'#000',0]]);g.beginPath();g.ellipse(0,40,54,10,0,0,7);g.fill();
  [[-20,6,-.55,1],[22,-2,.4,.95],[2,22,.05,.85]].forEach(([dx,dy,r,sc])=>{g.save();g.translate(dx,dy);g.rotate(r);g.scale(sc,sc);
   g.beginPath();g.moveTo(0,-38);g.bezierCurveTo(24,-26,26,22,0,38);g.bezierCurveTo(-26,22,-24,-26,0,-38);g.closePath();
   g.fillStyle=lin(g,-22,-30,22,30,[[0,'#e6b27c'],[.5,'#b7773f'],[1,'#6a3e1c']]);g.fill();g.save();g.clip();
   g.strokeStyle='rgba(70,38,16,.35)';g.lineWidth=1.6;for(let i=0;i<22;i++){const xx=-20+i*1.9;g.beginPath();g.moveTo(xx*.3,-36);g.quadraticCurveTo(xx*1.4,0,xx*.4,36);g.stroke();}
   g.fillStyle='rgba(255,230,190,.22)';for(let i=0;i<40;i++){g.beginPath();g.arc(-16+rng(i+r*9)*32,-30+rng(i+50)*62,.8+rng(i)*1.1,0,7);g.fill();}
   g.fillStyle=lin(g,-22,0,22,0,[[0,'rgba(255,255,255,.35)'],[.35,'rgba(255,255,255,0)'],[1,'rgba(0,0,0,.28)']]);g.fillRect(-30,-40,60,80);g.restore();
   g.strokeStyle='rgba(60,30,12,.7)';g.lineWidth=2.2;g.stroke();g.restore();});
  g.restore();}
function iconAvocado(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle=rad(g,0,48,2,50,[[0,'#000',.28],[1,'#000',0]]);g.beginPath();g.ellipse(0,50,40,9,0,0,7);g.fill();
  const sh=(k)=>{g.beginPath();g.moveTo(0,-48*k);g.bezierCurveTo(16*k,-48*k,22*k,-22*k,35*k,2*k);g.bezierCurveTo(50*k,32*k,28*k,54*k,0,54*k);g.bezierCurveTo(-28*k,54*k,-50*k,32*k,-35*k,2*k);g.bezierCurveTo(-22*k,-22*k,-16*k,-48*k,0,-48*k);g.closePath();};
  sh(1);g.fillStyle=lin(g,-36,-40,36,54,[[0,'#4f7d2a'],[.5,'#2f5a1c'],[1,'#1a3410']]);g.fill();
  g.save();sh(1);g.clip();g.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<40;i++){g.beginPath();g.arc(-30+rng(i)*60,-40+rng(i+20)*90,1+rng(i+7)*1.6,0,7);g.fill();}g.restore();
  sh(.9);g.fillStyle=lin(g,0,-40,0,50,[[0,'#f3f08a'],[.45,'#c4dc5a'],[1,'#85b23a']]);g.fill();
  g.save();sh(.9);g.clip();g.fillStyle=rad(g,0,16,10,50,[[0,'#fff',0],[1,'#3a6a1a',.45]]);g.fillRect(-50,-50,100,110);g.restore();
  g.fillStyle=rad(g,-6,10,1,24,[[0,'#d29a64'],[.5,'#a2682f'],[1,'#5e3414']]);g.beginPath();g.arc(0,16,19,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-7,8,5,8,.5,0,7);g.fill();
  g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-18,-18,4,14,.5,0,7);g.fill();g.restore();}
function iconBerries(g,x,y,s,a=1){g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(s,s);
  g.fillStyle=rad(g,0,34,2,52,[[0,'#000',.28],[1,'#000',0]]);g.beginPath();g.ellipse(0,34,52,9,0,0,7);g.fill();
  for(const [dx,dy,r] of [[-26,12,22],[22,10,24],[-2,-18,23],[-4,26,16]]){
   g.fillStyle=rad(g,dx-r*.3,dy-r*.35,r*.08,r*1.15,[[0,'#7d93ee'],[.45,'#33449e'],[1,'#12195a']]);g.beginPath();g.arc(dx,dy,r,0,7);g.fill();
   g.fillStyle=rad(g,dx,dy,r*.55,r,[[0,'#cfd9ff',0],[1,'#cfd9ff',.38]]);g.beginPath();g.arc(dx,dy,r,0,7);g.fill();
   g.fillStyle='#0e1240';g.beginPath();for(let i=0;i<10;i++){const aa=i*Math.PI/5-Math.PI/2,rr=i%2?3.4:8.5;g.lineTo(dx+Math.cos(aa)*rr,dy-r*.2+Math.sin(aa)*rr*.8);}g.closePath();g.fill();
   g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(dx-r*.38,dy-r*.42,r*.2,r*.12,-.6,0,7);g.fill();}
  g.fillStyle=lin(g,10,-52,40,-40,[[0,'#8fdc54'],[1,'#2f8a22']]);g.beginPath();g.moveTo(4,-38);g.quadraticCurveTo(20,-62,40,-46);g.quadraticCurveTo(24,-32,4,-38);g.fill();g.restore();}
// pre-rendered apple sprite for trees
const APPLE_SPR=(function(){const c=offscreen(160,160),g=c.getContext('2d');iconApple(g,80,86,1.25);return c;})();
function drawApples(g,t,alpha){if(alpha<=.01)return;
  for(const T of TREE_POS)for(const a of T.apples){const k=1-ss(a.tv,a.tv+.22,t);if(k<=.01)continue;const x=a.x-250-CAMS.x*.38,y=a.y,r=17*k;
    g.globalAlpha=alpha;g.drawImage(APPLE_SPR,x-r*1.35,y-r*1.45,r*2.7,r*2.7);}g.globalAlpha=1;}
