import * as THREE from 'three';
import {makeChar,PX} from './char3d.js';
const Q=new URLSearchParams(location.search);const OW=+(Q.get('w')||720),OH=Math.round(OW*16/9);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(OW,OH);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;renderer.setPixelRatio(1);
const comp=document.createElement('canvas');comp.width=OW;comp.height=OH;document.body.appendChild(comp);const g2=comp.getContext('2d');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x07060a);scene.fog=new THREE.FogExp2(0x07060a,.07);
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});
let ST=null;let tex=null;
function noiseTex(base,rep,amp=24){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);for(let i=0;i<9000;i++){const v=Math.floor(Math.random()*amp);g.fillStyle=`rgba(${v},${v},${v},.3)`;g.fillRect(Math.random()*256,Math.random()*256,2,2)}for(let i=0;i<14;i++){g.fillStyle='rgba(0,0,0,.16)';g.fillRect(0,i*18+Math.random()*6,256,3)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);t.colorSpace=THREE.SRGBColorSpace;return t}
function labelTex(txt,fg='#cfd6df'){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');g.clearRect(0,0,256,256);g.fillStyle=fg;g.font='900 150px Inter,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,128,110);g.font='800 36px Inter,Arial';g.fillText('P I S O',128,215);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
// ---------- lights
scene.add(new THREE.HemisphereLight(0x9a6a76,0x20202c,.9));
const reds=[V(-3.6,2.5,-1.2),V(4.4,2.5,-1.0),V(.4,2.7,-2.3)].map(p=>{const L=new THREE.PointLight(0xff2a1a,2,9,1.6);L.position.copy(p);scene.add(L);return L});
// ---------- stairwell
const concrete=noiseTex('#4a4d55',[3,3]);const floorT=noiseTex('#3b3e45',[6,1]);
const back=new THREE.Group();scene.add(back);const blocks=[];
for(let ix=0;ix<10;ix++)for(let iy=0;iy<5;iy++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,.9,.3),M(0x50535c,{map:concrete}));b.position.set(-5+ix*1.1+.55,.45+iy*.9,-2.6);b.userData={ix,iy,p0:b.position.clone()};b.receiveShadow=true;back.add(b);blocks.push(b)}
for(const sx of[-5.2,5.9]){const w=new THREE.Mesh(new THREE.BoxGeometry(.3,8,12),M(0x3d4048,{map:concrete}));w.position.set(sx,3,3);w.receiveShadow=true;scene.add(w)}
const ceil=new THREE.Mesh(new THREE.BoxGeometry(14,.3,12),M(0x2c2e35,{map:concrete}));ceil.position.set(.4,3.2,3);scene.add(ceil);
const ALPHA=22*Math.PI/180;const stairG=new THREE.Group();stairG.rotation.x=ALPHA;scene.add(stairG);const steps=[];const PITCH=.3;
for(let k=-30;k<=14;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(11,.18,.3),M(k%2?0x3a3d44:0x32353c,{map:floorT}));s.position.set(.4,-.09,k*PITCH);s.receiveShadow=true;stairG.add(s);steps.push(s)}
const posts=[];for(const sx of[-4.2,5.0])for(let k=-12;k<=8;k++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.9,8),M(0x2a2d33,{metalness:.5,roughness:.5}));p.position.set(sx,.45,k*1.2);stairG.add(p);posts.push(p)}
const rails=[];for(const sx of[-4.2,5.0]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,30,8),M(0x6a6e78,{metalness:.6,roughness:.4}));r.rotation.x=Math.PI/2;r.position.set(sx,.9,0);stairG.add(r)}
// doors pool
const doors=[0,1,2,3].map(()=>{const g=new THREE.Group();const fr=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.4,.12),M(0x0a0c10));fr.position.y=1.2;g.add(fr);const d=new THREE.Mesh(new THREE.BoxGeometry(1.3,2.25,.08),M(0x2f5a46,{roughness:.6}));d.position.set(0,1.18,.07);g.add(d);const kn=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),M(0xc9c2a8,{metalness:.5}));kn.position.set(.5,1.05,.14);g.add(kn);
 const lab=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:labelTex('14'),transparent:true,opacity:.6}));lab.position.set(0,2.85,.05);g.add(lab);
 const lamp=new THREE.Mesh(new THREE.BoxGeometry(.3,.14,.1),M(0x2a0e0e));lamp.position.set(0,2.35,.1);g.add(lamp);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),new THREE.MeshBasicMaterial({color:0xff3a2a}));bulb.position.set(0,2.35,.18);g.add(bulb);
 const dark=new THREE.Mesh(new THREE.BoxGeometry(1.1,2.1,.05),new THREE.MeshBasicMaterial({color:0x020204}));dark.position.set(.1,1.18,.1);dark.visible=false;g.add(dark);const eyes=[-.1,.14].map(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),new THREE.MeshBasicMaterial({color:0xff5a7a}));e.position.set(x,1.4,.16);e.visible=false;g.add(e);return e});
 scene.add(g);return {g,lab,bulb,dark,eyes,n:-99,labT:{}}});
// dust
const dustGeo=new THREE.BufferGeometry();const dN=260;const dp=new Float32Array(dN*3);const dseed=[];for(let i=0;i<dN;i++){dseed.push([Math.random(),Math.random(),Math.random()]);}dustGeo.setAttribute('position',new THREE.BufferAttribute(dp,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xcbbfae,size:.03,transparent:true,opacity:.5,depthWrite:false}));scene.add(dust);
// rubble
const rubble=new THREE.Group();rubble.visible=false;scene.add(rubble);for(let i=0;i<22;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.3+Math.random()*.6,.2+Math.random()*.4,.3+Math.random()*.5),M(0x2b2e35,{map:concrete}));b.position.set(-1.9+Math.random()*1.7,.15+Math.random()*.5,-.3+Math.random()*.9);b.rotation.set(Math.random(),Math.random(),Math.random());b.castShadow=true;rubble.add(b)}
const holeM=new THREE.Mesh(new THREE.PlaneGeometry(14,5),new THREE.MeshBasicMaterial({color:0x020203}));holeM.rotation.x=-Math.PI/2;holeM.position.set(.4,-.3,2.6);holeM.visible=false;scene.add(holeM);
// eye (behind the wall)
const eyeG=new THREE.Group();eyeG.position.set(.5,2.0,-10);eyeG.visible=false;scene.add(eyeG);
{const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d');const gr=g.createRadialGradient(256,256,20,256,256,250);gr.addColorStop(0,'#fff2a8');gr.addColorStop(.35,'#ffb21a');gr.addColorStop(.7,'#c2480a');gr.addColorStop(1,'#4a1204');g.fillStyle=gr;g.fillRect(0,0,512,512);g.strokeStyle='rgba(122,34,8,.6)';g.lineWidth=5;for(let i=0;i<22;i++){const a=i/22*6.28;g.beginPath();g.moveTo(256+Math.cos(a)*90,256+Math.sin(a)*90);g.lineTo(256+Math.cos(a+.1)*250,256+Math.sin(a+.1)*250);g.stroke()}g.fillStyle='#050202';g.beginPath();g.ellipse(256,256,34,150,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(200,190,22,0,7);g.fill();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const eb=new THREE.Mesh(new THREE.SphereGeometry(2.2,40,30),new THREE.MeshBasicMaterial({map:t}));eb.rotation.y=-Math.PI/2;eyeG.add(eb);const lidM=M(0x1a0b08);const lid1=new THREE.Mesh(new THREE.SphereGeometry(2.3,32,20,0,Math.PI*2,0,Math.PI/2),lidM),lid2=new THREE.Mesh(new THREE.SphereGeometry(2.3,32,20,0,Math.PI*2,Math.PI/2,Math.PI/2),lidM);eyeG.add(lid1,lid2);eyeG.userData={lid1,lid2};const el=new THREE.PointLight(0xff8a2a,0,16,1.5);el.position.set(0,0,3);eyeG.add(el);eyeG.userData.light=el}
const sky=new THREE.Mesh(new THREE.PlaneGeometry(60,30),new THREE.MeshBasicMaterial({color:0x2a1410}));sky.position.set(0,5,-12);scene.add(sky);
// ---------- creature
function limbC(r){const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.7,r,1,8),M(0x1b1118,{roughness:.5}));m.position.y=.5;const g=new THREE.Group();g.add(m);return g}
const crea=new THREE.Group();crea.visible=false;scene.add(crea);const cBody=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),M(0x120d11,{roughness:.4,metalness:.2}));cBody.scale.set(.2,.11,.15);crea.add(cBody);const cBack=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),M(0x2a1a22));cBack.scale.set(.15,.05,.11);cBack.position.y=.06;crea.add(cBack);const cUnder=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),M(0xc9a89a));cUnder.scale.set(.09,.03,.07);cUnder.position.set(0,-.08,.06);crea.add(cUnder);
for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.026,10,8),new THREE.MeshBasicMaterial({color:0xff5a7a}));e.position.set(s*.06,.03,.13);crea.add(e)}
const cLegs=[];for(let i=0;i<8;i++){const s=i%2?1:-1,k=Math.floor(i/2);const u=limbC(.014),l=limbC(.011);crea.add(u,l);cLegs.push({u,l,s,k})}
function setCreature(t,st){const E=st.ev;crea.visible=false;const cr=(x)=>(x-1230)*PX;const L=(a,b,u)=>a+(b-a)*u;let p=null,sc=1,ry=0,sq=0,rz=0;
 if(t>=E.reveal&&t<E.drop){const u=(t-E.reveal)/(E.drop-E.reveal);p=V(cr(L(1100,1500,u)),2.9+Math.sin(t*6)*.02,.2);rz=Math.PI;sc=1}
 else if(t>=E.drop&&t<E.smash){const u=Math.min(1,(t-E.drop)/.35);const lu=st.posx.lucia;const sh=V(cr(lu)+.22,1.5,.14);const top=V(cr(1500),2.8,.2);p=top.clone().lerp(sh,u*u);if(u>=1){p.x+=Math.sin(t*14)*.14;p.y+=Math.cos(t*17)*.08}rz=u>=1?Math.sin(t*12)*1.2:Math.PI*(1-u);sc=.8}
 else if(t>=E.smash&&t<E.smash+1.3){const lu=st.posx.lucia;p=V(cr(lu)+.22,1.42,.16);sq=.9;sc=.8}
 if(!p)return;crea.visible=true;crea.position.copy(p);crea.scale.set(sc,sc*(1-sq*.8),sc);crea.rotation.z=rz;const ph=t*26;cLegs.forEach(({u,l,s,k},i)=>{const a=ph+k*1.1+(s>0?0:Math.PI);const up=Math.max(0,Math.sin(a))*.08;const root=V(s*.15,-.02,(k-1.5)*.07);const mid=V(s*(.3+k*.01),.06+up,(k-1.5)*.11-0);const end=V(s*(.5+k*.01),-.08+up*.4,(k-1.5)*.13);setL(u,root,mid);setL(l,mid,end)})}
function setL(g,a,b){const d=b.clone().sub(a),len=d.length();g.position.copy(a);g.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());g.scale.set(1,len,1)}
// ---------- characters
const NAMES=['beto','diego','sofi','lucia','marta'];const chars={};for(const n of NAMES){chars[n]=makeChar(n);scene.add(chars[n].root)}
// ---------- camera + operator rig
const cam=new THREE.PerspectiveCamera(50,OW/OH,.03,80);scene.add(cam);
const rig=new THREE.Group();cam.add(rig);
function mkLimbR(r0,r1,mat){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,1,14),mat);c.position.y=.5;g.add(c);const s=new THREE.Mesh(new THREE.SphereGeometry(r1,14,10),mat);g.add(s);g.userData={c,s};return g}
const skinOp=new THREE.MeshStandardMaterial({color:0xe0a98a,roughness:.5,emissive:0x3a2218});const sleeveM=M(0x55606e,{roughness:.9,emissive:0x151a22});const fillL=new THREE.PointLight(0xfff0e0,1.2,3,1.5);fillL.position.set(.1,.2,.2);cam.add(fillL);
const sleeve=mkLimbR(.1,.075,sleeveM);rig.add(sleeve);
const opHand=(()=>{const g=new THREE.Group();const pm=new THREE.Mesh(new THREE.CapsuleGeometry(.03,.05,6,10),skinOp);pm.scale.set(1.5,1,.62);pm.rotation.z=Math.PI/2;g.add(pm);const fing=[];[.06,.068,.063,.05].forEach((L,i)=>{let par=g,off=V((i-1.5)*.022,.05,0);const segs=[];for(let j=0;j<3;j++){const sg=new THREE.Group();sg.position.copy(off);const m=new THREE.Mesh(new THREE.CapsuleGeometry(.0115-j*.001,L/3*.7,4,8),skinOp);m.position.y=L/6;sg.add(m);if(j===2){const n=new THREE.Mesh(new THREE.SphereGeometry(.007,8,8),new THREE.MeshBasicMaterial({color:0xf6d6c8}));n.scale.set(1,.5,1.2);n.position.set(0,L/3*.78,.008);sg.add(n)}par.add(sg);par=sg;off=V(0,L/3,0);segs.push(sg)}fing.push(segs)});
 const th=new THREE.Group();th.position.set(.038,.01,.015);const t1=new THREE.Mesh(new THREE.CapsuleGeometry(.013,.034,4,8),skinOp);t1.position.y=.026;th.add(t1);g.add(th);const fl=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.022,.02,.2,16),M(0x2a2e36,{metalness:.5,roughness:.4}));body.position.set(0,.05,-.045);fl.add(body);const head=new THREE.Mesh(new THREE.CylinderGeometry(.034,.024,.06,16),M(0x4a505c,{metalness:.6,roughness:.3}));head.position.set(0,.18,-.045);fl.add(head);const lens=new THREE.Mesh(new THREE.CircleGeometry(.03,16),new THREE.MeshBasicMaterial({color:0xfffbe0}));lens.rotation.x=-Math.PI/2;lens.position.set(0,.21,-.045);fl.add(lens);g.add(fl);
 fing.forEach(segs=>segs.forEach((sg,j)=>{sg.rotation.x=-1.0*(j+1)*.55}));th.rotation.set(-.4,0,-.5);return {g,fl,fing}})();
rig.add(opHand.g);
const spot=new THREE.SpotLight(0xdde9ff,22,16,.55,.75,1.4);spot.castShadow=true;spot.shadow.mapSize.set(1024,1024);spot.shadow.bias=-.0005;spot.shadow.camera.near=.3;cam.add(spot);const spotT=new THREE.Object3D();cam.add(spotT);spot.target=spotT;
const leftHand=(()=>{const g=new THREE.Group();const pm=new THREE.Mesh(new THREE.CapsuleGeometry(.03,.05,6,10),skinOp);pm.scale.set(1.5,1,.62);pm.rotation.z=Math.PI/2;g.add(pm);[.06,.068,.063,.05].forEach((L,i)=>{let par=g,off=V((i-1.5)*.022,.05,0);for(let j=0;j<3;j++){const sg=new THREE.Group();sg.position.copy(off);const m=new THREE.Mesh(new THREE.CapsuleGeometry(.0115-j*.001,L/3*.7,4,8),skinOp);m.position.y=L/6;sg.add(m);sg.rotation.x=-.08*(j+1);par.add(sg);par=sg;off=V(0,L/3,0)}});const th=new THREE.Group();th.position.set(-.038,.01,.015);th.rotation.set(-.3,0,.8);const t1=new THREE.Mesh(new THREE.CapsuleGeometry(.013,.034,4,8),skinOp);t1.position.y=.026;th.add(t1);g.add(th);g.visible=false;return g})();rig.add(leftHand);
// ---------- frame
const PXm=PX;const X=px=>(px-1230)*PXm,Y=py=>(1500-py)*PXm;
function placeCamera(st,f){if(window.DBG&&window.DBG.cam){const d=window.DBG.cam;cam.position.set(d[0],d[1],d[2]);cam.lookAt(d[3],d[4],d[5]);return}const [cx,cy,z,rot]=f.cam;const [sx,sy,sr]=f.shake;const hm=1920/(z*617);const d=hm/(2*Math.tan(25*Math.PI/180));const T=V(X(cx),Y(cy),0);cam.position.set(T.x-sx*PXm/z,T.y+sy*PXm/z,d);cam.up.set(0,1,0);cam.lookAt(T.x-sx*PXm/z,T.y+sy*PXm/z,0);cam.rotateZ(-(rot+sr)*Math.PI/180)}
function operator(f){const o=f.op;const sx=(px)=>(px-540)/540*.2623,sy=(py)=>-(py-960)/960*.4663;const dz=1.0;
 const wx=sx(o.wx)*dz,wy=sy(o.wy)*dz;opHand.g.position.set(wx,wy,-dz);opHand.g.rotation.set(-.2,0,-(o.ang)*Math.PI/180*-1);opHand.g.rotation.z=-o.ang*Math.PI/180;
 const a=V(wx+.2,wy-.6,-dz),b=V(wx,wy-.06,-dz);const d=b.clone().sub(a),len=d.length();sleeve.position.copy(a);sleeve.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());sleeve.userData.c.scale.set(1,len,1);sleeve.userData.s.position.y=len;
 // beam
 const ox=opHand.g.localToWorld(V(0,.21,-.045));const lensCam=cam.worldToLocal(ox.clone());spot.position.copy(lensCam);const tx=sx(o.bx)*8,ty=sy(o.by)*8;spotT.position.set(tx,ty,-8);spot.intensity=o.on?22:0}
function renderFrame(i){const f=ST.frames[i];const t=f.t;const E=ST.ev;
 // chars
 for(const n of NAMES){const c=f.chars[n];chars[n].root.visible=!(n==='sofi'&&!f.sofiOn);chars[n].update(c,X(c.x))}
 // environment treadmill
 const LAND=ST.land;const prog=f.D/LAND*3.2;stairG.position.set(0,0,0);const off=-(prog%PITCH);steps.forEach((s,k)=>{s.position.z=(k-30)*PITCH+off});posts.forEach((p,k)=>{p.position.z=((k%21)-12)*1.2-(prog%1.2)});
 const nBase=Math.floor(f.D/LAND);doors.forEach((d,i)=>{const n=nBase-1+i;const s=(f.D/LAND-n)*3.2;const yb=s+1.05;d.g.position.set(.4,yb,-2.45);if(d.n!==n){d.n=n;const fl=14-n;d.lab.material.map=labelTex(String(fl));d.lab.material.needsUpdate=true;d.floor=fl}d.g.visible=(n>=0&&Math.abs(s)<7);const k=Math.sin(t*23+n*7.1)*Math.sin(t*9.3+n*2.7)+Math.sin(t*61+n)*.3>-.15;d.bulb.visible=k;d.dark.visible=d.floor===11;d.eyes.forEach(e=>e.visible=d.floor===11&&t>E.clicks-1&&t<E.reveal&&Math.sin(t*9)>-.3)});
 reds.forEach((L,i)=>{const k=Math.sin(t*23+i*7.1)*Math.sin(t*9.3+i*2.7)+Math.sin(t*61+i)*.3>-.15;L.intensity=k?2.2+Math.sin(t*6+i)*.4:.3});
 // dust
 const q=f.q;const arr=dust.geometry.attributes.position.array;for(let k=0;k<dN;k++){const s=dseed[k];arr[k*3]=-4+s[0]*9;arr[k*3+1]=((s[1]*4+t*(.12+s[2]*.2+q*.4))%4);arr[k*3+2]=-2+s[2]*5}dust.geometry.attributes.position.needsUpdate=true;
 // collapse
 rubble.visible=t>E.collapse;if(rubble.visible){const u=Math.min(1,(t-E.collapse)/.5);rubble.position.y=(1-u)*3}holeM.visible=t>E.collapse;
 if(t>E.collapse){const u=Math.min(1,(t-E.collapse)/.5);chars.beto.root.position.y=-u*.12}
 // wall burst
 blocks.forEach(b=>{const d=b.userData;if(t<E.wallburst||Math.abs(d.ix-4.6)>3.2&&Math.abs(d.iy-1.8)>2){b.visible=true;b.position.copy(d.p0);b.rotation.set(0,0,0);return}const u=t-E.wallburst;const cxk=(d.ix-4.6),cyk=(d.iy-1.8);if(Math.hypot(cxk,cyk)<3.0){const v=2+Math.abs(Math.sin(d.ix*7+d.iy*3))*5;b.position.set(d.p0.x+cxk*u*v*.5,d.p0.y+cyk*u*v*.4-u*u*2,d.p0.z+u*v*1.6);b.rotation.set(u*3*cxk,u*2,u*4);b.visible=u<2.2}});
 eyeG.visible=t>=E.wallburst;if(eyeG.visible){const e=Math.min(1,(t-E.eye)/1.2);const bl=((t-E.eye)%4)>3.7?Math.abs(Math.sin(((t-E.eye)%4-3.7)/.3*Math.PI)):0;const op=Math.max(0,e*(1-bl*.95));eyeG.userData.lid1.rotation.x=1.5-op*2.2;eyeG.userData.lid2.rotation.x=-(.45-op*.45);eyeG.userData.light.intensity=Math.min(1,(t-E.wallburst)/1.2)*60;eyeG.position.x=.5+Math.sin(t*1.3)*.08}
 setCreature(t,{ev:E,posx:ST.posx});
 placeCamera(ST,f);operator(f);
 // left hand offering to Sofi
 const a8=ST.start.a8,a9e=ST.start.a9+ST.durs.a9;const lh=t>a8-.3&&t<a9e+.6;leftHand.visible=lh;if(lh){const u=Math.min(1,Math.max(0,(t-a8+.3)/.5))*(1-Math.min(1,Math.max(0,(t-a9e)/.5)));leftHand.position.set(-.18,-.5+u*.18,-1.0);leftHand.rotation.set(-.3,.2,.3)}
 renderer.render(scene,cam);
 // composite 2D
 g2.clearRect(0,0,OW,OH);g2.drawImage(renderer.domElement,0,0);
 if(f.glitch>0){const gl=f.glitch;for(let k=0;k<4+gl*6;k++){const y=Math.floor(Math.random()*OH),h=6+Math.random()*60*gl,dx=(Math.random()-.5)*60*gl;g2.drawImage(renderer.domElement,0,y,OW,h,dx,y,OW,h)}}
 if(f.flash>0){g2.fillStyle=`rgba(255,240,216,${f.flash})`;g2.fillRect(0,0,OW,OH)}
 if(f.fallBlack>0){g2.fillStyle=`rgba(0,0,0,${f.fallBlack})`;g2.fillRect(0,0,OW,OH)}
 hudDraw(f);
 return comp.toDataURL('image/png')}
function hudDraw(f){const k=OW/1080;g2.save();g2.scale(k,k);g2.font='700 38px "DejaVu Sans Mono",monospace';g2.lineWidth=5;g2.strokeStyle='#000';g2.fillStyle='#fff';
 if(f.hud){const on=Math.floor(f.t*1.6)%2===0;g2.fillStyle=on?'#ff2222':'rgba(255,34,34,.12)';g2.beginPath();g2.arc(86,96,15,0,7);g2.fill();g2.fillStyle='#fff';g2.strokeText('REC',116,108);g2.fillText('REC',116,108);const el=Math.max(0,f.t-f.cam0);const tc=[Math.floor(el/3600),Math.floor(el/60)%60,Math.floor(el)%60].map(v=>String(v).padStart(2,'0')).join(':');g2.font='36px "DejaVu Sans Mono",monospace';g2.strokeText(tc,760,108);g2.fillText(tc,760,108);g2.font='32px "DejaVu Sans Mono",monospace';g2.strokeText('SEP 18 2025  22:41',70,1780);g2.fillText('SEP 18 2025  22:41',70,1780);g2.strokeText('SP ▮▮▮▯',800,1780);g2.fillText('SP ▮▮▮▯',800,1780);
  g2.strokeStyle='rgba(255,255,255,.75)';g2.lineWidth=4;for(const [x,y,dx,dy] of [[50,50,1,1],[1030,50,-1,1],[50,1870,1,-1],[1030,1870,-1,-1]]){g2.beginPath();g2.moveTo(x+dx*60,y);g2.lineTo(x,y);g2.lineTo(x,y+dy*60);g2.stroke()}}
 if(f.cap){g2.textAlign='center';const lines=f.cap.lines;const fs=lines.length>2?50:56;const y0=1560-(lines.length-1)*34;g2.font=`800 ${fs}px Inter,Arial`;g2.lineJoin='round';g2.lineWidth=10;g2.strokeStyle='#000';g2.fillStyle='#fff';lines.forEach((l,i)=>{g2.strokeText(l,540,y0+i*(fs+10));g2.fillText(l,540,y0+i*(fs+10))});g2.font='800 30px Inter,Arial';g2.lineWidth=7;g2.fillStyle='#ffd54a';g2.strokeText(f.cap.name,540,y0-fs-14);g2.fillText(f.cap.name,540,y0-fs-14)}
 g2.restore()}
function hookFrame(f){// creature leaping at the lens
 opHand.g.visible=false;leftHand.visible=false;spot.intensity=0;doors.forEach(d=>d.g.visible=false);for(const n of NAMES)chars[n].root.visible=false;crea.visible=true;const u=Math.min(1,f.t/2.8);crea.position.set(Math.sin(f.t*40)*.01,1.55+Math.sin(f.t*37)*.01,1.2-u*u*1.05);crea.scale.setScalar(1.3);crea.rotation.set(0,Math.PI,Math.sin(f.t*30)*.1);crea.rotation.y=Math.PI;cLegs.forEach(({u:uu,l,s,k})=>{const a=f.t*30+k*1.1+(s>0?0:Math.PI);const up=Math.max(0,Math.sin(a))*.1;setL(uu,V(s*.15,-.02,(k-1.5)*.07),V(s*(.3),.06+up,(k-1.5)*.11));setL(l,V(s*.3,.06+up,(k-1.5)*.11),V(s*.5,-.1+up*.4,(k-1.5)*.13))});
 cam.position.set(0,1.55,2.3);cam.lookAt(0,1.55,0);cam.rotation.z=Math.sin(f.t*20)*.04;reds.forEach(L=>L.intensity=1.5+Math.sin(f.t*22)*1);fillL.intensity=6;
 renderer.render(scene,cam);g2.clearRect(0,0,OW,OH);g2.drawImage(renderer.domElement,0,0);const fl=f.t>2.4?(f.t-2.4)/.4:Math.max(0,Math.sin(f.t*34))*.3;g2.fillStyle=`rgba(255,255,255,${Math.min(1,fl)})`;g2.fillRect(0,0,OW,OH);return comp.toDataURL('image/png')}
window.initScene=async(url)=>{const r=await fetch(url);ST=await r.json();window.READY=true;return ST.N};
window.renderFrame=(i)=>{const f=ST.frames[i];f.cam0=ST.ev.cam;if(f.t<2.8)return hookFrame(f);return renderFrame(i)};
