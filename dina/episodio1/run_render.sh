#!/bin/bash
cd "$(dirname "$0")"
N=1076
for i in 0 1 2 3; do s=$((i*269)); e=$(((i+1)*269)); [ $i -eq 3 ] && e=$N; PORT=$((8900+i)) node render.cjs range $s $e frames > /tmp/claude-0/r$i.log 2>&1 & done
wait
ffmpeg -y -v error -framerate 24 -i frames/f_%05d.jpg -i mix.wav -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest dina_ep1.mp4
echo ENCODED
