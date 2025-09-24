# Samsung Eco Rewards (Waste-Management) — MongoDB version

Full-stack app:
- Frontend: Vite + React + Tailwind CSS
- Backend: Node.js + Express + MongoDB (Mongoose)
- Mapping: Leaflet
- Anonymous user tracked via `localStorage` UID

## Prerequisites
- Node.js >= 18
- A MongoDB connection string (Atlas or local)

## Setup

1) Install dependencies
```bash
npm install
# or install each
npm install --prefix client
npm install --prefix server
```

2) Configure server environment
```bash
cp server/.env.example server/.env
# Edit server/.env and set MONGODB_URI (Atlas or local)
```

3) Run in development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API proxied at: http://localhost:5173/api -> http://localhost:3001

## API Overview
- GET /api/health
- GET /api/users/:uid
- POST /api/users/:uid/award { amount, reason?, serial? }
- POST /api/users/:uid/redeem { cost, name }

The frontend stores a `uid` in `localStorage` and uses it to manage the user's points.

## Project Structure
```
.
├── client                  # Vite + React + Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/...
├── server                  # Express + MongoDB
│   ├── package.json
│   ├── .env.example
│   └── src/...
├── package.json            # root (runs both client + server)
└── README.md
```