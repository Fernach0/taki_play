# Guía de Ejecución — Taki Play (Proyecto Interculturalidad)

Guía completa para levantar el proyecto desde cero en cualquier computadora.

---

## 1. Requisitos Previos

Instala el siguiente software antes de continuar:

### Node.js 20 LTS
- Descarga desde: https://nodejs.org/en/download (selecciona "LTS")
- Versión mínima recomendada: **20.x**
- Verificar instalación:
  ```bash
  node -v   # debe mostrar v20.x.x
  npm -v    # debe mostrar 10.x.x o superior
  ```

### PostgreSQL 15+
- Descarga desde: https://www.postgresql.org/download
- Durante la instalación:
  - Recuerda la **contraseña** que le asignas al usuario `postgres`
  - Puerto por defecto: **5432** (no lo cambies)
- Verificar instalación:
  ```bash
  psql --version   # debe mostrar psql (PostgreSQL) 15.x o superior
  ```

### Git (opcional, para clonar el repositorio)
- Descarga desde: https://git-scm.com/downloads

---

## 2. Obtener el Proyecto

### Opción A — Clonar con Git
```bash
git clone <url-del-repositorio>
cd taki_play
```

### Opción B — Copiar la carpeta
Copia la carpeta `taki_play/` completa a la computadora destino.

---

## 3. Crear la Base de Datos en PostgreSQL

Abre una terminal y conéctate a PostgreSQL con el usuario `postgres`:

```bash
psql -U postgres
```

Dentro de la consola de PostgreSQL, ejecuta:

```sql
CREATE DATABASE taki_karaoke;
\q
```

> **Nota:** Si tu usuario `postgres` tiene una contraseña diferente a `admin`, recuerda actualizarla en el archivo `.env` del backend (paso 4).

---

## 4. Configurar Variables de Entorno

### Backend — archivo `backend/.env`

Crea el archivo **`taki_play/backend/.env`** con el siguiente contenido:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/taki_karaoke?schema=public"
JWT_SECRET="taki_play_secret_interculturalidad_2026_jwt_key_muy_segura"
JWT_EXPIRES_IN="8h"
PORT=3000

# Correo (recuperación de contraseña) — Gmail SMTP
SMTP_USER="tu-correo@gmail.com"
SMTP_PASS="contraseña-de-aplicacion-de-16-caracteres"
SMTP_FROM="tu-correo@gmail.com"

# URL del frontend (para armar el link de "restablecer contraseña")
FRONTEND_URL="http://localhost:3001"
```

> **Importante:** Si durante la instalación de PostgreSQL usaste una contraseña diferente a `admin`, actualiza la URL así:
> ```
> DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/taki_karaoke?schema=public"
> ```

> **Sobre `SMTP_USER` / `SMTP_PASS`:** No uses la contraseña normal de tu cuenta de Gmail — Google la rechaza para apps externas. Debes generar una **contraseña de aplicación**:
> 1. Activa la verificación en 2 pasos en tu cuenta de Gmail: https://myaccount.google.com/security
> 2. Ve a https://myaccount.google.com/apppasswords, elige un nombre (ej. "Taki Play") y genera el código de 16 caracteres.
> 3. Pega ese código en `SMTP_PASS`. En producción (Render), agrega estas mismas variables (`SMTP_USER`, `SMTP_PASS`, `FRONTEND_URL`) en el panel de variables de entorno del servicio.

### Frontend — archivo `frontend/.env.local`

Crea el archivo **`taki_play/frontend/.env.local`** con el siguiente contenido:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

---

## 5. Instalar Dependencias

### Backend
```bash
cd taki_play/backend
npm install
```

### Frontend
```bash
cd taki_play/frontend
npm install
```

> Asegúrate de ejecutar `npm install` **por separado** en cada carpeta. Son dos proyectos independientes.

---

## 6. Configurar la Base de Datos con Prisma

Desde la carpeta `backend/`, ejecuta los siguientes comandos **en orden**:

### 6.1 Ejecutar migraciones (crea las tablas)
```bash
cd taki_play/backend
npx prisma migrate dev --name init
```

Este comando crea todas las tablas en la base de datos `taki_karaoke`:
- `Admin` (incluye los campos de recuperación de contraseña)
- `Table` (mesas)
- `TableSession`
- `Song`
- `QueueItem`

> Si el proyecto ya existía antes de esta guía y solo necesitas agregar los campos de recuperación de contraseña, corre:
> ```bash
> npx prisma migrate dev --name add_password_reset
> ```

### 6.2 Cargar datos iniciales (seed)
```bash
npx prisma db seed
```

Esto inserta en la base de datos:
- **1 administrador** — Email: `dj@takiplay.com` / Contraseña: `password123`
- **5 mesas** — Mesa 1 a Mesa 5, cada una con su código QR único
- **18 canciones** — 10 en español, 5 en kichwa, 3 en achuar

> **Si necesitas ver la base de datos visualmente**, puedes usar Prisma Studio:
> ```bash
> npx prisma studio
> ```
> Se abre en el navegador en `http://localhost:5555`

---

## 7. Iniciar los Servidores

Abre **dos terminales** separadas:

### Terminal 1 — Backend (NestJS)
```bash
cd taki_play/backend
npm run start:dev
```

El servidor arranca en: `http://localhost:3000`  
Verás en consola: `Application is running on: http://localhost:3000/api/v1`

### Terminal 2 — Frontend (Next.js)
```bash
cd taki_play/frontend
npm run dev
```

El servidor arranca en: `http://localhost:3001`  
(Next.js usa el puerto 3001 si el 3000 ya está ocupado por el backend)

---

## 8. Verificación

Una vez que ambos servidores estén corriendo:

| Ruta | Descripción |
|------|-------------|
| `http://localhost:3001` | Página principal (landing con instrucción QR) |
| `http://localhost:3001/dj/login` | Panel de administración DJ |
| `http://localhost:3001/dj/forgot-password` | Solicitar recuperación de contraseña |
| `http://localhost:3001/dj/reset-password?token=...` | Completar el restablecimiento (link recibido por correo) |
| `http://localhost:3000/api/v1` | API Backend (NestJS) |

### Credenciales del panel DJ
- **Email:** `dj@takiplay.com`
- **Contraseña:** `password123`

### Probar la vista de cliente (mesa)
En el panel DJ, ve a la sección **Mesas** y copia el código QR de cualquier mesa. Luego navega a:
```
http://localhost:3001/mesa/[CODIGO_QR]
```

---

## 9. Comandos de Referencia Rápida

```bash
# Levantar backend
cd backend && npm run start:dev

# Levantar frontend
cd frontend && npm run dev

# Regenerar cliente Prisma (si cambias el schema)
cd backend && npx prisma generate

# Aplicar nuevas migraciones
cd backend && npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (borra todo y vuelve a sembrar)
cd backend && npx prisma migrate reset

# Ver base de datos en el navegador
cd backend && npx prisma studio

# Build de producción del frontend
cd frontend && npm run build && npm start
```

---

## 10. Solución de Problemas Comunes

### Error: `ECONNREFUSED` al iniciar el backend
- PostgreSQL no está corriendo. Inícialo desde el Panel de Servicios (Windows) o con:
  ```bash
  # Windows (PowerShell como administrador)
  Start-Service postgresql-x64-15
  ```

### Error: `P1000 Authentication failed`
- La contraseña en `DATABASE_URL` no coincide con la de tu instalación de PostgreSQL.
- Actualiza el `.env` del backend con la contraseña correcta.

### Error: `P1003 Database does not exist`
- No se creó la base de datos. Vuelve al **paso 3** y crea `taki_karaoke` en PostgreSQL.

### Error al correr `npm install` en Windows
- Asegúrate de que Node.js esté en el PATH. Reinicia la terminal después de instalar Node.js.

### El frontend muestra errores de conexión con la API
- Verifica que el backend esté corriendo en el puerto 3000.
- Verifica que `frontend/.env.local` tenga `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`.

### Puerto 3000 ya ocupado
- Cambia el puerto del backend en `backend/.env`: `PORT=3001`
- Actualiza el frontend en `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
  NEXT_PUBLIC_WS_URL=http://localhost:3001
  ```

---

## 11. Estructura del Proyecto

```
taki_play/
├── backend/                  # API NestJS + Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos de la BD
│   │   └── seed.ts           # Datos iniciales
│   ├── src/                  # Código fuente NestJS
│   ├── .env                  # Variables de entorno (CREAR MANUALMENTE)
│   └── package.json
│
├── frontend/                 # App Next.js 16
│   ├── src/
│   │   ├── app/              # Rutas (App Router)
│   │   ├── components/       # Componentes UI
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # Llamadas a la API
│   │   ├── store/            # Estado global (Zustand)
│   │   └── types/            # Tipos TypeScript
│   ├── .env.local            # Variables de entorno (CREAR MANUALMENTE)
│   └── package.json
│
└── planes_de_accion/         # Documentación del proyecto
    ├── plan_de_accion_backend.md
    ├── plan_de_accion_frontend.md
    ├── endpoints.md
    └── guia_ejecucion_proyecto.md  ← este archivo
```

---

*Proyecto Interculturalidad — Taki Play © 2026*
