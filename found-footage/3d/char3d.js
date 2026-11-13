import * as THREE from 'three';
export const PX=1/617;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const YA=V(0,1,0);
const sstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const CFG={
 beto:{skin:0xe6ae88,hood:0x2f7a8c,pants:0x3a3f5c,hair:'beanie',hc:0x5a3825,iris:'#3a5a7a',lip:0xb05a50},
 diego:{skin:0xd9a07a,hood:0x8a6a3a,pants:0x2f3a4a,hair:'short',hc:0x241812,iris:'#4a3020',lip:0xa8584c},
 marta:{skin:0xc98e6c,hood:0xb8383e,pants:0x1f2432,hair:'long',hc:0x1c1416,iris:'#3a2415',lip:0x9a4a48,lashes:1},
 lucia:{skin:0xf1c4a3,hood:0xe0b43a,pants:0x3a4a6a,hair:'curly',hc:0x3b2218,iris:'#6a4a2a',lip:0xb85a60,lashes:1},
 sgt:{skin:0xb98260,hood:0x55603f,pants:0x3b4230,hair:'short',hc:0x14100c,iris:'#2a1a10',lip:0x9a5a4a},
 sol2:{skin:0xe0a98a,hood:0x55603f,pants:0x3b4230,hair:'short',hc:0x3a2418,iris:'#3a5a7a',lip:0xb05a50},
 sol3:{skin:0x8a5a40,hood:0x4d5a3a,pants:0x363c2c,hair:'short',hc:0x0e0a08,iris:'#1a0e08',lip:0x7a4038},
 sofi:{skin:0xc98e6c,hood:0xd9588a,pants:0x3a4a6a,hair:'long',hc:0x150f10,iris:'#2a1a10',lip:0xb05a60,lashes:1,kid:1}};
const EXP={
 neutral:{lid:.62,bi:0,bo:0,m:{w:.034,c:0,o:0}},amused:{lid:.5,bi:.002,bo:.004,m:{w:.042,c:.009,o:0}},
 laugh:{lid:.3,bi:.004,bo:.006,m:{w:.05,c:.013,o:.7}},cryLaugh:{lid:.28,bi:.006,bo:.0,m:{w:.05,c:.012,o:.7},tear:1},
 worry:{lid:.82,bi:.014,bo:-.004,m:{w:.03,c:-.006,o:0}},fear:{lid:1.0,bi:.018,bo:.005,m:{w:.036,c:-.004,o:.55},sweat:1},
 shock:{lid:1.15,bi:.016,bo:.016,m:{w:.022,c:0,o:.8}},scream:{lid:.9,bi:.014,bo:.003,m:{w:.044,c:-.002,o:1.0},sweat:1},
 sad:{lid:.45,bi:.014,bo:-.009,m:{w:.03,c:-.012,o:0},tear:1},annoyed:{lid:.42,bi:-.008,bo:.004,m:{w:.032,c:-.002,o:0}},
 tender:{lid:.58,bi:.004,bo:-.002,m:{w:.032,c:.006,o:0}},smirk:{lid:.55,bi:-.002,bo:.007,m:{w:.036,c:.005,o:0}},
 disbelief:{lid:1.0,bi:.01,bo:.005,m:{w:.028,c:-.002,o:.05}}};
function fabricTex(){const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,128,128);for(let i=0;i<2400;i++){g.fillStyle=`rgba(${Math.random()<.5?255:0},${Math.random()<.5?255:0},${Math.random()<.5?255:0},.08)`;g.fillRect(Math.random()*128,Math.random()*128,2,2)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return t}
const FT=fabricTex();
const fab=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85,bumpMap:FT,bumpScale:.6});
const stdm=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,...o});
const skinM=c=>new THREE.MeshPhysicalMaterial({color:c,roughness:.5,sheen:1,sheenColor:new THREE.Color(0xff9a80),sheenRoughness:.45,clearcoat:.06});
function irisTex(col){const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');g.fillStyle='#f4f0ea';g.fillRect(0,0,128,128);const r=g.createRadialGradient(64,64,6,64,64,52);r.addColorStop(0,'#050403');r.addColorStop(.28,'#050403');r.addColorStop(.3,col);r.addColorStop(.8,'#2a1a10');r.addColorStop(1,'#120a06');g.fillStyle=r;g.beginPath();g.arc(64,64,52,0,7);g.fill();g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(48,46,9,0,7);g.fill();g.beginPath();g.arc(78,82,4,0,7);g.fill();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function mkLimb(r0,r1,mat){const g=new THREE.Group();const cyl=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,1,14,1),mat);cyl.position.y=.5;cyl.castShadow=true;g.add(cyl);const j0=new THREE.Mesh(new THREE.SphereGeometry(r0,14,10),mat),j1=new THREE.Mesh(new THREE.SphereGeometry(r1,14,10),mat);j0.castShadow=j1.castShadow=true;g.add(j0,j1);g.userData={cyl,j0,j1};return g}
const _q=new THREE.Quaternion();
function setLimb(l,a,b){const d=b.clone().sub(a),len=Math.max(.001,d.length());l.position.copy(a);if(d.y<-.9999*len){l.quaternion.set(1,0,0,0)}else l.quaternion.setFromUnitVectors(YA,d.clone().divideScalar(len));l.userData.cyl.scale.set(1,len,1);l.userData.j1.position.y=len}
function ik(sh,wr,l1,l2,pole){const d=wr.clone().sub(sh);let L=Math.min(d.length(),l1+l2-1e-3);L=Math.max(L,Math.abs(l1-l2)+.01);const dir=d.clone().normalize();const a=(l1*l1-l2*l2+L*L)/(2*L);const h=Math.sqrt(Math.max(0,l1*l1-a*a));const base=sh.clone().add(dir.clone().multiplyScalar(a));const pv=pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir)));if(pv.length()<1e-4)pv.set(0,0,-1);pv.normalize();return base.add(pv.multiplyScalar(h))}
// ---------- hand
function mkHand(skin,side){const g=new THREE.Group();const pm=new THREE.Mesh(new THREE.CapsuleGeometry(.024,.04,6,10),skin);pm.scale.set(1.5,1,.62);pm.rotation.z=Math.PI/2;pm.castShadow=true;g.add(pm);const fingers=[];[.047,.054,.05,.04].forEach((L,i)=>{let par=g;let off=V((i-1.5)*.0175,.04,0);const segs=[];for(let j=0;j<3;j++){const sg=new THREE.Group();sg.position.copy(off);const m=new THREE.Mesh(new THREE.CapsuleGeometry(.0092-j*.0007,L/3*.7,4,8),skin);m.position.y=L/6;m.castShadow=true;sg.add(m);if(j===2){const n=new THREE.Mesh(new THREE.SphereGeometry(.0058,8,8),new THREE.MeshBasicMaterial({color:0xf6d6c8}));n.scale.set(1,.5,1.2);n.position.set(0,L/3*.78,.0065);sg.add(n)}par.add(sg);par=sg;off=V(0,L/3,0);segs.push(sg)}fingers.push(segs)});
 const th=new THREE.Group();th.position.set(side*.03,.01,.012);const t1=new THREE.Mesh(new THREE.CapsuleGeometry(.0105,.028,4,8),skin);t1.position.y=.02;t1.castShadow=true;th.add(t1);const t2=new THREE.Group();t2.position.y=.045;const t2m=new THREE.Mesh(new THREE.CapsuleGeometry(.0095,.022,4,8),skin);t2m.position.y=.016;t2.add(t2m);th.add(t2);g.add(th);
 const prop=new THREE.Group();g.add(prop);return {g,fingers,th,t2,prop}}
const CURL={relax:[.5,.55,.6,.65,.3],open:[.06,.04,.08,.1,0],grip:[1.0,1.0,1.0,1.0,.5],point:[.0,1.25,1.3,1.35,.9]};
function setHandPose(h,type,side,curlK=1){const c=CURL[type]||CURL.relax;h.fingers.forEach((segs,i)=>segs.forEach((sg,j)=>{sg.rotation.x=-c[i]*curlK*(j+1)*(type==='grip'?.55:.48)}));h.th.rotation.set(-.4,0,-side*(.9-c[4]*.4));h.t2.rotation.x=-c[4]*.6}
// ---------- props
function mkProp(kind){const g=new THREE.Group();if(kind==='cup'){const m=new THREE.Mesh(new THREE.CylinderGeometry(.045,.033,.11,18),stdm(0xc8323c));m.position.set(0,.03,-.045);m.castShadow=true;g.add(m)}
 if(kind==='ext'){const b=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.34,18),stdm(0xc4261e,{roughness:.4}));b.position.set(0,.05,-.05);b.castShadow=true;g.add(b);const top=new THREE.Mesh(new THREE.CylinderGeometry(.025,.045,.06,16),stdm(0x2a2e36,{metalness:.5}));top.position.set(0,.25,-.05);g.add(top);const lev=new THREE.Mesh(new THREE.BoxGeometry(.01,.015,.1),stdm(0x1a1d22));lev.position.set(0,.29,-.02);g.add(lev);const hose=new THREE.Mesh(new THREE.TorusGeometry(.08,.008,6,14,Math.PI*1.2),stdm(0x15171b));hose.position.set(.0,.18,-.1);hose.rotation.y=Math.PI/2;g.add(hose);const lab=new THREE.Mesh(new THREE.CylinderGeometry(.0465,.0465,.1,18),stdm(0xf0ece0));lab.position.set(0,.05,-.05);g.add(lab)}
 g.visible=false;return g}
// ---------- face + head
function buildHead(cfg,skin){const g=new THREE.Group();const W=.19,Hh=.2,D=.19,taper=.16;const geo=new THREE.SphereGeometry(1,64,48);const p=geo.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const t=sstep(.15,-1,y);x*=1-taper*t;z*=1-taper*.55*t;if(y<-.5&&z>0)z+=.02*5*(-y-.5)*z;const cb=1-Math.abs((y+.02)/.4);if(cb>0)x*=1+.045*cb;if(y>.6)z*=1-.08*(y-.6);p.setXYZ(i,x*W,y*Hh,z*D)}geo.computeVertexNormals();
 const head=new THREE.Mesh(geo,skin);head.castShadow=true;g.add(head);
 const sz=(x,y)=>D*Math.sqrt(Math.max(.02,1-(x/W)**2-(y/Hh)**2));
 for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.03,18,14),skin);e.scale.set(.45,1.1,.8);e.position.set(s*W*.97,-.012,-.004);g.add(e)}
 const ex=W*.38,ey=.012,er=.036,tex=irisTex(cfg.iris);const eyes=[];
 for(const s of[-1,1]){const eg=new THREE.Group();eg.position.set(s*ex,ey,sz(ex,ey)-er*.55);const ball=new THREE.Group();const bm=new THREE.Mesh(new THREE.SphereGeometry(er,26,20),new THREE.MeshStandardMaterial({map:tex,roughness:.15}));bm.rotation.y=-Math.PI/2;ball.add(bm);eg.add(ball);
  const lm=skin;const up=new THREE.Mesh(new THREE.SphereGeometry(er*1.1,26,16,0,Math.PI*2,0,Math.PI/2),lm);const lo=new THREE.Mesh(new THREE.SphereGeometry(er*1.1,26,16,0,Math.PI*2,Math.PI/2,Math.PI/2),lm);up.castShadow=true;eg.add(up,lo);
  if(cfg.lashes){const ls=new THREE.Mesh(new THREE.TorusGeometry(er*1.1,.002,6,22,Math.PI),new THREE.MeshBasicMaterial({color:0x120a08}));ls.rotation.z=Math.PI/2;up.add(ls)}
  g.add(eg);eyes.push({eg,ball,up,lo,s})}
 const tip=new THREE.Mesh(new THREE.SphereGeometry(.016,14,10),skin);tip.position.set(0,-.038,sz(0,-.038)+.007);g.add(tip);
 const brows=[0,0].map(()=>{const m=new THREE.Mesh(new THREE.BufferGeometry(),stdm(cfg.hc));g.add(m);return m});
 const lips=[0,1].map(i=>{const m=new THREE.Mesh(new THREE.BufferGeometry(),stdm(cfg.lip));g.add(m);return m});
 const cav=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({color:0x2a0c10}));g.add(cav);
 const teeth=new THREE.Mesh(new THREE.BoxGeometry(.05,.009,.004),new THREE.MeshBasicMaterial({color:0xf6f1e8}));g.add(teeth);
 const tongue=new THREE.Mesh(new THREE.SphereGeometry(.02,14,10),new THREE.MeshBasicMaterial({color:0xa04048}));tongue.scale.set(1,.45,.3);g.add(tongue);
 const blush=[-1,1].map(s=>{const b=new THREE.Mesh(new THREE.CircleGeometry(.028,18),new THREE.MeshBasicMaterial({color:0xff6a7a,transparent:true,opacity:.18}));b.position.set(s*W*.55,-.03,sz(W*.55,-.03)+.001);b.lookAt(s*W*.9,-.03,sz(W*.55,-.03)+.2);g.add(b);return b});
 const tear=new THREE.Mesh(new THREE.SphereGeometry(.008,10,10),new THREE.MeshPhysicalMaterial({color:0xaee0ff,roughness:0,transmission:.5}));tear.scale.set(.8,1.3,.8);tear.position.set(ex*.9,-.03,sz(ex,-.03)+.005);g.add(tear);
 const sweat=tear.clone();sweat.position.set(W*.75,Hh*.45,sz(W*.75,Hh*.45)+.005);g.add(sweat);
 // hair
 const hm=stdm(cfg.hc,{roughness:.55});const hs=cfg.hair;
 if(hs==='beanie'){const bm=stdm(cfg.hood,{roughness:.9,bumpMap:FT});const cap=new THREE.Mesh(new THREE.SphereGeometry(1,40,24,0,Math.PI*2,0,Math.PI*.5),bm);cap.scale.set(W*1.1,Hh*1.2,D*1.1);cap.position.y=.06;g.add(cap);const rim=new THREE.Mesh(new THREE.TorusGeometry(W*1.04,.03,12,44),stdm(new THREE.Color(cfg.hood).multiplyScalar(.75),{roughness:.9,bumpMap:FT}));rim.rotation.x=Math.PI/2;rim.scale.set(1,1.05,1);rim.position.y=.07;g.add(rim);for(const s of[-1,1]){const t=new THREE.Mesh(new THREE.SphereGeometry(.045,12,10),hm);t.position.set(s*W*.97,-.02,.02);g.add(t)}}
 if(hs==='short'){const cap=new THREE.Mesh(new THREE.SphereGeometry(1,40,24,0,Math.PI*2,0,Math.PI*.5),hm);cap.scale.set(W*1.06,Hh*1.08,D*1.06);cap.position.y=.045;g.add(cap);for(let i=0;i<9;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(.034,10,8),hm);f.scale.set(1.2,.7,.8);f.position.set((i-4)*.038,Hh*.74,D*.74);g.add(f)}}
 if(hs==='long'){const cap=new THREE.Mesh(new THREE.SphereGeometry(1,40,24,0,Math.PI*2,0,Math.PI*.55),hm);cap.scale.set(W*1.08,Hh*1.08,D*1.08);cap.position.y=.045;g.add(cap);const back=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.34,8,16),hm);back.scale.set(1.15,1,.7);back.position.set(0,-.17,-.09);g.add(back);for(const s of[-1,1]){const sd=new THREE.Mesh(new THREE.CapsuleGeometry(.04,.3,6,10),hm);sd.position.set(s*W*.98,-.12,.0);g.add(sd)}for(let i=0;i<7;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(.034,10,8),hm);f.scale.set(1.3,.6,.8);f.position.set((i-3)*.04,Hh*.76,D*.7);g.add(f)}}
 if(hs==='curly'){for(let i=0;i<64;i++){const a=Math.random()*Math.PI*2,ph=Math.random()*1.25;const rr=1.04+Math.random()*.12;const px=Math.sin(ph)*Math.cos(a)*W*rr,py=Math.cos(ph)*Hh*rr,pz=Math.sin(ph)*Math.sin(a)*D*rr;if(pz>D*.55&&py<Hh*.55)continue;const cm=new THREE.Mesh(new THREE.SphereGeometry(.036+Math.random()*.02,10,8),hm);cm.position.set(px,py,pz-.02);g.add(cm)}const cap=new THREE.Mesh(new THREE.SphereGeometry(1,36,20,0,Math.PI*2,0,Math.PI*.33),hm);cap.scale.set(W*1.07,Hh*1.08,D*1.07);cap.position.y=.03;g.add(cap)}
 return {g,eyes,brows,lips,cav,teeth,tongue,blush,tear,sweat,sz,W,Hh,D,ex,ey,er}}
function setFace(F,cfg,e,st){const ex=EXP[e]||EXP.neutral;const open=Math.min(1.2,ex.lid)/1.2;const bl=st.blink;
 for(const E of F.eyes){const o=open*(1-bl*.96);E.up.rotation.x=Math.max(-1.6,1.55-o*4.3);E.lo.rotation.x=o*.95-(ex.lid<.4?.25:0);E.ball.rotation.set(-st.look[1]*.3,st.look[0]*.38,0)}
 // brows
 F.brows.forEach((bm,k)=>{const s=k?1:-1;const by=F.ey+F.er*2.7;const mid=(ex.bi+ex.bo)/2;const dir=s;const pts=[[-.032,ex.bi],[-.012,mid+.004],[.012,mid+.003],[.034,ex.bo]].map(([dx,dy])=>{const x=s*(F.ex+(s===1?dx:-dx));const y=by+dy;return V(x,y,F.sz(F.ex,y)+.003)});bm.geometry.dispose();bm.geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.0095,6)});
 // mouth
 const talk=st.talk||0;const o=Math.min(1,Math.max(ex.m.o,talk*.75));const mc=o*.05,w=ex.m.w*(1+(talk>.2?.06:0)),c=ex.m.c;const my=-.43*F.Hh;
 const cv=pts=>new THREE.CatmullRomCurve3(pts.map(([x,y])=>V(x,y,F.sz(x,y)+.001)));
 const up=cv([[-w,my+c],[-w/2,my+.004],[0,my+.007],[w/2,my+.004],[w,my+c]]),lo=cv([[-w,my+c],[-w/2,my-mc-.004],[0,my-mc-.007],[w/2,my-mc-.004],[w,my+c]]);
 F.lips[0].geometry.dispose();F.lips[0].geometry=new THREE.TubeGeometry(up,18,.0062,6);F.lips[1].geometry.dispose();F.lips[1].geometry=new THREE.TubeGeometry(lo,18,.0072,6);
 const vis=mc>.004;F.cav.visible=F.teeth.visible=F.tongue.visible=vis;if(vis){const shp=new THREE.Shape();const A=up.getPoints(14),Bp=lo.getPoints(14);shp.moveTo(A[0].x,A[0].y);A.forEach(v=>shp.lineTo(v.x,v.y));Bp.reverse().forEach(v=>shp.lineTo(v.x,v.y));F.cav.geometry.dispose();F.cav.geometry=new THREE.ShapeGeometry(shp);F.cav.position.z=F.sz(0,my)-.012;F.teeth.visible=o>.25;F.teeth.position.set(0,my+.001,F.sz(0,my)-.011);F.teeth.scale.x=w*30;F.tongue.position.set(0,my-mc*.8,F.sz(0,my)-.008);F.tongue.scale.set(w*40,.45*(1+mc*10),.3)}
 F.blush.forEach(b=>b.material.opacity=ex.m.o>.6||e==='laugh'||e==='amused'?.3:.14);F.tear.visible=!!ex.tear;F.sweat.visible=!!ex.sweat}
// ---------- character
export function makeChar(name){const cfg=CFG[name];const root=new THREE.Group();const g=new THREE.Group();root.add(g);const skin=skinM(cfg.skin),hood=fab(cfg.hood),dark=fab(new THREE.Color(cfg.hood).multiplyScalar(.7)),pants=fab(cfg.pants),shoeM=stdm(0xeee9e0),sole=stdm(0x8c867a);
 const legs=[0,1].map(i=>({u:mkLimb(.085,.075,pants),l:mkLimb(.075,.066,pants),shoe:new THREE.Group()}));
 legs.forEach((L,i)=>{g.add(L.u,L.l);const sh=L.shoe;const up=new THREE.Mesh(new THREE.SphereGeometry(.085,18,12),shoeM);up.scale.set(1,.75,1.9);up.position.set(0,.06,.07);sh.add(up);const so=new THREE.Mesh(new THREE.BoxGeometry(.125,.026,.3),sole);so.position.set(0,.013,.07);sh.add(so);const toe=new THREE.Mesh(new THREE.SphereGeometry(.07,14,10),stdm(0xe0dbd0));toe.scale.set(1,.55,.9);toe.position.set(0,.045,.16);sh.add(toe);for(let k=0;k<4;k++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.075,6),stdm(0x15151a));l.rotation.z=Math.PI/2;l.position.set(0,.108-k*.004,.02+k*.025);sh.add(l)}sh.traverse(o=>{if(o.isMesh)o.castShadow=true});g.add(sh)});
 const lathe=new THREE.LatheGeometry([[.2,.93],[.205,1.0],[.215,1.15],[.225,1.3],[.235,1.38],[.17,1.45],[.1,1.5],[.07,1.52]].map(([r,y])=>new THREE.Vector2(r,y)),32);const torso=new THREE.Mesh(lathe,hood);torso.scale.set(1,1,.72);torso.castShadow=true;g.add(torso);
 const hem=new THREE.Mesh(new THREE.CylinderGeometry(.208,.2,.07,28),dark);hem.position.y=.95;hem.scale.z=.74;g.add(hem);const pocket=new THREE.Mesh(new THREE.BoxGeometry(.22,.1,.03),dark);pocket.position.set(0,1.06,.155);pocket.rotation.x=-.12;g.add(pocket);
 const hoodB=new THREE.Mesh(new THREE.SphereGeometry(.14,22,14,0,Math.PI*2,Math.PI*.35,Math.PI*.65),hood);hoodB.scale.set(1.25,.9,.85);hoodB.position.set(0,1.5,-.08);g.add(hoodB);const col=new THREE.Mesh(new THREE.TorusGeometry(.105,.04,10,28),hood);col.rotation.x=Math.PI/2;col.position.set(0,1.49,.01);g.add(col);
 for(const s of[-1,1]){const c=new THREE.CatmullRomCurve3([V(s*.045,1.45,.12),V(s*.05,1.33,.17),V(s*.05,1.22,.17)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(c,8,.004,6),stdm(0xf0ece4)));const ag=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.02,6),stdm(0xb8b8b8));ag.position.set(s*.05,1.205,.17);g.add(ag)}
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.052,.06,.08,14),skin);neck.position.set(0,1.56,0);g.add(neck);
 const arms=[-1,1].map(s=>({s,u:mkLimb(.082,.072,hood),l:mkLimb(.072,.062,hood),cuff:new THREE.Mesh(new THREE.CylinderGeometry(.064,.07,.05,14),dark),hand:mkHand(skin,s),props:{cup:mkProp('cup'),ext:mkProp('ext')}}));
 arms.forEach(A=>{g.add(A.u,A.l,A.cuff,A.hand.g);A.hand.prop.add(A.props.cup,A.props.ext)});
 const F=buildHead(cfg,skin);const headG=new THREE.Group();headG.position.set(0,1.76,0);headG.add(F.g);if(cfg.kid){headG.scale.setScalar(1.15)}g.add(headG);
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});
 if(cfg.kid)root.scale.setScalar(.72);
 const SH=[V(-.215,1.38,0),V(.215,1.38,0)];
 const M2=.0029;// 2D unit -> metres (arm scale)
 function update(st,Xm){root.position.x=Xm;g.position.y=-(st.yoff||0)*PX*(cfg.kid?1:1);g.rotation.z=-(st.rot||0)*Math.PI/180;g.rotation.y=-(st.look?st.look[0]:0)*.12;
  torso.scale.y=1+(st.breath||0)*.006;
  // legs
  const w=st.walk||{phase:0,amp:0};[0,1].forEach(i=>{const s=i?1:-1;const lift=Math.max(0,Math.sin(w.phase+(i?Math.PI:0)))*.11*w.amp;const hip=V(s*.1,.95,0),kn=V(s*.11,.5+lift*.5,.02+lift*.5),an=V(s*.12,.1+lift,lift*.2);setLimb(legs[i].u,hip,kn);setLimb(legs[i].l,kn,an);legs[i].shoe.position.set(s*.12,an.y-.1,an.z)});
  // arms
  arms.forEach((A,i)=>{const side=A.s;const P=i?st.R:st.L;const sh=SH[i];const sh2=V(side===-1?186:314,240,0);const mp=(p,front)=>V(sh.x+(p[0]-sh2.x)*M2,sh.y-(p[1]-sh2.y)*M2,(front?.2:.1)+Math.max(0,(240-p[1]))*.0003);
   const wr=mp(P.w,P.front);let el;if(P.e){el=mp(P.e,false);el.z=Math.max(-.05,el.z-.1)}else el=ik(sh,wr,.29,.26,V(side*.6,-1,-.5));
   // clamp forearm length
   setLimb(A.u,sh,el);setLimb(A.l,el,wr);A.cuff.position.copy(wr);const dir=wr.clone().sub(el).normalize();A.cuff.quaternion.setFromUnitVectors(YA,dir);
   const hp=wr.clone().add(dir.clone().multiplyScalar(.045));A.hand.g.position.copy(hp);
   const c=V(-side*.8,0,.2).normalize();let zc=c.clone().negate();zc.sub(dir.clone().multiplyScalar(zc.dot(dir)));if(zc.length()<.1)zc.set(0,0,1).sub(dir.clone().multiplyScalar(dir.z));zc.normalize();const xc=new THREE.Vector3().crossVectors(dir,zc).normalize();const m=new THREE.Matrix4().makeBasis(xc,dir,zc);A.hand.g.quaternion.setFromRotationMatrix(m);
   const type=P.hand==='grip'?'grip':P.hand==='open'?'open':P.hand==='point'?'point':'relax';setHandPose(A.hand,type,side);
   A.props.cup.visible=type==='grip'&&P.prop==='cup';A.props.ext.visible=type==='grip'&&P.prop==='ext'});
  headG.rotation.z=-(st.head?st.head.rot:0)*Math.PI/180;headG.rotation.x=(st.head?st.head.dy:0)*.01;
  setFace(F,cfg,st.ex,st)}
 return {root,update}}
export {buildHead,setFace,mkHand,setHandPose,mkProp,ik,skinM,stdm,fab,CFG,EXP};
