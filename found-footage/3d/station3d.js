import * as THREE from 'three';
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});
function canvasTex(w,h,draw,rep=[1,1]){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
const rnd=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();
function grime(g,w,h,n,a=.12){for(let i=0;i<n;i++){g.fillStyle=`rgba(0,0,0,${rnd()*a})`;const x=rnd()*w,y=rnd()*h;g.fillRect(x,y,2+rnd()*8,4+rnd()*40)}}
const wallTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#2f4a46';g.fillRect(0,0,w,h);for(let y=0;y<8;y++)for(let x=0;x<8;x++){const sh=34+rnd()*14;g.fillStyle=`hsl(165,18%,${sh}%)`;g.fillRect(x*64+2,y*64+2,60,60);g.fillStyle='rgba(255,255,255,.07)';g.fillRect(x*64+4,y*64+4,56,5)}grime(g,w,h,260,.22)},[16,2]);
const floorTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#202826';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){const sh=22+rnd()*8;g.fillStyle=`hsl(170,8%,${sh}%)`;g.fillRect(x*128+3,y*128+3,122,122)}grime(g,w,h,200,.3);for(let i=0;i<40;i++){g.fillStyle='rgba(120,140,150,.05)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,20+rnd()*60,6+rnd()*20,0,0,6.28);g.fill()}},[3,12]);
function posterTex(title,sub,col){return canvasTex(256,384,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.9)';g.font='900 46px Inter,Arial';g.textAlign='center';g.fillText(title,w/2,110);g.font='700 26px Inter,Arial';g.fillText(sub,w/2,160);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(20,200,w-40,150);g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(w/2,275,50,0,6.28);g.fill();grime(g,w,h,60,.3);g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=6;g.strokeRect(3,3,w-6,h-6)})}
function signTex(txt,bg,fg,w=512,h=128){return canvasTex(w,h,(g)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;g.font='900 64px Inter,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+4);g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=4;g.strokeRect(4,4,w-8,h-8)})}
export function buildStation(scene){const S={flick:[],reds:[],doors:[]};
 const add=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m};
 const box=(w,h,d,mat,x,y,z)=>add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat),x,y,z);
 // floor + wet reflections
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(12,70),M(0xffffff,{map:floorTex,roughness:.28,metalness:.15}));fl.rotation.x=-Math.PI/2;fl.position.set(-2,0,-24);fl.receiveShadow=true;scene.add(fl);
 // left wall tiles + dado + ceiling
 const wl=box(.3,5,70,M(0xffffff,{map:wallTex,roughness:.35}),-8,2.5,-24);
 box(.34,.12,70,M(0x14201e),-7.98,1.25,-24);box(.34,.5,70,M(0x1a1d20),-7.98,.25,-24);
 const ceil=box(14,.3,70,M(0x0d1316),-1,5,-24);
 // ceiling pipes + cable tray + ducts
 for(const [x,y,r,c] of [[-6,4.6,.12,0x4a4036],[-5.4,4.65,.07,0x30363c],[2.2,4.6,.1,0x3a3f45]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,70,12),M(c,{metalness:.5,roughness:.5}));p.rotation.x=Math.PI/2;add(p,x,y,-24)}
 box(1,.08,70,M(0x1d2024,{metalness:.6}),-3.5,4.82,-24);for(let z=0;z>-60;z-=2)box(1,.02,.05,M(0x0a0b0c),-3.5,4.77,z);
 // tube lights (some flicker, some dead)
 for(let z=-1,i=0;z>-58;z-=5,i++){const dead=i%5===3;const mat=M(0xf4f1dc,{emissive:dead?0x111111:0xf4f1dc,emissiveIntensity:dead?0:1.4});const L=box(2.4,.07,.35,mat,-2.4,4.78,z);if(!dead)S.flick.push(L);if(i%2===0&&!dead){const p=new THREE.PointLight(0xe8f4ff,14,13,1.7);p.position.set(-2.4,4.4,z);scene.add(p);S.flick.push({light:p,base:14})}}
 // yellow safety edge + tactile strip + black warning line
 box(.7,.03,70,M(0xc8a82a,{emissive:0x4a3c08,roughness:.6}),3.4,.015,-24);for(let z=0;z>-60;z-=.35)box(.5,.012,.12,M(0x9a8420),3.4,.04,z);
 // pit, rails, sleepers
 box(7,.1,70,M(0x07090a),7.2,-1.1,-24);for(let z=0;z>-60;z-=.8)box(3.2,.12,.22,M(0x1b1612),7.5,-1.0,z);for(const x of[6.1,7.5,8.9]){box(.08,.12,70,M(0x9aa4ae,{metalness:.8,roughness:.3}),x,-.92,-24)}
 box(.3,1.1,70,M(0x16191c),4.05,-.55,-24);
 // platform pillars with tile + sign + bench
 for(let z=-4,i=0;z>-58;z-=9,i++){box(.8,5,.8,M(0xffffff,{map:wallTex,roughness:.4}),-3.2,2.5,z);box(.84,.18,.84,M(0x1a1d20),-3.2,.09,z);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.4),M(0xffffff,{map:signTex('LÍNEA 8','#0b3a8a','#ffffff'),emissive:0x112244,emissiveMap:null}));sg.position.set(-2.78,3.3,z);sg.rotation.y=Math.PI/2;scene.add(sg);
  const bb=box(2.2,.06,.55,M(0x6a5238),-2.2,.5,z-2.5);box(2.2,.5,.05,M(0x5a4228),-2.2,.78,z-2.77);for(const dx of[-.9,.9])box(.06,.5,.5,M(0x1a1d20,{metalness:.7}),-2.2+dx,.25,z-2.5)}
 // posters on wall
 [[-6,'VIAJA SEGURO','Metro Ciudad','#a82a24'],[-14,'CIUDAD 24H','Siempre en movimiento','#1f5ab0'],[-22,'NO CORRER','Zona de andén','#b8941f'],[-30,'EVACUACIÓN','Siga las flechas','#2a8a5a'],[-38,'VACÚNATE','Campaña nacional','#7a3a9a']].forEach(([z,t,s,c],i)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.2),M(0xffffff,{map:posterTex(t,s,c),roughness:.6}));p.position.set(-7.82,2.1,z);p.rotation.y=Math.PI/2;scene.add(p);if(i===2){const tear=new THREE.Mesh(new THREE.PlaneGeometry(.5,.7),M(0x1f2a28));tear.position.set(-7.8,1.4,z+.3);tear.rotation.y=Math.PI/2;scene.add(tear)}});
 // station name sign + exit sign + vending machine + trash bin
 const nm=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.9),M(0xffffff,{map:signTex('ESTACIÓN CENTRAL','#0b3a8a','#ffffff',768,192),emissive:0x0a1a3a}));nm.position.set(-7.8,3.8,-12);nm.rotation.y=Math.PI/2;scene.add(nm);
 const ex=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.35),M(0xffffff,{map:signTex('SALIDA','#0a4a1e','#59ff8f',256,96),emissive:0x0a5a2a,emissiveIntensity:1.5}));ex.position.set(-7.78,3.0,-3);ex.rotation.y=Math.PI/2;scene.add(ex);const exL=new THREE.PointLight(0x3dff7a,3,6);exL.position.set(-7,3,-3);scene.add(exL);
 const vm=box(1,2,.8,M(0xb8302a,{metalness:.3,roughness:.4}),-7.4,1,-18);const vmf=box(.7,1.3,.02,M(0x9fd0ff,{emissive:0x4a88b8,emissiveIntensity:1}),-6.98,1.15,-18);vmf.rotation.y=0;vmf.position.set(-6.9,1.2,-18);
 const bin=new THREE.Mesh(new THREE.CylinderGeometry(.3,.26,.9,16),M(0x2a2e32,{metalness:.5}));add(bin,-7.2,.45,-8);
 // train on the right track: body, band, windows with interior, doors
 const TX=7.5;box(3,4.2,60,M(0xa8b0ba,{metalness:.5,roughness:.35}),TX,1.0,-30);box(3.04,.55,60,M(0xc8302a),TX,2.55,-30);box(3.04,.4,60,M(0x2a2e32),TX,-.9,-30);
 for(let z=-4;z>-58;z-=3.6){const door=Math.round((z+4)/-3.6)%2===0;if(door){const d=box(.06,2.4,1.7,M(0x14222a,{emissive:0x3a7a60,emissiveIntensity:.8}),TX-1.5,1.2,z-.85);S.doors.push(d)}else{box(.06,1.3,2.8,M(0x9fd2b8,{emissive:0x4aa080,emissiveIntensity:.9}),TX-1.5,1.7,z-1.4)}}
 const trainL=new THREE.PointLight(0x9fe0c0,10,10,1.7);trainL.position.set(5.6,2,-6);scene.add(trainL);S.trainL=trainL;
 // red emergency pulse + far tunnel mouth glow
 const red=new THREE.PointLight(0xff3a2a,10,14,1.6);red.position.set(3,3.5,-8);scene.add(red);S.reds.push(red);
 const tm=new THREE.Mesh(new THREE.PlaneGeometry(9,5),M(0x000000));tm.position.set(4,2,-58);scene.add(tm);
 // dust motes
 const N=260,pg=new THREE.BufferGeometry(),pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=-7+rnd()*12;pos[i*3+1]=rnd()*4.5;pos[i*3+2]=-rnd()*30}pg.setAttribute('position',new THREE.BufferAttribute(pos,3));const dust=new THREE.Points(pg,new THREE.PointsMaterial({color:0xcfe0d8,size:.025,transparent:true,opacity:.5}));scene.add(dust);S.dust=dust;
 scene.fog=new THREE.FogExp2(0x070b0c,.04);scene.background=new THREE.Color(0x06090b);
 scene.add(new THREE.HemisphereLight(0x5a7a78,0x10151a,.7));
 return S}
