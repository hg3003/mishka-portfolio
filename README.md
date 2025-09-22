# Architecture Portfolio System

A modern, database-backed portfolio and CV management system for architects. It cleanly separates data from presentation so the same content powers the web UI and print-ready PDFs.

- Enter once, reuse everywhere (web and PDF)
- Swiss minimal design aesthetic (Helvetica, black/white, clean grids)

## Features

Completed
- Project Management: create, edit, filter/sort; rich metadata (RIBA stages, software, skills)
- Asset Management: upload images/PDFs, automatic optimization + thumbnails, reorder, set hero
- CV Management: Personal Info, Experience, Education, Skills (full CRUD with live preview)
- Dashboard: key stats from the database
- API: Type-safe routes with Zod validation and consistent responses

In Progress / Next
- Portfolio Builder (wizard to select projects/assets, SAMPLE vs FULL)
- PDF Generation (A4 Swiss Minimal template, print-ready)

## Tech Stack

- Backend: Fastify 5 + TypeScript + Prisma 6 + SQLite, Zod, Sharp
- Frontend: React 18 + Vite 5 + TypeScript + Tailwind CSS (Swiss design)
- Data fetching: @tanstack/react-query v5
- Forms/validation: react-hook-form + zod
- PDF (planned): @react-pdf/renderer, @react-pdf/unicode-properties
- Electron-aware: API URL and upload paths adapt in Electron environments

## Project Structure

```
architecture-portfolio-system/
├── backend/                 # Fastify API server (Prisma, uploads, validation)
│   ├── prisma/              # Prisma schema + seed
│   └── src/                 # Routes, schemas, services, utils
├── frontend/                # React application (Tailwind Swiss system)
│   └── src/                 # Pages, components, hooks, services, lib
├── handover-status.txt      # Original continuation guide
├── status-latest.txt        # Updated continuation guide
├── roadmap-status-file.md   # Current roadmap & status (living doc)
└── README.md                # This file
```

Related docs
- Backend details: backend/README.md
- Frontend details: frontend/README.md

## Getting Started

Prerequisites
- Node.js 18+
- npm

1) Backend: install, migrate, seed, run
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed   # optional sample data
npm run dev           # http://localhost:3001
```

2) Frontend: install and run
```bash
cd ../frontend
npm install
npm run dev           # http://localhost:5173
```

3) Open the app at http://localhost:5173

## Environment Variables

Backend (.env)
```
PORT=3001
HOST=localhost
DATABASE_URL="file:./dev.db"
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

Frontend (.env or .env.local)
```
VITE_API_URL=http://localhost:3001
```
Notes
- If VITE_API_URL is omitted, the frontend auto-detects: dev → http://localhost:3001, prod/Electron → http://127.0.0.1:3001.
- Backend is Electron-aware and adjusts upload paths and host binding when packaged.

## Database Management

- Open Prisma Studio: npm run prisma:studio
- Create migration: npm run prisma:migrate
- Reset (destructive): npm run prisma:reset


## Design System (Swiss Minimal)

- Typography: Helvetica Neue stack; tight tracking; bold headers
- Colors: swiss-black/white/gray[100–900] (Tailwind theme)
- Components (Tailwind @layer):
  - .swiss-button, .swiss-button-outline
  - .swiss-card
  - .swiss-input, .swiss-label
  - .swiss-grid, .swiss-container
- Print Tokens: a4-width/height, a3-width/height for PDF/print layouts

## PDF Generation

DIN formats
- A4 (210 × 297 mm): standard portfolio (primary target)
- A3 (297 × 420 mm): presentations

Planned implementation
- Frontend templates with React PDF (Swiss Minimal: cover, TOC, projects, CV)
- Backend pdfGenerator service: create file, store path, expose download

## Development Phases and Status

- [x] Phase 1: Foundation Setup
- [x] Phase 2: Core Backend (uploads, assets, portfolios)
- [x] Phase 3: Frontend Foundation (React/Tailwind/Query)
- [x] Phase 4: Project Management (list/detail/gallery)
- [x] Phase 5: Project Forms (Create/Edit with Zod)
- [x] Phase 6: CV Management UI (tabs, CRUD, preview)
- [x] Phase 7: Portfolio Builder (wizard, list/detail, duplicate/delete)


## License

Private project — All rights reserved