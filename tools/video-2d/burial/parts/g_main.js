let CV,G,POST,POSTG,CH,CHG,FULL,FULLG,GRAIN=[],KFE=[];const PUNCH=[];const CAMS={x:0};
FACE.sleep=['EyesClosed','EyesClosed'];FACE.solemn=['Solemn','Tired'];
const BODIES=['Jacket','Jacket','Jacket','Jacket','Jacket','Turtleneck','Jacket','Coffee'];
function initMain(){
  KFE=[[0,'calm'],[T.entie-.1,'curious'],[T.entie+.35,'shock'],[T.panic0-.3,'strain'],[T.panic0+.2,'fear'],
   [ST[1]+.2,'blank'],[T.agit,'strain'],[ST[2]+.2,'fear'],[T.resp,'hectic'],[T.oxi+.6,'fear'],
   [ST[3]+.2,'strain'],[T.mareo,'blank'],[T.conf,'hectic'],[T.desm-.1,'sleep'],
   [ST[4]+.1,'fear'],[T.tapa,'shock'],[T.peso,'hectic'],
   [ST[5]+.2,'curious'],[T.camp,'strain'],[T.ayuda+.3,'happy'],
   [ST[6]+.1,'calm'],[T.med,'happy'],[T.pero,'curious'],[T.hou,'shock'],[T.sale-.4,'fear'],[T.sale+.5,'resign'],
   [ST[7],'curious'],[T.girar-.2,'shock'],[T.golpe+.4,'blank'],[T.sig-.1,'wink'],[ST[7]+7.0,'laugh']];
  PUNCH.push(T.entie,T.panic0,ST[1],T.resp,ST[3],T.desm,ST[4],T.tapa,T.peso,ST[5],T.camp,ST[6],T.cert,T.hou,ST[7],T.golpe);
  CV=document.getElementById('c');G=CV.getContext('2d');POST=offscreen(W/6,H/6);POSTG=POST.getContext('2d');CH=offscreen(W,H);CHG=CH.getContext('2d');FULL=offscreen(W,H);FULLG=FULL.getContext('2d');
  for(let i=0;i<6;i++){const c=offscreen(256,256),g=c.getContext('2d'),d=g.createImageData(256,256);for(let k=0;k<d.data.length;k+=4){const v=128+(rng(k*.37+i*911)-.5)*140;d.data[k]=d.data[k+1]=d.data[k+2]=v;d.data[k+3]=255;}g.putImageData(d,0,0);GRAIN.push(c);}
  buildEarth();
}
function emoAt(t,K){let i=0;while(i<K.length-1&&t>=K[i+1][0])i++;return K[i][1];}
function lids(g,a){if(a<=.001)return;const e=a*H*.5;g.save();g.fillStyle='#0b0820';g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(W,e-60*a);g.quadraticCurveTo(W/2,e+120*a,0,e-60*a);g.closePath();g.fill();g.beginPath();g.moveTo(0,H);g.lineTo(W,H);g.lineTo(W,H-e+60*a);g.quadraticCurveTo(W/2,H-e-120*a,0,H-e+60*a);g.closePath();g.fill();g.restore();}
function drawSweat(g,x,y,k,t){if(k<=.01)return;g.save();for(let i=0;i<3;i++){const ph=((t*1.3+i*.37)%1),yy=y+ph*70-10+i*14,xx=x+i*34-30+Math.sin(t*9+i)*4;g.globalAlpha=k*(1-ph)*.95;g.fillStyle=lin(g,xx,yy-18,xx,yy+16,[[0,'#e8f7ff'],[1,'#7fd0ff']]);g.strokeStyle='#0b3b5a';g.lineWidth=4;g.beginPath();g.moveTo(xx,yy-22);g.bezierCurveTo(xx+16,yy,xx+14,yy+18,xx,yy+18);g.bezierCurveTo(xx-14,yy+18,xx-16,yy,xx,yy-22);g.fill();g.stroke();}g.restore();}
function transition(g,b,d){const type=[0,'dirt','iris','glitch','crack','page','flash','iris'][b];
  if(type==='dirt'){const p=ss(-.36,0,d)+ss(0,.36,d);const top=H*(1-p),bot=H*(2-p);if(bot<=0||top>=H)return;g.save();g.beginPath();g.moveTo(0,Math.max(0,top));for(let x=0;x<=W+30;x+=30)g.lineTo(x,Math.max(0,top)+(top>0?Math.sin(x*.05+d*8)*16+Math.sin(x*.13)*8:0));g.lineTo(W,Math.min(H,bot));g.lineTo(0,Math.min(H,bot));g.closePath();g.fillStyle=lin(g,0,top,0,top+500,[[0,'#7a5236'],[1,'#4a2e1e']]);g.fill();g.lineWidth=8;g.strokeStyle=INK;g.stroke();
    g.clip();for(let i=0;i<70;i++){g.fillStyle=rng(i)>.5?'rgba(0,0,0,.25)':'rgba(255,220,170,.2)';g.beginPath();g.arc(rng(i+1)*W,top+rng(i+2)*(bot-top),5+rng(i+3)*14,0,7);g.fill();}g.restore();}
  else if(type==='iris'){const p=d<0?ss(-.34,0,d):1-ss(0,.34,d);if(p<=0)return;const r=(1-p)*1500;g.save();g.beginPath();g.rect(0,0,W,H);g.arc(540,960,Math.max(1,r),0,Math.PI*2,true);g.fillStyle='#0b0608';g.fill('evenodd');g.beginPath();g.arc(540,960,Math.max(1,r),0,Math.PI*2);g.lineWidth=14;g.strokeStyle='#5a3a26';g.stroke();g.restore();}
  else if(type==='glitch'){const m=1-Math.abs(d)/.34;if(m<=0)return;FULLG.globalCompositeOperation='copy';FULLG.drawImage(CV,0,0);for(let i=0;i<22;i++){const y=rng(i*7+Math.floor(d*30))*H,h=20+rng(i+3)*120,dx=(rng(i*3+Math.floor(d*40))-.5)*260*m;g.drawImage(FULL,0,y,W,h,dx,y,W,h);}
    g.save();g.globalCompositeOperation='screen';for(let i=0;i<8;i++){g.fillStyle=rng(i+Math.floor(d*30))>.5?`rgba(255,40,140,${.35*m})`:`rgba(40,230,255,${.35*m})`;g.fillRect(0,rng(i*5+Math.floor(d*30))*H,W,8+rng(i)*50);}g.restore();if(Math.abs(d)<.1){g.fillStyle=`rgba(8,6,30,${1-Math.abs(d)/.1})`;g.fillRect(0,0,W,H);}}
  else if(type==='crack'){const m=1-Math.abs(d)/.32;if(m<=0)return;g.save();g.strokeStyle='#fff';g.lineWidth=10;g.lineCap='round';g.lineJoin='round';const L=d<0?(1-m)*0+ss(-.32,0,d):1;for(let i=0;i<7;i++){let x=540,y=960,a=i/7*Math.PI*2+rng(i)*.6;g.beginPath();g.moveTo(x,y);const n=Math.floor(14*L);for(let k=0;k<n;k++){a+=(rng(i*20+k)-.5)*.9;x+=Math.cos(a)*90;y+=Math.sin(a)*90;g.lineTo(x,y);}g.stroke();}
    g.fillStyle=`rgba(255,250,235,${Math.max(0,1-Math.abs(d)/.12)})`;g.fillRect(0,0,W,H);g.restore();}
  else if(type==='page'){const p=ss(-.36,0,d)+ss(0,.36,d);const l=W*(1-p),r=W*(2-p);if(r<=0||l>=W)return;g.save();g.beginPath();g.rect(Math.max(0,l),0,Math.min(W,r)-Math.max(0,l),H);g.clip();g.fillStyle=lin(g,l,0,r,0,[[0,'#f2e6c4'],[.9,'#e2d2a4'],[1,'#c8b480']]);g.fillRect(l,0,r-l,H);g.restore();g.fillStyle=lin(g,l-110,0,l,0,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.35)']]);g.fillRect(Math.max(0,l-110),0,110,H);}
  else if(type==='flash'){const m=Math.max(0,1-Math.abs(d)/.3);if(m<=0)return;g.save();g.fillStyle=`rgba(255,250,235,${.9*m})`;g.fillRect(0,0,W,H);g.restore();}
}
function frame(t){
  const g=G;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';
  const si=sceneAt(t),u=t-ST[si],dur=ENDS[si]-ST[si],uk=u/dur;
  let shake=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.5)shake+=Math.exp(-a*9);}
  if(si===4&&t>T.peso)shake+=.5+.3*Math.sin(t*30);
  let tz=0;for(let b=1;b<NS;b++){const d=t-ST[b];if(d<0&&d>-.4)tz+=.1*ss(-.4,0,d)**2;else if(d>=0&&d<.5)tz+=.1*(1-ss(0,.5,d))**2;}
  const Z=1+tz+.04*uk;g.save();g.translate(540+Math.sin(t*61)*5*shake,1100+Math.cos(t*53)*4*shake);g.scale(Z,Z);g.translate(-540,-1100);CAMS.x=Math.sin(t*.35)*40+u*(si%2?8:-8);
  // ---- background ----
  let warm=true;
  if(si===0){drawEarth(g,t,{scroll:0});}
  else if(si===4){drawEarth(g,t,{scroll:0});}
  else if(si===7){drawS7(g,t);warm=false;}
  else {g.filter='blur(4px)';drawEarth(g,t,{scroll:SURF+500+(si===5?-300:0)});g.filter='none';warm=(si===5||si===6);
    g.save();g.fillStyle=si===5?'rgba(150,100,50,.42)':'rgba(10,8,30,.38)';g.fillRect(0,0,W,H);g.restore();}
  if(si===5){g.save();g.fillStyle='rgba(120,80,40,.0)';g.restore();}
  // ---- props ----
  const fns=[drawS0,drawS1,drawS2,drawS3,drawS4,drawS5,drawS6,null];if(fns[si])fns[si](g,t);
  // ---- character ----
  let emo=emoAt(t,KFE);const face=faceFor(t,emo);const cx=540;let bs=.92;
  let pun=0;for(const p of PUNCH){const a=t-p;if(a>=0&&a<.7)pun+=Math.exp(-a*8)*Math.sin(Math.min(a*18,Math.PI));}
  const e={tilt:Math.sin(t*.9)*.012,hx:0,hy:0,by:Math.sin(t*2.3)*3,lean:Math.sin(t*.7)*.006,sq:Math.sin(t*2.3)*.004+pun*.02};
  if(emo==='fear'||emo==='hectic'){e.hx+=Math.sin(t*47)*3;e.hy+=Math.cos(t*41)*2;}
  if(emo==='hectic'){e.by+=Math.abs(Math.sin(t*9))*6;}
  if(emo==='shock'){e.tilt-=.05;e.hy-=8;}
  if(emo==='resign'||emo==='strain'){e.tilt+=.05;e.hy+=10;e.by+=4;}
  if(emo==='happy'||emo==='laugh'||emo==='wink'){e.by-=Math.abs(Math.sin(t*6.5))*10;e.tilt+=Math.sin(t*3)*.03;}
  if(emo==='sleep'){e.tilt+=.2;e.hy+=40;e.by+=24;}
  if(emo==='blank'&&si===3){e.tilt+=Math.sin(t*3.4)*.07;e.hx+=Math.sin(t*3.4)*12;}
  bs*=1+.035*pun;
  CHG.setTransform(1,0,0,1,0,0);CHG.clearRect(0,0,W,H);
  drawPeep(CHG,cx,1990,bs,{body:BODIES[si],face,tilt:e.tilt,hx:e.hx,hy:e.hy,bx:0,by:e.by,lean:e.lean,sq:e.sq,tired:si===3?.6*clamp((t-T.dio)/4):0});
  CHG.save();CHG.globalCompositeOperation='source-atop';
  CHG.fillStyle=lin(CHG,cx+360,950,cx-60,1500,[[0,warm?'rgba(255,190,120,.30)':'rgba(140,165,255,.24)'],[.5,'rgba(255,255,255,0)']]);CHG.fillRect(0,0,W,H);
  CHG.fillStyle=lin(CHG,cx-360,1300,cx+200,1900,[[0,'rgba(40,30,90,.14)'],[1,'rgba(40,30,90,0)']]);CHG.fillRect(0,0,W,H);
  CHG.fillStyle=lin(CHG,0,1500,0,1990,[[0,'rgba(10,8,40,0)'],[1,'rgba(10,8,40,.18)']]);CHG.fillRect(0,0,W,H);CHG.restore();
  g.save();g.shadowColor='rgba(8,4,20,.5)';g.shadowBlur=46;g.shadowOffsetX=-22;g.shadowOffsetY=20;g.drawImage(CH,0,0);g.restore();
  const hp=[cx-20*bs,1990+e.by-(1131-330)*bs];
  drawSweat(g,hp[0]+150*bs,hp[1]-70,(emo==='fear'||emo==='hectic'||emo==='strain')?1:0,t);
  // dust in underground
  if(si>0&&si<4||si===6){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const x=(rng(i)*W+t*10*(1+rng(i+4)))%W,y=rng(i+2)*H+Math.sin(t*.7+i)*20;g.globalAlpha=.12+.18*rng(i+8);g.drawImage(DOT_,x-5,y-5,10,10);}g.restore();}
  g.restore();
  // ---- whole-frame effects ----
  if(si===3){const tun=ss(T.conf,T.desm+.7,t);if(tun>0){g.save();g.fillStyle=rad(g,540,1000,Math.max(10,700*(1-tun)),1300,[[0,'rgba(5,3,12,0)'],[1,'rgba(5,3,12,.96)']]);g.fillRect(0,0,W,H);g.restore();}
    const wb=ss(T.mareo-.2,T.mareo+.6,t);if(wb>0){FULLG.globalCompositeOperation='copy';FULLG.drawImage(CV,0,0);g.clearRect(0,0,W,H);for(let y=0;y<H;y+=10)g.drawImage(FULL,0,y,W,10,6*wb*Math.sin(y*.012+t*3)-14,y,W+28,10);}
    lids(g,ss(T.desm+.4,T.desm+1.2,t)*.9);}
  // ---- post ----
  POSTG.globalCompositeOperation='copy';POSTG.drawImage(CV,0,0,POST.width,POST.height);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=.2;g.filter='blur(6px)';g.drawImage(POST,-20,-20,W+40,H+40);g.filter='none';g.restore();
  g.save();g.fillStyle=rad(g,540,1000,480,1300,[[0,'#000',0],[1,'#06031a',.55]]);g.fillRect(0,0,W,H);g.restore();
  g.save();g.globalAlpha=.06;g.globalCompositeOperation='overlay';const gi=Math.floor(t*24)%6;g.fillStyle=g.createPattern(GRAIN[gi],'repeat');g.translate((gi*53)%256,(gi*97)%256);g.fillRect(-256,-256,W+256,H+256);g.restore();
  for(let b=1;b<NS;b++){const d=t-ST[b];if(d<-.4||d>.4)continue;transition(g,b,d);}
}
const DOT_=(function(){const c=offscreen(32,32),g=c.getContext('2d');g.fillStyle=rad(g,16,16,0,16,[[0,'#fff',1],[1,'#fff',0]]);g.fillRect(0,0,32,32);return c;})();
