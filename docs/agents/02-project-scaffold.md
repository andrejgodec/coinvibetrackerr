# Agent: Project Scaffold

## Goal

Initialize the Next.js 15 project with TypeScript, Tailwind v4, shadcn/ui, Supabase client, and folder structure matching the README. No features — only the skeleton compiles and runs.

## Prerequisites

- Data source decision doc exists (`docs/decisions/data-sources.md`)
- Node.js 20+, npm available

## Steps

1. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` in project root
2. Install dependencies:
   - `@supabase/supabase-js`
   - `recharts` (or `lightweight-charts` — defer to data source decision)
   - `zod` (runtime validation of API responses)
   - `playwright` (scraper, dev dependency only initially)
3. Initialize shadcn/ui: `npx shadcn@latest init`
4. Create folder structure under `src/`:
   - `lib/api/coingecko.ts` — empty client stub with type stubs
   - `lib/api/cryptocompare.ts` — empty client stub
   - `lib/scraper/coincodex.ts` — empty stub
   - `lib/db/client.ts` — Supabase client init
   - `types/coin.ts` — shared `Coin`, `OHLCVPoint`, `MarketData` interfaces
5. Create `.env.example` with all required vars (see README)
6. Verify: `npm run build` passes with zero errors

## Deliverable

- Working Next.js app at `http://localhost:3000` (just the default page)
- All stubs in place with correct TypeScript signatures
- `npm run build` exits 0
- `.env.example` committed

## Do NOT

- Implement any real API calls
- Add any UI beyond the Next.js default
- Set up Supabase tables (that's a separate agent)
