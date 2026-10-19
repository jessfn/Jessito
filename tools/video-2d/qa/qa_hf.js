// QA of the HyperFrames text layer: overlaps, overflow, safe zone. usage: node qa_hf.js <projdir>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const dir=require('path').resolve(process.argv[2]);const http=require('http'),fs=require('fs'),path=require('path');
const types={html:'text/html',js:'text/javascript',woff2:'font/woff2',mp4:'video/mp4',wav:'audio/wav',ttf:'font/ttf',json:'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(dir,decodeURIComponent(q.url.split('?')[0])==='/'?'index.html':decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':types[f.split('.').pop()]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8999,async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.route('**/gsap.min.js',r=>r.fulfill({path:'/tmp/gsap.min.js'}));
 await p.addInitScript(()=>{window.__timelines={};});p.on('pageerror',e=>console.log('pageerror',e.message.slice(0,200)));
 await p.goto('http://localhost:8999/');await p.waitForTimeout(1500);
 const total=await p.evaluate(()=>window.__timelines.main.duration());
 const issues=[];
 for(let t=0.1;t<total;t+=0.1){
  const r=await p.evaluate((t)=>{window.__timelines.main.time(t,false);const out=[];const vis=e=>{let o=1,n=e;while(n&&n!==document.body){const cs=getComputedStyle(n);o*=parseFloat(cs.opacity);if(cs.display==='none')return 0;n=n.parentElement;}return o;};
   const items=[];for(const el of document.querySelectorAll('.b,.tx,.ch')){if(el.classList.contains('ch'))continue;const o=vis(el);if(o<.5)continue;const r=el.getBoundingClientRect();if(r.width<2)continue;const grp=el.closest('.chunk')?'sub:'+el.closest('.chunk').id:'tx:'+(el.closest('.row')||el).id;const fs=parseFloat(getComputedStyle(el).fontSize),cy=(r.top+r.bottom)/2;items.push({g:grp,t:(el.textContent||'').slice(0,28),l:r.left,r:r.right,tp:cy-fs*.5,b:cy+fs*.5,bg:getComputedStyle(el).backgroundColor!=='rgba(0, 0, 0, 0)'});}
   return items;},t);
  const subs=r.filter(x=>x.g.startsWith('sub:')).sort((a,b)=>a.l-b.l);
  for(let i=1;i<subs.length;i++){const gap=subs[i].l-subs[i-1].r;if(gap<14)issues.push([t.toFixed(1),'SUB-GAP',gap.toFixed(0),subs[i-1].t,'|',subs[i].t]);}
  for(const s of subs){if(s.l<60||s.r>1020)issues.push([t.toFixed(1),'SUB-EDGE',s.t,s.l.toFixed(0),s.r.toFixed(0)]);if(s.b>1440)issues.push([t.toFixed(1),'SUB-LOW',s.t,s.b.toFixed(0)]);}
  const tx=r.filter(x=>x.g.startsWith('tx:'));
  for(const s of tx){if(s.l<40||s.r>1040)issues.push([t.toFixed(1),'TX-EDGE',s.t,s.l.toFixed(0),s.r.toFixed(0)]);}
  const all=[...tx,...subs.length?[{g:'subs',t:'SUBS',l:Math.min(...subs.map(x=>x.l)),r:Math.max(...subs.map(x=>x.r)),tp:Math.min(...subs.map(x=>x.tp)),b:Math.max(...subs.map(x=>x.b))}]:[]];
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const A=all[i],B=all[j];const ox=Math.min(A.r,B.r)-Math.max(A.l,B.l),oy=Math.min(A.b,B.b)-Math.max(A.tp,B.tp);if(ox>4&&oy>4)issues.push([t.toFixed(1),'OVERLAP',A.t,'<>',B.t]);}
 }
 // dedupe consecutive
 const seen=new Set();const out=[];for(const i of issues){const k=i.slice(1).join('|');if(seen.has(k))continue;seen.add(k);out.push(i.join(' '));}
 console.log(out.length?out.join('\n'):'HF QA OK');
 await b.close();srv.close();});
