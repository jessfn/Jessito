let CV,G,POST,POSTG,CH,CHG,FULL,FULLG,GRAIN=[],KFE=[];const PUNCH=[];const CAMS={x:0};
const PLANE_Y=430,PLANE_S=2.0,DOOR_DX=-470*PLANE_S,PLANE_V=1200;
const psAt=t=>lerp(.35,1,ss(T_DOOR+.2,T_DOOR+2.4,t));
const planeX=t=>PLANE_V*t;
function personWorld(t){const tau=Math.max(0,t-T_DOOR);const dx=planeX(T_DOOR)+DOOR_DX+PLANE_V*DRAG_TAU*(1-Math.exp(-tau/DRAG_TAU));const dy=PLANE_Y-12*PLANE_S+FALLPX*fallDist(t);return [dx,dy];}
const HEAD_OFF=[336,-8];
function initMain(){
  KFE=[[0,'calm'],[T_DOOR-.2,'curious'],[T_DOOR+.15,'shock'],[3.2,'fear'],[T.spoil+.8,'strain'],
   [ST[1]+.3,'curious'],[T.oxi,'sleepy'],[T.min-.4,'blank'],[T.min+.3,'sleep'],
   [ST[2]+.3,'shock'],[T.frio,'strain'],[T.viento,'hectic'],
   [ST[3]+.3,'fear'],[T.rap,'hectic'],[T.dos,'shock'],[T.term,'resign'],
   [ST[4]+.3,'resign'],[T.eter-.3,'fear'],
   [ST[5]-.3,'hectic'],[T.imp,'shock'],
   [ST[7],'curious'],[T.mar-.4,'shock'],[T.sigu-.2,'wink'],[ST[7]+6.6,'laugh']];
  PUNCH.push(T_DOOR,T.spoil,T.min,T.frio,T.dos,T.term,T.eter,T.imp,ST[7],T.mar);
  CV=document.getElementById('c');G=CV.getContext('2d');
  POST=offscreen(W/6,H/6);POSTG=POST.getContext('2d');
  CH=offscreen(W*SC,H*SC);CHG=CH.getContext('2d');FULL=offscreen(W*SC,H*SC);FULLG=FULL.getContext('2d');
  for(let i=0;i<6;i++){const c=offscreen(256,256),g=c.getContext('2d'),d=g.createImageData(256,256);for(let k=0;k<d.data.length;k+=4){const v=128+(rng(k*.37+i*911)-.5)*140;d.data[k]=d.data[k+1]=d.data[k+2]=v;d.data[k+3]=255;}g.putImageData(d,0,0);GRAIN.push(c);}
}
function emoAt(t,K){let i=0;while(i<K.length-1&&t>=K[i+1][0])i++;return K[i][1];}
const CAMK=[[3.4,1.0,24,0],[7.6,1.0,24,0],[9.6,2.1,336,-8],[13.0,2.1,336,-8],[14.6,1.15,120,0],[15.6,2.2,330,-10],[18.0,2.0,330,-10],[19.8,1.0,24,0],[24.4,1.0,24,0],[26.2,.82,24,0],[30.0,.9,24,0],[31.7,2.4,336,-8]];
function camAt(t){const P=personWorld(t),L=ss(T_DOOR,T_DOOR+2.2,t);
  // pre-lock: plane-centred wide shot
  const zp=lerp(.34,CAMK[0][1],L),pc=[planeX(t),PLANE_Y+40];
  let z=CAMK[0][1],ox=CAMK[0][2],oy=CAMK[0][3];
  if(t>=CAMK[0][0]){let i=0;while(i<CAMK.length-2&&t>=CAMK[i+1][0])i++;const a=CAMK[i],b=CAMK[Math.min(i+1,CAMK.length-1)];const k=eio(clamp((t-a[0])/Math.max(.05,b[0]-a[0])));z=Math.exp(lerp(Math.log(a[1]),Math.log(b[1]),k));ox=lerp(a[2],b[2],k);oy=lerp(a[3],b[3],k);}
  const ps=psAt(t),lockc=[P[0]+ox*ps,P[1]+oy*ps];
  const cx=lerp(pc[0],lockc[0],L),cy=lerp(pc[1],lockc[1],L);
  return [t<3.4?lerp(.30,CAMK[0][1],eio(clamp((t-.7)/2.7))):z,cx,cy];}
function drawSweat(g,x,y,k,t){if(k<=.01)return;g.save();for(let i=0;i<3;i++){const ph=((t*1.3+i*.37)%1),yy=y+ph*70-10+i*14,xx=x+i*34-30+Math.sin(t*9+i)*4;g.globalAlpha=k*(1-ph)*.95;g.fillStyle=lin(g,xx,yy-18,xx,yy+16,[[0,'#e8f7ff'],[1,'#7fd0ff']]);g.strokeStyle='#0b3b5a';g.lineWidth=4;g.beginPath();g.moveTo(xx,yy-22);g.bezierCurveTo(xx+16,yy,xx+14,yy+18,xx,yy+18);g.bezierCurveTo(xx-14,yy+18,xx-16,yy,xx,yy-22);g.fill();g.stroke();}g.restore();}
function lids(g,a){if(a<=.001)return;const e=a*H*.5;g.save();g.fillStyle='#0b0820';g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W,e-60*a);g.quadraticCurveTo(W/2,e+120*a,0,e-60*a);g.closePath();g.fill();g.beginPath();g.moveTo(0,H);g.lineTo(W,H);g.lineTo(W,H-e+60*a);g.quadraticCurveTo(W/2,H-e-120*a,0,H-e+60*a);g.closePath();g.fill();g.restore();}
function frostAt(g,t,o,f){if(f<=.01)return;const hp=headPos2(o);g.save();g.translate(hp[0],hp[1]);g.rotate(o.rot||0);g.scale(o.sc||1,o.sc||1);
  for(let i=0;i<46;i++){const a=rng(i)*6.283,r=170+rng(i+3)*130,x=336*0+Math.cos(a)*r*1.0-0,y=Math.sin(a)*r;if(rng(i+9)>f)continue;const s=10+rng(i+5)*26;g.save();g.translate(Math.cos(a)*r*.9,Math.sin(a)*r*1.1);g.rotate(rng(i+7)*3);g.globalAlpha=.9;g.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3;g.moveTo(0,0);g.lineTo(Math.cos(an)*s,Math.sin(an)*s);}g.strokeStyle='#e8f8ff';g.lineWidth=4;g.lineCap='round';g.stroke();g.beginPath();g.arc(0,0,s*.22,0,7);g.fillStyle='#fff';g.fill();g.restore();}
  g.globalAlpha=f*.55;g.fillStyle=rad(g,0,0,40,230,[[0,'#bfeaff',0],[1,'#bfeaff',.5]]);g.beginPath();g.arc(0,0,230,0,7);g.fill();g.restore();}
function headPos2(o){const c=Math.cos(o.rot||0),s=Math.sin(o.rot||0),k=o.sc||1;return [o.x+(HEAD_OFF[0]*c-HEAD_OFF[1]*s)*k,o.y+(HEAD_OFF[0]*s+HEAD_OFF[1]*c)*k];}
function consoleFG(g,t,top){const y=top;g.save();g.beginPath();g.moveTo(-20,y+50);g.quadraticCurveTo(540,y-40,W+20,y+50);g.lineTo(W+20,H+40);g.lineTo(-20,H+40);g.closePath();inkS(g,lin(g,0,y,0,H,[[0,'#3a4268'],[1,'#1c2038']]),9);
  const cols=['#ff5d6c','#ffd166','#46f0a0','#4cc9f0','#a78bfa'];for(let i=0;i<14;i++){const x=70+i*72,yy=y+70+(i%3)*8;g.beginPath();g.arc(x,yy,14,0,7);inkS(g,cols[i%5],4);glow(g,x,yy,26,cols[i%5],.25+.2*Math.sin(t*3+i));}
  g.beginPath();g.roundRect(130,y+120,300,110,16);inkS(g,'#06151a',6);g.strokeStyle='#4cc9f0';g.lineWidth=4;g.beginPath();for(let i=0;i<=30;i++){const x=146+i*9.2,yy=y+176+Math.sin(i*.5+t*3)*20;i?g.lineTo(x,yy):g.moveTo(x,yy);}g.stroke();
  g.beginPath();g.roundRect(650,y+120,300,110,16);inkS(g,'#06151a',6);g.fillStyle='#46f0a0';g.font=`700 34px ${FONT_M}`;g.textAlign='center';g.textBaseline='middle';g.fillText('PRESIÓN OK',800,y+176);g.restore();}
function transition(g,b,d){const m=1-Math.abs(d)/.4;if(m<=0)return;
  if(b===7){const p=d<0?ss(-.38,0,d):1-ss(0,.38,d);if(p<=0)return;const r=(1-p)*1500;g.save();g.beginPath();g.rect(0,0,W,H);g.arc(540,960,Math.max(1,r),0,Math.PI*2,true);g.fillStyle='#02061a';g.fill('evenodd');g.beginPath();g.arc(540,960,Math.max(1,r),0,Math.PI*2);g.lineWidth=14;g.strokeStyle='#3a6aa8';g.stroke();g.restore();}
  else if(b===6){const p=ss(-.4,0,d)+ss(0,.4,d);const l=W*(1-p),r=W*(2-p);if(r<=0||l>=W)return;g.save();g.beginPath();g.rect(Math.max(0,l),0,Math.min(W,r)-Math.max(0,l),H);g.clip();g.fillStyle=lin(g,l,0,r,0,[[0,'#f2e6c4'],[.9,'#e2d2a4'],[1,'#c8b480']]);g.fillRect(l,0,r-l,H);g.restore();g.fillStyle=lin(g,l-110,0,l,0,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);g.fillRect(Math.max(0,l-110),0,110,H);}
}
function frame(t){
  const g=G;g.setTransform(SC,0,0,SC,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';
  const si=sceneAt(t),u=t-ST[si];const emo=emoAt(t,KFE);const face=faceFor(t,emo);
  let shake=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.5)shake+=Math.exp(-a*9);}
  const spd=si<=5?speedKmh(t)/200:0;shake+=spd*.45*(si<=5?1:0)+(si===5?ss(T.imp-3,T.imp,t)*.9:0);
  let pun=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.7)pun+=Math.exp(-a*8)*Math.sin(Math.min(a*18,Math.PI));}
  const e={tilt:Math.sin(t*.9)*.012,hx:0,hy:0,by:Math.sin(t*2.3)*2,lean:Math.sin(t*.7)*.006,sq:Math.sin(t*2.3)*.004+pun*.02};
  if(emo==='fear'||emo==='hectic'){e.hx+=Math.sin(t*47)*3;e.hy+=Math.cos(t*41)*2;}
  if(si===2&&t>T.frio){e.hx+=Math.sin(t*55)*3.5;e.hy+=Math.cos(t*49)*2.5;}
  if(emo==='shock'){e.tilt-=.05;e.hy-=8;} if(emo==='resign'||emo==='strain'||emo==='sleepy'){e.tilt+=.04;e.hy+=8;}
  if(emo==='sleep'){e.tilt+=.12;e.hy+=20;}
  if(emo==='happy'||emo==='laugh'||emo==='wink'){e.by-=Math.abs(Math.sin(t*6.5))*10;e.tilt+=Math.sin(t*3)*.03;}
  g.save();
  if(si<=5){
    const P=personWorld(t),[z,cx,cy]=camAt(t);const alt=altM(t);const sx=Math.sin(t*61)*5*shake,sy=Math.cos(t*53)*4*shake;
    g.translate(540+sx,960+sy);g.scale(z,z);g.translate(-cx,-cy);
    // world is drawn in WORLD coordinates; sky/clouds use screen-space helpers => draw sky in screen space first
    g.save();g.translate(cx,cy);g.scale(1/z,1/z);g.translate(-540,-960);skyFall(g,alt,t);
    cloudLayers(g,t,cy,cx);
    g.restore();
    // plane (world)
    airliner(g,planeX(t),PLANE_Y,PLANE_S,t);
    // ground approaching (screen-space overlay anchored to camera)
    const gp=clamp(1-alt/2500);if(gp>0){g.save();g.translate(cx,cy);g.scale(1/z,1/z);g.translate(-540,-960);groundRush(g,t,gp);g.restore();}
    // person
    const lock=ss(T_DOOR,T_DOOR+.4,t),tau=Math.max(0,t-T_DOOR);
    const rot=-(1.5*Math.exp(-tau/1.1))+.05*Math.sin(t*1.6)+(t>T_DOOR?0:0);
    const o={x:P[0],y:P[1],sc:psAt(t),rot:t<T_DOOR?0:rot,flail:.5+.5*ss(T_DOOR,T_DOOR+1,t),tired:si===1?clamp((t-T.oxi)/4)*.5:0};
    if(t>=T_DOOR-.05){personFall(g,t,face,e,o);frostAt(g,t,o,si===2?ss(T.frio-.5,T.cero+1,t):si>=3&&si<=5?.6:0);}
    else{ // inside the plane: person is hidden
    }
    // near clouds in front
    g.save();g.translate(cx,cy);g.scale(1/z,1/z);g.translate(-540,-960);airStreaks(g,t,clamp(spd*1.1),540);g.restore();
    g.restore();g.save();
    // door burst puff
    if(t>T_DOOR-.1&&t<T_DOOR+.7){const a=(t-T_DOOR+.1)/.8;g.save();g.translate(540,960);g.globalAlpha=1-a;g.strokeStyle='#fff';g.lineWidth=14*(1-a)+3;for(let i=0;i<14;i++){const an=i/14*6.28,r0=120+a*420;g.beginPath();g.moveTo(Math.cos(an)*r0,Math.sin(an)*r0);g.lineTo(Math.cos(an)*(r0+80),Math.sin(an)*(r0+80));g.stroke();}g.restore();}
    if(si>=1&&si<=4)hud(g,t,si,u);
    // consciousness fade in S1 + blink
    if(si===1){const cv=ss(T.oxi,T.min+.3,t);if(cv>0){g.save();g.fillStyle=rad(g,540,980,Math.max(30,620*(1-cv)),1300,[[0,'rgba(6,4,20,0)'],[1,`rgba(6,4,20,${.5+.45*cv})`]]);g.fillRect(0,0,W,H);g.restore();const bl=Math.max(0,Math.sin(t*(1.4+cv*2.6)))**8;lids(g,cv*.55+bl*.35*cv);}}
    if(si===2&&t>T.frio){g.save();g.fillStyle=rad(g,540,960,380,1250,[[0,'rgba(200,235,255,0)'],[1,`rgba(200,235,255,${.35*ss(T.frio,T.cero+1,t)})`]]);g.fillRect(0,0,W,H);g.restore();}
    // black cut at impact
    if(t>=T_IMP){g.fillStyle='#000';g.fillRect(-10,-10,W+20,H+20);
      const q=t-T_IMP,x0=140,x1=940,y0=900,head=x0+Math.min(1,q/1.5)*(x1-x0),fo=1-ss(35.1-.5,35.1,t);
      g.save();g.globalAlpha=fo;g.strokeStyle='#46f0a0';g.shadowColor='#46f0a0';g.shadowBlur=20;g.lineWidth=5;g.lineCap='round';g.lineJoin='round';g.beginPath();
      for(let x=x0;x<=head;x+=3){const d=x-330;let y=0;if(d>-60&&d<260){const k=d/60;y=-Math.exp(-k*k*1.2)*150*Math.sin(d*.09)*(1-Math.min(1,Math.max(0,(d)/260)));}
        if(x===x0)g.moveTo(x,y0+y);else g.lineTo(x,y0+y);}
      g.stroke();g.beginPath();g.arc(head,y0,9,0,6.283);g.fillStyle='#b8ffd9';g.fill();g.restore();
      if(q>1.7){g.save();g.globalAlpha=fo*ss(1.7,2.2,q);g.font='700 34px '+FONT_M;g.fillStyle='#46f0a0';g.textAlign='center';g.fillText('SIN SEÑAL',540,1000);g.restore();}}
    else if(si===5&&t>T_IMP-.5){const k=ss(T_IMP-.5,T_IMP,t);g.fillStyle=`rgba(255,255,255,${.65*k})`;g.fillRect(0,0,W,H);}
    g.restore();g.save();
  } else if(si===6){bgS6(g,t);}
  else {const sx=Math.sin(t*61)*4*shake;g.translate(sx,0);bgS7(g,t);
    const SCB=.72,PV=1734,cx=540;CHG.setTransform(SC,0,0,SC,0,0);CHG.clearRect(0,0,W,H);drawPeep(CHG,cx,PV,SCB*(1+.035*pun),{body:'ButtonShirt',face,tilt:e.tilt,hx:e.hx,hy:e.hy,bx:0,by:e.by,lean:e.lean,sq:e.sq});
    CHG.save();CHG.globalCompositeOperation='source-atop';CHG.fillStyle=lin(CHG,cx+360,PV-800,cx-60,PV-250,[[0,'rgba(140,180,255,.26)'],[.5,'rgba(255,255,255,0)']]);CHG.fillRect(0,0,W,H);CHG.fillStyle=lin(CHG,0,PV-300,0,PV,[[0,'rgba(5,10,40,0)'],[1,'rgba(5,10,40,.2)']]);CHG.fillRect(0,0,W,H);CHG.restore();
    g.save();g.shadowColor='rgba(2,6,24,.5)';g.shadowBlur=46;g.shadowOffsetX=-22;g.shadowOffsetY=20;g.drawImage(CH,0,0,W,H);g.restore();consoleFG(g,t,1530);}
  g.restore();
  // ---- post ----
  POSTG.globalCompositeOperation='copy';POSTG.drawImage(CV,0,0,POST.width,POST.height);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=.18;g.filter=`blur(${6*SC}px)`;g.drawImage(POST,-20,-20,W+40,H+40);g.filter='none';g.restore();
  if(!(si===5&&t>=T_IMP)){g.save();g.fillStyle=rad(g,540,1000,480,1300,[[0,'#000',0],[1,'#06031a',.45]]);g.fillRect(0,0,W,H);g.restore();}
  g.save();g.globalAlpha=.05;g.globalCompositeOperation='overlay';const gi=Math.floor(t*24)%6;g.fillStyle=g.createPattern(GRAIN[gi],'repeat');g.translate((gi*53)%256,(gi*97)%256);g.fillRect(-256,-256,W+256,H+256);g.restore();
  for(const b of [6,7]){const d=t-ST[b];if(d<-.4||d>.4)continue;transition(g,b,d);}
}
