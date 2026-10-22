import sys
from PIL import Image
fs=sys.argv[2:];ims=[Image.open(f).resize((360,640)) for f in fs]
W=Image.new('RGB',(360*len(ims),640));[W.paste(im,(360*i,0)) for i,im in enumerate(ims)];W.save(sys.argv[1])
