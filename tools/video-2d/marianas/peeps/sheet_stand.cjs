const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const fs=require('fs');
const {StandingBodies}=require('./cjs/index.js');
let html='<body style="margin:0;background:#cfe6f5;display:flex;flex-wrap:wrap;font:14px sans-serif">';
for(const k of Object.keys(StandingBodies)){const C=require('./cjs/body/standing/'+k).default;const cfg=StandingBodies[k];
 const s=renderToStaticMarkup(React.createElement('svg',{xmlns:'http://www.w3.org/2000/svg',width:200,height:Math.round(200*cfg.height/cfg.width),viewBox:cfg.viewBox},React.createElement(C,{})));
 html+='<div style="width:210px;position:relative;margin:4px">'+s+'<b style="position:absolute;left:2px;bottom:2px;background:#fff8">'+k+' '+cfg.width+'x'+cfg.height+'</b></div>';}
fs.writeFileSync('stand.html',html);
