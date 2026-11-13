import {Resvg} from '@resvg/resvg-js';import fs from 'fs';import {colossus,defsMonster} from './monster.mjs';
let s='';[[0,{jaw:0,look:[-.6,.5]}],[1.5,{jaw:.5,look:[-.8,.3],headAng:-.35}],[3,{jaw:1,look:[-1,.2],headAng:-.5,headX:-300,headY:-700}]].forEach(([t,o],i)=>{s+=`<g transform="translate(${450+i*900},1250) scale(.2)">${colossus(t,o)}</g>`});
fs.writeFileSync('build/ep6/mon.png',new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="2700" height="1300"><rect width="2700" height="1300" fill="#2a1410"/>${defsMonster}${s}</svg>`,{font:{loadSystemFonts:true}}).render().asPng());
