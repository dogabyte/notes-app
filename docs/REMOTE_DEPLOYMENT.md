# Guía de Despliegue Remoto con Docker y ngrok

Esta guía explica cómo configurar la aplicación Notes App para que funcione con contenedores Docker simulando diferentes ubicaciones físicas usando ngrok.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Escenario de Despliegue](#escenario-de-despliegue)
- [Configuración Paso a Paso](#configuración-paso-a-paso)
- [Verificación](#verificación)
- [Troubleshooting](#troubleshooting)

## Requisitos

- Docker y Docker Compose instalados
- MongoDB corriendo localmente (puerto 27017)
- ngrok instalado ([descargar aquí](https://ngrok.com/download))
- Cuenta de ngrok (gratuita)

## Escenario de Despliegue

### Arquitectura de Comunicación Remota

```
┌─────────────────────────────────────────────────────────────────┐
│                        Máquina Host                              │
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Backend    │         │   MongoDB    │                     │
│  │  Container   │────────▶│   Local      │                     │
│  │  :5000       │         │   :27017     │                     │
│  └──────┬───────┘         └──────────────┘                     │
│         │                                                        │
│         │                                                        │
│  ┌──────▼───────┐                                               │
│  │    ngrok     │                                               │
│  │   Tunnel     │                                               │
│  └──────┬───────┘                                               │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ HTTPS (Internet)
          │
          ▼
   https://abc123.ngrok.io
          │
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                    Máquina Virtual / Remota                     │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Frontend   │                                               │
│  │  Container   │                                               │
│  │  :3000       │                                               │
│  └──────────────┘                                               │
│                                                                  │
│  Configurado para usar:                                         │
│  VITE_API_URL=https://abc123.ngrok.io/api                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Configuración Paso a Paso

### 1. Preparar MongoDB Local

Asegúrate de que MongoDB esté corriendo en tu máquina host:

```bash
# Verificar que MongoDB está corriendo
mongosh --eval "db.version()"

# Si no está corriendo, iniciarlo
# En Linux:
sudo systemctl start mongod

# En macOS:
brew services start mongodb-community

# Verificar conexión
mongosh mongodb://localhost:27017/notes-app
```

### 2. Configurar Backend en Máquina Host

#### a. Configurar Variables de Entorno

Editar `backend_notes/.env`:

```env
# Base de datos local
MONGO_URI=mongodb://localhost:27017/notes-app

# Puerto del backend
PORT=5000

# Ambiente
NODE_ENV=production

# URL del frontend (será actualizada después de configurar ngrok)
URL_Front=http://localhost:3000
```

#### b. Iniciar Backend con Docker

```bash
cd /ruta/a/notes-app

# Construir solo el backend
docker compose build backend

# Iniciar solo el backend
docker compose up -d backend

# Verificar que esté corriendo
docker compose ps
docker compose logs backend
```

#### c. Verificar Health Check

```bash
curl http://localhost:5000/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-09T...",
  "environment": "production",
  "uptime": 123.45
}
```

### 3. Configurar ngrok para Backend

#### a. Autenticar ngrok (primera vez)

```bash
# Obtener token de https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken TU_TOKEN_AQUI
```

#### b. Crear Túnel para Backend

```bash
# Iniciar túnel ngrok
ngrok http 5000
```

Verás algo como:
```
ngrok                                                                    

Session Status                online
Account                       tu-cuenta (Plan: Free)
Version                       3.x.x
Region                        South America (sa)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**IMPORTANTE:** Copia la URL de Forwarding (ej: `https://abc123def456.ngrok.io`)

#### c. Actualizar CORS en Backend

El backend ya está configurado para aceptar headers de ngrok. Verifica en `backend_notes/src/config/constants.js`:

```javascript
ALLOWED_HEADERS: ['Content-Type', 'ngrok-skip-browser-warning', 'Authorization']
```

#### d. Actualizar URL_Front (Opcional)

Si quieres que el backend sepa de dónde vienen las requests, actualiza `.env`:

```env
URL_Front=https://tu-frontend-url.com
```

Reinicia el backend:
```bash
docker compose restart backend
```

### 4. Configurar Frontend en Máquina Remota/VM

#### a. Configurar Variables de Entorno

En la máquina remota, editar `frontend-notes/.env`:

```env
# URL de ngrok del backend
VITE_API_URL=https://abc123def456.ngrok.io/api

# Configuración de la app
VITE_APP_NAME=Notes App
VITE_APP_VERSION=1.0.0
```

#### b. Iniciar Frontend con Docker

```bash
cd /ruta/a/notes-app

# Construir frontend
docker compose build frontend

# Iniciar frontend
docker compose up -d frontend

# Verificar logs
docker compose logs -f frontend
```

#### c. Acceder al Frontend

Abre un navegador en:
```
http://localhost:3000
```

O desde otra máquina en la red:
```
http://IP_DE_LA_VM:3000
```

### 5. Configuración de Red para VM

Si estás usando una máquina virtual:

#### VirtualBox

1. **Configurar Adaptador de Red:**
   - Apagar la VM
   - Configuración → Red → Adaptador 1
   - Conectado a: NAT
   - Avanzado → Reenvío de puertos
   - Agregar regla:
     - Nombre: Frontend
     - Protocolo: TCP
     - IP Anfitrión: (vacío)
     - Puerto Anfitrión: 3000
     - IP Invitado: (vacío)
     - Puerto Invitado: 3000

2. **IP Fija en la VM (Opcional):**

```bash
# En Ubuntu/Debian
sudo nano /etc/netplan/01-netcfg.yaml
```

Configurar:
```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: no
      addresses: [10.0.2.15/24]
      gateway4: 10.0.2.2
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Aplicar:
```bash
sudo netplan apply
```

## Verificación

### 1. Verificar Conectividad Backend

Desde la máquina remota:

```bash
# Health check
curl https://abc123def456.ngrok.io/health

# Crear una nota de prueba
curl -X POST https://abc123def456.ngrok.io/api/notes \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "title": "Nota de Prueba Remota",
    "content": "Probando conexión remota con ngrok"
  }'
```

### 2. Verificar Frontend

1. Abrir navegador en `http://localhost:3000` (o IP de VM)
2. Abrir DevTools (F12) → Network
3. Crear una nota
4. Verificar que las requests vayan a `https://abc123def456.ngrok.io/api/notes`
5. Verificar que no haya errores de CORS

### 3. Verificar Logs

```bash
# Logs del backend
docker compose logs -f backend

# Logs del frontend
docker compose logs -f frontend

# Logs de ngrok (en la terminal donde corre ngrok)
# O visitar: http://localhost:4040
```

## Troubleshooting

### Error: "Network Error" en Frontend

**Causa:** Frontend no puede alcanzar el backend a través de ngrok.

**Solución:**
1. Verificar que ngrok esté corriendo
2. Verificar que la URL en `.env` sea correcta
3. Reconstruir frontend: `docker compose build frontend`
4. Reiniciar frontend: `docker compose restart frontend`

### Error: CORS

**Causa:** Backend rechaza requests del frontend.

**Solución:**
1. Verificar headers en `backend_notes/src/config/constants.js`
2. Asegurarse de que incluya `'ngrok-skip-browser-warning'`
3. Reiniciar backend: `docker compose restart backend`

### Error: "Cannot connect to MongoDB"

**Causa:** Backend no puede conectarse a MongoDB local.

**Solución:**
1. Verificar que MongoDB esté corriendo: `mongosh`
2. Verificar MONGO_URI en `.env`: `mongodb://host.docker.internal:27017/notes-app`
3. En Linux, puede necesitar: `mongodb://172.17.0.1:27017/notes-app`
4. Verificar logs: `docker compose logs backend`

### ngrok: "Session Expired"

**Causa:** Sesión gratuita de ngrok expiró (2 horas).

**Solución:**
1. Reiniciar ngrok: `Ctrl+C` y luego `ngrok http 5000`
2. Copiar nueva URL
3. Actualizar `frontend-notes/.env`
4. Reconstruir frontend: `docker compose build frontend && docker compose up -d frontend`

### Frontend no carga

**Causa:** Puerto 3000 ocupado o container no inició.

**Solución:**
```bash
# Verificar estado
docker compose ps

# Ver logs
docker compose logs frontend

# Reiniciar
docker compose restart frontend

# Si falla, reconstruir
docker compose down
docker compose build frontend
docker compose up -d frontend
```

### No puedo acceder desde otra máquina

**Causa:** Firewall o configuración de red.

**Solución:**
```bash
# Verificar que el container escuche en 0.0.0.0
docker compose exec frontend netstat -tlnp

# Verificar firewall (Linux)
sudo ufw status
sudo ufw allow 3000/tcp

# Verificar IP de la máquina
ip addr show
```

## Comandos Útiles

```bash
# Ver todos los containers
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Reiniciar un servicio
docker compose restart backend

# Reconstruir y reiniciar
docker compose up -d --build

# Detener todo
docker compose down

# Limpiar todo (¡cuidado!)
docker compose down -v
docker system prune -a

# Inspeccionar red
docker network inspect notes-app_app-network

# Ejecutar comando en container
docker compose exec backend sh
docker compose exec frontend sh

# Ver uso de recursos
docker stats
```

## Notas Adicionales

### Seguridad

- ngrok en plan gratuito expone tu backend públicamente
- No usar en producción sin autenticación
- Considerar usar ngrok con autenticación básica
- Nunca commitear archivos `.env` a Git

### Rendimiento

- ngrok puede agregar latencia (50-200ms)
- Para mejor rendimiento, usar plan pago de ngrok
- Considerar usar región más cercana en ngrok

### Alternativas a ngrok

- **localtunnel:** `npm install -g localtunnel && lt --port 5000`
- **serveo:** `ssh -R 80:localhost:5000 serveo.net`
- **Cloudflare Tunnel:** Más robusto para producción

---

**Autor:** Gabriel Donato - INSPT
