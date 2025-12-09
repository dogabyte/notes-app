# Guía Rápida - Comandos para el Examen

## 🚀 Inicio Rápido

### 1. Iniciar MongoDB Local
```bash
# Verificar que MongoDB esté corriendo
mongosh --eval "db.version()"

# Si no está corriendo:
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### 2. Iniciar Aplicación con Docker
```bash
cd /home/gabriel/INSPT/Tercer\ año/Sist_computacion_II/notes-app

# Construir imágenes (primera vez o después de cambios)
docker compose build

# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f
```

### 3. Verificar que Todo Funcione
```bash
# Health check backend
curl http://localhost:5000/health

# Abrir frontend
open http://localhost:3000  # macOS
xdg-open http://localhost:3000  # Linux
```

## 🌐 Configuración Remota con ngrok

### 1. Iniciar ngrok
```bash
# En una terminal separada
ngrok http 5000

# Copiar la URL generada (ej: https://abc123.ngrok.io)
```

### 2. Actualizar Frontend
```bash
# Editar frontend-notes/.env
# Cambiar VITE_API_URL=https://abc123.ngrok.io/api

# Reconstruir frontend
docker compose build frontend
docker compose restart frontend
```

### 3. Probar desde Otra Máquina
```bash
# Verificar backend remoto
curl https://abc123.ngrok.io/health

# Acceder al frontend
# http://IP_DE_TU_MAQUINA:3000
```

## 🔍 Comandos de Verificación

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs específicos
docker compose logs backend
docker compose logs frontend

# Ver logs en tiempo real
docker compose logs -f

# Reiniciar un servicio
docker compose restart backend

# Detener todo
docker compose down

# Limpiar y reiniciar
docker compose down
docker compose build
docker compose up -d
```

## 🧪 Pruebas de Funcionalidad

### Crear Nota via API
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nota de Prueba",
    "content": "Probando la API",
    "tags": ["test", "examen"]
  }'
```

### Listar Notas
```bash
curl http://localhost:5000/api/notes
```

### Buscar Notas
```bash
curl "http://localhost:5000/api/notes/search?q=prueba"
```

## 🐛 Troubleshooting Rápido

### Backend no inicia
```bash
# Ver logs
docker compose logs backend

# Verificar MongoDB
mongosh

# Reiniciar
docker compose restart backend
```

### Frontend no carga
```bash
# Ver logs
docker compose logs frontend

# Reconstruir
docker compose build frontend
docker compose up -d frontend
```

### Error de CORS
```bash
# Verificar configuración en backend_notes/src/config/constants.js
# Debe incluir: 'ngrok-skip-browser-warning'

# Reiniciar backend
docker compose restart backend
```

## 📊 Demostración para el Examen

### Escenario 1: Local
1. Iniciar MongoDB
2. `docker compose up -d`
3. Abrir http://localhost:3000
4. Crear, editar, eliminar notas
5. Mostrar logs: `docker compose logs -f`

### Escenario 2: Remoto con ngrok
1. Iniciar ngrok: `ngrok http 5000`
2. Copiar URL de ngrok
3. Actualizar frontend-notes/.env
4. Reconstruir frontend
5. Acceder desde otra máquina
6. Demostrar comunicación remota

### Escenario 3: Inspección de Red Docker
```bash
# Ver red Docker
docker network inspect notes-app_app-network

# Ver configuración
docker compose config

# Ejecutar comando en container
docker compose exec backend sh
docker compose exec frontend sh
```

## 📝 Checklist Pre-Examen

- [ ] Docker corriendo
- [ ] MongoDB local corriendo
- [ ] `docker compose build` sin errores
- [ ] `docker compose up -d` exitoso
- [ ] Backend responde en :5000/health
- [ ] Frontend carga en :3000
- [ ] Crear/editar/eliminar notas funciona
- [ ] ngrok instalado
- [ ] Documentación revisada

## 🎯 Puntos Clave a Mencionar

1. **Arquitectura:**
   - Frontend (React + TypeScript) en contenedor
   - Backend (Node.js + Express) en contenedor
   - MongoDB en host (no containerizado por elección)
   - Red Docker bridge para comunicación

2. **Comunicación Remota:**
   - ngrok expone backend públicamente
   - CORS configurado para aceptar requests remotas
   - Frontend puede estar en ubicación física diferente

3. **Buenas Prácticas:**
   - Variables de entorno externalizadas
   - .gitignore para proteger credenciales
   - Documentación completa
   - Health checks implementados
   - Manejo de errores robusto

---

**Última actualización:** Diciembre 2024
