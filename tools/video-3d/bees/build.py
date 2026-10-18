parts=['a_core.js','b_avatar.js','face_snip.js','c_face.js','d_meadow.js','e_market.js','f_wheat.js','g_choreo.js']
js='\n'.join(open('parts/'+p).read() for p in parts)
open('bee.js','w').write(js)
open('scene_bee.html','w').write('''<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:#000}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<canvas id=glc></canvas><canvas id=out width=1080 height=1920></canvas>
<script type="module" src="/bee.js"></script>''')
print(len(js))
