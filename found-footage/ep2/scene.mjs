export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
export const lerp=(a,b,t)=>a+(b-a)*t;
export const EV={cam:7.4,rush:28,stop:31,clicks:46,reveal:54,drop:55.8,smash:58.6,gstep:67.5,run:67.9,collapse:71,wallburst:78.4,eye:79,fall:86.7,black:88,endcard:89};
export const setEV=o=>{Object.assign(EV,o);buildD()};
// ---------- descent profile (pure function of t)
let DT=[];let LAND=700;
function speed(t){const r=(a,b,x)=>sm((x-a)/(b-a));let v=0;if(t>EV.cam+.4)v=360*r(EV.cam+.4,EV.cam+1.6,t);v*=1-r(EV.stop-.6,EV.stop+.7,t);if(t>EV.run)v+=800*r(EV.run,EV.run+.8,t)*(1-r(EV.collapse-.3,EV.collapse+.1,t));return v}
function buildD(){DT=[0];const dt=1/60;for(let i=1;i<=60*160;i++)DT.push(DT[i-1]+speed(i*dt)*dt);const ds=DT[Math.round((EV.stop+.8)*60)];LAND=ds/3}
export const descent=t=>{const i=clamp(t*60,0,DT.length-2);const a=Math.floor(i);return DT[a]+(DT[a+1]-DT[a])*(i-a)};
export const speedAt=speed;
buildD();
const rn=(i)=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// ---------- defs
export const defsScene=`<defs>
<linearGradient id="wallG" gradientUnits="userSpaceOnUse" x1="0" y1="-600" x2="0" y2="2600"><stop offset="0" stop-color="#262b33"/><stop offset=".5" stop-color="#1b1f26"/><stop offset="1" stop-color="#0d0f13"/></linearGradient>
<radialGradient id="redG"><stop offset="0" stop-color="#ff2a1a" stop-opacity=".9"/><stop offset=".4" stop-color="#ff2a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff2a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="warmG"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>
<radialGradient id="eyeG"><stop offset="0" stop-color="#fff2a8"/><stop offset=".35" stop-color="#ffb21a"/><stop offset=".7" stop-color="#c2480a"/><stop offset="1" stop-color="#4a1204"/></radialGradient>
<radialGradient id="dustG"><stop offset="0" stop-color="#cdbfae" stop-opacity=".8"/><stop offset="1" stop-color="#cdbfae" stop-opacity="0"/></radialGradient>
<linearGradient id="beamCone" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f9ff" stop-opacity=".55"/><stop offset="1" stop-color="#f4f9ff" stop-opacity=".05"/></linearGradient>
</defs>`;
const flick=(t,i)=>{const h=Math.sin(t*23+i*7.1)*Math.sin(t*9.3+i*2.7)+Math.sin(t*61+i)*.3;return h>-.15?1:.15};
// ---------- stairwell backdrop
export function backdrop(t,cx,cy){const D=descent(t);const L=LAND;let s=`<rect x="-3500" y="-3000" width="9000" height="7000" fill="url(#wallG)"/>`;
 const shake=speedAt(t)>500?Math.sin(t*14)*6:0;
 // wall panels (seams)
 for(let z=-1400;z<2600;z+=420){const y=((z-D*.55)%420+420)%420+z-(z%420)-0;}
 const seam=420,off=((D*.55)%seam);for(let k=-6;k<12;k++){const y=k*seam-off;s+=`<rect x="-3500" y="${y.toFixed(0)}" width="9000" height="5" fill="#0a0c10" fill-opacity=".7"/><rect x="-3500" y="${(y+5).toFixed(0)}" width="9000" height="3" fill="#3a414c" fill-opacity=".25"/>`}
 for(const x of[-100,500,1100,1700,2300,2900])s+=`<rect x="${x}" y="-3000" width="6" height="7000" fill="#0a0c10" fill-opacity=".6"/>`;
 // pipes
 for(const x of[260,2540]){s+=`<rect x="${x}" y="-3000" width="34" height="7000" fill="#2b3038"/><rect x="${x+6}" y="-3000" width="8" height="7000" fill="#4a525e" fill-opacity=".5"/>`;const po=(D*.9)%360;for(let k=-8;k<14;k++){const y=k*360-po;s+=`<rect x="${x-6}" y="${y.toFixed(0)}" width="46" height="16" fill="#1a1d23"/>`}}
 // stair steps below the characters (bands) + side rail posts
 const step=96,so=D%step;for(let k=-2;k<16;k++){const y=1500+k*step-so;const sh=k%2?'#262b32':'#20242b';s+=`<rect x="-3500" y="${y.toFixed(0)}" width="9000" height="${step}" fill="${sh}"/><rect x="-3500" y="${y.toFixed(0)}" width="9000" height="14" fill="#4a515c" fill-opacity=".45"/>`}
 // landings (slabs, doors, numbers, lamps)
 const nmin=Math.floor((D-2200)/L)-1,nmax=Math.ceil((D+1800)/L)+1;
 for(let n=Math.max(0,nmin);n<=nmax;n++){const y=1500+n*L-D;const fl=14-n;
  s+=`<rect x="-3500" y="${y.toFixed(0)}" width="9000" height="70" fill="#4b525d"/><rect x="-3500" y="${(y+70).toFixed(0)}" width="9000" height="40" fill="#14161b"/><rect x="-3500" y="${y.toFixed(0)}" width="9000" height="8" fill="#7c8592" fill-opacity=".5"/>`;
  const dy=y-560;s+=`<rect x="1080" y="${dy.toFixed(0)}" width="340" height="560" fill="#0a0c10"/><rect x="1096" y="${(dy+16).toFixed(0)}" width="308" height="544" fill="#2f5a46" stroke="#0e1d16" stroke-width="6"/><rect x="1120" y="${(dy+60).toFixed(0)}" width="260" height="130" fill="#264a39"/><circle cx="1366" cy="${(dy+330).toFixed(0)}" r="14" fill="#c9c2a8"/>`;
  s+=`<text x="1250" y="${(dy-60).toFixed(0)}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="120" fill="#cfd6df" fill-opacity=".55" stroke="#0a0c10" stroke-width="3">${fl}</text><text x="1250" y="${(dy-14).toFixed(0)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" letter-spacing="8" fill="#cfd6df" fill-opacity=".5">PISO</text>`;
  // emergency lamp above door
  const lx=1250,ly=dy-210,k=flick(t,n);s+=`<rect x="${lx-40}" y="${ly}" width="80" height="34" rx="8" fill="#2a0e0e"/><circle cx="${lx}" cy="${ly+17}" r="14" fill="${k>.5?'#ff3a2a':'#4a1410'}"/>`;
  if(k>.5)s+=`<circle cx="${lx}" cy="${ly+17}" r="${(260+40*Math.sin(t*6+n)).toFixed(0)}" fill="url(#redG)" fill-opacity=".55"/>`;
  // apartment door at floor 11 slightly open
  if(fl===11){s+=`<rect x="1096" y="${(dy+16).toFixed(0)}" width="308" height="544" fill="#1c3a2c"/><polygon points="1096,${(dy+16).toFixed(0)} 1176,${(dy+36).toFixed(0)} 1176,${(dy+540).toFixed(0)} 1096,${(dy+560).toFixed(0)}" fill="#07100b"/><rect x="1176" y="${(dy+34).toFixed(0)}" width="228" height="510" fill="#04060a"/>`;if(t>EV.clicks-1&&t<EV.reveal)s+=`<circle cx="1290" cy="${(dy+300).toFixed(0)}" r="5" fill="#ff5a7a" fill-opacity="${(.4+.5*Math.sin(t*9)).toFixed(2)}"/><circle cx="1322" cy="${(dy+304).toFixed(0)}" r="5" fill="#ff5a7a" fill-opacity="${(.4+.5*Math.sin(t*9+1)).toFixed(2)}"/>`}
 }
 // wall sconce lamps (parallax)
 const lo=(D*.55)%700;for(let k=-3;k<8;k++){const y=k*700-lo+300;for(const x of[330,2470]){const kk=flick(t,k*3+(x>1000?1:0));s+=`<rect x="${x-16}" y="${y.toFixed(0)}" width="32" height="54" rx="8" fill="#2a0e0e"/><circle cx="${x}" cy="${(y+27).toFixed(0)}" r="11" fill="${kk>.5?'#ff3a2a':'#401210'}"/>`;if(kk>.5)s+=`<circle cx="${x}" cy="${(y+27).toFixed(0)}" r="170" fill="url(#redG)" fill-opacity=".5"/>`}}
 // collapse: hole below, rubble
 if(t>EV.collapse){const u=clamp((t-EV.collapse)/2.2);const y=1500+90;s+=`<polygon points="-3500,${y+40} 560,${y+10} 820,${y+120} 1300,${y+60} 1700,${y+150} 2300,${y+40} 6000,${y+60} 6000,2800 -3500,2800" fill="#040507"/><polygon points="560,${y+10} 820,${y+120} 700,${y+330} 420,${y+260}" fill="#1c1f25"/>`;
  s+=`<ellipse cx="1300" cy="${y+80}" rx="${(900*u).toFixed(0)}" ry="${(260*u).toFixed(0)}" fill="url(#dustG)" fill-opacity="${(.8*(1-clamp((t-EV.collapse-2)/4)*.5)).toFixed(2)}"/>`}
 // wall burst + eye
 if(t>EV.wallburst){const u=clamp((t-EV.wallburst)/.5);const bx=1500,by=640;
  s+=`<polygon points="${bx-700},${by-420} ${bx-420},${by-640} ${bx+80},${by-520} ${bx+520},${by-660} ${bx+760},${by-300} ${bx+640},${by+60} ${bx+780},${by+380} ${bx+300},${by+560} ${bx-120},${by+430} ${bx-520},${by+600} ${bx-760},${by+200} ${bx-620},${by-100}" fill="#0b0d12" stroke="#2b2f37" stroke-width="14"/>`;
  s+=`<rect x="${bx-620}" y="${by-480}" width="1300" height="1000" fill="#2a1612"/><ellipse cx="${bx+30}" cy="${by+20}" rx="640" ry="520" fill="url(#warmG)" fill-opacity=".45"/>`;
  if(t>EV.eye){const e=clamp((t-EV.eye)/1.2);const bl=((t-EV.eye)%4)>3.7?Math.abs(Math.sin(((t-EV.eye)%4-3.7)/.3*Math.PI)):0;const ry=380*e*(1-bl*.96);s+=`<ellipse cx="${bx+30}" cy="${by+20}" rx="520" ry="${ry.toFixed(0)}" fill="#120806"/><ellipse cx="${bx+30}" cy="${by+20}" rx="440" ry="${(ry*.88).toFixed(0)}" fill="url(#eyeG)"/>`;
   for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r0=130,r1=420;s+=`<path d="M${bx+30+Math.cos(a)*r0},${by+20+Math.sin(a)*r0*.9} L${bx+30+Math.cos(a+.1)*r1},${by+20+Math.sin(a+.1)*r1*.8}" stroke="#7a2208" stroke-width="5" stroke-opacity=".55" fill="none"/>`}
   s+=`<ellipse cx="${bx+30+Math.sin(t*1.3)*14}" cy="${by+20}" rx="${(70-18*Math.sin(t*2)).toFixed(0)}" ry="${(ry*.7).toFixed(0)}" fill="#050202"/><circle cx="${bx-60}" cy="${by-90}" r="34" fill="#fff" fill-opacity=".8"/>`}
  for(let i=0;i<26;i++){const a=rn(i)*6.28,r=(t-EV.wallburst)*(700+rn(i+9)*900);s+=`<rect x="${(bx+Math.cos(a)*r).toFixed(0)}" y="${(by+Math.sin(a)*r+r*r*.0007).toFixed(0)}" width="${28+rn(i+3)*40}" height="${20+rn(i+5)*30}" fill="#3a2a24" fill-opacity="${(1-clamp((t-EV.wallburst)/2)).toFixed(2)}" transform="rotate(${(t*200*rn(i)).toFixed(0)} ${(bx+Math.cos(a)*r).toFixed(0)} ${(by+Math.sin(a)*r).toFixed(0)})"/>`}}
 return s}
// ---------- falling dust (in world, over everything but under darkness)
export function dust(t,cx,cy,q){let s='';const n=40+Math.round(q*60);for(let i=0;i<n;i++){const x=-300+rn(i)*3200,y=((rn(i+5)*2400+t*(80+rn(i+2)*140+q*300))%2400)-300;s+=`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(3+rn(i+8)*5).toFixed(1)}" height="${(3+rn(i+8)*5).toFixed(1)}" fill="#cbbfae" fill-opacity="${(.18+rn(i+4)*.3).toFixed(2)}"/>`}return s}
// ---------- creature
export function creature(x,y,sc,ph,rot=0,squash=0){const lg=(i,side)=>{const a=ph+i*1.1+(side>0?0:Math.PI);const up=Math.max(0,Math.sin(a))*22;const bx=side*(40+i*14),by=-6+i*8;const k=[bx,by],m=[side*(120+i*10),by-40-up],e=[side*(190+i*6),by+26-up*.4];return `<path d="M${k[0]},${k[1]} L${m[0]},${m[1]} L${e[0]},${e[1]}" stroke="#0b090c" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M${k[0]},${k[1]} L${m[0]},${m[1]} L${e[0]},${e[1]}" stroke="#34202a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`};
 let l='';for(let i=0;i<4;i++){l+=lg(i,1)+lg(i,-1)}
 return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc},${sc*(1-squash*.7)})">${l}<ellipse cx="0" cy="0" rx="82" ry="52" fill="#120d11" stroke="#3c2631" stroke-width="5"/><ellipse cx="0" cy="-10" rx="62" ry="30" fill="#241820"/><path d="M-50,-24 Q0,-52 50,-24" stroke="#4a3140" stroke-width="5" fill="none"/><path d="M-30,16 Q0,34 30,16 L22,42 Q0,50 -22,42Z" fill="#c9a89a" stroke="#120d11" stroke-width="4"/><path d="M-14,40 L-8,60 M0,42 L0,64 M14,40 L8,60" stroke="#e8d6cc" stroke-width="4" stroke-linecap="round"/><circle cx="-26" cy="-4" r="9" fill="#ff5a7a"/><circle cx="26" cy="-4" r="9" fill="#ff5a7a"/><circle cx="-26" cy="-4" r="3" fill="#220008"/><circle cx="26" cy="-4" r="3" fill="#220008"/></g>`}
// neighbours rushing past (silhouettes)
export function rushers(t,cx,cy){if(t<EV.rush-.5||t>EV.rush+3.5)return'';const u=(t-EV.rush+.5)/4;let s='';for(let i=0;i<5;i++){const x=3400-u*5200-i*260,y=1500-(i%2)*30;s+=`<g transform="translate(${x.toFixed(0)},${y})"><ellipse cx="0" cy="10" rx="80" ry="14" fill="#000" fill-opacity=".4"/><rect x="-30" y="-330" width="60" height="330" rx="26" fill="#05060a"/><circle cx="0" cy="-390" r="42" fill="#05060a"/><path d="M-28,-300 L-80,-${200+Math.sin(t*20+i)*40} M28,-300 L80,-${240+Math.cos(t*20+i)*40}" stroke="#05060a" stroke-width="22" stroke-linecap="round"/></g>`}return s}
export function stairBlur(t){return''}
