let TLD=null;const ST=[],ENDS=[];let TOTAL=0,SEGS=[],NS=0;
function initTimeline(d){TLD=d;ST.push(...d.starts);TOTAL=d.total;SEGS=d.segs;NS=ST.length;for(let i=0;i<NS;i++)ENDS.push(i<NS-1?ST[i+1]:TOTAL);}
const sceneAt=t=>{for(let i=0;i<NS;i++)if(t<ENDS[i])return i;return NS-1;};
const wordT=(seg,key)=>{for(const w of SEGS[seg].words)if(w[0].toLowerCase().includes(key))return ST[seg]+w[1];return ST[seg]+.5;};
let T={};function initWords(){T={entie:wordT(0,'entierran'),panic0:wordT(0,'pánico'),horas:wordT(1,'horas'),agit:wordT(1,'agites'),panic:wordT(2,'pánico'),resp:wordT(2,'respiras'),oxi:wordT(2,'oxígeno'),
  dio:wordT(3,'dióxido'),mareo:wordT(3,'mareo'),conf:wordT(3,'confusión'),desm:wordT(3,'desmayo'),esc:wordT(4,'escapar'),dos:wordT(4,'dos'),tapa:wordT(4,'tapa'),ced:wordT(4,'cedería'),peso:wordT(4,'peso'),caer:wordT(4,'caería'),
  s19:wordT(5,'diecinueve'),camp:wordT(5,'campanas'),ayuda:wordT(5,'ayuda'),hoy:wordT(6,'hoy'),med:wordT(6,'médico'),cert:wordT(6,'certificar'),pero:wordT(6,'pero'),q15:wordT(6,'quince'),hou:wordT(6,'houdini'),sale:wordT(6,'sale'),
  tierra:wordT(7,'tierra'),girar:wordT(7,'girar'),golpe:wordT(7,'golpe'),sig:wordT(7,'sígueme')};}
function card(g,cx,cy,w,h,k,fill,rot=0){g.translate(cx,cy);g.rotate(rot);g.scale(k,k);g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=40;g.shadowOffsetY=22;g.beginPath();g.roundRect(-w/2,-h/2,w,h,40);inkS(g,fill||lin(g,0,-h/2,0,h/2,[[0,'#2f2f6e'],[1,'#1c1b48']]),10);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;}
function ring(g,x,y,r,w,f,c1,c2,label,sub){g.save();g.translate(x,y);g.lineCap='round';g.lineWidth=w+10;g.strokeStyle=INK;g.beginPath();g.arc(0,0,r,0,7);g.stroke();g.lineWidth=w;g.strokeStyle='rgba(255,255,255,.15)';g.beginPath();g.arc(0,0,r,0,7);g.stroke();
  g.strokeStyle=lin(g,-r,-r,r,r,[[0,c1],[1,c2]]);g.shadowColor=c2;g.shadowBlur=18;g.beginPath();g.arc(0,0,r,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(.001,f));g.stroke();g.shadowBlur=0;
  g.fillStyle='#fff';g.font=`700 ${r*.52}px ${FONT_M}`;g.textAlign='center';g.textBaseline='middle';g.fillText(label,0,-r*.06);if(sub){g.fillStyle='#9fb0e8';g.font=`700 ${r*.2}px ${FONT_M}`;g.fillText(sub,0,r*.42);}g.restore();}
function sideCoffin(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(-170,-40);g.lineTo(170,-40);g.lineTo(210,0);g.lineTo(150,50);g.lineTo(-150,50);g.lineTo(-210,0);g.closePath();inkS(g,'#3a2418',8);
  g.beginPath();g.moveTo(-150,-28);g.lineTo(150,-28);g.lineTo(186,0);g.lineTo(136,38);g.lineTo(-136,38);g.lineTo(-186,0);g.closePath();g.fillStyle='#1b2b4a';g.fill();g.restore();}
// ===== S0 =====
function drawS0(g,t){const u=t-ST[0];const lower=eio(clamp((u-.3)/2.6));const cy=SURF-90+lower*400,sh=u>T.panic0-.4?Math.sin(t*38)*5:0;
  drawGrave(g,t,1,0);
  // ropes
  g.save();g.strokeStyle=INK;g.lineWidth=7;for(const dx of [-130,130]){g.beginPath();g.moveTo(540+dx,SURF-130);g.lineTo(540+dx*.9,cy-62);g.stroke();}g.restore();
  g.save();g.beginPath();g.rect(330,0,420,H);g.clip();drawCoffin(g,540+sh,cy,.95,0);g.restore();
  // falling soil
  if(u>2.4){for(let i=0;i<26;i++){const ph=((t*1.6+rng(i)*3)%1),x=360+rng(i+3)*360,y=SURF-40+ph*(cy-SURF+20);if(y>cy-50)continue;g.fillStyle='#5a3a26';g.beginPath();g.arc(x,y,4+rng(i+9)*7,0,7);g.fill();g.strokeStyle=INK;g.lineWidth=2.5;g.stroke();}}
  // knocks after 'pánico'
  if(u>T.panic0-ST[0]){for(let i=0;i<3;i++){const a=((t-T.panic0)*2.2-i*.3);if(a<0||a>1)continue;g.save();g.translate(540,cy-70);g.globalAlpha=1-a;g.strokeStyle='#ffd166';g.lineWidth=8;g.lineCap='round';for(const s of [-1,1]){g.beginPath();g.moveTo(s*(70+a*50),-10);g.lineTo(s*(100+a*70),-30);g.moveTo(s*(76+a*50),10);g.lineTo(s*(116+a*70),12);g.stroke();}g.restore();}}
}
// ===== S1: air =====
function drawS1(g,t){const u=t-ST[1],k=eob(clamp(u/.6),1.2);g.save();card(g,540,720,880,440,k);
  g.fillStyle='#9fb0e8';g.font=`700 30px ${FONT_M}`;g.textAlign='left';g.textBaseline='middle';g.fillText('AIRE DENTRO DEL ATAÚD',-400,-176);
  sideCoffin(g,-110,50,.95);
  // air volume with bubbles
  g.save();g.beginPath();g.moveTo(-286,-8);g.lineTo(46,-8);g.lineTo(80,40);g.lineTo(-26,78);g.lineTo(-250,78);g.lineTo(-296,40);g.closePath();g.fillStyle='rgba(120,200,255,.25)';g.fill();g.clip();
  for(let i=0;i<9;i++){const ph=((t*.3+rng(i)*3)%1);const x=-270+rng(i+4)*320,y=70-ph*70;g.globalAlpha=1-ph;g.strokeStyle='#bfe6ff';g.lineWidth=3;g.beginPath();g.arc(x,y,6+rng(i+7)*6,0,7);g.stroke();}g.restore();
  const f=1-.35*clamp((t-T.horas+1)/3.5);ring(g,260,10,118,28,f,'#7ae0ff','#3ea0ff','O₂','AIRE');
  // hourglass
  g.save();g.translate(-60,-90);g.scale(.8,.8);g.beginPath();g.moveTo(-34,-60);g.lineTo(34,-60);g.lineTo(6,0);g.lineTo(34,60);g.lineTo(-34,60);g.lineTo(-6,0);g.closePath();inkS(g,'rgba(255,255,255,.15)',6);const sf=clamp((t-T.horas+.5)/4);
  g.fillStyle='#ffd166';g.beginPath();g.moveTo(-26*(1-sf),-54+sf*40);g.lineTo(26*(1-sf),-54+sf*40);g.lineTo(2,-4);g.lineTo(-2,-4);g.closePath();g.fill();g.beginPath();g.moveTo(-28*sf,54);g.lineTo(28*sf,54);g.lineTo(0,54-46*sf);g.closePath();g.fill();g.fillRect(-1.5,-6,3,56);g.restore();
  g.restore();}
// ===== S2: panic =====
function drawS2(g,t){const u=t-ST[2],k=eob(clamp(u/.6),1.2);const pan=ss(T.panic-.2,T.resp+.5,t);g.save();card(g,540,720,880,440,k);
  const br=Math.abs(Math.sin(t*(2+pan*5)*Math.PI*.5));
  // lungs
  g.save();g.translate(-290,10);g.scale(1+br*.12,1+br*.1);for(const s of [-1,1]){g.beginPath();g.moveTo(s*8,-70);g.bezierCurveTo(s*80,-72,s*100,20,s*70,80);g.bezierCurveTo(s*40,96,s*10,70,s*8,-10);g.closePath();inkS(g,lin(g,0,-70,0,90,[[0,'#ff9db0'],[1,'#ff6a86']]),7);}g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(0,-90);g.lineTo(0,-30);g.stroke();g.restore();
  // heart rate
  g.save();g.translate(0,10);g.beginPath();g.roundRect(-150,-90,300,180,24);inkS(g,'#0e1a22',6);g.strokeStyle='#3effa0';g.lineWidth=6;g.lineJoin='round';g.beginPath();for(let i=0;i<=44;i++){const x=-136+i*6.2,ph=((i/44)*(2+pan*3)+t*(.8+pan*1.6))%1;let y=0;if(ph>.46&&ph<.5)y=-60;else if(ph>=.5&&ph<.54)y=34;else if(ph>=.4&&ph<.46)y=-8;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
  g.fillStyle='#3effa0';g.font=`700 38px ${FONT_M}`;g.textAlign='center';g.fillText(String(Math.round(70+pan*80+Math.sin(t*9)*4)),0,-62);g.restore();
  const f=.65-.4*clamp((t-T.panic+.3)/3.6);ring(g,265,10,112,26,f,'#ffb36a',f<.35?'#ff3b4a':'#ff7a3a','O₂',f<.35?'¡BAJO!':'AIRE');
  g.restore();}
// ===== S3: CO2 =====
function drawS3(g,t){const u=t-ST[3],k=eob(clamp(u/.6),1.2);g.save();card(g,540,720,880,440,k);
  sideCoffin(g,0,70,1.5);g.save();g.beginPath();g.moveTo(-225,28);g.lineTo(225,28);g.lineTo(279,70);g.lineTo(204,127);g.lineTo(-204,127);g.lineTo(-279,70);g.closePath();g.clip();
  const fill=clamp((t-T.dio+.3)/(T.desm-T.dio+1));
  for(let i=0;i<14;i++){const x=-280+rng(i)*560,y=100-fill*200*(.4+.6*rng(i+3))+Math.sin(t*.8+i)*14,r=60+rng(i+5)*40;g.fillStyle=rad(g,x,y,0,r,[[0,'#8f9b70',.75*Math.min(1,fill*2)],[1,'#8f9b70',0]]);g.fillRect(x-r,y-r,r*2,r*2);}
  g.restore();
  g.font=`700 34px ${FONT_M}`;g.textAlign='center';g.fillStyle='#d8e3a8';for(let i=0;i<5;i++){const ph=((t*.25+i*.2)%1);g.globalAlpha=Math.min(1,fill*2)*(1-ph);g.fillText('CO₂',-220+i*110,60-ph*140);}g.globalAlpha=1;
  g.fillStyle='#9fb0e8';g.font=`700 30px ${FONT_M}`;g.textAlign='left';g.fillText('DIÓXIDO DE CARBONO',-400,-176);
  const dz=ss(T.mareo-.1,T.mareo+.4,t);if(dz>0){g.save();g.translate(250,-110);g.globalAlpha=dz;g.rotate(t*5);g.strokeStyle='#ffd166';g.lineWidth=8;g.lineCap='round';g.beginPath();for(let a=0;a<18;a+=.2){const r=2+a*3.4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.stroke();g.restore();}
  const qa=ss(T.conf-.1,T.conf+.4,t);if(qa>0){for(let i=0;i<3;i++){txtInk(g,'?',-200+i*70,-120+Math.sin(t*3+i)*12,56,'#ff9bb8',{stroke:7});}}
  g.restore();}
// ===== S4: weight of soil =====
function drawS4(g,t){const u=t-ST[4];const cy=SURF+340;
  const sink=ss(T.caer-.2,T.caer+.6,t)*14;
  drawCoffin(g,520,cy+sink,.85,0,{crack:clamp((t-T.tapa)/(T.ced-T.tapa+.5))});
  // ruler
  const ra=eob(clamp((u-.8)/.6),1.3);g.save();g.globalAlpha=ra;g.translate(900,SURF);g.strokeStyle='#fff7e8';g.lineWidth=6;g.beginPath();g.moveTo(0,0);g.lineTo(0,340);g.stroke();for(let i=0;i<=17;i++){g.beginPath();g.moveTo(i%5?0:-22,i*20);g.lineTo(i%5?18:22,i*20);g.stroke();}
  g.fillStyle='#ffd166';g.beginPath();g.moveTo(-14,0);g.lineTo(14,0);g.lineTo(0,18);g.closePath();g.fill();g.beginPath();g.moveTo(-14,340);g.lineTo(14,340);g.lineTo(0,322);g.closePath();g.fill();
  txtInk(g,'≈ 1,8 m',-6,170,46,'#fff7e8',{font:FONT_M,weight:700,align:'right',stroke:7});g.restore();
  // weight arrows
  const wa=ss(T.ced-.8,T.ced+.2,t);if(wa>0){for(let i=0;i<5;i++){const x=380+i*70,y=SURF+80+Math.sin(t*5+i)*10+wa*30;g.save();g.globalAlpha=wa;g.translate(x,y);g.beginPath();g.moveTo(-18,-50);g.lineTo(18,-50);g.lineTo(18,0);g.lineTo(38,0);g.lineTo(0,46);g.lineTo(-38,0);g.lineTo(-18,0);g.closePath();inkS(g,'#ff4a5a',6);g.restore();}}
  // soil falling into coffin
  const fa=ss(T.peso,T.peso+.3,t);if(fa>0)for(let i=0;i<30;i++){const ph=((t*1.8+rng(i)*3)%1),x=420+rng(i+3)*200,y=cy-70+ph*60;g.globalAlpha=fa*(1-ph*.4);g.fillStyle='#5a3a26';g.beginPath();g.arc(x,y,3+rng(i+9)*6,0,7);g.fill();g.strokeStyle=INK;g.lineWidth=2;g.stroke();}g.globalAlpha=1;}
// ===== S5: safety coffin =====
function drawS5(g,t){const u=t-ST[5];const k=eob(clamp(u/.6),1.1);g.save();card(g,540,700,880,480,k,lin(g,0,-240,0,240,[[0,'#f2e6c4'],[1,'#dcc794']]),-.02);
  const P=()=>{g.beginPath();g.roundRect(-440,-240,880,480,40);};hatch(g,P,.5,10,.07,'#6a4a20');g.save();P();g.clip();
  // ground, coffin, rope, bell post
  g.save();g.translate(170,0);g.fillStyle='#8a6a44';g.fillRect(-640,10,1100,240);g.fillStyle='#5a8a40';g.fillRect(-640,0,1100,26);g.strokeStyle=INK;g.lineWidth=6;g.beginPath();g.moveTo(-640,26);g.lineTo(460,26);g.stroke();
  g.save();g.translate(-40,140);g.scale(.8,.8);g.beginPath();g.moveTo(-170,-40);g.lineTo(170,-40);g.lineTo(210,0);g.lineTo(150,50);g.lineTo(-150,50);g.lineTo(-210,0);g.closePath();inkS(g,'#a8723c',8);g.restore();
  g.beginPath();g.arc(-120,128,22,0,7);inkS(g,'#e0b080',5);g.save();g.strokeStyle=INK;g.lineWidth=5;g.beginPath();g.moveTo(-120,150);g.lineTo(-60,150);g.stroke();g.restore();
  // pipe + rope
  g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(-100,126);g.bezierCurveTo(-90,60,-100,0,-96,-60);g.stroke();
  g.fillStyle='#6a4a30';g.fillRect(-120,-180,16,170);g.strokeStyle=INK;g.lineWidth=5;g.strokeRect(-120,-180,16,170);g.fillRect(-120,-180,150,14);g.strokeRect(-120,-180,150,14);
  const ring_=clamp((t-T.camp+.3)/.5)*(1-ss(T.ayuda+.6,T.ayuda+1.2,t));const sw=Math.sin(t*14)*.5*ring_;
  g.save();g.translate(0,-166);g.rotate(sw);g.beginPath();g.moveTo(-30,60);g.quadraticCurveTo(-34,0,-14,-26);g.lineTo(14,-26);g.quadraticCurveTo(34,0,30,60);g.closePath();inkS(g,lin(g,-30,0,30,0,[[0,'#ffe08a'],[1,'#d89a2a']]),7);g.beginPath();g.arc(0,66,9,0,7);inkS(g,'#7a5a2a',5);g.restore();
  if(ring_>0){g.strokeStyle='#8a1f2a';g.lineWidth=7;g.lineCap='round';for(let i=0;i<3;i++){const a=((t*2+i*.33)%1);g.globalAlpha=ring_*(1-a);for(const s of [-1,1]){g.beginPath();g.arc(0,-130,70+a*70,s>0?-.7:Math.PI-.7+.0,s>0?.7:Math.PI+.7);g.stroke();}}g.globalAlpha=1;}
  g.restore();g.restore();
  g.fillStyle='#2a1c10';g.font=`900 50px ${FONT_S}`;g.textAlign='left';g.textBaseline='middle';g.fillText('ATAÚD DE',-405,-130);g.fillText('SEGURIDAD',-405,-72);g.font=`700 24px ${FONT_M}`;g.fillStyle='#6a4a30';g.fillText('INVENTO DEL SIGLO XIX',-405,-22);
  g.beginPath();g.arc(0,-240,16,0,7);inkS(g,'#d42a3a',5);g.restore();}
// ===== S6: death-verification protocol, then Houdini poster =====
function drawS6(g,t){const u=t-ST[6];
  const swap=ss(T.pero-.1,T.pero+.35,t);
  if(swap<1){g.save();g.translate(-swap*1300,0);const k=eob(clamp(u/.6),1.1);g.save();card(g,540,725,800,400,k,lin(g,0,-200,0,200,[[0,'#fffaf0'],[1,'#ece0c4']]),.012);
    g.fillStyle='#2a1c10';g.font=`900 44px ${FONT_S}`;g.textAlign='left';g.textBaseline='middle';g.fillText('VERIFICACIÓN DE MUERTE',-350,-150);g.fillStyle=INK;g.fillRect(-350,-118,700,5);
    const rows=['SIN PULSO','SIN RESPIRACIÓN','PUPILAS FIJAS'];
    rows.forEach((r,i)=>{const y=-62+i*76,ta=T.hoy+.5+i*.55,a=eob(clamp((t-ta)/.35),1.3);g.save();g.globalAlpha=Math.min(1,a*2);g.translate(0,(1-a)*14);
      g.beginPath();g.roundRect(-350,y-26,52,52,10);inkS(g,'#fff',6);g.fillStyle='#2a1c10';g.font=`800 38px ${FONT_D}`;g.fillText(r,-272,y+2);
      const ck=eob(clamp((t-ta-.3)/.3),1.8);if(ck>0){g.save();g.translate(-324,y);g.scale(ck,ck);g.strokeStyle='#1f9a4a';g.lineWidth=12;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(-16,2);g.lineTo(-4,16);g.lineTo(20,-16);g.stroke();g.restore();}
      g.restore();});
    const sa=eob(clamp((t-T.cert)/.28),1.8);if(sa>0){g.save();g.translate(190,95);g.rotate(-.14);const sc=2.2-1.2*sa;g.scale(sc,sc);g.globalAlpha=Math.min(1,sa*2);g.strokeStyle='#c0262e';g.lineWidth=11;g.beginPath();g.roundRect(-165,-46,330,92,16);g.stroke();g.fillStyle='#c0262e';g.font=`900 54px ${FONT_D}`;g.textAlign='center';g.fillText('CERTIFICADO',0,4);g.restore();}
    g.restore();g.restore();}
  if(swap>0){g.save();g.translate((1-swap)*1300,0);g.save();card(g,540,725,800,420,1,lin(g,0,-210,0,210,[[0,'#e8402f'],[1,'#a8201c']]),-.02);
    g.fillStyle='#fff3d6';g.beginPath();g.roundRect(-362,-182,724,364,22);g.fill();g.lineWidth=6;g.strokeStyle=INK;g.stroke();
    g.fillStyle='#8a1f2a';g.font=`900 130px ${FONT_S}`;g.textAlign='center';g.textBaseline='middle';g.fillText('1915',0,-100);g.fillStyle=INK;g.fillRect(-290,-30,580,6);
    g.fillStyle='#2a1c10';g.font=`900 52px ${FONT_S}`;g.fillText('HOUDINI',0,14);g.font=`700 30px ${FONT_M}`;g.fillStyle='#6a4a30';g.fillText('¡ENTERRADO VIVO!',0,62);
    for(let i=0;i<9;i++){const x=-320+i*80,y=130+Math.sin(t*2+i)*4;g.save();g.translate(x,y);g.beginPath();g.ellipse(0,0,i%2?16:30,i%2?30:16,0,0,7);g.lineWidth=11;g.strokeStyle=INK;g.stroke();g.lineWidth=6;g.strokeStyle='#c8cfdc';g.stroke();g.restore();}
    g.restore();g.restore();}
}
// ===== S7: globe =====
function drawS7(g,t){const u=t-ST[7];
  g.fillStyle=lin(g,0,0,0,H,[[0,'#050722'],[.55,'#101a55'],[1,'#0a0630']]);g.fillRect(0,0,W,H);
  g.fillStyle='#fff';for(let i=0;i<90;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.2+i));g.beginPath();g.arc(rng(i)*W,rng(i+9)*1000,1+rng(i+4)*1.8,0,7);g.fill();}g.globalAlpha=1;
  const stop=t>=T.golpe;const spin=stop?0:(t-ST[7])*(1.6+ss(T.tierra,T.girar,t)*3.2);const lastSpin=(T.golpe-ST[7])*(1.6+3.2);const ang=stop?lastSpin:spin;
  const k=eob(clamp(u/.7),1.2),cx=540,cy=805,R=100*k;
  glow(g,cx,cy,R*2.2,'#4aa8ff',.5);
  g.save();g.beginPath();g.arc(cx,cy,R,0,7);g.save();g.clip();g.fillStyle=lin(g,cx-R,cy-R,cx+R,cy+R,[[0,'#4fc0ff'],[1,'#1b5ad0']]);g.fillRect(cx-R,cy-R,R*2,R*2);
  g.fillStyle='#4fd070';for(const [lx,ly,lr] of [[-.2,-.25,.42],[.5,.1,.36],[-.5,.45,.3],[.15,.6,.25],[.9,-.3,.3]]){for(const off of [0,Math.PI*2]){const x=cx+Math.sin(ang*.5+lx*3+off*.0)*R*1.1;g.save();g.beginPath();g.ellipse(cx+((lx*R*2+ang*60)%(R*3.2))-R*1.1,cy+ly*R,lr*R*.8,lr*R*.55,lx,0,7);g.fill();g.restore();break;}}
  g.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<5;i++){g.beginPath();g.ellipse(cx+((i*190+ang*90)%(R*3))-R*1.2,cy-R*.5+i*52,50,13,0,0,7);g.fill();}
  g.fillStyle=lin(g,cx-R,0,cx+R,0,[[0,'rgba(0,0,40,0)'],[.6,'rgba(0,0,40,0)'],[1,'rgba(0,0,40,.55)']]);g.fillRect(cx-R,cy-R,R*2,R*2);g.restore();
  g.beginPath();g.arc(cx,cy,R,0,7);g.lineWidth=10;g.strokeStyle=INK;g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(cx-R*.4,cy-R*.5,R*.16,R*.08,-.7,0,7);g.fill();g.restore();
  // speed lines until stop
  if(!stop){g.save();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=5;g.lineCap='round';for(let i=0;i<10;i++){const y=cy-R*.8+i*R*.18,x=cx+R*1.15+((t*400+i*60)%160);g.beginPath();g.moveTo(x,y);g.lineTo(x+60,y);g.stroke();}g.restore();}
  else{const a=t-T.golpe;if(a<.8){g.save();g.strokeStyle=`rgba(255,209,102,${1-a/.8})`;g.lineWidth=10;g.beginPath();g.arc(cx,cy,R+30+a*260,0,7);g.stroke();g.restore();}}
}
