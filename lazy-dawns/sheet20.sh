#!/bin/bash
# uso: sheet20.sh salida.png t1 t2 ... (hasta 8 por hoja; tiles 4x2 a 270x480)
out=$1; shift
args=(); fl=""; i=0
for t in "$@"; do args+=(-i build/dia20/p_$t.png); fl+="[$i:v]scale=270:480[s$i];"; i=$((i+1)); done
ins=""; for ((k=0;k<i;k++)); do ins+="[s$k]"; done
ffmpeg -y -loglevel error "${args[@]}" -filter_complex "${fl}${ins}xstack=inputs=$i:layout=$(python3 -c "
n=$i
print('|'.join(f'{(k%4)*270}_{(k//4)*480}' for k in range(n)))")" $out
