import {Resvg} from '@resvg/resvg-js';import fs from 'fs';
import {CAST,body,defs} from './body.mjs';
const names=Object.keys(CAST);let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="900" viewBox="0 0 1800 900"><rect width="1800" height="900" fill="#1a232d"/>`;
const poses=[{R:{w:[400,250],hand:'grip',prop:'bottle'},expr:'smile',talk:.8,head:{rot:-4}},{L:{w:[230,330],hand:'grip',prop:'cup'},R:{w:[372,300],hand:'open'},expr:'neutral',talk:.4},{L:{w:[225,290],hand:'open'},R:{w:[275,290],hand:'open'},expr:'fear',head:{rot:3}},{R:{w:[330,300],hand:'grip',prop:'cup'},expr:'surprise',look:[1,0]}];
names.forEach((n,i)=>{const st=CAST[n];s+=`<g transform="translate(${i*450},30) scale(.9)">${defs(st)}${body(st,poses[i])}</g>`});
s+='</svg>';
fs.writeFileSync('/tmp/claude-0/t.svg',s);
const t=Date.now();const png=new Resvg(s,{font:{loadSystemFonts:true}}).render().asPng();console.log('ms',Date.now()-t);fs.writeFileSync('test_char.png',png);
