const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1000}});
await p.goto('http://localhost:8765/adv2.html#f=mascot');await p.waitForFunction('window.READY',null,{timeout:20000});
console.log(JSON.stringify(await p.evaluate(()=>[window.art.name,window.art.width,window.art.height,window.info])));
fs.mkdirSync('/tmp/ms',{recursive:true});let i=0;
for(const l of [[['Fly super',0,1]],[['Fly super',.8,1]],[['Fly super',1.6,1]],[['Fly super',2.4,1]],[['Fly super',3.2,1]],[['Fly super',4.2,1]],[['Timeline 2',0.3,1]],[['Timeline 2',0.7,1]]]){
 await p.evaluate(l=>new Promise(res=>window.rc.requestAnimationFrame(()=>{window.draw(l);window.rc.requestAnimationFrame(()=>res())})),l);await p.screenshot({path:`/tmp/ms/${i++}.png`})}
await b.close()})();
