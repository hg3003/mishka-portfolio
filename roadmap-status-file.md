# Architecture Portfolio System — Roadmap & Status (Current)

Single‑source data platform for an architect’s projects, CV, and portfolios. Data is decoupled from presentation so the same content can power web UI and print‑ready PDFs.

This file summarizes the latest status, what changed recently, and the next steps to finish the deliverable.

---

## Project Summary

- Goal: Database‑backed portfolio and CV system; generate clean, print‑ready portfolios without InDesign lock‑in.
- Audience: Personal use (your girlfriend, architect).
- Key Idea: Enter content once; reuse across layouts/templates (web and PDF).

---

## Tech Stack Overview

- Backend (port 3001)
  - Fastify 5, TypeScript, Prisma 6, SQLite
  - @fastify/multipart (uploads), @fastify/static (serve uploads)
  - Sharp (image optimization + thumbnails)
  - Zod (validation), dotenv (env)
  - Electron‑aware paths, CORS, graceful shutdown
- Frontend (port 5173)
  - React 18, Vite 5, TypeScript
  - Tailwind CSS (Swiss minimal design system)
  - React Router v6
  - React Query v5 (queries/mutations + DevTools)
  - react-hook-form + zod (forms/validation)
  - Headless UI, Heroicons

---

## Environments & Ports

- Backend: http://localhost:3001
- Frontend: http://localhost:5173
- Electron: API URL resolution and upload paths are handled automatically

---

## Current Status at a Glance

Completed
- Phase 1: Foundation (schema, API, seed)
- Phase 2: Core Backend (uploads, Sharp, assets API, portfolio config)
- Phase 3: Frontend Foundation (React + Swiss design + React Query)
- Phase 4: Project Management (list/detail, gallery, upload/delete/reorder, hero)
- Phase 5: Project Forms (create/edit, Zod, dynamic arrays, RIBA stages)
- Phase 6: CV Management UI (tabs + live preview; full CRUD with sanitizers)
- Phase 7: Portfolio Builder (list/grid with filters; 4‑step wizard; detail; duplicate/delete)

In Progress / Next
- Phase 8: PDF Generation (CRITICAL)
- Phase 9: Polish & Advanced Features

---

## Recent Developments

Frontend (Phase 6 completed previously)
- CV page (/cv): Tabs for Personal Info | Experience | Education | Skills and live preview.
- Personal Info: Explicit save with “Saved” indicator; client‑side sanitizers (trim, email/URL validation, omit empty optionals).
- Experience: Add/edit/delete; reorder via displayOrder; date normalization; strict required field gating.
- Education: Degree dropdown normalization; coursework tags; grade; required field gating.
- Skills: Grouped by category; proficiency slider; years experience; quick add common skills.
- Accessibility: Labeled inputs (id/name/htmlFor); correct button types.
- Error handling: Improved debug logging; eliminated 400s via client sanitizers + server validators.

Frontend (Phase 7 completed)
- Pages
  - /portfolios (grid with filters; actions: Open, Duplicate, Delete, Download PDF when available)
  - /portfolios/new (4‑step wizard)
  - /portfolios/:id (detail: included projects, asset counts, download; duplicate)
- Wizard
  1) Basic info (name, SAMPLE/FULL, include CV) with gating
  2) Select projects (cards; drag to reorder; SAMPLE limit 3–5) with gating
  3) Select assets per project (thumbs; include/exclude; mark hero) with gating
  4) Review & Generate (page estimate; create)
- Hooks/API
  - usePortfolios: list/detail/create/update/delete/duplicate
  - portfoliosApi: matching endpoints; add/remove project available for future edits
- URL handling
  - Stable API_URL (src/lib/api.ts)
  - File paths normalized to /uploads/... for asset thumbs/images
- Acceptance Criteria
  - Can create SAMPLE portfolio (3–5 projects), included assets persisted
  - Detail page shows projects and counts; duplicate works; delete removes
  - Swiss minimal styles; responsive and accessible
  - Note: “Regenerate” action will be added with Phase 8 (PDF service)

Backend
- Hardened Zod validation (src/schemas/validation.ts):
  - Accepts YYYY‑MM‑DD or full ISO for dates; treats '' as undefined for optionals
  - URL normalization (adds https:// when missing), string trimming, number coercion
- CORS includes DELETE/PATCH and Electron allowances
- Health (/health), Stats (/api/stats), stable Prisma singleton, Electron‑aware upload paths and shutdown

Infrastructure/Conventions
- Consistent response shape: { success, data? } | { success: false, error }
- Precise React Query invalidations (list + detail) after mutations
- Tailwind Swiss palette and typography; print‑aware spacing tokens for A4/A3

---

## Data Model Snapshot (Prisma)

- Project 1—N ProjectAsset
- CVExperience | CVEducation | CVSkill (ordered, independent entities)
- PersonalInfo (single row, lazy‑created)
- PortfolioTemplate 1—N GeneratedPortfolio
- GeneratedPortfolio N—M Project via PortfolioProject (with includedAssets and displayOrder)

Indexes on displayOrder, featuredPriority, etc., for performant reads.

---

## Roadmap — Remaining Work

Phase 8: PDF Generation (Day 11–15) — Priority: CRITICAL
- Dependencies: @react-pdf/renderer, @react-pdf/unicode-properties
- Frontend PDFs
  - pdf/templates/SwissMinimal.tsx (A4)
  - pdf/components/PDFProject.tsx, pdf/components/PDFCV.tsx
- Backend Service
  - src/services/pdfGenerator.ts:
    1) Load portfolio + relations
    2) Resolve optimized images
    3) Generate PDF via React PDF
    4) Save to filesystem
    5) Update GeneratedPortfolio with path, pages, size
    6) Return download URL
  - API: POST /api/portfolios/:id/generate
- Considerations
  - 150–300 DPI images, total PDF < 20MB
  - Font embedding (Helvetica‑like), RGB initially
- Acceptance Criteria
  - Generate and download A4 PDF with cover, projects, optional CV
  - Reasonable rendering time and file size

Phase 9: Polish & Advanced (Day 16–20)
- Performance: lazy loading, virtual lists, debounced search, optimistic updates
- PDF: multiple templates; per‑project custom layouts; page numbering; linked ToC; cover customization
- Data Portability: JSON export/import (backup/restore)
- Drag & Drop: reorder projects in a portfolio; gallery reordering; drag‑in uploads
- QA: e2e smoke (Playwright/Cypress) + unit tests for sanitizers

---

## Risks and Considerations

- PDF rendering performance and memory usage with large image sets
- Image DPI vs. file size trade‑offs
- Electron packaging (paths, permissions) if desktop app distribution is desired
- SQLite write concurrency under heavy operations (WAL mode helps)

---

## How to Run

- Backend
  - cd backend
  - npm install
  - npm run prisma:generate
  - npm run prisma:migrate
  - npm run prisma:seed
  - npm run dev (http://localhost:3001)
- Frontend
  - cd frontend
  - npm install
  - npm run dev (http://localhost:5173)

Env hints
- Backend .env: PORT, HOST, DATABASE_URL, FRONTEND_URL, MAX_FILE_SIZE, UPLOAD_DIR
- Frontend .env: VITE_API_URL (optional; defaults applied for dev/prod/Electron)

---

## Useful API Endpoints

- Health: GET /health
- Stats: GET /api/stats
- Projects: CRUD + filtering/pagination under /api/projects
- Assets: upload, update, delete, reorder, set hero under /api/assets
- CV: Personal info, experiences, education, skills under /api/cv/*
- Portfolios: list/read/create/update/delete, add/remove project, templates, duplicate under /api/portfolios

---

## Success Criteria (Updated)

Done
- Create/edit projects with full metadata
- Upload/manage project assets
- Manage CV info (Personal Info, Experience, Education, Skills)
- Create portfolio configurations (SAMPLE/FULL) with selected assets

To Do
- Generate print‑ready A4 PDF portfolios (Swiss Minimal template)
- Toggle Sample/Full portfolios in PDFs as needed
- Include CV section in PDFs
- Maintain Swiss minimal aesthetic throughout

---

## Next Session Checklist

- Implement PDF generation service and endpoint (Phase 8)
- Wire “Generate” and “Regenerate” actions in UI to the backend
- Show generation status and enable Download when ready
- Optimize image selection to balance quality vs. file size

---