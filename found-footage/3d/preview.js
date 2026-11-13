import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';
const OW=720,OH=1280;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(OW,OH);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x05080a);scene.fog=new THREE.FogExp2(0x05080a,.045);
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...o});
// ---- subway platform set
scene.add(new THREE.HemisphereLight(0x5a7a78,0x10151a,.9));
const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,60),M(0x2a3534,{roughness:.35,metalness:.1}));floor.rotation.x=-Math.PI/2;floor.position.set(-1,0,-20);floor.receiveShadow=true;scene.add(floor);
const wall=new THREE.Mesh(new THREE.BoxGeometry(.3,5,60),M(0x27393a));wall.position.set(-8,2.5,-20);scene.add(wall);
const ceil=new THREE.Mesh(new THREE.BoxGeometry(16,.3,60),M(0x0c1215));ceil.position.set(0,5,-20);scene.add(ceil);
const strip=new THREE.Mesh(new THREE.BoxGeometry(.6,.05,60),M(0xc8a82a,{emissive:0x5a4a0a}));strip.position.set(4.6,.03,-20);scene.add(strip);
const pit=new THREE.Mesh(new THREE.BoxGeometry(6,.1,60),M(0x0a0d10));pit.position.set(8,-1.1,-20);scene.add(pit);
const train=new THREE.Mesh(new THREE.BoxGeometry(3,4,40),M(0x9aa2ac,{metalness:.4,roughness:.4}));train.position.set(7.4,1.1,-24);scene.add(train);
const band=new THREE.Mesh(new THREE.BoxGeometry(3.05,.5,40),M(0xc8302a));band.position.set(7.4,2.6,-24);scene.add(band);
for(let i=0;i<10;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(.05,1.3,2.2),M(0x9fd2b8,{emissive:0x2a5a48}));w.position.set(5.9,1.7,-6-i*3.6);scene.add(w)}
for(let z=0;z>-50;z-=6){const L=new THREE.Mesh(new THREE.BoxGeometry(3,.08,.5),M(0xf4f1dc,{emissive:0xf4f1dc,emissiveIntensity:z%12?0.2:1.2}));L.position.set(-1,4.8,z);scene.add(L);if(!(z%12)){const p=new THREE.PointLight(0xfff0d0,18,12,1.6);p.position.set(-1,4.4,z);p.castShadow=false;scene.add(p)}}
for(let z=-3;z>-50;z-=9){const c=new THREE.Mesh(new THREE.BoxGeometry(.7,5,.7),M(0x3a4846));c.position.set(-4,2.5,z);scene.add(c)}
const red=new THREE.PointLight(0xff3a2a,14,14,1.6);red.position.set(5,3,-4);scene.add(red);
const spot=new THREE.SpotLight(0xdde9ff,60,20,.5,.7,1.4);spot.castShadow=true;scene.add(spot,spot.target);
// ---- characters (real mocap rigs)
const gl=new GLTFLoader();const load=u=>new Promise(r=>gl.load(u,r));
const [xb,so,mi]=await Promise.all([load('models/Xbot.glb'),load('models/Soldier.glb'),load('models/Michelle.glb')]);
function inst(g,x,z,scale=1){const o=SU.clone(g.scene);o.position.set(x,0,z);o.scale.setScalar(scale);o.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true}});scene.add(o);const mx=new THREE.AnimationMixer(o);const acts={};g.animations.forEach(a=>acts[a.name]=mx.clipAction(a));return {o,mx,acts,cur:null}}
const A=inst(xb,-1.5,-1);const B=inst(so,0,-1);const C=inst(mi,1.5,-1,1.0);for(const c of [A,B,C])c.o.rotation.y=Math.PI;
console.log(Object.keys(A.acts),Object.keys(B.acts),Object.keys(C.acts));
function play(c,name,fade=.35){const n=c.acts[name]||c.acts[Object.keys(c.acts)[0]];if(c.cur===n)return;n.reset().fadeIn(fade).play();if(c.cur)c.cur.fadeOut(fade);c.cur=n}
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
function turnTo(c,ang,k=.12){let d=ang-c.o.rotation.y;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;c.o.rotation.y+=d*k}
let lastT=0;
window.renderAt=(t)=>{const dt=Math.max(0,t-lastT);lastT=t;
 // choreography: stand scared -> turn to the train -> walk away in profile -> run toward camera
 if(t<1.6){play(A,'sad_pose');play(B,'Idle');play(C,'SambaDance');turnTo(A,Math.PI);turnTo(B,Math.PI);turnTo(C,Math.PI)}
 else if(t<3.2){play(A,'idle');play(B,'Idle');turnTo(A,Math.PI/2*1.1,.08);turnTo(B,Math.PI/2*1.1,.1);turnTo(C,Math.PI/2*1.1,.07);play(C,'SambaDance')}
 else if(t<5.4){play(A,'walk');play(B,'Walk');play(C,'SambaDance');const u=(t-3.2)*.9;turnTo(A,-Math.PI/2,.15);turnTo(B,-Math.PI/2,.15);turnTo(C,-Math.PI/2,.15);A.o.position.x=-1.5-u*1.2;B.o.position.x=0-u*1.3}
 else{play(A,'run');play(B,'Run');turnTo(A,0,.12);turnTo(B,0,.12);const u=(t-5.4);A.o.position.x=THREE.MathUtils.lerp(A.o.position.x,-1.2,.05);B.o.position.x=THREE.MathUtils.lerp(B.o.position.x,.6,.05);A.o.position.z=-1+u*.9;B.o.position.z=-1+u*1.1}
 for(const c of [A,B,C])c.mx.update(dt);
 // handheld camera
 const sh=(k)=>Math.sin(t*k)*.5+Math.sin(t*k*2.3+1)*.3;
 const zoom=t<3.2?2.4:t<5.4?4.2:3.2;
 const cx=THREE.MathUtils.lerp(-.4,-2.2,sm((t-3.2)/1.5));
 camera.position.set((t<3.2?0:cx)+sh(1.3)*.03,1.45+sh(1.9)*.025,(t<3.2?5.2:4.4)+(t>5.4?(t-5.4)*.3:0));camera.lookAt((t<3.2?0:cx*.5)+sh(.8)*.02,1.0+sh(1.1)*.02,-1);camera.rotation.z+=sh(1.1)*.012;
 spot.position.set(camera.position.x+.35,camera.position.y-.45,camera.position.z);spot.target.position.set(A.o.position.x*.6,1.2,-1);
 red.intensity=10+8*Math.sin(t*9);
 renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')};
const camera=new THREE.PerspectiveCamera(48,OW/OH,.05,80);
window.READY=true;
