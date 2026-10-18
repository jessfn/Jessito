// ===================== bedroom (parallax, time-of-day) =====================
const PW=W+400,WX=70,WY=500,WW=390,WH=470;let ROOM,ROOMB;
function buildRoom(){const c=offscreen(PW,H),g=c.getContext('2d');
  g.fillStyle=lin(g,0,0,0,H,[[0,'#34327a'],[.55,'#26245c'],[1,'#191746']]);g.fillRect(0,0,PW,H);
  g.globalAlpha=.07;g.fillStyle='#fff';for(let x=0;x<PW;x+=62)g.fillRect(x,0,26,H);g.globalAlpha=1;
  for(let i=0;i<2600;i++){g.fillStyle=`rgba(255,255,255,${.015+.03*rng(i)})`;g.fillRect(rng(i+1)*PW,rng(i+5)*H,2+rng(i+9)*3,2);}
  // wainscot
  g.fillStyle='#211f55';g.fillRect(0,1050,PW,H-1050);g.strokeStyle=INK;g.lineWidth=8;g.beginPath();g.moveTo(0,1050);g.lineTo(PW,1050);g.stroke();
  g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=4;for(let x=40;x<PW;x+=180){g.strokeRect(x,1100,140,300);}
  // window hole + frame
  const wx=WX+200,wy=WY;g.save();g.globalCompositeOperation='destination-out';g.fillRect(wx,wy,WW,WH);g.restore();
  g.lineWidth=14;g.strokeStyle=INK;g.strokeRect(wx,wy,WW,WH);g.lineWidth=8;g.beginPath();g.moveTo(wx+WW/2,wy);g.lineTo(wx+WW/2,wy+WH);g.moveTo(wx,wy+WH*.45);g.lineTo(wx+WW,wy+WH*.45);g.stroke();
  g.lineWidth=5;g.strokeStyle='#e9e2ff';g.strokeRect(wx+7,wy+7,WW-14,WH-14);
  g.beginPath();g.rect(wx-30,wy+WH,WW+60,26);inkS(g,'#c9b8a0',7);
  // curtains
  for(const [cx,sd] of [[wx-26,-1],[wx+WW+26,1]]){g.beginPath();g.moveTo(cx,wy-40);g.lineTo(cx+sd*110,wy-30);g.quadraticCurveTo(cx+sd*150,wy+WH*.6,cx+sd*100,wy+WH+60);g.lineTo(cx-sd*10,wy+WH+60);g.closePath();inkS(g,lin(g,cx,0,cx+sd*140,0,[[0,'#b8486e'],[1,'#7a2c52']]),8);
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=4;for(let i=1;i<5;i++){g.beginPath();g.moveTo(cx+sd*i*22,wy-30);g.quadraticCurveTo(cx+sd*(i*26+20),wy+WH*.5,cx+sd*i*20,wy+WH+55);g.stroke();}}
  g.beginPath();g.rect(wx-60,wy-60,WW+120,16);inkS(g,'#6b4a30',6);
  // shelf + frame + desk
  drawBookshelf(g,wx+WW+160,560,330,170);
  g.save();g.translate(wx+WW+210,330);g.beginPath();g.rect(0,0,0,0);g.restore();
  g.beginPath();g.rect(wx+WW+190,770,150,120);inkS(g,'#1a1640',7);g.fillStyle='#ffb454';g.beginPath();g.arc(wx+WW+265,830,28,0,7);g.fill();g.fillStyle='#4a3a9a';g.fillRect(wx+WW+198,852,134,30);
  g.beginPath();g.rect(wx+WW+160,960,420,26);inkS(g,'#7a5238',8);g.fillStyle='#5a3c28';g.fillRect(wx+WW+180,986,22,70);g.fillRect(wx+WW+540,986,22,70);
  drawPlant(g,wx+WW+215,560,.7,0);
  // laptop
  g.save();g.translate(wx+WW+390,960);g.beginPath();g.moveTo(-96,0);g.lineTo(-84,-110);g.lineTo(84,-110);g.lineTo(96,0);g.closePath();inkS(g,'#2c2a50',7);g.fillStyle='#0f1030';g.fillRect(-72,-98,144,86);g.restore();
  ROOM=c;const b=offscreen(PW,H),bg=b.getContext('2d');bg.filter='blur(7px)';bg.drawImage(c,0,0);ROOMB=b;}
const SKYL=[];
function skylineLayer(seed,minH,maxH,w0,w1){const a=[];let x=-20;for(let i=0;x<WW+60;i++){const w=w0+rng(seed+i)*(w1-w0);a.push({x,w,h:minH+rng(seed+i+40)*(maxH-minH),win:rng(seed+i+80)});x+=w+2;}return a;}
const SKY_A=skylineLayer(3,110,230,36,64),SKY_B=skylineLayer(31,60,150,40,80);
function drawWindowSky(g,t,tod,px){const wx=WX+200+px,wy=WY;g.save();g.beginPath();g.rect(wx,wy,WW,WH);g.clip();
  const [a,b]=skyAt(tod);g.fillStyle=lin(g,0,wy,0,wy+WH,[[0,a],[1,b]]);g.fillRect(wx,wy,WW,WH);
  const nt=nightness(tod);if(nt>.05){g.fillStyle='#fff';for(let i=0;i<40;i++){g.globalAlpha=nt*(.4+.6*Math.abs(Math.sin(t*1.5+i)));g.beginPath();g.arc(wx+rng(i)*WW,wy+rng(i+9)*WH*.6,1+rng(i+3)*1.6,0,7);g.fill();}g.globalAlpha=1;}
  const ang=((tod%1)+1)%1*Math.PI*2-Math.PI/2;const sx=wx+WW/2+Math.cos(ang)*WW*.62,sy=wy+WH*.78+Math.sin(ang)*WH*.7;
  if(nt<.9)drawSun(g,sx,sy,30,t);if(nt>.1)drawMoon(g,wx+WW*.5+Math.cos(ang+Math.PI)*WW*.62,wy+WH*.78+Math.sin(ang+Math.PI)*WH*.7,32,nt);
  const dayc=hex(nt>.5?'#15153f':'#6a5a9a');for(const [arr,sc,yb,cc] of [[SKY_B,1,wy+WH*.75,mixc(hex('#3a3a8a'),hex('#9a8ac0'),1-nt)],[SKY_A,1,wy+WH,mixc(hex('#17173f'),hex('#554a86'),1-nt)]]){g.fillStyle=rgb(cc);
    for(const bd of arr){g.fillRect(wx+bd.x,yb-bd.h,bd.w,bd.h+10);if(nt>.3){g.fillStyle=`rgba(255,214,120,${.8*nt})`;for(let k=0;k<6;k++)if(rng(bd.win*50+k)>.45)g.fillRect(wx+bd.x+6+(k%2)*(bd.w/2-4),yb-bd.h+12+Math.floor(k/2)*26,7,10);g.fillStyle=rgb(cc);}}}
  g.restore();}
function drawRoom(g,t,env){const px=-200-CAMS.x*.5;
  drawWindowSky(g,t,env.tod,px+0);
  g.drawImage(env.blur?ROOMB:ROOM,px,0);
  if(env.blur&&env.blur<1){g.globalAlpha=1-env.blur;g.drawImage(ROOM,px,0);g.globalAlpha=1;}
  // laptop screen + lamp light
  const lx=px+WX+200+WW+390+0;
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=lin(g,lx,780,lx,870,[[0,'rgba(120,180,255,.55)'],[1,'rgba(120,180,255,.2)']]);g.fillRect(lx-72,862,144,86);g.restore();
  glow(g,lx,820,260,'#5aa8ff',.25*(env.screen===undefined?1:env.screen));
  // window light shaft onto wall
  const nt=nightness(env.tod);g.save();g.globalCompositeOperation='screen';g.fillStyle=lin(g,px+WX+200,WY+WH,px+WX+700,1300,[[0,nt>.5?'rgba(150,170,255,.28)':'rgba(255,225,160,.34)'],[1,'rgba(255,225,160,0)']]);
  g.beginPath();g.moveTo(px+WX+200,WY+WH);g.lineTo(px+WX+WW+200,WY+WH);g.lineTo(px+WX+WW+520,1500);g.lineTo(px+WX+120,1500);g.closePath();g.fill();g.restore();
  if(env.tint){g.save();g.globalCompositeOperation='multiply';g.fillStyle=env.tint;g.fillRect(0,0,W,H);g.restore();}
}
