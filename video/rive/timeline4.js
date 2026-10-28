// Musical 3 "Las formas" (120 BPM): 1 pulso = 0.5 s, 1 compas = 2 s. Los ciclos del robot (Idle y Fly) duran 2 pulsos = 1 s.
const B4=.5,BAR4=2,DUR4=39;
const c4=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),s4=(a,b,x)=>{const u=c4((x-a)/(b-a));return u*u*(3-2*u)};
function plan4(t){
 const loop=(t/(2*B4))%1,bph=(t/B4)%1,pulse=Math.exp(-bph*5),bounce=Math.abs(Math.sin(bph*Math.PI));
 const o={A:[],X:540,Y:0,SX:1,SY:1,ROT:0,pulse,bounce,fly:0};
 const idle=()=>o.A.push(['Idle',(30+loop*60)/60,1]);
 const fly=(m)=>{o.A.push(['Fly',loop,m]);o.A.push(['Face_Fly',loop,m])};
 idle();
 if(t<1.7){ // entra volando desde arriba
  const u=c4(t/1.7),e=1-Math.pow(1-u,2.2);o.Y=-1000*(1-e);o.fly=1;fly(1);o.ROT=(1-e)*.2;
 } else if(t<4){ // aterriza y saluda con rebotes
  const w=t-1.7,g=Math.exp(-7*w)*Math.cos(16*w);o.SY=1-.07*g;o.SX=1+.05*g;fly(1-s4(1.7,1.95,t));o.Y=-bounce*6;
 } else if(t<28){ // formas (6 s cada una): salto corto con propulsores al empezar cada parte
  const s=(t-4)%6,hop=(s<.5)?Math.sin(s/.5*Math.PI):(s>=3&&s<3.5)?Math.sin((s-3)/.5*Math.PI):0;
  fly(c4(hop*2.2));o.Y=-hop*70-bounce*5;o.fly=hop>.05?1:0;o.SY=1+.03*hop;
 } else if(t<34){ // repaso: vuela celebrando
  const u=t-28;fly(s4(28,28.4,t));o.fly=1;o.Y=-110*s4(28,28.6,t)+Math.sin(t*Math.PI/B4)*14;o.X=540+Math.sin(u*1.7)*70;o.ROT=Math.sin(u*1.7)*.06;
 } else { // despedida: baja y se despide con rebotes
  const u=t-34,d=s4(34,34.7,t);fly(1-d);o.Y=-110*(1-d)-bounce*10*d;o.X=540+Math.sin(u*1.5)*(1-d)*70;o.fly=d<.9?1:0;
 }
 return o}
