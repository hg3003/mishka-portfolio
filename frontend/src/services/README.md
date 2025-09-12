# services/

Domain-focused HTTP clients and shared types.

- api.ts — shared helpers and payload sanitizers (no domain APIs here)
- types.ts — domain types (Project, Asset, CV, Portfolio, etc.)
- projects.ts — projectsApi
- assets.ts — assetsApi
- cv.ts — cvApi (uses sanitizers from api.ts)
- portfolios.ts — portfoliosApi
- stats.ts — statsApi
- index.ts — re-exports APIs, types, and sanitizers

Guidelines:
- Keep each file scoped to a single domain.
- Reuse shared helpers from api.ts (e.g., sanitize* payloads).
- Prefer named exports.
- Avoid importing from index.ts within the same folder to prevent cycles.
```

New file
```markdown frontend/src/hooks/README.md
# hooks/

React Query hooks, organized by domain.

- useProjects.ts — Project CRUD/query hooks
- useAssets.ts — Asset upload/update/delete hooks
- useCV.ts — CV data hooks (personal info, experience, education, skills)
- usePortfolios.ts — Portfolio CRUD/query hooks
- useStats.ts — Stats polling hook
- index.ts — re-exports all hooks (preferred entry point)
- useApi.ts — legacy aggregator that re-exports per-domain hooks (non-breaking)

Guidelines:
- Each hook file imports only its domain service.
- Keep query keys stable and specific (e.g., ['project', id]).
- Invalidate minimal queries on mutations (prefer precision over blanket invalidation).
- Avoid importing from hooks/index.ts inside this folder to prevent cycles.