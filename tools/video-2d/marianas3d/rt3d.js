import {THREE,loadChar,loadClips,rotBoneChar,twoBoneIK,curlHand,resetFingers,applyMorphs,faceVals,V3} from '/char3d.js';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,x)=>a+(b-a)*x;
const CLIPS=['M_Standing_Idle_001','M_Falling_Idle_002','M_Standing_Idle_Variations_002','M_Standing_Idle_Variations_005','M_Standing_Expressions_010'];
export async function createRT(opts={}){
  const ch=await loadChar();const mixer=new THREE.AnimationMixer(ch.fig);const clips=await loadClips(ch,CLIPS,mixer);ch.mixer=mixer;ch.clips=clips;
  styleChar(ch,opts);
  return ch;}
// ---------- look: light skin, outfit, ink outline ----------
export function styleChar(ch,o){
  const skinTint=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n {float l=dot(diffuseColor.rgb,vec3(.299,.587,.114));float sd=clamp(l*2.6,.62,1.0);diffuseColor.rgb=vec3(.99,.76,.63)*sd+vec3(.05,.012,.004);}');};
  ch.fig.traverse(o2=>{if(!o2.isMesh)return;const n=o2.name;const m=o2.material;
    if(n==='Wolf3D_Head'||n==='Wolf3D_Body'){m.onBeforeCompile=skinTint;m.needsUpdate=true;m.roughness=.62;}
    if(n==='Wolf3D_Outfit_Top'){m.map=null;m.color.set(o.top||0xf0b429);m.roughness=.85;m.needsUpdate=true;}
    if(n==='Wolf3D_Outfit_Bottom'){m.map=null;m.color.set(o.bottom||0x3d5f94);m.roughness=.9;m.needsUpdate=true;}
    if(n==='Wolf3D_Outfit_Footwear'){m.map=null;m.color.set(o.shoes||0xf4f4f4);m.roughness=.6;m.needsUpdate=true;}
    if(n==='Wolf3D_Hair'){m.color.set(o.hair||0x2a1a12);m.needsUpdate=true;}
  });
  // ink outline: inverted-hull clones sharing the skeleton
  if(o.outline!==0){const w=o.outline||.0042;const list=[];ch.fig.traverse(m=>{if(m.isSkinnedMesh&&['Wolf3D_Head','Wolf3D_Body','Wolf3D_Outfit_Top','Wolf3D_Outfit_Bottom','Wolf3D_Outfit_Footwear','Wolf3D_Hair'].includes(m.name))list.push(m);});
    for(const m of list){const mat=new THREE.MeshBasicMaterial({color:0x120d22,side:THREE.BackSide});mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <skinning_vertex>','#include <skinning_vertex>\n transformed += normalize(objectNormal)*'+w.toFixed(5)+';');};
      const c=new THREE.SkinnedMesh(m.geometry,mat);c.skeleton=m.skeleton;c.bindMatrix.copy(m.bindMatrix);c.bindMatrixInverse.copy(m.bindMatrixInverse);c.frustumCulled=false;c.morphTargetInfluences=m.morphTargetInfluences;c.morphTargetDictionary=m.morphTargetDictionary;c.name=m.name+'_ink';m.parent.add(c);}}
}
// expression params -> morph weights
export function faceFromParams(F){const w={};const s=v=>clamp(v||0);
  w.jawOpen=s(F.jaw);w.mouthSmile_L=w.mouthSmile_R=s(F.smile);w.mouthFrown_L=w.mouthFrown_R=s(F.frown);w.browInnerUp=s(F.browIn);w.browOuterUp_L=w.browOuterUp_R=s(F.brow);w.browDown_L=w.browDown_R=s(F.browD);
  w.eyeWide_L=w.eyeWide_R=s(F.wide);w.eyeSquint_L=w.eyeSquint_R=s(F.squint);w.eyeBlink_L=w.eyeBlink_R=s(F.blink);w.mouthStretch_L=w.mouthStretch_R=s(F.stretch);w.noseSneer_L=w.noseSneer_R=s(F.sneer);w.cheekSquint_L=w.cheekSquint_R=s(F.cheek);
  w.eyeLookDown_L=w.eyeLookDown_R=s(F.lookD);w.eyeLookUp_L=w.eyeLookUp_R=s(F.lookU);w.cheekPuff=s(F.puff);return w;}
const tmp=new THREE.Vector3();
function wp(b){return b.getWorldPosition(new THREE.Vector3());}
// apply a pose P. Units: holder scale = px per metre (world = 2D world px, y up = -y2D)
export function poseRT(ch,P){
  const B=ch.bones;const {ACT,ANIM}=ch.clips;let sum=0;for(const e of P.mix)sum+=e.w;for(const k in ACT)ACT[k].setEffectiveWeight(0);
  for(const e of P.mix){const a=ACT[e.n],d=ANIM[e.n].duration;a.setEffectiveWeight(e.w/sum);a.time=((e.time%d)+d)%d;}
  ch.mixer.update(0);
  ch.holder.scale.setScalar(P.ppm);ch.holder.rotation.set(P.rot[0],P.rot[1],P.rot[2],'YXZ');ch.holder.position.set(0,0,0);ch.holder.updateMatrixWorld(true);
  resetFingers(ch);
  const sb=P.spine||[0,0,0];for(const n of ['Spine','Spine1','Spine2'])rotBoneChar(ch,B[n],sb[0]/3,sb[1]/3,sb[2]/3);
  const nk=P.neck||[0,0,0];rotBoneChar(ch,B.Neck,nk[0]*.4,nk[1]*.4,nk[2]*.4);rotBoneChar(ch,B.Head,nk[0]*.6,nk[1]*.6,nk[2]*.6);
  // place hips at the requested anchor (pivot = rest hips)
  ch.holder.updateMatrixWorld(true);const hw=wp(B.Hips);ch.holder.position.set(P.anchor[0]-hw.x,P.anchor[1]-hw.y,P.anchor[2]||0);ch.holder.updateMatrixWorld(true);
  const S=P.ppm;const q=ch.holder.getWorldQuaternion(new THREE.Quaternion());const toW=v=>v.clone().multiplyScalar(S).applyQuaternion(q);
  const head=wp(B.Head),chest=wp(B.Spine2);
  const targets={ear:(L,sh)=>head.clone().add(toW(V3(L*.105,-.01,-.01))),chest:(L,sh)=>chest.clone().add(toW(V3(L*.04,.02,.14))),face:(L,sh)=>head.clone().add(toW(V3(L*.04,-.02,.34))),
    shield:(L,sh)=>head.clone().add(toW(V3(L*.07,.07,.25))),swim:(L,sh,ph)=>sh.clone().add(toW(V3(L*(.12+.06*Math.sin(ph*.5)),-.22+.2*Math.sin(ph),.28*Math.cos(ph)+.22))),
    float:(L,sh,ph,g)=>sh.clone().add(toW(V3(L*(g.fx??.32),g.fy??.28,g.fz??.2))),rail:(L,sh,ph,g)=>new THREE.Vector3(...P.railW),curl:(L,sh)=>chest.clone().add(toW(V3(L*.14,-.05,.2)))};
  for(const side of ['Left','Right']){const L=side==='Left'?1:-1;const G=P['arm'+side]||{};const sh=wp(B[side+'Arm']);let tot=0;const acc=new THREE.Vector3();
    for(const k in targets){const w=G[k]||0;if(w<=.001)continue;const T=targets[k](L,sh,P.swimPh+(side==='Left'?0:2.5),G);acc.addScaledVector(T,w);tot+=w;}
    if(tot>.001){acc.multiplyScalar(1/tot);const w=Math.min(1,tot);const pole=sh.clone().add(toW(V3(L*.5,-.8,-.7)));twoBoneIK(B[side+'Arm'],B[side+'ForeArm'],B[side+'Hand'],acc,pole,w);}
    curlHand(ch,side,P['curl'+side]===undefined?.3:P['curl'+side],.35);}
  for(const side of ['Left','Right']){const L=side==='Left'?1:-1;const G=P['leg'+side]||{};const hip=wp(B[side+'UpLeg']);const len=wp(B[side+'Foot']).distanceTo(hip);let tot=0;const acc=new THREE.Vector3();const ph=P.kickPh+(side==='Left'?0:Math.PI);
    const tg={kick:()=>hip.clone().add(toW(V3(L*.04,-(len/S)*(.86-.16*Math.sin(ph)),.22*Math.sin(ph+1.6)+.05))),tuck:()=>hip.clone().add(toW(V3(L*.08,-(len/S)*.6,.22))),float:()=>hip.clone().add(toW(V3(L*.07,-(len/S)*(G.fy??.9),G.fz??-.05)))};
    for(const k in tg){const w=G[k]||0;if(w<=.001)continue;acc.addScaledVector(tg[k](),w);tot+=w;}
    if(tot>.001){acc.multiplyScalar(1/tot);const w=Math.min(1,tot);const pole=hip.clone().add(toW(V3(L*.05,-.3,1)));twoBoneIK(B[side+'UpLeg'],B[side+'Leg'],B[side+'Foot'],acc,pole,w);if(G.toe)rotBoneChar(ch,B[side+'Foot'],G.toe*Math.min(1,tot),0,0);}}
  applyMorphs(ch,faceVals(faceFromParams(P.face||{})));
  ch.holder.updateMatrixWorld(true);
  ch.headW=wp(B.Head);ch.hipsW=wp(B.Hips);}
