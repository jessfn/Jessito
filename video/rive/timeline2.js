// Coreografia del musical (90 BPM): 1 pulso = 2/3 s, 1 compas = 8/3 s. El ciclo WALK dura exactamente 2 pulsos.
const BEAT=2/3,BAR=8/3;
function plan2(t){
 const o={A:[],X:CX,Y:0,SX:1,SY:1,ROT:0};
 const bph=(t/BEAT)%1,pulse=Math.exp(-bph*5),bounce=Math.abs(Math.sin(bph*Math.PI));
 o.A.push(['Idle Loop',idleT(t),1]);
 const wave=(a)=>{if(a>0){o.A.push(['01 Wave 1',WAVE_UP*a,1]);if(a>=.999)o.A.push(['01 Wave 2',w2T(t),1])}};
 const march=(m)=>o.A.push(['WALK',150/60+(((t/(2*BEAT))%1)*80)/60,m]);
 if(t<BAR){ // entra caminando al ritmo
  const u=TLclamp(t/2.0),e=1-Math.pow(1-u,1.5);o.X=TLl(-190,CX,e);
  march(1-TLss(1.6,2.0,t));o.Y=-bounce*8*(1-TLss(1.6,2.0,t));
  wave(TLss(2.0,2.2,t)*(1-TLss(2.45,2.66,t)));
 } else if(t<6*BAR){ // contando con el libro
  const s=t-BAR;
  if(s<.8)o.A.push(['idle to Pose 1',(150+50*TLss(0,.8,s))/60,1]);else o.A.push(['Pose 1 loop',(240+(((s-.8)*60)%60))/60,1]);
  o.Y=-bounce*16;o.SY=1-.045*pulse;o.SX=1+.035*pulse;
 } else if(t<7*BAR){ // marcha en su lugar
  const s=t-6*BAR,p=1-TLss(0,.6,s);if(p>0)o.A.push(['idle to Pose 1',(150+50*p)/60,1]);
  march(TLss(.4,.8,s));o.Y=-bounce*22;o.SY=1-.05*pulse;o.SX=1+.04*pulse;
 } else if(t<8*BAR){ // saluda y salta
  const s=t-7*BAR;wave(TLss(0,.25,s));o.Y=-bounce*55;o.SY=1+.05*bounce-.04*pulse;o.SX=1-.03*bounce+.03*pulse;
 } else if(t<10*BAR){ // celebracion
  const s=t-8*BAR;wave(TLss(0,.2,s));o.Y=-bounce*115;o.SY=1+.07*bounce;o.SX=1-.04*bounce;o.ROT=Math.sin(t*(Math.PI/BEAT))*.04;
 } else { // despedida
  const s=t-10*BAR;wave(TLss(0,.25,s));o.Y=-bounce*(s<BAR?60:14);o.X=CX+Math.sin(s*2.2)*10;o.SY=1+.03*bounce-.03*pulse;
 }
 o.A.push(['Kedip',blinkT(t),1]);
 return o}
