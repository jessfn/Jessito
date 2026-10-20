#!/bin/bash
cd "$(dirname "$0")"
one(){ i=$1; f=parts/c_$(printf %02d $i).mp4; for try in 1 2 3; do [ -f $f ] && return; node worker.js $i 16 60 53.519743 > w_c$i.log 2>&1; done; }
export -f one
seq 0 15 | xargs -P3 -I{} bash -c 'one {}'
touch render.done
