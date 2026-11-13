// "El Coloso" - colossal monster (2D vector, layered lighting). Local units ~ px at scale 1; creature is ~2900 tall.
const f=n=>(+n).toFixed(1);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const pt=p=>f(p[0])+','+f(p[1]);
// smooth closed/open path through points (quadratic midpoints)
function smooth(pts,closed=true){const n=pts.length;let d='';const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];if(closed){const s=m(pts[n-1],pts[0]);d=`M${pt(s)}`;for(let i=0;i<n;i++){const c=pts[i],e=m(pts[i],pts[(i+1)%n]);d+=` Q${pt(c)} ${pt(e)}`}return d+'Z'}d=`M${pt(pts[0])}`;for(let i=1;i<n-1;i++){const c=pts[i],e=m(pts[i],pts[i+1]);d+=` Q${pt(c)} ${pt(e)}`}return d+` L${pt(pts[n-1])}`}
// tapered limb along a polyline: returns closed path
function taper(P,w0,w1){const n=P.length;const L=[],R=[];for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=(w0+(w1-w0)*i/(n-1))/2;L.push([P[i][0]-dy*w,P[i][1]+dx*w]);R.push([P[i][0]+dy*w,P[i][1]-dx*w])}return smooth(L.concat(R.reverse()),true)}
export const defsMonster=`<defs>
<linearGradient id="mSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a3c"/><stop offset=".45" stop-color="#1d1522"/><stop offset="1" stop-color="#0b080e"/></linearGradient>
<linearGradient id="mSkin2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3040"/><stop offset=".5" stop-color="#241824"/><stop offset="1" stop-color="#0a070c"/></linearGradient>
<radialGradient id="mEye"><stop offset="0" stop-color="#fff6b0"/><stop offset=".25" stop-color="#ffc83a"/><stop offset=".6" stop-color="#e8561a"/><stop offset="1" stop-color="#5a1006"/></radialGradient>
<radialGradient id="mGlow"><stop offset="0" stop-color="#ff6a8a" stop-opacity=".9"/><stop offset=".5" stop-color="#ff5a3a" stop-opacity=".3"/><stop offset="1" stop-color="#ff5a3a" stop-opacity="0"/></radialGradient>
<radialGradient id="mThroat"><stop offset="0" stop-color="#fff0a0"/><stop offset=".3" stop-color="#ff7a2a"/><stop offset=".75" stop-color="#8a1410"/><stop offset="1" stop-color="#1a0406"/></radialGradient>
<linearGradient id="mRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a3a" stop-opacity=".0"/><stop offset=".85" stop-color="#ff8a3a" stop-opacity=".0"/><stop offset="1" stop-color="#ffb060" stop-opacity=".75"/></linearGradient>
<radialGradient id="mSmoke"><stop offset="0" stop-color="#2a2226" stop-opacity=".85"/><stop offset="1" stop-color="#2a2226" stop-opacity="0"/></radialGradient>
</defs>`;
function veins(P,t,seed,col='#ff6a8a'){let s='';for(let k=0;k<5;k++){const o=(k-2)*26;const pts=P.map((p,i)=>[p[0]+o+Math.sin(i*1.7+seed+k)*14,p[1]]);const pulse=.45+.4*Math.sin(t*2.2+k+seed);s+=`<path d="${smooth(pts,false)}" stroke="${col}" stroke-width="${3+k%2*2}" fill="none" stroke-opacity="${pulse.toFixed(2)}" stroke-linecap="round"/>`}return s}
function eye(cx,cy,r,t,look,seed=0,lidK=0,slant=0){const lx=look[0]*r*.18,ly=look[1]*r*.14;const w=.5+.5*Math.sin(t*2+seed);let s=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r*2.4)}" fill="url(#mGlow)" fill-opacity=".55"/>`;
 s+=`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r*1.18)}" ry="${f(r*.98)}" fill="#14080a" stroke="#050204" stroke-width="${f(r*.08)}"/>`;
 s+=`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r)}" ry="${f(r*.82)}" fill="url(#mEye)"/>`;
 // veins in the eyeball
 for(let k=0;k<9;k++){const a=k/9*6.28+seed,r0=r*.95;s+=`<path d="M${f(cx+Math.cos(a)*r0)},${f(cy+Math.sin(a)*r0*.8)} Q${f(cx+Math.cos(a+.3)*r*.6)},${f(cy+Math.sin(a+.3)*r*.5)} ${f(cx+Math.cos(a)*r*.38+lx)},${f(cy+Math.sin(a)*r*.3+ly)}" stroke="#7a0c0c" stroke-width="${f(r*.025)}" fill="none" opacity=".7"/>`}
 // slit pupil
 s+=`<ellipse cx="${f(cx+lx)}" cy="${f(cy+ly)}" rx="${f(r*.13*(1+.25*w))}" ry="${f(r*.62)}" fill="#050203"/><ellipse cx="${f(cx+lx-r*.08)}" cy="${f(cy+ly-r*.2)}" rx="${f(r*.07)}" ry="${f(r*.11)}" fill="#fff" fill-opacity=".85"/>`;
 // heavy upper lid (closes down and slants inward when hostile)
 const sgn=cx<0?1:-1;s+=`<g transform="rotate(${f(slant*sgn*57.3)} ${f(cx)} ${f(cy)})"><path d="M${f(cx-r*1.3)},${f(cy+r*(.1+lidK*.55))} Q${f(cx)},${f(cy-r*1.28+r*lidK*1.5)} ${f(cx+r*1.3)},${f(cy+r*(.1+lidK*.55))} L${f(cx+r*1.3)},${f(cy-r*1.6)} L${f(cx-r*1.3)},${f(cy-r*1.6)}Z" fill="#1a1018" stroke="#050204" stroke-width="${f(r*.07)}"/></g>`;
 return s}
function teethRing(cx,cy,rx,ry,n,len,open,seed){let s='';for(let i=0;i<n;i++){const a=i/n*6.28+seed;const x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry;const nx=-Math.cos(a),ny=-Math.sin(a);const L=len*(.7+.5*rn(i+seed*9));const bw=len*.14;const px=-ny,py=nx;s+=`<polygon points="${f(x+px*bw)},${f(y+py*bw)} ${f(x-px*bw)},${f(y-py*bw)} ${f(x+nx*L*.9*open)},${f(y+ny*L*.9*open)}" fill="#d8cfb8" stroke="#3a2a1a" stroke-width="2"/>`}return s}
function mandible(cx,cy,ang,len,spread,t,seed){const a=ang+spread;const dx=Math.cos(a),dy=Math.sin(a);const P=[[cx,cy],[cx+dx*len*.4+Math.sin(seed)*10,cy+dy*len*.4],[cx+dx*len*.75,cy+dy*len*.75+len*.06],[cx+dx*len+Math.cos(a+1.4)*len*.18,cy+dy*len+Math.sin(a+1.4)*len*.18]];
 let s=`<path d="${taper(P,len*.2,len*.03)}" fill="url(#mSkin2)" stroke="#050204" stroke-width="5"/>`;
 // ridges + teeth along inner edge
 for(let i=1;i<5;i++){const p=P[Math.min(3,i)];const q=[(P[0][0]+(P[3][0]-P[0][0])*i/5),(P[0][1]+(P[3][1]-P[0][1])*i/5)];const nx=-dy,ny=dx;s+=`<polygon points="${f(q[0]-nx*len*.05)},${f(q[1]-ny*len*.05)} ${f(q[0]+nx*len*.03)},${f(q[1]+ny*len*.03)} ${f(q[0]-nx*len*.17+dx*len*.05)},${f(q[1]-ny*len*.17+dy*len*.05)}" fill="#d8cfb8" stroke="#3a2a1a" stroke-width="2"/>`}
 s+=`<path d="${smooth(P.map((p,i)=>[p[0]+(i?-dy*8:0),p[1]+(i?dx*8:0)]),false)}" stroke="#ff9a6a" stroke-width="3" fill="none" opacity=".35"/>`;return s}
// the head (local origin = base of skull, looking along +x then rotated by 'ang')
export function head(t,o){const open=o.jaw||0,look=o.look||[0,0];const MD={cold:[.38,.24],hunt:[.55,.36],rage:[.3,.55],pain:[.1,-.2],none:[0,0]}[o.mood||'none'];const lk=MD[0],sl=MD[1];const s0=1;let s=`<g>`;
 // skull
 s+=`<path d="${smooth([[-260,-40],[-230,-210],[-80,-300],[140,-260],[300,-150],[360,-20],[300,60],[120,120],[-120,110],[-250,70]])}" fill="url(#mSkin)" stroke="#050204" stroke-width="8" stroke-linejoin="round"/>`;
 // ridges and bone plates
 for(let k=0;k<5;k++){s+=`<path d="${smooth([[-200+k*70,-230+k*14],[-170+k*70,-170+k*12],[-120+k*70,-110]],false)}" stroke="#4a3a4a" stroke-width="${10-k}" fill="none" opacity=".7" stroke-linecap="round"/>`}
 s+=`<path d="M-250,-60 Q-90,-310 180,-250" stroke="#c8a8a8" stroke-width="5" fill="none" opacity=".25"/>`;
 s+=veins([[-120,-200],[-60,-120],[0,-40],[40,40]],t,3);
 // orange rim light from fires (top-right)
 s+=`<path d="M-80,-300 Q140,-270 300,-150 Q340,-90 360,-20" stroke="#ffa050" stroke-width="7" fill="none" opacity=".55"/>`;
 // eyes: big central + ring of smaller ones
 s+=eye(70,-110,70,t,look,0,lk,sl)+eye(-110,-150,34,t,look,1,lk,sl)+eye(190,-170,30,t,look,2,lk,sl)+eye(-30,-50,24,t,look,3,lk,sl)+eye(250,-80,24,t,look,4,lk,sl);
 // heavy bone brow ridge shading the eyes (angled = hostile)
 s+=`<path d="M-190,${-175+sl*60} Q0,${-210-sl*40} 330,${-125+sl*80} L330,-90 Q0,-150 -190,-130Z" fill="#120b14" stroke="#050204" stroke-width="6" opacity="${MD[0]||MD[1]?.85:0}"/>`;
 // mouth: lamprey-like maw ringed by mandibles; opens wide when roaring
 const mc=[345,10];const R0=70+open*210;
 s+=`<g transform="translate(${mc[0]},${mc[1]})">`;
 s+=`<ellipse cx="${f(30+open*60)}" cy="0" rx="${f(R0*.55)}" ry="${f(R0)}" fill="#2a0a10" stroke="#050204" stroke-width="9"/>`;
 // throat glow
 s+=`<ellipse cx="${f(40+open*70)}" cy="0" rx="${f(R0*.42)}" ry="${f(R0*.78)}" fill="url(#mThroat)"/>`;
 // concentric tooth rings (rotating slowly)
 const rot=t*.6;
 s+=teethRing(30+open*60,0,R0*.5,R0*.97,26,70+open*40,.6+open*.5,rot)+teethRing(36+open*66,0,R0*.36,R0*.7,18,56+open*34,.7+open*.4,rot*-1.3+1)+teethRing(42+open*72,0,R0*.22,R0*.44,12,40+open*26,.8+open*.3,rot*1.7+2);
 s+=`<ellipse cx="${f(46+open*76)}" cy="0" rx="${f(R0*.1)}" ry="${f(R0*.2)}" fill="#fff2b0" fill-opacity="${(.6+.4*Math.sin(t*9)).toFixed(2)}"/>`;
 // lips / gum rim
 s+=`<ellipse cx="${f(30+open*60)}" cy="0" rx="${f(R0*.55)}" ry="${f(R0)}" fill="none" stroke="#6a2030" stroke-width="${f(10+open*8)}" opacity=".85"/>`;
 // saliva strings
 for(let k=0;k<9;k++){const y=-R0*.8+k*R0*.2;s+=`<path d="M${f(20+open*40)},${f(y)} Q${f(40+open*70)},${f(y+40+26*Math.sin(t*3+k))} ${f(10+open*30)},${f(y+110+40*rn(k))}" stroke="#cfeaff" stroke-width="3.5" fill="none" opacity="${(.35+.3*open).toFixed(2)}"/>`}
 // four hooked mandibles around the rim
 for(let k=0;k<4;k++){const base=[-.9,.9,-.45,.45][k];s+=mandible(20+open*30,base*R0*.8,base*.8,300-k%2*60,base*open*1.3,t,k)}
 s+=`</g>`;
 // smaller side mandibles / pincers on the cheeks
 for(const sy of[-1,1])s+=`<path d="${taper([[150,sy*80],[230,sy*130],[290,sy*140],[340,sy*110]],46,8)}" fill="url(#mSkin2)" stroke="#050204" stroke-width="5"/>`;
 // cracks with glowing flesh
 s+=`<path d="M-160,-100 l30,40 l-20,30 l40,40" stroke="#ff4a3a" stroke-width="4" fill="none" opacity=".7"/>`;
 return s+`</g>`}
// body + limbs. o: {sway, breath, jaw, look, climb (0..1 cycle phase), roar}
export function colossus(t,o={}){const br=Math.sin(t*1.4)*.015,sw=(o.sway||0)+Math.sin(t*.7)*.012;const cl=o.climb||0;let s='';
 const dir=o.dir||1;
 s+=`<g transform="scale(${dir},1)">`;
 // dorsal membrane + spines (behind)
 for(let k=0;k<9;k++){const y=-300+k*220,x=330+rn(k)*50;s+=`<path d="M${x},${y} L${x+250+rn(k+3)*160},${y-120+rn(k+5)*80} L${x+60},${y+90}Z" fill="#150d16" stroke="#050204" stroke-width="5"/><path d="M${x+10},${y+10} L${x+200},${y-90}" stroke="#ff7a4a" stroke-width="2.5" opacity=".35"/>`}
 // rear legs (thin stilts gripping the tower)
 for(const [ox,ph] of [[120,0],[-60,.5]]){const c=Math.sin((cl+ph)*6.28)*50;const P=[[ox+60,900],[ox+380,1180+c],[ox+300,1760+c*.5],[ox+420,2400]];s+=`<path d="${taper(P,110,26)}" fill="url(#mSkin2)" stroke="#050204" stroke-width="6"/>`;s+=`<path d="${taper([[P[2][0],P[2][1]],[P[3][0]-40,P[3][1]-40],[P[3][0]+30,P[3][1]+40]],34,6)}" fill="#0b080e" stroke="#050204" stroke-width="4"/>`}
 // torso with ribs
 s+=`<g transform="rotate(${f(sw*30)} 0 600) scale(${f(1+br)},${f(1+br*.7)})">`;
 s+=`<path d="${smooth([[-300,-100],[-340,300],[-300,800],[-180,1200],[60,1320],[300,1100],[380,600],[330,100],[120,-140]])}" fill="url(#mSkin)" stroke="#050204" stroke-width="9" stroke-linejoin="round"/>`;
 for(let k=0;k<9;k++){const y=40+k*120,w=250-k*10;s+=`<path d="M${-w},${y+60} Q0,${y-70+k*8} ${w+40},${y+60}" stroke="#bda9a0" stroke-width="${12-k*.6}" fill="none" opacity=".5" stroke-linecap="round"/><path d="M${-w},${y+74} Q0,${y-56+k*8} ${w+40},${y+74}" stroke="#000" stroke-width="6" fill="none" opacity=".4"/>`}
 s+=veins([[-60,-60],[-100,300],[-80,700],[-20,1100]],t,1)+veins([[160,-40],[200,300],[220,700]],t,2,'#ff9a3a');
 for(let k=0;k<11;k++){const y=-80+k*125;s+=`<path d="M${240+k*4},${y} q60,-20 90,${20}" stroke="#d8cfb8" stroke-width="${14-k*.6}" fill="none" stroke-linecap="round" opacity=".75"/>`}
 s+=`<path d="M300,100 Q380,600 300,1100" stroke="#ffa050" stroke-width="8" fill="none" opacity=".4"/>`; // rim light
 // scale texture + sinew + rim light
 for(let r=0;r<22;r++)for(let c=0;c<9;c++){const x=-250+c*70+(r%2)*35,y=-20+r*58;s+=`<path d="M${x},${y} q18,16 36,0" stroke="#000" stroke-width="3" fill="none" opacity=".28"/>`}
 for(let k=0;k<7;k++){s+=`<path d="M${-200+k*60},${300+rn(k)*300} q40,-120 ${rn(k+4)*90},${-260}" stroke="#a0384a" stroke-width="${3+k%3}" fill="none" opacity=".45"/>`}
 s+=`<path d="${smooth([[-300,-100],[-340,300],[-300,800],[-180,1200],[60,1320],[300,1100],[380,600],[330,100],[120,-140]])}" fill="none" stroke="#ffb060" stroke-width="12" opacity=".28" transform="translate(10,-6)"/>`;
 s+=`</g>`;
 // front arms (hooked hands on the building corner)
 for(const [sx,ph] of [[-1,0],[1,.5]]){const c=Math.sin((cl+ph)*6.28)*60;const sh=[sx*210,60];const el=[sx*520+c*.3,-320+c];const wr=[sx*430+c*.2,-980+c*.5];const P=[sh,el,wr];s+=`<path d="${taper(P,170,70)}" fill="url(#mSkin2)" stroke="#050204" stroke-width="7"/>`;
  s+=`<circle cx="${f(el[0])}" cy="${f(el[1])}" r="62" fill="#2a1c2a" stroke="#050204" stroke-width="6"/><polygon points="${f(el[0]-sx*30)},${f(el[1]-40)} ${f(el[0]-sx*100)},${f(el[1]-130)} ${f(el[0]+sx*20)},${f(el[1]-70)}" fill="#d8cfb8" stroke="#3a2a1a" stroke-width="3"/>`;
  // hand: three long hooked fingers
  for(let k=0;k<3;k++){const a=(-1.25+k*.5)*(sx>0?1:-1)-1.57;const F1=[wr[0]+Math.cos(a)*120,wr[1]+Math.sin(a)*120];const F2=[wr[0]+Math.cos(a+.5*sx)*250+sx*10,wr[1]+Math.sin(a+.5*sx)*250];s+=`<path d="${taper([wr,F1,F2],48,16)}" fill="url(#mSkin2)" stroke="#050204" stroke-width="5"/><polygon points="${f(F2[0]-12)},${f(F2[1]-8)} ${f(F2[0]+Math.cos(a+1.1*sx)*70)},${f(F2[1]+Math.sin(a+1.1*sx)*70)} ${f(F2[0]+14)},${f(F2[1]+8)}" fill="#e8dcc4" stroke="#3a2a1a" stroke-width="3"/>`}}
 // neck (long, sinuous) + head
 const hx=o.headX??-120,hy=o.headY??-780,ha=(o.headAng??-.2);
 const neck=[[0,-60],[hx*.25+30,hy*.35],[hx*.7-30,hy*.75],[hx,hy]];
 s+=`<path d="${taper(neck,300,200)}" fill="url(#mSkin)" stroke="#050204" stroke-width="8"/>`;
 for(let k=1;k<7;k++){const u=k/7;const p=[neck[0][0]+(neck[3][0]-neck[0][0])*u,neck[0][1]+(neck[3][1]-neck[0][1])*u];s+=`<path d="M${f(p[0]-130+u*40)},${f(p[1]+14)} Q${f(p[0])},${f(p[1]-30)} ${f(p[0]+130-u*40)},${f(p[1]+14)}" stroke="#000" stroke-width="5" fill="none" opacity=".45"/>`}
 s+=veins([[neck[0][0],neck[0][1]],[neck[1][0],neck[1][1]],[neck[2][0],neck[2][1]],[neck[3][0],neck[3][1]]],t,4);
 s+=`<g transform="translate(${f(hx)},${f(hy)}) rotate(${f(ha*57.3)}) scale(${o.headScale||1.7})">${head(t,{jaw:o.jaw||0,look:o.look||[0,0],mood:o.mood})}</g>`;
 s+=`</g>`;return s}
export function smokeBlob(t,x,y,r,seed){return `<ellipse cx="${f(x+Math.sin(t*.3+seed)*30)}" cy="${f(y+Math.cos(t*.25+seed)*20)}" rx="${f(r)}" ry="${f(r*.5)}" fill="url(#mSmoke)"/>`}

// Frontal face filling the screen (1080x1920): the final jump scare
export function faceFront(t,u){const cx=540,cy=980;const sc=.5+1.3*u;const sh=Math.sin(t*47)*12*u;let s=`<rect width="1080" height="1920" fill="#0a0508"/>`;
 s+=`<g transform="translate(${f(cx+sh)},${f(cy+sh*.5)}) scale(${f(sc)})">`;
 // skull plates + cracks
 s+=`<path d="${smooth([[-520,-700],[-600,-100],[-480,500],[-200,760],[200,760],[480,500],[600,-100],[520,-700],[0,-860]])}" fill="url(#mSkin)" stroke="#050204" stroke-width="12"/>`;
 for(let k=0;k<9;k++){s+=`<path d="M${-460+k*115},${-640+ (k%3)*40} q${20*(k%2?1:-1)},180 ${-30+rn(k)*60},${360+rn(k+3)*200}" stroke="#ff4a3a" stroke-width="${3+k%3}" fill="none" opacity="${(.35+.3*Math.sin(t*3+k)).toFixed(2)}"/>`}
 // eyes ring
 s+=eye(0,-470,150,t,[0,.3],0)+eye(-330,-380,84,t,[.3,.2],1)+eye(330,-380,84,t,[-.3,.2],2)+eye(-190,-250,56,t,[.2,.1],3)+eye(190,-250,56,t,[-.2,.1],4);
 // maw: concentric tooth rings + glowing throat
 const R=330+80*Math.sin(t*14)*u;s+=`<ellipse cx="0" cy="250" rx="${f(R*1.08)}" ry="${f(R*1.08)}" fill="#1a0408" stroke="#6a2030" stroke-width="26"/><ellipse cx="0" cy="250" rx="${f(R*.78)}" ry="${f(R*.78)}" fill="url(#mThroat)"/>`;
 s+=teethRing(0,250,R*.98,R*.98,34,150,1,t*.5)+teethRing(0,250,R*.72,R*.72,24,120,1,-t*.8+1)+teethRing(0,250,R*.46,R*.46,16,90,1,t*1.1+2)+`<circle cx="0" cy="250" r="${f(R*.14)}" fill="#fff2b0" fill-opacity="${(.7+.3*Math.sin(t*9)).toFixed(2)}"/>`;
 for(let k=0;k<12;k++){s+=`<path d="M${f(-R+k*R/6)},${f(250+R*.9)} q${f(12*Math.sin(t*3+k))},${f(90+40*rn(k))} 0,${f(220+80*rn(k+2))}" stroke="#cfeaff" stroke-width="5" fill="none" opacity=".55"/>`}
 // mandibles splayed at the corners
 for(let k=0;k<4;k++){const a=[-.7,.7,-1.1,1.1][k];s+=`<g transform="translate(${f(Math.sin(a)*R*1.02)},${f(250-Math.cos(a)*R*.2)}) rotate(${f(a*57)})">${mandible(0,0,Math.PI/2*(k%2?1:-1),520,0,t,k)}</g>`}
 s+=`</g>`;
 s+=`<rect width="1080" height="1920" fill="#ff2a1a" fill-opacity="${(.12+.08*Math.sin(t*30)).toFixed(2)}"/>`;
 return s}

// chaser: long neck + head + two reaching claws, drawn from an anchor point toward the head position (world coords, already scaled by caller)
export function chaser(t,o){const hx=o.hx,hy=o.hy;const bx=o.bx??hx+1500,by=o.by??hy+1400;let s='';
 const neck=[[bx,by],[bx-(bx-hx)*.35,by-(by-hy)*.6-120],[bx-(bx-hx)*.75,by-(by-hy)*.9+80],[hx+60,hy+30]];
 s+=`<path d="${taper(neck,420,240)}" fill="url(#mSkin)" stroke="#050204" stroke-width="10"/>`;
 for(let k=1;k<9;k++){const u=k/9;const p=[neck[0][0]+(neck[3][0]-neck[0][0])*u,neck[0][1]+(neck[3][1]-neck[0][1])*u];s+=`<path d="M${f(p[0]-150)},${f(p[1]+20)} Q${f(p[0])},${f(p[1]-40)} ${f(p[0]+150)},${f(p[1]+20)}" stroke="#000" stroke-width="6" fill="none" opacity=".45"/>`}
 s+=veins(neck,t,5);
 // claws reaching forward
 for(const sy of[-1,1]){const base=[hx+420,hy+380+sy*40];const wr=[hx-260,hy+260+sy*150+(o.reach||0)*sy*60];const P=[base,[ (base[0]+wr[0])/2,(base[1]+wr[1])/2-160],wr];s+=`<path d="${taper(P,160,60)}" fill="url(#mSkin2)" stroke="#050204" stroke-width="7"/>`;for(let k=0;k<3;k++){const a=Math.PI+(-.6+k*.55);const F1=[wr[0]+Math.cos(a)*170,wr[1]+Math.sin(a)*170];const F2=[F1[0]+Math.cos(a+.5)*130,F1[1]+Math.sin(a+.5)*130];s+=`<path d="${taper([wr,F1,F2],44,12)}" fill="url(#mSkin2)" stroke="#050204" stroke-width="5"/><polygon points="${f(F2[0]-8)},${f(F2[1]-6)} ${f(F2[0]+Math.cos(a+1)*60)},${f(F2[1]+Math.sin(a+1)*60)} ${f(F2[0]+10)},${f(F2[1]+6)}" fill="#e8dcc4" stroke="#3a2a1a" stroke-width="3"/>`}}
 s+=`<g transform="translate(${f(hx)},${f(hy)}) rotate(${f((o.ang||0)*57.3)}) scale(${o.scale||1.5})">${head(t,{jaw:o.jaw||0,look:o.look||[-1,.2],mood:o.mood||'cold'})}</g>`;return s}
