// ===================== S3: supermarket aisle (one-point perspective) =====================
const VPX=540,VPY=840,FOC=900;
function PJ(X,Y,Z){return [VPX+X*FOC/Z,VPY+Y*FOC/Z];}
function quad(g,a,b,c,d){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(c[0],c[1]);g.lineTo(d[0],d[1]);g.closePath();}
const MPROD=[],MFRU=[];
(function(){const pal=['#e8463c','#f2a93b','#3b8fd9','#4cae5e','#f3e0b0','#8e5bc0','#e4e4e4','#d9384a'];
  for(const sd of [-1,1])for(let k=0;k<13;k++)for(let b=0;b<4;b++)for(let p=0;p<2;p++){const i=(sd+2)*1000+k*40+b*9+p;MPROD.push({sd,z:2.4+k*1.05+p*.5,y:1.5-.35-b*.42,w:.3+.1*rng(i),h:.22+.12*rng(i+3),c:pal[Math.floor(rng(i+7)*pal.length)],gone:rng(i+11)<.5,tv:0,i});}
  for(let c=0;c<6;c++)for(let i=0;i<5;i++)for(let j=0;j<4;j++){MFRU.push({x:-1.45+i*.13,y:1.5-.95-.06,z:3.5+c*.72+j*.14,c:['#d9301f','#f08a1a','#6cb82e','#f3d21c','#c3201a','#8fc23a'][c],tv:0,idx:c*20+i*4+j});}})();
function initMarket(){MPROD.forEach(p=>p.tv=ST[3]+.5+rng(p.i+13)*3.3);MFRU.forEach(f=>{f.tv=ST[3]+.3+rng(f.idx*7+3)*3.2;});MFRU.forEach((f,i)=>{if(i%9===0){const [x,y]=PJ(f.x,f.y,f.z-0);poof(f.tv,x,y,6,'#ff9a60',.5);}});}
function drawMarket(g,t,camZ){
  const Zs=z=>z-camZ;const S=(X,Y,Z)=>PJ(X,Y,Zs(Z));
  g.fillStyle=lin(g,0,0,0,H,[[0,'#dfe6ea'],[1,'#c9d2d8']]);g.fillRect(0,0,W,H);
  // ceiling
  g.fillStyle=lin(g,0,0,0,VPY,[[0,'#eef2f4'],[1,'#d5dde3']]);quad(g,S(-3.2,-1.9,1.01+camZ),S(3.2,-1.9,1.01+camZ),S(3.2,-1.9,17),S(-3.2,-1.9,17));g.fill();
  // back wall
  g.fillStyle='#d6e6dc';quad(g,S(-3.2,-1.9,17),S(3.2,-1.9,17),S(3.2,1.5,17),S(-3.2,1.5,17));g.fill();
  // floor
  const fz0=1.05+camZ;g.fillStyle=lin(g,0,VPY,0,H,[[0,'#e7e0d2'],[1,'#b9ae98']]);quad(g,S(-3.2,1.5,fz0),S(3.2,1.5,fz0),S(3.2,1.5,17),S(-3.2,1.5,17));g.fill();
  for(let ix=-5;ix<5;ix++)for(let iz=0;iz<26;iz++){if((ix+iz)&1)continue;const z0=Math.max(fz0,1+iz*.7+0),z1=1+(iz+1)*.7;if(z1<=fz0+.01)continue;g.fillStyle='rgba(0,0,0,.05)';quad(g,S(ix*.64,1.5,Math.max(z0,fz0)),S(ix*.64+.64,1.5,Math.max(z0,fz0)),S(ix*.64+.64,1.5,z1),S(ix*.64,1.5,z1));g.fill();}
  // floor shine
  g.save();g.globalCompositeOperation='screen';for(const sx of [-1.0,.0,1.0]){g.fillStyle=lin(g,0,VPY,0,H,[[0,'rgba(255,255,255,.0)'],[.4,'rgba(255,255,255,.16)'],[1,'rgba(255,255,255,.05)']]);quad(g,S(sx-.25,1.5,fz0),S(sx+.25,1.5,fz0),S(sx+.12,1.5,17),S(sx-.12,1.5,17));g.fill();}g.restore();
  // side walls
  for(const sd of [-1,1]){g.fillStyle=sd<0?'#d7dfe4':'#cdd7de';quad(g,S(sd*3.2,-1.9,fz0),S(sd*3.2,-1.9,17),S(sd*3.2,1.5,17),S(sd*3.2,1.5,fz0));g.fill();}
  // shelf units
  for(const sd of [-1,1]){
    g.fillStyle=lin(g,0,0,0,H,[[0,'#8fa4b8'],[1,'#6d8196']]);quad(g,S(sd*1.62,-.55,fz0),S(sd*1.62,-.55,17),S(sd*1.62,1.5,17),S(sd*1.62,1.5,fz0));g.fill();
    for(let b=0;b<5;b++){const y=1.5-.12-b*.42;g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=4;const a=S(sd*1.62,y,fz0),c=S(sd*1.62,y,17);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(c[0],c[1]);g.stroke();}
    // top header band
    g.fillStyle=sd<0?'#2f9a52':'#e8963a';quad(g,S(sd*1.62,-.55,fz0),S(sd*1.62,-.55,17),S(sd*1.62,-.8,17),S(sd*1.62,-.8,fz0));g.fill();}
  // products
  for(const p of MPROD){const a=p.gone?1-ss(p.tv,p.tv+.22,t):1;if(a<=.01)continue;const z=p.z,zz=z-camZ;if(zz<1.08)continue;const X=p.sd*1.62,h=p.h*a,w=p.w*a;
    const A=S(X,p.y,z),B=S(X,p.y,z+w),C=S(X,p.y-h,z+w),D=S(X,p.y-h,z);
    g.fillStyle=p.c;quad(g,A,B,C,D);g.fill();g.fillStyle='rgba(255,255,255,.28)';quad(g,D,C,[C[0],C[1]+(A[1]-D[1])*.25],[D[0],D[1]+(A[1]-D[1])*.25]);g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.5;quad(g,A,B,C,D);g.stroke();}
  // ceiling lights
  g.save();for(let z=2;z<=16;z+=2){for(const sx of [-.7,.7]){const zz=z-camZ;if(zz<1.1)continue;const a=S(sx-.35,-1.9,z),b=S(sx+.35,-1.9,z),c=S(sx+.35,-1.9,z+.5),d=S(sx-.35,-1.9,z+.5);g.fillStyle='#fffdf2';quad(g,a,b,c,d);g.fill();g.globalCompositeOperation='screen';const m=S(sx,-1.9,z+.25);g.fillStyle=rad(g,m[0],m[1],0,260/(zz*.45),[[0,'#fff7d6',.5],[1,'#fff7d6',0]]);g.fillRect(m[0]-300,m[1]-100,600,520);g.globalCompositeOperation='source-over';}}g.restore();
  // produce crates
  for(let c=0;c<6;c++){const z=3.5+c*.72,zz=z-camZ;if(zz<1.1)continue;const x0=-1.58,x1=-.78;const A=S(x0,1.5,z),B=S(x1,1.5,z),C=S(x1,1.5-.55,z),D=S(x0,1.5-.55,z);
    g.fillStyle=lin(g,0,D[1],0,A[1],[[0,'#c99a62'],[1,'#8a5e30']]);quad(g,A,B,C,D);g.fill();g.fillStyle='rgba(0,0,0,.15)';quad(g,S(x0,1.5-.3,z),S(x1,1.5-.3,z),S(x1,1.5-.26,z),S(x0,1.5-.26,z));g.fill();
    g.fillStyle='#e0b97c';quad(g,D,C,S(x1,1.5-.55,z+.7),S(x0,1.5-.55,z+.7));g.fill();}
  for(const f of MFRU){const k=1-ss(f.tv,f.tv+.2,t);if(k<=.01)continue;const zz=f.z-camZ;if(zz<1.1)continue;const p=S(f.x,f.y-.02,f.z),r=.052*FOC/zz*k;g.fillStyle=rad(g,p[0]-r*.3,p[1]-r*.3,r*.1,r*1.2,[[0,shade(col(f.c),.35)],[.6,f.c],[1,shade(col(f.c),-.35)]]);g.beginPath();g.arc(p[0],p[1],r,0,7);g.fill();}
  // sign
  const sg=S(0,-1.35,5.2);const sw=1.9*FOC/Zs(5.2);g.save();g.translate(sg[0],sg[1]);g.fillStyle='#1f7a3c';rrect(g,-sw/2,-sw*.13,sw,sw*.26,16);g.fill();g.strokeStyle='#fff';g.lineWidth=4;g.stroke();
  g.fillStyle='#fff';g.font=`900 ${sw*.095}px Inter, Arial, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('FRUTAS Y VERDURAS',0,2);g.restore();
  // soft atmospheric depth toward the far end
  g.fillStyle=lin(g,0,VPY-260,0,VPY+260,[[0,'rgba(240,246,250,0)'],[.5,'rgba(240,246,250,.5)'],[1,'rgba(240,246,250,0)']]);g.fillRect(0,VPY-260,W,520);
}
