const http=require('http'),fs=require('fs'),path=require('path');
const types={html:'text/html',js:'text/javascript',mjs:'text/javascript',glb:'model/gltf-binary',json:'application/json',png:'image/png'};
module.exports=(port,root)=>new Promise(res=>{const s=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(root,u==='/'?'index.html':u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':types[f.split('.').pop()]||'application/octet-stream','Access-Control-Allow-Origin':'*'});fs.createReadStream(f).pipe(r);});s.listen(port,()=>res(s));});
