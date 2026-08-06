# Taki Play — Análisis del Esquema de Base de Datos (Prisma)

> **Archivo fuente:** `backend/prisma/schema.prisma`  
> **Motor de base de datos:** PostgreSQL  
> **ORM:** Prisma 5.x

---

## Visión General

El esquema de Taki Play modela **cinco entidades principales** que representan todo el flujo de un sistema de karaoke intercultural: desde la mesa física donde se sienta el cliente, hasta el momento en que su canción suena.

```
Admin          → Quien controla todo (el DJ)
  │
Table          → Mesa del local (acceso via QR)
  │
  ├── TableSession  → Sesión del cliente en la mesa
  │
  ├── QueueItem     → Solicitud de canción en la cola
  │       │
  │       └── Song  → El catálogo de canciones
```

---

## Enumeraciones (Enums)

Los enums definen conjuntos fijos de valores permitidos. Actúan como listas cerradas que garantizan consistencia en la base de datos.

---

### `Language` — Idioma de la Canción

```prisma
enum Language {
  SPANISH
  KICHWA
  ACHUAR
  OTHER
}
```

| Valor | Significado |
|-------|-------------|
| `SPANISH` | Canción en español |
| `KICHWA` | Canción en Kichwa (lengua indígena andina de Ecuador) |
| `ACHUAR` | Canción en Achuar (lengua indígena amazónica de Ecuador) |
| `OTHER` | Cualquier otro idioma no clasificado en las opciones anteriores |

> Este enum es el corazón del componente intercultural del proyecto. Permite categorizar y filtrar música por lengua originaria, visibilizando patrimonio cultural indígena ecuatoriano.

---

### `QueueStatus` — Estado de un Ítem en la Cola

```prisma
enum QueueStatus {
  PENDING
  PLAYING
  PLAYED
  CANCELLED
}
```

| Valor | Significado | Quién lo establece |
|-------|-------------|-------------------|
| `PENDING` | La canción fue solicitada y espera su turno | Sistema (automático al crear) |
| `PLAYING` | La canción está siendo reproducida actualmente | DJ (acción manual) |
| `PLAYED` | La canción ya fue reproducida y terminó | DJ (acción manual) |
| `CANCELLED` | La solicitud fue cancelada antes de reproducirse | DJ (acción manual) |

> El flujo natural es: `PENDING` → `PLAYING` → `PLAYED`. El estado `CANCELLED` es una salida lateral para solicitudes que no llegan a reproducirse.

---

## Tablas (Modelos)

---

### 🔐 `Admin` — Administradores del Sistema

**Tabla en DB:** `admins`

```prisma
model Admin {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**¿Para qué sirve?**  
Almacena las cuentas de los usuarios con acceso al panel de control (los DJs o administradores del local). Es la única entidad con credenciales de acceso.

| Columna | Tipo | Requerido | Descripción |
|---------|------|:---------:|-------------|
| `id` | `String` (UUID) | ✅ | Identificador único generado automáticamente. Nunca se repite. |
| `name` | `String` | ✅ | Nombre completo del administrador (ej: "DJ Carlos"). |
| `email` | `String` (único) | ✅ | Correo electrónico. Sirve como nombre de usuario para iniciar sesión. No puede repetirse. |
| `passwordHash` | `String` | ✅ | Contraseña cifrada con bcrypt. **Nunca** se guarda la contraseña en texto plano. |
| `createdAt` | `DateTime` | ✅ | Fecha y hora en que se creó la cuenta. Se asigna automáticamente. |
| `updatedAt` | `DateTime` | ✅ | Fecha y hora de la última modificación del registro. Se actualiza automáticamente. |

> **Punto clave:** La columna `passwordHash` almacena el resultado de bcrypt, no la contraseña original. Aunque alguien accediera directamente a la base de datos, no podría recuperar las contraseñas reales.

---

### 🪑 `Table` — Mesas del Local

**Tabla en DB:** `tables`

```prisma
model Table {
  id         String         @id @default(uuid())
  number     Int            @unique
  qrCode     String         @unique
  isActive   Boolean        @default(true)
  createdAt  DateTime       @default(now())
  sessions   TableSession[]
  queueItems QueueItem[]
}
```

**¿Para qué sirve?**  
Representa cada mesa física del local. Cada mesa tiene su propio código QR que los clientes escanean para acceder al sistema desde su lugar sin necesidad de registrarse.

| Columna | Tipo | Requerido | Descripción |
|---------|------|:---------:|-------------|
| `id` | `String` (UUID) | ✅ | Identificador único de la mesa. |
| `number` | `Int` (único) | ✅ | Número visible de la mesa (ej: Mesa 1, Mesa 2). No puede haber dos mesas con el mismo número. |
| `qrCode` | `String` (único) | ✅ | Código QR único asociado a esta mesa. Los clientes lo escanean para entrar al sistema. |
| `isActive` | `Boolean` | ✅ | Indica si la mesa está en servicio. `true` = activa, `false` = deshabilitada. Permite "ocultar" mesas sin borrarlas. |
| `createdAt` | `DateTime` | ✅ | Fecha de registro de la mesa. |
| `sessions` | Relación → `TableSession[]` | — | Lista de todas las sesiones que han ocurrido en esta mesa. |
| `queueItems` | Relación → `QueueItem[]` | — | Lista de todas las solicitudes de canciones hechas desde esta mesa. |

> **Borrado lógico:** La columna `isActive` permite desactivar una mesa (cuando no se usa, o por mantenimiento) sin perder el historial de sesiones y canciones que tuvo.

---

### 🎟️ `TableSession` — Sesión del Cliente en la Mesa

**Tabla en DB:** `table_sessions`

```prisma
model TableSession {
  id         String    @id @default(uuid())
  tableId    String
  table      Table     @relation(fields: [tableId], references: [id])
  clientName String?
  createdAt  DateTime  @default(now())
  expiresAt  DateTime?
}
```

**¿Para qué sirve?**  
Registra el momento en que un cliente "entra" al sistema escaneando el QR de su mesa. Esta sesión es el "pase" que le permite solicitar canciones. Es temporal y está ligada a una mesa.

| Columna | Tipo | Requerido | Descripción |
|---------|------|:---------:|-------------|
| `id` | `String` (UUID) | ✅ | Identificador único de la sesión. Este ID es el que el cliente usa para hacer pedidos. |
| `tableId` | `String` | ✅ | Referencia a la mesa donde se inició la sesión (clave foránea hacia `tables.id`). |
| `table` | Relación → `Table` | — | Objeto de la mesa completa (cargado por Prisma al consultar). |
| `clientName` | `String?` | ❌ | Nombre del cliente (opcional). El signo `?` indica que puede estar vacío. |
| `createdAt` | `DateTime` | ✅ | Cuándo empezó la sesión (momento del escaneo del QR). |
| `expiresAt` | `DateTime?` | ❌ | Cuándo vence la sesión (opcional). Si está vacío, la sesión no expira automáticamente. |

> **El `?` en Prisma** significa que el campo es opcional (nullable en SQL). `clientName` y `expiresAt` pueden no existir en un registro.

---

### 🎵 `Song` — Catálogo de Canciones

**Tabla en DB:** `songs`

```prisma
model Song {
  id         String      @id @default(uuid())
  title      String
  artist     String
  album      String?
  genre      String
  language   Language
  duration   Int
  demoUrl    String
  fullUrl    String
  coverUrl   String?
  lyrics     String?
  isActive   Boolean     @default(true)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  queueItems QueueItem[]
}
```

**¿Para qué sirve?**  
Es el catálogo completo de canciones disponibles para karaoke. Cada canción tiene toda la información necesaria: metadatos culturales (idioma, género), recursos multimedia (URLs de audio y portada) y la letra para el karaoke.

| Columna | Tipo | Requerido | Descripción |
|---------|------|:---------:|-------------|
| `id` | `String` (UUID) | ✅ | Identificador único de la canción. |
| `title` | `String` | ✅ | Título de la canción (ej: "Munasquechay"). |
| `artist` | `String` | ✅ | Nombre del artista o grupo (ej: "Los Kjarkas"). |
| `album` | `String?` | ❌ | Álbum al que pertenece la canción. Puede estar vacío si no se conoce o no aplica. |
| `genre` | `String` | ✅ | Género musical (ej: "Sanjuanito", "Pasillo", "Pop"). Texto libre, sin enum. |
| `language` | `Language` (enum) | ✅ | Idioma de la canción: `SPANISH`, `KICHWA`, `ACHUAR` u `OTHER`. Permite filtrar por lengua. |
| `duration` | `Int` | ✅ | Duración en **segundos** (ej: 240 = 4 minutos). Se usa para calcular el cooldown de la cola. |
| `demoUrl` | `String` | ✅ | URL del fragmento de audio de demostración (preview corto para que el cliente escuche antes de pedir). |
| `fullUrl` | `String` | ✅ | URL del audio completo de la canción (el que reproduce el DJ). |
| `coverUrl` | `String?` | ❌ | URL de la imagen de portada del álbum/canción. Opcional, para la UI. |
| `lyrics` | `String?` | ❌ | Letra completa de la canción. Opcional, pero esencial para la experiencia karaoke. |
| `isActive` | `Boolean` | ✅ | Si `false`, la canción no aparece en el catálogo aunque existe en la DB (borrado lógico). |
| `createdAt` | `DateTime` | ✅ | Cuándo se registró la canción. |
| `updatedAt` | `DateTime` | ✅ | Cuándo se modificó por última vez. Se actualiza automáticamente. |
| `queueItems` | Relación → `QueueItem[]` | — | Registro de todas las veces que esta canción fue solicitada en alguna cola. |

> **Por qué `demoUrl` y `fullUrl` son separadas:** El cliente puede escuchar un fragmento (`demoUrl`) antes de decidir pedirla. El DJ usa `fullUrl` para reproducir la versión completa. Esto evita que el audio completo sea accesible públicamente desde el frontend.

---

### 📋 `QueueItem` — Solicitud de Canción en la Cola

**Tabla en DB:** `queue_items`

```prisma
model QueueItem {
  id          String      @id @default(uuid())
  tableId     String
  table       Table       @relation(fields: [tableId], references: [id])
  songId      String
  song        Song        @relation(fields: [songId], references: [id])
  requestedBy String?
  status      QueueStatus @default(PENDING)
  position    Int
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

**¿Para qué sirve?**  
Es el registro de cada pedido de canción. Une a una mesa con una canción y rastrea su estado durante toda la noche. Es la tabla central del negocio, donde ocurre toda la acción del sistema de turnos.

| Columna | Tipo | Requerido | Descripción |
|---------|------|:---------:|-------------|
| `id` | `String` (UUID) | ✅ | Identificador único del pedido. |
| `tableId` | `String` | ✅ | Qué mesa hizo el pedido (clave foránea hacia `tables.id`). |
| `table` | Relación → `Table` | — | Objeto completo de la mesa. |
| `songId` | `String` | ✅ | Qué canción fue pedida (clave foránea hacia `songs.id`). |
| `song` | Relación → `Song` | — | Objeto completo de la canción. |
| `requestedBy` | `String?` | ❌ | Nombre de quien pidió la canción (ej: "Ana"). Dato informativo opcional para el DJ. |
| `status` | `QueueStatus` (enum) | ✅ | Estado actual del pedido. Empieza en `PENDING` automáticamente. |
| `position` | `Int` | ✅ | Número de orden en la cola (1 = primero, 2 = segundo, etc.). Define el turno de reproducción. |
| `createdAt` | `DateTime` | ✅ | Cuándo se hizo el pedido. |
| `updatedAt` | `DateTime` | ✅ | Cuándo se actualizó el pedido por última vez (ej: cuando cambió de estado). |

> **Por qué hay `tableId` directo y no se llega por `TableSession`:** Los pedidos se asocian directamente a la mesa, no a la sesión temporal del cliente. Esto permite que el historial de la mesa persista aunque la sesión expire, y simplifica las consultas del DJ (que ve colas por mesa, no por sesión).

---

## Relaciones entre Tablas

```
Table ──────────────────── TableSession
  │            (1 mesa puede tener muchas sesiones)
  │
  └──── QueueItem ──────── Song
         (1 mesa puede tener      (1 canción puede estar
          muchos ítems de cola)    en muchas colas)
```

| Relación | Tipo | Descripción |
|----------|------|-------------|
| `Table` → `TableSession` | Uno a muchos (1:N) | Una mesa puede tener múltiples sesiones a lo largo del tiempo. |
| `Table` → `QueueItem` | Uno a muchos (1:N) | Una mesa puede tener múltiples pedidos en cola. |
| `Song` → `QueueItem` | Uno a muchos (1:N) | Una canción puede ser pedida muchas veces en diferentes mesas. |

> **`Admin` no tiene relaciones directas** con otras tablas. Los administradores gestionan todo a través de la API, pero sus acciones no se rastrean a nivel de base de datos en esta versión del esquema.

---

## Convenciones del Esquema

| Convención | Ejemplo | Razón |
|------------|---------|-------|
| `@id @default(uuid())` | `id String @id @default(uuid())` | UUIDs como claves primarias para evitar IDs predecibles y conflictos en distribución. |
| `@unique` | `email String @unique` | Garantiza integridad referencial a nivel de base de datos, no solo en la aplicación. |
| `@default(now())` | `createdAt DateTime @default(now())` | La DB asigna la fecha, no la aplicación, para mayor consistencia. |
| `@updatedAt` | `updatedAt DateTime @updatedAt` | Prisma actualiza este campo automáticamente en cada `UPDATE`. |
| `@@map("nombre")` | `@@map("admins")` | El modelo se llama `Admin` en código pero la tabla en DB se llama `admins` (convención snake_case). |
| `?` en tipos | `String?`, `DateTime?` | El campo acepta `null` en base de datos. Sin `?`, el campo es obligatorio (NOT NULL). |

---

## Diagrama ER Simplificado

```
┌─────────────┐         ┌──────────────────┐
│    Admin    │         │   TableSession   │
├─────────────┤         ├──────────────────┤
│ id (PK)     │         │ id (PK)          │
│ name        │         │ tableId (FK) ─────────────┐
│ email       │         │ clientName?      │         │
│ passwordHash│         │ createdAt        │         │
│ createdAt   │         │ expiresAt?       │         ▼
│ updatedAt   │         └──────────────────┘   ┌──────────┐
└─────────────┘                                 │  Table   │
                                                ├──────────┤
┌─────────────┐         ┌──────────────────┐    │ id (PK)  │
│    Song     │         │   QueueItem      │    │ number   │
├─────────────┤         ├──────────────────┤    │ qrCode   │
│ id (PK)     │◄────────│ songId (FK)      │    │ isActive │
│ title       │         │ id (PK)          │    │ createdAt│
│ artist      │         │ tableId (FK) ─────────►          │
│ album?      │         │ requestedBy?     │    └──────────┘
│ genre       │         │ status           │
│ language    │         │ position         │
│ duration    │         │ createdAt        │
│ demoUrl     │         │ updatedAt        │
│ fullUrl     │         └──────────────────┘
│ coverUrl?   │
│ lyrics?     │
│ isActive    │
│ createdAt   │
│ updatedAt   │
└─────────────┘
```
