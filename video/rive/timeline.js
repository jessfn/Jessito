// Guion de movimiento compartido (sprites + composicion). t en segundos.
const TLclamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const TLl=(a,b,u)=>a+(b-a)*u;
const TLeo=x=>1-Math.pow(1-TLclamp(x),3);
const TLss=(a,b,x)=>{const u=TLclamp((x-a)/(b-a));return u*u*(3-2*u)};
const SEG0=3,SEGL=4,OUT0=19,GY=1470,CX=540;
const idleT=t=>150/60+((t*60)%30)/60;
const blinkT=t=>((t+.4)%3.1667);
const w2T=t=>30/60+((t*60)%20)/60;
const WAVE_UP=13/60;
function plan(t){
 const o={A:[],X:CX,Y:0,SX:1,SY:1,ROT:0,air:0,hop:0};
 o.A.push(['Idle Loop',idleT(t),1]);
 const waveOn=(u)=>{o.A.push(['01 Wave 1',WAVE_UP*TLclamp(u),1]);if(u>=1)o.A.push(['01 Wave 2',w2T(t),1])};
 if(t<SEG0){
  if(t<1.9){const u=t/1.9,e=1-Math.pow(1-u,1.6);o.X=TLl(-190,CX,e);const ph=(o.X+190)/300;
   const w=TLss(1.55,1.9,t);o.A.push(['WALK',150/60+((ph%1)*80)/60,1-w]);o.Y=-Math.abs(Math.sin(ph*Math.PI*2))*7*(1-w);}
  else{const u=(t-1.9)/1.1;
   const up=TLss(0,.22,t-1.9)*(1-TLss(.85,1.1,t-1.9));
   if(up>0){o.A.push(['01 Wave 1',WAVE_UP*up,1]);if(up>=.999)o.A.push(['01 Wave 2',w2T(t),1])}
   const g=Math.exp(-7*(t-1.9))*Math.cos(16*(t-1.9));o.SY=1-.06*g;o.SX=1+.05*g}
 } else if(t<OUT0){
  const k=Math.floor((t-SEG0)/SEGL),s=t-SEG0-k*SEGL;o.seg=k;o.s=s;
  const jh=250;let h=0;
  if(s>=.9&&s<1.25){const u=TLss(.9,1.2,s);o.SY=1-.13*u;o.SX=1+.1*u}
  if(s>=1.25&&s<1.75){const u=(s-1.25)/.5;h=jh*(1-Math.pow(1-u,2));o.SY=1+.1*Math.sin(u*Math.PI*.9);o.SX=1-.05*Math.sin(u*Math.PI*.9);o.air=1;waveOn(TLss(1.25,1.4,s))}
  if(s>=1.75&&s<2.2){const v=(s-1.75)/.45;h=jh*(1-v*v);o.air=1;waveOn(1);o.ROT=.07*Math.sin((s-1.75)*40)*Math.exp(-(s-1.75)*9);o.SY=1+.06*(1-v)}
  if(s>=2.2){const w=s-2.2,g=Math.exp(-8*w)*Math.cos(18*w);o.SY=1-.15*g;o.SX=1+.12*g;
   if(s<2.35)waveOn(1-TLss(2.2,2.35,s)*1);
   const p=TLss(2.2,2.9,s)*(1-TLss(3.5,3.95,s));
   if(s<2.9||s>=3.5){o.A.push(['idle to Pose 1',(150+50*p)/60,1])}
   else{o.A.push(['Pose 1 loop',(240+(( (s-2.9)*60)%60))/60,1])}
  }
  o.Y=-h;
 } else {
  const u=t-OUT0;
  const hu=(u/.8)%1;
  if(u<1.6){o.Y=-Math.abs(Math.sin(hu*Math.PI))*110;o.air=1;o.SY=1+.06*Math.sin(hu*Math.PI);waveOn(TLss(0,.2,u))}
  else{const e=u-1.6;o.SY=1+.015*Math.sin(e*6);o.X=CX+Math.sin(e*2.4)*14;waveOn(1)}
 }
 o.A.push(['Kedip',blinkT(t),1]);
 return o}
