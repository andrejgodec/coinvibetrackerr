#!/usr/bin/env bash
# Patches the repo tree in-place for a static GitHub Pages export, then builds.
# Runs inside CI — changes are throwaway. Never run this locally unless you
# intend to revert the edits afterwards.
set -euo pipefail

# ── next.config.ts ──────────────────────────────────────────────────────────
cp next.config.export.ts next.config.ts

# ── Page files ───────────────────────────────────────────────────────────────
cp src/app/page.export.tsx src/app/page.tsx
cp "src/app/coin/[id]/page.export.tsx" "src/app/coin/[id]/page.tsx"

# ── Components with full replacements ────────────────────────────────────────
cp src/components/ApiKeyModal.export.tsx src/components/ApiKeyModal.tsx

# ── CoinTable: swap server action → client API, add event dispatches ─────────
sed -i \
  "s|import { fetchTopCoinsAction } from '@/app/actions'|import { clientGetTopCoins } from '@/lib/api/coingecko-client'|" \
  src/components/CoinTable.tsx

sed -i "s/fetchTopCoinsAction()/clientGetTopCoins()/g" src/components/CoinTable.tsx

# Append the custom-event dispatch on the line after each localStorage.setItem for coins cache
sed -i \
  "/localStorage\.setItem(COINS_CACHE_KEY/a\\        window.dispatchEvent(new CustomEvent('cvt:coins-updated', { detail: fresh }))" \
  src/components/CoinTable.tsx

# ── SearchBar: swap server action → client API ───────────────────────────────
sed -i \
  "s|import { searchCoinsAction } from '@/app/actions'|import { clientSearchCoins } from '@/lib/api/coingecko-client'|" \
  src/components/SearchBar.tsx

sed -i "s/await searchCoinsAction(q)/await clientSearchCoins(q)/" src/components/SearchBar.tsx

# ── ChartSection: swap server action → client API ────────────────────────────
sed -i \
  "s|import { fetchCoinHistoryAction } from '@/app/actions'|import { clientGetCoinHistory } from '@/lib/api/coingecko-client'|" \
  src/components/ChartSection.tsx

sed -i \
  "s/await fetchCoinHistoryAction(coinId, newRange)/await clientGetCoinHistory(coinId, newRange)/" \
  src/components/ChartSection.tsx

# ── Build ────────────────────────────────────────────────────────────────────
npm run build
