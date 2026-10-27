const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file:///home/user/Jessito/video/anim.html');fs.mkdirSync('frames',{recursive:true});
const only=process.argv[2];const fr=only?[+only]:[...Array(720).keys()];
for(const f of fr){await p.evaluate(f=>window.frame(f),f);await p.screenshot({path:only?`test${f}.png`:`frames/f${String(f).padStart(4,'0')}.png`});}
await b.close()})();
