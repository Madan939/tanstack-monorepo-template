# syntax=docker/dockerfile:1
# Build from the monorepo root:
#   docker build -f apps/server/Dockerfile .
# Or via compose in this directory:
#   docker compose up --build

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    COREPACK_DEFAULT_TO_LATEST="0"
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
WORKDIR /app

# ---- deps: full workspace install so `pnpm --filter server` resolves ----
FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/server/package.json apps/server/package.json
RUN pnpm install --frozen-lockfile --filter server...

# ---- builder: generate prisma client + nest build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY . .
# build script = `prisma generate && nest build`
RUN pnpm --filter server build

# ---- runner: prod deps + compiled dist, migrate on start ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=5000
# Prisma CLI is a devDependency, so install it globally for
# `prisma generate` (build) and `prisma migrate deploy` (container start).
# Pinned to the version in apps/server/package.json.
RUN npm install -g prisma@6.19.3
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/server/package.json apps/server/package.json
RUN pnpm install --frozen-lockfile --filter server --prod --ignore-scripts \
    && pnpm --filter server rebuild argon2 \
    && pnpm store prune
COPY --from=builder --chown=node:node /app/apps/server/dist ./apps/server/dist
COPY --chown=node:node apps/server/prisma ./apps/server/prisma
RUN prisma generate --schema apps/server/prisma/schema.prisma
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["sh", "-c", "prisma migrate deploy --schema apps/server/prisma/schema.prisma && node apps/server/dist/main.js"]
