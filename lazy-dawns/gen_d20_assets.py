import json, subprocess, time, sys, os
S = 'build/dia20/sfx'; M = 'build/dia20/music'
SFX = [('cabin_amb', 'dark abandoned wooden cabin at night ambience, wind through cracks, creaking boards, distant owl, low drone', 10),
 ('rope_rub', 'rope rubbing against rusty metal edge, quiet strained scraping, tense', 5),
 ('chair_creak20', 'wooden chair creaking while someone struggles quietly, tense', 3),
 ('closet_open', 'wooden wardrobe doors sliding open quickly with clothes hangers clacking', 2),
 ('cloth_swish', 'quick clothes swish and fabric rustle, hangers sliding on a rail', 2),
 ('zip_up', 'zipper being pulled up fast on a jacket', 1.5),
 ('forest_night_amb', 'night forest ambience, crickets, distant owl, light wind in trees, ominous low drone', 12),
 ('footsteps_leaves', 'single person walking slowly on dry leaves and twigs in a forest at night', 6),
 ('twig_snap', 'a dry twig snapping loudly in a silent forest, sharp', 1.5),
 ('phone_rec_beep', 'smartphone camera video recording start beep, short digital', 1),
 ('phone_tap', 'phone touchscreen tap soft click', 0.6),
 ('run_leaves', 'two people running fast through a forest on dry leaves and branches, breathless, frantic', 8),
 ('breath_heavy', 'heavy panicked breathing while running, short breaths', 4),
 ('branch_whip', 'tree branches whipping and brushing past quickly', 2),
 ('mud_fall', 'person falling hard into wet mud with a heavy splat and squelch', 2.5),
 ('mud_squelch', 'wet mud squelching footsteps running', 3),
 ('police_siren', 'police car siren wail approaching from far, with radio chatter hints', 6),
 ('car_door20', 'police car door slamming and radio static', 2),
 ('heartbeat20', 'deep slow heartbeat thump, tense, cinematic', 5),
 ('whoosh20', 'cinematic fast whoosh swipe transition', 1),
 ('boom20', 'deep cinematic impact boom hit with reverb tail', 2.5),
 ('riser20', 'suspense riser building tension, strings and noise sweep', 3),
 ('stinger20', 'horror stinger violin screech short hit', 2),
 ('pop20', 'soft bubble pop ui sound', 0.6),
 ('villain_growl', 'low dark whispering villain breath and growl, distorted', 3)]
MUS = [('intro', 'dark suspense instrumental, low drones, slow ominous cello, dripping water texture, creeping tension, cinematic thriller, no vocals', 14000),
 ('home', 'tense rhythmic suspense instrumental, ticking percussion, pizzicato strings, urgent but quiet, cinematic thriller, no vocals', 22000),
 ('forest', 'eerie night forest suspense instrumental, sparse piano notes, low strings tremolo, distant haunting choir pad, slow dread, no vocals', 34000),
 ('chase', 'intense fast chase suspense instrumental, driving taiko drums, racing strings, urgent heartbeat pulse, cinematic thriller action, no vocals', 24000),
 ('safe', 'relief after danger, soft strings and piano, lingering uncertainty, cliffhanger ending, cinematic, no vocals', 22000),
 ('endcard', 'rhythmic intrigue suspense instrumental pulse, mysterious synth and plucks, playful tension loop, no vocals', 20000)]
which = sys.argv[1]
if which == 'sfx':
    for name, prompt, dur in SFX:
        if os.path.exists(f'{S}/{name}.mp3') and os.path.getsize(f'{S}/{name}.mp3') > 2000: print('cache', name); continue
        body = json.dumps({"text": prompt, "duration_seconds": dur, "prompt_influence": 0.6})
        for k in range(6):
            r = subprocess.run(["curl", "-sS", "-X", "POST", "https://api.elevenlabs.io/v1/sound-generation", "-H", "Content-Type: application/json", "-d", body, "-o", f"{S}/{name}.mp3", "-w", "%{http_code}"], capture_output=True, text=True)
            if r.stdout.strip() == '200': print('ok', name); break
            time.sleep(3 + 3 * k)
        else: print('FALLO', name, r.stdout)
else:
    for name, prompt, ms in MUS:
        if os.path.exists(f'{M}/{name}.mp3') and os.path.getsize(f'{M}/{name}.mp3') > 20000: print('cache', name); continue
        body = json.dumps({"prompt": prompt, "music_length_ms": ms})
        for k in range(6):
            r = subprocess.run(["curl", "-sS", "-X", "POST", "https://api.elevenlabs.io/v1/music", "-H", "Content-Type: application/json", "-d", body, "-o", f"{M}/{name}.mp3", "-w", "%{http_code}"], capture_output=True, text=True)
            print(name, r.stdout.strip())
            if r.stdout.strip() == '200': break
            time.sleep(5 + 5 * k)
