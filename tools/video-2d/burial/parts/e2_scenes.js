// ===================== world (coffin cutaway) scenes =====================
let SHOTS=[];
function initShots(){SHOTS=[
 [[0,.62,540,900],[2.7,.62,540,900],[4.3,2.3,340,1180]],
 [[0,1.1,540,1160],[ST[2]-ST[1],1.45,500,1190]],
 [[0,2.1,350,1170],[ST[3]-ST[2],2.6,340,1180]],
 [[0,2.0,360,1170],[T.desm-ST[3],2.3,340,1180],[T.desm-ST[3]+1.2,1.1,540,1180]],
 [[0,.72,540,980],[T.peso-ST[4]-.4,.72,540,980],[T.peso-ST[4]+.6,1.55,520,1130]],
 [[0,.72,540,960],[T.camp-ST[5]-.3,.72,540,960],[T.camp-ST[5]+.7,1.2,600,780]]];}
function camAt(si,u){const S=SHOTS[si];let i=0;while(i<S.length-2&&u>=S[i+1][0])i++;const a=S[i],b=S[Math.min(i+1,S.length-1)];const k=eio(clamp((u-a[0])/Math.max(.05,b[0]-a[0])));
  const z=Math.exp(lerp(Math.log(a[1]),Math.log(b[1]),k));return [z,lerp(a[2],b[2],k),lerp(a[3],b[3],k)];}
function holeDraw(g,open,dy){const y0=SURF,hd=900*open;g.save();g.beginPath();g.rect(30,y0,1020,hd);g.fillStyle=lin(g,0,y0,0,y0+hd,[[0,'#2b1a12'],[1,'#140b08']]);g.fill();g.lineWidth=7;g.strokeStyle=INK;g.stroke();
  g.strokeStyle='rgba(255,220,170,.1)';g.lineWidth=3;for(let i=0;i<17;i++){g.beginPath();g.moveTo(50,y0+i*52);g.lineTo(1030,y0+i*52+8);g.stroke();}g.restore();
  for(const [x,s] of [[-20,1.4],[1100,1.5]]){g.save();g.translate(x,y0+8);g.scale(s,s);g.beginPath();g.moveTo(-160,0);g.quadraticCurveTo(-60,-110,0,-112);g.quadraticCurveTo(70,-110,170,0);g.closePath();inkS(g,lin(g,0,-110,0,0,[[0,'#8a5c38'],[1,'#5a3a26']]),7);g.restore();}}
const mouthXY=()=>faceWorld(500,376);
function worldScene(g,t,si,face,e){
  const u=t-ST[si];const pan=si===2?ss(T.panic-.2,T.resp+.5,t):0;
  g.fillStyle='#150f3a';g.fillRect(-1500,-3000,4200,3000);drawEarth(g,t,{scroll:0});
  let dyc=0,lidShake=0,crack=0,air=1,co2=0,trick=0,pile=0,open=0;
  if(si===0){open=1;const lower=eio(clamp((u-.3)/2.7));dyc=-760+lower*760;}
  if(si===0)holeDraw(g,1);
  if(si===1)air=1-.4*clamp((t-T.horas+1)/4);
  if(si===2){air=.6-.45*clamp((t-T.panic+.4)/3.8);lidShake=Math.sin(t*40)*3*pan;}
  if(si===3){air=.15;co2=clamp((t-T.dio+.3)/(T.desm-T.dio+1.2));}
  if(si===4){air=.12;co2=.7;crack=clamp((t-T.tapa)/(T.ced-T.tapa+.5));trick=ss(T.ced,T.ced+.4,t);pile=ss(T.peso,T.caer+1.5,t)*.8;dyc=ss(T.caer-.2,T.caer+.6,t)*10;}
  if(si===5){air=.1;co2=.7;}
  // ropes + coffin
  g.save();g.translate(0,dyc);
  if(si===0){g.strokeStyle=INK;g.lineWidth=9;for(const x of [200,880]){g.beginPath();g.moveTo(x,SURF-250);g.lineTo(x,950);g.stroke();}}
  g.save();g.translate(lidShake,0);
  coffinBack(g,t,air);
  g.save();poly(g,INNP);g.clip();
  if(air>.05&&si<4)bubblesO2(g,t,22,.8*air);
  co2Clouds(g,t,co2*(si===3?1:.55));
  g.restore();
  personLying(g,t,face,e);blanket(g,t);
  // interior light & vignette
  g.save();poly(g,INNP);g.clip();g.globalCompositeOperation='screen';g.fillStyle=rad(g,350,1150,0,420,[[0,'#7a8ad0',.22],[1,'#7a8ad0',0]]);g.fillRect(0,900,W,540);g.globalCompositeOperation='source-over';g.fillStyle=lin(g,0,978,0,1404,[[0,'rgba(5,3,14,.55)'],[.4,'rgba(5,3,14,0)'],[1,'rgba(5,3,14,.35)']]);g.fillRect(0,978,W,430);g.restore();
  // breath
  const mp=mouthXY();const rate=si===2?1.2+pan*2.6:(si===3?1.1:.5);if(!(face==='EyesClosed'&&si>0)&&!(si===0&&t<T.entie))breath(g,mp[0],mp[1]-8,t,rate,.55);
  soilTrickle(g,t,trick,crack);soilPile(g,pile);
  lidPlanks(g,t,{crack});
  g.restore();g.restore();
  if(si===5){// rope + pipe + bell
    const x=700;g.save();g.strokeStyle=INK;g.lineWidth=18;g.beginPath();g.moveTo(x,940);g.lineTo(x,470);g.stroke();g.strokeStyle='#cdd3de';g.lineWidth=8;g.stroke();
    const ringA=clamp((t-T.camp+.3)/.5)*(1-ss(T.ayuda+.6,T.ayuda+1.2,t));g.strokeStyle='#d8b070';g.lineWidth=6;g.beginPath();g.moveTo(610,1180);g.bezierCurveTo(640,1100+Math.sin(t*14)*10*ringA,x-6,1050,x,940);g.stroke();g.beginPath();g.arc(610,1180,12,0,7);g.strokeStyle=INK;g.lineWidth=5;g.stroke();
    g.fillStyle='#6a4a30';g.fillRect(x-14,360,28,120);g.fillRect(x-14,360,170,18);g.strokeStyle=INK;g.lineWidth=5;g.strokeRect(x-14,360,170,18);
    g.save();g.translate(x+120,378);g.rotate(Math.sin(t*14)*.55*ringA);g.beginPath();g.moveTo(-34,70);g.quadraticCurveTo(-38,0,-16,-30);g.lineTo(16,-30);g.quadraticCurveTo(38,0,34,70);g.closePath();inkS(g,lin(g,-34,0,34,0,[[0,'#ffe08a'],[1,'#d89a2a']]),7);g.beginPath();g.arc(0,76,10,0,7);inkS(g,'#7a5a2a',5);g.restore();
    if(ringA>0){g.strokeStyle='#ffd166';g.lineWidth=8;g.lineCap='round';for(let i=0;i<3;i++){const a=((t*2+i*.33)%1);g.globalAlpha=ringA*(1-a);for(const s of [-1,1]){g.beginPath();g.arc(x+120,420,80+a*90,s>0?-.6:Math.PI-.6,s>0?.6:Math.PI+.6);g.stroke();}}g.globalAlpha=1;}
    g.restore();}
  // annotations
  if(si===1||si===2){g.save();const k=eob(clamp((u-.5)/.6),1.3);g.globalAlpha=Math.min(1,k);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=4;g.setLineDash([10,10]);g.beginPath();g.moveTo(800,860);g.lineTo(760,1050);g.stroke();g.setLineDash([]);
    ring(g,800,790,96,22,Math.max(.02,air),si===1?'#7ae0ff':'#ffb36a',si===1?'#3ea0ff':(air<.3?'#ff3b4a':'#ff7a3a'),'O₂',air<.3?'¡BAJO!':'AIRE');
    if(si===2){g.translate(560,790);g.beginPath();g.roundRect(-120,-70,240,140,22);inkS(g,'#0e1a22',6);g.strokeStyle='#3effa0';g.lineWidth=5;g.lineJoin='round';g.beginPath();for(let i=0;i<=36;i++){const x=-106+i*5.9,ph=((i/36)*(2+pan*3)+t*(.8+pan*1.8))%1;let y=6;if(ph>.46&&ph<.5)y=-44;else if(ph>=.5&&ph<.54)y=34;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.fillStyle='#3effa0';g.font=`700 30px ${FONT_M}`;g.textAlign='center';g.fillText(String(Math.round(70+pan*80)),0,-42);}
    g.restore();}
  if(si===3){const dz=ss(T.mareo-.1,T.mareo+.4,t);if(dz>0){g.save();g.translate(340,1000);g.globalAlpha=dz;g.rotate(t*5);g.strokeStyle='#ffd166';g.lineWidth=7;g.lineCap='round';g.beginPath();for(let a=0;a<18;a+=.2){const r=2+a*3;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.stroke();g.restore();}
    const qa=ss(T.conf-.1,T.conf+.4,t);if(qa>0)for(let i=0;i<3;i++)txtInk(g,'?',230+i*90,940+Math.sin(t*3+i)*10,60,'#ff9bb8',{stroke:7});}
  if(si===4){const ra=eob(clamp((u-.6)/.6),1.3);g.save();g.globalAlpha=ra;g.translate(990,SURF);g.strokeStyle='#fff7e8';g.lineWidth=6;g.beginPath();g.moveTo(0,0);g.lineTo(0,390);g.stroke();for(let i=0;i<=19;i++){g.beginPath();g.moveTo(i%5?0:-24,i*20.5);g.lineTo(i%5?18:24,i*20.5);g.stroke();}
    g.fillStyle='#ffd166';g.beginPath();g.moveTo(-14,0);g.lineTo(14,0);g.lineTo(0,18);g.closePath();g.fill();g.beginPath();g.moveTo(-14,390);g.lineTo(14,390);g.lineTo(0,372);g.closePath();g.fill();txtInk(g,'≈ 1,8 m',-14,200,46,'#fff7e8',{font:FONT_M,weight:700,align:'right',stroke:7});g.restore();
    const wa=ss(T.ced-.8,T.ced+.2,t);if(wa>0)for(let i=0;i<6;i++){const x=180+i*150,y=SURF+120+Math.sin(t*5+i)*10+wa*30;g.save();g.globalAlpha=wa;g.translate(x,y);g.beginPath();g.moveTo(-20,-56);g.lineTo(20,-56);g.lineTo(20,0);g.lineTo(42,0);g.lineTo(0,52);g.lineTo(-42,0);g.lineTo(-20,0);g.closePath();inkS(g,'#ff4a5a',6);g.restore();}}
}
// ===================== S6 backdrops =====================
function hospitalBG(g,t){g.fillStyle=lin(g,0,0,0,H,[[0,'#d8f0f0'],[1,'#a8d4d8']]);g.fillRect(0,0,W,H);g.strokeStyle='rgba(60,120,130,.25)';g.lineWidth=3;for(let x=0;x<W;x+=90){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}for(let y=0;y<H;y+=90){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  g.fillStyle='#7fc0c8';g.fillRect(0,1080,W,H-1080);g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(0,1080);g.lineTo(W,1080);g.stroke();
  // window with blinds
  g.beginPath();g.rect(80,520,300,380);inkS(g,lin(g,0,520,0,900,[[0,'#8fd0ff'],[1,'#d8f0ff']]),9);g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=14;for(let y=540;y<900;y+=36){g.beginPath();g.moveTo(88,y);g.lineTo(372,y);g.stroke();}g.strokeStyle=INK;g.lineWidth=3;for(let y=540;y<900;y+=36){g.beginPath();g.moveTo(88,y+8);g.lineTo(372,y+8);g.stroke();}
  // monitor
  g.save();g.translate(850,720);g.beginPath();g.roundRect(-130,-100,260,200,22);inkS(g,'#1a2a30',8);g.beginPath();g.roundRect(-112,-82,224,164,12);g.fillStyle='#06151a';g.fill();g.strokeStyle='#3effa0';g.lineWidth=5;g.lineJoin='round';g.beginPath();
  const flat=t>T.med-.2&&t<T.pero?1:0;for(let i=0;i<=30;i++){const x=-104+i*6.9,ph=((i/30)*2+t*.9)%1;let y=0;if(!flat&&ph>.46&&ph<.5)y=-50;else if(!flat&&ph>=.5&&ph<.54)y=30;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.restore();
  g.fillStyle='#fff';g.beginPath();g.arc(540,260,0,0,7);g.fill();}
function theatreBG(g,t){g.fillStyle=lin(g,0,0,0,H,[[0,'#2a0a14'],[1,'#12060c']]);g.fillRect(0,0,W,H);
  for(const sd of [-1,1]){const x0=sd<0?0:W;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+sd*-330,0);g.quadraticCurveTo(x0+sd*-230,700,x0+sd*-300,1500);g.lineTo(x0,1500);g.closePath();inkS(g,lin(g,x0,0,x0-sd*330,0,[[0,'#7a0f1e'],[1,'#c0263a']]),9);g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=5;for(let i=1;i<6;i++){g.beginPath();g.moveTo(x0-sd*i*55,0);g.quadraticCurveTo(x0-sd*(i*55+30),700,x0-sd*i*50,1500);g.stroke();}}
  g.save();g.globalCompositeOperation='screen';g.fillStyle=lin(g,540,0,540,1500,[[0,'rgba(255,230,160,.55)'],[1,'rgba(255,230,160,.0)']]);g.beginPath();g.moveTo(480,0);g.lineTo(600,0);g.lineTo(900,1500);g.lineTo(180,1500);g.closePath();g.fill();g.restore();
  g.fillStyle=lin(g,0,1080,0,H,[[0,'#6a4224'],[1,'#3a2214']]);g.fillRect(0,1080,W,H-1080);g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(0,1080);g.lineTo(W,1080);g.stroke();g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=4;for(let x=-200;x<1300;x+=140){g.beginPath();g.moveTo(540+(x-540)*.3,1080);g.lineTo(x,H);g.stroke();}}
