# Sports Academy — Full Stack Project

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js 14 API Routes + Prisma ORM
- **Database**: MySQL 8.0 (via Docker)
- **Audit Logs**: MongoDB 6.0 (via Docker)

## Project Structure

```
sports-academy/
├── frontend/    → Next.js frontend app (port 3000)
├── backend/     → Next.js API backend  (port 4000)
├── database/    → Docker Compose + Prisma schema reference
├── docker-compose.yml
├── .gitignore
├── README.md
└── INTEGRATION_NOTES.md
```

## How to Run Locally

> **Prerequisite**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Start databases

```bash
cd sports-academy
docker-compose up -d
```

### 2. Set up & start backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
# → http://localhost:4000
```

### 3. Start frontend

```bash
cd ../frontend
npm install
npm run dev
# → http://localhost:3000
```

### 4. Open browser

```
http://localhost:3000
```

## Environment Variables

**backend/.env**

```
DATABASE_URL="mysql://stms_user:stms_password@localhost:3306/stms_db"
MONGODB_URI="mongodb://stms_admin:stms_mongo_password@localhost:27017/stms_logs?authSource=admin"
JWT_SECRET="local-dev-secret-do-not-use-in-prod"
PORT=4000
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## API Overview

| Group   | Base Path       | Auth        |
| ------- | --------------- | ----------- |
| Auth    | `/api/auth/`    | None        |
| Admin   | `/api/admin/`   | ADMIN JWT   |
| Coach   | `/api/coach/`   | COACH JWT   |
| Student | `/api/student/` | STUDENT JWT |

See `INTEGRATION_NOTES.md` for the full API reference.

## Roles

| Role    | Default redirect after login |
| ------- | ---------------------------- |
| ADMIN   | `/admin`                     |
| COACH   | `/coach`                     |
| STUDENT | `/student`                   |

## Team

- Frontend Lead: Naravin
- Backend Lead: Achiraya

- Database & Integration Lead: Phidphew
