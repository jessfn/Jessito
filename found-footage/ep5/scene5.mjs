// Chapter 5: military shelter (flat 2D layers with depth cues, lights and shadows)
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const f=n=>(+n).toFixed(1);const FL=1510;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const flick=(t,i)=>{const h=Math.sin(t*23+i*7.1)*Math.sin(t*9.3+i*2.7)+Math.sin(t*61+i)*.3;return h>-.15?1:.2};
const rect=(x,y,w,h,fill,ex='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${ex}/>`;
const txt=(x,y,s,size,fill,ex='')=>`<text x="${f(x)}" y="${f(y)}" font-family="Inter" font-weight="900" font-size="${size}" fill="${fill}" text-anchor="middle" ${ex}>${s}</text>`;
export const defs5=`<defs>
<linearGradient id="bkWall" gradientUnits="userSpaceOnUse" x1="0" y1="-600" x2="0" y2="1510"><stop offset="0" stop-color="#12161a"/><stop offset=".5" stop-color="#2b3238"/><stop offset="1" stop-color="#20262b"/></linearGradient>
<linearGradient id="bkFloor" gradientUnits="userSpaceOnUse" x1="0" y1="1510" x2="0" y2="2100"><stop offset="0" stop-color="#3a3f44"/><stop offset="1" stop-color="#0c0e10"/></linearGradient>
<radialGradient id="redGl5"><stop offset="0" stop-color="#ff2a1a" stop-opacity=".9"/><stop offset="1" stop-color="#ff2a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="whiteGl5"><stop offset="0" stop-color="#f4f9ff" stop-opacity=".95"/><stop offset=".5" stop-color="#cfe6ff" stop-opacity=".3"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient>
<radialGradient id="amberGl5"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
<linearGradient id="shaft5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f4ff" stop-opacity=".35"/><stop offset="1" stop-color="#e8f4ff" stop-opacity="0"/></linearGradient>
<linearGradient id="steel5" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b4048"/><stop offset=".5" stop-color="#5a6068"/><stop offset="1" stop-color="#2c3036"/></linearGradient>
</defs>`;
function door(t,o){const x0=60,w=600,top=160,h=FL-top;let s='';const u=o.doorU||0;// 0 open,1 closed
 s+=rect(x0-50,top-50,w+100,h+50,'#101316')+rect(x0-50,top-50,w+100,50,'#06080a');
 for(let i=0;i<7;i++)s+=rect(x0-50,top+i*190,50,60,i%2?'#d8b82a':'#111');
 // light from the tunnel through the opening
 const open=1-u;
 s+=rect(x0,top,w,h,'#f4f9ff','fill-opacity="'+(.15+.85*open).toFixed(2)+'"');
 if(open>0){s+=`<polygon points="${x0+w},${top+80} ${x0+w+1100},${FL} ${x0+w+1100},${FL+120} ${x0+w},${FL}" fill="#e8f4ff" fill-opacity="${(.22*open).toFixed(2)}"/>`}
 const lw=w*(Math.cos(open*1.3)); // leaf swings inward (toward the right), shrinking
 const sk=open*.16;
 s+=`<polygon points="${x0},${top} ${f(x0+lw)},${f(top+sk*h*.1)} ${f(x0+lw)},${f(FL-sk*h*.06)} ${x0},${FL}" fill="url(#steel5)" stroke="#06080a" stroke-width="6"/>`;
 if(lw>60){s+=rect(x0+lw*.1,top+130,lw*.8,h-300,'#434a52','fill-opacity=".6"');
  // locking bars
  for(let i=0;i<3;i++){const by=top+200+i*340;const ext=u>.85?1:0;s+=rect(x0+lw*(.1),by,lw*.8,36,'#8a9099','stroke="#06080a" stroke-width="4"')+rect(x0+lw*.1-(ext?0:0),by+8,lw*.8,6,'#fff','fill-opacity=".2"')}
  // wheel handle
  s+=`<circle cx="${f(x0+lw*.5)}" cy="${top+h*.5}" r="${f(lw*.17)}" fill="none" stroke="#9aa2ac" stroke-width="12"/><circle cx="${f(x0+lw*.5)}" cy="${top+h*.5}" r="14" fill="#6a717c"/>`;
  for(let k=0;k<4;k++){const a=k*Math.PI/2;s+=`<line x1="${f(x0+lw*.5)}" y1="${top+h*.5}" x2="${f(x0+lw*.5+Math.cos(a)*lw*.17)}" y2="${f(top+h*.5+Math.sin(a)*lw*.17)}" stroke="#9aa2ac" stroke-width="9"/>`}
  s+=txt(x0+lw*.5,top+100,'ACCESO TÚNEL 8',Math.max(10,40*Math.cos(open*1.3)),'#e9eef5','letter-spacing="4"');
  // dents from outside
  const d=o.dent||0;if(d>0){for(let i=0;i<4;i++){const cy=top+400+i*260+(rn(i)*40),cx=x0+lw*(.3+rn(i+4)*.4);const k=clamp(d*1.3-i*.25);if(k>0)s+=`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(80*k)}" ry="${f(110*k)}" fill="#000" fill-opacity=".38"/><ellipse cx="${f(cx-6)}" cy="${f(cy-8)}" rx="${f(52*k)}" ry="${f(78*k)}" fill="#fff" fill-opacity=".08"/>`}
   if(d>.6)s+=`<path d="M${x0+lw*.45},${top+500} l40,90 l-34,60 l50,100" stroke="#06080a" stroke-width="7" fill="none"/>`}}
 // red status lamp
 const red=u>.9;s+=`<circle cx="${x0+w/2}" cy="${top-90}" r="22" fill="${red?'#ff2a1a':'#3dff7a'}"/><circle cx="${x0+w/2}" cy="${top-90}" r="${red?200:150}" fill="url(#${red?'redGl5':'whiteGl5'})" fill-opacity=".4"/>`;
 return s}
export function shelter(t,o){let s='';const al=o.alarm||0;
 s+=rect(-1500,-1500,9000,1500+FL,'url(#bkWall)');
 // panels + rivets + horizontal bands
 for(let k=-3;k<16;k++){const x=k*330;s+=rect(x,-1500,5,2900,'#06080a','fill-opacity=".7"')+rect(x+5,-1500,3,2900,'#4a525a','fill-opacity=".25"');for(let r=0;r<9;r++){s+=`<circle cx="${x+22}" cy="${40+r*170}" r="4" fill="#0a0c0e" fill-opacity=".7"/><circle cx="${x+22}" cy="${38+r*170}" r="2" fill="#fff" fill-opacity=".15"/>`}}
 s+=rect(-1500,FL-420,9000,16,'#d8b82a','fill-opacity=".55"')+rect(-1500,FL-404,9000,6,'#000','fill-opacity=".4"');
 s+=rect(-1500,FL-390,9000,390,'#1b2025','fill-opacity=".85"');
 // stains
 for(let k=0;k<20;k++){const x=k*240+rn(k)*150;s+=`<ellipse cx="${f(x)}" cy="${f(200+rn(k+3)*900)}" rx="${f(50+rn(k+7)*80)}" ry="${f(120+rn(k+9)*240)}" fill="#05070a" fill-opacity="${(.18+rn(k)*.18).toFixed(2)}"/>`}
 // ceiling: pipes + trays
 s+=rect(-1500,-40,9000,150,'#0e1215')+rect(-1500,110,9000,8,'#000','fill-opacity=".6"');
 for(const [y,h,c] of [[130,50,'#4a4036'],[210,34,'#30363c']]){s+=rect(-1500,y,9000,h,c)+rect(-1500,y,9000,h*.3,'#fff','fill-opacity=".1"')+rect(-1500,y+h*.78,9000,h*.22,'#000','fill-opacity=".35"');for(let k=-3;k<14;k++)s+=rect(k*380+rn(k)*50,y-8,22,h+16,'#181a1d')}
 // tube lights
 for(const [x,i] of [[420,0],[1300,1],[2150,2],[3000,3],[3850,4]]){const dead=(i===0||i===2);const on=dead?0:flick(t,i+9);s+=rect(x-170,300,340,24,'#262a2e')+rect(x-150,308,300,12,dead?'#2a2e30':(on>.5?'#f6fbff':'#586064'));
  if(!dead&&on>.5){s+=`<polygon points="${x-150},324 ${x+150},324 ${x+420},${FL} ${x-420},${FL}" fill="url(#shaft5)" fill-opacity=".55"/><ellipse cx="${x}" cy="${FL-6}" rx="380" ry="46" fill="url(#whiteGl5)" fill-opacity=".35"/>`}}
 // alarm beacons (rotating red)
 for(const x of[1000,2750,3650]){const ph=(Math.sin(t*8+x)+1)/2;s+=rect(x-26,330,52,40,'#2a1210')+`<circle cx="${x}" cy="350" r="${f(16+al*10)}" fill="${al>0?'#ff2a1a':'#4a1410'}"/>`;if(al>0)s+=`<ellipse cx="${x+Math.cos(t*8+x)*200}" cy="${FL-200}" rx="${f(520)}" ry="${f(900)}" fill="url(#redGl5)" fill-opacity="${(al*.55*ph).toFixed(2)}"/>`}
 s+=door(t,o);
 // signs
 s+=rect(780,420,430,170,'#d8b82a','stroke="#06080a" stroke-width="8"')+txt(995,490,'ZONA',54,'#14120a')+txt(995,560,'RESTRINGIDA',54,'#14120a','letter-spacing="2"');
 s+=rect(1480,380,420,120,'#0b3a1e','stroke="#03140a" stroke-width="6"')+txt(1690,455,'SALIDA DE EMERGENCIA',32,'#59ff8f')+`<circle cx="1690" cy="440" r="260" fill="#3dff7a" fill-opacity=".05"/>`;
 // bunks (zone B)
 for(const bx of[2440,2900]){const w=390;
  s+=rect(bx,FL-760,w,12,'#7a828c')+rect(bx,FL-420,w,12,'#7a828c')+rect(bx,FL-760,12,760,'#5a626c')+rect(bx+w-12,FL-760,12,760,'#5a626c');
  for(const y of[FL-748,FL-408]){s+=rect(bx+14,y-62,w-28,62,'#4a5a3a','stroke="#06080a" stroke-width="4"')+rect(bx+14,y-62,w-28,16,'#fff','fill-opacity=".1"')+rect(bx+30,y-90,120,36,'#d8d2c0','stroke="#06080a" stroke-width="3"')}
  s+=`<polygon points="${bx+80},${FL-360} ${bx+330},${FL-360} ${bx+300},${FL-110} ${bx+110},${FL-110}" fill="#0a0e0c" fill-opacity=".35"/>`}
 // crates (RACIONES)
 for(const [cx,cy,cw,ch,n] of [[3340,FL-250,260,250,'RACIONES'],[3340,FL-480,230,230,'AGUA'],[3600,FL-210,220,210,'MEDICINA']]){s+=rect(cx,cy,cw,ch,'#6a5a3a','stroke="#1b150a" stroke-width="6"')+rect(cx,cy,cw,14,'#fff','fill-opacity=".12"')+rect(cx+10,cy+ch*.42,cw-20,40,'#d8d2c0','fill-opacity=".85"')+txt(cx+cw/2,cy+ch*.42+30,n,24,'#1b150a');s+=rect(cx,cy+ch-14,cw,14,'#000','fill-opacity=".35"')}
 s+=`<g transform="translate(700,0)">`;
 // command center wall: monitors + sign + wall map
 s+=rect(3060,520,980,720,'#171b1f','stroke="#06080a" stroke-width="10"');
 s+=rect(3100,300,900,110,'#0b2a46','stroke="#03101c" stroke-width="6"')+txt(3550,378,'CENTRO DE MANDO',64,'#cfe9ff','letter-spacing="8"');
 for(let i=0;i<3;i++){const mx=3090+i*320,live=.5+.5*Math.sin(t*7+i*2);s+=rect(mx,540,290,190,'#06090c','stroke="#2a3036" stroke-width="6"')+rect(mx+10,550,270,170,i===1?'#2a1a14':'#0e2a20','fill-opacity="'+(.7+.2*live).toFixed(2)+'"');
  if(i===0)for(let k=0;k<6;k++)s+=rect(mx+20,560+k*26,100+rn(k+Math.floor(t*4))*130,10,'#7fffbf','fill-opacity=".6"');
  if(i===1){s+=`<path d="M${mx+30},700 L${mx+90},620 L${mx+150},660 L${mx+220},580 L${mx+260},640" stroke="#ff7a2a" stroke-width="6" fill="none"/><circle cx="${mx+220}" cy="580" r="${f(10+8*live)}" fill="#ff2a1a"/>`}
  if(i===2)for(let k=0;k<30;k++)s+=rect(mx+10+rn(k+Math.floor(t*12))*260,550+rn(k*3+Math.floor(t*12))*160,14,6,'#fff','fill-opacity=".35"')}
 // wall map
 {const mx=3100,my=770,mw=880,mh=420;const u=o.mapU||0;s+=rect(mx,my,mw,mh,'#d8cfae','stroke="#3a321a" stroke-width="8"');
  s+=rect(mx,my,mw,mh,'#8a7a4a','fill-opacity=".12"');
  for(let i=1;i<8;i++)s+=`<line x1="${mx+i*110}" y1="${my}" x2="${mx+i*110}" y2="${my+mh}" stroke="#6a5a2a" stroke-width="2" stroke-opacity=".5"/>`;
  for(let i=1;i<4;i++)s+=`<line x1="${mx}" y1="${my+i*105}" x2="${mx+mw}" y2="${my+i*105}" stroke="#6a5a2a" stroke-width="2" stroke-opacity=".5"/>`;
  s+=`<path d="M${mx+20},${my+330} Q${mx+250},${my+250} ${mx+440},${my+300} T${mx+860},${my+200}" stroke="#2a6ac8" stroke-width="12" fill="none" stroke-opacity=".7"/>`;
  s+=`<path d="M${mx+60},${my+60} L${mx+300},${my+150} L${mx+520},${my+110} L${mx+820},${my+90}M${mx+300},${my+150} L${mx+380},${my+390}" stroke="#4a3a1a" stroke-width="6" fill="none"/>`;
  s+=`<circle cx="${mx+330}" cy="${my+210}" r="${f(120+10*Math.sin(t*3))}" fill="#c8302a" fill-opacity=".3" stroke="#c8302a" stroke-width="6" stroke-dasharray="14 10"/>`;
  s+=txt(mx+330,my+226,'ZONA ROJA',34,'#7a1410');
  const hx=mx+740,hy=my+110;s+=`<circle cx="${hx}" cy="${hy}" r="38" fill="#fff" stroke="#0a3a8a" stroke-width="8"/>`+txt(hx,hy+16,'H',46,'#0a3a8a');
  s+=txt(hx,hy+70,'AZOTEA',24,'#0a3a8a');
  if(u>0){const k=clamp(u);s+=`<path d="M${mx+330},${my+300} Q${mx+520},${my+260} ${hx-10},${hy+40}" stroke="#0a3a8a" stroke-width="10" fill="none" stroke-dasharray="22 14" stroke-opacity="${k.toFixed(2)}"/><circle cx="${hx}" cy="${hy}" r="${f(60+30*Math.sin(t*6))}" fill="none" stroke="#0a3a8a" stroke-width="5" stroke-opacity="${(k*.7).toFixed(2)}"/>`}
 }
 // ceiling camera over the table
 {const cx=3560,cy=480;s+=rect(cx-8,330,16,120,'#14171a')+`<ellipse cx="${cx}" cy="${cy}" rx="50" ry="34" fill="#1e2226" stroke="#06080a" stroke-width="6"/><ellipse cx="${cx}" cy="${cy+10}" rx="26" ry="18" fill="#05070a"/><circle cx="${cx+30}" cy="${cy-6}" r="8" fill="${Math.sin(t*5)>0?'#ff2a1a':'#4a0e0a'}"/><circle cx="${cx+30}" cy="${cy-6}" r="60" fill="url(#redGl5)" fill-opacity="${(.35*(Math.sin(t*5)>0?1:.1)).toFixed(2)}"/>`}
 s+=`</g>`;
 // floor
 s+=rect(-1500,FL,9000,900,'url(#bkFloor)')+rect(-1500,FL,9000,10,'#000','fill-opacity=".6"');
 for(let k=-4;k<22;k++)s+=`<polygon points="${k*300},${FL} ${k*300+6},${FL} ${k*300+(k-6)*55},2300 ${k*300+(k-6)*55-8},2300" fill="#000" fill-opacity=".28"/>`;
 for(let r=0;r<5;r++)s+=rect(-1500,FL+30+r*r*34,9000,3,'#000','fill-opacity=".28"');
 s+=rect(-1500,FL+90,9000,16,'#d8b82a','fill-opacity=".35"');
 for(const [x,i] of [[1300,1],[3000,3],[3850,4]]){s+=`<ellipse cx="${x}" cy="${FL+80}" rx="300" ry="24" fill="#e8f4ff" fill-opacity="${(.16*flick(t,i+9)).toFixed(2)}"/>`}
 // puddle with light of the open door
 if((o.doorU||0)<1)s+=`<ellipse cx="900" cy="${FL+60}" rx="520" ry="34" fill="#f4f9ff" fill-opacity="${(.3*(1-(o.doorU||0))).toFixed(2)}"/>`;
 return s}
// foreground table (drawn over characters standing behind it): table, radio, cap, keys, lamp
export function table(t,o){let s='<g transform="translate(700,0)">';const x0=3480,w=620,y=FL-470;
 s+=rect(x0,y,w,26,'#5a6068','stroke="#06080a" stroke-width="6"')+rect(x0,y,w,8,'#fff','fill-opacity=".18"')+rect(x0+20,y+26,16,444,'#4a5058')+rect(x0+w-36,y+26,16,444,'#4a5058')+rect(x0+30,y+26,w-60,12,'#000','fill-opacity=".3"');
 s+=`<ellipse cx="${x0+w/2}" cy="${FL+8}" rx="${w*.62}" ry="20" fill="#000" fill-opacity=".5"/>`;
 // radio (blinks when active)
 const on=o.radio||0;const bl=on>0?(Math.sin(t*14)>0?1:.3):0;
 s+=`<g transform="translate(${x0+90},${y})">`+rect(0,-150,190,150,'#2d3a2a','stroke="#06080a" stroke-width="6"')+rect(14,-136,100,70,'#0a120a')+`<circle cx="64" cy="-100" r="${on>0?26:0}" fill="#7fff9f" fill-opacity="${(.5*bl).toFixed(2)}"/>`+rect(126,-130,48,12,'#8a9099')+rect(126,-108,48,12,'#8a9099')+rect(126,-86,48,12,'#8a9099')+`<circle cx="46" cy="-34" r="14" fill="#14171a"/><circle cx="96" cy="-34" r="14" fill="#14171a"/><rect x="150" y="-34" width="22" height="14" fill="${on>0&&Math.sin(t*14)>0?'#ff2a1a':'#4a1410'}"/>`;
 s+=`<line x1="170" y1="-150" x2="200" y2="-340" stroke="#9aa2ac" stroke-width="7"/><circle cx="200" cy="-340" r="6" fill="#ff2a1a" fill-opacity="${(.4+.5*bl).toFixed(2)}"/>`;
 if(on>0)s+=`<circle cx="95" cy="-90" r="210" fill="url(#amberGl5)" fill-opacity="${(.2*bl).toFixed(2)}"/>`;
 s+=`</g>`;
 // lamp
 s+=`<g transform="translate(${x0+w-110},${y})">${rect(-5,-120,10,120,'#14171a')}<path d="M-5,-120 L70,-150 L70,-110Z" fill="#2a2e32"/><circle cx="70" cy="-120" r="150" fill="url(#amberGl5)" fill-opacity="${(.5*flick(t,11)).toFixed(2)}"/></g>`;
 // items placed by the sergeant: cap + keys with ID badge
 const p=clamp(o.place||0);if(p>0){const dy=(1-p)*-60;
  s+=`<g transform="translate(${x0+330},${y+dy})"><path d="M-60,0 Q-60,-52 0,-54 Q60,-52 60,0Z" fill="#1f3a6a" stroke="#06080a" stroke-width="5"/><path d="M40,-4 Q110,-8 118,10 Q70,16 40,6Z" fill="#162a50" stroke="#06080a" stroke-width="5"/><rect x="-22" y="-40" width="44" height="26" rx="5" fill="#e8d9b0" stroke="#06080a" stroke-width="3"/><text x="0" y="-21" font-family="Inter" font-weight="900" font-size="15" fill="#14100a" text-anchor="middle">PORTERO</text></g>`;
  s+=`<g transform="translate(${x0+470},${y-4+dy})"><circle cx="0" cy="-16" r="20" fill="none" stroke="#d6d9df" stroke-width="6"/><rect x="-6" y="0" width="12" height="46" rx="4" fill="#e8c24a" stroke="#0a0a0c" stroke-width="3" transform="rotate(-70)"/><rect x="-6" y="0" width="12" height="40" rx="4" fill="#a9adb4" stroke="#0a0a0c" stroke-width="3" transform="rotate(-100)"/><rect x="14" y="-28" width="62" height="30" rx="6" fill="#b8281f" stroke="#0a0a0c" stroke-width="3"/><text x="45" y="-6" font-family="Inter" font-weight="900" font-size="22" fill="#fff" text-anchor="middle">3</text></g>`}
 s+='</g>';return s}
