// ===================== earth cross-section =====================
const PW=W+400,SURF=560;let EARTH,SKYL;
function buildEarth(){const c=offscreen(PW,2300),g=c.getContext('2d');
  const bands=[[0,150,'#5a3a26','#4a2e1e'],[150,560,'#7a5236','#6a4630'],[560,1050,'#9a6a40','#8a5c38'],[1050,1560,'#8a7466','#6e6058'],[1560,2300,'#5e5c78','#44425e']];
  for(const [a,b,c1,c2] of bands){g.fillStyle=lin(g,0,a,0,b,[[0,c1],[1,c2]]);g.fillRect(0,a,PW,b-a+2);}
  for(let i=0;i<3200;i++){const y=rng(i+3)*2300,x=rng(i)*PW;g.fillStyle=rng(i+7)>.5?`rgba(0,0,0,${.06+.1*rng(i+9)})`:`rgba(255,220,170,${.05+.08*rng(i+9)})`;g.beginPath();g.ellipse(x,y,2+rng(i+5)*6,1.5+rng(i+6)*3,rng(i)*3,0,7);g.fill();}
  // pebbles & stones with ink
  for(let i=0;i<150;i++){const y=60+rng(i*3+1)*2200,x=rng(i*3)*PW,r=10+rng(i*3+2)*(y>1000?44:22);g.save();g.translate(x,y);g.rotate(rng(i)*3);g.beginPath();g.ellipse(0,0,r,r*(.6+.3*rng(i+8)),0,0,7);inkS(g,y>1500?'#6e6c8c':y>1000?'#a09284':'#b8a488',4);g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(-r*.3,-r*.25,r*.35,r*.16,-.4,0,7);g.fill();g.restore();}
  // roots
  g.strokeStyle='#c9a26a';g.lineCap='round';for(let i=0;i<40;i++){const x=rng(i*5)*PW,y=rng(i*5+1)*180;g.lineWidth=3+rng(i)*4;g.beginPath();g.moveTo(x,y);let px=x,py=y;for(let k=0;k<7;k++){px+=(rng(i*9+k)-.5)*70;py+=24+rng(i*9+k+3)*40;g.lineTo(px,py);}g.stroke();}
  // worms
  for(let i=0;i<7;i++){const x=rng(i*11+2)*PW,y=200+rng(i*11+4)*500;g.strokeStyle=INK;g.lineWidth=14;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+30,y-30,x+60,y+30,x+90,y);g.stroke();g.strokeStyle='#f08fa0';g.lineWidth=8;g.stroke();}
  hatch(g,()=>{g.beginPath();g.rect(0,0,PW,2300);},.9,22,.06,'#000',3);
  EARTH=c;
  const s=offscreen(PW,SURF+30),k=s.getContext('2d');k.fillStyle=lin(k,0,0,0,SURF,[[0,'#150f3a'],[.5,'#5a2a70'],[.85,'#d8607a'],[1,'#ffb070']]);k.fillRect(0,0,PW,SURF+30);
  k.fillStyle='#fff';for(let i=0;i<50;i++){k.globalAlpha=.3+.7*rng(i+2);k.beginPath();k.arc(rng(i)*PW,rng(i+9)*SURF*.55,1+rng(i+4)*1.6,0,7);k.fill();}k.globalAlpha=1;
  // far hills + trees + tombstones
  k.fillStyle='#3a2656';k.beginPath();k.moveTo(0,SURF-60);for(let x=0;x<=PW;x+=40)k.lineTo(x,SURF-60-30*Math.sin(x*.004)-18*Math.sin(x*.011));k.lineTo(PW,SURF);k.lineTo(0,SURF);k.closePath();k.fill();
  for(const [x,h] of [[160,190],[560,140],[1010,210],[1380,150]]){k.strokeStyle='#150d28';k.lineCap='round';k.lineWidth=14;k.beginPath();k.moveTo(x,SURF-40);k.quadraticCurveTo(x-8,SURF-h*.5,x+6,SURF-h);k.stroke();k.lineWidth=8;for(const [a,b,c,d] of [[4,.55,-70,.8],[6,.7,60,.95],[0,.35,-50,.55]]){k.beginPath();k.moveTo(x+a,SURF-h*b);k.quadraticCurveTo(x+c*.5,SURF-h*b-24,x+c,SURF-h*d);k.stroke();}}
  for(const [x,sc] of [[330,1],[820,.9],[1190,1.1],[1500,.8]]){k.save();k.translate(x,SURF-6);k.scale(sc,sc);k.beginPath();k.moveTo(-34,0);k.lineTo(-34,-58);k.quadraticCurveTo(0,-98,34,-58);k.lineTo(34,0);k.closePath();inkS(k,'#6a6a8c',6);k.strokeStyle='rgba(255,255,255,.3)';k.lineWidth=4;k.beginPath();k.moveTo(-12,-48);k.lineTo(12,-48);k.moveTo(0,-62);k.lineTo(0,-30);k.stroke();k.restore();}
  SKYL=s;}
function drawEarth(g,t,o){ // o: {scroll, hole, fill}
  const px=-200-CAMS.x*.3,sc=o.scroll||0;
  if(sc<SURF+40){g.drawImage(SKYL,px,-sc);}
  g.drawImage(EARTH,px,SURF-sc);
  // grass line
  if(sc<SURF+60){g.save();g.translate(0,SURF-sc);g.fillStyle=lin(g,0,-14,0,40,[[0,'#6bd14a'],[1,'#2f8a30']]);g.beginPath();g.moveTo(0,10);for(let x=0;x<=W+40;x+=18){g.lineTo(x,-4-8*Math.abs(Math.sin(x*.37)));g.lineTo(x+9,14);}g.lineTo(W,60);g.lineTo(0,60);g.closePath();g.fill();g.strokeStyle=INK;g.lineWidth=5;g.stroke();g.restore();}
}
function drawGrave(g,t,open,sc){ // open grave hole between x 330..750
  const y0=SURF-sc;if(open<=0)return;const hx=330,hw=420,hd=470*open;g.save();g.beginPath();g.rect(hx,y0,hw,hd);g.fillStyle=lin(g,0,y0,0,y0+hd,[[0,'#2b1a12'],[1,'#140b08']]);g.fill();g.lineWidth=6;g.strokeStyle=INK;g.stroke();
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(hx,y0,30,hd);g.fillRect(hx+hw-30,y0,30,hd);
  g.strokeStyle='rgba(255,220,170,.12)';g.lineWidth=3;for(let i=0;i<10;i++){g.beginPath();g.moveTo(hx+30,y0+i*52);g.lineTo(hx+hw-30,y0+i*52+8);g.stroke();}g.restore();
  // soil mounds
  for(const [x,s] of [[250,1],[860,1.15]]){g.save();g.translate(x,y0+6);g.scale(s,s);g.beginPath();g.moveTo(-120,0);g.quadraticCurveTo(-50,-90,0,-92);g.quadraticCurveTo(60,-90,130,0);g.closePath();inkS(g,lin(g,0,-90,0,0,[[0,'#8a5c38'],[1,'#5a3a26']]),7);g.restore();}
}
function drawCoffin(g,x,y,s,rot,o={}){g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);shadowEll(g,0,68,230,24,.4);
  const body=()=>{g.beginPath();g.moveTo(-120,-60);g.lineTo(120,-60);g.lineTo(190,-8);g.lineTo(130,62);g.lineTo(-130,62);g.lineTo(-190,-8);g.closePath();};
  body();inkS(g,lin(g,-190,0,190,0,[[0,'#a8723c'],[.5,'#c08a4a'],[1,'#8a5a2c']]),9);hatch(g,body,.6,14,.12);
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=5;g.beginPath();g.moveTo(-110,-44);g.lineTo(112,-44);g.stroke();
  g.fillStyle='#e8c46a';g.strokeStyle=INK;g.lineWidth=5;g.beginPath();g.roundRect(-8,-34,16,54,4);g.roundRect(-30,-18,60,14,4);g.fill();g.stroke();
  if(o.crack){g.strokeStyle=INK;g.lineWidth=6;g.beginPath();for(let i=0;i<4;i++){let cx=-60+i*40,cy=-58;g.moveTo(cx,cy);for(let k=0;k<5;k++){cx+=(rng(i*7+k)-.5)*30;cy+=11+rng(i+k)*6;g.lineTo(cx,cy);}}g.globalAlpha=o.crack;g.stroke();g.globalAlpha=1;}
  g.restore();}
