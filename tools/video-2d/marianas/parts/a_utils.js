// ===================== utils =====================
const W=1080,H=1920;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,x)=>a+(b-a)*x;
const eo=x=>1-Math.pow(1-clamp(x),3),ei=x=>{x=clamp(x);return x*x*x},eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const ss=(a,b,x)=>{x=clamp((x-a)/(b-a));return x*x*(3-2*x)};
const eb=x=>{x=clamp(x);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const eob=(x,s=1.2)=>{x=clamp(x);const c3=s+1;return 1+c3*Math.pow(x-1,3)+s*Math.pow(x-1,2)};
const rng=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const noise1=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(rng(i),rng(i+1),u)*2-1;};
const fbm1=(x,o=3)=>{let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*noise1(x*f+i*17.3);a*=.5;f*=2.03;}return s;};
const hex=h=>{if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];};
const mixc=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const rgb=(c,a=1)=>`rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const shade=(c,k)=>k>=0?mixc(c,[255,255,255],k):mixc(c,[0,0,0],-k);
const col=h=>typeof h==='string'?hex(h):h;
function lin(g,x0,y0,x1,y1,stops){const gr=g.createLinearGradient(x0,y0,x1,y1);for(const [o,c,a] of stops)gr.addColorStop(o,(typeof c==="string"&&c[0]==="r")?c:rgb(col(c),a===undefined?1:a));return gr;}
function rad(g,x,y,r0,r1,stops,x1,y1){const gr=g.createRadialGradient(x,y,r0,x1===undefined?x:x1,y1===undefined?y:y1,r1);for(const [o,c,a] of stops)gr.addColorStop(o,(typeof c==="string"&&c[0]==="r")?c:rgb(col(c),a===undefined?1:a));return gr;}
function offscreen(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function blob(g,cx,cy,rx,ry,wob=.12,seed=0,n=14){g.beginPath();for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,k=1+wob*(rng(seed*31+i%n)*2-1);const x=cx+Math.cos(a)*rx*k,y=cy+Math.sin(a)*ry*k;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();}
function smoothBlob(g,cx,cy,rx,ry,wob,seed,n=10){const pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=1+wob*(rng(seed*31+i)*2-1);pts.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}
  g.beginPath();for(let i=0;i<n;i++){const p0=pts[(i+n-1)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
   if(i===0)g.moveTo(p1[0],p1[1]);g.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}g.closePath();}
function rrect(g,x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r);}
function limb(g,x0,y0,x1,y1,r0,r1,base,{hi=.22,lo=.28}={}){
  const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,m=Math.max(r0,r1);
  const mx=(x0+x1)/2,my=(y0+y1)/2;
  g.save();g.fillStyle=lin(g,mx-nx*m,my-ny*m,mx+nx*m,my+ny*m,[[0,shade(col(base),hi)],[.55,base],[1,shade(col(base),-lo)]]);
  g.beginPath();g.moveTo(x0+nx*r0,y0+ny*r0);g.lineTo(x1+nx*r1,y1+ny*r1);g.lineTo(x1-nx*r1,y1-ny*r1);g.lineTo(x0-nx*r0,y0-ny*r0);g.closePath();g.fill();
  g.beginPath();g.arc(x0,y0,r0,0,Math.PI*2);g.fill();g.beginPath();g.arc(x1,y1,r1,0,Math.PI*2);g.fill();g.restore();}
