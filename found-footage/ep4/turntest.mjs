import {Resvg} from '@resvg/resvg-js';import fs from 'fs';
import {CAST,body,defs} from '../body.mjs';import {setCTM,T,mul} from '../char.mjs';
const st=CAST.diego;let s='';
[0,.45,.8,1,-.8].forEach((y,i)=>{const pose={L:{w:[146,422],hand:'relax'},R:{w:[354,330],hand:'point'},byaw:y,walk:{phase:i*.9+.5,amp:1},expr:'worry',look:[y,0],head:{yaw:0}};
 setCTM([1,0,0,1,0,0]);const b=body(st,pose);s+=`<g transform="translate(${60+i*300},20) scale(.55)">${b}</g>`});
fs.writeFileSync('build/ep4/turn.png',new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1560" height="520"><rect width="1560" height="520" fill="#33373f"/>${defs(st)}${s}</svg>`,{font:{loadSystemFonts:true}}).render().asPng());
