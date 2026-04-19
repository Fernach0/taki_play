
# Guía Detallada de Despliegue: Frontend y Backend

## Fase 1: Preparar el proyecto

1. Verifica que el frontend y backend funcionen correctamente en local.
2. Sube ambos proyectos a repositorios en GitHub (pueden ser repos separados o carpetas separadas en un mismo repo).

---


## Fase 2: Desplegar la base de datos en Supabase (gratis)

### 1. Crear la base de datos en Supabase

1. Ingresa a https://supabase.com y crea una cuenta gratuita.
2. Haz clic en "New project".
3. Elige un nombre para el proyecto y una contraseña segura para la base de datos.
4. Selecciona la región más cercana a ti.
5. Espera a que se cree el proyecto (toma unos minutos).
6. Ve a la sección "Project Settings" > "Database" y copia la cadena de conexión (Connection string) tipo `postgresql://...`.

### 2. Configuración de variables de entorno

#### Backend (NestJS)

1. Crea un archivo `.env` en la carpeta `backend/` (no lo subas a GitHub, agrégalo a `.gitignore`). Ejemplo de contenido:

```
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_db   # (usa la cadena de Supabase)
JWT_SECRET=tu_clave_secreta_jwt
PORT=3001 # (puedes cambiar el puerto si lo necesitas)
```

- `DATABASE_URL`: Usa la cadena de conexión de Supabase.
- `JWT_SECRET`: Clave secreta para firmar los tokens JWT (elige una cadena segura y larga).
- `PORT`: Puerto donde correrá el backend (opcional, por defecto 3000).

2. Asegúrate de que el archivo `prisma/schema.prisma` tenga la línea:
	`url      = env("DATABASE_URL")`


#### Frontend (Next.js)

1. Crea un archivo `.env.local` en la carpeta `frontend/` (no lo subas a GitHub, agrégalo a `.gitignore`). Ejemplo de contenido:

```
NEXT_PUBLIC_API_URL=https://tu-backend-deploy.com/api/v1
```

- `NEXT_PUBLIC_API_URL`: Debe apuntar a la URL pública de tu backend desplegado, terminando en `/api/v1`.

2. En el archivo `frontend/src/lib/api.ts` se usa esta variable para todas las peticiones:
	```js
	baseURL: process.env.NEXT_PUBLIC_API_URL
	```

---


## Fase 3: Migrar el esquema a Supabase

1. En tu máquina local, asegúrate de tener el CLI de Prisma instalado.
2. En la carpeta `backend/`, ejecuta:
	```bash
	npx prisma migrate deploy
	```
	Esto aplicará las migraciones y creará las tablas en tu base de datos Supabase.
3. Si necesitas poblar datos iniciales, ejecuta el script de seed si lo tienes:
	```bash
	npx prisma db seed
	```

---

## Fase 4: Desplegar el Frontend en Vercel

1. Ingresa a https://vercel.com y crea una cuenta (puedes usar GitHub).
2. Importa el repositorio del frontend desde GitHub.
3. Vercel detectará automáticamente que es un proyecto Next.js.
4. En la sección "Environment Variables" de Vercel, agrega la variable `NEXT_PUBLIC_API_URL` con la URL de tu backend.
5. Haz clic en "Deploy" y espera a que termine el despliegue.
6. Obtén la URL pública (ejemplo: https://tu-proyecto.vercel.app).

---

## Fase 5: Desplegar el Backend (NestJS)

1. Elige una plataforma para desplegar el backend (ejemplo: Render, Railway, Fly.io, Heroku).
2. Crea una cuenta en la plataforma elegida.
3. Importa el repositorio del backend desde GitHub.
4. En la configuración del servicio, agrega las variables de entorno:
	- `DATABASE_URL`
	- `JWT_SECRET`
	- `PORT` (opcional)
5. Si usas base de datos, asegúrate de que sea accesible desde el backend desplegado.
6. Despliega el backend y obtén la URL pública de la API (ejemplo: https://tu-backend-deploy.com/api/v1).

---

## Fase 6: Conectar Frontend y Backend

1. En Vercel, actualiza la variable de entorno `NEXT_PUBLIC_API_URL` del frontend para que apunte a la URL pública del backend.
2. Vuelve a desplegar el frontend si hiciste cambios en las variables de entorno.
3. Verifica que el frontend pueda comunicarse correctamente con el backend desplegado.

---

## Fase 7: Pruebas y acceso externo

1. Comparte la URL pública del frontend (Vercel) con tu compañero o usuarios.
2. Verifica que puedan acceder y usar la aplicación desde cualquier lugar.
3. Si usas códigos QR, asegúrate de que apunten a la URL pública y no a localhost.

---

## Notas adicionales

- Si necesitas migrar la base de datos, ejecuta las migraciones en el entorno de producción:
  - Entra a la plataforma donde desplegaste el backend y ejecuta: `npx prisma migrate deploy`
- Mantén seguras tus variables de entorno y nunca subas archivos sensibles al repositorio.
- Puedes monitorear logs y errores desde los paneles de Vercel y la plataforma de backend.
- Si cambias la URL del backend, actualiza los QR generados para que apunten a la URL correcta.

---

¿Dudas? Consulta la documentación oficial de Vercel, Render, Railway, etc., o pide ayuda a tu equipo.
