import json,glob,os
m={}
for f in sorted(glob.glob('bun/meta_*.json'), key=lambda p:(p!='bun/meta_old.json', p)):
    m.update(json.load(open(f)))
ok={k:v for k,v in m.items() if os.path.exists('bun/b%04d.png'%int(k))}
open('bun/meta.js','w').write('const META='+json.dumps({int(k):v for k,v in ok.items()})+';')
print(len(ok),'cuadros con imagen')
