const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const fs=require('fs');
const {Effigy,Faces}=require('./cjs/index.js');
const bodyOpts={topColor:'#34408f',jacketColor:'#34408f',skinColor:'#C98B62',cupColor:'#f2f0e6',paperColor:'#fffdf2'};const bodyOpts2={...bodyOpts,topColor:'#8c93a8'};
const faceList=['Calm','Explaining','Concerned','ConcernedFear','Fear','Hectic','Awe','BigSmile','Smile','SmileTeeth','SmileLOL','EyesClosed','Suspicious','Serious','Tired','Contempt','Driven','Cheeky','Solemn','Rage','Angry','EatingHappy','Cute','Blank','Old'];
function render(body,head,face,o){
 return renderToStaticMarkup(React.createElement(Effigy,{body:{type:body,options:o||bodyOpts},head:{type:head,options:{}},face:{type:face,options:{}}})).replace(/ style=""/,'');
}
const base=render('ButtonShirt','Pomp','Calm');
const head=base.match(/^<svg[^>]*>/)[0];
const vb=head.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
const open=head.replace(/ width="[^"]*"| height="[^"]*"/g,'').replace('<svg','<svg width="'+Math.round(vb[2])+'" height="'+Math.round(vb[3])+'"');
const out={vb,bodies:{},hair:{},faces:{}};
function split(s){
 const iH=s.indexOf('<g id="Head"');const iB=s.indexOf('<g id="Body"');
 const iHair=s.indexOf('<g id="Hair"'),iFace=s.indexOf('<g id="Face"'),iBeard=s.indexOf('<g id="Beard"');
 const bodyPart=s.slice(iB,s.lastIndexOf('<g',iH>iB?iH:iB)>0?iH:iH);
 return {body:s.slice(iB,iH),hair:s.slice(iHair,iFace),face:s.slice(iFace,iBeard),iHeadTag:s.slice(iH,iHair)};
}
const wrapB=p=>open+'<g id="Bust">'+p+'</g></svg>';
const wrapH=(tag,p)=>open+'<g id="Bust">'+tag+p+'</g></g></svg>';
for(const b of ['ButtonShirt','Coffee']){const p=split(render(b,'Pomp','Calm'));out.bodies[b]=wrapB(p.body);}{const p=split(render('Hoodie','Pomp','Calm',bodyOpts2));out.bodies.Hoodie=wrapB(p.body);}
{const p=split(base);out.hair.Pomp=wrapH(p.iHeadTag,p.hair);}
for(const f of faceList){const p=split(render('ButtonShirt','Pomp',f));out.faces[f]=wrapH(p.iHeadTag,p.face);}
fs.writeFileSync('../b2s/assets_peeps.js','window.PEEP='+JSON.stringify(out)+';');
console.log(vb,Object.keys(out.faces).length,fs.statSync('../b2s/assets_peeps.js').size);
if(0)fs.writeFileSync('layer_test.html','<body style="margin:0;background:#cde;display:flex">'+out.bodies.Hoodie+out.hair.Bald.replace('<svg','<svg style="margin-left:-940px"')+out.faces.Fear.replace('<svg','<svg style="margin-left:-940px"'));
