# Copilot instructions (GenAI Optimus GUI)

## Big picture
- Ionic React app built with Vite (`ionic.config.json` type `react-vite`). Entry points: `src/main.tsx` → `src/App.tsx`.
- Pages live in `src/pages/` (program: `program/B2C.tsx`, `program/B2B.tsx`; admin CRUD: `admin/*`). Shared UI lives in `src/components/`.
- API calls are made directly with `fetch` from pages; base URL + API key are centralized in `src/routes/network.ts` (`NetworkInfo`).

## Local dev / build / test
- Install: `npm install`
- Dev server: `npm run dev` (Vite; default port 5173)
- Build: `npm run build` (runs `tsc` then `vite build`, output to `dist/`)
- Unit tests: `npm run test` (Vitest + Testing Library; see `src/App.test.tsx`, `src/setupTests.ts`)
- E2E tests: start dev server then `npm run test.e2e` (Cypress expects `baseUrl: http://localhost:5173` in `cypress.config.ts`)

## Runtime configuration & API proxying
- Frontend reads API settings from Vite envs and/or `window.RUNTIME_ENV`:
  - `NetworkInfo.URL` uses `VITE_API_BASE_URL` (or `window.RUNTIME_ENV.API_ENDPOINT`)
  - `NetworkInfo.ACCESSTOKEN` uses `REMOVED` (or `window.RUNTIME_ENV.API_KEY`)
- Production pattern is “relative /api + NGINX proxy”:
  - `.env.production` sets `VITE_API_BASE_URL=/api` and leaves `REMOVED` empty.
  - `nginx.conf.template` proxies `/api/` to `$API_ENDPOINT` and injects `$API_KEY` as `"removed"` header.
  - Docker build/serve is defined in `Dockerfile` (builds to `dist/`, serves via NGINX).
- When adding new API calls, follow existing convention:
  - Use `fetch(NetworkInfo.URL + '/path', { headers: { "removed": NetworkInfo.ACCESSTOKEN, 'Content-Type': 'application/json' } })` as in `src/pages/admin/*`.
  - Backend expects header name `"removed"` (not `Authorization`).

## Auth, roles, routing
- Router is React Router v5 (use `Switch`, `Route`, `useHistory` as in `src/App.tsx`).
- Route protection is app-local (not MSAL "removed"s):
  - `src/config/AuthContext.tsx` reads `localStorage.user` and maps it to a `role` (`admin`/`user`).
  - `src/config/AuthGuard.tsx` gates routes; admin pages pass `role="admin"` in `src/App.tsx`.
- Login flow stores the server response in `localStorage.user` (`src/pages/auth/login.tsx`).
- There is MSAL plumbing (`MsalProvider` in `src/main.tsx`, `src/config/msalConfig.ts`, `src/components/loginbutton/LoginButton.tsx`), but the Azure AD login button is currently commented out in the login page UI.

## UI conventions
- Prefer Ionic layout/components (`IonPage`, `IonContent`, `IonGrid`, `IonInput`, etc.) and match styling patterns:
  - Tailwind is used alongside Ionic classes (see `tailwind.config.js`, `src/theme/variables.css`).
  - Admin pages typically use `IonSplitPane` + `Sidenav` + `AppHeader` (e.g., `src/pages/admin/configuration/Config.tsx`).
- Forms commonly use `react-hook-form` + Ionic `onIonInput` → `setValue(...)` (see login/config pages).

## Deploy notes
- Helm chart lives in `helm/cirrus/` with environment overrides in `helm/cirrus/env_values/`.
- `AWS_SECRETS_INTEGRATION.md` documents the intended secrets flow for EKS/CSI mounts; verify current container entrypoint behavior against `Dockerfile` before changing deployment wiring.
