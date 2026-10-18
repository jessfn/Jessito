// ---------- WHEAT FIELD ----------
const wheat=new THREE.Group();wheat.visible=false;scene.add(wheat);
{const g=new THREE.PlaneGeometry(100,100,50,50);g.rotateX(-Math.PI/2);const cols=[],p=g.attributes.position;for(let i=0;i<p.count;i++){const n=.8+.3*Math.sin(p.getX(i)*.5)*Math.sin(p.getZ(i)*.45);cols.push(.35*n,.27*n,.10*n);}g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));m.receiveShadow=true;wheat.add(m);}
const stalkGeo=(()=>{const st=new THREE.CylinderGeometry(.0022,.0034,1,4,5);st.translate(0,.5,0);const n1=st.attributes.position.count,c1=[];for(let i=0;i<n1;i++)c1.push(.62,.5,.17);st.setAttribute('color',new THREE.Float32BufferAttribute(c1,3));
  const hd=new THREE.SphereGeometry(1,6,5);hd.scale(.008,.032,.008);hd.translate(0,.985,0);const n2=hd.attributes.position.count,c2=[];for(let i=0;i<n2;i++)c2.push(.95,.74,.22);hd.setAttribute('color',new THREE.Float32BufferAttribute(c2,3));
  const awn=new THREE.CylinderGeometry(.0006,.0016,.07,3);awn.translate(0,1.06,0);const n3=awn.attributes.position.count,c3=[];for(let i=0;i<n3;i++)c3.push(.9,.78,.35);awn.setAttribute('color',new THREE.Float32BufferAttribute(c3,3));
  return mergeGeometries([st,hd,awn]);})();
const NW=Number(Q.get('wn')||26000);
const wheatMesh=new THREE.InstancedMesh(stalkGeo,dryable(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85}),{wind:true,windAmp:.22}),NW);wheatMesh.frustumCulled=false;wheat.add(wheatMesh);
{const m4=new THREE.Matrix4(),q=new THREE.Quaternion();for(let i=0;i<NW;i++){const x=(rng(i*5+1)-.5)*8.5,z=-10+rng(i*5+2)*14.5;q.setFromAxisAngle(V3(0,1,0),rng(i*5+3)*6.28);const h=.72+.3*rng(i*5+4);m4.compose(V3(x,0,z),q,V3(1,h,1));wheatMesh.setMatrixAt(i,m4);}wheatMesh.instanceMatrix.needsUpdate=true;}
[[-25,-60,22,8],[20,-70,34,10]].forEach(([x,z,rx,ry])=>{const h=new THREE.Mesh(new THREE.SphereGeometry(1,20,10),new THREE.MeshStandardMaterial({color:0x9a8a4a,roughness:1}));h.scale.set(rx,ry,rx*.6);h.position.set(x,-ry*.3,z);wheat.add(h);});
