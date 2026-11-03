// Animales kawaii de la granja (SVG plano). animal(k,R,o): k 0..5, R radio base, o={mouth:0..1, blink:0..1, t}
const AF=n=>n.toFixed(1);
const A_COL=['#ffffff','#ff5a5f','#e9e3f5','#ffd23f','#ffa9c4','#b97a3e'];
function A_eye(x,y,r,blink,dark='#2b1d3a'){const ry=Math.max(.12,1-blink)*r*1.25;return `<g transform="translate(${AF(x)} ${AF(y)})"><ellipse rx="${AF(r)}" ry="${AF(ry)}" fill="${dark}"/><circle cx="${AF(-r*.3)}" cy="${AF(-ry*.35)}" r="${AF(r*.32)}" fill="#fff" opacity="${blink>.6?0:1}"/></g>`}
function A_blush(x,y,R){return `<ellipse cx="${AF(x)}" cy="${AF(y)}" rx="${AF(R*.13)}" ry="${AF(R*.075)}" fill="#ff8fb7" opacity=".7"/>`}
function A_mouth(x,y,w,open,col='#7b1f3a'){ // sonrisa cerrada o boca abierta con lengua
 if(open<.08)return `<path d="M${AF(x-w*.5)} ${AF(y)} Q${AF(x)} ${AF(y+w*.42)} ${AF(x+w*.5)} ${AF(y)}" stroke="#3b2a4a" stroke-width="${AF(w*.1)}" fill="none" stroke-linecap="round"/>`;
 const h=w*.2+w*.65*open;return `<g><path d="M${AF(x-w*.5)} ${AF(y)} Q${AF(x)} ${AF(y+w*.08)} ${AF(x+w*.5)} ${AF(y)} Q${AF(x+w*.46)} ${AF(y+h)} ${AF(x)} ${AF(y+h*1.05)} Q${AF(x-w*.46)} ${AF(y+h)} ${AF(x-w*.5)} ${AF(y)}Z" fill="${col}"/><ellipse cx="${AF(x)}" cy="${AF(y+h*.78)}" rx="${AF(w*.28)}" ry="${AF(h*.26)}" fill="#ff7a9a"/></g>`}
function animal(k,R,o={}){const m=o.mouth||0,b=o.blink||0,t=o.t||0,wig=Math.sin(t*4)*3;let s='';
 if(k===0){ // vaca
  s+=`<g transform="translate(${AF(-R*1.0)} ${AF(-R*.45)}) rotate(${AF(-28+wig)})"><ellipse rx="${AF(R*.3)}" ry="${AF(R*.2)}" fill="#3b2f33"/><ellipse rx="${AF(R*.18)}" ry="${AF(R*.1)}" fill="#ffb3c1"/></g><g transform="translate(${AF(R*1.0)} ${AF(-R*.45)}) rotate(${AF(28-wig)})"><ellipse rx="${AF(R*.3)}" ry="${AF(R*.2)}" fill="#3b2f33"/><ellipse rx="${AF(R*.18)}" ry="${AF(R*.1)}" fill="#ffb3c1"/></g>`;
  s+=`<ellipse cx="${AF(-R*.5)}" cy="${AF(-R*.9)}" rx="${AF(R*.11)}" ry="${AF(R*.2)}" fill="#f1d9a6" transform="rotate(-14 ${AF(-R*.5)} ${AF(-R*.9)})"/><ellipse cx="${AF(R*.5)}" cy="${AF(-R*.9)}" rx="${AF(R*.11)}" ry="${AF(R*.2)}" fill="#f1d9a6" transform="rotate(14 ${AF(R*.5)} ${AF(-R*.9)})"/>`;
  s+=`<ellipse rx="${AF(R*.95)}" ry="${AF(R*.9)}" fill="#fff"/><path d="M${AF(-R*.78)} ${AF(-R*.35)} q${AF(R*.15)} ${AF(-R*.4)} ${AF(R*.45)} ${AF(-R*.3)} q${AF(R*.1)} ${AF(R*.3)} ${AF(-R*.2)} ${AF(R*.42)} q${AF(-R*.25)} ${AF(R*.05)} ${AF(-R*.25)} ${AF(-R*.12)}Z" fill="#2b2430"/><ellipse cx="${AF(R*.62)}" cy="${AF(R*.05)}" rx="${AF(R*.2)}" ry="${AF(R*.26)}" fill="#2b2430" transform="rotate(20 ${AF(R*.62)} ${AF(R*.05)})"/>`;
  s+=A_eye(-R*.38,-R*.1,R*.085,b)+A_eye(R*.38,-R*.1,R*.085,b)+A_blush(-R*.62,R*.22,R)+A_blush(R*.62,R*.22,R);
  s+=`<ellipse cy="${AF(R*.5)}" rx="${AF(R*.55)}" ry="${AF(R*.36)}" fill="#ffc2d1"/><ellipse cx="${AF(-R*.2)}" cy="${AF(R*.42)}" rx="${AF(R*.07)}" ry="${AF(R*.1)}" fill="#d98aa0"/><ellipse cx="${AF(R*.2)}" cy="${AF(R*.42)}" rx="${AF(R*.07)}" ry="${AF(R*.1)}" fill="#d98aa0"/>`+A_mouth(0,R*.62,R*.3,m)}
 else if(k===1){ // gallo
  s+=`<g fill="#e53935"><circle cx="${AF(-R*.3)}" cy="${AF(-R*.92)}" r="${AF(R*.26)}"/><circle cx="0" cy="${AF(-R*1.06)}" r="${AF(R*.31)}"/><circle cx="${AF(R*.3)}" cy="${AF(-R*.92)}" r="${AF(R*.26)}"/></g>`;
  s+=`<ellipse rx="${AF(R*.88)}" ry="${AF(R*.9)}" fill="#fff6e6"/><path d="M${AF(-R*.88)} ${AF(R*.1)} q${AF(-R*.2)} ${AF(R*.1)} ${AF(-R*.1)} ${AF(R*.3)} q${AF(R*.1)} ${AF(R*.05)} ${AF(R*.2)} ${AF(-R*.05)}Z" fill="#ffe0b2"/>`;
  s+=A_eye(-R*.36,-R*.15,R*.09,b)+A_eye(R*.36,-R*.15,R*.09,b)+A_blush(-R*.6,R*.2,R)+A_blush(R*.6,R*.2,R);
  const d=m*R*.22;s+=`<ellipse cx="0" cy="${AF(R*.5+d*.5)}" rx="${AF(R*.12)}" ry="${AF(R*.17)}" fill="#e53935"/>`;
  if(m>.08)s+=`<path d="M${AF(-R*.22)} ${AF(R*.22)} L${AF(R*.22)} ${AF(R*.22)} L${AF(R*.16)} ${AF(R*.4+d)} L${AF(-R*.16)} ${AF(R*.4+d)}Z" fill="#7b1f3a"/><path d="M${AF(-R*.2)} ${AF(R*.4+d)} L${AF(R*.2)} ${AF(R*.4+d)} L0 ${AF(R*.58+d)}Z" fill="#ffa000" stroke="#ffa000" stroke-width="${AF(R*.05)}" stroke-linejoin="round"/>`;
  s+=`<path d="M${AF(-R*.22)} ${AF(R*.08)} L${AF(R*.22)} ${AF(R*.08)} L0 ${AF(R*.3)}Z" fill="#ffa000" stroke="#ffa000" stroke-width="${AF(R*.06)}" stroke-linejoin="round"/>`}
 else if(k===2){ // oveja
  const wool=[[-.55,-.5],[0,-.7],[.55,-.5],[-.72,0],[.72,0],[-.55,.5],[.55,.5],[0,.72],[-.25,-.35],[.25,-.35]];
  s+=`<g fill="#fff">${wool.map(p=>`<circle cx="${AF(p[0]*R)}" cy="${AF(p[1]*R)}" r="${AF(R*.36)}"/>`).join('')}<circle r="${AF(R*.7)}"/></g>`;
  s+=`<g transform="translate(${AF(-R*.62)} ${AF(R*.0)}) rotate(${AF(-25+wig)})"><ellipse rx="${AF(R*.22)}" ry="${AF(R*.13)}" fill="#4a4458"/></g><g transform="translate(${AF(R*.62)} ${AF(R*.0)}) rotate(${AF(25-wig)})"><ellipse rx="${AF(R*.22)}" ry="${AF(R*.13)}" fill="#4a4458"/></g>`;
  s+=`<ellipse cy="${AF(R*.12)}" rx="${AF(R*.55)}" ry="${AF(R*.64)}" fill="#4f4960"/><circle cy="${AF(-R*.52)}" r="${AF(R*.3)}" fill="#fff"/>`;
  s+=A_eye(-R*.22,-R*.05,R*.085,b,'#fff')+A_eye(R*.22,-R*.05,R*.085,b,'#fff');s+=`<circle cx="${AF(-R*.22)}" cy="${AF(-R*.03)}" r="${AF(R*.045)}" fill="#2b1d3a"/><circle cx="${AF(R*.22)}" cy="${AF(-R*.03)}" r="${AF(R*.045)}" fill="#2b1d3a"/>`;
  s+=A_blush(-R*.38,R*.2,R)+A_blush(R*.38,R*.2,R)+`<ellipse cy="${AF(R*.22)}" rx="${AF(R*.1)}" ry="${AF(R*.065)}" fill="#ff9db8"/>`+A_mouth(0,R*.38,R*.26,m,'#7b1f3a')}
 else if(k===3){ // pato
  s+=`<path d="M${AF(-R*.12)} ${AF(-R*.85)} q${AF(-R*.1)} ${AF(-R*.3)} ${AF(R*.1)} ${AF(-R*.22)} M${AF(R*.05)} ${AF(-R*.88)} q${AF(R*.05)} ${AF(-R*.34)} ${AF(R*.22)} ${AF(-R*.2)}" stroke="#ffd23f" stroke-width="${AF(R*.1)}" fill="none" stroke-linecap="round"/>`;
  s+=`<circle r="${AF(R*.9)}" fill="#ffd23f"/><ellipse cx="${AF(-R*.3)}" cy="${AF(-R*.5)}" rx="${AF(R*.22)}" ry="${AF(R*.1)}" fill="#fff" opacity=".35" transform="rotate(-25 ${AF(-R*.3)} ${AF(-R*.5)})"/>`;
  s+=A_eye(-R*.36,-R*.18,R*.09,b)+A_eye(R*.36,-R*.18,R*.09,b)+A_blush(-R*.6,R*.18,R)+A_blush(R*.6,R*.18,R);
  const d=m*R*.28;s+=`<ellipse cx="0" cy="${AF(R*.5+d*.6)}" rx="${AF(R*.5)}" ry="${AF(R*.16+d*.2)}" fill="${m>.08?'#7b1f3a':'#ff9a1f'}"/>`;
  s+=`<ellipse cx="0" cy="${AF(R*.28)}" rx="${AF(R*.52)}" ry="${AF(R*.2)}" fill="#ff9a1f"/><circle cx="${AF(-R*.16)}" cy="${AF(R*.25)}" r="${AF(R*.04)}" fill="#c76a00"/><circle cx="${AF(R*.16)}" cy="${AF(R*.25)}" r="${AF(R*.04)}" fill="#c76a00"/>`}
 else if(k===4){ // cerdito
  s+=`<g transform="translate(${AF(-R*.62)} ${AF(-R*.72)}) rotate(${AF(-28+wig)})"><polygon points="${AF(-R*.28)},${AF(R*.2)} ${AF(R*.28)},${AF(R*.2)} 0,${AF(-R*.3)}" fill="#ff8fb3" stroke="#ff8fb3" stroke-width="${AF(R*.12)}" stroke-linejoin="round"/></g><g transform="translate(${AF(R*.62)} ${AF(-R*.72)}) rotate(${AF(28-wig)})"><polygon points="${AF(-R*.28)},${AF(R*.2)} ${AF(R*.28)},${AF(R*.2)} 0,${AF(-R*.3)}" fill="#ff8fb3" stroke="#ff8fb3" stroke-width="${AF(R*.12)}" stroke-linejoin="round"/></g>`;
  s+=`<ellipse rx="${AF(R*.95)}" ry="${AF(R*.88)}" fill="#ffa9c4"/>`+A_eye(-R*.4,-R*.15,R*.09,b)+A_eye(R*.4,-R*.15,R*.09,b)+A_blush(-R*.66,R*.2,R)+A_blush(R*.66,R*.2,R);
  s+=`<ellipse cy="${AF(R*.22)}" rx="${AF(R*.44)}" ry="${AF(R*.31)}" fill="#ff82a9"/><ellipse cx="${AF(-R*.15)}" cy="${AF(R*.22)}" rx="${AF(R*.07)}" ry="${AF(R*.11)}" fill="#b83b68"/><ellipse cx="${AF(R*.15)}" cy="${AF(R*.22)}" rx="${AF(R*.07)}" ry="${AF(R*.11)}" fill="#b83b68"/>`+A_mouth(0,R*.62,R*.34,m)}
 else { // caballo
  s+=`<g fill="#b97a3e"><polygon points="${AF(-R*.62)},${AF(-R*.65)} ${AF(-R*.32)},${AF(-R*.7)} ${AF(-R*.48)},${AF(-R*1.2)}" stroke="#b97a3e" stroke-width="${AF(R*.08)}" stroke-linejoin="round"/><polygon points="${AF(R*.62)},${AF(-R*.65)} ${AF(R*.32)},${AF(-R*.7)} ${AF(R*.48)},${AF(-R*1.2)}" stroke="#b97a3e" stroke-width="${AF(R*.08)}" stroke-linejoin="round"/></g>`;
  s+=`<path d="M${AF(-R*.75)} ${AF(-R*.55)} Q${AF(-R*.95)} ${AF(R*.2)} ${AF(-R*.62)} ${AF(R*.7)} L${AF(-R*.5)} ${AF(R*.1)}Z M${AF(R*.75)} ${AF(-R*.55)} Q${AF(R*.95)} ${AF(R*.2)} ${AF(R*.62)} ${AF(R*.7)} L${AF(R*.5)} ${AF(R*.1)}Z" fill="#4a2a14"/>`;
  s+=`<ellipse rx="${AF(R*.74)}" ry="${AF(R*1.0)}" fill="#b97a3e"/><path d="M${AF(-R*.5)} ${AF(-R*.95)} Q0 ${AF(-R*1.3)} ${AF(R*.5)} ${AF(-R*.95)} Q${AF(R*.2)} ${AF(-R*.55)} 0 ${AF(-R*.6)} Q${AF(-R*.2)} ${AF(-R*.55)} ${AF(-R*.5)} ${AF(-R*.95)}Z" fill="#4a2a14"/><ellipse cy="${AF(-R*.05)}" rx="${AF(R*.15)}" ry="${AF(R*.55)}" fill="#fff" opacity=".9"/>`;
  s+=A_eye(-R*.42,-R*.18,R*.085,b)+A_eye(R*.42,-R*.18,R*.085,b)+A_blush(-R*.52,R*.2,R)+A_blush(R*.52,R*.2,R);
  s+=`<ellipse cy="${AF(R*.62)}" rx="${AF(R*.5)}" ry="${AF(R*.33)}" fill="#d9a066"/><ellipse cx="${AF(-R*.2)}" cy="${AF(R*.56)}" rx="${AF(R*.06)}" ry="${AF(R*.09)}" fill="#7a4a1d"/><ellipse cx="${AF(R*.2)}" cy="${AF(R*.56)}" rx="${AF(R*.06)}" ry="${AF(R*.09)}" fill="#7a4a1d"/>`+A_mouth(0,R*.8,R*.3,m)}
 return s}
