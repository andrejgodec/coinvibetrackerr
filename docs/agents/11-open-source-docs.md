# Agent: Open-Source Documentation

## Goal

Write all GitHub-facing documentation that makes CoinVibeTracker welcoming to crypto enthusiasts who want to contribute via vibe coding (AI-assisted development with Claude Code or similar tools). No code changes — documentation only.

## Prerequisites

- The app builds (`npm run build` passes)
- Agents 1–7 complete (feature set is stable enough to document)

## Deliverables

| File | Purpose |
|------|---------|
| `README.md` | Full rewrite — project purpose, live demo, screenshots, quick start, env vars, tech stack |
| `CONTRIBUTING.md` | How to contribute: fork, run locally, open a PR, use Claude Code |
| `docs/VIBE_CODING.md` | Guide for AI-assisted contribution — Claude Code workflow, agent briefs, tips |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Structured bug report template |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Feature request template |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR checklist template |
| `.github/FUNDING.yml` | Optional: GitHub Sponsors / Buy Me a Coffee link (leave placeholder) |

---

## 1. `README.md` — Full Rewrite

Replace the current placeholder README with a production-quality document. Target audience: crypto enthusiast who just discovered the repo on GitHub and wants to run it or contribute.

### Structure

```markdown
# CoinVibeTracker

> Real-time crypto dashboard built with Next.js 15, Supabase, and CoinGecko.
> Track prices, charts, and market data for thousands of coins — no account required.

[screenshot or demo GIF — add path: public/screenshot.png]

## Features
- Live price table for top 100 coins (auto-refreshes every 30s)
- Historical charts: 1D / 7D / 30D / 1Y (TradingView Lightweight Charts)
- Coin detail pages: price, market cap, volume, supply, description
- Search and filter across the full coin list
- Optional CoinGecko API key — paste it in the UI settings to lift rate limits
- Offline fallback: stale Supabase cache + Binance spot prices when CoinGecko is unavailable
- Dark-mode-first, mobile-responsive

## Quick Start

### Option A — Run with Podman (recommended)
[podman run instructions from agent 07]

### Option B — Run locally

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/coinvibetrackerr
cd coinvibetrackerr
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
\`\`\`

Open http://localhost:3000

## Environment Variables

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | supabase.com → project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | supabase.com → project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server-side writes) | supabase.com → project settings |
| `COINGECKO_API_KEY` | No | coingecko.com/api (free Demo key) |

No CoinGecko key? The app works on the anonymous free tier (30 req/min). Enter your key
in the settings panel (gear icon in the nav) to remove rate limits without redeploying.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 App Router + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Lightweight Charts (TradingView) |
| Backend | Next.js Server Actions |
| Database / Cache | Supabase (PostgreSQL) |
| Data | CoinGecko API + Binance fallback |
| Container | Podman (multi-stage, non-root) |
| CI | GitHub Actions |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). If you use Claude Code, also read
[docs/VIBE_CODING.md](docs/VIBE_CODING.md) — it explains how this project was built
with AI agents and how to continue that workflow.

## License

MIT
```

---

## 2. `CONTRIBUTING.md`

```markdown
# Contributing to CoinVibeTracker

Thanks for your interest. This is an open-source project built by crypto enthusiasts
for crypto enthusiasts — contributions of any size are welcome.

## What We Want

- Bug fixes
- New coin data fields (social links, exchanges, tokenomics)
- UI improvements (better charts, mobile layout, accessibility)
- Additional data sources (CoinMarketCap, Messari, DeFiLlama)
- Performance improvements (caching, bundle size)

## What We Don't Want (right now)

- Blockchain integrations (wallet connect, on-chain data)
- User accounts / authentication
- Paid API dependencies added without an opt-in env var

If you're unsure, open an issue first and describe what you'd like to add.

## Setup

1. Fork the repo and clone it
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in Supabase credentials
   (see README for where to get them — free Supabase project takes 2 minutes to create)
4. `npm run dev` — app is at http://localhost:3000

No CoinGecko API key is required to run locally. The anonymous free tier is enough
for development.

## Making Changes

- Run `npm run lint` before opening a PR
- Run `npm test` — tests live in `src/lib/api/__tests__/`
- One concern per PR. Two unrelated fixes → two PRs.
- Match the existing code style. No new abstractions unless the PR description
  explains why the complexity is worth it.

## Opening a Pull Request

Use the PR template. Fill in every section — especially "How I tested this".
PRs without a test plan take much longer to review.

## Using AI Tools

This project was built with Claude Code (Anthropic's CLI). You are welcome and
encouraged to use AI tools to contribute. See [docs/VIBE_CODING.md](docs/VIBE_CODING.md)
for tips on how to work with the existing agent briefs.

## Code of Conduct

Be direct and technical. No personal attacks. Disagree on ideas, not people.
```

---

## 3. `docs/VIBE_CODING.md`

```markdown
# Vibe Coding with CoinVibeTracker

This project was built using Claude Code — Anthropic's CLI that runs Claude directly
in your terminal. Every major feature has a corresponding agent brief in `docs/agents/`.

## What Is Vibe Coding?

Vibe coding means using an AI coding assistant to move fast: describe what you want,
review the output, iterate. You stay in control of the architecture and acceptance
criteria; the AI handles the boilerplate and first drafts.

## How This Project Uses Agent Briefs

`docs/agents/` contains numbered task files. Each file is a self-contained brief that
you can paste into Claude Code as your task. The brief specifies:

- **Goal** — what the feature does
- **Prerequisites** — which other agents must run first
- **Exact deliverables** — every file to create or modify, with function signatures
- **Acceptance criteria** — a checklist you verify before calling the task done

This means you can pick up any agent brief, paste it into a fresh Claude Code session,
and get working code without needing context from previous sessions.

## Getting Started with Claude Code

\`\`\`bash
npm install -g @anthropic/claude-code
claude
\`\`\`

You'll need an Anthropic account (free tier available at console.anthropic.com).

## Workflow for Contributing a New Feature

1. Read the existing agent briefs to understand what's already been built
2. Open a GitHub issue describing the feature
3. Create a new agent brief in `docs/agents/` following the existing format
   - Number it sequentially (e.g. `12-your-feature.md`)
   - List exact files to create/modify
   - Write acceptance criteria you can check manually
4. Paste the brief into Claude Code and work through it
5. Verify every acceptance criterion before opening a PR
6. Include the agent brief in your PR so reviewers can see the intent

## Tips

- **Start fresh sessions for each agent** — Claude Code works best with a focused
  context. `/clear` between agents.
- **Read before writing** — ask Claude to read the relevant existing files before
  making changes. It avoids drift from the existing patterns.
- **Acceptance criteria are your contract** — write them before you start, not after.
  They define "done".
- **Commit often** — AI-generated code changes fast. Small commits make it easy to
  revert a direction that went wrong.
- **Review diffs** — always read the diff before committing. AI tools occasionally
  add unrequested changes (imports, formatting, unrelated refactors).

## Current Agent Status

See [docs/agents/README.md](agents/README.md) for which agents are complete and which
are open for contribution.
```

---

## 4. `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug report
about: Something is broken
labels: bug
---

**What happened?**
A clear description of the bug.

**Steps to reproduce**
1.
2.
3.

**Expected behavior**
What should have happened.

**Environment**
- Browser:
- OS:
- Node version (if running locally):
- CoinGecko API key in use: yes / no

**Console errors**
Paste any errors from the browser console or terminal.
```

---

## 5. `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature request
about: Suggest a new feature or improvement
labels: enhancement
---

**What do you want to add or change?**
A clear description of the feature.

**Why?**
What problem does this solve? Who benefits?

**Rough spec**
What should the UI look like? What data is needed? Any API dependencies?

**Are you willing to implement this?**
- [ ] Yes, I'll open a PR
- [ ] No, just suggesting
```

---

## 6. `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## What does this PR do?

<!-- One sentence summary -->

## Why?

<!-- Link to issue, or explain the motivation -->

## How I tested this

<!-- Be specific: "opened coin detail page, verified chart loaded" is better than "tested" -->

- [ ]
- [ ]

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] No new console errors or warnings
- [ ] Mobile layout checked (Chrome DevTools responsive mode)
```

---

## 7. `.github/FUNDING.yml`

```yaml
# GitHub Sponsors / funding links
# Uncomment and fill in when ready
# github: [YOUR_GITHUB_USERNAME]
# ko_fi: YOUR_KO_FI_USERNAME
# open_collective: YOUR_OC_SLUG
```

---

## 8. `.env.example`

Create this file if it does not exist (it is referenced in the README quick-start):

```
# Supabase — create a free project at supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CoinGecko — optional, raises rate limit from 30 to 500 req/min
# Get a free Demo key at https://www.coingecko.com/api
COINGECKO_API_KEY=
```

---

## Acceptance Criteria

- [ ] `README.md` has Features, Quick Start, Environment Variables, Tech Stack, Contributing, License sections
- [ ] `README.md` references `.env.example` in the quick-start
- [ ] `CONTRIBUTING.md` exists with Setup, Making Changes, PR instructions
- [ ] `docs/VIBE_CODING.md` explains agent briefs and Claude Code workflow
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` exist
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` exists with checklist
- [ ] `.github/FUNDING.yml` exists (placeholder comments only)
- [ ] `.env.example` exists at project root
- [ ] No broken relative links in any markdown file
- [ ] `npm run build` still passes (documentation-only change, should not affect build)
