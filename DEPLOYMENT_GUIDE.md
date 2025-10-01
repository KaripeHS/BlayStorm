# 🚀 BlayStorm Deployment Guide

## Step-by-Step: Git Push & Vercel Deployment

---

## Part 1: Push to Git (GitHub)

### Step 1: Initialize Git Repository (if not already done)

```bash
# Navigate to project root
cd c:\Users\bdegu\coding\BlayStorm

# Check if git is initialized
git status

# If not initialized, run:
git init
```

### Step 2: Create .gitignore File

Make sure you have a `.gitignore` file at the root:

```bash
# Create .gitignore if it doesn't exist
touch .gitignore
```

Add this content to `.gitignore`:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Database
*.sqlite
*.db

# Prisma
packages/backend/prisma/migrations/

# Build files
*.tsbuildinfo
```

### Step 3: Add All Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status

# You should see all your files listed in green
```

### Step 4: Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit - BlayStorm Phase 3 complete

- 18 backend services implemented
- 15 frontend engagement components
- 550+ math problems
- Boss battle system
- Treasure chest system
- Socket.io real-time features
- Complete API integration
- Comprehensive documentation"
```

### Step 5: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon → "New repository"
3. Repository name: `blaystorm` (or your preferred name)
4. Description: "The Roblox of Math - Gamified Math Learning Platform"
5. Choose **Private** or **Public**
6. **DO NOT** initialize with README (we already have code)
7. Click "Create repository"

### Step 6: Connect Local Repo to GitHub

GitHub will show you commands. Use these:

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/blaystorm.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

### Step 7: Verify Push

1. Refresh your GitHub repository page
2. You should see all your files
3. Verify the commit message appears

✅ **Git Push Complete!**

---

## Part 2: Deploy Backend to Railway (Recommended for Backend)

### Why Railway?
- Free tier available
- Supports PostgreSQL + Redis
- Easy deployment
- Good for Node.js backends

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. Authorize Railway

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `blaystorm` repository
4. Choose `packages/backend` as the root directory

### Step 3: Configure Backend Service

1. Click on the backend service
2. Go to "Settings" → "Root Directory"
3. Set to: `packages/backend`

### Step 4: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Wait for it to provision
4. Click on PostgreSQL service
5. Go to "Connect" tab
6. Copy the `DATABASE_URL`

### Step 5: Add Redis Database

1. Click "+ New" again
2. Select "Database" → "Redis"
3. Wait for it to provision
4. Click on Redis service
5. Go to "Connect" tab
6. Copy the `REDIS_URL`

### Step 6: Set Environment Variables

1. Click on your backend service
2. Go to "Variables" tab
3. Add these variables:

```
DATABASE_URL=[paste PostgreSQL URL from step 4]
REDIS_URL=[paste Redis URL from step 5]
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-app-name.vercel.app
```

### Step 7: Add Build & Start Commands

1. Still in backend service settings
2. Go to "Settings" tab
3. Set "Build Command": `npm install && npx prisma generate && npm run build`
4. Set "Start Command": `npm start`

### Step 8: Deploy Backend

1. Click "Deploy" button
2. Wait for build to complete (3-5 minutes)
3. Once deployed, click "Settings" → "Domains"
4. Copy your backend URL (e.g., `https://your-app.railway.app`)

### Step 9: Run Database Migrations

1. In Railway, click on backend service
2. Go to "Settings" → "Service"
3. Click "One-off Command"
4. Run: `npx prisma db push`
5. Then run: `npm run db:seed`

✅ **Backend Deployed!**

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Find your `blaystorm` repository
3. Click "Import"

### Step 3: Configure Build Settings

Vercel will detect it's a monorepo. Configure:

**Framework Preset**: Vite

**Root Directory**: Click "Edit" → Select `packages/frontend`

**Build Command**:
```bash
npm install && npm run build
```

**Output Directory**:
```bash
dist
```

**Install Command**:
```bash
npm install
```

### Step 4: Set Environment Variables

Click "Environment Variables" and add:

```
VITE_API_URL=https://your-backend.railway.app
```

Replace `your-backend.railway.app` with your actual Railway backend URL from Part 2, Step 8.

### Step 5: Deploy Frontend

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Once complete, Vercel will show your live URL
4. Click "Visit" to see your app!

### Step 6: Update Backend CORS

1. Go back to Railway
2. Open your backend service
3. Go to "Variables"
4. Update `CORS_ORIGIN` to your Vercel URL (e.g., `https://blaystorm.vercel.app`)
5. Redeploy backend

✅ **Frontend Deployed!**

---

## Part 4: Final Configuration

### Step 1: Update Vercel Domain (Optional)

1. In Vercel dashboard, click on your project
2. Go to "Settings" → "Domains"
3. Add custom domain if you have one
4. Follow DNS configuration instructions

### Step 2: Enable HTTPS (Automatic)

- Vercel automatically provides HTTPS
- Railway automatically provides HTTPS
- No additional configuration needed!

### Step 3: Test Full Application

1. Visit your Vercel URL
2. Try to register a new account
3. Login
4. Solve a problem
5. Test all features:
   - [ ] Dashboard loads
   - [ ] Solo Play works
   - [ ] Quests update
   - [ ] Boss battles work
   - [ ] Treasure chests appear
   - [ ] Shop works
   - [ ] Real-time features work

### Step 4: Monitor Logs

**Backend Logs (Railway):**
1. Go to Railway dashboard
2. Click on backend service
3. View "Deployments" → "Logs"

**Frontend Logs (Vercel):**
1. Go to Vercel dashboard
2. Click on project
3. View "Deployments" → Select deployment → "Logs"

---

## Part 5: Alternative: Deploy Both to Vercel

If you want to deploy backend to Vercel as well (not recommended for production):

### Backend on Vercel:

1. Create new Vercel project
2. Import same GitHub repo
3. Set root directory to `packages/backend`
4. Framework: Other
5. Build Command: `npm install && npx prisma generate && npm run build`
6. Output Directory: `dist`
7. Add environment variables (same as Railway)
8. Deploy

**Note**: You'll need to use external PostgreSQL (like Supabase) and Redis (like Upstash) since Vercel doesn't provide databases.

---

## Quick Reference Commands

### Git Commands:
```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

### Update Deployment:

**After making changes:**

```bash
# 1. Commit changes
git add .
git commit -m "Update: description of changes"
git push origin main

# 2. Vercel will auto-deploy frontend (if connected)
# 3. Railway will auto-deploy backend (if connected)
# 4. Both deployments take 2-5 minutes
```

---

## Environment Variables Reference

### Backend (.env):
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
REDIS_URL="redis://host:6379"
JWT_SECRET="your-secret-key-min-32-chars"
NODE_ENV="production"
PORT="3001"
CORS_ORIGIN="https://your-frontend.vercel.app"
```

### Frontend (.env):
```bash
VITE_API_URL="https://your-backend.railway.app"
```

---

## Troubleshooting

### Issue: "git: command not found"
**Solution**: Install Git from https://git-scm.com/download/win

### Issue: "Build failed on Vercel"
**Solution**:
- Check build logs
- Ensure root directory is set to `packages/frontend`
- Verify build command: `npm install && npm run build`

### Issue: "API calls failing"
**Solution**:
- Verify `VITE_API_URL` is set correctly
- Check backend is deployed and running
- Verify CORS_ORIGIN in backend matches frontend URL

### Issue: "Database connection failed"
**Solution**:
- Verify DATABASE_URL is correct
- Run migrations: `npx prisma db push`
- Check PostgreSQL is running

### Issue: "Socket.io not connecting"
**Solution**:
- Verify backend URL is correct
- Check CORS settings
- Ensure WebSocket is enabled (Railway and Vercel support it)

### Issue: "Environment variables not working"
**Solution**:
- Redeploy after adding variables
- Check variable names match exactly
- Verify no trailing spaces in values

---

## Post-Deployment Checklist

### Immediate:
- [ ] Frontend loads without errors
- [ ] Backend responds to API calls
- [ ] Database connected
- [ ] Redis connected
- [ ] Socket.io connects
- [ ] Can register new user
- [ ] Can login
- [ ] Can solve problems

### Within 24 hours:
- [ ] Test all features thoroughly
- [ ] Monitor error logs
- [ ] Check performance (Lighthouse)
- [ ] Test on mobile devices
- [ ] Share with beta testers

### Within 1 week:
- [ ] Setup custom domain
- [ ] Configure analytics
- [ ] Setup error tracking (Sentry)
- [ ] Create backup strategy
- [ ] Document known issues

---

## Performance Optimization

### After Deployment:

1. **Enable Caching**
   - Vercel automatically caches static assets
   - Railway caches Docker layers

2. **Monitor Performance**
   ```bash
   # Run Lighthouse audit
   npx lighthouse https://your-app.vercel.app
   ```

3. **Optimize Images**
   - Use Vercel Image Optimization
   - Compress images before upload

4. **Enable Compression**
   - Vercel automatically compresses
   - Railway supports gzip

---

## Security Checklist

Before going live:

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable rate limiting in backend
- [ ] Setup HTTPS (automatic on Vercel/Railway)
- [ ] Review CORS settings
- [ ] Enable security headers
- [ ] Remove console.logs from production
- [ ] Validate all user inputs
- [ ] Setup error monitoring

---

## Monitoring & Analytics

### Recommended Tools:

1. **Error Tracking**: Sentry (sentry.io)
2. **Analytics**: Google Analytics or Plausible
3. **Uptime Monitoring**: UptimeRobot
4. **Performance**: Vercel Analytics

### Setup Sentry (Optional):

```bash
# Install
npm install @sentry/react @sentry/node

# Configure in frontend
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});

# Configure in backend
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

---

## Scaling Considerations

### When you grow:

1. **Database**
   - Upgrade PostgreSQL plan
   - Add read replicas
   - Enable connection pooling

2. **Backend**
   - Scale to multiple instances
   - Add Redis adapter for Socket.io
   - Enable horizontal scaling

3. **Frontend**
   - Vercel scales automatically
   - Add CDN for assets
   - Enable edge caching

4. **Monitoring**
   - Setup alerts
   - Monitor response times
   - Track error rates

---

## Cost Estimates

### Free Tier (Good for MVP/Testing):
- **Railway**: $5/month free credit
- **Vercel**: Unlimited for personal projects
- **GitHub**: Free for public repos

### Production (Estimated):
- **Railway**: ~$20-50/month (PostgreSQL + Redis + Backend)
- **Vercel**: Free (unless high traffic)
- **Custom Domain**: ~$10-15/year

**Total**: ~$20-50/month + $10-15/year for domain

---

## Success Criteria

✅ **Deployment Successful When:**
- Frontend accessible via HTTPS URL
- Backend responding to API calls
- Database connected and seeded
- Socket.io real-time working
- Users can register and login
- Problems can be solved
- All features functional

---

## Next Steps After Deployment

1. **Share with Beta Testers**
   - Collect feedback
   - Fix bugs
   - Iterate on features

2. **Marketing**
   - Create landing page
   - Social media posts
   - Demo video
   - Teacher outreach

3. **Iterate**
   - Monitor usage
   - Add requested features
   - Optimize performance
   - Improve content

---

## Support & Resources

### Documentation:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs

### Community:
- GitHub Issues: For bug reports
- Discord: For community support
- Email: For direct support

---

## Summary

**Deployment Steps:**

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Railway
3. ✅ Add PostgreSQL + Redis
4. ✅ Configure environment variables
5. ✅ Run database migrations
6. ✅ Deploy frontend to Vercel
7. ✅ Link frontend to backend
8. ✅ Test all features
9. ✅ Monitor and iterate

**Time Required:**
- Git setup: 10-15 minutes
- Backend deployment: 20-30 minutes
- Frontend deployment: 10-15 minutes
- Testing: 30-60 minutes
- **Total: ~1.5-2 hours**

**Result:**
🎉 **BlayStorm live and accessible to the world!**

---

Last Updated: Current Session
Status: Ready for Deployment
Next: Follow this guide step-by-step
