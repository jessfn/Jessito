import * as THREE from 'three';
import {surfaceNets,smin,sdRoundCone,sdSphere,sdBox,sdTorusY} from './sdf.js';
import {PX,buildHead,setFace,mkHand,setHandPose,mkProp,ik,skinM,stdm,fab,CFG,EXP} from './char3d.js';
export {PX};
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);const YA=V(0,1,0);
// ---- rest pose (A-pose), metres
const SH=[[-.215,1.38,0],[.215,1.38,0]],EL=[[-.30,1.10,.02],[.30,1.10,.02]],WR=[[-.36,.84,.04],[.36,.84,.04]];
const HP=[[-.1,.95,0],[.1,.95,0]],KN=[[-.105,.5,.01],[.105,.5,.01]],AN=[[-.11,.1,0],[.11,.1,0]];
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const L_UP=dist(SH[0],EL[0]),L_FO=dist(EL[0],WR[0]),L_TH=dist(HP[0],KN[0]),L_SN=dist(KN[0],AN[0]);
// ---- SDFs
function hoodieSDF(px,py,pz){
 // torso (ellipsoid-ish via z squash)
 const z=pz/.74;let d=sdRoundCone(px,py,z,[0,1.0,0],[0,1.36,0],.205,.215)*.74;
 const hem=sdRoundCone(px,py,z,[0,.95,0],[0,1.0,0],.215,.208)*.74;d=smin(d,hem,.02);
 for(let s=0;s<2;s++){const up=sdRoundCone(px,py,pz,SH[s],EL[s],.088,.078),fo=sdRoundCone(px,py,pz,EL[s],WR[s],.078,.068),del=sdSphere(px,py,pz,[SH[s][0]*1.02,SH[s][1]-.012,0],.09);d=smin(d,smin(up,smin(fo,del,.02),.03),.012)}
 const hood=sdSphere(px,py/.85,pz,[0,1.5/.85,-.11],.13);d=smin(d,hood,.06);const col=sdTorusY(px,py,pz,[0,1.49,.015],.115,.042);d=smin(d,col,.03);
 const pocket=sdBox(px,py,pz,[0,1.07,.15],[.105,.05,.03],.02);d=smin(d,pocket,.012);
 return d}
function pantsSDF(px,py,pz){const z=pz/.74;let d=sdRoundCone(px,py,z,[0,.93,0],[0,.99,0],.188,.19)*.74;
 for(let s=0;s<2;s++){const th=sdRoundCone(px,py,pz,HP[s],KN[s],.112,.092),sn=sdRoundCone(px,py,pz,KN[s],AN[s],.09,.078);d=smin(d,smin(th,sn,.03),.05)}return d}
// ---- weights from distance to bone segments
const SEG={claL:[[-.08,1.40,0],[-.2,1.38,0]],claR:[[.08,1.40,0],[.2,1.38,0]],root:[[0,.9,0],[0,1.05,0]],spine:[[0,1.05,0],[0,1.3,0]],chest:[[0,1.3,0],[0,1.52,0]],upL:[SH[0],EL[0]],foL:[EL[0],WR[0]],upR:[SH[1],EL[1]],foR:[EL[1],WR[1]],thL:[HP[0],KN[0]],shL:[KN[0],AN[0]],thR:[HP[1],KN[1]],shR:[KN[1],AN[1]]};
const NAMES=Object.keys(SEG);
function segDist(p,a,b){const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const ap=[p[0]-a[0],p[1]-a[1],p[2]-a[2]];const t=Math.max(0,Math.min(1,(ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/(ab[0]*ab[0]+ab[1]*ab[1]+ab[2]*ab[2])));return Math.hypot(p[0]-a[0]-ab[0]*t,p[1]-a[1]-ab[1]*t,p[2]-a[2]-ab[2]*t)}
function skinGeo(geo,allowed){const P=geo.attributes.position.array;const n=P.length/3;const si=new Uint16Array(n*4),sw=new Float32Array(n*4),uv=new Float32Array(n*2);
 for(let i=0;i<n;i++){const p=[P[i*3],P[i*3+1],P[i*3+2]];const ws=allowed.map(nm=>{const [a,b]=SEG[nm];const d=segDist(p,a,b);return [NAMES.indexOf(nm),1/Math.pow(d*d+.00008,3)]}).sort((a,b)=>b[1]-a[1]).slice(0,4);const sum=ws.reduce((s,w)=>s+w[1],0);for(let k=0;k<4;k++){si[i*4+k]=ws[k]?ws[k][0]:0;sw[i*4+k]=ws[k]?ws[k][1]/sum:0}uv[i*2]=(p[0]+p[2])*5;uv[i*2+1]=p[1]*5}
 geo.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2))}
let HOOD_GEO=null,PANT_GEO=null;
function geos(){if(!HOOD_GEO){HOOD_GEO=surfaceNets(hoodieSDF,[-.52,.82,-.32,.52,1.7,.34],.011);skinGeo(HOOD_GEO,['root','spine','chest','claL','claR','upL','foL','upR','foR']);PANT_GEO=surfaceNets(pantsSDF,[-.34,-.02,-.3,.34,1.1,.3],.011);skinGeo(PANT_GEO,['root','spine','thL','shL','thR','shR'])}return [HOOD_GEO,PANT_GEO]}
// ---- character
export function makeChar2(name){const cfg=CFG[name];const root=new THREE.Group();const g=new THREE.Group();root.add(g);
 const skin=skinM(cfg.skin);const hoodM=fab(cfg.hood);hoodM.sheen=1;const dark=fab(new THREE.Color(cfg.hood).multiplyScalar(.72)),pantsM=fab(cfg.pants);
 // skeleton
 const bones={};const mk=(n,par,p)=>{const b=new THREE.Bone();b.name=n;b.position.set(p[0],p[1],p[2]);if(par)par.add(b);bones[n]=b;return b};
 const rootB=mk('root',null,[0,.95,0]);const spine=mk('spine',rootB,[0,.17,0]);const chest=mk('chest',spine,[0,.24,0]);
 const claL=mk('claL',chest,[SH[0][0],SH[0][1]-1.36,0]),claR=mk('claR',chest,[SH[1][0],SH[1][1]-1.36,0]);const upL=mk('upL',claL,[0,0,0]),foL=mk('foL',upL,[EL[0][0]-SH[0][0],EL[0][1]-SH[0][1],EL[0][2]]),upR=mk('upR',claR,[0,0,0]),foR=mk('foR',upR,[EL[1][0]-SH[1][0],EL[1][1]-SH[1][1],EL[1][2]]);
 const thL=mk('thL',rootB,[HP[0][0],0,0]),shL=mk('shL',thL,[KN[0][0]-HP[0][0],KN[0][1]-HP[0][1],KN[0][2]]),thR=mk('thR',rootB,[HP[1][0],0,0]),shR=mk('shR',thR,[KN[1][0]-HP[1][0],KN[1][1]-HP[1][1],KN[1][2]]);
 g.add(rootB);rootB.updateMatrixWorld(true);const skel=new THREE.Skeleton(NAMES.map(n=>bones[n]));
 const [hg,pg]=geos();const hood=new THREE.SkinnedMesh(hg,hoodM),pants=new THREE.SkinnedMesh(pg,pantsM);[hood,pants].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;g.add(m);m.bind(skel,new THREE.Matrix4())});
 // details on bones
 const rel=(bone,w)=>{const bw=new THREE.Vector3();bone.getWorldPosition(bw);return V(w[0]-bw.x,w[1]-bw.y,w[2]-bw.z)};
 const addTo=(bone,mesh,w)=>{mesh.position.copy(rel(bone,w));bone.add(mesh);mesh.castShadow=true;return mesh};
 for(const s of[-1,1]){// drawstrings
  const c=new THREE.CatmullRomCurve3([V(s*.045,1.46,.17),V(s*.052,1.34,.205),V(s*.05,1.2,.2)]);const ds=new THREE.Mesh(new THREE.TubeGeometry(c,10,.0065,6),stdm(0xf2eee6));addTo(chest,ds,[0,0,0]);ds.position.set(0,0,0);ds.position.copy(rel(chest,[0,0,0]));
  const ag=new THREE.Mesh(new THREE.CylinderGeometry(.007,.007,.026,8),stdm(0xb8b8b8,{metalness:.7}));addTo(chest,ag,[s*.05,1.19,.2])}
 // pocket seam / hem rib / cuffs
 const rib=new THREE.Mesh(new THREE.TorusGeometry(.215,.01,8,40),dark);rib.rotation.x=Math.PI/2;rib.scale.set(1,.74,1);addTo(rootB,rib,[0,.955,0]);
 for(let s=0;s<2;s++){const bone=s?foR:foL;const fdir=V(...WR[s]).sub(V(...EL[s])).normalize();const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.074,.08,.06,18),dark);cuff.quaternion.setFromUnitVectors(YA,fdir);addTo(bone,cuff,[WR[s][0]-fdir.x*.01,WR[s][1]-fdir.y*.01,WR[s][2]-fdir.z*.01]);
  const kn=new THREE.Mesh(new THREE.TorusGeometry(.098,.005,6,24),pantsM);kn.rotation.x=Math.PI/2;addTo(s?shR:shL,kn,[KN[s][0],KN[s][1]-.02,KN[s][2]]);
  const pc=new THREE.Mesh(new THREE.CylinderGeometry(.08,.088,.06,20),stdm(new THREE.Color(cfg.pants).multiplyScalar(.8)));addTo(s?shR:shL,pc,[AN[s][0],AN[s][1]+.07,AN[s][2]])}
 // neck + head
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.06,.068,.14,16),skin);neck.position.set(0,1.57,0);g.add(neck);
 const F=buildHead(cfg,skin);const headG=new THREE.Group();headG.position.set(0,1.76,0);headG.add(F.g);if(cfg.kid)headG.scale.setScalar(1.15);g.add(headG);
 // hands (bigger, stylised)
 const hands=[-1,1].map(s=>{const h=mkHand(skin,s);h.g.scale.setScalar(1.25);h.prop.add(mkProp('cup'),mkProp('ext'));h.props={cup:h.prop.children[0],ext:h.prop.children[1]};g.add(h.g);return h});
 // shoes
 const shoes=[0,1].map(s=>{const sh=new THREE.Group();const m1=stdm(0xeee9e0),so=stdm(0x8c867a);const up=new THREE.Mesh(new THREE.SphereGeometry(.09,22,14),m1);up.scale.set(1,.72,2.0);up.position.set(0,.07,.075);sh.add(up);const sole=new THREE.Mesh(new THREE.CapsuleGeometry(.062,.2,6,14),so);sole.rotation.x=Math.PI/2;sole.scale.set(1.05,1,.4);sole.position.set(0,.02,.075);sh.add(sole);const toe=new THREE.Mesh(new THREE.SphereGeometry(.075,18,12),stdm(0xdedacd));toe.scale.set(1,.62,.92);toe.position.set(0,.05,.17);sh.add(toe);const tg=new THREE.Mesh(new THREE.TorusGeometry(.055,.004,6,20,Math.PI),stdm(0x3a3a42));tg.rotation.set(0,0,0);tg.position.set(0,.085,.2);sh.add(tg);const col=new THREE.Mesh(new THREE.TorusGeometry(.062,.014,8,20),stdm(0x2a2a32));col.rotation.x=Math.PI/2;col.position.set(0,.1,-.015);sh.add(col);const tng=new THREE.Mesh(new THREE.BoxGeometry(.07,.04,.012),stdm(0xf5f2ea));tng.position.set(0,.118,.045);tng.rotation.x=-.5;sh.add(tng);for(let k=0;k<4;k++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.0035,.0035,.08,6),stdm(0x15151a));l.rotation.z=Math.PI/2;l.position.set(0,.113-k*.006,.065+k*.022);sh.add(l)}sh.traverse(o=>{if(o.isMesh)o.castShadow=true});g.add(sh);return sh});
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});if(cfg.kid)root.scale.setScalar(.72);
 const M2=.0029;const SHp=[V(...SH[0]),V(...SH[1])];
 const qa=new THREE.Quaternion(),qb=new THREE.Quaternion();
 function aim(bone,parentWorldQ,restDir,newDir){const qw=new THREE.Quaternion().setFromUnitVectors(restDir,newDir);bone.quaternion.copy(parentWorldQ.clone().invert().multiply(qw));return qw}
 function update(st,Xm){root.position.x=Xm;g.position.y=-(st.yoff||0)*PX;g.rotation.z=-(st.rot||0)*Math.PI/180;g.rotation.y=-(st.look?st.look[0]:0)*.12;
  const ch=Math.sin((st.breath||0))*.012;chest.quaternion.setFromEuler(new THREE.Euler(ch,0,0));
  // arms
  for(let i=0;i<2;i++){const P=i?st.R:st.L;const side=i?1:-1;const sh=SHp[i];const sh2=[side===-1?186:314,240];const mp=(p,front)=>V(sh.x+(p[0]-sh2[0])*M2,sh.y-(p[1]-sh2[1])*M2,(front?.2:.1)+Math.max(0,(240-p[1]))*.0003);
   let wr=mp(P.w,P.front);let el;if(P.e){el=mp(P.e,false);el.z=Math.max(-.05,el.z-.1)}else el=ik(sh,wr,L_UP,L_FO,V(side*.6,-1,-.5));
   // keep bone lengths
   const dEl=el.clone().sub(sh).normalize().multiplyScalar(L_UP);el=sh.clone().add(dEl);const dW=wr.clone().sub(el);if(dW.length()>L_FO*1.02)wr=el.clone().add(dW.normalize().multiplyScalar(L_FO*1.0));
   const up=i?upR:upL,fo=i?foR:foL;const chestQ=new THREE.Quaternion();chest.getWorldQuaternion(chestQ);const gq=new THREE.Quaternion();g.getWorldQuaternion(gq);
   const restUp=V(...EL[i]).sub(V(...SH[i])).normalize(),restFo=V(...WR[i]).sub(V(...EL[i])).normalize();
   const parentQ=new THREE.Quaternion();chest.getWorldQuaternion(parentQ);const gInv=new THREE.Quaternion();g.getWorldQuaternion(gInv);
   // work in g-local space: bone.quaternion relative to chest (which is only slightly rotated)
   const cq=chest.quaternion.clone();const qUp=new THREE.Quaternion().setFromUnitVectors(restUp,el.clone().sub(sh).normalize());const qCla=new THREE.Quaternion().slerp(qUp,.38);const cla=i?claR:claL;cla.quaternion.copy(cq.clone().invert().multiply(qCla));up.quaternion.copy(qCla.clone().invert().multiply(qUp));
   const qFo=new THREE.Quaternion().setFromUnitVectors(restFo,wr.clone().sub(el).normalize());fo.quaternion.copy(qUp.clone().invert().multiply(qFo));
   // hand
   const h=hands[i];const dir=wr.clone().sub(el).normalize();h.g.position.copy(wr).add(dir.clone().multiplyScalar(.055));
   const c=V(-side*.8,0,.2).normalize();let zc=c.clone().negate();zc.sub(dir.clone().multiplyScalar(zc.dot(dir)));if(zc.length()<.1)zc.set(0,0,1).sub(dir.clone().multiplyScalar(dir.z));zc.normalize();const xc=new THREE.Vector3().crossVectors(dir,zc).normalize();h.g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xc,dir,zc));
   const type=P.hand==='grip'?'grip':P.hand==='open'?'open':P.hand==='point'?'point':'relax';setHandPose(h,type,side);h.props.cup.visible=type==='grip'&&P.prop==='cup';h.props.ext.visible=type==='grip'&&P.prop==='ext'}
  // legs
  const w=st.walk||{phase:0,amp:0};for(let i=0;i<2;i++){const s=i?1:-1;const lift=Math.max(0,Math.sin(w.phase+(i?Math.PI:0)))*.11*w.amp;const hip=V(...HP[i]);const an=V(s*.11,.1+lift,lift*.25);const kn=ik(hip,an,L_TH,L_SN,V(0,0,1));
   const th=i?thR:thL,sn=i?shR:shL;const rootQ=rootB.quaternion;const restTh=V(...KN[i]).sub(V(...HP[i])).normalize(),restSn=V(...AN[i]).sub(V(...KN[i])).normalize();
   const qT=new THREE.Quaternion().setFromUnitVectors(restTh,kn.clone().sub(hip).normalize());th.quaternion.copy(rootQ.clone().invert().multiply(qT));const qS=new THREE.Quaternion().setFromUnitVectors(restSn,an.clone().sub(kn).normalize());sn.quaternion.copy(qT.clone().invert().multiply(qS));
   shoes[i].position.set(an.x,an.y-.1,an.z);shoes[i].rotation.x=-lift*1.6}
  headG.rotation.z=-(st.head?st.head.rot:0)*Math.PI/180;headG.rotation.x=(st.head?st.head.dy:0)*.01;
  g.updateMatrixWorld(true);setFace(F,cfg,st.ex,st)}
 return {root,update}}
