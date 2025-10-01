# ✅ Quick Deployment Checklist

Use this checklist to deploy BlayStorm in ~2 hours.

---

## Part 1: Git Push (15 minutes)

### 1. Initialize Git
```bash
cd c:\Users\bdegu\coding\BlayStorm
git init
git add .
git commit -m "Initial commit - BlayStorm complete"
```

- [ ] Git initialized
- [ ] All files added
- [ ] Commit created

### 2. Create GitHub Repository
1. [ ] Go to https://github.com/new
2. [ ] Name: `blaystorm`
3. [ ] Choose Private/Public
4. [ ] **Don't** initialize with README
5. [ ] Click "Create repository"

### 3. Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/blaystorm.git
git branch -M main
git push -u origin main
```

- [ ] Remote added
- [ ] Code pushed to GitHub
- [ ] Repository visible on GitHub

✅ **Git Push Complete!**

---

## Part 2: Deploy Backend (30 minutes)

### 1. Sign up for Railway
- [ ] Go to https://railway.app
- [ ] Sign in with GitHub
- [ ] Authorize Railway

### 2. Create New Project
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `blaystorm` repository
- [ ] Select `packages/backend` as root

### 3. Add PostgreSQL
- [ ] Click "+ New" → "Database" → "PostgreSQL"
- [ ] Wait for provisioning
- [ ] Copy `DATABASE_URL` from Connect tab

### 4. Add Redis
- [ ] Click "+ New" → "Database" → "Redis"
- [ ] Wait for provisioning
- [ ] Copy `REDIS_URL` from Connect tab

### 5. Configure Backend Environment
Go to Backend service → Variables, add:

```
DATABASE_URL=[from step 3]
REDIS_URL=[from step 4]
JWT_SECRET=change-this-to-a-long-random-string-min-32-chars
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-app.vercel.app
```

- [ ] DATABASE_URL added
- [ ] REDIS_URL added
- [ ] JWT_SECRET added
- [ ] NODE_ENV set to production
- [ ] PORT set to 3001
- [ ] CORS_ORIGIN added (will update later)

### 6. Set Build Commands
Settings → Build & Start:
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`

- [ ] Build command set
- [ ] Start command set

### 7. Deploy & Get URL
- [ ] Click "Deploy"
- [ ] Wait 3-5 minutes
- [ ] Copy your Railway URL (e.g., `https://your-backend.railway.app`)
- [ ] Save this URL for later

### 8. Run Database Migrations
Railway → Backend → Settings → One-off Commands:
```bash
npx prisma db push
npm run db:seed
```

- [ ] Database schema created
- [ ] Initial data seeded

✅ **Backend Deployed!**

**Your Backend URL**: `_________________`

---

## Part 3: Deploy Frontend (15 minutes)

### 1. Sign up for Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Authorize Vercel

### 2. Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Find `blaystorm` repository
- [ ] Click "Import"

### 3. Configure Build
- **Framework Preset**: Vite
- **Root Directory**: `packages/frontend`
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

- [ ] Framework set to Vite
- [ ] Root directory set
- [ ] Build command set
- [ ] Output directory set

### 4. Add Environment Variable
Click "Environment Variables":
```
VITE_API_URL=https://your-backend.railway.app
```

- [ ] VITE_API_URL added (use your Railway URL from Part 2, Step 7)

### 5. Deploy
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Copy your Vercel URL (e.g., `https://blaystorm.vercel.app`)

✅ **Frontend Deployed!**

**Your Frontend URL**: `_________________`

---

## Part 4: Update CORS (5 minutes)

### 1. Update Backend CORS
Railway → Backend → Variables:
- [ ] Update `CORS_ORIGIN` to your Vercel URL
- [ ] Redeploy backend

### 2. Wait for Redeploy
- [ ] Wait 2-3 minutes for backend to restart

✅ **CORS Updated!**

---

## Part 5: Test Deployment (30 minutes)

### 1. Visit Your App
- [ ] Go to your Vercel URL
- [ ] Page loads without errors

### 2. Test Registration
- [ ] Click "Register"
- [ ] Create account
- [ ] Registration succeeds

### 3. Test Login
- [ ] Login with credentials
- [ ] Dashboard loads
- [ ] Stats display

### 4. Test Core Features
- [ ] Click "Play Solo"
- [ ] Problem displays
- [ ] Can submit answer
- [ ] Next problem loads

### 5. Test Engagement Features
- [ ] Daily quests visible
- [ ] Can navigate to Shop
- [ ] Can navigate to Leaderboards
- [ ] Can navigate to Bosses

### 6. Test Real-time (if 2 browsers)
- [ ] Open app in 2 browsers
- [ ] Login to different accounts
- [ ] Actions in one appear in other (if in same guild)

✅ **All Tests Passed!**

---

## Part 6: Optional Improvements

### Custom Domain (Optional)
Vercel → Settings → Domains:
- [ ] Add custom domain
- [ ] Configure DNS
- [ ] Wait for DNS propagation

### Error Monitoring (Recommended)
1. [ ] Sign up for Sentry.io
2. [ ] Install Sentry packages
3. [ ] Add Sentry DSN to env vars
4. [ ] Redeploy

### Analytics (Recommended)
1. [ ] Sign up for Google Analytics
2. [ ] Add tracking code to frontend
3. [ ] Redeploy

---

## Deployment Complete! 🎉

### Your Live URLs:
- **Frontend**: `_________________`
- **Backend**: `_________________`

### What Works:
✅ User registration and login
✅ Problem solving with engagement cascade
✅ Daily quests
✅ Boss battles
✅ Treasure chests
✅ Real-time Socket.io features
✅ All 15 engagement features

### Next Steps:
1. [ ] Share with beta testers
2. [ ] Monitor logs for errors
3. [ ] Collect feedback
4. [ ] Iterate on features

---

## Troubleshooting

### Frontend shows "Network Error"
- Check backend is deployed and running
- Verify VITE_API_URL is correct
- Check browser console for CORS errors

### Backend crashes on start
- Check environment variables are set
- Verify DATABASE_URL is valid
- Check Railway logs for errors

### Database errors
- Run migrations: `npx prisma db push`
- Check PostgreSQL is provisioned
- Verify DATABASE_URL format

### Socket.io not connecting
- Check backend URL is correct
- Verify CORS_ORIGIN includes frontend URL
- Check browser console for WebSocket errors

---

## Quick Reference

### Redeploy Frontend
- Just push to GitHub main branch
- Vercel auto-deploys

### Redeploy Backend
- Push to GitHub main branch
- Railway auto-deploys

### View Logs
- **Backend**: Railway → Backend → Deployments → Logs
- **Frontend**: Vercel → Project → Deployments → Logs

### Update Environment Variables
- **Backend**: Railway → Backend → Variables
- **Frontend**: Vercel → Project → Settings → Environment Variables
- **Both require redeploy**

---

## Time Estimate

- Git Push: 15 min
- Backend Deploy: 30 min
- Frontend Deploy: 15 min
- CORS Update: 5 min
- Testing: 30 min
- **Total: ~1.5 hours**

---

## Success Criteria

✅ **Deployment successful when:**
- [ ] Frontend accessible via HTTPS
- [ ] Backend responding to API calls
- [ ] Users can register and login
- [ ] Problems can be solved
- [ ] All features working
- [ ] No console errors
- [ ] Real-time features work

---

**Good luck with your deployment! 🚀**

For detailed instructions, see `DEPLOYMENT_GUIDE.md`
