import math
# ---------- helper: skeleton hand (x-ray) ----------
def bone(x1,y1,x2,y2,w):
    o=[]
    o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#4fb3d9" stroke-width="{w+4}" stroke-linecap="round"/>')
    o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#eaf9ff" stroke-width="{w}" stroke-linecap="round"/>')
    for (x,y) in ((x1,y1),(x2,y2)):
        o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{w*0.78:.1f}" fill="#eaf9ff" stroke="#4fb3d9" stroke-width="2.5"/>')
    return ''.join(o)

def xray_hand():
    s=[]
    # forearm bones
    s.append(bone(-14,150,-10,95,13)); s.append(bone(16,150,18,100,10))
    # carpals
    for (x,y) in [(-26,78),(-8,84),(10,82),(28,76),(-18,64),(2,66),(20,63),(-4,52)]:
        s.append(f'<ellipse cx="{x}" cy="{y}" rx="11" ry="9" fill="#eaf9ff" stroke="#4fb3d9" stroke-width="2.5"/>')
    fingers=[(-46,-6,[22,15,12],-10),(-22,-12,[38,26,19],-4),(2,-14,[42,28,21],2),(26,-10,[38,26,19],8),(48,-2,[30,20,15],14)]
    # fingers: index.. wait order from left (pinky not here) -> thumb separate
    bases=[(-34,60),(-14,62),(6,60),(24,56)]
    names=[(-30,-10,[36,25,18],-9),(-9,-14,[40,27,20],-3),(12,-14,[38,26,19],4),(32,-6,[30,20,15],12)]
    for (bx,by),(kx,ky,ls,ang) in zip(bases,names):
        s.append(bone(bx,by,kx,ky,9))               # metacarpal
        a=math.radians(ang); x,y=kx,ky
        for L in ls:
            nx,ny=x+math.sin(a)*L, y-math.cos(a)*L
            s.append(bone(x,y,nx,ny,8 if L>16 else 7)); x,y=nx,ny
    # thumb
    s.append(bone(-30,72,-58,34,10)); s.append(bone(-58,34,-76,6,9)); s.append(bone(-76,6,-86,-18,8))
    return ''.join(s)

# ---------- helper: pimples ----------
def pim(x,y,r=1.0,green=False):
    c1,c2,c3=('#8fa63a','#cfe05a','#f3f8c0') if green else ('#c9605a','#e9e07a','#fffbe0')
    return (f'<g transform="translate({x},{y}) scale({r})"><circle r="10" fill="{c1}" opacity=".55"/>'
            f'<circle r="7" fill="{c2}" stroke="{c1}" stroke-width="1.5"/><circle cx="-2" cy="-2.5" r="2.6" fill="{c3}"/></g>')
PIM=[(-62,-54,1.0,0),(-20,-66,0.8,1),(44,-60,1.0,0),(74,-34,0.9,1),(-80,-22,0.85,0),(78,24,1.0,0),
     (-72,38,0.9,1),(-60,66,0.8,0),(64,66,0.9,1),(10,-44,0.7,0),(-34,-38,0.6,1),(86,-6,0.7,0),(0,48,0.0,0)]
pims=''.join(pim(x,y,r,bool(g)) for x,y,r,g in PIM if r>0)

# teeth (crooked) inside mouth, head coordinates
teeth=[]
up=[(-34,60,10,16,-6),(-22,58,11,19,3),(-9,57,12,22,-2),(5,58,12,18,7),(18,58,11,16,-4),(30,60,10,14,5)]
for x,y,w,h,r in up:
    teeth.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3.5" transform="rotate({r} {x+w/2} {y})" fill="#e8dc94" stroke="#8a7a3a" stroke-width="1.6"/>')
teeth.append('<rect x="-2" y="64" width="13" height="22" rx="4" transform="rotate(14 4 64)" fill="#efe3a0" stroke="#8a7a3a" stroke-width="1.8"/>')  # buck tooth overlapping
for x,y,w,h,r in [(-26,86,10,13,8),(-12,88,11,12,-5),(3,87,10,14,6),(17,86,10,12,-8)]:
    teeth.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" transform="rotate({r} {x+w/2} {y+h})" fill="#e3d58a" stroke="#8a7a3a" stroke-width="1.5"/>')
teeth.append('<path d="M-30,64 q4,3 8,0 M14,72 q4,3 8,0 M-16,84 q4,3 8,0" stroke="#8a6a1a" stroke-width="2" fill="none"/>')
teeth=''.join(teeth)

# hair strands
strands=''.join(f'<path d="M{x},{y} q{dx},{dy} {ex},{ey}" />' for x,y,dx,dy,ex,ey in
 [(-100,-80,-12,40,-6,90),(-84,-110,-10,60,-14,130),(-60,-130,-16,60,-12,170),(60,-130,16,60,12,170),
  (84,-110,10,60,14,130),(100,-80,12,40,6,90),(-30,-140,-6,40,-4,70),(30,-140,6,40,4,70),(-112,10,-6,50,-12,100),(112,10,6,50,12,100)])
flakes=''.join(f'<circle cx="{x}" cy="{y}" r="2" />' for x,y in
 [(-90,-70),(-70,-110),(-30,-125),(20,-130),(70,-100),(96,-60),(-110,0),(110,20),(-100,60),(100,80),(-60,-80),(50,-90)])

defs = f'''
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25244a"/><stop offset="1" stop-color="#4d3f66"/></linearGradient>
<linearGradient id="skinG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dcb59c"/><stop offset=".3" stop-color="#f5e1d1"/><stop offset=".7" stop-color="#f5e1d1"/><stop offset="1" stop-color="#dcb59c"/></linearGradient>
<linearGradient id="limbG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e0bba3"/><stop offset=".35" stop-color="#f5e1d1"/><stop offset="1" stop-color="#e0bba3"/></linearGradient>
<radialGradient id="faceG" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#f9e9dc"/><stop offset=".65" stop-color="#f0d3be"/><stop offset="1" stop-color="#d9ab90"/></radialGradient>
<radialGradient id="blush"><stop offset="0" stop-color="#d9605a" stop-opacity=".55"/><stop offset="1" stop-color="#d9605a" stop-opacity="0"/></radialGradient>
<radialGradient id="shine"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="hairG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a432b"/><stop offset=".5" stop-color="#2f2a1a"/><stop offset="1" stop-color="#3d3822"/></linearGradient>
<linearGradient id="rollG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b78a72" stop-opacity=".0"/><stop offset="1" stop-color="#b78a72" stop-opacity=".3"/></linearGradient>

<clipPath id="faceClip"><ellipse cx="0" cy="0" rx="97" ry="105"/></clipPath>
<clipPath id="hairClip"><path id="hairShape" d="M-118,-10 C-142,-120 -70,-152 0,-152 C70,-152 142,-120 118,-10 C132,60 142,100 130,132 L90,112 L45,138 L0,118 L-45,138 L-90,112 L-130,132 C-142,100 -132,60 -118,-10Z"/></clipPath>
<clipPath id="mouthClip"><path d="M-40,62 Q0,52 40,62 Q34,98 0,100 Q-34,98 -40,62Z"/></clipPath>
<clipPath id="mouthSurpClip"><ellipse cx="0" cy="78" rx="24" ry="30"/></clipPath>
<clipPath id="eyeL"><ellipse cx="-42" cy="6" rx="26" ry="20"/></clipPath>
<clipPath id="eyeR"><ellipse cx="42" cy="6" rx="26" ry="20"/></clipPath>
<clipPath id="eyeLs"><ellipse cx="-42" cy="4" rx="29" ry="26"/></clipPath>
<clipPath id="eyeRs"><ellipse cx="42" cy="4" rx="29" ry="26"/></clipPath>

<!-- ============ HEAD (no expression) ============ -->
<g id="hairBack">
 <path d="{'M-118,-10 C-142,-120 -70,-152 0,-152 C70,-152 142,-120 118,-10 C132,60 142,100 130,132 L90,112 L45,138 L0,118 L-45,138 L-90,112 L-130,132 C-142,100 -132,60 -118,-10Z'}" fill="url(#hairG)" stroke="#17130a" stroke-width="5" stroke-linejoin="round"/>
 <g clip-path="url(#hairClip)"><g stroke="#8c8a3e" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round">{strands}</g><g fill="#f4f1e6" opacity=".8">{flakes}</g></g>
</g>
<g id="headFace">
 <ellipse cx="-101" cy="16" rx="15" ry="23" fill="#e6c3ab" stroke="#6b4a3a" stroke-width="4"/><ellipse cx="101" cy="16" rx="15" ry="23" fill="#e6c3ab" stroke="#6b4a3a" stroke-width="4"/>
 <ellipse cx="-102" cy="18" rx="6" ry="12" fill="#c98f7a"/><ellipse cx="102" cy="18" rx="6" ry="12" fill="#c98f7a"/>
 <ellipse cx="0" cy="0" rx="100" ry="108" fill="url(#faceG)" stroke="#6b4a3a" stroke-width="5"/>
 <g clip-path="url(#faceClip)">
  <circle cx="-62" cy="34" r="34" fill="url(#blush)"/><circle cx="62" cy="34" r="34" fill="url(#blush)"/>
  <ellipse cx="-14" cy="-70" rx="34" ry="14" fill="url(#shine)"/>
  <ellipse cx="0" cy="100" rx="70" ry="20" fill="#a86a4e" opacity=".18"/>
  <g fill="#3a2a1a" opacity=".8"><circle cx="-10" cy="26" r="1.8"/><circle cx="12" cy="30" r="1.8"/><circle cx="-4" cy="38" r="1.8"/><circle cx="8" cy="40" r="1.6"/><circle cx="-18" cy="34" r="1.6"/></g>
  {pims}
 </g>
 <path d="M-7,-2 C-12,24 -24,34 -24,46 C-24,60 -8,62 0,58 C8,62 24,60 24,46 C24,34 12,24 7,-2Z" fill="#e8bda5" stroke="#6b4a3a" stroke-width="3.5" stroke-linejoin="round"/>
 <ellipse cx="-11" cy="52" rx="6" ry="4" fill="#4a2e22"/><ellipse cx="11" cy="52" rx="6" ry="4" fill="#4a2e22"/>
 <ellipse cx="-8" cy="34" rx="5" ry="9" fill="#fff" opacity=".35"/>
 <path d="M-12,57 q-3,12 0,20" stroke="#cbd95e" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="-12" cy="79" r="3.6" fill="#cbd95e"/>
</g>
<g id="headA"><use href="#hairBack"/><use href="#headFace"/></g>
<g id="headB">
 <path d="M-106,-44 C-104,-112 -50,-132 0,-128 C50,-132 104,-112 106,-44 C86,-74 72,-62 58,-32 C44,-68 24,-62 8,-34 C-8,-68 -34,-62 -46,-30 C-60,-64 -86,-72 -106,-44Z" fill="url(#hairG)" stroke="#17130a" stroke-width="5" stroke-linejoin="round"/>
 <path d="M-76,-92 q22,-16 46,-10 M20,-104 q28,-8 52,8" stroke="#8c8a3e" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/>
 <g fill="#f4f1e6" opacity=".85"><circle cx="-60" cy="-70" r="2"/><circle cx="-20" cy="-96" r="2"/><circle cx="40" cy="-100" r="2"/><circle cx="74" cy="-64" r="2"/></g>
</g>

<!-- ============ EXPRESSIONS ============ -->
<g id="eyesOpen">
 <g clip-path="url(#eyeL)"><ellipse cx="-42" cy="6" rx="26" ry="20" fill="#fdf5ea"/><path d="M-66,2 q10,-2 16,6 M-30,12 q8,-4 14,-10 M-60,16 q8,2 16,-2" stroke="#d65a5a" stroke-width="1.6" fill="none"/>
  <circle cx="-38" cy="7" r="12.5" fill="#6b5530"/><circle cx="-38" cy="7" r="6" fill="#111"/><circle cx="-34" cy="2" r="3.6" fill="#fff"/><path d="M-70,-14 Q-42,-26 -14,-14 L-14,-6 Q-42,-14 -70,-6Z" fill="#000" opacity=".12"/></g>
 <g clip-path="url(#eyeR)"><ellipse cx="42" cy="6" rx="26" ry="20" fill="#fdf5ea"/><path d="M66,2 q-10,-2 -16,6 M30,12 q8,-4 14,-10 M60,16 q-8,2 -16,-2" stroke="#d65a5a" stroke-width="1.6" fill="none"/>
  <circle cx="46" cy="7" r="12.5" fill="#6b5530"/><circle cx="46" cy="7" r="6" fill="#111"/><circle cx="50" cy="2" r="3.6" fill="#fff"/><path d="M14,-14 Q42,-26 70,-14 L70,-6 Q42,-14 14,-6Z" fill="#000" opacity=".12"/></g>
 <ellipse cx="-42" cy="6" rx="26" ry="20" fill="none" stroke="#5a3a2a" stroke-width="2.6"/><ellipse cx="42" cy="6" rx="26" ry="20" fill="none" stroke="#5a3a2a" stroke-width="2.6"/>
 <path d="M-66,-2 Q-42,-18 -18,-2" stroke="#2a1f12" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M18,-2 Q42,-18 66,-2" stroke="#2a1f12" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M-64,28 Q-42,42 -20,28 M20,28 Q42,42 64,28" stroke="#8a5a7a" stroke-width="5" fill="none" stroke-linecap="round" opacity=".4"/>
 <path d="M-58,34 q6,5 12,2 M46,34 q6,3 12,-2" stroke="#a86a4e" stroke-width="2.5" fill="none"/>
</g>
<g id="browsNeutral" stroke="#2a2214" stroke-width="9" fill="none" stroke-linecap="round">
 <path d="M-72,-22 Q-46,-40 -18,-24"/><path d="M18,-24 Q46,-40 72,-22"/><path d="M-12,-22 L12,-22" stroke-width="5"/>
</g>
<g id="mouthMain">
 <path d="M-40,62 Q0,52 40,62 Q34,98 0,100 Q-34,98 -40,62Z" fill="#4a1520"/>
 <g clip-path="url(#mouthClip)"><path d="M-44,60 Q0,50 44,60 L44,64 Q0,56 -44,64Z" fill="#c9667a"/><ellipse cx="2" cy="98" rx="22" ry="12" fill="#c25a6e"/>{teeth}</g>
 <path d="M-40,62 Q0,52 40,62 Q34,98 0,100 Q-34,98 -40,62Z" fill="none" stroke="#5a2a2a" stroke-width="4" stroke-linejoin="round"/>
 <path d="M-40,62 q-8,-4 -12,2 M40,62 q8,-4 12,2" stroke="#5a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
 <path d="M30,88 q4,16 2,24" stroke="#bfe6f5" stroke-width="0" fill="none"/>
</g>
<g id="exprSleep">
 <path d="M-68,6 Q-42,28 -16,6 M16,6 Q42,28 68,6" stroke="#2a1f12" stroke-width="6" fill="none" stroke-linecap="round"/>
 <path d="M-64,12 l-8,8 M-42,22 l-1,11 M-20,12 l8,8 M20,12 l-8,8 M42,22 l1,11 M64,12 l8,8" stroke="#2a1f12" stroke-width="3.5" stroke-linecap="round"/>
 <path d="M-64,34 Q-42,48 -20,34 M20,34 Q42,48 64,34" stroke="#8a5a7a" stroke-width="7" fill="none" stroke-linecap="round" opacity=".5"/>
 <path d="M-72,-20 Q-46,-34 -18,-22 M18,-22 Q46,-34 72,-20" stroke="#2a2214" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-12,-20 L12,-20" stroke="#2a2214" stroke-width="5" stroke-linecap="round"/>
 <path d="M-28,70 Q0,62 28,70 Q24,96 0,98 Q-24,96 -28,70Z" fill="#4a1520" stroke="#5a2a2a" stroke-width="4" stroke-linejoin="round"/>
 <path d="M-14,70 l10,-1 l1,12 l-11,0z M2,70 l12,1 l-2,12 l-10,-1z" fill="#e8dc94" stroke="#8a7a3a" stroke-width="1.6" transform="translate(0,0)"/>
 <path d="M24,92 q8,18 4,36" stroke="#cfeaf5" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="28" cy="130" r="7" fill="#cfeaf5"/>
</g>
<g id="exprSurp">
 <path d="M-76,-30 Q-46,-58 -16,-34 M16,-34 Q46,-58 76,-30" stroke="#2a2214" stroke-width="9" fill="none" stroke-linecap="round"/>
 <g clip-path="url(#eyeLs)"><ellipse cx="-42" cy="4" rx="29" ry="26" fill="#fdf5ea"/><circle cx="-42" cy="5" r="11" fill="#6b5530"/><circle cx="-42" cy="5" r="5.5" fill="#111"/><circle cx="-38" cy="0" r="3.4" fill="#fff"/><path d="M-66,-6 q8,-3 14,5 M-26,12 q6,-4 10,-9" stroke="#d65a5a" stroke-width="1.6" fill="none"/></g>
 <g clip-path="url(#eyeRs)"><ellipse cx="42" cy="4" rx="29" ry="26" fill="#fdf5ea"/><circle cx="42" cy="5" r="11" fill="#6b5530"/><circle cx="42" cy="5" r="5.5" fill="#111"/><circle cx="46" cy="0" r="3.4" fill="#fff"/><path d="M66,-6 q-8,-3 -14,5 M26,12 q-6,-4 -10,-9" stroke="#d65a5a" stroke-width="1.6" fill="none"/></g>
 <ellipse cx="-42" cy="4" rx="29" ry="26" fill="none" stroke="#5a3a2a" stroke-width="2.6"/><ellipse cx="42" cy="4" rx="29" ry="26" fill="none" stroke="#5a3a2a" stroke-width="2.6"/>
 <path d="M-66,36 Q-42,50 -18,36 M18,36 Q42,50 66,36" stroke="#8a5a7a" stroke-width="6" fill="none" stroke-linecap="round" opacity=".5"/>
 <ellipse cx="0" cy="78" rx="24" ry="30" fill="#4a1520"/>
 <g clip-path="url(#mouthSurpClip)"><path d="M-14,52 l12,-1 l1,16 l-12,0z M2,51 l14,1 l-2,16 l-11,-1z" fill="#e8dc94" stroke="#8a7a3a" stroke-width="1.6"/><ellipse cx="0" cy="104" rx="18" ry="14" fill="#c25a6e"/></g>
 <ellipse cx="0" cy="78" rx="24" ry="30" fill="none" stroke="#5a2a2a" stroke-width="4"/>
 <g transform="translate(88,-100)"><path d="M0,0 l4,26 M14,-4 l-2,28" stroke="#ff6b6b" stroke-width="0"/></g>
</g>
<g id="exprSad">
 <path d="M-74,-14 Q-46,-18 -18,-34 M18,-34 Q46,-18 74,-14" stroke="#2a2214" stroke-width="9" fill="none" stroke-linecap="round"/>
 <g clip-path="url(#eyeL)"><ellipse cx="-42" cy="6" rx="26" ry="20" fill="#fdf5ea"/><circle cx="-42" cy="12" r="12.5" fill="#6b5530"/><circle cx="-42" cy="12" r="6" fill="#111"/><circle cx="-37" cy="6" r="4" fill="#fff"/><path d="M-70,2 q16,-4 30,-2" stroke="#000" stroke-width="0"/></g>
 <g clip-path="url(#eyeR)"><ellipse cx="42" cy="6" rx="26" ry="20" fill="#fdf5ea"/><circle cx="42" cy="12" r="12.5" fill="#6b5530"/><circle cx="42" cy="12" r="6" fill="#111"/><circle cx="47" cy="6" r="4" fill="#fff"/></g>
 <ellipse cx="-42" cy="6" rx="26" ry="20" fill="none" stroke="#5a3a2a" stroke-width="2.6"/><ellipse cx="42" cy="6" rx="26" ry="20" fill="none" stroke="#5a3a2a" stroke-width="2.6"/>
 <path d="M-68,-4 Q-42,-12 -16,2 M16,2 Q42,-12 68,-4" stroke="#2a1f12" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M-64,30 Q-42,44 -20,30 M20,30 Q42,44 64,30" stroke="#8a5a7a" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>
 <path d="M-52,26 C-62,60 -56,86 -60,108 M52,26 C62,60 56,86 60,108" stroke="#8fcdf0" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M-52,28 C-60,56 -55,80 -58,96 M52,28 C60,56 55,80 58,96" stroke="#d9f1fb" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M-34,98 Q0,66 34,98" stroke="#5a2a2a" stroke-width="9" fill="none" stroke-linecap="round"/>
 <path d="M-22,86 l8,-6 l3,8 z" fill="#e8dc94" stroke="#8a7a3a" stroke-width="1.5"/>
</g>
<g id="exprHappy">
 <path d="M-72,-26 Q-46,-44 -18,-30 M18,-30 Q46,-44 72,-26" stroke="#2a2214" stroke-width="9" fill="none" stroke-linecap="round"/>
 <g clip-path="url(#eyeLs)"><ellipse cx="-42" cy="4" rx="29" ry="26" fill="#fdf5ea"/><circle cx="-40" cy="4" r="15" fill="#6b5530"/><circle cx="-40" cy="4" r="7" fill="#111"/><path d="M-46,-6 l3,6 l-3,6 l-3,-6z" fill="#fff"/><circle cx="-34" cy="9" r="3" fill="#fff"/></g>
 <g clip-path="url(#eyeRs)"><ellipse cx="42" cy="4" rx="29" ry="26" fill="#fdf5ea"/><circle cx="44" cy="4" r="15" fill="#6b5530"/><circle cx="44" cy="4" r="7" fill="#111"/><path d="M38,-6 l3,6 l-3,6 l-3,-6z" fill="#fff"/><circle cx="50" cy="9" r="3" fill="#fff"/></g>
 <ellipse cx="-42" cy="4" rx="29" ry="26" fill="none" stroke="#5a3a2a" stroke-width="2.6"/><ellipse cx="42" cy="4" rx="29" ry="26" fill="none" stroke="#5a3a2a" stroke-width="2.6"/>
 <path d="M-66,34 Q-42,48 -18,34 M18,34 Q42,48 66,34" stroke="#8a5a7a" stroke-width="6" fill="none" stroke-linecap="round" opacity=".5"/>
 <path d="M-46,60 Q0,50 46,60 Q40,104 0,106 Q-40,104 -46,60Z" fill="#4a1520"/>
 <g clip-path="url(#mouthClip)" transform="translate(0,2) scale(1.12 1)"><path d="M-44,60 Q0,50 44,60 L44,64 Q0,56 -44,64Z" fill="#c9667a"/><ellipse cx="2" cy="98" rx="22" ry="12" fill="#c25a6e"/>{teeth}</g>
 <path d="M-46,60 Q0,50 46,60 Q40,104 0,106 Q-40,104 -46,60Z" fill="none" stroke="#5a2a2a" stroke-width="4" stroke-linejoin="round"/>
</g>

<!-- ============ HAND (hanging, back of hand) origin = wrist ============ -->
<g id="hand"><g fill="#f3dccb" stroke="#6b4a3a" stroke-width="3" stroke-linejoin="round"><rect x="-26" y="30" width="13" height="62" rx="6.5"/><rect x="-13" y="30" width="13" height="68" rx="6.5"/><rect x="0" y="30" width="13" height="64" rx="6.5"/><rect x="13" y="30" width="13" height="54" rx="6.5"/></g><g transform="translate(-16,14) rotate(32)"><rect x="-10" y="-6" width="20" height="62" rx="10" fill="#f3dccb" stroke="#6b4a3a" stroke-width="3"/><path d="M-7,26 q7,4 14,0 M-7,30 q7,4 14,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="24" rx="6" ry="3" fill="#ebcdb7" opacity=".8"/><path d="M-7,40 L7,40 L6,56 Q5,70 0,74 Q-5,70 -6,56Z" fill="#cdb870" stroke="#4a3418" stroke-width="1.8" stroke-linejoin="round"/><path d="M-6,57 L6,57 Q5,68 0,72 Q-5,68 -6,57Z" fill="#2b1d0c" opacity=".9"/><path d="M-4,44 q4,-3 8,0" stroke="#efe3a8" stroke-width="2" fill="none"/></g><path d="M-26,-2 C-32,16 -30,34 -24,46 L24,46 C30,34 32,16 26,-2Z" fill="url(#skinG)"/><path d="M-26,-2 C-32,16 -30,34 -24,44 M26,-2 C32,16 30,34 24,44" stroke="#6b4a3a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="-19.5" cy="38" rx="6.4" ry="4.6" fill="#ebcdb7" stroke="#b78a72" stroke-width="2"/><path d="M-19.5,12 L-19.5,32" stroke="#d3ab93" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-23.5,60.4 q4,3.2 8,0 M-23.5,63.8 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-19.5" cy="57.9" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><path d="M-23.5,77.8 q4,3.2 8,0 M-23.5,81.2 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-19.5" cy="75.3" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><ellipse cx="-6.5" cy="38" rx="6.4" ry="4.6" fill="#ebcdb7" stroke="#b78a72" stroke-width="2"/><path d="M-6.5,12 L-6.5,32" stroke="#d3ab93" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-10.5,62.9 q4,3.2 8,0 M-10.5,66.3 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-6.5" cy="60.4" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><path d="M-10.5,82.1 q4,3.2 8,0 M-10.5,85.5 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-6.5" cy="79.6" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><ellipse cx="6.5" cy="38" rx="6.4" ry="4.6" fill="#ebcdb7" stroke="#b78a72" stroke-width="2"/><path d="M6.5,12 L6.5,32" stroke="#d3ab93" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/><path d="M2.5,61.2 q4,3.2 8,0 M2.5,64.6 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="6.5" cy="58.7" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><path d="M2.5,79.2 q4,3.2 8,0 M2.5,82.6 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="6.5" cy="76.7" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><ellipse cx="19.5" cy="38" rx="6.4" ry="4.6" fill="#ebcdb7" stroke="#b78a72" stroke-width="2"/><path d="M19.5,12 L19.5,32" stroke="#d3ab93" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/><path d="M15.5,57.0 q4,3.2 8,0 M15.5,60.4 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="19.5" cy="54.5" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><path d="M15.5,72.0 q4,3.2 8,0 M15.5,75.4 q4,3.2 8,0" stroke="#b78a72" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="19.5" cy="69.5" rx="5.2" ry="2.6" fill="#ebcdb7" opacity=".7"/><path d="M-24.4,79 L-14.6,79 L-15.4,98 Q-16.2,112 -19.5,116 Q-22.799999999999997,112 -23.599999999999998,98Z" fill="#cdb870" stroke="#4a3418" stroke-width="1.8" stroke-linejoin="round"/><path d="M-23.599999999999998,100 L-15.4,100 Q-16.4,112 -19.5,115.5 Q-22.599999999999998,112 -23.599999999999998,100Z" fill="#2b1d0c" opacity=".9"/><path d="M-22.0,83 q4.1,-3 6.6,0" stroke="#f2e8b0" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-21.9,93 l0.8,6 M-17.1,93 l-0.8,6" stroke="#6b5a2a" stroke-width="1.4" opacity=".8"/><path d="M-11.4,85 L-1.5999999999999996,85 L-2.3999999999999995,104 Q-3.1999999999999997,118 -6.5,122 Q-9.8,118 -10.6,104Z" fill="#cdb870" stroke="#4a3418" stroke-width="1.8" stroke-linejoin="round"/><path d="M-10.6,106 L-2.3999999999999995,106 Q-3.3999999999999995,118 -6.5,121.5 Q-9.6,118 -10.6,106Z" fill="#2b1d0c" opacity=".9"/><path d="M-9.0,89 q4.1,-3 6.6,0" stroke="#f2e8b0" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-8.9,99 l0.8,6 M-4.1,99 l-0.8,6" stroke="#6b5a2a" stroke-width="1.4" opacity=".8"/><path d="M1.6,81 L11.4,81 L10.6,100 Q9.8,114 6.5,118 Q3.2,114 2.4000000000000004,100Z" fill="#cdb870" stroke="#4a3418" stroke-width="1.8" stroke-linejoin="round"/><path d="M2.4000000000000004,102 L10.6,102 Q9.6,114 6.5,117.5 Q3.4000000000000004,114 2.4000000000000004,102Z" fill="#2b1d0c" opacity=".9"/><path d="M4.0,85 q4.1,-3 6.6,0" stroke="#f2e8b0" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M4.1,95 l0.8,6 M8.9,95 l-0.8,6" stroke="#6b5a2a" stroke-width="1.4" opacity=".8"/><path d="M14.6,71 L24.4,71 L23.599999999999998,90 Q22.799999999999997,104 19.5,108 Q16.2,104 15.4,90Z" fill="#cdb870" stroke="#4a3418" stroke-width="1.8" stroke-linejoin="round"/><path d="M15.4,92 L23.599999999999998,92 Q22.599999999999998,104 19.5,107.5 Q16.4,104 15.4,92Z" fill="#2b1d0c" opacity=".9"/><path d="M17.0,75 q4.1,-3 6.6,0" stroke="#f2e8b0" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M17.1,85 l0.8,6 M21.9,85 l-0.8,6" stroke="#6b5a2a" stroke-width="1.4" opacity=".8"/><g fill="#4a3a1a" opacity=".45"><ellipse cx="-4" cy="14" rx="9" ry="5"/><ellipse cx="14" cy="24" rx="5" ry="3"/></g></g>

<!-- ============ FOOT (front view, left foot, origin = floor centre) ============ -->
<g id="foot">
 <clipPath id="footClip"><path d="M-33,-42 C-40,-10 -48,10 -36,22 L36,22 C48,10 40,-10 33,-42 Z"/></clipPath>
 <g fill="#f0d5c0" stroke="#6b4a3a" stroke-width="3.2">
  <circle cx="-30" cy="23" r="8"/><circle cx="-18" cy="27" r="9"/><circle cx="-4" cy="29" r="9.5"/><circle cx="11" cy="29" r="10.5"/><circle cx="28" cy="25" r="13.5"/>
 </g>
 <path d="M-33,-42 C-40,-10 -48,10 -36,22 L36,22 C48,10 40,-10 33,-42 Z" fill="url(#limbG)" stroke="#6b4a3a" stroke-width="3.5" stroke-linejoin="round"/>
 <path d="M-34,16 Q0,28 36,16" stroke="#f0d5c0" stroke-width="7" fill="none"/>
 <g clip-path="url(#footClip)"><ellipse cx="-14" cy="6" rx="18" ry="9" fill="#5a4220" opacity=".42"/><ellipse cx="20" cy="-10" rx="12" ry="6" fill="#5a4220" opacity=".35"/><ellipse cx="-24" cy="-24" rx="8" ry="5" fill="#6b5a2a" opacity=".3"/>
  <path d="M-14,-30 q6,10 4,22 M10,-34 q4,12 0,26" stroke="#c9a38c" stroke-width="3" fill="none" stroke-linecap="round"/></g>
 <g fill="#b9a24a" stroke="#4a3418" stroke-width="1.6"><ellipse cx="-30" cy="25" rx="4.5" ry="3.6"/><ellipse cx="-18" cy="30" rx="5" ry="4"/><ellipse cx="-4" cy="32" rx="5.2" ry="4.2"/><ellipse cx="11" cy="32" rx="5.8" ry="4.6"/><ellipse cx="28" cy="29" rx="8" ry="5.6"/></g>
 <g fill="#2b1d0c"><ellipse cx="-30" cy="27" rx="3.6" ry="1.5"/><ellipse cx="-18" cy="32" rx="4" ry="1.6"/><ellipse cx="-4" cy="34" rx="4.2" ry="1.7"/><ellipse cx="11" cy="34" rx="4.6" ry="1.8"/><ellipse cx="28" cy="32" rx="6.4" ry="2"/></g>
 <circle cx="-26" cy="-6" r="0" /><path d="M-36,-34 q-6,6 -2,12" stroke="#b78a72" stroke-width="3" fill="none"/>
</g>
</defs>
'''

# ---------------- body (absolute coords, centre x=450) ----------------
body = '''
<g id="dina" transform="translate(0,52)">
 <ellipse cx="450" cy="880" rx="200" ry="22" fill="#000" opacity=".35"/>
 <g transform="translate(450,196)"><use href="#hairBack"/></g>
 <!-- legs -->
 <path d="M354,680 C344,750 360,800 372,852 L438,852 C446,790 448,730 448,680Z" fill="url(#limbG)" stroke="#6b4a3a" stroke-width="4" stroke-linejoin="round"/>
 <path d="M546,680 C556,750 540,800 528,852 L462,852 C454,790 452,730 452,680Z" fill="url(#limbG)" stroke="#6b4a3a" stroke-width="4" stroke-linejoin="round"/>
 <g stroke="#b78a72" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M362,770 q22,10 46,0 M538,770 q-22,10 -46,0"/></g>
 <g fill="#b78a72" opacity=".6"><circle cx="372" cy="712" r="2.5"/><circle cx="392" cy="726" r="2.5"/><circle cx="380" cy="740" r="2.5"/><circle cx="528" cy="712" r="2.5"/><circle cx="508" cy="726" r="2.5"/><circle cx="520" cy="740" r="2.5"/></g>
 <use href="#foot" x="405" y="878"/>
 <use href="#foot" x="495" y="878" transform="translate(990,0) scale(-1,1)"/>
 <!-- torso -->
 <clipPath id="torsoClip"><path d="M372,330 C340,350 322,420 312,500 C296,580 300,640 340,672 L560,672 C600,640 604,580 588,500 C578,420 560,350 528,330 Z"/></clipPath>
 <path d="M372,330 C340,350 322,420 312,500 C296,580 300,640 340,672 L560,672 C600,640 604,580 588,500 C578,420 560,350 528,330 Z" fill="url(#skinG)" stroke="#6b4a3a" stroke-width="4.5" stroke-linejoin="round"/>
 <g clip-path="url(#torsoClip)">
  <path d="M300,500 Q450,560 600,500 L600,520 Q450,580 300,520Z" fill="url(#rollG)"/>
  <path d="M296,548 Q450,612 604,548 L604,570 Q450,634 296,570Z" fill="url(#rollG)"/>
  <ellipse cx="450" cy="520" rx="130" ry="10" fill="none"/>
 </g>
 <g stroke="#a87a62" stroke-width="5" fill="none" stroke-linecap="round"><path d="M312,500 Q450,556 588,500"/><path d="M302,548 Q450,614 598,548"/><path d="M306,596 Q450,656 594,596"/></g>
 <path d="M440,520 q10,10 20,0 q-4,14 -10,14 q-6,0 -10,-14z" fill="#9a6a54" stroke="#6b4a3a" stroke-width="2"/>
 <!-- arms -->
 <path d="M384,352 C326,400 298,480 306,556" stroke="#6b4a3a" stroke-width="74" fill="none" stroke-linecap="round"/>
 <path d="M384,352 C326,400 298,480 306,556" stroke="#efd3be" stroke-width="67" fill="none" stroke-linecap="round"/>
 <path d="M516,352 C574,400 602,480 594,556" stroke="#6b4a3a" stroke-width="74" fill="none" stroke-linecap="round"/>
 <path d="M516,352 C574,400 602,480 594,556" stroke="#efd3be" stroke-width="67" fill="none" stroke-linecap="round"/>
 <path d="M296,470 q14,10 34,4 M604,470 q-14,10 -34,4 M300,520 q12,8 30,4 M600,520 q-12,8 -30,4" stroke="#b78a72" stroke-width="3.5" fill="none" stroke-linecap="round"/>
 <use href="#hand" transform="translate(306,560) scale(1.05)"/><use href="#hand" transform="translate(594,560) scale(-1.05,1.05)"/>
 <!-- shorts -->
 <clipPath id="shortsClip"><path d="M336,640 Q450,700 564,640 L582,730 Q524,758 462,730 L450,706 L438,730 Q376,758 318,730Z"/></clipPath>
 <path d="M336,640 Q450,700 564,640 L582,730 Q524,758 462,730 L450,706 L438,730 Q376,758 318,730Z" fill="#5d6e55" stroke="#2f3a2a" stroke-width="4" stroke-linejoin="round"/>
 <g clip-path="url(#shortsClip)"><ellipse cx="380" cy="690" rx="30" ry="14" fill="#2f2512" opacity=".55"/><ellipse cx="500" cy="716" rx="22" ry="10" fill="#7a7030" opacity=".5"/><ellipse cx="420" cy="742" rx="18" ry="8" fill="#2f2512" opacity=".4"/>
  <path d="M450,706 L450,660" stroke="#2f3a2a" stroke-width="3"/><path d="M350,700 l16,6 M540,700 l-16,6" stroke="#2f3a2a" stroke-width="3" opacity=".5"/>
  <path d="M470,680 l14,-10 l8,12 l-10,10z" fill="#3b4a35" stroke="#2f3a2a" stroke-width="2"/><path d="M356,706 q6,-6 12,0 l-2,8 l-8,0z" fill="#3b4a35"/></g>
 <!-- belly overhang -->
 <path d="M312,596 Q450,662 588,596 Q580,646 450,682 Q320,646 312,596Z" fill="url(#skinG)" stroke="#6b4a3a" stroke-width="4" stroke-linejoin="round"/>
 <path d="M330,640 Q450,676 570,640" stroke="#a87a62" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
 <!-- tank top -->
 <clipPath id="tankClip"><path d="M404,326 Q450,368 496,326 L540,348 C554,400 558,440 548,474 Q540,484 530,478 Q516,492 500,482 Q484,494 468,484 Q450,496 432,484 Q416,494 400,482 Q384,492 370,478 Q360,484 352,474 C342,440 346,400 360,348 Z"/></clipPath>
 <path d="M404,326 Q450,368 496,326 L540,348 C554,400 558,440 548,474 Q540,484 530,478 Q516,492 500,482 Q484,494 468,484 Q450,496 432,484 Q416,494 400,482 Q384,492 370,478 Q360,484 352,474 C342,440 346,400 360,348 Z" fill="#8f927b" stroke="#4a4a3a" stroke-width="4" stroke-linejoin="round"/>
 <g clip-path="url(#tankClip)"><ellipse cx="404" cy="420" rx="50" ry="52" fill="#9a9d85"/><ellipse cx="496" cy="420" rx="50" ry="52" fill="#9a9d85"/><ellipse cx="396" cy="402" rx="26" ry="28" fill="#b9bda5" opacity=".7"/><ellipse cx="504" cy="402" rx="26" ry="28" fill="#b9bda5" opacity=".7"/><path d="M352,440 Q404,486 452,442 M448,442 Q496,486 548,440" stroke="#4a4a3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M450,374 Q444,414 450,446" stroke="#5a5c48" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M372,396 q10,14 4,30 M528,396 q-10,14 -4,30" stroke="#7d806a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="392" cy="410" rx="24" ry="14" fill="#5e4a2a" opacity=".6"/><ellipse cx="500" cy="396" rx="30" ry="10" fill="#6d6a2a" opacity=".55"/><ellipse cx="450" cy="448" rx="14" ry="9" fill="#a3322a" opacity=".5"/><ellipse cx="520" cy="458" rx="16" ry="8" fill="#5e4a2a" opacity=".5"/>
  <path d="M362,360 Q356,420 360,470 M538,360 Q544,420 540,470" stroke="#6f725f" stroke-width="9" fill="none" opacity=".6"/>
  <g stroke="#6f725f" stroke-width="3" fill="none"><path d="M376,430 q10,8 20,0 M470,420 q10,8 20,0"/></g>
  <path d="M396,372 l10,6 l-4,12 z" fill="#6d6a2a" opacity=".6"/></g>
 <path d="M404,326 Q450,368 496,326" fill="none" stroke="#4a4a3a" stroke-width="4"/>
 <path d="M404,326 L414,298 M496,326 L486,298" stroke="#4a4a3a" stroke-width="22" stroke-linecap="round"/>
 <path d="M404,326 L414,298 M496,326 L486,298" stroke="#8f927b" stroke-width="16" stroke-linecap="round"/>
 <!-- neck + double chin -->
 <ellipse cx="450" cy="308" rx="64" ry="38" fill="#e6c3ab" stroke="#6b4a3a" stroke-width="4.5"/>
 <ellipse cx="450" cy="296" rx="80" ry="32" fill="url(#skinG)" stroke="#6b4a3a" stroke-width="4.5"/>
 <path d="M386,300 Q450,334 514,300" stroke="#a87a62" stroke-width="4.5" fill="none" stroke-linecap="round"/>
 <path d="M404,316 Q450,340 496,316" stroke="#a87a62" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
 <!-- head -->
 <g transform="translate(450,196)"><use href="#headFace"/><use href="#eyesOpen"/><use href="#browsNeutral"/><use href="#mouthMain"/><use href="#headB"/></g>
 <!-- stink + flies -->
 <g stroke="#9fc060" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"><path d="M240,470 q-16,-22 0,-44 q16,-22 0,-44"/><path d="M262,490 q-12,-18 0,-36"/><path d="M660,480 q16,-22 0,-44 q-16,-22 0,-44"/><path d="M638,500 q12,-18 0,-36"/></g>
 <g fill="#222"><ellipse cx="248" cy="250" rx="6" ry="4.5"/><ellipse cx="654" cy="200" rx="6" ry="4.5"/><ellipse cx="630" cy="290" rx="5" ry="3.8"/></g>
 <g fill="#cfd8e8" opacity=".6"><ellipse cx="243" cy="244" rx="5" ry="3"/><ellipse cx="253" cy="244" rx="5" ry="3"/><ellipse cx="649" cy="194" rx="5" ry="3"/><ellipse cx="659" cy="194" rx="5" ry="3"/></g>
</g>
'''

def face(cx,cy,expr,label,extra=''):
    return (f'<g transform="translate({cx},{cy}) scale(.52)"><use href="#headA"/><use href="#{expr}"/>'
            + ('<use href="#browsNeutral"/>' if expr=='eyesOpen' else '') + '<use href="#headB"/>'+extra+'</g>'
            f'<text x="{cx}" y="395" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#fff">{label}</text>')

# Expressions use combined sets
faces = ''
faces += (f'<g transform="translate(965,262) scale(.52)"><use href="#headA"/><use href="#exprSleep"/><use href="#headB"/>'
          '<text x="70" y="-120" font-family="Georgia,serif" font-size="64" font-weight="bold" fill="#ffe27a">Z</text><text x="116" y="-150" font-family="Georgia,serif" font-size="44" font-weight="bold" fill="#ffe27a">z</text></g>'
          '<text x="965" y="395" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#fff">Durmiendo</text>')
faces += (f'<g transform="translate(1135,262) scale(.52)"><use href="#headA"/><use href="#exprSurp"/><use href="#headB"/>'
          '<text x="86" y="-110" font-family="Arial Black,Arial" font-size="70" font-weight="bold" fill="#ff6b6b">!</text></g>'
          '<text x="1135" y="395" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#fff">Sorprendida</text>')
faces += (f'<g transform="translate(1305,262) scale(.52)"><use href="#headA"/><use href="#exprSad"/><use href="#headB"/></g>'
          '<text x="1305" y="395" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#fff">Llorando</text>')
faces += (f'<g transform="translate(1475,262) scale(.52)"><use href="#headA"/><use href="#exprHappy"/><use href="#headB"/>'
          '<text x="80" y="-110" font-family="Arial Black,Arial" font-size="56" fill="#ffe27a">♪</text></g>'
          '<text x="1475" y="395" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#fff">Ilusionada</text>')

panels = f'''
<rect width="1600" height="1000" fill="url(#bg)"/>
<text x="800" y="50" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="36" fill="#ffe27a">DINA · Hoja de personaje · Día 0 (antes del glow up)</text>
<rect x="30" y="76" width="830" height="912" rx="22" fill="#0000003a" stroke="#ffffff30" stroke-width="2"/>
<text x="60" y="112" font-family="Arial,sans-serif" font-size="20" fill="#cfc8e8">Vista frontal · 2D</text>
{body}
<rect x="885" y="76" width="690" height="350" rx="22" fill="#0000003a" stroke="#ffffff30" stroke-width="2"/>
<text x="1230" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#ffe27a">Expresiones</text>
'''
# need panel wide enough for 4 faces: faces at 965..1475 -> inside 885..1575
panels += faces
panels += '''
<rect x="885" y="442" width="690" height="290" rx="22" fill="#0000003a" stroke="#ffffff30" stroke-width="2"/>
<text x="1230" y="474" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#ffe27a">Manos: uñas con mugre y esqueleto (rayos X)</text>
<g transform="translate(1030,512) scale(1.5)"><use href="#hand"/></g>
<text x="1030" y="715" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#fff">dedos regordetes, uñas sucias</text>
<clipPath id="xClip"><rect x="1220" y="492" width="320" height="224" rx="14"/></clipPath>
<rect x="1220" y="492" width="320" height="224" rx="14" fill="#0b2a3a" stroke="#4fd1ff" stroke-width="3"/>
<g clip-path="url(#xClip)"><g transform="translate(1380,614) scale(.8)">__XRAY__</g></g>
<text x="1530" y="512" text-anchor="end" font-family="Arial,sans-serif" font-size="14" fill="#bfefff">esqueleto de la mano</text>

<rect x="885" y="748" width="690" height="240" rx="22" fill="#0000003a" stroke="#ffffff30" stroke-width="2"/>
<text x="1020" y="780" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#ffe27a">Pies</text>
<g transform="translate(950,915) scale(1.25)"><use href="#foot"/></g>
<g transform="translate(1090,915) scale(1.25)"><use href="#foot" transform="scale(-1,1)"/></g>
<text x="1025" y="975" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#fff">dedos chuecos, uñas amarillas y mugre</text>
<text x="1410" y="780" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="#ffe27a">Paleta de color</text>
__SW__
'''
sw=[('Piel','#f0d3be'),('Sombra','#d9ab90'),('Cabello','#2f2a1a'),('Brillo grasa','#8c8a3e'),('Pus','#e9e07a'),
    ('Pus verde','#a4b84a'),('Dientes','#e8dc94'),('Blusa','#8f927b'),('Shorts','#5d6e55'),('Mugre','#4a3720')]
s=''
for i,(n,c) in enumerate(sw):
    x=1305+(i%5)*58; y=822+(i//5)*80
    s+=f'<circle cx="{x}" cy="{y}" r="20" fill="{c}" stroke="#fff" stroke-width="2.5"/><text x="{x}" y="{y+38}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#fff">{n}</text>'
panels=panels.replace('__SW__',s).replace('__XRAY__',xray_hand())
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">'+defs+panels+'</svg>'
open('/home/user/Jessito/dina/dina_character_sheet.svg','w').write(svg)
print(len(svg))
