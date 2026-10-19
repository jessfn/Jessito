let CV,G,POST,POSTG,CH,CHG,FULL,FULLG,GRAIN=[],KFE=[];const PUNCH=[];const CAMS={x:0};
const BGF=[bgS0,bgS1,bgS2,bgS3,bgS4,bgS5,bgS6,bgS7];
function initMain(){
  KFE=[[0,'calm'],[T.gol0-.1,'curious'],[T.gol0+.1,'shock'],[T.vol-.3,'fear'],
   [ST[1]+.2,'calm'],[T.mil,'curious'],[T.notas,'happy'],[T.notas+1.8,'calm'],
   [ST[2]+.2,'curious'],[T.fren,'shock'],[T.edif,'fear'],[T.aire,'hectic'],
   [ST[3]+.2,'fear'],[T.sup,'hectic'],[T.arr,'shock'],
   [ST[4]+.2,'shock'],[T.desb,'hectic'],[T.olas,'fear'],
   [ST[5]+.2,'curious'],[T.sol,'strain'],[T.noche,'resign'],
   [ST[6]+.2,'resign'],[T.fre6,'calm'],[T.vida-.1,'solemn'],[T.sobre,'fear'],
   [ST[7]+.1,'curious'],[T.luna,'happy'],[T.desap-.1,'shock'],[T.desap+.8,'blank'],[T.sig-.1,'wink'],[ST[7]+6.2,'laugh']];
  PUNCH.push(T.gol0,T.vol,ST[1],T.fren,T.edif,ST[3],T.sup,T.arr,ST[4],T.olas,ST[5],T.sol,ST[6],T.vida,ST[7],T.desap);
  CV=document.getElementById('c');G=CV.getContext('2d');POST=offscreen(W/6,H/6);POSTG=POST.getContext('2d');CH=offscreen(W,H);CHG=CH.getContext('2d');FULL=offscreen(W,H);FULLG=FULL.getContext('2d');
  for(let i=0;i<6;i++){const c=offscreen(256,256),g=c.getContext('2d'),d=g.createImageData(256,256);for(let k=0;k<d.data.length;k+=4){const v=128+(rng(k*.37+i*911)-.5)*140;d.data[k]=d.data[k+1]=d.data[k+2]=v;d.data[k+3]=255;}g.putImageData(d,0,0);GRAIN.push(c);}
}
function emoAt(t,K){let i=0;while(i<K.length-1&&t>=K[i+1][0])i++;return K[i][1];}
function drawSweat(g,x,y,k,t){if(k<=.01)return;g.save();for(let i=0;i<3;i++){const ph=((t*1.3+i*.37)%1),yy=y+ph*70-10+i*14,xx=x+i*34-30+Math.sin(t*9+i)*4;g.globalAlpha=k*(1-ph)*.95;g.fillStyle=lin(g,xx,yy-18,xx,yy+16,[[0,'#e8f7ff'],[1,'#7fd0ff']]);g.strokeStyle='#0b3b5a';g.lineWidth=4;g.beginPath();g.moveTo(xx,yy-22);g.bezierCurveTo(xx+16,yy,xx+14,yy+18,xx,yy+18);g.bezierCurveTo(xx-14,yy+18,xx-16,yy,xx,yy-22);g.fill();g.stroke();}g.restore();}
function transition(g,b,d){const type=[0,'whip','shock','wind','flood','sun','frost','iris'][b];const m=1-Math.abs(d)/.36;if(m<=0)return;
  if(type==='whip'){FULLG.globalCompositeOperation='copy';FULLG.drawImage(CV,0,0);g.save();g.globalCompositeOperation='lighter';for(let i=1;i<=6;i++){g.globalAlpha=.16*m;g.drawImage(FULL,i*60*m*(d<0?-1:1),0);}g.restore();if(Math.abs(d)<.08){g.fillStyle=`rgba(255,246,220,${1-Math.abs(d)/.08})`;g.fillRect(0,0,W,H);}}
  else if(type==='shock'){g.save();g.strokeStyle=`rgba(255,255,255,${m})`;g.lineWidth=40*m+6;const r=(1-m)*1500+40;g.beginPath();g.arc(540,1000,r,0,7);g.stroke();g.fillStyle=`rgba(255,240,200,${Math.max(0,1-Math.abs(d)/.1)})`;g.fillRect(0,0,W,H);g.restore();}
  else if(type==='wind'){g.save();g.fillStyle=`rgba(150,110,80,${Math.min(.95,m*1.4)})`;g.fillRect(0,0,W,H);g.strokeStyle='rgba(255,240,210,.7)';g.lineCap='round';for(let i=0;i<30;i++){const y=rng(i)*H,len=260+rng(i+3)*500,x=((rng(i+7)*2000+d*5000)%2400)-300;g.lineWidth=4+rng(i+2)*7;g.beginPath();g.moveTo(x,y);g.lineTo(x+len,y);g.stroke();}g.restore();}
  else if(type==='flood'){const p=ss(-.36,0,d)+ss(0,.36,d);const top=H*(1-p),bot=H*(2-p);if(bot<=0||top>=H)return;g.save();g.beginPath();g.moveTo(0,Math.max(0,top));for(let x=0;x<=W+30;x+=30)g.lineTo(x,Math.max(0,top)+(top>0?Math.sin(x*.04+d*10)*18+Math.sin(x*.11)*8:0));g.lineTo(W,Math.min(H,bot));g.lineTo(0,Math.min(H,bot));g.closePath();g.fillStyle=lin(g,0,top,0,top+700,[[0,'#6ad0e8'],[1,'#0e3a6a']]);g.fill();g.lineWidth=8;g.strokeStyle=INK;g.stroke();g.clip();g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<50;i++){g.beginPath();g.arc(rng(i)*W,top+rng(i+2)*(bot-top),5+rng(i+3)*14,0,7);g.fill();}g.restore();}
  else if(type==='sun'){g.save();g.fillStyle=rad(g,540,900,0,1500,[[0,`rgba(255,250,210,${m})`],[.4,`rgba(255,170,60,${m*.9})`],[1,`rgba(255,100,30,${m*.8})`]]);g.fillRect(0,0,W,H);g.restore();}
  else if(type==='frost'){g.save();g.fillStyle=`rgba(210,240,255,${Math.min(.95,m*1.5)})`;g.fillRect(0,0,W,H);g.strokeStyle=`rgba(255,255,255,${m})`;g.lineWidth=5;g.lineCap='round';for(let i=0;i<22;i++){let x=rng(i)*W,y=(i%2?0:H);g.beginPath();g.moveTo(x,y);for(let k=0;k<7;k++){x+=(rng(i*9+k)-.5)*160;y+=(i%2?1:-1)*(80+rng(k+i)*70);g.lineTo(x,y);}g.stroke();}g.restore();}
  else {const p=d<0?ss(-.34,0,d):1-ss(0,.34,d);if(p<=0)return;const r=(1-p)*1500;g.save();g.beginPath();g.rect(0,0,W,H);g.arc(540,960,Math.max(1,r),0,Math.PI*2,true);g.fillStyle='#050722';g.fill('evenodd');g.beginPath();g.arc(540,960,Math.max(1,r),0,Math.PI*2);g.lineWidth=14;g.strokeStyle='#3a4a8a';g.stroke();g.restore();}
}
function frame(t){
  const g=G;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';
  const si=sceneAt(t),u=t-ST[si],dur=ENDS[si]-ST[si],uk=u/dur;
  let shake=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.5)shake+=Math.exp(-a*9);}
  if(si===2&&t>T.fren)shake+=.5+.3*Math.sin(t*30);if(si===3&&t>T.vie)shake+=.7+.3*Math.sin(t*37);if(si===4&&t>T.desb)shake+=.5+.3*Math.sin(t*29);
  let tz=0;for(let b=1;b<NS;b++){const d=t-ST[b];if(d<0&&d>-.4)tz+=.1*ss(-.4,0,d)**2;else if(d>=0&&d<.5)tz+=.1*(1-ss(0,.5,d))**2;}
  const Z=1+tz+.03*uk;
  let emo=emoAt(t,KFE);const face=faceFor(t,emo);
  let pun=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.7)pun+=Math.exp(-a*8)*Math.sin(Math.min(a*18,Math.PI));}
  const e={tilt:Math.sin(t*.9)*.012,hx:0,hy:0,by:Math.sin(t*2.3)*3,lean:Math.sin(t*.7)*.006,sq:Math.sin(t*2.3)*.004+pun*.02,bx:0};
  if(emo==='fear'||emo==='hectic'){e.hx+=Math.sin(t*47)*3;e.hy+=Math.cos(t*41)*2;}
  if(emo==='shock'){e.tilt-=.05;e.hy-=8;}
  if(emo==='resign'||emo==='strain'){e.tilt+=.05;e.hy+=10;e.by+=4;}
  if(emo==='happy'||emo==='laugh'||emo==='wink'){e.by-=Math.abs(Math.sin(t*6.5))*10;e.tilt+=Math.sin(t*3)*.03;}
  // physical reactions to the story
  if(si===0){const k=ss(T.gol0,T.gol0+.4,t),k2=ss(T.vol-.1,T.vol+.5,t);e.lean+=k*.1+k2*.12;e.bx+=k*40+k2*120;e.tilt+=k*.08+k2*.18;}
  if(si===2&&t>T.fren){const k=ss(T.fren,T.fren+.4,t);e.lean+=k*.16+Math.sin(t*22)*.01;e.bx+=k*70;e.tilt+=k*.14;}
  if(si===3&&t>T.vie){const k=ss(T.vie,T.sup,t);e.lean+=k*.2+Math.sin(t*28)*.015;e.bx+=k*90+Math.sin(t*31)*6;e.tilt+=k*.2;}
  if(si===4){const k=ss(T.desb,T.olas+.6,t);e.hy-=k*12;e.hx+=Math.sin(t*25)*2*k;}
  if(si===6&&t>T.polos){e.hx+=Math.sin(t*42)*2.5;e.by+=Math.sin(t*38)*1.5;}
  g.save();g.translate(540+Math.sin(t*61)*6*shake,1000+Math.cos(t*53)*5*shake);g.scale(Z,Z);g.translate(-540,-1000);
  CAMS.x=Math.sin(t*.35)*30;
  BGF[si](g,t);
  // character
  const SC=.72,PV=1734,cx=540;let bs=SC*(1+.035*pun);
  CHG.setTransform(1,0,0,1,0,0);CHG.clearRect(0,0,W,H);drawPeep(CHG,cx,PV,bs,{body:'Hoodie',face,tilt:e.tilt,hx:e.hx,hy:e.hy,bx:e.bx,by:e.by,lean:e.lean,sq:e.sq,tired:si===5?clamp((t-T.sol)/5)*.7:0});
  const warm=si<=2||si===5;
  CHG.save();CHG.globalCompositeOperation='source-atop';CHG.fillStyle=lin(CHG,cx+360,PV-800,cx-60,PV-250,[[0,warm?'rgba(255,190,120,.30)':'rgba(140,165,255,.24)'],[.5,'rgba(255,255,255,0)']]);CHG.fillRect(0,0,W,H);CHG.fillStyle=lin(CHG,0,PV-300,0,PV,[[0,'rgba(10,8,40,0)'],[1,'rgba(10,8,40,.16)']]);CHG.fillRect(0,0,W,H);
  if(si===3){CHG.fillStyle='rgba(150,110,80,.12)';CHG.fillRect(0,0,W,H);} if(si===6||(si===5&&t>T.noche)){CHG.fillStyle='rgba(150,210,255,.12)';CHG.fillRect(0,0,W,H);}CHG.restore();
  g.save();g.shadowColor='rgba(8,4,20,.5)';g.shadowBlur=46;g.shadowOffsetX=-22;g.shadowOffsetY=20;g.drawImage(CH,0,0);g.restore();
  railingFG(g,t);
  const hp=[cx-20*bs+e.bx,PV+e.by-(1131-330)*bs];drawSweat(g,hp[0]+150*bs,hp[1]-70,(emo==='fear'||emo==='hectic'||emo==='strain')?1:0,t);
  if(si===6||(si===5&&t>T.noche)){g.save();g.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<14;i++){const ph=((t*.5+rng(i)*3)%1);g.globalAlpha=.6*(1-ph);g.beginPath();g.arc(hp[0]-150+rng(i+3)*300,hp[1]-190-ph*80,3+rng(i)*4,0,7);g.fill();}g.restore();}
  g.restore();
  POSTG.globalCompositeOperation='copy';POSTG.drawImage(CV,0,0,POST.width,POST.height);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=.2;g.filter='blur(6px)';g.drawImage(POST,-20,-20,W+40,H+40);g.filter='none';g.restore();
  g.save();g.fillStyle=rad(g,540,1000,480,1300,[[0,'#000',0],[1,'#06031a',.5]]);g.fillRect(0,0,W,H);g.restore();
  g.save();g.globalAlpha=.06;g.globalCompositeOperation='overlay';const gi=Math.floor(t*24)%6;g.fillStyle=g.createPattern(GRAIN[gi],'repeat');g.translate((gi*53)%256,(gi*97)%256);g.fillRect(-256,-256,W+256,H+256);g.restore();
  for(let b=1;b<NS;b++){const d=t-ST[b];if(d<-.4||d>.4)continue;transition(g,b,d);}
}
