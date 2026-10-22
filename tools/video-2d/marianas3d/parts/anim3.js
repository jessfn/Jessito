// ===================== 3D director: keyframed targets -> spring simulation (120 Hz table) =====================
const D3=['rx','ry','rz','spF','spS','spT','nkP','nkY','nkR','fall','ox','oy',
 ...['L','R'].flatMap(s=>['ear','chest','face','shield','swim','float','rail','curl','fx','fy','c'].map(k=>'a'+s+'_'+k)),
 ...['L','R'].flatMap(s=>['kick','tuck','float','fy','toe'].map(k=>'l'+s+'_'+k)),
 'jaw','smile','frown','browIn','brow','browD','wide','squint','blink','stretch','sneer','cheek','lookD','lookU','puff'];
const DI3={};D3.forEach((k,i)=>DI3[k]=i);
const FACE3=['jaw','smile','frown','browIn','brow','browD','wide','squint','blink','stretch','sneer','cheek','lookD','lookU','puff'];
const SPR3=k=>FACE3.includes(k)?[24,.85]:(/^[al][LR]_/.test(k)?(/_(fx|fy|toe)$/.test(k)?[8,1]:[9,.95]):(k==='ox'||k==='oy'?[4,1]:(k==='fall'?[6,1]:[7.5,.78])));
const RATE3=120;let SAMP3=null,NS3=0;
const BASE3={ry:.9,aL_fx:.32,aR_fx:.32,aL_fy:.28,aR_fy:.28,aL_c:.3,aR_c:.3,lL_fy:.9,lR_fy:.9};
function tracks3(){const K=[];const k=(t,p)=>K.push([t,p]);const T_=T;
  const both=(n,v)=>({['aL_'+n]:v,['aR_'+n]:v});
  // ---- boat: hand on the rail, looking at the water ----
  k(0,{aR_rail:1,nkP:.18,lookD:.35,spF:.05,smile:.15});
  k(.5,{spF:.2,nkP:.4,lookD:.5,browIn:.35,brow:.25});
  k(.8,{spF:.5,rx:.3,aR_rail:.5,nkP:.2,lookD:0,wide:.9,browIn:1,brow:.9,jaw:.35,smile:0});
  // ---- fall: arms flail, scream ----
  k(T_.fall,{aR_rail:0,fall:1,aL_swim:.95,aR_swim:.95,lL_kick:.8,lR_kick:.8,spF:.35,rx:.75,rz:.12,wide:1,browIn:1,brow:1,jaw:1,stretch:.5,nkP:-.1});
  k(T_.splash,{aL_swim:.95,aR_swim:.95,rx:1.15,rz:0});
  k(T_.splash+1.0,{rx:-.1});
  // ---- tread water, holding breath ----
  k(T_.splash+.35,{fall:0,aL_swim:1,aR_swim:1,lL_kick:1,lR_kick:1,jaw:0,wide:0,brow:0,browIn:0,stretch:0,squint:.95,browD:.8,sneer:.35,puff:1,cheek:.5,nkP:-.3,spF:0,lookU:.5});
  k(5.0,{aL_swim:1,aR_swim:1,lL_kick:1,lR_kick:1});
  k(6.2,{aL_swim:.25,aR_swim:.25,aL_float:.8,aR_float:.8,lL_kick:.25,lR_kick:.25,lL_float:.7,lR_float:.7,squint:.4,puff:.2,browD:.3,frown:.4,jaw:.2,wide:.3,nkP:-.35,fall:.5});
  // ---- sinking calmly, looking up at the light ----
  k(T_.spoil+2.6,{aL_swim:0,aR_swim:0,aL_float:.9,aR_float:.9,lL_kick:0,lR_kick:0,lL_float:.8,lR_float:.8,squint:0,puff:0,browD:0,sneer:0,cheek:0,frown:.15,jaw:.05,wide:.25,brow:.3,fall:.45,lookU:.7,nkP:-.4,rx:-.1});
  k(ST[1]+.4,{nkP:-.4,lookU:.8,brow:.35});
  k(T_.once,{wide:1,browIn:1,brow:.8,jaw:.4,nkP:.1,lookU:0,lookD:.5,frown:0});
  k(T_.everest,{wide:.7,browIn:.5,brow:.5,jaw:0,nkP:-.1,lookD:.2});
  // ---- darkness: searching with a hand, then hugging himself ----
  k(ST[2]+.2,{wide:.8,browIn:.6,aR_float:.2,aR_face:.8,aL_float:.9,fall:.4,nkP:.05,lookD:0,lookU:0});
  k(T_.mil2-.2,{aR_face:1,wide:.9,browIn:.8,jaw:.2});
  k(T_.osc,{aR_face:0,aR_float:0,aL_float:0,aL_chest:.9,aR_chest:.9,aL_c:.8,aR_c:.8,lL_float:.3,lR_float:.3,lL_tuck:.6,lR_tuck:.6,spF:.4,nkP:.35,wide:.2,squint:.35,frown:.6,browIn:.8,browD:.1,fall:.2});
  // ---- pressure ----
  k(T_.pres,{aL_chest:.95,aR_chest:.95,lL_tuck:.9,lR_tuck:.9,rx:.25,spF:.6,nkP:.45,squint:1,browD:1,browIn:0,sneer:.65,stretch:.8,jaw:.2,frown:.5,wide:0});
  k(T_.cinc,{spF:.7,nkP:.55,squint:1,jaw:.28,stretch:.9});
  // ---- lungs, ears ----
  k(T_.pulm-.1,{aL_chest:1,aR_chest:1,aL_c:1,aR_c:1,wide:.9,squint:.2,browD:0,browIn:.8,brow:.6,jaw:.65,stretch:.2,sneer:0,spF:.6});
  k(T_.pulm+.6,{jaw:.2,wide:.5,squint:.7,browD:.6,browIn:.3,stretch:.7});
  k(T_.oid-.1,{aL_chest:0,aR_chest:0,aL_ear:1,aR_ear:1,squint:1,browD:1,stretch:1,jaw:.15,wide:0,sneer:.6,nkP:.25,nkY:-.35,spF:.4});
  k(T_.romp,{blink:1,jaw:.45,stretch:1,browD:1,nkP:.65,spF:.75,rz:.08});
  k(T_.fondo-.2,{aL_ear:.6,aR_ear:.6,jaw:.2,stretch:.6,rx:.1});
  // ---- loses consciousness: limp ----
  k(T_.fondo+.5,{aL_ear:0,aR_ear:0,aL_chest:0,aR_chest:0,aL_float:.7,aR_float:.7,aL_fx:.2,aR_fx:.26,aL_fy:.1,aR_fy:.16,aL_c:.2,aR_c:.2,lL_tuck:0,lR_tuck:0,lL_float:.8,lR_float:.8,lL_fy:.93,lR_fy:.95,blink:1,jaw:.12,stretch:0,squint:0,browD:0,frown:0,sneer:0,fall:.3,spF:.1,nkP:.4,nkR:.25,rz:.22,rx:-.4});
  k(ST[5]+1.8,{rx:-.5,rz:.3,nkP:.45});
  k(T_.brill+.5,{rx:-.9,ry:1.2,rz:0,nkP:.1,aL_fy:.3,aR_fy:.3,lL_tuck:.85,lR_tuck:.55,lL_float:0,lR_float:0});
  k(T_.land,{rx:-1.57,ry:1.57,rz:0,nkP:-.05,nkR:0,fall:.4,aL_fx:.3,aR_fx:.38,aL_fy:.16,aR_fy:.2,lL_fy:.9,lR_fy:.92});
  k(1e3,{});
  return K;}
function trackV3(tr,t){if(t<=tr[0][0])return tr[0][1];for(let i=0;i<tr.length-1;i++){if(t<tr[i+1][0]){const a=tr[i],b=tr[i+1];const R=Math.min(b[0]-a[0],1.1);return lerp(a[1],b[1],ss(b[0]-R,b[0],t));}}return tr[tr.length-1][1];}
function simulate3(){const K=tracks3();const tr={};for(const d of D3)tr[d]=[];
  for(const [t,p] of K)for(const d in p){if(DI3[d]===undefined)throw new Error('dof '+d);tr[d].push([t,p[d]]);}
  for(const d of D3){const b=BASE3[d]||0;if(!tr[d].length||tr[d][0][0]>0)tr[d].unshift([0,b]);}
  const n=Math.ceil((TOTAL+.5)*RATE3);NS3=n;SAMP3=new Float32Array(n*D3.length);
  const st=new Float64Array(D3.length),vel=new Float64Array(D3.length);D3.forEach((d,j)=>st[j]=trackV3(tr[d],0));
  const SUB=2,dt=1/(RATE3*SUB);
  for(let i=0;i<n*SUB;i++){const t=i*dt;const tg={};for(const d of D3)tg[d]=trackV3(tr[d],t);
    // blinks
    const bp=(t*.33+.17*Math.sin(t*.8))%1;if(bp<.035&&tg.blink<.5&&tg.squint<.5)tg.blink=1;
    // searching head sweep while looking for a light
    const sw=ss(ST[2]+.3,ST[2]+1,t)*(1-ss(T.osc-.3,T.osc,t));tg.nkY=Math.sin(t*1.6)*.55*sw;
    // shiver while compressed
    const sh=ss(T.pres,T.pres+.5,t)*(1-ss(T.fondo,T.fondo+.3,t));tg.rz+=Math.sin(t*50)*.012*sh;tg.spS=Math.sin(t*43)*.02*sh;
    // slow drift sway
    const fl=ss(6.5,7.5,t)*(1-ss(T.fondo,T.fondo+.5,t));tg.rz+=Math.sin(t*.8)*.05*fl;tg.nkR=(tg.nkR||0)+Math.sin(t*.9)*.05*fl;
    for(let j=0;j<D3.length;j++){const d=D3[j];const [w,z]=SPR3(d);const a=w*w*(tg[d]-st[j])-2*z*w*vel[j];vel[j]+=a*dt;st[j]+=vel[j]*dt;}
    if(i%SUB===0){const o=(i/SUB)*D3.length;for(let j=0;j<D3.length;j++)SAMP3[o+j]=st[j];}}
}
function dofAt3(t){const f=clamp(t*RATE3,0,NS3-2),i=Math.floor(f),u=f-i,n=D3.length,o={};for(let j=0;j<n;j++)o[D3[j]]=lerp(SAMP3[i*n+j],SAMP3[(i+1)*n+j],u);return o;}
const swimFreq=t=>(t<T.splash+.3?9.0:(2.0-.5*ss(3.5,6,t)))*2*Math.PI;
function swimPhase(t){ // integral of frequency (closed form piecewise numeric)
  let ph=0;const dt=.01;for(let u=0;u<t;u+=dt)ph+=swimFreq(u)*dt;return ph;}
const SWIMPH=[];function initPhase(){let ph=0;const dt=1/120;for(let i=0;i<(TOTAL+1)*120;i++){SWIMPH.push(ph);ph+=swimFreq(i*dt)*dt;}}
const swimPh=t=>SWIMPH[Math.min(SWIMPH.length-1,Math.floor(t*120))];
function pose3At(t){const d=dofAt3(t);const fall=clamp(d.fall,0,1);
  const mix=[{n:'M_Standing_Idle_001',time:t,w:1-fall+.001},{n:'M_Falling_Idle_002',time:t*.7,w:fall+.001}];
  const arm=s=>({ear:d['a'+s+'_ear'],chest:d['a'+s+'_chest'],face:d['a'+s+'_face'],shield:d['a'+s+'_shield'],swim:d['a'+s+'_swim'],float:d['a'+s+'_float'],rail:d['a'+s+'_rail'],curl:d['a'+s+'_curl'],fx:d['a'+s+'_fx'],fy:d['a'+s+'_fy']});
  const leg=s=>({kick:d['l'+s+'_kick'],tuck:d['l'+s+'_tuck'],float:d['l'+s+'_float'],fy:d['l'+s+'_fy'],toe:d['l'+s+'_toe']});
  const face={};for(const k of FACE3)face[k]=d[k];
  return {mix,rot:[d.rx,d.ry,d.rz],spine:[d.spF,d.spS,d.spT],neck:[d.nkP,d.nkY,d.nkR],armLeft:arm('L'),armRight:arm('R'),curlLeft:d.aL_c,curlRight:d.aR_c,legLeft:leg('L'),legRight:leg('R'),face,swimPh:swimPh(t),kickPh:swimPh(t)*1.0,ox:d.ox,oy:d.oy};}
