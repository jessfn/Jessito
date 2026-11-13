// Chapter 7 scenes: aerial chase, helicopter cabin, flyover landmarks, rooftop II, glass facade, service tunnel + door, dead city.
import {sky,skyline,heli,roofBack,roof,FLOOR} from '../ep6/scene6.mjs';
import {head,chaser,colossus,defsMonster} from '../ep6/monster.mjs';
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const f=n=>(+n).toFixed(1);const FL=1510;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};const lerp=(a,b,t)=>a+(b-a)*t;
const rect=(x,y,w,h,fill,ex='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${ex}/>`;
const txt=(x,y,s,size,fill,ex='')=>`<text x="${f(x)}" y="${f(y)}" font-family="Inter" font-weight="900" font-size="${size}" fill="${fill}" text-anchor="middle" ${ex}>${s}</text>`;
const flick=(t,i)=>{const h=Math.sin(t*23+i*7.1)*Math.sin(t*9.3+i*2.7)+Math.sin(t*61+i)*.3;return h>-.15?1:.35};
export const defs7=`<defs>
<linearGradient id="cabW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3224"/><stop offset=".6" stop-color="#1c2218"/><stop offset="1" stop-color="#0c0f0a"/></linearGradient>
<linearGradient id="glassD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a2a3a"/><stop offset=".5" stop-color="#0c1620"/><stop offset="1" stop-color="#162434"/></linearGradient>
<linearGradient id="tunW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14181c"/><stop offset=".5" stop-color="#262c32"/><stop offset="1" stop-color="#101316"/></linearGradient>
<linearGradient id="ashSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a3e"/><stop offset=".6" stop-color="#6a5a52"/><stop offset="1" stop-color="#a8826a"/></linearGradient>
<radialGradient id="orangeG7"><stop offset="0" stop-color="#ffb04a" stop-opacity=".95"/><stop offset=".5" stop-color="#ff5a1a" stop-opacity=".4"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="redG7"><stop offset="0" stop-color="#ff2a1a" stop-opacity=".9"/><stop offset="1" stop-color="#ff2a1a" stop-opacity="0"/></radialGradient>
</defs>`;
// ---------------- A) aerial chase exterior
export function aerial(t,o){let s=sky(t,0)+skyline(t,o.scroll||t*420);
 // fast streaks of smoke / embers rushing past
 for(let i=0;i<26;i++){const x=((rn(i)*4200-(t*1600*(.4+rn(i+3)))%4800)+4800)%4800-500,y=rn(i+7)*1500-200;s+=`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(140+rn(i)*220)}" ry="${f(6+rn(i+2)*10)}" fill="#cfd6df" fill-opacity="${(.05+.08*rn(i+4)).toFixed(2)}"/>`}
 return s}
// ---------------- B) helicopter cabin interior (with an outside layer drawn by the caller behind it)
export function cabin(t,o){let s='';const vib=Math.sin(t*38)*1.2;
 // wall with two openings: side door (right) and windshield (left); even-odd cut-out so the outside layer shows through
 const door=[2150,160,3150,1380],ws=[120,260,1050,1050];
 s+=`<path fill-rule="evenodd" fill="url(#cabW)" d="M-600,-300 H3800 V1700 H-600Z M${door[0]},${door[1]} H${door[2]} V${door[3]} H${door[0]}Z M${ws[0]},${ws[1]} H${ws[2]} V${ws[3]} H${ws[0]}Z"/>`;
 // frame edges + rivets + ribs
 s+=`<rect x="${door[0]-26}" y="${door[1]-26}" width="${door[2]-door[0]+52}" height="${door[3]-door[1]+52}" fill="none" stroke="#0a0c08" stroke-width="30"/><rect x="${ws[0]-20}" y="${ws[1]-20}" width="${ws[2]-ws[0]+40}" height="${ws[3]-ws[1]+40}" fill="none" stroke="#0a0c08" stroke-width="26"/>`;
 for(let i=0;i<14;i++)s+=rect(-500+i*320,-300,12,2000,'#06080a','fill-opacity=".5"')+`<circle cx="${-494+i*320}" cy="140" r="6" fill="#4a5a3a"/><circle cx="${-494+i*320}" cy="900" r="6" fill="#4a5a3a"/>`;
 s+=rect(-600,1380,4400,330,'#0e120c')+rect(-600,1380,4400,12,'#4a5a3a','fill-opacity=".5"');
 // floor grating + cargo net + seats + straps
 for(let i=0;i<40;i++)s+=rect(-600+i*110,1510,5,200,'#000','fill-opacity=".5"');
 s+=rect(1300,1100,420,300,'#14180f','stroke="#06080a" stroke-width="6"')+rect(1300,1100,420,18,'#3a4a2a');
 for(let i=0;i<6;i++)s+=`<path d="M1300,${1150+i*40} L1720,${1150+i*40}" stroke="#2a3220" stroke-width="5"/>`;
 // cockpit: pilot silhouette with headset + panel glow
 s+=`<g><rect x="60" y="1050" width="420" height="460" fill="#0a0c08"/><rect x="520" y="1100" width="360" height="410" fill="#0a0c08"/>`;
 s+=`<path d="M650,1500 L650,1080 Q650,920 760,920 Q870,920 870,1080 L870,1500Z" fill="#06080a"/><circle cx="760" cy="880" r="78" fill="#06080a"/><path d="M690,860 Q760,780 830,860" stroke="#1c2418" stroke-width="16" fill="none"/><rect x="670" y="850" width="26" height="60" rx="10" fill="#1c2418"/>`;
 s+=`<rect x="880" y="1190" width="300" height="190" fill="#0a1208" stroke="#06080a" stroke-width="8"/><rect x="900" y="1210" width="120" height="70" fill="#7fffbf" fill-opacity="${(.3+.2*Math.sin(t*7)).toFixed(2)}"/><circle cx="1070" cy="1250" r="14" fill="#ffcf4a"/><circle cx="1110" cy="1250" r="14" fill="#ff2a1a" fill-opacity="${(Math.sin(t*6)>0?.9:.2).toFixed(2)}"/><circle cx="1150" cy="1250" r="14" fill="#3dff7a"/></g>`;
 // red emergency light
 s+=`<circle cx="1700" cy="120" r="26" fill="#ff2a1a" fill-opacity="${(Math.sin(t*5)>0?.95:.3).toFixed(2)}"/><circle cx="1700" cy="120" r="520" fill="url(#redG7)" fill-opacity="${(Math.sin(t*5)>0?.35:.08).toFixed(2)}"/>`;
 // wind-blown cable/straps near the open door
 for(let i=0;i<3;i++){s+=`<path d="M${door[0]+30+i*30},${door[1]+40} q${f(30+Math.sin(t*9+i)*24)},300 ${f(Math.sin(t*7+i)*30)},620" stroke="#c9a23a" stroke-width="7" fill="none"/>`}
 return `<g transform="translate(0,${f(vib)})">${s}</g>`}
// ---------------- B') landmarks seen below/outside during flyovers
export function landmark(kind,t,u){let s='';const sc=u*900;
 if(kind==='bridge'){const y=1180;s+=rect(-600,y,5200,60,'#14101a')+rect(-600,y+60,5200,260,'#0a0810','fill-opacity=".9"');
  for(const tx of[500,2300]){const x=tx-sc*.6;s+=rect(x,y-760,70,830,'#1c1620');for(let k=-8;k<=8;k++){if(k===0)continue;s+=`<line x1="${f(x+35)}" y1="${y-700}" x2="${f(x+35+k*130)}" y2="${y}" stroke="#2a2430" stroke-width="3"/>`}}
  const gx=1300-sc*.6;s+=`<polygon points="${f(gx)},${y} ${f(gx+260)},${y} ${f(gx+190)},${y+140} ${f(gx+70)},${y+90}" fill="#05030a"/>`+`<ellipse cx="${f(gx+130)}" cy="${y-30}" rx="320" ry="120" fill="url(#orangeG7)" fill-opacity="${(.7*flick(t,3)).toFixed(2)}"/>`;
  for(let i=0;i<7;i++){const cx=-300+((i*700-sc*.8)%5200+5200)%5200;s+=rect(cx,y-26,70,26,'#3a1810')+`<circle cx="${f(cx+35)}" cy="${y-30}" r="38" fill="url(#orangeG7)" fill-opacity="${(.6*flick(t,i)).toFixed(2)}"/>`}}
 else if(kind==='metro'){const y=1200;s+=rect(-600,y,5200,500,'#0e0a12');const x=1500-sc*.6;s+=rect(x,y-420,640,430,'#1a1420','stroke="#06040a" stroke-width="8"')+`<polygon points="${f(x-30)},${y-420} ${f(x+670)},${y-420} ${f(x+560)},${y-560} ${f(x+80)},${y-520}" fill="#2a2030"/>`+`<circle cx="${f(x+320)}" cy="${y-300}" r="90" fill="#0b3a8a"/>`+txt(x+320,y-272,'M',100,'#cfe0ff')+`<polygon points="${f(x+380)},${y-420} ${f(x+520)},${y-360} ${f(x+470)},${y-250}" fill="#05030a"/>`;
  s+=`<ellipse cx="${f(x+320)}" cy="${y-480}" rx="520" ry="360" fill="#1a1216" fill-opacity=".8"/><ellipse cx="${f(x+320)}" cy="${y-60}" rx="380" ry="110" fill="url(#orangeG7)" fill-opacity="${(.6*flick(t,5)).toFixed(2)}"/>`;
  for(let i=0;i<5;i++){const bx=-200+((i*900-sc)%5200+5200)%5200;s+=rect(bx,y-130,230,120,'#c8a02a')+rect(bx,y-130,230,12,'#fff','fill-opacity=".25"')+`<circle cx="${f(bx+115)}" cy="${y-150}" r="110" fill="url(#orangeG7)" fill-opacity="${(.5*flick(t,i+9)).toFixed(2)}"/>`}}
 else{const y=1220;s+=rect(-600,y,5200,600,'#0c0810');
  for(let k=0;k<12;k++){const x=-400+((k*470-sc*1.1)%5600+5600)%5600;const h=520+rn(k)*700;s+=rect(x,y-h,300+rn(k+2)*160,h,'#100c16')+rect(x,y-h,10,h,'#ffb060','fill-opacity=".22"');for(let r=0;r<h/90;r++)if(rn(k*9+r)<.2)s+=rect(x+24,y-h+30+r*90,40,50,'#ffb060','fill-opacity=".7"')}
  for(let i=0;i<6;i++){const cx=-300+((i*820-sc*1.3)%5200+5200)%5200;s+=rect(cx,y+30,180,64,'#4a1a12')+`<circle cx="${f(cx+90)}" cy="${y+10}" r="90" fill="url(#orangeG7)" fill-opacity="${(.7*flick(t,i+2)).toFixed(2)}"/>`}}
 return s}
// ---------------- C) rooftop II extras
export function cracks(t,p,o){let s='';const n=Math.floor(p*14);for(let i=0;i<n;i++){const x0=1300+rn(i)*1700,y0=FL+10+rn(i+3)*220;let d=`M${f(x0)},${f(y0)}`;let x=x0,y=y0;for(let k=0;k<5;k++){x+=(rn(i*5+k)-.45)*260;y+=(rn(i*7+k)-.5)*40;d+=` L${f(x)},${f(y)}`}s+=`<path d="${d}" stroke="#050304" stroke-width="${f(6+rn(i)*8)}" fill="none"/><path d="${d}" stroke="#ff7a3a" stroke-width="2.5" fill="none" opacity="${(.4*p).toFixed(2)}"/>`}return s}
export function designator(t,o){const x=1750,y=FL;let s=`<g><path d="M${x-90},${y} L${x},${y-250} L${x+90},${y} M${x},${y-250} L${x},${y}" stroke="#14161a" stroke-width="12" fill="none"/><rect x="${x-110}" y="${y-380}" width="220" height="150" rx="14" fill="#2a2e34" stroke="#06080a" stroke-width="7"/><rect x="${x-90}" y="${y-360}" width="90" height="60" fill="#0a120a"/><rect x="${x-82}" y="${y-352}" width="${f(74*(.4+.4*Math.sin(t*5)))}" height="10" fill="#7fff9f"/><circle cx="${x+70}" cy="${y-320}" r="14" fill="${Math.sin(t*8)>0?'#ff2a1a':'#4a0e0a'}"/><rect x="${x+110}" y="${y-330}" width="90" height="26" fill="#14161a"/></g>`;
 if(o.laser){s+=`<line x1="${x+200}" y1="${y-317}" x2="${o.lx}" y2="${o.ly}" stroke="#ff2a2a" stroke-width="5" opacity=".8"/><circle cx="${o.lx}" cy="${o.ly}" r="16" fill="#ff2a2a"/><circle cx="${o.lx}" cy="${o.ly}" r="90" fill="url(#redG7)" fill-opacity=".6"/>`}return s}
export function parapet(t){return rect(3150,FL-130,1800,150,'#2a2e34','stroke="#0a0b0d" stroke-width="8"')+rect(3150,FL-130,1800,14,'#fff','fill-opacity=".12"')}
// ---------------- D) glass facade (descending): scroll = metres of descent
export function facade(t,o){const sc=o.scroll||0;let s=rect(-1500,-1500,8000,5000,'#0a0e14');const cw=380,ch=330;
 for(let c=-4;c<14;c++)for(let r=-6;r<14;r++){const x=c*cw,y=r*ch+((sc%ch)+ch)%ch-ch;const id=(c+20)*31+Math.floor((r*ch-sc)/ch)*7;const q=rn(id);const lit=q<.16;const fire=q<.05;const crack=q>.8;
  s+=rect(x+8,y+8,cw-16,ch-16,'url(#glassD)')+rect(x+8,y+8,cw-16,10,'#fff','fill-opacity=".08"');
  if(lit)s+=rect(x+14,y+14,cw-28,ch-28,fire?'#ff7a2a':'#ffd9a0','fill-opacity="'+(fire?.8*flick(t,id):.5).toFixed(2)+'"');
  if(fire)s+=`<circle cx="${x+cw/2}" cy="${y+ch/2}" r="${230}" fill="url(#orangeG7)" fill-opacity="${(.4*flick(t,id)).toFixed(2)}"/>`;
  if(crack)s+=`<path d="M${x+60},${y+40} l60,100 l-40,60 l80,90 M${x+200},${y+30} l-30,120" stroke="#cfe0ff" stroke-width="3" fill="none" opacity=".5"/>`;
  s+=`<path d="M${x+20},${y+ch-20} L${x+cw*.55},${y+20}" stroke="#fff" stroke-width="10" opacity=".05"/>`}
 for(let c=-4;c<14;c++)s+=rect(c*cw,-1500,10,5000,'#05070a');
 // sparks/embers streaming up as they descend
 for(let i=0;i<30;i++){const x=rn(i)*3200-200,y=((rn(i+3)*2200+t*(300+rn(i+9)*400))%2200)-200;s+=`<circle cx="${f(x)}" cy="${f(1900-y)}" r="${f(2+rn(i+5)*4)}" fill="#ffb060" fill-opacity=".6"/>`}
 return s}
export function monsterEyeWindow(t,p,x,y){// huge eye pressed against the glass
 const r=230;let s=`<g opacity="${clamp(p*3).toFixed(2)}"><ellipse cx="${x}" cy="${y}" rx="${r*1.9}" ry="${r*1.4}" fill="#0a0508"/><ellipse cx="${x}" cy="${y}" rx="${r*1.5}" ry="${r*1.1}" fill="#14080a" stroke="#050204" stroke-width="12"/>`;
 s+=`<circle cx="${x}" cy="${y}" r="${r*2.6}" fill="url(#orangeG7)" fill-opacity=".45"/>`;
 s+=`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.82}" fill="#ffb02a"/><ellipse cx="${x}" cy="${y}" rx="${r*.7}" ry="${r*.6}" fill="#e8561a"/>`;
 for(let k=0;k<12;k++){const a=k/12*6.28;s+=`<path d="M${f(x+Math.cos(a)*r*.98)},${f(y+Math.sin(a)*r*.8)} Q${f(x+Math.cos(a+.2)*r*.6)},${f(y+Math.sin(a+.2)*r*.5)} ${f(x+Math.cos(a)*r*.3)},${f(y+Math.sin(a)*r*.25)}" stroke="#7a0c0c" stroke-width="3" fill="none" opacity=".7"/>`}
 const lx=Math.sin(t*.9)*r*.25;s+=`<ellipse cx="${f(x+lx)}" cy="${y}" rx="${f(r*.12)}" ry="${f(r*.7)}" fill="#050203"/><ellipse cx="${f(x+lx-r*.1)}" cy="${f(y-r*.25)}" rx="${r*.08}" ry="${r*.12}" fill="#fff" fill-opacity=".85"/>`;
 s+=`<path d="M${x-r*1.5},${y+r*.1} Q${x},${y-r*1.45} ${x+r*1.5},${y+r*.1} L${x+r*1.5},${y-r*1.7} L${x-r*1.5},${y-r*1.7}Z" fill="#1a1018" stroke="#050204" stroke-width="10" transform="rotate(${f(-10)} ${x} ${y})"/>`;
 // fog of breath on the glass + cracks radiating
 s+=`<ellipse cx="${x}" cy="${y+r*1.2}" rx="${r*1.6}" ry="${r*.6}" fill="#cfe0ff" fill-opacity="${(.12+.1*Math.sin(t*2)).toFixed(2)}"/>`;
 for(let k=0;k<10;k++){const a=k/10*6.28+.3;s+=`<path d="M${f(x+Math.cos(a)*r*1.7)},${f(y+Math.sin(a)*r*1.3)} l${f(Math.cos(a)*(150+rn(k)*220))},${f(Math.sin(a)*(130+rn(k+3)*200))}" stroke="#e8f4ff" stroke-width="${3+k%3}" fill="none" opacity="${(.4*p).toFixed(2)}"/>`}
 return s+`</g>`}
// ---------------- E) service tunnel + steel door
export function tunnelDoor(t,o){let s=rect(-1500,-1500,9000,5000,'#0a0c0f');const bulge=o.bulge||0,pierce=o.pierce||0,open=o.open||0;
 // tunnel walls + arch ribs + pipes (perspective-ish: ribs shrink toward the door at x~2000)
 s+=rect(-1500,-300,9000,1800,'url(#tunW)');
 for(let k=-6;k<10;k++){const x=k*420;s+=rect(x,-300,26,1810,'#06080a','fill-opacity=".6"')+rect(x+26,-300,6,1810,'#4a525a','fill-opacity=".2"')}
 for(const [y,h,c] of [[60,64,'#4a4036'],[160,40,'#30363c'],[230,26,'#3a4046']])s+=rect(-1500,y,9000,h,c)+rect(-1500,y,9000,h*.3,'#fff','fill-opacity=".1"');
 for(let k=0;k<16;k++){const x=k*400-200;const on=flick(t,k)*(o.lightsOut?0:1);s+=rect(x,330,70,22,on>.5?'#ffe9b0':'#2a2a2a')+(on>.5?`<ellipse cx="${x+35}" cy="${FL-8}" rx="240" ry="34" fill="#ffe9b0" fill-opacity=".14"/>`:'')}
 s+=rect(-1500,FL,9000,600,'#14171a')+rect(-1500,FL,9000,8,'#000','fill-opacity=".6"');for(let i=0;i<20;i++)s+=rect(-1000+i*260,FL+30,4,500,'#000','fill-opacity=".4"');
 // wet floor reflection of the orange light from the door gaps
 // door frame + leaf
 const dx=1950,dw=700,top=170,h=FL-top;s+=rect(dx-60,top-60,dw+120,h+60,'#06080a')+rect(dx,top,dw,h,open?'#ffb04a':'#1a1c20');
 if(open>0)s+=`<polygon points="${dx},${top} ${dx+dw},${top} ${dx+dw+900},${FL+400} ${dx-900},${FL+400}" fill="#ff9a3a" fill-opacity="${(.5*open).toFixed(2)}"/>`;
 const lw=dw*(1-open*.9);s+=`<polygon points="${dx},${top} ${f(dx+lw)},${f(top+open*40)} ${f(dx+lw)},${f(FL-open*30)} ${dx},${FL}" fill="url(#steelD)" stroke="#06080a" stroke-width="8"/>`;
 if(lw>80){for(let i=0;i<3;i++)s+=rect(dx+30,top+160+i*330,lw-60,34,'#8a9099','stroke="#06080a" stroke-width="4"')+`<circle cx="${dx+50}" cy="${top+177+i*330}" r="8" fill="#14161a"/><circle cx="${f(dx+lw-50)}" cy="${top+177+i*330}" r="8" fill="#14161a"/>`;
  s+=txt(dx+lw/2,top+110,'ACCESO SERVICIO',40,'#e9eef5','letter-spacing="4"');
  // bulge: the leaf pushed toward us (radial shading + bent rivets)
  if(bulge>0)s+=`<ellipse cx="${dx+lw*.5}" cy="${top+h*.45}" rx="${f(lw*.42*bulge)}" ry="${f(h*.3*bulge)}" fill="#000" fill-opacity="${(.35*bulge).toFixed(2)}"/><ellipse cx="${dx+lw*.46}" cy="${top+h*.4}" rx="${f(lw*.3*bulge)}" ry="${f(h*.2*bulge)}" fill="#fff" fill-opacity="${(.12*bulge).toFixed(2)}"/>`;
  // claws piercing the steel (spikes toward the viewer), with orange light through the holes
  for(let k=0;k<Math.floor(pierce*5);k++){const px=dx+lw*(.22+.14*k+rn(k)*.05),py=top+h*(.3+rn(k+2)*.35);s+=`<polygon points="${f(px-26)},${f(py+90)} ${f(px+4)},${f(py-110-rn(k)*60)} ${f(px+30)},${f(py+80)}" fill="#cfc7b4" stroke="#3a2a1a" stroke-width="5"/><ellipse cx="${f(px)}" cy="${f(py+60)}" rx="${f(70+rn(k+4)*30)}" ry="${f(110)}" fill="#ff7a2a" fill-opacity=".55"/><path d="M${f(px-70)},${f(py+30)} l-40,-60 M${f(px+70)},${f(py+30)} l40,-70 M${f(px)},${f(py+120)} l0,60" stroke="#050304" stroke-width="7"/>`}}
 // sparks
 if(pierce>0)for(let i=0;i<22;i++){const u=((t*2.2+i/22)%1);s+=`<circle cx="${f(dx+lw*(.3+rn(i)*.5)+(rn(i+3)-.5)*220*u)}" cy="${f(top+h*.5+u*300*rn(i+5))}" r="${f(3+4*(1-u))}" fill="#ffd38a" fill-opacity="${(.9*(1-u)).toFixed(2)}"/>`}
 return s}
export const defsDoor=`<defs><linearGradient id="steelD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b4048"/><stop offset=".5" stop-color="#5a6068"/><stop offset="1" stop-color="#2c3036"/></linearGradient></defs>`;
// ---------------- F) dead city after the bombing
export function deadCity(t,o){let s=rect(-2000,-3000,10000,5200,'url(#ashSky)');
 s+=`<ellipse cx="2600" cy="900" rx="2400" ry="420" fill="#ffb87a" fill-opacity=".28"/>`;
 // ash clouds
 for(let k=0;k<12;k++)s+=`<ellipse cx="${f(-600+k*420+Math.sin(t*.1+k)*60)}" cy="${f(300+rn(k)*300)}" rx="${f(420+rn(k+3)*240)}" ry="${f(120+rn(k+5)*90)}" fill="#3a3436" fill-opacity=".4"/>`;
 // broken skyline silhouettes (jagged tops)
 const par=(d)=>`<g transform="translate(${f(((o.cx||2000)-2000)*d)},0)">`;
 s+=par(.1);for(let k=0;k<24;k++){const x=-500+k*260,h=260+rn(k)*520;let d=`M${x},1300 L${x},${1300-h}`;let xx=x;for(let j=0;j<5;j++){xx+=40+rn(k*5+j)*40;d+=` L${f(xx)},${f(1300-h+rn(k*7+j)*160)}`}d+=` L${x+260},1300Z`;s+=`<path d="${d}" fill="#2a2426"/>`}s+='</g>';
 s+=par(.22);for(let k=0;k<16;k++){const x=-600+k*380,h=360+rn(k+30)*680;let d=`M${x},1400 L${x},${1400-h}`;let xx=x;for(let j=0;j<6;j++){xx+=50+rn(k*5+j+9)*50;d+=` L${f(xx)},${f(1400-h+rn(k*7+j+4)*220)}`}d+=` L${x+360},1400Z`;s+=`<path d="${d}" fill="#1a1618"/><path d="${d}" fill="none" stroke="#ffb87a" stroke-width="3" opacity=".25"/>`}s+='</g>';
 // fires still burning + smoke columns far
 for(let k=0;k<6;k++)s+=`<ellipse cx="${f(300+k*620)}" cy="1330" rx="120" ry="34" fill="url(#orangeG7)" fill-opacity="${(.5*flick(t,k)).toFixed(2)}"/>`;
 // ground: rubble, craters (giant footprints)
 s+=rect(-2000,1380,10000,800,'#241e20')+rect(-2000,1380,10000,10,'#000','fill-opacity=".5"');
 for(const x of[1000,2900,4700]){s+=`<ellipse cx="${x}" cy="1560" rx="520" ry="90" fill="#0e0a0c"/><ellipse cx="${x}" cy="1548" rx="480" ry="70" fill="#1a1416"/>`}
 for(let k=0;k<50;k++)s+=`<polygon points="${f(rn(k)*5200-300)},${f(1430+rn(k+3)*340)} ${f(rn(k)*5200-300+60+rn(k+2)*140)},${f(1400+rn(k+3)*340)} ${f(rn(k)*5200-300+90)},${f(1470+rn(k+3)*340)}" fill="#3a3234" stroke="#0a0708" stroke-width="3"/>`;
 // falling ash
 for(let i=0;i<90;i++){const x=((rn(i)*5400+t*(10+rn(i+3)*20))%5400)-300,y=((rn(i+7)*2400+t*(60+rn(i+2)*90))%2400)-300;s+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(2+rn(i+4)*4)}" fill="#cfc7bd" fill-opacity="${(.25+.4*rn(i+6)).toFixed(2)}"/>`}
 return s}
export function farSilhouette(t,o){// distant colossus standing motionless in the smoke, then slowly turning its head toward the camera
 const turn=sstep((t-o.turnT)/5);const eyes=sstep((t-o.eyesT)/1.4);const x=o.x,y=o.y,sc=o.sc||.34;
 let s=`<g transform="translate(${x},${y}) scale(${sc})" opacity=".92">`+colossus(t,{jaw:.02,look:[-1+turn*1.0,.1],climb:0,sway:0,headAng:-.2+turn*.2,headX:-120+turn*80,headY:-780,headScale:1.7,mood:'cold'})+`</g>`;
 s+=`<ellipse cx="${x}" cy="${y-880*sc*1.2}" rx="${400*sc*3}" ry="${160*sc*3}" fill="#6a5a52" fill-opacity=".35"/>`;
 if(eyes>0)s+=`<g opacity="${eyes.toFixed(2)}"><circle cx="${x-60*sc*5}" cy="${y-1020*sc*1.1}" r="${90*sc*3}" fill="url(#redG7)"/></g>`;
 return s}
// ---------------- blood (stylised horror): spray, stains and lens splatter
export function bloodSpray(t,t0,x,y,dx,dy,seed,n=34,len=1.4){const u=(t-t0)/len;if(u<0||u>1)return'';let s='';for(let i=0;i<n;i++){const a=Math.atan2(dy,dx)+(rn(seed+i)-.5)*1.5,sp=300+rn(seed+i*3)*900;const px=x+Math.cos(a)*sp*u*1.2,py=y+Math.sin(a)*sp*u*1.2+500*u*u;const r=(5+rn(seed+i*5)*14)*(1-.5*u);s+=`<circle cx="${f(px)}" cy="${f(py)}" r="${f(r)}" fill="#8a0c14" fill-opacity="${(.9*(1-u*.6)).toFixed(2)}"/><line x1="${f(px)}" y1="${f(py)}" x2="${f(px-Math.cos(a)*40*(1-u))}" y2="${f(py-Math.sin(a)*40*(1-u)+10)}" stroke="#a00f1a" stroke-width="${f(r*.7)}" stroke-opacity="${(.7*(1-u)).toFixed(2)}"/>`}
 s+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(120*Math.min(1,u*4)*(1-u*.3))}" fill="#7a0a10" fill-opacity="${(.7*(1-u)).toFixed(2)}"/>`;return s}
export function bloodStain(x,y,r,seed,grow=1){let pts=[];for(let k=0;k<14;k++){const a=k/14*6.28;const rr=r*grow*(.65+rn(seed+k)*.7);pts.push([x+Math.cos(a)*rr*1.4,y+Math.sin(a)*rr*.5])}
 let d='M'+pts.map(p=>f(p[0])+','+f(p[1])).join(' L')+'Z';let s=`<path d="${d}" fill="#5a060c" fill-opacity=".92" stroke="#2a0306" stroke-width="3"/><path d="${d}" fill="#a00f1a" fill-opacity=".35" transform="translate(-6,-4) scale(.9)" style="transform-origin:${f(x)}px ${f(y)}px"/>`;
 for(let k=0;k<5;k++){const dx=x+(rn(seed+k*7)-.5)*r*2.4;s+=`<circle cx="${f(dx)}" cy="${f(y+r*.3*rn(seed+k))}" r="${f(4+rn(seed+k*3)*9)}" fill="#7a0a10"/>`}return s}
export function lensBlood(t,t0,seed,O={}){const u=t-t0;if(u<0)return'';const fade=clamp(1-(u-O.hold||6)/5);if(fade<=0)return'';const cx0=O.cx??540,cy0=O.cy??900;let s='';
 for(let i=0;i<22;i++){const x=cx0+(rn(seed+i)-.5)*900,y=cy0+(rn(seed+i*3)-.5)*1100;const r=14+rn(seed+i*5)*58;const drip=Math.min(1,u/3)*(40+rn(seed+i*7)*260)*(.4+.6*rn(seed+i));
  s+=`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r*.9)}" fill="#7a0810" fill-opacity="${(.75*fade).toFixed(2)}"/><path d="M${f(x-r*.18)},${f(y)} L${f(x-r*.12)},${f(y+drip)} Q${f(x)},${f(y+drip+r*.4)} ${f(x+r*.12)},${f(y+drip)} L${f(x+r*.18)},${f(y)}Z" fill="#7a0810" fill-opacity="${(.7*fade).toFixed(2)}"/>`}
 s+=`<rect width="1080" height="1920" fill="#5a0508" fill-opacity="${(.12*fade).toFixed(2)}"/>`;return s}
// ---------------- collapsed stairwell seen from the roof door
export function stairsCollapsed(t,o){let s=rect(-1500,-1500,9000,5000,'#05060a');
 // door frame + interior shaft
 s+=rect(300,520,900,1000,'#0a0c10','stroke="#1a1c20" stroke-width="30"');
 for(let k=0;k<9;k++){const y=700+k*120;s+=`<path d="M320,${y} L${f(500+rn(k)*300)},${f(y+30+rn(k+2)*90)}" stroke="#2a2e34" stroke-width="${f(14+rn(k)*10)}"/>`}
 // twisted rebar + broken steps hanging, fire glow far below
 for(let k=0;k<12;k++){const x=360+rn(k)*780,y0=560+rn(k+3)*300;s+=`<path d="M${f(x)},${f(y0)} q${f((rn(k+5)-.5)*120)},${f(80+rn(k)*160)} ${f((rn(k+7)-.5)*80)},${f(240+rn(k+2)*200)}" stroke="#6a4a3a" stroke-width="${f(5+rn(k)*6)}" fill="none"/>`}
 s+=`<polygon points="360,1180 700,1120 640,1260 400,1300" fill="#1a1c20" stroke="#050608" stroke-width="6"/><polygon points="820,1000 1160,1060 1120,1180 840,1140" fill="#1a1c20" stroke="#050608" stroke-width="6"/>`;
 s+=`<ellipse cx="750" cy="1500" rx="520" ry="260" fill="url(#orangeG7)" fill-opacity="${(.7+.2*Math.sin(t*6)).toFixed(2)}"/>`;
 for(let i=0;i<30;i++){const x=340+rn(i)*820,y=((rn(i+3)*1000+t*(200+rn(i)*300))%1000);s+=`<circle cx="${f(x)}" cy="${f(1500-y)}" r="${f(2+rn(i+5)*5)}" fill="#ffb060" fill-opacity=".7"/>`}
 s+=`<circle cx="750" cy="470" r="22" fill="#ff2a1a" fill-opacity="${(Math.sin(t*5)>0?.95:.2).toFixed(2)}"/><circle cx="750" cy="470" r="420" fill="url(#redG7)" fill-opacity="${(Math.sin(t*5)>0?.4:.08).toFixed(2)}"/>`;
 s+=rect(-1500,FL,9000,600,'#14171a')+rect(-1500,FL,9000,8,'#000','fill-opacity=".6"');
 // roof floor lit by the fire from the shaft
 s+=`<ellipse cx="760" cy="${FL+30}" rx="900" ry="70" fill="url(#orangeG7)" fill-opacity=".35"/>`;
 return s}
// ---------------- roof edge with the rope anchor (before the facade descent)
export function edgeRope(t,o){let s='';const p=o.p||0;
 s+=rect(2800,FL-160,1400,180,'#2a2e34','stroke="#0a0b0d" stroke-width="8"')+rect(2800,FL-160,1400,14,'#fff','fill-opacity=".12"');
 // anchor point: the antenna base + rope tied and thrown over the edge
 s+=`<rect x="2740" y="${FL-120}" width="130" height="130" fill="#14161a" stroke="#06080a" stroke-width="6"/><circle cx="2805" cy="${FL-55}" r="22" fill="#6a717c"/>`;
 s+=`<path d="M2805,${FL-55} Q3000,${FL-40} 3180,${FL-170} L3200,${FL+260+p*500}" stroke="#14170f" stroke-width="12" fill="none"/><path d="M2805,${FL-55} Q3000,${FL-40} 3180,${FL-170} L3200,${FL+260+p*500}" stroke="#c9a23a" stroke-width="4" fill="none"/>`;
 return s}
// ---------------- street run toward the service entrance
export function alley(t,o){const cx=o.cx||2000;let s=sky(t,cx)+skyline(t,cx);
 const par=d=>`<g transform="translate(${f((cx-2000)*d)},0)">`;
 s+=par(.55);for(let k=0;k<10;k++){const x=-300+k*520,h=800+rn(k)*900;s+=rect(x,1380-h,420+rn(k+3)*140,h,'#0c0810')+rect(x,1380-h,10,h,'#ffb060','fill-opacity=".22"');for(let r=0;r<h/110;r++)if(rn(k*9+r)<.18)s+=rect(x+30,1380-h+40+r*110,46,60,'#ffb060','fill-opacity=".65"');if(rn(k+9)<.4)s+=`<ellipse cx="${f(x+210)}" cy="${f(1380-h+60)}" rx="260" ry="120" fill="url(#orangeG7)" fill-opacity="${(.6*flick(t,k)).toFixed(2)}"/>`}s+='</g>';
 s+=rect(-1500,1380,9000,900,'#14101a')+rect(-1500,1380,9000,10,'#000','fill-opacity=".5"');
 for(let k=0;k<7;k++){const x=300+k*620+rn(k)*80;s+=rect(x,FL-120,300,120,'#3a2218','stroke="#0a0508" stroke-width="5"')+rect(x+40,FL-190,200,80,'#2a1810')+`<circle cx="${f(x+150)}" cy="${FL-100}" r="220" fill="url(#orangeG7)" fill-opacity="${(.7*flick(t,k+5)).toFixed(2)}"/>`}
 for(let k=0;k<40;k++)s+=`<polygon points="${f(rn(k)*5600-300)},${f(1440+rn(k+3)*300)} ${f(rn(k)*5600-300+50+rn(k+2)*120)},${f(1420+rn(k+3)*300)} ${f(rn(k)*5600-300+80)},${f(1480+rn(k+3)*300)}" fill="#3a3234" stroke="#0a0708" stroke-width="3"/>`;
 // service entrance on the right: bunker door + sign + green light
 const dx=4000;s+=rect(dx-60,520,640,990,'#1a1d22','stroke="#06080a" stroke-width="8"')+rect(dx,880,520,630,'#0a0c10','stroke="#2a2e34" stroke-width="14"')+rect(dx+30,910,460,600,'url(#steelD)','stroke="#06080a" stroke-width="6"')+txt(dx+260,820,'ACCESO SERVICIO',46,'#e9eef5','letter-spacing="4"')+`<circle cx="${dx+260}" cy="760" r="20" fill="#3dff7a"/><circle cx="${dx+260}" cy="760" r="240" fill="url(#redG7)" fill-opacity="0"/><path d="M${dx+110},700 l-90,0 l35,-35 m-35,35 l35,35" stroke="#59ff8f" stroke-width="10" fill="none" transform="translate(150,0)"/>`;
 // the colossus looming far behind, towering above the skyline
 s+=`<g transform="translate(${f(900-(cx-2000)*.1)},1300) scale(.55)" opacity=".8">`+colossus(t,{jaw:.05,look:[1,-.2],climb:t*.1,sway:Math.sin(t*.7)*.1,headAng:.1,headX:-60,headY:-780,headScale:1.7,mood:'hunt'})+`</g>`;
 return s}
