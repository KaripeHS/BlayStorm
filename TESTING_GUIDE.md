# BlayStorm Testing Guide & Checklist

## 🎯 Testing Strategy

This document provides a comprehensive testing plan for BlayStorm Phase 3.

---

## 📋 Pre-Testing Setup

### 1. Install Dependencies

```bash
# Backend
cd packages/backend
npm install

# Frontend
cd packages/frontend
npm install
```

### 2. Environment Setup

**Backend** (`packages/backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/blaystorm"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

**Frontend** (`packages/frontend/.env`):
```env
VITE_API_URL="http://localhost:3001"
```

### 3. Database Setup

```bash
cd packages/backend
npm run db:push
npm run db:seed
```

### 4. Start Services

```bash
# Terminal 1 - Backend
cd packages/backend
npm run dev

# Terminal 2 - Frontend
cd packages/frontend
npm run dev

# Terminal 3 - Redis (if not running)
redis-server
```

---

## ✅ Testing Checklist

### Phase 1: Basic Functionality

#### Authentication (Critical)
- [ ] User can register with username, email, password
- [ ] User can login with email and password
- [ ] JWT token is stored in localStorage
- [ ] User stays logged in on page refresh
- [ ] User can logout (token removed)
- [ ] Invalid credentials show error
- [ ] Protected routes redirect to login

#### Dashboard (Critical)
- [ ] Dashboard loads without errors
- [ ] Shows correct username
- [ ] Displays level and XP progress bar
- [ ] Shows coins and gems count
- [ ] Displays active pet (if any)
- [ ] Shows 4 stat cards (problems, accuracy, streak, rank)
- [ ] 8 quick action buttons visible
- [ ] Battle Pass preview card shows
- [ ] Guild card shows (or "Join Guild" CTA)
- [ ] Daily quests summary shows 3 quests
- [ ] All navigation buttons work

---

### Phase 2: Solo Play & Core Mechanics

#### Problem Solving
- [ ] SoloPlay page loads
- [ ] Problem displays correctly
- [ ] Can type answer in input
- [ ] Submit button enabled when answer entered
- [ ] Correct answer shows success feedback
- [ ] Incorrect answer shows error feedback
- [ ] Explanation appears after submission
- [ ] "Next Problem" button appears
- [ ] Clicking next loads new problem
- [ ] Back button returns to dashboard

#### Hint System
- [ ] Hint button visible
- [ ] First hint shows when clicked
- [ ] Second hint shows on second click
- [ ] Third hint shows on third click
- [ ] Hints count increments
- [ ] Hints display correctly

#### Combo System
- [ ] Combo meter displays
- [ ] Combo increments on correct answer
- [ ] Multiplier updates (1x → 1.25x → 1.5x → 2x → 2.5x → 3x)
- [ ] Combo breaks on incorrect answer
- [ ] Max combo tracked
- [ ] Combo milestone toasts appear (5, 10, 20)

#### Quest System
- [ ] Daily quests panel shows 3 quests
- [ ] Quest progress updates on correct answers
- [ ] Progress bars animate
- [ ] Completed quests show checkmark
- [ ] Can claim quest rewards
- [ ] Rewards added to account (coins, XP, gems)
- [ ] Quest disappears after claiming

#### Pet System
- [ ] Pet companion displays (if active)
- [ ] Pet shows happiness level
- [ ] Pet shows level
- [ ] Can feed pet
- [ ] Can play with pet
- [ ] Happiness increases
- [ ] Pet XP increases (30% of earned)
- [ ] Pet levels up when XP threshold reached

---

### Phase 3: Engagement Features

#### Shop
- [ ] Shop page loads
- [ ] Displays student coins/gems
- [ ] Shows all categories
- [ ] Can filter by category
- [ ] Items show name, price, rarity
- [ ] Can purchase with coins
- [ ] Can purchase with gems
- [ ] Insufficient funds shows error
- [ ] Purchase adds item to inventory
- [ ] Confetti plays on purchase

#### Avatar Customizer
- [ ] Avatar page loads
- [ ] Shows 7 categories
- [ ] Can filter by category
- [ ] Shows owned items
- [ ] Shows locked items
- [ ] Can equip item
- [ ] Can unequip item
- [ ] Preview updates in real-time
- [ ] Can purchase locked items
- [ ] Changes persist on page refresh

#### Leaderboards
- [ ] Leaderboards page loads
- [ ] Shows current student highlighted
- [ ] Can switch between types (XP, Problems, etc.)
- [ ] Can switch between scopes (Global, School, etc.)
- [ ] Rankings display correctly
- [ ] Shows rank, name, stats
- [ ] Top 3 have special styling
- [ ] Pagination works (if >50 entries)

#### Battle Pass
- [ ] Battle Pass page loads
- [ ] Shows season name and number
- [ ] Displays current level
- [ ] Shows XP progress bar
- [ ] Free track rewards visible
- [ ] Premium track rewards visible
- [ ] Can claim free rewards
- [ ] Can claim premium rewards (if owned)
- [ ] Claimed rewards show checkmark
- [ ] Rewards added to inventory

#### Guild Hall
- [ ] Guild page loads
- [ ] If no guild: shows "Join Guild" CTA
- [ ] If in guild: shows guild info
- [ ] Displays guild name, level
- [ ] Shows member list
- [ ] Shows online/offline status
- [ ] Shows member roles
- [ ] Displays guild events
- [ ] Shows member contributions

#### Challenge Arena
- [ ] Challenges page loads
- [ ] Shows active challenges
- [ ] Shows pending challenges
- [ ] Shows completed challenges
- [ ] Can accept pending challenge
- [ ] Can decline pending challenge
- [ ] Challenge history shows results

#### Home Base Editor
- [ ] Home Base page loads
- [ ] Grid displays (10x8)
- [ ] Shows available furniture
- [ ] Can drag furniture to grid
- [ ] Can remove furniture
- [ ] Can rotate furniture (if applicable)
- [ ] Shows furniture cost
- [ ] Can purchase furniture
- [ ] Can save layout
- [ ] Layout persists on page refresh

#### Story Map
- [ ] Story page loads
- [ ] Shows all 5 worlds
- [ ] Each world shows chapters
- [ ] Completed chapters show checkmark
- [ ] Locked chapters show lock icon
- [ ] Can start available chapter
- [ ] Starting chapter navigates to game

---

### Phase 4: Boss Battles

#### Boss Selection
- [ ] Bosses page loads
- [ ] Shows available bosses
- [ ] Each boss shows:
  - [ ] Name and description
  - [ ] Image (or placeholder)
  - [ ] Difficulty (1-5)
  - [ ] Health points
  - [ ] Required level
  - [ ] Rewards (coins, XP, gems)
  - [ ] Topics
- [ ] Locked bosses show lock icon
- [ ] Locked bosses show required level
- [ ] Can click "Challenge Boss" on unlocked
- [ ] Loading state while starting battle

#### Boss Battle Flow
- [ ] Clicking Challenge Boss navigates to SoloPlay
- [ ] URL has `?mode=boss&battleId=X`
- [ ] Boss overlay displays on top
- [ ] Shows boss name and image
- [ ] Shows health bar (current/max)
- [ ] Shows difficulty indicator
- [ ] Shows rewards preview
- [ ] Retreat button visible
- [ ] Problem interface still visible underneath

#### Boss Combat
- [ ] Can solve problems during battle
- [ ] Correct answer deals damage
- [ ] Damage calculation correct
- [ ] Boss health bar updates
- [ ] Damage toast notification shows
- [ ] Combo multiplier affects damage
- [ ] Incorrect answer: no damage
- [ ] Boss health reaches 0: victory

#### Boss Victory
- [ ] Fireworks effect plays
- [ ] "BOSS DEFEATED!" toast shows
- [ ] 3-second celebration
- [ ] Rewards distributed (coins, XP, gems)
- [ ] Legendary treasure chest awarded
- [ ] Navigates back to bosses page
- [ ] Boss marked as defeated

#### Boss Retreat
- [ ] Can click Retreat button
- [ ] Confirmation required
- [ ] Retreat abandons battle
- [ ] Navigates back to bosses page
- [ ] Boss progress NOT saved (starts over next time)

---

### Phase 5: Treasure Chests

#### Treasure Drop
- [ ] 5% chance triggers on correct answer
- [ ] Toast notification appears
- [ ] "Treasure Found!" message
- [ ] Shows rarity (COMMON, RARE, etc.)
- [ ] Particle effects play
- [ ] Modal overlay appears
- [ ] Cannot dismiss modal (no click-outside)

#### Treasure Opening Animation
- [ ] Phase 1: Chest appears (0.5s)
- [ ] Phase 2: Chest shakes (2s)
- [ ] Phase 3: Chest opens with explosion (1s)
- [ ] Phase 4: Rewards fly out (0.8s each)
- [ ] Confetti effects match rarity
- [ ] Rarity glow colors correct:
  - [ ] COMMON: Gray
  - [ ] UNCOMMON: Green
  - [ ] RARE: Blue
  - [ ] EPIC: Purple
  - [ ] LEGENDARY: Gold

#### Treasure Rewards
- [ ] Rewards scale with rarity (1x - 10x)
- [ ] Shows coins, gems, XP
- [ ] Shows special items (if any)
- [ ] Animation completes fully
- [ ] Rewards added to account
- [ ] "Treasure Opened!" toast shows
- [ ] Modal closes
- [ ] Can continue playing

---

### Phase 6: Socket.io Real-time

#### Connection
- [ ] Socket connects on login
- [ ] Connection status visible in console
- [ ] JWT token sent with connection
- [ ] User ID authenticated
- [ ] Socket disconnects on logout
- [ ] Auto-reconnects on disconnect

#### Quest Updates (Real-time)
- [ ] Solve problem in one tab
- [ ] Quest progress updates in another tab
- [ ] No page refresh needed
- [ ] Toast notification shows
- [ ] Progress bar animates

#### Leaderboard Updates (Real-time)
- [ ] Open leaderboards in two tabs
- [ ] Earn XP in one tab
- [ ] Leaderboard updates in other tab
- [ ] Rank changes animate
- [ ] Position highlighted

#### Guild Chat (Real-time)
- [ ] Open guild in two tabs/browsers
- [ ] Send message in one
- [ ] Message appears in other instantly
- [ ] Typing indicator shows
- [ ] Typing indicator disappears after 3s
- [ ] Messages show username
- [ ] Messages show timestamp

#### Challenge Notifications (Real-time)
- [ ] User A sends challenge to User B
- [ ] User B receives instant notification
- [ ] Toast appears on User B's screen
- [ ] User B can accept/decline
- [ ] User A notified of acceptance/decline
- [ ] Both navigate to challenge room

#### Battle Pass Updates (Real-time)
- [ ] Earn XP
- [ ] Battle Pass XP notification appears
- [ ] Progress bar updates
- [ ] Level up triggers fireworks
- [ ] "LEVEL UP!" toast shows
- [ ] Rewards modal appears

#### Friend Activity (Real-time)
- [ ] Friend goes online
- [ ] Online status updates
- [ ] Friend defeats boss
- [ ] Activity appears in feed
- [ ] Friend goes offline
- [ ] Offline status updates

---

### Phase 7: Error Handling & Edge Cases

#### Network Errors
- [ ] API unavailable: shows error message
- [ ] Socket disconnect: shows reconnecting
- [ ] Failed API call: doesn't crash app
- [ ] Retry mechanism works
- [ ] Error boundaries catch crashes

#### Invalid States
- [ ] No active pet: UI handles gracefully
- [ ] No guild: shows "Join Guild"
- [ ] No quests: shows empty state
- [ ] No treasure: doesn't break
- [ ] No boss battle: redirects correctly

#### Input Validation
- [ ] Empty answer: submit disabled
- [ ] Invalid answer: error shown
- [ ] SQL injection attempts: sanitized
- [ ] XSS attempts: sanitized
- [ ] Long inputs: truncated

#### Edge Cases
- [ ] Level 100: doesn't overflow
- [ ] Max combo: caps at 3x
- [ ] 100% accuracy: displays correctly
- [ ] 0 problems solved: shows 0
- [ ] First time user: onboarding works
- [ ] All quests complete: new day generates

---

### Phase 8: Performance & Responsiveness

#### Performance
- [ ] Page loads in < 3 seconds
- [ ] Animations smooth (60fps)
- [ ] No memory leaks (check DevTools)
- [ ] API calls optimized (no duplicate)
- [ ] Images optimized
- [ ] Bundle size reasonable

#### Mobile Responsiveness
- [ ] Dashboard responsive on mobile
- [ ] SoloPlay works on mobile
- [ ] Shop grid adapts to screen
- [ ] Avatar customizer mobile-friendly
- [ ] Leaderboards scroll on mobile
- [ ] Boss overlay fits mobile screen
- [ ] Treasure modal fits mobile

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Screen reader friendly
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] ARIA labels present

---

### Phase 9: Cross-Browser Testing

#### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

#### Features to Verify
- [ ] Socket.io connects
- [ ] Animations play smoothly
- [ ] LocalStorage works
- [ ] JWT authentication works
- [ ] Confetti effects work
- [ ] Modal overlays display

---

### Phase 10: Security Testing

#### Authentication
- [ ] Cannot access protected routes without login
- [ ] Token expires after timeout
- [ ] Invalid token: auto-logout
- [ ] Password hashing works
- [ ] Cannot access other user's data

#### Authorization
- [ ] Students can't access teacher routes
- [ ] Teachers can't access student data of other classes
- [ ] API endpoints check permissions
- [ ] Socket rooms isolated by user

#### Data Validation
- [ ] Server validates all inputs
- [ ] Client validates before submission
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled

---

## 🐛 Known Issues & Fixes

### Issue Tracking

| Issue | Priority | Status | Fix |
|-------|----------|--------|-----|
| Dependencies not installed | High | ✅ | Run `npm install` |
| TypeScript errors | Medium | 🔄 | Fix type definitions |
| Socket auth token | Medium | ✅ | Implemented |
| Missing env vars | High | 📝 | Add .env files |
| CORS errors | Medium | ✅ | Configured |

---

## 🔧 Common Fixes

### "Module not found"
```bash
cd packages/frontend
npm install
```

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
# Update DATABASE_URL in .env
npm run db:push
```

### "Socket connection failed"
```bash
# Check backend is running on port 3001
# Check VITE_API_URL in frontend .env
```

### "Token expired"
```javascript
// Clear localStorage and login again
localStorage.clear();
```

---

## 📊 Test Results Template

### Test Session: [Date]

**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]
**Browser**: [Chrome/Firefox/etc.]

#### Summary:
- Total Tests: X
- Passed: Y
- Failed: Z
- Skipped: W

#### Critical Issues:
1. [Issue description]
2. [Issue description]

#### Minor Issues:
1. [Issue description]
2. [Issue description]

#### Recommendations:
1. [Recommendation]
2. [Recommendation]

---

## 🚀 Pre-Launch Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.errors in production
- [ ] No TODO comments in critical paths
- [ ] Code formatted consistently
- [ ] Dead code removed

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No render-blocking resources
- [ ] Images optimized

### Security
- [ ] Environment variables not in code
- [ ] API keys not exposed
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Deployment guide written
- [ ] User guide created
- [ ] Known issues documented

---

## 🎯 Success Criteria

### Must Have:
✅ All authentication works
✅ Problems can be solved
✅ Quests complete and claim
✅ Boss battles fully functional
✅ Treasure chests work
✅ Socket.io connects
✅ No critical bugs

### Should Have:
✅ All engagement features work
✅ Mobile responsive
✅ Performance optimized
✅ Error handling complete
✅ Real-time updates work

### Nice to Have:
□ Animations polished
□ Accessibility excellent
□ Cross-browser tested
□ Load testing done
□ Analytics integrated

---

## 📝 Testing Notes

### Manual Testing Priority:
1. **Critical Path** (Must work):
   - Registration → Login → Dashboard → Solve Problem → Quest Complete

2. **Core Features** (High priority):
   - Boss battles
   - Treasure chests
   - Socket.io real-time

3. **Engagement** (Medium priority):
   - Shop, Avatar, Leaderboards, etc.

4. **Polish** (Low priority):
   - Animations, edge cases, etc.

### Automated Testing (Future):
- Unit tests for services
- Integration tests for API
- E2E tests for user flows
- Socket.io event testing

---

Last Updated: Current Session
Status: Testing Guide Complete
Next: Run tests and document results
