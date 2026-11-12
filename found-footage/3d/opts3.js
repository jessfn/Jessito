import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {KTX2Loader} from 'three/addons/loaders/KTX2Loader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {makeChar} from './char3d.js';
const CW=1800,CH=1100;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(CW,CH);renderer.setScissorTest(true);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;document.body.appendChild(renderer.domElement);
const ktx=new KTX2Loader().setTranscoderPath('./node_modules/three/examples/jsm/libs/basis/').detectSupport(renderer);
const gl=new GLTFLoader();gl.setKTX2Loader(ktx);gl.setMeshoptDecoder(MeshoptDecoder);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
function stage(bgTop='#1a2238',bgBot='#0b0f18'){const sc=new THREE.Scene();const c=document.createElement('canvas');c.width=8;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,bgTop);gr.addColorStop(1,bgBot);g.fillStyle=gr;g.fillRect(0,0,8,256);sc.background=new THREE.CanvasTexture(c);
 sc.add(new THREE.HemisphereLight(0x9ab4ff,0x40343a,.9));const k=new THREE.DirectionalLight(0xfff0e0,2.6);k.position.set(-2,4,4);k.castShadow=true;k.shadow.mapSize.set(2048,2048);k.shadow.camera.left=-4;k.shadow.camera.right=4;k.shadow.camera.top=4;k.shadow.camera.bottom=-1;k.shadow.bias=-.0004;sc.add(k);const r=new THREE.DirectionalLight(0x6a8aff,2.2);r.position.set(3,3,-3);sc.add(r);const f=new THREE.PointLight(0xffb070,3,8);f.position.set(1.6,1.2,2.5);sc.add(f);
 const fl=new THREE.Mesh(new THREE.CircleGeometry(6,48),new THREE.MeshStandardMaterial({color:0x232a3a,roughness:.8}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;sc.add(fl);return sc}
const cell=(sc,cam,x,y,w,h)=>{renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);cam.aspect=w/h;cam.updateProjectionMatrix();renderer.render(sc,cam)};
function fit(m,h){const b=new THREE.Box3().setFromObject(m);const sz=b.getSize(new THREE.Vector3());const k=h/sz.y;m.scale.multiplyScalar(k);const b2=new THREE.Box3().setFromObject(m);const c=b2.getCenter(new THREE.Vector3());m.position.x-=c.x;m.position.z-=c.z;m.position.y-=b2.min.y}
const load=u=>new Promise((res,rej)=>gl.load(u,res,undefined,rej));
const label=[];
(async()=>{
 // ---- panel A: rigged real-human models (skeleton + animation)
 const A=stage();const camA=new THREE.PerspectiveCamera(32,1,.1,50);camA.position.set(0,1.1,6.2);camA.lookAt(0,.9,0);camA.fov=34
 try{const so=await load('models/Soldier.glb');const m=so.scene;m.traverse(o=>{if(o.isMesh){o.castShadow=true}});fit(m,1.8);m.position.x+=-.7;A.add(m);const mx=new THREE.AnimationMixer(m);const walk=so.animations.find(a=>a.name==='Walk')||so.animations[1];const act=mx.clipAction(walk);act.play();mx.setTime(.35);
  const mi=await load('models/Michelle.glb');const m2=mi.scene;m2.traverse(o=>{if(o.isMesh)o.castShadow=true});fit(m2,1.75);m2.position.x+=.75;A.add(m2);const mx2=new THREE.AnimationMixer(m2);if(mi.animations[0]){mx2.clipAction(mi.animations[0]).play();mx2.setTime(1.1)}
 }catch(e){console.error('A fail',e.message)}
 // ---- panel B: expressive heads (blendshapes)
 const B=new THREE.Scene();B.background=new THREE.Color(0x141b2c);B.add(new THREE.HemisphereLight(0xaac0ff,0x403038,1.0));const kk=new THREE.DirectionalLight(0xfff0e0,3);kk.position.set(1,2,3);B.add(kk);const rr=new THREE.DirectionalLight(0x6a8aff,2);rr.position.set(-2,1,-2);B.add(rr);
 const heads=[];const E={
  'Neutral':{},'Sonrisa':{mouthSmile_L:.8,mouthSmile_R:.8,cheekSquint_L:.5,cheekSquint_R:.5,eyeSquint_L:.3,eyeSquint_R:.3},
  'Preocupación':{browInnerUp:.9,mouthFrown_L:.4,mouthFrown_R:.4,eyeLookDown_L:.2,eyeLookDown_R:.2},
  'Miedo':{browInnerUp:1,browOuterUp_L:.5,browOuterUp_R:.5,eyeWide_L:1,eyeWide_R:1,jawOpen:.35,mouthStretch_L:.5,mouthStretch_R:.5},
  'Shock':{browInnerUp:1,browOuterUp_L:1,browOuterUp_R:1,eyeWide_L:1,eyeWide_R:1,jawOpen:.7,mouthFunnel:.5},
  'Enojo':{browDown_L:1,browDown_R:1,noseSneer_L:.6,noseSneer_R:.6,mouthPress_L:.7,mouthPress_R:.7,eyeSquint_L:.4,eyeSquint_R:.4}};
 try{const fc=await load('models/facecap.glb');const proto=fc.scene;
  Object.keys(E).forEach((k,i)=>{const m=proto.clone(true);m.traverse(o=>{if(o.isMesh&&o.morphTargetDictionary){heads.push([o,k]);o.morphTargetInfluences=o.morphTargetInfluences.slice();const d=o.morphTargetDictionary;for(const [name,v] of Object.entries(E[k]))if(d[name]!==undefined)o.morphTargetInfluences[d[name]]=v}});fit(m,.9);const bb=new THREE.Box3().setFromObject(m);const sz=bb.getSize(new THREE.Vector3());m.position.x+=((i%3)-1)*.95;m.position.y+=(i<3?.35:-.62)-0;B.add(m)});
 }catch(e){console.error('B fail',e.message)}
 const camB=new THREE.PerspectiveCamera(30,1,.1,50);camB.position.set(0,.2,5.2);camB.lookAt(0,0,0);
 // ---- panel C: procedural stylized
 const C=stage('#222a44','#0c101a');const camC=new THREE.PerspectiveCamera(32,1,.1,50);camC.position.set(0,1.2,7.2);camC.lookAt(0,.95,0);
 const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
 [['beto','amused',-.9],['diego','worry',-.3],['marta','fear',.3],['lucia','shock',.9]].forEach(([n,ex,x])=>{const ch=makeChar(n);ch.root.scale.setScalar(1);ch.update({ex,blink:0,look:[0,0],talk:0,head:{rot:0,dy:0},walk:{phase:0,amp:0},breath:0,yoff:0,rot:0,L:ex==='shock'?{e:[116,290],w:[160,168],hand:'open',front:1}:REL.L,R:ex==='shock'?{e:[384,290],w:[340,168],hand:'open',front:1}:ex==='fear'?{e:[382,322],w:[366,214],hand:'open'}:REL.R},x);C.add(ch.root)});
 await new Promise(r=>setTimeout(r,1500));
 renderer.setClearColor(0x0b0f14);renderer.clear();
 cell(A,camA,0,0,600,1000);cell(B,camB,600,0,600,1000);cell(C,camC,1200,0,600,1000);
 const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');g.fillStyle='#fff';g.font='800 26px Inter,Arial';g.textAlign='center';
 g.fillText('OPCIÓN A · Humanos 3D con esqueleto real',300,CH-60);g.fillText('OPCIÓN B · Caras con 52 expresiones',900,CH-60);g.fillText('OPCIÓN C · Estilizado propio (el que usé)',1500,CH-60);
 g.fillStyle='#9fb0c0';g.font='16px Inter,Arial';g.fillText('modelos tipo Mixamo, animación de caminar/correr',300,CH-30);g.fillText('rostros con cejas, párpados, boca y mandíbula',900,CH-30);g.fillText('personalizable pero se ve más "juguete"',1500,CH-30);
 const ks=Object.keys(E);ks.forEach((k,i)=>{g.fillStyle='#fff';g.font='700 16px Inter,Arial';g.fillText(k,600+300+((i%3)-1)*195,i<3?150:500)});
 c.style.cssText='position:absolute;left:0;top:0;pointer-events:none';document.body.appendChild(c);window.READY=true;
})();
