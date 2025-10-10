# 🎯 PathForge - Job Application Tracker

> A modern, full-stack web application for tracking job applications with an intuitive Kanban-style interface.

![PathForge Banner](https://img.shields.io/badge/PathForge-Job%20Tracker-blue?style=for-the-badge&logo=briefcase)

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-success?style=for-the-badge)](https://your-pathforge-app.vercel.app)
[![Backend API](https://img.shields.io/badge/🚀%20API-Railway-purple?style=for-the-badge)](https://your-pathforge-api.railway.app)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Live Application](#-live-application)
- [Local Development](#-local-development)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎨 User Interface
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern UI/UX** - Clean, intuitive interface with beautiful gradients
- **Drag & Drop** - Interactive Kanban board for managing application status
- **Real-time Updates** - Instant UI updates with optimistic rendering

### 🔐 Authentication & Security
- **JWT Authentication** - Secure user registration and login
- **Protected Routes** - Route-level access control
- **Password Security** - Bcrypt hashing for user passwords
- **Token Management** - Automatic token refresh and expiration handling
- **Demo Mode** - Try the app without registration

### 📊 Job Management
- **CRUD Operations** - Create, read, update, and delete job applications
- **Status Tracking** - Track applications through: Applied → Interview → Offer → Rejected
- **Rich Data** - Store company details, salary, location, notes, and requirements
- **Drag & Drop Updates** - Move jobs between columns to update status

### 🚀 Performance & Deployment
- **Docker Support** - Containerized for consistent environments
- **Production Ready** - Deployed on Railway (backend) and Vercel (frontend)
- **SQLite Database** - Lightweight, serverless database with persistence
- **Health Monitoring** - Built-in health checks and error handling

## 🛠 Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing with protected routes
- **Axios** - HTTP client with interceptors for API calls
- **React Beautiful DnD** - Drag and drop functionality
- **CSS3** - Modern styling with flexbox and grid

### Backend
- **Node.js 18** - JavaScript runtime environment
- **Express.js** - Web framework for RESTful APIs
- **Sequelize** - ORM for database operations
- **SQLite** - Embedded SQL database
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing and security

### DevOps & Deployment
- **Docker** - Containerization for development and testing
- **Railway** - Backend hosting and deployment
- **Vercel** - Frontend hosting and deployment
- **GitHub** - Version control and CI/CD integration

## 🌐 Live Application

### Production URLs
- **🎯 Frontend Application**: [https://your-pathforge-app.vercel.app](https://your-pathforge-app.vercel.app)
- **🚀 Backend API**: [https://your-pathforge-api.railway.app](https://your-pathforge-api.railway.app)
- **💚 Health Check**: [https://your-pathforge-api.railway.app/health](https://your-pathforge-api.railway.app/health)

> **Note**: Replace the URLs above with your actual deployed application URLs after deployment.

### Demo Account
Try the application without registration:
- Click **"🚀 Try Demo Account"** on the login page
- Or create your own account with the registration form

## 🏃‍♂️ Local Development

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Docker** (optional, for containerized development)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/H3AD5H0TPlay/pathforge-app.git
cd pathforge-app
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. **Environment Setup**
```bash
# Backend environment (server/.env)
cd ../server
echo "NODE_ENV=development
JWT_SECRET=your-local-jwt-secret-key-minimum-32-characters
DATABASE_PATH=./data/pathforge.db" > .env

# Frontend environment (client/.env.development)
cd ../client
echo "VITE_API_URL=http://localhost:3000" > .env.development
```

4. **Start Development Servers**

**Method 1: Individual Commands**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

**Method 2: Docker (All-in-One)**
```bash
# From project root
docker-compose up --build
```

5. **Access the Application**
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3000 (Express API)
- **Docker**: http://localhost (nginx + backend)

### Development Scripts

#### Backend (server/)
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm test         # Run test suite
```

#### Frontend (client/)
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Docker
```bash
docker-compose up --build    # Build and start all services
docker-compose down          # Stop all services
docker-compose logs          # View logs
docker system prune -a       # Clean Docker cache
```

## 📁 Project Structure

```
pathforge-app/
├── client/                  # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth.css     # Authentication styling
│   │   │   ├── Login.jsx    # Login form component
│   │   │   ├── Register.jsx # Registration form
│   │   │   ├── Board.jsx    # Main kanban board
│   │   │   ├── Column.jsx   # Board columns
│   │   │   ├── JobCard.jsx  # Individual job cards
│   │   │   ├── AddJobForm.jsx # Job creation form
│   │   │   ├── Navigation.jsx # App header/nav
│   │   │   ├── Dashboard.jsx  # Protected dashboard
│   │   │   └── ProtectedRoute.jsx # Route guards
│   │   ├── contexts/        # React context providers
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── vercel.json          # Vercel deployment config
│   └── Dockerfile.frontend  # Frontend Docker configuration
│
├── server/                  # Node.js backend API
│   ├── config/              # Configuration files
│   │   └── database.js      # SQLite database setup
│   ├── models/              # Sequelize data models
│   │   ├── User.js          # User model and schema
│   │   └── Job.js           # Job model and schema
│   ├── routes/              # Express route handlers
│   │   ├── auth.js          # Authentication routes
│   │   └── jobs.js          # Job management routes
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT authentication middleware
│   ├── data/                # SQLite database storage
│   ├── server.js            # Main server application
│   ├── package.json         # Backend dependencies
│   ├── railway.json         # Railway deployment config
│   └── Dockerfile.backend   # Backend Docker configuration
│
├── docker-compose.yml       # Multi-container Docker setup
├── nginx.conf               # Nginx configuration for Docker
├── DEPLOYMENT_GUIDE.md      # Production deployment guide
├── RAILWAY_DEPLOYMENT.md    # Railway-specific deployment
├── VERCEL_DEPLOYMENT.md     # Vercel-specific deployment
├── test-authentication.js   # Authentication flow tests
├── test-production.js       # Production deployment tests
└── README.md               # This file
```

## � API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-pathforge-api.railway.app/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Job Management Endpoints

#### Get All Jobs (Protected)
```http
GET /api/jobs
Authorization: Bearer <jwt-token>
```

#### Create Job (Protected)
```http
POST /api/jobs
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Senior React Developer",
  "company": "Tech Corp Inc.",
  "location": "San Francisco, CA",
  "salary": "$120,000",
  "status": "applied",
  "description": "Building scalable React applications",
  "requirements": ["React", "TypeScript", "Node.js"],
  "notes": "Great company culture",
  "appliedDate": "2025-10-10"
}
```

#### Update Job Status (Protected)
```http
PATCH /api/jobs/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "interview",
  "notes": "Phone screening scheduled"
}
```

#### Delete Job (Protected)
```http
DELETE /api/jobs/:id
Authorization: Bearer <jwt-token>
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

## 🚀 Deployment

### Production Deployment

The application is designed for deployment on modern cloud platforms:

- **Backend**: [Railway](https://railway.app) - Node.js hosting with automatic deployments
- **Frontend**: [Vercel](https://vercel.com) - Static site hosting with global CDN
- **Database**: SQLite with persistent storage on Railway

### Deployment Guides

1. **[Complete Deployment Guide](DEPLOYMENT_GUIDE.md)** - Master guide with full instructions
2. **[Railway Backend Deployment](RAILWAY_DEPLOYMENT.md)** - Backend-specific deployment
3. **[Vercel Frontend Deployment](VERCEL_DEPLOYMENT.md)** - Frontend-specific deployment

### Environment Variables

#### Railway (Backend)
```bash
NODE_ENV=production
JWT_SECRET=your-secure-32-character-secret-key
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

#### Vercel (Frontend)
```bash
VITE_API_URL=https://your-railway-app.railway.app
```

## 🧪 Testing

### Automated Testing

#### Authentication Flow Test
```bash
node test-authentication.js
```
Tests user registration, login, token validation, and protected routes.

#### Production Deployment Test
```bash
# Update URLs in test-production.js first
node test-production.js
```
Comprehensive testing of live production deployment.

#### Manual Testing Checklist

- [ ] User Registration
- [ ] User Login/Logout  
- [ ] Demo Mode Access
- [ ] Protected Route Access
- [ ] Job Creation
- [ ] Job Status Updates (Drag & Drop)
- [ ] Job Editing
- [ ] Job Deletion
- [ ] Responsive Design (Mobile/Desktop)
- [ ] Cross-browser Compatibility

## 🤝 Contributing

We welcome contributions to PathForge! Here's how to get started:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards
- **JavaScript**: ES6+ syntax, async/await preferred
- **React**: Functional components with hooks
- **CSS**: BEM methodology for class naming
- **API**: RESTful design principles
- **Git**: Conventional commit messages

### Areas for Contribution
- 🎨 UI/UX improvements
- 🚀 Performance optimizations
- 📱 Mobile experience enhancements
- 🔒 Security improvements
- 📊 Analytics and reporting features
- 🌐 Internationalization (i18n)

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Vite Team** - For the lightning-fast build tool
- **Railway** - For reliable backend hosting
- **Vercel** - For excellent frontend deployment
- **Open Source Community** - For the incredible ecosystem

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/H3AD5H0TPlay/pathforge-app/issues)
- **Documentation**: Check the deployment guides for detailed instructions
- **Live Demo**: Try the application at the production URLs above

---

<div align="center">

**Built with ❤️ by the PathForge Team**

[![GitHub stars](https://img.shields.io/github/stars/H3AD5H0TPlay/pathforge-app?style=social)](https://github.com/H3AD5H0TPlay/pathforge-app/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/H3AD5H0TPlay/pathforge-app?style=social)](https://github.com/H3AD5H0TPlay/pathforge-app/network/members)

[⭐ Star this repo](https://github.com/H3AD5H0TPlay/pathforge-app) | [🐛 Report Bug](https://github.com/H3AD5H0TPlay/pathforge-app/issues) | [✨ Request Feature](https://github.com/H3AD5H0TPlay/pathforge-app/issues)

</div>