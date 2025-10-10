# 🚀 PathForge Production Deployment Guide

## Overview
Deploy PathForge job application tracker to production using:
- **Backend**: Railway (Node.js + SQLite)
- **Frontend**: Vercel (React + Vite)

## 📋 Pre-Deployment Checklist

### Backend Preparation ✅
- [x] `railway.json` configuration created
- [x] Production environment variables template ready
- [x] CORS configuration updated for production origins
- [x] Health check endpoint available (`/health`)
- [x] SQLite database configured for persistent storage

### Frontend Preparation ✅
- [x] `vercel.json` configuration created
- [x] Environment variable support added to AuthContext
- [x] Development and production env files created
- [x] SPA routing configured for Vercel

## 🚂 Backend Deployment (Railway)

### 1. Deploy to Railway
```bash
# Option 1: Via Dashboard
1. Go to https://railway.app
2. "Start a New Project" → "Deploy from GitHub repo"
3. Select PathForge repository
4. Set root directory to "server"
5. Railway auto-detects Node.js and deploys

# Option 2: Via CLI
npm install -g @railway/cli
railway login
cd server
railway init
railway up
```

### 2. Set Environment Variables in Railway Dashboard
```bash
NODE_ENV=production
JWT_SECRET=<generate-32-char-random-string>
JWT_EXPIRES_IN=7d
DATABASE_PATH=/app/data/pathforge.db
ALLOWED_ORIGINS=https://your-pathforge-app.vercel.app
```

### 3. Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Get Railway URL
- Note your Railway URL (e.g., `https://pathforge-backend-production.railway.app`)
- Test health endpoint: `https://your-app.railway.app/health`

## 🌐 Frontend Deployment (Vercel)

### 1. Deploy to Vercel
```bash
# Option 1: Via Dashboard
1. Go to https://vercel.com
2. "New Project" → Import from GitHub
3. Select PathForge repository
4. Set root directory to "client"
5. Framework: Vite, Build: npm run build, Output: dist

# Option 2: Via CLI
npm install -g vercel
cd client
vercel
# Follow prompts, select client directory
```

### 2. Set Environment Variables in Vercel Dashboard
```bash
VITE_API_URL=https://your-railway-backend.railway.app
```

### 3. Update Railway CORS
After getting Vercel URL, update Railway environment:
```bash
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

## 🔗 Complete Configuration Example

### Railway Environment Variables
```bash
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
JWT_EXPIRES_IN=7d
DATABASE_PATH=/app/data/pathforge.db
ALLOWED_ORIGINS=https://pathforge-tracker.vercel.app
```

### Vercel Environment Variables
```bash
VITE_API_URL=https://pathforge-api.railway.app
```

## 🧪 Testing Production Deployment

### 1. Backend Health Check
```bash
curl https://your-railway-app.railway.app/health
# Should return: {"status":"OK","uptime":...}
```

### 2. Frontend Accessibility
- Visit: `https://your-vercel-app.vercel.app`
- Should redirect to login page (no authentication)

### 3. Authentication Flow
1. Register new account at `/register`
2. Login with credentials at `/login`
3. Verify dashboard loads at `/`
4. Test job CRUD operations
5. Test logout functionality

### 4. API Integration Test
```javascript
// Test registration
fetch('https://your-railway-app.railway.app/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com', 
    password: 'password123'
  })
});

// Test login
fetch('https://your-railway-app.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});
```

## 📱 Production URLs

### Expected URL Structure:
- **Frontend**: `https://pathforge-tracker.vercel.app`
  - Login: `/login`
  - Register: `/register`  
  - Dashboard: `/` (protected)
  
- **Backend**: `https://pathforge-api.railway.app`
  - Health: `/health`
  - Auth: `/api/auth/*`
  - Jobs: `/api/jobs/*`

## 🛠 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check ALLOWED_ORIGINS in Railway matches Vercel URL
2. **Build Fails**: Verify package.json dependencies and scripts
3. **API Not Found**: Check VITE_API_URL in Vercel environment
4. **Database Issues**: Railway provides persistent storage automatically
5. **Authentication Issues**: Verify JWT_SECRET is set in Railway

### Debug Steps:
1. Check deployment logs in Railway/Vercel dashboards
2. Verify environment variables are set correctly
3. Test API endpoints directly with curl/Postman
4. Check browser network tab for failed requests
5. Verify HTTPS is working (required for production)

## 📊 Production Monitoring

### Railway Metrics:
- CPU usage, memory consumption
- Request count and response times
- Database connections
- Error rates

### Vercel Analytics:
- Page views and user sessions
- Core web vitals
- Geographic distribution
- Build and deployment success rates

## 🔒 Security Considerations

### Production Ready:
- ✅ HTTPS enabled on both platforms
- ✅ JWT tokens with secure secrets
- ✅ CORS properly configured
- ✅ Environment variables secured
- ✅ Database persistence configured
- ✅ Error handling for production

## 🎯 Success Criteria
- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes properly guarded
- [ ] Job CRUD operations functional
- [ ] Cross-platform compatibility
- [ ] Mobile responsive design
- [ ] SSL certificates active

**🎉 Deployment Complete!** 
Your PathForge application is now live and ready for users!