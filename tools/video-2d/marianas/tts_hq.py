import certifi; certifi.where=lambda:'/root/.ccr/ca-bundle.crt'
import asyncio, edge_tts, json, subprocess, sys, os
S,EP,VOICE=sys.argv[1],sys.argv[2],sys.argv[3] if len(sys.argv)>3 else 'es-ES-AlvaroNeural'
LINES={
'fall':[],
'marianas':[
"¿Qué pasaría si caes a la Fosa de las Marianas? Spoiler: nunca volverías a ver la luz del sol.",
"Es el punto más profundo del océano: casi once mil metros bajo el agua. Más profundo de lo que mide el Everest.",
"A los doscientos metros ya casi no llega la luz. A los mil, la oscuridad es total.",
"Y la presión se vuelve brutal: más de mil veces la de la superficie. Es como cargar cincuenta aviones encima.",
"Tus pulmones se encogerían y tus oídos se romperían mucho antes de llegar al fondo.",
"Pero allá abajo no estarías solo: hay peces transparentes, crustáceos gigantes y criaturas que brillan en la oscuridad.",
"Solo unos pocos humanos han llegado. En dos mil doce, el director James Cameron bajó en un submarino especial, sin tocar el agua.",
"¿Quieres ver lo siguiente? ¿Qué pasaría si caes dentro de un volcán? Sígueme y comenta."]}[EP]
D=f'{S}/w_{EP}';os.makedirs(D,exist_ok=True)
# natural prosody: slightly faster than default, no pitch tweaks
async def one(i,t):
    c=edge_tts.Communicate(t,VOICE,rate='+5%',boundary='WordBoundary')
    words=[]
    with open(f'{D}/s{i}.mp3','wb') as f:
        async for ch in c.stream():
            if ch['type']=='audio': f.write(ch['data'])
            elif ch['type']=='WordBoundary': words.append([ch['text'],ch['offset']/1e7,(ch['offset']+ch['duration'])/1e7])
    # mastering chain per line: 48 kHz (soxr), warmth + presence, de-ess, gentle compression
    af='aresample=48000:resampler=soxr:precision=28,highpass=f=70,equalizer=f=160:t=q:w=1.0:g=1.8,equalizer=f=3000:t=q:w=1.2:g=2.2,equalizer=f=9000:t=q:w=1.0:g=1.5,deesser=i=0.35,acompressor=threshold=0.12:ratio=2.6:attack=6:release=140:makeup=2.2'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{D}/s{i}.mp3','-af',af,'-ac','1','-c:a','pcm_s24le',f'{D}/s{i}.wav'],check=True)
    return words
async def main():
    out=[]
    for i,t in enumerate(LINES): out.append({'text':t,'words':await one(i,t)})
    json.dump(out,open(f'{D}/words.json','w'),ensure_ascii=False)
asyncio.run(main())
