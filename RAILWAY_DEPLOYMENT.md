# Railway Backend Deployment Guide

## Prerequisites
1. GitHub account with PathForge repository
2. Railway account (sign up at railway.app)
3. Git CLI installed

## Step 1: Prepare Repository
Ensure your server directory has:
- ✅ `railway.json` configuration file
- ✅ `package.json` with `start` script
- ✅ `.env.production` template
- ✅ Updated CORS configuration for production

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your PathForge repository
5. Select the `server` directory as the root
6. Railway will automatically detect Node.js and deploy

### Option B: Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project (run from server directory)
cd server
railway init

# Deploy
railway up
```

## Step 3: Set Environment Variables
In Railway Dashboard → Your Project → Variables:

```bash
NODE_ENV=production
JWT_SECRET=your_secure_random_32_character_string
JWT_EXPIRES_IN=7d
DB_DIALECT=sqlite
DATABASE_PATH=/app/data/pathforge.db
ALLOWED_ORIGINS=https://your-pathforge-frontend.vercel.app
```

### Generate Secure JWT_SECRET:
```bash
# Use Node.js to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Configure Custom Domain (Optional)
1. In Railway Dashboard → Your Project → Settings
2. Click "Generate Domain" for a free railway.app subdomain
3. Or add your custom domain in "Custom Domain"

## Step 5: Monitor Deployment
- Check deployment logs in Railway Dashboard
- Test health endpoint: `https://your-app.railway.app/health`
- Verify API endpoints work

## Environment Variables Needed:
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | Secret key for JWT tokens | `a1b2c3d4e5f6...` (32+ chars) |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `DATABASE_PATH` | SQLite database path | `/app/data/pathforge.db` |
| `ALLOWED_ORIGINS` | Frontend URLs for CORS | `https://your-app.vercel.app` |

## Expected Railway URL Structure:
- Main API: `https://your-project-name.railway.app`
- Health Check: `https://your-project-name.railway.app/health`
- Auth Endpoints: `https://your-project-name.railway.app/api/auth/*`
- Jobs Endpoints: `https://your-project-name.railway.app/api/jobs/*`

## Troubleshooting:
- **Build fails**: Check package.json has all dependencies
- **App crashes**: Check environment variables are set
- **CORS errors**: Verify ALLOWED_ORIGINS includes your frontend URL
- **Database errors**: Railway provides persistent storage for SQLite

## Notes:
- Railway automatically provides PORT environment variable
- SQLite database persists across deployments
- Free tier includes 500 hours per month
- SSL/HTTPS is automatically provided