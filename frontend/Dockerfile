# Dockerfile para el Frontend React + Vite
# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN pnpm build

# Stage 2: Servir la aplicación
FROM node:20-alpine

WORKDIR /app

# Instalar serve para servir la aplicación
RUN npm install -g serve

# Copiar los archivos compilados del stage anterior
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["serve", "-s", "dist", "-l", "3000"]
