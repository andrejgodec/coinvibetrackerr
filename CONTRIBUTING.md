# Contributing to CoinVibeTracker

Pull requests are welcome on both branches. This doc covers setup, workflow, and conventions.

---

## Two Branches

| Branch | Edition | Notes |
|--------|---------|-------|
| `main` | Full Edition | SSR + Supabase + Podman. Requires `.env.local`. |
| `pages` | Lightweight Edition | Static export for GitHub Pages. No backend needed. |

Keep them in sync for shared changes (components, types, styles). Branch-specific code lives in `src/lib/api/coingecko.ts` (Full) vs `src/lib/api/coingecko-client.ts` (Lightweight).

---

## Local Setup — Full Edition (`main`)

```bash
git clone https://github.com/andrejgodec/coinvibetrackerr
cd coinvibetrackerr
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Requires a free [Supabase](https://supabase.com) project. See README for env var details.

## Local Setup — Lightweight Edition (`pages`)

```bash
git clone -b pages https://github.com/andrejgodec/coinvibetrackerr
cd coinvibetrackerr
npm install
npm run dev
```

No config needed. Open http://localhost:3000.

---

## Development Commands

```bash
npm run dev      # dev server at :3000
npm run build    # production build (static export on pages branch)
npm run lint     # ESLint
npm test         # Vitest unit tests
```

---

## Making Changes

1. Fork the repo and create a branch from `main` (or `pages` for Lightweight-only changes)
2. Make your changes — see [docs/VIBE_CODING.md](docs/VIBE_CODING.md) if you're using AI assistance
3. Run `npm run lint` and `npm test` — both must pass
4. Open a PR against the appropriate branch with a clear description of what and why

### Shared component changes

If you modify a component used by both editions (`CoinTable`, `SearchBar`, `MarketSummary`, etc.), test it on both branches before submitting.

### New features

For non-trivial features, open an issue first to discuss scope. The [Roadmap](README.md#roadmap) lists planned work — pick something from there or propose your own.

---

## Code Style

- TypeScript strict mode — no `any` unless unavoidable and commented
- Tailwind CSS v4 for styling — no inline styles
- Server components by default; add `'use client'` only when needed
- No placeholder code, no TODOs in PRs

---

## Agent-Driven Contributions

Every feature in this repo was implemented using an AI agent brief. If you use Claude Code or another AI assistant, write a brief in `docs/agents/` following the existing format and include it in your PR. See [docs/VIBE_CODING.md](docs/VIBE_CODING.md) for the full guide.

---

## License

By contributing you agree your code is released under the [MIT License](LICENSE).
