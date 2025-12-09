# Step-by-step Guide - Notes App

This guide will help you get the notes application running using Docker. It's written simply so anyone can follow it.

## 📋 What you need installed

Before starting, make sure you have installed:

1. **Docker** - To create containers
2. **MongoDB** - The database
3. **ngrok** (optional) - For remote access

## 🚀 Docker permission setup

Docker requires special permissions. Run this command once:

```bash
bash setup-docker.sh
```

After that, **close your terminal and open a new one**, or run:

```bash
newgrp docker
```

Verify it worked:

```bash
docker ps
```

If you see a table (even if it's empty), it worked!

## 🗄️ Start MongoDB

MongoDB is where notes are stored. Start it with:

```bash
sudo systemctl start mongod
```

Verify it's running:

```bash
mongosh --eval "db.version()"
```

You should see a version number (for example: 8.0.15).

## 🐳 Building the containers

Now we'll create the Docker containers. This can take a few minutes the first time.

```bash
# Go to the project folder
cd "/home/gabriel/INSPT/Tercer año/Sist_computacion_II/notes-app"

# Build the containers
docker compose build
```

You'll see many lines of output. Wait until it finishes.

## ▶️ Start the application

Once the containers are built, start the application:

```bash
docker compose up -d
```

The `-d` means they will run in the background.

## ✅ Verify it's working

### Verify the Backend

The backend handles the logic. Check it's running:

```bash
curl http://localhost:5000/health
```

You should see something like:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production"
}
```

### Verify the Frontend

The frontend is the visual interface. Open it in your browser:

```
http://localhost:3000
```

You should see the notes application.

## 📝 Test the application

1. **Create a note:**
   - Enter a title
   - Enter content
   - Click "Create Note"

2. **Edit a note:**
   - Click the pencil icon
   - Modify the text
   - Click "Update Note"

3. **Delete a note:**
   - Click the trash icon
   - Confirm deletion

## 🌐 Remote configuration (optional)

If you want someone on another computer to access it, use ngrok:

### Start ngrok

In a new terminal:

```bash
ngrok http 5000
```

You will see a URL like: `https://abc123.ngrok.io`

### Configure the Frontend

1. Copy the ngrok URL
2. Edit the file `frontend-notes/.env`
3. Change the line:
   ```
   VITE_API_URL=https://abc123.ngrok.io/api
   ```
4. Rebuild the frontend:
   ```bash
docker compose build frontend
docker compose restart frontend
```

Now the frontend will connect to the backend over the Internet.

## 🔍 Useful Commands

### See which containers are running

```bash
docker compose ps
```

### View logs (useful for finding errors)

```bash
docker compose logs -f
```

Press `Ctrl+C` to exit.

### Restart everything

```bash
docker compose restart
```

### Stop everything

```bash
docker compose down
```

### Start again

```bash
docker compose up -d
```

## 🐛 Common Troubleshooting

### "Permission denied" when using Docker

**Problem:** You don't have permissions to use Docker.

**Solution:**
```bash
bash setup-docker.sh
newgrp docker
```

### The backend won't start

**Problem:** MongoDB isn't running.

**Solution:**
```bash
sudo systemctl start mongod
mongosh --eval "db.version()"
```

### The frontend doesn't load

**Problem:** The container wasn't built correctly.

**Solution:**
```bash
docker compose down
docker compose build frontend
docker compose up -d
```

### Connection error between frontend and backend

**Problem:** URLs are not configured correctly.

**Solution:**
1. Check `backend_notes/.env` - it should have `PORT=5000`
2. Check `frontend-notes/.env` - it should have `VITE_API_URL=http://localhost:5000/api`
3. Rebuild everything:
   ```bash
docker compose down
docker compose build
docker compose up -d
```

## 📊 For the project demonstration

### Scenario 1: Everything on one machine

1. Start MongoDB: `sudo systemctl start mongod`
2. Start the containers: `docker compose up -d`
3. Open the browser at `http://localhost:3000`
4. Create, edit, and delete notes
5. Show the logs: `docker compose logs -f`

### Scenario 2: Backend and Frontend on different machines

**On your computer (Backend):**
1. Start MongoDB
2. Start only the backend: `docker compose up -d backend`
3. Start ngrok: `ngrok http 5000`
4. Copy the ngrok URL

**On the virtual machine (Frontend):**
1. Edit `frontend-notes/.env` with the ngrok URL
2. Start only the frontend: `docker compose up -d frontend`
3. Open `http://localhost:3000`

**Demonstrate:**
- The frontend on the VM communicates with the backend on your PC
- They are on different networks (cannot ping directly)
- They communicate over the Internet (ngrok)

**Project:** Notes App - Note Management  
**Course:** Systems of Computation II - INSPT  
**Author:** Gabriel Donato
