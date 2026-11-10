#!/bin/bash
# Renderiza el dia 1 en 4 partes en paralelo, mezcla el audio y une todo.
set -e
cd "$(dirname "$0")"
node render_dia01.mjs preview 1 >/dev/null     # genera timeline.json
TOTAL=$(python3 -c "import json;print(round(json.load(open('build/timeline.json'))['DUR']*30))")
Q=$(( (TOTAL + 3) / 4 ))
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='(sin(2*PI*55*t)*exp(-9*mod(t,0.5))*0.9 + (random(0)*2-1)*exp(-60*mod(t+0.25,0.25))*0.25)*0.5':s=44100:d=60" -ac 2 build/musica.wav
python3 build_audio.py
for i in 0 1 2 3; do
  node render_dia01.mjs $((i*Q)) $(( (i+1)*Q )) build/seg$i.mp4 > build/seg$i.log 2>&1 &
done
wait
printf "file 'seg0.mp4'\nfile 'seg1.mp4'\nfile 'seg2.mp4'\nfile 'seg3.mp4'\n" > build/segs.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/segs.txt -c copy build/video_mudo.mp4
ffmpeg -y -loglevel error -i build/video_mudo.mp4 -i build/audio_final.wav -c:v copy -c:a aac -b:a 192k -shortest LazyDawns_Dia01.mp4
echo TERMINADO
