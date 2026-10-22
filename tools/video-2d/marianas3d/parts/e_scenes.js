let TLD=null;const ST=[],ENDS=[];let TOTAL=0,SEGS=[],NS=0;
function initTimeline(d){TLD=d;ST.push(...d.starts);TOTAL=d.total;SEGS=d.segs;NS=ST.length;for(let i=0;i<NS;i++)ENDS.push(i<NS-1?ST[i+1]:TOTAL);}
const sceneAt=t=>{for(let i=0;i<NS;i++)if(t<ENDS[i])return i;return NS-1;};
const wordT=(seg,key,n=0)=>{let k=0;for(const w of SEGS[seg].words)if(w[0].toLowerCase().includes(key)){if(k===n)return ST[seg]+w[1];k++;}return ST[seg]+.5;};
let T={};function initWords(){T={caes:wordT(0,'caes'),spoil:wordT(0,'spoiler'),luz:wordT(0,'luz'),sol:wordT(0,'sol'),once:wordT(1,'once'),everest:wordT(1,'everest'),dos:wordT(2,'doscientos'),mil2:wordT(2,'mil'),osc:wordT(2,'oscuridad'),
  pres:wordT(3,'presión'),mil3:wordT(3,'mil'),cinc:wordT(3,'cincuenta'),avion:wordT(3,'aviones'),pulm:wordT(4,'pulmones'),oid:wordT(4,'oídos'),romp:wordT(4,'romperían'),fondo:wordT(4,'fondo'),
  peces:wordT(5,'peces'),crust:wordT(5,'crustáceos'),brill:wordT(5,'brillan'),pocos:wordT(6,'pocos'),cam:wordT(6,'cameron'),subm:wordT(6,'submarino'),agua:wordT(6,'agua'),volc:wordT(7,'volcán'),sigu:wordT(7,'sígueme')};
  T.fall=1.0;T.splash=1.0+Math.sqrt(2*420/2600);T.land=T.brill+1.85;}
const mix2=(a,b,k)=>rgb(mixc(hex(a),hex(b),k));
const ZONES=[[0,'SOLEADA'],[200,'PENUMBRA'],[1000,'OSCURIDAD'],[4000,'ABISAL'],[6000,'HADAL']];
const zoneAt=D=>{let z=ZONES[0][1];for(const [d,n] of ZONES)if(D>=d)z=n;return z;};
// ---- depth gauge (left) ----
function panel(g,t,D,a){if(a<=.01)return;const x=44,y=500,w=268,h=772;g.save();g.globalAlpha=a;g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=28;g.shadowOffsetY=14;g.beginPath();g.roundRect(x,y,w,h,30);inkS(g,lin(g,0,y,0,y+h,[[0,'#1c2a66'],[1,'#10173c']]),8);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  g.textAlign='left';g.textBaseline='middle';g.fillStyle='#9fb0e8';g.font=`700 22px ${FONT_M}`;g.fillText('PROFUNDIDAD',x+22,y+40);
  const ds=`${fmtN(D)} m`;g.font=`700 42px ${FONT_M}`;g.lineWidth=8;g.strokeStyle=INK;g.strokeText(ds,x+22,y+92);g.fillStyle='#eaf1ff';g.fillText(ds,x+22,y+92);
  g.fillStyle='#9fb0e8';g.font=`700 22px ${FONT_M}`;g.fillText('PRESIÓN',x+22,y+152);const ps=`${fmtN(pressAt(D))} atm`;g.font=`700 34px ${FONT_M}`;g.fillStyle=pressAt(D)>400?'#ffb347':'#eaf1ff';g.fillText(ps,x+22,y+192);
  g.fillStyle='#9fb0e8';g.font=`700 22px ${FONT_M}`;g.fillText('TEMPERATURA',x+22,y+250);g.font=`700 34px ${FONT_M}`;g.fillStyle='#9fe8ff';g.fillText(`${Math.round(tempAt(D))} °C`,x+22,y+290);
  g.fillStyle='#ffe29a';g.font=`700 22px ${FONT_M}`;g.fillText(zoneAt(D),x+22,y+346);
  // sqrt-scale bar
  const bx=x+30,by=y+372,bh=330,bw=30;const f=d=>Math.sqrt(d/10935)*bh;
  g.beginPath();g.roundRect(bx,by,bw,bh,10);g.fillStyle=lin(g,0,by,0,by+bh,[[0,'#59d2f0'],[.14,'#1d7fc0'],[.3,'#0b3567'],[.6,'#040d28'],[1,'#010208']]);g.fill();g.lineWidth=5;g.strokeStyle=INK;g.stroke();
  g.fillStyle='#9fb0e8';g.font=`700 20px ${FONT_M}`;for(const [d,lab] of [[0,'0'],[200,'200 m'],[1000,'1 000 m'],[4000,'4 000 m'],[10935,'10 935 m']]){const yy=by+f(d);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.beginPath();g.moveTo(bx+bw,yy);g.lineTo(bx+bw+12,yy);g.stroke();g.fillText(lab,bx+bw+20,Math.min(by+bh-6,Math.max(by+8,yy)));}
  const my=by+f(D);g.beginPath();g.moveTo(bx-4,my);g.lineTo(bx-22,my-13);g.lineTo(bx-22,my+13);g.closePath();inkS(g,'#ffd166',4);g.fillStyle='#ffd166';g.fillRect(bx,my-2,bw,4);
  g.fillStyle='#9fb0e8';g.font=`700 20px ${FONT_M}`;g.fillText('DESCENSO ACELERADO',x+22,y+h-26);g.restore();}
// ---- pressure arrows around the figure ----
function pressArrows(g,t,cx,cy,k){if(k<=.01)return;g.save();g.translate(cx,cy);for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.2;if(Math.sin(a)<-.7)continue;const pul=.5+.5*Math.sin(t*5+i),r=(540-pul*70*k)*Math.min(1.3,Math.max(1,k*0+1)),ex=Math.cos(a)*r,ey=Math.sin(a)*r*1.35;g.save();g.translate(ex,ey);g.rotate(a+Math.PI);g.globalAlpha=k*.95;g.beginPath();g.moveTo(-46,-14);g.lineTo(6,-14);g.lineTo(6,-34);g.lineTo(54,0);g.lineTo(6,34);g.lineTo(6,14);g.lineTo(-46,14);g.closePath();inkS(g,'#ff8a4d',6);g.restore();}g.restore();}
// ---- 50 jets stack (pressure comparison) ----
function jetIcon(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(-110,0);g.bezierCurveTo(-110,-14,-70,-16,60,-16);g.bezierCurveTo(100,-16,124,-6,128,2);g.bezierCurveTo(124,12,100,16,60,16);g.lineTo(-90,16);g.closePath();inkS(g,'#f4f7fb',6);g.beginPath();g.moveTo(-100,-12);g.lineTo(-132,-52);g.lineTo(-96,-52);g.lineTo(-62,-12);g.closePath();inkS(g,'#e8473a',6);g.beginPath();g.moveTo(-20,10);g.lineTo(26,64);g.lineTo(48,64);g.lineTo(30,10);g.closePath();inkS(g,'#cfd8e2',6);g.restore();}
function jetStack(g,t,k){if(k<=.01)return;g.save();g.globalAlpha=k;for(let i=0;i<5;i++)jetIcon(g,640+Math.sin(i*2+t*1.3)*10,150+i*34+(1-k)*-60,.46);g.restore();}
// ---- inset badges for lungs and ears ----
function lungsIcon(g,t,k){g.save();g.scale(k*.8,k*.8);for(const s of [-1,1]){g.beginPath();g.moveTo(s*10,-46);g.bezierCurveTo(s*70,-50,s*86,20,s*70,58);g.bezierCurveTo(s*40,70,s*12,54,s*10,20);g.closePath();inkS(g,lin(g,0,-50,0,70,[[0,'#ff9aa8'],[1,'#e0566e']]),6);}
  g.strokeStyle=INK;g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(0,-74);g.lineTo(0,-10);g.moveTo(0,-10);g.lineTo(-30,18);g.moveTo(0,-10);g.lineTo(30,18);g.stroke();g.restore();}
function earIcon(g,t,a){g.save();g.beginPath();g.moveTo(-14,-70);g.bezierCurveTo(46,-84,74,-30,40,6);g.bezierCurveTo(26,26,40,50,10,64);g.bezierCurveTo(-18,76,-40,40,-26,16);g.bezierCurveTo(-48,-14,-50,-56,-14,-70);g.closePath();inkS(g,'#e9a47c',6);g.beginPath();g.moveTo(-6,-40);g.bezierCurveTo(20,-48,34,-20,10,-4);g.strokeStyle=INK;g.lineWidth=5;g.stroke();
  for(let i=0;i<3;i++){const k=clamp((a*1.4-i*.18));if(k<=0||k>=1)continue;g.globalAlpha=1-k;g.strokeStyle='#bfeaff';g.lineWidth=6;g.beginPath();g.arc(-30,-10,50+k*70,-1.0,1.0);g.stroke();}g.globalAlpha=1;
  if(a>.5){g.strokeStyle='#ff4a5e';g.lineWidth=7;g.beginPath();g.moveTo(6,-30);g.lineTo(18,-10);g.lineTo(2,4);g.lineTo(16,24);g.stroke();}g.restore();}
function badge(g,x,y,r,k,draw){if(k<=.01)return;g.save();g.translate(x,y);g.scale(eob(k,1.3),eob(k,1.3));g.beginPath();g.arc(0,0,r,0,7);inkS(g,lin(g,0,-r,0,r,[[0,'#1a2a66'],[1,'#0c1236']]),8);g.save();g.beginPath();g.arc(0,0,r-6,0,7);g.clip();draw();g.restore();g.restore();}
