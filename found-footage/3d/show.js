import * as THREE from 'three';
import {makeChar2} from './char3d2.js';
const Q=new URLSearchParams(location.search);const CW=1800,CH=1100;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(CW,CH);renderer.setScissorTest(true);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;document.body.appendChild(renderer.domElement);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
function stage(){const sc=new THREE.Scene();const c=document.createElement('canvas');c.width=8;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#232c48');gr.addColorStop(1,'#0c101a');g.fillStyle=gr;g.fillRect(0,0,8,256);sc.background=new THREE.CanvasTexture(c);
 sc.add(new THREE.HemisphereLight(0x9ab4ff,0x40343a,.8));const k=new THREE.DirectionalLight(0xfff0e0,2.6);k.position.set(-2,4,4);k.castShadow=true;k.shadow.mapSize.set(2048,2048);k.shadow.camera.left=-3;k.shadow.camera.right=3;k.shadow.camera.top=3;k.shadow.camera.bottom=-1;k.shadow.bias=-.0004;sc.add(k);const r=new THREE.DirectionalLight(0x6a8aff,2.4);r.position.set(3,3,-3);sc.add(r);const f=new THREE.PointLight(0xffb070,3,8);f.position.set(1.6,1.2,2.5);sc.add(f);
 const fl=new THREE.Mesh(new THREE.CircleGeometry(6,48),new THREE.MeshStandardMaterial({color:0x232a3a,roughness:.8}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;sc.add(fl);return sc}
const cell=(sc,cam,x,y,w,h)=>{renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);cam.aspect=w/h;cam.updateProjectionMatrix();renderer.render(sc,cam)};
const REL={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
const base={blink:0,look:[0,0],talk:0,head:{rot:0,dy:0},walk:{phase:0,amp:0},breath:0,yoff:0,rot:0};
const t0=performance.now();
const S1=stage();const cast=[['beto','amused',-1.35,{L:REL.L,R:{w:[398,236],hand:'grip',prop:'cup'}}],['diego','worry',-.45,{L:{w:[132,330],hand:'open'},R:{e:[332,332],w:[282,238],hand:'open',front:1}}],['marta','fear',.45,{L:{e:[118,322],w:[134,214],hand:'open'},R:{e:[382,322],w:[366,214],hand:'open'}}],['lucia','shock',1.35,{L:{e:[116,290],w:[160,168],hand:'open',front:1},R:{e:[384,290],w:[340,168],hand:'open',front:1}}]];
const chars={};for(const [n,ex,x,pose] of cast){const c=makeChar2(n);c.update({...base,ex,...pose},x);S1.add(c.root);chars[n]=c}
console.log('built',performance.now()-t0);
// second scene: close-ups of lucia reacting + a walking beto
const S2=stage();const lu=makeChar2('lucia');lu.update({...base,ex:'scream',L:{e:[116,290],w:[160,168],hand:'open',front:1},R:{e:[384,290],w:[340,168],hand:'open',front:1},head:{rot:-4,dy:-4}},0);S2.add(lu.root);
const S3=stage();const bw=makeChar2('beto');bw.update({...base,ex:'worry',walk:{phase:1.2,amp:1.4},L:{w:[120,380],hand:'relax'},R:{w:[392,330],hand:'grip',prop:'ext'}},0);bw.root.rotation.y=.5;S3.add(bw.root);
const cam1=new THREE.PerspectiveCamera(32,1,.1,50);cam1.position.set(0,1.15,6.6);cam1.lookAt(0,.95,0);
const cam2=new THREE.PerspectiveCamera(26,1,.1,50);cam2.position.set(.4,1.78,2.4);cam2.lookAt(0,1.72,0);
const cam3=new THREE.PerspectiveCamera(30,1,.1,50);cam3.position.set(1.4,1.2,4.2);cam3.lookAt(0,.95,0);
setTimeout(()=>{renderer.setClearColor(0x0b0f14);renderer.clear();cell(S1,cam1,0,0,900,1000);cell(S2,cam2,900,0,450,1000);cell(S3,cam3,1350,0,450,1000);
 const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');g.fillStyle='#fff';g.font='800 26px Inter,Arial';g.textAlign='center';g.fillText('OPCIÓN C mejorada · cuerpo continuo con piel/ropa suavizada, esqueleto y gestos',900,CH-60);g.fillStyle='#9fb0c0';g.font='16px Inter,Arial';g.fillText('Elenco con reacciones: Beto · Diego · Marta · Lucía (primer plano: grito) · caminando con extintor',900,CH-30);
 c.style.cssText='position:absolute;left:0;top:0;pointer-events:none';document.body.appendChild(c);window.READY=true},1500);
