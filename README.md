# CodeSensei 🥋

**Learn. Debug. Level Up.** — An interactive coding education platform with gamified learning.

## Features

- 🏠 **Dashboard** — Track your progress, streak, and XP
- 💻 **Code Editor** — Solve problems with logic analysis
- 🐛 **Bug Hunt** — Find and fix intentional bugs with a timer
- 👁️ **Visual Tracer** — Step through code line-by-line
- 🏆 **Gamification** — Badges, leaderboard, streak calendar
- 👨‍🏫 **Mentor Panel** — Review submissions, add problems
- 🔧 **Admin Panel** — Manage users, problems, danger zone

## Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Express.js + Sequelize ORM
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt

## Quick Start

### 1. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up PostgreSQL
Create a database called `codesensei`, then configure `backend/.env`:
```
DB_NAME=codesensei
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
```

### 3. Seed the database
```bash
cd backend && node seed.js
```

### 4. Run in development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Demo accounts
| Role | Email | Password |
|------|-------|----------|
| Student | student@codesensei.com | student123 |
| Mentor | mentor@codesensei.com | mentor123 |
| Admin | admin@codesensei.com | admin123 |

## Deploy to Render.com

1. Push to GitHub
2. Create a **PostgreSQL** database on Render (free tier)
3. Create a **Web Service** on Render:
   - Build: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - Start: `cd backend && node server.js`
   - Set env vars: `DATABASE_URL` (from Render DB), `JWT_SECRET`, `NODE_ENV=production`
4. Run seed: `cd backend && node seed.js` (via Render shell)
