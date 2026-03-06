# STMS — Sports Training Management System

ระบบจัดการการฝึกสอนกีฬา รองรับ Admin, Coach, และ Student

## 📐 Database Design

### ทำไมต้องใช้ 2 Database?

| Database | ใช้เพื่ออะไร | เหตุผล |
|----------|------------|--------|
| **MySQL** | ข้อมูลหลัก (Users, Courses, Enrollments, Payments) | ต้องการ ACID, Foreign Keys, Data Consistency |
| **MongoDB** | Audit Logs | Write-heavy, Schema-flexible, ไม่ต้องการ Transaction |

### MySQL Schema (Prisma)

```
User         — ข้อมูล User ทุก Role (ADMIN / COACH / STUDENT)
Course       — ข้อมูลคอร์ส, ราคา, จำนวนครั้ง, หมดอายุ
Enrollment   — User <-> Course, เก็บ remainingSessions
Attendance   — บันทึกการเช็คชื่อแต่ละครั้ง
Payment      — ประวัติการจ่ายเงิน + สลิป
Schedule     — ตารางสอนของ Coach
```

ทุกตารางมี `deletedAt DateTime?` เพื่อรองรับ **Soft Delete**

### MongoDB Schema (AuditLog)

```json
{
  "action": "update",
  "collection": "enrollments",
  "documentId": "42",
  "changedBy": "3",
  "changedByRole": "COACH",
  "oldValue": { "remainingSessions": 5 },
  "newValue": { "remainingSessions": 4 },
  "description": "Student มานะ deducted 1 credit by Coach สมชาย",
  "timestamp": "2026-03-01T10:30:00.000Z"
}
```

---

## 🚀 วิธี Setup และรันโปรเจค

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. ติดตั้ง Dependencies

```bash
# Frontend
cd frontend-stms-ninee
npm install

# Backend
cd ../stms-backend
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cd stms-backend
cp .env.example .env.local
# แก้ไขค่าใน .env.local ตามต้องการ
```

### 4. รัน Docker (MySQL + MongoDB)

```bash
# ที่ root ของโปรเจค (ที่มีไฟล์ docker-compose.yml)
docker-compose up -d

# ตรวจสอบว่า Container ทำงานแล้ว
docker-compose ps
```

รอให้ทั้งสอง Container แสดงสถานะ `healthy` ก่อนทำขั้นตอนต่อไป

### 5. Push Database Schema

```bash
cd stms-backend
npx prisma db push
```

### 6. (Optional) Seed ข้อมูลตัวอย่าง

```bash
npx ts-node prisma/seed.ts
```

จะสร้าง User ตัวอย่าง:
- **Admin**: `admin` / `admin1234`
- **Coach**: `coach_a` / `coach1234`
- **Student**: `student_01` / `student1234`

### 7. รัน Development Server

```bash
# Terminal 1 — Backend (Next.js API)
cd stms-backend
npm run dev   # http://localhost:3001

# Terminal 2 — Frontend
cd frontend-stms-ninee
npm run dev   # http://localhost:3000
```

---

## 🔌 API Endpoints (Auth)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | สมัครสมาชิก | ❌ Public |
| `POST` | `/api/auth/login` | เข้าสู่ระบบ (set Cookie) | ❌ Public |
| `GET` | `/api/auth/me` | ดูข้อมูล User ปัจจุบัน | ✅ Required |
| `DELETE` | `/api/auth/me` | Logout (ลบ Cookie) | ✅ Required |

### ตัวอย่าง Request

**Register**
```json
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

**Login**
```json
POST /api/auth/login
{
  "username": "john_doe",
  "password": "password123"
}
```

---

## 🔐 RBAC — Role Permission

| Path | ADMIN | COACH | STUDENT |
|------|-------|-------|---------|
| `/admin/*` | ✅ | ❌ | ❌ |
| `/coach/*` | ✅ | ✅ | ❌ |
| `/student/*` | ✅ | ❌ | ✅ |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **MySQL ORM**: Prisma
- **MongoDB ODM**: Mongoose
- **Auth**: JWT (jose) + HttpOnly Cookie
- **Password Hash**: bcryptjs
- **Styling**: Tailwind CSS

---

## 📋 ข้อกำหนดที่ปฏิบัติตาม (Checklist)

- [x] MySQL — ข้อมูลหลัก (Relational)
- [x] MongoDB — Audit Logs (NoSQL)
- [x] CRUD ครบทั้ง 2 Database
- [x] Soft Delete (ทุกตารางมี `deletedAt`)
- [x] Docker Compose
- [x] README.md
- [x] Authentication (JWT + Cookie)
- [x] RBAC Middleware
