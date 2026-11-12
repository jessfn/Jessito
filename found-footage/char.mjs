let _u=0;const uid=()=>'u'+(_u++);
const f=n=>n.toFixed(1);
// ---------- STYLES ----------
const S={
1:{name:'OPCIÓN 1 · Semi-realista pintado',sub:'Proporciones reales (7.5 cabezas), luz y volumen, piel con sombreado, rasgos detallados',
 skin:'#e3ae8e',skin2:'#b57858',ol:'#1a110d',ow:1.6,hood:'#6e2f2f',hood2:'#4b1f20',pants:'#2b3442',shoe:'#d9d4c8',sole:'#8c867a',hair:'#3b281c',hair2:'#6a4a35',
 shade:'grad',hs:1.0,face:{path:'M-42,-8 Q-45,-54 0,-55 Q45,-54 42,-8 Q41,30 16,49 Q0,57 -16,49 Q-41,30 -42,-8Z',eyeX:18,eyeY:-6,eyeW:12,eyeH:6.5,iris:6,browY:-22,brow:3.4,noseY:14,mouthY:33,ear:[43,2],kind:'real',wr:true,hairBack:'M-48,-6 Q-58,-62 0,-68 Q58,-62 48,-6 Q54,30 42,50 Q34,22 31,-2 L-31,-2 Q-34,22 -42,50 Q-54,30 -48,-6Z',hairFront:'M-46,-10 Q-52,-64 0,-65 Q52,-64 46,-12 Q42,-38 20,-40 Q10,-22 -4,-34 Q-20,-30 -30,-17 Q-38,-12 -46,-10Z',hairLines:['M-30,-48 Q-10,-56 12,-52','M-38,-34 Q-18,-46 4,-42','M10,-48 Q28,-46 38,-36','M-22,-30 Q-14,-22 -8,-34']}},
2:{name:'OPCIÓN 2 · Estilizado vectorial grueso',sub:'Cabeza grande (5 cabezas), contorno grueso, formas simples, muy expresivo y fácil de animar',
 skin:'#f0b998',skin2:'#d98f6e',ol:'#150f0c',ow:4.2,hood:'#2f7a8c',hood2:'#215a68',pants:'#3a3f5c',shoe:'#f2efe6',sole:'#5a5a6a',hair:'#5a3825',hair2:'#7a5238',
 shade:'flat',hs:1.4,face:{path:'M-50,-6 Q-52,-52 0,-53 Q52,-52 50,-6 Q50,40 0,52 Q-50,40 -50,-6Z',eyeX:20,eyeY:-4,eyeW:13,eyeH:11,iris:7,browY:-24,brow:6,noseY:14,mouthY:32,ear:[51,2],kind:'toon',wr:false,hairBack:'M-54,0 Q-60,20 -54,32 L-46,10Z M54,0 Q60,20 54,32 L46,10Z',hairFront:'M-54,-18 Q-56,-78 0,-80 Q56,-78 54,-18 L54,-26 Q30,-34 0,-30 Q-30,-34 -54,-26Z',hairLines:[],beanie:true}},
3:{name:'OPCIÓN 3 · Anime / cel-shade',sub:'Ojos grandes, sombra dura de dos tonos, pelo con brillos, la que más comunica con la mirada',
 skin:'#f9d4bc',skin2:'#e5a98f',ol:'#2b1a2d',ow:2.2,hood:'#8d3b55',hood2:'#6a2a42',pants:'#2a2c4a',shoe:'#f4eef0',sole:'#7a6a8a',hair:'#2f2757',hair2:'#5a4aa0',
 shade:'cel',hs:1.08,face:{path:'M-40,-8 Q-43,-50 0,-52 Q43,-50 40,-8 Q38,32 12,52 Q0,60 -12,52 Q-38,32 -40,-8Z',eyeX:18,eyeY:2,eyeW:15,eyeH:15,iris:11,browY:-22,brow:3,noseY:20,mouthY:38,ear:[41,6],kind:'anime',wr:false,hairBack:'M-52,0 Q-62,-60 0,-68 Q62,-60 52,0 Q58,40 48,66 L32,58 L-32,58 L-48,66 Q-58,40 -52,0Z',hairFront:'M-50,-8 Q-54,-64 0,-68 Q54,-64 50,-8 Q44,-36 30,-32 Q26,-12 10,-30 Q0,-12 -10,-28 Q-24,-12 -32,-30 Q-44,-28 -50,-8Z',hairLines:['M-34,-50 Q-14,-60 6,-56','M14,-58 Q34,-52 42,-38'],pin:true}}};
// ---------- primitives ----------

let CTM=[1,0,0,1,0,0];const CW=1080,CH=1920;
export const setCTM=m=>{CTM=m};export const getCTM=()=>CTM;
export const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
export const T=(tx,ty,rotDeg=0,sx=1,sy=1)=>{const r=rotDeg*Math.PI/180,co=Math.cos(r),si=Math.sin(r);return[co*sx,si*sx,-si*sy,co*sy,tx,ty]};
export function withT(m,fn){const old=CTM;CTM=mul(old,m);try{return fn()}finally{CTM=old}}
export function visibleBB(x0,y0,x1,y1,margin=8){const pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>[CTM[0]*x+CTM[2]*y+CTM[4],CTM[1]*x+CTM[3]*y+CTM[5]]);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return Math.max(...xs)>-margin&&Math.min(...xs)<CW+margin&&Math.max(...ys)>-margin&&Math.min(...ys)<CH+margin}
function shapesBB(sh){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const up=(x,y)=>{if(isNaN(x)||isNaN(y))return;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)};
 for(const m of sh.matchAll(/<polygon points="([^"]+)"/g))m[1].trim().split(/\s+/).forEach(p=>{const [x,y]=p.split(',').map(Number);up(x,y)});
 for(const m of sh.matchAll(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)){const cx=+m[1],cy=+m[2],r=+m[3];up(cx-r,cy-r);up(cx+r,cy+r)}
 for(const m of sh.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)){up(+m[1],+m[2]);up(+m[1]+ +m[3],+m[2]+ +m[4])}
 for(const m of sh.matchAll(/<ellipse cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/g)){const R=Math.max(+m[3],+m[4]);up(+m[1]-R,+m[2]-R);up(+m[1]+R,+m[2]+R)}
 for(const m of sh.matchAll(/<path d="([^"]+)"/g)){const n=(m[1].match(/-?[0-9.]+/g)||[]).map(Number);for(let i=0;i+1<n.length;i+=2)up(n[i],n[i+1])}
 return[x0,y0,x1,y1]}
function limb(a,b,w1,w2){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
 const p=[[a[0]+nx*w1/2,a[1]+ny*w1/2],[b[0]+nx*w2/2,b[1]+ny*w2/2],[b[0]-nx*w2/2,b[1]-ny*w2/2],[a[0]-nx*w1/2,a[1]-ny*w1/2]];
 return `<polygon points="${p.map(q=>f(q[0])+','+f(q[1])).join(' ')}"/><circle cx="${f(a[0])}" cy="${f(a[1])}" r="${f(w1/2)}"/><circle cx="${f(b[0])}" cy="${f(b[1])}" r="${f(w2/2)}"/>`}
function grp(shapes,fill,st,bb,opts={}){const id=uid();const ow=opts.ow??st.ow;{const b=shapesBB(shapes);if(b[0]<1e8&&!visibleBB(b[0]-ow-14,b[1]-ow-14,b[2]+ow+14,b[3]+ow+14,2))return''}
 let s=`<g stroke="${st.ol}" stroke-width="${f(2*ow)}" stroke-linejoin="round" fill="${st.ol}">${shapes}</g><g fill="${fill}">${shapes}</g>`;
 if(st.shade==='flat'&&!opts.noShade){const i2=uid();s+=`<clipPath id="${i2}">${shapes}</clipPath><g clip-path="url(#${i2})"><rect x="${bb[0]}" y="${bb[1]}" width="${bb[2]}" height="${bb[3]}" fill="#1a0f2a" opacity=".30"/><g fill="${fill}" transform="translate(-${opts.sd??5},-${(opts.sd??5)*.8})">${shapes}</g></g>`}
 if(st.shade!=='flat'&&!opts.noShade){s+=`<clipPath id="${id}">${shapes}</clipPath><rect x="${bb[0]}" y="${bb[1]}" width="${bb[2]}" height="${bb[3]}" fill="url(#sh_${st.k})" clip-path="url(#${id})"/>`}
 return s}
function bbox(pts,m=30){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const x0=Math.min(...xs)-m,y0=Math.min(...ys)-m;return[x0,y0,Math.max(...xs)+m-x0,Math.max(...ys)+m-y0]}
const defs=st=>`<defs>
<linearGradient id="sh_${st.k}" x1="0" y1="0" x2="1" y2="0">${st.shade==='grad'?'<stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>':'<stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset=".72" stop-color="#201040" stop-opacity=".28"/><stop offset="1" stop-color="#201040" stop-opacity=".28"/>'}</linearGradient>
<clipPath id="face_${st.k}"><path d="${st.face.path}"/></clipPath>
<linearGradient id="beamg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8ecff" stop-opacity=".5"/><stop offset="1" stop-color="#d8ecff" stop-opacity="0"/></linearGradient></defs>`;
// ---------- hand ----------
function handSpec(pose){const open=pose==='open';const c=open?[3,5,5]:[10,18,14];
 const F=(y,len,w,ang,k)=>({base:[44,y],a:ang,segs:len,w:w,curl:c.map(v=>v*k)});
 return{palm:[[0,-12],[8,-17],[44,-19],[46,19],[10,15],[0,12]],
 fingers:[F(-14.5,[17,12,9.5],[10,9.2,8],-7,1),F(-5,[19,13,10],[10.5,9.5,8.2],-1,1.05),F(5,[17,12,9.5],[10,9.2,8],5,1.1),F(14.5,[13,9,7.5],[9,8.2,7.2],11,1.25)],
 thumb:{base:[12,-14],a:open?-48:-35,segs:[21,15],w:[12.5,10.5],curl:open?[-4,-8]:[-10,-14]}}}
function chain(fg){const pts=[fg.base.slice()];let a=fg.a;let p=fg.base.slice();fg.segs.forEach((l,i)=>{a+=fg.curl[i]||0;const r=a*Math.PI/180;p=[p[0]+Math.cos(r)*l,p[1]+Math.sin(r)*l];pts.push(p.slice())});return pts}
function handSkin(pose,st){const H=handSpec(pose);let sh='';
 const pp=H.palm.map(p=>p.join(',')).join(' ');sh+=`<polygon points="${pp}"/><ellipse cx="16" cy="-8" rx="17" ry="11" transform="rotate(-25 16 -8)"/><circle cx="44" cy="-14.5" r="6"/><circle cx="44" cy="-5" r="6.2"/><circle cx="44" cy="5" r="6"/><circle cx="44" cy="14.5" r="5.4"/>`;
 const fl=[H.thumb,...H.fingers];fl.forEach(fg=>{const ch=chain(fg);for(let i=0;i<ch.length-1;i++)sh+=limb(ch[i],ch[i+1],fg.w[i]??fg.w[fg.w.length-1],fg.w[i+1]??fg.w[fg.w.length-1]*.9)});
 let s=grp(sh,st.skin,st,[-10,-40,80,80],{noShade:false,sd:2.2});s+=`<path d="M10,-2 Q22,6 38,2 M12,6 Q24,12 38,10" stroke="${st.skin2}" stroke-width="1.1" fill="none" opacity=".8" stroke-linecap="round"/><path d="M18,-14 Q24,-6 22,4" stroke="${st.skin2}" stroke-width="1" fill="none" opacity=".7"/>`;
 // nails + knuckles
 fl.forEach(fg=>{const ch=chain(fg);const e=ch[ch.length-1],pv=ch[ch.length-2];const ang=Math.atan2(e[1]-pv[1],e[0]-pv[0])*180/Math.PI;
  if(true)s+=`<g transform="translate(${f(e[0])},${f(e[1])}) rotate(${f(ang)})"><rect x="-6.4" y="-3.2" width="5.6" height="6.4" rx="2.4" fill="${st.k==3?'#ffc7d0':'#f6d3c4'}" stroke="${st.ol}" stroke-width=".7" opacity=".9"/></g>`;
  for(let i=1;i<ch.length-1;i++){const q=ch[i];s+=`<path d="M${f(q[0]-1)},${f(q[1]-4)} q2,4 0,8" stroke="${st.k==2?st.ol:st.skin2}" stroke-width="${st.k==2?1.1:1}" fill="none" opacity=".75"/>`}});
 return s}
function handSkel(pose,col){const H=handSpec(pose);let s='';const fl=[H.thumb,...H.fingers];
 fl.forEach(fg=>{const ch=chain(fg);const b0=fg===H.thumb?[6,-8]:[5,fg.base[1]*.55];
  s+=`<line x1="${b0[0]}" y1="${b0[1]}" x2="${ch[0][0]}" y2="${ch[0][1]}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`;
  for(let i=0;i<ch.length-1;i++)s+=`<line x1="${f(ch[i][0])}" y1="${f(ch[i][1])}" x2="${f(ch[i+1][0])}" y2="${f(ch[i+1][1])}" stroke="${col}" stroke-width="${i==0?5:4}" stroke-linecap="round"/>`;
  ch.forEach(q=>s+=`<circle cx="${f(q[0])}" cy="${f(q[1])}" r="3.3" fill="#fff" stroke="#6e6a58" stroke-width="1"/>`)});
 [[2,-6],[2,6],[10,-8],[10,8],[16,0]].forEach(q=>s+=`<rect x="${q[0]-4}" y="${q[1]-4}" width="8" height="8" rx="2.5" fill="${col}" stroke="#6e6a58" stroke-width="1"/>`);
 return s}
const hand=(w,deg,sc,side,inner)=>`<g transform="translate(${w[0]},${w[1]}) rotate(${deg}) scale(${sc},${side*sc})">${inner}</g>`;
// flashlight grip (world coords, before rotation, wrist at 0,0, pointing up)
function grip(st,sk){const ol=st.ol,ow=st.ow;
 const cyl=`<rect x="-14" y="-92" width="28" height="86" rx="7" fill="#2a2e36" stroke="${ol}" stroke-width="${ow*1.6}"/><rect x="-18" y="-112" width="36" height="26" rx="5" fill="#4a505c" stroke="${ol}" stroke-width="${ow*1.6}"/><ellipse cx="0" cy="-112" rx="16" ry="4" fill="#fffbe0" stroke="${ol}" stroke-width="${ow}"/><rect x="-14" y="-66" width="28" height="4" fill="#111" opacity=".6"/>`;
 if(sk){return cyl.replace(/#2a2e36|#4a505c/g,'#1d2530')}
 const palm=grp(`<rect x="-20" y="-40" width="40" height="42" rx="12"/>`,st.skin,st,[-30,-50,60,60]);
 let fing='';for(let i=0;i<4;i++){const y=-44+i*10.5;const sh=`<rect x="-21" y="${y}" width="42" height="11.4" rx="5.4"/>`;fing+=grp(sh,st.skin,st,[-30,y-4,60,20],{noShade:true});}
 const th=grp(limb([-20,-10],[-4,-52],13,11),st.skin,st,[-30,-60,60,60],{noShade:true});
 return cyl+palm+fing+th}
function gripSkel(){let s=`<rect x="-14" y="-92" width="28" height="86" rx="7" fill="none" stroke="#5a6676" stroke-dasharray="3 3"/><rect x="-18" y="-112" width="36" height="26" rx="5" fill="none" stroke="#5a6676" stroke-dasharray="3 3"/>`;
 for(let i=0;i<4;i++){const y=-38+i*10.5;s+=`<path d="M-19,${y} Q-8,${y-4} 0,${y-1} Q8,${y-4} 19,${y}" stroke="#e8e2cf" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;[-19,-6,8,19].forEach(x=>s+=`<circle cx="${x}" cy="${y-(Math.abs(x)<10?2:0)}" r="3" fill="#fff" stroke="#6e6a58"/>`)}
 s+=`<path d="M-20,-10 L-4,-52" stroke="#e8e2cf" stroke-width="6" stroke-linecap="round"/><circle cx="-4" cy="-52" r="3.2" fill="#fff" stroke="#6e6a58"/>`;return s}

function gripV2(st,prop='flash'){const ol=st.ol,ow=st.ow;
 let cyl=`<rect x="-14" y="-92" width="28" height="86" rx="7" fill="#2a2e36" stroke="${ol}" stroke-width="${ow*1.6}"/><rect x="-18" y="-114" width="36" height="26" rx="5" fill="#4a505c" stroke="${ol}" stroke-width="${ow*1.6}"/><ellipse cx="0" cy="-114" rx="16" ry="4" fill="#fffbe0" stroke="${ol}" stroke-width="${ow}"/><rect x="-14" y="-68" width="28" height="4" fill="#111" opacity=".6"/><path d="M-9,-90 L-9,-10" stroke="#fff" stroke-width="2" opacity=".18"/>`;
 if(prop==='cup')cyl=`<path d="M-17,-76 L17,-76 L12,-6 L-12,-6Z" fill="#c8323c" stroke="${ol}" stroke-width="${ow*1.6}" stroke-linejoin="round"/><ellipse cx="0" cy="-76" rx="17" ry="4.5" fill="#6a1a20" stroke="${ol}" stroke-width="${ow}"/><path d="M-14,-56 L14,-56" stroke="#fff" stroke-width="2" opacity=".25"/>`;
 if(prop==='bottle')cyl=`<path d="M-14,-70 L14,-70 L14,-10 Q14,-6 10,-6 L-10,-6 Q-14,-6 -14,-10Z" fill="#2f7d3f" stroke="${ol}" stroke-width="${ow*1.6}" stroke-linejoin="round"/><path d="M-14,-70 Q-14,-84 -6,-92 L-6,-112 L6,-112 L6,-92 Q14,-84 14,-70" fill="#2f7d3f" stroke="${ol}" stroke-width="${ow*1.6}" stroke-linejoin="round"/><rect x="-7" y="-118" width="14" height="8" rx="2" fill="#d9c25a" stroke="${ol}" stroke-width="${ow}"/><rect x="-14" y="-52" width="28" height="22" fill="#eee6c8" opacity=".9"/><path d="M-8,-68 L-8,-12" stroke="#fff" stroke-width="2.4" opacity=".25"/>`;
 if(prop==='ext')cyl=`<path d="M-17,-84 L17,-84 L17,-12 Q17,-6 11,-6 L-11,-6 Q-17,-6 -17,-12Z" fill="#c4261e" stroke="${ol}" stroke-width="${ow*1.6}" stroke-linejoin="round"/><rect x="-9" y="-104" width="18" height="22" rx="4" fill="#2a2e36" stroke="${ol}" stroke-width="${ow*1.3}"/><path d="M-12,-110 L24,-118 L26,-108 L-6,-100Z" fill="#1a1d22" stroke="${ol}" stroke-width="${ow}"/><path d="M18,-106 Q40,-90 34,-60" stroke="#15171b" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="-17" y="-60" width="34" height="26" fill="#f0ece0"/><path d="M-12,-76 L-12,-14" stroke="#fff" stroke-width="2.4" opacity=".3"/>`;
 if(prop==='phone')cyl=`<rect x="-17" y="-74" width="34" height="68" rx="6" fill="#15181d" stroke="${ol}" stroke-width="${ow*1.4}"/><rect x="-14" y="-70" width="28" height="60" rx="3" fill="#9fd0ff"/><path d="M-10,-64 L6,-64" stroke="#fff" stroke-width="2" opacity=".6"/>`;
 let r=grp(`<rect x="-23" y="-50" width="46" height="56" rx="16"/>`,st.skin,st,[-30,-60,60,70],{sd:3});
 r+=cyl;
 const fin=[[-46,24,-17],[-35,25,-15],[-24,23,-13],[-13,21,-9]];
 fin.forEach(([y,x0,x1],i)=>{const w=[13.5,13,12,10.5][i];
  const pts=[[x0,y],[x0-(x0-x1)*.38,y+3],[x0-(x0-x1)*.72,y+4.2],[x1,y+1.2]];
  let sh='';for(let j=0;j<3;j++)sh+=limb(pts[j],pts[j+1],w*(1-j*.04),w*(1-(j+1)*.06));
  sh+=`<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="${w*.6}"/>`;
  r+=grp(sh,st.skin,st,[-30,y-12,64,30],{sd:2.4});
  r+=`<path d="M${pts[1][0]},${pts[1][1]-5} q2,5 0,10 M${pts[2][0]},${pts[2][1]-5} q2,5 0,10" stroke="${st.ol}" stroke-width="1.1" fill="none" opacity=".7"/>`;
  r+=`<g transform="translate(${pts[3][0]-1},${pts[3][1]-.5}) rotate(-8)"><rect x="-6" y="-3.6" width="6.4" height="7.2" rx="2.8" fill="#f9dccb" stroke="${ol}" stroke-width=".8"/></g>`;
  r+=`<circle cx="${pts[0][0]-2}" cy="${pts[0][1]-1}" r="2.2" fill="${st.skin2}" opacity=".7"/>`});
 const th=[[-24,2],[-27,-20],[-17,-42],[-8,-58]];
 let sh='';for(let j=0;j<3;j++)sh+=limb(th[j],th[j+1],[17,14.5,12][j],[14.5,12,10.5][j]);
 r+=grp(sh,st.skin,st,[-40,-70,50,90],{sd:2.6});
 r+=`<path d="M-30,-22 q6,3 12,0" stroke="${ol}" stroke-width="1.2" fill="none" opacity=".7"/><g transform="translate(-8,-56) rotate(-62)"><rect x="-7" y="-4" width="9" height="8" rx="3.2" fill="#f9dccb" stroke="${ol}" stroke-width=".9"/></g>`;
 return r}
function ik2(b,t,l1,l2,sg){let dx=t[0]-b[0],dy=t[1]-b[1];let d=Math.min(Math.hypot(dx,dy),l1+l2-0.01);const a=Math.atan2(dy,dx),c=Math.acos((l1*l1+d*d-l2*l2)/(2*l1*d));const t1=a+sg*c;const k=[b[0]+Math.cos(t1)*l1,b[1]+Math.sin(t1)*l1];const t2=Math.atan2(t[1]-k[1],t[0]-k[0]);return[b,k,[k[0]+Math.cos(t2)*l2,k[1]+Math.sin(t2)*l2]]}
function handProf(pose,st){const ol=st.ol;let r='';
 const spec=pose==='point'?{c:[[2,3,3],[62,78,50],[66,80,52],[68,82,54]],th:'tuck'}:pose==='pinch'?{c:[[34,40,28],[52,66,44],[58,70,46],[62,74,48]],th:'pinch'}:{c:[[6,10,8],[9,14,10],[12,17,12],[15,19,12]],th:'free'};
 const L=[[17,12,9.5],[19,13,10],[17,12,9.5],[13,9,7.5]],W=[[10,9.2,8],[10.5,9.5,8.2],[10,9.2,8],[9,8.2,7.2]].map(r=>r.map(v=>v*1.3));
 const base=[[44,-10],[44,-7],[44,-3.5],[43,0]];
 const chains=[];for(let i=0;i<4;i++){const pts=[base[i].slice()];let a=-4+i*2,p=base[i].slice();for(let j=0;j<3;j++){a+=spec.c[i][j];const q=a*Math.PI/180;p=[p[0]+Math.cos(q)*L[i][j],p[1]+Math.sin(q)*L[i][j]];pts.push(p.slice())}chains.push(pts)}
 let thp;const tb=[12,6];
 if(spec.th==='pinch'){thp=ik2(tb,chains[0][3],24,17,-1)}
 else if(spec.th==='tuck'){thp=[tb,[tb[0]+20,tb[1]+10],[tb[0]+30,tb[1]+24]]}
 else{thp=[tb,[tb[0]+19,tb[1]-12],[tb[0]+31,tb[1]-18]]}
 const palm=`<path d="M0,-10 Q18,-18 44,-13 L46,2 Q42,14 26,17 Q10,20 0,12Z"/><ellipse cx="17" cy="8" rx="17" ry="10"/>`;
 r+=grp(palm,st.skin,st,[-10,-30,70,60],{sd:2.5,ow:3});
 for(let i=3;i>=0;i--){const ch=chains[i];let sh='';for(let j=0;j<3;j++)sh+=limb(ch[j],ch[j+1],W[i][j],W[i][j+1]??W[i][j]*.9);
  r+=grp(sh,st.skin,st,[20,-30,60,80],{sd:2.2,ow:2.3});
  const e=ch[3],pv=ch[2],ang=Math.atan2(e[1]-pv[1],e[0]-pv[0])*180/Math.PI;
  r+=`<g transform="translate(${f(e[0])},${f(e[1])}) rotate(${f(ang)})"><rect x="-6.4" y="-3.4" width="5.8" height="6.6" rx="2.4" fill="#f9dccb" stroke="${ol}" stroke-width=".8"/></g>`;
  for(let j=1;j<3;j++){const q=ch[j];r+=`<path d="M${f(q[0]-2)},${f(q[1]-4)} q2,4 0,8" stroke="${ol}" stroke-width="1" fill="none" opacity=".6"/>`}}
 let sh2='';for(let j=0;j<2;j++)sh2+=limb(thp[j],thp[j+1],[13,11.5][j],[11.5,10][j]);
 r+=grp(sh2,st.skin,st,[0,-20,70,80],{sd:2.4,ow:2.6});
 const te=thp[2],tp=thp[1],ta=Math.atan2(te[1]-tp[1],te[0]-tp[0])*180/Math.PI;
 r+=`<g transform="translate(${f(te[0])},${f(te[1])}) rotate(${f(ta)})"><rect x="-7" y="-3.8" width="6.6" height="7.4" rx="2.6" fill="#f9dccb" stroke="${ol}" stroke-width=".8"/></g>`;
 if(spec.th==='pinch'){const k=chains[0][3];r+=`<g transform="translate(${f(k[0]+2)},${f(k[1]-1)}) rotate(20)"><rect x="-2" y="-2" width="34" height="4.5" rx="2" fill="#c9ccd2" stroke="${ol}" stroke-width="1.2"/><circle cx="36" cy="0" r="8" fill="none" stroke="#c9ccd2" stroke-width="4"/><circle cx="36" cy="0" r="10" fill="none" stroke="${ol}" stroke-width=".9"/><path d="M12,2 v6 M18,2 v4 M24,2 v7" stroke="#c9ccd2" stroke-width="3"/></g>`}
 return r}
// ---------- face ----------
const EX={neutral:{n:'Neutral',e:1,brow:[0,0],rot:0,pup:1,m:'neutral',look:[0,0]},
 fear:{n:'Miedo',e:1.35,brow:[-10,-3],rot:-3,pup:.65,m:'fear',look:[0,-1],sweat:1,wr:'fore'},
 surprise:{n:'Sorpresa',e:1.5,brow:[-11,-11],rot:0,pup:.75,m:'o',look:[0,0],wr:'fore'},
 anger:{n:'Enojo',e:.8,brow:[8,-5],rot:11,pup:1,m:'grit',look:[0,0],wr:'anger',flush:1},
 sad:{n:'Tristeza',e:.85,brow:[-8,3],rot:-9,pup:1.05,m:'sad',look:[0,2],tear:1},
 amused:{n:'Divertido',e:.8,brow:[-3,-2],rot:0,pup:1,m:'grin',look:[0,0]},
 laugh:{n:'Risa',e:.5,brow:[-4,-3],rot:0,pup:1,m:'laugh',look:[0,0],wr:'smile',flush:1},
 cryLaugh:{n:'Risa y llanto',e:.45,brow:[-5,0],rot:-3,pup:1,m:'laugh',look:[0,1],wr:'smile',flush:1,tear:1},
 smirk:{n:'Sarcasmo',e:.85,brow:[-1,3],rot:2,pup:1,m:'smirk',look:[0,0]},
 annoyed:{n:'Fastidio',e:.7,brow:[5,-1],rot:7,pup:1,m:'flat',look:[0,0],wr:'anger'},
 worry:{n:'Preocupación',e:1.1,brow:[-7,3],rot:-7,pup:.95,m:'wavy',look:[0,0]},
 tender:{n:'Ternura',e:.8,brow:[-3,1],rot:-3,pup:1.05,m:'soft',look:[0,1]},
 disbelief:{n:'Incredulidad',e:1.2,brow:[-6,-3],rot:0,pup:.9,m:'flat',look:[0,0]},
 shock:{n:'Shock',e:1.5,brow:[-11,-11],rot:0,pup:.6,m:'o',look:[0,0],wr:'fore'},
 scream:{n:'Grito',e:1.3,brow:[-9,-4],rot:-4,pup:.55,m:'scream',look:[0,0],sweat:1,wr:'fore'},
 smile:{n:'Sonrisa',e:.72,brow:[-2,-3],rot:0,pup:1,m:'smile',look:[0,0],wr:'smile',flush:1}};
function face(st,ex,op={}){const F=st.face,e=typeof ex==='string'?EX[ex]:ex,ol=st.ol,sk=st.skin;let s='';const bl=op.blink||0,tk=op.talk||0,lk=op.look||e.look||[0,0];const ow=st.ow*(st.k==2?1:.8);
 // back hair, ears
 if(!op.only)s+=`<path d="${F.hairBack}" fill="${st.hair}" stroke="${ol}" stroke-width="${f(ow*2)}" stroke-linejoin="round"/>`;
 if(!op.only)[-1,1].forEach(g=>s+=`<ellipse cx="${g*F.ear[0]}" cy="${F.ear[1]}" rx="7" ry="12" fill="${st.skin2==='x'?sk:sk}" stroke="${ol}" stroke-width="${f(ow*2)}"/>`);
 if(!op.only)s+=`<path d="${F.path}" fill="${sk}" stroke="${ol}" stroke-width="${f(ow*2.2)}" stroke-linejoin="round"/>`;
 // shading
 const fv=visibleBB(-64,-64,64,68,2);let sh0='';if(fv)sh0+=`<g clip-path="url(#face_${st.k})">`;
 if(!fv){}else if(st.shade==='grad')sh0+=`<rect x="-60" y="-60" width="120" height="125" fill="url(#sh_${st.k})"/><ellipse cx="0" cy="52" rx="30" ry="12" fill="#000" opacity=".12"/>`;
 else if(st.shade==='cel')sh0+=`<rect x="-60" y="-60" width="120" height="125" fill="url(#sh_${st.k})"/><path d="M-44,-20 Q-10,0 44,-18 L44,-60 L-44,-60Z" fill="#c07a8a" opacity=".16"/>`;
 else sh0+=`<path d="M30,-50 Q58,0 20,52 L60,60 L60,-60Z" fill="${st.skin2}" opacity=".45"/>`;
 if(fv)sh0+=`</g>`;if(!op.only)s+=sh0;
 // cheeks
 const ch=(e.flush?.5:.22);[-1,1].forEach(g=>s+=`<ellipse cx="${g*(F.eyeX+4)}" cy="${F.mouthY-9}" rx="10" ry="6" fill="#e0707a" opacity="${ch*(st.k==1?.8:1.3)}"/>`);
 // wrinkles
 if(F.wr){if(e.wr==='fore'){[-30,-35,-40].forEach((y,i)=>s+=`<path d="M${-22+i*2},${y-i} Q0,${y-4-i} ${22-i*2},${y-i}" stroke="#8a5a45" stroke-width="1.1" fill="none" opacity=".6"/>`)}
  if(e.wr==='anger'){[-4,4].forEach(x=>s+=`<path d="M${x},-30 l0,8" stroke="#7a4a38" stroke-width="1.3" opacity=".7"/>`);s+=`<path d="M-22,22 Q-17,30 -14,38M22,22 Q17,30 14,38" stroke="#8a5a45" stroke-width="1.2" fill="none" opacity=".6"/>`}
  if(e.wr==='smile'){s+=`<path d="M-24,22 Q-20,32 -18,37M24,22 Q20,32 18,37" stroke="#8a5a45" stroke-width="1.3" fill="none" opacity=".6"/>`}}
 // eyes
 [-1,1].forEach(g=>{const w=F.eyeW,h=F.eyeH*e.e*(1-bl*.93);const cx=g*F.eyeX,cy=F.eyeY;const rot=e.rot*(-g)*-1;
  const sad=e.n==='Tristeza'?1:0;
  s+=`<g transform="translate(${cx},${cy}) rotate(${f(-g*e.rot*-1*-1)})">`;
  const up=h*(F.kind==='anime'?1.0:1),lo=h*(e.n==='Sonrisa'?.15:.7)*(e.n==='Sonrisa'?1:1);
  const eyePath=`M${-w},0 Q0,${f(-2*up)} ${w},0 Q0,${f(e.n==='Sonrisa'?2*lo+8*.0:2*lo)} ${-w},0Z`;
  const cid=uid();const ev=withT(T(cx,cy,-g*e.rot),()=>visibleBB(-w-10,-2*up-10,w+10,2*lo+10,2));
  s+=(ev?`<clipPath id="${cid}"><path d="${eyePath}"/></clipPath>`:'')+`<path d="${eyePath}" fill="#f4f0ea" stroke="none"/>`;
  const ir=F.iris*(F.kind==='real'?1:1)*(e.n==='Miedo'?1.0:1),px=lk[0]*3.4,py=lk[1]*2.6;
  const sv=s;s='';s+=`<g clip-path="url(#${cid})">`;
  if(F.kind==='real'){s+=`<circle cx="${px}" cy="${py}" r="${ir}" fill="#6b4a2c"/><circle cx="${px}" cy="${py}" r="${ir*.62}" fill="#3a2514"/><circle cx="${px}" cy="${py}" r="${ir*.62*e.pup}" fill="#050403"/><circle cx="${px-2}" cy="${py-2}" r="1.8" fill="#fff"/><path d="M${-w},${-up*.2} Q0,${-2*up-3} ${w},${-up*.2} L${w},-20 L${-w},-20Z" fill="#000" opacity=".22"/>`}
  else if(F.kind==='toon'){s+=`<circle cx="${px*1.2}" cy="${py}" r="${ir*e.pup*1.05}" fill="#1a1210"/><circle cx="${px*1.2-2.2}" cy="${py-2.4}" r="2.4" fill="#fff"/>`}
  else{s+=`<ellipse cx="${px}" cy="${py+1}" rx="${ir}" ry="${ir*1.2}" fill="#7a4fd0"/><ellipse cx="${px}" cy="${py+5}" rx="${ir*.85}" ry="${ir*.6}" fill="#b08aff" opacity=".8"/><ellipse cx="${px}" cy="${py+1}" rx="${ir*.5*e.pup}" ry="${ir*.65*e.pup}" fill="#150a30"/><circle cx="${px-4}" cy="${py-4}" r="3.6" fill="#fff"/><circle cx="${px+4}" cy="${py+6}" r="1.8" fill="#fff"/>`}
  s+=`</g>`;if(ev)s=sv+s;else s=sv;
  s+=`<path d="M${-w},0 Q0,${f(-2*up)} ${w},0" stroke="${ol}" stroke-width="${f(F.kind==='toon'?4.2:F.kind==='anime'?4:2.6)}" fill="none" stroke-linecap="round"/>`;
  if(F.kind!=='toon')s+=`<path d="M${-w},0 Q0,${f(2*lo)} ${w},0" stroke="${ol}" stroke-width="1.1" fill="none" opacity=".7"/>`;
  if(F.kind==='real'||F.kind==='anime'||st.lashes){s+=`<path d="M${g*w},0 l${g*5},-3 M${g*(w-3)},${f(-up*.8)} l${g*5},-5" stroke="${ol}" stroke-width="1.6" stroke-linecap="round"/>`}
  if(e.n==='Sonrisa'&&F.kind!=='toon')s+=`<path d="M${-w},2 Q0,${f(2*lo+8)} ${w},2" stroke="${st.skin2}" stroke-width="1.2" fill="none" opacity=".7"/>`;
  s+=`</g>`;
  // brows
  const bi=F.browY+e.brow[0],bo=F.browY+e.brow[1]+(F.kind==='anime'?0:0);const x1=g*7,x2=g*(F.eyeX+15);
  const my=(bi+bo)/2-3.5;
  s+=`<path d="M${x1},${bi} Q${(x1+x2)/2},${my-1} ${x2},${bo}" stroke="${F.kind==='real'?st.hair:'#1c1210'}" stroke-width="${F.brow}" fill="none" stroke-linecap="round"/>`;
  if(F.kind==='real')s+=`<path d="M${x1},${bi} Q${(x1+x2)/2},${my-1} ${x2},${bo}" stroke="#000" stroke-width="1" fill="none" opacity=".35" transform="translate(0,-1)"/>`;
 });
 // nose
 if(F.kind==='real')s+=`<path d="M-3,-6 Q-5,${F.noseY-4} -9,${F.noseY} Q-4,${F.noseY+4} 0,${F.noseY+2} Q4,${F.noseY+4} 9,${F.noseY} Q5,${F.noseY-4} 3,-6" stroke="#8a5a45" stroke-width="1.4" fill="none" opacity=".75"/><ellipse cx="-5" cy="${F.noseY+1}" rx="2" ry="1.2" fill="#3a2018" opacity=".8"/><ellipse cx="5" cy="${F.noseY+1}" rx="2" ry="1.2" fill="#3a2018" opacity=".8"/>`;
 else if(F.kind==='toon')s+=`<path d="M-4,${F.noseY-2} Q0,${F.noseY+5} 5,${F.noseY-1}" stroke="${ol}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
 else s+=`<path d="M-2,${F.noseY-1} l2,3 l2,-1" stroke="#b07a70" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
 // mouth
 const my=F.mouthY,mw=F.kind==='toon'?17:14,mk=ol;const dark='#3a0f14',tooth='#f8f4ee',lip='#b25a56';let m='';
 if(e.m==='neutral')m=F.kind==='real'?`<path d="M${-mw},${my} Q-6,${my-3} 0,${my-1.5} Q6,${my-3} ${mw},${my} Q0,${my+7} ${-mw},${my}Z" fill="${lip}" stroke="${mk}" stroke-width="1"/><path d="M${-mw},${my} Q0,${my+1.5} ${mw},${my}" stroke="#5a2420" stroke-width="1.4" fill="none"/>`:`<path d="M${-mw+3},${my} Q0,${my+3} ${mw-3},${my}" stroke="${mk}" stroke-width="${F.kind==='toon'?4:2.4}" fill="none" stroke-linecap="round"/>`;
 if(e.m==='smile')m=`<path d="M${-mw-2},${my-3} Q0,${my+16} ${mw+2},${my-3} Q0,${my+2} ${-mw-2},${my-3}Z" fill="${dark}" stroke="${mk}" stroke-width="${F.kind==='toon'?3.4:1.6}" stroke-linejoin="round"/><path d="M${-mw+1},${my-1.5} Q0,${my+4} ${mw-1},${my-1.5} L${mw-3},${my+3} Q0,${my+7} ${-mw+3},${my+3}Z" fill="${tooth}"/>`;
 if(e.m==='frown'||e.m==='sad')m=`<path d="M${-mw+2},${my+5} Q0,${my-4} ${mw-2},${my+5}" stroke="${mk}" stroke-width="${F.kind==='toon'?4:2.4}" fill="none" stroke-linecap="round"/>`+(F.kind==='real'?`<path d="M-4,${my+9} Q0,${my+11} 4,${my+9}" stroke="${st.skin2}" stroke-width="1.4" fill="none"/>`:'');
 if(e.m==='o')m=`<ellipse cx="0" cy="${my+2}" rx="${F.kind==='toon'?9:7}" ry="${F.kind==='toon'?12:10}" fill="${dark}" stroke="${mk}" stroke-width="${F.kind==='toon'?3.4:1.6}"/><ellipse cx="0" cy="${my+8}" rx="4" ry="3" fill="#a04048"/>`;
 if(e.m==='fear')m=`<path d="M${-mw-1},${my} Q0,${my-6} ${mw+1},${my} Q${mw-2},${my+17} 0,${my+17} Q${-mw+2},${my+17} ${-mw-1},${my}Z" fill="${dark}" stroke="${mk}" stroke-width="${F.kind==='toon'?3.4:1.6}" stroke-linejoin="round"/><path d="M${-mw+2},${my-1} Q0,${my-4} ${mw-2},${my-1} L${mw-3},${my+4} Q0,${my+2} ${-mw+3},${my+4}Z" fill="${tooth}"/>`;
 if(e.m==='grit')m=`<path d="M${-mw},${my-1} Q0,${my-5} ${mw},${my-1} L${mw-1},${my+8} Q0,${my+11} ${-mw+1},${my+8}Z" fill="${tooth}" stroke="${mk}" stroke-width="${F.kind==='toon'?3.4:1.6}" stroke-linejoin="round"/><path d="M${-mw+2},${my+3} Q0,${my+5} ${mw-2},${my+3}M-8,${my-3} v10M-3,${my-4} v12M3,${my-4} v12M8,${my-3} v10" stroke="${mk}" stroke-width="1.1" fill="none"/>`;
 if(e.m==='grin')m=`<path d="M${-mw},${my-1} Q0,${my+11} ${mw},${my-1}" stroke="${mk}" stroke-width="${F.kind==='toon'?4:2.4}" fill="none" stroke-linecap="round"/><path d="M${-mw},${my-1} l-3,-3 M${mw},${my-1} l3,-3" stroke="${mk}" stroke-width="2" stroke-linecap="round"/>`;
 if(e.m==='smirk')m=`<path d="M${-mw+2},${my+2} Q2,${my+4} ${mw+2},${my-5}" stroke="${mk}" stroke-width="${F.kind==='toon'?4:2.4}" fill="none" stroke-linecap="round"/><path d="M${mw+2},${my-5} l3,-3" stroke="${mk}" stroke-width="2" stroke-linecap="round"/>`;
 if(e.m==='flat')m=`<path d="M${-mw+4},${my+1} L${mw-4},${my}" stroke="${mk}" stroke-width="${F.kind==='toon'?4:2.4}" fill="none" stroke-linecap="round"/>`;
 if(e.m==='soft')m=`<path d="M${-mw+5},${my} Q0,${my+7} ${mw-5},${my}" stroke="${mk}" stroke-width="${F.kind==='toon'?4:2.4}" fill="none" stroke-linecap="round"/>`;
 if(e.m==='wavy')m=`<path d="M${-mw+3},${my+3} Q${-mw/2},${my-2} 0,${my+3} Q${mw/2},${my+8} ${mw-3},${my+2}" stroke="${mk}" stroke-width="${F.kind==='toon'?4:2.4}" fill="none" stroke-linecap="round"/>`;
 if(e.m==='laugh')m=`<path d="M${-mw-3},${my-3} Q0,${my+22} ${mw+3},${my-3} Q0,${my+3} ${-mw-3},${my-3}Z" fill="${dark}" stroke="${mk}" stroke-width="${F.kind==='toon'?3.4:1.6}" stroke-linejoin="round"/><path d="M${-mw-1},${my-2} Q0,${my+3} ${mw+1},${my-2} L${mw-2},${my+3} Q0,${my+7} ${-mw+2},${my+3}Z" fill="${tooth}"/><ellipse cx="0" cy="${my+12}" rx="${mw*.45}" ry="4.5" fill="#a04048"/>`;
 if(e.m==='scream')m=`<ellipse cx="0" cy="${my+4}" rx="${F.kind==='toon'?12:10}" ry="${F.kind==='toon'?17:15}" fill="${dark}" stroke="${mk}" stroke-width="${F.kind==='toon'?3.4:1.6}"/><path d="M-9,${my-8} Q0,${my-11} 9,${my-8} L8,${my-2} Q0,${my-4} -8,${my-2}Z" fill="${tooth}"/><ellipse cx="0" cy="${my+14}" rx="6" ry="4.5" fill="#a04048"/>`;
 if(tk>0.04&&['neutral','smile','sad','frown','grin','smirk','flat','soft','wavy'].includes(e.m)){const wd=(e.m==='smile'?mw+2:mw-2)*(0.6+0.4*tk),op2=2+11*tk;m=`<path d="M${-wd},${my} Q0,${my-2} ${wd},${my} Q${wd*.8},${my+op2*1.5} 0,${my+op2*1.5} Q${-wd*.8},${my+op2*1.5} ${-wd},${my}Z" fill="${dark}" stroke="${mk}" stroke-width="${F.kind==='toon'?3.4:1.6}" stroke-linejoin="round"/>`+(tk>.3?`<path d="M${-wd+3},${my+.5} Q0,${my-1} ${wd-3},${my+.5} L${wd-4},${my+3.5} Q0,${my+2} ${-wd+4},${my+3.5}Z" fill="${tooth}"/>`:'')+`<ellipse cx="0" cy="${my+op2*1.2}" rx="${wd*.45}" ry="${op2*.3}" fill="#a04048"/>`}
 s+=m;
 if(e.sweat)s+=`<path d="M38,-34 Q44,-22 38,-17 Q32,-22 38,-34Z" fill="#9fd8ff" stroke="${ol}" stroke-width="1.2"/>`;
 if(e.tear)s+=`<path d="M-24,12 Q-18,26 -24,32 Q-30,26 -24,12Z" fill="#9fd8ff" stroke="${ol}" stroke-width="1"/><path d="M-28,6 Q-22,8 -28,12" stroke="#9fd8ff" stroke-width="2" fill="none"/>`;
 if(op.only)return s;
 // front hair
 if(st.hairStyle&&st.hairStyle!=='beanie'){s+=`<path d="${F.hairFront}" fill="${st.hair}" stroke="${ol}" stroke-width="${f(ow*2)}" stroke-linejoin="round"/>`;(F.hairLines||[]).forEach(l=>s+=`<path d="${l}" stroke="${st.hair2}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`)}
 else if(st.k==2){s+=`<path d="${F.hairFront.split('Z')[0]}Z" fill="#2f7a8c" stroke="${ol}" stroke-width="${f(ow*2)}" stroke-linejoin="round"/><rect x="-56" y="-36" width="112" height="16" rx="6" fill="#215a68" stroke="${ol}" stroke-width="${f(ow*2)}"/>`;for(let x=-48;x<=48;x+=12)s+=`<path d="M${x},-34 v12" stroke="${ol}" stroke-width="1.6" opacity=".6"/>`;s+=`<path d="M-40,-20 Q-30,-6 -24,-12M40,-20 Q30,-6 24,-12" stroke="${ol}" stroke-width="0" />`;s+=`<path d="M-48,-20 Q-44,-8 -36,-10 L-36,-20Z M48,-20 Q44,-8 36,-10 L36,-20Z" fill="${st.hair}" stroke="${ol}" stroke-width="${f(ow)}"/>`}
 else{s+=`<path d="${F.hairFront}" fill="${st.hair}" stroke="${ol}" stroke-width="${f(ow*2)}" stroke-linejoin="round"/>`;
  s+=`<g clip-path="url(#none)">`+F.hairLines.map(l=>`<path d="${l}" stroke="${st.hair2}" stroke-width="${st.k==1?1.6:3}" fill="none" stroke-linecap="round" opacity=".85"/>`).join('')+`</g>`;
  if(st.k==3)s+=`<path d="M-8,-50 Q4,-62 8,-48" stroke="#9a86f0" stroke-width="3" fill="none" opacity=".6"/><g transform="translate(-34,-34) rotate(-20)"><rect x="-9" y="-2.5" width="18" height="5" rx="2.5" fill="#ffd36a" stroke="${ol}" stroke-width="1.2"/><rect x="-2.5" y="-9" width="5" height="18" rx="2.5" fill="#ffd36a" stroke="${ol}" stroke-width="1.2"/></g>`}
 return s}
const shoeV2=(st,dir)=>{const ol=st.ol,w=st.ow*1.5;const up=`<path d="M-18,-8 L18,-8 L20,14 Q22,22 40,26 Q58,30 58,42 L58,50 L-21,50 Q-23,20 -18,-8Z"/>`;
 let r=`<g transform="scale(${dir},1)">`+withT(T(0,0,0,dir,1),()=>grp(up,st.shoe,st,[-30,-20,100,80],{ow:w,sd:4}));
 r+=`<path d="M-18,-8 Q0,-14 18,-8 Q0,0 -18,-8Z" fill="#23232f" stroke="${ol}" stroke-width="${st.ow}"/><rect x="-9" y="-6" width="18" height="30" rx="8" fill="#e4dfd2" stroke="${ol}" stroke-width="${st.ow*.7}" transform="rotate(18 0 4)"/>`;
 for(let i=0;i<4;i++){const x=2+i*9,y=6+i*5;r+=`<path d="M${x-8},${y+4} L${x+8},${y-4}" stroke="${ol}" stroke-width="${st.ow*1.2}" stroke-linecap="round"/><circle cx="${x-8}" cy="${y+4}" r="1.8" fill="${ol}"/><circle cx="${x+8}" cy="${y-4}" r="1.8" fill="${ol}"/>`}
 r+=`<path d="M30,34 Q44,24 58,38 L58,50 L30,50Z" fill="${st.hood}" opacity=".0"/><ellipse cx="46" cy="40" rx="15" ry="11" fill="none" stroke="${ol}" stroke-width="${st.ow*.8}" stroke-dasharray="3 2.5" opacity=".7"/><path d="M-4,38 Q18,26 36,40" stroke="${st.hood}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
 r+=`<path d="M-24,46 L60,46 Q66,48 64,56 Q62,62 -22,62 Q-26,54 -24,46Z" fill="${st.sole}" stroke="${ol}" stroke-width="${w}" stroke-linejoin="round"/><path d="M-24,52 L64,52" stroke="#fff" stroke-width="3" opacity=".5"/>`;
 for(let x=-14;x<=56;x+=10)r+=`<path d="M${x},56 v5" stroke="${ol}" stroke-width="1.6" opacity=".6"/>`;
 r+=`<path d="M-20,8 Q-27,16 -22,30" stroke="${ol}" stroke-width="${st.ow}" fill="none"/></g>`;return r};

export{S,limb,grp,defs,hand,handSkin,handProf,gripV2,shoeV2,ik2,face,EX,uid,f};
