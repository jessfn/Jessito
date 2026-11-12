import json,subprocess,sys
OLD={'l1':11.0,'l2':16.0,'l3':20.0,'l4':25.0,'l5':27.6,'l6':31.4,'l7':34.0,'l8':38.0,'l9':42.2,'l10':45.5,'l11':52.5,'l12':55.6,'l13':59.2,'l14':69.0,'l15':70.8,'l16':73.6,'l17':83.0,'l18':85.0,'l19':88.8,'l20':94.5,'l21':97.0,'l22':105.0,'l23':109.5,'l24':112.6,'l25':117.0}
voz=sys.argv[1];gap=0.5
prev_end=0;delay=0;start={};anchors=[[0,0]]
for i in range(1,26):
    lid=f'l{i}';d=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'{voz}/{lid}.mp3'],capture_output=True,text=True).stdout)
    s=max(OLD[lid]+delay,prev_end+gap);delay=s-OLD[lid];start[lid]=round(s,2);anchors.append([OLD[lid],round(s,2)]);prev_end=s+d
json.dump({'start':start,'anchors':anchors,'delay':round(delay,2),'dur':round(136+delay,2)},open('ep1/timeline.json','w'))
print(json.dumps(start));print('delay',delay,'dur',136+delay)
