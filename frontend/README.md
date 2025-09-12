# Frontend — Architecture Portfolio System

Minimal, Swiss‑style React frontend for managing projects, assets, CV data, and generating portfolios. The frontend consumes a Fastify + Prisma backend (port 3001) and emphasizes a clean separation of data (services/hooks) and presentation (pages/components).

This document maps the stack, folder structure, key files, and core functionality so you can navigate and extend the app quickly.

---

## Tech Stack Map

- Runtime and Build
  - Vite 5 (ESM, fast HMR)
  - TypeScript 5 (strict)
  - React 18 with React Router v6
- Data and State
  - @tanstack/react-query v5 (queries, mutations, cache, devtools)
  - axios (HTTP client with interceptors and auth token support)
- Forms and Validation
  - react-hook-form + zod (schema validation via @hookform/resolvers)
- UI and Styling
  - Tailwind CSS 3 (Swiss design system with custom tokens)
  - @tailwindcss/line-clamp (text truncation)
  - Headless UI + Heroicons (accessible primitives and icons)
- Tooling and Quality
  - ESLint (flat config) with TypeScript + React Hooks rules
  - PostCSS + Autoprefixer
- Target Environments
  - Browser (default) and Electron-aware API handling
  - API base URL: env-driven with sensible fallbacks

---

## Getting Started

Prerequisites:
- Node.js ≥ 18 (required by Vite 5)
- Backend running at http://localhost:3001 (or override via env)

Install and run:
- Install: npm install
- Dev: npm run dev (http://localhost:5173)
- Build: npm run build (type-check + Vite build)
- Preview build: npm run preview
- Lint: npm run lint

Environment:
- Optional: create .env.local (or .env) at /frontend with:
  - VITE_API_URL=http://localhost:3001
- Without VITE_API_URL, the client uses:
  - Development (browser): http://localhost:3001
  - Production or Electron: http://127.0.0.1:3001

---

## Folder Structure (frontend)

- index.html
- package.json
- tailwind.config.js
- postcss.config.js
- eslint.config.js
- tsconfig.app.json
- src/
  - main.tsx
  - App.tsx
  - App.css
  - index.css
  - lib/
    - api.ts                ← axios base config, auth, interceptors, helpers
  - services/
    - README.md             ← domain service guidelines
    - api.ts                ← shared helpers + types (domain-agnostic)
    - types.ts              ← domain types (Project, CV, Portfolio, etc.)
    - projects.ts           ← projects API client
    - assets.ts             ← assets API client
    - cv.ts                 ← CV API client
    - portfolios.ts         ← portfolio API client
    - stats.ts              ← stats API client
    - index.ts              ← explicit re-exports
  - hooks/
    - README.md             ← domain hook guidelines
    - index.ts              ← explicit re-exports (preferred entry)
    - useApi.ts             ← legacy aggregator (non-breaking)
    - useProjects.ts        ← queries/mutations for Projects
    - useAssets.ts          ← upload/update/delete assets
    - useCV.ts              ← personal info, experience, education, skills
    - usePortfolios.ts      ← portfolios + templates + duplicate
    - useStats.ts           ← polling/statistics
  - components/
    - Layout.tsx            ← app shell (sidebar/header/content)
    - cv/…                  ← CV UI (Phase 6)
    - pdf/…                 ← PDF preview bits (future)
  - pages/
    - Dashboard.tsx
    - Projects.tsx
    - ProjectDetail.tsx
    - NewProject.tsx
    - EditProject.tsx
    - CV.tsx
    - Portfolios.tsx
    - CreatePortfolio.tsx
    - PortfolioDetail.tsx
  - pdf/                    ← Planned: React PDF templates (Phase 8)
    - templates/SwissMinimal.tsx
    - components/PDFProject.tsx
    - components/PDFCV.tsx

Notes:
- Only the files shown above that exist are currently implemented; the pdf/ and some cv/ components are planned per roadmap.

---

## Key Files and What They Do

- src/main.tsx
  - Application bootstrap: StrictMode wrapper and App render.
- src/App.tsx
  - App composition:
    - QueryClientProvider with sensible defaults (staleTime 5m, retry 1)
    - ReactQueryDevtools (toggleable)
    - BrowserRouter + nested routes under Layout
  - Routes:
    - “/” → Dashboard
    - “/projects” → list | new | :id detail | :id/edit
    - “/cv” → CV page (Phase 6 UI)
    - “/portfolios” → list | new | :id detail
- src/lib/api.ts
  - axios instance with baseURL auto-detection:
    - env override VITE_API_URL
    - prod/Electron → 127.0.0.1
    - dev browser → localhost
  - Auth token handling (in-memory by default; localStorage in browser)
  - Interceptors:
    - request: attach Bearer token
    - response: 401 → clear token; browser redirect to /login
  - Helpers:
    - getAssetUrl(path) – build absolute asset URLs
    - getErrorMessage(err) – consistent error copy
    - API_URL – exported resolved base URL
- tailwind.config.js
  - Swiss design tokens:
    - fontFamily.sans = Helvetica Neue stack
    - colors.swiss.* = black/white/grays
    - spacing for A4/A3 mm sizes (useful for PDF/print)
  - Plugins: @tailwindcss/line-clamp
- src/index.css
  - Tailwind layers (@tailwind base, components, utilities)
  - Base typography and Helvetica sans
  - Swiss component classes:
    - .swiss-grid, .swiss-container, .swiss-card
    - .swiss-button, .swiss-button-outline
    - .swiss-input, .swiss-label
  - Custom .line-clamp-2 fallback
- src/services/*
  - Domain-focused HTTP clients and shared types:
    - projects.ts, assets.ts, cv.ts, portfolios.ts, stats.ts
    - api.ts (shared helpers/sanitizers), types.ts (domain types)
  - index.ts re-exports (explicit named exports; avoid cycles)
- src/hooks/*
  - React Query hooks per domain:
    - useProjects/useProject/useCreateProject/…
    - useAssets (upload/update/delete/setHero)
    - useCV (personal info, experiences, education, skills CRUD)
    - usePortfolios (CRUD/templates/duplicate)
    - useStats (polling)
  - index.ts re-exports hooks (preferred entry)
  - useApi.ts legacy aggregator to avoid breaking imports

---

## Core Functionality

- Dashboard
  - Overview cards and statistics (via useStats)
- Projects
  - List with search/filters
  - Detail with asset gallery and lightbox
  - Upload/delete/reorder assets; set hero image
  - Create/Edit forms:
    - react-hook-form + zod validation
    - Track RIBA stages, software, skills, dates, metadata
  - React Query:
    - Precise cache invalidation (list + detail on mutations)
- CV Management (Phase 6)
  - /cv page with tabs:
    - Personal Info: name/title/ARB, contacts, summary, links (auto-save)
    - Experience: timeline, drag reorder (displayOrder), inline edit/delete
    - Education: degree types, coursework tags, grade
    - Skills: grouped categories, proficiency slider, years experience
  - Live preview panel of formatted CV
- Portfolios (Phase 7)
  - Status: Implemented
  - List: cards with name, type (SAMPLE/FULL), project count, date; actions (duplicate, delete, download PDF when available)
  - Create Wizard:
    - Step 1: Basic info (name, type, include CV)
    - Step 2: Select and reorder projects (SAMPLE: 3–5 projects)
    - Step 3: Select assets per project; mark hero; set order
    - Step 4: Review and create; template selection exposed in Phase 8 when generation is wired
  - Detail: included projects, asset counts, duplicate, download (when filePath present)
  - Regenerate: will be enabled in Phase 8 with the PDF generation endpoint
- PDF Generation (Phase 8)
  - Frontend: trigger generation, poll status, download PDF
  - Planned components under src/pdf:
    - templates/SwissMinimal (A4) covering cover, projects, TOC, CV
    - PDFProject, PDFCV building blocks
- Design System: Swiss Minimal
  - Colors: pure black/white + grayscale (tailwind theme.extend.colors.swiss)
  - Typography: Helvetica Neue stack; tight tracking; bold headers
  - Utilities: Swiss components via @layer (buttons, inputs, cards)
  - Print-aware spacing tokens: a4-width/height, a3-width/height
- Error Handling and Auth
  - Uniform ApiResponse shape (success/data/error)
  - axios error mapping via getErrorMessage
  - 401 handling: token cleared; browser redirect to /login
- Electron Awareness
  - API URL defaults adapted for Electron user agents
  - Token storage avoids localStorage in Electron by default

---

## Conventions and Architecture Notes

- Components
  - Pure functional components; side effects in hooks only
  - Stable keys for lists (IDs, never indices where order changes)
  - Accessibility: semantic elements first; focus and keyboard support
- Hooks
  - Domain-only imports (avoid cross-hook coupling)
  - Stable, specific query keys (e.g., ['project', id])
  - Minimal, precise invalidation on mutations
- Services
  - One domain per file; shared helpers in services/api.ts
  - Prefer named exports; avoid barrels causing cycles
- Imports and Types
  - Group imports: node → external → internal aliases → relative → styles
  - Use `import type` and `export type` where applicable
- Linting
  - React Hooks rules enforced
  - @typescript-eslint rules for unused vars, type imports, etc.
- Project Organization (evolving)
  - Feature-first and co-location encouraged for new work:
    - features/<feature>/{ui,hooks,services,types,__tests__}
  - Shared cross-feature utilities under src/shared/*

---

## API Integration Pattern

- Read:
  - useQuery with service methods, stable keys, longish staleTime (5m)
- Write:
  - useMutation with precise invalidateQueries calls:
    - Example for project changes:
      - ['projects'] (list)
      - ['project', id] (detail)
- Responses:
  - Backend returns { success, data?, error? } consistently
- Assets:
  - Use getAssetUrl(path) for full URLs to optimized or thumbnail images

---

## Troubleshooting

- 401 Unauthorized
  - Token cleared; browser redirected to /login
  - Ensure backend CORS allows DELETE/PATCH and credentials if needed
- Wrong API base URL
  - Set VITE_API_URL in .env.local
  - Electron uses 127.0.0.1 by default when no env is provided
- Tailwind classes not applied
  - Ensure content globs in tailwind.config.js include your paths (./src/**/*.{js,ts,jsx,tsx})
  - Restart dev server after adding new files
- Node/Vite issues
  - Use Node ≥ 18; clear node_modules/.vite if cache becomes stale
- Ports
  - Frontend: 5173; Backend: 3001; adjust VITE_API_URL if different

---

## Roadmap Summary

- Phase 6 (CV UI): Completed
- Phase 7 (Portfolios): Completed (builder wizard, list/detail, duplicate/delete)
- Phase 8 (PDF): React PDF templates, backend generation, download links
- Phase 9 (Polish): Performance, multiple templates, import/export, advanced PDF features

---

## License and Usage

Personal/non-commercial use. Built for an architecture portfolio system with a focus on clarity, flexibility, and print-ready output.

---

If you want me to add this file to your repo, use the Apply button on this code block, or switch to Agent Mode from the Mode Selector to let me create it automatically.