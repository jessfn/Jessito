#!/bin/bash
cd /home/user/Jessito/found-footage
rm -f build/ep7/part_*.mp4
for i in 0 1 2 3; do node ep7/render.mjs part $i 4 > build/ep7/log_$i.txt 2>&1 & done; wait
cd build/ep7 && for i in 0 1 2 3; do echo "file part_$i.mp4"; done > list.txt && ffmpeg -y -v error -f concat -i list.txt -i mix.wav -c:v libx264 -preset medium -crf 27 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart capitulo7_v3.mp4
echo ALLDONE
