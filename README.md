# STMS — Sports Training Management System

ระบบจัดการสถาบันกีฬา พัฒนาด้วย Next.js รองรับ 3 roles: **Admin**, **Coach**, **Student**

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js, React, Tailwind CSS, Recharts, Framer Motion |
| Backend | Next.js API Routes, Prisma ORM |
| Relational DB | MySQL 8 (via Docker) |
| NoSQL DB | MongoDB 7 (via Docker) |
| Auth | JWT (7 วัน) |

---

## การใช้งานฐานข้อมูล

### MySQL — ข้อมูลหลักของระบบ
เก็บข้อมูลที่มีความสัมพันธ์กัน ได้แก่ Users, Courses, Schedules, Enrollments, Payments, Attendance และ FinanceRecords รองรับ CRUD ครบทุก operation

### MongoDB — Audit Logs
เก็บ log การกระทำต่างๆ ในระบบ เช่น การ login, การ approve payment, การเปลี่ยนแปลงข้อมูล เพื่อใช้ตรวจสอบย้อนหลัง รองรับ CRUD ครบทุก operation

---

## โครงสร้างโปรเจค

```
stms-system/
├── backend/          → Next.js API Routes + Prisma ORM (port 4000)
│   ├── prisma/       → Schema + Migrations + Seed
│   └── src/
│       ├── app/api/  → REST API endpoints
│       └── lib/      → Prisma, MongoDB, JWT, Auth helpers
├── frontend/         → Next.js UI (port 3000)
│   └── src/
│       ├── app/      → Pages แยกตาม role
│       └── components/
└── docker-compose.yml → MySQL + MongoDB
```

---

## วิธี Setup และรัน

### Requirements
- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone โปรเจค

```bash
git clone https://github.com/PhidPhew/sports-team-management-system
cd sports-team-management-system
```

### 2. เริ่ม Database ด้วย Docker

```bash
docker compose up -d
```

รอประมาณ 15 วินาทีให้ MySQL และ MongoDB พร้อมใช้งาน

### 3. ตั้งค่า Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

> Backend รันที่ http://localhost:4000

### 4. ตั้งค่า Frontend (เปิด terminal ใหม่)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

> Frontend รันที่ http://localhost:3000

### 5. เปิดเบราว์เซอร์

```
http://localhost:3000
```

---

## Default Account

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stms.com | 123456 |

> Coach และ Student สามารถสร้างได้จากหน้า Admin → Users

---

## Roles และความสามารถ

| Role | URL | ความสามารถ |
|------|-----|-----------|
| **Admin** | `/admin` | จัดการ Users, Courses, Coach, Finance, Approve Payment |
| **Coach** | `/coach` | ดู Schedule, Check Attendance, ดู Income Summary |
| **Student** | `/student` | ดู Courses, Enroll, อัปโหลด Slip, ดู Attendance |

---

## Flow การ Enroll และชำระเงิน

```
1. Student กด Enroll Course
         ↓
2. Payment ถูกสร้างอัตโนมัติ (status: PENDING)
         ↓
3. Student อัปโหลด Slip
         ↓
4. Admin กด Approve
         ↓
5. ระบบสร้าง FinanceRecord อัตโนมัติ 2 รายการ
   ├── Revenue: เต็มจำนวน (ค่าคอร์ส)
   └── Expense: 70% (Coach Payout)
```

---

## API Endpoints

### Auth
| Method | Endpoint | คำอธิบาย |
|--------|----------|---------|
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/register` | สมัครสมาชิก |
| GET | `/api/auth/me` | ดูข้อมูลตัวเอง |

### Admin
| Method | Endpoint | คำอธิบาย |
|--------|----------|---------|
| GET/POST/PATCH/DELETE | `/api/admin/users` | จัดการ Users |
| GET/POST/PATCH/DELETE | `/api/admin/courses` | จัดการ Courses |
| GET/POST | `/api/admin/coaches` | จัดการ Coaches |
| GET | `/api/admin/finance/payments` | ดู Payments ทั้งหมด |
| POST | `/api/admin/finance/payments/:id/approve` | Approve Payment |
| GET/POST | `/api/admin/finance/records` | Finance Records |
| GET | `/api/admin/finance/summary` | Summary + Chart Data |

### Coach
| Method | Endpoint | คำอธิบาย |
|--------|----------|---------|
| GET | `/api/coach/schedule` | ดู Schedule 30 วัน |
| GET/POST | `/api/coach/attendance` | Check Attendance |
| GET | `/api/coach/summary` | Income + Course Summary |

### Student
| Method | Endpoint | คำอธิบาย |
|--------|----------|---------|
| GET | `/api/student/courses` | ดู Courses ทั้งหมด |
| POST | `/api/student/courses/:id/enroll` | Enroll Course |
| GET | `/api/student/payments` | ดู Payments |
| GET | `/api/student/attendance` | ดู Attendance |
| GET | `/api/student/dashboard` | Dashboard ข้อมูลรวม |

---

## Database Schema (MySQL)

```
User (ADMIN / COACH / STUDENT)
  ├── CoachProfile
  ├── Enrollment → Course
  ├── Payment → Course
  └── Attendance → Schedule

Course
  ├── Schedule (วัน/เวลาเรียน)
  └── Enrollment

FinanceRecord (revenue / expense)
```

## MongoDB Document Structure (Audit Log)

```json
{
  "action": "APPROVE_PAYMENT",
  "performedBy": { "userId": 1, "role": "ADMIN" },
  "targetResource": { "type": "Payment", "id": 5 },
  "details": { "amount": 999, "courseId": 2 },
  "timestamp": "2026-03-08T10:00:00Z"
}
```