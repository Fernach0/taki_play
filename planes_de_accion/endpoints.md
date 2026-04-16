# Documentación de Endpoints — Taki Play API

**Base URL (desarrollo local):** `http://localhost:3000/api/v1`

**Autenticación:** Los endpoints marcados con `🔒` requieren el header:
```
Authorization: Bearer <token_jwt>
```

---

## Índice

- [Auth](#auth)
- [Admin](#admin)
- [Mesas (Tables)](#mesas-tables)
- [Canciones (Songs)](#canciones-songs)
- [Cola de Reproducción (Queue)](#cola-de-reproducción-queue)
- [Sesiones de Cliente (Sessions)](#sesiones-de-cliente-sessions)

---

## Auth

### POST /auth/login
**Descripción:** Autentica a un administrador (DJ) y devuelve un JWT.

**URL:** `http://localhost:3000/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "dj@takiplay.com",
  "password": "password123"
}
```

**Respuesta exitosa — 200 OK:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid-del-admin",
    "name": "DJ Principal",
    "email": "dj@takiplay.com"
  }
}
```

**Errores posibles:**
- `401 Unauthorized` — credenciales incorrectas.

---

## Admin

### 🔒 POST /admin
**Descripción:** Crea un nuevo administrador en el sistema. Solo puede ser ejecutado por un admin ya autenticado.

**URL:** `http://localhost:3000/api/v1/admin`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):**
```json
{
  "name": "Nuevo DJ",
  "email": "nuevodj@takiplay.com",
  "password": "contraseña_segura_123"
}
```

**Respuesta exitosa — 201 Created:**
```json
{
  "id": "uuid-generado",
  "name": "Nuevo DJ",
  "email": "nuevodj@takiplay.com",
  "createdAt": "2026-04-16T10:00:00.000Z"
}
```

**Notas:** La respuesta NUNCA incluye `passwordHash`.

**Errores posibles:**
- `401 Unauthorized` — token ausente o inválido.
- `409 Conflict` — el email ya está registrado.
- `400 Bad Request` — validación fallida (password corta, email inválido, etc.).

---

### 🔒 GET /admin
**Descripción:** Lista todos los administradores registrados.

**URL:** `http://localhost:3000/api/v1/admin`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa — 200 OK:**
```json
[
  {
    "id": "uuid-1",
    "name": "DJ Principal",
    "email": "dj@takiplay.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "name": "Nuevo DJ",
    "email": "nuevodj@takiplay.com",
    "createdAt": "2026-04-16T10:00:00.000Z"
  }
]
```

---

## Mesas (Tables)

### 🔒 POST /tables
**Descripción:** Crea una nueva mesa. El sistema genera automáticamente un `qrCode` único.

**URL:** `http://localhost:3000/api/v1/tables`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):**
```json
{
  "number": 6
}
```

**Respuesta exitosa — 201 Created:**
```json
{
  "id": "uuid-mesa",
  "number": 6,
  "qrCode": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "createdAt": "2026-04-16T10:00:00.000Z"
}
```

---

### 🔒 GET /tables
**Descripción:** Lista todas las mesas con el conteo de canciones pendientes en cola.

**URL:** `http://localhost:3000/api/v1/tables`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa — 200 OK:**
```json
[
  {
    "id": "uuid-mesa-1",
    "number": 1,
    "qrCode": "token-qr-1",
    "isActive": true,
    "pendingQueueCount": 3,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### 🔒 GET /tables/:id
**Descripción:** Obtiene el detalle de una mesa, incluyendo su cola activa ordenada por posición.

**URL:** `http://localhost:3000/api/v1/tables/uuid-mesa-1`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa — 200 OK:**
```json
{
  "id": "uuid-mesa-1",
  "number": 1,
  "qrCode": "token-qr-1",
  "isActive": true,
  "queueItems": [
    {
      "id": "uuid-queue-item",
      "position": 1,
      "status": "PLAYING",
      "requestedBy": "Carlos",
      "song": {
        "id": "uuid-song",
        "title": "Kichwa Mashikuna",
        "artist": "Conjunto Andino",
        "language": "KICHWA"
      }
    }
  ]
}
```

---

### 🔒 PATCH /tables/:id
**Descripción:** Actualiza los datos de una mesa (número o estado activo).

**URL:** `http://localhost:3000/api/v1/tables/uuid-mesa-1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):** *(todos los campos son opcionales)*
```json
{
  "number": 10,
  "isActive": false
}
```

**Respuesta exitosa — 200 OK:**
```json
{
  "id": "uuid-mesa-1",
  "number": 10,
  "isActive": false,
  "updatedAt": "2026-04-16T11:00:00.000Z"
}
```

---

### 🔒 DELETE /tables/:id
**Descripción:** Desactiva una mesa (soft-delete, no elimina el registro).

**URL:** `http://localhost:3000/api/v1/tables/uuid-mesa-1`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa — 200 OK:**
```json
{
  "message": "Mesa desactivada exitosamente",
  "id": "uuid-mesa-1"
}
```

---

## Canciones (Songs)

### GET /songs
**Descripción:** Lista canciones con búsqueda y filtros. Endpoint público (no requiere autenticación).

**URL:** `http://localhost:3000/api/v1/songs`

**Query Params opcionales:**
| Parámetro  | Tipo   | Descripción                              | Ejemplo         |
|------------|--------|------------------------------------------|-----------------|
| `search`   | string | Busca en título y artista               | `search=amor`   |
| `language` | string | Filtra por idioma (enum)                | `language=KICHWA` |
| `genre`    | string | Filtra por género musical               | `genre=cumbia`  |
| `artist`   | string | Filtra por artista exacto               | `artist=Inti`   |

**Ejemplo de URL con filtros:**
```
http://localhost:3000/api/v1/songs?language=KICHWA&genre=andino
```

**Respuesta exitosa — 200 OK:**
```json
[
  {
    "id": "uuid-song-1",
    "title": "Ñucanchik Llakta",
    "artist": "Conjunto Andino Taki",
    "genre": "Andino",
    "language": "KICHWA",
    "duration": 215,
    "demoUrl": "http://localhost:3000/media/demos/song1_demo.mp3",
    "coverUrl": "http://localhost:3000/media/covers/song1.jpg"
  }
]
```

**Nota:** La respuesta NO incluye `fullUrl` por seguridad.

---

### GET /songs/:id
**Descripción:** Obtiene el detalle de una canción por su ID. Público.

**URL:** `http://localhost:3000/api/v1/songs/uuid-song-1`

**Respuesta exitosa — 200 OK:**
```json
{
  "id": "uuid-song-1",
  "title": "Ñucanchik Llakta",
  "artist": "Conjunto Andino Taki",
  "album": "Raíces",
  "genre": "Andino",
  "language": "KICHWA",
  "duration": 215,
  "demoUrl": "http://localhost:3000/media/demos/song1_demo.mp3",
  "coverUrl": "http://localhost:3000/media/covers/song1.jpg"
}
```

---

### 🔒 POST /songs
**Descripción:** Agrega una nueva canción a la biblioteca.

**URL:** `http://localhost:3000/api/v1/songs`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):**
```json
{
  "title": "Ñucanchik Llakta",
  "artist": "Conjunto Andino Taki",
  "album": "Raíces",
  "genre": "Andino",
  "language": "KICHWA",
  "duration": 215,
  "demoUrl": "http://localhost:3000/media/demos/song1_demo.mp3",
  "fullUrl": "http://localhost:3000/media/full/song1.mp3",
  "coverUrl": "http://localhost:3000/media/covers/song1.jpg"
}
```

**Valores válidos para `language`:** `SPANISH`, `KICHWA`, `ACHUAR`, `OTHER`

**Respuesta exitosa — 201 Created:**
```json
{
  "id": "uuid-generado",
  "title": "Ñucanchik Llakta",
  "artist": "Conjunto Andino Taki",
  "album": "Raíces",
  "genre": "Andino",
  "language": "KICHWA",
  "duration": 215,
  "demoUrl": "http://localhost:3000/media/demos/song1_demo.mp3",
  "fullUrl": "http://localhost:3000/media/full/song1.mp3",
  "coverUrl": "http://localhost:3000/media/covers/song1.jpg",
  "isActive": true,
  "createdAt": "2026-04-16T10:00:00.000Z"
}
```

---

### 🔒 PATCH /songs/:id
**Descripción:** Actualiza datos de una canción existente.

**URL:** `http://localhost:3000/api/v1/songs/uuid-song-1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):** *(campos opcionales)*
```json
{
  "title": "Ñucanchik Llakta (Remix)",
  "isActive": false
}
```

**Respuesta exitosa — 200 OK:**
```json
{
  "id": "uuid-song-1",
  "title": "Ñucanchik Llakta (Remix)",
  "isActive": false,
  "updatedAt": "2026-04-16T12:00:00.000Z"
}
```

---

### 🔒 DELETE /songs/:id
**Descripción:** Desactiva una canción (soft-delete).

**URL:** `http://localhost:3000/api/v1/songs/uuid-song-1`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa — 200 OK:**
```json
{
  "message": "Canción desactivada exitosamente",
  "id": "uuid-song-1"
}
```

---

## Cola de Reproducción (Queue)

### POST /queue
**Descripción:** Un cliente solicita agregar una canción a la cola de su mesa. Máximo 10 canciones pendientes por mesa.

**URL:** `http://localhost:3000/api/v1/queue`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "songId": "uuid-song-1",
  "tableId": "uuid-mesa-1",
  "sessionId": "uuid-session-1",
  "requestedBy": "Carlos"
}
```

**Respuesta exitosa — 201 Created:**
```json
{
  "id": "uuid-queue-item",
  "tableId": "uuid-mesa-1",
  "songId": "uuid-song-1",
  "requestedBy": "Carlos",
  "status": "PENDING",
  "position": 4,
  "createdAt": "2026-04-16T10:30:00.000Z",
  "song": {
    "title": "Ñucanchik Llakta",
    "artist": "Conjunto Andino Taki",
    "coverUrl": "http://localhost:3000/media/covers/song1.jpg"
  }
}
```

**Errores posibles:**
- `400 Bad Request` — la mesa ya tiene 10 canciones en cola.
- `404 Not Found` — canción o mesa no encontrada.

---

### GET /queue/table/:tableId
**Descripción:** Obtiene la cola activa de una mesa (PENDING y PLAYING). Público.

**URL:** `http://localhost:3000/api/v1/queue/table/uuid-mesa-1`

**Respuesta exitosa — 200 OK:**
```json
{
  "tableId": "uuid-mesa-1",
  "tableNumber": 1,
  "items": [
    {
      "id": "uuid-item-1",
      "position": 1,
      "status": "PLAYING",
      "requestedBy": "María",
      "song": {
        "id": "uuid-song-2",
        "title": "La Bamba",
        "artist": "Ritchie Valens",
        "genre": "Rock",
        "language": "SPANISH",
        "coverUrl": "http://localhost:3000/media/covers/bamba.jpg"
      }
    },
    {
      "id": "uuid-item-2",
      "position": 2,
      "status": "PENDING",
      "requestedBy": "Carlos",
      "song": {
        "id": "uuid-song-1",
        "title": "Ñucanchik Llakta",
        "artist": "Conjunto Andino Taki",
        "genre": "Andino",
        "language": "KICHWA",
        "coverUrl": "http://localhost:3000/media/covers/song1.jpg"
      }
    }
  ],
  "pendingCount": 1
}
```

---

### 🔒 GET /queue
**Descripción:** El DJ obtiene todas las colas activas de todas las mesas.

**URL:** `http://localhost:3000/api/v1/queue`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa — 200 OK:**
```json
[
  {
    "tableId": "uuid-mesa-1",
    "tableNumber": 1,
    "pendingCount": 2,
    "currentlyPlaying": {
      "id": "uuid-item-1",
      "song": {
        "title": "La Bamba",
        "artist": "Ritchie Valens"
      }
    }
  },
  {
    "tableId": "uuid-mesa-2",
    "tableNumber": 2,
    "pendingCount": 5,
    "currentlyPlaying": null
  }
]
```

---

### 🔒 PATCH /queue/:id
**Descripción:** El DJ actualiza el estado de un item en la cola (reproducir, marcar como reproducida, cancelar, reordenar).

**URL:** `http://localhost:3000/api/v1/queue/uuid-item-1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):** *(campos opcionales)*
```json
{
  "status": "PLAYING"
}
```

**Valores válidos para `status`:** `PENDING`, `PLAYING`, `PLAYED`, `CANCELLED`

**Para reordenar:**
```json
{
  "position": 2
}
```

**Respuesta exitosa — 200 OK:**
```json
{
  "id": "uuid-item-1",
  "status": "PLAYING",
  "position": 1,
  "updatedAt": "2026-04-16T11:00:00.000Z"
}
```

**Nota:** Este endpoint automáticamente emite el evento WebSocket `queue:updated` a la sala de la mesa correspondiente.

---

### 🔒 DELETE /queue/:id
**Descripción:** El DJ elimina (cancela) un item de la cola.

**URL:** `http://localhost:3000/api/v1/queue/uuid-item-1`

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa — 200 OK:**
```json
{
  "message": "Item eliminado de la cola",
  "id": "uuid-item-1"
}
```

**Nota:** Cambia el status a `CANCELLED` (no borrado físico) y re-ordena las posiciones restantes. Emite `queue:updated` por WebSocket.

---

## Sesiones de Cliente (Sessions)

### POST /sessions/join
**Descripción:** Un cliente se vincula a una mesa escaneando el QR. Crea una sesión anónima y devuelve los identificadores que el cliente necesita para hacer solicitudes.

**URL:** `http://localhost:3000/api/v1/sessions/join`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "qrCode": "550e8400-e29b-41d4-a716-446655440000",
  "clientName": "Carlos"
}
```

**Nota:** `clientName` es opcional. `qrCode` viene codificado en el QR físico de la mesa.

**Respuesta exitosa — 201 Created:**
```json
{
  "sessionId": "uuid-session-generado",
  "tableId": "uuid-mesa-1",
  "tableNumber": 1,
  "clientName": "Carlos",
  "createdAt": "2026-04-16T09:00:00.000Z"
}
```

**Errores posibles:**
- `404 Not Found` — QR code no corresponde a ninguna mesa activa.

---

### GET /sessions/:id
**Descripción:** Verifica que una sesión sigue activa y devuelve su información. Útil para que el frontend valide la sesión al recargar la página.

**URL:** `http://localhost:3000/api/v1/sessions/uuid-session-1`

**Respuesta exitosa — 200 OK:**
```json
{
  "sessionId": "uuid-session-1",
  "tableId": "uuid-mesa-1",
  "tableNumber": 1,
  "clientName": "Carlos",
  "createdAt": "2026-04-16T09:00:00.000Z"
}
```

**Errores posibles:**
- `404 Not Found` — sesión no encontrada.

---

## WebSocket — Eventos en Tiempo Real

**Conexión:** `ws://localhost:3000` (Socket.IO)

### Eventos que el CLIENTE emite al servidor:

| Evento        | Payload                         | Descripción                                      |
|---------------|---------------------------------|--------------------------------------------------|
| `join-table`  | `{ tableId: "uuid-mesa-1" }`   | Suscribirse a actualizaciones de una mesa         |
| `leave-table` | `{ tableId: "uuid-mesa-1" }`   | Desuscribirse de una mesa                        |

### Eventos que el SERVIDOR emite al cliente:

| Evento            | Payload                                       | Descripción                                    |
|-------------------|-----------------------------------------------|------------------------------------------------|
| `queue:updated`   | `{ tableId, queue: QueueItem[] }`             | La cola cambió (se agregó, canceló o reordenó) |
| `queue:now-playing` | `{ tableId, currentSong: Song }`            | El DJ activó una canción como PLAYING           |

---

## Resumen de Rutas

| Método | Ruta                         | Autenticación | Descripción                          |
|--------|------------------------------|---------------|--------------------------------------|
| POST   | /auth/login                  | No            | Login del administrador              |
| POST   | /admin                       | JWT           | Crear nuevo administrador            |
| GET    | /admin                       | JWT           | Listar administradores               |
| POST   | /tables                      | JWT           | Crear mesa                           |
| GET    | /tables                      | JWT           | Listar mesas                         |
| GET    | /tables/:id                  | JWT           | Detalle de mesa con cola             |
| PATCH  | /tables/:id                  | JWT           | Actualizar mesa                      |
| DELETE | /tables/:id                  | JWT           | Desactivar mesa                      |
| GET    | /songs                       | No            | Buscar canciones con filtros         |
| GET    | /songs/:id                   | No            | Detalle de canción                   |
| POST   | /songs                       | JWT           | Agregar canción a biblioteca         |
| PATCH  | /songs/:id                   | JWT           | Actualizar canción                   |
| DELETE | /songs/:id                   | JWT           | Desactivar canción                   |
| POST   | /queue                       | No            | Cliente agrega canción a cola        |
| GET    | /queue/table/:tableId        | No            | Ver cola activa de una mesa          |
| GET    | /queue                       | JWT           | Ver todas las colas (vista DJ)       |
| PATCH  | /queue/:id                   | JWT           | DJ actualiza estado de item          |
| DELETE | /queue/:id                   | JWT           | DJ elimina item de cola              |
| POST   | /sessions/join               | No            | Cliente se vincula a mesa via QR     |
| GET    | /sessions/:id                | No            | Verificar sesión activa              |

---

*Documento generado para el Proyecto Taki Play — Interculturalidad. Versión 1.0*
