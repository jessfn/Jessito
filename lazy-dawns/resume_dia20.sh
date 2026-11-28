#!/bin/bash
# Reanuda el render del dia 14 por trozos de 120 cuadros (cada trozo se guarda; si se corta, se vuelve a correr y salta los terminados)
cd "$(dirname "$0")"; mkdir -p build/dia20/ch; node render_dia20.mjs preview 1 >/dev/null 2>&1; python3 build_audio_dia20.py
TOTAL=$(python3 -c "import json;print(round(json.load(open('build/dia20/timeline.json'))['DUR']*60))")
N=120; i=0; list=""
for ((a=0; a<TOTAL; a+=N)); do b=$((a+N)); [ $b -gt $TOTAL ] && b=$TOTAL; f=$(printf "build/dia20/ch/c%03d.mp4" $i); echo "file '$PWD/$f'" >> /tmp/ch_list_$$; i=$((i+1)); done
for p in 0 1 2 3; do (
  j=0; for ((a=0; a<TOTAL; a+=N)); do b=$((a+N)); [ $b -gt $TOTAL ] && b=$TOTAL; f=$(printf "build/dia20/ch/c%03d.mp4" $j)
    if [ $((j % 4)) -eq $p ] && [ ! -s $f ]; then node render_dia20.mjs $a $b $f.tmp.mp4 >/dev/null 2>&1 && mv $f.tmp.mp4 $f; fi; j=$((j+1)); done ) &
done; wait
ls build/dia20/ch/c*.mp4 | grep -v tmp | sort | sed "s#^#file '$PWD/#; s#\$#'#" > build/dia20/chlist.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/dia20/chlist.txt -c copy build/dia20/video_mudo.mp4
ffmpeg -y -loglevel error -i build/dia20/video_mudo.mp4 -i build/dia20/audio_final.wav -af loudnorm=I=-14:TP=-1.5:LRA=9 -c:v copy -c:a aac -b:a 192k -shortest build/dia20/LazyDawns_Dia20.mp4
echo TERMINADO > build/dia20/done.txt
