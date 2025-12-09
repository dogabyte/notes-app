# Guía de despliegue - VirtualBox con ubicaciones físicas diferentes

## 🎯 Escenario de despliegue

**Máquina física (Host):**
- Backend (Docker)
- MongoDB (Local)
- ngrok (Para exponer backend)

**Máquina virtual (VirtualBox - Ubuntu):**
- Frontend (Docker)
- Conecta al backend via ngrok

Esto simula dos ubicaciones físicas diferentes comunicándose por Internet.

---

## 📋 Preparación inicial

### Máquina física (Host)

#### 1. Verificar que todo esté instalado

```bash
# Verificar Docker
docker --version
docker compose version

# Verificar MongoDB
mongosh --eval "db.version()"

# Verificar ngrok
ngrok version
```

#### 2. Agregar usuario al grupo docker (si aún no lo hiciste)

```bash
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker ps
```

---

## 🖥️ Configuración máquina física (Backend)

### Preparación del backend

```bash
cd "/home/gabriel/INSPT/Tercer año/Sist_computacion_II/notes-app"

# Verificar configuración del backend
cat backend_notes/.env
```

Asegúrate que tenga:
```env
MONGO_URI=mongodb://localhost:27017/notes-app
PORT=5000
NODE_ENV=production
URL_Front=*
```

### Construcción e inicio del backend

```bash
# Construir solo backend
docker compose build backend

# Levantar solo backend
docker compose up -d backend

# Verificar que esté corriendo
docker compose ps
docker compose logs backend

# Health check
curl http://localhost:5000/health
```

### Exposición del backend con ngrok

```bash
# Iniciar túnel ngrok
ngrok http 5000
```

Verás algo como:
```
Forwarding    https://abc123def456.ngrok.io -> http://localhost:5000
```

**⚠️ IMPORTANTE:** Copia esta URL, la necesitarás para la VM.

**Ejemplo:** `https://abc123def456.ngrok.io`

### Verificación del backend remoto

```bash
# Desde tu máquina física, probar el endpoint público
curl https://abc123def456.ngrok.io/health

# Crear una nota de prueba
curl -X POST https://abc123def456.ngrok.io/api/notes \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "title": "Prueba desde Host",
    "content": "Backend funcionando correctamente"
  }'
```

---

## 💻 Configuración VirtualBox (Frontend)

### Configuración de red en VirtualBox

#### Opción A: NAT con Port Forwarding (Recomendado)

1. **Apagar la VM** (si está corriendo)
2. **VirtualBox → Configuración → Red**
3. **Adaptador 1:**
   - Conectado a: **NAT**
   - Avanzado → Reenvío de puertos → Agregar:
     - Nombre: `Frontend`
     - Protocolo: `TCP`
     - IP Anfitrión: `127.0.0.1`
     - Puerto Anfitrión: `3000`
     - IP Invitado: (vacío)
     - Puerto Invitado: `3000`

#### Opción B: Red Puente (Bridge)

1. **VirtualBox → Configuración → Red**
2. **Adaptador 1:**
   - Conectado a: **Adaptador puente**
   - Nombre: (tu interfaz de red física)

Esto dará a la VM una IP en tu red local.

### Inicio de la máquina virtual y preparación del entorno

```bash
# Dentro de la VM Ubuntu

# Actualizar sistema
sudo apt update

# Instalar Docker (si no está instalado)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose (si no está)
sudo apt install docker-compose-plugin

# Verificar
docker --version
docker compose version
```

### Transferencia del código del frontend a la máquina virtual

#### Opción A: Clonar desde GitHub (después de subirlo)

```bash
# En la VM
git clone https://github.com/TU_USUARIO/notes-app.git
cd notes-app
```

#### Opción B: Transferir con SCP

```bash
# Desde tu máquina física
cd "/home/gabriel/INSPT/Tercer año/Sist_computacion_II"

# Obtener IP de la VM
# En la VM ejecuta: ip addr show

# Transferir proyecto
scp -r notes-app usuario@IP_DE_LA_VM:~/

# Ejemplo:
# scp -r notes-app gabriel@192.168.1.100:~/
```

#### Opción C: Compartir Carpeta de VirtualBox

1. **VirtualBox → Configuración → Carpetas compartidas**
2. Agregar carpeta:
   - Ruta: `/home/gabriel/INSPT/Tercer año/Sist_computacion_II/notes-app`
   - Nombre: `notes-app`
   - Auto-montar: ✅
   - Hacer permanente: ✅

En la VM:
```bash
sudo mount -t vboxsf notes-app ~/notes-app
cd ~/notes-app
```

### Configuración del frontend para usar ngrok

```bash
# En la VM
cd notes-app/frontend-notes

# Editar .env
nano .env
```

Cambiar a:
```env
# URL de ngrok del backend (la que copiaste antes)
VITE_API_URL=https://abc123def456.ngrok.io/api

VITE_APP_NAME=Notes App
VITE_APP_VERSION=1.0.0
```

**⚠️ Reemplaza `abc123def456.ngrok.io` con tu URL real de ngrok**

### Construcción e inicio del frontend en la máquina virtual

```bash
# Volver al directorio raíz del proyecto
cd ~/notes-app

# Construir solo frontend
docker compose build frontend

# Levantar solo frontend
docker compose up -d frontend

# Verificar
docker compose ps
docker compose logs frontend
```

---

## 🧪 Verificación de comunicación

### Desde la máquina física (Host)

```bash
# Ver logs del backend
docker compose logs -f backend

# Deberías ver requests entrantes cuando uses el frontend
```

### Desde la VM

```bash
# Ver logs del frontend
docker compose logs -f frontend

# Verificar que el frontend esté accesible
curl -I http://localhost:3000
```

### Desde tu navegador (máquina física)

```bash
# Si usaste NAT con port forwarding
http://localhost:3000

# Si usaste Red Puente
http://IP_DE_LA_VM:3000
```

---

## 🎯 Demostración del proyecto

### 1.Arquitectura

```
┌───────────────────────────────────────────────────┐
│           Máquina Física (Host)                   │
│                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Backend  │───▶│ MongoDB  │    │  ngrok   │     │
│  │ Docker   │    │ Local    │    │  Tunnel  │     │
│  │ :5000    │    │ :27017   │    │          │     │
│  └────┬─────┘    └──────────┘    └────┬─────┘     │
│       │                               │           │
└───────┼───────────────────────────────┼───────────┘
        │                               │
        │                               │
        │                               │
        │                               │
        │                               │
┌───────┼───────────────────────────────┼───────────┐
│       │         VirtualBox VM         │           │
│       │                               │           │
│  ┌────▼─────┐                         │           │
│  │ Frontend │◀────────────────────────┘           │
│  │ Docker   │  (Conecta via ngrok)                │
│  │ :3000    │                                     │
│  └──────────┘                                     │
│                                                   │
│  Ubuntu VM - Simula ubicación remota              │
└───────────────────────────────────────────────────┘
```

### 2. Separación física

**En la máquina física:**
```bash
# Mostrar que backend está corriendo localmente
docker compose ps
docker inspect notes-app-backend-1 | grep IPAddress

# Mostrar ngrok activo
# En la terminal de ngrok verás las requests
```

**En la VM:**
```bash
# Mostrar que frontend está en otra máquina
docker compose ps
docker inspect notes-app-frontend-1 | grep IPAddress

# Mostrar que NO puede hacer ping al backend directamente
ping 192.168.X.X  # IP de tu máquina física
# Puede hacer ping a la IP, pero NO al contenedor backend

# Intentar acceder al backend local (FALLA)
curl http://localhost:5000/health
# Error: Connection refused

# Pero SÍ puede acceder via ngrok (FUNCIONA)
curl https://abc123def456.ngrok.io/health
```

### 3. Demostrar comunicación

**Abrir el frontend en el navegador:**
```
http://localhost:3000  (si usas port forwarding)
```

**Crear una nota:**
1. Completar formulario
2. Click "Create Note"

**Mostrar en la terminal del host (ngrok):**
```
HTTP Requests
-------------
POST /api/notes    200 OK
```

**Mostrar logs del backend:**
```bash
docker compose logs backend | tail -20
# Verás la request POST entrante
```

### 4. Aislamiento de red

**En la VM, intentar ping al backend:**
```bash
# Obtener IP del contenedor backend en el host
# (ejecutar en host)
docker inspect notes-app-backend-1 | grep IPAddress
# Ejemplo: 172.18.0.2

# Desde la VM, intentar ping (FALLA)
ping 172.18.0.2
# Destination Host Unreachable

# Esto demuestra que están en redes completamente separadas
```

---

## 📊 Comandos de diagnóstico

### Máquina física

```bash
# Ver IP del backend
docker inspect notes-app-backend-1 | grep IPAddress

# Ver red del backend
docker network inspect notes-app_app-network

# Ver requests en ngrok
# Abrir http://localhost:4040 en navegador
# Interfaz web de ngrok con todas las requests

# Ver logs
docker compose logs -f backend
```

### VM

```bash
# Ver IP del frontend
docker inspect notes-app-frontend-1 | grep IPAddress

# Ver configuración de red
ip addr show
ip route show

# Ver variables de entorno del frontend
docker compose exec frontend env | grep VITE

# Ver logs
docker compose logs -f frontend
```

---

## 🎓 Puntos Clave para Mencionar

1. **Separación Física Real:**
   - Backend en máquina física
   - Frontend en máquina virtual
   - Simula dos ubicaciones geográficas diferentes

2. **Comunicación via Internet:**
   - ngrok crea túnel HTTPS
   - Frontend accede al backend como si estuviera en Internet
   - No hay comunicación directa entre contenedores

3. **Aislamiento de Red:**
   - Contenedores en diferentes hosts
   - Diferentes redes Docker
   - Ping directo falla (demuestra separación)

4. **Configuración Realista:**
   - Similar a despliegue en producción
   - Frontend en servidor web
   - Backend en servidor de aplicaciones
   - Base de datos en servidor de datos

---

**Última actualización:** Diciembre 2024
