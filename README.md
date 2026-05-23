# MediCare Plus — Hospital Management System

Full-stack hospital management app with **Node.js**, **MongoDB**, and **React (Vite)**. Supports three roles: **Patient**, **Doctor**, and **Admin**.

## Features

### Patient
- Register and login
- Browse doctors by specialization
- Book appointments (date + time slot)
- View and cancel appointments
- Edit profile

### Doctor
- Login to doctor panel
- View schedule and patient details
- Approve / decline / complete appointments
- Manage weekly availability and slots
- Toggle availability

### Admin
- Dashboard with system stats
- Add, edit, and remove doctors
- View all patients
- Manage all appointments

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express, Mongoose          |
| Database | MongoDB                             |
| Frontend | React 18, Vite, React Router, Axios |
| Auth     | JWT + role-based access             |

## Prerequisites

1. **Node.js** 18+ — [nodejs.org](https://nodejs.org)
2. **MongoDB** — one of:
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local), or
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud cluster)

## Quick Start

### 1. Install dependencies

```bash
cd hospital-management
npm run install:all
```

Or separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend

Copy the example env file and edit if needed:

```bash
cd backend
copy .env.example .env
```

Default `backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=hospital_super_secret_jwt_key_2024
PORT=5000
```

For **MongoDB Atlas**, set `MONGO_URI` to your connection string.

### 3. Start MongoDB (local)

Ensure MongoDB is running on `localhost:27017` before starting the backend.

### 4. Run the app

From the project root:

```bash
npm install
npm run dev
```

This starts:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:5173

Or run in two terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

## Demo Accounts

Seeded on first successful DB connection:

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@hospital.com  | admin123    |
| Doctor  | sarah@hospital.com  | doctor123   |
| Patient | patient@demo.com    | patient123  |

Use **Quick Login** buttons on the login page.

## API Overview

| Method | Endpoint                    | Access        |
|--------|-----------------------------|---------------|
| POST   | `/api/auth/register`        | Public        |
| POST   | `/api/auth/login`           | Public        |
| GET    | `/api/doctors`              | Public        |
| POST   | `/api/appointments`         | Patient       |
| GET    | `/api/appointments/my`      | Patient       |
| GET    | `/api/appointments/doctor`  | Doctor        |
| GET    | `/api/admin/stats`          | Admin         |

## Project Structure

```
hospital-management/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── services/api.js
└── package.json
```

## Production Build

```bash
cd frontend && npm run build
cd ../backend && npm start
```

Serve the `frontend/dist` folder with any static host and point API calls to your backend URL (update Vite proxy or `api.js` baseURL).

## Troubleshooting

- **MongoDB connection error** — Start MongoDB service or fix `MONGO_URI` in `backend/.env`.
- **Port in use** — Change `PORT` in `.env` or stop the other process.
- **CORS issues** — Backend allows `http://localhost:5173` by default.
