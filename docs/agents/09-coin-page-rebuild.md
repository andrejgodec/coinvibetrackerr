# Agent: Coin Detail Page — Full Rebuild

## Goal

Fix the 404 on `/coin/bitcoin`, implement real CoinGecko API calls, and build a full-featured coin detail page matching the spec in `docs/decisions/coin-page-spec.md`.

## Root cause of 404

`getCoinDetail` and `getCoinHistory` stubs throw "Not implemented" → `notFound()` is called in `src/app/coin/[id]/page.tsx`. Fix by implementing the real API calls.

## Implementation order

1. Extend TypeScript types
2. Implement real API functions
3. Add news API client
4. Rebuild coin detail components
5. Verify build passes
