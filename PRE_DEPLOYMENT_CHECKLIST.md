# 🚀 Pre-Deployment Checklist

Complete these steps BEFORE pushing to Git and deploying.

---

## ✅ Step 1: Environment Files Setup

### Backend Environment
- [ ] Copy `packages/backend/.env.example` to `packages/backend/.env`
- [ ] Keep defaults for local testing
- [ ] Note: Production env vars will be set in Railway later

### Frontend Environment
- [ ] Copy `packages/frontend/.env.example` to `packages/frontend/.env`
- [ ] Verify `VITE_API_URL=http://localhost:3001`
- [ ] Note: Production URL will be set in Vercel later

---

## ✅ Step 2: Dependencies Installation

### Install Backend Dependencies
```bash
cd packages/backend
npm install
```

### Install Frontend Dependencies
```bash
cd packages/frontend
npm install
```

**Expected time**: 2-3 minutes per package

---

## ✅ Step 3: Database Setup (Local Testing)

### Prerequisites
- [ ] PostgreSQL installed locally
- [ ] Redis installed locally (optional for local testing)

### Setup Database
```bash
cd packages/backend

# Push schema to database
npx prisma db push

# Seed with initial data
npm run db:seed
```

**Expected output**: "✅ Database seeded successfully!"

---

## ✅ Step 4: Local Testing (Recommended)

### Start Backend
```bash
cd packages/backend
npm run dev
```

**Expected**: Server running on `http://localhost:3001`

### Start Frontend (new terminal)
```bash
cd packages/frontend
npm run dev
```

**Expected**: App running on `http://localhost:3000`

### Quick Test Checklist
- [ ] Visit `http://localhost:3000`
- [ ] Landing page loads
- [ ] Can register new account
- [ ] Can login
- [ ] Dashboard displays
- [ ] No console errors

**If local testing works, you're ready to deploy! 🎉**

---

## ✅ Step 5: Pre-Git Checks

### File Verification
- [ ] `.gitignore` exists in root
- [ ] `.env` files are NOT staged (check with `git status`)
- [ ] `node_modules/` not staged
- [ ] All source code files present

### Critical Files to Verify
```bash
# Check these files exist:
packages/backend/src/index.ts
packages/backend/prisma/schema.prisma
packages/frontend/src/App.tsx
packages/frontend/src/main.tsx
package.json (root)
README.md
```

---

## ✅ Step 6: Build Test (Optional but Recommended)

### Build Backend
```bash
cd packages/backend
npm run build
```

**Expected**: `dist/` folder created with compiled JS files

### Build Frontend
```bash
cd packages/frontend
npm run build
```

**Expected**: `dist/` folder created with production assets

**If both build successfully, deployment will work! ✅**

---

## 🎯 Ready to Deploy?

If all checks pass, proceed to deployment:

**Next Steps:**
1. **Push to Git**: Follow `QUICK_DEPLOY_CHECKLIST.md` Part 1
2. **Deploy Backend**: Follow Part 2 (Railway)
3. **Deploy Frontend**: Follow Part 3 (Vercel)

---

## 🐛 Common Issues

### "Cannot find module" errors
- **Fix**: Run `npm install` in the affected package

### Prisma errors
- **Fix**: Run `npx prisma generate` in `packages/backend`

### Port already in use
- **Fix**: Kill process using port or change PORT in `.env`

### PostgreSQL connection failed
- **Fix**: Verify PostgreSQL is running and DATABASE_URL is correct

---

## 📦 What Gets Deployed

### Backend (Railway)
- Express server
- Prisma ORM
- Socket.io server
- All 18 services
- API routes

### Frontend (Vercel)
- React SPA
- All 15 components
- API integration
- Socket.io client

### Databases (Railway)
- PostgreSQL (managed)
- Redis (managed)

---

## 🔐 Security Notes

**DO NOT commit:**
- ❌ `.env` files
- ❌ `node_modules/`
- ❌ API keys or secrets
- ❌ Database credentials

**Already protected by .gitignore ✅**

---

## ⏱️ Time Estimates

- Environment setup: 5 minutes
- Dependencies install: 5 minutes
- Database setup: 5 minutes
- Local testing: 10 minutes
- Build testing: 5 minutes

**Total: ~30 minutes before deployment**

---

## 🆘 Need Help?

- **Local issues**: Check console errors and logs
- **Build issues**: Verify all dependencies installed
- **Database issues**: Check PostgreSQL is running
- **Deployment issues**: See `QUICK_DEPLOY_CHECKLIST.md`

---

**Good luck! Your BlayStorm platform is ready to launch! 🚀**
