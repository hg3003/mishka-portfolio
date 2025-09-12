# Backend — Architecture Portfolio System

Fast, type-safe Node backend for the Architecture Portfolio System. Exposes a REST API for Projects, Assets, CV data, and Portfolios with robust validation, image processing, and a Prisma/SQLite datastore. Electron-aware deployment options are included.

---

## Tech Stack Map

- Runtime
  - Node.js (ES2022)
  - Fastify 5 (HTTP server, plugins)
  - TypeScript 5 (strict, source maps, declarations)
- Data
  - Prisma 6 (ORM) with SQLite
- File Handling
  - @fastify/multipart (file upload)
  - @fastify/static (static serving)
  - Sharp (image optimization + thumbnails)
- Validation and Types
  - Zod 4 (schemas for requests/responses)
  - Shared API types (src/types/api.ts)
- Config and Dev
  - dotenv (env variables)
  - nodemon + tsx (dev server with hot-reload)
  - ESLint + Prettier

---

## Getting Started

Requirements:
- Node.js ≥ 18
- npm
- SQLite (included by Prisma; no separate install required)

Setup:
- Install: npm install
- Prisma generate: npm run prisma:generate
- Migrate dev DB: npm run prisma:migrate
- Seed sample data: npm run prisma:seed
- Dev server: npm run dev (http://localhost:3001)
- Build: npm run build
- Start (after build): npm start
- Prisma Studio: npm run prisma:studio

Environment (.env):
- PORT=3001 — server port
- HOST=localhost — bind host (Electron production defaults to 127.0.0.1 if unset)
- DATABASE_URL=file:./dev.db — SQLite file
- FRONTEND_URL=http://localhost:5173 — CORS allow-list
- MAX_FILE_SIZE=10485760 — upload limit (10MB default)
- UPLOAD_DIR=./uploads — base uploads dir (server-managed; Electron adjusts dynamically)

---

## Folder Structure

- prisma/
  - schema.prisma — Prisma schema (models, relations, indexes)
  - seed.ts — seeds PersonalInfo, CV, Projects, and a sample Portfolio
- src/
  - index.ts — Fastify bootstrap, CORS/static config, route registration, Electron-aware paths
  - utils/
    - db.ts — Prisma singleton, health/stats helpers
  - types/
    - api.ts — shared ApiResponse/PaginatedResponse and re-exported schemas
  - schemas/
    - validation.ts — Zod schemas for all domains (Projects, Assets, CV, Portfolio)
  - routes/
    - projects.ts — CRUD + filtering/pagination for projects
    - assets.ts — upload/metadata/reorder/hero management
    - cv.ts — Personal Info, Experience, Education, Skills CRUD
    - portfolios.ts — portfolio config, templates, duplication
  - services/
    - uploadService.ts — image/document processing, file validation, directory management
    - pdfGenerator.ts — planned (Phase 8) React PDF generation (backend)
- dist/ — compiled output (gitignored)
- uploads/ — runtime uploads dir (created automatically; Electron path differs)

Note: Some service files are referenced by routes and should exist in src/services (e.g., uploadService.ts). If missing, create them per project history.

---

## Key Files

- src/index.ts
  - Fastify server instance, logger, error handler (Prisma codes P2002/P2025 handled)
  - Health (/health) and DB stats (/api/stats)
  - CORS configuration with Electron-friendly allowances
  - Multipart registration with size/file limits
  - Static serving:
    - /uploads → dynamic root from getUploadPath()
    - Serves frontend build in production when running under Electron
  - Route registration under /api
  - Electron-aware upload path resolution and graceful shutdown

- prisma/schema.prisma
  - Models:
    - Project, ProjectAsset
    - CVExperience, CVEducation, CVSkill, PersonalInfo
    - PortfolioTemplate, GeneratedPortfolio, PortfolioProject (junction)
  - Cascading deletes for project/assets and portfolio relationships
  - Useful indexes (e.g., displayOrder, featuredPriority)

- src/schemas/validation.ts
  - Zod schemas:
    - Projects: create/update, query/pagination, enums (ProjectType, RIBA stages)
    - Assets: update schema, enums (assetType, drawingType, sizes)
    - CV: create/update for experience, education, skills; personal info update
    - Portfolio: create (with projects), update fields, enums (SAMPLE/FULL)
  - Helpers to normalize strings, URLs, and dates

- src/routes/projects.ts
  - REST endpoints with validation, pagination, sorting, filtering
  - Includes assets relation and counts on list/read

- src/routes/assets.ts
  - Upload single/multiple with validation, Sharp processing, thumbnails
  - Update metadata, delete (with file cleanup), reorder, set hero image
  - Returns URLs under /uploads/... based on type

- src/routes/cv.ts
  - Personal Info (get/create-default + update)
  - Experience/Education/Skills: list/create/update/delete
  - Bulk: /cv/all to fetch all CV data in one call

- src/routes/portfolios.ts
  - List, read, create (with projects), update, delete
  - Add/remove project in existing portfolio
  - Templates list, duplicate portfolio

- src/utils/db.ts
  - Prisma singleton instance, DB health check and summary stats

---

## API Overview

Base URL:
- Default: http://localhost:3001
- All resources are under /api except /health

Response shape:
- Success: { success: true, data: ... }
- Error: { success: false, error: string, details?: any }
- Pagination: { page, limit, total, totalPages }

Health and Stats:
- GET /health — { status, timestamp, database, environment, uploadPath }
- GET /api/stats — counts of major entities

Projects:
- GET /api/projects
  - Query: page, limit, sortBy, sortOrder, projectType, isAcademic, isCompetition, yearStart, yearEnd, search
- GET /api/projects/:id
- POST /api/projects — validated by createProjectSchema
- PUT /api/projects/:id — validated by updateProjectSchema
- DELETE /api/projects/:id
- GET /api/projects/:id/assets — assets ordered by displayOrder asc

Assets:
- POST /api/assets/upload/:projectId — single file
- POST /api/assets/upload-multiple/:projectId — multi-file (multipart)
- GET /api/assets/:id — includes computed url and thumbnailUrl for images
- PUT /api/assets/:id — update metadata (title, caption, types, order, hero, focal point)
- DELETE /api/assets/:id — deletes DB record and physical files (optimized, thumbnails, try original)
- POST /api/assets/reorder — set displayOrder for multiple assets
- POST /api/assets/:id/set-hero — marks one asset as hero (unsets others)

CV:
- Personal Info
  - GET /api/cv/personal-info — creates default if none
  - PUT /api/cv/personal-info — update (partial)
- Experience
  - GET /api/cv/experience
  - POST /api/cv/experience
  - PUT /api/cv/experience/:id
  - DELETE /api/cv/experience/:id
- Education
  - GET /api/cv/education
  - POST /api/cv/education
  - PUT /api/cv/education/:id
  - DELETE /api/cv/education/:id
- Skills
  - GET /api/cv/skills
  - POST /api/cv/skills
  - PUT /api/cv/skills/:id
  - DELETE /api/cv/skills/:id
- Bulk
  - GET /api/cv/all — personalInfo, experiences, education, skills

Portfolios:
- GET /api/portfolios — includes template, projects, counts
- GET /api/portfolios/:id — includes full project assets
- POST /api/portfolios — create with projects (validated)
- PUT /api/portfolios/:id — update fields/settings
- DELETE /api/portfolios/:id
- POST /api/portfolios/:id/add-project — add a project with optional includedAssets
- DELETE /api/portfolios/:portfolioId/remove-project/:projectId
- GET /api/portfolios/templates — available templates
- POST /api/portfolios/:id/duplicate — deep copy incl. project selections

---

## File Uploads and Storage

- Accepted types:
  - Images: image/jpeg, image/jpg, image/png, image/webp
  - Documents: application/pdf
- Limits:
  - MAX_FILE_SIZE env (default 10MB)
  - Up to 10 files per multi-upload request
- Processing (images):
  - Sharp optimization (default maxWidth/Height and quality)
  - Thumbnail generation
- Storage structure (typical):
  - uploads/
    - projects/
      - originals/
      - optimized/
      - thumbnails/
- URLs served under /uploads/ via @fastify/static
- Electron: upload path resolves to app.getPath('userData')/uploads when provided via USER_DATA_PATH

---

## CORS, Static, and Electron

- CORS:
  - Allowed origins include FRONTEND_URL, localhost ports, and file:// (Electron)
  - Credentials enabled; methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
  - Allowed headers: Content-Type, Authorization
- Static:
  - /uploads/* served from dynamic path (getUploadPath)
  - In Electron production, also serves built frontend
- Electron-aware:
  - Detects Electron environment (process.versions.electron or ELECTRON_RUN)
  - Uses 127.0.0.1 host binding by default if Electron
  - Applies SQLite pragmas for desktop use (WAL, NORMAL)
  - Graceful shutdown handlers (SIGTERM/SIGINT, Windows message)

---

## Database Model Summary

- Project 1—N ProjectAsset
- GeneratedPortfolio N—M Project via PortfolioProject
- CV Entities independent:
  - CVExperience (ordered by displayOrder)
  - CVEducation (ordered by displayOrder)
  - CVSkill (grouped by category, ordered by displayOrder)
- PersonalInfo single row (created lazily)
- PortfolioTemplate 1—N GeneratedPortfolio
- Useful indexes for performance on filters and ordering

Run Prisma Studio to inspect:
- npm run prisma:studio

---

## Errors and Validation

- Global error handler:
  - Prisma unique (P2002) → 409
  - Prisma not found (P2025) → 404
  - Fastify errors → statusCode + message
  - Default → 500 with minimal detail (extra detail in development)
- Zod schemas validate all inputs:
  - Date handling: accepts YYYY-MM-DD or full ISO; normalizes to ISO
  - String helpers: trim and normalize; empty strings treated as undefined for optionals
  - URL normalization: prepends https:// if missing
- Response format is consistent across endpoints

---

## Development Notes

- Dev server: nodemon + tsx watches src and .env
- Lint: npm run lint (ESLint with TypeScript rules)
- Format: npm run format (Prettier)
- Build: emits type declarations, source maps, and CJS for dist/

---

## Troubleshooting

- Port already in use
  - Change PORT in .env or stop conflicting process
- CORS errors
  - Ensure FRONTEND_URL matches your frontend origin
  - Restart server after changing env
- Upload path or permissions
  - Check console logs for “Serving uploads from”
  - Ensure write permissions to UPLOAD_DIR (or Electron userData path)
- SQLite locking in Electron
  - WAL mode enabled automatically in production; verify no parallel writers
- Prisma schema changes
  - Run: npm run prisma:migrate
  - Reset dev DB: npm run prisma:reset (destructive)

---

If you want me to add this file to your repo, use the Apply button on this code block, or switch to Agent Mode from the Mode Selector to let me create it automatically.