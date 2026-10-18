// ---------- orchard props (almonds / apples / blueberries on a table) ----------
const props=new THREE.Group();meadow.add(props);
{const wood=new THREE.MeshStandardMaterial({color:0x8a6a3e,roughness:.85});const top=new THREE.Mesh(new THREE.BoxGeometry(1.15,.05,.62),wood);top.position.set(.75,.78,.25);top.castShadow=true;props.add(top);
 [[.55,.3],[-.55,.3],[.55,-.3],[-.55,-.3]].forEach(([dx,dz])=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.05,.78,.05),wood);l.position.set(.75+dx,.39,.25+dz);props.add(l);});
 const bowlM=new THREE.MeshStandardMaterial({color:0xe9e4d8,roughness:.5});[.42,.75,1.08].forEach(x=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.13,.08,.07,24),bowlM);b.position.set(x,.835,.25);b.castShadow=true;props.add(b);});}
const PI_=[];function mkPile(cx,n,col,rad,kind){const arr=[];for(let i=0;i<n;i++){const a=rng(cx*100+i)*6.28,rr=Math.sqrt(rng(cx*100+i+1))*(.1-rad),y=.87+Math.sqrt(Math.max(0,.0064-rr*rr))*.9*rng(i+3)+rad*.6;arr.push({x:cx+Math.cos(a)*rr,y,z:.25+Math.sin(a)*rr,tv:0,col});}return arr;}
const pileA=mkPile(.42,46,0x8a5a2b,.012),pileM=mkPile(.75,12,0xc3201a,.032),pileB=mkPile(1.08,70,0x35477a,.009);
pileA.forEach(p=>p.tv=wA+.05);pileM.forEach(p=>p.tv=wM+.05);pileB.forEach(p=>p.tv=wB+.05);
const almMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshStandardMaterial({color:0x8a5a2b,roughness:.7}),pileA.length);almMesh.geometry.scale(1,1.5,.8);
const appMesh2=new THREE.InstancedMesh(new THREE.SphereGeometry(.034,10,8),new THREE.MeshStandardMaterial({color:0xc3201a,roughness:.45}),pileM.length);
const bluMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.0095,8,6),new THREE.MeshStandardMaterial({color:0x35477a,roughness:.4}),pileB.length);
[almMesh,appMesh2,bluMesh].forEach(m=>{m.frustumCulled=false;m.castShadow=true;props.add(m);});
poof(wA+.05,.42,.9,.25,16,[.8,.55,.3]);poof(wM+.05,.75,.9,.25,16,[1,.3,.2]);poof(wB+.05,1.08,.9,.25,16,[.4,.5,1]);
APPLES.forEach((a,i)=>{if(i%3===0)poof(a.tv,a.x,a.y,a.z,6,[1,.3,.2]);});
function updatePiles(t){const m=new THREE.Matrix4(),q=new THREE.Quaternion(),s3=V3(1,1,1);
  [[pileA,almMesh],[pileM,appMesh2],[pileB,bluMesh]].forEach(([arr,mesh])=>{arr.forEach((p,i)=>{const a=1-ss(p.tv,p.tv+.2,t);s3.set(a,a,a);m.compose(V3(p.x,p.y,p.z),q,s3);mesh.setMatrixAt(i,m);});mesh.instanceMatrix.needsUpdate=true;});
  const mA=new THREE.Matrix4();APPLES.forEach((a,i)=>{const s=1-ss(a.tv,a.tv+.22,t);mA.compose(V3(a.x,a.y,a.z),q,V3(s,s,s));appleMesh.setMatrixAt(i,mA);});appleMesh.instanceMatrix.needsUpdate=true;}

// ---------- per-scene environment ----------
function envFor(t,s){
  let Wt=0;
  if(s===1)Wt=.18*ss(ST[1],ENDS[1],t);else if(s===2)Wt=lerp(.18,.5,ss(ST[2],ENDS[2],t));else if(s===3)Wt=.5;
  else if(s===4)Wt=lerp(.55,.82,ss(ST[4],ENDS[4],t));else if(s===5)Wt=lerp(.85,1,ss(ST[5],ENDS[5],t));
  return {W:Wt,dusk:s===5?1:0};
}
function setLook(s,Wt,dusk,sunTarget){
  meadow.visible=[0,1,2,4,5,7].includes(s);market.visible=s===3;wheat.visible=s===6;sky.visible=s!==3;props.visible=s===2;
  DU.value=s===6?0:Wt;ENV.wither=Wt;ENV.dusk=dusk;
  const wind=s===4?2.3:(s===5?1.3:(s===6?1.7:.9));WU.value=wind;ENV.wind=wind;
  let sunPos,sunCol,sunI,hemiSky,hemiGnd,hemiI,fogC,fogD;
  if(s===3){sunI=0;hemiSky=0xffffff;hemiGnd=0xb8c0c8;hemiI=1.5;fogC=0xdfe5ea;fogD=.0;}
  else if(s===5){sunPos=V3(-4,2.0,-5.5);sunCol=0xff9a50;sunI=3.2;hemiSky=0x7c88c8;hemiGnd=0x3a2a1a;hemiI=.55;fogC=0xd9a07a;fogD=.017;}
  else if(s===6){sunPos=V3(6,3.6,2.5);sunCol=0xffc070;sunI=3.6;hemiSky=0xcfe0ff;hemiGnd=0x7a5a2a;hemiI=.8;fogC=0xf0d9a8;fogD=.009;}
  else{sunPos=V3(5,8,4);sunCol=0xfff0d8;sunI=3.3*(1-Wt*.3);hemiSky=0xbfd8ff;hemiGnd=0x5a4a2a;hemiI=.9;fogC=lerp(0,1,0)||0xbfd6ea;fogD=.011+Wt*.006;}
  hemi.color.set(hemiSky);hemi.groundColor.set(hemiGnd);hemi.intensity=hemiI;sun.intensity=sunI;
  if(sunPos){sun.color.set(sunCol);sun.position.copy(sunPos).add(sunTarget);sun.target.position.copy(sunTarget);sky.material.uniforms.uSun.value.copy(sunPos).normalize();}
  const topC=skyMat.uniforms.uTopC.value,horC=skyMat.uniforms.uHorC.value;
  if(s===6){topC.set(.30,.52,.88);horC.set(1.0,.84,.62);}else{topC.set(.16,.40,.86);horC.set(.78,.88,.97);}
  skyMat.uniforms.uWither.value=Wt;skyMat.uniforms.uDusk.value=dusk;
  if(fogD>0){scene.fog=new THREE.FogExp2(s===5?0xd9a07a:(s===6?0xf0d9a8:new THREE.Color(.74,.84,.93).lerp(new THREE.Color(.72,.70,.58),Wt*.6)),fogD);}else scene.fog=null;
  rim.intensity=s===5?2.6:1.4;fillL.intensity=s===3?1.1:.7;
}

// ---------- avatar choreography ----------
const lerpV=(a,b,k)=>V3(lerp(a[0],b[0],k),lerp(a[1],b[1],k),lerp(a[2],b[2],k));
const A_START=[-2.6,0,-3.4],A_END=[.3,0,.9],WALK0=3.5;
const M3_A=[0,0,-3.0],M3_B=[0,0,.3];
const W6_A=[-1.2,0,-6.6],W6_B=[.1,0,1.2];
const wAlc=wordT(4,'alcanzar');
function avatarPlan(t,s){
  const u=t-ST[s];let pos=V3(0,0,.5),head=0,list=[{n:'M_Standing_Idle_001',time:t,w:1}],walking=false;
  if(s===0){
    if(t<WALK0){pos=lerpV(A_START,A_END,t/WALK0);walking=true;}else pos=V3(...A_END);
    head=Math.atan2(A_END[0]-A_START[0],A_END[2]-A_START[2]);
    const wk=1-ss(WALK0-.45,WALK0,t),ex=ss(vac-.9,vac-.55,t);
    list=[];if(wk>0)list.push({n:'M_Walk_001',time:t*1.1,w:wk});
    const idleW=(1-wk)*(1-ex);if(idleW>0)list.push({n:'M_Standing_Idle_001',time:t,w:idleW});
    if(ex>0)list.push({n:'M_Standing_Expressions_010',time:t-(vac-.7),w:(1-wk)*ex});
    if(!list.length)list=[{n:'M_Standing_Idle_001',time:t,w:1}];
  }else if(s===1){
    pos=V3(.3,0,.9);const ex=1-ss(ST[1]+1.9,ST[1]+2.5,t);const lk=1-ex;
    list=[];if(ex>0)list.push({n:'M_Standing_Expressions_010',time:t-(vac-.7),w:ex});if(lk>0)list.push({n:'M_Talking_Variations_001',time:t-ST[1]-1.9,w:lk});
  }else if(s===2){
    pos=V3(-.4,0,.45);const fp=ss(wB-.5,wB-.1,t);
    list=[{n:'M_Talking_Variations_005',time:t-ST[2],w:1-fp}];if(fp>0)list.push({n:'M_Standing_Expressions_008',time:t-(wB-.3),w:fp});
  }else if(s===3){
    const wkEnd=wF-.35;const k=clamp((t-ST[3])/(wkEnd-ST[3]));pos=lerpV(M3_A,M3_B,k);walking=t<wkEnd;head=0;
    const wk=1-ss(wkEnd-.2,wkEnd+.1,t);list=[];if(wk>0)list.push({n:'M_Walk_002',time:t*1.0,w:wk});
    const fp=1-wk;if(fp>0)list.push({n:'M_Standing_Expressions_008',time:t-(wF-.45),w:fp});
  }else if(s===4){
    pos=V3(0,0,.5);const sh=ss(wAlc-1.2,wAlc-.8,t);list=[{n:'M_Talking_Variations_001',time:t-ST[4],w:1-sh}];if(sh>0)list.push({n:'M_Standing_Expressions_005',time:t-(wAlc-1.1),w:sh});
  }else if(s===5){
    pos=V3(0,0,.4);list=[{n:'M_Talking_Variations_007',time:t-ST[5],w:1}];
  }else if(s===6){
    const wkEnd=ST[6]+4.75;const k=clamp((t-ST[6])/(wkEnd-ST[6]));pos=lerpV(W6_A,W6_B,k);walking=t<wkEnd;head=Math.atan2(W6_B[0]-W6_A[0],W6_B[2]-W6_A[2]);
    const wk=1-ss(wkEnd-.4,wkEnd,t);list=[];if(wk>0)list.push({n:'M_Walk_001',time:t*1.0,w:wk});if(wk<1)list.push({n:'M_Talking_Variations_001',time:t-wkEnd,w:1-wk});
  }else{
    pos=V3(0,0,.5);list=[{n:'M_Standing_Idle_001',time:t,w:1}];
  }
  return {pos,head,list,walking};
}
// ---------- camera ----------
const CK=[
 [[0,[3.3,1.7,5.4],[-1.1,1.05,-1.4],36],[.62,[2.5,1.5,4.7],[.1,1.1,.8],34],[1,[1.5,1.35,4.1],[.2,1.2,.8],32]],
 [[0,[-1.6,.9,2.9],[.9,.75,.2],34],[.55,[.5,1.2,3.5],[.25,1.0,.5],34],[1,[1.7,1.5,4.3],[.1,1.2,.4],33]],
 [[0,[.3,1.5,6.4],[.3,1.1,.3],34],[1,[.4,1.4,5.2],[.3,1.15,.3],33]],
 [[0,[.15,1.6,4.8],[0,1.1,-1.2],35],[1,[.1,1.45,2.7],[0,1.3,.2],32]],
 [[0,[-2.3,1.4,4.4],[.2,1.1,.3],34],[1,[1.9,1.6,4.9],[0,1.15,.4],34]],
 [[0,[.1,1.0,3.9],[0,1.3,.4],32],[1,[.2,1.3,2.9],[0,1.3,.4],30]],
 [[0,[2.2,.9,4.8],[-.2,1.1,-1.5],34],[.7,[1.5,1.2,4.0],[0,1.15,0],33],[1,[-1.4,1.4,3.9],[.1,1.2,.3],33]],
 [[0,[.3,1.35,3.6],[0,1.25,.5],30],[1,[-.2,1.3,3.0],[0,1.25,.5],28]]];
function camAt(t,s){
  const ks=CK[s].map(k=>({t:ST[s]+k[0]*(ENDS[s]-ST[s]),p:k[1],l:k[2],f:k[3]}));
  let i=0;while(i<ks.length-2&&t>=ks[i+1].t)i++;
  const a=ks[i],b=ks[Math.min(i+1,ks.length-1)];const k=clamp((t-a.t)/Math.max(.001,b.t-a.t));
  // hermite with smooth tangents; eased only at the ends of the shot
  const e=ks.length===2?(k*k*(3-2*k)*.55+k*.45):k*k*(3-2*k)*.35+k*.65;
  const P=[0,1,2].map(c=>lerp(a.p[c],b.p[c],e)),L=[0,1,2].map(c=>lerp(a.l[c],b.l[c],e));
  return {p:V3(...P),l:V3(...L),f:lerp(a.f,b.f,e)};
}
const SHOTS=[[vac-.15,ENDS[0],.95],[ST[1]+2.2,ST[1]+4.6,.95],[wA-.3,wA+1.2,.95],[wB-.1,ENDS[2],1.9],[wF+.1,ENDS[3],1.9],[ST[5]+.4,ENDS[5]-.6,1.05],[ST[6]+4.9,ENDS[6],.95],[ST[7]+.2,TOTAL+2,.95]];
function shotB(t){let b=0,d=.95;for(const [a,c,dd] of SHOTS){const v=Math.min(eo((t-a)/.3),1-eo((t-c)/.3));if(v>b){b=v;d=dd;}}return {b,d};}
const _hv=V3(0,0,0),_hv2=V3(0,0,0);
function headWorld(){bones.Head.getWorldPosition(_hv);bones.HeadTop_End.getWorldPosition(_hv2);return _hv.clone().lerp(_hv2,.55);}
// ---------- 2D composite ----------
const out=document.getElementById('out'),g=out.getContext('2d');
function frame(t){
  const s=sceneAt(t),u=t-ST[s];
  const {W:Wt,dusk}=envFor(t,s);TU.value=t;ENV.time=t;
  const plan=avatarPlan(t,s);
  setLook(s,Wt,dusk,plan.pos);
  const cw=camAt(t,s);
  // avatar placement (faces the camera once it stops walking)
  const yawFace=Math.atan2(cw.p.x-plan.pos.x,cw.p.z-plan.pos.z);
  const yaw=plan.walking?plan.head:(s===0?yawFace:yawFace);
  const yawBlend=s===0?lerp(plan.head,yawFace,ss(WALK0-.6,WALK0+.5,t)):(s===6?lerp(plan.head,yawFace,ss(ST[6]+4.3,ST[6]+5.0,t)):yaw);
  holder.position.copy(plan.pos);holder.rotation.set(0,yawBlend,0);
  const w=applyFace(t);poseAvatar(plan.list);
  addRot(bones.Head,HEADMOT.x,HEADMOT.y,HEADMOT.z);addRot(bones.Neck,HEADMOT.x*.4,HEADMOT.y*.4,HEADMOT.z*.4);
  holder.updateMatrixWorld(true);
  // close-up blend
  const sb=shotB(t),b=sb.b;let cp=cw.p,cl=cw.l,cf=cw.f;
  if(b>.001){const hp=headWorld();const hq=new THREE.Quaternion();bones.Head.getWorldQuaternion(hq);const fw=V3(0,0,1).applyQuaternion(hq);let yh=Math.atan2(fw.x,fw.z);let dy=yh-yawBlend;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const yc=yawBlend+clamp(dy,-.9,.9)*.85;const off=V3(.16*sb.d,.02,sb.d).applyAxisAngle(V3(0,1,0),yc);const cpC=hp.clone().add(off);cpC.y=hp.y+(sb.d>1.5?-.05:.05);cp=cw.p.clone().lerp(cpC,b);cl=cw.l.clone().lerp(hp,b);cf=lerp(cw.f,sb.d>1.5?30:24,b);}
  const sh=.006;cp=cp.clone().add(V3(sh*(Math.sin(t*1.3)+.6*Math.sin(t*2.9+1)),sh*.7*Math.sin(t*1.9+.5),sh*.5*Math.sin(t*1.1+2)));
  cam.position.copy(cp);cam.lookAt(cl);cam.fov=cf;cam.updateProjectionMatrix();
  // world updates
  if(meadow.visible){updateFlowers(t,Wt);updateBees(t,cam.position);updateButterflies(t);updatePollen(t,plan.pos.x,plan.pos.z,1-Wt*.85);updatePiles(t);}
  if(market.visible)updateMarket(t);
  updatePoofs(t);
  r.render(scene,cam);
  // ---- composite + cinematic finish
  g.clearRect(0,0,W,H);g.drawImage(glc,0,0,W,H);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=s===3?.12:.2;g.filter='blur(16px) brightness(1.1)';g.drawImage(glc,0,0,W,H);g.restore();
  const vg=g.createRadialGradient(540,900,420,540,960,1180);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${s===5?.5:.34})`);g.fillStyle=vg;g.fillRect(0,0,W,H);
  if(t<.25){g.fillStyle=`rgba(0,0,0,${1-t/.25})`;g.fillRect(0,0,W,H);}
  if(t>TOTAL-.5){g.fillStyle=`rgba(0,0,0,${clamp((t-(TOTAL-.5))/.5)})`;g.fillRect(0,0,W,H);}
  // flash on hard cuts
  if(u<.1&&s>0){g.fillStyle=`rgba(255,255,255,${.22*(1-u/.1)})`;g.fillRect(0,0,W,H);}
}
window.frame=frame;window.ready=true;
