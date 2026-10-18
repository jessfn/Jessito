// ===================== main frame =====================
let CH,CHG,FULL,FULLG;let KFE=[];const PUNCH=[];let CV,G,POST,POSTG,GRAIN=[];
function initMain(){TUFTB.wheat=TUFTB.wheat||TUFTB.day;
  KFE=[[0,'calm'],[2.5,'curious'],[vac-.12,'curious'],[vac+.1,'shock'],[ST[1]+.6,'fear'],[ST[2]+.2,'curious'],[wA+.05,'shock'],[wB+.5,'strain'],[ST[3]+.2,'fear'],[wF+.1,'shock'],[wPr+.1,'hectic'],[ST[4]+.3,'resign'],[wAlc-.2,'curious'],[wAlc+.6,'strain'],
   [ST[5]+.2,'curious'],[wMito-.1,'confident'],[wEin+.3,'wink'],[ST[5]+4.6,'confident'],[ST[6]+.1,'calm'],[wTri-.2,'happy'],[wFru-.05,'resign'],[ST[7]+.1,'happy'],[ST[7]+3.2,'wink'],[ST[7]+5.6,'laugh']];
  PUNCH.push(vac,ST[1],wTer,ST[2],wA,wM,wB,ST[3],wF,wPr,ST[4],ST[5],wMito,ST[6],wTri,wFru,ST[7]);
  CV=document.getElementById('c');G=CV.getContext('2d');
  POST=offscreen(W/6,H/6);POSTG=POST.getContext('2d');CH=offscreen(W,H);CHG=CH.getContext('2d');FULL=offscreen(W,H);FULLG=FULL.getContext('2d');
  for(let i=0;i<6;i++){const c=offscreen(256,256),g=c.getContext('2d'),d=g.createImageData(256,256);for(let k=0;k<d.data.length;k+=4){const v=128+(rng(k*.37+i*911)-.5)*140;d.data[k]=d.data[k+1]=d.data[k+2]=v;d.data[k+3]=255;}g.putImageData(d,0,0);GRAIN.push(c);}
}
const BODIES=['ButtonShirt','ButtonShirt','Hoodie','ButtonShirt','Hoodie','ButtonShirt','Hoodie','Coffee'];
const CHARX=[0,0,-175,0,0,0,0,0];
const pulseAt=(t,t0,rate=6)=>{const a=t-t0;return a<0?0:Math.exp(-a*rate)*Math.cos(a*22);};
function headScreen(cx,s,by){return [cx+(450-470)*s,1990+by-(1131-330)*s];}
function drawSweat(g,x,y,k,t){if(k<=.01)return;g.save();for(let i=0;i<3;i++){const ph=((t*1.3+i*.37)%1),yy=y+ph*70-10+i*14,xx=x+i*34-30+Math.sin(t*9+i)*4;g.globalAlpha=k*(1-ph)*.95;
  g.fillStyle=lin(g,xx,yy-18,xx,yy+16,[[0,'#e8f7ff'],[1,'#7fd0ff']]);g.strokeStyle='#0b3b5a';g.lineWidth=4;g.beginPath();g.moveTo(xx,yy-22);g.bezierCurveTo(xx+16,yy,xx+14,yy+18,xx,yy+18);g.bezierCurveTo(xx-14,yy+18,xx-16,yy,xx,yy-22);g.fill();g.stroke();}g.restore();}
function drawMark(g,x,y,k,txt,col='#ff3b3b',rot=0){if(k<=.01)return;g.save();g.translate(x,y);g.rotate(rot);const s=eob(k,1.6);g.scale(s,s);g.font='900 120px "Arial Black",Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=18;g.strokeStyle='#1a0c0a';g.lineJoin='round';g.strokeText(txt,0,0);g.fillStyle=col;g.fillText(txt,0,0);g.restore();}
function paperCard(g,cx,cy,w,h,rot,k){g.save();g.translate(cx,cy);g.rotate(rot);const s=eob(k,1.2);g.scale(s,s);g.shadowColor='rgba(40,20,0,.45)';g.shadowBlur=50;g.shadowOffsetY=22;
  rrect(g,-w/2,-h/2,w,h,28);g.fillStyle=lin(g,0,-h/2,0,h/2,[[0,'#fff6dc'],[1,'#ecd9a8']]);g.fill();g.shadowColor='transparent';g.strokeStyle='#8a6a32';g.lineWidth=6;g.stroke();
  g.strokeStyle='rgba(138,106,50,.28)';g.lineWidth=2;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(-w/2+40,i*52+30);g.lineTo(w/2-40,i*52+30);g.stroke();}g.restore();}
function frame(t){
  const g=G;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  const si=sceneAt(t),u=t-ST[si],dur=ENDS[si]-ST[si],uk=u/dur;
  // ---- camera (shake / push-in) ----
  let shake=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.5)shake+=Math.exp(-a*9)*(si===0&&p===vac?1.6:1);}
  let tz=0;for(let b=1;b<NS;b++){const d=t-ST[b];if(d<0&&d>-.4)tz+=.16*ss(-.4,0,d)*ss(-.4,0,d);else if(d>=0&&d<.5)tz+=.16*Math.pow(1-ss(0,.5,d),2);}
  const Z=1+tz+.04*uk+(si===0?.02*ss(vac-.2,vac+.25,t)*Math.exp(-(t-vac)*.3):0);
  const sx=Math.sin(t*61)*5*shake,sy=Math.cos(t*53)*4*shake;
  g.save();g.translate(540+sx,1100+sy);g.scale(Z,Z);g.translate(-540,-1100);
  CAMS.x=Math.sin(t*.35)*40+u*(si%2?8:-8);
  const cx=540+CHARX[si];let bs=.92;
  // ---- scene backdrops ----
  const meadow=si!==3;
  if(meadow){
    let env,Wd=0,wind=.5,set='day',mixW=0,pollen=0;
    if(si===0){const m=ss(vac,vac+2.6,t);env={base:'day',over:'dry',mix:m,rays:1-m*.8,hives:true,windmill:true,cloudSet:'day'};Wd=ss(vac,vac+2.2,t)*1.3;mixW=m;pollen=1-m;}
    else if(si===1||si===2){env={base:'dry',over:null,mix:0,rays:.2,hives:si===1,apples:si===2?1:0,cloudSet:'day',windmill:si===1};Wd=1.6;set='dry';mixW=1;}
    else if(si===4){env={base:'dry',over:null,mix:0,rays:.15,cloudSet:'day',windmill:true};Wd=1.6;set='dry';wind=2.4;mixW=1;}
    else if(si===5){env={base:'dusk',over:null,mix:0,rays:.5,warm:true,sunDisc:.9,stars:.6,cloudSet:'dusk',windmill:true};Wd=1;set='dusk';}
    else if(si===6){env={base:'wheat',over:null,mix:0,rays:.9,warm:true,cloudSet:'wheat',windmill:true};set='wheat';wind=1.6;pollen=.5;}
    else {const m=1-ss(ST[7],ST[7]+3,t);env={base:'day',over:'dry',mix:m*.7,rays:1,cloudSet:'day',hives:true,windmill:true};Wd=m*1.2;mixW=m*.7;pollen=1;}
    drawBackdrop(g,t,env);
    if(si===2){g.save();g.translate(-70,-330);g.translate(770,1160);g.scale(1.5,1.5);g.translate(-770,-1160);drawOrchardTable(g,t);g.restore();}
    drawTufts(g,t,set,mixW,wind,1020,1720);drawFlowers(g,t,Wd,wind,1040,1740,set);
    if(si===0)drawBees(g,t,false,'hook');if(si===7)drawBees(g,t,false,'cta');
    window.__meadow=[set,Wd,wind,mixW];
  } else drawMarket(g,t,eio(uk)*3.2);
  // ---- props behind the character ----
  if(si===1){g.save();g.translate(0,-125);drawChartCard(g,t);g.restore();}
  if(si===5)drawMythCard(g,t);
  if(si===6)drawGrains(g,t);
  // ---- character ----
  const emo=emoAt(t,KFE),face=faceFor(t,emo),ta=0;
  let pun=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.7)pun+=Math.exp(-a*8)*Math.sin(Math.min(a*18,Math.PI));}
  const e={tilt:Math.sin(t*.9)*.012+Math.sin(t*5.2)*.012*ta,hx:0,hy:-ta*4*Math.abs(Math.sin(t*9)),bx:CHARX[si],by:Math.sin(t*2.3)*3,lean:Math.sin(t*.7)*.006,sq:Math.sin(t*2.3)*.004+pun*.02};
  if(emo==='fear'||emo==='hectic'){e.hx+=Math.sin(t*47)*3;e.hy+=Math.cos(t*41)*2;}
  if(emo==='shock'){e.tilt-=.05;e.hy-=8;}
  if(emo==='resign'||emo==='strain'){e.tilt+=.07;e.hy+=14;e.by+=6;}
  if(emo==='happy'||emo==='laugh'||emo==='wink'){e.by-=Math.abs(Math.sin(t*6.5))*10;e.tilt+=Math.sin(t*3)*.03;}
  if(si===4){e.lean+=Math.sin(t*3.1)*.012;e.tilt+=Math.sin(t*3.1+1)*.04;}
  bs*=1+.035*pun;
  const hp=headScreen(cx,bs,e.by);
  if(si===0)burstLines(g,hp[0],hp[1]-30,t,vac+.05,.55,20,210,430,'#fff7c2');
  if(si===1)burstLines(g,hp[0],hp[1]-30,t,ST[1]+.02,.45,16,230,420,'#ffffff');
  CHG.setTransform(1,0,0,1,0,0);CHG.clearRect(0,0,W,H);
  drawPeep(CHG,cx,1990,bs,{body:BODIES[si],face,tilt:e.tilt,hx:e.hx,hy:e.hy,bx:e.bx-CHARX[si],by:e.by,lean:e.lean,sq:e.sq});
  const TINT=[null,'rgba(150,150,110,.06)','rgba(160,150,100,.06)','rgba(190,200,215,.05)','rgba(170,150,100,.07)','rgba(255,150,90,.12)','rgba(255,200,110,.08)','rgba(255,225,160,.05)'][si];
  CHG.save();CHG.globalCompositeOperation='source-atop';
  if(TINT){CHG.fillStyle=TINT;CHG.fillRect(0,0,W,H);}
  CHG.fillStyle=lin(CHG,cx+330,900,cx-60,1500,[[0,'rgba(255,230,180,.30)'],[.45,'rgba(255,226,170,0)']]);CHG.fillRect(0,0,W,H);
  CHG.fillStyle=lin(CHG,cx-330,1300,cx+200,1900,[[0,'rgba(40,30,90,.13)'],[1,'rgba(40,30,90,0)']]);CHG.fillRect(0,0,W,H);
  CHG.fillStyle=lin(CHG,0,1500,0,1990,[[0,'rgba(20,20,40,0)'],[1,'rgba(20,20,40,.14)']]);CHG.fillRect(0,0,W,H);
  CHG.restore();
  g.save();g.shadowColor='rgba(15,10,40,.42)';g.shadowBlur=46;g.shadowOffsetX=-22;g.shadowOffsetY=20;g.drawImage(CH,0,0);g.restore();
  drawSweat(g,hp[0]+150*bs,hp[1]-70,(emo==='fear'||emo==='hectic'||emo==='strain')?1:0,t);
  if(emo==='shock'&&t-ST[si]<2.4||t-vac<1.1&&t>vac){const k=clamp(1-(t-(si===0?vac:ST[si]))/1.0);drawMark(g,hp[0]+210*bs,hp[1]-300*bs,k,'!','#ffd23f',.2);}
  if(si===4&&emo==='curious')drawMark(g,hp[0]+220*bs,hp[1]-300*bs,1,'?','#9fe0ff',-.15);
  // ---- front layer ----
  drawTufts(g,t,window.__meadow?window.__meadow[0]:'day',window.__meadow?window.__meadow[3]:0,window.__meadow?window.__meadow[2]:.5,1720,1960);
  if(meadow)drawFlowers(g,t,window.__meadow[1],window.__meadow[2],1740,2000,window.__meadow[0]);
  if(si===0)drawBees(g,t,true,'hook');if(si===7)drawBees(g,t,true,'cta');
  if(si===0||si===7||si===6)drawPollen(g,t,60,si===6?'#ffe9a0':'#fff2b0',si===0?clamp(1-ss(vac,vac+1.5,t)):1,1);
  if(si===4){drawWind(g,t,1);drawLeaves(g,t,1,['#c9a24a','#a8742a','#8a8a3a','#d6b560']);drawButterflies(g,t,1);}
  if(si===5&&t>wEin)sparkles(g,t,540,1200,18,420,2);
  if(si===7)sparkles(g,t,540,1250,26,460,5);
  drawPoofs(g,t);
  g.restore();
  // ---- post: bloom, vignette, grain ----
  POSTG.globalCompositeOperation='copy';POSTG.drawImage(CV,0,0,POST.width,POST.height);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=.22;g.filter='blur(6px)';g.drawImage(POST,-20,-20,W+40,H+40);g.filter='none';g.restore();
  g.save();g.fillStyle=rad(g,540,1000,500,1300,[[0,'#000',0],[1,'#0a0214',.5]]);g.fillRect(0,0,W,H);g.restore();
  g.save();g.globalAlpha=.055;g.globalCompositeOperation='overlay';const gi=Math.floor(t*24)%6;g.fillStyle=g.createPattern(GRAIN[gi],'repeat');g.translate((gi*53)%256,(gi*97)%256);g.fillRect(-256,-256,W+256,H+256);g.restore();
  // ---- transitions: honeycomb / light-leak wipe, with zoom ghosting ----
  for(let b=1;b<NS;b++){const d=t-ST[b];if(d<-.4||d>.45)continue;
    if(Math.abs(d)<.4){FULLG.globalCompositeOperation='copy';FULLG.drawImage(CV,0,0);const m=1-Math.abs(d)/.4;
      g.save();g.globalCompositeOperation='lighter';for(const [sc,al] of [[1.035,.22],[1.07,.14],[1.11,.08]]){g.globalAlpha=al*m;g.translate(540,960);g.scale(sc,sc);g.translate(-540,-960);g.drawImage(FULL,0,0);g.setTransform(1,0,0,1,0,0);}g.restore();}
    if(b%2){let k=0;if(d<0)k=ss(-.34,-.02,d);else k=1-ss(0,.4,d);if(k>0){drawHoneycomb(g,k,540,960);g.save();g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,226,150,${.38*Math.max(0,1-Math.abs(d)/.25)})`;g.fillRect(0,0,W,H);g.restore();}}
    else{const p=ss(-.34,.34,d),cxp=-900+p*(W+1800);g.save();g.translate(cxp,960);g.rotate(.32);
      g.fillStyle=lin(g,-1300,0,1300,0,[[0,'rgba(255,246,214,0)'],[.3,'rgba(255,240,190,.96)'],[.5,'rgba(255,255,255,1)'],[.7,'rgba(255,240,190,.96)'],[1,'rgba(255,246,214,0)']]);g.fillRect(-1300,-2400,2600,4800);
      g.globalCompositeOperation='lighter';g.fillStyle=lin(g,-1000,0,1000,0,[[0,'rgba(255,170,80,0)'],[.5,'rgba(255,170,80,.45)'],[1,'rgba(255,170,80,0)']]);g.fillRect(-1000,-2400,2000,4800);g.restore();}
  }
}
// ----- S5 myth card, S6 grains -----
function drawMythCard(g,t){const u=t-ST[5];const k=eob(clamp(u/.7),1.1);if(k<=.01)return;
  paperCard(g,540,700,820,420,-.025,k);g.save();g.translate(540,700);g.rotate(-.025);
  g.fillStyle='#5a3d14';g.font='900 190px Georgia,serif';g.textAlign='left';g.fillText('“',-370,20);
  g.font='italic 700 54px Georgia,serif';g.textAlign='center';['Si las abejas desaparecen,','a la humanidad le quedarían','solo cuatro años de vida'].forEach((s,i)=>g.fillText(s,10,-60+i*72));
  g.font='700 38px Arial,sans-serif';g.fillStyle='#8a6a32';g.fillText('— atribuida a Einstein',10,170);
  g.restore();
  const m=clamp((t-wMito)/.35);if(m>0){g.save();g.translate(540,700);g.rotate(-.025);drawCross(g,0,0,3.1,eo(m));g.restore();}}
function drawGrains(g,t){const u=t-ST[6];
  const items=[[iconWheat,250,wTri],[iconRice,540,wArr],[iconBread,830,wArr+.5]];
  items.forEach(([fn,x,tv],i)=>{const k=eob(clamp((t-tv)/.5),1.5);if(k<=.01)return;g.save();g.fillStyle=`rgba(255,255,255,${.28*k})`;g.beginPath();g.arc(x,660+Math.sin(t*2+i)*6,120*k,0,7);g.fill();
    if(fn===iconWheat)fn(g,x,640+Math.sin(t*2+i)*6,2.1*k,Math.sin(t*1.5)*.1);else fn(g,x,660+Math.sin(t*2+i)*6,2.1*k);g.restore();});
  const f=eob(clamp((t-wFru)/.5),1.5);if(f>0){g.save();g.globalAlpha=f;iconApple(g,240,860,1.2*f);iconBerries(g,540,860,1.2*f);iconAvocado(g,840,860,1.2*f);g.restore();
    const c=clamp((t-wFru-.45)/.35);[240,540,840].forEach(x=>drawCross(g,x,860,1.1,eo(c)));}}
