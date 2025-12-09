# Notes App - Aplicación de gestión de notas

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Una aplicación full-stack moderna para gestión de notas, construida con **React + TypeScript** en el frontend y **Node.js + Express + MongoDB** en el backend. Diseñada para funcionar con Docker y soportar comunicación remota entre contenedores.

> **🚀 ¿Primera vez usando este proyecto?** Lee la [Guía de Inicio Rápido](GETTING_STARTED.md) para instrucciones paso a paso simples y fáciles de seguir.

## 📋 Tabla de contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Configuración Remota](#-configuración-remota)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Licencia](#-licencia)

## ✨ Características

### Frontend
- ✅ Interfaz moderna con React 18 y TypeScript
- 🎨 Diseño responsive con Tailwind CSS
- 🔍 Búsqueda en tiempo real de notas
- 🏷️ Sistema de etiquetas para organización
- 📦 Operaciones CRUD completas
- ♿ Accesibilidad (WCAG compliant)
- 🛡️ Manejo robusto de errores

### Backend
- ✅ API RESTful con Express.js
- 📊 Base de datos MongoDB
- 🔒 Seguridad con Helmet.js y CORS
- ✅ Validación de datos con express-validator
- 📄 Paginación y búsqueda optimizada
- 🗂️ Sistema de archivado de notas
- 📈 Health check endpoint

### DevOps
- 🐳 Dockerizado (frontend + backend)
- 🌐 Soporte para comunicación remota con ngrok
- 🔄 Hot reload en desarrollo
- 📝 Logging comprehensivo

## 🏗️ Arquitectura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   Frontend      │────────▶│    Backend      │────────▶│    MongoDB      │
│   (React +      │  HTTP   │   (Express +    │  Driver │   (Local/       │
│   TypeScript)   │  :5000  │   Node.js)      │  :27017 │   Cloud)        │
│   Port: 3000    │         │   Port: 5000    │         │                 │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                            │
       │                            │
       └────────────────────────────┘
              Docker Network
           (app-network - bridge)
```

### Comunicación Remota con ngrok

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Cliente    │         │    ngrok     │         │   Backend    │
│   Remoto     │────────▶│   Tunnel     │────────▶│  Container   │
│              │  HTTPS  │              │  HTTP   │  :5000       │
└──────────────┘         └──────────────┘         └──────────────┘
                              │
                              │
                         Public URL
                    (https://xxx.ngrok.io)
```

## 🛠️ Tecnologías

### Frontend
- **React** 18.3 - Biblioteca UI
- **TypeScript** 5.6 - Tipado estático
- **Vite** 6.0 - Build tool y dev server
- **Tailwind CSS** 3.4 - Framework CSS
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

### Backend
- **Node.js** 18+ - Runtime
- **Express.js** 4.18 - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** 7.0 - ODM para MongoDB
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **express-validator** - Validación de datos

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores
- **ngrok** - Túneles seguros para desarrollo

## 📦 Requisitos previos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Docker** >= 20.10.0
- **Docker Compose** >= 2.0.0
- **MongoDB** (local o remoto)
- **ngrok** (opcional, para acceso remoto)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/notes-app.git
cd notes-app
```

### 2. Configurar variables de entorno

#### Backend
```bash
cd backend_notes
cp .env.example .env
```

Editar `backend_notes/.env`:
```env
MONGO_URI=mongodb://localhost:27017/notes-app
PORT=5000
NODE_ENV=development
URL_Front=http://localhost:3000
```

#### Frontend
```bash
cd frontend-notes
cp .env.example .env
```

Editar `frontend-notes/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Notes App
```

### 3. Instalación local (sin Docker)

#### Backend
```bash
cd backend_notes
npm install
npm run dev
```

#### Frontend
```bash
cd frontend-notes
npm install
npm run dev
```

## 🐳 Despliegue con Docker

### Construcción y ejecución

```bash
# Construir las imágenes
docker compose build

# Iniciar los contenedores
docker compose up -d

# Ver logs
docker compose logs -f

# Detener los contenedores
docker compose down
```

### Verificación

```bash
# Health check del backend
curl http://localhost:5000/health

# Acceder al frontend
open http://localhost:3000
```

### Configuración de red Docker

El proyecto usa una red bridge personalizada (`app-network`) que permite:
- Comunicación entre contenedores por nombre de servicio
- Aislamiento de la red del host
- Conexión a MongoDB local mediante `host.docker.internal`

## 🌐 Configuración remota

### Usando ngrok para acceso remoto

#### 1. Instalar ngrok
```bash
# Descargar desde https://ngrok.com/download
# O usar package manager
brew install ngrok  # macOS
snap install ngrok  # Linux
```

#### 2. Exponer el Backend
```bash
# Iniciar túnel ngrok
ngrok http 5000
```

Esto generará una URL pública como: `https://abc123.ngrok.io`

#### 3. Configurar el Frontend

Actualizar `frontend-notes/.env`:
```env
VITE_API_URL=https://abc123.ngrok.io/api
```

#### 4. Configurar CORS en Backend

El backend ya está configurado para aceptar headers de ngrok:
```javascript
// backend_notes/src/config/constants.js
ALLOWED_HEADERS: ['Content-Type', 'ngrok-skip-browser-warning', 'Authorization']
```

### Simulación de ubicaciones físicas diferentes

Para simular contenedores en diferentes ubicaciones:

**VirtualBox con máquinas separadas**
- Backend en máquina física (host)
- Frontend en máquina virtual (VirtualBox)
- Comunicación via ngrok
- Ver guía completa: [docs/VIRTUALBOX_DEPLOYMENT.md](docs/VIRTUALBOX_DEPLOYMENT.md)

**Frontend en máquina virtual**
   - Configurar VM con NAT
   - IP fija en la red de la VM
   - Configurar `.env` con URL de ngrok del backend

**Backend en máquina host**
   - Ejecutar ngrok para exponer puerto 5000
   - Configurar CORS para aceptar IP de la VM

## 💻 Uso

### Crear una nota

1. Abrir la aplicación en `http://localhost:3000`
2. Completar el formulario con título y contenido
3. (Opcional) Agregar etiquetas separadas por comas
4. Click en "Create Note"

### Editar una nota

1. Click en el ícono de edición (✏️) en la tarjeta de nota
2. Modificar el contenido en el formulario
3. Click en "Update Note"

### Eliminar una nota

1. Click en el ícono de eliminación (🗑️)
2. Confirmar la acción

### Buscar notas

1. Usar la barra de búsqueda en la parte superior
2. La búsqueda es en tiempo real sobre título y contenido

## 📁 Estructura del Proyecto

```
notes-app/
├── backend_notes/              # Backend Node.js + Express
│   ├── src/
│   │   ├── config/            # Configuración y constantes
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── middleware/        # Middleware personalizado
│   │   ├── models/            # Modelos de Mongoose
│   │   ├── routes/            # Definición de rutas
│   │   └── index.js           # Punto de entrada
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend-notes/             # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── config/            # Configuración
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Servicios API
│   │   ├── types/             # Definiciones TypeScript
│   │   ├── utils/             # Utilidades
│   │   ├── App.tsx            # Componente principal
│   │   └── main.tsx           # Punto de entrada
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── compose.yaml               # Docker Compose config
├── .gitignore
├── LICENSE
└── README.md                  # Este archivo
```

## 🔌 API endpoints

### Health check
- `GET /health` - Estado del servidor

### Notes
- `GET /api/notes` - Obtener todas las notas (con paginación)
- `GET /api/notes/:id` - Obtener nota por ID
- `POST /api/notes` - Crear nueva nota
- `PUT /api/notes/:id` - Actualizar nota
- `DELETE /api/notes/:id` - Eliminar nota
- `PATCH /api/notes/:id/archive` - Archivar/desarchivar nota
- `GET /api/notes/search?q=query` - Buscar notas

### Ejemplo de request

```bash
# Crear nota
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primera nota",
    "content": "Contenido de la nota",
    "tags": ["importante", "trabajo"]
  }'
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado para:** INSPT - Sistemas de Computación II  
**Año:** 2024  
**Autor:** Gabriel Donato
