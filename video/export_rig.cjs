// Exporta, cuadro por cuadro, los huesos y la fisica del personaje para Blender
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file:///home/user/Jessito/video/anim2.html');
const data=await p.evaluate(()=>{const out=[];const r1=v=>Math.round(v*10)/10;const pt=q=>[r1(q.x),r1(q.y)];
 for(let f=0;f<720;f++){const t=f/30,P0=pose(t);P0.t=t;const S=SIM[f],J=rig(P0,S.am);const P=Object.assign({},P0,{tilt:P0.tilt+S.ht});
  const head=J.head;
  const ears=[-1,1].map((sd,i)=>{const base={x:head.x+sd*52*Math.cos(P.tilt),y:head.y-92*Math.cos(P.tilt)+sd*52*Math.sin(P.tilt)};
   const pts=[base];let ang=P.tilt+sd*(.2-P.perk*.1)+(P.perk<0?sd*-P.perk*.9:0);
   for(let j=0;j<3;j++){ang+=S.ear[i][j]*(j==0?1:.9)+(j?sd*.05:0);const len=[78,84,84][j],q=pts[j];pts.push({x:q.x+Math.sin(ang)*len,y:q.y-Math.cos(ang)*len})}return pts.map(pt)});
  const all=[...ears[0],...ears[1],pt(J.hip),...J.legs.flatMap(l=>[pt(l.a),pt(l.knee),pt(l.foot)]),...J.arms.flatMap(a=>[pt(a.sh),pt(a.el),pt(a.hd)]),pt(head)];
  const xs=all.map(a=>a[0]),ys=all.map(a=>a[1]);
  out.push({f,P:{hx:r1(P.hx),hy:r1(P.hy),lean:P.lean,tilt:P.tilt,sx:P.sx,sy:P.sy,air:P.air,lookX:P.lookX,lookY:P.lookY,eye:P.eye,joy:P.joy,winkL:P.winkL,brow:P.brow,browTilt:P.browTilt,mouth:P.mouth,talk:P.talk,blush:P.blush,perk:P.perk},
   hip:pt(J.hip),chest:pt(J.chest),head:pt(head),legs:J.legs.map(l=>[pt(l.a),pt(l.knee),pt(l.foot)]),arms:J.arms.map(a=>[pt(a.sh),pt(a.el),pt(a.hd)]),ears,
   tail:[S.tail.x,S.tail.y],bow:S.bow,bel:S.bel,wh:S.wh,bbox:[Math.min(...xs)-190,Math.min(...ys)-190,Math.max(...xs)+190,Math.max(...ys)+190]})}
 return out});
fs.writeFileSync('rig.json',JSON.stringify(data));console.log(data.length,'cuadros');await b.close()})();
