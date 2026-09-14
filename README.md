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

## Phase 12B — Platform Admin UI

Platform SaaS administration (Angular only). Backend `/api/v1/admin/*` remains the security boundary.

Routes:

- `/admin` → `/admin/tenants`
- `/admin/tenants`
- `/admin/tenants/new`
- `/admin/tenants/:id`
- `/admin/tenants/:id/edit`
- `/admin/audit`

Visibility requires `isPlatformAdmin`. Tenant users do not see Admin navigation.

Do not store or document bootstrap passwords in the UI. The provisioned tenant admin password is entered in the wizard and is not the platform seed password.
