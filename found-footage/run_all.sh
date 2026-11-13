#!/bin/bash
cd /home/user/Jessito/found-footage
rm -f build/ep5/part_*.mp4 build/ep4/part_*.mp4
for i in 0 1 2 3; do node ep5/render.mjs part $i 4 > build/ep5/log_$i.txt 2>&1 & done; wait
for i in 0 1 2 3; do node ep4/render.mjs part $i 4 > build/ep4/log_$i.txt 2>&1 & done; wait
cd build/ep5 && for i in 0 1 2 3; do echo "file part_$i.mp4"; done > list.txt && ffmpeg -y -v error -f concat -i list.txt -i mix.wav -c:v libx264 -preset medium -crf 27 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart capitulo5_v2.mp4
cd ../ep4 && for i in 0 1 2 3; do echo "file part_$i.mp4"; done > list.txt && ffmpeg -y -v error -f concat -i list.txt -i mix.wav -c:v libx264 -preset medium -crf 27 -maxrate 5M -bufsize 10M -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart capitulo4_v2.mp4
echo ALLDONE
