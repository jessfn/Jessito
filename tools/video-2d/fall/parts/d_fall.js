// ===================== free-fall world =====================
const FALLPX=26000,T_DOOR=1.05,T_IMP=31.9;let DRAG_TAU=.9;
function fallDist(t){const tau=Math.max(0,t-T_DOOR),vmax=1/(T_IMP-T_DOOR-2),R=4;let d;if(tau<R)d=vmax*tau*tau/(2*R);else d=vmax*(R/2+(tau-R));return Math.min(1,d);}
const ALTK=[[0,10000],[T_DOOR,10000],[7.3,9900],[13.1,9300],[18.7,8000],[25,6000],[T_IMP,0]];
const altM=t=>{if(t>=T_IMP)return 0;let i=0;while(i<ALTK.length-2&&t>=ALTK[i+1][0])i++;const a=ALTK[i],b=ALTK[i+1];return lerp(a[1],b[1],clamp((t-a[0])/(b[0]-a[0])));};
const speedKmh=t=>{const tau=Math.max(0,t-T_DOOR);return 200*Math.min(1,tau/4.2)**.9;};
// ---- sky ----
function skyFall(g,alt,t){const k=1-alt/10000;g.fillStyle=lin(g,0,0,0,H,[[0,mixc2('#0e2a78','#5aa8f0',k)],[.55,mixc2('#3a78d0','#a8d8ff',k)],[1,mixc2('#9ac8f0','#e8f6ff',k)]]);g.fillRect(-200,-200,W+400,H+400);}
const mixc2=(a,b,k)=>rgb(mixc(hex(a),hex(b),k));
function cloudBlob(g,x,y,s,c,a){g.save();g.globalAlpha=a;g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(-130,30);g.bezierCurveTo(-170,-30,-90,-62,-52,-34);g.bezierCurveTo(-44,-96,40,-104,64,-44);g.bezierCurveTo(120,-60,166,-12,136,30);g.closePath();inkS(g,c,6);g.fillStyle='rgba(120,150,210,.28)';g.beginPath();g.ellipse(10,18,110,14,0,0,7);g.fill();g.restore();}
function cloudLayers(g,t,camY,camX){ // 3 parallax layers (far/mid/near)
  const L=[[.55,.6,'#ffffff',.55,300],[1,1.0,'#ffffff',.95,380],[1.5,1.6,'#f6fbff',.9,520]];
  for(const [f,sc,c,a,gap] of L){const y0=camY*f,j0=Math.floor((y0-1300)/gap),j1=Math.ceil((y0+1300)/gap);
    for(let j=j0;j<=j1;j++){const r=rng(j*7+f*91),r2=rng(j*13+f*17);if(r<.35)continue;const wy=j*gap+r2*gap*.6,x=rng(j*3+f*5)*1500-210-camX*f*.3+Math.sin(t*.2+j)*14;cloudBlob(g,x,wy-y0+960,sc*(.8+r*.9),c,a);}}}
// ---- airliner (side view, nose right) ----
function airliner(g,x,y,s,t){g.save();g.translate(x,y);g.scale(s,s);
  // far wing
  g.beginPath();g.moveTo(-60,20);g.lineTo(120,150);g.lineTo(190,150);g.lineTo(60,10);g.closePath();inkS(g,'#aab6d0',7);
  // fuselage
  g.beginPath();g.moveTo(-640,-30);g.bezierCurveTo(-600,-96,-380,-110,60,-104);g.bezierCurveTo(430,-100,640,-70,720,10);g.bezierCurveTo(660,72,430,98,100,96);g.lineTo(-420,86);g.bezierCurveTo(-560,80,-620,40,-640,-30);g.closePath();inkS(g,lin(g,0,-100,0,100,[[0,'#ffffff'],[.7,'#e4ebf8'],[1,'#b8c6e0']]),8);
  g.fillStyle='#d83a3a';g.fillRect(-380,18,1020,18);g.strokeStyle=INK;g.lineWidth=4;g.strokeRect(-380,18,1020,18);
  // tail fin
  g.beginPath();g.moveTo(-600,-60);g.lineTo(-690,-300);g.lineTo(-540,-300);g.lineTo(-380,-90);g.closePath();inkS(g,'#d83a3a',7);
  // windows
  for(let i=0;i<22;i++){g.beginPath();g.roundRect(-360+i*38,-54,22,28,8);inkS(g,'#7fc4ff',3);}
  // cockpit
  g.beginPath();g.moveTo(590,-60);g.lineTo(650,-56);g.lineTo(690,-18);g.lineTo(600,-20);g.closePath();inkS(g,'#7fc4ff',4);
  // door (rear) outline
  g.beginPath();g.roundRect(-470,-58,48,92,10);inkS(g,'#cfd8ea',4);
  // near wing + engine
  g.beginPath();g.moveTo(-40,40);g.lineTo(240,250);g.lineTo(330,250);g.lineTo(120,30);g.closePath();inkS(g,'#cdd6ea',7);
  g.beginPath();g.ellipse(180,200,86,38,0,0,7);inkS(g,'#98a8c8',7);g.beginPath();g.ellipse(250,200,22,32,0,0,7);inkS(g,'#d8e0f0',5);
  // tail stabilizer
  g.beginPath();g.moveTo(-560,10);g.lineTo(-700,90);g.lineTo(-620,100);g.lineTo(-420,30);g.closePath();inkS(g,'#cdd6ea',6);
  g.restore();}
// ---- person in belly-down free fall (side view, face toward the ground) ----
const PS=.42;
function legsDraw(g,t,flail,fear){ // trousers + sneakers, flapping
  g.save();const a1=Math.sin(t*9)*flail,a2=Math.sin(t*9+2)*flail;
  for(const [a,col] of [[a2,'#26304a'],[a1,'#324066']]){g.save();g.rotate(a*.35);g.beginPath();g.moveTo(10,-70);g.lineTo(-170,-60+a*30);g.lineTo(-330,-30+a*80);g.lineTo(-340,30+a*80);g.lineTo(-165,52+a*30);g.lineTo(10,70);g.closePath();inkS(g,col,9);
    g.save();g.translate(-345,a*80);g.rotate(.2+a*.4);g.beginPath();g.moveTo(10,-34);g.lineTo(-60,-30);g.quadraticCurveTo(-96,0,-70,36);g.lineTo(10,34);g.closePath();inkS(g,'#f4f6fa',8);g.fillStyle='#e0303c';g.fillRect(-50,-6,56,10);g.restore();g.restore();}
  g.restore();}
function personFall(g,t,face,e,o){ // o:{x,y,rot,sc,flail,tired}
  const K=o.sc||1;
  g.save();g.translate(o.x,o.y);g.rotate(o.rot||0);g.scale(K,K);
  g.save();g.translate(-10,0);g.rotate(0);legsDraw(g,t,o.flail===undefined?.6:o.flail);g.restore();
  g.restore();
  g.save();g.translate(o.x,o.y);g.rotate(o.rot||0);g.scale(K,K);
  drawPeep(g,0,0,PS,{body:'ButtonShirt',face,tilt:e.tilt,hx:e.hx,hy:e.hy,bx:0,by:e.by,lean:e.lean,sq:e.sq,tired:o.tired||0,rot:Math.PI/2});
  // shirt hem + belt to hide the bust cut
  g.beginPath();g.moveTo(-8,-196);g.quadraticCurveTo(-26,0,-8,196);g.lineTo(18,196);g.quadraticCurveTo(0,0,18,-196);g.closePath();inkS(g,'#2f7fb8',8);g.beginPath();g.roundRect(-26,-198,20,396,6);inkS(g,'#1a1a28',7);g.fillStyle='#e8c46a';g.fillRect(-24,-14,16,28);g.strokeStyle=INK;g.lineWidth=3;g.strokeRect(-24,-14,16,28);
  g.restore();}
function headPos(o){const ang=(o.rot||0);const dx=400*PS/.42*(PS/PS),dy=-10*(PS/.42);const c=Math.cos(ang),s=Math.sin(ang);return [o.x+dx*c-dy*s,o.y+dx*s+dy*c];}
// ---- speed streaks (air rushing upward) ----
function airStreaks(g,t,k,cx=540){if(k<=.01)return;g.save();g.lineCap='round';for(let i=0;i<34;i++){const x=rng(i*3)*(W+200)-100,len=140+rng(i+1)*420,sp=2400+rng(i+2)*2600,yy=((rng(i+5)*3000-t*sp*k)%3200+3200)%3200-600;g.strokeStyle=`rgba(255,255,255,${(.18+.3*rng(i+9))*k})`;g.lineWidth=3+rng(i+4)*5;g.beginPath();g.moveTo(x,yy);g.lineTo(x,yy+len);g.stroke();}g.restore();}
// ---- ground approaching ----
function groundRush(g,t,p){ // p 0..1
  if(p<=.001)return;const base=2100-p*820,sc=1+p*2.4;g.save();
  g.beginPath();g.moveTo(-100,base-60*sc);for(let x=-100;x<=W+100;x+=30)g.lineTo(x,base-60*sc-Math.sin(x*.006)*70*sc-Math.sin(x*.017)*28*sc);g.lineTo(W+100,H+300);g.lineTo(-100,H+300);g.closePath();inkS(g,lin(g,0,base-200,0,H,[[0,'#f6fbff'],[.4,'#dbe8f2'],[1,'#8fa8c0']]),8);
  for(let i=0;i<26;i++){const x=rng(i)*1200-60,y=base+rng(i+7)*500*sc,s=(.4+rng(i+3)*.8)*sc*.7;g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(0,-120);g.lineTo(46,-30);g.lineTo(24,-30);g.lineTo(60,50);g.lineTo(-60,50);g.lineTo(-24,-30);g.lineTo(-46,-30);g.closePath();inkS(g,'#1f6a46',6);g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.moveTo(-34,-6);g.lineTo(0,-96);g.lineTo(34,-6);g.lineTo(18,-14);g.lineTo(0,-50);g.lineTo(-18,-14);g.closePath();g.fill();g.restore();}
  g.restore();}
