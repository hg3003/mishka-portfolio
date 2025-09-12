# Phase 8: PDF Generation — Implementation Plan (Updated)

Goal: Generate an A4, print‑ready PDF for any portfolio and return a stable download URL. Minimal, reliable v1; fast follow improvements after.

Status: In progress — backend scaffolding, generator, template, and API endpoint are implemented and working; frontend “Generate/Regenerate” is wired.

Assumptions (confirmed/updated)
- PDFs are generated on the backend using @react-pdf/renderer.
- Included assets come from PortfolioProject.includedAssets; if empty, include all project assets by displayOrder; hero image first if present.
- PDFs are saved under getUploadPath()/portfolios and exposed at /uploads/portfolios/<id>.pdf.
- Fonts: use standard PDF “Helvetica” initially; embedding an open font is a follow-up.
- Generation runs synchronously in request/response; can be offloaded later if needed.

---

## Backend

1) Dependencies (done)
- backend/package.json:
  - @react-pdf/renderer
  - react (peer of renderer)
  - dev: @types/react
- TSX support:
  - backend/tsconfig.json → "jsx": "react-jsx"

2) Static serving (confirmed)
- Fastify static already mounts getUploadPath() at prefix /uploads.

3) Shared upload path util (done)
- backend/src/utils/paths.ts
  - getUploadPath() extracted from index.ts and used by both server and generator.

4) Portfolio PDF data shape and fetch (done)
- Function: loadPortfolioForPdf(id)
  - Loads GeneratedPortfolio with template and projects (ordered), each with project.assets (ordered).
  - If cvIncluded: loads personalInfo, experiences, education, skills.
- Normalization rules:
  - If junction.includedAssets has IDs → filter project.assets by those IDs (keep order).
  - Else include all project.assets by displayOrder.
  - If a hero asset exists and is included → make it first.

5) Resolve image paths (done)
- Prefer optimized files: <uploads>/projects/optimized/<fileName>
- Fallback to originals if optimized missing.
- Helper: assetFsPath(fileName, prefer='optimized') with fallbacks.

6) PDF components and template (done, v1)
- backend/src/pdf/components/PDFProject.tsx
  - Renders project title/meta, hero image, and a simple grid for remaining images.
- backend/src/pdf/components/PDFCV.tsx
  - Renders personal info, experience, education, and skills in a concise, Swiss-style layout.
- backend/src/pdf/templates/SwissMinimal.tsx
  - A4 pages, margins configurable via template.marginsConfig.
  - Pages: Cover → Projects (one per page) → optional CV page.
  - Receives a RenderablePortfolio object with projects and CV payload.

7) PDF generator service (done)
- backend/src/services/pdfGenerator.ts
  - Maps DB entities → RenderablePortfolio.
  - Uses React.createElement(SwissMinimal, { data }) with ReactPDF.render(element, fileFsPath).
  - Ensures output dir exists: <uploads>/portfolios
  - Writes <portfolioId>.pdf, updates prisma.generatedPortfolio with filePath and fileSize.
  - Notes:
    - We render directly to file (avoids PDFDocument/Buffer issues).
    - totalPages deferred for now (can be added later by counting or via pagination callbacks).

8) API endpoint (done)
- backend/src/routes/portfolios.ts
  - POST /api/portfolios/:id/generate
  - Validates existence and non-empty projects.
  - Calls generatePortfolioPdf(id).
  - Returns { success: true, data: { filePath, fileSize } }.
  - Error handling:
    - 400 when no projects selected
    - 404 when portfolio not found
    - 500 otherwise with log (details in dev)

9) Performance and file size (policy)
- Use optimized images (currently ~2400 px width) — suitable for A4 at ~300 DPI.
- Target PDF < 20MB for typical sets.
- If oversized in future:
  - Use thumbs for grids and optimized for hero, or
  - Add a dedicated resize in the PDF pipeline (v2).

10) Fonts and text shaping
- v1: PDF “Helvetica” (no embedding).
- v2 (optional):
  - Place TTF/OTF under backend/src/pdf/fonts/.
  - Font.register({ family: 'Inter', src: <path> }) and switch template family.
- @react-pdf/unicode-properties likely unnecessary for Latin; add only if needed.

11) Electron and paths (confirmed)
- getUploadPath handles Electron userData; static /uploads/* works as-is.

---

## Frontend

1) API and hooks (done)
- services/portfolios.ts → generate(id: string) → POST /api/portfolios/:id/generate
- hooks/usePortfolios.ts → useGeneratePortfolio()
  - On success: invalidates ['portfolio', id] and ['portfolios'] caches.

2) UI wiring (done)
- pages/PortfolioDetail.tsx:
  - Shows “Generate PDF” if no filePath; “Regenerate” if exists.
  - Disables during mutation; shows “Generating…” label.
  - Download link enabled when filePath present.

3) Future UX (optional)
- If moving to async background jobs, add status to GeneratedPortfolio and poll until ready.
- Toasts/notifications for success/failure.

---

## Validation and Fallbacks

- If includedAssets empty → include all by displayOrder.
- Always attempt to put hero first if included.
- If optimized image missing → fallback to originals.
- If a project has zero images → render text-only info (no crash).

---

## Testing Plan

1) API smoke tests
- List portfolios and pick a valid ID:
  - GET /api/portfolios
- Generate:
  - POST /api/portfolios/:id/generate
  - Expect: { success: true, data: { filePath, fileSize } }
- Download:
  - Open http://localhost:3001/uploads/portfolios/<id>.pdf

2) Frontend verification
- /portfolios/:id:
  - “Generate PDF” when missing → becomes “Regenerate” after success.
  - “Download PDF” link works and opens the file.

3) Content validation
- Cover: name/date (+ personal header when cvIncluded).
- Projects: correct order; hero first; grid images present; meta (type/year).
- CV (if included): sections render and fit on the page; acceptable typography.
- Layout: margins applied; images not stretched.

4) Performance and size
- Generation time is reasonable for sample dataset.
- File size < 20MB typical; spot-check via response fileSize or disk.

5) Edge cases
- Empty portfolio → 400.
- Non-existent portfolio → 404.
- Missing files: generator falls back; PDF still renders.

---

## Rollout Plan (Incremental)

Day 1–2 (done)
- utils/paths.ts, pdfGenerator.ts, POST /api/portfolios/:id/generate
- Minimal SwissMinimal template; file render path finalized
- Frontend: useGeneratePortfolio; buttons on detail page

Day 3–4 (done v1; continue refinements)
- PDFProject: hero + grid; PDFCV: single-page CV
- Read marginsConfig from template
- Frontend: generating state and cache invalidations

Day 5 (next)
- QA pass: multiple portfolios, downloads, Electron run (if applicable)
- Polish: optional page numbers, small spacing tweaks
- Decide on font embedding (if needed)

---

## Acceptance Criteria (v1)

- POST /api/portfolios/:id/generate writes a PDF and updates GeneratedPortfolio.filePath
- Download link works in list and detail pages
- CV included when cvIncluded = true
- Generation time is acceptable for seed data
- File size is within practical limits (< 20MB typical)

---

## Notes and Future Improvements

- Shared templates: later, move PDF components to a shared package if we want frontend previews.
- Async generation: add a status field and a worker queue for large portfolios.
- Multiple templates: add variants and surface selection in UI.
- Page numbering & Table of Contents: footer page numbers and linked TOC page.