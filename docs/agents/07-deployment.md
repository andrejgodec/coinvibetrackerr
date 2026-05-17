# Agent: Deployment — Vercel + CI

## Goal

Deploy the app to Vercel with environment variables, set up GitHub Actions CI, and verify production build is healthy.

## Prerequisites

- `npm run build` passes locally
- All env vars documented in `.env.example`
- Supabase project live

## Steps

### 1. Vercel Setup

1. `vercel link` — connect to Vercel project
2. Add all env vars from `.env.example` via Vercel dashboard or `vercel env add`
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as production vars
4. First deploy: `vercel --prod`
5. Verify: dashboard loads top 100 coins, coin detail page works, no console errors

### 2. GitHub Actions CI (`.github/workflows/ci.yml`)

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
      COINGECKO_API_KEY: ${{ secrets.COINGECKO_API_KEY }}
      CRYPTOCOMPARE_API_KEY: ${{ secrets.CRYPTOCOMPARE_API_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### 3. Post-Deploy Checks

- [ ] Dashboard loads in < 3s (measured from Vercel edge)
- [ ] `/coin/bitcoin` returns 200
- [ ] API route `/api/coins` returns valid JSON (if applicable)
- [ ] No 500 errors in Vercel logs for first 10 minutes
- [ ] Supabase coin_cache table is being written to

## Acceptance Criteria

- Production URL is live and publicly accessible
- CI passes on `main` branch push
- All environment variables set — no `undefined` values in production logs
- Vercel analytics (Core Web Vitals) enabled
