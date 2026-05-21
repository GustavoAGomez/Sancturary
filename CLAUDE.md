# CLAUDE.md

Guía viva para cualquier asistente o contribuyente que trabaje en este repositorio. Actualizar junto al código cada vez que cambien decisiones arquitectónicas.

---

## 1. Visión del producto

**Sanctuary** es un marketplace de alquiler de **espacios por horas**. Dominio inicial: **baños**. Extensible a cocinas y, potencialmente, a otros espacios (salas, estudios, etc.).

**Regla de diseño de oro (no negociable):**
Modelar todo como `Space` con campo `type: 'bathroom' | 'kitchen' | ...` (enum extensible). El tipo es **siempre un dato, nunca parte del identificador**. Queda prohibido hardcodear `bathroom` / `baño` / `kitchen` / `cocina` en nombres de componentes, hooks, funciones, columnas o variables reutilizables.

> El nombre interno del producto es **Sanctuary**. La estética visual ("The Sanctuary") referenciada en §6 se alinea con este nombre. Cualquier copy de UI o asset que mencione el nombre del producto debe usar "Sanctuary".

**Excepción permitida:** copys de UI que hablen al usuario de un espacio concreto. Eso es contenido, no arquitectura, y vive en `src/copy/` (ver §8).

**Dominio del MVP v1: solo baños.** El modelo de datos (§4.2) está diseñado para soportar cocinas (`type='kitchen'`) y otros tipos sin tocar arquitectura. La UI del MVP v1 expone únicamente `bathroom`; cocinas se activan en una fase posterior siguiendo la checklist de §12. Esta restricción es deliberada: probar la abstracción del modelo manteniendo un alcance acotado.

---

## 2. Stack técnico

Versiones exactas según `package.json` y `node_modules/*/package.json` (a 2026-04-22):

| Paquete | Versión | Uso |
|---|---|---|
| `expo` | 54.0.33 | SDK base |
| `react` / `react-dom` | 19.1.0 | |
| `react-native` | 0.81.5 | |
| `react-native-web` | ^0.21.0 | Render web |
| `typescript` | ~5.9.2 | `tsconfig.json` extiende `expo/tsconfig.base` (strict heredado) |
| `@react-navigation/native` | ^7.1.33 | Navegación v7 |
| `@react-navigation/native-stack` | ^7.14.5 | Stack raíz |
| `@react-navigation/bottom-tabs` | ^7.15.5 | Pestañas |
| `@supabase/supabase-js` | ^2.99.1 | Backend (BaaS) |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistencia de sesión Supabase |
| `react-native-maps` | 1.20.1 | Solo nativo |
| `expo-image-picker` | ~17.0.10 | Selección avatar |
| `base64-arraybuffer` | ^1.0.2 | Subida a Storage |
| `react-native-url-polyfill` | ^3.0.0 | Polyfill requerido por Supabase |
| `react-native-safe-area-context` | ~5.6.0 | |
| `react-native-screens` | ~4.16.0 | |
| `@expo/vector-icons` | 15.1.1 | **Heredado de `expo`, no declarado en `package.json`**. Usado directamente en `TabNavigator.tsx:4`, `ProfileScreen.tsx:7`, `MapScreen.tsx:3`, `Navbar/BottomBar.tsx:4`. |

**Lo que NO hay y es deliberado de entrada:**
- Sin NativeWind / styled-components. Estilos con `StyleSheet.create` + tokens propios (§6).
- Sin Zustand / Redux. Estado global solo para sesión (`AuthContext`). Server state vía React Query (a introducir, §11).
- Sin react-hook-form / zod (aún).
- Sin `babel.config.*` / `metro.config.*` custom — usa defaults de Expo.
- Sin `eas.json`.

**Lo que hay que añadir en este barrido (no creado todavía — ver §11):**
- `eslint-config-expo` + `prettier` + plugin de import-order.
- `@tanstack/react-query`.
- Carga de fuentes con `expo-font`.
- `src/types/database.ts` generado con `supabase gen types typescript`.

### 2.5 Variables de entorno

Fichero `.env` (no commiteado, gitignored):

| Variable | Obligatoria | Uso |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase, usada en `src/services/supabase.ts` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Sí | Anon key pública del proyecto |

**Convenciones:**
- Prefijo `EXPO_PUBLIC_` es obligatorio para que Expo exponga la variable al bundle cliente.
- **Nunca** variables sin ese prefijo si van a usarse en cliente: no están disponibles en runtime.
- **Nunca** meter secretos (service_role key, API keys de pago, webhooks privados, etc.) en variables `EXPO_PUBLIC_*`: son públicas por definición. Cualquier secreto de ese tipo va en edge functions / servidor, nunca en cliente.

Crear `.env.example` sin valores como parte del PR de tooling (§11.1).

---

## 3. Arquitectura de carpetas y convenciones

### 3.1 Árbol actual (layer-based hoy; evolucionará a feature-based)

```
proto/
├── App.tsx                     # AuthProvider + NavigationContainer + Router
├── index.js                    # registerRootComponent(App)
├── app.json                    # Config Expo (icon, splash, slug)
├── tsconfig.json               # Alias @/* → src/*
├── .mcp.json                   # Figma MCP server → http://127.0.0.1:3845/mcp
├── assets/
│   ├── icon.png, splash-icon.png, android-icon-*.png, favicon.png
│   └── images/                 # Renders del diseño "The Sanctuary"
└── src/
    ├── components/
    │   ├── FeaturedCarousel/   # Carrusel + SpaceCard (usa theme)
    │   ├── Map/                # MapWrapper.native / .web / .d.ts (patrón cross-platform)
    │   └── Navbar/             # ⚠️ CÓDIGO MUERTO (§10)
    ├── contexts/
    │   └── AuthContext.tsx     # Sesión + perfil (este último migrará a React Query)
    ├── navigation/
    │   ├── AppNavigator.tsx    # Stack: MainTabs / BecomeHost / MapScreen
    │   └── TabNavigator.tsx    # Tabs: Buscar / Perfil
    ├── screens/
    │   ├── LoginScreen.tsx, RegisterScreen.tsx
    │   ├── HomeScreen.tsx, ProfileScreen.tsx
    │   └── BecomeHostScreen.tsx, MapScreen.tsx
    ├── services/
    │   └── supabase.ts         # Cliente único (AsyncStorage + polyfill)
    └── theme/                  # Design tokens (§6)
        ├── colors.ts, typography.ts, spacing.ts, radii.ts, shadows.ts
        └── index.ts            # Export unificado `theme`
```

### 3.2 Convenciones obligatorias (ver también §8)

- **Path alias `@/*`** (ya declarado en `tsconfig.json:4-6` pero sin uso). Todo código nuevo importa con `@/...`. Código viejo se migra oportunísticamente al tocarlo.
- **Barrel files**: cada directorio de componente expone un `index.ts` con lo público (patrón vigente en `src/components/FeaturedCarousel/index.ts`).
- **Nombres de tablas y columnas**: **inglés** (tras PR de migración, §11).
- **Nombres de UI al usuario**: **español**, pero nunca hardcodeados en JSX — viven en `src/copy/` (a crear, ver §8).
- **Convención de carpetas objetivo (feature-based)** a medida que el dominio crezca:
  ```
  src/
    features/
      auth/{screens,hooks,components}/
      spaces/{screens,hooks,components}/
      profile/{screens,hooks,components}/
    shared/{components,hooks,lib}/
    theme/
    services/
    copy/
    types/
  ```
  No migrar todo de golpe. Las features nuevas nacen en `src/features/<feature>/`; las viejas (`src/screens/*`, `src/components/*`) se reubican cuando se toquen.

---

## 4. Modelo de datos

### 4.1 Estado actual (pre-migración)

**Tabla `profiles`** (confirmado vía DDL):

| Columna | Tipo | Null | Default |
|---|---|---|---|
| `id` | `uuid` | NO | — (FK a `auth.users.id`) |
| `nombre` | `text` | NO | — |
| `apellidos` | `text` | SÍ | — |
| `es_anfitrion` | `boolean` | SÍ | `false` |
| `avatar_url` | `text` | SÍ | — |
| `creado_en` | `timestamptz` | NO | `timezone('utc', now())` |

**Tabla `propiedades`** (confirmado vía DDL):

| Columna | Tipo | Null | Default |
|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `anfitrion_id` | `uuid` | NO | — |
| `descripcion` | `text` | SÍ | — |
| `estado` | `text` | SÍ | `'borrador'` |
| `creado_en` | `timestamptz` | NO | `timezone('utc', now())` |
| `latitud` | `double precision` | SÍ | — |
| `longitud` | `double precision` | SÍ | — |

**No existen aún**: `title`, `price`, `photos`, `type`, `address`, `capacity`, `updated_at`. 

**Tablas a crear en §11.4 (migración)**: `bookings` (ver §4.2).

**Tablas diferidas a features posteriores**: `reviews`, `space_photos`, `space_amenities`.

**RLS policies vigentes:**

```
profiles:
  "Perfiles visibles para todos"            SELECT  public  true
  "Usuarios solo actualizan su propio perfil" UPDATE public  auth.uid() = id

propiedades:
  "Ver propias propiedades"       SELECT  public  auth.uid() = anfitrion_id   ← BUG, ver §10
  "Insertar propias propiedades"  INSERT  public  check: auth.uid() = anfitrion_id
  "Actualizar propias propiedades" UPDATE public  auth.uid() = anfitrion_id
```

**Trigger `on_auth_user_created`** en `auth.users` (AFTER INSERT) → `public.crear_perfil_automatico()`:

```sql
INSERT INTO public.profiles (id, nombre, apellidos, avatar_url)
VALUES (
  new.id,
  new.raw_user_meta_data->>'nombre',
  new.raw_user_meta_data->>'apellidos',
  new.raw_user_meta_data->>'avatar_url'
);
```

**Storage buckets:**
- `avatars` (público). Usado en `ProfileScreen.tsx:52-67`.
- `space-images`: no confirmado en entorno actual — crear en el PR de fotos si no existe.

### 4.2 Esquema objetivo (post-migración, §11)

**`profiles`** (renombrar columnas, mantener tabla):

- `id uuid PK`
- `first_name text NOT NULL` (era `nombre`)
- `last_name text` (era `apellidos`)
- `is_host boolean NOT NULL DEFAULT false` (era `es_anfitrion`; pasa a NOT NULL)
- `avatar_url text`
- `created_at timestamptz NOT NULL DEFAULT now()` (era `creado_en`)

**`spaces`** (renombrar tabla `propiedades`, renombrar columnas, añadir campos):

- `id uuid PK DEFAULT gen_random_uuid()`
- `host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` (era `anfitrion_id`; añadir FK explícita)
- `type space_type NOT NULL DEFAULT 'bathroom'` ← **NUEVO**
- `title text` ← **NUEVO**
- `description text` (era `descripcion`)
- `status space_status NOT NULL DEFAULT 'draft'` (era `estado`, ahora enum)
- `latitude double precision`
- `longitude double precision`
- `is_blocked boolean NOT NULL DEFAULT false` ← **NUEVO**, controlado por el host desde "Mis espacios"
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()` ← **NUEVO**, mantenido por trigger

> El flag `is_blocked` permite al host pausar la recepción de nuevas reservas sobre un espacio publicado sin tener que archivarlo. Las reservas ya existentes (`pending_host_approval`, `confirmed`, `in_use`) no se ven afectadas: siguen su ciclo de vida normal. Las RLS policies de INSERT de `bookings` deben validar `is_blocked = false` antes de permitir nuevas reservas.

**Enums:**

```sql
CREATE TYPE space_type   AS ENUM ('bathroom');
CREATE TYPE space_status AS ENUM ('draft', 'published', 'archived');
```

> No añadir `'kitchen'` al enum todavía. Se incorpora con `ALTER TYPE space_type ADD VALUE 'kitchen'` cuando se implemente el vertical (§12).

**RLS policies objetivo para `spaces`:**

```sql
CREATE POLICY "Published spaces are public"
  ON spaces FOR SELECT
  USING (status = 'published');

CREATE POLICY "Hosts see their own spaces"
  ON spaces FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts insert their own spaces"
  ON spaces FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts update their own spaces"
  ON spaces FOR UPDATE
  USING (auth.uid() = host_id);
```

**Trigger renombrado** a `handle_new_user` (convención Supabase + inglés):

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
```

**Cambios sincronizados en cliente** (mismo PR que la migración SQL):

- `RegisterScreen.tsx:42-51`: metadata del signup pasa de `{ nombre, apellidos }` a `{ first_name, last_name }`.
- Toda `supabase.from('propiedades')` → `supabase.from('spaces')`.
- Toda lectura de `profile.nombre / apellidos / es_anfitrion / creado_en` → `profile.first_name / last_name / is_host / created_at`.
- Generar types con `supabase gen types typescript --project-id <id> > src/types/database.ts` y tiparlos en el cliente: `createClient<Database>(url, key, ...)`.

#### Tabla `bookings` (nueva, añadida en el mismo PR de migración)

Modelo del dominio de reservas. Cada booking representa que un guest ha solicitado (o confirmado) el uso de un space durante una ventana temporal concreta.

**Campos:**

- `id uuid PK DEFAULT gen_random_uuid()`
- `space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE`
- `guest_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE`
- `status booking_status NOT NULL DEFAULT 'pending_host_approval'`
- `starts_at timestamptz NOT NULL`
- `ends_at timestamptz NOT NULL`
- `price_total_cents integer NOT NULL` — en céntimos para evitar errores de float. Ver §13.4 para el ADR del modelo de pagos.
- `currency text NOT NULL DEFAULT 'EUR'`
- `notes text` — mensaje opcional del guest al host (p. ej. "llego un poco tarde")
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()` — mantenido por trigger

**Nota de diseño:** NO incluimos `host_id` en `bookings`. Se deriva vía JOIN con `spaces.host_id`. Desnormalizar crearía riesgo de inconsistencia sin beneficio en esta escala.

**Enum:**

```sql
CREATE TYPE booking_status AS ENUM (
  'pending_host_approval',  -- guest ha solicitado, host no ha respondido
  'confirmed',              -- host ha aceptado, reserva activa
  'in_use',                 -- host marcó la llegada del guest
  'completed',              -- host marcó que el guest terminó (transición manual)
  'rejected',               -- host rechazó la solicitud inicial
  'cancelled_by_guest',     -- guest canceló antes o durante 'confirmed'
  'no_show'                 -- host marcó que el guest no apareció
);
```

**Constraints a nivel de tabla:**

```sql
CONSTRAINT bookings_time_window_valid CHECK (ends_at > starts_at),
CONSTRAINT bookings_guest_is_not_host CHECK (
  guest_id <> (SELECT host_id FROM spaces WHERE id = space_id)
)
```

> Nota: el segundo CHECK con subquery no está permitido en Postgres a nivel de columna — se implementa como trigger `BEFORE INSERT OR UPDATE` o como función validadora llamada desde RLS. Decidir implementación en el PR de migración (§11.4). Documentar la decisión como ADR en §13.

**Protección contra double-booking (crítica):**

Para evitar que dos guests reserven el mismo space en ventanas temporales solapadas, añadir un índice de exclusión:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    space_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (status IN ('pending_host_approval', 'confirmed', 'in_use'));
```

Esto garantiza a nivel de BD que no puede haber dos bookings activos (pending, confirmed o in_use) del mismo space con ventanas que se solapen. Los `rejected`, `cancelled_by_guest`, `completed` y `no_show` quedan excluidos del índice porque ya no bloquean disponibilidad.

**Trigger `updated_at`:**

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

La misma función `set_updated_at()` se reutiliza para la tabla `spaces`.

#### RLS policies objetivo para `bookings`

```sql
-- Guests ven sus propias reservas
CREATE POLICY "Guests see their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = guest_id);

-- Hosts ven las reservas que les afectan (de sus spaces)
CREATE POLICY "Hosts see bookings of their spaces"
  ON bookings FOR SELECT
  USING (
    auth.uid() = (SELECT host_id FROM spaces WHERE id = space_id)
  );

-- Guests crean reservas solo sobre spaces publicados, y solo como ellos mismos
CREATE POLICY "Guests create bookings on published spaces"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = guest_id
    AND (SELECT status FROM spaces WHERE id = space_id) = 'published'
    AND auth.uid() <> (SELECT host_id FROM spaces WHERE id = space_id)
  );

-- Guests pueden cancelar sus propias reservas pending/confirmed
CREATE POLICY "Guests cancel their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = guest_id)
  WITH CHECK (
    auth.uid() = guest_id
    AND status IN ('pending_host_approval', 'confirmed', 'cancelled_by_guest')
  );

-- Hosts aceptan/rechazan reservas de sus spaces
CREATE POLICY "Hosts manage bookings of their spaces"
  ON bookings FOR UPDATE
  USING (
    auth.uid() = (SELECT host_id FROM spaces WHERE id = space_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT host_id FROM spaces WHERE id = space_id)
  );
```

> Nota: las transiciones válidas de `status` se validan con trigger `BEFORE UPDATE`, no con RLS. La máquina de estados completa (formalizada en PRODUCT.md §4.3) es:
>
> - `pending_host_approval` → `confirmed` (host acepta) | `rejected` (host rechaza) | `cancelled_by_guest` (guest cancela)
> - `confirmed` → `in_use` (host marca llegada) | `no_show` (host marca no aparición) | `cancelled_by_guest` (guest cancela)
> - `in_use` → `completed` (host marca terminado)
> - Estados terminales (sin transiciones salientes): `completed`, `rejected`, `cancelled_by_guest`, `no_show`.
>
> Las transiciones `confirmed → in_use` y `in_use → completed` son **exclusivas del host**. Ninguna transición es automática por tiempo. Implementar el trigger en el PR §11.4.

#### Qué queda explícitamente fuera del modelo de bookings en MVP v1

- Sin `price_host_cents` / `price_fee_cents` (pagos fuera del MVP v1, ver ADR §13.4).
- Sin `payment_intent_id` ni referencia a Stripe — se añade cuando se integren pagos.
- Sin reviews ni ratings asociados a bookings — tabla `reviews` se creará cuando entre esa feature.
- Sin mensajería entre guest y host — el campo `notes` es un mensaje único unidireccional, no un hilo.
- Sin política de cancelación configurable por host — en v1 el guest puede cancelar siempre mientras el booking no esté `completed`.

### 4.3 Tipos TypeScript actuales

- `UserProfile` / `AuthContextType` en `src/contexts/AuthContext.tsx:6-19` — alinear con `database.ts` tras migración.
- `FeaturedSpace` / `SpaceCardProps` en `src/components/FeaturedCarousel/*` — **tipos de UI**, no conectados a BD todavía.
- `RootStackParamList` en `src/navigation/AppNavigator.tsx:8-12`.
- `TabParamList` en `src/navigation/TabNavigator.tsx:12-15`.
- **Tipo `Booking` (post-migración §11.4)**: se generará automáticamente en `src/types/database.ts` a partir de la tabla `bookings`. No crear interfaces manuales que dupliquen ese tipo. Si la UI necesita un tipo derivado (p. ej. `BookingWithSpace` para pintar listados), definirlo como type alias sobre el tipo generado, no como interface independiente.

---

## 5. Flujos implementados

Estado a 2026-04-22. ✅ funcional / 🟡 a medias / 🔴 mock o ausente.

| Flujo | Estado | Archivos clave | Notas |
|---|---|---|---|
| Login email/password | ✅ | `src/screens/LoginScreen.tsx:14-23` | Sin magic link, sin OAuth |
| Registro con metadata | ✅ | `src/screens/RegisterScreen.tsx:31-69` | Metadata keys (`nombre`, `apellidos`) **acopladas** al trigger SQL (§10) |
| Persistencia de sesión | ✅ | `src/services/supabase.ts:10-16`, `src/contexts/AuthContext.tsx:37-57` | AsyncStorage |
| Fetch perfil | ✅ | `src/contexts/AuthContext.tsx:60-76` | `select('*')` — migrará a `useProfileQuery` |
| Logout | ✅ | `src/screens/ProfileScreen.tsx:91-93` | |
| Subida avatar a Storage | ✅ | `src/screens/ProfileScreen.tsx:30-88` | base64 → `decode()`; bucket `avatars` |
| BecomeHost — paso 1 (descripción) | 🟡 | `src/screens/BecomeHostScreen.tsx:14-67` | Crea/update `propiedades` con `estado='borrador'` |
| BecomeHost — paso 2 (ubicación) | 🟡 | `src/screens/MapScreen.tsx:31-57` | Guarda lat/lng; **no navega a paso siguiente**. Secuencia canónica completa: §11.7 |
| Home / carrusel destacados | 🔴 mock | `src/screens/HomeScreen.tsx:8-33` | Array `FEATURED_SPACES` hardcoded, no lee de Supabase |
| Detalle de espacio | 🔴 | `src/screens/HomeScreen.tsx:53-56` | `console.log('Space pressed')` |
| Listado completo ("View all") | 🔴 | `src/screens/HomeScreen.tsx:57-60` | `console.log('View all pressed')` |
| Marcar usuario como `is_host=true` | 🔴 | — | Disparador objetivo: publicación del primer espacio (§11.7) |
| Recuperación de contraseña | 🔴 | — | Roadmap corto (§11), no bloqueante |
| Crear reserva (guest) | 🔴 | — | Definida en PRODUCT.md (alcance MVP v1) |
| Aceptar/rechazar reserva (host) | 🔴 | — | Definida en PRODUCT.md (alcance MVP v1) |
| Ver mis reservas (guest) | 🔴 | — | Definida en PRODUCT.md (alcance MVP v1) |
| Ver solicitudes recibidas (host) | 🔴 | — | Definida en PRODUCT.md (alcance MVP v1) |
| Cancelar reserva (guest) | 🔴 | — | Definida en PRODUCT.md (alcance MVP v1) |

---

## 6. Sistema de diseño

### 6.1 Tokens

Design system extraído del diseño Figma **"The Sanctuary"**, materializado en `src/theme/`:

- **`colors.ts`** — paleta `teal600` + `gold500` + escala de grises; tokens semánticos (`primary`, `textPrimary`, `surface`, `glass*`, `overlay*`).
- **`typography.ts`** — familias `PlusJakartaSans` (Headings) + `Inter` (Body). Estilos predefinidos: `h1`-`h4`, `body`, `bodyMedium`, `bodySemiBold`, `label`, `caption`, `button`, `buttonSmall`, `tabLabel`.
- **`spacing.ts`** — múltiplos de 8 + atajos semánticos (`insets.screenHorizontal`, `insets.sectionGap`).
- **`radii.ts`** — `md: 16`, `lg: 32`, `xl: 48`, `full: 9999`.
- **`shadows.ts`** — `subtle`, `medium`, `strong`, `wide`, `header`, `primaryCta`, `stickyFooter`.
- **`index.ts`** — export unificado `theme` + exports granulares.

### 6.2 Fuentes (pendiente)

Las familias declaradas en `typography.ts:15-24` **no están cargadas** con `expo-font`. RN cae a fuente del sistema y el diseño se descuadra. Se corrige en el PR de fuentes (§11): `useFonts` en `App.tsx` + splash hasta que carguen.

### 6.3 Componentes con/sin theme

- **Consumen el theme**: `HomeScreen.tsx`, `components/FeaturedCarousel/FeaturedCarousel.tsx`, `components/FeaturedCarousel/SpaceCard.tsx`.
- **Usan hex hardcoded** (se migran en el theme sweep, §11): `LoginScreen.tsx`, `RegisterScreen.tsx`, `ProfileScreen.tsx`, `BecomeHostScreen.tsx`, `MapScreen.tsx`, todo `components/Navbar/*`.

### 6.4 Integración Figma MCP

`.mcp.json` expone un servidor MCP local de Figma en `http://127.0.0.1:3845/mcp`. Úsalo con las tools del MCP (`get_design_context`, `get_variable_defs`, etc.) cuando generes componentes desde frames de diseño. Requiere el plugin Figma MCP corriendo en local.

---

## 7. Cross-platform

- **Patrón de resolución por extensión**: Metro elige automáticamente `Foo.native.tsx` en móvil y `Foo.web.tsx` en web. Tipos compartidos en `Foo.d.ts`. Ejemplo vigente: `src/components/Map/MapWrapper.{native,web,d}.tsx`.
- **`react-native-maps`** solo se importa en `MapWrapper.native.tsx:4`. La build web **no** carga la librería; `MapWrapper.web.tsx` renderiza un placeholder que permite seguir probando el flujo.
- **Código platform-gated inline**: usar `Platform.OS === 'ios' | 'android' | 'web'` para diferencias menores (ej. `LoginScreen.tsx:26`, `BottomBar.tsx:29`). Para diferencias grandes, preferir archivos `.native` / `.web`.
- **Web build**: `npx expo start --web` funciona hoy. `dist/` contiene la última build web y está gitignorado.

---

## 8. Convenciones de código (reglas duras)

Todas bloqueantes. Un PR que infrinja cualquiera de estas se rechaza sin excepciones.

1. **No `bathroom` / `kitchen` / `baño` / `cocina` en identificadores.** El tipo es un dato (`space.type`). Solo aparece literal en copys de UI.
2. **No hex literales en componentes.** Todo color pasa por `theme.colors` (`src/theme/colors.ts`). Si falta un token, se añade al theme.
3. **No strings hardcoded en JSX.** Todos los copys viven en `src/copy/<feature>.ts` como objetos exportados. Diseñados para extracción futura a `i18next` sin refactor masivo. Ejemplo de forma esperada:
   ```ts
   // src/copy/auth.ts
   export const authCopy = {
     login: { title: 'Iniciar sesión', submit: 'Entrar', /* ... */ },
     register: { /* ... */ },
   } as const;
   ```
4. **No fetch directo en componentes de pantalla.** Prohibido el patrón `useState + useEffect + supabase.from()` en `src/**/screens/*` y similares. Toda lectura/escritura pasa por hooks React Query en `src/features/<feature>/hooks/use<Thing>Query.ts` o `use<Thing>Mutation.ts`.
5. **`AuthContext` mantiene solo la sesión.** El perfil se mueve a `useProfileQuery` una vez introducido React Query. La sesión es caso especial (side-effects globales de `onAuthStateChange`).
6. **Path alias `@/*` obligatorio** en código nuevo. Nunca `../../../`.
7. **Imports ordenados** (bloques: node/externos → `@/*` → relativos `./`). Lo refuerza el plugin de ESLint de import-order.
8. **TypeScript estricto.** Prohibido `any` salvo con comentario `// @ts-expect-error <motivo>`. Tipado explícito de `navigation` en screens (`NativeStackScreenProps<RootStackParamList, 'X'>`), no `navigation: any` como hoy en `BecomeHostScreen.tsx:9` y `MapScreen.tsx:14`.
9. **Nombres de tablas/columnas en inglés.** Tras la migración §11, toda nueva tabla/columna se crea en inglés. Nada de espanglish.
10. **Types generados de Supabase son la fuente de verdad** (`src/types/database.ts`). `createClient<Database>(...)`. No duplicar a mano interfaces de filas.
11. **Componentes de dominio** (cualquier cosa que renderice un `Space`) deben aceptar `space.type` y ramificar por dato, no por archivo. Nunca `BathroomCard.tsx`; sí `SpaceCard.tsx` con rama por tipo si hace falta.

---

## 9. Reglas para el asistente

Instrucciones dirigidas específicamente al agente de desarrollo (Claude Code) cuando opere sobre este repo:

1. **Leer este archivo antes de tomar decisiones arquitectónicas.** Si la decisión no está cubierta, preguntar al usuario antes de inventar una convención.
2. **No mezclar scopes en un PR.** Limpieza, setup de tooling, migración SQL y nuevas features son PRs separados. Respetar el orden de §11.
3. **Cambios cliente ↔ trigger ↔ esquema SQL siempre en el mismo commit.** El acoplamiento del trigger `handle_new_user` con las metadata keys del signup no tiene safety net en compilación (§10). Un cambio parcial rompe usuarios nuevos.
4. **Tareas destructivas (rm, drop, force-push, reset --hard, amend de commits publicados, etc.)** requieren confirmación explícita del usuario aunque estén dentro del scope de la tarea.
5. **Actualización obligatoria de CLAUDE.md.** Todo PR que modifique cualquiera de lo siguiente DEBE actualizar este documento en el mismo commit:
   - Estructura de carpetas (§3).
   - Esquema de BD, RLS policies, triggers, buckets (§4).
   - Estado de un flujo (§5) — transición 🔴 → 🟡 → ✅.
   - Tokens del theme, familias de fuentes, convenciones de estilo (§6).
   - Convenciones de código (§8).
   - Known issues (§10) — abrir nuevos, cerrar resueltos.
   - Roadmap (§11) — marcar completados, mover al histórico de §13, añadir nuevos.
   
   Si el PR no actualiza CLAUDE.md cuando corresponde, se rechaza. El asistente es responsable de proponer la actualización proactivamente; el revisor humano la exige.

6. **Cierre de PR con revisión explícita de CLAUDE.md.** Antes de marcar un PR como listo para commit, el asistente debe:
   - Listar las secciones de CLAUDE.md afectadas por los cambios del PR.
   - Proponer los diffs concretos (sin aplicarlos aún).
   - Esperar aprobación del usuario antes de commitear.

---

## 10. Known issues

### 10.1 Bug RLS — marketplace roto (prioridad alta)

La policy `"Ver propias propiedades"` en `propiedades` restringe `SELECT` a filas donde `auth.uid() = anfitrion_id`. Resultado: **ningún usuario puede ver espacios de otros hosts**. Rompe el modelo marketplace.

No se nota hoy porque `HomeScreen.tsx:8-33` usa mock data. En el momento en que el Home pase a leer de Supabase (§11.5), el carrusel llega vacío para cualquier usuario que no sea el host.

**Resolución:** el PR de migración (§11.4) reemplaza esta policy por las dos policies acordadas en §4.2 (`Published spaces are public` + `Hosts see their own spaces`).

### 10.2 Acoplamiento cliente ↔ trigger SQL (frágil)

Las metadata keys del signup en `RegisterScreen.tsx:42-51` (`nombre`, `apellidos`) tienen que coincidir **exactamente** con las que lee la función `crear_perfil_automatico()` (§4.1). Cualquier divergencia produce un perfil con columnas NULL silenciosamente; el registro "parece" funcionar.

- No hay safety net en compilación.
- Solo se detectaría con tests E2E que aún no existen.
- Reglas: cambios en metadata del signup y en el cuerpo del trigger **siempre en el mismo commit**, revisados juntos.

### 10.3 Código muerto — `src/components/Navbar/*`

`Navbar.tsx`, `Navbar.web.tsx`, `BottomBar.tsx`: cero importaciones en el repo (`grep` exhaustivo). Sustituido por `TabNavigator.tsx`. Se borra en PR separado (§11.6), no se mezcla con otras tareas.

### 10.4 Fuentes no cargadas

`src/theme/typography.ts:15-24` declara `PlusJakartaSans` e `Inter`, pero nadie llama a `expo-font`. En runtime RN cae a la fuente del sistema. **Todas las decisiones visuales actuales se están tomando sobre un render incorrecto.** Corregir antes del theme sweep (§11.2 → §11.3).

### 10.5 `navigation: any` y `profile?.id` sin validar

- Tipado flojo en `BecomeHostScreen.tsx:9` y `MapScreen.tsx:14`.
- `profile?.id` se pasa a `.eq()` sin validar que exista en `BecomeHostScreen.tsx:28,49` y `ProfileScreen.tsx:49,72`. Si la sesión está pero el perfil aún no cargó, la query filtra por `undefined`.

Se limpia al extraer cada pantalla a hook React Query (§11.5).

---

## 11. Roadmap activo

Orden de PRs acordado. No solapar scopes entre PRs. Cuando se complete un PR, tacha su título con `~~...~~`, marca ✅, añade la fecha, mueve la entrada al histórico al final de esta sección, y registra el ADR en §13.

### 11.1 Tooling
- Añadir `eslint-config-expo` + `prettier` + plugin de `import-order`.
- Scripts en `package.json`: `lint`, `format`, `typecheck`.
- **CI fuera de scope.** Solo setup local.

### 11.2 Fuentes
- Cargar `PlusJakartaSans` (ExtraBold / Bold / SemiBold) + `Inter` (Regular / Medium / SemiBold / Italic / SemiBoldItalic) con `expo-font`.
- `useFonts` en `App.tsx` + splash screen hasta que carguen.

### 11.3 Theme sweep
- Migrar los hex literales de `LoginScreen`, `RegisterScreen`, `ProfileScreen`, `BecomeHostScreen`, `MapScreen` al `theme`.
- Extender `src/theme/colors.ts` si falta algún token (p. ej. el rojo de logout `#EF4444` de `ProfileScreen.tsx:212` no existe en la paleta actual).
- Regla post-PR: ningún hex literal en `src/**/*.tsx` salvo en `src/theme/`.

### 11.4 Migración Supabase + types generados
- Script SQL con renombres de tablas y columnas acordados en §4.2.
- Crear enums `space_type` (solo `'bathroom'`) y `space_status`.
- Sustituir las 3 policies de `propiedades` por las 4 policies de §4.2 (resuelve §10.1).
- Recrear trigger como `handle_new_user` apuntando al nuevo cuerpo (§4.2).
- `supabase gen types typescript` → `src/types/database.ts`.
- Actualizar cliente en el mismo commit: `createClient<Database>(...)`, `RegisterScreen` metadata, todas las queries, `UserProfile` alineado con `database.ts`.
- Crear tabla `bookings` con enum `booking_status`, constraint `EXCLUDE USING gist` contra double-booking, trigger `set_updated_at`, y las 5 policies RLS definidas en §4.2. Incluir extensión `btree_gist`.

### 11.5 React Query
- Instalar `@tanstack/react-query`.
- `QueryClientProvider` en `App.tsx` (envoltorio del `AuthProvider`).
- Introducir hooks iniciales: `useProfileQuery`, `useSpacesQuery`, `useCreateSpaceMutation`, `useUpdateSpaceMutation`.
- Refactorizar `HomeScreen` para leer de Supabase (mata el mock `FEATURED_SPACES`).
- Refactorizar `ProfileScreen` / `BecomeHostScreen` / `MapScreen` para consumir hooks.
- Retirar el fetch de perfil de `AuthContext`; dejar ahí solo la sesión.

### 11.6 Limpieza Navbar
- Borrar `src/components/Navbar/*` (ver §10.3).
- PR pequeño, sin mezcla.

### 11.7 Completar flujo BecomeHost (Figma MCP + secuencia canónica)

**Secuencia canónica del flujo BecomeHost** (referencia desde §5):

`tipo` → `descripción` → `ubicación` → `fotos` → `precio` → `disponibilidad` → `publicar`

Cada paso guarda en `spaces` con `status='draft'`. Al completar el último paso, `status='published'` y (vía trigger) `profile.is_host = true`.

**Tareas del PR:**
- Usar MCP de Figma (`.mcp.json`) para generar las pantallas faltantes del flujo: fotos, precio, disponibilidad, publicar.
- Conectar las pantallas existentes (descripción, ubicación) a la secuencia canónica.
- Actualizar §5 cuando cada paso del flujo pase de 🟡 a ✅.

### Histórico de PRs completados

Vacío por ahora. Cada vez que se complete un PR de §11.1–§11.7, mover aquí su entrada con el siguiente formato:

- **§11.X — <Título> — ✅ completado <YYYY-MM-DD>** — ver §13.N para el ADR correspondiente.

No borrar entradas completadas. El orden cronológico del histórico sirve de narrativa del proyecto.

### Fuera de este barrido
- Recuperación de contraseña (`supabase.auth.resetPasswordForEmail`, dos pantallas) — roadmap corto pero no bloqueante.
- OAuth, magic link, i18n activa, tests E2E, CI.

---

## 12. Puntos de extensión para "cocinas"

Si la migración de §4.2 y §11.4 se ejecuta bien, añadir el vertical de cocinas debe ser trivial y **no tocar arquitectura**. Checklist literal:

1. **Enum SQL:**
   ```sql
   ALTER TYPE space_type ADD VALUE 'kitchen';
   ```
   Una línea. Sin `ALTER TABLE`, sin renombres, sin data migration.

2. **Regenerar types:**
   ```bash
   supabase gen types typescript --project-id <id> > src/types/database.ts
   ```
   `space.type` ahora incluye `'kitchen'` en la unión literal, TypeScript empuja al resto.

3. **Copy del tipo en `src/copy/spaces.ts`** — añadir entrada:
   ```ts
   export const spaceTypeCopy = {
     bathroom: { singular: 'Baño', plural: 'Baños', /* ... */ },
     kitchen:  { singular: 'Cocina', plural: 'Cocinas', /* ... */ },
   } as const;
   ```

4. **Icono del tipo** en el mapa de iconos (a crear en `src/features/spaces/icons.ts`):
   ```ts
   export const spaceTypeIcon: Record<SpaceType, IoniconName> = {
     bathroom: 'water-outline',
     kitchen:  'restaurant-outline',
   };
   ```

5. **Imagen placeholder** para mocks/skeletons si procede (en `assets/images/`).

6. **(Opcional) selector de tipo** en el paso 1 de BecomeHost: al haber ≥2 tipos, mostrar una pantalla de selección. Antes de eso, `type` se setea automáticamente al único valor disponible.

**Cero cambios** esperados en: navegación, RLS, hooks de React Query, `SpaceCard`, carrusel, tabla `spaces`, auth, tipos generados del cliente (solo se regeneran). Si un paso pide tocar algo más, la migración previa no quedó bien abstracta y hay que revisar.

---

## 13. Historial de decisiones

Registro cronológico de decisiones arquitectónicas con contexto. Añadir entrada cada vez que:
- Se tome una decisión no obvia que un contribuyente futuro pueda querer cuestionar.
- Se cambie una regla de §8.
- Se complete un PR de §11 con hallazgos o decisiones no previstas.

**No borrar entradas antiguas.** Si una decisión es reemplazada, marcarla como `~~superseded by §13.N~~` y dejarla visible.

### 13.1 — 2026-04-22 — Entidad raíz: `Space`, no `Property` ni `Bathroom`

**Contexto:** El dominio actual es baños, pero el roadmap contempla cocinas y potencialmente otros espacios.

**Decisión:** Entidad raíz = `Space` con campo `type`. Formalizado en §1, §4.2, §12.

**Alternativas descartadas:**
- `Bathroom` como entidad: acopla el modelo al primer vertical y fuerza refactor masivo al añadir cualquier otro.
- `Property`: en español inmobiliario significa otra cosa; término confuso para el usuario.
- Herencia por tabla (`bathrooms`, `kitchens`): duplica RLS, triggers, joins y tipos generados.

**Consecuencia:** Añadir un vertical nuevo son 6 pasos declarativos (§12), ninguno arquitectónico.

### 13.2 — 2026-04-22 — BD en inglés, UI en español

**Contexto:** El esquema inicial mezclaba idiomas inconsistentemente (tabla `profiles` en inglés pero columnas `nombre`/`apellidos`/`es_anfitrion`/`creado_en`; tabla `propiedades` en español con columnas mixtas).

**Decisión:** Normalizar BD a inglés (§4.2). UI en español, centralizada en `src/copy/` (§8.3). i18n-ready estructuralmente, no activa.

**Alternativas descartadas:**
- Todo en español: fricción con tooling (Supabase CLI, ejemplos de comunidad, types generados) y con futuros colaboradores.
- Todo en inglés incluida UI: el mercado inicial es España, la UX se resiente.

**Consecuencia:** Coste: una migración única ahora, barata por estar en fase embrionaria. Beneficio: cero fricción futura al escalar.

### 13.3 — 2026-04-22 — Server state vía React Query, no Context

**Contexto:** `AuthContext` inicial (pre-migración) mezcla sesión y perfil. La tendencia natural, sin decisión explícita, es seguir metiendo server state ahí hasta que sea inmanejable.

**Decisión:** `AuthContext` mantiene solo sesión. Perfil y cualquier otro server state viven en React Query. Formalizado en §8.5, §11.5.

**Alternativas descartadas:**
- Zustand/Redux: overkill para el tamaño y tipo de estado del proyecto; añade conceptos sin valor proporcional.
- SWR: equivalente funcional, pero React Query tiene mejor soporte para mutations, optimistic updates y devtools; ecosistema Expo lo trata como default de facto.
- Mantener todo en Context: viable a corto plazo, inviable a medio; sin cache, sin revalidación, sin dedup de requests.

**Consecuencia:** Cache, revalidación, optimistic updates y dedup gratuitos. Refuerza §8.4: prohibido `useState + useEffect + supabase.from()` en componentes de pantalla.

### 13.4 — 2026-04-22 — Pagos fuera del MVP v1

**Contexto:** Un marketplace de alquiler de espacios necesita eventualmente integrar pagos para ser un producto real. La integración correcta (Stripe Connect para flujos host↔plataforma↔guest, cumplimiento PSD2/SCA, gestión de disputas, refunds parciales, payouts) es trabajo de semanas y conceptualmente complejo. Meterla en el MVP v1 multiplica el alcance y aplaza el momento en el que tenemos algo end-to-end funcionando.

**Decisión:** El MVP v1 no integra pagos. El flujo de reserva termina en el estado `confirmed` cuando el host acepta. El intercambio económico ocurre fuera de la aplicación (en persona, Bizum, transferencia, lo que las dos partes acuerden). El campo `bookings.price_total_cents` registra el precio acordado para referencia, no se cobra automáticamente.

**Alternativas descartadas:**
- Stripe Connect en v1: alarga el MVP varios meses con un coste de complejidad desproporcionado para esta fase.
- Mock de pagos (UI de pago sin backend real): genera deuda técnica y confunde sobre qué partes del sistema están realmente probadas.
- Diferir reservas también: rompe la utilidad del MVP — sin reservas el producto no se puede demostrar end-to-end.

**Consecuencia:**
- El esquema de `bookings` (§4.2) no incluye `price_host_cents`, `price_fee_cents`, `payment_intent_id`, `refund_status` ni similares. Se añadirán en el PR de integración de pagos.
- Las máquinas de estado del booking (`pending_host_approval` → `confirmed` → `completed`) no tienen estados intermedios de pago.
- Stripe Connect entra como vertical slice independiente post-MVP. Se documentará su ADR cuando llegue.
- Es una decisión defendible y reversible: añadir pagos después es un PR aditivo, no un refactor.

### 13.5 — 2026-04-22 — Separación entre estado del espacio y estado de la reserva

**Contexto:** Una versión preliminar del modelo confundía dos conceptos: el estado operativo de un espacio (disponible / bloqueado) y el estado de una reserva concreta sobre ese espacio (reservado / en uso / completado). Modelar ambos como un único campo `state` en `spaces` rompe el producto: un mismo espacio tiene N reservas simultáneas en franjas distintas, y "está reservado" depende de qué franja se consulte.

**Decisión:** Modelado separado en dos entidades:

- **`spaces`** tiene dos propiedades operativas: `status` (`draft` / `published` / `archived`, ciclo de publicación) e `is_blocked` (boolean, pausa operativa controlada por el host).
- **`bookings`** tiene su propio enum `booking_status` con el ciclo de vida de cada reserva concreta (ver §4.2).
- "Está libre tal franja" **no es un campo guardado**: se calcula consultando si existe algún booking con estado en (`pending_host_approval`, `confirmed`, `in_use`) cuyo `tstzrange(starts_at, ends_at)` solape con la franja consultada.

**Alternativas descartadas:**
- Campo `state` único en `spaces` con valores `'available' | 'reserved' | 'in_use' | 'blocked'`: rompe con múltiples reservas simultáneas en franjas distintas. Imposible de mantener consistente.
- Campo `current_booking_id` en `spaces`: nuevamente asume una sola reserva activa por espacio. No escala más allá del primer mes de uso real.
- Vista materializada con disponibilidad calculada: complejidad innecesaria para un MVP. La query directa sobre `bookings` con el índice GiST es suficientemente rápida hasta millones de filas.

**Consecuencia:**
- **Supersede parcial de §13.4**: la parentética de §13.4 que enumera la máquina de estados (`pending_host_approval → confirmed → completed`) refleja el modelo conocido en el momento de redactar ese ADR (tres estados). El modelo definitivo formalizado aquí incluye `in_use` y `no_show` como estados adicionales. §13.4 no se edita: las consecuencias técnicas que enumera siguen siendo todas válidas, simplemente se aplican sobre una máquina de estados ampliada.
- Un espacio puede tener decenas de reservas pasadas, presentes y futuras simultáneamente, cada una con su propio estado.
- La UI muestra al host (P8, P10) los estados de las reservas, no del espacio. La UI muestra al guest (P3, P4, P5) si el espacio "acepta reservas" en general, y la disponibilidad concreta al elegir franja en P5.
- El constraint `EXCLUDE USING gist` con filtro por `status IN (...)` es la única protección contra double-booking. No hay otra fuente de verdad sobre "está ocupada esta franja".
- Esta separación está documentada como **principio de producto 2.6** en PRODUCT.md y debe respetarse en cualquier feature futura. Cualquier "feature de calendario" en v2+ se construye encima de este modelo, no lo sustituye.
