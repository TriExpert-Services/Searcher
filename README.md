# Buscador Local API

API escalable para búsquedas locales con arquitectura moderna y mejores prácticas.

## 🚀 Características

- **API REST moderna** con Express y TypeScript
- **Sistema de búsqueda optimizado** con índices en memoria y caché
- **Arquitectura escalable** con separación de responsabilidades
- **Seguridad robusta** con helmet, CORS y rate limiting
- **Documentación automática** con Swagger/OpenAPI
- **Logging estructurado** con Winston
- **Contenedorización** con Docker y Docker Compose
- **Validación de datos** con Zod
- **Manejo de errores** centralizado

## 📦 Instalación

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev
```

### Con Docker

```bash
# Construir y ejecutar
docker-compose up --build

# En modo detached
docker-compose up -d
```

## 🔧 Scripts disponibles

- `npm run dev` - Modo desarrollo con hot reload
- `npm run build` - Construir para producción
- `npm start` - Ejecutar versión de producción
- `npm test` - Ejecutar tests
- `npm run lint` - Linter de código

## 📚 API Endpoints

### Búsqueda
- `GET /api/search` - Buscar elementos
- `GET /api/search/suggestions` - Obtener sugerencias
- `POST /api/search/index` - Indexar nuevos datos
- `DELETE /api/search/index` - Limpiar índice

### Salud del sistema
- `GET /api/health` - Estado del servicio
- `GET /api/health/ready` - Readiness check

### Documentación
- `GET /api-docs` - Documentación Swagger UI

## 📖 Uso de la API

### Búsqueda básica
```bash
curl "http://localhost:3000/api/search?query=restaurante&limit=5"
```

### Búsqueda con filtros
```bash
curl "http://localhost:3000/api/search?query=pizza&category=comida&limit=10&offset=0"
```

### Indexar datos
```bash
curl -X POST http://localhost:3000/api/search/index \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "id": "1",
        "title": "Restaurante La Pizzería",
        "description": "Deliciosas pizzas artesanales",
        "category": "comida",
        "tags": ["pizza", "italiana", "restaurante"],
        "location": {
          "lat": -34.6118,
          "lng": -58.3960,
          "address": "Av. Corrientes 123, Buenos Aires"
        }
      }
    ]
  }'
```

### Obtener sugerencias
```bash
curl "http://localhost:3000/api/search/suggestions?query=rest"
```

## ⚡ Rendimiento y Escalabilidad

### Optimizaciones implementadas
- **Caché en memoria** con TTL configurable
- **Rate limiting** para prevenir abuso
- **Compresión gzip** para respuestas
- **Índices optimizados** para búsquedas rápidas
- **Paginación** para manejar grandes volúmenes

### Monitoreo
- Logs estructurados con Winston
- Health checks para containers
- Métricas de rendimiento integradas

## 🛡️ Seguridad

- **Helmet.js** para headers de seguridad
- **Rate limiting** por IP
- **Validación de entrada** con Zod
- **CORS** configurable
- **Error handling** sin exposición de datos sensibles

## 🔧 Configuración

Las variables de entorno se pueden configurar en `.env`:

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
CORS_ORIGINS=https://misitioweb.com
CACHE_TTL=600
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🚀 Despliegue

### Producción con Docker
```bash
# Configurar variables de entorno
export NODE_ENV=production
export PORT=3000

# Desplegar
docker-compose -f docker-compose.yml up -d
```

### Con reverse proxy (Nginx)
El archivo `nginx.conf` incluye configuración optimizada para producción.

## 📈 Próximas mejoras

- [ ] Integración con bases de datos (PostgreSQL/MongoDB)
- [ ] Búsqueda geográfica avanzada
- [ ] Sistema de autenticación/autorización
- [ ] Métricas con Prometheus
- [ ] Tests de carga automatizados
- [ ] Búsqueda fuzzy y sinónimos
- [ ] Indexación incremental
- [ ] Clustering para alta disponibilidad

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.