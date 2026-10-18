// ===================== timeline helpers =====================
let TLD=null;const ST=[],ENDS=[];let TOTAL=0,SEGS=[],NS=0;
function initTimeline(d){TLD=d;ST.push(...d.starts);TOTAL=d.total;SEGS=d.segs;NS=ST.length;for(let i=0;i<NS;i++)ENDS.push(i<NS-1?ST[i+1]:TOTAL);}
const sceneAt=t=>{for(let i=0;i<NS;i++)if(t<ENDS[i])return i;return NS-1;};
const wordT=(seg,key)=>{for(const w of SEGS[seg].words)if(w[0].toLowerCase().includes(key))return ST[seg]+w[1];return ST[seg]+.5;};
let T={};function initWords(){T={once:wordT(0,'once'),cosas:wordT(0,'cosas'),h24:wordT(1,'veinticuatro'),atenc:wordT(1,'atención'),alc:wordT(1,'alcohol'),tres:wordT(2,'tres'),aluc:wordT(2,'alucinaciones'),ves:wordT(2,'ves'),desc:wordT(2,'desconfías'),
  apaga:wordT(3,'apaga'),micro:wordT(3,'microsue'),pill:wordT(3,'pillarte'),y64:wordT(4,'sesenta'),randy:wordT(4,'randy'),aguant:wordT(4,'aguantó'),despi:wordT(4,'despierto'),habl:wordT(4,'hablaba'),recor:wordT(4,'recordaba'),
  durm:wordT(5,'durmió'),cat:wordT(5,'catorce'),recup:wordT(5,'recuperó'),ojo:wordT(6,'ojo'),intent:wordT(6,'intentes'),cor:wordT(6,'corazón'),mente:wordT(6,'mente'),entie:wordT(7,'entierran')};}
// ===================== S0: hook =====================
function drawS0(g,t){const u=t-ST[0];const sp=clamp((u-1.35)/1.25);const spin=sp*(1-sp)*4*40+sp*8; // hands race during 'once días'
  const hrs=sp<1?sp*14*12/12*12:0,mins=u<1.35?0:(sp<1?sp*3000:0);
  const k=eob(clamp(u/.6),1.2);g.save();g.translate(540,690);g.scale(k,k);g.translate(-540,-690);
  drawWallClock(g,540,690,128,(sp<1?sp*30:0),(sp<1?sp*1500:0),t);
  g.restore();
  if(t>T.cosas-.2){const a=ss(T.cosas-.2,T.cosas+.5,t);drawGhost(g,150,860,.62,t,a*.85,1);drawGhost(g,950,820,.55,t,a*.85,4);drawGhost(g,820,700,.4,t,a*.6,7);}
}
// ===================== S1: 24 hours =====================
function drawS1(g,t){const u=t-ST[1],k=eob(clamp(u/.6),1.2);
  g.save();g.translate(540,720);g.scale(k,k);
  const w=860,h=420;g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=40;g.shadowOffsetY=22;g.beginPath();g.roundRect(-w/2,-h/2,w,h,46);inkS(g,lin(g,0,-h/2,0,h/2,[[0,'#2f2f6e'],[1,'#1c1b48']]),10);g.shadowColor='transparent';
  const P=()=>{g.beginPath();g.roundRect(-w/2,-h/2,w,h,46);};hatch(g,P,.7,16,.1,'#fff');
  const prog=clamp((u-.4)/(T.atenc-ST[1]+.2));const hh=Math.min(24,Math.floor(prog*24));
  g.fillStyle='#8fb0ff';g.font=`700 34px ${FONT_M}`;g.textAlign='left';g.textBaseline='middle';g.fillText('SIN DORMIR',-w/2+50,-h/2+56);
  const txt=String(hh).padStart(2,'0')+':'+String(Math.floor((prog*24*60)%60)).padStart(2,'0')+':'+String(Math.floor((prog*24*3600)%60)).padStart(2,'0');
  g.font=`700 150px ${FONT_M}`;g.textAlign='center';g.fillStyle='#fff';g.lineWidth=14;g.strokeStyle=INK;g.strokeText(txt,0,10);g.fillStyle=prog>.99?'#ffd166':'#eaf1ff';g.fillText(txt,0,10);
  // focus meter (attention) falls
  const mx=-w/2+50,my=h/2-70,mw=w-100;g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.roundRect(mx,my,mw,22,11);g.fill();
  const att=1-ss(T.atenc,T.alc+.3,t)*.75;g.fillStyle=att>.5?'#3ee0a0':att>.3?'#ffd166':'#ff5d6c';g.beginPath();g.roundRect(mx,my,mw*att,22,11);g.fill();
  g.fillStyle='#9fb0e8';g.font=`700 26px ${FONT_D}`;g.textAlign='left';g.fillText('ATENCIÓN',mx,my-24);
  g.restore();
  // dizzy stars orbiting
  const dz=ss(T.alc-.3,T.alc+.4,t);if(dz>0){for(let i=0;i<5;i++){const a=t*4+i*1.256;const x=540+Math.cos(a)*230,y=1010+Math.sin(a)*38;g.save();g.translate(x,y);g.rotate(t*3+i);g.globalAlpha=dz;g.beginPath();for(let j=0;j<10;j++){const r=j%2?9:22,an=j*Math.PI/5;g.lineTo(Math.cos(an)*r,Math.sin(an)*r);}g.closePath();inkS(g,'#ffd166',4);g.restore();}}
}
// ===================== S2: hallucinations =====================
function drawS2(g,t){const u=t-ST[2];
  const k=eob(clamp(u/.5),1.3);g.save();g.translate(540,700);g.scale(k,k);
  // calendar flip card "DÍA 3"
  g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=30;g.shadowOffsetY=18;g.beginPath();g.roundRect(-200,-170,400,340,36);inkS(g,'#fff7e8',9);g.shadowColor='transparent';
  g.beginPath();g.roundRect(-200,-170,400,92,36);g.rect(-200,-120,400,42);inkS(g,'#ff4a6a',9);g.fillStyle='#fff';g.font=`900 44px ${FONT_D}`;g.textAlign='center';g.textBaseline='middle';g.fillText('DÍA',0,-124);
  const dn=Math.min(3,1+Math.floor(clamp((t-T.tres)/.9)*3));g.font=`900 190px ${FONT_D}`;g.lineWidth=14;g.strokeStyle=INK;g.strokeText(String(dn),0,28);g.fillStyle='#1c1738';g.fillText(String(dn),0,28);
  g.restore();
  const ga=ss(T.aluc-.2,T.aluc+.7,t);
  if(ga>0){drawGhost(g,170,880,.7,t,ga*.9,2);drawGhost(g,925,860,.62,t,ga*.9,5);drawGhost(g,720,640,.38,t,ga*.6,9);
    // floating eyes in the dark
    for(let i=0;i<9;i++){const x=80+rng(i*3)*920,y=520+rng(i*3+1)*420,bl=Math.abs(Math.sin(t*1.1+i));g.save();g.globalAlpha=ga*(.5+.4*Math.sin(t+i));g.translate(x,y);glow(g,0,0,40,'#9a6bff',.5);g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,15,13*bl+2,0,0,7);g.fill();g.fillStyle=INK;g.beginPath();g.arc((540-x)*.012,0,5,0,7);g.fill();g.restore();}}
}
// ===================== S3: micro-sleeps =====================
function drawS3(g,t){const u=t-ST[3];const k=eob(clamp(u/.5),1.2);
  g.save();g.translate(540,700);g.scale(k,k);drawBrain(g,0,0,2.0,'#ff9bb8',Math.sin(t*6)*.5);
  const off=((Math.sin(t*2.4)>.35)||(Math.sin(t*5.3+2)>.7));const q=off?1:0;
  g.fillStyle=`rgba(10,8,30,${.62*q})`;g.beginPath();g.ellipse(0,0,200,160,0,0,7);g.fill();
  if(q){g.strokeStyle='#ff7a8a';g.lineWidth=14;g.lineCap='round';g.beginPath();g.arc(0,12,52,-Math.PI*.35,Math.PI*1.35);g.stroke();g.beginPath();g.moveTo(0,-62);g.lineTo(0,-10);g.stroke();}
  g.restore();
  for(let i=0;i<4;i++){const ph=((t*.6+i*.27)%1);drawZ(g,780+i*40+Math.sin(t*2+i)*14,640-ph*240,40+i*18,(1-ph)*(1-ph),.2*Math.sin(t+i));}
}
// ===================== S4: 1964 =====================
function drawS4(g,t){const u=t-ST[4];const k=eob(clamp((u-.5)/.7),1.1);if(k<=.01)return;
  g.save();g.translate(540,700);g.rotate(-.025);g.scale(k,k);
  g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=44;g.shadowOffsetY=24;g.beginPath();g.roundRect(-440,-250,880,500,18);inkS(g,lin(g,0,-250,0,250,[[0,'#f5ecd2'],[1,'#e2d1a8']]),9);g.shadowColor='transparent';
  const P=()=>{g.beginPath();g.roundRect(-440,-250,880,500,18);};hatch(g,P,.5,10,.06,'#6a4a20');
  g.fillStyle='#2a1c10';g.font=`900 66px ${FONT_S}`;g.textAlign='left';g.textBaseline='middle';g.fillText('ESTUDIANTE AGUANTA',-408,-196);g.fillText('11 DÍAS SIN DORMIR',-408,-128);
  g.fillStyle='#2a1c10';g.fillRect(-408,-84,816,5);g.fillRect(-408,-74,816,2);
  g.fillStyle='#6a4a30';g.font=`700 24px ${FONT_M}`;g.fillText('SAN DIEGO · DICIEMBRE 1963 — ENERO 1964',-408,-46);
  // calendar grid of 11 days
  const dayN=Math.min(11,Math.floor(clamp((t-T.aguant)/(T.despi-T.aguant+.6))*11)+(t>T.aguant?1:0));
  for(let i=0;i<11;i++){const cx=-390+(i%6)*88,cy=16+Math.floor(i/6)*96;g.beginPath();g.roundRect(cx,cy,78,84,10);inkS(g,'#fffaf0',5);g.fillStyle='#3a2a1a';g.font=`900 40px ${FONT_D}`;g.textAlign='center';g.fillText(String(i+1),cx+39,cy+46);
    if(i<dayN){const a=eob(clamp((t-T.aguant-i*.26)/.25),1.6);g.save();g.translate(cx+39,cy+42);g.scale(a,a);g.strokeStyle='#d42a3a';g.lineWidth=11;g.lineCap='round';g.beginPath();g.moveTo(-26,-26);g.lineTo(26,26);g.moveTo(26,-26);g.lineTo(-26,26);g.stroke();g.restore();}}
  // big counter
  const hrs=Math.round(264*clamp((t-T.aguant)/(T.despi-T.aguant+.5)));g.textAlign='center';g.fillStyle='#8a1f2a';g.font=`700 120px ${FONT_M}`;g.lineWidth=10;g.strokeStyle='rgba(42,28,16,.9)';g.save();g.translate(250,40);g.strokeText(String(hrs),0,0);g.fillText(String(hrs),0,0);g.restore();
  g.fillStyle='#3a2a1a';g.font=`700 34px ${FONT_M}`;g.fillText('HORAS',250,130);
  // pin
  g.beginPath();g.arc(0,-250,16,0,7);inkS(g,'#d42a3a',5);g.restore();
  // slurred speech bubble
  const sb=ss(T.habl-.1,T.habl+.5,t)*(1-ss(T.recor+1.4,T.recor+1.8,t));
  if(sb>0){g.save();g.translate(800,1000);g.globalAlpha=sb;g.rotate(.04);g.beginPath();g.roundRect(-210,-80,420,150,40);g.moveTo(-60,70);g.lineTo(-100,120);g.lineTo(-20,70);inkS(g,'#fff',8);g.fillStyle=INK;g.font=`800 44px ${FONT_D}`;g.textAlign='center';g.textBaseline='middle';
    const msg='mmm…  pal…a…bras',gx=-190;let x=gx;for(let i=0;i<msg.length;i++){const ch=msg[i];const w=g.measureText(ch).width;g.fillText(ch,x+w/2,Math.sin(t*5+i*.7)*8-4+Math.sin(i)*6);x+=w+1;}g.restore();}
  // fading memory photos
  const mf=ss(T.recor-.1,T.recor+.4,t);if(mf>0){for(let i=0;i<4;i++){const x=120+i*80,y=610+i*20,a=mf*(1-ss(T.recor+.5+i*.2,T.recor+1.1+i*.2,t));if(a<=0)continue;g.save();g.globalAlpha=a;g.translate(x,y-Math.sin(t*2+i)*8);g.rotate(-.2+i*.12);g.beginPath();g.rect(-40,-48,80,96);inkS(g,'#fff7e8',5);g.fillStyle='#8a7a6a';g.fillRect(-32,-40,64,60);txtInk(g,'?',0,34,36,'#ff5d6c',{stroke:5});g.restore();}}
}
// ===================== S5: sleep =====================
function drawS5Back(g,t){const u=t-ST[5];g.save();g.beginPath();g.ellipse(540,1180,430,230,0,0,7);inkS(g,lin(g,0,950,0,1400,[[0,'#ffffff'],[1,'#cfd6f4']]),10);
  g.strokeStyle='rgba(60,70,140,.25)';g.lineWidth=5;g.beginPath();g.moveTo(240,1150);g.quadraticCurveTo(300,1100,420,1120);g.moveTo(700,1130);g.quadraticCurveTo(820,1100,880,1170);g.stroke();g.restore();}
function drawS5Front(g,t){const u=t-ST[5];
  g.save();const by=1470;g.beginPath();g.moveTo(-40,by+10);g.bezierCurveTo(200,by-60,400,by+40,540,by-10);g.bezierCurveTo(700,by-70,900,by,1120,by-30);g.lineTo(1120,H+40);g.lineTo(-40,H+40);g.closePath();inkS(g,lin(g,0,by,0,H,[[0,'#6b5be0'],[1,'#4a3bb0']]),10);
  const P=()=>{g.beginPath();g.moveTo(-40,by+10);g.bezierCurveTo(200,by-60,400,by+40,540,by-10);g.bezierCurveTo(700,by-70,900,by,1120,by-30);g.lineTo(1120,H+40);g.lineTo(-40,H+40);g.closePath();};
  hatch(g,P,.9,16,.12,'#fff');g.save();P();g.clip();g.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<22;i++){const x=40+(i%6)*190+(Math.floor(i/6)%2)*95,y=by+90+Math.floor(i/6)*120;g.save();g.translate(x,y);g.beginPath();for(let j=0;j<10;j++){const r=j%2?7:17,an=j*Math.PI/5-Math.PI/2;g.lineTo(Math.cos(an)*r,Math.sin(an)*r);}g.closePath();g.fill();g.restore();}g.restore();
  g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=6;g.beginPath();g.moveTo(0,by+36);g.bezierCurveTo(220,by-30,400,by+60,540,by+14);g.bezierCurveTo(700,by-40,900,by+20,1100,by-8);g.stroke();g.restore();
  const asleep=t<T.recup;if(asleep){for(let i=0;i<3;i++){const ph=((t*.45+i*.33)%1);drawZ(g,720+i*60+Math.sin(t*2+i)*10,1050-ph*260,48+i*20,(1-ph),.18*Math.sin(t+i));}}
}
// ===================== S6: warning =====================
function drawS6(g,t){const u=t-ST[6];const k=eob(clamp(u/.5),1.2);const beat=Math.max(0,Math.sin(t*(t>T.mente?3.0:5.2)*Math.PI*.9))**6;
  g.save();g.translate(540,700);g.scale(k,k);
  const a=ss(T.cor-.3,T.cor+.3,t),b=ss(T.mente-.3,T.mente+.3,t);
  const lx=-250,rx=250;g.save();g.globalAlpha=1;drawHeart(g,lx,10,1.2,beat,'#ff3d63');g.restore();
  drawBrain(g,rx,-6,1.15,'#ff9bb8',beat*.6);
  // ECG
  g.save();g.translate(0,190);g.beginPath();g.roundRect(-410,-70,820,140,28);inkS(g,'#0e1a22',8);g.strokeStyle='#3effa0';g.lineWidth=7;g.lineCap='round';g.lineJoin='round';g.shadowColor='#3effa0';g.shadowBlur=18;g.beginPath();
  const N=60;for(let i=0;i<=N;i++){const x=-380+i*(760/N),ph=((i/N)*3+t*.9)%1;let y=0;if(ph>.40&&ph<.46)y=-20;else if(ph>=.46&&ph<.5)y=-76*(1-(ph-.46)/.04*1.0)*(1);else if(ph>=.5&&ph<.54)y=50*((ph-.5)/.04);else if(ph>=.54&&ph<.58)y=50*(1-(ph-.54)/.04);if(t>T.mente)y*=1-ss(T.mente,T.mente+3,t)*.8;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.restore();
  g.restore();
  // warning triangle pulsing
  const w=ss(T.ojo-.1,T.ojo+.3,t);if(w>0){g.save();g.translate(540,505);g.scale(.9+beat*.08,.9+beat*.08);g.globalAlpha=w;g.beginPath();g.moveTo(0,-70);g.lineTo(78,64);g.lineTo(-78,64);g.closePath();inkS(g,'#ffd23f',9);txtInk(g,'!',0,10,92,INK,{stroke:0});g.restore();}
}
