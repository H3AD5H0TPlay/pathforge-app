# 🎯 PathForge - Job Application Tracker

A modern, full-stack job application tracking system built with React, Node.js, and SQLite.

## 🚀 Quick Start Commands

### **Method 1: Individual Commands (Current)**

#### Start Backend:
```bash
cd server
node server.js
```

#### Start Frontend:
```bash
cd client  
npm run dev
```

### **Method 2: Combined Scripts (Easier)**

```bash
# Install all dependencies first
npm run install:all

# Start both frontend and backend together
npm run dev
```

### **Method 3: Docker (Professional)**

```bash
# Build and start with Docker
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

## 🐳 Docker Setup (Recommended for Production)

### **Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### **Commands:**
```bash
# Build containers (force rebuild)
docker-compose build --no-cache

# Start application (runs on http://localhost)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart services
docker-compose restart

# Troubleshooting
docker-compose build --progress=plain  # See detailed build logs
docker-compose up --build              # Rebuild and start
```

### **Troubleshooting Docker:**
If you encounter React/dependency issues:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache --pull
```

## 📋 Features

✅ **SQLite Database** - No external database required  
✅ **JWT Authentication** - Secure user authentication  
✅ **Demo Mode** - Try without authentication  
✅ **Drag & Drop** - Kanban-style job tracking  
✅ **Responsive Design** - Works on all devices  
✅ **Docker Ready** - Professional deployment  

## 🛠 Development

### **Local Development:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Database: SQLite file (`server/pathforge.db`)

### **Docker Production:**
- Application: http://localhost
- All services containerized
- Auto-restart on failure
- Health checks included

## 🔧 Project Structure

```
pathforge-app/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── data/                   # SQLite database (Docker)
├── docker-compose.yml      # Docker orchestration
├── Dockerfile.backend      # Backend container
├── Dockerfile.frontend     # Frontend container
└── nginx.conf             # Web server config
```

## 🎮 Usage

1. **Register/Login** or use **Demo Mode**
2. **Add Jobs** using the + button
3. **Drag Jobs** between columns (Applied → Interview → Offer → Rejected)
4. **Track Progress** with notes and status updates

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Security headers via Nginx
- Input validation

## 📦 Database

- **Type**: SQLite (file-based)
- **Location**: `server/pathforge.db` (local) or `data/` (Docker)
- **Schema**: Users, Jobs with relationships
- **Migrations**: Auto-sync on startup

---

**Made with ❤️ for job seekers everywhere!**