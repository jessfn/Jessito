const E_EXTRA={confident:{mouthSmile_L:.35,mouthSmile_R:.35,browOuterUp_L:.35,browOuterUp_R:.35,eyeSquint_L:.15,eyeSquint_R:.15,jawOpen:.08}};
Object.assign(E,E_EXTRA);
const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
const vac=wordT(0,'vacía'),wA=wordT(2,'almendras'),wM=wordT(2,'manzanas'),wB=wordT(2,'arándanos'),wF=wordT(3,'faltarían'),wMito=wordT(5,'mito');
const KF=[[0,'calm'],[2.6,'calm'],[3.7,'curious'],[vac-.2,'curious'],[vac+.15,'shock'],[ST[1]+.5,'shock'],[ST[1]+1.6,'fear'],[ST[2]-.2,'fear'],[wA-.3,'curious'],[wA+.1,'shock'],[wM-.2,'curious'],[wM+.1,'shock'],[wB-.2,'strain'],[wB+.2,'strain'],[ST[3]+.3,'fear'],[wF-.1,'fear'],[wF+.3,'frozen'],[wF+1.2,'resign'],[ST[4]+.3,'resign'],[ST[4]+2.4,'curious'],[ST[4]+3.2,'resign'],[ST[5]+.3,'calm'],[ST[5]+.9,'confident'],[wMito-.3,'confident'],[wMito+.1,'happy'],[ST[6]+.4,'calm'],[ST[6]+2.5,'happy'],[ST[7]-.2,'happy'],[ST[7]+1.0,'happy'],[ST[7]+2.2,'happy'],[ST[7]+2.5,'wink'],[ST[7]+3.3,'wink'],[ST[7]+3.7,'happy'],[TOTAL+5,'happy']];
function exprAt(t){
  let i=0;while(i<KF.length-2&&t>=KF[i+1][0])i++;
  const [t0,n0]=KF[i],[t1,n1]=KF[i+1];const k=sm((t-t0)/Math.max(.05,t1-t0));
  const w={};const A=E[n0],B=E[n1];
  for(const key in A)w[key]=A[key]*(1-k);for(const key in B)w[key]=(w[key]||0)+B[key]*k;
  const ph=(t%3.1),bl=ph<.16?Math.sin(ph/.16*Math.PI):0;
  w.eyeBlink_L=Math.min(1,(w.eyeBlink_L||0)+bl*(1-(w.eyeWide_L||0)*.7));w.eyeBlink_R=Math.min(1,(w.eyeBlink_R||0)+bl*(1-(w.eyeWide_R||0)*.7));
  return w;
}
const HEADMOT={x:0,y:0,z:0};
function applyFace(t){
  const w=exprAt(t);const av=(a,b)=>((w[a]||0)+(w[b]||0))/2;
  const val={mouthOpen:Math.min(1.8,(w.jawOpen||0)*1.6),mouthSmile:clamp(av('mouthSmile_L','mouthSmile_R')*(1-(w.jawOpen||0)*.5)),eyesClosed:clamp(av('eyeBlink_L','eyeBlink_R')),eyesLookDown:clamp(av('eyeLookDown_L','eyeLookDown_R')),
    x_browUp:clamp(Math.max((w.browInnerUp||0)*.55,av('browOuterUp_L','browOuterUp_R'))),x_browInner:clamp(w.browInnerUp||0),x_browDown:clamp(av('browDown_L','browDown_R')),
    x_wide:clamp(av('eyeWide_L','eyeWide_R')),x_squint:clamp(av('eyeSquint_L','eyeSquint_R')+av('cheekSquint_L','cheekSquint_R')*.5),x_frown:clamp(av('mouthFrown_L','mouthFrown_R')),x_stretch:clamp(av('mouthStretch_L','mouthStretch_R')),x_sneer:clamp(av('noseSneer_L','noseSneer_R'))};
  faceMeshes.forEach(m=>{const d=m.morphTargetDictionary;for(const k in val){if(d[k]!==undefined)m.morphTargetInfluences[d[k]]=val[k];}});
  // small head language from the expression + a "no" shake while debunking the myth
  HEADMOT.x=(w.eyeWide_L||0)*-.08+(w.browDown_L||0)*.08+(w.jawOpen||0)*-.06;
  HEADMOT.y=0;HEADMOT.z=Math.sin(t*1.7)*.02;
  const s5=ST[5]+.7,e5=ST[5]+3.2;if(t>s5&&t<e5){const k=Math.sin(Math.PI*clamp((t-s5)/(e5-s5)));HEADMOT.y=.38*k*Math.sin((t-s5)*7.5);}
  return w;
}
