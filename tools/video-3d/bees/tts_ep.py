import certifi; certifi.where=lambda:'/root/.ccr/ca-bundle.crt'
import asyncio, edge_tts, json, subprocess, sys, os
S,EP=sys.argv[1],sys.argv[2]
LINES={
'p1':[
"¿Qué pasa si sales al espacio sin traje? Spoiler: no explotas.",
"Segundo cero. El aire sale de tus pulmones al instante.",
"A los cinco segundos, el agua de tu lengua empieza a hervir. Sí, a temperatura corporal.",
"A los diez, tu cuerpo se hincha casi al doble, pero tu piel aguanta. No revientas.",
"A los quince segundos, pierdes el conocimiento. Tu cerebro se queda sin oxígeno.",
"¿Y te congelas? No. En el vacío, el calor se escapa muy despacio.",
"En dos minutos, tu corazón se detiene. Pero si te rescatan antes de noventa segundos, hay esperanza.",
"Y esto pasó de verdad. En mil novecientos sesenta y cinco, un técnico de la NASA se despresurizó en una cámara de vacío. Sintió cómo su saliva hervía... y sobrevivió.",
"¿Quieres la parte dos? ¿Qué pasa si caes en un agujero negro? Sígueme y comenta."],
'bees':[
"¿Qué pasa si desaparecen todas las abejas? Spoiler: tu supermercado se vacía.",
"Las abejas y otros polinizadores ayudan a producir cerca de un tercio de los cultivos del mundo.",
"Primero desaparecerían las almendras, las manzanas y los arándanos.",
"Los precios se dispararían y en las tiendas faltarían frutas y verduras.",
"Otros insectos y el viento ayudarían un poco, pero no alcanzarían.",
"Y no, no moriríamos todos en cuatro años. Esa frase que se atribuye a Einstein es un mito.",
"Pero comeríamos muy distinto: más trigo y arroz, que no dependen de las abejas, y mucha menos fruta.",
"¿Parte dos? ¿Qué pasa si no duermes durante once días? Sígueme y comenta."],
'p3':[
"¿Qué pasa si la Tierra deja de girar de golpe? Spoiler: saldrías volando.",
"Ahora mismo giras a unos mil seiscientos setenta kilómetros por hora en el ecuador. No lo notas, porque todo gira contigo.",
"Pero si frenara de golpe, tú, los edificios y el aire seguirían avanzando hacia el este.",
"El viento llegaría a velocidades supersónicas y lo arrasaría todo.",
"Los océanos se desbordarían sobre los continentes en olas gigantes.",
"Después, un día duraría un año entero: seis meses de sol abrasador y seis de noche helada.",
"Los polos casi no notarían el frenazo... pero la vida, tal como la conocemos, no sobreviviría.",
"¿Parte cuatro? ¿Qué pasa si la Luna desaparece? Sígueme y comenta."]}[EP]
D=f'{S}/w_{EP}';os.makedirs(D,exist_ok=True)
async def one(i,t):
    c=edge_tts.Communicate(t,'es-MX-JorgeNeural',rate='+10%',pitch='-2Hz',boundary='WordBoundary')
    words=[]
    with open(f'{D}/s{i}.mp3','wb') as f:
        async for ch in c.stream():
            if ch['type']=='audio': f.write(ch['data'])
            elif ch['type']=='WordBoundary': words.append([ch['text'],ch['offset']/1e7,(ch['offset']+ch['duration'])/1e7])
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{D}/s{i}.mp3','-ar','44100','-ac','1',f'{D}/s{i}.wav'],check=True)
    return words
async def main():
    out=[]
    for i,t in enumerate(LINES): out.append({'text':t,'words':await one(i,t)})
    json.dump(out,open(f'{D}/words.json','w'),ensure_ascii=False)
asyncio.run(main())
