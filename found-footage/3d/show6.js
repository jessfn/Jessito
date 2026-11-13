import * as THREE from 'three';
import {makeChar2} from './char3dm.js';
import {buildStation} from './station3d.js';
import {loadMocap,makeSource,sample,CLIPS} from './mocap.js';
const OW=540,OH=960;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(OW,OH);renderer.shadowMap.enabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const ST=buildStation(scene);const camera=new THREE.PerspectiveCamera(40,OW/OH,.05,90);
const names=['idle-a','idle-hurt','walk-injured','open-door','push','rifle-idle','sprint','pray','reject','confused','walk-cautious','idle-talking'];
console.log(await loadMocap(names));
const mk=(n,x,z,clip)=>{const ch=makeChar2(n);scene.add(ch.root);const s=makeSource(scene);s.play(clip,0);return {n,ch,s,x,z,yaw:0}};
const A=[mk('diego',-1.6,0,'idle-a'),mk('marta',-.5,0,'open-door'),mk('beto',.6,0,'walk-injured'),mk('lucia',1.7,0,'reject'),mk('sofi',-1.0,1.2,'pray')];
window.renderAt=(t)=>{for(const a of A){a.s.mx.setTime(t*.9+.2);const m=sample(a.s,a.n==='sofi');a.ch.updateM({...m,x:a.x,z:a.z,yaw:0,ex:'fear',st:{blink:0,talk:0,look:[0,0]},hands:[{hand:'relax'},{hand:'relax'}]})}
 camera.position.set(0,1.4,5.5);camera.lookAt(0,1.0,0);const l=new THREE.SpotLight(0xffffff,50,15,.6,.7,1.4);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')};
window.READY=true;
