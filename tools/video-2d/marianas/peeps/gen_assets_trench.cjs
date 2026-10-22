const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const fs=require('fs');
const {Effigy,Faces}=require('./cjs/index.js');
const bodyOpts={topColor:'#e8742c',jacketColor:'#363a58',skinColor:'#C98B62',cupColor:'#e9a23a',paperColor:'#fffdf2'};const bodyOpts2={...bodyOpts,topColor:'#e8742c'};
const faceList=['Calm','Explaining','Concerned','ConcernedFear','Fear','Hectic','Awe','BigSmile','Smile','SmileTeeth','SmileLOL','EyesClosed','Suspicious','Serious','Tired','Contempt','Driven','Cheeky','Solemn','Rage','Angry','EatingHappy','Cute','Blank','Old'];
function render(body,head,face,o){
 return renderToStaticMarkup(React.createElement(Effigy,{body:{type:body,options:o||bodyOpts},head:{type:head,options:{}},face:{type:face,options:{}}})).replace(/ style=""/,'');
}
const base=render('ButtonShirt','MediumOne','Calm',bodyOpts2);
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
for(const b of []){const p=split(render(b,'MediumOne','Calm'));out.bodies[b]=wrapB(p.body);}{const p=split(render('ButtonShirt','MediumOne','Calm',bodyOpts2));out.bodies.ButtonShirt=wrapB(p.body);}{const bw={...bodyOpts,jacketColor:'#f4f6fa',topColor:'#7fc8d8'};const p=split(render('ButtonShirt','MediumOne','Calm',{...bodyOpts,topColor:'#f4f6fa'}));out.bodies.JacketW=wrapB(p.body);}
{const p=split(base);out.hair.ShortOne=wrapH(p.iHeadTag,p.hair);}
for(const f of faceList){const p=split(render('ButtonShirt','MediumOne',f,bodyOpts2));out.faces[f]=wrapH(p.iHeadTag,p.face);}
out.portrait=render('Dress','Bun','Calm',{topColor:'#1f4a8a',jacketColor:'#1f4a8a',skinColor:'#E0A880',dressColor:'#1f4a8a'});

const {StandingBodies}=require('./cjs/index.js');
out.poses={};
const SK='#C98B62',SH='#f2f2f2',TOP='#ff6a4d';
const poseDefs={walk:['WalkingColorTee',{topColor:TOP}],cross:['CrossArmColorTee',{topColor:TOP}],ease:['EasingColorTee',{topColor:TOP,jacketColor:'#1d9bb8'}],point:['PointingFingerColorTee',{topColor:TOP}],rest:['RestingColorPants',{topColor:TOP}],dance:['Dancer',{topColor:TOP,pantsColor:'#15233b'}],shirt:['ShirtColorTee',{topColor:TOP}]};
for(const k in poseDefs){const [n,o]=poseDefs[k];const C=require('./cjs/body/standing/'+n).default;const cfg=StandingBodies[n];
 out.poses[k]={w:cfg.width,h:cfg.height,svg:renderToStaticMarkup(React.createElement('svg',{xmlns:'http://www.w3.org/2000/svg',width:cfg.width,height:cfg.height,viewBox:cfg.viewBox},React.createElement(C,{skinColor:SK,shoesColor:SH,outlineColor:'#120d22',...o})))};}
fs.writeFileSync('../b2m/assets_peeps.js','window.PEEP='+JSON.stringify(out)+';');
console.log(vb,Object.keys(out.faces).length,fs.statSync('../b2m/assets_peeps.js').size);
if(0)fs.writeFileSync('layer_test.html','<body style="margin:0;background:#cde;display:flex">'+out.bodies.Hoodie+out.hair.Bald.replace('<svg','<svg style="margin-left:-940px"')+out.faces.Fear.replace('<svg','<svg style="margin-left:-940px"'));
