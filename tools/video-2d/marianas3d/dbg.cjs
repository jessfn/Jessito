const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const srv=await require('./srv.js')(8982,__dirname);const b=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--use-gl=angle','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('err',e.message.slice(0,500)));
await p.goto('http://localhost:8982/scene.html?s=1');await p.waitForFunction('window.ready',null,{timeout:240000});
const t=Number(process.argv[2]);const out=await p.evaluate(t=>{frame(t);const B=RT.bones;const w=n=>{const v=B[n].getWorldPosition(new (B[n].position.constructor)());return [Math.round(v.x),Math.round(v.y),Math.round(v.z)]};
 const d=dofAt3(t);return {hips:w('Hips'),upL:w('LeftUpLeg'),kneeL:w('LeftLeg'),footL:w('LeftFoot'),upR:w('RightUpLeg'),kneeR:w('RightLeg'),footR:w('RightFoot'),sh:w('LeftArm'),fall:d.fall,lfloat:d.lL_float,ltuck:d.lL_tuck,lfy:d.lL_fy,lkick:d.lL_kick}},t);
console.log(JSON.stringify(out));await b.close();srv.close();})();
