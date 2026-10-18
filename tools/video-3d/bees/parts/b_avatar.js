// ---------- avatar (beekeeper outfit) ----------
const rp=await new GLTFLoader().loadAsync('/models/youth.glb');
const fig=rp.scene;const holder=new THREE.Group();scene.add(holder);holder.add(fig);
const bones={};fig.traverse(o=>{if(o.isBone)bones[o.name]=o;});
const faceMeshes=[];
fig.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=true;if(o.morphTargetDictionary&&('mouthOpen' in o.morphTargetDictionary))faceMeshes.push(o);}});
function setMat(name,color,rough=.9,metal=0){fig.traverse(o=>{if(o.isMesh&&o.name===name){const m=o.material;m.map=null;m.color.set(color);m.roughness=rough;m.metalness=metal;m.needsUpdate=true;}});}
setMat('Wolf3D_Outfit_Top',0xf1eee4);setMat('Wolf3D_Outfit_Bottom',0xf1eee4);setMat('Wolf3D_Outfit_Footwear',0x5b3a21,.65);
const fabric=new THREE.MeshStandardMaterial({color:0xf1eee4,roughness:.95,side:THREE.DoubleSide});
const leather=new THREE.MeshStandardMaterial({color:0xb08a5a,roughness:.7});
function segment(a,b,r0,r1,mat,ext=.03){const v=b.position.clone();const L=v.length()+ext;const g=new THREE.CylinderGeometry(r1,r0,L,18,1,true);g.translate(0,L/2-ext*.4,0);
  const m=new THREE.Mesh(g,mat);m.quaternion.setFromUnitVectors(V3(0,1,0),v.clone().normalize());m.castShadow=true;a.add(m);return m;}
for(const sd of ['Left','Right']){
  segment(bones[sd+'Arm'],bones[sd+'ForeArm'],.072,.062,fabric);
  segment(bones[sd+'ForeArm'],bones[sd+'Hand'],.063,.052,fabric);
  {const el=new THREE.Mesh(new THREE.SphereGeometry(.064,16,12),fabric);el.castShadow=true;bones[sd+'ForeArm'].add(el);const sh=new THREE.Mesh(new THREE.SphereGeometry(.078,16,12),fabric);bones[sd+'Arm'].add(sh);}
  const glove=segment(bones[sd+'Hand'],bones[sd+'HandMiddle1'],.036,.032,leather);
  const gl2=new THREE.Mesh(new THREE.SphereGeometry(.036,14,10),leather);gl2.scale.set(1,1.35,.5);bones[sd+'Hand'].add(gl2);gl2.position.copy(bones[sd+'HandMiddle1'].position).multiplyScalar(.9);gl2.quaternion.copy(glove.quaternion);gl2.castShadow=true;
}
// hat + veil
const HATY=Number(Q.get('hy')||0.125);
const hat=new THREE.Group();bones.Head.add(hat);hat.position.set(0,HATY,-0.012);hat.rotation.x=-0.2;
const straw=new THREE.MeshStandardMaterial({color:0xd9c27c,roughness:.9,side:THREE.DoubleSide});
const crown=new THREE.Mesh(new THREE.CylinderGeometry(.088,.096,.07,40,1),straw);crown.position.y=.085;crown.castShadow=true;hat.add(crown);
const crownTop=new THREE.Mesh(new THREE.CircleGeometry(.092,40),straw);crownTop.rotation.x=-Math.PI/2;crownTop.position.y=.12;hat.add(crownTop);
const brimPts=[];for(let i=0;i<=10;i++){const k=i/10;brimPts.push(new THREE.Vector2(.096+k*.13,.05-k*k*.03));}
const brim=new THREE.Mesh(new THREE.LatheGeometry(brimPts,48),straw);brim.castShadow=true;hat.add(brim);
const band=new THREE.Mesh(new THREE.CylinderGeometry(.1,.102,.016,40,1,true),new THREE.MeshStandardMaterial({color:0x3a2a1a,roughness:.8}));band.position.y=.063;hat.add(band);
const vc=document.createElement('canvas');vc.width=vc.height=128;{const g=vc.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,128,128);g.strokeStyle='#fff';g.lineWidth=1.2;for(let i=0;i<=128;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,128);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(128,i);g.stroke();}}
const vt=new THREE.CanvasTexture(vc);vt.wrapS=vt.wrapT=THREE.RepeatWrapping;vt.repeat.set(24,6);
const veil=new THREE.Mesh(new THREE.CylinderGeometry(.23,.17,.34,48,1,true),new THREE.MeshBasicMaterial({color:0x111111,transparent:true,opacity:.26,alphaMap:vt,side:THREE.DoubleSide,depthWrite:false}));
veil.position.y=-.15;hat.add(veil);
// mocap animations (Ready Player Me library)
const mixer=new THREE.AnimationMixer(fig);
const ANIM={};const ACT={};
const ANAMES=['M_Walk_001','M_Walk_002','M_Standing_Idle_001','M_Standing_Idle_Variations_007','M_Standing_Expressions_001','M_Standing_Expressions_005','M_Standing_Expressions_008','M_Standing_Expressions_010','M_Standing_Expressions_004','M_Talking_Variations_001','M_Talking_Variations_005','M_Talking_Variations_007'];
const TRAVEL={};
for(const n of ANAMES){const f=await new FBXLoader().loadAsync('/anim/'+n+'.fbx');const c=f.animations[0];
  c.tracks=c.tracks.filter(t=>!t.name.endsWith('.scale'));
  for(const t of c.tracks){if(t.name==='Hips.position'){const v=t.values,n3=v.length/3;const drift=(v[(n3-1)*3+2]-v[2])/c.duration;TRAVEL[n]=drift*.01;
    for(let i=0;i<n3;i++){v[i*3+2]-=drift*t.times[i];v[i*3]*=.01;v[i*3+1]*=.01;v[i*3+2]*=.01;}}}
  ANIM[n]=c;const a=mixer.clipAction(c);a.play();a.setEffectiveWeight(0);ACT[n]=a;}
function poseAvatar(list){ // list: [{n,time,w}]
  let sum=0;for(const e of list)sum+=e.w;
  for(const k in ACT)ACT[k].setEffectiveWeight(0);
  for(const e of list){const a=ACT[e.n],d=ANIM[e.n].duration;a.setEffectiveWeight(e.w/sum);a.time=((e.time%d)+d)%d;}
  mixer.update(0);
}
const _q=new THREE.Quaternion(),_e=new THREE.Euler();
function addRot(b,x,y,z){_e.set(x,y,z);_q.setFromEuler(_e);b.quaternion.multiply(_q);}
