import {S,limb,grp,defs,hand,handSkin,handProf,gripV2,shoeV2,ik2,face,uid,f,withT,T,visibleBB} from './char.mjs';
export const P={head:[250,126],shL:[186,240],shR:[314,240],hipL:[224,440],hipR:[276,440],knL:[218,572],knR:[286,566],anL:[212,694],anR:[292,692]};
const base=S[2];
const FACE=(o)=>({...base.face,...o});
const HAIR={
 beanie:{hairStyle:'beanie'},
 short:{hairStyle:'short',face:FACE({hairBack:'M-52,-6 Q-58,10 -50,24 L-44,4Z M52,-6 Q58,10 50,24 L44,4Z',hairFront:'M-54,-8 Q-60,-72 0,-76 Q60,-72 54,-8 Q50,-30 30,-36 Q14,-48 -4,-34 Q-24,-42 -40,-30 Q-50,-22 -54,-8Z',hairLines:['M-30,-54 Q-10,-64 14,-58','M10,-62 Q34,-56 44,-40']})},
 long:{hairStyle:'long',face:FACE({hairBack:'M-56,-10 Q-68,-72 0,-76 Q68,-72 56,-10 Q72,50 60,104 L34,92 L-34,92 L-60,104 Q-72,50 -56,-10Z',hairFront:'M-55,-8 Q-60,-76 0,-78 Q60,-76 55,-8 Q46,-40 14,-46 Q-8,-30 -30,-24 Q-46,-20 -55,-8Z',hairLines:['M-34,-58 Q-10,-70 18,-62','M26,-60 Q42,-48 46,-30']})},
 curly:{hairStyle:'curly',face:FACE({hairBack:'M-62,-20 Q-80,-4 -62,24 Q-52,10 -50,-10Z M62,-20 Q80,-4 62,24 Q52,10 50,-10Z M-30,-62 Q-50,-84 -20,-84 Q0,-96 20,-84 Q50,-84 30,-62Z',hairFront:'M-56,-10 Q-70,-50 -44,-64 Q-36,-86 -10,-78 Q0,-92 14,-78 Q40,-86 46,-62 Q70,-48 56,-10 Q44,-36 30,-34 Q16,-24 0,-34 Q-16,-24 -30,-34 Q-44,-34 -56,-10Z',hairLines:['M-30,-62 Q-10,-70 6,-62','M16,-64 Q34,-60 40,-48']})}
};
export function mk(name,o){const h=HAIR[o.hair||'beanie'];return {...base,k:2,name,...o,hairStyle:h.hairStyle,face:h.face||base.face}}
export const CAST={
 beto:mk('Beto',{hair:'beanie',skin:'#e6ae88',skin2:'#c98a64',hood:'#2f7a8c',hood2:'#215a68',pants:'#3a3f5c',hairc:'#5a3825'}),
 diego:mk('Diego',{hair:'short',skin:'#d9a07a',skin2:'#b97a56',hood:'#8a6a3a',hood2:'#6a4f28',pants:'#2f3a4a',hair:'short',hairc:'#241812'}),
 marta:mk('Marta',{hair:'long',skin:'#c98e6c',skin2:'#a8704f',hood:'#b8383e',hood2:'#8a2a2f',pants:'#1f2432',lashes:true}),
 lucia:mk('Lucía',{hair:'curly',skin:'#f1c4a3',skin2:'#d99c7c',hood:'#e0b43a',hood2:'#b88a22',pants:'#3a4a6a',lashes:true})
};
// fix hair colours
CAST.beto.hair='#5a3825';CAST.beto.hairStyle='beanie';
CAST.diego.hair='#241812';CAST.diego.hair2='#4a3626';CAST.diego.hairStyle='short';
CAST.marta.hair='#1c1416';CAST.marta.hair2='#4a3a40';CAST.marta.hairStyle='long';
CAST.lucia.hair='#3b2218';CAST.lucia.hair2='#6a4430';CAST.lucia.hairStyle='curly';
const ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
export function elbow(sh,wr,side,fs=1){// 2-bone IK + pole point below the shoulder (gravity): elbow nearest to the pole -> stable, no flips
 const dx=wr[0]-sh[0],dy=wr[1]-sh[1];const d=Math.hypot(dx,dy);const k=d<18?18/d:1;const w=[sh[0]+dx*k,sh[1]+dy*k];
 const A=ik2(sh,w,102,88*fs,1)[1],B=ik2(sh,w,102,88*fs,-1)[1];const P=[sh[0]+side*60,sh[1]+200];
 const da=Math.hypot(A[0]-P[0],A[1]-P[1]),db=Math.hypot(B[0]-P[0],B[1]-P[1]);return da<=db?A:B}
CAST.sofi=mk('Sofi',{hair:'long',skin:'#c98e6c',skin2:'#a8704f',hood:'#d9588a',hood2:'#a83c68',pants:'#3a4a6a',lashes:true,hs:1.7});CAST.sofi.hair='#150f10';CAST.sofi.hair2='#3a2a2e';CAST.sofi.hairStyle='long';
CAST.tomas=mk('Tomas',{hair:'short',skin:'#e0a98a',skin2:'#c98a64',hood:'#55606e',hood2:'#3d4650',pants:'#2f3a4a'});CAST.tomas.hair='#2b1b14';CAST.tomas.hairStyle='short';
export const DEF={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'}};
// pose: {L:{w,hand,prop},R:{...},head:{rot,dx,dy},breath,expr,blink,look,talk}
export function body(st,pose={}){const ol=st.ol;const hs=st.hs;const k=0.97*hs;let o='';
 const br=(pose.breath||0)*2.2;const shL=[P.shL[0],P.shL[1]+br],shR=[P.shR[0],P.shR[1]+br];
 const L={...DEF.L,...(pose.L||{})},R={...DEF.R,...(pose.R||{})};
 const wk=pose.walk||{phase:0,amp:0};const lfL=Math.max(0,Math.sin(wk.phase))*28*wk.amp,lfR=Math.max(0,Math.sin(wk.phase+Math.PI))*28*wk.amp;const KNL=[P.knL[0],P.knL[1]-lfL*.5],ANL=[P.anL[0],P.anL[1]-lfL],KNR=[P.knR[0],P.knR[1]-lfR*.5],ANR=[P.anR[0],P.anR[1]-lfR];
 const legL=limb(P.hipL,KNL,56,46)+limb(KNL,ANL,46,34),legR=limb(P.hipR,KNR,56,46)+limb(KNR,ANR,46,34);
 o+=grp(legL,st.pants,st,[150,420,140,290])+grp(legR,st.pants,st,[220,420,140,290]);
 o+=`<path d="M214,452 L212,560 M286,452 L288,555" stroke="${ol}" stroke-width="1.6" opacity=".5"/>`;
 o+=`<g transform="translate(${ANL[0]},${ANL[1]-2})">${withT(T(ANL[0],ANL[1]-2),()=>shoeV2(st,-1))}</g><g transform="translate(${ANR[0]},${ANR[1]-2})">${withT(T(ANR[0],ANR[1]-2),()=>shoeV2(st,1))}</g>`;
 o+=`<ellipse cx="${ANL[0]}" cy="${ANL[1]-6}" rx="22" ry="8" fill="${st.pants}" stroke="${ol}" stroke-width="${st.ow*1.4}"/><ellipse cx="${ANR[0]}" cy="${ANR[1]-6}" rx="22" ry="8" fill="${st.pants}" stroke="${ol}" stroke-width="${st.ow*1.4}"/>`;
 o+=grp(`<path d="M184,${232+br} Q250,${214+br} 316,${232+br} Q326,330 300,448 Q250,462 200,448 Q174,330 184,${232+br}Z"/>`,st.hood,st,[170,215,160,250]);
 o+=`<path d="M214,${246+br} Q250,${284+br} 286,${246+br}" stroke="${ol}" stroke-width="${st.ow*1.2}" fill="none"/><path d="M240,268 v52 M262,268 v48" stroke="${st.shoe}" stroke-width="3" stroke-linecap="round"/><circle cx="240" cy="322" r="3" fill="${st.shoe}"/><circle cx="262" cy="318" r="3" fill="${st.shoe}"/><path d="M208,392 Q250,404 292,392 L298,440 Q250,452 202,440Z" fill="${st.hood2}" stroke="${ol}" stroke-width="${st.ow*1.1}"/>`;
 o+=grp(`<path d="M198,${238+br} Q204,${200+br} 250,${196+br} Q296,${200+br} 302,${238+br} Q250,${222+br} 198,${238+br}Z"/>`,st.hood,st,[190,190,120,60],{sd:3});
 o+=`<path d="M214,${236+br} Q250,${214+br} 286,${236+br} Q250,${226+br} 214,${236+br}Z" fill="#14343c" opacity=".9"/>`;
 const nk=`<path d="M231,170 L269,170 Q271,198 284,${228+br} Q250,${238+br} 216,${228+br} Q229,198 231,170Z"/>`;
 o+=grp(nk,st.skin,st,[210,160,80,90],{sd:4});
 const hy=P.head[1]-(hs-1)*27+(pose.head?.dy||0);
 if(visibleBB(205,155,295,245,2)){const cn=uid();o+=`<clipPath id="${cn}">${nk}</clipPath><g clip-path="url(#${cn})"><ellipse cx="250" cy="${hy+54*k+6}" rx="${34*k}" ry="${16*k}" fill="#1a0f2a" opacity=".22"/></g><path d="M238,196 Q243,212 246,228 M262,196 Q257,212 254,228" stroke="${ol}" stroke-width="1.6" fill="none" opacity=".4" stroke-linecap="round"/>`}
 o+=grp(`<path d="M202,${230+br} Q250,${270+br} 298,${230+br} Q304,${218+br} 292,${214+br} Q250,${244+br} 208,${214+br} Q196,${218+br} 202,${230+br}Z"/>`,st.hood2,st,[190,200,120,80],{sd:3});
 const arm=(sh0,wr,side,A)=>{const lift=Math.max(0,Math.min(1,(sh0[1]-wr[1]+20)/170))*9;const sh=[sh0[0]+side*lift*.3,sh0[1]-lift];const el=A.e?[A.e[0]+side*lift*.3,A.e[1]-lift*.5]:elbow(sh,wr,side,A.fs||1);let r=grp(limb(sh,el,50,42)+limb(el,wr,42,34),st.hood,st,[Math.min(sh[0],wr[0])-70,Math.min(sh[1],wr[1])-70,Math.abs(wr[0]-sh[0])+140,Math.abs(wr[1]-sh[1])+160]);
  r+=`<path d="M${el[0]-8},${el[1]+8} q8,6 4,14M${el[0]+6},${el[1]-10} q-6,6 -4,14" stroke="${ol}" stroke-width="1.5" fill="none" opacity=".5"/>`;
  const fa=ang(el,wr),dir=[Math.cos(fa*Math.PI/180),Math.sin(fa*Math.PI/180)];
  r+=grp(limb(wr,[wr[0]+dir[0]*9,wr[1]+dir[1]*9],38,38),st.hood2,st,[wr[0]-50,wr[1]-50,100,100],{noShade:true});
  const hw=[wr[0]+dir[0]*8,wr[1]+dir[1]*8];
  const faceZone=wr[1]<290&&wr[0]>150&&wr[0]<350&&!!A.front;
  if(A.hand==='grip')r+=(()=>{const R0=A.rot!==undefined?A.rot*(side<0?-1:1):fa+90;return `<g transform="translate(${f(hw[0])},${f(hw[1])}) rotate(${f(R0)}) scale(${side<0?-1:1},1)">${withT(T(hw[0],hw[1],R0,side<0?-1:1,1),()=>gripV2(st,A.prop||'flash'))}</g>`})();
  else if(A.hand==='open'){const sd=faceZone?(side<0?1:-1):(side<0?-1:1);r+=hand(hw,fa,1.0,sd,withT(T(hw[0],hw[1],fa,1.0,sd),()=>handSkin('open',st)))}
  else if(A.hand==='point'){const flip=Math.cos(fa*Math.PI/180)<0;{const sd=flip?-1:1;r+=hand(hw,fa,1.12,sd,withT(T(hw[0],hw[1],fa,1.12,1.12*sd),()=>handProf('point',st)))}}
  else{{const sd=side<0?-1:1;r+=hand(hw,fa,1.2,sd,withT(T(hw[0],hw[1],fa,1.2,1.2*sd),()=>handProf('free',st)))}}
  return r};
 let late='';
 {const a=arm(shL,L.w,-1,L);if(L.front)late+=a;else o+=a}
 {const a=arm(shR,R.w,1,R);if(R.front)late+=a;else o+=a}
 const hd=pose.head||{};
 o+=`<g transform="translate(${P.head[0]+(hd.dx||0)},${hy}) rotate(${hd.rot||0}) scale(${f(k)})">${withT(T(P.head[0]+(hd.dx||0),hy,hd.rot||0,k,k),()=>face(st,pose.expr||'neutral',{blink:pose.blink,look:pose.look,talk:pose.talk}))}</g>`+late;
 return o}
export {defs};
