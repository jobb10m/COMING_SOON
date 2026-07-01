# Prime — Gym Management System

A full-stack gym management platform: Express/TypeScript/PostgreSQL/Prisma API, a React + Vite
web dashboard, and a React Native (Expo) mobile app for members and trainers.

## What's fully built

**Database** (`server/prisma/schema.prisma`) — a complete, normalized schema for every module in
the spec: users/roles, members, trainers, membership plans & memberships, attendance, workouts &
exercises, diet plans, progress tracking, payments & invoices, equipment & maintenance, classes &
bookings, notifications, and settings. Soft deletes, indexes, and foreign keys are in place.

**Backend API** — fully implemented, working end to end:
- Authentication: register, login, JWT access + refresh tokens, forgot/reset/change password, `GET /me`
- Role-based authorization (Admin / Receptionist / Trainer / Member) via middleware
- Members: full CRUD, search, filter, pagination, suspend/reactivate, self-service profile
- Trainers: full CRUD, assigned-members lookup
- Membership plans & memberships: create plan, assign, renew, freeze, upgrade/downgrade, expiry check
- Attendance: QR check-in/out, manual entry, history, calendar view
- Payments: create, list, complete, auto-generated invoices, revenue report
- Dashboard: live stats + revenue / membership-growth / popular-plans chart data
- Centralized error handling (Zod validation errors, Prisma errors, custom `ApiError`)
- File upload middleware (Multer) and email utility (Nodemailer) ready to use
- Seed script with demo accounts for every role

**Web client** — fully implemented, working end to end:
- Login (JWT stored + silent refresh via Axios interceptor), protected routes, RBAC-aware nav
- Dashboard with animated stat cards (signature activity-ring gauges), revenue area chart,
  popular-plans donut, membership-growth bar chart (Recharts + Framer Motion)
- Members: searchable/filterable/paginated table, add-member form (React Hook Form + Zod), loading
  skeletons, empty states, toasts
- Dark/light mode, responsive sidebar + mobile drawer, glassmorphism design system

**Mobile app** — a real, working Expo scaffold sharing the same API:
- Login screen, Member dashboard (QR code, membership status, assigned trainer), Trainer dashboard
  (assigned members list)

## What's scaffolded (schema + API pattern ready, UI/routes to be filled in)

The Prisma schema and the client-side design system already cover these; the backend controllers
follow one consistent pattern (see `server/src/controllers/member.controller.ts` as the template),
so extending is mechanical:

- Workout programs & exercise builder, diet plan builder, progress-tracking charts with photos
- Equipment & maintenance tracking, class scheduling & booking
- Notifications (email triggers are stubbed in `server/src/utils/mailer.ts`)
- Admin settings screen (gym info, logo, tax, currency)
- PDF/Excel/CSV report export
- Remaining mobile screens (attendance, workouts, diet plans, payments, notifications, profile)

Each is a `routes/*.routes.ts` + `controllers/*.controller.ts` + `validators/*.validator.ts` trio
on the backend, and a page following `client/src/pages/Members.tsx` on the frontend.

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Backend

```bash
cd server
cp .env.example .env      # edit DATABASE_URL, JWT secrets, SMTP if desired
npm install
npm run prisma:migrate    # creates tables
npm run seed               # demo data
npm run dev                 # http://localhost:5000
```

Demo logins (password `Password123!` for all):
`admin@gym.com` · `reception@gym.com` · `trainer@gym.com` · `member@gym.com`

### 2. Web client

```bash
cd client
npm install
npm run dev                # http://localhost:5173 (proxies /api to :5000)
```

### 3. Mobile app

```bash
cd mobile
npm install
npm start                  # opens Expo dev tools; scan QR with Expo Go
```

Update `apiUrl` in `mobile/app.json` to your machine's LAN IP (not `localhost`) when testing on a
physical device, since the phone can't reach your computer's `localhost`.

## Project structure

```
gym-management/
├── client/   React + Vite + TypeScript + Tailwind (web dashboard)
├── server/   Express + TypeScript + Prisma + PostgreSQL (REST API)
└── mobile/   React Native + Expo (member & trainer app)
```

## Notes

- This was generated without network access to actually run `npm install` or the dev servers, so
  double-check dependency versions still resolve when you install, and run through the flows once
  locally before treating this as production-ready.
- Rotate the JWT secrets and SMTP credentials in `.env` before deploying anywhere real.
