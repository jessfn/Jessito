import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
const W=1080,H=1920;const Q=new URLSearchParams(location.search);const RS=Number(Q.get('sc')||1);
const TL=await (await fetch('/tl_bees.json')).json();
const ST=TL.starts,TOTAL=TL.total,SEGS=TL.segs,NS=ST.length,ENDS=ST.slice(1).concat([TOTAL]);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,x)=>a+(b-a)*x;
const eo=x=>1-Math.pow(1-clamp(x),3),eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const ss=(a,b,x)=>{x=clamp((x-a)/(b-a));return x*x*(3-2*x)};
const sceneAt=t=>{for(let i=0;i<NS;i++)if(t<ENDS[i])return i;return NS-1};
const wordT=(seg,key)=>{for(const w of SEGS[seg].words)if(w[0].toLowerCase().includes(key))return ST[seg]+w[1];return ST[seg]+.5};
const rng=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);

// ---------- renderer / scene ----------
const glc=document.getElementById('glc');
const r=new THREE.WebGLRenderer({canvas:glc,antialias:true,preserveDrawingBuffer:true});
r.setPixelRatio(1);r.setSize(Math.round(W*RS),Math.round(H*RS),false);
r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.0;r.outputColorSpace=THREE.SRGBColorSpace;
r.shadowMap.enabled=Q.get('shadow')!=='0';r.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(34,W/H,0.05,500);
const ENV={wither:0,dusk:0,wind:1,time:0};
const TU={value:0},WU={value:1},DU={value:0}; // shared uniforms: time, wind, dryness
function dryable(mat,{wind=false,windAmp=.12}={}){
  mat.onBeforeCompile=sh=>{
    sh.uniforms.uTime=TU;sh.uniforms.uWind=WU;sh.uniforms.uDry=DU;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uDry;').replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.46,.34,.15)*(.55+diffuseColor.g*2.2),uDry*.9);');
    if(wind){
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;uniform float uWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
 #ifdef USE_INSTANCING
 vec3 ip=instanceMatrix[3].xyz;
 #else
 vec3 ip=vec3(0.);
 #endif
 float hh=clamp(position.y,0.,1.);
 float ph=uTime*1.7+ip.x*.55+ip.z*.43;
 transformed.x+=(sin(ph)+.5*sin(ph*2.3+1.3))*${windAmp.toFixed(3)}*hh*hh*uWind;
 transformed.z+=(cos(ph*.9)+.4*sin(ph*1.9))*${(windAmp*.55).toFixed(3)}*hh*hh*uWind;`);
    }
  };
  return mat;
}

// ---------- lights ----------
const hemi=new THREE.HemisphereLight(0xbfd8ff,0x5a4a2a,0.9);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,3.2);sun.position.set(5,8,4);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=4;sun.shadow.camera.bottom=-4;sun.shadow.camera.near=1;sun.shadow.camera.far=30;sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.02;
scene.add(sun);scene.add(sun.target);
const rim=new THREE.DirectionalLight(0xa8c8ff,1.4);rim.position.set(-4,3,-5);scene.add(rim);
const fillL=new THREE.DirectionalLight(0xffffff,0.7);fillL.position.set(0,1.5,6);scene.add(fillL);

// ---------- sky ----------
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{uSun:{value:V3(.5,.55,-.65).normalize()},uWither:{value:0},uDusk:{value:0},uTime:TU,uTopC:{value:new THREE.Color(.16,.40,.86)},uHorC:{value:new THREE.Color(.78,.88,.97)}},
vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
fragmentShader:`precision highp float;varying vec3 vD;uniform vec3 uSun,uTopC,uHorC;uniform float uWither,uDusk,uTime;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n2(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
  vec3 d=normalize(vD);float y=max(d.y,0.);
  vec3 top=mix(uTopC,vec3(.45,.40,.62),uDusk);vec3 hor=mix(uHorC,vec3(1.0,.62,.34),uDusk);
  vec3 col=mix(hor,top,pow(y,.55));
  float sd=max(dot(d,normalize(uSun)),0.);
  col+=vec3(1.0,.88,.66)*(pow(sd,900.)*3.0+pow(sd,24.)*.35+pow(sd,6.)*.12);
  vec2 cp=d.xz/(d.y+.22)*.9+vec2(uTime*.012,0.);
  float cl=smoothstep(.48,.78,fb(cp*1.6));
  vec3 cc=mix(vec3(1.),vec3(1.0,.78,.6),uDusk)*(0.85+.15*sd);
  col=mix(col,cc,cl*smoothstep(.0,.25,d.y)*.85);
  float g=dot(col,vec3(.333));col=mix(col,vec3(g)*vec3(1.08,1.0,.86),uWither*.55);
  col*=1.0-uWither*.12;
  gl_FragColor=vec4(col,1.);
}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(300,32,16),skyMat);sky.frustumCulled=false;sky.renderOrder=-5;scene.add(sky);
