#!/bin/bash
# Renderiza el dia 3 en 4 partes en paralelo y une video + audio.
set -e
cd "$(dirname "$0")"
node render_dia03.mjs preview 1 >/dev/null
TOTAL=$(python3 -c "import json;print(round(json.load(open('build/dia03/timeline.json'))['DUR']*30))")
Q=$(( (TOTAL + 3) / 4 ))
python3 build_audio03.py
for i in 0 1 2 3; do node render_dia03.mjs $((i*Q)) $(( (i+1)*Q )) build/dia03/seg$i.mp4 > build/dia03/seg$i.log 2>&1 & done
wait
printf "file 'seg0.mp4'\nfile 'seg1.mp4'\nfile 'seg2.mp4'\nfile 'seg3.mp4'\n" > build/dia03/segs.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/dia03/segs.txt -c copy build/dia03/video_mudo.mp4
ffmpeg -y -loglevel error -i build/dia03/video_mudo.mp4 -i build/dia03/audio_final.wav -c:v copy -c:a aac -b:a 192k -shortest LazyDawns_Dia03.mp4
echo TERMINADO
