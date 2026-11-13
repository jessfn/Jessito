import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);const load=u=>new Promise((r,e)=>loader.load(u,r,undefined,e));
export const CLIPS={};let SKEL=null;
export async function loadMocap(names){SKEL=await load('anims/skeleton.glb');await Promise.all(names.map(async n=>{const g=await load(`anims/${n}.glb`);CLIPS[n]=g.animations[0]}));return Object.keys(CLIPS)}
const FING=['index','middle','ring','pinky'];
export function makeSource(scene){const o=SU.clone(SKEL.scene);o.visible=false;scene.add(o);const mx=new THREE.AnimationMixer(o);const B={};o.traverse(n=>{if(n.isBone||n.name)B[n.name]=n});
 o.updateMatrixWorld(true);const wp=b=>{const v=new THREE.Vector3();b.getWorldPosition(v);return v};const wq=b=>{const q=new THREE.Quaternion();b.getWorldQuaternion(q);return q};
 const rest={p:{},q:{},lq:{}};for(const n in B){rest.p[n]=wp(B[n]);rest.q[n]=wq(B[n]);rest.lq[n]=B[n].quaternion.clone()}
 const f=rest.p.ball_l.clone().sub(rest.p.foot_l);f.y=0;f.normalize();const xA=new THREE.Vector3().crossVectors(V(0,1,0),f).normalize();
 const S={o,mx,B,rest,wp,wq,f,xA,cur:null,acts:{},hipsY:rest.p.pelvis.y,armLen:rest.p.upperarm_l.distanceTo(rest.p.hand_l),legLen:rest.p.thigh_l.distanceTo(rest.p.foot_l)};
 S.play=(name,fade=.3,speed=1)=>{if(!S.acts[name])S.acts[name]=mx.clipAction(CLIPS[name]);const a=S.acts[name];a.timeScale=speed;if(S.cur===a)return;a.reset().fadeIn(fade).play();if(S.cur)S.cur.fadeOut(fade);S.cur=a};
 return S}
function ang(s,n){const q=s.B[n].quaternion.clone().multiply(s.rest.lq[n].clone().invert());const w=Math.min(1,Math.abs(q.w));return 2*Math.acos(w)}
export function sample(s,kid=false){s.o.updateMatrixWorld(true);const P=n=>s.wp(s.B[n]);
 const loc=(v)=>{const r=v.clone().sub(s.rest.p.pelvis).setY(0);return V(r.dot(s.xA),v.y,r.dot(s.f))};
 const kArm=.60/s.armLen,kLeg=.85/s.legLen;
 const SHs=[V(-.215,1.38,0),V(.215,1.38,0)],HPs=[V(-.1,.95,0),V(.1,.95,0)];
 const lx=loc(P('upperarm_l')).x,rx=loc(P('upperarm_r')).x;const map=lx<rx?['l','r']:['r','l'];
 const wr=[],el=[],an=[],kn=[],fingers=[],footQ=[];
 for(let i=0;i<2;i++){const sd=map[i];const S0=loc(P('upperarm_'+sd)),E0=loc(P('lowerarm_'+sd)),H0=loc(P('hand_'+sd));wr.push(SHs[i].clone().add(H0.sub(S0).multiplyScalar(kArm)));el.push(SHs[i].clone().add(E0.sub(S0).multiplyScalar(kArm)));
  const U0=loc(P('thigh_'+sd)),K0=loc(P('calf_'+sd)),F0=loc(P('foot_'+sd));an.push(HPs[i].clone().add(F0.sub(U0).multiplyScalar(kLeg)));kn.push(HPs[i].clone().add(K0.sub(U0).multiplyScalar(kLeg)));
  fingers.push({f:FING.map(fn=>[1,2,3].map(k=>ang(s,`${fn}_0${k}_${sd}`))),th:[ang(s,`thumb_01_${sd}`),ang(s,`thumb_02_${sd}`)+ang(s,`thumb_03_${sd}`)*.5]})}
 const frameQ=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(s.xA,V(0,1,0),s.f));const fInv=frameQ.clone().invert();
 const dq=n=>s.wq(s.B[n]).multiply(s.rest.q[n].clone().invert());const lq=q=>fInv.clone().multiply(q).multiply(frameQ);
 const id=new THREE.Quaternion();const half=q=>id.clone().slerp(q,.5);
 const hp=loc(P('pelvis'));const dHips=lq(dq('pelvis')),dSp=lq(dq('spine_03')),dHd=lq(dq('head'));
 return {wr,el,an,kn,fingers,pelvisQ:half(dHips),spineQ:half(dSp),chestQ:half(dSp),headQ:lq(dq('head')),dy:(hp.y-s.hipsY)*(.95/s.hipsY),gx:hp.x*.5,gz:hp.z*.5}}
