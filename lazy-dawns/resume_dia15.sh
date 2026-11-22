#!/bin/bash
# Reanuda el render del dia 14 por trozos de 120 cuadros (cada trozo se guarda; si se corta, se vuelve a correr y salta los terminados)
cd "$(dirname "$0")"; mkdir -p build/dia15/ch; node render_dia15.mjs preview 1 >/dev/null 2>&1; python3 build_audio_dia15.py
TOTAL=$(python3 -c "import json;print(round(json.load(open('build/dia15/timeline.json'))['DUR']*30))")
N=120; i=0; list=""
for ((a=0; a<TOTAL; a+=N)); do b=$((a+N)); [ $b -gt $TOTAL ] && b=$TOTAL; f=$(printf "build/dia15/ch/c%03d.mp4" $i); echo "file '$PWD/$f'" >> /tmp/ch_list_$$; i=$((i+1)); done
for p in 0 1 2 3; do (
  j=0; for ((a=0; a<TOTAL; a+=N)); do b=$((a+N)); [ $b -gt $TOTAL ] && b=$TOTAL; f=$(printf "build/dia15/ch/c%03d.mp4" $j)
    if [ $((j % 4)) -eq $p ] && [ ! -s $f ]; then node render_dia15.mjs $a $b $f.tmp.mp4 >/dev/null 2>&1 && mv $f.tmp.mp4 $f; fi; j=$((j+1)); done ) &
done; wait
ls build/dia15/ch/c*.mp4 | grep -v tmp | sort | sed "s#^#file '$PWD/#; s#\$#'#" > build/dia15/chlist.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/dia15/chlist.txt -c copy build/dia15/video_mudo.mp4
ffmpeg -y -loglevel error -i build/dia15/video_mudo.mp4 -i build/dia15/audio_final.wav -c:v copy -c:a aac -b:a 192k -shortest LazyDawns_Dia13.mp4
echo TERMINADO > build/dia15/done.txt
