// Pseudo-3D scenes (stairwell remnant, lobby, burning street) drawn as SVG with real perspective, shading and lights
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
export const lerp=(a,b,t)=>a+(b-a)*t;
export const EV={cam:7.4,lever:11.4,lift:15.6,dim:24.5,phone:27,go:29.5,arrive:33.9,door1:36.8,lobby:38.1,keys:48.6,scratch:50.8,unlock:57.8,doorsOpen:58.9,street:60.4,truck:65.4,metro:75.6,drain:79.3,run:83,heli:84.6,gstep:89.2,metroIn:93.7,fall:95.1,black:96.4,endcard:97.3};
export const setEV=o=>{Object.assign(EV,o);buildD()};
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const f1=n=>n.toFixed(1);
// ---------- projection (camera 1.2 m high, characters stand at Z=3)
export const VX=1230,HY=760,HC=1.2,F=1857;
export const P=(X,Y,Z)=>{const k=F/Z;return[VX+X*k,HY-(Y-HC)*k]};
const pt=(a)=>`${f1(a[0])},${f1(a[1])}`;
const poly=(pts,fill,extra='')=>`<polygon points="${pts.map(pt).join(' ')}" fill="${fill}" ${extra}/>`;
const hex=(r,g,b)=>`rgb(${Math.round(clamp(r,0,255))},${Math.round(clamp(g,0,255))},${Math.round(clamp(b,0,255))})`;
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
// ---------- street travel profile D(t) in metres
let DT=[];
function sp(t){const r=(a,b,x)=>sm((x-a)/(b-a));let v=0;if(t>EV.street)v=1.0*r(EV.street,EV.street+1.5,t)*(1-r(EV.street+8,EV.street+11,t));if(t>EV.run)v+=4.4*r(EV.run,EV.run+1,t)*(1-r(EV.metroIn-.5,EV.metroIn+.8,t));return v}
function buildD(){DT=[0];const dt=1/60;for(let i=1;i<=60*160;i++)DT.push(DT[i-1]+sp(i*dt)*dt)}
buildD();
export const dist=t=>{const i=clamp(t*60,0,DT.length-2);const a=Math.floor(i);return DT[a]+(DT[a+1]-DT[a])*(i-a)};
export const speedAt=sp;
// ---------- light sources (world metres) -> brightness/tint for faces
function lightsAt(t,Dm){const L=[];const fl=(i)=>.8+.2*Math.sin(t*13+i*3.1)+.1*Math.sin(t*29+i);
 [[-9,2,22,1],[8,2,38,2],[-6,2,60,3],[10,3,80,4],[0,2,95,5]].forEach(([x,y,z,i])=>L.push({x,y,z:z-Dm,c:[255,130,40],I:2.2*fl(i),R:14}));
 // lamps
 for(let k=0;k<9;k++){const z=k*18+6-(Dm%18)+18;const bad=rn(k+Math.floor(Dm/18)*7)<.4;if(!bad)for(const s of[-1,1])L.push({x:s*8,y:5.5,z,c:[255,214,150],I:.9,R:9})}
 // siren flashes
 const ph=Math.sin(t*9)>0;L.push({x:ph?-3:3,y:2,z:2.5,c:ph?[255,40,30]:[40,90,255],I:.9,R:10});return L}
function lit(base,x,y,z,k,L){let r=base[0]*.16,g=base[1]*.17,b=base[2]*.2;for(const l of L){const dx=x-l.x,dy=y-l.y,dz=z-l.z;const d2=dx*dx+dy*dy+dz*dz;const a=l.I/(1+d2/(l.R*l.R));r+=base[0]*a*l.c[0]/255;g+=base[1]*a*l.c[1]/255;b+=base[2]*a*l.c[2]/255}return hex(r*k,g*k,b*k)}
// ---------- boxes with perspective
function box(x0,x1,y0,y1,z0,z1,base,L,o={}){if(z1<.4)return'';z0=Math.max(z0,.45);let s='';const c=rgb(base);
 const V=(x,y,z)=>P(x,y,z);const mx=(x0+x1)/2,my=(y0+y1)/2;
 // side face (inner)
 if(x1<0||(x0<0&&x1>0&&false)){s+=poly([V(x1,y0,z0),V(x1,y1,z0),V(x1,y1,z1),V(x1,y0,z1)],lit(c,x1,my,(z0+z1)/2,.7,L))}
 else if(x0>0){s+=poly([V(x0,y0,z0),V(x0,y1,z0),V(x0,y1,z1),V(x0,y0,z1)],lit(c,x0,my,(z0+z1)/2,.7,L))}
 if(y1<HC)s+=poly([V(x0,y1,z0),V(x1,y1,z0),V(x1,y1,z1),V(x0,y1,z1)],lit(c,mx,y1,(z0+z1)/2,1.05,L));
 s+=poly([V(x0,y0,z0),V(x1,y0,z0),V(x1,y1,z0),V(x0,y1,z0)],lit(c,mx,my,z0,.85,L),o.stroke?`stroke="${o.stroke}" stroke-width="1.5"`:'');return s}
// ---------- building with windows
function building(side,zN,zF,w,h,seed,t,L,Dm){const x0=side<0?-9-w:9,x1=side<0?-9:9+w;let s=box(x0,x1,0,h,zN,zF,'#3a3f4c',L);
 // windows on the inner face (x=-9 or 9)
 const xf=side<0?-9:9;const rows=Math.floor(h/3.2),cols=Math.max(1,Math.floor((zF-zN)/4));
 for(let r=1;r<rows;r++)for(let c=0;c<cols;c++){const z0=zN+c*4+.8,z1=z0+2.2,y0=r*3.2+.5,y1=y0+1.8;if(z1<.6)continue;const q=rn(seed*31+r*7+c*13);let col,op;
  if(q<.12){const fl=.75+.25*Math.sin(t*14+seed+r+c);col=hex(255,120+60*fl,30);op=.95}else if(q<.45){col=hex(255,215,140);op=.85}else{col='#0b0d14';op=.9}
  const pts=[P(xf,y0,z0),P(xf,y1,z0),P(xf,y1,Math.max(z1,.6)),P(xf,y0,Math.max(z1,.6))];s+=poly(pts,col,`fill-opacity="${op}"`);
  if(q<.12){const cc=P(xf,y1+.2,(z0+z1)/2);s+=`<circle cx="${f1(cc[0])}" cy="${f1(cc[1])}" r="${f1(40*F/((z0+z1)/2)/80)}" fill="url(#fireG)" fill-opacity=".5"/>`}}
 return s}
// ---------- props
const wheel=(x,y,z,r)=>{const c=P(x,y,z),k=F/z;return `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(r*k*.5)}" ry="${f1(r*k)}" fill="#0a0a0c"/>`};
function car(x,z,col,L,t,o={}){const w=1.9,h=1.45,len=4.4;let s='';
 const c=rgb(col);s+=blob(x,0,z+len/2,w*1.2,len*.5,L);
 s+=box(x-w/2,x+w/2,.35,.95,z,z+len,col,L);s+=box(x-w*.42,x+w*.42,.95,h,z+len*.25,z+len*.75,'#20242c',L);
 const f=P(x,.65,z);const k=F/z;
 if(!o.dead){for(const sx of[-1,1]){const hp=P(x+sx*.7,.62,z);s+=`<circle cx="${f1(hp[0])}" cy="${f1(hp[1])}" r="${f1(.14*k)}" fill="${o.tail?'#ff2a1a':'#fff4d0'}"/><circle cx="${f1(hp[0])}" cy="${f1(hp[1])}" r="${f1(.5*k)}" fill="url(#${o.tail?'redG':'warmG'})" fill-opacity=".5"/>`}}
 s+=wheel(x-w/2+.1,.3,z+.2,.3)+wheel(x+w/2-.1,.3,z+.2,.3);if(o.fire)s+=flame(x,.9,z+len*.5,2.2,t,1);return s}
function blob(x,y,z,w,d,L){const c=P(x,y,z),k=F/z;return `<ellipse cx="${f1(c[0])}" cy="${f1(c[1]+k*.04)}" rx="${f1(w*k*.55)}" ry="${f1(d*k*.14)}" fill="#000" fill-opacity=".55"/>`}
export function flame(x,y,z,sz,t,seed){const c=P(x,y,z),k=F/z;let s=`<circle cx="${f1(c[0])}" cy="${f1(c[1]-sz*k*.4)}" r="${f1(sz*k*1.6)}" fill="url(#fireG)" fill-opacity=".55"/>`;
 for(let i=0;i<3;i++){const fl=Math.sin(t*(11+i*3)+seed*5+i*2);const hgt=sz*(1+.3*fl)*(1-i*.25),wd=sz*.38*(1-i*.2);const col=['#ff5a1a','#ffa21a','#ffe27a'][i];
  s+=`<path d="M${f1(c[0]-wd*k)},${f1(c[1])} Q${f1(c[0]-wd*k*.9)},${f1(c[1]-hgt*k*.5)} ${f1(c[0]+fl*wd*k*.4)},${f1(c[1]-hgt*k)} Q${f1(c[0]+wd*k*.9)},${f1(c[1]-hgt*k*.5)} ${f1(c[0]+wd*k)},${f1(c[1])}Z" fill="${col}" fill-opacity="${.9-i*.1}"/>`}
 return s}
function lamp(x,z,t,L,broken,seed){let s='';const base=P(x,0,z),top=P(x,6,z),k=F/z;s+=blob(x,0,z,.6,.6,L);s+=`<line x1="${f1(base[0])}" y1="${f1(base[1])}" x2="${f1(top[0])}" y2="${f1(top[1])}" stroke="#15171c" stroke-width="${f1(.18*k)}"/>`;
 const arm=P(x-Math.sign(x)*1.6,6.1,z);s+=`<line x1="${f1(top[0])}" y1="${f1(top[1])}" x2="${f1(arm[0])}" y2="${f1(arm[1])}" stroke="#15171c" stroke-width="${f1(.14*k)}"/>`;
 const on=!broken&&(Math.sin(t*17+seed*5)*Math.sin(t*7+seed)>-.3);s+=`<ellipse cx="${f1(arm[0])}" cy="${f1(arm[1]+.1*k)}" rx="${f1(.5*k)}" ry="${f1(.14*k)}" fill="${on?'#fff2c8':'#2a2c32'}"/>`;
 if(on){s+=`<circle cx="${f1(arm[0])}" cy="${f1(arm[1])}" r="${f1(5*k)}" fill="url(#warmG)" fill-opacity=".55"/>`;const g=P(x-Math.sign(x)*1.6,0,z);s+=`<ellipse cx="${f1(g[0])}" cy="${f1(g[1])}" rx="${f1(3.2*k)}" ry="${f1(.5*k)}" fill="url(#warmG)" fill-opacity=".35"/>`}return s}
function hydrant(x,z,t,L,spray){let s=blob(x,0,z,.6,.6,L);const b=P(x,0,z),k=F/z;s+=`<rect x="${f1(b[0]-.16*k)}" y="${f1(b[1]-.75*k)}" width="${f1(.32*k)}" height="${f1(.75*k)}" rx="${f1(.1*k)}" fill="#a02820"/><rect x="${f1(b[0]-.26*k)}" y="${f1(b[1]-.55*k)}" width="${f1(.52*k)}" height="${f1(.14*k)}" fill="#7a1d18"/><circle cx="${f1(b[0])}" cy="${f1(b[1]-.82*k)}" r="${f1(.2*k)}" fill="#b83228"/>`;
 if(spray){for(let i=0;i<22;i++){const u=((t*1.4+i/22)%1),ang=(rn(i)-.5)*1.2;const px=b[0]+Math.sin(ang)*u*2.2*k,py=b[1]-.8*k-Math.cos(ang)*u*1.4*k+u*u*2.4*k;s+=`<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1((.07+.05*(1-u))*k)}" fill="#bfe2ff" fill-opacity="${(.7*(1-u)).toFixed(2)}"/>`}const g=P(x+1,0,z+.5);s+=`<ellipse cx="${f1(g[0])}" cy="${f1(g[1])}" rx="${f1(2.6*k)}" ry="${f1(.35*k)}" fill="#7aa8c8" fill-opacity=".4"/>`}return s}
function bus(zN,L,t,crushed,xs=-1){const len=11,x0=xs<0?-7.2:3.4,x1=xs<0?-3.4:7.2;const sq=crushed;let s=blob((x0+x1)/2,0,zN+len/2,4,len*.6,L);
 s+=box(x0,x1,.9*(1-sq),3.0*(1-sq*.8),zN,zN+len,'#d6a01a',L);s+=box(x0+.2,x1-.2,2.4*(1-sq*.75),3.0*(1-sq*.75),zN,zN+len,'#8a6a10',L);
 // windows along the facing side
 for(let i=0;i<6;i++){const z0=zN+.6+i*1.75;const w=[P(x1,1.0*(1-sq*.7),z0),P(x1,2.2*(1-sq*.7),z0),P(x1,2.2*(1-sq*.7),z0+1.4),P(x1,1.0*(1-sq*.7),z0+1.4)];s+=poly(w,'#0f1520','fill-opacity=".9"')}
 s+=`<text x="${f1(P(-5.3,2.6,zN+2)[0])}" y="${f1(P(-5.3,2.6,zN+2)[1])}" font-family="Inter" font-weight="900" font-size="${f1(.5*F/(zN+2))}" fill="#3a2a05" text-anchor="middle">LÍNEA 8</text>`;if(!crushed&&t>EV.street)s+=flame(-4.5,1.0,zN+5,1.4,t,7);return s}
function metroEntrance(zN,t,L){const x0=8.5,x1=12.5;let s=blob(10.5,0,zN+2,4,3,L);s+=box(x0,x1,0,3.2,zN,zN+4,'#2a3a4a',L);
 const a=P(x0,2.4,zN),b=P(x0,3.6,zN),k=F/zN;const sx=P(x0,2.9,zN);const pulse=.8+.2*Math.sin(t*5);
 s+=poly([P(x0,0,zN),P(x0,2.4,zN),P(x0,2.4,zN+3.2),P(x0,0,zN+3.2)],'#02040a');
 for(let i=0;i<7;i++){const z=zN+.3+i*.42;s+=poly([P(x0,.0-i*.0,z),P(x0,1.9-i*.2,z),P(x0,1.9-i*.2,z+.35),P(x0,.0,z+.35)],i%2?'#10131a':'#161a22')}
 const sign=[P(x0,3.6,zN+.2),P(x0,4.5,zN+.2),P(x0,4.5,zN+3.6),P(x0,3.6,zN+3.6)];s+=poly(sign,'#0b3a8a');s+=poly([P(x0-.02,3.7,zN+.4),P(x0-.02,4.4,zN+.4),P(x0-.02,4.4,zN+3.4),P(x0-.02,3.7,zN+3.4)],`#1f6fe0`,`fill-opacity="${pulse}"`);
 const c=P(x0,4.05,zN+1.9);s+=`<text x="${f1(c[0])}" y="${f1(c[1]+.18*F/(zN+1.9))}" font-family="Inter" font-weight="900" font-size="${f1(.62*F/(zN+1.9))}" fill="#fff" text-anchor="middle" letter-spacing="4">METRO</text>`;
 s+=`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(6*F/(zN+1.9))}" fill="url(#blueG)" fill-opacity=".35"/>`;return s}
function drain(x,z,t,L){const c=P(x,0,z),k=F/z;let s=`<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(1.1*k)}" ry="${f1(.22*k)}" fill="#050507" stroke="#3a3d45" stroke-width="${f1(.05*k)}"/>`;for(let i=-4;i<=4;i++)s+=`<line x1="${f1(c[0]+i*.24*k)}" y1="${f1(c[1]-.2*k)}" x2="${f1(c[0]+i*.24*k)}" y2="${f1(c[1]+.2*k)}" stroke="#2a2c32" stroke-width="${f1(.04*k)}"/>`;return s}
// ---------- sky / smoke / helicopter
function sky(t,Dm){let s=`<rect x="-3500" y="-3000" width="9000" height="${HY+3000}" fill="url(#skyG)"/>`;
 s+=`<ellipse cx="${VX}" cy="${HY}" rx="2200" ry="520" fill="url(#fireG)" fill-opacity=".85"/>`;
 for(let i=0;i<9;i++){const x=300+i*330+Math.sin(t*.3+i)*60,y=HY-380-i%3*180-((t*14+i*70)%120);s+=`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${420+i%4*90}" ry="${180+i%3*50}" fill="#120d10" fill-opacity=".55"/>`}
 // distant giant silhouette in the smoke
 const g=VX+700,gy=HY-120;s+=`<path d="M${g-60},${gy+140} L${g-90},${gy-420} Q${g-70},${gy-640} ${g},${gy-700} Q${g+80},${gy-640} ${g+90},${gy-420} L${g+60},${gy+140}Z" fill="#07050a" fill-opacity=".72"/>`;
 return s}
export function heli(t){if(t<EV.heli-1||t>EV.metroIn+1)return'';const u=(t-(EV.heli-1))/6;const x=lerp(2400,-200,clamp(u));const y=330+Math.sin(t*3)*14;let s=`<g transform="translate(${f1(x)},${f1(y)})"><ellipse cx="0" cy="0" rx="120" ry="40" fill="#07080c"/><rect x="-170" y="-8" width="90" height="14" fill="#07080c"/><rect x="-10" y="-56" width="20" height="18" fill="#07080c"/><ellipse cx="0" cy="-60" rx="${(150*Math.abs(Math.cos(t*38))+30).toFixed(0)}" ry="5" fill="#0a0b10" fill-opacity=".6"/><circle cx="70" cy="8" r="9" fill="#e8f3ff"/></g>`;
 const bx=1250+Math.sin(t*1.6)*170,by=1560;s=`<polygon points="${f1(x+70)},${f1(y+8)} ${f1(bx-300)},${by} ${f1(bx+300)},${by}" fill="url(#beamCone2)" fill-opacity=".55"/>`+s;return s}
// ---------- STREET
export function street(t,Dm,cx,cy,q){const L=lightsAt(t,Dm);let s=sky(t,Dm);
 // ground
 s+=`<polygon points="-3500,${HY} 6000,${HY} 6000,2800 -3500,2800" fill="url(#roadG)"/>`;
 // sidewalks
 for(const sd of[-1,1]){const xa=sd*7.2,xb=sd*9;s+=poly([P(xa,0.12,.5),P(xb,.12,.5),P(xb,.12,200),P(xa,.12,200)],'#3b3f48')+poly([P(xa,0,.5),P(xa,.12,.5),P(xa,.12,200),P(xa,0,200)],'#25282e')}
 // lane dashes
 for(let k=0;k<40;k++){const z=((k*5-(Dm%5)))+2;if(z<.6||z>190)continue;s+=poly([P(-.12,.02,z),P(.12,.02,z),P(.12,.02,z+2),P(-.12,.02,z+2)],'#c9c27a','fill-opacity=".7"')}
 // puddles reflecting fire
 for(let k=0;k<7;k++){const z=((k*23+9)-Dm%161);const zz=((z%161)+161)%161+2;const c=P(-3+((k*5)%7),0,zz),kk=F/zz;s+=`<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(1.6*kk)}" ry="${f1(.3*kk)}" fill="#ff7a2a" fill-opacity=".22"/><ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(1.2*kk)}" ry="${f1(.18*kk)}" fill="#ffd38a" fill-opacity=".18"/>`}
 // build list of depth-sorted items
 const items=[];
 for(let n=0;n<22;n++){const z=n*14+3-Dm;const zz=((z%308)+308)%308+1.2;items.push({z:zz,f:()=>building(-1,zz,zz+13,6+rn(n)*10,16+rn(n+3)*34,n,t,L,Dm)});items.push({z:zz+1,f:()=>building(1,zz+1,zz+14,6+rn(n+9)*10,16+rn(n+5)*34,n+40,t,L,Dm)})}
 const cars=[[1,6,'#7a2230',0],[-1.2,18,'#2a4a7a',1],[2.8,30,'#4a4a52',0],[-2.4,41,'#a0a0a8',0],[1.0,55,'#7a5a22',0],[-1,72,'#222',0]];
 cars.forEach(([x,z0,col,dead],i)=>{const zz=z0-Dm;if(zz>.6&&zz<150)items.push({z:zz,f:()=>car(x,zz,col,L,t,{dead:false,tail:i%2,fire:i===1})})});
 for(let k=0;k<12;k++){const z=k*18+6-Dm;const zz=((z%216)+216)%216+1;const broken=rn(k*3+Math.floor(Dm/216))<.35;items.push({z:zz,f:()=>lamp(-8,zz,t,L,broken,k)});items.push({z:zz+.1,f:()=>lamp(8,zz+9,t,L,rn(k+5)<.4,k+20)})}
 const zb=34-Dm;if(zb>.6)items.push({z:zb,f:()=>bus(zb,L,t,0,-1)});
 const zb2=62-Dm;if(zb2>.6){const crushed=t>EV.gstep+.25?clamp((t-EV.gstep-.25)/.35):0;items.push({z:zb2,f:()=>bus(zb2,L,t,crushed,1)})}
 const zm=50-Dm;if(zm>.6)items.push({z:zm,f:()=>metroEntrance(zm,t,L)});
 const zd=16-Dm;if(zd>.5)items.push({z:zd,f:()=>drain(-1.6,zd,t,L)});
 const zh=12-Dm;if(zh>.5)items.push({z:zh,f:()=>hydrant(6.4,zh,t,L,true)});
 // barricade + loudspeaker truck far away
 const zt=75-Dm;if(zt>.6)items.push({z:zt,f:()=>barricade(zt,L,t)});
 items.sort((a,b)=>b.z-a.z);for(const it of items)s+=it.f();
 // creatures from the drain, then chasing alongside
 if(t>EV.drain){const u=t-EV.drain;for(let i=0;i<16;i++){const a=u-i*.16;if(a<0)continue;const zr=16-clamp(a*2.4,0,9)-Dm;if(zr<.7)continue;const x=-1.6+Math.sin(i*2.1)*3.2*clamp(a/2.5),c=P(x,.15,zr),k=F/zr;s+=creatureSmall(c[0],c[1],k*.011,t*24+i)}
  if(t>EV.run+.3){const f=clamp((t-EV.run-.3)/1.5);for(let i=0;i<9;i++){const zr=1.3+rn(i)*2.6,x=(i%2?1:-1)*(1.5+rn(i+4)*1.8)+Math.sin(t*7+i)*.25,c=P(x,.1,zr),k=F/zr;s+=creatureSmall(c[0]+(1-f)*(i%2?900:-900),c[1],k*.011,t*28+i*2)}}}
 // giant foot
 if(t>EV.gstep-1.4)s+=giantFoot(t,Dm);
 s+=heli(t);return s}
function barricade(z,L,t){let s='';const ph=Math.sin(t*9)>0;for(let i=-3;i<=3;i++)s+=box(i*2-.8,i*2+.8,0,1.1,z,z+.6,'#c8c8c8',L);
 s+=box(-3,3,.0,2.4,z+2,z+9,'#3a4a32',L);s+=box(-2.2,2.2,2.4,3.0,z+3,z+8,'#2a3a22',L);
 for(let i=0;i<7;i++){const c=P(-5+i*1.7,1.0,z-.4),k=F/z;s+=`<rect x="${f1(c[0]-.2*k)}" y="${f1(c[1]-1.7*k)}" width="${f1(.4*k)}" height="${f1(1.7*k)}" rx="${f1(.15*k)}" fill="#0a0d0a"/><circle cx="${f1(c[0])}" cy="${f1(c[1]-1.9*k)}" r="${f1(.22*k)}" fill="#0a0d0a"/>`}
 const l=P(0,3.2,z+3),k=F/(z+3);s+=`<circle cx="${f1(l[0]-.8*k)}" cy="${f1(l[1])}" r="${f1(.35*k)}" fill="${ph?'#ff3a2a':'#400'}"/><circle cx="${f1(l[0]+.8*k)}" cy="${f1(l[1])}" r="${f1(.35*k)}" fill="${ph?'#400':'#2a6aff'}"/><circle cx="${f1(l[0])}" cy="${f1(l[1])}" r="${f1(5*k)}" fill="url(#${ph?'redG':'blueG'})" fill-opacity=".4"/>`;
 s+=`<rect x="${f1(l[0]-1.4*k)}" y="${f1(l[1]-.8*k)}" width="${f1(2.8*k)}" height="${f1(.5*k)}" fill="#1a1d22"/>`;return s}
function creatureSmall(x,y,sc,ph){let l='';for(let i=0;i<4;i++)for(const s of[-1,1]){const a=ph*.5+i+(s>0?0:Math.PI);const up=Math.max(0,Math.sin(a))*14;l+=`<path d="M${s*20},${i*6-6} L${s*(50+i*4)},${i*8-26-up} L${s*(80+i*4)},${i*8+8-up*.4}" stroke="#241820" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`}
 return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc.toFixed(3)})">${l}<ellipse cx="0" cy="0" rx="38" ry="22" fill="#120d11" stroke="#3c2631" stroke-width="3"/><circle cx="-11" cy="-3" r="5" fill="#ff5a7a"/><circle cx="11" cy="-3" r="5" fill="#ff5a7a"/></g>`}
function giantFoot(t,Dm){const u=clamp((t-(EV.gstep-1.4))/1.4);const x=5.3,zz=62-Dm+5;const top=P(x,60*(1-u*u),zz),bot=P(x,0,zz),k=F/zz;const wd=3.2*k;let s=`<polygon points="${f1(top[0]-wd)},${f1(top[1]-900)} ${f1(top[0]+wd)},${f1(top[1]-900)} ${f1(bot[0]+wd*1.4)},${f1(bot[1]-(1-u)*0)} ${f1(bot[0]-wd*1.4)},${f1(bot[1])}" fill="#07050a" fill-opacity=".92"/>`;
 s+=`<ellipse cx="${f1(bot[0])}" cy="${f1(bot[1])}" rx="${f1(wd*3)}" ry="${f1(wd*.5)}" fill="#000" fill-opacity="${(.5*u).toFixed(2)}"/>`;
 if(t>EV.gstep){const d=clamp((t-EV.gstep)/2.5);s+=`<ellipse cx="${f1(bot[0])}" cy="${f1(bot[1]-60)}" rx="${f1(wd*3*(.5+d))}" ry="${f1(wd*1.2*(.5+d))}" fill="url(#dustG)" fill-opacity="${(.8*(1-d*.6)).toFixed(2)}"/>`}return s}
export const defsScene=`<defs>
<linearGradient id="skyG" gradientUnits="userSpaceOnUse" x1="0" y1="-1200" x2="0" y2="760"><stop offset="0" stop-color="#0a0608"/><stop offset=".55" stop-color="#2a0f10"/><stop offset="1" stop-color="#8a3414"/></linearGradient>
<linearGradient id="roadG" gradientUnits="userSpaceOnUse" x1="0" y1="760" x2="0" y2="1700"><stop offset="0" stop-color="#2a2226"/><stop offset=".4" stop-color="#1a1618"/><stop offset="1" stop-color="#0c0b0d"/></linearGradient>
<radialGradient id="fireG"><stop offset="0" stop-color="#ff9a3a" stop-opacity=".95"/><stop offset=".45" stop-color="#ff5a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="warmG"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>
<radialGradient id="redG"><stop offset="0" stop-color="#ff2a1a" stop-opacity=".9"/><stop offset="1" stop-color="#ff2a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="blueG"><stop offset="0" stop-color="#3a7aff" stop-opacity=".9"/><stop offset="1" stop-color="#3a7aff" stop-opacity="0"/></radialGradient>
<radialGradient id="dustG"><stop offset="0" stop-color="#cdbfae" stop-opacity=".8"/><stop offset="1" stop-color="#cdbfae" stop-opacity="0"/></radialGradient>
<linearGradient id="beamCone2" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f9ff" stop-opacity=".7"/><stop offset="1" stop-color="#f4f9ff" stop-opacity=".05"/></linearGradient>
<linearGradient id="beamCone" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f9ff" stop-opacity=".55"/><stop offset="1" stop-color="#f4f9ff" stop-opacity=".05"/></linearGradient>
<linearGradient id="floorG" gradientUnits="userSpaceOnUse" x1="0" y1="760" x2="0" y2="1800"><stop offset="0" stop-color="#2a2d34"/><stop offset="1" stop-color="#101216"/></linearGradient>
</defs>`;
export function dust(t,q){let s='';const n=50+Math.round(q*50);for(let i=0;i<n;i++){const x=-300+rn(i)*3200,y=((rn(i+5)*2400+t*(40+rn(i+2)*90+q*260))%2400)-300;s+=`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(2+rn(i+8)*4).toFixed(1)}" height="${(2+rn(i+8)*4).toFixed(1)}" fill="${rn(i+3)<.3?'#ff9a4a':'#cbbfae'}" fill-opacity="${(.15+rn(i+4)*.3).toFixed(2)}"/>`}return s}
export function creature(x,y,sc,ph,rot=0,squash=0){return creatureSmall(x,y,sc*2.2,ph)}
