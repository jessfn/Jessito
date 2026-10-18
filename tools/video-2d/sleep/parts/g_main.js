// ===================== S7 backdrop =====================
function drawS7(g,t){const u=t-ST[7];
  g.fillStyle=lin(g,0,0,0,H,[[0,'#07062a'],[.5,'#2c1458'],[.7,'#5a2a6a'],[1,'#120a2a']]);g.fillRect(0,0,W,H);
  g.fillStyle='#fff';for(let i=0;i<60;i++){g.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.3+i));g.beginPath();g.arc(rng(i)*W,200+rng(i+9)*700,1+rng(i+4)*1.8,0,7);g.fill();}g.globalAlpha=1;
  drawMoon(g,800,640,120,1);
  // hills + tombstones + dead tree
  g.beginPath();g.moveTo(0,1000);g.bezierCurveTo(260,930,420,1040,640,980);g.bezierCurveTo(820,940,960,1000,1080,960);g.lineTo(1080,H);g.lineTo(0,H);g.closePath();inkS(g,lin(g,0,940,0,1300,[[0,'#2a1f4a'],[1,'#120c28']]),9);
  for(const [x,y,s,r] of [[420,1000,.8,.05],[760,990,1,.04],[930,1010,.9,-.05],[1040,985,.7,.06]]){g.save();g.translate(x,y);g.rotate(r);g.scale(s,s);g.beginPath();g.moveTo(-46,70);g.lineTo(-46,-30);g.quadraticCurveTo(0,-90,46,-30);g.lineTo(46,70);g.closePath();inkS(g,'#4a4a6a',7);g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=5;g.beginPath();g.moveTo(-16,-8);g.lineTo(16,-8);g.moveTo(0,-26);g.lineTo(0,26);g.stroke();g.restore();}
  g.save();g.translate(1000,860);g.strokeStyle=INK;g.lineCap='round';g.lineWidth=18;g.beginPath();g.moveTo(0,140);g.quadraticCurveTo(-10,40,10,-60);g.stroke();g.lineWidth=11;for(const [a,b,c,d] of [[8,-40,-80,-90],[10,-20,90,-70],[0,30,-70,0],[4,-60,40,-130]]){g.beginPath();g.moveTo(a,b);g.quadraticCurveTo((a+c)/2,b-30,c,d);g.stroke();}g.restore();
  // coffin with lid ajar + eyes
  g.save();g.translate(215,880);g.rotate(-.12);const k=eob(clamp((u-1.2)/.8),1.3);g.scale(k*1.25,k*1.25);
  shadowEll(g,0,150,200,28,.45);
  g.beginPath();g.moveTo(-70,-130);g.lineTo(70,-130);g.lineTo(130,-20);g.lineTo(80,140);g.lineTo(-80,140);g.lineTo(-130,-20);g.closePath();inkS(g,lin(g,-130,0,130,0,[[0,'#8a5a34'],[.5,'#a8723c'],[1,'#6a4224']]),10);
  g.fillStyle='#050414';g.beginPath();g.moveTo(-50,-116);g.lineTo(50,-116);g.lineTo(100,-18);g.lineTo(-100,-18);g.closePath();g.fill();
  const ex=Math.abs(Math.sin(t*1.2))>.12?1:.1;glow(g,-26,-70,50,'#7aff9a',.7);glow(g,26,-70,50,'#7aff9a',.7);g.fillStyle='#d6ffe0';g.beginPath();g.ellipse(-26,-70,13,16*ex,0,0,7);g.ellipse(26,-70,13,16*ex,0,0,7);g.fill();
  g.save();g.translate(0,-10);g.rotate(-.06);g.beginPath();g.moveTo(-76,-28);g.lineTo(76,-28);g.lineTo(122,22);g.lineTo(-122,22);g.closePath();inkS(g,'#b27a44',9);g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=4;g.beginPath();g.moveTo(-70,-8);g.lineTo(70,-8);g.stroke();g.restore();
  g.restore();
  // bats
  for(let i=0;i<5;i++){const ph=t*.5+i*1.7,x=((ph*140+i*230)%1500)-200,y=480+Math.sin(ph*2+i)*70+i*40,fl=Math.sin(t*14+i);g.save();g.translate(x,y);g.scale(.8+.3*rng(i),.8+.3*rng(i));g.fillStyle='#0c0820';g.strokeStyle='#8a6aff';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-30,-26*fl-8,-64,-6);g.quadraticCurveTo(-46,6,-34,2);g.quadraticCurveTo(-24,16,-12,6);g.quadraticCurveTo(0,20,0,6);g.quadraticCurveTo(0,20,12,6);g.quadraticCurveTo(24,16,34,2);g.quadraticCurveTo(46,6,64,-6);g.quadraticCurveTo(30,-26*fl-8,0,0);g.closePath();g.fill();g.stroke();g.restore();}
  // fog
  g.save();g.globalCompositeOperation='screen';for(let i=0;i<6;i++){const x=((i*260+t*20)%1500)-200;g.fillStyle=rad(g,x,1080+Math.sin(i)*30,0,300,[[0,'#8a7acc',.16],[1,'#8a7acc',0]]);g.fillRect(x-300,900,600,400);}g.restore();
}
// ===================== frame =====================
let CV,G,POST,POSTG,CH,CHG,FULL,FULLG,GRAIN=[],KFE=[];const PUNCH=[];
FACE.sleepy=['Tired','Solemn'];FACE.sleep=['EyesClosed','EyesClosed'];FACE.solemn=['Solemn','Tired'];
const BODIES=['ButtonShirt','Coffee','Hoodie','ButtonShirt','Hoodie','ButtonShirt','Hoodie','Coffee'];
const TIRED=[.12,.42,.68,.85,1,.45,.85,.2];
function initMain(){
  KFE=[[0,'calm'],[T.once-.15,'curious'],[T.once+.25,'shock'],[T.cosas-.3,'sleepy'],[T.cosas+.2,'fear'],
   [ST[1]+.15,'sleepy'],[T.atenc,'strain'],[T.alc-.1,'sleepy'],[T.alc+.3,'blank'],
   [ST[2]+.2,'curious'],[T.aluc+.2,'fear'],[T.ves+.2,'hectic'],[T.desc-.1,'strain'],
   [ST[3]+.2,'sleepy'],[T.pill-.3,'fear'],
   [ST[4]+.2,'curious'],[T.aguant,'strain'],[T.habl,'resign'],[T.recor-.1,'blank'],
   [ST[5],'sleep'],[T.recup-.1,'sleep'],[T.recup+.1,'happy'],
   [ST[6],'solemn'],[T.ojo,'fear'],[T.cor,'strain'],[T.mente+1,'resign'],
   [ST[7],'happy'],[T.entie-.15,'curious'],[T.entie+.3,'wink'],[ST[7]+4.8,'laugh']];
  PUNCH.push(T.once,T.cosas,ST[1],T.alc,ST[2],T.aluc,T.desc,ST[3],T.pill,ST[4],T.aguant,ST[5],T.recup,ST[6],T.ojo,T.cor,ST[7],T.entie);
  CV=document.getElementById('c');G=CV.getContext('2d');POST=offscreen(W/6,H/6);POSTG=POST.getContext('2d');CH=offscreen(W,H);CHG=CH.getContext('2d');FULL=offscreen(W,H);FULLG=FULL.getContext('2d');
  for(let i=0;i<6;i++){const c=offscreen(256,256),g=c.getContext('2d'),d=g.createImageData(256,256);for(let k=0;k<d.data.length;k+=4){const v=128+(rng(k*.37+i*911)-.5)*140;d.data[k]=d.data[k+1]=d.data[k+2]=v;d.data[k+3]=255;}g.putImageData(d,0,0);GRAIN.push(c);}
  buildRoom();
}
const CAMS={x:0};
function warp(g,amp,fr,t,hs=10){FULLG.globalCompositeOperation='copy';FULLG.drawImage(CV,0,0);g.clearRect(0,0,W,H);for(let y=0;y<H;y+=hs){const dx=amp*Math.sin(y*fr+t*3.1)+amp*.5*Math.sin(y*fr*2.7-t*2);g.drawImage(FULL,0,y,W,hs,dx-14,y,W+28,hs);}}
function lids(g,a){if(a<=.001)return;const e=a*H*.5;g.save();g.fillStyle='#0b0820';g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W,e-60*a);g.quadraticCurveTo(W/2,e+120*a,0,e-60*a);g.closePath();g.fill();g.beginPath();g.moveTo(0,H);g.lineTo(W,H);g.lineTo(W,H-e+60*a);g.quadraticCurveTo(W/2,H-e-120*a,0,H-e+60*a);g.closePath();g.fill();
  g.strokeStyle='#3a2e66';g.lineWidth=10;g.beginPath();g.moveTo(0,e-60*a);g.quadraticCurveTo(W/2,e+120*a,W,e-60*a);g.stroke();g.beginPath();g.moveTo(0,H-e+60*a);g.quadraticCurveTo(W/2,H-e-120*a,W,H-e+60*a);g.stroke();g.restore();}
function transition(g,b,d){const type=[0,'clock','glitch','lids','page','iris','flash','clock'][b];
  if(type==='clock'){const cover=d<0?ss(-.34,0,d):1-ss(0,.34,d);if(cover<=0)return;let a0,a1;if(d<0){a0=-Math.PI/2;a1=a0+cover*Math.PI*2;}else{a0=-Math.PI/2+(1-cover)*Math.PI*2;a1=-Math.PI/2+Math.PI*2;}
    g.save();g.beginPath();g.moveTo(540,960);g.arc(540,960,1500,a0,a1);g.closePath();g.fillStyle=lin(g,0,0,W,H,[[0,'#1d1b55'],[1,'#0c0a2e']]);g.fill();g.lineWidth=14;g.strokeStyle=INK;g.stroke();
    const ea=d<0?a1:a0;g.strokeStyle='#ffd166';g.lineWidth=10;g.beginPath();g.moveTo(540,960);g.lineTo(540+Math.cos(ea)*1500,960+Math.sin(ea)*1500);g.stroke();
    g.restore();}
  else if(type==='glitch'){const m=1-Math.abs(d)/.34;if(m<=0)return;FULLG.globalCompositeOperation='copy';FULLG.drawImage(CV,0,0);
    for(let i=0;i<22;i++){const y=rng(i*7+Math.floor(d*30))*H,h=20+rng(i+3)*120,dx=(rng(i*3+Math.floor(d*40))-.5)*260*m;g.drawImage(FULL,0,y,W,h,dx,y,W,h);}
    g.save();g.globalCompositeOperation='screen';for(let i=0;i<8;i++){g.fillStyle=rng(i+Math.floor(d*30))>.5?`rgba(255,40,140,${.35*m})`:`rgba(40,230,255,${.35*m})`;g.fillRect(0,rng(i*5+Math.floor(d*30))*H,W,8+rng(i)*50);}g.restore();
    if(Math.abs(d)<.1){g.fillStyle=`rgba(8,6,30,${1-Math.abs(d)/.1})`;g.fillRect(0,0,W,H);}}
  else if(type==='lids'){const a=d<0?ss(-.3,0,d):1-ss(0,.3,d);lids(g,a);}
  else if(type==='page'){const p=ss(-.36,0,d)+ss(0,.36,d);const l=W*(1-p),r=W*(2-p);if(r<=0||l>=W)return;g.save();g.beginPath();g.rect(Math.max(0,l),0,Math.min(W,r)-Math.max(0,l),H);g.clip();
    g.fillStyle=lin(g,l,0,r,0,[[0,'#fffaf0'],[.9,'#efe2c4'],[1,'#d8c8a0']]);g.fillRect(l,0,r-l,H);g.fillStyle=lin(g,l-90,0,l,0,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);g.fillRect(l-90,0,90,H);g.restore();g.fillStyle=lin(g,l-110,0,l,0,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);g.fillRect(Math.max(0,l-110),0,110,H);}
  else if(type==='iris'){const p=d<0?ss(-.34,0,d):1-ss(0,.34,d);if(p<=0)return;const r=(1-p)*1500;g.save();g.beginPath();g.rect(0,0,W,H);g.arc(540,960,Math.max(1,r),0,Math.PI*2,true);g.fillStyle='#0b0820';g.fill('evenodd');g.beginPath();g.arc(540,960,Math.max(1,r),0,Math.PI*2);g.lineWidth=14;g.strokeStyle='#3a2e66';g.stroke();g.restore();}
  else if(type==='flash'){const m=Math.max(0,1-Math.abs(d)/.3);if(m<=0)return;g.save();g.fillStyle=`rgba(255,40,70,${.85*m})`;g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,255,255,${.5*Math.max(0,1-Math.abs(d)/.08)})`;g.fillRect(0,0,W,H);g.restore();}
}
function frame(t){
  const g=G;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';
  const si=sceneAt(t),u=t-ST[si],dur=ENDS[si]-ST[si],uk=u/dur;
  let shake=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.5)shake+=Math.exp(-a*9);}
  let tz=0;for(let b=1;b<NS;b++){const d=t-ST[b];if(d<0&&d>-.4)tz+=.1*ss(-.4,0,d)**2;else if(d>=0&&d<.5)tz+=.1*(1-ss(0,.5,d))**2;}
  const Z=1+tz+.04*uk;const sx=Math.sin(t*61)*5*shake,sy=Math.cos(t*53)*4*shake;
  g.save();g.translate(540+sx,1100+sy);g.scale(Z,Z);g.translate(-540,-1100);CAMS.x=Math.sin(t*.35)*40+u*(si%2?8:-8);
  // ---- background ----
  let tod=0,tint=null,blur=0,screen=1;
  if(si===0){const sp=clamp((u-1.35)/1.25);tod=sp<1?sp*3:0;}
  else if(si===1)tod=.3+clamp((u-.4)/(T.atenc-ST[1]+.2));
  else if(si===2){tod=.9+uk*.12;tint='#a6d6d2';blur=.5;}
  else if(si===3){tod=.96;tint='#cfc4ee';blur=.6;}
  else if(si===4){tod=.55;tint='#ead2a6';blur=.9;}
  else if(si===5){tod=.86+ss(T.cat-.2,T.recup+.2,t)*.46;blur=.2;}
  else if(si===6){tod=.96;tint='#ffa0aa';blur=.7;}
  if(si===1||si===0)blur=si===1?.7:.0;
  if(si<7)drawRoom(g,t,{tod,tint,blur,screen});else drawS7(g,t);
  if(si===5)drawS5Back(g,t);
  // ---- props ----
  [drawS0,drawS1,drawS2,drawS3,drawS4,null,drawS6,null][si]&&[drawS0,drawS1,drawS2,drawS3,drawS4,null,drawS6,null][si](g,t);
  // ---- character ----
  let emo=emoAt(t,KFE);if(si===3){const off=(Math.sin(t*2.4)>.35)||(Math.sin(t*5.3+2)>.7);if(off)emo='sleep';}
  const face=faceFor(t,emo);const cx=540;let bs=.92;
  let pun=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.7)pun+=Math.exp(-a*8)*Math.sin(Math.min(a*18,Math.PI));}
  const e={tilt:Math.sin(t*.9)*.012,hx:0,hy:0,by:Math.sin(t*2.3)*3,lean:Math.sin(t*.7)*.006,sq:Math.sin(t*2.3)*.004+pun*.02};
  if(emo==='fear'||emo==='hectic'){e.hx+=Math.sin(t*47)*3;e.hy+=Math.cos(t*41)*2;}
  if(emo==='shock'){e.tilt-=.05;e.hy-=8;}
  if(emo==='resign'||emo==='strain'||emo==='sleepy'){e.tilt+=.07;e.hy+=14;e.by+=6;}
  if(emo==='happy'||emo==='laugh'||emo==='wink'){e.by-=Math.abs(Math.sin(t*6.5))*10;e.tilt+=Math.sin(t*3)*.03;}
  if(emo==='sleep'){e.tilt+=.16+Math.sin(t*1.6)*.02;e.hy+=30;e.by+=18;}
  if(si===3&&emo==='sleep'){e.hy+=40;e.tilt+=.12;}
  if(si===1&&t>T.alc){e.tilt+=Math.sin(t*3.4)*.07;e.lean+=Math.sin(t*2.6)*.03;e.hx+=Math.sin(t*3.4)*12;}
  bs*=1+.035*pun;
  const tr=TIRED[si]*(si===5?(1-ss(T.recup,T.recup+.6,t)*.6):1);
  CHG.setTransform(1,0,0,1,0,0);CHG.clearRect(0,0,W,H);
  drawPeep(CHG,cx,1990,bs,{body:BODIES[si],face,tilt:e.tilt,hx:e.hx,hy:e.hy,bx:0,by:e.by,lean:e.lean,sq:e.sq,tired:tr});
  const nt=si===7?1:si===5?1-ss(T.cat,T.recup+.5,t):nightness(tod);
  CHG.save();CHG.globalCompositeOperation='source-atop';
  CHG.fillStyle=nt>.5?'rgba(40,50,130,.20)':'rgba(255,230,190,.06)';CHG.fillRect(0,0,W,H);
  CHG.fillStyle=lin(CHG,cx-360,950,cx+60,1500,[[0,nt>.5?'rgba(140,165,255,.22)':'rgba(255,236,190,.22)'],[.5,'rgba(255,255,255,0)']]);CHG.fillRect(0,0,W,H);
  CHG.fillStyle=lin(CHG,cx+360,1100,cx+60,1600,[[0,'rgba(255,170,100,.28)'],[.5,'rgba(255,170,100,0)']]);CHG.fillRect(0,0,W,H);
  CHG.fillStyle=lin(CHG,0,1500,0,1990,[[0,'rgba(10,8,40,0)'],[1,'rgba(10,8,40,.22)']]);CHG.fillRect(0,0,W,H);
  if(tint){const c=hex(tint);CHG.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},.13)`;CHG.fillRect(0,0,W,H);}
  CHG.restore();
  g.save();g.shadowColor='rgba(8,6,30,.5)';g.shadowBlur=46;g.shadowOffsetX=-22;g.shadowOffsetY=20;g.drawImage(CH,0,0);g.restore();
  if(si===5){drawS5Front(g,t);}
  // ---- fx ----
  if(si===3){const off=(Math.sin(t*2.4)>.35)||(Math.sin(t*5.3+2)>.7);}
  g.restore();
  // ---- full-frame distortions ----
  if(si===2){const a=ss(T.aluc-.2,T.aluc+.8,t);warp(g,10*a,.018,t);}
  if(si===1&&t>T.alc-.2){const a=ss(T.alc-.2,T.alc+.5,t);warp(g,7*a,.01,t,12);}
  if(si===4&&t>T.habl&&t<T.recor+1.5){warp(g,5,.012,t,12);}
  if(si===3){const lid=clamp(Math.sin(t*2.4)*3-.7)+0;const l2=clamp(Math.sin(t*5.3+2)*3-1.8);lids(g,Math.max(lid,l2)*.75);}
  // ---- post: bloom, vignette, grain ----
  POSTG.globalCompositeOperation='copy';POSTG.drawImage(CV,0,0,POST.width,POST.height);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=.2;g.filter='blur(6px)';g.drawImage(POST,-20,-20,W+40,H+40);g.filter='none';g.restore();
  g.save();g.fillStyle=rad(g,540,1000,480,1300,[[0,'#000',0],[1,'#06031a',.55]]);g.fillRect(0,0,W,H);g.restore();
  g.save();g.globalAlpha=.06;g.globalCompositeOperation='overlay';const gi=Math.floor(t*24)%6;g.fillStyle=g.createPattern(GRAIN[gi],'repeat');g.translate((gi*53)%256,(gi*97)%256);g.fillRect(-256,-256,W+256,H+256);g.restore();
  // ---- transitions ----
  for(let b=1;b<NS;b++){const d=t-ST[b];if(d<-.4||d>.4)continue;transition(g,b,d);}
}
function emoAt(t,K){let i=0;while(i<K.length-1&&t>=K[i+1][0])i++;return K[i][1];}
