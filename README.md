# Gym Class Scheduling and Membership Management System

A complete backend API for managing gym classes, trainers, and member bookings.

## 📑 Table of Contents

- [🏋️‍♂️ Overview](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#%EF%B8%8F%EF%B8%8F-overview)
- [📊 Relational Diagram](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#-relational-diagram)
- [🛠️ Technology Stack](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#%EF%B8%8F-technology-stack)
- [📝 API Endpoints](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#-api-endpoints)
  - [🔐 Auth Endpoints](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#-auth-endpoints)
  - [🛠️ Admin Endpoints](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#%EF%B8%8F-admin-endpoints)
  - [🏋️ Trainer Endpoints](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#%EF%B8%8F-trainer-endpoints)
  - [🧘 Trainee Endpoints](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#-trainee-endpoints)
- [📌 Environment Variables](https://github.com/abuabddullah/gymclass-prisma-express-postgresql#-environment-variables)
- [📚 Database Schema](#️️️️️️📚-database-schema)
- [👨‍💻 Admin Credentials](#️️️️️️👨‍💻-admin-credentials)
- [🚀 Local Development](#️️️️️️🚀-local-development)
- [🔗 Links](#️️️️️️link-)
- [🙏 Regards](#️️️️️️regards)


## 🏋️‍♂️ Overview

The Gym Class Scheduling and Membership Management System is a backend API solution built to manage the daily operations of a gym with clarity, role separation, and strict business logic enforcement. Developed using Node.js, Express, and TypeScript, and powered by a PostgreSQL database managed through Prisma ORM, the system facilitates streamlined management of users, classes, and bookings. It defines three primary user roles: Admins, Trainers, and Trainees, each with controlled access and distinct capabilities. Admins have the authority to register trainers, create and manage class schedules, and assign trainers to scheduled slots, while ensuring business rules are strictly followed—most notably, a maximum of five class schedules per day, with each class lasting exactly two hours. Trainers can only view their assigned classes and are not permitted to alter schedules or trainee information. Trainees, on the other hand, can register, manage their profiles, browse available classes, and make or cancel bookings, provided the selected class does not exceed its maximum capacity of ten trainees or overlap with another booking by the same user. The system prevents overbooking by rejecting further reservations once the trainee limit is reached and enforces a no double-booking rule within the same time slot. JWT-based authentication ensures secure access to endpoints, and Zod-based validation supports robust request handling. Passwords are securely stored using bcrypt hashing, and detailed error messages are returned for unauthorized access, booking conflicts, and validation failures. This system not only simplifies the daily scheduling and membership process but also guarantees a consistent and organized approach to managing gym operations, making it a practical and scalable solution for real-world fitness centers.

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

### 📌 Environment Variables (if use <a href="https://github.com/abuabddullah/gymclass-prisma-express-postgresql/blob/main/gymclass.postman_collection.json">gymclass.postman_collection.json</a> file)

| Variable          | Description                                       |
|-------------------|---------------------------------------------------|
| `{{BASE_URL}}`     | Base URL for the API (e.g. `http://localhost:5000`) |
| `{{ADMIN_TOKEN}}`  | Bearer token for admin authentication             |
| `{{TRAINER_TOKEN}}`| Bearer token for trainer authentication           |
| `{{TRAINEE_TOKEN}}`| Bearer token for trainee authentication           |
```
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
```
    git clone https://github.com/abuabddullah/gymclass-prisma-express-postgresql.git
```
2. enter into gymclass-prisma-express-postgresql folder
```
    cd gymclass-prisma-express-postgresql
```
3. Create a `.env` file (though i didn't ignore .env). put bellow valuse
```
    # Database Connection
    DATABASE_URL=postgresql:###############put your valudes#################=require

    # Node Environment
    NODE_ENV=development

    # JWT Secret
    JWT_SECRET=sM9F2u+#######################you secret###########=
    JWT_EXPIRES_IN=7d

    # Server
    PORT=5000
```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
6. Run database migrations:
   ```bash
   npm run prisma:migrate
```
6.2 + 6.3  if use my db do bellow steps(optional):
   ```bash
   √ We need to reset the "public" schema at "ep-lively-brook-a4g1nxmk-pooler.us-east-1.aws.neon.tech" Do you want to continue? All data will be lost. ... **yes**

    ? Enter a name for the new migration: » **gymclassjt**
```
   
7. Start the development server:
   ```bash
   npm run dev
   ```


## Link : 
* Live link : <a target="_blank" href="https://gymclass-server.vercel.app/">https://gymclass-server.vercel.app/</a>
* github link : <a target="_blank" href="https://github.com/abuabddullah/gymclass-prisma-express-postgresql">https://github.com/abuabddullah/gymclass-prisma-express-postgresql</a>


### Regards
Asif A Owadud