import * as THREE from 'three';
// ---- SDF primitives
const len3=(x,y,z)=>Math.sqrt(x*x+y*y+z*z);
export const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25};
export function sdRoundCone(px,py,pz,a,b,r1,r2){// iq round cone between a and b
 const bax=b[0]-a[0],bay=b[1]-a[1],baz=b[2]-a[2];const l2=bax*bax+bay*bay+baz*baz;const rr=r1-r2;const a2=l2-rr*rr;const il2=1/l2;
 const pax=px-a[0],pay=py-a[1],paz=pz-a[2];const y=pax*bax+pay*bay+paz*baz;const z=y-l2;const x2=(pax*l2-bax*y)**2+(pay*l2-bay*y)**2+(paz*l2-baz*y)**2;const y2=y*y*l2,z2=z*z*l2;
 const k=Math.sign(rr)*rr*rr*x2;if(Math.sign(z)*a2*z2>k)return Math.sqrt(x2+z2)*il2-r2;if(Math.sign(y)*a2*y2<k)return Math.sqrt(x2+y2)*il2-r1;return (Math.sqrt(x2*a2*il2)+y*rr)*il2-r1}
export const sdSphere=(px,py,pz,c,r)=>len3(px-c[0],py-c[1],pz-c[2])-r;
export function sdBox(px,py,pz,c,h,r=0){const qx=Math.abs(px-c[0])-h[0]+r,qy=Math.abs(py-c[1])-h[1]+r,qz=Math.abs(pz-c[2])-h[2]+r;return len3(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-r}
export function sdTorusY(px,py,pz,c,R,r){const x=px-c[0],y=py-c[1],z=pz-c[2];const q=Math.sqrt(x*x+z*z)-R;return Math.sqrt(q*q+y*y)-r}
// ---- surface nets
export function surfaceNets(sdf,bounds,h){const [x0,y0,z0,x1,y1,z1]=bounds;const nx=Math.ceil((x1-x0)/h)+1,ny=Math.ceil((y1-y0)/h)+1,nz=Math.ceil((z1-z0)/h)+1;const F=new Float32Array(nx*ny*nz);
 for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)F[i+nx*(j+ny*k)]=sdf(x0+i*h,y0+j*h,z0+k*h);
 const cx=nx-1,cy=ny-1,cz=nz-1;const vm=new Int32Array(cx*cy*cz).fill(-1);const pos=[];
 const E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];const C=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
 for(let k=0;k<cz;k++)for(let j=0;j<cy;j++)for(let i=0;i<cx;i++){const v=[];let m=0;for(let c=0;c<8;c++){const f=F[(i+C[c][0])+nx*((j+C[c][1])+ny*(k+C[c][2]))];v.push(f);if(f<0)m|=1<<c}if(m===0||m===255)continue;
  let sx=0,sy=0,sz=0,n=0;for(const [a,b] of E){const fa=v[a],fb=v[b];if((fa<0)!==(fb<0)){const t=fa/(fa-fb);sx+=C[a][0]+t*(C[b][0]-C[a][0]);sy+=C[a][1]+t*(C[b][1]-C[a][1]);sz+=C[a][2]+t*(C[b][2]-C[a][2]);n++}}
  vm[i+cx*(j+cy*k)]=pos.length/3;pos.push(x0+(i+sx/n)*h,y0+(j+sy/n)*h,z0+(k+sz/n)*h)}
 const idx=[];const V=(i,j,k)=>vm[i+cx*(j+cy*k)];const quad=(a,b,c,d)=>{if(a<0||b<0||c<0||d<0)return;idx.push(a,b,c,a,c,d)};
 for(let k=1;k<cz;k++)for(let j=1;j<cy;j++)for(let i=1;i<cx;i++){const f0=F[i+nx*(j+ny*k)];
  const fx=F[(i+1)+nx*(j+ny*k)],fy=F[i+nx*((j+1)+ny*k)],fz=F[i+nx*(j+ny*(k+1))];
  if((f0<0)!==(fx<0)){const q=[V(i,j-1,k-1),V(i,j,k-1),V(i,j,k),V(i,j-1,k)];f0<0?quad(q[0],q[1],q[2],q[3]):quad(q[3],q[2],q[1],q[0])}
  if((f0<0)!==(fy<0)){const q=[V(i-1,j,k-1),V(i,j,k-1),V(i,j,k),V(i-1,j,k)];f0<0?quad(q[3],q[2],q[1],q[0]):quad(q[0],q[1],q[2],q[3])}
  if((f0<0)!==(fz<0)){const q=[V(i-1,j-1,k),V(i,j-1,k),V(i,j,k),V(i-1,j,k)];f0<0?quad(q[0],q[1],q[2],q[3]):quad(q[3],q[2],q[1],q[0])}}
 // normals from sdf gradient, fix winding
 const P=new Float32Array(pos),N=new Float32Array(pos.length);const e=h*.6;
 for(let i=0;i<P.length;i+=3){const x=P[i],y=P[i+1],z=P[i+2];let nxv=sdf(x+e,y,z)-sdf(x-e,y,z),nyv=sdf(x,y+e,z)-sdf(x,y-e,z),nzv=sdf(x,y,z+e)-sdf(x,y,z-e);const l=Math.hypot(nxv,nyv,nzv)||1;N[i]=nxv/l;N[i+1]=nyv/l;N[i+2]=nzv/l}
 for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];const nx_=uy*vz-uz*vy,ny_=uz*vx-ux*vz,nz_=ux*vy-uy*vx;if(nx_*N[a]+ny_*N[a+1]+nz_*N[a+2]<0){const tmp=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=tmp}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setIndex(idx);return g}
