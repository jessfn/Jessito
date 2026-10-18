// ---------- MEADOW ----------
const meadow=new THREE.Group();scene.add(meadow);
const gh=(x,z)=>{const rr=Math.hypot(x,z);return (.22*Math.sin(x*.11+1.3)*Math.cos(z*.09)+.07*Math.sin(x*.37)*Math.sin(z*.31))*ss(5,18,rr);};
{const g=new THREE.PlaneGeometry(100,100,100,100);g.rotateX(-Math.PI/2);const p=g.attributes.position,cols=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,gh(x,z));const n=.5+.5*Math.sin(x*.9)*Math.sin(z*.8)*.6+.25*Math.sin(x*.21+z*.17);const k=.78+.4*n;cols.push(.10*k,.24*k,.06*k);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,dryable(new THREE.MeshStandardMaterial({vertexColors:true,roughness:1})));m.receiveShadow=true;meadow.add(m);}
// grass blades
const NG=Number(Q.get('gn')||24000);
function bladeGeo(){const seg=4,pos=[],nor=[],idx=[];for(let i=0;i<=seg;i++){const y=i/seg,w=.017*(1-y*.9),c=.07*y*y;pos.push(-w,y,c,w,y,c);nor.push(0,.35,.94,0,.35,.94);}for(let i=0;i<seg;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);return g;}
const grass=new THREE.InstancedMesh(bladeGeo(),dryable(new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,side:THREE.DoubleSide}),{wind:true,windAmp:.18}),NG);
{const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),c=new THREE.Color();
 for(let i=0;i<NG;i++){const a=rng(i*7+1)*6.2832,rad=15*Math.pow(rng(i*7+2),.62),x=Math.cos(a)*rad,z=Math.sin(a)*rad;
  q.setFromAxisAngle(V3(0,1,0),rng(i*7+3)*6.2832);const hgt=.3+.5*rng(i*7+4),wd=.8+.9*rng(i*7+5);
  m4.compose(V3(x,gh(x,z),z),q,V3(wd,hgt,wd));grass.setMatrixAt(i,m4);
  c.setHSL(.24+.06*rng(i*7+6),.5+.15*rng(i*7+2),.2+.14*rng(i*7+5));grass.setColorAt(i,c);}
 grass.instanceMatrix.needsUpdate=true;grass.instanceColor.needsUpdate=true;grass.frustumCulled=false;meadow.add(grass);}
// flowers
function flowerTex(petal,center,n,rad){const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.translate(64,64);
  for(let i=0;i<n;i++){g.save();g.rotate(i/n*Math.PI*2);g.fillStyle=petal;g.beginPath();g.ellipse(0,-rad,rad*.42,rad*.95,0,0,7);g.fill();g.restore();}
  g.fillStyle=center;g.beginPath();g.arc(0,0,rad*.55,0,7);g.fill();const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;}
const FTYPES=[{tex:flowerTex('#ffd21f','#7a4a12',12,26),base:new THREE.Color(1,1,1)},{tex:flowerTex('#b36ae0','#ffd84a',9,26),base:new THREE.Color(1,1,1)},{tex:flowerTex('#ffffff','#f2b705',13,26),base:new THREE.Color(1,1,1)}];
const NF=150,FALL=[];
const fHead=FTYPES.map(f=>{const m=new THREE.InstancedMesh(new THREE.PlaneGeometry(.15,.15),new THREE.MeshStandardMaterial({map:f.tex,alphaTest:.5,side:THREE.DoubleSide,roughness:.8}),NF);m.frustumCulled=false;meadow.add(m);return m;});
const fStem=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0045,.0055,1,6),dryable(new THREE.MeshStandardMaterial({color:0x3f7a2b,roughness:.9})),NF*3);fStem.frustumCulled=false;meadow.add(fStem);
for(let k=0;k<3;k++)for(let i=0;i<NF;i++){const j=k*NF+i,a=rng(j*11+1)*6.2832,rad=9.5*Math.sqrt(rng(j*11+2));FALL.push({x:Math.cos(a)*rad,z:Math.sin(a)*rad,h:.38+.5*rng(j*11+3),ph:rng(j*11+4)*6.28,del:rng(j*11+5)*.5,tilt:.25+.7*rng(j*11+6),yaw:rng(j*11+7)*6.28,k,i});}
const _m4=new THREE.Matrix4(),_q2=new THREE.Quaternion(),_eu=new THREE.Euler(),_c=new THREE.Color(),_brown=new THREE.Color(.33,.22,.1);
function updateFlowers(t,W){
  for(let j=0;j<FALL.length;j++){const f=FALL[j];const wk=clamp((W-f.del)/.4),sway=Math.sin(t*1.6+f.ph)*.05*ENV.wind;
    const hh=f.h*(1-.4*wk),droop=wk*1.5;
    // stem
    _eu.set(sway*.6+wk*.35,f.yaw,sway*.5);_q2.setFromEuler(_eu);_m4.compose(V3(f.x,gh(f.x,f.z)+hh/2,f.z),_q2,V3(1,hh,1));fStem.setMatrixAt(j,_m4);
    // head
    const top=V3(f.x+Math.sin(sway*.6+wk*.35)*hh*.5,gh(f.x,f.z)+hh*.98,f.z);
    _eu.set(-Math.PI/2+f.tilt*.55+droop,f.yaw,sway);_q2.setFromEuler(_eu);const sc=1-.35*wk;_m4.compose(top,_q2,V3(sc,sc,sc));
    const hm=fHead[f.k];hm.setMatrixAt(f.i,_m4);_c.setRGB(1,1,1).lerp(_brown,wk);hm.setColorAt(f.i,_c);}
  fStem.instanceMatrix.needsUpdate=true;fHead.forEach(h=>{h.instanceMatrix.needsUpdate=true;h.instanceColor.needsUpdate=true;});
}
// orchard
function blobGeo(R,seed){let g=new THREE.IcosahedronGeometry(R,3);g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g,1e-4);const p=g.attributes.position,cols=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=.5*Math.sin(x*3.1+seed)+.35*Math.sin(y*4.3+seed*2)+.3*Math.sin(z*3.7+seed*3)+.2*Math.sin((x+y+z)*7.9);const k=1+.11*n;p.setXYZ(i,x*k,y*k,z*k);
    const sh=.82+.28*(.5+.5*Math.sin(x*6.1+z*5.3+seed))+.18*(y/R);cols.push(.16*sh,.38*sh,.08*sh);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();return g;}
const TREES=[[-6.5,-7.5],[-3,-10.5],[2.8,-8.6],[6.8,-8],[10,-12],[-10,-12],[0,-14.5],[5.5,-14],[-7.5,-14.5]];
const foliageMat=dryable(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}));
const trunkMat=new THREE.MeshStandardMaterial({color:0x4a3220,roughness:1});
const APPLES=[];
for(let t=0;t<TREES.length;t++){const [tx,tz]=TREES[t];const y0=gh(tx,tz);
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,2.2,10),trunkMat);tr.position.set(tx,y0+1.1,tz);tr.castShadow=false;meadow.add(tr);
  for(let b=0;b<4;b++){const f=new THREE.Mesh(blobGeo(1.0+.35*rng(t*9+b),t*9+b),foliageMat);f.position.set(tx+(rng(t*9+b+1)-.5)*1.5,y0+2.6+rng(t*9+b+2)*.9,tz+(rng(t*9+b+3)-.5)*1.5);f.scale.y=.85;meadow.add(f);}
  for(let a=0;a<16;a++){const ang=rng(t*31+a)*6.28,el=.2+rng(t*31+a+5)*1.0,R=1.25;APPLES.push({x:tx+Math.cos(ang)*R*Math.cos(el)*.9,y:y0+2.5+Math.sin(el)*R*.7,z:tz+Math.sin(ang)*R*Math.cos(el)*.9,tv:0});}}
const appleMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.085,10,8),new THREE.MeshStandardMaterial({color:0xc3201a,roughness:.5}),APPLES.length);appleMesh.frustumCulled=false;meadow.add(appleMesh);
APPLES.forEach((a,i)=>{a.tv=wM+.05+rng(i*13+2)*1.5;});
// distant hills
const hillMat=dryable(new THREE.MeshStandardMaterial({color:0x4d7a3a,roughness:1}));
[[-30,-70,26,10],[10,-85,40,14],[45,-60,22,8],[-60,-55,20,7]].forEach(([x,z,rx,ry])=>{const h=new THREE.Mesh(new THREE.SphereGeometry(1,24,12),hillMat);h.scale.set(rx,ry,rx*.6);h.position.set(x,-ry*.28,z);meadow.add(h);});
// pollen
const NP=500;const pollenGeo=new THREE.BufferGeometry();pollenGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(NP*3),3));
const dotCv=document.createElement('canvas');dotCv.width=dotCv.height=64;{const g=dotCv.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);}
const dotTex=new THREE.CanvasTexture(dotCv);
const pollen=new THREE.Points(pollenGeo,new THREE.PointsMaterial({size:.055,map:dotTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,color:0xffe3a0,opacity:.9}));pollen.frustumCulled=false;meadow.add(pollen);
function updatePollen(t,cx,cz,amount){const p=pollenGeo.attributes.position;for(let i=0;i<NP;i++){const x=cx+(rng(i*3+1)-.5)*14+Math.sin(t*.3+i)*.6,y=.15+rng(i*3+2)*3.2+Math.sin(t*.5+i*1.7)*.25,z=cz+(rng(i*3+3)-.5)*12+Math.cos(t*.25+i*.7)*.6;p.setXYZ(i,x,y,z);}p.needsUpdate=true;pollen.material.opacity=.9*amount;pollen.visible=amount>.02;}
// poof particles
const POOFS=[];const NPF=900;const pfGeo=new THREE.BufferGeometry();pfGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(NPF*3),3));pfGeo.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(NPF*3),3));
const poofPts=new THREE.Points(pfGeo,new THREE.PointsMaterial({size:.07,map:dotTex,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));poofPts.frustumCulled=false;scene.add(poofPts);
function poof(t0,x,y,z,n,col){POOFS.push({t0,x,y,z,n,col});}
function updatePoofs(t){const p=pfGeo.attributes.position,c=pfGeo.attributes.color;let k=0;
  for(const e of POOFS){const age=t-e.t0;if(age<0||age>1.0)continue;const fade=1-age;for(let i=0;i<e.n&&k<NPF;i++,k++){const s=e.t0*13+i*7;const th=rng(s)*6.28,ph=(rng(s+1)-.5)*3.14,sp=.25+rng(s+2)*.55;
    p.setXYZ(k,e.x+Math.cos(th)*Math.cos(ph)*sp*age,e.y+Math.sin(ph)*sp*age+.12*age*age,e.z+Math.sin(th)*Math.cos(ph)*sp*age);c.setXYZ(k,e.col[0]*fade,e.col[1]*fade,e.col[2]*fade);}}
  for(;k<NPF;k++){p.setXYZ(k,0,-50,0);c.setXYZ(k,0,0,0);}p.needsUpdate=true;c.needsUpdate=true;}
// ---------- BEES ----------
const NB=Number(Q.get('nb')||190),SB=3.7;
const bodyGeo=(()=>{const mk=(g,c)=>{const n=g.attributes.position.count,a=[];for(let i=0;i<n;i++)a.push(...c(i,g));g.setAttribute('color',new THREE.Float32BufferAttribute(a,3));return g;};
  const abd=new THREE.SphereGeometry(1,14,10);abd.scale(.0058,.0056,.0105);abd.translate(0,0,-.0115);mk(abd,(i,g)=>{const z=g.attributes.position.getZ(i)+.0115,yel=Math.floor((z+.0105)/.0042)%2===0;return yel?[.95,.7,.1]:[.04,.03,.02];});
  const th=new THREE.SphereGeometry(1,12,9);th.scale(.0058,.0056,.0064);th.translate(0,.0003,.0008);mk(th,()=>[.55,.36,.1]);
  const hd=new THREE.SphereGeometry(1,10,8);hd.scale(.0042,.0042,.0042);hd.translate(0,0,.0076);mk(hd,()=>[.05,.04,.03]);
  return mergeGeometries([abd,th,hd]);})();
const beeBody=new THREE.InstancedMesh(bodyGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7}),NB);beeBody.frustumCulled=false;beeBody.castShadow=false;meadow.add(beeBody);
const wingGeo=new THREE.PlaneGeometry(.017,.0078);wingGeo.rotateX(-Math.PI/2);wingGeo.translate(.0085,0,0);
const wingMat=new THREE.MeshBasicMaterial({color:0xeaf2ff,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false});
const wingL=new THREE.InstancedMesh(wingGeo,wingMat,NB),wingR=new THREE.InstancedMesh(wingGeo,wingMat,NB);wingL.frustumCulled=wingR.frustumCulled=false;meadow.add(wingL);meadow.add(wingR);
function beePos(i,t,out){const sp=rng(i*3+1)<.75?2.6:6.0;const cx=(rng(i*3+1)-.5)*sp*2,cz=.5+(rng(i*3+2)-.5)*sp*1.6,cy=.5+rng(i*3+3)*1.5;
  const rho=.45+rng(i*5+1)*1.2,w1=.55+rng(i*5+2)*.9,w2=.9+rng(i*5+3)*1.2,ph=rng(i*5+4)*6.28;
  return out.set(cx+rho*Math.cos(w1*t+ph)+.3*Math.sin(w2*t*2.1+ph*2),cy+.2*Math.sin(w2*t+ph)+.05*Math.sin(t*9+i),cz+rho*Math.sin(w1*t*1.27+ph*1.7)+.3*Math.cos(w2*t*1.7+ph));}
const BEETV=[];for(let i=0;i<NB;i++)BEETV.push(vac-.7+rng(i*17+3)*1.5);
for(let i=0;i<NB;i+=5){const p=beePos(i,BEETV[i],V3(0,0,0));poof(BEETV[i],p.x,p.y,p.z,10,[1,.82,.25]);}
const _p0=V3(0,0,0),_p1=V3(0,0,0),_d=V3(0,0,0),_zero=V3(0,0,0),_up=V3(0,1,0),_mm=new THREE.Matrix4(),_qq=new THREE.Quaternion(),_rz=new THREE.Quaternion(),_sc=V3(1,1,1),_tt=V3(0,0,0);
function beeVis(i,t){if(t<ST[1])return 1-ss(BEETV[i],BEETV[i]+.28,t);if(t>=ST[7])return ss(ST[7]+.3+rng(i*19+1)*1.6,ST[7]+.9+rng(i*19+1)*1.6,t);return 0;}
function updateBees(t,camP){
  for(let i=0;i<NB;i++){let v=beeVis(i,t);if(v>0){beePos(i,t,_p0);v*=ss(.35,1.5,_p0.distanceTo(camP));}const s=SB*v;
    if(v<=.001){_mm.makeScale(0,0,0);beeBody.setMatrixAt(i,_mm);wingL.setMatrixAt(i,_mm);wingR.setMatrixAt(i,_mm);continue;}
    beePos(i,t,_p0);beePos(i,t+.04,_p1);_d.copy(_p1).sub(_p0);_mm.lookAt(_zero,_d.negate(),_up);_qq.setFromRotationMatrix(_mm);
    _sc.set(s,s,s);_mm.compose(_p0,_qq,_sc);beeBody.setMatrixAt(i,_mm);
    const fl=Math.sin(t*2*Math.PI*17+i*1.3)*.75+.15;
    for(const sd of [1,-1]){_rz.setFromAxisAngle(V3(0,0,1),fl*sd);_tt.set(sd*.0025*s,.0045*s,-.0008*s);const wq=_qq.clone().multiply(_rz);const mx=new THREE.Matrix4();
      _sc.set(s*sd,s,s);_tt.applyQuaternion(_qq).add(_p0);mx.compose(_tt,wq,_sc);(sd>0?wingL:wingR).setMatrixAt(i,mx);}
  }
  beeBody.instanceMatrix.needsUpdate=wingL.instanceMatrix.needsUpdate=wingR.instanceMatrix.needsUpdate=true;
}
// butterflies (they help "a little")
const NBF=8;const bfCv=document.createElement('canvas');bfCv.width=128;bfCv.height=96;{const g=bfCv.getContext('2d');g.fillStyle='#f28a1d';g.beginPath();g.moveTo(0,48);g.bezierCurveTo(30,-10,110,0,126,30);g.bezierCurveTo(120,70,70,95,0,56);g.closePath();g.fill();g.strokeStyle='#1a1008';g.lineWidth=6;g.stroke();g.fillStyle='#fff';[[60,25],[90,35],[75,60]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,5,0,7);g.fill();});}
const bfTex=new THREE.CanvasTexture(bfCv);bfTex.colorSpace=THREE.SRGBColorSpace;
const bfG=new THREE.PlaneGeometry(.15,.11);bfG.rotateX(-Math.PI/2);bfG.translate(.035,0,0);
const bfMat=new THREE.MeshBasicMaterial({map:bfTex,transparent:true,alphaTest:.3,side:THREE.DoubleSide});
const bfL=new THREE.InstancedMesh(bfG,bfMat,NBF),bfR=new THREE.InstancedMesh(bfG,bfMat,NBF);bfL.frustumCulled=bfR.frustumCulled=false;meadow.add(bfL);meadow.add(bfR);
function updateButterflies(t){const vis=ss(ST[4]+.3,ST[4]+1.2,t)*(1-ss(ST[5]-.5,ST[5],t));
  for(let i=0;i<NBF;i++){const s=vis*(.8+.5*rng(i+40)),ph=rng(i+50)*6.28;const x=(rng(i+60)-.5)*5+Math.sin(t*.5+ph)*1.4,y=.8+.7*rng(i+70)+Math.sin(t*1.1+ph)*.25,z=.2+(rng(i+80)-.5)*3+Math.cos(t*.43+ph)*1.2;
    const yaw=Math.atan2(Math.cos(t*.5+ph)*.5,-Math.sin(t*.43+ph)*.5);_qq.setFromAxisAngle(V3(0,1,0),yaw);const fl=(.15+Math.abs(Math.sin(t*2*Math.PI*2.6+i)))*1.0;
    for(const sd of [1,-1]){_rz.setFromAxisAngle(V3(0,0,1),fl*sd);const wq=_qq.clone().multiply(_rz);_sc.set(s*sd,s,s);const mx=new THREE.Matrix4().compose(V3(x,y,z),wq,_sc);(sd>0?bfL:bfR).setMatrixAt(i,mx);}}
  bfL.instanceMatrix.needsUpdate=bfR.instanceMatrix.needsUpdate=true;}
