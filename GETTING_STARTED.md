# Guía paso a paso - Notes App

Esta guía te ayudará a poner en marcha la aplicación de notas usando Docker. Está escrita de forma simple para que cualquiera pueda seguirla.

## 📋 ¿Qué necesitas tener instalado?

Antes de empezar, verifica que tengas instalado:

1. **Docker** - Para crear los contenedores
2. **MongoDB** - La base de datos
3. **ngrok** (opcional) - Para acceso remoto

## 🚀 Configuración de permisos de Docker

Docker necesita permisos especiales. Ejecuta este comando una sola vez:

```bash
bash setup-docker.sh
```

Después, **cierra tu terminal y abre una nueva**, o ejecuta:

```bash
newgrp docker
```

Verifica que funcionó:

```bash
docker ps
```

Si ves una tabla (aunque esté vacía), ¡funciona!

## 🗄️Iniciar MongoDB

MongoDB es donde se guardan las notas. Inícialo con:

```bash
sudo systemctl start mongod
```

Verifica que esté corriendo:

```bash
mongosh --eval "db.version()"
```

Deberías ver un número de versión (por ejemplo: 8.0.15).

## 🐳 Construcción de los contenedores

Ahora vamos a crear los contenedores de Docker. Esto puede tardar unos minutos la primera vez.

```bash
# Ve a la carpeta del proyecto
cd "/home/gabriel/INSPT/Tercer año/Sist_computacion_II/notes-app"

# Construye los contenedores
docker compose build
```

Verás muchas líneas de texto. Espera hasta que termine.

## ▶️ Iniciar la aplicación

Una vez construidos los contenedores, inicia la aplicación:

```bash
docker compose up -d
```

El `-d` significa que se ejecutarán en segundo plano.

## ✅ Verificación del funcionamiento

### Verificar el Backend

El backend es la parte que maneja la lógica. Verifica que esté funcionando:

```bash
curl http://localhost:5000/health
```

Deberías ver algo como:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production"
}
```

### Verificar el Frontend

El frontend es la interfaz visual. Ábrela en tu navegador:

```
http://localhost:3000
```

Deberías ver la aplicación de notas.

## 📝 Prueba de la aplicación

1. **Crear una nota:**
   - Escribe un título
   - Escribe contenido
   - Click en "Create Note"

2. **Editar una nota:**
   - Click en el ícono de lápiz
   - Modifica el texto
   - Click en "Update Note"

3. **Eliminar una nota:**
   - Click en el ícono de basura
   - Confirma la eliminación

## 🌐 Configuración remota (opcional)

Si quieres que alguien en otra computadora pueda acceder, usa ngrok:

### Iniciar ngrok

En una terminal nueva:

```bash
ngrok http 5000
```

Verás una URL como: `https://abc123.ngrok.io`

### Configurar el Frontend

1. Copia la URL de ngrok
2. Edita el archivo `frontend-notes/.env`
3. Cambia la línea:
   ```
   VITE_API_URL=https://abc123.ngrok.io/api
   ```
4. Reconstruye el frontend:
   ```bash
   docker compose build frontend
   docker compose restart frontend
   ```

Ahora el frontend se conectará al backend a través de Internet.

## 🔍 Comandos Útiles

### Ver qué contenedores están corriendo

```bash
docker compose ps
```

### Ver los mensajes de log (útil para encontrar errores)

```bash
docker compose logs -f
```

Presiona `Ctrl+C` para salir.

### Reiniciar todo

```bash
docker compose restart
```

### Detener todo

```bash
docker compose down
```

### Iniciar de nuevo

```bash
docker compose up -d
```

## 🐛 Solución de Problemas Comunes

### "Permission denied" al usar Docker

**Problema:** No tienes permisos para usar Docker.

**Solución:**
```bash
bash setup-docker.sh
newgrp docker
```

### El backend no inicia

**Problema:** MongoDB no está corriendo.

**Solución:**
```bash
sudo systemctl start mongod
mongosh --eval "db.version()"
```

### El frontend no carga

**Problema:** El contenedor no se construyó bien.

**Solución:**
```bash
docker compose down
docker compose build frontend
docker compose up -d
```

### Error de conexión entre frontend y backend

**Problema:** Las URLs no están configuradas correctamente.

**Solución:**
1. Verifica `backend_notes/.env` - debe tener `PORT=5000`
2. Verifica `frontend-notes/.env` - debe tener `VITE_API_URL=http://localhost:5000/api`
3. Reconstruye todo:
   ```bash
   docker compose down
   docker compose build
   docker compose up -d
   ```

## 📊 Para la demostración del proyecto

### Escenario 1: Todo en una máquina

1. Inicia MongoDB: `sudo systemctl start mongod`
2. Inicia los contenedores: `docker compose up -d`
3. Abre el navegador en `http://localhost:3000`
4. Crea, edita y elimina notas
5. Muestra los logs: `docker compose logs -f`

### Escenario 2: Backend y Frontend en máquinas diferentes

**En tu computadora (Backend):**
1. Inicia MongoDB
2. Inicia solo el backend: `docker compose up -d backend`
3. Inicia ngrok: `ngrok http 5000`
4. Copia la URL de ngrok

**En la máquina virtual (Frontend):**
1. Edita `frontend-notes/.env` con la URL de ngrok
2. Inicia solo el frontend: `docker compose up -d frontend`
3. Abre `http://localhost:3000`

**Demostrar:**
- El frontend en la VM se comunica con el backend en tu PC
- Están en redes diferentes (no pueden hacer ping directo)
- Se comunican a través de Internet (ngrok)

**Proyecto:** Notes App - Gestión de Notas  
**Materia:** Sistemas de Computación II - INSPT  
**Autor:** Gabriel Donato
