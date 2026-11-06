# Plan de desarrollo · TortilleríasMX

Sistema web (PWA) para capturar precios de la tortilla, datos de la tortillería y de su responsable, con mapa y visor de estadísticas.

- **App (captura + visor):** https://tortilleriasmx.geodatos.com.mx
- **API:** https://apitortillerias.geodatos.com.mx
- **Repositorio:** https://github.com/jessfn/tortilleriasmx.git (rama `main`)
- **Servidor:** VPS, carpeta `/var/www/`
- **Base de datos:** PostgreSQL (+ PostGIS), base `tortilleriasmx`

> ⚠️ **Credenciales:** este documento NO incluye contraseñas y no deben subirse a Git. Van en archivos `.env` en el servidor (ver T-003 y T-040).

---

## 1. Contexto para el otro chat (copiar y pegar)

> Vamos a construir **TortilleríasMX**, una PWA responsiva (celular y computadora) con API propia. Es para levantar el precio de la tortilla por tortillería en todo México.
>
> **Captura (capturista, en celular, con modo sin internet):** elegir estado y municipio, elegir una tortillería precargada (DENUE + propias) o dar de alta una nueva, marcar su ubicación con GPS, **tomar una foto de la tortillería**, capturar datos del responsable (nombre, apellidos, CURP, teléfono de 10 dígitos, tipo de persona física/moral, RFC) y el precio por kilo.
>
> **Perfiles:** Capturista, Supervisor (revisa alertas, valida tortillerías nuevas y fotos, ve datos personales) y Administrador (todo, más usuarios).
>
> **Visor:** sección aparte dentro de la misma app, tipo panel de administración: mapa de la República con puntos y precios, indicadores, rankings, tendencias, alertas de calidad y reporte PDF.
>
> **Diseño:** moderno, fluido, con colores del gobierno de México (guinda #9D2449 / #611232, verde #235B4E, dorado #BC955C, gris #98989A), pantallas de captura de una pregunta por paso y botones grandes.
>
> **Flujo de trabajo:** todo se sube primero a `main` en GitHub y luego se clona o actualiza en el VPS en `/var/www/`.
>
> Usa el plan con tickets de `PLAN_TortilleriasMX.md`. Yo te paso las credenciales del VPS y de la base en ese chat.

---

## 2. Stack recomendado

| Capa | Tecnología | Por qué |
|---|---|---|
| Lenguaje | **TypeScript** en todo | Un solo lenguaje, menos errores, mismo código de validación en app y API |
| Frontend | **React + Vite**, Tailwind CSS | Rápido, moderno, fácil de hacer responsivo |
| PWA | `vite-plugin-pwa` (Workbox) | Instalable, caché y modo sin internet |
| Datos en cliente | TanStack Query + IndexedDB (Dexie) | Cola de capturas sin internet |
| Mapas | **MapLibre GL JS** | Mapa fluido, sin licencia, soporta GeoJSON y puntos |
| Gráficas | Apache ECharts | Gráficas modernas y fluidas |
| API | **Node.js + Fastify** (TypeScript) | Ligero y rápido |
| Validación | Zod (compartido entre app y API) | Misma regla de CURP, RFC y teléfono en ambos lados |
| ORM | Drizzle ORM + SQL para PostGIS | Control de consultas geográficas |
| Base de datos | **PostgreSQL + PostGIS** | Ubicaciones, distancias, puntos dentro de municipio |
| Imágenes | `sharp` en la API | Redimensiona y comprime fotos, quita datos EXIF |
| PDF | Playwright (HTML a PDF) | Reporte con mapa y diseño institucional |
| Servidor | Nginx + PM2 + Certbot (SSL) | Despliegue sencillo en VPS |

**Estructura del repositorio (monorepo con pnpm):**

```
tortilleriasmx/
├─ apps/
│  ├─ web/        # PWA: captura + visor
│  └─ api/        # API Fastify
├─ packages/
│  └─ shared/     # tipos y validaciones Zod compartidas
├─ db/            # migraciones y semillas (catálogos, DENUE)
├─ deploy/        # nginx, pm2, deploy.sh
└─ docs/
```

---

## 3. Modelo de datos (resumen)

- **usuarios**: id, nombre, apellidos, correo/usuario, contraseña (hash), rol (`capturista` | `supervisor` | `admin`), activo, estado asignado (opcional).
- **estados / municipios**: catálogo INEGI (clave, nombre).
- **tortillerias**: id, id_denue, nombre comercial, domicilio, estado, municipio, `geom` (punto), origen (`denue` | `propia` | `nueva`), estatus (`pendiente` | `validada` | `rechazada`), foto_principal.
- **responsables**: tortillería_id, nombre, apellidos, **CURP**, **teléfono (10 dígitos)**, tipo_persona (`fisica` | `moral`), RFC, razón social (si es moral). CURP, RFC y teléfono se guardan cifrados.
- **capturas_precio**: tortillería_id, producto (maíz, harina, masa), precio_kg, fecha, capturista_id, `geom_captura`, precisión_gps, estatus, bandera de alerta.
- **fotos**: tortillería_id, archivo, miniatura, capturista_id, fecha.
- **alertas**: tipo (precio atípico, GPS fuera de municipio, duplicado, RFC/CURP inválido), captura_id, estatus.
- **auditoria**: quién vio o cambió datos personales, y cuándo.
- **consentimientos**: aviso de privacidad aceptado, fecha y versión.

**Reglas de validación de datos personales**

- **Nombre y apellidos:** obligatorios, solo letras, acentos, ñ, espacios, guion y apóstrofo.
- **CURP:** 18 caracteres en mayúsculas, formato oficial `^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$`.
- **Teléfono:** exactamente 10 dígitos, solo números. El campo no deja escribir más de 10.
- **RFC:** persona física 13 caracteres; persona moral 12 caracteres.
- **Precio:** entre $5 y $60 por kilo.

---

## 4. Tickets

Estimación en días de trabajo de una persona (D). Prioridad: **P0** imprescindible, **P1** importante, **P2** deseable.

### Épica 0 · Preparación y servidor

**T-001 · Crear la estructura del repositorio** · P0 · 0.5 D
Monorepo pnpm con `apps/web`, `apps/api`, `packages/shared`, ESLint, Prettier, TypeScript y `.gitignore` (incluye `.env`).
*Listo cuando:* `pnpm install` y `pnpm dev` levantan app y API en local, y el primer commit está en `main`.

**T-002 · Configurar DNS y preparar el VPS** · P0 · 0.5 D
Registros A de `tortilleriasmx` y `apitortillerias` apuntando a la IP del VPS. Instalar Node LTS, pnpm, PM2, Nginx, Certbot, PostgreSQL y PostGIS, Git.
*Listo cuando:* ambos subdominios resuelven y Nginx responde.

**T-003 · Seguridad básica del servidor** · P0 · 0.5 D
Crear usuario de despliegue (no usar `root` a diario), acceso por llave SSH, desactivar acceso por contraseña, firewall (solo 22, 80 y 443), PostgreSQL escuchando solo en `localhost`, `.env` fuera del repositorio.
*Listo cuando:* no se puede entrar por contraseña y la base no es accesible desde fuera.

**T-004 · Crear la base de datos** · P0 · 0.5 D
Base `tortilleriasmx`, usuario `jesus` con permisos solo sobre esa base, extensiones `postgis` y `pgcrypto`. Contraseña fuerte guardada solo en `.env`.
*Listo cuando:* la API se conecta y corre la primera migración.

### Épica 1 · Base de datos y catálogos

**T-010 · Migraciones del modelo de datos** · P0 · 1 D
Tablas de la sección 3, índices espaciales (GiST) y llaves foráneas.
**T-011 · Catálogo de estados y municipios (INEGI)** · P0 · 0.5 D
Carga con claves oficiales y, si es posible, polígonos para validar el GPS.
**T-012 · Importador del DENUE** · P0 · 1.5 D
Script que consulta la API del DENUE (token gratuito de INEGI), actividad SCIAN 311830, por entidad. Deduplica por nombre, domicilio y cercanía (< 50 m) y se puede ejecutar de nuevo sin duplicar.
**T-013 · Cifrado de datos personales** · P0 · 1 D
CURP, RFC y teléfono cifrados en la base (AES-256 con llave en `.env`) y búsqueda por hash para detectar duplicados.

### Épica 2 · API

**T-020 · Base de la API** · P0 · 1 D
Fastify, validación con Zod, manejo de errores, CORS solo para `tortilleriasmx.geodatos.com.mx`, límite de peticiones, documentación OpenAPI.
**T-021 · Autenticación y roles** · P0 · 1.5 D
Inicio de sesión, tokens de acceso con renovación, contraseñas con Argon2, roles `capturista`, `supervisor` y `admin`, bloqueo por intentos fallidos.
**T-022 · Catálogos y búsqueda de tortillerías** · P0 · 1 D
Estados, municipios y tortillerías por municipio con búsqueda por nombre y por cercanía.
**T-023 · Registro de tortillería nueva** · P0 · 1 D
Alta con ubicación y estatus `pendiente`, detección de posible duplicado cercano.
**T-024 · Registro de responsable con datos personales** · P0 · 1 D
Nombre, apellidos, CURP, teléfono de 10 dígitos, tipo de persona y RFC con las reglas de la sección 3. Los datos se devuelven completos solo a supervisor y admin; el capturista ve datos enmascarados.
**T-025 · Captura de precios** · P0 · 1 D
Alta de precio con rango permitido, fecha, ubicación y precisión del GPS. Cálculo automático de alertas.
**T-026 · Subida de fotos** · P0 · 1 D
Recibe imagen (JPG/PNG/HEIC, máx. 10 MB), valida el tipo real del archivo, la reduce (máx. 1600 px), crea miniatura, elimina datos EXIF y guarda en disco del servidor. Nginx las sirve con acceso controlado.
**T-027 · Alertas automáticas** · P1 · 1 D
Precio atípico (±30 % de la mediana municipal), GPS fuera del municipio, tortillería duplicada, formato inválido.
**T-028 · Endpoints de estadísticas del visor** · P0 · 2 D
Promedios, mínimos y máximos por estado y municipio, tendencia por semana, ranking, cobertura contra el DENUE, porcentaje de persona física y moral, avance por capturista.
**T-029 · Validación y supervisión** · P0 · 1 D
Supervisor aprueba o rechaza tortillerías nuevas, fotos y capturas con alertas, con comentario.
**T-030 · Administración de usuarios** · P1 · 1 D
Alta, baja, cambio de rol y restablecimiento de contraseña por admin.
**T-031 · Auditoría y consentimiento** · P0 · 0.5 D
Registro de quién consulta datos personales y almacenamiento del aviso de privacidad aceptado.
**T-032 · Reporte PDF con mapa** · P1 · 2 D
Plantilla institucional con mapa de la República, indicadores y filtros por estado y periodo.
**T-033 · Exportación a Excel/CSV** · P2 · 0.5 D
Datos sin información personal para dirección; completos para admin.

### Épica 3 · App web (PWA) · Captura

**T-040 · Sistema de diseño y base responsiva** · P0 · 2 D
Colores institucionales, tipografía, componentes (botones grandes, campos, tarjetas, ventanas emergentes fluidas con animación suave), modo claro y oscuro, enfoque primero en celular y adaptación a pantallas grandes.
**T-041 · PWA instalable** · P0 · 1 D
Manifiesto, íconos, pantalla de inicio, caché de la app, aviso de nueva versión y botón «Instalar».
**T-042 · Inicio de sesión y navegación por rol** · P0 · 1 D
Pantalla de acceso, rutas protegidas y menú según perfil.
**T-043 · Captura paso 1: estado y municipio** · P0 · 0.5 D
Listas en cascada con búsqueda.
**T-044 · Captura paso 2: elegir o agregar tortillería** · P0 · 1.5 D
Buscador, tarjetas con distancia, opción «No aparece, agregar nueva» con sus datos (nombre, domicilio, tipo).
**T-045 · Captura paso 3: ubicación en el mapa** · P0 · 1.5 D
Mapa con pin movible, botón «Usar mi ubicación», indicador de precisión del GPS y aviso si es baja.
**T-046 · Captura paso 4: foto de la tortillería** · P0 · 1.5 D
Abre la cámara del celular, vista previa, repetir foto, compresión en el dispositivo antes de enviar. Foto obligatoria al dar de alta una tortillería nueva y opcional en las existentes.
**T-047 · Captura paso 5: datos personales del responsable** · P0 · 2 D
Campos: nombre, apellidos, **CURP**, **teléfono (limitado a 10 dígitos)**, tipo de persona (física/moral), RFC y razón social si es moral. Validación en vivo con mensajes claros, mayúsculas automáticas, teclado numérico para el teléfono y aviso de privacidad con casilla.
**T-048 · Captura paso 6: precio y envío** · P0 · 1 D
Teclado numérico grande, producto, forma de venta, resumen final y confirmación animada.
**T-049 · Modo sin internet** · P0 · 2.5 D
Cola local en IndexedDB para capturas y fotos, sincronización automática al volver la señal, indicador de pendientes y manejo de errores.
**T-050 · Mis capturas** · P1 · 1 D
Historial del capturista con estatus (enviada, pendiente de sincronizar, rechazada) y motivo.

### Épica 4 · App web · Supervisión

**T-060 · Bandeja de revisión** · P0 · 2 D
Lista de tortillerías nuevas, fotos, precios con alerta y datos por validar. Aprobar, rechazar y comentar con una acción.
**T-061 · Ficha de tortillería** · P1 · 1 D
Datos, foto, ubicación, historial de precios y datos del responsable (solo con permiso, con registro en auditoría).

### Épica 5 · Visor de estadísticas (sección aparte, estilo panel de administración)

**T-070 · Estructura del visor** · P0 · 1.5 D
Ruta propia (`/visor`), menú lateral en computadora y menú inferior en celular, filtros globales (estado, municipio, producto, tipo de persona, periodo).
**T-071 · Mapa de la República** · P0 · 3 D
Mapa con estados coloreados por precio promedio, puntos por tortillería con su precio, etiquetas de ciudades, acercamiento a municipio, ventana al tocar un punto y leyenda.
**T-072 · Tarjetas de indicadores** · P0 · 1 D
Precio promedio, rango, tortillerías con precio, cobertura del DENUE, porcentaje de persona física y moral.
**T-073 · Gráficas** · P0 · 2 D
Tendencia semanal, ranking de estados, distribución de precios, avance por capturista.
**T-074 · Panel de alertas y calidad de datos** · P1 · 1 D
Precios atípicos, duplicados, puntos fuera del municipio, pendientes de validar.
**T-075 · Tabla de datos y exportación** · P1 · 1.5 D
Tabla filtrable, descarga CSV y botón de reporte PDF.
**T-076 · Administración (solo admin)** · P1 · 1.5 D
Usuarios, roles, catálogo de tortillerías y estado de la última carga del DENUE.

### Épica 6 · Calidad y despliegue

**T-080 · Pruebas automáticas** · P0 · 2 D
Validaciones (CURP, RFC, teléfono, precio), permisos por rol, flujo completo de captura y sincronización.
**T-081 · Rendimiento y accesibilidad** · P1 · 1 D
Lighthouse en celular (PWA, rendimiento y accesibilidad ≥ 90), carga diferida del mapa y las gráficas.
**T-082 · Configuración de Nginx y SSL** · P0 · 0.5 D
Dos sitios: `apitortillerias.geodatos.com.mx` hacia la API (puerto interno) y `tortilleriasmx.geodatos.com.mx` con los archivos de la app y respaldo para rutas internas. Certificados con Certbot y renovación automática, compresión y caché.
**T-083 · Script de despliegue** · P0 · 1 D
`deploy.sh`: entra a `/var/www/tortilleriasmx`, hace `git pull` de `main`, instala dependencias, compila, corre migraciones y reinicia con PM2. Primera vez: `git clone https://github.com/jessfn/tortilleriasmx.git` en `/var/www/`.
**T-084 · Respaldos** · P0 · 0.5 D
Respaldo diario de PostgreSQL y de la carpeta de fotos, con retención de 14 días.
**T-085 · Monitoreo y registros** · P2 · 0.5 D
PM2 con reinicio automático, rotación de logs y revisión de salud (`/health`).
**T-086 · Aviso de privacidad y documentación** · P1 · 1 D
Texto del aviso (a validar por jurídico), manual del capturista de 1 página y guía de despliegue.
**T-087 · Piloto y ajustes** · P0 · 3 D
Prueba en un estado con capturistas reales, corrección de errores y mejoras de usabilidad.

---

## 5. Orden sugerido y tiempos

| Fase | Tickets | Resultado | Tiempo aprox. |
|---|---|---|---|
| 1. Base | T-001 a T-004, T-010 a T-013 | Repo, servidor y base listos con catálogos y DENUE | 1 a 1.5 semanas |
| 2. API | T-020 a T-031 | API segura con roles, datos personales y fotos | 2 semanas |
| 3. Captura | T-040 a T-050 | PWA de captura funcionando incluso sin internet | 2 a 2.5 semanas |
| 4. Supervisión y visor | T-060 a T-076, T-032, T-033 | Revisión, mapa y estadísticas | 2.5 a 3 semanas |
| 5. Cierre | T-080 a T-087 | Pruebas, despliegue, respaldos y piloto | 1.5 a 2 semanas |

Total estimado: **9 a 11 semanas** para una persona; menos si se trabaja en paralelo (API y diseño). El visor puede entregarse antes con datos de prueba para presentarlo.

---

## 6. Flujo de trabajo con Git y despliegue

1. Todo el desarrollo se sube a `main` en `github.com/jessfn/tortilleriasmx`.
2. En el VPS, primera vez: `cd /var/www && git clone https://github.com/jessfn/tortilleriasmx.git`.
3. Cada actualización: `cd /var/www/tortilleriasmx && ./deploy/deploy.sh` (pull, compilación, migraciones y reinicio).
4. Las claves y contraseñas viven solo en `.env` del servidor, nunca en Git.

## 7. Recomendaciones de seguridad importantes

- Las credenciales del VPS y de la base se compartieron por chat: **cámbialas** cuando termine el despliegue y usa llaves SSH en lugar de contraseña de `root`.
- La contraseña de la base es muy corta; conviene una más larga y distinta, con la base accesible solo desde el mismo servidor.
- CURP, RFC, teléfono y nombre completo son datos personales: cifrado, acceso por rol, registro de consultas y aviso de privacidad aprobado por jurídico antes de operar.
- Las fotos de fachada pueden mostrar a personas; se pide tomar solo el frente del local y se eliminan los datos EXIF.
