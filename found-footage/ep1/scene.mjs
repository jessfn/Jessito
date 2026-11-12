export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
export const lerp=(a,b,t)=>a+(b-a)*t;
function rng(seed){let s=seed>>>0;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296}
const R=rng(11);
// ---- timeline constants
export const T_BLACKOUT=67.0;
export function cityPower(x,t){const off=T_BLACKOUT+0.25+((x+600)/4200)*3.6;return t<off?1:0}
// ---- skyline generation
function buildings(seed,x0,x1,wmin,wmax,hmin,hmax,base){const r=rng(seed);const out=[];let x=x0;while(x<x1){const w=wmin+r()*(wmax-wmin),h=hmin+r()*(hmax-hmin);out.push({x,w,h,base,ant:r()<.35,tone:r()});x+=w+ r()*14}return out}
function windows(bs,seed,ww,wh,gx,gy,warm){const r=rng(seed);const out=[];bs.forEach((b,bi)=>{for(let yy=b.base-b.h+24;yy<b.base-18;yy+=gy)for(let xx=b.x+10;xx<b.x+b.w-ww-8;xx+=gx){if(r()<.55)out.push({x:xx,y:yy,bi,w:ww,h:wh,c:warm[Math.floor(r()*warm.length)],off:r()*.5})}});return out}
const FAR=buildings(5,-900,4000,70,190,260,720,1320);
const FARW=windows(FAR,6,6,9,17,24,['#ffd89a','#ffe9b8','#9fd0ff','#ffc27a']);
const MID=buildings(9,-700,3800,120,280,420,980,1420);
const MIDW=windows(MID,10,12,17,30,40,['#ffd48a','#fff0c8','#a9d8ff','#ffb870']);
export const COLLAPSE_X=1500;
MID.forEach(b=>{if(b.x<COLLAPSE_X&&b.x+b.w>COLLAPSE_X-40){b.collapse=true}});
const STARS=Array.from({length:170},()=>({x:-800+R()*4600,y:-900+R()*1700,r:.8+R()*2.2,a:.3+R()*.7}));
export const defsScene=`<defs>
<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="-1400" x2="0" y2="1420"><stop offset="0" stop-color="#050913"/><stop offset=".55" stop-color="#121a38"/><stop offset=".85" stop-color="#2c2748"/><stop offset="1" stop-color="#4a3350"/></linearGradient>
<radialGradient id="glowO"><stop offset="0" stop-color="#ff8a3a" stop-opacity=".9"/><stop offset=".5" stop-color="#ff5a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="glowW"><stop offset="0" stop-color="#fff2c0" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<radialGradient id="moon"><stop offset="0" stop-color="#eef2ff" stop-opacity="1"/><stop offset=".25" stop-color="#cdd8ff" stop-opacity=".55"/><stop offset="1" stop-color="#8fa6ff" stop-opacity="0"/></radialGradient>
<radialGradient id="smoke"><stop offset="0" stop-color="#1a1416" stop-opacity=".95"/><stop offset="1" stop-color="#1a1416" stop-opacity="0"/></radialGradient>
<linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="1470" x2="0" y2="2800"><stop offset="0" stop-color="#2b2f38"/><stop offset="1" stop-color="#14171d"/></linearGradient>
<linearGradient id="wall" gradientUnits="userSpaceOnUse" x1="0" y1="1280" x2="0" y2="1490"><stop offset="0" stop-color="#3a3f4a"/><stop offset="1" stop-color="#2a2e37"/></linearGradient>
</defs>`;
const par=(f,cx,cy)=>`translate(${(cx*(1-f)).toFixed(1)},${((cy-1000)*(1-f)).toFixed(1)})`;
function bldgPath(b,col,edge){return `<rect x="${b.x.toFixed(0)}" y="${b.base-b.h}" width="${b.w.toFixed(0)}" height="${b.h+400}" fill="${col}" stroke="${edge}" stroke-width="2"/>`+(b.ant?`<path d="M${(b.x+b.w/2).toFixed(0)},${b.base-b.h} v-90" stroke="${edge}" stroke-width="3"/>`:'')}
const farStatic=FAR.map(b=>bldgPath(b,'#0d1124','#1a2040')).join('');
const midStatic=MID.filter(b=>!b.collapse).map(b=>bldgPath(b,'#0a0d1a','#161c36')).join('');
function winStr(ws,bs,t,static_,dim){let s='';for(const w of ws){const b=bs[w.bi];const cx=b.x+b.w/2;if(!static_&&t>=T_BLACKOUT&&cityPower(cx,t+w.off*0)===0&&(t>T_BLACKOUT+0.25+((cx+600)/4200)*3.6+w.off))continue;s+=`<rect x="${w.x.toFixed(0)}" y="${w.y}" width="${w.w}" height="${w.h}" fill="${w.c}" opacity="${dim}"/>`}return s}
const cache={};
function winCached(key,ws,bs,t,dim){if(t<T_BLACKOUT)return cache[key+'on']??(cache[key+'on']=winStr(ws,bs,0,true,dim));if(t>T_BLACKOUT+5)return '';return winStr(ws,bs,t,false,dim)}
// ---- items
export function stars(t,cx,cy){const dark=t>=T_BLACKOUT?clamp((t-T_BLACKOUT-1)/4):0;let s='';for(const st of STARS)s+=`<circle cx="${st.x.toFixed(0)}" cy="${st.y.toFixed(0)}" r="${st.r.toFixed(1)}" fill="#fff" opacity="${(st.a*(.25+.75*dark)).toFixed(2)}"/>`;return `<g transform="${par(.04,cx,cy)}">${s}</g>`}
export function giantLeg(t,fx){const sway=Math.sin(t*1.7)*6;const lift=Math.max(0,Math.sin(t*.9))*70;
 const p=`M-100,1340 L-140,1290 L-70,1245 L-55,900 L-120,700 L-70,620 L-80,-2600 L100,-2600 L80,620 L140,720 L80,900 L90,1245 L170,1290 L140,1340Z`;
 return `<g transform="translate(${fx.toFixed(0)},${(-lift*.3).toFixed(0)}) rotate(${(sway*.05).toFixed(2)} 0 1340)"><path d="${p}" fill="#06070d"/><path d="M80,620 L140,720 L80,900 L90,1245 L170,1290 L140,1340" fill="none" stroke="#ff6a2a" stroke-opacity=".55" stroke-width="5"/><path d="M-80,-2600 L-70,620" stroke="#ff6a2a" stroke-opacity=".25" stroke-width="4"/><ellipse cx="20" cy="1330" rx="330" ry="60" fill="url(#smoke)"/></g>`}
export function backdrop(t,cx,cy,opt={}){
 const fire1=t>80.4?sm((t-80.4)/3):0,fire2=t>92.1?sm((t-92.1)/3):0;
 const fl=1+.12*Math.sin(t*17)+.08*Math.sin(t*29);
 let s=`<rect x="-3500" y="-3000" width="9000" height="4420" fill="url(#sky)"/>`;
 const cglow=t<T_BLACKOUT?1:clamp(1-(t-T_BLACKOUT)/4);
 s+=`<g opacity="${(.55*cglow).toFixed(2)}"><ellipse cx="1300" cy="1330" rx="2600" ry="420" fill="url(#glowO)"/></g>`;
 s+=stars(t,cx,cy);
 s+=`<g transform="${par(.05,cx,cy)}"><circle cx="2300" cy="260" r="260" fill="url(#moon)"/><circle cx="2300" cy="260" r="64" fill="#eef2ff"/><circle cx="2284" cy="246" r="12" fill="#cfd8f5" opacity=".6"/><circle cx="2318" cy="276" r="9" fill="#cfd8f5" opacity=".5"/></g>`;
 s+=`<g transform="${par(.15,cx,cy)}">${farStatic}${winCached('far',FARW,FAR,t,.7)}</g>`;
 if(t>=98){const x=lerp(3100,1200,sm((t-98)/26));s+=`<g transform="${par(.2,cx,cy)}">${giantLeg(t,x)}</g>`}
 // fires and smoke (far)
 if(fire1>0)s+=`<g transform="${par(.25,cx,cy)}"><ellipse cx="2350" cy="1180" rx="${(520*fire1*fl).toFixed(0)}" ry="${(420*fire1*fl).toFixed(0)}" fill="url(#glowO)"/><ellipse cx="2350" cy="800" rx="${(300*fire1).toFixed(0)}" ry="${(520*fire1).toFixed(0)}" fill="url(#smoke)" opacity=".8"/></g>`;
 s+=`<g transform="${par(.35,cx,cy)}">${midStatic}${winCached('mid',MIDW,MID,t,.85)}`;
 MID.filter(b=>b.ant).forEach(b=>{const on=Math.floor(t*1.2+b.x)%2===0;s+=`<circle cx="${(b.x+b.w/2).toFixed(0)}" cy="${b.base-b.h-92}" r="7" fill="#ff2a2a" opacity="${on?.95:.15}"/>`});
 // collapsing building
 const cb=MID.find(b=>b.collapse);if(cb){const tc=clamp((t-116)/4.5);const ang=sm(tc)*34,dy=tc*tc*380;const bx=cb.x+cb.w/2;
  s+=`<g transform="translate(${bx.toFixed(0)},${(cb.base+dy).toFixed(0)}) rotate(${ang.toFixed(1)}) translate(${-bx.toFixed(0)},${-cb.base})">${bldgPath(cb,'#0a0d1a','#161c36')}</g>`;
  if(t>115.6){s+=`<ellipse cx="${bx}" cy="${cb.base-60}" rx="${(260+tc*900).toFixed(0)}" ry="${(160+tc*520).toFixed(0)}" fill="#b7a58f" opacity="${(sm((t-115.6)/2)*.7).toFixed(2)}"/>`}}
 if(fire2>0)s+=`<ellipse cx="1050" cy="1180" rx="${(420*fire2*fl).toFixed(0)}" ry="${(340*fire2*fl).toFixed(0)}" fill="url(#glowO)"/>`;
 s+=`</g>`;
 return s}
export function rooftop(t,cx,cy,quake){
 const on=t<T_BLACKOUT||(t>T_BLACKOUT+.25&&t<T_BLACKOUT+.4);
 const pulse=t<T_BLACKOUT?1+.06*Math.sin(t*Math.PI*3.93):1;
 let s='';
 // wall + floor
 s+=`<rect x="-3500" y="1280" width="9000" height="210" fill="url(#wall)"/><rect x="-3500" y="1270" width="9000" height="22" fill="#4a505c"/><rect x="-3500" y="1490" width="9000" height="1400" fill="url(#floor)"/>`;
 for(let x=-3000;x<5000;x+=260)s+=`<path d="M${x},1490 L${x-(x-1300)*.5},2800" stroke="#0d1015" stroke-width="3" opacity=".6"/>`;
 for(let y=1560;y<2800;y+=90+((y-1560)*.12))s+=`<path d="M-3500,${y} L6000,${y}" stroke="#0d1015" stroke-width="2.4" opacity=".5"/>`;
 // pillars + string lights
 const posts=[300,1100,1900,2700];
 posts.forEach(x=>s+=`<rect x="${x-7}" y="640" width="14" height="840" fill="#20242c"/><circle cx="${x}" cy="640" r="12" fill="#2d323c"/>`);
 let bulbs='';
 for(let i=0;i<posts.length-1;i++){const a=posts[i],b=posts[i+1];s+=`<path d="M${a},650 Q${(a+b)/2},${760} ${b},650" stroke="#15181e" stroke-width="3" fill="none"/>`;for(let k=1;k<=9;k++){const u=k/10;const bx=lerp(a,b,u),by=650+4*(u-u*u)*110;const fl=on?pulse:0;bulbs+=`<circle cx="${bx.toFixed(0)}" cy="${(by+14).toFixed(0)}" r="9" fill="${on?'#ffe7a8':'#2a2418'}"/>`+(on?`<circle cx="${bx.toFixed(0)}" cy="${(by+14).toFixed(0)}" r="${(46*fl).toFixed(0)}" fill="url(#glowW)" opacity=".75"/>`:'')}}
 s+=bulbs;
 // banner
 s+=`<g transform="rotate(${(Math.sin(t*2)*.4+quake*Math.sin(t*40)*1.2).toFixed(2)} 700 760)"><path d="M300,770 Q700,830 1100,770 L1100,930 Q700,990 300,930Z" fill="#d94f5a" stroke="#1a0f12" stroke-width="5"/><text x="700" y="896" text-anchor="middle" font-family="Inter" font-weight="900" font-size="82" fill="#fff4e0" stroke="#3a1015" stroke-width="2">ADIÓS DIEGO</text></g>`;
 // speakers
 [[120,pulse],[2500,pulse]].forEach(([x,p])=>{s+=`<rect x="${x-80}" y="1130" width="160" height="350" rx="12" fill="#14161b" stroke="#07080b" stroke-width="5"/><circle cx="${x}" cy="1220" r="${(30*(t<T_BLACKOUT?p:1)).toFixed(0)}" fill="#22252d" stroke="#07080b" stroke-width="4"/><circle cx="${x}" cy="1360" r="${(58*(t<T_BLACKOUT?p:1)).toFixed(0)}" fill="#1c1f26" stroke="#07080b" stroke-width="5"/><circle cx="${x}" cy="1360" r="18" fill="#2c3038"/>`;if(on)s+=`<circle cx="${x+54}" cy="1160" r="6" fill="#ff3b3b"/>`});
 // table with cake
 const tq=quake*Math.sin(t*55)*3;
 s+=`<g transform="translate(0,${tq.toFixed(1)})"><rect x="1780" y="1330" width="520" height="30" fill="#c9b79a" stroke="#1a1410" stroke-width="5"/><rect x="1800" y="1360" width="22" height="130" fill="#6b5a45"/><rect x="2258" y="1360" width="22" height="130" fill="#6b5a45"/>
 <rect x="1850" y="1250" width="170" height="80" rx="10" fill="#f4e6d2" stroke="#1a1410" stroke-width="5"/><rect x="1850" y="1250" width="170" height="26" rx="10" fill="#e87aa0" stroke="#1a1410" stroke-width="3"/>`;
 for(let i=0;i<5;i++){const x=1870+i*32;s+=`<rect x="${x}" y="1218" width="9" height="32" fill="#7ac7e8" stroke="#1a1410" stroke-width="2"/>`+(t<66&&t>47?`<ellipse cx="${x+4.5}" cy="1208" rx="6" ry="${(11+3*Math.sin(t*19+i)).toFixed(1)}" fill="#ffb02a"/><circle cx="${x+4.5}" cy="1206" r="26" fill="url(#glowW)" opacity=".6"/>`:'')}
 const cupsLeft=t<94;
 [2070,2120,2170].forEach((x,i)=>{if(cupsLeft||i===1)s+=`<path d="M${x},1290 l-12,0 l4,40 l16,0 l4,-40z" fill="#c8323c" stroke="#1a1410" stroke-width="3" transform="${!cupsLeft?'translate(60,170) rotate(80)':''}"/>`});
 s+=`<path d="M2215,1330 v-56 q0,-8 6,-8 h20 q6,0 6,8 v56z" fill="#2f7d3f" stroke="#1a1410" stroke-width="3" transform="${!cupsLeft?'translate(40,150) rotate(90 2234 1330)':''}"/><path d="M2224,1266 v-30 h20 v30" fill="#2f7d3f" stroke="#1a1410" stroke-width="3" transform="${!cupsLeft?'translate(40,150) rotate(90 2234 1330)':''}"/></g>`;
 // water in cup ripples handled by quake offset; chairs
 [[2400,1400],[-200,1400]].forEach(([x,y])=>{s+=`<path d="M${x},${y} h70 v80 h-70z M${x},${y+80} v70 M${x+70},${y+80} v70 M${x},${y} v-100 h70 v100" fill="#e8e1d1" stroke="#1a1410" stroke-width="4"/>`});
 // water tank
 s+=`<rect x="2820" y="900" width="160" height="380" rx="20" fill="#3a3f4c" stroke="#15181e" stroke-width="5"/><path d="M2840,1280 v200 M2960,1280 v200" stroke="#15181e" stroke-width="10"/>`;
 return s}
