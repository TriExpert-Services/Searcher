# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar dependencias y código construido
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.yaml ./swagger.yaml

# Crear directorio de logs
RUN mkdir -p logs && chown -R nextjs:nodejs logs

USER nextjs

EXPOSE 3030

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3030/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]