# 🔥 BlayStorm - The Roblox of Math

**Tagline:** "Storm through math with friends"

## Overview

BlayStorm is a **fully gamified math learning platform** designed to make kids ADDICTED to learning. Featuring 15 engagement systems that cascade on every correct answer, boss battles, treasure chests, pets, guilds, and real-time multiplayer - this is the most engaging math platform ever built.

**Target Audience:** Grades K-12 (primarily 4-8)
**Status:** ✅ Phase 3 Complete - Production Ready

---

## 🚀 Quick Start

**Want to deploy immediately?**

1. Open **[QUICK_DEPLOY_CHECKLIST.md](QUICK_DEPLOY_CHECKLIST.md)**
2. Follow the step-by-step deployment guide
3. Have your platform live in ~2 hours

**Want to test locally first?**

```bash
# 1. Setup environment
cd packages/backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# 2. Install dependencies
cd packages/backend && npm install
cd ../frontend && npm install

# 3. Setup database
cd packages/backend
npx prisma db push
npm run db:seed

# 4. Start backend (terminal 1)
npm run dev

# 5. Start frontend (terminal 2)
cd packages/frontend
npm run dev

# 6. Visit http://localhost:3000
```

**See [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) for detailed local setup.**

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.io
- **Cache:** Redis
- **AI:** OpenAI GPT
- **Payments:** Stripe

## Project Structure

```
blaystorm/
├── packages/
│   ├── frontend/          # React web application
│   ├── backend/           # Node.js API server
│   └── shared/            # Shared types and constants
├── docs/                  # Documentation
└── package.json           # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# Configure your database and API keys in the .env files

# Push database schema
pnpm db:push

# Seed database with initial problems
pnpm db:seed
```

### Development

```bash
# Run both frontend and backend
pnpm dev

# Run only frontend (port 3000)
pnpm dev:frontend

# Run only backend (port 3001)
pnpm dev:backend
```

### Database Management

```bash
# Push schema changes
pnpm db:push

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

## Features

### ✅ Phase 1 (MVP) - Complete
- **Authentication System**: JWT-based auth with student, parent, teacher, and admin roles
- **Solo Gameplay**: Adaptive difficulty engine
- **Basic Game Mechanics**: XP, levels, streaks, coins, gems
- **AI Tutor**: OpenAI GPT-4o integration
- **Subscription System**: Stripe integration

### ✅ Phase 2 (Platform Foundation) - Complete
- **Teacher Dashboard**: Classroom management, assignments, analytics
- **Admin Panel**: User management and content moderation
- **Payment System**: Complete Stripe integration
- **Expanded Problems**: 500+ math problems across all grades

### ✅ Phase 3 (Full Gamification) - Complete 🎉
**15 Engagement Features That Make Kids LOVE Math:**

1. **XP & Leveling System** - Progress through 100+ levels
2. **Combo Multipliers** - Chain correct answers for 1x → 2x → 3x bonuses
3. **Pet Collection & Bonding** - 20+ pets that level up with you
4. **Avatar Customization** - 42 items across 7 categories with 6 rarities
5. **Daily Quests** - 3 new quests every day
6. **Shop System** - Spend coins and gems on items
7. **Battle Pass** - 100 levels with free and premium tracks
8. **Guild System** - Join teams with real-time chat
9. **Leaderboards** - Compete globally (XP, Coins, Speed, Streaks)
10. **Challenge System** - 1v1 PvP battles with other students
11. **Boss Battles** - Epic encounters with massive rewards
12. **Treasure Chests** - 5% drop rate with 4 rarity tiers
13. **Home Base Upgrades** - Customize your virtual space
14. **Story Mode** - Progress through narrative chapters
15. **Real-time Updates** - Socket.io for instant gratification

**Every correct answer triggers 7-10 of these systems simultaneously!**

### Subscription Tiers

- **Free:** 3 problems/day, solo only
- **Premium:** $9.99/month - unlimited problems, multiplayer, AI tutor
- **Family:** $19.99/month - up to 5 student accounts
- **School:** Custom pricing for districts

## Brand Identity

**Colors:**
- Fire Orange: `#FF6B2C`
- Electric Blue: `#0EA5E9`
- Storm Purple: `#9333EA`
- Victory Gold: `#F59E0B`
- Ember Red: `#EF4444`

**Tone:** Exciting, energetic, confident. Think Fortnite meets Duolingo.

## Demo Accounts

After seeding the database, you can log in with:

**Student Account:**
- Email: `student@demo.com`
- Password: `Demo123!`

**Parent Account:**
- Email: `parent@demo.com`
- Password: `Demo123!`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Game Endpoints
- `POST /api/game/session/start` - Start game session
- `GET /api/game/problem/next` - Get next problem
- `POST /api/game/problem/submit` - Submit answer
- `GET /api/game/progress` - Get student progress

### AI Tutor Endpoints (Premium)
- `POST /api/ai-tutor/hint` - Get hint
- `POST /api/ai-tutor/explain` - Explain mistake

### Subscription Endpoints
- `POST /api/subscription/checkout` - Create Stripe checkout
- `GET /api/subscription/status` - Get subscription status

## 🚀 Deployment

**Ready to deploy? Start here:**

1. **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)** - Setup steps before deployment
2. **[QUICK_DEPLOY_CHECKLIST.md](QUICK_DEPLOY_CHECKLIST.md)** - Step-by-step deployment guide ⭐ START HERE
3. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Detailed instructions with troubleshooting

**Deployment Stack:**
- **Frontend**: Vercel (auto-deploy from GitHub)
- **Backend**: Railway (with PostgreSQL + Redis)
- **Estimated Time**: 1.5 - 2 hours

**All documentation is complete and ready to follow!**

## 📊 Project Status

**Current Version:** Phase 3 Complete - Production Ready ✅

**Platform Statistics:**
- 📁 150+ files
- 🎮 15 engagement features
- 🔧 18 backend services
- 🌐 40+ API endpoints
- 📡 30+ real-time Socket.io events
- 🧩 50+ React components
- 🗄️ 25+ database tables
- 📚 500+ math problems
- 🎨 42 avatar items
- 🐾 20+ collectible pets

**What's Working (Everything!):**
- ✅ Complete authentication system (Student, Parent, Teacher, Admin)
- ✅ Solo & Multiplayer gameplay
- ✅ Boss battle system with epic rewards
- ✅ Treasure chest drops (4 rarity tiers)
- ✅ Pet collection & bonding system
- ✅ Avatar customization (7 categories)
- ✅ Daily quests (3 per day)
- ✅ Battle Pass (100 levels, dual tracks)
- ✅ Guild system with real-time chat
- ✅ Challenge system (1v1 PvP)
- ✅ Shop with coins & gems
- ✅ 4 types of leaderboards
- ✅ Home Base upgrades
- ✅ Story mode progression
- ✅ Real-time Socket.io updates
- ✅ Teacher dashboard & classrooms
- ✅ AI tutor integration
- ✅ Subscription management
- ✅ Error boundaries & production-ready code

**What's Next (Future Enhancements):**
- 📱 Mobile app (React Native)
- 🌍 Internationalization
- 🎵 Sound effects & music
- 🏆 Tournaments & seasonal events
- 📊 Advanced analytics
- 🤝 Partnerships with schools

## Architecture Overview

```
┌─────────────┐      HTTP/WS       ┌─────────────┐
│   React     │ ←─────────────────→ │   Express   │
│  Frontend   │                     │   Backend   │
└─────────────┘                     └─────────────┘
                                           │
                            ┌──────────────┼──────────────┐
                            │              │              │
                        ┌───▼────┐    ┌───▼────┐    ┌───▼────┐
                        │ Prisma │    │ Redis  │    │ OpenAI │
                        │   ORM  │    │ Cache  │    │   API  │
                        └───┬────┘    └────────┘    └────────┘
                            │
                        ┌───▼────┐
                        │Postgres│
                        │   DB   │
                        └────────┘
```

## Tech Decisions

- **Monorepo**: Organized with pnpm workspaces for easy shared code
- **TypeScript**: End-to-end type safety
- **Prisma**: Type-safe database access with migrations
- **Zustand**: Lightweight state management (vs Redux)
- **Tailwind CSS**: Utility-first styling for rapid development
- **Socket.io**: Real-time multiplayer capabilities
- **OpenAI**: GPT-4o-mini for cost-effective AI tutoring

## Contributing

This is a closed-source project. For authorized contributors:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit PR with description

## License

Proprietary - All rights reserved

## Contact

For questions or support, contact: support@blaystorm.io

---

Built with 🔥 by the BlayStorm Team