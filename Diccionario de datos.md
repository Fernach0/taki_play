# Diccionario de Datos — Taki Play

**Sistema:** Taki Play — Karaoke Intercultural  
**Base de datos:** PostgreSQL (Supabase)  
**ORM:** Prisma  
**Fecha:** Mayo 2026  

---

## Índice

1. [Tipos Enumerados](#1-tipos-enumerados)
2. [Tabla: admins](#2-tabla-admins)
3. [Tabla: tables](#3-tabla-tables)
4. [Tabla: table_sessions](#4-tabla-table_sessions)
5. [Tabla: songs](#5-tabla-songs)
6. [Tabla: queue_items](#6-tabla-queue_items)
7. [Relaciones entre tablas](#7-relaciones-entre-tablas)

---

## 1. Tipos Enumerados

### `Language`
Define el idioma de una canción.

| Valor     | Descripción                        |
|-----------|------------------------------------|
| `SPANISH` | Canción en español                 |
| `KICHWA`  | Canción en idioma kichwa (quechua) |
| `ACHUAR`  | Canción en idioma achuar / shuar   |
| `OTHER`   | Otro idioma                        |

---

### `QueueStatus`
Define el estado de un ítem dentro de la cola de reproducción.

| Valor       | Descripción                                      |
|-------------|--------------------------------------------------|
| `PENDING`   | Pedido recibido, esperando reproducción          |
| `PLAYING`   | Canción siendo reproducida en este momento       |
| `PLAYED`    | Canción ya reproducida (historial)               |
| `CANCELLED` | Pedido cancelado por el DJ o por expiración      |

---

## 2. Tabla: `admins`

**Descripción:** Almacena las cuentas de los administradores y DJs del sistema. Son los únicos usuarios que pueden acceder al panel de control.

| Columna        | Tipo SQL        | Restricciones          | Descripción                                      |
|----------------|-----------------|------------------------|--------------------------------------------------|
| `id`           | `VARCHAR(36)`   | PK, NOT NULL, UUID     | Identificador único del administrador            |
| `name`         | `VARCHAR(255)`  | NOT NULL               | Nombre completo del administrador                |
| `email`        | `VARCHAR(255)`  | NOT NULL, UNIQUE       | Correo electrónico (usado para iniciar sesión)   |
| `passwordHash` | `VARCHAR(255)`  | NOT NULL               | Contraseña cifrada con bcrypt                    |
| `createdAt`    | `TIMESTAMP`     | NOT NULL, DEFAULT NOW()| Fecha y hora de creación del registro            |
| `updatedAt`    | `TIMESTAMP`     | NOT NULL, AUTO-UPDATE  | Fecha y hora de última modificación              |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (email)`

**Relaciones:** Ninguna (entidad independiente).

---

## 3. Tabla: `tables`

**Descripción:** Representa cada mesa física del establecimiento de karaoke. Cada mesa tiene un código QR único que los clientes escanean para unirse a la sesión.

| Columna     | Tipo SQL       | Restricciones           | Descripción                                           |
|-------------|----------------|-------------------------|-------------------------------------------------------|
| `id`        | `VARCHAR(36)`  | PK, NOT NULL, UUID      | Identificador único de la mesa                        |
| `number`    | `INTEGER`      | NOT NULL, UNIQUE        | Número visible de la mesa (ej. 1, 2, 3...)            |
| `qrCode`    | `VARCHAR(255)` | NOT NULL, UNIQUE        | Código QR asociado a la mesa (texto único)            |
| `isActive`  | `BOOLEAN`      | NOT NULL, DEFAULT TRUE  | Indica si la mesa está habilitada en el sistema       |
| `createdAt` | `TIMESTAMP`    | NOT NULL, DEFAULT NOW() | Fecha y hora de creación del registro                 |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (number)`
- `UNIQUE (qrCode)`

**Relaciones:**
- `tables` 1 → N `table_sessions`
- `tables` 1 → N `queue_items`

---

## 4. Tabla: `table_sessions`

**Descripción:** Registra cada evento de un cliente escaneando el QR de una mesa. Permite controlar qué clientes están activos en qué mesa y por cuánto tiempo.

| Columna      | Tipo SQL       | Restricciones           | Descripción                                            |
|--------------|----------------|-------------------------|--------------------------------------------------------|
| `id`         | `VARCHAR(36)`  | PK, NOT NULL, UUID      | Identificador único de la sesión                       |
| `tableId`    | `VARCHAR(36)`  | NOT NULL, FK            | Referencia a la mesa a la que pertenece la sesión      |
| `clientName` | `VARCHAR(255)` | NULL                    | Nombre opcional del cliente (ingresado voluntariamente)|
| `createdAt`  | `TIMESTAMP`    | NOT NULL, DEFAULT NOW() | Fecha y hora en que el cliente escaneó el QR           |
| `expiresAt`  | `TIMESTAMP`    | NULL                    | Fecha y hora de expiración de la sesión (opcional)     |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (tableId)`

**Relaciones:**
- `table_sessions` N → 1 `tables` (FK: `tableId` → `tables.id`)

---

## 5. Tabla: `songs`

**Descripción:** Catálogo completo de canciones disponibles para karaoke. Incluye versiones demo (para preescucha) y versiones completas (para reproducción en vivo).

| Columna     | Tipo SQL       | Restricciones           | Descripción                                              |
|-------------|----------------|-------------------------|----------------------------------------------------------|
| `id`        | `VARCHAR(36)`  | PK, NOT NULL, UUID      | Identificador único de la canción                        |
| `title`     | `VARCHAR(255)` | NOT NULL                | Título de la canción                                     |
| `artist`    | `VARCHAR(255)` | NOT NULL                | Nombre del artista o intérprete                          |
| `album`     | `VARCHAR(255)` | NULL                    | Nombre del álbum (opcional)                              |
| `genre`     | `VARCHAR(100)` | NOT NULL                | Género musical (ej. Andino, Pop, Cumbia...)               |
| `language`  | `Language`     | NOT NULL                | Idioma de la canción (enum: SPANISH, KICHWA, ACHUAR, OTHER)|
| `duration`  | `INTEGER`      | NOT NULL                | Duración en segundos                                     |
| `demoUrl`   | `TEXT`         | NOT NULL                | URL del archivo de audio para preescucha (demo corto)    |
| `fullUrl`   | `TEXT`         | NOT NULL                | URL del archivo de audio completo para reproducción live |
| `coverUrl`  | `TEXT`         | NULL                    | URL de la imagen de portada de la canción                |
| `lyrics`    | `TEXT`         | NULL                    | Letra completa de la canción (texto plano)               |
| `isActive`  | `BOOLEAN`      | NOT NULL, DEFAULT TRUE  | Indica si la canción está disponible para pedidos        |
| `createdAt` | `TIMESTAMP`    | NOT NULL, DEFAULT NOW() | Fecha y hora de creación del registro                    |
| `updatedAt` | `TIMESTAMP`    | NOT NULL, AUTO-UPDATE   | Fecha y hora de última modificación                      |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (language)`
- `INDEX (isActive)`

**Relaciones:**
- `songs` 1 → N `queue_items`

---

## 6. Tabla: `queue_items`

**Descripción:** Registra cada canción pedida por los clientes de una mesa. Es el núcleo del sistema de karaoke en tiempo real: el DJ ve esta cola y controla el estado de cada pedido.

| Columna       | Tipo SQL       | Restricciones           | Descripción                                               |
|---------------|----------------|-------------------------|-----------------------------------------------------------|
| `id`          | `VARCHAR(36)`  | PK, NOT NULL, UUID      | Identificador único del ítem en cola                      |
| `tableId`     | `VARCHAR(36)`  | NOT NULL, FK            | Mesa que realizó el pedido                                |
| `songId`      | `VARCHAR(36)`  | NOT NULL, FK            | Canción solicitada                                        |
| `requestedBy` | `VARCHAR(255)` | NULL                    | Nombre de quien pidió la canción (opcional)               |
| `status`      | `QueueStatus`  | NOT NULL, DEFAULT PENDING | Estado actual del pedido (enum)                         |
| `position`    | `INTEGER`      | NOT NULL                | Posición en la cola de la mesa (1 = siguiente)            |
| `createdAt`   | `TIMESTAMP`    | NOT NULL, DEFAULT NOW() | Fecha y hora en que se realizó el pedido                  |
| `updatedAt`   | `TIMESTAMP`    | NOT NULL, AUTO-UPDATE   | Fecha y hora de última actualización del estado           |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (tableId)`
- `INDEX (songId)`
- `INDEX (status)`

**Relaciones:**
- `queue_items` N → 1 `tables` (FK: `tableId` → `tables.id`)
- `queue_items` N → 1 `songs` (FK: `songId` → `songs.id`)

---

## 7. Relaciones entre tablas

```
admins
  (sin relaciones — entidad independiente)

tables ──────────────────────────────────────────────┐
  │                                                   │
  │ 1:N                                              │ 1:N
  ▼                                                   ▼
table_sessions                                   queue_items ──── N:1 ──── songs
```

### Detalle de cardinalidades

| Tabla padre  | Relación | Tabla hija        | Descripción                                         |
|--------------|----------|-------------------|-----------------------------------------------------|
| `tables`     | 1 : N    | `table_sessions`  | Una mesa puede tener muchas sesiones de clientes    |
| `tables`     | 1 : N    | `queue_items`     | Una mesa puede tener muchos ítems en cola           |
| `songs`      | 1 : N    | `queue_items`     | Una canción puede ser pedida muchas veces           |

### Reglas de negocio reflejadas en el esquema

- Una mesa puede tener **máximo 10 ítems** con estado `PENDING` simultáneamente (validado en la capa de servicio, no en BD).
- Solo puede haber **un ítem con estado `PLAYING`** por mesa a la vez (validado en la capa de servicio).
- Existe un **cooldown de 6 minutos** entre pedidos por mesa (validado en la capa de servicio).
- Los campos `demoUrl` y `fullUrl` apuntan a archivos de audio en el servidor o CDN.
- `passwordHash` usa algoritmo **bcrypt** (nunca se almacena la contraseña en texto plano).
