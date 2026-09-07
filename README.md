# Monorepo Template — Auth Completed

Production-ready **pnpm + Turborepo** monorepo template with a **custom JWT authentication system** already implemented. Built on **TanStack Start**, **NestJS**, **Prisma/PostgreSQL**, and **shadcn/ui**.

Use this as a starting point for SaaS / dashboard / admin products — auth flows, session management, security hardening and shared UI packages are done so you can focus on business logic.

---

## What's Included

| Area | Details |
|------|---------|
| **Monorepo** | `pnpm` workspaces + `turborepo` with filtered `dev`/`build`/`lint`/`typecheck` tasks |
| **Apps** | `apps/admin` (TanStack Start — authenticated dashboard), `apps/server` (NestJS auth API), `apps/web` (TanStack Start demo/marketing) |
| **Packages** | `@workspace/ui` (shadcn/ui + Tailwind), `@workspace/form` (react-hook-form + zod), `@workspace/query` (TanStack Query), `@workspace/schema` (shared zod), `@workspace/api-client` (typed axios) |
| **Auth** | Complete — register, login, refresh, logout, verify-email, resend-verification, forgot/reset password, onboarding, `GET/PATCH /user/me` |
| **Tooling** | Biome (formatter + linter), Husky + lint-staged, TypeScript strict, Tailwind 4, TanStack Devtools, Swagger/OpenAPI |

> `apps/super-admin` scripts exist in root `package.json` but the app is not yet scaffolded — duplicate `apps/admin` to create it.

---

## Architecture

```
.
├── apps/
│   ├── admin/          # TanStack Start — login/register/verify/forgot/reset/onboarding, protected routes
│   │   └── src/
│   │       ├── routes/auth/*         # public auth pages
│   │       ├── routes/_authenticated/* # protected layout (beforeLoad guard)
│   │       ├── features/auth/        # forms, schemas, hooks, mutations
│   │       └── lib/session.ts        # createServerFn fetchSession + silent refresh
│   ├── server/         # NestJS 11 Auth API + Prisma + PostgreSQL
│   │   ├── prisma/schema.prisma      # User, Session, Token
│   │   └── src/modules/auth|users|health
│   └── web/            # TanStack Start minimal demo (add marketing/landing here)
├── packages/
│   ├── ui/             # shadcn/ui primitives (40+), icons, design tokens, globals.css
│   ├── form/           # FormInput, FormPassword, FormSelect, etc. (WCAG)
│   ├── query/          # QueryProvider, persister, prefetch
│   ├── schema/         # emailSchema, strongPasswordSchema, fullNameSchema
│   └── api-client/     # createApiClient (axios) + BaseApiService
├── turbo.json, pnpm-workspace.yaml, biome.json, tsconfig.json
└── README.md
```

---

## Tech Stack

- **Frontend:** TanStack Start + TanStack Router (file-based, `beforeLoad` guards), React 19, Tailwind CSS 4 + `tw-animate-css`, shadcn/ui (Radix), Zod 4, React Hook Form, Axios, TanStack Query 5, Vite 8
- **Backend:** NestJS 11, Prisma 6 + PostgreSQL, JWT (HS256), argon2id, Helmet, Throttler, Resend, Joi validation, pino logger, Swagger
- **Monorepo:** pnpm 10.33.4, Turborepo 2.8, TypeScript 5.9, Biome 2.4 (formatter + linter, `lineWidth:100`, `indentWidth:2`, `semicolons:asNeeded`), Husky (pre-commit `typecheck && lint-staged`, pre-push `build`), ESLint (TanStack config)

---

## Auth — Completed

### Flows

- ✅ **Register** `POST /auth/register` — argon2id hash, duplicate enumeration defense (generic response), race P2002 handling, sends 6-digit code
- ✅ **Login** `POST /auth/login` — lockout 5 attempts / 15 min (`lockedUntil` only revealed on correct password), timing equalization for unknown user, requires `emailVerified`
- ✅ **Session** — Access JWT 15 min (`JWT_ACCESS_TTL=900`) + rotating Refresh JWT 7d (`JWT_REFRESH_TTL=604800`). Refresh stored as SHA-256 hash, httpOnly `refresh_token` (`Path=/auth`), readable `csrf_token` + httpOnly `admin_access_token`
- ✅ **Refresh** `POST /auth/refresh` — family rotation (`familyId`), replay/theft detection revokes whole family, silent refresh via `createServerFn` + axios interceptor (coalesced)
- ✅ **Logout** `POST /auth/logout` / `POST /auth/logout-all` — CsrfGuard, always-200, clears cookies, `revokeAllForUser`
- ✅ **Email verification** — 6-digit code via `TokenService.generateVerificationCode()`, 10 min TTL, hash lookup, single-use, 60s resend cooldown + 10 min countdown UI
- ✅ **Password reset** — `forgot-password` (generic), `reset-password` (consumes 32-byte base64url token, 15 min TTL, marks `emailVerified`, revokes sessions)
- ✅ **Change password** `POST /auth/change-password` — verifies current, rejects reuse, revokes all sessions
- ✅ **Onboarding** `POST /user/onboarding` — `fullName` once, requires `emailVerified`
- ✅ **Profile** `GET/PATCH /user/me`
- ❌ **OAuth** — not included (no OIDC provider)

### Security Hardening

CSRF double-submit (`csrf_token` cookie vs `x-csrf-token` header, `timingSafeEqual` SHA256), `SameSite=strict` cookies, Helmet CSP/HSTS/CORP, CORS `credentials:true` allow-list, global `ThrottlerGuard` (100/min) + `AUTH_RATE_LIMIT_MAX=10/min`, `JwtAuthGuard` live-reloads user to enforce `isActive`, enumeration defense, argon2id (`m=19456,t=2,p=1`), SHA-256 token hashes, Joi anti-placeholder secret validation (`access !== refresh`, `>=32 chars`).

### DB Schema (`apps/server/prisma/schema.prisma`)

- `User { id (uuid), email @unique, passwordHash (argon2id PHC), fullName?, emailVerified, isActive, failedLoginAttempts, lockedUntil, sessions, tokens }`
- `Session { id, userId, familyId, refreshTokenHash @unique, userAgent?, ipAddress?, expiresAt, revokedAt?, replacedById? }` — indexed on `userId`, `familyId`, `expiresAt`
- `Token { id, userId, type (EMAIL_VERIFICATION | PASSWORD_RESET), tokenHash @unique, expiresAt, usedAt? }`

### Frontend Guards (`apps/admin`)

- `lib/session.ts#fetchSession` — `createServerFn` forwards cookie header to `GET /user/me`, auto `POST /auth/refresh` on 401
- `routes/auth.tsx#authGuard` — redirects based on `emailVerified`/`fullName`
- `routes/_authenticated.tsx#beforeLoad` — redirects to `/auth/login?redirect=` if no session, blocks `isActive===false`, unverified, not-onboarded
- `lib/api-client.ts` — injects `x-csrf-token` from `document.cookie`, 401 auto-refresh with promise coalescing, toasts for 423/502/503
- `features/auth` — zod schemas (`loginSchema`, `registerSchema` with `strongPassword` 12-128 chars), `use*Form` hooks, `use*Mutation` + `useMeQuery`, forms with WCAG components

---

## Prerequisites

- **Node** `>=20`
- **pnpm** `10.33.4` (`npm i -g pnpm@10.33.4` or `corepack enable`)
- **PostgreSQL** `>=14` (needs `gen_random_uuid()`)
- Resend account optional — if `RESEND_API_KEY` empty, emails are logged via `pino`

---

## How to Use This Template

### 1. Clone as a new project

```bash
# Use as GitHub template or:
git clone https://github.com/your-org/monorepo-template.git my-app
cd my-app
rm -rf .git && git init && git add . && git commit -m "init: from monorepo-template"
```

### 2. Install

```bash
pnpm install
```

### 3. Configure environment

```bash
cp apps/server/.env.example apps/server/.env
# generate secrets (must differ, >=32 chars)
openssl rand -base64 48  # -> JWT_ACCESS_SECRET
openssl rand -base64 48  # -> JWT_REFRESH_SECRET
```

Edit `apps/server/.env`:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db?schema=public
JWT_ACCESS_SECRET=<output 1>
JWT_REFRESH_SECRET=<output 2>
APP_URL=http://localhost:3000
MAIL_FROM="Auth Service <contact@example.com>"
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
# optional:
RESEND_API_KEY=re_...
SEED_USER_EMAIL=admin@example.com
SEED_USER_PASSWORD=Str0ng!Passw0rd12
```

Optional client env `apps/admin/.env` (defaults to `http://localhost:5000` in `lib/api-client.ts:10`, `lib/api.ts`, `lib/session.ts`):

```dotenv
VITE_API_URL=http://localhost:5000
```

### 4. Database

```bash
pnpm --filter server db:generate   # prisma generate
pnpm --filter server db:migrate:dev # create & apply migration
pnpm --filter server db:seed        # optional — upserts SEED_USER_EMAIL as verified user
# pnpm --filter server db:studio    # Prisma Studio
```

### 5. Run

```bash
pnpm dev              # all apps (server:5000, admin:3000, web:3000)
# or filtered:
pnpm dev:server       # nest start --watch (http://localhost:5000, Swagger /docs if SWAGGER_ENABLED=true)
pnpm dev:admin        # vite dev --port 3000
pnpm dev:web          # vite dev --port 3000
```

Check `GET http://localhost:5000/health`. Login flow: `http://localhost:3000/auth/register` → verify email (6-digit) → onboarding → `http://localhost:3000/dashboard`.

### 6. Build & Production

```bash
pnpm build            # turbo build (all)
pnpm --filter server start  # node dist/main.js — requires NODE_ENV=production
```

Production env: set `NODE_ENV=production`, `SWAGGER_ENABLED=false` (unless needed), `TRUST_PROXY=true` behind LB (secure cookies auto-enabled), deploy migrations with `pnpm --filter server db:migrate:deploy`.

### 7. Extend the template

- **New app:** `mkdir apps/my-app && pnpm init`, add to `pnpm-workspace.yaml`, extend `tsconfig.json`/`vite.config.ts` from `apps/admin`, add `turbo.json` pipeline if needed.
- **New package:** `mkdir packages/my-pkg`, use `workspace:*` deps, export via `package.json#exports`.
- **Add UI components:** from repo root run `pnpm dlx shadcn@latest add button -c apps/web` (or `-c apps/admin`) → components land in `packages/ui/src/components`.
- **Import in apps:** `import { Button } from "@workspace/ui/components/button"` etc.
- **Icons:** `pnpm icons:generate` (`pnpm --filter @workspace/ui icons:generate`) regenerates `packages/ui/src/components/icons`.
- **Remove `web` or `admin`** if not needed — just delete `apps/<name>` and remove its scripts.

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Turbo dev all apps (persistent, no cache) |
| `pnpm build` | Turbo build all (`outputs: .output/**`) |
| `pnpm dev:admin` / `build:admin` / `preview:admin` | Filtered admin |
| `pnpm dev:server` / `build:server` | Filtered server |
| `pnpm dev:web` / `build:web` / `preview:web` | Filtered web |
| `pnpm lint` / `format` / `typecheck` | Turbo lint/format/typecheck |
| `pnpm icons:generate` | Generate icons in `packages/ui` |
| `pnpm --filter server db:generate` | `prisma generate` |
| `pnpm --filter server db:migrate:dev` | `prisma migrate dev` |
| `pnpm --filter server db:migrate:deploy` | `prisma migrate deploy` (prod) |
| `pnpm --filter server db:seed` | `tsx prisma/seed.ts` |
| `pnpm --filter server db:studio` | Prisma Studio |
| `pnpm --filter server test` / `test:e2e` | Jest + Supertest (`test/auth.e2e-spec.ts`) |
| `pnpm --filter server openapi:export` | Export OpenAPI spec |

App-specific: `apps/admin` has `generate-routes` (`tsr generate`), `biome check/lint/format`; `apps/web` has `eslint`; `packages/*` have `build`/`typecheck`.

---

## Environment Variables (`apps/server/.env.example:1`)

| Var | Required | Default | Description |
|-----|----------|---------|-------------|
| `NODE_ENV` |  | `development` | `development`/`test`/`production` |
| `PORT` |  | `5000` | Server listen port |
| `LOG_LEVEL` |  | `info` | `fatal`/`error`/`warn`/`info`/`debug`/`trace` |
| `CORS_ORIGINS` | prod | — | Comma-separated allow-list, no trailing slash |
| `TRUST_PROXY` |  | `false` | `true` behind LB for correct IPs |
| `SWAGGER_ENABLED` |  | `true` (`false` in prod) | Expose `/docs` |
| `DATABASE_URL` | ✅ | — | `postgresql://...` |
| `JWT_ACCESS_SECRET` | ✅ | — | `openssl rand -base64 48`, `>=32`, not placeholder |
| `JWT_REFRESH_SECRET` | ✅ | — | Must differ from access |
| `JWT_ACCESS_TTL` |  | `900` | seconds (60-3600) |
| `JWT_REFRESH_TTL` |  | `604800` | seconds (600-2592000) |
| `COOKIE_DOMAIN` |  | `` | Host-only if empty |
| `APP_URL` | ✅ | — | Base for email links `http://localhost:3000` |
| `MAIL_FROM` | ✅ | — | `"Auth Service <contact@example.com>"` |
| `BCC_BUSINESS_EMAIL` |  | `` | BCC all transactional mail |
| `RESEND_API_KEY` |  | `` | `re_...` — empty = log only |
| `RATE_LIMIT_GLOBAL_MAX` |  | `100` | per minute |
| `AUTH_RATE_LIMIT_MAX` |  | `10` | per minute for auth |
| `LOCKOUT_MAX_ATTEMPTS` |  | `5` | brute-force |
| `LOCKOUT_TTL_MINUTES` |  | `15` | lockout window |
| `EMAIL_VERIFICATION_TTL_MINUTES` |  | `10` | 6-digit code TTL |
| `PASSWORD_RESET_TTL_MINUTES` |  | `15` | reset link TTL |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` |  | — | `prisma/seed.ts` (password `>=12` + lower/upper/digit/special) |

Client: `VITE_API_URL` (`apps/admin/.env`) — defaults to `http://localhost:5000`.

---

## API Overview (`apps/server/src/modules/auth/auth.controller.ts:1`)

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| `POST` | `/auth/register` | `@Public` + throttled | Register |
| `POST` | `/auth/login` | throttled | Set `refresh_token`+`csrf_token`+`admin_access_token` cookies |
| `POST` | `/auth/refresh` | `@Public` + `CsrfGuard` | Rotate refresh (cookie) |
| `POST` | `/auth/logout` | `@Public` + `CsrfGuard` | Clear cookies (always 200) |
| `POST` | `/auth/logout-all` | `Bearer` | Revoke all sessions |
| `POST` | `/auth/change-password` | `Bearer` | Change + revoke all |
| `POST` | `/auth/verify-email` | — | 6-digit code |
| `POST` | `/auth/resend-verification` | — | Generic |
| `POST` | `/auth/forgot-password` | — | Generic, sends reset link |
| `POST` | `/auth/reset-password` | — | Consumes raw token |
| `GET` | `/user/me` | `Bearer` | `PublicUser` (`@workspace/schema`) |
| `PATCH` | `/user/me` | `Bearer` | Update profile |
| `POST` | `/user/onboarding` | `Bearer` | Set `fullName` once (verified only) |
| `GET` | `/health` | — | Health check |
| `GET` | `/docs` | — | Swagger (if enabled) |

---

## Adding Components (shadcn/ui)

From the repo root, targeting any app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
pnpm dlx shadcn@latest add button -c apps/admin
pnpm dlx shadcn@latest add dialog -c apps/admin
```

Components are placed in `packages/ui/src/components` and imported as:

```tsx
import { Button } from "@workspace/ui/components/button";
```

Regenerate icons after changes:

```bash
pnpm icons:generate
```

---

## Tooling

- **Turborepo** (`turbo.json:4`) — `build` depends on `^build`, `dev` persistent, `icons:generate` no cache.
- **Biome** (`biome.json:29` — `formatter.enabled`, `lineWidth:100`, `indentWidth:2`, `quoteStyle:double`, `semicolons:asNeeded`, `css.tailwindDirectives:true`) — single formatter/linter for `*.{ts,tsx,js,jsx,json,jsonc,css}`; `lint-staged` runs `biome check --write --no-errors-on-unmatched`.
- **Husky** (`.husky/pre-commit`, `pre-push`) — `pre-commit: pnpm typecheck && lint-staged`, `pre-push: pnpm build`.
- **TypeScript** strict, bundler resolution, paths `#/*` → `src/*`.

---

## Useful Paths

- `apps/server/prisma/schema.prisma` — DB models
- `apps/server/src/config/configuration.ts` / `env.validation.ts` — env schema
- `apps/server/src/common/guards/jwt-auth.guard.ts` / `csrf.guard.ts` — security
- `apps/admin/src/lib/session.ts` / `api-client.ts` / `config/endpoints.ts` — client auth
- `packages/schema/src/schemas/common.ts` — shared zod
- `packages/ui/src/styles/globals.css` — Tailwind + design tokens

---

## License

Private template — add your license before publishing.
