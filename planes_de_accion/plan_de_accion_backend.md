# Plan de Acción: Backend y Base de Datos — Taki Play (Proyecto Interculturalidad)

---

## Índice

1. [Visión General de la Arquitectura](#1-visión-general-de-la-arquitectura)
2. [Prerequisitos e Instalación Global](#2-prerequisitos-e-instalación-global)
3. [Inicialización del Proyecto NestJS](#3-inicialización-del-proyecto-nestjs)
4. [Instalación de Dependencias](#4-instalación-de-dependencias)
5. [Configuración de Variables de Entorno](#5-configuración-de-variables-de-entorno)
6. [Diseño del Esquema de Base de Datos (Prisma)](#6-diseño-del-esquema-de-base-de-datos-prisma)
7. [Configuración del Módulo Prisma en NestJS](#7-configuración-del-módulo-prisma-en-nestjs)
8. [Estructura de Módulos de la Aplicación](#8-estructura-de-módulos-de-la-aplicación)
9. [Módulo de Autenticación (Auth)](#9-módulo-de-autenticación-auth)
10. [Módulo de Administradores (Admin)](#10-módulo-de-administradores-admin)
11. [Módulo de Mesas (Tables)](#11-módulo-de-mesas-tables)
12. [Módulo de Canciones (Songs)](#12-módulo-de-canciones-songs)
13. [Módulo de Cola de Reproducción (Queue)](#13-módulo-de-cola-de-reproducción-queue)
14. [Módulo de Clientes / Sesiones de Mesa (Sessions)](#14-módulo-de-clientes--sesiones-de-mesa-sessions)
15. [Gateway de WebSockets (Tiempo Real)](#15-gateway-de-websockets-tiempo-real)
16. [Guards, Decorators y Pipes Globales](#16-guards-decorators-y-pipes-globales)
17. [Configuración Global de la Aplicación (main.ts)](#17-configuración-global-de-la-aplicación-maints)
18. [Seeders — Datos Iniciales](#18-seeders--datos-iniciales)
19. [Orden de Ejecución para Levantar el Proyecto](#19-orden-de-ejecución-para-levantar-el-proyecto)

---

## 1. Visión General de la Arquitectura

```
taki_play/
├── src/
│   ├── auth/               # JWT login, estrategias Passport
│   ├── admin/              # CRUD de administradores
│   ├── tables/             # CRUD de mesas (DJ)
│   ├── songs/              # Biblioteca de canciones (búsqueda, filtros, CRUD)
│   ├── queue/              # Cola de reproducción (lógica de negocio central)
│   ├── sessions/           # Vinculación cliente ↔ mesa (sin login)
│   ├── websockets/         # Gateway de WebSockets (tiempo real)
│   ├── prisma/             # Servicio Prisma compartido
│   ├── common/             # Guards, Decorators, Interceptors, Pipes, DTOs base
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env
└── package.json
```

**Flujos principales:**

- **Cliente (anónimo):** Escanea QR → vincula sesión a mesa → busca canciones → agrega a cola (máx. 10 por mesa).
- **DJ (Admin):** Login JWT → gestiona mesas, biblioteca, cola → puede crear otros admins.
- **Tiempo real:** Cada cambio en la cola emite un evento WebSocket a todos los clientes conectados de esa mesa.

---

## 2. Prerequisitos e Instalación Global

### 2.1 Software requerido

| Herramienta     | Versión recomendada | Notas                                      |
|-----------------|---------------------|--------------------------------------------|
| Node.js         | 20 LTS              | Verificar con `node -v`                    |
| npm             | 10+                 | Incluido con Node                          |
| PostgreSQL       | 15+                 | Servidor local corriendo en puerto 5432    |
| NestJS CLI      | última              | Instalar globalmente                       |

### 2.2 Crear la base de datos en PostgreSQL

Conectarse a PostgreSQL como superusuario y ejecutar:

```sql
CREATE DATABASE taki_karaoke;
-- Usuario postgres con contraseña 'admin' ya debe existir
-- Verificar: \l  (lista bases de datos)
```

### 2.3 Instalar NestJS CLI globalmente

```bash
npm install -g @nestjs/cli
```

---

## 3. Inicialización del Proyecto NestJS

```bash
nest new taki_play
# Seleccionar: npm como gestor de paquetes
cd taki_play
```

---

## 4. Instalación de Dependencias

### 4.1 Prisma (ORM + PostgreSQL)

```bash
npm install prisma @prisma/client
npx prisma init
```

Esto crea la carpeta `prisma/` con `schema.prisma` y agrega `DATABASE_URL` al `.env`.

### 4.2 Autenticación (JWT + Bcrypt)

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

- **`bcrypt`**: Para hashear contraseñas antes de guardarlas en BD. NUNCA almacenar contraseñas en texto plano.
- **`passport-jwt`**: Estrategia de extracción y validación del token JWT.

### 4.3 Validación de Datos

```bash
npm install class-validator class-transformer
```

Usados con los DTOs para validar el body de las peticiones automáticamente.

### 4.4 Configuración de Variables de Entorno

```bash
npm install @nestjs/config
```

### 4.5 WebSockets (Tiempo Real)

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### 4.6 UUID (generación de identificadores únicos para mesas)

Node.js 20+ incluye `crypto.randomUUID()` nativamente. No se necesita paquete adicional.

---

## 5. Configuración de Variables de Entorno

Editar el archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL="postgresql://postgres:admin@localhost:5432/taki_karaoke?schema=public"

# JWT
JWT_SECRET="una_clave_secreta_larga_y_aleatoria_aqui"
JWT_EXPIRES_IN="8h"

# App
PORT=3000
```

> **Seguridad:** El archivo `.env` NO debe subirse a control de versiones. Agregar `.env` al `.gitignore`.

---

## 6. Diseño del Esquema de Base de Datos (Prisma)

El archivo `prisma/schema.prisma` debe quedar con la siguiente estructura de modelos:

### 6.1 Configuración del datasource y generator

```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### 6.2 Modelo: Admin

Representa al DJ o administrador del sistema.

```
model Admin {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String   // bcrypt hash — NUNCA texto plano
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 6.3 Modelo: Table (Mesa)

```
model Table {
  id         String        @id @default(uuid())
  number     Int           @unique  // Número visible de la mesa (1, 2, 3...)
  qrCode     String        @unique  // Token único para el QR
  isActive   Boolean       @default(true)
  createdAt  DateTime      @default(now())
  sessions   TableSession[]
  queueItems QueueItem[]
}
```

### 6.4 Modelo: TableSession (Sesión de Cliente en Mesa)

Representa la vinculación anónima de un cliente a una mesa.

```
model TableSession {
  id         String    @id @default(uuid())
  tableId    String
  table      Table     @relation(fields: [tableId], references: [id])
  clientName String?   // Nombre opcional que el cliente puede ingresar
  createdAt  DateTime  @default(now())
  expiresAt  DateTime? // Opcional: expiración de la sesión
}
```

### 6.5 Modelo: Song (Canción)

```
model Song {
  id          String      @id @default(uuid())
  title       String
  artist      String
  album       String?
  genre       String
  language    Language    // Enum
  duration    Int         // Duración total en segundos
  demoUrl     String      // URL del clip de demostración (15-30 seg)
  fullUrl     String      // URL del audio completo (para reproducción)
  coverUrl    String?     // URL de la carátula
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  queueItems  QueueItem[]
}

enum Language {
  SPANISH
  KICHWA
  ACHUAR
  OTHER
}
```

### 6.6 Modelo: QueueItem (Elemento en Cola)

```
model QueueItem {
  id          String      @id @default(uuid())
  tableId     String
  table       Table       @relation(fields: [tableId], references: [id])
  songId      String
  song        Song        @relation(fields: [songId], references: [id])
  requestedBy String?     // Nombre o ID de sesión del cliente que la solicitó
  status      QueueStatus @default(PENDING)
  position    Int         // Posición en la cola (1 = siguiente en reproducirse)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum QueueStatus {
  PENDING     // En espera
  PLAYING     // Reproduciéndose actualmente
  PLAYED      // Ya se reprodujo
  CANCELLED   // Cancelada por el DJ
}
```

### 6.7 Ejecutar la migración

Después de definir el schema, generar y aplicar la migración inicial:

```bash
npx prisma migrate dev --name init
```

Esto crea las tablas en `taki_karaoke` y genera el Prisma Client tipado.

---

## 7. Configuración del Módulo Prisma en NestJS

### 7.1 Crear el PrismaService

Ubicación: `src/prisma/prisma.service.ts`

- Extender de `PrismaClient`.
- Implementar `OnModuleInit` para conectar automáticamente al iniciar el módulo (`$connect()`).
- Implementar `OnModuleDestroy` para desconectar al apagar la app (`$disconnect()`).

### 7.2 Crear el PrismaModule

Ubicación: `src/prisma/prisma.module.ts`

- Declarar `PrismaService` como provider.
- Exportar `PrismaService` para que otros módulos puedan inyectarlo.
- Marcar el módulo como `@Global()` para no tener que importarlo en cada módulo que lo use.

### 7.3 Registrar en AppModule

Importar `PrismaModule` en `src/app.module.ts`.

---

## 8. Estructura de Módulos de la Aplicación

Cada módulo sigue la arquitectura estándar de NestJS:

```
modulo/
├── modulo.module.ts       # Declara providers, imports, exports, controllers
├── modulo.controller.ts   # Define rutas HTTP (decoradores @Get, @Post, etc.)
├── modulo.service.ts      # Lógica de negocio, interacción con Prisma
└── dto/
    ├── create-modulo.dto.ts
    └── update-modulo.dto.ts
```

Generar con NestJS CLI:
```bash
nest generate module <nombre>
nest generate controller <nombre>
nest generate service <nombre>
```

---

## 9. Módulo de Autenticación (Auth)

### 9.1 Estructura

```
src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
└── dto/
    └── login.dto.ts
```

### 9.2 LoginDto

Campos requeridos con validaciones:
- `email`: string, formato email válido (`@IsEmail()`)
- `password`: string, no vacío (`@IsNotEmpty()`)

### 9.3 AuthService — Lógica de Login

1. Recibir `email` y `password` del DTO.
2. Buscar el admin en BD por email usando `PrismaService`.
3. Si no existe → lanzar `UnauthorizedException`.
4. Usar `bcrypt.compare(password, admin.passwordHash)` para verificar la contraseña.
5. Si no coincide → lanzar `UnauthorizedException`.
6. Si es válida → generar y retornar un JWT con `JwtService.sign({ sub: admin.id, email: admin.email })`.

> La verificación con bcrypt asegura que incluso si la BD es comprometida, las contraseñas no son legibles.

### 9.4 JwtStrategy

- Extender `PassportStrategy(Strategy)`.
- Configurar `ExtractJwt.fromAuthHeaderAsBearerToken()`.
- En el método `validate()`, recibir el payload del token y retornar el objeto del admin para inyectarlo en `@Request()`.

### 9.5 AuthModule — Configuración

- Importar `JwtModule.registerAsync()` leyendo `JWT_SECRET` y `JWT_EXPIRES_IN` desde `ConfigService`.
- Importar `PassportModule`.
- Declarar `JwtStrategy` como provider.
- Registrar `PrismaModule` (ya es global, no necesario si se marcó `@Global()`).

### 9.6 AuthController

- `POST /auth/login` → llama a `AuthService.login(loginDto)`.

---

## 10. Módulo de Administradores (Admin)

### 10.1 Propósito

Permite al DJ (admin autenticado) crear nuevos administradores en el sistema.

### 10.2 CreateAdminDto

Campos con validaciones:
- `name`: string, no vacío
- `email`: string, formato email
- `password`: string, mínimo 8 caracteres (`@MinLength(8)`)

### 10.3 AdminService — Lógica de Creación

1. Verificar que el email no esté ya registrado.
2. Hashear la contraseña: `bcrypt.hash(password, 10)`. El `saltRounds = 10` es el estándar recomendado.
3. Guardar en BD usando `PrismaService` con el `passwordHash` resultante.
4. Retornar el admin creado **sin incluir** el campo `passwordHash` en la respuesta.

### 10.4 AdminController

- Protegido con `@UseGuards(JwtAuthGuard)` — solo admins autenticados pueden acceder.
- `POST /admin` → crea un nuevo admin.
- `GET /admin` → lista todos los admins (sin mostrar passwordHash).

---

## 11. Módulo de Mesas (Tables)

### 11.1 Propósito

CRUD completo de mesas, gestionado únicamente por el DJ.

### 11.2 CreateTableDto / UpdateTableDto

- `number`: número entero, positivo
- `isActive`: booleano (opcional en update)

### 11.3 TablesService — Lógica

- **Crear mesa:** Al crear, generar automáticamente un `qrCode` único usando `crypto.randomUUID()`. Este token es el que el frontend codificará en el QR físico.
- **Listar mesas:** Devolver todas las mesas con el conteo de items en cola activos.
- **Obtener una mesa:** Devolver la mesa con su cola actual (`PENDING` y `PLAYING`).
- **Actualizar mesa:** Modificar número o estado activo.
- **Eliminar mesa:** Considerar soft-delete (marcar `isActive = false`) en lugar de borrado físico para preservar el historial de la cola.

### 11.4 TablesController

- Todas las rutas protegidas con `@UseGuards(JwtAuthGuard)`.
- `POST /tables`
- `GET /tables`
- `GET /tables/:id`
- `PATCH /tables/:id`
- `DELETE /tables/:id`

---

## 12. Módulo de Canciones (Songs)

### 12.1 Propósito

Biblioteca de canciones: CRUD para el DJ y búsqueda/filtros para clientes.

### 12.2 CreateSongDto / UpdateSongDto

Campos:
- `title`, `artist`: strings requeridos
- `album`: string opcional
- `genre`: string requerido
- `language`: debe ser uno de los valores del enum `Language` (`@IsEnum(Language)`)
- `duration`: número entero en segundos
- `demoUrl`, `fullUrl`: strings, formato URL (`@IsUrl()`)
- `coverUrl`: string, URL opcional

### 12.3 SongsService — Lógica

- **Búsqueda y filtros (público):**
  - Recibir query params: `search` (texto libre en title/artist), `language`, `genre`, `artist`.
  - Construir la query Prisma con filtros `where` dinámicos usando `AND` con condiciones opcionales.
  - Solo retornar canciones con `isActive: true`.
- **CRUD protegido (DJ):**
  - Crear, actualizar, activar/desactivar canciones.
  - El endpoint de detalle para clientes solo expone: `id`, `title`, `artist`, `genre`, `language`, `duration`, `demoUrl`, `coverUrl` (NO `fullUrl` — la URL completa solo se expone durante la reproducción gestionada por el DJ).

### 12.4 SongsController

- Rutas públicas (sin guard): `GET /songs`, `GET /songs/:id`.
- Rutas protegidas (con `JwtAuthGuard`): `POST /songs`, `PATCH /songs/:id`, `DELETE /songs/:id`.

---

## 13. Módulo de Cola de Reproducción (Queue)

### 13.1 Propósito

Es el corazón del sistema. Gestiona las solicitudes de canciones de los clientes y el control del DJ.

### 13.2 AddToQueueDto (usado por clientes)

- `songId`: UUID válido (`@IsUUID()`)
- `tableId`: UUID válido
- `sessionId`: UUID válido (la sesión del cliente)
- `requestedBy`: string opcional (nombre del cliente)

### 13.3 UpdateQueueItemDto (usado por el DJ)

- `status`: enum `QueueStatus`
- `position`: número entero (para reordenar)

### 13.4 QueueService — Lógica de Negocio

**Regla crítica — Límite de 10 por mesa:**

Antes de agregar a la cola, contar los items con `status: PENDING` para esa mesa. Si el conteo es >= 10, lanzar `BadRequestException` con mensaje claro.

**Agregar canción a la cola:**
1. Validar límite de 10 items pendientes por mesa.
2. Verificar que la canción existe y está activa.
3. Verificar que la mesa existe y está activa.
4. Calcular la siguiente `position` disponible (MAX position actual + 1).
5. Crear el `QueueItem` en BD.
6. Emitir evento WebSocket `queue:updated` con la cola actualizada de esa mesa.

**Obtener cola de una mesa (público):**
- Retornar items con status `PENDING` y `PLAYING`, ordenados por `position` ascendente.
- Incluir datos de la canción (title, artist, coverUrl).

**Actualizar estado (DJ):**
- Marcar como `PLAYING`, `PLAYED` o `CANCELLED`.
- Al marcar como `PLAYING`, verificar que no haya otro item ya en `PLAYING` para esa mesa (solo una canción a la vez).
- Después de cualquier cambio, emitir evento WebSocket `queue:updated`.

**Eliminar item de la cola (DJ):**
- Cambiar status a `CANCELLED` (no borrado físico).
- Re-calcular posiciones de los items restantes.
- Emitir evento WebSocket `queue:updated`.

### 13.5 QueueController

- Rutas públicas: `POST /queue` (agregar canción), `GET /queue/table/:tableId` (ver cola).
- Rutas protegidas (DJ): `PATCH /queue/:id`, `DELETE /queue/:id`, `GET /queue` (ver todas las colas).

---

## 14. Módulo de Clientes / Sesiones de Mesa (Sessions)

### 14.1 Propósito

Permite a un cliente vincularse a una mesa escaneando el QR, sin necesidad de login.

### 14.2 CreateSessionDto

- `qrCode`: string, no vacío — el token único que viene codificado en el QR.
- `clientName`: string opcional.

### 14.3 SessionsService — Lógica

**Vincularse a mesa (join):**
1. Buscar la `Table` por `qrCode`.
2. Si no existe o `isActive = false` → lanzar `NotFoundException`.
3. Crear un `TableSession` vinculado a esa mesa.
4. Retornar el `sessionId` y `tableId` al cliente — el frontend los guardará en memoria/localStorage para usar en solicitudes de canciones.

### 14.4 SessionsController

- `POST /sessions/join` → vincula cliente a mesa, retorna sessionId y tableId.
- `GET /sessions/:id` → retorna info de la sesión (para que el frontend valide que la sesión sigue activa).

---

## 15. Gateway de WebSockets (Tiempo Real)

### 15.1 Propósito

Notificar a todos los clientes conectados de una mesa cuando la cola cambia (canción añadida, estado actualizado, canción retirada).

### 15.2 Ubicación

`src/websockets/queue.gateway.ts`

### 15.3 Configuración del Gateway

- Decorador: `@WebSocketGateway({ cors: { origin: '*' } })` — para desarrollo local con CORS abierto.
- Implementar `OnGatewayConnection` y `OnGatewayDisconnection` para loggear conexiones.
- El `@WebSocketServer()` expone el servidor Socket.IO para emitir eventos.

### 15.4 Rooms (Salas por Mesa)

Para enviar actualizaciones solo a los clientes de una mesa específica, usar el concepto de "rooms" de Socket.IO:

- **Evento `join-table`:** El cliente emite este evento con `{ tableId }`. El servidor llama a `socket.join(tableId)` para suscribir el socket a la sala de esa mesa.
- **Evento `leave-table`:** El cliente emite esto para salir de la sala.

### 15.5 Emisión de Eventos desde QueueService

El `QueueService` necesita acceder al gateway para emitir eventos. Dos opciones:
1. **Inyectar el Gateway en QueueService** (más simple): Exportar el gateway desde `WebsocketsModule` e importarlo en `QueueModule`.
2. **EventEmitter interno de NestJS**: Usar `@nestjs/event-emitter` como bus de eventos desacoplado (más limpio, recomendado para escalar).

**Eventos a emitir:**
- `queue:updated` — payload: `{ tableId, queue: QueueItem[] }` — se emite a la room de la mesa específica.
- `queue:now-playing` — payload: `{ tableId, currentSong: Song }` — cuando el DJ marca una canción como PLAYING.

### 15.6 Módulo WebSockets

`src/websockets/websockets.module.ts`:
- Declarar y exportar `QueueGateway`.

---

## 16. Guards, Decorators y Pipes Globales

### 16.1 JwtAuthGuard

Ubicación: `src/common/guards/jwt-auth.guard.ts`

- Extender `AuthGuard('jwt')` de Passport.
- Este guard se aplica con `@UseGuards(JwtAuthGuard)` en los controllers que requieren autenticación.

### 16.2 Decorator @CurrentAdmin

Ubicación: `src/common/decorators/current-admin.decorator.ts`

- Crear un decorator personalizado que extrae el admin del `request.user` (inyectado por el JwtStrategy).
- Uso en controllers: `@CurrentAdmin() admin: Admin`.

### 16.3 ValidationPipe Global

Configurar en `main.ts` para aplicar `class-validator` automáticamente a todos los DTOs:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,       // Elimina propiedades no declaradas en el DTO
  forbidNonWhitelisted: true, // Lanza error si llegan propiedades extra
  transform: true,       // Transforma los tipos automáticamente (string → number, etc.)
}));
```

---

## 17. Configuración Global de la Aplicación (main.ts)

En `src/main.ts`, la configuración debe incluir:

1. **ConfigService**: Para leer el puerto desde `.env`.
2. **ValidationPipe global**: Ver sección 16.3.
3. **CORS**: Habilitar para desarrollo local (`app.enableCors()`).
4. **Prefijo global de API (opcional pero recomendado)**: `app.setGlobalPrefix('api/v1')` — todas las rutas quedarían como `/api/v1/auth/login`, etc.
5. **Puerto**: Leer desde `process.env.PORT` o `3000` como fallback.

---

## 18. Seeders — Datos Iniciales

Ubicación: `prisma/seed.ts`

El seeder debe crear:

1. **Un Admin por defecto (el primer DJ):**
   - Hashear la contraseña de prueba con `bcrypt.hash('password123', 10)`.
   - Guardar en BD con email fácil de recordar para pruebas locales.

2. **Mesas de prueba:**
   - Crear 5 mesas (número 1 al 5) con `qrCode` generados con `crypto.randomUUID()`.

3. **Canciones de muestra:**
   - Al menos 10 canciones en español, 5 en kichwa, 3 en achuar.
   - Usar URLs de demo ficticias pero con formato válido.

**Configurar el seeder en `package.json`:**

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

**Ejecutar el seeder:**

```bash
npx prisma db seed
```

---

## 19. Orden de Ejecución para Levantar el Proyecto

Seguir estos pasos en orden cuando se clona o configura el proyecto por primera vez:

1. `npm install` — instalar dependencias.
2. Configurar `.env` con `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`.
3. Verificar que PostgreSQL está corriendo y la BD `taki_karaoke` existe.
4. `npx prisma migrate dev --name init` — crear tablas en la BD.
5. `npx prisma generate` — regenerar el Prisma Client tipado.
6. `npx prisma db seed` — poblar datos iniciales.
7. `npm run start:dev` — levantar el servidor en modo watch.
8. Verificar en `http://localhost:3000/api/v1/songs` que responde.
9. Probar login en Thunder Client con las credenciales del seed.

---

*Documento generado para el Proyecto Taki Play — Interculturalidad. Versión 1.0*
