import * as THREE from 'three';
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...o});
function ctex(w,h,draw,rep=[1,1]){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
const rnd=(()=>{let s=11;return()=>(s=(s*16807)%2147483647)/2147483647})();
const wallT=ctex(512,512,(g,w,h)=>{g.fillStyle='#3a4147';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=`hsl(205,8%,${22+rnd()*8}%)`;g.fillRect(x*128+3,y*128+3,122,122);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x*128+5,y*128+5,118,4);for(const [rx,ry] of [[14,14],[110,14],[14,110],[110,110]]){g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(x*128+rx,y*128+ry,4,0,6.28);g.fill()}}for(let i=0;i<260;i++){g.fillStyle=`rgba(0,0,0,${rnd()*.25})`;g.fillRect(rnd()*w,rnd()*h,2+rnd()*8,6+rnd()*60)}},[7,1.2]);
const floorT=ctex(512,512,(g,w,h)=>{g.fillStyle='#2e3338';g.fillRect(0,0,w,h);for(let i=0;i<400;i++){g.fillStyle=`rgba(${rnd()<.5?255:0},${rnd()<.5?255:0},${rnd()<.5?255:0},.05)`;g.fillRect(rnd()*w,rnd()*h,3+rnd()*30,3+rnd()*30)}g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,w,3);g.fillRect(0,0,3,h);for(let i=0;i<14;i++){g.fillStyle='rgba(140,160,170,.05)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,30+rnd()*70,8+rnd()*20,0,0,6.28);g.fill()}},[10,5]);
function label(txt,bg,fg,w=512,h=128,fs=64){return ctex(w,h,g=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;g.font=`900 ${fs}px Inter,Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+4);g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=5;g.strokeRect(5,5,w-10,h-10)})}
function mapTex(){return ctex(1024,512,(g,w,h)=>{g.fillStyle='#d8cfae';g.fillRect(0,0,w,h);g.fillStyle='rgba(120,100,50,.12)';g.fillRect(0,0,w,h);g.strokeStyle='rgba(106,90,42,.45)';g.lineWidth=2;for(let i=1;i<10;i++){g.beginPath();g.moveTo(i*102,0);g.lineTo(i*102,h);g.stroke()}for(let i=1;i<5;i++){g.beginPath();g.moveTo(0,i*102);g.lineTo(w,i*102);g.stroke()}g.strokeStyle='#2a6ac8';g.lineWidth=16;g.globalAlpha=.7;g.beginPath();g.moveTo(20,400);g.quadraticCurveTo(300,300,520,360);g.quadraticCurveTo(760,420,1000,240);g.stroke();g.globalAlpha=1;g.strokeStyle='#4a3a1a';g.lineWidth=8;g.beginPath();g.moveTo(60,60);g.lineTo(380,180);g.lineTo(640,130);g.lineTo(960,100);g.moveTo(380,180);g.lineTo(470,460);g.stroke();g.fillStyle='rgba(200,48,42,.3)';g.strokeStyle='#c8302a';g.lineWidth=7;g.setLineDash([16,12]);g.beginPath();g.arc(400,250,140,0,6.28);g.fill();g.stroke();g.setLineDash([]);g.fillStyle='#7a1410';g.font='900 36px Inter,Arial';g.textAlign='center';g.fillText('ZONA ROJA',400,262);g.fillStyle='#fff';g.strokeStyle='#0a3a8a';g.lineWidth=9;g.beginPath();g.arc(850,130,46,0,6.28);g.fill();g.stroke();g.fillStyle='#0a3a8a';g.font='900 56px Inter,Arial';g.fillText('H',850,150);g.font='900 26px Inter,Arial';g.fillText('AZOTEA',850,205)})}
export function buildBunker(scene){const S={flick:[],reds:[],alarms:[]};
 const add=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m};
 const box=(w,h,d,mat,x,y,z)=>add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat),x,y,z);
 scene.background=new THREE.Color(0x05080a);scene.fog=new THREE.FogExp2(0x080c10,.035);
 scene.add(new THREE.HemisphereLight(0x6a8aa8,0x12161a,.5));
 // back wall, floor, ceiling, side walls
 box(26,5,.4,M(0xffffff,{map:wallT,roughness:.55}),2.5,2.5,-2.7);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(26,16),M(0xffffff,{map:floorT,roughness:.38,metalness:.15}));fl.rotation.x=-Math.PI/2;fl.position.set(2.5,0,3);fl.receiveShadow=true;scene.add(fl);
 box(26,.3,16,M(0x0e1216),2.5,5,3);box(.4,5,16,M(0x2a3036),-10.5,2.5,3);box(.4,5,16,M(0x2a3036),15.5,2.5,3);
 // yellow/black dado band + baseboard
 box(26,.1,.06,M(0xd8b82a,{emissive:0x3a2e06}),2.5,1.25,-2.5);box(26,.9,.08,M(0x1b2025),2.5,.45,-2.5);
 // ceiling pipes, trays, ducts
 for(const [y,r,c,z] of [[4.55,.12,0x4a4036,-2.2],[4.45,.08,0x30363c,-1.8],[4.6,.1,0x3a3f45,0]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,26,12),M(c,{metalness:.5,roughness:.5}));p.rotation.z=Math.PI/2;add(p,2.5,y,z)}
 box(26,.08,.6,M(0x1d2024,{metalness:.5}),2.5,4.8,-1.2);for(let x=-10;x<15;x+=1.5)box(.04,.12,.6,M(0x0a0b0c),x,4.76,-1.2);
 // tube lights: some dead, some flickering; light shafts
 for(const [x,dead] of [[-6,1],[-2.5,0],[1,0],[4.5,1],[8,0],[12,0]]){box(2.4,.07,.35,M(0xf4fbff,{emissive:dead?0x111111:0xf4fbff,emissiveIntensity:dead?0:1.6}),x,4.78,-.6);if(!dead){const p=new THREE.PointLight(0xe8f4ff,16,12,1.7);p.position.set(x,4.4,.2);scene.add(p);S.flick.push({light:p,base:16,x});const cone=new THREE.Mesh(new THREE.ConeGeometry(1.7,4.4,24,1,true),new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.05,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));cone.position.set(x,2.6,-.4);scene.add(cone)}}
 // signs
 const sg=(txt,bg,fg,x,y,z,w,h,ts=64,em=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M(0xffffff,{map:label(txt,bg,fg,512,Math.round(512*h/w),ts),emissive:em,emissiveIntensity:.6}));m.position.set(x,y,z);scene.add(m);return m};
 sg('ZONA RESTRINGIDA','#d8b82a','#14120a',-1.2,2.3,-2.48,2.1,.8,40);sg('SALIDA DE EMERGENCIA','#0b3a1e','#59ff8f',1.6,3.5,-2.48,2.1,.6,34,0x0a5a2a);
 sg('CENTRO DE MANDO','#0b2a46','#cfe9ff',9.2,3.9,-2.48,3.6,.8,52,0x0a1a3a);
 // door (left) - frame + leaf pivot
 const DX=-6.4;box(2.4,3.4,.5,M(0x101316),DX,1.7,-2.55);const door=new THREE.Group();door.position.set(DX-.85,0,-2.2);scene.add(door);
 const leaf=new THREE.Mesh(new THREE.BoxGeometry(1.7,2.9,.16),M(0x5a6068,{metalness:.7,roughness:.35}));leaf.position.set(.85,1.45,0);leaf.castShadow=true;door.add(leaf);
 for(let i=0;i<3;i++){const bar=new THREE.Mesh(new THREE.BoxGeometry(1.4,.1,.08),M(0x8a9099,{metalness:.8,roughness:.3}));bar.position.set(.85,.6+i*.9,.12);door.add(bar)}
 const wheel=new THREE.Mesh(new THREE.TorusGeometry(.26,.035,8,24),M(0x9aa2ac,{metalness:.8}));wheel.position.set(.85,1.5,.14);door.add(wheel);
 const lbl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.3),M(0xffffff,{map:label('ACCESO TÚNEL 8','#3a4048','#e9eef5',512,110,44)}));lbl.position.set(.85,2.55,.09);door.add(lbl);
 S.door=door;S.leaf=leaf;S.doorX=DX;
 // light from the tunnel through the open door
 const dl=new THREE.PointLight(0xe8f4ff,22,9,1.5);dl.position.set(DX,1.8,-3.4);scene.add(dl);S.doorLight=dl;
 const dgl=new THREE.Mesh(new THREE.PlaneGeometry(1.7,2.9),new THREE.MeshBasicMaterial({color:0xf4fbff}));dgl.position.set(DX,1.45,-2.78);scene.add(dgl);S.doorGlow=dgl;
 // dents on the leaf (dark discs facing inward), revealed on knock
 S.dents=[];for(let i=0;i<4;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12,0,Math.PI*2,0,Math.PI/2),M(0x2a2e34,{metalness:.7,roughness:.4}));d.rotation.x=Math.PI/2;d.position.set(.4+rnd()*.9,.7+i*.6+rnd()*.2,.09);d.scale.set(0,0,0);door.add(d);S.dents.push(d)}
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8),new THREE.MeshBasicMaterial({color:0x3dff7a}));lamp.position.set(DX,3.45,-2.25);scene.add(lamp);S.doorLamp=lamp;
 // bunks
 for(const bx of[2.4,4.1]){const m=M(0x6a727c,{metalness:.7,roughness:.4});for(const dx of[-.8,.8])for(const dz of[-.4,.4]){box(.06,2.2,.06,m,bx+dx,1.1,-2.0+dz)}for(const y of[.55,1.45]){box(1.7,.05,.9,m,bx,y,-2.0);box(1.62,.12,.82,M(0x4a5a3a,{roughness:.95}),bx,y+.09,-2.0);box(.5,.1,.3,M(0xd8d2c0),bx-.55,y+.2,-2.0)}}
 // crates
 [[5.7,.3,-1.8,.9,.6,.6,'RACIONES'],[5.7,.9,-1.8,.8,.5,.5,'AGUA'],[6.6,.25,-1.9,.7,.5,.5,'MEDICINA']].forEach(([x,y,z,w,h,d,t])=>{box(w,h,d,M(0x6a5a3a,{roughness:.9}),x,y,z);const l=new THREE.Mesh(new THREE.PlaneGeometry(w*.8,h*.35),M(0xffffff,{map:label(t,'#d8d2c0','#1b150a',256,90,34)}));l.position.set(x,y,z+d/2+.01);scene.add(l)});
 // command wall: monitors, map, table, radio, camera
 box(4.6,2.6,.1,M(0x171b1f),10.6,2.0,-2.45);
 S.mon=[];for(let i=0;i<3;i++){const mat=new THREE.MeshBasicMaterial({color:[0x0e4a30,0x4a2a14,0x0e2a3a][i]});const m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8),mat);m.position.set(9.3+i*1.3,3.0,-2.38);scene.add(m);S.mon.push(m);box(1.3,.9,.05,M(0x0a0c0e),9.3+i*1.3,3.0,-2.42)}
 const mp=new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.9),M(0xffffff,{map:mapTex(),roughness:.8}));mp.position.set(10.6,1.55,-2.38);scene.add(mp);
 const hl=new THREE.Mesh(new THREE.RingGeometry(.22,.3,32),new THREE.MeshBasicMaterial({color:0x0a3a8a,transparent:true,opacity:0,side:THREE.DoubleSide}));hl.position.set(12.2,2.2,-2.36);scene.add(hl);S.helipad=hl;
 const route=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.12),new THREE.MeshBasicMaterial({color:0x0a3a8a,transparent:true,opacity:0}));route.position.set(11.0,1.7,-2.37);route.rotation.z=.32;scene.add(route);S.route=route;
 // table
 const tm=M(0x5a6068,{metalness:.6,roughness:.4});box(2.4,.06,.9,tm,10.6,.95,-1.3);for(const dx of[-1.1,1.1])for(const dz of[-.35,.35])box(.06,.95,.06,M(0x4a5058),10.6+dx,.47,-1.3+dz);
 // radio
 const radio=new THREE.Group();radio.position.set(9.9,.98,-1.35);const rb=new THREE.Mesh(new THREE.BoxGeometry(.5,.34,.28),M(0x2d3a2a,{roughness:.6}));rb.position.y=.17;radio.add(rb);const scr=new THREE.Mesh(new THREE.PlaneGeometry(.24,.14),new THREE.MeshBasicMaterial({color:0x0a120a}));scr.position.set(-.08,.2,.145);radio.add(scr);const ant=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.8,6),M(0x9aa2ac,{metalness:.8}));ant.position.set(.2,.7,0);radio.add(ant);const led=new THREE.Mesh(new THREE.SphereGeometry(.02,8,6),new THREE.MeshBasicMaterial({color:0xff2a1a}));led.position.set(.14,.3,.15);radio.add(led);radio.traverse(o=>o.castShadow=true);scene.add(radio);S.radioScr=scr;S.radioLed=led;
 // lamp on table
 const tl=new THREE.PointLight(0xffcf8a,5,5,1.8);tl.position.set(11.4,1.5,-1.0);scene.add(tl);S.tableLamp=tl;const tlb=new THREE.Mesh(new THREE.SphereGeometry(.07),new THREE.MeshBasicMaterial({color:0xfff2c8}));tlb.position.copy(tl.position);scene.add(tlb);
 // items: cap + keys + badge (hidden until placed)
 const items=new THREE.Group();items.visible=false;items.position.set(10.6,.98,-1.25);const cap=new THREE.Mesh(new THREE.SphereGeometry(.13,18,10,0,Math.PI*2,0,Math.PI/2),M(0x1f3a6a));cap.position.set(-.2,0,0);items.add(cap);const brim=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.012,20,1,false,0,Math.PI),M(0x162a50));brim.position.set(-.2,.005,.12);brim.rotation.x=0;items.add(brim);const bdg=new THREE.Mesh(new THREE.PlaneGeometry(.1,.06),M(0xffffff,{map:label('PORTERO','#e8d9b0','#14100a',128,80,26)}));bdg.position.set(-.2,.1,.12);bdg.rotation.x=-.4;items.add(bdg);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.04,.008,8,16),M(0xd6d9df,{metalness:.9,roughness:.2}));ring.position.set(.25,.01,0);ring.rotation.x=Math.PI/2;items.add(ring);for(let k=0;k<2;k++){const key=new THREE.Mesh(new THREE.BoxGeometry(.015,.005,.07),M(k?0xe8c24a:0xa9adb4,{metalness:.9}));key.position.set(.25+(k?.05:-.04),.01,.07);key.rotation.y=k?.5:-.4;items.add(key)}const tag=new THREE.Mesh(new THREE.BoxGeometry(.07,.01,.045),M(0xb8281f));tag.position.set(.3,.01,.0);items.add(tag);scene.add(items);S.items=items;
 // ceiling camera + red led
 const cb=new THREE.Mesh(new THREE.SphereGeometry(.14,16,10),M(0x1e2226));cb.position.set(10.6,4.45,-.8);scene.add(cb);const cr=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.4),M(0x14171a));cr.position.set(10.6,4.7,-.8);scene.add(cr);const cl=new THREE.Mesh(new THREE.SphereGeometry(.03),new THREE.MeshBasicMaterial({color:0xff2a1a}));cl.position.set(10.72,4.42,-.7);scene.add(cl);S.camLed=cl;const camL=new THREE.PointLight(0xff2a1a,0,3);camL.position.copy(cl.position);scene.add(camL);S.camLight=camL;
 // alarm beacons
 for(const x of[-3.5,5.5,11]){const b=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x4a1410}));b.position.set(x,4.3,-1.2);b.rotation.x=Math.PI;scene.add(b);const L=new THREE.PointLight(0xff2a1a,0,12,1.6);L.position.set(x,3.9,-.6);scene.add(L);S.alarms.push({b,L,x})}
 // dust
 const N=300,pg=new THREE.BufferGeometry(),pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=-9+rnd()*24;pos[i*3+1]=rnd()*4.6;pos[i*3+2]=-2+rnd()*8}pg.setAttribute('position',new THREE.BufferAttribute(pos,3));const dust=new THREE.Points(pg,new THREE.PointsMaterial({color:0xcfe0f0,size:.022,transparent:true,opacity:.5}));scene.add(dust);S.dust=dust;
 return S}
