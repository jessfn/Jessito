import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,x)=>a+(b-a)*x;
export const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
export async function loadChar(opts={}){
  const rp=await new GLTFLoader().loadAsync('/models/youth.glb');
  const fig=rp.scene;const holder=new THREE.Group();holder.add(fig);
  const bones={};fig.traverse(o=>{if(o.isBone)bones[o.name]=o;});
  const faceMeshes=[];
  fig.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;if(o.morphTargetDictionary&&('mouthOpen' in o.morphTargetDictionary))faceMeshes.push(o);}});
  const mesh=n=>{let r=null;fig.traverse(o=>{if(o.isMesh&&o.name===n)r=o;});return r;};
// ---------- facial rig: synthesize extra morph targets on the head ----------
const headMesh=faceMeshes.find(m=>m.name==='Wolf3D_Head');
const eyeL=faceMeshes.find(m=>m.name==='EyeLeft'),eyeR=faceMeshes.find(m=>m.name==='EyeRight');
(function buildFace(){
  const bc=m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox.getCenter(new THREE.Vector3());};
  const eL=bc(eyeL),eR=bc(eyeR),mid=eL.clone().add(eR).multiplyScalar(.5);
  const geom=headMesh.geometry,P=geom.attributes.position,n=P.count;
  const dict=headMesh.morphTargetDictionary;const sm=geom.morphAttributes.position[dict.mouthSmile],op=geom.morphAttributes.position[dict.mouthOpen];
  let maxS=1e-6,maxO=1e-6;for(let i=0;i<n;i++){maxS=Math.max(maxS,Math.hypot(sm.getX(i),sm.getY(i),sm.getZ(i)));maxO=Math.max(maxO,Math.hypot(op.getX(i),op.getY(i),op.getZ(i)));}
  const g=(x,s)=>Math.exp(-(x*x)/(2*s*s));
  const band=(d,a,b,c)=>d<=a||d>=c?0:(d<b?(d-a)/(b-a):(c-d)/(c-b));
  const mk=()=>new Float32Array(n*3);
  const T={browUp:mk(),browDown:mk(),browInner:mk(),wide:mk(),squint:mk(),frown:mk(),stretch:mk(),sneer:mk(),puff:mk()};
  const eyes=[eL,eR];
  for(let i=0;i<n;i++){
    const x=P.getX(i),y=P.getY(i),z=P.getZ(i);
    const sd=[sm.getX(i),sm.getY(i),sm.getZ(i)],ws=Math.hypot(...sd)/maxS,wo=Math.hypot(op.getX(i),op.getY(i),op.getZ(i))/maxO;
    for(const e of eyes){
      const dx=x-e.x,dy=y-e.y,dz=z-e.z;if(dz<-0.02)continue;
      const wb=g(dx,0.030)*band(dy,0.010,0.026,0.058);
      if(wb>0){T.browUp[i*3+1]+=0.016*wb;T.browUp[i*3+2]+=0.003*wb;
        T.browDown[i*3+1]-=0.013*wb;T.browDown[i*3]+=0.14*(mid.x-e.x)*wb;
        const wi=wb*Math.max(0,1-Math.max(0,Math.abs(x-mid.x)-0.008)/0.04);T.browInner[i*3+1]+=0.020*wi;}
      const wu=g(dx,0.016)*band(dy,0.001,0.007,0.020), wl=g(dx,0.016)*band(dy,-0.018,-0.007,-0.001);
      T.wide[i*3+1]+=0.008*wu-0.003*wl;
      const wc=g(dx,0.022)*band(dy,-0.040,-0.012,-0.001);
      T.squint[i*3+1]+=0.007*wc-0.005*wu;
      const wn=g(x-mid.x,0.018)*band(y-e.y,-0.060,-0.040,-0.020);
      T.sneer[i*3+1]+=0.006*wn;
    }
    {const ey=mid.y;const dyc=y-ey;const lat=Math.abs(x-mid.x);const wc2=g(lat-0.062,0.020)*band(dyc,-0.095,-0.062,-0.030);const sg2=Math.sign(x-mid.x);T.puff[i*3]+=sg2*0.009*wc2;T.puff[i*3+2]+=0.004*wc2;}
    T.frown[i*3]-=sd[0]*0.9;T.frown[i*3+1]-=sd[1]*1.4+0.010*ws;T.frown[i*3+2]-=sd[2]*0.9;
    const sg=Math.sign(x-mid.x);T.stretch[i*3]+=sg*0.010*ws;T.stretch[i*3+1]-=0.003*ws;
  }
  for(const k in T){for(let q=0;q<T[k].length;q++)T[k][q]*=(k==='frown'||k==='stretch'?1.5:1.9);}
  for(const k in dict)geom.morphAttributes.position[dict[k]].name=k;
  for(const k in T){const a=new THREE.Float32BufferAttribute(T[k],3);a.name='x_'+k;geom.morphAttributes.position.push(a);}
  geom.morphTargetsRelative=true;headMesh.updateMorphTargets();
})();
const E={
 neutral:{},
 curious:{browInnerUp:.5,eyeWide_L:.4,eyeWide_R:.4,jawOpen:.12,mouthSmile_L:.15,mouthSmile_R:.15},
 shock:{browInnerUp:1,browOuterUp_L:1,browOuterUp_R:1,eyeWide_L:1,eyeWide_R:1,jawOpen:.7,mouthStretch_L:.3,mouthStretch_R:.3},
 fear:{browInnerUp:1,eyeWide_L:.85,eyeWide_R:.85,mouthFrown_L:.7,mouthFrown_R:.7,jawOpen:.18,eyeLookDown_L:.5,eyeLookDown_R:.5,mouthPress_L:.2,mouthPress_R:.2},
 calm:{mouthSmile_L:.3,mouthSmile_R:.3,eyeSquint_L:.25,eyeSquint_R:.25,browInnerUp:.1,cheekSquint_L:.2,cheekSquint_R:.2},
 strain:{browDown_L:1,browDown_R:1,eyeSquint_L:.8,eyeSquint_R:.8,jawOpen:.35,mouthStretch_L:.6,mouthStretch_R:.6,noseSneer_L:.6,noseSneer_R:.6,cheekSquint_L:.5,cheekSquint_R:.5,mouthFrown_L:.4,mouthFrown_R:.4},
 scream:{jawOpen:1,mouthStretch_L:.7,mouthStretch_R:.7,eyeWide_L:1,eyeWide_R:1,browInnerUp:1,browOuterUp_L:1,browOuterUp_R:1,mouthLowerDown_L:.6,mouthLowerDown_R:.6,mouthUpperUp_L:.4,mouthUpperUp_R:.4,noseSneer_L:.3,noseSneer_R:.3},
 screamShut:{jawOpen:1,mouthStretch_L:.8,mouthStretch_R:.8,eyeBlink_L:.9,eyeBlink_R:.9,browDown_L:.7,browDown_R:.7,mouthLowerDown_L:.6,mouthLowerDown_R:.6,noseSneer_L:.6,noseSneer_R:.6,cheekSquint_L:.6,cheekSquint_R:.6},
 frozen:{jawOpen:.45,eyeWide_L:1,eyeWide_R:1,browInnerUp:1,mouthStretch_L:.25,mouthStretch_R:.25,browOuterUp_L:.5,browOuterUp_R:.5},
 resign:{eyeBlink_L:.7,eyeBlink_R:.7,mouthSmile_L:.15,mouthSmile_R:.15,browInnerUp:.4,jawOpen:.05},
 closed:{eyeBlink_L:1,eyeBlink_R:1,browInnerUp:.3,mouthSmile_L:.1,mouthSmile_R:.1},
 happy:{mouthSmile_L:1,mouthSmile_R:1,cheekSquint_L:.7,cheekSquint_R:.7,eyeSquint_L:.35,eyeSquint_R:.35,jawOpen:.2,browOuterUp_L:.4,browOuterUp_R:.4},
 wink:{mouthSmile_L:1,mouthSmile_R:1,eyeBlink_L:1,cheekSquint_L:.9,eyeSquint_R:.3,jawOpen:.25,browOuterUp_R:.5}
};

  return {fig,holder,bones,faceMeshes,headMesh,mesh,E};
}
export async function loadClips(char,names,mixer){
  const ANIM={},ACT={},TRAVEL={};
  for(const n of names){const f=await new FBXLoader().loadAsync('/anim/'+n+'.fbx');const c=f.animations[0];
    c.tracks=c.tracks.filter(t=>!t.name.endsWith('.scale'));
    for(const t of c.tracks){if(t.name==='Hips.position'){const v=t.values,n3=v.length/3;const drift=(v[(n3-1)*3+2]-v[2])/c.duration;TRAVEL[n]=drift*.01;
      for(let i=0;i<n3;i++){v[i*3+2]-=drift*t.times[i];v[i*3]*=.01;v[i*3+1]*=.01;v[i*3+2]*=.01;}}}
    ANIM[n]=c;const a=mixer.clipAction(c);a.play();a.setEffectiveWeight(0);ACT[n]=a;}
  return {ANIM,ACT,TRAVEL};
}
export {THREE};

// ===================== runtime: world-frame bone rotations, two-bone IK, fingers, face =====================
const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_q3=new THREE.Quaternion(),_v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_v3=new THREE.Vector3(),_v4=new THREE.Vector3(),_e=new THREE.Euler();
// rotate a bone by a rotation expressed in the CHARACTER frame (holder), about the bone's own origin
export function rotBoneChar(ch,bone,x,y,z){if(!x&&!y&&!z)return;ch.holder.updateWorldMatrix(true,false);ch.holder.getWorldQuaternion(_q1);
  _e.set(x,y,z,'XYZ');_q2.setFromEuler(_e);_q3.copy(_q1).multiply(_q2).multiply(_q1.clone().invert()); // world delta
  bone.parent.updateWorldMatrix(true,false);bone.parent.getWorldQuaternion(_q1);bone.getWorldQuaternion(_q2);
  _q2.premultiply(_q3);bone.quaternion.copy(_q1.invert().multiply(_q2));bone.updateMatrixWorld(true);}
// aim so that the vector (from->to) rotates onto desired direction
function aimBone(bone,childPos,wantDir,w){bone.updateWorldMatrix(true,false);const bp=bone.getWorldPosition(_v1);const cur=_v2.copy(childPos).sub(bp).normalize();
  _q3.setFromUnitVectors(cur,wantDir.clone().normalize());if(w<1)_q3.slerp(new THREE.Quaternion(),1-w);
  bone.parent.updateWorldMatrix(true,false);bone.parent.getWorldQuaternion(_q1);bone.getWorldQuaternion(_q2);_q2.premultiply(_q3);bone.quaternion.copy(_q1.invert().multiply(_q2));bone.updateMatrixWorld(true);}
// analytic two-bone IK. root=UpperArm/UpLeg, mid=ForeArm/Leg, end=Hand/Foot. target & pole in WORLD space.
export function twoBoneIK(root,mid,end,target,pole,w){if(w<=.001)return;
  root.updateWorldMatrix(true,true);const A=root.getWorldPosition(new THREE.Vector3()),B=mid.getWorldPosition(new THREE.Vector3()),C=end.getWorldPosition(new THREE.Vector3());
  const l1=A.distanceTo(B),l2=B.distanceTo(C);const AT=target.clone().sub(A);let d=AT.length();d=clamp(d,Math.abs(l1-l2)+1e-3,l1+l2-1e-3);const dir=AT.normalize();
  const cosA=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),a=Math.acos(cosA);
  // pole direction orthogonal to dir
  const pv=pole.clone().sub(A);const ortho=pv.sub(dir.clone().multiplyScalar(pv.dot(dir)));if(ortho.lengthSq()<1e-8)ortho.set(0,0,1);ortho.normalize();
  const Bn=A.clone().add(dir.clone().multiplyScalar(Math.cos(a)*l1)).add(ortho.multiplyScalar(Math.sin(a)*l1));
  aimBone(root,B,Bn.clone().sub(A),w);root.updateWorldMatrix(true,true);
  const Bw=mid.getWorldPosition(new THREE.Vector3());const Cw=end.getWorldPosition(new THREE.Vector3());const Tn=A.clone().add(dir.clone().multiplyScalar(d));
  aimBone(mid,Cw,target.clone().sub(Bw),w);}
// finger curl: rotate every phalanx about the same axis in its own local frame (calibrated: -X curls toward palm on RPM)
const FING=['Thumb','Index','Middle','Ring','Pinky'];
export function curlHand(ch,side,k,thumb=.4){for(const f of FING){const kk=f==='Thumb'?thumb:k;for(let i=1;i<=3;i++){const b=ch.bones[`${side}Hand${f}${i}`];if(!b)continue;if(!b.userData.q0)b.userData.q0=b.quaternion.clone();
  _e.set(f==='Thumb'?0:kk*(i===1?1.1:1.2)*(side==='Left'?1:1),0,f==='Thumb'?-kk*.8*(side==='Left'?1:-1):0,'XYZ');b.quaternion.copy(b.userData.q0).multiply(_q2.setFromEuler(_e));}}}
export function resetFingers(ch){for(const k in ch.bones){const b=ch.bones[k];if(b.userData.q0&&/Hand(Thumb|Index|Middle|Ring|Pinky)/.test(k))b.quaternion.copy(b.userData.q0);}}
export function applyMorphs(ch,val){ch.faceMeshes.forEach(m=>{const d=m.morphTargetDictionary;for(const k in val){if(d[k]!==undefined)m.morphTargetInfluences[d[k]]=val[k];}});}
export function faceVals(w){const av=(a,b)=>((w[a]||0)+(w[b]||0))/2;const jo=w.jawOpen||0;
  return {mouthOpen:Math.min(1.8,jo*1.6),mouthSmile:clamp(av('mouthSmile_L','mouthSmile_R')*(1-jo*.5)),eyesClosed:clamp(av('eyeBlink_L','eyeBlink_R')),eyesLookDown:clamp(av('eyeLookDown_L','eyeLookDown_R')),eyesLookUp:clamp(av('eyeLookUp_L','eyeLookUp_R')),
   x_browUp:clamp(Math.max((w.browInnerUp||0)*.55,av('browOuterUp_L','browOuterUp_R'))),x_browInner:clamp(w.browInnerUp||0),x_browDown:clamp(av('browDown_L','browDown_R')),x_wide:clamp(av('eyeWide_L','eyeWide_R')),
   x_squint:clamp(av('eyeSquint_L','eyeSquint_R')+av('cheekSquint_L','cheekSquint_R')*.5),x_frown:clamp(av('mouthFrown_L','mouthFrown_R')),x_stretch:clamp(av('mouthStretch_L','mouthStretch_R')),x_sneer:clamp(av('noseSneer_L','noseSneer_R')),
   x_puff:clamp(w.cheekPuff||0),viseme_O:clamp(w.mouthFunnel||0),mouthPucker:clamp(w.mouthPucker||0)};}
