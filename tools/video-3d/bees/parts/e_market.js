// ---------- SUPERMARKET ----------
const market=new THREE.Group();market.visible=false;scene.add(market);
function canvasTex(w,h,fn,rep){const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=4;}return t;}
const tileTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#d9d4c7';g.fillRect(0,0,w,h);for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.fillStyle=(x+y)%2?'#e6e1d4':'#cfc9ba';g.fillRect(x*128+2,y*128+2,124,124);}},[6,24]);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(6.4,34),new THREE.MeshStandardMaterial({map:tileTex,roughness:.3,metalness:.12}));floor.rotateX(-Math.PI/2);floor.position.set(0,0,-6);market.add(floor);
const wallMat=new THREE.MeshStandardMaterial({color:0xe9ecee,roughness:.95});
const ceil=new THREE.Mesh(new THREE.PlaneGeometry(6.4,34),new THREE.MeshStandardMaterial({color:0xf2f2f2,roughness:1}));ceil.rotateX(Math.PI/2);ceil.position.set(0,3.4,-6);market.add(ceil);
[-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(34,3.4),wallMat);w.rotation.y=-s*Math.PI/2;w.position.set(s*3.2,1.7,-6);market.add(w);});
const back=new THREE.Mesh(new THREE.PlaneGeometry(6.4,3.4),new THREE.MeshStandardMaterial({color:0xdfe6e0,roughness:.95}));back.position.set(0,1.7,-14);market.add(back);
const lightBox=new THREE.BoxGeometry(1.3,.06,.45),lightMat=new THREE.MeshBasicMaterial({color:0xfffaf0});
for(let k=0;k<12;k++)for(const x of [-1.5,1.5]){const l=new THREE.Mesh(lightBox,lightMat);l.position.set(x,3.36,4-k*2.4);market.add(l);}
// shelves + products
const shelfMat=new THREE.MeshStandardMaterial({color:0xc9ced4,roughness:.6,metalness:.3});
const prodPalette=[0xd94a3a,0xe9a33a,0x3a8fd9,0x4cae5e,0xf3e0b0,0x8e5bc0,0xd8d8d8,0xc0392b];
const PRODS=[];
for(const s of [-1,1])for(let k=0;k<13;k++){const z=-12.6+k*1.25;
  const bk=new THREE.Mesh(new THREE.BoxGeometry(.05,2.1,1.15),shelfMat);bk.position.set(s*2.62,1.05,z);market.add(bk);
  for(let b=0;b<4;b++){const bd=new THREE.Mesh(new THREE.BoxGeometry(.55,.035,1.15),shelfMat);bd.position.set(s*2.35,.32+b*.5,z);market.add(bd);
    for(let p=0;p<5;p++){const hgt=.14+.08*rng(k*40+b*9+p+(s>0?500:0)),wd=.13+.06*rng(k*40+b*9+p+7);PRODS.push({x:s*2.3+(rng(k+b*3+p*7)-.5)*.2,y:.35+b*.5+hgt/2,z:z-.45+p*.22,w:wd,h:hgt,col:prodPalette[Math.floor(rng(k*40+b*9+p+3)*prodPalette.length)],gone:rng(k*40+b*9+p+11)<.45,tv:ST[3]+.5+rng(k*40+b*9+p+13)*3.3});}}}
const prodMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({roughness:.6}),PRODS.length);prodMesh.frustumCulled=false;market.add(prodMesh);
{const c=new THREE.Color();PRODS.forEach((p,i)=>{c.set(p.col);prodMesh.setColorAt(i,c);});prodMesh.instanceColor.needsUpdate=true;}
// produce crates + fruit
const FRU=[];const crateMat=new THREE.MeshStandardMaterial({color:0x9b7140,roughness:.9});
const crateGroups=[[-1.25,-3.2],[-1.25,-2.4],[-1.25,-1.6],[-1.25,-.8],[-1.25,.0],[-1.25,.8]];
const fruitCols=[0xc3201a,0xf08a1a,0x66b32e,0xf3d21c,0xb3201a,0x7fb83a];
crateGroups.forEach(([cx,cz],ci)=>{const cr=new THREE.Mesh(new THREE.BoxGeometry(.7,.28,.7),crateMat);cr.position.set(cx,.14+.45,cz);market.add(cr);
  const leg=new THREE.Mesh(new THREE.BoxGeometry(.72,.45,.72),new THREE.MeshStandardMaterial({color:0x6e4e2a,roughness:1}));leg.position.set(cx,.225,cz);market.add(leg);
  for(let i=0;i<7;i++)for(let j=0;j<7;j++){const h=.03*rng(ci*49+i*7+j)*2;FRU.push({x:cx-.27+i*.09,y:.59+.07+h,z:cz-.27+j*.09,col:fruitCols[ci%fruitCols.length],tv:ST[3]+.3+rng(ci*97+i*7+j+3)*3.2});}});
const fruitMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.043,10,8),new THREE.MeshStandardMaterial({roughness:.45}),FRU.length);fruitMesh.frustumCulled=false;market.add(fruitMesh);
{const c=new THREE.Color();FRU.forEach((p,i)=>{c.set(p.col);fruitMesh.setColorAt(i,c);});fruitMesh.instanceColor.needsUpdate=true;}
FRU.forEach((f,i)=>{if(i%9===0)poof(f.tv,f.x,f.y+.05,f.z,5,[1,.55,.3]);});
const signTex=canvasTex(512,128,(g,w,h)=>{g.fillStyle='#1f7a3c';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='900 54px Inter, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('FRUTAS Y VERDURAS',w/2,h/2+2);g.strokeStyle='#fff';g.lineWidth=5;g.strokeRect(6,6,w-12,h-12);});
const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.48),new THREE.MeshBasicMaterial({map:signTex}));sign.position.set(-1.4,2.75,-1.6);sign.rotation.y=.5;market.add(sign);
function updateMarket(t){
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),s3=V3(1,1,1);
  for(let i=0;i<PRODS.length;i++){const p=PRODS[i];const a=p.gone?1-ss(p.tv,p.tv+.25,t):1;s3.set(p.w*a,p.h*a,.16*a);m.compose(V3(p.x,p.y,p.z),q,s3);prodMesh.setMatrixAt(i,m);}
  for(let i=0;i<FRU.length;i++){const f=FRU[i];const a=1-ss(f.tv,f.tv+.22,t);s3.set(a,a,a);m.compose(V3(f.x,f.y,f.z),q,s3);fruitMesh.setMatrixAt(i,m);}
  prodMesh.instanceMatrix.needsUpdate=fruitMesh.instanceMatrix.needsUpdate=true;}
