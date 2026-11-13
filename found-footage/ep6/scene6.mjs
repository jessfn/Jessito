// Chapter 6: rooftop at dawn. Layers: sky, smoke, skyline (parallax), tower + colossus, helicopter, roof foreground.
import {colossus,defsMonster,smokeBlob} from './monster.mjs';
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const f=n=>(+n).toFixed(1);const FL=1510;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const sstep=x=>{x=clamp(x);return x*x*(3-2*x)};
const rect=(x,y,w,h,fill,ex='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${ex}/>`;
const txt=(x,y,s,size,fill,ex='')=>`<text x="${f(x)}" y="${f(y)}" font-family="Inter" font-weight="900" font-size="${size}" fill="${fill}" text-anchor="middle" ${ex}>${s}</text>`;
const flick=(t,i)=>{const h=Math.sin(t*23+i*7.1)*Math.sin(t*9.3+i*2.7)+Math.sin(t*61+i)*.3;return h>-.15?1:.4};
export const defs6=defsMonster+`<defs>
<linearGradient id="skyD" gradientUnits="userSpaceOnUse" x1="0" y1="-3000" x2="0" y2="1300"><stop offset="0" stop-color="#0e0a1e"/><stop offset=".45" stop-color="#3a1c36"/><stop offset=".75" stop-color="#8a3a3a"/><stop offset="1" stop-color="#ff9a4a"/></linearGradient>
<radialGradient id="sunG"><stop offset="0" stop-color="#fff2c0"/><stop offset=".3" stop-color="#ffb060" stop-opacity=".85"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient>
<linearGradient id="roofG" gradientUnits="userSpaceOnUse" x1="0" y1="1510" x2="0" y2="2100"><stop offset="0" stop-color="#3a3a40"/><stop offset="1" stop-color="#101114"/></linearGradient>
<linearGradient id="hbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f9ff" stop-opacity=".75"/><stop offset="1" stop-color="#f4f9ff" stop-opacity=".05"/></linearGradient>
<radialGradient id="fireG6"><stop offset="0" stop-color="#ffb04a" stop-opacity=".9"/><stop offset=".5" stop-color="#ff5a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>
<linearGradient id="steel6" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b4048"/><stop offset=".5" stop-color="#5a6068"/><stop offset="1" stop-color="#2c3036"/></linearGradient>
<linearGradient id="heliBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6a48"/><stop offset=".6" stop-color="#3a4630"/><stop offset="1" stop-color="#1e2618"/></linearGradient>
</defs>`;
function building(x,w,h,seed,t,dark,glow){const top=1300-h;let s=rect(x,top,w,h+900,dark?'#0c0810':'#161018');
 s+=rect(x,top,w,10,'#ffb060','fill-opacity=".25"');for(let r=0;r<Math.floor(h/70);r++)for(let c=0;c<Math.floor(w/48);c++){const q=rn(seed*13+r*7+c*3);if(q<.22)s+=rect(x+8+c*48,top+24+r*70,26,36,q<.07?'#ff8a3a':'#ffd9a0','fill-opacity="'+(q<.07?.9*flick(t,seed+r+c):.5).toFixed(2)+'"')}
 if(glow)s+=`<ellipse cx="${f(x+w/2)}" cy="${f(top+30)}" rx="${f(w*.9)}" ry="160" fill="url(#fireG6)" fill-opacity=".4"/>`;return s}
export function sky(t,cx){let s=rect(-4000,-4000,14000,5600,'url(#skyD)');
 // sun rising behind smoke
 s+=`<circle cx="3000" cy="980" r="520" fill="url(#sunG)"/><circle cx="3000" cy="1010" r="120" fill="#ffe6a0" fill-opacity=".9"/>`;
 // smoke: soft billowing clouds (layered translucent ellipses) rising from fires on the horizon
 for(let k=0;k<9;k++){const x=-200+k*560+Math.sin(t*.1+k)*60;for(let j=0;j<7;j++){const yy=1250-j*230-((t*14+k*40)%60),rx=300+rn(k*3+j)*220+j*30,ry=150+rn(k+j*5)*90;const dx=Math.sin(t*.2+j+k)*50+j*20;const lit=Math.max(0,1-j*.22);s+=`<ellipse cx="${f(x+dx)}" cy="${f(yy)}" rx="${f(rx)}" ry="${f(ry)}" fill="#1c1218" fill-opacity="${(.42+.02*j).toFixed(2)}"/><ellipse cx="${f(x+dx)}" cy="${f(yy+ry*.45)}" rx="${f(rx*.8)}" ry="${f(ry*.35)}" fill="#ff7a3a" fill-opacity="${(.16*lit).toFixed(2)}"/>`}s+=`<ellipse cx="${f(x)}" cy="1250" rx="${f(520)}" ry="150" fill="url(#fireG6)" fill-opacity="${(.5*flick(t,k)).toFixed(2)}"/>`}
 // distant haze + birds/embers
 s+=rect(-4000,900,14000,420,'#ff9a5a','fill-opacity=".18"');
 for(let i=0;i<40;i++){const x=((rn(i)*5200+t*(20+rn(i+3)*40))%5600)-300,y=rn(i+7)*1300+(-t*30*(rn(i+9)))%1300;s+=`<circle cx="${f(x)}" cy="${f(((y%1300)+1300)%1300)}" r="${f(2+rn(i+2)*3)}" fill="#ffb060" fill-opacity="${(.25+.4*rn(i+4)).toFixed(2)}"/>`}
 return s}
export function skyline(t,cx){let s='';const par=(d)=>`<g transform="translate(${f((cx-1800)*d)},0)">`;
 s+=par(.12);for(let k=0;k<26;k++){const x=-400+k*230;s+=building(x,150+rn(k)*80,260+rn(k+3)*420,k,t,true,rn(k+9)<.2)}s+='</g>';
 s+=par(.25);for(let k=0;k<18;k++){const x=-500+k*330;s+=building(x,210+rn(k+11)*120,380+rn(k+13)*560,k+30,t,false,rn(k+19)<.25)}s+='</g>';
 return s}
// neighbour tower (monster climbs it)
export function tower(t,o){const x=3700,w=1500;let s=`<g>`+rect(x,-2800,w,5000,'#120c14')+rect(x,-2800,12,5000,'#ffb060','fill-opacity=".25"')+rect(x+w-14,-2800,14,5000,'#000','fill-opacity=".4"');
 for(let r=0;r<60;r++)for(let c=0;c<14;c++){const q=rn(r*17+c*5);const lit=q<.18;const y=-2700+r*95;s+=rect(x+24+c*104,y,70,56,lit?(q<.06?'#ff8a3a':'#ffd9a0'):'#05030a','fill-opacity="'+(lit?(.8*(q<.06?flick(t,r+c):1)):.9).toFixed(2)+'"')}
 // damage: broken floors + hanging cables near the monster's grip
 const dmg=o.damage||0;if(dmg>0){for(let k=0;k<6;k++){const px=x+60+k*180,py=300+k*70;s+=`<polygon points="${px},${py} ${px+140},${py+30} ${px+100},${py+170} ${px-20},${py+130}" fill="#05030a"/>`}}
 s+=`</g>`;return s}
// ---------- helicopter (Águila 1)
export function heli(t,o){const {x,y,sc=1,tilt=0,beam=0,cable=0,lamp=0}=o;let s=`<g transform="translate(${f(x)},${f(y)}) rotate(${f(tilt)}) scale(${f(sc)})">`;
 // searchlight beam (drawn first)
 if(beam>0)s+=`<polygon points="-240,60 -200,70 ${-200+o.bx},${o.by} ${-240+o.bx-380},${o.by}" fill="url(#hbeam)" fill-opacity="${(.5*beam).toFixed(2)}"/>`;
 // tail boom + tail rotor + stabilizer
 s+=`<path d="M200,-20 L900,-60 L900,-30 L200,30Z" fill="#2e3828" stroke="#0a0c08" stroke-width="6"/><path d="M880,-60 L980,-200 L1010,-190 L930,-40Z" fill="#2e3828" stroke="#0a0c08" stroke-width="6"/><path d="M780,-40 L840,-100 L860,-92 L820,-30Z" fill="#242c1e" stroke="#0a0c08" stroke-width="4"/>`;
 const ta=t*40;s+=`<g transform="translate(985,-200)"><ellipse rx="${f(14+Math.abs(Math.cos(ta))*10)}" ry="90" fill="#0a0c08" fill-opacity=".35"/><rect x="-6" y="-90" width="12" height="180" fill="#0a0c08" transform="rotate(${f(ta*30)})" fill-opacity=".5"/></g>`;
 // skids
 s+=`<path d="M-150,170 L260,170 M-90,130 L-110,170 M150,130 L170,170" stroke="#0a0c08" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-170,170 q-30,0 -22,-20 M280,170 q30,0 22,-20" stroke="#0a0c08" stroke-width="10" fill="none"/>`;
 // fuselage
 s+=`<path d="M-260,40 Q-250,-110 -90,-130 L200,-110 Q260,-80 250,50 Q220,130 60,140 L-120,135 Q-250,130 -260,40Z" fill="url(#heliBody)" stroke="#0a0c08" stroke-width="8"/>`;
 // cockpit glass
 s+=`<path d="M-250,30 Q-240,-100 -100,-118 L-40,-110 L-40,40 Z" fill="#0b1a28" stroke="#0a0c08" stroke-width="6"/><path d="M-230,-10 Q-225,-90 -120,-104" stroke="#9fd0ff" stroke-width="6" fill="none" opacity=".5"/><path d="M-200,40 L-110,-96" stroke="#fff" stroke-width="4" opacity=".18"/>`;
 // open side door with crewman silhouette
 s+=`<rect x="-20" y="-80" width="190" height="130" rx="8" fill="#05070a" stroke="#0a0c08" stroke-width="5"/><path d="M40,50 L40,-20 Q40,-60 80,-60 Q120,-60 120,-20 L120,50Z" fill="#161c14"/><circle cx="80" cy="-66" r="22" fill="#161c14"/><rect x="20" y="-18" width="150" height="10" fill="#0a0c08" opacity=".6"/>`;
 s+=`<rect x="-10" y="60" width="240" height="14" fill="#c8302a" opacity=".85"/>`+txt(110,58,'ÁGUILA 1',22,'#e8e8e8','opacity=".85"');
 // rotor mast + blades (motion blur)
 s+=`<rect x="20" y="-170" width="26" height="60" fill="#14170f"/>`;
 const ra=t*55;for(const k of[0,1]){const a=ra+k*Math.PI;const len=620*Math.abs(Math.cos(a))+40;s+=`<rect x="${f(33-len)}" y="-176" width="${f(len*2)}" height="8" rx="4" fill="#0a0c08" fill-opacity=".85"/>`}
 s+=`<ellipse cx="33" cy="-172" rx="660" ry="26" fill="#cfd6df" fill-opacity=".1"/><ellipse cx="33" cy="-172" rx="560" ry="14" fill="#0a0c08" fill-opacity=".18"/>`;
 // nav lights + searchlight lamp
 s+=`<circle cx="-258" cy="40" r="9" fill="#ff2a1a" fill-opacity="${(.4+.6*(Math.sin(t*6)>0?1:0)).toFixed(2)}"/><circle cx="240" cy="-60" r="9" fill="#3dff7a"/><circle cx="-215" cy="80" r="${f(14+lamp*8)}" fill="#fff"/><circle cx="-215" cy="80" r="${f(60*lamp+10)}" fill="url(#hbeam)" fill-opacity=".6"/>`;
 // winch cable + hook
 if(cable>0){const L=cable;s+=`<line x1="40" y1="130" x2="${f(40+Math.sin(t*1.7)*30*sc)}" y2="${f(130+L)}" stroke="#14170f" stroke-width="9"/><line x1="40" y1="130" x2="${f(40+Math.sin(t*1.7)*30*sc)}" y2="${f(130+L)}" stroke="#9aa2ac" stroke-width="3"/><path d="M${f(40+Math.sin(t*1.7)*30*sc-18)},${f(130+L)} q18,36 36,0" stroke="#c9ccd2" stroke-width="9" fill="none"/>`}
 s+=`</g>`;return s}
// ---------- roof foreground
export function roof(t,o){let s=rect(-1500,FL,9000,900,'url(#roofG)')+rect(-1500,FL,9000,10,'#000','fill-opacity=".55"');
 // tar/gravel texture + seams
 for(let k=-3;k<22;k++)s+=`<polygon points="${k*330},${FL} ${k*330+6},${FL} ${k*330+(k-7)*60},2300 ${k*330+(k-7)*60-8},2300" fill="#000" fill-opacity=".3"/>`;
 for(let r=0;r<5;r++)s+=rect(-1500,FL+30+r*r*34,9000,3,'#000','fill-opacity=".3"');
 for(let k=0;k<60;k++)s+=`<ellipse cx="${f(rn(k)*4200-200)}" cy="${f(FL+40+rn(k+3)*420)}" rx="${f(6+rn(k+5)*18)}" ry="3" fill="#8a8a90" fill-opacity=".25"/>`;
 // glow of fire on floor + sunrise
 s+=`<ellipse cx="3000" cy="${FL+40}" rx="1500" ry="90" fill="url(#fireG6)" fill-opacity=".4"/>`;
 return s}
export function roofBack(t,o){let s='';
 // stair bulkhead with the door they came through
 s+=rect(40,820,640,690,'#2a2e34','stroke="#0a0b0d" stroke-width="8"')+rect(40,800,660,30,'#14161a')+rect(60,870,600,16,'#fff','fill-opacity=".05"');
 const dop=o.doorOpen||0;s+=rect(250,1010,260,500,'#0a0c10');if(dop>0)s+=`<rect x="250" y="1010" width="260" height="500" fill="#ffd9a0" fill-opacity="${(.5*dop).toFixed(2)}"/>`;
 s+=`<polygon points="250,1010 ${f(250+260*Math.cos(dop*1.35))},${f(1010+8*dop)} ${f(250+260*Math.cos(dop*1.35))},${f(1510-6*dop)} 250,1510" fill="url(#steel6)" stroke="#06080a" stroke-width="6"/>`+txt(380,980,'AZOTEA',44,'#d8d2c0','opacity=".85"');
 s+=`<circle cx="380" cy="920" r="14" fill="#ff2a1a" fill-opacity="${(.4+.5*(Math.sin(t*5)>0?1:0)).toFixed(2)}"/>`;
 // AC units + pipes
 for(const [x,w,h] of [[800,260,200],[1080,200,150]]){s+=rect(x,FL-h,w,h,'#3a4046','stroke="#0a0b0d" stroke-width="6"')+rect(x,FL-h,w,12,'#fff','fill-opacity=".12"')+`<circle cx="${x+w/2}" cy="${FL-h/2}" r="${h*.3}" fill="#14161a"/>`+`<g transform="rotate(${f(t*200)} ${x+w/2} ${FL-h/2})"><rect x="${x+w/2-h*.28}" y="${FL-h/2-5}" width="${h*.56}" height="10" fill="#6a7078"/></g>`}
 // water tank on stilts
 s+=rect(1480,FL-520,24,520,'#2a2e34')+rect(1900,FL-520,24,520,'#2a2e34')+`<path d="M1450,${FL-760} L1960,${FL-760} L1960,${FL-520} Q1705,${FL-470} 1450,${FL-520}Z" fill="#4a3a2a" stroke="#0a0b0d" stroke-width="7"/><ellipse cx="1705" cy="${FL-760}" rx="255" ry="34" fill="#6a5a44" stroke="#0a0b0d" stroke-width="5"/><path d="M1480,${FL-700} L1480,${FL-540} M1930,${FL-700} L1930,${FL-540}" stroke="#2a1c10" stroke-width="6"/>`;
 // antenna mast + blinking red
 s+=`<line x1="3060" y1="${FL}" x2="3060" y2="${FL-1100}" stroke="#14161a" stroke-width="16"/><line x1="3000" y1="${FL-500}" x2="3120" y2="${FL-500}" stroke="#14161a" stroke-width="8"/><circle cx="3060" cy="${FL-1100}" r="14" fill="#ff2a1a" fill-opacity="${(Math.sin(t*3)>0?.95:.2).toFixed(2)}"/><circle cx="3060" cy="${FL-1100}" r="90" fill="url(#fireG6)" fill-opacity="${(Math.sin(t*3)>0?.5:.05).toFixed(2)}"/>`;
 return s}
// helipad painted on the roof (flat ellipse) + perimeter lights
export function pad(t,o){const cx=2350,cy=FL+80;let s=`<ellipse cx="${cx}" cy="${cy}" rx="620" ry="86" fill="#1c1e22" stroke="#d8d2c0" stroke-width="10"/><ellipse cx="${cx}" cy="${cy}" rx="540" ry="70" fill="none" stroke="#d8b82a" stroke-width="6" stroke-dasharray="40 24"/>`;
 s+=`<text x="${cx}" y="${cy+36}" font-family="Inter" font-weight="900" font-size="170" fill="#e8e8e8" fill-opacity=".85" text-anchor="middle" transform="translate(0,-8) scale(1,.5)" style="transform-origin:${cx}px ${cy}px">H</text>`;
 for(let k=0;k<12;k++){const a=k/12*6.28;const lx=cx+Math.cos(a)*620,ly=cy+Math.sin(a)*86;s+=`<circle cx="${f(lx)}" cy="${f(ly)}" r="9" fill="#3dff7a" fill-opacity="${(.5+.5*Math.sin(t*4+k)).toFixed(2)}"/><circle cx="${f(lx)}" cy="${f(ly)}" r="34" fill="#3dff7a" fill-opacity=".12"/>`}return s}
export const FLOOR=FL;
