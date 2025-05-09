# Gym Class Scheduling and Membership Management System

A complete backend API for managing gym classes, trainers, and member bookings.

## 🏋️‍♂️ Overview

This project is a RESTful API for a Gym Class Scheduling and Membership Management System. It provides endpoints for managing users (admins, trainers, and trainees), scheduling classes, and handling bookings.

## 📊 Relational Diagram

The database consists of three main models with the following relationships:

<img src="https://res.cloudinary.com/dglsw3gml/image/upload/v1746790860/portfolio/GYMCLASS-relational-diagram_ebuxuu.png" width="600px"/>

## 🛠️ Technology Stack

- **Programming Language**: Node, Express, TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: bcrypt

## 📝 API Endpoints
- use this <a href="https://github.com/abuabddullah/gymclass-prisma-express-postgresql/blob/main/gymclass.postman_collection.json">gymclass.postman_collection.json</a> file and import it in your **postman** or copy paste from bellow


### 🔐 Auth Endpoints

| # | Method | Endpoint                   | Description                  | Auth Required | Request Body (JSON)                                                                 | Response                      |
|---|--------|----------------------------|------------------------------|---------------|-------------------------------------------------------------------------------------|-------------------------------|
| 1 | POST   | `/api/auth/register`       | Register a new user          | ❌ No          | `{ "name": "John", "email": "john@example.com", "password": "password123" }`        | `201 Created` / `400 Bad Request` |
| 2 | POST   | `/api/auth/login`          | Login and receive token      | ❌ No          | `{ "email": "john@example.com", "password": "password123" }`                        | `200 OK` / `401 Unauthorized`     |

---

### 🛠️ Admin Endpoints

> All Admin routes require: `Authorization: Bearer {{ADMIN_TOKEN}}`

| # | Method | Endpoint                            | Description                  | Request Body (JSON)                                                                                                  | Response                            |
|---|--------|-------------------------------------|------------------------------|----------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| 3 | POST   | `/api/admin/trainers`              | Create a new trainer         | `{ "name": "Trainer One", "email": "trainer@example.com", "password": "trainer123" }`                                | `201 Created` / `409 Conflict`      |
| 4 | GET    | `/api/admin/trainers`              | Get all trainers             | _None_                                                                                                               | `200 OK`                            |
| 5 | POST   | `/api/admin/schedules`             | Create a schedule            | `{ "trainerId": 1, "date": "2025-05-01", "startTime": "2025-05-01T10:00:00Z", "endTime": "2025-05-01T12:00:00Z" }`   | `201 Created` / `400 Bad Request`   |
| 6 | PUT    | `/api/admin/schedules/{id}`        | Update schedule              | `{ "trainerId": 2 }`                                                                                                 | `200 OK` / `404 Not Found`          |
| 7 | DELETE | `/api/admin/schedules/{id}`        | Delete schedule              | _None_                                                                                                               | `204 No Content` / `404 Not Found`  |

---

### 🏋️ Trainer Endpoints

> All Trainer routes require: `Authorization: Bearer {{TRAINER_TOKEN}}`

| # | Method | Endpoint                   | Description            | Request Body | Response   |
|---|--------|----------------------------|------------------------|--------------|------------|
| 8 | GET    | `/api/trainer/schedules`   | Get trainer schedules  | _None_       | `200 OK`   |

---

### 🧘 Trainee Endpoints

> All Trainee routes require: `Authorization: Bearer {{TRAINEE_TOKEN}}`

| #  | Method | Endpoint                              | Description                | Request Body (JSON)                                                                 | Response                         |
|----|--------|---------------------------------------|----------------------------|-------------------------------------------------------------------------------------|----------------------------------|
| 9  | PUT    | `/api/trainee/profile`                | Update profile             | `{ "name": "Updated Name", "email": "updated@example.com", "password": "newpassword123" }` | `200 OK` / `400 Bad Request`     |
| 10 | POST   | `/api/trainee/bookings`               | Book a class               | `{ "scheduleId": 1 }`                                                               | `201 Created` / `409 Conflict`   |
| 11 | DELETE | `/api/trainee/bookings/{id}`          | Cancel a booking           | _None_                                                                              | `204 No Content` / `404 Not Found` |
| 12 | GET    | `/api/trainee/schedules`              | View available schedules   | _None_                                                                              | `200 OK`                         |
| 13 | GET    | `/api/trainee/bookings`               | View my bookings           | _None_                                                                              | `200 OK`                         |

---

### 📌 Environment Variables

| Variable          | Description                                       |
|-------------------|---------------------------------------------------|
| `{{BASE_URL}}`     | Base URL for the API (e.g. `http://localhost:5000`) |
| `{{ADMIN_TOKEN}}`  | Bearer token for admin authentication             |
| `{{TRAINER_TOKEN}}`| Bearer token for trainer authentication           |
| `{{TRAINEE_TOKEN}}`| Bearer token for trainee authentication           |
```



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
- Password: `000000`

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


## Link : 
* Live link : <a target="_blank" href="https://gymclass-server.vercel.app/">https://gymclass-server.vercel.app/</a>
* github link : <a target="_blank" href="https://github.com/abuabddullah/gymclass-prisma-express-postgresql">https://github.com/abuabddullah/gymclass-prisma-express-postgresql</a>


### Regards
Asif A Owadud