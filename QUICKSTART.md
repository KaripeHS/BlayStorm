# 🚀 BlayStorm - Quick Start Guide

Get BlayStorm running locally in under 10 minutes!

## Prerequisites

Install these before starting:
- **Node.js 20+**: [Download](https://nodejs.org/)
- **pnpm 9+**: `npm install -g pnpm`
- **PostgreSQL 16+**: [Download](https://www.postgresql.org/download/)
- **Redis 7+**: [Download](https://redis.io/download)

## Step-by-Step Setup

### 1. Install Dependencies (2 min)

```bash
# Clone the repository
git clone <your-repo-url>
cd BlayStorm

# Install all dependencies
pnpm install
```

### 2. Start Database Services (1 min)

**PostgreSQL:**
```bash
# Start PostgreSQL (varies by OS)
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Use PostgreSQL service
```

**Redis:**
```bash
# Start Redis (varies by OS)
# macOS: brew services start redis
# Linux: sudo systemctl start redis
# Windows: Use Redis service or WSL
```

### 3. Configure Environment (3 min)

**Backend configuration:**
```bash
cd packages/backend
cp .env.example .env
```

Edit `packages/backend/.env`:
```bash
# Required - Update these
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/blaystorm"
JWT_SECRET="generate-with-openssl-rand-base64-32"
JWT_REFRESH_SECRET="generate-another-secret"

# Optional - Can leave as-is for local development
REDIS_URL="redis://localhost:6379"
OPENAI_API_KEY="sk-..." # Add if you want AI tutor to work
STRIPE_SECRET_KEY="sk_test_..." # Add if you want payments to work
```

**Frontend configuration:**
```bash
cd ../frontend
cp .env.example .env
```

The default frontend `.env` should work as-is:
```bash
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 4. Setup Database (2 min)

```bash
# From project root
pnpm db:push    # Creates database tables
pnpm db:seed    # Adds initial data (15 problems, 10 achievements, demo users)
```

You should see output like:
```
✅ Created 10 achievements
✅ Created 15 math problems
✅ Created demo student: student@demo.com / Demo123!
✅ Created demo parent: parent@demo.com / Demo123!
```

### 5. Start Development Servers (1 min)

**Option A - Both servers at once:**
```bash
pnpm dev
```

**Option B - Separate terminals:**
```bash
# Terminal 1
pnpm dev:backend

# Terminal 2
pnpm dev:frontend
```

### 6. Test the Application (1 min)

1. Open browser to http://localhost:3000
2. Click "Login"
3. Use demo credentials:
   - Email: `student@demo.com`
   - Password: `Demo123!`
4. Click "Solo Practice"
5. Answer a math problem!

---

## 🎉 You're Done!

The application is now running locally.

---

## Common Issues & Solutions

### "Database connection failed"

**Problem:** Can't connect to PostgreSQL

**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env matches your setup
3. Test connection: `psql $DATABASE_URL`

### "Redis connection refused"

**Problem:** Can't connect to Redis

**Solution:**
1. Verify Redis is running: `redis-cli ping` (should return "PONG")
2. Check REDIS_URL in .env
3. Try: `redis-cli` to test connection

### "pnpm command not found"

**Problem:** pnpm not installed

**Solution:**
```bash
npm install -g pnpm
```

### "Port 3000 already in use"

**Problem:** Another app using port 3000

**Solution:**
- Stop other app
- OR change port in `packages/frontend/vite.config.ts`

### "Port 3001 already in use"

**Problem:** Another app using port 3001

**Solution:**
- Stop other app
- OR change PORT in `packages/backend/.env`

---

## Next Steps

Now that you have BlayStorm running:

1. **Try all features:**
   - Solo gameplay
   - Profile page
   - Leaderboard
   - Subscription plans

2. **Explore the code:**
   - Backend API: `packages/backend/src/`
   - Frontend pages: `packages/frontend/src/pages/`
   - Database schema: `packages/backend/prisma/schema.prisma`

3. **Add your own problems:**
   - Edit `packages/backend/prisma/seed.ts`
   - Run `pnpm db:seed` again

4. **Customize the design:**
   - Edit colors in `packages/frontend/tailwind.config.js`
   - Modify components in `packages/frontend/src/components/`

5. **Add features:**
   - Check out the Phase 2 additions document
   - Implement teacher portal
   - Add more game modes

---

## Useful Commands

```bash
# Development
pnpm dev              # Run both frontend + backend
pnpm dev:frontend     # Run only frontend
pnpm dev:backend      # Run only backend

# Database
pnpm db:push          # Push schema changes
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio (visual DB editor)

# Build for production
pnpm build            # Build both
pnpm build:frontend   # Build frontend only
pnpm build:backend    # Build backend only

# Linting
pnpm lint             # Lint all packages
```

---

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Changes auto-refresh in browser
- **Backend**: Server restarts automatically with tsx watch

### Debugging Backend
Add breakpoints with `debugger` or console.log:
```typescript
console.log('User data:', user);
```

### Debugging Frontend
Use React DevTools browser extension

### Database Changes
After changing schema in `packages/backend/prisma/schema.prisma`:
```bash
pnpm db:push
```

---

## Need Help?

- **Read full documentation**: See README.md and docs/
- **Check deployment guide**: See docs/DEPLOYMENT.md
- **API documentation**: See README.md API section
- **Common errors**: Search GitHub issues

---

## What to Do Next?

### For Learning:
- Study the authentication flow in `packages/backend/src/services/auth/`
- Understand the game logic in `packages/backend/src/services/game/`
- Explore the React components in `packages/frontend/src/`

### For Building:
- Add more math problems to the seed file
- Create new UI components
- Implement the multiplayer game logic
- Add Phase 2 features (teacher portal, admin panel)

### For Deploying:
- See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment

---

Happy coding! 🔥⚡