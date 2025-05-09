# Gym Class Scheduling and Membership Management System

A complete backend API for managing gym classes, trainers, and member bookings.

## 🏋️‍♂️ Overview

This project is a RESTful API for a Gym Class Scheduling and Membership Management System. It provides endpoints for managing users (admins, trainers, and trainees), scheduling classes, and handling bookings.

## 📊 Relational Diagram

The database consists of three main models with the following relationships:

```
User (ADMIN, TRAINER, TRAINEE)
  ↑
  |
  ↓
ClassSchedule ← created by → User (ADMIN)
  ↑            assigned to → User (TRAINER)
  |
  ↓
Booking ← created by → User (TRAINEE)
```

## 🛠️ Technology Stack

- **Programming Language**: TypeScript
- **Web Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: bcrypt

## 📝 API Endpoints

### Auth

- `POST /api/auth/register` - Register a new trainee
  - Parameters: `{ name, email, password }`
  - Response: `{ success, statusCode, message, data: { id, name, email, role, token } }`

- `POST /api/auth/login` - Login a user
  - Parameters: `{ email, password }`
  - Response: `{ success, statusCode, message, data: { id, name, email, role, token } }`

### Admin

- `POST /api/admin/trainers` - Create a new trainer
  - Parameters: `{ name, email, password }`
  - Response: `{ success, statusCode, message, data: { id, name, email, role } }`

- `GET /api/admin/trainers` - Get all trainers
  - Response: `{ success, statusCode, message, data: [{ id, name, email, role }] }`

- `POST /api/admin/schedules` - Create a class schedule
  - Parameters: `{ trainerId, date, startTime, endTime }`
  - Response: `{ success, statusCode, message, data: { id, trainerId, date, startTime, endTime, traineeCount } }`

- `GET /api/admin/schedules` - Get all schedules
  - Response: `{ success, statusCode, message, data: [{ id, trainerId, date, startTime, endTime, traineeCount }] }`

- `PUT /api/admin/schedules/:id` - Update a schedule
  - Parameters: `{ trainerId }`
  - Response: `{ success, statusCode, message, data: { id, trainerId, date, startTime, endTime, traineeCount } }`

- `DELETE /api/admin/schedules/:id` - Delete a schedule
  - Response: `{ success, statusCode, message, data: null }`

### Trainer

- `GET /api/trainer/schedules` - Get trainer schedules
  - Response: `{ success, statusCode, message, data: [{ id, date, startTime, endTime, traineeCount, bookings }] }`

### Trainee

- `PUT /api/trainee/profile` - Update trainee profile
  - Parameters: `{ name, email, password }`
  - Response: `{ success, statusCode, message, data: { id, name, email, role } }`

- `POST /api/trainee/bookings` - Book a class
  - Parameters: `{ scheduleId }`
  - Response: `{ success, statusCode, message, data: { id, traineeId, scheduleId, createdAt } }`

- `DELETE /api/trainee/bookings/:id` - Cancel a booking
  - Response: `{ success, statusCode, message, data: null }`

- `GET /api/trainee/schedules` - Get available schedules
  - Response: `{ success, statusCode, message, data: [{ id, trainerId, date, startTime, endTime, traineeCount }] }`

- `GET /api/trainee/bookings` - Get trainee bookings
  - Response: `{ success, statusCode, message, data: [{ id, scheduleId, schedule }] }`

## 📚 Database Schema

```prisma
enum UserRole {
  ADMIN
  TRAINER
  TRAINEE
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  trainerSchedules ClassSchedule[] @relation("TrainerSchedules")
  traineeBookings  Booking[]       @relation("TraineeBookings")

  @@map("users")
}

model ClassSchedule {
  id           Int      @id @default(autoincrement())
  trainerId    Int
  date         DateTime
  startTime    DateTime
  endTime      DateTime
  traineeCount Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  trainer  User      @relation("TrainerSchedules", fields: [trainerId], references: [id])
  bookings Booking[] @relation("ScheduleBookings")

  @@map("class_schedules")
}

model Booking {
  id         Int      @id @default(autoincrement())
  traineeId  Int
  scheduleId Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  trainee  User          @relation("TraineeBookings", fields: [traineeId], references: [id])
  schedule ClassSchedule @relation("ScheduleBookings", fields: [scheduleId], references: [id])

  @@map("bookings")
}
```

## 👨‍💻 Admin Credentials

Default admin credentials:

- Email: `admin@admin.admin`
- Password: `admin123`

## 🚀 Local Development

1. Clone the repository
2. Create a `.env` file (use `.env.example` as a template)
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

This project is configured for easy deployment to Vercel:

1. Make sure all dependencies are installed:
   ```bash
   npm install
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy to Vercel:
   ```bash
   vercel
   ```

## 📋 Business Rules

- **Class Scheduling**:
  - Maximum 5 class schedules per day
  - Each class lasts exactly 2 hours
  - Maximum 10 trainees per schedule
  - Only admins can create schedules and assign trainers

- **Booking System**:
  - Trainees can book available schedules (max 10 trainees)
  - Trainees cannot book multiple classes in overlapping time slots
  - Trainees can cancel bookings

- **Roles**:
  - **Admin**: Create/manage trainers, schedule classes, assign trainers
  - **Trainer**: View assigned schedules
  - **Trainee**: Create/manage profile, book/cancel classes