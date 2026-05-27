# PRODUCT.md

Documento de producto. Alcance, principios, fases y criterios de aceptación del MVP v1. Compañero de `CLAUDE.md` (que cubre arquitectura, convenciones técnicas y roadmap de PRs).

Actualizar junto al producto cada vez que cambien decisiones de alcance.

---

## 1. Qué es la aplicación

Aplicación de alquiler de espacios íntimos por horas. Un usuario puede publicar un espacio de su casa (inicialmente, su baño) para que otro usuario lo use durante una ventana temporal acordada, a cambio del precio que el dueño decida.

Cada usuario es **tanto host como guest** según el contexto. No hay roles separados: la misma cuenta puede publicar espacios y reservar otros.

El nombre interno del producto es **Sanctuary**.

---

## 2. Principios de producto

Decisiones que se mantienen durante todo el MVP v1 y condicionan el resto del documento.

### 2.1 Libertad total del host
- El host fija el precio que quiere (3 €, 50 €, 200 €, lo que decida).
- El host fija la duración mínima y máxima de cada reserva (30 min, 1 h, 2 h, 1 día).
- El host decide manualmente qué reservas acepta.

La aplicación no impone tiering, validación de precio ni categorías. La única restricción es que el precio sea ≥ 0 y la duración > 0.

### 2.2 Mapa como pieza central
La pantalla principal del guest es un mapa con espacios cercanos. El listado en carrusel ("Curated Escapes") complementa el mapa, no lo sustituye.

### 2.3 Reservas planificadas, gestionadas manualmente por el host
Toda reserva tiene fecha y hora futuras. El guest elige cuándo quiere usar el espacio; el host acepta o rechaza explícitamente. No hay reservas instantáneas, smart locks ni acceso automatizado en el MVP v1.

### 2.4 Sin pagos integrados
El intercambio económico ocurre fuera de la aplicación. La aplicación registra el precio acordado pero no lo cobra. Decisión documentada en CLAUDE.md §13.4.

### 2.5 Estética "Sanctuary"
El diseño Figma marca el tono visual: producto cuidado, premium, calmado. No es una app utilitaria de emergencia ni una app low-cost. El copy, los colores y los componentes se alinean con esa estética.

### 2.6 Separación entre estado del espacio y estado de la reserva
El **espacio** tiene un estado operativo permanente (`published` / `archived`) y un flag de bloqueo controlado por el host (`is_blocked`). La **reserva** tiene su propio ciclo de vida independiente (`pending_host_approval` → `confirmed` → `in_use` → `completed`, más ramas alternativas).

La pregunta *"¿este baño está libre el lunes a las 18:00?"* no se contesta consultando un campo del baño: se calcula viendo si hay reservas activas en esa franja. Un mismo baño puede tener decenas de reservas pasadas, presentes y futuras en distintos estados. Decisión documentada en CLAUDE.md §13.5.

---

## 3. Usuarios y casos de uso

### 3.1 El usuario
Una sola entidad: persona registrada con nombre, apellidos, email y avatar opcional. Puede actuar como host (cuando ha publicado al menos un espacio) o como guest (cuando reserva).

El campo `profile.is_host` se activa automáticamente al publicar el primer espacio. No es un toggle manual ni un proceso de verificación.

### 3.2 Cómo descubre el guest la app
Asumimos que el guest llega a la app por canales externos (boca a boca, redes, recomendación) y la abre con la idea aproximada de "quiero ver qué espacios hay cerca". El MVP v1 no incluye onboarding tutorial ni explicación del producto dentro de la app.

### 3.3 Por qué publica un host
El host publica porque tiene un espacio que considera atractivo y quiere monetizarlo cuando él no lo usa. La motivación específica de cada host (sacar dinero, compartir lujo, ayudar puntualmente) no condiciona el diseño: el flujo es el mismo en todos los casos.

---

## 4. Alcance del MVP v1

### 4.1 Pantallas incluidas

Numeradas para referencia desde los SPECs.

| # | Pantalla | Descripción breve |
|---|---|---|
| P1 | Login | Email + contraseña. Existe hoy, requiere theme sweep. |
| P2 | Registro | Email + contraseña + nombre + apellidos. Existe hoy, requiere theme sweep. |
| P3 | Home / Explorar | Mapa con pins de espacios publicados + carrusel "Curated Escapes" debajo. |
| P4 | Detalle de espacio | Foto principal, info, descripción, ubicación en mapa, CTA "Reservar". |
| P5 | Confirmar reserva | Selección de fecha y duración, desglose de precio, CTA "Solicitar reserva". |
| P6 | Mis reservas (guest) | Lista de reservas con estado: pending, confirmed, in_use, completed, rejected, cancelled, no_show. |
| P7 | Mi perfil | Datos personales, avatar, navegación a "Mis espacios" si es host. |
| P8 | Mis espacios (host) | Lista de espacios publicados por el usuario, con toggle de bloqueo (`is_blocked`) por espacio. |
| P9 | Publicar espacio (flujo BecomeHost) | 6 pasos: descripción → ubicación → fotos → precio → duración → publicar. |
| P10 | Solicitudes recibidas (host) | Lista de bookings entrantes y en curso, con acciones según estado. |

### 4.2 Flujos completos del MVP v1

Cada flujo va de inicio a fin. Si un flujo no funciona end-to-end, el MVP no está terminado.

**F1 — Registro y login:** un usuario nuevo crea cuenta, sale de la app, vuelve a entrar y su sesión persiste.

**F2 — Publicar un espacio:** un usuario completa los 6 pasos del flujo BecomeHost. Al final, su espacio aparece publicado y visible en el Home de cualquier otro usuario. Su perfil pasa automáticamente a `is_host = true`.

**F3 — Descubrir un espacio:** un usuario abre el Home, ve pins en el mapa, hace tap en uno, navega al detalle del espacio.

**F4 — Solicitar una reserva:** un usuario en el detalle de un espacio tap "Reservar", elige fecha y duración dentro de los límites del host, ve el precio total, confirma. Se crea un booking en estado `pending_host_approval`. La reserva queda visible en P6 (mis reservas, lado guest) y P10 (solicitudes recibidas, lado host).

**F5 — Aceptar o rechazar una reserva (host):** desde P10, el host ve la solicitud y decide. `pending_host_approval` → `confirmed` o `rejected`.

**F6 — Gestionar la llegada y salida del guest (host):** cuando se acerca la franja, el host puede marcar la reserva como `in_use` al llegar el guest, y como `completed` al terminar. También puede marcar `no_show` si el guest no se presenta. Todas estas transiciones son explícitas del host, ningún cambio es automático por tiempo.

**F7 — Bloquear / desbloquear un espacio (host):** desde P8, el host puede activar el flag `is_blocked` de un espacio. Mientras esté activo, no se aceptan nuevas reservas sobre ese espacio. Las reservas ya existentes mantienen su ciclo de vida normal.

**F8 — Ver mis reservas (guest):** el guest entra en P6 y ve sus bookings con su estado actual.

**F9 — Cancelar una reserva (guest):** desde P6, el guest puede cancelar un booking propio mientras esté en `pending_host_approval` o `confirmed`. Pasa a `cancelled_by_guest`.

### 4.3 Modelo de estados

#### Espacio (`spaces`)
Dos propiedades independientes:

- **`status`**: `draft` (en edición) → `published` (visible y reservable) → `archived` (retirado por el host).
- **`is_blocked`**: booleano controlado por el host. Cuando es `true`, el espacio no acepta nuevas reservas hasta que el host lo desactive.

El "estado visible para el guest" en P3 y P4 es una **combinación derivada**, no un campo:
- Si `status = 'published'` y `is_blocked = false` → reservable.
- En cualquier otro caso → no reservable (o no visible).

#### Reserva (`bookings`)
Ciclo de vida con transiciones explícitas, todas iniciadas por el host o por el guest:

````
pending_host_approval
    ├── host acepta ────→ confirmed
    │                       ├── host marca llegada ──→ in_use
    │                       │                            ├── host marca terminado ──→ completed
    │                       │                            └── (no hay salida automática)
    │                       ├── host marca no_show ───→ no_show
    │                       └── guest cancela ─────────→ cancelled_by_guest
    ├── host rechaza ───→ rejected
    └── guest cancela ──→ cancelled_by_guest
````

**Estados que bloquean la franja temporal del espacio:** `pending_host_approval`, `confirmed`, `in_use`. Estos estados están protegidos por el constraint `EXCLUDE USING gist` de la BD (CLAUDE.md §4.2): no puede haber dos bookings en estos estados con franjas solapadas para el mismo espacio.

**Estados que liberan la franja temporal:** `completed`, `rejected`, `cancelled_by_guest`, `no_show`. No bloquean disponibilidad futura del mismo slot.

**Regla clave (principio 2.6):** solo el host puede transicionar `confirmed → in_use` y `in_use → completed`. Estas transiciones son manuales y reflejan acciones del mundo real (el guest llegó / terminó). Ningún temporizador automático las hace.

### 4.4 Estados de UI: loading, empty, error

Cada pantalla del MVP v1 cubre los tres estados:

- **Loading**: skeleton o spinner mientras carga datos.
- **Empty**: mensaje claro cuando no hay datos (ej: "Aún no has reservado ningún espacio").
- **Error**: mensaje y CTA de reintentar cuando falla la carga.

No es opcional. Una pantalla sin estos tres estados no se considera terminada.

---

## 5. Fuera del MVP v1

Lista explícita de lo que **NO** está en el MVP v1. Si en algún momento se quiere añadir, requiere actualizar este documento y el roadmap del CLAUDE.md.

### 5.1 Funcionalidad
- **Pagos integrados** (Stripe Connect). Decisión: CLAUDE.md §13.4.
- **Reviews y ratings**. Las pantallas pueden mostrar UI placeholder (estrellas vacías, "Sin reviews aún") pero no hay tabla `reviews` ni flujo asociado.
- **Mensajería entre guest y host**. El guest puede dejar `notes` en el booking (mensaje único unidireccional), pero no hay hilo de conversación.
- **Bloqueos por franjas temporales del host**. El campo `is_blocked` es un booleano global por espacio (todo o nada). Si el host quiere "no recibir reservas el lunes de 14 a 16", no es posible en v1. La tabla `space_blocked_periods` se valorará en v2.
- **Add-ons** ("Artisan Coffee Service", etc.). El Figma los muestra; el MVP v1 los ignora.
- **Smart lock / acceso automático**. El host abre la puerta físicamente.
- **Notificaciones push**. El host se entera de nuevas solicitudes solo entrando en la app. Implicación: los hosts tienen que entrar regularmente para ver solicitudes pendientes. Documentado como limitación conocida del MVP.
- **Búsqueda y filtros avanzados**. El Home muestra todos los espacios publicados ordenados por proximidad o fecha de creación. Sin filtro por precio, tipo, amenities, etc.
- **Favoritos / "Saved"**. El Figma lo muestra; el MVP v1 lo ignora.
- **Recuperación de contraseña**. Roadmap corto, no en v1. Si un usuario olvida su contraseña, no puede recuperarla en v1.
- **OAuth (Google, Apple, etc.)**. Solo email + contraseña.
- **Verificación de identidad** (DNI, selfie, etc.). El usuario es quien dice ser y punto.
- **Multi-idioma activo**. Toda la UI en español. Estructura `src/copy/` preparada para i18n futura, sin librería de i18n cargada.
- **Cálculo de distancia o tiempo de trayecto**. El Home ordena por proximidad geográfica simple (cercanía bruta de coordenadas), no por tiempo real de trayecto. Sin integración con Google Distance Matrix ni similares.

### 5.2 Dominio
- **Cocinas y otros tipos de espacio.** El modelo SQL soporta `type='kitchen'`, pero el enum solo tiene `'bathroom'` y la UI no expone el selector. Activar cocinas es la checklist de CLAUDE.md §12.

### 5.3 Plataforma
- **Tests E2E.** No bloqueante para MVP v1. Detectar regresiones depende de revisión manual.
- **CI / CD.** Setup local únicamente.
- **Analytics, telemetría, crash reporting.** Sin Sentry, sin Mixpanel, sin Firebase Analytics.
- **App Store / Play Store.** El MVP v1 corre en Expo Go (móvil) y en build web. Distribución pública post-MVP.

---

## 6. Fases de construcción

El MVP v1 se construye en fases. Cada fase produce un sistema funcional end-to-end aunque incompleto: al final de cada fase hay algo demostrable.

**Las fases consumen el roadmap de PRs de infraestructura definido en CLAUDE.md §11**. Fase 0 ejecuta los PRs §11.1 a §11.6 antes de empezar producto. Las fases 1-4 ejecutan los PRs de producto.

### Fase 0 — Infraestructura

Sin esto, las fases siguientes parten de un terreno sucio. PRs en este orden:

1. CLAUDE.md §11.4 — Migración Supabase + types generados + tabla `bookings` con todos los estados (incluidos `in_use` y `no_show`) + flag `is_blocked` en `spaces`.
2. CLAUDE.md §11.1 — Tooling (ESLint + Prettier).
3. CLAUDE.md §11.2 — Carga de fuentes con `expo-font`.
4. CLAUDE.md §11.3 — Theme sweep en pantallas existentes.
5. CLAUDE.md §11.5 — React Query + primer hook modelo (`useProfileQuery`).
6. CLAUDE.md §11.6 — Limpieza Navbar muerto.

**Criterio de fase completada:** el repo pasa `lint`, `typecheck` y `format` sin errores; las pantallas existentes consumen el theme correctamente; cualquier fetch de Supabase nuevo se hace vía hook React Query; el esquema SQL en producción es el de CLAUDE.md §4.2.

### Fase 1 — Vertical slice "Publicar un espacio"

**Objetivo:** un usuario puede completar el flujo BecomeHost de principio a fin y ver su espacio publicado.

**Pantallas:** P9 (flujo BecomeHost completo), P8 (Mis espacios) — incluyendo el toggle `is_blocked`.

**Flujos cubiertos:** F2, F7.

**Criterio de fase completada:** un usuario sin espacios publicados puede crear uno completando los 6 pasos. El espacio queda en BD con `status='published'`. El usuario puede verlo en "Mis espacios" y puede activar/desactivar el bloqueo. `profile.is_host` queda en `true`.

### Fase 2 — Vertical slice "Descubrir un espacio"

**Objetivo:** un usuario puede ver espacios publicados por otros y abrir el detalle de uno.

**Pantallas:** P3 (Home con mapa + carrusel real), P4 (Detalle).

**Flujos cubiertos:** F3.

**Cambios técnicos clave:** mata el mock `FEATURED_SPACES`, conecta el carrusel y el mapa a Supabase vía hook React Query. Los espacios con `is_blocked = true` no aparecen en el Home aunque estén `published`.

**Criterio de fase completada:** desde el Home se ven todos los espacios publicados y no bloqueados (no los propios borradores ni los archivados ni los bloqueados). El mapa muestra pins ubicados correctamente. Tap en un pin o card abre el detalle. El detalle muestra todos los campos del espacio.

### Fase 3 — Vertical slice "Reservar y gestionar reservas"

**Objetivo:** ciclo completo de reserva desde solicitud hasta finalización, con transiciones manuales del host.

**Pantallas:** P5 (Confirmar reserva), P6 (Mis reservas, lado guest), P10 (Solicitudes recibidas, lado host).

**Flujos cubiertos:** F4, F5, F6, F8, F9.

**Cambios técnicos clave:** primer uso real de la tabla `bookings`. Validación del rango temporal contra el constraint `EXCLUDE USING gist`. UI para mostrar el estado del booking y para que el host realice las transiciones manuales (`confirmed → in_use → completed`, y rama `no_show`).

**Criterio de fase completada:** el ciclo completo guest → host → guest funciona en todas sus ramas: el guest solicita, el host acepta/rechaza, el host marca llegada y salida, el host puede marcar no-show, el guest puede cancelar. Cada acción tiene su feedback visual y el estado se sincroniza correctamente entre P6 y P10.

### Fase 4 — Pulido

**Objetivo:** la app está demostrable de extremo a extremo sin romperse en casos comunes.

**Tareas:**
- P7 (Mi perfil) completo y conectado a `useProfileQuery`.
- Estados loading / empty / error en todas las pantallas (§4.4).
- Validaciones de formularios (precio ≥ 0, duración > 0, fecha futura, etc.).
- Manejo de errores de red consistente.
- Pasada visual completa contra Figma.
- Testing manual del happy path en web e iOS.

**Criterio de fase completada:** un usuario nuevo puede completar los flujos F1 a F9 sin ver pantallas en blanco, errores sin manejar, o estados inconsistentes. El MVP v1 está listo.

---

## 7. Metodología de desarrollo

Cada fase produce uno o varios `SPEC.md` antes de tocar código. El `SPEC.md` vive en `specs/<fase>-<slice>/SPEC.md` y describe:

- **Objetivo**: qué hace esta funcionalidad.
- **Pantallas afectadas**: referencias a §4.1.
- **Flujos cubiertos**: referencias a §4.2.
- **Datos**: qué tablas y campos toca, qué queries y mutations se necesitan.
- **Criterios de aceptación**: checklist verificable de "esto está hecho cuando...".
- **Fuera de scope**: lo que explícitamente NO se hace en este SPEC.
- **Dudas abiertas**: cosas a decidir antes de codear.

Una vez aprobado el `SPEC.md`, se procede a implementar. El `SPEC.md` no se modifica durante la implementación: si surge una decisión nueva, se anota como hallazgo y se actualiza al cierre del slice.

---

## 8. Cómo se mide que el MVP v1 está listo

El MVP v1 está listo cuando se cumplen, simultáneamente:

1. **Funcional**: los nueve flujos F1-F9 funcionan end-to-end en web e iOS sin errores.
2. **Calidad de código**: el repo pasa `lint`, `typecheck` y `format`. Ninguna regla de CLAUDE.md §8 está violada.
3. **Visual**: cada pantalla coincide razonablemente con su contraparte en Figma. No pixel-perfect, pero sí coherente con la estética "Sanctuary".
4. **Robustez**: cada pantalla maneja loading, empty y error sin romperse.
5. **Documentación**: CLAUDE.md y PRODUCT.md están sincronizados con el estado real del repo. §5 de CLAUDE.md tiene todos los flujos del MVP en ✅.

Cuando se cumpla todo lo anterior, el MVP v1 se cierra. La siguiente versión (v2) se planificará en un nuevo ciclo de PRODUCT.md.