// usage: node strip.mjs char t0 dt n  -> renders character only frames into one strip png via resvg
import {Resvg} from '@resvg/resvg-js';import fs from 'fs';
import {CAST,body,defs} from '../body.mjs';
const [,, ch,t0,dt,n,mode]=process.argv;
const m=await import('./render.mjs');
const KF=m.KF,kfAt=m.kfAt;
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${n*330}" height="640" viewBox="0 0 ${n*330} 640"><rect width="100%" height="100%" fill="#1a232d"/>${defs(CAST.beto)}`;
for(let i=0;i<n;i++){const t=+t0+i*+dt;const pose=kfAt(KF[ch],t);pose.expr='smile';s+=`<g transform="translate(${i*330-20},10) scale(.72)">${body(CAST[ch],pose)}</g><text x="${i*330+10}" y="630" fill="#fff" font-size="22">${t.toFixed(2)}</text>`}
s+='</svg>';fs.writeFileSync(`/tmp/claude-0/strip_${ch}.png`,new Resvg(s,{font:{loadSystemFonts:true}}).render().asPng());
