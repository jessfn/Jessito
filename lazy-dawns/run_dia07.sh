#!/bin/bash
# Dia 5: 1080x1920, 30 fps. Render en 4 partes en paralelo.
set -e
cd "$(dirname "$0")"
node render_dia07.mjs preview 1 >/dev/null
TOTAL=$(python3 -c "import json;print(round(json.load(open('build/dia07/timeline.json'))['DUR']*30))")
Q=$(( (TOTAL + 3) / 4 ))
python3 build_audio07.py
for i in 0 1 2 3; do node render_dia07.mjs $((i*Q)) $(( (i+1)*Q )) build/dia07/seg$i.mp4 > build/dia07/seg$i.log 2>&1 & done
wait
printf "file 'seg0.mp4'\nfile 'seg1.mp4'\nfile 'seg2.mp4'\nfile 'seg3.mp4'\n" > build/dia07/segs.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/dia07/segs.txt -c copy build/dia07/video_mudo.mp4
ffmpeg -y -loglevel error -i build/dia07/video_mudo.mp4 -i build/dia07/audio_final.wav -c:v copy -c:a aac -b:a 192k -shortest LazyDawns_Dia07.mp4
echo TERMINADO
