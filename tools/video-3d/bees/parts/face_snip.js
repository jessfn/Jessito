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
  const T={browUp:mk(),browDown:mk(),browInner:mk(),wide:mk(),squint:mk(),frown:mk(),stretch:mk(),sneer:mk()};
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
    T.frown[i*3]-=sd[0]*0.9;T.frown[i*3+1]-=sd[1]*1.4+0.010*ws;T.frown[i*3+2]-=sd[2]*0.9;
    const sg=Math.sign(x-mid.x);T.stretch[i*3]+=sg*0.010*ws;T.stretch[i*3+1]-=0.003*ws;
  }
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
