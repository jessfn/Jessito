// Musical 2 "Contemos estrellitas" (96 BPM): 1 pulso = 0.625 s, 1 compas = 2.5 s. Los ciclos del personaje duran 2 pulsos.
const B3=60/96,BAR3=B3*4,DUR3=30;
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),ss3=(a,b,x)=>{const u=cl((x-a)/(b-a));return u*u*(3-2*u)};
function plan3(t){
 const bph=(t/B3)%1,pulse=Math.exp(-bph*5),bounce=Math.abs(Math.sin(bph*Math.PI));
 const o={art:'2',A:[],X:540,Y:0,SX:1,SY:1,ROT:0,pulse,bounce};
 const loop2=(t/(2*B3))%1;
 if(t<BAR3){ // entra flotando desde arriba
  const u=cl(t/1.7),e=1-Math.pow(1-u,3);o.art='2';o.Y=-900*(1-e)+Math.sin(t*3)*6;o.SX=o.SY=.6+.4*e;o.ROT=(1-e)*.25;
  o.A=[['Timeline 1',(121+loop2*59)/60,1]];
 } else if(t<6*BAR3){ // cuenta con su banderita
  o.art='5';o.A=[['Timeline 1',(180+loop2*60)/60,1]];o.Y=-bounce*10;o.SY=1-.03*pulse;o.SX=1+.025*pulse;
 } else if(t<10*BAR3){ // salta de alegria
  o.art='2';o.A=[['Timeline 1',(121+loop2*59)/60,1]];o.Y=-bounce*(t<8*BAR3?28:70);o.SY=1+.04*bounce-.03*pulse;o.SX=1-.02*bounce+.025*pulse;
  o.ROT=t>=8*BAR3?Math.sin(t*Math.PI/B3)*.05:0;
 } else if(t<11*BAR3+.9){ // despedida: saluda con la banderita
  o.art='5';o.A=[['Timeline 1',(180+loop2*60)/60,1]];o.Y=-bounce*12;
 } else { // se duerme
  o.art='4';const u=t-(11*BAR3+.9);o.A=[['Timeline 1',(240+(((t/(8*B3))%1)*239))/60,1],['Z',(120+(((t/(4*B3))%1)*60))/60,1]];
  o.Y=Math.sin(t*1.2)*8;o.SY=1+.012*Math.sin(t*1.2);
 }
 return o}
