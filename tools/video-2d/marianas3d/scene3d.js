import {createRT,poseRT} from '/rt3d.js';import {THREE} from '/char3d.js';
const W=1080,H=1920,PPM=420;
const SCq=parseFloat(new URLSearchParams(location.search).get('s')||'1');
const glc=document.getElementById('glc');glc.width=Math.round(W*SCq);glc.height=Math.round(H*SCq);
const r=new THREE.WebGLRenderer({canvas:glc,antialias:true,alpha:true,preserveDrawingBuffer:true,premultipliedAlpha:true});r.setPixelRatio(1);r.setSize(glc.width,glc.height,false);r.outputColorSpace=THREE.SRGBColorSpace;r.setClearColor(0x000000,0);
const scene=new THREE.Scene();const cam=new THREE.OrthographicCamera(0,W,H,0,-3000,3000);cam.position.set(0,0,1500);
const hemi=new THREE.HemisphereLight(0xfff4ea,0x3b5f88,1.5);scene.add(hemi);
const key=new THREE.DirectionalLight(0xfff0e0,2.2);key.position.set(-600,1200,900);scene.add(key);
const rim=new THREE.DirectionalLight(0x9fd8ff,1.1);rim.position.set(900,300,-800);scene.add(rim);
const lamp=new THREE.PointLight(0xfff0c0,0,1800,1.2);scene.add(lamp);
const ch=await createRT({});scene.add(ch.holder);
const clampv=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
window.RT=ch;window.CH3D={canvas:glc,
  layout(P,rb){P.ppm=PPM;P.anchor=[rb[0],-rb[1],0];P.railW=[560,860,0];poseRT(ch,P);
    return {head:[ch.headW.x,-ch.headW.y],hips:[ch.hipsW.x,-ch.hipsW.y]};},
  render(c,D,subLamp,t){cam.left=c.fx-c.tx/c.z;cam.right=c.fx+(1080-c.tx)/c.z;cam.top=-(c.fy-c.ty/c.z);cam.bottom=-(c.fy+(1920-c.ty)/c.z);cam.updateProjectionMatrix();
    const deep=clampv(D/2500),shal=1-clampv(D/60);
    // colour of the ambient water light darkens and blues with depth
    hemi.color.setRGB(1-.62*deep,.95-.5*deep,.92-.3*deep);hemi.groundColor.setRGB(.2,.33-.18*deep,.45-.2*deep);hemi.intensity=1.5-.75*deep;
    key.intensity=(.6+1.7*shal)*(1-.7*deep)+.35;key.color.setRGB(1,.96-.1*(1-shal),.9-.2*(1-shal));
    rim.intensity=.6+.9*deep;rim.color.setRGB(.5,.8,1);
    if(subLamp){lamp.intensity=subLamp.i*4.5;lamp.position.set(subLamp.x,-subLamp.y,500);}else lamp.intensity=0;
    r.render(scene,cam);}};
await window.initAll();window.ready=1;
