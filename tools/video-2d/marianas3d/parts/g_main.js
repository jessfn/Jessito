let CV,G,POST,POSTG,CH,CHG,GRAIN=[];
const T_WORLD_END=9.5,SCL=.70;
let CAMK=[];
function initMain(){
  CAMK=[[T_WORLD_END+.2,1,0,540,960,540,960],[10.5,1.7,1,0,0,540,850],[12.9,1.7,1,0,0,540,850],[13.8,1,0,540,960,540,960],[14.95,1,0,540,960,540,960],[15.3,1.9,1,120,70,540,900],[17.6,1.9,1,120,70,540,900],[18.0,1,0,540,960,540,960],[22.0,1,0,540,960,540,960],[22.8,1.4,1,0,170,540,1010],[24.9,1.4,1,0,170,540,1010],[25.6,1,0,540,960,540,960],[27.5,1,0,540,960,540,960],[28.3,2.4,1,0,0,540,840],[31.5,2.4,1,0,0,540,840],[32.3,1,0,540,960,540,960],[T.land-.5,1,0,540,960,540,960],[T.land+.6,1.5,1,110,0,540,1000],[T.land+2.6,1.5,1,110,0,540,1000],[T.land+3.4,1,0,540,960,540,960],[48.1,1,0,540,960,540,960],[48.95,.55,0,640,1230,540,1290],[1e5,.55,0,640,1230,540,1290]];
  CV=document.getElementById('c');G=CV.getContext('2d');
  POST=offscreen(W/6,H/6);POSTG=POST.getContext('2d');CH=offscreen(W*SC,H*SC);CHG=CH.getContext('2d');
  for(let i=0;i<6;i++){const c=offscreen(256,256),g=c.getContext('2d'),d=g.createImageData(256,256);for(let k=0;k<d.data.length;k+=4){const v=128+(rng(k*.37+i*911)-.5)*140;d.data[k]=d.data[k+1]=d.data[k+2]=v;d.data[k+3]=255;}g.putImageData(d,0,0);GRAIN.push(c);}
  initDepth();simulate3();initPhase();
}
const DECK_NECK=[470,-1052];
function neckWorld(t){
  if(t<T.fall)return [DECK_NECK[0]+Math.sin(t*3)*2,DECK_NECK[1]];
  if(t<T.splash){const a=t-T.fall;return [DECK_NECK[0]+180*a,DECK_NECK[1]+.5*2600*a*a];}
  const a=t-T.splash,x0=DECK_NECK[0]+180*(T.splash-T.fall);return [x0+30*(1-Math.exp(-a/.8)),-632+517*(1-Math.exp(-a/.35))+230*a];}
// hip (root) position in world/screen coordinates
function rootBaseAt(t){if(t<T_WORLD_END){const N=neckWorld(t);return [N[0],N[1]+278];}
  const l=ss(T.brill+.4,T.land,t);return [lerp(650,570,l),lerp(900,1212,l)];}
function camAt(t,headW){
  if(t<T_WORLD_END){const N=neckWorld(t),k=ss(1.7,4.6,t);const z=lerp(.6,1,k),fx=lerp(480,N[0]-110,k),fy=lerp(-470,N[1]+338,k);return {z,fx,fy,tx:540,ty:960,world:true};}
  let i=0;while(i<CAMK.length-2&&t>=CAMK[i+1][0])i++;const a=CAMK[i],b=CAMK[i+1],k=eio(clamp((t-a[0])/Math.max(.05,b[0]-a[0])));
  const ab=r=>r[2]===0?[r[3],r[4]]:[headW[0]+r[3],headW[1]+r[4]];
  const fa=ab(a),fb=ab(b);
  return {z:Math.exp(lerp(Math.log(a[1]),Math.log(b[1]),k)),fx:lerp(fa[0],fb[0],k),fy:lerp(fa[1],fb[1],k),tx:lerp(a[5],b[5],k),ty:lerp(a[6],b[6],k),world:false};}
const camT=(g,c)=>{g.translate(c.tx,c.ty);g.scale(c.z,c.z);g.translate(-c.fx,-c.fy);};
const toScreen=(c,x,y)=>[(x-c.fx)*c.z+c.tx,(y-c.fy)*c.z+c.ty];
function floorTop(t){const a=t<T.brill+.2?0:eio((t-(T.brill+.2))/(T.land-(T.brill+.2)));return lerp(2300,1258,a);}
function creatures(g,t,D,c){
  g.save();const pz=Math.pow(c.z,.35);g.translate(540,960);g.scale(pz,pz);g.translate(-540,-960);
  const dim=clamp(1-D/1400)*.9+.1;
  // fish school
  if(t>6.8&&t<11){const k=(t-7.2)/3.4;for(let i=0;i<16;i++){const x=-120+k*1400+Math.sin(i*2)*160+i*22,y=640+rng(i)*320+Math.sin(t*2+i)*20;if(x<-150||x>1250)continue;g.save();g.translate(x,y);fishShape(g,.34+rng(i+4)*.12,'#c9e8f5',t,i);g.restore();}}
  // shark
  if(t>13.6&&t<18.4){const k=ss(13.6,18.4,t),x=1400-k*1800,y=860+Math.sin(t*.8)*26;g.save();g.translate(x,y);g.scale(-1,1);g.globalAlpha=.55+.4*clamp(1-D/900);sharkShape(g,.72,t);g.restore();}
  // jellyfish drifting up
  if(t>18.3&&t<27.3){for(const [x0,ph,ts] of [[900,0,18.5],[420,2,20.6]]){const k=(t-ts)/6.5;if(k<0||k>1)continue;const y=1500-k*1900,x=x0+Math.sin(t*.8+ph)*50;g.save();g.translate(x,y);jellyShape(g,.7,t,ph,'#8fb8ff',.7);g.restore();}}
  // deep creatures
  if(t>T.peces-.6&&t<T.land+.3){const k=(t-(T.peces-.6))/4.5;g.save();g.translate(-250+k*1500,880+Math.sin(t*1.3)*30);snailfish(g,.8,t);g.restore();
    const k2=(t-(T.crust-.8))/4.6;if(k2>0&&k2<1){g.save();g.translate(1350-k2*1700,1010+Math.sin(t*1.1)*22);g.scale(-1,1);amphipod(g,.62,t);g.restore();}
    const k3=(t-(T.brill-.9))/4.4;if(k3>0&&k3<1){g.save();g.translate(1350-k3*1700,720+Math.sin(t*.9)*24);g.scale(-1,1);angler(g,.62,t);g.restore();}}
  g.restore();}
function frame(t){
  const g=G;g.setTransform(SC,0,0,SC,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';g.shadowColor='transparent';g.shadowBlur=0;
  const si=sceneAt(t),D=depthAt(t),rate=rateAt(t);const P3=pose3At(t);const rb0=rootBaseAt(t);const rb=[rb0[0]+P3.ox,rb0[1]+P3.oy];const hw=CH3D.layout(P3,rb);const c=camAt(t,hw.head);
  const ySurf=c.world?toScreen(c,0,0)[1]:-2000;
  waterBG(g,t,D,ySurf);
  // ---- world: sky + boat + surface (only while the surface is on screen) ----
  if(c.world&&ySurf>-300){g.save();camT(g,c);skyWorld(g,t,0);boatWorld(g,t);g.restore();
    // shimmering surface ceiling seen from below
    g.save();g.beginPath();g.moveTo(0,toScreen(c,0,waveY(0,t))[1]);for(let x=0;x<=W;x+=24){const wx=(x-c.tx)/c.z+c.fx;g.lineTo(x,toScreen(c,wx,waveY(wx,t))[1]);}g.lineTo(W,ySurf-40);g.lineTo(0,ySurf-40);g.closePath();g.restore();}
  snow(g,t,D,rate);
  creatures(g,t,D,c);
  // floor (landing) is screen-space
  const fl=floorTop(t);if(fl<2000){g.save();camT(g,c);seafloor(g,t,fl,0);g.restore();}
  // ---- sub (screen) ----
  const subY=t<T.cam-1.1?-500:t<T.cam+.9?lerp(-500,690,eio((t-(T.cam-1.1))/2.0)):t<48.5?690+Math.sin(t*1.3)*12:lerp(690,-600,eio((t-48.5)/1.6));
  const subL=ss(T.cam-.4,T.cam+.6,t)*(1-ss(48.5,49.4,t));
  // dark water layer toward the depth (tint over background but under figure)
  if(subY>-400&&subY<1500){g.save();camT(g,c);challenger(g,t,830,subY,1.1,subL);g.restore();}
  // ---- figure (3D avatar rendered with three.js, composited over the 2D world) ----
  const subLamp=subL>.01?{x:830,y:subY+60,i:subL}:null;
  CH3D.render(c,D,subLamp,t);g.drawImage(CH3D.canvas,0,0,W,H);
  // bubbles around the figure
  const fs=toScreen(c,hw.head[0],hw.head[1]+60);const splashB=ss(T.splash,T.splash+.2,t)*(1-ss(T.splash+2.6,T.splash+4.8,t));
  bubbles(g,t,fs[0]+12*c.z,fs[1]-6*c.z,.18+.5*splashB,3,Math.min(c.z,1.2)*.7);bubbles(g,t,fs[0]+40*c.z,fs[1]+260*c.z,.7*splashB,8,c.z);
  // surface front + splash
  if(c.world&&ySurf>-300){g.save();camT(g,c);seaSurfaceFront(g,t,-4000,5000);splashFX(g,t,T.splash,rootBaseAt(T.splash)[0]);g.restore();}
  // landing silt
  g.save();camT(g,c);silt(g,t,700,1262,T.land,1.8);g.restore();
  // vent teaser (CTA)
  const vk=ss(T.volc-1.2,T.volc+.3,t);if(vk>.01){g.save();camT(g,c);ventDraw(g,t,vk);g.restore();}
  // pressure + jets + badges
  pressArrows(g,t,fs[0],fs[1]+300*c.z,ss(T.pres,T.pres+.6,t)*(1-ss(T.avion+.6,T.avion+1.2,t)));
  jetStack(g,t,ss(T.cinc-.1,T.cinc+.5,t)*(1-ss(T.pulm-.4,T.pulm+.1,t)));
  badge(g,866,1010,66,ss(T.pulm,T.pulm+.5,t)*(1-ss(T.fondo+.6,T.fondo+1.2,t)),()=>{g.save();g.translate(0,0);lungsIcon(g,t,lerp(1,.62,ss(T.pulm,T.oid,t))*.8);g.restore();});
  badge(g,214,1010,66,ss(T.oid,T.oid+.5,t)*(1-ss(T.fondo+.6,T.fondo+1.2,t)),()=>{g.save();g.scale(.85,.85);earIcon(g,t,ss(T.romp-.2,T.romp+.6,t));g.restore();});
  // gauge
  const pa=ss(5.0,5.7,t)*(1-ss(1.0,1.3,c.z))*(1-ss(T.land-.3,T.land+.3,t));panel(g,t,D,pa);
  // ---- post ----
  POSTG.globalCompositeOperation='copy';POSTG.drawImage(CV,0,0,POST.width,POST.height);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=.16;g.filter=`blur(${6*SC}px)`;g.drawImage(POST,-20,-20,W+40,H+40);g.filter='none';g.restore();
  const vg=.25+.35*clamp(D/3000);g.save();g.fillStyle=rad(g,540,960,520,1300,[[0,'#000',0],[1,'#02040f',vg]]);g.fillRect(0,0,W,H);g.restore();
  g.save();g.globalAlpha=.05;g.globalCompositeOperation='overlay';const gi=Math.floor(t*24)%6;g.fillStyle=g.createPattern(GRAIN[gi],'repeat');g.translate((gi*53)%256,(gi*97)%256);g.fillRect(-256,-256,W+256,H+256);g.restore();
  // splash flash at impact
  const fa=Math.exp(-(t-T.splash)*9);if(t>=T.splash&&fa>.02){g.fillStyle=`rgba(255,255,255,${.35*fa})`;g.fillRect(0,0,W,H);}
}
function ventDraw(g,t,k){g.save();g.globalAlpha=k;glow(g,160,1000,500,'#ff7a30',.55+.15*Math.sin(t*6));
  g.beginPath();g.moveTo(110,1310);g.lineTo(130,1040);g.lineTo(160,960);g.lineTo(190,1040);g.lineTo(220,1310);g.closePath();inkS(g,lin(g,0,950,0,1310,[[0,'#3a2a2a'],[1,'#1a1218']]),8);
  glow(g,160,960,160,'#ffb060',.9);for(let i=0;i<14;i++){const ph=((t*.5+rng(i)*3)%1),yy=950-ph*520,xx=160+Math.sin(ph*6+i)*50+(rng(i+3)-.5)*70,r=14+ph*46;g.globalAlpha=k*(1-ph)*.7;g.fillStyle='#161018';g.beginPath();g.arc(xx,yy,r,0,7);g.fill();}
  g.globalAlpha=k;for(let i=0;i<10;i++){const ph=((t*1.2+rng(i+9)*3)%1),xx=160+(rng(i+1)-.5)*80*ph,yy=960-ph*300;g.globalAlpha=k*(1-ph);g.fillStyle='#ffcf70';g.beginPath();g.arc(xx,yy,3+rng(i)*4,0,7);g.fill();}g.restore();}
