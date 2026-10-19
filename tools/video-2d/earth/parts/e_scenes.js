let TLD=null;const ST=[],ENDS=[];let TOTAL=0,SEGS=[],NS=0;
function initTimeline(d){TLD=d;ST.push(...d.starts);TOTAL=d.total;SEGS=d.segs;NS=ST.length;for(let i=0;i<NS;i++)ENDS.push(i<NS-1?ST[i+1]:TOTAL);}
const sceneAt=t=>{for(let i=0;i<NS;i++)if(t<ENDS[i])return i;return NS-1;};
const wordT=(seg,key)=>{for(const w of SEGS[seg].words)if(w[0].toLowerCase().includes(key))return ST[seg]+w[1];return ST[seg]+.5;};
let T={};function initWords(){T={gol0:wordT(0,'golpe'),vol:wordT(0,'volando'),mil:wordT(1,'mil'),eco:wordT(1,'ecuador'),notas:wordT(1,'notas'),
  fren:wordT(2,'frenara'),edif:wordT(2,'edificios'),aire:wordT(2,'aire'),este:wordT(2,'este'),vie:wordT(3,'viento'),sup:wordT(3,'supersónicas'),arr:wordT(3,'arrasaría'),
  oce:wordT(4,'océanos'),desb:wordT(4,'desbordarían'),olas:wordT(4,'olas'),dia:wordT(5,'día'),ano:wordT(5,'año'),sol:wordT(5,'sol'),noche:wordT(5,'noche'),
  polos:wordT(6,'polos'),fre6:wordT(6,'frenazo'),vida:wordT(6,'vida'),sobre:wordT(6,'sobreviviría'),luna:wordT(7,'luna'),desap:wordT(7,'desaparece'),sig:wordT(7,'sígueme')};}
function card(g,cx,cy,w,h,k,fill,rot=0){g.translate(cx,cy);g.rotate(rot);g.scale(k,k);g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=40;g.shadowOffsetY=22;g.beginPath();g.roundRect(-w/2,-h/2,w,h,40);inkS(g,fill||lin(g,0,-h/2,0,h/2,[[0,'#2f2f6e'],[1,'#1c1b48']]),10);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;}
const mixc2=(a,b,k)=>rgb(mixc(hex(a),hex(b),k));
// ---------- per-scene panoramas ----------
function bgS0(g,t){const u=t-ST[0];const hit=ss(T.gol0,T.gol0+.45,t),hit2=ss(T.vol-.2,T.vol+.6,t);
  skyBands(g,'#2a2a6a','#c8607a','#ffb070');drawSun(g,260,HZ-110,46,t);for(let i=0;i<4;i++)cloudInk(g,((i*330+t*14+hit*400)%1500)-200,560+i*80,1.2+i*.2,'#ffd8c8',.9);
  drawCity(g,t,{shear:hit*.55+hit2*.4,tx:hit*30+hit2*90,lit:true,haze:'#b07ab4',fly:hit2*200});
  seaBand(g,t,HZ,HZ+170,'#e0786a','#3a2a6a');groundBand(g,t,'rgba(70,30,110,.35)');boatInk(g,760+hit*120,HZ+60,.8,hit*.15);
  palmInk(g,70,1300,520,t,hit*.3+hit2*.4,1);palmInk(g,1010,1300,560,t,hit*.35+hit2*.45,1.05);
  for(let i=0;i<5;i++)birdInk(g,(300+i*130+hit*900+(i*40)+t*20*(hit>.1?30:1))%1300-100,600+i*50,.9,t,i);
  debris(g,t,T.gol0+.2,2.4,22,1500);speedLines(g,t,hit2*.8);
  if(Math.abs(t-T.gol0)<.12){g.fillStyle=`rgba(255,255,255,${.7*(1-Math.abs(t-T.gol0)/.12)})`;g.fillRect(-100,-100,W+200,H+200);}}
function bgS1(g,t){const u=t-ST[1];skyBands(g,'#3a9ae8','#8fd0ff','#e8f6ff');drawSun(g,820,420,40,t);for(let i=0;i<5;i++)cloudInk(g,((i*300-t*16)%1500+1500)%1500-200,520+i*70,1.1+i*.15,'#ffffff',.95);
  drawCity(g,t,{lit:false,haze:'#9ab4d8'});seaBand(g,t,HZ,HZ+170,'#3aa8d8','#1c5aa8');groundBand(g,t,null);boatInk(g,300,HZ+60,.8,Math.sin(t*1.5)*.05);
  palmInk(g,70,1300,520,t,0,1);palmInk(g,1010,1300,560,t,0,1.05);
  // globe card
  const k=eob(clamp(u/.6),1.2);g.save();card(g,540,730,820,380,k);
  globeInk(g,-250,6,125,t*1.4);
  // equator arrow
  g.strokeStyle='#ffd166';g.lineWidth=10;g.lineCap='round';g.beginPath();g.moveTo(-250+130,6);g.lineTo(-250+230,6);g.stroke();g.fillStyle='#ffd166';g.beginPath();g.moveTo(-250+250,6);g.lineTo(-250+222,-18);g.lineTo(-250+222,30);g.closePath();g.fill();
  g.beginPath();g.arc(-250+125,6,13,0,7);inkS(g,'#ff5d6c',5);
  const v=Math.round(1670*eio(clamp((t-T.mil+.3)/1.8)));g.fillStyle='#9fb0e8';g.font=`700 28px ${FONT_M}`;g.textAlign='left';g.textBaseline='middle';g.fillText('VELOCIDAD EN EL ECUADOR',-70,-120);
  g.font=`700 130px ${FONT_M}`;g.lineWidth=14;g.strokeStyle=INK;g.strokeText(String(v),-70,-20);g.fillStyle=v>=1670?'#ffd166':'#eaf1ff';g.fillText(String(v),-70,-20);g.font=`700 44px ${FONT_M}`;g.fillStyle='#9fb0e8';g.fillText('km/h',-70,86);
  g.restore();}
function bgS2(g,t){const u=t-ST[2];const brk=ss(T.fren+.15,T.fren+.55,t),slide=ss(T.edif,T.este+.8,t);
  skyBands(g,'#2a2a6a','#c8607a','#ffb070');drawSun(g,260,HZ-110,46,t);for(let i=0;i<4;i++)cloudInk(g,((i*330+t*14+brk*700)%1500)-200,560+i*80,1.2+i*.2,'#ffd8c8',.9);
  drawCity(g,t,{shear:brk*.95,tx:slide*520,lit:true,haze:'#b07ab4',fly:slide*400});seaBand(g,t,HZ,HZ+170,'#e0786a','#3a2a6a');groundBand(g,t,'rgba(70,30,110,.35)');boatInk(g,760+slide*700,HZ+60,.8,brk*.3);
  palmInk(g,70+slide*400,1300,520,t,brk*.7,1);palmInk(g,1010+slide*600,1300,560,t,brk*.8,1.05);
  debris(g,t,T.fren+.2,5,34,1700);speedLines(g,t,brk);}
function bgS3(g,t){const u=t-ST[3];const raze=ss(T.vie+.2,T.arr+1,t),w=ss(T.vie,T.sup,t);
  skyBands(g,'#5a3a2e','#b8825a','#e8b070');
  g.save();g.globalAlpha=.55*w;for(let i=0;i<9;i++){const x=((i*260+t*900)%1700)-300,y=520+rng(i)*480;g.fillStyle=rad(g,x,y,0,260,[[0,'#7a5a44',.8],[1,'#7a5a44',0]]);g.fillRect(x-260,y-260,520,520);}g.restore();
  drawCity(g,t,{shear:.9+w*.2,tx:300+raze*500,raze,lit:false,haze:'#9a7a68',fly:raze*600});seaBand(g,t,HZ,HZ+170,'#8a6a58','#3a2a2a');groundBand(g,t,'rgba(110,70,40,.45)');
  // shock cones
  for(let i=0;i<3;i++){const a=((t-T.sup)*1.4-i*.33);if(a<0||a>1.2)continue;g.save();g.globalAlpha=(1-a/1.2)*.8;g.strokeStyle='#fff3d0';g.lineWidth=10;g.lineCap='round';g.beginPath();g.arc(-120,HZ-250,160+a*1500,-.7,.7);g.stroke();g.restore();}
  debris(g,t,T.vie,6,44,2300,1,'#8a7a68');speedLines(g,t,.9,'255,240,210');}
function bgS4(g,t){const u=t-ST[4];const prog=ss(T.oce+.1,T.olas+1.4,t);
  skyBands(g,'#22303c','#4a6a7a','#8fb0b8');drawCity(g,t,{lit:false,haze:'#6a8a98',tx:prog*60,shear:prog*.5,sink:prog*80});seaBand(g,t,HZ,HZ+170,'#2a6a8a','#103a5a');groundBand(g,t,'rgba(20,40,70,.45)');
  // rising wave
  const topY=HZ-40-prog*560;g.save();g.beginPath();g.moveTo(-100,H);g.lineTo(-100,topY+40);for(let x=-100;x<=W+100;x+=24)g.lineTo(x,topY+Math.sin(x*.012+t*2.4)*16+Math.sin(x*.031-t*3)*8-(x/W)*30*prog);g.lineTo(W+100,H);g.closePath();g.fillStyle=lin(g,0,topY,0,topY+500,[[0,'#6ad0e8'],[.4,'#2a8ac0'],[1,'#0e3a6a']]);g.fill();g.lineWidth=8;g.strokeStyle=INK;g.stroke();
  g.clip();g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<40;i++){const x=rng(i)*(W+200)-100,yy=topY+Math.sin(x*.012+t*2.4)*16+rng(i+4)*30-6;g.beginPath();g.arc(x,yy,8+rng(i+7)*16,0,7);g.fill();}
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=5;for(let i=0;i<8;i++){const y=topY+80+i*90;g.beginPath();g.moveTo(-100,y);for(let x=-100;x<=W+100;x+=30)g.lineTo(x,y+Math.sin(x*.02+t*3+i)*10);g.stroke();}g.restore();
  boatInk(g,((t-T.desb)*260)%1300-100,topY-10+Math.sin(t*3)*14,.9,Math.sin(t*2)*.4);
  if(prog>.5){for(let i=0;i<22;i++){const ph=((t*1.5+rng(i)*3)%1),x=rng(i+3)*W,y=topY-ph*160;g.fillStyle=`rgba(255,255,255,${(1-ph)*.7})`;g.beginPath();g.arc(x,y,5+rng(i)*9,0,7);g.fill();}}}
function sideScene(g,t,hot){ // hot=true day half, false night half
  if(hot){skyBands(g,'#ff7a30','#ffb050','#ffe090');drawSun(g,300,HZ-330,150,t);drawCity(g,t,{lit:false,haze:'#c08060',tint:'rgba(255,120,40,.32)'});
    g.fillStyle=lin(g,0,HZ,0,HZ+200,[[0,'#d8a050'],[1,'#a8682c']]);g.fillRect(-100,HZ,W+200,H);g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(-100,HZ);g.lineTo(W+100,HZ);g.stroke();g.strokeStyle='rgba(60,30,10,.55)';g.lineWidth=5;for(let i=0;i<10;i++){let x=rng(i)*500,y=HZ+30+rng(i+3)*120;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){x+=(rng(i*9+k)-.5)*90;y+=14+rng(k+i)*18;g.lineTo(x,y);}g.stroke();}
    g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=6;for(let i=0;i<5;i++){g.beginPath();for(let x=0;x<=560;x+=20)g.lineTo(x,HZ-100-i*70+Math.sin(x*.04+t*5+i)*8);g.stroke();}}
  else{skyBands(g,'#040820','#102a6a','#2a6a9a');g.fillStyle='#fff';for(let i=0;i<80;i++){g.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.4+i));g.beginPath();g.arc(rng(i)*W,rng(i+9)*HZ,1+rng(i+4)*1.8,0,7);g.fill();}g.globalAlpha=1;
    g.save();g.globalCompositeOperation='screen';for(let a=0;a<3;a++){g.strokeStyle=['rgba(80,255,170,.28)','rgba(120,160,255,.22)','rgba(255,120,220,.18)'][a];g.lineWidth=60;g.beginPath();for(let x=500;x<=W+60;x+=30)g.lineTo(x,380+a*70+Math.sin(x*.01+t*.8+a)*50);g.stroke();}g.restore();
    drawCity(g,t,{lit:true,haze:'#4a6aa8',tint:'rgba(160,220,255,.38)'});g.fillStyle='rgba(255,255,255,.95)';for(const b of BLD){if(b.x<540)continue;g.beginPath();g.moveTo(b.x-2,HZ-b.h+4);g.lineTo(b.x+b.w+2,HZ-b.h+4);g.lineTo(b.x+b.w,HZ-b.h-12);g.lineTo(b.x,HZ-b.h-12);g.closePath();g.fill();g.strokeStyle=INK;g.lineWidth=3;g.stroke();}
    g.fillStyle=lin(g,0,HZ,0,HZ+200,[[0,'#cfe8f8'],[1,'#7aa8c8']]);g.fillRect(-100,HZ,W+200,H);g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(-100,HZ);g.lineTo(W+100,HZ);g.stroke();
    g.fillStyle='rgba(180,230,255,.9)';for(let i=0;i<8;i++){const x=560+i*62,h=40+rng(i)*60;g.beginPath();g.moveTo(x,HZ+10);g.lineTo(x+16,HZ-h);g.lineTo(x+34,HZ+10);g.closePath();inkS(g,'rgba(200,240,255,.95)',4);}}}
function bgS5(g,t){const u=t-ST[5];g.save();g.beginPath();g.rect(-100,-100,640,H+200);g.clip();sideScene(g,t,true);g.restore();
  g.save();g.beginPath();g.rect(540,-100,W,H+200);g.clip();sideScene(g,t,false);g.restore();
  // terminator band
  g.save();g.fillStyle=lin(g,440,0,640,0,[[0,'rgba(255,90,60,0)'],[.5,'rgba(255,90,140,.55)'],[1,'rgba(40,60,160,0)']]);g.fillRect(440,-100,200,H+200);g.restore();
  g.strokeStyle='rgba(255,255,255,.65)';g.lineWidth=5;g.setLineDash([16,14]);g.beginPath();g.moveTo(540,420);g.lineTo(540,1000);g.stroke();g.setLineDash([]);
  const sh=Math.sin(t*20)*3;g.fillStyle='rgba(255,255,255,.0)';g.fillRect(0,0,1,1);}
function bgS6(g,t){const u=t-ST[6];const die=ss(T.vida-.3,T.sobre+.8,t);
  skyBands(g,'#06102a','#0e3a4a','#1a6a7a');g.fillStyle='#fff';for(let i=0;i<70;i++){g.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.4+i));g.beginPath();g.arc(rng(i)*W,rng(i+9)*HZ*.8,1+rng(i+4)*1.8,0,7);g.fill();}g.globalAlpha=1;
  g.save();g.globalCompositeOperation='screen';for(let a=0;a<4;a++){g.strokeStyle=['rgba(80,255,170,.3)','rgba(120,255,220,.24)','rgba(160,120,255,.2)','rgba(255,120,200,.16)'][a];g.lineWidth=70;g.globalAlpha=1-die*.8;g.beginPath();for(let x=-40;x<=W+60;x+=30)g.lineTo(x,430+a*60+Math.sin(x*.008+t*.6+a)*60);g.stroke();}g.restore();
  g.beginPath();g.moveTo(-100,HZ);g.bezierCurveTo(200,HZ-90,420,HZ-30,640,HZ-70);g.bezierCurveTo(820,HZ-100,980,HZ-30,1200,HZ-60);g.lineTo(1200,H);g.lineTo(-100,H);g.closePath();inkS(g,lin(g,0,HZ-100,0,H,[[0,'#f4fbff'],[1,'#a8c8e8']]),8);
  for(const [x,h] of [[110,120],[190,80],[960,140],[900,70]]){g.beginPath();g.moveTo(x,HZ-20);g.lineTo(x+22,HZ-20-h);g.lineTo(x+46,HZ-20);g.closePath();inkS(g,'rgba(190,235,255,.95)',5);}
  // pole + flag
  g.save();g.translate(1000,HZ-30);g.strokeStyle=INK;g.lineWidth=16;g.beginPath();g.moveTo(0,0);g.lineTo(0,-260);g.stroke();g.strokeStyle='#e8eef8';g.lineWidth=8;g.stroke();for(let i=0;i<6;i++){g.fillStyle=i%2?'#e0303c':'#fff';g.fillRect(-4,-i*40-40,8,40);}
  g.beginPath();g.moveTo(4,-260);g.quadraticCurveTo(50,-250+Math.sin(t*2)*6,100,-240);g.lineTo(100,-190);g.quadraticCurveTo(50,-200,4,-210);g.closePath();inkS(g,'#46f0a0',5);g.restore();
  // card: speed per latitude
  const k=eob(clamp(u/.6),1.2);g.save();card(g,540,730,820,380,k);
  g.fillStyle='#9fb0e8';g.font=`700 28px ${FONT_M}`;g.textAlign='left';g.textBaseline='middle';g.fillText('VELOCIDAD DE GIRO SEGÚN DÓNDE ESTÉS',-380,-150);
  const rows=[['ECUADOR',1670,'#ffd166'],['45°',1180,'#ffb36a'],['POLO',0,'#7ae0ff']];rows.forEach(([n,v,c],i)=>{const y=-70+i*82,bw=clamp((t-T.polos+.2-i*.35)/.8);g.fillStyle='#fff';g.font=`800 34px ${FONT_D}`;g.fillText(n,-380,y);g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.roundRect(-150,y-18,420,36,18);g.fill();
    const w=Math.max(8,420*(v/1670)*eo(bw));g.fillStyle=c;g.beginPath();g.roundRect(-150,y-18,w,36,18);g.fill();g.lineWidth=4;g.strokeStyle=INK;g.stroke();g.fillStyle='#eaf1ff';g.font=`700 30px ${FONT_M}`;g.fillText(`${Math.round(v*eo(bw))} km/h`,290,y);});
  g.restore();
  g.fillStyle=`rgba(40,52,70,${.55*die})`;g.fillRect(-100,-100,W+200,H+200);}
function bgS7(g,t){const u=t-ST[7];const gone=ss(T.desap-.1,T.desap+.5,t);
  skyBands(g,'#050722','#101a55','#2a3a8a');g.fillStyle='#fff';for(let i=0;i<90;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.2+i));g.beginPath();g.arc(rng(i)*W,rng(i+9)*HZ,1+rng(i+4)*1.8,0,7);g.fill();}g.globalAlpha=1;
  if(gone<1){const r=95*(1-gone*.4);g.save();g.globalAlpha=1-gone;drawMoon(g,230,840,r,1);g.restore();}
  if(gone>0&&gone<1){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const a=rng(i)*6.28,d=gone*(80+rng(i+3)*300);g.globalAlpha=(1-gone);g.drawImage(DOT_,230+Math.cos(a)*d-14,840+Math.sin(a)*d-14,28,28);}g.restore();g.strokeStyle=`rgba(255,255,255,${1-gone})`;g.lineWidth=8;g.beginPath();g.arc(230,840,95+gone*500,0,7);g.stroke();}
  drawCity(g,t,{lit:true,haze:'#3a4a8a'});seaBand(g,t,HZ,HZ+170,'#1a3a8a','#060a30');groundBand(g,t,'rgba(10,14,60,.5)');
  g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){g.globalAlpha=(1-gone)*.5;g.fillStyle='#bcd0ff';g.fillRect(230-60+Math.sin(t*2+i)*30,HZ+i*14+8,120-i*8,5);}g.restore();
  palmInk(g,70,1300,520,t,0,1);palmInk(g,1010,1300,560,t,0,1.05);}
const DOT_=(function(){const c=offscreen(32,32),g=c.getContext('2d');g.fillStyle=rad(g,16,16,0,16,[[0,'#fff',1],[1,'#fff',0]]);g.fillRect(0,0,32,32);return c;})();
