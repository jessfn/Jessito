let TLD=null;const ST=[],ENDS=[];let TOTAL=0,SEGS=[],NS=0;
function initTimeline(d){TLD=d;ST.push(...d.starts);TOTAL=d.total;SEGS=d.segs;NS=ST.length;for(let i=0;i<NS;i++)ENDS.push(i<NS-1?ST[i+1]:TOTAL);}
const sceneAt=t=>{for(let i=0;i<NS;i++)if(t<ENDS[i])return i;return NS-1;};
const wordT=(seg,key)=>{for(const w of SEGS[seg].words)if(w[0].toLowerCase().includes(key))return ST[seg]+w[1];return ST[seg]+.5;};
let T={};function initWords(){T={avion:wordT(0,'avión'),spoil:wordT(0,'spoiler'),suelo:wordT(0,'suelo'),km:wordT(1,'kilómetros'),oxi:wordT(1,'oxígeno'),min:wordT(1,'minuto'),
  frio:wordT(2,'cincuenta'),cero:wordT(2,'cero'),viento:wordT(2,'viento'),rap:wordT(3,'rápido'),dos:wordT(3,'doscientos'),term:wordT(3,'terminal'),
  tres:wordT(4,'tres'),eter:wordT(4,'eternos'),imp:wordT(5,'impacto'),perd:wordT(5,'perdona'),nadie:wordT(5,'nadie'),exc:wordT(6,'excepción'),vesna:wordT(6,'vesna'),mil:wordT(6,'mil'),sobre:wordT(6,'sobrevivió'),
  sig:wordT(7,'siguiente'),mar:wordT(7,'marianas'),sigu:wordT(7,'sígueme')};}
const mix2=(a,b,k)=>rgb(mixc(hex(a),hex(b),k));
function hudCard(g,cx,cy,w,h,k,fill){g.translate(cx,cy);g.scale(k,k);g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=34;g.shadowOffsetY=18;g.beginPath();g.roundRect(-w/2,-h/2,w,h,36);inkS(g,fill||lin(g,0,-h/2,0,h/2,[[0,'#27306e'],[1,'#171a46']]),9);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;}
function dots(g,x,y,w,h,n,seed,c){g.fillStyle=c;for(let i=0;i<n;i++){g.beginPath();g.arc(x+4+rng(seed+i)*(w-8),y+4+rng(seed+i+50)*(h-8),3.2,0,7);g.fill();}}
// ---- the HUD card that rides above the falling person (screen space) ----
function hud(g,t,si,u){const inS=si===1?eob(clamp(u/.5),1.2):1;if(inS<=.01)return;const alt=Math.round(altM(t)/10)*10;
  g.save();hudCard(g,540,640,780,270,inS);
  g.globalAlpha=ss(0,.3,u);g.fillStyle='#9fb0e8';g.font=`700 24px ${FONT_M}`;g.textAlign='left';g.textBaseline='middle';g.fillText('ALTITUD',-350,-100);
  const altS=String(alt).replace(/\B(?=(\d{3})+(?!\d))/g,' ');g.font=`700 66px ${FONT_M}`;g.lineWidth=10;g.strokeStyle=INK;g.strokeText(altS,-350,-48);g.fillStyle='#eaf1ff';g.fillText(altS,-350,-48);const aw=g.measureText(altS).width;g.font=`700 28px ${FONT_M}`;g.fillStyle='#9fb0e8';g.fillText('m',-350+aw+12,-40);
  if(si===1){ // thin air comparison + consciousness timer
    g.font=`700 20px ${FONT_M}`;g.fillStyle='#9fb0e8';g.fillText('NIVEL DEL MAR',-350,18);g.fillText('10 000 m',-170,18);
    g.beginPath();g.roundRect(-352,34,160,70,10);inkS(g,'#0d1030',4);dots(g,-348,38,152,62,46,3,'#8fd0ff');g.beginPath();g.roundRect(-172,34,160,70,10);inkS(g,'#0d1030',4);dots(g,-168,38,152,62,12,90,'#8fd0ff');
    const p=1-clamp((t-T.oxi+.5)/(T.min-T.oxi+1.2));g.fillStyle='#9fb0e8';g.fillText('CONCIENCIA',40,-100);g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.roundRect(40,-86,320,26,13);g.fill();g.fillStyle=p>.5?'#3ee0a0':p>.25?'#ffd166':'#ff5d6c';g.beginPath();g.roundRect(40,-86,Math.max(8,320*p),26,13);g.fill();g.lineWidth=4;g.strokeStyle=INK;g.beginPath();g.roundRect(40,-86,320,26,13);g.stroke();
    g.font=`700 52px ${FONT_M}`;g.fillStyle='#eaf1ff';g.textAlign='left';g.fillText(`${Math.max(0,Math.round(60*p))} s`,40,-8);
    g.font=`700 20px ${FONT_M}`;g.fillStyle='#9fb0e8';g.fillText('OXÍGENO ÚTIL',40,52);g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.roundRect(40,64,320,22,11);g.fill();g.fillStyle='#7ae0ff';g.beginPath();g.roundRect(40,64,Math.max(8,320*(.12+.88*p)),22,11);g.fill();}
  if(si===2){const tc=Math.round(lerp(15,-50,ss(T.frio-1,T.cero+.4,t)));
    g.fillStyle='#9fb0e8';g.font=`700 20px ${FONT_M}`;g.fillText('TEMPERATURA',-350,18);
    g.font=`700 78px ${FONT_M}`;g.lineWidth=10;g.strokeStyle=INK;g.strokeText(`${tc} °C`,-350,78);g.fillStyle=tc<0?'#9fe8ff':'#eaf1ff';g.fillText(`${tc} °C`,-350,78);
    g.beginPath();g.roundRect(10,20,360,40,20);inkS(g,'#0d1030',6);const pr=clamp((15-tc)/65);g.fillStyle=lin(g,10,0,370,0,[[0,'#ff7a5c'],[1,'#7ae0ff']]);g.beginPath();g.roundRect(14,24,Math.max(10,352*pr),32,16);g.fill();
    g.fillStyle='#9fb0e8';g.font=`700 20px ${FONT_M}`;g.fillText('+15',14,84);g.textAlign='right';g.fillText('−50',366,84);g.textAlign='left';}
  if(si===3){const v=Math.round(speedKmh(t));const R=92,cx0=210,cy0=76;g.save();g.translate(cx0,cy0);g.lineWidth=18;g.lineCap='round';g.strokeStyle='rgba(255,255,255,.14)';g.beginPath();g.arc(0,0,R,Math.PI,2*Math.PI);g.stroke();g.strokeStyle=lin(g,-R,0,R,0,[[0,'#46f0a0'],[.6,'#ffd166'],[1,'#ff5d6c']]);g.beginPath();g.arc(0,0,R,Math.PI,Math.PI+Math.PI*(v/250));g.stroke();
    g.save();g.rotate(Math.PI+Math.PI*(v/250));g.strokeStyle='#fff';g.lineWidth=7;g.beginPath();g.moveTo(0,0);g.lineTo(R-18,0);g.stroke();g.restore();g.beginPath();g.arc(0,0,12,0,7);inkS(g,'#ff5d6c',4);g.restore();
    g.font=`700 24px ${FONT_M}`;g.fillStyle='#9fb0e8';g.textAlign='left';g.fillText('VELOCIDAD',-350,18);g.font=`700 92px ${FONT_M}`;g.lineWidth=12;g.strokeStyle=INK;g.strokeText(String(v),-350,84);g.fillStyle=v>=198?'#ffd166':'#eaf1ff';g.fillText(String(v),-350,84);g.font=`700 30px ${FONT_M}`;g.fillStyle='#9fb0e8';g.fillText('km/h',-170,96);}
  if(si===4){const el=(10000-altM(t))/10000,secs=Math.round(180*el);g.save();g.translate(285,12);g.lineWidth=16;g.lineCap='round';g.strokeStyle='rgba(255,255,255,.14)';g.beginPath();g.arc(0,0,62,0,7);g.stroke();g.strokeStyle='#ffd166';g.beginPath();g.arc(0,0,62,-Math.PI/2,-Math.PI/2+Math.PI*2*el);g.stroke();g.restore();
    g.font=`700 22px ${FONT_M}`;g.fillStyle='#9fb0e8';g.textAlign='left';g.fillText('TIEMPO DE CAÍDA',-350,22);g.font=`700 70px ${FONT_M}`;g.lineWidth=10;g.strokeStyle=INK;const mm=Math.floor(secs/60),ss_=String(secs%60).padStart(2,'0');g.strokeText(`${mm}:${ss_}`,-350,86);g.fillStyle='#eaf1ff';g.fillText(`${mm}:${ss_}`,-350,86);g.font=`700 24px ${FONT_M}`;g.fillStyle='#9fb0e8';g.fillText('min : s',-130,94);}
  g.restore();}
// ---- S6: Vesna (sepia news card + snowy wreck) ----
let PORTRAIT=null;
function bgS6(g,t){const u=t-ST[6];
  g.fillStyle=lin(g,0,0,0,H,[[0,'#b8c8d8'],[.6,'#e6eef4'],[1,'#f6fafc']]);g.fillRect(-100,-100,W+200,H+200);
  for(const [x,h,c] of [[120,420,'#9db0c4'],[480,560,'#8aa0b8'],[860,460,'#9db0c4']]){g.beginPath();g.moveTo(x-420,1200);g.lineTo(x,1200-h);g.lineTo(x+420,1200);g.closePath();inkS(g,c,7);g.beginPath();g.moveTo(x-90,1200-h+120);g.lineTo(x,1200-h);g.lineTo(x+90,1200-h+120);g.lineTo(x+40,1200-h+150);g.lineTo(x,1200-h+90);g.lineTo(x-40,1200-h+150);g.closePath();inkS(g,'#fff',5);}
  g.beginPath();g.moveTo(-100,1040);g.bezierCurveTo(240,960,560,1100,1200,980);g.lineTo(1200,H);g.lineTo(-100,H);g.closePath();inkS(g,lin(g,0,960,0,H,[[0,'#ffffff'],[1,'#c4d6e8']]),8);
  for(let i=0;i<16;i++){const x=rng(i)*1200-60,y=1100+rng(i+7)*420,s=.5+rng(i+3)*.9;g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(0,-130);g.lineTo(46,-30);g.lineTo(24,-30);g.lineTo(60,50);g.lineTo(-60,50);g.lineTo(-24,-30);g.lineTo(-46,-30);g.closePath();inkS(g,'#1f6a46',6);g.restore();}
  // wreck: tail section lying in the snow
  g.save();g.translate(560,1290);g.rotate(-.12);g.beginPath();g.moveTo(-250,-40);g.lineTo(200,-90);g.lineTo(260,-10);g.lineTo(200,70);g.lineTo(-250,70);g.closePath();inkS(g,lin(g,0,-90,0,70,[[0,'#ffffff'],[1,'#c4d0e4']]),8);g.beginPath();g.moveTo(-250,-40);g.lineTo(-300,-250);g.lineTo(-170,-250);g.lineTo(-100,-60);g.closePath();inkS(g,'#d83a3a',7);
  for(let i=0;i<6;i++){g.beginPath();g.roundRect(-190+i*58,-34,22,28,8);inkS(g,'#7fc4ff',3);}g.restore();
  g.save();g.strokeStyle='rgba(90,90,100,.55)';g.lineWidth=22;g.lineCap='round';for(let i=0;i<3;i++){const ph=((t*.25+i*.33)%1);g.globalAlpha=(1-ph)*.7;g.beginPath();g.moveTo(520+i*30,1210);g.bezierCurveTo(500+i*20+Math.sin(t*2+i)*30,1100-ph*100,560,1010-ph*140,520+Math.sin(t+i)*40,930-ph*200);g.stroke();}g.restore();
  // card
  const k=eob(clamp((u-.15)/.6),1.1);g.save();g.translate(540,725);g.rotate(-.02);g.scale(k,k);g.shadowColor='rgba(40,20,0,.5)';g.shadowBlur=40;g.shadowOffsetY=22;g.beginPath();g.roundRect(-400,-200,800,400,22);inkS(g,lin(g,0,-200,0,200,[[0,'#f5ecd2'],[1,'#e2d1a8']]),9);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  g.save();g.beginPath();g.roundRect(-400,-200,800,400,22);g.clip();hatch(g,()=>{g.beginPath();g.rect(-400,-200,800,400);},.5,10,.06,'#6a4a20');g.restore();
  // portrait frame
  g.beginPath();g.roundRect(-370,-168,250,336,14);inkS(g,'#e8dcc0',7);g.save();g.beginPath();g.roundRect(-362,-160,234,320,10);g.clip();g.fillStyle=lin(g,0,-160,0,160,[[0,'#9db8d0'],[1,'#d0dce8']]);g.fillRect(-362,-160,234,320);if(PORTRAIT)g.drawImage(PORTRAIT,-396,-120,360,432);g.restore();
  g.fillStyle='#2a1c10';g.textAlign='left';g.textBaseline='middle';g.font=`900 40px ${FONT_S}`;g.fillText('VESNA VULOVIĆ',-90,-140);g.font=`700 22px ${FONT_M}`;g.fillStyle='#6a4a30';g.fillText('AZAFATA · ENERO DE 1972',-90,-100);g.fillStyle=INK;g.fillRect(-90,-80,450,4);
  const hm=Math.round(10160*eio(clamp((t-T.mil+.3)/1.4)));g.font=`700 92px ${FONT_M}`;g.fillStyle='#8a1f2a';g.lineWidth=9;g.strokeStyle='rgba(42,28,16,.9)';g.strokeText(String(hm).replace(/\B(?=(\d{3})+(?!\d))/g,' '),-90,-6);g.fillText(String(hm).replace(/\B(?=(\d{3})+(?!\d))/g,' '),-90,-6);
  g.font=`700 28px ${FONT_M}`;g.fillStyle='#3a2a1a';g.fillText('METROS DE CAÍDA',-90,56);
  const kb=eob(clamp((t-T.sobre)/.5),1.4);g.save();g.translate(-5,205);g.scale(kb,kb);g.globalAlpha=Math.min(1,kb*2);g.beginPath();g.roundRect(-280,-34,560,68,16);inkS(g,'#1f9a4a',6);g.fillStyle='#fff';g.font=`800 32px ${FONT_D}`;g.textAlign='center';g.fillText('SOBREVIVIÓ · 27 DÍAS EN COMA',0,2);g.restore();
  g.restore();}
// ---- S7: Mariana teaser (submersible window) ----
function bgS7(g,t){const u=t-ST[7];
  g.fillStyle=lin(g,0,0,0,H,[[0,'#0e5a8a'],[.35,'#0a2f66'],[.7,'#050f30'],[1,'#02061a']]);g.fillRect(-100,-100,W+200,H+200);
  g.save();g.globalCompositeOperation='screen';for(let i=0;i<7;i++){const x=120+i*150+Math.sin(t*.4+i)*40;g.fillStyle=lin(g,x,0,x+120,900,[[0,'rgba(120,200,255,.20)'],[1,'rgba(120,200,255,0)']]);g.beginPath();g.moveTo(x,0);g.lineTo(x+70,0);g.lineTo(x+260,900);g.lineTo(x+90,900);g.closePath();g.fill();}g.restore();
  for(let i=0;i<46;i++){const ph=((t*.12+rng(i)*3)%1),x=rng(i+3)*W+Math.sin(t*1.3+i)*18,y=1500-ph*1500,r=3+rng(i+7)*9;g.globalAlpha=.55*Math.sin(ph*Math.PI);g.strokeStyle='#bfe6ff';g.lineWidth=2.5;g.beginPath();g.arc(x,y,r,0,7);g.stroke();}g.globalAlpha=1;
  // jellyfish
  for(const [x,y,s,ph] of [[150,1060,1,0],[930,1010,.8,2],[820,1170,.6,4]]){const yy=y+Math.sin(t*.9+ph)*30;g.save();g.translate(x,yy);g.scale(s,s);glow(g,0,0,160,'#7aa8ff',.28);g.beginPath();g.moveTo(-70,10);g.bezierCurveTo(-70,-80,70,-80,70,10);g.quadraticCurveTo(0,26,-70,10);g.closePath();inkS(g,'rgba(160,190,255,.85)',6);g.strokeStyle='rgba(170,200,255,.8)';g.lineWidth=7;g.lineCap='round';for(let i=0;i<6;i++){g.beginPath();g.moveTo(-54+i*21,16);g.bezierCurveTo(-54+i*21+Math.sin(t*2+i)*14,70,-54+i*21-Math.sin(t*2+i)*14,110,-54+i*21,150);g.stroke();}g.restore();}
  // depth readout
  const dp=Math.round(11034*eio(clamp((t-T.sig+.4)/3.6)));g.save();g.translate(540,868);g.beginPath();g.roundRect(-210,-38,420,76,20);inkS(g,'rgba(8,16,40,.85)',7);g.fillStyle='#7ae0ff';g.font=`700 56px ${FONT_M}`;g.textAlign='center';g.textBaseline='middle';g.fillText(`${String(dp).replace(/\B(?=(\d{3})+(?!\d))/g,' ')} m`,0,4);g.restore();}
