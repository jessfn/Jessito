import certifi; certifi.where=lambda:'/root/.ccr/ca-bundle.crt'
import asyncio, edge_tts, json, subprocess, sys
S=sys.argv[1]
LINES=[
"¿Qué pasa si caes en un agujero negro? Spoiler: te conviertes en espagueti.",
"Primero, cruzas el horizonte de sucesos. Es el punto sin retorno. Ni la luz escapa.",
"Y en un agujero negro gigante, ni siquiera lo notarías.",
"Pero la gravedad tira mucho más fuerte de tus pies que de tu cabeza.",
"Esa diferencia te estira como un hilo. Los científicos lo llaman espaguetización.",
"Visto desde afuera, nunca llegarías a cruzar. Te verían congelarte en el borde, cada vez más rojo.",
"Dentro, todos los caminos llevan al centro. En el agujero negro de nuestra galaxia, tendrías unos sesenta segundos de vida.",
"¿Parte tres? ¿Qué pasa si la Tierra deja de girar? Sígueme y comenta.",
]
async def one(i,t):
    c=edge_tts.Communicate(t,'es-MX-JorgeNeural',rate='+10%',pitch='-2Hz',boundary='WordBoundary')
    words=[]
    with open(f'{S}/w2/s{i}.mp3','wb') as f:
        async for ch in c.stream():
            if ch['type']=='audio': f.write(ch['data'])
            elif ch['type']=='WordBoundary':
                words.append([ch['text'],ch['offset']/1e7,(ch['offset']+ch['duration'])/1e7])
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{S}/w2/s{i}.mp3','-ar','44100','-ac','1',f'{S}/w2/s{i}.wav'],check=True)
    return words
async def main():
    out=[]
    for i,t in enumerate(LINES): out.append({'text':t,'words':await one(i,t)})
    json.dump(out,open(f'{S}/w2/words.json','w'),ensure_ascii=False)
asyncio.run(main())
