# Evently — Smart Event Registration Portal

A full-stack MERN application for managing events and participant registrations with QR-code tickets, dark mode, CSV export, and an admin dashboard.

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Backend  | Node.js, Express, Mongoose, JWT, bcryptjs        |
| Database | MongoDB (local or Atlas; falls back to in-memory)|
| Features | QR Tickets (qrcode.react), CSV Export, Dark Mode |

---

## Quick Start

### 1. Install dependencies

```bash
# Server
cd "event-portal/server"
npm install

# Client
cd "event-portal/client"
npm install
```

### 2. Configure environment

**Server** — `event-portal/server/.env` (already pre-filled for local dev):
```
MONGODB_URI=mongodb://localhost:27017/event-portal
JWT_SECRET=super_secret_event_portal_key_12345
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

**Client** — `event-portal/client/.env`:
```
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Seed demo data (optional but recommended)

```bash
cd "event-portal/server"
npm run seed
```

This creates:
- **Admin account** → `admin@evently.com` / `admin123`
- **User account**  → `user@evently.com`  / `user1234`
- 8 sample events

### 4. Start the servers

```bash
# Terminal 1 — API server (port 5000)
cd "event-portal/server"
npm run dev

# Terminal 2 — React dev server (port 5173)
cd "event-portal/client"
npm run dev
```

Open **http://localhost:5173**

---

## Features

### Public
- Browse and search upcoming events
- Filter by status (active / completed / cancelled)
- View event details with date, location, and remaining capacity

### Authenticated Users
- Register for events (Standard or VIP pass)
- View all bookings in personal dashboard
- Cancel registrations
- View QR-code entry ticket, download as SVG, or print as PDF

### Admin Dashboard
- Overview with stats (total events, registrations, confirmed attendees)
- Create, edit, and delete events
- Participants directory with search and event filter
- Export registrations to CSV

### UI/UX
- Dark mode toggle (persisted to localStorage)
- Responsive layout (mobile drawer navigation)
- Glassmorphism header, gradient hero sections
- Print-friendly QR ticket modal

---

## API Reference

### Auth
| Method | Endpoint              | Body                          |
|--------|-----------------------|-------------------------------|
| POST   | /api/auth/register    | `{ name, email, password }`   |
| POST   | /api/auth/login       | `{ email, password }`         |

### Events
| Method | Endpoint          | Auth    | Query params              |
|--------|-------------------|---------|---------------------------|
| GET    | /api/events       | —       | `q`, `status`, `from`, `to` |
| GET    | /api/events/:id   | —       | —                         |
| POST   | /api/events       | Admin   | —                         |
| PUT    | /api/events/:id   | Admin   | —                         |
| DELETE | /api/events/:id   | Admin   | —                         |

### Registrations
| Method | Endpoint                      | Auth  |
|--------|-------------------------------|-------|
| POST   | /api/registrations            | User  |
| POST   | /api/registrations/:id/cancel | User  |
| GET    | /api/registrations/me         | User  |
| GET    | /api/registrations            | Admin |

---

## Notes

- The server automatically falls back to an **in-memory MongoDB** if a local MongoDB instance is not running — no setup required for quick demos.
- To promote a user to admin manually: update their `role` field to `"admin"` in MongoDB, or use the seed script.
- Registration uses a **MongoDB transaction** to prevent double-booking and capacity overflows.
