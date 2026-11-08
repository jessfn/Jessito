# Tortillería 3D - paquete para página web

## Contenido
- `tortilleria.glb`  -> modelo 3D final (listo para web y videojuegos)
- `ejemplo-web.html` -> página de ejemplo con el modelo giratorio, SIN zoom
- `visor.html`       -> visor alterno hecho con Three.js (necesita internet)
- `scene.js`         -> código que genera el modelo (por si hay que modificarlo)
- `vistas/`          -> capturas del modelo (frente, izquierda, atrás, derecha, arriba)

## Instrucciones para integrarlo en la página web (para Claude u otra persona)
1. Copiar `tortilleria.glb` a la carpeta de la página, junto al HTML donde irá el modelo.
2. En el `<head>` agregar:
   `<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>`
3. En el lugar deseado agregar:
   `<model-viewer src="tortilleria.glb" alt="Tortillería en 3D" camera-controls disable-zoom disable-pan auto-rotate style="width:100%;height:500px"></model-viewer>`
   - `disable-zoom` quita el zoom (rueda y pellizco). `disable-pan` evita moverlo de lugar.
   - Quitar `auto-rotate` si solo debe girar cuando el usuario lo arrastre.
   - Limitar inclinación: `min-camera-orbit="auto 20deg auto" max-camera-orbit="auto 90deg auto"`.
4. Probar con un servidor local (no doble clic): `python3 -m http.server` y abrir `http://localhost:8000`.
   Abrir el HTML directo desde el disco bloquea la carga del .glb.
5. Si la página usa Three.js, cargar el .glb con GLTFLoader y usar OrbitControls con `enableZoom = false`.

## Notas del modelo
- Piezas con nombre: techo, letrero, maquina, papel_picado, vasija, canasta, costal, mazorca.
- Sin colisiones ni animaciones (rodillos y cinta están separados para animarlos).
- Estilo estilizado generado por código, no es una copia exacta de la imagen original.
