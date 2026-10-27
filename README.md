# Grand Horizon Hotel — Hotel Management System

A full-stack MERN hotel management system: a polished public booking site for guests plus a
role-based staff dashboard that runs the whole operation — rooms, bookings, guests, housekeeping,
maintenance, restaurant, billing and reporting.

## Features

**Public site**
- Landing page with featured rooms, amenities and a mobile-first responsive layout
- Explore all rooms (`/all-rooms`) with search, type/status/floor filters, price range and sorting
- Room detail pages with image galleries and self-service booking (with date-overlap protection)
- Dark mode, smooth reveal animations, toast notifications

**Staff dashboard (RBAC)**
- 10 roles — superadmin, hoteladmin, frontdesk, housekeeper, maintenance, accountant,
  restaurant manager, chef, security staff, guest — each mapped to a granular permissions
  document (module × action) editable from the Permissions page
- Modules: bookings (check-in/check-out lifecycle), rooms, guests, users, roles, permissions,
  housekeeping, maintenance, restaurant orders, menu, billing, payments, reports, audit logs
- Notifications for booking and billing events

**Security**
- Short-lived JWT access token (15 min, httpOnly cookie) + rotating refresh token
  (7 days, separate secret, dedicated `/api/auth/refresh` endpoint) with a silent client-side
  refresh-and-retry interceptor
- bcrypt password hashing, generic login errors, email rate limiting, forgot/reset password
  via SMTP with expiring one-time tokens
- Helmet security headers, server-side pagination on public endpoints, per-role permission
  guards, audit logging on sensitive actions
- 26 automated API tests (`vitest` + `supertest` + in-memory MongoDB)

## Tech stack

| Layer    | Tech |
| -------- | ---- |
| Frontend | React 19, Vite, Tailwind CSS 4, shadcn-style UI (base-ui), Redux Toolkit, React Router, Formik + Yup, react-hot-toast, lucide-react |
| Backend  | Node.js, Express, Mongoose, jose-free JWT (jsonwebtoken), helmet, express-rate-limit, morgan, nodemailer |
| Database | MongoDB Atlas |
| Storage  | Cloudinary (room images) |
| Testing  | Vitest, Supertest, mongodb-memory-server |

## Project structure

```
Client/   React frontend (Vite)
Server/   Express API
```

The server follows a modular structure (`src/modules/<name>/{controller,routes,service,repository,model}`)
with shared middleware for auth, permissions, audit logging, rate limiting and error handling.

## Getting started

Prerequisites: **Node.js 18+** and a **MongoDB** database (local or Atlas).

### 1. API server

```bash
cd Server
npm install
cp .env.example .env    # fill in the values
npm run seed            # creates roles, permission doc, superadmin + demo rooms
npm run dev             # API on http://localhost:8000
```

> ⚠️ `npm run seed` is **idempotent but destructive for rooms**: it wipes existing rooms and
> their linked data, then re-creates the demo lineup and re-uploads fresh room images to
> your Cloudinary account. It still creates the SuperAdmin from `SUPERADMIN_EMAIL` /
> `SUPERADMIN_PASSWORD`, so it's safe to run once on a fresh database.

### 2. Client

```bash
cd Client
npm install
cp .env.example .env    # VITE_BASE_URL=http://localhost:8000/api
npm run dev             # app on http://localhost:5173
```

Log into the dashboard with the seeded SuperAdmin credentials.

## Environment variables

All real env files are gitignored — `.env.example` in each folder is the template.

**Server**

| Variable | Description |
| -------- | ----------- |
| `PORT` | API port (default 8000) |
| `MONGO_URI` | MongoDB connection string |
| `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` | Credentials created by `npm run seed` |
| `JWT_SECRET` | Signs access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime (default `15m`) |
| `JWT_REFRESH_SECRET` | Separate secret signing refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (default `7d`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Room image uploads |
| `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_SENDER` | SMTP for reset-password emails (use an app password with Gmail) |
| `CLIENT_URL` | Public frontend URL — used in CORS allowlist and password-reset links |

**Client**

| Variable | Description |
| -------- | ----------- |
| `VITE_BASE_URL` | API base URL, e.g. `http://localhost:8000/api` (must be set at build time) |

## Testing

```bash
cd Server
npm test
```

Runs three suites (auth, rooms, bookings) against an in-memory MongoDB — no real database
or network access is touched. Covers login/refresh-cookie lifetimes, RBAC rejections,
room CRUD + public pagination limits, and the booking date-overlap conflict.

## Deployment

Backend → **Render** (or any Node host), frontend → **Vercel/Netlify/Render static**, database →
your existing MongoDB Atlas. Nothing in the codebase is provider-specific.

**API (Render)**
- Build command: `npm install` · Start command: `npm start`
- Set all env vars from the table above, **plus `NODE_ENV=production`**
- Set `CLIENT_URL` to the deployed frontend URL (cookies auto-switch to `Secure` + `SameSite=None`)
- Health check path: `/` (or `/health`)
- In Atlas, allow network access from `0.0.0.0/0` (host platforms use dynamic IPs)
- Run `npm run seed` once against the production database to create the SuperAdmin

**Client (Vercel)**
- Build command: `npm run build` · Output dir: `dist`
- Set `VITE_BASE_URL` to the API URL (e.g. `https://your-api.onrender.com/api`) — Vite bakes it in at build time
- Deploy, then update the API's `CLIENT_URL` to the final frontend URL

## License

This project is for learning/portfolio purposes.
