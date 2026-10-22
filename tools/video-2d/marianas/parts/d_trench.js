// ===================== Fosa de las Marianas: world, creatures, figure =====================
const PS=.24,HS=1.3,POSEK=1.5;
const NKX={walk:742,cross:740,ease:748,point:738,rest:744,dance:742,shirt:746};
PIMG.pose={};
async function loadPoses(){const jobs=[];for(const k in PEEP.poses){const P=PEEP.poses[k];const s=P.svg.replace(/width="(\d+)" height="(\d+)"/,(m,w,h)=>`width="${Math.round(w*POSEK)}" height="${Math.round(h*POSEK)}"`);
  jobs.push(new Promise((res,rej)=>{const im=new Image();im.onload=()=>{PIMG.pose[k]=im;res()};im.onerror=rej;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);}));}await Promise.all(jobs);}
const HAIR=()=>PIMG.hair[Object.keys(PIMG.hair)[0]];
// neck-anchored figure. o:{pose,x,y(neck),sc,rot,face,tilt,hx,hy,hair}
function drawFigure(g,o){const P=PEEP.poses[o.pose],img=PIMG.pose[o.pose],u=PS*(o.sc||1);
  g.save();g.translate(o.x,o.y);
  g.translate(0,1250*u);g.rotate(o.rot||0);g.translate(0,-1250*u);
  g.save();g.translate(-NKX[o.pose]*u,-75*u);g.drawImage(img,0,0,P.w*u,P.h*u);g.restore();
  g.translate(o.hx||0,o.hy||0);g.rotate(o.tilt||0);
  g.save();g.scale(u*HS,u*HS);g.translate(-450,-505);
  g.save();g.translate(450,505);g.rotate(o.hair||0);g.translate(-450,-505);g.drawImage(HAIR(),0,0,LW,LH);g.restore();
  g.drawImage(PIMG.face[o.face||'Calm'],0,0,LW,LH);g.restore();
  g.restore();}
// ---------- depth / timeline ----------
let DK=[];function initDepth(){DK=[[0,0],[T.splash,0],[T.splash+1.1,6],[ST[1],60],[T.dos,200],[T.mil2,1000],[ST[3],1600],[T.mil3,3200],[T.cinc,5000],[ST[4],6000],[T.fondo,8200],[T.peces+1,9600],[T.land-.8,10700],[T.land,10935],[1e5,10935]];}
function depthAt(t){if(t<=DK[0][0])return 0;let i=0;while(i<DK.length-2&&t>=DK[i+1][0])i++;const n=DK.length;
  const xs=DK.map(p=>p[0]),ys=DK.map(p=>p[1]);const d=[],m=[];for(let k=0;k<n-1;k++)d[k]=(ys[k+1]-ys[k])/Math.max(1e-6,xs[k+1]-xs[k]);
  m[0]=d[0];m[n-1]=d[n-2];for(let k=1;k<n-1;k++)m[k]=d[k-1]*d[k]<=0?0:(d[k-1]+d[k])/2;
  const h=xs[i+1]-xs[i],s=(t-xs[i])/h,s2=s*s,s3=s2*s;return clamp((2*s3-3*s2+1)*ys[i]+(s3-2*s2+s)*h*m[i]+(-2*s3+3*s2)*ys[i+1]+(s3-s2)*h*m[i+1],0,10935);}
const rateAt=t=>(depthAt(t+.1)-depthAt(t-.1))/.2;
const fmtN=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const pressAt=D=>1+D/10.06;
const tempAt=D=>D<1?26:D<200?lerp(26,12,D/200):D<1000?lerp(12,4,(D-200)/800):lerp(4,1.5,clamp((D-1000)/9935));
// ---------- water colours by depth ----------
const WK=[[0,'#5fd6f0','#1f93d2'],[40,'#2aa4dc','#1673b9'],[200,'#145f9f','#0e4a85'],[600,'#0b3567','#092a55'],[1100,'#071e45','#051536'],[4000,'#040d28','#030a1d'],[8000,'#02071a','#02050f'],[10935,'#03060e','#020309']];
function waterCols(D){let i=0;while(i<WK.length-2&&D>=WK[i+1][0])i++;const a=WK[i],b=WK[i+1],k=clamp((D-a[0])/(b[0]-a[0]));return [mixc(hex(a[1]),hex(b[1]),0).map((v,j)=>lerp(hex(a[1])[j],hex(b[1])[j],k)),hex(a[2]).map((v,j)=>lerp(v,hex(b[2])[j],k))];}
function waterBG(g,t,D,ySurf){const [c1,c2]=waterCols(D);g.fillStyle=lin(g,0,0,0,H,[[0,c1],[1,c2]]);g.fillRect(-10,-10,W+20,H+20);
  // surface-lit gradient in the first metres
  if(ySurf>-400){const a=clamp(1-D/120);g.fillStyle=lin(g,0,ySurf,0,ySurf+700,[[0,'rgba(190,245,255,'+(.55*a)+')'],[1,'rgba(190,245,255,0)']]);g.fillRect(0,Math.max(-10,ySurf),W,H);}
  // god rays
  const ra=.30*Math.exp(-D/160);if(ra>.01){g.save();g.globalCompositeOperation='screen';for(let i=0;i<9;i++){const x=-120+i*150+Math.sin(t*.35+i*1.7)*50,w=50+rng(i)*70;const top=Math.max(-50,ySurf);g.fillStyle=lin(g,x,top,x+260,top+1500,[[0,'rgba(210,250,255,'+ra+')'],[1,'rgba(210,250,255,0)']]);g.beginPath();g.moveTo(x,top);g.lineTo(x+w,top);g.lineTo(x+w+420,top+1500);g.lineTo(x+330,top+1500);g.closePath();g.fill();}g.restore();}}
// marine snow / plankton, speed follows the descent
let SNOWY=[0,0,0];
function snow(g,t,D,rate){const sp=clamp(Math.abs(rate)*.55,26,520);for(let L=0;L<3;L++){SNOWY[L]=(t*sp*(.5+L*.55));const n=34+L*16;g.save();g.fillStyle='#d8f0ff';for(let i=0;i<n;i++){const x=(rng(i*7+L*101)*1200-60+Math.sin(t*.5+i)*14),yy=((rng(i*3+L*53)*2300-SNOWY[L]*(L===0?.55:L===1?1:1.6))%2300+2300)%2300-190,r=(1.2+rng(i+L*9)*2.2)*(1+L*.7);g.globalAlpha=(.18+.16*L)*(D<60?.45:1);g.beginPath();g.arc(x,yy,r,0,7);g.fill();}g.restore();}}
// bubbles rising from a point
function bubbles(g,t,x,y,k,seed=0,sc=1){if(k<=.01)return;g.save();g.lineWidth=2.6*sc;for(let i=0;i<12;i++){const ph=((t*.8+rng(i+seed)*3)%1.4)/1.4;if(rng(i+seed*3)>k)continue;const bx=x+Math.sin(ph*9+i)*20*sc+(rng(i+5)-.5)*30*sc,by=y-ph*420*sc,r=(5+rng(i+9)*13)*sc*(.6+ph*.6);g.globalAlpha=(1-ph)*.9;g.strokeStyle='rgba(235,250,255,.95)';g.fillStyle='rgba(190,235,255,.18)';g.beginPath();g.arc(bx,by,r,0,7);g.fill();g.stroke();g.beginPath();g.arc(bx-r*.3,by-r*.3,r*.25,0,7);g.fillStyle='rgba(255,255,255,.9)';g.fill();}g.restore();}
// ---------- surface world (sky, boat, waves) ----------
function waveY(x,t){return Math.sin(x*.012+t*1.5)*10+Math.sin(x*.027-t*2.1)*5+Math.sin(x*.004+t*.6)*14;}
function skyWorld(g,t,ySurfW){ // drawn in world coords, above the surface only
  g.save();g.beginPath();g.moveTo(-3000,-4000);g.lineTo(4000,-4000);g.lineTo(4000,waveY(4000,t));for(let x=4000;x>=-3000;x-=40)g.lineTo(x,waveY(x,t));g.closePath();g.clip();
  g.fillStyle=lin(g,0,-2600,0,0,[[0,'#3a8fe0'],[.55,'#8fd0f5'],[1,'#e3f6ff']]);g.fillRect(-3000,-4000,7000,4100);
  drawSun(g,1250,-1500,230,t);
  for(const [x,y,s,sp] of [[-300,-1900,2.4,.016],[700,-1450,1.7,.02],[1300,-2100,2.8,.012],[-900,-1300,2,.018],[200,-2300,3,.01]]){const xx=((x+t*sp*900)%3200+3200)%3200-1000;g.save();g.translate(xx,y);g.scale(s,s);cloudShape(g);g.restore();}
  // far sea band
  g.restore();}
function cloudShape(g){g.beginPath();g.moveTo(-90,30);g.bezierCurveTo(-120,-4,-84,-40,-44,-26);g.bezierCurveTo(-34,-70,26,-76,44,-34);g.bezierCurveTo(76,-52,118,-20,96,10);g.bezierCurveTo(116,26,100,38,80,34);g.lineTo(-70,34);g.bezierCurveTo(-92,40,-104,36,-90,30);g.closePath();inkS(g,'#ffffff',7);}
function boatWorld(g,t,dx=0){const rk=Math.sin(t*1.1)*.012,bob=Math.sin(t*1.7)*8;g.save();g.translate(540+dx,0);g.rotate(rk);g.translate(-540,bob);
  // cabin
  g.beginPath();g.roundRect(-1250,-980,1180,560,18);inkS(g,lin(g,0,-980,0,-420,[[0,'#f4f7fb'],[1,'#d7e1ee']]),9);
  for(let i=0;i<5;i++){g.beginPath();g.roundRect(-1180+i*230,-880,160,210,22);inkS(g,lin(g,0,-880,0,-670,[[0,'#7cc8f0'],[1,'#2d86c4']]),7);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=7;g.beginPath();g.moveTo(-1160+i*230,-860);g.lineTo(-1110+i*230,-910);g.stroke();}
  g.beginPath();g.roundRect(-1270,-1010,1220,48,10);inkS(g,'#e8473a',8);
  // mast + flag
  g.beginPath();g.rect(-690,-1520,18,540);inkS(g,'#b9c2cf',6);g.beginPath();g.moveTo(-672,-1500);g.lineTo(-540,-1460+Math.sin(t*5)*14);g.lineTo(-672,-1420);g.closePath();inkS(g,'#ffd23f',6);
  // deck + hull
  g.beginPath();g.moveTo(-1500,-430);g.lineTo(560,-430);g.lineTo(560,-380);g.lineTo(-1500,-380);g.closePath();inkS(g,'#9a6a3e',9);
  g.beginPath();g.moveTo(-1500,-380);g.lineTo(560,-380);g.bezierCurveTo(600,-250,560,-90,500,40);g.lineTo(-1500,40);g.closePath();inkS(g,lin(g,0,-380,0,40,[[0,'#ffffff'],[1,'#dfe7f1']]),10);
  g.beginPath();g.moveTo(-1500,-130);g.lineTo(520,-130);g.lineTo(508,-70);g.lineTo(-1500,-70);g.closePath();inkS(g,'#e8473a',7);
  for(let i=0;i<6;i++){g.beginPath();g.arc(-1300+i*300,-250,34,0,7);inkS(g,lin(g,0,-284,0,-216,[[0,'#9fdcff'],[1,'#3b8ccb']]),8);}
  // railing
  g.lineCap='round';g.strokeStyle=INK;g.lineWidth=14;g.beginPath();g.moveTo(-300,-640);g.lineTo(540,-640);g.stroke();g.beginPath();g.moveTo(-300,-540);g.lineTo(540,-540);g.stroke();
  for(let x=-300;x<=540;x+=140){g.beginPath();g.moveTo(x,-430);g.lineTo(x,-640);g.stroke();}
  g.strokeStyle='#f6f6f6';g.lineWidth=7;g.beginPath();g.moveTo(-300,-640);g.lineTo(540,-640);g.stroke();g.beginPath();g.moveTo(-300,-540);g.lineTo(540,-540);g.stroke();for(let x=-300;x<=540;x+=140){g.beginPath();g.moveTo(x,-430);g.lineTo(x,-640);g.stroke();}
  // life ring
  g.save();g.translate(380,-330);g.beginPath();g.arc(0,0,62,0,7);g.arc(0,0,28,0,7,true);inkS(g,'#ff7a2b',8);g.lineWidth=9;for(let a=0;a<4;a++){g.beginPath();g.arc(0,0,45,a*1.571-.3,a*1.571+.3);g.strokeStyle='#fff';g.stroke();}g.restore();
  g.restore();}
function seaSurfaceFront(g,t,x0,x1,hz=1){g.save();g.beginPath();g.moveTo(x0,waveY(x0,t)-6);for(let x=x0;x<=x1;x+=30)g.lineTo(x,waveY(x,t)-6);g.lineTo(x1,260);g.lineTo(x0,260);g.closePath();g.fillStyle=lin(g,0,-20,0,260,[[0,'rgba(30,140,210,'+(.6*hz)+')'],[1,'rgba(30,140,210,0)']]);g.fill();g.strokeStyle='#e9fbff';g.lineWidth=8;g.lineJoin='round';g.beginPath();for(let x=x0;x<=x1;x+=30)(x===x0)?g.moveTo(x,waveY(x,t)-6):g.lineTo(x,waveY(x,t)-6);g.stroke();g.restore();}
function splashFX(g,t,ts,x){const a=t-ts;if(a<0||a>2.6)return;g.save();g.translate(x,waveY(x,t));
  for(let r=0;r<3;r++){const k=clamp((a-r*.18)/1.6);if(k<=0||k>=1)continue;g.globalAlpha=(1-k)*.9;g.strokeStyle='#f4fdff';g.lineWidth=9*(1-k)+2;g.beginPath();g.ellipse(0,0,60+k*520,10+k*60,0,0,7);g.stroke();}
  g.globalAlpha=1;const c=clamp(a/1.1);if(c<1){const hgt=420*Math.sin(Math.min(1,a/.35)*Math.PI/2)*(1-ss(.35,1.1,a)*.9);for(let i=0;i<22;i++){const an=-Math.PI/2+(rng(i)-.5)*1.5,sp=.35+rng(i+3)*.7,px=Math.cos(an)*hgt*sp*(a*1.2),py=Math.sin(an)*hgt*sp*(1-a*.7)+300*a*a*(.6+rng(i));const r=(10+rng(i+8)*18)*(1-c*.7);g.globalAlpha=1-c;g.beginPath();g.arc(px,py,r,0,7);inkS(g,'#e8fbff',5);}
  }
  g.restore();}
// ---------- creatures (ink style, drawn at origin facing +x) ----------
function fishShape(g,s,col,t,ph){g.save();g.scale(s,s);const w=Math.sin(t*9+ph)*.12;g.beginPath();g.moveTo(60,0);g.bezierCurveTo(30,-34,-20,-30,-52,-4);g.lineTo(-84,-26+w*60);g.lineTo(-78,0);g.lineTo(-84,26-w*60);g.lineTo(-52,4);g.bezierCurveTo(-20,30,30,34,60,0);g.closePath();inkS(g,lin(g,0,-34,0,34,[[0,shade(hex(col),.35)],[.5,hex(col)],[1,shade(hex(col),-.2)]]),6);g.beginPath();g.arc(36,-6,5,0,7);g.fillStyle=INK;g.fill();g.restore();}
function sharkShape(g,s,t){g.save();g.scale(s,s);const w=Math.sin(t*2.4)*10;g.beginPath();g.moveTo(230,0);g.bezierCurveTo(150,-46,40,-60,-60,-34);g.bezierCurveTo(-130,-20,-170,-32+w,-230,-70+w*2);g.lineTo(-206,-6+w);g.lineTo(-236,66+w*2);g.bezierCurveTo(-160,30,-120,26,-60,30);g.bezierCurveTo(40,50,150,40,230,0);g.closePath();inkS(g,lin(g,0,-60,0,50,[[0,'#6f8aa8'],[.55,'#9db3c8'],[1,'#e6eef5']]),9);
  g.beginPath();g.moveTo(40,-52);g.lineTo(110,-128);g.lineTo(110,-46);g.closePath();inkS(g,'#6f8aa8',8);g.beginPath();g.moveTo(40,26);g.lineTo(-20,92);g.lineTo(100,34);g.closePath();inkS(g,'#8ea6bd',8);g.beginPath();g.arc(170,-12,6,0,7);g.fillStyle=INK;g.fill();for(let i=0;i<4;i++){g.beginPath();g.moveTo(120-i*14,0);g.lineTo(116-i*14,18);g.strokeStyle=INK;g.lineWidth=5;g.stroke();}g.restore();}
function jellyShape(g,s,t,ph,col='#8fb8ff',gl=.5){g.save();g.scale(s,s);const pul=Math.sin(t*2.2+ph);glow(g,0,0,260,col,gl*.55);g.beginPath();g.moveTo(-84,14);g.bezierCurveTo(-90,-94-pul*8,90,-94-pul*8,84,14);g.quadraticCurveTo(0,34+pul*8,-84,14);g.closePath();inkS(g,rgb(mixc(hex('#cfe0ff'),hex(col),.4),.8),6);g.strokeStyle=col;g.lineWidth=7;g.lineCap='round';for(let i=0;i<7;i++){g.beginPath();g.moveTo(-66+i*22,20);g.bezierCurveTo(-66+i*22+Math.sin(t*2+i+ph)*18,80,-66+i*22-Math.sin(t*2+i+ph)*18,130,-66+i*22+Math.sin(t*1.7+i)*10,190);g.stroke();}
  g.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<5;i++){g.beginPath();g.arc(-40+i*20,-30+Math.sin(i)*12,4,0,7);g.fill();}g.restore();}
function snailfish(g,s,t){g.save();g.scale(s,s);const w=Math.sin(t*3)*.1;g.beginPath();g.moveTo(80,0);g.bezierCurveTo(70,-52,0,-60,-60,-24);g.bezierCurveTo(-100,-14,-150,-6+w*40,-200,6);g.bezierCurveTo(-150,18,-100,22,-60,24);g.bezierCurveTo(0,56,70,52,80,0);g.closePath();inkS(g,'rgba(255,205,222,.93)',7);
  g.strokeStyle='rgba(150,60,90,.55)';g.lineWidth=3;g.beginPath();g.moveTo(-10,-20);g.bezierCurveTo(-60,-8,-120,-2,-170,4);g.stroke();for(let i=0;i<6;i++){g.beginPath();g.moveTo(-20-i*24,-18+i);g.lineTo(-24-i*24,18-i);g.stroke();}
  g.beginPath();g.arc(52,-8,12,0,7);inkS(g,'#fff',4);g.beginPath();g.arc(55,-8,5,0,7);g.fillStyle=INK;g.fill();glow(g,0,0,230,'#ffc4dc',.42);g.restore();}
function amphipod(g,s,t){g.save();g.scale(s,s);g.lineCap='round';for(let i=0;i<7;i++){g.strokeStyle='rgba(255,170,110,.9)';g.lineWidth=6;g.beginPath();g.moveTo(-70+i*20,26);g.lineTo(-76+i*20+Math.sin(t*6+i)*8,64);g.stroke();}
  for(let i=0;i<8;i++){const x=-110+i*28,r=34-Math.abs(i-3)*3;g.beginPath();g.ellipse(x,0+Math.sin(i*.8)*6,r*.6,r,0,0,7);inkS(g,`rgba(255,${190-i*6},${130-i*4},.86)`,6);}
  g.beginPath();g.ellipse(124,-4,38,32,0,0,7);inkS(g,'rgba(255,190,130,.9)',6);g.beginPath();g.arc(138,-12,9,0,7);g.fillStyle=INK;g.fill();g.strokeStyle='rgba(255,170,110,.9)';g.lineWidth=5;g.beginPath();g.moveTo(150,-24);g.bezierCurveTo(190,-70,220,-60,236,-100);g.stroke();g.beginPath();g.moveTo(152,-18);g.bezierCurveTo(200,-40,240,-30,262,-60);g.stroke();glow(g,0,0,260,'#ffaa6e',.4);g.restore();}
function angler(g,s,t){g.save();g.scale(s,s);const w=Math.sin(t*1.6)*8;g.beginPath();g.moveTo(-120,0);g.bezierCurveTo(-120,-100,60,-120,120,-30);g.bezierCurveTo(150,-6,120,48,60,70);g.bezierCurveTo(-40,100,-120,60,-120,0);g.closePath();inkS(g,lin(g,0,-110,0,90,[[0,'#3a3350'],[1,'#1c1830']]),8);
  g.beginPath();g.moveTo(-120,0);g.lineTo(-190,-30+w);g.lineTo(-180,10);g.lineTo(-200,46+w);g.lineTo(-120,30);g.closePath();inkS(g,'#2b2640',7);
  g.strokeStyle=INK;g.lineWidth=8;g.lineCap='round';g.beginPath();g.moveTo(70,-84);g.bezierCurveTo(120,-190,180,-170,210,-120+w);g.stroke();glow(g,210,-120+w,150,'#9ff0ff',.85);g.beginPath();g.arc(210,-120+w,13,0,7);g.fillStyle='#e6ffff';g.fill();g.lineWidth=4;g.stroke();
  g.beginPath();g.moveTo(118,-10);g.lineTo(50,10);g.lineTo(118,34);inkS(g,'#1c1830',6);g.fillStyle='#e8edf5';for(let i=0;i<6;i++){g.beginPath();g.moveTo(112-i*10,-4+i*4);g.lineTo(106-i*10,14+i*3);g.lineTo(100-i*10,-2+i*4);g.fill();}
  g.beginPath();g.arc(86,-40,18,0,7);inkS(g,'#ffe66b',5);g.beginPath();g.arc(90,-40,8,0,7);g.fillStyle=INK;g.fill();g.restore();}
// ---------- seafloor ----------
function seafloor(g,t,top,lightX){g.save();const y=top;g.beginPath();g.moveTo(-1700,y+20);for(let x=-1700;x<=W+1700;x+=40)g.lineTo(x,y+Math.sin(x*.011)*16+Math.sin(x*.031)*6);g.lineTo(W+1700,y+3200);g.lineTo(-1700,y+3200);g.closePath();inkS(g,lin(g,0,y,0,y+700,[[0,'#46526e'],[.35,'#2a3350'],[1,'#10142a']]),9);
  hatch(g,()=>{g.beginPath();g.rect(-1700,y+30,W+3400,3000);},-.5,18,.12,'#05081a',3);
  for(let i=0;i<30;i++){const x=-1500+i*120+(rng(i)-.5)*60,yy=y+60+rng(i+4)*200,s=.5+rng(i+2)*.9;g.save();g.translate(x,yy);g.scale(s,s);g.beginPath();g.moveTo(-40,10);g.bezierCurveTo(-46,-34,-8,-52,22,-34);g.bezierCurveTo(54,-26,52,10,40,14);g.closePath();inkS(g,'#39445f',6);g.restore();}
  for(let i=0;i<22;i++){const x=-1400+i*140+(rng(i+11)-.5)*50,yy=y+30+rng(i+13)*30;g.save();g.translate(x,yy);g.strokeStyle='#d9c4ad';g.lineWidth=7;g.lineCap='round';for(let k=0;k<4;k++){g.beginPath();g.moveTo(k*12-18,0);g.quadraticCurveTo(k*12-18+Math.sin(t*1.2+i+k)*8,-40-k*8,k*12-18+Math.sin(t*1.2+i)*12,-70-k*10);g.stroke();g.beginPath();g.arc(k*12-18+Math.sin(t*1.2+i)*12,-70-k*10,6,0,7);g.fillStyle='#ff5d6c';g.fill();}g.restore();}
  g.restore();}
function silt(g,t,x,y,t0,dur){const a=(t-t0)/dur;if(a<0||a>1)return;g.save();for(let i=0;i<16;i++){const dir=rng(i)<.5?-1:1,ph=a,px=x+dir*(30+rng(i+2)*220)*ph,py=y-ph*(30+rng(i+5)*90)-(1-ph)*0,r=(20+rng(i+7)*38)*(.6+ph);g.globalAlpha=(1-ph)*.6;g.fillStyle=rad(g,px,py,0,r,[[0,'#9aa6c2',.7],[1,'#9aa6c2',0]]);g.beginPath();g.arc(px,py,r,0,7);g.fill();}g.restore();}
// ---------- Deepsea Challenger ----------
function challenger(g,t,x,y,s,lights){g.save();g.translate(x,y);g.scale(s,s);
  // lights cone
  if(lights>0){for(const dx of [-26,26]){g.save();g.globalCompositeOperation='lighter';g.fillStyle=lin(g,dx,60,dx,700,[[0,'rgba(255,250,215,'+(.55*lights)+')'],[1,'rgba(255,250,215,0)']]);g.beginPath();g.moveTo(dx-8,60);g.lineTo(dx+8,60);g.lineTo(dx+150*Math.sign(dx),700);g.lineTo(dx-150*Math.sign(dx)+(dx<0?-80:80)*0,700);g.closePath();g.fill();g.restore();}}
  g.beginPath();g.roundRect(-48,-210,96,430,48);inkS(g,lin(g,-48,0,48,0,[[0,'#a5d96a'],[.5,'#6fb04a'],[1,'#3f7a30']]),9);
  g.beginPath();g.arc(0,-150,50,0,7);inkS(g,lin(g,-50,-190,50,-110,[[0,'#ffffff'],[1,'#cfd8e0']]),8);g.beginPath();g.arc(0,-150,22,0,7);inkS(g,'#7ad8ff',6);glow(g,0,-150,70,'#aef0ff',.7*lights);
  g.beginPath();g.roundRect(-70,-30,26,150,10);inkS(g,'#2a2f44',7);g.beginPath();g.roundRect(44,-30,26,150,10);inkS(g,'#2a2f44',7);
  for(const dx of [-26,26]){g.beginPath();g.arc(dx,60,14,0,7);inkS(g,'#fffbe0',5);glow(g,dx,60,60,'#fff2b0',.8*lights);}
  g.beginPath();g.moveTo(48,100);g.lineTo(110,150);g.lineTo(120,186);inkS(g,null,10);g.lineWidth=10;g.strokeStyle=INK;g.stroke();g.strokeStyle='#d8dde6';g.lineWidth=5;g.stroke();
  g.fillStyle='#ffd23f';g.fillRect(-28,150,56,22);g.strokeStyle=INK;g.lineWidth=4;g.strokeRect(-28,150,56,22);
  g.beginPath();g.moveTo(-40,220);g.lineTo(40,220);g.lineTo(60,250);g.lineTo(-60,250);g.closePath();inkS(g,'#2a2f44',7);g.restore();}
