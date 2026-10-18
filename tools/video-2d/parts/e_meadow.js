// ===================== meadow family =====================
const CAMS={x:0,z:1};
const px=f=>-250-CAMS.x*f;
function mixLayer(g,key,f,A,B,mix,y=0){const a=LAYERS[A][key];g.drawImage(a,px(f),y);if(B&&mix>.002){g.globalAlpha=mix;g.drawImage(LAYERS[B][key],px(f),y);g.globalAlpha=1;}}
// scatter data (deterministic)
const FL=[],TF=[];
(function(){for(let i=0;i<120;i++){const d=Math.pow(rng(i*3+1),.8),y=1040+d*860;FL.push({x:-300+rng(i*3+2)*1700,y,d:(y-1000)/920,type:Math.floor(rng(i*3+3)*5),h:150+rng(i+4)*120,ph:rng(i+5)*6.28,del:rng(i+6)*.45});}
  FL.sort((a,b)=>a.y-b.y);
  for(let i=0;i<110;i++){const d=Math.pow(rng(i*7+1),.9),y=1020+d*920;TF.push({x:-300+rng(i*7+2)*1700,y,d:(y-1000)/920,idx:Math.floor(rng(i*7+3)*7),f:rng(i*7+4)>.5});}
  TF.sort((a,b)=>a.y-b.y);})();
function drawClouds(g,t,set,mixd){
  const cs=CLOUDS[set]||CLOUDS.day;for(let i=0;i<6;i++){const sp=7+rng(i)*9,x0=rng(i+9)*(W+900),x=((x0+t*sp)%(W+900))-450-CAMS.x*.06,y=130+rng(i+3)*430,sc=.55+rng(i+7)*.9;
    g.globalAlpha=(.6+.35*rng(i+11))*(1-mixd*.3);g.filter='brightness(1.22)';g.drawImage(cs[i%4],x-260*sc,y-120*sc,520*sc,240*sc);}g.filter='none';g.globalAlpha=1;}
function drawRays(g,t,strength,warm){if(strength<=.01)return;g.save();g.globalCompositeOperation='screen';const sx=830-CAMS.x*.04,sy=330;
  for(let i=0;i<8;i++){const a=1.0+i*.19+Math.sin(t*.35+i)*.04,len=1900,w=.07+.05*rng(i);const x1=sx+Math.cos(a-w)*len,y1=sy+Math.sin(a-w)*len,x2=sx+Math.cos(a+w)*len,y2=sy+Math.sin(a+w)*len;
    g.fillStyle=lin(g,sx,sy,sx+Math.cos(a)*1100,sy+Math.sin(a)*1100,[[0,warm?'#ffe0a0':'#fff6d0',.20*strength],[1,'#fff6d0',0]]);g.beginPath();g.moveTo(sx,sy);g.lineTo(x1,y1);g.lineTo(x2,y2);g.closePath();g.fill();}g.restore();}
function drawApples(g,t,alpha){if(alpha<=.01)return;
  for(const T of TREE_POS)for(const a of T.apples){const k=1-ss(a.tv,a.tv+.22,t);if(k<=.01)continue;const x=a.x-250-CAMS.x*.38,y=a.y,r=9.5*k;
    g.globalAlpha=alpha;g.fillStyle=rad(g,x-r*.3,y-r*.3,r*.1,r*1.2,[[0,'#ff8a70'],[.5,'#e03a2a'],[1,'#8f1a14']]);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x-r*.35,y-r*.4,r*.28,0,7);g.fill();g.strokeStyle='#4a2a14';g.lineWidth=1.6;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+1,y-r-4);g.stroke();}g.globalAlpha=1;}
function stemColor(W,set){return set==='dusk'?'#5a6a3a':rgb(mixc(col(PAL.day.grD),col(PAL.dry.grD),W));}
function drawFlowers(g,t,Wd,wind,ya,yb,set,vis=1){
  for(const f of FL){if(f.y<ya||f.y>=yb)continue;const sc=.30+.95*f.d,wk=clamp((Wd-f.del)/.4),sway=Math.sin(t*1.6+f.ph+f.x*.01)*.12*wind*(.6+f.d*.5);
    const sh=-CAMS.x*(.5+.5*f.d),bx=f.x+sh,by=f.y,Hh=f.h*sc*(1-.42*wk),hx=bx+sway*Hh*1.1+wk*28*sc*(f.ph>3?1:-1),hy=by-Hh+wk*Hh*.25;
    g.strokeStyle=stemColor(Wd,set);g.lineWidth=Math.max(2,5*sc);g.lineCap='round';g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+sway*Hh*.2,by-Hh*.5,hx,hy);g.stroke();
    g.fillStyle=stemColor(Wd,set);g.beginPath();g.ellipse(bx+sway*Hh*.1-9*sc,by-Hh*.35,10*sc,4*sc,-.6,0,7);g.fill();
    const sz=96*sc*.62,rot=sway*.9+wk*1.35*(f.ph>3?1:-1);
    g.save();g.translate(hx,hy);g.rotate(rot);g.globalAlpha=vis*(set==='dusk'?.8:1);
    if(set==='dusk'){g.globalAlpha=vis*.7;g.drawImage(FSP[f.type][1],-sz/2,-sz/2,sz,sz);}else{g.drawImage(FSP[f.type][0],-sz/2,-sz/2,sz,sz);if(wk>.01){g.globalAlpha=wk*vis;g.drawImage(FSP[f.type][1],-sz/2,-sz/2,sz,sz);}}
    g.restore();g.globalAlpha=1;}}
function drawTufts(g,t,set,mixW,wind,ya,yb){
  for(const f of TF){if(f.y<ya||f.y>=yb)continue;const sc=.28+1.15*f.d,sway=Math.sin(t*1.3+f.x*.012+f.d*3)*.18*wind*(.5+f.d*.7);
    const sh=-CAMS.x*(.5+.5*f.d),bx=f.x+sh,by=f.y;
    const blur=f.d>.72&&TUFTB[set==='wheat'?'day':set];
    const A=(blur?TUFTB:TUFT)[set==='wheat'?'wheat':(set==='dusk'?'dusk':'day')],Bset=(set==='day'||set==='dry')?'dry':null;
    const spr=blur?A[f.idx%4]:A[f.idx];
    g.save();g.translate(bx,by);g.transform(1,0,sway,1,0,0);g.scale(sc*1.05,sc);
    g.drawImage(spr,-100,-236);
    if(Bset&&mixW>.01&&set!=='dusk'){g.globalAlpha=mixW;g.drawImage((blur?TUFTB:TUFT)[Bset][blur?f.idx%4:f.idx],-100,-236);g.globalAlpha=1;}
    g.restore();}}
function drawBackdrop(g,t,env){
  const A=env.base,B=env.over,mx=env.mix;
  g.drawImage(LAYERS[A].sky,px(.04),0);if(B&&mx>.002){g.globalAlpha=mx;g.drawImage(LAYERS[B].sky,px(.04),0);g.globalAlpha=1;}
  if(env.sunDisc){const k=env.sunDisc;g.save();g.fillStyle=rad(g,700-CAMS.x*.05,940,0,520,[[0,'#ffd9a0',.9*k],[.35,'#ff9a5a',.35*k],[1,'#ff6a3a',0]]);g.fillRect(0,300,W,800);g.fillStyle=rad(g,700-CAMS.x*.05,940,10,150,[[0,'#fff3d0',k],[.75,'#ffc070',k],[1,'#ff9050',0]]);g.beginPath();g.arc(700-CAMS.x*.05,940,150,0,7);g.fill();g.restore();}
  if(env.stars){g.save();for(let i=0;i<70;i++){const x=rng(i)*W,y=rng(i+30)*560,tw=.5+.5*Math.sin(t*2+i);g.globalAlpha=env.stars*tw*.8;g.fillStyle='#fff';g.beginPath();g.arc(x,y,1+rng(i+7)*1.8,0,7);g.fill();}g.restore();}
  drawClouds(g,t,env.cloudSet||'day',env.mix);
  drawRays(g,t,env.rays||0,env.warm);
  mixLayer(g,'far',.12,A,B,mx);mixLayer(g,'mid',.22,A,B,mx);
  if(env.windmill)drawWindmill(g,t);
  mixLayer(g,'orchard',.38,A,B,mx);
  if(env.apples)drawApples(g,t,env.apples);
  if(env.hives){g.drawImage(HIVES,px(.6),0);}
  mixLayer(g,'ground',.85,A,B,mx);
}
function drawWindmill(g,t){const x=470-CAMS.x*.2,y=905;g.save();g.translate(x,y);g.fillStyle='rgba(60,40,30,.55)';g.beginPath();g.moveTo(-26,60);g.lineTo(-14,-30);g.lineTo(14,-30);g.lineTo(26,60);g.closePath();g.fill();
  g.translate(0,-34);g.rotate(t*.7);for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);g.fillStyle='rgba(70,48,34,.6)';g.fillRect(-4,-4,8,92);g.fillStyle='rgba(235,220,200,.55)';g.fillRect(4,10,26,70);g.restore();}g.restore();
  g.save();g.fillStyle='rgba(70,48,40,.55)';g.beginPath();g.moveTo(640-CAMS.x*.2,930);g.lineTo(640-CAMS.x*.2,880);g.lineTo(690-CAMS.x*.2,846);g.lineTo(740-CAMS.x*.2,880);g.lineTo(740-CAMS.x*.2,930);g.closePath();g.fill();g.restore();}
function drawPollen(g,t,n,tint,amount,glow=1){g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const sp=10+rng(i)*26,x=((rng(i*3+1)*(W+300)+t*sp*(1+rng(i+4)))%(W+300))-150,y=300+rng(i*3+2)*1450+Math.sin(t*.8+i)*30,r=(4+rng(i+9)*14)*glow,tw=.35+.65*Math.abs(Math.sin(t*1.2+i*1.7));
    g.globalAlpha=amount*tw*(.25+.4*rng(i+13));g.fillStyle=tint;g.drawImage(DOT,x-r*2,y-r*2,r*4,r*4);}g.restore();}
function drawBees(g,t,front,beeMode){ // beeMode: {vanish:true} hook, {show:fn} for CTA
  const N=190;for(let i=0;i<N;i++){if((i%3===0)!==front)continue;
    let v=1;if(beeMode==='hook'){if(t>=ST[1])return;v=1-ss(BEETV[i],BEETV[i]+.25,t);}else if(beeMode==='cta'){v=ss(ST[7]+.2+rng(i*19+1)*1.4,ST[7]+.6+rng(i*19+1)*1.4,t);}else return;
    if(v<=.01)continue;
    const sc=.5+.65*rng(i*11+2),cx=540+(rng(i*3+1)-.5)*(front?1100:1000),cy=880+(rng(i*3+2)-.5)*(front?900:700),rho=60+rng(i*5+1)*240,w1=.5+rng(i*5+2)*.8,ph=rng(i*5+3)*6.28;
    const f=tt=>[cx+rho*Math.cos(w1*tt+ph)+40*Math.sin(tt*2.3+ph*2),cy+rho*.55*Math.sin(w1*tt*1.3+ph*1.7)+14*Math.sin(tt*7+i)];
    const p0=f(t),p1=f(t+.05);const ang=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);const flip=Math.cos(ang)<0;
    const rot=flip?ang-Math.PI:ang;drawBee(g,p0[0]-CAMS.x*.7,p0[1],.62*sc*v,rot*.5,Math.sin(t*2*Math.PI*17+i),flip);}}
function drawWind(g,t,k){if(k<=.01)return;g.save();g.strokeStyle='rgba(255,255,255,.7)';g.lineCap='round';
  for(let i=0;i<16;i++){const sp=700+rng(i)*500,x=((rng(i+3)*2400-t*sp)%2000+2000)%2000-300,y=380+rng(i+9)*1100,len=150+rng(i+2)*260;g.globalAlpha=k*(.18+.28*rng(i+5));g.lineWidth=3+rng(i)*3;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+len*.3,y-24,x+len*.6,y+24,x+len,y-6);g.stroke();}g.restore();}
function drawLeaves(g,t,k,tint){if(k<=.01)return;g.save();for(let i=0;i<22;i++){const sp=260+rng(i)*320,x=((rng(i+3)*2300-t*sp)%1900+1900)%1900-250,y=420+rng(i+9)*1250+Math.sin(t*2+i)*50,r=t*3+i;g.globalAlpha=k*.9;g.translate(x,y);g.rotate(r);g.fillStyle=tint[i%tint.length];g.beginPath();g.ellipse(0,0,16,7,0,0,7);g.fill();g.strokeStyle='rgba(60,40,10,.4)';g.lineWidth=1.5;g.beginPath();g.moveTo(-16,0);g.lineTo(16,0);g.stroke();g.rotate(-r);g.translate(-x,-y);}g.restore();}
function drawButterflies(g,t,k){if(k<=.01)return;for(let i=0;i<5;i++){const ph=rng(i+50)*6.28,x=200+rng(i+60)*700+Math.sin(t*.6+ph)*160-CAMS.x*.7,y=640+rng(i+70)*500+Math.sin(t*1.1+ph)*50,fl=Math.abs(Math.sin(t*2*Math.PI*2.4+i)),sc=(.8+.5*rng(i))*k;
  g.save();g.translate(x,y);g.rotate(Math.sin(t*.6+ph)*.3);g.scale(sc,sc);
  for(const s of [-1,1]){g.save();g.scale(s*(.25+.75*fl),1);g.fillStyle=lin(g,0,-30,60,40,[[0,'#ffb347'],[1,'#e8631a']]);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(20,-60,70,-44,64,-6);g.bezierCurveTo(60,24,24,24,0,2);g.closePath();g.fill();g.fillStyle='#1a1008';g.beginPath();g.arc(36,-14,5,0,7);g.fill();g.beginPath();g.arc(28,8,3.4,0,7);g.fill();g.strokeStyle='#2a1a10';g.lineWidth=3;g.stroke();g.restore();}
  g.fillStyle='#2a1a10';g.beginPath();g.ellipse(0,0,4,14,0,0,7);g.fill();g.restore();}}
