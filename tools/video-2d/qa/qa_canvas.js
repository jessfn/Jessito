// QA of canvas text: text that overflows the rectangle it sits in, or the safe margins. usage: node qa_canvas.js <dir> <step>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const dir=require('path').resolve(process.argv[2]);const step=parseFloat(process.argv[3]||'0.25');
(async()=>{const srv=await require(dir+'/srv.js')(8996,dir);const b=await chromium.launch({args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('pageerror',e.message.slice(0,200)));
await p.addInitScript(()=>{window.__R=[];window.__T=[];const P=CanvasRenderingContext2D.prototype;
 const box=(ctx,x,y,w,h)=>{const m=ctx.getTransform();const pts=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>[m.a*a+m.c*b+m.e,m.b*a+m.d*b+m.f]);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)};};
 for(const n of ['roundRect','rect','fillRect','strokeRect']){const o=P[n];P[n]=function(x,y,w,h){if(Math.abs(w)>30&&Math.abs(h)>30&&Math.abs(w)<1000)window.__R.push(box(this,Math.min(x,x+w),Math.min(y,y+h),Math.abs(w),Math.abs(h)));return o.apply(this,arguments);};}
 for(const n of ['fillText','strokeText']){const o=P[n];P[n]=function(s,x,y){if(String(s).trim().length>0){const mt=this.measureText(s);let l=x-(this.textAlign==='center'?mt.width/2:this.textAlign==='right'?mt.width:0);const fs=parseFloat(this.font.match(/(\d+(?:\.\d+)?)px/)[1]);const bb=box(this,l,y-fs*.38,mt.width,fs*.76);window.__T.push({s:String(s),...bb,fs});}return o.apply(this,arguments);};}
});
await p.goto('http://localhost:8996/scene.html');await p.waitForFunction('window.ready',null,{timeout:60000});
const total=await p.evaluate(()=>TOTAL);const seen=new Set();const out=[];
for(let t=0.1;t<total;t+=step){const r=await p.evaluate((t)=>{window.__R=[];window.__T=[];frame(t);return {R:window.__R,T:window.__T};},t);
 for(const x of r.T){const cx=(x.l+x.r)/2,cy=(x.t+x.b)/2;let best=null,ba=1e12;for(const q of r.R){if(cx>q.l&&cx<q.r&&cy>q.t&&cy<q.b){const a=(q.r-q.l)*(q.b-q.t);if(a<ba&&a>(x.r-x.l)*(x.b-x.t)*1.2){ba=a;best=q;}}}
  const tol=3;if(best&&(x.l<best.l-tol||x.r>best.r+tol||x.t<best.t-tol||x.b>best.b+tol)){const k='BOX|'+x.s;if(!seen.has(k)){seen.add(k);out.push(`t=${t.toFixed(1)} TEXT-OUT-OF-BOX "${x.s}" text[${x.l|0}-${x.r|0}] box[${best.l|0}-${best.r|0}]`);}}
  if(x.l<30||x.r>1050){const k='EDGE|'+x.s;if(!seen.has(k)){seen.add(k);out.push(`t=${t.toFixed(1)} TEXT-OFF-SCREEN "${x.s}" [${x.l|0}-${x.r|0}]`);}}}}
console.log(out.length?out.join('\n'):'CANVAS QA OK');await b.close();srv.close();})();
