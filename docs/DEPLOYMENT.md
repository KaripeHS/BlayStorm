# 🚀 BlayStorm Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+ LTS
- pnpm 9+
- PostgreSQL 16+
- Redis 7+
- Git

### 1. Clone and Install

```bash
git clone <your-repo>
cd BlayStorm
pnpm install
```

### 2. Setup Environment Variables

**Backend** (`packages/backend/.env`):
```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `REDIS_URL`: Your Redis connection string
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `JWT_REFRESH_SECRET`: Generate another secret
- `OPENAI_API_KEY`: Your OpenAI API key
- `STRIPE_SECRET_KEY`: Your Stripe test key

**Frontend** (`packages/frontend/.env`):
```bash
cp packages/frontend/.env.example packages/frontend/.env
```

Edit `.env`:
- `VITE_API_URL=http://localhost:3001`
- `VITE_SOCKET_URL=http://localhost:3001`

### 3. Setup Database

```bash
# Push database schema
pnpm db:push

# Seed with initial data
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
pnpm dev:backend

# Terminal 2: Start frontend
pnpm dev:frontend
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Demo accounts:
  - Student: `student@demo.com` / `Demo123!`
  - Parent: `parent@demo.com` / `Demo123!`

---

## Production Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway

1. Sign up at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL and Redis services
4. Deploy from GitHub:
   - Root directory: `packages/backend`
   - Build command: `pnpm install && pnpm build`
   - Start command: `node dist/server.js`
5. Add environment variables from `.env.example`
6. Deploy!

#### Deploy Frontend to Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure:
   - Root directory: `packages/frontend`
   - Build command: `pnpm build`
   - Output directory: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
   - `VITE_SOCKET_URL`: Your Railway backend URL
5. Deploy!

### Option 2: Full Stack on Render

1. Sign up at [render.com](https://render.com)
2. Create PostgreSQL database
3. Create Redis instance
4. Create Web Service for backend:
   - Build command: `cd packages/backend && pnpm install && pnpm build`
   - Start command: `cd packages/backend && node dist/server.js`
5. Create Static Site for frontend:
   - Build command: `cd packages/frontend && pnpm install && pnpm build`
   - Publish directory: `packages/frontend/dist`

### Option 3: Self-Hosted (VPS)

#### Requirements
- Ubuntu 22.04+ or similar
- 2GB+ RAM
- Docker & Docker Compose

#### Using Docker (Recommended)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: blaystorm
      POSTGRES_USER: blaystorm
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./packages/backend
    environment:
      - DATABASE_URL=postgresql://blaystorm:${DB_PASSWORD}@postgres:5432/blaystorm
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    env_file:
      - ./packages/backend/.env
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./packages/frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose up -d
```

---

## Environment Setup Checklist

### Backend Environment Variables

**Required:**
- ✅ `DATABASE_URL` - PostgreSQL connection
- ✅ `REDIS_URL` - Redis connection
- ✅ `JWT_SECRET` - Auth token secret
- ✅ `JWT_REFRESH_SECRET` - Refresh token secret

**Optional but Recommended:**
- `OPENAI_API_KEY` - For AI tutor (can disable feature)
- `STRIPE_SECRET_KEY` - For payments (can disable feature)
- `RESEND_API_KEY` - For emails (can disable feature)

### Frontend Environment Variables

**Required:**
- ✅ `VITE_API_URL` - Backend API URL
- ✅ `VITE_SOCKET_URL` - Socket.io URL

**Optional:**
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key
- `VITE_ENABLE_PAYMENTS` - Set to `false` to disable

---

## Database Migrations

### Create New Migration
```bash
cd packages/backend
npx prisma migrate dev --name your_migration_name
```

### Apply to Production
```bash
npx prisma migrate deploy
```

### Reset Database (⚠️ Destroys all data)
```bash
npx prisma migrate reset
```

---

## Monitoring & Logging

### Backend Logs
```bash
# View logs
docker-compose logs -f backend

# Or if running directly:
pm2 logs backend
```

### Database Monitoring
```bash
# Open Prisma Studio
pnpm db:studio
```

### Error Tracking
- Add Sentry DSN to environment variables
- Set `SENTRY_DSN` in backend `.env`

---

## Security Checklist

### Before Going Live:
- [ ] Change all default secrets
- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable Redis password
- [ ] Use strong database passwords
- [ ] Set `NODE_ENV=production`
- [ ] Configure Stripe webhook secrets
- [ ] Enable email verification
- [ ] Set up monitoring/alerts

---

## Troubleshooting

### "Connection refused" errors
- Check if services are running
- Verify firewall rules
- Check environment variables

### Database connection errors
- Verify `DATABASE_URL` format
- Ensure PostgreSQL is running
- Check database credentials

### Redis errors
- Ensure Redis is running
- Check `REDIS_URL` format
- Verify Redis is accessible

### Frontend can't reach backend
- Check `VITE_API_URL` matches backend URL
- Verify CORS settings in backend
- Check network/firewall rules

---

## Performance Optimization

### Backend
- Enable Redis caching
- Use connection pooling
- Optimize database queries
- Enable compression
- Use CDN for assets

### Frontend
- Enable code splitting
- Optimize images
- Use lazy loading
- Enable gzip compression
- Cache static assets

### Database
- Add indexes for frequent queries
- Analyze slow queries
- Set up read replicas (if needed)

---

## Backup Strategy

### Database Backups
```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Full System Backup
```bash
# Backup entire data directory
tar -czf blaystorm_backup_$(date +%Y%m%d).tar.gz \
  ./data \
  ./packages/backend/.env \
  ./packages/frontend/.env
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Add multiple backend instances
- Use managed Redis (Upstash, ElastiCache)
- Use managed PostgreSQL (Neon, Supabase)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add caching layers

---

## Support

For issues:
1. Check logs first
2. Review environment variables
3. Verify all services are running
4. Check GitHub issues
5. Contact support

---

## 🎉 Deployment Complete!

Your BlayStorm application should now be live and accessible!