import {Resvg} from '@resvg/resvg-js';import fs from 'fs';
import {CAST,defs} from '../body.mjs';
import {handSkin,handProf,setCTM,T} from '../char.mjs';
const st=CAST[process.argv[2]||'diego'];let s='';
const items=[['open',()=>handSkin('open',st)],['relax',()=>handProf('free',st)],['point',()=>handProf('point',st)]];
items.forEach(([n,fn],i)=>{const x=200+i*330;setCTM([5,0,0,5,x,300]);const h=fn();setCTM([1,0,0,1,0,0]);s+=`<g transform="translate(${x},300) scale(5)">${h}</g>`});
fs.writeFileSync('build/ep4/hands.png',new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="600"><rect width="1100" height="600" fill="#2a2d33"/>${defs(st)}${s}</svg>`).render().asPng());
