// Chapter 4 scenes: subway platform + train (pseudo-3D objects), tunnel, giant-foot crush, soldiers
import {clamp,sm,lerp,P,F,VX,HY,HC,flame} from '../ep3/scene.mjs';
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const f=n=>(+n).toFixed(1);
const pt=a=>f(a[0])+','+f(a[1]);
const Q=(pts,fill,ex='')=>`<polygon points="${pts.map(pt).join(' ')}" fill="${fill}" ${ex}/>`;
const mix=(c,k)=>{const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);const h=v=>Math.max(0,Math.min(255,Math.round(v*k))).toString(16).padStart(2,'0');return '#'+h(r)+h(g)+h(b)};
const flk=(t,i)=>{const h=Math.sin(t*23+i*7.1)*Math.sin(t*9.3+i*2.7)+Math.sin(t*61+i)*.3;return h>-.15?1:.25};
const bz=z=>clamp(1.15-z/48,.14,1);
const Zlim=.5;
const xs=(X,Y,Z)=>P(X,Y,Math.max(Z,Zlim));
export const defs4=`<defs>
<linearGradient id="trainG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9ced6"/><stop offset=".5" stop-color="#9aa2ac"/><stop offset="1" stop-color="#5a616b"/></linearGradient>
<radialGradient id="lampG"><stop offset="0" stop-color="#fff7da" stop-opacity=".95"/><stop offset=".4" stop-color="#ffe9b0" stop-opacity=".35"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient>
<radialGradient id="whiteG"><stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset=".3" stop-color="#e8f4ff" stop-opacity=".6"/><stop offset="1" stop-color="#e8f4ff" stop-opacity="0"/></radialGradient>
<radialGradient id="sparkG"><stop offset="0" stop-color="#ffe9a8" stop-opacity="1"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
</defs>`;
function creatureS(x,y,sc,ph,hang=0){let l='';for(let i=0;i<4;i++)for(const s of[-1,1]){const a=ph*.5+i+(s>0?0:Math.PI);const up=Math.max(0,Math.sin(a))*14;l+=`<path d="M${s*20},${i*6-6} L${s*(50+i*4)},${i*8-26-up} L${s*(80+i*4)},${i*8+8-up*.4}" stroke="#241820" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`}
 return `<g transform="translate(${f(x)},${f(y)}) scale(${sc.toFixed(3)}) rotate(${hang?180:0})">${l}<ellipse cx="0" cy="0" rx="38" ry="22" fill="#120d11" stroke="#3c2631" stroke-width="3"/><circle cx="-11" cy="-3" r="5" fill="#ff5a7a"/><circle cx="11" cy="-3" r="5" fill="#ff5a7a"/></g>`}
// ---- a train car side face (x plane) with windows/doors; z0..z1
function carSide(X,z0,z1,t,o){let s='';const a=Math.max(z0,Zlim),b=Math.max(z1,Zlim);if(b<=Zlim)return'';
 const k=bz((a+b)/2);const body=mix('#a8b0ba',k);
 s+=Q([xs(X,-.9,z0),xs(X,3.3,z0),xs(X,3.3,z1),xs(X,-.9,z1)],body);
 s+=Q([xs(X,-.9,z0),xs(X,.15,z0),xs(X,.15,z1),xs(X,-.9,z1)],mix('#3a4048',k));
 s+=Q([xs(X,2.7,z0),xs(X,3.3,z0),xs(X,3.3,z1),xs(X,2.7,z1)],mix('#c8302a',k)); // red band
 const nSeg=Math.floor((z1-z0)/3.6);
 for(let i=0;i<nSeg;i++){const za=z0+.4+i*3.6;const isDoor=i%2===0;const zb=za+(isDoor?1.7:3.0);if(zb<Zlim)continue;
  const fl=flk(t,Math.floor(za)+o.seed);const lit=o.litBase*fl;
  if(isDoor){const u=o.doorsU||0;const gap=1.7*u;const zc=za+.85;
   // door opening (dark interior with light)
   s+=Q([xs(X,.15,zc-gap/2),xs(X,2.55,zc-gap/2),xs(X,2.55,zc+gap/2),xs(X,.15,zc+gap/2)],mix('#8fb8a0',lit*.8+.2),`fill-opacity="${(.55+.35*lit).toFixed(2)}"`);
   if(gap>.1){const mid=xs(X,1.4,zc),kk=F/Math.max(zc,Zlim);s+=`<ellipse cx="${f(mid[0])}" cy="${f(mid[1])}" rx="${f(gap*.5*kk)}" ry="${f(1.0*kk)}" fill="url(#lampG)" fill-opacity="${(.5*lit).toFixed(2)}"/>`;
    // seats seen through the door
    s+=Q([xs(X,.3,zc-gap/2),xs(X,.9,zc-gap/2),xs(X,.9,zc+gap/2),xs(X,.3,zc+gap/2)],'#142225','fill-opacity=".7"')}
   // door leaves
   const lw=(1.7-gap)/2;if(lw>.02){for(const sd of[-1,1]){const c0=sd<0?za:zb-lw;s+=Q([xs(X,.15,c0),xs(X,2.55,c0),xs(X,2.55,c0+lw),xs(X,.15,c0+lw)],mix('#7a838e',k),`stroke="#1a1d22" stroke-width="2"`)}}
   else s+=Q([xs(X,.15,za),xs(X,2.55,za),xs(X,2.55,za+.06),xs(X,.15,za+.06)],'#0a0c0e')}
  else{ // window
   s+=Q([xs(X,1.0,za),xs(X,2.4,za),xs(X,2.4,zb),xs(X,1.0,zb)],mix('#9fd2b8',lit*.9+.12),`stroke="#1a1d22" stroke-width="2"`);
   // interior: seat backs + light + figure
   s+=Q([xs(X,1.0,za),xs(X,1.5,za),xs(X,1.5,zb),xs(X,1.0,zb)],'#14262a','fill-opacity=".75"');
   if(o.passenger&&Math.abs(za-o.passZ)<1.6){const c=xs(X,1.6,za+1.4),kk=F/Math.max(za+1.4,Zlim);s+=`<ellipse cx="${f(c[0])}" cy="${f(c[1]+.55*kk)}" rx="${f(.42*kk)}" ry="${f(.6*kk)}" fill="#0b1316"/><circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(.28*kk)}" fill="#0f181b"/><circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(.28*kk)}" fill="none" stroke="#2a3a3a" stroke-width="1.5"/>`}
   // handprints smear
   if(rn(i+o.seed)<.3)s+=`<path d="M${f(xs(X,1.6,za+.8)[0])},${f(xs(X,1.6,za+.8)[1])} q4,20 -2,40" stroke="#6a0f12" stroke-width="${f(5*F/Math.max(za,Zlim)/F*60)}" fill="none" stroke-opacity=".7"/>`;
   if(o.creat>0&&rn(i*7+o.seed)<.55){const c=xs(X,2.25,za+1.5),kk=F/Math.max(za+1.5,Zlim);s+=creatureS(c[0],c[1],kk*.008,o.t*20+i,1)}}}
 // roof edge highlight
 s+=Q([xs(X,3.3,z0),xs(X,3.4,z0),xs(X,3.4,z1),xs(X,3.3,z1)],'#fff','fill-opacity=".25"');return s}
function trainNose(X0,X1,z,t,o){if(z<Zlim)z=Zlim;const k=bz(z);let s=Q([xs(X0,-.9,z),xs(X1,-.9,z),xs(X1,3.3,z),xs(X0,3.3,z)],mix('#b8c0ca',1));
 const a=xs(X0+.3,1.4,z),b=xs(X1-.3,2.7,z);s+=`<rect x="${f(a[0])}" y="${f(b[1])}" width="${f(b[0]-a[0])}" height="${f(a[1]-b[1])}" fill="#11171c" stroke="#05070a" stroke-width="3"/>`;
 for(const hx of[X0+.55,X1-.55]){const c=xs(hx,.2,z),kk=F/z;s+=`<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(.22*kk)}" fill="#fff"/><circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(2.8*kk)}" fill="url(#whiteG)" fill-opacity="${(o.lampA||1)*.9}"/>`}
 const c2=xs((X0+X1)/2,2.9,z),kk=F/z;s+=`<rect x="${f(c2[0]-.5*kk)}" y="${f(c2[1]-.1*kk)}" width="${f(1*kk)}" height="${f(.2*kk)}" fill="#ffcf5a"/>`;return s}
// ---- STATION
export function station(t,o){// o:{Zf,doorsU,passenger,creat,drops,blackout}
 let s=`<rect x="-3500" y="-3000" width="9000" height="5200" fill="#04070a"/>`;
 const Z1=90,XL=-12,XR=11,YC=5.2;
 // far end + tunnel mouth
 s+=Q([P(XL,0,Z1),P(XR,0,Z1),P(XR,YC,Z1),P(XL,YC,Z1)],'#0a1114');
 s+=`<ellipse cx="${f(P(7.5,.6,Z1)[0])}" cy="${f(P(7.5,.6,Z1)[1])}" rx="${f(4.2*F/Z1)}" ry="${f(2.3*F/Z1)}" fill="#010203"/>`;
 // ceiling
 s+=Q([P(XL,YC,Zlim),P(XR,YC,Zlim),P(XR,YC,Z1),P(XL,YC,Z1)],'#0c1215');
 for(let z=3;z<Z1;z+=6){const fl=flk(t,z)*(o.blackout?0:1);const a=xs(-6,YC-.05,z),b=xs(2,YC-.05,z),c=xs(2,YC-.05,z+.5),d=xs(-6,YC-.05,z+.5);s+=Q([a,b,c,d],fl>.5?'#f4f1dc':'#3a4044');if(fl>.5){const m=xs(-2,YC,z+.2),kk=F/z;s+=`<ellipse cx="${f(m[0])}" cy="${f(m[1])}" rx="${f(5*kk)}" ry="${f(1.2*kk)}" fill="url(#lampG)" fill-opacity="${(.5*bz(z)).toFixed(2)}"/>`}}
 // left wall: tiles, posters, signs
 for(let z=Zlim;z<Z1;z+=3){const k=bz(z);const tone=(Math.floor(z/3)%2)?'#2c3f3d':'#27393a';s+=Q([xs(XL,0,z),xs(XL,YC,z),xs(XL,YC,z+3),xs(XL,0,z+3)],mix(tone,k*1.2));s+=Q([xs(XL,0,z),xs(XL,YC,z),xs(XL,YC,z+.05),xs(XL,0,z+.05)],'#000','fill-opacity=".45"')}
 for(const [z,c,tx] of [[8,'#c8302a','VIAJA SEGURO'],[20,'#2a6ac8','CIUDAD 24H'],[34,'#c8a02a','PROHIBIDO FUMAR'],[50,'#2a8a5a','LÍNEA 8']]){const p=[xs(XL,1.2,z),xs(XL,3.6,z),xs(XL,3.6,z+3),xs(XL,1.2,z+3)];s+=Q(p,mix(c,bz(z)*1.1));const m=xs(XL,2.4,z+1.5);s+=`<text x="${f(m[0])}" y="${f(m[1])}" font-family="Inter" font-weight="900" font-size="${f(.42*F/(z+1.5))}" fill="#fff" fill-opacity=".8" text-anchor="middle">${tx}</text>`}
 // station sign on the wall
 {const m=xs(XL,4.3,14+1.5);s+=Q([xs(XL,3.9,14),xs(XL,4.7,14),xs(XL,4.7,17),xs(XL,3.9,17)],'#0b3a8a');s+=`<text x="${f(m[0])}" y="${f(m[1])}" font-family="Inter" font-weight="900" font-size="${f(.5*F/15.5)}" fill="#fff" text-anchor="middle">ESTACIÓN CENTRAL</text>`}
 // benches
 for(const z of[12,26,42]){const k=bz(z);s+=Q([xs(-11.4,0,z),xs(-11.4,.5,z),xs(-11.4,.5,z+3),xs(-11.4,0,z+3)],mix('#4a3a2a',k))+Q([xs(-11.4,.5,z),xs(-10.4,.5,z),xs(-10.4,.5,z+3),xs(-11.4,.5,z+3)],mix('#6a5238',k))}
 // floor (tiles) + tactile edge
 s+=Q([xs(XL,0,Zlim),xs(3.2,0,Zlim),xs(3.2,0,Z1),xs(XL,0,Z1)],'url(#floorL2)');
 for(let z=1;z<Z1;z+=1.5){const k=bz(z);s+=Q([xs(XL,0,z),xs(3.2,0,z),xs(3.2,0,z+.04),xs(XL,0,z+.04)],'#000',`fill-opacity="${(.28*k).toFixed(2)}"`)}
 for(let x=-11;x<3.2;x+=2.2)s+=Q([xs(x,0,Zlim),xs(x+.04,0,Zlim),xs(x+.04,0,Z1),xs(x,0,Z1)],'#000','fill-opacity=".2"');
 s+=Q([xs(3.0,0,Zlim),xs(4,0,Zlim),xs(4,0,Z1),xs(3.0,0,Z1)],'#c8a82a','fill-opacity=".85"');
 for(let z=2;z<Z1;z+=6){const fl=flk(t,z);if(fl>.5){const c=xs(-2,0,z+1);const kk=F/(z+1);s+=`<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(3*kk)}" ry="${f(.35*kk)}" fill="#fff6d8" fill-opacity="${(.16*bz(z)).toFixed(2)}"/>`}}
 // track pit + rails
 s+=Q([xs(4,-1.1,Zlim),xs(XR,-1.1,Zlim),xs(XR,-1.1,Z1),xs(4,-1.1,Z1)],'#0a0d10');
 s+=Q([xs(4,0,Zlim),xs(4,-1.1,Zlim),xs(4,-1.1,Z1),xs(4,0,Z1)],'#1a2024');
 for(let z=1;z<Z1;z+=1.2)s+=Q([xs(4.4,-1.05,z),xs(7.6,-1.05,z),xs(7.6,-1.05,z+.3),xs(4.4,-1.05,z+.3)],'#1b1612','fill-opacity=".9"');
 for(const x of[5.0,6.4]){s+=Q([xs(x-.05,-1.0,Zlim),xs(x+.05,-1.0,Zlim),xs(x+.05,-1.0,Z1),xs(x-.05,-1.0,Z1)],'#9aa4ae','fill-opacity=".7"')}
 // columns
 for(let z=Z1-4;z>Zlim;z-=9){const k=bz(z);const x0=-3.4,x1=-2.8;
  s+=Q([xs(x1,0,z),xs(x1,YC,z),xs(x1,YC,z+.6),xs(x1,0,z+.6)],mix('#4a5a58',k))+Q([xs(x0,0,z),xs(x1,0,z),xs(x1,YC,z),xs(x0,YC,z)],mix('#3a4846',k*.9)),s+=''}
 // train
 const Zf=o.Zf;const X=4.45;const cars=3,L=18;
 for(let c=cars-1;c>=0;c--){const z0=Zf+c*(L+.6);s+=carSide(X,z0,z0+L,t,{doorsU:o.doorsU,litBase:o.lit??1,seed:c*13,passenger:c===0&&o.passenger,passZ:Zf+8.2,creat:o.creat,t})}
 s+=trainNose(X,X+3.2,Zf,t,{lampA:o.lampA??1});
 // brake sparks while arriving
 if(o.braking){for(let i=0;i<14;i++){const u=(t*3+i/14)%1;const c=xs(4.6,-.8,Zf+i*.3+2);const kk=F/Math.max(Zf+2,Zlim);s+=`<circle cx="${f(c[0]+u*140)}" cy="${f(c[1]-u*60+u*u*90)}" r="${f(3+4*(1-u))}" fill="#ffd38a" fill-opacity="${(.9*(1-u)).toFixed(2)}"/>`}}
 // creatures dropping onto the platform
 if(o.drops>0){for(let i=0;i<11;i++){const a=o.drops*3-i*.22;if(a<0)continue;const z=Math.max(.9,Zf+4-a*3.5),x=2.2-Math.sin(i*2.3)*3.6*clamp(a/2),c=P(x,0,z),kk=F/z;s+=creatureS(c[0],c[1],kk*.011,t*24+i)}}
 // dust/fog
 s+=`<rect x="-3500" y="${HY-120}" width="9000" height="320" fill="#9fb4b0" fill-opacity=".05"/>`;
 return s}
export const defsFloor=`<defs><linearGradient id="floorL2" gradientUnits="userSpaceOnUse" x1="0" y1="760" x2="0" y2="1800"><stop offset="0" stop-color="#2a3a38"/><stop offset=".5" stop-color="#3a4a46"/><stop offset="1" stop-color="#1a2422"/></linearGradient></defs>`;
// ---- TUNNEL (walking on the ledge next to a parked train car)
export function tunnel2(t,Dm,o){// o:{crush:0..1 (squash), foot:0..1, blackout, doorOpen, soldiers}
 let s=`<rect x="-3500" y="-3000" width="9000" height="5200" fill="#020406"/>`;
 const XL=-2.4,XR=7.8,YC=4.6,Z1=70;
 s+=`<ellipse cx="${VX}" cy="${HY}" rx="${f(8*F/Z1)}" ry="${f(5*F/Z1)}" fill="#0b1014"/>`;
 for(let k=0;k<26;k++){const z0=k*3-(Dm%3)+.5,z1=z0+3;if(z0>Z1)continue;if(z1<Zlim)continue;const bk=bz(z0);const lit=flk(t,k+Math.floor(Dm/3))*(o.blackout?.2:1);
  s+=Q([xs(XL,0,z0),xs(XL,YC,z0),xs(XL,YC,z1),xs(XL,0,z1)],mix('#243234',bk*1.1))+Q([xs(XR,0,z0),xs(XR,YC,z0),xs(XR,YC,z1),xs(XR,0,z1)],mix('#202c2e',bk))+Q([xs(XL,YC,z0),xs(XR,YC,z0),xs(XR,YC,z1),xs(XL,YC,z1)],mix('#10181b',bk))+Q([xs(XL,0,z0),xs(XR,0,z0),xs(XR,0,z1),xs(XL,0,z1)],mix(k%2?'#1a1f20':'#20282a',bk));
  s+=Q([xs(XL,0,z0),xs(XL,YC,z0),xs(XL,YC,z0+.15),xs(XL,0,z0+.15)],'#000','fill-opacity=".55"');
  if(k%2===0){const m=xs(XL+.3,3.6,z0+.8),kk=F/Math.max(z0+.8,Zlim);s+=`<rect x="${f(m[0]-.15*kk)}" y="${f(m[1]-.25*kk)}" width="${f(.3*kk)}" height="${f(.5*kk)}" fill="${lit>.5?'#ffe9b0':'#3a3a30'}"/>`;if(lit>.5)s+=`<circle cx="${f(m[0])}" cy="${f(m[1])}" r="${f(2.4*kk)}" fill="url(#lampG)" fill-opacity="${(.5*bk).toFixed(2)}"/>`}}
 // rails + sleepers + third rail
 for(let z=((-(Dm%1.2))+1.2);z<Z1;z+=1.2)s+=Q([xs(-1.3,.01,z),xs(1.3,.01,z),xs(1.3,.01,z+.3),xs(-1.3,.01,z+.3)],'#15110d','fill-opacity=".9"')+Q([xs(3.3,.01,z),xs(6.2,.01,z),xs(6.2,.01,z+.3),xs(3.3,.01,z+.3)],'#15110d','fill-opacity=".9"');
 for(const x of[-.75,0,.75,4.0,5.6])s+=Q([xs(x-.05,.1,Zlim),xs(x+.05,.1,Zlim),xs(x+.05,.1,Z1),xs(x-.05,.1,Z1)],x===0?'#ff8a2a':'#a9b3bc','fill-opacity=".75"');
 // sparks on the third rail
 if(Math.sin(t*7)>.55){const z=4+Math.sin(t)*2;const c=xs(0,.15,z),kk=F/z;s+=`<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(.5*kk)}" fill="url(#sparkG)"/>`}
 // parked train car on the right track
 const Zc=20-Dm,cl=17;const sq=o.crush||0;
 if(Zc+cl>Zlim){const X=3.3;const hgt=3.3-sq*2.1;let car='';const zz0=Zc,zz1=Zc+cl;
  const body=Q([xs(X,.1,zz0),xs(X,hgt,zz0),xs(X,hgt-sq*.3,zz1),xs(X,.1,zz1)],'#b4bcc6');
  car+=body+Q([xs(X,hgt-.6,zz0),xs(X,hgt,zz0),xs(X,hgt-sq*.3,zz1),xs(X,hgt-.6-sq*.3,zz1)],'#b8302a');
  for(let i=0;i<4;i++){const za=zz0+.8+i*4;const w=Q([xs(X,Math.min(1.0,hgt-.3),za),xs(X,Math.min(2.4,hgt-.5),za),xs(X,Math.min(2.4,hgt-.5),za+2.6),xs(X,Math.min(1.0,hgt-.3),za+2.6)],'#5a8a78','fill-opacity=".9"');car+=w}
  // crushed look: bent roof + debris
  if(sq>0){car+=Q([xs(X-.3,hgt+.4,zz0+3),xs(X+1.2,hgt+.6,zz0+4),xs(X+1.4,hgt-.4,zz0+9),xs(X-.4,hgt-.2,zz0+8)],'#59606a','stroke="#1a1d22" stroke-width="3"');
   for(let i=0;i<10;i++){const c=xs(X+(rn(i)-.5)*2,hgt+rn(i+3)*1.4,zz0+3+rn(i+5)*7),kk=F/Math.max(zz0+5,Zlim);car+=`<polygon points="${f(c[0])},${f(c[1])} ${f(c[0]+.5*kk*rn(i+7))},${f(c[1]+.15*kk)} ${f(c[0]+.2*kk)},${f(c[1]+.6*kk*rn(i+2))}" fill="#3a3f46"/>`}
   for(let i=0;i<16;i++){const u=((t*2+i/16)%1);const c=xs(X,hgt,zz0+5);car+=`<circle cx="${f(c[0]+(rn(i)-.5)*400*u)}" cy="${f(c[1]-120*u+u*u*300)}" r="${f(4+5*(1-u))}" fill="#ffd38a" fill-opacity="${((.9*(1-u))*Math.min(1,sq*3)).toFixed(2)}"/>`}}
  s+=car;
  // second parked car further
  }
 // giant foot through the ceiling
 if(o.foot>0){const u=o.foot;const z=Zc+7,xx=4.6;const top=xs(xx,YC+8,z),bot=xs(xx,.1+(1-u)*7,z),kk=F/Math.max(z,Zlim);const wd=2.6*kk;
  s+=`<polygon points="${f(top[0]-wd*.7)},${f(top[1]-900)} ${f(top[0]+wd*.7)},${f(top[1]-900)} ${f(bot[0]+wd*1.05)},${f(bot[1])} ${f(bot[0]-wd*1.05)},${f(bot[1])}" fill="#08060a" fill-opacity=".95"/>`;
  s+=`<path d="M${f(bot[0]-wd*1.05)},${f(bot[1])} q${f(wd*1.05)},${f(-wd*.5)} ${f(wd*2.1)},0" fill="#241820"/>`;
  // ceiling hole + falling chunks
  for(let i=0;i<14;i++){const c=xs(xx+(rn(i)-.5)*5,YC-(((t*3)+rn(i+4))%1)*YC,z+(rn(i+8)-.5)*4),k2=F/Math.max(z,Zlim);s+=`<polygon points="${f(c[0])},${f(c[1])} ${f(c[0]+.4*k2)},${f(c[1]+.1*k2)} ${f(c[0]+.15*k2)},${f(c[1]+.5*k2)}" fill="#59606a"/>`}
  if(o.foot>=1){const d=clamp(o.dust||0);const gl=Math.max(0,1-d*2.2);s+=`<circle cx="${f(bot[0])}" cy="${f(bot[1]-60)}" r="${f(wd*4)}" fill="url(#sparkG)" fill-opacity="${(.8*gl).toFixed(2)}"/>`;s+=`<ellipse cx="${f(bot[0])}" cy="${f(bot[1]-40)}" rx="${f(wd*3.5*(.5+d))}" ry="${f(wd*1.4*(.5+d))}" fill="url(#dustG)" fill-opacity="${(.85*(1-d*.5)).toFixed(2)}"/>`}}
 // maintenance door on the left wall
 {const zd=26-Dm;if(zd+2.4>Zlim){const u=o.doorOpen||0;const a=xs(XL,0,zd),b=xs(XL,2.4,zd),c=xs(XL,2.4,zd+2.4),d=xs(XL,0,zd+2.4);
  s+=Q([xs(XL+.01,-.0,zd-.15),xs(XL+.01,2.55,zd-.15),xs(XL+.01,2.55,zd+2.55),xs(XL+.01,0,zd+2.55)],'#1a1d20');
  s+=Q([a,b,c,d],u>0?'#f4f9ff':'#4a5a66');
  if(u<1){const lw=2.4*(1-u*.9);s+=Q([xs(XL,0,zd),xs(XL,2.4,zd),xs(XL,2.4,zd+lw),xs(XL,0,zd+lw)],'#4a5a66','stroke="#0a0c0e" stroke-width="3"');
   for(let i=0;i<5;i++){const z=zd+i*.5;s+=Q([xs(XL,.0,z),xs(XL,.35,z),xs(XL,.35,z+.25),xs(XL,0,z+.25)],i%2?'#d8b82a':'#111')}
   const m=xs(XL,1.5,zd+1.2);s+=`<text x="${f(m[0])}" y="${f(m[1])}" font-family="Inter" font-weight="900" font-size="${f(.3*F/Math.max(zd+1.2,Zlim))}" fill="#e8e8e8" text-anchor="middle">MANTENIMIENTO</text>`}
  const l=xs(XL,2.9,zd+1.2),kk=F/Math.max(zd+1.2,Zlim);s+=`<circle cx="${f(l[0])}" cy="${f(l[1])}" r="${f(.18*kk)}" fill="${u>0?'#fff':'#3dff7a'}"/><circle cx="${f(l[0])}" cy="${f(l[1])}" r="${f(1.6*kk)}" fill="url(#${u>0?'whiteG':'grnG2'})" fill-opacity=".5"/>`;
  if(u>0){s+=`<polygon points="${f(a[0])},${f(a[1])} ${f(d[0])},${f(d[1])} ${f(P(0,0,6)[0]+600)},1900 ${f(P(0,0,6)[0]-1400)},1900" fill="#f4f9ff" fill-opacity="${(.28*u).toFixed(2)}"/>`;
   // soldiers (silhouettes with rifles) in the doorway
   for(let i=0;i<4;i++){const z=zd+.3+i*.55,c=xs(XL+.4,0,z),kk2=F/Math.max(z,Zlim);const sx=c[0],sy=c[1];s+=`<g fill="#05070a"><rect x="${f(sx-.28*kk2)}" y="${f(sy-1.7*kk2)}" width="${f(.56*kk2)}" height="${f(1.2*kk2)}" rx="${f(.1*kk2)}"/><rect x="${f(sx-.2*kk2)}" y="${f(sy-1.5*kk2)}" width="${f(.4*kk2)}" height="${f(1.5*kk2)}"/><circle cx="${f(sx)}" cy="${f(sy-1.95*kk2)}" r="${f(.24*kk2)}"/><rect x="${f(sx-.9*kk2)}" y="${f(sy-1.25*kk2)}" width="${f(1.1*kk2)}" height="${f(.1*kk2)}"/></g><line x1="${f(sx-.9*kk2)}" y1="${f(sy-1.2*kk2)}" x2="${f(VX)}" y2="${f(1200)}" stroke="#ff2a2a" stroke-width="2" stroke-opacity=".55"/>`}}}}
 return s}
export const defsG2=`<defs><radialGradient id="grnG2"><stop offset="0" stop-color="#3dff7a" stop-opacity=".8"/><stop offset="1" stop-color="#3dff7a" stop-opacity="0"/></radialGradient><radialGradient id="dustG"><stop offset="0" stop-color="#cdbfae" stop-opacity=".8"/><stop offset="1" stop-color="#cdbfae" stop-opacity="0"/></radialGradient></defs>`;
