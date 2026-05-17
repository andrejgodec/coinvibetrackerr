# Agent: Deployment — Podman Container

## Goal

Containerize the Next.js app with Podman using a multi-stage build. The container must run locally with `podman run` and be production-ready (non-root user, minimal image, env vars via `-e` flags).

## Prerequisites

- `npm run build` passes locally
- Podman installed (`podman --version`)

## Steps

### 1. Enable Next.js standalone output

In `next.config.ts`, add `output: 'standalone'` to the Next.js config:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // keep existing patterns
    ],
  },
}

export default nextConfig
```

This tells Next.js to bundle only the files needed to run the server, making the image much smaller.

### 2. Create `Containerfile`

Use the official Node.js 20 Alpine image. Multi-stage: deps → builder → runner.

```dockerfile
# Stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for public env vars (injected at build time)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Stage 3: minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### 3. Create `.containerignore` (same as .dockerignore)

```
node_modules
.next
.git
.env.local
*.md
docs/
```

### 4. Create `podman-run.sh` helper script

```bash
#!/usr/bin/env bash
set -euo pipefail

IMAGE="coinvibetracker:latest"

echo "Building image..."
podman build -t "$IMAGE" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
  .

echo "Starting container..."
podman run --rm -it \
  -p 3000:3000 \
  -e COINGECKO_API_KEY="${COINGECKO_API_KEY:-}" \
  -e NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
  -e SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}" \
  "$IMAGE"
```

Make it executable: `chmod +x podman-run.sh`

### 5. Build and verify

```bash
podman build -t coinvibetracker:latest .
podman run --rm -p 3000:3000 \
  -e COINGECKO_API_KEY="" \
  -e NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder" \
  coinvibetracker:latest
```

Verify: `curl http://localhost:3000` returns HTTP 200.

### 6. GitHub Actions CI (`.github/workflows/ci.yml`)

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test

    env:
      NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder

  container:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Build container image
        run: |
          podman build -t coinvibetracker:${{ github.sha }} \
            --build-arg NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder \
            .

      - name: Smoke test container
        run: |
          podman run -d --name test-app -p 3000:3000 \
            -e NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
            -e NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder \
            coinvibetracker:${{ github.sha }}
          sleep 5
          curl --fail http://localhost:3000 || (podman logs test-app && exit 1)
          podman stop test-app
```

## Acceptance Criteria

- `Containerfile` exists at project root and builds without error
- `.containerignore` exists
- `podman-run.sh` exists and is executable
- `output: 'standalone'` set in `next.config.ts`
- Container starts and `curl http://localhost:3000` returns 200
- Container runs as non-root user (`nextjs`, uid 1001)
- Image size is under 300MB (`podman image inspect coinvibetracker:latest`)
- `.github/workflows/ci.yml` includes both `build` and `container` jobs
