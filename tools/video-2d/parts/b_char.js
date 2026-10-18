// ===================== character rig (front view, stylised vector) =====================
const SKIN=hex('#c98a5e'),SKIN_D=hex('#a9693f'),HAIR=hex('#1d1512'),SUIT=hex('#f3f1ea'),SUIT_D=hex('#cfd3d9'),GLOVE=hex('#c2955a'),BOOT=hex('#6a4328'),STRAW=hex('#e6cd86');
const POSE0={lean:0,tilt:0,nod:0,yaw:0,bob:0,breathe:0,
  aL:[.12,.18],aR:[.12,.18],        // absolute angle of upper arm / forearm (rad from straight-down, + = away from body)
  fL:1,fR:1,                          // forearm foreshortening
  lgL:[.06,.0,1],lgR:[.06,.0,1],      // leg: thigh angle, lift(px), length scale
  hand:0,shrug:0,squash:1};
const EXPR0={eyeO:1,lidT:0,px:0,py:0,bL:0,bR:0,tL:0,tR:0,mW:1,mO:0,mC:.15,mS:0,blush:.1,sweat:0,brow:0};
function drawChar(g,x,y,S,pose,ex,opt={}){
  const P=Object.assign({},POSE0,pose),E=Object.assign({},EXPR0,ex);
  g.save();g.translate(x,y);g.scale(S*(opt.flip?-1:1),S);
  const br=P.breathe;
  // ground shadow
  g.save();g.fillStyle=rad(g,0,0,10,170,[[0,'#000',.32],[1,'#000',0]]);g.scale(1,.18);g.beginPath();g.arc(0,0,170,0,Math.PI*2);g.fill();g.restore();
  // ---- skeleton (hips at origin, y up is negative) ----
  const legH=235,hipY=-legH*(P.lgL[2]+P.lgR[2])/2+P.bob;
  const hip={x:0,y:hipY},lean=P.lean;
  const chest={x:hip.x+Math.sin(lean)*150,y:hip.y-Math.cos(lean)*150*(1+br*.012)};
  const shO=62+P.shrug*3;
  const shL={x:chest.x-Math.cos(lean)*shO,y:chest.y+Math.sin(lean)*shO-8-P.shrug*14},shR={x:chest.x+Math.cos(lean)*shO,y:chest.y-Math.sin(lean)*shO-8-P.shrug*14};
  const neck={x:chest.x+Math.sin(lean+P.tilt*.4)*26,y:chest.y-Math.cos(lean)*26-6};
  const head={x:neck.x+Math.sin(P.tilt)*84+P.yaw*10,y:neck.y-Math.cos(P.tilt)*84+P.nod*6};
  // ---- legs ----
  const legs=[[-1,P.lgL],[1,P.lgR]];
  for(const [s,lg] of legs){
    const hx=hip.x+s*34,hy=hip.y,len=legH*lg[2]/2*1.0,ang=lg[0]*s,lift=lg[1];
    const kx=hx+Math.sin(ang)*len*.96,ky=hy+Math.cos(ang)*len*.96-lift*.5;
    const fx=kx+Math.sin(ang*.6)*len*.96,fy=ky+Math.cos(ang*.6)*len*.96-lift*.5;
    limb(g,hx,hy,kx,ky,30,25,SUIT,{hi:.1,lo:.22});limb(g,kx,ky,fx,fy,25,20,SUIT,{hi:.1,lo:.24});
    // knee patch
    g.save();g.fillStyle=rgb(SUIT_D,.55);g.beginPath();g.ellipse(kx,ky,17,13,0,0,7);g.fill();g.restore();
    // boot
    g.save();g.translate(fx,fy);g.fillStyle=lin(g,0,-14,0,34,[[0,shade(BOOT,.22)],[1,shade(BOOT,-.3)]]);g.beginPath();g.moveTo(-23,-16);g.lineTo(23,-16);g.bezierCurveTo(27,6,30,16,42*s,26);g.bezierCurveTo(46*s,36,-4,40,-30*s,36);g.bezierCurveTo(-40*s,34,-30,12,-23,-16);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(-8*s,6,11,5,-.35,0,7);g.fill();g.fillStyle=rgb(shade(BOOT,-.55),.95);g.beginPath();g.roundRect(-34,33,76,8,4);g.fill();g.restore();
  }
  // ---- torso ----
  g.save();g.translate(hip.x,hip.y);g.rotate(lean);
  const tw=70+br*1.2,tw2=58;
  g.beginPath();g.moveTo(-tw2,0);g.bezierCurveTo(-tw2-8,-40,-tw-6,-100,-tw-2,-150-br*1.2);g.bezierCurveTo(-30,-168,30,-168,tw+2,-150-br*1.2);g.bezierCurveTo(tw+6,-100,tw2+8,-40,tw2,0);g.quadraticCurveTo(0,16,-tw2,0);g.closePath();
  g.fillStyle=lin(g,-tw,0,tw,0,[[0,shade(SUIT,.12)],[.35,SUIT],[1,shade(SUIT,-.24)]]);g.fill();
  g.clip();
  // fabric folds + zipper + belt + pocket
  g.strokeStyle=rgb(SUIT_D,.55);g.lineWidth=3;g.lineCap='round';
  g.beginPath();g.moveTo(0,-160);g.quadraticCurveTo(3,-80,0,4);g.stroke();
  for(let i=0;i<9;i++){g.fillStyle=rgb(SUIT_D,.8);g.fillRect(-2,-150+i*17,4,5);}
  g.fillStyle=lin(g,0,-62,0,-34,[[0,'#8a97a6'],[1,'#697686']]);g.fillRect(-tw2-14,-62,2*tw2+28,22);g.fillStyle='#c9ced6';rrect(g,-14,-60,28,18,4);g.fill();
  g.strokeStyle=rgb(SUIT_D,.7);g.lineWidth=2.5;rrect(g,22,-136,34,40,6);g.stroke();g.beginPath();g.moveTo(22,-124);g.lineTo(56,-124);g.stroke();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=4;g.beginPath();g.moveTo(-tw+8,-140);g.bezierCurveTo(-tw+2,-100,-tw2,-40,-tw2+2,-6);g.stroke();
  g.strokeStyle=rgb(SUIT_D,.35);g.lineWidth=2.5;g.beginPath();g.moveTo(-40,-100);g.quadraticCurveTo(-20,-90,-10,-70);g.moveTo(40,-110);g.quadraticCurveTo(22,-96,14,-74);g.stroke();
  g.restore();
  // ---- neck + collar ----
  limb(g,neck.x,neck.y+14,head.x,head.y+40,20,19,SKIN,{hi:.12,lo:.3});
  g.save();g.fillStyle=lin(g,0,neck.y-14,0,neck.y+14,[[0,shade(SUIT,-.05)],[1,shade(SUIT,-.28)]]);g.beginPath();g.ellipse(neck.x,neck.y+8,34,15,0,0,7);g.fill();g.restore();
  // ---- arms ----
  function arm(s,sh,a,fs){
    const L1=108,L2=96*fs;const ex=sh.x+s*Math.sin(a[0])*L1,ey=sh.y+Math.cos(a[0])*L1;
    const hx=ex+s*Math.sin(a[1])*L2,hy=ey+Math.cos(a[1])*L2;
    limb(g,sh.x,sh.y,ex,ey,27,22,SUIT,{hi:.12,lo:.24});
    limb(g,ex,ey,hx,hy,22,19,SUIT,{hi:.1,lo:.26});
    // cuff
    const dx=hx-ex,dy=hy-ey,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
    g.save();g.strokeStyle='#8a97a6';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(hx-ux*18-uy*19*0,hy-uy*18);g.lineTo(hx-ux*18,hy-uy*18);g.stroke();g.restore();
    // elbow soft shade
    g.save();g.fillStyle='rgba(120,130,150,.18)';g.beginPath();g.arc(ex,ey,17,0,7);g.fill();g.restore();
    // glove
    const ang=Math.atan2(dy,dx)-Math.PI/2;
    g.save();g.translate(hx,hy);g.rotate(ang);
    g.fillStyle=lin(g,-22,0,22,0,[[0,shade(GLOVE,.2)],[1,shade(GLOVE,-.25)]]);g.beginPath();g.roundRect(-20,-6,40,44,[14,14,18,18]);g.fill();
    g.fillStyle=lin(g,-22,0,22,0,[[0,shade(GLOVE,.1)],[1,shade(GLOVE,-.3)]]);g.beginPath();g.roundRect(s>0?-30:14,2,16,26,8);g.fill();
    g.strokeStyle=rgb(shade(GLOVE,-.4),.7);g.lineWidth=2;g.beginPath();g.moveTo(-8,16);g.lineTo(-8,36);g.moveTo(2,16);g.lineTo(2,38);g.moveTo(12,16);g.lineTo(12,34);g.stroke();
    g.restore();
    return {x:hx,y:hy,ex,ey};
  }
  const hL=arm(-1,shL,P.aL,P.fL),hR=arm(1,shR,P.aR,P.fR);
  // ---- head ----
  drawHead(g,head.x,head.y,P,E,S);
  g.restore();
  return {head:{x:x+head.x*S,y:y+head.y*S},hL:{x:x+hL.x*S,y:y+hL.y*S},hR:{x:x+hR.x*S,y:y+hR.y*S}};
}
function drawHead(g,hx,hy,P,E,S){
  g.save();g.translate(hx,hy);g.rotate(P.tilt);g.scale(1.28,1.28);
  const yw=P.yaw;
  // back brim + veil back
  g.save();g.fillStyle=rgb(shade(STRAW,-.28));g.beginPath();g.ellipse(0,-56,134,34,0,Math.PI,Math.PI*2);g.fill();g.restore();
  // ears
  for(const s of [-1,1]){g.fillStyle=lin(g,s*62,0,s*80,0,[[0,SKIN],[1,SKIN_D]]);g.beginPath();g.ellipse(s*(60+yw*(-s)*0),8,12,17,0,0,7);g.fill();g.fillStyle=rgb(SKIN_D,.5);g.beginPath();g.ellipse(s*61,9,5,9,0,0,7);g.fill();}
  // head shape
  g.beginPath();g.moveTo(-58,-24);g.bezierCurveTo(-64,28,-46,68,0,70);g.bezierCurveTo(46,68,64,28,58,-24);g.bezierCurveTo(56,-70,-56,-70,-58,-24);g.closePath();
  g.fillStyle=rad(g,-16,-12,6,92,[[0,shade(SKIN,.16)],[.6,SKIN],[1,SKIN_D]]);g.fill();
  g.save();g.clip();
  // hair + sideburns
  g.fillStyle=lin(g,0,-70,0,-12,[[0,shade(HAIR,.1)],[1,HAIR]]);g.beginPath();g.moveTo(-64,-6);g.bezierCurveTo(-66,-48,-30,-60,0,-58);g.bezierCurveTo(30,-60,66,-48,64,-6);g.lineTo(52,-20);g.bezierCurveTo(30,-38,-30,-38,-52,-20);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.ellipse(-22,-48,22,6,-.3,0,7);g.fill();
  // cheek light + jaw shade
  g.fillStyle=rad(g,0,70,10,62,[[0,'#000',.0],[1,'#000',.18]],0,0);g.fillRect(-70,40,140,40);
  // blush
  for(const s of [-1,1]){g.fillStyle=rad(g,s*36+yw*8,26,0,22,[[0,'#e2574c',.55*E.blush],[1,'#e2574c',0]]);g.fillRect(s*36-26+yw*8,0,52,52);}
  g.restore();
  // ---- face features (shift with yaw to fake head turn) ----
  g.save();g.translate(yw*14,0);
  // nose
  g.fillStyle=rgb(SKIN_D,.55);g.beginPath();g.moveTo(-2,6);g.bezierCurveTo(-9,18,-10,24,-4,27);g.quadraticCurveTo(0,29,5,26);g.bezierCurveTo(10,23,9,17,3,6);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(-2,12,2.4,6,0,0,7);g.fill();
  // eyes
  for(const s of [-1,1]){
    const ex=s*27,ey=-2,open=clamp(E.eyeO,0,1.35),wide=Math.max(0,open-1);
    const ry=17*Math.max(.04,open),rx=15+wide*5;
    g.save();g.translate(ex,ey);
    g.beginPath();g.ellipse(0,0,rx,ry,0,0,7);g.save();g.clip();
    g.fillStyle='#fdfdfb';g.fillRect(-20,-24,40,48);
    const px=E.px*6+yw*5,py=E.py*5;
    g.fillStyle=rad(g,px,py,0,11,[[0,'#2a1b12'],[.7,'#4a3020'],[1,'#1a100a']]);g.beginPath();g.arc(px,py,10.5,0,7);g.fill();
    g.fillStyle='#0a0605';g.beginPath();g.arc(px,py,5.4,0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(px-3.4,py-4,3.3,0,7);g.fill();g.beginPath();g.arc(px+3.5,py+3.5,1.6,0,7);g.fill();
    // upper lid shade
    g.fillStyle='rgba(60,30,15,.22)';g.beginPath();g.ellipse(0,-ry*.95,rx+2,ry*.8,0,0,7);g.fill();
    // lid (blink / squint)
    const lid=E.lidT;if(lid>0){g.fillStyle=rgb(SKIN_D);g.fillRect(-24,-24,48,24*lid*2-(1-lid)*0);}
    g.restore();
    g.strokeStyle='rgba(40,20,10,.55)';g.lineWidth=2.4;g.beginPath();g.ellipse(0,0,rx,ry,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
    g.restore();
  }
  // brows
  for(const s of [-1,1]){
    const up=(s<0?E.bL:E.bR),tl=(s<0?E.tL:E.tR);
    g.save();g.translate(s*27,-31-up*13);g.rotate(tl*.5*(-s));
    g.strokeStyle=rgb(HAIR);g.lineWidth=8.5;g.lineCap='round';g.beginPath();g.moveTo(-17,3+(s>0?0:0));g.quadraticCurveTo(0,-7-E.brow*5,17,2);g.stroke();
    g.strokeStyle='rgba(255,255,255,.1)';g.lineWidth=2;g.beginPath();g.moveTo(-12,-1);g.quadraticCurveTo(0,-9-E.brow*5,12,-1);g.stroke();
    g.restore();
  }
  // mouth
  g.save();g.translate(0,40);
  const mw=24*E.mW+E.mS*8,open=E.mO*30,curve=E.mC*12;
  if(open>2.5){
    g.beginPath();g.moveTo(-mw,0-curve*.3);g.bezierCurveTo(-mw*.8,open*1.35,mw*.8,open*1.35,mw,0-curve*.3);g.bezierCurveTo(mw*.6,-4-curve*.6,-mw*.6,-4-curve*.6,-mw,0-curve*.3);g.closePath();
    g.fillStyle='#4a1414';g.fill();g.save();g.clip();
    g.fillStyle='#fbf7ef';g.fillRect(-mw,-6,2*mw,Math.min(open*.38,13));
    g.fillStyle='#d4575e';g.beginPath();g.ellipse(0,open*1.05,mw*.55,open*.42,0,0,7);g.fill();g.restore();
    g.strokeStyle='rgba(60,20,15,.8)';g.lineWidth=2.5;g.stroke();
  }else{
    g.strokeStyle='#5a2a20';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-mw,-curve*.5);g.quadraticCurveTo(0,curve*1.1+4,mw,-curve*.5);g.stroke();
    if(curve>5){g.fillStyle='rgba(255,255,255,.0)';}
  }
  g.restore();
  g.restore();
  // sweat drop
  if(E.sweat>0.01){const k=E.sweat;g.save();g.translate(64,-36+k*16);g.fillStyle=lin(g,0,-14,0,12,[[0,'#d8f1ff',.95],[1,'#6fc0f0',.95]]);g.globalAlpha=Math.min(1,k*1.6);g.beginPath();g.moveTo(0,-16);g.bezierCurveTo(12,0,11,12,0,13);g.bezierCurveTo(-11,12,-12,0,0,-16);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(-3,-2,2,5,.3,0,7);g.fill();g.restore();}
  // ---- hat (front) ----
  g.save();
  // crown
  const cy=-64;
  g.fillStyle=lin(g,-86,0,86,0,[[0,shade(STRAW,.12)],[.5,STRAW],[1,shade(STRAW,-.22)]]);
  g.beginPath();g.moveTo(-84,cy);g.bezierCurveTo(-88,cy-40,-70,cy-66,-52,cy-70);g.quadraticCurveTo(0,cy-82,52,cy-70);g.bezierCurveTo(70,cy-66,88,cy-40,84,cy);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(-34,cy-52,24,8,-.25,0,7);g.fill();
  g.fillStyle=lin(g,0,cy-26,0,cy,[[0,'#6a4a2a'],[1,'#4a331c']]);g.fillRect(-85,cy-24,170,22);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(-85,cy-24,170,4);
  // front brim
  g.fillStyle=lin(g,0,cy-8,0,cy+40,[[0,shade(STRAW,.1)],[1,shade(STRAW,-.12)]]);
  g.beginPath();g.moveTo(-138,cy-3);g.bezierCurveTo(-130,cy+38,130,cy+38,138,cy-3);g.bezierCurveTo(100,cy-20,-100,cy-20,-138,cy-3);g.closePath();g.fill();
  g.strokeStyle='rgba(110,80,35,.35)';g.lineWidth=2;for(let i=1;i<6;i++){g.beginPath();g.moveTo(-132+i*8,cy+3+i*.8);g.bezierCurveTo(-90,cy+28+i*3,90,cy+28+i*3,132-i*8,cy+3+i*.8);g.stroke();}
  g.restore();
  // veil (net) hanging from the brim
  g.save();
  const vy=cy+22;
  g.beginPath();g.moveTo(-124,vy-16);g.bezierCurveTo(-132,vy+60,-112,vy+120,-90,vy+142);g.quadraticCurveTo(0,vy+166,90,vy+142);g.bezierCurveTo(112,vy+120,132,vy+60,124,vy-16);g.bezierCurveTo(88,vy+24,-88,vy+24,-124,vy-16);g.closePath();
  g.fillStyle=lin(g,0,vy,0,vy+170,[[0,'#ffffff',.13],[1,'#dfe8f2',.06]]);g.fill();g.clip();
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1.2;
  for(let i=-150;i<=150;i+=15){g.beginPath();g.moveTo(i,vy-20);g.lineTo(i*1.12,vy+210);g.stroke();}
  for(let j=0;j<14;j++){const yy=vy+j*15;g.beginPath();g.moveTo(-150,yy);g.quadraticCurveTo(0,yy+34,150,yy);g.stroke();}
  g.restore();
  g.restore();
}
