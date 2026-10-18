// ===================== timeline =====================
let TLD=null;
const ST=[],ENDS=[];let TOTAL=0,SEGS=[],NS=0;
function initTimeline(d){TLD=d;ST.push(...d.starts);TOTAL=d.total;SEGS=d.segs;NS=ST.length;for(let i=0;i<NS;i++)ENDS.push(i<NS-1?ST[i+1]:TOTAL);}
const sceneAt=t=>{for(let i=0;i<NS;i++)if(t<ENDS[i])return i;return NS-1;};
const wordT=(seg,key)=>{for(const w of SEGS[seg].words)if(w[0].toLowerCase().includes(key))return ST[seg]+w[1];return ST[seg]+.5;};
let vac,wA,wM,wB,wF,wPr,wAlc,wMito,wEin,wTri,wArr,wFru,wTer,BEETV=[];
function initWords(){vac=wordT(0,'vacía');wA=wordT(2,'almendras');wM=wordT(2,'manzanas');wB=wordT(2,'arándanos');wF=wordT(3,'faltarían');wPr=wordT(3,'precios');wAlc=wordT(4,'alcanzar');wMito=wordT(5,'mito');wEin=wordT(5,'einstein');wTri=wordT(6,'trigo');wArr=wordT(6,'arroz');wFru=wordT(6,'fruta');wTer=wordT(1,'tercio');
  for(let i=0;i<190;i++)BEETV.push(vac-.6+rng(i*17+3)*1.3);
  TREE_POS.forEach((T,ti)=>T.apples.forEach((a,ai)=>a.tv=wM+.05+rng(ti*40+ai*3+2)*1.5));}
// ===================== expressions =====================
const EXP={
 calm:{mC:.5,blush:.18},curious:{eyeO:1.1,bL:.3,bR:.8,tL:-.2,tR:-.1,mC:.15,mO:.12,py:-.25},
 shock:{eyeO:1.38,bL:1,bR:1,tL:-.25,tR:-.25,mO:.95,mW:.72,mC:0,py:-.15,sweat:.25,blush:0},
 fear:{eyeO:1.2,bL:.9,bR:.9,tL:-.9,tR:-.9,mC:-.9,mO:.3,mW:1.1,sweat:1,py:.3,blush:0},
 strain:{eyeO:.6,lidT:.3,bL:-.7,bR:-.7,tL:.9,tR:.9,mC:-.5,mO:.45,mW:1.15,blush:.05},
 frozen:{eyeO:1.3,bL:.9,bR:.9,tL:-.4,tR:-.4,mO:.55,mW:1,mC:-.2,sweat:.7},
 resign:{eyeO:.62,lidT:.22,bL:.2,bR:.2,tL:-.6,tR:-.6,mC:-.4,mO:0,blush:0},
 happy:{eyeO:.72,lidT:.15,mC:1,mO:.55,mW:1.18,blush:.55,bL:.35,bR:.35},
 wink:{eyeO:.8,wk:1,mC:1,mO:.5,mW:1.15,blush:.6,bL:.3,bR:.6},
 confident:{eyeO:.9,lidT:.1,bL:.4,bR:.15,tL:.25,tR:.25,mC:.8,mO:.15,blush:.25}
};
const KF=[];function initKF(){KF.push([0,'calm'],[2.6,'calm'],[3.7,'curious'],[vac-.15,'curious'],[vac+.12,'shock'],[ST[1]+.5,'shock'],[ST[1]+1.5,'fear'],[ST[2]-.1,'fear'],[wA-.3,'curious'],[wA+.1,'shock'],[wM-.2,'curious'],[wM+.1,'shock'],[wB-.2,'strain'],[wB+.3,'strain'],[ST[3]+.3,'fear'],[wF-.1,'fear'],[wF+.3,'frozen'],[wF+1.2,'resign'],[ST[4]+.3,'resign'],[ST[4]+2.4,'curious'],[ST[4]+3.2,'resign'],[ST[5]+.3,'calm'],[ST[5]+.9,'confident'],[wMito-.3,'confident'],[wMito+.1,'happy'],[ST[6]+.4,'calm'],[ST[6]+2.5,'happy'],[ST[7]-.2,'happy'],[ST[7]+1,'happy'],[ST[7]+2.3,'happy'],[ST[7]+2.6,'wink'],[ST[7]+3.4,'wink'],[ST[7]+3.8,'happy'],[TOTAL+5,'happy']);}
function exprAt(t){
  let i=0;while(i<KF.length-2&&t>=KF[i+1][0])i++;const [t0,n0]=KF[i],[t1,n1]=KF[i+1];const k=eio(clamp((t-t0)/Math.max(.05,t1-t0)));
  const A=Object.assign({},EXPR0,EXP[n0]),B=Object.assign({},EXPR0,EXP[n1]);const E={};for(const key in EXPR0)E[key]=lerp(A[key],B[key],k);
  E.wk=lerp(A.wk||0,B.wk||0,k);
  // blink + lip-sync + breathing life
  const ph=(t%3.4),bl=ph<.17?Math.sin(ph/.17*Math.PI):0;E.eyeO*=1-.92*bl*(E.eyeO>1.2?.6:1);
  let talk=0;for(const sg of SEGS){const base=sg.words;}
  for(let si=0;si<SEGS.length;si++){for(const w of SEGS[si].words){const a=ST[si]+w[1],b=ST[si]+w[2];if(t>=a&&t<=b){const k2=Math.sin(Math.PI*(t-a)/(b-a));talk=Math.max(talk,k2*(.32+.2*rng(Math.floor(a*10))));}}}
  E.mO=Math.max(E.mO,E.mO+talk*(E.mO>.4?.3:1)*.9);
  return E;
}
// ===================== poses =====================
const POSES={
 idle:{aL:[.12,.16],aR:[.12,.16],tilt:0,lean:0,shrug:0},
 up:{aL:[2.45,2.85],aR:[2.45,2.85],shrug:.6,tilt:0,lean:-.03},
 point:{aR:[1.42,1.52],aL:[.12,.2],tilt:.05,lean:.02},
 explain:{aR:[.95,1.75],aL:[.55,1.15],tilt:-.03,lean:0},
 facepalm:{aR:[.3,2.85],aL:[.14,.2],fR:.92,tilt:.12,nod:.7,lean:.05},
 shrug:{aL:[.6,1.3],aR:[.6,1.3],fL:.85,fR:.85,shrug:1,tilt:.07,lean:0},
 hip:{aL:[.6,-.4],aR:[.14,.2],tilt:-.05,lean:-.02},
 cheer:{aL:[2.25,2.75],aR:[2.25,2.75],tilt:0,lean:-.02,shrug:.2},
 vsign:{aL:[2.0,2.5],aR:[2.0,2.5],shrug:.3}
};
function blendP(a,b,k){const o={};const keys=new Set([...Object.keys(a),...Object.keys(b)]);for(const key of keys){const x=a[key],y=b[key];
  if(Array.isArray(x)||Array.isArray(y)){const xx=x||POSE0[key],yy=y||POSE0[key];o[key]=xx.map((v,i)=>lerp(v,yy[i],k));}else o[key]=lerp(x===undefined?POSE0[key]||0:x,y===undefined?POSE0[key]||0:y,k);}return o;}
function poseSeq(t,keys,fade=.4){ // keys: [[time,name],...] ascending
  let cur=POSES.idle,prev=POSES.idle;let k=1,pi=-1;for(let i=0;i<keys.length;i++)if(t>=keys[i][0])pi=i;
  if(pi<0)return POSES.idle;const target=POSES[keys[pi][1]],before=pi>0?POSES[keys[pi-1][1]]:POSES.idle;const kk=eob(clamp((t-keys[pi][0])/fade),.8);return blendP(before,target,kk);}
function idleLife(t,seed=0){const br=Math.sin(t*2.3+seed);return {breathe:br,tilt:Math.sin(t*.9+seed)*.012,bob:Math.sin(t*2.3+seed)*1.2};}
function addP(a,b){const o=Object.assign({},a);for(const k in b){if(Array.isArray(b[k]))o[k]=(a[k]||POSE0[k]).map((v,i)=>v+b[k][i]);else o[k]=(a[k]||0)+b[k];}return o;}
function walkPose(phi,intensity=1){
  const s1=Math.sin(phi),s2=Math.sin(phi+Math.PI),L=Math.max(0,s1),R=Math.max(0,s2);
  return {bob:-Math.abs(s1)*9*intensity,lean:Math.sin(phi)*.02*intensity,tilt:Math.sin(phi)*.02,
   lgL:[.07+s1*.2*intensity,L*30*intensity,1-L*.12*intensity],lgR:[.07-s2*.2*intensity*-1,R*30*intensity,1-R*.12*intensity],
   aL:[.14+s2*.26*intensity,.2+s2*.18*intensity],aR:[.14+s1*.26*intensity,.2+s1*.18*intensity],breathe:s1*.5};}
// ===================== particles / fx =====================
const POOFS=[];function poof(t0,x,y,n,tint,spd=1){POOFS.push({t0,x,y,n,tint,spd});}
function drawPoofs(g,t){g.save();g.globalCompositeOperation='lighter';
  for(const e of POOFS){const age=t-e.t0;if(age<0||age>1.1)continue;const f=1-age/1.1;
   for(let i=0;i<e.n;i++){const s=e.t0*17+i*7,th=rng(s)*6.283,sp=(60+rng(s+1)*190)*e.spd,d=sp*Math.sqrt(age)*1.4;const x=e.x+Math.cos(th)*d,y=e.y+Math.sin(th)*d-40*age*age;
    const sz=(14+rng(s+2)*26)*f*(.5+.5*Math.sin(age*20+i));g.globalAlpha=Math.min(1,f*1.3);g.drawImage(STAR,x-sz,y-sz,sz*2,sz*2);}}
  g.restore();}
function burstLines(g,x,y,t,t0,dur=.5,n=18,r0=110,r1=230,color='#ffffff'){const a=t-t0;if(a<0||a>dur)return;const k=a/dur;g.save();g.strokeStyle=color;g.lineCap='round';g.globalAlpha=(1-k)*.9;
  for(let i=0;i<n;i++){const th=i/n*6.283+rng(i)*.15,ra=r0+(r1-r0)*eo(k)*(.7+.3*rng(i+5)),rb=ra+40+30*rng(i+9);g.lineWidth=7*(1-k)+2;g.beginPath();g.moveTo(x+Math.cos(th)*ra,y+Math.sin(th)*ra);g.lineTo(x+Math.cos(th)*rb,y+Math.sin(th)*rb);g.stroke();}g.restore();}
function sparkles(g,t,cx,cy,n,spread,t0=0){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const ph=(t*.9+rng(i*3+t0)*3)%1,x=cx+(rng(i*5+1)-.5)*spread*2,y=cy+(rng(i*5+2)-.5)*spread*1.4-ph*60,sz=(10+rng(i+8)*22)*Math.sin(ph*Math.PI);g.globalAlpha=.9;g.drawImage(STAR,x-sz,y-sz,sz*2,sz*2);}g.restore();}
