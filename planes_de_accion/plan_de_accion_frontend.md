# Plan de Acción: Frontend — Taki Play (Proyecto Interculturalidad)

> **Stack:** Next.js · Tailwind CSS · Socket.io-client · Zustand · React Query  
> **Tema visual:** Nocturno con acentos neón (púrpura, cian, rosa)  
> **Paradigma UX:** Toda acción CRUD se resuelve en modales. Sin redirecciones para formularios.

---

## Índice

1. [Visión General de la Arquitectura Frontend](#1-visión-general-de-la-arquitectura-frontend)
2. [Prerequisitos e Inicialización del Proyecto](#2-prerequisitos-e-inicialización-del-proyecto)
3. [Instalación de Dependencias](#3-instalación-de-dependencias)
4. [Configuración de Tailwind CSS y Tema Neón](#4-configuración-de-tailwind-css-y-tema-neón)
5. [Configuración de Variables de Entorno](#5-configuración-de-variables-de-entorno)
6. [Estructura de Carpetas del Proyecto](#6-estructura-de-carpetas-del-proyecto)
7. [Capa de Servicios — Comunicación con la API](#7-capa-de-servicios--comunicación-con-la-api)
8. [Gestión de Estado Global (Zustand)](#8-gestión-de-estado-global-zustand)
9. [Integración de WebSockets (Socket.io-client)](#9-integración-de-websockets-socketio-client)
10. [Sistema de Modales (Arquitectura Central de UX)](#10-sistema-de-modales-arquitectura-central-de-ux)
11. [Autenticación del DJ — Contexto y Guards](#11-autenticación-del-dj--contexto-y-guards)
12. [Vista del Cliente — Flujo Completo](#12-vista-del-cliente--flujo-completo)
13. [Vista del DJ — Dashboard y Panel de Control](#13-vista-del-dj--dashboard-y-panel-de-control)
14. [Componentes UI Compartidos (Design System)](#14-componentes-ui-compartidos-design-system)
15. [Manejo de Errores y Feedback Visual](#15-manejo-de-errores-y-feedback-visual)
16. [Optimización y Buenas Prácticas Next.js](#16-optimización-y-buenas-prácticas-nextjs)
17. [Orden de Ejecución para Levantar el Proyecto](#17-orden-de-ejecución-para-levantar-el-proyecto)

---

## 1. Visión General de la Arquitectura Frontend

### 1.1 Las dos interfaces del sistema

El frontend alberga dos experiencias de usuario completamente distintas bajo el mismo proyecto Next.js:

| Interfaz | Usuario | Acceso | Ruta base |
|---|---|---|---|
| **Vista Cliente** | Comensal del karaoke | Anónimo (via QR) | `/` o `/mesa/[qrCode]` |
| **Vista DJ (Dashboard)** | Administrador | Login JWT | `/dj` |

### 1.2 Diagrama de flujo de datos

```
                    ┌─────────────────────────┐
                    │   Next.js Frontend       │
                    │                         │
  Cliente ──QR────► │  /mesa/[qrCode]          │──HTTP──► NestJS API
                    │  (buscar, filtrar,       │
                    │   pedir canciones)       │◄──WS───► Socket.io
                    │                         │          Gateway
  DJ ─── Login ──► │  /dj (dashboard,        │
                    │   CRUD en modales)       │
                    └─────────────────────────┘
```

### 1.3 Principios de diseño

- **Mobile-first:** La vista del cliente se diseña primero para móvil (los comensales usan sus teléfonos).
- **Tema nocturno neón:** Fondo oscuro (`#0a0a0f`), acentos en `#a855f7` (púrpura), `#06b6d4` (cian) y `#ec4899` (rosa).
- **Sin recargas:** La cola se actualiza en tiempo real vía WebSockets sin recargar la página.
- **Modales para todo:** Ningún formulario de creación/edición abre una página nueva.

---

## 2. Prerequisitos e Inicialización del Proyecto

### 2.1 Software requerido

- Node.js 20 LTS (mismo que el backend).
- El backend debe estar corriendo en `http://localhost:3000`.

### 2.2 Inicializar Next.js dentro de la carpeta `frontend/`

Desde la carpeta raíz del proyecto (`taki_play/`), ejecutar:

```bash
npx create-next-app@latest frontend
```

Durante la configuración interactiva, seleccionar:
- **TypeScript:** Sí
- **ESLint:** Sí
- **Tailwind CSS:** Sí (se instala automáticamente)
- **`src/` directory:** Sí — para separar código de configuración
- **App Router:** Sí — usar el App Router moderno de Next.js 14+
- **Import alias (`@/`):** Sí

Esto crea `frontend/` con su propio `package.json`, `node_modules` y configuración de Tailwind lista.

---

## 3. Instalación de Dependencias

Todas las instalaciones se ejecutan **desde dentro de la carpeta `frontend/`**.

### 3.1 Cliente HTTP (comunicación con la API REST)

```bash
npm install axios
```
Axios permite interceptores globales para adjuntar el token JWT automáticamente a las peticiones protegidas.

### 3.2 Estado global

```bash
npm install zustand
```
Zustand es minimalista, no requiere Provider y es ideal para manejar el estado del cliente (sesión de mesa) y el estado del DJ (token JWT, cola activa).

### 3.3 Data fetching y caché del servidor

```bash
npm install @tanstack/react-query
```
React Query gestiona el ciclo de vida de las peticiones (loading, error, success, refetch), el caché de datos del servidor y la invalidación de caché al mutar datos.

### 3.4 WebSockets

```bash
npm install socket.io-client
```
Para conectarse al Gateway de Socket.io del backend y recibir actualizaciones de la cola en tiempo real.

### 3.5 Íconos

```bash
npm install lucide-react
```
Librería de íconos SVG moderna, ligera, consistente con el estilo neón. Incluye íconos para música, búsqueda, cola, usuarios, etc.

### 3.6 Modales accesibles

```bash
npm install @radix-ui/react-dialog
```
Primitivo accesible (ARIA) para construir los modales del sistema. Se estiliza completamente con Tailwind CSS.

### 3.7 Formularios y validación

```bash
npm install react-hook-form zod @hookform/resolvers
```
- **react-hook-form:** Maneja el estado y la validación de formularios sin re-renders innecesarios.
- **zod:** Define esquemas de validación (mismos tipos que los DTOs del backend).
- **@hookform/resolvers:** Conecta Zod con React Hook Form.

### 3.8 Notificaciones (Toast)

```bash
npm install sonner
```
Librería de toasts moderna con soporte para tema oscuro, perfecta para el estilo neón.

### 3.9 Animaciones

```bash
npm install framer-motion
```
Para animar la entrada/salida de modales, elementos de la cola y transiciones de página.

---

## 4. Configuración de Tailwind CSS y Tema Neón

### 4.1 Paleta de colores personalizada

En `tailwind.config.ts`, extender los colores con la paleta del proyecto:

| Token | Color | Uso |
|---|---|---|
| `neon-purple` | `#a855f7` | Botones primarios, acentos |
| `neon-cyan` | `#06b6d4` | Información, etiquetas de idioma |
| `neon-pink` | `#ec4899` | Alertas, "reproduciendo ahora" |
| `neon-green` | `#22c55e` | Confirmaciones, éxito |
| `dark-base` | `#0a0a0f` | Fondo principal |
| `dark-surface` | `#14141f` | Cards, panels |
| `dark-border` | `#2a2a3f` | Bordes sutiles |

### 4.2 Efecto glow (neón resplandor)

Agregar utilidades personalizadas de `box-shadow` en la configuración de Tailwind para simular el brillo neón:

- `.glow-purple`: `box-shadow: 0 0 20px rgba(168, 85, 247, 0.5)`
- `.glow-cyan`: `box-shadow: 0 0 20px rgba(6, 182, 212, 0.5)`
- `.glow-pink`: `box-shadow: 0 0 20px rgba(236, 72, 153, 0.5)`

### 4.3 Fuente tipográfica

Configurar Google Fonts en el `layout.tsx` raíz. Recomendado: **Rajdhani** o **Orbitron** para títulos (estética futurista/neón), **Inter** o **DM Sans** para cuerpos de texto.

### 4.4 CSS global base

En `src/app/globals.css`, establecer:
- Fondo base `dark-base` en el `body`.
- `scrollbar-width: thin` con colores oscuros para el scrollbar.
- Clase `.neon-text` con `text-shadow` para textos con efecto luminoso.

---

## 5. Configuración de Variables de Entorno

Crear el archivo `.env.local` en la raíz de `frontend/`:

```env
# URL base de la API del backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# URL del servidor WebSocket
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

> Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el navegador. Las que no tienen ese prefijo solo están disponibles en el servidor (SSR/API routes).

---

## 6. Estructura de Carpetas del Proyecto

```
frontend/
├── src/
│   ├── app/                          # App Router de Next.js
│   │   ├── layout.tsx                # Layout raíz (providers globales)
│   │   ├── page.tsx                  # Página de bienvenida/escaneo QR
│   │   ├── mesa/
│   │   │   └── [qrCode]/
│   │   │       └── page.tsx          # Vista principal del cliente
│   │   └── dj/
│   │       ├── layout.tsx            # Layout del DJ (verifica auth)
│   │       ├── login/
│   │       │   └── page.tsx          # Página de login del DJ
│   │       └── page.tsx              # Dashboard principal del DJ
│   │
│   ├── components/
│   │   ├── ui/                       # Design system base (botones, inputs, badges)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── modals/                   # Todos los modales del sistema
│   │   │   ├── ModalWrapper.tsx      # Shell genérico con @radix-ui/dialog
│   │   │   ├── SongDetailModal.tsx   # Ver demo + botón "Pedir esta canción"
│   │   │   ├── AddSongModal.tsx      # DJ: crear canción
│   │   │   ├── EditSongModal.tsx     # DJ: editar canción
│   │   │   ├── AddTableModal.tsx     # DJ: crear mesa
│   │   │   ├── EditTableModal.tsx    # DJ: editar mesa
│   │   │   ├── CreateAdminModal.tsx  # DJ: crear nuevo administrador
│   │   │   └── ConfirmDeleteModal.tsx # DJ: confirmar eliminación genérica
│   │   │
│   │   ├── client/                   # Componentes exclusivos de la vista cliente
│   │   │   ├── QRScanner.tsx         # Instrucción de escaneo / bienvenida
│   │   │   ├── SongSearchBar.tsx     # Input de búsqueda en tiempo real
│   │   │   ├── SongFilters.tsx       # Chips de filtro: idioma, género, artista
│   │   │   ├── SongCard.tsx          # Tarjeta de canción (cover, título, artista)
│   │   │   ├── SongList.tsx          # Grid/lista de resultados de búsqueda
│   │   │   ├── QueuePanel.tsx        # Panel lateral/bottom: cola activa de la mesa
│   │   │   └── QueueItem.tsx         # Item individual en la cola (con posición)
│   │   │
│   │   └── dj/                       # Componentes exclusivos del panel DJ
│   │       ├── DJHeader.tsx          # Header con nombre del DJ y botón logout
│   │       ├── DJNavTabs.tsx         # Tabs: Mesas | Canciones | Cola | Admins
│   │       ├── TablesPanel.tsx       # Tabla CRUD de mesas
│   │       ├── SongsPanel.tsx        # Tabla CRUD de canciones con filtros
│   │       ├── QueueDJPanel.tsx      # Vista de todas las colas en tiempo real
│   │       ├── AdminsPanel.tsx       # Lista de admins + botón crear nuevo
│   │       └── QueueTableCard.tsx    # Card de cola por mesa (para el DJ)
│   │
│   ├── hooks/                        # Custom hooks de React
│   │   ├── useSocket.ts              # Conexión y eventos de Socket.io
│   │   ├── useQueue.ts               # Estado de cola con WebSocket integrado
│   │   ├── useSongs.ts               # Fetch de canciones + filtros (React Query)
│   │   ├── useTables.ts              # Fetch y mutaciones de mesas
│   │   ├── useAuth.ts                # Login, logout, verificación de token
│   │   └── useModal.ts               # Controlador abierto/cerrado de modales
│   │
│   ├── services/                     # Capa de comunicación con la API
│   │   ├── api.ts                    # Instancia Axios con interceptores
│   │   ├── auth.service.ts           # login()
│   │   ├── songs.service.ts          # getSongs(), getSong(), createSong()...
│   │   ├── tables.service.ts         # getTables(), createTable()...
│   │   ├── queue.service.ts          # addToQueue(), updateItem(), removeItem()...
│   │   ├── sessions.service.ts       # joinTable()
│   │   └── admin.service.ts          # createAdmin(), getAdmins()
│   │
│   ├── store/                        # Stores de Zustand
│   │   ├── authStore.ts              # Token JWT, datos del DJ autenticado
│   │   └── sessionStore.ts           # sessionId, tableId, tableNumber del cliente
│   │
│   ├── types/                        # Tipos TypeScript del dominio
│   │   ├── song.types.ts
│   │   ├── queue.types.ts
│   │   ├── table.types.ts
│   │   └── auth.types.ts
│   │
│   └── lib/                          # Utilidades y configuraciones
│       ├── queryClient.ts            # Instancia global de React Query
│       └── socket.ts                 # Factory de la instancia Socket.io
│
├── public/
│   ├── logo-taki.svg                 # Logo del proyecto
│   └── placeholder-cover.png        # Cover por defecto para canciones sin imagen
│
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 7. Capa de Servicios — Comunicación con la API

### 7.1 Instancia central de Axios (`src/services/api.ts`)

Crear una única instancia de Axios con:
- `baseURL` tomado de `process.env.NEXT_PUBLIC_API_URL`.
- **Request interceptor:** Antes de cada petición, leer el token JWT del store de Zustand (`authStore`) y adjuntarlo en el header `Authorization: Bearer <token>`. Si no hay token, la petición sale sin ese header (para rutas públicas).
- **Response interceptor:** Si el backend responde con `401 Unauthorized`, limpiar el store de auth y redirigir a `/dj/login`.

### 7.2 Servicios individuales

Cada archivo en `services/` exporta funciones tipadas que usan la instancia de Axios:

- **`auth.service.ts`:** `login(email, password)` → retorna `{ access_token, admin }`.
- **`songs.service.ts`:** `getSongs(filters?)`, `getSong(id)`, `createSong(dto)`, `updateSong(id, dto)`, `deleteSong(id)`.
- **`tables.service.ts`:** `getTables()`, `getTable(id)`, `createTable(dto)`, `updateTable(id, dto)`, `deleteTable(id)`.
- **`queue.service.ts`:** `addToQueue(dto)`, `getTableQueue(tableId)`, `getAllQueues()`, `updateQueueItem(id, dto)`, `removeQueueItem(id)`.
- **`sessions.service.ts`:** `joinTable(qrCode, clientName?)` → retorna `{ sessionId, tableId, tableNumber }`.
- **`admin.service.ts`:** `getAdmins()`, `createAdmin(dto)`.

### 7.3 React Query para data fetching

Cada servicio de lectura se envuelve en un hook `useQuery`:
- Gestiona automáticamente `isLoading`, `isError`, `data`.
- Configura `staleTime` según la frecuencia de cambio de los datos (las canciones cambian poco, la cola cambia mucho).
- Las mutaciones (`useMutation`) invalidan automáticamente el caché tras un CRUD exitoso, forzando refetch.

---

## 8. Gestión de Estado Global (Zustand)

### 8.1 `authStore.ts` — Estado del DJ

Campos:
- `token: string | null` — JWT almacenado en memoria (y opcionalmente en `localStorage` para persistencia entre recargas).
- `admin: { id, name, email } | null` — datos del admin autenticado.
- Acciones: `setAuth(token, admin)`, `clearAuth()`.

> **Seguridad:** Guardar el token en `localStorage` es conveniente pero tiene riesgos de XSS. Para producción, considerar `httpOnly cookies`. Para desarrollo local, `localStorage` es aceptable.

### 8.2 `sessionStore.ts` — Estado del Cliente

Campos:
- `sessionId: string | null`
- `tableId: string | null`
- `tableNumber: number | null`
- `clientName: string | null`
- `isJoined: boolean`
- Acciones: `joinTable(data)`, `leaveTable()`.

Este store persiste con `zustand/middleware (persist)` en `sessionStorage` para que si el cliente recarga la página no pierda su sesión.

---

## 9. Integración de WebSockets (Socket.io-client)

### 9.1 Factory de la instancia (`src/lib/socket.ts`)

Crear una función `getSocket()` que retorne siempre la misma instancia de Socket.io (patrón singleton). La URL de conexión viene de `NEXT_PUBLIC_WS_URL`.

La instancia **no se conecta automáticamente** (`autoConnect: false`) para tener control manual de cuándo conectar.

### 9.2 Hook `useSocket.ts`

Este hook maneja el ciclo de vida del socket:
1. Al montar el componente: llamar a `socket.connect()`.
2. Emitir el evento `join-table` con el `tableId` del sessionStore para suscribirse a la sala de la mesa.
3. Escuchar el evento `queue:updated` y llamar a un callback que actualiza el estado local de la cola.
4. Escuchar `queue:now-playing` para mostrar notificación visual del cambio.
5. Al desmontar el componente: emitir `leave-table` y llamar a `socket.disconnect()`.

### 9.3 Hook `useQueue.ts`

Combina:
- La carga inicial de la cola vía HTTP (`queue.service.getTableQueue()`).
- Las actualizaciones en tiempo real del WebSocket (evento `queue:updated`).
- Estado derivado: `currentlyPlaying`, `pendingItems`, `queueCount`.

Este hook es el único punto desde donde los componentes deben leer el estado de la cola.

---

## 10. Sistema de Modales (Arquitectura Central de UX)

### 10.1 Principio fundamental

**Ningún formulario CRUD abre una página nueva.** Toda creación, edición o eliminación ocurre en un modal sobre la página actual.

### 10.2 ModalWrapper.tsx — El Shell genérico

Construido sobre `@radix-ui/react-dialog`. Proporciona:
- Overlay oscuro con `backdrop-blur` y efecto neón en el borde del panel.
- Animación de entrada/salida con Framer Motion (`scale + opacity`).
- Botón X para cerrar.
- Soporte para título, subtítulo y contenido de tipo `children`.
- Cierre al hacer clic fuera o presionar `Escape`.
- Scroll interno si el contenido es largo.

### 10.3 Inventario completo de modales

| Modal | Trigger | Contiene | Datos que recibe |
|---|---|---|---|
| `SongDetailModal` | Click en `SongCard` (vista cliente) | Player del demo (audio HTML5), info completa, botón "Pedir" | Objeto `Song` |
| `AddSongModal` | Botón "+" en `SongsPanel` | Formulario completo de creación | — |
| `EditSongModal` | Botón editar en fila de canción | Formulario pre-cargado | Objeto `Song` |
| `AddTableModal` | Botón "+" en `TablesPanel` | Input de número de mesa | — |
| `EditTableModal` | Botón editar en fila de mesa | Formulario pre-cargado, toggle activo | Objeto `Table` |
| `CreateAdminModal` | Botón en `AdminsPanel` | Formulario con name, email, password | — |
| `ConfirmDeleteModal` | Botón eliminar en cualquier entidad | Mensaje de confirmación + botón rojo | `entityName`, `onConfirm` callback |

### 10.4 Hook `useModal.ts`

Para cada tipo de modal en el panel DJ, el hook gestiona:
- `isOpen: boolean`
- `selectedEntity: T | null` (para modales de edición)
- `openModal(entity?)` y `closeModal()`

Esto evita prop drilling y centraliza el control de visibilidad.

---

## 11. Autenticación del DJ — Contexto y Guards

### 11.1 Página de Login (`/dj/login`)

- Formulario simple: email + password.
- Validación con Zod + react-hook-form.
- Al submit exitoso: guardar token en `authStore`, redirigir a `/dj`.
- Si ya hay token válido: redirigir directamente a `/dj`.
- El formulario también se puede presentar en un modal si el DJ accede desde una ruta protegida.

### 11.2 Layout protegido del DJ (`/dj/layout.tsx`)

Este layout verifica la autenticación **antes de renderizar** el dashboard:
1. Leer el token del `authStore`.
2. Si no hay token: redirigir a `/dj/login` (usando `redirect()` de Next.js en el servidor, o `useRouter` en el cliente).
3. Si hay token: renderizar el layout con `<DJHeader>` y los `<children>`.

---

## 12. Vista del Cliente — Flujo Completo

### 12.1 Página de bienvenida (`/`)

Pantalla minimalista con:
- Logo animado de Taki Play.
- Instrucción: "Escanea el QR de tu mesa para comenzar".
- Ícono de QR con efecto neón pulsante.

No hay búsqueda ni contenido musical aquí. El punto de entrada real es el QR.

### 12.2 Página principal del cliente (`/mesa/[qrCode]`)

Esta es la pantalla que se abre al escanear el QR. El `qrCode` viene en la URL.

**Lógica de inicialización (al cargar la página):**
1. Verificar si el `sessionStore` ya tiene una sesión para este `tableId`.
2. Si no hay sesión: llamar a `sessions.service.joinTable(qrCode)` para crear una.
3. Guardar `sessionId` y `tableId` en `sessionStore`.
4. Conectar el WebSocket y unirse a la sala de la mesa.
5. Cargar la lista de canciones y la cola actual.

**Layout de la pantalla (mobile-first):**

```
┌────────────────────────────────┐
│  🎵 Taki Play  [Mesa #3]       │  ← Header con número de mesa
├────────────────────────────────┤
│  [🔍 Buscar canciones...]      │  ← SongSearchBar
│  [ES] [Kichwa] [Achuar] [Rock] │  ← SongFilters (chips horizontales)
├────────────────────────────────┤
│                                │
│  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │Cover │  │Cover │  │Cover │  │  ← SongList (grid 2-3 col)
│  │ Tit. │  │ Tit. │  │ Tit. │  │
│  └──────┘  └──────┘  └──────┘  │
│  ... más canciones ...         │
│                                │
├────────────────────────────────┤
│  EN COLA (3) ▲                 │  ← QueuePanel colapsable (bottom sheet)
│  1. La Bamba    ▶ PLAYING      │
│  2. Ñucanchik...  PENDING      │
│  3. Bésame Mucho  PENDING      │
└────────────────────────────────┘
```

### 12.3 SongCard — Interacción

- Muestra: cover (con fallback a placeholder), título, artista, badge de idioma con color.
- Click → abre `SongDetailModal`.

### 12.4 SongDetailModal — Flujo de pedido

1. Muestra la info completa de la canción.
2. Sección de **demo** (15-30 seg): elemento `<audio>` HTML5 con controles mínimos. La URL viene del campo `demoUrl`.
3. Botón **"Pedir esta canción"**:
   - Verifica que la cola no tenga 10 items (cuenta visible en el modal).
   - Llama a `queue.service.addToQueue({ songId, tableId, sessionId, requestedBy })`.
   - Muestra toast de éxito: "¡*La Bamba* fue agregada a la cola!".
   - Cierra el modal.

### 12.5 SongFilters — Chips de filtro

- Chips horizontales con scroll horizontal en móvil.
- Filtros: `Todos`, `Español`, `Kichwa`, `Achuar`, `Otro` (idioma) + géneros dinámicos cargados desde las canciones.
- Al seleccionar un chip, actualiza el estado local y dispara un nuevo fetch filtrado.

### 12.6 QueuePanel — Bottom Sheet

- En móvil: panel colapsable desde abajo (estilo "bottom sheet"). Muestra un handle draggable.
- En desktop: panel lateral fijo a la derecha.
- Muestra la cola en tiempo real (via `useQueue`).
- Indicador visual especial para la canción en `PLAYING` (borde rosa neón pulsante, ícono de notas musicales animado).

---

## 13. Vista del DJ — Dashboard y Panel de Control

### 13.1 Layout del DJ

Header fijo con:
- Logo pequeño.
- Nombre del DJ autenticado (`admin.name`).
- Botón **Cerrar sesión** (limpia el store y redirige a `/dj/login`).

Contenido principal con tabs de navegación.

### 13.2 Tabs del Dashboard

| Tab | Contenido |
|---|---|
| **Cola en Vivo** | Vista de todas las mesas con sus colas activas |
| **Canciones** | CRUD de la biblioteca de canciones |
| **Mesas** | CRUD de mesas (genera QR) |
| **Administradores** | Lista de admins + crear nuevo |

### 13.3 Tab — Cola en Vivo

Layout de **grid de cards**, una por mesa activa:

```
┌─────────────────────────────────────────┐
│ Mesa #1                    2 en cola    │
│ ▶ PLAYING: La Bamba — Ritchie Valens   │ ← borde neón rosa
│ ─────────────────────────────────────  │
│ 1. Ñucanchik Llakta    [▶] [🗑]       │
│ 2. Bésame Mucho        [▶] [🗑]       │
└─────────────────────────────────────────┘
```

- Botón **▶** en cada item: llama a `updateQueueItem({ status: 'PLAYING' })` → el item actual pasa a PLAYED y el nuevo empieza a reproducirse.
- Botón **🗑** en cada item: llama a `removeQueueItem(id)`.
- Las cards se actualizan en tiempo real vía WebSocket (`queue:updated`).

### 13.4 Tab — Canciones (CRUD)

- Tabla paginada con columnas: Cover, Título, Artista, Idioma, Duración, Estado, Acciones.
- **Barra de búsqueda** y **filtros** en la parte superior.
- Botón **"+ Nueva Canción"** → abre `AddSongModal`.
- Ícono editar → abre `EditSongModal` con datos pre-cargados.
- Ícono eliminar → abre `ConfirmDeleteModal`.
- El badge de idioma usa colores distintos: Español (cian), Kichwa (púrpura), Achuar (verde).

### 13.5 Tab — Mesas (CRUD)

- Tabla con columnas: Número, Estado (activo/inactivo), QR Code, Canciones en cola, Acciones.
- Botón **"+ Nueva Mesa"** → abre `AddTableModal`.
- El campo `qrCode` se muestra truncado con botón de copia al portapapeles.
- Ícono editar → abre `EditTableModal`.
- Ícono desactivar → abre `ConfirmDeleteModal` (soft delete).

### 13.6 Tab — Administradores

- Lista simple de administradores registrados (nombre, email, fecha de creación).
- Botón **"+ Crear Administrador"** → abre `CreateAdminModal`.
- **No hay edición ni eliminación** de admins en esta versión (por seguridad).

---

## 14. Componentes UI Compartidos (Design System)

Todos los componentes base en `src/components/ui/` siguen la paleta neón y se usan en ambas interfaces.

### 14.1 Button

Variantes:
- `primary`: fondo `neon-purple` con `glow-purple` en hover.
- `secondary`: borde `neon-cyan`, fondo transparente.
- `danger`: fondo `red-600` (para confirmar eliminaciones).
- `ghost`: solo texto, sin fondo ni borde.

Estados: `loading` (spinner inline), `disabled`.

### 14.2 Input

- Fondo `dark-surface`, borde `dark-border`.
- En focus: borde cambia a `neon-purple` con transición suave y `glow-purple`.
- Soporte para `label`, `error message` y `helperText`.

### 14.3 Badge

Para etiquetas de idioma y estado:
- `KICHWA`: fondo `purple-900/50`, texto `neon-purple`.
- `ACHUAR`: fondo `green-900/50`, texto `neon-green`.
- `SPANISH`: fondo `cyan-900/50`, texto `neon-cyan`.
- `PLAYING`: fondo `pink-900/50`, texto `neon-pink` + animación pulse.
- `PENDING`: fondo gris oscuro.

### 14.4 Card

Fondo `dark-surface`, borde `dark-border`, `border-radius` medio. En hover: el borde se ilumina con un color neón (según el contexto).

### 14.5 Spinner

Anillo circular con animación `spin` en color `neon-purple`. Se usa dentro del botón (estado loading) y como pantalla de carga.

---

## 15. Manejo de Errores y Feedback Visual

### 15.1 Toasts (Sonner)

Configurar el componente `<Toaster>` en el `layout.tsx` raíz con tema oscuro y posición `bottom-right`.

Estrategia de uso:
- **Éxito** (verde): canción agregada, admin creado, mesa actualizada.
- **Error** (rojo): credenciales inválidas, cola llena, QR inválido.
- **Info** (cian): "Canción en reproducción: *La Bamba*".

### 15.2 Estados de carga en componentes

- Listas de canciones: mostrar un grid de "skeleton cards" (rectángulos grises animados) mientras cargan los datos.
- Botones en formularios: mostrar spinner + deshabilitar el botón para evitar doble envío.

### 15.3 Página de error (Error Boundary)

Crear `src/app/error.tsx` para capturar errores no manejados y mostrar una pantalla amigable con opción de reintentar.

### 15.4 Estado de cola llena

Cuando `pendingCount >= 10` para la mesa del cliente:
- El botón "Pedir esta canción" en `SongDetailModal` se deshabilita.
- Aparece un mensaje: "La cola está llena. Espera a que se reproduzcan algunas canciones."

---

## 16. Optimización y Buenas Prácticas Next.js

### 16.1 Componentes Server vs Client

En Next.js App Router, **por defecto los componentes son Server Components** (sin estado, sin hooks, sin eventos del navegador). Usar `'use client'` solo donde sea necesario:

| Componente | Tipo |
|---|---|
| Páginas estáticas de contenido | Server Component |
| `SongList` con filtros interactivos | Client Component |
| `QueuePanel` con WebSocket | Client Component |
| `DashboardPage` con tabs | Client Component |
| Modales (interactivos) | Client Component |

### 16.2 Caché y optimización de imágenes

- Usar el componente `<Image>` de Next.js para las carátulas de canciones. Configura `next.config.ts` para permitir el dominio de las imágenes (o `localhost` para desarrollo).
- Las covers tienen un fallback a `placeholder-cover.png` si `coverUrl` es null.

### 16.3 Providers globales

En `src/app/layout.tsx` anidar (en orden correcto):
1. `QueryClientProvider` (React Query).
2. `Toaster` (Sonner).
3. No se necesita Provider para Zustand.

### 16.4 Separación de responsabilidades

- Los **componentes** solo renderizan y delegan eventos.
- Los **hooks** contienen la lógica de negocio del frontend.
- Los **servicios** manejan la comunicación con la API.
- Los **stores** (Zustand) guardan el estado global mínimo.

---

## 17. Orden de Ejecución para Levantar el Proyecto

Pasos en orden para configurar el frontend desde cero:

1. Desde `taki_play/`: ejecutar `npx create-next-app@latest frontend` con las opciones del paso 2.
2. `cd frontend`
3. Instalar todas las dependencias del paso 3.
4. Configurar `tailwind.config.ts` con la paleta neón (paso 4).
5. Crear `.env.local` con las URLs del backend (paso 5).
6. Crear la estructura de carpetas vacía (paso 6).
7. Implementar `src/lib/` (Axios + Socket factory).
8. Implementar `src/store/` (authStore + sessionStore).
9. Implementar `src/services/` (empezar por `api.ts` y `auth.service.ts`).
10. Implementar `src/components/ui/` (design system base).
11. Implementar `src/components/modals/ModalWrapper.tsx`.
12. Implementar el módulo de Auth: página login + store + guard del layout.
13. Implementar la vista del cliente: `useSocket`, `useQueue`, `QueuePanel`.
14. Implementar la vista del DJ: tabs, modales CRUD uno por uno.
15. Verificar que el backend esté corriendo: `npm run start:dev` en `backend/`.
16. Levantar el frontend: `npm run dev` en `frontend/`.
17. Probar flujo completo: escanear QR (simular con URL directa) → pedir canción → ver actualización en tiempo real en el panel del DJ.

---

*Documento generado para el Proyecto Taki Play — Interculturalidad. Versión 1.0*
