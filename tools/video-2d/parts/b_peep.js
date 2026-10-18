// ===================== character: Open Peeps layers + beekeeper hat/veil =====================
const PIMG={body:{},hair:{},face:{}};
function svgImg(s){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);});}
async function loadPeeps(){const jobs=[];for(const k in PEEP.bodies)jobs.push(svgImg(PEEP.bodies[k]).then(i=>PIMG.body[k]=i));
  for(const k in PEEP.hair)jobs.push(svgImg(PEEP.hair[k]).then(i=>PIMG.hair[k]=i));for(const k in PEEP.faces)jobs.push(svgImg(PEEP.faces[k]).then(i=>PIMG.face[k]=i));await Promise.all(jobs);}
const LW=940,LH=1131,PIV=[470,1131],NECK=[450,505];
// emotion -> [closed mouth face, open mouth face]
const FACE={calm:['Calm','Explaining'],curious:['Suspicious','Concerned'],shock:['Awe','ConcernedFear'],fear:['Fear','ConcernedFear'],hectic:['Hectic','Fear'],
 strain:['Tired','Hectic'],resign:['Solemn','Tired'],happy:['Smile','SmileTeeth'],wink:['Cheeky','SmileLOL'],confident:['Driven','SmileTeeth'],laugh:['SmileLOL','BigSmile'],blank:['Blank','Calm']};

function beeHat(g,veilAlpha=1){
  g.save();g.lineJoin='round';g.lineCap='round';
  // veil (behind the brim front but over the face)
  const vp=()=>{g.beginPath();g.moveTo(196,150);g.bezierCurveTo(176,320,176,470,214,560);g.quadraticCurveTo(450,604,700,556);g.bezierCurveTo(736,470,730,320,712,150);g.closePath();};
  g.save();vp();g.fillStyle=`rgba(235,244,250,${.10*veilAlpha})`;g.fill();g.clip();
  g.strokeStyle=`rgba(40,50,60,${.2*veilAlpha})`;g.lineWidth=1.8;for(let x=160;x<760;x+=17){g.beginPath();g.moveTo(x,140);g.lineTo(x+(x-455)*.12,610);g.stroke();}for(let y=150;y<620;y+=17){g.beginPath();g.moveTo(150,y);g.lineTo(770,y);g.stroke();}
  g.restore();
  g.save();vp();g.strokeStyle='#000';g.lineWidth=7;g.globalAlpha=.78*veilAlpha;g.stroke();g.restore();
  // hem + elastic band
  g.fillStyle='#e3dcc6';g.strokeStyle='#000';g.lineWidth=9;g.beginPath();g.moveTo(206,545);g.quadraticCurveTo(450,596,708,546);g.lineTo(704,576);g.quadraticCurveTo(450,626,212,578);g.closePath();g.fill();g.stroke();
  // crown (dome)
  g.beginPath();g.moveTo(292,150);g.bezierCurveTo(286,40,372,-12,456,-14);g.bezierCurveTo(548,-12,624,44,620,150);g.closePath();
  g.fillStyle=lin(g,290,0,620,0,[[0,'#fbf6e8'],[.55,'#f0e7cd'],[1,'#d4c8a6']]);g.fill();g.lineWidth=11;g.strokeStyle='#000';g.stroke();
  // band
  g.fillStyle='#f2b629';g.beginPath();g.moveTo(290,128);g.quadraticCurveTo(456,168,622,128);g.lineTo(620,156);g.quadraticCurveTo(456,198,292,158);g.closePath();g.fill();g.lineWidth=8;g.stroke();
  // brim
  g.beginPath();g.ellipse(456,168,300,52,-.02,0,Math.PI*2);g.fillStyle=lin(g,150,150,760,190,[[0,'#fffaf0'],[.5,'#f1e8cf'],[1,'#cdbf98']]);g.fill();g.lineWidth=11;g.stroke();
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=4;g.beginPath();g.ellipse(456,172,250,38,-.02,.15,Math.PI-.15);g.stroke();
  // highlight streak
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=9;g.beginPath();g.moveTo(340,60);g.quadraticCurveTo(372,26,430,16);g.stroke();
  g.restore();}
// st: {body,face,hat,tilt,hx,hy,lean,sq,bx,by,veil}
function drawPeep(g,x,y,s,st){
  const B=PIMG.body[st.body||'ButtonShirt'],Hh=PIMG.hair.Bald,F=PIMG.face[st.face||'Calm'];
  g.save();g.translate(x+(st.bx||0),y+(st.by||0));g.rotate(st.lean||0);g.scale(s*(1+(st.sq||0)*-.5),s*(1+(st.sq||0)));g.translate(-PIV[0],-PIV[1]);
  g.drawImage(B,0,0,LW,LH);
  g.save();g.translate(NECK[0]+(st.hx||0),NECK[1]+(st.hy||0));g.rotate(st.tilt||0);g.translate(-NECK[0],-NECK[1]);
  g.drawImage(Hh,0,0,LW,LH);g.drawImage(F,0,0,LW,LH);
  if(st.hat!==false)beeHat(g,st.veil===undefined?1:st.veil);
  g.restore();g.restore();}
// emotion timeline -> face / head motion
function emoAt(t,KFE){let i=0;while(i<KFE.length-1&&t>=KFE[i+1][0])i++;return KFE[i][1];}
let TALK=[];function initTalk(){TALK=[];for(let si=0;si<SEGS.length;si++)for(const w of SEGS[si].words)TALK.push([ST[si]+w[1],ST[si]+w[2]]);}
function talkAmt(t){for(const [a,b] of TALK){if(t>=a-.03&&t<=b+.05){return Math.sin(Math.PI*clamp((t-a)/(b-a)))}}return 0;}
function faceFor(t,emo){const pair=FACE[emo]||FACE.calm;const ta=talkAmt(t);
  const open=ta>.28&&Math.sin(t*26+ta*3)>-.15;
  const ph=t%3.6,blink=ph<.14&&!open&&(emo==='calm'||emo==='curious'||emo==='happy'||emo==='confident');
  if(blink)return 'EyesClosed';return open?pair[1]:pair[0];}
