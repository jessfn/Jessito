import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {makeChar2} from './char3dm.js';
import {buildStation} from './station3d.js';
const Q=new URLSearchParams(location.search);const OW=+(Q.get('w')||720),OH=Math.round(OW*16/9);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(OW,OH);renderer.shadowMap.enabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const ST=buildStation(scene);
const camera=new THREE.PerspectiveCamera(46,OW/OH,.05,90);
const spot=new THREE.SpotLight(0xdde9ff,45,18,.5,.7,1.4);spot.castShadow=true;spot.shadow.mapSize.set(1024,1024);scene.add(spot,spot.target);
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
// ---- mocap source (Mixamo skeleton, real human motion)
const gltf=await new Promise(r=>new GLTFLoader().load('models/Xbot.glb',r));
const names=['Hips','Spine2','Head','LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot','LeftToeBase'];
function mkSource(){const o=THREE.SkeletonUtils?null:null;return null}
import * as SU from 'three/addons/utils/SkeletonUtils.js';
function makeSource(){const o=SU.clone(gltf.scene);o.visible=false;scene.add(o);const mx=new THREE.AnimationMixer(o);const acts={};gltf.animations.forEach(a=>acts[a.name]=mx.clipAction(a));const B={};for(const n of names)B[n]=o.getObjectByName('mixamorig:'+n)||o.getObjectByName('mixamorig'+n);o.updateMatrixWorld(true);
 const wp=b=>{const v=new THREE.Vector3();b.getWorldPosition(v);return v};const wq=b=>{const q=new THREE.Quaternion();b.getWorldQuaternion(q);return q};
 const rest={q:{},p:{}};for(const n of names){rest.p[n]=wp(B[n]);rest.q[n]=wq(B[n])}
 // basis: forward from foot->toe
 const f=rest.p.LeftToeBase.clone().sub(rest.p.LeftFoot);f.y=0;f.normalize();const up=V(0,1,0);const xA=new THREE.Vector3().crossVectors(up,f).normalize();
 const hipsY=rest.p.Hips.y;
 return {o,mx,acts,B,rest,wp,wq,f,xA,hipsY,cur:null,armLen:rest.p.LeftArm.distanceTo(rest.p.LeftHand),legLen:rest.p.LeftUpLeg.distanceTo(rest.p.LeftFoot),hipW:rest.p.LeftUpLeg.distanceTo(rest.p.RightUpLeg)}}
function playA(src,name,fade=.3){const n=src.acts[name];if(!n||src.cur===n)return;n.reset().fadeIn(fade).play();if(src.cur)src.cur.fadeOut(fade);src.cur=n}
// ---- our characters (their designs) driven by mocap
const SHx=.215,L_ARM=.55+.0,L_LEG=.85;
function makeActor(name,x,z){const ch=makeChar2(name);scene.add(ch.root);const src=makeSource();const kid=name==='sofi';return {name,ch,src,x,z,yaw:0,kid,hip:null}}
function toLocal(a,v){// mixamo world -> our character-local (x right-ish, y up, z forward), relative to the mocap root
 const s=a.src;const r=v.clone().sub(s.rest.p.Hips).setY(v.y);return V(r.dot(s.xA),v.y,r.dot(s.f))}
function drive(a,pose,hands){const s=a.src;s.o.updateMatrixWorld(true);const P=n=>s.wp(s.B[n]);
 const kArm=(.62)/s.armLen*(a.kid?1:1),kLeg=(.85)/s.legLen;const sc=a.kid?.72:1;
 const dirs=['Left','Right'];const lp=n=>toLocal(a,P(n));
 const SHs=[V(-.215,1.38,0),V(.215,1.38,0)],HPs=[V(-.1,.95,0),V(.1,.95,0)];
 // which mocap side is our index 0 (x<0)?
 const lx=lp('LeftArm').x,rx=lp('RightArm').x;const map=lx<rx?['Left','Right']:['Right','Left'];
 const wr=[],el=[],an=[],kn=[];
 for(let i=0;i<2;i++){const side=map[i];const S0=lp(side+'Arm');const E0=lp(side+'ForeArm'),H0=lp(side+'Hand');wr.push(SHs[i].clone().add(H0.sub(S0).multiplyScalar(kArm)));el.push(SHs[i].clone().add(E0.sub(S0).multiplyScalar(kArm)));
  const U0=lp(side+'UpLeg'),K0=lp(side+'Leg'),F0=lp(side+'Foot');an.push(HPs[i].clone().add(F0.sub(U0).multiplyScalar(kLeg)));kn.push(HPs[i].clone().add(K0.sub(U0).multiplyScalar(kLeg)).add(V(0,0,.0)))}
 // torso/head rotation relative to rest (world delta), expressed in the actor frame
 const dq=n=>s.wq(s.B[n]).multiply(s.rest.q[n].clone().invert());
 const frameQ=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(s.xA,V(0,1,0),s.f));const fInv=frameQ.clone().invert();
 const loc=q=>fInv.clone().multiply(q).multiply(frameQ);
 const dHips=loc(dq('Hips')),dSp=loc(dq('Spine2')),dHd=loc(dq('Head'));
 const id=new THREE.Quaternion();const half=q=>id.clone().slerp(q,.5);
 const hipsP=toLocal(a,P('Hips'));const dy=(hipsP.y-s.hipsY)*(a.kid?1:1);
 const hh=s.hipsY;
 const m={x:a.x,z:a.z,yaw:a.yaw,dy:dy*(.95/hh),gx:hipsP.x*.5,gz:hipsP.z*.5,pelvisQ:half(dHips),spineQ:half(dSp),chestQ:half(dSp),wr,el,an,kn,headQ:dHd,ex:pose.ex,st:{blink:pose.blink||0,talk:pose.talk||0,look:pose.look||[0,0]},hands};
 a.ch.updateM(m)}
// ---- actors
const A={diego:makeActor('diego',-.9,.2),marta:makeActor('marta',.7,.3),beto:makeActor('beto',-2.2,.1),lucia:makeActor('lucia',1.9,.0),sofi:makeActor('sofi',-.3,.9)};
for(const a of Object.values(A)){a.src.o.position.set(0,0,0)}
let lastT=0;
const turn=(a,tgt,k)=>{let d=tgt-a.yaw;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;a.yaw+=d*k};
const sh=(t,k)=>Math.sin(t*k)*.5+Math.sin(t*k*2.3+1)*.3;
// choreography (seconds): 0-2 scared idle facing camera, 2-4 turn to the train (body) + shock, 4-7 walk in profile, 7-9 run toward camera screaming
const F=Math.PI; // facing +z (camera) = yaw 0 in our rig
window.renderAt=(t)=>{const dt=Math.max(0,t-lastT);lastT=t;
 const ph=t<2?0:t<4?1:t<7?2:3;
 const ex=[{diego:'fear',marta:'worry',beto:'sad',lucia:'fear',sofi:'sad'},{diego:'shock',marta:'shock',beto:'fear',lucia:'shock',sofi:'fear'},{diego:'worry',marta:'fear',beto:'worry',lucia:'worry',sofi:'fear'},{diego:'scream',marta:'scream',beto:'scream',lucia:'scream',sofi:'scream'}][ph];
 for(const [k,a] of Object.entries(A)){const s=a.src;
  if(ph===0){playA(s,k==='beto'?'sad_pose':'idle');turn(a,0,.1)}
  else if(ph===1){playA(s,'idle');turn(a,-1.15,.07)}
  else if(ph===2){playA(s,k==='beto'?'sneak_pose':'walk');turn(a,-Math.PI/2,.12);a.x-=dt*(k==='beto'?.5:1.0);}
  else{playA(s,'run');turn(a,0,.14);a.z+=dt*(k==='beto'?1.2:2.0);a.x+=(({diego:-.6,marta:.5,beto:-1.5,lucia:1.2,sofi:-.1})[k]-a.x)*.03}
  s.mx.update(dt);
  const talk=(k==='diego'&&ph===0)||(ph===3&&k!=='sofi')?Math.max(0,Math.sin(t*14+k.length))*.8:0;
  drive(a,{ex:ex[k],blink:Math.max(0,Math.sin(t*3+k.length*1.7)-.97)*30,talk,look:[ph===1||ph===2?-.7:0,.1]},[{hand:ph===3?'open':'relax'},{hand:ph===3?'open':'relax'}])}
 // camera: handheld, push in, whip, follow
 const cam=[[0,[0,1.5,5.2],[0,1.1,0]],[2,[-.4,1.45,4.1],[-.3,1.2,0]],[4,[-2.2,1.4,4.4],[-2.6,1.1,0]],[7,[0,1.3,5.2],[0,1.2,2]]];
 let i=0;while(i+1<cam.length&&cam[i+1][0]<=t)i++;const c0=cam[i],c1=cam[Math.min(i+1,cam.length-1)];const u=sm((t-c0[0])/Math.max(.001,c1[0]-c0[0]));
 const P=V(...c0[1]).lerp(V(...c1[1]),u),Tg=V(...c0[2]).lerp(V(...c1[2]),u);
 camera.position.set(P.x+sh(t,1.3)*.035,P.y+sh(t,1.9)*.03,P.z);camera.lookAt(Tg.x+sh(t,.8)*.03,Tg.y+sh(t,1.1)*.025,Tg.z);camera.rotation.z+=sh(t,1.1)*.014;
 spot.position.set(camera.position.x+.3,camera.position.y-.4,camera.position.z-.1);spot.target.position.copy(Tg);
 ST.reds[0].intensity=8+7*Math.sin(t*9);for(const f of ST.flick){if(f.light)f.light.intensity=f.base*(Math.sin(t*23+f.light.position.z)>-.5?1:.2)}
 ST.dust.rotation.y=t*.02;
 renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')};
window.READY=true;
