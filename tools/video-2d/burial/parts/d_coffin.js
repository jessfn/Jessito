// ===================== coffin cutaway world =====================
const CF={sc:.4,px:650,py:1190,rot:-Math.PI/2};
const OUTP=[[110,950],[970,950],[1034,1010],[996,1432],[84,1432],[46,1010]],INNP=[[134,978],[946,978],[1004,1030],[970,1404],[110,1404],[76,1030]];
function poly(g,P){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();}
const mouthW=()=>[CF.px+(-(756))*CF.sc*-1*0+(-302)*(CF.sc/.4),CF.py-14*(CF.sc/.4)];
function faceWorld(bx,by){const dx=(bx-470)*CF.sc,dy=(by-1131)*CF.sc;return [CF.px+dy,CF.py-dx];}
// coffin body: outer shell, cavity, satin, pillow, trousers  (everything except person / lid)
function coffinBack(g,t,air){
  poly(g,OUTP);inkS(g,lin(g,0,950,0,1432,[[0,'#8a5a30'],[1,'#4a2c18']]),10);hatch(g,()=>poly(g,OUTP),.5,16,.1);
  poly(g,INNP);g.fillStyle=lin(g,0,978,0,1404,[[0,'#241630'],[1,'#120a1c']]);g.fill();g.lineWidth=6;g.strokeStyle=INK;g.stroke();
  // air tint
  if(air>0){g.save();poly(g,INNP);g.clip();g.fillStyle=`rgba(120,200,255,${.2*air})`;g.fillRect(0,978,W,430);g.restore();}
  // satin bed with tufting
  g.save();poly(g,INNP);g.clip();const sy=1316;g.fillStyle=lin(g,0,sy,0,1404,[[0,'#efe3cc'],[1,'#c9b896']]);g.fillRect(60,sy,960,100);g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=3;
  for(let x=60;x<1020;x+=56){g.beginPath();g.moveTo(x,sy);g.lineTo(x+28,1404);g.moveTo(x+28,sy);g.lineTo(x,1404);g.stroke();}
  g.fillStyle='#d9c79e';for(let x=88;x<1020;x+=56)for(const y of [sy+22,sy+66]){g.beginPath();g.arc(x,y,5,0,7);g.fill();g.strokeStyle=INK;g.lineWidth=2;g.stroke();}
  g.beginPath();g.moveTo(60,sy);g.lineTo(1020,sy);g.strokeStyle=INK;g.lineWidth=5;g.stroke();
  // pillow
  g.beginPath();g.ellipse(270,1300,170,64,0,0,7);inkS(g,lin(g,0,1240,0,1360,[[0,'#ffffff'],[1,'#d6cdb8']]),6);g.restore();
  // trousers + shoes
  g.beginPath();g.moveTo(600,1130);g.lineTo(930,1156);g.lineTo(940,1274);g.lineTo(600,1288);g.closePath();inkS(g,'#3a3d5a',7);
  g.save();g.translate(960,1226);g.beginPath();g.moveTo(-20,-70);g.lineTo(26,-62);g.quadraticCurveTo(48,0,30,56);g.lineTo(-20,50);g.closePath();inkS(g,'#15151f',6);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(2,-50,6,80);g.restore();}
function lidPlanks(g,t,o){ // o:{crack,shakeX,dy}
  g.save();g.translate(0,o.dy||0);g.beginPath();g.rect(104,938,872,44);inkS(g,lin(g,0,938,0,982,[[0,'#a8723c'],[1,'#6a4224']]),9);
  g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=4;for(let x=104+218;x<976;x+=218){g.beginPath();g.moveTo(x,940);g.lineTo(x,980);g.stroke();}
  g.fillStyle='#d8c49a';for(let x=140;x<980;x+=108)for(const y of [950,970]){g.beginPath();g.arc(x,y,3.5,0,7);g.fill();}
  if(o.crack>0){g.strokeStyle=INK;g.lineWidth=7;g.lineCap='round';g.lineJoin='round';for(let i=0;i<5;i++){let x=190+i*170,y=940;g.beginPath();g.moveTo(x,y);const n=Math.max(1,Math.floor(4*o.crack));for(let k=0;k<n;k++){x+=(rng(i*9+k)-.5)*34;y+=10+rng(i+k)*5;g.lineTo(x,y);}g.stroke();}}
  g.restore();}
function breath(g,x,y,t,rate,a){g.save();for(let i=0;i<9;i++){const ph=((t*rate+i/9)%1),px=x+Math.sin(i*2.3+t*2)*14+ph*20,py=y-ph*210;g.globalAlpha=(1-ph)*a;const r=12+ph*34;g.beginPath();g.arc(px,py,r,0,7);g.fillStyle='rgba(235,245,255,.9)';g.fill();g.lineWidth=3;g.strokeStyle='rgba(30,40,80,.6)';g.stroke();}g.restore();}
function bubblesO2(g,t,n,a,c='#bfe6ff',lab=true){g.save();poly(g,INNP);g.clip();for(let i=0;i<n;i++){const ph=((t*.12+rng(i)*3)%1),x=150+rng(i+4)*800,y=1380-ph*380+Math.sin(t+i)*10,r=6+rng(i+7)*10;g.globalAlpha=a*Math.sin(ph*Math.PI);g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(x,y,r,0,7);g.stroke();if(lab&&i%4===0){g.fillStyle=c;g.font=`700 ${r*1.5}px ${FONT_M}`;g.textAlign='center';g.fillText('O₂',x,y+r*.5);}}g.restore();}
function co2Clouds(g,t,fill){if(fill<=0)return;g.save();poly(g,INNP);g.clip();for(let i=0;i<16;i++){const x=120+rng(i)*860,y=1340-fill*320*(.4+.6*rng(i+3))+Math.sin(t*.8+i)*14,r=90+rng(i+5)*60;g.fillStyle=rad(g,x,y,0,r,[[0,'#9aa86a',.7*Math.min(1,fill*2)],[1,'#9aa86a',0]]);g.fillRect(x-r,y-r,r*2,r*2);}
  g.font=`700 40px ${FONT_M}`;g.textAlign='center';g.fillStyle='#e0eaae';for(let i=0;i<5;i++){const ph=((t*.22+i*.2)%1);g.globalAlpha=Math.min(1,fill*2)*(1-ph);g.fillText('CO₂',200+i*190,1350-ph*300);}g.restore();}
function torsoExt(g){g.save();g.beginPath();g.rect(610,1008,190,356);g.fillStyle='#363a58';g.fill();g.fillStyle='#f3efe6';g.fillRect(610,1178,190,26);g.strokeStyle=INK;g.lineWidth=7;g.beginPath();g.moveTo(610,1008);g.lineTo(800,1018);g.moveTo(610,1364);g.lineTo(800,1352);g.stroke();g.restore();}
function blanket(g,t){g.save();poly(g,INNP);g.clip();const br=Math.sin(t*2.3)*2;const P=()=>{g.beginPath();g.moveTo(590,1400);g.bezierCurveTo(560,1300,620,1200,600,1090);g.bezierCurveTo(660,1030+br,760,1040,900,1030);g.bezierCurveTo(960,1020,1010,1020,1010,1060);g.lineTo(1010,1404);g.closePath();};
  P();inkS(g,lin(g,590,0,1010,0,[[0,'#9a3350'],[1,'#6a1e38']]),8);hatch(g,P,.8,14,.14,'#000');
  g.strokeStyle='rgba(255,220,230,.35)';g.lineWidth=4;g.setLineDash([12,10]);g.beginPath();g.moveTo(640,1110);g.bezierCurveTo(700,1080,800,1086,960,1076);g.stroke();g.setLineDash([]);
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=5;for(const y of [1180,1260,1330]){g.beginPath();g.moveTo(600,y);g.quadraticCurveTo(800,y-30,1010,y+6);g.stroke();}g.restore();}
function personLying(g,t,face,e,body){drawPeep(g,CF.px,CF.py,CF.sc,{body:body||'Jacket',face,tilt:e.tilt,hx:e.hx,hy:e.hy,bx:e.bx||0,by:e.by||0,lean:e.lean||0,sq:e.sq||0,tired:e.tired||0,rot:CF.rot});}
function soilTrickle(g,t,amt,cracks){if(amt<=0)return;g.save();for(let i=0;i<5;i++){const x=190+i*170;for(let k=0;k<7;k++){const ph=((t*1.3+rng(i*9+k)*3)%1),yy=985+ph*330;g.globalAlpha=amt*(1-ph*.5);g.fillStyle='#6a4630';g.beginPath();g.arc(x+Math.sin(ph*9+k)*8,yy,3+rng(i+k)*4,0,7);g.fill();g.strokeStyle=INK;g.lineWidth=2;g.stroke();}}g.restore();}
function soilPile(g,amt){if(amt<=0)return;g.save();poly(g,INNP);g.clip();g.beginPath();g.moveTo(560,1404);g.bezierCurveTo(600,1404-190*amt,760,1404-210*amt,820,1404);g.closePath();g.fillStyle='#6a4630';g.fill();g.lineWidth=5;g.strokeStyle=INK;g.stroke();g.restore();}
