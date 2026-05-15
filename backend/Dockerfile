# --- Etapa 1: Construcción (Builder) ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias y Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (necesarias para compilar NestJS)
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma y compilar la app
RUN npx prisma generate
RUN npm run build

# --- Etapa 2: Producción (Runner) ---
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar SOLO dependencias de producción (hace el contenedor más ligero)
RUN npm install --only=production

# Copiar Prisma y regenerar el cliente para el entorno de producción
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# Copiar la carpeta compilada desde la Etapa 1
COPY --from=builder /app/dist ./dist

# COMANDO DE DIAGNÓSTICO: Esto imprimirá la estructura exacta de dist en los logs de Render
RUN ls -R dist

EXPOSE 3000

# Arrancar la aplicación
CMD ["node", "dist/src/main.js"]