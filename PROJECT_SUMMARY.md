# Resumen del proyecto - Notes App

## 📝 Descripción
Aplicación full-stack de gestión de notas con React + TypeScript (frontend) y Node.js + Express + MongoDB (backend), containerizada con Docker y preparada para demostrar comunicación remota entre diferentes ubicaciones físicas.

## 🎯 Objetivo
Demostrar que contenedores Docker pueden comunicarse entre sí estando en diferentes ubicaciones físicas (máquina física y máquina virtual), simulando un escenario real de aplicación distribuida.

## 🏗️ Arquitectura

### Configuración local (misma máquina)
```
┌─────────────────────────────────────────┐
│         Máquina Física (Host)           │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Frontend  │  │ Backend  │  │MongoDB │ │
│  │Container │─▶│Container │─▶│ Local  │ │
│  │  :3000   │  │  :5000   │  │ :27017 │ │
│  └──────────┘  └──────────┘  └────────┘ │
│         │            │                  │
│         └────────────┘                  │
│        Docker Network                   │
│       (app-network)                     │
└─────────────────────────────────────────┘
```

### Configuración remota (diferentes ubicaciones)
```
┌──────────────────────────┐
│   Máquina Física (Host)  │
│                          │
│  ┌────────┐  ┌─────────┐ │
│  │Backend │  │ MongoDB │ │
│  │:5000   │  │ :27017  │ │
│  └───┬────┘  └─────────┘ │
│      │                   │
│  ┌───▼────┐              │
│  │ ngrok  │              │
│  │ Tunnel │              │
│  └───┬────┘              │
└──────┼───────────────────┘
       │
       │ Internet
       │ https://abc.ngrok.io
       │
┌──────▼───────────────────┐
│  VirtualBox VM (Ubuntu)  │
│                          │
│  ┌──────────┐            │
│  │ Frontend │            │
│  │ :3000    │            │
│  └──────────┘            │
│                          │
└──────────────────────────┘
```

## 🛠️ Tecnologías utilizadas

### Frontend
- React 18.3
- TypeScript 5.6
- Vite 6.0
- Tailwind CSS 3.4
- Axios

### Backend
- Node.js 18+
- Express.js 4.18
- MongoDB 8.0
- Mongoose 7.0
- Helmet.js (seguridad)
- CORS

### DevOps
- Docker 28.5
- Docker Compose 2.30
- ngrok (túneles remotos)

## 📁 Estructura del proyecto

```
notes-app/
├── backend_notes/           # Backend API
│   ├── src/
│   │   ├── config/         # Configuración
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Middleware
│   │   ├── models/         # Modelos de datos
│   │   └── routes/         # Rutas API
│   ├── Dockerfile
│   └── .env
│
├── frontend-notes/          # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   └── types/          # Tipos TypeScript
│   ├── Dockerfile
│   └── .env
│
├── docs/                    # Documentación
│   ├── VIRTUALBOX_DEPLOYMENT.md
│   ├── REMOTE_DEPLOYMENT.md
│   ├── QUICK_REFERENCE.md
│   └── TEST_RESULTS.md
│
├── compose.yaml             # Docker Compose principal
├── compose.isolated.yaml    # Redes aisladas
├── GETTING_STARTED.md       # Guía para principiantes
├── VERIFICATION_CHECKLIST.md # Checklist de pruebas
├── setup-docker.sh          # Script de configuración
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Inicio rápido

### 1. Configurar Docker
```bash
bash setup-docker.sh
newgrp docker
```

### 2. Iniciar MongoDB
```bash
sudo systemctl start mongod
```

### 3. Construir y Ejecutar
```bash
docker compose build
docker compose up -d
```

### 4. Verificar
```bash
curl http://localhost:5000/health
# Abrir http://localhost:3000
```

## 🌐 Configuración remota

### En Máquina física (Backend)
```bash
docker compose up -d backend
ngrok http 5000
# Copiar URL: https://abc123.ngrok.io
```

### En Máquina virtual (Frontend)
```bash
# Editar frontend-notes/.env
VITE_API_URL=https://abc123.ngrok.io/api

docker compose up -d frontend
# Abrir http://localhost:3000
```

## 📊 Características Principales

### Funcionalidad
- ✅ Crear, editar, eliminar notas
- ✅ Búsqueda en tiempo real
- ✅ Sistema de etiquetas
- ✅ Archivado de notas
- ✅ Paginación

### Seguridad
- ✅ Helmet.js para headers HTTP
- ✅ CORS configurado
- ✅ Validación de datos
- ✅ Variables de entorno protegidas

### DevOps
- ✅ Containerización completa
- ✅ Health checks
- ✅ Logging comprehensivo
- ✅ Manejo de errores robusto

## 🎓 Demostración

### Escenario: Remoto con VirtualBox
1. Backend en máquina física con ngrok
2. Frontend en VM Ubuntu
3. Demostrar comunicación via Internet
4. Mostrar aislamiento de red (ping falla)

### Puntos clave a mencionar
1. Contenedores Docker: Aislamiento y portabilidad
2. Redes Docker: Comunicación entre contenedores
3. ngrok: Túnel seguro para acceso remoto
4. Separación física: VM simula ubicación diferente
5. Aislamiento: Contenedores en redes diferentes no se comunican directamente


## 🔗 Enlaces útiles

- **Guía de inicio**: [GETTING_STARTED.md](GETTING_STARTED.md)
- **Checklist de verificación**: [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)
- **Despliegue VirtualBox**: [docs/VIRTUALBOX_DEPLOYMENT.md](docs/VIRTUALBOX_DEPLOYMENT.md)
- **Referencia rápida**: [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)

## 📝 Notas importantes

1. MongoDB local: Se usa MongoDB en el host (no containerizado) para simplificar y demostrar conexión desde contenedores
2. ngrok gratuito: Sesiones de 2 horas, URL cambia cada vez
3. Permisos Docker: Usuario debe estar en grupo docker
4. VirtualBox: Configurar red NAT con port forwarding

---

**Materia:** Sistemas de Computación II  
**Institución:** INSPT  
**Autor:** Gabriel Donato  
**Año:** 2024  
**Licencia:** MIT
