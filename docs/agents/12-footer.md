# Agent: Footer — Documentation, Resources & Legal

## Goal

Add a site-wide footer to CoinVibeTracker with three sections: Documentation links,
Resources (data sources), and Legal (copyright, disclaimer, license). The footer
must match the existing dark-mode zinc theme and appear on every page via the root layout.

## Prerequisites

- Agents 1–7 complete (layout and NavBar exist)

## Deliverables

| File | Change |
|------|--------|
| `src/components/Footer.tsx` | New server component — three-column footer |
| `src/app/layout.tsx` | Add `<Footer />` after `{children}` inside `<body>` |

---

## `src/components/Footer.tsx` spec

Server component (no `'use client'`). Three columns on md+, stacked on mobile.

### Columns

**Documentation**
- GitHub Repository → `https://github.com/andrejgodec/coinvibetrackerr`
- Contributing Guide → `https://github.com/andrejgodec/coinvibetrackerr/blob/main/CONTRIBUTING.md`
- Vibe Coding Guide → `https://github.com/andrejgodec/coinvibetrackerr/blob/main/docs/VIBE_CODING.md`
- Agent Briefs → `https://github.com/andrejgodec/coinvibetrackerr/tree/main/docs/agents`

**Resources**
- CoinGecko API → `https://www.coingecko.com/api/documentation`
- Binance API → `https://binance-docs.github.io/apidocs/spot/en/`
- Next.js Docs → `https://nextjs.org/docs`
- Supabase Docs → `https://supabase.com/docs`

**Legal**
- Copyright line: `© {currentYear} CoinVibeTracker — MIT License`
- MIT License link → `https://github.com/andrejgodec/coinvibetrackerr/blob/main/LICENSE`
- Disclaimer text (inline, not a link):
  > "Data is provided for informational purposes only and does not constitute
  > financial advice. Cryptocurrency prices are volatile — always do your own research."

### Styling

Match NavBar: `bg-zinc-950 border-t border-zinc-800`. Use `text-zinc-400` for body
text, `text-zinc-300 hover:text-white transition-colors` for links. Column headers
in `text-zinc-100 text-xs font-semibold uppercase tracking-wider`.

Footer bottom strip (below the three columns, separated by a `border-t border-zinc-800`):
- Left: copyright line
- Right: "Open source · MIT License" with link

### Layout

```tsx
<footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
  <div className="mx-auto max-w-7xl px-4 py-10">
    {/* three column grid */}
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Documentation column */}
      {/* Resources column */}
      {/* Legal column */}
    </div>
    {/* bottom strip */}
    <div className="mt-8 border-t border-zinc-800 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500">
        © {year} CoinVibeTracker. MIT License.
      </p>
      <p className="text-xs text-zinc-500">
        Open source —{' '}
        <a href="https://github.com/andrejgodec/coinvibetrackerr"
           className="hover:text-zinc-300 transition-colors" target="_blank" rel="noopener noreferrer">
          github.com/andrejgodec/coinvibetrackerr
        </a>
      </p>
    </div>
  </div>
</footer>
```

Get `year` via `new Date().getFullYear()` — computed at render time (server component,
so it's correct at request time without client JS).

All external links: `target="_blank" rel="noopener noreferrer"`.

---

## `src/app/layout.tsx` change

```tsx
import { Footer } from "@/components/Footer";

// inside <body>:
<body className="min-h-full flex flex-col">
  <NavBar />
  {children}
  <Footer />
</body>
```

The `flex flex-col` + `mt-auto` on the footer ensures it sticks to the bottom on
short pages without `position: fixed`.

---

## Acceptance Criteria

- [ ] Footer renders on `/` (dashboard) and `/coin/[id]` pages
- [ ] Three columns visible on desktop (≥768px), stacked on mobile
- [ ] All links open in a new tab with `rel="noopener noreferrer"`
- [ ] Disclaimer text is visible and not a hyperlink
- [ ] Copyright year is current (not hardcoded)
- [ ] Styling matches NavBar dark theme (zinc-950 background, zinc-800 borders)
- [ ] `npm run build` passes
- [ ] No TypeScript errors
