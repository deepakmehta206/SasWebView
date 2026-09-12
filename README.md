# SaaS Platform Web

Angular frontend for the multi-tenant SaaS platform.

## Phase 1 — Foundation

- Application shell (header, sidebar, content, footer)
- Dashboard placeholder UI
- `ApiService` + `ApiResponse` models
- Environment-based `apiBaseUrl`
- Placeholder auth interceptor (no JWT yet)

## Run

```bash
npm install
npm start
```

App: http://localhost:4200  
API base (Phase 1): `https://localhost:7006/api/v1`

## Notes

- Backend remains authoritative for auth, tenancy, permissions, and entitlements.
- Sidebar nav config: `src/app/core/constants/nav.config.ts`
- Do not add authorization logic in the UI for Phase 1.
