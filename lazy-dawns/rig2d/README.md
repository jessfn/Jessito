# Lazy 2D — rig articulado por piezas (código + piezas PNG/SVG)

**Qué es:** un personaje 2D construido con piezas vectoriales independientes, dibujado por código (`character.mjs`), con jerarquía de huesos (grupos
`translate/rotate` anidados), IK de 2 huesos en brazos, dedos de 2 falanges, deformación por vértices en la falda, resortes en cabello/falda/aretes/dije y controles
faciales (parpadeo, mirada, cejas, visemas, expresiones). **No es un archivo de Spine/After Effects/Live2D ni un PSD**: el "proyecto editable" es este código + el SVG maestro.

## Uso
```bash
npm i @resvg/resvg-js           # (en la carpeta lazy-dawns ya está)
node rig2d/prueba_reposo.mjs     # pose de reposo -> /tmp/rest.png
node rig2d/anim_test.mjs         # animación de prueba 5 s -> rig2d/out/Lazy2D_prueba_5s.mp4 (1080x1920, 30 fps; requiere ffmpeg)
node rig2d/export_assets.mjs     # regenera piezas PNG/SVG, rig_map.json y SVG maestro
```
En código: `const P = defaultPose(); applyExpr(P,'happy'); applyViseme(P,'A'); P.armR = ik2(...)...; svg = renderCharacter(P)`.

## Qué se pidió por el creador (decisión final)
- **Contorno de cara, cuerpo, vestido rojo y accesorios:** diseño nuevo de `referencia_original.jpg`.
- **Ojos, cejas, nariz, boca, dientes y pelo:** los ORIGINALES de Lazy (módulo `../rig.mjs` + `../hair_hd.mjs`), montados sobre el contorno de cara nuevo.
  Por eso la cabeza se exporta como piezas grandes (`cabeza_rostro_pelo_trasero`, `pelo_frontal_aretes`) y sus rasgos se controlan por parámetros, no como PNG sueltos.
- Como extra opcional, `assets/alt_cara_referencia/` trae un kit de cara DISTINTO (diseño de la referencia) con ojos por componentes, cejas, nariz, labios, dientes y lengua.

## Qué está construido
Cuello, pecho, corsé, abdomen, banda, collar con dije, falda (base, interior de la abertura, panel izquierdo, 7 olanes, rosetón), brazos (superior, antebrazo, pulsera),
manos (palma + pulgar + 4 dedos de 2 falanges), muslos, pantorrillas, pies con sandalias rojas (dedos como círculos fijos). `assets/piezas_manifest.json` da el desplazamiento de cada PNG en el lienzo 1024x1536.

## Límites (para no afirmar de más)
- Dedos de los pies, tobillos y rodillas: sin articulación fina; el ciclo de caminata NO está hecho (solo rotaciones de pierna y `ik2` reutilizable).
- El giro de cabeza es un desplazamiento 2D de rasgos, no un giro 3D.
- Orejas del diseño nuevo quedan casi tapadas por el pelo original.
- No hay PSD/Krita/ORA: no se pudieron generar en este entorno; sí hay SVG por pieza y un SVG maestro con grupos.
- Artefacto conocido heredado del módulo de cara original: unos rectángulos translúcidos tenues cerca de las cejas y la nariz.
