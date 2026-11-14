import json, subprocess, urllib.request, os
DANI='tMzxR2W7o3RLIY7zWBbG'; ANA='ewn5JTa3lNPY8QVuZJi6'; DIEGO='4rOzDieCbHQQyo9tzqZv'; BLACKIE='iFhPOZcajR7W3sDL39qJ'
LINES=[
 ('L1','narr',DANI,"Esta es Dina. Y en treinta días, tú vas a decidir cómo cambia su vida."),
 ('L2','narr',DANI,"Una noche, Dina se quedó dormida... y tuvo un sueño increíble."),
 ('L3','anun',DIEGO,"¡¡Damas y caballeros!! ¡¡Den la bienvenida a la nueva estrella de la música... DINA!!"),
 ('L4','crowd',BLACKIE,"¡¡DINA!! ¡¡DINA!! ¡¡DINA!!"),
 ('L5','anun',DIEGO,"Pero para estar aquí de verdad... ¡¡tendrás que cambiar!!"),
 ('L6','dina',ANA,"¡Ahhh! ¡Qué sueño tan padre! Estaba cantando frente a miles de personas."),
 ('L7','dina',ANA,"Pero... mírame. Así nunca lo voy a lograr."),
 ('L8','dina',ANA,"¡No! Voy a cambiar. Pero no puedo sola... ¡necesito tu ayuda!"),
 ('L9','dina',ANA,"Día uno: ¿qué cambio primero? ¿Mis dientes... o mi baño?"),
 ('L10','narr',DANI,"Comenta A o B y sigue a Dina para ver qué pasa en el día dos."),
]
for lid,who,vid,text in LINES:
    out=f'audio/{lid}.mp3'
    if os.path.exists(out): continue
    body=json.dumps({"text":text,"model_id":"eleven_multilingual_v2","voice_settings":({"stability":0.3,"similarity_boost":0.85,"style":0.85,"use_speaker_boost":True} if who in ("anun","crowd") else {"stability":0.4,"similarity_boost":0.8,"style":0.55,"use_speaker_boost":True})}).encode()
    req=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128',data=body,headers={'Content-Type':'application/json'})
    try:
        data=urllib.request.urlopen(req,timeout=120).read()
        open(out,'wb').write(data); print('ok',lid,len(data))
    except Exception as e:
        print('ERR',lid,e, getattr(e,'read',lambda:b'')()[:300])
json.dump([[a,b,c,d] for a,b,c,d in LINES],open('lines.json','w'),ensure_ascii=False)
