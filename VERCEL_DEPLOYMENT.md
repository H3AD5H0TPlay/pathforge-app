# Vercel Frontend Deployment Guide

## Prerequisites
1. GitHub account with PathForge repository
2. Vercel account (sign up at vercel.com)
3. Backend deployed on Railway (get the Railway URL first)

## Step 1: Prepare Repository
Ensure your client directory has:
- ✅ `vercel.json` configuration file
- ✅ `.env.development` and `.env.production` files
- ✅ Updated AuthContext with environment variable support
- ✅ `package.json` with build script

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select the `client` directory as the root
5. Framework Preset: Vite
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Install Command: `npm install`

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from client directory)
cd client
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? pathforge-frontend
# - In which directory is your code located? ./
```

## Step 3: Set Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
VITE_API_URL=https://your-railway-backend.railway.app
```

**Important**: Replace `your-railway-backend.railway.app` with your actual Railway backend URL.

## Step 4: Update Railway CORS
After getting your Vercel URL, update Railway backend environment variables:

```bash
ALLOWED_ORIGINS=https://your-pathforge-frontend.vercel.app
```

## Step 5: Configure Custom Domain (Optional)
1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel

## Environment Variables Needed:
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://pathforge-api.railway.app` |

## Expected Vercel URL Structure:
- Main App: `https://your-project.vercel.app`
- Login: `https://your-project.vercel.app/login`
- Register: `https://your-project.vercel.app/register`
- Dashboard: `https://your-project.vercel.app/` (protected)

## Build Configuration:
The `vercel.json` file configures:
- Static build with Vite
- SPA routing (all routes serve `index.html`)
- Environment variable injection
- Proper dist directory output

## Deployment Process:
1. **Build**: Vercel runs `npm run build`
2. **Static Assets**: Serves files from `dist/` directory
3. **Routing**: All routes redirect to `index.html` for React Router
4. **Environment**: Injects `VITE_API_URL` at build time

## Troubleshooting:
- **Build fails**: Check package.json dependencies and scripts
- **Routing issues**: Verify vercel.json routes configuration
- **API connection fails**: Check VITE_API_URL environment variable
- **CORS errors**: Ensure Railway backend has correct ALLOWED_ORIGINS
- **Authentication issues**: Verify JWT token handling with HTTPS

## Important Notes:
- Environment variables must start with `VITE_` to be available in frontend
- Changes to environment variables require redeployment
- Vercel automatically provides SSL/HTTPS
- Free tier includes generous bandwidth and build limits
- Automatic deployments on git push (can be configured)

## Testing Checklist:
- [ ] Frontend loads at Vercel URL
- [ ] Login page accessible
- [ ] Registration works
- [ ] Authentication redirects properly
- [ ] Job board loads for authenticated users
- [ ] All CRUD operations work
- [ ] Logout functionality works
- [ ] Protected routes properly guarded