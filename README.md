# ToxicWatch

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

ToxicWatch is a full-stack platform for visualizing and analyzing EPA Toxic Release Inventory (TRI) data. It delivers real-time, map-based insights into industrial chemical releases, with AI-powered analysis and a modern, responsive UI.

**Key Result:** 300x faster data access (30s → ~100ms) by migrating from EPA API to a custom Node.js + MongoDB backend.

---

## Features
- Interactive map of TRI facilities (2019-2022)
- Fast search, filtering, and facility detail views
- AI-powered health and safety Q&A (Google Gemini)
- Aggregated stats and historical trends

## Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Pigeon Maps
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose
- **AI:** Google Gemini API

## Architecture
```
ToxicWatch/
├── app/         # Next.js frontend
├── api-server/  # Node.js/Express backend
│   ├── models/  # Mongoose schemas
│   └── import-data.js  # EPA data importer
└── components/, lib/, public/, etc.
```

## Setup
1. **Clone & Install**
   ```bash
   git clone https://github.com/tmtran612/ToxicWatch.git
   cd ToxicWatch && pnpm install
   cd api-server && npm install
   ```
2. **Configure Envs**
   - Copy `.env.example` → `.env.local` (frontend)
   - Copy `api-server/.env.example` → `api-server/.env` (backend)
3. **Run**
   ```bash
   # Terminal 1
   cd api-server && npm start
   # Terminal 2
   pnpm dev
   ```
   App: http://localhost:3000

4. **(Optional) Import Data**
   ```bash
   cd api-server && node import-data.js
   ```

## API (Backend)
- `GET /api/facilities` — List/search facilities
- `GET /api/facilities/:facilityYearId` — Facility details
- `GET /api/facilities/near/:lng/:lat` — Nearby facilities
- `GET /api/stats` — Aggregated stats
- `GET /api/years` — Available years
- `GET /api/search` — Name/company search

## Achievements
- 1,250+ facilities, 10,000+ chemical records (2019-2022)
- Sub-100ms API response times (geospatial, search, stats)
- Modern, maintainable, and scalable codebase

## License
MIT
