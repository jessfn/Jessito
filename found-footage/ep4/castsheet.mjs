import {Resvg} from '@resvg/resvg-js';import fs from 'fs';
import {CAST,body,defs} from '../body.mjs';import {setCTM} from '../char.mjs';
const who=['marta','lucia','sofi','sgt','beto','diego'];const yaws=[0,.8];let s='';
who.forEach((w,i)=>yaws.forEach((y,j)=>{const st=CAST[w];const pose={L:{w:[146,422],hand:'relax'},R:{w:[354,422],hand:'relax'},byaw:y,walk:{phase:.5,amp:0},expr:'neutral',look:[y,0],head:{yaw:0}};setCTM([1,0,0,1,0,0]);const b=body(st,pose);const sc=w==='sofi'?.4:.44;s+=`<g transform="translate(${20+(i*2+j)*200},20) scale(${sc})">${b}</g>`}));
fs.writeFileSync('build/ep4/cast.png',new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2440" height="360"><rect width="2440" height="360" fill="#33373f"/>${defs(CAST.diego)}${s}</svg>`,{font:{loadSystemFonts:true}}).render().asPng());
