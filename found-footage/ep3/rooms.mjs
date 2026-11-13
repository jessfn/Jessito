// Detailed interior scenes: stairwell, lobby, subway tunnel. World coords: floor y=1510.
import {clamp,sm,lerp,P,F,VX,HY,HC} from './scene.mjs';
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const f=n=>(+n).toFixed(1);
const FL=1510;
export const DX=1700,DY=1000;
const flick=(t,i)=>{const h=Math.sin(t*23+i*7.1)*Math.sin(t*9.3+i*2.7)+Math.sin(t*61+i)*.3;return h>-.15?1:.2};
export const defsRooms=`<defs>
<linearGradient id="wallS" gradientUnits="userSpaceOnUse" x1="0" y1="-600" x2="0" y2="1510"><stop offset="0" stop-color="#14171c"/><stop offset=".45" stop-color="#262b34"/><stop offset="1" stop-color="#1b1f26"/></linearGradient>
<linearGradient id="floorS" gradientUnits="userSpaceOnUse" x1="0" y1="1510" x2="0" y2="2100"><stop offset="0" stop-color="#2a2d33"/><stop offset="1" stop-color="#0a0b0d"/></linearGradient>
<linearGradient id="wallL" gradientUnits="userSpaceOnUse" x1="0" y1="-600" x2="0" y2="1510"><stop offset="0" stop-color="#2a2622"/><stop offset=".5" stop-color="#4a4238"/><stop offset="1" stop-color="#3a342c"/></linearGradient>
<linearGradient id="floorL" gradientUnits="userSpaceOnUse" x1="0" y1="1510" x2="0" y2="2200"><stop offset="0" stop-color="#4a4640"/><stop offset="1" stop-color="#14120f"/></linearGradient>
<radialGradient id="redGl"><stop offset="0" stop-color="#ff2a1a" stop-opacity=".85"/><stop offset=".5" stop-color="#ff2a1a" stop-opacity=".25"/><stop offset="1" stop-color="#ff2a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="warmGl"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".9"/><stop offset=".5" stop-color="#ffb060" stop-opacity=".3"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
<radialGradient id="grnGl"><stop offset="0" stop-color="#3dff7a" stop-opacity=".8"/><stop offset="1" stop-color="#3dff7a" stop-opacity="0"/></radialGradient>
<radialGradient id="outGl"><stop offset="0" stop-color="#ffb060" stop-opacity=".95"/><stop offset=".6" stop-color="#ff6a20" stop-opacity=".5"/><stop offset="1" stop-color="#ff4a10" stop-opacity="0"/></radialGradient>
<linearGradient id="shaftG" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".5"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
<linearGradient id="redShaft" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3a2a" stop-opacity=".45"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></linearGradient>
<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b4048"/><stop offset=".5" stop-color="#555b64"/><stop offset="1" stop-color="#2c3036"/></linearGradient>
<linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a4a" stop-opacity=".55"/><stop offset=".5" stop-color="#ffd09a" stop-opacity=".25"/><stop offset="1" stop-color="#ff6a2a" stop-opacity=".5"/></linearGradient>
</defs>`;
const rect=(x,y,w,h,fill,ex='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${ex}/>`;
const txt=(x,y,s,size,fill,ex='')=>`<text x="${f(x)}" y="${f(y)}" font-family="Inter" font-weight="900" font-size="${size}" fill="${fill}" text-anchor="middle" ${ex}>${s}</text>`;
function spark(t,x,y,seed){const k=Math.floor(t*6+seed);if(rn(k+seed*7)<.72)return'';let s='';const r=i=>rn(k*13+i+seed);for(let i=0;i<7;i++){const a=r(i)*6.28,l=20+r(i+9)*70;s+=`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x+Math.cos(a)*l)}" y2="${f(y+Math.sin(a)*l+30)}" stroke="#ffe9a8" stroke-width="3"/>`}return s+`<circle cx="${f(x)}" cy="${f(y)}" r="110" fill="url(#warmGl)" fill-opacity=".7"/>`}
// ---------------- STAIRWELL ----------------
export function stairs(t,o){// o:{dx,dy,lift,rod:{F:[x,y],H:[x,y],tip:[x,y]},door:0..1,beamOn}
 const dx=o.dx||0,dy=o.dy||0;let s='';
 s+=rect(-1500,-1500,9000,1500+FL,'url(#wallS)');
 s+=`<g transform="translate(${f(-dx)},${f(-dy)})">`;
 // concrete panels + seams + stains (in the moving group, repeated so there is always wall)
 for(let k=-4;k<18;k++){const x=k*430;s+=rect(x,-1500,5,4000,'#090b0e','fill-opacity=".75"')+rect(x+5,-1500,3,4000,'#3d444f','fill-opacity=".3"')}
 for(let k=-3;k<22;k++){const x=k*430+rn(k)*260;s+=`<ellipse cx="${f(x)}" cy="${f(300+rn(k+3)*900)}" rx="${f(60+rn(k+7)*90)}" ry="${f(140+rn(k+9)*260)}" fill="#0a0d12" fill-opacity="${(.22+rn(k)*.2).toFixed(2)}"/>`}
 for(let k=0;k<26;k++){const x=k*470+200;let d=`M${x},${-200+rn(k)*400}`;let cx=x,cy=-200+rn(k)*400;for(let j=0;j<7;j++){cx+=(rn(k*9+j)-.5)*60;cy+=90+rn(k*3+j)*90;d+=` L${f(cx)},${f(cy)}`}s+=`<path d="${d}" stroke="#07090c" stroke-width="4" fill="none" stroke-opacity=".85"/>`}
 // pipes + cable tray
 for(const [y,h,c] of [[110,56,'#4a4036'],[200,36,'#33383f']]){s+=rect(-1500,y,9000,h,c)+rect(-1500,y,9000,h*.28,'#fff','fill-opacity=".1"')+rect(-1500,y+h*.78,9000,h*.22,'#000','fill-opacity=".35"');for(let k=-3;k<20;k++)s+=rect(k*390+rn(k)*60,y-8,22,h+16,'#1b1d21')}
 s+=rect(-1500,270,9000,22,'#1d2024')+rect(-1500,292,9000,6,'#000','fill-opacity=".5"');
 for(let k=0;k<22;k++)s+=rect(k*410+130,270,10,70,'#15171a');
 // diagonal handrail scroll (reads as descending flight)
 if(dx>0){for(let k=-6;k<14;k++){const x=k*400;s+=`<line x1="${x}" y1="${f(1050+x*.59)}" x2="${x+900}" y2="${f(1050+(x+900)*.59)}" stroke="#09090c" stroke-width="16" stroke-opacity=".8"/><line x1="${x}" y1="${f(1040+x*.59)}" x2="${x+900}" y2="${f(1040+(x+900)*.59)}" stroke="#7a828c" stroke-width="5" stroke-opacity=".5"/>`}}
 // PISO 2 plate
 s+=rect(520,470,430,260,'#22262c','stroke="#0a0b0d" stroke-width="8"')+rect(536,486,398,228,'#d8c24a')+txt(735,610,'PISO',70,'#1a1608')+txt(735,700,'2',100,'#1a1608')+`<path d="M600,520 L700,520 L700,500 L760,540 L700,580 L700,560 L600,560Z" fill="#1a1608" transform="translate(120,-6)"/>`;
 // PISO 1 plate + landing door (arrives at dx=DX)
 const DXo=DX;const ox=DXo;
 s+=rect(ox+1150,470,430,260,'#22262c','stroke="#0a0b0d" stroke-width="8"')+rect(ox+1166,486,398,228,'#d8c24a')+txt(ox+1365,610,'PISO',70,'#1a1608')+txt(ox+1365,700,'1',100,'#1a1608');
 s+=txt(ox+1365,800,'VESTÍBULO',44,'#1a1608','letter-spacing="6"');
 s+=stairDoor(t,ox+1850,o.door||0);
 s+=`</g>`;
 // emergency lights (screen-fixed in world, flicker) - they belong to the moving wall too
 return s}
function stairDoor(t,x0,u){const w=600,top=160,h=FL-top;let s='';
 s+=rect(x0-40,top-40,w+80,h+40,'#15171b')+rect(x0-40,top-40,w+80,40,'#0a0b0d');
 // warm spill behind the door
 s+=rect(x0,top,w,h,'#ffd9a0','fill-opacity="'+(.15+.85*u).toFixed(2)+'"')+(u>0?`<ellipse cx="${x0+w*.8}" cy="${FL-200}" rx="${w*1.1}" ry="${h*.7}" fill="url(#warmGl)" fill-opacity="${(u*.9).toFixed(2)}"/>`:'');
 // leaf swings away: width shrinks toward hinge (left)
 const lw=w*Math.cos(u*1.25);if(lw>8){const sh=.18*u;s+=`<polygon points="${x0},${top} ${f(x0+lw)},${f(top+sh*h*.12)} ${f(x0+lw)},${f(FL-sh*h*.08)} ${x0},${FL}" fill="url(#steel)"/>`;
  s+=`<polygon points="${x0},${top} ${f(x0+lw)},${f(top+sh*h*.12)} ${f(x0+lw)},${f(top+sh*h*.12+14)} ${x0},${top+14}" fill="#fff" fill-opacity=".12"/>`;
  s+=`<rect x="${f(x0+lw*.12)}" y="${top+230}" width="${f(lw*.76)}" height="280" rx="14" fill="#0b0e13" stroke="#0a0a0c" stroke-width="10"/><rect x="${f(x0+lw*.15)}" y="${top+250}" width="${f(lw*.7)}" height="240" fill="#ffd9a0" fill-opacity="${(.35+.4*u).toFixed(2)}"/>`;
  s+=`<rect x="${f(x0+lw*.1)}" y="${top+720}" width="${f(lw*.8)}" height="26" rx="10" fill="#8a9099" stroke="#0a0a0c" stroke-width="5"/>`;
  s+=txt(x0+lw*.5,top+120,'VESTÍBULO',Math.max(8,52*Math.cos(u*1.25)),'#e9eef5','letter-spacing="4"')}
 s+=rect(x0+w/2-170,top-150,340,90,'#0a1a0e','stroke="#050806" stroke-width="6"')+txt(x0+w/2,top-85,'SALIDA',58,'#59ff8f')+`<circle cx="${x0+w/2}" cy="${top-105}" r="330" fill="url(#grnGl)" fill-opacity=".4"/>`;
 return s}
// stairwell static foreground (floor, slab, lever, emergency light) - floor never moves
export function stairsFloor(t,o){let s='';
 s+=rect(-1500,FL,9000,900,'url(#floorS)')+rect(-1500,FL,9000,10,'#000','fill-opacity=".6"')+rect(-1500,FL-90,9000,90,'#14171c','fill-opacity=".9"')+rect(-1500,FL-92,9000,6,'#4a515c','fill-opacity=".45"');
 for(let k=-3;k<16;k++)s+=rect(k*420+60,FL+10,3,600,'#000','fill-opacity=".5"');
 for(let k=0;k<30;k++){const x=rn(k)*4500-300;s+=`<polygon points="${f(x)},${FL+30+rn(k+3)*160} ${f(x+30+rn(k+2)*60)},${FL+10+rn(k+3)*160} ${f(x+80+rn(k+4)*60)},${FL+40+rn(k+3)*160} ${f(x+20)},${FL+60+rn(k+3)*160}" fill="#2a2e35" fill-opacity=".9"/>`}
 // red glow pool on the floor
 const fl=flick(t,1);
 s+=`<ellipse cx="1300" cy="${FL+30}" rx="900" ry="120" fill="url(#redGl)" fill-opacity="${(.28*fl).toFixed(2)}"/>`;
 return s}
export function stairsLight(t,o){let s='';const fl=flick(t,2);
 // emergency fixture
 s+=`<g transform="translate(1300,330)">${rect(-90,-26,180,52,'#15171a','')+rect(-70,-16,140,32,fl>.5?'#ff3a2a':'#4a1410','')}</g>`;
 s+=`<polygon points="1240,356 1360,356 1900,${FL} 700,${FL}" fill="url(#redShaft)" fill-opacity="${(.5*fl).toFixed(2)}"/>`;
 s+=`<circle cx="1300" cy="330" r="420" fill="url(#redGl)" fill-opacity="${(.7*fl).toFixed(2)}"/>`;
 // second dead fixture + sparking conduit
 s+=rect(2300,300,160,44,'#15171a')+spark(t,500,330,3)+spark(t,2100,300,5);
 return s}
// slab + lever; o.lift = left end lift in px; rod tip/handle computed by caller
export function slab(t,o){const L=o.lift||0;const px=1660,py=FL;let s='';
 // rubble block (fulcrum)
 s+=`<polygon points="1130,${FL} 1170,${FL-170} 1290,${FL-190} 1340,${FL-60} 1320,${FL}" fill="#3a3f48" stroke="#08090c" stroke-width="6"/><polygon points="1170,${FL-170} 1290,${FL-190} 1270,${FL-150} 1190,${FL-140}" fill="#6a717c"/>`;
 // slab pivoting about its right end
 const ang=-Math.asin(clamp(L/300,0,.6))*180/Math.PI;
 s+=`<g transform="rotate(${ang.toFixed(2)} ${px} ${py})"><polygon points="1380,${FL-6} 1420,${FL-120} 1700,${FL-150} 1760,${FL-60} 1740,${FL}" fill="#5a606a" stroke="#08090c" stroke-width="7"/><polygon points="1420,${FL-120} 1700,${FL-150} 1690,${FL-126} 1436,${FL-98}" fill="#9aa2ae" fill-opacity=".6"/><polygon points="1380,${FL-6} 1740,${FL} 1740,${FL-14} 1390,${FL-26}" fill="#000" fill-opacity=".45"/><path d="M1470,${FL-100} L1530,${FL-60} L1600,${FL-100} M1640,${FL-140} L1660,${FL-70}" stroke="#14161a" stroke-width="3" fill="none"/><path d="M1380,${FL-40} L1300,${FL-100} M1760,${FL-80} L1830,${FL-150} M1420,${FL-120} L1360,${FL-190}" stroke="#6b4a3a" stroke-width="7" stroke-linecap="round"/></g>`;
 // shadow under slab
 s+=`<ellipse cx="1560" cy="${FL+14}" rx="${230+L}" ry="16" fill="#000" fill-opacity=".6"/>`;
 // extinguisher lever (red cylinder) from handle H through F to tip
 const R=o.rod;if(R){const [hx,hy]=R.H,[tx,ty]=R.tip;const a=Math.atan2(ty-hy,tx-hx)*180/Math.PI,len=Math.hypot(tx-hx,ty-hy);
  s+=`<g transform="translate(${f(hx)},${f(hy)}) rotate(${a.toFixed(2)})"><rect x="0" y="-26" width="${f(len)}" height="52" rx="22" fill="#b01c18" stroke="#2a0705" stroke-width="5"/><rect x="0" y="-26" width="${f(len)}" height="14" rx="7" fill="#ff7a6a" fill-opacity=".5"/><rect x="${f(len*.18)}" y="-26" width="40" height="52" fill="#15171a"/><rect x="${f(len*.55)}" y="-18" width="70" height="36" fill="#e8e2d0" fill-opacity=".9"/><text x="${f(len*.55+35)}" y="7" font-family="Inter" font-weight="900" font-size="18" fill="#222" text-anchor="middle">CO2</text><rect x="-34" y="-14" width="40" height="28" rx="6" fill="#15171a"/></g>`}
 // dust puffs when lifting
 if(t>14.2&&t<18){const u=(t-14.2)/3.8;for(let i=0;i<9;i++){const px2=1400+i*55+rn(i)*30,py2=FL-30-u*200*rn(i+2)-rn(i+5)*60;s+=`<circle cx="${f(px2)}" cy="${f(py2)}" r="${f(30+u*70*rn(i))}" fill="#cdbfae" fill-opacity="${(.5*(1-u)).toFixed(2)}"/>`}}
 return s}
// ---------------- LOBBY ----------------
export function lobby(t,o){// o:{keysOn,keyT, chain:{fall,open}, doorsU, scratch}
 let s='';const ce=flick(t,4);
 s+=rect(-1500,-1500,9000,1500+FL,'url(#wallL)');
 // wainscot + panels
 s+=rect(-1500,FL-420,9000,420,'#2b241d')+rect(-1500,FL-424,9000,10,'#6a5a46')+rect(-1500,FL-430,9000,6,'#000','fill-opacity=".4"');
 for(let k=-3;k<20;k++){const x=k*300;s+=rect(x,FL-390,260,330,'#352c23','stroke="#1b1611" stroke-width="5"')+rect(x+14,FL-376,232,6,'#fff','fill-opacity=".07"')}
 for(let k=-3;k<18;k++)s+=rect(k*410,-1500,4,2900,'#000','fill-opacity=".28"');
 // ceiling soffit + tube lights
 s+=rect(-1500,-60,9000,140,'#171412')+rect(-1500,80,9000,8,'#000','fill-opacity=".5"');
 for(const [x,i] of [[360,0],[1250,1],[2150,2]]){const on=i===1?(flick(t,9)):1;const dead=i===2;s+=rect(x-170,60,340,26,'#2a2824')+rect(x-150,68,300,14,dead?'#2a2a26':(on>.5?'#fff2d0':'#5a5648'))+(dead?'':`<polygon points="${x-150},86 ${x+150},86 ${x+420},${FL} ${x-420},${FL}" fill="url(#shaftG)" fill-opacity="${(on*.4).toFixed(2)}"/><ellipse cx="${x}" cy="${FL-6}" rx="380" ry="50" fill="url(#warmGl)" fill-opacity="${(on*.4).toFixed(2)}"/>`)}
 // stair door (left)
 s+=stairDoorLobby(t,o);
 // mailboxes
 s+=rect(720,520,420,620,'#4a4f57','stroke="#0a0b0d" stroke-width="8"');
 for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=744+c*80,y=548+r*96;const open=(r*5+c)%11===4;s+=rect(x,y,68,82,open?'#14171b':'#6a707a','stroke="#0a0b0d" stroke-width="4"')+(open?'':rect(x+6,y+6,56,8,'#fff','fill-opacity=".18"')+`<text x="${x+34}" y="${y+60}" font-family="Inter" font-weight="800" font-size="22" fill="#14161a" text-anchor="middle">${r*5+c+1}</text>`)}
 s+=txt(930,490,'BUZONES',34,'#c9c0aa','letter-spacing="6"');
 // key board (behind desk)
 s+=rect(1300,430,330,420,'#3a2c1c','stroke="#0a0805" stroke-width="10"')+rect(1316,446,298,388,'#5a4428');
 s+=txt(1465,500,'LLAVES',40,'#e8d9b0','letter-spacing="8"');
 for(let r=0;r<2;r++)for(let c=0;c<4;c++){const n=r*4+c+1;const hx=1352+c*76,hy=560+r*140;const taken=(n===3&&o.keysOn!==true);s+=`<circle cx="${hx}" cy="${hy}" r="7" fill="#0a0805"/>`+txt(hx,hy+112,n,34,'#14100a');if(!taken){s+=keyRing(hx,hy,n===3,t)}}
 if(o.keysOn===true){} 
 // desk (back part) - lamp, monitor, intercom
 s+=`<ellipse cx="1465" cy="${FL+4}" rx="360" ry="22" fill="#000" fill-opacity=".6"/>`;
 return {back:s}}
function keyRing(x,y,hi,t){let s='';const g=hi?`<circle cx="${x}" cy="${y+22}" r="52" fill="url(#warmGl)" fill-opacity="${(.5+.3*Math.sin(t*5)).toFixed(2)}"/>`:'';return g+`<circle cx="${x}" cy="${y+22}" r="16" fill="none" stroke="#c9ccd2" stroke-width="5"/><rect x="${x-6}" y="${y+40}" width="12" height="50" rx="4" fill="${hi?'#e8c24a':'#a9adb4'}" stroke="#0a0a0c" stroke-width="3"/><rect x="${x+6}" y="${y+70}" width="12" height="9" fill="${hi?'#e8c24a':'#a9adb4'}"/><rect x="${x-36}" y="${y+84}" width="72" height="32" rx="6" fill="${hi?'#b8281f':'#2a5a8a'}" stroke="#0a0a0c" stroke-width="3"/>`+(hi?`<text x="${x}" y="${y+108}" font-family="Inter" font-weight="900" font-size="26" fill="#fff" text-anchor="middle">3</text>`:'')}
export function keyRingLoose(x,y,t,ang=0){return `<g transform="translate(${f(x)},${f(y)}) rotate(${ang})"><circle cx="0" cy="0" r="26" fill="none" stroke="#d6d9df" stroke-width="7"/><circle cx="0" cy="0" r="26" fill="url(#warmGl)" fill-opacity=".35"/><g transform="rotate(-18)"><rect x="-8" y="22" width="16" height="74" rx="5" fill="#e8c24a" stroke="#0a0a0c" stroke-width="3"/><rect x="8" y="64" width="18" height="12" fill="#e8c24a" stroke="#0a0a0c" stroke-width="2"/><rect x="8" y="82" width="14" height="10" fill="#e8c24a"/></g><g transform="rotate(26)"><rect x="-8" y="22" width="16" height="62" rx="5" fill="#a9adb4" stroke="#0a0a0c" stroke-width="3"/></g><rect x="-34" y="92" width="68" height="34" rx="6" fill="#b8281f" stroke="#0a0a0c" stroke-width="3" transform="rotate(8)"/><text x="2" y="118" font-family="Inter" font-weight="900" font-size="26" fill="#fff" text-anchor="middle" transform="rotate(8)">3</text></g>`}
export function lobbyDesk(t,o){let s='';
 // desk front (in front of Lucía when she stands behind)
 s+=rect(1210,FL-470,510,470,'#3a2a1a','stroke="#0a0805" stroke-width="8"')+rect(1196,FL-500,538,40,'#6a4c2c','stroke="#0a0805" stroke-width="6"')+rect(1196,FL-500,538,10,'#fff','fill-opacity=".14"');
 for(let k=0;k<3;k++)s+=rect(1240+k*160,FL-420,140,330,'#4a3624','stroke="#0a0805" stroke-width="5"')+rect(1296+k*160,FL-270,28,10,'#c9b27a');
 s+=rect(1210,FL-30,510,30,'#000','fill-opacity=".45"');
 // things on the desk: lamp, monitor (static), radio, bell
 s+=`<g transform="translate(1260,${FL-500})"><rect x="-4" y="-100" width="8" height="100" fill="#15171a"/><path d="M-4,-100 L60,-130 L60,-96Z" fill="#2a2c30"/><circle cx="60" cy="-96" r="140" fill="url(#warmGl)" fill-opacity="${(.55*flick(t,11)).toFixed(2)}"/></g>`;
 s+=`<g transform="translate(1500,${FL-500})">${rect(-90,-190,180,130,'#15171a','stroke="#050506" stroke-width="6"')}${rect(-80,-180,160,110,'#8fbfa8','fill-opacity="'+(.35+.3*Math.sin(t*40)).toFixed(2)+'"')}${rect(-12,-60,24,50,'#15171a')}${rect(-50,-14,100,14,'#15171a')}</g>`;
 s+=`<g transform="translate(1650,${FL-500})">${rect(-40,-34,80,34,'#2a2c30','stroke="#0a0a0c" stroke-width="4"')}<circle cx="-18" cy="-17" r="6" fill="#ff3a2a"/>${rect(-4,-60,8,26,'#15171a')}</g>`;
 s+=txt(1465,FL-440,'PORTERÍA',34,'#c9b27a','letter-spacing="8"');
 return s}
function stairDoorLobby(t,o){const x0=60,w=600,top=160,h=FL-top;let s='';const th=o.scratch||0;const shake=th>0?Math.sin(t*60)*4*th:0;
 s+=rect(x0-40,top-40,w+80,h+40,'#15110e')+rect(x0-40,top-40,w+80,40,'#0a0806');
 // under-door red light from the stairwell
 s+=`<g transform="translate(${f(shake)},0)">`+rect(x0,top,w,h,'url(#steel)')+rect(x0,top,w,14,'#fff','fill-opacity=".12"')+rect(x0+60,top+230,w-120,280,'#0b0e13','stroke="#0a0a0c" stroke-width="10"')+rect(x0+80,top+250,w-160,240,'#8a1a14','fill-opacity="'+(.28+.2*flick(t,7)).toFixed(2)+'"')+rect(x0+60,top+720,w-120,26,'#8a9099','stroke="#0a0a0c" stroke-width="5"');
 s+=txt(x0+w/2,top+120,'ESCALERAS',52,'#e9eef5','letter-spacing="4"');
 // dents from the other side
 const d1=clamp((th-.0)*1.2,0,1),d2=clamp((th-.55)*2.5,0,1);
 if(d1>0)s+=`<ellipse cx="${x0+w*.55}" cy="${top+560}" rx="${f(70*d1)}" ry="${f(90*d1)}" fill="#000" fill-opacity=".35"/><ellipse cx="${x0+w*.5}" cy="${top+540}" rx="${f(50*d1)}" ry="${f(70*d1)}" fill="#fff" fill-opacity=".08"/>`;
 if(d2>0)s+=`<ellipse cx="${x0+w*.4}" cy="${top+400}" rx="${f(110*d2)}" ry="${f(150*d2)}" fill="#000" fill-opacity=".4"/><path d="M${x0+w*.4},${top+330} l30,60 l-26,40 l34,70" stroke="#0a0a0c" stroke-width="6" fill="none"/>`;
 s+=`</g>`;
 if(th>0){for(let i=0;i<10;i++){const u=(t*1.3+rn(i))%1;s+=`<circle cx="${f(x0+rn(i+4)*w)}" cy="${f(top+40+u*(h-80))}" r="${f(5+rn(i)*8)}" fill="#cdbfae" fill-opacity="${(.5*(1-u)).toFixed(2)}"/>`}}
 return s}
// glass entry doors (chained). o.doorsU opening 0..1 ; o.pad open 0..1 ; o.chainFall 0..1
export function entryDoors(t,o){const x0=1900,w=800,top=160,h=FL-top;let s='';const u=o.doorsU||0;
 // outside glow + silhouettes
 s+=rect(x0-60,top-60,w+120,h+60,'#0d0b0a')+rect(x0,top,w,h,'#2a0e06');
 s+=`<ellipse cx="${x0+w/2}" cy="${top+h*.65}" rx="${w*.8}" ry="${h*.6}" fill="url(#outGl)"/>`;
 for(let k=0;k<5;k++){const bx=x0+30+k*150,bh=380+rn(k)*520;s+=rect(bx,FL-bh-120,120,bh,'#0a0605','fill-opacity=".85"')}
 const ph=Math.sin(t*9)>0;s+=`<rect x="${x0}" y="${top}" width="${w}" height="${h}" fill="${ph?'#ff2a1a':'#2a6aff'}" fill-opacity="${(.12+.08*Math.sin(t*18)).toFixed(2)}"/>`;
 for(let i=0;i<14;i++){const a=(t*40+i*53)%260;s+=`<circle cx="${f(x0+rn(i)*w)}" cy="${f(FL-120-a*4)}" r="${f(3+rn(i+2)*5)}" fill="#ffb060" fill-opacity="${(.8*(1-a/260)).toFixed(2)}"/>`}
 // door leaves (swing outward = shrink to hinge sides)
 const lw=(w/2)*Math.cos(u*1.35);
 for(const side of[-1,1]){const hinge=side<0?x0:x0+w;const xl=side<0?hinge:hinge-lw;const ww=lw;if(ww<6)continue;
  s+=rect(xl,top,ww,h,'#1a1d22','fill-opacity=".92"')+rect(xl+14,top+14,ww-28,h-28,'url(#glassG)')+rect(xl,top,ww,10,'#6a717c')+rect(xl,top+h*.46,ww,22,'#3a3f46')+rect(xl+(side<0?ww-40:12),top+h*.46-120,26,300,'#9aa2ae','stroke="#0a0a0c" stroke-width="4"');
  // reflections
  s+=`<polygon points="${f(xl+30)},${top+40} ${f(xl+110)},${top+40} ${f(xl+30)},${top+520}" fill="#fff" fill-opacity=".1"/>`}
 s+=rect(x0+w/2-14,top,28,h,'#0a0b0d');
 // chain through the two handles + padlock, slack drooping
 const hy=top+h*.46+10,hx1=x0+w/2-34,hx2=x0+w/2+34;const fall=o.chainFall||0;
 if(fall<1){const sag=40+60*fall+Math.sin(t*3)*(o.chainShake||0)*6;let pts=[];for(let i=0;i<=14;i++){const k=i/14;pts.push([hx1-60+k*(hx2-hx1+120),hy+Math.sin(k*Math.PI)*sag+fall*fall*900*(0.5+0.5*Math.sin(k*3.1))])}
  const d=pts.map((p,i)=>(i?'L':'M')+f(p[0])+','+f(p[1])).join(' ');s+=`<path d="${d}" stroke="#0a0a0c" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#8a9099" stroke-width="13" stroke-dasharray="20 9" fill="none"/><path d="${d}" stroke="#d6dae2" stroke-width="4" stroke-dasharray="20 9" fill="none" stroke-opacity=".6"/>`;
  // padlock
  const px=(hx1+hx2)/2,py=hy+sag*.9+6;const op=o.pad||0;s+=`<g transform="translate(${f(px)},${f(py)}) rotate(${(fall*40).toFixed(1)})"><path d="M-22,-8 L-22,${-42-op*16} a22,22 0 0 1 44,0 L22,${-8-op*20}" stroke="#c9ccd2" stroke-width="10" fill="none" transform="translate(${op*22},0)"/><rect x="-36" y="-10" width="72" height="62" rx="10" fill="#c9a23a" stroke="#0a0a0c" stroke-width="6"/><rect x="-36" y="-10" width="72" height="16" rx="8" fill="#fff" fill-opacity=".28"/><circle cx="0" cy="22" r="8" fill="#0a0a0c"/></g>`}
 else{// chain on the floor
  let d='M'+(x0+w/2-300)+','+(FL-10);for(let i=1;i<10;i++)d+=` L${f(x0+w/2-300+i*60)},${f(FL-8+Math.sin(i*2.3)*10)}`;s+=`<path d="${d}" stroke="#0a0a0c" stroke-width="20" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#8a9099" stroke-width="11" stroke-dasharray="18 9" fill="none"/><rect x="${x0+w/2+60}" y="${FL-44}" width="60" height="44" rx="8" fill="#c9a23a" stroke="#0a0a0c" stroke-width="5"/>`}
 // light from outside onto the floor
 s+=`<polygon points="${x0},${FL-6} ${x0+w},${FL-6} ${x0+w+500},${FL+260} ${x0-500},${FL+260}" fill="#ff8a3a" fill-opacity="${(.22+.12*Math.sin(t*7)+.28*u).toFixed(2)}"/>`;
 s+=txt(x0+w/2,top-90,'SALIDA',60,'#e8e8e8','letter-spacing="10"');
 return s}
export function lobbyFloor(t,o){let s=rect(-1500,FL,9000,900,'url(#floorL)')+rect(-1500,FL,9000,8,'#000','fill-opacity=".6"');
 for(let k=-4;k<22;k++){s+=`<polygon points="${k*300},${FL} ${k*300+6},${FL} ${k*300+(k-6)*60},2300 ${k*300+(k-6)*60-8},2300" fill="#000" fill-opacity=".3"/>`}
 for(let r=0;r<5;r++){const y=FL+30+r*r*34;s+=rect(-1500,y,9000,3,'#000','fill-opacity=".3"')}
 // reflections of the tube lights + fire glow
 s+=`<ellipse cx="1250" cy="${FL+70}" rx="300" ry="26" fill="#fff2d0" fill-opacity="${(.22*flick(t,9)).toFixed(2)}"/><ellipse cx="360" cy="${FL+70}" rx="260" ry="22" fill="#fff2d0" fill-opacity=".18"/>`;
 return s}
// ---------------- SUBWAY TUNNEL ----------------
export function tunnel(t,Dm,o){let s='';
 s+=rect(-3500,-3000,9000,6000,'#05070a');
 const quad=(pts,fill,ex='')=>`<polygon points="${pts.map(p=>f(p[0])+','+f(p[1])).join(' ')}" fill="${fill}" ${ex}/>`;
 const W=4.5,Ht=4.2;
 for(let k=0;k<30;k++){const z0=((k*3)-(Dm%3))+.5;if(z0<.45||z0>90)continue;const z1=z0+3;const lit=(k+Math.floor(Dm/3))%3!==0;const c=lit?'#1f3a3a':'#0f1e22';
  s+=quad([P(-W,0,z0),P(-W,Ht,z0),P(-W,Ht,z1),P(-W,0,z1)],c)+quad([P(W,0,z0),P(W,Ht,z0),P(W,Ht,z1),P(W,0,z1)],c)+quad([P(-W,Ht,z0),P(W,Ht,z0),P(W,Ht,z1),P(-W,Ht,z1)],'#0b1416')+quad([P(-W,0,z0),P(W,0,z0),P(W,0,z1),P(-W,0,z1)],(k%2?'#1b2326':'#222c30'));
  s+=quad([P(-W,0,z0),P(-W,Ht,z0),P(-W,Ht,z0+.08),P(-W,0,z0+.08)],'#000','fill-opacity=".6"')+quad([P(W,0,z0),P(W,Ht,z0),P(W,Ht,z0+.08),P(W,0,z0+.08)],'#000','fill-opacity=".6"');
  if(lit){const a=P(0,Ht-.1,z0+1.5),kk=F/(z0+1.5);s+=`<rect x="${f(a[0]-.9*kk)}" y="${f(a[1])}" width="${f(1.8*kk)}" height="${f(.1*kk)}" fill="#cfeff0" fill-opacity="${(.5+.4*flick(t,k)).toFixed(2)}"/><ellipse cx="${f(a[0])}" cy="${f(a[1]+.3*kk)}" rx="${f(3.5*kk)}" ry="${f(1.2*kk)}" fill="#7fe0e0" fill-opacity=".2"/>`}
 }
 // far end: two amber lights approaching
 const u=clamp((t-o.t0)/(o.t1-o.t0));const zz=lerp(80,9,u*u);const k=F/zz;const c=P(0,1.7,zz);
 s+=`<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(9*k)}" fill="url(#warmGl)" fill-opacity=".8"/>`;
 for(const sx of[-1,1])s+=`<ellipse cx="${f(c[0]+sx*.9*k)}" cy="${f(c[1])}" rx="${f(.42*k)}" ry="${f(.3*k)}" fill="#fff0a0"/><ellipse cx="${f(c[0]+sx*.9*k)}" cy="${f(c[1])}" rx="${f(1.4*k)}" ry="${f(1.0*k)}" fill="url(#warmGl)" fill-opacity=".8"/>`;
 // rails + sleepers
 for(let k2=0;k2<40;k2++){const z=((k2*2)-(Dm%2))+1;if(z<.5||z>80)continue;s+=quad([P(-1.7,.02,z),P(1.7,.02,z),P(1.7,.02,z+.4),P(-1.7,.02,z+.4)],'#0a0c0e','fill-opacity=".8"')}
 for(const sx of[-.75,.75])s+=quad([P(sx-.06,.08,.45),P(sx+.06,.08,.45),P(sx+.06,.08,80),P(sx-.06,.08,80)],'#8a949c','fill-opacity=".7"');
 return s}
